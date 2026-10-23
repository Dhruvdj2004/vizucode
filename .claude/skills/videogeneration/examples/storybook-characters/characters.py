"""Storybook cast for VizuCode concept videos: Chintu (naughty, always-hungry kid) and Meera (calm, smart explainer).

Import after the engine (the engine must already be importable):

    sys.path.insert(0, os.path.join(K, 'scripts'));                         import engine as E
    sys.path.insert(0, os.path.join(K, 'examples', 'storybook-characters')); from characters import chintu, meera, Cast

Both characters share one rig, so they always match in proportions and line weight:
    (cx, cy) = head centre, s = scale (head radius = 110*s). The full figure spans about
    cy - 155*s (hair tuft) .. cy + 360*s (shoes); arms reach ~150*s sideways.

Common keyword arguments (all optional):
    talk   0..1   mouth opening (drive it with Cast.talk(name) = voice amplitude)
    wave   bool   right hand waves
    point  (x,y)  points at a spot (uses the hand on that side)
    mood   'happy' | 'shock' | 'think' | 'sad' | 'laugh'
    look   (dx,dy) pupils offset, each -1..1 (e.g. (1, 0) looks right)
    nod    0..1   listener nod (head dips rhythmically)
    bounce 0..1   speaker bounce (whole body hops slightly)
    walk   None | phase in seconds (legs swing + body bob while walking)
    alpha  0..1   fade the whole character
"""
import math

import engine as E
from engine import rgba, text, F, ORANGE, TEAL, VIOLET, CORAL

INK = (44, 38, 78)            # outline colour shared by every storybook drawing
PAPER = (255, 255, 255)
MOUTH = (120, 30, 45)
TONGUE = (255, 130, 140)
BLUSH = (255, 140, 150)

CHINTU = dict(skin=(255, 208, 168), hair=(52, 34, 30), shirt=(255, 140, 66), shorts=(70, 86, 140), shoes=INK)
MEERA = dict(skin=(240, 188, 150), hair=(34, 26, 44), shirt=(132, 104, 232), skirt=(40, 170, 156), shoes=(40, 170, 156),
             clip=(45, 212, 191))
CHINTU_COL = ORANGE           # caption / name-tag colour per speaker
MEERA_COL = TEAL


# ---------------- shared rig ----------------
def _lw(s, k=6):
    return max(2, int(k * s))


def _rig(cy, s, t, nod, bounce, walk):
    """Vertical offsets: (body dy, extra head dy)."""
    dy = math.sin(t * 3.2) * 5 * s                                   # idle breathing
    dy -= bounce * abs(math.sin(t * 7.5)) * 12 * s                   # speaker hop
    if walk is not None:
        dy -= abs(math.sin(walk * 9)) * 9 * s
    head = nod * max(0.0, math.sin(t * 5.0)) * 11 * s                # listener nod
    return cy + dy, head


def _arm(dl, sx, sy, ang, ln, s, skin, sleeve, a):
    ink = rgba(INK, a)
    ex, ey = sx + math.cos(ang) * ln, sy + math.sin(ang) * ln
    mx, my = sx + math.cos(ang) * ln * 0.45, sy + math.sin(ang) * ln * 0.45
    dl.line([(sx, sy), (ex, ey)], fill=ink, width=int(40 * s))
    dl.line([(sx, sy), (ex, ey)], fill=rgba(skin, a), width=int(28 * s))
    dl.line([(sx, sy), (mx, my)], fill=rgba(sleeve, a), width=int(30 * s))
    r = 22 * s
    dl.ellipse((ex - r, ey - r, ex + r, ey + r), fill=rgba(skin, a), outline=ink, width=_lw(s))


def _arms(dl, cx, by0, s, t, wave, point, skin, sleeve, a):
    shL = (cx - 82 * s, by0 + 45 * s); shR = (cx + 82 * s, by0 + 45 * s)
    angL, lnL = math.pi * 0.58, 125 * s
    angR, lnR = math.pi * 0.42, 125 * s
    if point is not None and point[0] < cx:
        angL = math.atan2(point[1] - shL[1], point[0] - shL[0]); lnL = 150 * s
    elif point is not None:
        angR = math.atan2(point[1] - shR[1], point[0] - shR[0]); lnR = 150 * s
    if wave:
        angR = -math.pi * 0.32 + 0.38 * math.sin(t * 9); lnR = 150 * s
    _arm(dl, *shL, angL, lnL, s, skin, sleeve, a)
    _arm(dl, *shR, angR, lnR, s, skin, sleeve, a)


def _legs(dl, cx, by1, s, walk, skin, shoes, a, top=None):
    """Two stubby legs + shoes under the body. top = colour of shorts/skirt band (drawn by caller)."""
    ink = rgba(INK, a)
    for sx in (-1, 1):
        sw = math.sin(walk * 9) * sx * 16 * s if walk is not None else 0
        x0 = cx + sx * 42 * s
        dl.line([(x0, by1 - 20 * s), (x0 + sw, by1 + 46 * s)], fill=ink, width=int(36 * s))
        dl.line([(x0, by1 - 20 * s), (x0 + sw, by1 + 46 * s)], fill=rgba(skin, a), width=int(24 * s))
        fx, fy = x0 + sw + sx * 8 * s, by1 + 54 * s
        dl.rounded_rectangle((fx - 30 * s, fy - 15 * s, fx + 30 * s, fy + 15 * s), radius=14 * s,
                             fill=rgba(shoes, a), outline=ink, width=_lw(s, 5))


def _eyes(dl, cx, cy, R, s, t, mood, look, lashes, a, blink_phase=0.0):
    ink = rgba(INK, a)
    blink = 0.12 if ((t + 1.5 + blink_phase) % 3.1) < 0.12 else 1.0
    shock = mood == 'shock'
    lx, ly = look
    if mood == 'think':
        lx, ly = (lx or 0.6), -0.7
    for sx in (-1, 1):
        ex, ey = cx + sx * 0.38 * R, cy + 0.12 * R
        if mood == 'laugh':     # happy closed eyes: ^ ^
            dl.arc((ex - 0.16 * R, ey - 0.08 * R, ex + 0.16 * R, ey + 0.2 * R), 200, 340, fill=ink, width=_lw(s, 7))
        else:
            rx, ry = 0.17 * R, 0.21 * R * blink * (1.15 if shock else 1)
            dl.ellipse((ex - rx, ey - ry, ex + rx, ey + ry), fill=rgba(PAPER, a), outline=ink, width=_lw(s, 4))
            if blink > 0.5:
                pr = 0.1 * R * (0.8 if shock else 1)
                px, py = ex + 0.03 * R + lx * 0.06 * R, ey + 0.03 * R + ly * 0.08 * R
                dl.ellipse((px - pr, py - pr, px + pr, py + pr), fill=ink)
                dl.ellipse((px - pr * 0.2, py - pr * 0.75, px + pr * 0.35, py - pr * 0.2), fill=rgba(PAPER, a))
            if lashes and blink > 0.5:   # two little lashes at the outer corner
                ox = ex + sx * rx * 0.75
                for k in (0, 1):
                    y0 = ey - ry * (0.75 - 0.35 * k)
                    dl.line([(ox, y0), (ox + sx * 0.11 * R, y0 - 0.07 * R + k * 0.04 * R)], fill=ink, width=_lw(s, 4))
        # eyebrows
        by = cy - (0.2 if shock else 0.1) * R
        if mood == 'sad':
            dl.line([(ex - 0.15 * R, by - sx * 0.05 * R), (ex + 0.15 * R, by + sx * 0.05 * R)], fill=ink, width=_lw(s, 7))
        elif mood == 'think' and sx == 1:
            dl.line([(ex - 0.15 * R, by - 0.08 * R), (ex + 0.15 * R, by - 0.14 * R)], fill=ink, width=_lw(s, 7))
        else:
            dl.line([(ex - 0.15 * R, by), (ex + 0.15 * R, by - (0.04 * R if not shock else 0))], fill=ink, width=_lw(s, 7))
    for sx in (-1, 1):
        chx, chy = cx + sx * 0.62 * R, cy + 0.45 * R
        dl.ellipse((chx - 0.14 * R, chy - 0.08 * R, chx + 0.14 * R, chy + 0.08 * R), fill=BLUSH + (int(120 * a),))


def _mouth(dl, cx, cy, R, s, talk, mood, a):
    ink = rgba(INK, a); w = _lw(s, 4)
    mx, my = cx, cy + 0.56 * R
    if mood == 'shock':
        dl.ellipse((mx - 0.12 * R, my - 0.13 * R, mx + 0.12 * R, my + 0.15 * R), fill=rgba(MOUTH, a), outline=ink, width=w)
    elif talk > 0.08:
        hgt = 0.05 * R + 0.25 * R * min(1.0, talk)
        dl.ellipse((mx - 0.18 * R, my - hgt / 2, mx + 0.18 * R, my + hgt / 2), fill=rgba(MOUTH, a), outline=ink, width=w)
        if hgt > 0.12 * R:
            dl.ellipse((mx - 0.09 * R, my + hgt / 2 - 0.09 * R, mx + 0.09 * R, my + hgt / 2 - 0.01 * R), fill=rgba(TONGUE, a))
    elif mood == 'sad':
        dl.arc((mx - 0.16 * R, my, mx + 0.16 * R, my + 0.2 * R), 200, 340, fill=ink, width=_lw(s, 6))
    elif mood == 'think':
        dl.line([(mx - 0.1 * R, my + 0.03 * R), (mx + 0.12 * R, my - 0.01 * R)], fill=ink, width=_lw(s, 6))
    elif mood == 'laugh':
        dl.chord((mx - 0.24 * R, my - 0.16 * R, mx + 0.24 * R, my + 0.2 * R), 0, 180, fill=rgba(MOUTH, a), outline=ink, width=w)
        dl.ellipse((mx - 0.1 * R, my + 0.04 * R, mx + 0.1 * R, my + 0.16 * R), fill=rgba(TONGUE, a))
    else:
        dl.chord((mx - 0.2 * R, my - 0.14 * R, mx + 0.2 * R, my + 0.14 * R), 0, 180, fill=rgba(MOUTH, a), outline=ink, width=w)


# ---------------- Chintu ----------------
def chintu(dl, cx, cy, s, t, talk=0.0, wave=False, point=None, mood='happy', look=(0, 0), nod=0.0, bounce=0.0,
           walk=None, alpha=1.0):
    """Chintu: naughty, funny, always-hungry boy in an orange </> t-shirt (the VizuCode kid mascot)."""
    if s <= 0.02 or alpha <= 0.01: return
    P = CHINTU; a = alpha
    R = 110 * s
    cy, hd = _rig(cy, s, t, nod, bounce, walk)
    ink, skin, wl = rgba(INK, a), rgba(P['skin'], a), _lw(s)
    by0 = cy + R * 0.8; by1 = by0 + 210 * s
    _legs(dl, cx, by1, s, walk, P['skin'], P['shoes'], a)
    _arms(dl, cx, by0, s, t, wave, point, P['skin'], P['shirt'], a)
    # body: shorts band at the bottom of the t-shirt
    dl.rounded_rectangle((cx - 100 * s, by0, cx + 100 * s, by1), radius=70 * s, fill=rgba(P['shorts'], a), outline=ink, width=wl)
    dl.rounded_rectangle((cx - 100 * s, by0, cx + 100 * s, by1 - 40 * s), radius=70 * s, fill=rgba(P['shirt'], a), outline=ink, width=wl)
    dl.pieslice((cx - 34 * s, by0 - 30 * s, cx + 34 * s, by0 + 30 * s), 0, 180, fill=skin, outline=ink, width=wl)
    text(dl, '</>', 'mono', 46 * s, cx, by0 + 90 * s, PAPER, alpha=a)
    cy += hd
    for sx in (-1, 1):   # ears
        ex = cx + sx * R * 0.96
        dl.ellipse((ex - 24 * s, cy - 8 * s, ex + 24 * s, cy + 40 * s), fill=skin, outline=ink, width=wl)
    dl.ellipse((cx - R, cy - R, cx + R, cy + R), fill=skin, outline=ink, width=wl)
    # spiky hair cap + fringe + tuft
    hair = rgba(P['hair'], a)
    dl.chord((cx - 1.04 * R, cy - 1.12 * R, cx + 1.04 * R, cy + 0.42 * R), 180, 360, fill=hair, outline=ink, width=wl)
    hy = cy - 0.35 * R
    pts = [(cx - 1.0 * R, hy)]
    for i in range(6):
        x0 = cx - 0.9 * R + i * 0.32 * R
        pts += [(x0 + 0.16 * R, hy + (0.26 if i % 2 else 0.2) * R), (x0 + 0.32 * R, hy)]
    pts += [(cx + 1.0 * R, hy), (cx, hy - 0.2 * R)]
    dl.polygon(pts, fill=hair)
    dl.polygon([(cx - 0.12 * R, cy - 1.05 * R), (cx + 0.05 * R, cy - 1.38 * R), (cx + 0.2 * R, cy - 1.02 * R)], fill=hair, outline=ink)
    _eyes(dl, cx, cy, R, s, t, mood, look, False, a)
    _mouth(dl, cx, cy, R, s, talk, mood, a)


# ---------------- Meera ----------------
def meera(dl, cx, cy, s, t, talk=0.0, wave=False, point=None, mood='happy', look=(0, 0), nod=0.0, bounce=0.0,
          walk=None, alpha=1.0):
    """Meera: calm, smart girl — dark hair in two short pigtails with teal clips, violet top with a { } mark,
    teal skirt and shoes. Same rig as chintu()."""
    if s <= 0.02 or alpha <= 0.01: return
    P = MEERA; a = alpha
    R = 110 * s
    cy, hd = _rig(cy, s, t + 0.7, nod, bounce, walk)
    ink, skin, wl = rgba(INK, a), rgba(P['skin'], a), _lw(s)
    hair = rgba(P['hair'], a)
    by0 = cy + R * 0.8; by1 = by0 + 210 * s
    _legs(dl, cx, by1, s, walk, P['skin'], P['shoes'], a)
    _arms(dl, cx, by0, s, t, wave, point, P['skin'], P['shirt'], a)
    # body: violet top over a flared teal skirt
    dl.polygon([(cx - 92 * s, by1 - 80 * s), (cx + 92 * s, by1 - 80 * s), (cx + 122 * s, by1 + 4 * s), (cx - 122 * s, by1 + 4 * s)],
               fill=rgba(P['skirt'], a), outline=ink)
    dl.line([(cx - 92 * s, by1 - 80 * s), (cx - 122 * s, by1 + 4 * s), (cx + 122 * s, by1 + 4 * s), (cx + 92 * s, by1 - 80 * s)],
            fill=ink, width=wl, joint='curve')
    for k in (-1, 0, 1):   # skirt pleats
        dl.line([(cx + k * 40 * s, by1 - 60 * s), (cx + k * 52 * s, by1)], fill=rgba(INK, 0.35 * a), width=_lw(s, 3))
    dl.rounded_rectangle((cx - 96 * s, by0, cx + 96 * s, by1 - 56 * s), radius=64 * s, fill=rgba(P['shirt'], a), outline=ink, width=wl)
    # collar
    dl.pieslice((cx - 34 * s, by0 - 30 * s, cx + 34 * s, by0 + 30 * s), 0, 180, fill=skin, outline=ink, width=wl)
    for sx in (-1, 1):
        dl.polygon([(cx + sx * 6 * s, by0 + 22 * s), (cx + sx * 44 * s, by0 + 4 * s), (cx + sx * 34 * s, by0 + 40 * s)],
                   fill=rgba(PAPER, a), outline=ink)
    text(dl, '{ }', 'mono', 40 * s, cx, by0 + 92 * s, PAPER, alpha=a)
    cy += hd
    # hair behind the head: back panel + two short pigtails with teal clips
    dl.rounded_rectangle((cx - 1.08 * R, cy - 0.9 * R, cx + 1.08 * R, cy + 0.55 * R), radius=0.6 * R, fill=hair, outline=ink, width=wl)
    tails = []
    for sx in (-1, 1):
        px, py = cx + sx * 1.2 * R, cy + 0.5 * R
        sw = math.sin(t * 3.2 + sx) * 0.05 * R
        tail = [(px - sx * 0.18 * R, py - 0.24 * R), (px + sx * 0.2 * R + sw, py - 0.14 * R),
                (px + sx * 0.17 * R + sw, py + 0.38 * R), (px - sx * 0.08 * R + sw, py + 0.46 * R)]
        dl.polygon(tail, fill=hair)
        dl.line(tail + tail[:1], fill=ink, width=wl, joint='curve')
        tails.append((cx + sx * 1.06 * R, py - 0.18 * R))
    for sx in (-1, 1):   # ears peek out
        ex = cx + sx * R * 0.95
        dl.ellipse((ex - 22 * s, cy - 4 * s, ex + 22 * s, cy + 38 * s), fill=skin, outline=ink, width=wl)
    dl.ellipse((cx - R, cy - R, cx + R, cy + R), fill=skin, outline=ink, width=wl)
    for tx, ty in tails:   # teal clips where the pigtails start
        dl.rounded_rectangle((tx - 0.11 * R, ty - 0.13 * R, tx + 0.11 * R, ty + 0.13 * R), radius=0.06 * R,
                             fill=rgba(P['clip'], a), outline=ink, width=_lw(s, 4))
    # hair cap + side-swept fringe
    dl.chord((cx - 1.05 * R, cy - 1.1 * R, cx + 1.05 * R, cy + 0.36 * R), 180, 360, fill=hair, outline=ink, width=wl)
    hy = cy - 0.37 * R
    fr = [(cx - 1.02 * R, hy + 0.05 * R), (cx - 0.7 * R, hy + 0.28 * R), (cx - 0.35 * R, hy + 0.2 * R),
          (cx - 0.05 * R, hy + 0.06 * R), (cx + 0.3 * R, hy + 0.12 * R), (cx + 0.7 * R, hy + 0.04 * R),
          (cx + 1.02 * R, hy - 0.02 * R), (cx + 0.6 * R, hy - 0.4 * R), (cx - 0.6 * R, hy - 0.4 * R)]
    dl.polygon(fr, fill=hair)
    dl.line(fr[:7], fill=ink, width=_lw(s, 4), joint='curve')
    # a tiny teal clip on the fringe
    dl.rounded_rectangle((cx + 0.35 * R, hy - 0.06 * R, cx + 0.62 * R, hy + 0.06 * R), radius=0.05 * R,
                         fill=rgba(P['clip'], a), outline=ink, width=_lw(s, 3))
    _eyes(dl, cx, cy, R, s, t, mood, look, True, a, blink_phase=1.3)
    _mouth(dl, cx, cy, R, s, talk, mood, a)


DRAW = {'chintu': chintu, 'meera': meera}


# ---------------- who is talking ----------------
class Cast:
    """Per-speaker mouth amplitude from the voiceover. Build it after E.finish():

        cast = Cast(('chintu', 'meera'))
        cast.talk('meera')        -> 0..1 mouth opening at the current frame (E.NOW)
        cast.speaker()            -> 'chintu' | 'meera' | None  (whose VO line is playing)
        cast.draw('chintu', dl, cx, cy, s, **kw)   -> draws with talk/bounce/nod filled in automatically

    A VO key belongs to the speaker whose name it starts with (chintu_hook, meera_3, ...)."""

    def __init__(self, names=('chintu', 'meera')):
        import numpy as np
        self.names = names
        spf = E.SR // E.FPS
        self.amp, self.lines = {}, []
        for n in names:
            amp = np.zeros(E.NFRAMES + 2, np.float32)
            for ts, key in E.vo_events:
                if not key.startswith(n): continue
                a = E.VOAUD[key]; f0 = int(ts * E.FPS)
                for i in range(len(a) // spf):
                    if 0 <= f0 + i < len(amp):
                        amp[f0 + i] = max(amp[f0 + i], float(np.sqrt(np.mean(a[i * spf:(i + 1) * spf] ** 2))))
            nz = amp[amp > 0]
            self.amp[n] = np.clip(amp / max(1e-6, np.percentile(nz, 85) if len(nz) else 1), 0, 1)
        for ts, key in E.vo_events:
            who = next((n for n in names if key.startswith(n)), None)
            self.lines.append((ts, ts + E.VODUR[key], who, key))

    def talk(self, name, t=None):
        t = E.NOW if t is None else t
        a = self.amp[name]
        return float(a[min(len(a) - 1, max(0, int(t * E.FPS)))])

    def speaker(self, t=None):
        t = E.NOW if t is None else t
        for st, en, who, key in self.lines:
            if st - 0.05 <= t < en - 0.35: return who
        return None

    def draw(self, name, dl, cx, cy, s, **kw):
        t = E.NOW
        who = self.speaker(t)
        kw.setdefault('talk', self.talk(name, t))
        kw.setdefault('bounce', 0.6 if who == name else 0.0)
        kw.setdefault('nod', 0.7 if who is not None and who != name else 0.0)
        DRAW[name](dl, cx, cy, s, t, **kw)
