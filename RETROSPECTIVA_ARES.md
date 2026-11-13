# ARES — Retrospectiva do Projeto

**Advanced Reconnaissance and Exploration System**
A.T.O.M. — Associação de Tecnologia, Observação e Matemática
NASA Space Apps Challenge — desafio de mapa em camadas para uma *Marswalk*

Documento escrito em 13/11/2026. Reúne o que existe no projeto, como cada parte funciona, quais dados temos (e de onde vieram), os problemas que apareceram no caminho e um mapa cronológico das atualizações.

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
15. [O que ainda falta](#15-o-que-ainda-falta)
16. [Números do projeto](#16-números-do-projeto)

---

## 1. O projeto em uma página

O ARES é um site, sem instalação, que funciona no computador e no celular. Ele tem duas telas:

1. **Globo 3D:** Marte inteiro, com o Sol, as estrelas e as luas Fobos e Deimos. O botão **Descer** faz uma animação de aproximação até a área de estudo.
2. **Mapa 2D:** a área de estudo, com o relevo real de Marte, três painéis e um planejador de rotas.

No mapa 2D, o usuário pode:

- **Ligar filtros científicos,** um subfiltro por vez, organizados em três pastas (Geologia, Condições atmosféricas e Suporte à vida).
- **Clicar em qualquer ponto** e ver os valores reais daquele lugar: altitude, inclinação, rugosidade, obstáculos, índices de gelo do SWIM e as condições atmosféricas da região.
- **Escolher origem e destino** e calcular três rotas pelo algoritmo A*: menor distância, maior segurança e multicritério. As rotas usam o relevo real medido pela sonda Mars Global Surveyor.

Situação em 13/11/2026:

| Item | Situação |
|---|---|
| Globo 3D | ✅ Pronto (com configurações de câmera e texturas 2K/8K) |
| Mapa 2D com relevo real | ✅ Pronto |
| Filtros | ✅ 15 de 22 subfiltros com dados reais |
| Rotas com relevo real | ✅ Prontas e publicadas |
| Site publicado (Netlify) | ✅ No ar |
| API de rotas publicada (Render) | ✅ No ar, com dados reais |
| Funciona no celular | ✅ Sim (três problemas de celular foram corrigidos) |

---

## 2. O desafio e como o ARES responde a ele

O desafio pede uma **visão integrada e em camadas** de um local ou rota em Marte, que reúna dados de **várias missões da NASA** e ajude um explorador humano a planejar uma caminhada (*Marswalk*) com segurança, fazendo ciência pelo caminho. Exige **pelo menos três tipos de dados** cruzados.

| Exigência do desafio | Como o ARES atende |
|---|---|
| Topografia e inclinação | Relevo, inclinação, rugosidade e obstáculos calculados a partir do MOLA (Mars Global Surveyor) |
| Condições térmicas e atmosféricas | Temperatura, pressão, densidade, vento e poeira (Mars Climate Database) |
| Radiação | Subfiltro previsto; dado ainda em preparação |
| Geologia e áreas de interesse | Relevo e inclinação já prontos; minerais do TES em preparação |
| Recursos (gelo/água) | Seis produtos do SWIM, que combina radar SHARAD, MOLA, TES e THEMIS |
| Rotas seguras | A* com três modos, desviando de obstáculos e pesando inclinação e rugosidade |
| Formato | Sistema digital interativo (site), que também funciona como "painel do habitat" |

**Missões e instrumentos cujos dados estão no ARES:** Mars Global Surveyor (MOLA), Mars Reconnaissance Orbiter (SHARAD, via SWIM), Mars Odyssey e outras (via SWIM), além do modelo climático Mars Climate Database (LMD/ESA/CNES).

---

## 3. Equipe

| Pessoa | Papel no documento do projeto | O que fez de fato até aqui |
|---|---|---|
| **Saulo** | Coordenação geral e back-end | Sistema de rotas inteiro em Python (A*, terreno, obstáculos, modo interativo), organização dos filtros, coleta de dados (SWIM, Mars Climate Database) |
| **Guilherme** | Front-end (promovido a Diretor de Informática) | Site em React, globo 3D, mapa 2D, painéis, integração com a API, publicação no Netlify e no Render, GitHub da equipe, aulas de programação |
| **Willian** | Análise de dados e back-end | Previsto para os dados e metadados |
| **Victor** | Design e identidade visual | Previsto |
| **Anthonelo** | Matemática e física | Previsto para validar inclinação, pesos do A* e física da atmosfera |
| **(@☆)** | Desenvolvimento da plataforma web | Previsto |

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
       outputs/npy/ + dados/swim/                  ▲
                    ▲                              │
                    │                              │
            main.py do Saulo  ◄──── MOLA (2 GB, lido pela internet, só o pedaço da área)
```

**A ideia central:** o trabalho pesado (ler o MOLA de 2 GB, recortar a área, calcular o terreno) é feito **uma vez só**, no computador da equipe. O site e a API usam apenas os recortes pequenos, alguns MB. Por isso tudo carrega rápido, inclusive no celular.

**Tecnologias:**

| Parte | Tecnologia |
|---|---|
| Interface | React 19 + Vite 8 |
| Estilo | Tailwind CSS 4 |
| Globo 3D | three.js |
| Mapa 2D | Leaflet + react-leaflet |
| Ícones | lucide-react |
| Rotas e dados | Python: numpy, scipy, scikit-image, rasterio, matplotlib |
| API | FastAPI + uvicorn |
| Hospedagem | Netlify (site) e Render (API) |
| Código e equipe | Git + GitHub (repositório `GuilhermeOta/ares-mars`) |

---

## 5. O site, parte por parte

### 5.1 Globo 3D (`src/views/GlobeView.jsx`)

- **Cena:** Marte com atmosfera, Sol com coroa, céu estrelado, Fobos e Deimos em órbita e os marcadores das regiões (vindos de `src/api/regions.json`).
- **Botão Descer:** animação da câmera até a área de estudo, que depois troca para o mapa 2D. A duração aumenta com a distância da câmera.
- **Painel "Câmera":**
  - Sensibilidade de giro e zoom, de 0,2× a 3×, salva no navegador.
  - Zoom ampliado: a câmera vai de 2,5 até 30 unidades. O Sol está a ~62, então o limite seguro é ~50.
  - Texturas **2K por padrão** (~1,8 MB, leves para celular) e **8K opcional** (~14 MB). A troca acontece sem recarregar a página; a escolha fica salva.
- **Gestão de memória:** ao sair do globo, as texturas e o contexto WebGL são liberados. Sem isso, cada ida e volta acumulava as imagens na memória de vídeo do celular.

### 5.2 Mapa 2D (`src/views/MapView.jsx`)

Camadas, de baixo para cima:

1. **Relevo sombreado** real da área (gerado do MOLA). Substituiu um mapa provisório.
2. **Camada científica** do subfiltro ligado.
3. **Contorno tracejado** da área de estudo.
4. **Rotas calculadas,** com contorno escuro para ficarem legíveis sobre qualquer camada.
5. **Marcadores:** origem (A), destino (B), locais candidatos (AP-1, AP-8, AP-9) e pontos de teste.

Também tem:

- **HUD de coordenadas** que acompanha o mouse, em °N e °E.
- **Abaixo do HUD, conforme o subfiltro:** a **legenda** (barra de cores ou categorias), o **cartão de valor regional** ou o aviso **"Dado em preparação"**.
- **Correção de projeção:** as imagens são reajustadas para a projeção de Mercator do Leaflet. Sem isso, ficariam até ~400 m fora do lugar.

### 5.3 Painel de filtros (`src/components/FilterList.jsx`)

- **Três pastas** que só abrem e fecham. Dentro delas, **um subfiltro por vez** (botão de rádio).
- **Subtítulos** dentro das pastas (ex.: "Composição mineralógica", "Disponibilidade de água").
- **Etiquetas:** "regional" (azul) para valores que valem para a área toda, e "sem dados" para o que ainda falta.
- O rodapé mostra o nome da camada ligada.

### 5.4 Painel de inspeção (`src/components/InspectionPanel.jsx`)

Ao clicar num ponto, num local candidato ou num marcador, mostra:

- **"Neste ponto":** o valor real de cada camada naquele lugar (até 14 valores), com os regionais marcados.
- **"Fonte":** instrumento, missão, data, resolução e confiança da camada ligada. Campos sem informação aparecem como "pendente".

### 5.5 Painel de rotas (`src/components/RoutePanel.jsx`)

- **Botões de origem e destino.** Ao clicar no mapa, o ponto é definido; depois da origem, o painel já pede o destino.
- **Inverter, limpar e calcular.**
- **Um cartão por modo:** distância, declividade máxima e folga, com um olho para esconder ou mostrar cada linha.
- **Avisos:** "Rota de TESTE" (quando não há API configurada), "Terreno SINTÉTICO" (API sem dados reais) e mensagens de erro claras (API desligada, demorando ou ponto fora da área).

### 5.6 Peças de apoio

| Arquivo | Função |
|---|---|
| `src/config/mapConfig.js` | Configuração central: área de estudo, pontos AP, filtros e subfiltros, modos de rota, endereços |
| `src/hooks/useLayerManifest.js` | Lê o `manifest.json` (camadas com imagem) e o `regional.json` (valores regionais) e junta os dois |
| `src/services/layerValues.js` | Lê o valor de uma camada num ponto (baixa o `.bin` uma vez e guarda) e formata para a tela |
| `src/services/routeApi.js` | Único lugar que conversa com a API de rotas (com tempo limite de 60 s) |
| `src/components/MapLegend.jsx` | Legenda da camada |
| `src/components/MapNotice.jsx` | Cartão de valor regional e aviso de "em preparação" |
| `src/components/ErrorBoundary.jsx` | Se algo quebrar, mostra o erro na tela em vez de deixar tudo preto |
| `src/mock/points.js`, `src/mock/routes.js` | Pontos e rotas de **teste**, sempre identificados como teste |

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

A API decide de onde vem o relevo por variáveis de ambiente:

| Variável | O que carrega |
|---|---|
| `ARES_DEM_NPY` + `ARES_RES` | A grade recortada (`dados/elevacao_m.npy`, 200 m). **É o que está em uso.** |
| `ARES_MOLA` | O GeoTIFF do MOLA, recortado ao ligar |
| nenhuma | Terreno sintético (só para testes) |

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
Dados (MOLA, SWIM)  →  export_layers.py  →  public/data/layers/
                                            ├── *.png          (a imagem de cada camada)
                                            ├── *.bin          (os valores, para o painel)
                                            └── manifest.json  (lista, legenda, fonte)

Números do Mars Climate Database  →  public/data/regional.json  (preenchido à mão)
```

- **Camada com imagem:** o subfiltro mostra a imagem no mapa e a legenda. Os valores ficam em arquivos `.bin` (números inteiros compactados), baixados só no primeiro clique.
- **Valor regional:** para dados de modelos globais, cuja resolução é maior que a própria área (ex.: Mars Climate Database). O mapa mostra um cartão com o número; o painel lista o valor como "(regional)".
- **Em preparação:** subfiltro sem dados mostra um aviso com a fonte prevista. Nada é inventado.

A regra que liga tudo: **o `id` do subfiltro no `mapConfig.js` é igual ao `id` no `manifest.json` ou no `regional.json`.**

### 7.2 Situação de cada subfiltro (22 no total)

**Geologia**

| Subfiltro | Situação | Fonte / valor |
|---|---|---|
| Relevo e altitude | ✅ Camada | MOLA; −4.155 a −3.746 m (escala de cores de −3.990 a −3.890 m, onde estão 98% dos valores) |
| Inclinação do terreno | ✅ Camada | Calculada do MOLA; 0 a 7,3° (escala 0–2°: 99% da área está abaixo de 2°) |
| Silicatos/vidro (alto Si) | ⏳ Em preparação | TES (faltam os arquivos de dados) |
| Quartzo | ⏳ Em preparação | TES |
| K-feldspato | ⏳ Em preparação | TES |
| Poeira superficial | ⏳ Em preparação | TES |

**Condições atmosféricas**

| Subfiltro | Situação | Valor (Mars Climate Database v6.2) |
|---|---|---|
| Temperatura | ✅ Regional | 228,1 K (≈ −45 °C) |
| Pressão atmosférica | ✅ Regional | 843,9 Pa |
| Densidade | ✅ Regional | 0,0194 kg/m³ |
| Ventos | ✅ Regional | 4,9 m/s (só velocidade) |
| Índices de poeira | ✅ Regional | 0,35 (opacidade) |
| Radiação | ⏳ Em preparação | Modelo de raios cósmicos (falta o número e a fonte) |

O momento dos valores do MCD: **Ls 21,3°** (início da primavera no norte), cerca de **13h30, hora local**, a 10 m do solo, cenário de clima médio.

**Suporte à vida**

| Subfiltro | Situação | Fonte / valor na área |
|---|---|---|
| Consistência do gelo | ✅ Camada | SWIM, 3 km/px; 0,03 a 0,48 |
| Refletores de radar profundos | ✅ Camada | SWIM/SHARAD, 4,7 km/px; cobre 45% da área (faixas das passagens do radar) |
| Potência do radar na superfície | ✅ Camada | SWIM, 3 km/px; −1 a +1 |
| Propriedades dielétricas | ✅ Camada | SWIM, 3 km/px; 0,57 a 0,88 |
| Análise térmica | ✅ Regional | SWIM; 0 em toda a área |
| Geomorfologia | ✅ Regional | SWIM; 0 em toda a área |
| Rugosidade (TRI) | ✅ Camada | Calculada do MOLA; 0 a 20 m (escala 0–5 m) |
| Obstáculos ao deslocamento | ✅ Camada | Critérios do algoritmo de rotas; rugosidade extrema e depressões fechadas |
| Abundância de rochas | ⏳ Em preparação | Falta um mapa com coordenadas |
| Atividade vulcânica | ⏳ Em preparação | Falta definir a fonte |

**Total: 15 de 22 com dados reais** (10 camadas no mapa e 7 valores regionais, contando o relevo de fundo à parte).

### 7.3 Escolhas importantes

- **Escala de cores pela faixa onde está a maioria dos valores,** e não pelo mínimo e máximo absolutos. A área é muito plana, e com a escala absoluta o mapa sairia de uma cor só. A legenda marca os extremos com "≤" e "≥".
- **Dados de baixa resolução mantêm os "quadrados".** Os mapas do SWIM têm 3 km por pixel e aparecem quadriculados, que é a resolução real. A amostragem usa "vizinho mais próximo", para não inventar valores intermediários.
- **Medido × calculado × modelado,** sempre identificado no painel. A altitude é **medida** (MOLA); a inclinação e a rugosidade são **calculadas** a partir dela; os dados do MCD são **modelo**.

---

## 8. Inventário de dados

### 8.1 Dados reais em uso

| Dado | Origem | Formato | Onde está no projeto | Resolução |
|---|---|---|---|---|
| Relevo (elevação) | MOLA, Mars Global Surveyor, mosaico global do USGS (`Mars_MGS_MOLA_DEM_mosaic_global_463m.tif`, 2 GB) | Lido pela internet (`/vsicurl/`), recortado | `backend/dados/elevacao_m.npy` (API) e `public/data/layers/` (site) | 463 m (grade de 200 m) |
| Declividade, rugosidade, obstáculos | Calculados pelo código do Saulo a partir do MOLA | `.npy` | `backend/outputs/npy/` (local) e `public/data/layers/` | Grade de 200 m |
| Gelo/água (7 produtos) | SWIM (Subsurface Water Ice Mapping) | GeoTIFF com coordenadas (0–60°N, 188–208°E) | `backend/dados/swim/` | 3 km (refletores: 4,7 km) |
| Atmosfera (5 variáveis) | Mars Climate Database v6.2 | Texto (grade lat × lon) | Valores em `public/data/regional.json` | Modelo global |

### 8.2 Dados recebidos, mas ainda não usados

| Dado | Por que ainda não entrou |
|---|---|
| TES, mapas minerais (1, 2 e 4 pixels por grau) | Vieram só os cabeçalhos `.hdr`, sem os dados; e as 13 bandas não têm nome |
| `Wdn.tif` (SWIM) | Não sabemos o que significa; só 4 valores diferentes na área |
| Mapas do MCD em imagem (temperatura, pressão, densidade, H) | Substituídos pelos números em texto, que são precisos |
| Imagens globais (TES, IRTM, raios cósmicos, gelo em globos) | Sem coordenadas ou sem escala de cores; servem só como referência visual |
| Gráficos do código de rotas (imagens 11 a 18) | Ótimos para a apresentação; as camadas do site foram geradas dos números originais |

### 8.3 A área de estudo

- **Limites:** 39,3–41,25°N e 200,8–203,85°E (longitude leste, de 0 a 360). São os três pontos AP mais 0,5° de margem, a mesma regra do código do Saulo.
- **Tamanho:** cerca de 140 × 110 km, numa grade de 579 × 690 células de 200 m.
- **Altitude:** entre −4.155 e −3.746 m, quase 4 km abaixo do nível de referência de Marte, numa planície muito plana (inclinação média abaixo de 0,3°).
- **Locais candidatos:** AP-1 (39,80°N, 202,10°E), AP-8 (40,75°N, 201,30°E) e AP-9 (40,02°N, 203,35°E).

**Sobre o nome da região:** pelo código do Saulo, os pontos AP vêm de um artigo (Luzzi et al., 2025, JGR Planets) sobre locais de pouso no **norte de Amazonis Planitia**. A área fica na **fronteira entre Arcadia e Amazonis Planitia**, e o próprio código anota que a coordenada do AP-8 não foi confirmada. Vale conferir a referência na fonte original: ela foi citada a partir do código, sem consulta ao artigo.

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

---

## 10. Estrutura de pastas

```
ares-mars/
├── backend/                     Código de rotas do Saulo + API + exportação de camadas
│   ├── api.py                   API (FastAPI)
│   ├── main.py                  Programa principal (modo interativo e exportação)
│   ├── export_layers.py         Gera as camadas dos filtros para o site
│   ├── astar.py, route_comparison.py, terrain_analyzer.py,
│   │   obstacle_detection.py, dem_processor.py, data_sources.py,
│   │   visualization.py, interactive.py, synthetic_fixture.py
│   ├── dados/
│   │   ├── elevacao_m.npy       Relevo real recortado (usado pela API no Render)
│   │   └── swim/                7 GeoTIFFs do SWIM
│   ├── tests/, pytest.ini       Testes automáticos
│   ├── outputs/                 (não vai para o GitHub) Saídas do main.py
│   └── data/                    (não vai para o GitHub) MOLA baixado, se houver
├── public/
│   └── data/
│       ├── layers/              Camadas do mapa: *.png, *.bin, manifest.json
│       └── regional.json        Valores regionais (Mars Climate Database e SWIM)
├── src/
│   ├── App.jsx                  Esqueleto: estados compartilhados e painéis
│   ├── main.jsx                 Ponto de entrada (com a tela de erro e o selo do Netlify)
│   ├── index.css                Estilos globais
│   ├── config/mapConfig.js      Configuração central
│   ├── views/                   GlobeView.jsx, MapView.jsx
│   ├── components/              FilterList, InspectionPanel, RoutePanel, MapLegend,
│   │                            MapNotice, ErrorBoundary
│   ├── services/                routeApi.js, layerValues.js
│   ├── hooks/                   useLayerManifest.js
│   ├── mock/                    points.js, routes.js (TESTE)
│   ├── api/regions.json         Regiões do globo
│   └── assets/                  Texturas 2K e 8K, luas
├── index.html                   lang="pt-BR" e bloqueio da tradução automática
├── GUIA_DO_PROJETO.md           Guia para a equipe
├── KANBAM.md                    Quadro de tarefas
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

---

## 13. Histórico de Pull Requests

| PR | Título | Conteúdo principal |
|---|---|---|
| #1 | Mapa 2D: filtros independentes, painel de inspeção e mapa base de Marte | Mapa 2D reconstruído |
| #2 | Filtros em pastas, configuração da câmera e guia do projeto | Pastas, câmera, guia |
| #3 | Backend: API de rotas do Saulo | Pasta `backend/` |
| #4 | Painel de rotas conectado à API do Saulo | Front-end das rotas |
| #5 | Espaço para o selo do Netlify, memória do globo e tela de erro | Correções de celular |
| seguintes | Tradução, filtros de relevo, valores regionais e SWIM | Branches `mapa-2d` e `filtros-relevo` |

---

## 14. Trabalho além do código

- **`GUIA_DO_PROJETO.md`:** explica cada pasta e arquivo, quem mexe em quê, receitas rápidas e convenções. Atualizado depois da entrada do backend.
- **`KANBAM.md`:** quadro de tarefas reorganizado por área.
- **Fluxo de equipe no GitHub:** branches, Pull Requests, Deploy Preview, e explicações sobre commits e histórico.
- **Aula 1 de programação** para o grupo: mensagem curta e uma página HTML interativa com:
  - Demonstração de HTML, CSS e JavaScript ligando e desligando.
  - Explicação de tags.
  - Editor ao vivo.
  - Teste rápido.
  - Atividade "Ficha de Marte" com correção automática.
- **Comunicação com o Saulo:** mensagens curtas com pedidos de dados (o que buscar, em que formato, com quais informações de fonte).

---

## 15. O que ainda falta

### Dados (Saulo e Willian)
- [ ] **TES:** os arquivos de dados (vieram só os `.hdr`) e o nome de cada uma das 13 bandas.
- [ ] **Radiação:** dose anual na área e a fonte do modelo.
- [ ] **Abundância de rochas:** um mapa com coordenadas.
- [ ] **Atividade vulcânica:** definir a fonte (ex.: mapa geológico do USGS).
- [ ] **Vento:** a direção, além da velocidade.
- [ ] **Confirmar a escala do SWIM** (−1 a +1?), o significado do 0 na análise térmica e na geomorfologia, a unidade dos refletores e o que é o `Wdn`.
- [ ] Confirmar a coordenada do AP-8 e a referência dos pontos AP.

### Site (Guilherme)
- [ ] Substituir ou remover os **pontos de teste** (`src/mock/points.js`).
- [ ] **Abas explicativas** de cada subfiltro (campo `info`), pedido do Saulo.
- [ ] Atualizar as coordenadas do **globo** (`src/api/regions.json`) para bater com o mapa 2D.
- [ ] Revisar a experiência no celular com o painel de inspeção mais longo.
- [ ] **Aula 2** (CSS).

### Matemática e física (Anthonelo)
- [ ] Validar os pesos dos modos do A* e o cálculo de declividade.
- [ ] Avaliar a suavização das rotas (formato "em degraus" da grade).

### Apresentação
- [ ] Narrativa: o desafio, a área, as camadas, as rotas, a validação.
- [ ] Deixar claro na fala o que é **medido**, **calculado** e **modelado**, e os limites da resolução (~460 m: rochas e crateras pequenas não aparecem).
- [ ] Acordar a API do Render minutos antes.
- [ ] Ter um plano B: o Netlify permite republicar uma versão anterior do site com um clique.

---

## 16. Números do projeto

| Item | Quantidade |
|---|---|
| Subfiltros planejados | 22 |
| Subfiltros com dados reais | 15 (10 camadas no mapa + 7 regionais, contando o fundo à parte) |
| Camadas geradas (`public/data/layers/`) | 9 imagens + 8 arquivos de valores |
| Valores no painel ao clicar num ponto | até 14 |
| Modos de rota | 3 |
| Tempo para calcular os 3 modos | < 1 s |
| Grade do terreno | 579 × 690 células de 200 m (~400 mil células) |
| Do MOLA (2 GB) ao recorte usado | ~1,6 MB por camada |
| Pull Requests juntados | 5 ou mais |
| Problemas de celular corrigidos | 3 (memória, selo, tradução) |
| Rotas validadas contra o código original | 9 (3 trajetos × 3 modos), todas idênticas |