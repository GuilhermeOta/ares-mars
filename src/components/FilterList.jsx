import React, { useCallback, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FILTERS } from '../config/mapConfig';
import { FILTER_INFO } from '../config/filterInfo';
import InfoModal, { InfoButton } from './InfoModal';

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

export default function FilterList({ activeLayerId, exportedIds, regionalIds = new Set(), onSelectLayer }) {
  // Pastas abertas. Começa com a pasta do subfiltro ativo aberta.
  const [open, setOpen] = useState(() => {
    const owner = FILTERS.find((f) => f.layers.some((l) => l.id === activeLayerId));
    return owner ? { [owner.id]: true } : {};
  });
  const toggleOpen = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // Janela de explicação aberta (botão "i"). null = fechada.
  const [infoItem, setInfoItem] = useState(null);
  const closeInfo = useCallback(() => setInfoItem(null), []);

  const list = FILTERS.map((filter) => {
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
        {/* Cabeçalho da pasta: só abre e fecha, não liga nada. O "i" fica ao lado, fora do botão. */}
        <div className="flex items-center pr-2.5 sm:pr-3">
        <button
          onClick={() => toggleOpen(filter.id)}
          aria-expanded={isOpen}
          className={`flex-1 min-w-0 flex items-center gap-2.5 p-2.5 sm:p-3 text-xs text-left cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
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
          {FILTER_INFO[filter.id] && (
            <InfoButton
              label={filter.name}
              onClick={() => setInfoItem({ title: filter.name, subtitle: `Pasta com ${filter.layers.length} subfiltros`, info: FILTER_INFO[filter.id] })}
            />
          )}
        </div>

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
                  <div className="flex items-start gap-1 pr-1">
                  <button
                    onClick={() => onSelectLayer(layer.id)}
                    aria-pressed={on}
                    className={`flex-1 min-w-0 flex items-start gap-2 ${layer.group ? 'pl-9' : 'pl-6'} pr-2 py-1.5 rounded text-[11px] text-left cursor-pointer hover:bg-zinc-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      on ? 'text-zinc-100 bg-zinc-800/40' : 'text-zinc-400'
                    }`}
                  >
                    <span className="mt-0.5">
                      <Radio on={on} color={filter.color} />
                    </span>
                    <span className="flex-1 min-w-0 leading-snug break-words">
                      {layer.name}
                      {/* Linha de baixo: fonte, unidade e etiquetas ("regional" / "sem dados").
                          As etiquetas ficam aqui, e não ao lado do nome, para sobrar espaço para o botão "i". */}
                      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] font-mono text-zinc-500 mt-0.5">
                        <span>{layer.source}{layer.unit ? ` · ${layer.unit}` : ''}</span>
                        {regionalIds.has(layer.id) && (
                          <span className="text-sky-400/80 border border-sky-500/30 rounded px-1">regional</span>
                        )}
                        {!hasData && (
                          <span className="text-zinc-600 border border-zinc-800 rounded px-1">sem dados</span>
                        )}
                      </span>
                    </span>
                  </button>
                    {FILTER_INFO[layer.id] && (
                      <span className="mt-1.5">
                        <InfoButton
                          label={layer.name}
                          onClick={() =>
                            setInfoItem({
                              title: layer.name,
                              subtitle: `${layer.source}${layer.unit ? ` · ${layer.unit}` : ''}`,
                              info: FILTER_INFO[layer.id],
                            })
                          }
                        />
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  });

  return (
    <>
      {list}
      <InfoModal item={infoItem} onClose={closeInfo} />
    </>
  );
}