# Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md
"""Biblioteca de arte procedural (numpy + Pillow + OpenCV).
Gera cenas ilustradas da Lua e de Marte com equipamentos desenhados por código.
Todas as imagens são ilustrações originais — não são fotografias da NASA."""
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 900


def rng(seed):
    return np.random.default_rng(seed)


def fbm(h, w, seed, octaves=6, base=4, persistence=0.55):
    """Ruído fractal tileável (wrap) em [0,1]."""
    r = rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n = base * (2 ** o)
        g = r.random((n, n)).astype(np.float32)
        g = cv2.resize(np.tile(g, (2, 2)), (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)[:h, :w]
        out += g * amp
        tot += amp
        amp *= persistence
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)


def hillshade(z, strength=6.0, az=315, alt=40):
    gy, gx = np.gradient(z * strength)
    azr, altr = math.radians(az), math.radians(alt)
    sl = np.pi / 2 - np.arctan(np.hypot(gx, gy))
    asp = np.arctan2(-gx, gy)
    sh = np.sin(altr) * np.sin(sl) + np.cos(altr) * np.cos(sl) * np.cos(azr - asp)
    return np.clip(sh, 0, 1)


def add_craters(z, n, seed, rmin=6, rmax=70, depth=0.25):
    r = rng(seed)
    h, w = z.shape
    for _ in range(n):
        cx, cy = r.integers(0, w), r.integers(0, h)
        rad = rmin + (rmax - rmin) * (r.random() ** 3)
        s = int(rad * 2.4)
        ys, xs = np.mgrid[-s:s + 1, -s:s + 1].astype(np.float32)
        d = np.hypot(xs, ys) / rad
        prof = np.where(d < 1, -depth * (1 - d ** 2) * 1.0, 0) + np.where((d >= 1) & (d < 1.5), depth * 0.5 * np.exp(-((d - 1.0) * 4) ** 2), 0)
        for oy in (0,):
            y0, y1 = cy - s, cy + s + 1
            x0, x1 = cx - s, cx + s + 1
            for dy in (-h, 0, h):
                for dx in (-w, 0, w):
                    a0, a1, b0, b1 = y0 + dy, y1 + dy, x0 + dx, x1 + dx
                    ya, yb = max(a0, 0), min(a1, h)
                    xa, xb = max(b0, 0), min(b1, w)
                    if ya < yb and xa < xb:
                        z[ya:yb, xa:xb] += prof[ya - a0:yb - a0, xa - b0:xb - b0]
    return z


def colorize(z, shade, dark, light):
    dark, light = np.array(dark, np.float32), np.array(light, np.float32)
    t = np.clip(z, 0, 1)[..., None]
    base = dark + (light - dark) * t
    return np.clip(base * (0.45 + 0.9 * shade[..., None]), 0, 255)


def stars(w, h, seed, n=700):
    img = np.zeros((h, w, 3), np.float32)
    r = rng(seed)
    xs, ys = r.integers(0, w, n), r.integers(0, h, n)
    br = r.random(n) ** 3
    for x, y, b in zip(xs, ys, br):
        c = 120 + 135 * b
        tint = np.array([c * (0.9 + 0.1 * r.random()), c * 0.95, c * (0.85 + 0.15 * r.random())])
        img[y, x] = np.maximum(img[y, x], tint)
        if b > 0.7:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if 0 <= x + dx < w and 0 <= y + dy < h:
                    img[y + dy, x + dx] = np.maximum(img[y + dy, x + dx], tint * 0.45)
    return img


def earth_sprite(size=120, seed=5):
    s = size * 2
    ys, xs = np.mgrid[-1:1:complex(s), -1:1:complex(s)].astype(np.float32)
    d = np.hypot(xs, ys)
    m = d <= 1
    z = np.sqrt(np.clip(1 - d ** 2, 0, 1))
    land = fbm(s, s, seed, 5, 3)
    cloud = fbm(s, s, seed + 9, 5, 4)
    ocean = np.array([20, 70, 150], np.float32)
    ground = np.array([70, 130, 70], np.float32)
    col = np.where((land > 0.55)[..., None], ground, ocean)
    col = col * (1 - 0.0) + (cloud > 0.58)[..., None] * (255 - col) * 0.8
    light = np.clip(0.25 + 0.95 * (xs * -0.55 + ys * -0.35 + z * 0.8), 0, 1)[..., None]
    col = col * light
    atm = np.clip((d - 0.82) / 0.18, 0, 1)[..., None] * np.array([90, 140, 255], np.float32) * 0.5
    col = np.clip(col + atm * light, 0, 255)
    a = (m * 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([col.astype(np.uint8), a]), 'RGBA').resize((size, size), Image.LANCZOS)
    return img


class Scene:
    """Uma cena: céu + horizonte + chão em perspectiva + sprites com sombra."""

    def __init__(self, planet, seed, horizon=0.60, tint=None, bright=1.0, dust=0.0, orange=False):
        self.planet, self.seed = planet, seed
        self.h0 = int(H * horizon)
        self.bright = bright
        moon = planet == 'moon'
        # céu
        if moon:
            sky = stars(W, H, seed, 900)
            self.sky = sky
        else:
            yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
            top = np.array([70, 40, 36], np.float32)
            hor = np.array([214, 150, 118], np.float32)
            g = top + (hor - top) * np.clip(yy / (horizon + 0.05), 0, 1) ** 0.8
            g = np.repeat(g, W, axis=1)
            nz = fbm(H, W, seed + 3, 4, 3)[..., None] * 14
            self.sky = g + nz
            # sol
            ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
            sx, sy = W * 0.78, H * 0.2
            d = np.hypot(xs - sx, ys - sy)
            self.sky += np.exp(-(d / 160) ** 2)[..., None] * np.array([120, 95, 70], np.float32)
            self.sky += (d < 14)[..., None] * np.array([120, 120, 110], np.float32)
        # montanhas
        self.canvas = np.clip(self.sky, 0, 255).copy()
        self._mountains(moon)
        # chão
        self._ground(moon, orange)
        self.img = Image.fromarray(np.clip(self.canvas, 0, 255).astype(np.uint8))
        self.dust = dust
        if moon:
            e = earth_sprite(110, seed)
            self.img.paste(e, (int(W * 0.72), int(H * 0.09)), e)

    def _mountains(self, moon):
        r = rng(self.seed + 1)
        x = np.arange(W, dtype=np.float32)
        for layer, (amp, base, col, hz) in enumerate(((95, 0.0, (74, 72, 70) if moon else (150, 100, 80), 0.9), (50, 0.0, (58, 56, 54) if moon else (125, 80, 62), 1.0))):
            prof = np.zeros(W, np.float32)
            for o in range(1, 6):
                f = o * (1.2 + layer * 0.5)
                prof += np.sin(x / W * f * math.pi * 2 + r.random() * 6.28) * (amp / o)
            prof = self.h0 - 6 - np.abs(prof) * 0.55 - amp * 0.2 * (1 - layer * 0.4)
            ys = np.arange(H, dtype=np.float32)[:, None]
            m = ys >= prof[None, :]
            shade = 0.75 + 0.25 * np.clip((ys - prof[None, :]) / 60, 0, 1)
            colr = np.array(col, np.float32)
            if not moon:
                colr = colr * 0.9 + np.array([214, 150, 118], np.float32) * 0.1 * (1 - layer * 0.5)
            self.canvas = np.where(m[..., None], colr * shade[..., None], self.canvas)

    def _ground(self, moon, orange):
        h, w = H - self.h0, W
        T = 1024
        z = fbm(T, T, self.seed + 5, 7, 3)
        z = add_craters(z, 120, self.seed + 6, 8, 110, 0.5)
        sh = hillshade(z, 26.0, 300, 35)
        dark, light = ((72, 70, 68), (150, 148, 142)) if moon else ((96, 48, 30), (190, 108, 70))
        if orange:
            dark, light = (96, 70, 48), (214, 150, 80)
        tex = colorize(z, sh, dark, light).astype(np.float32)
        # fine grain
        tex *= (0.93 + 0.14 * fbm(T, T, self.seed + 8, 3, 128))[..., None]
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        dy = ys + 3.0
        C, F = 230.0, 620.0
        u = (xs - w / 2) * C / dy / 1.0 + self.seed * 37
        v = C * F / dy
        far = cv2.GaussianBlur(tex, (0, 0), 5)
        near = cv2.remap(tex, u % T, v % T, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
        farm = cv2.remap(far, u % T, v % T, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
        mix = np.clip(1 - dy / (h * 0.42), 0, 1)[..., None]
        out = near * (1 - mix) + farm * mix
        fog = np.clip(1 - dy / (h * 0.25), 0, 1) ** 1.6
        fogc = np.array((88, 86, 84) if moon else (200, 140, 110), np.float32)
        out = out * (1 - fog[..., None] * 0.75) + fogc * fog[..., None] * 0.75
        vign = 1 - 0.35 * ((xs / w - 0.5) ** 2) * 2
        out *= vign[..., None]
        self.canvas[self.h0:] = out
        self.ground_tex_shape = (h, w)

    # ---------------- utilidades de sprites ----------------
    def rocks(self, n, seed=3, ymin=0.08, ymax=1.0, scale=1.0, col=None, frost=False):
        r = rng(self.seed + seed)
        d = ImageDraw.Draw(self.img, 'RGBA')
        moon = self.planet == 'moon'
        base = col or ((92, 90, 88) if moon else (120, 62, 40))
        for _ in range(n):
            t = ymin + (ymax - ymin) * r.random() ** 1.4
            y = self.h0 + 8 + t * (H - self.h0 - 20)
            x = r.random() * W
            s = (4 + 34 * t ** 1.3) * (0.4 + r.random()) * scale
            sh = int(30 + 30 * t)
            d.ellipse((x - s * 0.9, y - s * 0.12, x + s * 1.4, y + s * 0.28), fill=(0, 0, 0, 40))
            f = 0.7 + 0.5 * r.random()
            c = tuple(int(v * f) for v in base)
            pts = []
            for a in np.linspace(0, math.pi, 7):
                rr = s * (0.7 + 0.3 * r.random())
                pts.append((x + math.cos(a) * rr, y - math.sin(a) * rr * 0.62))
            pts += [(x - s * 0.9, y), (x + s * 0.9, y)]
            d.polygon(pts, fill=c + (255,))
            d.polygon(pts[:4] + [(x, y)], fill=tuple(min(255, int(v * 1.25)) for v in c) + (120,))
            if frost and r.random() < 0.7:
                d.ellipse((x - s * 0.5, y - s * 0.6, x + s * 0.4, y - s * 0.2), fill=(240, 246, 255, 150))

    def footprints(self, x0, y0, n, dx, dy, seed=1):
        r = rng(self.seed + seed)
        d = ImageDraw.Draw(self.img, 'RGBA')
        for i in range(n):
            t = i / max(1, n - 1)
            x = x0 + dx * t + r.normal(0, 3)
            y = y0 + dy * t
            s = 7 + 9 * (y - self.h0) / (H - self.h0)
            d.ellipse((x - s, y - s * 0.28, x + s, y + s * 0.28), fill=(40, 38, 36, 130))
            d.ellipse((x - s * 0.7, y - s * 0.2, x + s * 0.7, y + s * 0.2), fill=(150, 148, 142, 70))

    def tracks(self, pts, width=14, col=(60, 36, 28)):
        d = ImageDraw.Draw(self.img, 'RGBA')
        for off in (-1, 1):
            line = [(x + off * width, y) for x, y in pts]
            d.line(line, fill=col + (150,), width=4, joint='curve')

    def place(self, sprite, x, y, shadow=True, light=(-0.6, 0.3), sh_alpha=110):
        """Cola um sprite (RGBA) com a base em (x, y) e projeta sombra no chão."""
        sw, sh_ = sprite.size
        if shadow:
            a = sprite.split()[3]
            flipped = a.transpose(Image.FLIP_TOP_BOTTOM)
            k = -light[0]
            oh = max(4, int(sh_ * 0.4))
            shear = flipped.transform((int(sw * 2), oh), Image.AFFINE,
                                      (1, -k / 0.4, -sw * 0.5, 0, 1 / 0.4, 0), Image.BILINEAR)
            shear = shear.filter(ImageFilter.GaussianBlur(3))
            sh_img = Image.new('RGBA', shear.size, (8, 6, 6, 0))
            sh_img.putalpha(shear.point(lambda v: int(v * sh_alpha / 255)))
            self.img.paste(sh_img, (int(x - sw), int(y - 3)), sh_img)
        self.img.paste(sprite, (int(x - sw / 2), int(y - sh_)), sprite)

    def finish(self, glow=0.0, vignette=0.35):
        a = np.asarray(self.img.convert('RGB')).astype(np.float32) * self.bright
        ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
        v = 1 - vignette * (((xs / W - 0.5) * 1.6) ** 2 + ((ys / H - 0.5) * 1.4) ** 2)
        a *= np.clip(v, 0.2, 1)[..., None]
        if self.dust:
            a = a * (1 - self.dust) + np.array([205, 140, 105], np.float32) * self.dust
        a += (rng(self.seed).random((H, W, 1)).astype(np.float32) - 0.5) * 7
        return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------------------
#  Sprites de equipamentos (supersampling 3x)
# ---------------------------------------------------------------------------
SS = 3


def _canvas(w, h):
    return Image.new('RGBA', (w * SS, h * SS), (0, 0, 0, 0))


def _fin(img, w, h):
    return img.resize((w, h), Image.LANCZOS)


def _line(d, pts, fill, width):
    d.line([(x * SS, y * SS) for x, y in pts], fill=fill, width=int(width * SS), joint='curve')


def _poly(d, pts, fill, outline=None):
    d.polygon([(x * SS, y * SS) for x, y in pts], fill=fill, outline=outline)


def _ell(d, box, fill, outline=None, width=1):
    d.ellipse([v * SS for v in box], fill=fill, outline=outline, width=int(width * SS))


def foil(d, pts, seed, base=(222, 168, 52), n=40):
    """Manta térmica dourada: polígono com amassados."""
    r = rng(seed)
    _poly(d, pts, base + (255,))
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    mask = Image.new('L', (int((x1 + 2) * SS), int((y1 + 2) * SS)), 0)
    ImageDraw.Draw(mask).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    layer = Image.new('RGBA', mask.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for _ in range(n):
        x, y = r.uniform(x0, x1), r.uniform(y0, y1)
        l = r.uniform(6, 22)
        a = r.uniform(0, math.pi)
        c = (255, 226, 130, 150) if r.random() < 0.5 else (120, 80, 20, 120)
        ld.line((x * SS, y * SS, (x + math.cos(a) * l) * SS, (y + math.sin(a) * l * 0.6) * SS), fill=c, width=int(1.4 * SS))
    layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.split()[3]), np.asarray(mask)).astype(np.uint8)))
    d._image.alpha_composite(layer)


def sprite_lm(seed=1, flip=False):
    w, h = 460, 330
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    # pernas e patas
    leg = (196, 198, 204, 255)
    for (sx, sy, ex, ey) in ((120, 190, 40, 300), (330, 190, 420, 300), (170, 215, 140, 318), (280, 215, 320, 318)):
        _line(d, [(sx, sy), (ex, ey)], (120, 122, 128, 255), 7)
        _line(d, [(sx + 1, sy), (ex + 1, ey)], leg, 3)
    for (px, py, pw) in ((40, 303, 34), (420, 303, 34), (140, 320, 26), (320, 320, 26)):
        _ell(d, (px - pw, py - 7, px + pw, py + 7), (170, 172, 178, 255), (80, 82, 88, 255), 1)
    # corpo
    top = [(110, 60), (350, 60), (395, 104), (65, 104)]
    front = [(65, 104), (395, 104), (380, 215), (80, 215)]
    foil(d, front, seed, (224, 170, 54), 70)
    _poly(d, [(65, 104), (110, 104), (118, 215), (80, 215)], (160, 110, 30, 150))
    _poly(d, [(350, 104), (395, 104), (380, 215), (342, 215)], (120, 80, 20, 110))
    _poly(d, top, (70, 72, 78, 255))
    _ell(d, (170, 66, 290, 98), (20, 20, 24, 255), (140, 142, 148, 255), 2)
    _line(d, [(65, 104), (395, 104)], (255, 230, 150, 200), 2)
    # painéis prateados
    _poly(d, [(150, 150), (310, 150), (306, 190), (154, 190)], (200, 204, 210, 200), (90, 92, 98, 255))
    # escada
    _line(d, [(230, 215), (214, 318)], (210, 212, 218, 255), 3)
    _line(d, [(246, 215), (238, 318)], (210, 212, 218, 255), 3)
    for i in range(7):
        y = 235 + i * 12
        _line(d, [(222 - (y - 235) * 0.1, y), (242 - (y - 235) * 0.04, y)], (230, 232, 238, 255), 2)
    # antena
    _line(d, [(300, 62), (320, 22)], (200, 200, 206, 255), 3)
    _ell(d, (296, 6, 346, 28), (210, 212, 218, 255), (90, 92, 98, 255), 1.5)
    im = _fin(im, w, h)
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


def sprite_flag(w=70, h=150):
    """Bandeirola neutra (sem bandeiras nacionais nem identidade visual da NASA)."""
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    _line(d, [(8, 148), (8, 6)], (220, 220, 226, 255), 3)
    _line(d, [(8, 8), (66, 8)], (220, 220, 226, 255), 2)
    _poly(d, [(8, 12), (64, 14), (64, 54), (8, 52)], (226, 232, 240, 255), (150, 160, 175, 255))
    _poly(d, [(8, 28), (64, 29), (64, 38), (8, 37)], (34, 150, 190, 255))
    return _fin(im, w, h)


def sprite_lrv(seed=2):
    w, h = 330, 180
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    # chassi
    _poly(d, [(50, 92), (270, 92), (290, 112), (36, 112)], (180, 182, 188, 255), (80, 82, 88, 255))
    _line(d, [(70, 92), (110, 40)], (190, 192, 198, 255), 4)
    _line(d, [(250, 92), (215, 40)], (190, 192, 198, 255), 4)
    # bancos
    for x in (120, 175):
        _poly(d, [(x, 70), (x + 34, 70), (x + 34, 90), (x, 90)], (150, 152, 158, 220), (70, 72, 78, 255))
        _poly(d, [(x, 46), (x + 6, 46), (x + 6, 70), (x, 70)], (150, 152, 158, 220))
    # antena em malha
    _line(d, [(258, 92), (262, 40)], (190, 192, 198, 255), 3)
    _ell(d, (222, 6, 300, 46), (225, 228, 235, 90), (225, 228, 235, 255), 2)
    for i in range(1, 5):
        _line(d, [(222 + i * 15.6, 8), (222 + i * 15.6, 44)], (225, 228, 235, 120), 1)
    _line(d, [(40, 100), (4, 100)], (190, 192, 198, 255), 3)
    # camera
    _poly(d, [(36, 64), (62, 64), (62, 86), (36, 86)], (60, 62, 70, 255))
    # rodas
    for cx in (62, 262):
        _ell(d, (cx - 40, 98, cx + 40, 178), (24, 24, 28, 255), (150, 152, 158, 255), 3)
        for a in range(0, 360, 30):
            r1, r2 = 10, 38
            _line(d, [(cx + math.cos(math.radians(a)) * r1, 138 + math.sin(math.radians(a)) * r1),
                      (cx + math.cos(math.radians(a)) * r2, 138 + math.sin(math.radians(a)) * r2)], (170, 172, 178, 200), 1.5)
        _ell(d, (cx - 28, 110, cx + 28, 166), None, (110, 112, 118, 255), 2)
        _ell(d, (cx - 6, 132, cx + 6, 144), (210, 212, 218, 255))
    return _fin(im, w, h)


def sprite_met_cart():
    w, h = 140, 110
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    _poly(d, [(30, 50), (110, 50), (104, 78), (36, 78)], (210, 212, 218, 255), (80, 82, 88, 255))
    _line(d, [(30, 56), (6, 30)], (220, 222, 228, 255), 3)
    _line(d, [(110, 56), (132, 24)], (220, 222, 228, 255), 3)
    _ell(d, (22, 70, 56, 104), (30, 30, 34, 255), (170, 172, 178, 255), 2)
    _ell(d, (84, 70, 118, 104), (30, 30, 34, 255), (170, 172, 178, 255), 2)
    return _fin(im, w, h)


def sprite_surveyor(seed=4, flip=False):
    w, h = 340, 360
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    for (sx, sy, ex, ey) in ((170, 150, 40, 340), (170, 150, 300, 340), (170, 160, 170, 352)):
        _line(d, [(sx, sy), (ex, ey)], (210, 212, 218, 255), 6)
        _line(d, [(sx, sy), (ex, ey)], (90, 92, 98, 255), 1.5)
        _ell(d, (ex - 24, ey - 6, ex + 24, ey + 8), (190, 192, 198, 255), (80, 82, 88, 255), 1)
    # armação triangular
    _line(d, [(70, 245), (270, 245)], (170, 172, 178, 255), 4)
    _line(d, [(110, 190), (230, 190)], (170, 172, 178, 255), 4)
    # corpo
    _poly(d, [(130, 112), (210, 112), (222, 170), (118, 170)], (225, 226, 232, 255), (80, 82, 88, 255))
    _poly(d, [(130, 112), (150, 112), (142, 170), (118, 170)], (160, 162, 170, 180))
    _poly(d, [(140, 128), (200, 128), (205, 150), (136, 150)], (36, 40, 52, 255))
    # mastro + painel solar
    _line(d, [(170, 112), (170, 42)], (200, 202, 208, 255), 5)
    _poly(d, [(126, 18), (216, 18), (226, 48), (118, 48)], (28, 44, 96, 255), (190, 192, 198, 255))
    for i in range(1, 5):
        _line(d, [(118 + i * 21, 20), (116 + i * 22, 48)], (90, 110, 170, 180), 1)
    # câmera
    _ell(d, (150, 30, 190, 52), (60, 62, 70, 255), (200, 202, 208, 255), 2)
    _ell(d, (162, 36, 178, 48), (20, 20, 24, 255))
    # braço
    _line(d, [(212, 150), (272, 178), (292, 214)], (190, 192, 198, 255), 4)
    # antena
    _line(d, [(122, 118), (84, 70)], (200, 202, 208, 255), 3)
    _ell(d, (62, 52, 104, 80), (220, 222, 228, 255), (90, 92, 98, 255), 1.5)
    im = _fin(im, w, h)
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im


def sprite_viking(seed=6):
    w, h = 420, 300
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    for (sx, sy, ex, ey) in ((120, 190, 40, 290), (300, 190, 380, 290), (210, 200, 210, 296)):
        _line(d, [(sx, sy), (ex, ey)], (160, 162, 168, 255), 7)
        _ell(d, (ex - 26, ey - 6, ex + 26, ey + 8), (150, 152, 158, 255), (70, 72, 78, 255), 1)
    _poly(d, [(86, 100), (334, 100), (360, 196), (60, 196)], (190, 190, 192, 255), (70, 72, 78, 255))
    _poly(d, [(86, 100), (130, 100), (112, 196), (60, 196)], (150, 150, 154, 200))
    _poly(d, [(110, 120), (310, 120), (320, 170), (100, 170)], (96, 98, 104, 255))
    _poly(d, [(90, 88), (330, 88), (334, 100), (86, 100)], (220, 220, 224, 255))
    # antena parabólica
    _line(d, [(260, 88), (276, 36)], (200, 202, 208, 255), 4)
    _ell(d, (232, 10, 312, 46), (230, 232, 238, 255), (80, 82, 88, 255), 2)
    # braço coletor
    _line(d, [(336, 150), (396, 168), (408, 220)], (190, 190, 194, 255), 4)
    # boom meteorológico
    _line(d, [(70, 100), (28, 52)], (200, 202, 208, 255), 3)
    _ell(d, (20, 44, 36, 60), (80, 84, 92, 255))
    # RTG
    _ell(d, (150, 134, 192, 168), (60, 62, 68, 255), (140, 142, 148, 255), 2)
    return _fin(im, w, h)


def sprite_pathfinder():
    w, h = 460, 280
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    # airbags murchos
    for (cx, cy, rx, ry) in ((60, 240, 70, 28), (390, 244, 74, 30), (230, 262, 120, 16)):
        _ell(d, (cx - rx, cy - ry, cx + rx, cy + ry), (236, 236, 240, 255), (170, 170, 176, 255), 2)
    # pétalas abertas
    _poly(d, [(80, 220), (230, 190), (230, 232), (60, 250)], (190, 194, 202, 255), (90, 92, 98, 255))
    _poly(d, [(380, 220), (230, 190), (230, 232), (400, 250)], (170, 174, 182, 255), (90, 92, 98, 255))
    _poly(d, [(230, 190), (340, 150), (320, 192)], (205, 208, 214, 255), (90, 92, 98, 255))
    # tetraedro central
    _poly(d, [(230, 40), (330, 200), (230, 232), (150, 200)], (200, 202, 208, 255), (80, 82, 88, 255))
    _poly(d, [(230, 40), (150, 200), (230, 232)], (150, 152, 160, 255))
    # painéis solares
    _poly(d, [(190, 120), (230, 100), (230, 150), (186, 162)], (30, 44, 92, 255), (190, 192, 198, 255))
    # mastro câmera
    _line(d, [(230, 40), (230, 8)], (210, 212, 218, 255), 4)
    _poly(d, [(220, 0), (242, 0), (242, 14), (220, 14)], (70, 72, 80, 255))
    return _fin(im, w, h)


def sprite_rover_small(seed=7):
    """Sojourner."""
    w, h = 300, 190
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    _poly(d, [(60, 70), (240, 54), (252, 104), (50, 112)], (200, 202, 208, 255), (80, 82, 88, 255))
    _poly(d, [(66, 56), (236, 42), (240, 58), (62, 72)], (24, 36, 80, 255), (190, 192, 198, 255))
    for i in range(1, 6):
        _line(d, [(66 + i * 29, 56 - i * 2), (62 + i * 30, 72 - i * 2)], (90, 110, 170, 200), 1)
    _line(d, [(244, 54), (256, 10)], (200, 202, 208, 255), 3)
    _ell(d, (248, 4, 266, 16), (60, 62, 70, 255))
    for cx in (62, 150, 238):
        _ell(d, (cx - 28, 118, cx + 28, 178), (34, 34, 38, 255), (170, 172, 178, 255), 3)
        _ell(d, (cx - 10, 138, cx + 10, 158), (120, 122, 128, 255))
        for a in range(0, 360, 45):
            _line(d, [(cx + math.cos(math.radians(a)) * 6, 148 + math.sin(math.radians(a)) * 6),
                      (cx + math.cos(math.radians(a)) * 26, 148 + math.sin(math.radians(a)) * 26)], (150, 152, 158, 200), 1.2)
    _line(d, [(60, 108), (60, 130)], (190, 192, 198, 255), 3)
    return _fin(im, w, h)


def sprite_mer(seed=8, dusty=0.0):
    w, h = 460, 330
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    # deck solar
    solar = (200, 150, 60, 255) if dusty > 0.3 else (28, 44, 96, 255)
    _poly(d, [(60, 150), (400, 150), (430, 196), (30, 196)], (200, 202, 208, 255), (80, 82, 88, 255))
    _poly(d, [(80, 130), (380, 130), (404, 158), (56, 158)], solar, (200, 202, 208, 255))
    for i in range(1, 8):
        _line(d, [(80 + i * 37.5, 130), (56 + i * 43.5, 158)], (90, 110, 170, 150), 1)
    if dusty:
        _poly(d, [(80, 130), (380, 130), (404, 158), (56, 158)], (200, 140, 100, int(200 * dusty)))
    # corpo (WEB)
    _poly(d, [(150, 96), (320, 96), (340, 150), (130, 150)], (216, 190, 120, 255), (90, 80, 50, 255))
    # mastro
    _line(d, [(260, 96), (260, 30)], (210, 212, 218, 255), 5)
    _poly(d, [(236, 12), (290, 12), (290, 40), (236, 40)], (70, 72, 80, 255), (200, 202, 208, 255))
    _ell(d, (244, 20, 258, 32), (20, 20, 24, 255), (180, 182, 188, 255), 1)
    _ell(d, (268, 20, 282, 32), (20, 20, 24, 255), (180, 182, 188, 255), 1)
    # HGA
    _line(d, [(190, 100), (160, 56)], (200, 202, 208, 255), 3)
    _ell(d, (126, 36, 188, 66), (230, 232, 238, 255), (90, 92, 98, 255), 2)
    # braço
    _line(d, [(402, 170), (440, 196), (452, 230)], (190, 192, 198, 255), 5)
    _ell(d, (440, 222, 462, 242), (70, 72, 80, 255))
    # rocker-bogie
    for cx in (70, 230, 392):
        _ell(d, (cx - 38, 220, cx + 38, 300), (36, 36, 40, 255), (190, 192, 198, 255), 3)
        _ell(d, (cx - 14, 246, cx + 14, 274), (140, 142, 148, 255))
        for a in range(0, 360, 30):
            _line(d, [(cx + math.cos(math.radians(a)) * 16, 260 + math.sin(math.radians(a)) * 16),
                      (cx + math.cos(math.radians(a)) * 36, 260 + math.sin(math.radians(a)) * 36)], (150, 152, 158, 200), 1.2)
    _line(d, [(70, 260), (150, 196), (230, 260)], (210, 212, 218, 255), 5)
    _line(d, [(230, 260), (310, 196), (392, 260)], (210, 212, 218, 255), 5)
    return _fin(im, w, h)


def sprite_insight():
    w, h = 520, 300
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    for (sx, sy, ex, ey) in ((190, 190, 140, 288), (330, 190, 380, 288), (260, 200, 260, 292)):
        _line(d, [(sx, sy), (ex, ey)], (150, 152, 158, 255), 6)
        _ell(d, (ex - 22, ey - 5, ex + 22, ey + 7), (150, 152, 158, 255), (70, 72, 78, 255), 1)
    # painéis circulares
    for cx in (92, 428):
        _ell(d, (cx - 88, 80, cx + 88, 176), (30, 44, 98, 255), (210, 190, 120, 255), 4)
        _ell(d, (cx - 60, 98, cx + 60, 158), None, (90, 110, 170, 255), 2)
        _ell(d, (cx - 30, 112, cx + 30, 144), None, (90, 110, 170, 200), 1.5)
        _ell(d, (cx - 7, 122, cx + 7, 134), (200, 202, 208, 255))
    # deck
    _ell(d, (170, 150, 350, 216), (214, 200, 150, 255), (110, 100, 70, 255), 3)
    _ell(d, (196, 160, 324, 200), (232, 222, 176, 255))
    # instrumentos
    _poly(d, [(236, 80), (284, 80), (292, 152), (228, 152)], (190, 192, 198, 255), (80, 82, 88, 255))
    _ell(d, (240, 58, 280, 84), (70, 72, 80, 255), (200, 202, 208, 255), 2)
    _line(d, [(344, 180), (396, 222), (418, 250)], (190, 192, 198, 255), 4)
    return _fin(im, w, h)


def sprite_dome(w=150, h=90):
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    _ell(d, (6, 10, w - 6, h * 2 - 10), (186, 190, 198, 255), (80, 82, 88, 255), 2)
    _ell(d, (30, 18, 90, 60), (255, 255, 255, 70))
    return _fin(im, w, h)


def sprite_phoenix():
    w, h = 540, 300
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    for (sx, sy, ex, ey) in ((210, 180, 150, 288), (330, 180, 390, 288), (270, 190, 270, 294)):
        _line(d, [(sx, sy), (ex, ey)], (170, 172, 178, 255), 6)
        _ell(d, (ex - 22, ey - 5, ex + 22, ey + 7), (160, 162, 168, 255), (70, 72, 78, 255), 1)
    # painéis octogonais
    for side in (-1, 1):
        cx = 270 + side * 190
        pts = [(cx + math.cos(math.radians(a)) * 92, 118 + math.sin(math.radians(a)) * 54) for a in range(22, 382, 45)]
        _poly(d, pts, (30, 44, 98, 255), (200, 202, 208, 255))
        for k in (0.66, 0.33):
            _poly(d, [(cx + (x - cx) * k, 118 + (y - 118) * k) for x, y in pts], None, (90, 110, 170, 220))
    _poly(d, [(190, 140), (350, 140), (372, 196), (168, 196)], (206, 198, 160, 255), (100, 94, 70, 255))
    _poly(d, [(210, 150), (330, 150), (344, 186), (196, 186)], (150, 140, 110, 255))
    _line(d, [(270, 140), (270, 52)], (210, 212, 218, 255), 5)
    _poly(d, [(250, 28), (292, 28), (292, 56), (250, 56)], (70, 72, 80, 255), (200, 202, 208, 255))
    _line(d, [(352, 170), (410, 200), (440, 262)], (200, 202, 208, 255), 5)
    _ell(d, (430, 254, 456, 270), (70, 72, 80, 255))
    return _fin(im, w, h)


def sprite_orbiter_wreck():
    w, h = 300, 150
    im = _canvas(w, h)
    d = ImageDraw.Draw(im, 'RGBA')
    _poly(d, [(60, 60), (160, 40), (190, 96), (80, 112)], (200, 202, 208, 255), (80, 82, 88, 255))
    _poly(d, [(60, 60), (160, 40), (166, 54), (66, 74)], (230, 232, 238, 255))
    _line(d, [(190, 80), (280, 40)], (190, 192, 198, 255), 3)
    _ell(d, (268, 28, 292, 48), (70, 72, 80, 255))
    _poly(d, [(20, 100), (62, 86), (70, 112), (26, 124)], (30, 44, 98, 255), (190, 192, 198, 255))
    return _fin(im, w, h)


def crater_overlay(scene, cx, cy, rx, ry, rays=14, seed=9):
    r = rng(scene.seed + seed)
    d = ImageDraw.Draw(scene.img, 'RGBA')
    for _ in range(rays):
        a = r.uniform(0, 2 * math.pi)
        l = r.uniform(1.2, 3.2)
        d.line((cx + math.cos(a) * rx * 0.9, cy + math.sin(a) * ry * 0.9, cx + math.cos(a) * rx * l, cy + math.sin(a) * ry * l), fill=(190, 188, 182, 70), width=int(r.uniform(3, 12)))
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(36, 34, 33, 255))
    d.ellipse((cx - rx * 0.86, cy - ry * 0.7, cx + rx * 0.86, cy + ry * 0.7), fill=(20, 19, 19, 255))
    d.arc((cx - rx, cy - ry, cx + rx, cy + ry), 180, 360, fill=(170, 168, 162, 200), width=5)


def frost_patches(scene, n, seed=11):
    r = rng(scene.seed + seed)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        t = r.random() ** 1.2
        y = scene.h0 + 14 + t * (H - scene.h0 - 40)
        x = r.random() * W
        s = 8 + 90 * t
        d.ellipse((x - s, y - s * 0.16, x + s, y + s * 0.16), fill=(236, 244, 255, int(60 + 50 * r.random())))
    layer = layer.filter(ImageFilter.GaussianBlur(3))
    scene.img.paste(layer, (0, 0), layer)


# ---------------------------------------------------------------------------
#  Transparência de IA: marca d'água visível + metadados
# ---------------------------------------------------------------------------
WM_TEXT = 'GERADO POR IA · AI-GENERATED'
AI_NOTE = ('Gerado por IA (Claude, Anthropic) a partir de código procedural; ilustração original, '
           'não é fotografia da NASA / AI-generated (Claude, Anthropic) from procedural code; original illustration, not a NASA photograph.')
_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def wm_overlay(w, h, text=WM_TEXT):
    from PIL import ImageFont
    size = max(9, int(round(w / 1280 * 15)))
    try:
        f = ImageFont.truetype(_FONT, size)
    except Exception:
        f = ImageFont.load_default()
    ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    tw = d.textlength(text, font=f)
    pad = max(4, size // 2)
    x1, y1 = w - int(w * 0.012), h - int(h * 0.02)
    x0, y0 = x1 - tw - pad * 2, y1 - size - pad * 2
    d.rounded_rectangle((x0, y0, x1, y1), radius=pad, fill=(3, 5, 10, 190), outline=(255, 255, 255, 120))
    d.text((x0 + pad, y0 + pad - 1), text, font=f, fill=(255, 255, 255, 235))
    return ov


def wm(img, text=WM_TEXT):
    base = img.convert('RGBA')
    base.alpha_composite(wm_overlay(base.width, base.height, text))
    return base.convert('RGB')


def save_img(im, path, q=82):
    """Salva JPG/WEBP/PNG com metadados de divulgação de IA."""
    ext = path.rsplit('.', 1)[-1].lower()
    if ext == 'webp':
        ex = Image.Exif(); ex[0x010E] = AI_NOTE; ex[0x0131] = 'Claude (Anthropic) + Python/Pillow'
        im.save(path, 'WEBP', quality=q, method=6, exif=ex)
    elif ext in ('jpg', 'jpeg'):
        ex = Image.Exif(); ex[0x010E] = AI_NOTE; ex[0x0131] = 'Claude (Anthropic) + Python/Pillow'
        im.convert('RGB').save(path, 'JPEG', quality=q, optimize=True, comment=AI_NOTE.encode(), exif=ex)
    else:
        from PIL.PngImagePlugin import PngInfo
        pi = PngInfo(); pi.add_text('Description', AI_NOTE); pi.add_text('Software', 'Claude (Anthropic) + Python/Pillow')
        im.save(path, pnginfo=pi)
