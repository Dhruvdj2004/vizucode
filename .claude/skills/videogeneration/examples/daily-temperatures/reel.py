"""LeetCode 739 — Daily Temperatures (monotonic stack)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Stack · Medium',
    CODE=[
        'vector<int> dailyTemperatures(vector<int>& t) {',
        '    vector<int> ans(t.size(), 0);',
        '    stack<int> st;          // waiting days',
        '    for (int i = 0; i < t.size(); i++) {',
        '        while (!st.empty() && t[i] > t[st.top()]) {',
        '            ans[st.top()] = i - st.top();',
        '            st.pop();',
        '        }',
        '        st.push(i);',
        '    }',
        '    return ans;',
        '}',
    ],
    CODE_TITLE='C++  ·  monotonic stack',
    FN={'dailyTemperatures', 'size', 'empty', 'top', 'pop', 'push'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(n)')],
    CAPTION_GOLD={'thirty', 'eight', 'four', 'two', 'six', 'forty', 'one', 'zero', 'push', 'pop', 'stack', 'monotonic',
                  'warmer', 'hotter', 'days', 'day', 'waited'},
    CAPTION_CORAL={'squared'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [3]), (fr('While'), [4]), (fr('pop it'), [5, 6]), (fr('Then push'), [8])]

TEMPS = [30, 38, 34, 32, 36, 40]
ANS = [1, 4, 2, 1, 1, 0]
def tcol(v):   # cold → hot
    f = clamp((v - 29) / 12)
    return tuple(int(lerp(a, b, f)) for a, b in zip(BLUE, CORAL))

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_ARC = 0.2 + vo_at('problem', 'how many days'); P_ZERO = 0.2 + vo_at('problem', 'If it never')
sfx.append((ps + P_ARC + 0.5, 'pop')); sfx.append((ps + P_ZERO + 0.3, 'tick'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_SCAN = 0.2 + vo_at('brute', 'scan forward'); B_STAMP = 0.2 + vo_at('brute', "that's O")
for k in range(5): sfx.append((bs + B_SCAN + k * 0.35, 'tick'))
sfx.append((bs + B_STAMP, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_HOLD = 0.2 + vo_at('idea', 'It holds'); I_HOT = 0.2 + vo_at('idea', 'When a hotter')
sfx.append((isd + 0.6, 'pop')); sfx.append((isd + I_HOT + 0.8, 'ding'))
KEYS = [f'w{i}' for i in range(7)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8)

def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
# stack events, seconds since walk start
EV = [(at(0, 'Push'), 'push', 0),
      (at(1, 'Pop'), 'pop', 0), (at(1, 'Push'), 'push', 1),
      (at(2, 'Push'), 'push', 2),
      (at(3, 'Push'), 'push', 3),
      (at(4, 'Pop thirty two'), 'pop', 3), (at(4, 'Pop thirty four'), 'pop', 2), (at(4, 'Push'), 'push', 4),
      (at(5, 'Pop thirty six'), 'pop', 4), (at(5, 'Pop thirty eight'), 'pop', 1), (at(5, 'Push'), 'push', 5)]
for tt, kind, i in EV:
    sfx.append((ws + tt, 'pop' if kind == 'push' else 'ding'))
STOP_AT = at(4, 'Thirty eight is')
sfx.append((ws + STOP_AT, 'buzz'))
sfx.append((ws + at(6, 'Done'), 'win'))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
XS = row_x(6, 140, 20)
def tcell(dl, dg, x, y, i, mode='idle', s=1.0, size=140, h=None, alpha=1.0):
    col = tcol(TEMPS[i])
    if mode == 'idle': colors, glow = (tuple(int(c * 0.65) for c in col), tint(col, 0.14), col), False
    elif mode == 'active': colors, glow = (ORANGE, (44, 32, 26), GOLD), True
    elif mode == 'done': colors, glow = ((40, 48, 70), (16, 20, 34), tuple(int(c * 0.6) for c in col)), False
    else: colors, glow = (col, tint(col, 0.32), WHITE), True
    cell(dl, dg, x, y, size, f'{TEMPS[i]}°', s=s, colors=colors, glow=glow, font='b', h=h, alpha=alpha)

STK_X, STK_BOTTOM, CH_W, CH_H, CH_GAP = W / 2, 1400, 250, 86, 98
def slot_y(j): return STK_BOTTOM - CH_GAP / 2 - 6 - j * CH_GAP
def stack_box(dl, dg, a=1.0, glow=False, n=3):
    if a <= 0.01: return
    top = STK_BOTTOM - n * CH_GAP - 30
    x0, x1 = STK_X - CH_W / 2 - 26, STK_X + CH_W / 2 + 26
    for D, al in ((dl, a), (dg, a * 0.8 if glow else 0)):
        if al > 0: D.line([(x0, top), (x0, STK_BOTTOM), (x1, STK_BOTTOM), (x1, top)], fill=rgba(TEAL, al), width=7, joint='curve')
    text(dl, 'stack', 'mono', 32, x1 + 80, STK_BOTTOM - 24, TEAL, alpha=a)
    text(dl, '(waiting)', 'monor', 26, x1 + 80, STK_BOTTOM - 64, MUTED, alpha=a)


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'WHEN DOES IT', 'black', 104, W / 2, 450, WHITE)
    gtext(L, G, 'GET WARMER?', 'black', 132, W / 2, 585)
    # temperature bars
    for i, v in enumerate(TEMPS):
        p = ease_out(prog(lt, 0.2 + i * 0.1, 0.7 + i * 0.1))
        hgt = (v - 22) * 22 * p
        x = XS[i]; base = 1170
        col = tcol(v)
        if hgt > 2:
            dl.rounded_rectangle((x - 55, base - hgt, x + 55, base), radius=18, fill=rgba(tint(col, 0.4)), outline=rgba(col), width=4)
            dg.rounded_rectangle((x - 55, base - hgt, x + 55, base), radius=18, outline=rgba(col, 0.5), width=5)
        text(dl, f'{v}°', 'b', 40, x, base - hgt - 36, col, alpha=p)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1300 + (1 - tg) * 30, 'LeetCode 739 · Daily Temperatures', WHITE, 'sb', 34, tg, w=720, fill=(24, 31, 52))


def arc(dl, dg, x1, x2, y, hgt, col, p, label=None, width=6):
    if p <= 0: return
    n = 30
    pts = []
    for q in range(int(n * p) + 1):
        f = q / n
        pts.append((lerp(x1, x2, f), y - math.sin(f * math.pi) * hgt))
    if len(pts) > 1:
        for D in (dl, dg): D.line(pts, fill=rgba(col), width=width, joint='curve')
    if label and p >= 1:
        text(dl, label, 'mono', 34, (x1 + x2) / 2, y - hgt - 30, col)


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Days until warmer?')
    for i in range(6): tcell(dl, dg, XS[i], 800, i, 'idle', pop_in(lt, 0.2 + i * 0.06))
    p = prog(lt, P_ARC + 0.3, P_ARC + 0.9)
    arc(dl, dg, XS[2], XS[4], 715, 80, GOLD, p, '+2 days')
    if p > 0:
        tcell(dl, dg, XS[2], 800, 2, 'active'); tcell(dl, dg, XS[4], 800, 4, 'hot')
    # answer row
    a = ease_out(prog(lt, P_ARC + 1.2, P_ARC + 1.6))
    for i in range(6):
        show = (i == 2 and a > 0) or (i == 5 and lt > P_ZERO + 0.3) or lt > P_ZERO + 1.6
        if show:
            cell(dl, dg, XS[i], 960, 110, ANS[i], 'good' if ANS[i] else 'dim', pop_in(lt, (P_ARC + 1.2) if i == 2 else (P_ZERO + 0.3 if i == 5 else P_ZERO + 1.6 + i * 0.06)), font='mono')
    z = ease_out(prog(lt, P_ZERO + 0.3, P_ZERO + 0.7))
    label_pill(dl, dg, XS[5] - 60, 1080, 'never warmer → 0', MUTED, size=32, alpha=z, w=380)
    if lt > P_ZERO + 1.8:
        rich(dl, [('answer = ', MUTED), ('[1, 4, 2, 1, 1, 0]', TEAL)], 1230, 'mono', 48, ease_out(prog(lt, P_ZERO + 1.8, P_ZERO + 2.2)))


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Scan forward from each day', col=MUTED, size=60)
    k = int((lt - B_SCAN) / 0.35) if lt >= B_SCAN else -1
    for i in range(6):
        mode = 'idle'
        if lt < B_STAMP:
            if i == 0 and k >= 0: mode = 'active'
            if 1 <= i <= min(k, 1): mode = 'hot'
        tcell(dl, dg, XS[i], 720, i, mode, pop_in(lt, i * 0.05))
    if 0 <= k and lt < B_STAMP:
        # pointer j walking right from day 1 (shows repeated rescans)
        j = 1 + (k % 5)
        for D in (dl, dg): arrow_up(D, XS[j], 810, CORAL)
        text(dl, 'j', 'mono', 36, XS[j], 875, CORAL)
        text(dl, 'for every i, walk j →', 'monor', 38, W / 2, 960, MUTED)
    big_o_stamp(L, G, dl, lt, B_STAMP, 'O(n²)', cy=1120)
    text(dl, 'falling temps = rescans everything', 'monor', 34, W / 2, 1260, MUTED, alpha=ease_out(prog(lt, B_STAMP + 0.4, B_STAMP + 0.8)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0:
        gtext(L, G, 'MONOTONIC', 'black', 120, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
        gtext(L, G, 'STACK', 'black', 120, W / 2, 650, scale=back(b), alpha=clamp(b * 2))
    a = ease_out(prog(lt, I_HOLD, I_HOLD + 0.4))
    stack_box(dl, dg, a)
    # waiting days: 38, 34, 32 sitting in the stack, then 36 arrives and knocks out 32, 34
    for j, i in enumerate((1, 2, 3)):
        f = ease_out(prog(lt, I_HOLD + 0.3 + j * 0.3, I_HOLD + 0.6 + j * 0.3))
        if f <= 0: continue
        out = prog(lt, I_HOT + 0.8 + (2 - j) * 0.5, I_HOT + 1.2 + (2 - j) * 0.5) if i in (2, 3) else 0
        if out >= 1: continue
        x = lerp(STK_X, STK_X + 330, ease_in_out(out)); y = lerp(lerp(800, slot_y(j), f), 830, ease_in_out(out))
        tcell(dl, dg, x, y, i, 'found' if out > 0 else 'idle', size=CH_W, h=CH_H, alpha=1 - 0.6 * out)
    h = prog(lt, I_HOT, I_HOT + 0.4)
    if h > 0:
        tcell(dl, dg, STK_X - 330, 830, 4, 'hot', back(h), size=150)
        label_pill(dl, dg, STK_X - 330, 945, 'hotter day', CORAL, size=28, alpha=ease_out(h), w=230)


def stack_state(lt):
    st, ans = [], {}
    for tt, kind, i in EV:
        if lt < tt: break
        if kind == 'push': st.append(i)
        else:
            st.remove(i)
    return st

def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    cy = 540
    answered = {i: tt for tt, kind, i in EV if kind == 'pop' and lt >= tt + 0.45}
    for i in range(6):
        mode = 'idle'
        if i < k: mode = 'done'
        if i == k: mode = 'active' if k < 6 else 'done'
        if i in answered and i != k: mode = 'done'
        tcell(dl, dg, XS[i], cy, i, mode, pop_in(lt, i * 0.05))
    if 0 <= k < 6:
        prev = XS[k - 1] if k > 0 else XS[0]
        px = lerp(prev, XS[k], ease_in_out(prog(u, 0, 0.3)))
        for D in (dl, dg): arrow_up(D, px, cy + 82, ORANGE)
    # answer row
    a = ease_out(prog(lt, 0.3, 0.6))
    for i in range(6):
        if i in answered:
            cell(dl, dg, XS[i], 720, 110, ANS[i], 'good', pop_in(lt, answered[i] + 0.45), font='mono')
        elif k == 6 and i == 5:
            cell(dl, dg, XS[i], 720, 110, 0, 'dim', pop_in(u, 0.4), font='mono')
        else:
            cell(dl, dg, XS[i], 720, 110, '·', 'dim', alpha=a, font='mono')
    # gap arcs for recent answers
    for tt, kind, i in EV:
        if kind != 'pop': continue
        d = lt - tt
        if 0 <= d < 1.6:
            j = i + ANS[i]
            arc(dl, dg, XS[i], XS[j], 450, 60 + 18 * ANS[i], GOLD, ease_out(prog(d, 0, 0.4)), f'+{ANS[i]}', width=5)
    # stack
    stack_box(dl, dg, ease_out(prog(lt, 0.3, 0.7)), glow=(k == 6))
    st = stack_state(lt)
    for j, i in enumerate(st):
        mode = 'idle'
        if k == 4 and STOP_AT <= lt < STOP_AT + 1.2 and i == 1: mode = 'hot'
        tcell(dl, dg, STK_X, slot_y(j), i, mode, size=CH_W, h=CH_H)
    for tt, kind, i in EV:
        d = lt - tt
        if not 0 <= d < 0.45: continue
        f = ease_in_out(d / 0.45)
        if kind == 'push':   # fly from row into the stack
            jj = len(st) - 1
            if i in st: jj = st.index(i)
            x = lerp(XS[i], STK_X, f); y = lerp(cy, slot_y(jj), f) - math.sin(f * math.pi) * 80
            tcell(dl, dg, x, y, i, 'active', size=lerp(140, CH_W, f), h=lerp(140, CH_H, f))
        else:                 # popped: fly up to its answer cell
            jj = len(st)
            x = lerp(STK_X, XS[i], f); y = lerp(slot_y(jj), 720, f)
            tcell(dl, dg, x, y, i, 'found', size=lerp(CH_W, 110, f), h=lerp(CH_H, 110, f), alpha=1 - f * 0.5)
    # status line
    if 0 <= k < 6:
        qa = ease_out(prog(u, 0.15, 0.4))
        top = st[-1] if st else None
        if k in (1, 4, 5):
            rich(dl, [(f'{TEMPS[k]}°', tcol(TEMPS[k])), ('  >  top?  ', WHITE), ('pop', CORAL)], 870, 'xb', 50, qa)
        elif k == 0:
            rich(dl, [('stack empty:  ', WHITE), ('push', TEAL)], 870, 'xb', 50, qa)
        else:
            rich(dl, [(f'{TEMPS[k]}°', tcol(TEMPS[k])), (' is colder:  ', WHITE), ('push', TEAL)], 870, 'xb', 50, qa)
        if k == 4 and lt >= STOP_AT:
            label_pill(dl, dg, W / 2, 960, '38° is warmer: stop', GOLD, size=32, alpha=ease_out(prog(lt, STOP_AT, STOP_AT + 0.3)) * (1 - prog(lt, STOP_AT + 1.6, STOP_AT + 1.9)), w=440)
    if k == 6:
        text(dl, 'answer', 'monor', 34, W / 2, 850, MUTED, alpha=ease_out(prog(u, 0.6, 0.9)))
        result_badge(L, G, dl, W / 2, 940, '[1, 4, 2, 1, 1, 0]', u - 1.0, w=680, h=120, size=50)
        burst(dl, dg, W / 2, 940, u - at(6, 'Done') + WSTEPS[6][0])


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
