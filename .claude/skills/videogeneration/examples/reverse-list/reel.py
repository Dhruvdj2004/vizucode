"""LeetCode 206 — Reverse Linked List (linked list / three pointers)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Linked List · Easy',
    CODE=[
        'ListNode* reverseList(ListNode* head) {',
        '    ListNode* prev = nullptr;',
        '    ListNode* curr = head;',
        '    while (curr) {',
        '        ListNode* next = curr->next;',
        '        curr->next = prev;',
        '        prev = curr;',
        '        curr = next;',
        '    }',
        '    return prev;',
        '}',
    ],
    CODE_TITLE='C++  ·  three pointers',
    TY={'ListNode'},
    FN={'reverseList'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(1)')],
    CAPTION_GOLD={'previous', 'current', 'next', 'flip', 'null', 'head', 'one', 'two', 'three', 'four', 'arrow', 'pointers',
                  'reverse', 'save', 'move'},
    CAPTION_CORAL={'extra'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [3]), (fr('save next'), [4]), (fr('point current'), [5]), (fr('move previous'), [6, 7]), (fr('Return'), [9])]

VALS = [1, 2, 3, 4]
SL = row_x(6, 116, 52)       # slot 0 = null (left), 1..4 = nodes, 5 = null (right)
NY = 760
def sx(i): return SL[i + 1]  # node index -1..4 → x

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_REV = 0.2 + vo_at('problem', 'Reverse'); sfx.append((ps + P_REV + 0.4, 'whoosh')); sfx.append((ps + P_REV + 1.4, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_COPY = 0.2 + vo_at('brute', 'copy'); B_BACK = 0.2 + vo_at('brute', 'write them'); B_STAMP = 0.2 + vo_at('brute', 'but it uses')
for k in range(4): sfx.append((bs + B_COPY + 0.3 + k * 0.25, 'tick')); sfx.append((bs + B_BACK + 0.3 + k * 0.25, 'tick'))
sfx.append((bs + B_STAMP + 0.4, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_THREE = 0.2 + vo_at('idea', 'three pointers'); I_SAVE = 0.2 + vo_at('idea', 'Save next'); I_FLIP = 0.2 + vo_at('idea', 'flip'); I_MOVE = 0.2 + vo_at('idea', 'then move')
for x in (I_THREE, I_SAVE, I_FLIP, I_MOVE): sfx.append((isd + x, 'pop'))
KEYS = [f'w{i}' for i in range(5)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8, extra_gap={3: 0.6})
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
# pointer keyframes: (time, prev, curr, next)  (-1 = null left, 4 = null right, None = hidden)
PK = [(0.0, None, None, None),
      (at(0, 'Previous'), -1, None, None), (at(0, 'Current'), -1, 0, None), (at(0, 'Save next'), -1, 0, 1),
      (at(1, 'Move'), 0, 1, 2),
      (at(2, 'Move'), 1, 2, 3),
      (at(3, 'Flip three', 1.0), 2, 3, 4),
      (at(3, 'Then flip', 1.0), 3, 4, None)]
FLIP = [at(1, 'Flip'), at(2, 'Flip'), at(3, 'Flip three'), at(3, 'Then flip')]
HEAD = at(4, 'new head')
for tt in FLIP: sfx.append((ws + tt, 'whoosh')); sfx.append((ws + tt + 0.4, 'pop'))
for tt, *_ in PK[1:]: sfx.append((ws + tt, 'tick'))
sfx.append((ws + HEAD, 'ding')); sfx.append((ws + at(4, 'Done'), 'win'))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def lnode(dl, dg, x, y, v, state='idle', s=1.0, size=116):
    cell(dl, dg, x, y, size, v, state, s, font='b')

def null_box(dl, x, y, a=1.0):
    if a <= 0.01: return
    dl.rounded_rectangle((x - 52, y - 34, x + 52, y + 34), radius=12, outline=rgba(MUTED, a * 0.7), width=3)
    text(dl, 'null', 'mono', 28, x, y, MUTED, alpha=a)

def link(dl, dg, i, f, y=NY, a=1.0, col=None):
    """Arrow of node i. f=0 → points right (to i+1), f=1 → points left (to i-1). Flips through a collapse."""
    if a <= 0.01: return
    x = sx(i)
    if f < 0.5:
        p = 1 - f * 2; x1, x2 = x + 60, sx(i + 1) - 62
        c = col or (150, 165, 200)
    else:
        p = f * 2 - 1; x1, x2 = x - 60, sx(i - 1) + 62
        c = col or TEAL
    if p <= 0.02: return
    yy = y + (0 if f < 0.5 else 0)
    for D in ((dl, dg) if f >= 0.5 else (dl,)):
        arrow_line(D, x1, yy, x2, yy, c, 6, 18, a, p)

def tag(dl, dg, x, y, lab, col, a=1.0, up=False):
    if a <= 0.01: return
    w = F('mono', 30).getlength(lab) + 40
    pill(dl, x, y, w, 52, tint(col, 0.25), col, alpha=a, width=3)
    text(dl, lab, 'mono', 30, x, y, col, alpha=a)
    ay = y + (34 if up else -34)
    dl.polygon([(x, ay + (14 if up else -14)), (x - 10, ay), (x + 10, ay)], fill=rgba(col, a))


def pk_at(lt):
    prev = cur = PK[0][1:]; tc = 0
    for tt, *v in PK:
        if lt >= tt: prev, cur, tc = cur, tuple(v), tt
    f = ease_in_out(prog(lt, tc, tc + 0.4))
    def xx(j):
        a, b = prev[j], cur[j]
        if b is None: return None, 0
        if a is None: return sx(b), f
        return lerp(sx(a), sx(b), f), 1
    return [xx(j) for j in range(3)]


# ---------------- scenes ----------------
def list_row(dl, dg, lt, y, flips, vals=VALS, states=None, t0=0.0, nulls=(False, True)):
    states = states or {}
    null_box(dl, SL[0], y, (1 if nulls[0] else 0))
    null_box(dl, SL[5], y, (1 if nulls[1] else 0))
    for i in range(4):
        link(dl, dg, i, flips[i], y, a=ease_out(prog(lt, t0 + 0.3 + i * 0.1, t0 + 0.6 + i * 0.1)))
    for i, v in enumerate(vals):
        lnode(dl, dg, sx(i), y, v, states.get(i, 'idle'), pop_in(lt, t0 + i * 0.08))


def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'REVERSE IT', 'black', 116, W / 2, 450, WHITE)
    gtext(L, G, 'IN PLACE!', 'black', 140, W / 2, 590)
    flips = [ease_in_out(prog(lt, 1.3 + i * 0.35, 1.7 + i * 0.35)) for i in range(4)]
    nl = prog(lt, 1.3, 1.6)
    list_row(dl, dg, lt, 880, flips, nulls=(nl > 0.5, nl <= 0.5), t0=0.2)
    if lt > 2.9:
        tag(dl, dg, sx(3), 1000, 'new head', GOLD, ease_out(prog(lt, 2.9, 3.2)), up=True)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1220 + (1 - tg) * 30, 'LeetCode 206 · Reverse Linked List', WHITE, 'sb', 34, tg, w=720, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Flip every arrow')
    text(dl, 'before', 'monor', 30, W / 2, 620, MUTED, alpha=ease_out(prog(lt, 0.3, 0.6)))
    list_row(dl, dg, lt, 710, [0, 0, 0, 0], t0=0.3)
    tag(dl, dg, sx(0), 810, 'head', ORANGE, ease_out(prog(lt, 0.8, 1.1)), up=True)
    if lt > P_REV:
        f = [ease_in_out(prog(lt, P_REV + 0.3 + i * 0.25, P_REV + 0.7 + i * 0.25)) for i in range(4)]
        text(dl, 'after', 'monor', 30, W / 2, 960, TEAL, alpha=ease_out(prog(lt, P_REV, P_REV + 0.3)))
        list_row(dl, dg, lt - P_REV, 1050, f, nulls=(True, False), states={i: 'good' for i in range(4)} if f[3] >= 1 else None)
        tag(dl, dg, sx(3), 1150, 'head', GOLD, ease_out(prog(lt, P_REV + 1.4, P_REV + 1.7)), up=True)


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'ONE WAY', 'Copy to an array', col=MUTED)
    rev = lt > B_BACK + 0.3
    vals = []
    for i in range(4):
        if rev and lt > B_BACK + 0.3 + i * 0.25: vals.append(VALS[3 - i])
        else: vals.append(VALS[i])
    list_row(dl, dg, lt, 700, [0, 0, 0, 0], vals=vals, states={i: 'good' for i in range(4)} if lt > B_BACK + 1.4 else None)
    a = ease_out(prog(lt, B_COPY, B_COPY + 0.3))
    text(dl, 'array', 'mono', 32, 120, 920, GOLD, alpha=a)
    xs = row_x(4, 100, 16)
    for i in range(4):
        cell(dl, dg, xs[i], 920, 100, VALS[i], 'active' if lt > B_COPY + 0.3 + i * 0.25 else 'dim', pop_in(lt, B_COPY + 0.3 + i * 0.25), font='mono')
    big_o_stamp(L, G, dl, lt, B_STAMP + 0.4, 'O(n)', cy=1150, size=130)
    text(dl, 'extra space', 'xb', 46, W / 2, 1280, CORAL, alpha=ease_out(prog(lt, B_STAMP + 0.7, B_STAMP + 1.0)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, I_THREE - 0.3, I_THREE + 0.1)
    if b > 0: gtext(L, G, '3 POINTERS', 'black', 130, W / 2, 540, scale=back(b), alpha=clamp(b * 2))
    for j, (lab, col) in enumerate((('prev', TEAL), ('curr', ORANGE), ('next', VIOLET))):
        a = ease_out(prog(lt, I_THREE + 0.3 + j * 0.25, I_THREE + 0.6 + j * 0.25))
        label_pill(dl, dg, W / 2 + (j - 1) * 270, 690, lab, col, size=40, alpha=a, w=220, glow=True)
    steps = [('1', 'next = curr->next', VIOLET, I_SAVE), ('2', 'curr->next = prev', ORANGE, I_FLIP), ('3', 'prev = curr; curr = next', TEAL, I_MOVE)]
    for j, (n, s, col, t0) in enumerate(steps):
        a = ease_out(prog(lt, t0, t0 + 0.3))
        y = 860 + j * 130
        dl.rounded_rectangle((90, y - 50, W - 90, y + 50), radius=24, fill=rgba((18, 24, 40), a), outline=rgba(col, a), width=4)
        text(dl, n, 'black', 50, 150, y, col, alpha=a)
        text(dl, s, 'mono', 40, 200, y, WHITE, alpha=a, anchor='lm')
    # mini flip demo arrow
    f = ease_in_out(prog(lt, I_FLIP + 0.3, I_FLIP + 1.0))
    if lt > I_FLIP:
        x = W / 2
        p = abs(1 - 2 * f)
        if p > 0.02:
            if f < 0.5: arrow_line(dl, x - 90, 1290, x + 90, 1290, (150, 165, 200), 6, 18, 1, p)
            else:
                for D in (dl, dg): arrow_line(D, x + 90, 1290, x - 90, 1290, TEAL, 6, 18, 1, p)
        text(dl, 'flip!', 'xb', 40, x + 190, 1290, GOLD, alpha=ease_out(prog(lt, I_FLIP + 0.3, I_FLIP + 0.6)))


def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    flips = [ease_in_out(prog(lt, tt, tt + 0.6)) for tt in FLIP]
    (px, pa), (cx, ca), (nx, na) = pk_at(lt)
    _, cur, _ = None, None, None
    cur_idx = [v for tt, *v in PK if lt >= tt][-1]
    states = {}
    for i in range(4):
        if flips[i] >= 1: states[i] = 'good'
    if cur_idx[1] is not None and 0 <= cur_idx[1] < 4: states[cur_idx[1]] = 'active'
    if k == 4: states = {i: 'good' for i in range(4)}
    for i in range(4):
        col = None
        link(dl, dg, i, flips[i], NY, a=ease_out(prog(lt, 0.3 + i * 0.1, 0.6 + i * 0.1)))
    null_box(dl, SL[0], NY, ease_out(prog(lt, 0.2, 0.5)))
    null_box(dl, SL[5], NY, ease_out(prog(lt, 0.2, 0.5)))
    for i, v in enumerate(VALS):
        lnode(dl, dg, sx(i), NY, v, states.get(i, 'idle'), pop_in(lt, i * 0.06))
    if px is not None: tag(dl, dg, px, NY - 120, 'prev', TEAL, pa)
    if cx is not None: tag(dl, dg, cx, NY + 120, 'curr', ORANGE, ca, up=True)
    if nx is not None: tag(dl, dg, nx, NY + 200, 'next', VIOLET, na, up=True)
    for i, tt in enumerate(FLIP):
        d = lt - tt
        if -0.1 < d < 1.2:
            label_pill(dl, dg, sx(i) - 85, NY - 210, 'flip!', GOLD, size=30, alpha=ease_out(prog(d, -0.1, 0.2)) * (1 - prog(d, 0.9, 1.2)), w=130, glow=True)
    # status line
    msgs = {0: [('save ', MUTED), ('next', VIOLET), (' before flipping', WHITE)],
            1: [('1', WHITE), (' → ', MUTED), ('null', TEAL)],
            2: [('2', WHITE), (' → ', MUTED), ('1', TEAL)],
            3: [('3', WHITE), (' → ', MUTED), ('2', TEAL), ('   4', WHITE), (' → ', MUTED), ('3', TEAL)]}
    if k in msgs:
        rich(dl, msgs[k], 1080, 'mono', 48, ease_out(prog(u, 0.3, 0.6)))
    if k == 4:
        tag(dl, dg, sx(3), NY + 200, 'new head', GOLD, ease_out(prog(lt, HEAD, HEAD + 0.3)), up=True)
        rich(dl, [('4 → 3 → 2 → 1 → ', WHITE), ('null', MUTED)], 1060, 'mono', 50, ease_out(prog(u, 0.2, 0.5)))
        result_badge(L, G, dl, W / 2, 1220, 'return prev', lt - at(4, 'Done'), w=560, h=120, size=52)
        burst(dl, dg, W / 2, 1220, lt - at(4, 'Done') - 0.1)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
