"""LeetCode 3 — Longest Substring Without Repeating Characters (sliding window)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Sliding Window · Medium',
    CODE=[
        'int lengthOfLongestSubstring(string s) {',
        '    unordered_set<char> win;',
        '    int l = 0, best = 0;',
        '    for (int r = 0; r < s.size(); r++) {',
        '        while (win.count(s[r]))',
        '            win.erase(s[l++]);',
        '        win.insert(s[r]);',
        '        best = max(best, r - l + 1);',
        '    }',
        '    return best;',
        '}',
    ],
    CODE_TITLE='C++  ·  sliding window + set',
    FN={'lengthOfLongestSubstring', 'count', 'erase', 'insert', 'max', 'size'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(k)')],
    CAPTION_GOLD={'window', 'sliding', 'shrink', 'grow', 'repeat', 'repeats', 'three', 'one', 'length', 'unique', 'add', 'remove',
                  'best', 'left', 'right', 'set'},
    CAPTION_CORAL={'cubed', 'slow.', 'repeat!', 'already'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [3]), (fr('While'), [4, 5]), (fr('Then add'), [6, 7])]

S = 'abcabb'
LCOL = {'a': GOLD, 'b': TEAL, 'c': VIOLET}
XS = row_x(6, 136, 22)
CY = 700

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_SUB = 0.2 + vo_at('problem', 'A substring'); P_ANS = 0.2 + vo_at('problem', 'is a b c')
sfx.append((ps + P_SUB + 0.4, 'pop')); sfx.append((ps + P_ANS, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_ALL = 0.2 + vo_at('brute', 'every substring'); B_STAMP = 0.2 + vo_at('brute', "That's O")
for k in range(8): sfx.append((bs + B_ALL + k * 0.22, 'tick'))
sfx.append((bs + B_STAMP, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_GROW = 0.2 + vo_at('idea', 'Grow'); I_SHRINK = 0.2 + vo_at('idea', 'When a')
sfx.append((isd + 0.5, 'pop')); sfx.append((isd + I_GROW + 0.3, 'whoosh')); sfx.append((isd + I_SHRINK + 0.6, 'buzz'))
KEYS = [f'w{i}' for i in range(6)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8, extra_gap={4: 0.5})
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
# (time, l, r, dup)
KF = [(at(0, 'Add a'), 0, 0, False),
      (at(1, 'Add b'), 0, 1, False), (at(1, 'then c'), 0, 2, False),
      (at(2, 'Next is'), 0, 3, True), (at(2, 'Remove a'), 1, 3, False),
      (at(3, 'Add b'), 1, 4, True), (at(3, 'Shrink'), 2, 4, False),
      (at(4, 'Add b'), 2, 5, True), (at(4, 'Shrink'), 3, 5, True), (at(4, 'Shrink', 0.45), 4, 5, True), (at(4, 'Shrink', 0.9), 5, 5, False)]
BEST = [(at(0, 'Add a'), 1), (at(1, 'Add b'), 2), (at(1, 'then c'), 3)]
for tt, l, r, dup in KF: sfx.append((ws + tt, 'buzz' if dup and (l, r) in ((0, 3), (1, 4), (2, 5)) else 'tick' if dup else 'pop'))
sfx.append((ws + at(1, 'Length three'), 'ding'))
sfx.append((ws + at(5, 'answer'), 'win'))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def chars(dl, dg, lt, xs=XS, cy=CY, size=136, states=None, t0=0.0):
    states = states or {}
    for i, ch in enumerate(S):
        col = LCOL[ch]
        st = states.get(i, 'idle')
        if st == 'idle': colors, glow = (tuple(int(c * 0.6) for c in col), tint(col, 0.1), col), False
        elif st == 'in': colors, glow = (col, tint(col, 0.3), WHITE), False
        elif st == 'dup': colors, glow = (CORAL, (58, 22, 30), WHITE), True
        else: colors, glow = ((40, 48, 70), (16, 20, 34), tuple(int(c * 0.45) for c in col)), False
        cell(dl, dg, xs[i], cy, size, ch, s=pop_in(lt, t0 + i * 0.05), colors=colors, glow=glow, font='mono')
        text(dl, str(i), 'monor', 28, xs[i], cy + size / 2 + 30, MUTED, alpha=clamp(lt * 3))

def window(dl, dg, x0, x1, cy=CY, size=136, col=GOLD, a=1.0, label=None):
    if a <= 0.01: return
    pad = 16
    box = (x0 - size / 2 - pad, cy - size / 2 - pad, x1 + size / 2 + pad, cy + size / 2 + pad)
    dl.rounded_rectangle(box, radius=30, fill=rgba(col, 0.10 * a), outline=rgba(col, a), width=6)
    dg.rounded_rectangle(box, radius=30, outline=rgba(col, 0.8 * a), width=8)
    if label: label_pill(dl, dg, (box[0] + box[2]) / 2, box[1] - 44, label, col, size=30, alpha=a, w=max(170, F('mono', 30).getlength(label) + 50))

def kf_at(lt):
    prev = cur = (0, 0, False); tc = 0; seen = False
    for tt, l, r, dup in KF:
        if lt >= tt: prev, cur, tc, seen = cur, (l, r, dup), tt, True
    f = ease_in_out(prog(lt, tc, tc + 0.3))
    return seen, cur, lerp(XS[prev[0]], XS[cur[0]], f), lerp(XS[prev[1]], XS[cur[1]], f)


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'LONGEST WITH', 'black', 104, W / 2, 450, WHITE)
    gtext(L, G, 'NO REPEATS?', 'black', 132, W / 2, 585)
    ph = max(0, lt - 1.2)
    l = 0; r = min(2, int(ph * 2.2))
    if lt > 1.2: window(dl, dg, XS[l], XS[r], cy=880, a=ease_out(prog(lt, 1.2, 1.5)), label=f'len {r - l + 1}')
    chars(dl, dg, lt, cy=880, t0=0.2)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1200 + (1 - tg) * 30, 'LeetCode 3 · Longest Substring', WHITE, 'sb', 34, tg, w=660, fill=(24, 31, 52))
    text(dl, 'without repeating characters', 'sb', 36, W / 2, 1290, MUTED, alpha=tg)


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'All characters different')
    st = {i: 'in' for i in range(3)} if lt > P_ANS else {}
    a = ease_out(prog(lt, P_SUB + 0.3, P_SUB + 0.7))
    window(dl, dg, XS[1], XS[3], cy=760, col=MUTED, a=a * (1 - prog(lt, P_ANS - 0.4, P_ANS)), label='continuous')
    if lt > P_ANS:
        window(dl, dg, XS[0], XS[2], cy=760, a=ease_out(prog(lt, P_ANS, P_ANS + 0.3)), label='a b c')
    chars(dl, dg, lt, cy=760, t0=0.2, states=st)
    if lt > P_ANS:
        result_badge(L, G, dl, W / 2, 1060, 'length 3', lt - P_ANS - 0.3, w=440, h=120, size=54)


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Check every substring', col=MUTED)
    subs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (1, 4), (2, 4), (2, 5)]
    k = int((lt - B_ALL) / 0.22) if lt >= B_ALL else -1
    if 0 <= k and lt < B_STAMP:
        l, r = subs[min(k, len(subs) - 1)]
        window(dl, dg, XS[l], XS[r], cy=700, col=CORAL)
    chars(dl, dg, lt, cy=700)
    if 0 <= k and lt < B_STAMP:
        text(dl, f'substrings: {min(k + 1, 8)}  ... n²  × check n', 'monor', 36, W / 2, 900, MUTED)
    big_o_stamp(L, G, dl, lt, B_STAMP, 'O(n³)', cy=1120)


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'SLIDING WINDOW', 'black', 104, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
    g = ease_in_out(prog(lt, I_GROW + 0.3, I_GROW + 1.2))
    s_ = ease_in_out(prog(lt, I_SHRINK + 0.9, I_SHRINK + 1.6))
    r = lerp(0, 3, g); l = lerp(0, 1, s_)
    dup = I_SHRINK + 0.6 < lt < I_SHRINK + 1.6
    st = {0: 'dup', 3: 'dup'} if dup else {}
    if lt > I_GROW: window(dl, dg, XS[0] + (XS[1] - XS[0]) * l, XS[0] + (XS[1] - XS[0]) * r, cy=820, col=CORAL if dup else GOLD, a=ease_out(prog(lt, I_GROW, I_GROW + 0.3)))
    chars(dl, dg, lt, cy=820, states=st)
    a1 = ease_out(prog(lt, I_GROW + 0.3, I_GROW + 0.6))
    label_pill(dl, dg, W / 2 + 220, 1060, 'grow right  →', TEAL, size=34, alpha=a1, w=340)
    a2 = ease_out(prog(lt, I_SHRINK + 0.6, I_SHRINK + 0.9))
    label_pill(dl, dg, W / 2 - 220, 1060, '→  shrink left', CORAL, size=34, alpha=a2, w=340, glow=True)
    a3 = ease_out(prog(lt, I_SHRINK + 1.8, I_SHRINK + 2.2))
    text(dl, 'window stays unique', 'xb', 52, W / 2, 1200, WHITE, alpha=a3)


def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    seen, (l, r, dup), x0, x1 = kf_at(lt)
    st = {}
    if seen:
        for i in range(6):
            if i < l: st[i] = 'out'
            elif l <= i <= r: st[i] = 'in'
        if dup:
            st[r] = 'dup'
            for i in range(l, r):
                if S[i] == S[r]: st[i] = 'dup'
    if k == 5: st = {i: ('in' if i < 3 else 'out') for i in range(6)}
    if seen and k < 5:
        window(dl, dg, x0, x1, col=CORAL if dup else GOLD, label=('repeat!' if dup else f'len {r - l + 1}'))
    if k == 5: window(dl, dg, XS[0], XS[2], col=TEAL, label='a b c')
    chars(dl, dg, lt, states=st)
    if seen and k < 5:
        for D in (dl, dg):
            arrow_up(D, x0, CY + 110, TEAL); arrow_up(D, x1, CY + 110, ORANGE)
        text(dl, 'l', 'mono', 36, x0 - (24 if abs(x0 - x1) < 5 else 0), CY + 175, TEAL)
        text(dl, 'r', 'mono', 36, x1 + (24 if abs(x0 - x1) < 5 else 0), CY + 175, ORANGE)
    # set chips
    a = ease_out(prog(lt, 0.3, 0.6))
    text(dl, 'set', 'mono', 32, 110, 1020, TEAL, alpha=a)
    members = [S[i] for i in range(l, r + 1)] if seen else []
    if dup: members = members[:-1]
    cx = row_x(max(1, len(members)), 100, 16)
    for j, ch in enumerate(members):
        cell(dl, dg, cx[j], 1020, 100, ch, colors=(LCOL[ch], tint(LCOL[ch], 0.2), WHITE), font='mono', glow=False)
    if not members: text(dl, '{ }', 'mono', 50, W / 2, 1020, MUTED, alpha=a)
    best = 0
    for tt, v in BEST:
        if lt >= tt: best = v
    bump = 1 + 0.3 * max([0] + [1 - prog(lt, tt, tt + 0.4) for tt, v in BEST if lt >= tt])
    pill(dl, W / 2, 470, 380, 92, (20, 26, 44), GOLD, width=4)
    text(dl, 'best:', 'xb', 44, W / 2 - 60, 472, WHITE)
    text(dl, str(best), 'black', 60 * bump, W / 2 + 90, 470, GOLD)
    if k == 5:
        result_badge(L, G, dl, W / 2, 1220, 'answer = 3', lt - at(5, 'answer'), w=520, h=120, size=54)
        burst(dl, dg, W / 2, 1220, lt - at(5, 'answer') - 0.1)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
