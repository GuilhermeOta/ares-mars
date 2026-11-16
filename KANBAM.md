📋 Quadro Kanban — Projeto ARES (A.T.O.M.)

🏁 Projeto finalizado em 15/11/2026. Todas as tarefas planejadas foram concluídas.

🟢 Concluído (Done)

Geral

 [Geral] Definir o escopo do projeto e escolher Arcadia Planitia como setor de estudo
 [Geral] Inicializar controle de versão (Git) e enviar o repositório inicial para o GitHub
 [Geral] Elaborar e publicar a documentação científica completa no README.md
 [Geral] Criar o GUIA_DO_PROJETO.md (estrutura, quem mexe em quê, receitas e convenções)
 [Geral] Definir o fluxo de trabalho em equipe com branches e Pull Requests
 [Geral] Juntar as branches de trabalho na main via Pull Request
 [Geral] Limpar as branches antigas do GitHub e ligar a trava local contra push direto na main (.githooks)
 [Geral] Reescrever o guia para trabalhar por cliques (lápis do GitHub, github.dev e VS Code)
 [Geral] Atualizar o README.md com a equipe final e o estado real do projeto
 [Geral] Retrospectiva completa do projeto (RETROSPECTIVA_ARES.md)

Front-end: globo 3D

 [Front] Configurar ambiente React + Vite e instalar bibliotecas base (Three.js, Lucide React)
 [Front] Criar o layout base com estética espacial Deep Space Theme (Header + Menus Laterais)
 [Front] Criar o componente do Globo 3D (GlobeView.jsx) com Three.js, rotação, iluminação solar e starfield
 [Front] Mapear a textura real de Marte e posicionar os marcadores dos locais na superfície
 [Front] Adicionar assinatura do grupo "Made by A.T.O.M" e animação orbital de descida
 [Front] Painel "Câmera": sensibilidade ajustável e zoom máximo ampliado
 [Front] Texturas em 2K por padrão (leve para celular) com opção de ativar 8K
 [Front] Zoom de descida maior, mirando a área de estudo do mapa 2D, com marcadores que encolhem
 [Front] Locais do globo: Olympus Mons, crateras Gale, Gusev e Jezero, Viking 1, Viking 2 e área de estudo (coordenadas corrigidas)
 [Front] Cartões de informação dos locais do globo, abertos com clique ou toque (placeInfo.js + PlaceInfoModal.jsx)

Front-end: mapa 2D

 [Front] Desenvolver a View 2D (MapView.jsx) com Leaflet, enquadrada na área de estudo dos pontos AP
 [Front] Relevo sombreado real da área como mapa de fundo
 [Front] Unificar a convenção de coordenadas (°N e longitude leste 0–360°) e a área de estudo com o código do Saulo
 [Front] Filtros científicos em pastas com subfiltros, no modelo definido pelo Saulo (Geologia, Condições atmosféricas, Suporte à vida)
 [Front] Painel de inspeção do ponto clicado, com fonte, data, resolução e confiança de cada dado
 [Front] Ligação com as camadas exportadas pela equipe de dados (public/data/layers/manifest.json)
 [Front] Botão "i" em cada pasta e subfiltro, com explicação e imagem (filterInfo.js + InfoModal.jsx)
 [Front] Remover os pontos de teste do mapa
 [Front] Testar e ajustar a interface no celular

Design e identidade visual

 [Design] Refinar componentes da interface visual (painéis translúcidos, filtros científicos e badges)
 [Design] Logo do ARES (Victor)
 [Design] Logo no cabeçalho, na tela de carregamento, no painel "Alvo selecionado" e no favicon

Dados e filtros (23 de 23 subfiltros com dados)

 [Dados] Relevo sombreado (hillshade), relevo, inclinação, rugosidade e obstáculos exportados do MOLA (export_layers.py)
 [Dados] SWIM: índices de compatibilidade com gelo (escala confirmada: −1 incompatível, +1 compatível); refletores e Wdn fora, por decisão da equipe de dados
 [Dados] Mars Climate Database: temperatura, pressão, densidade, vento, poeira e infravermelho térmico (valores regionais)
 [Dados] Direção do vento: de noroeste (~306°), calculada dos componentes do vento do Mars Climate Database
 [Dados] Radiação: 0,21 mGy/dia, medida pelo RAD do Curiosity em Gale (13 medições do sol 1), apresentada como medição de outro local
 [Dados] TES: silicatos/vidro, quartzo, K-feldspato e poeira superficial, convertidos das figuras (figure_to_data.py), com limite de detecção de 10%
 [Dados] Atividade vulcânica: mapa geológico da USGS (Tanaka et al., 2014, SIM 3292), recortado por clip_usgs_geology.py
 [Dados] Abundância de rochas: estimativa qualitativa do mapa do Viking IRTM (Christensen, 1986)
 [Dados] Textos dos botões "i" e dos cartões do globo revisados para bater com os dados do site
 [Back] API usa o relevo real (backend/dados/elevacao_m.npy) por padrão, sem precisar de variável de ambiente

Rotas

 [Back] Implementar o algoritmo A* com dados MOLA, obstáculos e três modos de rota (Saulo)
 [Back] Transformar o código de rotas em API (FastAPI, backend/api.py)
 [Front] Painel inferior de rotas: escolha de origem/destino, cálculo e comparação dos três modos
 [Front] Conectar o painel de rotas à API e desenhar as rotas no mapa 2D

Finalização

 [Geral] Hospedar a API de rotas no Render com o terreno real
 [Geral] Publicar o site no Netlify apontando para a API hospedada
 [Geral] Pedir a classificação do site e da API no FortiGuard, como recomendado pela NASA
 [Geral] Testes de integração final de todos os setores
 [Apresentação] Apresentação em slides (Victor e Anthony)

🟡 Em Andamento (In Progress)

 Nada em andamento: projeto finalizado.

💡 Melhorias futuras (opcional, para uma próxima versão)

Dados

 [Dados] Atmosfera em outros horários e estações (hoje é um instante: Ls 21°, ~13h30)
 [Dados] TES com valores exatos, se aparecer o arquivo .envi dos .hdr
 [Dados] Rochas em %, se for encontrada a legenda do mapa do IRTM
 [Dados] Confirmar a coordenada do AP-8 e a referência dos pontos AP (Luzzi et al., 2025)
 [Dados] Modelos de terreno de maior resolução (CTX ou HiRISE) para enxergar rochas e crateras pequenas

Site

 [Front] Pesquisa por coordenadas na barra superior
 [Front] Perfil de elevação da rota
 [Front] Fotos reais nos cartões do globo e imagens para os botões "i" sem imagem (inclinação, infravermelho, geomorfologia)

Matemática e física

 [Matemática] Validar o cálculo de inclinação topográfica e os pesos de cada modo do A*
 [Matemática] Suavizar as rotas (hoje têm o formato "em degraus" da grade de 8 direções) e recalcular a distância pela geometria real
 [Física] Modo "rota científica", que favoreça pontos com mais evidência de gelo