"""SQL vs NoSQL — System Design for Beginners, part 6.
Two-character storybook video (Chintu asks, Meera explains), landscape 1920x1080 for YouTube.

Work dir layout (make_vo.sh writes the clips + word timings):
    reel.py  vo/lines.txt  vo/voices.txt  vo/<key>.wav  vo/<key>.words.json
Run:
    export VIDEOGEN_K=<skill dir> VIDEOGEN_W=1920 VIDEOGEN_H=1080
    python3 reel.py out.mp4                 # full render (multiprocess)
    python3 reel.py stills_dir stills 3,40  # preview PNGs
Every time in the video comes from the clip lengths and the words.json word timings (no hard-coded times).
If a words.json is missing, words are spaced evenly over that clip.
"""
import os, sys, math, re, json
import numpy as np
from PIL import Image

K = os.environ['VIDEOGEN_K']
sys.path.insert(0, os.path.join(K, 'scripts'))
import engine as E
from engine import *
sys.path.insert(0, os.path.join(K, 'examples', 'storybook-characters'))
from characters import chintu, meera, Cast, INK, PAPER, CHINTU_COL, MEERA_COL

assert (W, H) == (1920, 1080), 'run with VIDEOGEN_W=1920 VIDEOGEN_H=1080'
WORK = os.environ.get('REEL_WORK', os.path.dirname(os.path.abspath(__file__)))
E.init(WORK)

# ---------------- voice: gain, word timings, trim the silent tail of each clip ----------------
VOICE_GAIN = 2.0
WT = {}
for _k in list(E.VOTEXT):
    _n = len(E.VOTEXT[_k].split())
    _p = os.path.join(WORK, 'vo', _k + '.words.json')
    if os.path.exists(_p):
        WT[_k] = json.load(open(_p))
    else:
        _d = E.VODUR[_k]
        WT[_k] = [[_d * i / _n, _d * (i + 0.9) / _n] for i in range(_n)]
    _end = min(E.VODUR[_k], WT[_k][-1][1] + 0.12)
    _a = E.VOAUD[_k][:int(_end * SR)] * VOICE_GAIN
    _r = min(len(_a), int(0.03 * SR))
    if _r: _a[-_r:] *= np.linspace(1, 0, _r)
    E.VOAUD[_k] = _a; E.VODUR[_k] = len(_a) / SR

E.CFG.update(
    HEADER_TAG='System Design · For Beginners',
    CAPTION_GOLD={'sql', 'nosql', 'mysql', 'mongodb', 'schema', 'join', 'table', 'tables', 'acid', 'json', 'document', 'documents',
                  'redis', 'cassandra', 'neo4j', 'relation', 'row', 'rows', 'columns', 'column', 'register', 'cards', 'card',
                  'sharding', 'caching', 'shard', 'transactions', 'id', 'graph', 'graphs', 'up', 'out', 'vizucode', 'vizucode.site',
                  '@vizucode26', 'samosa', 'samosas', 'delhi', 'payments', 'banking', 'orders', 'chats', 'feeds', 'billions'},
    CAPTION_TEAL={'yes', 'correct', 'flexible', 'both', 'right', 'neat', 'clean'},
    CAPTION_CORAL={'nope', 'harder', 'limit', 'fighting', 'messy', 'vanishes', 'strict', 'fixed', 'help'},
)

# ---------------- storybook theme (adapted from storybook-api-gateway, landscape) ----------------
SOFT = (110, 104, 140)
SQLC = (96, 140, 235)          # SQL colour (blue)
NOC = (40, 170, 156)           # NoSQL colour (teal, darker for text on paper)
SAM = (240, 178, 80)


def make_story_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = np.array((255, 241, 222), np.float32), np.array((206, 230, 255), np.float32)
    k = (y / H)[..., None]
    img = top * (1 - k) + bot * k
    def blob(cx, cy, rx, ry, col, a):
        d = np.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2))
        return d[..., None] * (np.array(col, np.float32) - img) * a
    img += blob(W * 0.93, 120, 520, 320, (255, 200, 150), 0.55)
    img += blob(W * 0.04, H * 0.82, 520, 380, (190, 240, 225), 0.6)
    for cx, cy, r in [(640, 92, 34), (690, 78, 46), (742, 95, 32), (1220, 104, 30), (1262, 90, 42), (1306, 106, 28)]:
        d = ((x - cx) ** 2 + (y - cy) ** 2) < r * r
        img[d] = img[d] * 0.45 + 255 * 0.55
    dots = ((x % 54) - 27) ** 2 + ((y % 54) - 27) ** 2 < 4
    img[dots] = img[dots] * 0.93
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
E.BGIMG = make_story_bg()


def T(dl, s, size, cx, cy, col=INK, fname='xb', alpha=1.0, anchor='mm'):
    text(dl, s, fname, size, cx, cy, col, alpha=alpha, anchor=anchor)

def fitsz(s, fname, size, maxw):
    while size > 8 and F(fname, size).getlength(s) > maxw: size -= 1
    return size

def light(col, k=0.25): return tuple(int(c * k + 255 * (1 - k)) for c in col)

def shadow_rr(dl, box, r, alpha=1.0, off=9):
    x0, y0, x1, y1 = box
    dl.rounded_rectangle((x0 + off, y0 + off, x1 + off, y1 + off), radius=r, fill=rgba(INK, 0.16 * alpha))

def card(dl, box, r=28, fill=PAPER, outline=INK, alpha=1.0, width=5):
    if alpha <= 0.01: return
    shadow_rr(dl, box, r, alpha)
    dl.rounded_rectangle(box, radius=r, fill=rgba(fill, alpha), outline=rgba(outline, alpha), width=width)

def tag_pill(dl, cx, cy, s, col=INK, fill=PAPER, size=32, alpha=1.0, fname='b', sc=1.0):
    if alpha <= 0.01 or sc <= 0.02: return
    size = size * sc
    w = F(fname, size).getlength(s) + size * 1.3; h = size * 1.9
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    shadow_rr(dl, box, h / 2, alpha, 6)
    dl.rounded_rectangle(box, radius=h / 2, fill=rgba(fill, alpha), outline=rgba(INK, alpha), width=4)
    text(dl, s, fname, size, cx, cy + 1, col, alpha=alpha)

def gpill(L, G, dl, cx, cy, w, h, s, size, sc=1.0, alpha=1.0):
    """Gradient pill with dark text (the series' highlight)."""
    if sc <= 0.02 or alpha <= 0.01: return
    ww, hh = w * sc, h * sc
    dl.rounded_rectangle((cx - ww / 2 + 8, cy - hh / 2 + 9, cx + ww / 2 + 8, cy + hh / 2 + 9), radius=hh / 2, fill=rgba(INK, 0.18 * alpha))
    grad_pill(L, G, cx, cy, w, h, scale=sc, alpha=alpha)
    dl.rounded_rectangle((cx - ww / 2, cy - hh / 2, cx + ww / 2, cy + hh / 2), radius=hh / 2, outline=rgba(INK, alpha), width=5)
    text(dl, s, 'black', fitsz(s, 'black', size, w - 50) * sc, cx, cy + 2, INK_ON_GRAD, alpha=alpha)

def bubble(dl, cx, cy, s, tail, size=40, alpha=1.0, sc=1.0):
    if sc <= 0.02 or alpha <= 0.01: return
    f = F('xb', size * sc)
    w = f.getlength(s) + 60 * sc; h = size * 2.2 * sc
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    tx, ty = tail
    tri = [(cx - 30 * sc, cy + h / 2 - 4), (cx + 10 * sc, cy + h / 2 - 4), (tx, ty)]
    shadow_rr(dl, box, h / 2, alpha, 7)
    dl.polygon(tri, fill=rgba(PAPER, alpha), outline=rgba(INK, alpha))
    dl.line([tri[0], tri[2], tri[1]], fill=rgba(INK, alpha), width=5)
    dl.rounded_rectangle(box, radius=h / 2, fill=rgba(PAPER, alpha), outline=rgba(INK, alpha), width=5)
    dl.line([(tri[0][0] + 4, tri[0][1]), (tri[1][0] - 4, tri[1][1])], fill=rgba(PAPER, alpha), width=7)
    text(dl, s, 'xb', size * sc, cx, cy + 1, INK, alpha=alpha)

def person(dl, cx, cy, s, col, alpha=1.0, hair=(52, 34, 30), pony=False):
    """Small friend icon; (cx, cy) = neck point."""
    if s <= 0.02 or alpha <= 0.01: return
    ink = rgba(INK, alpha); w = max(2, int(3.5 * s))
    dl.rounded_rectangle((cx - 25 * s, cy, cx + 25 * s, cy + 46 * s), radius=20 * s, fill=rgba(col, alpha), outline=ink, width=w)
    r = 18 * s; hy = cy - 16 * s
    if pony:
        dl.ellipse((cx + 10 * s, hy - 6 * s, cx + 30 * s, hy + 18 * s), fill=rgba(hair, alpha), outline=ink, width=w)
    dl.ellipse((cx - r, hy - r, cx + r, hy + r), fill=rgba((255, 208, 168), alpha), outline=ink, width=w)
    dl.chord((cx - r, hy - r, cx + r, hy + r * 0.3), 180, 360, fill=rgba(hair, alpha), outline=ink, width=w)
    for sx in (-1, 1):
        dl.ellipse((cx + sx * 6 * s - 2.5 * s, hy + 1 * s, cx + sx * 6 * s + 2.5 * s, hy + 6 * s), fill=ink)
    dl.arc((cx - 6 * s, hy + 3 * s, cx + 6 * s, hy + 12 * s), 20, 160, fill=ink, width=max(1, int(2 * s)))

def samosa(dl, cx, cy, s=1.0, alpha=1.0):
    if s <= 0.02 or alpha <= 0.01: return
    pts = [(cx, cy - 42 * s), (cx + 50 * s, cy + 32 * s), (cx - 50 * s, cy + 32 * s)]
    dl.polygon(pts, fill=rgba(SAM, alpha))
    dl.line(pts + pts[:1], fill=rgba(INK, alpha), width=max(2, int(5 * s)), joint='curve')
    dl.line([(cx - 38 * s, cy + 20 * s), (cx + 38 * s, cy + 20 * s)], fill=rgba((200, 130, 50), alpha), width=max(2, int(4 * s)))
    for dx, dy in [(-12, -2), (10, 6), (0, -18)]:
        dl.ellipse((cx + dx * s - 3 * s, cy + dy * s - 3 * s, cx + dx * s + 3 * s, cy + dy * s + 3 * s), fill=rgba((200, 130, 50), alpha))

def db(dl, cx, cy, s, t, state='ok', col=(222, 232, 252), alpha=1.0):
    """Database cylinder with a face. state: ok | busy."""
    if s <= 0.02 or alpha <= 0.01: return
    w, h, e = 150 * s, 160 * s, 40 * s
    ink = rgba(INK, alpha); lw = max(2, int(5 * s))
    fill = col if state == 'ok' else (255, 222, 196)
    if state == 'busy': cx += math.sin(t * 30) * 2.5 * s
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    dl.rounded_rectangle((x0 + 8, y0 - e / 2 + 9, x1 + 8, y1 + e / 2 + 9), radius=e / 2, fill=rgba(INK, 0.16 * alpha))
    dl.ellipse((x0, y1 - e / 2, x1, y1 + e / 2), fill=rgba(fill, alpha), outline=ink, width=lw)
    dl.rectangle((x0, y0, x1, y1), fill=rgba(fill, alpha))
    dl.line([(x0 + lw / 2 - 1, y0), (x0 + lw / 2 - 1, y1)], fill=ink, width=lw)
    dl.line([(x1 - lw / 2, y0), (x1 - lw / 2, y1)], fill=ink, width=lw)
    yy = y0 + h * 0.78
    dl.arc((x0, yy - e / 2, x1, yy + e / 2), 0, 180, fill=rgba(INK, 0.45 * alpha), width=max(2, int(3 * s)))
    dl.ellipse((x0, y0 - e / 2, x1, y0 + e / 2), fill=rgba(light(fill, 0.6), alpha), outline=ink, width=lw)
    fy = cy + 2 * s
    for sx in (-1, 1):
        ex = cx + sx * 28 * s
        if state == 'busy':
            dl.line([(ex - 9 * s, fy - 6 * s * sx), (ex + 9 * s, fy), (ex - 9 * s, fy + 6 * s * sx)], fill=ink, width=lw)
        else:
            r = 8 * s if (t + cx * 0.003) % 2.9 > 0.12 else 2 * s
            dl.ellipse((ex - 7 * s, fy - r, ex + 7 * s, fy + r), fill=ink)
    my = fy + 30 * s
    if state == 'busy':
        pts = [(cx - 20 * s + i * 8 * s, my + (4 if i % 2 else -4) * s) for i in range(6)]
        dl.line(pts, fill=ink, width=max(2, int(4 * s)))
        dx, dy = x1 + 4 * s, y0 + 10 * s + (t * 60 % 40) * s
        dl.polygon([(dx, dy - 16 * s), (dx - 9 * s, dy + 4 * s), (dx + 9 * s, dy + 4 * s)], fill=rgba(BLUE, alpha))
        dl.ellipse((dx - 9 * s, dy - 5 * s, dx + 9 * s, dy + 13 * s), fill=rgba(BLUE, alpha))
    else:
        dl.arc((cx - 18 * s, my - 16 * s, cx + 18 * s, my + 6 * s), 20, 160, fill=ink, width=lw)

def phone(dl, cx, cy, s, alpha=1.0):
    if s <= 0.02: return
    w, h = 150 * s, 260 * s
    card(dl, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 28 * s, INK, width=max(3, int(5 * s)), alpha=alpha)
    sx0, sy0, sx1, sy1 = cx - w / 2 + 11 * s, cy - h / 2 + 26 * s, cx + w / 2 - 11 * s, cy + h / 2 - 26 * s
    dl.rounded_rectangle((sx0, sy0, sx1, sy1), radius=14 * s, fill=rgba(PAPER, alpha))
    text(dl, 'Chintu', 'black', 22 * s, cx, sy0 + 28 * s, ORANGE, alpha=alpha)
    text(dl, 'Eats', 'black', 22 * s, cx, sy0 + 52 * s, ORANGE, alpha=alpha)
    samosa(dl, cx, cy + 15 * s, 0.75 * s, alpha)
    dl.rounded_rectangle((cx - 40 * s, sy1 - 34 * s, cx + 40 * s, sy1 - 10 * s), radius=12 * s, fill=rgba(ORANGE, alpha))
    text(dl, 'Order', 'xb', 15 * s, cx, sy1 - 22 * s, PAPER, alpha=alpha)

def pizza_box(dl, cx, cy, s, alpha=1.0):
    if s <= 0.02: return
    w = 230 * s
    card(dl, (cx - w / 2, cy - 30 * s, cx + w / 2, cy + 110 * s), 12 * s, (222, 170, 112), alpha=alpha)
    dl.polygon([(cx - w / 2, cy - 30 * s), (cx + w / 2, cy - 30 * s), (cx + w / 2 - 25 * s, cy - 150 * s), (cx - w / 2 + 25 * s, cy - 150 * s)],
               fill=rgba((236, 190, 136), alpha), outline=rgba(INK, alpha))
    dl.line([(cx - w / 2, cy - 30 * s), (cx - w / 2 + 25 * s, cy - 150 * s), (cx + w / 2 - 25 * s, cy - 150 * s), (cx + w / 2, cy - 30 * s)],
            fill=rgba(INK, alpha), width=max(2, int(5 * s)))
    text(dl, 'PIZZA', 'black', 34 * s, cx, cy - 90 * s, (150, 80, 40), alpha=alpha)
    samosa(dl, cx, cy + 40 * s, 0.8 * s, alpha)

def bank(dl, cx, cy, s, alpha=1.0):
    ink = rgba(INK, alpha); lw = max(2, int(4 * s))
    dl.polygon([(cx - 60 * s, cy - 30 * s), (cx + 60 * s, cy - 30 * s), (cx, cy - 66 * s)], fill=rgba(light(SQLC, 0.5), alpha), outline=ink)
    dl.line([(cx - 60 * s, cy - 30 * s), (cx, cy - 66 * s), (cx + 60 * s, cy - 30 * s), (cx - 60 * s, cy - 30 * s)], fill=ink, width=lw)
    for i in range(4):
        x = cx - 42 * s + i * 28 * s
        dl.rectangle((x - 7 * s, cy - 26 * s, x + 7 * s, cy + 22 * s), fill=rgba(PAPER, alpha), outline=ink, width=max(1, int(3 * s)))
    dl.rectangle((cx - 64 * s, cy + 22 * s, cx + 64 * s, cy + 34 * s), fill=rgba(light(SQLC, 0.5), alpha), outline=ink, width=lw)
    text(dl, '₹', 'black', 26 * s, cx, cy - 42 * s, INK, alpha=alpha)

def table(dl, x0, y0, cols, header, rows, rh=62, size=28, alpha=1.0, rowp=None, hl=None, hcols=None, hfill=(255, 226, 196),
          outline_hdr=None):
    """Simple storybook table. rowp: per-row reveal 0..1, hl: {row: colour}, hcols: {col: colour}. Returns bottom y."""
    if alpha <= 0.01: return y0
    tw = sum(cols); n = len(rows)
    vis = [1.0] * n if rowp is None else rowp
    nvis = sum(1 for v in vis if v > 0)
    y1 = y0 + rh * (1 + nvis)
    card(dl, (x0, y0, x0 + tw, y1), 18, PAPER, alpha=alpha)
    dl.rounded_rectangle((x0, y0, x0 + tw, y0 + rh), radius=18, fill=rgba(hfill, alpha))
    dl.rectangle((x0 + 3, y0 + rh / 2, x0 + tw - 3, y0 + rh), fill=rgba(hfill, alpha))
    x = x0
    for j, (cw, hd) in enumerate(zip(cols, header)):
        if hcols and j in hcols:
            dl.rectangle((x + 4, y0 + 4, x + cw - 4, y0 + rh - 1), fill=rgba(hcols[j], alpha))
        T(dl, hd, fitsz(hd, 'black', size * 0.92, cw - 16), x + cw / 2, y0 + rh / 2 + 1, INK, 'black', alpha)
        x += cw
    for i, row in enumerate(rows):
        v = vis[i]
        if v <= 0: continue
        ry = y0 + rh * (1 + i)
        if hl and i in hl:
            dl.rectangle((x0 + 4, ry + 1, x0 + tw - 4, ry + rh - 1), fill=rgba(hl[i], alpha * v))
        x = x0
        for cw, val in zip(cols, row):
            val = str(val)
            T(dl, val, fitsz(val, 'sb', size, cw - 14), x + cw / 2, ry + rh / 2 + 1, INK, 'sb', alpha * v)
            x += cw
        dl.line([(x0 + 3, ry), (x0 + tw - 3, ry)], fill=rgba(INK, 0.3 * alpha), width=2)
    x = x0
    for cw in cols[:-1]:
        x += cw; dl.line([(x, y0 + 3), (x, y1 - 3)], fill=rgba(INK, 0.3 * alpha), width=2)
    dl.rounded_rectangle((x0, y0, x0 + tw, y1), radius=18, outline=rgba(INK, alpha), width=5)
    if outline_hdr:
        dl.rounded_rectangle((x0 - 6, y0 - 6, x0 + tw + 6, y0 + rh + 6), radius=22, outline=rgba(outline_hdr, alpha), width=7)
    return y1

KWS = {'SELECT', 'FROM', 'WHERE'}
def code_lines(dl, x, y, lines, size, lh, alpha=1.0, upto=None, hl=None, hlcol=ORANGE, box_w=0):
    """Mono code with simple colours; upto = characters typed so far (typewriter)."""
    f = F('mono', size); left = 10 ** 9 if upto is None else upto
    for i, line in enumerate(lines):
        yy = y + i * lh
        if hl and i in hl:
            dl.rounded_rectangle((x - 16, yy - lh / 2 + 3, x - 16 + box_w, yy + lh / 2 - 3), radius=8, fill=rgba(hl[i], 0.28 * alpha))
            dl.rectangle((x - 16, yy - lh / 2 + 3, x - 10, yy + lh / 2 - 3), fill=rgba(hl[i], alpha))
        if left <= 0: break
        toks = re.findall(r'"[^"]*"|\'[^\']*\'|\w+|\s+|[^\w\s]', line)
        xx = x
        for j, tok in enumerate(toks):
            if left <= 0: break
            col = (220, 224, 236)
            nxt = ''.join(toks[j + 1:j + 3]).strip()
            if tok in KWS: col = (255, 140, 90)
            elif tok[0] in '"\'': col = (130, 200, 255) if nxt.startswith(':') else (190, 230, 140)
            elif re.fullmatch(r'\d+', tok): col = GOLD
            show = tok[:left]
            dl.text((xx, yy), show, font=f, fill=rgba(col, alpha), anchor='lm')
            xx += f.getlength(show); left -= len(tok)
        left -= 1

def dark_card(dl, box, alpha=1.0):
    card(dl, box, 24, (34, 30, 58), alpha=alpha)
    for i, c in enumerate([CORAL, GOLD, TEAL]):
        dl.ellipse((box[0] + 26 + i * 26 - 7, box[1] + 22 - 7, box[0] + 26 + i * 26 + 7, box[1] + 22 + 7), fill=rgba(c, alpha))

def countdown(dl, cx, cy, u, r=62):
    """3-2-1 ring; u = seconds since countdown start (0..3)."""
    if not 0 <= u < 3.0: return
    n = 3 - int(u); f = u - int(u)
    a = ease_out(prog(u, 0, 0.2)) * (1 - prog(u, 2.85, 3.0))
    dl.ellipse((cx - r + 7, cy - r + 8, cx + r + 7, cy + r + 8), fill=rgba(INK, 0.16 * a))
    dl.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba(PAPER, a), outline=rgba(INK, a), width=5)
    dl.arc((cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10), -90, -90 + 360 * (1 - f), fill=rgba(ORANGE, a), width=12)
    T(dl, str(n), 64 * (1 + 0.25 * (1 - ease_out(prog(f, 0, 0.25)))), cx, cy + 3, INK, 'black', a)

def check_badge(dl, cx, cy, r, p, col=TEAL):
    if p <= 0: return
    s = back(p)
    dl.ellipse((cx - r * s, cy - r * s, cx + r * s, cy + r * s), fill=rgba(col), outline=rgba(INK), width=4)
    check_mark(dl, cx, cy + 2, r * 0.75 * s, rgba(PAPER), max(3, int(r * 0.26)), prog(p, 0.3, 1))

def cross_badge(dl, cx, cy, r, p):
    if p <= 0: return
    s = back(p)
    dl.ellipse((cx - r * s, cy - r * s, cx + r * s, cy + r * s), fill=rgba(CORAL), outline=rgba(INK), width=4)
    cross_mark(dl, cx, cy, r * 0.42 * s, rgba(PAPER), max(3, int(r * 0.24)), prog(p, 0.3, 1))

def curve(dl, a, b, bend, col, width=6, p=1.0, alpha=1.0):
    pts = []
    n = 24
    for i in range(int(n * p) + 1):
        q = i / n
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + bend
        x = (1 - q) ** 2 * a[0] + 2 * (1 - q) * q * mx + q * q * b[0]
        y = (1 - q) ** 2 * a[1] + 2 * (1 - q) * q * my + q * q * b[1]
        pts.append((x, y))
    if len(pts) > 1: dl.line(pts, fill=rgba(col, alpha), width=width, joint='curve')

def lerp2(a, b, p): return (lerp(a[0], b[0], p), lerp(a[1], b[1], p))


# ---------------- timeline (all from clip lengths + word timings) ----------------
GAP_SAME, GAP_SWITCH, PRE, POST = 0.1, 0.25, 1.1, 0.45
START, SCST, CD, LABEL = {}, {}, {}, {}

def chapter(name, label, keys, pre=PRE, post=POST, counts=()):
    st = E.t; SCST[name] = st; LABEL[name] = label
    if st > 0: sfx.append((st - 0.05, 'whoosh'))
    cur, prev = pre, None
    for k in keys:
        spk = k.split('_')[0]
        if prev: cur += GAP_SAME if spk == prev else GAP_SWITCH
        START[k] = cur; add_vo(st + cur, k); cur += VODUR[k]; prev = spk
        if k in counts:            # visible 3-second countdown after a quiz question
            CD[k] = cur + 0.3; cur += 0.3 + 3.0 + 0.15; prev = None
            for i in range(3): sfx.append((st + CD[k] + i, 'tick'))
    scene(name, cur + post)

def at(key, phrase=None, lead=0.0):
    """Scene-relative time where `phrase` starts in VO line `key` (word-accurate)."""
    if phrase is None: return START[key] + lead
    txt = E.VOTEXT[key]
    m = re.search(r'(?<!\w)' + re.escape(phrase), txt, re.I)
    assert m, (key, phrase)
    return START[key] + WT[key][len(txt[:m.start()].split())][0] + lead

KEYS = list(E.VOTEXT)
def group(d, letters=None):
    return [k for k in KEYS if k.split('_')[1][0] == d and (letters is None or k.split('_')[1][1:] in letters)]

QUIZ_Q = ['meera_8b', 'meera_8e', 'meera_8h']
CHAPTERS = [('c1', '1 · The Big Fight'), ('c2', '2 · Register vs Note Cards'), ('c3', '3 · SQL: Tables'),
            ('c4', '4 · NoSQL: Documents'), ('c5', '5 · Scaling'), ('c6', '6 · Which One When?'), ('c7', '7 · Recap')]
for i, (nm, lab) in enumerate(CHAPTERS):
    chapter(nm, lab, group(str(i + 1)), pre=0.5 if i == 0 else PRE)
chapter('quiz', '8 · Quiz Time', group('8', 'abcdefghij'), counts=QUIZ_Q, post=0.6)
chapter('outro', 'Thanks for watching!', group('8', 'klm'), pre=0.4, post=2.8)

def fx(scn, tt, kind): sfx.append((SCST[scn] + tt, kind))

# ---------------- captions: word-timed, speaker-tagged ----------------
CAPS = []
def rebuild_captions():
    for ts, key in E.vo_events:
        raw = E.VOTEXT[key].split(); tm = WT[key]; who = key.split('_')[0]
        toks, i = [], 0
        while i < len(raw):
            low = [w.lower().strip('.,!?') for w in raw[i:i + 4]]
            if low[:4] == ['vizu', 'code', 'dot', 'site']: toks.append(('vizucode.site' + raw[i + 3][4:], i, i + 3)); i += 4
            elif low[:4] == ['at', 'vizu', 'code', '26']: toks.append(('@vizucode26' + raw[i + 3][2:], i, i + 3)); i += 4
            elif low[:2] == ['vizu', 'code']: toks.append(('vizucode' + raw[i + 1][4:], i, i + 1)); i += 2
            else: toks.append((raw[i], i, i)); i += 1
        chunks, cur = [], []
        for tok in toks:
            cur.append(tok)
            txt = ' '.join(c[0] for c in cur)
            if len(txt) >= 24 or tok[0][-1] in '.?!:,' or len(cur) >= 5: chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for j, ch in enumerate(chunks):
            st = ts + tm[ch[0][1]][0] - 0.04
            en = ts + (tm[chunks[j + 1][0][1]][0] - 0.04 if j + 1 < len(chunks) else tm[ch[-1][2]][1] + 0.3)
            CAPS.append((st, en, ' '.join(c[0] for c in ch), who))
rebuild_captions()
E.captions[:] = []

# ---------------- cues + sound effects ----------------
c1_app = at('chintu_1a', 'snack'); c1_R = at('chintu_1c', 'Rohan'); c1_Rb = at('chintu_1c', 'use MySQL')
c1_P = at('chintu_1c', 'Priya'); c1_Pb = at('chintu_1c', 'use MongoDB'); c1_Q = at('chintu_1d'); c1_S = at('chintu_1d', 'samosa')
c1_M1 = at('meera_1e', 'MySQL'); c1_M2 = at('meera_1e', 'MongoDB'); c1_B = at('meera_1e', "Let's")
for tt, k in [(c1_app, 'pop'), (c1_R, 'pop'), (c1_Rb, 'buzz'), (c1_P, 'pop'), (c1_Pb, 'buzz'), (c1_S, 'pop'), (c1_M1, 'ding'), (c1_M2, 'ding'), (c1_B, 'win')]:
    fx('c1', tt, k)

c2_reg = at('meera_2a', 'school'); c2_cols = [at('meera_2a', 'Roll'), at('meera_2a', 'name,'), at('meera_2a', 'class.')]
c2_rows = at('meera_2a', 'Every'); c2_snack = at('chintu_2c', 'column'); c2_whole = at('meera_2d', 'whole')
c2_tags = [at('meera_2d', 'Neat'), at('meera_2d', 'fixed'), at('meera_2d', 'strict')]
c2_box = at('meera_2f', 'box'); c2_diff = at('meera_2f', 'different'); c2_A = at('meera_2g', "Aarav's"); c2_Z = at('meera_2g', "Zoya's")
c2_C = at('chintu_2h', 'snacks,')
for tt in [c2_reg] + c2_cols + c2_tags + [c2_box, c2_A, c2_Z, c2_C]: fx('c2', tt, 'pop')
fx('c2', c2_snack, 'pop'); fx('c2', c2_whole, 'buzz')
for i in range(4): fx('c2', c2_rows + i * 0.15, 'tick')

c3_tab = at('meera_3a', 'tables'); c3_col = at('meera_3a', 'Columns'); c3_row = at('meera_3a', 'one row'); c3_fix = at('meera_3b', 'fixed')
c3_sch = at('meera_3b', 'schema'); c3_users = at('chintu_3c', 'users'); c3_hc = [at('chintu_3c', 'Name,'), at('chintu_3c', 'city,'), at('chintu_3c', 'phone.')]
c3_P2 = at('meera_3d'); c3_ord = at('meera_3d', 'orders table'); c3_uid = at('meera_3d', 'user id'); c3_link = at('meera_3e', 'links')
c3_rel = at('meera_3e', 'relation'); c3_join = at('meera_3h', 'join'); c3_P3 = at('chintu_3i'); c3_sel = at('meera_3j', 'Select')
c3_delhi = at('meera_3j', 'Delhi'); c3_joke = at('chintu_3k', 'Select'); c3_P4 = at('meera_3l'); c3_acid = at('meera_3l', 'ACID')
c3_send = at('meera_3m', 'send'); c3_leave = at('meera_3m', 'leaves'); c3_enter = at('meera_3m', 'enters'); c3_both = at('meera_3n', 'both')
c3_never = at('meera_3n', 'never')
for tt in [c3_tab, c3_col, c3_row, c3_sch, c3_users, c3_ord, c3_uid, c3_rel, c3_join, c3_joke, c3_acid, c3_leave, c3_enter]: fx('c3', tt, 'pop')
for tt in [c3_link, c3_delhi, c3_both]: fx('c3', tt, 'ding')
fx('c3', c3_sel, 'whoosh')

c4_doc = at('meera_4a', 'document'); c4_P1 = at('meera_4b'); c4_ord = at('chintu_4c', 'orders'); c4_one = at('meera_4d', 'one read')
c4_next = at('meera_4e', 'next'); c4_diff = at('meera_4e', 'different'); c4_P2 = at('meera_4g'); c4_kv = at('meera_4g', 'Key')
c4_cache = at('meera_4g', 'caching'); c4_wc = at('meera_4h', 'Wide'); c4_tons = at('meera_4h', 'tons'); c4_gr = at('meera_4i', 'graph')
c4_fof = at('meera_4i', 'friends'); c4_shop = at('chintu_4j', 'samosa')
for tt in [c4_doc, c4_ord, c4_one, c4_next, c4_diff, c4_kv, c4_cache, c4_wc, c4_tons, c4_gr, c4_fof]: fx('c4', tt, 'pop')
fx('c4', c4_P1, 'whoosh'); fx('c4', c4_shop, 'ding')

c5_mil = at('chintu_5a', 'million'); c5_up = at('meera_5b', 'scales'); c5_big = at('meera_5b', 'bigger'); c5_lim = at('meera_5d', 'limit')
c5_cost = at('meera_5d', 'costs'); c5_shard = at('meera_5e', 'shard'); c5_hard = at('meera_5e', 'harder'); c5_out = at('meera_5f', 'scale')
c5_add = at('meera_5f', 'Add'); c5_spread = at('meera_5f', 'spreads'); c5_shep = at('meera_5f', 'sharding'); c5_T = at('meera_5i')
c5_strict = at('meera_5i', 'strict'); c5_flex = at('meera_5i', 'flexible'); c5_messy = at('meera_5i', 'messy')
for tt in [c5_up, c5_out, c5_shep, c5_strict, c5_flex]: fx('c5', tt, 'pop')
for i in range(6): fx('c5', c5_add + i * 0.3, 'pop')
for tt in [c5_lim, c5_hard, c5_messy]: fx('c5', tt, 'buzz')
fx('c5', c5_big, 'whoosh'); fx('c5', c5_shard, 'whoosh'); fx('c5', c5_mil, 'ding')

c6_sql = at('meera_6b', 'Use'); c6_correct = at('meera_6b', 'correct')
c6_L = [at('meera_6b', 'Payments'), at('meera_6b', 'banking'), at('meera_6b', 'orders.'), at('meera_6b', 'banks')]
c6_no = at('meera_6d', 'Use'); c6_huge = at('meera_6d', 'huge')
c6_R = [at('meera_6e', 'Chat'), at('meera_6e', 'activity'), at('meera_6e', 'product'), at('meera_6f', 'Instagram'), at('meera_6f', 'WhatsApp')]
c6_both = at('meera_6h', 'both.')
for tt in [c6_sql, c6_no] + c6_L + c6_R: fx('c6', tt, 'pop')
fx('c6', c6_both, 'win')

c7_rows = [at('meera_7a', 'Structure'), at('meera_7b', 'Schema'), at('meera_7c', 'Scaling'), at('meera_7d', 'Best')]
c7_end = at('chintu_7e')
for tt in c7_rows: fx('c7', tt, 'pop')
fx('c7', c7_end, 'ding')

Q_PICK = {0: at('chintu_8c'), 1: at('chintu_8f'), 2: at('chintu_8i')}
Q_REV = {0: at('meera_8d'), 1: at('meera_8g'), 2: at('meera_8j')}
Q_ST = [START[k] for k in QUIZ_Q]
fx('quiz', 0.6, 'pop')
for i in range(3):
    fx('quiz', Q_ST[i], 'whoosh'); fx('quiz', Q_PICK[i], 'pop')
    fx('quiz', Q_REV[i], 'ding' if i != 0 else 'buzz')
    if i == 0: fx('quiz', Q_REV[i] + 0.35, 'ding')
fx('quiz', at('meera_8j', 'How'), 'win')

o_site = at('meera_8l', 'vizu'); o_follow = at('meera_8l', 'follow'); o_next = at('meera_8l', 'part'); o_sam = at('chintu_8m', 'samosa')
for tt in [o_site, o_follow, o_next]: fx('outro', tt, 'pop')
fx('outro', o_sam, 'ding')

E.finish()
CAST = Cast(('chintu', 'meera'))

# ---------------- characters (drawn from the header so they stay solid across cuts) ----------------
CHX, CHY, MEX, MEY, CS = 250, 520, 1670, 520, 0.85
CH_MOOD = {'chintu_1c': 'shock', 'chintu_1d': 'think', 'chintu_2h': 'laugh', 'chintu_3k': 'laugh', 'chintu_3o': 'laugh',
           'chintu_4c': 'shock', 'chintu_4j': 'laugh', 'chintu_5a': 'think', 'chintu_5c': 'laugh', 'chintu_5g': 'laugh',
           'chintu_6a': 'think', 'chintu_6g': 'think', 'chintu_6i': 'laugh', 'chintu_8c': 'think', 'chintu_8i': 'think',
           'meera_8d': 'sad', 'meera_8g': 'laugh', 'meera_8j': 'shock', 'chintu_8m': 'laugh', 'meera_1b': 'shock'}
ME_MOOD = {'chintu_2h': 'laugh', 'chintu_3k': 'laugh', 'chintu_3o': 'laugh', 'chintu_4j': 'laugh', 'chintu_6i': 'laugh',
           'chintu_8i': 'laugh', 'chintu_1d': 'think', 'chintu_8c': 'think', 'chintu_5c': 'laugh', 'chintu_8m': 'laugh'}
CH_POINT = {'chintu_3c', 'chintu_4c', 'chintu_2c'}
ME_NOPOINT = {'meera_1b', 'meera_1e', 'meera_8a', 'meera_8l'}

def cur_line(t):
    best = None
    for st, en, who, key in CAST.lines:
        if st - 0.05 <= t < en + 0.35: best = (st, en, who, key)
    return best

def scene_at(t):
    cur = E.scenes[0]
    for sc in E.scenes:
        if sc[1] <= t: cur = sc
    return cur[0], cur[1]

def in_countdown(t):
    st = SCST['quiz']
    return any(st + CD[k] <= t < st + CD[k] + 3.0 for k in CD)

def draw_cast(dl):
    t = E.NOW
    ln = cur_line(t); key = ln[3] if ln else None
    who = CAST.speaker(t)
    name, st = scene_at(t)
    cd = in_countdown(t)
    ck = dict(mood=CH_MOOD.get(key, 'happy'), look=(1, 0) if who == 'meera' else (0.5, 0.1))
    if cd: ck.update(mood='think', look=(0.6, -0.3))
    if who == 'chintu' and key in CH_POINT: ck['point'] = (560, 470)
    if (key == 'chintu_1a' and t - ln[0] < 1.8) or key == 'chintu_8m': ck['wave'] = True
    CAST.draw('chintu', dl, CHX, CHY, CS, **ck)
    mk = dict(mood=ME_MOOD.get(key, 'happy'), look=(-1, 0) if who == 'chintu' else (-0.5, 0.1))
    if cd: mk.update(look=(-0.4, 0.2))
    if who == 'meera' and name in ('c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'quiz') and key not in ME_NOPOINT:
        mk['point'] = (1400, 470)
    if key in ('meera_8l', 'chintu_8m') and name == 'outro' and t - SCST['outro'] > o_follow: mk['wave'] = True
    CAST.draw('meera', dl, MEX, MEY, CS, **mk)
    if name == 'outro' and t - st >= o_sam:      # Chintu found his samosa
        p = back(prog(t - st, o_sam, o_sam + 0.4))
        samosa(dl, CHX + 10, CHY - 215 + math.sin(t * 4) * 6, 0.9 * p)

def header(dl, L, G):
    f = F('black', 44)
    wv, wc = f.getlength('Vizu'), f.getlength('Code')
    dl.text((56, 60), 'Vizu', font=f, fill=rgba(INK), anchor='lm')
    gtext(L, G, 'Code', 'black', 44, 56 + wv + wc / 2, 62, glow=False)
    T(dl, 'SYSTEM DESIGN FOR BEGINNERS · PART 6', 17, 58, 104, SOFT, 'b', anchor='lm')
    name, st = scene_at(E.NOW)
    lab = LABEL[name]
    sc = back(prog(E.NOW - st, 0.0, 0.4)) if st > 0 else 1.0
    fz = 26 * sc
    tw = F('xb', 26).getlength(lab) + 84
    cx = W - 56 - tw / 2; cy = 64
    if sc > 0.02:
        box = (cx - tw / 2 * sc, cy - 29 * sc, cx + tw / 2 * sc, cy + 29 * sc)
        shadow_rr(dl, box, 29 * sc, 1, 6)
        dl.rounded_rectangle(box, radius=29 * sc, fill=rgba(PAPER), outline=rgba(INK), width=3)
        dl.ellipse((box[0] + 20 * sc, cy - 8 * sc, box[0] + 36 * sc, cy + 8 * sc), fill=rgba(ORANGE))
        T(dl, lab, fz, cx + 14 * sc, cy + 1, INK, 'xb')
    draw_cast(dl)
E.header = header

def caption(dl, tsec):
    cur = [c for c in CAPS if c[0] <= tsec < c[1]]
    if not cur: return
    s0, e, txt, who = cur[-1]
    p = ease_out(prog(tsec, s0, s0 + 0.12))
    size = 44; f = F('black', size); sp = size * 0.3
    words = txt.upper().split()
    tw = sum(f.getlength(w_) for w_ in words) + sp * (len(words) - 1)
    tag = who.upper(); tf = F('black', 22); tagw = tf.getlength(tag) + 36
    total = tagw + 26 + tw; cy = 985
    pill(dl, W / 2, cy, total + 64, 80, INK, None, alpha=0.93 * p)
    x = W / 2 - total / 2
    tcol = CHINTU_COL if who == 'chintu' else MEERA_COL
    dl.rounded_rectangle((x, cy - 21, x + tagw, cy + 21), radius=21, fill=rgba(tcol, p))
    dl.text((x + tagw / 2, cy + 1), tag, font=tf, fill=rgba(INK, p), anchor='mm')
    x += tagw + 26
    C = E.CFG
    for w_ in words:
        bare = re.sub(r'[^\w@.]', '', w_).lower().strip('.')
        col = PAPER
        if bare in C['CAPTION_TEAL']: col = TEAL
        elif bare in C['CAPTION_CORAL']: col = CORAL
        elif re.fullmatch(r'\d+', bare) or bare in C['CAPTION_GOLD']: col = GOLD
        dl.text((x, cy + 2), w_, font=f, fill=rgba(col, p), anchor='lm')
        x += f.getlength(w_) + sp
E.caption = caption

def title_card(dl, lt, n, title):
    if lt > 1.45: return
    a = ease_out(prog(lt, 0.0, 0.25)) * (1 - prog(lt, 1.1, 1.4))
    sc = back(prog(lt, 0, 0.35))
    if sc <= 0.02: return
    w = (max(560, F('black', 64).getlength(title) + 130)) * sc; h = 210 * sc
    card(dl, (960 - w / 2, 500 - h / 2, 960 + w / 2, 500 + h / 2), 36, PAPER, alpha=a)
    T(dl, f'CHAPTER {n}', 30 * sc, 960, 500 - 50 * sc, ORANGE, 'black', alpha=a)
    T(dl, title, 64 * sc, 960, 500 + 28 * sc, INK, 'black', alpha=a)

def fade(lt, a, b=None):
    """Fade in at a (0.35 s), optionally fade out ending at b."""
    v = ease_out(prog(lt, a, a + 0.35))
    if b is not None: v *= 1 - prog(lt, b - 0.25, b)
    return v


# ---------------- chapter 1: the big fight ----------------
def sc_c1(L, G, dl, dg, lt, dur):
    gtext(L, G, 'SQL vs NoSQL', 'black', 120, 960, 215, glow=False)
    tag_pill(dl, 960, 318, 'Which database should Chintu pick?', SOFT, size=28)
    cx, cy = 960, 640
    if lt < c1_S:
        phone(dl, cx, cy, 0.95 * back(prog(lt, c1_app, c1_app + 0.4)))
    elif lt < c1_B:
        pizza_box(dl, cx, cy + 40, 1.0 * back(prog(lt, c1_S, c1_S + 0.4)))
    else:
        s = back(prog(lt, c1_B, c1_B + 0.4))
        r = 90 * s
        dl.ellipse((cx - r + 8, cy - r + 9, cx + r + 8, cy + r + 9), fill=rgba(INK, 0.18))
        grad_pill(L, G, cx, cy, 2 * r, 2 * r)
        dl.ellipse((cx - r, cy - r, cx + r, cy + r), outline=rgba(INK), width=5)
        T(dl, 'VS', 80 * s, cx, cy + 3, INK_ON_GRAD, 'black')
        T(dl, "Let's learn both!", 34, cx, cy + 140, INK, 'black', alpha=fade(lt, c1_B + 0.2))
    if c1_Q <= lt < c1_B:     # confused question marks
        for i, (dx, dy) in enumerate([(-170, -150), (160, -170), (-200, 40), (190, 20)]):
            p = back(prog(lt, c1_Q + i * 0.12, c1_Q + i * 0.12 + 0.35))
            T(dl, '?', 70 * p, cx + dx, cy + dy + math.sin(lt * 4 + i) * 8, CORAL if i % 2 else VIOLET, 'black')
    jit = math.sin(lt * 26) * 3
    for (px, col, nm, tb, tbub, txt, tt, tlab, lcol, pony) in [
            (640, BLUE, 'Rohan', c1_R, c1_Rb, 'Use MySQL!', c1_M1, 'SQL database', SQLC, False),
            (1280, VIOLET, 'Priya', c1_P, c1_Pb, 'Use MongoDB!', c1_M2, 'NoSQL database', NOC, True)]:
        p = back(prog(lt, tb, tb + 0.4))
        if p <= 0.02: continue
        person(dl, px, 650, 2.4 * p, col, pony=pony)
        T(dl, nm, 30 * p, px, 800, INK, 'black')
        b = back(prog(lt, tbub, tbub + 0.35))
        bubble(dl, px + (jit if lt < c1_M1 else 0), 485, txt, (px, 575), size=36, sc=b)
        tag_pill(dl, px, 862, tlab, lcol, size=26, fname='xb', sc=back(prog(lt, tt, tt + 0.35)))


# ---------------- chapter 2: register vs note cards ----------------
STUDENTS = [('1', 'Aarav', '5A'), ('2', 'Zoya', '5A'), ('3', 'Chintu', '5B'), ('4', 'Meera', '5B')]
def sc_c2(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 2, 'Register vs Note Cards')
    a = fade(lt, c2_reg)
    if a > 0:
        T(dl, 'SQL = school register', 36, 705, 200, SQLC, 'black', alpha=a)
        card(dl, (482, 240, 928, 790), 26, (252, 250, 240), alpha=a)
        for i in range(6):        # spiral rings on top
            x = 530 + i * 70
            dl.ellipse((x - 9, 232, x + 9, 250), fill=rgba(PAPER, a), outline=rgba(INK, a), width=3)
        T(dl, 'CLASS REGISTER', 22, 705, 280, SOFT, 'black', alpha=a)
        hc = {j: light(GOLD, 0.6) for j in range(3) if prog(lt, c2_cols[j], c2_cols[j] + 0.1) > 0 and lt < c2_cols[j] + 1.2}
        rowp = [prog(lt, c2_rows + i * 0.15, c2_rows + i * 0.15 + 0.2) for i in range(4)]
        shake = math.sin(lt * 40) * 4 if c2_whole <= lt < c2_whole + 0.6 else 0
        table(dl, 500 + shake, 310, [110, 180, 120], ['Roll No', 'Name', 'Class'], STUDENTS, rh=62, size=28, alpha=a, rowp=rowp,
              hcols=hc, hfill=light(SQLC, 0.3))
        # Chintu's extra column tries to squeeze in
        g = fade(lt, c2_snack, c2_tags[0] + 0.2)
        if g > 0:
            gx = 910 + 20 * (1 - ease_out(prog(lt, c2_snack, c2_snack + 0.4)))
            nrows = sum(1 for v in rowp if v > 0)
            y1 = 310 + 62 * (1 + nrows)
            for yy in range(310, int(y1), 22):
                dl.line([(gx, yy), (gx, min(y1, yy + 12))], fill=rgba(CORAL, g), width=4)
                dl.line([(gx + 170, yy), (gx + 170, min(y1, yy + 12))], fill=rgba(CORAL, g), width=4)
            dl.line([(gx, 310), (gx + 170, 310)], fill=rgba(CORAL, g), width=4)
            dl.line([(gx, y1), (gx + 170, y1)], fill=rgba(CORAL, g), width=4)
            T(dl, 'Fav snack?', 24, gx + 85, 341, CORAL, 'black', alpha=g)
            for i in range(nrows): T(dl, '?', 30, gx + 85, 310 + 62 * (1.5 + i), CORAL, 'black', alpha=g)
            if lt >= c2_whole:
                cross_badge(dl, gx + 170, 300, 30, prog(lt, c2_whole, c2_whole + 0.4))
        for i, (s, col) in enumerate([('neat', NOC), ('fixed', SQLC), ('strict', CORAL)]):
            tag_pill(dl, 575 + i * 130, 735, s, col, size=28, fname='black', sc=back(prog(lt, c2_tags[i], c2_tags[i] + 0.35)), alpha=a)
    b = fade(lt, c2_box)
    if b > 0:
        T(dl, 'NoSQL = note cards', 36, 1215, 200, NOC, 'black', alpha=b)
        cards = [((1045, 245, 1395, 390), (255, 246, 200), 'Aarav', ['hobbies: cricket, chess', 'age: 10'], c2_A, -6),
                 ((1065, 405, 1415, 500), (214, 246, 236), 'Zoya', ['pet: Bruno the cat'], c2_Z, 4),
                 ((1035, 515, 1405, 690), (255, 226, 204), 'Chintu', ['snacks: samosa,', 'samosa, MORE samosa!', 'homework: ???'], c2_C, -3)]
        for box, col, nm, lines, tt, off in cards:
            p = ease_out(prog(lt, c2_diff - 0.2, c2_diff + 0.3))
            if p <= 0: continue
            dy = (1 - p) * 120
            x0, y0, x1, y1 = box
            card(dl, (x0 + off, y0 + dy, x1 + off, y1 + dy), 16, col, alpha=b * p)
            q = ease_out(prog(lt, tt, tt + 0.35))
            if q <= 0:
                for k in range(len(lines) + 1):   # unlabelled scribbles until Meera reads the card
                    dl.rounded_rectangle((x0 + off + 24, y0 + dy + 26 + k * 34, x1 + off - 60 - k * 30, y0 + dy + 36 + k * 34), radius=5,
                                         fill=rgba(INK, 0.15 * b * p))
                continue
            T(dl, nm, 28, x0 + off + 22, y0 + dy + 32, INK, 'black', alpha=q, anchor='lm')
            for k, ln in enumerate(lines):
                T(dl, ln, fitsz(ln, 'sb', 24, x1 - x0 - 40), x0 + off + 22, y0 + dy + 70 + k * 34, SOFT if nm != 'Chintu' else (200, 90, 40),
                  'sb', alpha=q, anchor='lm')
        # the box the cards live in
        dl.polygon([(1030, 700), (1420, 700), (1400, 800), (1050, 800)], fill=rgba((200, 160, 120), b))
        dl.line([(1030, 700), (1420, 700), (1400, 800), (1050, 800), (1030, 700)], fill=rgba(INK, b), width=5)
        T(dl, 'NOTE CARDS', 26, 1225, 752, PAPER, 'black', alpha=b)


# ---------------- chapter 3: SQL tables, joins, query, ACID ----------------
USERS = [('1', 'Chintu', 'Delhi', '98111'), ('2', 'Meera', 'Mumbai', '98222'), ('3', 'Rohan', 'Delhi', '98333')]
ORDERS = [('101', '1', 'Samosa'), ('102', '3', 'Pizza'), ('103', '1', 'Lassi')]
UCOL = {0: ORANGE, 2: VIOLET}
def sc_c3(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 3, 'SQL: Tables')
    # --- phase 1: one big users table
    a = fade(lt, c3_tab, c3_P2)
    if a > 0:
        x0, y0, rh = 620, 300, 66
        hc = {}
        for j, tt in zip((1, 2, 3), c3_hc):
            if tt <= lt < tt + 1.0: hc[j] = light(TEAL, 0.45)
        if c3_col <= lt < c3_col + 1.6: hc = {j: light(GOLD, 0.6) for j in range(4)}
        hl = {1: light(GOLD, 0.45)} if c3_row <= lt < c3_row + 1.6 else None
        table(dl, x0, y0, [90, 200, 190, 200], ['id', 'name', 'city', 'phone'], USERS, rh=rh, size=30, alpha=a, hcols=hc, hl=hl,
              outline_hdr=GOLD if lt >= c3_sch else None, hfill=light(SQLC, 0.3))
        tag_pill(dl, 690, 252, 'users', SQLC, size=28, fname='black', alpha=a, sc=1 + 0.15 * (1 - prog(lt, c3_users, c3_users + 0.4)) if lt >= c3_users else 1)
        p = back(prog(lt, c3_col, c3_col + 0.35))
        if p > 0.02:
            tag_pill(dl, 1180, 240, 'COLUMNS', INK, size=24, fname='black', sc=p, alpha=a)
            arrow_line(dl, 1180, 262, 1180, 296, INK, 5, 16, alpha=a)
        p = back(prog(lt, c3_row, c3_row + 0.35))
        if p > 0.02:
            tag_pill(dl, 535, 300 + rh * 2.5, 'ROW', INK, size=24, fname='black', sc=p, alpha=a)
            arrow_line(dl, 572, 300 + rh * 2.5, 612, 300 + rh * 2.5, INK, 5, 16, alpha=a)
        gpill(L, G, dl, 960, 650, 820, 90, 'SCHEMA = the fixed plan of columns', 38, sc=back(prog(lt, c3_sch, c3_sch + 0.4)), alpha=a)
        if lt >= c3_fix:
            tag_pill(dl, 960, 760, 'decided in advance', SOFT, size=26, alpha=a * fade(lt, c3_fix))
    # --- phase 2: users + orders, relation, join
    b = fade(lt, c3_P2, c3_P3)
    if b > 0:
        ux, ox, y0, rh = 480, 1050, 290, 60
        table(dl, ux, y0, [70, 160, 150], ['id', 'name', 'city'], [u[:3] for u in USERS], rh=rh, size=27, alpha=b, hfill=light(SQLC, 0.3),
              hcols={0: light(GOLD, 0.6)} if lt >= c3_uid else None)
        tag_pill(dl, 560, 244, 'users', SQLC, size=26, fname='black', alpha=b)
        op = [prog(lt, c3_ord + i * 0.15, c3_ord + i * 0.15 + 0.2) for i in range(3)]
        oa = b * ease_out(prog(lt, c3_ord - 0.2, c3_ord + 0.2))
        table(dl, ox, y0, [130, 120, 140], ['order_id', 'user_id', 'item'], ORDERS, rh=rh, size=27, alpha=oa, rowp=op,
              hfill=light(ORANGE, 0.3), hcols={1: light(GOLD, 0.6)} if lt >= c3_uid else None)
        tag_pill(dl, 1160, 244, 'orders', ORANGE, size=26, fname='black', alpha=oa)
        if lt >= c3_link:
            for i, (oid, uid, item) in enumerate(ORDERS):
                ui = int(uid) - 1
                p = prog(lt, c3_link + i * 0.2, c3_link + i * 0.2 + 0.6)
                curve(dl, (ox - 4, y0 + rh * (1.5 + i)), (ux + 384, y0 + rh * (1.5 + ui)), -40 + i * 25, UCOL[ui], 6, p, b)
        p = back(prog(lt, c3_rel, c3_rel + 0.35))
        if p > 0.02: tag_pill(dl, 965, 244, 'RELATION', VIOLET, size=26, fname='black', sc=p, alpha=b)
        if lt >= c3_join:
            j = prog(lt, c3_join, c3_join + 0.5)
            arrow_line(dl, 670, 535, 800, 640, INK, 5, 18, alpha=b, p=j)
            arrow_line(dl, 1245, 535, 1160, 640, INK, 5, 18, alpha=b, p=j)
            gpill(L, G, dl, 615, 730, 190, 84, 'JOIN', 44, sc=back(prog(lt, c3_join, c3_join + 0.4)), alpha=b)
            rp = [prog(lt, c3_join + 0.5 + i * 0.25, c3_join + 0.7 + i * 0.25) for i in range(3)]
            table(dl, 780, 640, [190, 190], ['name', 'item'], [('Chintu', 'Samosa'), ('Rohan', 'Pizza'), ('Chintu', 'Lassi')],
                  rh=50, size=26, alpha=b * ease_out(j), rowp=rp, hfill=light(TEAL, 0.35))
    # --- phase 3: a SQL query
    c = fade(lt, c3_P3, c3_P4)
    if c > 0:
        dark_card(dl, (540, 200, 1380, 410), alpha=c)
        typed = 0 if lt < c3_sel else int((lt - c3_sel) / max(0.3, c3_delhi + 0.3 - c3_sel) * 44)
        code_lines(dl, 590, 280, ['SELECT name FROM users', "WHERE city = 'Delhi';"], 44, 72, alpha=c, upto=typed)
        if lt < c3_sel:
            T(dl, 'ask the database a question...', 30, 960, 310, (170, 166, 200), 'sb', alpha=c)
        hl = {0: light(TEAL, 0.45), 2: light(TEAL, 0.45)} if lt >= c3_delhi else None
        table(dl, 760, 450, [70, 170, 160], ['id', 'name', 'city'], [u[:3] for u in USERS], rh=58, size=27, alpha=c, hl=hl,
              hfill=light(SQLC, 0.3))
        p = back(prog(lt, c3_delhi + 0.3, c3_delhi + 0.7))
        if p > 0.02:
            arrow_line(dl, 1172, 565, 1205, 565, NOC, 6, 18, alpha=c)
            tag_pill(dl, 1315, 565, 'Chintu, Rohan', NOC, size=26, fname='black', sc=p, alpha=c)
        k = back(prog(lt, c3_joke, c3_joke + 0.4))
        if k > 0.02:
            tag_pill(dl, 935, 800, 'SELECT samosa FROM kitchen;', ORANGE, size=28, fname='mono', sc=k, alpha=c)
            samosa(dl, 1235, 795, 0.55 * k, c)
    # --- phase 4: ACID bank transfer
    d = fade(lt, c3_P4)
    if d > 0:
        gtext(L, G, 'ACID', 'black', 110, 960, 230, scale=back(prog(lt, c3_acid, c3_acid + 0.4)), glow=False)
        T(dl, 'transactions', 32, 960, 312, SOFT, 'b', alpha=fade(lt, c3_acid + 0.2))
        mv = prog(lt, c3_leave, c3_enter + 0.2)
        for (x, nm, b0, b1, tt) in [(660, 'Chintu', 500, 400, c3_leave), (1260, 'Friend', 200, 300, c3_enter)]:
            card(dl, (x - 150, 410, x + 150, 590), 26, PAPER, alpha=d)
            T(dl, nm, 34, x, 455, INK, 'black', alpha=d)
            done = lt >= tt + 0.25
            T(dl, f'₹{b1 if done else b0}', 54, x, 530, (CORAL if x < 900 else NOC) if done else INK, 'black', alpha=d)
        for xx in range(830, 1100, 26):
            dl.line([(xx, 500), (xx + 12, 500)], fill=rgba(INK, 0.4 * d), width=4)
        if lt >= c3_send:
            if 0 < mv < 1:
                cx = lerp(820, 1100, ease_in_out(mv))
                dl.ellipse((cx - 38, 462, cx + 38, 538), fill=rgba(GOLD, d), outline=rgba(INK, d), width=4)
                T(dl, '₹100', 22, cx, 501, INK, 'black', alpha=d)
            elif mv <= 0:
                T(dl, 'send ₹100', 28, 960, 465, INK, 'black', alpha=d * fade(lt, c3_send))
        for i, (s, x, tt, col) in enumerate([('1  take ₹100', 660, c3_leave, CORAL), ('2  give ₹100', 1260, c3_enter, NOC)]):
            tag_pill(dl, x, 650, s, col, size=26, fname='black', sc=back(prog(lt, tt, tt + 0.35)), alpha=d)
        gpill(L, G, dl, 960, 770, 640, 90, 'BOTH steps, or NEITHER', 42, sc=back(prog(lt, c3_both, c3_both + 0.4)), alpha=d)
        if lt >= c3_never:
            check_badge(dl, 1300, 770, 34, prog(lt, c3_never, c3_never + 0.4))


# ---------------- chapter 4: NoSQL documents + other types ----------------
DOC1 = ['{', '  "_id": 1,', '  "name": "Chintu",', '  "city": "Delhi",', '  "orders": [', '    {"item": "Samosa"},', '    {"item": "Lassi"}', '  ]', '}']
DOC2 = ['{', '  "_id": 2,', '  "name": "Meera",', '  "pet": "Bruno",', '  "hobbies": ["chess"]', '}']
def sc_c4(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 4, 'NoSQL: Documents')
    a = fade(lt, c4_doc, c4_P1 + 0.1)
    if a > 0:
        T(dl, 'DOCUMENT DATABASE', 66, 960, 450, INK, 'black', alpha=a)
        tag_pill(dl, 960, 545, 'e.g. MongoDB', NOC, size=32, fname='black', alpha=a)
        for i, col in enumerate([(255, 246, 200), (214, 246, 236), (255, 226, 204)]):
            card(dl, (760 + i * 140, 640 - i * 12, 880 + i * 140, 760 - i * 12), 14, col, alpha=a)
            for k in range(3):
                dl.rounded_rectangle((778 + i * 140, 664 - i * 12 + k * 26, 860 + i * 140 - k * 14, 672 - i * 12 + k * 26), radius=4,
                                     fill=rgba(INK, 0.2 * a))
    b = fade(lt, c4_P1, c4_P2)
    if b > 0:
        T(dl, '1 user = 1 JSON document', 32, 715, 205, NOC, 'black', alpha=b)
        dark_card(dl, (480, 240, 950, 740), alpha=b)
        typed = int((lt - c4_P1) / 1.6 * sum(len(l) + 1 for l in DOC1)) if lt > c4_P1 else 0
        hl = {i: ORANGE for i in range(4, 8)} if lt >= c4_ord else None
        code_lines(dl, 516, 300, DOC1, 26, 50, alpha=b, upto=typed, hl=hl, box_w=420)
        tag_pill(dl, 715, 795, '1 read · no JOIN', NOC, size=28, fname='black', sc=back(prog(lt, c4_one, c4_one + 0.35)), alpha=b)
        p = ease_out(prog(lt, c4_next, c4_next + 0.45))
        if p > 0:
            dx = (1 - p) * 300
            dark_card(dl, (990 + dx, 240, 1440 + dx, 590), alpha=b * p)
            hl2 = {3: TEAL, 4: TEAL} if lt >= c4_diff else None
            code_lines(dl, 1026 + dx, 300, DOC2, 26, 50, alpha=b * p, hl=hl2, box_w=400)
            tag_pill(dl, 1215, 650, 'different fields? fine!', NOC, size=28, fname='black', sc=back(prog(lt, c4_diff, c4_diff + 0.35)), alpha=b)
    c = fade(lt, c4_P2)
    if c > 0:
        T(dl, 'OTHER NoSQL TYPES', 40, 960, 195, INK, 'black', alpha=c)
        specs = [(640, 'KEY-VALUE', 'e.g. Redis', c4_kv, (255, 236, 214)), (960, 'WIDE-COLUMN', 'e.g. Cassandra', c4_wc, (226, 236, 255)),
                 (1280, 'GRAPH', 'e.g. Neo4j', c4_gr, (232, 246, 226))]
        for i, (cx, ttl, eg, tt, col) in enumerate(specs):
            p = ease_out(prog(lt, tt - 0.1, tt + 0.35))
            if p <= 0: continue
            dy = (1 - p) * 80
            card(dl, (cx - 150, 245 + dy, cx + 150, 800 + dy), 26, col, alpha=c * p)
            T(dl, ttl, 32, cx, 290 + dy, INK, 'black', alpha=c * p)
            T(dl, eg, 24, cx, 330 + dy, SOFT, 'sb', alpha=c * p)
            if i == 0:
                for k, (kk, vv) in enumerate([('user:1', 'Chintu'), ('cart:1', '2 samosas'), ('top', 'Samosa')]):
                    y = 410 + k * 90 + dy
                    q = c * p * ease_out(prog(lt, tt + 0.2 + k * 0.15, tt + 0.5 + k * 0.15))
                    dl.rounded_rectangle((cx - 132, y - 26, cx - 22, y + 26), radius=12, fill=rgba(light(GOLD, 0.5), q), outline=rgba(INK, q), width=3)
                    T(dl, kk, fitsz(kk, 'mono', 22, 100), cx - 77, y + 1, INK, 'mono', alpha=q)
                    T(dl, '→', 26, cx - 4, y, INK, 'mono', alpha=q)
                    dl.rounded_rectangle((cx + 14, y - 26, cx + 136, y + 26), radius=12, fill=rgba(PAPER, q), outline=rgba(INK, q), width=3)
                    T(dl, vv, fitsz(vv, 'sb', 22, 112), cx + 75, y + 1, INK, 'sb', alpha=q)
                tag_pill(dl, cx, 740 + dy, 'see: Caching episode', ORANGE, size=20, fname='black', sc=back(prog(lt, c4_cache, c4_cache + 0.35)), alpha=c)
            elif i == 1:
                for k, n in enumerate([2, 4, 3, 5]):
                    y = 405 + k * 66 + dy
                    q = c * p * ease_out(prog(lt, tt + 0.2 + k * 0.12, tt + 0.5 + k * 0.12))
                    dl.rounded_rectangle((cx - 130, y - 22, cx - 70, y + 22), radius=8, fill=rgba(light(SQLC, 0.5), q), outline=rgba(INK, q), width=3)
                    for j in range(n):
                        x = cx - 60 + j * 38
                        dl.rounded_rectangle((x, y - 18, x + 32, y + 18), radius=6, fill=rgba([CORAL, GOLD, TEAL, VIOLET, ORANGE][(j + k) % 5], q),
                                             outline=rgba(INK, q), width=2)
                if lt >= tt + 0.5:     # a stream of incoming writes
                    for j in range(5):
                        ph = ((lt - tt) * 1.3 + j / 5) % 1
                        x = cx - 110 + j * 52; y = 352 + dy + ph * 34
                        envelope_a = c * p * math.sin(ph * math.pi)
                        dl.rounded_rectangle((x - 14, y - 10, x + 14, y + 10), radius=4, fill=rgba((255, 214, 102), envelope_a),
                                             outline=rgba(INK, envelope_a), width=2)
                tag_pill(dl, cx, 740 + dy, 'tons of writes', SQLC, size=22, fname='black', sc=back(prog(lt, c4_tons, c4_tons + 0.35)), alpha=c)
            else:
                N = {'C': (cx - 75, 420), 'R': (cx + 75, 480), 'P': (cx - 60, 590), 'S': (cx + 70, 680)}
                edges = [('C', 'R', c4_gr), ('R', 'P', c4_fof), ('P', 'S', c4_shop)]
                for e0, e1, te in edges:
                    if lt >= te:
                        hot = (e0, e1) in (('R', 'P'),) and lt < c4_shop + 0.2 or (e0, e1) == ('P', 'S')
                        q = prog(lt, te, te + 0.4)
                        A, B = (N[e0][0], N[e0][1] + dy), (N[e1][0], N[e1][1] + dy)
                        dl.line([A, lerp2(A, B, q)], fill=rgba(ORANGE if hot else INK, c * p), width=7 if hot else 5)
                for nm, (x, y) in N.items():
                    tn = {'C': c4_gr, 'R': c4_gr + 0.15, 'P': c4_fof, 'S': c4_shop}[nm]
                    q = back(prog(lt, tn, tn + 0.35))
                    if q <= 0.02: continue
                    y += dy
                    r = 34 * q
                    colr = {'C': ORANGE, 'R': BLUE, 'P': VIOLET, 'S': GOLD}[nm]
                    dl.ellipse((x - r, y - r, x + r, y + r), fill=rgba(colr, c), outline=rgba(INK, c), width=4)
                    if nm == 'S':
                        samosa(dl, x, y + 3, 0.42 * q, c)
                    else:
                        T(dl, nm, 30 * q, x, y + 2, PAPER, 'black', alpha=c)
                    lab = {'C': 'Chintu', 'R': 'Rohan', 'P': 'Priya', 'S': 'Samosa shop'}[nm]
                    T(dl, lab, 20, x, y + 50, INK, 'b', alpha=c * q)
                tag_pill(dl, cx, 760 + dy, 'friends of friends', VIOLET, size=20, fname='black', sc=back(prog(lt, c4_fof, c4_fof + 0.35)), alpha=c)


# ---------------- chapter 5: scaling ----------------
OUT_POS = [(1090, 430), (1215, 430), (1340, 430), (1090, 625), (1215, 625), (1340, 625)]
def sc_c5(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 5, 'Scaling')
    a = fade(lt, 1.1, c5_T)
    if a > 0:
        if lt < c5_up:      # a million users rush in
            T(dl, '1,000,000 users!', 54, 960, 230, CORAL, 'black', alpha=fade(lt, c5_mil))
            if lt >= c5_mil - 0.3:
                for i in range(12):
                    ph = ((lt - c5_mil) * 0.6 + i / 12) % 1
                    side = -1 if i % 2 else 1
                    x = 960 + side * lerp(470, 120, ph); y = 520 + (i % 3 - 1) * 90
                    person(dl, x, y, 1.0, [CORAL, TEAL, BLUE, VIOLET, ORANGE][i % 5], alpha=a * math.sin(ph * math.pi))
            db(dl, 960, 560, 1.1, lt, alpha=a)
        else:
            dl.line([(960, 250), (960, 840)], fill=rgba(INK, 0.25 * a), width=4)
            T(dl, 'SCALE UP', 44, 705, 215, SQLC, 'black', alpha=a)
            T(dl, 'one bigger machine', 24, 705, 258, SOFT, 'sb', alpha=a)
            mv = ease_in_out(prog(lt, c5_up, c5_up + 0.6))
            grow = ease_out(prog(lt, c5_big, c5_big + 0.9))
            if lt < c5_shard:
                s = 1.1 + 0.55 * grow
                state = 'busy' if lt >= c5_lim else 'ok'
                db(dl, lerp(960, 705, mv), 560, s, lt, state, alpha=a)
                if grow > 0: arrow_line(dl, 585 - 30 * grow, 640, 585 - 30 * grow, 470, SQLC, 7, 22, alpha=a * grow)
                tag_pill(dl, 705, 795, 'limit!', CORAL, size=30, fname='black', sc=back(prog(lt, c5_lim, c5_lim + 0.35)), alpha=a)
                tag_pill(dl, 855, 345, '₹₹₹', CORAL, size=30, fname='black', sc=back(prog(lt, c5_cost, c5_cost + 0.35)), alpha=a)
            else:
                sp = ease_out(prog(lt, c5_shard, c5_shard + 0.5))
                for i, x in enumerate((575, 705, 835)):
                    db(dl, lerp(705, x, sp), 560, lerp(1.65, 0.7, sp), lt, alpha=a)
                for x in (640, 770):
                    for yy in range(450, 680, 24):
                        dl.line([(x, yy), (x, yy + 12)], fill=rgba(CORAL, a * sp), width=4)
                tag_pill(dl, 705, 690, 'sharded SQL', SQLC, size=24, fname='black', alpha=a * sp)
                tag_pill(dl, 705, 795, 'joins get harder', CORAL, size=28, fname='black', sc=back(prog(lt, c5_hard, c5_hard + 0.35)), alpha=a)
        o = fade(lt, c5_out)
        if o > 0:
            T(dl, 'SCALE OUT', 44, 1215, 215, NOC, 'black', alpha=a * o)
            T(dl, 'many normal machines', 24, 1215, 258, SOFT, 'sb', alpha=a * o)
            for i, (x, y) in enumerate(OUT_POS):
                p = back(prog(lt, c5_add + i * 0.3, c5_add + i * 0.3 + 0.35))
                db(dl, x, y, 0.62 * p, lt + i, col=(214, 244, 236), alpha=a)
            if lt >= c5_spread:
                for j in range(6):
                    ph = ((lt - c5_spread) * 0.9 + j / 6) % 1
                    tx, ty = OUT_POS[j]
                    x, y = lerp2((1215, 300), (tx, ty - 60), ph)
                    q = a * math.sin(ph * math.pi)
                    dl.rounded_rectangle((x - 12, y - 12, x + 12, y + 12), radius=5, fill=rgba([CORAL, GOLD, TEAL, VIOLET, ORANGE, BLUE][j], q),
                                         outline=rgba(INK, q), width=2)
            tag_pill(dl, 1215, 795, 'see: Sharding episode', NOC, size=24, fname='black', sc=back(prog(lt, c5_shep, c5_shep + 0.35)), alpha=a)
    b = fade(lt, c5_T)
    if b > 0:
        T(dl, 'THE TRADE-OFF', 44, 960, 215, INK, 'black', alpha=b)
        ang = math.sin(lt * 1.6) * 0.05
        px, py = 960, 330
        dl.polygon([(px, py), (px - 40, py + 330), (px + 40, py + 330)], fill=rgba(light(INK, 0.35), b), outline=rgba(INK, b))
        ends = []
        for sx in (-1, 1):
            ends.append((px + sx * 300 * math.cos(ang), py + sx * 300 * math.sin(ang)))
        dl.line([ends[0], ends[1]], fill=rgba(INK, b), width=10)
        dl.ellipse((px - 14, py - 14, px + 14, py + 14), fill=rgba(GOLD, b), outline=rgba(INK, b), width=4)
        for (ex, ey), ttl, sub, col, tt in [(ends[0], 'STRICT schema', 'clean, correct data', SQLC, c5_strict),
                                            (ends[1], 'FLEXIBLE schema', 'move fast', NOC, c5_flex)]:
            q = back(prog(lt, tt, tt + 0.4))
            dl.line([(ex, ey), (ex, ey + 120)], fill=rgba(INK, b * 0.6), width=4)
            if q <= 0.02: continue
            w, h = 330 * q, 150 * q
            card(dl, (ex - w / 2, ey + 120, ex + w / 2, ey + 120 + h), 24, light(col, 0.25), alpha=b)
            T(dl, ttl, 32 * q, ex, ey + 165 * 1, col, 'black', alpha=b)
            T(dl, sub, 26 * q, ex, ey + 215, INK, 'sb', alpha=b)
        tag_pill(dl, ends[1][0], ends[1][1] + 330, 'but handle messy fields', CORAL, size=24, fname='black',
                 sc=back(prog(lt, c5_messy, c5_messy + 0.35)), alpha=b)


# ---------------- chapter 6: which one when ----------------
def item_row(dl, x0, y, w, s, col, p, icon=None):
    if p <= 0.02: return
    dx = (1 - ease_out(p)) * 60
    card(dl, (x0 + dx, y - 32, x0 + w + dx, y + 32), 32, PAPER, alpha=clamp(p * 2))
    dl.ellipse((x0 + dx + 14, y - 20, x0 + dx + 54, y + 20), fill=rgba(col, clamp(p * 2)), outline=rgba(INK, clamp(p * 2)), width=3)
    check_mark(dl, x0 + dx + 34, y + 1, 14, rgba(PAPER, clamp(p * 2)), 5)
    T(dl, s, fitsz(s, 'xb', 28, w - 90), x0 + dx + 72, y + 1, INK, 'xb', alpha=clamp(p * 2), anchor='lm')

def sc_c6(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 6, 'Which One When?')
    for (x0, ttl, sub, col, tt, ts) in [(490, 'Pick SQL', 'data must be correct', SQLC, c6_sql, c6_correct),
                                       (990, 'Pick NoSQL', 'huge, fast, varied shapes', NOC, c6_no, c6_huge)]:
        p = back(prog(lt, tt, tt + 0.4))
        if p <= 0.02: continue
        cx = x0 + 220
        w, h = 440 * p, 76 * p
        card(dl, (cx - w / 2, 230 - h / 2, cx + w / 2, 230 + h / 2), 38 * p, col)
        T(dl, ttl, 38 * p, cx, 232, PAPER, 'black')
        T(dl, sub, 26, cx, 310, SOFT, 'b', alpha=fade(lt, ts))
    for i, (s, tt) in enumerate(zip(['Payments', 'Banking', 'Orders'], c6_L)):
        item_row(dl, 490, 390 + i * 82, 440, s, SQLC, prog(lt, tt, tt + 0.35))
    p = back(prog(lt, c6_L[3], c6_L[3] + 0.4))
    if p > 0.02:
        bank(dl, 600, 660, 1.1 * p)
        T(dl, 'Banks use SQL', 32, 800, 650, SQLC, 'black', alpha=clamp(p))
    for i, (s, tt) in enumerate(zip(['Chat messages', 'Activity feeds', 'Product catalogues', 'Instagram-style feeds', 'WhatsApp-style chats'], c6_R)):
        item_row(dl, 990, 390 + i * 82, 440, s, NOC, prog(lt, tt, tt + 0.35))
    gpill(L, G, dl, 960, 845, 780, 86, 'MANY COMPANIES USE BOTH', 40, sc=back(prog(lt, c6_both, c6_both + 0.4)))


# ---------------- chapter 7: recap table ----------------
RECAP = [('Structure', ['Tables with', 'rows & columns'], ['Documents, key-value,', 'wide-column, graph']),
         ('Schema', ['Strict & fixed'], ['Flexible']),
         ('Scaling', ['Scale UP', '(bigger machine)'], ['Scale OUT', '(more machines)']),
         ('Best for', ['Payments, banking,', 'orders'], ['Chats, feeds,', 'huge scale'])]
def sc_c7(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 7, 'Recap')
    a = fade(lt, 1.15)
    if a <= 0: return
    x0, y0, cw, hh, rh = 480, 185, [190, 375, 395], 72, 128
    nvis = sum(1 for tt in c7_rows if lt >= tt - 0.1)
    y1 = y0 + hh + rh * nvis
    card(dl, (x0, y0, x0 + sum(cw), y1), 22, PAPER, alpha=a)
    dl.rounded_rectangle((x0 + cw[0], y0, x0 + cw[0] + cw[1], y0 + hh), radius=0, fill=rgba(light(SQLC, 0.85), a))
    dl.rounded_rectangle((x0 + cw[0] + cw[1], y0, x0 + sum(cw) - 3, y0 + hh), radius=0, fill=rgba(light(NOC, 0.85), a))
    T(dl, 'SQL', 40, x0 + cw[0] + cw[1] / 2, y0 + hh / 2 + 2, PAPER, 'black', alpha=a)
    T(dl, 'NoSQL', 40, x0 + cw[0] + cw[1] + cw[2] / 2, y0 + hh / 2 + 2, PAPER, 'black', alpha=a)
    for i, (lab, l1, l2) in enumerate(RECAP):
        tt = c7_rows[i]
        p = ease_out(prog(lt, tt - 0.1, tt + 0.3))
        if p <= 0: continue
        ry = y0 + hh + rh * i
        dl.line([(x0 + 3, ry), (x0 + sum(cw) - 3, ry)], fill=rgba(INK, 0.3 * a), width=2)
        T(dl, lab, 30, x0 + 24, ry + rh / 2, INK, 'black', alpha=a * p, anchor='lm')
        for cx0, w, lines, col in [(x0 + cw[0], cw[1], l1, SQLC), (x0 + cw[0] + cw[1], cw[2], l2, NOC)]:
            for k, ln in enumerate(lines):
                yy = ry + rh / 2 + (k - (len(lines) - 1) / 2) * 40
                T(dl, ln, fitsz(ln, 'xb', 28, w - 30), cx0 + w / 2 + (1 - p) * 30, yy, INK if k == 0 else SOFT, 'xb' if k == 0 else 'sb', alpha=a * p)
    for x in (x0 + cw[0], x0 + cw[0] + cw[1]):
        dl.line([(x, y0 + 3), (x, y1 - 3)], fill=rgba(INK, 0.3 * a), width=2)
    dl.rounded_rectangle((x0, y0, x0 + sum(cw), y1), radius=22, outline=rgba(INK, a), width=5)
    tag_pill(dl, 960, 862, 'strict register  ·  flexible note cards', INK, size=28, fname='black', sc=back(prog(lt, c7_end, c7_end + 0.4)))


# ---------------- chapter 8: quiz ----------------
QUIZ = [(['A banking app that moves money.', 'SQL or NoSQL?'], 'SQL', 'NoSQL'),
        (['A chat app with billions of messages.', 'SQL or NoSQL?'], 'NoSQL', 'NoSQL'),
        (['The fixed plan of columns in a', 'SQL table is called...?'], 'SCHEMA', 'snack plan?')]
def sc_quiz(L, G, dl, dg, lt, dur):
    title_card(dl, lt, 8, 'Quiz Time')
    if lt < Q_ST[0]:
        a = fade(lt, 1.2, Q_ST[0])
        gtext(L, G, 'QUIZ TIME!', 'black', 130, 960, 430, scale=back(prog(lt, 1.2, 1.6)), alpha=a, glow=False)
        tag_pill(dl, 960, 560, '3 questions  ·  3 seconds each', SOFT, size=32, fname='black', alpha=a)
        return
    qi = max(i for i in range(3) if lt >= Q_ST[i])
    st = Q_ST[qi]; end = Q_ST[qi + 1] if qi < 2 else dur + 1
    a = fade(lt, st, end)
    lines, ans, pick = QUIZ[qi]
    card(dl, (490, 200, 1430, 420), 30, PAPER, alpha=a)
    s = back(prog(lt, st, st + 0.4))
    dl.ellipse((520, 250, 640, 370), fill=rgba(ORANGE, a), outline=rgba(INK, a), width=5)
    T(dl, f'Q{qi + 1}', 52 * s, 580, 312, PAPER, 'black', alpha=a)
    for k, ln in enumerate(lines):
        T(dl, ln, fitsz(ln, 'black', 42, 740), 670, 278 + k * 66, INK if k == 0 else (SQLC if qi < 2 else INK), 'black', alpha=a, anchor='lm')
    cdk = QUIZ_Q[qi]
    countdown(dl, 960, 800, lt - CD[cdk])
    tp, tr = Q_PICK[qi], Q_REV[qi]
    if qi < 2:
        for x, opt, col in [(760, 'SQL', SQLC), (1160, 'NoSQL', NOC)]:
            rev = lt >= tr
            good = rev and opt == ans
            fill = light(TEAL, 0.5) if good else PAPER
            card(dl, (x - 160, 540, x + 160, 660), 60, fill, alpha=a)
            T(dl, opt, 56, x, 602, col, 'black', alpha=a)
            if lt >= tp and opt == pick:
                dl.rounded_rectangle((x - 172, 528, x + 172, 672), radius=70, outline=rgba(ORANGE, a), width=6)
                tag_pill(dl, x, 515, "Chintu's guess", ORANGE, size=20, fname='black', sc=back(prog(lt, tp, tp + 0.35)), alpha=a)
            if good: check_badge(dl, x + 160, 545, 30, prog(lt, tr, tr + 0.4))
            if rev and opt == pick and opt != ans: cross_badge(dl, x + 160, 545, 30, prog(lt, tr, tr + 0.4))
    else:
        rev = lt >= tr
        if not rev:
            card(dl, (700, 540, 1220, 660), 60, PAPER, alpha=a)
            T(dl, '? ? ?', 56, 960, 602, SOFT, 'black', alpha=a)
            if lt >= tp:
                tag_pill(dl, 960, 515, "Chintu: 'the snack plan?'", ORANGE, size=20, fname='black', sc=back(prog(lt, tp, tp + 0.35)), alpha=a)
        else:
            gpill(L, G, dl, 960, 600, 520, 120, 'SCHEMA', 64, sc=back(prog(lt, tr, tr + 0.4)), alpha=a)
            check_badge(dl, 1220, 545, 30, prog(lt, tr + 0.2, tr + 0.6))
            burst(dl, dg, 960, 600, lt - tr - 0.1)


# ---------------- outro ----------------
SERIES = ['Caching', 'CDN', 'Sharding', 'Message Queues', 'Rate Limiting', 'SQL vs NoSQL']
def sc_outro(L, G, dl, dg, lt, dur):
    sc = back(prog(lt, 0.1, 0.5))
    f = F('black', 110)
    wv, wc = f.getlength('Vizu'), f.getlength('Code')
    x0 = 960 - (wv + wc) / 2 * sc
    text(dl, 'Vizu', 'black', 110 * sc, x0, 250, INK, anchor='lm')
    gtext(L, G, 'Code', 'black', 110, x0 + wv * sc + wc * sc / 2, 255, scale=sc, glow=False)
    T(dl, 'System design, explained simply.', 34, 960, 350, SOFT, 'm', alpha=fade(lt, 0.4))
    b = prog(lt, o_site, o_site + 0.4)
    if b > 0:
        s2 = back(b) * (1 + 0.02 * math.sin(lt * 5))
        gpill(L, G, dl, 960, 470, 540, 112, 'vizucode.site', 56, sc=s2)
    g = fade(lt, o_follow)
    if g > 0:
        iy = 590; ix = 960 - 225
        dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(INK, g), width=5)
        dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(INK, g), width=5)
        dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(INK, g))
        text(dl, 'Follow @vizucode26', 'b', 44, ix + 50, iy + 2, INK, anchor='lm', alpha=g)
    tag_pill(dl, 960, 690, 'Next up: Part 7', ORANGE, size=28, fname='black', sc=back(prog(lt, o_next, o_next + 0.4)))
    # the series so far
    a = fade(lt, 0.5)
    size = 20
    ws = [F('black', size).getlength(f'{i + 1} {s}') + 40 for i, s in enumerate(SERIES)]
    gap = 12; total = sum(ws) + gap * 5
    x = 960 - total / 2
    T(dl, 'SYSTEM DESIGN FOR BEGINNERS', 20, 960, 775, SOFT, 'black', alpha=a)
    for i, (s, w) in enumerate(zip(SERIES, ws)):
        cur = i == 5
        dl.rounded_rectangle((x, 800, x + w, 846), radius=23, fill=rgba(ORANGE if cur else PAPER, a), outline=rgba(INK, a), width=3)
        T(dl, f'{i + 1} {s}', size, x + w / 2, 824, PAPER if cur else INK, 'black', alpha=a)
        x += w + gap


E.SCENES.update(c1=sc_c1, c2=sc_c2, c3=sc_c3, c4=sc_c4, c5=sc_c5, c6=sc_c6, c7=sc_c7, quiz=sc_quiz, outro=sc_outro)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'timeline':      # print chapter starts (YouTube timestamps)
        for nm, st, d, _ in E.scenes:
            print(f'{int(st // 60)}:{int(st % 60):02d}  {LABEL[nm]}  ({d:.1f}s)')
        print('total', round(E.TOTAL, 2))
    else:
        E.main()
