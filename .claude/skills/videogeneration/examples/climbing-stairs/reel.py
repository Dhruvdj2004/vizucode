"""LeetCode 70 — Climbing Stairs (dynamic programming)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Dynamic Programming · Easy',
    CODE=[
        'int climbStairs(int n) {',
        '    if (n <= 2) return n;',
        '    int prev2 = 1, prev1 = 2;',
        '    for (int i = 3; i <= n; i++) {',
        '        int cur = prev1 + prev2;',
        '        prev2 = prev1;',
        '        prev1 = cur;',
        '    }',
        '    return prev1;',
        '}',
    ],
    CODE_MARKS=[(0.0, [2]), (0.3, [3, 4]), (0.77, [5, 6])],
    FN={'climbStairs'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(1)')],
    CAPTION_GOLD={'step', 'steps', 'ways', 'one', 'two', 'three', 'five', 'eight', 'fibonacci', 'n'},
)
WAYS = [1, 2, 3, 5, 8]

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.6)
for k in range(4): sfx.append((1.0 + k * 0.55, 'tick'))
vo_scene('problem', 'problem', pad=0.7)
bs = vo_scene('brute', 'brute', pad=0.8)
for k in range(4): sfx.append((bs + 0.5 + k * 0.5, 'tick'))
sfx.append((bs + 2.9, 'ding')); sfx.append((bs + 5.3, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.7)
sfx.append((isd + 5.0, 'pop'))
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2', 'w3'], gap=0.5, last_extra=1.8)
VAL_AT = {0: 0.3, 1: 1.4, 2: 1.35, 3: 1.4, 4: 1.45}   # cell index -> u when its value appears (cell 0,1 in step 0)
for i in range(5):
    k = max(0, i - 1)
    sfx.append((ws + WSTEPS[k][0] + VAL_AT[i], 'pop'))
sfx.append((ws + WSTEPS[3][0] + 1.9, 'win'))
vo_scene('code', 'code', pad=0.8)
os_ = vo_scene('outro', 'outro', pad=1.6)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- staircase widget ----------------
def stairs(dl, dg, x0, base, sw, sh, n=5, s=1.0, hl=None, done=(), alpha=1.0, labels=True):
    """Blocks rising left→right. Returns list of (cx, top_y) per step 1..n (index 0 = ground)."""
    tops = [(x0 - sw / 2, base)]
    for i in range(1, n + 1):
        pi = pop_in(s, (i - 1) * 0.12, (i - 1) * 0.12 + 0.4) if s < 5 else 1
        x1 = x0 + (i - 1) * sw
        top = base - i * sh
        tops.append((x1 + sw / 2, top))
        if pi <= 0.02: continue
        h = (base - top) * pi
        col = ORANGE if hl == i else (TEAL if i in done else CELL_LINE)
        fill = (44, 32, 26) if hl == i else ((16, 36, 40) if i in done else CELL)
        dl.rectangle((x1 + 3, base - h, x1 + sw - 3, base), fill=rgba(fill, alpha), outline=rgba(col, alpha), width=4)
        if hl == i: dg.rectangle((x1 + 3, base - h, x1 + sw - 3, base), outline=rgba(col, alpha), width=5)
        if labels: text(dl, str(i), 'mono', min(40, sw * 0.32), x1 + sw / 2, base - h + 34, col if hl == i or i in done else MUTED, alpha=alpha * pi)
    dl.line([(x0 - sw, base), (x0 + n * sw + 10, base)], fill=rgba(CELL_LINE, alpha), width=4)
    return tops

def ball(dl, dg, x, y, r=26, col=GOLD):
    for D in (dl, dg): D.ellipse((x - r, y - r, x + r, y + r), fill=rgba(col))

def hop_pos(tops, path, tt, per=0.55):
    """Ball position hopping along path (list of step indices) — tt seconds since start."""
    k = int(tt // per); f = (tt % per) / per
    if k >= len(path) - 1: x, y = tops[path[-1]]; return x, y - 30
    (x1, y1), (x2, y2) = tops[path[k]], tops[path[k + 1]]
    e = ease_in_out(f)
    return lerp(x1, x2, e), lerp(y1, y2, e) - 30 - math.sin(f * math.pi) * (90 + 40 * (path[k + 1] - path[k]))


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'HOW MANY WAYS', 'black', 98, W / 2, 450, WHITE)
    gtext(L, G, 'TO THE TOP?', 'black', 120, W / 2, 575)
    tops = stairs(dl, dg, 230, 1260, 150, 80, s=lt * 1.6)
    if lt > 0.9:
        x, y = hop_pos(tops, [0, 1, 3, 4, 5], (lt - 0.9) % 3.2)
        ball(dl, dg, x, y)
    tg = ease_out(prog(lt, 2.6, 3.1))
    label_pill(dl, dg, W / 2, 1360 + (1 - tg) * 30, 'LeetCode 70 · Climbing Stairs', WHITE, 'sb', 34, tg, w=660, fill=(24, 31, 52))

def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'n stairs. Each move:')
    a = ease_out(prog(lt, 0.8, 1.2))
    label_pill(dl, dg, W / 2 - 170, 640, '+1 step', TEAL, size=44, alpha=a, w=280, glow=True)
    label_pill(dl, dg, W / 2 + 170, 640, '+2 steps', VIOLET, size=44, alpha=a, w=300, glow=True)
    text(dl, 'n = 5, some ways:', 'sb', 44, W / 2, 790, MUTED, alpha=ease_out(prog(lt, 1.8, 2.2)))
    paths = [('1+1+1+1+1', 2.2), ('1+2+2', 2.7), ('2+1+2', 3.2), ('2+2+1', 3.7)]
    for i, (p, t0) in enumerate(paths):
        e = ease_out(prog(lt, t0, t0 + 0.35))
        cx = W / 2 + (-1 if i % 2 == 0 else 1) * 215; cy = 900 + (i // 2) * 120
        label_pill(dl, dg, cx, cy + (1 - e) * 20, p, GOLD, size=40, alpha=e, w=390)
    q = prog(lt, 4.3, 4.7)
    if q > 0: gtext(L, G, '... how many?', 'black', 76, W / 2, 1180, scale=back(q), alpha=clamp(q * 2))

TREE = {  # id: (label, level, x, parent)
    'a': ('f(5)', 0, 540, None),
    'b': ('f(4)', 1, 300, 'a'), 'c': ('f(3)', 1, 780, 'a'),
    'd': ('f(3)', 2, 170, 'b'), 'e': ('f(2)', 2, 430, 'b'), 'f': ('f(2)', 2, 680, 'c'), 'g': ('f(1)', 2, 900, 'c'),
    'h': ('f(2)', 3, 100, 'd'), 'i': ('f(1)', 3, 240, 'd'),
}
DUPES = {'c', 'd', 'e', 'f', 'h'}
def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Recursion tree', col=MUTED)
    ly = [600, 750, 900, 1050]
    dup_on = lt > 2.9
    for k, (lab, lv, x, par) in TREE.items():
        p = prog(lt, 0.5 + lv * 0.5, 0.85 + lv * 0.5)
        if p <= 0: continue
        if par:
            px, py = TREE[par][2], ly[TREE[par][1]]
            dl.line([(px, py + 40), (lerp(px, x, p), lerp(py + 40, ly[lv] - 40, p))], fill=rgba(CELL_LINE), width=4)
    for k, (lab, lv, x, par) in TREE.items():
        s = pop_in(lt, 0.5 + lv * 0.5)
        st = 'found' if dup_on and k in DUPES and lab in ('f(3)', 'f(2)') else 'idle'
        pulse = 1 + (0.05 * math.sin(lt * 9) if st == 'found' and lt < 4.5 else 0)
        cell(dl, dg, x, ly[lv], 120, lab, st, s * pulse, font='mono', h=80)
    label_pill(dl, dg, W / 2, 1160, 'same work, again & again', CORAL, size=36, alpha=ease_out(prog(lt, 3.1, 3.5)), w=560)
    big_o_stamp(L, G, dl, lt, 5.2, 'O(2', sup='n', cy=1300, size=130)

def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'KEY INSIGHT', 'Your last move was...')
    base = 1080; sw = 200; sh = 110; x0 = 340
    a = prog(lt, 0.5, 1.2)
    tops = []
    for j, (lab, col) in enumerate([('i−2', VIOLET), ('i−1', TEAL), ('i', ORANGE)]):
        pi = back(prog(a, j * 0.25, j * 0.25 + 0.5))
        if pi <= 0.02: tops.append(None); continue
        x1 = x0 + j * sw - sw / 2; top = base - (j + 1) * sh
        h = (base - top) * pi
        dl.rectangle((x1 + 3, base - h, x1 + sw - 3, base), fill=rgba(tint(col, 0.15)), outline=rgba(col), width=4)
        text(dl, lab, 'mono', 44, x1 + sw / 2, base - h + 40, col)
        tops.append((x1 + sw / 2, top))
    if None not in tops:
        p1 = ease_out(prog(lt, 1.8, 2.3)); p2 = ease_out(prog(lt, 2.9, 3.4))
        (xa, ya), (xb, yb), (xc, yc) = tops
        if p1 > 0:
            label_pill(dl, dg, xb - 20, yb - 140, '+1', TEAL, size=40, alpha=p1, w=120)
            for D in (dl, dg): arrow_line(D, xb + 20, yb - 30, xc - 40, yc - 30, TEAL, 7, p=p1)
        if p2 > 0:
            label_pill(dl, dg, xa - 10, ya - 230, '+2', VIOLET, size=40, alpha=p2, w=120)
            box = (xa, yc - 230, xc, ya + 150)
            for D in (dl, dg): D.arc(box, 200, 200 + 140 * p2, fill=rgba(VIOLET), width=7)
    f = ease_out(prog(lt, 4.9, 5.3))
    if f > 0:
        rich(dl, [('ways(i) = ', WHITE), ('ways(i−1)', TEAL), (' + ', WHITE), ('ways(i−2)', VIOLET)], 1210, 'mono', 46, f)
        pill(dg, W / 2, 1210, 900, 100, None, ORANGE, alpha=f * 0.6, width=4)
        pill(dl, W / 2, 1210, 900, 100, None, ORANGE, alpha=f, width=4)

def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'FILL THE DP TABLE')
    k, u = step_at(lt, steps)
    xs = row_x(5, 150, 24); cy = 680
    def shown(i):
        kk = max(0, i - 1)
        return k > kk or (k == kk and u >= VAL_AT[i])
    cur = k + 1 if k >= 1 else (0 if u < VAL_AT[1] else 1)
    for i in range(5):
        val = WAYS[i] if shown(i) else '?'
        st = 'idle'
        if shown(i): st = 'done'
        if k >= 1 and i in (k - 1, k) and not shown(k + 1): st = 'good'
        if (k >= 0 and i == cur): st = 'active'
        if k == 3 and shown(4) and i == 4: st = 'found'
        cell(dl, dg, xs[i], cy, 150, val, st, pop_in(lt, i * 0.06))
        text(dl, f'step {i + 1}', 'monor', 28, xs[i], cy + 105, MUTED)
    if k >= 1:
        i = k + 1
        p = ease_out(prog(u, 0.2, 0.6))
        for j, col in ((i - 1, TEAL), (i - 2, VIOLET)):
            hgt = 30 + (i - j) * 22
            box = (xs[j], cy - 80 - hgt, xs[i], cy - 80 + hgt)
            for D in (dl, dg): D.arc(box, 180, 180 + 180 * p, fill=rgba(col), width=6)
        ea = ease_out(prog(u, 0.3, 0.6))
        parts = [(f'ways({i + 1}) = ', WHITE), (str(WAYS[i - 1]), TEAL), (' + ', WHITE), (str(WAYS[i - 2]), VIOLET)]
        if shown(i): parts += [(' = ', WHITE), (str(WAYS[i]), GOLD)]
        rich(dl, parts, 900, 'mono', 58, ea)
    elif k == 0:
        rich(dl, [('base cases', MUTED)], 900, 'mono', 52, ease_out(prog(u, 0.2, 0.5)))
    tops = stairs(dl, dg, 220, 1390, 160, 62, hl=(cur + 1 if k >= 0 else None), done=range(1, cur + 1))
    if k >= 0:
        x, y = tops[cur + 1] if not (k == 0 and u < VAL_AT[1]) else tops[1]
        ball(dl, dg, x, y - 30, 22)
    if k == 3:
        result_badge(L, G, dl, W / 2, 1020, '8 ways', u - 1.9, w=440)
        burst(dl, dg, W / 2, 1020, u - 2.0)

E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
