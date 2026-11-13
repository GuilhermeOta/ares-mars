import { useEffect, useState } from 'react';
import { LAYERS_MANIFEST_URL, REGIONAL_VALUES_URL, LAYER_BY_ID } from '../config/mapConfig';

// Lê um JSON; se o arquivo não existir (ou vier o index.html no lugar), devolve null
const getJson = (url) =>
  fetch(url)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

/**
 * Junta as duas fontes de dados das camadas:
 *  - manifest.json  -> camadas com IMAGEM (geradas pelo export_layers.py)
 *  - regional.json  -> VALORES REGIONAIS (um número para a área toda, preenchido à mão)
 *
 * Devolve { status, base, layers }. Cada item de `layers` é uma camada com imagem
 * ou um valor regional (tem o campo `regional`).
 */
export default function useLayerManifest() {
  const [state, setState] = useState({ status: 'loading', base: null, layers: [] });

  useEffect(() => {
    let cancelled = false;
    // pasta onde está o manifest, para montar a URL de cada imagem
    const folder = LAYERS_MANIFEST_URL.slice(0, LAYERS_MANIFEST_URL.lastIndexOf('/') + 1);

    Promise.all([getJson(LAYERS_MANIFEST_URL), getJson(REGIONAL_VALUES_URL)]).then(([manifest, regional]) => {
      if (cancelled) return;

      const images = (manifest?.layers || [])
        .filter((l) => l.image && Array.isArray(l.bounds))
        .map((l) => ({ ...l, url: folder + l.image }));

      // Só entram os valores já preenchidos (value diferente de null)
      const regionals = (regional?.values || [])
        .filter((r) => r.id && typeof r.value === 'number')
        .map((r) => ({
          id: r.id,
          filter: LAYER_BY_ID[r.id]?.filter,
          label: LAYER_BY_ID[r.id]?.name || r.id,
          regional: { value: r.value, unit: r.unit || '', decimals: r.decimals ?? 1, seasons: r.seasons || [], note: r.note },
          source: r.source,
        }));

      setState({
        status: manifest ? 'ok' : 'missing',
        base: images.find((l) => l.filter === 'base') || null,
        layers: [...images.filter((l) => l.filter !== 'base'), ...regionals],
      });
    });

    return () => { cancelled = true; };
  }, []);

  return state;
}
