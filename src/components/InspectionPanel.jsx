import React from 'react';
import { Search, X, MapPin, Crosshair, FlaskConical } from 'lucide-react';
import { FILTER_BY_ID } from '../config/mapConfig';

const fmt = (lat, lon) => `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;

const contains = (bounds, lat, lon) =>
  lat >= bounds[0][0] && lat <= bounds[1][0] && lon >= bounds[0][1] && lon <= bounds[1][1];

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
    <div className="mt-3 text-[11px] font-mono">
      <Field label="Instrumento" value={source?.instrument && `${source.instrument}${source.mission ? ` (${source.mission})` : ''}`} />
      <Field label="Data" value={source?.date} />
      <Field label="Resolução" value={source?.resolution_m && `${source.resolution_m} m/px`} />
      <Field label="Confiança" value={source?.confidence} />
    </div>
  );
}

export default function InspectionPanel({ selection, activeFilters, layers, onClear }) {
  // Nada selecionado: mesmo visual que vocês já tinham
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

  // Camadas exportadas que cobrem a coordenada clicada (só dos filtros ligados)
  const layersHere =
    selection.kind === 'coord'
      ? layers.filter((l) => activeFilters[l.filter] && contains(l.bounds, selection.lat, selection.lon))
      : [];

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
        <>
          {filter && (
            <span className="inline-block mt-3 text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{ color: filter.color, borderColor: `${filter.color}55` }}>
              {filter.name}
            </span>
          )}
          <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{selection.desc}</p>
          <SourceBlock source={selection.source} />
        </>
      )}

      {selection.kind === 'coord' && (
        <div className="mt-3">
          {layersHere.length === 0 ? (
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nenhuma camada exportada cobre este ponto nos filtros ligados.
            </p>
          ) : (
            layersHere.map((l) => (
              <div key={l.id} className="mt-2 p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <p className="text-xs" style={{ color: FILTER_BY_ID[l.filter]?.color }}>{l.label}</p>
                <SourceBlock source={l.source} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}