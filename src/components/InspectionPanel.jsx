import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, MapPin, Crosshair, FlaskConical, Loader2 } from 'lucide-react';
import { FILTER_BY_ID } from '../config/mapConfig';
import { sampleLayer, formatLayerValue } from '../services/layerValues';

const fmt = (lat, lon) => `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;

// Linha "rótulo: valor". Valor ausente aparece como "pendente".
function Field({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-right ${value ? 'text-zinc-200' : 'text-zinc-600 italic'}`}>{value || 'pendente'}</span>
    </div>
  );
}

function SourceBlock({ source }) {
  return (
    <div className="mt-2 text-[11px] font-mono">
      <Field label="Instrumento" value={source?.instrument && `${source.instrument}${source.mission ? ` (${source.mission})` : ''}`} />
      <Field label="Data" value={source?.date} />
      <Field label="Resolução" value={source?.resolution_m && `${source.resolution_m} m/px`} />
      <Field label="Confiança" value={source?.confidence} />
    </div>
  );
}

/**
 * Busca, para o ponto selecionado, o valor de cada camada que tem dados numéricos.
 * Devolve { status: 'idle' | 'loading' | 'ok' | 'error', rows: [{ layer, value }] }.
 *
 * O estado só muda quando a resposta chega. O "carregando" é deduzido:
 * se o resultado guardado é de outro ponto, ainda estamos buscando o atual.
 */
function usePointValues(selection, layers) {
  const withValues = useMemo(() => layers.filter((l) => l.values || l.regional), [layers]);
  const [result, setResult] = useState({ selection: null, status: 'idle', rows: [] });

  useEffect(() => {
    if (!selection || withValues.length === 0) return undefined;
    let cancelled = false; // se o usuário clicar em outro ponto antes de terminar
    Promise.all(withValues.map((layer) => sampleLayer(layer, selection.lat, selection.lon).then((value) => ({ layer, value }))))
      .then((rows) => {
        if (!cancelled) setResult({ selection, status: 'ok', rows: rows.filter((r) => r.value != null) });
      })
      .catch(() => {
        if (!cancelled) setResult({ selection, status: 'error', rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [selection, withValues]);

  if (!selection || withValues.length === 0) return { status: 'idle', rows: [] };
  if (result.selection !== selection) return { status: 'loading', rows: [] };
  return result;
}

export default function InspectionPanel({ selection, activeLayers, layers, onClear }) {
  // O hook precisa vir antes de qualquer "return" (regra dos hooks do React)
  const values = usePointValues(selection, layers);

  if (!selection) {
    return (
      <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded p-4 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
          <Search className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-xs font-medium text-zinc-200">Nenhum ponto selecionado</p>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
          Clique num marcador, num local candidato ou em qualquer ponto do mapa.
        </p>
      </div>
    );
  }

  const filter = selection.filter ? FILTER_BY_ID[selection.filter] : null;
  const accent = filter?.color || '#f59e0b';
  const activeLayer = layers.find((l) => activeLayers[l.id]);

  let Icon = Crosshair;
  let title = 'Coordenada selecionada';
  if (selection.kind === 'site') { Icon = MapPin; title = selection.name; }
  if (selection.kind === 'point') { Icon = filter?.icon || FlaskConical; title = selection.title; }

  return (
    <div className="flex-1 overflow-y-auto text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded border flex items-center justify-center"
               style={{ borderColor: `${accent}66`, background: `${accent}14` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{title}</p>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">{fmt(selection.lat, selection.lon)}</p>
          </div>
        </div>
        <button onClick={onClear} title="Limpar seleção"
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {selection.mock && (
        <div className="mt-3 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-2.5 py-1.5">
          Dado de teste. Ainda não é informação científica.
        </div>
      )}

      {selection.kind === 'site' && (
        <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
          Local candidato definido pela equipe de dados. Usado como origem ou destino nas rotas calculadas.
        </p>
      )}

      {selection.kind === 'point' && (
        <p className="mt-3 text-xs text-zinc-300 leading-relaxed">{selection.desc}</p>
      )}

      {/* ---------- Valores reais das camadas neste ponto ---------- */}
      <div className="mt-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Neste ponto</p>
        {values.status === 'loading' && (
          <p className="text-[11px] text-zinc-400 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Lendo os dados…
          </p>
        )}
        {values.status === 'error' && (
          <p className="text-[11px] text-red-400">Não foi possível ler os valores das camadas.</p>
        )}
        {values.status === 'ok' && values.rows.length === 0 && (
          <p className="text-[11px] text-zinc-400">Fora da área coberta pelas camadas.</p>
        )}
        {values.status === 'ok' && values.rows.length > 0 && (
          <div className="text-[11px] font-mono">
            {values.rows.map(({ layer, value }) => (
              <div
                key={layer.id}
                className={`flex justify-between gap-3 py-1.5 border-b border-zinc-800/60 last:border-0 ${
                  activeLayers[layer.id] ? 'text-amber-300' : ''
                }`}
              >
                <span className={activeLayers[layer.id] ? '' : 'text-zinc-500'}>
                  {layer.label}
                  {layer.regional && <span className="text-sky-400/80"> (regional)</span>}
                </span>
                <span className="text-right text-zinc-100">{formatLayerValue(layer, value)}</span>
              </div>
            ))}
          </div>
        )}
        {values.status === 'idle' && (
          <p className="text-[11px] text-zinc-500">Nenhuma camada com dados numéricos ainda.</p>
        )}
      </div>

      {/* ---------- Fonte da camada ligada ---------- */}
      {activeLayer && (
        <div className="mt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Fonte: {activeLayer.label}</p>
          <SourceBlock source={activeLayer.source} />
        </div>
      )}
    </div>
  );
}
