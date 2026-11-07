# ARES — Guia do Projeto

Guia para entender como o site está organizado, o que cada arquivo faz e onde mexer para cada tipo de tarefa. Serve para todo o grupo A.T.O.M.

> Se você só quer saber **onde vai trabalhar**, pule para a seção [Quem mexe em quê](#quem-mexe-em-quê).

---

## O que é o site

O ARES tem duas telas:

1. **Globo 3D** — Marte inteiro, com as luas e o Sol. O botão **Descer** faz a animação de aproximação até Arcadia Planitia.
2. **Mapa 2D** — a área de estudo em Arcadia Planitia, com:
   - **Painel esquerdo:** filtros científicos (pastas com subfiltros).
   - **Painel direito:** inspeção do ponto clicado.
   - **Painel inferior:** planejamento de rotas A* (em construção).

**Tecnologias:**

| Parte | Tecnologia |
|---|---|
| Interface | React + Vite |
| Estilo | Tailwind CSS 4 |
| Globo 3D | three.js |
| Mapa 2D | Leaflet (via react-leaflet) |
| Rotas (back-end, em construção) | Python + FastAPI |

---

## Como rodar no seu computador

Na primeira vez:

```bash
git clone https://github.com/GuilhermeOta/ares-mars.git
cd ares-mars
npm install
```

Para abrir o site:

```bash
npm run dev
```

Abra o link que aparecer (geralmente `http://localhost:5173`). Para parar o servidor, use `Ctrl + C`.

**Outros comandos úteis:**

| Comando | Para que serve |
|---|---|
| `npm run build` | Gera a versão final do site na pasta `dist/`. Se ele passar sem erro, o site está pronto para publicar. |
| `npm run lint` | Procura erros comuns no código. |

---

## Mapa das pastas

```
ares-mars/
├── public/                  Arquivos servidos direto, sem processamento
│   └── data/layers/         (futuro) Camadas científicas exportadas + manifest.json
├── src/                     Todo o código do site
│   ├── api/                 Dados fixos usados pelo globo
│   ├── assets/              Texturas e imagens
│   ├── components/          Pedaços reutilizáveis da interface
│   ├── config/              Configurações centrais (área, filtros, pontos)
│   ├── hooks/               Lógica reutilizável do React
│   ├── mock/                Dados de TESTE (não são científicos)
│   ├── views/               As duas telas: globo e mapa
│   ├── App.jsx              O "esqueleto" que junta tudo
│   ├── index.css            Estilos globais
│   └── main.jsx             Ponto de entrada do React
├── backend/                 (futuro) API de rotas em Python — Saulo
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
- **Os estados compartilhados:** qual subfiltro está ligado (`activeLayerId`), qual ponto foi clicado (`selection`) e quais camadas existem (`manifest`).

> ⚠️ Arquivo muito disputado: quase tudo passa por ele. **Avise o grupo antes de editar.** Sempre que possível, crie um componente novo em `components/` e mexa só em poucas linhas do `App.jsx`.

#### `src/index.css`

Estilos globais:

- **Base:** fundo preto e fonte padrão.
- **Mapa:** fundo escuro do mapa, marcadores (`.ares-marker`), locais candidatos (`.ares-site`) e barra de rolagem dos painéis.

#### `src/App.css`

Praticamente vazio, sobra do template do Vite. Pode ser ignorado.

### `src/views/` — as duas telas

#### `views/GlobeView.jsx` — Globo 3D

Monta a cena em three.js:

- Marte, a atmosfera, o Sol, as estrelas e as luas Fobos e Deimos.
- Os marcadores das regiões, vindos do `api/regions.json`.

No topo do arquivo ficam as configurações da câmera:

| Constante | O que controla |
|---|---|
| `CAMERA_MIN_DISTANCE` | O mais perto que a câmera chega (Marte tem raio 1.5) |
| `CAMERA_MAX_DISTANCE` | O mais longe (não passar de ~50: o Sol está a ~62) |

O painel **Câmera** ajusta a sensibilidade de giro e zoom, e o navegador salva a escolha. A animação do botão **Descer** está na função `window.triggerZoomToArcadia`.

#### `views/MapView.jsx` — Mapa 2D

O mapa em Leaflet. As camadas são desenhadas nesta ordem, de baixo para cima:

1. **Mapa base:** o relevo exportado pela equipe de dados ou, enquanto ele não existir, um mapa global provisório.
2. **Camada científica:** o subfiltro ligado.
3. **Contorno tracejado** da área de estudo.
4. **Locais candidatos** (AP-1, AP-8, AP-9) e pontos dos filtros.

Também mostra o HUD de coordenadas, que segue o mouse. Ao clicar, avisa o `App` qual ponto foi selecionado.

### `src/components/` — pedaços da interface

| Arquivo | O que faz |
|---|---|
| `FilterList.jsx` | A lista de filtros do painel esquerdo. Cada filtro é uma **pasta** que só abre e fecha; dentro dela, o usuário escolhe **um subfiltro por vez**. Subfiltros sem dados exportados mostram a etiqueta "sem dados". |
| `InspectionPanel.jsx` | O painel direito. Mostra o que foi clicado: um local candidato, um ponto de filtro ou uma coordenada. Campos sem informação aparecem como "pendente". |

### `src/config/` — configurações centrais

#### `config/mapConfig.js` ⭐ o arquivo mais importante para quem mexe com dados

Tudo o que define o conteúdo científico do mapa fica aqui:

| O que | Para que serve |
|---|---|
| `STUDY_AREA` | Limites da área de estudo (sul, oeste, norte, leste) |
| `CANDIDATE_SITES` | Os locais candidatos AP-1, AP-8 e AP-9 |
| `FILTERS` | As pastas e seus subfiltros (nome, unidade, fonte, cor, ícone) |
| `DEFAULT_ACTIVE_LAYER` | Qual subfiltro já começa ligado |
| `FALLBACK_BASEMAP` | Mapa base provisório, usado até o relevo real ser exportado |

### `src/hooks/`

| Arquivo | O que faz |
|---|---|
| `useLayerManifest.js` | Lê o arquivo `public/data/layers/manifest.json`, que lista as camadas exportadas pela equipe de dados. Se o arquivo não existir, o site continua funcionando e mostra "sem dados" nos subfiltros. |

### `src/mock/`

| Arquivo | O que faz |
|---|---|
| `points.js` | Pontos de **teste** para os marcadores do mapa. Todos têm `mock: true`, e a interface avisa "Dado de teste". **Precisam ser substituídos por dados reais antes da apresentação.** |

### `src/api/`

| Arquivo | O que faz |
|---|---|
| `regions.json` | Regiões e pontos desenhados no globo 3D. ⚠️ As coordenadas daqui ainda não batem com as do `mapConfig.js` (pendência). |

### `src/assets/` — imagens

| Arquivo | Uso |
|---|---|
| `8k_mars.jpg`, `8k_stars.jpg`, `8k_sun.jpg` | Texturas em alta resolução usadas no globo |
| `2k_mars.jpg`, `2k_stars.jpg`, `2k_sun.jpg` | Versões leves; hoje não usadas, mas úteis para celular |
| `phobos.jpg`, `deimos.jpg` | Texturas das luas |
| `hero.png`, `react.svg`, `vite.svg` | Sobras do template; podem ser apagados |

### `public/` — arquivos servidos direto

Tudo aqui vai para o site exatamente como está, sem processamento.

- **`favicon.svg`, `icons.svg`:** ícones do site.
- **`data/layers/` (futuro):** onde a equipe de dados coloca as camadas exportadas (`.png`) e o `manifest.json`.

### Arquivos da raiz

| Arquivo | O que é | Mexer? |
|---|---|---|
| `index.html` | Página base onde o React é montado | Raramente |
| `package.json` | Dependências e comandos (`npm run dev` etc.) | Só ao instalar bibliotecas, via `npm install nome` |
| `package-lock.json` | Versões exatas instaladas | **Nunca à mão** |
| `vite.config.js` | Configuração do Vite | Raramente |
| `postcss.config.js` | Liga o Tailwind ao Vite | Não |
| `tailwind.config.js` | Configuração no formato antigo do Tailwind; no Tailwind 4 provavelmente não tem efeito | Não |
| `.oxlintrc.json` | Regras do `npm run lint` | Não |
| `.gitignore` | O que o Git ignora (`node_modules`, `dist`...) | Raramente |
| `README.md` | Apresentação do projeto | Sim |
| `KANBAM.md` | Quadro de tarefas | Sim |

> **Nunca suba para o GitHub:** `node_modules/` (as bibliotecas instaladas) e `dist/` (o site gerado pelo build). O `.gitignore` já bloqueia os dois.

---

## Como as peças conversam

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

**A regra de ouro:** o `id` de cada subfiltro no `mapConfig.js` precisa ser **exatamente igual** ao `id` da camada no `manifest.json`. É assim que o botão "Disponibilidade de água" encontra a imagem certa. Se os IDs baterem, a etiqueta "sem dados" some sozinha e a camada aparece no mapa.

---

## Quem mexe em quê

| Pessoa / área | Onde trabalha principalmente |
|---|---|
| **Front-end** (Guilherme) | `src/App.jsx`, `src/components/`, `src/views/`, `src/index.css` |
| **Back-end / rotas** (Saulo) | `backend/` (API), `src/config/mapConfig.js` (filtros e pontos) |
| **Dados** (Willian) | `public/data/layers/` (camadas exportadas), `src/config/mapConfig.js` |
| **Design** (Victor) | `src/index.css`, cores no `mapConfig.js`, `src/assets/` |
| **Matemática e física** (Anthonelo) | Revisão da lógica de rotas em `backend/`, unidades e fontes no `mapConfig.js` |

### Para o Saulo: o que você provavelmente vai mais mexer

**1. A pasta `backend/` (sua área, ninguém mais mexe).**

A estrutura prevista é esta:

```
backend/
├── main.py            A API (FastAPI) com a rota POST /rota
├── requirements.txt   Bibliotecas Python usadas (fastapi, uvicorn, numpy...)
└── ...                Seu código de cálculo de rotas
```

Para rodar a API:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Para testar, abra `http://localhost:8000/docs`.

O formato combinado entre o site e a API é este:

```json
// O site manda (POST /rota):
{ "origem": { "lat": 39.8, "lon": 202.1 },
  "destino": { "lat": 40.75, "lon": 201.3 },
  "modo": "multicriterio" }

// A API devolve:
{ "pontos": [[39.8, 202.1], [39.85, 202.0]],
  "distancia_km": 72.0,
  "declividade_max": 4.1,
  "modo": "multicriterio" }
```

O campo `modo` aceita `menor_distancia`, `maior_seguranca` ou `multicriterio`. A longitude é **sempre em graus leste, de 0 a 360**.

**2. O arquivo `src/config/mapConfig.js`.** É onde se organizam os filtros e subfiltros, os locais candidatos e a área de estudo. Mexer aqui não quebra o resto do site, desde que se mantenha o formato dos itens.

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

No `mapConfig.js`, edite `CANDIDATE_SITES` (latitude °N, longitude °E de 0 a 360).

### Mudar a área de estudo

No `mapConfig.js`, edite `STUDY_AREA.bounds`: `[[sul, oeste], [norte, leste]]`.

### Publicar uma camada científica (equipe de dados)

1. Exporte a imagem recortada exatamente na área de estudo (PNG com fundo transparente).
2. Coloque o PNG em `public/data/layers/`.
3. Adicione a camada no `public/data/layers/manifest.json`, com o mesmo `id` do subfiltro:

```json
{
  "layers": [
    {
      "id": "disponibilidade-agua",
      "filter": "suporte-vida",
      "label": "Disponibilidade de água",
      "image": "disponibilidade-agua.png",
      "bounds": [[39.4, 200.8], [41.25, 203.8]],
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

- **Coordenadas:** latitude em °N; longitude em **graus leste, de 0 a 360** (nunca "graus oeste").
- **Nomes de arquivos de componentes:** começam com maiúscula (`FilterList.jsx`, não `filterList.jsx`). O Windows não diferencia, mas o servidor de publicação sim, e o site quebra lá.
- **Dados de teste:** sempre com `mock: true`, para a interface avisar. Nunca coloque valores científicos inventados como se fossem reais.
- **Dados de outro lugar de Marte:** nunca apresente como medição de Arcadia Planitia. Indique quando for modelo ou estimativa.

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
- Se alguém instalou uma biblioteca nova, rode `npm install` depois do `git pull`.
- Arquivos de dados brutos grandes (GeoTIFF etc.) **não vão para o GitHub**; só os PNGs exportados.

---

## Pendências conhecidas

| Pendência | Onde |
|---|---|
| Relevo real da área (hoje o mapa base é provisório) | `public/data/layers/` |
| Camadas científicas reais para cada subfiltro | `public/data/layers/` |
| Substituir os pontos de teste | `src/mock/points.js` |
| API de rotas + painel de rotas no site | `backend/` e `App.jsx` |
| Coordenadas do globo diferentes das do mapa 2D | `src/api/regions.json` |
| Fontes de dados para "Estabilidade do terreno" e "Atividade vulcânica" | `mapConfig.js` |
| Abas explicativas para cada subfiltro | `mapConfig.js` (campo `info`) + painel de inspeção |
