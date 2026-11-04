# 📋 Quadro Kanban — Projeto ARES (A.T.O.M.)

### 🟢 Concluído (Done)
- [x] **[Geral]** Definir o escopo do projeto e escolher Arcadia Planitia como setor de estudo
- [x] **[Front]** Configurar ambiente React + Vite e instalar bibliotecas base (Three.js, Lucide React)
- [x] **[Front]** Criar o layout base com estética espacial *Deep Space Theme* (Header + Menus Laterais)
- [x] **[Front]** Criar o componente do Globo 3D (`GlobeView.jsx`) com Three.js, rotação, iluminação solar e starfield
- [x] **[Front]** Mapear textura real de Marte e sincronizar o marcador de Arcadia Planitia (40°N, 188°E) à superfície
- [x] **[Front]** Adicionar assinatura do grupo *"Made by A.T.O.M"* e animação orbital de descida
- [x] **[Geral]** Inicializar controle de versão (Git) e enviar o repositório inicial para o GitHub
- [x] **[Geral]** Elaborar e publicar a documentação científica completa no `README.md`

### 🟡 Em Andamento (In Progress)
- [/] **[Front]** Desenvolver o componente da View 2D (`MapView.jsx`) com suporte a mapa interativo (Leaflet)
- [/] **[Design]** Refinar componentes da interface visual (painéis translúcidos, filtros científicos e badges)

### 🔴 A Fazer (To Do)
- [ ] **[Dados]** Baixar e converter rasters/dados da NASA (SWIM, CRISM, MOLA) de Arcadia Planitia para GeoJSON
- [ ] **[Front]** Conectar os 4 filtros científicos (Água, Geologia, Radiação e Ventos/Poeira) ao mapa 2D
- [ ] **[Back]** Implementar a lógica inicial do algoritmo A* para planejamento de rotas na superfície
- [ ] **[Front]** Desenvolver a interface do módulo inferior de planejamento de rotas (origem/destino/métricas)
- [ ] **[Matemática]** Validar o cálculo de inclinação topográfica e matriz de peso para o algoritmo A*
- [ ] **[Geral]** Realizar testes de usabilidade, integração final dos setores e deploy da plataforma (Vercel/Cloudflare)