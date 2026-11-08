"""Leitura, reprojeção e exportação de rasters (Rasterio) para a grade de análise local.

- Projeção local: equiretangular com paralelo padrão no centro da AOI, esfera de Marte
  (R=3396190 m). Latitude PLANETOCÊNTRICA, longitude LESTE 0-360.
- NoData preservado como NaN (float32) em todo o pipeline.
- Rasterio é importado de forma tardia: o resto do pipeline roda sem ele.
"""
from __future__ import annotations
import math
from dataclasses import dataclass, field
from pathlib import Path
import numpy as np
from data_sources import sha256_file

MARS_RADIUS_M = 3396190.0
POIS = {"AP-1": (39.80, 202.10), "AP-8": (40.75, 201.30), "AP-9": (40.02, 203.35)}  # (lat, lon_leste)


def lon_conventions(lon: float) -> dict:
    l = lon % 360.0
    return {"lon_leste_0_360": l, "lon_leste_pm180": ((l + 180.0) % 360.0) - 180.0,
            "lon_oeste_0_360": (360.0 - l) % 360.0}


@dataclass(frozen=True)
class LocalProjection:
    lat_ts: float
    lon0: float
    radius: float = MARS_RADIUS_M

    def proj4(self) -> str:
        return (f"+proj=eqc +lat_ts={self.lat_ts} +lat_0=0 +lon_0={self.lon0} +x_0=0 +y_0=0 "
                f"+a={self.radius} +b={self.radius} +units=m +no_defs")

    def forward(self, lat, lon):
        dlon = ((np.asarray(lon, float) - self.lon0 + 180.0) % 360.0) - 180.0
        return (self.radius * np.radians(dlon) * math.cos(math.radians(self.lat_ts)),
                self.radius * np.radians(np.asarray(lat, float)))

    def inverse(self, x, y):
        lat = np.degrees(np.asarray(y, float) / self.radius)
        lon = self.lon0 + np.degrees(np.asarray(x, float) / (self.radius * math.cos(math.radians(self.lat_ts))))
        return lat, lon % 360.0


@dataclass(frozen=True)
class GridSpec:
    aoi: tuple          # (lon_min, lat_min, lon_max, lat_max), lon leste 0-360
    proj: LocalProjection
    x0: float           # borda esquerda (m)
    y0: float           # borda superior (m)
    width: int
    height: int
    res: float

    @classmethod
    def from_aoi(cls, aoi, res: float) -> "GridSpec":
        lon_min, lat_min, lon_max, lat_max = aoi
        proj = LocalProjection((lat_min + lat_max) / 2, (lon_min + lon_max) / 2)
        xs, ys = proj.forward([lat_min, lat_min, lat_max, lat_max], [lon_min, lon_max, lon_min, lon_max])
        x0 = math.floor(xs.min() / res) * res
        y0 = math.ceil(ys.max() / res) * res
        return cls(tuple(aoi), proj, x0, y0, int(math.ceil((xs.max() - x0) / res)),
                   int(math.ceil((y0 - ys.min()) / res)), float(res))

    @property
    def shape(self):
        return (self.height, self.width)

    def transform(self):
        from rasterio.transform import from_origin
        return from_origin(self.x0, self.y0, self.res, self.res)

    def rc_of(self, lon, lat):
        x, y = self.proj.forward(lat, lon)
        return int(math.floor((self.y0 - float(y)) / self.res)), int(math.floor((float(x) - self.x0) / self.res))

    def center_lonlat(self, row, col):
        x = self.x0 + (np.asarray(col) + 0.5) * self.res
        y = self.y0 - (np.asarray(row) + 0.5) * self.res
        lat, lon = self.proj.inverse(x, y)
        return lon, lat

    def extent_lonlat(self):
        """(lon_esq, lon_dir, lat_baixo, lat_cima) - exato, pois lon e lat são lineares em x e y."""
        _, lon_l = self.proj.inverse(self.x0, 0.0)
        _, lon_r = self.proj.inverse(self.x0 + self.width * self.res, 0.0)
        lat_b, _ = self.proj.inverse(0.0, self.y0 - self.height * self.res)
        lat_t, _ = self.proj.inverse(0.0, self.y0)
        return float(lon_l), float(lon_r), float(lat_b), float(lat_t)

    def contains(self, row, col):
        return 0 <= row < self.height and 0 <= col < self.width


@dataclass
class DEMGrid:
    z: np.ndarray                      # float32, NaN = NoData
    spec: GridSpec
    provenance: dict = field(default_factory=dict)


def aoi_from_pois(pois: dict, buffer_deg: float = 0.5):
    lats = [p[0] for p in pois.values()]
    lons = [p[1] for p in pois.values()]
    return (min(lons) - buffer_deg, min(lats) - buffer_deg, max(lons) + buffer_deg, max(lats) + buffer_deg)


def sample_pois(z: np.ndarray, spec: GridSpec, pois: dict) -> dict:
    out = {}
    for name, (lat, lon) in pois.items():
        r, c = spec.rc_of(lon, lat)
        ins = spec.contains(r, c)
        out[name] = {"lat": lat, **lon_conventions(lon), "row": r, "col": c, "in_grid": ins,
                     "z_m": float(z[r, c]) if ins and np.isfinite(z[r, c]) else None}
    return out


# ----------------------------- Rasterio ------------------------------------
def remote_env():
    import rasterio
    return rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.tiff",
                        GDAL_HTTP_TIMEOUT="30", GDAL_HTTP_MAX_RETRY="2")


def window_for_aoi(src, spec: GridSpec, margin_px: int = 4):
    """Janela do raster de origem que cobre a AOI; testa convenção de longitude (0-360 / -180..180)."""
    from rasterio.crs import CRS
    from rasterio.warp import transform as wt
    from rasterio.windows import Window, from_bounds
    lon_min, lat_min, lon_max, lat_max = spec.aoi
    LON, LAT = np.meshgrid(np.linspace(lon_min, lon_max, 25), np.linspace(lat_min, lat_max, 25))
    geo = CRS.from_proj4(f"+proj=longlat +a={MARS_RADIUS_M} +b={MARS_RADIUS_M} +no_defs")
    b = src.bounds
    for shift in (0.0, -360.0, 360.0):
        xs, ys = wt(geo, src.crs, (LON + shift).ravel().tolist(), LAT.ravel().tolist())
        xs, ys = np.asarray(xs), np.asarray(ys)
        if np.isfinite(xs).all() and np.isfinite(ys).all() and xs.min() >= b.left and xs.max() <= b.right \
                and ys.min() >= b.bottom and ys.max() <= b.top:
            w = from_bounds(xs.min(), ys.min(), xs.max(), ys.max(), transform=src.transform)
            w = Window(int(math.floor(w.col_off)) - margin_px, int(math.floor(w.row_off)) - margin_px,
                       int(math.ceil(w.width)) + 2 * margin_px, int(math.ceil(w.height)) + 2 * margin_px)
            return w.intersection(Window(0, 0, src.width, src.height))
    raise ValueError("AOI fora da cobertura do raster (testadas as convenções de longitude 0-360 e -180..180).")


def reproject_array_to_grid(arr, src_transform, src_crs, spec: GridSpec, resampling: str = "bilinear"):
    from rasterio.crs import CRS
    from rasterio.warp import Resampling, reproject
    dst = np.full(spec.shape, np.nan, dtype="float32")
    reproject(source=np.asarray(arr, "float32"), destination=dst, src_transform=src_transform, src_crs=src_crs,
              dst_transform=spec.transform(), dst_crs=CRS.from_proj4(spec.proj.proj4()),
              src_nodata=np.nan, dst_nodata=np.nan, resampling=Resampling[resampling])
    return dst


def describe_source(src, win, path, hash_file=True) -> dict:
    p = Path(str(path))
    d = {"path": str(path), "crs_wkt": src.crs.to_wkt() if src.crs else None, "res": list(src.res),
         "bounds": list(src.bounds), "nodata": src.nodata, "dtype": src.dtypes[0],
         "window": [win.col_off, win.row_off, win.width, win.height]}
    if hash_file and p.exists() and p.stat().st_size < 6e9:
        d["sha256"] = sha256_file(p)
    return d


def read_raster_to_grid(path, spec: GridSpec, resampling="bilinear", band=1, extra_nodata=(), hash_file=True) -> DEMGrid:
    import rasterio
    with rasterio.open(path) as src:
        win = window_for_aoi(src, spec)
        data = src.read(band, window=win, masked=True).astype("float32").filled(np.nan)
        for v in extra_nodata:
            data[np.isclose(data, v)] = np.nan
        z = reproject_array_to_grid(data, src.window_transform(win), src.crs, spec, resampling)
        prov = describe_source(src, win, path, hash_file)
    prov.update({"resampling": resampling, "target_res_m": spec.res, "target_proj4": spec.proj.proj4()})
    return DEMGrid(z, spec, prov)


def read_ctx_texture(path, spec: GridSpec, max_pix: int = 6000):
    """Média e desvio-padrão local (3x3) do DN da CTX, reamostrados para a grade de análise.
    A leitura é decimada (média) para no máx. `max_pix` px por lado: define a resolução efetiva."""
    import rasterio
    from rasterio import Affine
    from rasterio.enums import Resampling
    from terrain_analyzer import nan_uniform_filter
    with rasterio.open(path) as src:
        win = window_for_aoi(src, spec)
        sc = max(1.0, max(win.width, win.height) / max_pix)
        oh, ow = max(1, int(win.height / sc)), max(1, int(win.width / sc))
        a = src.read(1, window=win, out_shape=(oh, ow), masked=True, resampling=Resampling.average)
        a = a.astype("float32").filled(np.nan)
        tr = src.window_transform(win) * Affine.scale(win.width / ow, win.height / oh)
        m1, m2 = nan_uniform_filter(a, 3), nan_uniform_filter(a * a, 3)
        std = np.sqrt(np.clip(m2 - m1 * m1, 0, None))
        mean_g = reproject_array_to_grid(a, tr, src.crs, spec, "average")
        std_g = reproject_array_to_grid(std, tr, src.crs, spec, "average")
        prov = describe_source(src, win, path)
    prov.update({"decimation_factor": sc, "effective_res_m": float(src.res[0] * sc)})
    return mean_g, std_g, prov


def save_geotiff(path, arr, spec: GridSpec, nodata=None, tags=None):
    import rasterio
    from rasterio.crs import CRS
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    arr = np.asarray(arr)
    with rasterio.open(path, "w", driver="GTiff", height=arr.shape[0], width=arr.shape[1], count=1,
                       dtype=str(arr.dtype), crs=CRS.from_proj4(spec.proj.proj4()), transform=spec.transform(),
                       nodata=nodata, compress="deflate") as dst:
        dst.write(arr, 1)
        if tags:
            dst.update_tags(**{k: str(v) for k, v in tags.items()})
