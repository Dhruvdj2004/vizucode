"""Database Sharding explained for total beginners: Chintu & Meera, storybook look, landscape 1920x1080.
System Design for Beginners, part 3 (part 1 Caching, part 2 CDN).

Run with VIDEOGEN_K=<skill dir> VIDEOGEN_W=1920 VIDEOGEN_H=1080:
    python3 reel.py out.mp4                 full render (multiprocess)
    python3 reel.py stills_dir stills 3,40  preview PNGs
"""
import os, sys, math, random, re
import json as _json
import numpy as np
from PIL import Image
K = os.environ['VIDEOGEN_K']
sys.path.insert(0, os.path.join(K, 'scripts'))
import engine as E
from engine import *
sys.path.insert(0, os.path.join(K, 'examples', 'storybook-characters'))
from characters import chintu, meera, Cast, INK, PAPER, CHINTU_COL, MEERA_COL

E.init(os.path.dirname(os.path.abspath(__file__)))
VOICE_GAIN = 2.0   # voice ~6 dB above the music bed
for _k in E.VOAUD: E.VOAUD[_k] = E.VOAUD[_k] * VOICE_GAIN

# ---------------- word timings (vo/<key>.words.json from make_vo.sh) ----------------
WT = {k: _json.load(open(os.path.join(E.WORK, 'vo', k + '.words.json'))) for k in E.VOTEXT}
SPK = {k: WT[k][-1][1] + 0.1 for k in WT}          # spoken length (ignores the clip's trailing silence)
TS = {}                                            # key -> absolute start time

def ab(key, phrase=None):
    """Absolute time (s) where `phrase` starts inside VO line `key` (line start if phrase is None)."""
    if phrase is None: return TS[key]
    txt = E.VOTEXT[key]; i = txt.lower().find(phrase.lower())
    assert i >= 0, (key, phrase)
    return TS[key] + WT[key][len(txt[:i].split())][0]

def ae(key): return TS[key] + SPK[key]

E.CFG.update(
    HEADER_TAG='System Design · For Beginners',
    CAPTION_GOLD={'shard', 'shards', 'sharding', 'shard.', 'database', 'router', 'key', 'hash', 'range', 'library', 'rooms', 'room',
                  'vertical', 'horizontal', 'scaling', 'instagram', 'whatsapp', 'consistent', 'hashing', 'rahul', 'mango',
                  'queues', 'vizucode.site', '@vizucode26', '1047', 'joins', 're-sharding', 'librarian', 'ceiling'},
    CAPTION_TEAL={'fast', 'fast!', 'easy', 'evenly', 'yes!', 'exactly', 'right', 'right.'},
    CAPTION_CORAL={'slow', 'slower', 'hot', 'spot', 'spot!', 'spots', 'sweating', 'crying', 'harder', 'tricky', 'expensive', 'fire', 'crushed', 'overflowing'},
)

# ---------------- timeline ----------------
CH = []   # (scene name, chapter title, start)
def chapter(name, title, items, intro=1.0, gap=0.32, tail=0.9):
    st = E.t
    if st > 0: sfx.append((st - 0.05, 'whoosh'))
    cur = st + intro
    for it in items:
        if isinstance(it, (int, float)): cur += it; continue
        add_vo(cur, it); TS[it] = cur
        cur += SPK[it] + gap
    E.scene(name, cur - gap + tail - st)
    CH.append((name, title, st))
    return st

chapter('hook', 'Why is my app slow?', ['chintu_h1', 'meera_h2', 'chintu_h3', 'meera_h4', 'chintu_h5', 'meera_h6'], intro=0.4)
chapter('scale', 'Just buy a bigger machine?', ['chintu_s1', 'meera_s2', 'meera_s3', 'chintu_s4', 'meera_s5', 'chintu_s6'])
chapter('library', 'The library trick', ['meera_l1', 'chintu_l2', 'meera_l3', 'chintu_l4', 'meera_l5', 'chintu_l6'])
chapter('shards', 'Shards, shard key & router', ['meera_r1', 'meera_r4', 'chintu_r5', 'meera_r6', 'meera_r7', 'chintu_r8'])
chapter('ways', 'Range vs hash', ['chintu_w1', 'meera_w2', 'meera_w3', 'meera_w4', 'chintu_w5', 'meera_w6', 'chintu_w7', 'meera_w8', 'meera_w9'])
chapter('costs', 'The costs', ['chintu_c1', 'meera_c2', 'meera_c3', 'meera_c4', 'chintu_c5', 'meera_c6', 'chintu_c7', 'meera_c8', 'meera_c9'])
chapter('recap', 'Recap: 4 key words', ['meera_x2', 'chintu_x3', 'meera_x4', 'chintu_x5'])
CD = 3.4   # visible 3-second countdown + a beat
chapter('quiz', 'Mini quiz', ['meera_q0', 'meera_q1', CD, 'meera_a1', 0.3, 'meera_q2', CD, 'meera_a2', 0.3, 'chintu_q3', CD, 'meera_a3'])
chapter('outro', 'See you next time!', ['chintu_o1', 'meera_o2', 'chintu_o3'], tail=2.2)

QUIZ = [('meera_q1', 'meera_a1'), ('meera_q2', 'meera_a2'), ('chintu_q3', 'meera_a3')]
def cd_start(q): return ae(q) + 0.1
for q, a in QUIZ:
    for i in range(3): sfx.append((cd_start(q) + i, 'tick'))
    sfx.append((ab(a), 'ding'))

# ---- sfx cues ----
sfx += [(ab('chintu_h1', 'viral'), 'pop'), (ab('chintu_h3', 'ten seconds'), 'buzz'), (ab('chintu_h5', 'sweating'), 'buzz'),
        (ab('meera_h6', 'sharding'), 'ding'),
        (ab('chintu_s1', 'RAM'), 'pop'), (ab('chintu_s1', 'CPU'), 'pop'), (ab('meera_s3', 'ceiling') + 0.1, 'buzz'),
        (ab('meera_s5', 'many'), 'pop'), (ab('chintu_s6', 'four small'), 'pop'),
        (ab('meera_l3', 'four rooms'), 'whoosh'), (ab('chintu_l4', 'Harry'), 'pop'), (ab('meera_l5', 'walks') + 1.0, 'ding'),
        (ab('chintu_l6', 'four helpers'), 'pop'),
        (ab('meera_r1', 'shard:'), 'ding'), (ab('meera_r4', 'shard key'), 'pop'), (ab('meera_r6', 'router'), 'pop'),
        (ab('meera_r7', 'asks only') + 0.55, 'ding'),
        (ab('meera_w4', 'gives three') + 0.4, 'ding'), (ab('meera_w8', 'hot spot'), 'buzz'), (ab('meera_w9', 'spread'), 'win'),
        (ab('meera_c2', 'First'), 'pop'), (ab('meera_c3', 'Second'), 'pop'), (ab('meera_c4', 'Third'), 'pop'),
        (ab('meera_c6', 'consistent'), 'ding'), (ab('meera_c8', 'Instagram'), 'pop'), (ab('meera_c8', 'WhatsApp'), 'pop'),
        (ab('meera_x2'), 'ding'), (ab('chintu_x3'), 'ding'), (ab('meera_x4'), 'ding'), (ab('chintu_x5'), 'ding'),
        (ab('chintu_o1', 'message'), 'pop'), (ab('meera_o2', 'vizu'), 'pop'), (ab('chintu_o3', 'pizza'), 'win')]
for w_ in ('Aarav', 'Aditi', 'Ananya', 'Arjun'): sfx.append((ab('meera_w6', w_), 'tick'))

# ---------------- captions (word-accurate, with speaker) ----------------
PHRASES = [(['vizu', 'code', 'dot', 'site'], 'vizucode.site'), (['at', 'vizu', 'code', '26'], '@vizucode26'),
           (['vizu', 'code'], 'vizucode'), (['one', 'zero', 'four', 'seven'], '1047')]
def rebuild_captions():
    caps = []
    for ts, key in E.vo_events:
        raw = E.VOTEXT[key].split(); tm = WT[key]
        who = 'chintu' if key.startswith('chintu') else 'meera'
        toks, i = [], 0
        while i < len(raw):
            for seq, disp in PHRASES:
                low = [w.lower().strip('.,!?') for w in raw[i:i + len(seq)]]
                if low == seq:
                    toks.append((disp + re.sub(r'^.*?([.,!?]*)$', r'\1', raw[i + len(seq) - 1]), i, i + len(seq) - 1)); i += len(seq); break
            else:
                toks.append((raw[i], i, i)); i += 1
        chunks, cur = [], []
        for tok in toks:
            cur.append(tok)
            txt = ' '.join(c[0] for c in cur)
            if len(txt) >= 22 or tok[0][-1] in '.?!:,' or len(cur) >= 4: chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for j, ch in enumerate(chunks):
            st = ts + tm[ch[0][1]][0] - 0.04
            en = ts + (tm[chunks[j + 1][0][1]][0] - 0.04 if j + 1 < len(chunks) else tm[ch[-1][2]][1] + 0.25)
            caps.append((st, en, ' '.join(c[0] for c in ch), who))
    E.captions[:] = caps

rebuild_captions()
E.finish()
CAST = Cast(('chintu', 'meera'))
LINES = sorted((TS[k], TS[k] + SPK[k], 'chintu' if k.startswith('chintu') else 'meera') for k in TS)
def speaker(t=None):
    t = E.NOW if t is None else t
    for st, en, who in LINES:
        if st - 0.05 <= t < en: return who
    return None

# ---------------- storybook theme ----------------
SOFT = (110, 104, 140)
SKIN = (255, 208, 168)
GREEN = (120, 200, 90)

def make_story_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = np.array((255, 241, 222), np.float32), np.array((206, 230, 255), np.float32)
    k = (y / H)[..., None]
    img = top * (1 - k) + bot * k
    def blob(cx, cy, rx, ry, col, a):
        d = np.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2))
        return d[..., None] * (np.array(col, np.float32) - img) * a
    img += blob(W * 0.92, 160, 420, 300, (255, 200, 150), 0.6)
    img += blob(W * 0.06, H * 0.75, 460, 360, (190, 240, 225), 0.6)
    for cx, cy, r in [(520, 150, 50), (580, 135, 66), (640, 155, 44), (1380, 175, 55), (1450, 160, 72), (1520, 180, 48)]:
        d = ((x - cx) ** 2 + (y - cy) ** 2) < r * r
        img[d] = img[d] * 0.5 + 255 * 0.5
    dots = ((x % 54) - 27) ** 2 + ((y % 54) - 27) ** 2 < 4
    img[dots] = img[dots] * 0.93
    # floor band under the characters
    fl = y > 905
    img[fl] = img[fl] * 0.94
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
E.BGIMG = make_story_bg()
E.DUST[:] = []

def T(dl, s, size, cx, cy, col=INK, fname='xb', alpha=1.0, anchor='mm'):
    text(dl, s, fname, size, cx, cy, col, alpha=alpha, anchor=anchor)

def shadow_rr(dl, box, r, alpha=1.0, off=8):
    x0, y0, x1, y1 = box
    dl.rounded_rectangle((x0 + off, y0 + off, x1 + off, y1 + off), radius=r, fill=rgba(INK, 0.16 * alpha))

def card(dl, box, r=26, fill=PAPER, outline=INK, alpha=1.0, width=5):
    if alpha <= 0.01: return
    shadow_rr(dl, box, r, alpha)
    dl.rounded_rectangle(box, radius=r, fill=rgba(fill, alpha), outline=rgba(outline, alpha), width=width)

def tag_pill(dl, cx, cy, s, col=INK, fill=PAPER, size=30, alpha=1.0, fname='b'):
    if alpha <= 0.01 or size < 2: return
    w = F(fname, size).getlength(s) + size * 1.3; h = size * 1.9
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    shadow_rr(dl, box, h / 2, alpha, 6)
    dl.rounded_rectangle(box, radius=h / 2, fill=rgba(fill, alpha), outline=rgba(INK, alpha), width=4)
    text(dl, s, fname, size, cx, cy + 1, col, alpha=alpha)

def gpill(L, G, dl, cx, cy, label, s=1.0, w=360, h=86, size=38, fname='black'):
    if s <= 0.02: return
    ww, hh = w * s, h * s
    dl.rounded_rectangle((cx - ww / 2 + 8, cy - hh / 2 + 9, cx + ww / 2 + 8, cy + hh / 2 + 9), radius=hh / 2, fill=rgba(INK, 0.18))
    grad_pill(L, G, cx, cy, w, h, scale=s)
    dl.rounded_rectangle((cx - ww / 2, cy - hh / 2, cx + ww / 2, cy + hh / 2), radius=hh / 2, outline=rgba(INK), width=5)
    text(dl, label, fname, size * s, cx, cy + 2, INK_ON_GRAD)

def title(L, G, dl, kicker, big, y=150, col=ORANGE, size=60, alpha=1.0):
    T(dl, kicker, 30, W / 2, y - 48, col, 'b', alpha=alpha)
    T(dl, big, size, W / 2, y + 6, INK, 'black', alpha=alpha)

def lerp2(a, b, p): return (lerp(a[0], b[0], p), lerp(a[1], b[1], p))

def wire(dl, a, b, col=INK, alpha=0.4, width=6):
    dl.line([a, b], fill=rgba(col, alpha), width=width)

def envelope(dl, cx, cy, s=1.0, alpha=1.0):
    if alpha <= 0.01: return
    w, h = 30 * s, 21 * s
    ink = rgba(INK, alpha)
    dl.rounded_rectangle((cx - w, cy - h, cx + w, cy + h), radius=5 * s, fill=rgba((255, 214, 102), alpha), outline=ink, width=max(2, int(4 * s)))
    dl.line([(cx - w + 3, cy - h + 3), (cx, cy + 3 * s), (cx + w - 3, cy - h + 3)], fill=ink, width=max(2, int(3 * s)))

def person(dl, cx, cy, s, col, alpha=1.0, hat=False):
    """Small person icon; (cx, cy) = neck point."""
    if s <= 0.02 or alpha <= 0.01: return
    ink = rgba(INK, alpha); w = max(2, int(3.5 * s))
    dl.rounded_rectangle((cx - 25 * s, cy, cx + 25 * s, cy + 46 * s), radius=20 * s, fill=rgba(col, alpha), outline=ink, width=w)
    r = 18 * s; hy = cy - 16 * s
    dl.ellipse((cx - r, hy - r, cx + r, hy + r), fill=rgba(SKIN, alpha), outline=ink, width=w)
    for sx in (-1, 1):
        dl.ellipse((cx + sx * 6 * s - 2.5 * s, hy - 2 * s, cx + sx * 6 * s + 2.5 * s, hy + 3 * s), fill=ink)
    dl.arc((cx - 6 * s, hy, cx + 6 * s, hy + 9 * s), 20, 160, fill=ink, width=max(1, int(2 * s)))
    if hat:
        dl.rounded_rectangle((cx - 20 * s, hy - 26 * s, cx + 20 * s, hy - 10 * s), radius=5 * s, fill=ink)
        dl.rectangle((cx - 26 * s, hy - 13 * s, cx + 26 * s, hy - 8 * s), fill=ink)

def server(dl, cx, cy, s, t, state='ok', alpha=1.0, h=210):
    """Cute server box with a face. state: ok | busy. h = height at s=1 (tall racks for vertical scaling)."""
    if s <= 0.02: return
    w, hh = 170 * s, h * s
    box = (cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2)
    fill = {'ok': (240, 246, 255), 'busy': (255, 232, 206)}[state]
    card(dl, box, 26 * s, fill, alpha=alpha, width=max(3, int(6 * s)))
    ink = rgba(INK, alpha)
    nslots = max(2, int((hh - 120 * s) / (38 * s)))
    for j in range(nslots):
        y = cy - hh / 2 + (38 + j * 38) * s
        dl.rounded_rectangle((cx - w / 2 + 18 * s, y - 12 * s, cx + w / 2 - 18 * s, y + 12 * s), radius=6 * s,
                             fill=rgba((214, 222, 242), alpha), outline=ink, width=max(2, int(3 * s)))
        on = int(t * 3 + j * 1.3 + cx * 0.01) % 3 != 0
        lx = cx + w / 2 - 34 * s
        dl.ellipse((lx - 6 * s, y - 6 * s, lx + 6 * s, y + 6 * s), fill=rgba(GREEN if on else (170, 200, 160), alpha))
    fy = cy + hh / 2 - 67 * s
    lw = max(2, int(5 * s))
    for sx in (-1, 1):
        ex = cx + sx * 30 * s
        if state == 'busy':
            dl.line([(ex - 10 * s, fy - 7 * s * sx), (ex + 10 * s, fy), (ex - 10 * s, fy + 7 * s * sx)], fill=ink, width=lw)
        else:
            r = 8 * s if (t + cx * 0.003) % 2.7 > 0.12 else 2 * s
            dl.ellipse((ex - 8 * s, fy - r, ex + 8 * s, fy + r), fill=ink)
    my = fy + 34 * s
    if state == 'ok':
        dl.arc((cx - 22 * s, my - 18 * s, cx + 22 * s, my + 8 * s), 20, 160, fill=ink, width=lw)
    else:
        dl.ellipse((cx - 12 * s, my - 10 * s, cx + 12 * s, my + 12 * s), fill=rgba((120, 30, 45), alpha), outline=ink, width=max(2, int(3 * s)))
        for k in range(2):   # sweat drops
            dx = cx + (w / 2 - 4 * s) * (1 if k else -1)
            dy = cy - hh / 2 + 10 * s + ((t * 70 + k * 23) % 50) * s
            dl.ellipse((dx - 9 * s, dy - 5 * s, dx + 9 * s, dy + 14 * s), fill=rgba(BLUE, alpha))

def flames(dl, cx, cy, s, t, alpha=1.0):
    for k in range(5):
        ph = t * 9 + k * 1.7
        fx = cx + (k - 2) * 22 * s
        hgt = (46 + 18 * math.sin(ph)) * s * (1.25 if k == 2 else 1)
        for col, sc in ((CORAL, 1.0), (GOLD, 0.6)):
            hw = 16 * s * sc
            dl.polygon([(fx - hw, cy), (fx + hw, cy), (fx + math.sin(ph) * 5 * s, cy - hgt * sc)], fill=rgba(col, alpha))

def db(dl, cx, cy, s, t, state='ok', label=None, alpha=1.0, glow=0.0, stuffed=0.0, fire=False):
    """Database cylinder with a face. state: ok | sweat | sleep | happy | bored."""
    if s <= 0.02 or alpha <= 0.01: return
    if state == 'sweat': cx += math.sin(t * 38) * 3 * s
    w, h, ry = 170 * s, 190 * s, 28 * s
    x0, x1, yt, yb = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    ink = rgba(INK, alpha); lw = max(3, int(6 * s))
    body = {'ok': (226, 236, 255), 'sleep': (226, 232, 246), 'bored': (226, 232, 246), 'happy': (206, 246, 232), 'sweat': (255, 214, 204)}[state]
    if glow > 0:
        r = 30 * s * glow
        dl.rounded_rectangle((x0 - r, yt - ry - r, x1 + r, yb + ry + r), radius=50 * s, fill=rgba(TEAL, 0.25 * glow))
    if stuffed > 0:   # papers bursting out of the lid
        for k in range(7):
            ang = -0.9 + k * 0.3 + math.sin(t * 4 + k) * 0.06
            px, py = cx + math.sin(ang) * 70 * s, yt - 20 * s - math.cos(ang) * 50 * s * stuffed
            pw, ph = 30 * s, 40 * s
            c, si = math.cos(ang), math.sin(ang)
            pts = [(px + dx * c - dy * si, py + dx * si + dy * c) for dx, dy in ((-pw / 2, -ph / 2), (pw / 2, -ph / 2), (pw / 2, ph / 2), (-pw / 2, ph / 2))]
            dl.polygon(pts, fill=rgba(PAPER, alpha), outline=ink)
            dl.line([pts[0], pts[1]], fill=ink, width=2)
    dl.ellipse((x0 + 7 * s, yb - ry + 9 * s, x1 + 7 * s, yb + ry + 9 * s), fill=rgba(INK, 0.16 * alpha))
    dl.ellipse((x0, yb - ry, x1, yb + ry), fill=rgba(body, alpha), outline=ink, width=lw)
    dl.rectangle((x0, yt, x1, yb), fill=rgba(body, alpha))
    dl.line([(x0, yt), (x0, yb)], fill=ink, width=lw); dl.line([(x1, yt), (x1, yb)], fill=ink, width=lw)
    dl.arc((x0, yt + 0.3 * h - ry, x1, yt + 0.3 * h + ry), 0, 180, fill=rgba(INK, 0.35 * alpha), width=max(2, int(3 * s)))
    top = tuple(min(255, int(c * 0.85 + 255 * 0.15)) for c in body)
    dl.ellipse((x0, yt - ry, x1, yt + ry), fill=rgba(top, alpha), outline=ink, width=lw)
    if label:
        T(dl, label, 30 * s, cx, yt + 0.18 * h, INK, 'black', alpha=alpha)
    fy = yt + 0.58 * h
    for sx in (-1, 1):
        ex = cx + sx * 28 * s
        if state in ('sleep', 'bored'):
            dl.arc((ex - 11 * s, fy - 8 * s, ex + 11 * s, fy + 8 * s), 0, 180, fill=ink, width=max(2, int(4 * s)))
        elif state == 'sweat':
            dl.line([(ex - 9 * s * sx, fy - 7 * s), (ex + 9 * s * sx, fy), (ex - 9 * s * sx, fy + 7 * s)], fill=ink, width=max(2, int(5 * s)))
        elif state == 'happy':
            dl.arc((ex - 10 * s, fy - 6 * s, ex + 10 * s, fy + 10 * s), 200, 340, fill=ink, width=max(2, int(5 * s)))
        else:
            r = 8 * s if (t + cx * 0.002) % 3.1 > 0.12 else 2 * s
            dl.ellipse((ex - 7 * s, fy - r, ex + 7 * s, fy + r), fill=ink)
    my = fy + 30 * s
    if state == 'sweat':
        dl.ellipse((cx - 13 * s, my - 10 * s, cx + 13 * s, my + 14 * s), fill=rgba((120, 30, 45), alpha), outline=ink, width=max(2, int(3 * s)))
        for k in range(3):
            dx = cx + (k - 1) * 60 * s + (8 * s if k == 1 else 0)
            dy = yt + ((t * 80 + k * 31) % 90) * s
            if k == 1: dx = x1 + 6 * s
            dl.ellipse((dx - 9 * s, dy - 5 * s, dx + 9 * s, dy + 15 * s), fill=rgba(BLUE, alpha), outline=ink, width=2)
    elif state == 'sleep':
        dl.ellipse((cx - 6 * s, my - 4 * s, cx + 6 * s, my + 8 * s), fill=rgba((120, 30, 45), alpha))
        for k in range(3):
            ph = (t * 0.6 + k / 3) % 1
            T(dl, 'z', (18 + ph * 22) * s, x1 + 10 * s + ph * 40 * s, yt - 10 * s - ph * 70 * s, SOFT, 'black', alpha=alpha * (1 - ph))
    elif state == 'bored':
        dl.line([(cx - 14 * s, my + 2 * s), (cx + 14 * s, my + 2 * s)], fill=ink, width=max(2, int(4 * s)))
    elif state == 'happy':
        dl.chord((cx - 20 * s, my - 14 * s, cx + 20 * s, my + 16 * s), 0, 180, fill=rgba((120, 30, 45), alpha), outline=ink, width=max(2, int(3 * s)))
    else:
        dl.arc((cx - 18 * s, my - 14 * s, cx + 18 * s, my + 8 * s), 20, 160, fill=ink, width=max(2, int(5 * s)))
    if fire: flames(dl, cx, yt - ry + 6 * s, s, t, alpha)

BOOKC = [CORAL, TEAL, BLUE, VIOLET, ORANGE, GREEN, GOLD]
def book(dl, cx, cy, s, col, letter=None, alpha=1.0, ang=0.0):
    if alpha <= 0.01: return
    w, h = 34 * s, 46 * s
    c, si = math.cos(ang), math.sin(ang)
    pts = [(cx + dx * c - dy * si, cy + dx * si + dy * c) for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
    dl.polygon(pts, fill=rgba(col, alpha), outline=rgba(INK, alpha))
    dl.line(pts + pts[:1], fill=rgba(INK, alpha), width=max(2, int(3 * s)))
    sp = [(cx + (-w / 2 + 6 * s) * c - dy * si, cy + (-w / 2 + 6 * s) * si + dy * c) for dy in (-h / 2, h / 2)]
    dl.line(sp, fill=rgba(INK, 0.5 * alpha), width=max(1, int(2 * s)))
    if letter: T(dl, letter, 22 * s, cx + 3 * s, cy, PAPER, 'black', alpha=alpha)

def pizza(dl, cx, cy, r, t=0.0, alpha=1.0):
    if r <= 1 or alpha <= 0.01: return
    ink = rgba(INK, alpha)
    dl.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba((236, 170, 80), alpha), outline=ink, width=max(2, int(r * 0.06)))
    ri = r * 0.82
    dl.ellipse((cx - ri, cy - ri, cx + ri, cy + ri), fill=rgba((255, 214, 102), alpha))
    for k in range(6):
        a = k * math.pi / 3 + 0.3
        px, py = cx + math.cos(a) * r * 0.5, cy + math.sin(a) * r * 0.5
        pr = r * 0.13
        dl.ellipse((px - pr, py - pr, px + pr, py + pr), fill=rgba(CORAL, alpha), outline=ink, width=max(1, int(r * 0.03)))
    for k in range(3):
        a = k * math.pi / 3
        dl.line([(cx - math.cos(a) * ri, cy - math.sin(a) * ri), (cx + math.cos(a) * ri, cy + math.sin(a) * ri)], fill=rgba(INK, 0.35 * alpha), width=max(1, int(r * 0.03)))

def star(dl, cx, cy, r, col=GOLD, alpha=1.0):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5; rr = r if k % 2 == 0 else r * 0.45
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    dl.polygon(pts, fill=rgba(col, alpha), outline=rgba(INK, alpha))
    dl.line(pts + pts[:1], fill=rgba(INK, alpha), width=4)

def namechip(dl, cx, cy, s, col, alpha=1.0, size=24):
    tag_pill(dl, cx, cy, s, INK, tuple(int(c * 0.35 + 255 * 0.65) for c in col), size=size, alpha=alpha, fname='xb')

def fly(p): return ease_in_out(clamp(p))
def arc_pos(a, b, p, lift=80):
    x, y = lerp2(a, b, fly(p)); return x, y - math.sin(math.pi * clamp(p)) * lift

# ---------------- characters (drawn from the header so they stay solid between chapters) ----------------
CHX, CHY, MEX, MEY, CS = 250, 520, 1670, 520, 0.85
CHARKW = {'chintu': {}, 'meera': {}}
def ck(**kw): CHARKW['chintu'].update(kw)
def mk(**kw): CHARKW['meera'].update(kw)
DIA_L = (CHX + 140, 420)    # Chintu points at the diagram's left side
DIA_R = (MEX - 140, 420)    # Meera points at the diagram's right side

def header(dl, L, G):
    f = F('black', 42)
    wv = f.getlength('Vizu')
    dl.text((60, 64), 'Vizu', font=f, fill=rgba(INK), anchor='lm')
    gtext(L, G, 'Code', 'black', 42, 60 + wv + f.getlength('Code') / 2, 66, glow=False)
    k = max([i for i, c in enumerate(CH) if c[2] <= E.NOW + 1e-6], default=0)
    tag = f'{k + 1} · {CH[k][1]}'
    tw = F('sb', 26).getlength(tag) + 90
    cx = W - 60 - tw / 2
    p = back(prog(E.NOW, CH[k][2], CH[k][2] + 0.4)) if CH[k][2] > 0 else 1
    pill(dl, cx, 64, tw * p, 58 * min(1, p), PAPER, INK, width=3)
    if p > 0.6:
        pill(dl, cx - tw / 2 + 32, 64, 16, 16, TEAL)
        text(dl, tag, 'sb', 26, cx + 12, 65, INK)
    who = speaker()
    for name, x, y, fn, col in (('chintu', CHX, CHY, chintu, CHINTU_COL), ('meera', MEX, MEY, meera, MEERA_COL)):
        kw = CHARKW[name]
        kw.setdefault('talk', CAST.talk(name))
        kw.setdefault('bounce', 0.6 if who == name else 0.0)
        kw.setdefault('nod', 0.7 if who is not None and who != name else 0.0)
        kw.setdefault('look', (1, 0) if name == 'chintu' else (-1, 0))
        fn(dl, x, y, CS, E.NOW, **kw)
        tag_pill(dl, x, 885, name.upper(), INK, tuple(int(c * 0.35 + 255 * 0.65) for c in col), size=22, fname='black')
    CHARKW['chintu'] = {}; CHARKW['meera'] = {}
E.header = header

def caption(dl, tsec):
    cur = [c for c in E.captions if c[0] <= tsec < c[1]]
    if not cur: return
    s0, e, txt, who = cur[-1]
    p = ease_out(prog(tsec, s0, s0 + 0.12))
    size = 46 * lerp(0.9, 1.0, p)
    f = F('black', size); sp = size * 0.3
    words = txt.upper().split()
    tw = sum(f.getlength(w_) for w_ in words) + sp * (len(words) - 1)
    tag = who.upper(); tf = F('black', 22); tgw = tf.getlength(tag) + 30
    total = tgw + 22 + tw
    cy = 985
    pill(dl, W / 2, cy, total + 64, 82, INK, None, alpha=0.92)
    x = W / 2 - total / 2
    tcol = CHINTU_COL if who == 'chintu' else MEERA_COL
    dl.rounded_rectangle((x, cy - 19, x + tgw, cy + 19), radius=19, fill=rgba(tcol))
    dl.text((x + tgw / 2, cy + 1), tag, font=tf, fill=rgba(INK), anchor='mm')
    x += tgw + 22
    C = E.CFG
    for w_ in words:
        bare = re.sub(r'[^\w@.\-]', '', w_).lower().strip('.')
        col = PAPER
        if bare in C['CAPTION_TEAL'] or w_.lower() in C['CAPTION_TEAL']: col = TEAL
        elif bare in C['CAPTION_CORAL'] or w_.lower() in C['CAPTION_CORAL']: col = CORAL
        elif re.fullmatch(r'\d+', bare) or bare in C['CAPTION_GOLD']: col = GOLD
        dl.text((x, cy + 2), w_, font=f, fill=rgba(col, p), anchor='lm')
        x += f.getlength(w_) + sp
E.caption = caption

# ---------------- chapter 1: hook ----------------
DBC = (960, 590)
def sc_hook(L, G, dl, dg, lt, dur):
    t = E.NOW
    gtext(L, G, 'DATABASE SHARDING', 'black', 84, W / 2, 175, glow=False)
    tag_pill(dl, W / 2, 262, 'System Design for Beginners · Part 3', SOFT, size=26)
    viral = ab('chintu_h1', 'viral'); slow = ab('chintu_h3', 'Every'); one = ab('meera_h4', 'one single')
    sweat = ab('chintu_h5', 'sweating'); shard = ab('meera_h6', 'sharding')
    # users counter
    c = prog(t, viral, ab('chintu_h1', 'week'))
    if t >= viral:
        n = int(1000000 * ease_out(c))
        s_ = f'{n:,}'
        tag_pill(dl, 640, 470, f'users: {s_}', INK, (255, 240, 214), size=28, fname='xb', alpha=ease_out(prog(t, viral, viral + 0.3)))
    # people raining into the database
    if viral <= t < shard:
        for i in range(10):
            ph = ((t - viral) * 0.9 + i / 10) % 1
            px = DBC[0] + (i - 4.5) * 24
            py = lerp(330, DBC[1] - 120, ph)
            person(dl, px, py, 0.7, [CORAL, TEAL, BLUE, VIOLET, ORANGE][i % 5], alpha=clamp(1 - ph) * prog(t, viral, viral + 0.4))
    state = 'sweat' if t >= ab('chintu_h3') else 'ok'
    if t >= shard + 0.4: state = 'happy'
    stuffed = ease_out(prog(t, one, one + 0.6)) if t < shard + 0.4 else 0
    db(dl, DBC[0], DBC[1], 1.35 * pop_in(t, 0.15), t, state, 'ONE DB', stuffed=stuffed)
    if t >= slow:
        a = ease_out(prog(t, slow, slow + 0.3))
        cx_, cy_ = 1260, 470
        card(dl, (cx_ - 110, cy_ - 70, cx_ + 110, cy_ + 70), 22, alpha=a)
        ang = t * 5
        dl.arc((cx_ - 70, cy_ - 30, cx_ - 10, cy_ + 30), math.degrees(ang), math.degrees(ang) + 270, fill=rgba(CORAL, a), width=8)
        T(dl, '10 s', 40, cx_ + 45, cy_ + 2, CORAL, 'black', alpha=a)
    if sweat <= t < shard:
        tag_pill(dl, 1250, 700, 'HELP!', CORAL, size=34 * back(prog(t, sweat, sweat + 0.3)), fname='black')
    if t >= shard:
        gpill(L, G, dl, 960, 830, 'SPLIT IT UP!', back(prog(t, shard, shard + 0.4)), w=400, h=80, size=36)
    ck(mood='shock' if ab('chintu_h3') <= t < ab('meera_h4') else ('sad' if ab('chintu_h5') <= t < shard else 'happy'),
       wave=t < ab('chintu_h1') + 1.2, point=(DBC[0] - 120, DBC[1]) if ab('chintu_h5') <= t < ae('chintu_h5') else None)
    mk(point=DIA_R if ab('meera_h6') <= t else None, mood='think' if ab('meera_h4') <= t < ae('meera_h4') else 'happy')

# ---------------- chapter 2: vertical vs horizontal ----------------
def sc_scale(L, G, dl, dg, lt, dur):
    t = E.NOW
    st = CH[1][2]
    T(dl, 'VERTICAL', 34, 700, 150, ORANGE, 'black', alpha=ease_out(prog(t, st + 0.2, st + 0.6)))
    T(dl, 'one BIGGER machine', 26, 700, 192, SOFT, 'sb', alpha=ease_out(prog(t, st + 0.2, st + 0.6)))
    hs = ab('meera_s5', 'Horizontal')
    ra = ease_out(prog(t, hs, hs + 0.4))
    T(dl, 'HORIZONTAL', 34, 1220, 150, TEAL, 'black', alpha=ra)
    T(dl, 'MANY normal machines', 26, 1220, 192, SOFT, 'sb', alpha=ra)
    for y in range(140, 850, 26):
        dl.line([(960, y), (960, y + 13)], fill=rgba(INK, 0.25 * ra), width=4)
    # one machine that keeps growing up to the ceiling
    grow = ease_out(prog(t, ab('chintu_s1', 'bigger'), ab('chintu_s1', 'everything') + 0.4))
    bump = ab('meera_s3', 'ceiling')
    hgt = lerp(220, 560, grow) + (40 * ease_out(prog(t, bump - 0.5, bump)) if t < bump + 0.2 else 40)
    hgt = min(hgt, 600)
    bottom = 840
    hit = t >= bump
    shake = math.sin(t * 40) * 4 * (1 - prog(t, bump, bump + 0.8)) if hit else 0
    server(dl, 700 + shake, bottom - hgt / 2, 1.2, t, 'busy' if hit else 'ok', h=hgt / 1.2)
    if t >= ab('meera_s3', 'ceiling') - 0.3:
        a = ease_out(prog(t, bump - 0.3, bump))
        for x in range(500, 920, 30):
            dl.line([(x, 232), (x + 16, 232)], fill=rgba(CORAL, a), width=6)
        T(dl, 'CEILING', 24, 885, 256, CORAL, 'black', alpha=a)
    for word, y, col in (('RAM', 380, BLUE), ('CPU', 470, VIOLET)):
        w0 = ab('chintu_s1', word)
        if t >= w0:
            tag_pill(dl, 885, y + 160 * (1 - grow), '+' + word, col, size=26 * back(prog(t, w0, w0 + 0.3)), fname='black')
    if t >= ab('meera_s3', 'expensive'):
        e0 = ab('meera_s3', 'expensive')
        tag_pill(dl, 515, 560, '$$$$$', CORAL, (255, 230, 220), size=34 * back(prog(t, e0, e0 + 0.35)), fname='black')
    if t >= ab('meera_s2', 'vertical'):
        v0 = ab('meera_s2', 'vertical')
        if t < hs: gpill(L, G, dl, 1230, 500, 'VERTICAL SCALING', back(prog(t, v0, v0 + 0.4)), w=420, h=80, size=32)
    # many normal machines
    pos = [(1110, 400), (1330, 400), (1110, 680), (1330, 680)]
    m0 = ab('meera_s5', 'many')
    for i, (x, y) in enumerate(pos):
        server(dl, x, y + math.sin(t * 3 + i) * 4, 0.95 * pop_in(t, m0 + i * 0.15), t)
    if t >= ab('meera_s5', 'split'):
        s0 = ab('meera_s5', 'split')
        tag_pill(dl, 1220, 840, 'split the work', TEAL, size=28 * back(prog(t, s0, s0 + 0.3)), fname='xb')
    pz = ab('chintu_s6', 'four small')
    if t >= pz:
        for i, (x, y) in enumerate(pos):
            pizza(dl, x + 60, y - 95, 36 * pop_in(t, pz + i * 0.12), t)
    bp = ab('chintu_s6', 'one pizza')
    if t >= bp:
        pizza(dl, 700, 520, 190 * pop_in(t, bp, bp + 0.45), t)
        tag_pill(dl, 700, 760, 'car-sized?!', CORAL, size=28, alpha=ease_out(prog(t, bp + 0.4, bp + 0.7)), fname='black')
    ck(point=(560, 600) if ab('chintu_s1') <= t < ae('chintu_s1') else None,
       mood='laugh' if t >= bp else ('think' if ab('chintu_s4') <= t < ae('chintu_s4') else 'happy'))
    mk(point=(1400, 520) if t >= m0 else ((820, 300) if ab('meera_s3') <= t < ae('meera_s3') else None))

# ---------------- chapter 3: the library ----------------
RX = [590, 830, 1070, 1310]; RNAME = ['A-F', 'G-M', 'N-S', 'T-Z']
ROOM_Y0, ROOM_Y1 = 250, 560
BOOKS = []   # (letter, colour, room, pile position, shelf position)
_rnd = random.Random(7)
_letters = 'ABCDEF GHIJKM NOPRST TUVWYZ'.split()
for r, ls in enumerate(_letters):
    for j, ch in enumerate(ls):
        i = len(BOOKS)
        pile = (960 + _rnd.uniform(-150, 150), 790 - _rnd.uniform(0, 60) - (1 - abs(_rnd.uniform(-1, 1))) * 50)
        shelf = (RX[r] - 60 + (j % 3) * 60, ROOM_Y0 + 105 + (j // 3) * 62)
        BOOKS.append((ch, BOOKC[i % len(BOOKC)], r, pile, shelf, _rnd.uniform(-0.6, 0.6)))
_order = list(range(len(BOOKS))); random.Random(3).shuffle(_order)

def room(dl, cx, name, a, hi=0.0, col=BLUE):
    if a <= 0.01: return
    x0, x1 = cx - 108, cx + 108
    card(dl, (x0, ROOM_Y0, x1, ROOM_Y1), 18, (255, 250, 240) if hi <= 0 else tuple(int(c * 0.25 + 255 * 0.75) for c in TEAL), alpha=a)
    for k in range(2):   # shelves
        y = ROOM_Y0 + 135 + k * 62
        dl.line([(x0 + 14, y), (x1 - 14, y)], fill=rgba((150, 110, 80), a), width=6)
    dl.chord((cx - 34, ROOM_Y1 - 66, cx + 34, ROOM_Y1 + 2), 180, 360, fill=rgba((190, 140, 100), a), outline=rgba(INK, a), width=4)
    dl.rectangle((cx - 34, ROOM_Y1 - 33, cx + 34, ROOM_Y1 - 3), fill=rgba((190, 140, 100), a))
    tag_pill(dl, cx, ROOM_Y0, name, INK, PAPER, size=26, alpha=a, fname='black')

def sc_library(L, G, dl, dg, lt, dur):
    t = E.NOW
    split = ab('meera_l3', 'four rooms'); fly0 = ab('meera_l3', 'A to F'); fly1 = ae('meera_l3')
    big = 1 - ease_out(prog(t, split - 0.2, split + 0.3))
    if big > 0.01:
        card(dl, (560, 200, 1360, 860), 30, (255, 250, 240), alpha=big)
        T(dl, 'ONE BIG ROOM', 34, 960, 250, INK, 'black', alpha=big)
        T(dl, '1,000,000 books', 26, 960, 292, SOFT, 'sb', alpha=big * ease_out(prog(t, ab('meera_l1', 'million'), ab('meera_l1', 'million') + 0.3)))
    hp = ab('chintu_l4', 'Harry')
    for r in range(4):
        room(dl, RX[r], RNAME[r], ease_out(prog(t, split + r * 0.12, split + r * 0.12 + 0.35)),
             hi=1.0 if (r == 2 and t >= ab('meera_l5', 'walks') + 1.0) else 0.0)
    span = max(0.5, fly1 - fly0)
    for n, idx in enumerate(_order):
        ch, col, r, pile, shelf, ang = BOOKS[idx]
        b0 = fly0 + span * n / len(BOOKS) * 0.85
        p = prog(t, b0, b0 + 0.6)
        if p <= 0:
            a = ease_out(prog(t, ab('meera_l1', 'huge'), ab('meera_l1', 'huge') + 0.5)) if t < split else 1.0
            book(dl, pile[0], pile[1], 1.4, col, ch, alpha=a, ang=ang)
        else:
            x, y = arc_pos(pile, shelf, p, 120)
            book(dl, x, y, lerp(1.4, 1.0, p), col, ch, ang=lerp(ang, 0, p))
    if t >= hp:
        tag_pill(dl, RX[1], ROOM_Y1 + 50, 'Harry Potter: H', ORANGE, size=24 * back(prog(t, hp, hp + 0.3)), fname='xb')
    if ab('chintu_l2', 'nap') <= t < ae('chintu_l2') + 0.3:
        for k in range(3):
            ph = (t * 0.7 + k / 3) % 1
            T(dl, 'z', 30 + ph * 30, CHX + 120 + ph * 50, CHY - 160 - ph * 80, SOFT, 'black', alpha=1 - ph)
    # librarian walks straight to the right room
    l0 = ab('meera_l5', 'asks'); w0 = ab('meera_l5', 'walks')
    if l0 <= t < ab('chintu_l6', 'four helpers'):
        wp = prog(t, w0, w0 + 1.0)
        px, py = lerp2((960, 700), (RX[2], ROOM_Y1 - 10), ease_in_out(wp))
        person(dl, px, py + math.sin(t * 18) * 3 * (0 < wp < 1), 1.5, GOLD, hat=True, alpha=ease_out(prog(t, l0, l0 + 0.3)))
        tag_pill(dl, 960, 830, 'find: "Sherlock"', INK, size=26, alpha=ease_out(prog(t, l0, l0 + 0.3)), fname='xb')
        if t >= w0 + 1.0:
            check_mark(dl, RX[2] + 80, ROOM_Y1 - 60, 26, rgba(TEAL), 9, prog(t, w0 + 1.0, w0 + 1.3))
    hl = ab('chintu_l6', 'four helpers')
    if t >= hl:
        for r in range(4):
            person(dl, RX[r], ROOM_Y1 - 10, 1.3 * pop_in(t, hl + r * 0.12), [CORAL, TEAL, BLUE, VIOLET][r], hat=True)
        f0 = ab('chintu_l6', 'searching')
        if t >= f0: tag_pill(dl, 960, 760, 'small rooms = fast search', TEAL, size=28 * back(prog(t, f0, f0 + 0.35)), fname='xb')
    ck(mood='think' if ab('chintu_l2') <= t < ae('chintu_l2') + 0.3 else ('laugh' if ab('chintu_l4') <= t < ae('chintu_l4') else 'happy'),
       point=(RX[1] - 40, ROOM_Y1 + 40) if ab('chintu_l4') <= t < ae('chintu_l4') else None)
    mk(point=(RX[3] + 60, 400) if split <= t < fly1 else ((RX[3] + 40, 640) if l0 <= t < ae('meera_l5') else None))

# ---------------- chapter 4: shards, shard key, router ----------------
SX = [600, 840, 1080, 1320]; SY = 720; RT = (960, 465); APP = (960, 200)
def sc_shards(L, G, dl, dg, lt, dur):
    t = E.NOW
    st = CH[3][2]
    r0 = ab('meera_r1', 'shard:'); k0 = ab('meera_r4', 'shard key'); rt0 = ab('meera_r6', 'router')
    q0 = ab('meera_r7', 'profile'); qr = ab('meera_r7', 'R falls'); qa = ab('meera_r7', 'asks only')
    sleep0 = ab('chintu_r8', 'other three')
    if t >= rt0:
        a = ease_out(prog(t, rt0, rt0 + 0.4))
        for x in SX: wire(dl, (RT[0], RT[1] + 40), (x, SY - 125), alpha=0.35 * a)
        wire(dl, (APP[0], APP[1] + 32), (RT[0], RT[1] - 40), alpha=0.35 * a)
    for i, x in enumerate(SX):
        state = 'ok'
        if t >= qa + 0.6: state = 'happy' if i == 2 else 'sleep'
        db(dl, x, SY, 0.88 * pop_in(t, st + 0.3 + i * 0.12), t, state, RNAME[i], glow=prog(t, qa + 0.6, qa + 0.9) if i == 2 else 0)
        T(dl, f'Shard {i}', 26, x, SY + 135, INK, 'black', alpha=ease_out(prog(t, st + 0.5, st + 0.9)))
    if t >= r0:
        tag_pill(dl, 960, 330, 'SHARD = a smaller database with part of the data', INK, (255, 240, 214), size=26 * back(prog(t, r0, r0 + 0.35)), fname='xb', alpha=1 - prog(t, k0 - 0.3, k0))
    if k0 - 0.3 <= t < q0:
        a = ease_out(prog(t, k0 - 0.3, k0)) * (1 - prog(t, q0 - 0.3, q0))
        card(dl, (700, 270, 1220, 370), 22, alpha=a)
        T(dl, 'user_id: 1047', 28, 760, 320, SOFT, 'mono', alpha=a, anchor='lm')
        n0 = ab('meera_r4', 'name')
        hi = t >= n0
        if hi: dl.rounded_rectangle((990, 296, 1200, 344), radius=12, fill=rgba(GOLD, 0.45 * a))
        T(dl, 'name: Rahul', 28, 1000, 320, INK, 'mono', alpha=a, anchor='lm')
        tag_pill(dl, 1095, 248, 'SHARD KEY', INK, GOLD, size=22 * back(prog(t, n0, n0 + 0.3)), fname='black', alpha=a)
    if t >= rt0:
        tag_pill(dl, APP[0], APP[1], 'APP', INK, PAPER, size=28, alpha=ease_out(prog(t, rt0, rt0 + 0.3)), fname='black')
        gpill(L, G, dl, *RT, 'ROUTER', back(prog(t, rt0, rt0 + 0.4)), w=300, h=80, size=36)
    # query for Rahul
    if q0 <= t:
        p1 = prog(t, q0, q0 + 0.7)
        if t < qa + 0.6:
            if p1 < 1: x, y = lerp2((APP[0], APP[1] + 30), (RT[0], RT[1] - 45), fly(p1))
            else:
                p2 = prog(t, qa, qa + 0.6)
                x, y = lerp2((RT[0], RT[1] + 45), (SX[2], SY - 125), fly(p2)) if t >= qa else (RT[0] + 0, RT[1] - 45)
            envelope(dl, x, y, 1.2)
            T(dl, 'Rahul?', 24, x, y - 40, INK, 'black')
        if t >= qr:
            tag_pill(dl, RT[0] + 290, RT[1], 'R is in N-S', INK, (210, 245, 236), size=26 * back(prog(t, qr, qr + 0.3)), fname='xb')
        if t >= qa + 0.6:
            tag_pill(dl, SX[2], SY - 190, 'found Rahul!', TEAL, size=24 * back(prog(t, qa + 0.6, qa + 0.9)), fname='xb')
    if t >= sleep0:
        tag_pill(dl, 720, 300, 'only 1 shard did any work', TEAL, size=26 * back(prog(t, sleep0, sleep0 + 0.3)), fname='xb')
    ck(mood='laugh' if t >= ab('chintu_r8', 'love') else ('think' if ab('chintu_r5') <= t < ae('chintu_r5') else 'happy'))
    mk(point=(RT[0] + 160, RT[1]) if rt0 <= t < ae('meera_r6') else ((1180, 320) if k0 <= t < ae('meera_r4') else None))

# ---------------- chapter 5: range vs hash, hot spots ----------------
LX = [548, 653, 758, 863]; HX = [1058, 1163, 1268, 1373]; MY = 560; BASE = 830
def loadbars(dl, xs, vals, cols, a=1.0):
    for x, v, c in zip(xs, vals, cols):
        hgt = 150 * clamp(v)
        dl.rounded_rectangle((x - 26, BASE - 150, x + 26, BASE), radius=10, fill=rgba(INK, 0.08 * a))
        if hgt > 4: dl.rounded_rectangle((x - 26, BASE - hgt, x + 26, BASE), radius=10, fill=rgba(c, a), outline=rgba(INK, a), width=3)
    T(dl, 'load', 22, (xs[0] + xs[-1]) / 2, BASE + 26, SOFT, 'b', alpha=a)

def sc_ways(L, G, dl, dg, lt, dur):
    t = E.NOW
    st = CH[4][2]
    rg = ab('meera_w2', 'range'); hs = ab('meera_w3', 'hash'); ex = ab('meera_w4', 'For example')
    a6 = ab('meera_w6', 'Aarav'); hot = ab('meera_w8', 'hot spot'); cel = ab('meera_w8', 'celebrity'); spr = ab('meera_w9', 'spread')
    for y in range(140, 860, 26):
        dl.line([(960, y), (960, y + 13)], fill=rgba(INK, 0.22), width=4)
    la = ease_out(prog(t, rg, rg + 0.4)); ha = ease_out(prog(t, hs, hs + 0.4))
    T(dl, 'RANGE', 40, 705, 150, ORANGE, 'black', alpha=la)
    tag_pill(dl, 705, 225, 'by first letter: A-F, G-M ...', INK, size=24, alpha=la, fname='xb')
    T(dl, 'HASH', 40, 1215, 150, TEAL, 'black', alpha=ha)
    if t >= hs:
        f0 = ab('meera_w3', 'remainder')
        card(dl, (1035, 195, 1395, 255), 30, (230, 250, 245), alpha=ha)
        T(dl, 'hash(user_id) % 4', 28, 1215, 226, INK, 'mono', alpha=ha)
        if t >= f0: tag_pill(dl, 1215, 290, '% = remainder', SOFT, size=22, alpha=ease_out(prog(t, f0, f0 + 0.3)), fname='xb')
    # left: range shards
    hotv = ease_out(prog(t, a6, ab('meera_w6', 'Arjun') + 0.6))
    for i, x in enumerate(LX):
        state = 'ok'
        if t >= a6: state = 'sweat' if i == 0 else ('bored' if t >= ab('chintu_w7', 'bored') else 'ok')
        db(dl, x, MY, 0.5 * pop_in(t, rg + i * 0.1), t, state, RNAME[i], fire=(i == 0 and t >= hot))
    for i, x in enumerate(HX):
        db(dl, x, MY, 0.5 * pop_in(t, hs + i * 0.1), t, 'happy' if t >= spr + 0.8 else 'ok', str(i), glow=prog(t, ex + 1.6, ex + 2.0) * (1 - prog(t, ex + 3, ex + 3.5)) if i == 3 else 0)
    # range example names
    for j, (nm, r) in enumerate((('Dev', 0), ('Kabir', 1), ('Neha', 2), ('Zoya', 3))):
        b0 = rg + 0.8 + j * 0.5
        p = prog(t, b0, b0 + 0.6)
        if 0 < p < 1: x, y = arc_pos((705, 330), (LX[r], MY - 80), p, 40); namechip(dl, x, y, nm, BOOKC[j])
    for j, w_ in enumerate(('Aarav', 'Aditi', 'Ananya', 'Arjun')):
        b0 = ab('meera_w6', w_)
        p = prog(t, b0, b0 + 0.6)
        if 0 < p < 1: x, y = arc_pos((705, 330), (LX[0], MY - 80), p, 40); namechip(dl, x, y, w_, CORAL)
    if t >= a6 - 0.5 and t < hot:
        tag_pill(dl, 705, 330, 'half the names start with A', CORAL, size=22, alpha=ease_out(prog(t, a6 - 0.5, a6)), fname='xb')
    # hash example
    if ex <= t < spr:
        a = ease_out(prog(t, ex, ex + 0.3))
        T(dl, '1047 → hash → % 4 → 3', 30, 1215, 360, INK, 'mono', alpha=a)
        p = prog(t, ex + 1.4, ex + 2.0)
        if 0 < p < 1: x, y = arc_pos((1215, 395), (HX[3], MY - 80), p, 40); namechip(dl, x, y, '1047', TEAL)
    # load bars
    if t >= rg:
        lv = [0.25, 0.25, 0.25, 0.25]
        lv = [lerp(0.25, v, hotv) for v in (1.0, 0.12, 0.08, 0.1)]
        loadbars(dl, LX, lv, [CORAL if hotv > 0.5 else ORANGE, ORANGE, ORANGE, ORANGE], la)
    if t >= hs:
        ev = ease_out(prog(t, spr, spr + 1.2))
        loadbars(dl, HX, [lerp(0.2, 0.5, ev) * (1 + 0.04 * math.sin(i * 2.3)) for i in range(4)], [TEAL] * 4, ha)
    if t >= spr:
        for j in range(16):
            b0 = spr + j * 0.12
            p = prog(t, b0, b0 + 0.6)
            if 0 < p < 1:
                x, y = arc_pos((1215, 330), (HX[j % 4], MY - 80), p, 40)
                dl.ellipse((x - 12, y - 12, x + 12, y + 12), fill=rgba(BOOKC[j % 7]), outline=rgba(INK), width=3)
        tag_pill(dl, 1215, 360, 'spread evenly', TEAL, size=28 * back(prog(t, spr + 0.3, spr + 0.6)), fname='black')
    if t >= hot:
        p = prog(t, hot, hot + 0.35)
        gtext(L, G, 'HOT SPOT!', 'black', 60, 705, 345, scale=lerp(1.6, 1, ease_out(p)), alpha=clamp(p * 2), glow=False, c1=(255, 110, 100), c2=(230, 40, 80))
    if t >= cel:
        p = pop_in(t, cel)
        star(dl, LX[0] + 70, MY - 120, 30 * p)
        tag_pill(dl, LX[0] + 175, MY - 120, '1M fans', INK, (255, 240, 200), size=22 * p, fname='black')
    ck(mood='shock' if ab('chintu_w7') <= t < ae('chintu_w7') else ('think' if ab('chintu_w5') <= t < ae('chintu_w5') else 'happy'),
       point=(LX[0] - 30, MY) if ab('chintu_w7') <= t < ae('chintu_w7') else None)
    mk(point=(HX[3] + 40, 300) if hs <= t < ae('meera_w4') or t >= spr else None)

# ---------------- chapter 6: costs + real apps ----------------
COSTS = [('1', 'Cross-shard queries', 'count all users = ask EVERY shard', BLUE, 'meera_c2', 'First'),
         ('2', 'Joins get tricky', 'user on shard 1, orders on shard 3', VIOLET, 'meera_c3', 'Second'),
         ('3', 'Re-sharding', 'add a 5th shard: % 4 becomes % 5', CORAL, 'meera_c4', 'Third')]
REAL = [('Instagram', 'user data split by user ID', 'thousands of shards', ORANGE),
        ('WhatsApp-style chats', 'chats split by user', 'your chats stay together', TEAL)]
def sc_costs(L, G, dl, dg, lt, dur):
    t = E.NOW
    real = ab('chintu_c7')
    if t < real:
        out = ease_out(prog(t, real - 0.4, real))
        T(dl, 'THE COSTS', 40, 960 - out * 1200, 150, CORAL, 'black')
        for i, (n, ttl, sub, col, key, word) in enumerate(COSTS):
            t0 = ab(key, word)
            p = prog(t, t0, t0 + 0.4)
            if p <= 0: continue
            cy = 280 + i * 175
            off = (1 - ease_out(p)) * 600 - out * 1300
            x0, x1 = 500 + off, 1420 + off
            card(dl, (x0, cy - 72, x1, cy + 72), 30, PAPER, alpha=clamp(p * 2))
            dl.ellipse((x0 + 26, cy - 46, x0 + 118, cy + 46), fill=rgba(col), outline=rgba(INK), width=5)
            T(dl, n, 50, x0 + 72, cy + 2, PAPER, 'black')
            T(dl, ttl, 42, x0 + 145, cy - 22, INK, 'black', anchor='lm')
            T(dl, sub, 27, x0 + 145, cy + 28, SOFT, 'sb', anchor='lm')
            if i == 0:
                for k in range(4):
                    bx = x1 - 170 + k * 42
                    dl.ellipse((bx - 14, cy - 18, bx + 14, cy + 18), fill=rgba((226, 236, 255)), outline=rgba(INK), width=3)
                    if t >= t0 + 1.0: dl.line([(bx, cy - 52), (bx, cy - 22)], fill=rgba(BLUE, prog(t, t0 + 1 + k * 0.15, t0 + 1.2 + k * 0.15)), width=4)
        mv = ab('meera_c4', 'move')
        if t >= mv:   # users moving house
            for k in range(6):
                ph = ((t - mv) * 0.8 + k / 6) % 1
                x = lerp(1080, 1380, ph)
                person(dl, x, 610 - math.sin(ph * math.pi) * 18, 0.6, [CORAL, TEAL, BLUE, VIOLET, ORANGE, GOLD][k], alpha=(1 - out) * min(1, (1 - ph) * 4, ph * 4))
        cs = ab('meera_c6', 'consistent')
        if t >= cs:
            gpill(L, G, dl, 960 - out * 1300, 800, 'CONSISTENT HASHING = only a small slice moves', back(prog(t, cs, cs + 0.4)), w=900, h=76, size=30, fname='xb')
    else:
        T(dl, 'REAL APPS DO THIS', 40, 960, 150, TEAL, 'black', alpha=ease_out(prog(t, real, real + 0.4)))
        for i, (ttl, sub, sub2, col) in enumerate(REAL):
            t0 = ab('meera_c8', ttl.split('-')[0].split()[0])
            p = prog(t, t0, t0 + 0.4)
            if p <= 0: continue
            cy = 320 + i * 200
            sc = back(p)
            card(dl, (520, cy - 80 * sc, 1400, cy + 80 * sc), 30, PAPER)
            dl.ellipse((550, cy - 48, 646, cy + 48), fill=rgba(col), outline=rgba(INK), width=5)
            for k in range(3):   # mini shard stack icon
                dl.ellipse((570, cy - 30 + k * 20, 626, cy - 14 + k * 20), fill=rgba(PAPER), outline=rgba(INK), width=3)
            T(dl, ttl, 44, 675, cy - 30, INK, 'black', anchor='lm', alpha=clamp(p * 2))
            T(dl, sub + '  ·  ' + sub2, 25, 675, cy + 26, SOFT, 'sb', anchor='lm', alpha=clamp(p * 2))
        w9 = ab('meera_c9', 'shard only')
        if t >= w9:
            gpill(L, G, dl, 960, 760, 'Shard only when you must', back(prog(t, w9, w9 + 0.4)), w=620, h=80, size=36)
    ck(mood='sad' if ab('chintu_c5') <= t < ae('chintu_c5') + 0.3 else ('laugh' if ab('chintu_c1') <= t < ae('chintu_c1') else 'happy'),
       wave=ab('chintu_c1') <= t < ae('chintu_c1'))
    mk(point=(1440, 420) if ab('meera_c2') <= t < ae('meera_c4') else None, mood='think' if ab('meera_c2') <= t < ab('meera_c2', 'First') else 'happy')

# ---------------- chapter 7: recap ----------------
RECAP = [('SHARD', 'one piece of a split database', ORANGE, 'meera_x2'),
         ('SHARD KEY', 'decides where data goes (name, user_id)', GOLD, 'chintu_x3'),
         ('RANGE vs HASH', 'split by ranges, or hash to spread evenly', TEAL, 'meera_x4'),
         ('HOT SPOT', 'one shard gets way too much load', CORAL, 'chintu_x5')]
def sc_recap(L, G, dl, dg, lt, dur):
    t = E.NOW
    st = CH[6][2]
    T(dl, 'RECAP', 34, 960, 140, ORANGE, 'b', alpha=ease_out(prog(t, st + 0.1, st + 0.5)))
    T(dl, '4 key words', 54, 960, 192, INK, 'black', alpha=ease_out(prog(t, st + 0.1, st + 0.5)))
    for i, (ttl, sub, col, key) in enumerate(RECAP):
        t0 = ab(key)
        p = prog(t, t0, t0 + 0.4)
        if p <= 0: continue
        cx, cy = (715 if i % 2 == 0 else 1205), (380 if i < 2 else 640)
        sc = back(p)
        card(dl, (cx - 230 * sc, cy - 110 * sc, cx + 230 * sc, cy + 110 * sc), 30, PAPER)
        dl.ellipse((cx - 205, cy - 85, cx - 145, cy - 25), fill=rgba(col), outline=rgba(INK), width=4)
        check_mark(dl, cx - 175, cy - 54, 20, rgba(PAPER), 7, prog(t, t0 + 0.1, t0 + 0.4))
        T(dl, ttl, 40, cx - 125, cy - 55, INK, 'black', anchor='lm', alpha=clamp(p * 2))
        words = sub.split(); half = (len(words) + 1) // 2
        T(dl, ' '.join(words[:half]), 27, cx, cy + 22, SOFT, 'sb', alpha=clamp(p * 2))
        T(dl, ' '.join(words[half:]), 27, cx, cy + 62, SOFT, 'sb', alpha=clamp(p * 2))
    ck(mood='laugh' if ab('chintu_x5', 'buffet') <= t else 'happy')

# ---------------- chapter 8: quiz ----------------
def countdown(dl, cx, cy, t, c0):
    if not (c0 <= t < c0 + 3.0): return
    u = t - c0; n = 3 - int(u)
    a = ease_out(prog(t, c0, c0 + 0.2))
    dl.ellipse((cx - 78, cy - 78, cx + 78, cy + 78), fill=rgba(PAPER, a), outline=rgba(INK, a), width=5)
    dl.arc((cx - 66, cy - 66, cx + 66, cy + 66), -90, -90 + 360 * (1 - u / 3.0), fill=rgba(ORANGE, a), width=14)
    fu = u - int(u)
    T(dl, str(n), 80 * lerp(1.3, 1.0, ease_out(clamp(fu * 4))), cx, cy + 4, INK, 'black', alpha=a)

def opt_chips(dl, labels, y, t, t0, ans, ta, size=34):
    xs = [W / 2 + (i - (len(labels) - 1) / 2) * 230 for i in range(len(labels))]
    for i, (x, lab) in enumerate(zip(xs, labels)):
        s = pop_in(t, t0 + i * 0.1)
        if s <= 0.02: continue
        good = t >= ta and i == ans
        dim = t >= ta and i != ans
        w, h = 200 * s, 92 * s
        card(dl, (x - w / 2, y - h / 2, x + w / 2, y + h / 2), 24, (206, 246, 232) if good else PAPER, outline=TEAL if good else INK, alpha=0.45 if dim else 1)
        T(dl, lab, size * s, x, y + 2, INK, 'black', alpha=0.45 if dim else 1)
        if good: check_mark(dl, x + w / 2 - 8, y - h / 2 + 4, 26, rgba(TEAL), 9, prog(t, ta, ta + 0.3))

QTEXT = ['A book called "Mango". Which room?', 'Shard = user_id % 4. User 10 goes to...', 'One shard on fire, others chilling?']
def sc_quiz(L, G, dl, dg, lt, dur):
    t = E.NOW
    if t < ab('meera_q1'):
        p = prog(t, CH[7][2] + 0.1, CH[7][2] + 0.5)
        gtext(L, G, 'MINI QUIZ', 'black', 120, 960, 400, scale=back(p), glow=False)
        tag_pill(dl, 960, 530, '3 questions · 3 seconds each', INK, size=30, alpha=ease_out(prog(t, ab('meera_q0', 'Three'), ab('meera_q0', 'Three') + 0.3)), fname='xb')
        ck(mood='shock'); return
    qi = max(i for i, (q, a) in enumerate(QUIZ) if t >= ab(q) - 0.25)
    q, a = QUIZ[qi]; t0 = ab(q); ta = ab(a); c0 = cd_start(q)
    T(dl, f'QUESTION {qi + 1} / 3', 32, 960, 150, ORANGE, 'black', alpha=ease_out(prog(t, t0 - 0.25, t0 + 0.1)))
    T(dl, QTEXT[qi], 46, 960, 225, INK, 'black', alpha=ease_out(prog(t, t0, t0 + 0.3)))
    if qi == 0:
        book(dl, 960, 340, 1.9 * pop_in(t, t0 + 0.4), ORANGE, 'M')
        opt_chips(dl, RNAME, 480, t, t0 + 0.6, 1, ta)
    elif qi == 1:
        tag_pill(dl, 960, 340, 'user_id = 10', INK, (255, 240, 214), size=30 * pop_in(t, t0 + 0.4), fname='black')
        opt_chips(dl, ['Shard 0', 'Shard 1', 'Shard 2', 'Shard 3'], 480, t, t0 + 0.6, 2, ta, size=30)
        if t >= ta: tag_pill(dl, 960, 700, '10 % 4 = 2', TEAL, size=40 * back(prog(t, ta, ta + 0.35)), fname='black')
    else:
        for i in range(4):
            db(dl, 690 + i * 180, 380, 0.5 * pop_in(t, t0 + 0.3 + i * 0.08), t, 'sweat' if i == 1 else 'sleep', fire=i == 1)
        opt_chips(dl, ['Shard key', 'Hot spot', 'Router'], 560, t, ab(q, 'What'), 1, ta, size=30)
        if t >= ta: tag_pill(dl, 960, 720, 'fix: a better shard key (hash)', TEAL, size=30 * back(prog(t, ta, ta + 0.35)), fname='xb')
    countdown(dl, 960, 700 if qi < 2 else 740, t, c0)
    if t >= ta and qi == 0:
        tag_pill(dl, 960, 700, 'M is in G-M', TEAL, size=40 * back(prog(t, ta, ta + 0.35)), fname='black')
    thinking = c0 <= t < ta
    ck(mood='think' if thinking else ('laugh' if t >= ta else 'happy'))
    mk(mood='happy', point=(1180, 480) if ta <= t < ta + 2 else None)

# ---------------- chapter 9: outro ----------------
def sc_outro(L, G, dl, dg, lt, dur):
    t = E.NOW
    n0 = ab('chintu_o1', 'Next'); c0 = ab('meera_o2', 'Practise'); pz = ab('chintu_o3', 'pizza')
    if t < c0:
        p = prog(t, n0, n0 + 0.4)
        tag_pill(dl, 960, 200, 'NEXT EPISODE', ORANGE, size=30 * back(p), fname='black')
        p2 = prog(t, ab('chintu_o1', 'message'), ab('chintu_o1', 'message') + 0.4)
        gtext(L, G, 'MESSAGE QUEUES', 'black', 96, 960, 330, scale=back(p2), alpha=clamp(p2 * 2), glow=False)
        if p2 > 0:   # envelopes waiting in a line
            dl.rounded_rectangle((560, 520, 1360, 600), radius=40, fill=rgba(PAPER), outline=rgba(INK), width=5)
            for k in range(7):
                x = 600 + ((t * 70 + k * 110) % 770)
                envelope(dl, x, 560, 1.1, alpha=min(1, (1360 - x) / 60, (x - 580) / 40) if 580 < x < 1360 else 0)
            T(dl, 'waiting in line...', 30, 960, 660, SOFT, 'sb', alpha=clamp(p2))
    else:
        sc = back(prog(t, c0, c0 + 0.4))
        f = F('black', 120)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 120 * sc, x0, 260, INK, anchor='lm')
        gtext(L, G, 'Code', 'black', 120, x0 + wv * sc + wc * sc / 2, 266, scale=sc, glow=False)
        T(dl, 'System design & DSA, explained visually.', 32, W / 2, 360, SOFT, 'm', alpha=ease_out(prog(t, c0 + 0.4, c0 + 0.8)))
        s1 = ab('meera_o2', 'vizu')
        b = prog(t, s1, s1 + 0.4)
        if b > 0:
            s2 = back(b) * (1 + 0.025 * math.sin(t * 5))
            gpill(L, G, dl, W / 2, 490, 'vizucode.site', s2, w=560, h=110, size=50, fname='xb')
        fo = ab('meera_o2', 'follow')
        g = ease_out(prog(t, fo, fo + 0.4))
        if g > 0:
            iy = 640; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(INK, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(INK, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(INK, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, INK, anchor='lm', alpha=g)
        tag_pill(dl, 960, 770, 'Part 4: Message Queues', ORANGE, size=26, alpha=ease_out(prog(t, fo + 0.8, fo + 1.2)), fname='xb')
    if t >= pz:
        pizza(dl, CHX + 175, CHY + 40, 70 * pop_in(t, pz), t)
    ck(wave=t >= ab('chintu_o3') and t < pz + 0.2, mood='laugh' if t >= pz + 0.3 or ab('chintu_o1', 'Unlike') <= t < ae('chintu_o1') else 'happy',
       point=(CHX + 175, CHY + 40) if t >= pz + 0.2 else None)
    mk(wave=t >= ab('chintu_o3'))

E.SCENES.update(hook=sc_hook, scale=sc_scale, library=sc_library, shards=sc_shards, ways=sc_ways, costs=sc_costs,
                recap=sc_recap, quiz=sc_quiz, outro=sc_outro)
if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'chapters':
        for name, ttl, st in CH: print(f'{int(st // 60)}:{int(st % 60):02d} {ttl}')
        print('total', round(E.TOTAL, 2)); sys.exit()
    E.main()
