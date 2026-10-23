"""LeetCode 104 — Maximum Depth of Binary Tree (tree / recursion)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Trees · Easy',
    CODE=[
        'int maxDepth(TreeNode* root) {',
        '    if (root == nullptr) return 0;',
        '    int left = maxDepth(root->left);',
        '    int right = maxDepth(root->right);',
        '    return 1 + max(left, right);',
        '}',
    ],
    CODE_TITLE='C++  ·  recursion',
    CODE_MARKS=[(0.0, [1]), (0.33, [2]), (0.52, [3]), (0.71, [4])],
    FN={'maxDepth', 'max'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(h)')],
    CAPTION_GOLD={'one', 'two', 'three', 'zero', 'nine', 'fifteen', 'seven', 'twenty', 'depth', 'leaf', 'max'},
)

# node id: (value, parent, x, level)
NODES = {3: (3, None, 540, 0), 9: (9, 3, 300, 1), 20: (20, 3, 780, 1), 15: (15, 20, 640, 2), 7: (7, 20, 920, 2)}
DEPTH = {9: 1, 15: 1, 7: 1, 20: 2, 3: 3}

def draw_tree(dl, dg, ys, r=66, reveal=99.0, states=None, edge_cols=None, badges=None):
    """reveal: seconds-like progress — level L pops at L*0.4. states: id->state. edge_cols: child id->colour."""
    states = states or {}; edge_cols = edge_cols or {}; badges = badges or {}
    pos = {k: (x, ys[lv]) for k, (v, par, x, lv) in NODES.items()}
    for k, (v, par, x, lv) in NODES.items():
        if par is None: continue
        p = prog(reveal, lv * 0.4, lv * 0.4 + 0.3)
        if p <= 0: continue
        (px, py), (cx, cy) = pos[par], pos[k]
        col = edge_cols.get(k, CELL_LINE)
        ang = math.atan2(cy - py, cx - px)
        x1, y1 = px + math.cos(ang) * r, py + math.sin(ang) * r
        x2, y2 = lerp(x1, cx - math.cos(ang) * r, p), lerp(y1, cy - math.sin(ang) * r, p)
        dl.line([(x1, y1), (x2, y2)], fill=rgba(col), width=7 if k in edge_cols else 5)
        if k in edge_cols: dg.line([(x1, y1), (x2, y2)], fill=rgba(col), width=7)
    for k, (v, par, x, lv) in NODES.items():
        s = pop_in(reveal, lv * 0.4)
        node(dl, dg, x, ys[lv], r, v, states.get(k, 'idle'), s)
        if k in badges:
            b, col = badges[k]
            bs = back(b)
            if bs > 0.02:
                bx, by = x + r * 0.85, ys[lv] - r * 0.85
                for D in (dl, dg): D.ellipse((bx - 30 * bs, by - 30 * bs, bx + 30 * bs, by + 30 * bs), fill=rgba(col))
                text(dl, str(DEPTH[k]), 'mono', 36 * bs, bx, by, INK_ON_GRAD)
    return pos

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
for lv in range(3): sfx.append((0.25 + lv * 0.4, 'tick'))
vo_scene('problem', 'problem', pad=0.9)
bs = vo_scene('brute', 'brute', pad=0.8)
for k in range(3): sfx.append((bs + 0.6 + k * 1.0, 'tick'))
isd = vo_scene('idea', 'idea', pad=0.7)
sfx.append((isd + 3.6, 'pop'))
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2', 'w3', 'w4'], gap=0.5, last_extra=1.4)
ORDER = [9, 15, 7, 20, 3]
BADGE_AT = [2.7, 1.3, 0.85, 1.7, 3.3]
for k in range(5):
    sfx.append((ws + WSTEPS[k][0] + BADGE_AT[k], 'pop' if k < 4 else 'win'))
vo_scene('code', 'code', pad=0.8)
os_ = vo_scene('outro', 'outro', pad=1.6)
sfx.append((os_ + 3.2, 'pop'))

# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'HOW DEEP IS', 'black', 110, W / 2, 460, WHITE)
    gtext(L, G, 'THIS TREE?', 'black', 130, W / 2, 595)
    bob = math.sin(lt * 2.5) * 6
    draw_tree(dl, dg, [800 + bob, 1000 + bob, 1200 + bob], r=62, reveal=lt * 1.3 + 0.2)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1360 + (1 - tg) * 30, 'LeetCode 104 · Max Depth of Binary Tree', WHITE, 'sb', 32, tg, w=800, fill=(24, 31, 52))

def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK')
    b = ease_out(prog(lt, 0.15, 0.5))
    text(dl, 'Count the nodes on the', 'xb', 66, W / 2, 500, WHITE, alpha=b)
    c = prog(lt, 1.3, 1.7)
    if c > 0: gtext(L, G, 'longest root-to-leaf path', 'black', 66, W / 2, 595, scale=back(c), alpha=clamp(c * 2))
    ys = [780, 980, 1180]
    path = [3, 20, 15]
    on = [k for i, k in enumerate(path) if lt > 2.3 + i * 0.45]
    st = {k: 'active' for k in on}
    ec = {k: GOLD for k in on if k != 3}
    draw_tree(dl, dg, ys, r=62, states=st, edge_cols=ec)
    for i, y in enumerate(ys):
        a = ease_out(prog(lt, 2.3 + i * 0.45, 2.6 + i * 0.45))
        label_pill(dl, dg, 110, y, str(i + 1), GOLD, size=36, alpha=a, w=80)
    text(dl, 'level', 'monor', 28, 110, 690, MUTED, alpha=ease_out(prog(lt, 2.3, 2.6)))

PATHS = [([3, 9], 0.5), ([3, 20, 15], 1.5), ([3, 20, 7], 2.5)]
def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'ONE WAY', 'List every path', col=MUTED)
    cur = None
    for p, t0 in PATHS:
        if lt >= t0: cur = p
    st = {k: 'active' for k in (cur or [])}
    ec = {k: ORANGE for k in (cur or []) if k != 3}
    draw_tree(dl, dg, [660, 820, 980], r=52, states=st, edge_cols=ec)
    for i, (p, t0) in enumerate(PATHS):
        a = ease_out(prog(lt, t0, t0 + 0.3))
        s = ' → '.join(map(str, p)) + f'   ({len(p)} nodes)'
        label_pill(dl, dg, W / 2, 1110 + i * 100 + (1 - a) * 20, s, GOLD if p == cur else MUTED, size=34, alpha=a, w=640)
    text(dl, '...works, but recursion is cleaner', 'sb', 40, W / 2, 1420 - 10, TEAL, alpha=ease_out(prog(lt, 3.6, 4.0)))

def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'SMARTER IDEA', 'Ask your children')
    px, py, lx, rx, cy = 540, 680, 300, 780, 920
    a = pop_in(lt, 0.4)
    node(dl, dg, px, py, 66, '?', 'active', a)
    node(dl, dg, lx, cy, 60, 'L', 'idle', pop_in(lt, 0.6))
    node(dl, dg, rx, cy, 60, 'R', 'idle', pop_in(lt, 0.7))
    p1 = ease_out(prog(lt, 1.0, 1.5))
    for x in (lx, rx):
        for D in (dl, dg): arrow_line(D, px + (x - px) * 0.18, py + 60, x - (x - px) * 0.15, cy - 66, ORANGE, 6, p=p1, alpha=1 - prog(lt, 2.1, 2.4))
    label_pill(dl, dg, W / 2, 810, 'how deep are you?', ORANGE, size=32, alpha=p1 * (1 - prog(lt, 2.2, 2.4)), w=420)
    p2 = ease_out(prog(lt, 2.4, 2.9))
    if p2 > 0:
        for x in (lx, rx):
            for D in (dl, dg): arrow_line(D, x - (x - px) * 0.15, cy - 66, px + (x - px) * 0.18, py + 60, TEAL, 6, p=p2)
    f = prog(lt, 3.5, 3.9)
    if f > 0:
        grad_pill(L, G, W / 2, 1110, 820, 120, scale=back(f))
        text(dl, 'depth = 1 + max(L, R)', 'mono', 50 * back(f), W / 2, 1110, INK_ON_GRAD)
    label_pill(dl, dg, W / 2, 1270, 'empty child → 0', MUTED, size=38, alpha=ease_out(prog(lt, 5.4, 5.8)), w=440)

def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'POST-ORDER DFS')
    k, u = step_at(lt, steps)
    ys = [600, 820, 1040]
    states, badges, ec = {}, {}, {}
    for i, nid in enumerate(ORDER):
        if i < k or (i == k and u >= BADGE_AT[i]):
            states[nid] = 'done'
            bt = (lt - steps[i][0] - BADGE_AT[i]) * 2.5
            badges[nid] = (clamp(bt), TEAL)
        if i == k and u < BADGE_AT[i]: states[nid] = 'active'
    if k == 4 and u >= BADGE_AT[4]:
        states[3] = 'found'; badges[3] = (clamp((u - BADGE_AT[4]) * 2.5), GOLD)
    cur = ORDER[k] if k >= 0 else None
    if cur in (20, 3) and k >= 0:   # children report up
        kids = [c for c, (v, par, x, lv) in NODES.items() if par == cur]
        for j, c in enumerate(kids):
            if u > (0.6 if cur == 20 else 0.8 + j * 0.8): ec[c] = TEAL
    draw_tree(dl, dg, ys, r=66, reveal=lt * 1.5 + 0.1, states=states, edge_cols=ec, badges=badges)
    if cur in (9, 15, 7):   # empty children
        x, lv = NODES[cur][2], NODES[cur][3]
        a = ease_out(prog(u, 0.9 if cur == 9 else 0.3, 1.2 if cur == 9 else 0.6)) * (1 - prog(u, steps[k][1] - 0.3, steps[k][1]))
        for dx in (-60, 60):
            cx, cy = x + dx, ys[lv] + 140
            dl.line([(x + dx * 0.5, ys[lv] + 55), (cx, cy - 32)], fill=rgba(MUTED, a * 0.6), width=3)
            dl.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), outline=rgba(MUTED, a), width=3)
            text(dl, '0', 'mono', 30, cx, cy, MUTED, alpha=a)
    if k >= 0:
        L_, R_ = {9: (0, 0), 15: (0, 0), 7: (0, 0), 20: (1, 1), 3: (1, 2)}[cur]
        ea = ease_out(prog(u, BADGE_AT[k] - 0.7, BADGE_AT[k] - 0.4))
        parts = [('1 + max(', WHITE), (str(L_), TEAL), (', ', WHITE), (str(R_), TEAL), (')', WHITE)]
        if u >= BADGE_AT[k]: parts += [(' = ', WHITE), (str(DEPTH[cur]), GOLD)]
        rich(dl, parts, 1215, 'mono', 56, ea)
        text(dl, f'node {cur}', 'monor', 32, W / 2, 1150, ORANGE, alpha=ea)
    if k == 4:
        result_badge(L, G, dl, W / 2, 1335, 'depth = 3', u - BADGE_AT[4] - 0.3, w=520, h=110, size=52)
        burst(dl, dg, W / 2, 600, u - BADGE_AT[4])

E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
