// Code Catalyst — Practice Set 9: monotonic deques inside sliding windows.
import type { ArrayState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, parseMatrix } from './util';

const cpp = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L('public:'),
  L(`    ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('};'),
];
const java = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L(`    public ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('}'),
];

/** Window with max/min deques drawn as two columns. */
function maxMinView(a: number[], l: number, r: number, mx: number[], mn: number[], aggs: StackState['aggs']): StackState {
  return {
    array: arr(a, { window: l <= r ? [l, r] : null, ptrs: [{ name: 'l', i: l, c: 'b' }, { name: 'r', i: r, c: 'a' }] }),
    stack: mx.map((i) => ({ v: a[i] })),
    stackLabel: 'max deque',
    stack2: mn.map((i) => ({ v: a[i] })),
    stack2Label: 'min deque',
    aggs,
  };
}

/* ================= Longest Continuous Subarray With Absolute Diff ≤ Limit ================= */
const longestLimit: ProblemDef = {
  slug: 'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit',
  title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/',
  technique: 'Sliding window with a decreasing deque (window max) and an increasing deque (window min); shrink while max − min > limit.',
  widget: 'stack',
  widgetTitle: 'Window with max/min deques (front at the bottom)',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '10, 1, 2, 4, 7, 2', wide: true },
    { key: 'limit', label: 'limit', defaultValue: '5' },
  ],
  code: {
    cpp: cpp('int longestSubarray(vector<int>& nums, int limit)', [
      ['deque<int> mx, mn;'],
      ['int l = 0, best = 0;'],
      ['for (int r = 0; r < nums.size(); r++) {'],
      ['    while (!mx.empty() && nums[mx.back()] <= nums[r]) mx.pop_back();', 'add'],
      ['    while (!mn.empty() && nums[mn.back()] >= nums[r]) mn.pop_back();', 'add'],
      ['    mx.push_back(r); mn.push_back(r);', 'add'],
      ['    while (nums[mx.front()] - nums[mn.front()] > limit) {', 'shrink'],
      ['        if (mx.front() == l) mx.pop_front();', 'shrink'],
      ['        if (mn.front() == l) mn.pop_front();', 'shrink'],
      ['        l++;', 'shrink'],
      ['    }'],
      ['    best = max(best, r - l + 1);', 'ok'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int longestSubarray(int[] nums, int limit)', [
      ['Deque<Integer> mx = new ArrayDeque<>(), mn = new ArrayDeque<>();'],
      ['int l = 0, best = 0;'],
      ['for (int r = 0; r < nums.length; r++) {'],
      ['    while (!mx.isEmpty() && nums[mx.peekLast()] <= nums[r]) mx.pollLast();', 'add'],
      ['    while (!mn.isEmpty() && nums[mn.peekLast()] >= nums[r]) mn.pollLast();', 'add'],
      ['    mx.addLast(r); mn.addLast(r);', 'add'],
      ['    while (nums[mx.peekFirst()] - nums[mn.peekFirst()] > limit) {', 'shrink'],
      ['        if (mx.peekFirst() == l) mx.pollFirst();', 'shrink'],
      ['        if (mn.peekFirst() == l) mn.pollFirst();', 'shrink'],
      ['        l++;', 'shrink'],
      ['    }'],
      ['    best = Math.max(best, r - l + 1);', 'ok'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    const limit = parseInt1(values.limit, 'limit', { min: 0 });
    if (typeof limit === 'string') return { error: limit };
    const mx: number[] = [];
    const mn: number[] = [];
    let l = 0;
    let best = 0;
    const out: Step[] = [];
    for (let r = 0; r < a.length; r++) {
      while (mx.length && a[mx[mx.length - 1]] <= a[r]) mx.pop();
      while (mn.length && a[mn[mn.length - 1]] >= a[r]) mn.pop();
      mx.push(r);
      mn.push(r);
      out.push({ tag: 'add', trace: ['Add ', A(a[r]), '. The deques drop values it makes useless; now max = ', B(a[mx[0]]), ', min = ', B(a[mn[0]]), '.'], state: maxMinView(a, l, r, mx, mn, [ag('best', best, 'c')]) });
      if (a[mx[0]] - a[mn[0]] > limit) {
        while (a[mx[0]] - a[mn[0]] > limit) {
          if (mx[0] === l) mx.shift();
          if (mn[0] === l) mn.shift();
          l++;
        }
        out.push({ tag: 'shrink', trace: ['max − min was over ', String(limit), ', so move l right until it fits: window now starts at ', A(l), '.'], state: maxMinView(a, l, r, mx, mn, [ag('best', best, 'c')]) });
      }
      best = Math.max(best, r - l + 1);
      out.push({ tag: 'ok', trace: ['Window ', String(l), '–', String(r), ': ', B(a[mx[0]]), ' − ', B(a[mn[0]]), ' ≤ ', String(limit), '. Length ', A(r - l + 1), ', best ', C(best), '.'], state: maxMinView(a, l, r, mx, mn, [ag('best', best, 'c')]) });
    }
    out.push({ tag: 'ret', trace: ['Longest valid subarray: ', C(best), '.'], state: maxMinView(a, 0, -1, [], [], [ag('answer', best, 'c')]) });
    return { steps: out, result: String(best) };
  },
  note: 'The window is valid while max − min ≤ limit, which only depends on the window\'s extremes. Monotonic deques keep the current max and min at their fronts in O(1) amortised, so the whole two-pointer scan stays linear.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Continuous Subarrays ================= */
const continuousSubarrays: ProblemDef = {
  slug: 'continuous-subarrays',
  title: 'Continuous Subarrays',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/continuous-subarrays/',
  technique: 'Same max/min-deque window with limit 2; every valid window ending at r adds r − l + 1 subarrays.',
  widget: 'stack',
  widgetTitle: 'Window with max/min deques (front at the bottom)',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '5, 4, 2, 4', wide: true }],
  code: {
    cpp: cpp('long long continuousSubarrays(vector<int>& nums)', [
      ['deque<int> mx, mn;'],
      ['long long count = 0; int l = 0;'],
      ['for (int r = 0; r < nums.size(); r++) {'],
      ['    while (!mx.empty() && nums[mx.back()] <= nums[r]) mx.pop_back();', 'add'],
      ['    while (!mn.empty() && nums[mn.back()] >= nums[r]) mn.pop_back();', 'add'],
      ['    mx.push_back(r); mn.push_back(r);', 'add'],
      ['    while (nums[mx.front()] - nums[mn.front()] > 2) {', 'shrink'],
      ['        if (mx.front() == l) mx.pop_front();', 'shrink'],
      ['        if (mn.front() == l) mn.pop_front();', 'shrink'],
      ['        l++;', 'shrink'],
      ['    }'],
      ['    count += r - l + 1;', 'count'],
      ['}'],
      ['return count;', 'ret'],
    ]),
    java: java('long continuousSubarrays(int[] nums)', [
      ['Deque<Integer> mx = new ArrayDeque<>(), mn = new ArrayDeque<>();'],
      ['long count = 0; int l = 0;'],
      ['for (int r = 0; r < nums.length; r++) {'],
      ['    while (!mx.isEmpty() && nums[mx.peekLast()] <= nums[r]) mx.pollLast();', 'add'],
      ['    while (!mn.isEmpty() && nums[mn.peekLast()] >= nums[r]) mn.pollLast();', 'add'],
      ['    mx.addLast(r); mn.addLast(r);', 'add'],
      ['    while (nums[mx.peekFirst()] - nums[mn.peekFirst()] > 2) {', 'shrink'],
      ['        if (mx.peekFirst() == l) mx.pollFirst();', 'shrink'],
      ['        if (mn.peekFirst() == l) mn.pollFirst();', 'shrink'],
      ['        l++;', 'shrink'],
      ['    }'],
      ['    count += r - l + 1;', 'count'],
      ['}'],
      ['return count;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    const mx: number[] = [];
    const mn: number[] = [];
    let l = 0;
    let count = 0;
    const out: Step[] = [];
    for (let r = 0; r < a.length; r++) {
      while (mx.length && a[mx[mx.length - 1]] <= a[r]) mx.pop();
      while (mn.length && a[mn[mn.length - 1]] >= a[r]) mn.pop();
      mx.push(r);
      mn.push(r);
      out.push({ tag: 'add', trace: ['Add ', A(a[r]), ': window max = ', B(a[mx[0]]), ', min = ', B(a[mn[0]]), '.'], state: maxMinView(a, l, r, mx, mn, [ag('count', count, 'c')]) });
      if (a[mx[0]] - a[mn[0]] > 2) {
        while (a[mx[0]] - a[mn[0]] > 2) {
          if (mx[0] === l) mx.shift();
          if (mn[0] === l) mn.shift();
          l++;
        }
        out.push({ tag: 'shrink', trace: ['max − min > 2, so drop from the left until it fits. l = ', A(l), '.'], state: maxMinView(a, l, r, mx, mn, [ag('count', count, 'c')]) });
      }
      count += r - l + 1;
      out.push({ tag: 'count', trace: ['Every subarray ending at ', String(r), ' and starting in ', String(l), '..', String(r), ' is continuous: +', B(r - l + 1), ' → ', C(count), '.'], state: maxMinView(a, l, r, mx, mn, [ag('count', count, 'c')]) });
    }
    out.push({ tag: 'ret', trace: ['Total continuous subarrays: ', C(count), '.'], state: maxMinView(a, 0, -1, [], [], [ag('answer', count, 'c')]) });
    return { steps: out, result: String(count) };
  },
  note: '"All pairs differ by at most 2" is the same as max − min ≤ 2. If a window is valid, every suffix of it is too, so counting r − l + 1 per right end counts each valid subarray exactly once.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Maximum Number of Robots Within Budget ================= */
const robots: ProblemDef = {
  slug: 'maximum-number-of-robots-within-budget',
  title: 'Maximum Number of Robots Within Budget',
  category: 'Sliding Window',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/maximum-number-of-robots-within-budget/',
  technique: 'Window cost = max(chargeTimes) + size × sum(runningCosts): a max-deque plus a running sum, shrinking when over budget.',
  widget: 'stack',
  widgetTitle: 'chargeTimes window with a max deque',
  inputs: [
    { key: 'chargeTimes', label: 'chargeTimes', defaultValue: '3, 6, 1, 3, 4', wide: true },
    { key: 'runningCosts', label: 'runningCosts', defaultValue: '2, 1, 3, 4, 5', wide: true },
    { key: 'budget', label: 'budget', defaultValue: '25' },
  ],
  code: {
    cpp: cpp('int maximumRobots(vector<int>& chargeTimes, vector<int>& runningCosts, long long budget)', [
      ['deque<int> mx;'],
      ['long long sum = 0; int l = 0, best = 0;'],
      ['for (int r = 0; r < chargeTimes.size(); r++) {'],
      ['    while (!mx.empty() && chargeTimes[mx.back()] <= chargeTimes[r]) mx.pop_back();', 'add'],
      ['    mx.push_back(r); sum += runningCosts[r];', 'add'],
      ['    while (l <= r && chargeTimes[mx.front()] + (r - l + 1) * sum > budget) {', 'shrink'],
      ['        if (mx.front() == l) mx.pop_front();', 'shrink'],
      ['        sum -= runningCosts[l++];', 'shrink'],
      ['    }'],
      ['    best = max(best, r - l + 1);', 'ok'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int maximumRobots(int[] chargeTimes, int[] runningCosts, long budget)', [
      ['Deque<Integer> mx = new ArrayDeque<>();'],
      ['long sum = 0; int l = 0, best = 0;'],
      ['for (int r = 0; r < chargeTimes.length; r++) {'],
      ['    while (!mx.isEmpty() && chargeTimes[mx.peekLast()] <= chargeTimes[r]) mx.pollLast();', 'add'],
      ['    mx.addLast(r); sum += runningCosts[r];', 'add'],
      ['    while (l <= r && chargeTimes[mx.peekFirst()] + (long) (r - l + 1) * sum > budget) {', 'shrink'],
      ['        if (mx.peekFirst() == l) mx.pollFirst();', 'shrink'],
      ['        sum -= runningCosts[l++];', 'shrink'],
      ['    }'],
      ['    best = Math.max(best, r - l + 1);', 'ok'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const ct = parseIntArray(values.chargeTimes, { maxLen: 12, min: 1 });
    if (typeof ct === 'string') return { error: ct };
    const rc = parseIntArray(values.runningCosts, { maxLen: 12, min: 1 });
    if (typeof rc === 'string') return { error: rc };
    if (ct.length !== rc.length) return { error: 'chargeTimes and runningCosts must be the same length.' };
    const budget = parseInt1(values.budget, 'budget', { min: 1 });
    if (typeof budget === 'string') return { error: budget };
    const mx: number[] = [];
    let sum = 0;
    let l = 0;
    let best = 0;
    const out: Step[] = [];
    const cost = (r: number) => (l <= r && mx.length ? ct[mx[0]] + (r - l + 1) * sum : 0);
    const view = (r: number): StackState => ({
      array: arr(ct, { window: l <= r ? [l, r] : null, ptrs: [{ name: 'l', i: Math.min(l, ct.length - 1), c: 'b' }, { name: 'r', i: r, c: 'a' }] }),
      stack: mx.map((i) => ({ v: ct[i] })),
      stackLabel: 'max deque',
      aggs: [ag('Σ running', sum), ag('cost', cost(r)), ag('budget', budget, 'b'), ag('best', best, 'c')],
    });
    for (let r = 0; r < ct.length && out.length < MAX_STEPS; r++) {
      while (mx.length && ct[mx[mx.length - 1]] <= ct[r]) mx.pop();
      mx.push(r);
      sum += rc[r];
      out.push({ tag: 'add', trace: ['Add robot ', A(r), ': max charge = ', B(ct[mx[0]]), ', Σ running = ', B(sum), ', cost = ', A(cost(r)), '.'], state: view(r) });
      if (cost(r) > budget) {
        while (l <= r && ct[mx[0]] + (r - l + 1) * sum > budget) {
          if (mx[0] === l) mx.shift();
          sum -= rc[l];
          l++;
        }
        out.push({ tag: 'shrink', trace: ['Over budget ', String(budget), ' — drop robots from the left. Cost now ', B(cost(r)), '.'], state: view(r) });
      }
      best = Math.max(best, r - l + 1);
      out.push({ tag: 'ok', trace: ['Robots ', String(l), '–', String(r), ' fit the budget: ', A(r - l + 1), ' robot(s). Best ', C(best), '.'], state: view(r) });
    }
    out.push({ tag: 'ret', trace: ['Most consecutive robots within budget: ', C(best), '.'], state: { array: arr(ct), stack: [], stackLabel: 'max deque', aggs: [ag('answer', best, 'c')] } as StackState });
    return { steps: out, result: String(best) };
  },
  note: 'Adding a robot can only raise both the max charge and the sum, and removing one can only lower them, so the cost is monotonic in window size — the condition for a two-pointer window. The max-deque supplies the max in O(1).',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Max Value of Equation ================= */
const maxEquation: ProblemDef = {
  slug: 'max-value-of-equation',
  title: 'Max Value of Equation',
  category: 'Sliding Window',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/max-value-of-equation/',
  technique: 'Rewrite as (yj + xj) + (yi − xi); keep a deque of earlier points with decreasing yi − xi, dropping those with xj − xi > k.',
  widget: 'stack',
  widgetTitle: 'Points and a deque of (y − x) candidates',
  inputs: [
    { key: 'points', label: 'points [x,y]', defaultValue: '[[1,3],[2,0],[5,10],[6,-10]]', wide: true },
    { key: 'k', label: 'k', defaultValue: '1' },
  ],
  code: {
    cpp: cpp('int findMaxValueOfEquation(vector<vector<int>>& points, int k)', [
      ['deque<pair<int, int>> dq;  // (y - x, x), y - x decreasing'],
      ['int best = INT_MIN;'],
      ['for (auto& p : points) {'],
      ['    int x = p[0], y = p[1];'],
      ['    while (!dq.empty() && x - dq.front().second > k) dq.pop_front();', 'expire'],
      ['    if (!dq.empty()) best = max(best, dq.front().first + y + x);', 'score'],
      ['    while (!dq.empty() && dq.back().first <= y - x) dq.pop_back();', 'push'],
      ['    dq.push_back({y - x, x});', 'push'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int findMaxValueOfEquation(int[][] points, int k)', [
      ['Deque<int[]> dq = new ArrayDeque<>();  // {y - x, x}, y - x decreasing'],
      ['int best = Integer.MIN_VALUE;'],
      ['for (int[] p : points) {'],
      ['    int x = p[0], y = p[1];'],
      ['    while (!dq.isEmpty() && x - dq.peekFirst()[1] > k) dq.pollFirst();', 'expire'],
      ['    if (!dq.isEmpty()) best = Math.max(best, dq.peekFirst()[0] + y + x);', 'score'],
      ['    while (!dq.isEmpty() && dq.peekLast()[0] <= y - x) dq.pollLast();', 'push'],
      ['    dq.addLast(new int[]{y - x, x});', 'push'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const pts = parseMatrix(values.points, 'points', { maxR: 10, cols: 2 });
    if ('error' in pts) return pts;
    for (let i = 1; i < pts.length; i++) if (pts[i][0] <= pts[i - 1][0]) return { error: 'x values must be strictly increasing.' };
    const k = parseInt1(values.k, 'k', { min: 0 });
    if (typeof k === 'string') return { error: k };
    const dq: [number, number][] = [];
    let best = -Infinity;
    const out: Step[] = [];
    const labels = pts.map(([x, y]) => `(${x},${y})`);
    const view = (j: number | null, mark: ArrayState['mark'] = {}): StackState => ({
      array: arr(labels, { mark, ptrs: j === null ? [] : [{ name: 'j', i: j, c: 'a' }] }),
      stack: dq.map(([v, x]) => ({ v: `y−x=${v} @x=${x}` })),
      stackLabel: 'deque (front at bottom)',
      aggs: [ag('best', best === -Infinity ? '—' : best, 'c')],
    });
    pts.forEach(([x, y], j) => {
      const expired: number[] = [];
      while (dq.length && x - dq[0][1] > k) expired.push(dq.shift()![1]);
      if (expired.length) out.push({ tag: 'expire', trace: ['At x = ', A(x), ', points at x = ', F(expired.join(', ')), ' are more than k = ', String(k), ' away — drop them.'], state: view(j) });
      if (dq.length) {
        const v = dq[0][0] + y + x;
        best = Math.max(best, v);
        out.push({ tag: 'score', trace: ['Best partner has y − x = ', B(dq[0][0]), '. Value = ', B(dq[0][0]), ' + (', String(y), ' + ', String(x), ') = ', A(v), '. Best ', C(best), '.'], state: view(j, { [j]: 'active' }) });
      }
      while (dq.length && dq[dq.length - 1][0] <= y - x) dq.pop();
      dq.push([y - x, x]);
      out.push({ tag: 'push', trace: ['Offer this point as a future partner: y − x = ', A(y - x), '. Weaker candidates behind it are removed — it is newer and at least as good.'], state: view(j) });
    });
    out.push({ tag: 'ret', trace: ['Maximum value: ', C(best), '.'], state: view(null) });
    return { steps: out, result: String(best) };
  },
  note: 'With xi < xj, |xi − xj| = xj − xi, so the equation splits into a part for j (yj + xj) and a part for i (yi − xi). For each j you want the biggest yi − xi among points within k — a sliding-window maximum, which a monotonic deque gives in O(1) amortised.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const ccDequeWindow: ProblemDef[] = [longestLimit, continuousSubarrays, robots, maxEquation];
