import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Botão "i" branco, no canto direito de cada pasta e subfiltro.
 * Fica FORA do botão de seleção (um botão não pode ficar dentro de outro).
 */
export function InfoButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={`Explicação: ${label}`}
      title="O que é isto?"
      className="w-5 h-5 shrink-0 rounded-full bg-white text-zinc-900 flex items-center justify-center cursor-pointer shadow-[0_0_0_2px_rgba(245,158,11,0.25)] hover:bg-amber-100 active:scale-90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
    >
      <span className="font-serif italic font-bold text-[13px] leading-none">i</span>
    </button>
  );
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <section>
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">{title}</h3>
      <p className="text-sm text-zinc-300 leading-relaxed">{children}</p>
    </section>
  );
}

/**
 * Janela de explicação. No celular abre de baixo para cima; no computador, no centro.
 * item = { title, subtitle, info }  (info vem de config/filterInfo.js)
 * Fecha no X, clicando fora ou com a tecla Esc.
 */
export default function InfoModal({ item, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;
  const { title, subtitle, info } = item;

  // createPortal: a janela é desenhada direto no <body>, por cima de tudo (inclusive do mapa)
  return createPortal(
    <div
      className="fixed inset-0 z-[3000] bg-black/70 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-zinc-950 border border-amber-500/30 rounded-t-xl sm:rounded-xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 px-5 pt-4 pb-3 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
          <div className="flex-1">
            <h2 id="info-modal-title" className="text-base font-semibold text-white leading-snug">{title}</h2>
            {subtitle && <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {info.img && (
          <div className="bg-black">
            <img
              src={`${import.meta.env.BASE_URL}${info.img}`}
              alt={`Imagem ilustrativa: ${title}`}
              className="w-full max-h-72 object-contain"
              loading="lazy"
            />
          </div>
        )}

        <div className="px-5 py-4 space-y-4">
          <Section title="Resumo">{info.resumo}</Section>
          <Section title="Como é medido">{info.como}</Section>
          <Section title="O que o mapa mostra">{info.serve}</Section>
          <Section title="Por que importa para a missão">{info.missao}</Section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
