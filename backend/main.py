"""ARCÁDIA PLANITIA - orquestrador.  Uso: python main.py --help"""
from __future__ import annotations
import argparse, json, platform, sys, time
from pathlib import Path
import numpy as np
import dem_processor as dp
import terrain_analyzer as ta
import obstacle_detection as od
import route_comparison as rc
import visualization as vz
from data_sources import CATALOG, STUDY, manual_instructions, try_download, append_provenance

LIMITATIONS = [
    "MOLA 463 m/pixel NÃO resolve obstáculos em escala de rover (rochas, pequenas crateras); declividade a 463 m subestima a inclinação local. Rotas são planejamento regional.",
    "CTX tem ~5-6 m/pixel: rochas individuais não são detectáveis. O critério de textura é heurístico (percentil da cena), sem validação contra mapeamento manual.",
    "Limites de declividade/rugosidade e pesos de custo são escolhas de projeto, não especificações de missão.",
    "Projeção equiretangular local: distorção métrica de ~1-2% dentro da AOI; comprimentos são aproximados.",
    "Latitude tratada como planetocêntrica (esfera). Se o estudo usar latitude planetográfica, há deslocamento de ~0,3° (~20 km) a 40°N - confirmar no artigo.",
    "Alturas MOLA são relativas ao areoide; HRSC pode ter outra referência vertical. Mescla HRSC+MOLA NÃO faz coregistro vertical (o viés na sobreposição é apenas reportado).",
    "Fontes secundárias (não o artigo) confirmam as coordenadas de AP-1 e AP-9; AP-8 (40.75N, 201.30E) NÃO foi confirmada. Verifique no artigo (DOI 10.1029/2024JE008724).",
]


def parse(argv=None):
    p = argparse.ArgumentParser(description="ARCÁDIA PLANITIA: A* multicritério sobre MOLA/HRSC/CTX")
    p.add_argument("--mola"); p.add_argument("--hrsc"); p.add_argument("--ctx")
    p.add_argument("--res", type=float, default=200.0, help="resolução da grade de análise (m)")
    p.add_argument("--buffer-deg", type=float, default=0.5)
    p.add_argument("--out", default="outputs")
    p.add_argument("--offline", action="store_true", help="não baixa o MOLA automaticamente")
    p.add_argument("--synthetic", action="store_true", help="terreno SINTÉTICO só para testar o pipeline")
    p.add_argument("--slope-limit", type=float, default=15.0)
    p.add_argument("--obstacle-buffer-m", type=float, default=0.0)
    p.add_argument("--interativo", action="store_true", help="abre o mapa; clique origem e destino e a rota é calculada")
    p.add_argument("--area", help="lon_min,lat_min,lon_max,lat_max (lon leste 0-360) da área do mapa interativo")
    p.add_argument("--vert-exag", type=float, default=5.0)
    return p.parse_args(argv)


def coordinate_check(pois):
    return {"study": STUDY, "pois": {n: dp.lon_conventions(lo) | {"lat": la} for n, (la, lo) in pois.items()},
            "notes": ["Convenção adotada: longitude LESTE 0-360, latitude planetocêntrica (igual a MOLA/USGS/HiRISE).",
                      "Conferir se AP-8 coincide com o artigo: só AP-1 e AP-9 foram achadas em fonte secundária."]}


def export_all(out, grid, terr, obs, cmp_, pois, banner):
    spec, notes = grid.spec, []
    arrays = {"elevacao_m": grid.z, "declividade_deg": terr.slope_deg, "orientacao_deg": terr.aspect_deg,
              "tri_m": terr.tri_m, "rms_m": terr.rms_m, "obstaculos_flags": obs.flags, "folga_m": obs.clearance_m}
    (out / "npy").mkdir(parents=True, exist_ok=True)
    for k, a in arrays.items():
        np.save(out / "npy" / f"{k}.npy", a)
    for m, f in cmp_["factors"].items():
        np.save(out / "npy" / f"fator_custo_{m}.npy", f.astype("float32"))
    np.savez(out / "npy" / "rotas_rc.npz", **{"|".join(k): np.array(v.path, dtype="int32") for k, v in cmp_["routes"].items() if v.found})
    try:
        for k, a in arrays.items():
            dp.save_geotiff(out / "geotiff" / f"{k}.tif", a, spec, nodata=(np.nan if a.dtype.kind == "f" else None),
                            tags={"synthetic": bool(banner), "layer": k})
    except ImportError:
        notes.append("GeoTIFF NÃO exportado: rasterio não instalado.")
    feats = [{"type": "Feature", "properties": {"nome": n, "lat": la, "lon_leste_0_360": lo},
              "geometry": {"type": "Point", "coordinates": [dp.lon_conventions(lo)["lon_leste_pm180"], la]}} for n, (la, lo) in pois.items()]
    for (a, b, m), r in cmp_["routes"].items():
        if r.found:
            rr, cc = map(np.array, zip(*r.path))
            lon, lat = spec.center_lonlat(rr, cc)
            feats.append({"type": "Feature", "properties": {"par": f"{a}->{b}", "modo": m, "comprimento_m": r.length_m, "custo": r.cost},
                          "geometry": {"type": "LineString", "coordinates": [[float(((x + 180) % 360) - 180), float(y)] for x, y in zip(lon, lat)]}})
    gj = {"type": "FeatureCollection", "features": feats,
          "properties": {"corpo": "Marte (NÃO é WGS84)", "coordenadas": "[lon leste -180..180, lat planetocêntrica]", "sintetico": bool(banner)}}
    (out / "rotas.geojson").write_text(json.dumps(gj, ensure_ascii=False))
    return notes


def main(argv=None) -> int:
    a = parse(argv)
    out, banner, pois = Path(a.out), "", dp.POIS
    ccheck = coordinate_check(pois)
    print(json.dumps(ccheck["pois"], indent=1))
    provs, ctx_std = [], None
    if a.synthetic:
        from synthetic_fixture import make_synthetic
        banner, out = "[SINTÉTICO - NÃO É MARTE] ", Path(str(a.out) + "_SINTETICO")
        grid = make_synthetic(a.res if a.res >= 300 else 500.0)
        provs.append(grid.provenance)
    else:
        try:
            import rasterio  # noqa: F401
        except ImportError:
            print("Instale as dependências: pip install -r requirements.txt"); return 3
        aoi = tuple(float(v) for v in a.area.split(",")) if a.area else dp.aoi_from_pois(pois, a.buffer_deg)
        if (aoi[2] - aoi[0]) * (aoi[3] - aoi[1]) * 45e3 * 59e3 / a.res ** 2 > 4e6:
            print("[AVISO] grade com mais de ~4 milhões de células: o A* ficará lento; aumente --res.")
        spec = dp.GridSpec.from_aoi(aoi, a.res)
        try:
            mola_path = a.mola
            if not mola_path:
                if a.offline:
                    raise RuntimeError("--offline sem --mola")
                m = CATALOG["mola"]
                local = Path(m.dest) / m.file
                if not local.exists():
                    print(f"Baixando MOLA (~2 GB) de {m.url} ... (pode demorar)")
                    rec = try_download(m)
                    append_provenance("data/provenance_downloads.json", rec)
                    if rec["status"] != "ok":
                        raise RuntimeError(f"download falhou: {rec.get('error')}")
                mola_path = str(local)
            mg = dp.read_raster_to_grid(mola_path, spec, "bilinear" if a.res < 463 else "average")
        except Exception as e:
            out.mkdir(parents=True, exist_ok=True)
            (out / "DATA_REQUIRED.md").write_text(f"Falha ao obter o MOLA: {type(e).__name__}: {e}\n\n" + manual_instructions(), encoding="utf-8")
            print(f"[ERRO] sem dados reais: {e}\nVeja {out/'DATA_REQUIRED.md'}. Nenhum resultado foi gerado."); return 2
        z, provs = mg.z, [mg.provenance]
        if a.hrsc:
            hg = dp.read_raster_to_grid(a.hrsc, spec, "bilinear")
            ov = np.isfinite(hg.z) & np.isfinite(z)
            hg.provenance["vies_hrsc_menos_mola_m"] = float(np.mean(hg.z[ov] - z[ov])) if ov.any() else None
            z = np.where(np.isfinite(hg.z), hg.z, z).astype("float32"); provs.append(hg.provenance)
        if a.ctx:
            _, ctx_std, cp = dp.read_ctx_texture(a.ctx, spec); provs.append(cp)
        grid = dp.DEMGrid(z, spec, {})
    spec = grid.spec
    samples = dp.sample_pois(grid.z, spec, pois)
    for n, s in samples.items():
        if not s["in_grid"] or s["z_m"] is None:
            print(f"[AVISO] {n}: fora da grade ou NoData")
        elif not a.synthetic and not (-5500 <= s["z_m"] <= -2500):
            print(f"[AVISO] {n}: elevação {s['z_m']:.0f} m fora da faixa heurística esperada (-5500..-2500) - verifique a convenção de longitude/arquivo")
    terr = ta.analyze(grid.z, spec.res)
    params = od.ObstacleParams(slope_limit_deg=a.slope_limit, buffer_m=a.obstacle_buffer_m)
    obs = od.detect(grid.z, terr.slope_deg, terr.tri_m, spec.res, params, ctx_std)
    if a.interativo:
        import interactive
        interactive.run(grid, terr, obs, pois, out, banner)
        return 0
    cmp_ = rc.run_comparison(grid, terr, obs, pois)
    out.mkdir(parents=True, exist_ok=True); (out / "maps").mkdir(exist_ok=True)
    sh = vz.hillshade(grid.z, spec.res)
    vz.plot_layer(grid.z, spec, "Elevação", out / "maps/elevacao.png", "terrain", "m", pois, sh, banner)
    vz.plot_layer(terr.slope_deg, spec, "Declividade", out / "maps/declividade.png", "magma", "°", pois, sh, banner)
    vz.plot_layer(terr.tri_m, spec, "Rugosidade (TRI)", out / "maps/rugosidade.png", "viridis", "m", pois, sh, banner)
    vz.plot_obstacles(obs.flags, spec, out / "maps/obstaculos.png", pois, banner)
    pairs = rc.PAIRS
    for p in pairs:
        vz.plot_routes(grid, obs.flags, cmp_["routes"], p, out / f"maps/rotas_{p[0]}_{p[1]}.png", pois, banner)
    vz.plot_3d(grid, cmp_["routes"], out / "maps/relevo_3d.png", pairs, vert_exag=a.vert_exag, banner=banner)
    notes = export_all(out, grid, terr, obs, cmp_, pois, banner)
    rc.write_tables(cmp_["rows"], out)
    prov = {"gerado_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "python": platform.python_version(),
            "numpy": np.__version__, "fontes": provs, "args": vars(a)}
    (out / "provenance.json").write_text(json.dumps(prov, indent=2, ensure_ascii=False, default=str))
    rc.write_report(out / "relatorio.md", {"banner": banner.strip(), "coord_check": ccheck, "poi_samples": samples, "provenance": provs,
                    "params": {"obstaculos": obs.params, "limiares": obs.thresholds, "res_m": spec.res, "modos": {k: vars(v) for k, v in rc.MODES.items()}},
                    "rows": cmp_["rows"], "limitations": LIMITATIONS + notes + (["Resultados SINTÉTICOS: não são medições de Marte."] if banner else [])})
    print("\n".join(f"{r['par']:11s} {r['modo']:16s} " + (f"{r['comprimento_m']/1e3:7.2f} km  decl.max {r['declividade_max']:5.1f}°" if r['encontrada'] else "SEM ROTA") for r in cmp_["rows"]))
    print(f"Saídas em {out}/"); return 0


if __name__ == "__main__":
    sys.exit(main())
