// ============================================================
// ROTAS DE TESTE (MOCK)
// Usadas só quando o site não tem o endereço da API (VITE_ROUTE_API_URL).
// Servem para testar a interface; NÃO são cálculo de rota de verdade.
// ============================================================
import { ROUTE_MODES } from '../config/mapConfig';

const MARS_RADIUS_KM = 3396.19;
const rad = (d) => (d * Math.PI) / 180;

function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * MARS_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function mockRoutes(origem, destino) {
  const reta = distanceKm(origem, destino);
  // Cada modo ganha uma curva diferente, só para as linhas não ficarem sobrepostas
  const bends = { menor_distancia: 0, maior_seguranca: 0.12, multicriterio: 0.05 };
  const rotas = ROUTE_MODES.map((mode) => {
    const pontos = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const bend = Math.sin(Math.PI * t) * bends[mode.id];
      pontos.push([
        origem.lat + (destino.lat - origem.lat) * t + bend,
        origem.lon + (destino.lon - origem.lon) * t - bend,
      ]);
    }
    let km = 0;
    for (let i = 1; i < pontos.length; i++) {
      km += distanceKm({ lat: pontos[i - 1][0], lon: pontos[i - 1][1] }, { lat: pontos[i][0], lon: pontos[i][1] });
    }
    return { modo: mode.id, encontrada: true, pontos, distancia_km: km, declividade_max: null, folga_min_m: null };
  });
  // Pequena espera, para a interface mostrar o "Calculando..."
  return new Promise((resolve) => setTimeout(() => resolve({ mock: true, sintetico: false, reta_km: reta, rotas }), 400));
}