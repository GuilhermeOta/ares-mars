# ARES — Guia do Projeto

Guia para entender como o site está organizado, o que cada arquivo faz e onde mexer para cada tipo de tarefa. Serve para todo o grupo A.T.O.M.

> Se você só quer saber **onde vai trabalhar**, pule para a seção [Quem mexe em quê](#quem-mexe-em-quê).

---

## O que é o site

O ARES tem duas telas:

1. **Globo 3D** — Marte inteiro, com as luas e o Sol. O botão **Descer** faz a animação de aproximação até Arcadia Planitia.
2. **Mapa 2D** — a área de estudo (pontos AP, na fronteira Arcadia/Amazonis), com:
   - **Painel esquerdo:** filtros científicos (pastas com subfiltros).
   - **Painel direito:** inspeção do ponto clicado.
   - **Painel inferior:** planejamento de rotas com o algoritmo A*.

**Tecnologias:**

| Parte | Tecnologia |
|---|---|
| Interface | React + Vite |
| Estilo | Tailwind CSS 4 |
| Globo 3D | three.js |
| Mapa 2D | Leaflet (via react-leaflet) |
| Rotas (back-end) | Python + FastAPI, com o código de rotas do Saulo |

---

## Como rodar no seu computador

### Primeira vez

```bash
git clone https://github.com/GuilhermeOta/ares-mars.git
cd ares-mars
npm install
```

Para usar as rotas de verdade, instale também as bibliotecas do Python:

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### O site

Na raiz do projeto (pasta `ares-mars`):

```bash
npm run dev
```

Abra o link que aparecer (geralmente `http://localhost:5173`). Para parar, use `Ctrl + C`.

### A API de rotas (opcional)

O site funciona sem ela: sem API, o painel de rotas usa **rotas de teste** e avisa na tela. Para usar o cálculo de verdade:

1. Crie um arquivo `.env.local` na raiz do projeto, com esta linha:

   ```
   VITE_ROUTE_API_URL=http://localhost:8000
   ```

2. Num terminal, ligue a API:

   ```bash
   cd backend
   python -m uvicorn api:app --reload
   ```

3. Em **outro** terminal, na raiz do projeto, ligue (ou reinicie) o site com `npm run dev`. O Vite só lê o `.env.local` quando inicia.

A API e o site precisam ficar ligados ao mesmo tempo, cada um no seu terminal.

> No Windows, use `python -m uvicorn` (e não só `uvicorn`), porque a pasta de programas do Python costuma não estar no PATH.

**Outros comandos úteis:**

| Comando | Onde rodar | Para que serve |
|---|---|---|
| `npm run build` | Raiz | Gera a versão final do site na pasta `dist/`. Se passar sem erro, o site está pronto para publicar. |
| `npm run lint` | Raiz | Procura erros comuns no código. O ideal é `0 warnings`. |
| `python -m pytest` | `backend/` | Roda os testes do código de rotas. |

---

## Mapa das pastas

```
ares-mars/
├── backend/                 API de rotas em Python (código do Saulo)
├── public/                  Arquivos servidos direto, sem processamento
│   └── data/layers/         (futuro) Camadas científicas exportadas + manifest.json
├── src/                     Todo o código do site
│   ├── api/                 Dados fixos usados pelo globo
│   ├── assets/              Texturas e imagens
│   ├── components/          Pedaços reutilizáveis da interface
│   ├── config/              Configurações centrais (área, filtros, pontos, rotas)
│   ├── hooks/               Lógica reutilizável do React
│   ├── mock/                Dados de TESTE (não são científicos)
│   ├── services/            Comunicação com a API de rotas
│   ├── views/               As duas telas: globo e mapa
│   ├── App.jsx              O "esqueleto" que junta tudo
│   ├── index.css            Estilos globais
│   └── main.jsx             Ponto de entrada do React
├── .env.local               (cada um cria o seu) Endereço da API; não vai para o GitHub
├── index.html               Página base
└── package.json             Lista de dependências e comandos
```

---

## Arquivo por arquivo

### `src/` — o código do site

#### `src/main.jsx`

Ponto de entrada. Liga o React ao `index.html` e carrega o `App`. **Quase nunca precisa mexer.**

#### `src/App.jsx`

O "esqueleto" da interface. É aqui que ficam:

- **A troca entre globo e mapa** (`viewMode`).
- **Os painéis:** a barra superior, o painel de filtros, o painel de inspeção e o painel de rotas.
- **Os estados compartilhados:** qual subfiltro está ligado (`activeLayerId`), qual ponto foi clicado (`selection`), quais camadas existem (`manifest`) e a rota (`routeOrigin`, `routeDest`, `routePick`, `routeState`).

O `handleSelectPoint` decide o que fazer com cada clique no mapa: se o usuário está escolhendo origem ou destino da rota (`routePick`), o clique define o ponto; senão, abre a inspeção.

> ⚠️ Arquivo muito disputado: quase tudo passa por ele. **Avise o grupo antes de editar.** Sempre que possível, crie um componente novo em `components/` e mexa só em poucas linhas do `App.jsx`.

#### `src/index.css`

Estilos globais:

- **Base:** fundo preto e fonte padrão.
- **Mapa:** fundo escuro, marcadores (`.ares-marker`), locais candidatos (`.ares-site`), origem e destino da rota (`.ares-endpoint`) e o contorno ao escolher um ponto (`.is-picking`).
- **Painéis:** barra de rolagem discreta.

#### `src/App.css`

Praticamente vazio, sobra do template do Vite. Pode ser ignorado.

### `src/views/` — as duas telas

#### `views/GlobeView.jsx` — Globo 3D

Monta a cena em three.js:

- Marte, a atmosfera, o Sol, as estrelas e as luas Fobos e Deimos.
- Os marcadores das regiões, vindos do `api/regions.json`.

No topo do arquivo ficam as configurações:

| Constante | O que controla |
|---|---|
| `CAMERA_MIN_DISTANCE` | O mais perto que a câmera chega (Marte tem raio 1.5) |
| `CAMERA_MAX_DISTANCE` | O mais longe (não passar de ~50: o Sol está a ~62) |
| `TEXTURES` | Os conjuntos de texturas 2K e 8K |

O painel **Câmera** ajusta a sensibilidade de giro e zoom e liga ou desliga as texturas 8K. O navegador salva as duas escolhas. Por padrão o site abre em 2K (~1,8 MB), mais leve para celular; o 8K baixa ~14 MB. A animação do botão **Descer** está na função `window.triggerZoomToArcadia`.

#### `views/MapView.jsx` — Mapa 2D

O mapa em Leaflet. As camadas são desenhadas nesta ordem, de baixo para cima:

1. **Mapa base:** o relevo exportado pela equipe de dados ou, enquanto ele não existir, um mapa global provisório.
2. **Camada científica:** o subfiltro ligado.
3. **Contorno tracejado** da área de estudo.
4. **Rotas calculadas:** uma linha por modo, com contorno escuro para ficar legível sobre qualquer camada.
5. **Marcadores:** origem (A), destino (B), locais candidatos (AP-1, AP-8, AP-9) e pontos dos filtros.

Também mostra o HUD de coordenadas, que segue o mouse. Ao clicar, avisa o `App` qual ponto foi selecionado.

### `src/components/` — pedaços da interface

| Arquivo | O que faz |
|---|---|
| `FilterList.jsx` | A lista de filtros do painel esquerdo. Cada filtro é uma **pasta** que só abre e fecha; dentro dela, o usuário escolhe **um subfiltro por vez**. Subfiltros com `group` aparecem sob um subtítulo. Subfiltros sem dados exportados mostram "sem dados". |
| `InspectionPanel.jsx` | O painel direito. Mostra o que foi clicado: um local candidato, um ponto de filtro ou uma coordenada. Campos sem informação aparecem como "pendente". |
| `RoutePanel.jsx` | O painel inferior de rotas: botões de origem e destino, inverter, limpar, calcular e os cartões com o resultado de cada modo (distância, declividade máxima e folga), com um olho para esconder cada linha do mapa. |

### `src/config/` — configurações centrais

#### `config/mapConfig.js` ⭐ o arquivo mais importante para quem mexe com dados

| O que | Para que serve |
|---|---|
| `STUDY_AREA` | Limites da área de estudo: 39,3–41,25°N e 200,8–203,85°E (pontos AP + 0,5°, igual ao código do Saulo) |
| `CANDIDATE_SITES` | Os locais candidatos AP-1, AP-8 e AP-9 |
| `FILTERS` | As pastas e seus subfiltros (nome, unidade, fonte, cor, ícone, grupo) |
| `DEFAULT_ACTIVE_LAYER` | Qual subfiltro já começa ligado |
| `FALLBACK_BASEMAP` | Mapa base provisório, usado até o relevo real ser exportado |
| `ROUTE_API_URL` | Endereço da API de rotas, lido do `.env.local` |
| `ROUTE_MODES` | Os três modos do A*, com as mesmas cores dos gráficos do Saulo |

### `src/services/`

| Arquivo | O que faz |
|---|---|
| `routeApi.js` | O único lugar do site que conversa com a API. A função `fetchRoutes(origem, destino)` manda o pedido e devolve as três rotas. Se não houver endereço de API, usa as rotas de teste. Desiste depois de 60 segundos e transforma falhas em mensagens claras para o usuário. |

### `src/hooks/`

| Arquivo | O que faz |
|---|---|
| `useLayerManifest.js` | Lê o `public/data/layers/manifest.json`, que lista as camadas exportadas pela equipe de dados. Se o arquivo não existir, o site continua funcionando e mostra "sem dados" nos subfiltros. |

### `src/mock/` — dados de teste

| Arquivo | O que faz |
|---|---|
| `points.js` | Pontos de **teste** para os marcadores do mapa. Todos têm `mock: true`, e a interface avisa "Dado de teste". **Precisam ser substituídos por dados reais antes da apresentação.** |
| `routes.js` | Rotas de **teste**, usadas quando não há API configurada. São linhas entre A e B com curvas artificiais: **não olham o terreno**. A interface avisa "Rota de TESTE". |

### `src/api/`

| Arquivo | O que faz |
|---|---|
| `regions.json` | Regiões e pontos desenhados no globo 3D. ⚠️ As coordenadas daqui ainda não batem com as do `mapConfig.js` (pendência). |

### `src/assets/` — imagens

| Arquivo | Uso |
|---|---|
| `2k_mars.jpg`, `2k_stars.jpg`, `2k_sun.jpg` | Texturas padrão do globo (leves) |
| `8k_mars.jpg`, `8k_stars.jpg`, `8k_sun.jpg` | Texturas em alta resolução, ativadas no painel Câmera |
| `phobos.jpg`, `deimos.jpg` | Texturas das luas (uma versão só) |
| `hero.png`, `react.svg`, `vite.svg` | Sobras do template; podem ser apagados |

### `public/` — arquivos servidos direto

Tudo aqui vai para o site exatamente como está, sem processamento.

- **`favicon.svg`, `icons.svg`:** ícones do site.
- **`data/layers/` (futuro):** onde a equipe de dados coloca as camadas exportadas (`.png`) e o `manifest.json`.

### `backend/` — API de rotas (Python)

O código de rotas do Saulo, com a API por cima. A API é só um "embrulho": o código dele não foi alterado.

| Arquivo | O que faz |
|---|---|
| `api.py` | A API (FastAPI). Rotas: `GET /status` e `POST /rota`. Prepara o terreno uma vez ao ligar; depois, cada rota leva menos de 1 segundo. |
| `main.py` | O programa de linha de comando do Saulo: processa o MOLA, gera mapas, relatórios e a grade `elevacao_m.npy`. Tem o modo interativo (`--interativo`). |
| `route_comparison.py` | Roda os três modos e calcula as métricas. A API usa a função `route_between`. |
| `astar.py` | O algoritmo A* na grade (8 direções, sem cortar quinas). |
| `terrain_analyzer.py` | Declividade, orientação e rugosidade (TRI). |
| `obstacle_detection.py` | Obstáculos (declividade > 15°, rugosidade extrema, depressões fechadas) e folga até o obstáculo mais próximo. |
| `dem_processor.py` | Grade regular, coordenadas e leitura do MOLA. Define os pontos AP. |
| `data_sources.py` | Catálogo das fontes (MOLA, HRSC, CTX) e registro de procedência dos dados. |
| `synthetic_fixture.py` | Terreno **artificial** para testes. A API só usa esse terreno se o `dados/elevacao_m.npy` não existir. |
| `export_layers.py` | Gera as camadas dos filtros para o site (`public/data/layers/`): relevo, SWIM, TES e geologia. |
| `figure_to_data.py` | Converte **figuras** de mapas globais (imagem + barra de cores) em valores aproximados. Usado no TES e nas rochas. |
| `clip_usgs_geology.py` | Recorta o mapa geológico global da USGS (SIM 3292) para a região do site. Roda uma vez; o recorte fica em `dados/usgs/`. |
| `visualization.py`, `interactive.py` | Mapas do matplotlib e modo interativo do `main.py`. |
| `tests/`, `pytest.ini` | Testes automáticos. |
| `requirements.txt` | Bibliotecas Python. |

### Arquivos da raiz

| Arquivo | O que é | Mexer? |
|---|---|---|
| `.env.local` | Endereço da API (`VITE_ROUTE_API_URL`). Cada pessoa cria o seu; o `.gitignore` o bloqueia | Sim, no seu computador |
| `index.html` | Página base onde o React é montado | Raramente |
| `package.json` | Dependências e comandos (`npm run dev` etc.) | Só ao instalar bibliotecas, via `npm install nome` |
| `package-lock.json` | Versões exatas instaladas | **Nunca à mão** |
| `vite.config.js` | Configuração do Vite | Raramente |
| `postcss.config.js` | Liga o Tailwind ao Vite | Não |
| `tailwind.config.js` | Formato antigo do Tailwind; no Tailwind 4 provavelmente não tem efeito | Não |
| `.oxlintrc.json` | Regras do `npm run lint` | Não |
| `.gitignore` | O que o Git ignora (`node_modules`, `dist`, `.env.local`, arquivos do Python...) | Raramente |
| `README.md` | Apresentação do projeto | Sim |
| `KANBAM.md` | Quadro de tarefas | Sim |
| `GUIA_DO_PROJETO.md` | Este guia | Sim, quando a estrutura mudar |

> **Nunca suba para o GitHub:** `node_modules/`, `dist/`, `.env.local`, `__pycache__/`, as pastas `backend/outputs*/` e o arquivo do MOLA (`backend/data/`, ~2 GB). O `.gitignore` já bloqueia todos.

---

## Como as peças conversam

### Filtros e camadas

```
mapConfig.js ──► App.jsx ──► FilterList.jsx      (lista de filtros)
                    │
                    ├──► MapView.jsx             (desenha o mapa e as camadas)
                    │
                    └──► InspectionPanel.jsx     (mostra o ponto clicado)

Equipe de dados ──► public/data/layers/*.png + manifest.json
                         │
                         └──► useLayerManifest.js ──► App.jsx ──► mapa e filtros
```

**A regra de ouro:** o `id` de cada subfiltro no `mapConfig.js` precisa ser **exatamente igual** ao `id` da camada no `manifest.json`. É assim que o botão "Consistência do gelo" encontra a imagem certa. Se os IDs baterem, a etiqueta "sem dados" some sozinha e a camada aparece no mapa.

### Rotas

```
RoutePanel.jsx ──(origem, destino)──► App.jsx ──► routeApi.js
                                                     │
                       com .env.local ◄──────────────┤──────────► sem .env.local
                             │                                         │
                  POST /rota na API (backend/)                 mock/routes.js
                  A* do Saulo, 3 modos, < 1 s                  (rotas de teste)
                             │                                         │
                             └──────────► mesmo formato ◄──────────────┘
                                               │
                              App.jsx ──► MapView.jsx (linhas) + RoutePanel.jsx (cartões)
```

A API e as rotas de teste devolvem **o mesmo formato**, então o desenho e o painel não sabem de onde vieram as rotas. Trocar uma pela outra é só criar ou apagar o `.env.local`.

---

## Quem mexe em quê

| Pessoa / área | Onde trabalha principalmente |
|---|---|
| **Front-end** (Guilherme) | `src/App.jsx`, `src/components/`, `src/views/`, `src/services/`, `src/index.css` |
| **Back-end / rotas** (Saulo) | `backend/`, `src/config/mapConfig.js` (filtros e pontos) |
| **Dados** (Willian) | `public/data/layers/` (camadas exportadas), `src/config/mapConfig.js` |
| **Design** (Victor) | `src/index.css`, cores no `mapConfig.js`, `src/assets/` |
| **Matemática e física** (Anthonelo) | Revisão da lógica de rotas em `backend/` (pesos, declividade), unidades e fontes no `mapConfig.js` |

### Para o Saulo: o que você provavelmente vai mais mexer

**1. A pasta `backend/` (sua área).**

Para rodar a API:

```bash
cd backend
python -m uvicorn api:app --reload
```

Para testar, abra `http://localhost:8000/docs`. Lá dá para mandar uma rota de teste pelo próprio navegador.

**De onde a API tira o relevo** (variáveis de ambiente, nesta ordem):

| Variável | O que carrega | Quando usar |
|---|---|---|
| `ARES_DEM_NPY` + `ARES_RES` | A grade recortada que o `main.py` salva (`outputs/npy/elevacao_m.npy`) e a resolução usada nela | **Recomendado**, inclusive para hospedar (poucos MB) |
| `ARES_MOLA` | O GeoTIFF do MOLA, recortado ao ligar | Testes no computador |
| nenhuma | O relevo real em `dados/elevacao_m.npy` (200 m), que já vem no repositório | Uso normal no computador |

Exemplo no PowerShell, depois de rodar o `main.py` com o MOLA real em 200 m:

```powershell
$env:ARES_DEM_NPY="outputs/npy/elevacao_m.npy"; $env:ARES_RES="200"; python -m uvicorn api:app --reload
```

**O formato entre o site e a API:**

```json
// O site manda (POST /rota):
{ "origem":  { "lat": 39.8,  "lon": 202.1 },
  "destino": { "lat": 40.75, "lon": 201.3 } }

// A API devolve os TRÊS modos de uma vez:
{ "sintetico": false,
  "reta_km": 66.9,
  "rotas": [
    { "modo": "menor_distancia",
      "encontrada": true,
      "pontos": [[39.8, 202.1], [39.81, 202.09]],
      "distancia_km": 70.9,
      "declividade_max": 0.7,
      "declividade_media": 0.2,
      "folga_min_m": 6500,
      "ganho_m": 40,
      "perda_m": 35,
      "motivo": null },
    { "modo": "maior_seguranca", "...": "..." },
    { "modo": "multicriterio",   "...": "..." }
  ] }
```

Os pontos vão em `[latitude, longitude]`, com longitude **sempre em graus leste, de 0 a 360**. Os números acima são só um exemplo do formato. Se nenhuma rota for encontrada (ponto fora da área, por exemplo), a API responde com erro 422 e o motivo, que o site mostra ao usuário.

**2. O arquivo `src/config/mapConfig.js`.** É onde se organizam os filtros e subfiltros, os locais candidatos e a área de estudo. Mexer aqui não quebra o resto do site, desde que se mantenha o formato dos itens. Se mudar a área de estudo, mude também no código de rotas, para os dois continuarem iguais.

---

## Receitas rápidas

### Adicionar um subfiltro

No `mapConfig.js`, dentro da pasta certa em `FILTERS`, acrescente uma linha:

```js
{ id: 'meu-subfiltro', name: 'Nome que aparece', unit: 'K', source: 'Instrumento' },
```

Para agrupar vários subfiltros sob um subtítulo dentro da pasta, use `group`:

```js
{ id: 'olivina', group: 'Composição mineralógica', name: 'Olivina', source: 'TES' },
```

Itens do mesmo grupo devem ficar em sequência na lista.

### Criar uma pasta (filtro) nova

No `mapConfig.js`, acrescente um bloco em `FILTERS`:

```js
{
  id: 'nova-pasta', name: 'Nome da pasta', icon: Wind, color: '#a855f7',
  layers: [ /* subfiltros */ ],
},
```

O ícone vem do [lucide.dev/icons](https://lucide.dev/icons). Ele precisa ser importado na primeira linha do arquivo.

### Adicionar ou mudar um local candidato

No `mapConfig.js`, edite `CANDIDATE_SITES` (latitude °N, longitude °E de 0 a 360). Os mesmos pontos estão no `backend/dem_processor.py` (`POIS`); mantenha os dois iguais.

### Mudar a área de estudo

No `mapConfig.js`, edite `STUDY_AREA.bounds`: `[[sul, oeste], [norte, leste]]`. A API calcula a área dela a partir dos pontos AP, então avise o Saulo.

### Mudar as cores das rotas

No `mapConfig.js`, edite `ROUTE_MODES` (`color` e `dash`, o tracejado).

### Publicar uma camada científica (equipe de dados)

1. Exporte a imagem recortada exatamente na área de estudo (PNG com fundo transparente).
2. Coloque o PNG em `public/data/layers/`.
3. Adicione a camada no `public/data/layers/manifest.json`, com o mesmo `id` do subfiltro:

```json
{
  "layers": [
    {
      "id": "swim-ci",
      "filter": "suporte-vida",
      "label": "Consistência do gelo",
      "image": "swim-ci.png",
      "bounds": [[39.3, 200.8], [41.25, 203.85]],
      "opacity": 0.6,
      "source": {
        "instrument": "SWIM",
        "date": "2024",
        "resolution_m": 460,
        "confidence": "ver documentação SWIM"
      }
    }
  ]
}
```

Para o relevo de fundo, use `"filter": "base"`.

Os campos de `source` são exatamente o que aparece no painel de inspeção: **instrumento, data, resolução e confiança**. Os valores acima são só um exemplo do formato. Preencha com os dados reais de cada camada; campos vazios aparecem como "pendente".

---

## Convenções do projeto

- **Coordenadas:** latitude em °N; longitude em **graus leste, de 0 a 360** (nunca "graus oeste"). Vale para o site, a API e o código de rotas.
- **Nomes de arquivos de componentes:** começam com maiúscula (`FilterList.jsx`, não `filterList.jsx`). O Windows não diferencia, mas o servidor de publicação sim, e o site quebra lá.
- **Dados de teste:** sempre identificados (`mock: true`, "Rota de TESTE", "Terreno SINTÉTICO"), para a interface avisar. Nunca coloque valores científicos inventados como se fossem reais.
- **Dados de outro lugar de Marte:** nunca apresente como medição da área de estudo. Indique quando for modelo ou estimativa.
- **Área de estudo:** os pontos AP ficam na fronteira entre Arcadia e Amazonis Planitia. Na apresentação, descreva assim.

---

## Trabalho em equipe com Git

1. **Antes de começar:**

   ```bash
   git checkout main
   git pull
   ```

2. **Crie uma branch para a tarefa:**

   ```bash
   git checkout -b nome-da-tarefa
   ```

3. **Ao terminar:**

   ```bash
   git add .
   git commit -m "o que você fez"
   git push -u origin nome-da-tarefa
   ```

4. **No GitHub:** abra o Pull Request pelo botão "Compare & pull request".

**Dicas para evitar conflitos:**

- Avise no grupo em qual arquivo você vai mexer, principalmente o `App.jsx`.
- Prefira criar arquivos novos a editar os grandes.
- Se alguém instalou uma biblioteca nova, rode `npm install` (ou `pip install -r requirements.txt`, no `backend/`) depois do `git pull`.
- Arquivos de dados brutos grandes (GeoTIFF, MOLA) **não vão para o GitHub**; só os PNGs exportados e as grades pequenas.
- Ative o salvamento automático do VS Code (*File → Auto Save*) para não esquecer o `Ctrl + S`.

---

## Pendências conhecidas

| Pendência | Onde |
|---|---|
| Radiação (único subfiltro sem dado) | `public/data/regional.json` |
| Substituir os pontos de teste | `src/mock/points.js` |
| Coordenadas do globo diferentes das do mapa 2D | `src/api/regions.json` |
| Abas explicativas para cada subfiltro | `mapConfig.js` (campo `info`) + painel de inspeção |
| Juntar as branches de trabalho na `main` | GitHub (Pull Requests) |
| Hospedar a API e publicar o site | Render/Railway + Vercel/Cloudflare Pages |