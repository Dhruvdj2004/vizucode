// Greedy, Strings and Intervals — Striver / Love Babbar sheet staples.
import type { ArrayState, IntervalsState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ============================================================
 * Greedy
 * ============================================================ */

/* ================= Assign Cookies ================= */
const assignCookies: ProblemDef = {
  slug: 'assign-cookies',
  title: 'Assign Cookies',
  category: 'Greedy',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/assign-cookies/',
  technique: 'Sort both sides, then feed the least greedy child with the smallest cookie that satisfies them.',
  widget: 'stack',
  widgetTitle: 'Children (greed) & cookies',
  inputs: [
    { key: 'g', label: 'Child greed factors', defaultValue: '1, 2, 3', wide: true },
    { key: 's', label: 'Cookie sizes', defaultValue: '1, 1', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findContentChildren(vector<int>& g, vector<int>& s) {'),
      L('        sort(g.begin(), g.end());', 'sort'),
      L('        sort(s.begin(), s.end());', 'sort'),
      L('        int i = 0, j = 0;', 'init'),
      L('        while (i < g.size() && j < s.size()) {', 'loop'),
      L('            if (s[j] >= g[i]) i++;', 'feed'),
      L('            j++;', 'next'),
      L('        }'),
      L('        return i;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findContentChildren(int[] g, int[] s) {'),
      L('        Arrays.sort(g);', 'sort'),
      L('        Arrays.sort(s);', 'sort'),
      L('        int i = 0, j = 0;', 'init'),
      L('        while (i < g.length && j < s.length) {', 'loop'),
      L('            if (s[j] >= g[i]) i++;', 'feed'),
      L('            j++;', 'next'),
      L('        }'),
      L('        return i;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const gRaw = parseIntArray(values.g, { min: 1, maxLen: 10 });
    if (typeof gRaw === 'string') return { error: gRaw };
    const sRaw = parseIntArray(values.s, { min: 1, maxLen: 10 });
    if (typeof sRaw === 'string') return { error: sRaw };
    const g = [...gRaw].sort((x, y) => x - y);
    const s = [...sRaw].sort((x, y) => x - y);
    const steps: Step[] = [];
    let i = 0;
    let j = 0;
    const fed: number[] = [];
    const st = (): StackState => ({
      array: {
        arr: g,
        mark: {
          ...Object.fromEntries(fed.map((k) => [k, 'good' as const])),
          ...(i < g.length ? { [i]: 'active' as const } : {}),
        },
        ptrs: i < g.length ? [{ name: 'child', i, c: 'a' }] : [],
      },
      stack: s.map((v, k) => ({ v, c: k < j ? ('f' as const) : k === j ? ('a' as const) : ('b' as const) })),
      stackLabel: 'cookies, smallest first',
      aggs: [{ label: 'children fed', value: String(fed.length), c: 'c' }],
    });
    steps.push({
      tag: 'sort',
      trace: [
        'Sort both. Feeding the ', A('least greedy'), ' child with the ', A('smallest adequate'), ' cookie never wastes a big cookie on a child a small one would satisfy.',
      ],
      state: st(),
    });
    while (i < g.length && j < s.length) {
      if (s[j] >= g[i]) {
        fed.push(i);
        steps.push({
          tag: 'feed',
          trace: ['Cookie ', B(s[j]), ' satisfies the child needing ', B(g[i]), ' — both move on.'],
          state: st(),
        });
        i++;
        j++;
      } else {
        steps.push({
          tag: 'next',
          trace: [
            'Cookie ', F(s[j]), ' is too small for the child needing ', A(g[i]), ' — and every remaining child is greedier, so this cookie is useless. Discard it.',
          ],
          state: st(),
        });
        j++;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Most children that can be made content: ', C(fed.length), '.'], state: st() });
    return { steps, result: String(fed.length) };
  },
  note: 'An exchange argument proves the greedy: if an optimal solution gave a bigger cookie to the least greedy child, swapping in the smallest adequate one keeps it valid and frees a larger cookie. Discarding a too-small cookie outright is safe because the children only get greedier from here.',
  complexity: { time: 'O(n log n + m log m)', space: 'O(1)' },
};

/* ================= Lemonade Change ================= */
const lemonadeChange: ProblemDef = {
  slug: 'lemonade-change',
  title: 'Lemonade Change',
  category: 'Greedy',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/lemonade-change/',
  technique: 'Give change with the largest notes first — $5 bills are the flexible ones, so hoard them.',
  widget: 'array',
  widgetTitle: 'Queue of customers',
  inputs: [{ key: 'bills', label: 'Bills paid (5, 10 or 20)', defaultValue: '5, 5, 5, 10, 20', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool lemonadeChange(vector<int>& bills) {'),
      L('        int five = 0, ten = 0;', 'init'),
      L('        for (int b : bills) {', 'loop'),
      L('            if (b == 5) five++;', 'five'),
      L('            else if (b == 10) {', 'ten'),
      L('                if (!five) return false;', 'fail'),
      L('                five--; ten++;', 'ten'),
      L('            } else {'),
      L('                if (ten && five) { ten--; five--; }', 'prefer'),
      L('                else if (five >= 3) five -= 3;', 'fallback'),
      L('                else return false;', 'fail'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean lemonadeChange(int[] bills) {'),
      L('        int five = 0, ten = 0;', 'init'),
      L('        for (int b : bills) {', 'loop'),
      L('            if (b == 5) five++;', 'five'),
      L('            else if (b == 10) {', 'ten'),
      L('                if (five == 0) return false;', 'fail'),
      L('                five--; ten++;', 'ten'),
      L('            } else {'),
      L('                if (ten > 0 && five > 0) { ten--; five--; }', 'prefer'),
      L('                else if (five >= 3) five -= 3;', 'fallback'),
      L('                else return false;', 'fail'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const bills = parseIntArray(values.bills, { min: 5, max: 20, maxLen: 12 });
    if (typeof bills === 'string') return { error: bills };
    if (!bills.every((b) => b === 5 || b === 10 || b === 20)) return { error: 'Each bill must be 5, 10 or 20.' };
    const steps: Step[] = [];
    let five = 0;
    let ten = 0;
    const st = (i: number, mark: 'active' | 'good' | 'dim' = 'active'): ArrayState => ({
      arr: bills.map((b) => `$${b}`),
      mark: {
        ...Object.fromEntries(bills.slice(0, i).map((_, k) => [k, 'good' as const])),
        ...(i < bills.length ? { [i]: mark } : {}),
      },
      aggs: [
        { label: '$5 in till', value: String(five), c: 'a' },
        { label: '$10 in till', value: String(ten), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Lemonade costs $5 and the till starts empty. ', A('$5'), ' bills are the only ones usable in every kind of change, so spend them last.',
      ],
      state: st(bills.length),
    });
    for (let i = 0; i < bills.length; i++) {
      const b = bills[i];
      if (b === 5) {
        five++;
        steps.push({ tag: 'five', trace: ['Customer pays exactly ', B('$5'), ' — no change needed. Till: ', B(five), ' × $5.'], state: st(i) });
      } else if (b === 10) {
        if (five === 0) {
          steps.push({ tag: 'fail', trace: ['Paid ', F('$10'), ' but there is no $5 to give back — ', C('fail'), '.'], state: st(i, 'dim') });
          return { steps, result: 'false', resultDetail: `failed at customer ${i}` };
        }
        five--;
        ten++;
        steps.push({ tag: 'ten', trace: ['Paid ', A('$10'), ' — hand back one ', B('$5'), '. Till: ', B(five), ' × $5, ', B(ten), ' × $10.'], state: st(i) });
      } else {
        if (ten > 0 && five > 0) {
          ten--;
          five--;
          steps.push({
            tag: 'prefer',
            trace: [
              'Paid ', A('$20'), ' — owe $15. Prefer ', B('$10 + $5'), ' over three $5s: it keeps two extra $5 bills, which are far more useful later.',
            ],
            state: st(i),
          });
        } else if (five >= 3) {
          five -= 3;
          steps.push({ tag: 'fallback', trace: ['Paid ', A('$20'), ' with no $10 available — fall back to ', B('three $5s'), '.'], state: st(i) });
        } else {
          steps.push({ tag: 'fail', trace: ['Paid ', F('$20'), ' and there is no way to make $15 — ', C('fail'), '.'], state: st(i, 'dim') });
          return { steps, result: 'false', resultDetail: `failed at customer ${i}` };
        }
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Every customer got correct change — ', C('true'), '.'], state: st(bills.length) });
    return { steps, result: 'true' };
  },
  note: 'A $10 note can only ever pay part of a $15 change, while a $5 works in both cases — so spending $10 first is never worse. That asymmetry is what makes the greedy provably correct rather than a heuristic.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Candy ================= */
const candy: ProblemDef = {
  slug: 'candy',
  title: 'Candy',
  category: 'Greedy',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/candy/',
  technique: 'Two sweeps — left to right fixes rising runs, right to left fixes falling ones.',
  widget: 'array',
  widgetTitle: 'Ratings & candies given',
  inputs: [{ key: 'ratings', label: 'Ratings', defaultValue: '1, 0, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int candy(vector<int>& r) {'),
      L('        int n = r.size();'),
      L('        vector<int> c(n, 1);', 'init'),
      L('        for (int i = 1; i < n; i++)', 'left'),
      L('            if (r[i] > r[i-1]) c[i] = c[i-1] + 1;', 'left'),
      L('        for (int i = n - 2; i >= 0; i--)', 'right'),
      L('            if (r[i] > r[i+1])', 'right'),
      L('                c[i] = max(c[i], c[i+1] + 1);', 'right'),
      L('        return accumulate(c.begin(), c.end(), 0);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int candy(int[] r) {'),
      L('        int n = r.length;'),
      L('        int[] c = new int[n];'),
      L('        Arrays.fill(c, 1);', 'init'),
      L('        for (int i = 1; i < n; i++)', 'left'),
      L('            if (r[i] > r[i-1]) c[i] = c[i-1] + 1;', 'left'),
      L('        for (int i = n - 2; i >= 0; i--)', 'right'),
      L('            if (r[i] > r[i+1])', 'right'),
      L('                c[i] = Math.max(c[i], c[i+1] + 1);', 'right'),
      L('        int total = 0;'),
      L('        for (int v : c) total += v;'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const r = parseIntArray(values.ratings, { maxLen: 12 });
    if (typeof r === 'string') return { error: r };
    const n = r.length;
    const c = r.map(() => 1);
    const steps: Step[] = [];
    const st = (i?: number, dir?: 'l' | 'r'): ArrayState => ({
      arr: r,
      mark: i !== undefined ? { [i]: 'active', ...(dir === 'l' && i > 0 ? { [i - 1]: 'good' as const } : {}), ...(dir === 'r' && i + 1 < n ? { [i + 1]: 'good' as const } : {}) } : {},
      aggs: [
        { label: 'candies', value: c.join(', '), c: 'b' },
        { label: 'total', value: String(c.reduce((a, b) => a + b, 0)), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Everyone gets at least ', B(1), ' candy. Two neighbours only constrain each other when their ratings differ.'],
      state: st(),
    });
    for (let i = 1; i < n; i++) {
      if (r[i] > r[i - 1]) {
        c[i] = c[i - 1] + 1;
        steps.push({
          tag: 'left',
          trace: ['Rating ', A(r[i]), ' beats the left neighbour ', A(r[i - 1]), ' — give ', B(c[i]), ', one more than they got.'],
          state: st(i, 'l'),
        });
      } else {
        steps.push({ tag: 'left', trace: ['Rating ', F(r[i]), ' does not beat the left neighbour — no constraint from this side.'], state: st(i, 'l') });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'right',
      trace: [
        'The left pass only satisfied ', A('left'), ' neighbours. Now sweep back so every child also beats the one on their ', B('right'), ' — taking the max keeps both rules true.',
      ],
      state: st(),
    });
    for (let i = n - 2; i >= 0; i--) {
      if (r[i] > r[i + 1]) {
        const before = c[i];
        c[i] = Math.max(c[i], c[i + 1] + 1);
        steps.push({
          tag: 'right',
          trace: [
            'Rating ', A(r[i]), ' beats the right neighbour ', A(r[i + 1]), ' — needs at least ', B(c[i + 1] + 1), '; had ', A(before), ', so now ', B(c[i]), '.',
          ],
          state: st(i, 'r'),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const total = c.reduce((a, b) => a + b, 0);
    steps.push({
      tag: 'ret',
      trace: ['Minimum candies: ', C(total), ' (', C(c.join(', ')), ').'],
      state: { arr: r, mark: Object.fromEntries(r.map((_, i) => [i, 'final' as const])), aggs: [{ label: 'candies', value: c.join(', '), c: 'c' }] },
    });
    return { steps, result: String(total), resultDetail: c.join(', ') };
  },
  note: 'One pass cannot work because the two constraints point in opposite directions — a child at the top of a long descent needs to know how far the descent runs. Taking the max rather than overwriting in the second pass is essential; overwriting would break the left-neighbour rule that was just established.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Minimum Number of Arrows to Burst Balloons ================= */
const minArrows: ProblemDef = {
  slug: 'minimum-number-of-arrows-to-burst-balloons',
  title: 'Minimum Number of Arrows to Burst Balloons',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/',
  technique: 'Sort by right edge and always shoot at it — that hits the most balloons a single arrow can.',
  widget: 'intervals',
  widgetTitle: 'Balloons on the x-axis',
  inputs: [{ key: 'intervals', label: 'Balloons (e.g. 10-16, 2-8)', defaultValue: '10-16, 2-8, 1-6, 7-12', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findMinArrowShots(vector<vector<int>>& pts) {'),
      L('        sort(pts.begin(), pts.end(), [](auto& a, auto& b) {', 'sort'),
      L('            return a[1] < b[1];          // by right edge', 'sort'),
      L('        });'),
      L('        int arrows = 1, shot = pts[0][1];', 'first'),
      L('        for (auto& p : pts) {', 'loop'),
      L('            if (p[0] <= shot) continue;   // already burst', 'hit'),
      L('            arrows++; shot = p[1];', 'new'),
      L('        }'),
      L('        return arrows;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findMinArrowShots(int[][] pts) {'),
      L('        Arrays.sort(pts, (a, b) -> Integer.compare(a[1], b[1]));', 'sort'),
      L('        int arrows = 1, shot = pts[0][1];', 'first'),
      L('        for (int[] p : pts) {', 'loop'),
      L('            if (p[0] <= shot) continue;   // already burst', 'hit'),
      L('            arrows++; shot = p[1];', 'new'),
      L('        }'),
      L('        return arrows;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parts = (values.intervals ?? '').split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return { error: 'Enter balloons like "1-6, 2-8".' };
    if (parts.length > 8) return { error: 'Keep it to at most 8 balloons.' };
    const raw: [number, number][] = [];
    for (const p of parts) {
      const m = p.match(/^(-?\d+)\s*[-–:]\s*(-?\d+)$/);
      if (!m) return { error: `Bad balloon "${p}" — use "start-end".` };
      const s = Number(m[1]);
      const e = Number(m[2]);
      if (e < s) return { error: `Balloon "${p}" ends before it starts.` };
      raw.push([s, e]);
    }
    const pts = [...raw].sort((a, b) => a[1] - b[1]);
    const lo = Math.min(...pts.map((p) => p[0]));
    const hi = Math.max(...pts.map((p) => p[1]));
    const steps: Step[] = [];
    const burst = new Set<number>();
    const shots: number[] = [];
    const view = (cur?: number): IntervalsState => ({
      intervals: pts.map((p, i) => ({
        s: p[0],
        e: p[1],
        label: `${p[0]}–${p[1]}`,
        mark: i === cur ? 'active' : burst.has(i) ? 'good' : undefined,
      })),
      domain: [lo, hi],
      aggs: [
        { label: 'arrows', value: String(shots.length), c: 'c' },
        { label: 'shot at', value: shots.join(', ') || '—', c: 'b' },
      ],
    });
    steps.push({
      tag: 'sort',
      trace: [
        'Sort by ', A('right edge'), '. An arrow fired at the earliest right edge bursts that balloon and every other one that reaches back over it — no arrow can do better.',
      ],
      state: view(),
    });
    let shot = pts[0][1];
    shots.push(shot);
    burst.add(0);
    steps.push({
      tag: 'first',
      trace: ['First arrow at x = ', B(shot), ' — the right edge of the balloon that ends soonest.'],
      state: view(0),
    });
    for (let i = 0; i < pts.length; i++) {
      if (pts[i][0] <= shot) {
        burst.add(i);
        steps.push({
          tag: 'hit',
          trace: ['Balloon ', B(`${pts[i][0]}–${pts[i][1]}`), ' starts at or before x = ', B(shot), ' — already burst, no new arrow.'],
          state: view(i),
        });
      } else {
        shot = pts[i][1];
        shots.push(shot);
        burst.add(i);
        steps.push({
          tag: 'new',
          trace: [
            'Balloon ', A(`${pts[i][0]}–${pts[i][1]}`), ' starts after x = ', F(shots[shots.length - 2]), ' — the previous arrow missed it. Fire a new one at ', C(shot), '.',
          ],
          state: view(i),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Minimum arrows: ', C(shots.length), '.'],
      state: view(),
    });
    return { steps, result: String(shots.length), resultDetail: `shots at ${shots.join(', ')}` };
  },
  note: 'Sorting by right edge is what makes the greedy exchange-safe: the earliest-ending balloon must be hit by some arrow, and shooting at its right edge dominates every other position for that arrow. This is the same shape as non-overlapping intervals — count the groups rather than the removals.',
  complexity: { time: 'O(n log n)', space: 'O(1)' },
};

/* ================= Queue Reconstruction by Height ================= */
const queueReconstruction: ProblemDef = {
  slug: 'queue-reconstruction-by-height',
  title: 'Queue Reconstruction by Height',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/queue-reconstruction-by-height/',
  technique: 'Place the tallest first — shorter people inserted later are invisible to them.',
  widget: 'array',
  widgetTitle: 'Queue being rebuilt',
  inputs: [{ key: 'people', label: 'People as height,count (e.g. 7,0; 4,4)', defaultValue: '7,0; 4,4; 7,1; 5,0; 6,1; 5,2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> reconstructQueue(vector<vector<int>>& p) {'),
      L('        sort(p.begin(), p.end(), [](auto& a, auto& b) {', 'sort'),
      L('            return a[0] != b[0] ? a[0] > b[0]   // tallest first', 'sort'),
      L('                                : a[1] < b[1];  // smaller k first', 'sort'),
      L('        });'),
      L('        vector<vector<int>> res;'),
      L('        for (auto& person : p)', 'loop'),
      L('            res.insert(res.begin() + person[1], person);', 'insert'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] reconstructQueue(int[][] p) {'),
      L('        Arrays.sort(p, (a, b) ->', 'sort'),
      L('            a[0] != b[0] ? b[0] - a[0]      // tallest first', 'sort'),
      L('                         : a[1] - b[1]);   // smaller k first', 'sort'),
      L('        List<int[]> res = new ArrayList<>();'),
      L('        for (int[] person : p)', 'loop'),
      L('            res.add(person[1], person);', 'insert'),
      L('        return res.toArray(new int[0][]);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parts = (values.people ?? '').split(/[;|]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return { error: 'Enter people like "7,0; 4,4".' };
    if (parts.length > 8) return { error: 'Keep it to at most 8 people.' };
    const people: [number, number][] = [];
    for (const p of parts) {
      const m = p.match(/^(\d+)\s*,\s*(\d+)$/);
      if (!m) return { error: `Bad entry "${p}" — use "height,count".` };
      people.push([Number(m[1]), Number(m[2])]);
    }
    if (people.some(([, k]) => k >= people.length)) return { error: 'A count cannot be larger than the number of other people.' };

    const sorted = [...people].sort((a, b) => (a[0] !== b[0] ? b[0] - a[0] : a[1] - b[1]));
    const res: [number, number][] = [];
    const steps: Step[] = [];
    const st = (justAt?: number): ArrayState => ({
      arr: res.map(([h, k]) => `${h}(${k})`),
      mark: justAt !== undefined ? { [justAt]: 'active' } : {},
      aggs: [{ label: 'still to place', value: sorted.slice(res.length).map(([h, k]) => `${h},${k}`).join('  ') || '—', c: 'b' }],
    });
    steps.push({
      tag: 'sort',
      trace: [
        'Sort by height ', A('descending'), ', ties by count ascending: ', B(sorted.map(([h, k]) => `${h},${k}`).join('  ')), '.',
      ],
      state: st(),
    });
    for (const person of sorted) {
      res.splice(person[1], 0, person);
      steps.push({
        tag: 'insert',
        trace: [
          'Person ', A(`${person[0]}`), ' must see ', A(person[1]), ' taller-or-equal ahead. Everyone already placed is at least as tall, so just insert at index ',
          B(person[1]), ' — the count becomes true by construction.',
        ],
        state: st(person[1]),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Reconstructed queue: ', C(res.map(([h, k]) => `[${h},${k}]`).join(' ')), '.'],
      state: { arr: res.map(([h, k]) => `${h}(${k})`), mark: Object.fromEntries(res.map((_, i) => [i, 'final' as const])) },
    });
    return { steps, result: res.map(([h, k]) => `[${h},${k}]`).join(', ') };
  },
  note: 'Inserting a shorter person later never disturbs an earlier placement, because taller people simply do not count them — that is what makes tallest-first order safe. Within one height the smaller count must go first, otherwise the two would displace each other.',
  complexity: { time: 'O(n²) with array insertion', space: 'O(n)' },
};

/* ============================================================
 * Strings
 * ============================================================ */

/* ================= Reverse Words in a String ================= */
const reverseWords: ProblemDef = {
  slug: 'reverse-words-in-a-string',
  title: 'Reverse Words in a String',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reverse-words-in-a-string/',
  technique: 'Reverse the whole string, then reverse each word back in place.',
  widget: 'array',
  widgetTitle: 'Characters',
  inputs: [{ key: 's', label: 'Sentence', defaultValue: '  the sky  is blue ', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string reverseWords(string s) {'),
      L('        reverse(s.begin(), s.end());', 'reverseAll'),
      L('        string out;'),
      L('        int i = 0, n = s.size();'),
      L('        while (i < n) {', 'loop'),
      L('            while (i < n && s[i] == \' \') i++;', 'skip'),
      L('            if (i >= n) break;'),
      L('            int j = i;'),
      L('            while (j < n && s[j] != \' \') j++;', 'word'),
      L('            string w = s.substr(i, j - i);'),
      L('            reverse(w.begin(), w.end());', 'reverseWord'),
      L('            if (!out.empty()) out += \' \';'),
      L('            out += w;', 'append'),
      L('            i = j;'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String reverseWords(String s) {'),
      L('        char[] a = new StringBuilder(s).reverse()', 'reverseAll'),
      L('                        .toString().toCharArray();', 'reverseAll'),
      L('        StringBuilder out = new StringBuilder();'),
      L('        int i = 0, n = a.length;'),
      L('        while (i < n) {', 'loop'),
      L('            while (i < n && a[i] == \' \') i++;', 'skip'),
      L('            if (i >= n) break;'),
      L('            int j = i;'),
      L('            while (j < n && a[j] != \' \') j++;', 'word'),
      L('            String w = new StringBuilder(new String(a, i, j - i))'),
      L('                            .reverse().toString();', 'reverseWord'),
      L('            if (out.length() > 0) out.append(\' \');'),
      L('            out.append(w);', 'append'),
      L('            i = j;'),
      L('        }'),
      L('        return out.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = values.s ?? '';
    if (s.trim().length === 0) return { error: 'Enter a sentence with at least one word.' };
    if (s.length > 24) return { error: 'Keep it to at most 24 characters.' };
    if (!/^[a-zA-Z ]+$/.test(s)) return { error: 'Use letters and spaces only.' };
    const rev = [...s].reverse();
    const steps: Step[] = [];
    const out: string[] = [];
    const disp = (arr: string[]) => arr.map((c) => (c === ' ' ? '␣' : c));
    steps.push({
      tag: 'reverseAll',
      trace: [
        'Reverse the entire string first: "', A(rev.join('')), '". Now the words are in the right ', B('order'), ' but each one is spelled backwards.',
      ],
      state: { arr: disp(rev), mark: Object.fromEntries(rev.map((_, i) => [i, 'active' as const])) },
    });
    let i = 0;
    const n = rev.length;
    while (i < n) {
      const skipStart = i;
      while (i < n && rev[i] === ' ') i++;
      if (i > skipStart) {
        steps.push({
          tag: 'skip',
          trace: ['Skip ', F(i - skipStart), ' space(s) — extra whitespace is collapsed, and leading or trailing spaces vanish.'],
          state: { arr: disp(rev), mark: Object.fromEntries([...Array(i - skipStart)].map((_, k) => [skipStart + k, 'dim' as const])) },
        });
      }
      if (i >= n) break;
      const j0 = i;
      let j = i;
      while (j < n && rev[j] !== ' ') j++;
      const w = rev.slice(j0, j);
      steps.push({
        tag: 'word',
        trace: ['Found the reversed word "', A(w.join('')), '" at indices ', A(j0), '…', A(j - 1), '.'],
        state: { arr: disp(rev), window: [j0, j - 1], mark: Object.fromEntries(w.map((_, k) => [j0 + k, 'active' as const])) },
      });
      const fixed = [...w].reverse().join('');
      out.push(fixed);
      steps.push({
        tag: 'reverseWord',
        trace: ['Reverse it back to "', B(fixed), '" and append — result so far: "', B(out.join(' ')), '".'],
        state: { arr: disp(rev), window: [j0, j - 1], mark: Object.fromEntries(w.map((_, k) => [j0 + k, 'good' as const])) },
      });
      i = j;
      if (steps.length > MAX_STEPS) break;
    }
    const result = out.join(' ');
    steps.push({
      tag: 'ret',
      trace: ['Words reversed, spacing normalised: "', C(result), '".'],
      state: { arr: result.split('').map((c) => (c === ' ' ? '␣' : c)), mark: Object.fromEntries(result.split('').map((_, i) => [i, 'final' as const])) },
    });
    return { steps, result };
  },
  note: 'The double reversal is the classic in-place trick and generalises to rotating an array by k. Most of the difficulty here is not the reversal but the whitespace contract — leading, trailing and repeated spaces must all collapse to exactly one separator.',
  complexity: { time: 'O(n)', space: 'O(n) for the output' },
};

/* ================= Isomorphic Strings ================= */
const isomorphicStrings: ProblemDef = {
  slug: 'isomorphic-strings',
  title: 'Isomorphic Strings',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/isomorphic-strings/',
  technique: 'Two maps — the mapping must be consistent in both directions, not just one.',
  widget: 'array',
  widgetTitle: 'Character pairs',
  inputs: [
    { key: 's', label: 'String s', defaultValue: 'egg' },
    { key: 't', label: 'String t', defaultValue: 'add' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isIsomorphic(string s, string t) {'),
      L('        if (s.size() != t.size()) return false;', 'len'),
      L('        unordered_map<char,char> fwd, bwd;', 'init'),
      L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
      L('            char a = s[i], b = t[i];'),
      L('            if (fwd.count(a) && fwd[a] != b) return false;', 'clashF'),
      L('            if (bwd.count(b) && bwd[b] != a) return false;', 'clashB'),
      L('            fwd[a] = b; bwd[b] = a;', 'set'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isIsomorphic(String s, String t) {'),
      L('        if (s.length() != t.length()) return false;', 'len'),
      L('        Map<Character,Character> fwd = new HashMap<>(), bwd = new HashMap<>();', 'init'),
      L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
      L('            char a = s.charAt(i), b = t.charAt(i);'),
      L('            if (fwd.containsKey(a) && fwd.get(a) != b) return false;', 'clashF'),
      L('            if (bwd.containsKey(b) && bwd.get(b) != a) return false;', 'clashB'),
      L('            fwd.put(a, b); bwd.put(b, a);', 'set'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    const t = (values.t ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,12}$/.test(s) || !/^[a-z]{1,12}$/.test(t)) return { error: 'Both strings: 1–12 lowercase letters.' };
    const steps: Step[] = [];
    const fwd = new Map<string, string>();
    const bwd = new Map<string, string>();
    const st = (i?: number, bad = false): ArrayState => ({
      arr: s.split('').map((c, k) => `${c}→${t[k] ?? '?'}`),
      mark: i !== undefined ? { [i]: bad ? 'dim' : 'active' } : {},
      aggs: [
        { label: 's → t', value: [...fwd.entries()].map(([a, b]) => `${a}→${b}`).join('  ') || '—', c: 'a' },
        { label: 't → s', value: [...bwd.entries()].map(([b, a]) => `${b}→${a}`).join('  ') || '—', c: 'b' },
      ],
    });
    if (s.length !== t.length) {
      steps.push({ tag: 'len', trace: ['Lengths differ (', F(s.length), ' vs ', F(t.length), ') — no one-to-one mapping is possible.'], state: st() });
      return { steps, result: 'false' };
    }
    steps.push({
      tag: 'init',
      trace: [
        'Isomorphic means a ', A('bijection'), ' between characters. One map is not enough — it would accept "ab" → "aa", where two letters collapse into one.',
      ],
      state: st(),
    });
    for (let i = 0; i < s.length; i++) {
      const a = s[i];
      const b = t[i];
      if (fwd.has(a) && fwd.get(a) !== b) {
        steps.push({
          tag: 'clashF',
          trace: ["'", F(a), "' already maps to '", F(fwd.get(a)!), "' but now needs '", F(b), "' — inconsistent."],
          state: st(i, true),
        });
        return { steps, result: 'false', resultDetail: `conflict at index ${i}` };
      }
      if (bwd.has(b) && bwd.get(b) !== a) {
        steps.push({
          tag: 'clashB',
          trace: ["'", F(b), "' is already taken by '", F(bwd.get(b)!), "', so '", F(a), "' cannot also map to it — two letters would collapse into one."],
          state: st(i, true),
        });
        return { steps, result: 'false', resultDetail: `conflict at index ${i}` };
      }
      fwd.set(a, b);
      bwd.set(b, a);
      steps.push({
        tag: 'set',
        trace: ["Index ", A(i), ": bind '", B(a), "' ↔ '", B(b), "' in both directions."],
        state: st(i),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Every pairing is consistent both ways — the strings ', C('are isomorphic'), '.'], state: st() });
    return { steps, result: 'true' };
  },
  note: 'The reverse map is the whole point of the problem — "badc" and "baba" pass a forward-only check and are still not isomorphic. Comparing the index of first occurrence for each character is a neat one-map alternative that captures the same bijection.',
  complexity: { time: 'O(n)', space: 'O(1) — bounded alphabet' },
};

/* ================= Repeated Substring Pattern ================= */
const repeatedSubstring: ProblemDef = {
  slug: 'repeated-substring-pattern',
  title: 'Repeated Substring Pattern',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/repeated-substring-pattern/',
  technique: 'Use the KMP failure function — the answer hinges on the longest proper prefix that is also a suffix.',
  widget: 'array',
  widgetTitle: 'String & LPS table',
  inputs: [{ key: 's', label: 'String', defaultValue: 'abcabcabc', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool repeatedSubstringPattern(string s) {'),
      L('        int n = s.size();'),
      L('        vector<int> lps(n, 0);'),
      L('        for (int i = 1, len = 0; i < n; ) {', 'build'),
      L('            if (s[i] == s[len]) lps[i++] = ++len;', 'match'),
      L('            else if (len) len = lps[len - 1];', 'fallback'),
      L('            else lps[i++] = 0;', 'zero'),
      L('        }'),
      L('        int k = lps[n - 1];', 'check'),
      L('        return k > 0 && n % (n - k) == 0;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean repeatedSubstringPattern(String s) {'),
      L('        int n = s.length();'),
      L('        int[] lps = new int[n];'),
      L('        for (int i = 1, len = 0; i < n; ) {', 'build'),
      L('            if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len;', 'match'),
      L('            else if (len > 0) len = lps[len - 1];', 'fallback'),
      L('            else lps[i++] = 0;', 'zero'),
      L('        }'),
      L('        int k = lps[n - 1];', 'check'),
      L('        return k > 0 && n % (n - k) == 0;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,14}$/.test(s)) return { error: 'Use 1–14 lowercase letters.' };
    const n = s.length;
    const lps = [...Array(n)].map(() => 0);
    const steps: Step[] = [];
    const st = (i?: number, len?: number): ArrayState => ({
      arr: s.split(''),
      mark: {
        ...(len !== undefined && len < n ? { [len]: 'good' as const } : {}),
        ...(i !== undefined && i < n ? { [i]: 'active' as const } : {}),
      },
      aggs: [{ label: 'LPS (longest prefix that is also a suffix)', value: lps.join(', '), c: 'b' }],
    });
    steps.push({
      tag: 'build',
      trace: [
        'lps[i] is the length of the longest proper prefix of s[0..i] that is also its suffix. A repeating string leaves a very specific footprint there.',
      ],
      state: st(),
    });
    let i = 1;
    let len = 0;
    while (i < n) {
      if (s[i] === s[len]) {
        len++;
        lps[i] = len;
        steps.push({
          tag: 'match',
          trace: ["'", A(s[i]), "' matches the prefix character at ", A(len - 1), ' — lps[', A(i), '] = ', B(len), '.'],
          state: st(i, len - 1),
        });
        i++;
      } else if (len > 0) {
        steps.push({
          tag: 'fallback',
          trace: ["'", F(s[i]), "' breaks the run — fall back to lps[", F(len - 1), '] = ', A(lps[len - 1]), ' instead of restarting from zero.'],
          state: st(i, len),
        });
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        steps.push({ tag: 'zero', trace: ['No prefix matches here — lps[', A(i), '] = ', F(0), '.'], state: st(i) });
        i++;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const k = lps[n - 1];
    const period = n - k;
    const ok = k > 0 && n % period === 0;
    steps.push({
      tag: 'check',
      trace: [
        'lps[', A(n - 1), '] = ', A(k), ', so the candidate repeating unit has length ', B(period), ' (', A(n), ' − ', A(k), ').',
      ],
      state: st(),
    });
    steps.push({
      tag: 'ret',
      trace: ok
        ? ['Length ', A(n), ' divides evenly by ', A(period), ' — the string is "', C(s.slice(0, period)), '" repeated ', C(n / period), ' times.']
        : [k === 0 ? 'No prefix is also a suffix' : ['Length ', F(n), ' is not a multiple of ', F(period)].join(''), ' — ', C('not'), ' built from a repeated block.'],
      state: { arr: s.split(''), mark: ok ? Object.fromEntries([...Array(period)].map((_, x) => [x, 'final' as const])) : {} },
    });
    return { steps, result: ok ? 'true' : 'false', resultDetail: ok ? `"${s.slice(0, period)}" × ${n / period}` : undefined };
  },
  note: 'The condition n % (n − lps[n−1]) == 0 works because n − lps[n−1] is the string\'s smallest period; the string tiles exactly when that period divides the length. The neat one-liner (s+s).substring(1, 2n−1).contains(s) is equivalent, but this version explains why.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Add Binary ================= */
const addBinary: ProblemDef = {
  slug: 'add-binary',
  title: 'Add Binary',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/add-binary/',
  technique: 'Column addition from the right, carrying whenever the column sum reaches 2.',
  widget: 'array',
  widgetTitle: 'Binary addition',
  inputs: [
    { key: 'a', label: 'First binary number', defaultValue: '1010' },
    { key: 'b', label: 'Second binary number', defaultValue: '1011' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string addBinary(string a, string b) {'),
      L('        string res;'),
      L('        int i = a.size() - 1, j = b.size() - 1, carry = 0;', 'init'),
      L('        while (i >= 0 || j >= 0 || carry) {', 'loop'),
      L('            int sum = carry;', 'sum'),
      L('            if (i >= 0) sum += a[i--] - \'0\';', 'sum'),
      L('            if (j >= 0) sum += b[j--] - \'0\';', 'sum'),
      L('            res += (sum % 2) + \'0\';', 'digit'),
      L('            carry = sum / 2;', 'carry'),
      L('        }'),
      L('        reverse(res.begin(), res.end());', 'reverse'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String addBinary(String a, String b) {'),
      L('        StringBuilder res = new StringBuilder();'),
      L('        int i = a.length()-1, j = b.length()-1, carry = 0;', 'init'),
      L('        while (i >= 0 || j >= 0 || carry > 0) {', 'loop'),
      L('            int sum = carry;', 'sum'),
      L('            if (i >= 0) sum += a.charAt(i--) - \'0\';', 'sum'),
      L('            if (j >= 0) sum += b.charAt(j--) - \'0\';', 'sum'),
      L('            res.append(sum % 2);', 'digit'),
      L('            carry = sum / 2;', 'carry'),
      L('        }'),
      L('        return res.reverse().toString();', 'reverse'),
      L('    }', 'ret'),
      L('}'),
    ],
  },
  run(values) {
    const a = (values.a ?? '').trim();
    const b = (values.b ?? '').trim();
    if (!/^[01]{1,12}$/.test(a) || !/^[01]{1,12}$/.test(b)) return { error: 'Both inputs: 1–12 binary digits (0 and 1 only).' };
    const steps: Step[] = [];
    const out: string[] = [];
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    const st = (): ArrayState => ({
      arr: [...out].reverse(),
      mark: Object.fromEntries(out.map((_, k) => [k, 'good' as const])),
      aggs: [
        { label: 'a', value: a.split('').map((c, k) => (k === i ? `[${c}]` : c)).join(''), c: 'a' },
        { label: 'b', value: b.split('').map((c, k) => (k === j ? `[${c}]` : c)).join(''), c: 'a' },
        { label: 'carry', value: String(carry), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Add column by column from the ', A('right'), ', exactly like decimal addition — only the carry threshold changes from 10 to ', B(2), '.',
      ],
      state: st(),
    });
    while (i >= 0 || j >= 0 || carry) {
      const da = i >= 0 ? Number(a[i]) : 0;
      const db = j >= 0 ? Number(b[j]) : 0;
      const sum = carry + da + db;
      steps.push({
        tag: 'sum',
        trace: ['Column sum: ', A(da), ' + ', A(db), ' + carry ', A(carry), ' = ', B(sum), '.'],
        state: st(),
      });
      out.push(String(sum % 2));
      carry = sum >> 1;
      steps.push({
        tag: 'digit',
        trace: ['Write ', B(sum % 2), ' and carry ', B(carry), ' into the next column.'],
        state: st(),
      });
      i--;
      j--;
      if (steps.length > MAX_STEPS) break;
    }
    const res = [...out].reverse().join('');
    steps.push({
      tag: 'reverse',
      trace: ['Digits were produced least-significant first, so reverse them.'],
      state: { arr: res.split(''), mark: Object.fromEntries(res.split('').map((_, k) => [k, 'good' as const])) },
    });
    steps.push({
      tag: 'ret',
      trace: [C(a), ' + ', C(b), ' = ', C(res), ' in binary.'],
      state: { arr: res.split(''), mark: Object.fromEntries(res.split('').map((_, k) => [k, 'final' as const])) },
    });
    return { steps, result: res };
  },
  note: 'Keeping the carry in the loop condition handles the case where the result is one digit longer than either input, with no special case afterwards. Converting to integers first would be shorter but breaks immediately on the long inputs the problem allows — string arithmetic is the point.',
  complexity: { time: 'O(max(m, n))', space: 'O(max(m, n))' },
};

/* ================= Longest Happy Prefix ================= */
const longestHappyPrefix: ProblemDef = {
  slug: 'longest-happy-prefix',
  title: 'Longest Happy Prefix',
  category: 'Strings',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/longest-happy-prefix/',
  technique: 'The KMP failure function computes exactly this — the longest proper prefix that is also a suffix.',
  widget: 'array',
  widgetTitle: 'String & LPS table',
  inputs: [{ key: 's', label: 'String', defaultValue: 'level', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string longestPrefix(string s) {'),
      L('        int n = s.size();'),
      L('        vector<int> lps(n, 0);', 'init'),
      L('        for (int i = 1, len = 0; i < n; ) {', 'loop'),
      L('            if (s[i] == s[len]) lps[i++] = ++len;', 'match'),
      L('            else if (len) len = lps[len - 1];', 'fallback'),
      L('            else lps[i++] = 0;', 'zero'),
      L('        }'),
      L('        return s.substr(0, lps[n - 1]);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String longestPrefix(String s) {'),
      L('        int n = s.length();'),
      L('        int[] lps = new int[n];', 'init'),
      L('        for (int i = 1, len = 0; i < n; ) {', 'loop'),
      L('            if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len;', 'match'),
      L('            else if (len > 0) len = lps[len - 1];', 'fallback'),
      L('            else lps[i++] = 0;', 'zero'),
      L('        }'),
      L('        return s.substring(0, lps[n - 1]);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,14}$/.test(s)) return { error: 'Use 1–14 lowercase letters.' };
    const n = s.length;
    const lps = [...Array(n)].map(() => 0);
    const steps: Step[] = [];
    const st = (i?: number, len?: number): ArrayState => ({
      arr: s.split(''),
      mark: {
        ...(len !== undefined && len >= 0 && len < n ? { [len]: 'good' as const } : {}),
        ...(i !== undefined && i < n ? { [i]: 'active' as const } : {}),
      },
      aggs: [{ label: 'LPS', value: lps.join(', '), c: 'b' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'A "happy prefix" is a non-empty prefix that is also a suffix, but not the whole string. That is precisely what the ', A('KMP failure function'), ' computes.',
      ],
      state: st(),
    });
    let i = 1;
    let len = 0;
    while (i < n) {
      if (s[i] === s[len]) {
        len++;
        lps[i] = len;
        steps.push({
          tag: 'match',
          trace: ["'", A(s[i]), "' extends the match — the prefix \"", B(s.slice(0, len)), '" is also a suffix ending at index ', B(i), '.'],
          state: st(i, len - 1),
        });
        i++;
      } else if (len > 0) {
        steps.push({
          tag: 'fallback',
          trace: [
            "'", F(s[i]), "' breaks the match. Rather than restart, jump to lps[", A(len - 1), '] = ', A(lps[len - 1]),
            ' — the next-best prefix that is still a suffix. That fallback is what keeps this linear.',
          ],
          state: st(i, len),
        });
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        steps.push({ tag: 'zero', trace: ['No match and nothing to fall back to — lps[', A(i), '] = ', F(0), '.'], state: st(i) });
        i++;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const ans = s.slice(0, lps[n - 1]);
    steps.push({
      tag: 'ret',
      trace: ans ? ['Longest happy prefix: "', C(ans), '" (length ', C(ans.length), ').'] : ['No proper prefix is also a suffix — the answer is the ', C('empty string'), '.'],
      state: { arr: s.split(''), mark: Object.fromEntries([...Array(ans.length)].map((_, k) => [k, 'final' as const])) },
    });
    return { steps, result: ans || '""', resultDetail: `length ${ans.length}` };
  },
  note: 'The fallback chain is what makes this O(n): on a mismatch, lps[len−1] is the length of the next candidate prefix, so no character is ever re-examined from scratch. Rolling hashes solve it too, but carry collision risk that this exact method does not.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ============================================================
 * Intervals
 * ============================================================ */

/* ================= Interval List Intersections ================= */
const intervalIntersections: ProblemDef = {
  slug: 'interval-list-intersections',
  title: 'Interval List Intersections',
  category: 'Intervals',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/interval-list-intersections/',
  technique: 'Two pointers: the overlap is [max of starts, min of ends]; advance whichever ends first.',
  widget: 'intervals',
  widgetTitle: 'Two sorted interval lists',
  inputs: [
    { key: 'a', label: 'List A (e.g. 0-2, 5-10)', defaultValue: '0-2, 5-10, 13-23', wide: true },
    { key: 'b', label: 'List B', defaultValue: '1-5, 8-12, 15-24', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> intervalIntersection('),
      L('            vector<vector<int>>& A, vector<vector<int>>& B) {'),
      L('        vector<vector<int>> res;'),
      L('        int i = 0, j = 0;', 'init'),
      L('        while (i < A.size() && j < B.size()) {', 'loop'),
      L('            int lo = max(A[i][0], B[j][0]);', 'overlap'),
      L('            int hi = min(A[i][1], B[j][1]);', 'overlap'),
      L('            if (lo <= hi) res.push_back({lo, hi});', 'take'),
      L('            if (A[i][1] < B[j][1]) i++;', 'advA'),
      L('            else j++;', 'advB'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] intervalIntersection(int[][] A, int[][] B) {'),
      L('        List<int[]> res = new ArrayList<>();'),
      L('        int i = 0, j = 0;', 'init'),
      L('        while (i < A.length && j < B.length) {', 'loop'),
      L('            int lo = Math.max(A[i][0], B[j][0]);', 'overlap'),
      L('            int hi = Math.min(A[i][1], B[j][1]);', 'overlap'),
      L('            if (lo <= hi) res.add(new int[]{lo, hi});', 'take'),
      L('            if (A[i][1] < B[j][1]) i++;', 'advA'),
      L('            else j++;', 'advB'),
      L('        }'),
      L('        return res.toArray(new int[0][]);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parse = (raw: string, label: string): [number, number][] | string => {
      const parts = (raw ?? '').split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return `${label} is empty — enter intervals like "0-2, 5-10".`;
      if (parts.length > 6) return `Keep ${label} to at most 6 intervals.`;
      const out: [number, number][] = [];
      for (const p of parts) {
        const m = p.match(/^(-?\d+)\s*[-–:]\s*(-?\d+)$/);
        if (!m) return `Bad interval "${p}" in ${label} — use "start-end".`;
        const s = Number(m[1]);
        const e = Number(m[2]);
        if (e < s) return `Interval "${p}" ends before it starts.`;
        out.push([s, e]);
      }
      for (let k = 1; k < out.length; k++) if (out[k][0] < out[k - 1][1]) return `${label} must be sorted and disjoint.`;
      return out;
    };
    const listA = parse(values.a, 'List A');
    if (typeof listA === 'string') return { error: listA };
    const listB = parse(values.b, 'List B');
    if (typeof listB === 'string') return { error: listB };

    const lo = Math.min(listA[0][0], listB[0][0]);
    const hi = Math.max(listA[listA.length - 1][1], listB[listB.length - 1][1]);
    const steps: Step[] = [];
    const res: [number, number][] = [];
    let i = 0;
    let j = 0;
    const view = (): IntervalsState => ({
      intervals: [
        ...listA.map((p, k) => ({ s: p[0], e: p[1], label: `A${k}`, mark: k === i ? ('active' as const) : k < i ? ('dim' as const) : undefined })),
        ...listB.map((p, k) => ({ s: p[0], e: p[1], label: `B${k}`, mark: k === j ? ('good' as const) : k < j ? ('dim' as const) : undefined })),
        ...res.map((p) => ({ s: p[0], e: p[1], label: '∩', mark: 'final' as const })),
      ],
      domain: [lo, hi],
      aggs: [{ label: 'intersections', value: res.map((p) => `[${p[0]},${p[1]}]`).join(' ') || '—', c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Both lists are sorted and internally disjoint, so a single sweep works — no need to compare every pair.',
      ],
      state: view(),
    });
    while (i < listA.length && j < listB.length) {
      const start = Math.max(listA[i][0], listB[j][0]);
      const end = Math.min(listA[i][1], listB[j][1]);
      if (start <= end) {
        res.push([start, end]);
        steps.push({
          tag: 'take',
          trace: [
            'A', A(i), ' = [', A(listA[i][0]), ',', A(listA[i][1]), '] and B', A(j), ' = [', A(listB[j][0]), ',', A(listB[j][1]), '] overlap on [', C(start), ',', C(end),
            '] — the later start and the earlier end.',
          ],
          state: view(),
        });
      } else {
        steps.push({
          tag: 'overlap',
          trace: ['A', A(i), ' and B', A(j), ' do not overlap (', F(start), ' > ', F(end), ') — nothing to record.'],
          state: view(),
        });
      }
      if (listA[i][1] < listB[j][1]) {
        steps.push({
          tag: 'advA',
          trace: ['A', A(i), ' ends first at ', A(listA[i][1]), ', so it can never meet a later B interval — advance ', B('A'), '.'],
          state: view(),
        });
        i++;
      } else {
        steps.push({
          tag: 'advB',
          trace: ['B', A(j), ' ends first at ', A(listB[j][1]), ' — advance ', B('B'), '.'],
          state: view(),
        });
        j++;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? [C(res.length), ' intersection(s): ', C(res.map((p) => `[${p[0]},${p[1]}]`).join(', ')), '.'] : ['The two lists never overlap.'],
      state: view(),
    });
    return { steps, result: res.length ? res.map((p) => `[${p[0]},${p[1]}]`).join(', ') : 'none' };
  },
  note: 'Advancing whichever interval ends first is safe because that interval is finished with everything remaining in the other list — its end is below every later start. Each pointer moves at most n times, giving one clean linear pass instead of an O(m·n) pairwise comparison.',
  complexity: { time: 'O(m + n)', space: 'O(1) beyond output' },
};

export const greedyStrings2: ProblemDef[] = [
  assignCookies,
  lemonadeChange,
  candy,
  minArrows,
  queueReconstruction,
  reverseWords,
  isomorphicStrings,
  repeatedSubstring,
  addBinary,
  longestHappyPrefix,
  intervalIntersections,
];
