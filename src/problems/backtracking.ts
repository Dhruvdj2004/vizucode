// Backtracking.
import type { MatrixState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';
import { parseGrid } from './arraysHashing2';

const MAX_STEPS = 320;

/** Shared "current partial solution + results" view for build/undo backtracking. */
function buildView(cur: (string | number)[], results: string[], aggs?: StackState['aggs']): StackState {
  return {
    stack: cur.map((v) => ({ v })),
    stackLabel: 'Current build',
    stack2: results.map((v) => ({ v, c: 'c' as const })),
    stack2Label: 'Results',
    aggs,
  };
}

/* ================= 85. Subsets ================= */
const subsets: ProblemDef = {
  slug: 'subsets',
  title: 'Subsets',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/subsets/',
  technique: 'Every element faces one binary choice: in or out — the recursion tree enumerates all 2ⁿ leaves.',
  widget: 'stack',
  widgetTitle: 'Current subset & results',
  inputs: [{ key: 'nums', label: 'Array (distinct)', defaultValue: '1, 2, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> subsets(vector<int>& nums) {'),
      L('        vector<vector<int>> res;', 'init'),
      L('        vector<int> cur;', 'init'),
      L('        backtrack(nums, 0, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& nums, int i, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        res.push_back(cur);', 'record'),
      L('        for (int j = i; j < nums.size(); j++) {', 'loop'),
      L('            cur.push_back(nums[j]);', 'choose'),
      L('            backtrack(nums, j + 1, cur, res);', 'rec'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> subsets(int[] nums) {'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
      L('        backtrack(nums, 0, new ArrayList<>(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] nums, int i, List<Integer> cur, List<List<Integer>> res) {'),
      L('        res.add(new ArrayList<>(cur));', 'record'),
      L('        for (int j = i; j < nums.length; j++) {', 'loop'),
      L('            cur.add(nums[j]);', 'choose'),
      L('            backtrack(nums, j + 1, cur, res);', 'rec'),
      L('            cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 4 });
    if (typeof nums === 'string') return { error: nums };
    if (new Set(nums).size !== nums.length) return { error: 'Values must be distinct.' };

    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const fmt = () => `[${cur.join(',')}]`;
    steps.push({ tag: 'init', trace: ['Walk the decision tree: at index i, either take nums[i] or skip it. Every node of the tree is itself a subset.'], state: buildView(cur, res) });
    const backtrack = (i: number) => {
      if (steps.length > MAX_STEPS) return;
      res.push(fmt());
      steps.push({ tag: 'record', trace: ['Record the current build ', C(fmt()), ' — every partial build is a valid subset.'], state: buildView(cur, res) });
      for (let j = i; j < nums.length; j++) {
        cur.push(nums[j]);
        steps.push({ tag: 'choose', trace: ['Choose ', A(nums[j]), ' → ', A(fmt()), '.'], state: buildView(cur, res) });
        backtrack(j + 1);
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: drop ', F(nums[j]), ' → ', A(fmt()), '.'], state: buildView(cur, res) });
      }
    };
    backtrack(0);
    steps.push({ tag: 'retall', trace: ['All ', C(res.length), ' subsets enumerated (2^', A(nums.length), ').'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} subsets` };
  },
  note: 'Recording at every node (not just the leaves) is what makes this elegant: each recursive call *is* a subset, and starting the loop at index i keeps every subset in ascending index order — no duplicates possible.',
  complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)' },
  brute: {
    label: 'Bitmask',
    technique: 'Count from 0 to 2ⁿ − 1; bit j of the counter says whether nums[j] is in the subset.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> subsets(vector<int>& nums) {'),
        L('        int n = nums.size();', 'init'),
        L('        vector<vector<int>> res;', 'init'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'mask'),
        L('            vector<int> cur;', 'mask'),
        L('            for (int j = 0; j < n; j++)', 'mask'),
        L('                if (mask & (1 << j)) cur.push_back(nums[j]);', 'mask'),
        L('            res.push_back(cur);', 'mask'),
        L('        }'),
        L('        return res;', 'retall'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> subsets(int[] nums) {'),
        L('        int n = nums.length;', 'init'),
        L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'mask'),
        L('            List<Integer> cur = new ArrayList<>();', 'mask'),
        L('            for (int j = 0; j < n; j++)', 'mask'),
        L('                if ((mask & (1 << j)) != 0) cur.add(nums[j]);', 'mask'),
        L('            res.add(cur);', 'mask'),
        L('        }'),
        L('        return res;', 'retall'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 4 });
      if (typeof nums === 'string') return { error: nums };
      if (new Set(nums).size !== nums.length) return { error: 'Values must be distinct.' };
      const n = nums.length;
      const steps: Step[] = [];
      const res: string[] = [];
      steps.push({
        tag: 'init',
        trace: ['No recursion: the ', A(2 ** n), ' subsets correspond one-to-one with the ', A(`${n}-bit`), ' numbers 0 … ', A(2 ** n - 1), '.'],
        state: buildView([], res),
      });
      for (let mask = 0; mask < 1 << n; mask++) {
        const cur = nums.filter((_, j) => mask & (1 << j));
        res.push(`[${cur.join(',')}]`);
        const bits = mask.toString(2).padStart(n, '0');
        steps.push({
          tag: 'mask',
          trace: ['mask = ', A(bits), ' → take the elements whose bit is 1: ', C(`[${cur.join(',')}]`), '.'],
          state: buildView(cur, res, [{ label: 'mask', value: bits, c: 'a' }]),
        });
      }
      steps.push({ tag: 'retall', trace: ['All ', C(res.length), ' subsets enumerated.'], state: buildView([], res) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} subsets` };
    },
    note: 'Same O(n · 2ⁿ) work as backtracking, but iterative and trivially parallel: each mask is independent. It only scales to n ≈ 30 because the mask must fit in an integer, which is fine here since 2ⁿ outputs would be too many anyway.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)' },
  },
};

/* ================= 86. Subsets II ================= */
const subsetsII: ProblemDef = {
  slug: 'subsets-ii',
  title: 'Subsets II',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/subsets-ii/',
  technique: 'Sort first, then skip a value at any tree level where it already led a branch.',
  widget: 'stack',
  widgetTitle: 'Current subset & results',
  inputs: [{ key: 'nums', label: 'Array (may repeat)', defaultValue: '1, 2, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> subsetsWithDup(vector<int>& nums) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        vector<vector<int>> res;', 'sort'),
      L('        vector<int> cur;', 'sort'),
      L('        backtrack(nums, 0, cur, res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& nums, int i, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        res.push_back(cur);', 'record'),
      L('        for (int j = i; j < nums.size(); j++) {', 'loop'),
      L('            if (j > i && nums[j] == nums[j - 1]) continue;', 'skip'),
      L('            cur.push_back(nums[j]);', 'choose'),
      L('            backtrack(nums, j + 1, cur, res);', 'rec'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> subsetsWithDup(int[] nums) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'sort'),
      L('        backtrack(nums, 0, new ArrayList<>(), res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] nums, int i, List<Integer> cur, List<List<Integer>> res) {'),
      L('        res.add(new ArrayList<>(cur));', 'record'),
      L('        for (int j = i; j < nums.length; j++) {', 'loop'),
      L('            if (j > i && nums[j] == nums[j - 1]) continue;', 'skip'),
      L('            cur.add(nums[j]);', 'choose'),
      L('            backtrack(nums, j + 1, cur, res);', 'rec'),
      L('            cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums, { maxLen: 4 });
    if (typeof input === 'string') return { error: input };
    const nums = [...input].sort((a, b) => a - b);
    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const fmt = () => `[${cur.join(',')}]`;
    steps.push({ tag: 'sort', trace: ['Sort so duplicates are adjacent: ', A(`[${nums.join(', ')}]`), ' — now "same value at the same level" is detectable in O(1).'], state: buildView(cur, res) });
    const backtrack = (i: number) => {
      if (steps.length > MAX_STEPS) return;
      res.push(fmt());
      steps.push({ tag: 'record', trace: ['Record ', C(fmt()), '.'], state: buildView(cur, res) });
      for (let j = i; j < nums.length; j++) {
        if (j > i && nums[j] === nums[j - 1]) {
          steps.push({ tag: 'skip', trace: [F(nums[j]), ' already led a branch at this level — starting another would duplicate an entire subtree. Skip.'], state: buildView(cur, res) });
          continue;
        }
        cur.push(nums[j]);
        steps.push({ tag: 'choose', trace: ['Choose ', A(nums[j]), ' → ', A(fmt()), '.'], state: buildView(cur, res) });
        backtrack(j + 1);
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: drop ', F(nums[j]), '.'], state: buildView(cur, res) });
      }
    };
    backtrack(0);
    steps.push({ tag: 'retall', trace: ['Done — ', C(res.length), ' unique subsets.'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique subsets` };
  },
  note: 'The guard j > i (not j > 0) is the whole subtlety: consecutive equal values may stack *within* one branch (take both 2s), but must not each *start* a sibling branch — that is exactly what produces duplicate subsets.',
  complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)' },
  brute: {
    label: 'Generate & dedupe',
    technique: 'Generate all 2ⁿ subsets of the sorted array and keep only the ones not seen before.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> subsetsWithDup(vector<int>& nums) {'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        set<vector<int>> seen;', 'sort'),
        L('        int n = nums.size();', 'sort'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'new', 'dup'),
        L('            vector<int> cur;', 'new', 'dup'),
        L('            for (int j = 0; j < n; j++)', 'new', 'dup'),
        L('                if (mask & (1 << j)) cur.push_back(nums[j]);', 'new', 'dup'),
        L('            seen.insert(cur);', 'new', 'dup'),
        L('        }'),
        L('        return vector<vector<int>>(seen.begin(), seen.end());', 'retall'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> subsetsWithDup(int[] nums) {'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        Set<List<Integer>> seen = new LinkedHashSet<>();', 'sort'),
        L('        int n = nums.length;', 'sort'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'new', 'dup'),
        L('            List<Integer> cur = new ArrayList<>();', 'new', 'dup'),
        L('            for (int j = 0; j < n; j++)', 'new', 'dup'),
        L('                if ((mask & (1 << j)) != 0) cur.add(nums[j]);', 'new', 'dup'),
        L('            seen.add(cur);', 'new', 'dup'),
        L('        }'),
        L('        return new ArrayList<>(seen);', 'retall'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums, { maxLen: 4 });
      if (typeof input === 'string') return { error: input };
      const nums = [...input].sort((a, b) => a - b);
      const n = nums.length;
      const steps: Step[] = [];
      const res: string[] = [];
      steps.push({ tag: 'sort', trace: ['Sort: ', A(`[${nums.join(', ')}]`), '. Sorting makes equal subsets come out identical, so a set can spot them.'], state: buildView([], res) });
      let dups = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        const cur = nums.filter((_, j) => mask & (1 << j));
        const key = `[${cur.join(',')}]`;
        const bits = mask.toString(2).padStart(n, '0');
        if (res.includes(key)) {
          dups++;
          steps.push({ tag: 'dup', trace: ['mask ', A(bits), ' → ', F(key), ' — already generated, throw it away.'], state: buildView(cur, res, [{ label: 'duplicates dropped', value: String(dups), c: 'a' }]) });
        } else {
          res.push(key);
          steps.push({ tag: 'new', trace: ['mask ', A(bits), ' → ', C(key), ' — new, keep it.'], state: buildView(cur, res, [{ label: 'duplicates dropped', value: String(dups), c: 'a' }]) });
        }
      }
      steps.push({ tag: 'retall', trace: [C(res.length), ' unique subsets, after generating ', A(2 ** n), ' and discarding ', F(dups), '.'], state: buildView([], res) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique subsets` };
    },
    note: 'Generating duplicates and filtering them afterwards always does the full 2ⁿ work, plus the cost of hashing each subset. Skipping a repeated value at the same recursion level never creates the duplicates in the first place.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n · 2ⁿ)' },
  },
};

/* ================= 87. Combination Sum ================= */
const combinationSum: ProblemDef = {
  slug: 'combination-sum',
  title: 'Combination Sum',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/combination-sum/',
  technique: 'DFS where a candidate may be reused — recursing with the same index, not the next.',
  widget: 'stack',
  widgetTitle: 'Current combination & results',
  inputs: [
    { key: 'candidates', label: 'Candidates', defaultValue: '2, 3, 6, 7', wide: true },
    { key: 'target', label: 'Target', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {'),
      L('        vector<vector<int>> res;', 'init'),
      L('        vector<int> cur;', 'init'),
      L('        backtrack(candidates, 0, target, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& cand, int i, int remain, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        if (remain == 0) {', 'hit'),
      L('            res.push_back(cur);', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        if (remain < 0) return;', 'prune'),
      L('        for (int j = i; j < cand.size(); j++) {', 'loop'),
      L('            cur.push_back(cand[j]);', 'choose'),
      L('            backtrack(cand, j, remain - cand[j], cur, res);', 'rec'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> combinationSum(int[] candidates, int target) {'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
      L('        backtrack(candidates, 0, target, new ArrayList<>(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] cand, int i, int remain, List<Integer> cur, List<List<Integer>> res) {'),
      L('        if (remain == 0) {', 'hit'),
      L('            res.add(new ArrayList<>(cur));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        if (remain < 0) return;', 'prune'),
      L('        for (int j = i; j < cand.length; j++) {', 'loop'),
      L('            cur.add(cand[j]);', 'choose'),
      L('            backtrack(cand, j, remain - cand[j], cur, res);', 'rec'),
      L('            cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const cand = parseIntArray(values.candidates, { min: 1, maxLen: 5 });
    if (typeof cand === 'string') return { error: cand };
    const target = parseInt1(values.target, 'Target', { min: 1, max: 20 });
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const fmt = () => `[${cur.join(',')}]`;
    const aggs = (remain: number) => [{ label: 'remaining', value: String(remain), c: remain === 0 ? ('b' as const) : ('a' as const) }];
    steps.push({ tag: 'init', trace: ['Subtract chosen candidates from the target; hitting exactly ', B(0), ' records a combination. Reuse is allowed.'], state: buildView(cur, res, aggs(target)) });
    const backtrack = (i: number, remain: number) => {
      if (steps.length > MAX_STEPS) return;
      if (remain === 0) {
        res.push(fmt());
        steps.push({ tag: 'hit', trace: ['Remaining hit ', B(0), ' — ', C(fmt()), ' is a valid combination!'], state: buildView(cur, res, aggs(0)) });
        return;
      }
      if (remain < 0) {
        steps.push({ tag: 'prune', trace: ['Overshot (remaining ', F(remain), ') — dead end, backtrack.'], state: buildView(cur, res, aggs(remain)) });
        return;
      }
      for (let j = i; j < cand.length; j++) {
        cur.push(cand[j]);
        steps.push({ tag: 'choose', trace: ['Choose ', A(cand[j]), ' (again allowed) → ', A(fmt()), ', remaining ', A(remain - cand[j]), '.'], state: buildView(cur, res, aggs(remain - cand[j])) });
        backtrack(j, remain - cand[j]);
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: drop ', F(cand[j]), '.'], state: buildView(cur, res, aggs(remain)) });
      }
    };
    backtrack(0, target);
    steps.push({ tag: 'retall', trace: ['Search space exhausted — ', C(res.length), ' combination(s) sum to ', C(target), '.'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} combinations` };
  },
  note: 'Recursing with j (not j+1) permits unlimited reuse of a candidate, while still never looking *backward* — that forward-only discipline is what prevents [2,3] and [3,2] from both appearing.',
  complexity: { time: 'O(k^(target/min))', space: 'O(target/min)' },
  brute: {
    label: 'DP table',
    technique: 'Build the combinations for every sum 0 … target, looping candidates outermost so each combination is built in one order only.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {'),
        L('        vector<vector<vector<int>>> dp(target + 1);', 'init'),
        L('        dp[0] = {{}};', 'init'),
        L('        for (int c : candidates)', 'cand'),
        L('            for (int s = c; s <= target; s++)', 'extend'),
        L('                for (auto comb : dp[s - c]) {', 'extend'),
        L('                    comb.push_back(c);', 'extend'),
        L('                    dp[s].push_back(comb);', 'extend'),
        L('                }'),
        L('        return dp[target];', 'retall'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> combinationSum(int[] candidates, int target) {'),
        L('        List<List<List<Integer>>> dp = new ArrayList<>();', 'init'),
        L('        for (int s = 0; s <= target; s++) dp.add(new ArrayList<>());', 'init'),
        L('        dp.get(0).add(new ArrayList<>());', 'init'),
        L('        for (int c : candidates)', 'cand'),
        L('            for (int s = c; s <= target; s++)', 'extend'),
        L('                for (List<Integer> comb : dp.get(s - c)) {', 'extend'),
        L('                    List<Integer> next = new ArrayList<>(comb);', 'extend'),
        L('                    next.add(c);', 'extend'),
        L('                    dp.get(s).add(next);', 'extend'),
        L('                }'),
        L('        return dp.get(target);', 'retall'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const cand = parseIntArray(values.candidates, { min: 1, maxLen: 5 });
      if (typeof cand === 'string') return { error: cand };
      const target = parseInt1(values.target, 'Target', { min: 1, max: 20 });
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const dp: number[][][] = Array.from({ length: target + 1 }, () => []);
      dp[0] = [[]];
      const results = () => dp[target].map((c) => `[${c.join(',')}]`);
      const table = () =>
        dp
          .map((l, s) => (l.length ? `${s}:${l.length}` : ''))
          .filter(Boolean)
          .join(' ');
      steps.push({ tag: 'init', trace: ['dp[s] holds every combination summing to s. Start with dp[0] = ', B('[ [] ]'), ' — the empty combination.'], state: buildView([], results(), [{ label: 'dp sizes', value: table(), c: 'a' }]) });
      for (const c of cand) {
        steps.push({ tag: 'cand', trace: ['Now allow candidate ', A(c), ' (any number of times).'], state: buildView([c], results(), [{ label: 'dp sizes', value: table(), c: 'a' }]) });
        for (let s = c; s <= target; s++) {
          if (!dp[s - c].length) continue;
          const added = dp[s - c].map((comb) => [...comb, c]);
          dp[s].push(...added);
          steps.push({
            tag: 'extend',
            trace: ['Every combination for ', A(s - c), ' plus ', A(c), ' sums to ', B(s), ': adds ', B(added.map((a) => `[${a.join(',')}]`).join(' ')), '.'],
            state: buildView(added[added.length - 1], results(), [{ label: 'dp sizes', value: table(), c: 'a' }]),
          });
        }
      }
      steps.push({ tag: 'retall', trace: ['dp[', A(target), '] holds ', C(dp[target].length), ' combination(s).'], state: buildView([], results()) });
      return { steps, result: `[${results().join(', ')}]`, resultDetail: `${dp[target].length} combinations` };
    },
    note: 'Looping candidates on the outside means a combination can only grow in candidate order, so [2,3] and [3,2] are never both built. It stores combinations for every smaller sum too, trading memory for no recursion.',
    complexity: { time: 'O(target · k · #combos)', space: 'O(target · #combos)' },
  },
};

/* ================= 88. Combination Sum II ================= */
const combinationSumII: ProblemDef = {
  slug: 'combination-sum-ii',
  title: 'Combination Sum II',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/combination-sum-ii/',
  technique: 'Sort + level-skip duplicates, and each candidate is used at most once.',
  widget: 'stack',
  widgetTitle: 'Current combination & results',
  inputs: [
    { key: 'candidates', label: 'Candidates', defaultValue: '10, 1, 2, 7, 6, 1, 5', wide: true },
    { key: 'target', label: 'Target', defaultValue: '8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {'),
      L('        sort(candidates.begin(), candidates.end());', 'sort'),
      L('        vector<vector<int>> res;', 'sort'),
      L('        vector<int> cur;', 'sort'),
      L('        backtrack(candidates, 0, target, cur, res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& cand, int i, int remain, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        if (remain == 0) { res.push_back(cur); return; }', 'hit'),
      L('        for (int j = i; j < cand.size(); j++) {', 'loop'),
      L('            if (j > i && cand[j] == cand[j - 1]) continue;', 'skip'),
      L('            if (cand[j] > remain) break;', 'prune'),
      L('            cur.push_back(cand[j]);', 'choose'),
      L('            backtrack(cand, j + 1, remain - cand[j], cur, res);', 'rec'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> combinationSum2(int[] candidates, int target) {'),
      L('        Arrays.sort(candidates);', 'sort'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'sort'),
      L('        backtrack(candidates, 0, target, new ArrayList<>(), res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] cand, int i, int remain, List<Integer> cur, List<List<Integer>> res) {'),
      L('        if (remain == 0) { res.add(new ArrayList<>(cur)); return; }', 'hit'),
      L('        for (int j = i; j < cand.length; j++) {', 'loop'),
      L('            if (j > i && cand[j] == cand[j - 1]) continue;', 'skip'),
      L('            if (cand[j] > remain) break;', 'prune'),
      L('            cur.add(cand[j]);', 'choose'),
      L('            backtrack(cand, j + 1, remain - cand[j], cur, res);', 'rec'),
      L('            cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.candidates, { min: 1, maxLen: 8 });
    if (typeof input === 'string') return { error: input };
    const cand = [...input].sort((a, b) => a - b);
    const target = parseInt1(values.target, 'Target', { min: 1, max: 30 });
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const fmt = () => `[${cur.join(',')}]`;
    const aggs = (remain: number) => [{ label: 'remaining', value: String(remain), c: remain === 0 ? ('b' as const) : ('a' as const) }];
    steps.push({ tag: 'sort', trace: ['Sorted candidates: ', A(`[${cand.join(', ')}]`), '. Each may be used once; duplicate values must not spawn duplicate branches.'], state: buildView(cur, res, aggs(target)) });
    const backtrack = (i: number, remain: number) => {
      if (steps.length > MAX_STEPS) return;
      if (remain === 0) {
        res.push(fmt());
        steps.push({ tag: 'hit', trace: ['Exact hit — record ', C(fmt()), '.'], state: buildView(cur, res, aggs(0)) });
        return;
      }
      for (let j = i; j < cand.length; j++) {
        if (j > i && cand[j] === cand[j - 1]) {
          steps.push({ tag: 'skip', trace: ['Sibling duplicate ', F(cand[j]), ' — skip to avoid repeating a whole subtree.'], state: buildView(cur, res, aggs(remain)) });
          continue;
        }
        if (cand[j] > remain) {
          steps.push({ tag: 'prune', trace: [F(cand[j]), ' > remaining ', A(remain), ' — and the list is sorted, so everything after is too big. Break.'], state: buildView(cur, res, aggs(remain)) });
          break;
        }
        cur.push(cand[j]);
        steps.push({ tag: 'choose', trace: ['Choose ', A(cand[j]), ' → remaining ', A(remain - cand[j]), '.'], state: buildView(cur, res, aggs(remain - cand[j])) });
        backtrack(j + 1, remain - cand[j]);
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: drop ', F(cand[j]), '.'], state: buildView(cur, res, aggs(remain)) });
      }
    };
    backtrack(0, target);
    steps.push({ tag: 'retall', trace: [C(res.length), ' unique combination(s) reach ', C(target), '.'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique combinations` };
  },
  note: 'Sorting buys two things at once: the sibling-duplicate skip (uniqueness) and the early break when a candidate exceeds the remainder (pruning) — both impossible on unsorted input.',
  complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
  brute: {
    label: 'All subsets',
    technique: 'Try every subset of the sorted candidates; keep those that sum to the target, skipping repeats.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {'),
        L('        sort(candidates.begin(), candidates.end());', 'sort'),
        L('        set<vector<int>> found;', 'sort'),
        L('        int n = candidates.size();', 'sort'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'try'),
        L('            vector<int> cur; int sum = 0;', 'try'),
        L('            for (int j = 0; j < n; j++)', 'try'),
        L('                if (mask & (1 << j)) { cur.push_back(candidates[j]); sum += candidates[j]; }', 'try'),
        L('            if (sum == target) found.insert(cur);', 'hit', 'dup'),
        L('        }'),
        L('        return vector<vector<int>>(found.begin(), found.end());', 'retall'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> combinationSum2(int[] candidates, int target) {'),
        L('        Arrays.sort(candidates);', 'sort'),
        L('        Set<List<Integer>> found = new LinkedHashSet<>();', 'sort'),
        L('        int n = candidates.length;', 'sort'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'try'),
        L('            List<Integer> cur = new ArrayList<>(); int sum = 0;', 'try'),
        L('            for (int j = 0; j < n; j++)', 'try'),
        L('                if ((mask & (1 << j)) != 0) { cur.add(candidates[j]); sum += candidates[j]; }', 'try'),
        L('            if (sum == target) found.add(cur);', 'hit', 'dup'),
        L('        }'),
        L('        return new ArrayList<>(found);', 'retall'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.candidates, { min: 1, maxLen: 8 });
      if (typeof input === 'string') return { error: input };
      const cand = [...input].sort((a, b) => a - b);
      const target = parseInt1(values.target, 'Target', { min: 1, max: 30 });
      if (typeof target === 'string') return { error: target };
      const n = cand.length;
      const steps: Step[] = [];
      const hits: number[][] = [];
      const keys = new Set<string>();
      steps.push({ tag: 'sort', trace: ['Sorted: ', A(`[${cand.join(', ')}]`), '. Test all ', A(2 ** n), ' subsets by brute force.'], state: buildView([], []) });
      let shown = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        const cur = cand.filter((_, j) => mask & (1 << j));
        const sum = cur.reduce((a, b) => a + b, 0);
        const key = `[${cur.join(',')}]`;
        const view = () => buildView(cur, [...keys], [{ label: 'subsets tried', value: `${mask + 1} / ${2 ** n}`, c: 'a' }, { label: 'sum', value: String(sum), c: sum === target ? 'b' : 'a' }]);
        if (sum === target) {
          if (keys.has(key)) {
            steps.push({ tag: 'dup', trace: [F(key), ' sums to ', A(target), ' but was already found using the other copy of a repeated value.'], state: view() });
          } else {
            keys.add(key);
            hits.push(cur);
            steps.push({ tag: 'hit', trace: [C(key), ' sums to ', C(target), ' — record it.'], state: view() });
          }
        } else if (shown < 12) {
          shown++;
          steps.push({ tag: 'try', trace: ['Subset ', A(key), ' sums to ', F(sum), ' — no.'], state: view() });
        }
      }
      const res = hits.map((h) => `[${h.join(',')}]`).sort();
      steps.push({ tag: 'retall', trace: ['Tried all ', A(2 ** n), ' subsets: ', C(res.length), ' unique combination(s).'], state: buildView([], res) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique combinations` };
    },
    note: 'Always 2ⁿ subsets regardless of the target, and duplicates must be filtered out afterwards. Backtracking on sorted input prunes the moment a candidate exceeds what remains, and skips repeated values at the branch.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n · 2ⁿ)' },
  },
};

/* ================= 89. Permutations ================= */
const permutations: ProblemDef = {
  slug: 'permutations',
  title: 'Permutations',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/permutations/',
  technique: 'At each slot, try every unused element; undo and try the next.',
  widget: 'stack',
  widgetTitle: 'Current permutation & results',
  inputs: [{ key: 'nums', label: 'Array (distinct)', defaultValue: '1, 2, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> permute(vector<int>& nums) {'),
      L('        vector<vector<int>> res;', 'init'),
      L('        vector<int> cur;', 'init'),
      L('        vector<bool> used(nums.size(), false);', 'init'),
      L('        backtrack(nums, used, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        if (cur.size() == nums.size()) {', 'hit'),
      L('            res.push_back(cur);', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int j = 0; j < nums.size(); j++) {', 'loop'),
      L('            if (used[j]) continue;', 'used'),
      L('            used[j] = true; cur.push_back(nums[j]);', 'choose'),
      L('            backtrack(nums, used, cur, res);', 'rec'),
      L('            used[j] = false; cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> permute(int[] nums) {'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
      L('        backtrack(nums, new boolean[nums.length], new ArrayList<>(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> res) {'),
      L('        if (cur.size() == nums.length) {', 'hit'),
      L('            res.add(new ArrayList<>(cur));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int j = 0; j < nums.length; j++) {', 'loop'),
      L('            if (used[j]) continue;', 'used'),
      L('            used[j] = true; cur.add(nums[j]);', 'choose'),
      L('            backtrack(nums, used, cur, res);', 'rec'),
      L('            used[j] = false; cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 3 });
    if (typeof nums === 'string') return { error: nums };
    if (new Set(nums).size !== nums.length) return { error: 'Values must be distinct (see Permutations II for duplicates).' };

    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const used = nums.map(() => false);
    const fmt = () => `[${cur.join(',')}]`;
    const aggs = () => [{ label: 'unused', value: nums.filter((_, j) => !used[j]).join(' ') || '—', c: 'a' as const }];
    steps.push({ tag: 'init', trace: ['Fill slots left to right; every unused value is a candidate for the current slot.'], state: buildView(cur, res, aggs()) });
    const backtrack = () => {
      if (steps.length > MAX_STEPS) return;
      if (cur.length === nums.length) {
        res.push(fmt());
        steps.push({ tag: 'hit', trace: ['All slots filled — ', C(fmt()), ' is a permutation.'], state: buildView(cur, res, aggs()) });
        return;
      }
      for (let j = 0; j < nums.length; j++) {
        if (used[j]) continue;
        used[j] = true;
        cur.push(nums[j]);
        steps.push({ tag: 'choose', trace: ['Slot ', A(cur.length - 1), ': try ', A(nums[j]), ' → ', A(fmt()), '.'], state: buildView(cur, res, aggs()) });
        backtrack();
        used[j] = false;
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: free ', F(nums[j]), ' and try the next candidate.'], state: buildView(cur, res, aggs()) });
      }
    };
    backtrack();
    steps.push({ tag: 'retall', trace: ['All ', C(res.length), ' orderings generated (', A(nums.length), '!).'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} permutations` };
  },
  note: 'Unlike subsets, order matters — so the loop restarts at 0 every level and a used[] mask replaces the start index. The choose/recurse/undo triple is the entire pattern; everything else is bookkeeping.',
  complexity: { time: 'O(n · n!)', space: 'O(n)' },
  brute: {
    label: 'In-place swaps',
    technique: 'Fix position i by swapping each remaining element into it, recurse on i + 1, then swap back.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> permute(vector<int>& nums) {'),
        L('        vector<vector<int>> res;', 'init'),
        L('        backtrack(nums, 0, res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    void backtrack(vector<int>& a, int i, vector<vector<int>>& res) {'),
        L('        if (i == a.size()) { res.push_back(a); return; }', 'hit'),
        L('        for (int j = i; j < a.size(); j++) {'),
        L('            swap(a[i], a[j]);', 'swap'),
        L('            backtrack(a, i + 1, res);'),
        L('            swap(a[i], a[j]);', 'undo'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> permute(int[] nums) {'),
        L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
        L('        backtrack(nums, 0, res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    private void backtrack(int[] a, int i, List<List<Integer>> res) {'),
        L('        if (i == a.length) {', 'hit'),
        L('            List<Integer> p = new ArrayList<>();', 'hit'),
        L('            for (int x : a) p.add(x);', 'hit'),
        L('            res.add(p); return;', 'hit'),
        L('        }'),
        L('        for (int j = i; j < a.length; j++) {'),
        L('            swap(a, i, j);', 'swap'),
        L('            backtrack(a, i + 1, res);'),
        L('            swap(a, i, j);', 'undo'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 3 });
      if (typeof nums === 'string') return { error: nums };
      if (new Set(nums).size !== nums.length) return { error: 'Values must be distinct (see Permutations II for duplicates).' };
      const a = [...nums];
      const steps: Step[] = [];
      const res: string[] = [];
      const view = (i: number) => buildView(a, res, [{ label: 'fixed prefix', value: `[${a.slice(0, i).join(',')}]`, c: 'b' }]);
      steps.push({ tag: 'init', trace: ['No ', F('used[]'), ' array and no separate build: the array itself is the build. Positions before i are fixed.'], state: view(0) });
      const bt = (i: number) => {
        if (i === a.length) {
          res.push(`[${a.join(',')}]`);
          steps.push({ tag: 'hit', trace: ['Every position fixed — ', C(`[${a.join(',')}]`), ' is a permutation.'], state: view(i) });
          return;
        }
        for (let j = i; j < a.length; j++) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({ tag: 'swap', trace: ['Swap ', A(a[i]), ' into position ', A(i), ' → ', A(`[${a.join(',')}]`), '.'], state: view(i + 1) });
          bt(i + 1);
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({ tag: 'undo', trace: ['Swap back to restore ', F(`[${a.join(',')}]`), '.'], state: view(i) });
        }
      };
      bt(0);
      steps.push({ tag: 'retall', trace: ['All ', C(res.length), ' orderings generated.'], state: buildView([], res) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} permutations` };
    },
    note: 'Swapping keeps the unused elements in the suffix, so the used[] mask and the separate build list disappear. Same O(n · n!) time; the output order differs from the used[] version.',
    complexity: { time: 'O(n · n!)', space: 'O(n)' },
  },
};

/* ================= 90. Permutations II ================= */
const permutationsII: ProblemDef = {
  slug: 'permutations-ii',
  title: 'Permutations II',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/permutations-ii/',
  technique: 'Sort, then: a duplicate may be used only if its earlier twin is already in the current build.',
  widget: 'stack',
  widgetTitle: 'Current permutation & results',
  inputs: [{ key: 'nums', label: 'Array (may repeat)', defaultValue: '1, 1, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> permuteUnique(vector<int>& nums) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        vector<vector<int>> res;', 'sort'),
      L('        vector<int> cur;', 'sort'),
      L('        vector<bool> used(nums.size(), false);', 'sort'),
      L('        backtrack(nums, used, cur, res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& res) {'),
      L('        if (cur.size() == nums.size()) {', 'hit'),
      L('            res.push_back(cur);', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int j = 0; j < nums.size(); j++) {', 'loop'),
      L('            if (used[j]) continue;', 'used'),
      L('            if (j > 0 && nums[j] == nums[j - 1] && !used[j - 1])', 'skip'),
      L('                continue;', 'skip'),
      L('            used[j] = true; cur.push_back(nums[j]);', 'choose'),
      L('            backtrack(nums, used, cur, res);', 'rec'),
      L('            used[j] = false; cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> permuteUnique(int[] nums) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'sort'),
      L('        backtrack(nums, new boolean[nums.length], new ArrayList<>(), res);', 'sort'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> res) {'),
      L('        if (cur.size() == nums.length) {', 'hit'),
      L('            res.add(new ArrayList<>(cur));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int j = 0; j < nums.length; j++) {', 'loop'),
      L('            if (used[j]) continue;', 'used'),
      L('            if (j > 0 && nums[j] == nums[j - 1] && !used[j - 1])', 'skip'),
      L('                continue;', 'skip'),
      L('            used[j] = true; cur.add(nums[j]);', 'choose'),
      L('            backtrack(nums, used, cur, res);', 'rec'),
      L('            used[j] = false; cur.remove(cur.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums, { maxLen: 4 });
    if (typeof input === 'string') return { error: input };
    const nums = [...input].sort((a, b) => a - b);
    const steps: Step[] = [];
    const res: string[] = [];
    const cur: number[] = [];
    const used = nums.map(() => false);
    const fmt = () => `[${cur.join(',')}]`;
    steps.push({ tag: 'sort', trace: ['Sorted: ', A(`[${nums.join(', ')}]`), '. Twins are now adjacent, so "which copy goes first" can be policed.'], state: buildView(cur, res) });
    const backtrack = () => {
      if (steps.length > MAX_STEPS) return;
      if (cur.length === nums.length) {
        res.push(fmt());
        steps.push({ tag: 'hit', trace: ['Complete — ', C(fmt()), '.'], state: buildView(cur, res) });
        return;
      }
      for (let j = 0; j < nums.length; j++) {
        if (used[j]) continue;
        if (j > 0 && nums[j] === nums[j - 1] && !used[j - 1]) {
          steps.push({ tag: 'skip', trace: ['Copy #', F(j), ' of ', F(nums[j]), ' while its earlier twin is unused — that ordering was already covered. Skip.'], state: buildView(cur, res) });
          continue;
        }
        used[j] = true;
        cur.push(nums[j]);
        steps.push({ tag: 'choose', trace: ['Take ', A(nums[j]), ' (copy #', A(j), ') → ', A(fmt()), '.'], state: buildView(cur, res) });
        backtrack();
        used[j] = false;
        cur.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: free ', F(nums[j]), '.'], state: buildView(cur, res) });
      }
    };
    backtrack();
    steps.push({ tag: 'retall', trace: [C(res.length), ' distinct permutation(s).'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique permutations` };
  },
  note: 'The rule "!used[j-1] ⇒ skip" forces equal values to be consumed strictly left-to-right — each multiset ordering is generated exactly once, killing duplicates at the branch level instead of deduplicating results afterward.',
  complexity: { time: 'O(n · n!)', space: 'O(n)' },
  brute: {
    label: 'Generate & dedupe',
    technique: 'Generate every permutation, treating equal values as distinct, and keep only the ones not seen yet.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> permuteUnique(vector<int>& nums) {'),
        L('        set<vector<int>> seen;', 'init'),
        L('        backtrack(nums, 0, seen);', 'init'),
        L('        return vector<vector<int>>(seen.begin(), seen.end());', 'retall'),
        L('    }'),
        L('    void backtrack(vector<int>& a, int i, set<vector<int>>& seen) {'),
        L('        if (i == a.size()) { seen.insert(a); return; }', 'new', 'dup'),
        L('        for (int j = i; j < a.size(); j++) {'),
        L('            swap(a[i], a[j]); backtrack(a, i + 1, seen); swap(a[i], a[j]);'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> permuteUnique(int[] nums) {'),
        L('        Set<List<Integer>> seen = new LinkedHashSet<>();', 'init'),
        L('        backtrack(nums, 0, seen);', 'init'),
        L('        return new ArrayList<>(seen);', 'retall'),
        L('    }'),
        L('    private void backtrack(int[] a, int i, Set<List<Integer>> seen) {'),
        L('        if (i == a.length) { seen.add(toList(a)); return; }', 'new', 'dup'),
        L('        for (int j = i; j < a.length; j++) {'),
        L('            swap(a, i, j); backtrack(a, i + 1, seen); swap(a, i, j);'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums, { maxLen: 4 });
      if (typeof input === 'string') return { error: input };
      const a = [...input].sort((x, y) => x - y);
      const steps: Step[] = [];
      const res: string[] = [];
      let dups = 0;
      steps.push({ tag: 'init', trace: ['Ignore the duplicates while generating: produce all ', A(`${a.length}!`), ' orderings and let a set filter repeats.'], state: buildView([], res) });
      const bt = (i: number) => {
        if (i === a.length) {
          const key = `[${a.join(',')}]`;
          if (res.includes(key)) {
            dups++;
            steps.push({ tag: 'dup', trace: [F(key), ' was already produced — discard it.'], state: buildView(a, res, [{ label: 'discarded', value: String(dups), c: 'a' }]) });
          } else {
            res.push(key);
            steps.push({ tag: 'new', trace: [C(key), ' is new — keep it.'], state: buildView(a, res, [{ label: 'discarded', value: String(dups), c: 'a' }]) });
          }
          return;
        }
        for (let j = i; j < a.length; j++) {
          [a[i], a[j]] = [a[j], a[i]];
          bt(i + 1);
          [a[i], a[j]] = [a[j], a[i]];
        }
      };
      bt(0);
      steps.push({ tag: 'retall', trace: [C(res.length), ' distinct permutation(s); ', F(dups), ' duplicates were generated and thrown away.'], state: buildView([], res) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} unique permutations` };
    },
    note: 'Always does the full n! work even when most orderings are repeats (e.g. [1,1,1,1] produces 24 copies of one answer). Skipping a twin whose earlier copy is unused prevents duplicates at the branch instead.',
    complexity: { time: 'O(n · n!)', space: 'O(n · n!)' },
  },
};

/* ================= 91. Word Search ================= */
const wordSearch: ProblemDef = {
  slug: 'word-search',
  title: 'Word Search',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/word-search/',
  technique: 'DFS from every cell, marking the path in-place and unmarking on backtrack.',
  widget: 'matrix',
  widgetTitle: 'Board & search path',
  inputs: [
    { key: 'board', label: 'Board (rows ";" separated)', defaultValue: 'ABCE;SFCS;ADEE', wide: true },
    { key: 'word', label: 'Word', defaultValue: 'ABCCED' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool exist(vector<vector<char>>& board, string word) {'),
      L('        for (int r = 0; r < board.size(); r++)', 'start'),
      L('            for (int c = 0; c < board[0].size(); c++)', 'start'),
      L('                if (dfs(board, r, c, word, 0))', 'start'),
      L('                    return true;', 'found'),
      L('        return false;', 'fail'),
      L('    }'),
      L('    bool dfs(vector<vector<char>>& b, int r, int c, string& w, int i) {', 'dfs'),
      L('        if (i == w.size()) return true;', 'done'),
      L('        if (r < 0 || r >= b.size() || c < 0 || c >= b[0].size() ||', 'prune'),
      L('            b[r][c] != w[i])', 'prune'),
      L('            return false;', 'prune'),
      L('        char keep = b[r][c];', 'markcell'),
      L('        b[r][c] = \'#\';', 'markcell'),
      L('        bool found = dfs(b, r+1, c, w, i+1) || dfs(b, r-1, c, w, i+1) ||', 'rec'),
      L('                     dfs(b, r, c+1, w, i+1) || dfs(b, r, c-1, w, i+1);', 'rec'),
      L('        b[r][c] = keep;', 'unmark'),
      L('        return found;', 'dfs'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean exist(char[][] board, String word) {'),
      L('        for (int r = 0; r < board.length; r++)', 'start'),
      L('            for (int c = 0; c < board[0].length; c++)', 'start'),
      L('                if (dfs(board, r, c, word, 0))', 'start'),
      L('                    return true;', 'found'),
      L('        return false;', 'fail'),
      L('    }'),
      L('    private boolean dfs(char[][] b, int r, int c, String w, int i) {', 'dfs'),
      L('        if (i == w.length()) return true;', 'done'),
      L('        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length ||', 'prune'),
      L('            b[r][c] != w.charAt(i))', 'prune'),
      L('            return false;', 'prune'),
      L('        char keep = b[r][c];', 'markcell'),
      L('        b[r][c] = \'#\';', 'markcell'),
      L('        boolean found = dfs(b, r+1, c, w, i+1) || dfs(b, r-1, c, w, i+1) ||', 'rec'),
      L('                        dfs(b, r, c+1, w, i+1) || dfs(b, r, c-1, w, i+1);', 'rec'),
      L('        b[r][c] = keep;', 'unmark'),
      L('        return found;', 'dfs'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseGrid(values.board, { maxR: 4, maxC: 5 });
    if (typeof g === 'string') return { error: g };
    const word = (values.word ?? '').trim().toUpperCase();
    if (!/^[A-Z]{1,8}$/.test(word)) return { error: 'Word: uppercase letters, ≤ 8.' };
    const board = g.map((r) => r.map((c) => c.toUpperCase()));
    const R = board.length;
    const Cn = board[0].length;

    const steps: Step[] = [];
    const path: [number, number][] = [];
    let found = false;
    const snap = (extra?: MatrixState['mark']): MatrixState => ({
      grid: board,
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(path.map(([r, c], i) => [`${r},${c}`, found ? 'final' : i === path.length - 1 ? 'active' : 'win'])),
        ...extra,
      },
      aggs: [{ label: 'matched', value: `"${word.slice(0, path.length)}" (${path.length}/${word.length})`, c: 'a' }],
    });
    const dfs = (r: number, c: number, i: number): boolean => {
      if (steps.length > MAX_STEPS) return false;
      if (i === word.length) return true;
      if (r < 0 || r >= R || c < 0 || c >= Cn) return false;
      if (path.some(([pr, pc]) => pr === r && pc === c)) return false;
      if (board[r][c] !== word[i]) {
        if (path.length > 0) {
          steps.push({ tag: 'prune', trace: ['(', A(r), ',', A(c), ") holds '", F(board[r][c]), "', need '", A(word[i]), "' — dead end."], state: snap({ [`${r},${c}`]: 'dim' }) });
        }
        return false;
      }
      path.push([r, c]);
      steps.push({ tag: 'markcell', trace: ["Match '", B(word[i]), "' at (", A(r), ',', A(c), ') — mark it used and continue.'], state: snap() });
      if (i + 1 === word.length) {
        found = true;
        steps.push({ tag: 'done', trace: ['Every character matched — "', C(word), '" exists in the board!'], state: snap() });
        return true;
      }
      const ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
      if (!ok) {
        path.pop();
        steps.push({ tag: 'unmark', trace: ['All four directions failed from (', F(r), ',', F(c), ') — unmark it and backtrack.'], state: snap() });
      }
      return ok;
    };
    steps.push({ tag: 'start', trace: ['Try every cell as a starting point for "', C(word), '".'], state: snap() });
    outer: for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (board[r][c] === word[0]) {
          steps.push({ tag: 'start', trace: ['Cell (', A(r), ',', A(c), ") holds '", A(word[0]), "' — start a DFS here."], state: snap({ [`${r},${c}`]: 'active' }) });
          if (dfs(r, c, 0)) break outer;
        }
      }
    }
    if (!found) steps.push({ tag: 'fail', trace: ['No starting cell led to a full match — return ', C('false'), '.'], state: snap() });
    return { steps, result: String(found), resultDetail: found ? `path of length ${word.length}` : undefined };
  },
  note: 'Marking the cell in-place (with "#") is the visited-set — restored on backtrack, it costs zero memory and automatically prevents the path from crossing itself, which is the problem\'s only real constraint.',
  complexity: { time: 'O(R·C·4^L)', space: 'O(L)' },
  brute: {
    label: 'Letter-count pre-check',
    technique: 'Before any DFS, check that the board has enough of every letter in the word; only then search.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool exist(vector<vector<char>>& board, string word) {'),
        L('        unordered_map<char, int> have;', 'count'),
        L('        for (auto& row : board) for (char c : row) have[c]++;', 'count'),
        L('        for (char c : word)', 'check'),
        L('            if (--have[c] < 0) return false;', 'check', 'short'),
        L('        for (int r = 0; r < board.size(); r++)', 'start'),
        L('            for (int c = 0; c < board[0].size(); c++)', 'start'),
        L('                if (dfs(board, r, c, word, 0)) return true;', 'start', 'found'),
        L('        return false;', 'fail'),
        L('    }'),
        L('    // dfs: same mark-and-unmark search as the main solution', 'markcell', 'unmark'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean exist(char[][] board, String word) {'),
        L('        int[] have = new int[128];', 'count'),
        L('        for (char[] row : board) for (char c : row) have[c]++;', 'count'),
        L('        for (char c : word.toCharArray())', 'check'),
        L('            if (--have[c] < 0) return false;', 'check', 'short'),
        L('        for (int r = 0; r < board.length; r++)', 'start'),
        L('            for (int c = 0; c < board[0].length; c++)', 'start'),
        L('                if (dfs(board, r, c, word, 0)) return true;', 'start', 'found'),
        L('        return false;', 'fail'),
        L('    }'),
        L('    // dfs: same mark-and-unmark search as the main solution', 'markcell', 'unmark'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseGrid(values.board, { maxR: 4, maxC: 5 });
      if (typeof g === 'string') return { error: g };
      const word = (values.word ?? '').trim().toUpperCase();
      if (!/^[A-Z]{1,8}$/.test(word)) return { error: 'Word: uppercase letters, ≤ 8.' };
      const board = g.map((r) => r.map((c) => c.toUpperCase()));
      const R = board.length;
      const Cn = board[0].length;
      const steps: Step[] = [];
      const path: [number, number][] = [];
      let found = false;
      const have = new Map<string, number>();
      for (const row of board) for (const c of row) have.set(c, (have.get(c) ?? 0) + 1);
      const snap = (extra?: MatrixState['mark']): MatrixState => ({
        grid: board,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(Cn)].map((_, i) => i),
        mark: { ...Object.fromEntries(path.map(([r, c], i) => [`${r},${c}`, found ? 'final' : i === path.length - 1 ? 'active' : 'win'])), ...extra },
        aggs: [{ label: 'matched', value: `"${word.slice(0, path.length)}" (${path.length}/${word.length})`, c: 'a' }],
      });
      steps.push({ tag: 'count', trace: ['Count the board letters first: ', A([...have.entries()].map(([c, k]) => `${c}:${k}`).join(' ')), '.'], state: snap() });
      const need = new Map<string, number>();
      for (const c of word) need.set(c, (need.get(c) ?? 0) + 1);
      for (const [c, k] of need) {
        const h = have.get(c) ?? 0;
        if (h < k) {
          steps.push({ tag: 'short', trace: ['The word needs ', A(k), " × '", A(c), "' but the board has only ", F(h), ' — impossible. Return ', C('false'), ' without searching.'], state: snap() });
          return { steps, result: 'false', resultDetail: `not enough '${c}'` };
        }
        steps.push({ tag: 'check', trace: ["Need ", A(k), " × '", A(c), "', board has ", B(h), ' — OK.'], state: snap() });
      }
      const dfs = (r: number, c: number, i: number): boolean => {
        if (steps.length > MAX_STEPS) return false;
        if (r < 0 || r >= R || c < 0 || c >= Cn) return false;
        if (path.some(([pr, pc]) => pr === r && pc === c)) return false;
        if (board[r][c] !== word[i]) return false;
        path.push([r, c]);
        steps.push({ tag: 'markcell', trace: ["Match '", B(word[i]), "' at (", A(r), ',', A(c), ').'], state: snap() });
        if (i + 1 === word.length) {
          found = true;
          return true;
        }
        const ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
        if (!ok) {
          path.pop();
          steps.push({ tag: 'unmark', trace: ['Dead end from (', F(r), ',', F(c), ') — backtrack.'], state: snap() });
        }
        return ok;
      };
      outer: for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++)
          if (board[r][c] === word[0]) {
            steps.push({ tag: 'start', trace: ['Start a DFS at (', A(r), ',', A(c), ').'], state: snap({ [`${r},${c}`]: 'active' }) });
            if (dfs(r, c, 0)) break outer;
          }
      steps.push(
        found
          ? { tag: 'found', trace: ['"', C(word), '" found — return ', C('true'), '.'], state: snap() }
          : { tag: 'fail', trace: ['The letters exist but no path spells the word — return ', C('false'), '.'], state: snap() },
      );
      return { steps, result: String(found), resultDetail: found ? `path of length ${word.length}` : undefined };
    },
    note: 'The DFS is exponential in the word length, so an O(R·C) counting pass that rules out impossible words is almost free insurance — it is the pruning that turns many worst cases into instant answers on LeetCode.',
    complexity: { time: 'O(R·C·4^L) worst case', space: 'O(L + alphabet)' },
  },
};

/* ================= 92. Palindrome Partitioning ================= */
const palindromePartition: ProblemDef = {
  slug: 'palindrome-partitioning',
  title: 'Palindrome Partitioning',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/palindrome-partitioning/',
  technique: 'At each position, try every palindromic prefix as the next cut.',
  widget: 'stack',
  widgetTitle: 'Current cuts & results',
  inputs: [{ key: 's', label: 'String', defaultValue: 'aab', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<string>> partition(string s) {'),
      L('        vector<vector<string>> res;', 'init'),
      L('        vector<string> cur;', 'init'),
      L('        backtrack(s, 0, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(string& s, int start, vector<string>& cur, vector<vector<string>>& res) {'),
      L('        if (start == s.size()) {', 'hit'),
      L('            res.push_back(cur);', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int end = start; end < s.size(); end++) {', 'loop'),
      L('            if (isPal(s, start, end)) {', 'try'),
      L('                cur.push_back(s.substr(start, end - start + 1));', 'choose'),
      L('                backtrack(s, end + 1, cur, res);', 'rec'),
      L('                cur.pop_back();', 'undo'),
      L('            }'),
      L('        }'),
      L('    }'),
      L('    bool isPal(string& s, int l, int r) {', 'try'),
      L('        while (l < r) if (s[l++] != s[r--]) return false;'),
      L('        return true;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<String>> partition(String s) {'),
      L('        List<List<String>> res = new ArrayList<>();', 'init'),
      L('        backtrack(s, 0, new ArrayList<>(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(String s, int start, List<String> cur, List<List<String>> res) {'),
      L('        if (start == s.length()) {', 'hit'),
      L('            res.add(new ArrayList<>(cur));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int end = start; end < s.length(); end++) {', 'loop'),
      L('            if (isPal(s, start, end)) {', 'try'),
      L('                cur.add(s.substring(start, end + 1));', 'choose'),
      L('                backtrack(s, end + 1, cur, res);', 'rec'),
      L('                cur.remove(cur.size() - 1);', 'undo'),
      L('            }'),
      L('        }'),
      L('    }'),
      L('    private boolean isPal(String s, int l, int r) {', 'try'),
      L('        while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;'),
      L('        return true;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,7}$/.test(s)) return { error: 'Lowercase letters, at most 7 characters.' };

    const steps: Step[] = [];
    const res: string[] = [];
    const cur: string[] = [];
    const isPal = (str: string) => str === [...str].reverse().join('');
    const fmt = () => `[${cur.join('|')}]`;
    steps.push({ tag: 'init', trace: ['Cut the string into pieces where ', B('every piece is a palindrome'), '. At each position, any palindromic prefix is a legal next cut.'], state: buildView(cur, res) });
    const backtrack = (start: number) => {
      if (steps.length > MAX_STEPS) return;
      if (start === s.length) {
        res.push(fmt());
        steps.push({ tag: 'hit', trace: ['String fully consumed — ', C(fmt()), ' is a valid partition.'], state: buildView(cur, res) });
        return;
      }
      for (let end = start; end < s.length; end++) {
        const piece = s.slice(start, end + 1);
        if (isPal(piece)) {
          cur.push(piece);
          steps.push({ tag: 'choose', trace: ['"', B(piece), '" is a palindrome — cut it off and recurse on "', A(s.slice(end + 1) || 'ε'), '".'], state: buildView(cur, res) });
          backtrack(end + 1);
          cur.pop();
          steps.push({ tag: 'undo', trace: ['Backtrack: un-cut "', F(piece), '" and try a longer prefix.'], state: buildView(cur, res) });
        } else {
          steps.push({ tag: 'try', trace: ['"', F(piece), '" is not a palindrome — this cut is illegal.'], state: buildView(cur, res) });
        }
      }
    };
    backtrack(0);
    steps.push({ tag: 'retall', trace: [C(res.length), ' palindromic partition(s) of "', A(s), '".'], state: buildView(cur, res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} partitions` };
  },
  note: 'The key reframe: a partition is a sequence of *choices of first piece*. Constraining each choice to palindromic prefixes means invalid partitions are never explored at all — the constraint prunes rather than filters.',
  complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)' },
  brute: {
    label: 'DP palindrome table',
    technique: 'Precompute isPal[i][j] for every substring once, so each cut is checked in O(1) during the backtracking.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<string>> partition(string s) {'),
        L('        int n = s.size();', 'table'),
        L('        vector<vector<bool>> pal(n, vector<bool>(n));', 'table'),
        L('        for (int i = n - 1; i >= 0; i--)', 'table'),
        L('            for (int j = i; j < n; j++)', 'table'),
        L('                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);', 'table'),
        L('        vector<vector<string>> res; vector<string> cur;', 'init'),
        L('        backtrack(s, 0, pal, cur, res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    void backtrack(string& s, int start, vector<vector<bool>>& pal,'),
        L('                   vector<string>& cur, vector<vector<string>>& res) {'),
        L('        if (start == s.size()) { res.push_back(cur); return; }', 'hit'),
        L('        for (int end = start; end < s.size(); end++) {'),
        L('            if (!pal[start][end]) continue;', 'try'),
        L('            cur.push_back(s.substr(start, end - start + 1));', 'choose'),
        L('            backtrack(s, end + 1, pal, cur, res);'),
        L('            cur.pop_back();', 'undo'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<String>> partition(String s) {'),
        L('        int n = s.length();', 'table'),
        L('        boolean[][] pal = new boolean[n][n];', 'table'),
        L('        for (int i = n - 1; i >= 0; i--)', 'table'),
        L('            for (int j = i; j < n; j++)', 'table'),
        L('                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);', 'table'),
        L('        List<List<String>> res = new ArrayList<>();', 'init'),
        L('        backtrack(s, 0, pal, new ArrayList<>(), res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    private void backtrack(String s, int start, boolean[][] pal,'),
        L('                           List<String> cur, List<List<String>> res) {'),
        L('        if (start == s.length()) { res.add(new ArrayList<>(cur)); return; }', 'hit'),
        L('        for (int end = start; end < s.length(); end++) {'),
        L('            if (!pal[start][end]) continue;', 'try'),
        L('            cur.add(s.substring(start, end + 1));', 'choose'),
        L('            backtrack(s, end + 1, pal, cur, res);'),
        L('            cur.remove(cur.size() - 1);', 'undo'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,7}$/.test(s)) return { error: 'Lowercase letters, at most 7 characters.' };
      const n = s.length;
      const pal: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
      for (let i = n - 1; i >= 0; i--) for (let j = i; j < n; j++) pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
      const palList = [];
      for (let i = 0; i < n; i++) for (let j = i; j < n; j++) if (pal[i][j]) palList.push(s.slice(i, j + 1));
      const steps: Step[] = [];
      const res: string[] = [];
      const cur: string[] = [];
      const fmt = () => `[${cur.join('|')}]`;
      const aggs = [{ label: 'palindromic substrings', value: palList.join(' '), c: 'b' as const }];
      steps.push({
        tag: 'table',
        trace: ['Fill a table in O(n²): s[i..j] is a palindrome when its ends match and s[i+1..j−1] is one. Found ', B(palList.length), ' palindromic substrings.'],
        state: buildView(cur, res, aggs),
      });
      steps.push({ tag: 'init', trace: ['Now backtrack exactly as before, but every "is this a palindrome?" is a table lookup.'], state: buildView(cur, res, aggs) });
      const bt = (start: number) => {
        if (steps.length > MAX_STEPS) return;
        if (start === n) {
          res.push(fmt());
          steps.push({ tag: 'hit', trace: ['String consumed — ', C(fmt()), ' is a valid partition.'], state: buildView(cur, res, aggs) });
          return;
        }
        for (let end = start; end < n; end++) {
          const piece = s.slice(start, end + 1);
          if (!pal[start][end]) {
            steps.push({ tag: 'try', trace: ['Table says "', F(piece), '" is not a palindrome — O(1) rejection.'], state: buildView(cur, res, aggs) });
            continue;
          }
          cur.push(piece);
          steps.push({ tag: 'choose', trace: ['Table says "', B(piece), '" is a palindrome — cut it.'], state: buildView(cur, res, aggs) });
          bt(end + 1);
          cur.pop();
          steps.push({ tag: 'undo', trace: ['Backtrack: un-cut "', F(piece), '".'], state: buildView(cur, res, aggs) });
        }
      };
      bt(0);
      steps.push({ tag: 'retall', trace: [C(res.length), ' palindromic partition(s) of "', A(s), '".'], state: buildView(cur, res, aggs) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} partitions` };
    },
    note: 'The plain version re-checks the same substrings for palindromes in many branches, each check costing O(n). One O(n²) table makes every later check O(1) — a real speed-up on strings with many partitions.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n²)' },
  },
};

/* ================= 93. N-Queens ================= */
const nQueens: ProblemDef = {
  slug: 'n-queens',
  title: 'N-Queens',
  category: 'Backtracking',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/n-queens/',
  technique: 'Place one queen per row; columns and both diagonals are O(1) conflict sets.',
  widget: 'matrix',
  widgetTitle: 'Board',
  inputs: [{ key: 'n', label: 'n', defaultValue: '4' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<string>> solveNQueens(int n) {'),
      L('        vector<vector<string>> res;', 'init'),
      L('        vector<int> queens;  // queens[r] = column', 'init'),
      L('        set<int> cols, diag1, diag2;', 'init'),
      L('        backtrack(n, 0, queens, cols, diag1, diag2, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(int n, int r, vector<int>& q, set<int>& cols,'),
      L('                   set<int>& d1, set<int>& d2, vector<vector<string>>& res) {', 'row'),
      L('        if (r == n) {', 'hit'),
      L('            res.push_back(render(q, n));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int c = 0; c < n; c++) {', 'loop'),
      L('            if (cols.count(c) || d1.count(r - c) || d2.count(r + c))', 'attack'),
      L('                continue;', 'attack'),
      L('            q.push_back(c); cols.insert(c);', 'place'),
      L('            d1.insert(r - c); d2.insert(r + c);', 'place'),
      L('            backtrack(n, r + 1, q, cols, d1, d2, res);', 'rec'),
      L('            q.pop_back(); cols.erase(c);', 'undo'),
      L('            d1.erase(r - c); d2.erase(r + c);', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<String>> solveNQueens(int n) {'),
      L('        List<List<String>> res = new ArrayList<>();', 'init'),
      L('        backtrack(n, 0, new ArrayList<>(), new HashSet<>(),', 'init'),
      L('                  new HashSet<>(), new HashSet<>(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int n, int r, List<Integer> q, Set<Integer> cols,'),
      L('                           Set<Integer> d1, Set<Integer> d2, List<List<String>> res) {', 'row'),
      L('        if (r == n) {', 'hit'),
      L('            res.add(render(q, n));', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (int c = 0; c < n; c++) {', 'loop'),
      L('            if (cols.contains(c) || d1.contains(r - c) || d2.contains(r + c))', 'attack'),
      L('                continue;', 'attack'),
      L('            q.add(c); cols.add(c); d1.add(r - c); d2.add(r + c);', 'place'),
      L('            backtrack(n, r + 1, q, cols, d1, d2, res);', 'rec'),
      L('            q.remove(q.size() - 1); cols.remove(c);', 'undo'),
      L('            d1.remove(r - c); d2.remove(r + c);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 4, max: 6 });
    if (typeof n === 'string') return { error: n };

    const steps: Step[] = [];
    const queens: number[] = [];
    const solutions: string[] = [];
    const cols = new Set<number>();
    const d1 = new Set<number>();
    const d2 = new Set<number>();
    const snap = (extra?: MatrixState['mark']): MatrixState => ({
      grid: [...Array(n)].map((_, r) => [...Array(n)].map((_, c) => (queens[r] === c ? '♛' : ''))),
      rowLabels: [...Array(n)].map((_, i) => i),
      colLabels: [...Array(n)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(queens.map((c, r) => [`${r},${c}`, 'good'])),
        ...extra,
      },
      aggs: [{ label: 'solutions', value: String(solutions.length), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['One queen per row (rows can never clash) — only columns and the two diagonal families need checking.'], state: snap() });
    const backtrack = (r: number) => {
      if (steps.length > MAX_STEPS) return;
      if (r === n) {
        solutions.push(`[${queens.join(',')}]`);
        steps.push({ tag: 'hit', trace: ['All ', B(n), ' queens placed peacefully — solution #', C(solutions.length), ': columns ', C(`[${queens.join(', ')}]`), '.'], state: snap() });
        return;
      }
      for (let c = 0; c < n; c++) {
        if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) {
          steps.push({ tag: 'attack', trace: ['Row ', A(r), ', col ', F(c), ': attacked (', cols.has(c) ? 'column' : d1.has(r - c) ? '↘ diagonal' : '↙ diagonal', ') — skip.'], state: snap({ [`${r},${c}`]: 'dim' }) });
          continue;
        }
        queens.push(c);
        cols.add(c);
        d1.add(r - c);
        d2.add(r + c);
        steps.push({ tag: 'place', trace: ['Place a queen at (', B(r), ',', B(c), ') — claim its column and both diagonals.'], state: snap({ [`${r},${c}`]: 'active' }) });
        backtrack(r + 1);
        queens.pop();
        cols.delete(c);
        d1.delete(r - c);
        d2.delete(r + c);
        steps.push({ tag: 'undo', trace: ['Backtrack: lift the queen off (', F(r), ',', F(c), ').'], state: snap() });
      }
    };
    backtrack(0);
    steps.push({ tag: 'retall', trace: [C(solutions.length), ' solution(s) for n = ', A(n), '.'], state: snap() });
    return { steps, result: String(solutions.length), resultDetail: `solutions (as column lists): ${solutions.join('  ')}` };
  },
  note: 'The insight that makes N-Queens tractable: cells on the same ↘ diagonal share r−c, and cells on the same ↙ diagonal share r+c. Three hash sets replace scanning the whole board for attacks, so each placement test is O(1).',
  complexity: { time: 'O(n!)', space: 'O(n)' },
  brute: {
    label: 'Scan for attacks',
    technique: 'Place one queen per row, but test safety by scanning the earlier rows instead of keeping conflict sets.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<string>> solveNQueens(int n) {'),
        L('        vector<vector<string>> res;', 'init'),
        L('        vector<int> q;', 'init'),
        L('        backtrack(n, 0, q, res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    bool safe(vector<int>& q, int r, int c) {'),
        L('        for (int pr = 0; pr < r; pr++)', 'attack', 'place'),
        L('            if (q[pr] == c || abs(q[pr] - c) == r - pr) return false;', 'attack'),
        L('        return true;', 'place'),
        L('    }'),
        L('    void backtrack(int n, int r, vector<int>& q, vector<vector<string>>& res) {'),
        L('        if (r == n) { res.push_back(render(q, n)); return; }', 'hit'),
        L('        for (int c = 0; c < n; c++) {'),
        L('            if (!safe(q, r, c)) continue;', 'attack'),
        L('            q.push_back(c);', 'place'),
        L('            backtrack(n, r + 1, q, res);'),
        L('            q.pop_back();', 'undo'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<String>> solveNQueens(int n) {'),
        L('        List<List<String>> res = new ArrayList<>();', 'init'),
        L('        backtrack(n, 0, new ArrayList<>(), res);', 'init'),
        L('        return res;', 'retall'),
        L('    }'),
        L('    private boolean safe(List<Integer> q, int r, int c) {'),
        L('        for (int pr = 0; pr < r; pr++)', 'attack', 'place'),
        L('            if (q.get(pr) == c || Math.abs(q.get(pr) - c) == r - pr) return false;', 'attack'),
        L('        return true;', 'place'),
        L('    }'),
        L('    private void backtrack(int n, int r, List<Integer> q, List<List<String>> res) {'),
        L('        if (r == n) { res.add(render(q, n)); return; }', 'hit'),
        L('        for (int c = 0; c < n; c++) {'),
        L('            if (!safe(q, r, c)) continue;', 'attack'),
        L('            q.add(c);', 'place'),
        L('            backtrack(n, r + 1, q, res);'),
        L('            q.remove(q.size() - 1);', 'undo'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 4, max: 6 });
      if (typeof n === 'string') return { error: n };
      const steps: Step[] = [];
      const queens: number[] = [];
      const solutions: string[] = [];
      let scans = 0;
      const snap = (extra?: MatrixState['mark']): MatrixState => ({
        grid: [...Array(n)].map((_, r) => [...Array(n)].map((_, c) => (queens[r] === c ? '♛' : ''))),
        rowLabels: [...Array(n)].map((_, i) => i),
        colLabels: [...Array(n)].map((_, i) => i),
        mark: { ...Object.fromEntries(queens.map((c, r) => [`${r},${c}`, 'good'])), ...extra },
        aggs: [
          { label: 'solutions', value: String(solutions.length), c: 'c' },
          { label: 'queens scanned', value: String(scans), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['One queen per row. To test a square, look back at ', A('every queen already placed'), '.'], state: snap() });
      const bt = (r: number) => {
        if (steps.length > MAX_STEPS) return;
        if (r === n) {
          solutions.push(`[${queens.join(',')}]`);
          steps.push({ tag: 'hit', trace: ['All ', B(n), ' queens placed — solution #', C(solutions.length), '.'], state: snap() });
          return;
        }
        for (let c = 0; c < n; c++) {
          let attacker = -1;
          for (let pr = 0; pr < r; pr++) {
            scans++;
            if (queens[pr] === c || Math.abs(queens[pr] - c) === r - pr) {
              attacker = pr;
              break;
            }
          }
          if (attacker >= 0) {
            steps.push({
              tag: 'attack',
              trace: ['(', A(r), ',', F(c), '): scanning back finds the queen at (', F(attacker), ',', F(queens[attacker]), ') attacks it — skip.'],
              state: snap({ [`${r},${c}`]: 'dim', [`${attacker},${queens[attacker]}`]: 'src' }),
            });
            continue;
          }
          queens.push(c);
          steps.push({ tag: 'place', trace: ['(', B(r), ',', B(c), ') survives a scan of all ', A(r), ' earlier queens — place it.'], state: snap({ [`${r},${c}`]: 'active' }) });
          bt(r + 1);
          queens.pop();
          steps.push({ tag: 'undo', trace: ['Backtrack: lift the queen off (', F(r), ',', F(c), ').'], state: snap() });
        }
      };
      bt(0);
      steps.push({ tag: 'retall', trace: [C(solutions.length), ' solution(s) for n = ', A(n), ', after ', A(scans), ' queen-by-queen checks.'], state: snap() });
      return { steps, result: String(solutions.length), resultDetail: `solutions (as column lists): ${solutions.join('  ')}` };
    },
    note: 'Each safety test costs O(r) because it re-examines every placed queen. Tracking occupied columns and the r − c / r + c diagonals in sets turns that into three O(1) lookups.',
    complexity: { time: 'O(n! · n)', space: 'O(n)' },
  },
};

/* ================= 94. Letter Combinations of a Phone Number ================= */
const letterCombos: ProblemDef = {
  slug: 'letter-combinations-of-a-phone-number',
  title: 'Letter Combinations of a Phone Number',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
  technique: 'One recursion level per digit; branch over that digit\'s letters.',
  widget: 'stack',
  widgetTitle: 'Current string & results',
  inputs: [{ key: 'digits', label: 'Digits (2–9)', defaultValue: '23' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    const string keys[8] = {"abc", "def", "ghi", "jkl",', 'init'),
      L('                            "mno", "pqrs", "tuv", "wxyz"};', 'init'),
      L('public:'),
      L('    vector<string> letterCombinations(string digits) {'),
      L('        vector<string> res;', 'init'),
      L('        if (digits.empty()) return res;', 'init'),
      L('        string cur;', 'init'),
      L('        backtrack(digits, 0, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(string& digits, int i, string& cur, vector<string>& res) {'),
      L('        if (i == digits.size()) {', 'hit'),
      L('            res.push_back(cur);', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (char c : keys[digits[i] - \'2\']) {', 'loop'),
      L('            cur.push_back(c);', 'choose'),
      L('            backtrack(digits, i + 1, cur, res);', 'rec'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private static final String[] KEYS = {"abc", "def", "ghi", "jkl",', 'init'),
      L('                                          "mno", "pqrs", "tuv", "wxyz"};', 'init'),
      L('    public List<String> letterCombinations(String digits) {'),
      L('        List<String> res = new ArrayList<>();', 'init'),
      L('        if (digits.isEmpty()) return res;', 'init'),
      L('        backtrack(digits, 0, new StringBuilder(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(String digits, int i, StringBuilder cur, List<String> res) {'),
      L('        if (i == digits.length()) {', 'hit'),
      L('            res.add(cur.toString());', 'hit'),
      L('            return;', 'hit'),
      L('        }'),
      L('        for (char c : KEYS[digits.charAt(i) - \'2\'].toCharArray()) {', 'loop'),
      L('            cur.append(c);', 'choose'),
      L('            backtrack(digits, i + 1, cur, res);', 'rec'),
      L('            cur.deleteCharAt(cur.length() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const digits = (values.digits ?? '').trim();
    if (!/^[2-9]{1,3}$/.test(digits)) return { error: 'Enter 1–3 digits, each 2–9.' };
    const KEYS: Record<string, string> = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };

    const steps: Step[] = [];
    const res: string[] = [];
    let cur = '';
    steps.push({
      tag: 'init',
      trace: ['Each digit maps to letters: ', ...digits.split('').flatMap((d, i) => (i > 0 ? [', ', A(`${d}→${KEYS[d]}`)] : [A(`${d}→${KEYS[d]}`)])), '. Build one letter per level.'],
      state: buildView([], res),
    });
    const backtrack = (i: number) => {
      if (steps.length > MAX_STEPS) return;
      if (i === digits.length) {
        res.push(`"${cur}"`);
        steps.push({ tag: 'hit', trace: ['Every digit consumed — "', C(cur), '" is a combination.'], state: buildView(cur.split(''), res) });
        return;
      }
      for (const c of KEYS[digits[i]]) {
        cur += c;
        steps.push({ tag: 'choose', trace: ['Digit ', A(digits[i]), ": try '", A(c), "' → \"", A(cur), '".'], state: buildView(cur.split(''), res) });
        backtrack(i + 1);
        cur = cur.slice(0, -1);
        steps.push({ tag: 'undo', trace: ["Backtrack: remove '", F(c), "'."], state: buildView(cur.split(''), res) });
      }
    };
    backtrack(0);
    steps.push({ tag: 'retall', trace: [C(res.length), ' combination(s).'], state: buildView([], res) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} combinations` };
  },
  note: 'This is the cleanest possible backtracking: the tree\'s depth equals the number of digits and its branching factor is the key\'s letter count — the recursion is literally the cartesian product written as a walk.',
  complexity: { time: 'O(4ⁿ · n)', space: 'O(n)' },
  brute: {
    label: 'Iterative (level by level)',
    technique: 'Start from [""] and, for each digit, append every one of its letters to every string built so far.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    const string keys[8] = {"abc", "def", "ghi", "jkl",', 'init'),
        L('                            "mno", "pqrs", "tuv", "wxyz"};', 'init'),
        L('public:'),
        L('    vector<string> letterCombinations(string digits) {'),
        L('        if (digits.empty()) return {};', 'init'),
        L('        vector<string> res = {""};', 'init'),
        L('        for (char d : digits) {', 'level'),
        L('            vector<string> next;', 'level'),
        L('            for (string& s : res)', 'level'),
        L('                for (char c : keys[d - \'2\']) next.push_back(s + c);', 'level'),
        L('            res = next;', 'level'),
        L('        }'),
        L('        return res;', 'retall'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    private static final String[] KEYS = {"abc", "def", "ghi", "jkl",', 'init'),
        L('                                          "mno", "pqrs", "tuv", "wxyz"};', 'init'),
        L('    public List<String> letterCombinations(String digits) {'),
        L('        if (digits.isEmpty()) return new ArrayList<>();', 'init'),
        L('        List<String> res = new ArrayList<>(List.of(""));', 'init'),
        L('        for (char d : digits.toCharArray()) {', 'level'),
        L('            List<String> next = new ArrayList<>();', 'level'),
        L('            for (String s : res)', 'level'),
        L('                for (char c : KEYS[d - \'2\'].toCharArray()) next.add(s + c);', 'level'),
        L('            res = next;', 'level'),
        L('        }'),
        L('        return res;', 'retall'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const digits = (values.digits ?? '').trim();
      if (!/^[2-9]{1,3}$/.test(digits)) return { error: 'Enter 1–3 digits, each 2–9.' };
      const KEYS: Record<string, string> = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };
      const steps: Step[] = [];
      let res = [''];
      const q = () => res.map((s) => `"${s}"`);
      steps.push({ tag: 'init', trace: ['Start with one empty string. Each digit multiplies the list by its number of letters.'], state: buildView([], q()) });
      for (const d of digits) {
        const next: string[] = [];
        for (const s of res) for (const c of KEYS[d]) next.push(s + c);
        steps.push({
          tag: 'level',
          trace: ['Digit ', A(d), ' → letters ', A(KEYS[d]), ': ', A(res.length), ' string(s) × ', A(KEYS[d].length), ' = ', B(next.length), '.'],
          state: buildView(d.split(''), next.map((s) => `"${s}"`)),
        });
        res = next;
      }
      steps.push({ tag: 'retall', trace: [C(res.length), ' combination(s).'], state: buildView([], q()) });
      return { steps, result: `[${q().join(', ')}]`, resultDetail: `${res.length} combinations` };
    },
    note: 'This builds the same cartesian product breadth-first with no recursion. It holds a whole level in memory at once, so peak memory is the size of the output rather than the depth of the recursion.',
    complexity: { time: 'O(4ⁿ · n)', space: 'O(4ⁿ · n)' },
  },
};

export const backtracking = [subsets, subsetsII, combinationSum, combinationSumII, permutations, permutationsII, wordSearch, palindromePartition, nQueens, letterCombos];
