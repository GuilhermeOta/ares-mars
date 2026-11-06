import { Droplet, Mountain, ShieldAlert, Wind } from 'lucide-react';

// Convenção do projeto: latitude °N e longitude LESTE de 0 a 360°.

// Mesmo recorte dos mapas de elevação/rotas do Saulo.
export const STUDY_AREA = {
  name: 'Arcadia Planitia — setor AP',
  bounds: [
    [39.4, 200.8],  // [sul, oeste]
    [41.25, 203.8], // [norte, leste]
  ],
};

export const CANDIDATE_SITES = [
  { id: 'ap-1', name: 'AP-1', lat: 39.8, lon: 202.1 },
  { id: 'ap-8', name: 'AP-8', lat: 40.75, lon: 201.3 },
  { id: 'ap-9', name: 'AP-9', lat: 40.02, lon: 203.35 },
];

export const FILTERS = [
  { id: 'agua', name: 'Água (subterrânea)', icon: Droplet, color: '#38bdf8', desc: 'SWIM, SHARAD, HiRISE' },
  { id: 'geologia', name: 'Geologia e minerais', icon: Mountain, color: '#f97316', desc: 'CRISM, TES, HiRISE, CTX' },
  { id: 'radiacao', name: 'Radiação', icon: ShieldAlert, color: '#ef4444', desc: 'Modelos + RAD (Gale, referência)' },
  { id: 'ventos', name: 'Ventos e poeira', icon: Wind, color: '#eab308', desc: 'Mars Climate Database, MCS' },
];

// Atalho: FILTER_BY_ID.agua → objeto do filtro de água
export const FILTER_BY_ID = Object.fromEntries(FILTERS.map((f) => [f.id, f]));

export const DEFAULT_ACTIVE_FILTERS = { agua: true, geologia: false, radiacao: false, ventos: false };

// Onde a equipe de dados vai colocar as camadas exportadas
export const LAYERS_MANIFEST_URL = `${import.meta.env.BASE_URL}data/layers/manifest.json`;

// Mapa base de reserva enquanto o relevo da área não é exportado
export const FALLBACK_BASEMAP = {
  url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
  attribution: 'Mapa base de Marte: OpenPlanetary (MOLA/MGS, NASA)',
  maxNativeZoom: 9,
};