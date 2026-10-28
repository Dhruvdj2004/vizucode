// Code Catalyst — Practice Sets 5 and 6: binary search and recursion.
import type { ArrayState, BinarySearchState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, fmt, parseMatrix, parseWord } from './util';

const cpp = (sig: string, body: [string, ...string[]][], extra: [string, ...string[]][] = []) => [
  L('class Solution {'),
  L('public:'),
  ...extra.map(([t, ...tags]) => L(`    ${t}`, ...tags)),
  L(`    ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('};'),
];
const java = (sig: string, body: [string, ...string[]][], extra: [string, ...string[]][] = []) => [
  L('class Solution {'),
  ...extra.map(([t, ...tags]) => L(`    ${t}`, ...tags)),
  L(`    public ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('}'),
];

/** Shared driver for "binary search on the answer" problems. */
function searchAnswer(o: {
  lo: number;
  hi: number;
  /** true when `x` is good enough; must flip false→true (min) or true→false (max) exactly once. */
  ok: (x: number) => boolean;
  probe: (x: number) => string;
  want: 'min' | 'max';
  label: string;
  intro: Step['trace'];
}): { steps: Step[]; best: number | null } {
  let lo = o.lo;
  let hi = o.hi;
  let best: number | null = null;
  const steps: Step[] = [];
  const st = (mid?: number, probe?: BinarySearchState['probe']): BinarySearchState => ({ mode: 'answer', lo, hi, mid, domain: [o.lo, o.hi], domainLabel: o.label, probe, best });
  steps.push({ tag: 'init', trace: o.intro, state: st() });
  while (lo <= hi && steps.length < MAX_STEPS) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const good = o.ok(mid);
    const text = o.probe(mid);
    if (good) {
      best = mid;
      if (o.want === 'min') {
        steps.push({ tag: 'yes', trace: [o.label, ' = ', A(mid), ' works (', text, '). Record it and try smaller: hi = ', B(mid - 1), '.'], state: st(mid, { text, verdict: 'yes', verdictText: 'works' }) });
        hi = mid - 1;
      } else {
        steps.push({ tag: 'yes', trace: [o.label, ' = ', A(mid), ' works (', text, '). Record it and try bigger: lo = ', B(mid + 1), '.'], state: st(mid, { text, verdict: 'yes', verdictText: 'works' }) });
        lo = mid + 1;
      }
    } else if (o.want === 'min') {
      steps.push({ tag: 'no', trace: [o.label, ' = ', F(mid), ' is not enough (', text, '). Go bigger: lo = ', B(mid + 1), '.'], state: st(mid, { text, verdict: 'no', verdictText: 'fails' }) });
      lo = mid + 1;
    } else {
      steps.push({ tag: 'no', trace: [o.label, ' = ', F(mid), ' is too much (', text, '). Go smaller: hi = ', B(mid - 1), '.'], state: st(mid, { text, verdict: 'no', verdictText: 'fails' }) });
      hi = mid - 1;
    }
  }
  steps.push({ tag: 'ret', trace: best === null ? ['Nothing in range works.'] : ['The ', o.want === 'min' ? 'smallest' : 'largest', ' ', o.label, ' that works is ', C(best), '.'], state: st() });
  return { steps, best };
}

/* ================= Search Insert Position ================= */
const searchInsert: ProblemDef = {
  slug: 'search-insert-position',
  title: 'Search Insert Position',
  category: 'Binary Search',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/search-insert-position/',
  technique: 'Lower-bound binary search: the first index whose value is ≥ target.',
  widget: 'binary-search',
  widgetTitle: 'nums (sorted)',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '1, 3, 5, 6, 8, 10, 12', wide: true },
    { key: 'target', label: 'target', defaultValue: '7' },
  ],
  code: {
    cpp: cpp('int searchInsert(vector<int>& nums, int target)', [
      ['int lo = 0, hi = nums.size();', 'init'],
      ['while (lo < hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'low', 'high'],
      ['    if (nums[mid] < target) lo = mid + 1;', 'low'],
      ['    else hi = mid;', 'high'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
    java: java('int searchInsert(int[] nums, int target)', [
      ['int lo = 0, hi = nums.length;', 'init'],
      ['while (lo < hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'low', 'high'],
      ['    if (nums[mid] < target) lo = mid + 1;', 'low'],
      ['    else hi = mid;', 'high'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) return { error: 'nums must be strictly increasing.' };
    const t = parseInt1(values.target, 'target');
    if (typeof t === 'string') return { error: t };
    let lo = 0;
    let hi = a.length;
    const out: Step[] = [];
    const st = (mid?: number, fin?: number): BinarySearchState => ({ mode: 'array', arr: a, lo, hi: hi - 1, mid, finalIndex: fin ?? null });
    out.push({ tag: 'init', trace: ['The answer is somewhere in 0..', String(a.length), ' (it may be just past the end).'], state: st() });
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (a[mid] < t) {
        out.push({ tag: 'low', trace: ['nums[', String(mid), '] = ', F(a[mid]), ' < ', A(t), ' — the slot must be to the right: lo = ', B(mid + 1), '.'], state: st(mid) });
        lo = mid + 1;
      } else {
        out.push({ tag: 'high', trace: ['nums[', String(mid), '] = ', A(a[mid]), ' ≥ ', A(t), ' — this or something left of it: hi = ', B(mid), '.'], state: st(mid) });
        hi = mid;
      }
    }
    out.push({ tag: 'ret', trace: [a[lo] === t ? 'Found target at index ' : 'Target would be inserted at index ', C(lo), '.'], state: st(undefined, lo < a.length ? lo : undefined) });
    return { steps: out, result: String(lo) };
  },
  note: 'Whether target exists or not, the answer is the first position whose value is ≥ target. Searching for that boundary instead of for equality handles both cases with one loop.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

/* ================= Peak Index in a Mountain Array ================= */
const peakIndex: ProblemDef = {
  slug: 'peak-index-in-a-mountain-array',
  title: 'Peak Index in a Mountain Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/',
  technique: 'If arr[mid] < arr[mid+1] you are on the uphill, so the peak is right; otherwise it is mid or left.',
  widget: 'binary-search',
  widgetTitle: 'arr',
  inputs: [{ key: 'arr', label: 'arr', defaultValue: '0, 2, 5, 9, 12, 7, 4, 1', wide: true }],
  code: {
    cpp: cpp('int peakIndexInMountainArray(vector<int>& arr)', [
      ['int lo = 0, hi = arr.size() - 1;'],
      ['while (lo < hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'up', 'down'],
      ['    if (arr[mid] < arr[mid + 1]) lo = mid + 1;', 'up'],
      ['    else hi = mid;', 'down'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
    java: java('int peakIndexInMountainArray(int[] arr)', [
      ['int lo = 0, hi = arr.length - 1;'],
      ['while (lo < hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'up', 'down'],
      ['    if (arr[mid] < arr[mid + 1]) lo = mid + 1;', 'up'],
      ['    else hi = mid;', 'down'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.arr, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    if (a.length < 3) return { error: 'A mountain needs at least 3 values.' };
    let lo = 0;
    let hi = a.length - 1;
    const out: Step[] = [];
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (a[mid] < a[mid + 1]) {
        out.push({ tag: 'up', trace: [A(a[mid]), ' < next ', B(a[mid + 1]), ' — still climbing, so the peak is to the right: lo = ', B(mid + 1), '.'], state: { mode: 'array', arr: a, lo, hi, mid } as BinarySearchState });
        lo = mid + 1;
      } else {
        out.push({ tag: 'down', trace: [A(a[mid]), ' > next ', F(a[mid + 1]), ' — going downhill, so the peak is here or to the left: hi = ', B(mid), '.'], state: { mode: 'array', arr: a, lo, hi, mid } as BinarySearchState });
        hi = mid;
      }
    }
    out.push({ tag: 'ret', trace: ['lo and hi met at the peak: index ', C(lo), ' (value ', C(a[lo]), ').'], state: { mode: 'array', arr: a, lo, hi, finalIndex: lo } as BinarySearchState });
    return { steps: out, result: String(lo) };
  },
  note: 'You never need the peak value to know which side it is on: comparing mid with its right neighbour tells you whether you are on the up-slope or the down-slope, and that is enough to discard half.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

/* ================= Successful Pairs of Spells and Potions ================= */
const successfulPairs: ProblemDef = {
  slug: 'successful-pairs-of-spells-and-potions',
  title: 'Successful Pairs of Spells and Potions',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/successful-pairs-of-spells-and-potions/',
  technique: 'Sort potions; for each spell binary-search the first potion with spell × potion ≥ success.',
  widget: 'binary-search',
  widgetTitle: 'potions (sorted)',
  inputs: [
    { key: 'spells', label: 'spells', defaultValue: '5, 1, 3', wide: true },
    { key: 'potions', label: 'potions', defaultValue: '1, 2, 3, 4, 5', wide: true },
    { key: 'success', label: 'success', defaultValue: '7' },
  ],
  code: {
    cpp: cpp('vector<int> successfulPairs(vector<int>& spells, vector<int>& potions, long long success)', [
      ['sort(potions.begin(), potions.end());', 'sort'],
      ['int m = potions.size();'],
      ['vector<int> res;'],
      ['for (long long s : spells) {'],
      ['    int lo = 0, hi = m;', 'spell'],
      ['    while (lo < hi) {'],
      ['        int mid = (lo + hi) / 2;', 'low', 'high'],
      ['        if (s * potions[mid] >= success) hi = mid;', 'high'],
      ['        else lo = mid + 1;', 'low'],
      ['    }'],
      ['    res.push_back(m - lo);', 'count'],
      ['}'],
      ['return res;', 'ret'],
    ]),
    java: java('int[] successfulPairs(int[] spells, int[] potions, long success)', [
      ['Arrays.sort(potions);', 'sort'],
      ['int m = potions.length;'],
      ['int[] res = new int[spells.length];'],
      ['for (int i = 0; i < spells.length; i++) {'],
      ['    int lo = 0, hi = m;', 'spell'],
      ['    while (lo < hi) {'],
      ['        int mid = (lo + hi) / 2;', 'low', 'high'],
      ['        if ((long) spells[i] * potions[mid] >= success) hi = mid;', 'high'],
      ['        else lo = mid + 1;', 'low'],
      ['    }'],
      ['    res[i] = m - lo;', 'count'],
      ['}'],
      ['return res;', 'ret'],
    ]),
  },
  run(values) {
    const sp = parseIntArray(values.spells, { maxLen: 6, min: 1 });
    if (typeof sp === 'string') return { error: sp };
    const pRaw = parseIntArray(values.potions, { maxLen: 14, min: 1 });
    if (typeof pRaw === 'string') return { error: pRaw };
    const succ = parseInt1(values.success, 'success', { min: 1 });
    if (typeof succ === 'string') return { error: succ };
    const p = [...pRaw].sort((x, y) => x - y);
    const m = p.length;
    const res: number[] = [];
    const out: Step[] = [];
    out.push({ tag: 'sort', trace: ['Sort the potions: ', A(fmt(p)), '. Then for any spell, the successful potions form a suffix.'], state: { mode: 'array', arr: p, lo: 0, hi: m - 1 } as BinarySearchState });
    for (const s of sp) {
      let lo = 0;
      let hi = m;
      out.push({ tag: 'spell', trace: ['Spell ', A(s), ': find the first potion with ', A(s), ' × potion ≥ ', B(succ), '.'], state: { mode: 'array', arr: p, lo, hi: hi - 1 } as BinarySearchState });
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (s * p[mid] >= succ) {
          out.push({ tag: 'high', trace: [String(s), ' × ', A(p[mid]), ' = ', B(s * p[mid]), ' ≥ ', String(succ), ' — works, look left for an earlier one.'], state: { mode: 'array', arr: p, lo, hi: hi - 1, mid } as BinarySearchState });
          hi = mid;
        } else {
          out.push({ tag: 'low', trace: [String(s), ' × ', A(p[mid]), ' = ', F(s * p[mid]), ' < ', String(succ), ' — too weak, look right.'], state: { mode: 'array', arr: p, lo, hi: hi - 1, mid } as BinarySearchState });
          lo = mid + 1;
        }
      }
      res.push(m - lo);
      out.push({ tag: 'count', trace: ['Potions from index ', String(lo), ' on all work: ', C(m - lo), ' pair(s) for spell ', String(s), '.'], state: { mode: 'array', arr: p, lo, hi: m - 1, finalIndex: lo < m ? lo : null } as BinarySearchState });
    }
    out.push({ tag: 'ret', trace: ['Pairs per spell: ', C(fmt(res)), '.'], state: { mode: 'array', arr: p, lo: 0, hi: m - 1 } as BinarySearchState });
    return { steps: out, result: fmt(res) };
  },
  note: 'Once potions are sorted, "spell × potion ≥ success" is false then true along the array. Binary search finds that switch point per spell in O(log m) instead of checking every potion.',
  complexity: { time: 'O((n + m) log m)', space: 'O(1) beyond sorting' },
};

/* ================= Find Right Interval ================= */
const findRightInterval: ProblemDef = {
  slug: 'find-right-interval',
  title: 'Find Right Interval',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-right-interval/',
  technique: 'Sort starts with their original indices; for each end, binary-search the smallest start ≥ end.',
  widget: 'binary-search',
  widgetTitle: 'Sorted start points',
  inputs: [{ key: 'intervals', label: 'intervals', defaultValue: '[[3,4],[2,3],[1,2]]', wide: true }],
  code: {
    cpp: cpp('vector<int> findRightInterval(vector<vector<int>>& intervals)', [
      ['int n = intervals.size();'],
      ['vector<pair<int, int>> starts;'],
      ['for (int i = 0; i < n; i++) starts.push_back({intervals[i][0], i});', 'sort'],
      ['sort(starts.begin(), starts.end());', 'sort'],
      ['vector<int> res;'],
      ['for (auto& iv : intervals) {'],
      ['    auto it = lower_bound(starts.begin(), starts.end(), make_pair(iv[1], INT_MIN));', 'find', 'none'],
      ['    res.push_back(it == starts.end() ? -1 : it->second);', 'find', 'none'],
      ['}'],
      ['return res;', 'ret'],
    ]),
    java: java('int[] findRightInterval(int[][] intervals)', [
      ['int n = intervals.length;'],
      ['int[][] starts = new int[n][2];'],
      ['for (int i = 0; i < n; i++) starts[i] = new int[]{intervals[i][0], i};', 'sort'],
      ['Arrays.sort(starts, (a, b) -> a[0] - b[0]);', 'sort'],
      ['int[] res = new int[n];'],
      ['for (int i = 0; i < n; i++) {'],
      ['    int lo = 0, hi = n, end = intervals[i][1];', 'find', 'none'],
      ['    while (lo < hi) { int mid = (lo + hi) / 2; if (starts[mid][0] >= end) hi = mid; else lo = mid + 1; }', 'find', 'none'],
      ['    res[i] = lo == n ? -1 : starts[lo][1];', 'find', 'none'],
      ['}'],
      ['return res;', 'ret'],
    ]),
  },
  run(values) {
    const iv = parseMatrix(values.intervals, 'intervals', { maxR: 8, cols: 2 });
    if ('error' in iv) return iv;
    const n = iv.length;
    if (new Set(iv.map((x) => x[0])).size !== n) return { error: 'Start points must be unique.' };
    const starts = iv.map((x, i) => [x[0], i]).sort((a, b) => a[0] - b[0]);
    const sv = starts.map((s) => s[0]);
    const res: number[] = [];
    const out: Step[] = [];
    out.push({ tag: 'sort', trace: ['Sort the start points, remembering which interval each came from: ', A(starts.map(([s, i]) => `${s}(#${i})`).join(', ')), '.'], state: { mode: 'array', arr: sv, lo: 0, hi: n - 1 } as BinarySearchState });
    iv.forEach(([, end], i) => {
      let lo = 0;
      let hi = n;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (sv[mid] >= end) hi = mid; else lo = mid + 1; }
      if (lo === n) {
        res.push(-1);
        out.push({ tag: 'none', trace: ['Interval #', String(i), ' ends at ', A(end), '. No start is ≥ ', String(end), ' → ', F(-1), '.'], state: { mode: 'array', arr: sv, lo: 0, hi: n - 1 } as BinarySearchState });
      } else {
        res.push(starts[lo][1]);
        out.push({ tag: 'find', trace: ['Interval #', String(i), ' ends at ', A(end), '. The smallest start ≥ ', String(end), ' is ', B(sv[lo]), ', from interval ', C(`#${starts[lo][1]}`), '.'], state: { mode: 'array', arr: sv, lo: 0, hi: n - 1, finalIndex: lo } as BinarySearchState });
      }
    });
    out.push({ tag: 'ret', trace: ['Right intervals: ', C(fmt(res)), '.'], state: { mode: 'array', arr: sv, lo: 0, hi: n - 1 } as BinarySearchState });
    return { steps: out, result: fmt(res) };
  },
  note: 'The question is a lower-bound lookup ("smallest start ≥ end") asked n times. Sorting the starts once — while carrying their original index — makes each lookup O(log n).',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

/* ================= Maximum Candies Allocated to K Children ================= */
const maxCandies: ProblemDef = {
  slug: 'maximum-candies-allocated-to-k-children',
  title: 'Maximum Candies Allocated to K Children',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-candies-allocated-to-k-children/',
  technique: 'Binary search the pile size x: x works if Σ ⌊candies[i] / x⌋ ≥ k.',
  widget: 'binary-search',
  widgetTitle: 'Candies per child',
  inputs: [
    { key: 'candies', label: 'candies', defaultValue: '5, 8, 6', wide: true },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('int maximumCandies(vector<int>& candies, long long k)', [
      ['int lo = 1, hi = *max_element(candies.begin(), candies.end()), best = 0;', 'init'],
      ['while (lo <= hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'yes', 'no'],
      ['    long long kids = 0;', 'yes', 'no'],
      ['    for (int c : candies) kids += c / mid;', 'yes', 'no'],
      ['    if (kids >= k) { best = mid; lo = mid + 1; }', 'yes'],
      ['    else hi = mid - 1;', 'no'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int maximumCandies(int[] candies, long k)', [
      ['int lo = 1, hi = 0, best = 0;'],
      ['for (int c : candies) hi = Math.max(hi, c);', 'init'],
      ['while (lo <= hi) {'],
      ['    int mid = lo + (hi - lo) / 2;', 'yes', 'no'],
      ['    long kids = 0;', 'yes', 'no'],
      ['    for (int c : candies) kids += c / mid;', 'yes', 'no'],
      ['    if (kids >= k) { best = mid; lo = mid + 1; }', 'yes'],
      ['    else hi = mid - 1;', 'no'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const c = parseIntArray(values.candies, { maxLen: 10, min: 1, max: 100000 });
    if (typeof c === 'string') return { error: c };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const kids = (x: number) => c.reduce((s, v) => s + Math.floor(v / x), 0);
    const { steps, best } = searchAnswer({
      lo: 1, hi: Math.max(...c), want: 'max', label: 'x',
      ok: (x) => kids(x) >= k,
      probe: (x) => `${kids(x)} children get ${x}`,
      intro: ['Each child gets x candies from a single pile. Try x between ', A(1), ' and the biggest pile ', A(Math.max(...c)), '.'],
    });
    const ans = best ?? 0;
    steps[steps.length - 1].trace = best === null ? ['Not even 1 candy each is possible → ', C(0), '.'] : ['The most each of the ', String(k), ' children can get is ', C(ans), '.'];
    return { steps, result: String(ans) };
  },
  note: 'If every child can get x candies, they can certainly get fewer — so feasibility is true up to some point and false after. That monotonic shape is what lets you binary-search the answer instead of the array.',
  complexity: { time: 'O(n log max)', space: 'O(1)' },
};

/* ================= Minimum Time to Complete Trips ================= */
const minTimeTrips: ProblemDef = {
  slug: 'minimum-time-to-complete-trips',
  title: 'Minimum Time to Complete Trips',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-time-to-complete-trips/',
  technique: 'Binary search the time T: by T, bus i finishes ⌊T / time[i]⌋ trips; find the smallest T reaching totalTrips.',
  widget: 'binary-search',
  widgetTitle: 'Time T',
  inputs: [
    { key: 'time', label: 'time', defaultValue: '1, 2, 3', wide: true },
    { key: 'totalTrips', label: 'totalTrips', defaultValue: '5' },
  ],
  code: {
    cpp: cpp('long long minimumTime(vector<int>& time, int totalTrips)', [
      ['long long lo = 1, hi = (long long) *min_element(time.begin(), time.end()) * totalTrips;', 'init'],
      ['while (lo < hi) {'],
      ['    long long mid = lo + (hi - lo) / 2, trips = 0;', 'yes', 'no'],
      ['    for (int t : time) trips += mid / t;', 'yes', 'no'],
      ['    if (trips >= totalTrips) hi = mid;', 'yes'],
      ['    else lo = mid + 1;', 'no'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
    java: java('long minimumTime(int[] time, int totalTrips)', [
      ['int fastest = Integer.MAX_VALUE; for (int t : time) fastest = Math.min(fastest, t);'],
      ['long lo = 1, hi = (long) fastest * totalTrips;', 'init'],
      ['while (lo < hi) {'],
      ['    long mid = lo + (hi - lo) / 2, trips = 0;', 'yes', 'no'],
      ['    for (int t : time) trips += mid / t;', 'yes', 'no'],
      ['    if (trips >= totalTrips) hi = mid;', 'yes'],
      ['    else lo = mid + 1;', 'no'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
  },
  run(values) {
    const t = parseIntArray(values.time, { maxLen: 10, min: 1, max: 1000 });
    if (typeof t === 'string') return { error: t };
    const total = parseInt1(values.totalTrips, 'totalTrips', { min: 1, max: 100000 });
    if (typeof total === 'string') return { error: total };
    const trips = (T: number) => t.reduce((s, v) => s + Math.floor(T / v), 0);
    const hi = Math.min(...t) * total;
    const { steps, best } = searchAnswer({
      lo: 1, hi, want: 'min', label: 'T',
      ok: (T) => trips(T) >= total,
      probe: (T) => `${trips(T)} trips by then`,
      intro: ['The fastest bus alone finishes in ', A(hi), ', so the answer is in [1, ', A(hi), '].'],
    });
    return { steps, result: String(best) };
  },
  note: 'More time never means fewer trips, so "enough trips by T" flips from false to true exactly once. The upper bound comes from letting the fastest bus do every trip by itself.',
  complexity: { time: 'O(n log(min·total))', space: 'O(1)' },
};

/* ================= Minimum Time to Repair Cars ================= */
const repairCars: ProblemDef = {
  slug: 'minimum-time-to-repair-cars',
  title: 'Minimum Time to Repair Cars',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-time-to-repair-cars/',
  technique: 'Binary search the time T: a mechanic of rank r fixes ⌊√(T / r)⌋ cars in T minutes.',
  widget: 'binary-search',
  widgetTitle: 'Time T',
  inputs: [
    { key: 'ranks', label: 'ranks', defaultValue: '4, 2, 3, 1', wide: true },
    { key: 'cars', label: 'cars', defaultValue: '10' },
  ],
  code: {
    cpp: cpp('long long repairCars(vector<int>& ranks, int cars)', [
      ['long long lo = 1, hi = (long long) *min_element(ranks.begin(), ranks.end()) * cars * cars;', 'init'],
      ['while (lo < hi) {'],
      ['    long long mid = lo + (hi - lo) / 2, fixed = 0;', 'yes', 'no'],
      ['    for (int r : ranks) fixed += (long long) sqrt(mid / r);', 'yes', 'no'],
      ['    if (fixed >= cars) hi = mid;', 'yes'],
      ['    else lo = mid + 1;', 'no'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
    java: java('long repairCars(int[] ranks, int cars)', [
      ['int best = Integer.MAX_VALUE; for (int r : ranks) best = Math.min(best, r);'],
      ['long lo = 1, hi = (long) best * cars * cars;', 'init'],
      ['while (lo < hi) {'],
      ['    long mid = lo + (hi - lo) / 2, fixed = 0;', 'yes', 'no'],
      ['    for (int r : ranks) fixed += (long) Math.sqrt(mid / r);', 'yes', 'no'],
      ['    if (fixed >= cars) hi = mid;', 'yes'],
      ['    else lo = mid + 1;', 'no'],
      ['}'],
      ['return lo;', 'ret'],
    ]),
  },
  run(values) {
    const r = parseIntArray(values.ranks, { maxLen: 10, min: 1, max: 100 });
    if (typeof r === 'string') return { error: r };
    const cars = parseInt1(values.cars, 'cars', { min: 1, max: 1000 });
    if (typeof cars === 'string') return { error: cars };
    const fixed = (T: number) => r.reduce((s, v) => s + Math.floor(Math.sqrt(Math.floor(T / v))), 0);
    const hi = Math.min(...r) * cars * cars;
    const { steps, best } = searchAnswer({
      lo: 1, hi, want: 'min', label: 'T',
      ok: (T) => fixed(T) >= cars,
      probe: (T) => `${fixed(T)} cars fixed`,
      intro: ['Fixing n cars takes rank × n² minutes. The best mechanic alone needs ', A(hi), ', so search [1, ', A(hi), '].'],
    });
    return { steps, result: String(best) };
  },
  note: 'Inverting r · n² ≤ T gives n = ⌊√(T / r)⌋ cars per mechanic. Since that only grows with T, the total is monotonic and the smallest T that reaches the target can be binary-searched.',
  complexity: { time: 'O(n log(min·cars²))', space: 'O(1)' },
};

/* ================= Magnetic Force Between Two Balls ================= */
const magneticForce: ProblemDef = {
  slug: 'magnetic-force-between-two-balls',
  title: 'Magnetic Force Between Two Balls',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/magnetic-force-between-two-balls/',
  technique: 'Binary search the gap d; greedily drop balls left to right keeping gaps ≥ d and check you placed m.',
  widget: 'binary-search',
  widgetTitle: 'Minimum gap d',
  inputs: [
    { key: 'position', label: 'position', defaultValue: '1, 2, 3, 4, 7', wide: true },
    { key: 'm', label: 'm', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('int maxDistance(vector<int>& position, int m)', [
      ['sort(position.begin(), position.end());', 'init'],
      ['int lo = 1, hi = position.back() - position[0], best = 0;', 'init'],
      ['while (lo <= hi) {'],
      ['    int d = lo + (hi - lo) / 2, placed = 1, last = position[0];', 'yes', 'no'],
      ['    for (int p : position) if (p - last >= d) { placed++; last = p; }', 'yes', 'no'],
      ['    if (placed >= m) { best = d; lo = d + 1; }', 'yes'],
      ['    else hi = d - 1;', 'no'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int maxDistance(int[] position, int m)', [
      ['Arrays.sort(position);', 'init'],
      ['int lo = 1, hi = position[position.length - 1] - position[0], best = 0;', 'init'],
      ['while (lo <= hi) {'],
      ['    int d = lo + (hi - lo) / 2, placed = 1, last = position[0];', 'yes', 'no'],
      ['    for (int p : position) if (p - last >= d) { placed++; last = p; }', 'yes', 'no'],
      ['    if (placed >= m) { best = d; lo = d + 1; }', 'yes'],
      ['    else hi = d - 1;', 'no'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const p0 = parseIntArray(values.position, { maxLen: 14, min: 0 });
    if (typeof p0 === 'string') return { error: p0 };
    const m = parseInt1(values.m, 'm', { min: 2, max: p0.length });
    if (typeof m === 'string') return { error: m };
    if (new Set(p0).size !== p0.length) return { error: 'Positions must be distinct.' };
    const p = [...p0].sort((a, b) => a - b);
    const placed = (d: number) => { let cnt = 1; let last = p[0]; for (const x of p) if (x - last >= d) { cnt++; last = x; } return cnt; };
    const { steps, best } = searchAnswer({
      lo: 1, hi: p[p.length - 1] - p[0], want: 'max', label: 'gap',
      ok: (d) => placed(d) >= m,
      probe: (d) => `greedy fits ${placed(d)} balls`,
      intro: ['Sorted baskets: ', A(fmt(p)), '. The minimum gap is between 1 and ', A(p[p.length - 1] - p[0]), '.'],
    });
    return { steps, result: String(best ?? 0) };
  },
  note: 'For a fixed gap d, placing each ball in the leftmost basket that respects d is optimal — it leaves the most room for the rest. A bigger d can only fit fewer balls, so the largest feasible d can be binary-searched.',
  complexity: { time: 'O(n log n + n log range)', space: 'O(1) beyond sorting' },
};

/* ================= Longest Nice Substring ================= */
const longestNice: ProblemDef = {
  slug: 'longest-nice-substring',
  title: 'Longest Nice Substring',
  category: 'Recursion',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/longest-nice-substring/',
  technique: 'Divide and conquer: a char whose other case is missing can never be in a nice substring, so split around it and recurse.',
  widget: 'stack',
  widgetTitle: 's and the recursion stack',
  inputs: [{ key: 's', label: 's', defaultValue: 'YazaAay' }],
  code: {
    cpp: cpp('string longestNiceSubstring(string s)', [
      ['if (s.size() < 2) return "";', 'base'],
      ['unordered_set<char> has(s.begin(), s.end());', 'call'],
      ['for (int i = 0; i < s.size(); i++) {'],
      ['    char c = s[i];', 'split'],
      ['    if (has.count(tolower(c)) && has.count(toupper(c))) continue;', 'split'],
      ['    string a = longestNiceSubstring(s.substr(0, i));', 'split'],
      ['    string b = longestNiceSubstring(s.substr(i + 1));', 'split'],
      ['    return a.size() >= b.size() ? a : b;', 'pick'],
      ['}'],
      ['return s;', 'nice'],
    ]),
    java: java('String longestNiceSubstring(String s)', [
      ['if (s.length() < 2) return "";', 'base'],
      ['Set<Character> has = new HashSet<>();', 'call'],
      ['for (char c : s.toCharArray()) has.add(c);', 'call'],
      ['for (int i = 0; i < s.length(); i++) {'],
      ['    char c = s.charAt(i);', 'split'],
      ['    if (has.contains(Character.toLowerCase(c)) && has.contains(Character.toUpperCase(c))) continue;', 'split'],
      ['    String a = longestNiceSubstring(s.substring(0, i));', 'split'],
      ['    String b = longestNiceSubstring(s.substring(i + 1));', 'split'],
      ['    return a.length() >= b.length() ? a : b;', 'pick'],
      ['}'],
      ['return s;', 'nice'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 16, re: /^[a-zA-Z]+$/, reMsg: 'Use letters only.' });
    if (typeof s !== 'string') return s;
    const cs = s.split('');
    const out: Step[] = [];
    const stack: string[] = [];
    const st = (lo: number, hi: number, mark: ArrayState['mark'] = {}): StackState => ({
      array: arr(cs, { window: hi >= lo ? [lo, hi] : null, mark }),
      stack: stack.map((v, i) => ({ v, c: i === stack.length - 1 ? 'a' : undefined })),
      stackLabel: 'calls',
    });
    const solve = (lo: number, hi: number): string => {
      const sub = s.slice(lo, hi + 1);
      stack.push(`"${sub}"`);
      if (sub.length < 2) {
        out.push({ tag: 'base', trace: ['"', F(sub), '" is shorter than 2 — it cannot be nice. Return "".'], state: st(lo, hi) });
        stack.pop();
        return '';
      }
      const has = new Set(sub);
      out.push({ tag: 'call', trace: ['Look at "', A(sub), '": which letters are missing their other case?'], state: st(lo, hi) });
      for (let i = 0; i < sub.length; i++) {
        const c = sub[i];
        if (has.has(c.toLowerCase()) && has.has(c.toUpperCase())) continue;
        out.push({ tag: 'split', trace: [F(`'${c}'`), ' has no partner case in this piece, so no nice substring can contain it. Split around it.'], state: st(lo, hi, { [lo + i]: 'dim' }) });
        const a = out.length < MAX_STEPS ? solve(lo, lo + i - 1) : '';
        const b = out.length < MAX_STEPS ? solve(lo + i + 1, hi) : '';
        const win = a.length >= b.length ? a : b;
        out.push({ tag: 'pick', trace: ['Back in "', A(sub), '": left gave "', B(a), '", right gave "', B(b), '". Keep the longer (left on ties): "', C(win), '".'], state: st(lo, hi) });
        stack.pop();
        return win;
      }
      const mark: NonNullable<ArrayState['mark']> = {};
      for (let j = lo; j <= hi; j++) mark[j] = 'good';
      out.push({ tag: 'nice', trace: ['Every letter of "', B(sub), '" has both cases — the whole piece is nice.'], state: st(lo, hi, mark) });
      stack.pop();
      return sub;
    };
    const res = solve(0, cs.length - 1);
    return { steps: out, result: `"${res}"` };
  },
  note: 'A "bad" char splits the string into independent halves, because any nice substring must avoid it. Recursing on both halves and taking the longer one (left wins ties, giving the earliest) solves it in O(n log n) on typical inputs.',
  complexity: { time: 'O(n²) worst, O(n log n) typical', space: 'O(n) recursion' },
};

/* ================= K-th Symbol in Grammar ================= */
const kthGrammar: ProblemDef = {
  slug: 'k-th-symbol-in-grammar',
  title: 'K-th Symbol in Grammar',
  category: 'Recursion',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/k-th-symbol-in-grammar/',
  technique: 'Row n is row n−1 followed by its flip, so position k in the second half is the flip of position k − half.',
  widget: 'stack',
  widgetTitle: 'Recursion from row n down to row 1',
  inputs: [
    { key: 'n', label: 'n', defaultValue: '4' },
    { key: 'k', label: 'k', defaultValue: '6' },
  ],
  code: {
    cpp: cpp('int kthGrammar(int n, int k)', [
      ['if (n == 1) return 0;', 'base'],
      ['int half = 1 << (n - 2);', 'call'],
      ['if (k <= half) return kthGrammar(n - 1, k);', 'left'],
      ['return 1 - kthGrammar(n - 1, k - half);', 'right'],
    ]),
    java: java('int kthGrammar(int n, int k)', [
      ['if (n == 1) return 0;', 'base'],
      ['int half = 1 << (n - 2);', 'call'],
      ['if (k <= half) return kthGrammar(n - 1, k);', 'left'],
      ['return 1 - kthGrammar(n - 1, k - half);', 'right'],
    ]),
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 30 });
    if (typeof n === 'string') return { error: n };
    const k = parseInt1(values.k, 'k', { min: 1, max: 2 ** (n - 1) });
    if (typeof k === 'string') return { error: k };
    const rowOf = (r: number) => { let row = '0'; for (let i = 1; i < r; i++) row = row + [...row].map((c) => (c === '0' ? '1' : '0')).join(''); return row; };
    const stack: { v: string; c?: 'a' | 'b' | 'c' | 'f' }[] = [];
    const out: Step[] = [];
    const view = (r: number, kk: number): StackState => {
      const show = r <= 5;
      const row = show ? rowOf(r).split('') : [`row ${r}: ${2 ** (r - 1)} symbols`];
      return { array: arr(row, show ? { ptrs: [{ name: 'k', i: kk - 1, c: 'a' }] } : {}), stack: [...stack], stackLabel: 'calls' };
    };
    let flips = 0;
    let r = n;
    let kk = k;
    while (r > 1) {
      const half = 2 ** (r - 2);
      stack.push({ v: `row ${r}, k=${kk}`, c: 'a' });
      if (kk <= half) {
        out.push({ tag: 'left', trace: ['Row ', A(r), ': k = ', A(kk), ' is in the first half (≤ ', String(half), '), which is an exact copy of row ', String(r - 1), '.'], state: view(r, kk) });
      } else {
        flips++;
        out.push({ tag: 'right', trace: ['Row ', A(r), ': k = ', A(kk), ' is in the second half — the flip of row ', String(r - 1), ' at position ', B(kk - half), '. Flips so far: ', B(flips), '.'], state: view(r, kk) });
        kk -= half;
      }
      r--;
    }
    const ans = flips % 2;
    out.push({ tag: 'base', trace: ['Row 1 is just "0". Undo ', B(flips), ' flip(s) on the way back up → ', C(ans), '.'], state: view(1, 1) });
    return { steps: out, result: String(ans) };
  },
  note: 'You never build the row (it has 2ⁿ⁻¹ symbols). Each level halves k and maybe flips the answer, so the result is just the parity of how many times k landed in a second half — the number of 1-bits in k − 1.',
  complexity: { time: 'O(n)', space: 'O(n) recursion (O(1) iteratively)' },
};

export const ccSearch: ProblemDef[] = [
  searchInsert,
  successfulPairs,
  findRightInterval,
  peakIndex,
  maxCandies,
  minTimeTrips,
  repairCars,
  magneticForce,
  longestNice,
  kthGrammar,
];
