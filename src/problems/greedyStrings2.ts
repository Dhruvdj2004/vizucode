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
  brute: {
    label: 'Scan all cookies',
    technique: 'For each child from least to most greedy, scan every cookie to find the smallest unused one that satisfies them.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findContentChildren(vector<int>& g, vector<int>& s) {'),
        L('        sort(g.begin(), g.end());', 'init'),
        L('        vector<bool> used(s.size(), false); int fed = 0;', 'init'),
        L('        for (int child : g) {', 'child'),
        L('            int pick = -1;', 'child'),
        L('            for (int j = 0; j < s.size(); j++)  // O(m) scan', 'child'),
        L('                if (!used[j] && s[j] >= child && (pick == -1 || s[j] < s[pick])) pick = j;', 'child'),
        L('            if (pick != -1) { used[pick] = true; fed++; }', 'feed'),
        L('        }'),
        L('        return fed;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findContentChildren(int[] g, int[] s) {'),
        L('        Arrays.sort(g);', 'init'),
        L('        boolean[] used = new boolean[s.length]; int fed = 0;', 'init'),
        L('        for (int child : g) {', 'child'),
        L('            int pick = -1;', 'child'),
        L('            for (int j = 0; j < s.length; j++)  // O(m) scan', 'child'),
        L('                if (!used[j] && s[j] >= child && (pick == -1 || s[j] < s[pick])) pick = j;', 'child'),
        L('            if (pick != -1) { used[pick] = true; fed++; }', 'feed'),
        L('        }'),
        L('        return fed;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const gRaw = parseIntArray(values.g, { min: 1, maxLen: 10 });
      if (typeof gRaw === 'string') return { error: gRaw };
      const s = parseIntArray(values.s, { min: 1, maxLen: 10 });
      if (typeof s === 'string') return { error: s };
      const g = [...gRaw].sort((x, y) => x - y);
      const used = s.map(() => false);
      const fed: number[] = [];
      let scans = 0;
      const steps: Step[] = [];
      const st = (pick?: number): StackState => ({
        array: { arr: s, mark: Object.fromEntries(s.map((_, j) => [j, j === pick ? 'active' : used[j] ? 'dim' : undefined]).filter(([, m]) => m)) },
        stack: fed.map((v) => ({ v: `greed ${v}`, c: 'b' as const })),
        stackLabel: 'Children fed',
        aggs: [{ label: 'cookies scanned', value: String(scans), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Children sorted by greed; cookies stay unsorted, so each child scans all of them.'], state: st() });
      for (const child of g) {
        let pick = -1;
        for (let j = 0; j < s.length; j++) {
          scans++;
          if (!used[j] && s[j] >= child && (pick === -1 || s[j] < s[pick])) pick = j;
        }
        if (pick >= 0) {
          used[pick] = true;
          fed.push(child);
          steps.push({ tag: 'feed', trace: ['Child with greed ', A(child), ': smallest cookie that satisfies is ', B(s[pick]), '.'], state: st(pick) });
        } else {
          steps.push({ tag: 'child', trace: ['Child with greed ', F(child), ': no unused cookie is big enough.'], state: st() });
        }
      }
      steps.push({ tag: 'ret', trace: [C(fed.length), ' child(ren) content after ', A(scans), ' cookie checks.'], state: st() });
      return { steps, result: String(fed.length) };
    },
    note: 'Each child rescans every cookie, so this is O(n·m). Sorting the cookies too lets a single pointer sweep both lists in O(n log n + m log m).',
    complexity: { time: 'O(n·m)', space: 'O(m)' },
  },
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
  brute: {
    label: 'Try both ways to change $20',
    technique: 'Whenever a $20 can be changed two ways ($10+$5 or three $5s), explore both with backtracking.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool go(vector<int>& b, int i, int five, int ten) {'),
        L('        if (i == b.size()) return true;', 'ret'),
        L('        if (b[i] == 5) return go(b, i + 1, five + 1, ten);', 'five'),
        L('        if (b[i] == 10) return five > 0 && go(b, i + 1, five - 1, ten + 1);', 'ten', 'fail'),
        L('        bool ok = false;', 'branch'),
        L('        if (ten > 0 && five > 0) ok = go(b, i + 1, five - 1, ten - 1);', 'branch'),
        L('        if (!ok && five >= 3) ok = go(b, i + 1, five - 3, ten);', 'branch'),
        L('        return ok;', 'fail'),
        L('    }'),
        L('public:'),
        L('    bool lemonadeChange(vector<int>& bills) { return go(bills, 0, 0, 0); }', 'init'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean go(int[] b, int i, int five, int ten) {'),
        L('        if (i == b.length) return true;', 'ret'),
        L('        if (b[i] == 5) return go(b, i + 1, five + 1, ten);', 'five'),
        L('        if (b[i] == 10) return five > 0 && go(b, i + 1, five - 1, ten + 1);', 'ten', 'fail'),
        L('        boolean ok = false;', 'branch'),
        L('        if (ten > 0 && five > 0) ok = go(b, i + 1, five - 1, ten - 1);', 'branch'),
        L('        if (!ok && five >= 3) ok = go(b, i + 1, five - 3, ten);', 'branch'),
        L('        return ok;', 'fail'),
        L('    }'),
        L('    public boolean lemonadeChange(int[] bills) { return go(bills, 0, 0, 0); }', 'init'),
        L('}'),
      ],
    },
    run(values) {
      const bills = parseIntArray(values.bills, { min: 5, max: 20, maxLen: 12 });
      if (typeof bills === 'string') return { error: bills };
      if (!bills.every((b) => b === 5 || b === 10 || b === 20)) return { error: 'Each bill must be 5, 10 or 20.' };
      const steps: Step[] = [];
      let calls = 0;
      const st = (i: number, five: number, ten: number, m: 'active' | 'dim' = 'active'): ArrayState => ({
        arr: bills.map((b) => `$${b}`),
        mark: { ...Object.fromEntries(bills.slice(0, i).map((_, k) => [k, 'good' as const])), ...(i < bills.length ? { [i]: m } : {}) },
        aggs: [
          { label: '$5 in till', value: String(five), c: 'a' },
          { label: '$10 in till', value: String(ten), c: 'b' },
          { label: 'calls', value: String(calls), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No "prefer $10+$5" rule: at each $20, try every legal way to give change and back up if it fails later.'], state: st(0, 0, 0) });
      const go = (i: number, five: number, ten: number): boolean => {
        calls++;
        if (i === bills.length) return true;
        const b = bills[i];
        if (b === 5) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'five', trace: ['$5 — keep it.'], state: st(i, five + 1, ten) });
          return go(i + 1, five + 1, ten);
        }
        if (b === 10) {
          if (five === 0) {
            if (steps.length < MAX_STEPS) steps.push({ tag: 'fail', trace: ['$10 but no $5 to give back — this branch fails.'], state: st(i, five, ten, 'dim') });
            return false;
          }
          if (steps.length < MAX_STEPS) steps.push({ tag: 'ten', trace: ['$10 — give back a $5.'], state: st(i, five - 1, ten + 1) });
          return go(i + 1, five - 1, ten + 1);
        }
        if (ten > 0 && five > 0) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'branch', trace: ['$20 — try change as ', A('$10 + $5'), ' first.'], state: st(i, five - 1, ten - 1) });
          if (go(i + 1, five - 1, ten - 1)) return true;
        }
        if (five >= 3) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'branch', trace: ['$20 — try change as ', A('three $5s'), '.'], state: st(i, five - 3, ten) });
          if (go(i + 1, five - 3, ten)) return true;
        }
        if (steps.length < MAX_STEPS) steps.push({ tag: 'fail', trace: ['$20 with no working way to make $15 — back up.'], state: st(i, five, ten, 'dim') });
        return false;
      };
      const ok = go(0, 0, 0);
      steps.push({ tag: 'ret', trace: ['Answer: ', C(String(ok)), ' after ', A(calls), ' calls.'], state: st(bills.length, 0, 0) });
      return { steps, result: String(ok) };
    },
    note: 'Exploring both change options can double the work at every $20. Always preferring $10 + $5 is provably never worse, because $5 bills can make any change a $10 can — so the greedy needs no backtracking.',
    complexity: { time: 'O(2^(#20s))', space: 'O(n) stack' },
  },
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
  brute: {
    label: 'Repeat until stable',
    technique: 'Start everyone at 1 candy and keep sweeping, fixing any child who out-rates a neighbour without having more, until a sweep changes nothing.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int candy(vector<int>& r) {'),
        L('        int n = r.size();', 'init'),
        L('        vector<int> c(n, 1);', 'init'),
        L('        bool changed = true;', 'init'),
        L('        while (changed) {', 'pass'),
        L('            changed = false;', 'pass'),
        L('            for (int i = 0; i < n; i++) {', 'pass'),
        L('                if (i > 0 && r[i] > r[i-1] && c[i] <= c[i-1]) { c[i] = c[i-1] + 1; changed = true; }', 'pass'),
        L('                if (i + 1 < n && r[i] > r[i+1] && c[i] <= c[i+1]) { c[i] = c[i+1] + 1; changed = true; }', 'pass'),
        L('            }'),
        L('        }'),
        L('        return accumulate(c.begin(), c.end(), 0);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int candy(int[] r) {'),
        L('        int n = r.length;', 'init'),
        L('        int[] c = new int[n]; Arrays.fill(c, 1);', 'init'),
        L('        boolean changed = true;', 'init'),
        L('        while (changed) {', 'pass'),
        L('            changed = false;', 'pass'),
        L('            for (int i = 0; i < n; i++) {', 'pass'),
        L('                if (i > 0 && r[i] > r[i-1] && c[i] <= c[i-1]) { c[i] = c[i-1] + 1; changed = true; }', 'pass'),
        L('                if (i + 1 < n && r[i] > r[i+1] && c[i] <= c[i+1]) { c[i] = c[i+1] + 1; changed = true; }', 'pass'),
        L('            }'),
        L('        }'),
        L('        int total = 0; for (int x : c) total += x;', 'ret'),
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
      const st = (fixed: number[] = []): ArrayState => ({
        arr: r,
        mark: Object.fromEntries(fixed.map((i) => [i, 'active' as const])),
        aggs: [
          { label: 'candies', value: c.join(', '), c: 'b' },
          { label: 'total', value: String(c.reduce((a, b) => a + b, 0)), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Everyone starts with 1. Sweep repeatedly, fixing any violation, until nothing changes.'], state: st() });
      let pass = 0;
      let changed = true;
      while (changed) {
        changed = false;
        pass++;
        const fixed: number[] = [];
        for (let i = 0; i < n; i++) {
          if (i > 0 && r[i] > r[i - 1] && c[i] <= c[i - 1]) {
            c[i] = c[i - 1] + 1;
            changed = true;
            fixed.push(i);
          }
          if (i + 1 < n && r[i] > r[i + 1] && c[i] <= c[i + 1]) {
            c[i] = c[i + 1] + 1;
            changed = true;
            fixed.push(i);
          }
        }
        steps.push({ tag: 'pass', trace: ['Sweep ', A(pass), ': ', changed ? ['fixed ', fixed.length, ' child(ren) — sweep again.'].join('') : 'no violations left.'], state: st(fixed) });
      }
      const total = c.reduce((a, b) => a + b, 0);
      steps.push({ tag: 'ret', trace: ['Stable after ', A(pass), ' sweeps — ', C(total), ' candies.'], state: st() });
      return { steps, result: String(total), resultDetail: c.join(', ') };
    },
    note: 'A long falling run fixes only one more child per sweep, so this can take n sweeps — O(n²). One left-to-right and one right-to-left pass settle rising and falling runs directly.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Try every set of shots',
    technique: 'An optimal arrow can always sit at some balloon’s right edge; try every subset of right edges, smallest first, until one bursts everything.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findMinArrowShots(vector<vector<int>>& p) {'),
        L('        int n = p.size(), best = n;', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try'),
        L('            if (__builtin_popcount(mask) >= best) continue;', 'try'),
        L('            bool all = true;', 'try'),
        L('            for (auto& b : p) {', 'try'),
        L('                bool hit = false;', 'try'),
        L('                for (int i = 0; i < n; i++)', 'try'),
        L('                    if (mask >> i & 1 && b[0] <= p[i][1] && p[i][1] <= b[1]) hit = true;', 'try'),
        L('                all &= hit;', 'try'),
        L('            }'),
        L('            if (all) best = __builtin_popcount(mask);', 'hit'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findMinArrowShots(int[][] p) {'),
        L('        int n = p.length, best = n;', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try'),
        L('            if (Integer.bitCount(mask) >= best) continue;', 'try'),
        L('            boolean all = true;', 'try'),
        L('            for (int[] b : p) {', 'try'),
        L('                boolean hit = false;', 'try'),
        L('                for (int i = 0; i < n; i++)', 'try'),
        L('                    if ((mask >> i & 1) == 1 && b[0] <= p[i][1] && p[i][1] <= b[1]) hit = true;', 'try'),
        L('                all &= hit;', 'try'),
        L('            }'),
        L('            if (all) best = Integer.bitCount(mask);', 'hit'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parts = (values.intervals ?? '').split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return { error: 'Enter balloons like "1-6, 2-8".' };
      if (parts.length > 8) return { error: 'Keep it to at most 8 balloons.' };
      const pts: [number, number][] = [];
      for (const p of parts) {
        const m = p.match(/^(-?\d+)\s*[-–:]\s*(-?\d+)$/);
        if (!m) return { error: `Bad balloon "${p}" — use "start-end".` };
        const s = Number(m[1]);
        const e = Number(m[2]);
        if (e < s) return { error: `Balloon "${p}" ends before it starts.` };
        pts.push([s, e]);
      }
      const n = pts.length;
      const lo = Math.min(...pts.map((p) => p[0]));
      const hi = Math.max(...pts.map((p) => p[1]));
      const steps: Step[] = [];
      let best = n;
      let bestShots = pts.map((p) => p[1]);
      let tried = 0;
      const view = (shots: number[]): IntervalsState => ({
        intervals: pts.map(([s, e]) => ({ s, e, label: `${s}–${e}`, mark: shots.some((x) => s <= x && x <= e) ? ('good' as const) : ('dim' as const) })),
        domain: [lo, hi],
        aggs: [
          { label: 'shots tried', value: shots.join(', ') || '—', c: 'a' },
          { label: 'fewest so far', value: String(best), c: 'c' },
          { label: 'subsets checked', value: String(tried), c: 'b' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Any arrow can slide right to some balloon’s right edge without losing hits, so only those ', A(n), ' positions need testing.'], state: view([]) });
      for (let mask = 1; mask < 1 << n; mask++) {
        const shots = pts.filter((_, i) => mask >> i & 1).map((p) => p[1]);
        if (shots.length >= best) continue;
        tried++;
        const all = pts.every(([s, e]) => shots.some((x) => s <= x && x <= e));
        if (all) {
          best = shots.length;
          bestShots = shots;
          steps.push({ tag: 'hit', trace: ['Shots at ', B(shots.join(', ')), ' burst every balloon — ', B(best), ' arrow(s).'], state: view(shots) });
        } else if (steps.length < 30) {
          steps.push({ tag: 'try', trace: ['Shots at ', A(shots.join(', ')), ' miss some balloons.'], state: view(shots) });
        }
      }
      steps.push({ tag: 'ret', trace: ['Fewest arrows: ', C(best), '.'], state: view(bestShots) });
      return { steps, result: String(best), resultDetail: `shots at ${[...bestShots].sort((a, b) => a - b).join(', ')}` };
    },
    note: 'Exponential in the number of balloons. Sorting by right edge and shooting at the first unburst balloon’s right edge is provably optimal and takes O(n log n).',
    complexity: { time: 'O(2ⁿ · n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Shortest first into empty slots',
    technique: 'Sort shortest first; each person takes the (k+1)-th slot that is still empty or will hold someone at least as tall.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {'),
        L('        sort(people.begin(), people.end(), [](auto& a, auto& b) {', 'sort'),
        L('            return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];', 'sort'),
        L('        });'),
        L('        int n = people.size();', 'sort'),
        L('        vector<vector<int>> res(n);', 'sort'),
        L('        for (auto& p : people) {', 'place'),
        L('            int skip = p[1];', 'place'),
        L('            for (int i = 0; i < n; i++)', 'place'),
        L('                if (res[i].empty()) { if (skip-- == 0) { res[i] = p; break; } }', 'place'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] reconstructQueue(int[][] people) {'),
        L('        Arrays.sort(people, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);', 'sort'),
        L('        int n = people.length;', 'sort'),
        L('        int[][] res = new int[n][];', 'sort'),
        L('        for (int[] p : people) {', 'place'),
        L('            int skip = p[1];', 'place'),
        L('            for (int i = 0; i < n; i++)', 'place'),
        L('                if (res[i] == null && skip-- == 0) { res[i] = p; break; }', 'place'),
        L('        }'),
        L('        return res;', 'ret'),
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
      const n = people.length;
      const sorted = [...people].sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));
      const res: ([number, number] | null)[] = Array(n).fill(null);
      const steps: Step[] = [];
      const st = (hl?: number): ArrayState => ({
        arr: res.map((p) => (p ? `${p[0]},${p[1]}` : '·')),
        mark: hl !== undefined ? { [hl]: 'active' } : {},
      });
      steps.push({ tag: 'sort', trace: ['Sort shortest first (ties: larger k first): ', A(sorted.map(([h, k]) => `[${h},${k}]`).join(' ')), '. Every empty slot will later hold someone at least as tall.'], state: st() });
      for (const p of sorted) {
        let skip = p[1];
        let at = -1;
        for (let i = 0; i < n; i++)
          if (!res[i]) {
            if (skip === 0) {
              at = i;
              break;
            }
            skip--;
          }
        if (at < 0) return { error: 'These (height, count) pairs cannot form a valid queue.' };
        res[at] = p;
        steps.push({ tag: 'place', trace: ['[', A(p[0]), ',', A(p[1]), '] needs ', A(p[1]), ' taller-or-equal people ahead: skip that many empty slots and take slot ', B(at), '.'], state: st(at) });
      }
      const out = (res as [number, number][]).map(([h, k]) => `[${h},${k}]`).join(', ');
      steps.push({ tag: 'ret', trace: ['Queue: ', C(out), '.'], state: st() });
      return { steps, result: out };
    },
    note: 'The mirror image of the tallest-first method: here the empty slots stand in for taller people still to come. Both are O(n²); a Fenwick tree can find the k-th empty slot in O(log n) for O(n log n) overall.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Split & join',
    technique: 'Split on spaces, drop empty pieces, reverse the list of words, and join with single spaces.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string reverseWords(string s) {'),
        L('        stringstream in(s); vector<string> words; string w;', 'split'),
        L('        while (in >> w) words.push_back(w);', 'split'),
        L('        reverse(words.begin(), words.end());', 'reverse'),
        L('        string out;', 'join'),
        L('        for (auto& x : words) out += (out.empty() ? "" : " ") + x;', 'join'),
        L('        return out;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String reverseWords(String s) {'),
        L('        String[] words = s.trim().split("\\\\s+");', 'split'),
        L('        Collections.reverse(Arrays.asList(words));', 'reverse'),
        L('        return String.join(" ", words);', 'join', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = values.s ?? '';
      if (s.trim().length === 0) return { error: 'Enter a sentence with at least one word.' };
      if (s.length > 24) return { error: 'Keep it to at most 24 characters.' };
      if (!/^[a-zA-Z ]+$/.test(s)) return { error: 'Use letters and spaces only.' };
      const steps: Step[] = [];
      const words = s.split(' ').filter(Boolean);
      steps.push({ tag: 'split', trace: ['Split on spaces and drop the empty pieces: ', A(words.map((w) => `"${w}"`).join(', ')), '.'], state: { arr: words } });
      const rev = [...words].reverse();
      steps.push({ tag: 'reverse', trace: ['Reverse the list of words.'], state: { arr: rev, mark: Object.fromEntries(rev.map((_, i) => [i, 'active' as const])) } });
      const result = rev.join(' ');
      steps.push({ tag: 'join', trace: ['Join with single spaces: "', C(result), '".'], state: { arr: result.split('').map((c) => (c === ' ' ? '␣' : c)), mark: Object.fromEntries(result.split('').map((_, i) => [i, 'final' as const])) } });
      steps.push({ tag: 'ret', trace: ['Result: "', C(result), '".'], state: { arr: rev, mark: Object.fromEntries(rev.map((_, i) => [i, 'final' as const])) } });
      return { steps, result };
    },
    note: 'The shortest, most readable solution and also O(n) — but it allocates a list of word strings. The double-reversal method works on a single character buffer, which matters in languages with mutable strings.',
    complexity: { time: 'O(n)', space: 'O(n) for the word list' },
  },
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
  brute: {
    label: 'Compare every pair',
    technique: 'For every pair of positions (i, j), s[i] = s[j] must hold exactly when t[i] = t[j].',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isIsomorphic(string s, string t) {'),
        L('        if (s.size() != t.size()) return false;', 'len'),
        L('        for (int i = 0; i < s.size(); i++)', 'pair'),
        L('            for (int j = i + 1; j < s.size(); j++)', 'pair'),
        L('                if ((s[i] == s[j]) != (t[i] == t[j])) return false;', 'pair', 'bad'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isIsomorphic(String s, String t) {'),
        L('        if (s.length() != t.length()) return false;', 'len'),
        L('        for (int i = 0; i < s.length(); i++)', 'pair'),
        L('            for (int j = i + 1; j < s.length(); j++)', 'pair'),
        L('                if ((s.charAt(i) == s.charAt(j)) != (t.charAt(i) == t.charAt(j))) return false;', 'pair', 'bad'),
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
      const st = (mark: ArrayState['mark'] = {}): ArrayState => ({ arr: s.split('').map((c, k) => `${c}→${t[k] ?? '?'}`), mark });
      if (s.length !== t.length) {
        steps.push({ tag: 'len', trace: ['Different lengths — ', C('false'), '.'], state: st() });
        return { steps, result: 'false' };
      }
      steps.push({ tag: 'pair', trace: ['No maps: check that every pair of positions agrees in both strings.'], state: st() });
      for (let i = 0; i < s.length; i++)
        for (let j = i + 1; j < s.length; j++) {
          const bad = (s[i] === s[j]) !== (t[i] === t[j]);
          if (bad) {
            steps.push({ tag: 'bad', trace: ['Positions ', A(i), ' and ', A(j), ': s says ', F(s[i] === s[j] ? 'same' : 'different'), ' but t says ', F(t[i] === t[j] ? 'same' : 'different'), ' — ', C('false'), '.'], state: st({ [i]: 'dim', [j]: 'dim' }) });
            return { steps, result: 'false', resultDetail: `conflict at index ${j}` };
          }
          if (s[i] === s[j] && steps.length < 40) steps.push({ tag: 'pair', trace: ['Positions ', A(i), ' and ', A(j), ' match in both strings.'], state: st({ [i]: 'good', [j]: 'good' }) });
        }
      steps.push({ tag: 'ret', trace: ['Every pair agrees — ', C('true'), '.'], state: st() });
      return { steps, result: 'true' };
    },
    note: 'O(n²) pair checks with no extra memory. Two character maps (s→t and t→s) check the same one-to-one condition in a single pass.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
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
  brute: {
    label: 'Try every period',
    technique: 'For each length p that divides n, check whether repeating s[0..p) n / p times rebuilds s.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool repeatedSubstringPattern(string s) {'),
        L('        int n = s.size();', 'init'),
        L('        for (int p = 1; p <= n / 2; p++) {', 'try'),
        L('            if (n % p) continue;', 'try'),
        L('            string rep;', 'try'),
        L('            for (int k = 0; k < n / p; k++) rep += s.substr(0, p);', 'try'),
        L('            if (rep == s) return true;', 'hit'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean repeatedSubstringPattern(String s) {'),
        L('        int n = s.length();', 'init'),
        L('        for (int p = 1; p <= n / 2; p++) {', 'try'),
        L('            if (n % p != 0) continue;', 'try'),
        L('            if (s.substring(0, p).repeat(n / p).equals(s)) return true;', 'try', 'hit'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,14}$/.test(s)) return { error: 'Use 1–14 lowercase letters.' };
      const n = s.length;
      const steps: Step[] = [];
      const st = (p?: number, ok?: boolean): ArrayState => ({
        arr: s.split(''),
        mark: p ? Object.fromEntries(s.split('').map((_, i) => [i, i < p ? (ok ? 'final' : 'active') : ok ? 'good' : undefined]).filter(([, m]) => m)) : {},
      });
      steps.push({ tag: 'init', trace: ['A repeating unit must divide the length ', A(n), '. Try each such length.'], state: st() });
      let period = 0;
      for (let p = 1; p <= n / 2; p++) {
        if (n % p) continue;
        const unit = s.slice(0, p);
        const ok = unit.repeat(n / p) === s;
        steps.push({ tag: ok ? 'hit' : 'try', trace: ['"', A(unit), '" × ', A(n / p), ok ? [' = s — a match!'].join('') : ' ≠ s.'], state: st(p, ok) });
        if (ok) {
          period = p;
          break;
        }
      }
      const ok = period > 0;
      steps.push({ tag: 'ret', trace: ['Answer: ', C(String(ok)), '.'], state: st(period || undefined, ok) });
      return { steps, result: ok ? 'true' : 'false', resultDetail: ok ? `"${s.slice(0, period)}" × ${n / period}` : undefined };
    },
    note: 'Each candidate period costs O(n) to verify, and there are up to d(n) divisors, so this is O(n · d(n)). The KMP failure function reads the smallest period straight off lps[n − 1] in O(n).',
    complexity: { time: 'O(n · d(n))', space: 'O(n)' },
  },
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
  brute: {
    label: 'Convert, add, convert back',
    technique: 'Parse both strings as integers, add them, and write the sum back in base 2.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string addBinary(string a, string b) {'),
        L('        unsigned long long x = stoull(a, nullptr, 2), y = stoull(b, nullptr, 2);', 'parse'),
        L('        unsigned long long sum = x + y;', 'add'),
        L('        if (sum == 0) return "0";', 'ret'),
        L('        string out;', 'back'),
        L('        while (sum) { out += char(\'0\' + sum % 2); sum /= 2; }', 'back'),
        L('        reverse(out.begin(), out.end());', 'back'),
        L('        return out;  // overflows past 64 bits!', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String addBinary(String a, String b) {'),
        L('        BigInteger x = new BigInteger(a, 2), y = new BigInteger(b, 2);', 'parse'),
        L('        BigInteger sum = x.add(y);', 'add'),
        L('        return sum.toString(2);', 'back', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = (values.a ?? '').trim();
      const b = (values.b ?? '').trim();
      if (!/^[01]{1,12}$/.test(a) || !/^[01]{1,12}$/.test(b)) return { error: 'Both inputs: 1–12 binary digits (0 and 1 only).' };
      const x = parseInt(a, 2);
      const y = parseInt(b, 2);
      const sum = x + y;
      const res = sum.toString(2);
      const steps: Step[] = [];
      steps.push({ tag: 'parse', trace: ['Read "', A(a), '" as ', B(x), ' and "', A(b), '" as ', B(y), ' (base 10).'], state: { arr: [a, b], aggs: [{ label: 'values', value: `${x} + ${y}`, c: 'a' }] } });
      steps.push({ tag: 'add', trace: ['Add them: ', B(sum), '.'], state: { arr: [String(sum)], aggs: [{ label: 'sum', value: String(sum), c: 'b' }] } });
      steps.push({ tag: 'back', trace: ['Write ', A(sum), ' in base 2: ', C(res), '.'], state: { arr: res.split(''), mark: Object.fromEntries(res.split('').map((_, i) => [i, 'final' as const])) } });
      steps.push({ tag: 'ret', trace: ['Result: ', C(res), '.'], state: { arr: res.split(''), mark: Object.fromEntries(res.split('').map((_, i) => [i, 'final' as const])) } });
      return { steps, result: res };
    },
    note: 'Fine for short inputs, but LeetCode strings can be 10⁴ digits long — far beyond 64-bit integers, so C++ overflows and Java needs BigInteger. Column addition with a carry handles any length in O(n).',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Try every length',
    technique: 'From the longest proper length down, compare the prefix and suffix of that length directly.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string longestPrefix(string s) {'),
        L('        int n = s.size();', 'init'),
        L('        for (int len = n - 1; len > 0; len--)', 'try'),
        L('            if (s.compare(0, len, s, n - len, len) == 0)', 'try', 'hit'),
        L('                return s.substr(0, len);', 'hit'),
        L('        return "";', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String longestPrefix(String s) {'),
        L('        int n = s.length();', 'init'),
        L('        for (int len = n - 1; len > 0; len--)', 'try'),
        L('            if (s.substring(0, len).equals(s.substring(n - len)))', 'try', 'hit'),
        L('                return s.substring(0, len);', 'hit'),
        L('        return "";', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,14}$/.test(s)) return { error: 'Use 1–14 lowercase letters.' };
      const n = s.length;
      const steps: Step[] = [];
      let compares = 0;
      const st = (len: number, ok: boolean): ArrayState => ({
        arr: s.split(''),
        mark: Object.fromEntries(s.split('').map((_, i) => [i, i < len ? (ok ? 'final' : 'active') : i >= n - len ? (ok ? 'final' : 'src') : undefined]).filter(([, m]) => m)),
        aggs: [{ label: 'characters compared', value: String(compares), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Try every proper length from ', A(n - 1), ' down; the first prefix that equals the suffix wins.'], state: st(0, false) });
      let ans = '';
      for (let len = n - 1; len > 0; len--) {
        const pre = s.slice(0, len);
        const suf = s.slice(n - len);
        let k = 0;
        while (k < len && pre[k] === suf[k]) k++;
        compares += Math.min(k + 1, len);
        if (pre === suf) {
          ans = pre;
          steps.push({ tag: 'hit', trace: ['Length ', A(len), ': "', B(pre), '" = "', B(suf), '" — found.'], state: st(len, true) });
          break;
        }
        steps.push({ tag: 'try', trace: ['Length ', A(len), ': "', F(pre), '" ≠ "', F(suf), '".'], state: st(len, false) });
      }
      steps.push({ tag: 'ret', trace: ['Longest happy prefix: "', C(ans), '".'], state: st(ans.length, !!ans) });
      return { steps, result: ans || '""', resultDetail: `length ${ans.length}` };
    },
    note: 'Up to n lengths, each compared in O(n), so O(n²) in the worst case (e.g. "aaaa…ab"). The KMP failure function computes this exact value — lps[n − 1] — in one linear pass.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Check every pair',
    technique: 'Intersect every interval of A with every interval of B and keep the non-empty overlaps.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> intervalIntersection(vector<vector<int>>& a, vector<vector<int>>& b) {'),
        L('        vector<vector<int>> res;', 'init'),
        L('        for (auto& x : a)', 'pair'),
        L('            for (auto& y : b) {', 'pair'),
        L('                int lo = max(x[0], y[0]), hi = min(x[1], y[1]);', 'pair'),
        L('                if (lo <= hi) res.push_back({lo, hi});', 'hit'),
        L('            }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] intervalIntersection(int[][] a, int[][] b) {'),
        L('        List<int[]> res = new ArrayList<>();', 'init'),
        L('        for (int[] x : a)', 'pair'),
        L('            for (int[] y : b) {', 'pair'),
        L('                int lo = Math.max(x[0], y[0]), hi = Math.min(x[1], y[1]);', 'pair'),
        L('                if (lo <= hi) res.add(new int[]{lo, hi});', 'hit'),
        L('            }'),
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
      const view = (i?: number, j?: number): IntervalsState => ({
        intervals: [
          ...listA.map(([s, e], k) => ({ s, e, label: `A${k}`, mark: k === i ? ('active' as const) : undefined })),
          ...listB.map(([s, e], k) => ({ s, e, label: `B${k}`, mark: k === j ? ('active' as const) : undefined })),
          ...res.map(([s, e]) => ({ s, e, label: 'overlap', mark: 'final' as const })),
        ],
        domain: [lo, hi],
        aggs: [{ label: 'pairs checked', value: `${i === undefined ? 0 : i * listB.length + (j ?? 0) + 1} / ${listA.length * listB.length}`, c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No two pointers: intersect all ', A(listA.length * listB.length), ' pairs.'], state: view() });
      listA.forEach(([as, ae], i) =>
        listB.forEach(([bs, be], j) => {
          const s = Math.max(as, bs);
          const e = Math.min(ae, be);
          if (s <= e) {
            res.push([s, e]);
            steps.push({ tag: 'hit', trace: ['A', A(i), ' ∩ B', A(j), ' = [', B(s), ',', B(e), '].'], state: view(i, j) });
          } else if (steps.length < 40) {
            steps.push({ tag: 'pair', trace: ['A', A(i), ' and B', A(j), ' do not overlap.'], state: view(i, j) });
          }
        }),
      );
      steps.push({ tag: 'ret', trace: res.length ? ['Intersections: ', C(res.map((p) => `[${p[0]},${p[1]}]`).join(', ')), '.'] : ['No overlaps.'], state: view() });
      return { steps, result: res.length ? res.map((p) => `[${p[0]},${p[1]}]`).join(', ') : 'none' };
    },
    note: 'Every pair is examined, so the cost is O(m·n) even though most pairs are far apart. Because both lists are sorted and disjoint, two pointers that advance whichever interval ends first visit each interval once.',
    complexity: { time: 'O(m·n)', space: 'O(1) beyond output' },
  },
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
