"""Catálogo de produtos e aquisição com rastreabilidade.

Regra: só constam URLs vistas em páginas oficiais de catálogo (campo `verified`).
Onde a URL do arquivo NÃO foi verificada, `url` é None e o usuário deve escolher o
arquivo manualmente (ver `manual_instructions`). Nada aqui é inventado.
"""
from __future__ import annotations
import hashlib, json, time, urllib.request
from dataclasses import dataclass, asdict
from pathlib import Path

STUDY = {
    "citation": "Luzzi, E., Heldmann, J.L., Williams, K.E., Nodjoumi, G., Deutsch, A., Sehlke, A. (2025). "
                "Geomorphological evidence of near-surface ice at candidate landing sites in northern "
                "Amazonis Planitia, Mars. JGR Planets 130.",
    "doi": "10.1029/2024JE008724",
    "note": "O título fala em 'northern Amazonis Planitia'; o texto situa AP-1/8/9 na fronteira "
            "Arcadia/Amazonis. NÃO assuma que os pontos estão dentro dos limites estritos de Arcadia Planitia.",
}


@dataclass
class Source:
    key: str
    product: str
    file: str | None
    url: str | None
    verified: bool          # URL vista em página oficial de catálogo (download NÃO testado aqui)
    fmt: str
    coverage: str
    resolution: str
    dest: str
    notes: str


CATALOG: dict[str, Source] = {
    "mola": Source(
        key="mola",
        product="Mars MGS MOLA DEM 463m (MEGDR; publicado pelo USGS Astrogeology)",
        file="Mars_MGS_MOLA_DEM_mosaic_global_463m.tif",
        url="https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif",
        verified=True, fmt="GeoTIFF (~2 GB)", coverage="global",
        resolution="463 m/pixel (esfera IAU2000, R=3396190 m); incerteza vertical total >= ±3 m",
        dest="data/raw/mola/",
        notes="Página do produto: https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m . "
              "Alturas relativas ao areoide MOLA. Original PDS: MGS-M-MOLA-5-MEGDR-L3-V1.0 "
              "(https://pds-geosciences.wustl.edu/ - arquivo exato a localizar no PDS)."),
    "ctx": Source(
        key="ctx",
        product="Global CTX Mosaic of Mars (Murray Lab v1, Dickson et al.)",
        file=None,  # nome do tile NÃO verificado: listar o índice e escolher o tile que cobre ~39-41.5N, ~200-205E
        url=None,
        verified=False, fmt="zip por tile 4x4 graus contendo MurrayLab_CTX_V01_<tile>_Mosaic.tif",
        coverage="global (dados CTX até a fase K11, dez/2018)", resolution="5 m/pixel",
        dest="data/raw/ctx/",
        notes="Índice de tiles (URL vista no catálogo USGS): https://murray-lab.caltech.edu/CTX/V01/tiles/ ; "
              "página: https://astrogeology.usgs.gov/search/map/mars-mro-ctx-global-mosaic-murray-lab-v1"),
    "hrsc": Source(
        key="hrsc",
        product="Mars Express HRSC DTM/ortoimagem (produto e órbita a escolher)",
        file=None, url=None, verified=False, fmt="GeoTIFF/IMG (PDS4/PDS3)",
        coverage="parcial: só órbitas que cobrem a AOI (não verificado)",
        resolution="DTM tipicamente dezenas de m/pixel (NÃO verificado para esta AOI)",
        dest="data/raw/hrsc/",
        notes="Não verifiquei nesta sessão nenhum arquivo HRSC que cubra a AOI. Procure no ESA PSA "
              "(https://archives.esac.esa.int/psa/) ou no PDS Imaging Node (https://pds-imaging.jpl.nasa.gov/) "
              "e passe o arquivo com --hrsc."),
}


def manual_instructions() -> str:
    lines = ["# Dados necessários (não baixados automaticamente)\n"]
    for s in CATALOG.values():
        lines += [f"## {s.key.upper()} - {s.product}",
                  f"- Arquivo: {s.file or 'a determinar (ver notas)'}",
                  f"- URL: {s.url or 'NÃO VERIFICADA - ver notas'}",
                  f"- Formato: {s.fmt}", f"- Cobertura: {s.coverage}", f"- Resolução: {s.resolution}",
                  f"- Diretório de destino: {s.dest}", f"- Notas: {s.notes}\n"]
    return "\n".join(lines)


def sha256_file(path: str | Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(chunk), b""):
            h.update(b)
    return h.hexdigest()


def try_download(src: Source, root: str | Path = ".", timeout: float = 30.0, max_gb: float = 3.0) -> dict:
    """Tenta baixar o arquivo completo. Retorna dict de proveniência (status ok/failed)."""
    rec = {"key": src.key, "url": src.url, "attempted_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    if not src.url:
        return {**rec, "status": "skipped", "error": "URL não verificada"}
    dest = Path(root) / src.dest / (src.file or Path(src.url).name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(src.url, timeout=timeout) as r, open(str(dest) + ".part", "wb") as f:
            total = int(r.headers.get("Content-Length", 0))
            if total and total > max_gb * 1e9:
                return {**rec, "status": "skipped", "error": f"arquivo > {max_gb} GB"}
            while chunk := r.read(1 << 20):
                f.write(chunk)
        Path(str(dest) + ".part").rename(dest)
        return {**rec, "status": "ok", "path": str(dest), "bytes": dest.stat().st_size, "sha256": sha256_file(dest)}
    except Exception as e:  # rede indisponível, DNS, HTTP etc.
        return {**rec, "status": "failed", "error": f"{type(e).__name__}: {e}"}


def append_provenance(path: str | Path, record: dict) -> None:
    p = Path(path)
    data = json.loads(p.read_text()) if p.exists() else []
    data.append(record)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def catalog_json() -> str:
    return json.dumps({k: asdict(v) for k, v in CATALOG.items()}, indent=2, ensure_ascii=False)
