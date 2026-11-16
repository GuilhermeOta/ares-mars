# ARES — Guia do Projeto

Este guia mostra **como trabalhar no ARES sem quebrar nada**, quase tudo **por cliques**, sem precisar decorar comandos.

> ## ⭐ A única regra que não pode ser quebrada
> **Nunca mexa direto na `main`.** A `main` é o site oficial.
> Toda mudança é feita numa **branch** (uma cópia sua) e entra no site por um **Pull Request** (um pedido de aprovação).
> O resto deste guia só explica como fazer isso.

---

## Por onde começar

| Eu quero… | Vá para |
|---|---|
| Entender as palavras (branch, commit, PR…) | [1. Palavras do dia a dia](#1-palavras-do-dia-a-dia) |
| Mudar **um arquivo só** (um texto, um número, uma cor) | [Jeito 1: pelo site do GitHub](#jeito-1-pelo-site-do-github-mais-fácil) |
| Mudar **vários arquivos**, sem instalar nada | [Jeito 2: VS Code no navegador](#jeito-2-vs-code-no-navegador-githubdev) |
| **Programar** de verdade e ver o site rodando | [Jeito 3: VS Code no computador](#jeito-3-vs-code-no-computador) |
| Resolver um problema | [4. Deu problema?](#4-deu-problema) |
| Saber onde fica cada arquivo | [5. Mapa do projeto](#5-mapa-do-projeto) |
| Fazer algo específico (filtro, dado, cor…) | [8. Receitas rápidas](#8-receitas-rápidas) |

---

## 1. Palavras do dia a dia

| Palavra | O que significa |
|---|---|
| **Repositório** | A pasta do projeto no GitHub, com todo o histórico: `GuilhermeOta/ares-mars`. |
| **`main`** | A versão oficial. **É o que aparece no site publicado.** |
| **Branch** | Uma cópia sua do projeto, onde você mexe sem afetar a `main`. |
| **Commit** | Um "ponto de salvamento" com uma frase dizendo o que mudou. |
| **Push / Publish** | Enviar os seus commits do computador para o GitHub. |
| **Pull / Sync** | Trazer do GitHub o que os outros já enviaram. |
| **Pull Request (PR)** | O pedido para juntar a sua branch na `main`. É ali que a mudança é testada e aprovada. |
| **Merge** | Aprovar o PR: a mudança entra na `main` e vai para o site. |
| **Deploy Preview** | Uma cópia de teste do site, criada pelo Netlify para cada PR, num endereço próprio. |

---

## 2. Escolha o seu jeito de trabalhar

| | Jeito 1: site do GitHub | Jeito 2: github.dev | Jeito 3: VS Code no computador |
|---|---|---|---|
| **Instalar algo?** | Não | Não | Sim (uma vez) |
| **Bom para** | Um arquivo: um texto, um valor, uma cor | Vários arquivos de uma vez | Programar e testar o site rodando |
| **Vê o resultado** | No Deploy Preview (~2 min) | No Deploy Preview (~2 min) | Na hora, no navegador |
| **Para quem** | Todos | Todos | Quem programa |

Os três jeitos terminam do mesmo modo: num **Pull Request** com **Deploy Preview** ([seção 3](#3-pull-request-o-mesmo-final-para-todo-mundo)).

### Jeito 1: pelo site do GitHub (mais fácil)

Para mudar **um arquivo só**.

1. Abra o repositório no GitHub e clique no arquivo que quer mudar (ex.: `public/data/regional.json`).
2. Clique no **lápis ✏️** ("Edit this file"), no canto direito, acima do conteúdo.
3. Faça a mudança.
4. Clique no botão verde **"Commit changes…"**.
5. Na janela que abre:
   - Escreva uma frase dizendo o que mudou (ex.: "Adiciona o valor da radiação").
   - Marque **"Create a new branch for this commit and start a pull request"**. ⚠️ **Não escolha** "Commit directly to the main branch".
   - Dê um nome à branch (veja [como dar nome](#como-dar-nome-à-branch)).
6. Clique em **"Propose changes"**.
7. Na tela seguinte, clique em **"Create pull request"**.

Pronto: siga para a [seção 3](#3-pull-request-o-mesmo-final-para-todo-mundo).

### Jeito 2: VS Code no navegador (github.dev)

Para mudar **vários arquivos** sem instalar nada.

1. Abra o repositório no GitHub e aperte a tecla **`.`** (ponto). Abre um VS Code dentro do navegador.
2. **Antes de mexer em qualquer coisa,** clique no nome da branch (`main`) no **canto inferior esquerdo** → **"Create new branch…"** → digite o nome → Enter. O canto inferior esquerdo passa a mostrar o nome novo.
3. Edite os arquivos normalmente. Os arquivos ficam na barra da esquerda, no primeiro ícone (Explorer).
4. Clique no ícone **Source Control** na barra da esquerda (o terceiro ícone, um galho com três bolinhas).
5. Escreva uma frase dizendo o que mudou e clique em **"Commit & Push"**.
6. Volte para a página do repositório no GitHub. Vai aparecer uma faixa amarela com o botão **"Compare & pull request"**. Clique nele e depois em **"Create pull request"**.

> Confira no canto inferior esquerdo, **antes do passo 5**, que a branch **não** é a `main`. O "Commit & Push" envia para a branch que estiver ali.

Pronto: siga para a [seção 3](#3-pull-request-o-mesmo-final-para-todo-mundo).

### Jeito 3: VS Code no computador

Para **programar** e ver o site rodando enquanto mexe.

#### Primeira vez (só uma vez por computador)

Precisa ter instalado: **[Git](https://git-scm.com)**, **[Node.js](https://nodejs.org)** e **[VS Code](https://code.visualstudio.com)**. Se for mexer no `backend/`, também o **[Python](https://www.python.org)**.

1. Abra o VS Code. Na tela de boas-vindas, clique em **"Clone Git Repository…"**. Se a tela não aparecer, abra o ícone **Source Control** na barra da esquerda e clique em **"Clone Repository"**.
2. Cole o endereço `https://github.com/GuilhermeOta/ares-mars.git` e aperte Enter.
3. Escolha a pasta onde o projeto vai ficar. Se o VS Code pedir para entrar na conta do GitHub, aceite: o repositório é privado.
4. Quando perguntar se quer abrir o projeto, clique em **"Open"**.
5. Abra o terminal pelo menu **Terminal → New Terminal** e digite uma vez:

   ```
   npm install
   ```

   Isso baixa as bibliotecas do site. É o único comando obrigatório do guia.

6. **Opcional, mas recomendado:** no mesmo terminal, ligue a **trava** que impede envio direto para a `main` e a configuração do `pull`:

   ```
   git config core.hooksPath .githooks
   git config pull.rebase false
   ```

7. **Para mostrar os botões que ligam o site:** no **Explorer** (o primeiro ícone da barra da esquerda), procure a seção **"NPM SCRIPTS"** lá embaixo. Se ela não aparecer, clique nos **"…"** no topo do Explorer e marque **"NPM Scripts"**.

#### O dia a dia, em 5 passos

**Onde ficam os botões:**

- **Canto inferior esquerdo:** o **nome da branch** em que você está. Ao lado, as **setas circulares** (sincronizar).
- **Barra da esquerda, terceiro ícone (galho com três bolinhas):** **Source Control**, ou o atalho `Ctrl + Shift + G`. É onde se faz o commit e o envio.
- **Explorer → NPM SCRIPTS:** os botões ▶ para ligar o site (`dev`) e procurar erros (`lint`).

**Passo 1 — Antes de mexer**
1. Confira se o canto inferior esquerdo mostra `main`. Se não mostrar, clique nele e escolha `main`.
2. Clique nas **setas circulares** ao lado, para trazer as novidades do GitHub.
3. Clique no nome `main` → **"Create new branch…"** → digite o nome da branch → Enter.

**Passo 2 — Programar**
1. Em **NPM SCRIPTS**, clique no **▶ ao lado de `dev`**. Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).
2. Mexa nos arquivos e salve (`Ctrl + S`). O navegador atualiza sozinho.

> 💡 Ligue o salvamento automático em **File → Auto Save**. Muitos "erros misteriosos" são só arquivos não salvos.

**Passo 3 — Salvar no Git (commit)**
1. Abra o **Source Control**. Ele lista os arquivos que você mudou.
2. Escreva uma frase dizendo o que fez (ex.: "Adiciona busca por coordenadas").
3. Clique em **Commit**. Se perguntar se quer incluir todas as mudanças, responda **Yes** (ou **Always**, para não perguntar mais).

Pode fazer vários commits no meio do caminho. Cada um é um ponto de salvamento.

**Passo 4 — Enviar**
1. Depois do primeiro commit, o botão azul vira **"Publish Branch"**. Clique nele. Nos commits seguintes, o botão se chama **"Sync Changes"**.
2. No GitHub, clique em **"Compare & pull request"** → **"Create pull request"**.
3. Siga para a [seção 3](#3-pull-request-o-mesmo-final-para-todo-mundo).

**Passo 5 — Depois do merge**
1. Clique no nome da branch no canto inferior esquerdo e escolha **`main`**.
2. Clique nas **setas circulares** para trazer a versão nova.
3. Para apagar a branch velha do computador: no **Source Control**, clique nos **"…"** → **Branch** → **Delete Branch…** e escolha a branch.

Para a próxima tarefa, volte ao Passo 1.

#### Como dar nome à branch

Letras minúsculas e hífens, sem espaços nem acentos. Comece pela área e diga o que vai fazer:

| Área | Exemplos |
|---|---|
| Site / interface | `front-busca-coordenadas`, `front-perfil-da-rota` |
| Dados | `dados-radiacao`, `dados-vento-direcao` |
| Back-end / rotas | `back-suavizar-rotas` |
| Design | `design-logo`, `design-cores` |
| Textos e documentação | `docs-guia`, `docs-apresentacao` |

> ⚠️ **Antes de mexer em `src/App.jsx` ou `src/config/mapConfig.js`, avise no grupo.** São os arquivos que quase todo mundo usa, e dois mexendo ao mesmo tempo dá conflito.

---

## 3. Pull Request: o mesmo final para todo mundo

1. Depois de criar o PR, escreva na descrição **o que mudou e como testar**. Exemplo: "Adiciona o valor da radiação. Para testar: abra Condições atmosféricas → Radiação."
2. Em 1 a 2 minutos, o **Netlify** comenta no PR com o link do **Deploy Preview**. Abra e confira a sua mudança, de preferência também no celular.
3. Olhe o resultado das verificações no PR:
   - **✅ verde:** o site foi montado sem erro.
   - **❌ vermelho:** o site **não** foi montado. Abra o link "Latest deploy log" do comentário do Netlify para ver o erro, ou peça ajuda no grupo. **Não faça merge com ❌.**
4. Avise no grupo que o PR está pronto.
5. Quem revisa testa o Deploy Preview e clica em **"Merge pull request"**. Em 1 a 2 minutos, o site oficial é atualizado.
6. Depois do merge, clique em **"Delete branch"** no próprio PR.

Quem faz o merge é combinado no grupo. Normalmente é o Guilherme.

---

## 4. Deu problema?

**Regra geral: não entre em pânico e não apague nada.** Quase tudo tem volta. Na dúvida, mande um print no grupo.

### Fiz commit na `main` sem querer (VS Code no computador)

**Se ainda não enviou:**
1. Clique no nome `main` no canto inferior esquerdo → **"Create new branch…"** → dê um nome. Os seus commits vão junto para a branch nova.
2. Clique em **"Publish Branch"** e siga normalmente para o PR.
3. Para limpar a sua `main`, abra o terminal (**Terminal → New Terminal**) e rode:

   ```
   git checkout main
   git reset --hard origin/main
   ```

   ⚠️ Só faça o passo 3 **depois** do passo 1. Antes disso, ele apagaria os seus commits.

**Se a trava estiver ligada,** o VS Code mostra o erro "Push direto na main bloqueado" ao tentar enviar. É sinal de que a trava funcionou: siga os passos acima.

### Comecei a mexer e esqueci de criar a branch (ainda sem commit)

Sem problema. Clique no nome `main` → **"Create new branch…"**. As mudanças vão junto com você.

### Quero desfazer as mudanças de um arquivo

No **Source Control**, passe o mouse sobre o arquivo e clique na **seta curva ↶** ("Discard Changes"). O arquivo volta ao último commit. ⚠️ Não tem volta.

### Quero desfazer o último commit (ainda não enviado)

No **Source Control**, clique nos **"…"** → **Commit** → **Undo Last Commit**. As mudanças continuam nos arquivos, só o commit é desfeito.

### Apareceu um conflito

Alguém mudou as mesmas linhas que você. O VS Code marca os arquivos com **"!"** na seção **"Merge Changes"**. Abra cada um e, em cada trecho marcado, clique em:

- **"Accept Current Change":** fica a sua versão.
- **"Accept Incoming Change":** fica a versão da `main`.
- **"Accept Both Changes":** ficam as duas.

Depois, salve e faça o commit normalmente. **Se não tiver certeza de qual versão manter, chame quem mexeu no mesmo arquivo antes de decidir.**

### O PR mostra ❌ vermelho no Netlify

O site não foi montado, quase sempre por um erro de digitação no código. Abra o "Latest deploy log" no comentário do Netlify: perto do fim aparece o arquivo e a linha do problema. Corrija na mesma branch, faça um novo commit e envie: o Netlify tenta de novo sozinho.

### O site abriu uma tela branca ou com mensagem de erro

O site mostra a mensagem do erro na tela. Leia o que ela diz, ou aperte `F12` e abra a aba **Console**: normalmente aparece o arquivo e a linha.

### Um filtro mostra "sem dados", mas o dado existe

O `id` está escrito diferente em algum lugar. Ele precisa ser **idêntico** no `mapConfig.js` e no `manifest.json` ou no `regional.json`. Veja a [seção 6](#6-como-as-peças-conversam).

### As rotas mostram "Terreno SINTÉTICO" no meu computador

A API não achou o arquivo `backend/dados/elevacao_m.npy`. Confira se ele existe e ligue a API de novo.

### O site oficial quebrou depois de um merge

1. **Na hora:** no painel do **Netlify**, vá em **Deploys**, clique no último deploy que funcionava e em **"Publish deploy"**. O site volta em segundos.
2. **Com calma:** abra o PR que causou o problema no GitHub e clique em **"Revert"**, no fim da página. O GitHub cria um PR que desfaz a mudança, e é só fazer o merge dele.

### A API publicada demora ~50 segundos

É normal: o plano gratuito do Render "dorme" quando ninguém usa. Antes de apresentar, abra `https://ares-mars.onrender.com/status` para acordá-la.

---

## 5. Mapa do projeto

### O que é o site

Duas telas:

1. **Globo 3D:** Marte inteiro. O botão **Descer** faz a animação até a área de estudo.
2. **Mapa 2D:** a área de estudo (pontos AP, na fronteira Arcadia/Amazonis), com os **filtros** à esquerda, a **inspeção** do ponto clicado à direita e o **planejador de rotas** embaixo.

O site é feito em **React + Vite**, com **Leaflet** (mapa 2D), **three.js** (globo) e **Tailwind** (estilo). As rotas vêm de uma **API em Python**. O site fica no **Netlify** e a API, no **Render**.

### As pastas

```
ares-mars/
├── src/                     O código do site
│   ├── config/mapConfig.js  ⭐ Filtros, área de estudo, pontos AP e cores das rotas
│   ├── components/          Painéis: filtros, inspeção, rotas, legenda
│   ├── views/               As duas telas: GlobeView.jsx e MapView.jsx
│   ├── services/            Leitura das camadas e conversa com a API
│   ├── App.jsx              ⚠️ O "esqueleto" que junta tudo
│   └── index.css            Estilos globais
├── public/data/             Dados prontos que o site lê
│   ├── layers/              Imagens e valores dos filtros (+ manifest.json)
│   └── regional.json        ✏️ Valores regionais, editáveis à mão
├── backend/                 API de rotas e preparação dos dados (Python)
│   └── dados/               Dados recortados (relevo, SWIM, TES, USGS, rochas)
├── .githooks/               A trava contra envio direto para a main
└── GUIA_DO_PROJETO.md       Este guia
```

### Os arquivos que mais se mexe

| Arquivo | Para quê | Quem costuma mexer |
|---|---|---|
| `src/config/mapConfig.js` | Filtros e subfiltros, pontos AP, área de estudo, cores das rotas | Saulo (⚠️ avise antes) |
| `public/data/regional.json` | Os números regionais (clima, radiação, rochas…) | Saulo |
| `src/components/*.jsx` | Os painéis do site | Front-end |
| `src/views/*.jsx` | O globo e o mapa | Front-end |
| `src/index.css` | Cores e estilos | Design, front-end |
| `src/App.jsx` | O esqueleto do site | Front-end (⚠️ avise antes) |
| `backend/*.py` | Rotas e preparação dos dados | Saulo, Anthony |

### Não mexa à mão

| Arquivo | Por quê |
|---|---|
| `public/data/layers/manifest.json` | É gerado pelo `backend/export_layers.py`. O que for mudado à mão some na próxima geração. |
| `package-lock.json` | É gerado pelo `npm install`. |
| `node_modules/`, `dist/` | São gerados automaticamente e nem vão para o GitHub. |
| `.githooks/`, `.gitattributes` | Fazem a trava funcionar. |

---

## 6. Como as peças conversam

### Filtros

```
backend/dados/  ──►  export_layers.py  ──►  public/data/layers/  ──►  mapa e painel
(dados brutos)       (roda no computador)   (imagens + valores)

                                            public/data/regional.json  ──►  cartões regionais
                                            (editado à mão)
```

**A regra de ouro:** o `id` de cada subfiltro precisa ser **idêntico** dos dois lados.

```
src/config/mapConfig.js           public/data/regional.json (ou layers/manifest.json)
id: 'mcd-temperatura'       ⟷     "id": "mcd-temperatura"
```

Se os ids baterem, a etiqueta "sem dados" some sozinha.

### Rotas

O painel de rotas manda origem e destino para a API (`POST /rota`), que devolve as três rotas calculadas pelo A*. Sem a API configurada, o site usa **rotas de teste** e avisa na tela.

- **No site publicado:** a API do Render, configurada no Netlify.
- **No seu computador:** crie um arquivo `.env.local` na raiz com a linha `VITE_ROUTE_API_URL=http://localhost:8000` e ligue a API num terminal, dentro da pasta `backend`, com `python -m uvicorn api:app --reload`. Instale antes as bibliotecas com `python -m pip install -r requirements.txt`. O `.env.local` é pessoal e não vai para o GitHub.

As coordenadas são sempre **latitude °N** e **longitude leste, de 0 a 360**.

---

## 7. Quem mexe em quê

| Pessoa / área | Onde trabalha | Jeito sugerido |
|---|---|---|
| **Programador geral** (Guilherme) | Todo o projeto, principalmente `src/`. Revisa e faz o merge dos Pull Requests | VS Code no computador |
| **Coordenação e back-end** (Saulo) | `backend/`, `regional.json` e filtros no `mapConfig.js` | VS Code no computador |
| **Design e apresentação** (Victor) | `src/index.css`, cores no `mapConfig.js` e `src/assets/`. Slides, junto com o Anthony (fora do repositório) | github.dev |
| **Matemática, física e apresentação** (Anthony) | Pesos e declividade em `backend/` e unidades no `mapConfig.js`. Slides, junto com o Victor (fora do repositório) | Site do GitHub ou github.dev |
---

## 8. Receitas rápidas

Toda receita começa **numa branch nova** e termina num **Pull Request**.

### Preencher ou mudar um valor regional

Arquivo: `public/data/regional.json`. Dá para fazer pelo [Jeito 1](#jeito-1-pelo-site-do-github-mais-fácil). Cada valor é um bloco assim:

```json
{
  "id": "raios-cosmicos",
  "value": 230,
  "unit": "mSv/ano",
  "decimals": 0,
  "seasons": [],
  "note": "Frase curta que aparece no cartão.",
  "source": {
    "instrument": "Instrumento ou modelo",
    "mission": "Missão",
    "date": "Período da medição",
    "resolution_m": null,
    "confidence": "Se é medição, modelo ou estimativa, e de onde."
  }
}
```

Os valores acima são só um exemplo do formato. **Cuidados que evitam quebrar o arquivo inteiro:**

- Número **sem aspas**: `"value": 29.3` ✅ — `"value": "29.3"` ❌
- **Ponto** decimal: `29.3` ✅ — `29,3` ❌
- **Sem vírgula** depois do último item de um bloco ou lista.
- Ainda sem dado? Use `null`, sem aspas. O site mostra "em preparação".
- Estimativa em texto? Use o campo opcional `"display"` (ex.: `"display": "Intermediária"`).

Se aparecer algo sublinhado de **vermelho**, o arquivo tem um erro. Corrija antes de salvar.

### Adicionar um subfiltro

Arquivo: `src/config/mapConfig.js`. Dentro da pasta certa em `FILTERS`, acrescente uma linha:

```js
{ id: 'meu-subfiltro', name: 'Nome que aparece', unit: 'K', source: 'Instrumento' },
```

Para agrupar sob um subtítulo, acrescente `group: 'Nome do grupo'`. Itens do mesmo grupo ficam em sequência. Enquanto não houver dado com o mesmo `id`, o subfiltro mostra "sem dados", o que é esperado.

### Criar uma pasta de filtros nova

No `mapConfig.js`, acrescente um bloco em `FILTERS`:

```js
{
  id: 'nova-pasta', name: 'Nome da pasta', icon: Wind, color: '#a855f7',
  layers: [ /* subfiltros */ ],
},
```

O ícone vem de [lucide.dev/icons](https://lucide.dev/icons) e precisa ser importado na primeira linha do arquivo.

### Mudar um local candidato (AP)

No `mapConfig.js`, edite `CANDIDATE_SITES` (latitude °N, longitude °E de 0 a 360). Os mesmos pontos estão em `backend/dem_processor.py` (`POIS`): **mantenha os dois iguais**.

### Mudar a área de estudo

No `mapConfig.js`, edite `STUDY_AREA.bounds`: `[[sul, oeste], [norte, leste]]`. **Avise o Saulo**: a API precisa usar a mesma área.

### Mudar as cores das rotas

No `mapConfig.js`, edite `ROUTE_MODES` (`color` e `dash`, o tracejado).

### Refazer as camadas dos filtros (equipe de dados)

Só quando os dados brutos mudam. Precisa do Python e de um terminal, dentro da pasta `backend`:

```
python -m pip install -r requirements.txt
python main.py --mola /vsicurl/https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif
python export_layers.py
```

O `main.py` só é necessário na primeira vez em cada computador: ele lê do servidor da USGS apenas o pedaço da área de estudo e gera as grades em `backend/outputs/`. Depois, basta o `export_layers.py`. Para mudar algo de uma camada (cor, opacidade, texto da fonte), mude no `export_layers.py`, e não no `manifest.json`.

### Converter uma figura de mapa em dados

Quando a fonte só existe como imagem (mapa global com barra de cores), dentro da pasta `backend`:

```
python figure_to_data.py caminho/da/figura.png --vmin 0 --vmax 1
```

Troque `--vmin` e `--vmax` pelos valores das pontas da barra de cores. O resultado é uma **estimativa** e deve ser apresentado como tal.

### Instalar uma biblioteca nova

- **Site:** no terminal, `npm install nome-da-biblioteca`.
- **Python:** acrescente a biblioteca no `backend/requirements.txt`.

Avise no grupo: depois de trazer a versão nova, todo mundo precisa rodar `npm install` (ou `python -m pip install -r requirements.txt`) de novo.

---

## 9. Combinados do projeto

- **Coordenadas:** latitude °N e longitude **leste, de 0 a 360** (nunca "graus oeste").
- **Nomes de componentes** começam com maiúscula (`FilterList.jsx`). O Windows não liga, mas o servidor de publicação liga, e o site quebra lá.
- **Dados de teste** sempre marcados como teste. **Estimativas** sempre marcadas como estimativa. Nunca coloque valores inventados como se fossem reais.
- **Dados medidos em outro lugar de Marte** nunca são apresentados como medição da área de estudo.
- **Área de estudo:** na apresentação, descreva como "fronteira entre Arcadia e Amazonis Planitia".
- **Arquivos grandes** (como o MOLA, de 2 GB) não vão para o GitHub. Só os recortes pequenos.

---

## 10. Pendências

| Pendência | Onde |
|---|---|
| Radiação, o único filtro sem dado: valor do RAD/Curiosity e referência | `public/data/regional.json` |
| Abundância de rochas em %: fonte original e barra de cores da figura | `public/data/regional.json` |
| Direção do vento | `public/data/regional.json` |
| Substituir os pontos de teste | `src/mock/points.js` |
| Coordenadas do globo diferentes das do mapa 2D | `src/api/regions.json` |
| Abas explicativas para cada subfiltro | `mapConfig.js` + painel de inspeção |