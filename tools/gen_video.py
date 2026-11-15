# Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md
"""Vídeos em loop (heróis, sinal perdido e um clipe por artefato) + imagens de herói e og-image.
Requer ffmpeg com libx264 e libvpx-vp9. Os vídeos são animações geradas por código."""
import os, sys, math, subprocess, shutil
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(__file__))
import lib_art as L
from lib_art import Scene, W, H

HERE = os.path.dirname(__file__)
IMG = os.path.join(HERE, '..', 'assets', 'img')
VID = os.path.join(HERE, '..', 'assets', 'video')
SCR = os.environ.get('EC_SCRATCH', '/tmp/ec_scratch')
os.makedirs(SCR, exist_ok=True)
for d in ('hero', 'clips'):
    os.makedirs(os.path.join(VID, d), exist_ok=True)
os.makedirs(os.path.join(IMG, 'hero'), exist_ok=True)

def hero_scene(planet):
    if planet == 'moon':
        S = Scene('moon', 77, horizon=0.60, bright=1.1)
        gy = lambda t: S.h0 + t * (H - S.h0)
        S.rocks(50, 3)
        S.footprints(W * .5, gy(.8), 14, -280, 120)
        S.place(L.sprite_lm(2).resize((int(460 * 1.6), int(330 * 1.6)), Image.LANCZOS), W * .74, gy(.7))
        S.place(L.sprite_flag().resize((84, 180), Image.LANCZOS), W * .52, gy(.74))
        S.rocks(22, 8, .75, 1.0, 1.4)
    else:
        S = Scene('mars', 88, horizon=0.60, dust=0.05)
        gy = lambda t: S.h0 + t * (H - S.h0)
        S.rocks(60, 3)
        S.tracks([(W * .58 - i * 22, gy(.85) + i * 3) for i in range(0, 22)], 16)
        S.place(L.sprite_mer(5, 0.35).resize((int(460 * 1.5), int(330 * 1.5)), Image.LANCZOS), W * .74, gy(.84))
        S.rocks(22, 8, .75, 1.0, 1.4)
    return S.finish(), S

META = ['-metadata', 'comment=' + L.AI_NOTE, '-metadata', 'description=' + L.AI_NOTE, '-metadata', 'encoded_by=Claude (Anthropic) + Python/ffmpeg']

def pipe(cmd, frames):
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()

def hero_video(planet, img, S, secs=8, fps=24, size=(1280, 720)):
    base = np.asarray(img).astype(np.float32)
    h, w = base.shape[:2]
    ovl = L.wm_overlay(size[0], size[1])
    oa = (np.asarray(ovl)[..., 3:4].astype(np.float32) / 255); orgb = np.asarray(ovl)[..., :3].astype(np.float32)
    lum = base.mean(2)
    star = ((lum > 55) & (np.arange(h)[:, None] < S.h0 - 40) & (planet == 'moon')).astype(np.float32)
    r = np.random.default_rng(3)
    ph = r.random((h, w)).astype(np.float32) * 6.28
    parts = r.random((70, 4))
    n = secs * fps
    def frames():
        for i in range(n):
            t = i / n
            s = 1.07 + 0.035 * math.sin(2 * math.pi * t)
            dx = 26 * math.sin(2 * math.pi * t)
            dy = 8 * math.cos(2 * math.pi * t)
            M = np.float32([[s * size[0] / w, 0, size[0] / 2 - s * size[0] / 2 + dx], [0, s * size[1] / h, size[1] / 2 - s * size[1] / 2 + dy]])
            f = base + star[..., None] * (np.sin(2 * math.pi * t * 2 + ph)[..., None] * 38)
            f = np.clip(f, 0, 255).astype(np.uint8)
            f = cv2.warpAffine(f, M, size, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            ov = f.astype(np.float32)
            for px, py, sp, sz in parts:
                x = (px * size[0] + t * (30 + 90 * sp) * (1 if planet == 'mars' else .2) * 6) % size[0]
                y = (py * size[1] * 0.6 + size[1] * 0.4 + 14 * math.sin(2 * math.pi * (t + sp))) % size[1]
                a = 0.25 + 0.2 * math.sin(2 * math.pi * (t * 2 + sp))
                cv2.circle(ov, (int(x), int(y)), int(1 + sz * 2), (255, 220, 190) if planet == 'mars' else (235, 240, 255), -1)
                f = np.clip(f * (1 - a * 0.25) + ov * (a * 0.25), 0, 255).astype(np.uint8) if False else f
            f = np.clip(f.astype(np.float32) * 0.8 + ov * 0.2, 0, 255)
            f = (f * (1 - oa) + orgb * oa).astype(np.uint8)
            yield f
    base_cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{size[0]}x{size[1]}', '-r', str(fps), '-i', '-']
    out = os.path.join(VID, 'hero', f'hero-{planet}')
    pipe(base_cmd + ['-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an'] + META + [out + '.mp4'], frames())
    pipe(base_cmd + ['-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-an'] + META + [out + '.webm'], frames())

def signal_video():
    r = np.random.default_rng(5)
    size = (640, 360)
    sov = L.wm_overlay(640, 360); so = np.asarray(sov)[..., 3:4].astype(np.float32) / 255; srgb = np.asarray(sov)[..., :3].astype(np.float32)
    def frames():
        for i in range(80):
            n = (r.random((size[1], size[0])) * 120).astype(np.float32)
            f = np.dstack([n * .55, n * .8, n])
            for _ in range(3):
                y = r.integers(0, size[1] - 14)
                f[y:y + r.integers(2, 14)] += 70
            y = int((i * 6) % size[1])
            f[y:y + 4] += 45
            f = np.clip(f, 0, 255)
            yield (f * (1 - so) + srgb * so).astype(np.uint8)
    pipe(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '640x360', '-r', '20', '-i', '-',
          '-c:v', 'libx264', '-crf', '34', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an'] + META + [os.path.join(VID, 'hero', 'signal-lost.mp4')], frames())

def clip(id):
    src = os.path.join(SCR, id + '.jpg')
    out = os.path.join(VID, 'clips', id + '.mp4')
    vf = ("zoompan=z='1.04+0.05*(1-cos(2*PI*on/150))/2':x='iw/2-(iw/zoom/2)+22*sin(2*PI*on/150)':"
          "y='ih/2-(ih/zoom/2)+6*cos(2*PI*on/150)':d=150:s=960x540:fps=25,noise=alls=5:allf=t")
    ovp = os.path.join(SCR, 'wm960.png'); L.wm_overlay(960, 540).save(ovp)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', src, '-i', ovp, '-filter_complex', '[0:v]' + vf + '[a];[a][1:v]overlay=0:0', '-t', '6', '-c:v', 'libx264', '-crf', '29',
                    '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an'] + META + [out], check=True)

def og(img):
    im = img.resize((1200, 675), Image.LANCZOS).crop((0, 22, 1200, 652))
    d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle((0, 0, 1200, 630), fill=(3, 5, 10, 120))
    try:
        fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 78)
        fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30)
    except Exception:
        fb = fs = ImageFont.load_default()
    d.text((60, 230), 'ECOS DO COSMOS', font=fb, fill=(240, 246, 255))
    d.text((60, 330), 'Relíquias de Marte e da Lua', font=fs, fill=(34, 211, 238))
    d.text((60, 560), 'NASA Space Apps Challenge 2026', font=fs, fill=(180, 190, 210))
    L.save_img(L.wm(im.convert('RGB')), os.path.join(IMG, 'hero', 'og-image.jpg'), 86)

if __name__ == '__main__':
    what = sys.argv[1:] or ['hero', 'signal', 'clips']
    if 'hero' in what:
        for p in ('moon', 'mars'):
            img, S = hero_scene(p)
            big = L.wm(img.resize((1920, 1080), Image.LANCZOS))
            L.save_img(big, os.path.join(IMG, 'hero', f'hero-{p}.jpg'), 82)
            L.save_img(big, os.path.join(IMG, 'hero', f'hero-{p}.webp'), 80)
            if p == 'moon':
                og(img)
            hero_video(p, img, S)
            print('hero', p)
    if 'signal' in what:
        signal_video(); print('signal')
    if 'clips' in what:
        ids = [a for a in os.listdir(SCR) if a.endswith('.jpg') and not a.endswith('-map.jpg') and a != 'sheet.jpg']
        for f in sorted(ids):
            clip(f[:-4]); print('clip', f[:-4])
