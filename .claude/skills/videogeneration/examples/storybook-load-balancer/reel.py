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
E.CFG.update(
    HEADER_TAG='System Design · For Beginners',
    CAPTION_GOLD={'server', 'servers', 'load', 'balancer', 'balancers', 'manager', 'round', 'robin', 'counters',
                  'restaurant', 'chintu', 'million', 'fewest', 'closest', 'turns'},
    CAPTION_TEAL={'fast', 'notice.'},
    CAPTION_CORAL={'crashes', 'crashes!', 'down', 'down,', 'slows'},
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

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.7)
sfx.append((0.35, 'pop'))
ps = vo_scene('problem', 'problem', pad=0.8)
P_HANDLE = vo_at('problem', 'handle'); P_MANY = vo_at('problem', 'Too many'); P_CRASH = vo_at('problem', 'crashes') + 0.25
for k in range(14): sfx.append((ps + 0.2 + P_HANDLE + k * (P_MANY + 1.2 - P_HANDLE) / 14, 'tick'))
sfx.append((ps + 0.2 + P_CRASH, 'buzz'))
is_ = vo_scene('idea', 'idea', pad=0.8)
I_THREE = vo_at('idea', 'we open') + 0.6; I_MGR = vo_at('idea', 'manager at'); I_SEND = vo_at('idea', 'sends each'); I_LB = vo_at('idea', 'That manager') + 0.5
for tt in (I_THREE, I_THREE + 0.2, I_MGR): sfx.append((is_ + 0.2 + tt, 'pop'))
sfx.append((is_ + 0.2 + I_LB + 0.4, 'ding'))
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6'], gap=0.4, last_extra=1.6)
S = [s for s, d in WSTEPS]
SX = [260, 540, 820]
PK = [(S[0] + 0.15, 0), (S[1] + 0.05, 1), (S[2] + 0.05, 2), (S[3] + 0.05, 0)]
RR_T = S[3] + vo_at('w3', 'round robin')
CRASH_T = S[4] + vo_at('w4', 'crashes') + 0.1
HC_T = S[5] + 0.3
SEES_T = S[5] + vo_at('w5', 'sees')
SKIP_T = S[5] + vo_at('w5', 'skips')
PK += [(SKIP_T + 0.2, 2), (S[6] + 0.0, 0), (S[6] + 0.35, 2), (S[6] + 0.7, 0), (S[6] + 1.05, 2)]
BADGE_T = S[6] + 1.2
for t0, k in PK: sfx.append((ws + t0 + 0.85, 'pop'))
sfx.append((ws + CRASH_T, 'buzz'))
for k in range(3): sfx.append((ws + HC_T + 0.5 + k * 0.05, 'tick'))
sfx.append((ws + SEES_T, 'tick'))
sfx.append((ws + BADGE_T, 'win'))
as_ = vo_scene('algos', 'algos', pad=0.8)
A_T = [0.4, vo_at('algos', 'Taking turns'), vo_at('algos', 'fewest') - 0.4, vo_at('algos', 'closest') - 0.4]
for tt in A_T[1:]: sfx.append((as_ + 0.2 + tt, 'pop'))
os_ = vo_scene('outro', 'outro', pad=1.8)
O_T = [vo_at('outro', 'spreads'), vo_at('outro', 'stays fast'), vo_at('outro', 'never goes'), vo_at('outro', 'Learn more')]
for tt in O_T[:3]: sfx.append((os_ + 0.2 + tt, 'ding'))
sfx.append((os_ + 0.2 + O_T[3] + 0.4, 'pop'))

E.finish()

# lip-sync: voice loudness per frame
_spf = SR // FPS
AMP = np.zeros(E.NFRAMES + 2, np.float32)
for ts, key in E.vo_events:
    a = VOAUD[key]; f0 = int(ts * FPS)
    for i in range(len(a) // _spf):
        if f0 + i < len(AMP): AMP[f0 + i] = max(AMP[f0 + i], float(np.sqrt(np.mean(a[i * _spf:(i + 1) * _spf] ** 2))))
AMP = np.clip(AMP / max(1e-6, np.percentile(AMP[AMP > 0], 85)), 0, 1)
def talk(): return float(AMP[min(len(AMP) - 1, int(E.NOW * FPS))])

KX, KY, KS = 150, 1245, 0.62   # narrator spot (bottom-left)

# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    T(dl, 'WHAT IS A', 92, W / 2, 410)
    s = 118
    while F('black', s).getlength('LOAD BALANCER?') > 900: s -= 2
    gtext(L, G, 'LOAD BALANCER?', 'black', s, W / 2, 515, glow=False)
    tag_pill(dl, W / 2, 610, 'explained in 60 seconds', SOFT, size=30)
    wave = lt < 2.2
    kid(dl, 540, 880, 1.2, lt, talk(), wave=wave, mood='shock' if 2.6 < lt < 3.6 else 'happy')
    b = prog(lt, 0.15, 0.45)
    if lt < 2.4: bubble(dl, 830, 700, "Hi! I'm Chintu", (690, 790), size=40, sc=back(b))
    crowd_t = 0.3 + vo_at('hook', 'a million')
    for i in range(22):
        row = i % 2
        x = 70 + (i // 2) * 94 + row * 47
        y = 1300 + row * 70
        p = prog(lt, crowd_t + i * 0.04, crowd_t + i * 0.04 + 0.3)
        hop = abs(math.sin(lt * 7 + i)) * 12 * p
        person(dl, x, y - hop, 1.0 * back(p), PEOPLE[i % len(PEOPLE)])

def sc_problem(L, G, dl, dg, lt, dur):
    T(dl, 'THE PROBLEM', 40, W / 2, 385, ORANGE, 'b')
    T(dl, 'One server, too many people', 58, W / 2, 465)
    v = lt - 0.2
    state = 'dead' if v >= P_CRASH else ('busy' if v >= P_MANY else 'ok')
    s = back(prog(lt, 0.2, 0.6)) * 1.45
    cx, cy = 620, 840
    tag_pill(dl, cx, cy - 210, 'server = a computer', SOFT, size=28, alpha=ease_out(prog(v, vo_at('problem', 'called'), vo_at('problem', 'called') + 0.3)) * (1 - prog(v, P_HANDLE + 0.2, P_HANDLE + 0.5)))
    n_people = 14
    span = P_MANY + 1.2 - P_HANDLE
    shown = 0
    for i in range(n_people):
        ang = -math.pi / 2 + (i - (n_people - 1) / 2) * (2 * math.pi / n_people) * 0.98
        x = cx + math.cos(ang) * 340; y = cy + 20 + math.sin(ang) * 290
        t0 = P_HANDLE + i * span / n_people
        p = prog(v, t0, t0 + 0.3)
        if p > 0: shown += 1
        jig = math.sin(lt * 9 + i) * 5 * (1 if state != 'ok' else 0.3)
        person(dl, x + jig, y, 1.05 * back(p), PEOPLE[i % len(PEOPLE)])
        if p > 0.6 and state != 'dead':
            q = ((lt * 1.4 + i * 0.37) % 1)
            ex, ey = lerp2((x, y + 10), (cx, cy), q)
            envelope(dl, ex, ey, 0.55, alpha=0.9 * (1 - q * 0.6))
    server(dl, cx, cy, s, lt, state)
    # load meter
    a = ease_out(prog(v, P_HANDLE - 0.2, P_HANDLE + 0.2))
    if a > 0:
        frac = clamp(shown / n_people) if state != 'dead' else 1.0
        x0, x1, y = 340, 960, 1290
        T(dl, 'LOAD', 30, x0, y - 52, INK, 'b', alpha=a, anchor='lm')
        card(dl, (x0, y - 22, x1, y + 22), 22, PAPER, alpha=a, width=4)
        col = TEAL if frac < 0.45 else (GOLD if frac < 0.8 else CORAL)
        if frac > 0.03:
            dl.rounded_rectangle((x0 + 6, y - 16, x0 + 6 + (x1 - x0 - 12) * frac, y + 16), radius=16, fill=rgba(col, a))
        T(dl, f'{int(frac * 100)}%', 30, x1, y - 52, col, 'black', alpha=a, anchor='rm')
    if state == 'dead':
        c = prog(v, P_CRASH, P_CRASH + 0.3)
        gtext(L, G, 'CRASH!', 'black', 120, cx, 1130, scale=lerp(1.7, 1, ease_out(c)), alpha=clamp(c * 2), glow=False, c1=(255, 110, 100), c2=(230, 40, 80))
    kid(dl, KX, KY, KS, lt, talk(), point=(cx - 100, cy + 100) if state != 'dead' else None, mood='shock' if state == 'dead' else 'happy')

CTRS = [260, 540, 820]
def sc_idea(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, 'THINK OF IT LIKE...', 40, W / 2, 385, ORANGE, 'b')
    T(dl, 'A busy restaurant', 64, W / 2, 465)
    cy = 1030
    # counters
    for k, x in enumerate(CTRS):
        p = 1.0 if k == 1 else prog(v, I_THREE + (k // 2) * 0.2, I_THREE + (k // 2) * 0.2 + 0.35)
        stall(dl, x, cy, 0.95 * back(p))
        if p > 0.5:
            lab = 'server' if v > I_LB + 0.4 else ('cashier' if v < I_THREE and k == 1 else 'counter')
            sc = back(prog(v, I_LB + 0.4, I_LB + 0.7)) if v > I_LB + 0.4 else 1
            tag_pill(dl, x, cy + 115, lab, TEAL if lab == 'server' else INK, size=28 * sc)
    # queue
    sent = int((v - I_SEND) / 0.55) + 1 if v > I_SEND else 0
    waiting = max(3, 8 - sent) if v > I_SEND else 8
    xs = row_x(waiting, 58, 14)
    for i, x in enumerate(xs):
        hop = abs(math.sin(lt * 6 + i)) * 6
        person(dl, x, 600 - hop, 1.05 * pop_in(lt, 0.1 + i * 0.04), PEOPLE[(i + sent) % len(PEOPLE)])
    # one cashier overwhelmed before counters open
    if v < I_THREE:
        T(dl, 'long wait...', 34, 540, 690, CORAL, 'b', alpha=ease_out(prog(v, 0.8, 1.1)))
    # manager
    mp = prog(v, I_MGR, I_MGR + 0.35)
    mx, my = 540, 770
    if mp > 0:
        person(dl, mx, my, 1.6 * back(mp), GOLD, hat=True)
        if v < I_LB:
            tag_pill(dl, mx + 190, my + 20, 'manager', INK, size=30, alpha=ease_out(prog(v, I_MGR + 0.2, I_MGR + 0.5)))
    # customers being sent
    if v > I_SEND:
        for i in range(sent + 1):
            t0 = I_SEND + i * 0.55
            u = v - t0
            if u < 0 or u > 1.0: continue
            k = i % 3
            if u < 0.35: x, y = lerp2((540, 600), (mx + 70, my - 10), ease_in_out(u / 0.35))
            else: x, y = lerp2((mx + 70, my - 10), (CTRS[k], cy - 175), ease_in_out(prog(u, 0.35, 0.85)))
            person(dl, x, y, 1.0, PEOPLE[i % len(PEOPLE)], alpha=1 - prog(u, 0.85, 1.0))
    if v > I_LB:
        lb_pill(L, G, dl, 540, 680, back(prog(v, I_LB, I_LB + 0.4)) * 0.85)
    kid(dl, KX, KY, KS, lt, talk(), point=(mx - 60, my + 30) if I_MGR < v < I_LB + 1.5 else None)

def sc_walk(L, G, dl, dg, lt, dur, steps):
    T(dl, 'HOW IT WORKS', 40, W / 2, 385, ORANGE, 'b')
    for i, x in enumerate(row_x(5, 60, 34)):
        person(dl, x, 470 + math.sin(lt * 5 + i) * 3, 0.95 * pop_in(lt, i * 0.05), PEOPLE[i])
    T(dl, 'users', 28, W / 2 + 230, 495, SOFT, 'b', alpha=ease_out(prog(lt, 0.3, 0.6)), anchor='lm')
    lbx, lby = 540, 640
    sy = 930
    dead = lt >= CRASH_T
    skipped = lt >= SKIP_T
    # wires
    for k, x in enumerate(SX):
        col, a = INK, 0.45
        if k == 1 and skipped: col, a = CORAL, 0.6
        p = ease_out(prog(lt, 0.2, 0.6))
        x2, y2 = lerp2((lbx, lby + 52), (x, sy - 112), p)
        if k == 1 and skipped:
            n = 10
            for j in range(0, n, 2):
                a0 = lerp2((lbx, lby + 52), (x, sy - 112), j / n); a1 = lerp2((lbx, lby + 52), (x, sy - 112), (j + 1) / n)
                dl.line([a0, a1], fill=rgba(col, a), width=6)
            mxp, myp = lerp2((lbx, lby + 52), (x, sy - 112), 0.5)
            cross_mark(dl, mxp, myp, 18, rgba(CORAL), 8, prog(lt, SKIP_T, SKIP_T + 0.3))
        else:
            dl.line([(lbx, lby + 52), (x2, y2)], fill=rgba(col, a), width=6)
    dl.line([(lbx, 525), (lbx, lby - 52)], fill=rgba(INK, 0.45), width=6)
    # servers + counts
    counts = [0, 0, 0]
    for t0, k in PK:
        if lt >= t0 + 0.85: counts[k] += 1
    for k, x in enumerate(SX):
        bump = max([0] + [1 - prog(lt, t0 + 0.85, t0 + 1.15) for t0, kk in PK if kk == k and lt >= t0 + 0.85])
        st = 'dead' if (k == 1 and dead) else 'ok'
        server(dl, x, sy - 8 * bump, 0.95 * pop_in(lt, 0.3 + k * 0.1), lt, st)
        tag_pill(dl, x, sy + 145, f'Server {"ABC"[k]}', CORAL if st == 'dead' else INK, size=28, alpha=ease_out(prog(lt, 0.5, 0.8)))
        if counts[k]:
            T(dl, f'{counts[k]} request' + ('s' if counts[k] > 1 else ''), 26, x, sy + 200, SOFT, 'b')
    lb_pill(L, G, dl, lbx, lby, back(prog(lt, 0.1, 0.45)))
    # packets
    for t0, k in PK:
        u = lt - t0
        if 0 <= u < 0.85:
            if u < 0.35: x, y = lerp2((lbx, 520), (lbx, lby), ease_in_out(u / 0.35))
            else: x, y = lerp2((lbx, lby), (SX[k], sy - 110), ease_in_out(prog(u, 0.35, 0.85)))
            envelope(dl, x, y, 1.0)
    # health check pings
    if HC_T <= lt < HC_T + 1.2:
        for k, x in enumerate(SX):
            u = lt - HC_T
            if k == 1 and u > 0.5: continue
            q = u / 0.5 if u < 0.5 else 1 - (u - 0.5) / 0.5
            px, py = lerp2((lbx, lby + 52), (x, sy - 112), clamp(q))
            dl.ellipse((px - 20, py - 20, px + 20, py + 20), fill=rgba(PAPER), outline=rgba(TEAL), width=5)
            T(dl, '?', 26, px, py, TEAL, 'black')
        tag_pill(dl, 820, 545, 'you OK?', TEAL, size=28)
    for k, x in enumerate(SX):
        if k == 1 and lt >= SEES_T and lt < BADGE_T:
            cross_mark(dl, x + 100, sy - 110, 22, rgba(CORAL), 10, prog(lt, SEES_T, SEES_T + 0.3))
        elif k != 1 and HC_T + 1.0 <= lt < BADGE_T:
            check_mark(dl, x + 100, sy - 110, 34, rgba(TEAL), 10, prog(lt, HC_T + 1.0, HC_T + 1.3))
    # captions of the moment
    yb = 1290
    if RR_T <= lt < CRASH_T:
        tag_pill(dl, 600, yb, 'ROUND ROBIN = take turns', ORANGE, size=34, fname='xb', alpha=ease_out(prog(lt, RR_T, RR_T + 0.3)))
    elif CRASH_T <= lt < HC_T:
        tag_pill(dl, 600, yb, 'Server B is DOWN', CORAL, size=34, fname='xb', alpha=ease_out(prog(lt, CRASH_T, CRASH_T + 0.3)))
    elif HC_T <= lt < BADGE_T:
        tag_pill(dl, 600, yb, 'Health check: skip B', TEAL, size=34, fname='xb', alpha=ease_out(prog(lt, HC_T, HC_T + 0.3)))
    if lt >= BADGE_T:
        result_badge(L, G, dl, 600, yb, 'site still up', lt - BADGE_T, w=560, h=116, size=48)
        burst(dl, dg, 600, yb, lt - BADGE_T - 0.05)
    k, u = step_at(lt, steps)
    tgt = {0: (lbx - 200, lby), 1: (lbx - 200, lby), 2: (SX[0], sy), 3: (SX[0], sy), 4: (SX[0], sy), 5: (lbx - 200, lby)}.get(k)
    kid(dl, KX, KY, KS, lt, talk(), point=tgt if k < 5 else None, wave=k == 6, mood='shock' if CRASH_T <= lt < CRASH_T + 1.2 else 'happy')

CARDS = [('1', 'Take turns', 'A, then B, then C...', ORANGE),
         ('2', 'Least busy', 'server with the fewest users', TEAL),
         ('3', 'Nearest', 'server closest to you', VIOLET)]
def sc_algos(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    T(dl, 'HOW DOES IT CHOOSE?', 40, W / 2, 385, ORANGE, 'b')
    T(dl, '3 simple ways', 64, W / 2, 465)
    for i, (n, title, sub, col) in enumerate(CARDS):
        p = prog(v, A_T[i + 1], A_T[i + 1] + 0.4)
        if p <= 0: continue
        cy = 640 + i * 205
        off = (1 - ease_out(p)) * 500
        x0, x1 = 120 + off, 1000 + off
        card(dl, (x0, cy - 85, x1, cy + 85), 34, PAPER, alpha=clamp(p * 2))
        dl.ellipse((x0 + 30, cy - 55, x0 + 140, cy + 55), fill=rgba(col), outline=rgba(INK), width=5)
        T(dl, n, 60, x0 + 85, cy + 2, PAPER, 'black')
        T(dl, title, 52, x0 + 175, cy - 26, INK, 'black', anchor='lm')
        T(dl, sub, 32, x0 + 175, cy + 34, SOFT, 'sb', anchor='lm')
    kid(dl, KX, KY, KS, lt, talk(), point=(300, 640 + 205 * max(0, sum(v >= a for a in A_T[1:]) - 1)) if v > A_T[1] else None)

RECAP = [('Spreads the traffic', ORANGE), ('Website stays fast', TEAL), ('Never goes down', VIOLET)]
def sc_outro(L, G, dl, dg, lt, dur):
    v = lt - 0.2
    cta = v >= O_T[3]
    if not cta:
        T(dl, 'RECAP', 40, W / 2, 385, ORANGE, 'b')
        T(dl, 'A load balancer...', 64, W / 2, 465)
        for i, (s, col) in enumerate(RECAP):
            p = prog(v, O_T[i], O_T[i] + 0.35)
            if p <= 0: continue
            cy = 640 + i * 175
            sc = back(p)
            card(dl, (170, cy - 65 * sc, 910, cy + 65 * sc), 30, PAPER)
            dl.ellipse((200, cy - 40, 280, cy + 40), fill=rgba(col), outline=rgba(INK), width=5)
            check_mark(dl, 240, cy + 2, 32, rgba(PAPER), 9, prog(v, O_T[i] + 0.1, O_T[i] + 0.4))
            T(dl, s, 50, 315, cy, INK, 'black', anchor='lm', alpha=clamp(p * 2))
        kid(dl, KX, KY, KS, lt, talk())
    else:
        c = prog(v, O_T[3], O_T[3] + 0.4)
        sc = back(c)
        f = F('black', 130)
        wv, wc = f.getlength('Vizu'), f.getlength('Code')
        x0 = W / 2 - (wv + wc) / 2 * sc
        text(dl, 'Vizu', 'black', 130 * sc, x0, 470, INK, anchor='lm')
        gtext(L, G, 'Code', 'black', 130, x0 + wv * sc + wc * sc / 2, 476, scale=sc, glow=False)
        T(dl, 'Tech, explained simply.', 42, W / 2, 590, SOFT, 'm', alpha=ease_out(prog(v, O_T[3] + 0.4, O_T[3] + 0.8)))
        b = prog(v, O_T[3] + 0.6, O_T[3] + 1.0)
        if b > 0:
            s2 = back(b) * (1 + 0.025 * math.sin(lt * 5))
            dl.rounded_rectangle((W / 2 - 280 * s2 + 9, 720 - 60 * s2 + 10, W / 2 + 280 * s2 + 9, 720 + 60 * s2 + 10), radius=60 * s2, fill=rgba(INK, 0.18))
            grad_pill(L, G, W / 2, 720, 560, 120, scale=s2)
            dl.rounded_rectangle((W / 2 - 280 * s2, 720 - 60 * s2, W / 2 + 280 * s2, 720 + 60 * s2), radius=60 * s2, outline=rgba(INK), width=5)
            text(dl, 'vizucode.site', 'xb', 54 * s2, W / 2, 723, INK_ON_GRAD)
        g = ease_out(prog(v, O_T[3] + 1.4, O_T[3] + 1.8))
        if g > 0:
            iy = 860; ix = W / 2 - 230
            dl.rounded_rectangle((ix - 26, iy - 26, ix + 26, iy + 26), radius=14, outline=rgba(INK, g), width=5)
            dl.ellipse((ix - 12, iy - 12, ix + 12, iy + 12), outline=rgba(INK, g), width=5)
            dl.ellipse((ix + 12, iy - 18, ix + 18, iy - 12), fill=rgba(INK, g))
            text(dl, 'Follow @vizucode26', 'b', 46, ix + 50, iy + 2, INK, anchor='lm', alpha=g)
        kid(dl, 540, 1080, 0.95 * back(prog(v, O_T[3], O_T[3] + 0.45)), lt, talk(), wave=True)

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

E.SCENES.update(hook=sc_hook, problem=sc_problem, idea=sc_idea, walk=sc_walk, algos=sc_algos, outro=sc_outro)
if __name__ == '__main__':
    E.main()
