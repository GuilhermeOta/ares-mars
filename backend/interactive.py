"""Seleção interativa: clique a origem e o destino no mapa; o A* roda nos 3 modos a cada seleção.

Mouse: botão esquerdo = escolhe ponto (1º clique origem, 2º destino, 3º recomeça). Zoom/pan da barra de
ferramentas continuam funcionando (cliques com a ferramenta ativa são ignorados).
Teclas: r = limpar | s = salvar PNG+GeoJSON+métricas | q = sair.
"""
from __future__ import annotations
import json, time
from pathlib import Path
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
import route_comparison as rc
from visualization import MODE_STYLE, hillshade


class RouteSelector:
    def __init__(self, grid, terr, obs, pois=None, modes=None, snap_max_m=2000.0):
        self.grid, self.terr, self.obs, self.pois = grid, terr, obs, pois or {}
        self.modes, self.snap_max_m = modes or rc.MODES, snap_max_m
        self.prep = rc.prepare_costs(terr, obs, self.modes)
        self.reset()

    def reset(self):
        self.points, self.results = [], {}
        self.message = "Clique para escolher a ORIGEM."

    def click(self, lon, lat):
        spec = self.grid.spec
        r, c = spec.rc_of(lon, lat)
        if not spec.contains(r, c) or not np.isfinite(self.grid.z[r, c]):
            self.message = "Clique fora do mapa ou em célula sem dado (NoData)."
            return
        if len(self.points) == 2:
            self.reset()
        self.points.append((lon, lat))
        info = f"elev {self.grid.z[r, c]:.0f} m, decl {self.terr.slope_deg[r, c]:.1f}°"
        if len(self.points) == 1:
            self.message = f"Origem ({lat:.3f}°N, {lon:.3f}°E; {info}). Clique o DESTINO."
        else:
            self.message = "Calculando rotas..."
            (lo1, la1), (lo2, la2) = self.points
            self.results = rc.route_between(self.prep, self.grid, self.terr, self.obs, (la1, lo1), (la2, lo2),
                                            self.modes, self.snap_max_m)
            self.message = f"Destino ({lat:.3f}°N, {lon:.3f}°E; {info}). Clique de novo para recomeçar."

    def summary(self):
        L = []
        for m, d in self.results.items():
            r = d["route"]
            if r.found:
                mt = d["metrics"]
                L.append(f"{m}: {r.length_m/1e3:.1f} km | decl máx {mt['declividade_max']:.1f}° | folga mín {mt['folga_min_m']:.0f} m")
            else:
                L.append(f"{m}: SEM ROTA ({r.reason})")
        return "\n".join(L)

    def draw(self, ax, dyn):
        for art in dyn:
            art.remove()
        dyn.clear()
        spec = self.grid.spec
        for i, (lon, lat) in enumerate(self.points):
            dyn += ax.plot(lon, lat, marker="o" if i == 0 else "*", ms=11, mfc="lime" if i == 0 else "red", mec="k", ls="")
        for m, d in self.results.items():
            r = d["route"]
            if r.found:
                col, ls = MODE_STYLE[m]
                rr, cc = map(np.array, zip(*r.path))
                lon, lat = spec.center_lonlat(rr, cc)
                dyn += ax.plot(lon, lat, color=col, ls=ls, lw=2, label=f"{m} ({r.length_m/1e3:.1f} km)")
        if self.results:
            dyn.append(ax.text(0.01, 0.01, self.summary(), transform=ax.transAxes, fontsize=7, va="bottom",
                               family="monospace", bbox=dict(fc="w", alpha=0.85)))
            leg = ax.legend(fontsize=8, loc="upper right")
            if leg: dyn.append(leg)
        ax.set_title(self.message, fontsize=10)

    def to_geojson(self):
        spec, feats = self.grid.spec, []
        for m, d in self.results.items():
            r = d["route"]
            if r.found:
                rr, cc = map(np.array, zip(*r.path))
                lon, lat = spec.center_lonlat(rr, cc)
                feats.append({"type": "Feature", "properties": {"modo": m, "comprimento_m": r.length_m, "custo": r.cost, **d["metrics"]},
                              "geometry": {"type": "LineString", "coordinates": [[float(((x + 180) % 360) - 180), float(y)] for x, y in zip(lon, lat)]}})
        return {"type": "FeatureCollection", "features": feats,
                "properties": {"corpo": "Marte (NÃO é WGS84)", "coordenadas": "[lon leste -180..180, lat planetocêntrica]"}}


def build_figure(sel: RouteSelector, banner=""):
    spec, z = sel.grid.spec, sel.grid.z
    fig, ax = plt.subplots(figsize=(10, 8))
    ext = spec.extent_lonlat()
    ax.imshow(hillshade(z, spec.res), extent=ext, cmap="gray", vmin=0, vmax=1)
    im = ax.imshow(np.ma.masked_invalid(z), extent=ext, cmap="terrain", alpha=0.45)
    fig.colorbar(im, ax=ax, label="elevação (m)", shrink=0.75)
    ax.imshow(np.ma.masked_where(sel.obs.flags == 0, sel.obs.flags > 0), extent=ext, cmap=ListedColormap(["#d22"]), alpha=0.5)
    for n, (lat, lon) in sel.pois.items():
        if spec.contains(*spec.rc_of(lon, lat)):
            ax.plot(lon, lat, "k^", ms=6, mfc="yellow"); ax.annotate(n, (lon, lat), xytext=(4, 4), textcoords="offset points", fontsize=8)
    ax.set_xlabel("longitude leste (°)"); ax.set_ylabel("latitude (°N)")
    return fig, ax


def run(grid, terr, obs, pois, out_dir, banner=""):
    if matplotlib.get_backend().lower() == "agg":
        print("[ERRO] backend gráfico sem janela (Agg). Instale tkinter ou rode: pip install PyQt6")
        return
    sel, dyn = RouteSelector(grid, terr, obs, pois), []
    fig, ax = build_figure(sel, banner)
    sel.draw(ax, dyn)

    def save():
        d = Path(out_dir) / f"interativo_{time.strftime('%Y%m%d_%H%M%S')}"
        d.mkdir(parents=True, exist_ok=True)
        fig.savefig(d / "mapa.png", dpi=140)
        (d / "rotas.geojson").write_text(json.dumps(sel.to_geojson(), ensure_ascii=False))
        (d / "metricas.json").write_text(json.dumps({m: {"found": x["route"].found, "length_m": x["route"].length_m,
                                                        "snaps_m": x["snaps"], **(x["metrics"] or {})} for m, x in sel.results.items()}, indent=2, default=str))
        print(f"Salvo em {d}")

    def on_click(ev):
        tb = getattr(fig.canvas, "toolbar", None)
        if ev.inaxes is not ax or ev.button != 1 or (tb is not None and str(getattr(tb, "mode", "")) not in ("", "None")):
            return
        if len(sel.points) == 1:
            ax.set_title("Calculando rotas...", fontsize=10); fig.canvas.draw_idle(); fig.canvas.flush_events()
        sel.click(ev.xdata, ev.ydata); sel.draw(ax, dyn); fig.canvas.draw_idle()

    def on_key(ev):
        if ev.key == "r": sel.reset(); sel.draw(ax, dyn); fig.canvas.draw_idle()
        elif ev.key == "s": save()
        elif ev.key == "q": plt.close(fig)

    fig.canvas.mpl_connect("button_press_event", on_click)
    fig.canvas.mpl_connect("key_press_event", on_key)
    plt.show()
