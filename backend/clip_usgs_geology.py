#!/usr/bin/env python3
"""ARES - recorta o mapa geológico global da USGS para a região do site (roda UMA vez).

Fonte: Tanaka, K.L. et al., 2014, Geologic Map of Mars, 1:20.000.000, USGS Scientific Investigations
Map 3292 (https://pubs.usgs.gov/sim/3292). Os shapefiles globais têm ~75 MB, então não vão para o
GitHub: este script gera um GeoJSON pequeno (dados/usgs/sim3292_recorte.geojson), que o
export_layers.py usa para desenhar a camada.

Onde baixar os shapefiles: pacote do SIM 3292 no site da USGS (pasta SIM3292_Shapefiles), ou o
repositório github.com/eleanorlutz/mars_geology_atlas_of_space (pasta data/), que tem a mesma
versão em coordenadas geográficas (graus).

Uso (dentro de backend/):
    pip install pyshp shapely
    python clip_usgs_geology.py --shp CAMINHO/SIM3292_Shapefiles
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import shapefile                      # pyshp
from shapely.geometry import box, mapping, shape

HERE = Path(__file__).resolve().parent
OUT = HERE / "dados" / "usgs" / "sim3292_recorte.geojson"

# Janela: área de estudo com folga (a mesma área navegável do mapa 2D), em longitude LESTE 0-360
WINDOW = {"lat": (35.5, 45.0), "lon": (196.0, 208.5)}

# Nome, descrição em português e cor de cada unidade que aparece na região.
# Cores: paleta do SIM 3292 (como em github.com/eleanorlutz/mars_geology_atlas_of_space), com ajuste de contraste.
UNITS = {
    "Av":  ("Unidade vulcânica Amazoniana",
            "Planícies de lava da era Amazoniana (últimos ~3 bilhões de anos), vindas da região de Tharsis.",
            "#af2351"),
    "lAv": ("Unidade vulcânica do Amazoniano tardio",
            "Derrames de lava mais jovens da era Amazoniana.",
            "#e3799b"),   # clareada (original #97254a) para não se confundir com a Av no mapa
    "AHi": ("Unidade de impacto Amazoniana-Hesperiana",
            "Materiais de crateras de impacto (bordas e ejetos).",
            "#ffeb33"),
    "lHl": ("Unidade de planície baixa do Hesperiano tardio",
            "Planícies das terras baixas do norte, mais antigas (~3,7 a 3,0 bilhões de anos).",
            "#e4e8d3"),
}


def to_east(geom):
    """Longitude -180..180 (shapefile) -> leste 0..360 (convenção do ARES). A região não cruza 180°.
    Arredonda para 4 casas (~6 m), muito abaixo da escala do mapa (1:20 milhões)."""
    import numpy as np
    import shapely
    return shapely.transform(geom, lambda c: np.round(np.column_stack([(c[:, 0] + 360.0) % 360.0, c[:, 1]]), 4))


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--shp", required=True, help="pasta com SIM3292_Global_Geology.* e SIM3292_Global_Structure.*")
    a = ap.parse_args()
    folder = Path(a.shp)
    lon0, lon1 = WINDOW["lon"]
    lat0, lat1 = WINDOW["lat"]
    win = box(lon0 - 360, lat0, lon1 - 360, lat1)       # mesma janela em -180..180

    features, missing = [], set()
    geo = shapefile.Reader(str(folder / "SIM3292_Global_Geology"), encoding="latin1")
    for sr in geo.iterShapeRecords():
        g = shape(sr.shape.__geo_interface__)
        if not g.intersects(win):
            continue
        unit = sr.record["Unit"]
        if unit not in UNITS:
            missing.add(unit)
        name, desc, color = UNITS.get(unit, (sr.record["UnitDesc"], "", "#888888"))
        features.append({"type": "Feature", "geometry": mapping(to_east(g.intersection(win))),
                         "properties": {"kind": "unidade", "unit": unit, "unit_desc_en": sr.record["UnitDesc"],
                                        "name": name, "desc": desc, "color": color}})

    st = shapefile.Reader(str(folder / "SIM3292_Global_Structure"), encoding="latin1")
    for sr in st.iterShapeRecords():
        g = shape(sr.shape.__geo_interface__)
        if not g.intersects(win):
            continue
        r = sr.record.as_dict()
        features.append({"type": "Feature", "geometry": mapping(to_east(g.intersection(win))),
                         "properties": {"kind": "estrutura", "morphology": r.get("Morphology"),
                                        "interpretation": r.get("Interpreta"), "length_km": round(r.get("SphLen_km") or 0, 1)}})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "type": "FeatureCollection",
        "source": "Tanaka et al., 2014, Geologic Map of Mars, USGS SIM 3292 (escala 1:20.000.000)",
        "window_east": WINDOW,
        "features": features,
    }, ensure_ascii=False), encoding="utf-8")
    print(f"{len(features)} feições -> {OUT} ({OUT.stat().st_size / 1024:.0f} kB)")
    if missing:
        print("ATENÇÃO: unidades sem tradução/cor em UNITS:", sorted(missing))


if __name__ == "__main__":
    main()
