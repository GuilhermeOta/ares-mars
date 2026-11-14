"""ARES - API de rotas (FastAPI) em volta do código de rotas.

Rodar:   uvicorn api:app --reload
Testar:  http://localhost:8000/docs

De onde vem o relevo (variáveis de ambiente, nesta ordem):
  ARES_DEM_NPY  grade recortada já salva pelo main.py (outputs/npy/elevacao_m.npy)
                + ARES_RES com a resolução usada nela (padrão 200)   <- recomendado p/ hospedar
  ARES_MOLA     GeoTIFF do MOLA (global ou recortado); recorta na inicialização
  (nenhuma)     terreno SINTÉTICO, só para testar a ligação com o site
"""
from __future__ import annotations
import math, os
from pathlib import Path
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import dem_processor as dp
import obstacle_detection as od
import route_comparison as rc
import terrain_analyzer as ta

AOI = dp.aoi_from_pois(dp.POIS, 0.5)   # (lon_min, lat_min, lon_max, lat_max): mesma área do site


def load_grid():
    res = float(os.environ.get("ARES_RES", "200"))
    npy, mola = os.environ.get("ARES_DEM_NPY"), os.environ.get("ARES_MOLA")
    # Sem variável nenhuma: usa o relevo real que já vem no repositório (backend/dados/, 200 m)
    padrao = Path(__file__).resolve().parent / "dados" / "elevacao_m.npy"
    if not npy and not mola and padrao.exists():
        npy = str(padrao)
    if npy:
        spec = dp.GridSpec.from_aoi(AOI, res)
        z = np.load(npy).astype("float32")
        if z.shape != spec.shape:
            raise RuntimeError(f"{npy} tem forma {z.shape}, mas a grade de {res} m pede {spec.shape}. Confira ARES_RES.")
        return dp.DEMGrid(z, spec, {"fonte": npy}), False
    if mola:
        spec = dp.GridSpec.from_aoi(AOI, res)
        return dp.read_raster_to_grid(mola, spec, "bilinear" if res < 463 else "average"), False
    from synthetic_fixture import make_synthetic
    return make_synthetic(500.0), True


# ---- Preparação: roda UMA vez quando a API liga (depois cada rota leva < 1 s) ----
GRID, SINTETICO = load_grid()
TERR = ta.analyze(GRID.z, GRID.spec.res)
OBS = od.detect(GRID.z, TERR.slope_deg, TERR.tri_m, GRID.spec.res, od.ObstacleParams())
PREP = rc.prepare_costs(TERR, OBS)

app = FastAPI(title="ARES - Rotas")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Ponto(BaseModel):
    lat: float = Field(..., description="latitude planetocêntrica (°N)")
    lon: float = Field(..., description="longitude LESTE, 0 a 360")


class PedidoRota(BaseModel):
    origem: Ponto
    destino: Ponto


def _num(x):
    return None if x is None or (isinstance(x, float) and not math.isfinite(x)) else round(float(x), 3)


@app.get("/status")
def status():
    lon_min, lat_min, lon_max, lat_max = AOI
    return {"ok": True, "sintetico": SINTETICO, "resolucao_m": GRID.spec.res,
            "area": [[lat_min, lon_min], [lat_max, lon_max]]}


@app.post("/rota")
def rota(p: PedidoRota):
    origem, destino = (p.origem.lat, p.origem.lon % 360), (p.destino.lat, p.destino.lon % 360)
    resultados = rc.route_between(PREP, GRID, TERR, OBS, origem, destino)
    rotas = []
    for modo, d in resultados.items():
        r = d["route"]
        item = {"modo": modo, "encontrada": r.found, "motivo": r.reason or None}
        if r.found:
            rr, cc = map(np.array, zip(*r.path))
            lon, lat = GRID.spec.center_lonlat(rr, cc)
            m = d["metrics"]
            item.update(
                pontos=[[round(float(a), 5), round(float(b) % 360, 5)] for a, b in zip(lat, lon)],  # [lat, lon 0-360]
                distancia_km=_num(r.length_m / 1000),
                declividade_max=_num(m["declividade_max"]),
                declividade_media=_num(m["declividade_media"]),
                folga_min_m=_num(m["folga_min_m"]),
                ganho_m=_num(m["ganho_m"]),
                perda_m=_num(m["perda_m"]),
            )
        rotas.append(item)
    if not any(r["encontrada"] for r in rotas):
        raise HTTPException(422, detail=rotas[0]["motivo"] or "nenhuma rota encontrada")
    reta = next(iter(resultados.values()))["geodesic_m"]
    return {"sintetico": SINTETICO, "reta_km": _num(reta / 1000), "rotas": rotas}