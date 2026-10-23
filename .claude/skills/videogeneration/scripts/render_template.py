"""VizuCode teaching reel renderer — 1080x1920, 30fps.

Copy this file into a work dir that contains vo/lines.txt + vo/<key>.wav (made by make_vo.sh), then:
    python3 render.py <out.mp4>                      # full render
    python3 render.py <stills_dir> stills 5,12,30    # preview PNGs at those seconds

Sections marked GENERIC are the engine (background, glow, captions, audio, encode) — leave them alone.
Sections marked PROBLEM-SPECIFIC (timeline + scene functions + SCENES map) are what you rewrite per problem.
This template ships with LeetCode 217 Contains Duplicate as a complete working example.
"""
import math, os, re, subprocess, sys, wave, random
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.environ.get('VIDEOGEN_FONTS', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts'))
VO = os.path.join(HERE, 'vo')
W, H, FPS = 1080, 1920, 30
SR = 48000

# ---------------- palette ----------------
BG = (11, 15, 28)
WHITE = (245, 247, 250)
MUTED = (148, 163, 184)
ORANGE = (255, 154, 60)
GOLD = (255, 186, 73)
CORAL = (255, 94, 98)
TEAL = (45, 212, 191)
CELL = (21, 28, 47)
CELL_LINE = (56, 70, 102)
G1, G2 = (255, 190, 70), (255, 92, 98)


@lru_cache(None)
def F(name, size):
    file = {'black': 'Poppins-Black.ttf', 'xb': 'Poppins-ExtraBold.ttf', 'b': 'Poppins-Bold.ttf',
            'sb': 'Poppins-SemiBold.ttf', 'm': 'Poppins-Medium.ttf', 'mono': 'JBMono.ttf',
            'monor': 'JBMonoR.ttf'}[name]
    return ImageFont.truetype(os.path.join(FONTS, file), max(1, int(size)))


# ---------------- easing ----------------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, a, b): return clamp((t - a) / (b - a)) if b > a else float(t >= a)
def ease_out(x): return 1 - (1 - x) ** 3
def ease_in_out(x): return 3 * x * x - 2 * x * x * x
def back(x, s=1.9):
    x -= 1
    return x * x * ((s + 1) * x + s) + 1
def lerp(a, b, x): return a + (b - a) * x


# ================= GENERIC: voiceover loading + caption chunking =================
vo_events = []   # (time, key)
sfx = []         # (time, kind): pop | tick | whoosh | buzz | ding | win
captions = []    # (start, end, text)

def wav_read(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a

VOTEXT = dict(l.strip().split('|', 1) for l in open(os.path.join(VO, 'lines.txt')) if '|' in l)
VOAUD = {k: wav_read(os.path.join(VO, k + '.wav')) for k in VOTEXT}
VODUR = {k: len(v) / SR for k, v in VOAUD.items()}

# ================= PROBLEM-SPECIFIC: timeline =================
# Header pill text and the example array.
HEADER_TAG = 'Arrays & Hashing · Easy'
ARR = [3, 7, 1, 9, 7, 4]

def add_vo(t, key):
    vo_events.append((t, key))
    words = VOTEXT[key].replace('vizu code dot site', 'vizucode.site').replace('vizu code', 'vizucode').split()
    chunks, cur = [], []
    for w_ in words:
        cur.append(w_)
        if len(' '.join(cur)) >= 14 or w_[-1] in '.?!:,' or len(cur) >= 3:
            chunks.append(' '.join(cur)); cur = []
    if cur: chunks.append(' '.join(cur))
    total = sum(len(c) + 4 for c in chunks)
    d, s = VODUR[key] - 0.15, t + 0.05
    for c in chunks:
        e = s + d * (len(c) + 4) / total
        captions.append((s, e, c)); s = e

scenes = []  # (name, start, dur, extra)
t = 0.0
def scene(name, dur, extra=None):
    global t
    scenes.append((name, t, dur, extra or {}))
    t += dur

add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.5)
sfx.append((t - 0.05, 'whoosh')); add_vo(t + 0.2, 'problem'); scene('problem', 0.2 + VODUR['problem'] + 0.6)
sfx.append((t - 0.05, 'whoosh')); add_vo(t + 0.2, 'brute')
bstart = t; scene('brute', 0.2 + VODUR['brute'] + 0.8)
pairs = [(i, j) for i in range(6) for j in range(i + 1, 6)]
for k in range(len(pairs)):
    sfx.append((bstart + 0.6 + k * 0.17, 'tick'))
sfx.append((bstart + 3.55, 'buzz'))
sfx.append((t - 0.05, 'whoosh')); add_vo(t + 0.2, 'idea')
istart = t; scene('idea', 0.2 + VODUR['idea'] + 0.6)
sfx.append((istart + 1.3, 'pop'))
# walkthrough
sfx.append((t - 0.05, 'whoosh'))
wstart = t
steps, cur = [], 0.7
for k in range(5):
    d = VODUR[f'w{k}'] + (1.7 if k == 4 else 0.45)
    steps.append((cur, d))
    add_vo(wstart + cur + 0.1, f'w{k}')
    if k < 4: sfx.append((wstart + cur + 1.0, 'pop'))
    else:
        sfx.append((wstart + cur + 0.6, 'ding'))
        sfx.append((wstart + cur + 1.25, 'win'))
    cur += d
scene('walk', cur, {'steps': steps})
sfx.append((t - 0.05, 'whoosh')); add_vo(t + 0.2, 'code'); scene('code', 0.2 + VODUR['code'] + 0.8)
sfx.append((t - 0.05, 'whoosh')); add_vo(t + 0.2, 'outro')
ostart = t; scene('outro', 0.2 + VODUR['outro'] + 1.6)
sfx.append((ostart + 3.2, 'pop'))
TOTAL = t
NFRAMES = int(math.ceil(TOTAL * FPS))


# ================= GENERIC: background, helpers =================
# ---------------- background ----------------
def make_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    img = np.zeros((H, W, 3), np.float32) + np.array(BG, np.float32)
    def blob(cx, cy, r, col, a):
        d = np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))
        return d[..., None] * np.array(col, np.float32) * a
    img += blob(W * 0.85, 120, 520, ORANGE, 0.16)
    img += blob(W * 0.1, H * 0.78, 560, TEAL, 0.09)
    img += blob(W * 0.5, H * 0.45, 700, (70, 90, 180), 0.08)
    grid = ((x % 60) < 1.5) | ((y % 60) < 1.5)
    img += grid[..., None] * 7
    v = ((x - W / 2) / W) ** 2 + ((y - H / 2) / H) ** 2
    img *= (1 - 0.9 * v)[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
BGIMG = make_bg()

random.seed(7)
DUST = [(random.uniform(0, W), random.uniform(0, H), random.uniform(1.5, 3.5), random.uniform(8, 25),
         random.uniform(0, 6.28)) for _ in range(45)]


# ---------------- drawing helpers ----------------
@lru_cache(256)
def grad_text_img(s, fname, size, c1=G1, c2=G2):
    f = F(fname, size)
    l, tp, r, b = f.getbbox(s)
    w, h = r - l + 8, b - tp + 8
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).text((4 - l, 4 - tp), s, font=f, fill=255)
    gx = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    col = np.array(c1, np.float32) * (1 - gx) + np.array(c2, np.float32) * gx
    col = np.repeat(col, h, axis=0)
    im = Image.fromarray(col.astype(np.uint8)).convert('RGBA')
    im.putalpha(mask)
    return im

def paste_c(layer, im, cx, cy, scale=1.0, alpha=1.0):
    if scale <= 0.02 or alpha <= 0.01: return
    if abs(scale - 1) > 0.01:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    if alpha < 0.999:
        a = im.getchannel('A').point(lambda p: int(p * alpha))
        im = im.copy(); im.putalpha(a)
    layer.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def gtext(L, G, s, fname, size, cx, cy, scale=1.0, alpha=1.0, glow=True, c1=G1, c2=G2):
    im = grad_text_img(s, fname, size, c1, c2)
    paste_c(L, im, cx, cy, scale, alpha)
    if glow: paste_c(G, im, cx, cy, scale, alpha * 0.8)

def text(d, s, fname, size, cx, cy, fill=WHITE, anchor='mm', alpha=1.0, stroke=0, stroke_fill=(0, 0, 0)):
    if alpha <= 0.01: return
    fill = tuple(fill[:3]) + (int(255 * alpha),)
    sf = tuple(stroke_fill[:3]) + (int(255 * alpha),)
    d.text((cx, cy), s, font=F(fname, size), fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=sf)

def rgba(c, a=1.0): return tuple(c[:3]) + (int(255 * clamp(a)),)

def cell(dl, dg, cx, cy, size, val, state='idle', s=1.0, alpha=1.0):
    if s <= 0.02 or alpha <= 0.01: return
    z = size * s
    box = (cx - z / 2, cy - z / 2, cx + z / 2, cy + z / 2)
    border = {'idle': CELL_LINE, 'active': ORANGE, 'done': (40, 120, 112), 'found': CORAL}[state]
    fill = {'idle': CELL, 'active': (44, 32, 26), 'done': (16, 36, 40), 'found': (58, 22, 30)}[state]
    tcol = {'idle': WHITE, 'active': GOLD, 'done': (120, 200, 190), 'found': WHITE}[state]
    dl.rounded_rectangle(box, radius=z * 0.2, fill=rgba(fill, alpha), outline=rgba(border, alpha), width=max(2, int(5 * s)))
    if state in ('active', 'found'):
        dg.rounded_rectangle(box, radius=z * 0.2, outline=rgba(border, alpha), width=max(2, int(7 * s)))
    text(dl, str(val), 'b', z * 0.46, cx, cy + z * 0.02, tcol, alpha=alpha)

def pill(dl, cx, cy, w, h, fill, outline=None, alpha=1.0, width=3):
    dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=h / 2,
                         fill=rgba(fill, alpha) if fill else None,
                         outline=rgba(outline, alpha) if outline else None, width=width)

def grad_pill(L, G, cx, cy, w, h, alpha=1.0, scale=1.0):
    w, h = int(w * scale), int(h * scale)
    if w < 4: return
    gx = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    col = np.repeat(np.array(G1, np.float32) * (1 - gx) + np.array(G2, np.float32) * gx, h, axis=0)
    im = Image.fromarray(col.astype(np.uint8)).convert('RGBA')
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=int(255 * alpha))
    im.putalpha(m)
    L.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))
    im.putalpha(m.point(lambda p_: int(p_ * 0.35)))
    G.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))

def arrow_up(d, cx, top, col, alpha=1.0, s=1.0):
    d.polygon([(cx, top), (cx - 22 * s, top + 30 * s), (cx + 22 * s, top + 30 * s)], fill=rgba(col, alpha))

def check_mark(d, cx, cy, r, col, width=12, p=1.0):
    pts = [(cx - r * 0.5, cy), (cx - r * 0.12, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)]
    seg1 = clamp(p * 2); seg2 = clamp(p * 2 - 1)
    a = pts[0]; b = (lerp(pts[0][0], pts[1][0], seg1), lerp(pts[0][1], pts[1][1], seg1))
    d.line([a, b], fill=col, width=width, joint='curve')
    if seg2 > 0:
        c = (lerp(pts[1][0], pts[2][0], seg2), lerp(pts[1][1], pts[2][1], seg2))
        d.line([pts[1], c], fill=col, width=width, joint='curve')


# ---------------- layout ----------------
def row_x(n, size, gap):
    total = n * size + (n - 1) * gap
    x0 = (W - total) / 2 + size / 2
    return [x0 + i * (size + gap) for i in range(n)]


# ================= PROBLEM-SPECIFIC: scenes =================
# Each scene fn(L, G, dl, dg, lt, dur[, **extra]): draw sharp content with dl on L; draw anything that
# should glow ALSO with dg on G. lt = seconds since scene start. Keep content between y=330 and y=1400
# (header above, captions at y=1480, Reels UI below ~1550 and on the right edge).
def sc_hook(L, G, dl, dg, lt, dur):
    p1 = 1.0; p2 = 1.0
    text(dl, 'CAN YOU SPOT', 'black', 104, W / 2, 470 + (1 - p1) * 40, WHITE, alpha=p1)
    gtext(L, G, 'THE DUPLICATE?', 'black', 112, W / 2, 600, scale=back(p2) if p2 < 1 else 1, alpha=clamp(p2 * 3))
    xs = row_x(6, 140, 20)
    for i, v in enumerate(ARR):
        pp = prog(lt, 0.25 + i * 0.09, 0.6 + i * 0.09)
        bob = math.sin(lt * 3 + i) * 6 * prog(lt, 1.6, 2.2)
        cell(dl, dg, xs[i], 900 + bob, 140, v, 'idle', back(pp) if pp < 1 else 1)
        text(dl, str(i), 'monor', 30, xs[i], 1000, MUTED, alpha=pp)
    # pulsing question mark
    q = prog(lt, 2.0, 2.4)
    if q > 0:
        s = 1 + 0.06 * math.sin(lt * 6)
        gtext(L, G, '?', 'black', 150, W / 2, 1150, scale=back(q) * s if q < 1 else s)
    tag = ease_out(prog(lt, 3.6, 4.1))
    if tag > 0:
        pill(dl, W / 2, 1300 + (1 - tag) * 30, 720, 92, (24, 31, 52), ORANGE, alpha=tag)
        text(dl, 'LeetCode 217  ·  Contains Duplicate', 'sb', 36, W / 2, 1302 + (1 - tag) * 30, WHITE, alpha=tag)

def sc_problem(L, G, dl, dg, lt, dur):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'THE TASK', 'b', 40, W / 2, 400, ORANGE, alpha=a)
    lines = [('Return ', WHITE), ('true', TEAL), (' if any', WHITE)]
    def rich(parts, cy, size, al):
        f = F('xb', size)
        tw = sum(f.getlength(s) for s, _ in parts)
        x = W / 2 - tw / 2
        for s, c in parts:
            dl.text((x, cy), s, font=f, fill=rgba(c, al), anchor='lm')
            x += f.getlength(s)
    b = ease_out(prog(lt, 0.15, 0.5)); c = ease_out(prog(lt, 1.3, 1.7))
    rich(lines, 520, 76, b)
    rich([('value appears', WHITE)], 615, 76, b)
    if c > 0: gtext(L, G, 'at least twice.', 'black', 84, W / 2, 715, scale=back(c) if c < 1 else 1, alpha=clamp(c * 2))
    # examples
    for r, (arr, res, col, t0) in enumerate([([1, 2, 3, 1], 'true', TEAL, 2.6), ([1, 2, 3, 4], 'false', CORAL, 4.3)]):
        e = prog(lt, t0, t0 + 0.4)
        if e <= 0: continue
        cy = 930 + r * 220
        xs = [150 + i * 112 for i in range(4)]
        for i, v in enumerate(arr):
            st = 'idle'
            if res == 'true' and i in (0, 3) and lt > t0 + 0.6: st = 'found'
            cell(dl, dg, xs[i], cy, 96, v, st, back(prog(lt, t0 + i * 0.06, t0 + 0.35 + i * 0.06)))
        ea = ease_out(prog(lt, t0 + 0.4, t0 + 0.7))
        text(dl, '→', 'mono', 64, 650, cy, MUTED, alpha=ea)
        pill(dl, 840, cy, 210, 92, (16, 26, 38), col, alpha=ea, width=4)
        if ea > 0: pill(dg, 840, cy, 210, 92, None, col, alpha=ea * 0.7, width=5)
        text(dl, res, 'mono', 44, 840, cy, col, alpha=ea)

def sc_brute(L, G, dl, dg, lt, dur):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'BRUTE FORCE', 'b', 40, W / 2, 400, MUTED, alpha=a)
    text(dl, 'Compare every pair', 'xb', 72, W / 2, 490, WHITE, alpha=a)
    xs = row_x(6, 130, 22); cy = 860
    k_on = int(clamp((lt - 0.6) / 0.17, 0, len(pairs)))
    for i, v in enumerate(ARR):
        active = k_on < len(pairs) and k_on > 0 and i in pairs[min(k_on, len(pairs) - 1)]
        cell(dl, dg, xs[i], cy, 130, v, 'active' if active else 'idle', 1.0, a)
    for k in range(k_on):
        i, j = pairs[k]
        x1, x2 = xs[i], xs[j]
        hgt = 40 + (j - i) * 34
        latest = k == k_on - 1
        col = ORANGE if latest else (110, 120, 150)
        box = (x1, cy - 70 - hgt, x2, cy - 70 + hgt)
        dl.arc(box, 180, 360, fill=rgba(col, 1 if latest else 0.55), width=5 if latest else 3)
        if latest: dg.arc(box, 180, 360, fill=rgba(col), width=6)
    text(dl, f'{k_on} / 15 checks', 'mono', 44, W / 2, 1010, GOLD if k_on < 15 else WHITE, alpha=prog(lt, 0.6, 0.8))
    s = prog(lt, 3.5, 3.8)
    if s > 0:
        gtext(L, G, 'O(n²)', 'black', 170, W / 2, 1170, scale=lerp(1.8, 1.0, ease_out(s)), alpha=clamp(s * 2), c1=(255, 120, 110), c2=(255, 60, 90))
        e = ease_out(prog(lt, 3.9, 4.3))
        text(dl, 'n = 100,000 → 5 billion checks', 'monor', 38, W / 2, 1310, MUTED, alpha=e)

def set_box(dl, dg, cy, alpha=1.0, glow=False, label='seen'):
    box = (80, cy - 110, W - 80, cy + 110)
    dl.rounded_rectangle(box, radius=34, fill=rgba((14, 30, 38), alpha * 0.9), outline=rgba(TEAL, alpha), width=5)
    if glow: dg.rounded_rectangle(box, radius=34, outline=rgba(TEAL, alpha * 0.8), width=6)
    pill(dl, 220, cy - 110, 220, 56, (14, 30, 38), TEAL, alpha=alpha, width=4)
    text(dl, label, 'mono', 32, 220, cy - 111, TEAL, alpha=alpha)

def sc_idea(L, G, dl, dg, lt, dur):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'SMARTER IDEA', 'b', 40, W / 2, 400, ORANGE, alpha=a)
    text(dl, 'Remember what', 'xb', 76, W / 2, 500, WHITE, alpha=a)
    text(dl, "you've already seen", 'xb', 76, W / 2, 595, WHITE, alpha=ease_out(prog(lt, 0.15, 0.5)))
    b = prog(lt, 1.1, 1.5)
    if b > 0:
        gtext(L, G, 'HASH SET', 'black', 130, W / 2, 790, scale=back(b) if b < 1 else 1, alpha=clamp(b * 2))
    c = ease_out(prog(lt, 1.6, 2.0))
    if c > 0:
        set_box(dl, dg, 1060 + (1 - c) * 40, c, glow=True)
        text(dl, '{   }', 'mono', 64, W / 2, 1064 + (1 - c) * 40, (90, 140, 150), alpha=c)
    d_ = ease_out(prog(lt, 2.6, 3.0))
    if d_ > 0:
        pill(dl, W / 2, 1290, 470, 84, (18, 26, 44), GOLD, alpha=d_)
        text(dl, 'lookup in O(1)', 'mono', 38, W / 2, 1290, GOLD, alpha=d_)

WX = row_x(6, 130, 22); WCY = 600; SETCY = 1150
def chip_pos(j):
    return 175 + j * 148, SETCY + 8

def sc_walk(L, G, dl, dg, lt, dur, steps):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'SCAN + REMEMBER', 'b', 40, W / 2, 400, ORANGE, alpha=a)
    # which step are we in
    k, u = -1, 0.0
    for i, (s0, d) in enumerate(steps):
        if lt >= s0: k, u = i, lt - s0
    found = k == 4 and u > 0.55
    for i, v in enumerate(ARR):
        st = 'idle'
        if i < k or (i == k and k < 4 and u > 1.0): st = 'done'
        if i == k and not (k < 4 and u > 1.0): st = 'active'
        if found and i in (1, 4): st = 'found'
        pulse = 1 + (0.06 * math.sin(lt * 10) if found and i in (1, 4) and u < 1.6 else 0)
        cell(dl, dg, WX[i], WCY, 130, v, st, back(prog(lt, i * 0.05, 0.35 + i * 0.05)) * pulse)
        text(dl, str(i), 'monor', 28, WX[i], WCY + 95, MUTED, alpha=a)
    # pointer
    if k >= 0:
        prev = WX[k - 1] if k > 0 else WX[0]
        px = lerp(prev, WX[k], ease_in_out(prog(u, 0, 0.3)))
        arrow_up(dl, px, WCY + 130, ORANGE); arrow_up(dg, px, WCY + 130, ORANGE)
        text(dl, 'x', 'mono', 34, px, WCY + 190, ORANGE)
    # set box + chips
    set_box(dl, dg, SETCY, ease_out(prog(lt, 0.2, 0.6)))
    nchips = k if k <= 4 else 4
    for j in range(min(nchips, 4)):
        cx, cy = chip_pos(j)
        st = 'found' if found and j == 1 else 'done'
        cell(dl, dg, cx, cy, 112, ARR[j], st, 1.0)
    if 0 <= k < 4:
        f = prog(u, 0.6, 1.0)
        if f > 0:
            sx, sy = WX[k], WCY; ex, ey = chip_pos(k)
            e = ease_in_out(f)
            x = lerp(sx, ex, e); y = lerp(sy, ey, e) - math.sin(e * math.pi) * 120
            if f < 1:
                cell(dl, dg, x, y, lerp(130, 112, e), ARR[k], 'active', 1.0)
            else:
                cell(dl, dg, ex, ey, 112, ARR[k], 'done', back(prog(u, 1.0, 1.15)) if u < 1.15 else 1)
    # question / answer line
    if k >= 0:
        qa = ease_out(prog(u, 0.15, 0.35))
        v = ARR[k]
        f = F('xb', 54)
        parts = [('Is ', WHITE), (str(v), GOLD), (' in seen?', WHITE)]
        tw = sum(f.getlength(s) for s, _ in parts); x = W / 2 - tw / 2
        for s, c in parts:
            dl.text((x, 870), s, font=f, fill=rgba(c, qa), anchor='lm'); x += f.getlength(s)
        ans = ease_out(prog(u, 0.45, 0.65))
        if ans > 0:
            if k < 4:
                pill(dl, W / 2, 960, 380, 80, (14, 34, 38), TEAL, alpha=ans, width=4)
                text(dl, 'NO  →  add it', 'mono', 38, W / 2, 960, TEAL, alpha=ans)
            else:
                pill(dl, W / 2, 960, 380, 80, (50, 20, 28), CORAL, alpha=ans, width=4)
                pill(dg, W / 2, 960, 380, 80, None, CORAL, alpha=ans, width=5)
                text(dl, 'YES — seen it!', 'mono', 38, W / 2, 960, CORAL, alpha=ans)
    # connector + finale
    if found:
        c = ease_out(prog(u, 0.55, 0.9))
        sx, sy = WX[4], WCY + 70; ex, ey = chip_pos(1)
        ey -= 60
        mx, my = lerp(sx, ex, c), lerp(sy, ey, c)
        for D in (dl, dg):
            D.line([(sx, sy), (mx, my)], fill=rgba(CORAL, 0.9), width=6)
        r = prog(u, 1.2, 1.6)
        if r > 0:
            cy = 1355
            grad_pill(L, G, W / 2, cy, 580, 130, alpha=1, scale=back(r) if r < 1 else 1)
            text(dl, 'return true', 'mono', 60, W / 2 + 40, cy, (30, 14, 10), alpha=clamp(r * 2))
            check_mark(dl, W / 2 - 220, cy, 42, rgba((30, 14, 10)), 11, prog(u, 1.35, 1.7))
            # burst
            bt = u - 1.25
            if 0 < bt < 1.3:
                rnd = random.Random(42)
                for _ in range(40):
                    ang = rnd.uniform(0, 6.283); sp = rnd.uniform(300, 900)
                    col = rnd.choice([GOLD, CORAL, TEAL, ORANGE])
                    px = W / 2 + math.cos(ang) * sp * bt; py = cy + math.sin(ang) * sp * bt + 500 * bt * bt
                    rr = rnd.uniform(5, 11) * (1 - bt / 1.3)
                    dg.ellipse((px - rr, py - rr, px + rr, py + rr), fill=rgba(col))
                    dl.ellipse((px - rr, py - rr, px + rr, py + rr), fill=rgba(col))

CODE = [
    'bool containsDuplicate(vector<int>& nums) {',
    '    unordered_set<int> seen;',
    '    for (int x : nums) {',
    '        if (seen.count(x))',
    '            return true;',
    '        seen.insert(x);',
    '    }',
    '    return false;',
    '}',
]
KW = {'bool', 'int', 'for', 'if', 'return'}
TY = {'vector', 'unordered_set'}
def sc_code(L, G, dl, dg, lt, dur):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'THE CODE', 'b', 40, W / 2, 400, ORANGE, alpha=a)
    text(dl, 'C++  ·  O(n)', 'xb', 64, W / 2, 485, WHITE, alpha=a)
    top, lh = 600, 76
    box = (50, top - 50, W - 50, top + lh * len(CODE) + 20)
    dl.rounded_rectangle(box, radius=28, fill=rgba((13, 17, 27), 0.96 * a), outline=rgba((48, 58, 86), a), width=3)
    for i, c in enumerate([CORAL, GOLD, TEAL]):
        dl.ellipse((90 + i * 34 - 9, top - 22 - 9, 90 + i * 34 + 9, top - 22 + 9), fill=rgba(c, a))
    v = VODUR['code']; s0 = 0.2
    marks = [(0.0, [1, 2]), (0.22, [3, 4]), (0.6, [5]), (0.8, [7])]
    hl = []
    for f_, lines in marks:
        if lt >= s0 + f_ * v: hl = lines
    f = F('mono', 32)
    for i, line in enumerate(CODE):
        y = top + 30 + i * lh
        la = ease_out(prog(lt, 0.15 + i * 0.07, 0.45 + i * 0.07))
        if i in hl:
            dl.rounded_rectangle((62, y - lh / 2 + 6, W - 62, y + lh / 2 - 6), radius=12, fill=rgba((255, 154, 60), 0.16))
            dl.rectangle((62, y - lh / 2 + 6, 70, y + lh / 2 - 6), fill=rgba(ORANGE))
            dg.rectangle((62, y - lh / 2 + 6, 70, y + lh / 2 - 6), fill=rgba(ORANGE))
        x = 92
        for tok in re.findall(r'\w+|\s+|[^\w\s]', line):
            col = (210, 216, 228)
            if tok in KW: col = (255, 140, 90)
            elif tok in TY: col = TEAL
            elif tok in ('true', 'false'): col = GOLD
            elif tok in ('count', 'insert', 'containsDuplicate'): col = (130, 170, 255)
            dl.text((x, y), tok, font=f, fill=rgba(col, la), anchor='lm')
            x += f.getlength(tok)

def sc_outro(L, G, dl, dg, lt, dur):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, 'COMPLEXITY', 'b', 40, W / 2, 400, ORANGE, alpha=a)
    for i, (lab, val) in enumerate([('TIME', 'O(n)'), ('SPACE', 'O(n)')]):
        p = prog(lt, 0.3 + i * 0.25, 0.7 + i * 0.25)
        cx = W / 2 + (i * 2 - 1) * 225; cy = 560
        s = back(p) if p < 1 else 1
        if s <= 0.02: continue
        w, h = 400 * s, 220 * s
        dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=30 * s, fill=rgba((20, 27, 46)), outline=rgba(TEAL if i else GOLD), width=4)
        text(dl, lab, 'b', 34 * s, cx, cy - 50 * s, MUTED)
        text(dl, val, 'black', 88 * s, cx, cy + 30 * s, TEAL if i else GOLD)
    c = prog(lt, 3.0, 3.4)
    if c > 0:
        sc = back(c) if c < 1 else 1
        f = F('black', 130)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 130 * sc, x0, 900, WHITE, anchor='lm')
        gtext(L, G, 'Code', 'black', 130, x0 + wv * sc + wc * sc / 2, 906, scale=sc)
        e = ease_out(prog(lt, 3.4, 3.8))
        text(dl, 'Watch every step, live.', 'm', 42, W / 2, 1020, MUTED, alpha=e)
        b = prog(lt, 3.8, 4.2)
        if b > 0:
            s2 = (back(b) if b < 1 else 1) * (1 + 0.025 * math.sin(lt * 5))
            grad_pill(L, G, W / 2, 1160, 560, 120, scale=s2)
            text(dl, 'vizucode.site', 'xb', 54 * s2, W / 2, 1163, (30, 14, 10))
        g = ease_out(prog(lt, 4.6, 5.0))
        if g > 0:
            iy = 1300; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(WHITE, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(WHITE, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(WHITE, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, WHITE, anchor='lm', alpha=g)

SCENES = {'hook': sc_hook, 'problem': sc_problem, 'brute': sc_brute, 'idea': sc_idea,
          'walk': sc_walk, 'code': sc_code, 'outro': sc_outro}


# ================= GENERIC: header, captions, frame compositing, audio, encode =================
def header(dl, L, G, tsec):
    f = F('black', 46)
    wv = f.getlength('Vizu'); wc = f.getlength('Code')
    x0 = W / 2 - (wv + wc) / 2
    dl.text((x0, 175), 'Vizu', font=f, fill=rgba(WHITE), anchor='lm')
    gtext(L, G, 'Code', 'black', 46, x0 + wv + wc / 2, 177, glow=False)
    pill(dl, W / 2, 250, 420, 58, (20, 26, 44), (60, 72, 104), width=2)
    pill(dl, W / 2 - 160, 250, 16, 16, TEAL)
    text(dl, HEADER_TAG, 'sb', 26, W / 2 + 12, 251, (200, 208, 222))


def caption(dl, tsec):
    cur = [c for c in captions if c[0] <= tsec < c[1]]
    if not cur: return
    s, e, txt = cur[-1]
    p = ease_out(prog(tsec, s, s + 0.12))
    size = 64 * lerp(0.85, 1.0, p)
    f = F('black', size)
    words = txt.split()
    tw = sum(f.getlength(w_ + ' ') for w_ in words) - f.getlength(' ')
    x = W / 2 - tw / 2; y = 1480
    for w_ in words:
        bare = re.sub(r'[^\w]', '', w_).lower()
        col = WHITE
        if bare in ('true',): col = TEAL
        elif bare in ('false', 'slow'): col = CORAL
        elif re.fullmatch(r'\d+', bare) or bare in ('seven', 'three', 'one', 'nine', 'set', 'hash', 'twice'): col = GOLD
        dl.text((x, y), w_.upper(), font=f, fill=rgba(col, p), anchor='lm', stroke_width=7, stroke_fill=rgba((0, 0, 0), p))
        x += f.getlength(w_.upper() + ' ')


def render(fi):
    tsec = fi / FPS
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); G = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dl, dg = ImageDraw.Draw(L, 'RGBA'), ImageDraw.Draw(G, 'RGBA')
    for x, y, r, sp, ph in DUST:
        yy = (y - tsec * sp) % H; xx = x + math.sin(tsec * 0.6 + ph) * 12
        dl.ellipse((xx - r, yy - r, xx + r, yy + r), fill=(255, 200, 150, 40))
    for name, st, dur, extra in scenes:
        if st <= tsec < st + dur or (name == 'outro' and tsec >= st):
            lt = tsec - st
            fn = SCENES[name]
            fn(L, G, dl, dg, lt, dur, **extra) if extra else fn(L, G, dl, dg, lt, dur)
            out = prog(lt, dur - 0.18, dur) if name != 'outro' else 0
            if out > 0:
                for im in (L, G):
                    a = im.getchannel('A').point(lambda p_, k=1 - out: int(p_ * k)); im.putalpha(a)
            break
    header(dl, L, G, tsec)
    caption(dl, tsec)
    # punch-in zoom on the hook's first second
    base = BGIMG.copy().convert('RGBA')
    base.alpha_composite(L)
    g = G.resize((W // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)
    ga = np.asarray(g, np.float32)
    out = np.asarray(base.convert('RGB'), np.float32) + ga[..., :3] * (ga[..., 3:] / 255) * 1.3
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    z = 1 + 0.08 * (1 - ease_out(prog(tsec, 0, 0.7)))
    if z > 1.001:
        cw, ch = int(W / z), int(H / z)
        img = img.crop(((W - cw) // 2, (H - ch) // 2, (W - cw) // 2 + cw, (H - ch) // 2 + ch)).resize((W, H), Image.BICUBIC)
    return img.tobytes()


# ---------------- audio ----------------
def synth_audio(path):
    n = int((TOTAL + 0.5) * SR)
    tt = np.arange(n) / SR
    mix = np.zeros(n, np.float32)
    # music bed: 100bpm lo-fi-ish
    bpm = 100; beat = 60 / bpm
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    mus = np.zeros(n, np.float32)
    bar = beat * 4
    for b in range(int(TOTAL / bar) + 2):
        notes = chords[b % 4]; s = int(b * bar * SR); e = min(n, int((b + 1) * bar * SR))
        if s >= n: break
        seg = tt[s:e] - b * bar
        env = np.minimum(1, seg / 0.4) * np.minimum(1, (bar - seg) / 0.3)
        for m in notes:
            fq = 440 * 2 ** ((m - 69) / 12)
            mus[s:e] += (np.sin(2 * np.pi * fq * seg) + 0.3 * np.sin(2 * np.pi * fq * 2 * seg)) * env * 0.05
        # bass
        fq = 440 * 2 ** ((notes[0] - 12 - 69) / 12)
        mus[s:e] += np.sin(2 * np.pi * fq * seg) * env * 0.09
    for k in range(int(TOTAL / beat) + 1):
        s = int(k * beat * SR)
        if s >= n: break
        L_ = min(int(0.25 * SR), n - s); seg = np.arange(L_) / SR
        if k % 2 == 0:  # kick
            mus[s:s + L_] += np.sin(2 * np.pi * (50 + 90 * np.exp(-seg * 30)) * seg) * np.exp(-seg * 12) * 0.35
        else:  # snare-ish
            mus[s:s + L_] += np.random.RandomState(k).randn(L_).astype(np.float32) * np.exp(-seg * 22) * 0.07
        hs = s + int(beat / 2 * SR); hl = min(int(0.05 * SR), n - hs)
        if hl > 0:
            mus[hs:hs + hl] += np.random.RandomState(k + 999).randn(hl).astype(np.float32) * np.exp(-np.arange(hl) / SR * 80) * 0.035
    # voice
    voice = np.zeros(n, np.float32)
    for ts, key in vo_events:
        a = VOAUD[key]; s = int(ts * SR); e = min(n, s + len(a))
        voice[s:e] += a[:e - s]
    # duck music under voice
    env = np.abs(voice)
    k = int(0.15 * SR)
    env = np.convolve(env, np.ones(k) / k, mode='same')
    duck = 1 - 0.55 * np.clip(env * 25, 0, 1)
    fade = np.minimum(1, tt / 0.5) * np.clip((TOTAL + 0.3 - tt) / 1.5, 0, 1)
    mix += mus * duck * fade * 0.9
    mix += voice * 1.25
    # sfx
    def put(ts, sig):
        s = int(ts * SR); e = min(n, s + len(sig))
        if 0 <= s < n: mix[s:e] += sig[:e - s]
    def T(d): return np.arange(int(d * SR)) / SR
    for ts, kind in sfx:
        if kind == 'pop':
            x = T(0.12); put(ts, np.sin(2 * np.pi * (500 + 1400 * x / 0.12) * x) * np.exp(-x * 35) * 0.35)
        elif kind == 'tick':
            x = T(0.04); put(ts, np.sin(2 * np.pi * 2200 * x) * np.exp(-x * 120) * 0.18)
        elif kind == 'whoosh':
            x = T(0.4); nz = np.random.RandomState(int(ts * 100)).randn(len(x)).astype(np.float32)
            nz = np.convolve(nz, np.ones(12) / 12, mode='same')
            put(ts - 0.2, nz * np.sin(np.pi * x / 0.4) ** 2 * 0.5)
        elif kind == 'buzz':
            x = T(0.35); put(ts, np.sign(np.sin(2 * np.pi * 110 * x)) * np.exp(-x * 8) * 0.12)
        elif kind == 'ding':
            x = T(0.9); put(ts, (np.sin(2 * np.pi * 1320 * x) + 0.6 * np.sin(2 * np.pi * 1980 * x)) * np.exp(-x * 5) * 0.2)
        elif kind == 'win':
            x = T(1.2)
            sig = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * 3.5) for f in (523.25, 659.25, 783.99, 1046.5)) * 0.1
            put(ts, sig)
    peak = np.max(np.abs(mix))
    mix = mix / max(peak, 1e-6) * 0.89
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    out = sys.argv[1]
    if len(sys.argv) > 2 and sys.argv[2] == 'stills':
        for ts in map(float, sys.argv[3].split(',')):
            Image.frombytes('RGB', (W, H), render(int(ts * FPS))).save(os.path.join(out, f'still_{ts:05.1f}.png'))
        print('scenes:', [(n, round(s, 2), round(d, 2)) for n, s, d, _ in scenes], 'total', round(TOTAL, 2))
        sys.exit()
    wav = os.path.join(HERE, 'mix.wav'); synth_audio(wav)
    ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                           '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
                           '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    from multiprocessing import Pool
    with Pool(os.cpu_count()) as pool:
        for i, fr in enumerate(pool.imap(render, range(NFRAMES), chunksize=8)):
            ff.stdin.write(fr)
            if i % 150 == 0: print(f'{100 * i / NFRAMES:.0f}%', flush=True)
    ff.stdin.close(); ff.wait()
    print('done', out, round(TOTAL, 2), 's')
