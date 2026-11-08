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
    [39.4, 200.8],  // [sul, oeste]
    [41.25, 203.8], // [norte, leste]
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
      { id: 'silica-vidro', group: 'Composição mineralógica', name: 'Silicatos em lâmina / vidro (alto Si)', source: 'TES' },
      { id: 'quartzo', group: 'Composição mineralógica', name: 'Quartzo', source: 'TES' },
      { id: 'k-feldspato', group: 'Composição mineralógica', name: 'K-feldspato', source: 'TES' },
      { id: 'poeira-superficial', group: 'Composição mineralógica', name: 'Poeira superficial', source: 'TES' },
    ],
  },
  {
    id: 'atmosfera', name: 'Condições atmosféricas', icon: Wind, color: '#eab308',
    layers: [
      { id: 'mcd-temperatura', name: 'Temperatura', unit: 'K', source: 'Mars Climate Database' },
      { id: 'mcd-pressao', name: 'Pressão atmosférica', unit: 'Pa', source: 'Mars Climate Database' },
      { id: 'raios-cosmicos', name: 'Radiação', unit: 'rem/ano', source: 'Modelo global' },
      { id: 'mcd-ventos', name: 'Ventos', unit: 'm/s', source: 'Mars Climate Database' },
      { id: 'indice-poeira', name: 'Índices de poeira', source: 'Mars Climate Database / MCS' },
      { id: 'mcd-densidade', name: 'Densidade', unit: 'kg/m³', source: 'Mars Climate Database' },
    ],
  },
  {
    id: 'suporte-vida', name: 'Suporte à vida', icon: LifeBuoy, color: '#38bdf8',
    layers: [
      { id: 'swim-ci', group: 'Disponibilidade de água', name: 'Consistência do gelo', source: 'SWIM' },
      { id: 'swim-reflectors', group: 'Disponibilidade de água', name: 'Refletores de radar profundos', source: 'SHARAD / SWIM' },
      { id: 'swim-radar-power', group: 'Disponibilidade de água', name: 'Potência do radar na superfície', source: 'SHARAD / SWIM' },
      { id: 'swim-dielectric', group: 'Disponibilidade de água', name: 'Propriedades dielétricas', source: 'SHARAD / SWIM' },
      { id: 'swim-thermal', group: 'Disponibilidade de água', name: 'Análise térmica', source: 'SWIM' },
      { id: 'swim-geomorph', group: 'Disponibilidade de água', name: 'Geomorfologia', source: 'SWIM' },
      { id: 'rugosidade', group: 'Estabilidade do terreno', name: 'Rugosidade (TRI)', unit: 'm', source: 'MOLA' },
      { id: 'rochas-irtm', group: 'Estabilidade do terreno', name: 'Abundância de rochas', unit: '%', source: 'Viking IRTM' },
      { id: 'atividade-vulcanica', group: 'Atividade vulcânica', name: 'Evidências de vulcanismo', source: 'A definir' },
    ],
  },
];

export const FILTER_BY_ID = Object.fromEntries(FILTERS.map((f) => [f.id, f]));

// Atalho: LAYER_BY_ID['mcd-pressao'] → { id, name, unit, source, filter: 'atmosfera' }
export const LAYER_BY_ID = Object.fromEntries(
  FILTERS.flatMap((f) => f.layers.map((l) => [l.id, { ...l, filter: f.id }]))
);

// Subfiltro ligado quando o mapa abre (null = nenhum)
export const DEFAULT_ACTIVE_LAYER = 'swim-ci';

// Onde a equipe de dados publica as camadas (pasta public/data/layers)
export const LAYERS_MANIFEST_URL = `${import.meta.env.BASE_URL}data/layers/manifest.json`;

// Mapa base de reserva enquanto o relevo da área não é exportado
export const FALLBACK_BASEMAP = {
  url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
  attribution: 'Mapa base de Marte: OpenPlanetary (MOLA/MGS, NASA)',
  maxNativeZoom: 9,
};