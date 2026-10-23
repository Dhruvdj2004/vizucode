"""VizuCode reel engine — shared by every problem script.

A problem script (see ../examples/*/reel.py) does:

    import os, sys
    sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
    import engine as E
    from engine import *
    E.init(os.path.dirname(os.path.abspath(__file__)))      # loads vo/lines.txt + vo/<key>.wav
    E.CFG.update(HEADER_TAG=..., CODE=[...], ...)           # see CFG defaults below
    ... timeline: add_vo(E.t + 0.2, 'key'); scene('name', dur, extra); sfx.append((time, kind)) ...
    E.SCENES.update(hook=sc_hook, ...)                      # 'code' and 'outro' are built in
    E.finish()
    if __name__ == '__main__': E.main()

Run:  python3 reel.py <out.mp4>    |    python3 reel.py <dir> stills 0,5,12   (preview PNGs)

Scene fn signature: fn(L, G, dl, dg, lt, dur, **extra). Draw sharp content with dl (on layer L); draw
anything that should glow ALSO with dg (on G — it only contributes the blurred bloom).
Safe content area: y 330..1420 (header above; captions at y=1480; Reels UI below ~1550).
"""
import math, os, re, subprocess, sys, wave, random
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONTS = os.environ.get('VIDEOGEN_FONTS', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts'))
W, H, FPS = int(os.environ.get('VIDEOGEN_W', 1080)), int(os.environ.get('VIDEOGEN_H', 1920)), 30   # landscape: VIDEOGEN_W=1920 VIDEOGEN_H=1080
SR = 48000

# ---------------- palette ----------------
BG = (11, 15, 28)
WHITE = (245, 247, 250)
MUTED = (148, 163, 184)
ORANGE = (255, 154, 60)
GOLD = (255, 186, 73)
CORAL = (255, 94, 98)
TEAL = (45, 212, 191)
BLUE = (96, 165, 250)
VIOLET = (167, 139, 250)
CELL = (21, 28, 47)
CELL_LINE = (56, 70, 102)
G1, G2 = (255, 190, 70), (255, 92, 98)
INK_ON_GRAD = (30, 14, 10)

# ---------------- config + state ----------------
CFG = dict(
    HEADER_TAG='Arrays & Hashing · Easy',
    CODE=[], CODE_TITLE='C++  ·  O(n)', CODE_MARKS=[],          # marks: [(fraction_of_code_vo, [line idx...])]
    KW={'bool', 'int', 'for', 'if', 'else', 'return', 'void', 'char', 'auto', 'while'},
    TY={'vector', 'unordered_set', 'unordered_map', 'stack', 'queue', 'string', 'TreeNode'},
    LIT={'true', 'false', 'nullptr', 'NULL'},
    FN=set(),
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(n)')],
    CAPTION_GOLD=set(), CAPTION_TEAL={'true'}, CAPTION_CORAL={'false', 'slow', 'wrong'},
    FX=False,   # True = extra visual effects layer (transitions, shake, chroma, sweep, kinetic captions, ...)
)
FX_EVENTS = []   # (time, kind, strength): cut | shake | chroma | flash   (auto-filled in finish() when FX)
SPOTS = []       # (t0, dur, x, y, radius): spotlight that dims everything else
NOW = 0.0
VOTEXT, VOAUD, VODUR = {}, {}, {}
vo_events = []   # (time, key)
sfx = []         # (time, kind): pop | tick | whoosh | buzz | ding | win
captions = []    # (start, end, text)
scenes = []      # (name, start, dur, extra)
SCENES = {}
t = 0.0
TOTAL = 0.0
NFRAMES = 0
WORK = '.'


@lru_cache(None)
def F(name, size):
    file = {'black': 'Poppins-Black.ttf', 'xb': 'Poppins-ExtraBold.ttf', 'b': 'Poppins-Bold.ttf',
            'sb': 'Poppins-SemiBold.ttf', 'm': 'Poppins-Medium.ttf', 'mono': 'JBMono.ttf',
            'monor': 'JBMonoR.ttf'}[name]
    return ImageFont.truetype(os.path.join(FONTS, file), max(1, int(size)))


# ---------------- easing ----------------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(x, a, b): return clamp((x - a) / (b - a)) if b > a else float(x >= a)
def ease_out(x): return 1 - (1 - x) ** 3
def ease_in_out(x): return 3 * x * x - 2 * x * x * x
def back(x, s=1.9):
    if x >= 1: return 1.0
    x -= 1
    return x * x * ((s + 1) * x + s) + 1
def lerp(a, b, x): return a + (b - a) * x
def pop_in(lt, a, b=None): return back(prog(lt, a, a + 0.35 if b is None else b))


# ---------------- voiceover, captions, timeline ----------------
def wav_read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

def init(workdir):
    global WORK
    WORK = workdir
    vo = os.path.join(workdir, 'vo')
    for l in open(os.path.join(vo, 'lines.txt')):
        if '|' in l and not l.startswith('#'):
            k, v = l.strip().split('|', 1); VOTEXT[k] = v
    for k in VOTEXT:
        VOAUD[k] = wav_read(os.path.join(vo, k + '.wav')); VODUR[k] = len(VOAUD[k]) / SR

def add_vo(ts, key):
    vo_events.append((ts, key))
    words = VOTEXT[key].replace('vizu code dot site', 'vizucode.site').replace('vizu code', 'vizucode').split()
    chunks, cur = [], []
    for w_ in words:
        cur.append(w_)
        if len(' '.join(cur)) >= 14 or w_[-1] in '.?!:,' or len(cur) >= 3:
            chunks.append(' '.join(cur)); cur = []
    if cur: chunks.append(' '.join(cur))
    total = sum(len(c) + 4 for c in chunks)
    d, s = VODUR[key] - 0.15, ts + 0.05
    for c in chunks:
        e = s + d * (len(c) + 4) / total
        captions.append((s, e, c)); s = e

def scene(name, dur, extra=None):
    global t
    scenes.append((name, t, dur, extra or {}))
    t += dur

def vo_scene(name, key, pad=0.6, lead=0.2, whoosh=True, extra=None):
    """Standard scene: whoosh in, VO starts `lead` s in, scene lasts VO + pad. Returns scene start."""
    st = t
    if whoosh and st > 0: sfx.append((st - 0.05, 'whoosh'))
    add_vo(st + lead, key)
    scene(name, lead + VODUR[key] + pad, extra)
    return st

def steps_scene(name, keys, intro=0.7, gap=0.45, last_extra=1.6, extra_gap=None):
    """Walkthrough scene with one VO line per step. Returns (scene_start, [(step_start, dur)...]) — step
    starts are relative to the scene. extra_gap: {step_index: extra seconds} for steps needing more room."""
    st = t
    if st > 0: sfx.append((st - 0.05, 'whoosh'))
    steps, cur = [], intro
    for i, k in enumerate(keys):
        d = VODUR[k] + gap + (last_extra if i == len(keys) - 1 else 0) + (extra_gap or {}).get(i, 0)
        steps.append((cur, d))
        add_vo(st + cur + 0.1, k)
        cur += d
    scene(name, cur, {'steps': steps})
    return st, steps

def vo_at(key, phrase, lead=0.0):
    """Seconds into the `key` VO clip where `phrase` is (roughly) spoken — by character position."""
    txt = VOTEXT[key]; i = txt.lower().find(phrase.lower())
    assert i >= 0, (key, phrase)
    return lead + VODUR[key] * i / len(txt)

def step_at(lt, steps):
    k, u = -1, 0.0
    for i, (s0, d) in enumerate(steps):
        if lt >= s0: k, u = i, lt - s0
    return k, u

def finish():
    global TOTAL, NFRAMES
    TOTAL = t; NFRAMES = int(math.ceil(TOTAL * FPS))
    if CFG['FX']:
        for name, st, dur, extra in scenes:
            if st > 0: FX_EVENTS.append((st, 'cut', 1.0))
        for ts, kind in sfx:
            if kind == 'buzz': FX_EVENTS.append((ts, 'shake', 1.0)); FX_EVENTS.append((ts, 'chroma', 0.8))
            elif kind == 'win': FX_EVENTS.append((ts, 'shake', 0.7)); FX_EVENTS.append((ts, 'chroma', 1.0)); FX_EVENTS.append((ts, 'flash', 0.5))
            elif kind == 'ding': FX_EVENTS.append((ts, 'shake', 0.35)); FX_EVENTS.append((ts, 'chroma', 0.4))


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
    v = ((x - W / 2) / W) ** 2 + ((y - H / 2) / H) ** 2
    vig = (1 - 0.9 * v)[..., None]
    plain = img * vig
    grid = ((x % 60) < 1.5) | ((y % 60) < 1.5)
    withgrid = (img + grid[..., None] * 7) * vig
    bright = (img + (img - np.array(BG, np.float32)) * 0.9) * vig   # glow blobs boosted (beat pulse)
    u8 = lambda a: Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return u8(withgrid), u8(plain), u8(bright)
BGIMG, BG_PLAIN, BG_BRIGHT = make_bg()
_gy, _gx = np.mgrid[0:H + 60, 0:W]
GRID_LAYER = Image.fromarray(np.where(((_gx % 60) < 1.5) | ((_gy % 60) < 1.5), 11, 0).astype(np.uint8), 'L')
del _gy, _gx

def fx_background(tsec):
    beat = 0.6
    ph = (tsec % (beat * 2)) / (beat * 2)
    pulse = math.exp(-ph * 7)
    base = Image.blend(BG_PLAIN, BG_BRIGHT, 0.35 * pulse)
    off = int((tsec * 18) % 60)
    mask = GRID_LAYER.crop((0, off, W, off + H))
    base.paste((120, 140, 190), (0, 0), mask)
    return base

_r = random.Random(7)
DUST = [(_r.uniform(0, W), _r.uniform(0, H), _r.uniform(1.5, 3.5), _r.uniform(8, 25), _r.uniform(0, 6.28)) for _ in range(45)]


# ---------------- drawing helpers ----------------
def tint(col, k=0.18): return tuple(int(c * k + b * (1 - k)) for c, b in zip(col, BG))
def rgba(c, a=1.0): return tuple(c[:3]) + (int(255 * clamp(a)),)

@lru_cache(256)
def grad_text_img(s, fname, size, c1=G1, c2=G2):
    f = F(fname, size)
    l, tp, r, b = f.getbbox(s)
    w, h = r - l + 8, b - tp + 8
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).text((4 - l, 4 - tp), s, font=f, fill=255)
    gx = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    col = np.repeat(np.array(c1, np.float32) * (1 - gx) + np.array(c2, np.float32) * gx, h, axis=0)
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

def sweep(im, speed=0.55, phase=0.0):
    """FX: diagonal light band sliding across an RGBA image."""
    if not CFG['FX']: return im
    w, h = im.size
    pos = ((NOW * speed + phase) % 1.6 - 0.3) * (w + h)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    band = np.exp(-((xx + yy * 0.5 - pos) ** 2) / (2 * (max(w, h) * 0.06) ** 2))[..., None] * 0.75
    a = np.asarray(im, np.float32)
    a[..., :3] = a[..., :3] + (255 - a[..., :3]) * band
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def gtext(L, G, s, fname, size, cx, cy, scale=1.0, alpha=1.0, glow=True, c1=G1, c2=G2):
    """Gradient text centred at (cx, cy)."""
    im = sweep(grad_text_img(s, fname, size, c1, c2), phase=(cx + cy) * 0.0007)
    paste_c(L, im, cx, cy, scale, alpha)
    if glow: paste_c(G, im, cx, cy, scale, alpha * 0.8)

def text(d, s, fname, size, cx, cy, fill=WHITE, anchor='mm', alpha=1.0, stroke=0, stroke_fill=(0, 0, 0)):
    if alpha <= 0.01 or size < 2: return
    d.text((cx, cy), s, font=F(fname, size), fill=rgba(fill, alpha), anchor=anchor, stroke_width=stroke,
           stroke_fill=rgba(stroke_fill, alpha))

def rich(d, parts, cy, fname, size, alpha=1.0, cx=W / 2):
    """One centred line made of (text, colour) parts."""
    f = F(fname, size)
    x = cx - sum(f.getlength(s) for s, _ in parts) / 2
    for s, c in parts:
        d.text((x, cy), s, font=f, fill=rgba(c, alpha), anchor='lm'); x += f.getlength(s)

STATE = {  # border, fill, text
    'idle': (CELL_LINE, CELL, WHITE), 'active': (ORANGE, (44, 32, 26), GOLD),
    'done': ((40, 120, 112), (16, 36, 40), (120, 200, 190)), 'found': (CORAL, (58, 22, 30), WHITE),
    'good': (TEAL, (14, 44, 46), WHITE), 'dim': ((40, 48, 70), (16, 20, 34), (90, 100, 125)),
}
def cell(dl, dg, cx, cy, size, val, state='idle', s=1.0, alpha=1.0, font='b', colors=None, h=None, glow=None):
    """Rounded square value box. state: idle | active | done | found | good | dim (or colors=(border, fill, text))."""
    if s <= 0.02 or alpha <= 0.01: return
    z = size * s; zh = (h or size) * s
    box = (cx - z / 2, cy - zh / 2, cx + z / 2, cy + zh / 2)
    border, fill, tcol = colors or STATE[state]
    dl.rounded_rectangle(box, radius=min(z, zh) * 0.2, fill=rgba(fill, alpha), outline=rgba(border, alpha), width=max(2, int(5 * s)))
    if (state in ('active', 'found', 'good')) if glow is None else glow:
        dg.rounded_rectangle(box, radius=min(z, zh) * 0.2, outline=rgba(border, alpha), width=max(2, int(7 * s)))
    if val != '' and val is not None:
        text(dl, str(val), font, min(z, zh) * 0.46, cx, cy + zh * 0.02, tcol, alpha=alpha)

def node(dl, dg, cx, cy, r, val, state='idle', s=1.0, alpha=1.0):
    """Circular tree / graph node."""
    if s <= 0.02 or alpha <= 0.01: return
    rr = r * s
    border, fill, tcol = STATE[state]
    dl.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=rgba(fill, alpha), outline=rgba(border, alpha), width=max(2, int(6 * s)))
    if state in ('active', 'found', 'good'):
        dg.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=rgba(border, alpha), width=max(2, int(8 * s)))
    text(dl, str(val), 'b', rr * 0.8, cx, cy + rr * 0.04, tcol, alpha=alpha)

def pill(dl, cx, cy, w, h, fill, outline=None, alpha=1.0, width=3):
    dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=h / 2,
                         fill=rgba(fill, alpha) if fill else None,
                         outline=rgba(outline, alpha) if outline else None, width=width)

def label_pill(dl, dg, cx, cy, s, col, fname='mono', size=36, alpha=1.0, w=None, glow=False, fill=None):
    """Outlined pill with text in the same colour."""
    if alpha <= 0.01: return
    w = w or F(fname, size).getlength(s) + size * 1.4
    h = size * 2.1
    pill(dl, cx, cy, w, h, fill or tuple(int(c * 0.18 + b * 0.82) for c, b in zip(col, BG)), col, alpha=alpha, width=4)
    if glow: pill(dg, cx, cy, w, h, None, col, alpha=alpha * 0.8, width=5)
    text(dl, s, fname, size, cx, cy, col, alpha=alpha)

def grad_pill(L, G, cx, cy, w, h, alpha=1.0, scale=1.0):
    w, h = int(w * scale), int(h * scale)
    if w < 4 or h < 4: return
    gx = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    col = np.repeat(np.array(G1, np.float32) * (1 - gx) + np.array(G2, np.float32) * gx, h, axis=0)
    im = Image.fromarray(col.astype(np.uint8)).convert('RGBA')
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=int(255 * alpha))
    im.putalpha(m)
    im = sweep(im, 0.7, 0.3)
    L.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))
    im.putalpha(m.point(lambda p_: int(p_ * 0.35)))
    G.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))

def result_badge(L, G, dl, cx, cy, s, u, w=600, h=130, size=60):
    """Gradient 'answer' pill with a check mark that pops in as u goes 0→1 (u in seconds since start)."""
    r = prog(u, 0, 0.4)
    if r <= 0: return
    grad_pill(L, G, cx, cy, w, h, scale=back(r))
    text(dl, s, 'mono', size * back(r), cx + 36, cy, INK_ON_GRAD, alpha=clamp(r * 2))
    check_mark(dl, cx - w / 2 + 80, cy, 42, rgba(INK_ON_GRAD), 11, prog(u, 0.15, 0.5))

def burst(dl, dg, cx, cy, bt, n=40, seed=42):
    """Confetti burst; bt = seconds since burst start."""
    if not 0 < bt < 1.3: return
    rnd = random.Random(seed)
    for _ in range(n):
        ang = rnd.uniform(0, 6.283); sp = rnd.uniform(300, 900)
        col = rnd.choice([GOLD, CORAL, TEAL, ORANGE])
        px = cx + math.cos(ang) * sp * bt; py = cy + math.sin(ang) * sp * bt + 500 * bt * bt
        rr = rnd.uniform(5, 11) * (1 - bt / 1.3)
        for D in (dl, dg): D.ellipse((px - rr, py - rr, px + rr, py + rr), fill=rgba(col))

def arrow_up(d, cx, top, col, alpha=1.0, s=1.0):
    d.polygon([(cx, top), (cx - 22 * s, top + 30 * s), (cx + 22 * s, top + 30 * s)], fill=rgba(col, alpha))

def arrow_line(d, x1, y1, x2, y2, col, width=6, head=22, alpha=1.0, p=1.0):
    """Straight arrow from (x1,y1) towards (x2,y2), drawn to fraction p."""
    if p <= 0: return
    x2, y2 = lerp(x1, x2, p), lerp(y1, y2, p)
    d.line([(x1, y1), (x2, y2)], fill=rgba(col, alpha), width=width)
    ang = math.atan2(y2 - y1, x2 - x1)
    pts = [(x2, y2), (x2 - head * math.cos(ang - 0.45), y2 - head * math.sin(ang - 0.45)),
           (x2 - head * math.cos(ang + 0.45), y2 - head * math.sin(ang + 0.45))]
    d.polygon(pts, fill=rgba(col, alpha))

def check_mark(d, cx, cy, r, col, width=12, p=1.0):
    pts = [(cx - r * 0.5, cy), (cx - r * 0.12, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)]
    seg1 = clamp(p * 2); seg2 = clamp(p * 2 - 1)
    if seg1 <= 0: return
    b = (lerp(pts[0][0], pts[1][0], seg1), lerp(pts[0][1], pts[1][1], seg1))
    d.line([pts[0], b], fill=col, width=width, joint='curve')
    if seg2 > 0:
        c = (lerp(pts[1][0], pts[2][0], seg2), lerp(pts[1][1], pts[2][1], seg2))
        d.line([pts[1], c], fill=col, width=width, joint='curve')

def cross_mark(d, cx, cy, r, col, width=12, p=1.0):
    a = clamp(p * 2); b = clamp(p * 2 - 1)
    if a > 0: d.line([(cx - r, cy - r), (lerp(cx - r, cx + r, a), lerp(cy - r, cy + r, a))], fill=col, width=width)
    if b > 0: d.line([(cx + r, cy - r), (lerp(cx + r, cx - r, b), lerp(cy - r, cy + r, b))], fill=col, width=width)

def row_x(n, size, gap):
    total = n * size + (n - 1) * gap
    x0 = (W - total) / 2 + size / 2
    return [x0 + i * (size + gap) for i in range(n)]

def section_title(dl, lt, kicker, title=None, col=ORANGE, y=400, size=72):
    a = ease_out(prog(lt, 0, 0.35))
    text(dl, kicker, 'b', 40, W / 2, y, col, alpha=a)
    if title: text(dl, title, 'xb', size, W / 2, y + 90, WHITE, alpha=a)

def big_o_stamp(L, G, dl, lt, t0, base, sup=None, cy=1170, size=170, c1=(255, 120, 110), c2=(255, 60, 90)):
    """'O(n²)'-style stamp that slams in at t0. For exponents the fonts lack (e.g. ⁿ), pass base='O(2' and
    sup='n' — it draws the raised small letter and the closing paren itself."""
    s = prog(lt, t0, t0 + 0.3)
    if s <= 0: return
    sc = lerp(1.8, 1.0, ease_out(s)); al = clamp(s * 2)
    if not sup:
        gtext(L, G, base, 'black', size, W / 2, cy, scale=sc, alpha=al, c1=c1, c2=c2); return
    f, fs = F('black', size), F('black', size * 0.55)
    wb, ws, wp = f.getlength(base), fs.getlength(sup), f.getlength(')')
    x0 = W / 2 - (wb + ws + wp) / 2 * sc
    gtext(L, G, base, 'black', size, x0 + wb * sc / 2, cy, scale=sc, alpha=al, c1=c1, c2=c2)
    gtext(L, G, sup, 'black', size * 0.55, x0 + (wb + ws / 2) * sc, cy - size * 0.32 * sc, scale=sc, alpha=al, c1=c2, c2=c2)
    gtext(L, G, ')', 'black', size, x0 + (wb + ws + wp / 2) * sc, cy, scale=sc, alpha=al, c1=c2, c2=c2)


# ---------------- built-in scenes: code + outro ----------------
def sc_code(L, G, dl, dg, lt, dur):
    code = CFG['CODE']
    section_title(dl, lt, 'THE CODE', CFG['CODE_TITLE'], size=64)
    a = ease_out(prog(lt, 0, 0.35))
    maxlen = max(len(l) for l in code)
    fs = min(34, int(880 / (0.6 * maxlen)))
    lh = min(76, int(800 / len(code)))
    top = 600
    box = (40, top - 50, W - 40, top + lh * len(code) + 20)
    dl.rounded_rectangle(box, radius=28, fill=rgba((13, 17, 27), 0.96 * a), outline=rgba((48, 58, 86), a), width=3)
    for i, c in enumerate([CORAL, GOLD, TEAL]):
        dl.ellipse((80 + i * 34 - 9, top - 22 - 9, 80 + i * 34 + 9, top - 22 + 9), fill=rgba(c, a))
    v = VODUR.get('code', 6); s0 = 0.2
    hl = []
    for f_, lines in CFG['CODE_MARKS']:
        if lt >= s0 + f_ * v: hl = lines
    f = F('mono', fs)
    for i, line in enumerate(code):
        y = top + lh / 2 + 6 + i * lh
        la = ease_out(prog(lt, 0.15 + i * 0.05, 0.45 + i * 0.05))
        if i in hl:
            dl.rounded_rectangle((52, y - lh / 2 + 4, W - 52, y + lh / 2 - 4), radius=10, fill=rgba(ORANGE, 0.16))
            for D in (dl, dg): D.rectangle((52, y - lh / 2 + 4, 59, y + lh / 2 - 4), fill=rgba(ORANGE))
        x = 76
        for tok in re.findall(r'\w+|\s+|[^\w\s]', line):
            col = (210, 216, 228)
            if tok in CFG['KW']: col = (255, 140, 90)
            elif tok in CFG['TY']: col = TEAL
            elif tok in CFG['LIT'] or re.fullmatch(r'\d+', tok): col = GOLD
            elif tok in CFG['FN']: col = (130, 170, 255)
            elif tok == "'": col = (190, 230, 140)
            dl.text((x, y), tok, font=f, fill=rgba(col, la), anchor='lm')
            x += f.getlength(tok)

def sc_outro(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'COMPLEXITY')
    for i, (lab, val) in enumerate(CFG['COMPLEXITY']):
        p = prog(lt, 0.3 + i * 0.25, 0.7 + i * 0.25)
        cx = W / 2 + (i * 2 - 1) * 225; cy = 560
        s = back(p)
        if s <= 0.02: continue
        w, h = 410 * s, 220 * s
        col = TEAL if i else GOLD
        dl.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=30 * s, fill=rgba((20, 27, 46)), outline=rgba(col), width=4)
        text(dl, lab, 'b', 34 * s, cx, cy - 50 * s, MUTED)
        vs = 88 * s * min(1, 330 / F('black', 88).getlength(val))
        text(dl, val, 'black', vs, cx, cy + 30 * s, col)
    c = prog(lt, 3.0, 3.4)
    if c > 0:
        sc = back(c)
        f = F('black', 130)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 130 * sc, x0, 900, WHITE, anchor='lm')
        gtext(L, G, 'Code', 'black', 130, x0 + wv * sc + wc * sc / 2, 906, scale=sc)
        text(dl, 'Watch every step, live.', 'm', 42, W / 2, 1020, MUTED, alpha=ease_out(prog(lt, 3.4, 3.8)))
        b = prog(lt, 3.8, 4.2)
        if b > 0:
            s2 = back(b) * (1 + 0.025 * math.sin(lt * 5))
            grad_pill(L, G, W / 2, 1160, 560, 120, scale=s2)
            text(dl, 'vizucode.site', 'xb', 54 * s2, W / 2, 1163, INK_ON_GRAD)
        g = ease_out(prog(lt, 4.6, 5.0))
        if g > 0:
            iy = 1300; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(WHITE, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(WHITE, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(WHITE, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, WHITE, anchor='lm', alpha=g)

SCENES.update(code=sc_code, outro=sc_outro)


# ---------------- frame ----------------
def header(dl, L, G):
    f = F('black', 46)
    wv, wc = f.getlength('Vizu'), f.getlength('Code')
    x0 = W / 2 - (wv + wc) / 2
    dl.text((x0, 175), 'Vizu', font=f, fill=rgba(WHITE), anchor='lm')
    gtext(L, G, 'Code', 'black', 46, x0 + wv + wc / 2, 177, glow=False)
    tag = CFG['HEADER_TAG']
    tw = F('sb', 26).getlength(tag) + 90
    pill(dl, W / 2, 250, tw, 58, (20, 26, 44), (60, 72, 104), width=2)
    pill(dl, W / 2 - tw / 2 + 32, 250, 16, 16, TEAL)
    text(dl, tag, 'sb', 26, W / 2 + 12, 251, (200, 208, 222))

def caption(dl, tsec):
    cur = [c for c in captions if c[0] <= tsec < c[1]]
    if not cur: return
    s, e, txt = cur[-1]
    p = ease_out(prog(tsec, s, s + 0.12))
    f = F('black', 64 * lerp(0.85, 1.0, p))
    words = txt.split()
    def kcol(w_):
        bare = re.sub(r'[^\w]', '', w_).lower()
        return bare in CFG['CAPTION_TEAL'] or bare in CFG['CAPTION_CORAL'] or bool(re.fullmatch(r'\d+', bare)) or bare in CFG['CAPTION_GOLD']
    pad = (lambda w_: 30 if CFG['FX'] and kcol(w_) else 0)
    tw = sum(f.getlength(w_.upper() + ' ') + pad(w_) for w_ in words) - f.getlength(' ')
    x = W / 2 - tw / 2
    for i, w_ in enumerate(words):
        x += pad(w_) / 2
        bare = re.sub(r'[^\w]', '', w_).lower()
        col = WHITE
        if bare in CFG['CAPTION_TEAL']: col = TEAL
        elif bare in CFG['CAPTION_CORAL']: col = CORAL
        elif re.fullmatch(r'\d+', bare) or bare in CFG['CAPTION_GOLD']: col = GOLD
        ww = f.getlength(w_.upper())
        if CFG['FX']:   # words pop in one by one; keywords get a tilted highlight block
            ti = s + min(0.09 * i, (e - s) * 0.5)
            ps = prog(tsec, ti, ti + 0.16)
            if ps > 0:
                sc = back(ps); fz = F('black', 64 * sc)
                cxw = x + ww / 2
                if col != WHITE:
                    hw, hh = ww / 2 + 14, 44 * sc
                    dl.polygon([(cxw - hw, 1480 - hh + 6), (cxw + hw, 1480 - hh - 4), (cxw + hw, 1480 + hh - 6), (cxw - hw, 1480 + hh + 4)],
                               fill=rgba(tint(col, 0.55), 0.92))
                dl.text((cxw, 1480 - (1 - ps) * 18), w_.upper(), font=fz, fill=rgba(WHITE if col != WHITE else col, ps), anchor='mm',
                        stroke_width=7, stroke_fill=rgba((0, 0, 0), ps))
        else:
            dl.text((x, 1480), w_.upper(), font=f, fill=rgba(col, p), anchor='lm', stroke_width=7, stroke_fill=rgba((0, 0, 0), p))
        x += f.getlength(w_.upper() + ' ') + pad(w_) / 2

def render(fi):
    global NOW
    tsec = fi / FPS
    NOW = tsec
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); G = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dl, dg = ImageDraw.Draw(L, 'RGBA'), ImageDraw.Draw(G, 'RGBA')
    for x, y, r, sp, ph in DUST:
        yy = (y - tsec * sp) % H; xx = x + math.sin(tsec * 0.6 + ph) * 12
        dl.ellipse((xx - r, yy - r, xx + r, yy + r), fill=(255, 200, 150, 40))
    for i, (name, st, dur, extra) in enumerate(scenes):
        last = i == len(scenes) - 1
        if st <= tsec < st + dur or (last and tsec >= st):
            lt = tsec - st
            SCENES[name](L, G, dl, dg, lt, dur, **extra)
            out = prog(lt, dur - 0.18, dur) if not last else 0
            if out > 0:
                for im in (L, G):
                    im.putalpha(im.getchannel('A').point(lambda p_, k=1 - out: int(p_ * k)))
            break
    header(dl, L, G)
    caption(dl, tsec)
    if CFG['FX']:   # progress bar
        pw = W * clamp(tsec / max(TOTAL, 1e-6))
        dl.rectangle((0, 0, W, 9), fill=(255, 255, 255, 25))
        if pw > 2:
            for D in (dl, dg): D.rectangle((0, 0, pw, 9), fill=rgba(ORANGE))
    base = (fx_background(tsec) if CFG['FX'] else BGIMG).copy().convert('RGBA')
    base.alpha_composite(L)
    g = G.resize((W // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)
    ga = np.asarray(g, np.float32)
    out = np.asarray(base.convert('RGB'), np.float32) + ga[..., :3] * (ga[..., 3:] / 255) * 1.3
    z = 1 + 0.08 * (1 - ease_out(prog(tsec, 0, 0.7)))   # punch-in on the opening
    dx = dy = 0.0
    if CFG['FX']:
        chroma = flash = 0.0
        for t0, kind, k in FX_EVENTS:
            d = tsec - t0
            if d < 0 or d > 0.6: continue
            if kind == 'cut':
                z += 0.07 * (1 - ease_out(prog(d, 0, 0.4)))
                chroma = max(chroma, 9 * (1 - prog(d, 0, 0.3)))
                flash = max(flash, 0.22 * (1 - prog(d, 0, 0.18)))
            elif kind == 'shake':
                dec = math.exp(-d * 9) * k
                dx += 22 * dec * math.sin(d * 70); dy += 16 * dec * math.cos(d * 55)
            elif kind == 'chroma': chroma = max(chroma, 12 * k * (1 - prog(d, 0, 0.35)))
            elif kind == 'flash': flash = max(flash, 0.3 * k * (1 - prog(d, 0, 0.25)))
        for t0, du, sx, sy, rad in SPOTS:
            a = prog(tsec, t0, t0 + 0.15) * (1 - prog(tsec, t0 + du - 0.2, t0 + du))
            if a > 0:
                yy, xx = np.ogrid[0:H, 0:W]
                m = np.exp(-(((xx - sx) ** 2 + (yy - sy) ** 2) / (2.0 * rad * rad))).astype(np.float32)
                out *= (1 - 0.55 * a * (1 - m))[..., None]
        if flash > 0: out = out + (255 - out) * flash
        if chroma >= 1:
            c = int(chroma)
            out[:, :, 0] = np.roll(out[:, :, 0], c, axis=1); out[:, :, 2] = np.roll(out[:, :, 2], -c, axis=1)
        if abs(dx) + abs(dy) > 0.5: z = max(z, 1.045)
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    if z > 1.001:
        cw, ch = int(W / z), int(H / z)
        x0 = int(clamp((W - cw) / 2 + dx, 0, W - cw)); y0 = int(clamp((H - ch) / 2 + dy, 0, H - ch))
        img = img.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BICUBIC)
    return img.tobytes()


# ---------------- audio ----------------
def synth_audio(path):
    n = int((TOTAL + 0.5) * SR)
    tt = np.arange(n) / SR
    mix = np.zeros(n, np.float32)
    beat = 60 / 100; bar = beat * 4
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    mus = np.zeros(n, np.float32)
    for b in range(int(TOTAL / bar) + 2):
        notes = chords[b % 4]; s = int(b * bar * SR); e = min(n, int((b + 1) * bar * SR))
        if s >= n: break
        seg = tt[s:e] - b * bar
        env = np.minimum(1, seg / 0.4) * np.minimum(1, (bar - seg) / 0.3)
        for m in notes:
            fq = 440 * 2 ** ((m - 69) / 12)
            mus[s:e] += (np.sin(2 * np.pi * fq * seg) + 0.3 * np.sin(2 * np.pi * fq * 2 * seg)) * env * 0.05
        fq = 440 * 2 ** ((notes[0] - 12 - 69) / 12)
        mus[s:e] += np.sin(2 * np.pi * fq * seg) * env * 0.09
    for k in range(int(TOTAL / beat) + 1):
        s = int(k * beat * SR)
        if s >= n: break
        L_ = min(int(0.25 * SR), n - s); seg = np.arange(L_) / SR
        if k % 2 == 0:
            mus[s:s + L_] += np.sin(2 * np.pi * (50 + 90 * np.exp(-seg * 30)) * seg) * np.exp(-seg * 12) * 0.35
        else:
            mus[s:s + L_] += np.random.RandomState(k).randn(L_).astype(np.float32) * np.exp(-seg * 22) * 0.07
        hs = s + int(beat / 2 * SR); hl = min(int(0.05 * SR), n - hs)
        if hl > 0:
            mus[hs:hs + hl] += np.random.RandomState(k + 999).randn(hl).astype(np.float32) * np.exp(-np.arange(hl) / SR * 80) * 0.035
    voice = np.zeros(n, np.float32)
    for ts, key in vo_events:
        a = VOAUD[key]; s = int(ts * SR); e = min(n, s + len(a))
        voice[s:e] += a[:e - s]
    k = int(0.15 * SR)
    env = np.convolve(np.abs(voice), np.ones(k) / k, mode='same')
    duck = 1 - 0.55 * np.clip(env * 25, 0, 1)
    fade = np.minimum(1, tt / 0.5) * np.clip((TOTAL + 0.3 - tt) / 1.5, 0, 1)
    mix += mus * duck * fade * 0.9 + voice * 1.25
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
            put(ts - 0.2, np.convolve(nz, np.ones(12) / 12, mode='same') * np.sin(np.pi * x / 0.4) ** 2 * 0.5)
        elif kind == 'buzz':
            x = T(0.35); put(ts, np.sign(np.sin(2 * np.pi * 110 * x)) * np.exp(-x * 8) * 0.12)
        elif kind == 'ding':
            x = T(0.9); put(ts, (np.sin(2 * np.pi * 1320 * x) + 0.6 * np.sin(2 * np.pi * 1980 * x)) * np.exp(-x * 5) * 0.2)
        elif kind == 'win':
            x = T(1.2); put(ts, sum(np.sin(2 * np.pi * f * x) * np.exp(-x * 3.5) for f in (523.25, 659.25, 783.99, 1046.5)) * 0.1)
    mix = mix / max(np.max(np.abs(mix)), 1e-6) * 0.89
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())


def main():
    out = sys.argv[1]
    if len(sys.argv) > 2 and sys.argv[2] == 'stills':
        os.makedirs(out, exist_ok=True)
        for ts in map(float, sys.argv[3].split(',')):
            Image.frombytes('RGB', (W, H), render(int(ts * FPS))).save(os.path.join(out, f'still_{ts:05.1f}.png'))
        print('scenes:', [(n, round(s, 2), round(d, 2)) for n, s, d, _ in scenes], 'total', round(TOTAL, 2))
        return
    wav = os.path.join(WORK, 'mix.wav'); synth_audio(wav)
    ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                           '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
                           '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    from multiprocessing import Pool
    with Pool(os.cpu_count()) as pool:
        for i, fr in enumerate(pool.imap(render, range(NFRAMES), chunksize=8)):
            ff.stdin.write(fr)
            if i % 300 == 0: print(f'{100 * i / NFRAMES:.0f}%', flush=True)
    ff.stdin.close(); ff.wait()
    print('done', out, round(TOTAL, 2), 's')
