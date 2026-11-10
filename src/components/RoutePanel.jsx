import React from 'react';
import { Navigation, ArrowLeftRight, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ROUTE_MODES } from '../config/mapConfig';

const fmtKm = (v) => (v == null ? '—' : `${v.toFixed(1)} km`);
const fmtDeg = (v) => (v == null ? '—' : `${v.toFixed(1)}°`);
const fmtM = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} km` : `${Math.round(v)} m`);

// Botão de origem/destino: mostra o ponto escolhido ou convida a escolher
function EndpointButton({ label, point, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1 rounded border text-[11px] font-mono cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
        active ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-zinc-500">{label}:</span>
      <span className="truncate max-w-[9rem]">
        {active ? 'clique no mapa…' : point ? point.label : 'definir'}
      </span>
    </button>
  );
}

export default function RoutePanel({
  origin, dest, picking, routeState, hiddenModes,
  onPick, onSwap, onClear, onCalculate, onToggleMode,
}) {
  const { status, data, error } = routeState;
  const canCalculate = origin && dest && status !== 'loading';

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Linha 1: origem, destino e ações */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center space-x-2 text-amber-400 mr-1">
          <Navigation className="w-4 h-4" />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase">Trajeto A*</span>
        </div>

        <EndpointButton label="Origem" point={origin} color="#a3e635" active={picking === 'origem'} onClick={() => onPick('origem')} />
        <button
          onClick={onSwap}
          disabled={!origin && !dest}
          title="Inverter origem e destino"
          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>
        <EndpointButton label="Destino" point={dest} color="#f43f5e" active={picking === 'destino'} onClick={() => onPick('destino')} />

        <div className="flex items-center gap-2 ml-auto">
          {(origin || dest) && (
            <button
              onClick={onClear}
              title="Limpar rota"
              className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-900 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onCalculate}
            disabled={!canCalculate}
            className={`px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold rounded border uppercase tracking-wider font-mono flex items-center gap-2 ${
              canCalculate
                ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 cursor-pointer'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
            }`}
          >
            {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status === 'loading' ? 'Calculando' : 'Calcular rota'}
          </button>
        </div>
      </div>

      {/* Dica enquanto escolhe um ponto */}
      {picking && (
        <p className="text-[11px] text-amber-300/90">
          Clique no mapa ou num local candidato (AP) para escolher {picking === 'origem' ? 'a origem' : 'o destino'}.
        </p>
      )}

      {status === 'error' && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Linha 2: resultado dos 3 modos */}
      {status === 'ok' && data && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ROUTE_MODES.map((mode) => {
              const r = data.rotas.find((x) => x.modo === mode.id);
              const hidden = Boolean(hiddenModes[mode.id]);
              return (
                <div
                  key={mode.id}
                  className={`rounded border px-2.5 py-1.5 text-[11px] font-mono transition-opacity ${hidden ? 'opacity-40' : ''}`}
                  style={{ borderColor: `${mode.color}55`, background: `${mode.color}0d` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-100 font-semibold">
                      <span className="w-3 h-0.5 rounded" style={{ background: mode.color }} />
                      {mode.name}
                    </span>
                    {r?.encontrada && (
                      <button
                        onClick={() => onToggleMode(mode.id)}
                        title={hidden ? 'Mostrar no mapa' : 'Esconder do mapa'}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                      >
                        {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {r?.encontrada ? (
                    <div className="mt-1 flex gap-3 text-zinc-400 flex-wrap">
                      <span><strong className="text-white">{fmtKm(r.distancia_km)}</strong></span>
                      <span>decl. máx {fmtDeg(r.declividade_max)}</span>
                      <span>folga {fmtM(r.folga_min_m)}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-red-400">Sem rota{r?.motivo ? `: ${r.motivo}` : ''}</p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-zinc-500">
            Linha reta: {fmtKm(data.reta_km)}
            {data.mock && <span className="text-amber-300"> · Rota de TESTE: a API ainda não está conectada</span>}
            {data.sintetico && <span className="text-amber-300"> · Terreno SINTÉTICO (a API está sem dados reais)</span>}
          </p>
        </div>
      )}
    </div>
  );
}