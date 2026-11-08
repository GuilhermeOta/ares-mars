"""Compara rotas AP-1->AP-8, AP-1->AP-9, AP-8->AP-9 em 3 modos e gera tabela/relatório."""
from __future__ import annotations
import csv, json, math
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
from astar import CostConfig, RouteResult, astar, cost_factor, passable_mask, path_cost
from dem_processor import MARS_RADIUS_M

PAIRS = [("AP-1", "AP-8"), ("AP-1", "AP-9"), ("AP-8", "AP-9")]
# Pesos e limites = ESCOLHAS DE PROJETO (não calibradas contra nenhum rover/missão).
MODES = {
    "menor_distancia": CostConfig("menor_distancia"),
    "maior_seguranca": CostConfig("maior_seguranca", w_slope=8.0, w_rough=4.0, w_clear=10.0, slope_limit_deg=10.0),
    "multicriterio": CostConfig("multicriterio", w_slope=2.0, w_rough=1.0, w_clear=2.0),
}


def haversine_m(lat1, lon1, lat2, lon2):
    p1, p2, dl = math.radians(lat1), math.radians(lat2), math.radians(lon2 - lon1)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * MARS_RADIUS_M * math.asin(math.sqrt(a))


def snap_to_passable(passable, rc, res, max_m):
    if passable[rc]:
        return rc, 0.0
    if not passable.any():
        return None, math.inf
    d, idx = ndi.distance_transform_edt(~passable, return_indices=True)
    dist = float(d[rc] * res)
    return (((int(idx[0][rc]), int(idx[1][rc])), dist) if dist <= max_m else (None, dist))


def run_comparison(grid, terr, obs, pois, modes=MODES, pairs=PAIRS, snap_max_m=2000.0):
    spec, res, z = grid.spec, grid.spec.res, grid.z
    ref = float(np.nanpercentile(terr.tri_m, 95)) if np.isfinite(terr.tri_m).any() else 1.0
    rough_norm = np.clip(terr.tri_m / max(ref, 1e-6), 0, 3)
    fac = {m: cost_factor(terr.slope_deg, rough_norm, obs.clearance_m, c) for m, c in modes.items()}
    pas = {m: passable_mask(obs.blocked, terr.slope_deg, c) for m, c in modes.items()}
    routes, rows = {}, []
    for a, b in pairs:
        for m in modes:
            row = {"par": f"{a}->{b}", "modo": m}
            ends, snaps = [], []
            for n in (a, b):
                lat, lon = pois[n]
                rc = spec.rc_of(lon, lat)
                if not spec.contains(*rc):
                    ends.append(None); snaps.append(math.nan); continue
                e, d = snap_to_passable(pas[m], rc, res, snap_max_m)
                ends.append(e); snaps.append(d)
            row["snap_origem_m"], row["snap_destino_m"] = snaps
            if None in ends:
                rr = type("R", (), dict(found=False, path=[], cost=math.inf, length_m=math.inf, expanded=0,
                                         reason="extremo fora da grade ou longe de célula livre"))()
            else:
                rr = astar(pas[m], fac[m], ends[0], ends[1], res)
            routes[(a, b, m)] = rr
            row.update(encontrada=rr.found, motivo=rr.reason, expandidos=rr.expanded)
            la, lo = pois[a]; lb, lob = pois[b]
            row["reta_geodesica_m"] = haversine_m(la, lo, lb, lob)
            if rr.found:
                P = rr.path
                rc_ = tuple(zip(*P))
                sl, tr, zz, cl = terr.slope_deg[rc_], terr.tri_m[rc_], z[rc_], obs.clearance_m[rc_]
                dz = np.diff(zz)
                row.update(comprimento_m=rr.length_m, fator_desvio=rr.length_m / row["reta_geodesica_m"],
                           custo_do_modo=rr.cost, declividade_media=float(np.nanmean(sl)),
                           declividade_max=float(np.nanmax(sl)), tri_medio_m=float(np.nanmean(tr)),
                           folga_min_m=float(cl.min()), ganho_m=float(dz[dz > 0].sum()), perda_m=float(-dz[dz < 0].sum()))
                for m2 in modes:
                    row[f"custo_sob_{m2}"] = path_cost(P, fac[m2], res)
            rows.append(row)
    return {"rows": rows, "routes": routes, "factors": fac, "passable": pas, "rough_ref_m": ref}


def write_tables(rows, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    keys = sorted({k for r in rows for k in r}, key=lambda k: (k not in ("par", "modo", "encontrada"), k))
    with open(out / "comparacao_rotas.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, keys); w.writeheader(); w.writerows(rows)
    (out / "comparacao_rotas.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False, default=str))


def write_report(path: Path, ctx: dict):
    L = []
    if ctx.get("banner"):
        L += [f"> **{ctx['banner']}** Todos os números abaixo vêm de terreno SINTÉTICO de teste do pipeline.\n"]
    L += ["# Relatório - ARCÁDIA PLANITIA\n", "## 1. Convenção de coordenadas e estudo de referência"]
    cc = ctx["coord_check"]
    L += [f"- Estudo: {cc['study']['citation']} DOI {cc['study']['doi']}", f"- {cc['study']['note']}"]
    L += [f"- {n}" for n in cc["notes"]]
    L += ["\n| Ponto | lat (°N) | lon leste 0-360 | lon -180..180 | lon oeste | linha,coluna | elev. amostrada (m) |", "|---|---|---|---|---|---|---|"]
    for n, s in ctx["poi_samples"].items():
        L.append(f"| {n} | {s['lat']} | {s['lon_leste_0_360']:.2f} | {s['lon_leste_pm180']:.2f} | {s['lon_oeste_0_360']:.2f} | {s['row']},{s['col']} | {s['z_m'] if s['z_m'] is not None else 'n/d'} |")
    L += ["\n## 2. Dados e proveniência"] + [f"- `{json.dumps(p, ensure_ascii=False, default=str)[:600]}`" for p in ctx["provenance"]]
    L += ["\n## 3. Parâmetros", f"```json\n{json.dumps(ctx['params'], indent=2, ensure_ascii=False, default=str)}\n```",
          "\n## 4. Resultados (A*)", "| par | modo | ok | comp. (km) | desvio | decl. média/máx (°) | folga mín (m) | custo no modo |", "|---|---|---|---|---|---|---|---|"]
    for r in ctx["rows"]:
        if r.get("encontrada"):
            L.append(f"| {r['par']} | {r['modo']} | sim | {r['comprimento_m']/1e3:.2f} | {r['fator_desvio']:.3f} | {r['declividade_media']:.1f}/{r['declividade_max']:.1f} | {r['folga_min_m']:.0f} | {r['custo_do_modo']:.0f} |")
        else:
            L.append(f"| {r['par']} | {r['modo']} | NÃO | - | - | - | - | {r.get('motivo','')} |")
    L += ["\n## 5. Limitações (leia antes de usar)"] + [f"- {x}" for x in ctx["limitations"]]
    path.write_text("\n".join(L), encoding="utf-8")


# ---------------- rota entre dois pontos quaisquer (modo interativo) ----------------
def prepare_costs(terr, obs, modes=MODES):
    ref = float(np.nanpercentile(terr.tri_m, 95)) if np.isfinite(terr.tri_m).any() else 1.0
    rough_norm = np.clip(terr.tri_m / max(ref, 1e-6), 0, 3)
    return {"fac": {m: cost_factor(terr.slope_deg, rough_norm, obs.clearance_m, c) for m, c in modes.items()},
            "pas": {m: passable_mask(obs.blocked, terr.slope_deg, c) for m, c in modes.items()}}


def path_metrics(path, terr, obs, z, res):
    ix = tuple(zip(*path))
    dz = np.diff(z[ix])
    return {"declividade_media": float(np.nanmean(terr.slope_deg[ix])), "declividade_max": float(np.nanmax(terr.slope_deg[ix])),
            "tri_medio_m": float(np.nanmean(terr.tri_m[ix])), "folga_min_m": float(obs.clearance_m[ix].min()),
            "ganho_m": float(dz[dz > 0].sum()), "perda_m": float(-dz[dz < 0].sum())}


def route_between(prep, grid, terr, obs, origin, dest, modes=MODES, snap_max_m=2000.0):
    """origin/dest = (lat, lon_leste). Retorna {modo: {route, snaps, metrics, geodesic_m}}."""
    spec, out = grid.spec, {}
    for m in modes:
        ends, snaps = [], []
        for lat, lon in (origin, dest):
            r_c = spec.rc_of(lon, lat)
            e, d = snap_to_passable(prep["pas"][m], r_c, spec.res, snap_max_m) if spec.contains(*r_c) else (None, math.nan)
            ends.append(e); snaps.append(d)
        if None in ends:
            r = RouteResult(False, [], math.inf, math.inf, 0, "extremo fora do mapa ou longe de célula livre")
        else:
            r = astar(prep["pas"][m], prep["fac"][m], ends[0], ends[1], spec.res)
        out[m] = {"route": r, "snaps": snaps, "geodesic_m": haversine_m(origin[0], origin[1], dest[0], dest[1]),
                  "metrics": path_metrics(r.path, terr, obs, grid.z, spec.res) if r.found else None}
    return out
