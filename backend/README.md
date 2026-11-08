# ARCÁDIA PLANITIA - rotas A* multicritério (MOLA / HRSC / CTX)

## Instalação
    python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
    pip install -r requirements.txt                         # rasterio traz o GDAL (use conda-forge se o pip falhar)

## Execução (ordem recomendada)
    pytest                                      # 9 testes (o de rasterio só roda com rasterio instalado)
    python main.py --synthetic                  # valida o pipeline com terreno SINTÉTICO -> outputs_SINTETICO/
    python main.py                              # real: tenta ler o MOLA remoto (/vsicurl) e recortar a AOI
    python main.py --mola data/raw/mola/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif   # arquivo local
    python main.py --mola ... --hrsc <dtm_hrsc.tif> --ctx <tile_ctx.tif> --res 100

### Modo interativo (clique no mapa)
    python main.py --mola <arquivo.tif> --interativo
    python main.py --mola <arquivo.tif> --interativo --area 198,36,208,44 --res 300   # área maior
    python main.py --synthetic --interativo                                          # teste com terreno artificial
Clique 1 = origem, clique 2 = destino (rotas dos 3 modos), clique 3 = recomeça. Teclas: r limpar, s salvar, q sair.

Sem dados reais, `main.py` para com código 2 e escreve `outputs/DATA_REQUIRED.md` (nome, URL, formato,
cobertura, resolução e destino de cada produto). Nunca gera resultado "de mentira" fora de `--synthetic`.

## Módulos
data_sources (catálogo/proveniência) -> dem_processor (Rasterio, projeção local, NoData=NaN) ->
terrain_analyzer (declividade, orientação, TRI, RMS) -> obstacle_detection (bits de causa) ->
astar (8 direções, sem corte de quina, heurística octil admissível) -> route_comparison (3 pares x 3 modos) ->
visualization (2D/3D) -> main (orquestra e exporta GeoTIFF, GeoJSON, .npy, CSV/JSON, relatorio.md, provenance.json).

## Saídas em outputs/
maps/*.png, geotiff/*.tif, npy/*.npy, rotas.geojson, comparacao_rotas.csv|json, relatorio.md, provenance.json

## Limitações
Ver seção 5 de `relatorio.md` (gerada a cada execução) e a lista LIMITATIONS em main.py.
