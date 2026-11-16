// =====================================================================
// ARES - Cartões de informação dos locais do GLOBO 3D
// =====================================================================
// Cada chave é o MESMO id usado em src/api/regions.json.
// Campos:
//   nome, sub  -> título e subtítulo do cartão
//   art        -> ilustração esquemática (funções em ART, abaixo)
//   foto       -> (opcional) foto real em public/, ex.: { src: 'places/gale.jpg', credito: 'NASA/JPL-Caltech' }
//   pts        -> pontos com coordenadas: [nome, latitude °N, longitude °E (0 a 360)]
//   rapido     -> "dados rápidos": [rótulo, valor]
//   desc, imp, hum -> textos de "Sobre o local", "Importância científica" e "Para missões humanas"
// Textos e ilustrações: equipe A.T.O.M. (Saulo).
// =====================================================================

/* ---------- ilustrações esquemáticas (SVG) ---------- */
const C = { am: '#f59e0b', ci: '#22d3ee', tx: '#d6c7b5', dim: '#8a7560', solo: '#7c3f1d', gelo: '#7dd3fc' };

const frame = (inner, cap) =>
  '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img">' +
  '<defs><linearGradient id="lgsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0806"/><stop offset="1" stop-color="#241409"/></linearGradient></defs>' +
  '<rect width="320" height="180" fill="url(#lgsk)"/>' + inner +
  `<text x="10" y="16" fill="${C.tx}" font-size="10" font-family="monospace">${cap || ''}</text></svg>`;

const T = (x, y, t, col, sz, anc) =>
  `<text x="${x}" y="${y}" fill="${col || C.tx}" font-size="${sz || 10}" font-family="monospace" text-anchor="${anc || 'start'}">${t}</text>`;

const lander = (x, y) =>
  `<g transform="translate(${x} ${y})"><path d="M-22 0 L-30 22 M22 0 L30 22 M0 0 L0 22" stroke="${C.tx}" stroke-width="2"/>` +
  `<rect x="-24" y="-14" width="48" height="14" rx="3" fill="${C.tx}"/><circle cx="14" cy="-30" r="9" fill="none" stroke="${C.ci}" stroke-width="2"/>` +
  `<line x1="14" y1="-21" x2="14" y2="-14" stroke="${C.ci}" stroke-width="2"/><rect x="-38" y="-12" width="14" height="7" fill="${C.am}"/></g>`;

export const ART = {
  jezero: () => frame(
    '<circle cx="165" cy="98" r="72" fill="#6b3a1f" stroke="#3a2316" stroke-width="4"/>' +
    `<ellipse cx="135" cy="98" rx="42" ry="46" fill="${C.gelo}" opacity="0.22" stroke="${C.gelo}" stroke-dasharray="4 3"/>` +
    `<path d="M20 52 C60 60 80 70 98 92" fill="none" stroke="${C.gelo}" stroke-width="3"/>` +
    '<path d="M98 92 L128 78 L134 98 L126 120Z" fill="#a8794b"/>' +
    `<circle cx="146" cy="112" r="5" fill="${C.ci}"/>` +
    T(150, 128, 'pouso', C.ci, 9) + T(26, 46, 'rio', C.gelo, 9) + T(104, 70, 'delta fóssil', C.tx, 9) + T(250, 172, 'antigo lago', C.gelo, 9, 'end'),
    'Cratera com delta e antigo lago'),
  gale: () => frame(
    `<path d="M0 150 L30 150 L44 122 L70 150 L110 150 L120 118 L135 96 L145 78 L160 46 L178 70 L192 96 L206 118 L214 150 L250 150 L276 122 L290 150 L320 150 L320 180 L0 180Z" fill="${C.solo}"/>` +
    '<g stroke="#3a2316" stroke-width="2"><line x1="128" y1="106" x2="192" y2="106"/><line x1="140" y1="86" x2="182" y2="86"/><line x1="150" y1="66" x2="172" y2="66"/><line x1="118" y1="126" x2="205" y2="126"/></g>' +
    `<circle cx="98" cy="146" r="5" fill="${C.ci}"/>` +
    T(80, 138, 'pouso', C.ci, 9, 'end') + T(210, 60, 'Monte Sharp ≈ 5 km', C.am, 9) + T(210, 74, 'camadas de sedimentos', C.dim, 9),
    'Corte da cratera Gale'),
  gusev: () => frame(
    '<circle cx="165" cy="92" r="70" fill="#6b3a1f" stroke="#3a2316" stroke-width="4"/>' +
    `<path d="M165 162 C165 175 160 178 150 180" stroke="${C.gelo}" stroke-width="7" fill="none" opacity="0.7"/>` +
    '<g fill="#a8794b"><ellipse cx="188" cy="84" rx="14" ry="9"/><ellipse cx="206" cy="96" rx="10" ry="7"/><ellipse cx="176" cy="102" rx="8" ry="6"/></g>' +
    `<circle cx="132" cy="106" r="5" fill="${C.ci}"/>` +
    T(124, 124, 'pouso', C.ci, 9, 'end') + T(196, 72, 'Columbia Hills', C.tx, 9) + T(176, 176, "Ma'adim Vallis (canal)", C.gelo, 9),
    'Cratera Gusev'),
  viking1: () => frame(
    `<rect y="140" width="320" height="40" fill="${C.solo}"/><g fill="#5a3018"><ellipse cx="60" cy="152" rx="12" ry="5"/><ellipse cx="250" cy="156" rx="16" ry="6"/><ellipse cx="110" cy="166" rx="8" ry="4"/></g>` +
    lander(160, 118) + T(310, 172, 'planície de Chryse', C.tx, 9, 'end'),
    'Módulo de pouso Viking 1'),
  viking2: () => {
    let f = '';
    for (let i = 0; i < 46; i++) f += `<circle cx="${((i * 53) % 310) + 5}" cy="${143 + ((i * 17) % 34)}" r="1.6" fill="#fff" opacity="0.8"/>`;
    return frame(`<rect y="140" width="320" height="40" fill="${C.solo}"/>` + f + lander(160, 118) + T(310, 172, 'geada de gelo de água', '#fff', 9, 'end'),
      'Módulo de pouso Viking 2');
  },
  olympus: () => frame(
    `<path d="M100 160 Q140 150 158 56 L198 56 Q222 150 306 160Z" fill="${C.solo}"/><ellipse cx="178" cy="56" rx="20" ry="4" fill="#241409"/>` +
    '<path d="M22 160 L56 118 L90 160Z" fill="#8a7560"/>' +
    `<line x1="100" y1="56" x2="310" y2="56" stroke="${C.am}" stroke-dasharray="3 3"/><line x1="12" y1="118" x2="100" y2="118" stroke="${C.tx}" stroke-dasharray="3 3"/>` +
    T(30, 174, 'Everest 8,8 km', C.tx, 9) + T(310, 50, 'Olympus Mons ≈ 22 km', C.am, 10, 'end'),
    'Comparação de altura'),
  arcadia: () => frame(
    `<rect y="70" width="320" height="16" fill="#b88b5a"/><rect y="86" width="320" height="40" fill="${C.gelo}" opacity="0.8"/><rect y="126" width="320" height="54" fill="#3a2316"/>` +
    `<g stroke="${C.am}" stroke-width="2"><line x1="70" y1="48" x2="70" y2="70"/><line x1="160" y1="48" x2="160" y2="70"/><line x1="250" y1="48" x2="250" y2="70"/></g>` +
    `<g fill="${C.am}"><path d="M70 48 l14 5 l-14 5z"/><path d="M160 48 l14 5 l-14 5z"/><path d="M250 48 l14 5 l-14 5z"/></g>` +
    T(70, 40, 'AP-1', C.am, 10, 'middle') + T(160, 40, 'AP-8', C.am, 10, 'middle') + T(250, 40, 'AP-9', C.am, 10, 'middle') +
    T(10, 110, 'gelo subterrâneo raso', '#06324a', 10) + T(10, 154, 'rocha', C.tx, 9),
    'Planície com gelo raso'),
};

/* ---------- dados dos locais (chave = id do regions.json) ---------- */
export const PLACE_INFO = {
  jezero: {
    nome: 'Cratera Jezero', sub: 'Perseverance · NASA', art: 'jezero',
    pts: [['Local de pouso', 18.44, 77.45]],
    rapido: [['Tipo', 'Cratera de impacto com antigo lago e delta'], ['Diâmetro', '≈ 45 km'], ['Missão', 'Mars 2020 · rover Perseverance'], ['Pouso', '18/02/2021'], ['Idade da região', '≈ 3,5 a 3,9 bilhões de anos']],
    desc: 'Há bilhões de anos, rios alimentaram um lago dentro desta cratera e depositaram sedimentos em um delta, ainda visível nas imagens orbitais. É o local mais promissor, até hoje, para procurar sinais de vida antiga.',
    imp: 'O rover coleta amostras de rochas do delta e das bordas do lago, guardadas em tubos para uma possível devolução à Terra. O experimento MOXIE produziu oxigênio a partir do CO₂ da atmosfera, e o helicóptero Ingenuity fez os primeiros voos motorizados em outro planeta.',
    hum: 'Provou duas tecnologias essenciais para humanos: produzir oxigênio no local e voar na atmosfera fina.',
  },
  gale: {
    nome: 'Cratera Gale', sub: 'Curiosity · NASA', art: 'gale',
    pts: [['Local de pouso (Bradbury Landing)', -4.59, 137.44]],
    rapido: [['Tipo', 'Cratera de impacto com montanha central'], ['Diâmetro', '≈ 154 km'], ['Montanha central', 'Aeolis Mons (Monte Sharp), ≈ 5 km acima do piso'], ['Missão', 'Mars Science Laboratory · rover Curiosity'], ['Pouso', '06/08/2012']],
    desc: 'A montanha central é formada por camadas de sedimentos, como páginas de um livro que registram a história do clima de Marte. O rover sobe essas camadas e lê essa história de baixo para cima.',
    imp: 'O Curiosity mostrou que ali existiu um lago de água doce com condições para a vida, e detectou moléculas orgânicas e variações sazonais de metano. Seu detector RAD mediu a radiação na superfície.',
    hum: 'Os dados de radiação do Curiosity são a base para estimar a dose que astronautas receberiam e para definir a blindagem dos habitats. É deles que vem o valor do filtro de radiação do ARES.',
  },
  gusev: {
    nome: 'Cratera Gusev', sub: 'Spirit · NASA', art: 'gusev',
    pts: [['Local de pouso (Columbia Memorial Station)', -14.57, 175.47]],
    rapido: [['Tipo', 'Cratera de impacto com antigo canal de rio'], ['Diâmetro', '≈ 166 km'], ['Missão', 'Mars Exploration Rover · Spirit'], ['Pouso', '04/01/2004'], ['Fim da missão', 'Contato perdido em 22/03/2010']],
    desc: "Gusev foi escolhida por ter recebido água de um grande canal, o Ma'adim Vallis. O Spirit encontrou rochas alteradas pela água e, nas Columbia Hills, sílica rica em opala, que sugere antigas fontes quentes.",
    imp: 'Foi projetado para durar 90 dias marcianos e funcionou por cerca de seis anos. Em 2009, o rover atolou em areia fofa, um exemplo real de como o solo pode ser um risco.',
    hum: 'Mostra o valor de mapear poeira e solo fofo, como nos filtros do ARES, antes de enviar veículos ou pessoas.',
  },
  viking1: {
    nome: 'Viking 1', sub: 'Chryse Planitia · NASA', art: 'viking1',
    pts: [['Local de pouso', 22.70, 312.05]],
    rapido: [['Tipo', 'Módulo de pouso estático'], ['Região', 'Chryse Planitia'], ['Pouso', '20/07/1976'], ['Operação', 'Até 11/11/1982'], ['Missão', 'Programa Viking']],
    desc: 'Foi a primeira sonda dos Estados Unidos a operar com sucesso na superfície de Marte e enviou as primeiras imagens nítidas do solo marciano.',
    imp: 'Seus experimentos de biologia deram resultados ambíguos e não acharam compostos orgânicos. Hoje se sabe que o solo contém percloratos, que podem destruir moléculas orgânicas e são tóxicos para humanos.',
    hum: 'É a referência histórica de pouso e um alerta sobre a química do solo, que precisa ser tratada em habitats e no cultivo de alimentos.',
  },
  viking2: {
    nome: 'Viking 2', sub: 'Utopia Planitia · NASA', art: 'viking2',
    pts: [['Local de pouso', 47.64, 225.74]],
    rapido: [['Tipo', 'Módulo de pouso estático'], ['Região', 'Utopia Planitia'], ['Pouso', '03/09/1976'], ['Operação', 'Até 11/04/1980'], ['Clima', 'Latitude alta (≈ 48° N), frio']],
    desc: 'Pousou numa planície do norte, mais fria que a da Viking 1. No inverno, fotografou uma fina camada de geada de gelo de água sobre o solo.',
    imp: 'A região de Utopia Planitia depois revelou, por radar, grandes depósitos de gelo enterrado, em volume comparado ao do Lago Superior. Isso a torna uma das áreas de maior interesse para uma base humana.',
    hum: 'Latitudes médias e altas combinam água acessível com mais frio e menos luz solar no inverno, um equilíbrio que o ARES ajuda a avaliar.',
  },
  'olympus-mons': {
    nome: 'Olympus Mons', sub: 'Maior vulcão do Sistema Solar', art: 'olympus',
    pts: [['Centro aproximado', 18.65, 226.2]],
    rapido: [['Tipo', 'Vulcão em escudo'], ['Altura', '≈ 22 km (≈ 2,5× o Everest)'], ['Largura', '≈ 600 km'], ['Caldeira', '≈ 80 km de largura'], ['Região', 'Província vulcânica de Tharsis']],
    desc: 'Suas encostas são suaves, com inclinação média de poucos graus, mas cercadas por um paredão de vários quilômetros de altura. Suas lavas são relativamente jovens, algumas com poucos milhões de anos.',
    imp: 'Registra a história do calor interno de Marte e pode ter tubos de lava, que serviriam de abrigo natural contra radiação. A pressão no cume é bem menor que a média do planeta.',
    hum: 'Não é local de pouso: a atmosfera ali é fina demais para frear a nave. Serve como referência de altitude e como alvo científico.',
  },
  'ap1 ap8 ap9': {
    nome: 'Área de estudo do ARES', sub: 'Pontos AP-1, AP-8 e AP-9 · fronteira Arcadia–Amazonis', art: 'arcadia',
    pts: [['AP-1', 39.80, 202.10], ['AP-8', 40.75, 201.30], ['AP-9', 40.02, 203.35]],
    rapido: [['Tipo', 'Planície vulcânica do norte'], ['Latitude', '≈ 40° N'], ['Unidade geológica', 'Av, lavas da era Amazoniana (USGS)'], ['Dados no ARES', 'Evidências de gelo subterrâneo (SWIM)'], ['Origem dos pontos', 'Locais candidatos definidos no projeto']],
    desc: 'Planície ampla e relativamente lisa, formada por antigos derrames de lava, na fronteira entre Arcadia e Amazonis Planitia. É uma região frequentemente citada entre as candidatas a missões tripuladas, por indícios de gelo raso.',
    imp: 'Gelo perto da superfície é água para beber, oxigênio e combustível, sem precisar levar tudo da Terra. No ARES, os três pontos servem para comparar rotas pelo algoritmo A*. Use o botão Descer para explorar a área no mapa 2D.',
    hum: 'Une água acessível e terreno trafegável. A latitude de ≈ 40° N exige atenção ao frio e à pouca luz solar no inverno.',
  },
};
