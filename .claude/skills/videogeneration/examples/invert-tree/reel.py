"""LeetCode 226 — Invert Binary Tree (trees / recursion)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Trees · Easy',
    CODE=[
        'TreeNode* invertTree(TreeNode* root) {',
        '    if (!root) return nullptr;',
        '    swap(root->left, root->right);',
        '    invertTree(root->left);',
        '    invertTree(root->right);',
        '    return root;',
        '}',
    ],
    CODE_TITLE='C++  ·  recursive swap',
    FN={'invertTree', 'swap'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(h)')],
    CAPTION_GOLD={'swap', 'mirror', 'four', 'two', 'seven', 'nine', 'six', 'three', 'one', 'recursion', 'left', 'right',
                  'children', 'leaves', 'flip'},
    CAPTION_CORAL={'extra'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [1]), (fr('Swap'), [2]), (fr('Then invert'), [3, 4]), (fr('Return'), [5])]

# tree: value -> (left, right)
KIDS = {4: (2, 7), 2: (1, 3), 7: (6, 9), 1: (None, None), 3: (None, None), 6: (None, None), 9: (None, None)}
LEVEL = {4: 0, 2: 1, 7: 1, 1: 2, 3: 2, 6: 2, 9: 2}
BASEX = {4: 540, 2: 300, 7: 780, 1: 180, 3: 420, 6: 660, 9: 900}
def desc(v):
    out = []
    for c in KIDS[v]:
        if c is not None: out += [c] + desc(c)
    return out

def positions(swaps, cx=540, ys=(620, 860, 1100), sx=1.0):
    """swaps = [(node, f)] applied in order (f 0→1). Mirrors node's descendants around its current x."""
    x = {v: cx + (BASEX[v] - 540) * sx for v in KIDS}
    lift = {v: 0.0 for v in KIDS}
    for n, f in swaps:
        if f <= 0: continue
        c = math.cos(math.pi * f)
        for d in desc(n):
            x[d] = x[n] + (x[d] - x[n]) * c
            lift[d] += math.sin(math.pi * f) * 40
    return {v: (x[v], ys[LEVEL[v]] - lift[v]) for v in KIDS}

def draw_tree(dl, dg, pos, r=62, states=None, reveal=9.0, hot_edges=(), alpha=1.0):
    states = states or {}
    for v, (l, rr) in KIDS.items():
        for c in (l, rr):
            if c is None: continue
            p = prog(reveal, LEVEL[c] * 0.35, LEVEL[c] * 0.35 + 0.3)
            if p <= 0: continue
            (px, py), (cx, cy) = pos[v], pos[c]
            ang = math.atan2(cy - py, cx - px)
            x1, y1 = px + math.cos(ang) * r, py + math.sin(ang) * r
            x2, y2 = lerp(x1, cx - math.cos(ang) * r, p), lerp(y1, cy - math.sin(ang) * r, p)
            col = GOLD if c in hot_edges else CELL_LINE
            dl.line([(x1, y1), (x2, y2)], fill=rgba(col, alpha), width=7 if c in hot_edges else 5)
            if c in hot_edges: dg.line([(x1, y1), (x2, y2)], fill=rgba(col, alpha), width=7)
    for v in KIDS:
        x, y = pos[v]
        node(dl, dg, x, y, r, v, states.get(v, 'idle'), pop_in(reveal, LEVEL[v] * 0.35), alpha)

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_FLIP = 0.2 + vo_at('problem', 'every left'); sfx.append((ps + P_FLIP + 0.5, 'whoosh')); sfx.append((ps + P_FLIP + 1.2, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_LV = 0.2 + vo_at('brute', 'collecting'); B_X = 0.2 + vo_at('brute', 'That works')
for k in range(3): sfx.append((bs + B_LV + 0.3 + k * 0.6, 'pop'))
sfx.append((bs + B_X + 0.5, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_SWAP = 0.2 + vo_at('idea', 'swap its'); I_REC = 0.2 + vo_at('idea', 'then invert'); I_NULL = 0.2 + vo_at('idea', 'An empty')
sfx.append((isd + 0.5, 'pop')); sfx.append((isd + I_SWAP + 0.3, 'whoosh')); sfx.append((isd + I_REC + 0.3, 'pop')); sfx.append((isd + I_NULL + 0.2, 'tick'))
KEYS = [f'w{i}' for i in range(5)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8)
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
SWAPS = [(4, at(0, 'Swap')), (7, at(1, 'Swap')), (2, at(3, 'Swap'))]
VISIT = [(WSTEPS[0][0], 4), (WSTEPS[1][0], 7), (WSTEPS[2][0], None), (WSTEPS[3][0], 2), (WSTEPS[4][0], None)]
for n, tt in SWAPS: sfx.append((ws + tt, 'whoosh')); sfx.append((ws + tt + 0.6, 'ding'))
for k in (0, 1, 3): sfx.append((ws + WSTEPS[k][0] + 0.2, 'tick'))
sfx.append((ws + WSTEPS[2][0] + 0.6, 'tick'))
sfx.append((ws + at(4, 'perfect'), 'win'))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'FLIP THIS', 'black', 120, W / 2, 450, WHITE)
    gtext(L, G, 'TREE!', 'black', 160, W / 2, 600)
    f = 0.5 - 0.5 * math.cos(max(0, lt - 1.2) * 1.6)   # keeps flipping
    pos = positions([(4, f)], ys=(800, 990, 1180), sx=0.9)
    draw_tree(dl, dg, pos, 56, reveal=lt * 1.4 + 0.1)
    a = ease_out(prog(lt, 0.8, 1.2))
    for y in range(730, 1250, 34):   # mirror line
        dl.line([(540, y), (540, y + 16)], fill=rgba(GOLD, 0.45 * a), width=4)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1340 + (1 - tg) * 30, 'LeetCode 226 · Invert Binary Tree', WHITE, 'sb', 34, tg, w=720, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Mirror every level')
    ys = (680, 820, 960)
    pos1 = positions([], cx=290, ys=ys, sx=0.42)
    draw_tree(dl, dg, pos1, 42, reveal=lt * 1.5)
    text(dl, 'before', 'monor', 32, 290, 1060, MUTED, alpha=ease_out(prog(lt, 0.4, 0.8)))
    f = ease_in_out(prog(lt, P_FLIP + 0.3, P_FLIP + 1.4))
    if lt > P_FLIP:
        pos2 = positions([(4, f), (2, f), (7, f)], cx=800, ys=ys, sx=0.42)
        draw_tree(dl, dg, pos2, 42, reveal=(lt - P_FLIP) * 2.0, states={v: 'good' for v in KIDS} if f >= 1 else None)
        text(dl, 'after', 'monor', 32, 800, 1060, TEAL, alpha=ease_out(prog(lt, P_FLIP, P_FLIP + 0.4)))
        for D in (dl, dg): arrow_line(D, 500, 820, 590, 820, GOLD, 6, p=ease_out(prog(lt, P_FLIP, P_FLIP + 0.3)))
    a = ease_out(prog(lt, P_FLIP + 1.3, P_FLIP + 1.7))
    label_pill(dl, dg, W / 2, 1200, 'left  ↔  right', GOLD, size=42, alpha=a, w=420, glow=True)


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'ONE WAY', 'Reverse each level', col=MUTED)
    rows = [([4], [4]), ([2, 7], [7, 2]), ([1, 3, 6, 9], [9, 6, 3, 1])]
    for i, (a_, b_) in enumerate(rows):
        t0 = B_LV + 0.3 + i * 0.6
        a = ease_out(prog(lt, t0, t0 + 0.3))
        y = 650 + i * 150
        label_pill(dl, dg, 300, y, '[' + ', '.join(map(str, a_)) + ']', MUTED, size=36, alpha=a, w=330)
        text(dl, '→', 'mono', 50, 540, y, GOLD, alpha=a)
        label_pill(dl, dg, 790, y, '[' + ', '.join(map(str, b_)) + ']', TEAL, size=36, alpha=ease_out(prog(lt, t0 + 0.3, t0 + 0.6)), w=330)
    x = prog(lt, B_X + 0.5, B_X + 0.8)
    if x > 0:
        gtext(L, G, 'EXTRA LISTS', 'black', 100, W / 2, 1150, scale=lerp(1.5, 1, ease_out(x)), alpha=clamp(x * 2), c1=(255, 120, 110), c2=(255, 60, 90))
        text(dl, 'more memory, more code', 'monor', 38, W / 2, 1270, MUTED, alpha=ease_out(prog(lt, B_X + 0.9, B_X + 1.3)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'SWAP + RECURSE', 'black', 104, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
    f = ease_in_out(prog(lt, I_SWAP + 0.3, I_SWAP + 1.1))
    px, py = 540, 720
    cxs = [px + (x - px) * math.cos(math.pi * f) for x in (300, 780)]
    lift = math.sin(math.pi * f) * 50
    for x, lab in zip(cxs, ('L', 'R')):
        dl.line([(px, py + 60), (x, 920 - lift - 56)], fill=rgba(CELL_LINE), width=5)
    node(dl, dg, px, py, 66, 'N', 'active', pop_in(lt, 0.6))
    for x, lab, col in zip(cxs, ('L', 'R'), (TEAL, CORAL)):
        node(dl, dg, x, 920 - lift, 60, lab, 'idle', pop_in(lt, 0.8))
    sw = ease_out(prog(lt, I_SWAP, I_SWAP + 0.3))
    label_pill(dl, dg, W / 2, 1050, 'swap(left, right)', GOLD, size=40, alpha=sw, w=440, glow=True)
    r = ease_out(prog(lt, I_REC, I_REC + 0.3))
    for x in cxs:
        for D in (dl, dg): arrow_line(D, x, 980, x, 1130, ORANGE, 6, p=r)
    label_pill(dl, dg, W / 2, 1200, 'then invert both subtrees', ORANGE, size=34, alpha=r, w=560)
    n = ease_out(prog(lt, I_NULL, I_NULL + 0.3))
    label_pill(dl, dg, W / 2, 1320, 'null → return', MUTED, size=34, alpha=n, w=340)


def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'SWAP AT EVERY NODE', None)
    k, u = step_at(lt, steps)
    sw = [(n, ease_in_out(prog(lt, tt, tt + 0.8))) for n, tt in SWAPS]
    pos = positions(sw)
    cur = None
    for tt, n in VISIT:
        if lt >= tt: cur = n
    states = {}
    for n, tt in SWAPS:
        if lt >= tt + 0.8: states[n] = 'good'
    if cur is not None: states[cur] = 'active'
    if k == 2: states[9] = states[6] = 'active'
    if k == 4: states = {v: 'good' for v in KIDS}
    hot = set()
    if cur is not None: hot = set(c for c in KIDS[cur] if c)
    draw_tree(dl, dg, pos, 66, states, reveal=lt * 1.6 + 0.1, hot_edges=hot)
    if k == 2:   # empty children of leaves
        a = ease_out(prog(u, 0.4, 0.7)) * (1 - prog(u, steps[2][1] - 0.3, steps[2][1]))
        for v in (9, 6):
            x, y = pos[v]
            for dx in (-46, 46):
                cx, cy = x + dx, y + 130
                dl.line([(x + dx * 0.5, y + 56), (cx, cy - 28)], fill=rgba(MUTED, a * 0.6), width=3)
                dl.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), outline=rgba(MUTED, a), width=3)
                text(dl, '∅', 'mono', 28, cx, cy, MUTED, alpha=a)
    for n, tt in SWAPS:   # swap arrow label
        d = lt - tt
        if -0.2 < d < 1.4:
            x, y = pos[n]
            label_pill(dl, dg, x, y - 105, 'swap!', GOLD, size=30, alpha=ease_out(prog(d, -0.2, 0.1)) * (1 - prog(d, 1.1, 1.4)), w=150, glow=True)
    if k == 4:
        a = ease_out(prog(u, 0.2, 0.6))
        for y in range(560, 1180, 34):
            dl.line([(540, y), (540, y + 16)], fill=rgba(GOLD, 0.5 * a), width=4)
        result_badge(L, G, dl, W / 2, 1300, 'mirrored', u - 0.5, w=480, h=120, size=54)
        burst(dl, dg, W / 2, 1300, lt - at(4, 'perfect'))
    elif cur is not None:
        rich(dl, [('node ', MUTED), (str(cur), GOLD), (':  swap ', WHITE), (f'{KIDS[cur][0]} ↔ {KIDS[cur][1]}', TEAL)], 1300, 'mono', 46, ease_out(prog(u, 0.2, 0.5)))
    elif k == 2:
        rich(dl, [('leaves: ', MUTED), ('nothing to swap', WHITE)], 1300, 'mono', 46, ease_out(prog(u, 0.2, 0.5)))


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
