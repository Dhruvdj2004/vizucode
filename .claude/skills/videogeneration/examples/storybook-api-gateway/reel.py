"""Load Balancer explained for total beginners — kid narrator 'Chintu', storybook style (not the DSA look)."""
import os, sys, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
VOICE_GAIN = 2.0   # voice ~6 dB above the music bed
for _k in E.VOAUD: E.VOAUD[_k] = E.VOAUD[_k] * VOICE_GAIN

# ---- exact word timings (from Whisper) for captions + animation cues ----
import json as _json
WT = {}
for _k in E.VOTEXT:
    _p = os.path.join(E.WORK, 'vo', _k + '.words.json')
    if os.path.exists(_p): WT[_k] = _json.load(open(_p))
def vo_at(key, phrase, lead=0.0):
    txt = E.VOTEXT[key]; i = txt.lower().find(phrase.lower())
    assert i >= 0, (key, phrase)
    if key in WT: return lead + WT[key][len(txt[:i].split())][0]
    return lead + E.VODUR[key] * i / len(txt)

def rebuild_captions():
    caps = []
    for ts, key in E.vo_events:
        raw = E.VOTEXT[key].split()
        tm = WT.get(key)
        if not tm: continue
        toks, i = [], 0   # merge brand words into one display token
        while i < len(raw):
            low = [w.lower().strip('.,!?') for w in raw[i:i + 4]]
            if low[:4] == ['vizu', 'code', 'dot', 'site']: toks.append(('vizucode.site' + raw[i + 3][4:], i, i + 3)); i += 4
            elif low[:2] == ['vizu', 'code']: toks.append(('vizucode' + raw[i + 1][4:], i, i + 1)); i += 2
            else: toks.append((raw[i], i, i)); i += 1
        chunks, cur = [], []
        for tok in toks:
            cur.append(tok)
            txt = ' '.join(c[0] for c in cur)
            if len(txt) >= 14 or tok[0][-1] in '.?!:,' or len(cur) >= 3: chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        for j, ch in enumerate(chunks):
            st = ts + tm[ch[0][1]][0] - 0.04
            en = ts + (tm[chunks[j + 1][0][1]][0] - 0.04 if j + 1 < len(chunks) else tm[ch[-1][2]][1] + 0.25)
            caps.append((st, en, ' '.join(c[0] for c in ch)))
    E.captions[:] = caps
E.CFG.update(
    HEADER_TAG='System Design · For Beginners',
    CAPTION_GOLD={'payment', 'order', 'api', 'gateway', 'gateway!', 'gateway.', 'microservices', 'microservices.', 'microservices,', 'monolith', 'monolith.',
                  'service', 'services', 'services?', 'orders', 'orders,', 'payments', 'payments.', 'users,', 'receptionist', 'receptionist.', 'chintu', 'door'},
    CAPTION_TEAL={'yes', 'yes!', 'neat'},
    CAPTION_CORAL={'breaks', 'down', 'down.', 'messy', "messy!", 'spammers', 'spammers.', "can't"},
)

# ---------------- storybook theme ----------------
INK = (44, 38, 78)
SKIN = (255, 208, 168)
HAIR = (52, 34, 30)
SHIRT = (255, 140, 66)
PAPER = (255, 255, 255)
SOFT = (110, 104, 140)
PEOPLE = [CORAL, TEAL, BLUE, VIOLET, ORANGE, (120, 200, 90)]

def make_story_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = np.array((255, 241, 222), np.float32), np.array((206, 230, 255), np.float32)
    k = (y / H)[..., None]
    img = top * (1 - k) + bot * k
    def blob(cx, cy, rx, ry, col, a):
        d = np.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2))
        return d[..., None] * (np.array(col, np.float32) - img) * a
    img += blob(W * 0.9, 300, 380, 300, (255, 200, 150), 0.6)
    img += blob(W * 0.05, H * 0.7, 420, 380, (190, 240, 225), 0.6)
    for cx, cy, r in [(150, 360, 70), (230, 340, 90), (310, 365, 60), (840, 1560, 80), (930, 1540, 100), (1010, 1570, 70)]:
        d = ((x - cx) ** 2 + (y - cy) ** 2) < r * r
        img[d] = img[d] * 0.45 + 255 * 0.55
    dots = ((x % 54) - 27) ** 2 + ((y % 54) - 27) ** 2 < 4
    img[dots] = img[dots] * 0.93
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
E.BGIMG = make_story_bg()

def header(dl, L, G):
    f = F('black', 46)
    wv, wc = f.getlength('Vizu'), f.getlength('Code')
    x0 = W / 2 - (wv + wc) / 2
    dl.text((x0, 175), 'Vizu', font=f, fill=rgba(INK), anchor='lm')
    gtext(L, G, 'Code', 'black', 46, x0 + wv + wc / 2, 177, glow=False)
    tag = E.CFG['HEADER_TAG']
    tw = F('sb', 26).getlength(tag) + 90
    pill(dl, W / 2, 250, tw, 58, PAPER, INK, width=3)
    pill(dl, W / 2 - tw / 2 + 32, 250, 16, 16, TEAL)
    text(dl, tag, 'sb', 26, W / 2 + 12, 251, INK)
E.header = header

def T(dl, s, size, cx, cy, col=INK, fname='xb', alpha=1.0, anchor='mm'):
    text(dl, s, fname, size, cx, cy, col, alpha=alpha, anchor=anchor)

def shadow_rr(dl, box, r, alpha=1.0, off=9):
    x0, y0, x1, y1 = box
    dl.rounded_rectangle((x0 + off, y0 + off, x1 + off, y1 + off), radius=r, fill=rgba(INK, 0.16 * alpha))

def card(dl, box, r=28, fill=PAPER, outline=INK, alpha=1.0, width=5):
    shadow_rr(dl, box, r, alpha)
    dl.rounded_rectangle(box, radius=r, fill=rgba(fill, alpha), outline=rgba(outline, alpha), width=width)

def tag_pill(dl, cx, cy, s, col=INK, fill=PAPER, size=32, alpha=1.0, fname='b'):
    if alpha <= 0.01: return
    w = F(fname, size).getlength(s) + size * 1.3; h = size * 1.9
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    shadow_rr(dl, box, h / 2, alpha, 6)
    dl.rounded_rectangle(box, radius=h / 2, fill=rgba(fill, alpha), outline=rgba(INK, alpha), width=4)
    text(dl, s, fname, size, cx, cy + 1, col, alpha=alpha)

def lb_pill(L, G, dl, cx, cy, s=1.0, w=520, h=104, label='LOAD BALANCER'):
    if s <= 0.02: return
    ww, hh = w * s, h * s
    dl.rounded_rectangle((cx - ww / 2 + 9, cy - hh / 2 + 10, cx + ww / 2 + 9, cy + hh / 2 + 10), radius=hh / 2, fill=rgba(INK, 0.18))
    grad_pill(L, G, cx, cy, w, h, scale=s)
    dl.rounded_rectangle((cx - ww / 2, cy - hh / 2, cx + ww / 2, cy + hh / 2), radius=hh / 2, outline=rgba(INK), width=5)
    text(dl, label, 'black', 44 * s, cx, cy + 2, INK_ON_GRAD)

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

# ---------------- characters ----------------
def kid(dl, cx, cy, s, t, talk=0.0, wave=False, point=None, mood='happy'):
    """Chintu: cartoon kid narrator. (cx, cy) = head centre, s = scale (head radius 110*s)."""
    if s <= 0.02: return
    R = 110 * s
    cy += math.sin(t * 3.2) * 5 * s
    ink, skin, wl = rgba(INK), rgba(SKIN), max(3, int(6 * s))
    by0 = cy + R * 0.8; by1 = by0 + 210 * s
    # arms behind / beside body
    def arm(sx, sy, ang, ln):
        ex, ey = sx + math.cos(ang) * ln, sy + math.sin(ang) * ln
        mx, my = sx + math.cos(ang) * ln * 0.45, sy + math.sin(ang) * ln * 0.45
        dl.line([(sx, sy), (ex, ey)], fill=ink, width=int(40 * s))
        dl.line([(sx, sy), (ex, ey)], fill=skin, width=int(28 * s))
        dl.line([(sx, sy), (mx, my)], fill=rgba(SHIRT), width=int(30 * s))
        r = 22 * s
        dl.ellipse((ex - r, ey - r, ex + r, ey + r), fill=skin, outline=ink, width=wl)
    shL = (cx - 82 * s, by0 + 45 * s); shR = (cx + 82 * s, by0 + 45 * s)
    if point is not None:
        angR = math.atan2(point[1] - shR[1], point[0] - shR[0]); lnR = 150 * s
    elif wave:
        angR = -math.pi * 0.32 + 0.38 * math.sin(t * 9); lnR = 150 * s
    else:
        angR = math.pi * 0.42; lnR = 125 * s
    if point is not None and point[0] < cx:   # point with the left hand instead
        angL = math.atan2(point[1] - shL[1], point[0] - shL[0]); lnL = 150 * s; angR = math.pi * 0.42; lnR = 125 * s
    else:
        angL = math.pi * 0.58; lnL = 125 * s
    arm(*shL, angL, lnL)
    arm(*shR, angR, lnR)
    # body
    dl.rounded_rectangle((cx - 100 * s, by0, cx + 100 * s, by1), radius=70 * s, fill=rgba(SHIRT), outline=ink, width=wl)
    dl.pieslice((cx - 34 * s, by0 - 30 * s, cx + 34 * s, by0 + 30 * s), 0, 180, fill=skin, outline=ink, width=wl)
    text(dl, '</>', 'mono', 46 * s, cx, by0 + 100 * s, PAPER)
    # ears + head
    for sx in (-1, 1):
        ex = cx + sx * R * 0.96
        dl.ellipse((ex - 24 * s, cy - 8 * s, ex + 24 * s, cy + 40 * s), fill=skin, outline=ink, width=wl)
    dl.ellipse((cx - R, cy - R, cx + R, cy + R), fill=skin, outline=ink, width=wl)
    # hair cap + fringe + tuft
    dl.chord((cx - 1.04 * R, cy - 1.12 * R, cx + 1.04 * R, cy + 0.42 * R), 180, 360, fill=rgba(HAIR), outline=ink, width=wl)
    hy = cy - 0.35 * R
    pts = [(cx - 1.0 * R, hy)]
    for i in range(6):
        x0 = cx - 0.9 * R + i * 0.32 * R
        pts += [(x0 + 0.16 * R, hy + (0.26 if i % 2 else 0.2) * R), (x0 + 0.32 * R, hy)]
    pts += [(cx + 1.0 * R, hy), (cx, hy - 0.2 * R)]
    dl.polygon(pts, fill=rgba(HAIR))
    dl.polygon([(cx - 0.12 * R, cy - 1.05 * R), (cx + 0.05 * R, cy - 1.38 * R), (cx + 0.2 * R, cy - 1.02 * R)], fill=rgba(HAIR), outline=ink)
    # eyes (blink every ~3s)
    blink = 0.12 if ((t + 1.5) % 3.1) < 0.12 else 1.0
    shock = mood == 'shock'
    for sx in (-1, 1):
        ex, ey = cx + sx * 0.38 * R, cy + 0.12 * R
        rx, ry = 0.17 * R, 0.21 * R * blink * (1.15 if shock else 1)
        dl.ellipse((ex - rx, ey - ry, ex + rx, ey + ry), fill=rgba(PAPER), outline=ink, width=max(2, int(4 * s)))
        if blink > 0.5:
            pr = 0.1 * R * (0.8 if shock else 1)
            px, py = ex + 0.03 * R, ey + 0.03 * R
            dl.ellipse((px - pr, py - pr, px + pr, py + pr), fill=ink)
            dl.ellipse((px - pr * 0.2, py - pr * 0.75, px + pr * 0.35, py - pr * 0.2), fill=rgba(PAPER))
        by = cy - (0.2 if shock else 0.1) * R
        dl.line([(ex - 0.15 * R, by + sx * 0.0), (ex + 0.15 * R, by - (0.04 * R if not shock else 0))], fill=ink, width=max(2, int(7 * s)))
    for sx in (-1, 1):
        chx, chy = cx + sx * 0.62 * R, cy + 0.45 * R
        dl.ellipse((chx - 0.14 * R, chy - 0.08 * R, chx + 0.14 * R, chy + 0.08 * R), fill=(255, 140, 150, 120))
    # mouth
    mx, my = cx, cy + 0.56 * R
    if shock:
        dl.ellipse((mx - 0.12 * R, my - 0.13 * R, mx + 0.12 * R, my + 0.15 * R), fill=(120, 30, 45, 255), outline=ink, width=max(2, int(4 * s)))
    elif talk > 0.08:
        hgt = 0.05 * R + 0.25 * R * min(1.0, talk)
        dl.ellipse((mx - 0.18 * R, my - hgt / 2, mx + 0.18 * R, my + hgt / 2), fill=(120, 30, 45, 255), outline=ink, width=max(2, int(4 * s)))
        if hgt > 0.12 * R:
            dl.ellipse((mx - 0.09 * R, my + hgt / 2 - 0.09 * R, mx + 0.09 * R, my + hgt / 2 - 0.01 * R), fill=(255, 130, 140, 255))
    else:
        dl.chord((mx - 0.2 * R, my - 0.14 * R, mx + 0.2 * R, my + 0.14 * R), 0, 180, fill=(120, 30, 45, 255), outline=ink, width=max(2, int(4 * s)))

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

def envelope(dl, cx, cy, s=1.0, alpha=1.0):
    if alpha <= 0.01: return
    w, h = 30 * s, 21 * s
    ink = rgba(INK, alpha)
    dl.rounded_rectangle((cx - w, cy - h, cx + w, cy + h), radius=5 * s, fill=rgba((255, 214, 102), alpha), outline=ink, width=max(2, int(4 * s)))
    dl.line([(cx - w + 3, cy - h + 3), (cx, cy + 3 * s), (cx + w - 3, cy - h + 3)], fill=ink, width=max(2, int(3 * s)))

def server(dl, cx, cy, s, t, state='ok', alpha=1.0):
    """Cute server box with a face. state: ok | busy | dead."""
    if s <= 0.02: return
    w, h = 170 * s, 210 * s
    if state == 'dead':
        cx += math.sin(t * 40) * 3 * s
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    fill = {'ok': (240, 246, 255), 'busy': (255, 232, 206), 'dead': (255, 206, 206)}[state]
    card(dl, box, 26 * s, fill, alpha=alpha, width=max(3, int(6 * s)))
    ink = rgba(INK, alpha)
    for j in range(2):
        y = cy - h / 2 + (38 + j * 38) * s
        dl.rounded_rectangle((cx - w / 2 + 18 * s, y - 12 * s, cx + w / 2 - 18 * s, y + 12 * s), radius=6 * s,
                             fill=rgba((214, 222, 242), alpha), outline=ink, width=max(2, int(3 * s)))
        on = state != 'dead' and int(t * 3 + j * 1.3 + cx * 0.01) % 3 != 0
        led = CORAL if state == 'dead' else ((120, 210, 90) if on else (170, 200, 160))
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
            dl.line([(ex - 10 * s, fy - 7 * s * sx), (ex + 10 * s, fy), (ex - 10 * s, fy + 7 * s * sx)][::1], fill=ink, width=lw)
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
        for k in range(3):   # smoke
            ph = (t * 0.8 + k / 3) % 1
            sx_ = cx - 30 * s + k * 30 * s + math.sin(t * 3 + k) * 8 * s
            sy_ = cy - h / 2 - 20 * s - ph * 90 * s
            r = (14 + ph * 22) * s
            dl.ellipse((sx_ - r, sy_ - r, sx_ + r, sy_ + r), fill=(120, 120, 135, int(150 * (1 - ph) * alpha)))

def stall(dl, cx, cy, s=1.0):
    """Restaurant counter with a striped awning."""
    if s <= 0.02: return
    ink = rgba(INK)
    box = (cx - 100 * s, cy - 40 * s, cx + 100 * s, cy + 60 * s)
    card(dl, box, 14 * s, (255, 250, 240), width=max(3, int(5 * s)))
    dl.line([(cx - 100 * s, cy - 10 * s), (cx + 100 * s, cy - 10 * s)], fill=ink, width=max(2, int(4 * s)))
    ay0, ay1 = cy - 120 * s, cy - 75 * s
    for i in range(5):
        x0 = cx - 115 * s + i * 46 * s
        col = CORAL if i % 2 == 0 else PAPER
        dl.rectangle((x0, ay0, x0 + 46 * s, ay1), fill=rgba(col))
        dl.pieslice((x0, ay1 - 23 * s, x0 + 46 * s, ay1 + 23 * s), 0, 180, fill=rgba(col), outline=ink, width=max(2, int(3 * s)))
    dl.rectangle((cx - 115 * s, ay0, cx + 115 * s, ay1), outline=ink, width=max(2, int(4 * s)))
    for sx in (-1, 1):
        dl.line([(cx + sx * 95 * s, ay1 + 10 * s), (cx + sx * 95 * s, cy - 40 * s)], fill=ink, width=max(2, int(5 * s)))

def lerp2(a, b, p): return (lerp(a[0], b[0], p), lerp(a[1], b[1], p))


# ---------------- extra props ----------------
def phone(dl, cx, cy, s, screen='order', press=0.0):
    w, h = 150 * s, 260 * s
    card(dl, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 28 * s, INK, width=max(3, int(5 * s)))
    sx0, sy0, sx1, sy1 = cx - w / 2 + 11 * s, cy - h / 2 + 26 * s, cx + w / 2 - 11 * s, cy + h / 2 - 26 * s
    dl.rounded_rectangle((sx0, sy0, sx1, sy1), radius=14 * s, fill=rgba(PAPER))
    dl.rounded_rectangle((cx - 22 * s, cy - h / 2 + 9 * s, cx + 22 * s, cy - h / 2 + 17 * s), radius=4 * s, fill=rgba((90, 84, 130)))
    text(dl, 'FoodApp', 'xb', 20 * s, cx, sy0 + 24 * s, SOFT)
    if screen == 'order':
        bs = 1 - 0.12 * press
        bw, bh = 96 * s * bs, 46 * s * bs
        dl.rounded_rectangle((cx - bw / 2, cy - bh / 2 + 6 * s, cx + bw / 2, cy + bh / 2 + 6 * s), radius=bh / 2, fill=rgba(ORANGE), outline=rgba(INK), width=max(2, int(3 * s)))
        text(dl, 'Order', 'xb', 22 * s * bs, cx, cy + 7 * s, PAPER)
        for j in range(2):
            y = cy + 55 * s + j * 18 * s
            dl.rounded_rectangle((sx0 + 14 * s, y - 4 * s, sx1 - 14 * s - j * 25 * s, y + 4 * s), radius=4 * s, fill=rgba((220, 224, 236)))
    else:
        r = 30 * s
        dl.ellipse((cx - r, cy - 10 * s - r, cx + r, cy - 10 * s + r), fill=rgba(TEAL), outline=rgba(INK), width=max(2, int(3 * s)))
        check_mark(dl, cx, cy - 8 * s, 24 * s, rgba(PAPER), max(3, int(7 * s)))
        text(dl, 'Placed!', 'xb', 22 * s, cx, cy + 45 * s, TEAL)

def wire(dl, a, b, col=INK, alpha=0.45, width=6):
    dl.line([a, b], fill=rgba(col, alpha), width=width)

def msgfly(dl, a, b, u, dur=0.55):
    if 0 <= u < dur:
        x, y = lerp2(a, b, ease_in_out(u / dur)); envelope(dl, x, y, 1.0)

SVC = [('Users', 260, BLUE), ('Orders', 540, ORANGE), ('Payments', 820, VIOLET)]

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.7)
sfx.append((0.35, 'pop'))
H_SVC = 0.3 + vo_at('hook', 'so many')
for i in range(5): sfx.append((H_SVC + i * 0.08, 'tick'))
ps = vo_scene('problem', 'problem', pad=0.8)
P_MONO = vo_at('problem', 'monolith'); P_BREAK = vo_at('problem', 'breaks'); P_DOWN = vo_at('problem', 'goes down')
sfx += [(ps + 0.2 + P_MONO, 'ding'), (ps + 0.2 + P_BREAK + 0.2, 'buzz'), (ps + 0.2 + P_DOWN, 'buzz')]
ms = vo_scene('micro', 'micro', pad=0.7)
M_T = [vo_at('micro', 'Users'), vo_at('micro', 'orders'), vo_at('micro', 'payments')]
M_ONE = vo_at('micro', 'Each does')
sfx.append((ms + 0.25, 'whoosh'))
for tt in M_T: sfx.append((ms + 0.2 + tt, 'pop'))
is_ = vo_scene('idea', 'idea', pad=0.8)
I_MESSY = vo_at('idea', 'messy'); I_DOOR = vo_at('idea', 'front door'); I_GW = vo_at('idea', "That's the API") + 0.3
sfx += [(is_ + 0.2 + I_MESSY, 'buzz'), (is_ + 0.2 + I_DOOR, 'pop'), (is_ + 0.2 + I_GW, 'ding')]
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2', 'w3', 'w4'], gap=0.45, last_extra=1.6)
S = [s for s, d in WSTEPS]
PH = (540, 550); GW = (540, 770); SY = 1000
E_TAP = S[0] + 0.15; E_TOGW = S[0] + vo_at('w0', 'It goes')
E_ASK = S[1] + 0.1; E_YES = S[1] + vo_at('w1', 'Yes')
E_ORD = S[2] + vo_at('w2', 'sends') ; E_PAY = S[3] + vo_at('w3', 'asks')
E_BACK = S[4] + 0.1; E_DONE = E_BACK + 1.1
sfx += [(ws + E_TAP, 'tick'), (ws + E_TOGW + 0.55, 'pop'), (ws + E_ASK, 'pop'), (ws + E_YES, 'ding'),
        (ws + E_ORD + 0.55, 'pop'), (ws + E_PAY + 0.55, 'pop'), (ws + E_BACK + 0.5, 'pop'), (ws + E_DONE, 'win')]
js = vo_scene('jobs', 'jobs', pad=0.8)
J_T = [vo_at('jobs', 'checks') - 0.2, vo_at('jobs', 'sends') - 0.2, vo_at('jobs', 'blocks') - 0.2]
for tt in J_T: sfx.append((js + 0.2 + tt, 'pop'))
os_ = vo_scene('outro', 'outro', pad=1.8)
O_T = [vo_at('outro', 'Microservices'), vo_at('outro', 'The gateway'), vo_at('outro', 'Learn more')]
for tt in O_T[:2]: sfx.append((os_ + 0.2 + tt, 'ding'))
sfx.append((os_ + 0.2 + O_T[2] + 0.4, 'pop'))

rebuild_captions()
E.finish()

_spf = SR // FPS
AMP = np.zeros(E.NFRAMES + 2, np.float32)
for ts, key in E.vo_events:
    a = VOAUD[key]; f0 = int(ts * FPS)
    for i in range(len(a) // _spf):
        if f0 + i < len(AMP): AMP[f0 + i] = max(AMP[f0 + i], float(np.sqrt(np.mean(a[i * _spf:(i + 1) * _spf] ** 2))))
AMP = np.clip(AMP / max(1e-6, np.percentile(AMP[AMP > 0], 85)), 0, 1)
def talk(): return float(AMP[min(len(AMP) - 1, int(E.NOW * FPS))])

KX, KY, KS = 140, 1255, 0.62

# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    T(dl, 'WHAT IS AN', 92, W / 2, 410)
    s = 118
    while F('black', s).getlength('API GATEWAY?') > 880: s -= 2
    gtext(L, G, 'API GATEWAY?', 'black', s, W / 2, 515, glow=False)
    tag_pill(dl, W / 2, 610, 'explained in 60 seconds', SOFT, size=30)
    kid(dl, 540, 880, 1.2, lt, talk(), wave=lt < 2.2, mood='shock' if H_SVC - 0.2 < lt < H_SVC + 0.9 else 'happy')
    if lt < 2.4: bubble(dl, 830, 700, "Hi! I'm Chintu", (690, 790), size=40, sc=back(prog(lt, 0.15, 0.45)))
    for i in range(5):
        x = 140 + i * 200
        p = prog(lt, H_SVC + i * 0.08, H_SVC + i * 0.08 + 0.3)
        server(dl, x, 1335 + math.sin(lt * 5 + i) * 5, 0.5 * back(p), lt)

def sc_problem(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, 'THE OLD WAY', 40, W / 2, 385, ORANGE, 'b')
    T(dl, 'One giant app', 64, W / 2, 465)
    broke = v >= P_BREAK + 0.2; down = v >= P_DOWN
    p = back(prog(lt, 0.15, 0.55))
    if p <= 0.02: return
    cx, cy, bw, bh = 560, 860, 760 * p, 470 * p
    shake = math.sin(lt * 45) * 6 if down else 0
    card(dl, (cx - bw / 2 + shake, cy - bh / 2, cx + bw / 2 + shake, cy + bh / 2), 36, (255, 214, 214) if down else (244, 240, 255), width=6)
    parts = [('Login', BLUE), ('Menu', ORANGE), ('Pay', VIOLET)]
    for i, (name, col) in enumerate(parts):
        x = cx + shake + (i - 1) * 235 * p
        dead = (i == 2 and broke) or down
        c2 = CORAL if dead else col
        card(dl, (x - 105 * p, cy - 150 * p, x + 105 * p, cy + 175 * p), 24 * p, tuple(int(c * 0.22 + 255 * 0.78) for c in c2), outline=INK, width=4)
        if i == 0: person(dl, x, cy - 40 * p, 1.4 * p, c2)
        elif i == 1:
            for j in range(3): dl.rounded_rectangle((x - 50 * p, cy - 75 * p + j * 30 * p, x + 50 * p - j * 15 * p, cy - 61 * p + j * 30 * p), radius=7 * p, fill=rgba(c2))
        else:
            dl.rounded_rectangle((x - 55 * p, cy - 80 * p, x + 55 * p, cy - 5 * p), radius=10 * p, fill=rgba(c2), outline=rgba(INK), width=4)
            dl.rectangle((x - 55 * p, cy - 62 * p, x + 55 * p, cy - 48 * p), fill=rgba(INK))
        T(dl, name, 40 * p, x, cy + 100 * p, INK, 'black')
        if dead and i == 2:
            dl.line([(x - 20, cy - 150 * p), (x + 15, cy - 60), (x - 15, cy + 10), (x + 20, cy + 175 * p)], fill=rgba(INK), width=7)
    m = prog(v, P_MONO, P_MONO + 0.35)
    if m > 0: tag_pill(dl, cx, cy - bh / 2 - 5, 'MONOLITH', ORANGE, size=40 * back(m), fname='black')
    if down:
        c = prog(v, P_DOWN, P_DOWN + 0.3)
        gtext(L, G, 'APP DOWN!', 'black', 110, W / 2 + 40, 1230, scale=lerp(1.7, 1, ease_out(c)), alpha=clamp(c * 2), glow=False, c1=(255, 110, 100), c2=(230, 40, 80))
    kid(dl, KX, KY, KS, lt, talk(), point=None if down else (cx - 250, cy + 100), mood='shock' if down else 'happy')

def sc_micro(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, 'THE NEW WAY', 40, W / 2, 385, ORANGE, 'b')
    T(dl, 'Microservices', 70, W / 2, 465)
    sp = ease_out(prog(lt, 0.1, 0.8))
    if sp < 1:
        a = 1 - sp
        dl.rounded_rectangle((180, 625, 940, 1095), radius=36, outline=rgba(INK, a), width=6)
    for i, (name, x, col) in enumerate(SVC):
        x0 = 560 + (i - 1) * 235
        px = lerp(x0, x, sp)
        bob = math.sin(lt * 3 + i) * 6 * sp
        server(dl, px, 860 + bob, 1.05, lt)
        lp = prog(v, M_T[i], M_T[i] + 0.3)
        if lp > 0: tag_pill(dl, px, 1010, name, col, size=34 * back(lp), fname='xb')
    o = prog(v, M_ONE, M_ONE + 0.35)
    if o > 0: tag_pill(dl, 600, 1200, 'each one does ONE job', TEAL, size=36 * back(o), fname='xb')
    pv = max([i for i in range(3) if v >= M_T[i]], default=-1)
    kid(dl, KX, KY, KS, lt, talk(), point=(SVC[pv][1] - 60, 900) if 0 <= pv and v < M_ONE + 1 else None, wave=v >= M_ONE + 1)

def sc_idea(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, 'BUT WAIT...', 40, W / 2, 385, ORANGE, 'b')
    T(dl, 'Who does the phone call?', 58, W / 2, 465)
    ph = (540, 598); door = v >= I_DOOR; gw = v >= I_GW
    sy = 1010
    if not door:
        # messy: phone wired straight to every service, tangled
        a = ease_out(prog(v, 0.3, 0.8))
        for i, (name, x, col) in enumerate(SVC):
            for j in range(2):
                pts = []
                for k in range(13):
                    q = k / 12
                    px, py = lerp2((ph[0] + (j - 0.5) * 40, ph[1] + 95), (x, sy - 95), q)
                    px += math.sin(q * 9 + i * 2 + j * 3 + lt * 4) * 40 * math.sin(q * math.pi)
                    pts.append((px, py))
                dl.line(pts[:max(2, int(13 * a))], fill=rgba(CORAL if v >= I_MESSY else INK, 0.55), width=5)
        if v >= I_MESSY:
            m = prog(v, I_MESSY, I_MESSY + 0.3)
            tag_pill(dl, 810, 760, 'messy!', CORAL, size=40 * back(m), fname='black')
    else:
        dp = back(prog(v, I_DOOR, I_DOOR + 0.4))
        wire(dl, (ph[0], ph[1] + 95), (540, 740))
        for name, x, col in SVC: wire(dl, (540, 860), (x, sy - 95))
        if not gw:
            # hotel receptionist at a desk with a bell
            person(dl, 540, 790, 1.5 * dp, GOLD, hat=True)
            card(dl, (540 - 150 * dp, 830 - 10 * dp, 540 + 150 * dp, 830 + 60 * dp), 12, (255, 250, 240), width=5)
            dl.pieslice((620 * dp + 540 * (1 - dp) - 22, 798, 620 * dp + 540 * (1 - dp) + 22, 842), 180, 360, fill=rgba(GOLD), outline=rgba(INK), width=3)
            tag_pill(dl, 810, 740, 'receptionist', INK, size=30, alpha=ease_out(prog(v, I_DOOR + 0.3, I_DOOR + 0.6)))
        else:
            lb_pill(L, G, dl, 540, 825, back(prog(v, I_GW, I_GW + 0.4)), w=480, label='API GATEWAY')
    phone(dl, *ph, 0.7)
    for name, x, col in SVC:
        server(dl, x, sy, 0.8, lt)
        tag_pill(dl, x, sy + 125, name, col, size=28, fname='xb')
    kid(dl, KX, KY, KS, lt, talk(), point=(440, 820) if door else None, mood='shock' if I_MESSY <= v < I_DOOR else 'happy')

def sc_walk(L, G, dl, dg, lt, dur, steps):
    T(dl, 'ORDERING FOOD', 40, W / 2, 385, ORANGE, 'b')
    ga, gb = (GW[0], GW[1] + 52), (GW[0], GW[1] - 52)
    wire(dl, (PH[0], PH[1] + 112), gb)
    for name, x, col in SVC: wire(dl, ga, (x, SY - 90))
    wire(dl, (612, SY + 30), (748, SY + 30), VIOLET, 0.6)
    done = lt >= E_DONE
    phone(dl, *PH, 0.85, 'done' if done else 'order', press=1 - prog(lt, E_TAP, E_TAP + 0.25) if lt >= E_TAP else 0)
    lb_pill(L, G, dl, *GW, back(prog(lt, 0.1, 0.45)), w=480, label='API GATEWAY')
    for i, (name, x, col) in enumerate(SVC):
        hits = [E_ORD + 0.55] if i == 1 else ([E_PAY + 0.55] if i == 2 else [])
        bump = max([0] + [1 - prog(lt, h, h + 0.3) for h in hits if lt >= h])
        server(dl, x, SY - 10 * bump, 0.8 * pop_in(lt, 0.3 + i * 0.1), lt)
        tag_pill(dl, x, SY + 125, name, col, size=28, fname='xb', alpha=ease_out(prog(lt, 0.5, 0.8)))
    # login check
    if E_ASK <= lt < E_ORD + 0.6:
        a = ease_out(prog(lt, E_ASK, E_ASK + 0.3))
        tag_pill(dl, 860, GW[1] - 95, 'logged in?', BLUE, size=30, alpha=a, fname='xb')
        if lt >= E_YES:
            check_mark(dl, 1010, GW[1] - 95, 30, rgba(TEAL), 10, prog(lt, E_YES, E_YES + 0.3))
    if E_PAY + 0.55 <= lt:
        tag_pill(dl, 820, SY + 185, 'paid', TEAL, size=28, fname='xb', alpha=ease_out(prog(lt, E_PAY + 0.55, E_PAY + 0.85)))
    msgfly(dl, (PH[0], PH[1] + 112), gb, lt - E_TOGW)
    msgfly(dl, ga, (540, SY - 90), lt - E_ORD)
    msgfly(dl, (612, SY + 30), (748, SY + 30), lt - E_PAY)
    msgfly(dl, (540, SY - 90), ga, lt - E_BACK, 0.5)
    msgfly(dl, gb, (PH[0], PH[1] + 112), lt - E_BACK - 0.5, 0.5)
    if done:
        result_badge(L, G, dl, 600, 1330, 'order placed', lt - E_DONE, w=560, h=116, size=46)
        burst(dl, dg, 600, 1330, lt - E_DONE - 0.05)
    k, u = step_at(lt, steps)
    tgt = {0: (PH[0] - 90, PH[1]), 1: (GW[0] - 240, GW[1]), 2: (GW[0] - 240, GW[1]), 3: (SVC[0][1], SY)}.get(k)
    kid(dl, KX, KY, KS, lt, talk(), point=tgt, wave=k == 4)

JOBS = [('1', 'Security guard', 'checks who you are', BLUE),
        ('2', 'Traffic cop', 'sends to the right service', ORANGE),
        ('3', 'Bouncer', 'blocks spammers', CORAL)]
def sc_jobs(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, "THE GATEWAY'S JOBS", 40, W / 2, 385, ORANGE, 'b')
    T(dl, '3 hats it wears', 64, W / 2, 465)
    for i, (n, title, sub, col) in enumerate(JOBS):
        p = prog(v, J_T[i], J_T[i] + 0.4)
        if p <= 0: continue
        cy = 640 + i * 205
        off = (1 - ease_out(p)) * 500
        x0, x1 = 120 + off, 1000 + off
        card(dl, (x0, cy - 85, x1, cy + 85), 34, PAPER, alpha=clamp(p * 2))
        dl.ellipse((x0 + 30, cy - 55, x0 + 140, cy + 55), fill=rgba(col), outline=rgba(INK), width=5)
        T(dl, n, 60, x0 + 85, cy + 2, PAPER, 'black')
        T(dl, title, 52, x0 + 175, cy - 26, INK, 'black', anchor='lm')
        T(dl, sub, 32, x0 + 175, cy + 34, SOFT, 'sb', anchor='lm')
    cur = sum(v >= a for a in J_T) - 1
    kid(dl, KX, KY, KS, lt, talk(), point=(300, 640 + 205 * cur) if cur >= 0 else None)

RECAP = [('Microservices = workers', ORANGE), ('Gateway = front door', TEAL)]
def sc_outro(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    if v < O_T[2]:
        T(dl, 'RECAP', 40, W / 2, 385, ORANGE, 'b')
        T(dl, 'Remember this', 64, W / 2, 465)
        for i, (s, col) in enumerate(RECAP):
            p = prog(v, O_T[i], O_T[i] + 0.35)
            if p <= 0: continue
            cy = 660 + i * 190
            sc = back(p)
            card(dl, (130, cy - 70 * sc, 950, cy + 70 * sc), 30, PAPER)
            dl.ellipse((160, cy - 42, 244, cy + 42), fill=rgba(col), outline=rgba(INK), width=5)
            check_mark(dl, 202, cy + 2, 34, rgba(PAPER), 9, prog(v, O_T[i] + 0.1, O_T[i] + 0.4))
            T(dl, s, 48, 280, cy, INK, 'black', anchor='lm', alpha=clamp(p * 2))
        kid(dl, KX, KY, KS, lt, talk())
    else:
        c0 = O_T[2]
        sc = back(prog(v, c0, c0 + 0.4))
        f = F('black', 130)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 130 * sc, x0, 470, INK, anchor='lm')
        gtext(L, G, 'Code', 'black', 130, x0 + wv * sc + wc * sc / 2, 476, scale=sc, glow=False)
        T(dl, 'Tech, explained simply.', 42, W / 2, 590, SOFT, 'm', alpha=ease_out(prog(v, c0 + 0.4, c0 + 0.8)))
        b = prog(v, c0 + 0.6, c0 + 1.0)
        if b > 0:
            s2 = back(b) * (1 + 0.025 * math.sin(lt * 5))
            dl.rounded_rectangle((W / 2 - 280 * s2 + 9, 720 - 60 * s2 + 10, W / 2 + 280 * s2 + 9, 720 + 60 * s2 + 10), radius=60 * s2, fill=rgba(INK, 0.18))
            grad_pill(L, G, W / 2, 720, 560, 120, scale=s2)
            dl.rounded_rectangle((W / 2 - 280 * s2, 720 - 60 * s2, W / 2 + 280 * s2, 720 + 60 * s2), radius=60 * s2, outline=rgba(INK), width=5)
            text(dl, 'vizucode.site', 'xb', 54 * s2, W / 2, 723, INK_ON_GRAD)
        g = ease_out(prog(v, c0 + 1.4, c0 + 1.8))
        if g > 0:
            iy = 860; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(INK, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(INK, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(INK, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, INK, anchor='lm', alpha=g)
        kid(dl, 540, 1080, 0.95 * back(prog(v, c0, c0 + 0.45)), lt, talk(), wave=True)

import re as _re
def caption(dl, tsec):
    cur = [c for c in E.captions if c[0] <= tsec < c[1]]
    if not cur: return
    s0, e, txt = cur[-1]
    p = ease_out(prog(tsec, s0, s0 + 0.12))
    size = 58 * lerp(0.88, 1.0, p)
    f = F('black', size); sp = size * 0.32
    words = txt.upper().split()
    tw = sum(f.getlength(w_) for w_ in words) + sp * (len(words) - 1)
    cy = 1490
    pill(dl, W / 2, cy, tw + 70, size * 1.65, INK, None, alpha=0.92 * p)
    x = W / 2 - tw / 2
    C = E.CFG
    for w_ in words:
        bare = _re.sub(r'[^\w]', '', w_).lower()
        col = PAPER
        if bare in C['CAPTION_TEAL'] or w_.lower() in C['CAPTION_TEAL']: col = TEAL
        elif bare in C['CAPTION_CORAL'] or w_.lower() in C['CAPTION_CORAL']: col = CORAL
        elif _re.fullmatch(r'\d+', bare) or bare in C['CAPTION_GOLD']: col = GOLD
        dl.text((x, cy + 2), w_, font=f, fill=rgba(col, p), anchor='lm')
        x += f.getlength(w_) + sp
E.caption = caption

E.SCENES.update(hook=sc_hook, problem=sc_problem, micro=sc_micro, idea=sc_idea, walk=sc_walk, jobs=sc_jobs, outro=sc_outro)
if __name__ == '__main__':
    E.main()
