"""LeetCode 242 — Valid Anagram (string + counting)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Strings · Easy',
    CODE=[
        'bool isAnagram(string s, string t) {',
        '    if (s.size() != t.size()) return false;',
        '    int count[26] = {0};',
        "    for (char c : s) count[c - 'a']++;",
        "    for (char c : t) count[c - 'a']--;",
        '    for (int x : count)',
        '        if (x != 0) return false;',
        '    return true;',
        '}',
    ],
    CODE_TITLE='C++  ·  count letters',
    FN={'isAnagram', 'size'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(1)')],
    CAPTION_GOLD={'count', 'counts', 'letters', 'letter', 'anagram', 'nagaram', 'zero', 'three', 'one', 'sort',
                  'add', 'subtract', 'twenty', 'six', 'counters'},
    CAPTION_CORAL={'false', 'log'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [1]), (fr('Make'), [2]), (fr('Add one'), [3]), (fr('Subtract'), [4]),
                       (fr('If any'), [5, 6]), (fr('Otherwise'), [7])]

S, T = 'anagram', 'nagaram'
LET = ['a', 'g', 'm', 'n', 'r']
LCOL = {'a': GOLD, 'g': TEAL, 'm': VIOLET, 'n': BLUE, 'r': CORAL}

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_T = 0.2 + vo_at('problem', 'Anagram and'); P_F = 0.2 + vo_at('problem', 'Rat and')
sfx.append((ps + P_T + 1.2, 'ding')); sfx.append((ps + P_F + 1.0, 'buzz'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_SORT = 0.2 + vo_at('brute', 'sort'); B_STAMP = 0.2 + vo_at('brute', 'sorting costs')
sfx.append((bs + B_SORT + 0.4, 'whoosh')); sfx.append((bs + B_SORT + 1.6, 'ding')); sfx.append((bs + B_STAMP + 0.4, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_ADD = 0.2 + vo_at('idea', 'Add one'); I_SUB = 0.2 + vo_at('idea', 'Subtract'); I_ZERO = 0.2 + vo_at('idea', 'If every')
sfx.append((isd + 0.5, 'pop')); sfx.append((isd + I_ADD, 'pop')); sfx.append((isd + I_SUB, 'pop')); sfx.append((isd + I_ZERO, 'ding'))
ws, WSTEPS = steps_scene('walk', ['w0', 'w1', 'w2'], intro=0.8, gap=0.6, last_extra=1.8,
                         extra_gap={0: max(0, 7 * 0.45 + 0.8 - VODUR['w0']), 1: max(0, 7 * 0.45 + 0.8 - VODUR['w1'])})
STEP_GAP = 0.45
SCAN0 = 0.6
def scan_t(k, j): return WSTEPS[k][0] + SCAN0 + j * STEP_GAP
for j in range(7):
    sfx.append((ws + scan_t(0, j), 'pop')); sfx.append((ws + scan_t(1, j), 'tick'))
sfx.append((ws + WSTEPS[2][0] + 1.0, 'ding')); sfx.append((ws + WSTEPS[2][0] + 0.1 + vo_at('w2', 'Return'), 'win'))
E.SPOTS.append((ws + scan_t(0, 5) + 0.05, 1.4, row_x(5, 130, 50)[0], 1130, 230))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def word(dl, dg, s, cy, size=118, gap=14, lt=9, active=None, done=0, t0=0.0, colored=True, alpha=1.0):
    xs = row_x(len(s), size, gap)
    for i, ch in enumerate(s):
        col = LCOL.get(ch, MUTED)
        if i == active: colors = (ORANGE, (44, 32, 26), GOLD); glow = True
        elif i < done: colors = ((40, 48, 70), (16, 20, 34), tuple(int(c * 0.55) for c in col)); glow = False
        else: colors = (tuple(int(c * 0.6) for c in col) if colored else CELL_LINE, tint(col, 0.1) if colored else CELL, col if colored else WHITE); glow = False
        cell(dl, dg, xs[i], cy, size, ch, s=pop_in(lt, t0 + i * 0.05), colors=colors, glow=glow, font='mono', alpha=alpha)
    return xs

BAR_X = row_x(5, 130, 50)
BASE, UNIT = 1290, 105
def bars(dl, dg, heights, a=1.0, hot=None, zero_check=0.0):
    """heights: dict letter -> float count (animated)."""
    if a <= 0.01: return
    dl.line([(110, BASE), (W - 110, BASE)], fill=rgba(CELL_LINE, a), width=4)
    for i, ch in enumerate(LET):
        x = BAR_X[i]; h = heights.get(ch, 0)
        col = LCOL[ch]
        if h > 0.02:
            top = min(BASE - h * UNIT, BASE - 8)
            dl.rounded_rectangle((x - 52, top, x + 52, BASE - 3), radius=16, fill=rgba(tint(col, 0.45), a), outline=rgba(col, a), width=4)
            if ch == hot: dg.rounded_rectangle((x - 52, top, x + 52, BASE - 3), radius=16, outline=rgba(col, a), width=8)
            text(dl, str(int(round(h))), 'black', 52, x, top - 40, col, alpha=a)
        else:
            text(dl, '0', 'black', 52, x, BASE - 42, MUTED if zero_check <= 0 else TEAL, alpha=a)
        text(dl, ch, 'mono', 50, x, BASE + 48, col, alpha=a)
        if zero_check > 0:
            q = prog(zero_check, i * 0.12, i * 0.12 + 0.35)
            if q > 0:
                for D in (dl, dg): check_mark(D, x, BASE - 115, 34, rgba(TEAL), 9, q)


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'SAME', 'black', 130, W / 2, 450, WHITE)
    gtext(L, G, 'LETTERS?', 'black', 150, W / 2, 600)
    for r, s in enumerate((S, T)):
        bob = math.sin(lt * 2.5 + r * 1.5) * 6 * prog(lt, 1.4, 2.0)
        word(dl, dg, s, 810 + r * 250 + bob, 120, 14, lt, t0=0.25 + r * 0.4)
    q = prog(lt, 1.8, 2.2)
    if q > 0: gtext(L, G, '= ?', 'black', 80, W / 2, 935, scale=back(q))
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1300 + (1 - tg) * 30, 'LeetCode 242 · Valid Anagram', WHITE, 'sb', 36, tg, w=680, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Same letters, same counts', size=64)
    for r, (a_, b_, ok, t0, tv) in enumerate([(S, T, True, 0.5, P_T + 1.2), ('rat', 'car', False, P_F, P_F + 1.0)]):
        y = 660 + r * 360
        if lt < t0 - 0.1: continue
        word(dl, dg, a_, y, 100, 12, lt, t0=t0)
        word(dl, dg, b_, y + 120, 100, 12, lt, t0=t0 + 0.3)
        ea = prog(lt, tv, tv + 0.3)
        label_pill(dl, dg, W / 2, y + 225, 'true' if ok else 'false', TEAL if ok else CORAL, size=40, alpha=ease_out(ea), w=200, glow=True)
        if not ok and ea > 0:
            xs = row_x(3, 100, 12)
            for D in (dl, dg):
                cross_mark(D, xs[1], y - 2, 38, rgba(CORAL), 9, ea); cross_mark(D, xs[0], y + 118, 38, rgba(CORAL), 9, ea)


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'ONE WAY', 'Sort both, compare', col=MUTED)
    srt = ''.join(sorted(S))
    f = ease_in_out(prog(lt, B_SORT + 0.3, B_SORT + 1.2))
    size, gap = 104, 12
    for r, s in enumerate((S, T)):
        y = 680 + r * 150
        xs = row_x(7, size, gap)
        # each letter slides from its original slot to its sorted slot
        order = sorted(range(7), key=lambda i: (s[i], i))
        dest = {i: rank for rank, i in enumerate(order)}
        for i, ch in enumerate(s):
            x = lerp(xs[i], xs[dest[i]], f)
            yy = y - math.sin(f * math.pi) * (30 if (i % 2) else -30)
            col = LCOL[ch]
            cell(dl, dg, x, yy, size, ch, s=pop_in(lt, i * 0.04), colors=(tuple(int(c * 0.6) for c in col), tint(col, 0.1), col), font='mono')
    ok = prog(lt, B_SORT + 1.6, B_SORT + 1.9)
    if ok > 0: label_pill(dl, dg, W / 2, 965, 'equal  ✓', TEAL, size=38, alpha=ease_out(ok), w=260, glow=True)
    big_o_stamp(L, G, dl, lt, B_STAMP + 0.4, 'O(n log n)', cy=1170, size=140)
    text(dl, 'works — but we can do better', 'sb', 40, W / 2, 1310, MUTED, alpha=ease_out(prog(lt, B_STAMP + 0.9, B_STAMP + 1.3)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'COUNT IT', 'black', 140, W / 2, 545, scale=back(b), alpha=clamp(b * 2))
    a1 = prog(lt, I_ADD, I_ADD + 0.35); a2 = prog(lt, I_SUB, I_SUB + 0.35)
    if a1 > 0: label_pill(dl, dg, W / 2 - 220, 720, 's  →  +1', TEAL, size=44, alpha=ease_out(a1), w=340, glow=True)
    if a2 > 0: label_pill(dl, dg, W / 2 + 220, 720, 't  →  −1', CORAL, size=44, alpha=ease_out(a2), w=340, glow=True)
    # tiny demo: 'a' bar goes up 3 then down 3
    h = {}
    hu = clamp((lt - I_ADD - 0.3) / 1.2) * 3
    hd = clamp((lt - I_SUB - 0.3) / 1.2) * 3
    h['a'] = max(0, hu - hd)
    h['n'] = clamp((lt - I_ADD - 0.6) / 0.4) - clamp((lt - I_SUB - 0.6) / 0.4)
    bars(dl, dg, h, ease_out(prog(lt, I_ADD - 0.4, I_ADD)), hot='a', zero_check=lt - I_ZERO if lt > I_ZERO else 0)
    z = prog(lt, I_ZERO + 0.6, I_ZERO + 1.0)
    if z > 0:
        grad_pill(L, G, W / 2, 870, 640, 110, scale=back(z))
        text(dl, 'all zero → anagram', 'mono', 44 * back(z), W / 2, 870, INK_ON_GRAD)


def counts_at(lt, steps):
    h = {c: 0.0 for c in LET}
    for k, s in ((0, S), (1, T)):
        for j, ch in enumerate(s):
            p = ease_out(prog(lt, scan_t(k, j), scan_t(k, j) + 0.25))
            h[ch] += p if k == 0 else -p
    return h

def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'COUNT UP · COUNT DOWN')
    k, u = step_at(lt, steps)
    act0 = act1 = None
    done0 = done1 = 0
    for j in range(7):
        if lt >= scan_t(0, j): act0 = j; done0 = j
        if lt >= scan_t(1, j): act1 = j; done1 = j
    if k >= 1: act0 = None; done0 = 7
    if k >= 2: act1 = None; done1 = 7
    if k < 1: act1 = None; done1 = 0
    text(dl, 's', 'mono', 40, 50, 560, TEAL); text(dl, 't', 'mono', 40, 50, 700, CORAL)
    xs = word(dl, dg, S, 560, 108, 14, lt, active=act0, done=done0)
    word(dl, dg, T, 700, 108, 14, lt, active=act1, done=done1, t0=0.2)
    h = counts_at(lt, steps)
    hot = None
    if act0 is not None: hot = S[act0]
    if act1 is not None: hot = T[act1]
    # flying +1 / −1 tags
    for kk, s in ((0, S), (1, T)):
        for j, ch in enumerate(s):
            d = lt - scan_t(kk, j)
            if 0 <= d < 0.5:
                bx = BAR_X[LET.index(ch)]
                sx = xs[j]; sy = 560 + kk * 140
                f = ease_out(clamp(d / 0.4))
                text(dl, '+1' if kk == 0 else '−1', 'black', 54, lerp(sx, bx, f), lerp(sy + 60, 880, f), TEAL if kk == 0 else CORAL, alpha=1 - prog(d, 0.35, 0.5))
    zc = (u - 0.9) if k == 2 else 0
    bars(dl, dg, h, ease_out(prog(lt, 0.3, 0.7)), hot=hot, zero_check=zc)
    if k == 0 and lt > scan_t(0, 5):
        label_pill(dl, dg, BAR_X[0] + 150, BASE - 3 * UNIT - 50, 'a × 3', GOLD, size=32, alpha=ease_out(prog(lt, scan_t(0, 5), scan_t(0, 5) + 0.3)), w=170)
    if k == 2:
        result_badge(L, G, dl, W / 2, 860, 'return true', u - 0.1 - vo_at('w2', 'Return') + 0.3, w=560, h=120, size=54)
        burst(dl, dg, W / 2, 860, u - 0.1 - vo_at('w2', 'Return') + 0.15)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
