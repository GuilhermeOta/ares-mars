📋 Quadro Kanban — Projeto ARES (A.T.O.M.)
🟢 Concluído (Done)

Geral

 [Geral] Definir o escopo do projeto e escolher Arcadia Planitia como setor de estudo
 [Geral] Inicializar controle de versão (Git) e enviar o repositório inicial para o GitHub
 [Geral] Elaborar e publicar a documentação científica completa no README.md
 [Geral] Criar o GUIA_DO_PROJETO.md (estrutura, quem mexe em quê, receitas e convenções)
 [Geral] Definir o fluxo de trabalho em equipe com branches e Pull Requests

Front-end: globo 3D

 [Front] Configurar ambiente React + Vite e instalar bibliotecas base (Three.js, Lucide React)
 [Front] Criar o layout base com estética espacial Deep Space Theme (Header + Menus Laterais)
 [Front] Criar o componente do Globo 3D (GlobeView.jsx) com Three.js, rotação, iluminação solar e starfield
 [Front] Mapear a textura real de Marte e posicionar o marcador de Arcadia Planitia na superfície
 [Front] Adicionar assinatura do grupo "Made by A.T.O.M" e animação orbital de descida
 [Front] Painel "Câmera": sensibilidade ajustável e zoom máximo ampliado
 [Front] Texturas em 2K por padrão (leve para celular) com opção de ativar 8K

Front-end: mapa 2D

 [Front] Desenvolver a View 2D (MapView.jsx) com Leaflet, enquadrada na área de estudo dos pontos AP
 [Front] Substituir o mapa base da Terra pelo basemap de Marte (provisório até o relevo real)
 [Front] Unificar a convenção de coordenadas (°N e longitude leste 0–360°) e a área de estudo com o código do Saulo
 [Front] Filtros científicos em pastas com subfiltros, no modelo definido pelo Saulo (Geologia, Condições atmosféricas, Suporte à vida)
 [Front] Painel de inspeção do ponto clicado, com fonte, data, resolução e confiança de cada dado
 [Front] Ligação com as camadas exportadas pela equipe de dados (public/data/layers/manifest.json)

Rotas

 [Back] Implementar o algoritmo A* com dados MOLA, obstáculos e três modos de rota (Saulo)
 [Back] Transformar o código de rotas em API (FastAPI, backend/api.py)
 [Front] Painel inferior de rotas: escolha de origem/destino, cálculo e comparação dos três modos
 [Front] Conectar o painel de rotas à API e desenhar as rotas no mapa 2D
🟡 Em Andamento (In Progress)
[/] [Back] Rodar o main.py com o MOLA real e carregar o elevacao_m.npy na API (hoje a API usa terreno sintético)
[/] [Design] Refinar componentes da interface visual (painéis translúcidos, filtros científicos e badges)
[/] [Geral] Juntar as branches mapa-2d e rotas-front na main via Pull Request
🔴 A Fazer (To Do)

Dados

 [Dados] Exportar o relevo sombreado (hillshade) da área como mapa de fundo
 [Dados] Exportar cada subfiltro como PNG + entrada no manifest.json, com o mesmo id do mapConfig.js
 [Dados] Exportar a camada de obstáculos das rotas, para mostrar no mapa por que cada rota desvia
 [Dados] Definir fontes de dados para "Estabilidade do terreno" e "Atividade vulcânica"
 [Dados] Confirmar a coordenada do AP-8 e a referência dos pontos AP (Luzzi et al., 2025)

Front-end

 [Front] Substituir os pontos de teste (src/mock/points.js) por dados reais
 [Front] Abas explicativas para cada subfiltro (campo info no mapConfig.js + painel de inspeção)
 [Front] Atualizar as coordenadas do globo (src/api/regions.json) para bater com o mapa 2D
 [Front] Testar e ajustar a interface no celular

Matemática e física

 [Matemática] Validar o cálculo de inclinação topográfica e os pesos de cada modo do A*
 [Matemática] Avaliar a suavização das rotas (hoje têm o formato "em degraus" da grade de 8 direções)
 [Física] Revisar unidades e limitações das camadas de radiação e atmosfera (modelos, não medições locais)

Finalização

 [Geral] Hospedar a API de rotas (Render ou Railway) com o terreno real
 [Geral] Publicar o site (Vercel ou Cloudflare Pages) apontando para a API hospedada
 [Geral] Testes de usabilidade e integração final de todos os setores
 [Geral] Preparar a demonstração final