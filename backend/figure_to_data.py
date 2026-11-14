"""ARES - converte FIGURAS de mapas globais (imagem colorida + barra de cores) em dados aproximados.

Usado quando a fonte só existe como imagem (ex.: mapas minerais do TES que vieram como figura,
sem o arquivo de dados). A ideia:

  1. Acha o retângulo do mapa na figura (mapa global equiretangular: 360° x 180°, proporção 2:1).
  2. Lê a barra de cores da própria figura e monta a tabela cor -> valor.
  3. Converte cada pixel do mapa pelo MATIZ (hue) da cor. O matiz quase não muda com o sombreamento
     do relevo que essas figuras trazem por baixo, então a leitura fica estável.
  4. Pixels cinzas (relevo sem dado) viram NaN.
  5. Devolve um GeoTIFF em memória, com coordenadas, que o dem_processor lê igual ao MOLA e ao SWIM.

LIMITAÇÕES (aparecem no campo "confiança" do site):
  - É uma ESTIMATIVA: erro de leitura de até ~3% da escala (medido na própria barra de cores).
  - Posição com incerteza de ~0,25-0,5° (borda do mapa detectada na imagem, 1 pixel ~ 0,25°).
  - Só vale para figuras em projeção equiretangular global.

Uso direto (imprime a estimativa da área de estudo):
    python figure_to_data.py dados/tes/surface_dust_4_ppd_mola_label.tif --vmax 1
    python figure_to_data.py rochas
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

MARS_LONGLAT = "+proj=longlat +a=3396190 +b=3396190 +no_defs"


# ------------------------------------------------------------------ cor -> valor
def hue_sat_val(rgb: np.ndarray):
    """Matiz (0-360°), saturação e brilho (0-1) de uma imagem RGB (0-255)."""
    rgb = np.asarray(rgb, dtype="float64") / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = (mx == r) & m
    gg = (mx == g) & m & ~rr
    bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6
    h[gg] = (b - r)[gg] / d[gg] + 2
    h[bb] = (r - g)[bb] / d[bb] + 4
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0.0)
    return h * 60.0, s, mx


class HueLUT:
    """Tabela matiz -> valor (0 a 1) para paletas tipo "arco-íris" (azul/roxo -> vermelho)."""

    def __init__(self, colors_rgb: np.ndarray):
        h, _, _ = hue_sat_val(np.asarray(colors_rgb)[None, :, :])
        h = np.where(h[0] > 300, h[0] - 360, h[0])      # vermelho perto de 360° vira negativo
        self.hue = np.minimum.accumulate(h)              # matiz cai do começo ao fim da barra
        self.pos = np.linspace(0.0, 1.0, len(self.hue))

    def __call__(self, rgb: np.ndarray, min_sat=0.25, min_val=0.12) -> np.ndarray:
        h, s, v = hue_sat_val(rgb)
        h = np.where(h > 300, h - 360, h)
        out = np.interp(-h, -self.hue, self.pos)         # np.interp pede eixo crescente
        return np.where((s < min_sat) | (v < min_val), np.nan, out)

    @classmethod
    def from_matplotlib(cls, name: str, n: int = 256):
        from matplotlib import colormaps
        return cls(colormaps[name](np.linspace(0, 1, n))[:, :3] * 255)


# ------------------------------------------------------------------ geometria da figura
def _longest_run(mask: np.ndarray, gap: int = 4):
    idx = np.flatnonzero(mask)
    if idx.size == 0:
        raise ValueError("nada encontrado na figura")
    best, start, prev = (idx[0], idx[0]), idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > gap:
            if prev - start > best[1] - best[0]:
                best = (start, prev)
            start = i
        prev = i
    if prev - start > best[1] - best[0]:
        best = (start, prev)
    return int(best[0]), int(best[1])


def find_map_frame(rgb: np.ndarray):
    """(x0, x1, y0, y1) do mapa: a maior região não branca. Confere a proporção 2:1."""
    nonwhite = rgb.min(-1) < 240
    x0, x1 = _longest_run(nonwhite.mean(0) > 0.5)
    y0, y1 = _longest_run(nonwhite[:, x0:x1].mean(1) > 0.9)
    ratio = (x1 - x0 + 1) / (y1 - y0 + 1)
    if not 1.9 < ratio < 2.1:
        raise ValueError(f"o mapa achado não tem proporção 2:1 (deu {ratio:.2f}); figura não é equiretangular global?")
    return x0, x1, y0, y1


def read_colorbar(rgb: np.ndarray, below_y: int) -> np.ndarray:
    """Cores da barra (da esquerda = mínimo para a direita = máximo), abaixo do mapa."""
    sub = rgb[below_y:]
    h, s, v = hue_sat_val(sub)
    colorful = (s > 0.35) & (v > 0.2)
    y0, y1 = _longest_run(colorful.mean(1) > 0.15, gap=1)
    x0, x1 = _longest_run(colorful[y0:y1 + 1].mean(0) > 0.5, gap=3)
    bar = sub[y0 + 3:y1 - 2, x0 + 4:x1 - 3].astype("float64")
    cols = []
    for c in range(bar.shape[1]):
        col = bar[:, c]
        bright = col.sum(1)
        cols.append(np.median(col[bright >= np.percentile(bright, 40)], 0))   # ignora as linhas da hachura
    return np.array(cols)


# ------------------------------------------------------------------ figura -> GeoTIFF em memória
def figure_to_array(path, vmin: float, vmax: float, lut: HueLUT | None = None):
    """Valores (vmin..vmax) do mapa global da figura + o transform geográfico (lon -180..180)."""
    from rasterio.transform import from_origin
    rgb = np.asarray(Image.open(path).convert("RGB"))
    x0, x1, y0, y1 = find_map_frame(rgb)
    if lut is None:
        lut = HueLUT(read_colorbar(rgb, y1 + 5))
    data = vmin + lut(rgb[y0:y1 + 1, x0:x1 + 1]) * (vmax - vmin)
    h, w = data.shape
    return data.astype("float32"), from_origin(-180.0, 90.0, 360.0 / w, 180.0 / h)


def image_to_array(path, vmin: float, vmax: float, lut: HueLUT):
    """Para imagens que SÃO o mapa inteiro (sem moldura nem barra), centradas em 0° de longitude."""
    from rasterio.transform import from_origin
    rgb = np.asarray(Image.open(path).convert("RGB"))
    data = vmin + lut(rgb) * (vmax - vmin)
    h, w = data.shape
    return data.astype("float32"), from_origin(-180.0, 90.0, 360.0 / w, 180.0 / h)


def to_memory_geotiff(data: np.ndarray, transform):
    """GeoTIFF em memória; devolve (memfile, caminho) para o rasterio.open/dem_processor ler."""
    from rasterio.crs import CRS
    from rasterio.io import MemoryFile
    mem = MemoryFile()
    with mem.open(driver="GTiff", height=data.shape[0], width=data.shape[1], count=1, dtype="float32",
                  crs=CRS.from_proj4(MARS_LONGLAT), transform=transform, nodata=np.nan) as dst:
        dst.write(data, 1)
    return mem, mem.name


# ------------------------------------------------------------------ uso direto
def _area_summary(data, transform, lat0=39.3, lat1=41.25, lon0=200.8, lon1=203.85):
    to180 = lambda lon: lon - 360 if lon > 180 else lon
    col = lambda lon: int((to180(lon) + 180) / transform.a)
    row = lambda lat: int((90 - lat) / -transform.e)
    blk = data[row(lat1):row(lat0) + 1, col(lon0):col(lon1) + 1]
    return blk, np.nanpercentile(data, [10, 50, 90])


if __name__ == "__main__":
    here = Path(__file__).resolve().parent
    ap = argparse.ArgumentParser(description="Estimativa, na área de estudo, a partir de uma figura de mapa global.")
    ap.add_argument("figura", help="caminho da figura, ou 'rochas' para a figura de abundância de rochas")
    ap.add_argument("--vmin", type=float, default=0.0)
    ap.add_argument("--vmax", type=float, default=1.0)
    a = ap.parse_args()
    if a.figura == "rochas":
        # Sem barra de cores: paleta "jet" e escala relativa 0-1 (posição na barra, não %)
        d, t = image_to_array(here / "dados" / "rochas" / "abundancia_rochas_figura.jpeg", 0, 1, HueLUT.from_matplotlib("jet"))
    else:
        d, t = figure_to_array(a.figura, a.vmin, a.vmax)
    blk, glob = _area_summary(d, t)
    valid = d[np.isfinite(d)]
    med = float(np.nanmedian(blk))
    print("valores na área de estudo:\n", np.round(blk, 3))
    print(f"mediana na área: {med:.3f}   (mín {np.nanmin(blk):.3f}, máx {np.nanmax(blk):.3f})")
    print(f"planeta: p10 {glob[0]:.3f}  p50 {glob[1]:.3f}  p90 {glob[2]:.3f}")
    print(f"a mediana da área supera {100 * (valid < med).mean():.0f}% dos pixels do planeta")
