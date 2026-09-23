// Greedy.
import type { ArrayState, ListState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 127. Maximum Subarray ================= */
const maxSubarray: ProblemDef = {
  slug: 'maximum-subarray',
  title: 'Maximum Subarray',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-subarray/',
  technique: 'Kadane: extend the running sum while it helps, restart the moment it goes negative.',
  widget: 'array',
  widgetTitle: 'Array & running sum',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '-2, 1, -3, 4, -1, 2, 1, -5, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxSubArray(vector<int>& nums) {'),
      L('        int best = nums[0], cur = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (cur < 0)', 'restart'),
      L('                cur = 0;', 'restart'),
      L('            cur += x;', 'extend'),
      L('            best = max(best, cur);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxSubArray(int[] nums) {'),
      L('        int best = nums[0], cur = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (cur < 0)', 'restart'),
      L('                cur = 0;', 'restart'),
      L('            cur += x;', 'extend'),
      L('            best = Math.max(best, cur);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    let best = nums[0];
    let cur = 0;
    let start = 0;
    let bestRange: [number, number] = [0, 0];
    const st = (i: number, win: [number, number] | null): ArrayState => ({
      arr: nums,
      window: win,
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'running sum', value: String(cur), c: cur >= 0 ? 'a' : 'a' },
        { label: 'best', value: String(best), c: 'b' },
      ],
    });
    steps.push({ tag: 'init', trace: ['One pass. Keep a running sum — a negative running sum can only hurt whatever comes next.'], state: st(0, null) });
    for (let i = 0; i < nums.length; i++) {
      if (cur < 0) {
        steps.push({ tag: 'restart', trace: ['Running sum ', F(cur), ' is dead weight — abandon it and restart fresh at index ', A(i), '.'], state: st(i, null) });
        cur = 0;
        start = i;
      }
      cur += nums[i];
      const improved = cur > best;
      if (improved) {
        best = cur;
        bestRange = [start, i];
      }
      steps.push({
        tag: 'extend',
        tag2: improved ? 'best' : undefined,
        trace: ['Take ', A(nums[i]), ' — running sum ', A(cur), improved ? ' — new best!' : ` (best stays ${best}).`],
        state: st(i, [start, i]),
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Maximum subarray sum: ', C(best), ' — the span ', C(`[${nums.slice(bestRange[0], bestRange[1] + 1).join(', ')}]`), '.'],
      state: st(nums.length, bestRange),
    });
    return { steps, result: String(best), resultDetail: `indices ${bestRange[0]}…${bestRange[1]}` };
  },
  note: 'The greedy cut is airtight: a negative prefix can never improve a subarray that extends past it, so dropping it loses nothing. Every element is visited once, and best captures the answer before any restart can erase it.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'Try every start index, extend the end with a running sum, and keep the best sum seen.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxSubArray(vector<int>& nums) {'),
        L('        int best = nums[0];', 'init'),
        L('        for (int i = 0; i < nums.size(); i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.size(); j++) {', 'grow', 'better'),
        L('                sum += nums[j];', 'grow', 'better'),
        L('                best = max(best, sum);', 'better'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxSubArray(int[] nums) {'),
        L('        int best = nums[0];', 'init'),
        L('        for (int i = 0; i < nums.length; i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.length; j++) {', 'grow', 'better'),
        L('                sum += nums[j];', 'grow', 'better'),
        L('                best = Math.max(best, sum);', 'better'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 14 });
      if (typeof nums === 'string') return { error: nums };
      const steps: Step[] = [];
      let best = nums[0];
      let bestRange: [number, number] = [0, 0];
      let sum = 0;
      const st = (i: number, j: number | null): ArrayState => ({
        arr: nums,
        window: j !== null ? [i, j] : null,
        ptrs: i < nums.length ? [{ name: 'i', i, c: 'b' }] : [],
        aggs: [
          { label: 'sum', value: String(sum), c: 'a' },
          { label: 'best', value: String(best), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Try all n(n+1)/2 subarrays, keeping a running sum per start.'], state: st(0, null) });
      for (let i = 0; i < nums.length; i++) {
        sum = 0;
        steps.push({ tag: 'outer', trace: ['Start at index ', B(i), '.'], state: st(i, null) });
        for (let j = i; j < nums.length; j++) {
          sum += nums[j];
          const better = sum > best;
          if (better) {
            best = sum;
            bestRange = [i, j];
          }
          steps.push({ tag: better ? 'better' : 'grow', trace: ['Sum of [', B(i), '..', A(j), '] = ', better ? B(sum) : F(sum), better ? ' — best so far.' : '.'], state: st(i, j) });
        }
      }
      steps.push({ tag: 'ret', trace: ['Largest sum: ', C(best), '.'], state: { arr: nums, window: bestRange, mark: Object.fromEntries([...Array(bestRange[1] - bestRange[0] + 1)].map((_, k) => [bestRange[0] + k, 'final' as const])) } });
      return { steps, result: String(best), resultDetail: `indices ${bestRange[0]}…${bestRange[1]}` };
    },
    note: 'Quadratic because every start re-sums its suffix. Kadane notices that a negative running sum can never help a later subarray, so it restarts right there and needs one pass.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 128. Jump Game ================= */
const jumpGame: ProblemDef = {
  slug: 'jump-game',
  title: 'Jump Game',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/jump-game/',
  technique: 'Track the farthest reachable index — if the scan ever passes it, you are stuck.',
  widget: 'array',
  widgetTitle: 'Jump lengths & reach',
  inputs: [{ key: 'nums', label: 'Jump lengths', defaultValue: '2, 3, 1, 1, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool canJump(vector<int>& nums) {'),
      L('        int reach = 0;', 'init'),
      L('        for (int i = 0; i < nums.size(); i++) {', 'loop'),
      L('            if (i > reach)', 'stuck'),
      L('                return false;', 'stuck'),
      L('            reach = max(reach, i + nums[i]);', 'extend'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean canJump(int[] nums) {'),
      L('        int reach = 0;', 'init'),
      L('        for (int i = 0; i < nums.length; i++) {', 'loop'),
      L('            if (i > reach)', 'stuck'),
      L('                return false;', 'stuck'),
      L('            reach = Math.max(reach, i + nums[i]);', 'extend'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    let reach = 0;
    const st = (i: number): ArrayState => ({
      arr: nums,
      window: [0, Math.min(reach, nums.length - 1)],
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'farthest reach', value: String(reach), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['The green window is everything provably reachable. It starts as just index ', B(0), '.'], state: st(0) });
    let ok = true;
    for (let i = 0; i < nums.length; i++) {
      if (i > reach) {
        ok = false;
        steps.push({ tag: 'stuck', trace: ['Index ', F(i), ' lies beyond the reach ', F(reach), ' — a gap no jump can cross. Return ', C('false'), '.'], state: st(i) });
        break;
      }
      const newReach = Math.max(reach, i + nums[i]);
      steps.push({
        tag: 'extend',
        trace: ['From ', A(i), ' (jump ', A(nums[i]), ') we can reach ', A(i + nums[i]), newReach > reach ? [' — reach extends to '].join('') : ' — reach stays ', newReach > reach ? B(newReach) : A(reach), '.'],
        state: st(i),
      });
      reach = newReach;
    }
    if (ok) steps.push({ tag: 'ret', trace: ['The scan finished inside the reachable window — the last index is attainable: ', C('true'), '.'], state: st(nums.length) });
    return { steps, result: String(ok) };
  },
  note: 'Reachability here is a single interval [0, reach] — jumps go rightward from anywhere inside it, so tracking just the frontier is lossless. No need to know *which* jumps were taken, only how far the best combination gets.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'DP from the end',
    technique: 'Mark the last index good; working backwards, an index is good if any index it can jump to is good.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool canJump(vector<int>& nums) {'),
        L('        int n = nums.size();', 'init'),
        L('        vector<bool> good(n, false);', 'init'),
        L('        good[n - 1] = true;', 'init'),
        L('        for (int i = n - 2; i >= 0; i--)', 'check'),
        L('            for (int j = i + 1; j <= min(n - 1, i + nums[i]); j++)', 'check'),
        L('                if (good[j]) { good[i] = true; break; }', 'check'),
        L('        return good[0];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean canJump(int[] nums) {'),
        L('        int n = nums.length;', 'init'),
        L('        boolean[] good = new boolean[n];', 'init'),
        L('        good[n - 1] = true;', 'init'),
        L('        for (int i = n - 2; i >= 0; i--)', 'check'),
        L('            for (int j = i + 1; j <= Math.min(n - 1, i + nums[i]); j++)', 'check'),
        L('                if (good[j]) { good[i] = true; break; }', 'check'),
        L('        return good[0];', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, maxLen: 12 });
      if (typeof nums === 'string') return { error: nums };
      const n = nums.length;
      const good = Array(n).fill(false);
      good[n - 1] = true;
      let checks = 0;
      const steps: Step[] = [];
      const st = (i: number | null, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: nums,
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        mark: { ...Object.fromEntries(good.map((g, k) => [k, g ? 'good' : undefined]).filter(([, m]) => m)), ...mark },
        aggs: [{ label: 'targets checked', value: String(checks), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Green = "can reach the end from here". The last index trivially can.'], state: st(null) });
      for (let i = n - 2; i >= 0; i--) {
        for (let j = i + 1; j <= Math.min(n - 1, i + nums[i]); j++) {
          checks++;
          if (good[j]) {
            good[i] = true;
            break;
          }
        }
        steps.push({ tag: 'check', trace: ['Index ', A(i), ' (jump ≤ ', A(nums[i]), '): ', good[i] ? B('reaches a green index') : F('no green index in range'), '.'], state: st(i, good[i] ? {} : { [i]: 'dim' }) });
      }
      steps.push({ tag: 'ret', trace: ['Index 0 is ', good[0] ? B('green') : F('not green'), ' — return ', C(String(good[0])), '.'], state: st(null) });
      return { steps, result: String(good[0]) };
    },
    note: 'Each index may scan its whole jump range, so the worst case is O(n²). The greedy keeps only the farthest reachable index and answers in one forward pass.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

/* ================= 129. Jump Game II ================= */
const jumpGameII: ProblemDef = {
  slug: 'jump-game-ii',
  title: 'Jump Game II',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/jump-game-ii/',
  technique: 'BFS over index ranges: each "jump" advances to the farthest point the current range can see.',
  widget: 'array',
  widgetTitle: 'Current jump range',
  inputs: [{ key: 'nums', label: 'Jump lengths', defaultValue: '2, 3, 1, 1, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int jump(vector<int>& nums) {'),
      L('        int jumps = 0, end = 0, farthest = 0;', 'init'),
      L('        for (int i = 0; i < nums.size() - 1; i++) {', 'loop'),
      L('            farthest = max(farthest, i + nums[i]);', 'extend'),
      L('            if (i == end) {', 'edge'),
      L('                jumps++;', 'edge'),
      L('                end = farthest;', 'edge'),
      L('            }'),
      L('        }'),
      L('        return jumps;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int jump(int[] nums) {'),
      L('        int jumps = 0, end = 0, farthest = 0;', 'init'),
      L('        for (int i = 0; i < nums.length - 1; i++) {', 'loop'),
      L('            farthest = Math.max(farthest, i + nums[i]);', 'extend'),
      L('            if (i == end) {', 'edge'),
      L('                jumps++;', 'edge'),
      L('                end = farthest;', 'edge'),
      L('            }'),
      L('        }'),
      L('        return jumps;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    if (nums.length < 2) return { error: 'Need at least two positions.' };
    const steps: Step[] = [];
    let jumps = 0;
    let end = 0;
    let farthest = 0;
    const st = (i: number): ArrayState => ({
      arr: nums,
      window: [0, Math.min(end, nums.length - 1)],
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'jumps', value: String(jumps), c: 'c' },
        { label: 'range ends at', value: String(end), c: 'b' },
        { label: 'farthest seen', value: String(farthest), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Think BFS: jump 0 covers index 0; jump k+1 covers everything jump k\'s range can see.'], state: st(0) });
    for (let i = 0; i < nums.length - 1; i++) {
      farthest = Math.max(farthest, i + nums[i]);
      steps.push({ tag: 'extend', trace: ['Index ', A(i), ' sees up to ', A(i + nums[i]), ' — the frontier is ', A(farthest), '.'], state: st(i) });
      if (i === end) {
        jumps++;
        end = farthest;
        steps.push({ tag: 'edge', trace: ['Reached the edge of jump ', A(jumps - 1), '\'s range — commit jump ', C(jumps), ', whose range extends to ', B(end), '.'], state: st(i) });
        if (end >= nums.length - 1) break;
      }
    }
    steps.push({ tag: 'ret', trace: ['Minimum jumps to the end: ', C(jumps), '.'], state: st(nums.length) });
    return { steps, result: String(jumps) };
  },
  note: 'This is level-order BFS wearing a greedy costume: [start, end] is the current BFS level, farthest is the next level\'s boundary, and jumps counts levels. That equivalence is why the greedy is provably minimal.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'DP over indices',
    technique: 'jumps[i] = fewest jumps to land on i; every index relaxes all the indices it can reach.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int jump(vector<int>& nums) {'),
        L('        int n = nums.size();', 'init'),
        L('        vector<int> jumps(n, INT_MAX);', 'init'),
        L('        jumps[0] = 0;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'relax'),
        L('            for (int j = i + 1; j <= min(n - 1, i + nums[i]); j++)', 'relax'),
        L('                jumps[j] = min(jumps[j], jumps[i] + 1);', 'relax'),
        L('        return jumps[n - 1];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int jump(int[] nums) {'),
        L('        int n = nums.length;', 'init'),
        L('        int[] jumps = new int[n];', 'init'),
        L('        Arrays.fill(jumps, Integer.MAX_VALUE); jumps[0] = 0;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'relax'),
        L('            for (int j = i + 1; j <= Math.min(n - 1, i + nums[i]); j++)', 'relax'),
        L('                jumps[j] = Math.min(jumps[j], jumps[i] + 1);', 'relax'),
        L('        return jumps[n - 1];', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, maxLen: 12 });
      if (typeof nums === 'string') return { error: nums };
      if (nums.length < 2) return { error: 'Need at least two positions.' };
      const n = nums.length;
      const jumps = Array(n).fill(Infinity);
      jumps[0] = 0;
      const steps: Step[] = [];
      const st = (i: number | null, range: [number, number] | null): ArrayState => ({
        arr: nums.map((v, k) => `${v}｜${jumps[k] === Infinity ? '∞' : jumps[k]}`),
        window: range,
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
      });
      steps.push({ tag: 'init', trace: ['Each box shows ', A('jump length｜fewest jumps to land here'), '. Index 0 costs 0.'], state: st(null, null) });
      for (let i = 0; i < n; i++) {
        if (jumps[i] === Infinity || nums[i] === 0) continue;
        const hi = Math.min(n - 1, i + nums[i]);
        for (let j = i + 1; j <= hi; j++) jumps[j] = Math.min(jumps[j], jumps[i] + 1);
        steps.push({ tag: 'relax', trace: ['From index ', A(i), ' (', A(jumps[i]), ' jumps), indices ', A(i + 1), '…', A(hi), ' can be reached in at most ', B(jumps[i] + 1), '.'], state: st(i, [i + 1, hi]) });
      }
      steps.push({ tag: 'ret', trace: ['Fewest jumps to the end: ', C(jumps[n - 1]), '.'], state: st(null, null) });
      return { steps, result: String(jumps[n - 1]) };
    },
    note: 'Every index relaxes its whole jump range — O(n²) in the worst case. The greedy treats each jump as a BFS level over a range of indices and finishes in one pass.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

/* ================= 130. Gas Station ================= */
const gasStation: ProblemDef = {
  slug: 'gas-station',
  title: 'Gas Station',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/gas-station/',
  technique: 'If the tank dies at station i, no start in between could survive either — restart at i+1.',
  widget: 'array',
  widgetTitle: 'gas − cost per station',
  inputs: [
    { key: 'gas', label: 'Gas', defaultValue: '1, 2, 3, 4, 5', wide: true },
    { key: 'cost', label: 'Cost', defaultValue: '3, 4, 5, 1, 2', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {'),
      L('        int total = 0, tank = 0, start = 0;', 'init'),
      L('        for (int i = 0; i < gas.size(); i++) {', 'loop'),
      L('            int diff = gas[i] - cost[i];', 'diff'),
      L('            total += diff;', 'diff'),
      L('            tank += diff;', 'diff'),
      L('            if (tank < 0) {', 'restart'),
      L('                start = i + 1;', 'restart'),
      L('                tank = 0;', 'restart'),
      L('            }'),
      L('        }'),
      L('        return total >= 0 ? start : -1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int canCompleteCircuit(int[] gas, int[] cost) {'),
      L('        int total = 0, tank = 0, start = 0;', 'init'),
      L('        for (int i = 0; i < gas.length; i++) {', 'loop'),
      L('            int diff = gas[i] - cost[i];', 'diff'),
      L('            total += diff;', 'diff'),
      L('            tank += diff;', 'diff'),
      L('            if (tank < 0) {', 'restart'),
      L('                start = i + 1;', 'restart'),
      L('                tank = 0;', 'restart'),
      L('            }'),
      L('        }'),
      L('        return total >= 0 ? start : -1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const gas = parseIntArray(values.gas, { min: 0, maxLen: 10 });
    if (typeof gas === 'string') return { error: gas };
    const cost = parseIntArray(values.cost, { min: 0, maxLen: 10 });
    if (typeof cost === 'string') return { error: cost };
    if (gas.length !== cost.length) return { error: 'Gas and cost must have the same length.' };
    const steps: Step[] = [];
    let total = 0;
    let tank = 0;
    let start = 0;
    const diffs = gas.map((g, i) => g - cost[i]);
    const st = (i: number): ArrayState => ({
      arr: diffs.map((d) => (d >= 0 ? `+${d}` : String(d))),
      ptrs: [
        ...(i < diffs.length ? [{ name: 'i', i, c: 'a' as const }] : []),
        ...(start < diffs.length ? [{ name: 'start', i: start, c: 'b' as const }] : []),
      ],
      aggs: [
        { label: 'tank', value: String(tank), c: tank >= 0 ? 'b' : 'a' },
        { label: 'total balance', value: String(total), c: 'c' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Each box is ', A('gas[i] − cost[i]'), '. A start works iff the tank never dips below 0 all the way around.'], state: st(0) });
    for (let i = 0; i < gas.length; i++) {
      const diff = gas[i] - cost[i];
      total += diff;
      tank += diff;
      steps.push({ tag: 'diff', trace: ['Station ', A(i), ': net ', diff >= 0 ? B(`+${diff}`) : F(diff), ' — tank at ', tank >= 0 ? A(tank) : F(tank), '.'], state: st(i) });
      if (tank < 0) {
        start = i + 1;
        tank = 0;
        steps.push({
          tag: 'restart',
          trace: ['Tank went negative — no start from ', F(start - 1 >= 0 ? `${start <= i ? start - 1 : 0}…${i}` : i), ' can survive this stretch. Restart candidacy at station ', B(start), '.'],
          state: st(i),
        });
      }
    }
    const result = total >= 0 ? start : -1;
    steps.push({
      tag: 'ret',
      trace: total >= 0
        ? ['Total balance ', B(total), ' ≥ 0, so a tour exists — and elimination left only start ', C(result), '.']
        : ['Total balance ', F(total), ' < 0 — the circuit consumes more than it provides. Return ', C('-1'), '.'],
      state: st(gas.length),
    });
    return { steps, result: String(result) };
  },
  note: 'Two facts combine: (1) if total gas ≥ total cost, some start must work; (2) if starting at s dies at i, every start in (s, i] dies there too (it enters with less fuel). So one elimination pass leaves exactly the answer.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Try every start',
    technique: 'For each station, simulate the full loop from there and return the first start that never runs dry.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {'),
        L('        int n = gas.size();', 'init'),
        L('        for (int s = 0; s < n; s++) {', 'start'),
        L('            int tank = 0, k = 0;', 'start'),
        L('            for (; k < n; k++) {', 'start'),
        L('                int i = (s + k) % n;', 'start'),
        L('                tank += gas[i] - cost[i];', 'start'),
        L('                if (tank < 0) break;', 'dry'),
        L('            }'),
        L('            if (k == n) return s;', 'ret'),
        L('        }'),
        L('        return -1;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int canCompleteCircuit(int[] gas, int[] cost) {'),
        L('        int n = gas.length;', 'init'),
        L('        for (int s = 0; s < n; s++) {', 'start'),
        L('            int tank = 0, k = 0;', 'start'),
        L('            for (; k < n; k++) {', 'start'),
        L('                int i = (s + k) % n;', 'start'),
        L('                tank += gas[i] - cost[i];', 'start'),
        L('                if (tank < 0) break;', 'dry'),
        L('            }'),
        L('            if (k == n) return s;', 'ret'),
        L('        }'),
        L('        return -1;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const gas = parseIntArray(values.gas, { min: 0, maxLen: 10 });
      if (typeof gas === 'string') return { error: gas };
      const cost = parseIntArray(values.cost, { min: 0, maxLen: 10 });
      if (typeof cost === 'string') return { error: cost };
      if (gas.length !== cost.length) return { error: 'Gas and cost must have the same length.' };
      const n = gas.length;
      const diffs = gas.map((g, i) => g - cost[i]);
      const steps: Step[] = [];
      let visited = 0;
      const st = (s: number, upto: number[], dry?: number): ArrayState => ({
        arr: diffs.map((d) => (d >= 0 ? `+${d}` : String(d))),
        ptrs: [{ name: 'start', i: s, c: 'b' }],
        mark: { ...Object.fromEntries(upto.map((i) => [i, 'good' as const])), ...(dry !== undefined ? { [dry]: 'dim' as const } : {}) },
        aggs: [{ label: 'stations simulated', value: String(visited), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Each box is gas − cost at that station. Try every start and drive the whole loop.'], state: st(0, []) });
      let result = -1;
      for (let s = 0; s < n && result < 0; s++) {
        let tank = 0;
        const path: number[] = [];
        let k = 0;
        for (; k < n; k++) {
          const i = (s + k) % n;
          tank += diffs[i];
          visited++;
          if (tank < 0) {
            steps.push({ tag: 'dry', trace: ['Start ', A(s), ': the tank goes negative (', F(tank), ') at station ', F(i), ' after ', A(k + 1), ' stop(s).'], state: st(s, path, i) });
            break;
          }
          path.push(i);
        }
        if (k === n) {
          result = s;
          steps.push({ tag: 'start', trace: ['Start ', A(s), ' completes the full loop with ', B(tank), ' gas left.'], state: st(s, path) });
        }
      }
      steps.push({ tag: 'ret', trace: result >= 0 ? ['Answer: start at station ', C(result), ' (', A(visited), ' stations simulated).'] : ['No start works — return ', C(-1), '.'], state: st(Math.max(result, 0), []) });
      return { steps, result: String(result) };
    },
    note: 'Up to n starts × n stations = O(n²). The greedy observes that if you run dry at station i, no start between the old start and i can work either, so it jumps straight past them.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 131. Hand of Straights ================= */
const handOfStraights: ProblemDef = {
  slug: 'hand-of-straights',
  title: 'Hand of Straights',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/hand-of-straights/',
  technique: 'Always start a straight at the smallest remaining card — nothing else can cover it.',
  widget: 'list',
  widgetTitle: 'Card counts & groups',
  inputs: [
    { key: 'hand', label: 'Cards', defaultValue: '1, 2, 3, 6, 2, 3, 4, 7, 8', wide: true },
    { key: 'k', label: 'Group size', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isNStraightHand(vector<int>& hand, int groupSize) {'),
      L('        if (hand.size() % groupSize != 0) return false;', 'divis'),
      L('        map<int, int> count;', 'init'),
      L('        for (int c : hand) count[c]++;', 'init'),
      L('        while (!count.empty()) {', 'loop'),
      L('            int lo = count.begin()->first;', 'lowest'),
      L('            for (int v = lo; v < lo + groupSize; v++) {', 'consume'),
      L('                if (!count.count(v))', 'gap'),
      L('                    return false;', 'gap'),
      L('                if (--count[v] == 0)', 'consume'),
      L('                    count.erase(v);', 'consume'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isNStraightHand(int[] hand, int groupSize) {'),
      L('        if (hand.length % groupSize != 0) return false;', 'divis'),
      L('        TreeMap<Integer, Integer> count = new TreeMap<>();', 'init'),
      L('        for (int c : hand) count.merge(c, 1, Integer::sum);', 'init'),
      L('        while (!count.isEmpty()) {', 'loop'),
      L('            int lo = count.firstKey();', 'lowest'),
      L('            for (int v = lo; v < lo + groupSize; v++) {', 'consume'),
      L('                if (!count.containsKey(v))', 'gap'),
      L('                    return false;', 'gap'),
      L('                if (count.merge(v, -1, Integer::sum) == 0)', 'consume'),
      L('                    count.remove(v);', 'consume'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const hand = parseIntArray(values.hand, { min: 1, maxLen: 12 });
    if (typeof hand === 'string') return { error: hand };
    const k = parseInt1(values.k, 'Group size', { min: 1, max: 6 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    const groups: number[][] = [];
    const count = new Map<number, number>();
    for (const c of hand) count.set(c, (count.get(c) ?? 0) + 1);
    const view = (activeGroup?: number[]): ListState => ({
      chains: [
        {
          label: 'remaining',
          items: [...count.entries()].sort((a, b) => a[0] - b[0]).map(([v, n]) => ({ v: `${v}×${n}` })),
          broken: true,
        },
        ...groups.map((g, i) => ({
          label: `group ${i + 1}`,
          items: g.map((v) => ({ v, mark: g === activeGroup ? ('active' as const) : ('win' as const) })),
          broken: true,
        })),
      ],
    });
    if (hand.length % k !== 0) {
      steps.push({ tag: 'divis', trace: [F(hand.length), ' cards cannot split into groups of ', F(k), ' — return ', C('false'), '.'], state: view() });
      return { steps, result: 'false', resultDetail: 'count not divisible by k' };
    }
    steps.push({ tag: 'init', trace: ['Count the cards. Repeatedly: the ', A('smallest remaining card'), ' must begin a fresh straight — nothing else can absorb it.'], state: view() });
    while (count.size > 0) {
      const lo = Math.min(...count.keys());
      const group: number[] = [];
      groups.push(group);
      steps.push({ tag: 'lowest', trace: ['Smallest remaining is ', A(lo), ' — it must start straight #', A(groups.length), ': ', A(`${lo}…${lo + k - 1}`), '.'], state: view(group) });
      for (let v = lo; v < lo + k; v++) {
        if (!count.has(v)) {
          steps.push({ tag: 'gap', trace: ['Need a ', F(v), ' to continue the straight — none left. Return ', C('false'), '.'], state: view(group) });
          return { steps, result: 'false', resultDetail: `missing ${v}` };
        }
        group.push(v);
        const left = count.get(v)! - 1;
        if (left === 0) count.delete(v);
        else count.set(v, left);
        steps.push({ tag: 'consume', trace: ['Take a ', B(v), ' into the straight (', A(left), ' copies remain).'], state: view(group) });
      }
    }
    steps.push({ tag: 'ret', trace: ['All cards consumed into ', C(groups.length), ' straights — return ', C('true'), '.'], state: view() });
    return { steps, result: 'true', resultDetail: `${groups.length} groups of ${k}` };
  },
  note: 'The smallest card is the forcing move: no straight can contain it except one that starts at it, so the greedy choice is not a heuristic but a logical necessity — if it fails, every arrangement fails.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  brute: {
    label: 'Linear removals',
    technique: 'Repeatedly take the smallest remaining card and search the list for each next card of its straight, removing them one by one.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isNStraightHand(vector<int>& hand, int k) {'),
        L('        if (hand.size() % k) return false;', 'init'),
        L('        vector<int> left = hand;', 'init'),
        L('        while (!left.empty()) {', 'group'),
        L('            int start = *min_element(left.begin(), left.end());', 'group'),
        L('            for (int v = start; v < start + k; v++) {', 'group'),
        L('                auto it = find(left.begin(), left.end(), v);  // O(n) search', 'group', 'miss'),
        L('                if (it == left.end()) return false;', 'miss'),
        L('                left.erase(it);', 'group'),
        L('            }'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isNStraightHand(int[] hand, int k) {'),
        L('        if (hand.length % k != 0) return false;', 'init'),
        L('        List<Integer> left = new ArrayList<>();', 'init'),
        L('        for (int c : hand) left.add(c);', 'init'),
        L('        while (!left.isEmpty()) {', 'group'),
        L('            int start = Collections.min(left);', 'group'),
        L('            for (int v = start; v < start + k; v++)', 'group', 'miss'),
        L('                if (!left.remove(Integer.valueOf(v))) return false;  // O(n) search', 'group', 'miss'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const hand = parseIntArray(values.hand, { min: 1, maxLen: 12 });
      if (typeof hand === 'string') return { error: hand };
      const k = parseInt1(values.k, 'Group size', { min: 1, max: 6 });
      if (typeof k === 'string') return { error: k };
      const steps: Step[] = [];
      const left = [...hand];
      const groups: number[][] = [];
      let scanned = 0;
      const view = (active: number[] = []): ListState => ({
        chains: [
          { label: 'remaining (unsorted)', items: left.map((v) => ({ v })), broken: true },
          ...groups.map((g, i) => ({ label: `group ${i + 1}`, items: g.map((v) => ({ v, mark: g === active ? ('active' as const) : ('good' as const) })), broken: true })),
        ],
        aggs: [{ label: 'cards scanned', value: String(scanned), c: 'a' }],
      });
      if (hand.length % k !== 0) {
        steps.push({ tag: 'init', trace: [F(hand.length), ' cards cannot split into groups of ', F(k), '.'], state: view() });
        return { steps, result: 'false', resultDetail: 'count not divisible by k' };
      }
      steps.push({ tag: 'init', trace: ['No sorting and no count map: search the plain list for every card we need.'], state: view() });
      while (left.length) {
        const start = Math.min(...left);
        scanned += left.length;
        const g: number[] = [];
        groups.push(g);
        for (let v = start; v < start + k; v++) {
          const idx = left.indexOf(v);
          scanned += idx < 0 ? left.length : idx + 1;
          if (idx < 0) {
            steps.push({ tag: 'miss', trace: ['Straight from ', A(start), ' needs ', F(v), ', which is not in the list — ', C('false'), '.'], state: view(g) });
            return { steps, result: 'false', resultDetail: `missing ${v}` };
          }
          left.splice(idx, 1);
          g.push(v);
        }
        steps.push({ tag: 'group', trace: ['Smallest is ', A(start), '; found and removed ', B(g.join(', ')), ' by searching the list.'], state: view(g) });
      }
      steps.push({ tag: 'ret', trace: ['Every card used — ', C('true'), ' (', A(scanned), ' cards scanned).'], state: view() });
      return { steps, result: 'true', resultDetail: `${groups.length} groups of ${k}` };
    },
    note: 'Same greedy rule (start each straight at the smallest card), but every lookup and removal is a linear scan, so it is O(n²). A sorted count map makes each lookup O(log n).',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

/* ================= 132. Merge Triplets ================= */
const mergeTriplets: ProblemDef = {
  slug: 'merge-triplets-to-form-target-triplet',
  title: 'Merge Triplets to Form Target Triplet',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/',
  technique: 'Discard any triplet that overshoots the target; the rest can only help.',
  widget: 'list',
  widgetTitle: 'Triplets & best merge',
  inputs: [
    { key: 'triplets', label: 'Triplets (a b c; …)', defaultValue: '2 5 3; 1 8 4; 1 7 5', wide: true },
    { key: 'target', label: 'Target (a b c)', defaultValue: '2 7 5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {'),
      L('        bool a = false, b = false, c = false;', 'init'),
      L('        for (auto& t : triplets) {', 'loop'),
      L('            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2])', 'reject'),
      L('                continue;', 'reject'),
      L('            if (t[0] == target[0]) a = true;', 'accept'),
      L('            if (t[1] == target[1]) b = true;', 'accept'),
      L('            if (t[2] == target[2]) c = true;', 'accept'),
      L('        }'),
      L('        return a && b && c;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean mergeTriplets(int[][] triplets, int[] target) {'),
      L('        boolean a = false, b = false, c = false;', 'init'),
      L('        for (int[] t : triplets) {', 'loop'),
      L('            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2])', 'reject'),
      L('                continue;', 'reject'),
      L('            if (t[0] == target[0]) a = true;', 'accept'),
      L('            if (t[1] == target[1]) b = true;', 'accept'),
      L('            if (t[2] == target[2]) c = true;', 'accept'),
      L('        }'),
      L('        return a && b && c;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const tripStrs = (values.triplets ?? '').split(';').map((t) => t.trim()).filter(Boolean);
    if (tripStrs.length === 0 || tripStrs.length > 8) return { error: 'Enter 1–8 triplets ("a b c; a b c").' };
    const trips: number[][] = [];
    for (const t of tripStrs) {
      const nums = t.split(/[\s,]+/).map(Number);
      if (nums.length !== 3 || nums.some((x) => !Number.isInteger(x))) return { error: `Bad triplet "${t}".` };
      trips.push(nums);
    }
    const tNums = (values.target ?? '').split(/[\s,]+/).map(Number);
    if (tNums.length !== 3 || tNums.some((x) => !Number.isInteger(x))) return { error: 'Target must be three integers.' };

    const steps: Step[] = [];
    const found = [false, false, false];
    const view = (activeIdx?: number, rejected?: Set<number>): ListState => ({
      chains: [
        ...trips.map((t, i) => ({
          label: `t${i + 1}`,
          items: t.map((v, j) => ({
            v,
            mark: rejected?.has(i) ? ('dim' as const) : i === activeIdx ? ('active' as const) : v === tNums[j] ? ('good' as const) : undefined,
          })),
          broken: true,
        })),
        { label: 'target', items: tNums.map((v, j) => ({ v, mark: found[j] ? ('final' as const) : undefined })), broken: true },
      ],
      aggs: [{ label: 'positions matched', value: found.map((f, j) => (f ? `[${j}]✓` : `[${j}]·`)).join(' '), c: 'b' }],
    });
    const rejected = new Set<number>();
    steps.push({ tag: 'init', trace: ['Merging takes coordinate-wise ', A('max'), ' — values only go up. So any triplet exceeding the target anywhere is pure poison.'], state: view() });
    trips.forEach((t, i) => {
      if (t[0] > tNums[0] || t[1] > tNums[1] || t[2] > tNums[2]) {
        rejected.add(i);
        steps.push({ tag: 'reject', trace: ['Triplet ', F(`[${t.join(',')}]`), ' overshoots the target in some position — using it can never be undone. Discard.'], state: view(i, rejected) });
      } else {
        const hits: number[] = [];
        for (let j = 0; j < 3; j++) {
          if (t[j] === tNums[j]) {
            found[j] = true;
            hits.push(j);
          }
        }
        steps.push({
          tag: 'accept',
          trace: ['Triplet ', B(`[${t.join(',')}]`), ' is safe', hits.length ? [' — it supplies target position(s) '].join('') : ' but supplies no exact coordinate.', hits.length ? B(hits.join(', ')) : '', hits.length ? '.' : ''],
          state: view(i, rejected),
        });
      }
    });
    const ok = found.every(Boolean);
    steps.push({
      tag: 'ret',
      trace: ok
        ? ['Safe triplets cover all three coordinates — merging exactly those gives the target: ', C('true'), '.']
        : ['Position(s) ', F(found.map((f, j) => (!f ? j : null)).filter((x) => x !== null).join(', ')), ' can never be hit — return ', C('false'), '.'],
      state: view(undefined, rejected),
    });
    return { steps, result: String(ok) };
  },
  note: 'Max-merging is monotone: adding a safe triplet never breaks anything, so the only question is coverage — does some safe triplet achieve each target coordinate exactly? Three booleans replace any search over subsets.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Try every subset',
    technique: 'For every subset of triplets, take the element-wise max and check whether it equals the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool mergeTriplets(vector<vector<int>>& t, vector<int>& target) {'),
        L('        int n = t.size();', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try'),
        L('            vector<int> m = {0, 0, 0};', 'try'),
        L('            for (int i = 0; i < n; i++)', 'try'),
        L('                if (mask >> i & 1)', 'try'),
        L('                    for (int k = 0; k < 3; k++) m[k] = max(m[k], t[i][k]);', 'try'),
        L('            if (m == target) return true;', 'hit'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean mergeTriplets(int[][] t, int[] target) {'),
        L('        int n = t.length;', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try'),
        L('            int[] m = new int[3];', 'try'),
        L('            for (int i = 0; i < n; i++)', 'try'),
        L('                if ((mask >> i & 1) == 1)', 'try'),
        L('                    for (int k = 0; k < 3; k++) m[k] = Math.max(m[k], t[i][k]);', 'try'),
        L('            if (Arrays.equals(m, target)) return true;', 'hit'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const tripStrs = (values.triplets ?? '').split(';').map((t) => t.trim()).filter(Boolean);
      if (tripStrs.length === 0 || tripStrs.length > 8) return { error: 'Enter 1–8 triplets ("a b c; a b c").' };
      const trips: number[][] = [];
      for (const t of tripStrs) {
        const nums = t.split(/[\s,]+/).map(Number);
        if (nums.length !== 3 || nums.some((x) => !Number.isInteger(x))) return { error: `Bad triplet "${t}".` };
        trips.push(nums);
      }
      const target = (values.target ?? '').split(/[\s,]+/).map(Number);
      if (target.length !== 3 || target.some((x) => !Number.isInteger(x))) return { error: 'Target must be three integers.' };
      const n = trips.length;
      const steps: Step[] = [];
      const view = (mask: number, m: number[] | null): ListState => ({
        chains: [
          ...trips.map((t, i) => ({ label: `triplet ${i + 1}`, items: t.map((v) => ({ v, mark: mask >> i & 1 ? ('active' as const) : undefined })), broken: true })),
          { label: 'element-wise max', items: (m ?? ['·', '·', '·']).map((v, k) => ({ v, mark: m && v === target[k] ? ('good' as const) : undefined })), broken: true },
          { label: 'target', items: target.map((v) => ({ v, mark: 'win' as const })), broken: true },
        ],
      });
      steps.push({ tag: 'init', trace: ['Try all ', A(2 ** n - 1), ' non-empty subsets of triplets.'], state: view(0, null) });
      let ok = false;
      for (let mask = 1; mask < 1 << n; mask++) {
        const m = [0, 0, 0];
        for (let i = 0; i < n; i++) if (mask >> i & 1) for (let k = 0; k < 3; k++) m[k] = Math.max(m[k], trips[i][k]);
        const hit = m.every((v, k) => v === target[k]);
        if (hit || steps.length < 30) steps.push({ tag: hit ? 'hit' : 'try', trace: ['Subset {', A([...Array(n)].map((_, i) => (mask >> i & 1 ? i + 1 : 0)).filter(Boolean).join(', ')), '} merges to [', hit ? B(m.join(', ')) : F(m.join(', ')), ']', hit ? ' — equals the target!' : '.'], state: view(mask, m) });
        if (hit) {
          ok = true;
          break;
        }
      }
      steps.push({ tag: 'ret', trace: ['Answer: ', C(String(ok)), '.'], state: view(0, null) });
      return { steps, result: String(ok) };
    },
    note: 'Exponential in the number of triplets. The greedy notices that any triplet not exceeding the target in any coordinate can safely be merged, so one pass over the triplets decides it.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(1)' },
  },
};

/* ================= 133. Partition Labels ================= */
const partitionLabels: ProblemDef = {
  slug: 'partition-labels',
  title: 'Partition Labels',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/partition-labels/',
  technique: 'Extend each chunk to the last occurrence of every letter inside it; cut when the scan catches up.',
  widget: 'array',
  widgetTitle: 'String & chunk boundary',
  inputs: [{ key: 's', label: 'String', defaultValue: 'ababcbacadefegdehijhklij', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> partitionLabels(string s) {'),
      L('        int last[26];', 'init'),
      L('        for (int i = 0; i < s.size(); i++)', 'init'),
      L('            last[s[i] - \'a\'] = i;', 'init'),
      L('        vector<int> res;', 'init'),
      L('        int end = 0, start = 0;', 'init'),
      L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
      L('            end = max(end, last[s[i] - \'a\']);', 'extend'),
      L('            if (i == end) {', 'cut'),
      L('                res.push_back(i - start + 1);', 'cut'),
      L('                start = i + 1;', 'cut'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> partitionLabels(String s) {'),
      L('        int[] last = new int[26];', 'init'),
      L('        for (int i = 0; i < s.length(); i++)', 'init'),
      L('            last[s.charAt(i) - \'a\'] = i;', 'init'),
      L('        List<Integer> res = new ArrayList<>();', 'init'),
      L('        int end = 0, start = 0;', 'init'),
      L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
      L('            end = Math.max(end, last[s.charAt(i) - \'a\']);', 'extend'),
      L('            if (i == end) {', 'cut'),
      L('                res.add(i - start + 1);', 'cut'),
      L('                start = i + 1;', 'cut'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,24}$/.test(s)) return { error: 'Lowercase letters, ≤ 24 characters.' };
    const chars = s.split('');
    const last = new Map<string, number>();
    chars.forEach((c, i) => last.set(c, i));
    const steps: Step[] = [];
    const res: number[] = [];
    let end = 0;
    let start = 0;
    const cuts: number[] = [];
    const st = (i: number): ArrayState => ({
      arr: chars,
      window: [start, Math.min(end, chars.length - 1)],
      ptrs: i < chars.length ? [{ name: 'i', i, c: 'a' }, { name: 'end', i: Math.min(end, chars.length - 1), c: 'c' }] : [],
      mark: Object.fromEntries(cuts.map((c2) => [c2, 'good'])),
      aggs: [{ label: 'sizes', value: `[${res.join(', ')}]`, c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Precompute each letter\'s ', A('last occurrence'), '. A chunk can close only when no letter inside it appears again later.'], state: st(0) });
    for (let i = 0; i < chars.length; i++) {
      const li = last.get(chars[i])!;
      if (li > end) {
        end = li;
        steps.push({ tag: 'extend', trace: ["'", A(chars[i]), "' reappears at ", A(li), ' — the chunk must stretch at least that far.'], state: st(i) });
      } else {
        steps.push({ tag: 'extend', trace: ["'", A(chars[i]), "' finishes by ", A(end), ' — boundary unchanged.'], state: st(i) });
      }
      if (i === end) {
        res.push(i - start + 1);
        cuts.push(i);
        steps.push({ tag: 'cut', trace: ['The scan caught the boundary at ', B(i), ' — cut! Chunk "', B(s.slice(start, i + 1)), '" has size ', C(i - start + 1), '.'], state: st(i) });
        start = i + 1;
        end = i + 1 <= chars.length - 1 ? end : end;
      }
    }
    steps.push({ tag: 'ret', trace: ['Partition sizes: ', C(`[${res.join(', ')}]`), '.'], state: st(chars.length) });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} chunks` };
  },
  note: 'Every letter drags its chunk boundary to its own last occurrence — the running max of those is the earliest legal cut. When the scan index reaches it, nothing inside leaks rightward, so cutting there is both safe and greedy-minimal.',
  complexity: { time: 'O(n)', space: 'O(26)' },
  brute: {
    label: 'Rescan for last occurrences',
    technique: 'Grow each chunk, and for every character inside it search the rest of the string for its last occurrence.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> partitionLabels(string s) {'),
        L('        vector<int> res; int start = 0;', 'init'),
        L('        while (start < s.size()) {', 'chunk'),
        L('            int end = start;', 'chunk'),
        L('            for (int i = start; i <= end; i++)', 'extend'),
        L('                end = max(end, (int) s.find_last_of(s[i]));  // O(n) search', 'extend'),
        L('            res.push_back(end - start + 1);', 'cut'),
        L('            start = end + 1;', 'cut'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> partitionLabels(String s) {'),
        L('        List<Integer> res = new ArrayList<>(); int start = 0;', 'init'),
        L('        while (start < s.length()) {', 'chunk'),
        L('            int end = start;', 'chunk'),
        L('            for (int i = start; i <= end; i++)', 'extend'),
        L('                end = Math.max(end, s.lastIndexOf(s.charAt(i)));  // O(n) search', 'extend'),
        L('            res.add(end - start + 1);', 'cut'),
        L('            start = end + 1;', 'cut'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,24}$/.test(s)) return { error: 'Lowercase letters, ≤ 24 characters.' };
      const chars = s.split('');
      const steps: Step[] = [];
      const res: number[] = [];
      let searches = 0;
      const st = (start: number, end: number, i?: number): ArrayState => ({
        arr: chars,
        window: [start, end],
        ptrs: i !== undefined ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [
          { label: 'chunks', value: `[${res.join(', ')}]`, c: 'c' },
          { label: 'characters searched', value: String(searches), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No precomputed "last index" table: each time, search the string again.'], state: st(0, 0) });
      let start = 0;
      while (start < chars.length) {
        let end = start;
        steps.push({ tag: 'chunk', trace: ['New chunk at ', A(start), '.'], state: st(start, end) });
        for (let i = start; i <= end; i++) {
          const last = s.lastIndexOf(chars[i]);
          searches += chars.length - last;
          if (last > end) {
            end = last;
            steps.push({ tag: 'extend', trace: ["'", A(chars[i]), "' last appears at ", B(last), ' — the chunk must reach at least there.'], state: st(start, end, i) });
          }
        }
        res.push(end - start + 1);
        steps.push({ tag: 'cut', trace: ['Every letter in [', A(start), '..', A(end), '] ends inside it — cut. Size ', B(end - start + 1), '.'], state: st(start, end) });
        start = end + 1;
      }
      steps.push({ tag: 'ret', trace: ['Chunk sizes: ', C(`[${res.join(', ')}]`), '.'], state: st(0, chars.length - 1) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} chunks` };
    },
    note: 'Each character triggers a search to the end of the string, so the worst case is O(n²). Recording every letter’s last index in one pass first makes each lookup O(1).',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 134. Valid Parenthesis String ================= */
const validParenString: ProblemDef = {
  slug: 'valid-parenthesis-string',
  title: 'Valid Parenthesis String',
  category: 'Greedy',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/valid-parenthesis-string/',
  technique: 'Track a range [lo, hi] of possible open-bracket counts — "*" widens it both ways.',
  widget: 'array',
  widgetTitle: 'String & open-count range',
  inputs: [{ key: 's', label: 'String of ( ) *', defaultValue: '(*))' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool checkValidString(string s) {'),
      L('        int lo = 0, hi = 0;', 'init'),
      L('        for (char c : s) {', 'loop'),
      L('            if (c == \'(\') { lo++; hi++; }', 'open'),
      L('            else if (c == \')\') { lo--; hi--; }', 'closep'),
      L('            else { lo--; hi++; }', 'star'),
      L('            if (hi < 0)', 'dead'),
      L('                return false;', 'dead'),
      L('            lo = max(lo, 0);', 'clamp'),
      L('        }'),
      L('        return lo == 0;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean checkValidString(String s) {'),
      L('        int lo = 0, hi = 0;', 'init'),
      L('        for (char c : s.toCharArray()) {', 'loop'),
      L('            if (c == \'(\') { lo++; hi++; }', 'open'),
      L('            else if (c == \')\') { lo--; hi--; }', 'closep'),
      L('            else { lo--; hi++; }', 'star'),
      L('            if (hi < 0)', 'dead'),
      L('                return false;', 'dead'),
      L('            lo = Math.max(lo, 0);', 'clamp'),
      L('        }'),
      L('        return lo == 0;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^[()*]{1,16}$/.test(s)) return { error: 'Only ( ) * characters, 1–16.' };
    const chars = s.split('');
    const steps: Step[] = [];
    let lo = 0;
    let hi = 0;
    const st = (i: number): ArrayState => ({
      arr: chars,
      ptrs: i < chars.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'possible open count', value: `[${lo} … ${hi}]`, c: 'a' }],
    });
    steps.push({ tag: 'init', trace: ['Each "*" is three-way ambiguous — instead of branching, track the whole ', A('interval of possible open counts'), ', starting at [0, 0].'], state: st(0) });
    let ok = true;
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === '(') {
        lo++;
        hi++;
        steps.push({ tag: 'open', trace: ["'", A('('), "' — both bounds rise: [", A(lo), ', ', A(hi), '].'], state: st(i) });
      } else if (c === ')') {
        lo--;
        hi--;
        steps.push({ tag: 'closep', trace: ["'", A(')'), "' — both bounds fall: [", A(lo), ', ', A(hi), '].'], state: st(i) });
      } else {
        lo--;
        hi++;
        steps.push({ tag: 'star', trace: ["'", A('*'), "' could be (, ) or empty — the interval widens: [", A(lo), ', ', A(hi), '].'], state: st(i) });
      }
      if (hi < 0) {
        ok = false;
        steps.push({ tag: 'dead', trace: ['Even treating every * as "(" leaves more ) than ( — irrecoverable. Return ', C('false'), '.'], state: st(i) });
        break;
      }
      if (lo < 0) {
        lo = 0;
        steps.push({ tag: 'clamp', trace: ['Clamp lo to ', A(0), ' — an open count can\'t be negative in any valid reading.'], state: st(i) });
      }
    }
    if (ok) {
      const result = lo === 0;
      steps.push({
        tag: 'ret',
        trace: result
          ? ['Zero lies inside the final interval — some assignment of *s balances perfectly. Return ', C('true'), '.']
          : ['The minimum possible open count is ', F(lo), ' > 0 — unmatched "(" remain in every reading. Return ', C('false'), '.'],
        state: st(chars.length),
      });
      return { steps, result: String(result) };
    }
    return { steps, result: 'false' };
  },
  note: 'The set of achievable open-counts is always a contiguous interval (each character shifts or widens it by 1), so two integers represent every possible interpretation of the wildcards simultaneously — no backtracking, no 3ⁿ branches.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Set of balances',
    technique: 'Carry the full set of open-bracket counts that are still possible; "*" branches into three counts.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool checkValidString(string s) {'),
        L('        set<int> can = {0};', 'init'),
        L('        for (char c : s) {', 'step'),
        L('            set<int> next;', 'step'),
        L('            for (int b : can) {', 'step'),
        L('                if (c != \')\') next.insert(b + 1);           // ( or * as (', 'step'),
        L('                if (c != \'(\' && b > 0) next.insert(b - 1);  // ) or * as )', 'step'),
        L('                if (c == \'*\') next.insert(b);               // * as empty', 'step'),
        L('            }'),
        L('            can = next;', 'step'),
        L('        }'),
        L('        return can.count(0);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean checkValidString(String s) {'),
        L('        Set<Integer> can = new HashSet<>(Set.of(0));', 'init'),
        L('        for (char c : s.toCharArray()) {', 'step'),
        L('            Set<Integer> next = new HashSet<>();', 'step'),
        L('            for (int b : can) {', 'step'),
        L('                if (c != \')\') next.add(b + 1);', 'step'),
        L('                if (c != \'(\' && b > 0) next.add(b - 1);', 'step'),
        L('                if (c == \'*\') next.add(b);', 'step'),
        L('            }'),
        L('            can = next;', 'step'),
        L('        }'),
        L('        return can.contains(0);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      if (!/^[()*]{1,16}$/.test(s)) return { error: 'Only ( ) * characters, 1–16.' };
      const chars = s.split('');
      const steps: Step[] = [];
      let can = new Set<number>([0]);
      const st = (i: number | null): ArrayState => ({
        arr: chars,
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [{ label: 'possible open counts', value: can.size ? `{ ${[...can].sort((a, b) => a - b).join(', ')} }` : '∅', c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Before reading anything, the only possible open count is ', B(0), '.'], state: st(null) });
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        const next = new Set<number>();
        for (const b of can) {
          if (c !== ')') next.add(b + 1);
          if (c !== '(' && b > 0) next.add(b - 1);
          if (c === '*') next.add(b);
        }
        can = next;
        steps.push({ tag: 'step', trace: ["'", A(c), "' → possible counts ", can.size ? B(`{ ${[...can].sort((a, b) => a - b).join(', ')} }`) : F('∅ (no way to stay valid)'), '.'], state: st(i) });
        if (!can.size) break;
      }
      const ok = can.has(0);
      steps.push({ tag: 'ret', trace: ['A count of 0 is ', ok ? B('possible') : F('not possible'), ' at the end — return ', C(String(ok)), '.'], state: st(null) });
      return { steps, result: String(ok) };
    },
    note: 'Tracking every possible balance is O(n²) in the worst case. Those balances always form a contiguous range, so storing just its two ends (lo and hi) gives the same answer in O(1) space.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

export const greedy = [maxSubarray, jumpGame, jumpGameII, gasStation, handOfStraights, mergeTriplets, partitionLabels, validParenString];
