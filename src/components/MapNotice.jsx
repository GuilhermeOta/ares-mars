import React from 'react';
import { Clock, Globe2 } from 'lucide-react';

const card =
  'bg-zinc-950/85 backdrop-blur-md border rounded-lg px-3 py-2.5 text-[11px] text-zinc-300 w-72 max-w-[90vw] pointer-events-none';

const fmt = (value, decimals) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Valor regional: um número que vale para a área toda.
 * Usado para dados de modelos globais (Mars Climate Database, radiação),
 * cuja resolução é maior que a própria área de estudo.
 */
export function RegionalCard({ layer }) {
  const r = layer.regional;
  return (
    <div className={`${card} border-sky-500/40`}>
      <p className="flex items-center gap-1.5 text-zinc-100 font-semibold">
        <Globe2 className="w-3.5 h-3.5 text-sky-400" />
        {layer.label}
      </p>
      {r.display ? (
        // Estimativa qualitativa: o texto vem primeiro e o número aproximado fica ao lado
        <p className="mt-1 text-2xl font-mono text-white">
          {r.display} <span className="text-sm text-zinc-400">(~{fmt(r.value, r.decimals)}{r.unit ? ` ${r.unit}` : ''})</span>
        </p>
      ) : (
        <p className="mt-1 text-2xl font-mono text-white">
          {fmt(r.value, r.decimals)} <span className="text-sm text-zinc-400">{r.unit}</span>
        </p>
      )}
      {r.seasons.length > 0 && (
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px] text-zinc-400">
          {r.seasons.map((s) => (
            <span key={s.label}>
              {s.label}: <span className="text-zinc-200">{fmt(s.value, r.decimals)}</span>
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-sky-300/90 leading-snug">
        Valor regional: um número só, que vale para a área de estudo inteira. 
        {r.note ? ` ${r.note}` : ''}
      </p>
    </div>
  );
}

/** Subfiltro ainda sem dados: explica em vez de deixar o mapa sem resposta. */
export function PendingCard({ layer }) {
  return (
    <div className={`${card} border-zinc-700`}>
      <p className="flex items-center gap-1.5 text-zinc-100 font-semibold">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        {layer?.name || 'Subfiltro'}
      </p>
      <p className="mt-1 leading-snug">
        Dado em preparação: ainda não foi adicionado ao projeto para esta área.
      </p>
      {layer?.source && <p className="mt-1 text-[10px] text-zinc-500">Fonte prevista: {layer.source}</p>}
    </div>
  );
}
