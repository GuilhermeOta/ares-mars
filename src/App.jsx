import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Map, 
  Layers, 
  Maximize2, 
  Minimize2, 
  EyeOff, 
  Eye, 
  Navigation, 
  Activity, 
  Compass, 
  Search, 
  ShieldAlert, 
  Wind, 
  Droplet, 
  Mountain,
  X
} from 'lucide-react';
import GlobeView from './views/GlobeView';
import MapView from './views/MapView';
import InspectionPanel from './components/InspectionPanel';
import useLayerManifest from './hooks/useLayerManifest';
import { FILTERS, DEFAULT_ACTIVE_FILTERS } from './config/mapConfig';

function App() {
  const [viewMode, setViewMode] = useState('globe');
  // Cada filtro liga/desliga sozinho
  const [activeFilters, setActiveFilters] = useState(DEFAULT_ACTIVE_FILTERS);
  const toggleFilter = (id) => setActiveFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  // Ponto escolhido no mapa
  const [selection, setSelection] = useState(null);

  // Camadas exportadas pela equipe de dados
  const manifest = useLayerManifest();
  
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  
  // Painéis desabilitados (fechados) por padrão ao carregar a aplicação
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(false);

  // Alterna o modo de visualização (Globe / Map)
  const handleToggleViewMode = () => {
    const newMode = viewMode === 'globe' ? 'map' : 'globe';
    setViewMode(newMode);
    
    if (newMode === 'map') {
      const isMobile = window.innerWidth < 640;
      // Mantém desabilitados por padrão no mobile e desktop ao alternar
      setIsLeftVisible(false);
      setIsRightVisible(false);
      setIsLeftExpanded(false);
    }
  };const handleSelectPoint = (point) => {
      setSelection(point);
      setIsRightVisible(true); // abre o painel direito ao selecionar algo
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
            manifest={manifest}
            selectedId={selection?.id}
            onSelectPoint={handleSelectPoint}
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
      <aside className={`absolute top-20 left-3 sm:left-6 bottom-24 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' || !isLeftVisible
          ? '-translate-x-[450px] opacity-0 pointer-events-none scale-95' 
          : `${isLeftExpanded ? 'w-[calc(100%-2.5rem)] sm:w-80' : 'w-[calc(100%-2.5rem)] sm:w-64'} translate-x-0 opacity-100 scale-100 pointer-events-auto`
      }`}>
        <div>
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

          {FILTERS.map((filter) => {
            const IconComponent = filter.icon;
            const isActive = Boolean(activeFilters[filter.id]);
            const layerCount = manifest.layers.filter((l) => l.filter === filter.id).length;
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                aria-pressed={isActive}
                className={`w-full p-2.5 sm:p-3 rounded text-xs transition-colors duration-200 text-left flex flex-col cursor-pointer border focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                style={isActive ? { borderColor: `${filter.color}80` } : undefined}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2.5">
                    <IconComponent className="w-4 h-4" style={{ color: isActive ? filter.color : '#71717a' }} />
                    <span>{filter.name}</span>
                  </div>
                  {/* Caixa de seleção: mostra que dá para ligar vários */}
                  <span
                    className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0"
                    style={{ borderColor: isActive ? filter.color : '#52525b', background: isActive ? filter.color : 'transparent' }}
                  >
                    {isActive && (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="#09090b" strokeWidth="2.2">
                        <path d="M2.5 6.2 5 8.5l4.5-5" />
                      </svg>
                    )}
                  </span>
                </div>
                {isLeftExpanded && (
                  <span className="text-[10px] text-zinc-500 mt-2 pl-6 font-mono">
                    {filter.desc}
                    <br />
                    {layerCount > 0 ? `${layerCount} camada(s) exportada(s)` : 'Nenhuma camada exportada ainda'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between items-center font-mono uppercase tracking-wider hidden sm:flex">
          <span>{activeCount} {activeCount === 1 ? 'camada ligada' : 'camadas ligadas'}</span>
          <span className="text-amber-400 font-bold">A.T.O.M.</span>
        </div>
      </aside>

      {/* Botão flutuante para REEXIBIR o painel de filtros */}
      {viewMode === 'map' && !isLeftVisible && (
        <button
          onClick={() => setIsLeftVisible(true)}
          className="absolute top-20 left-3 sm:left-6 z-20 p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 rounded shadow-xl transition-all duration-300 cursor-pointer flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold animate-fade-in hover:scale-105 active:scale-95 transform-gpu"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Exibir Filtros</span>
        </button>
      )}

      {/* Painel Direito: Painel de Inspeção */}
      <aside className={`absolute top-20 right-3 sm:right-6 bottom-24 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-col z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
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
          activeFilters={activeFilters}
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
      <footer className={`absolute bottom-3 sm:bottom-4 left-3 sm:left-6 right-3 sm:right-6 h-14 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg px-3 sm:px-6 flex items-center justify-between shadow-2xl z-20 transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-2 text-amber-400">
            <Navigation className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase">Trajeto A*</span>
          </div>
          <div className="hidden xs:flex items-center space-x-2 sm:space-x-4 text-[11px] sm:text-xs font-mono">
            <span className="text-zinc-400">Origem: <strong className="text-zinc-200 bg-zinc-900 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-800">Não definido</strong></span>
            <span className="text-zinc-600">➔</span>
            <span className="text-zinc-400">Destino: <strong className="text-zinc-200 bg-zinc-900 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-800">Não definido</strong></span>
          </div>
        </div>
        <button 
          disabled
          className="px-3 sm:px-4 py-1.5 bg-zinc-900 text-zinc-600 text-[11px] sm:text-xs font-semibold rounded border border-zinc-800 cursor-not-allowed uppercase tracking-wider font-mono shrink-0"
        >
          Calcular Rota
        </button>
      </footer>

    </div>
  );
}

export default App;