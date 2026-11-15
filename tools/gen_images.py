# Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md
"""Gera as 17 cenas de artefatos, miniaturas, heróis, mapas, globos e ícones.
Uso: python3 tools/gen_images.py   (requer numpy, Pillow, opencv-python)
Saída em assets/img/. As imagens são ilustrações originais, não fotos da NASA."""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
import lib_art as L
from lib_art import Scene, W, H

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
SCR = os.environ.get('EC_SCRATCH', '/tmp/ec_scratch')
os.makedirs(SCR, exist_ok=True)
for d in ('artifacts', 'thumbs', 'hero', 'maps', 'ui'):
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)

def build(id):
    moon = id.startswith(('apollo', 'surveyor', 'prospector'))
    seed = abs(hash(id)) % 1000 if False else sum(ord(c) * (i + 3) for i, c in enumerate(id)) % 997
    S = Scene('moon' if moon else 'mars', seed,
              horizon=0.58 if id != 'apollo16' else 0.6,
              dust=0.0, bright=1.08 if moon else 1.0,
              orange=(id == 'apollo17'))
    gy = lambda t: S.h0 + t * (H - S.h0)
    if id.startswith('apollo'):
        S.rocks(60, 3, 0.05, 1.0)
        lm = L.sprite_lm(seed)
        flag = L.sprite_flag()
        S.footprints(W * .42, gy(.62), 12, 200, 130, 2)
        if id == 'apollo12':
            sv = L.sprite_surveyor(3).resize((120, 127), Image.LANCZOS)
            S.place(sv, W * .78, gy(.2))
        if id == 'apollo14':
            S.place(L.sprite_met_cart(), W * .70, gy(.62))
        S.place(lm.resize((int(460 * 1.5), int(330 * 1.5)), Image.LANCZOS), W * .36, gy(.66))
        S.place(flag.resize((90, 193), Image.LANCZOS), W * .58, gy(.7))
        if id in ('apollo15', 'apollo16', 'apollo17'):
            lrv = L.sprite_lrv()
            S.place(lrv.resize((int(330 * 1.15), int(180 * 1.15)), Image.LANCZOS), W * .74, gy(.84))
            S.tracks([(W * .74 + i * 6, gy(.84) + i * 1.5) for i in range(0, 60, 4)], 18)
        S.rocks(26, 8, 0.7, 1.0, 1.3)
    elif id == 'surveyor3':
        S.rocks(60, 3)
        S.footprints(W * .60, gy(.7), 0, 0, 0)
        S.place(L.sprite_surveyor(4).resize((int(340 * 1.45), int(360 * 1.45)), Image.LANCZOS), W * .46, gy(.72))
        S.rocks(24, 8, 0.7, 1.0, 1.4)
    elif id == 'surveyor6':
        S.rocks(60, 3)
        d = ImageDraw.Draw(S.img, 'RGBA')
        for dx, dy in ((420, 0.78), (520, 0.8)):
            d.ellipse((dx - 40, gy(dy) - 8, dx + 40, gy(dy) + 8), fill=(30, 28, 27, 170))
        S.place(L.sprite_surveyor(7, True).resize((int(340 * 1.4), int(360 * 1.4)), Image.LANCZOS), W * .60, gy(.62))
        S.rocks(22, 8, 0.7, 1.0, 1.4)
    elif id == 'prospector':
        S.rocks(50, 3)
        L.crater_overlay(S, W * .52, gy(.55), 330, 70)
        S.place(L.sprite_orbiter_wreck().resize((380, 190), Image.LANCZOS), W * .66, gy(.78))
        S.rocks(30, 8, 0.5, 1.0, 1.2)
    elif id in ('viking1', 'viking2'):
        S.rocks(70, 3, 0.05, 1.0, 1.0, frost=(id == 'viking2'))
        if id == 'viking2':
            L.frost_patches(S, 30)
        S.place(L.sprite_viking().resize((int(420 * 1.35), int(300 * 1.35)), Image.LANCZOS), W * .45, gy(.68))
        S.rocks(26, 8, 0.7, 1.0, 1.4, frost=(id == 'viking2'))
    elif id == 'pathfinder':
        S.rocks(80, 3, 0.05, 1.0)
        S.place(L.sprite_pathfinder().resize((int(460 * 1.3), int(280 * 1.3)), Image.LANCZOS), W * .44, gy(.62))
        S.place(L.sprite_rover_small().resize((200, 126), Image.LANCZOS), W * .76, gy(.78))
        S.rocks(26, 8, 0.7, 1.0, 1.4)
    elif id == 'sojourner':
        S.rocks(80, 3, 0.05, 1.0)
        S.place(L.sprite_pathfinder().resize((300, 183), Image.LANCZOS), W * .74, gy(.3))
        S.tracks([(W * .5 - i * 18, gy(.8) + i * 3) for i in range(0, 24)], 12)
        S.place(L.sprite_rover_small().resize((int(300 * 1.7), int(190 * 1.7)), Image.LANCZOS), W * .46, gy(.82))
        S.rocks(26, 8, 0.8, 1.0, 1.6)
    elif id in ('spirit', 'opportunity'):
        S.rocks(80 if id == 'spirit' else 40, 3, 0.05, 1.0)
        if id == 'opportunity':
            d = ImageDraw.Draw(S.img, 'RGBA')
            r = L.rng(S.seed + 21)
            for _ in range(160):
                t = r.random() ** 1.2
                y = gy(.1 + .9 * t)
                x = r.random() * W
                s = 2 + 7 * t
                d.ellipse((x - s, y - s, x + s, y + s), fill=(84, 82, 90, 255))
                d.ellipse((x - s * .5, y - s * .8, x, y - s * .2), fill=(150, 150, 160, 220))
        S.tracks([(W * .38 - i * 20, gy(.8) + i * 3.5) for i in range(0, 26)], 14)
        S.place(L.sprite_mer(5, 0.5 if id == 'spirit' else 0.0).resize((int(460 * 1.4), int(330 * 1.4)), Image.LANCZOS), W * .5, gy(.82))
        S.rocks(26, 8, 0.8, 1.0, 1.5)
    elif id == 'insight':
        S.dust = 0.12
        S.rocks(50, 3, 0.05, 1.0, 0.7)
        S.place(L.sprite_dome().resize((190, 114), Image.LANCZOS), W * .78, gy(.52))
        S.place(L.sprite_insight().resize((int(520 * 1.5), int(300 * 1.5)), Image.LANCZOS), W * .42, gy(.7))
        S.rocks(20, 8, 0.8, 1.0, 1.2)
    elif id == 'phoenix':
        S.rocks(40, 3, 0.05, 1.0, 0.8)
        L.frost_patches(S, 80)
        S.place(L.sprite_phoenix().resize((int(540 * 1.35), int(300 * 1.35)), Image.LANCZOS), W * .5, gy(.68))
        S.rocks(14, 8, 0.8, 1.0, 1.0)
    return S.finish(), S

def save_webp(im, path, q=82):
    L.save_img(im, path, q)

if __name__ == '__main__':
    ids = ['apollo11','apollo12','apollo14','apollo15','apollo16','apollo17','surveyor3','surveyor6','prospector',
           'viking1','viking2','pathfinder','sojourner','spirit','opportunity','insight','phoenix']
    for id in (sys.argv[1:] or ids):
        im, S = build(id)
        im.save(os.path.join(SCR, id + '.jpg'), quality=90)
        save_webp(L.wm(im.resize((1280, 720), Image.LANCZOS)), os.path.join(ROOT, 'artifacts', id + '.webp'))
        save_webp(L.wm(im.resize((480, 270), Image.LANCZOS)), os.path.join(ROOT, 'thumbs', id + '.webp'), 76)
        print('ok', id)
