"""Máscara de obstáculos. Cada bit de `flags` diz POR QUE a célula é bloqueada.

Fontes: NoData, declividade, rugosidade, depressões fechadas do DEM e textura da imagem orbital (CTX).
ATENÇÃO: o critério de textura é heurístico (não detecta rochas individuais; CTX ~5-6 m/px) e NÃO foi
validado contra mapeamento manual. Os limites são parâmetros de projeto, não especificações de missão.
"""
from __future__ import annotations
from dataclasses import dataclass, asdict
import numpy as np
from scipy import ndimage as ndi

NODATA, SLOPE, ROUGH, DEPRESSION, TEXTURE, BUFFER = 1, 2, 4, 8, 16, 32
FLAG_NAMES = {NODATA: "NoData", SLOPE: "declividade", ROUGH: "rugosidade", DEPRESSION: "depressão",
              TEXTURE: "textura CTX", BUFFER: "margem de segurança"}


@dataclass
class ObstacleParams:
    slope_limit_deg: float = 15.0
    rough_limit_m: float | None = None          # absoluto (TRI, m); None => usa percentil
    rough_percentile: float | None = 99.0       # relativo à cena; None desativa
    depression_depth_m: float | None = 20.0     # None desativa
    texture_limit: float | None = None          # desvio-padrão de DN; None => percentil
    texture_percentile: float | None = 98.0     # relativo à cena (sempre marca ~2%); None desativa
    min_component_px: int = 3
    buffer_m: float = 0.0


@dataclass
class ObstacleResult:
    flags: np.ndarray
    blocked: np.ndarray
    clearance_m: np.ndarray
    thresholds: dict
    params: dict


def _remove_small(mask, min_px):
    lab, n = ndi.label(mask)
    if n == 0:
        return mask
    sizes = np.bincount(lab.ravel())
    keep = sizes >= min_px
    keep[0] = False
    return keep[lab]


def depressions(z, depth_m: float):
    from skimage.morphology import reconstruction
    zf = np.where(np.isfinite(z), z, np.nanmax(z)).astype("float64")
    seed = zf.copy()
    seed[1:-1, 1:-1] = zf.max()
    filled = reconstruction(seed, zf, method="erosion")
    return (filled - zf) >= depth_m


def detect(z, slope, tri_m, res: float, p: ObstacleParams, ctx_std=None) -> ObstacleResult:
    flags = np.zeros(z.shape, np.uint8)
    th = {}
    flags[~np.isfinite(z) | ~np.isfinite(slope)] |= NODATA
    flags[np.nan_to_num(slope, nan=0.0) > p.slope_limit_deg] |= SLOPE
    th["slope_limit_deg"] = p.slope_limit_deg
    rl = p.rough_limit_m
    if rl is None and p.rough_percentile is not None and np.isfinite(tri_m).any():
        rl = float(np.nanpercentile(tri_m, p.rough_percentile))
        th["rough_basis"] = f"percentil {p.rough_percentile} (relativo à cena)"
    if rl is not None:
        flags[_remove_small(np.nan_to_num(tri_m, nan=0.0) > rl, p.min_component_px)] |= ROUGH
    th["rough_limit_m"] = rl
    if p.depression_depth_m is not None:
        flags[_remove_small(depressions(z, p.depression_depth_m), p.min_component_px)] |= DEPRESSION
        th["depression_depth_m"] = p.depression_depth_m
    if ctx_std is not None and np.isfinite(ctx_std).any():
        tl = p.texture_limit
        if tl is None and p.texture_percentile is not None:
            tl = float(np.nanpercentile(ctx_std, p.texture_percentile))
            th["texture_basis"] = f"percentil {p.texture_percentile} (relativo; marca regiões mesmo em terreno brando)"
        if tl is not None:
            flags[_remove_small(np.nan_to_num(ctx_std, nan=0.0) > tl, p.min_component_px)] |= TEXTURE
        th["texture_limit"] = tl
    else:
        th["texture"] = "não aplicado (sem imagem CTX)"
    core = flags > 0
    clearance = (ndi.distance_transform_edt(~core) * res).astype("float32") if core.any() \
        else np.full(z.shape, 1e9, "float32")
    if p.buffer_m > 0:
        flags[(~core) & (clearance <= p.buffer_m)] |= BUFFER
    return ObstacleResult(flags, flags > 0, clearance, th, asdict(p))
