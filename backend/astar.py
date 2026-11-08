"""A* multicritério em grade, 8 direções, sem corte diagonal entre obstáculos.

Custo de aresta = passo(m) * média(fator[origem], fator[destino]);  fator >= 1 =
1 + w_slope*(declividade/ref)^2 + w_rough*rugosidade_norm + w_clear*(penalidade de proximidade)^2.
Heurística: distância octil * res * min(1, fator_min)  -> admissível e consistente.
"""
from __future__ import annotations
import heapq, math
from dataclasses import dataclass
import numpy as np

SQRT2 = math.sqrt(2.0)
_N8 = ((-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
       (-1, -1, SQRT2), (-1, 1, SQRT2), (1, -1, SQRT2), (1, 1, SQRT2))


@dataclass(frozen=True)
class CostConfig:
    name: str
    w_slope: float = 0.0
    w_rough: float = 0.0
    w_clear: float = 0.0
    slope_ref_deg: float = 15.0
    clearance_ref_m: float = 1000.0
    slope_limit_deg: float | None = None     # limite duro adicional deste modo


def cost_factor(slope, rough_norm, clearance_m, cfg: CostConfig):
    s = np.nan_to_num(slope, nan=0.0) / cfg.slope_ref_deg
    r = np.nan_to_num(rough_norm, nan=0.0)
    c = np.clip((cfg.clearance_ref_m - clearance_m) / cfg.clearance_ref_m, 0.0, None)
    return (1.0 + cfg.w_slope * s ** 2 + cfg.w_rough * r + cfg.w_clear * c ** 2).astype("float64")


def passable_mask(blocked, slope, cfg: CostConfig):
    m = (~blocked) & np.isfinite(slope)
    if cfg.slope_limit_deg is not None:
        m &= np.nan_to_num(slope, nan=1e9) <= cfg.slope_limit_deg
    return m


@dataclass
class RouteResult:
    found: bool
    path: list
    cost: float
    length_m: float
    expanded: int
    reason: str = ""


def path_length_m(path, res):
    return sum((SQRT2 if (a[0] != b[0] and a[1] != b[1]) else 1.0) * res for a, b in zip(path, path[1:]))


def path_cost(path, factor, res):
    t = 0.0
    for a, b in zip(path, path[1:]):
        step = SQRT2 if (a[0] != b[0] and a[1] != b[1]) else 1.0
        t += step * res * 0.5 * (factor[a] + factor[b])
    return float(t)


def astar(passable, factor, start, goal, res, heuristic_weight=1.0, allow_diagonal=True) -> RouteResult:
    H, W = passable.shape
    if not (passable[start] and passable[goal]):
        return RouteResult(False, [], math.inf, math.inf, 0, "início ou destino bloqueado")
    fmin = min(1.0, float(factor[passable].min()))
    hw = heuristic_weight * fmin * res
    pas, fac = passable.ravel().tolist(), factor.ravel().tolist()
    N = H * W
    g, parent, closed = [math.inf] * N, [-1] * N, bytearray(N)
    s, t = start[0] * W + start[1], goal[0] * W + goal[1]
    tr, tc = goal
    nb = _N8 if allow_diagonal else _N8[:4]
    g[s] = 0.0
    heap = [(hw * (max(abs(start[0] - tr), abs(start[1] - tc)) + (SQRT2 - 1) * min(abs(start[0] - tr), abs(start[1] - tc))), 0, s)]
    cnt, expanded = 0, 0
    while heap:
        _, _, u = heapq.heappop(heap)
        if closed[u]:
            continue
        closed[u] = 1
        expanded += 1
        if u == t:
            break
        ur, uc = divmod(u, W)
        for dr, dc, step in nb:
            r, c = ur + dr, uc + dc
            if r < 0 or r >= H or c < 0 or c >= W:
                continue
            v = r * W + c
            if not pas[v] or closed[v]:
                continue
            if dr and dc and not (pas[ur * W + c] and pas[r * W + uc]):   # sem corte de quina
                continue
            ng = g[u] + step * res * 0.5 * (fac[u] + fac[v])
            if ng < g[v]:
                g[v], parent[v] = ng, u
                dx, dy = abs(r - tr), abs(c - tc)
                cnt += 1
                heapq.heappush(heap, (ng + hw * (max(dx, dy) + (SQRT2 - 1) * min(dx, dy)), cnt, v))
    if g[t] == math.inf:
        return RouteResult(False, [], math.inf, math.inf, expanded, "sem caminho entre as regiões livres")
    path, u = [], t
    while u != -1:
        path.append(divmod(u, W))
        u = parent[u]
    path.reverse()
    return RouteResult(True, path, g[t], path_length_m(path, res), expanded)
