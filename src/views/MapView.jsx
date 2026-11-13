import React, { useEffect, useState } from 'react';
import {
    MapContainer, TileLayer, ImageOverlay, Marker, Polyline, Rectangle, Pane, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { STUDY_AREA, CANDIDATE_SITES, FILTER_BY_ID, LAYER_BY_ID, FALLBACK_BASEMAP, ROUTE_MODES } from '../config/mapConfig';
import { MOCK_POINTS } from '../mock/points';
import MapLegend from '../components/MapLegend';
import { RegionalCard, PendingCard } from '../components/MapNotice';

// Longitude sempre exibida como leste 0–360°
const normalizeLon = (lon) => ((lon % 360) + 360) % 360;

// Limite de navegação: um pouco maior que a área, para não se perder no planeta
const MAX_BOUNDS = [
  [STUDY_AREA.bounds[0][0] - 3, STUDY_AREA.bounds[0][1] - 4],
  [STUDY_AREA.bounds[1][0] + 3, STUDY_AREA.bounds[1][1] + 4],
];

// ---------- Ícones ----------
const iconCache = new Map();

const pointIcon = (color, selected) => {
  const key = `p${color}${selected}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, L.divIcon({
      className: '',
      html: `<span class="ares-marker${selected ? ' is-selected' : ''}" style="--c:${color}"><span></span></span>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }));
  }
  return iconCache.get(key);
};

const siteIcon = (name, selected) => {
  const key = `s${name}${selected}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, L.divIcon({
      className: '',
      html: `<span class="ares-site${selected ? ' is-selected' : ''}"><i></i><b>${name}</b></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }));
  }
  return iconCache.get(key);
};
// Marcador de origem (A) e destino (B) da rota
const endpointIcon = (letter, color) => {
  const key = `e${letter}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, L.divIcon({
      className: '',
      html: `<span class="ares-endpoint" style="--c:${color}">${letter}</span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }));
  }
  return iconCache.get(key);
};

// ---------- Componentes auxiliares (precisam estar dentro do MapContainer) ----------
function MapEvents({ onCursor, onMapClick }) {
  useMapEvents({
    mousemove: (e) => onCursor(e.latlng),
    mouseout: () => onCursor(null),
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

function FitStudyArea() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(STUDY_AREA.bounds, { padding: [40, 40] });
    }, 50);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ---------- Mapa ----------
export default function MapView({
  activeFilters, activeLayers, manifest, selectedId, onSelectPoint,
  routeOrigin, routeDest, routeData, hiddenModes = {}, isPicking = false,
}) {
  const [cursor, setCursor] = useState(null);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const activeIds = Object.keys(activeFilters).filter((id) => activeFilters[id]);
  const visiblePoints = MOCK_POINTS.filter((p) => activeFilters[p.filter]);
  // Só camadas com imagem viram desenho no mapa (valores regionais não têm imagem)
  const visibleRasters = manifest.layers.filter((l) => activeLayers[l.id] && l.url);
  // O subfiltro ligado e o que existe de dado para ele
  const activeId = Object.keys(activeLayers).find((id) => activeLayers[id]);
  const activeEntry = manifest.layers.find((l) => l.id === activeId);
  const hasBase = Boolean(manifest.base);

  const handleMapClick = (latlng) => {
    onSelectPoint?.({
      kind: 'coord',
      id: `coord-${latlng.lat.toFixed(4)}-${latlng.lng.toFixed(4)}`,
      lat: latlng.lat,
      lon: normalizeLon(latlng.lng),
      activeFilters: activeIds,
    });
  };

  // HUD: posição do cursor, ou o centro da área se o mouse estiver fora
  const hudLat = cursor ? cursor.lat : (STUDY_AREA.bounds[0][0] + STUDY_AREA.bounds[1][0]) / 2;
  const hudLon = cursor ? cursor.lng : (STUDY_AREA.bounds[0][1] + STUDY_AREA.bounds[1][1]) / 2;

  return (
    <div className="w-full h-full relative bg-[#0c0806]">
      <MapContainer
        bounds={STUDY_AREA.bounds}
        boundsOptions={{ padding: [40, 40] }}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.8}
        minZoom={6}
        zoomSnap={0.25}
        maxZoom={13}
        scrollWheelZoom
        zoomControl={false}
        className={`ares-map w-full h-full z-0 cursor-crosshair ${isPicking ? 'is-picking' : ''}`}
      >
        <FitStudyArea />
        <MapEvents onCursor={setCursor} onMapClick={handleMapClick} />

        {/* 1. Fundo: relevo real, se já exportado; senão, basemap de reserva */}
        <Pane name="ares-base" style={{ zIndex: 200 }}>
          {hasBase ? (
            <ImageOverlay
              url={manifest.base.url}
              bounds={manifest.base.bounds}
              opacity={manifest.base.opacity ?? 1}
            />
          ) : (
            <TileLayer
              url={FALLBACK_BASEMAP.url}
              attribution={FALLBACK_BASEMAP.attribution}
              maxNativeZoom={FALLBACK_BASEMAP.maxNativeZoom}
              eventHandlers={{ tileerror: () => setFallbackFailed(true) }}
            />
          )}
        </Pane>

        {/* 2. Camadas científicas: várias podem estar ligadas ao mesmo tempo */}
        <Pane name="ares-science" style={{ zIndex: 350 }}>
          {visibleRasters.map((layer) => (
            <ImageOverlay key={layer.id} url={layer.url} bounds={layer.bounds} opacity={layer.opacity ?? 0.6} />
          ))}
        </Pane>

        {/* 3. Contorno da área de estudo */}
        <Pane name="ares-outline" style={{ zIndex: 450, pointerEvents: 'none' }}>
          <Rectangle
            bounds={STUDY_AREA.bounds}
            interactive={false}
            pathOptions={{ color: '#f59e0b', weight: 1, dashArray: '6 6', fill: false, opacity: 0.7 }}
          />
        </Pane>
        {/* Rotas calculadas */}
        <Pane name="ares-routes" style={{ zIndex: 500 }}>
          {routeData?.rotas
            .filter((r) => r.encontrada && !hiddenModes[r.modo])
            .map((r) => {
              const mode = ROUTE_MODES.find((m) => m.id === r.modo);
              return (
                <React.Fragment key={r.modo}>
                  {/* contorno escuro: deixa a linha legível sobre qualquer camada */}
                  <Polyline positions={r.pontos} interactive={false} pathOptions={{ color: '#09090b', weight: 6, opacity: 0.55 }} />
                  <Polyline
                    positions={r.pontos}
                    interactive={false}
                    pathOptions={{ color: mode?.color || '#fff', weight: 3, dashArray: mode?.dash || null }}
                  />
                </React.Fragment>
              );
            })}
        </Pane>

        {/* Origem e destino */}
        {routeOrigin && <Marker position={[routeOrigin.lat, routeOrigin.lon]} icon={endpointIcon('A', '#a3e635')} interactive={false} />}
        {routeDest && <Marker position={[routeDest.lat, routeDest.lon]} icon={endpointIcon('B', '#f43f5e')} interactive={false} />}
        {/* 4. Locais candidatos: sempre visíveis */}
        {CANDIDATE_SITES.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lon]}
            icon={siteIcon(site.name, selectedId === site.id)}
            eventHandlers={{ click: () => onSelectPoint?.({ kind: 'site', ...site }) }}
          />
        ))}

        {/* 5. Pontos dos filtros ligados */}
        {visiblePoints.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lon]}
            icon={pointIcon(FILTER_BY_ID[p.filter].color, selectedId === p.id)}
            eventHandlers={{ click: () => onSelectPoint?.({ kind: 'point', ...p }) }}
          />
        ))}
      </MapContainer>

      {/* HUD de coordenadas */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 px-4 py-1.5 rounded-full text-[10px] font-mono text-zinc-400 tracking-wider flex items-center gap-3 whitespace-nowrap">
        <span className="hidden sm:inline">ARCADIA PLANITIA</span>
        <span className="text-zinc-600 hidden sm:inline">|</span>
        <span>LAT <strong className="text-white tabular-nums">{hudLat.toFixed(3)}°N</strong></span>
        <span className="text-zinc-600">|</span>
        <span>LON <strong className="text-white tabular-nums">{normalizeLon(hudLon).toFixed(3)}°E</strong></span>
      </div>
      {/* Abaixo do HUD: legenda da camada, valor regional ou aviso de "em preparação" */}
      {activeId && manifest.status !== 'loading' && (
        <div className="absolute top-[7.5rem] left-1/2 -translate-x-1/2 z-10">
          {activeEntry?.url && <MapLegend layer={activeEntry} />}
          {activeEntry?.regional && <RegionalCard layer={activeEntry} />}
          {!activeEntry && <PendingCard layer={LAYER_BY_ID[activeId]} />}
        </div>
      )}
      {/* Aviso enquanto o relevo da área não foi exportado */}
      {manifest.status !== 'loading' && !hasBase && (
        <div className="absolute top-[7.5rem] left-1/2 -translate-x-1/2 z-10 pointer-events-none max-w-[90%] text-center text-[10px] text-amber-300/90 bg-zinc-950/80 border border-amber-500/30 rounded px-3 py-1">
          {fallbackFailed
            ? 'Mapa base indisponível. A equipe de dados precisa exportar o relevo da área.'
            : 'Mapa base global provisório. O relevo detalhado da área ainda não foi exportado.'}
        </div>
      )}
    </div>
  );
}