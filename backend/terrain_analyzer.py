"""Elevação -> declividade, orientação (aspect) e rugosidade. NaN (NoData) propagado."""
from __future__ import annotations
from dataclasses import dataclass
import numpy as np
from scipy import ndimage as ndi


def nan_uniform_filter(x, size: int):
    v = np.isfinite(x)
    x0 = np.where(v, x, 0.0).astype("float64")
    n = ndi.uniform_filter(v.astype("float64"), size, mode="nearest") * size * size
    s = ndi.uniform_filter(x0, size, mode="nearest") * size * size
    out = np.full(x.shape, np.nan)
    ok = n > 0.5
    out[ok] = s[ok] / n[ok]
    return out.astype("float32")


def horn_gradients(z, res: float):
    """dz/dx (leste+) e dz/dy (norte+) pelo método de Horn (3x3). Pixels com vizinho NoData -> NaN."""
    valid = np.isfinite(z)
    if not valid.any():
        raise ValueError("DEM sem dados válidos")
    p = np.pad(np.where(valid, z, np.nanmean(z)).astype("float64"), 1, mode="edge")
    a, b, c = p[:-2, :-2], p[:-2, 1:-1], p[:-2, 2:]
    d, f = p[1:-1, :-2], p[1:-1, 2:]
    g, h, i = p[2:, :-2], p[2:, 1:-1], p[2:, 2:]
    dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * res)
    dzdy = ((a + 2 * b + c) - (g + 2 * h + i)) / (8 * res)
    ok = ndi.minimum_filter(valid.astype("uint8"), size=3, mode="nearest").astype(bool)
    dzdx[~ok] = np.nan
    dzdy[~ok] = np.nan
    return dzdx, dzdy


def slope_aspect(z, res: float):
    dzdx, dzdy = horn_gradients(z, res)
    slope = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
    aspect = np.degrees(np.arctan2(-dzdx, -dzdy)) % 360.0     # azimute da descida, horário a partir do Norte
    aspect = np.where(slope < 1e-6, np.nan, aspect)            # plano: sem orientação
    return slope.astype("float32"), aspect.astype("float32")


def tri(z):
    """Terrain Ruggedness Index (média das |diferenças| p/ os 8 vizinhos), em metros."""
    H, W = z.shape
    p = np.pad(z.astype("float64"), 1, constant_values=np.nan)
    st = np.stack([np.abs(p[1 + dr:1 + dr + H, 1 + dc:1 + dc + W] - z)
                   for dr in (-1, 0, 1) for dc in (-1, 0, 1) if (dr, dc) != (0, 0)])
    cnt = np.isfinite(st).sum(0)
    s = np.nansum(st, 0)
    return np.where((cnt >= 3) & np.isfinite(z), s / np.maximum(cnt, 1), np.nan).astype("float32")


def rms_residual(z, window_px: int = 5):
    """RMS do resíduo z - média local (janela window_px, ímpar). Não remove a inclinação regional."""
    w = max(3, int(window_px) | 1)
    r2 = (z - nan_uniform_filter(z, w)) ** 2
    return np.sqrt(nan_uniform_filter(r2, w)).astype("float32")


@dataclass
class TerrainProducts:
    slope_deg: np.ndarray
    aspect_deg: np.ndarray
    tri_m: np.ndarray
    rms_m: np.ndarray
    res: float
    window_px: int


def analyze(z, res: float, window_px: int = 5) -> TerrainProducts:
    s, a = slope_aspect(z, res)
    return TerrainProducts(s, a, tri(z), rms_residual(z, window_px), float(res), int(window_px))
