# 🪐 ARES — Advanced Reconnaissance and Exploration System

> **NASA Space Apps Challenge Project**  
> Developed with passion by team **A.T.O.M. (Associação de Tecnologia, Observação e Matemática)**

---

## 📌 1. Apresentação da Missão

O **ARES** (*Advanced Reconnaissance and Exploration System*) é uma plataforma web interativa desenvolvida para a exploração científica e o planejamento de futuras missões humanas em Marte, utilizando dados reais provenientes de diferentes missões e instrumentos científicos da NASA.

O projeto tem como região principal de estudo **Arcadia Planitia**, uma planície marciana de grande interesse para futuras missões humanas devido às evidências de gelo subterrâneo, às características de seu relevo e ao potencial científico de sua superfície.

A proposta consiste em desenvolver um sistema cartográfico que reúna informações sobre recursos naturais, características geológicas e condições ambientais em uma única interface, permitindo que o usuário investigue diferentes regiões e planeje trajetos de exploração.

A plataforma funciona inteiramente pela web através de navegadores modernos, sem a necessidade de instalação de programas pelo usuário final.

---

## 🎯 2. Objetivo Central

Desenvolver um mapa científico interativo de Marte que permita identificar possíveis locais de interesse para futuras missões humanas, considerando:

- 💧 **Disponibilidade e evidências de água subterrânea**
- 🪨 **Presença e distribuição de minerais**
- ☢️ **Condições de radiação**
- 🌬️ **Velocidade e comportamento dos ventos**
- 🌪️ **Ocorrência e intensidade de poeira atmosférica**
- 🏔️ **Características topográficas e obstáculos para deslocamento**

O sistema também permite a seleção de pontos de origem e destino, apresentando trajetos alternativos otimizados para a exploração da superfície.

---

## 🖥️ 3. Funcionamento da Plataforma

A interface é dividida em duas etapas visuais principais:

### 🌍 Etapa 1 — Visualização Global de Marte (3D)
Ao acessar a plataforma, o usuário encontra uma representação tridimensional de Marte visto por inteiro (Three.js), permitindo:
- Observar o planeta integralmente em 360°.
- Identificar as principais regiões geográficas.
- Visualizar a localização exata de Arcadia Planitia ($40^\circ\text{N}, 188^\circ\text{E}$).
- Iniciar a transição orbital (zoom suave) ao selecionar o setor.

### 🗺️ Etapa 2 — Exploração de Arcadia Planitia (2D)
Após a aproximação, o usuário tem acesso a um mapa bidimensional detalhado da região com movimentação, ampliação e quatro filtros científicos independentes:

* 🔵 **Filtro de Água:** Regiões com evidências de gelo subterrâneo e depósitos de água.
  - *Informações:* Localização, profundidade estimada, tipo de evidência, instrumento/missão e grau de confiança.
  - *Fontes:* SWIM, SHARAD e HiRISE.
* 🟠 **Filtro Geológico:** Composição e características geológicas da superfície.
  - *Informações:* Distribuição mineral, minerais hidratados, formações geológicas e relevo.
  - *Fontes:* CRISM, HiRISE e CTX.
* 🔴 **Filtro de Radiação:** Níveis de radiação e condições de exposição.
  - *Informações:* Dados de radiação espacial, histórico de medições, fonte e limitações das estimativas.
  - *Fontes:* Instrumento RAD (Rover Curiosity) e modelos teóricos.
* 🟡 **Filtro de Ventos e Poeira:** Condições atmosféricas para exploração.
  - *Informações:* Velocidade e direção dos ventos, tempestades de poeira e histórico atmosférico.
  - *Fontes:* Mars Climate Sounder (MCS) e estações meteorológicas de superfície.

> **Nota:** Cada camada apresenta a origem, data, resolução e confiabilidade das informações para garantir rigor científico.

---

## 🧭 4. Sistema de Planejamento de Rotas

Uma das funcionalidades centrais do ARES é o planejamento de deslocamentos pela superfície marciana.

O usuário pode selecionar um ponto de partida e um destino para que o sistema calcule e compare trajetos no próprio mapa. 

- **Algoritmo Utilizado:** $A^*$ (*A-Star Algorithm*)
- **Variáveis de Cálculo:** Distância percorrida, inclinação do terreno (declive topográfico) e identificação de obstáculos não navegáveis.

---

## 📐 5. Organização da Interface

A interface possui uma identidade visual inspirada em centros de controle de missões espaciais (*Deep Space Station*):

- **Área Central:** Mapa bidimensional interativo de Marte.
- **Painel Lateral Esquerdo:** Filtros científicos (Água, Geologia, Radiação e Atmosfera).
- **Painel Lateral Direito:** Inspeção de dados do local/coordenada selecionada.
- **Barra Superior:** Navegação, pesquisa de coordenadas e status da missão.
- **Painel Inferior:** Módulo de planejamento de rotas e métricas do trajeto.

---

## 👥 6. Divisão de Responsabilidades — Equipe A.T.O.M.

| Integrante | Função | Responsabilidades Principais |
| :--- | :--- | :--- |
| **Saulo** | Liderança & Back-end | Arquitetura do sistema, comunicação de módulos, integração de dados científicos e supervisão das entregas. |
| **Isabelly** | Arquitetura Web | Estruturação da plataforma, navegação cartográfica, transição 3D/2D e hospedagem. |
| **Guilherme Otaviano** | Front-end & UI | Desenvolvimento dos componentes visuais, menus laterais, marcadores interativos, filtros e interface do roteador. |
| **Willian** | Análise de Dados | Aquisição e processamento de dados da NASA (PDS/GIS), rotinas em Python e organização de metadados. |
| **Victor** | Design & UX | Identidade visual do ARES, paleta de cores espacial, tipografia, ícones e prototipagem de interface. |
| **Anthonelo** | Matemática & Física | Validação dos cálculos de inclinação, fundamentação teórica dos ventos/radiação e validação do algoritmo $A^*$. |

---

## 🛠️ 7. Tecnologias e Ferramentas

### Processamento Científico & Back-end
`Python` • `NumPy` • `Pandas` • `SciPy` • `Rasterio` • `GeoPandas` • `Astropy`

### Desenvolvimento Web & Front-end
`JavaScript` • `React.js` • `HTML5` • `CSS3` • `Tailwind CSS` • `Vite` • `Three.js` • `Lucide React`

### Cartografia & GIS
`Leaflet` • `React-Leaflet` • `GeoTIFF` • `GeoJSON` • `QGIS`

### Fontes de Dados Científicos (NASA)
`NASA PDS` • `NASA Mars Trek` • `Mars SWIM` • `MOLA` • `THEMIS` • `HiRISE` • `CRISM` • `SHARAD` • `Mars Climate Sounder (MCS)`

---

## 📋 8. Etapas de Desenvolvimento

1. **Pesquisa e Planejamento:** Delimitação de Arcadia Planitia e levantamento de bases de dados.
2. **Processamento de Dados:** Coleta e preparação dos rasters topográficos, hídricos e atmosféricos.
3. **Construção da Plataforma:** Implementação do Globo 3D, mapa 2D e layout *Deep Space*.
4. **Integração Científica:** Conexão das camadas de dados (água, geologia, radiação e ventos) com os filtros.
5. **Planejamento de Rotas:** Implementação da grade de navegação e algoritmo $A^*$.
6. **Finalização:** Testes de usabilidade, revisão científica, documentação e deploy.

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

---

## 🌌 10. Objetivo Coletivo

O **ARES** representa a união interdisciplinar da **A.T.O.M. (Associação de Tecnologia, Observação e Matemática)**. Nosso objetivo vai além da criação de um mapa: desenvolvemos uma ferramenta científica capaz de integrar dados reais da NASA, facilitar sua interpretação e servir como suporte conceitual para a tomada de decisões em futuras missões humanas no Planeta Vermelho.

*ARES — NASA Space Apps Challenge.*