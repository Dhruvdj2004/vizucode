"""LeetCode 232 — Implement Queue using Stacks (queue)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Queue · Easy',
    CODE=[
        'class MyQueue {',
        '    stack<int> in, out;',
        'public:',
        '    void push(int x) { in.push(x); }',
        '    void move() {',
        '        if (out.empty())',
        '            while (!in.empty()) {',
        '                out.push(in.top()); in.pop();',
        '            }',
        '    }',
        '    int pop()  { move(); int x = out.top(); out.pop(); return x; }',
        '    int peek() { move(); return out.top(); }',
        '};',
    ],
    CODE_TITLE='C++  ·  two stacks',
    KW={'bool', 'int', 'for', 'if', 'else', 'return', 'void', 'while', 'class', 'public'},
    FN={'push', 'pop', 'peek', 'move', 'empty', 'top', 'MyQueue'},
    COMPLEXITY=[('TIME', 'O(1)*'), ('SPACE', 'O(n)')],
    CAPTION_GOLD={'push', 'pop', 'peek', 'pour', 'stack', 'stacks', 'queue', 'in', 'out', 'one', 'two', 'three', 'four',
                  'first', 'last', 'reverses', 'empty'},
    CAPTION_CORAL={'n.'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [3]), (fr('For pop'), [10, 11]), (fr('if out'), [5, 6, 7]), (fr('Then use'), [10, 11])]

IN_X, OUT_X, BOT, SW, SH, SG = 300, 780, 1310, 230, 84, 96
def slot_y(j): return BOT - SG / 2 - 6 - j * SG
VCOL = {1: BLUE, 2: VIOLET, 3: TEAL, 4: GOLD}

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_Q = 0.2 + vo_at('problem', 'A queue'); P_S = 0.2 + vo_at('problem', 'A stack')
sfx.append((ps + P_Q + 0.4, 'pop')); sfx.append((ps + P_S + 0.4, 'pop'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_POUR = 0.2 + vo_at('brute', 'pour'); B_STAMP = 0.2 + vo_at('brute', 'each pop')
for k in range(6): sfx.append((bs + B_POUR + k * 0.3, 'tick'))
sfx.append((bs + B_STAMP + 0.3, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_TWO = 0.2 + vo_at('idea', 'use two'); I_PUSH = 0.2 + vo_at('idea', 'Push always'); I_POP = 0.2 + vo_at('idea', 'To pop')
I_POUR = 0.2 + vo_at('idea', 'Only when'); I_REV = 0.2 + vo_at('idea', 'Pouring')
for x in (I_TWO, I_PUSH, I_POP): sfx.append((isd + x, 'pop'))
sfx.append((isd + I_REV, 'ding'))
KEYS = [f'w{i}' for i in range(6)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8, extra_gap={1: 0.6})
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
POUR0 = at(1, 'pour')
EV = [(at(0, 'push one'), 'in', 1), (at(0, 'push two'), 'in', 2), (at(0, 'push three'), 'in', 3),
      (POUR0 + 0.2, 'pour', 0), (POUR0 + 0.65, 'pour', 0), (POUR0 + 1.1, 'pour', 0),
      (at(2, 'returns'), 'pop', 0), (at(3, 'Push four'), 'in', 4), (at(4, 'just pop'), 'pop', 0)]
OPS = [(WSTEPS[0][0], 'push(1) push(2) push(3)'), (WSTEPS[1][0], 'pop()'), (WSTEPS[3][0], 'push(4)'), (WSTEPS[4][0], 'pop()')]
for tt, kind, v in EV:
    sfx.append((ws + tt, {'in': 'pop', 'pour': 'tick', 'pop': 'ding'}[kind]))
sfx.append((ws + at(5, 'Every'), 'win'))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def vcell(dl, dg, x, y, v, mode='idle', w=SW, h=SH, s=1.0, alpha=1.0):
    col = VCOL.get(v, MUTED)
    if mode == 'idle': colors, glow = (tuple(int(c * 0.7) for c in col), tint(col, 0.16), col), False
    elif mode == 'active': colors, glow = (col, tint(col, 0.34), WHITE), True
    else: colors, glow = (GOLD, tint(GOLD, 0.3), WHITE), True
    cell(dl, dg, x, y, w, v, s=s, colors=colors, glow=glow, font='mono', h=h, alpha=alpha)

def stack_box(dl, dg, x, label, col, a=1.0, glow=False, n=4, bot=BOT, w=SW, gap=SG):
    if a <= 0.01: return
    top = bot - n * gap - 20
    x0, x1 = x - w / 2 - 24, x + w / 2 + 24
    for D, al in ((dl, a), (dg, a * 0.8 if glow else 0)):
        if al > 0: D.line([(x0, top), (x0, bot), (x1, bot), (x1, top)], fill=rgba(col, al), width=7, joint='curve')
    label_pill(dl, dg, x, bot + 48, label, col, size=30, alpha=a, w=150)


def replay(lt):
    ins, outs, ret = [], [], []
    for tt, kind, v in EV:
        if lt < tt: break
        if kind == 'in': ins.append(v)
        elif kind == 'pour': outs.append(ins.pop())
        else: ret.append(outs.pop())
    return ins, outs, ret


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'A QUEUE FROM', 'black', 104, W / 2, 450, WHITE)
    gtext(L, G, 'TWO STACKS?', 'black', 132, W / 2, 585)
    a = ease_out(prog(lt, 0.2, 0.6))
    stack_box(dl, dg, IN_X, 'in', TEAL, a, bot=1180)
    stack_box(dl, dg, OUT_X, 'out', CORAL, a, bot=1180)
    for j, v in enumerate((3, 2)):
        vcell(dl, dg, IN_X, 1180 - SG / 2 - 6 - j * SG, v, s=pop_in(lt, 0.5 + j * 0.15))
    # one element hops across, looping
    ph = (lt * 0.6) % 1.0
    f = ease_in_out(clamp(ph * 1.6))
    x = lerp(IN_X, OUT_X, f); y = lerp(1180 - SG * 2.5, 1180 - SG / 2 - 6, f) - math.sin(f * math.pi) * 160
    vcell(dl, dg, x, y, 1, 'active', s=pop_in(lt, 0.9))
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1340 + (1 - tg) * 30, 'LeetCode 232 · Queue using Stacks', WHITE, 'sb', 34, tg, w=720, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'FIFO with LIFO parts')
    # queue row
    a = ease_out(prog(lt, P_Q, P_Q + 0.4))
    text(dl, 'QUEUE', 'black', 50, W / 2, 610, TEAL, alpha=a)
    xs = row_x(4, 120, 16)
    for i, v in enumerate((1, 2, 3, 4)):
        vcell(dl, dg, xs[i], 720, v, w=120, h=120, s=pop_in(lt, P_Q + i * 0.08))
    text(dl, '← out', 'mono', 32, xs[0] - 50, 805, CORAL, alpha=a)
    text(dl, 'in ←', 'mono', 32, xs[3] + 40, 805, TEAL, alpha=a)
    label_pill(dl, dg, W / 2, 870, 'first in, first out', TEAL, size=32, alpha=a, w=420)
    # stack
    b = ease_out(prog(lt, P_S, P_S + 0.4))
    text(dl, 'STACK', 'black', 50, W / 2, 990, CORAL, alpha=b)
    stack_box(dl, dg, W / 2, 'in/out ↕', CORAL, b, n=3, bot=1340, w=200, gap=80)
    for j, v in enumerate((1, 2, 3)):
        vcell(dl, dg, W / 2, 1340 - 40 - 6 - j * 80, v, w=200, h=70, s=pop_in(lt, P_S + 0.2 + j * 0.1))
    label_pill(dl, dg, W / 2 + 330, 1200, 'last in, first out', CORAL, size=28, alpha=b, w=330)


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'SLOW WAY', 'Pour, pop, pour back', col=MUTED)
    # 3 items pour from left to right and back
    pos = {}
    t0 = B_POUR
    for j, v in enumerate((1, 2, 3)):
        # forward move order: 3,2,1 ; back order: 2,3 (after popping 1)
        pos[v] = (IN_X, slot_y(j) - 160)
    a = ease_out(prog(lt, 0.2, 0.6))
    stack_box(dl, dg, IN_X, 'A', TEAL, a, n=3, bot=BOT - 160)
    stack_box(dl, dg, OUT_X, 'B', CORAL, a, n=3, bot=BOT - 160)
    seq = [(3, 0, 0), (2, 1, 0), (1, 2, 0)]   # forward: v goes to B slot k
    for v, k, _ in seq:
        st = t0 + k * 0.3
        f = ease_in_out(prog(lt, st, st + 0.3))
        jA = v - 1
        x = lerp(IN_X, OUT_X, f); y = lerp(slot_y(jA) - 160, slot_y(k) - 160, f) - math.sin(f * math.pi) * 100
        gone = v == 1 and lt > t0 + 1.2
        back_t = t0 + 1.5 + (0 if v == 2 else 0.3)
        if v in (2, 3) and lt > back_t:
            g = ease_in_out(prog(lt, back_t, back_t + 0.3))
            kb = 0 if v == 2 else 1
            x = lerp(OUT_X, IN_X, g); y = lerp(slot_y(k) - 160, slot_y(kb) - 160, g) - math.sin(g * math.pi) * 100
        if gone:
            g = ease_out(prog(lt, t0 + 1.2, t0 + 1.5))
            vcell(dl, dg, OUT_X, lerp(slot_y(2) - 160, 660, g), 1, 'gold', alpha=1 - g * 0.3)
            continue
        vcell(dl, dg, x, y, v, s=pop_in(lt, 0.3 + jA * 0.1))
    big_o_stamp(L, G, dl, lt, B_STAMP + 0.3, 'O(n)', cy=1250, size=130)
    text(dl, 'per pop', 'xb', 44, W / 2 + 210, 1260, CORAL, alpha=ease_out(prog(lt, B_STAMP + 0.6, B_STAMP + 0.9)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, I_TWO, I_TWO + 0.4)
    if b > 0: gtext(L, G, 'IN  +  OUT', 'black', 120, W / 2, 540, scale=back(b), alpha=clamp(b * 2))
    stack_box(dl, dg, IN_X, 'in', TEAL, ease_out(prog(lt, I_TWO, I_TWO + 0.4)), glow=I_PUSH < lt < I_POP)
    stack_box(dl, dg, OUT_X, 'out', CORAL, ease_out(prog(lt, I_TWO, I_TWO + 0.4)), glow=I_POP < lt < I_POUR)
    pa = ease_out(prog(lt, I_PUSH, I_PUSH + 0.3))
    text(dl, 'push ↓', 'mono', 40, IN_X, 760, TEAL, alpha=pa)
    qa = ease_out(prog(lt, I_POP, I_POP + 0.3))
    text(dl, 'pop ↑', 'mono', 40, OUT_X, 760, CORAL, alpha=qa)
    # in holds 1,2,3; at pour they move over reversed
    for j, v in enumerate((1, 2, 3)):
        appear = pop_in(lt, I_PUSH + 0.2 + j * 0.25)
        k = 2 - j
        st = I_POUR + 0.4 + k * 0.35
        f = ease_in_out(prog(lt, st, st + 0.35))
        x = lerp(IN_X, OUT_X, f); y = lerp(slot_y(j), slot_y(k), f) - math.sin(f * math.pi) * 120
        vcell(dl, dg, x, y, v, 'active' if (v == 1 and lt > I_REV) else 'idle', s=appear)
    if lt > I_POUR:
        for D in (dl, dg): arrow_line(D, IN_X + 150, 880, OUT_X - 150, 880, GOLD, 7, p=ease_out(prog(lt, I_POUR, I_POUR + 0.4)))
        text(dl, 'pour', 'mono', 34, W / 2, 840, GOLD, alpha=ease_out(prog(lt, I_POUR, I_POUR + 0.4)))
    r = ease_out(prog(lt, I_REV, I_REV + 0.4))
    label_pill(dl, dg, W / 2, 660, 'oldest ends up on top!', GOLD, size=34, alpha=r, w=480, glow=True)


def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    op = None
    for tt, s in OPS:
        if lt >= tt: op = s
    if op and k < 5:
        rich(dl, [('q.', MUTED), (op, GOLD)], 430, 'mono', 52, ease_out(prog(lt, 0.1, 0.4)))
    ins, outs, ret = replay(lt)
    # returned values
    a = ease_out(prog(lt, 0.3, 0.6))
    text(dl, 'returned', 'monor', 30, W / 2, 530, MUTED, alpha=a)
    xs = row_x(max(1, len(ret)), 120, 20)
    popping = any(0 <= lt - tt < 0.45 and kind == 'pop' for tt, kind, v in EV)
    for j, v in enumerate(ret):
        if not (popping and j == len(ret) - 1): vcell(dl, dg, xs[j], 620, v, 'gold', w=120, h=120)
    if not ret: text(dl, '—', 'mono', 50, W / 2, 620, MUTED, alpha=a)
    out_empty = (k == 1 and lt < POUR0)
    stack_box(dl, dg, IN_X, 'in', TEAL, ease_out(prog(lt, 0.2, 0.6)), glow=k in (0, 3))
    stack_box(dl, dg, OUT_X, 'out', CORAL, ease_out(prog(lt, 0.2, 0.6)), glow=k in (1, 2, 4))
    moving = None
    for tt, kind, v in EV:
        d = lt - tt
        if 0 <= d < 0.45: moving = (tt, kind, d / 0.45)
    mk = moving[1] if moving else None
    for j, v in enumerate(ins):
        if not (mk == 'in' and j == len(ins) - 1): vcell(dl, dg, IN_X, slot_y(j), v)
    for j, v in enumerate(outs):
        if not (mk == 'pour' and j == len(outs) - 1):
            vcell(dl, dg, OUT_X, slot_y(j), v, 'active' if j == len(outs) - 1 and k in (1, 2, 4) else 'idle')
    if moving:
        tt, kind, f = moving
        f = ease_in_out(f)
        if kind == 'in':
            v = ins[-1]; tx, ty = IN_X, slot_y(len(ins) - 1)
            x = tx; y = lerp(700, ty, f)
            vcell(dl, dg, x, y, v, 'active')
        elif kind == 'pour':
            v = outs[-1]; j0 = len(ins); j1 = len(outs) - 1
            x = lerp(IN_X, OUT_X, f); y = lerp(slot_y(j0), slot_y(j1), f) - math.sin(f * math.pi) * 130
            vcell(dl, dg, x, y, v, 'active')
        else:
            v = ret[-1]; j0 = len(outs)
            x = lerp(OUT_X, xs[-1], f); y = lerp(slot_y(j0), 620, f)
            vcell(dl, dg, x, y, v, 'gold', w=lerp(SW, 120, f), h=lerp(SH, 120, f))
    # status
    msgs = {1: ('out is empty: pour!', GOLD), 2: ('first in, first out ✓', TEAL), 3: ('out untouched', MUTED), 4: ('out not empty: just pop', TEAL)}
    if k in msgs:
        m, c = msgs[k]
        if k != 1 or lt > POUR0 - 0.3:
            label_pill(dl, dg, W / 2, 780, m, c, size=34, alpha=ease_out(prog(u, 0.3, 0.6)), w=560, glow=k in (2, 4))
    if k == 5:
        result_badge(L, G, dl, W / 2, 790, 'O(1) amortized', u - 0.3, w=620, h=120, size=50)
        burst(dl, dg, W / 2, 790, lt - at(5, 'Every'))


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
