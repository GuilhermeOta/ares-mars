import { ROUTE_API_URL } from '../config/mapConfig';
import { mockRoutes } from '../mock/routes';

const TIMEOUT_MS = 60000; // hospedagem gratuita pode levar ~1 min para "acordar"

/**
 * Pede as rotas entre dois pontos.
 * origem/destino: { lat, lon }  (lon LESTE 0–360)
 *
 * Resposta (igual à API):
 * { sintetico, reta_km, rotas: [{ modo, encontrada, pontos: [[lat, lon], ...],
 *   distancia_km, declividade_max, declividade_media, folga_min_m, ganho_m, perda_m, motivo }] }
 * Mais o campo `mock: true` quando vem das rotas de teste.
 */
export async function fetchRoutes(origem, destino) {
  if (!ROUTE_API_URL) return mockRoutes(origem, destino);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${ROUTE_API_URL}/rota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origem: { lat: origem.lat, lon: origem.lon },
        destino: { lat: destino.lat, lon: destino.lon },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(
      err.name === 'AbortError'
        ? 'A API de rotas demorou demais para responder.'
        : 'Não foi possível conectar à API de rotas. Ela está rodando?'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json()).detail;
    } catch {
      // resposta sem JSON
    }
    throw new Error(typeof detail === 'string' && detail ? `Sem rota: ${detail}` : `A API respondeu com erro ${res.status}.`);
  }
  return res.json();
}