import math, numpy as np, pytest
from astar import astar, cost_factor, CostConfig, SQRT2
import terrain_analyzer as ta
import obstacle_detection as od
import dem_processor as dp


def test_lon_conventions():
    c = dp.lon_conventions(202.10)
    assert c["lon_leste_pm180"] == pytest.approx(-157.90) and c["lon_oeste_0_360"] == pytest.approx(157.90)


def test_projection_roundtrip():
    spec = dp.GridSpec.from_aoi(dp.aoi_from_pois(dp.POIS, 0.5), 200.0)
    for lat, lon in dp.POIS.values():
        x, y = spec.proj.forward(lat, lon)
        la, lo = spec.proj.inverse(x, y)
        assert la == pytest.approx(lat) and lo == pytest.approx(lon)
        r, c = spec.rc_of(lon, lat)
        assert spec.contains(r, c)


def test_astar_matches_dijkstra_and_is_admissible():
    rng = np.random.default_rng(1)
    for _ in range(5):
        pas = rng.random((30, 30)) > 0.2
        pas[0, 0] = pas[-1, -1] = True
        fac = 1 + 3 * rng.random((30, 30))
        a = astar(pas, fac, (0, 0), (29, 29), 10.0)
        d = astar(pas, fac, (0, 0), (29, 29), 10.0, heuristic_weight=0.0)
        assert a.found == d.found
        if a.found:
            assert a.cost == pytest.approx(d.cost) and a.expanded <= d.expanded


def test_no_corner_cutting_and_blocked():
    pas = np.ones((3, 3), bool); pas[0, 1] = False; pas[1, 0] = False
    assert not astar(pas, np.ones((3, 3)), (0, 0), (2, 2), 1.0).found     # só sairia cortando a quina
    pas2 = np.ones((5, 5), bool); pas2[2, :] = False
    assert not astar(pas2, np.ones((5, 5)), (0, 0), (4, 4), 1.0).found
    assert astar(np.ones((5, 5), bool), np.ones((5, 5)), (0, 0), (4, 4), 1.0).length_m == pytest.approx(4 * SQRT2)


def test_slope_aspect_plane():
    res = 100.0
    x = np.arange(40) * res
    z = np.tile(-math.tan(math.radians(10)) * x, (40, 1)).astype("float32")   # desce para leste
    s, a = ta.slope_aspect(z, res)
    assert np.nanmean(s[2:-2, 2:-2]) == pytest.approx(10.0, abs=0.05)
    assert np.nanmean(a[2:-2, 2:-2]) == pytest.approx(90.0, abs=0.1)


def test_nodata_propagates():
    z = np.zeros((9, 9), "float32"); z[4, 4] = np.nan
    s, _ = ta.slope_aspect(z, 1.0)
    assert np.isnan(s[3:6, 3:6]).all() and np.isfinite(s[0, 0])
    assert np.isnan(ta.tri(z)[4, 4])


def test_obstacles_depression_slope_buffer():
    z = np.zeros((40, 40), "float32"); z[20:23, 20:23] -= 50
    z[:, 30:] += np.arange(10) * 100.0   # rampa íngreme
    t = ta.analyze(z, 10.0)
    p = od.ObstacleParams(rough_percentile=None, depression_depth_m=20, buffer_m=30)
    o = od.detect(z, t.slope_deg, t.tri_m, 10.0, p)
    assert o.flags[21, 21] & od.DEPRESSION and o.flags[10, 35] & od.SLOPE
    assert (o.flags & od.BUFFER).any() and o.blocked.sum() > ((o.flags & 31) > 0).sum()


def test_full_pipeline_synthetic_respects_constraints():
    from synthetic_fixture import make_synthetic
    import route_comparison as rc
    g = make_synthetic()
    t = ta.analyze(g.z, g.spec.res)
    o = od.detect(g.z, t.slope_deg, t.tri_m, g.spec.res, od.ObstacleParams())
    cmp_ = rc.run_comparison(g, t, o, dp.POIS)
    assert len(cmp_["rows"]) == 9
    for (a, b, m), r in cmp_["routes"].items():
        if r.found:
            assert all(cmp_["passable"][m][p] for p in r.path)          # nunca pisa em célula bloqueada
            assert r.cost >= r.length_m * 0.999                          # fator >= 1
    sd = {m: cmp_["routes"][("AP-1", "AP-8", m)] for m in rc.MODES}
    if all(r.found for r in sd.values()):
        assert sd["menor_distancia"].length_m <= min(r.length_m for r in sd.values()) + 1e-6


def test_rasterio_reprojection_recovers_known_surface(tmp_path):
    rio = pytest.importorskip("rasterio")
    from rasterio.crs import CRS
    from rasterio.transform import from_origin
    crs = CRS.from_proj4(f"+proj=longlat +a={dp.MARS_RADIUS_M} +b={dp.MARS_RADIUS_M} +no_defs")
    lon0, lat0, step = 195.0, 45.0, 0.01
    cols, rows = 1500, 1000
    lons = lon0 + (np.arange(cols) + .5) * step; lats = lat0 - (np.arange(rows) + .5) * step
    arr = (-4000 + 10 * (lons[None, :] - 200) + 20 * (lats[:, None] - 40)).astype("float32")
    p = tmp_path / "t.tif"
    with rio.open(p, "w", driver="GTiff", height=rows, width=cols, count=1, dtype="float32", crs=crs,
                  transform=from_origin(lon0, lat0, step, step), nodata=-9999.0) as d:
        d.write(arr, 1)
    spec = dp.GridSpec.from_aoi(dp.aoi_from_pois(dp.POIS, 0.5), 300.0)
    g = dp.read_raster_to_grid(p, spec)
    for n, s in dp.sample_pois(g.z, spec, dp.POIS).items():
        lat, lon = dp.POIS[n]
        assert s["z_m"] == pytest.approx(-4000 + 10 * (lon - 200) + 20 * (lat - 40), abs=2.0)


def test_interactive_selector_headless():
    from synthetic_fixture import make_synthetic
    import route_comparison as rc
    from interactive import RouteSelector
    g = make_synthetic(); t = ta.analyze(g.z, g.spec.res)
    o = od.detect(g.z, t.slope_deg, t.tri_m, g.spec.res, od.ObstacleParams())
    s = RouteSelector(g, t, o, dp.POIS)
    s.click(202.10, 39.80); assert len(s.points) == 1 and not s.results
    s.click(203.35, 40.02); assert set(s.results) == set(rc.MODES)
    assert all(d["route"].found for d in s.results.values())
    s.click(201.5, 40.0); assert len(s.points) == 1 and not s.results      # 3º clique recomeça
    s.click(0.0, 0.0); assert "fora do mapa" in s.message                  # clique fora é recusado



# ---------------- figure_to_data: figura de mapa global -> valores ----------------
def _fake_figure(tmp_path, values):
    """Figura sintética: fundo branco, mapa 2:1 colorido pela paleta 'turbo' e barra de cores embaixo."""
    from matplotlib import colormaps
    from PIL import Image
    cmap = colormaps["turbo"]
    H, W = values.shape
    img = np.full((H + 120, W + 80, 3), 255, np.uint8)
    img[30:30 + H, 40:40 + W] = (cmap(values)[..., :3] * 255).astype(np.uint8)
    bar = (cmap(np.linspace(0, 1, 300))[:, :3] * 255).astype(np.uint8)
    img[H + 60:H + 90, 60:360] = bar[None, :, :]
    path = tmp_path / "fig.png"
    Image.fromarray(img).save(path)
    return path


def test_figure_to_data_reads_values_and_geometry(tmp_path):
    import figure_to_data as ftd
    vals = np.tile(np.linspace(0.05, 0.95, 360), (180, 1))      # cresce de oeste para leste
    data, t = ftd.figure_to_array(_fake_figure(tmp_path, vals), 0.0, 20.0)
    assert data.shape == (180, 360)
    assert t.a == pytest.approx(1.0) and t.c == pytest.approx(-180.0) and t.f == pytest.approx(90.0)
    assert np.nanmax(np.abs(data - vals * 20.0)) < 0.05 * 20.0   # erro < 5% da escala


def test_figure_to_data_gray_is_nodata():
    import figure_to_data as ftd
    lut = ftd.HueLUT.from_matplotlib("turbo")
    out = lut(np.array([[[128, 128, 128], [200, 200, 200]]], np.uint8))
    assert np.isnan(out).all()
