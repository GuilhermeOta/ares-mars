import React, { useState } from 'react';
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
  Mountain 
} from 'lucide-react';
import GlobeView from './views/GlobeView';
import MapView from './views/MapView';

function App() {
  const [viewMode, setViewMode] = useState('globe');
  const [activeFilter, setActiveFilter] = useState('agua');
  
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(true);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black text-zinc-100 overflow-hidden select-none font-sans">
      
      {/* ========================================================== */}
      {/* 1. CAMADA DE FUNDO WEBGL (Com transição suave de fade/zoom) */}
      {/* ========================================================== */}
      <div className="absolute inset-0 z-0 w-full h-full bg-black">
        {viewMode === 'globe' ? (
          <GlobeView onSelectSector={() => setViewMode('map')} />
        ) : (
          <div className="absolute inset-0 z-0 w-full h-full bg-black">
  {viewMode === 'globe' ? (
    <GlobeView onSelectSector={() => setViewMode('map')} />
  ) : (
    /* AQUI ENTRA O MAPA 2D REAL COM LEAFLET */
    <MapView activeFilter={activeFilter} />
  )}
</div>
        )}
      </div>

      {/* ========================================================== */}
      {/* 2. BARRA SUPERIOR (Com micro-interações refinadas)         */}
      {/* ========================================================== */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-b border-zinc-800 flex items-center px-6 justify-between z-30 shadow-2xl transition-all duration-300">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center transition-transform duration-300 hover:rotate-45">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl font-bold tracking-[0.25em] text-white">
              ARES
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
              NASA Mission
            </span>
          </div>
          <span className="text-xs text-zinc-400 border-l border-zinc-800 pl-6 hidden sm:inline uppercase tracking-wider">
            Target Sector: <strong className="text-white font-medium">Arcadia Planitia</strong>
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              const newMode = viewMode === 'globe' ? 'map' : 'globe';
              setViewMode(newMode);
              if (newMode === 'map') {
                setIsLeftExpanded(false);
                setIsRightVisible(true);
              }
            }}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-white/10 flex items-center space-x-2 cursor-pointer active:scale-95 transform-gpu"
          >
            {viewMode === 'globe' ? (
              <span>Iniciar Exploração (2D)</span>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-black" />
                <span>Voltar ao Globo (3D)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================== */}
      {/* 3. PAINÉIS LATERAIS FLUTUANTES (Fluidez de expansão e fade)  */}
      {/* ========================================================== */}
      
      {/* Menu Esquerdo: Filtros Científicos */}
      <aside className={`absolute top-20 left-6 bottom-24 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-4 flex flex-col justify-between z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' 
          ? '-translate-x-[450px] opacity-0 pointer-events-none scale-95' 
          : `${isLeftExpanded ? 'w-80' : 'w-64'} translate-x-0 opacity-100 scale-100 pointer-events-auto`
      }`}>
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-180" />
              <h2 className="text-xs font-semibold text-white uppercase tracking-[0.15em]">Filtros Científicos</h2>
            </div>
            <button 
              onClick={() => setIsLeftExpanded(!isLeftExpanded)}
              className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded hover:bg-zinc-900"
            >
              {isLeftExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-2">
            {[
              { id: 'agua', name: 'Água (Subterrânea)', icon: Droplet, desc: 'Dados SWIM & SHARAD' },
              { id: 'geologia', name: 'Geologia & Minerais', icon: Mountain, desc: 'Espectroscopia CRISM' },
              { id: 'radiacao', name: 'Níveis de Radiação', icon: ShieldAlert, desc: 'Instrumento RAD' },
              { id: 'ventos', name: 'Ventos & Poeira', icon: Wind, desc: 'Mars Climate Sounder' }
            ].map((filter) => {
              const IconComponent = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full p-3 rounded text-xs transition-all duration-300 text-left flex flex-col justify-between cursor-pointer border transform-gpu hover:translate-x-1 ${
                    isActive 
                      ? 'bg-zinc-900 border-amber-500/50 text-white font-medium shadow-lg shadow-amber-500/5' 
                      : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2.5">
                      <IconComponent className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span>{filter.name}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                  </div>
                  {isLeftExpanded && <span className="text-[10px] text-zinc-500 mt-2 pl-6 font-mono transition-opacity duration-300">{filter.desc}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between items-center font-mono uppercase tracking-wider">
          <span>A.T.O.M. Core</span>
          <span className="text-amber-400 font-bold animate-pulse">ONLINE</span>
        </div>
      </aside>

      {/* Painel Direito: Painel de Inspeção */}
      <aside className={`absolute top-20 right-6 bottom-24 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-4 flex flex-col z-20 shadow-2xl transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' || !isRightVisible
          ? 'translate-x-[450px] opacity-0 pointer-events-none scale-95' 
          : 'w-72 translate-x-0 opacity-100 scale-100 pointer-events-auto'
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

        <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-110">
            <Search className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-xs font-medium text-zinc-200 uppercase tracking-wider">Nenhum Ponto Selecionado</p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-[180px]">
            Clique em uma região do mapa para visualizar dados científicos.
          </p>
        </div>
      </aside>

      {/* Botão flutuante para REEXIBIR o painel de inspeção com fade-in suave */}
      {viewMode === 'map' && !isRightVisible && (
        <button
          onClick={() => setIsRightVisible(true)}
          className="absolute top-20 right-6 z-20 p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 rounded shadow-xl transition-all duration-300 cursor-pointer flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold animate-fade-in hover:scale-105 active:scale-95 transform-gpu"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Exibir Inspeção</span>
        </button>
      )}

      {/* ========================================================== */}
      {/* 4. PAINEL INFERIOR FLUTUANTE (Planejamento de Rotas A*)     */}
      {/* ========================================================== */}
      <footer className={`absolute bottom-4 left-6 right-6 h-14 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg px-6 flex items-center justify-between shadow-2xl z-20 transition-all duration-500 ease-out transform-gpu ${
        viewMode === 'globe' ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-amber-400">
            <Navigation className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase">Trajeto A*</span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-zinc-400">Origem: <strong className="text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Não definido</strong></span>
            <span className="text-zinc-600">➔</span>
            <span className="text-zinc-400">Destino: <strong className="text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Não definido</strong></span>
          </div>
        </div>
        <button 
          disabled
          className="px-4 py-1.5 bg-zinc-900 text-zinc-600 text-xs font-semibold rounded border border-zinc-800 cursor-not-allowed uppercase tracking-wider font-mono"
        >
          Calcular Rota
        </button>
      </footer>

    </div>
  );
}

export default App;