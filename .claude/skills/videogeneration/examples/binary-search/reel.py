"""LeetCode 704 — Binary Search."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Binary Search · Easy',
    CODE=[
        'int search(vector<int>& nums, int target) {',
        '    int lo = 0, hi = nums.size() - 1;',
        '    while (lo <= hi) {',
        '        int mid = lo + (hi - lo) / 2;',
        '        if (nums[mid] == target) return mid;',
        '        if (nums[mid] < target) lo = mid + 1;',
        '        else hi = mid - 1;',
        '    }',
        '    return -1;',
        '}',
    ],
    CODE_TITLE='C++  ·  halve every step',
    FN={'search', 'size'},
    COMPLEXITY=[('TIME', 'O(log n)'), ('SPACE', 'O(1)')],
    CAPTION_GOLD={'middle', 'half', 'low', 'high', 'mid', 'sixteen', 'twenty', 'three', 'thirty', 'eight', 'five', 'six',
                  'four', 'zero', 'found', 'sorted', 'target', 'million'},
    CAPTION_CORAL={'big!', 'small,', 'slow'},
    FX=True,
)
C = E.VOTEXT['code']
fr = lambda p: C.index(p) / len(C)
E.CFG['CODE_MARKS'] = [(0.0, [2, 3]), (fr('If it equals'), [4]), (fr("If it's smaller"), [5]), (fr('Otherwise'), [6])]

A = [2, 5, 8, 12, 16, 23, 38, 56, 72]
TGT = 23
XS = row_x(9, 100, 12)
CY = 720

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_FIND = 0.2 + vo_at('problem', 'find twenty'); sfx.append((ps + P_FIND + 0.3, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_SCAN = 0.2 + vo_at('brute', 'one element'); B_STAMP = 0.2 + vo_at('brute', "That's O")
for k in range(6): sfx.append((bs + B_SCAN + k * 0.3, 'tick'))
sfx.append((bs + B_STAMP, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_MID = 0.2 + vo_at('idea', 'look at'); I_L = 0.2 + vo_at('idea', 'too small'); I_R = 0.2 + vo_at('idea', 'too big'); I_HALF = 0.2 + vo_at('idea', 'Every step')
for x in (I_MID, I_L, I_R): sfx.append((isd + x + 0.3, 'pop'))
sfx.append((isd + I_HALF + 0.3, 'ding'))
KEYS = [f'w{i}' for i in range(5)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.6, last_extra=1.8)
def at(k, phrase, extra=0.0): return WSTEPS[k][0] + 0.1 + vo_at(KEYS[k], phrase) + extra
# (time, lo, hi, mid or None)
KF = [(WSTEPS[0][0] + 0.2, 0, 8, None), (at(0, 'The middle'), 0, 8, 4),
      (at(1, 'Low becomes'), 5, 8, None), (at(2, 'New middle'), 5, 8, 6),
      (at(2, 'High becomes'), 5, 5, None), (at(3, 'Middle is'), 5, 5, 5)]
FOUND = at(3, 'Found')
for tt, *_ in KF: sfx.append((ws + tt, 'tick'))
sfx.append((ws + at(1, 'Throw'), 'whoosh')); sfx.append((ws + at(2, 'Too big'), 'buzz'))
sfx.append((ws + FOUND, 'ding')); sfx.append((ws + at(4, 'Return'), 'win'))
E.SPOTS.append((ws + FOUND - 0.05, 1.4, XS[5], CY, 200))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def arr(dl, dg, lt, states=None, xs=XS, cy=CY, size=100, t0=0.0, idx=True):
    states = states or {}
    for i, v in enumerate(A):
        s = pop_in(lt, t0 + i * 0.04)
        cell(dl, dg, xs[i], cy, size, v, states.get(i, 'idle'), s)
        if idx: text(dl, str(i), 'monor', 26, xs[i], cy + size / 2 + 28, MUTED, alpha=clamp(s))

def kf_at(lt):
    prev = cur = KF[0][1:]; tc = 0
    for tt, lo, hi, mid in KF:
        if lt >= tt: prev, cur, tc = cur, (lo, hi, mid), tt
    f = ease_in_out(prog(lt, tc, tc + 0.35))
    return cur, prev, f


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, '1,000,000 ITEMS', 'black', 96, W / 2, 450, WHITE)
    gtext(L, G, '20 STEPS?', 'black', 150, W / 2, 590)
    # halving bar
    n = 1000000; steps = int(clamp((lt - 0.6) / 0.16, 0, 20)) if lt > 0.6 else 0
    x0, x1 = 90, W - 90
    width = (x1 - x0)
    lo = x0
    w_ = width / (2 ** steps)
    dl.rounded_rectangle((x0, 860, x1, 960), radius=20, fill=rgba(CELL), outline=rgba(CELL_LINE), width=3)
    keep_x = x0 + width * 0.618 - w_ * 0.618
    dl.rounded_rectangle((keep_x, 860, keep_x + max(w_, 8), 960), radius=12, fill=rgba(tint(GOLD, 0.6)), outline=rgba(GOLD), width=4)
    dg.rounded_rectangle((keep_x, 860, keep_x + max(w_, 8), 960), radius=12, outline=rgba(GOLD), width=6)
    left = max(1, n >> steps)
    rich(dl, [('step ', MUTED), (str(steps), GOLD), ('   left: ', MUTED), (f'{left:,}', WHITE)], 1040, 'mono', 48)
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1260 + (1 - tg) * 30, 'LeetCode 704 · Binary Search', WHITE, 'sb', 36, tg, w=660, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Sorted array, find target')
    on = lt > P_FIND + 0.3
    arr(dl, dg, lt, {5: 'good'} if on else {}, t0=0.3)
    a = ease_out(prog(lt, 1.0, 1.4))
    label_pill(dl, dg, W / 2, 920, 'sorted  ↗', TEAL, size=34, alpha=a, w=260)
    b = prog(lt, P_FIND, P_FIND + 0.35)
    if b > 0:
        label_pill(dl, dg, W / 2, 1040, f'target = {TGT}', GOLD, size=42, alpha=ease_out(b), w=400, glow=True)
        result_badge(L, G, dl, W / 2, 1200, 'return 5', lt - P_FIND - 0.6, w=440, h=120, size=54)
    text(dl, 'not found → -1', 'monor', 34, W / 2, 1330, MUTED, alpha=ease_out(prog(lt, 2.0, 2.4)))


def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'LINEAR SEARCH', 'One by one', col=MUTED)
    k = int((lt - B_SCAN) / 0.3) if lt >= B_SCAN else -1
    k = min(k, 5)
    st = {i: 'dim' for i in range(k)}
    if k >= 0: st[k] = 'good' if k == 5 else 'active'
    arr(dl, dg, lt, st)
    if k >= 0:
        for D in (dl, dg): arrow_up(D, XS[k], CY + 90, ORANGE)
        text(dl, f'checks: {k + 1}', 'monor', 40, W / 2, 950, MUTED)
    big_o_stamp(L, G, dl, lt, B_STAMP, 'O(n)', cy=1150)
    text(dl, '1,000,000 items = 1,000,000 checks', 'monor', 34, W / 2, 1290, MUTED, alpha=ease_out(prog(lt, B_STAMP + 0.4, B_STAMP + 0.8)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'CUT IN HALF', 'black', 120, W / 2, 530, scale=back(b), alpha=clamp(b * 2))
    st = {}
    if lt > I_MID + 0.3: st[4] = 'active'
    l_out = lt > I_L + 0.3; r_out = lt > I_R + 0.3
    for i in range(9):
        if l_out and i < 4 and lt < I_R: st[i] = 'dim'
        if r_out and i > 4: st[i] = 'dim'
    arr(dl, dg, lt, st, cy=800)
    a1 = ease_out(prog(lt, I_L, I_L + 0.3)) * (1 - prog(lt, I_R - 0.2, I_R))
    label_pill(dl, dg, W / 2, 1000, 'mid too small → drop LEFT', TEAL, size=32, alpha=a1, w=560)
    a2 = ease_out(prog(lt, I_R, I_R + 0.3))
    label_pill(dl, dg, W / 2, 1000, 'mid too big → drop RIGHT', CORAL, size=32, alpha=a2 * (1 - prog(lt, I_HALF - 0.2, I_HALF)), w=560)
    h = prog(lt, I_HALF, I_HALF + 0.4)
    if h > 0:
        grad_pill(L, G, W / 2, 1060, 700, 110, scale=back(h))
        text(dl, 'n → n/2 → n/4 → ... → 1', 'mono', 42 * back(h), W / 2, 1060, INK_ON_GRAD)
        text(dl, '1,000,000 needs only ~20 steps', 'sb', 40, W / 2, 1200, WHITE, alpha=ease_out(prog(lt, I_HALF + 0.5, I_HALF + 0.9)))


def sc_walk(L, G, dl, dg, lt, dur, steps):
    k, u = step_at(lt, steps)
    (lo, hi, mid), (plo, phi, pmid), f = kf_at(lt)
    st = {}
    for i in range(9):
        if i < lo or i > hi: st[i] = 'dim'
    if mid is not None: st[mid] = 'active'
    found = lt >= FOUND
    if found: st = {i: 'dim' for i in range(9)}; st[5] = 'good'
    arr(dl, dg, lt, st)
    rich(dl, [('target = ', MUTED), (str(TGT), GOLD)], 470, 'mono', 50, ease_out(prog(lt, 0, 0.4)))
    # range bracket
    if not found:
        xl = lerp(XS[plo], XS[lo], f) - 56; xr = lerp(XS[phi], XS[hi], f) + 56
        for D in (dl, dg):
            D.line([(xl, CY - 90), (xl, CY - 72), (xr, CY - 72), (xr, CY - 90)], fill=rgba(TEAL), width=5)
    # pointers
    def ptr(x, y, lab, col):
        for D in (dl, dg): arrow_up(D, x, y, col)
        text(dl, lab, 'mono', 32, x, y + 58, col)
    xlo = lerp(XS[plo], XS[lo], f); xhi = lerp(XS[phi], XS[hi], f)
    if abs(xlo - xhi) < 4:
        ptr(xlo, CY + 92, 'lo=hi', TEAL)
    else:
        ptr(xlo, CY + 92, 'lo', TEAL); ptr(xhi, CY + 92, 'hi', CORAL)
    if mid is not None:
        mx = XS[mid]
        a = ease_out(prog(lt, [tt for tt, *_ in KF if tt <= lt][-1], [tt for tt, *_ in KF if tt <= lt][-1] + 0.3))
        dl.polygon([(mx, CY - 60), (mx - 22, CY - 96), (mx + 22, CY - 96)], fill=rgba(GOLD, a))
        text(dl, 'mid', 'mono', 32, mx, CY - 125, GOLD, alpha=a)
    # comparison line
    if 0 <= k <= 3:
        msgs = {0: [('mid = ', MUTED), ('(0+8)/2 = 4', WHITE)], 1: [('16', GOLD), (' < 23  →  ', WHITE), ('lo = 5', TEAL)],
                2: [('38', GOLD), (' > 23  →  ', WHITE), ('hi = 5', CORAL)], 3: [('23', GOLD), (' == 23  ', WHITE), ('found!', TEAL)]}
        rich(dl, msgs[k], 1010, 'mono', 50, ease_out(prog(u, 0.3, 0.6)))
    # step counter
    n = len([1 for tt, lo_, hi_, m in KF if m is not None and lt >= tt])
    rich(dl, [('steps: ', MUTED), (str(n), GOLD)], 1120, 'mono', 44, ease_out(prog(lt, 0.3, 0.6)))
    if k == 4:
        result_badge(L, G, dl, W / 2, 1260, 'return 5', lt - at(4, 'Return'), w=440, h=120, size=54)
        burst(dl, dg, W / 2, 1260, lt - at(4, 'Return') - 0.1)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
