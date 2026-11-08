"""Mapas 2D (elevação, declividade, rugosidade, obstáculos, rotas) e 3D. Salva PNG."""
from __future__ import annotations
from pathlib import Path
import sys
import numpy as np
import matplotlib
if "--interativo" not in sys.argv:   # no modo interativo mantém o backend com janela
    matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from terrain_analyzer import horn_gradients
import obstacle_detection as od

MODE_STYLE = {"menor_distancia": ("tab:red", "-"), "maior_seguranca": ("tab:green", "-"), "multicriterio": ("tab:blue", "--")}


def hillshade(z, res, az=315.0, alt=45.0):
    dx, dy = horn_gradients(z, res)
    n = np.stack([-dx, -dy, np.ones_like(dx)])
    n /= np.sqrt((n ** 2).sum(0))
    a, h = np.radians(az), np.radians(alt)
    L = np.array([np.sin(a) * np.cos(h), np.cos(a) * np.cos(h), np.sin(h)])
    return np.clip(np.tensordot(L, n, axes=1), 0, 1)


def _ax(spec, title, banner):
    fig, ax = plt.subplots(figsize=(8, 6.5))
    ax.set_title((banner or "") + title, fontsize=10)
    ax.set_xlabel("longitude leste (°)"); ax.set_ylabel("latitude (°N)")
    return fig, ax, spec.extent_lonlat()


def _pois(ax, pois):
    for n, (lat, lon) in (pois or {}).items():
        ax.plot(lon, lat, "k^", ms=7, mfc="yellow"); ax.annotate(n, (lon, lat), xytext=(4, 4), textcoords="offset points", fontsize=8)


def plot_layer(arr, spec, title, path, cmap, label, pois=None, shade=None, banner=None):
    fig, ax, ext = _ax(spec, title, banner)
    if shade is not None:
        ax.imshow(shade, extent=ext, cmap="gray", vmin=0, vmax=1)
    im = ax.imshow(np.ma.masked_invalid(arr), extent=ext, cmap=cmap, alpha=0.65 if shade is not None else 1.0)
    fig.colorbar(im, ax=ax, label=label, shrink=0.8)
    _pois(ax, pois); fig.tight_layout(); fig.savefig(path, dpi=130); plt.close(fig)


def plot_obstacles(flags, spec, path, pois=None, banner=None):
    fig, ax, ext = _ax(spec, "Obstáculos (bits de causa)", banner)
    ax.imshow((flags > 0).astype(float), extent=ext, cmap=ListedColormap(["#eef", "#c33"]), vmin=0, vmax=1)
    txt = [f"{nm}: {int(((flags & b) > 0).sum())} px" for b, nm in od.FLAG_NAMES.items()]
    ax.text(0.01, 0.01, "\n".join(txt), transform=ax.transAxes, fontsize=7, va="bottom", bbox=dict(fc="w", alpha=.8))
    _pois(ax, pois); fig.tight_layout(); fig.savefig(path, dpi=130); plt.close(fig)


def _lonlat(spec, path):
    r, c = zip(*path)
    return spec.center_lonlat(np.array(r), np.array(c))


def plot_routes(grid, flags, routes, pair, path, pois=None, banner=None):
    spec = grid.spec
    fig, ax, ext = _ax(spec, f"Rotas {pair[0]} → {pair[1]}", banner)
    ax.imshow(hillshade(grid.z, spec.res), extent=ext, cmap="gray", vmin=0, vmax=1)
    ax.imshow(np.ma.masked_where(flags == 0, flags > 0), extent=ext, cmap=ListedColormap(["#d22"]), alpha=0.45)
    for m, (col, ls) in MODE_STYLE.items():
        r = routes.get((pair[0], pair[1], m))
        if r is not None and r.found:
            lon, lat = _lonlat(spec, r.path)
            ax.plot(lon, lat, color=col, ls=ls, lw=1.8, label=f"{m} ({r.length_m/1e3:.1f} km)")
    _pois(ax, pois); ax.legend(fontsize=8, loc="upper right"); fig.tight_layout(); fig.savefig(path, dpi=130); plt.close(fig)


def plot_3d(grid, routes, path, pairs, mode="multicriterio", vert_exag=5.0, stride=2, banner=None):
    spec, z = grid.spec, grid.z
    zs = z[::stride, ::stride]
    H, W = z.shape
    X, Y = np.meshgrid((np.arange(0, W, stride) + .5) * spec.res / 1e3, (H - np.arange(0, H, stride) - .5) * spec.res / 1e3)
    fig = plt.figure(figsize=(9, 7)); ax = fig.add_subplot(111, projection="3d")
    ax.plot_surface(X, Y, zs, cmap="terrain", linewidth=0, antialiased=False, alpha=0.9)
    for (a, b), col in zip(pairs, ("tab:red", "tab:blue", "tab:green")):
        r = routes.get((a, b, mode))
        if r is not None and r.found:
            rr, cc = map(np.array, zip(*r.path))
            ax.plot((cc + .5) * spec.res / 1e3, (H - rr - .5) * spec.res / 1e3, z[rr, cc] + 5, color=col, lw=2, label=f"{a}→{b}")
    zr = np.nanmax(z) - np.nanmin(z)
    ax.set_box_aspect((W * spec.res, H * spec.res, max(zr, 1) * vert_exag))
    ax.set_xlabel("leste (km)"); ax.set_ylabel("norte (km)"); ax.set_zlabel("elev. (m)")
    ax.set_title((banner or "") + f"Relevo 3D (exagero vertical {vert_exag}x), rotas modo {mode}", fontsize=10)
    ax.legend(fontsize=8); fig.tight_layout(); fig.savefig(path, dpi=130); plt.close(fig)
