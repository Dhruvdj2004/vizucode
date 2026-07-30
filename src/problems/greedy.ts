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
};

export const greedy = [maxSubarray, jumpGame, jumpGameII, gasStation, handOfStraights, mergeTriplets, partitionLabels, validParenString];
