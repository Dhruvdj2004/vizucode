// Sliding Window, part 2 — Striver SDE / Love Babbar sheet staples.
import type { ArrayState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ================= Fruit Into Baskets ================= */
const fruitIntoBaskets: ProblemDef = {
  slug: 'fruit-into-baskets',
  title: 'Fruit Into Baskets',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/fruit-into-baskets/',
  technique: 'Longest window containing at most two distinct values.',
  widget: 'array',
  widgetTitle: 'Row of trees (fruit types)',
  inputs: [{ key: 'nums', label: 'Fruit types', defaultValue: '1, 2, 1, 2, 3, 2, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int totalFruit(vector<int>& f) {'),
      L('        unordered_map<int,int> cnt;'),
      L('        int l = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < f.size(); r++) {', 'grow'),
      L('            cnt[f[r]]++;', 'grow'),
      L('            while (cnt.size() > 2) {', 'shrink'),
      L('                if (--cnt[f[l]] == 0) cnt.erase(f[l]);', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int totalFruit(int[] f) {'),
      L('        Map<Integer,Integer> cnt = new HashMap<>();'),
      L('        int l = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < f.length; r++) {', 'grow'),
      L('            cnt.merge(f[r], 1, Integer::sum);', 'grow'),
      L('            while (cnt.size() > 2) {', 'shrink'),
      L('                if (cnt.merge(f[l], -1, Integer::sum) == 0)', 'shrink'),
      L('                    cnt.remove(f[l]);', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = Math.max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const f = parseIntArray(values.nums, { min: 0, max: 9, maxLen: 16 });
    if (typeof f === 'string') return { error: f };
    const steps: Step[] = [];
    const cnt = new Map<number, number>();
    let l = 0;
    let best = 0;
    let bestRange: [number, number] = [0, -1];
    const st = (r: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: f,
      window: r >= l ? [l, r] : null,
      mark,
      ptrs: [
        { name: 'l', i: l, c: 'b' },
        ...(r < f.length ? [{ name: 'r', i: r, c: 'a' as const }] : []),
      ],
      aggs: [
        { label: 'baskets', value: [...cnt.entries()].map(([k, v]) => `${k}×${v}`).join('  ') || '—', c: 'b' },
        { label: 'best', value: String(best), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Two baskets = at most ', A('two distinct'), ' fruit types in the window. Grow from the right, and only shrink when a third type appears.'],
      state: st(0),
    });
    for (let r = 0; r < f.length; r++) {
      cnt.set(f[r], (cnt.get(f[r]) ?? 0) + 1);
      steps.push({
        tag: 'grow',
        trace: ['Pick fruit ', A(f[r]), ' at tree ', A(r), ' — the window now holds ', B(cnt.size), ' distinct type(s).'],
        state: st(r, { [r]: 'active' }),
      });
      while (cnt.size > 2) {
        const drop = f[l];
        cnt.set(drop, cnt.get(drop)! - 1);
        if (cnt.get(drop) === 0) cnt.delete(drop);
        steps.push({
          tag: 'shrink',
          trace: ['Three types is one too many — drop tree ', F(l), " (fruit ", F(drop), ') from the left.'],
          state: st(r, { [l]: 'dim', [r]: 'active' }),
        });
        l++;
        if (steps.length > MAX_STEPS) break;
      }
      if (r - l + 1 > best) {
        best = r - l + 1;
        bestRange = [l, r];
        steps.push({
          tag: 'best',
          trace: ['Window [', B(l), '..', B(r), '] holds ', C(best), ' trees with only two types — a new best.'],
          state: st(r, { [r]: 'good' }),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Most fruit collectable: ', C(best), ' from trees ', C(`${bestRange[0]}…${bestRange[1]}`), '.'],
      state: { arr: f, window: bestRange, mark: Object.fromEntries([...Array(best)].map((_, i) => [bestRange[0] + i, 'final' as const])), aggs: [{ label: 'best', value: String(best), c: 'c' }] },
    });
    return { steps, result: String(best), resultDetail: `trees ${bestRange[0]}…${bestRange[1]}` };
  },
  note: 'The left edge never moves backwards, so although the inner while loop looks nested, each index is added and removed at most once — the whole scan is O(n), not O(n²). Swap the "> 2" for "> k" and this becomes the general longest-substring-with-k-distinct problem.',
  complexity: { time: 'O(n)', space: 'O(1) — at most 3 keys' },
};

/* ================= Max Consecutive Ones III ================= */
const maxConsecutiveOnesIII: ProblemDef = {
  slug: 'max-consecutive-ones-iii',
  title: 'Max Consecutive Ones III',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/max-consecutive-ones-iii/',
  technique: 'Longest window containing at most k zeros — those are the ones you flip.',
  widget: 'array',
  widgetTitle: 'Binary array',
  inputs: [
    { key: 'nums', label: 'Binary array', defaultValue: '1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0', wide: true },
    { key: 'k', label: 'Flips allowed (k)', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestOnes(vector<int>& a, int k) {'),
      L('        int l = 0, zeros = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < a.size(); r++) {', 'grow'),
      L('            if (a[r] == 0) zeros++;', 'grow'),
      L('            while (zeros > k) {', 'shrink'),
      L('                if (a[l] == 0) zeros--;', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestOnes(int[] a, int k) {'),
      L('        int l = 0, zeros = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < a.length; r++) {', 'grow'),
      L('            if (a[r] == 0) zeros++;', 'grow'),
      L('            while (zeros > k) {', 'shrink'),
      L('                if (a[l] == 0) zeros--;', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = Math.max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 0, max: 1, maxLen: 18 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 0, max: 8 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    let l = 0;
    let zeros = 0;
    let best = 0;
    let bestRange: [number, number] = [0, -1];
    const st = (r: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: a,
      window: r >= l ? [l, r] : null,
      mark,
      ptrs: [
        { name: 'l', i: l, c: 'b' },
        ...(r < a.length ? [{ name: 'r', i: r, c: 'a' as const }] : []),
      ],
      aggs: [
        { label: 'zeros in window', value: `${zeros} / ${k}`, c: zeros > k ? 'a' : 'b' },
        { label: 'best', value: String(best), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Flipping ', A(k), ' zero(s) to one is the same as allowing at most ', A(k), ' zeros inside the window. Find the longest such window.'],
      state: st(0),
    });
    for (let r = 0; r < a.length; r++) {
      if (a[r] === 0) zeros++;
      steps.push({
        tag: 'grow',
        trace: ['Extend right to index ', A(r), a[r] === 0 ? [' — it is a ', A('0'), ', so the window now spends ', B(zeros), ' of its ', B(k), ' flips.'].join('') : ' — already a 1, free to include.'],
        state: st(r, { [r]: 'active' }),
      });
      while (zeros > k) {
        if (a[l] === 0) zeros--;
        steps.push({
          tag: 'shrink',
          trace: ['Over budget — drop index ', F(l), ' from the left', a[l] === 0 ? ', reclaiming a flip.' : '.'],
          state: st(r, { [l]: 'dim', [r]: 'active' }),
        });
        l++;
        if (steps.length > MAX_STEPS) break;
      }
      if (r - l + 1 > best) {
        best = r - l + 1;
        bestRange = [l, r];
        steps.push({ tag: 'best', trace: ['Window [', B(l), '..', B(r), '] is ', C(best), ' long — a new best.'], state: st(r, { [r]: 'good' }) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Longest run of 1s after ', C(k), ' flips: ', C(best), '.'],
      state: { arr: a, window: bestRange, mark: Object.fromEntries([...Array(Math.max(best, 0))].map((_, i) => [bestRange[0] + i, 'final' as const])), aggs: [{ label: 'best', value: String(best), c: 'c' }] },
    });
    return { steps, result: String(best), resultDetail: best ? `indices ${bestRange[0]}…${bestRange[1]}` : undefined };
  },
  note: 'Notice the window never shrinks below its best-ever size — once it is valid we only ever record a longer one. Rephrasing "flip k zeros" as "tolerate k zeros" is the whole trick; the same shape solves longest-repeating-character-replacement.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Number of Substrings Containing All Three Characters ================= */
const substringsAllThree: ProblemDef = {
  slug: 'number-of-substrings-containing-all-three-characters',
  title: 'Number of Substrings Containing All Three Characters',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/',
  technique: 'For each right end, every start up to the least-recent of a/b/c works — add that many at once.',
  widget: 'array',
  widgetTitle: 'String (a/b/c)',
  inputs: [{ key: 's', label: 'String of a, b, c', defaultValue: 'abcabc', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numberOfSubstrings(string s) {'),
      L('        int last[3] = {-1, -1, -1}, ans = 0;', 'init'),
      L('        for (int r = 0; r < s.size(); r++) {', 'loop'),
      L('            last[s[r] - \'a\'] = r;', 'mark'),
      L('            int m = min({last[0], last[1], last[2]});', 'min'),
      L('            ans += m + 1;', 'add'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numberOfSubstrings(String s) {'),
      L('        int[] last = {-1, -1, -1};'),
      L('        int ans = 0;', 'init'),
      L('        for (int r = 0; r < s.length(); r++) {', 'loop'),
      L('            last[s.charAt(r) - \'a\'] = r;', 'mark'),
      L('            int m = Math.min(last[0], Math.min(last[1], last[2]));', 'min'),
      L('            ans += m + 1;', 'add'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[abc]{1,16}$/.test(s)) return { error: 'Use 1–16 characters, only a, b and c.' };
    const ch = s.split('');
    const steps: Step[] = [];
    const last = [-1, -1, -1];
    let ans = 0;
    const st = (r: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: ch,
      mark,
      ptrs: r < ch.length ? [{ name: 'r', i: r, c: 'a' }] : [],
      aggs: [
        { label: 'last seen', value: `a:${last[0]}  b:${last[1]}  c:${last[2]}`, c: 'b' },
        { label: 'count', value: String(ans), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Remember where each of ', A('a'), ', ', A('b'), ', ', A('c'), ' was last seen. Nothing counts until all three have appeared.'],
      state: st(ch.length),
    });
    for (let r = 0; r < ch.length; r++) {
      last[ch[r].charCodeAt(0) - 97] = r;
      steps.push({
        tag: 'mark',
        trace: ["Right end at index ", A(r), " ('", A(ch[r]), "') — update its last-seen position."],
        state: st(r, { [r]: 'active' }),
      });
      const m = Math.min(last[0], last[1], last[2]);
      if (m < 0) {
        steps.push({
          tag: 'min',
          trace: ['At least one of a/b/c has not appeared yet — ', F('no'), ' substring ending here can be valid.'],
          state: st(r, { [r]: 'dim' }),
        });
      } else {
        ans += m + 1;
        steps.push({
          tag: 'add',
          trace: [
            'The rarest of the three was last at index ', A(m), '. Any start from ', B(0), ' to ', B(m), ' still includes all three, so that is ', B(m + 1),
            ' new substring(s). Total: ', C(ans), '.',
          ],
          state: st(r, { ...Object.fromEntries([...Array(m + 1)].map((_, i) => [i, 'good' as const])), [r]: 'active' }),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Substrings containing all of a, b and c: ', C(ans), '.'], state: st(ch.length) });
    return { steps, result: String(ans) };
  },
  note: 'Counting per right end and adding a whole block of starts at once is what avoids enumerating substrings one by one. The bound is exactly the minimum last-seen index, because pushing the start past it would drop that character out of the window.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Count Number of Nice Subarrays ================= */
const niceSubarrays: ProblemDef = {
  slug: 'count-number-of-nice-subarrays',
  title: 'Count Number of Nice Subarrays',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/count-number-of-nice-subarrays/',
  technique: 'exactly(k) = atMost(k) − atMost(k−1), counting odd numbers in the window.',
  widget: 'array',
  widgetTitle: 'Array (odd values matter)',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 1, 2, 1, 1', wide: true },
    { key: 'k', label: 'Odd numbers wanted (k)', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numberOfSubarrays(vector<int>& nums, int k) {'),
      L('        return atMost(nums, k) - atMost(nums, k - 1);', 'combine'),
      L('    }'),
      L('    int atMost(vector<int>& a, int k) {', 'pass'),
      L('        if (k < 0) return 0;', 'pass'),
      L('        int l = 0, odd = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.size(); r++) {', 'grow'),
      L('            odd += a[r] & 1;', 'grow'),
      L('            while (odd > k) odd -= a[l++] & 1;', 'shrink'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numberOfSubarrays(int[] nums, int k) {'),
      L('        return atMost(nums, k) - atMost(nums, k - 1);', 'combine'),
      L('    }'),
      L('    int atMost(int[] a, int k) {', 'pass'),
      L('        if (k < 0) return 0;', 'pass'),
      L('        int l = 0, odd = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.length; r++) {', 'grow'),
      L('            odd += a[r] & 1;', 'grow'),
      L('            while (odd > k) odd -= a[l++] & 1;', 'shrink'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const k = parseInt1(values.k, 'k', { min: 1, max: 8 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    const totals: number[] = [];

    steps.push({
      tag: 'combine',
      trace: ['"Exactly ', A(k), ' odds" is hard to slide directly, but "', B('at most'), ' k odds" is easy — and exactly(k) = atMost(k) − atMost(k−1).'],
      state: { arr: nums, mark: Object.fromEntries(nums.map((v, i) => [i, v % 2 === 1 ? ('active' as const) : ('dim' as const)])) },
    });

    for (const limit of [k, k - 1]) {
      let l = 0;
      let odd = 0;
      let res = 0;
      steps.push({
        tag: 'pass',
        trace: ['Pass with limit ', A(limit), ': count every subarray holding at most ', A(limit), ' odd number(s).'],
        state: { arr: nums, aggs: [{ label: 'limit', value: String(limit), c: 'a' }, { label: 'running total', value: '0', c: 'c' }] },
      });
      if (limit < 0) {
        totals.push(0);
        continue;
      }
      for (let r = 0; r < nums.length; r++) {
        odd += nums[r] & 1;
        const view = (mark: ArrayState['mark']): ArrayState => ({
          arr: nums,
          window: r >= l ? [l, r] : null,
          mark,
          ptrs: [
            { name: 'l', i: l, c: 'b' },
            { name: 'r', i: r, c: 'a' },
          ],
          aggs: [
            { label: 'odds in window', value: `${odd} / ${limit}`, c: odd > limit ? 'a' : 'b' },
            { label: 'running total', value: String(res), c: 'c' },
          ],
        });
        steps.push({
          tag: 'grow',
          trace: ['Add index ', A(r), ' (', A(nums[r]), nums[r] % 2 === 1 ? ', odd' : ', even', ') — window holds ', B(odd), ' odd(s).'],
          state: view({ [r]: 'active' }),
        });
        while (odd > limit) {
          odd -= nums[l] & 1;
          steps.push({ tag: 'shrink', trace: ['Too many odds — drop index ', F(l), ' from the left.'], state: view({ [l]: 'dim', [r]: 'active' }) });
          l++;
          if (steps.length > MAX_STEPS) break;
        }
        res += r - l + 1;
        steps.push({
          tag: 'add',
          trace: ['Every subarray ending at ', A(r), ' and starting anywhere in [', B(l), '..', B(r), '] is valid — that is ', B(r - l + 1), ' more. Total ', C(res), '.'],
          state: view({}),
        });
        if (steps.length > MAX_STEPS) break;
      }
      totals.push(res);
      steps.push({
        tag: 'ret',
        trace: ['atMost(', A(limit), ') = ', C(res), '.'],
        state: { arr: nums, aggs: [{ label: `atMost(${limit})`, value: String(res), c: 'c' }] },
      });
    }

    const ans = totals[0] - (totals[1] ?? 0);
    steps.push({
      tag: 'combine',
      trace: ['Subtract: ', A(totals[0]), ' − ', A(totals[1] ?? 0), ' = ', C(ans), ' subarrays with exactly ', C(k), ' odd numbers.'],
      state: { arr: nums, mark: Object.fromEntries(nums.map((v, i) => [i, v % 2 === 1 ? ('final' as const) : ('dim' as const)])), aggs: [{ label: 'answer', value: String(ans), c: 'c' }] },
    });
    return { steps, result: String(ans) };
  },
  note: 'A window condition like "at most k" is monotone — shrinking always helps — which is exactly what a sliding window needs. "Exactly k" is not, so you express it as a difference of two monotone counts. This atMost(k) − atMost(k−1) pattern is worth memorising; it reappears in several hard-rated problems.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Binary Subarrays With Sum ================= */
const binarySubarraysSum: ProblemDef = {
  slug: 'binary-subarrays-with-sum',
  title: 'Binary Subarrays With Sum',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/binary-subarrays-with-sum/',
  technique: 'exactly(goal) = atMost(goal) − atMost(goal−1) on a 0/1 array.',
  widget: 'array',
  widgetTitle: 'Binary array',
  inputs: [
    { key: 'nums', label: 'Binary array', defaultValue: '1, 0, 1, 0, 1', wide: true },
    { key: 'goal', label: 'Goal sum', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numSubarraysWithSum(vector<int>& nums, int goal) {'),
      L('        return atMost(nums, goal) - atMost(nums, goal - 1);', 'combine'),
      L('    }'),
      L('    int atMost(vector<int>& a, int g) {', 'pass'),
      L('        if (g < 0) return 0;', 'pass'),
      L('        int l = 0, sum = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.size(); r++) {', 'grow'),
      L('            sum += a[r];', 'grow'),
      L('            while (sum > g) sum -= a[l++];', 'shrink'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numSubarraysWithSum(int[] nums, int goal) {'),
      L('        return atMost(nums, goal) - atMost(nums, goal - 1);', 'combine'),
      L('    }'),
      L('    int atMost(int[] a, int g) {', 'pass'),
      L('        if (g < 0) return 0;', 'pass'),
      L('        int l = 0, sum = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.length; r++) {', 'grow'),
      L('            sum += a[r];', 'grow'),
      L('            while (sum > g) sum -= a[l++];', 'shrink'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 1, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const goal = parseInt1(values.goal, 'Goal sum', { min: 0, max: 12 });
    if (typeof goal === 'string') return { error: goal };
    const steps: Step[] = [];
    const totals: number[] = [];
    steps.push({
      tag: 'combine',
      trace: ['A window sum of exactly ', A(goal), ' is not monotone (0s let it stay valid while growing), so count ', B('at most goal'), ' and ', B('at most goal−1'), ' and subtract.'],
      state: { arr: nums, mark: Object.fromEntries(nums.map((v, i) => [i, v === 1 ? ('active' as const) : ('dim' as const)])) },
    });
    for (const limit of [goal, goal - 1]) {
      let l = 0;
      let sum = 0;
      let res = 0;
      steps.push({
        tag: 'pass',
        trace: ['Pass with limit ', A(limit), limit < 0 ? ' — negative, so it counts nothing.' : ': every window whose sum stays ≤ ' + limit + '.'],
        state: { arr: nums, aggs: [{ label: 'limit', value: String(limit), c: 'a' }] },
      });
      if (limit < 0) {
        totals.push(0);
        continue;
      }
      for (let r = 0; r < nums.length; r++) {
        sum += nums[r];
        const view = (mark: ArrayState['mark']): ArrayState => ({
          arr: nums,
          window: r >= l ? [l, r] : null,
          mark,
          ptrs: [
            { name: 'l', i: l, c: 'b' },
            { name: 'r', i: r, c: 'a' },
          ],
          aggs: [
            { label: 'window sum', value: `${sum} / ${limit}`, c: sum > limit ? 'a' : 'b' },
            { label: 'running total', value: String(res), c: 'c' },
          ],
        });
        steps.push({ tag: 'grow', trace: ['Extend to index ', A(r), ' — window sum is ', B(sum), '.'], state: view({ [r]: 'active' }) });
        while (sum > limit) {
          sum -= nums[l];
          steps.push({ tag: 'shrink', trace: ['Sum exceeds ', F(limit), ' — drop index ', F(l), '.'], state: view({ [l]: 'dim', [r]: 'active' }) });
          l++;
          if (steps.length > MAX_STEPS) break;
        }
        res += r - l + 1;
        steps.push({
          tag: 'add',
          trace: [B(r - l + 1), ' subarray(s) end at ', A(r), ' and stay within the limit. Total ', C(res), '.'],
          state: view({}),
        });
        if (steps.length > MAX_STEPS) break;
      }
      totals.push(res);
      steps.push({ tag: 'ret', trace: ['atMost(', A(limit), ') = ', C(res), '.'], state: { arr: nums, aggs: [{ label: `atMost(${limit})`, value: String(res), c: 'c' }] } });
    }
    const ans = totals[0] - (totals[1] ?? 0);
    steps.push({
      tag: 'combine',
      trace: [A(totals[0]), ' − ', A(totals[1] ?? 0), ' = ', C(ans), ' subarrays sum to exactly ', C(goal), '.'],
      state: { arr: nums, aggs: [{ label: 'answer', value: String(ans), c: 'c' }] },
    });
    return { steps, result: String(ans) };
  },
  note: 'The zeros are what break a direct sliding window: with sum already at the goal, adding a 0 keeps it valid, so there is no single left edge to track. Counting two monotone "at most" totals sidesteps that entirely, and a prefix-sum hash map is the other standard route to the same answer.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Maximum Points You Can Obtain from Cards ================= */
const maxPointsCards: ProblemDef = {
  slug: 'maximum-points-you-can-obtain-from-cards',
  title: 'Maximum Points You Can Obtain from Cards',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/',
  technique: 'Taking k from the ends = leaving a window of n−k in the middle — minimise that window.',
  widget: 'array',
  widgetTitle: 'Cards',
  inputs: [
    { key: 'nums', label: 'Card points', defaultValue: '1, 2, 3, 4, 5, 6, 1', wide: true },
    { key: 'k', label: 'Cards to take (k)', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxScore(vector<int>& c, int k) {'),
      L('        int n = c.size(), win = n - k;', 'init'),
      L('        int total = accumulate(c.begin(), c.end(), 0);', 'total'),
      L('        if (win == 0) return total;', 'total'),
      L('        int sum = 0;'),
      L('        for (int i = 0; i < win; i++) sum += c[i];', 'first'),
      L('        int mn = sum;', 'first'),
      L('        for (int r = win; r < n; r++) {', 'slide'),
      L('            sum += c[r] - c[r - win];', 'slide'),
      L('            mn = min(mn, sum);', 'min'),
      L('        }'),
      L('        return total - mn;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxScore(int[] c, int k) {'),
      L('        int n = c.length, win = n - k;', 'init'),
      L('        int total = 0;'),
      L('        for (int x : c) total += x;', 'total'),
      L('        if (win == 0) return total;', 'total'),
      L('        int sum = 0;'),
      L('        for (int i = 0; i < win; i++) sum += c[i];', 'first'),
      L('        int mn = sum;', 'first'),
      L('        for (int r = win; r < n; r++) {', 'slide'),
      L('            sum += c[r] - c[r - win];', 'slide'),
      L('            mn = Math.min(mn, sum);', 'min'),
      L('        }'),
      L('        return total - mn;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const c = parseIntArray(values.nums, { min: 0, maxLen: 14 });
    if (typeof c === 'string') return { error: c };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > c.length) return { error: `k cannot exceed the number of cards (${c.length}).` };
    const n = c.length;
    const win = n - k;
    const total = c.reduce((x, y) => x + y, 0);
    const steps: Step[] = [];
    steps.push({
      tag: 'init',
      trace: ['You take ', A(k), ' cards from the two ends. Whatever is left is one ', B('contiguous block'), ' of ', B(win), ' card(s) in the middle.'],
      state: { arr: c, aggs: [{ label: 'k', value: String(k), c: 'a' }, { label: 'block left behind', value: String(win), c: 'b' }] },
    });
    steps.push({
      tag: 'total',
      trace: ['Total of all cards is ', A(total), '. So maximising what you take = ', B('minimising'), ' the block you leave.'],
      state: { arr: c, mark: Object.fromEntries(c.map((_, i) => [i, 'good' as const])), aggs: [{ label: 'total', value: String(total), c: 'a' }] },
    });
    if (win === 0) {
      steps.push({
        tag: 'ret',
        trace: ['k equals the whole deck — take everything: ', C(total), '.'],
        state: { arr: c, mark: Object.fromEntries(c.map((_, i) => [i, 'final' as const])) },
      });
      return { steps, result: String(total) };
    }
    let sum = 0;
    for (let i = 0; i < win; i++) sum += c[i];
    let mn = sum;
    let mnAt = 0;
    const view = (l: number, r: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: c,
      window: [l, r],
      mark,
      aggs: [
        { label: 'block sum', value: String(sum), c: 'a' },
        { label: 'smallest block', value: String(mn), c: 'b' },
        { label: 'points if so', value: String(total - mn), c: 'c' },
      ],
    });
    steps.push({
      tag: 'first',
      trace: ['First block [0..', A(win - 1), '] sums to ', B(sum), ' — leaving that means taking ', C(total - sum), ' points.'],
      state: view(0, win - 1),
    });
    for (let r = win; r < n; r++) {
      sum += c[r] - c[r - win];
      steps.push({
        tag: 'slide',
        trace: ['Slide the block right: add ', A(c[r]), ', drop ', F(c[r - win]), ' — sum ', B(sum), '.'],
        state: view(r - win + 1, r, { [r]: 'active', [r - win]: 'dim' }),
      });
      if (sum < mn) {
        mn = sum;
        mnAt = r - win + 1;
        steps.push({ tag: 'min', trace: ['Smallest block so far — leaving it yields ', C(total - mn), ' points.'], state: view(r - win + 1, r) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const ans = total - mn;
    steps.push({
      tag: 'ret',
      trace: ['Leave the cheapest block (', C(c.slice(mnAt, mnAt + win).join(', ')), ') and take the rest: ', C(ans), ' points.'],
      state: {
        arr: c,
        window: [mnAt, mnAt + win - 1],
        mark: Object.fromEntries(c.map((_, i) => [i, i >= mnAt && i < mnAt + win ? ('dim' as const) : ('final' as const)])),
        aggs: [{ label: 'max points', value: String(ans), c: 'c' }],
      },
    });
    return { steps, result: String(ans) };
  },
  note: 'The reframing is the entire problem: "pick from either end" sounds like a search over 2^k choices, but the cards you leave behind are always one contiguous run, so a single fixed-size sliding window settles it. Fixed-size windows need no inner shrink loop — one add and one subtract per step.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Subarrays with K Different Integers ================= */
const subarraysKDistinct: ProblemDef = {
  slug: 'subarrays-with-k-different-integers',
  title: 'Subarrays with K Different Integers',
  category: 'Sliding Window',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/subarrays-with-k-different-integers/',
  technique: 'exactly(k) = atMost(k) − atMost(k−1), counting distinct values in the window.',
  widget: 'array',
  widgetTitle: 'Array',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 2, 1, 2, 3', wide: true },
    { key: 'k', label: 'Distinct values (k)', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int subarraysWithKDistinct(vector<int>& a, int k) {'),
      L('        return atMost(a, k) - atMost(a, k - 1);', 'combine'),
      L('    }'),
      L('    int atMost(vector<int>& a, int k) {', 'pass'),
      L('        unordered_map<int,int> cnt;'),
      L('        int l = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.size(); r++) {', 'grow'),
      L('            cnt[a[r]]++;', 'grow'),
      L('            while (cnt.size() > k)', 'shrink'),
      L('                if (--cnt[a[l++]] == 0) cnt.erase(a[l-1]);', 'shrink'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int subarraysWithKDistinct(int[] a, int k) {'),
      L('        return atMost(a, k) - atMost(a, k - 1);', 'combine'),
      L('    }'),
      L('    int atMost(int[] a, int k) {', 'pass'),
      L('        Map<Integer,Integer> cnt = new HashMap<>();'),
      L('        int l = 0, res = 0;', 'pass'),
      L('        for (int r = 0; r < a.length; r++) {', 'grow'),
      L('            cnt.merge(a[r], 1, Integer::sum);', 'grow'),
      L('            while (cnt.size() > k) {', 'shrink'),
      L('                if (cnt.merge(a[l], -1, Integer::sum) == 0)', 'shrink'),
      L('                    cnt.remove(a[l]);', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            res += r - l + 1;', 'add'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 20, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const k = parseInt1(values.k, 'k', { min: 1, max: 8 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    const totals: number[] = [];
    steps.push({
      tag: 'combine',
      trace: ['Windows with ', A('exactly'), ' k distinct values do not slide cleanly, but "at most k" does. Count both bounds and subtract.'],
      state: { arr: nums },
    });
    for (const limit of [k, k - 1]) {
      const cnt = new Map<number, number>();
      let l = 0;
      let res = 0;
      steps.push({
        tag: 'pass',
        trace: ['Pass with limit ', A(limit), limit === 0 ? ' — a window may hold no distinct values at all, so it counts nothing.' : ': at most ' + limit + ' distinct value(s) per window.'],
        state: { arr: nums, aggs: [{ label: 'limit', value: String(limit), c: 'a' }] },
      });
      for (let r = 0; r < nums.length; r++) {
        cnt.set(nums[r], (cnt.get(nums[r]) ?? 0) + 1);
        const view = (mark: ArrayState['mark']): ArrayState => ({
          arr: nums,
          window: r >= l ? [l, r] : null,
          mark,
          ptrs: [
            { name: 'l', i: l, c: 'b' },
            { name: 'r', i: r, c: 'a' },
          ],
          aggs: [
            { label: 'distinct', value: `${cnt.size} / ${limit}`, c: cnt.size > limit ? 'a' : 'b' },
            { label: 'running total', value: String(res), c: 'c' },
          ],
        });
        steps.push({ tag: 'grow', trace: ['Extend to ', A(nums[r]), ' at index ', A(r), ' — ', B(cnt.size), ' distinct in window.'], state: view({ [r]: 'active' }) });
        while (cnt.size > limit) {
          const drop = nums[l];
          cnt.set(drop, cnt.get(drop)! - 1);
          if (cnt.get(drop) === 0) cnt.delete(drop);
          steps.push({ tag: 'shrink', trace: ['Too many distinct — drop ', F(drop), ' at index ', F(l), '.'], state: view({ [l]: 'dim', [r]: 'active' }) });
          l++;
          if (steps.length > MAX_STEPS) break;
        }
        res += r - l + 1;
        steps.push({ tag: 'add', trace: [B(r - l + 1), ' valid subarray(s) end at index ', A(r), '. Total ', C(res), '.'], state: view({}) });
        if (steps.length > MAX_STEPS) break;
      }
      totals.push(res);
      steps.push({ tag: 'ret', trace: ['atMost(', A(limit), ') = ', C(res), '.'], state: { arr: nums, aggs: [{ label: `atMost(${limit})`, value: String(res), c: 'c' }] } });
    }
    const ans = totals[0] - (totals[1] ?? 0);
    steps.push({
      tag: 'combine',
      trace: [A(totals[0]), ' − ', A(totals[1] ?? 0), ' = ', C(ans), ' subarrays with exactly ', C(k), ' distinct value(s).'],
      state: { arr: nums, aggs: [{ label: 'answer', value: String(ans), c: 'c' }] },
    });
    return { steps, result: String(ans) };
  },
  note: 'Subtracting the two bounds works because every subarray with at most k distinct values either has exactly k or at most k−1 — the two sets partition cleanly. The alternative is tracking two left pointers at once, which is faster by a constant but far easier to get wrong under interview pressure.',
  complexity: { time: 'O(n)', space: 'O(k)' },
};

export const slidingWindow2: ProblemDef[] = [
  fruitIntoBaskets,
  maxConsecutiveOnesIII,
  substringsAllThree,
  niceSubarrays,
  binarySubarraysSum,
  maxPointsCards,
  subarraysKDistinct,
];
