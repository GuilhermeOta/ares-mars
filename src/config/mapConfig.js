import { LifeBuoy, Mountain, Wind } from 'lucide-react';

// ============================================================
// CONVENÇÃO DE COORDENADAS DO PROJETO
// Latitude °N e longitude LESTE de 0 a 360°,
// a mesma usada pela equipe de dados nos gráficos de rota.
// ============================================================

// Área de estudo: mesmo recorte dos mapas de elevação/rotas do Saulo.
export const STUDY_AREA = {
  name: 'Arcadia Planitia — setor AP',
    bounds: [
    [39.3, 200.8],   // [sul, oeste]   (pontos AP + 0,5° de margem)
    [41.25, 203.85], // [norte, leste]
  ],
};

// Locais candidatos definidos pela equipe de dados
export const CANDIDATE_SITES = [
  { id: 'ap-1', name: 'AP-1', lat: 39.8, lon: 202.1 },
  { id: 'ap-8', name: 'AP-8', lat: 40.75, lon: 201.3 },
  { id: 'ap-9', name: 'AP-9', lat: 40.02, lon: 203.35 },
];

// ============================================================
// FILTROS (pastas) E SUBFILTROS (camadas)
// Os filtros só organizam: o usuário abre a pasta e escolhe
// UM subfiltro por vez. O `id` do subfiltro é o MESMO `--id`
// usado pela equipe de dados ao exportar a camada.
// `group` (opcional) cria um subtítulo dentro da pasta.
// ============================================================
export const FILTERS = [
  {
    id: 'geologia', name: 'Geologia', icon: Mountain, color: '#f97316',
    layers: [
      { id: 'elevacao', name: 'Relevo e altitude', unit: 'm', source: 'MOLA' },
      { id: 'declividade', name: 'Inclinação do terreno', unit: '°', source: 'MOLA' },
      // TES: figuras convertidas em valores (estimativa) pelo backend/figure_to_data.py
      { id: 'silica-vidro', group: 'Composição mineralógica', name: 'Silicatos em lâmina / vidro (alto Si)', unit: '%', source: 'TES (estimativa)' },
      { id: 'quartzo', group: 'Composição mineralógica', name: 'Quartzo', unit: '%', source: 'TES (estimativa)' },
      { id: 'k-feldspato', group: 'Composição mineralógica', name: 'K-feldspato', unit: '%', source: 'TES (estimativa)' },
      { id: 'poeira-superficial', group: 'Composição mineralógica', name: 'Poeira superficial', unit: '0–1', source: 'TES (estimativa)' },
    ],
  },
  {
    id: 'atmosfera', name: 'Condições atmosféricas', icon: Wind, color: '#eab308',
    layers: [
      { id: 'mcd-temperatura', name: 'Temperatura', unit: 'K', source: 'Mars Climate Database' },
      { id: 'mcd-fluxo-ir', name: 'Infravermelho térmico na superfície', unit: 'W/m²', source: 'Mars Climate Database' },
      { id: 'mcd-pressao', name: 'Pressão atmosférica', unit: 'Pa', source: 'Mars Climate Database' },
      { id: 'raios-cosmicos', name: 'Radiação', unit: 'mGy/dia', source: 'RAD (Curiosity, em Gale)' },
      { id: 'mcd-ventos', name: 'Ventos', unit: 'm/s', source: 'Mars Climate Database' },
      { id: 'mcd-vento-direcao', name: 'Direção do vento', unit: '°', source: 'Mars Climate Database' },
      { id: 'indice-poeira', name: 'Índices de poeira', source: 'Mars Climate Database / MCS' },
      { id: 'mcd-densidade', name: 'Densidade', unit: 'kg/m³', source: 'Mars Climate Database' },
    ],
  },
  {
    id: 'suporte-vida', name: 'Suporte à vida', icon: LifeBuoy, color: '#38bdf8',
    layers: [
      { id: 'swim-ci', group: 'Disponibilidade de água', name: 'Consistência do gelo', source: 'SWIM' },
      { id: 'swim-radar-power', group: 'Disponibilidade de água', name: 'Potência do radar na superfície', source: 'SHARAD / SWIM' },
      { id: 'swim-dielectric', group: 'Disponibilidade de água', name: 'Propriedades dielétricas', source: 'SHARAD / SWIM' },
      { id: 'swim-thermal', group: 'Disponibilidade de água', name: 'Análise térmica', source: 'SWIM' },
      { id: 'swim-geomorph', group: 'Disponibilidade de água', name: 'Geomorfologia', source: 'SWIM' },
      { id: 'rugosidade', group: 'Estabilidade do terreno', name: 'Rugosidade (TRI)', unit: 'm', source: 'MOLA (calculada)' },
      { id: 'rochas-irtm', group: 'Estabilidade do terreno', name: 'Abundância de rochas', source: 'Viking IRTM (estimativa)' },
      { id: 'obstaculos', group: 'Estabilidade do terreno', name: 'Obstáculos ao deslocamento', source: 'MOLA (calculado)' },
      { id: 'atividade-vulcanica', group: 'Atividade vulcânica', name: 'Unidades geológicas e vulcanismo', source: 'USGS SIM 3292' },
    ],
  },
];

export const FILTER_BY_ID = Object.fromEntries(FILTERS.map((f) => [f.id, f]));

// Atalho: LAYER_BY_ID['mcd-pressao'] → { id, name, unit, source, filter: 'atmosfera' }
export const LAYER_BY_ID = Object.fromEntries(
  FILTERS.flatMap((f) => f.layers.map((l) => [l.id, { ...l, filter: f.id }]))
);

// Subfiltro ligado quando o mapa abre (null = nenhum)
export const DEFAULT_ACTIVE_LAYER = 'elevacao';

// Onde a equipe de dados publica as camadas (pasta public/data/layers)
export const LAYERS_MANIFEST_URL = `${import.meta.env.BASE_URL}data/layers/manifest.json`;
// Valores regionais (um número para a área toda), preenchidos à mão pela equipe de dados.
// Fica FORA da pasta layers/ porque o manifest.json é refeito pelo export_layers.py.
export const REGIONAL_VALUES_URL = `${import.meta.env.BASE_URL}data/regional.json`;

// Fundo decorativo: recorte da textura de Marte do globo 3D em volta da área,
// desfocado e tingido pelo filtro ativo. É só PAISAGEM: não é dado científico.
// (gerado a partir de src/assets/8k_mars.jpg; borda esquerda da textura = -180°)
export const CONTEXT_BACKGROUND = {
  url: `${import.meta.env.BASE_URL}data/context-mars.jpg`,
  bounds: [[10, 160], [70, 245]], // [[sul, oeste], [norte, leste]]
};

// Mapa base de reserva enquanto o relevo da área não é exportado
export const FALLBACK_BASEMAP = {
  url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
  attribution: 'Mapa base de Marte: OpenPlanetary (MOLA/MGS, NASA)',
  maxNativeZoom: 9,
};

// ============================================================
// ROTAS (API do Saulo)
// ============================================================
// Endereço da API. Vem do arquivo .env.local (VITE_ROUTE_API_URL).
// Se estiver vazio, o site usa rotas de TESTE (src/mock/routes.js).
export const ROUTE_API_URL = (import.meta.env.VITE_ROUTE_API_URL || '').replace(/\/$/, '');

// Os 3 modos do A*, com as mesmas cores dos gráficos do Saulo
export const ROUTE_MODES = [
  { id: 'menor_distancia', name: 'Menor distância', color: '#ef4444', dash: null },
  { id: 'maior_seguranca', name: 'Maior segurança', color: '#22c55e', dash: null },
  { id: 'multicriterio', name: 'Multicritério', color: '#3b82f6', dash: '8 6' },
];