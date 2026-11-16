# 🪐 ARES — Advanced Reconnaissance and Exploration System

> **NASA Space Apps Challenge Project**  
> Developed with passion by team **A.T.O.M. (Associação de Tecnologia, Observação e Matemática)**

🌐 **Site publicado:** [ares-mars-03112026.netlify.app](https://ares-mars-03112026.netlify.app)

---

## 📌 1. Apresentação da Missão

O **ARES** (*Advanced Reconnaissance and Exploration System*) é uma plataforma web interativa para a exploração científica e o planejamento de futuras missões humanas em Marte, usando dados reais de diferentes missões e instrumentos da NASA e de outras instituições científicas.

A região de estudo é o **setor AP**, na **fronteira entre Arcadia e Amazonis Planitia** (cerca de 40°N, 202°E). São planícies de grande interesse para futuras missões humanas, por causa das evidências de gelo subterrâneo, do relevo plano e do potencial científico da superfície.

O ARES reúne, numa única interface, informações sobre recursos naturais, geologia e condições ambientais, e permite planejar trajetos de exploração pela superfície.

A plataforma funciona inteiramente pela web, no computador ou no celular, sem instalar nenhum programa.

---

## 🎯 2. Objetivo Central

Desenvolver um mapa científico interativo de Marte que ajude a identificar locais de interesse para futuras missões humanas, considerando:

- 💧 **Evidências de gelo e água subterrânea**
- 🪨 **Minerais e geologia da superfície**
- ☢️ **Condições de radiação**
- 🌬️ **Ventos, temperatura e pressão**
- 🌪️ **Poeira na atmosfera e na superfície**
- 🏔️ **Relevo, inclinação e obstáculos para deslocamento**

O sistema também permite escolher pontos de origem e destino e comparar trajetos alternativos.

---

## 🖥️ 3. Funcionamento da Plataforma

A interface tem duas etapas:

### 🌍 Etapa 1 — Visualização Global de Marte (3D)
Ao abrir o site, o usuário vê Marte inteiro em 3D (Three.js), com o Sol, as estrelas e as luas Fobos e Deimos. É possível:
- Girar e aproximar o planeta, com sensibilidade de câmera ajustável e texturas em 2K ou 8K.
- Identificar as principais regiões e os locais candidatos.
- Clicar em **Descer** para a animação de aproximação até a área de estudo.

### 🗺️ Etapa 2 — Exploração da Área de Estudo (2D)
Depois da aproximação, o usuário navega num mapa detalhado da região, com o **relevo real medido pela sonda Mars Global Surveyor** ao fundo. Os filtros científicos ficam organizados em três pastas:

* 🟠 **Geologia:** relevo e altitude, inclinação do terreno e composição mineral (silicatos/vidro, quartzo, K-feldspato e poeira superficial).
  - *Fontes:* MOLA e TES.
* 🟡 **Condições atmosféricas:** temperatura, infravermelho térmico, pressão, densidade, ventos, poeira e radiação.
  - *Fontes:* Mars Climate Database e, para a radiação, o instrumento RAD do rover Curiosity (em preparação).
* 🔵 **Suporte à vida:** compatibilidade com gelo subterrâneo, estabilidade do terreno (rugosidade, rochas e obstáculos) e unidades geológicas e vulcanismo.
  - *Fontes:* SWIM (que combina SHARAD, MOLA, TES e THEMIS), MOLA e mapa geológico da USGS.

Ao clicar em qualquer ponto, o painel de inspeção mostra o valor de cada camada naquele lugar.

> **Nota:** Cada camada informa a origem, a data, a resolução e a confiabilidade dos dados, e indica quando o valor é **medido**, **calculado**, **modelado** ou **estimado**. Dados medidos em outros lugares de Marte nunca são apresentados como medições da área de estudo.

---

## 🧭 4. Sistema de Planejamento de Rotas

Uma das funcionalidades centrais do ARES é o planejamento de deslocamentos pela superfície.

O usuário escolhe um ponto de partida e um destino, e o sistema calcula e desenha no mapa **três trajetos para comparação**: **menor distância**, **maior segurança** e **multicritério**.

- **Algoritmo utilizado:** $A^*$ (*A-Star*), sobre uma grade de 200 m construída com o relevo real do MOLA.
- **Variáveis de cálculo:** distância percorrida, inclinação do terreno, rugosidade, distância até obstáculos e regiões não navegáveis (declives acentuados, terreno muito acidentado e depressões).
- **Resultado:** distância, inclinação máxima e folga até o obstáculo mais próximo de cada trajeto, calculados em menos de 1 segundo.

---

## 📐 5. Organização da Interface

A interface tem uma identidade visual inspirada em centros de controle de missões espaciais (*Deep Space Station*):

- **Área central:** mapa interativo da área de estudo.
- **Painel lateral esquerdo:** filtros científicos (Geologia, Condições atmosféricas e Suporte à vida).
- **Painel lateral direito:** inspeção dos dados do ponto selecionado.
- **Barra superior:** navegação entre o globo 3D e o mapa 2D, com coordenadas do cursor em tempo real.
- **Painel inferior:** planejamento de rotas e métricas de cada trajeto.

---

## 👥 6. Divisão de Responsabilidades — Equipe A.T.O.M.

| Integrante | Função | Responsabilidades Principais |
| :--- | :--- | :--- |
| **Saulo** | Coordenação & Back-end | Liderança do grupo e das reuniões, sistema de rotas em Python ($A^*$, análise do terreno e obstáculos) e coleta dos dados reais de Marte (MOLA, SWIM, Mars Climate Database). |
| **Guilherme Otaviano** | Programador Geral | Estrutura completa do site (globo 3D, mapa 2D, painéis, filtros e rotas), integração do back-end e dos dados científicos ao front-end, repositório no GitHub e publicação (Netlify e Render). |
| **Victor** | Design & UX | Identidade visual do ARES, paleta de cores espacial, tipografia, ícones e prototipagem de interface. |
| **Anthony** | Matemática & Física | Matemática, Física & Apresentação: as validações de antes e, junto com Victor, a apresentação em slides. |

---

## 🛠️ 7. Tecnologias e Ferramentas

### Front-end
`React` • `Vite` • `Tailwind CSS` • `Three.js` • `Leaflet` • `React-Leaflet` • `Lucide React`

### Back-end & Processamento Científico
`Python` • `FastAPI` • `NumPy` • `SciPy` • `scikit-image` • `Rasterio` • `Matplotlib`

### Hospedagem
`Netlify` (site) • `Render` (API de rotas) • `GitHub` (código e trabalho em equipe)

### Fontes de Dados Científicos
`MOLA` (Mars Global Surveyor) • `SWIM` (SHARAD, MOLA, TES, THEMIS) • `TES` (Mars Global Surveyor) • `Mars Climate Database` (LMD/ESA/CNES) • `Mapa geológico de Marte` (USGS SIM 3292)

---

## 📋 8. Etapas de Desenvolvimento

1. ✅ **Pesquisa e Planejamento:** delimitação da área de estudo e levantamento das bases de dados.
2. ✅ **Processamento de Dados:** preparação do relevo, dos dados de gelo, minerais, geologia e atmosfera.
3. ✅ **Construção da Plataforma:** globo 3D, mapa 2D e layout *Deep Space*.
4. ✅ **Integração Científica:** 21 de 22 subfiltros com dados (falta apenas a radiação).
5. ✅ **Planejamento de Rotas:** algoritmo $A^*$ com relevo real e três modos de rota.
6. ✅ **Finalização:** dado de radiação, testes de usabilidade, revisão científica e preparação da apresentação.

---

## 🚀 9. Como Executar o Projeto Localmente

```bash
# 1. Clone este repositório
git clone https://github.com/GuilhermeOta/ares-mars.git

# 2. Acesse a pasta do projeto
cd ares-mars

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador para visualizar a plataforma.

Para usar o cálculo de rotas no seu computador e para saber **como contribuir com o projeto**, veja o [Guia do Projeto](GUIA_DO_PROJETO.md).

---

## 🌌 10. Objetivo Coletivo

O **ARES** representa a união interdisciplinar da **A.T.O.M. (Associação de Tecnologia, Observação e Matemática)**. Nosso objetivo vai além da criação de um mapa: desenvolvemos uma ferramenta científica capaz de integrar dados reais de Marte, facilitar sua interpretação e servir como suporte conceitual para a tomada de decisões em futuras missões humanas no Planeta Vermelho.

*ARES — NASA Space Apps Challenge.*