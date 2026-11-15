/* ARES – Abas explicativas dos Filtros Científicos
 * Como usar: coloque este arquivo ao lado do index.html e adicione, antes de </body>:
 *   <script src="ares-info.js" defer></script>
 * O script detecta sozinho os títulos dos filtros (pelo texto) e adiciona o botão "i".
 * Para trocar a ilustração por uma imagem real (NASA etc.), preencha o campo img: "caminho.jpg"
 * no filtro desejado em INFO.
 */
(function () {
  "use strict";

  /* ---------- utilidades ---------- */
  var norm = function (s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  };
  var rnd = function (seed) {
    var x = seed;
    return function () { x = (x * 16807) % 2147483647; return x / 2147483647; };
  };
  var C = { am: "#f59e0b", lj: "#ea580c", ci: "#22d3ee", tx: "#d6c7b5", dim: "#8a7560", solo: "#7c3f1d", gelo: "#7dd3fc" };
  var frame = function (inner, cap) {
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0806"/><stop offset="1" stop-color="#241409"/></linearGradient></defs>' +
      '<rect width="320" height="180" fill="url(#sk)"/>' + inner +
      '<text x="10" y="16" fill="' + C.tx + '" font-size="10" font-family="monospace">' + (cap || "") + '</text></svg>';
  };
  var T = function (x, y, t, col, sz, anc) {
    return '<text x="' + x + '" y="' + y + '" fill="' + (col || C.tx) + '" font-size="' + (sz || 10) +
      '" font-family="monospace" text-anchor="' + (anc || "start") + '">' + t + '</text>';
  };

  /* ---------- ilustrações (SVG gerado em código) ---------- */
  var ART = {
    relief: function () {
      return frame(
        '<path d="M0 150 L40 142 L70 112 L95 128 L130 84 L160 66 L190 94 L220 124 L260 108 L320 136 L320 180 L0 180Z" fill="' + C.solo + '"/>' +
        '<g transform="translate(200 40) rotate(-15)"><rect x="-14" y="-6" width="28" height="12" rx="2" fill="' + C.tx + '"/><rect x="-36" y="-3" width="20" height="6" fill="' + C.ci + '"/><rect x="16" y="-3" width="20" height="6" fill="' + C.ci + '"/></g>' +
        '<g stroke="' + C.am + '" stroke-dasharray="3 3" fill="none"><line x1="200" y1="46" x2="130" y2="84"/><line x1="200" y1="46" x2="160" y2="66"/><line x1="200" y1="46" x2="220" y2="124"/></g>' +
        '<g fill="' + C.am + '"><circle cx="130" cy="84" r="3"/><circle cx="160" cy="66" r="3"/><circle cx="220" cy="124" r="3"/></g>' +
        T(250, 70, "laser", C.am) + T(250, 82, "tempo de ida", C.dim, 9) + T(250, 93, "e volta = altura", C.dim, 9),
        "Altímetro a laser (MOLA)");
    },
    slope: function () {
      return frame(
        '<path d="M30 150 L290 150 L290 70Z" fill="' + C.solo + '"/>' +
        '<path d="M90 150 A60 60 0 0 0 87.4 132.5" stroke="' + C.am + '" fill="none" stroke-width="2"/>' +
        T(98, 146, "θ", C.am, 13) +
        '<line x1="30" y1="150" x2="290" y2="150" stroke="' + C.tx + '" stroke-dasharray="4 4"/>' +
        '<circle cx="190" cy="102" r="6" fill="' + C.ci + '"/>' +
        T(160, 92, "rover", C.ci, 9) + T(290, 168, "θ = ângulo de inclinação", C.dim, 9, "end"),
        "Inclinação = quanto o terreno sobe por distância");
    },
    spectrum: function (col, lab) {
      return frame(
        '<line x1="30" y1="150" x2="300" y2="150" stroke="' + C.dim + '"/><line x1="30" y1="30" x2="30" y2="150" stroke="' + C.dim + '"/>' +
        '<path d="M30 62 C60 64 70 106 90 114 C110 124 120 72 150 68 C180 64 190 124 215 116 C240 108 250 72 300 70" fill="none" stroke="' + col + '" stroke-width="3"/>' +
        '<path d="M90 114 L90 150 M215 116 L215 150" stroke="' + col + '" stroke-dasharray="3 3"/>' +
        T(165, 168, "comprimento de onda (infravermelho térmico)", C.dim, 9, "middle") +
        T(300, 40, lab, col, 10, "end") + T(300, 52, "quedas = absorção do mineral", C.dim, 9, "end"),
        "Espectro de emissão (TES)");
    },
    dustsurf: function () {
      var r = rnd(7), d = "";
      for (var i = 0; i < 40; i++) d += '<circle cx="' + (20 + r() * 130) + '" cy="' + (50 + r() * 100) + '" r="' + (1 + r() * 2) + '" fill="#e8c99a"/>';
      return frame(
        '<rect x="15" y="40" width="140" height="120" fill="#b88b5a"/>' + d +
        '<rect x="165" y="40" width="140" height="120" fill="#3a2316"/><circle cx="210" cy="95" r="14" fill="#241409"/><circle cx="260" cy="120" r="10" fill="#2a1a0f"/><circle cx="240" cy="70" r="8" fill="#241409"/>' +
        T(85, 175, "índice ≈ 1 (poeira)", C.am, 9, "middle") + T(235, 175, "índice ≈ 0 (rocha)", C.am, 9, "middle"),
        "Cobertura de poeira");
    },
    temp: function () {
      return frame(
        '<line x1="20" y1="150" x2="300" y2="150" stroke="' + C.dim + '"/>' +
        '<path d="M20 120 C80 130 100 40 160 40 C220 40 240 130 300 120" fill="none" stroke="' + C.lj + '" stroke-width="3"/>' +
        '<line x1="20" y1="85" x2="300" y2="85" stroke="' + C.am + '" stroke-dasharray="5 4"/>' +
        '<circle cx="262" cy="30" r="10" fill="' + C.am + '"/>' +
        T(24, 80, "média anual", C.am, 9) + T(90, 168, "noite", C.dim, 9, "middle") + T(160, 168, "dia", C.dim, 9, "middle") + T(230, 168, "noite", C.dim, 9, "middle"),
        "Temperatura da superfície (K)");
    },
    thermalir: function () {
      var w = "";
      for (var i = 0; i < 6; i++) { var x = 50 + i * 45; w += '<path d="M' + x + ' 140 q10 -15 0 -30 t0 -30 t0 -30" fill="none" stroke="' + C.lj + '" stroke-width="2.5"/><path d="M' + (x - 5) + ' 52 L' + x + ' 42 L' + (x + 5) + ' 52" fill="none" stroke="' + C.lj + '" stroke-width="2.5"/>'; }
      return frame('<rect y="140" width="320" height="40" fill="' + C.solo + '"/>' + w + T(310, 168, "W/m² emitidos", C.tx, 9, "end"), "Energia térmica emitida pelo solo");
    },
    pressure: function () {
      var a = "";
      for (var i = 0; i < 6; i++) a += '<path d="M' + (50 + i * 44) + ' 40 l0 50 m-5 -8 l5 8 l5 -8" stroke="' + C.ci + '" stroke-width="2" fill="none"/>';
      return frame(
        '<rect x="0" y="30" width="320" height="70" fill="#ea580c" opacity="0.12"/>' + a +
        '<rect y="110" width="320" height="70" fill="' + C.solo + '"/>' +
        T(160, 135, "≈ 600 Pa ≈ 0,6% da pressão da Terra", C.am, 10, "middle") + T(160, 152, "varia com a altitude e a estação", C.dim, 9, "middle"),
        "Peso da coluna de atmosfera");
    },
    radiation: function () {
      var p = "";
      [[50, 28, 90, 120], [110, 20, 140, 118], [170, 26, 175, 120], [230, 20, 215, 118], [280, 30, 250, 122]].forEach(function (q) {
        p += '<line x1="' + q[0] + '" y1="' + q[1] + '" x2="' + q[2] + '" y2="' + q[3] + '" stroke="' + C.ci + '" stroke-width="2"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="3" fill="' + C.ci + '"/>';
      });
      return frame(
        p + '<rect x="0" y="84" width="320" height="14" fill="' + C.lj + '" opacity="0.18"/><rect y="126" width="320" height="54" fill="' + C.solo + '"/>' +
        '<path d="M145 126 a15 15 0 0 1 30 0Z" fill="' + C.tx + '"/>' +
        T(10, 70, "raios cósmicos e partículas solares", C.ci, 9) + T(310, 96, "atmosfera fina", C.dim, 9, "end") + T(160, 168, "dose em rem/ano", C.am, 10, "middle"),
        "Radiação na superfície");
    },
    wind: function () {
      return frame(
        '<g fill="none" stroke="' + C.ci + '" stroke-width="2.5"><path d="M20 50 C80 30 110 70 170 50 S260 40 295 55"/><path d="M20 90 C70 70 120 110 180 90 S260 80 295 95"/><path d="M20 130 C90 112 120 150 190 130 S260 120 295 135"/></g>' +
        '<g fill="' + C.ci + '"><path d="M295 55 l-9 -5 l2 10z"/><path d="M295 95 l-9 -5 l2 10z"/><path d="M295 135 l-9 -5 l2 10z"/></g>' +
        T(160, 172, "velocidade em m/s", C.am, 10, "middle"),
        "Circulação atmosférica");
    },
    dustidx: function () {
      return frame(
        '<circle cx="262" cy="42" r="16" fill="' + C.am + '"/>' +
        '<ellipse cx="160" cy="80" rx="150" ry="14" fill="#c08a52" opacity="0.30"/><ellipse cx="160" cy="105" rx="150" ry="16" fill="#c08a52" opacity="0.45"/>' +
        '<rect y="135" width="320" height="45" fill="' + C.solo + '"/>' +
        '<g stroke="' + C.am + '" opacity="0.6"><line x1="256" y1="58" x2="200" y2="134"/><line x1="268" y1="58" x2="250" y2="134"/></g>' +
        T(24, 70, "poeira em suspensão", C.tx, 9) + T(24, 168, "mais poeira = menos luz no solo", C.dim, 9),
        "Opacidade da poeira");
    },
    density: function () {
      var r = rnd(11), a = "", b = "";
      for (var i = 0; i < 90; i++) a += '<circle cx="' + (28 + r() * 114) + '" cy="' + (52 + r() * 86) + '" r="2" fill="' + C.ci + '"/>';
      b = '<circle cx="215" cy="80" r="2" fill="' + C.ci + '"/><circle cx="262" cy="118" r="2" fill="' + C.ci + '"/>';
      return frame(
        '<rect x="20" y="44" width="130" height="102" fill="none" stroke="' + C.dim + '"/><rect x="170" y="44" width="130" height="102" fill="none" stroke="' + C.dim + '"/>' + a + b +
        T(85, 162, "Terra ≈ 1,2 kg/m³", C.tx, 9, "middle") + T(235, 162, "Marte ≈ 0,02 kg/m³", C.am, 9, "middle"),
        "Moléculas de ar por volume");
    },
    ice: function () {
      return frame(
        '<rect y="62" width="320" height="18" fill="#b88b5a"/><rect y="80" width="320" height="44" fill="' + C.gelo + '" opacity="0.8"/><rect y="124" width="320" height="56" fill="#3a2316"/>' +
        '<path d="M150 30 L150 104 M144 96 L150 104 L156 96" stroke="' + C.am + '" stroke-width="2.5" fill="none"/>' +
        '<path d="M290 62 L290 124" stroke="' + C.tx + '"/>' +
        T(284, 96, "poucos m", C.tx, 9, "end") + T(10, 74, "poeira", "#241409", 9) + T(10, 106, "gelo de água", "#06324a", 10) + T(10, 150, "rocha", C.tx, 9),
        "Gelo enterrado (SWIM)");
    },
    radar: function () {
      return frame(
        '<rect x="148" y="22" width="24" height="10" rx="2" fill="' + C.tx + '"/>' +
        '<g fill="none" stroke="' + C.ci + '"><path d="M120 60 a60 60 0 0 0 80 0"/><path d="M104 74 a85 85 0 0 0 112 0"/></g>' +
        '<rect y="100" width="320" height="80" fill="' + C.solo + '"/><line y1="140" y2="140" x1="0" x2="320" stroke="' + C.am + '" stroke-width="2"/>' +
        '<path d="M160 36 L160 100 L160 140" stroke="' + C.ci + '" stroke-dasharray="3 3" fill="none"/>' +
        '<path d="M190 140 L190 40" stroke="' + C.am + '" stroke-dasharray="3 3" fill="none"/>' +
        T(10, 114, "superfície", C.tx, 9) + T(10, 154, "interface (gelo / rocha)", C.am, 9) + T(300, 172, "SHARAD ≈ 20 MHz", C.dim, 9, "end"),
        "Radar que enxerga por dentro");
    },
    dielectric: function () {
      return frame(
        '<rect y="50" width="320" height="34" fill="#b88b5a"/><rect y="84" width="320" height="40" fill="' + C.gelo + '" opacity="0.8"/><rect y="124" width="320" height="56" fill="#5a3018"/>' +
        T(10, 72, "regolito seco: ε baixo", "#241409", 9) + T(10, 108, "gelo: ε ≈ 3", "#06324a", 10) + T(10, 156, "rocha densa: ε ≈ 7 ou mais", C.tx, 9) +
        T(310, 40, "valores típicos", C.dim, 9, "end"),
        "Permissividade (ε) dos materiais");
    },
    thermalan: function () {
      return frame(
        '<line x1="20" y1="150" x2="300" y2="150" stroke="' + C.dim + '"/>' +
        '<path d="M20 120 C80 130 100 30 160 30 C220 30 240 130 300 120" fill="none" stroke="' + C.lj + '" stroke-width="3"/>' +
        '<path d="M20 100 C80 104 100 70 160 70 C220 70 240 104 300 100" fill="none" stroke="' + C.gelo + '" stroke-width="3"/>' +
        T(300, 24, "poeira seca: oscila muito", C.lj, 9, "end") + T(300, 62, "gelo/rocha: oscila pouco", C.gelo, 9, "end") + T(160, 168, "ciclo dia e noite", C.dim, 9, "middle"),
        "Resposta térmica do solo");
    },
    geomorph: function () {
      var P = ["20,60 90,50 110,95 60,120 20,105", "90,50 170,58 180,100 110,95", "170,58 250,48 270,95 180,100", "250,48 300,60 300,110 270,95", "60,120 110,95 180,100 170,150 70,155", "180,100 270,95 300,110 300,150 170,150"], s = "";
      P.forEach(function (p) { s += '<polygon points="' + p + '" fill="#5a3018" stroke="#93c5fd" stroke-width="3"/>'; });
      return frame(s + T(160, 172, "polígonos = gelo no subsolo", C.am, 10, "middle"), "Formas do relevo como pistas");
    },
    tri: function () {
      var h = [[12, 14, 11], [15, 10, 18], [13, 16, 12]], s = "";
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
        var c = (i === 1 && j === 1);
        s += '<rect x="' + (70 + j * 56) + '" y="' + (30 + i * 36) + '" width="54" height="34" fill="' + (c ? C.am : "#3a2316") + '"/>' + T(97 + j * 56, 53 + i * 36, h[i][j] + " m", c ? "#1a0f08" : C.tx, 11, "middle");
      }
      return frame(s + T(160, 160, "TRI = √ Σ (Δaltura)² entre a célula e as 8 vizinhas", C.tx, 9, "middle"), "Índice de rugosidade do terreno");
    },
    rocks: function () {
      var r = rnd(5), s = "";
      for (var i = 0; i < 34; i++) s += '<ellipse cx="' + (14 + r() * 292) + '" cy="' + (60 + r() * 100) + '" rx="' + (2 + r() * 7) + '" ry="' + (2 + r() * 5) + '" fill="#241409"/>';
      return frame('<rect y="44" width="320" height="136" fill="#9a6a3f"/>' + s + T(10, 175, "% da superfície coberta por rochas", "#1a0f08", 9), "Abundância de rochas");
    },
    obstacles: function () {
      return frame(
        '<rect y="30" width="320" height="150" fill="#5a3018"/>' +
        '<g fill="#b91c1c" opacity="0.85"><circle cx="110" cy="112" r="18"/><circle cx="175" cy="82" r="16"/><circle cx="225" cy="104" r="14"/></g>' +
        '<path d="M30 150 L290 50" stroke="#fca5a5" stroke-dasharray="4 4" fill="none"/>' +
        '<path d="M30 150 C80 150 80 80 140 100 C195 118 195 52 290 50" stroke="#4ade80" stroke-width="3" fill="none"/>' +
        '<circle cx="30" cy="150" r="6" fill="#84cc16"/><circle cx="290" cy="50" r="6" fill="#ef4444"/>' +
        T(160, 172, "vermelho = bloqueado · verde = rota segura", C.tx, 9, "middle"),
        "Obstáculos e rota");
    },
    volcano: function () {
      return frame(
        '<path d="M20 160 Q100 150 130 84 L190 84 Q220 150 300 160Z" fill="' + C.solo + '"/><ellipse cx="160" cy="84" rx="30" ry="6" fill="#241409"/>' +
        '<path d="M150 90 Q140 120 120 150 M170 90 Q180 120 205 152" stroke="' + C.lj + '" stroke-width="3" fill="none"/>' +
        '<path d="M160 78 Q150 50 165 30 Q175 50 170 70" fill="#c08a52" opacity="0.35"/>' +
        T(300, 172, "Olympus Mons ≈ 22 km de altura", C.am, 9, "end"),
        "Vulcanismo marciano");
    }
  };

  /* ---------- conteúdo ---------- */
  var INFO = [
    { t: "Relevo e altitude", art: "relief", src: "MOLA · Mars Global Surveyor",
      como: "A sonda em órbita disparou pulsos de laser infravermelho contra o solo e cronometrou o tempo de ida e volta de cada um. Multiplicando o tempo pela velocidade da luz obtém-se a distância, e comparando com a posição conhecida da sonda chega-se à altura do terreno. Centenas de milhões de medições foram combinadas no mapa global do altímetro MOLA, com cerca de 460 m por pixel.",
      serve: "Mostra montanhas, vales, bacias e crateras. É a base da maioria dos outros mapas derivados (inclinação, rugosidade, obstáculos) e do cálculo de rotas.",
      missao: "A altitude define quanta atmosfera existe para frear a nave na descida (regiões baixas têm mais ar), influencia radiação, temperatura e pressão, e orienta a escolha do local de pouso e dos percursos." },
    { t: "Inclinação do terreno", art: "slope", src: "MOLA · graus (°)",
      como: "É calculada a partir do mapa de altitude do MOLA: para cada ponto, compara-se a diferença de altura com os pontos vizinhos e converte-se essa variação em um ângulo.",
      serve: "Indica o quão íngreme é cada trecho, separando planícies de encostas, paredes de cratera e vales.",
      missao: "Pouso exige terrenos muito planos para a nave não tombar. Rovers, veículos e astronautas têm limite de subida e de estabilidade, então a inclinação é um custo direto no cálculo de rotas." },
    { t: "Silicatos em lâmina / vidro (alto Si)", art: "spectrum", col: "#f59e0b", lab: "silicatos ricos em Si", src: "TES (estimativa) · %",
      como: "O espectrômetro TES mede o calor emitido pelo solo em muitos comprimentos de onda do infravermelho. Cada mineral absorve de um jeito próprio, deixando uma impressão digital no espectro. Comparando com espectros de laboratório, estima-se a porcentagem de cada material. É uma estimativa, com incerteza.",
      serve: "Aponta regiões com vidro vulcânico ou materiais alterados, ricos em silício.",
      missao: "Sílica pode indicar passado vulcânico ou com água, e preserva bem possíveis marcas de vida antiga. Também é uma fonte de silício para fabricar vidro e cerâmica com recursos locais." },
    { t: "Quartzo", art: "spectrum", col: "#e5e7eb", lab: "quartzo", src: "TES (estimativa) · %",
      como: "Mesmo método do TES: o espectro de emissão térmica da superfície é decomposto em contribuições de minerais conhecidos, e a parcela de quartzo é estimada em porcentagem.",
      serve: "O quartzo é raro em Marte. Onde aparece, sugere rochas evoluídas, formadas por diferenciação do magma.",
      missao: "Revela a história geológica do local e pode ser fonte de silício para construção, vidro e painéis solares. Por ser uma estimativa, deve ser confirmada por medições locais." },
    { t: "K-feldspato", art: "spectrum", col: "#f472b6", lab: "K-feldspato", src: "TES (estimativa) · %",
      como: "Obtido pelo mesmo processo espectral do TES, separando a assinatura do feldspato rico em potássio das demais.",
      serve: "Ajuda a identificar rochas ígneas evoluídas e diferentes tipos de crosta.",
      missao: "Indica boas áreas para estudos científicos, como datação das rochas, e materiais úteis para cerâmicas e cimentos feitos com recursos locais." },
    { t: "Poeira superficial", art: "dustsurf", src: "TES (estimativa) · 0–1",
      como: "O espectro térmico do TES muda quando o solo está coberto por poeira fina. A partir disso cria-se um índice de 0 (rocha exposta) a 1 (coberto de poeira).",
      serve: "Mostra onde a superfície está encoberta por poeira, que também tende a ser mais clara e mais fofa.",
      missao: "Poeira suja painéis solares, desgasta equipamentos e trajes, esconde minerais e pode formar solo fofo onde rodas afundam. Orienta pouso, energia solar e tráfego." },
    { t: "Temperatura", art: "temp", src: "Mars Climate Database · K",
      como: "Vem do Mars Climate Database, um modelo climático global ajustado com observações de várias sondas. O valor exibido é uma média ao longo do ano para a região.",
      serve: "Mostra onde é mais frio ou mais quente e quanto a temperatura varia entre dia e noite.",
      missao: "Define o isolamento de habitats e trajes, o consumo de energia para aquecimento, o funcionamento de baterias e eletrônicos e a possibilidade de água líquida." },
    { t: "Infravermelho térmico na superfície", art: "thermalir", src: "Mars Climate Database · W/m²",
      como: "É o fluxo de energia que o solo emite como calor, calculado pelo modelo climático do Mars Climate Database, em watts por metro quadrado.",
      serve: "Mostra o balanço de energia da superfície, ou seja, o quanto o solo aquece de dia e esfria à noite.",
      missao: "Ajuda a projetar o controle térmico de habitats e equipamentos e a estimar o resfriamento noturno, que é crítico em Marte." },
    { t: "Pressão atmosférica", art: "pressure", src: "Mars Climate Database · Pa",
      como: "É calculada pelo modelo climático do Mars Climate Database, que considera altitude e o ciclo sazonal em que parte do CO₂ congela nas calotas polares e volta a evaporar.",
      serve: "Mostra a pressão do ar em cada região. Em média é cerca de 0,6% da terrestre e varia em torno de 25% ao longo do ano.",
      missao: "Define o projeto de paraquedas e da descida, exige trajes e habitats pressurizados e determina se líquidos evaporam. Regiões baixas têm pressão maior." },
    { t: "Radiação", art: "radiation", src: "Modelo global · rem/ano",
      como: "É estimada por um modelo global que considera raios cósmicos e partículas solares, atenuados pela atmosfera fina e dependentes da altitude. Medições feitas na superfície pelo rover Curiosity ajudam a calibrar a ordem de grandeza, cerca de 20 rem por ano. Se aparecer 'sem dados', não há recorte regional disponível.",
      serve: "Mostra onde a dose de radiação é maior ou menor.",
      missao: "Marte tem pouca proteção atmosférica e magnética. A dose limita o tempo de permanência, define a blindagem dos habitats e indica locais mais protegidos, como regiões baixas, cavernas e tubos de lava." },
    { t: "Ventos", art: "wind", src: "Mars Climate Database · m/s",
      como: "A velocidade do vento vem do modelo de circulação atmosférica do Mars Climate Database, calibrado com observações de sondas e rovers.",
      serve: "Mostra as regiões ventosas, que levantam poeira e podem gerar tempestades.",
      missao: "Como o ar é fino, o vento tem pouca força mecânica, mas transporta poeira. Afeta a descida, voos de drones, o desgaste de equipamentos e a limpeza natural de painéis solares." },
    { t: "Índices de poeira", art: "dustidx", src: "Mars Climate Database / MCS",
      como: "Baseia-se na opacidade da poeira na atmosfera, medida pelo Mars Climate Sounder da sonda MRO e organizada pelo Mars Climate Database.",
      serve: "Indica quanta poeira há em suspensão e quando ocorrem tempestades.",
      missao: "Menos luz chega aos painéis solares e a visibilidade cai. A tempestade global de 2018 encerrou a missão do rover Opportunity, por isso o índice é essencial para planejar energia." },
    { t: "Densidade", art: "density", src: "Mars Climate Database · kg/m³",
      como: "Calculada pelo modelo climático a partir de pressão e temperatura, usando a lei dos gases. Em média é cerca de 1% da densidade do ar na Terra.",
      serve: "Mostra quanto ar existe em cada região.",
      missao: "Determina a frenagem aerodinâmica na descida, a sustentação de drones e helicópteros e o desempenho de motores e ventilação." },
    { t: "Consistência do gelo", art: "ice", src: "SWIM",
      como: "O projeto SWIM (Subsurface Water Ice Mapping) combina vários conjuntos de dados, como radar, análise térmica e feições do relevo, e avalia o quanto eles concordam sobre a presença de gelo de água a poucos metros de profundidade.",
      serve: "Mostra onde a evidência de gelo enterrado é mais consistente.",
      missao: "Água é o recurso mais valioso de uma missão: serve para beber, produzir oxigênio e combustível e proteger contra radiação. Pousar perto de gelo acessível reduz muito a carga a levar da Terra." },
    { t: "Potência do radar na superfície", art: "radar", src: "SHARAD / SWIM",
      como: "O radar SHARAD, da sonda MRO, envia ondas de rádio que atravessam o solo e voltam quando encontram mudanças de material. Mede-se a intensidade do eco refletido pela superfície.",
      serve: "Ajuda a interpretar o eco subterrâneo e a identificar a rugosidade e o tipo de material da superfície.",
      missao: "Permite procurar gelo e camadas sem precisar escavar, apoiando a escolha de locais de pouso e perfuração." },
    { t: "Propriedades dielétricas", art: "dielectric", src: "SHARAD / SWIM",
      como: "A velocidade da onda de radar depende da permissividade dielétrica do material. Comparando o atraso do eco com a profundidade, estima-se essa propriedade.",
      serve: "Diferencia materiais: o gelo tem permissividade baixa, enquanto rocha densa tem valores maiores.",
      missao: "Ajuda a confirmar se uma camada é gelo limpo, solo ou rocha, e a estimar o volume de água disponível para extração." },
    { t: "Análise térmica", art: "thermalan", src: "SWIM · regional",
      como: "Usa a temperatura da superfície ao longo do dia e das estações, medida por instrumentos infravermelhos, para estimar a inércia térmica. Gelo e rocha variam pouco, enquanto poeira fina esquenta e esfria rápido. Gelo enterrado altera esse padrão.",
      serve: "Fornece uma pista independente da presença de gelo raso.",
      missao: "Dá mais confiança na localização de água, reduzindo o risco de escolher um local sem recurso." },
    { t: "Geomorfologia", art: "geomorph", src: "SWIM · regional",
      como: "Identifica nas imagens orbitais formas associadas a gelo, como terreno poligonal, depressões em forma de concha e crateras recentes que expuseram material brilhante.",
      serve: "Complementa radar e dados térmicos com evidências visuais do relevo.",
      missao: "Ajuda a validar os locais com gelo e a planejar o acesso a ele com segurança." },
    { t: "Rugosidade (TRI)", art: "tri", src: "MOLA (calculada) · m",
      como: "O Terrain Ruggedness Index soma as diferenças de altura entre cada ponto e seus oito vizinhos no mapa do MOLA. Valores maiores indicam terreno mais acidentado.",
      serve: "Diferencia planícies lisas de terrenos acidentados.",
      missao: "Terrenos acidentados danificam rodas e pernas de pouso e dificultam o deslocamento. A rugosidade é essencial para escolher locais de pouso e para o custo de cada trecho da rota." },
    { t: "Abundância de rochas", art: "rocks", src: "Figura global (estimativa)",
      como: "É estimada por contraste térmico: rochas esfriam mais devagar que o solo fino, então medições infravermelhas permitem estimar a fração da superfície coberta por rochas. É uma estimativa regional, sem detalhe de cada pedra.",
      serve: "Mostra onde há campos de pedras e onde o solo é fino.",
      missao: "Rochas grandes são um risco para o pouso e para o deslocamento, mas também são fonte de material de construção e de amostras científicas." },
    { t: "Obstáculos ao deslocamento", art: "obstacles", src: "MOLA (calculado)",
      como: "É calculado a partir dos dados do MOLA, como inclinação, rugosidade e desníveis. Trechos que passam dos limites seguros são marcados como obstáculos.",
      serve: "Indica o que deve ser evitado em uma rota.",
      missao: "Alimenta o algoritmo A*, que encontra o caminho mais seguro e eficiente para rovers e astronautas, economizando energia, tempo e risco." },
    { t: "Unidades geológicas e vulcanismo", art: "volcano", src: "USGS SIM 3292",
      como: "Vem do mapa geológico global de Marte do USGS (Scientific Investigations Map 3292), feito por especialistas a partir de imagens e dados topográficos orbitais, que classificam o terreno por tipo e idade.",
      serve: "Mostra a origem e a idade de cada região e onde há vulcões e fluxos de lava.",
      missao: "Terrenos vulcânicos oferecem materiais de construção, possíveis tubos de lava como abrigo e pistas de calor interno, mas podem ser acidentados. Também orientam a escolha de alvos científicos." }
  ];

  var MAP = {};
  INFO.forEach(function (d) { MAP[norm(d.t)] = d; });

  /* ---------- estilo ---------- */
  var css = [
    ".ares-i{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;min-width:20px;margin-left:8px;border-radius:50%;background:#fff;color:#111;border:0;padding:0;font:italic 700 13px/1 Georgia,serif;cursor:pointer;vertical-align:middle;box-shadow:0 0 0 2px rgba(245,158,11,.25)}",
    ".ares-i:active{transform:scale(.92)}",
    ".ares-ov{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);display:none;align-items:flex-end;justify-content:center}",
    ".ares-ov.on{display:flex}",
    ".ares-sh{width:100%;max-width:520px;max-height:88vh;overflow-y:auto;background:#0f0b08;color:#e9ddcc;border:1px solid #3a2a1a;border-radius:18px 18px 0 0;font-family:system-ui,sans-serif;animation:aresUp .22s ease-out}",
    "@keyframes aresUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}",
    ".ares-hd{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px 16px;background:#0f0b08;border-bottom:1px solid #2c1f14}",
    ".ares-hd h3{margin:0;font-size:16px;letter-spacing:.04em;color:#f59e0b}",
    ".ares-src{margin-top:3px;font:11px monospace;color:#8a7560}",
    ".ares-x{background:none;border:0;color:#e9ddcc;font-size:24px;line-height:1;cursor:pointer;padding:0 4px}",
    ".ares-img{width:100%;background:#120d09;line-height:0}",
    ".ares-img svg,.ares-img img{width:100%;height:auto;display:block}",
    ".ares-bd{padding:6px 16px 22px}",
    ".ares-bd h4{margin:16px 0 5px;font:600 11px monospace;letter-spacing:.12em;text-transform:uppercase;color:#f59e0b}",
    ".ares-bd p{margin:0;font-size:14px;line-height:1.55}"
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- modal ---------- */
  var ov, el = {};
  function build() {
    ov = document.createElement("div");
    ov.className = "ares-ov";
    ov.innerHTML = '<div class="ares-sh" role="dialog" aria-modal="true"><div class="ares-hd"><div><h3></h3><div class="ares-src"></div></div><button type="button" class="ares-x" aria-label="Fechar">×</button></div><div class="ares-img"></div><div class="ares-bd"><h4>Como foi medido</h4><p class="c"></p><h4>Para que serve</h4><p class="s"></p><h4>Importância para a missão</h4><p class="m"></p></div></div>';
    document.body.appendChild(ov);
    el.sh = ov.querySelector(".ares-sh");
    el.h = ov.querySelector("h3");
    el.src = ov.querySelector(".ares-src");
    el.img = ov.querySelector(".ares-img");
    el.c = ov.querySelector(".c");
    el.s = ov.querySelector(".s");
    el.m = ov.querySelector(".m");
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    ov.querySelector(".ares-x").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }
  function open(d) {
    if (!ov) build();
    el.h.textContent = d.t;
    el.src.textContent = d.src;
    if (d.img) el.img.innerHTML = '<img alt="' + d.t + '" src="' + d.img + '">';
    else el.img.innerHTML = ART[d.art](d.col, d.lab);
    el.c.textContent = d.como;
    el.s.textContent = d.serve;
    el.m.textContent = d.missao;
    el.sh.scrollTop = 0;
    ov.classList.add("on");
  }
  function close() { if (ov) ov.classList.remove("on"); }

  /* ---------- botões "i" ---------- */
  function scan() {
    var nodes = document.querySelectorAll("span,div,p,label,h1,h2,h3,h4,h5,h6,li,b,strong");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.closest(".ares-ov") || n.querySelector(":scope > .ares-i")) continue;
      var kids = Array.prototype.filter.call(n.children, function (c) { return !c.classList.contains("ares-i"); });
      if (kids.length) continue;
      var txt = Array.prototype.filter.call(n.childNodes, function (c) { return c.nodeType === 3; })
        .map(function (c) { return c.textContent; }).join("");
      if (!txt || txt.length > 60) continue;
      var d = MAP[norm(txt)];
      if (!d) continue;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ares-i";
      b.textContent = "i";
      b.setAttribute("aria-label", "Explicação: " + d.t);
      (function (dd) {
        b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); open(dd); });
      })(d);
      n.appendChild(b);
    }
  }
  var pend = false;
  function sched() { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; scan(); }); }
  function init() {
    scan();
    new MutationObserver(sched).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.AresInfo = { scan: scan, open: function (t) { var d = MAP[norm(t)]; if (d) open(d); }, data: INFO };
})();
