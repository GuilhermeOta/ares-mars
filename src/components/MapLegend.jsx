import React from 'react';

const fmt = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/**
 * Legenda da camada ligada: barra de cores com mínimo e máximo,
 * ou lista de categorias (como na camada de obstáculos).
 */
export default function MapLegend({ layer }) {
  const legend = layer?.legend;
  if (!legend) return null;

  return (
    <div className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-300 w-64 max-w-[90vw] pointer-events-none">
      <p className="text-zinc-100 font-semibold mb-1.5 truncate">{layer.label}</p>

      {legend.categories ? (
        <ul className="space-y-1">
          {legend.categories.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: c.color }} />
              {c.label}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div
            className="h-2.5 rounded-sm"
            style={{ background: `linear-gradient(to right, ${legend.colors.join(', ')})` }}
          />
          <div className="flex justify-between mt-1 text-zinc-400">
            {/* ≤ e ≥: valores além da faixa aparecem com a cor da ponta */}
            <span>{legend.clipMin ? '≤ ' : ''}{fmt(legend.min)} {legend.unit}</span>
            <span>{legend.clipMax ? '≥ ' : ''}{fmt(legend.max)} {legend.unit}</span>
          </div>
        </>
      )}
    </div>
  );
}
