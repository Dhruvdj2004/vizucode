"""LeetCode 20 — Valid Parentheses (stack)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Stack · Easy',
    CODE=[
        'bool isValid(string s) {',
        '    unordered_map<char, char> match =',
        "        {{')', '('}, {']', '['}, {'}', '{'}};",
        '    stack<char> st;',
        '    for (char c : s) {',
        '        if (!match.count(c)) st.push(c);',
        '        else {',
        '            if (st.empty() || st.top() != match[c])',
        '                return false;',
        '            st.pop();',
        '        }',
        '    }',
        '    return st.empty();',
        '}',
    ],
    CODE_MARKS=[(0.0, [5]), (0.15, [6, 7, 8]), (0.72, [12])],
    FN={'isValid', 'count', 'push', 'empty', 'top', 'pop'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(n)')],
    CAPTION_GOLD={'push', 'pop', 'stack', 'match', 'opener', 'closer', 'round', 'curly', 'square', 'balanced'},
)

S = list('({[]})')
TYPE = {'(': BLUE, ')': BLUE, '{': VIOLET, '}': VIOLET, '[': GOLD, ']': GOLD}
PAIR = {3: 2, 4: 1, 5: 0}
MATCH_AT = {3: 1.45, 4: 0.9, 5: 0.9}   # when the VO says 'match' in each closer step

def bcell(dl, dg, cx, cy, ch, size=130, mode='idle', s=1.0, alpha=1.0, h=None):
    col = TYPE[ch]
    if mode == 'idle':   colors, glow = (tuple(int(c * 0.7) for c in col), tint(col, 0.12), col), False
    elif mode == 'active': colors, glow = (col, tint(col, 0.28), WHITE), True
    elif mode == 'done': colors, glow = ((40, 120, 112), (16, 36, 40), (110, 190, 180)), False
    else:                colors, glow = (CORAL, (58, 22, 30), WHITE), True
    cell(dl, dg, cx, cy, size, ch, s=s, alpha=alpha, font='mono', colors=colors, glow=glow, h=h)

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.7)
vo_scene('problem', 'problem', pad=0.7)
bs = vo_scene('brute', 'brute', pad=0.8)
for k in range(3): sfx.append((bs + 0.6 + k * 1.0 + 0.4, 'tick'))
sfx.append((bs + 4.3, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.6)
sfx.append((isd + 2.4, 'pop'))
ws, WSTEPS = steps_scene('walk', [f'w{i}' for i in range(7)], gap=0.5, last_extra=1.4)
for k, (s0, d) in enumerate(WSTEPS):
    if k < 3: sfx.append((ws + s0 + 0.95, 'pop'))
    elif k < 6: sfx.append((ws + s0 + MATCH_AT[k], 'ding'))
    else: sfx.append((ws + s0 + 0.7, 'win'))
vo_scene('code', 'code', pad=0.8)
os_ = vo_scene('outro', 'outro', pad=1.6)
sfx.append((os_ + 3.2, 'pop'))

# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'ARE THESE', 'black', 110, W / 2, 470, WHITE)
    gtext(L, G, 'BALANCED?', 'black', 130, W / 2, 610)
    xs = row_x(6, 140, 20)
    for i, ch in enumerate(S):
        bob = math.sin(lt * 3 + i) * 6 * prog(lt, 1.6, 2.2)
        bcell(dl, dg, xs[i], 900 + bob, ch, 140, 'idle', pop_in(lt, 0.25 + i * 0.09))
    q = prog(lt, 1.8, 2.2)
    if q > 0: gtext(L, G, '?', 'black', 150, W / 2, 1120, scale=back(q) * (1 + 0.06 * math.sin(lt * 6)))
    tg = ease_out(prog(lt, 2.6, 3.1))
    label_pill(dl, dg, W / 2, 1290 + (1 - tg) * 30, 'LeetCode 20 · Valid Parentheses', WHITE, 'sb', 34, tg, w=720,
               fill=(24, 31, 52))

def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE RULE')
    b = ease_out(prog(lt, 0.15, 0.5))
    text(dl, 'Every opener needs', 'xb', 70, W / 2, 500, WHITE, alpha=b)
    text(dl, 'the same type closer,', 'xb', 70, W / 2, 590, WHITE, alpha=b)
    c = prog(lt, 1.6, 2.0)
    if c > 0: gtext(L, G, 'in the right order.', 'black', 78, W / 2, 690, scale=back(c), alpha=clamp(c * 2))
    for r, (s, ok, t0) in enumerate([('([])', True, 3.5), ('([)]', False, 4.9)]):
        cy = 900 + r * 210
        xs = [180 + i * 120 for i in range(4)]
        for i, ch in enumerate(s):
            mode = 'idle'
            if not ok and i in (2, 3) and lt > t0 + 0.6: mode = 'bad'
            bcell(dl, dg, xs[i], cy, ch, 104, mode, pop_in(lt, t0 + i * 0.06))
        ea = ease_out(prog(lt, t0 + 0.4, t0 + 0.7))
        text(dl, '→', 'mono', 64, 680, cy, MUTED, alpha=ea)
        label_pill(dl, dg, 860, cy, 'true' if ok else 'false', TEAL if ok else CORAL, size=40, alpha=ea, w=210, glow=True)

BR_STAGES = ['({[]})', '({})', '()', '']
BR_REMOVE = [(2, 3), (1, 2), (0, 1)]
def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Delete pairs, repeat', col=MUTED)
    cy = 780; size = 120; gap = 18
    k = int(clamp((lt - 0.6) // 1.0, 0, 3)) if lt >= 0.6 else 0
    u = (lt - 0.6) - k * 1.0 if lt >= 0.6 else 0
    if k >= 3:
        k, u = 3, 1.0
    cur = BR_STAGES[k]
    if k < 3:
        rm = BR_REMOVE[k]
        x_from = row_x(len(cur), size, gap)
        keep = [i for i in range(len(cur)) if i not in rm]
        x_to = row_x(len(keep), size, gap) if keep else []
        slide = ease_in_out(prog(u, 0.45, 0.85))
        for i, ch in enumerate(cur):
            if i in rm:
                s = 1 - ease_out(prog(u, 0.4, 0.7))
                bcell(dl, dg, x_from[i], cy, ch, size, 'bad' if u > 0.1 else 'idle', s)
            else:
                j = keep.index(i)
                bcell(dl, dg, lerp(x_from[i], x_to[j], slide), cy, ch, size, 'idle')
    else:
        label_pill(dl, dg, W / 2, cy, 'empty  →  valid', TEAL, size=40, alpha=ease_out(prog(lt, 3.6, 3.9)), glow=True)
    n_pass = min(3, int(max(0, lt - 0.6) // 1.0) + (1 if lt >= 0.6 else 0))
    text(dl, f'pass {n_pass} — scan the whole string again', 'monor', 34, W / 2, 920, MUTED, alpha=prog(lt, 0.6, 0.9) * (1 - prog(lt, 3.5, 3.7)))
    big_o_stamp(L, G, dl, lt, 4.3, 'O(n²)', cy=1150)
    text(dl, 'n passes × n chars each', 'monor', 38, W / 2, 1290, MUTED, alpha=ease_out(prog(lt, 4.6, 5.0)))

STK_X, STK_BOTTOM, CH_W, CH_H, CH_GAP = W / 2, 1390, 230, 92, 104
def stack_box(dl, dg, alpha=1.0, glow=False, n_slots=3):
    top = STK_BOTTOM - n_slots * CH_GAP - 40
    x0, x1 = STK_X - CH_W / 2 - 30, STK_X + CH_W / 2 + 30
    for D, a in ((dl, alpha), (dg, alpha * 0.8 if glow else 0)):
        if a <= 0: continue
        D.line([(x0, top), (x0, STK_BOTTOM), (x1, STK_BOTTOM), (x1, top)], fill=rgba(TEAL, a), width=7, joint='curve')
    text(dl, 'stack', 'mono', 32, x1 + 70, STK_BOTTOM - 20, TEAL, alpha=alpha)
def slot_y(j): return STK_BOTTOM - CH_GAP / 2 - 6 - j * CH_GAP

def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'SMARTER IDEA', 'Use a')
    b = prog(lt, 0.8, 1.2)
    if b > 0: gtext(L, G, 'STACK', 'black', 150, W / 2, 680, scale=back(b), alpha=clamp(b * 2))
    c = ease_out(prog(lt, 1.6, 2.0))
    stack_box(dl, dg, c, glow=True)
    text(dl, 'push ↓', 'mono', 38, STK_X - 260, 1000, GOLD, alpha=c)
    text(dl, 'pop ↑', 'mono', 38, STK_X + 260, 1000, CORAL, alpha=c)
    for j, ch in enumerate('({'):
        t0 = 2.0 + j * 0.4
        f = ease_out(prog(lt, t0, t0 + 0.4))
        if f > 0: bcell(dl, dg, STK_X, lerp(860, slot_y(j), f), ch, CH_W, 'idle', h=CH_H)
    label_pill(dl, dg, W / 2, 870, 'last in, first out', GOLD, size=36, alpha=ease_out(prog(lt, 3.0, 3.4)))

def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'PUSH OPENERS · MATCH CLOSERS')
    k, u = step_at(lt, steps)
    xs = row_x(6, 130, 22); cy = 560
    matched = set()
    for c_ in range(3, 6):
        if k > c_ or (k == c_ and u > MATCH_AT[c_] + 0.8): matched |= {c_, PAIR[c_]}
    for i, ch in enumerate(S):
        mode = 'done' if i in matched else ('active' if i == k else 'idle')
        bcell(dl, dg, xs[i], cy, ch, 130, mode, pop_in(lt, i * 0.05))
    if 0 <= k < 6:
        prev = xs[k - 1] if k > 0 else xs[0]
        px = lerp(prev, xs[k], ease_in_out(prog(u, 0, 0.3)))
        for D in (dl, dg): arrow_up(D, px, cy + 85, ORANGE)
    # stack contents
    stack_box(dl, dg, ease_out(prog(lt, 0.2, 0.6)), glow=(k == 6))
    pushed = [i for i in range(3) if k > i or (k == i and u > 0.95)]
    popped = [c_ for c_ in range(3, 6) if k > c_ or (k == c_ and u > MATCH_AT[c_] + 0.8)]
    live = [i for i in pushed if i not in (PAIR[c_] for c_ in popped)]
    for j, i in enumerate(live):
        mode = 'idle'
        if 3 <= k < 6 and i == PAIR[k] and u > 0.5: mode = 'active'
        if 3 <= k < 6 and i == PAIR[k] and u > MATCH_AT[k] + 0.4:  # fly out of the stack toward its closer
            f = ease_in_out(prog(u, MATCH_AT[k] + 0.4, MATCH_AT[k] + 0.8))
            bcell(dl, dg, lerp(STK_X, xs[k], f), lerp(slot_y(j), cy, f), S[i], lerp(CH_W, 130, f), 'active', 1 - f * 0.6, h=lerp(CH_H, 130, f))
            continue
        bcell(dl, dg, STK_X, slot_y(j), S[i], CH_W, mode, h=CH_H)
    if 0 <= k < 3 and 0.5 < u < 0.95:   # flying in
        f = ease_in_out(prog(u, 0.5, 0.95))
        x = lerp(xs[k], STK_X, f); y = lerp(cy, slot_y(len(live)), f) - math.sin(f * math.pi) * 80
        bcell(dl, dg, x, y, S[k], lerp(130, CH_W, f), 'active', h=lerp(130, CH_H, f))
    # status line
    if 0 <= k < 6:
        qa = ease_out(prog(u, 0.15, 0.35))
        ch = S[k]
        if k < 3:
            rich(dl, [(f"'{ch}'", TYPE[ch]), ('  is an opener', WHITE)], 760, 'xb', 52, qa)
            label_pill(dl, dg, W / 2, 860, 'PUSH', TEAL, size=40, alpha=ease_out(prog(u, 0.4, 0.6)), w=220)
        else:
            op = S[PAIR[k]]
            rich(dl, [(f"'{ch}'", TYPE[ch]), ('  vs top  ', WHITE), (f"'{op}'", TYPE[op])], 760, 'xb', 52, qa)
            label_pill(dl, dg, W / 2, 860, 'match ✓  pop', TEAL, size=40, alpha=ease_out(prog(u, MATCH_AT[k], MATCH_AT[k] + 0.2)), w=340, glow=True)
    if k == 6:
        text(dl, 'stack is empty', 'xb', 56, W / 2, 760, TEAL, alpha=ease_out(prog(u, 0.1, 0.4)))
        result_badge(L, G, dl, W / 2, 880, 'return true', u - 0.6)
        burst(dl, dg, W / 2, 880, u - 0.7)

E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
