"""CDN (Content Delivery Network) for total beginners — System Design for Beginners, part 2.

Landscape 1920x1080 storybook video: Chintu (asks) and Meera (explains) talk on the sides, the diagram is in
the middle, word-timed captions with a speaker tag at the bottom. Run with VIDEOGEN_W=1920 VIDEOGEN_H=1080.

    python3 reel.py out.mp4                   full render (multiprocess)
    python3 reel.py <dir> stills 3,40,95      preview PNGs
    python3 reel.py thumb.png thumb           1280x720 YouTube thumbnail
"""
import os, sys, math, re, json
import numpy as np
from PIL import Image, ImageDraw

K = os.environ['VIDEOGEN_K']
sys.path.insert(0, os.path.join(K, 'scripts'))
import engine as E
from engine import *
sys.path.insert(0, os.path.join(K, 'examples', 'storybook-characters'))
from characters import chintu, meera, Cast, INK, PAPER, CHINTU_COL, MEERA_COL

assert (W, H) == (1920, 1080), 'set VIDEOGEN_W=1920 VIDEOGEN_H=1080'

# Pop-in animations pass tiny scales; Pillow raises on boxes thinner than their outline. Skip those shapes.
def _safe(fn):
    def g(self, *a, **k):
        try: return fn(self, *a, **k)
        except ValueError: return None
    return g
for _n in ('rounded_rectangle', 'ellipse', 'arc', 'chord', 'pieslice', 'rectangle'):
    setattr(ImageDraw.ImageDraw, _n, _safe(getattr(ImageDraw.ImageDraw, _n)))
E.init(os.path.dirname(os.path.abspath(__file__)))
VOICE_GAIN = 2.0   # voice ~6 dB above the music bed
for _k in E.VOAUD: E.VOAUD[_k] = E.VOAUD[_k] * VOICE_GAIN

# ---- word timings (edge-tts writes vo/<key>.words.json) ----
WT = {}
for _k in E.VOTEXT:
    _p = os.path.join(E.WORK, 'vo', _k + '.words.json')
    if os.path.exists(_p): WT[_k] = json.load(open(_p))
def vo_at(key, phrase):
    txt = E.VOTEXT[key]; i = txt.lower().find(phrase.lower())
    assert i >= 0, (key, phrase)
    if key in WT and WT[key]: return WT[key][min(len(WT[key]) - 1, len(txt[:i].split()))][0]
    return E.VODUR[key] * i / len(txt)

# ---------------- storybook theme ----------------
SOFT = (110, 104, 140)
GREEN = (120, 200, 90)
SKIN = (255, 208, 168)
OCEAN = (214, 234, 250)
LAND = (196, 228, 186)

def make_story_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = np.array((255, 241, 222), np.float32), np.array((206, 230, 255), np.float32)
    k = (y / H)[..., None]
    img = top * (1 - k) + bot * k
    def blob(cx, cy, rx, ry, col, a):
        d = np.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2))
        return d[..., None] * (np.array(col, np.float32) - img) * a
    img += blob(W * 0.92, 160, 420, 260, (255, 200, 150), 0.6)
    img += blob(W * 0.06, H * 0.75, 460, 320, (190, 240, 225), 0.6)
    for cx, cy, r in [(560, 120, 50), (620, 105, 64), (680, 125, 44), (1330, 980, 60), (1400, 965, 76), (1465, 985, 52)]:
        d = ((x - cx) ** 2 + (y - cy) ** 2) < r * r
        img[d] = img[d] * 0.5 + 255 * 0.5
    dots = ((x % 54) - 27) ** 2 + ((y % 54) - 27) ** 2 < 4
    img[dots] = img[dots] * 0.93
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
E.BGIMG = make_story_bg()

def T(dl, s, size, cx, cy, col=INK, fname='xb', alpha=1.0, anchor='mm'):
    text(dl, s, fname, size, cx, cy, col, alpha=alpha, anchor=anchor)

def fit(s, fname, size, maxw):
    while size > 12 and F(fname, size).getlength(s) > maxw: size -= 1
    return size

def shadow_rr(dl, box, r, alpha=1.0, off=9):
    x0, y0, x1, y1 = box
    dl.rounded_rectangle((x0 + off, y0 + off, x1 + off, y1 + off), radius=r, fill=rgba(INK, 0.16 * alpha))

def card(dl, box, r=28, fill=PAPER, outline=INK, alpha=1.0, width=5, shadow=True):
    if alpha <= 0.01: return
    if shadow: shadow_rr(dl, box, r, alpha)
    dl.rounded_rectangle(box, radius=r, fill=rgba(fill, alpha), outline=rgba(outline, alpha), width=width)

def tag_pill(dl, cx, cy, s, col=INK, fill=PAPER, size=30, alpha=1.0, fname='b', sc=1.0):
    if alpha <= 0.01 or sc <= 0.05: return
    size *= sc
    w = F(fname, size).getlength(s) + size * 1.3; h = size * 1.9
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    shadow_rr(dl, box, h / 2, alpha, 6)
    dl.rounded_rectangle(box, radius=h / 2, fill=rgba(fill, alpha), outline=rgba(INK, alpha), width=4)
    text(dl, s, fname, size, cx, cy + 1, col, alpha=alpha)

def grad_banner(L, G, dl, cx, cy, s, w, h=96, size=42, sc=1.0):
    if sc <= 0.03: return
    ww, hh = w * sc, h * sc
    dl.rounded_rectangle((cx - ww / 2 + 8, cy - hh / 2 + 9, cx + ww / 2 + 8, cy + hh / 2 + 9), radius=hh / 2, fill=rgba(INK, 0.18))
    grad_pill(L, G, cx, cy, w, h, scale=sc)
    dl.rounded_rectangle((cx - ww / 2, cy - hh / 2, cx + ww / 2, cy + hh / 2), radius=hh / 2, outline=rgba(INK), width=5)
    text(dl, s, 'black', size * sc, cx, cy + 2, INK_ON_GRAD)

def lerp2(a, b, p): return (lerp(a[0], b[0], p), lerp(a[1], b[1], p))

def person(dl, cx, cy, s, col, alpha=1.0):
    """Small person icon; (cx, cy) = neck point."""
    if s <= 0.12 or alpha <= 0.01: return
    ink = rgba(INK, alpha); w = max(2, int(3.5 * s))
    dl.rounded_rectangle((cx - 25 * s, cy, cx + 25 * s, cy + 46 * s), radius=20 * s, fill=rgba(col, alpha), outline=ink, width=w)
    r = 18 * s; hy = cy - 16 * s
    dl.ellipse((cx - r, hy - r, cx + r, hy + r), fill=rgba(SKIN, alpha), outline=ink, width=w)
    for sx in (-1, 1):
        dl.ellipse((cx + sx * 6 * s - 2.5 * s, hy - 2 * s, cx + sx * 6 * s + 2.5 * s, hy + 3 * s), fill=ink)
    dl.arc((cx - 6 * s, hy, cx + 6 * s, hy + 9 * s), 20, 160, fill=ink, width=max(1, int(2 * s)))

def envelope(dl, cx, cy, s=1.0, alpha=1.0):
    if alpha <= 0.01: return
    w, h = 30 * s, 21 * s
    ink = rgba(INK, alpha)
    dl.rounded_rectangle((cx - w, cy - h, cx + w, cy + h), radius=5 * s, fill=rgba((255, 214, 102), alpha), outline=ink, width=max(2, int(4 * s)))
    dl.line([(cx - w + 3, cy - h + 3), (cx, cy + 3 * s), (cx + w - 3, cy - h + 3)], fill=ink, width=max(2, int(3 * s)))

def server(dl, cx, cy, s, t, state='ok', alpha=1.0, fill=None):
    """Cute server box with a face. state: ok | busy | dead."""
    if s <= 0.02 or alpha <= 0.01: return
    w, h = 170 * s, 210 * s
    if state == 'dead': cx += math.sin(t * 40) * 3 * s
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    fill = fill or {'ok': (240, 246, 255), 'busy': (255, 232, 206), 'dead': (255, 206, 206)}[state]
    card(dl, box, 26 * s, fill, alpha=alpha, width=max(3, int(6 * s)))
    ink = rgba(INK, alpha)
    for j in range(2):
        y = cy - h / 2 + (38 + j * 38) * s
        dl.rounded_rectangle((cx - w / 2 + 18 * s, y - 12 * s, cx + w / 2 - 18 * s, y + 12 * s), radius=6 * s,
                             fill=rgba((214, 222, 242), alpha), outline=ink, width=max(2, int(3 * s)))
        on = state != 'dead' and int(t * 3 + j * 1.3 + cx * 0.01) % 3 != 0
        led = CORAL if state == 'dead' else (GREEN if on else (170, 200, 160))
        lx = cx + w / 2 - 34 * s
        dl.ellipse((lx - 6 * s, y - 6 * s, lx + 6 * s, y + 6 * s), fill=rgba(led, alpha))
    fy = cy + 38 * s
    lw = max(2, int(5 * s))
    for sx in (-1, 1):
        ex = cx + sx * 30 * s
        if state == 'dead':
            r = 10 * s
            dl.line([(ex - r, fy - r), (ex + r, fy + r)], fill=ink, width=lw)
            dl.line([(ex + r, fy - r), (ex - r, fy + r)], fill=ink, width=lw)
        elif state == 'busy':
            dl.line([(ex - 10 * s, fy - 7 * s * sx), (ex + 10 * s, fy), (ex - 10 * s, fy + 7 * s * sx)], fill=ink, width=lw)
        else:
            r = 8 * s if (t + cx * 0.003) % 2.7 > 0.12 else 2 * s
            dl.ellipse((ex - 8 * s, fy - r, ex + 8 * s, fy + r), fill=ink)
    my = fy + 34 * s
    if state == 'ok':
        dl.arc((cx - 22 * s, my - 18 * s, cx + 22 * s, my + 8 * s), 20, 160, fill=ink, width=lw)
    elif state == 'busy':
        dl.ellipse((cx - 12 * s, my - 10 * s, cx + 12 * s, my + 12 * s), fill=rgba((120, 30, 45), alpha), outline=ink, width=max(2, int(3 * s)))
        dx, dy = cx + w / 2 - 6 * s, cy - h / 2 + 4 * s + (t * 60 % 40) * s
        dl.polygon([(dx, dy - 16 * s), (dx - 10 * s, dy + 4 * s), (dx + 10 * s, dy + 4 * s)], fill=rgba(BLUE, alpha))
        dl.ellipse((dx - 10 * s, dy - 6 * s, dx + 10 * s, dy + 14 * s), fill=rgba(BLUE, alpha))
    else:
        pts = [(cx - 24 * s + i * 8 * s, my + (4 if i % 2 else -4) * s) for i in range(7)]
        dl.line(pts, fill=ink, width=max(2, int(4 * s)))

def shop(dl, cx, cy, s=1.0, alpha=1.0, label=None):
    """Pizza branch: counter with a striped awning. (cx, cy) = counter centre."""
    if s <= 0.02 or alpha <= 0.01: return
    ink = rgba(INK, alpha)
    card(dl, (cx - 70 * s, cy - 28 * s, cx + 70 * s, cy + 42 * s), 10 * s, (255, 250, 240), alpha=alpha, width=max(3, int(4 * s)))
    ay0, ay1 = cy - 84 * s, cy - 52 * s
    for i in range(5):
        x0 = cx - 80 * s + i * 32 * s
        col = CORAL if i % 2 == 0 else PAPER
        dl.rectangle((x0, ay0, x0 + 32 * s, ay1), fill=rgba(col, alpha))
        dl.pieslice((x0, ay1 - 16 * s, x0 + 32 * s, ay1 + 16 * s), 0, 180, fill=rgba(col, alpha), outline=ink, width=max(2, int(3 * s)))
    dl.rectangle((cx - 80 * s, ay0, cx + 80 * s, ay1), outline=ink, width=max(2, int(4 * s)))
    for sx in (-1, 1):
        dl.line([(cx + sx * 66 * s, ay1 + 8 * s), (cx + sx * 66 * s, cy - 28 * s)], fill=ink, width=max(2, int(4 * s)))
    pizza(dl, cx, cy + 8 * s, 22 * s, alpha=alpha)

def kitchen(dl, cx, cy, s, t, alpha=1.0):
    """Big main kitchen building with a chimney and a pizza sign. (cx, cy) = building centre."""
    if s <= 0.02 or alpha <= 0.01: return
    ink = rgba(INK, alpha)
    for k in range(3):   # chimney smoke
        ph = (t * 0.6 + k / 3) % 1
        r = (10 + ph * 18) * s
        sx_, sy_ = cx + 60 * s + math.sin(t * 2 + k) * 6 * s, cy - 120 * s - ph * 70 * s
        dl.ellipse((sx_ - r, sy_ - r, sx_ + r, sy_ + r), fill=(150, 150, 165, int(120 * (1 - ph) * alpha)))
    dl.rectangle((cx + 45 * s, cy - 120 * s, cx + 75 * s, cy - 60 * s), fill=rgba((200, 110, 90), alpha), outline=ink, width=max(2, int(4 * s)))
    dl.polygon([(cx - 115 * s, cy - 40 * s), (cx, cy - 110 * s), (cx + 115 * s, cy - 40 * s)], fill=rgba(CORAL, alpha), outline=ink)
    dl.line([(cx - 115 * s, cy - 40 * s), (cx, cy - 110 * s), (cx + 115 * s, cy - 40 * s)], fill=ink, width=max(2, int(5 * s)))
    card(dl, (cx - 95 * s, cy - 40 * s, cx + 95 * s, cy + 75 * s), 8 * s, (255, 244, 226), alpha=alpha, width=max(3, int(5 * s)))
    dl.rounded_rectangle((cx - 25 * s, cy + 10 * s, cx + 25 * s, cy + 75 * s), radius=8 * s, fill=rgba((150, 96, 70), alpha), outline=ink, width=max(2, int(4 * s)))
    for sx in (-1, 1):
        dl.rounded_rectangle((cx + sx * 60 * s - 20 * s, cy - 15 * s, cx + sx * 60 * s + 20 * s, cy + 20 * s), radius=5 * s,
                             fill=rgba((200, 228, 255), alpha), outline=ink, width=max(2, int(3 * s)))
    pizza(dl, cx, cy - 58 * s, 20 * s, alpha=alpha)

def house(dl, cx, cy, s, col, alpha=1.0):
    if s <= 0.02 or alpha <= 0.01: return
    ink = rgba(INK, alpha)
    card(dl, (cx - 45 * s, cy - 20 * s, cx + 45 * s, cy + 45 * s), 6 * s, (255, 250, 240), alpha=alpha, width=max(2, int(4 * s)), shadow=False)
    dl.polygon([(cx - 58 * s, cy - 18 * s), (cx, cy - 66 * s), (cx + 58 * s, cy - 18 * s)], fill=rgba(col, alpha), outline=ink)
    dl.line([(cx - 58 * s, cy - 18 * s), (cx, cy - 66 * s), (cx + 58 * s, cy - 18 * s)], fill=ink, width=max(2, int(4 * s)))
    dl.rounded_rectangle((cx - 13 * s, cy + 8 * s, cx + 13 * s, cy + 45 * s), radius=4 * s, fill=rgba(col, alpha), outline=ink, width=max(2, int(3 * s)))

def pizza(dl, cx, cy, r, alpha=1.0, cold=False):
    if r <= 1 or alpha <= 0.01: return
    ink = rgba(INK, alpha)
    crust, cheese = ((190, 205, 225), (215, 230, 245)) if cold else ((235, 170, 90), (255, 214, 102))
    dl.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba(crust, alpha), outline=ink, width=max(2, int(r * 0.1)))
    r2 = r * 0.78
    dl.ellipse((cx - r2, cy - r2, cx + r2, cy + r2), fill=rgba(cheese, alpha))
    for a_, d_ in [(0.3, 0.45), (2.2, 0.5), (4.1, 0.42), (5.4, 0.2)]:
        px, py = cx + math.cos(a_) * r * d_, cy + math.sin(a_) * r * d_
        pr = r * 0.14
        dl.ellipse((px - pr, py - pr, px + pr, py + pr), fill=rgba((150, 160, 190) if cold else CORAL, alpha))
    for k in range(3):
        a_ = k * math.pi / 3
        dl.line([(cx - math.cos(a_) * r2, cy - math.sin(a_) * r2), (cx + math.cos(a_) * r2, cy + math.sin(a_) * r2)],
                fill=rgba(INK, 0.35 * alpha), width=max(1, int(r * 0.05)))

def scooter(dl, x, y, s=1.0, alpha=1.0):
    """Delivery scooter with a pizza box. (x, y) = wheel line centre."""
    if alpha <= 0.01: return
    ink = rgba(INK, alpha)
    for sx in (-1, 1):
        dl.ellipse((x + sx * 18 * s - 9 * s, y - 9 * s, x + sx * 18 * s + 9 * s, y + 9 * s), fill=ink)
    dl.rounded_rectangle((x - 24 * s, y - 20 * s, x + 22 * s, y - 6 * s), radius=6 * s, fill=rgba(ORANGE, alpha), outline=ink, width=max(2, int(3 * s)))
    dl.rectangle((x - 26 * s, y - 40 * s, x - 2 * s, y - 20 * s), fill=rgba((255, 236, 200), alpha), outline=ink, width=max(2, int(3 * s)))
    dl.line([(x + 16 * s, y - 20 * s), (x + 22 * s, y - 38 * s)], fill=ink, width=max(2, int(4 * s)))

def file_badge(dl, cx, cy, label, col, sc=1.0, alpha=1.0, size=26):
    """Small file icon (folded corner) with a coloured band and a label to its right."""
    if sc <= 0.03 or alpha <= 0.01: return
    w, h = 44 * sc, 56 * sc
    ink = rgba(INK, alpha)
    x0, y0 = cx - w / 2, cy - h / 2
    dl.polygon([(x0, y0), (x0 + w * 0.65, y0), (x0 + w, y0 + h * 0.28), (x0 + w, y0 + h), (x0, y0 + h)], fill=rgba(PAPER, alpha), outline=ink)
    dl.line([(x0, y0), (x0 + w * 0.65, y0), (x0 + w, y0 + h * 0.28), (x0 + w, y0 + h), (x0, y0 + h), (x0, y0)], fill=ink, width=max(2, int(4 * sc)))
    dl.rectangle((x0 + 5 * sc, y0 + h * 0.5, x0 + w - 5 * sc, y0 + h * 0.75), fill=rgba(col, alpha))
    if label: text(dl, label, 'xb', size * sc, cx + w / 2 + 10 * sc, cy, INK, alpha=alpha, anchor='lm')

def video_file(dl, cx, cy, sc=1.0, alpha=1.0):
    if sc <= 0.03 or alpha <= 0.01: return
    w, h = 64 * sc, 46 * sc
    dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=10 * sc, fill=rgba(CORAL, alpha), outline=rgba(INK, alpha), width=max(2, int(4 * sc)))
    dl.polygon([(cx - 9 * sc, cy - 12 * sc), (cx - 9 * sc, cy + 12 * sc), (cx + 13 * sc, cy)], fill=rgba(PAPER, alpha))

def pin(dl, x, y, col, s=1.0, alpha=1.0, ring=0.0):
    if s <= 0.03 or alpha <= 0.01: return
    if ring > 0:
        rr = (16 + 30 * ring) * s
        dl.ellipse((x - rr, y - rr, x + rr, y + rr), outline=rgba(col, (1 - ring) * alpha), width=4)
    r = 11 * s
    dl.ellipse((x - r, y - r, x + r, y + r), fill=rgba(col, alpha), outline=rgba(INK, alpha), width=max(2, int(4 * s)))
    dl.ellipse((x - r * 0.35, y - r * 0.35, x + r * 0.35, y + r * 0.35), fill=rgba(PAPER, alpha))

def dashed(dl, pts, col=INK, alpha=0.5, width=5, on=3, off=2):
    for i in range(0, len(pts) - 1):
        if i % (on + off) < on: dl.line([pts[i], pts[i + 1]], fill=rgba(col, alpha), width=width)

def curve(a, b, bend=0.0, wig=0.0, n=60):
    """Points from a to b: quadratic bend (perpendicular offset at the middle) plus an optional wiggle."""
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0; ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / ln, dx / ln
    out = []
    for i in range(n + 1):
        q = i / n
        off = bend * 4 * q * (1 - q) + wig * math.sin(q * math.pi * 4) * math.sin(q * math.pi)
        out.append((x0 + dx * q + nx * off, y0 + dy * q + ny * off))
    return out

def along(pts, q):
    q = clamp(q) * (len(pts) - 1); i = min(int(q), len(pts) - 2); f = q - i
    return lerp2(pts[i], pts[i + 1], f)

def ring_timer(dl, cx, cy, r, frac, col, width=12, alpha=1.0):
    dl.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba(PAPER, alpha), outline=rgba((222, 222, 236), alpha), width=width)
    if frac > 0.002:
        dl.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * frac, fill=rgba(col, alpha), width=width)

# ---------------- timeline ----------------
VS = {}          # VO key -> absolute start time
CHAPTERS = []    # (start, scene name, pill title)
def A(key, phrase=None): return VS[key] + (vo_at(key, phrase) if phrase else 0.0)
def END(key): return VS[key] + E.VODUR[key]

def chapter(name, title, keys, lead=1.0, gap=0.3, tail=0.7, waits=None):
    st = E.t
    if st > 0: sfx.append((st - 0.05, 'whoosh'))
    cur = st + lead
    for k in keys:
        add_vo(cur, k); VS[k] = cur
        cur += E.VODUR[k] + gap + (waits or {}).get(k, 0.0)
    scene(name, cur - gap + tail - st)
    CHAPTERS.append((st, name, title))
    return st

QWAIT = 3.6
chapter('hook', 'The Mystery', ['chintu_h1', 'meera_h1', 'chintu_h2', 'meera_h2', 'chintu_h3', 'meera_h3'], lead=0.4)
chapter('pizza', 'The Pizza Trick', ['meera_p1', 'chintu_p1', 'meera_p3', 'meera_p4', 'chintu_p2', 'meera_p5'])
chapter('edge', 'Origin vs Edge', ['meera_e1', 'meera_e2', 'chintu_e1', 'meera_e3', 'meera_e4', 'meera_e5', 'chintu_e3'])
chapter('miss', 'Miss, then Hit', ['chintu_m1', 'meera_m1', 'meera_m2', 'chintu_m2', 'meera_m4', 'chintu_m3', 'meera_m5'])
chapter('what', 'What Goes on a CDN', ['chintu_w1', 'meera_w1', 'meera_w2', 'chintu_w2', 'meera_w3'])
chapter('protect', 'Protecting the Origin', ['meera_w4', 'chintu_w3', 'meera_w5'])
chapter('ttl', 'TTL and Purge', ['chintu_w4', 'meera_w6', 'meera_w7', 'chintu_w5'])
chapter('real', 'CDNs in Real Life', ['meera_r2', 'meera_r3', 'chintu_r1', 'meera_r4'])
chapter('recap', 'Recap', ['chintu_c2', 'meera_c1', 'chintu_c3', 'meera_c2'])
chapter('quiz', 'Quiz', ['meera_q0', 'chintu_q1', 'meera_a1', 'chintu_q2', 'meera_a2', 'chintu_q3', 'meera_a3'],
        waits={'chintu_q1': QWAIT, 'chintu_q2': QWAIT, 'chintu_q3': QWAIT})
chapter('outro', 'Next Up', ['chintu_o1', 'meera_o1'], tail=2.2)
TITLE = {n: (i + 1, ttl) for i, (s, n, ttl) in enumerate(CHAPTERS)}

def S(ts, kind): sfx.append((ts, kind))
# hook
S(A('chintu_h1', 'video'), 'pop'); S(A('chintu_h2', 'America'), 'pop'); S(A('meera_h2', 'CDN'), 'ding')
S(A('chintu_h3', 'chips'), 'pop'); S(A('meera_h3', 'Pizza'), 'pop')
# pizza
TB = A('meera_p3', 'branches')
S(A('meera_p1', 'one kitchen'), 'pop'); S(A('chintu_p1', 'cold'), 'buzz')
for i in range(3): S(TB + i * 0.25, 'pop')
S(A('meera_p4', 'fifteen'), 'ding'); S(A('meera_p5', 'Keep'), 'win')
# edge
CITIES = [('Mumbai', 72.8, 19.1, (-58, 26)), ('Delhi', 77.2, 28.6, (0, -34)), ('Singapore', 103.8, 1.35, (0, 32)), ('London', -0.1, 51.5, (0, -34))]
EXTRA = [(139.7, 35.7), (151.2, -33.9), (-46.6, -23.5), (28.0, -26.2), (8.7, 50.1), (-118, 34), (-74, 40.7), (-99, 19.4)]
S(A('meera_e1', 'origin'), 'ding')
T_WORLD = A('meera_e2', 'all over')
for j in range(len(EXTRA)): S(T_WORLD + j * 0.08, 'tick')
T_CITY = [A('meera_e2', c[0]) for c in CITIES]
for tt in T_CITY: S(tt, 'pop')
T_POP = A('meera_e3', 'PoP'); S(T_POP, 'ding')
T_SLOW = A('meera_e4', 'crosses'); T_250 = A('meera_e4', 'That takes'); S(T_250, 'buzz')
T_FAST = A('meera_e5', 'Delhi edge'); T_20 = A('meera_e5', 'Only'); S(T_20, 'ding')
T_12X = A('chintu_e3'); S(T_12X + 0.3, 'win')
# miss / hit
M_REQ = A('meera_m1', 'asks'); M_MISS = A('meera_m2', 'cache miss'); M_FETCH = A('meera_m2', 'fetches'); M_COPY = A('meera_m2', 'keeps')
M_NEXT = A('meera_m4', 'next person'); M_HAS = A('meera_m4', 'already'); M_HIT = A('meera_m4', 'cache hit')
M_EP = A('chintu_m3', 'caching'); M_WORLD = A('meera_m5', 'spread')
S(M_REQ, 'pop'); S(M_MISS, 'buzz'); S(M_FETCH, 'whoosh'); S(M_COPY + 0.4, 'ding'); S(M_NEXT, 'pop'); S(M_HIT, 'ding')
S(M_EP, 'pop'); S(M_WORLD, 'win')
# what goes
W_HW = A('chintu_w1', 'homework'); W_LUNCH = A('chintu_w1', 'lunch'); W_NOT = A('meera_w1'); W_STATIC = A('meera_w1', 'static')
W_FILES = [A('meera_w2', 'Images'), A('meera_w2', 'videos'), A('meera_w2', 'CSS'), A('meera_w2', 'JavaScript')]
W_BANK = A('chintu_w2', 'bank'); W_PERS = A('meera_w3', 'personal'); W_ORIG = A('meera_w3', 'origin')
for tt in [W_HW, W_LUNCH, W_BANK] + W_FILES: S(tt, 'pop')
S(W_NOT + 0.2, 'buzz'); S(W_STATIC, 'ding'); S(W_PERS, 'buzz'); S(W_ORIG, 'pop')
# protect
P_STOP = A('meera_w4', 'stop'); P_CALM = A('meera_w4', 'calm'); P_IPL = A('chintu_w3', 'IPL'); P_SALE = A('meera_w5', 'big sale')
P_SOAK = A('meera_w5', 'soak'); P_SAFE = A('meera_w5', 'origin')
S(P_CALM, 'ding'); S(P_IPL, 'pop'); S(P_SALE, 'pop'); S(P_SAFE + 0.3, 'win')
# ttl / purge
X_CHG = A('chintu_w4', 'changes'); X_OLD = A('chintu_w4', 'old'); X_TTL = A('meera_w6', 'TTL'); X_FRESH = A('meera_w6', 'fresh')
X_PURGE = A('meera_w7', 'purge'); X_DEL = A('meera_w7', 'delete'); X_RC = A('chintu_w5', 'report')
S(X_CHG, 'pop'); S(X_OLD, 'buzz'); S(X_TTL, 'pop'); S(X_FRESH + 0.5, 'ding'); S(X_PURGE, 'whoosh'); S(X_DEL, 'pop'); S(X_RC, 'pop')
# real life
R_APPS = [A('meera_r2', 'YouTube'), A('meera_r2', 'Netflix'), A('meera_r3', 'Instagram')]
R_PROV = [A('meera_r4', 'Cloudflare'), A('meera_r4', 'Akamai'), A('meera_r4', 'Amazon')]
for tt in R_APPS + R_PROV: S(tt, 'pop')
# recap
C_T = [A('chintu_c2'), A('meera_c1'), A('chintu_c3'), A('meera_c2')]
for tt in C_T: S(tt + 0.1, 'ding')
# quiz
Q = [('chintu_q1', 'meera_a1', 'What do we call the main server where the original files live?',
      ['Edge server', 'Origin server', 'PoP'], 1, 'The origin server holds the originals.'),
     ('chintu_q2', 'meera_a2', 'The very first request at an edge server: cache hit or cache miss?',
      ['Cache hit', 'Cache miss'], 1, 'Miss: the edge first fetches it from the origin.'),
     ('chintu_q3', 'meera_a3', 'You changed your logo, but users still see the old one. What do you do?',
      ['Buy a bigger server', 'Purge it', 'Restart your laptop'], 1, 'Purge the old file, or let its TTL run out.')]
for qk, ak, *_ in Q:
    S(A(qk), 'pop')
    for k in range(3): S(END(qk) + 0.2 + k * 1.0, 'tick')
    S(A(ak), 'win')
O_NEXT = A('chintu_o1', 'Next'); O_SITE = A('meera_o1', 'vizu'); O_FOLLOW = A('meera_o1', 'follow')
S(O_NEXT, 'ding'); S(O_SITE, 'pop'); S(O_FOLLOW, 'pop')

# ---------------- captions (word-timed, with speaker) ----------------
MERGE = [(['c', 'd', 'n'], 'CDN'), (['two', 'hundred', 'and', 'fifty'], '250'), (['at', 'vizu', 'code', '26'], '@vizucode26'),
         (['vizu', 'code', 'dot', 'site'], 'vizucode.site'), (['vizu', 'code'], 'vizucode')]
def rebuild_captions():
    caps = []
    for ts, key in E.vo_events:
        raw = E.VOTEXT[key].split(); tm = WT.get(key)
        if not tm: continue
        who = 'chintu' if key.startswith('chintu') else 'meera'
        toks, i = [], 0
        while i < len(raw):
            low = [re.sub(r'[^\w]', '', w_).lower() for w_ in raw[i:i + 4]]
            for pat, rep in MERGE:
                if low[:len(pat)] == pat:
                    last = raw[i + len(pat) - 1]
                    toks.append((rep + re.sub(r'^[\w\-]*', '', last), i, i + len(pat) - 1)); i += len(pat); break
            else:
                toks.append((raw[i], i, i)); i += 1
        chunks, cur = [], []
        for tok in toks:
            cur.append(tok)
            txt = ' '.join(c[0] for c in cur)
            if len(txt) >= 24 or tok[0][-1] in '.?!' or (tok[0][-1] == ',' and len(txt) >= 10) or len(cur) >= 5:
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for j, ch in enumerate(chunks):
            st = ts + tm[ch[0][1]][0] - 0.04
            en = ts + (tm[chunks[j + 1][0][1]][0] - 0.04 if j + 1 < len(chunks) else tm[ch[-1][2]][1] + 0.3)
            caps.append((st, en, ' '.join(c[0] for c in ch), who))
    E.captions[:] = caps

E.CFG.update(
    CAPTION_GOLD={'cdn', 'cdns', 'origin', 'edge', 'server', 'servers', 'pop', 'ttl', 'purge', 'cache', 'static', 'kitchen',
                  'branch', 'branches', 'pizza', 'delhi', 'usa', 'copy', 'copies', 'caching', 'cloudflare', 'akamai', 'cloudfront',
                  'youtube', 'netflix', 'instagram', 'ipl', 'sharding', 'vizucode', 'vizucodesite', 'vizucode26', 'images', 'videos',
                  'css', 'javascript', 'america', 'database'},
    CAPTION_TEAL={'hit', 'fast', 'yes', 'twenty', 'fifteen', 'hot', 'calm', 'fresh', 'perfect', 'exactly'},
    CAPTION_CORAL={'miss', 'cold', 'crash', 'old', 'tragic', 'far', 'faraway', '250', 'delete', 'personal'},
)
rebuild_captions()
E.finish()
CAST = Cast(('chintu', 'meera'))

def caption(dl, tsec):
    cur = [c for c in E.captions if c[0] <= tsec < c[1]]
    if not cur: return
    s0, e, txt, who = cur[-1]
    p = ease_out(prog(tsec, s0, s0 + 0.12))
    size = 46 * lerp(0.9, 1.0, p)
    f = F('black', size); sp = size * 0.3
    words = txt.upper().split()
    tw = sum(f.getlength(w_) for w_ in words) + sp * (len(words) - 1)
    tag = who.upper(); tf = F('black', 22); tgw = tf.getlength(tag) + 34
    total = tgw + 26 + tw
    cy = 1000
    pill(dl, W / 2, cy, total + 64, 84, INK, None, alpha=0.93 * p)
    x = W / 2 - total / 2
    col = CHINTU_COL if who == 'chintu' else MEERA_COL
    dl.rounded_rectangle((x, cy - 21, x + tgw, cy + 21), radius=21, fill=rgba(col, p))
    dl.text((x + tgw / 2, cy + 1), tag, font=tf, fill=rgba(INK, p), anchor='mm')
    x += tgw + 26
    C = E.CFG
    for w_ in words:
        bare = re.sub(r'[^\w]', '', w_).lower()
        c = PAPER
        if bare in C['CAPTION_TEAL']: c = TEAL
        elif bare in C['CAPTION_CORAL']: c = CORAL
        elif re.fullmatch(r'\d+', bare) or bare in C['CAPTION_GOLD']: c = GOLD
        dl.text((x, cy + 2), w_, font=f, fill=rgba(c, p), anchor='lm')
        x += f.getlength(w_) + sp
E.caption = caption

# ---------------- header: wordmark, series tag, chapter pill, characters ----------------
def cur_chapter(t):
    c = CHAPTERS[0]
    for ch in CHAPTERS:
        if t >= ch[0]: c = ch
    return c

def cur_line(t):
    for ts, key in E.vo_events:
        if ts - 0.05 <= t < ts + E.VODUR[key]: return key, ts
    return None, None

MOOD = {'chintu_h1': 'laugh', 'chintu_h2': 'shock', 'chintu_h3': 'laugh', 'chintu_p1': 'sad', 'chintu_p2': 'laugh',
        'chintu_e1': 'think', 'chintu_e3': 'laugh', 'chintu_m1': 'think', 'chintu_m3': 'shock', 'chintu_w1': 'laugh',
        'chintu_w2': 'think', 'chintu_w3': 'shock', 'chintu_w4': 'shock', 'chintu_w5': 'laugh', 'chintu_r1': 'think',
        'chintu_o1': 'laugh', 'meera_h3': 'laugh', 'meera_e3': 'laugh'}
CX, CY, CS = 250, 520, 0.85
MX, MY = 1670, 520

def draw_cast(dl, t):
    key, ts = cur_line(t)
    sc, name, _ = cur_chapter(t)
    mood_c = mood_m = 'happy'
    if key and key in MOOD:
        m = MOOD[key]
        if m == 'shock' and t - ts > 0.8: m = 'happy'   # shock face hides the mouth: keep it short
        if key.startswith('chintu'): mood_c = m
        else: mood_m = m
    # quiz countdowns: Chintu thinks hard
    for qk, *_ in Q:
        if END(qk) < t < END(qk) + QWAIT: mood_c = 'think'
    outro = name == 'outro'
    wave_c = t < 2.0 or (outro and t > O_SITE)
    wave_m = outro and t > O_SITE
    pt_m = None
    if key and key.startswith('meera') and name not in ('hook', 'recap', 'outro') and not wave_m and int((t - ts) / 2.6) % 2 == 0:
        pt_m = (1330, 470)
    pt_c = (720, 470) if key in ('chintu_e1', 'chintu_m2', 'chintu_w2', 'chintu_r1') else None
    CAST.draw('chintu', dl, CX, CY, CS, mood=mood_c, wave=wave_c, point=None if wave_c else pt_c, look=(0.8, 0))
    CAST.draw('meera', dl, MX, MY, CS, mood=mood_m, wave=wave_m, point=pt_m, look=(-0.8, 0))

def header(dl, L, G):
    t = E.NOW
    f = F('black', 44)
    wv, wc = f.getlength('Vizu'), f.getlength('Code')
    dl.text((54, 62), 'Vizu', font=f, fill=rgba(INK), anchor='lm')
    gtext(L, G, 'Code', 'black', 44, 54 + wv + wc / 2, 64, glow=False)
    st, name, title = cur_chapter(t)
    n = TITLE[name][0]
    s = f'{n} · {title}'
    tw = F('b', 26).getlength(s) + 76
    pill(dl, W - 50 - tw / 2 + 5, 66, tw, 58, INK, None, alpha=0.16)
    pill(dl, W - 50 - tw / 2, 62, tw, 58, PAPER, INK, width=3)
    pill(dl, W - 50 - tw + 28, 62, 14, 14, ORANGE)
    text(dl, s, 'b', 26, W - 50 - tw / 2 + 12, 63, INK)
    draw_cast(dl, t)
E.header = header

def title_card(dl, lt, name):
    if lt > 1.45 or name == 'hook': return
    n, title = TITLE[name]
    a = ease_out(prog(lt, 0, 0.2)) * (1 - prog(lt, 1.15, 1.45))
    sc = back(prog(lt, 0, 0.4))
    w = max(560, F('black', 76).getlength(title) + 160) * sc
    cx, cy = W / 2, 440
    card(dl, (cx - w / 2, cy - 120 * sc, cx + w / 2, cy + 120 * sc), 44 * sc, PAPER, alpha=a, width=6)
    T(dl, f'CHAPTER {n}', 34 * sc, cx, cy - 52 * sc, ORANGE, 'black', alpha=a)
    T(dl, title, 76 * sc, cx, cy + 26 * sc, INK, 'black', alpha=a)

def pa(t0, d=0.35): return back(prog(E.NOW, t0, t0 + d))      # pop-in scale
def fa(t0, d=0.3): return ease_out(prog(E.NOW, t0, t0 + d))     # fade-in

# ---------------- 1 · hook ----------------
def phone_video(dl, cx, cy, s, t, t0):
    w, h = 300 * s, 190 * s
    card(dl, (cx - w / 2 - 14 * s, cy - h / 2 - 14 * s, cx + w / 2 + 14 * s, cy + h / 2 + 14 * s), 26 * s, INK, width=4)
    dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=12 * s, fill=rgba((40, 46, 80)))
    # a little animated scene on screen: sun + hills
    dl.ellipse((cx + 60 * s, cy - 70 * s, cx + 110 * s, cy - 20 * s), fill=rgba(GOLD))
    dl.polygon([(cx - w / 2, cy + h / 2 - 30 * s), (cx - 60 * s, cy - 10 * s), (cx + 40 * s, cy + h / 2 - 30 * s)], fill=rgba(GREEN))
    dl.polygon([(cx - 10 * s, cy + h / 2 - 30 * s), (cx + 90 * s, cy + 5 * s), (cx + w / 2, cy + h / 2 - 30 * s)], fill=rgba((90, 170, 80)))
    pr = clamp((t - t0) / 18)
    dl.rectangle((cx - w / 2 + 10 * s, cy + h / 2 - 18 * s, cx + w / 2 - 10 * s, cy + h / 2 - 12 * s), fill=rgba((90, 96, 130)))
    dl.rectangle((cx - w / 2 + 10 * s, cy + h / 2 - 18 * s, lerp(cx - w / 2 + 10 * s, cx + w / 2 - 10 * s, pr), cy + h / 2 - 12 * s), fill=rgba(CORAL))

def chips(dl, cx, cy, s, t):
    w, h = 150 * s, 200 * s
    wob = math.sin(t * 4) * 0.04
    pts = [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2 * 0.86, cy + h / 2), (cx - w / 2 * 0.86, cy + h / 2)]
    pts = [(x + (y - cy) * wob, y) for x, y in pts]
    dl.polygon(pts, fill=rgba(GOLD), outline=rgba(INK))
    dl.line(pts + pts[:1], fill=rgba(INK), width=5)
    for k in range(6):
        x = cx - w / 2 + k * w / 5
        dl.line([(x, cy - h / 2), (x + w / 10, cy - h / 2 - 10 * s), (x + w / 5, cy - h / 2)], fill=rgba(INK), width=3)
    T(dl, 'CDN', 46 * s, cx, cy - 20 * s, CORAL, 'black')
    T(dl, 'chips', 30 * s, cx, cy + 30 * s, INK, 'xb')
    T(dl, 'masala', 20 * s, cx, cy + 62 * s, SOFT, 'b')

def sc_hook(L, G, dl, dg, lt, dur):
    t = E.NOW
    t_vid = A('chintu_h1', 'video'); t_far = A('chintu_h2', 'America'); t_cdn = A('meera_h2', 'CDN')
    t_chip = A('chintu_h3', 'chips'); t_pz = A('meera_h3', 'Pizza')
    if t < t_vid:   # opening title (fully visible at frame 0)
        a = 1 - prog(t, t_vid - 0.3, t_vid)
        tag_pill(dl, W / 2, 230, 'SYSTEM DESIGN FOR BEGINNERS  ·  PART 2', ORANGE, size=28, alpha=a, fname='black')
        T(dl, 'How does a video', 78, W / 2, 360, INK, 'black', alpha=a)
        T(dl, 'load so fast?', 78, W / 2, 455, INK, 'black', alpha=a)
        gtext(L, G, 'CDN', 'black', 150, W / 2, 610, alpha=a, glow=False)
        return
    if t < t_cdn:
        s = pa(t_vid)
        DL = (700, 470)
        phone_video(dl, DL[0], DL[1], 1.0 * s, t, t_vid)
        tag_pill(dl, DL[0], DL[1] + 160, 'Chintu in Delhi', INK, size=28, sc=s)
        if t >= t_far:
            p = prog(t, t_far, t_far + 0.8)
            US = (1250, 420)
            pts = curve((DL[0] + 170, DL[1] - 40), (US[0] - 95, US[1]), bend=-120)
            dashed(dl, pts[:max(2, int(len(pts) * p))], INK, 0.5, 6)
            server(dl, US[0], US[1], 0.85 * pa(t_far + 0.3), t)
            tag_pill(dl, US[0], US[1] + 150, 'Servers in the USA', BLUE, size=28, sc=pa(t_far + 0.5))
            tag_pill(dl, 975, 265, '12,000+ km away!', CORAL, size=30, fname='black', sc=pa(t_far + 0.8))
            q = pa(A('chintu_h2', 'How'))
            T(dl, '?', 120 * q, 975, 410 + math.sin(t * 5) * 8, ORANGE, 'black')
        return
    s = pa(t_cdn)
    gtext(L, G, 'CDN', 'black', 200, W / 2, 300, scale=s, glow=False)
    a = fa(t_cdn + 0.4)
    if a > 0:
        parts = [('C', ORANGE), ('ontent ', INK), ('D', ORANGE), ('elivery ', INK), ('N', ORANGE), ('etwork', INK)]
        rich(dl, parts, 450, 'black', 56, alpha=a, cx=W / 2)
    if t >= t_chip and t < t_pz:
        chips(dl, W / 2, 680, pa(t_chip), t)
    if t >= t_pz:
        sc = pa(t_pz)
        pizza(dl, W / 2, 680, 110 * sc)
        for k in range(3):
            sy = 680 - 130 - ((t * 0.7 + k / 3) % 1) * 70
            sx = W / 2 - 40 + k * 40 + math.sin(t * 3 + k) * 8
            dl.arc((sx - 10, sy - 18, sx + 10, sy + 18), 270, 90, fill=rgba(SOFT, 0.5 * sc), width=4)

# ---------------- 2 · pizza ----------------
PMAP = (490, 150, 1430, 870)
KIT = (620, 300)
HOUSES = [((1300, 780), BLUE, 'YOU'), ((960, 800), VIOLET, None), ((1310, 420), GREEN, None)]
BRANCH = [(1130, 690), (790, 720), (1150, 330)]
def sc_pizza(L, G, dl, dg, lt, dur):
    t = E.NOW
    m = pa(VS['meera_p1'] - 0.1)
    if m <= 0.02: title_card(dl, lt, 'pizza'); return
    x0, y0, x1, y1 = PMAP
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box = (cx - (cx - x0) * m, cy - (cy - y0) * m, cx + (x1 - cx) * m, cy + (y1 - cy) * m)
    card(dl, box, 34, (226, 242, 214))
    if m < 0.98: title_card(dl, lt, 'pizza'); return
    for k in range(1, 4):   # little roads grid
        yy = y0 + k * (y1 - y0) / 4; xx = x0 + k * (x1 - x0) / 4
        dl.line([(x0 + 8, yy), (x1 - 8, yy)], fill=rgba(PAPER, 0.7), width=10)
        dl.line([(xx, y0 + 8), (xx, y1 - 8)], fill=rgba(PAPER, 0.7), width=10)
    phase2 = t >= TB
    old_a = 1 - 0.75 * prog(t, TB, TB + 0.6)
    t_k = A('meera_p1', 'one kitchen'); t_ord = A('meera_p1', 'Every order')
    paths = [curve((KIT[0] + 60, KIT[1] + 60), (hx, hy - 50), bend=60 * (1 if i % 2 else -1), wig=35) for i, ((hx, hy), c_, l_) in enumerate(HOUSES)]
    pr = fa(t_ord, 1.0)
    for pts in paths: dashed(dl, pts[:max(2, int(len(pts) * pr))], CORAL, 0.6 * old_a, 6)
    kitchen(dl, KIT[0], KIT[1], 0.95 * pa(t_k), t, alpha=old_a)
    if t >= t_k: tag_pill(dl, KIT[0], KIT[1] + 115, 'ONE KITCHEN · far away', CORAL, size=24, fname='black', sc=pa(t_k + 0.2), alpha=old_a)
    for i, ((hx, hy), col, lab) in enumerate(HOUSES):
        house(dl, hx, hy, 0.95 * pa(t_ord + 0.15 * i), col)
        if lab: tag_pill(dl, hx, hy - 95, lab, BLUE, size=24, fname='black', sc=pa(t_ord + 0.3))
    you = HOUSES[0][0]
    if not phase2:   # slow scooter crawling along the long road
        if t >= t_ord:
            q = prog(t, t_ord, TB) * 0.92
            x, y = along(paths[0], q)
            scooter(dl, x, y, 1.0)
            mins = int(lerp(5, 120, prog(t, t_ord, A('chintu_p1', 'two hours'))))
            tag_pill(dl, you[0] - 150, you[1] + 10, f'{mins} min', CORAL, size=30, fname='black')
        tc = A('chintu_p1', 'cold')
        if t >= tc:
            s2 = pa(tc)
            pizza(dl, you[0] - 150, you[1] - 100, 46 * s2, cold=True)
            tag_pill(dl, you[0] - 150, you[1] - 170, 'COLD!', BLUE, size=26, fname='black', sc=s2)
    else:
        for i, (bx, by) in enumerate(BRANCH):
            s3 = pa(TB + i * 0.25)
            shop(dl, bx, by, 0.95 * s3)
            hx, hy = HOUSES[i][0]
            pts = curve((bx + 40, by + 30), (hx - 40, hy - 20), bend=20)
            if s3 > 0.5:
                dashed(dl, pts, TEAL, 0.8, 6)
                q = ((t - TB - i * 0.4) % 1.6) / 1.6
                x, y = along(pts, q)
                scooter(dl, x, y, 0.8)
        tag_pill(dl, BRANCH[0][0], BRANCH[0][1] + 70, 'BRANCH', TEAL, size=22, fname='black', sc=pa(TB + 0.4))
        t15 = A('meera_p4', 'fifteen')
        if t >= t15:
            tag_pill(dl, you[0] - 30, you[1] + 60, '15 min', TEAL, size=30, fname='black', sc=pa(t15))
        th = A('chintu_p2', 'Hot')
        if t >= th:
            pizza(dl, 1390, 600, 40 * pa(th))
            tag_pill(dl, 1370, 530, 'HOT!', CORAL, size=24, fname='black', sc=pa(th + 0.1))
    tk = A('meera_p5', 'Keep')
    if t >= tk:
        a = fa(tk)
        dl.rounded_rectangle(PMAP, radius=34, fill=rgba(PAPER, 0.35 * a))
        grad_banner(L, G, dl, W / 2, 515, 'Keep copies close to people', 820, 110, 46, sc=pa(tk))
    title_card(dl, lt, 'pizza')

# ---------------- 3 · origin vs edge ----------------
MBOX = (490, 140, 1430, 620)
def proj(lon, lat): return (490 + (lon + 170) / 350 * 940, 140 + (80 - lat) / 140 * 480)
CONT = [
    [(-165, 66), (-140, 70), (-95, 72), (-75, 64), (-60, 52), (-67, 45), (-80, 30), (-81, 25), (-97, 26), (-97, 18), (-87, 14),
     (-78, 8), (-105, 20), (-117, 32), (-124, 42), (-125, 50), (-140, 60), (-160, 58)],
    [(-78, 8), (-60, 10), (-50, 0), (-35, -7), (-40, -22), (-58, -38), (-68, -54), (-74, -45), (-71, -18), (-81, -5)],
    [(-75, 78), (-20, 82), (-20, 70), (-45, 60), (-60, 70)],
    [(-10, 36), (-9, 44), (-2, 48), (5, 54), (8, 57), (5, 62), (15, 69), (28, 71), (42, 67), (40, 46), (28, 41), (20, 40), (12, 44), (15, 38), (2, 40)],
    [(-6, 50), (-3, 58), (2, 52)],
    [(-17, 15), (-10, 30), (-5, 36), (10, 37), (32, 31), (43, 12), (51, 11), (40, -5), (40, -15), (32, -28), (20, -35), (13, -18), (9, 4), (-8, 5)],
    [(40, 46), (42, 67), (70, 73), (110, 77), (140, 72), (178, 68), (160, 58), (140, 52), (130, 42), (122, 40), (122, 30), (110, 20),
     (106, 10), (100, 13), (98, 16), (92, 22), (88, 22), (80, 13), (77, 8), (73, 17), (70, 22), (66, 25), (57, 25), (50, 29), (55, 18),
     (44, 12), (35, 30), (36, 36)],
    [(130, 31), (136, 35), (141, 41), (138, 37)],
    [(95, 5), (105, -6), (120, -9), (140, -6), (130, -2), (117, 4), (102, 2)],
    [(114, -22), (130, -12), (142, -11), (153, -27), (146, -39), (135, -35), (115, -34)],
]
USA = proj(-98, 39)
def world_map(dl, a=1.0):
    card(dl, MBOX, 30, OCEAN, alpha=a)
    for poly in CONT:
        pts = [proj(*p) for p in poly]
        dl.polygon(pts, fill=rgba(LAND, a))
        dl.line(pts + pts[:1], fill=rgba((150, 190, 140), a), width=3, joint='curve')

def latency_bar(L, G, dl, y, label, ms, col, p, t0):
    T(dl, label, 30, 520, y, INK, 'black', anchor='lm', alpha=fa(t0))
    bx0 = 790; bw = 560 * ms / 250 * ease_out(p)
    dl.rounded_rectangle((bx0, y - 26, bx0 + 560, y + 26), radius=26, fill=rgba(PAPER, fa(t0)), outline=rgba(INK, 0.3 * fa(t0)), width=3)
    if bw > 4: dl.rounded_rectangle((bx0, y - 26, bx0 + max(bw, 52), y + 26), radius=26, fill=rgba(col), outline=rgba(INK), width=4)
    if p > 0: T(dl, f'{int(ms * ease_out(p))} ms', 34, bx0 + max(bw, 52) + 20, y + 1, col, 'black', anchor='lm')

def sc_edge(L, G, dl, dg, lt, dur):
    t = E.NOW
    m = fa(VS['meera_e1'] - 0.1, 0.4)
    if m > 0: world_map(dl, m)
    if m <= 0.02: title_card(dl, lt, 'edge'); return
    t_o = A('meera_e1', 'origin')
    delhi = proj(77.2, 28.6)
    # packets
    if T_SLOW <= t < T_FAST:
        pts = curve(delhi, USA, bend=-150)
        dashed(dl, pts, CORAL, 0.7, 5)
        q = ((t - T_SLOW) % 2.4) / 2.4
        x, y = along(pts, q * 2 if q < 0.5 else 2 - q * 2)
        envelope(dl, x, y, 0.8)
    if t >= T_FAST:
        q = ((t - T_FAST) % 0.9) / 0.9
        edp = (delhi[0] + 40, delhi[1] - 50)
        dl.line([delhi, edp], fill=rgba(TEAL), width=5)
        x, y = lerp2(delhi, edp, q * 2 if q < 0.5 else 2 - q * 2)
        envelope(dl, x, y, 0.6)
        dl.ellipse((edp[0] - 16, edp[1] - 16, edp[0] + 16, edp[1] + 16), fill=rgba(TEAL), outline=rgba(INK), width=4)
    for j, (lo, la) in enumerate(EXTRA):
        x, y = proj(lo, la)
        pin(dl, x, y, TEAL, 0.8 * pa(T_WORLD + j * 0.08))
    for k, (name, lo, la, (ox, oy)) in enumerate(CITIES):
        x, y = proj(lo, la)
        s = pa(T_CITY[k])
        ring = prog(t, T_CITY[k], T_CITY[k] + 0.7) if t < T_CITY[k] + 0.7 else 0
        pin(dl, x, y, TEAL, 1.1 * s, ring=ring)
        if s > 0.05: tag_pill(dl, x + ox, y + oy, name, INK, size=20, fname='black', sc=s)
    if t >= T_POP:
        r = 26 + 6 * math.sin(t * 6)
        dl.ellipse((delhi[0] - r, delhi[1] - r, delhi[0] + r, delhi[1] + r), outline=rgba(ORANGE), width=5)
        tag_pill(dl, 1250, 205, 'PoP = point of presence', ORANGE, size=24, fname='black', sc=pa(T_POP))
    # origin
    s = pa(t_o)
    server(dl, USA[0], USA[1], 0.42 * s, t, fill=(255, 236, 214))
    if s > 0.05: tag_pill(dl, USA[0], USA[1] - 75, 'ORIGIN · USA', ORANGE, size=22, fname='black', sc=s)
    te = A('meera_e2', 'edge servers')
    if t >= te: tag_pill(dl, 820, 590, 'teal pins = EDGE SERVERS', TEAL, size=22, fname='black', sc=pa(te))
    # latency bars
    if t >= T_SLOW:
        latency_bar(L, G, dl, 705, 'Without CDN', 250, CORAL, prog(t, T_250, T_250 + 0.8), T_SLOW)
    if t >= T_FAST:
        latency_bar(L, G, dl, 805, 'With CDN', 20, TEAL, prog(t, T_20, T_20 + 0.5), T_FAST)
    if t >= T_12X:
        tag_pill(dl, 1250, 860, 'about 12x faster!', ORANGE, size=28, fname='black', sc=pa(T_12X + 0.3))
    title_card(dl, lt, 'edge')

# ---------------- 4 · miss then hit ----------------
U1, EDG, ORG, U2 = (610, 300), (960, 320), (1310, 320), (610, 640)
SHELF = (960, 690)
def sc_miss(L, G, dl, dg, lt, dur):
    t = E.NOW
    t0 = VS['chintu_m1']
    if t < t0: title_card(dl, lt, 'miss'); return
    # links
    a = fa(t0)
    dl.line([(U1[0] + 60, U1[1]), (EDG[0] - 105, U1[1])], fill=rgba(INK, 0.35 * a), width=5)
    dashed(dl, curve((EDG[0] + 100, EDG[1] - 30), (ORG[0] - 105, ORG[1] - 30), bend=-40, wig=8), BLUE, 0.6 * a, 6)
    T(dl, 'far away', 28, 1135, 215, BLUE, 'black', alpha=a)
    person(dl, *U1, 2.2 * pa(t0), BLUE)
    T(dl, 'You (Delhi)', 30, U1[0], U1[1] + 135, INK, 'black', alpha=a)
    hit = t >= M_HIT; miss = M_MISS <= t < M_NEXT
    server(dl, *EDG, 1.0 * pa(t0 + 0.1), t, fill=(222, 248, 242))
    T(dl, 'Edge (Delhi)', 30, EDG[0], EDG[1] + 135, TEAL, 'black', alpha=a)
    server(dl, *ORG, 1.0 * pa(t0 + 0.2), t, fill=(255, 236, 214))
    T(dl, 'Origin (USA)', 30, ORG[0], ORG[1] + 135, ORANGE, 'black', alpha=a)
    # edge cache shelf
    card(dl, (SHELF[0] - 130, SHELF[1] - 66, SHELF[0] + 130, SHELF[1] + 66), 20, PAPER, alpha=a)
    T(dl, 'EDGE CACHE', 24, SHELF[0], SHELF[1] - 38, SOFT, 'black', alpha=a)
    dl.line([(SHELF[0] - 120, SHELF[1] - 20), (SHELF[0] + 120, SHELF[1] - 20)], fill=rgba(INK, 0.2 * a), width=3)
    dl.line([(EDG[0], EDG[1] + 160), (EDG[0], SHELF[1] - 66)], fill=rgba(INK, 0.3 * a), width=4)
    stored = t >= M_COPY + 0.4
    if stored:
        video_file(dl, SHELF[0] - 45, SHELF[1] + 15, 1.3 * pa(M_COPY + 0.4))
        T(dl, 'copy', 30, SHELF[0] + 40, SHELF[1] + 16, TEAL, 'black', alpha=fa(M_COPY + 0.4))
    elif t >= M_REQ:
        T(dl, 'empty', 30, SHELF[0], SHELF[1] + 16, CORAL, 'black', alpha=fa(M_REQ))
    if t0 + 0.5 <= t < M_REQ:
        T(dl, '?', 90, EDG[0], 165 + math.sin(t * 5) * 6, ORANGE, 'black')
    # first request: miss -> origin -> copy -> back
    def fly(a_, b_, ta, d=0.6, what='env'):
        if ta <= t < ta + d:
            x, y = lerp2(a_, b_, ease_in_out((t - ta) / d))
            if what == 'env': envelope(dl, x, y, 0.9)
            else: video_file(dl, x, y, 0.9)
    fly((U1[0] + 60, U1[1]), (EDG[0] - 90, U1[1]), M_REQ)
    fly((EDG[0] + 90, EDG[1] - 30), (ORG[0] - 90, ORG[1] - 30), M_FETCH, 0.9)
    fly((ORG[0] - 90, ORG[1] + 10), (SHELF[0] + 60, SHELF[1] - 10), M_COPY - 0.4, 0.8, 'vid')
    fly((SHELF[0] - 100, SHELF[1]), (U1[0] + 40, U1[1] + 40), M_COPY + 0.5, 0.6, 'vid')
    if miss:
        tag_pill(dl, EDG[0], 160, 'CACHE MISS', CORAL, size=32, fname='black', sc=pa(M_MISS))
    if t >= M_COPY + 1.1:
        tag_pill(dl, U1[0], U1[1] + 190, 'slow: ~250 ms', CORAL, size=26, fname='black', sc=pa(M_COPY + 1.1))
    # second person: hit
    if t >= M_NEXT:
        person(dl, *U2, 2.2 * pa(M_NEXT), VIOLET)
        T(dl, 'Next person', 30, U2[0], U2[1] + 135, INK, 'black', alpha=fa(M_NEXT))
        fly((U2[0] + 60, U2[1]), (SHELF[0] - 135, SHELF[1]), M_HAS - 0.3, 0.5)
        fly((SHELF[0] - 135, SHELF[1] + 10), (U2[0] + 50, U2[1] + 20), M_HIT + 0.1, 0.35, 'vid')
    if hit:
        tag_pill(dl, EDG[0], 160, 'CACHE HIT', TEAL, size=32, fname='black', sc=pa(M_HIT))
        tag_pill(dl, U2[0] + 230, U2[1] + 135, 'fast: ~20 ms', TEAL, size=26, fname='black', sc=pa(M_HIT + 0.5))
    if t >= M_EP:
        s = pa(M_EP)
        card(dl, (1270 - 170 * s, 640 - 70 * s, 1270 + 170 * s, 640 + 70 * s), 26, (255, 246, 220))
        T(dl, 'Remember Part 1?', 24 * s, 1270, 612, SOFT, 'black')
        T(dl, 'Caching', 46 * s, 1270, 658, ORANGE, 'black')
    if t >= M_WORLD:
        dl.rounded_rectangle((470, 130, 1450, 880), radius=40, fill=rgba(PAPER, 0.3 * fa(M_WORLD)))
        grad_banner(L, G, dl, W / 2, 470, 'CDN = caching, worldwide', 780, 110, 46, sc=pa(M_WORLD))
    title_card(dl, lt, 'miss')

# ---------------- 5 · what goes on a CDN ----------------
def icon_card(dl, cx, cy, s, kind, label, col, alpha=1.0):
    if s <= 0.03: return
    w, h = 190 * s, 200 * s
    card(dl, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 26 * s, PAPER, alpha=alpha)
    ix, iy = cx, cy - 25 * s
    ink = rgba(INK, alpha)
    if kind == 'img':
        dl.rounded_rectangle((ix - 55 * s, iy - 40 * s, ix + 55 * s, iy + 40 * s), radius=10 * s, fill=rgba((200, 228, 255), alpha), outline=ink, width=4)
        dl.polygon([(ix - 50 * s, iy + 36 * s), (ix - 15 * s, iy - 5 * s), (ix + 20 * s, iy + 36 * s)], fill=rgba(GREEN, alpha))
        dl.ellipse((ix + 15 * s, iy - 30 * s, ix + 38 * s, iy - 7 * s), fill=rgba(GOLD, alpha))
    elif kind == 'vid':
        video_file(dl, ix, iy, 1.6 * s, alpha)
    elif kind == 'code':
        dl.rounded_rectangle((ix - 55 * s, iy - 40 * s, ix + 55 * s, iy + 40 * s), radius=10 * s, fill=rgba(INK, alpha))
        text(dl, label[:3] if label != 'JavaScript' else 'JS', 'mono', 38 * s, ix, iy, col, alpha=alpha)
    elif kind == 'book':
        dl.rounded_rectangle((ix - 45 * s, iy - 50 * s, ix + 45 * s, iy + 50 * s), radius=8 * s, fill=rgba(BLUE, alpha), outline=ink, width=4)
        for k in range(3): dl.line([(ix - 25 * s, iy - 20 * s + k * 18 * s), (ix + 25 * s, iy - 20 * s + k * 18 * s)], fill=rgba(PAPER, alpha), width=4)
    elif kind == 'lunch':
        dl.rounded_rectangle((ix - 60 * s, iy - 30 * s, ix + 60 * s, iy + 40 * s), radius=14 * s, fill=rgba(CORAL, alpha), outline=ink, width=4)
        dl.arc((ix - 25 * s, iy - 60 * s, ix + 25 * s, iy - 10 * s), 180, 360, fill=ink, width=6)
        dl.line([(ix - 60 * s, iy), (ix + 60 * s, iy)], fill=ink, width=3)
    elif kind == 'bank':
        dl.rounded_rectangle((ix - 62 * s, iy - 38 * s, ix + 62 * s, iy + 38 * s), radius=10 * s, fill=rgba(VIOLET, alpha), outline=ink, width=4)
        dl.rectangle((ix - 62 * s, iy - 20 * s, ix + 62 * s, iy - 6 * s), fill=ink)
        dl.rounded_rectangle((ix - 48 * s, iy + 10 * s, ix - 14 * s, iy + 26 * s), radius=4 * s, fill=rgba(GOLD, alpha))
    T(dl, label, fit(label, 'black', 28, 170) * s, cx, cy + 65 * s, INK, 'black', alpha=alpha)

FILES = [('img', 'Images', BLUE), ('vid', 'Videos', CORAL), ('code', 'CSS', TEAL), ('code', 'JavaScript', GOLD)]
def sc_what(L, G, dl, dg, lt, dur):
    t = E.NOW
    if t < W_FILES[0]:
        if t >= W_HW: icon_card(dl, 800, 420, pa(W_HW), 'book', 'Homework?', BLUE)
        if t >= W_LUNCH:
            icon_card(dl, 1120, 420, pa(W_LUNCH), 'lunch', 'Lunch?', CORAL)
            if t >= W_NOT + 0.2: cross_mark(dl, 1120, 400, 70, rgba(CORAL), 14, prog(t, W_NOT + 0.2, W_NOT + 0.5))
    else:
        for i, (kind, lab, col) in enumerate(FILES):
            icon_card(dl, 620 + i * 227, 360, pa(W_FILES[i]), kind, lab, col)
        ts_ = W_FILES[-1] + 0.6
        if t >= ts_:
            server(dl, 760, 700, 0.75 * pa(ts_), t, fill=(222, 248, 242))
            tag_pill(dl, 760, 830, 'served from the EDGE', TEAL, size=22, fname='black', sc=pa(ts_ + 0.2))
            for i in range(4):
                q = prog(t, ts_ + i * 0.15, ts_ + i * 0.15 + 0.6)
                if 0 < q < 1:
                    x, y = lerp2((620 + i * 227, 450), (760, 640), ease_in_out(q))
                    file_badge(dl, x, y, None, FILES[i][2], 0.8)
            check_mark(dl, 860, 640, 34, rgba(TEAL), 10, prog(t, ts_ + 0.8, ts_ + 1.1))
    if t >= W_STATIC:
        tag_pill(dl, W / 2, 205, 'STATIC FILES = same for everyone', ORANGE, size=28, fname='black', sc=pa(W_STATIC))
    if t >= W_BANK:
        icon_card(dl, 1180, 690, pa(W_BANK) * 0.9, 'bank', 'Bank balance', VIOLET)
        if t >= W_PERS:
            tag_pill(dl, 1180, 560, 'personal + changes', CORAL, size=22, fname='black', sc=pa(W_PERS))
        if t >= W_ORIG:
            tag_pill(dl, 1180, 835, 'comes from the ORIGIN', ORANGE, size=22, fname='black', sc=pa(W_ORIG))
    title_card(dl, lt, 'what')

# ---------------- 6 · protecting the origin ----------------
EDGES3 = [(660, 500), (960, 500), (1260, 500)]
OR6 = (960, 235)
import random as _rnd
_R = _rnd.Random(3)
CROWD = [(_R.uniform(520, 1400), _R.uniform(0, 1), _R.choice([CORAL, TEAL, BLUE, VIOLET, ORANGE, GREEN]), _R.uniform(0, 1)) for _ in range(30)]
def sc_protect(L, G, dl, dg, lt, dur):
    t = E.NOW
    t0 = VS['meera_w4']
    if t < t0: title_card(dl, lt, 'protect'); return
    a = fa(t0)
    for ex, ey in EDGES3:
        dl.line([(ex, ey - 70), (OR6[0], OR6[1] + 85)], fill=rgba(INK, 0.25 * a), width=4)
    server(dl, *OR6, 0.85 * pa(t0), t, fill=(255, 236, 214))
    tag_pill(dl, OR6[0] + 180, OR6[1] - 40, 'ORIGIN', ORANGE, size=30, fname='black', sc=pa(t0 + 0.2))
    for i, (ex, ey) in enumerate(EDGES3):
        server(dl, ex, ey, 0.68 * pa(t0 + 0.2 + i * 0.1), t, fill=(222, 248, 242))
    tag_pill(dl, EDGES3[0][0] - 120, EDGES3[0][1], 'EDGE', TEAL, size=26, fname='black', sc=pa(t0 + 0.5))
    n = 10 if t < P_IPL else 30
    for k, (x, ry, col, ph) in enumerate(CROWD[:n]):
        y = 760 + ry * 70
        s = 0.75 * pa((t0 if k < 10 else P_IPL) + 0.3 + (k % 10) * 0.04)
        person(dl, x, y + math.sin(t * 6 + ph * 6) * 4 * (t >= P_IPL), s, col)
    # requests: lots stop at the edges, a rare one goes to the origin
    rate = 1.0 if t < P_IPL else 3.0
    for k in range(int(n * 0.6)):
        x, ry, col, ph = CROWD[k]
        q = ((t * rate * 0.5 + ph) % 1)
        tgt = min(EDGES3, key=lambda e: abs(e[0] - x))
        px, py = lerp2((x, 740 + ry * 70), (tgt[0], tgt[1] + 60), q)
        dl.ellipse((px - 7, py - 7, px + 7, py + 7), fill=rgba(GOLD, a), outline=rgba(INK, a), width=2)
    q = (t * 0.35) % 1
    px, py = lerp2((EDGES3[2][0], EDGES3[2][1] - 70), (OR6[0] + 40, OR6[1] + 85), q)
    dl.ellipse((px - 7, py - 7, px + 7, py + 7), fill=rgba(GOLD, a), outline=rgba(INK, a), width=2)
    if t >= P_STOP:
        tag_pill(dl, 1290, 640, 'most requests stop here', TEAL, size=26, fname='black', sc=pa(P_STOP))
    if t >= P_CALM:
        tag_pill(dl, OR6[0] - 180, OR6[1] - 40, 'calm', TEAL, size=30, fname='black', sc=pa(P_CALM))
    if P_IPL <= t < P_SALE:
        tag_pill(dl, W / 2, 640, 'IPL FINAL', ORANGE, size=30, fname='black', sc=pa(P_IPL))
    elif t >= P_SALE:
        tag_pill(dl, W / 2, 640, 'BIG SALE', CORAL, size=30, fname='black', sc=pa(P_SALE))
    if t >= P_SAFE:
        s = pa(P_SAFE)
        tag_pill(dl, OR6[0] + 230, OR6[1] + 50, 'origin safe', TEAL, size=30, fname='black', sc=s)
    title_card(dl, lt, 'protect')

# ---------------- 7 · TTL & purge ----------------
OR7 = (960, 230)
def sc_ttl(L, G, dl, dg, lt, dur):
    t = E.NOW
    t0 = VS['chintu_w4']
    if t < t0: title_card(dl, lt, 'ttl'); return
    a = fa(t0)
    v2 = t >= X_CHG
    for ex, ey in EDGES3:
        dl.line([(ex, ey - 70), (OR7[0], OR7[1] + 85)], fill=rgba(INK, 0.25 * a), width=4)
    server(dl, *OR7, 0.8 * pa(t0), t, fill=(255, 236, 214))
    T(dl, 'ORIGIN', 30, OR7[0] - 150, OR7[1], ORANGE, 'black', alpha=a)
    sv = pa(X_CHG) if v2 else 1
    file_badge(dl, OR7[0] + 115, OR7[1] - 10, 'logo v2' if v2 else 'logo v1', GOLD if v2 else SOFT, 1.3 * sv)
    for i, (ex, ey) in enumerate(EDGES3):
        server(dl, ex, ey, 0.7 * pa(t0 + 0.15 + i * 0.1), t, fill=(222, 248, 242))
        fy = ey + 125
        if i == 0:
            fresh = t >= X_FRESH + 0.5
            if fresh:
                file_badge(dl, ex - 50, fy, 'logo v2', TEAL, 1.3 * pa(X_FRESH + 0.5))
            else:
                file_badge(dl, ex - 50, fy, 'logo v1', CORAL if t >= X_OLD else SOFT, 1.3)
            if t >= X_TTL:
                frac = 1 - prog(t, X_TTL + 0.3, X_FRESH)
                if fresh: frac = prog(t, X_FRESH + 0.5, X_FRESH + 1.0)
                ring_timer(dl, ex - 60, fy + 120, 46, frac, TEAL if fresh else ORANGE, 12, alpha=fa(X_TTL))
                T(dl, 'TTL', 28, ex - 60, fy + 121, INK, 'black', alpha=fa(X_TTL))
                tag_pill(dl, ex + 95, fy + 120, 'time to live', ORANGE, size=24, fname='black', sc=pa(X_TTL + 0.2))
            if X_FRESH <= t < X_FRESH + 0.6:
                x, y = lerp2((OR7[0] - 60, OR7[1] + 60), (ex - 50, fy), ease_in_out((t - X_FRESH) / 0.6))
                file_badge(dl, x, y, None, GOLD, 0.8)
        else:
            gone = t >= X_DEL + 0.3 + i * 0.15
            if not gone:
                file_badge(dl, ex - 50, fy, 'logo v1', CORAL if t >= X_OLD else SOFT, 1.3)
                if t >= X_DEL:
                    cross_mark(dl, ex, fy, 34, rgba(CORAL), 10, prog(t, X_DEL + i * 0.15, X_DEL + 0.3 + i * 0.15))
            else:
                T(dl, 'deleted', 30, ex, fy, SOFT, 'black', alpha=fa(X_DEL + 0.3 + i * 0.15))
    if t >= X_OLD and t < X_TTL:
        tag_pill(dl, W / 2, 800, 'edges still have the OLD file!', CORAL, size=30, fname='black', sc=pa(X_OLD))
    if t >= X_PURGE:
        s = pa(X_PURGE)
        tag_pill(dl, 1130, 800, 'PURGE: delete it everywhere, now', CORAL, size=28, fname='black', sc=s)
        q = prog(t, X_DEL, X_DEL + 0.8)
        if 0 < q < 1:
            x = lerp(820, 1420, q)
            dl.rounded_rectangle((x - 10, 440, x + 10, 680), radius=10, fill=rgba(CORAL, 0.6))
    if t >= X_RC:
        s = pa(X_RC) * (1 - prog(t, X_RC + 1.6, X_RC + 2.1))
        if s > 0.03:
            card(dl, (W / 2 - 120 * s, 380 - 70 * s, W / 2 + 120 * s, 380 + 70 * s), 18, (255, 250, 236))
            T(dl, 'REPORT CARD', 20 * s, W / 2, 345, SOFT, 'black')
            T(dl, 'Maths: D', 40 * s, W / 2, 395, CORAL, 'black')
    title_card(dl, lt, 'ttl')

# ---------------- 8 · real life ----------------
def app_icon(dl, cx, cy, s, kind):
    ink = rgba(INK)
    if kind == 'yt':
        dl.rounded_rectangle((cx - 60 * s, cy - 42 * s, cx + 60 * s, cy + 42 * s), radius=22 * s, fill=rgba((235, 64, 64)), outline=ink, width=4)
        dl.polygon([(cx - 14 * s, cy - 20 * s), (cx - 14 * s, cy + 20 * s), (cx + 22 * s, cy)], fill=rgba(PAPER))
    elif kind == 'nf':
        dl.rounded_rectangle((cx - 60 * s, cy - 42 * s, cx + 60 * s, cy + 42 * s), radius=10 * s, fill=rgba(INK), outline=ink, width=4)
        for k in range(5):
            x = cx - 48 * s + k * 24 * s
            for y in (cy - 34 * s, cy + 26 * s):
                dl.rectangle((x, y, x + 10 * s, y + 8 * s), fill=rgba(PAPER))
        dl.rectangle((cx - 40 * s, cy - 18 * s, cx + 40 * s, cy + 18 * s), fill=rgba(CORAL))
    else:
        dl.rounded_rectangle((cx - 50 * s, cy - 45 * s, cx + 50 * s, cy + 45 * s), radius=24 * s, fill=rgba(VIOLET), outline=ink, width=4)
        dl.ellipse((cx - 22 * s, cy - 22 * s, cx + 22 * s, cy + 22 * s), outline=rgba(PAPER), width=max(2, int(7 * s)))
        dl.ellipse((cx + 26 * s, cy - 34 * s, cx + 36 * s, cy - 24 * s), fill=rgba(PAPER))

APPS = [('yt', 'YouTube', 'videos near you'), ('nf', 'Netflix', 'shows near you'), ('ig', 'Instagram', 'photos from an edge')]
PROVS = ['Cloudflare', 'Akamai', 'Amazon CloudFront']
def sc_real(L, G, dl, dg, lt, dur):
    t = E.NOW
    for i, (kind, name, sub) in enumerate(APPS):
        s = pa(R_APPS[i])
        if s <= 0.03: continue
        cx, cy = 640 + i * 320, 350
        card(dl, (cx - 140 * s, cy - 140 * s, cx + 140 * s, cy + 140 * s), 30 * s, PAPER)
        app_icon(dl, cx, cy - 40 * s, s, kind)
        T(dl, name, 38 * s, cx, cy + 50 * s, INK, 'black')
        T(dl, sub, 22 * s, cx, cy + 95 * s, SOFT, 'b')
    t1 = A('chintu_r1')
    if t >= t1:
        T(dl, 'Who runs the edges?', 40, W / 2, 590, INK, 'black', alpha=fa(t1))
    for i, p in enumerate(PROVS):
        s = pa(R_PROV[i])
        if s > 0.03:
            xs = [700, 960, 1250][i]
            tag_pill(dl, xs, 700, p, [ORANGE, CORAL, BLUE][i], size=32, fname='black', sc=s)
    t2 = A('meera_r4', 'anyone')
    if t >= t2:
        tag_pill(dl, W / 2, 820, 'anyone can rent one', TEAL, size=26, fname='black', sc=pa(t2))
    title_card(dl, lt, 'real')

# ---------------- 9 · recap ----------------
RECAP = [('1', 'Origin', 'the main server = main kitchen', ORANGE),
         ('2', 'Edge server', 'a nearby copy = local branch', TEAL),
         ('3', 'Cache hit at the edge', 'already close by, super fast', BLUE),
         ('4', 'TTL / Purge', 'how long a copy lives / delete early', CORAL)]
def sc_recap(L, G, dl, dg, lt, dur):
    t = E.NOW
    for i, (n, title, sub, col) in enumerate(RECAP):
        p = prog(t, C_T[i], C_T[i] + 0.4)
        if p <= 0: continue
        s = back(p)
        cx, cy = [720, 1200][i % 2], [330, 640][i // 2]
        w, h = 450 * s, 250 * s
        card(dl, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 32 * s, PAPER)
        dl.ellipse((cx - 30 * s, cy - h / 2 + 20 * s, cx + 30 * s, cy - h / 2 + 80 * s), fill=rgba(col), outline=rgba(INK), width=4)
        T(dl, n, 34 * s, cx, cy - h / 2 + 51 * s, PAPER, 'black')
        T(dl, title, fit(title, 'black', 42, 410) * s, cx, cy + 10 * s, INK, 'black')
        T(dl, sub, fit(sub, 'b', 24, 410) * s, cx, cy + 66 * s, SOFT, 'b')
    title_card(dl, lt, 'recap')

# ---------------- 10 · quiz ----------------
def wrap(s, fname, size, maxw):
    lines, cur = [], ''
    for w_ in s.split():
        nxt = (cur + ' ' + w_).strip()
        if F(fname, size).getlength(nxt) > maxw and cur: lines.append(cur); cur = w_
        else: cur = nxt
    return lines + [cur]

def sc_quiz(L, G, dl, dg, lt, dur):
    t = E.NOW
    if t < VS['chintu_q1']:
        s = pa(VS['meera_q0'])
        gtext(L, G, 'QUIZ TIME', 'black', 130, W / 2, 380, scale=s, glow=False)
        tag_pill(dl, W / 2, 530, '3 questions · 3 seconds each', INK, size=30, fname='black', sc=pa(VS['meera_q0'] + 0.4))
        title_card(dl, lt, 'quiz'); return
    qi = max(i for i, q in enumerate(Q) if t >= VS[q[0]] - 0.2)
    qk, ak, qtext, opts, ans, expl = Q[qi]
    t0 = VS[qk]
    s = pa(t0 - 0.2)
    card(dl, (W / 2 - 470 * s, 250 - 110 * s, W / 2 + 470 * s, 250 + 110 * s), 34 * s, PAPER)
    T(dl, f'QUESTION {qi + 1} / 3', 26 * s, W / 2, 175, ORANGE, 'black')
    for j, ln in enumerate(wrap(qtext, 'black', 40, 860)):
        T(dl, ln, 40 * s, W / 2, 232 + j * 54, INK, 'black')
    ta = VS[ak]; revealed = t >= ta
    n = len(opts)
    for j, o in enumerate(opts):
        so = pa(t0 + 0.5 + j * 0.15)
        if so <= 0.03: continue
        x = W / 2 + (j - (n - 1) / 2) * (340 if n == 3 else 380)
        good = revealed and j == ans
        dim = revealed and j != ans
        col = TEAL if good else INK
        fill = (214, 246, 238) if good else PAPER
        size = fit(o, 'black', 34, 300)
        tag_pill(dl, x, 445, o, col, fill=fill, size=size, fname='black', sc=so * (1.08 if good else 1), alpha=0.45 if dim else 1)
    te = END(qk)
    if te <= t < ta:   # countdown
        u = t - te - 0.2
        num = 3 - int(clamp(u, 0, 2.99))
        frac = 1 - clamp(u / 3)
        ring_timer(dl, W / 2, 650, 92, frac, CORAL if num == 1 else ORANGE, 16)
        T(dl, str(num), 96 * (1 + 0.15 * (1 - (u % 1))) if u > 0 else 96, W / 2, 652, INK, 'black')
    if revealed:
        sa = pa(ta)
        card(dl, (W / 2 - 470 * sa, 650 - 75 * sa, W / 2 + 470 * sa, 650 + 75 * sa), 30 * sa, (214, 246, 238), outline=INK)
        check_mark(dl, W / 2 - 410, 650, 34, rgba(TEAL), 11, prog(t, ta + 0.1, ta + 0.4))
        T(dl, expl, fit(expl, 'black', 36, 780) * sa, W / 2 + 30, 652, INK, 'black')
        burst(dl, dg, W / 2, 650, t - ta)
    title_card(dl, lt, 'quiz')

# ---------------- 11 · outro ----------------
def db_icon(dl, cx, cy, s, col):
    for k in range(3):
        y = cy + (k - 1) * 30 * s
        dl.rounded_rectangle((cx - 40 * s, y - 14 * s, cx + 40 * s, y + 14 * s), radius=14 * s, fill=rgba(col), outline=rgba(INK), width=4)

def sc_outro(L, G, dl, dg, lt, dur):
    t = E.NOW
    if t >= O_NEXT:
        s = pa(O_NEXT)
        card(dl, (W / 2 - 440 * s, 220 - 95 * s, W / 2 + 440 * s, 220 + 95 * s), 34 * s, PAPER)
        for k in range(3): db_icon(dl, W / 2 - 375 * s + k * 50 * s, 220 + (k - 1) * 10 * s, 0.55 * s, [ORANGE, TEAL, VIOLET][k])
        T(dl, 'NEXT EPISODE', 26 * s, W / 2 + 95 * s, 180, ORANGE, 'black')
        T(dl, 'Database Sharding', 56 * s, W / 2 + 95 * s, 238, INK, 'black')
    if t >= O_SITE:
        sc = pa(O_SITE)
        f = F('black', 96)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 96 * sc, x0, 430, INK, anchor='lm')
        gtext(L, G, 'Code', 'black', 96, x0 + wv * sc + wc * sc / 2, 434, scale=sc, glow=False)
        b = prog(t, O_SITE + 0.3, O_SITE + 0.7)
        if b > 0:
            s2 = back(b) * (1 + 0.025 * math.sin(t * 5))
            grad_banner(L, G, dl, W / 2, 570, 'vizucode.site', 560, 110, 52, sc=s2)
        g = fa(O_FOLLOW)
        if g > 0:
            iy = 710; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(INK, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(INK, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(INK, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, INK, anchor='lm', alpha=g)
    title_card(dl, lt, 'outro')

E.SCENES.update(hook=sc_hook, pizza=sc_pizza, edge=sc_edge, miss=sc_miss, what=sc_what, protect=sc_protect, ttl=sc_ttl,
                real=sc_real, recap=sc_recap, quiz=sc_quiz, outro=sc_outro)

# ---------------- thumbnail ----------------
def thumbnail(path):
    E.NOW = 1.0
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); G = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dl = ImageDraw.Draw(L, 'RGBA')
    tag_pill(dl, W / 2, 150, 'SYSTEM DESIGN FOR BEGINNERS', ORANGE, size=40, fname='black')
    gtext(L, G, 'CDN', 'black', 380, W / 2, 470, glow=False)
    T(dl, 'explained with pizza', 74, W / 2, 735, INK, 'black')
    pizza(dl, W / 2 + 420, 300, 85)
    chintu(dl, 300, 470, 1.25, 1.0, mood='laugh', wave=True, look=(0.8, 0))
    meera(dl, 1620, 470, 1.25, 1.0, mood='happy', point=(1250, 470), look=(-0.8, 0))
    f = F('black', 50); wv = f.getlength('Vizu')
    dl.text((60, 1010), 'Vizu', font=f, fill=rgba(INK), anchor='lm')
    gtext(L, G, 'Code', 'black', 50, 60 + wv + f.getlength('Code') / 2, 1012, glow=False)
    tag_pill(dl, 1700, 1010, 'PART 2', CORAL, size=36, fname='black')
    base = E.BGIMG.copy().convert('RGBA'); base.alpha_composite(L)
    base.convert('RGB').resize((1280, 720), Image.LANCZOS).save(path)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[2] == 'thumb':
        thumbnail(sys.argv[1])
    else:
        E.main()
