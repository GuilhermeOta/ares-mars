#!/usr/bin/env python3
"""ARES - exporta as camadas do relevo para o mapa 2D do site.

Lê as grades que o main.py salva em outputs/npy/ e gera, em public/data/layers/:
  - <id>.png        imagem da camada, já alinhada com o mapa do site (Leaflet / Mercator)
  - <id>.bin        os valores numéricos, para o painel mostrar "elevação aqui: -3.897 m"
  - manifest.json   a lista de camadas que o site lê (com legenda e fonte)

Uso (dentro da pasta backend/):
    python export_layers.py                      # lê outputs/npy, resolução 200 m
    python export_layers.py --npy outputs/npy --res 200

Requisitos: numpy, matplotlib (já estão no requirements.txt).
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np
from matplotlib import colormaps
from matplotlib.colors import LightSource
from PIL import Image

import dem_processor as dp

HERE = Path(__file__).resolve().parent
DEFAULT_OUT = HERE.parent / "public" / "data" / "layers"

# Bits de causa dos obstáculos (iguais aos de obstacle_detection.py)
OBSTACLE_BITS = {1: "sem dados", 2: "declividade", 4: "rugosidade extrema", 8: "depressão fechada",
                 16: "textura (CTX)", 32: "margem de segurança"}

MOLA_SOURCE = {
    "instrument": "MOLA",
    "mission": "Mars Global Surveyor",
    "product": "Mars_MGS_MOLA_DEM_mosaic_global_463m (USGS)",
    "date": "Medições de 1997 a 2001",
    "resolution_m": 463,
}


# ---------------------------------------------------------------- geometria
def grid_bounds(res: float):
    """Limites EXATOS da grade do Saulo: [[lat_sul, lon_oeste], [lat_norte, lon_leste]]."""
    spec = dp.GridSpec.from_aoi(dp.aoi_from_pois(dp.POIS, 0.5), res)
    lon_l, lon_r, lat_b, lat_t = spec.extent_lonlat()
    return spec, [[lat_b, lon_l], [lat_t, lon_r]]


def to_mercator_rows(arr: np.ndarray, lat_b: float, lat_t: float, nearest: bool) -> np.ndarray:
    """A grade é linear em latitude; o Leaflet desenha em Mercator. Reamostra as linhas
    para a imagem cair exatamente no lugar (sem isso, até ~2 pixels de erro)."""
    h = arr.shape[0]
    merc = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    mt, mb = merc(lat_t), merc(lat_b)
    out_rows = np.arange(h) + 0.5
    m = mt - (mt - mb) * out_rows / h                          # Mercator de cada linha de saída
    lat = np.degrees(2 * np.arctan(np.exp(m)) - math.pi / 2)  # de volta para latitude
    src = (lat_t - lat) / (lat_t - lat_b) * h - 0.5            # linha correspondente na grade original
    if nearest:
        return arr[np.clip(np.round(src).astype(int), 0, h - 1)]
    i0 = np.clip(np.floor(src).astype(int), 0, h - 1)
    i1 = np.clip(i0 + 1, 0, h - 1)
    t = np.clip(src - i0, 0, 1)[:, None]
    return arr[i0] * (1 - t) + arr[i1] * t


# ---------------------------------------------------------------- imagens
def save_png(rgba: np.ndarray, path: Path):
    Image.fromarray((np.clip(rgba, 0, 1) * 255).astype("uint8"), "RGBA").save(path, optimize=True)


def colorize(arr, vmin, vmax, cmap_name):
    norm = np.clip((arr - vmin) / (vmax - vmin), 0, 1)
    rgba = colormaps[cmap_name](np.nan_to_num(norm))
    rgba[~np.isfinite(arr), 3] = 0  # sem dado = transparente
    return rgba


def legend_colors(cmap_name, n=7):
    cmap = colormaps[cmap_name]
    return ["#%02x%02x%02x" % tuple(int(c * 255) for c in cmap(i / (n - 1))[:3]) for i in range(n)]


def hillshade_rgba(z, res, vert_exag):
    shade = LightSource(azdeg=315, altdeg=40).hillshade(z, vert_exag=vert_exag, dx=res, dy=res)
    dark, light = np.array([40, 24, 18]) / 255, np.array([222, 170, 128]) / 255  # tons marcianos
    rgb = dark + (light - dark) * shade[..., None]
    return np.dstack([rgb, np.ones(z.shape)])


# ---------------------------------------------------------------- valores
NODATA_INT16 = -32768  # marca "sem dado" no arquivo de valores


def save_values(arr: np.ndarray, path: Path, scale: float, dtype: str):
    """Grava os valores como inteiros (metade do tamanho de float32). valor = bruto * scale.
    Pixels sem dado (NaN) viram NODATA_INT16, e o site mostra "sem dado" ali."""
    if dtype == "int16":
        raw = np.where(np.isfinite(arr), np.round(np.nan_to_num(arr) / scale), NODATA_INT16)
    else:
        raw = arr
    np.asarray(raw, dtype="<i2" if dtype == "int16" else "u1").tofile(path)
    info = {"file": path.name, "dtype": dtype, "scale": scale, "width": int(arr.shape[1]), "height": int(arr.shape[0])}
    if dtype == "int16":
        info["nodata"] = NODATA_INT16
    return info


def continuous_layer(lid, label, filt, arr, vmin, vmax, cmap, unit, source, out, bounds, scale, decimals, blocky=False):
    lat_b, lat_t = bounds[0][0], bounds[1][0]
    # blocky=True: dado de baixa resolução, mantém os "quadrados" nítidos em vez de borrar
    save_png(colorize(to_mercator_rows(arr, lat_b, lat_t, blocky), vmin, vmax, cmap), out / f"{lid}.png")
    return {
        "id": lid, "filter": filt, "label": label, "image": f"{lid}.png", "bounds": bounds, "opacity": 0.75,
        "legend": {"min": vmin, "max": vmax, "unit": unit, "colors": legend_colors(cmap),
                   "clipMin": bool(np.nanmin(arr) < vmin), "clipMax": bool(np.nanmax(arr) > vmax)},
        "values": {**save_values(arr, out / f"{lid}.bin", scale, "int16"), "unit": unit, "decimals": decimals},
        "source": source,
    }


# ---------------------------------------------------------------- SWIM
SWIM_SOURCE = {
    "instrument": "SWIM (combina SHARAD, MOLA, TES, THEMIS e outros)",
    "mission": "Subsurface Water Ice Mapping (NASA)",
    "date": None,
}
SWIM_CONSISTENCY = ("Índice de consistência com gelo do SWIM: perto de +1 = dado compatível com gelo, "
                    "perto de -1 = incompatível. Escala a confirmar na documentação do SWIM.")

# id do subfiltro -> (arquivo, nome, resolução original em m)
SWIM_MAPS = {
    "swim-ci": ("Ci.tif", "Consistência do gelo", 3000),
    "swim-dielectric": ("Dielectric.tif", "Propriedades dielétricas", 3000),
    "swim-radar-power": ("Rad_Power.tif", "Potência do radar na superfície", 3000),
}


def swim_layers(swim_dir: Path, spec, out: Path, bounds):
    """Lê cada GeoTIFF com a MESMA função que lê o MOLA (recorta a área e põe na grade de 200 m).
    'nearest' mantém os valores originais do SWIM, sem inventar valores intermediários."""
    read = lambda name: dp.read_raster_to_grid(str(swim_dir / name), spec, "nearest").z
    layers = []

    # Índices de consistência: escala fixa de -1 a +1 (vermelho = incompatível, azul = compatível)
    for lid, (fname, label, res) in SWIM_MAPS.items():
        if not (swim_dir / fname).exists():
            continue
        layers.append(continuous_layer(lid, label, "suporte-vida", read(fname), -1.0, 1.0, "RdBu", "", 
                                       {**SWIM_SOURCE, "resolution_m": res, "confidence": SWIM_CONSISTENCY},
                                       out, bounds, 0.001, 2, blocky=True))

    # Refletores de radar profundos: outra grandeza (unidade a confirmar) e só parte da área tem dado
    if (swim_dir / "Reflectors.tif").exists():
        r = read("Reflectors.tif")
        vmax = float(np.ceil(np.nanpercentile(r, 98)))
        layers.append(continuous_layer("swim-reflectors", "Refletores de radar profundos", "suporte-vida", r, 0.0, vmax,
                                       "viridis", "", {**SWIM_SOURCE, "resolution_m": 4700,
                                       "confidence": "Valores do produto de refletores do SWIM (unidade a confirmar). "
                                                     "Áreas transparentes: sem refletor detectado/sem dado."},
                                       out, bounds, 0.01, 2, blocky=True))
    return layers


def main():
    ap = argparse.ArgumentParser(description="Exporta as camadas do relevo para o mapa 2D do ARES.")
    ap.add_argument("--npy", default=str(HERE / "outputs" / "npy"), help="pasta com os .npy do main.py")
    ap.add_argument("--res", type=float, default=200.0, help="resolução usada no main.py (m)")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="pasta de saída (public/data/layers)")
    ap.add_argument("--vert-exag", type=float, default=12.0, help="exagero vertical do relevo sombreado")
    ap.add_argument("--swim", default=str(HERE / "dados" / "swim"), help="pasta com os GeoTIFFs do SWIM")
    a = ap.parse_args()

    npy, out = Path(a.npy), Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    spec, bounds = grid_bounds(a.res)
    load = lambda name: np.load(npy / f"{name}.npy")
    z, slope, tri, flags = load("elevacao_m"), load("declividade_deg"), load("tri_m"), load("obstaculos_flags")
    if z.shape != spec.shape:
        raise SystemExit(f"A grade tem forma {z.shape}, mas {a.res} m pede {spec.shape}. Confira --res.")

    derived = {**MOLA_SOURCE, "resolution_m": int(a.res),
               "confidence": "Calculado a partir da elevação do MOLA. Na escala de ~460 m, rochas e crateras pequenas não aparecem."}
    layers = []

    # Fundo: relevo sombreado
    lat_b, lat_t = bounds[0][0], bounds[1][0]
    save_png(hillshade_rgba(to_mercator_rows(z, lat_b, lat_t, False), a.res, a.vert_exag), out / "hillshade.png")
    layers.append({"id": "hillshade", "filter": "base", "label": "Relevo sombreado (MOLA)", "image": "hillshade.png",
                   "bounds": bounds, "opacity": 1,
                   "source": {**MOLA_SOURCE, "confidence": f"Medido; exagero vertical {a.vert_exag:g}x para destacar o relevo"}})

    # Faixas de cor: onde está a maioria dos valores (os extremos aparecem como <= / >= na legenda)
    zmin, zmax = float(np.floor(np.percentile(z, 1) / 10) * 10), float(np.ceil(np.percentile(z, 99) / 10) * 10)
    layers.append(continuous_layer("elevacao", "Relevo e altitude", "geologia", z, zmin, zmax, "terrain", "m",
                                   {**MOLA_SOURCE, "confidence": "Medido (altímetro a laser), com interpolação entre as faixas de órbita"},
                                   out, bounds, 1.0, 0))
    layers.append(continuous_layer("declividade", "Inclinação do terreno", "geologia", slope, 0.0, 2.0, "magma", "°",
                                   derived, out, bounds, 0.01, 2))
    layers.append(continuous_layer("rugosidade", "Rugosidade (TRI)", "suporte-vida", tri, 0.0, 5.0, "viridis", "m",
                                   derived, out, bounds, 0.01, 2))

    # Obstáculos: categorias por causa (vermelho = depressão, laranja = rugosidade)
    colors = {4: (0.98, 0.55, 0.15, 0.85), 8: (0.86, 0.15, 0.15, 0.85), 12: (0.55, 0.05, 0.05, 0.9)}
    fm = to_mercator_rows(flags, lat_b, lat_t, True)
    rgba = np.zeros(fm.shape + (4,))
    for v, c in colors.items():
        rgba[fm == v] = c
    other = (fm > 0) & ~np.isin(fm, list(colors))
    rgba[other] = (0.6, 0.6, 0.6, 0.85)
    save_png(rgba, out / "obstaculos.png")
    layers.append({
        "id": "obstaculos", "filter": "suporte-vida", "label": "Obstáculos ao deslocamento", "image": "obstaculos.png",
        "bounds": bounds, "opacity": 1,
        "legend": {"categories": [{"color": "#fa8c26", "label": "Rugosidade extrema"},
                                  {"color": "#db2626", "label": "Depressão fechada"},
                                  {"color": "#8c0d0d", "label": "Os dois"}]},
        "values": {**save_values(flags, out / "obstaculos.bin", 1, "uint8"), "bits": OBSTACLE_BITS},
        "source": {**derived, "confidence": "Critérios do algoritmo de rotas: declividade > 15°, rugosidade no 1% mais alto, depressões > 20 m"},
    })

    # ---------- Água: mapas do SWIM (GeoTIFF com coordenadas, ~3 km por pixel) ----------
    swim_dir = Path(a.swim)
    if swim_dir.is_dir():
        layers += swim_layers(swim_dir, spec, out, bounds)
    else:
        print(f"(pasta do SWIM não encontrada em {swim_dir}: camadas de água puladas)")

    (out / "manifest.json").write_text(json.dumps({"layers": layers}, ensure_ascii=False, indent=2), encoding="utf-8")
    for l in layers:
        print(f"OK  {l['id']:12s} -> {out / l['image']}")
    print(f"manifest: {out / 'manifest.json'}")


if __name__ == "__main__":
    main()
