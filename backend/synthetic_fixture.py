"""Terreno SINTÉTICO apenas para testar o pipeline. NÃO representa Marte."""
from __future__ import annotations
import numpy as np
from scipy.ndimage import gaussian_filter
from dem_processor import DEMGrid, GridSpec, POIS, aoi_from_pois


def make_synthetic(res: float = 500.0, seed: int = 0) -> DEMGrid:
    spec = GridSpec.from_aoi(aoi_from_pois(POIS, 0.5), res)
    H, W = spec.shape
    rng = np.random.default_rng(seed)
    z = -4000.0 + 25.0 * gaussian_filter(rng.normal(size=(H, W)), 10) / 0.05 * 0.05 * 10
    rr, cc = np.mgrid[0:H, 0:W]
    r_gap, c_ridge = spec.rc_of(202.7, 39.55)[0], spec.rc_of(202.7, 40.3)[1]
    z += np.where(rr < r_gap, 600.0 * np.exp(-((cc - c_ridge) / 3.0) ** 2), 0.0)   # cume com passagem ao sul
    pr, pc = spec.rc_of(201.7, 40.2)
    z -= 60.0 * np.exp(-(((rr - pr) ** 2 + (cc - pc) ** 2) / 16.0))               # cratera
    return DEMGrid(z.astype("float32"), spec, {"synthetic": True, "note": "terreno artificial para teste"})
