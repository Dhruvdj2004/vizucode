"""LeetCode 11 — Container With Most Water (two pointers)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Two Pointers · Medium',
    CODE=[
        'int maxArea(vector<int>& h) {',
        '    int l = 0, r = h.size() - 1, best = 0;',
        '    while (l < r) {',
        '        int area = min(h[l], h[r]) * (r - l);',
        '        best = max(best, area);',
        '        if (h[l] < h[r]) l++;',
        '        else r--;',
        '    }',
        '    return best;',
        '}',
    ],
    CODE_TITLE='C++  ·  two pointers',
    FN={'maxArea', 'size', 'min', 'max'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(1)')],
    CAPTION_GOLD={'one', 'seven', 'eight', 'six', 'five', 'four', 'three', 'twelve', 'thirty', 'twenty', 'area', 'width',
                  'height', 'shorter', 'pointers', 'best', 'left', 'right', 'wall', 'walls'},
    CAPTION_CORAL={'squared'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [1]), (fr('Compute'), [3, 4]), (fr('Then move'), [5, 6])]

H = [1, 8, 6, 2, 8, 3, 7]
N = len(H)
XS = row_x(N, 104, 30)
BASE, UNIT = 1290, 68

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_PICK = 0.2 + vo_at('problem', 'Pick two'); P_AREA = 0.2 + vo_at('problem', 'The water')
sfx.append((ps + P_PICK + 0.3, 'pop')); sfx.append((ps + P_AREA + 0.6, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_PAIRS = 0.2 + vo_at('brute', 'every pair'); B_STAMP = 0.2 + vo_at('brute', "That's O")
for k in range(8): sfx.append((bs + B_PAIRS + k * 0.22, 'tick'))
sfx.append((bs + B_STAMP, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_ENDS = 0.2 + vo_at('idea', 'Start at'); I_MOVE = 0.2 + vo_at('idea', 'always move'); I_WHY = 0.2 + vo_at('idea', 'because')
sfx.append((isd + 0.5, 'pop')); sfx.append((isd + I_ENDS + 0.2, 'pop')); sfx.append((isd + I_MOVE + 0.6, 'whoosh'))
KEYS = [f'w{i}' for i in range(5)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8)
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
# pointer states over time: (time, l, r)
PTR = [(0.0, 0, 6),
       (at(0, 'Move'), 1, 6),
       (at(1, 'Move'), 1, 5),
       (at(2, 'Move'), 1, 4),
       (at(3, 'Move'), 1, 3),
       (WSTEPS[4][0] + 0.3, 1, 2), (WSTEPS[4][0] + 0.7, 1, 1)]
AREA_AT = [at(0, 'Area'), at(1, 'Area'), at(2, 'Area'), at(3, 'Area')]
BEST = [(AREA_AT[0], 6), (AREA_AT[1], 35)]
for tt, *_ in PTR[1:]: sfx.append((ws + tt, 'tick'))
for k, tt in enumerate(AREA_AT): sfx.append((ws + tt, 'ding' if k == 1 else 'pop'))
sfx.append((ws + at(4, 'answer'), 'win'))
E.SPOTS.append((ws + AREA_AT[1] - 0.05, 1.5, (XS[1] + XS[6]) / 2, BASE - 7 * UNIT / 2, 420))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def walls(dl, dg, lt, hl=(), dim=(), reveal=True, base=BASE, unit=UNIT, xs=XS, labels=True):
    dl.line([(60, base), (W - 60, base)], fill=rgba(CELL_LINE), width=4)
    for i, h in enumerate(H):
        p = ease_out(prog(lt, i * 0.06, i * 0.06 + 0.4)) if reveal else 1
        top = base - h * unit * p
        if p <= 0.01: continue
        col = ORANGE if i in hl else ((60, 72, 104) if i in dim else (120, 140, 180))
        fill = tint(col, 0.35 if i in hl else 0.22)
        dl.rounded_rectangle((xs[i] - 36, top, xs[i] + 36, base - 2), radius=12, fill=rgba(fill), outline=rgba(col), width=4)
        if i in hl: dg.rounded_rectangle((xs[i] - 36, top, xs[i] + 36, base - 2), radius=12, outline=rgba(col), width=6)
        if labels: text(dl, str(h), 'b', 40, xs[i], top - 30, GOLD if i in hl else MUTED, alpha=p)

def water(dl, dg, l, r, a=1.0, base=BASE, unit=UNIT, xs=XS, col=BLUE):
    if a <= 0.01 or l >= r: return
    h = min(H[l], H[r]) * unit * a
    x0, x1 = xs[l] + 38, xs[r] - 38
    dl.rectangle((x0, base - h, x1, base - 3), fill=rgba(col, 0.32))
    pts = [(x0 + q * (x1 - x0) / 24, base - h + math.sin(E.NOW * 4 + q * 0.7) * 5) for q in range(25)]
    for D in (dl, dg): D.line(pts, fill=rgba((150, 200, 255), 0.9), width=4)

def ptr_at(lt):
    l = r = 0; prev = (0, 6); tprev = 0
    cur = PTR[0][1:]
    for tt, a, b in PTR:
        if lt >= tt: prev, cur, tprev = cur, (a, b), tt
    f = ease_in_out(prog(lt, tprev, tprev + 0.35))
    return cur, lerp(XS[prev[0]], XS[cur[0]], f), lerp(XS[prev[1]], XS[cur[1]], f)


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'MOST WATER', 'black', 120, W / 2, 450, WHITE)
    gtext(L, G, 'WINS?', 'black', 150, W / 2, 595)
    water(dl, dg, 1, 6, ease_out(prog(lt, 1.4, 2.4)), base=1220, unit=58)
    walls(dl, dg, lt * 1.2, hl=(1, 6) if lt > 1.4 else (), base=1220, unit=58)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1340 + (1 - tg) * 30, 'LeetCode 11 · Container With Most Water', WHITE, 'sb', 32, tg, w=780, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Max water between 2 walls', size=62)
    hl = (2, 6) if lt > P_PICK else ()
    water(dl, dg, 2, 6, ease_out(prog(lt, P_AREA, P_AREA + 0.8)))
    walls(dl, dg, lt, hl=hl)
    a = ease_out(prog(lt, P_AREA + 0.6, P_AREA + 1.0))
    if a > 0:
        rich(dl, [('min(6, 7)', GOLD), (' × ', WHITE), ('width 4', TEAL), (' = ', WHITE), ('24', BLUE)], 640, 'mono', 48, a)
        y = BASE + 40
        for D in (dl, dg): D.line([(XS[2], y), (XS[6], y)], fill=rgba(TEAL, a), width=4)
        text(dl, 'width', 'monor', 28, (XS[2] + XS[6]) / 2, y + 30, TEAL, alpha=a)


PAIRS = [(0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (1, 2), (1, 3)]
def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Try every pair', col=MUTED)
    k = int((lt - B_PAIRS) / 0.22) if lt >= B_PAIRS else -1
    pr = PAIRS[min(k, len(PAIRS) - 1)] if 0 <= k and lt < B_STAMP else None
    if pr: water(dl, dg, pr[0], pr[1], 1.0, col=CORAL)
    walls(dl, dg, lt, hl=pr or (), dim=() if pr is None else [i for i in range(N) if i not in pr])
    if lt < B_STAMP and k >= 0:
        text(dl, f'pairs: {min(k + 1, 8)} ... n²/2', 'monor', 40, W / 2, 620, MUTED)
    big_o_stamp(L, G, dl, lt, B_STAMP, 'O(n²)', cy=640, size=150)


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'TWO POINTERS', 'black', 112, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
    m = ease_in_out(prog(lt, I_MOVE + 0.6, I_MOVE + 1.0))
    lx = lerp(XS[0], XS[1], m)
    walls(dl, dg, lt, hl=(0 if m < 0.5 else 1, 6))
    a = ease_out(prog(lt, I_ENDS, I_ENDS + 0.3))
    for D in (dl, dg):
        arrow_up(D, lx, BASE + 20, TEAL, a); arrow_up(D, XS[6], BASE + 20, CORAL, a)
    text(dl, 'L', 'mono', 38, lx, BASE + 80, TEAL, alpha=a); text(dl, 'R', 'mono', 38, XS[6], BASE + 80, CORAL, alpha=a)
    label_pill(dl, dg, W / 2, 650, 'start wide: both ends', TEAL, size=34, alpha=a * (1 - prog(lt, I_MOVE, I_MOVE + 0.3)), w=500)
    mv = ease_out(prog(lt, I_MOVE, I_MOVE + 0.3))
    label_pill(dl, dg, W / 2, 650, 'move the SHORTER wall', GOLD, size=36, alpha=mv, w=540, glow=True)
    w_ = ease_out(prog(lt, I_WHY, I_WHY + 0.3))
    text(dl, 'the short wall caps the water', 'sb', 40, W / 2, 740, MUTED, alpha=w_)


def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    (l, r), lx, rx = ptr_at(lt)
    if l < r: water(dl, dg, l, r, ease_out(prog(lt, max(tt for tt, *_ in PTR if tt <= lt), max(tt for tt, *_ in PTR if tt <= lt) + 0.5)))
    walls(dl, dg, lt, hl=(l, r))
    for D in (dl, dg):
        arrow_up(D, lx, BASE + 20, TEAL); arrow_up(D, rx, BASE + 20, CORAL)
    text(dl, 'L', 'mono', 38, lx, BASE + 80, TEAL); text(dl, 'R', 'mono', 38, rx, BASE + 80, CORAL)
    best = 0
    for tt, v in BEST:
        if lt >= tt: best = v
    bump = 1 + 0.3 * max([0] + [1 - prog(lt, tt, tt + 0.4) for tt, v in BEST if lt >= tt])
    pill(dl, W / 2, 440, 380, 92, (20, 26, 44), GOLD, width=4)
    text(dl, 'best:', 'xb', 44, W / 2 - 60, 442, WHITE)
    text(dl, str(best), 'black', 60 * bump, W / 2 + 90, 440, GOLD)
    if 0 <= k < 4:
        a = ease_out(prog(lt, AREA_AT[k] - 0.6, AREA_AT[k] - 0.3))
        lk, rk = PTR[k][1], PTR[k][2]
        hh = min(H[lk], H[rk]); wd = rk - lk
        rich(dl, [(f'min({H[lk]}, {H[rk]})', GOLD), (' × ', WHITE), (f'{wd}', TEAL), (' = ', WHITE), (str(hh * wd), BLUE)], 570, 'mono', 52, a)
        if lt > at(k, 'Move'):
            side = 'left' if H[PTR[k][1]] < H[PTR[k][2]] else 'right'
            label_pill(dl, dg, W / 2, 665, f'shorter = {side}: move it', MUTED, size=32, alpha=ease_out(prog(lt, at(k, 'Move'), at(k, 'Move') + 0.3)), w=500)
        if k == 1 and lt > AREA_AT[1]:
            label_pill(dl, dg, W / 2, 665, 'new best!', GOLD, size=36, alpha=ease_out(prog(lt, AREA_AT[1], AREA_AT[1] + 0.3)) * (1 - prog(lt, at(1, 'Move') - 0.3, at(1, 'Move'))), w=300, glow=True)
    if k == 4:
        result_badge(L, G, dl, W / 2, 600, 'max area = 35', lt - at(4, 'answer'), w=600, h=120, size=52)
        burst(dl, dg, W / 2, 600, lt - at(4, 'answer') - 0.1)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
