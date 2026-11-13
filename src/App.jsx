import React, { useMemo, useState } from 'react';
import {
  Globe,
  Layers,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  Activity,
  Compass,
  X
} from 'lucide-react';
import GlobeView from './views/GlobeView';
import MapView from './views/MapView';
import InspectionPanel from './components/InspectionPanel';
import FilterList from './components/FilterList';
import RoutePanel from './components/RoutePanel';
import { fetchRoutes } from './services/routeApi';
import useLayerManifest from './hooks/useLayerManifest';
import { FILTERS, LAYER_BY_ID, DEFAULT_ACTIVE_LAYER } from './config/mapConfig';

function App() {
  const [viewMode, setViewMode] = useState('globe');
  // Só UM subfiltro ligado por vez (ou nenhum: null)
  const [activeLayerId, setActiveLayerId] = useState(DEFAULT_ACTIVE_LAYER);
  // Clicar no subfiltro ligado desliga; clicar em outro troca
  const selectLayer = (id) => setActiveLayerId((prev) => (prev === id ? null : id));

  // Mesmo formato de antes ({ 'swim-ci': true }), para o mapa e o painel não mudarem
  const activeLayers = useMemo(() => (activeLayerId ? { [activeLayerId]: true } : {}), [activeLayerId]);

  // Um filtro conta como "ligado" se pelo menos um subfiltro dele estiver ligado
  const activeFilters = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, f.layers.some((l) => activeLayers[l.id])])),
    [activeLayers]
  );
  const activeLayerName = activeLayerId ? LAYER_BY_ID[activeLayerId]?.name : null;

  // Ponto escolhido no mapa
  const [selection, setSelection] = useState(null);

  // ---------- Rotas ----------
  const [routeOrigin, setRouteOrigin] = useState(null);   // { lat, lon, label }
  const [routeDest, setRouteDest] = useState(null);
  const [routePick, setRoutePick] = useState(null);       // 'origem' | 'destino' | null
  const [routeState, setRouteState] = useState({ status: 'idle', data: null, error: null });
  const [hiddenModes, setHiddenModes] = useState({});     // { multicriterio: true } = escondido no mapa

  // Mudar origem ou destino invalida a rota calculada
  const resetRoute = () => {
    setRouteState({ status: 'idle', data: null, error: null });
    setHiddenModes({});
  };

  const handlePickRoute = (which) => setRoutePick((prev) => (prev === which ? null : which));

  const handleSwapRoute = () => {
    setRouteOrigin(routeDest);
    setRouteDest(routeOrigin);
    resetRoute();
  };

  const handleClearRoute = () => {
    setRouteOrigin(null);
    setRouteDest(null);
    setRoutePick(null);
    resetRoute();
  };

  const handleCalculateRoute = async () => {
    if (!routeOrigin || !routeDest) return;
    setRoutePick(null);
    setRouteState({ status: 'loading', data: null, error: null });
    try {
      const data = await fetchRoutes(routeOrigin, routeDest);
      setRouteState({ status: 'ok', data, error: null });
    } catch (err) {
      setRouteState({ status: 'error', data: null, error: err.message });
    }
  };

  const toggleRouteMode = (id) => setHiddenModes((prev) => ({ ...prev, [id]: !prev[id] }));

  // O rodapé cresce quando mostra resultados; os painéis laterais sobem junto
  const panelBottom =
    routeState.status === 'ok' ? 'bottom-44' : routePick || routeState.status === 'error' ? 'bottom-28' : 'bottom-24';

  // Camadas exportadas pela equipe de dados
  const manifest = useLayerManifest();
  // Subfiltros que já têm imagem exportada (o resto mostra "sem dados")
  const exportedIds = useMemo(() => new Set(manifest.layers.map((l) => l.id)), [manifest]);
  // Subfiltros que são um valor único para a área (marcados como "regional" na lista)
  const regionalIds = useMemo(() => new Set(manifest.layers.filter((l) => l.regional).map((l) => l.id)), [manifest]);
  
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  
  // Painéis desabilitados (fechados) por padrão ao carregar a aplicação
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);

  // Alterna o modo de visualização (Globe / Map)
  const handleToggleViewMode = () => {
    const newMode = viewMode === 'globe' ? 'map' : 'globe';
    setViewMode(newMode);
    
    if (newMode === 'map') {
      // Mantém desabilitados por padrão no mobile e desktop ao alternar
      setIsLeftVisible(false);
      setIsRightVisible(false);
      setIsLeftExpanded(false);
    }
  };

  const handleSelectPoint = (point) => {
    // Escolhendo origem/destino da rota: o clique define o ponto em vez de inspecionar
    if (routePick) {
      const endpoint = {
        lat: point.lat,
        lon: point.lon,
        label: point.name || `${point.lat.toFixed(2)}°N ${point.lon.toFixed(2)}°E`,
      };
      if (routePick === 'origem') {
        setRouteOrigin(endpoint);
        setRoutePick(routeDest ? null : 'destino'); // já pede o destino em seguida
      } else {
        setRouteDest(endpoint);
        setRoutePick(null);
      }
      resetRoute();
      return;
    }
    setSelection(point);
    setIsRightVisible(true);
    // Em telas estreitas, abrir a inspeção fecha os filtros
    if (window.innerWidth < 1024) setIsLeftVisible(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black text-zinc-100 overflow-hidden select-none font-sans">
      
      {/* 1. CAMADA DE FUNDO WEBGL */}
      <div className="absolute inset-0 z-0 w-full h-full bg-black">
        {viewMode === 'globe' ? (
          <GlobeView onSelectSector={() => { setViewMode('map'); setIsRightVisible(true); }} />
        ) : (
          <MapView
            activeFilters={activeFilters}
            activeLayers={activeLayers}
            manifest={manifest}
            selectedId={selection?.id}
            onSelectPoint={handleSelectPoint}
            routeOrigin={routeOrigin}
            routeDest={routeDest}
            routeData={routeState.status === 'ok' ? routeState.data : null}
            hiddenModes={hiddenModes}
            isPicking={Boolean(routePick)}
          />
        )}
      </div>

      {/* 2. BARRA SUPERIOR */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-b border-zinc-800 flex items-center px-3 sm:px-6 justify-between z-30 shadow-2xl transition-all duration-300">
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center transition-transform duration-300 hover:rotate-45 shrink-0">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.25em] text-white">
              ARES
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hidden xs:inline">
              NASA Mission
            </span>
          </div>
          <span className="text-xs text-zinc-400 border-l border-zinc-800 pl-4 sm:pl-6 hidden md:inline uppercase tracking-wider">
            Target Sector: <strong className="text-white font-medium">Arcadia Planitia</strong>
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleToggleViewMode}
            className="px-3 sm:px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-white/10 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer active:scale-95 transform-gpu shrink-0"
          >
            {viewMode === 'globe' ? (
              <span>Exploração (2D)</span>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-black" />
                <span>Globo (3D)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 3. PAINÉIS LATERAIS FLUTUANTES */}
      
      {/* Menu Esquerdo: Filtros Científicos */}
      <aside className={`above-badge absolute top-20 left-3 sm:left-6 ${panelBottom} bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' || !isLeftVisible
          ? '-translate-x-[450px] opacity-0 pointer-events-none scale-95' 
          : `${isLeftExpanded ? 'w-[calc(100%-2.5rem)] sm:w-80' : 'w-[calc(100%-2.5rem)] sm:w-64'} translate-x-0 opacity-100 scale-100 pointer-events-auto`
      }`}>
        {/* Esta div ocupa o espaço que sobra e deixa a lista rolar */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-180" />
              <h2 className="text-xs font-semibold text-white uppercase tracking-[0.15em]">Filtros Científicos</h2>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setIsLeftExpanded(!isLeftExpanded)}
                className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-zinc-900 hidden sm:block"
                title={isLeftExpanded ? "Recolher" : "Expandir"}
              >
                {isLeftExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setIsLeftVisible(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-zinc-900"
                title="Fechar Painel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Área com rolagem: só a lista rola, o título e o rodapé ficam fixos */}
          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 -mr-1">
            <FilterList
              activeLayerId={activeLayerId}
              exportedIds={exportedIds}
              regionalIds={regionalIds}
              onSelectLayer={selectLayer}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between items-center font-mono uppercase tracking-wider hidden sm:flex">
          <span className="truncate mr-2">{activeLayerName || 'Nenhuma camada'}</span>
          <span className="text-amber-400 font-bold">A.T.O.M.</span>
        </div>
      </aside>

      {/* Botão flutuante para REEXIBIR o painel de filtros */}
      {viewMode === 'map' && !isLeftVisible && (
        <button
          onClick={() => {
            setIsLeftVisible(true);
            if (window.innerWidth < 1024) setIsRightVisible(false);
          }}
          className="absolute top-20 left-3 sm:left-6 z-20 p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 rounded shadow-xl transition-all duration-300 cursor-pointer flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold animate-fade-in hover:scale-105 active:scale-95 transform-gpu"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Exibir Filtros</span>
        </button>
      )}

      {/* Painel Direito: Painel de Inspeção */}
      <aside className={`above-badge absolute top-20 right-3 sm:right-6 ${panelBottom} bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' || !isRightVisible
          ? 'translate-x-[450px] opacity-0 pointer-events-none scale-95' 
          : 'w-[calc(100%-2.5rem)] sm:w-72 translate-x-0 opacity-100 scale-100 pointer-events-auto'
      }`}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <h2 className="text-xs font-semibold text-white uppercase tracking-[0.15em]">Inspeção de Setor</h2>
          </div>
          <button 
            onClick={() => setIsRightVisible(false)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-zinc-900"
            title="Ocultar Painel"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>

        <InspectionPanel
          selection={selection}
          activeLayers={activeLayers}
          layers={manifest.layers}
          onClear={() => setSelection(null)}
        />
      </aside>

      {/* Botão flutuante para REEXIBIR o painel de inspeção (reposicionado no mobile para evitar colisão vertical com os filtros) */}
      {viewMode === 'map' && !isRightVisible && (
        <button
          onClick={() => setIsRightVisible(true)}
          className="absolute top-32 sm:top-20 right-3 sm:right-6 z-20 p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 rounded shadow-xl transition-all duration-300 cursor-pointer flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold animate-fade-in hover:scale-105 active:scale-95 transform-gpu"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Exibir Inspeção</span>
        </button>
      )}

      {/* 4. PAINEL INFERIOR FLUTUANTE (Planejamento de Rotas A*) */}
      <footer className={`above-badge absolute bottom-3 sm:bottom-4 left-3 sm:left-6 right-3 sm:right-6 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg px-3 sm:px-5 py-2.5 shadow-2xl z-20 transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' ? 'translate-y-48 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}>
        <RoutePanel
          origin={routeOrigin}
          dest={routeDest}
          picking={routePick}
          routeState={routeState}
          hiddenModes={hiddenModes}
          onPick={handlePickRoute}
          onSwap={handleSwapRoute}
          onClear={handleClearRoute}
          onCalculate={handleCalculateRoute}
          onToggleMode={toggleRouteMode}
        />
      </footer>

    </div>
  );
}

export default App;