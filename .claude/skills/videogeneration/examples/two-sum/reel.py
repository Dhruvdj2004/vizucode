"""LeetCode 1 — Two Sum (array + hash map)."""
import os, sys, math
sys.path.insert(0, os.path.join(os.environ.get('VIDEOGEN_K', os.path.expanduser('~/.claude/skills/videogeneration')), 'scripts'))
import engine as E
from engine import *

E.init(os.path.dirname(os.path.abspath(__file__)))
E.CFG.update(
    HEADER_TAG='Arrays & Hashing · Easy',
    CODE=[
        'vector<int> twoSum(vector<int>& nums, int target) {',
        '    unordered_map<int, int> seen;',
        '    for (int i = 0; i < nums.size(); i++) {',
        '        int need = target - nums[i];',
        '        if (seen.count(need))',
        '            return {seen[need], i};',
        '        seen[nums[i]] = i;',
        '    }',
        '    return {};',
        '}',
    ],
    CODE_TITLE='C++  ·  one pass hash map',
    FN={'twoSum', 'count', 'size'},
    COMPLEXITY=[('TIME', 'O(n)'), ('SPACE', 'O(n)')],
    CAPTION_GOLD={'twelve', 'nine', 'four', 'seven', 'five', 'eleven', 'complement', 'need', 'map', 'hash', 'target',
                  'three', 'eight', 'one', 'two', 'zero', 'store'},
    CAPTION_CORAL={'slow', 'squared'},
    FX=True,
)
C = E.VOTEXT['code']
E.CFG['CODE_MARKS'] = [(0.0, [2]), (C.index('Compute') / len(C), [3]), (C.index('If the') / len(C), [4, 5]),
                       (C.index('Otherwise') / len(C), [6])]

NUMS = [3, 8, 5, 1, 7]
TARGET = 12
NEED = [TARGET - x for x in NUMS]

# ---------------- timeline ----------------
add_vo(0.3, 'hook'); scene('hook', 0.3 + VODUR['hook'] + 0.8)
ps = vo_scene('problem', 'problem', pad=0.9)
P_PAIR = 0.2 + vo_at('problem', 'five plus')
P_ANS = 0.2 + vo_at('problem', 'so the answer')
sfx.append((ps + P_PAIR, 'pop')); sfx.append((ps + P_ANS, 'ding'))
bs = vo_scene('brute', 'brute', pad=0.9)
B_START = 0.2 + vo_at('brute', 'Three and')
B_STAMP = 0.2 + vo_at('brute', "That's O")
for k in range(6): sfx.append((bs + B_START + k * 0.42, 'tick'))
sfx.append((bs + B_STAMP, 'buzz'))
isd = vo_scene('idea', 'idea', pad=0.9)
I_FORM = 0.2 + vo_at('idea', 'need equals')
I_MAP = 0.2 + vo_at('idea', 'hash map')
sfx.append((isd + 0.5, 'pop')); sfx.append((isd + I_FORM, 'pop')); sfx.append((isd + I_MAP, 'ding'))
KEYS = [f'w{i}' for i in range(6)]
ws, WSTEPS = steps_scene('walk', KEYS, gap=0.55, last_extra=1.8)
# per-step offsets (seconds into the step)
T_NEED = [0.1 + vo_at(k, 'need') for k in KEYS[:5]]
T_CHECK = [0.1 + vo_at(k, p) for k, p in zip(KEYS[:5], ['Not in', 'Not seen', 'Not seen', 'Not there', 'Five is'])]
T_STORE = [0.1 + vo_at(k, 'Store') for k in KEYS[:4]]
for k in range(6):
    s0 = ws + WSTEPS[k][0]
    sfx.append((s0 + 0.1, 'tick'))
    if k < 4: sfx.append((s0 + T_CHECK[k], 'tick')); sfx.append((s0 + T_STORE[k] + 0.3, 'pop'))
    if k == 4: sfx.append((s0 + T_CHECK[4], 'ding'))
    if k == 5: sfx.append((s0 + 0.6, 'win'))
_xs = row_x(5, 150, 22)
E.SPOTS.append((ws + WSTEPS[4][0] + T_CHECK[4] - 0.05, 1.6, 650, 1290, 230))
vo_scene('code', 'code', pad=0.9)
os_ = vo_scene('outro', 'outro', pad=1.8)
sfx.append((os_ + 3.2, 'pop'))


# ---------------- widgets ----------------
def arr(dl, dg, xs, cy, size, states=None, lt=9, idx=True, scale=None):
    states = states or {}
    for i, v in enumerate(NUMS):
        s = pop_in(lt, i * 0.07) if scale is None else scale
        cell(dl, dg, xs[i], cy, size, v, states.get(i, 'idle'), s)
        if idx: text(dl, str(i), 'monor', 30, xs[i], cy + size / 2 + 34, MUTED, alpha=clamp(s))

def target_pill(dl, dg, cx, cy, a=1.0, glow=True):
    label_pill(dl, dg, cx, cy, f'target = {TARGET}', GOLD, size=40, alpha=a, w=380, glow=glow)

def map_box(dl, dg, top, entries, a=1.0, hot=None, hot_p=0.0, new=None, new_p=1.0):
    """Hash map panel: entries = [(key, idx)], chips laid out in one row."""
    if a <= 0.01: return
    x0, x1, bot = 70, W - 70, top + 260
    dl.rounded_rectangle((x0, top, x1, bot), radius=34, fill=rgba((16, 22, 38), 0.95 * a), outline=rgba(TEAL, a), width=4)
    dg.rounded_rectangle((x0, top, x1, bot), radius=34, outline=rgba(TEAL, 0.45 * a), width=5)
    pill(dl, x0 + 150, top, 230, 54, (16, 22, 38), TEAL, alpha=a, width=3)
    text(dl, 'seen map', 'mono', 30, x0 + 150, top, TEAL, alpha=a)
    text(dl, 'value → index', 'monor', 28, x1 - 170, top + 50, MUTED, alpha=a)
    if not entries:
        text(dl, '{ }', 'mono', 60, W / 2, top + 145, MUTED, alpha=a * 0.6)
        return
    cw, gap = 200, 20
    xs = row_x(4, cw, gap)
    for j, (kv, iv) in enumerate(entries):
        s = back(new_p) if kv == new else 1.0
        if s <= 0.02: continue
        x, y = xs[j], top + 150
        if kv == hot:
            colors = (GOLD, tint(GOLD, 0.3), WHITE); glow = True
        else:
            colors = (TEAL, tint(TEAL, 0.16), WHITE); glow = False
        w_, h_ = cw * s, 110 * s
        dl.rounded_rectangle((x - w_ / 2, y - h_ / 2, x + w_ / 2, y + h_ / 2), radius=22 * s, fill=rgba(colors[1], a), outline=rgba(colors[0], a), width=4)
        if glow:
            gg = 1 + 0.12 * math.sin(E.NOW * 10)
            dg.rounded_rectangle((x - w_ / 2 * gg, y - h_ / 2 * gg, x + w_ / 2 * gg, y + h_ / 2 * gg), radius=22, outline=rgba(GOLD), width=8)
        text(dl, f'{kv} → {iv}', 'mono', 44 * s, x, y, colors[2], alpha=a)


# ---------------- scenes ----------------
def sc_hook(L, G, dl, dg, lt, dur):
    text(dl, 'WHICH TWO', 'black', 116, W / 2, 450, WHITE)
    gtext(L, G, 'MAKE 12?', 'black', 150, W / 2, 595)
    xs = row_x(5, 150, 22)
    for i, v in enumerate(NUMS):
        bob = math.sin(lt * 2.6 + i * 0.9) * 7 * prog(lt, 1.4, 2.0)
        hot = lt > 3.2 and i in (2, 4)
        cell(dl, dg, xs[i], 860 + bob, 150, v, 'active' if hot else 'idle', pop_in(lt, 0.2 + i * 0.08))
    q = prog(lt, 1.6, 2.0)
    for j, i in enumerate((2, 4)):
        p = prog(lt, 3.2, 3.5)
        if p > 0:
            text(dl, '?', 'black', 70 * back(p), xs[i], 730, GOLD)
    target_pill(dl, dg, W / 2, 1080, ease_out(q))
    tg = ease_out(prog(lt, 2.4, 2.9))
    label_pill(dl, dg, W / 2, 1300 + (1 - tg) * 30, 'LeetCode 1 · Two Sum', WHITE, 'sb', 36, tg, w=540, fill=(24, 31, 52))


def sc_problem(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TASK', 'Find two that add up')
    xs = row_x(5, 150, 22)
    on = lt > P_PAIR
    arr(dl, dg, xs, 720, 150, {2: 'active', 4: 'active'} if on else {}, lt - 0.3)
    target_pill(dl, dg, W / 2, 920, ease_out(prog(lt, 1.0, 1.4)))
    p = prog(lt, P_PAIR, P_PAIR + 0.35)
    if p > 0:
        # brackets joining 5 and 7
        y = 610
        for D in (dl, dg):
            D.line([(xs[2], y + 30), (xs[2], y), (xs[4], y), (xs[4], y + 30)], fill=rgba(GOLD, ease_out(p)), width=6)
        rich(dl, [('5', GOLD), (' + ', WHITE), ('7', GOLD), (' = ', WHITE), ('12', TEAL)], 1070, 'black', 90 * back(p), ease_out(p))
    r = prog(lt, P_ANS, P_ANS + 0.4)
    if r > 0:
        result_badge(L, G, dl, W / 2, 1250, 'return [2, 4]', lt - P_ANS, w=600, h=120, size=54)


PAIRS = [(0, 1), (0, 2), (0, 3), (0, 4), (1, 2), (1, 3)]
def sc_brute(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'BRUTE FORCE', 'Try every pair', col=MUTED)
    xs = row_x(5, 150, 22)
    k = int((lt - B_START) / 0.42) if lt >= B_START else -1
    st = {}
    if 0 <= k < len(PAIRS) and lt < B_STAMP:
        i, j = PAIRS[k]
        st = {i: 'active', j: 'found'}
    arr(dl, dg, xs, 700, 150, st, lt)
    if st:
        i, j = PAIRS[k]
        for D in (dl, dg):
            arrow_up(D, xs[i], 830, ORANGE); arrow_up(D, xs[j], 830, CORAL)
        text(dl, 'i', 'mono', 38, xs[i], 900, ORANGE); text(dl, 'j', 'mono', 38, xs[j], 900, CORAL)
        s = NUMS[i] + NUMS[j]
        rich(dl, [(f'{NUMS[i]} + {NUMS[j]} = {s}', WHITE), ('   ✗', CORAL)], 1000, 'mono', 54)
    n = min(len(PAIRS), k + 1) if k >= 0 else 0
    if lt < B_STAMP:
        text(dl, f'pairs checked: {n}', 'monor', 38, W / 2, 1090, MUTED, alpha=prog(lt, B_START, B_START + 0.3))
    big_o_stamp(L, G, dl, lt, B_STAMP, 'O(n²)', cy=1120)
    text(dl, 'n × n comparisons', 'monor', 38, W / 2, 1260, MUTED, alpha=ease_out(prog(lt, B_STAMP + 0.4, B_STAMP + 0.8)))


def sc_idea(L, G, dl, dg, lt, dur):
    section_title(dl, lt, 'THE TRICK')
    b = prog(lt, 0.4, 0.8)
    if b > 0: gtext(L, G, 'COMPLEMENT', 'black', 130, W / 2, 540, scale=back(b), alpha=clamp(b * 2))
    f = prog(lt, I_FORM, I_FORM + 0.4)
    if f > 0:
        grad_pill(L, G, W / 2, 700, 820, 120, scale=back(f))
        text(dl, 'need = target − x', 'mono', 54 * back(f), W / 2, 700, INK_ON_GRAD)
    m = ease_out(prog(lt, I_MAP - 0.3, I_MAP + 0.2))
    map_box(dl, dg, 880, [(3, 0), (8, 1)], m)
    q = ease_out(prog(lt, I_MAP + 0.6, I_MAP + 1.0))
    rich(dl, [('seen ', WHITE), ('need', ORANGE), ('?  lookup is ', WHITE), ('O(1)', TEAL)], 1250, 'xb', 52, q)


def sc_walk(L, G, dl, dg, lt, dur, steps):
    section_title(dl, lt, 'ONE PASS', None)
    rich(dl, [('target = ', MUTED), ('12', GOLD)], 470, 'mono', 44, ease_out(prog(lt, 0, 0.4)))
    k, u = step_at(lt, steps)
    xs = row_x(5, 150, 22)
    cy = 620
    st = {}
    for i in range(5):
        if i < k and k <= 4: st[i] = 'done'
    if 0 <= k <= 4: st[k] = 'active'
    if k == 4 and u > T_CHECK[4]: st[2] = 'good'; st[4] = 'good'
    if k == 5: st = {i: 'dim' for i in range(5)}; st[2] = 'good'; st[4] = 'good'
    arr(dl, dg, xs, cy, 150, st, lt)
    if 0 <= k <= 4:
        prev = xs[k - 1] if k > 0 else xs[0]
        px = lerp(prev, xs[k], ease_in_out(prog(u, 0, 0.3)))
        for D in (dl, dg): arrow_up(D, px, cy + 120, ORANGE)
        text(dl, 'i', 'mono', 36, px, cy + 185, ORANGE)
    # status line
    entries = [(NUMS[i], i) for i in range(5) if i < k or (i == k and k < 4 and u > T_STORE[k] + 0.3)]
    entries = entries[:4]
    if 0 <= k <= 4:
        x, nd = NUMS[k], NEED[k]
        qa = ease_out(prog(u, 0.15, 0.4))
        na = ease_out(prog(u, T_NEED[k], T_NEED[k] + 0.3))
        rich(dl, [('x = ', MUTED), (str(x), GOLD)], 860, 'mono', 52, qa)
        rich(dl, [('need = ', MUTED), (f'12 − {x} = ', WHITE), (str(nd), ORANGE)], 935, 'mono', 52, na)
        ca = ease_out(prog(u, T_CHECK[k], T_CHECK[k] + 0.3))
        if k < 4:
            label_pill(dl, dg, W / 2, 1030, f'{nd} in map?  no  →  store {x}', CORAL, size=34, alpha=ca, w=620)
        else:
            label_pill(dl, dg, W / 2, 1030, '5 in map?  YES  ✓', TEAL, size=38, alpha=ca, w=520, glow=True)
    new = NUMS[k] if 0 <= k < 4 else None
    new_p = prog(u, T_STORE[k] + 0.3, T_STORE[k] + 0.65) if 0 <= k < 4 else 1
    hot = 5 if (k == 4 and u > T_CHECK[4]) or k == 5 else None
    map_box(dl, dg, 1140, entries, ease_out(prog(lt, 0.3, 0.7)), hot=hot, new=new, new_p=new_p)
    if 0 <= k < 4 and T_STORE[k] < u < T_STORE[k] + 0.65:   # value flies into the map
        f = ease_in_out(prog(u, T_STORE[k], T_STORE[k] + 0.4))
        tx = row_x(4, 200, 20)[min(k, 3)]
        cell(dl, dg, lerp(xs[k], tx, f), lerp(cy, 1290, f) - math.sin(f * math.pi) * 90, lerp(150, 90, f), NUMS[k], 'active', 1 - 0.3 * f)
    if k == 5:
        result_badge(L, G, dl, W / 2, 900, 'return [2, 4]', u - 0.3, w=600, h=130, size=56)
        burst(dl, dg, W / 2, 900, u - 0.45)


E.SCENES.update(hook=sc_hook, problem=sc_problem, brute=sc_brute, idea=sc_idea, walk=sc_walk)
E.finish()
if __name__ == '__main__':
    E.main()
