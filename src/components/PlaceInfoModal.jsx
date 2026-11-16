import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';
import { ART } from '../config/placeInfo';

// Formatação das coordenadas (latitude °N/S; longitude °E, com o equivalente em °O quando passa de 180°)
const fmtLat = (v) => `${Math.abs(v).toFixed(2).replace('.', ',')}° ${v >= 0 ? 'N' : 'S'}`;
const fmtLon = (v) =>
  `${v.toFixed(2).replace('.', ',')}° E${v > 180 ? ` (= ${(360 - v).toFixed(2).replace('.', ',')}° O)` : ''}`;

// Distância pela superfície entre dois pontos (raio médio de Marte: 3389,5 km)
function distanceKm(a, b) {
  const r = Math.PI / 180;
  const R = 3389.5;
  const dLat = (b[1] - a[1]) * r;
  const dLon = (b[2] - a[2]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
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
 * Cartão de um local do globo 3D. place = um item de PLACE_INFO (config/placeInfo.js).
 * No celular abre de baixo para cima; no computador, no centro. Fecha no X, clicando fora ou com Esc.
 */
export default function PlaceInfoModal({ place, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!place) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [place, onClose]);

  if (!place) return null;
  const pairs = [];
  for (let i = 0; i < place.pts.length; i++) {
    for (let j = i + 1; j < place.pts.length; j++) pairs.push([place.pts[i], place.pts[j]]);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] bg-black/70 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-zinc-950 border border-amber-500/30 rounded-t-xl sm:rounded-xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 px-5 pt-4 pb-3 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
          <div className="flex-1">
            <h2 id="place-modal-title" className="text-base font-semibold text-white leading-snug">{place.nome}</h2>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{place.sub}</p>
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

        {/* Foto real (se houver) ou a ilustração esquemática */}
        {place.foto ? (
          <figure className="bg-black">
            <img
              src={`${import.meta.env.BASE_URL}${place.foto.src}`}
              alt={place.nome}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
            <figcaption className="px-5 py-1 text-[10px] font-mono text-zinc-500">Foto: {place.foto.credito}</figcaption>
          </figure>
        ) : (
          ART[place.art] && (
            // A ilustração é um SVG fixo, escrito no próprio projeto (config/placeInfo.js)
            <div className="bg-black [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: ART[place.art]() }} />
          )
        )}

        <div className="px-5 py-4 space-y-4">
          {/* Coordenadas e distâncias */}
          <section className="space-y-1.5">
            {place.pts.map(([nome, lat, lon]) => (
              <div key={nome} className="flex items-start gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-white font-medium">{nome}:</strong>{' '}
                  <span className="font-mono">{fmtLat(lat)}, {fmtLon(lon)}</span>
                </span>
              </div>
            ))}
            {pairs.map(([a, b]) => (
              <p key={a[0] + b[0]} className="text-[11px] font-mono text-zinc-500 pl-5">
                {a[0]} ↔ {b[0]}: ≈ {Math.round(distanceKm(a, b))} km em linha reta
              </p>
            ))}
          </section>

          {/* Dados rápidos */}
          {place.rapido?.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs border-y border-zinc-800 py-3">
              {place.rapido.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="font-mono text-zinc-500">{k}</dt>
                  <dd className="text-zinc-200">{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

          <Section title="Sobre o local">{place.desc}</Section>
          <Section title="Importância científica">{place.imp}</Section>
          <Section title="Para missões humanas">{place.hum}</Section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
