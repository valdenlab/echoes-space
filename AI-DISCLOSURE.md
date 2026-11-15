# Divulgação de uso de IA · AI disclosure · Divulgación de uso de IA
**Projeto / Project:** Ecos do Cosmos: Relíquias de Marte e da Lua — NASA Space Apps Challenge 2026
**Ferramenta / Tool:** Claude (Anthropic), assistente de IA, usado de forma agêntica (gera código, executa scripts, revisa e testa).
Projeto educacional; **não é um produto oficial da NASA**. Não usa logotipos, bandeiras, emblemas de missão nem elementos de design da NASA.

## Onde e como a IA foi usada
| Categoria | O que foi gerado por IA | Como | Marcação |
|---|---|---|---|
| **Imagens** | Todas as ilustrações: cenas dos 17 artefatos, miniaturas, mapas, globos, imagens de herói e og-image | Código procedural gerado por IA (`tools/*.py`: Python, numpy, Pillow, OpenCV) | Marca d'água visível “GERADO POR IA · AI-GENERATED” gravada em cada imagem + metadados EXIF/PNG + etiqueta “Ilustração · IA” na interface |
| **Vídeos** | Heróis, “sinal perdido” e 17 clipes de artefatos | Animações geradas a partir das ilustrações com ffmpeg (`tools/gen_video.py`) | Marca d'água visível gravada em todos os quadros + metadados do contêiner (comment/description) |
| **Áudio** | Som ambiente e efeitos | Síntese em tempo real (WebAudio) por código gerado por IA; **não há arquivos de áudio gravados**. A narração usa a voz de síntese do navegador | Menção em “Uso de IA” (site), neste arquivo, nos metadados HTML e no cabeçalho de `js/core/audio.js` |
| **Código** | Todo HTML, CSS e JavaScript, scripts de ferramentas, `.htaccess` | Escrito por IA e testado com Playwright | Meta tags (`generator`, `ai-generated`, `ai-disclosure`), cabeçalhos dos arquivos, este arquivo |
| **Dados e textos** | Estrutura de dados dos artefatos, diários de bordo (dramatizações em 1ª pessoa), traduções PT/EN/ES, perguntas do quiz | Redigidos por IA a partir de conhecimento geral sobre missões públicas | Seção “Uso de IA” no site (3 idiomas), este arquivo |
| **Certificado** | Layout e arte do certificado (canvas) | Código gerado por IA | Rodapé do certificado indica IA |

## Fotos reais
Fotografias reais da NASA (domínio público) **não** foram geradas por IA. Quando o site as exibe (via NASA Image and Video Library ou arquivos em `assets/img/photos/`), aparecem com o crédito e o link de origem.

## Verificação humana necessária
Datas, massas, coordenadas e resultados científicos foram escritos por IA e **devem ser conferidos** em fontes oficiais (nasa.gov) antes de publicação. As traduções para EN/ES devem ser revisadas por falantes nativos.
