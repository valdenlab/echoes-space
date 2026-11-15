# Ecos do Cosmos: Relíquias de Marte e da Lua
NASA Space Apps Challenge 2026 — *Abandonados, mas não esquecidos*. Site estático (HTML + CSS + JS), sem build nem backend. Idiomas: **PT-BR / EN / ES**.

> ⚠️ **Uso de IA (regra do desafio):** código, dados, textos, traduções, imagens, vídeos e áudio foram criados com auxílio de IA (Claude, Anthropic). Imagens e vídeos têm **marca d'água visível "GERADO POR IA"**. Detalhes no site (seção *Uso de IA*) e em [`AI-DISCLOSURE.md`](AI-DISCLOSURE.md). Não usa logotipos, bandeiras, emblemas de missão nem design da NASA; não é produto oficial da NASA.

## Publicar via FTP
1. Envie **todo o conteúdo** desta pasta (inclusive o arquivo oculto `.htaccess`) para `public_html/`.
2. Abra `https://seudominio.com/`. Funciona em subpasta e também abrindo `index.html` direto no navegador.
3. Apache: `.htaccess` já cobre MIME (mp4/webm/webp), gzip e cache. Nginx: configure equivalentes.

## Novidades desta versão
- **Fotos reais da NASA:** online, o site busca na *NASA Image and Video Library* (images-api.nasa.gov) e exibe a foto real com **crédito e link**; se não houver foto/rede, usa as ilustrações. Para fixar fotos escolhidas, rode `python3 tools/fetch_nasa_photos.py` (gera `assets/img/photos/index.json`). Desligar: `?photos=0`; só local: `?photos=local`; ou `EC.CFG.livePhotos=false` em `js/core/photos.js`. As buscas usam consultas por palavra-chave (`EC.PHOTO_QUERIES` em `js/data/artifacts.js`) — **revise as fotos exibidas** e ajuste as consultas se alguma não corresponder.
- **Certificado espacial:** ao conquistar as **14 insígnias**, o painel *Insígnias* libera o certificado (nome editável, todas as insígnias, patente, XP, data e nº de série). Baixe em **PNG**, **PDF** ou imprima.
- **Conformidade IA/NASA:** marca d'água em imagens e vídeos, bandeira neutra (sem símbolos nacionais/NASA), metadados e `AI-DISCLOSURE.md`.

## Idiomas
Botão **PT | EN | ES**. Ordem: `?lang=en` → preferência salva → idioma do navegador → pt. Links diretos: `?lang=es#/a/apollo11`, `#/p/mars`.
Adicionar idioma: copie `js/i18n/ui.en.js` e `art.en.js`, registre em `EC.LANGS` (`js/core/i18n.js`), inclua os `<script>` no `index.html` e valide com `node tools/check_i18n.js`.

## Estrutura
```
index.html 404.html .htaccess robots.txt manifest.webmanifest favicon.svg AI-DISCLOSURE.md
css/  js/core (icons, util, i18n, photos, store, audio)  js/data  js/i18n  js/ui (… certificate.js)  js/main.js
assets/img (artifacts, thumbs, hero, maps, ui, photos)   assets/video (hero, clips)
tools/ (geradores de mídia, fetch de fotos, validação — não precisa enviar ao servidor)
```

## Notas honestas
- Dados (datas, massas, coordenadas) e traduções EN/ES foram escritos por IA: **confira em nasa.gov e revise com falantes nativos**.
- Os textos em 1ª pessoa dos diários são dramatizações.
- Dependência externa opcional: Google Fonts (há fallback de sistema) e a API da NASA (fotos).
- Regenerar mídia: `python3 tools/gen_images.py && python3 tools/gen_maps.py && python3 tools/gen_video.py` (numpy, Pillow, opencv, ffmpeg).
