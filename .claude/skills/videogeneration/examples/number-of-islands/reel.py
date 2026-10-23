"""LeetCode 200 — Number of Islands (graph / flood fill)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Graphs · Medium',
    CODE=[
        'int numIslands(vector<vector<char>>& g) {',
        '    int count = 0;',
        '    for (int r = 0; r < g.size(); r++)',
        '        for (int c = 0; c < g[0].size(); c++)',
        "            if (g[r][c] == '1') {",
        '                count++;',
        '                sink(g, r, c);',
        '            }',
        '    return count;',
        '}',
        'void sink(vector<vector<char>>& g, int r, int c) {',
        '    if (r < 0 || c < 0 || r >= g.size() ||',
        "        c >= g[0].size() || g[r][c] != '1') return;",
        "    g[r][c] = '0';",
        '    sink(g, r + 1, c); sink(g, r - 1, c);',
        '    sink(g, r, c + 1); sink(g, r, c - 1);',
        '}',
    ],
    CODE_TITLE='C++  ·  DFS flood fill',
    CODE_MARKS=[(0.0, [2, 3]), (0.2, [4, 5, 6]), (0.55, [13]), (0.76, [14, 15])],
    FN={'numIslands', 'sink', 'size'},
    COMPLEXITY=[('TIME', 'O(R·C)'), ('SPACE', 'O(R·C)')],
    CAPTION_GOLD={'one', 'two', 'three', 'seven', 'islands', 'island', 'land', 'sink', 'ones', 'flood', 'fill'},
    CAPTION_CORAL={'wrong', 'false'},
)

GRID = ['11000', '11000', '00100', '00011']
R_, C_ = 4, 5
ISL_COL = [TEAL, VIOLET, BLUE]
LAND = ((190, 140, 60), (52, 40, 22), GOLD)
WATER = ((40, 70, 110), (14, 26, 46), (70, 110, 160))

def gcell(dl, dg, cx, cy, size, ch, s=1.0, island=None, cursor=False, flash=0.0, label='0'):
    if island is not None:
        col = ISL_COL[island]
        cell(dl, dg, cx, cy, size, label, s=s, colors=(col, tint(col, 0.32), WHITE), glow=flash > 0, font='mono')
    else:
        cell(dl, dg, cx, cy, size, ch, s=s, colors=LAND if ch == '1' else WATER, glow=False, font='mono')
    if cursor:
        z = size * s / 2 + 9
        for D in (dl, dg): D.rounded_rectangle((cx - z, cy - z, cx + z, cy + z), radius=size * 0.24, outline=rgba(ORANGE), width=7)
    if flash > 0.02:
        z = size * s / 2 + 20 * flash
        dl.rounded_rectangle((cx - z, cy - z, cx + z, cy + z), radius=size * 0.3, outline=rgba(WHITE, 1 - flash), width=4)

def grid_xy(size, gap, top):
    xs = row_x(C_, size, gap)
    return lambda r, c: (xs[c], top + r * (size + gap))

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
vo_scene('problem', 'problem', pad=0.7)
bs = vo_scene('brute', 'brute', pad=0.8)
ONES = [(r, c) for r in range(R_) for c in range(C_) if GRID[r][c] == '1']
for k in range(len(ONES)): sfx.append((bs + 0.8 + k * 0.28, 'tick'))
sfx.append((bs + 3.0, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.7)
sfx.append((isd + 2.3, 'ding'))
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2', 'w3', 'w4'], gap=0.5, last_extra=1.6)

# walkthrough script: cursor keyframes, counts, sinks — all in seconds since walk start
S0 = [s for s, d in WSTEPS]
CURSOR = [(S0[0] + 0.2, 0)]
CURSOR += [(S0[2] + 0.2 + (i - 1) * 0.11, i) for i in range(1, 13)]
CURSOR += [(S0[3] + 0.1 + (i - 13) * 0.1, i) for i in range(13, 19)]
CURSOR += [(S0[4] + 0.1, 19), (S0[4] + 0.45, None)]
COUNT = [(S0[0] + 2.2, 1), (S0[2] + 2.4, 2), (S0[3] + 1.0, 3)]
FOUND = [(S0[0] + 1.3, (0, 0)), (S0[2] + 1.45, (2, 2)), (S0[3] + 0.65, (3, 3))]
SINK = [(S0[1] + 0.3 + j * 0.45, rc, 0) for j, rc in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)])]
SINK += [(S0[2] + 2.75, (2, 2), 1), (S0[3] + 1.8, (3, 3), 2), (S0[3] + 2.2, (3, 4), 2)]
for tt, _ in FOUND: sfx.append((ws + tt, 'ding'))
for tt, *_ in SINK: sfx.append((ws + tt, 'pop'))
sfx.append((ws + S0[4] + 1.2, 'win'))
vo_scene('code', 'code', pad=0.8)
os_ = vo_scene('outro', 'outro', pad=1.6)
sfx.append((os_ + 3.2, 'pop'))

# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'HOW MANY', 'black', 120, W / 2, 460, WHITE)
    gtext(L, G, 'ISLANDS?', 'black', 140, W / 2, 600)
    at = grid_xy(130, 14, 790)
    for r in range(R_):
        for c in range(C_):
            x, y = at(r, c)
            bob = math.sin(lt * 2.4 + r + c * 0.7) * 5 * prog(lt, 1.5, 2.0)
            gcell(dl, dg, x, y + bob, 130, GRID[r][c], pop_in(lt, 0.15 + (r + c) * 0.06))
    tg = ease_out(prog(lt, 2.3, 2.8))
    label_pill(dl, dg, W / 2, 1360 + (1 - tg) * 30, 'LeetCode 200 · Number of Islands', WHITE, 'sb', 34, tg, w=700, fill=(24, 31, 52))

def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Count the islands')
    a = ease_out(prog(lt, 0.3, 0.7)); b = ease_out(prog(lt, 1.1, 1.5))
    gcell(dl, dg, 300, 650, 110, '1', back(prog(lt, 0.3, 0.7)))
    text(dl, 'land', 'xb', 52, 375, 650, GOLD, anchor='lm', alpha=a)
    gcell(dl, dg, 640, 650, 110, '0', back(prog(lt, 1.1, 1.5)))
    text(dl, 'water', 'xb', 52, 715, 650, WATER[2], anchor='lm', alpha=b)
    cx, cy, d = 540, 960, 150
    p = prog(lt, 2.2, 2.6)
    gcell(dl, dg, cx, cy, 120, '1', back(p))
    for j, (dx, dy) in enumerate([(0, -1), (0, 1), (-1, 0), (1, 0)]):
        q = prog(lt, 2.5 + j * 0.3, 2.85 + j * 0.3)
        if q <= 0: continue
        gcell(dl, dg, cx + dx * d, cy + dy * d, 120, '1', back(q), island=0, flash=0.01, label='1')
    dg_ = prog(lt, 5.1, 5.5)
    if dg_ > 0:
        gcell(dl, dg, cx + d, cy - d, 120, '1', back(dg_))
        cross_mark(dl, cx + d, cy - d, 34, rgba(CORAL), 10, prog(lt, 5.4, 5.8))
        cross_mark(dg, cx + d, cy - d, 34, rgba(CORAL), 10, prog(lt, 5.4, 5.8))
    label_pill(dl, dg, W / 2 - 190, 1240, 'up·down·left·right', TEAL, size=30, alpha=ease_out(prog(lt, 3.5, 3.9)), w=400)
    label_pill(dl, dg, W / 2 + 230, 1240, 'no diagonals', CORAL, size=30, alpha=ease_out(prog(lt, 5.4, 5.8)), w=300)

def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRAP', 'Just count the ones?', col=MUTED)
    at = grid_xy(130, 14, 640)
    n_on = int(clamp((lt - 0.8) / 0.28 + 1, 0, len(ONES))) if lt >= 0.8 else 0
    grouped = lt > 4.4
    isl = {(0, 0): 0, (0, 1): 0, (1, 0): 0, (1, 1): 0, (2, 2): 1, (3, 3): 2, (3, 4): 2}
    for r in range(R_):
        for c in range(C_):
            x, y = at(r, c)
            if grouped and (r, c) in isl:
                gcell(dl, dg, x, y, 130, '1', island=isl[(r, c)], flash=0.01, label='1')
            else:
                gcell(dl, dg, x, y, 130, GRID[r][c])
                if (r, c) in ONES[:n_on] and not grouped:
                    z = 74
                    for D in (dl, dg): D.rounded_rectangle((x - z, y - z, x + z, y + z), radius=30, outline=rgba(GOLD), width=5)
    if n_on and not grouped:
        text(dl, f'ones counted: {n_on}', 'mono', 46, W / 2, 1250, GOLD)
    if 2.9 < lt and not grouped:
        s = prog(lt, 2.9, 3.2)
        gtext(L, G, '7?  WRONG', 'black', 110, W / 2, 1350, scale=lerp(1.6, 1, ease_out(s)), alpha=clamp(s * 2), c1=(255, 120, 110), c2=(255, 60, 90))
    if grouped:
        a = ease_out(prog(lt, 4.4, 4.8))
        label_pill(dl, dg, W / 2, 1270, 'connected land = ONE island', TEAL, size=38, alpha=a, w=700, glow=True)

IDEA_ISL = {(0, 1), (1, 0), (1, 1), (1, 2), (2, 1), (2, 2)}
def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.3, 0.7)
    if b > 0: gtext(L, G, 'FLOOD FILL', 'black', 130, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
    text(dl, 'count it, then sink it', 'xb', 56, W / 2, 650, WHITE, alpha=ease_out(prog(lt, 1.6, 2.0)))
    xs = row_x(4, 115, 12)
    for r in range(4):
        for c in range(4):
            x, y = xs[c], 820 + r * 127
            ch = '1' if (r, c) in IDEA_ISL else '0'
            d = abs(r - 1) + abs(c - 1)
            tt = 2.3 + d * 0.4
            sunk = ch == '1' and lt > tt
            fl = prog(lt, tt, tt + 0.4)
            gcell(dl, dg, x, y, 115, ch, pop_in(lt, 0.8 + (r + c) * 0.05), island=0 if sunk else None,
                  cursor=(r, c) == (1, 1) and 2.0 < lt < 2.5, flash=fl if 0 < fl < 1 else 0)
    label_pill(dl, dg, W / 2 - 160, 1360, 'count +1', GOLD, size=34, alpha=ease_out(prog(lt, 2.3, 2.6)), w=240)
    label_pill(dl, dg, W / 2 + 150, 1360, 'DFS sinks it', TEAL, size=34, alpha=ease_out(prog(lt, 3.6, 3.9)), w=300, glow=True)

def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'SCAN + SINK')
    at = grid_xy(146, 14, 580)
    cur = None
    for tt, idx in CURSOR:
        if lt >= tt: cur = idx
    count = 0
    for tt, n in COUNT:
        if lt >= tt: count = n
    sunk = {}
    for tt, rc, isl in SINK:
        if lt >= tt: sunk[rc] = (isl, prog(lt, tt, tt + 0.45))
    for r in range(R_):
        for c in range(C_):
            x, y = at(r, c)
            isl, fl = sunk.get((r, c), (None, 0))
            gcell(dl, dg, x, y, 146, GRID[r][c], pop_in(lt, (r + c) * 0.05), island=isl,
                  cursor=cur == r * C_ + c, flash=fl if 0 < fl < 1 else 0)
    for tt, rc in FOUND:
        if tt <= lt < tt + 0.9:
            x, y = at(*rc)
            label_pill(dl, dg, x + (110 if rc[1] < 4 else -110), y - 95, 'land!', GOLD, size=30, alpha=1 - prog(lt, tt + 0.6, tt + 0.9), w=150)
    a = ease_out(prog(lt, 0.3, 0.7))
    bump = 1 + 0.25 * max([0] + [1 - prog(lt, tt, tt + 0.35) for tt, _ in COUNT if lt >= tt])
    pill(dl, W / 2, 1250, 460, 110, (20, 26, 44), GOLD, alpha=a, width=4)
    text(dl, 'islands:', 'xb', 50, W / 2 - 50, 1252, WHITE, alpha=a)
    text(dl, str(count), 'black', 70 * bump, W / 2 + 140, 1250, GOLD, alpha=a)
    k, u = step_at(lt, steps)
    if k == 4:
        result_badge(L, G, dl, W / 2, 1250, '3 islands', u - 1.2, w=520, h=120, size=56)
        burst(dl, dg, W / 2, 1250, u - 1.25)

E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
