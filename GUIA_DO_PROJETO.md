# ARES — Guia do Projeto

Este guia explica **como trabalhar no ARES sem quebrar nada**: como preparar o computador, o passo a passo de cada tarefa (antes, durante e depois de programar), onde fica cada coisa e o que fazer quando algo dá errado.

Serve para todo o grupo A.T.O.M., inclusive para quem está começando a programar agora.

---

## Por onde começar

| Eu quero… | Vá para |
|---|---|
| Entender as palavras do Git (branch, commit, PR…) | [Glossário](#1-glossário-as-palavras-que-aparecem-o-tempo-todo) |
| Preparar meu computador pela primeira vez | [Primeira vez](#2-primeira-vez-preparar-o-computador) |
| Ligar o site no meu computador | [Rodar o projeto](#3-rodar-o-projeto) |
| **Começar uma tarefa nova** | [O ciclo de trabalho](#4-o-ciclo-de-trabalho) ⭐ |
| Resolver um problema ou um erro | [Deu problema?](#5-deu-problema) |
| Saber onde fica cada arquivo | [Mapa do projeto](#6-mapa-do-projeto) |
| Saber em que parte eu trabalho | [Quem mexe em quê](#8-quem-mexe-em-quê) |
| Fazer algo específico (filtro, dado, camada…) | [Receitas rápidas](#9-receitas-rápidas) |

> **A regra mais importante do projeto:** ninguém trabalha direto na `main`. Toda tarefa tem a sua branch e entra no site por um Pull Request. O resto do guia explica como.

---

## 1. Glossário: as palavras que aparecem o tempo todo

| Palavra | O que significa, em português simples |
|---|---|
| **Repositório** | A pasta do projeto, com todo o histórico de mudanças. O nosso fica no GitHub: `GuilhermeOta/ares-mars`. |
| **Commit** | Um "ponto de salvamento" com uma mensagem dizendo o que mudou. Dá para voltar a qualquer commit. |
| **Branch** | Uma "linha paralela" do projeto, onde você trabalha sem afetar o resto. |
| **`main`** | A branch principal. **É ela que vai para o site oficial.** Por isso ninguém mexe nela direto. |
| **Push** | Enviar os seus commits do computador para o GitHub. |
| **Pull** | Trazer do GitHub para o seu computador o que os outros enviaram. |
| **Pull Request (PR)** | Um pedido para juntar a sua branch na `main`. Lá a mudança é testada e revisada antes de entrar. |
| **Merge** | Juntar a branch na `main`, ou seja, aprovar o PR. |
| **Deploy Preview** | Uma cópia de teste do site que o Netlify cria para cada PR, num endereço próprio. Serve para testar antes do merge. |
| **Conflito** | Quando duas pessoas mudaram a mesma linha do mesmo arquivo. O Git pede para alguém decidir qual versão fica. |
| **Trava (hook)** | Um script que roda antes do push e **bloqueia envios direto para a `main`**. Fica em `.githooks/pre-push`. |

---

## 2. Primeira vez: preparar o computador

Faça uma vez só, em cada computador. Precisa ter instalado: **Git**, **Node.js** e **Python**.

```bash
git clone https://github.com/GuilhermeOta/ares-mars.git
cd ares-mars
npm install
git config core.hooksPath .githooks
git config pull.rebase false
```

O que cada linha faz:

1. `git clone` baixa o projeto do GitHub.
2. `cd ares-mars` entra na pasta.
3. `npm install` instala as bibliotecas do site (cria a pasta `node_modules/`).
4. `git config core.hooksPath .githooks` **liga a trava** que impede push direto na `main`. Não pule esta linha.
5. `git config pull.rebase false` diz ao Git como juntar as novidades no `git pull`. Sem isso, o `git pull origin main` pode parar com o erro "divergent branches".

Se você for mexer nas rotas ou nos dados (pasta `backend/`), instale também as bibliotecas do Python:

```bash
cd backend
python -m pip install -r requirements.txt
cd ..
```

Para usar a API de rotas no seu computador, crie um arquivo chamado `.env.local` na raiz do projeto com esta linha:

```
VITE_ROUTE_API_URL=http://localhost:8000
```

O `.env.local` é pessoal: cada um cria o seu, e ele **nunca** vai para o GitHub.

> 💡 **Dica:** ligue o salvamento automático do VS Code em *File → Auto Save*. Muitos "erros misteriosos" são só arquivos que não foram salvos.

---

## 3. Rodar o projeto

### O site

Na raiz do projeto:

```bash
npm run dev
```

Abra o endereço que aparecer (normalmente `http://localhost:5173`). Para desligar, aperte `Ctrl + C` no terminal.

### A API de rotas (opcional)

O site funciona sem ela. Sem API, o painel de rotas usa **rotas de teste** e avisa na tela. Para usar o cálculo de verdade, abra **outro** terminal:

```bash
cd backend
python -m uvicorn api:app --reload
```

A API e o site precisam ficar ligados ao mesmo tempo, cada um no seu terminal. O Vite só lê o `.env.local` quando liga, então reinicie o `npm run dev` se tiver acabado de criar esse arquivo.

A API usa sozinha o relevo real que já vem no projeto (`backend/dados/elevacao_m.npy`). Se aparecer o aviso **"Terreno SINTÉTICO"** no site, veja em [Deu problema?](#5-deu-problema).

> No Windows, use sempre `python -m uvicorn` e `python -m pip`, e não só `uvicorn` ou `pip`. A pasta de programas do Python costuma não estar no PATH.

---

## 4. O ciclo de trabalho

Toda tarefa, grande ou pequena, segue estes 5 passos:

```
 1. ANTES            2. PROGRAMAR        3. CONFERIR          4. ENVIAR              5. DEPOIS
 main atualizada  →  na sua branch    →  build, lint e     →  push + Pull       →  merge, apagar
 + branch nova       (salve sempre)      testes passando      Request + prévia      branch, pull
```

### Passo 1 — Antes de escrever qualquer código

```bash
git checkout main
git pull
git checkout -b nome-da-tarefa
```

1. `git checkout main` volta para a branch principal.
2. `git pull` traz as novidades que os outros já publicaram.
3. `git checkout -b nome-da-tarefa` cria a **sua** branch e já entra nela.

**Como dar nome à branch:** letras minúsculas e hífens, começando pela área e dizendo o que vai ser feito:

| Área | Exemplos |
|---|---|
| Site / interface | `front-busca-coordenadas`, `front-perfil-da-rota` |
| Dados | `dados-radiacao`, `dados-vento-direcao` |
| Back-end / rotas | `back-suavizar-rotas` |
| Design | `design-logo`, `design-cores-paineis` |
| Documentação | `docs-guia`, `docs-apresentacao` |

Antes de começar, **avise no grupo** se a tarefa mexe nos arquivos "disputados": `src/App.jsx` e `src/config/mapConfig.js`.

### Passo 2 — Programar

- Confira de vez em quando em qual branch você está. Ela aparece no canto inferior esquerdo do VS Code, ou com `git branch` (a atual tem `*`).
- Salve sempre (`Ctrl + S`, ou Auto Save ligado).
- Teste no navegador com o `npm run dev` ligado. O Vite atualiza a página sozinho a cada arquivo salvo.
- Prefira **criar arquivos novos** a editar os grandes. Um componente novo em `src/components/` dá menos conflito que mexer muito no `App.jsx`.
- Pode fazer vários commits no meio do caminho. É bom ter "pontos de salvamento":

  ```bash
  git add .
  git commit -m "o que você fez, em poucas palavras"
  ```

**A tarefa está demorando dias?** Traga as novidades da `main` para a sua branch de vez em quando, para não ficar muito para trás:

```bash
git pull origin main
```

Se aparecer `CONFLICT`, veja [Deu problema?](#5-deu-problema).

### Passo 3 — Conferir antes de enviar

Rode estes comandos na raiz do projeto:

```bash
npm run build
npm run lint
```

E, se você mexeu na pasta `backend/`:

```bash
cd backend
python -m pytest
cd ..
```

| Comando | Resultado esperado |
|---|---|
| `npm run build` | Termina com `built in …`. O aviso amarelo de "chunks larger than 500 kB" é normal. |
| `npm run lint` | `Found 0 warnings and 0 errors.` |
| `python -m pytest` | Todos os testes com `passed`, nenhum `failed`. |

**Se algum falhar, não envie ainda.** Leia a mensagem: ela diz o arquivo e a linha do problema. Se travar, peça ajuda no grupo.

Depois, confira o que vai ser enviado:

```bash
git status
```

Na lista **não pode** aparecer: `node_modules/`, `dist/`, `.env.local`, `__pycache__/`, nem arquivos de dados enormes (como o MOLA de 2 GB). Se aparecer algo que você não reconhece, pergunte antes de seguir.

### Passo 4 — Enviar e abrir o Pull Request

```bash
git add .
git commit -m "o que a tarefa faz, em poucas palavras"
git push -u origin nome-da-tarefa
```

O `-u origin nome-da-tarefa` só é necessário no **primeiro** push da branch. Nos seguintes, basta `git push`.

> Se aparecer **"Push direto na main bloqueado"**, a trava funcionou: você estava na `main` sem querer. Veja [Deu problema?](#5-deu-problema).

Depois, no GitHub:

1. Abra o repositório. Vai aparecer uma faixa amarela com o botão **"Compare & pull request"**. Clique nele.
2. Confira se está **`base: main` ← `compare: nome-da-tarefa`**.
3. Escreva na descrição **o que mudou e como testar**. Exemplo: "Adiciona a busca por coordenadas na barra superior. Para testar: digite 40.3, 202.3 e aperte Enter."
4. Clique em **"Create pull request"**.
5. Em um ou dois minutos, o Netlify comenta no PR com o link do **Deploy Preview**. Abra e teste a sua mudança ali, de preferência também no celular.
6. Avise no grupo que o PR está pronto para revisão.

### Passo 5 — Depois do merge

Quem revisa testa o Deploy Preview e, estando tudo certo, clica em **"Merge pull request"**. A partir daí:

- O **Netlify** publica o site oficial em um ou dois minutos.
- O **Render** atualiza a API, se algo no `backend/` mudou.
- A branch é apagada do GitHub (manualmente pelo botão **"Delete branch"** do PR, ou sozinha, se a opção automática estiver ligada no repositório).

No seu computador, volte para a `main` atualizada e apague a branch velha:

```bash
git checkout main
git pull
git branch -d nome-da-tarefa
```

Pronto. Para a próxima tarefa, comece de novo pelo [Passo 1](#passo-1--antes-de-escrever-qualquer-código).

### Resumo de bolso

> 1. `git checkout main` → `git pull` → `git checkout -b nome-da-tarefa`
> 2. Programe, salve, teste no navegador.
> 3. `npm run build` + `npm run lint` (+ `python -m pytest` se mexeu no `backend/`).
> 4. `git add .` → `git commit -m "..."` → `git push -u origin nome-da-tarefa` → abrir o PR.
> 5. Depois do merge: `git checkout main` → `git pull` → `git branch -d nome-da-tarefa`.

---

## 5. Deu problema?

**A regra geral: não entre em pânico e não apague nada.** Quase tudo no Git tem volta. Na dúvida, mande no grupo um print do terminal.

### "Push direto na main bloqueado"

A trava funcionou: você fez commits estando na `main`. Leve esses commits para uma branch nova:

```bash
git checkout -b nome-da-tarefa
git push -u origin nome-da-tarefa
```

O primeiro comando cria a branch **com os seus commits dentro**. Depois, deixe a sua `main` igual à do GitHub:

```bash
git checkout main
git reset --hard origin/main
```

⚠️ Só rode o `reset --hard` **depois** de criar a branch. Antes disso, ele apagaria os seus commits.

### Comecei a programar e esqueci de criar a branch (ainda não fiz commit)

Sem problema. Crie a branch agora: as mudanças não salvas vão junto com você.

```bash
git checkout -b nome-da-tarefa
```

### Apareceu "CONFLICT" no `git pull origin main`

Alguém mudou as mesmas linhas que você. No VS Code, os arquivos com conflito aparecem marcados. Em cada trecho marcado, escolha **"Accept Current"** (a sua versão), **"Accept Incoming"** (a versão da `main`) ou **"Accept Both"**. Depois:

```bash
git add .
git commit -m "Resolve conflito com a main"
```

Se não tiver certeza de qual versão manter, **pare e chame quem mexeu no mesmo arquivo**. Para desistir e voltar como estava antes do `pull`:

```bash
git merge --abort
```

### O site abriu uma tela branca ou com mensagem de erro

O `ErrorBoundary` do site mostra a mensagem do erro na tela. Leia o que ela diz, ou aperte `F12` e abra a aba **Console**: normalmente ela mostra o arquivo e a linha. O erro mais comum é um arquivo salvo pela metade ou um nome errado num `import`.

### Quero desfazer as mudanças de um arquivo

Para voltar o arquivo ao último commit:

```bash
git restore caminho/do/arquivo
```

Para desfazer **tudo** que ainda não foi commitado (cuidado: isso não tem volta):

```bash
git restore .
```

### Um subfiltro mostra "sem dados", mas o dado existe

Quase sempre o `id` está escrito diferente em algum lugar. Ele precisa ser **idêntico** no `mapConfig.js` e no `manifest.json` ou no `regional.json`. Veja [Como as peças conversam](#7-como-as-peças-conversam).

### O site mostra "Terreno SINTÉTICO" nas rotas

A API não achou o arquivo `backend/dados/elevacao_m.npy`. Confira se ele existe na pasta. Se existir, desligue a API (`Ctrl + C`) e ligue de novo.

### `uvicorn` ou `pip` "não é reconhecido"

Use `python -m uvicorn …` e `python -m pip …`.

### Erro `Attribute "app" not found`

O arquivo `api.py` não foi salvo. Aperte `Ctrl + S` e ligue a API de novo.

### Alguém fez push na `main` e o site oficial quebrou

1. **Na hora:** no painel do Netlify, vá em **Deploys**, clique no último deploy que funcionava e em **"Publish deploy"**. O site volta à versão boa em segundos.
2. **Com calma:** desfaça o commit problemático numa branch, por PR:

   ```bash
   git checkout main
   git pull
   git checkout -b desfaz-erro
   git log --oneline
   git revert CODIGO-DO-COMMIT
   git push -u origin desfaz-erro
   ```

   O `git log --oneline` mostra os commits com um código curto, como `1d04913`. Use esse código no `git revert`. O `revert` cria um commit novo que anula o antigo, sem apagar o histórico.

### A API publicada demora ~50 segundos para responder

É normal: o plano gratuito do Render "dorme" quando ninguém usa. Antes de apresentar, abra `https://ares-mars.onrender.com/status` para acordar a API.

---

## 6. Mapa do projeto

### O que é o site

O ARES tem duas telas:

1. **Globo 3D:** Marte inteiro, com as luas e o Sol. O botão **Descer** faz a animação de aproximação até a área de estudo.
2. **Mapa 2D:** a área de estudo (pontos AP, na fronteira Arcadia/Amazonis), com:
   - **Painel esquerdo:** filtros científicos (pastas com subfiltros).
   - **Painel direito:** inspeção do ponto clicado.
   - **Painel inferior:** planejamento de rotas com o algoritmo A*.

| Parte | Tecnologia |
|---|---|
| Interface | React + Vite |
| Estilo | Tailwind CSS 4 |
| Globo 3D | three.js |
| Mapa 2D | Leaflet (via react-leaflet) |
| Rotas e dados (back-end) | Python: FastAPI, numpy, rasterio |
| Publicação | Netlify (site) e Render (API) |

### As pastas

```
ares-mars/
├── .githooks/               A trava que impede push direto na main
├── backend/                 Rotas (API) e preparação dos dados, em Python
│   └── dados/               Dados recortados que vão para o GitHub (relevo, SWIM, TES, USGS, rochas)
├── public/                  Arquivos servidos direto, sem processamento
│   └── data/
│       ├── layers/          Camadas dos filtros: *.png, *.bin e manifest.json
│       └── regional.json    Valores regionais (um número para a área toda)
├── src/                     Todo o código do site
│   ├── api/                 Dados fixos usados pelo globo
│   ├── assets/              Texturas e imagens
│   ├── components/          Pedaços reutilizáveis da interface
│   ├── config/              Configurações centrais (área, filtros, pontos, rotas)
│   ├── hooks/               Lógica reutilizável do React
│   ├── mock/                Dados de TESTE (não são científicos)
│   ├── services/            Leitura das camadas e comunicação com a API
│   ├── views/               As duas telas: globo e mapa
│   ├── App.jsx              O "esqueleto" que junta tudo
│   ├── index.css            Estilos globais
│   └── main.jsx             Ponto de entrada do React
├── .env.local               (cada um cria o seu) Endereço da API; não vai para o GitHub
├── .gitattributes           Garante que a trava funcione no Windows
├── index.html               Página base
└── package.json             Lista de dependências e comandos
```

### Arquivo por arquivo: o site (`src/`)

| Arquivo | O que faz | Mexer? |
|---|---|---|
| `main.jsx` | Liga o React ao `index.html` e carrega o `App`. | Quase nunca |
| `App.jsx` | O esqueleto: troca entre globo e mapa, os painéis e os estados compartilhados (camada ligada, ponto clicado, rota). | ⚠️ Avise o grupo antes |
| `index.css` | Estilos globais: fundo, marcadores do mapa, barra de rolagem. | Sim (design) |
| `App.css` | Sobra do modelo do Vite, praticamente vazio. | Não |
| `views/GlobeView.jsx` | O globo 3D (three.js). As configurações da câmera ficam no topo do arquivo. | Sim (front) |
| `views/MapView.jsx` | O mapa 2D (Leaflet). Desenha, de baixo para cima: relevo, camada científica, contorno da área, rotas e marcadores. | Sim (front) |
| `components/FilterList.jsx` | A lista de filtros (pastas e subfiltros, um ligado por vez). | Sim (front) |
| `components/InspectionPanel.jsx` | O painel direito: os valores de cada camada no ponto clicado e a fonte do dado. | Sim (front) |
| `components/RoutePanel.jsx` | O painel de rotas: origem, destino, cálculo e os cartões de cada modo. | Sim (front) |
| `components/MapLegend.jsx` | A legenda da camada ligada (barra de cores, categorias, limite de detecção). | Sim (front) |
| `components/MapNotice.jsx` | O cartão de valor regional e o aviso "em preparação". | Sim (front) |
| `components/ErrorBoundary.jsx` | Mostra o erro na tela em vez de deixar tudo preto. | Raramente |
| `config/mapConfig.js` | ⭐ A configuração central: área de estudo, locais candidatos, filtros e subfiltros, modos de rota. | ⚠️ Avise o grupo antes |
| `hooks/useLayerManifest.js` | Lê o `manifest.json` e o `regional.json` e junta os dois. | Raramente |
| `services/layerValues.js` | Lê o valor de uma camada num ponto e formata para a tela. | Raramente |
| `services/routeApi.js` | O único lugar que conversa com a API de rotas. | Raramente |
| `mock/points.js`, `mock/routes.js` | Pontos e rotas de **teste**, sempre marcados como teste. | Substituir por dados reais |
| `api/regions.json` | Regiões e pontos desenhados no globo. | Sim |

### Arquivo por arquivo: o back-end (`backend/`)

| Arquivo | O que faz |
|---|---|
| `api.py` | A API de rotas (FastAPI): `GET /status` e `POST /rota`. Prepara o terreno uma vez ao ligar; depois, cada rota leva menos de 1 segundo. |
| `main.py` | Programa de linha de comando do Saulo: lê o MOLA, calcula o terreno e as rotas e gera mapas e relatórios. Tem o modo interativo (`--interativo`). |
| `route_comparison.py` | Roda os três modos de rota e calcula as métricas. |
| `astar.py` | O algoritmo A* na grade (8 direções, sem cortar quinas). |
| `terrain_analyzer.py` | Declividade, orientação e rugosidade (TRI). |
| `obstacle_detection.py` | Obstáculos (declividade > 15°, rugosidade extrema, depressões fechadas) e folga até o obstáculo mais próximo. |
| `dem_processor.py` | Grade, coordenadas e leitura do MOLA. Define os pontos AP. |
| `data_sources.py` | Catálogo das fontes de dados e registro de procedência. |
| `export_layers.py` | Gera as camadas dos filtros para o site (`public/data/layers/`): relevo, SWIM, TES e geologia. |
| `figure_to_data.py` | Converte **figuras** de mapas globais (imagem + barra de cores) em valores aproximados. Usado no TES e nas rochas. |
| `clip_usgs_geology.py` | Recorta o mapa geológico global da USGS para a região do site. Roda uma vez. |
| `synthetic_fixture.py` | Terreno **artificial**, usado só se o `dados/elevacao_m.npy` não existir. |
| `visualization.py`, `interactive.py` | Mapas do matplotlib e o modo interativo do `main.py`. |
| `tests/`, `pytest.ini` | Testes automáticos (`python -m pytest`). |
| `requirements.txt` | Bibliotecas Python do back-end. |

| Pasta de dados | Conteúdo |
|---|---|
| `backend/dados/elevacao_m.npy` | Relevo real recortado (MOLA, grade de 200 m). A API usa este arquivo. |
| `backend/dados/swim/` | Mapas de compatibilidade com gelo do SWIM. |
| `backend/dados/tes/` | Figuras dos mapas minerais do TES. |
| `backend/dados/usgs/` | Recorte do mapa geológico da USGS. |
| `backend/dados/rochas/` | Figura da abundância de rochas. |
| `backend/outputs/`, `backend/data/` | Saídas do `main.py` e o MOLA baixado. **Não vão para o GitHub.** |

### Arquivos da raiz

| Arquivo | O que é | Mexer? |
|---|---|---|
| `.env.local` | Endereço da API. Cada um cria o seu. | Sim, no seu computador |
| `.githooks/pre-push` | A trava contra push direto na `main`. | Não |
| `.gitattributes` | Mantém a trava funcionando no Windows. | Não |
| `index.html` | Página base onde o React é montado. | Raramente |
| `package.json` | Dependências e comandos (`npm run dev` etc.). | Só via `npm install nome-da-biblioteca` |
| `package-lock.json` | Versões exatas instaladas. | **Nunca à mão** |
| `vite.config.js`, `postcss.config.js`, `tailwind.config.js` | Configurações do Vite e do Tailwind. | Não |
| `.oxlintrc.json` | Regras do `npm run lint`. | Não |
| `.gitignore` | O que o Git ignora (`node_modules`, `dist`, `.env.local`…). | Raramente |
| `README.md` | Apresentação do projeto. | Sim |
| `KANBAM.md` | Quadro de tarefas. | Sim |
| `RETROSPECTIVA_ARES.md` | História do projeto, dados e decisões. | Sim |
| `GUIA_DO_PROJETO.md` | Este guia. | Sim, quando o jeito de trabalhar mudar |

---

## 7. Como as peças conversam

### Filtros e camadas

```
backend/dados/           export_layers.py         public/data/layers/          site
(arquivos brutos)   ──►  (roda no computador) ──►  *.png  *.bin           ──►  mapa, legenda
                         só quando os dados        manifest.json               e painel
                         mudam
                                                   public/data/regional.json   cartões
                                                   (editado À MÃO)             regionais
```

O trabalho pesado (ler o MOLA, recortar, calcular) é feito **uma vez**, no computador. O site só lê arquivos prontos e pequenos, por isso carrega rápido.

Cada camada vira três coisas:

- **`.png`:** a imagem colorida desenhada no mapa.
- **`.bin`:** os números de verdade, que o painel lê quando você clica num ponto.
- **Uma entrada no `manifest.json`:** nome, legenda, fonte e confiança.

**A regra de ouro dos dados:** o `id` de cada subfiltro tem que ser **exatamente igual** nos dois lados:

```
src/config/mapConfig.js           public/data/layers/manifest.json
id: 'swim-ci'               ⟷     "id": "swim-ci"          (camadas com imagem)
                                  ou
                                  public/data/regional.json
                                  "id": "mcd-temperatura"  (valores regionais)
```

Se os ids baterem, a etiqueta "sem dados" some sozinha e a camada aparece.

### Rotas

```
RoutePanel.jsx ──(origem, destino)──► App.jsx ──► routeApi.js
                                                     │
                       com .env.local ◄──────────────┴──────────► sem .env.local
                             │                                         │
                  POST /rota na API (backend/)                 mock/routes.js
                  A* do Saulo, 3 modos, < 1 s                  (rotas de teste)
                             │                                         │
                             └──────────► mesmo formato ◄──────────────┘
                                               │
                              App.jsx ──► MapView.jsx (linhas) + RoutePanel.jsx (cartões)
```

A API e as rotas de teste devolvem **o mesmo formato**. Trocar uma pela outra é só criar ou apagar o `.env.local`.

### O formato entre o site e a API

```json
// O site manda (POST /rota):
{ "origem":  { "lat": 39.8,  "lon": 202.1 },
  "destino": { "lat": 40.75, "lon": 201.3 } }

// A API devolve os TRÊS modos de uma vez:
{ "sintetico": false,
  "reta_km": 66.9,
  "rotas": [
    { "modo": "menor_distancia", "encontrada": true,
      "pontos": [[39.8, 202.1], [39.81, 202.09]],
      "distancia_km": 71.4, "declividade_max": 1.2, "declividade_media": 0.2,
      "folga_min_m": 39300, "ganho_m": 40, "perda_m": 35, "motivo": null },
    { "modo": "maior_seguranca", "...": "..." },
    { "modo": "multicriterio",   "...": "..." }
  ] }
```

Os pontos vão em `[latitude, longitude]`, com longitude **sempre em graus leste, de 0 a 360**. Se nenhuma rota for encontrada (ponto fora da área, por exemplo), a API responde com erro 422 e o motivo, que o site mostra ao usuário.

---

## 8. Quem mexe em quê

| Pessoa / área | Onde trabalha principalmente |
|---|---|
| **Front-end** (Guilherme) | `src/App.jsx`, `src/components/`, `src/views/`, `src/services/`, `src/index.css` |
| **Back-end / rotas** (Saulo) | `backend/`, `src/config/mapConfig.js` (filtros e pontos) |
| **Dados** (Willian) | `backend/dados/`, `public/data/`, `src/config/mapConfig.js` |
| **Design** (Victor) | `src/index.css`, cores no `mapConfig.js`, `src/assets/` |
| **Matemática e física** (Anthonelo) | Lógica das rotas em `backend/` (pesos, declividade), unidades e fontes no `mapConfig.js` |

Quem faz o **merge** dos Pull Requests é combinado no grupo. Normalmente é o Guilherme, depois de testar o Deploy Preview.

---

## 9. Receitas rápidas

Todas as receitas começam pelo [Passo 1 do ciclo de trabalho](#passo-1--antes-de-escrever-qualquer-código), com uma branch nova, e terminam com um Pull Request.

### Adicionar um subfiltro

No `src/config/mapConfig.js`, dentro da pasta certa em `FILTERS`, acrescente uma linha:

```js
{ id: 'meu-subfiltro', name: 'Nome que aparece', unit: 'K', source: 'Instrumento' },
```

Para agrupar vários subfiltros sob um subtítulo, use `group` (itens do mesmo grupo ficam em sequência na lista):

```js
{ id: 'olivina', group: 'Composição mineralógica', name: 'Olivina', source: 'TES' },
```

Enquanto não houver dado com o mesmo `id`, o subfiltro mostra "sem dados". Isso é esperado.

### Criar uma pasta de filtros nova

No `mapConfig.js`, acrescente um bloco em `FILTERS`:

```js
{
  id: 'nova-pasta', name: 'Nome da pasta', icon: Wind, color: '#a855f7',
  layers: [ /* subfiltros */ ],
},
```

O ícone vem de [lucide.dev/icons](https://lucide.dev/icons) e precisa ser importado na primeira linha do arquivo.

### Preencher ou mudar um valor regional

Valores regionais são um número só para a área toda, como os do Mars Climate Database. Ficam em `public/data/regional.json`, que **pode ser editado à mão**. Exemplo de um item:

```json
{
  "id": "raios-cosmicos",
  "value": 230,
  "unit": "mSv/ano",
  "decimals": 0,
  "seasons": [],
  "note": "Texto curto que aparece no cartão.",
  "source": {
    "instrument": "Nome do instrumento ou modelo",
    "mission": "Missão",
    "date": "Período da medição",
    "resolution_m": null,
    "confidence": "Se é medição, modelo ou estimativa, e de onde."
  }
}
```

Os valores acima são só um exemplo do formato. Cuidados que evitam quebrar o arquivo inteiro:

- **Número sem aspas:** `"value": 29.3` ✅, `"value": "29.3"` ❌.
- **Ponto decimal, não vírgula:** `29.3` ✅, `29,3` ❌.
- **Sem vírgula depois do último item** de uma lista ou bloco.
- Para "ainda sem dado", use `null` (sem aspas). O site mostra "em preparação".
- Para uma estimativa em texto, use o campo opcional `"display"` (ex.: `"display": "Intermediária"`).

Se o VS Code sublinhar algo de vermelho, o JSON está inválido. Corrija antes de salvar.

### Refazer as camadas dos filtros

Só é preciso quando os dados mudam (dado novo do SWIM, do TES etc.). As camadas usam as grades que o `main.py` gera na pasta `backend/outputs/`, que não vai para o GitHub. Então, na primeira vez em cada computador:

```bash
cd backend
python main.py --mola /vsicurl/https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif
```

O `/vsicurl/` lê do servidor da USGS só o pedaço da área de estudo, sem baixar os 2 GB. Depois, sempre que precisar:

```bash
python export_layers.py
```

> ⚠️ **Não edite o `public/data/layers/manifest.json` à mão.** O `export_layers.py` reescreve o arquivo inteiro toda vez que roda, e o que você mudou à mão some. Para mudar algo de uma camada (cor, opacidade, texto da fonte), mude no `export_layers.py` e rode de novo.

Rodar o `export_layers.py` regrava também as imagens antigas, que podem aparecer como "modificadas" no `git status` mesmo sem mudança visível. Se quiser um commit limpo, desfaça as que você não pretendia mudar com `git restore caminho/da/imagem.png`.

### Converter uma figura de mapa em dados

Quando a fonte só existe como imagem (mapa global com barra de cores), o `figure_to_data.py` estima os valores na área de estudo:

```bash
cd backend
python figure_to_data.py caminho/da/figura.png --vmin 0 --vmax 1
```

Troque `--vmin` e `--vmax` pelos valores das pontas da barra de cores da figura. O resultado é uma **estimativa** e deve ser apresentado como tal.

### Publicar uma camada científica nova

1. Coloque o dado bruto em `backend/dados/`.
2. Acrescente a leitura dele no `export_layers.py`, seguindo o modelo das camadas do SWIM ou do TES.
3. Rode `python export_layers.py`.
4. Confira se o `id` gerado é igual ao do subfiltro no `mapConfig.js`.

Os campos de `source` (instrumento, data, resolução e confiança) aparecem no painel de inspeção. Campos vazios aparecem como "pendente".

### Adicionar ou mudar um local candidato

No `mapConfig.js`, edite `CANDIDATE_SITES` (latitude °N, longitude °E de 0 a 360). Os mesmos pontos estão no `backend/dem_processor.py` (`POIS`). **Mantenha os dois iguais.**

### Mudar a área de estudo

No `mapConfig.js`, edite `STUDY_AREA.bounds`: `[[sul, oeste], [norte, leste]]`. A API calcula a área dela a partir dos pontos AP, então **avise o Saulo**: os dois lados precisam continuar iguais.

### Mudar as cores das rotas

No `mapConfig.js`, edite `ROUTE_MODES` (`color` e `dash`, o tracejado).

### Instalar uma biblioteca nova

- **Site:** na raiz, `npm install nome-da-biblioteca`. O `package.json` e o `package-lock.json` mudam sozinhos.
- **Python:** acrescente a biblioteca no `backend/requirements.txt` e rode `python -m pip install -r requirements.txt`.

Avise no grupo: depois do `git pull`, todo mundo precisa rodar `npm install` (ou o `pip install`) de novo.

---

## 10. Convenções do projeto

- **Coordenadas:** latitude em °N; longitude em **graus leste, de 0 a 360** (nunca "graus oeste"). Vale para o site, a API e o código de rotas.
- **Nomes de componentes** começam com maiúscula (`FilterList.jsx`, não `filterList.jsx`). O Windows não diferencia, mas o servidor de publicação sim, e o site quebra lá.
- **Dados de teste** sempre identificados (`mock: true`, "Rota de TESTE", "Terreno SINTÉTICO"). Nunca coloque valores inventados como se fossem reais.
- **Estimativas** sempre marcadas como estimativa no campo de confiança (como os dados do TES e das rochas).
- **Dados de outro lugar de Marte:** nunca apresente como medição da área de estudo. Indique quando for modelo, estimativa ou medição feita em outro local.
- **Área de estudo:** os pontos AP ficam na fronteira entre Arcadia e Amazonis Planitia. Na apresentação, descreva assim.
- **Arquivos grandes de dados brutos** (MOLA, shapefile global da USGS) **não vão para o GitHub.** Só os recortes pequenos.

---

## 11. Pendências conhecidas

| Pendência | Onde |
|---|---|
| Radiação (único subfiltro sem dado): valor do RAD/Curiosity e referência | `public/data/regional.json` |
| Abundância de rochas em %: fonte original e barra de cores da figura | `public/data/regional.json` |
| Direção do vento | `public/data/regional.json` |
| Substituir os pontos de teste | `src/mock/points.js` |
| Coordenadas do globo diferentes das do mapa 2D | `src/api/regions.json` |
| Abas explicativas para cada subfiltro | `mapConfig.js` (campo `info`) + painel de inspeção |