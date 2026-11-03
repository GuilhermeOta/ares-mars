import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para os ícones padrão do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone customizado em estilo HUD/Nasa para os marcadores de telemetria
const createHudIcon = (color = '#f59e0b') => {
  return L.divIcon({
    className: 'custom-hud-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background-color: ${color}20;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 12px ${color}aa;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background-color: ${color}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

// Coordenadas simuladas para Arcadia Planitia (~39.3°N, 189.7°E)
const ARCADIA_CENTER = [39.3, -170.3];

// Dados simulados de pontos científicos para testar os filtros
const MOCK_POINTS = {
  agua: [
    { id: 1, lat: 39.5, lng: -170.1, title: 'Reserva SWIM-Alpha', desc: 'Gelo subterrâneo a ~1.2m de profundidade.', alt: 'Plano de Baixa Elevação' },
    { id: 2, lat: 38.9, lng: -171.2, title: 'Camada de Gelo SHARAD-04', desc: 'Sinal de radar indica purificação de gelo >85%.', alt: 'Borda da Bacia' }
  ],
  geologia: [
    { id: 3, lat: 39.8, lng: -169.5, title: 'Formação Vulcânica Fluvial', desc: 'Depósitos de basalto oleoso e minerais de argila.', alt: 'Planalto Liso' },
    { id: 4, lat: 38.6, lng: -170.8, title: 'Cratera de Impacto Secundário', desc: 'Ejetos ricos em filosilicatos.', alt: 'Depressão' }
  ],
  radiacao: [
    { id: 5, lat: 39.2, lng: -170.5, title: 'Zona RAD-Safe 01', desc: 'Exposição estimada: 220 mSv/ano (Abaixo da média).', alt: 'Área Protegida por Relevo' }
  ],
  ventos: [
    { id: 6, lat: 39.6, lng: -171.0, title: 'Estação de Monitoramento DUST-X', desc: 'Vento regular de NE a 14 m/s. Acúmulo de poeira baixo.', alt: 'Planície Aberta' }
  ]
};

// Componente para redefinir a visão do mapa suavemente ao mudar de setor
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
}

export default function MapView({ activeFilter, onSelectPoint }) {
  const currentPoints = MOCK_POINTS[activeFilter] || [];

  return (
    <div className="w-full h-full relative bg-[#030303] animate-fade-in">
      {/* Container Principal do Leaflet */}
      <MapContainer 
        center={ARCADIA_CENTER} 
        zoom={7} 
        scrollWheelZoom={true}
        className="w-full h-full z-0 cursor-crosshair"
        zoomControl={false}
      >
        <MapController center={ARCADIA_CENTER} />

        {/* Camada de Mapa Base (Simulando terreno marciano com filtro de cor no CSS) */}
        <TileLayer
          attribution='&copy; NASA / USGS / CartoDB'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="filter contrast-125 brightness-90 hue-rotate-[330deg] sepia-[0.8]"
        />

        {/* Marcadores de Pontos Científicos conforme o Filtro Ativo */}
        {currentPoints.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]}
            icon={createHudIcon(activeFilter === 'agua' ? '#f59e0b' : '#eab308')}
            eventHandlers={{
              click: () => onSelectPoint && onSelectPoint(point)
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="bg-zinc-950 text-zinc-100 p-2 rounded border border-zinc-800 text-xs font-sans">
                <div className="font-bold text-amber-400 uppercase tracking-wider mb-1">{point.title}</div>
                <div className="text-zinc-300 mb-1">{point.desc}</div>
                <div className="text-[10px] text-zinc-500 font-mono">ELEVAÇÃO: {point.alt}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Grid HUD Sobreposta para Estética NASA */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-10"></div>
      
      {/* Coordenadas HUD Fixas no Canto do Mapa */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 px-4 py-1.5 rounded-full text-[10px] font-mono text-zinc-400 tracking-widest uppercase flex items-center space-x-3">
        <span>SECTOR: <strong>ARCADIA PLANITIA</strong></span>
        <span className="text-zinc-600">|</span>
        <span>LAT: <strong className="text-white">39.30° N</strong></span>
        <span className="text-zinc-600">|</span>
        <span>LON: <strong className="text-white">170.30° W</strong></span>
      </div>
    </div>
  );
}