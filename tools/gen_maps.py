# Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md
"""Mapas equirretangulares (Lua/Marte), globos do seletor, ícones do app e imagem de compartilhamento."""
import os, sys, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(__file__))
import lib_art as L

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
MW, MH = 1440, 720

def make_map(planet):
    moon = planet == 'moon'
    base = L.fbm(MH, MW, 11 if moon else 23, 8, 5, 0.62)
    low = L.fbm(MH, MW, 5 if moon else 8, 3, 2, 0.5)
    z = base * 0.5
    if moon:
        maria = np.clip((0.5 - low) * 4, 0, 1)
        z = z * (1 - maria * 0.6) + 0.05
        z = L.add_craters(z, 300, 7, 3, 30, 0.06)
    else:
        z = z + low * 0.6
        z = L.add_craters(z, 200, 9, 3, 28, 0.06)
    sh = L.hillshade(z, 14.0, 315, 38)
    if moon:
        col = L.colorize(z + (0.25 if True else 0), sh, (52, 52, 56), (176, 174, 170))
        col = col * (1 - maria[..., None] * 0.25)
    else:
        col = L.colorize(z, sh, (80, 36, 22), (204, 116, 74))
        dark = np.clip((low - 0.55) * 4, 0, 1)[..., None]
        col = col * (1 - dark * 0.45)
        yy = np.linspace(-1, 1, MH, dtype=np.float32)[:, None, None]
        cap = np.clip((np.abs(yy) - 0.93) * 20, 0, 1)
        col = col * (1 - cap) + np.array([235, 232, 235], np.float32) * cap
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))

def globe(mapimg, size=128, lon0=20):
    a = np.asarray(mapimg).astype(np.float32)
    s = size * 3
    ys, xs = np.mgrid[-1:1:complex(s), -1:1:complex(s)].astype(np.float32)
    d2 = xs ** 2 + ys ** 2
    m = d2 <= 1
    z = np.sqrt(np.clip(1 - d2, 0, 1))
    lat = np.arcsin(-ys)
    lon = np.arctan2(xs, z) + math.radians(lon0)
    u = ((lon / math.pi + 1) * 0.5 % 1) * (MW - 1)
    v = (0.5 - lat / math.pi) * (MH - 1)
    tex = cv2.remap(a, u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    light = np.clip(0.25 + 0.95 * (-xs * 0.5 - ys * 0.4 + z * 0.75), 0, 1)[..., None]
    out = tex * light
    out += np.clip((np.sqrt(d2) - 0.86) / 0.14, 0, 1)[..., None] * 18
    al = (np.clip((1 - np.sqrt(d2)) * s * 0.5, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([np.clip(out, 0, 255).astype(np.uint8), al]), 'RGBA')
    return img.resize((size, size), Image.LANCZOS)

def icon(size):
    im = Image.new('RGB', (size, size), (5, 8, 16))
    d = ImageDraw.Draw(im)
    c = size / 2
    for r, col in ((0.40, (34, 211, 238)), (0.28, (34, 211, 238)), (0.16, (34, 211, 238))):
        d.arc((c - size * r, c - size * r, c + size * r, c + size * r), 200, 340, fill=col, width=max(2, size // 40))
    d.ellipse((c - size * .06, c + size * .08, c + size * .06, c + size * .2), fill=(251, 191, 36))
    d.line((c, c + size * .1, c, c - size * .1), fill=(34, 211, 238), width=max(2, size // 40))
    return im

if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'maps'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'ui'), exist_ok=True)
    for p in ('moon', 'mars'):
        m = make_map(p)
        L.save_img(L.wm(m), os.path.join(ROOT, 'maps', p + '-map.webp'), 80)
        m.save(os.environ.get('EC_SCRATCH', '/tmp/ec_scratch') + f'/{p}-map.jpg', quality=88)
        gl = globe(m, 128, 20 if p == 'moon' else -40)
        gd = ImageDraw.Draw(gl); gd.text((50, 112), 'IA', fill=(255, 255, 255, 230))
        L.save_img(gl, os.path.join(ROOT, 'ui', p + '-globe.webp'), 88)
        print('ok', p)
    L.save_img(icon(192), os.path.join(ROOT, 'ui', 'icon-192.png'))
    L.save_img(icon(512), os.path.join(ROOT, 'ui', 'icon-512.png'))
