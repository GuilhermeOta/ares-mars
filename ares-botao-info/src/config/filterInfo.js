// =====================================================================
// ARES - Explicações do botão "i" de cada pasta e subfiltro
// =====================================================================
// Cada chave é o MESMO id usado em mapConfig.js (FILTERS).
// Campos (todos opcionais; só aparece o que estiver preenchido):
//   resumo  -> frase de abertura (usado nas pastas)
//   como    -> como o dado é medido ou calculado
//   serve   -> o que o mapa mostra
//   missao  -> por que importa para uma missão humana
//   img     -> imagem em public/info/ (ex.: 'info/elevacao.jpg')
// Textos base: equipe A.T.O.M. (Saulo e Isabelly). Para editar, basta
// mudar o texto entre as aspas; não é preciso mexer em mais nada.
// =====================================================================

export const FILTER_INFO = {
  // ------------------------------------------------------------- pastas
  geologia: {
    resumo: 'Reúne o relevo e a composição da superfície: altitude, inclinação e minerais estimados pelo espectrômetro TES.',
    missao: 'Mostra onde é seguro pousar e se deslocar e quais materiais existem no local, tanto para a ciência quanto para construir com recursos locais.',
  },
  atmosfera: {
    resumo: 'Reúne as condições do ar e do ambiente: temperatura, pressão, densidade, vento, poeira e radiação. São valores regionais: um número só para a área de estudo inteira.',
    missao: 'Define o projeto de trajes, habitats e sistemas de energia, a segurança da tripulação e as condições para pouso e decolagem.',
  },
  'suporte-vida': {
    resumo: 'Reúne o que sustenta uma missão humana: evidências de gelo de água, estabilidade do terreno e a geologia vulcânica da região.',
    missao: 'Água é o recurso mais importante de uma missão, e um terreno estável é essencial para instalar habitats e traçar rotas seguras.',
  },

  // ------------------------------------------------------------- Geologia
  elevacao: {
    img: 'info/elevacao.jpg',
    como: 'A sonda em órbita disparou pulsos de laser infravermelho contra o solo e cronometrou o tempo de ida e volta de cada um. Metade desse tempo, multiplicada pela velocidade da luz, dá a distância até o solo; comparando com a posição conhecida da sonda, chega-se à altura do terreno. Centenas de milhões de medições foram combinadas no mapa global do altímetro MOLA, com cerca de 460 m por pixel.',
    serve: 'Mostra montanhas, vales, bacias e crateras. É a base dos outros mapas derivados (inclinação, rugosidade e obstáculos) e do cálculo de rotas.',
    missao: 'A altitude define quanta atmosfera existe para frear a nave na descida (regiões baixas têm mais ar), influencia radiação, temperatura e pressão, e orienta a escolha do local de pouso e dos percursos.',
  },
  declividade: {
    como: 'É calculada a partir do mapa de altitude do MOLA: para cada ponto, compara-se a diferença de altura com os pontos vizinhos e converte-se essa variação em um ângulo.',
    serve: 'Indica o quão íngreme é cada trecho, separando planícies de encostas, paredes de cratera e vales.',
    missao: 'O pouso exige terrenos muito planos para a nave não tombar. Rovers, veículos e astronautas têm limite de subida e de estabilidade, então a inclinação é um custo direto no cálculo de rotas.',
  },
  'silica-vidro': {
    img: 'info/silica-vidro.jpg',
    como: 'O espectrômetro TES mede o calor emitido pelo solo em muitos comprimentos de onda do infravermelho. Cada mineral absorve de um jeito próprio, deixando uma "impressão digital" no espectro. Comparando com espectros de laboratório, estima-se a porcentagem de cada material. É uma estimativa: abaixo de 10%, o mineral fica abaixo do limite de detecção do instrumento.',
    serve: 'Aponta regiões com vidro vulcânico ou materiais alterados, ricos em silício.',
    missao: 'Sílica pode indicar um passado vulcânico ou com água, e preserva bem possíveis marcas de vida antiga. Também é uma fonte de silício para fabricar vidro e cerâmica com recursos locais.',
  },
  quartzo: {
    img: 'info/quartzo.jpg',
    como: 'Mesmo método do TES: o espectro de emissão térmica da superfície é decomposto em contribuições de minerais conhecidos, e a parcela de quartzo é estimada em porcentagem. Abaixo de 10%, o valor fica abaixo do limite de detecção.',
    serve: 'O quartzo é raro em Marte. Onde aparece, sugere rochas evoluídas, formadas por diferenciação do magma.',
    missao: 'Revela a história geológica do local e pode ser fonte de silício para construção, vidro e painéis solares. Por ser uma estimativa, deve ser confirmada por medições locais.',
  },
  'k-feldspato': {
    img: 'info/k-feldspato.jpg',
    como: 'Obtido pelo mesmo processo espectral do TES, separando a assinatura do feldspato rico em potássio das demais. Abaixo de 10%, o valor fica abaixo do limite de detecção.',
    serve: 'Ajuda a identificar rochas ígneas evoluídas e diferentes tipos de crosta.',
    missao: 'Indica boas áreas para estudos científicos, como a datação das rochas, e materiais úteis para cerâmicas e cimentos feitos com recursos locais.',
  },
  'poeira-superficial': {
    img: 'info/poeira-superficial.jpg',
    como: 'O espectro térmico do TES muda quando o solo está coberto por poeira fina. A partir disso, cria-se um índice de 0 (rocha exposta) a 1 (superfície coberta de poeira).',
    serve: 'Mostra onde a superfície está encoberta por poeira, que também tende a ser mais clara e mais fofa.',
    missao: 'A poeira suja painéis solares, desgasta equipamentos e trajes, esconde minerais e pode formar solo fofo, onde rodas afundam. Orienta o pouso, o uso de energia solar e o tráfego.',
  },

  // ------------------------------------------------- Condições atmosféricas
  'mcd-temperatura': {
    img: 'info/mcd-temperatura.jpg',
    como: 'Vem do Mars Climate Database, um modelo climático global ajustado com observações de várias sondas. O valor exibido é o do início da tarde (~13h30), no começo da primavera do hemisfério norte, a 10 m do solo. À noite, a temperatura cai bastante.',
    serve: 'Mostra o quão frio é o local e ajuda a comparar com outras regiões de Marte.',
    missao: 'Define o isolamento de habitats e trajes, o consumo de energia para aquecimento, o funcionamento de baterias e eletrônicos e a possibilidade de água líquida.',
  },
  'mcd-fluxo-ir': {
    como: 'É o calor, em forma de radiação infravermelha, que a atmosfera irradia e que chega ao solo, calculado pelo modelo climático do Mars Climate Database, em watts por metro quadrado. Não é radiação perigosa, como a dos raios cósmicos.',
    serve: 'Ajuda a entender o balanço de energia da superfície: quanto calor o solo recebe da atmosfera, além da luz do Sol.',
    missao: 'Ajuda a projetar o controle térmico de habitats e equipamentos e a estimar o resfriamento noturno, que é crítico em Marte.',
  },
  'mcd-pressao': {
    img: 'info/mcd-pressao.jpg',
    como: 'É calculada pelo modelo climático do Mars Climate Database, que considera a altitude e o ciclo das estações, em que parte do gás carbônico congela nas calotas polares e depois volta a evaporar.',
    serve: 'Mostra a pressão do ar no local. Em média, ela é menos de 1% da pressão na Terra e varia cerca de 25% ao longo do ano.',
    missao: 'Define o projeto de paraquedas e da descida, exige trajes e habitats pressurizados e determina se líquidos evaporam. Regiões baixas têm pressão maior.',
  },
  'raios-cosmicos': {
    img: 'info/raios-cosmicos.jpg',
    como: 'Medida pelo instrumento RAD, a bordo do rover Curiosity, na cratera Gale. Ele detecta as partículas dos raios cósmicos e do Sol que chegam à superfície e calcula a dose de radiação absorvida. Gale fica em outro lugar de Marte, mas numa altitude parecida com a da área de estudo; por isso, é usada como referência.',
    serve: 'Mostra quanta radiação chega à superfície. A dose depende principalmente da camada de atmosfera acima do solo: quanto mais baixa a região, mais ar há para proteger.',
    missao: 'Marte tem pouca proteção atmosférica e magnética. A dose limita o tempo de permanência, define a blindagem dos habitats e indica locais mais protegidos, como regiões baixas, cavernas e tubos de lava.',
  },
  'mcd-ventos': {
    img: 'info/mcd-ventos.jpg',
    como: 'A velocidade do vento vem do modelo de circulação atmosférica do Mars Climate Database, calibrado com observações de sondas e rovers. O valor é o do início da tarde, a 10 m do solo.',
    serve: 'Mostra se a região é ventosa. Ventos levantam poeira e podem gerar tempestades.',
    missao: 'Como o ar é fino, o vento tem pouca força mecânica, mas transporta poeira. Afeta a descida, voos de drones, o desgaste de equipamentos e a limpeza natural de painéis solares.',
  },
  'mcd-vento-direcao': {
    img: 'info/mcd-ventos.jpg',
    como: 'Calculada a partir de dois componentes do vento do Mars Climate Database: o que sopra de oeste para leste e o que sopra de sul para norte. Combinando os dois, obtém-se de onde o vento vem, em graus (0° = norte, 90° = leste).',
    serve: 'Mostra de que lado o vento sopra e para onde ele leva a poeira.',
    missao: 'Ajuda a posicionar habitats, painéis solares e áreas de pouso, evitando que a poeira levantada pelo vento ou pelos motores da nave se acumule onde não deve.',
  },
  'indice-poeira': {
    img: 'info/indice-poeira.jpg',
    como: 'É a opacidade da poeira na atmosfera, ou seja, o quanto ela bloqueia a luz do Sol. O valor vem do Mars Climate Database, construído com observações de várias sondas, como o Mars Climate Sounder (MCS), da sonda MRO.',
    serve: 'Indica quanta poeira há em suspensão e quando ocorrem tempestades.',
    missao: 'Com mais poeira, chega menos luz aos painéis solares e a visibilidade cai. A tempestade global de 2018 encerrou a missão do rover Opportunity; por isso, o índice é essencial para planejar a energia.',
  },
  'mcd-densidade': {
    img: 'info/mcd-densidade.jpg',
    como: 'Calculada pelo modelo climático a partir da pressão e da temperatura, usando a lei dos gases. Fica em torno de 1 a 2% da densidade do ar na Terra.',
    serve: 'Mostra quanto ar existe no local.',
    missao: 'Determina a frenagem aerodinâmica na descida, a sustentação de drones e helicópteros e o desempenho de motores e ventilação.',
  },

  // ---------------------------------------------------------- Suporte à vida
  'swim-ci': {
    img: 'info/swim-ci.jpg',
    como: 'O projeto SWIM (Subsurface Water Ice Mapping) combina vários conjuntos de dados, como radar, análise térmica e feições do relevo, e avalia o quanto eles concordam sobre a presença de gelo de água a poucos metros de profundidade. O índice vai de −1 (incompatível com gelo) a +1 (compatível).',
    serve: 'Mostra onde a evidência de gelo enterrado é mais consistente.',
    missao: 'Água é o recurso mais valioso de uma missão: serve para beber, produzir oxigênio e combustível e proteger contra radiação. Pousar perto de gelo acessível reduz muito a carga a levar da Terra.',
  },
  'swim-radar-power': {
    img: 'info/swim-radar-power.jpg',
    como: 'O radar SHARAD, da sonda MRO, envia ondas de rádio que atravessam o solo e voltam quando encontram mudanças de material. Mede-se a intensidade do eco refletido pela superfície. No site, esse dado aparece como índice de compatibilidade com gelo do SWIM, de −1 a +1.',
    serve: 'Ajuda a interpretar o eco subterrâneo e a identificar a rugosidade e o tipo de material da superfície.',
    missao: 'Permite procurar gelo e camadas sem precisar escavar, apoiando a escolha de locais de pouso e perfuração.',
  },
  'swim-dielectric': {
    img: 'info/swim-dielectric.jpg',
    como: 'A velocidade da onda de radar depende de uma propriedade do material chamada permissividade dielétrica. Comparando o atraso do eco com a profundidade, estima-se essa propriedade. No site, ela aparece como índice de compatibilidade com gelo do SWIM, de −1 a +1.',
    serve: 'Diferencia materiais: o gelo tem permissividade baixa, enquanto a rocha densa tem valores maiores.',
    missao: 'Ajuda a confirmar se uma camada é gelo limpo, solo ou rocha, e a estimar o volume de água disponível para extração.',
  },
  'swim-thermal': {
    img: 'info/swim-thermal.jpg',
    como: 'Usa a temperatura da superfície ao longo do dia e das estações, medida por instrumentos infravermelhos, para estimar a inércia térmica. Gelo e rocha variam pouco de temperatura, enquanto a poeira fina esquenta e esfria rápido. Gelo enterrado altera esse padrão.',
    serve: 'Fornece uma pista independente da presença de gelo raso.',
    missao: 'Dá mais confiança na localização de água, reduzindo o risco de escolher um local sem esse recurso.',
  },
  'swim-geomorph': {
    como: 'Identifica nas imagens orbitais formas do relevo associadas a gelo, como terreno poligonal, depressões em forma de concha e crateras recentes que expuseram material brilhante.',
    serve: 'Complementa o radar e os dados térmicos com evidências visuais do relevo.',
    missao: 'Ajuda a validar os locais com gelo e a planejar o acesso a ele com segurança.',
  },
  rugosidade: {
    img: 'info/rugosidade.jpg',
    como: 'O Terrain Ruggedness Index (TRI) mede as diferenças de altura entre cada ponto e seus oito vizinhos no mapa do MOLA. Valores maiores indicam terreno mais acidentado.',
    serve: 'Diferencia planícies lisas de terrenos acidentados.',
    missao: 'Terrenos acidentados danificam rodas e pernas de pouso e dificultam o deslocamento. A rugosidade é essencial para escolher locais de pouso e para o custo de cada trecho da rota.',
  },
  'rochas-irtm': {
    img: 'info/rochas-irtm.jpg',
    como: 'Estimada pelo instrumento IRTM, dos orbitadores Viking, por contraste térmico: rochas esfriam mais devagar que o solo fino, então medições infravermelhas permitem estimar a fração da superfície coberta por rochas maiores que 15 cm (Christensen, 1986). É uma estimativa regional, sem o detalhe de cada pedra.',
    serve: 'Mostra onde há campos de pedras e onde o solo é fino.',
    missao: 'Rochas grandes são um risco para o pouso e para o deslocamento, mas também são fonte de material de construção e de amostras científicas.',
  },
  obstaculos: {
    img: 'info/obstaculos.jpg',
    como: 'É calculado a partir dos dados do MOLA. Um trecho vira obstáculo quando a inclinação passa de 15°, quando o terreno é muito acidentado ou quando forma uma depressão fechada, como o fundo de uma cratera.',
    serve: 'Indica o que deve ser evitado em uma rota.',
    missao: 'Alimenta o algoritmo A*, que encontra o caminho mais seguro e eficiente para rovers e astronautas, economizando energia, tempo e risco.',
  },
  'atividade-vulcanica': {
    img: 'info/atividade-vulcanica.jpg',
    como: 'Vem do mapa geológico global de Marte do USGS (Scientific Investigations Map 3292), feito por especialistas a partir de imagens e dados topográficos orbitais, que classificam o terreno por tipo e idade.',
    serve: 'Mostra a origem e a idade de cada região e onde há vulcões e fluxos de lava. A área de estudo fica inteira numa planície de lavas antigas (unidade Av).',
    missao: 'Terrenos vulcânicos oferecem materiais de construção, possíveis tubos de lava como abrigo e pistas do calor interno do planeta, mas podem ser acidentados. Também orientam a escolha de alvos científicos.',
  },
};
