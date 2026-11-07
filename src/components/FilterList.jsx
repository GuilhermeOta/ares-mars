import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FILTERS } from '../config/mapConfig';

// Bolinha de seleção (estilo "rádio"): só um subfiltro fica ligado por vez
function Radio({ on, color }) {
  return (
    <span
      className="w-3 h-3 rounded-full border flex items-center justify-center shrink-0"
      style={{ borderColor: on ? color : '#52525b' }}
    >
      {on && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
    </span>
  );
}

export default function FilterList({ activeLayerId, exportedIds, onSelectLayer }) {
  // Pastas abertas. Começa com a pasta do subfiltro ativo aberta.
  const [open, setOpen] = useState(() => {
    const owner = FILTERS.find((f) => f.layers.some((l) => l.id === activeLayerId));
    return owner ? { [owner.id]: true } : {};
  });
  const toggleOpen = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return FILTERS.map((filter) => {
    const Icon = filter.icon;
    const isOpen = Boolean(open[filter.id]);
    const hasActive = filter.layers.some((l) => l.id === activeLayerId);

    return (
      <div
        key={filter.id}
        className="rounded border transition-colors duration-200"
        style={{
          borderColor: hasActive ? `${filter.color}80` : 'rgba(39,39,42,0.6)',
          background: hasActive ? 'rgb(24 24 27)' : 'rgba(24,24,27,0.4)',
        }}
      >
        {/* Cabeçalho da pasta: só abre e fecha, não liga nada */}
        <button
          onClick={() => toggleOpen(filter.id)}
          aria-expanded={isOpen}
          className={`w-full flex items-center gap-2.5 p-2.5 sm:p-3 text-xs text-left cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
            hasActive ? 'text-white font-medium' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" style={{ color: hasActive ? filter.color : '#71717a' }} />
          <span className="flex-1">{filter.name}</span>
          <span className="text-[10px] font-mono text-zinc-500">{filter.layers.length}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Subfiltros */}
        {isOpen && (
          <ul className="pb-2 px-2 space-y-0.5">
            {filter.layers.map((layer, i) => {
              const on = layer.id === activeLayerId;
              const hasData = exportedIds.has(layer.id);
              // Subtítulo quando começa um grupo novo (ex.: "Composição mineralógica")
              const startsGroup = layer.group && layer.group !== filter.layers[i - 1]?.group;
              return (
                <li key={layer.id}>
                  {startsGroup && (
                    <p className="pl-6 pt-2 pb-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                      {layer.group}
                    </p>
                  )}
                  <button
                    onClick={() => onSelectLayer(layer.id)}
                    aria-pressed={on}
                    className={`w-full flex items-start gap-2 ${layer.group ? 'pl-9' : 'pl-6'} pr-2 py-1.5 rounded text-[11px] text-left cursor-pointer hover:bg-zinc-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      on ? 'text-zinc-100 bg-zinc-800/40' : 'text-zinc-400'
                    }`}
                  >
                    <span className="mt-0.5">
                      <Radio on={on} color={filter.color} />
                    </span>
                    <span className="flex-1 leading-snug">
                      {layer.name}
                      <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">
                        {layer.source}{layer.unit ? ` · ${layer.unit}` : ''}
                      </span>
                    </span>
                    {!hasData && (
                      <span className="text-[9px] font-mono text-zinc-600 border border-zinc-800 rounded px-1 py-px mt-0.5 shrink-0">
                        sem dados
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  });
}