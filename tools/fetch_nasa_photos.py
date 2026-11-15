"""Baixa FOTOS REAIS (domínio público) da NASA Image and Video Library para cada artefato.
Rode no seu computador (precisa de internet):   python3 tools/fetch_nasa_photos.py
Resultado: assets/img/photos/<id>.jpg + <id>-thumb.webp + index.json (o site usa automaticamente).
Requer: Pillow (pip install pillow). Imagens da NASA em geral são de domínio público; confira as diretrizes de
mídia em nasa.gov/nasa-brand-center/images-and-media. Não use logotipos da NASA. Fotos NÃO são geradas por IA.
Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md"""
import io, json, os, re, sys, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'img', 'photos')
API = 'https://images-api.nasa.gov/search'
UA = {'User-Agent': 'ecos-do-cosmos/1.0 (educational; NASA Space Apps)'}

def queries():
    s = open(os.path.join(ROOT, 'js', 'data', 'artifacts.js'), encoding='utf8').read()
    out = {}
    for m in re.finditer(r"(\w+):\{\s*q:'([^']+)',\s*must:'([^']*)'\s*\}", s):
        out[m.group(1)] = (m.group(2), m.group(3))
    return out

def pick(j, must):
    rx = re.compile(must, re.I) if must else None
    for it in (j.get('collection', {}).get('items') or []):
        d = (it.get('data') or [{}])[0]
        if d.get('media_type') not in (None, 'image'):
            continue
        links = it.get('links') or []
        th = next((l for l in links if l.get('render') == 'image' or '~thumb' in l.get('href', '')), None)
        if not th:
            continue
        blob = ' '.join([d.get('title', ''), d.get('description', ''), ' '.join(d.get('keywords') or [])])
        if rx and not rx.search(blob):
            continue
        base = re.sub(r'~(thumb|small|medium|large|orig)\.(jpg|jpeg|png)$', '', th['href'], flags=re.I)
        return {'base': base, 'title': d.get('title', ''), 'nasa_id': d.get('nasa_id', ''), 'center': d.get('center', '')}
    return None

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()

def main():
    os.makedirs(OUT, exist_ok=True)
    index = {}
    for id, (q, must) in queries().items():
        try:
            j = json.loads(get(f"{API}?q={urllib.parse.quote(q)}&media_type=image&page_size=25"))
            p = pick(j, must)
            if not p:
                print('sem resultado:', id); continue
            data = None
            for size in ('large', 'medium'):
                try:
                    data = get(p['base'] + f'~{size}.jpg'); break
                except Exception:
                    pass
            if not data:
                print('falha no download:', id); continue
            im = Image.open(io.BytesIO(data)).convert('RGB')
            im.thumbnail((1600, 1600)); im.save(os.path.join(OUT, id + '.jpg'), quality=85, optimize=True)
            t = im.copy(); t.thumbnail((480, 480)); t.save(os.path.join(OUT, id + '-thumb.webp'), 'WEBP', quality=78)
            index[id] = {'file': id + '.jpg', 'thumb': id + '-thumb.webp', 'title': p['title'], 'nasaId': p['nasa_id'],
                         'credit': 'NASA' + (' / ' + p['center'] if p['center'] else ''),
                         'link': 'https://images.nasa.gov/details/' + urllib.parse.quote(p['nasa_id'])}
            print('ok', id, '←', p['title'][:70])
        except Exception as e:
            print('erro', id, e)
    json.dump(index, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(f'{len(index)} fotos salvas. Revise as imagens e remova do index.json as que não servirem.')

if __name__ == '__main__':
    main()
