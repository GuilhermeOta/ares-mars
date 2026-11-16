# ARES — Retrospectiva do Projeto

**Advanced Reconnaissance and Exploration System**
A.T.O.M. — Associação de Tecnologia, Observação e Matemática
NASA Space Apps Challenge — desafio de mapa em camadas para uma *Marswalk*

Documento iniciado em 13/11/2026 e concluído em 15/11/2026, com o projeto **finalizado**. Reúne o que existe no projeto, como cada parte funciona, quais dados temos (e de onde vieram), os problemas que apareceram no caminho e um mapa cronológico das atualizações.

> As datas da cronologia foram reconstruídas a partir das mensagens, prints e commits do projeto. Algumas são aproximadas (marcadas com "~").

---

## Sumário

1. [O projeto em uma página](#1-o-projeto-em-uma-página)
2. [O desafio e como o ARES responde a ele](#2-o-desafio-e-como-o-ares-responde-a-ele)
3. [Equipe](#3-equipe)
4. [Arquitetura geral](#4-arquitetura-geral)
5. [O site, parte por parte](#5-o-site-parte-por-parte)
6. [O sistema de rotas](#6-o-sistema-de-rotas)
7. [O sistema de filtros](#7-o-sistema-de-filtros)
8. [Inventário de dados](#8-inventário-de-dados)
9. [Hospedagem e publicação](#9-hospedagem-e-publicação)
10. [Estrutura de pastas](#10-estrutura-de-pastas)
11. [Problemas encontrados e como foram resolvidos](#11-problemas-encontrados-e-como-foram-resolvidos)
12. [Mapa cronológico de atualizações](#12-mapa-cronológico-de-atualizações)
13. [Histórico de Pull Requests](#13-histórico-de-pull-requests)
14. [Trabalho além do código](#14-trabalho-além-do-código)
15. [Melhorias futuras e checklist da apresentação](#15-melhorias-futuras-e-checklist-da-apresentação)
16. [Números do projeto](#16-números-do-projeto)
17. [Encerramento](#17-encerramento)

---

## 1. O projeto em uma página

O ARES é um site, sem instalação, que funciona no computador e no celular. Ele tem duas telas:

1. **Globo 3D:** Marte inteiro, com o Sol, as estrelas e as luas Fobos e Deimos. Os locais marcados (Olympus Mons, crateras dos rovers, Vikings e a área de estudo) abrem um **cartão de informação** ao serem clicados. O botão **Descer** faz uma animação de aproximação até a área de estudo.
2. **Mapa 2D:** a área de estudo, com o relevo real de Marte, três painéis e um planejador de rotas.

No mapa 2D, o usuário pode:

- **Ligar filtros científicos,** um subfiltro por vez, organizados em três pastas (Geologia, Condições atmosféricas e Suporte à vida). Cada pasta e cada subfiltro tem um **botão "i"** com a explicação do dado.
- **Clicar em qualquer ponto** e ver os valores reais daquele lugar: altitude, inclinação, rugosidade, obstáculos, índices de gelo do SWIM, minerais, unidade geológica e as condições da região, incluindo radiação e vento.
- **Escolher origem e destino** e calcular três rotas pelo algoritmo A*: menor distância, maior segurança e multicritério. As rotas usam o relevo real medido pela sonda Mars Global Surveyor.

Situação final (15/11/2026):

| Item | Situação |
|---|---|
| Globo 3D | ✅ Pronto: câmera configurável, texturas 2K/8K, zoom de descida até a área de estudo e cartões dos locais |
| Mapa 2D com relevo real | ✅ Pronto |
| Filtros | ✅ **23 de 23 subfiltros com dados**, todos com botão de informação |
| Rotas com relevo real | ✅ Prontas e publicadas |
| Identidade visual | ✅ Logo do ARES no site, no favicon e na apresentação |
| Site publicado (Netlify) | ✅ No ar |
| API de rotas publicada (Render) | ✅ No ar, com dados reais |
| Funciona no celular | ✅ Sim |
| Classificação no FortiGuard | ✅ Pedido enviado, como recomendado pela NASA, para os avaliadores conseguirem abrir o site |

---

## 2. O desafio e como o ARES responde a ele

O desafio pede uma **visão integrada e em camadas** de um local ou rota em Marte, que reúna dados de **várias missões da NASA** e ajude um explorador humano a planejar uma caminhada (*Marswalk*) com segurança, fazendo ciência pelo caminho. Exige **pelo menos três tipos de dados** cruzados.

| Exigência do desafio | Como o ARES atende |
|---|---|
| Topografia e inclinação | Relevo, inclinação, rugosidade e obstáculos calculados a partir do MOLA (Mars Global Surveyor) |
| Condições térmicas e atmosféricas | Temperatura, infravermelho térmico, pressão, densidade, velocidade e direção do vento e poeira (Mars Climate Database) |
| Radiação | Dose medida pelo RAD do Curiosity na cratera Gale (0,21 mGy/dia), apresentada como medição de outro local, de altitude parecida |
| Geologia e áreas de interesse | Minerais e poeira do TES (estimativa), unidades geológicas da USGS e abundância de rochas do IRTM (Viking) |
| Recursos (gelo/água) | Índices de compatibilidade com gelo do SWIM, que combina radar SHARAD, MOLA, TES e THEMIS |
| Rotas seguras | A* com três modos, desviando de obstáculos e pesando inclinação e rugosidade |
| Formato | Sistema digital interativo (site), que também funciona como "painel do habitat" |

**Missões e instrumentos cujos dados estão no ARES:** Mars Global Surveyor (MOLA e TES), Mars Reconnaissance Orbiter (SHARAD, via SWIM), Mars Odyssey e outras (via SWIM), Curiosity (RAD), orbitadores Viking (IRTM), o mapa geológico global da USGS (SIM 3292) e o modelo climático Mars Climate Database (LMD/ESA/CNES).

---

## 3. Equipe

| Pessoa | Papel | O que fez no projeto |
|---|---|---|
| **Saulo** | Coordenação geral e back-end | Liderança do grupo e das reuniões, sistema de rotas inteiro em Python (A*, terreno, obstáculos, modo interativo), organização dos filtros, coleta dos dados reais (MOLA, SWIM, Mars Climate Database, TES, RAD, IRTM) e textos dos botões de informação |
| **Guilherme** | Programador geral | Estrutura completa do site em React (globo 3D, mapa 2D, painéis, filtros, rotas, botões e cartões de informação), integração do back-end e dos dados ao front-end, publicação no Netlify e no Render, repositório no GitHub, guia de trabalho da equipe e aulas de programação |
| **Victor** | Design e apresentação | Logo do ARES (usada no site, no favicon e nos slides) e produção da apresentação em slides, junto com o Anthony |
| **Anthony** | Matemática, física e apresentação | Apoio em matemática e física e produção da apresentação em slides, junto com o Victor |

---

## 4. Arquitetura geral

```
                    ┌──────────────────────────────────────────┐
                    │  SITE (React + Vite) — hospedado no Netlify │
                    │                                          │
                    │  Globo 3D (three.js)   Mapa 2D (Leaflet)  │
                    │        │                   │              │
                    │        │      ┌────────────┼──────────┐   │
                    │        │      │ Filtros     │ Rotas    │   │
                    │        │      │ (arquivos   │ (pedido  │   │
                    │        │      │  estáticos) │  à API)  │   │
                    └────────┼──────┼─────────────┼──────────┘   │
                             │      │             │
             public/data/layers/   public/data/   │  POST /rota
             *.png  *.bin           regional.json │
             manifest.json                        ▼
                    ▲                 ┌───────────────────────────┐
                    │                 │ API (FastAPI) — no Render │
      export_layers.py (roda 1 vez)   │ código de rotas do Saulo   │
                    ▲                 │ carrega elevacao_m.npy     │
                    │                 └───────────────────────────┘
   outputs/npy/ + dados/swim, tes, usgs            ▲
                    ▲                              │
                    │                              │
            main.py do Saulo  ◄──── MOLA (2 GB, lido pela internet, só o pedaço da área)
```

**A ideia central:** o trabalho pesado (ler o MOLA de 2 GB, recortar a área, calcular o terreno, converter figuras em dados) é feito **uma vez só**, no computador da equipe. O site e a API usam apenas os recortes pequenos, alguns MB. Por isso tudo carrega rápido, inclusive no celular.

**Tecnologias:**

| Parte | Tecnologia |
|---|---|
| Interface | React 19 + Vite 8 |
| Estilo | Tailwind CSS 4 |
| Globo 3D | three.js (com raycaster para os cliques nos locais) |
| Mapa 2D | Leaflet + react-leaflet |
| Ícones | lucide-react |
| Rotas e dados | Python: numpy, scipy, scikit-image, rasterio, matplotlib, pillow, pyshp, shapely |
| API | FastAPI + uvicorn |
| Hospedagem | Netlify (site) e Render (API) |
| Código e equipe | Git + GitHub (repositório `GuilhermeOta/ares-mars`) |

---

## 5. O site, parte por parte

### 5.1 Globo 3D (`src/views/GlobeView.jsx`)

- **Cena:** Marte com atmosfera, Sol com coroa, céu estrelado, Fobos e Deimos em órbita e os marcadores dos locais (vindos de `src/api/regions.json`): Olympus Mons, crateras Gale, Gusev e Jezero, Viking 1, Viking 2 e a área de estudo (AP-1, AP-8 e AP-9).
- **Cartões dos locais:** clicar (ou tocar) num marcador ou no nome abre um cartão com ilustração, coordenadas, dados rápidos e três textos (sobre o local, importância científica e relevância para missões humanas). O clique é detectado com um *raycaster* do three.js; arrastar o globo não abre cartão, e locais do lado de trás do planeta não são clicáveis.
- **Botão Descer:** a câmera desce até ~0,15 unidade acima da superfície, mirando o centro da área de estudo do mapa 2D, e os marcadores encolhem durante a descida. A troca para o mapa fica contínua, com os pontos AP na mesma posição.
- **Painel "Câmera":**
  - Sensibilidade de giro e zoom, de 0,2× a 3×, salva no navegador.
  - Zoom ampliado: a câmera vai de 2,5 até 30 unidades. O Sol está a ~62, então o limite seguro é ~50.
  - Texturas **2K por padrão** (~1,8 MB, leves para celular) e **8K opcional** (~14 MB). A troca acontece sem recarregar a página; a escolha fica salva.
- **Logo do ARES** na tela de carregamento e no painel "Alvo selecionado".
- **Gestão de memória:** ao sair do globo, as texturas e o contexto WebGL são liberados. Sem isso, cada ida e volta acumulava as imagens na memória de vídeo do celular.

### 5.2 Mapa 2D (`src/views/MapView.jsx`)

Camadas, de baixo para cima:

1. **Relevo sombreado** real da área (gerado do MOLA).
2. **Camada científica** do subfiltro ligado.
3. **Contorno tracejado** da área de estudo.
4. **Rotas calculadas,** com contorno escuro para ficarem legíveis sobre qualquer camada.
5. **Marcadores:** origem (A), destino (B) e locais candidatos (AP-1, AP-8, AP-9). Os pontos de teste da fase inicial foram removidos.

Também tem:

- **HUD de coordenadas** que acompanha o mouse, em °N e °E.
- **Abaixo do HUD, conforme o subfiltro:** a **legenda** (barra de cores, categorias ou limite de detecção) ou o **cartão de valor regional**.
- **Correção de projeção:** as imagens são reajustadas para a projeção de Mercator do Leaflet. Sem isso, ficariam até ~400 m fora do lugar.

### 5.3 Painel de filtros (`src/components/FilterList.jsx`)

- **Três pastas** que só abrem e fecham. Dentro delas, **um subfiltro por vez** (botão de rádio).
- **Subtítulos** dentro das pastas (ex.: "Composição mineralógica", "Disponibilidade de água").
- **Botão "i" branco** à direita de cada pasta e de cada subfiltro: abre uma janela com imagem, "Como é medido", "O que o mapa mostra" e "Por que importa para a missão". No celular, a janela sobe de baixo para cima.
- **Etiquetas** na linha da fonte: "regional" (azul) para valores que valem para a área toda.
- O rodapé mostra o nome da camada ligada.

### 5.4 Painel de inspeção (`src/components/InspectionPanel.jsx`)

Ao clicar num ponto, num local candidato ou num marcador, mostra:

- **"Neste ponto":** o valor real de cada camada naquele lugar, com os regionais marcados. Minerais abaixo do limite de detecção aparecem como "~2,3 % · não detectado"; a unidade geológica aparece por nome.
- **"Fonte":** instrumento, missão, data, resolução e confiança da camada ligada.

### 5.5 Painel de rotas (`src/components/RoutePanel.jsx`)

- **Botões de origem e destino.** Ao clicar no mapa, o ponto é definido; depois da origem, o painel já pede o destino.
- **Inverter, limpar e calcular.**
- **Um cartão por modo:** distância, declividade máxima e folga, com um olho para esconder ou mostrar cada linha.
- **Avisos:** "Rota de TESTE" (quando não há API configurada), "Terreno SINTÉTICO" (API sem dados reais) e mensagens de erro claras (API desligada, demorando ou ponto fora da área).

### 5.6 Peças de apoio

| Arquivo | Função |
|---|---|
| `src/config/mapConfig.js` | Configuração central: área de estudo, pontos AP, filtros e subfiltros, modos de rota, endereços |
| `src/config/filterInfo.js` | Textos e imagens dos botões "i" dos filtros, ligados pelo `id` de cada subfiltro |
| `src/config/placeInfo.js` | Textos, dados e ilustrações dos cartões dos locais do globo, ligados pelo `id` do `regions.json` |
| `src/components/InfoModal.jsx` | Botão "i" e janela de explicação dos filtros |
| `src/components/PlaceInfoModal.jsx` | Cartão dos locais do globo |
| `src/hooks/useLayerManifest.js` | Lê o `manifest.json` (camadas com imagem) e o `regional.json` (valores regionais) e junta os dois |
| `src/services/layerValues.js` | Lê o valor de uma camada num ponto e formata para a tela (categorias, limite de detecção, texto qualitativo) |
| `src/services/routeApi.js` | Único lugar que conversa com a API de rotas (com tempo limite de 60 s) |
| `src/components/MapLegend.jsx` | Legenda da camada |
| `src/components/MapNotice.jsx` | Cartão de valor regional e aviso de "em preparação" |
| `src/components/ErrorBoundary.jsx` | Se algo quebrar, mostra o erro na tela em vez de deixar tudo preto |
| `src/mock/routes.js` | Rotas de **teste**, usadas só quando não há API configurada |

---

## 6. O sistema de rotas

### 6.1 O código do Saulo (`backend/`)

Um programa completo em Python, com testes automáticos, que funciona sozinho (com uma janela interativa do matplotlib) ou por trás do site (pela API).

| Etapa | Arquivo | O que faz |
|---|---|---|
| Dados | `data_sources.py` | Catálogo de fontes (MOLA, HRSC, CTX) e registro de procedência |
| Grade | `dem_processor.py` | Recorta o relevo na área e monta uma grade de 200 m por célula. Define os pontos AP. |
| Terreno | `terrain_analyzer.py` | Declividade, orientação e rugosidade (TRI) |
| Obstáculos | `obstacle_detection.py` | Marca as células proibidas e o motivo de cada uma; calcula a folga até o obstáculo mais próximo |
| Caminho | `astar.py` | A* em grade de 8 direções, sem cortar quinas |
| Comparação | `route_comparison.py` | Roda os três modos e calcula as métricas |
| Saída | `visualization.py`, `interactive.py`, `main.py` | Mapas, modo interativo, arquivos exportados |
| API | `api.py` | "Embrulho" FastAPI em volta da função `route_between` |
| Camadas | `export_layers.py` | Gera as imagens e valores dos filtros para o site |
| Figuras | `figure_to_data.py` | Converte figuras de mapas globais (imagem + barra de cores) em valores aproximados |
| Geologia | `clip_usgs_geology.py` | Recorta o mapa geológico global da USGS para a região do site |

**Obstáculos**, cada um com seu "bit" de causa:

- Declividade acima de 15°.
- Rugosidade no 1% mais acidentado da área.
- Depressão fechada com mais de 20 m de profundidade.
- Célula sem dado.

Na área de estudo aparecem só dois tipos: rugosidade extrema e depressão fechada.

**O custo de cada passo** é a distância andada multiplicada por um fator do terreno:

```
fator = 1 + peso_declividade × (declividade / 15°)²
          + peso_rugosidade × rugosidade
          + peso_folga × (penalidade por estar perto de obstáculo)²
```

| Modo | Pesos (declividade, rugosidade, folga) | Comportamento |
|---|---|---|
| Menor distância | 0, 0, 0 | Só desvia dos obstáculos |
| Maior segurança | 8, 4, 10, e proíbe declividade acima de 10° | Faz desvios para ficar no plano, no liso e longe de obstáculos |
| Multicritério | 2, 1, 2 | Meio-termo |

### 6.2 A API (`backend/api.py`)

| Endereço | O que faz |
|---|---|
| `GET /status` | Mostra se está no ar, se usa terreno sintético ou real, a resolução e a área |
| `POST /rota` | Recebe origem e destino; devolve os **três modos de uma vez** |

Formato da resposta:

```json
{ "sintetico": false, "reta_km": 66.9,
  "rotas": [ { "modo": "menor_distancia", "encontrada": true,
               "pontos": [[39.8, 202.1], ...],
               "distancia_km": 71.4, "declividade_max": 1.2,
               "folga_min_m": 39300, "ganho_m": ..., "perda_m": ... }, ... ] }
```

De onde vem o relevo:

| Variável | O que carrega |
|---|---|
| `ARES_DEM_NPY` + `ARES_RES` | A grade recortada indicada (é o que está configurado no Render) |
| `ARES_MOLA` | O GeoTIFF do MOLA, recortado ao ligar |
| nenhuma | O relevo real que já vem no repositório (`backend/dados/elevacao_m.npy`, 200 m). O terreno sintético só é usado se esse arquivo não existir |

A preparação do terreno roda uma vez, quando a API liga. Depois disso, cada rota leva **menos de 1 segundo**: medimos 0,7 s para os três modos numa grade de ~400 mil células.

### 6.3 Validação

Os resultados do site publicado batem **exatamente** com os gráficos que o Saulo gerou no computador dele:

| Rota | Menor distância | Maior segurança | Multicritério |
|---|---|---|---|
| AP-1 → AP-8 | 71,4 km | 76,2 km | 72,0 km |
| AP-1 → AP-9 | 61,8 km | 65,8 km | 61,8 km |
| AP-8 → AP-9 | 110,6 km | 112,7 km | 110,6 km |

Os mesmos dados, em computadores diferentes, deram os mesmos resultados. O código é reprodutível.

---

## 7. O sistema de filtros

### 7.1 Como funciona

```
Dados (MOLA, SWIM, TES, USGS)  →  export_layers.py  →  public/data/layers/
                                                       ├── *.png          (a imagem de cada camada)
                                                       ├── *.bin          (os valores, para o painel)
                                                       └── manifest.json  (lista, legenda, fonte)

Valores regionais (MCD, RAD, SWIM, IRTM)  →  public/data/regional.json  (preenchido à mão)

Textos dos botões "i"  →  src/config/filterInfo.js  +  imagens em public/info/
```

- **Camada com imagem:** o subfiltro mostra a imagem no mapa e a legenda. Os valores ficam em arquivos `.bin` (números inteiros compactados), baixados só no primeiro clique.
- **Valor regional:** um número só, que vale para a área de estudo inteira (dados de modelos globais ou medidos em outro lugar). O mapa mostra um cartão com o número e a explicação; o painel lista o valor como "(regional)". Estimativas qualitativas aparecem em texto (ex.: "Intermediária").
- **Em preparação:** um subfiltro sem dados mostraria um aviso com a fonte prevista. Nada é inventado. No fim do projeto, nenhum ficou nessa situação.

A regra que liga tudo: **o `id` do subfiltro no `mapConfig.js` é igual ao `id` no `manifest.json`, no `regional.json` e no `filterInfo.js`.**

### 7.2 Situação de cada subfiltro (23 no total)

**Geologia**

| Subfiltro | Situação | Fonte / valor |
|---|---|---|
| Relevo e altitude | ✅ Camada | MOLA; −4.155 a −3.746 m (escala de cores de −3.990 a −3.890 m, onde estão 98% dos valores) |
| Inclinação do terreno | ✅ Camada | Calculada do MOLA; 0 a 7,3° (escala 0–2°: 99% da área está abaixo de 2°) |
| Silicatos/vidro (alto Si) | ✅ Camada (estimativa) | TES, figura convertida; mediana ~2% na área, abaixo do limite de detecção (10%) quase em toda parte |
| Quartzo | ✅ Camada (estimativa) | TES; não detectado em toda a área |
| K-feldspato | ✅ Camada (estimativa) | TES; máximo ~6%, abaixo do limite de detecção |
| Poeira superficial | ✅ Camada (estimativa) | TES; mediana ~0,86 (escala 0–1): área muito empoeirada |

**Condições atmosféricas**

| Subfiltro | Situação | Valor |
|---|---|---|
| Temperatura | ✅ Regional | 228,1 K (≈ −45 °C), MCD |
| Infravermelho térmico na superfície | ✅ Regional | 29,3 W/m² (calor irradiado pela atmosfera; não é radiação ionizante), MCD |
| Pressão atmosférica | ✅ Regional | 843,9 Pa, MCD |
| Radiação | ✅ Regional | **0,21 mGy/dia** (~76 mGy/ano), RAD do Curiosity em Gale: média de 13 medições de 16 min no sol 1 (7 ago. 2012), detector E. Medição de outro local, de altitude parecida |
| Ventos | ✅ Regional | 4,9 m/s, MCD |
| Direção do vento | ✅ Regional | **De noroeste (~306°)**, ~4,7 m/s, calculada dos componentes leste-oeste e sul-norte do MCD (42°N, 202°E; Ls 21,9°) |
| Índices de poeira | ✅ Regional | 0,35 (opacidade), MCD |
| Densidade | ✅ Regional | 0,0194 kg/m³, MCD |

O momento dos valores do MCD: **Ls 21,3°** (início da primavera no norte; Ls 21,9° para a direção do vento), cerca de **13h30, hora local**, a 10 m do solo, cenário de clima médio.

**Suporte à vida**

| Subfiltro | Situação | Fonte / valor na área |
|---|---|---|
| Consistência do gelo | ✅ Camada | SWIM, 3 km/px; 0,03 a 0,48 |
| Potência do radar na superfície | ✅ Camada | SWIM, 3 km/px; −1 a +1 |
| Propriedades dielétricas | ✅ Camada | SWIM, 3 km/px; 0,57 a 0,88 |
| Análise térmica | ✅ Regional | SWIM; 0 (neutro) em toda a área |
| Geomorfologia | ✅ Regional | SWIM; 0 (neutro) em toda a área |
| Rugosidade (TRI) | ✅ Camada | Calculada do MOLA; 0 a 20 m (escala 0–5 m) |
| Abundância de rochas | ✅ Regional (qualitativo) | Viking IRTM (Christensen, 1986), rochas maiores que 15 cm: "intermediária" (~0,47 na escala da figura, acima de ~66% do planeta). O mapa publicado não tem legenda em % |
| Obstáculos ao deslocamento | ✅ Camada | Critérios do algoritmo de rotas; rugosidade extrema e depressões fechadas |
| Unidades geológicas e vulcanismo | ✅ Camada | USGS SIM 3292 (Tanaka et al., 2014): área toda na unidade Av (lavas da era Amazoniana); a ponta de uma crista enrugada entra ~10 km pela borda sul |

**Total: 23 de 23 com dados** (12 camadas no mapa e 11 valores regionais, contando o relevo de fundo à parte). Os refletores de radar do SWIM saíram do site: não são índice de compatibilidade (decisão da equipe de dados).

### 7.3 Escolhas importantes

- **Escala de cores pela faixa onde está a maioria dos valores,** e não pelo mínimo e máximo absolutos. A área é muito plana, e com a escala absoluta o mapa sairia de uma cor só. A legenda marca os extremos com "≤" e "≥".
- **Dados de baixa resolução mantêm os "quadrados".** Os mapas do SWIM têm 3 km por pixel e aparecem quadriculados, que é a resolução real. A amostragem usa "vizinho mais próximo", para não inventar valores intermediários.
- **Medido × calculado × modelado × estimado,** sempre identificado no painel. A altitude é **medida** (MOLA); a inclinação e a rugosidade são **calculadas** a partir dela; os dados do MCD são **modelo**; os minerais do TES e as rochas são **estimativas** lidas de figuras.
- **Dados de outro lugar de Marte são apresentados como tal.** A radiação vem de Gale e aparece como "medida em Gale, não na área de estudo".

---

## 8. Inventário de dados

### 8.1 Dados reais em uso

| Dado | Origem | Formato | Onde está no projeto | Resolução |
|---|---|---|---|---|
| Relevo (elevação) | MOLA, Mars Global Surveyor, mosaico global do USGS (`Mars_MGS_MOLA_DEM_mosaic_global_463m.tif`, 2 GB) | Lido pela internet (`/vsicurl/`), recortado | `backend/dados/elevacao_m.npy` (API) e `public/data/layers/` (site) | 463 m (grade de 200 m) |
| Declividade, rugosidade, obstáculos | Calculados pelo código do Saulo a partir do MOLA | `.npy` | `backend/outputs/npy/` (local) e `public/data/layers/` | Grade de 200 m |
| Gelo/água | SWIM (Subsurface Water Ice Mapping) | GeoTIFF com coordenadas (0–60°N, 188–208°E) | `backend/dados/swim/` | 3 km |
| Atmosfera (7 variáveis) | Mars Climate Database v6.2 | Texto (grade lat × lon e componentes do vento) | Valores em `public/data/regional.json` | Modelo global |
| Radiação | RAD, Curiosity (NASA PDS, MSL-M-RAD-3-RDR-V1.0) | Tabela de dose por observação (µGy/h) | Valor em `public/data/regional.json` | Medição pontual em Gale |
| Minerais e poeira (4 mapas) | TES, Mars Global Surveyor | Figuras globais convertidas em valores (`figure_to_data.py`) | `backend/dados/tes/` | 4 px/grau (~15 km) |
| Unidades geológicas | USGS SIM 3292 (Tanaka et al., 2014) | Shapefile recortado em GeoJSON (`clip_usgs_geology.py`) | `backend/dados/usgs/` | Escala 1:20.000.000 |
| Rochas (estimativa) | Viking IRTM (Christensen, 1986), Mars Global Data Sets (ASU) | Imagem 360 × 180 sem barra de cores | `backend/dados/rochas/` | 1 px/grau (~60 km) |
| Imagens dos botões "i" | Mapas globais e figuras de NASA, ESA, USGS e artigos (reunidos pela equipe) | JPG reduzido | `public/info/` | Ilustrativas |

### 8.2 Dados recebidos, mas não usados

| Dado | Por quê |
|---|---|
| TES, arquivos `.hdr` (1, 2 e 4 pixels por grau) | Vieram só os cabeçalhos, sem os dados; usamos as figuras no lugar |
| `Wdn.tif` e `Reflectors.tif` (SWIM) | Não são índices de compatibilidade; fora do site por decisão da equipe de dados |
| Foto do mapa geológico da USGS | Sem coordenadas nem legenda; substituída pelo mapa digital SIM 3292 (e usada como imagem do botão "i") |
| Mapas do MCD em imagem (temperatura, pressão, densidade, H, vento com setas) | Substituídos pelos números em texto, que são precisos |
| Mapa de raios cósmicos (rem/ano) | Sem dados numéricos da área; substituído pela medição do RAD (e usado como imagem do botão "i") |
| Gráficos do código de rotas (imagens 11 a 18) | Ótimos para a apresentação; as camadas do site foram geradas dos números originais |

### 8.3 A área de estudo

- **Limites:** 39,3–41,25°N e 200,8–203,85°E (longitude leste, de 0 a 360). São os três pontos AP mais 0,5° de margem, a mesma regra do código do Saulo.
- **Tamanho:** cerca de 140 × 110 km, numa grade de 579 × 690 células de 200 m.
- **Altitude:** entre −4.155 e −3.746 m, quase 4 km abaixo do nível de referência de Marte, numa planície muito plana (inclinação média abaixo de 0,3°).
- **Locais candidatos:** AP-1 (39,80°N, 202,10°E), AP-8 (40,75°N, 201,30°E) e AP-9 (40,02°N, 203,35°E).

**Sobre o nome da região:** pelo código do Saulo, os pontos AP vêm de um artigo (Luzzi et al., 2025, JGR Planets) sobre locais de pouso no **norte de Amazonis Planitia**. A área fica na **fronteira entre Arcadia e Amazonis Planitia**, e o próprio código anota que a coordenada do AP-8 não foi confirmada. A referência foi citada a partir do código, sem consulta ao artigo.

---

## 9. Hospedagem e publicação

| Parte | Serviço | Endereço | Configuração |
|---|---|---|---|
| Site | Netlify | `ares-mars-03112026.netlify.app` | Variável `VITE_ROUTE_API_URL` apontando para a API; publica a branch `main` |
| API de rotas | Render (plano gratuito) | `ares-mars.onrender.com` | Pasta raiz `backend`; comando `uvicorn api:app --host 0.0.0.0 --port $PORT`; variáveis `PYTHON_VERSION`, `ARES_DEM_NPY=dados/elevacao_m.npy` e `ARES_RES=200` |

Observações:

- **O plano gratuito do Render "dorme"** sem uso. O primeiro pedido pode levar ~50 s. Antes de apresentar, abra o endereço `/status` para acordar a API.
- **O Netlify gera um Deploy Preview** para cada Pull Request: uma versão de teste do site num endereço próprio, antes de juntar na `main`.
- **O site reserva espaço para o selo "Powered by Netlify"** (só quando está no Netlify), para ele não cobrir os botões.
- **FortiGuard:** seguindo a recomendação da NASA Space Apps, foi pedida a classificação dos dois endereços no filtro web da Fortinet, para que os avaliadores consigam abrir o site em redes com esse firewall.
- **Favicon e ícone de celular** com a logo do ARES.

---

## 10. Estrutura de pastas

```
ares-mars/
├── .githooks/pre-push           Trava local contra push direto na main
├── backend/                     Código de rotas do Saulo + API + preparação dos dados
│   ├── api.py                   API (FastAPI)
│   ├── main.py                  Programa principal (modo interativo e exportação)
│   ├── export_layers.py         Gera as camadas dos filtros para o site
│   ├── figure_to_data.py        Converte figuras de mapas em dados aproximados
│   ├── clip_usgs_geology.py     Recorta o mapa geológico da USGS
│   ├── astar.py, route_comparison.py, terrain_analyzer.py,
│   │   obstacle_detection.py, dem_processor.py, data_sources.py,
│   │   visualization.py, interactive.py, synthetic_fixture.py
│   ├── dados/
│   │   ├── elevacao_m.npy       Relevo real recortado (usado pela API)
│   │   ├── swim/                GeoTIFFs do SWIM
│   │   ├── tes/                 Figuras dos mapas minerais do TES
│   │   ├── usgs/                Recorte do mapa geológico (GeoJSON)
│   │   └── rochas/              Figura de abundância de rochas (IRTM)
│   ├── tests/, pytest.ini       Testes automáticos
│   ├── outputs/                 (não vai para o GitHub) Saídas do main.py
│   └── data/                    (não vai para o GitHub) MOLA baixado, se houver
├── public/
│   ├── data/
│   │   ├── layers/              Camadas do mapa: *.png, *.bin, manifest.json
│   │   └── regional.json        Valores regionais (MCD, RAD, SWIM, IRTM)
│   ├── info/                    Imagens dos botões "i" dos filtros
│   ├── favicon.png, apple-touch-icon.png
├── src/
│   ├── App.jsx                  Esqueleto: estados compartilhados e painéis
│   ├── main.jsx                 Ponto de entrada (com a tela de erro e o selo do Netlify)
│   ├── index.css                Estilos globais
│   ├── config/                  mapConfig.js, filterInfo.js, placeInfo.js
│   ├── views/                   GlobeView.jsx, MapView.jsx
│   ├── components/              FilterList, InspectionPanel, RoutePanel, MapLegend,
│   │                            MapNotice, ErrorBoundary, InfoModal, PlaceInfoModal
│   ├── services/                routeApi.js, layerValues.js
│   ├── hooks/                   useLayerManifest.js
│   ├── mock/                    routes.js (TESTE) e points.js (lista vazia)
│   ├── api/regions.json         Locais do globo
│   └── assets/                  Texturas 2K e 8K, luas, logo do ARES
├── index.html                   lang="pt-BR", bloqueio da tradução automática e favicon
├── .gitattributes               Mantém a trava funcionando no Windows
├── README.md                    Apresentação do projeto
├── GUIA_DO_PROJETO.md           Guia de trabalho da equipe (por cliques)
├── KANBAM.md                    Quadro de tarefas
├── RETROSPECTIVA_ARES.md        Este documento
└── .env.local                   (cada um tem o seu) Endereço da API
```

---

## 11. Problemas encontrados e como foram resolvidos

| # | Problema | Causa | Solução | Lição |
|---|---|---|---|---|
| 1 | Mapa 2D mostrava "API KEY REQUIRED" | O mapa base era um mapa **da Terra** (CartoDB) | Basemap de Marte e, depois, o relevo real da área | — |
| 2 | Coordenadas diferentes em cada arquivo | Cada parte usava uma convenção (graus oeste, centros diferentes) | Convenção única: °N e longitude leste 0–360, área do código do Saulo | Uma fonte de verdade (`mapConfig.js`) |
| 3 | Títulos gigantes nos painéis | Sobra do CSS do modelo do Vite | Limpeza do `index.css` | — |
| 4 | Só um filtro ligava por vez (versão 1) | Estado guardado como texto único | Objeto com um valor por filtro; depois, pastas com um subfiltro por vez (pedido do Saulo) | — |
| 5 | Erro de import `filterList.jsx` | Nome com letra minúscula; o Windows não diferencia, o servidor sim | Renomear com `git mv` em duas etapas | Componentes sempre com maiúscula |
| 6 | Página branca: `does not provide an export named 'CANDIDATE_SITES'` | Ao substituir um trecho, apagou-se mais do que devia | Substituir o arquivo inteiro | Para arquivos de configuração, copiar o arquivo completo |
| 7 | `uvicorn` não reconhecido | Pasta de programas do Python fora do PATH | `python -m uvicorn` | — |
| 8 | `Attribute "app" not found` | Arquivo `api.py` não salvo | `Ctrl + S` (e ligar o *Auto Save*) | — |
| 9 | Rotas no site publicado usavam teste | O Netlify só hospeda o site; a API estava só no computador | API no Render + variável no Netlify | `localhost` no site publicado é o aparelho do visitante |
| 10 | Selo do Netlify cobrindo botões | Selo fixo no canto | Faixa reservada (`--badge-space`), só no Netlify | — |
| 11 | Possível falta de memória no celular | Texturas do globo nunca eram liberadas | Liberação das texturas e do contexto WebGL | Celular tem pouca memória de vídeo |
| 12 | Tela preta, sem explicação | O React desmonta o site inteiro quando um componente quebra | `ErrorBoundary`: tela com a mensagem do erro | Sem mensagem, o diagnóstico é chute |
| 13 | Erro `insertBefore` no celular, ao calcular rota | O `index.html` dizia `lang="en"`; o Chrome traduzia a página e quebrava o React | `lang="pt-BR"` + bloqueio de tradução | A tela de erro mostrou a causa na hora |
| 14 | Download do MOLA levaria 6 horas | Arquivo de 2 GB num servidor lento | Leitura pela internet só do pedaço da área (`/vsicurl/`) | Só ler o que é preciso |
| 15 | O modo interativo não salvava os arquivos | O `--interativo` mostra a janela e encerra | Rodar uma vez sem `--interativo` | — |
| 16 | Painel de inspeção quebraria com camadas reais | O painel esperava uma prop antiga (`activeFilters`) | Painel reescrito com os valores no ponto | Erros escondidos aparecem quando os dados chegam |
| 17 | Arquivos do zip "não encontrados" | O Windows extraiu para `Downloads\nome-do-zip\` | `Move-Item` para as pastas certas | Conferir onde os arquivos foram parar |
| 18 | Mapas do MCD em imagem eram ilegíveis | Cores transparentes, contornos, setas; barra da densidade toda "0.0" | Números em texto direto do site do MCD | Imagem de gráfico não é dado |
| 19 | "Terreno SINTÉTICO" ao ligar a API no dia seguinte | A variável de ambiente só valia naquele terminal | A API passou a usar `dados/elevacao_m.npy` por padrão | Configuração importante não deve depender de memória |
| 20 | Dados minerais só existiam como figura | Vieram os cabeçalhos `.hdr` do TES, sem os dados | `figure_to_data.py`: lê a barra de cores e converte cada pixel pelo matiz | Estimativa sempre marcada como estimativa |
| 21 | Pacote de atualização sem o `regional.json` | O script de empacotamento pulou o último arquivo da lista | Arquivo enviado à parte; pacote conferido | Conferir o conteúdo de todo pacote |
| 22 | Commit feito direto na `main` e conflito no `git pull` | Edição antes de criar a branch | Junção cancelada, `main` igualada à do GitHub e backup do commit | Criar a branch **antes** de mexer |
| 23 | Proteção da `main` no GitHub não funcionava | Regras do GitHub não valem em repositório privado gratuito | Trava local (`.githooks/pre-push`) + combinados no guia | Conferir os limites do plano |
| 24 | "couldn't find remote ref" ao enviar | Uso de uma branch antiga, já apagada no GitHub depois do merge | Branch nova a partir do commit | Uma branch por tarefa |
| 25 | Globo quebrou: `reading 'lat'`; crateras sem bolinha | `"centrer"` em vez de `"center"` e tipo `"cratera"`, que o código não conhece | Campo corrigido e tipo `landing_site` | O erro aponta o campo digitado errado |
| 26 | Nomes duplicados no globo durante a edição | O recarregamento automático do Vite desenhou a cena nova sobre a antiga | `Ctrl + Shift + R` | Só acontece no `npm run dev` |
| 27 | Zoom do "Descer" parava longe da superfície | O limite de distância mínima da câmera empurrava a câmera de volta | Limite liberado durante a descida; alvo trocado para a área de estudo | — |
| 28 | Viking 2 do outro lado do planeta | Longitude em graus **oeste** usada como **leste** | 225,74°E (= 134,26° O) | A convenção de coordenadas vale para todos os arquivos |
| 29 | Botão "i" cobrindo a etiqueta "regional" | Nome, etiqueta e botão na mesma linha | Etiqueta movida para a linha da fonte | Testar em várias larguras de tela |
| 30 | Script de informações dos locais não funcionaria no globo | Ele procurava texto na página, mas os nomes no 3D são desenhos no canvas | Clique detectado com *raycaster* do three.js | Em 3D, "texto" na tela nem sempre é texto |
| 31 | Conflito no `regions.json` no PR #20 | Duas pessoas editaram o mesmo arquivo ao mesmo tempo | Conflito resolvido no editor do GitHub | Avisar antes de mexer em arquivos compartilhados |

---

## 12. Mapa cronológico de atualizações

### 06/11/2026: análise e mapa 2D
- Análise do documento do projeto e do desafio da NASA: pontos fortes, lacunas e cuidados científicos.
- Análise do primeiro código: globo pronto, mapa 2D em protótipo; dados do Saulo recebidos como imagens.
- Mapa 2D reconstruído: basemap de Marte, área de estudo enquadrada, filtros independentes, painel de inspeção, HUD que segue o mouse, pontos de teste marcados como teste.
- Organização da equipe no GitHub: mensagem com o passo a passo para o Saulo e regras para evitar conflitos.
- Primeiro pedido do Saulo para os filtros: subfiltros (temperatura, pressão, H, densidade, minerais).

### ~06–07/11: filtros em pastas e globo
- Subfiltros com caixas de seleção e, depois, **pastas com um subfiltro por vez** (modelo do Saulo).
- Globo: **sensibilidade da câmera** e **zoom ampliado**.
- Correções: erro de maiúscula (`filterList.jsx`), arquivo de configuração incompleto, avisos do lint.
- Criação do **`GUIA_DO_PROJETO.md`**.
- Filtros reorganizados duas vezes com as listas finais do Saulo (Geologia, Condições atmosféricas, Suporte à vida).

### 07/11: o sistema de rotas do Saulo
- Saulo apresenta no grupo o sistema de rotas em Python (vídeo).
- Análise completa do código: módulos, A*, obstáculos, modos, desempenho (< 1 s por rota).
- Descoberta: os pontos AP ficam na fronteira Arcadia/Amazonis.
- Criação da **API (`api.py`)** e do **painel de rotas** no site, testados de ponta a ponta.
- Texturas **2K/8K** no globo.

### 08/11: backend no repositório
- Pasta `backend/` montada com todos os arquivos do Saulo; `.gitignore` atualizado.
- API rodando localmente (`python -m uvicorn`).
- Commit **"Backend: API de rotas do Saulo"**.

### ~09/11: rotas conectadas e promoção
- Guilherme promovido a **Diretor de Informática** do grupo.
- Front-end das rotas aplicado no projeto e testado: primeiro com rotas de teste, depois com a API (terreno sintético).
- **Aula 1 de programação** (mensagem + página HTML interativa com editor ao vivo).
- `KANBAM.md` e `GUIA_DO_PROJETO.md` atualizados.
- Pull Requests **#1** a **#4** juntados na `main`.

### 10/11: publicação
- Site publicado no **Netlify** e API publicada no **Render**.
- Correções para o celular: memória do globo, tela de erro e espaço para o selo do Netlify.
- Pull Request **#5**.
- Descoberta e correção do **erro de tradução automática** (`lang="pt-BR"`).

### ~12/11: dados reais do MOLA
- Planejamento completo dos filtros a partir de tudo o que já tinha sido conversado.
- Análise das 18 imagens de dados: só as do código de rotas tinham coordenadas.
- **MOLA lido pela internet** (sem baixar os 2 GB): o modo interativo abriu com o relevo real.
- Exportação dos arquivos `.npy` reais; validação: rotas idênticas às do Saulo.
- **API no Render com relevo real** (`"sintetico": false`).
- **Filtros de relevo reais:** relevo sombreado de fundo, altitude, inclinação, rugosidade e obstáculos, com legenda e valores no ponto clicado (`export_layers.py`).

### 13/11: valores regionais e SWIM
- Aviso de **"Dado em preparação"** e modo **"valor regional"** (`regional.json`).
- Análise dos mapas do MCD em imagem: ilegíveis, pedido dos números em texto.
- Chegada dos dados do Saulo: números do MCD em texto e GeoTIFFs do SWIM.
- **Cinco valores regionais do MCD** e **seis produtos do SWIM** (quatro camadas e dois regionais).
- Filtros: **de 4 para 15 de 22** com dados reais.

### 14/11 (manhã e tarde): TES, USGS e mais dados do MCD
- API passa a usar o relevo real por padrão (fim do "Terreno SINTÉTICO" ao ligar no computador).
- **Conversor de figuras** (`figure_to_data.py`): acha o mapa e a barra de cores na figura e lê o valor pelo matiz da cor. Testado na própria barra (erro ≤ ~3–4% da escala).
- **TES:** silicatos/vidro, quartzo, K-feldspato e poeira superficial, com marcação do limite de detecção (10%).
- **USGS SIM 3292:** unidades geológicas em volta da área e cristas enrugadas; a área toda é lava da era Amazoniana.
- **MCD:** infravermelho térmico na superfície. **Rochas:** estimativa qualitativa. **SWIM:** só índices de compatibilidade.
- Filtros: **de 15 para 21 de 22** com dados (PR #11).

### 14/11 (tarde e noite): organização da equipe, globo e últimos dados
- **Limpeza do GitHub:** branches antigas apagadas; tentativa de proteger a `main` (não aplicada em repositório privado gratuito).
- **Trava local** contra push direto na `main` (`.githooks/pre-push`) e **guia reescrito**, depois simplificado para trabalhar por cliques (VS Code, github.dev e lápis do GitHub) (PR #12).
- **README** atualizado com a equipe e o estado real do projeto.
- **Globo:** zoom de descida maior, mirando a área de estudo; crateras dos rovers adicionadas; pontos de teste removidos do mapa.
- **Radiação:** 13 medições do RAD (Curiosity, sol 1) → **0,21 mGy/dia**. **Direção do vento:** calculada dos componentes do MCD → **de noroeste (~306°)**. **Rochas:** fonte confirmada (Viking IRTM, Christensen 1986).
- Filtros: **23 de 23** com dados.

### 15/11: botões de informação, logo e cartões do globo
- **Botão "i"** em cada pasta e subfiltro, com os textos da equipe (revisados para bater com os dados) e 19 imagens.
- **Logo do ARES** (Victor) no cabeçalho, na tela de carregamento, no painel "Alvo selecionado" e no favicon.
- **Cartões dos locais do globo:** Olympus Mons, Gale, Gusev, Jezero, Viking 1, Viking 2 e a área de estudo, com ilustrações e textos do Saulo; correção da posição da Viking 2 (PR #20).
- **FortiGuard:** pedido de classificação do site e da API, como recomendado pela NASA.
- **Projeto finalizado.**

---

## 13. Histórico de Pull Requests

| PR | Título | Conteúdo principal |
|---|---|---|
| #1 | Mapa 2D: filtros independentes, painel de inspeção e mapa base de Marte | Mapa 2D reconstruído |
| #2 | Filtros em pastas, configuração da câmera e guia do projeto | Pastas, câmera, guia |
| #3 | Backend: API de rotas do Saulo | Pasta `backend/` |
| #4 | Painel de rotas conectado à API do Saulo | Front-end das rotas |
| #5 | Espaço para o selo do Netlify, memória do globo e tela de erro | Correções de celular |
| #6–#10 | Tradução, filtros de relevo, valores regionais e SWIM | Branches `mapa-2d` e `filtros-relevo` |
| #11 | Dados do TES, mapa geológico da USGS, infravermelho do MCD e rochas | 21 de 22 filtros |
| #12 | Guia do projeto e trava contra push direto na main | Organização da equipe |
| #13–#19 | Crateras, zoom, remoção dos pontos de teste, radiação e vento, botões "i", logo | Numeração aproximada |
| #20 | Info dos locais do globo 3D | Cartões dos locais e correção da Viking 2 |

---

## 14. Trabalho além do código

- **`GUIA_DO_PROJETO.md`:** guia de trabalho da equipe, reescrito para ser feito **por cliques**, com três jeitos de trabalhar (lápis do GitHub, github.dev e VS Code), o mesmo final por Pull Request e soluções prontas para os erros mais comuns.
- **`README.md`:** apresentação do projeto, com equipe, filtros, fontes e etapas.
- **`KANBAM.md`:** quadro de tarefas, do início ao fim.
- **Fluxo de equipe no GitHub:** branches, Pull Requests, Deploy Preview, resolução de conflitos e limpeza de branches; trava local contra push direto na `main`.
- **Aula 1 de programação** para o grupo: mensagem curta e uma página HTML interativa com:
  - Demonstração de HTML, CSS e JavaScript ligando e desligando.
  - Explicação de tags.
  - Editor ao vivo.
  - Teste rápido.
  - Atividade "Ficha de Marte" com correção automática.
- **Comunicação com o Saulo:** mensagens curtas com pedidos de dados (o que buscar, em que formato, com quais informações de fonte).
- **Revisão científica dos textos:** os textos dos botões "i" e dos cartões do globo foram conferidos com os dados do site (ex.: radiação medida em Gale, temperatura como um instante e não média anual, posição da Viking 2).
- **Pedido ao FortiGuard** para os avaliadores conseguirem abrir o site.

---

## 15. Melhorias futuras e checklist da apresentação

O projeto está completo. Estas são ideias para uma próxima versão, caso o ARES continue:

### Dados
- **Atmosfera em outros horários e estações** (hoje é um instante: início da tarde, começo da primavera).
- **TES com valores exatos,** se aparecer o arquivo `.envi` que acompanha os `.hdr`.
- **Rochas em %,** se for encontrada a legenda do mapa do IRTM.
- **Confirmar a coordenada do AP-8** e a referência dos pontos AP no artigo original.
- **Dados de maior resolução** (modelos de terreno do CTX ou HiRISE) para enxergar rochas e crateras pequenas, abaixo dos ~460 m do MOLA.

### Site
- **Pesquisa por coordenadas** na barra superior.
- **Perfil de elevação** da rota.
- **Fotos reais** nos cartões do globo e imagens para os botões "i" que ficaram sem imagem (inclinação, infravermelho, geomorfologia).

### Rotas (matemática e física)
- **Suavizar as rotas** (hoje têm o formato "em degraus" da grade de 8 direções) e recalcular a distância pela geometria real.
- **Validar os pesos** de cada modo do A*.
- **Modo "rota científica",** que favoreça pontos com mais evidência de gelo.

### Checklist para a apresentação
- [ ] Narrativa: o desafio, a área, as camadas, as rotas, a validação.
- [ ] Deixar claro na fala o que é **medido**, **calculado**, **modelado** e **estimado**, e os limites da resolução (~460 m: rochas e crateras pequenas não aparecem).
- [ ] Acordar a API do Render minutos antes (abrir `/status`).
- [ ] Testar o site na rede onde será a apresentação.
- [ ] Ter um plano B: prints ou vídeo do site funcionando, e lembrar que o Netlify permite republicar uma versão anterior com um clique.
- [ ] Citar as fontes das imagens num slide final.

---

## 16. Números do projeto

| Item | Quantidade |
|---|---|
| Subfiltros | 23, todos com dados |
| Camadas no mapa | 12 (mais o relevo de fundo) |
| Valores regionais | 11 |
| Camadas geradas (`public/data/layers/`) | 13 imagens + 12 arquivos de valores |
| Botões de informação ("i") | 26 (3 pastas + 23 subfiltros), com 19 imagens |
| Locais clicáveis no globo | 7 |
| Valores no painel ao clicar num ponto | até 23 (12 camadas + 11 regionais) |
| Modos de rota | 3 |
| Tempo para calcular os 3 modos | < 1 s |
| Grade do terreno | 579 × 690 células de 200 m (~400 mil células) |
| Do MOLA (2 GB) ao recorte usado | ~1,6 MB por camada |
| Testes automáticos do back-end | 12 |
| Pull Requests juntados | 20 ou mais |
| Problemas registrados e resolvidos | 31 |

---

## 17. Encerramento

O ARES começou como um globo 3D e um protótipo de mapa e terminou como uma ferramenta completa: relevo real, 23 camadas científicas com fonte e confiança declaradas, rotas calculadas pelo A* sobre o terreno real, explicações em cada filtro e em cada local do globo, tudo publicado e acessível pelo navegador.

Mais do que o código, o projeto deixou um jeito de trabalhar: dados reais tratados com honestidade (o que é medido, calculado, modelado ou estimado está sempre dito), uma equipe organizada no GitHub e um guia para quem chegar depois.

*ARES — A.T.O.M., NASA Space Apps Challenge 2026.*