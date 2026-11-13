import { LAYERS_MANIFEST_URL } from '../config/mapConfig';

// Pasta onde ficam as camadas (a mesma do manifest.json)
const FOLDER = LAYERS_MANIFEST_URL.slice(0, LAYERS_MANIFEST_URL.lastIndexOf('/') + 1);

// Cada arquivo de valores é baixado UMA vez e guardado aqui
const cache = new Map();

function loadValues(layer) {
  if (!cache.has(layer.id)) {
    const promise = fetch(FOLDER + layer.values.file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buf) => (layer.values.dtype === 'int16' ? new Int16Array(buf) : new Uint8Array(buf)))
      .catch((err) => {
        cache.delete(layer.id); // permite tentar de novo no próximo clique
        throw err;
      });
    cache.set(layer.id, promise);
  }
  return cache.get(layer.id);
}

/**
 * Valor de uma camada numa coordenada (lon leste 0–360).
 * Devolve null se o ponto estiver fora da área da camada.
 *
 * A grade é linear em latitude e longitude: a linha sai da latitude
 * e a coluna sai da longitude, por regra de três com os limites (bounds).
 */
export async function sampleLayer(layer, lat, lon) {
  const v = layer.values;
  const [[south, west], [north, east]] = layer.bounds;
  if (lat < south || lat > north || lon < west || lon > east) return null;

  const data = await loadValues(layer);
  const row = Math.min(v.height - 1, Math.floor(((north - lat) / (north - south)) * v.height));
  const col = Math.min(v.width - 1, Math.floor(((lon - west) / (east - west)) * v.width));
  return data[row * v.width + col] * v.scale;
}

/** Texto pronto para a tela: "-3.897 m", "0,42°", ou as causas do obstáculo. */
export function formatLayerValue(layer, value) {
  if (value == null) return '—';
  const v = layer.values;
  if (v.bits) {
    if (value === 0) return 'Livre';
    return Object.entries(v.bits)
      .filter(([bit]) => value & Number(bit))
      .map(([, name]) => name)
      .join(' + ');
  }
  const num = value.toLocaleString('pt-BR', {
    minimumFractionDigits: v.decimals ?? 0,
    maximumFractionDigits: v.decimals ?? 0,
  });
  return `${num} ${v.unit || ''}`.trim();
}
