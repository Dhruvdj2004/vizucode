// Dynamic Programming, part 1: 1-D DP (array widget).
import type { ArrayState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/* ================= 107. Climbing Stairs ================= */
const climbingStairs: ProblemDef = {
  slug: 'climbing-stairs',
  title: 'Climbing Stairs',
  category: 'Dynamic Programming',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/climbing-stairs/',
  technique: 'Fibonacci in disguise: ways(n) = ways(n−1) + ways(n−2).',
  widget: 'array',
  widgetTitle: 'Ways to reach each step',
  inputs: [{ key: 'n', label: 'Steps n', defaultValue: '6' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int climbStairs(int n) {'),
      L('        if (n <= 2) return n;', 'base'),
      L('        int prev2 = 1, prev1 = 2;', 'base'),
      L('        for (int i = 3; i <= n; i++) {', 'loop'),
      L('            int cur = prev1 + prev2;', 'fill'),
      L('            prev2 = prev1;', 'shift'),
      L('            prev1 = cur;', 'shift'),
      L('        }'),
      L('        return prev1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int climbStairs(int n) {'),
      L('        if (n <= 2) return n;', 'base'),
      L('        int prev2 = 1, prev1 = 2;', 'base'),
      L('        for (int i = 3; i <= n; i++) {', 'loop'),
      L('            int cur = prev1 + prev2;', 'fill'),
      L('            prev2 = prev1;', 'shift'),
      L('            prev1 = cur;', 'shift'),
      L('        }'),
      L('        return prev1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 12 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    const dp: (number | string)[] = Array(n).fill('·');
    const st = (i: number | null, extra?: Partial<ArrayState>): ArrayState => ({
      arr: dp.map((v, j) => `s${j + 1}:${v}`),
      mark: i !== null ? { [i]: 'active' } : {},
      ...extra,
    });
    dp[0] = 1;
    if (n >= 2) dp[1] = 2;
    steps.push({
      tag: 'base',
      trace: ['Base cases: step 1 has ', B(1), ' way, step 2 has ', B(2), ' (1+1 or 2).'],
      state: st(null, { mark: { 0: 'good', 1: 'good' } }),
    });
    for (let i = 3; i <= n; i++) {
      dp[i - 1] = (dp[i - 2] as number) + (dp[i - 3] as number);
      steps.push({
        tag: 'fill',
        tag2: 'shift',
        trace: ['Step ', A(i), ': arrive from step ', A(i - 1), ' (', A(dp[i - 2]), ' ways) or step ', A(i - 2), ' (', A(dp[i - 3]), ' ways) → ', B(dp[i - 1]), ' ways.'],
        state: st(i - 1, { mark: { [i - 1]: 'active', [i - 2]: 'win', [i - 3]: 'win' } }),
      });
    }
    steps.push({ tag: 'ret', trace: ['Ways to reach the top: ', C(dp[n - 1]), '.'], state: st(n - 1, { mark: { [n - 1]: 'final' } }) });
    return { steps, result: String(dp[n - 1]) };
  },
  note: 'The last move is either a 1-step or a 2-step — so the counts of the two previous stairs partition all ways exactly. Only two numbers of history are ever needed, collapsing the DP table to O(1) space.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 108. House Robber ================= */
const houseRobber: ProblemDef = {
  slug: 'house-robber',
  title: 'House Robber',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/house-robber/',
  technique: 'At each house: rob it (skip the previous) or skip it — keep the better of the two.',
  widget: 'array',
  widgetTitle: 'Houses & best loot',
  inputs: [{ key: 'nums', label: 'House values', defaultValue: '2, 7, 9, 3, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int rob(vector<int>& nums) {'),
      L('        int skip = 0, take = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            int newTake = skip + x;', 'decide'),
      L('            skip = max(skip, take);', 'decide'),
      L('            take = newTake;', 'decide'),
      L('        }'),
      L('        return max(skip, take);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int rob(int[] nums) {'),
      L('        int skip = 0, take = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            int newTake = skip + x;', 'decide'),
      L('            skip = Math.max(skip, take);', 'decide'),
      L('            take = newTake;', 'decide'),
      L('        }'),
      L('        return Math.max(skip, take);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    let skip = 0;
    let take = 0;
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: nums,
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'best if last skipped', value: String(skip), c: 'a' },
        { label: 'best if last robbed', value: String(take), c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Track two facts: the best loot if the previous house was ', A('skipped'), ' vs ', B('robbed'), '.'], state: st(0) });
    for (let i = 0; i < nums.length; i++) {
      const newTake = skip + nums[i];
      const newSkip = Math.max(skip, take);
      steps.push({
        tag: 'decide',
        trace: ['House ', A(i), ' ($', A(nums[i]), '): rob it → ', B(newTake), ' (previous must be skipped); skip it → ', A(newSkip), '. Keep both branches alive.'],
        state: st(i, { mark: { [i]: newTake > newSkip ? 'good' : 'dim' } }),
      });
      skip = newSkip;
      take = newTake;
    }
    const result = Math.max(skip, take);
    steps.push({ tag: 'ret', trace: ['Best possible loot: ', C(result), '.'], state: st(nums.length) });
    return { steps, result: String(result) };
  },
  note: 'The adjacency constraint only reaches one house back — so two running values (rob/skip the previous) capture the entire decision history. No table needed; the recurrence *is* the answer.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 109. House Robber II ================= */
const houseRobberII: ProblemDef = {
  slug: 'house-robber-ii',
  title: 'House Robber II',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/house-robber-ii/',
  technique: 'The circle breaks into two lines: rob houses 0…n−2, or houses 1…n−1 — take the better.',
  widget: 'array',
  widgetTitle: 'Houses (circular)',
  inputs: [{ key: 'nums', label: 'House values', defaultValue: '2, 3, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int rob(vector<int>& nums) {'),
      L('        int n = nums.size();', 'init'),
      L('        if (n == 1) return nums[0];', 'init'),
      L('        return max(robLine(nums, 0, n - 2),', 'split'),
      L('                   robLine(nums, 1, n - 1));', 'split'),
      L('    }'),
      L('    int robLine(vector<int>& nums, int lo, int hi) {', 'line'),
      L('        int skip = 0, take = 0;', 'line'),
      L('        for (int i = lo; i <= hi; i++) {', 'line'),
      L('            int newTake = skip + nums[i];', 'line'),
      L('            skip = max(skip, take);', 'line'),
      L('            take = newTake;', 'line'),
      L('        }'),
      L('        return max(skip, take);', 'line'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int rob(int[] nums) {'),
      L('        int n = nums.length;', 'init'),
      L('        if (n == 1) return nums[0];', 'init'),
      L('        return Math.max(robLine(nums, 0, n - 2),', 'split'),
      L('                        robLine(nums, 1, n - 1));', 'split'),
      L('    }'),
      L('    private int robLine(int[] nums, int lo, int hi) {', 'line'),
      L('        int skip = 0, take = 0;', 'line'),
      L('        for (int i = lo; i <= hi; i++) {', 'line'),
      L('            int newTake = skip + nums[i];', 'line'),
      L('            skip = Math.max(skip, take);', 'line'),
      L('            take = newTake;', 'line'),
      L('        }'),
      L('        return Math.max(skip, take);', 'line'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0 });
    if (typeof nums === 'string') return { error: nums };
    const n = nums.length;
    if (n < 2) return { error: 'Need at least two houses for the circle to matter.' };
    const steps: Step[] = [];
    const robLine = (lo: number, hi: number, label: string): number => {
      let skip = 0;
      let take = 0;
      for (let i = lo; i <= hi; i++) {
        const newTake = skip + nums[i];
        skip = Math.max(skip, take);
        take = newTake;
        steps.push({
          tag: 'line',
          trace: [label, ': house ', A(i), ' ($', A(nums[i]), ') — rob → ', B(take), ', skip → ', A(skip), '.'],
          state: {
            arr: nums,
            ptrs: [{ name: 'i', i, c: 'a' }],
            mark: Object.fromEntries(nums.map((_, j) => [j, j < lo || j > hi ? 'dim' : undefined]).filter(([, m]) => m)),
            aggs: [
              { label: 'case', value: label, c: 'c' },
              { label: 'best', value: String(Math.max(skip, take)), c: 'b' },
            ],
          } satisfies ArrayState,
        });
      }
      return Math.max(skip, take);
    };
    steps.push({
      tag: 'split',
      trace: ['Houses form a ', A('circle'), ' — house 0 and house ', A(n - 1), ' are neighbors, so they can never both be robbed. Solve two straight lines instead.'],
      state: { arr: nums, aggs: [{ label: 'plan', value: `line A = 0…${n - 2}, line B = 1…${n - 1}`, c: 'a' }] } satisfies ArrayState,
    });
    const a = robLine(0, n - 2, 'Line A (drop last)');
    const b = robLine(1, n - 1, 'Line B (drop first)');
    const result = Math.max(a, b);
    steps.push({
      tag: 'split',
      trace: ['Line A yields ', A(a), ', line B yields ', A(b), ' — the answer is the better: ', C(result), '.'],
      state: { arr: nums, aggs: [{ label: 'answer', value: String(result), c: 'c' }] } satisfies ArrayState,
    });
    return { steps, result: String(result) };
  },
  note: 'The circle adds exactly one new constraint — first and last exclude each other — and case analysis on it ("don\'t use the last" vs "don\'t use the first") reduces the problem to two runs of the linear House Robber.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 112. Decode Ways ================= */
const decodeWays: ProblemDef = {
  slug: 'decode-ways',
  title: 'Decode Ways',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/decode-ways/',
  technique: 'Like climbing stairs, but a step is legal only if the 1- or 2-digit chunk decodes.',
  widget: 'array',
  widgetTitle: 'Digits & ways',
  inputs: [{ key: 's', label: 'Digit string', defaultValue: '226' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numDecodings(string s) {'),
      L('        if (s[0] == \'0\') return 0;', 'init'),
      L('        int prev2 = 1, prev1 = 1;', 'init'),
      L('        for (int i = 1; i < s.size(); i++) {', 'loop'),
      L('            int cur = 0;', 'loop'),
      L('            if (s[i] != \'0\')', 'one'),
      L('                cur += prev1;', 'one'),
      L('            int two = (s[i-1] - \'0\') * 10 + (s[i] - \'0\');', 'two'),
      L('            if (two >= 10 && two <= 26)', 'two'),
      L('                cur += prev2;', 'two'),
      L('            if (cur == 0) return 0;', 'dead'),
      L('            prev2 = prev1;', 'shift'),
      L('            prev1 = cur;', 'shift'),
      L('        }'),
      L('        return prev1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numDecodings(String s) {'),
      L('        if (s.charAt(0) == \'0\') return 0;', 'init'),
      L('        int prev2 = 1, prev1 = 1;', 'init'),
      L('        for (int i = 1; i < s.length(); i++) {', 'loop'),
      L('            int cur = 0;', 'loop'),
      L('            if (s.charAt(i) != \'0\')', 'one'),
      L('                cur += prev1;', 'one'),
      L('            int two = (s.charAt(i-1) - \'0\') * 10 + (s.charAt(i) - \'0\');', 'two'),
      L('            if (two >= 10 && two <= 26)', 'two'),
      L('                cur += prev2;', 'two'),
      L('            if (cur == 0) return 0;', 'dead'),
      L('            prev2 = prev1;', 'shift'),
      L('            prev1 = cur;', 'shift'),
      L('        }'),
      L('        return prev1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^\d{1,12}$/.test(s)) return { error: 'Enter 1–12 digits.' };
    const steps: Step[] = [];
    const chars = s.split('');
    const ways: number[] = [];
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars.map((c, j) => (j < ways.length ? `${c}｜${ways[j]}` : `${c}｜·`)),
      ptrs: i < chars.length ? [{ name: 'i', i, c: 'a' }] : [],
      ...extra,
    });
    if (s[0] === '0') {
      steps.push({ tag: 'init', trace: ['Leading ', F('0'), ' decodes to nothing — return ', C(0), '.'], state: st(0) });
      return { steps, result: '0', resultDetail: 'no valid decoding' };
    }
    ways.push(1);
    steps.push({ tag: 'init', trace: ['Each box shows ', A('digit｜ways to decode up to here'), ". The first digit '", A(s[0]), "' has ", B(1), ' way.'], state: st(0) });
    let prev2 = 1;
    let prev1 = 1;
    for (let i = 1; i < s.length; i++) {
      let cur = 0;
      const parts: string[] = [];
      if (s[i] !== '0') {
        cur += prev1;
        parts.push(`'${s[i]}' alone (+${prev1})`);
      }
      const two = Number(s.slice(i - 1, i + 1));
      if (two >= 10 && two <= 26) {
        cur += prev2;
        parts.push(`'${s.slice(i - 1, i + 1)}' as a pair (+${prev2})`);
      }
      if (cur === 0) {
        steps.push({ tag: 'dead', trace: ["Digit '", F(s[i]), "' can neither stand alone nor pair with '", F(s[i - 1]), "' — the string is undecodable. Return ", C(0), '.'], state: st(i) });
        return { steps, result: '0', resultDetail: 'no valid decoding' };
      }
      ways.push(cur);
      steps.push({
        tag: 'one',
        tag2: 'two',
        trace: ['Position ', A(i), ': ', A(parts.join(' and ')), ' → ', B(cur), ' way(s).'],
        state: st(i, { mark: { [i]: 'active', [i - 1]: 'win' } }),
      });
      prev2 = prev1;
      prev1 = cur;
    }
    steps.push({ tag: 'ret', trace: ['Total decodings: ', C(prev1), '.'], state: st(s.length - 1, { mark: { [s.length - 1]: 'final' } }) });
    return { steps, result: String(prev1) };
  },
  note: 'Structurally identical to Climbing Stairs — the last "move" consumes 1 or 2 digits — but each move now has a validity test (no lone 0, pairs only 10–26). Zeros are the entire difficulty: they force pairing or kill the string.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 113. Coin Change ================= */
const coinChange: ProblemDef = {
  slug: 'coin-change',
  title: 'Coin Change',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/coin-change/',
  technique: 'dp[a] = fewest coins for amount a — each coin offers dp[a − coin] + 1.',
  widget: 'array',
  widgetTitle: 'dp table (amount → fewest coins)',
  inputs: [
    { key: 'coins', label: 'Coins', defaultValue: '1, 3, 4' },
    { key: 'amount', label: 'Amount', defaultValue: '6' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int coinChange(vector<int>& coins, int amount) {'),
      L('        vector<int> dp(amount + 1, INT_MAX);', 'init'),
      L('        dp[0] = 0;', 'init'),
      L('        for (int a = 1; a <= amount; a++) {', 'loop'),
      L('            for (int c : coins) {', 'try'),
      L('                if (a >= c && dp[a - c] != INT_MAX)', 'try'),
      L('                    dp[a] = min(dp[a], dp[a - c] + 1);', 'improve'),
      L('            }'),
      L('        }'),
      L('        return dp[amount] == INT_MAX ? -1 : dp[amount];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int coinChange(int[] coins, int amount) {'),
      L('        int[] dp = new int[amount + 1];', 'init'),
      L('        Arrays.fill(dp, Integer.MAX_VALUE);', 'init'),
      L('        dp[0] = 0;', 'init'),
      L('        for (int a = 1; a <= amount; a++) {', 'loop'),
      L('            for (int c : coins) {', 'try'),
      L('                if (a >= c && dp[a - c] != Integer.MAX_VALUE)', 'try'),
      L('                    dp[a] = Math.min(dp[a], dp[a - c] + 1);', 'improve'),
      L('            }'),
      L('        }'),
      L('        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const coins = parseIntArray(values.coins, { min: 1, maxLen: 5 });
    if (typeof coins === 'string') return { error: coins };
    const amount = parseInt1(values.amount, 'Amount', { min: 1, max: 14 });
    if (typeof amount === 'string') return { error: amount };

    const steps: Step[] = [];
    const dp: (number | string)[] = Array(amount + 1).fill('∞');
    dp[0] = 0;
    const st = (a: number | null, srcs: number[] = []): ArrayState => ({
      arr: dp.map(String),
      ptrs: a !== null ? [{ name: 'a', i: a, c: 'a' }] : [],
      mark: {
        ...(a !== null ? { [a]: 'active' as const } : {}),
        ...Object.fromEntries(srcs.map((x) => [x, 'win'])),
      },
      aggs: [{ label: 'coins', value: coins.join(', '), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['dp[a] = fewest coins summing to a. Amount ', B(0), ' needs ', B(0), ' coins; the rest start ', F('∞'), '.'], state: st(null) });
    for (let a = 1; a <= amount; a++) {
      let best = Infinity;
      const srcs: number[] = [];
      const tried: string[] = [];
      for (const c of coins) {
        if (a >= c && dp[a - c] !== '∞') {
          const cand = (dp[a - c] as number) + 1;
          tried.push(`coin ${c}: dp[${a - c}]+1=${cand}`);
          srcs.push(a - c);
          if (cand < best) best = cand;
        }
      }
      dp[a] = best === Infinity ? '∞' : best;
      steps.push({
        tag: best === Infinity ? 'try' : 'improve',
        trace: best === Infinity
          ? ['Amount ', A(a), ': no coin reaches back to a solvable amount — stays ', F('∞'), '.']
          : ['Amount ', A(a), ': ', A(tried.join(' · ')), ' → dp[', A(a), '] = ', B(best), '.'],
        state: st(a, srcs),
      });
    }
    const result = dp[amount] === '∞' ? -1 : (dp[amount] as number);
    steps.push({
      tag: 'ret',
      trace: result === -1 ? ['Amount ', F(amount), ' is unreachable — return ', C('-1'), '.'] : ['Fewest coins for ', A(amount), ': ', C(result), '.'],
      state: st(amount),
    });
    return { steps, result: String(result) };
  },
  note: 'Greedy (largest coin first) fails on sets like {1,3,4} for 6 — DP works because dp[a] considers *every* coin as the final one, and subproblems (smaller amounts) are already optimal by induction.',
  complexity: { time: 'O(amount · coins)', space: 'O(amount)' },
};

/* ================= 114. Maximum Product Subarray ================= */
const maxProduct: ProblemDef = {
  slug: 'maximum-product-subarray',
  title: 'Maximum Product Subarray',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-product-subarray/',
  technique: 'Track both the max AND min product ending here — a negative flips them.',
  widget: 'array',
  widgetTitle: 'Array & running products',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '2, 3, -2, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProduct(vector<int>& nums) {'),
      L('        int best = nums[0];', 'init'),
      L('        int maxP = nums[0], minP = nums[0];', 'init'),
      L('        for (int i = 1; i < nums.size(); i++) {', 'loop'),
      L('            int x = nums[i];', 'loop'),
      L('            if (x < 0) swap(maxP, minP);', 'swap'),
      L('            maxP = max(x, maxP * x);', 'update'),
      L('            minP = min(x, minP * x);', 'update'),
      L('            best = max(best, maxP);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProduct(int[] nums) {'),
      L('        int best = nums[0];', 'init'),
      L('        int maxP = nums[0], minP = nums[0];', 'init'),
      L('        for (int i = 1; i < nums.length; i++) {', 'loop'),
      L('            int x = nums[i];', 'loop'),
      L('            if (x < 0) { int t = maxP; maxP = minP; minP = t; }', 'swap'),
      L('            maxP = Math.max(x, maxP * x);', 'update'),
      L('            minP = Math.min(x, minP * x);', 'update'),
      L('            best = Math.max(best, maxP);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: -9, max: 9, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    let best = nums[0];
    let maxP = nums[0];
    let minP = nums[0];
    const st = (i: number): ArrayState => ({
      arr: nums,
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'max ending here', value: String(maxP), c: 'b' },
        { label: 'min ending here', value: String(minP), c: 'a' },
        { label: 'best', value: String(best), c: 'c' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Start at ', A(nums[0]), '. Carry the ', B('largest'), ' and the ', A('smallest'), ' product ending at each index — the smallest matters because a negative can flip it into the largest.'], state: st(0) });
    for (let i = 1; i < nums.length; i++) {
      const x = nums[i];
      if (x < 0) {
        [maxP, minP] = [minP, maxP];
        steps.push({ tag: 'swap', trace: [A(x), ' is negative — multiplying flips signs, so swap the running max and min first.'], state: st(i) });
      }
      maxP = Math.max(x, maxP * x);
      minP = Math.min(x, minP * x);
      const improved = maxP > best;
      if (improved) best = maxP;
      steps.push({
        tag: 'update',
        tag2: improved ? 'best' : undefined,
        trace: ['At ', A(x), ': max ending here = ', B(maxP), ', min = ', A(minP), improved ? ' — new best!' : '.'],
        state: st(i),
      });
    }
    steps.push({ tag: 'ret', trace: ['Maximum product subarray: ', C(best), '.'], state: st(nums.length) });
    return { steps, result: String(best) };
  },
  note: 'Unlike sums, products are non-monotonic: a huge negative product is one negative factor away from being the maximum. Carrying the min alongside the max preserves exactly that potential, and "start fresh at x" handles zeros.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 115. Word Break ================= */
const wordBreak: ProblemDef = {
  slug: 'word-break',
  title: 'Word Break',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/word-break/',
  technique: 'dp[i] = "the first i characters are segmentable" — extendable by any dictionary word.',
  widget: 'array',
  widgetTitle: 'Prefix segmentability',
  inputs: [
    { key: 's', label: 'String', defaultValue: 'leetcode' },
    { key: 'dict', label: 'Dictionary', defaultValue: 'leet, code', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool wordBreak(string s, vector<string>& wordDict) {'),
      L('        unordered_set<string> dict(wordDict.begin(), wordDict.end());', 'init'),
      L('        vector<bool> dp(s.size() + 1, false);', 'init'),
      L('        dp[0] = true;', 'init'),
      L('        for (int i = 1; i <= s.size(); i++) {', 'loop'),
      L('            for (int j = 0; j < i; j++) {', 'try'),
      L('                if (dp[j] && dict.count(s.substr(j, i - j))) {', 'try'),
      L('                    dp[i] = true;', 'mark'),
      L('                    break;', 'mark'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return dp[s.size()];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean wordBreak(String s, List<String> wordDict) {'),
      L('        Set<String> dict = new HashSet<>(wordDict);', 'init'),
      L('        boolean[] dp = new boolean[s.length() + 1];', 'init'),
      L('        dp[0] = true;', 'init'),
      L('        for (int i = 1; i <= s.length(); i++) {', 'loop'),
      L('            for (int j = 0; j < i; j++) {', 'try'),
      L('                if (dp[j] && dict.contains(s.substring(j, i))) {', 'try'),
      L('                    dp[i] = true;', 'mark'),
      L('                    break;', 'mark'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return dp[s.length()];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,14}$/.test(s)) return { error: 'String: lowercase, ≤ 14 characters.' };
    const dict = (values.dict ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (dict.length === 0 || dict.length > 8) return { error: 'Dictionary: 1–8 words.' };

    const steps: Step[] = [];
    const dp: boolean[] = Array(s.length + 1).fill(false);
    dp[0] = true;
    const st = (i: number | null, j?: number): ArrayState => ({
      arr: ['ε', ...s.split('')].map((c, k) => `${c}${dp[k] ? '✓' : ''}`),
      ptrs: i !== null ? [{ name: 'i', i, c: 'a' }, ...(j !== undefined ? [{ name: 'j', i: j, c: 'b' as const }] : [])] : [],
      mark: Object.fromEntries(dp.map((v, k) => [k, v ? 'good' : undefined]).filter(([, m]) => m)),
      aggs: [{ label: 'dict', value: dict.join(', '), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['dp[i] asks: can the first i characters be split into dictionary words? The empty prefix (', B('ε'), ') trivially can.'], state: st(null) });
    for (let i = 1; i <= s.length; i++) {
      let found = false;
      for (let j = 0; j < i; j++) {
        const piece = s.slice(j, i);
        if (dp[j] && dict.includes(piece)) {
          dp[i] = true;
          found = true;
          steps.push({
            tag: 'mark',
            trace: ['Prefix of ', A(i), ': prefix of ', B(j), ' is segmentable and "', B(piece), '" is a word → dp[', A(i), '] = ', B('true'), '.'],
            state: st(i, j),
          });
          break;
        }
      }
      if (!found) {
        steps.push({ tag: 'try', trace: ['Prefix of ', A(i), ' ("', F(s.slice(0, i)), '"): no split point works — ', F('false'), '.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const result = dp[s.length];
    steps.push({
      tag: 'ret',
      trace: result ? ['The full string is segmentable — return ', C('true'), '.'] : ['dp[', F(s.length), '] never turned true — return ', C('false'), '.'],
      state: st(null),
    });
    return { steps, result: String(result) };
  },
  note: 'Naive recursion re-tests the same suffixes exponentially many times. The DP flips the direction — "which prefixes are reachable?" — so each prefix is decided once, and only from already-decided shorter prefixes.',
  complexity: { time: 'O(n² · lookup)', space: 'O(n)' },
};

/* ================= 116. Longest Increasing Subsequence ================= */
const lis: ProblemDef = {
  slug: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-increasing-subsequence/',
  technique: 'dp[i] = length of the best increasing subsequence ending exactly at i.',
  widget: 'array',
  widgetTitle: 'Values & LIS lengths',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '10, 9, 2, 5, 3, 7, 101, 18', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int lengthOfLIS(vector<int>& nums) {'),
      L('        vector<int> dp(nums.size(), 1);', 'init'),
      L('        int best = 1;', 'init'),
      L('        for (int i = 1; i < nums.size(); i++) {', 'loop'),
      L('            for (int j = 0; j < i; j++) {', 'scan'),
      L('                if (nums[j] < nums[i])', 'scan'),
      L('                    dp[i] = max(dp[i], dp[j] + 1);', 'extend'),
      L('            }'),
      L('            best = max(best, dp[i]);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int lengthOfLIS(int[] nums) {'),
      L('        int[] dp = new int[nums.length];', 'init'),
      L('        Arrays.fill(dp, 1);', 'init'),
      L('        int best = 1;', 'init'),
      L('        for (int i = 1; i < nums.length; i++) {', 'loop'),
      L('            for (int j = 0; j < i; j++) {', 'scan'),
      L('                if (nums[j] < nums[i])', 'scan'),
      L('                    dp[i] = Math.max(dp[i], dp[j] + 1);', 'extend'),
      L('            }'),
      L('            best = Math.max(best, dp[i]);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    const dp = Array(nums.length).fill(1);
    let best = 1;
    const st = (i: number | null, srcs: number[] = []): ArrayState => ({
      arr: nums.map((v, k) => `${v}｜${dp[k]}`),
      ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
      mark: {
        ...(i !== null ? { [i]: 'active' as const } : {}),
        ...Object.fromEntries(srcs.map((j) => [j, 'win'])),
      },
      aggs: [{ label: 'best LIS', value: String(best), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Each box shows ', A('value｜LIS length ending here'), '. Alone, every element is a subsequence of length ', B(1), '.'], state: st(null) });
    for (let i = 1; i < nums.length; i++) {
      const srcs: number[] = [];
      let from = -1;
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          from = j;
        }
        if (nums[j] < nums[i]) srcs.push(j);
      }
      if (dp[i] > best) best = dp[i];
      steps.push({
        tag: from === -1 ? 'scan' : 'extend',
        tag2: dp[i] === best ? 'best' : undefined,
        trace: from === -1
          ? ['nums[', A(i), '] = ', A(nums[i]), ': nothing before it is smaller — its LIS stays ', A(1), '.']
          : ['nums[', A(i), '] = ', A(nums[i]), ': best smaller predecessor is ', B(nums[from]), ' (LIS ', B(dp[from]), ') → dp[', A(i), '] = ', B(dp[i]), '.'],
        state: st(i, srcs),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Longest increasing subsequence length: ', C(best), '.'], state: st(null) });
    return { steps, result: String(best) };
  },
  note: '"Ending exactly at i" is the crucial framing — it makes subproblems composable: any smaller value before i can hand over its chain. (The O(n log n) patience-sorting variant exists, but this O(n²) table is the one to understand first.)',
  complexity: { time: 'O(n²)', space: 'O(n)' },
};

/* ================= 125. Perfect Squares ================= */
const perfectSquares: ProblemDef = {
  slug: 'perfect-squares',
  title: 'Perfect Squares',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/perfect-squares/',
  technique: 'Coin Change where the coins are 1, 4, 9, 16, … — fewest squares summing to n.',
  widget: 'array',
  widgetTitle: 'dp table (n → fewest squares)',
  inputs: [{ key: 'n', label: 'n', defaultValue: '12' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numSquares(int n) {'),
      L('        vector<int> dp(n + 1, INT_MAX);', 'init'),
      L('        dp[0] = 0;', 'init'),
      L('        for (int a = 1; a <= n; a++) {', 'loop'),
      L('            for (int s = 1; s * s <= a; s++)', 'try'),
      L('                dp[a] = min(dp[a], dp[a - s * s] + 1);', 'improve'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numSquares(int n) {'),
      L('        int[] dp = new int[n + 1];', 'init'),
      L('        Arrays.fill(dp, Integer.MAX_VALUE);', 'init'),
      L('        dp[0] = 0;', 'init'),
      L('        for (int a = 1; a <= n; a++) {', 'loop'),
      L('            for (int s = 1; s * s <= a; s++)', 'try'),
      L('                dp[a] = Math.min(dp[a], dp[a - s * s] + 1);', 'improve'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 14 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    const dp: number[] = Array(n + 1).fill(Infinity);
    dp[0] = 0;
    const st = (a: number | null, srcs: number[] = []): ArrayState => ({
      arr: dp.map((v) => (v === Infinity ? '∞' : v)),
      ptrs: a !== null ? [{ name: 'a', i: a, c: 'a' }] : [],
      mark: {
        ...(a !== null ? { [a]: 'active' as const } : {}),
        ...Object.fromEntries(srcs.map((x) => [x, 'win'])),
      },
    });
    steps.push({ tag: 'init', trace: ['The "coins" are the squares ≤ n: ', A([...Array(Math.floor(Math.sqrt(n)))].map((_, i) => (i + 1) ** 2).join(', ')), '. dp[0] = 0.'], state: st(null) });
    for (let a = 1; a <= n; a++) {
      const tried: string[] = [];
      const srcs: number[] = [];
      for (let s2 = 1; s2 * s2 <= a; s2++) {
        const cand = dp[a - s2 * s2] + 1;
        tried.push(`${s2}²→dp[${a - s2 * s2}]+1=${cand}`);
        srcs.push(a - s2 * s2);
        if (cand < dp[a]) dp[a] = cand;
      }
      steps.push({
        tag: 'improve',
        trace: ['n = ', A(a), ': ', A(tried.join(' · ')), ' → ', B(dp[a]), ' square(s).'],
        state: st(a, srcs),
      });
    }
    steps.push({ tag: 'ret', trace: ['Fewest perfect squares summing to ', A(n), ': ', C(dp[n]), '.'], state: st(n) });
    return { steps, result: String(dp[n]) };
  },
  note: 'Recognizing the reduction is the entire problem: "fewest squares" is Coin Change with the square numbers as denominations. (Lagrange\'s four-square theorem guarantees the answer is at most 4 — the DP finds which of 1–4 it is.)',
  complexity: { time: 'O(n · √n)', space: 'O(n)' },
};

/* ================= 120. Best Time to Buy and Sell Stock with Cooldown ================= */
const stockCooldown: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock-with-cooldown',
  title: 'Best Time to Buy and Sell Stock with Cooldown',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/',
  technique: 'A three-state machine per day: holding, just sold (cooldown), or resting.',
  widget: 'array',
  widgetTitle: 'Prices & state values',
  inputs: [{ key: 'prices', label: 'Prices', defaultValue: '1, 2, 3, 0, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(vector<int>& prices) {'),
      L('        int hold = -prices[0], sold = 0, rest = 0;', 'init'),
      L('        for (int i = 1; i < prices.size(); i++) {', 'loop'),
      L('            int prevHold = hold, prevSold = sold, prevRest = rest;', 'loop'),
      L('            hold = max(prevHold, prevRest - prices[i]);', 'hold'),
      L('            sold = prevHold + prices[i];', 'sell'),
      L('            rest = max(prevRest, prevSold);', 'rest'),
      L('        }'),
      L('        return max(sold, rest);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int[] prices) {'),
      L('        int hold = -prices[0], sold = 0, rest = 0;', 'init'),
      L('        for (int i = 1; i < prices.length; i++) {', 'loop'),
      L('            int prevHold = hold, prevSold = sold, prevRest = rest;', 'loop'),
      L('            hold = Math.max(prevHold, prevRest - prices[i]);', 'hold'),
      L('            sold = prevHold + prices[i];', 'sell'),
      L('            rest = Math.max(prevRest, prevSold);', 'rest'),
      L('        }'),
      L('        return Math.max(sold, rest);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const prices = parseIntArray(values.prices, { min: 0, maxLen: 12 });
    if (typeof prices === 'string') return { error: prices };
    if (prices.length < 2) return { error: 'Need at least two prices.' };
    const steps: Step[] = [];
    let hold = -prices[0];
    let sold = 0;
    let rest = 0;
    const st = (i: number): ArrayState => ({
      arr: prices,
      bars: true,
      ptrs: i < prices.length ? [{ name: 'day', i, c: 'a' }] : [],
      aggs: [
        { label: 'holding', value: String(hold), c: 'a' },
        { label: 'just sold', value: String(sold), c: 'b' },
        { label: 'resting', value: String(rest), c: 'c' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Day 0: buying puts us at ', A(-prices[0]), ' (holding); doing nothing is 0. "Just sold" forces tomorrow off — that is the cooldown.'], state: st(0) });
    for (let i = 1; i < prices.length; i++) {
      const pH = hold;
      const pS = sold;
      const pR = rest;
      hold = Math.max(pH, pR - prices[i]);
      sold = pH + prices[i];
      rest = Math.max(pR, pS);
      steps.push({
        tag: 'hold',
        tag2: 'sell',
        trace: [
          'Day ', A(i), ' ($', A(prices[i]), '): holding = max(keep ', A(pH), ', buy after rest ', A(pR - prices[i]), ') = ', B(hold),
          '; selling the held stock = ', B(sold), '; resting = ', B(rest), '.',
        ],
        state: st(i),
      });
    }
    const result = Math.max(sold, rest);
    steps.push({ tag: 'ret', trace: ['End without stock in hand: max(just sold, resting) = ', C(result), '.'], state: st(prices.length) });
    return { steps, result: String(result) };
  },
  note: 'The cooldown makes "did I sell yesterday?" part of the state — so one profit number per day isn\'t enough. Three states cover every legal history, and the transitions encode the rules: buying is only allowed from "resting".',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

export const dp1 = [climbingStairs, houseRobber, houseRobberII, decodeWays, coinChange, maxProduct, wordBreak, lis, perfectSquares, stockCooldown];
