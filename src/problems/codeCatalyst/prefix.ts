// Code Catalyst — Practice Set 3: prefix sums and difference arrays.
import type { ArrayState, MatrixState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { ag, arr, fmt, parseMatrix, parseWord, range } from './util';

/* ================= Find the Highest Altitude ================= */
const highestAltitude: ProblemDef = {
  slug: 'find-the-highest-altitude',
  title: 'Find the Highest Altitude',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/find-the-highest-altitude/',
  technique: 'Altitude after each leg is a running sum of gains; track its maximum (starting from 0).',
  widget: 'array',
  widgetTitle: 'gain',
  inputs: [{ key: 'gain', label: 'gain', defaultValue: '-5, 1, 5, 0, -7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int largestAltitude(vector<int>& gain) {'),
      L('        int alt = 0, best = 0;', 'init'),
      L('        for (int g : gain) {'),
      L('            alt += g;', 'step'),
      L('            best = max(best, alt);', 'step'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int largestAltitude(int[] gain) {'),
      L('        int alt = 0, best = 0;', 'init'),
      L('        for (int g : gain) {'),
      L('            alt += g;', 'step'),
      L('            best = Math.max(best, alt);', 'step'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseIntArray(values.gain, { maxLen: 16 });
    if (typeof g === 'string') return { error: g };
    let alt = 0;
    let best = 0;
    const alts: number[] = [0];
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['The trip starts at altitude ', A(0), ' — that counts as a candidate too.'], state: arr([...alts], { bars: true, aggs: [ag('highest', best, 'c')] }) });
    g.forEach((x) => {
      alt += x;
      alts.push(alt);
      const was = best;
      best = Math.max(best, alt);
      out.push({ tag: 'step', trace: ['Gain ', A(x), ' takes us to altitude ', B(alt), best > was ? '. New highest!' : '.'], state: arr([...alts], { bars: true, mark: { [alts.length - 1]: best > was ? 'good' : 'active' }, aggs: [ag('highest', best, 'c')] }) });
    });
    out.push({ tag: 'ret', trace: ['The highest point reached is ', C(best), '.'], state: arr(alts, { bars: true, mark: { [alts.indexOf(best)]: 'final' }, aggs: [ag('highest', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'Each altitude is the sum of all gains so far — a prefix sum. The answer is the maximum prefix, and remembering that the start (0) is also a point is the one trap.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Minimum Value to Get Positive Step by Step Sum ================= */
const minStartValue: ProblemDef = {
  slug: 'minimum-value-to-get-positive-step-by-step-sum',
  title: 'Minimum Value to Get Positive Step by Step Sum',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/minimum-value-to-get-positive-step-by-step-sum/',
  technique: 'Find the lowest prefix sum; the start value must lift it to at least 1.',
  widget: 'array',
  widgetTitle: 'Prefix sums of nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '-3, 2, -3, 4, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minStartValue(vector<int>& nums) {'),
      L('        int sum = 0, low = 0;'),
      L('        for (int x : nums) {'),
      L('            sum += x;', 'step'),
      L('            low = min(low, sum);', 'step'),
      L('        }'),
      L('        return 1 - low;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minStartValue(int[] nums) {'),
      L('        int sum = 0, low = 0;'),
      L('        for (int x : nums) {'),
      L('            sum += x;', 'step'),
      L('            low = Math.min(low, sum);', 'step'),
      L('        }'),
      L('        return 1 - low;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    let sum = 0;
    let low = 0;
    const pre: number[] = [];
    const out: Step[] = [];
    a.forEach((x, i) => {
      sum += x;
      pre.push(sum);
      const was = low;
      low = Math.min(low, sum);
      out.push({ tag: 'step', trace: low < was ? ['Add ', A(x), ': running sum = ', A(sum), '. New lowest point ', B(low), '.'] : ['Add ', A(x), ': running sum = ', A(sum), '.'], state: arr([...pre], { mark: { [i]: low < was ? 'good' : 'active' }, aggs: [ag('lowest', low, 'b')] }) });
    });
    const ans = 1 - low;
    out.push({ tag: 'ret', trace: ['The sum dips as low as ', B(low), '. Starting at ', C(ans), ' keeps even that point at 1.'], state: arr(pre.map((p) => p + ans), { mark: { [pre.indexOf(low)]: 'final' }, aggs: [ag('startValue', ans, 'c')] }) });
    return { steps: out, result: String(ans) };
  },
  note: 'Adding a start value shifts every prefix sum by the same amount. So only the minimum prefix matters: lift it to 1 and every other prefix is automatically ≥ 1.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Range Sum Query - Immutable ================= */
const parseQueries = (s: string, width: number, label: string): number[][] | { error: string } =>
  parseMatrix(s.trim().startsWith('[[') ? s : `[${s}]`, label, { maxR: 6, cols: width });

const rangeSumQuery: ProblemDef = {
  slug: 'range-sum-query-immutable',
  title: 'Range Sum Query - Immutable',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/range-sum-query-immutable/',
  technique: 'Precompute pre[i] = sum of the first i numbers; then sum(l..r) = pre[r+1] − pre[l].',
  widget: 'array',
  widgetTitle: 'pre[] (prefix sums)',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '-2, 0, 3, -5, 2, -1', wide: true },
    { key: 'queries', label: 'sumRange calls [l, r]', defaultValue: '[0,2],[2,5],[0,5]', wide: true },
  ],
  code: {
    cpp: [
      L('class NumArray {'),
      L('    vector<int> pre;'),
      L('public:'),
      L('    NumArray(vector<int>& nums) : pre(nums.size() + 1, 0) {'),
      L('        for (int i = 0; i < nums.size(); i++)'),
      L('            pre[i + 1] = pre[i] + nums[i];', 'build'),
      L('    }'),
      L('    int sumRange(int left, int right) {'),
      L('        return pre[right + 1] - pre[left];', 'query'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class NumArray {'),
      L('    private final int[] pre;'),
      L('    public NumArray(int[] nums) {'),
      L('        pre = new int[nums.length + 1];'),
      L('        for (int i = 0; i < nums.length; i++)'),
      L('            pre[i + 1] = pre[i] + nums[i];', 'build'),
      L('    }'),
      L('    public int sumRange(int left, int right) {'),
      L('        return pre[right + 1] - pre[left];', 'query'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    const qs = parseQueries(values.queries, 2, 'queries');
    if ('error' in qs) return qs;
    const pre = [0];
    const out: Step[] = [];
    a.forEach((x, i) => {
      pre.push(pre[i] + x);
      out.push({ tag: 'build', trace: ['pre[', String(i + 1), '] = pre[', String(i), '] + nums[', String(i), '] = ', A(pre[i]), ' + ', A(x), ' = ', B(pre[i + 1]), '.'], state: arr([...pre], { mark: { [i + 1]: 'active' }, aggs: [ag('nums', fmt(a))] }) });
    });
    const res: (number | string)[] = ['null'];
    for (const [l, r] of qs) {
      if (l < 0 || r >= a.length || l > r) return { error: `Query [${l},${r}] is out of range.` };
      const v = pre[r + 1] - pre[l];
      res.push(v);
      out.push({ tag: 'query', trace: ['sumRange(', String(l), ', ', String(r), ') = pre[', String(r + 1), '] − pre[', String(l), '] = ', A(pre[r + 1]), ' − ', F(pre[l]), ' = ', C(v), '.'], state: arr(pre, { mark: { [r + 1]: 'good', [l]: 'dim' }, aggs: [ag('nums', fmt(a)), ag('answers', fmt(res.slice(1)), 'c')] }) });
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'pre[r+1] is everything up to r, pre[l] is everything before l; their difference is exactly l..r. One O(n) build pays for every later query being O(1). The extra leading 0 avoids a special case for l = 0.',
  complexity: { time: 'O(n) build, O(1) per query', space: 'O(n)' },
};

/* ================= Find Pivot Index ================= */
const pivotIndex: ProblemDef = {
  slug: 'find-pivot-index',
  title: 'Find Pivot Index',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/find-pivot-index/',
  technique: 'With the total known, right sum = total − left − nums[i]; stop when left equals right.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '1, 7, 3, 6, 5, 6', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int pivotIndex(vector<int>& nums) {'),
      L('        int total = accumulate(nums.begin(), nums.end(), 0);', 'total'),
      L('        int left = 0;'),
      L('        for (int i = 0; i < nums.size(); i++) {'),
      L('            if (left == total - left - nums[i]) return i;', 'check', 'found'),
      L('            left += nums[i];', 'check'),
      L('        }'),
      L('        return -1;', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int pivotIndex(int[] nums) {'),
      L('        int total = 0;'),
      L('        for (int x : nums) total += x;', 'total'),
      L('        int left = 0;'),
      L('        for (int i = 0; i < nums.length; i++) {'),
      L('            if (left == total - left - nums[i]) return i;', 'check', 'found'),
      L('            left += nums[i];', 'check'),
      L('        }'),
      L('        return -1;', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    const total = a.reduce((x, y) => x + y, 0);
    let left = 0;
    const out: Step[] = [];
    out.push({ tag: 'total', trace: ['Total of everything: ', A(total), '.'], state: arr(a, { aggs: [ag('total', total)] }) });
    for (let i = 0; i < a.length; i++) {
      const right = total - left - a[i];
      const mark: NonNullable<ArrayState['mark']> = { [i]: 'active' };
      if (i > 0) Object.assign(mark, range(0, i - 1, 'win'));
      if (left === right) {
        mark[i] = 'final';
        out.push({ tag: 'found', trace: ['At index ', A(i), ': left = ', B(left), ', right = ', B(right), '. Equal — pivot is ', C(i), '.'], state: arr(a, { mark, ptrs: [{ name: 'i', i, c: 'a' }], aggs: [ag('left', left, 'b'), ag('right', right, 'b')] }) });
        return { steps: out, result: String(i) };
      }
      out.push({ tag: 'check', trace: ['At index ', A(i), ': left = ', F(left), ', right = ', F(right), '. Not equal; add ', A(a[i]), ' to left.'], state: arr(a, { mark, ptrs: [{ name: 'i', i, c: 'a' }], aggs: [ag('left', left), ag('right', right)] }) });
      left += a[i];
    }
    out.push({ tag: 'none', trace: ['No index balances the two sides → ', C(-1), '.'], state: arr(a, {}) });
    return { steps: out, result: '-1' };
  },
  note: 'Knowing the total means the right side never has to be summed separately — it is whatever the left side and the pivot do not account for. That turns an O(n²) check into one pass.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Left and Right Sum Differences ================= */
const leftRightDiff: ProblemDef = {
  slug: 'left-and-right-sum-differences',
  title: 'Left and Right Sum Differences',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/left-and-right-sum-differences/',
  technique: 'Track a running left sum; right sum is total − left − nums[i]; answer |left − right|.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '10, 4, 8, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> leftRightDifference(vector<int>& nums) {'),
      L('        int total = accumulate(nums.begin(), nums.end(), 0);', 'total'),
      L('        int left = 0;'),
      L('        vector<int> ans;'),
      L('        for (int x : nums) {'),
      L('            int right = total - left - x;', 'step'),
      L('            ans.push_back(abs(left - right));', 'step'),
      L('            left += x;', 'step'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] leftRightDifference(int[] nums) {'),
      L('        int total = 0;'),
      L('        for (int x : nums) total += x;', 'total'),
      L('        int left = 0;'),
      L('        int[] ans = new int[nums.length];'),
      L('        for (int i = 0; i < nums.length; i++) {'),
      L('            int right = total - left - nums[i];', 'step'),
      L('            ans[i] = Math.abs(left - right);', 'step'),
      L('            left += nums[i];', 'step'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14, min: 0 });
    if (typeof a === 'string') return { error: a };
    const total = a.reduce((x, y) => x + y, 0);
    let left = 0;
    const ans: number[] = [];
    const out: Step[] = [];
    out.push({ tag: 'total', trace: ['Total = ', A(total), '.'], state: arr(a, { aggs: [ag('total', total)] }) });
    a.forEach((x, i) => {
      const right = total - left - x;
      ans.push(Math.abs(left - right));
      out.push({ tag: 'step', trace: ['Index ', A(i), ': left = ', B(left), ', right = ', B(right), ', |diff| = ', C(ans[i]), '.'], state: arr(a, { mark: { ...(i > 0 ? range(0, i - 1, 'win') : {}), [i]: 'active' }, aggs: [ag('answer', fmt(ans), 'c')] }) });
      left += x;
    });
    out.push({ tag: 'ret', trace: ['Answer: ', C(fmt(ans)), '.'], state: arr(a, { aggs: [ag('answer', fmt(ans), 'c')] }) });
    return { steps: out, result: fmt(ans) };
  },
  note: 'The same "total minus left minus self" trick as Find Pivot Index: you never need a second array for right sums.',
  complexity: { time: 'O(n)', space: 'O(1) beyond output' },
};

/* ================= Number of Ways to Split Array ================= */
const waysToSplit: ProblemDef = {
  slug: 'number-of-ways-to-split-array',
  title: 'Number of Ways to Split Array',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-ways-to-split-array/',
  technique: 'For each split point, compare running left sum with total − left.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '10, 4, -8, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int waysToSplitArray(vector<int>& nums) {'),
      L('        long total = 0, left = 0;'),
      L('        for (int x : nums) total += x;', 'total'),
      L('        int ways = 0;'),
      L('        for (int i = 0; i + 1 < nums.size(); i++) {'),
      L('            left += nums[i];', 'ok', 'bad'),
      L('            if (left >= total - left) ways++;', 'ok', 'bad'),
      L('        }'),
      L('        return ways;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int waysToSplitArray(int[] nums) {'),
      L('        long total = 0, left = 0;'),
      L('        for (int x : nums) total += x;', 'total'),
      L('        int ways = 0;'),
      L('        for (int i = 0; i + 1 < nums.length; i++) {'),
      L('            left += nums[i];', 'ok', 'bad'),
      L('            if (left >= total - left) ways++;', 'ok', 'bad'),
      L('        }'),
      L('        return ways;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    if (a.length < 2) return { error: 'Need at least two numbers to split.' };
    const total = a.reduce((x, y) => x + y, 0);
    let left = 0;
    let ways = 0;
    const out: Step[] = [];
    out.push({ tag: 'total', trace: ['Total = ', A(total), '. Each split puts at least one number on each side.'], state: arr(a, { aggs: [ag('ways', 0, 'c')] }) });
    for (let i = 0; i + 1 < a.length; i++) {
      left += a[i];
      const right = total - left;
      const ok = left >= right;
      if (ok) ways++;
      out.push({ tag: ok ? 'ok' : 'bad', trace: ['Split after index ', A(i), ': left = ', ok ? B(left) : F(left), ', right = ', A(right), ok ? ' — left ≥ right, a valid split.' : ' — left is smaller, not valid.'], state: arr(a, { mark: { ...range(0, i, ok ? 'good' : 'dim'), ...range(i + 1, a.length - 1, 'win') }, aggs: [ag('ways', ways, 'c')] }) });
    }
    out.push({ tag: 'ret', trace: ['Valid splits: ', C(ways), '.'], state: arr(a, { aggs: [ag('ways', ways, 'c')] }) });
    return { steps: out, result: String(ways) };
  },
  note: 'Moving the split one step right moves one number from right to left, so the left sum updates in O(1). Use 64-bit sums — n × 10⁵ overflows a 32-bit int.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Continuous Subarray Sum ================= */
const continuousSubarraySum: ProblemDef = {
  slug: 'continuous-subarray-sum',
  title: 'Continuous Subarray Sum',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/continuous-subarray-sum/',
  technique: 'Two prefix sums with the same remainder mod k bound a subarray divisible by k; need it to be 2+ long.',
  widget: 'stack',
  widgetTitle: 'nums and first index of each remainder',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '23, 2, 4, 6, 7', wide: true },
    { key: 'k', label: 'k', defaultValue: '6' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool checkSubarraySum(vector<int>& nums, int k) {'),
      L('        unordered_map<int, int> first{{0, -1}};', 'init'),
      L('        int sum = 0;'),
      L('        for (int i = 0; i < nums.size(); i++) {'),
      L('            sum = (sum + nums[i]) % k;', 'step'),
      L('            if (first.count(sum)) {', 'seen', 'short'),
      L('                if (i - first[sum] >= 2) return true;', 'seen', 'short'),
      L('            } else first[sum] = i;', 'step'),
      L('        }'),
      L('        return false;', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean checkSubarraySum(int[] nums, int k) {'),
      L('        Map<Integer, Integer> first = new HashMap<>();'),
      L('        first.put(0, -1);', 'init'),
      L('        int sum = 0;'),
      L('        for (int i = 0; i < nums.length; i++) {'),
      L('            sum = (sum + nums[i]) % k;', 'step'),
      L('            if (first.containsKey(sum)) {', 'seen', 'short'),
      L('                if (i - first.get(sum) >= 2) return true;', 'seen', 'short'),
      L('            } else first.put(sum, i);', 'step'),
      L('        }'),
      L('        return false;', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16, min: 0 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const first = new Map<number, number>([[0, -1]]);
    let sum = 0;
    const out: Step[] = [];
    const st = (i: number | null, hl?: number, mark: ArrayState['mark'] = {}): StackState => ({
      array: arr(a, { mark, ptrs: i === null ? [] : [{ name: 'i', i, c: 'a' }] }),
      stack: [...first.entries()].map(([r, idx]) => ({ v: `rem ${r} → idx ${idx}`, c: r === hl ? 'a' : undefined })),
      stackLabel: 'remainder → first index',
    });
    out.push({ tag: 'init', trace: ['Seed remainder ', A(0), ' at index ', A(-1), ' — the empty prefix before the array starts.'], state: st(null, 0) });
    for (let i = 0; i < a.length; i++) {
      sum = (sum + a[i]) % k;
      if (first.has(sum)) {
        const j = first.get(sum)!;
        if (i - j >= 2) {
          out.push({ tag: 'seen', trace: ['Prefix remainder ', A(sum), ' was first seen at index ', B(j), '. The part between, ', C(`indices ${j + 1}..${i}`), ', sums to a multiple of ', String(k), ' and is long enough → ', C('true'), '.'], state: st(i, sum, range(j + 1, i, 'final')) });
          return { steps: out, result: 'true' };
        }
        out.push({ tag: 'short', trace: ['Remainder ', A(sum), ' repeats, but the subarray between is only ', F(i - j), ' long — need 2+. Keep the earlier index.'], state: st(i, sum, range(j + 1, i, 'dim')) });
      } else {
        first.set(sum, i);
        out.push({ tag: 'step', trace: ['Running sum mod ', String(k), ' = ', A(sum), '. New remainder — remember it first appeared at index ', B(i), '.'], state: st(i, sum) });
      }
    }
    out.push({ tag: 'none', trace: ['No remainder repeated far enough apart → ', C('false'), '.'], state: st(null) });
    return { steps: out, result: 'false' };
  },
  note: 'If prefix[i] and prefix[j] leave the same remainder mod k, their difference — the subarray between — is a multiple of k. Storing only the earliest index for each remainder gives the longest possible gap, which is what the length ≥ 2 rule needs.',
  complexity: { time: 'O(n)', space: 'O(min(n, k))' },
};

/* ================= Range Sum Query 2D - Immutable ================= */
const rangeSum2D: ProblemDef = {
  slug: 'range-sum-query-2d-immutable',
  title: 'Range Sum Query 2D - Immutable',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/range-sum-query-2d-immutable/',
  technique: '2D prefix sums: P[r][c] = sum of the top-left rectangle; any region is four lookups (inclusion–exclusion).',
  widget: 'matrix',
  widgetTitle: 'P[][] (2D prefix sums, padded with a 0 row/col)',
  inputs: [
    { key: 'matrix', label: 'matrix', defaultValue: '[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]', wide: true },
    { key: 'queries', label: 'sumRegion calls [r1,c1,r2,c2]', defaultValue: '[2,1,4,3],[1,1,2,2],[1,2,2,4]', wide: true },
  ],
  code: {
    cpp: [
      L('class NumMatrix {'),
      L('    vector<vector<int>> P;'),
      L('public:'),
      L('    NumMatrix(vector<vector<int>>& m) {'),
      L('        int R = m.size(), C = m[0].size();'),
      L('        P.assign(R + 1, vector<int>(C + 1, 0));'),
      L('        for (int r = 0; r < R; r++)'),
      L('            for (int c = 0; c < C; c++)'),
      L('                P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] - P[r][c];', 'build'),
      L('    }'),
      L('    int sumRegion(int r1, int c1, int r2, int c2) {'),
      L('        return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];', 'query'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class NumMatrix {'),
      L('    private final int[][] P;'),
      L('    public NumMatrix(int[][] m) {'),
      L('        int R = m.length, C = m[0].length;'),
      L('        P = new int[R + 1][C + 1];'),
      L('        for (int r = 0; r < R; r++)'),
      L('            for (int c = 0; c < C; c++)'),
      L('                P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] - P[r][c];', 'build'),
      L('    }'),
      L('    public int sumRegion(int r1, int c1, int r2, int c2) {'),
      L('        return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];', 'query'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m = parseMatrix(values.matrix, 'matrix', { maxR: 6, maxC: 6, rect: true });
    if ('error' in m) return m;
    const qs = parseQueries(values.queries, 4, 'queries');
    if ('error' in qs) return qs;
    const R = m.length;
    const Cn = m[0].length;
    const P: (number | string)[][] = Array.from({ length: R + 1 }, (_, r) => Array.from({ length: Cn + 1 }, (_, c) => (r === 0 || c === 0 ? 0 : '')));
    const N = (r: number, c: number) => Number(P[r][c]);
    const out: Step[] = [];
    const st = (mark: MatrixState['mark'], aggs: MatrixState['aggs'] = []): MatrixState => ({ grid: P.map((row) => [...row]), rowLabels: ['', ...m.map((_, i) => i)], colLabels: ['', ...m[0].map((_, j) => j)], mark, aggs });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) P[r + 1][c + 1] = m[r][c] + N(r, c + 1) + N(r + 1, c) - N(r, c);
      const mark: MatrixState['mark'] = {};
      for (let c = 1; c <= Cn; c++) mark[`${r + 1},${c}`] = 'active';
      out.push({ tag: 'build', trace: ['Fill prefix row ', A(r + 1), ': each cell = matrix value + cell above + cell left − cell diagonally up-left (counted twice).'], state: st(mark) });
    }
    const res: (number | string)[] = ['null'];
    for (const [r1, c1, r2, c2] of qs) {
      if (r1 < 0 || c1 < 0 || r2 >= R || c2 >= Cn || r1 > r2 || c1 > c2) return { error: `Query [${r1},${c1},${r2},${c2}] is out of range.` };
      const v = N(r2 + 1, c2 + 1) - N(r1, c2 + 1) - N(r2 + 1, c1) + N(r1, c1);
      res.push(v);
      out.push({
        tag: 'query',
        trace: ['Region (', String(r1), ',', String(c1), ')–(', String(r2), ',', String(c2), '): ', B(N(r2 + 1, c2 + 1)), ' − ', F(N(r1, c2 + 1)), ' − ', F(N(r2 + 1, c1)), ' + ', A(N(r1, c1)), ' = ', C(v), '.'],
        state: st({ [`${r2 + 1},${c2 + 1}`]: 'good', [`${r1},${c2 + 1}`]: 'dim', [`${r2 + 1},${c1}`]: 'dim', [`${r1},${c1}`]: 'active' }, [ag('answers', fmt(res.slice(1)), 'c')]),
      });
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'The big top-left rectangle minus the strip above minus the strip to the left removes the top-left corner twice, so it is added back once. Four lookups answer any rectangle in O(1).',
  complexity: { time: 'O(R·C) build, O(1) per query', space: 'O(R·C)' },
};

/* ================= Matrix Block Sum ================= */
const matrixBlockSum: ProblemDef = {
  slug: 'matrix-block-sum',
  title: 'Matrix Block Sum',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/matrix-block-sum/',
  technique: 'Build 2D prefix sums once, then each cell sums its clamped (2k+1)×(2k+1) block in O(1).',
  widget: 'matrix',
  widgetTitle: 'mat — block around the current cell',
  inputs: [
    { key: 'mat', label: 'mat', defaultValue: '[[1,2,3],[4,5,6],[7,8,9]]', wide: true },
    { key: 'k', label: 'k', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> matrixBlockSum(vector<vector<int>>& mat, int k) {'),
      L('        int R = mat.size(), C = mat[0].size();'),
      L('        vector<vector<int>> P(R + 1, vector<int>(C + 1, 0));'),
      L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++)'),
      L('            P[r+1][c+1] = mat[r][c] + P[r][c+1] + P[r+1][c] - P[r][c];', 'build'),
      L('        vector<vector<int>> ans(R, vector<int>(C));'),
      L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {'),
      L('            int r1 = max(0, r-k), c1 = max(0, c-k);', 'cell'),
      L('            int r2 = min(R-1, r+k), c2 = min(C-1, c+k);', 'cell'),
      L('            ans[r][c] = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];', 'cell'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] matrixBlockSum(int[][] mat, int k) {'),
      L('        int R = mat.length, C = mat[0].length;'),
      L('        int[][] P = new int[R + 1][C + 1];'),
      L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++)'),
      L('            P[r+1][c+1] = mat[r][c] + P[r][c+1] + P[r+1][c] - P[r][c];', 'build'),
      L('        int[][] ans = new int[R][C];'),
      L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {'),
      L('            int r1 = Math.max(0, r-k), c1 = Math.max(0, c-k);', 'cell'),
      L('            int r2 = Math.min(R-1, r+k), c2 = Math.min(C-1, c+k);', 'cell'),
      L('            ans[r][c] = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];', 'cell'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m = parseMatrix(values.mat, 'mat', { maxR: 5, maxC: 5, rect: true });
    if ('error' in m) return m;
    const k = parseInt1(values.k, 'k', { min: 1, max: 4 });
    if (typeof k === 'string') return { error: k };
    const R = m.length;
    const Cn = m[0].length;
    const P = Array.from({ length: R + 1 }, () => Array(Cn + 1).fill(0));
    for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) P[r + 1][c + 1] = m[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    const ans: (number | string)[][] = m.map((row) => row.map(() => ''));
    const out: Step[] = [];
    out.push({ tag: 'build', trace: ['Build 2D prefix sums first, so any rectangle sum is four lookups.'], state: { grid: m, aggs: [ag('k', k)] } as MatrixState });
    for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
      const r1 = Math.max(0, r - k), c1 = Math.max(0, c - k), r2 = Math.min(R - 1, r + k), c2 = Math.min(Cn - 1, c + k);
      const v = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
      ans[r][c] = v;
      const mark: MatrixState['mark'] = {};
      for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) mark[`${i},${j}`] = 'win';
      mark[`${r},${c}`] = 'active';
      out.push({ tag: 'cell', trace: ['Cell (', String(r), ',', String(c), '): its block, clipped to the grid, is rows ', String(r1), '–', String(r2), ', cols ', String(c1), '–', String(c2), '. Sum = ', C(v), '.'], state: { grid: m, mark, aggs: [ag('answer so far', ans.map((row) => fmt(row)).join(' '), 'c')] } as MatrixState });
    }
    const res = `[${ans.map((row) => fmt(row)).join(',')}]`;
    out.push({ tag: 'ret', trace: ['All block sums: ', C(res), '.'], state: { grid: ans, aggs: [] } as MatrixState });
    return { steps: out, result: res };
  },
  note: 'Summing each block directly costs O(k²) per cell. With 2D prefix sums every block is the same four-lookup formula as Range Sum Query 2D, once its corners are clamped to the grid.',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

/* ================= Corporate Flight Bookings ================= */
const flightBookings: ProblemDef = {
  slug: 'corporate-flight-bookings',
  title: 'Corporate Flight Bookings',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/corporate-flight-bookings/',
  technique: 'Difference array: +seats at first, −seats after last; a prefix sum turns it into per-flight totals.',
  widget: 'array',
  widgetTitle: 'diff[] → answer[] (flights 1..n)',
  inputs: [
    { key: 'bookings', label: 'bookings [first,last,seats]', defaultValue: '[[1,2,10],[2,3,20],[2,5,25]]', wide: true },
    { key: 'n', label: 'n', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {'),
      L('        vector<int> d(n + 1, 0);'),
      L('        for (auto& b : bookings) {'),
      L('            d[b[0] - 1] += b[2];', 'mark'),
      L('            d[b[1]] -= b[2];', 'mark'),
      L('        }'),
      L('        for (int i = 1; i < n; i++) d[i] += d[i - 1];', 'sum'),
      L('        d.pop_back();'),
      L('        return d;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] corpFlightBookings(int[][] bookings, int n) {'),
      L('        int[] d = new int[n + 1];'),
      L('        for (int[] b : bookings) {'),
      L('            d[b[0] - 1] += b[2];', 'mark'),
      L('            d[b[1]] -= b[2];', 'mark'),
      L('        }'),
      L('        for (int i = 1; i < n; i++) d[i] += d[i - 1];', 'sum'),
      L('        return Arrays.copyOf(d, n);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 14 });
    if (typeof n === 'string') return { error: n };
    const bs = parseMatrix(values.bookings, 'bookings', { maxR: 6, cols: 3 });
    if ('error' in bs) return bs;
    const d = Array(n + 1).fill(0);
    const out: Step[] = [];
    for (const [f, l, s] of bs) {
      if (f < 1 || l > n || f > l) return { error: `Booking [${f},${l},${s}] must have 1 ≤ first ≤ last ≤ n.` };
      d[f - 1] += s;
      d[l] -= s;
      out.push({ tag: 'mark', trace: ['Booking ', A(`${s} seats`), ' on flights ', String(f), '–', String(l), ': add ', B(`+${s}`), ' where it starts and ', F(`−${s}`), ' just after it ends.'], state: arr([...d], { mark: { [f - 1]: 'good', [l]: 'dim' } }) });
    }
    for (let i = 1; i < n; i++) {
      d[i] += d[i - 1];
      out.push({ tag: 'sum', trace: ['Running total at flight ', A(i + 1), ': ', C(d[i]), ' seats.'], state: arr([...d], { mark: { ...range(0, i - 1, 'good'), [i]: 'active' } }) });
    }
    const ans = d.slice(0, n);
    out.push({ tag: 'ret', trace: ['Seats per flight: ', C(fmt(ans)), '.'], state: arr(ans, { mark: range(0, n - 1, 'final') }) });
    return { steps: out, result: fmt(ans) };
  },
  note: 'Adding to every flight in a range is O(range) per booking. A difference array records only where each range starts and stops; one prefix sum at the end spreads every booking across its range at once.',
  complexity: { time: 'O(n + bookings)', space: 'O(n)' },
};

/* ================= Car Pooling ================= */
const carPooling: ProblemDef = {
  slug: 'car-pooling',
  title: 'Car Pooling',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/car-pooling/',
  technique: 'Difference array over road positions: +people at pickup, −people at drop-off; prefix sum is the car load.',
  widget: 'array',
  widgetTitle: 'Passengers in the car at each km',
  inputs: [
    { key: 'trips', label: 'trips [people,from,to]', defaultValue: '[[2,1,5],[3,3,7]]', wide: true },
    { key: 'capacity', label: 'capacity', defaultValue: '4' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool carPooling(vector<vector<int>>& trips, int capacity) {'),
      L('        vector<int> d(1001, 0);'),
      L('        for (auto& t : trips) {'),
      L('            d[t[1]] += t[0];', 'mark'),
      L('            d[t[2]] -= t[0];', 'mark'),
      L('        }'),
      L('        int load = 0;'),
      L('        for (int x : d) {'),
      L('            load += x;', 'drive', 'over'),
      L('            if (load > capacity) return false;', 'over'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean carPooling(int[][] trips, int capacity) {'),
      L('        int[] d = new int[1001];'),
      L('        for (int[] t : trips) {'),
      L('            d[t[1]] += t[0];', 'mark'),
      L('            d[t[2]] -= t[0];', 'mark'),
      L('        }'),
      L('        int load = 0;'),
      L('        for (int x : d) {'),
      L('            load += x;', 'drive', 'over'),
      L('            if (load > capacity) return false;', 'over'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const ts = parseMatrix(values.trips, 'trips', { maxR: 6, cols: 3, min: 0, max: 15 });
    if ('error' in ts) return ts;
    const cap = parseInt1(values.capacity, 'capacity', { min: 1 });
    if (typeof cap === 'string') return { error: cap };
    const end = Math.max(...ts.map((t) => t[2]));
    const d = Array(end + 1).fill(0);
    const out: Step[] = [];
    for (const [p, f, t] of ts) {
      if (f >= t) return { error: `Trip [${p},${f},${t}] needs from < to.` };
      d[f] += p;
      d[t] -= p;
      out.push({ tag: 'mark', trace: [A(`${p} people`), ' get on at km ', B(f), ' and off at km ', F(t), '.'], state: arr([...d], { mark: { [f]: 'good', [t]: 'dim' }, aggs: [ag('capacity', cap)] }) });
    }
    let load = 0;
    const loads: number[] = [];
    for (let i = 0; i <= end; i++) {
      load += d[i];
      loads.push(load);
      if (load > cap) {
        out.push({ tag: 'over', trace: ['At km ', A(i), ' the car holds ', F(load), ' people — more than ', String(cap), ' → ', C('false'), '.'], state: arr([...loads], { bars: true, mark: { [i]: 'dim' }, aggs: [ag('capacity', cap)] }) });
        return { steps: out, result: 'false' };
      }
      out.push({ tag: 'drive', trace: ['At km ', A(i), ' the car holds ', B(load), ' people.'], state: arr([...loads], { bars: true, mark: { [i]: 'active' }, aggs: [ag('capacity', cap)] }) });
    }
    out.push({ tag: 'ret', trace: ['The load never went over ', String(cap), ' → ', C('true'), '.'], state: arr(loads, { bars: true, aggs: [ag('capacity', cap)] }) });
    return { steps: out, result: 'true' };
  },
  note: 'Passengers drop off before new ones board at the same km, which the −people at "to" captures naturally. Since positions are capped at 1000, a difference array is simpler and faster than sorting events.',
  complexity: { time: 'O(trips + max position)', space: 'O(max position)' },
};

/* ================= Shifting Letters II ================= */
const shiftingLettersII: ProblemDef = {
  slug: 'shifting-letters-ii',
  title: 'Shifting Letters II',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/shifting-letters-ii/',
  technique: 'Difference array of +1/−1 shifts over ranges, prefix-summed into a net shift per letter (mod 26).',
  widget: 'array',
  widgetTitle: 'diff[] / net shift per letter',
  inputs: [
    { key: 's', label: 's', defaultValue: 'abc' },
    { key: 'shifts', label: 'shifts [start,end,dir]', defaultValue: '[[0,1,0],[1,2,1],[0,2,1]]', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string shiftingLetters(string s, vector<vector<int>>& shifts) {'),
      L('        int n = s.size();'),
      L('        vector<int> d(n + 1, 0);'),
      L('        for (auto& q : shifts) {'),
      L('            int v = q[2] ? 1 : -1;', 'mark'),
      L('            d[q[0]] += v; d[q[1] + 1] -= v;', 'mark'),
      L('        }'),
      L('        int net = 0;'),
      L('        for (int i = 0; i < n; i++) {'),
      L('            net += d[i];', 'apply'),
      L('            s[i] = \'a\' + ((s[i] - \'a\' + net) % 26 + 26) % 26;', 'apply'),
      L('        }'),
      L('        return s;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String shiftingLetters(String s, int[][] shifts) {'),
      L('        int n = s.length();'),
      L('        int[] d = new int[n + 1];'),
      L('        for (int[] q : shifts) {'),
      L('            int v = q[2] == 1 ? 1 : -1;', 'mark'),
      L('            d[q[0]] += v; d[q[1] + 1] -= v;', 'mark'),
      L('        }'),
      L('        char[] cs = s.toCharArray();'),
      L('        int net = 0;'),
      L('        for (int i = 0; i < n; i++) {'),
      L('            net += d[i];', 'apply'),
      L('            cs[i] = (char) (\'a\' + ((cs[i] - \'a\' + net) % 26 + 26) % 26);', 'apply'),
      L('        }'),
      L('        return new String(cs);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 14, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const qs = parseMatrix(values.shifts, 'shifts', { maxR: 6, cols: 3 });
    if ('error' in qs) return qs;
    const n = s.length;
    const d = Array(n + 1).fill(0);
    const out: Step[] = [];
    for (const [a, b, dir] of qs) {
      if (a < 0 || b >= n || a > b || (dir !== 0 && dir !== 1)) return { error: `Shift [${a},${b},${dir}] needs 0 ≤ start ≤ end < ${n} and direction 0 or 1.` };
      const v = dir ? 1 : -1;
      d[a] += v;
      d[b + 1] -= v;
      out.push({ tag: 'mark', trace: ['Shift ', String(a), '–', String(b), dir ? ' forward' : ' backward', ': ', B(v > 0 ? '+1' : '−1'), ' at ', String(a), ', undo it at ', String(b + 1), '.'], state: arr([...d], { mark: { [a]: 'good', [b + 1]: 'dim' }, aggs: [ag('s', s)] }) });
    }
    const cs = s.split('');
    let net = 0;
    for (let i = 0; i < n; i++) {
      net += d[i];
      const before = cs[i];
      cs[i] = String.fromCharCode(97 + ((((cs[i].charCodeAt(0) - 97 + net) % 26) + 26) % 26));
      out.push({ tag: 'apply', trace: ['Letter ', A(i), ' has net shift ', A(net), ': ', F(before), ' → ', B(cs[i]), '.'], state: arr([...cs], { mark: { ...range(0, i - 1, 'good'), [i]: 'active' } }) });
    }
    out.push({ tag: 'ret', trace: ['Result: ', C(cs.join('')), '.'], state: arr(cs, { mark: range(0, n - 1, 'final') }) });
    return { steps: out, result: `"${cs.join('')}"` };
  },
  note: 'Each shift is a range update, exactly what a difference array is for. The ((x % 26) + 26) % 26 is there because a net backward shift is negative and % keeps the sign in C++ and Java.',
  complexity: { time: 'O(n + shifts)', space: 'O(n)' },
};

/* ================= Zero Array Transformation I ================= */
const zeroArrayI: ProblemDef = {
  slug: 'zero-array-transformation-i',
  title: 'Zero Array Transformation I',
  category: 'Prefix Sum',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/zero-array-transformation-i/',
  technique: 'Count how many queries cover each index with a difference array; every nums[i] must be ≤ its coverage.',
  widget: 'array',
  widgetTitle: 'Coverage per index vs nums',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '4, 3, 2, 1', wide: true },
    { key: 'queries', label: 'queries [l,r]', defaultValue: '[[1,3],[0,2]]', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isZeroArray(vector<int>& nums, vector<vector<int>>& queries) {'),
      L('        int n = nums.size();'),
      L('        vector<int> d(n + 1, 0);'),
      L('        for (auto& q : queries) { d[q[0]]++; d[q[1] + 1]--; }', 'mark'),
      L('        int cover = 0;'),
      L('        for (int i = 0; i < n; i++) {'),
      L('            cover += d[i];', 'ok', 'fail'),
      L('            if (nums[i] > cover) return false;', 'ok', 'fail'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isZeroArray(int[] nums, int[][] queries) {'),
      L('        int n = nums.length;'),
      L('        int[] d = new int[n + 1];'),
      L('        for (int[] q : queries) { d[q[0]]++; d[q[1] + 1]--; }', 'mark'),
      L('        int cover = 0;'),
      L('        for (int i = 0; i < n; i++) {'),
      L('            cover += d[i];', 'ok', 'fail'),
      L('            if (nums[i] > cover) return false;', 'ok', 'fail'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14, min: 0 });
    if (typeof a === 'string') return { error: a };
    const qs = parseMatrix(values.queries, 'queries', { maxR: 8, cols: 2 });
    if ('error' in qs) return qs;
    const n = a.length;
    const d = Array(n + 1).fill(0);
    const out: Step[] = [];
    for (const [l, r] of qs) {
      if (l < 0 || r >= n || l > r) return { error: `Query [${l},${r}] is out of range.` };
      d[l]++;
      d[r + 1]--;
      out.push({ tag: 'mark', trace: ['Query [', String(l), ', ', String(r), '] can decrement each index in that range once: ', B('+1'), ' at ', String(l), ', ', F('−1'), ' at ', String(r + 1), '.'], state: arr([...d], { mark: { [l]: 'good', [r + 1]: 'dim' }, aggs: [ag('nums', fmt(a))] }) });
    }
    let cover = 0;
    const covers: number[] = [];
    for (let i = 0; i < n; i++) {
      cover += d[i];
      covers.push(cover);
      if (a[i] > cover) {
        out.push({ tag: 'fail', trace: ['Index ', A(i), ' needs ', F(a[i]), ' decrements but only ', F(cover), ' queries cover it → ', C('false'), '.'], state: arr([...covers], { mark: { [i]: 'dim' }, aggs: [ag('nums', fmt(a))] }) });
        return { steps: out, result: 'false' };
      }
      out.push({ tag: 'ok', trace: ['Index ', A(i), ' is covered by ', B(cover), ' queries — enough for nums[i] = ', A(a[i]), '.'], state: arr([...covers], { mark: { [i]: 'good' }, aggs: [ag('nums', fmt(a))] }) });
    }
    out.push({ tag: 'ret', trace: ['Every index can reach zero → ', C('true'), '.'], state: arr(covers, { aggs: [ag('nums', fmt(a))] }) });
    return { steps: out, result: 'true' };
  },
  note: 'Each query may pick any subset of its range, so indices are independent: index i can be lowered by at most the number of queries covering it. A difference array counts that coverage for all indices in O(n + q).',
  complexity: { time: 'O(n + q)', space: 'O(n)' },
};

export const ccPrefix: ProblemDef[] = [
  highestAltitude,
  minStartValue,
  rangeSumQuery,
  pivotIndex,
  leftRightDiff,
  waysToSplit,
  continuousSubarraySum,
  rangeSum2D,
  matrixBlockSum,
  flightBookings,
  carPooling,
  shiftingLettersII,
  zeroArrayI,
];

