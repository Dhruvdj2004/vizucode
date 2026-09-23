// Dynamic Programming, part 3 — grids, knapsack variants and subsequence chains.
import type { ArrayState, MatrixState, ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1, parseIntArray, parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';
import { callsView } from './dp1';
import { callGrid } from './dp2';

const MAX_STEPS = 320;

function numGrid(s: string, maxR = 6, maxC = 6): number[][] | string {
  const rows = (s ?? '')
    .split(/[;|]/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => (r.includes(',') ? r.split(/[,\s]+/).filter(Boolean) : r.split('')).map(Number));
  if (rows.length === 0) return 'Enter a grid, rows separated by ";".';
  const w = rows[0].length;
  if (!rows.every((r) => r.length === w)) return 'All rows must be the same length.';
  if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return 'All entries must be numbers.';
  if (rows.length > maxR || w > maxC) return `Keep the grid to at most ${maxR}×${maxC}.`;
  return rows;
}

/* ================= Min Cost Climbing Stairs ================= */
const minCostClimbing: ProblemDef = {
  slug: 'min-cost-climbing-stairs',
  title: 'Min Cost Climbing Stairs',
  category: 'Dynamic Programming',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
  technique: 'dp[i] = cheapest way to stand on step i, reachable from one or two steps below.',
  widget: 'array',
  widgetTitle: 'Step costs & cheapest arrival',
  inputs: [{ key: 'cost', label: 'Cost per step', defaultValue: '10, 15, 20', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minCostClimbingStairs(vector<int>& cost) {'),
      L('        int n = cost.size();'),
      L('        vector<int> dp(n + 1, 0);', 'base'),
      L('        for (int i = 2; i <= n; i++)', 'loop'),
      L('            dp[i] = min(dp[i-1] + cost[i-1],', 'pick'),
      L('                        dp[i-2] + cost[i-2]);', 'pick'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minCostClimbingStairs(int[] cost) {'),
      L('        int n = cost.length;'),
      L('        int[] dp = new int[n + 1];', 'base'),
      L('        for (int i = 2; i <= n; i++)', 'loop'),
      L('            dp[i] = Math.min(dp[i-1] + cost[i-1],', 'pick'),
      L('                             dp[i-2] + cost[i-2]);', 'pick'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const cost = parseIntArray(values.cost, { min: 0, maxLen: 12 });
    if (typeof cost === 'string') return { error: cost };
    if (cost.length < 2) return { error: 'Give at least two steps.' };
    const n = cost.length;
    const dp = [...Array(n + 1)].map(() => 0);
    const steps: Step[] = [];
    const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: cost,
      mark,
      ptrs: i < n ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'cheapest way to reach step', value: dp.map((v, k) => `${k}:${v}`).join('  '), c: 'b' }],
    });
    steps.push({
      tag: 'base',
      trace: [
        'You may start at step ', A(0), ' or step ', A(1), ' for free, so both cost ', B(0), ' to reach. The "top" is one past the last step.',
      ],
      state: st(n),
    });
    for (let i = 2; i <= n; i++) {
      const viaOne = dp[i - 1] + cost[i - 1];
      const viaTwo = dp[i - 2] + cost[i - 2];
      dp[i] = Math.min(viaOne, viaTwo);
      steps.push({
        tag: 'pick',
        trace: [
          'To stand at position ', A(i), ': step up from ', A(i - 1), ' paying ', A(`${dp[i - 1]}+${cost[i - 1]}=${viaOne}`), ', or leap from ', A(i - 2),
          ' paying ', A(`${dp[i - 2]}+${cost[i - 2]}=${viaTwo}`), '. Cheapest is ', B(dp[i]), '.',
        ],
        state: st(Math.min(i, n - 1), { [i - 1]: 'active', [i - 2]: 'active' }),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Cheapest way to get past the last step: ', C(dp[n]), '.'],
      state: st(n, Object.fromEntries(cost.map((_, i) => [i, 'final' as const]))),
    });
    return { steps, result: String(dp[n]) };
  },
  note: 'You pay when you leave a step, not when you land on it, which is why dp[0] and dp[1] are both zero and cost[i] is added on the way out. Only the last two values ever matter, so the array collapses to two variables and O(1) space.',
  complexity: { time: 'O(n)', space: 'O(n), reducible to O(1)' },
  brute: {
    label: 'Plain recursion',
    technique: 'cost(i) = cost[i] + min(cost(i+1), cost(i+2)), recursed without remembering answers.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minCostClimbingStairs(vector<int>& cost) {'),
        L('        return min(from(cost, 0), from(cost, 1));', 'init', 'ret'),
        L('    }'),
        L('    int from(vector<int>& cost, int i) {'),
        L('        if (i >= cost.size()) return 0;', 'base'),
        L('        return cost[i] + min(from(cost, i + 1), from(cost, i + 2));', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minCostClimbingStairs(int[] cost) {'),
        L('        return Math.min(from(cost, 0), from(cost, 1));', 'init', 'ret'),
        L('    }'),
        L('    private int from(int[] cost, int i) {'),
        L('        if (i >= cost.length) return 0;', 'base'),
        L('        return cost[i] + Math.min(from(cost, i + 1), from(cost, i + 2));', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const cost = parseIntArray(values.cost, { min: 0, maxLen: 12 });
      if (typeof cost === 'string') return { error: cost };
      if (cost.length < 2) return { error: 'Give at least two steps.' };
      const n = cost.length;
      const calls = Array(n).fill(0);
      let total = 0;
      const steps: Step[] = [];
      const view = (a: number | null) => callsView(cost, calls, a, total);
      steps.push({ tag: 'init', trace: ['from(i) = cheapest way to the top starting on step i. Each box counts how often it is recomputed.'], state: view(null) });
      const from = (i: number): number => {
        total++;
        if (i >= n) return 0;
        calls[i]++;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['from(', A(i), ') = ', A(cost[i]), ' + min(from(', A(i + 1), '), from(', A(i + 2), ')).'], state: view(i) });
        return cost[i] + Math.min(from(i + 1), from(i + 2));
      };
      const res = Math.min(from(0), from(1));
      steps.push({ tag: 'ret', trace: ['Cheapest: ', C(res), ' — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Each step branches into two, so the call tree grows exponentially while there are only n distinct subproblems. The DP computes each step’s cheapest cost once.',
    complexity: { time: 'O(1.6ⁿ)', space: 'O(n) stack' },
  },
};

/* ================= Unique Paths II ================= */
const uniquePathsII: ProblemDef = {
  slug: 'unique-paths-ii',
  title: 'Unique Paths II',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/unique-paths-ii/',
  technique: 'Paths into a cell = paths from above + paths from the left; an obstacle contributes zero.',
  widget: 'matrix',
  widgetTitle: 'Path counts (obstacles marked ▓)',
  inputs: [{ key: 'grid', label: 'Grid (1 = obstacle, rows ";" separated)', defaultValue: '0,0,0;0,1,0;0,0,0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int uniquePathsWithObstacles(vector<vector<int>>& g) {'),
      L('        int R = g.size(), C = g[0].size();'),
      L('        vector<vector<int>> dp(R, vector<int>(C, 0));'),
      L('        for (int r = 0; r < R; r++)', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (g[r][c] == 1) { dp[r][c] = 0; continue; }', 'blocked'),
      L('                if (r == 0 && c == 0) { dp[r][c] = 1; continue; }', 'start'),
      L('                dp[r][c] = (r ? dp[r-1][c] : 0)', 'sum'),
      L('                         + (c ? dp[r][c-1] : 0);', 'sum'),
      L('            }'),
      L('        return dp[R-1][C-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int uniquePathsWithObstacles(int[][] g) {'),
      L('        int R = g.length, C = g[0].length;'),
      L('        int[][] dp = new int[R][C];'),
      L('        for (int r = 0; r < R; r++)', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (g[r][c] == 1) { dp[r][c] = 0; continue; }', 'blocked'),
      L('                if (r == 0 && c == 0) { dp[r][c] = 1; continue; }', 'start'),
      L('                dp[r][c] = (r > 0 ? dp[r-1][c] : 0)', 'sum'),
      L('                         + (c > 0 ? dp[r][c-1] : 0);', 'sum'),
      L('            }'),
      L('        return dp[R-1][C-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = numGrid(values.grid, 5, 5);
    if (typeof g === 'string') return { error: g };
    if (!g.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 (free) and 1 (obstacle).' };
    const R = g.length;
    const Cn = g[0].length;
    const dp = g.map((r) => r.map(() => 0));
    const steps: Step[] = [];
    const filled = new Set<string>();
    const view = (r?: number, c?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row, rr) => row.map((v, cc) => (g[rr][cc] === 1 ? '▓' : filled.has(`${rr},${cc}`) ? v : '·'))),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(r !== undefined && c !== undefined ? { [`${r},${c}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'loop',
      trace: ['Every path moves only ', A('right'), ' or ', A('down'), ', so a cell is reached exactly from the cell above it and the one to its left.'],
      state: view(),
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        filled.add(`${r},${c}`);
        if (g[r][c] === 1) {
          dp[r][c] = 0;
          steps.push({
            tag: 'blocked',
            trace: ['(', F(r), ',', F(c), ') is an obstacle — ', F(0), ' paths go through it, which automatically blocks everything downstream.'],
            state: view(r, c),
          });
        } else if (r === 0 && c === 0) {
          dp[r][c] = 1;
          steps.push({ tag: 'start', trace: ['The start cell has exactly ', B(1), ' path — doing nothing.'], state: view(r, c) });
        } else {
          const up = r > 0 ? dp[r - 1][c] : 0;
          const left = c > 0 ? dp[r][c - 1] : 0;
          dp[r][c] = up + left;
          const src = [...(r > 0 ? [`${r - 1},${c}`] : []), ...(c > 0 ? [`${r},${c - 1}`] : [])];
          steps.push({
            tag: 'sum',
            trace: ['(', A(r), ',', A(c), ') = from above ', A(up), ' + from the left ', A(left), ' = ', B(dp[r][c]), '.'],
            state: view(r, c, src),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Distinct paths to the bottom-right: ', C(dp[R - 1][Cn - 1]), '.'],
      state: { ...view(), mark: { [`${R - 1},${Cn - 1}`]: 'final' } },
    });
    return { steps, result: String(dp[R - 1][Cn - 1]) };
  },
  note: 'Setting an obstacle to zero rather than special-casing its neighbours is what keeps the recurrence uniform — the zero propagates naturally. Watch the first row and column: an obstacle there blocks everything after it, which the plain combinatorial formula for the obstacle-free version cannot express.',
  complexity: { time: 'O(R·C)', space: 'O(R·C), reducible to O(C)' },
  brute: {
    label: 'Plain recursion',
    technique: 'paths(r, c) = paths(r+1, c) + paths(r, c+1), returning 0 on obstacles, with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int uniquePathsWithObstacles(vector<vector<int>>& g) { return paths(g, 0, 0); }', 'init', 'ret'),
        L('    int paths(vector<vector<int>>& g, int r, int c) {'),
        L('        if (r == g.size() || c == g[0].size() || g[r][c] == 1) return 0;', 'block'),
        L('        if (r == g.size() - 1 && c == g[0].size() - 1) return 1;', 'base'),
        L('        return paths(g, r + 1, c) + paths(g, r, c + 1);', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int uniquePathsWithObstacles(int[][] g) { return paths(g, 0, 0); }', 'init', 'ret'),
        L('    private int paths(int[][] g, int r, int c) {'),
        L('        if (r == g.length || c == g[0].length || g[r][c] == 1) return 0;', 'block'),
        L('        if (r == g.length - 1 && c == g[0].length - 1) return 1;', 'base'),
        L('        return paths(g, r + 1, c) + paths(g, r, c + 1);', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = numGrid(values.grid, 5, 5);
      if (typeof g === 'string') return { error: g };
      if (!g.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 (free) and 1 (obstacle).' };
      const R = g.length;
      const Cn = g[0].length;
      const calls = [...Array(R)].map(() => Array(Cn).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => {
        const v = callGrid(calls, [...Array(R)].map((_, i) => i), [...Array(Cn)].map((_, i) => i), act, total);
        g.forEach((row, r) => row.forEach((x, c) => { if (x === 1) { v.grid[r][c] = '▓'; v.mark![`${r},${c}`] = 'dim'; } }));
        return v;
      };
      steps.push({ tag: 'init', trace: ['Cell (r, c) counts how many times the number of paths from it is recomputed. ▓ = obstacle.'], state: view(null) });
      const paths = (r: number, c: number): number => {
        total++;
        if (r === R || c === Cn || g[r][c] === 1) return 0;
        calls[r][c]++;
        if (r === R - 1 && c === Cn - 1) return 1;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['paths(', A(r), ',', A(c), ') = paths below + paths to the right.'], state: view([r, c]) });
        return paths(r + 1, c) + paths(r, c + 1);
      };
      const res = paths(0, 0);
      steps.push({ tag: 'ret', trace: [C(res), ' path(s) — found with ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'The recursion walks every single path, so its cost is the number of paths — exponential in the grid size. The DP adds each cell’s two neighbours once.',
    complexity: { time: 'O(2^(R+C))', space: 'O(R + C) stack' },
  },
};

/* ================= Triangle ================= */
const triangle: ProblemDef = {
  slug: 'triangle',
  title: 'Triangle',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/triangle/',
  technique: 'Work bottom-up: each cell takes the cheaper of the two cells directly below it.',
  widget: 'matrix',
  widgetTitle: 'Triangle with best-from-here totals',
  inputs: [{ key: 'rows', label: 'Triangle rows (";" separated)', defaultValue: '2; 3,4; 6,5,7; 4,1,8,3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minimumTotal(vector<vector<int>>& t) {'),
      L('        int n = t.size();'),
      L('        vector<int> dp = t[n-1];', 'base'),
      L('        for (int r = n - 2; r >= 0; r--)', 'row'),
      L('            for (int c = 0; c <= r; c++)', 'cell'),
      L('                dp[c] = t[r][c] + min(dp[c], dp[c+1]);', 'pick'),
      L('        return dp[0];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minimumTotal(List<List<Integer>> t) {'),
      L('        int n = t.size();'),
      L('        int[] dp = new int[n];'),
      L('        for (int c = 0; c < n; c++) dp[c] = t.get(n-1).get(c);', 'base'),
      L('        for (int r = n - 2; r >= 0; r--)', 'row'),
      L('            for (int c = 0; c <= r; c++)', 'cell'),
      L('                dp[c] = t.get(r).get(c) + Math.min(dp[c], dp[c+1]);', 'pick'),
      L('        return dp[0];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.rows ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
    if (rows.length === 0) return { error: 'Enter triangle rows, e.g. "2; 3,4; 6,5,7".' };
    if (rows.length > 6) return { error: 'Keep it to at most 6 rows.' };
    if (rows.some((r, i) => r.length !== i + 1)) return { error: 'Row i must have exactly i+1 numbers (1, 2, 3, …).' };
    if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'All entries must be numbers.' };

    const n = rows.length;
    const dp = [...rows[n - 1]];
    const steps: Step[] = [];
    const view = (r: number, c?: number, src: string[] = []): MatrixState => ({
      grid: [...Array(n)].map((_, rr) =>
        [...Array(n)].map((_, cc) => {
          if (cc > rr) return '';
          if (rr > r) return rows[rr][cc];
          if (rr === r || (rr === n - 1 && r === n - 1)) return `${rows[rr][cc]}→${rr === r ? dp[cc] : rows[rr][cc]}`;
          return rows[rr][cc];
        })
      ),
      rowLabels: [...Array(n)].map((_, i) => `row ${i}`),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(c !== undefined ? { [`${r},${c}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'best-from-here (current row)', value: dp.slice(0, r + 1).join(', '), c: 'b' }],
    });
    steps.push({
      tag: 'base',
      trace: [
        'Going ', A('bottom-up'), ' avoids tracking which cells are reachable — from a bottom cell, the best total is just the cell itself.',
      ],
      state: view(n - 1),
    });
    for (let r = n - 2; r >= 0; r--) {
      for (let c = 0; c <= r; c++) {
        const below = dp[c];
        const belowRight = dp[c + 1];
        dp[c] = rows[r][c] + Math.min(below, belowRight);
        steps.push({
          tag: 'pick',
          trace: [
            'Cell (', A(r), ',', A(c), ') = ', A(rows[r][c]), ' + min(below ', A(below), ', below-right ', A(belowRight), ') = ', B(dp[c]), '.',
          ],
          state: view(r, c, [`${r + 1},${c}`, `${r + 1},${c + 1}`]),
        });
        if (steps.length > MAX_STEPS) break;
      }
      steps.push({ tag: 'row', trace: ['Row ', B(r), ' now holds the best total from each of its cells: ', B(dp.slice(0, r + 1).join(', ')), '.'], state: view(r) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Minimum path sum from apex to base: ', C(dp[0]), '.'],
      state: { ...view(0), mark: { '0,0': 'final' } },
    });
    return { steps, result: String(dp[0]) };
  },
  note: 'Top-down would need to ask "which cells can reach the bottom?" at every step; bottom-up removes that question entirely, since every base cell is trivially an endpoint. Writing dp[c] in place is safe because dp[c] and dp[c+1] are both read before either is overwritten in this row.',
  complexity: { time: 'O(n²)', space: 'O(n)' },
  brute: {
    label: 'Plain recursion',
    technique: 'best(r, c) = tri[r][c] + min(best(r+1, c), best(r+1, c+1)), recursed from the apex with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minimumTotal(vector<vector<int>>& t) { return best(t, 0, 0); }', 'init', 'ret'),
        L('    int best(vector<vector<int>>& t, int r, int c) {'),
        L('        if (r == t.size() - 1) return t[r][c];', 'base'),
        L('        return t[r][c] + min(best(t, r + 1, c), best(t, r + 1, c + 1));', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minimumTotal(List<List<Integer>> t) { return best(t, 0, 0); }', 'init', 'ret'),
        L('    private int best(List<List<Integer>> t, int r, int c) {'),
        L('        if (r == t.size() - 1) return t.get(r).get(c);', 'base'),
        L('        return t.get(r).get(c) + Math.min(best(t, r + 1, c), best(t, r + 1, c + 1));', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const rows = (values.rows ?? '')
        .split(/[;|]/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
      if (rows.length === 0) return { error: 'Enter triangle rows, e.g. "2; 3,4; 6,5,7".' };
      if (rows.length > 6) return { error: 'Keep it to at most 6 rows.' };
      if (rows.some((r, i) => r.length !== i + 1)) return { error: 'Row i must have exactly i+1 numbers (1, 2, 3, …).' };
      if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'All entries must be numbers.' };
      const n = rows.length;
      const calls = [...Array(n)].map(() => Array(n).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => {
        const v = callGrid(calls, [...Array(n)].map((_, i) => i), [...Array(n)].map((_, i) => i), act, total);
        v.grid = v.grid.map((row, r) => row.map((x, c) => (c <= r ? `${rows[r][c]} ${x}`.trim() : '')));
        return v;
      };
      steps.push({ tag: 'init', trace: ['Each cell shows ', A('value ×times solved'), '. Interior cells are reached from two parents, so they get solved repeatedly.'], state: view(null) });
      const best = (r: number, c: number): number => {
        total++;
        calls[r][c]++;
        if (r === n - 1) return rows[r][c];
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['best(', A(r), ',', A(c), ') = ', A(rows[r][c]), ' + the cheaper of the two cells below.'], state: view([r, c]) });
        return rows[r][c] + Math.min(best(r + 1, c), best(r + 1, c + 1));
      };
      const res = best(0, 0);
      steps.push({ tag: 'ret', trace: ['Minimum path sum ', C(res), ' — ', C(total), ' calls for ', A((n * (n + 1)) / 2), ' cells.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'There are 2ⁿ⁻¹ top-to-bottom paths and the recursion follows every one. Working bottom-up, each cell needs only the two finished cells beneath it.',
    complexity: { time: 'O(2ⁿ)', space: 'O(n) stack' },
  },
};

/* ================= Minimum Falling Path Sum ================= */
const fallingPathSum: ProblemDef = {
  slug: 'minimum-falling-path-sum',
  title: 'Minimum Falling Path Sum',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-falling-path-sum/',
  technique: 'Each cell takes the best of the three cells above it — straight, diagonal-left, diagonal-right.',
  widget: 'matrix',
  widgetTitle: 'Grid with running best totals',
  inputs: [{ key: 'grid', label: 'Matrix (rows ";" separated)', defaultValue: '2,1,3;6,5,4;7,8,9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minFallingPathSum(vector<vector<int>>& m) {'),
      L('        int n = m.size();'),
      L('        for (int r = 1; r < n; r++)', 'row'),
      L('            for (int c = 0; c < n; c++) {', 'cell'),
      L('                int best = m[r-1][c];', 'above'),
      L('                if (c > 0) best = min(best, m[r-1][c-1]);', 'above'),
      L('                if (c + 1 < n) best = min(best, m[r-1][c+1]);', 'above'),
      L('                m[r][c] += best;', 'add'),
      L('            }'),
      L('        return *min_element(m[n-1].begin(), m[n-1].end());', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minFallingPathSum(int[][] m) {'),
      L('        int n = m.length;'),
      L('        for (int r = 1; r < n; r++)', 'row'),
      L('            for (int c = 0; c < n; c++) {', 'cell'),
      L('                int best = m[r-1][c];', 'above'),
      L('                if (c > 0) best = Math.min(best, m[r-1][c-1]);', 'above'),
      L('                if (c + 1 < n) best = Math.min(best, m[r-1][c+1]);', 'above'),
      L('                m[r][c] += best;', 'add'),
      L('            }'),
      L('        int res = Integer.MAX_VALUE;'),
      L('        for (int v : m[n-1]) res = Math.min(res, v);'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m0 = numGrid(values.grid, 5, 5);
    if (typeof m0 === 'string') return { error: m0 };
    const n = m0.length;
    if (!m0.every((r) => r.length === n)) return { error: 'The matrix must be square.' };
    const m = m0.map((r) => [...r]);
    const steps: Step[] = [];
    const view = (r?: number, c?: number, src: string[] = []): MatrixState => ({
      grid: m.map((row, rr) => row.map((v, cc) => (rr > (r ?? -1) ? m0[rr][cc] : `${m0[rr][cc]}→${v}`))),
      rowLabels: [...Array(n)].map((_, i) => i),
      colLabels: [...Array(n)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(r !== undefined && c !== undefined ? { [`${r},${c}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'row',
      trace: [
        'A falling path drops one row at a time, shifting by at most one column. So a cell can only come from the ', A('three'), ' cells directly above it.',
      ],
      state: view(0),
    });
    for (let r = 1; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const opts: [string, number][] = [[`${r - 1},${c}`, m[r - 1][c]]];
        if (c > 0) opts.push([`${r - 1},${c - 1}`, m[r - 1][c - 1]]);
        if (c + 1 < n) opts.push([`${r - 1},${c + 1}`, m[r - 1][c + 1]]);
        const best = Math.min(...opts.map(([, v]) => v));
        m[r][c] += best;
        steps.push({
          tag: 'add',
          trace: [
            'Cell (', A(r), ',', A(c), '): cheapest arrival from above is ', A(best), ' (of ', A(opts.map(([, v]) => v).join(', ')), '), so its best total is ',
            A(m0[r][c]), ' + ', A(best), ' = ', B(m[r][c]), '.',
          ],
          state: view(r, c, opts.map(([k]) => k)),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const best = Math.min(...m[n - 1]);
    const bestCol = m[n - 1].indexOf(best);
    steps.push({
      tag: 'ret',
      trace: ['The last row holds the best total for each ending column — the smallest is ', C(best), ' at column ', C(bestCol), '.'],
      state: { ...view(n - 1), mark: { [`${n - 1},${bestCol}`]: 'final' } },
    });
    return { steps, result: String(best), resultDetail: `ends at column ${bestCol}` };
  },
  note: 'The path may start in any column, which is why there is no single base cell — row 0 is the base in full, and the answer is a minimum over the whole last row. Overwriting the input in place is fine here because each row only reads the row above, which is already final.',
  complexity: { time: 'O(n²)', space: 'O(1) in place' },
  brute: {
    label: 'Plain recursion',
    technique: 'fall(r, c) = m[r][c] + the best of the three cells below, started from every top cell, with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minFallingPathSum(vector<vector<int>>& m) {'),
        L('        int best = INT_MAX;', 'init'),
        L('        for (int c = 0; c < m.size(); c++) best = min(best, fall(m, 0, c));', 'init', 'ret'),
        L('        return best;', 'ret'),
        L('    }'),
        L('    int fall(vector<vector<int>>& m, int r, int c) {'),
        L('        if (c < 0 || c == m.size()) return INT_MAX;'),
        L('        if (r == m.size() - 1) return m[r][c];', 'base'),
        L('        return m[r][c] + min({fall(m, r + 1, c - 1), fall(m, r + 1, c), fall(m, r + 1, c + 1)});', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minFallingPathSum(int[][] m) {'),
        L('        int best = Integer.MAX_VALUE;', 'init'),
        L('        for (int c = 0; c < m.length; c++) best = Math.min(best, fall(m, 0, c));', 'init', 'ret'),
        L('        return best;', 'ret'),
        L('    }'),
        L('    private int fall(int[][] m, int r, int c) {'),
        L('        if (c < 0 || c == m.length) return Integer.MAX_VALUE;'),
        L('        if (r == m.length - 1) return m[r][c];', 'base'),
        L('        return m[r][c] + Math.min(fall(m, r + 1, c), Math.min(fall(m, r + 1, c - 1), fall(m, r + 1, c + 1)));', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const m = numGrid(values.grid, 5, 5);
      if (typeof m === 'string') return { error: m };
      const n = m.length;
      if (!m.every((r) => r.length === n)) return { error: 'The matrix must be square.' };
      const calls = [...Array(n)].map(() => Array(n).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, [...Array(n)].map((_, i) => i), [...Array(n)].map((_, i) => i), act, total);
      steps.push({ tag: 'init', trace: ['Start a fall from every top cell; each cell counts how often its best fall is recomputed.'], state: view(null) });
      const fall = (r: number, c: number): number => {
        if (c < 0 || c === n) return Infinity;
        total++;
        calls[r][c]++;
        if (r === n - 1) return m[r][c];
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['fall(', A(r), ',', A(c), ') = ', A(m[r][c]), ' + best of the three cells below.'], state: view([r, c]) });
        return m[r][c] + Math.min(fall(r + 1, c - 1), fall(r + 1, c), fall(r + 1, c + 1));
      };
      let best = Infinity;
      let bestCol = 0;
      for (let c = 0; c < n; c++) {
        const v = fall(0, c);
        if (v < best) {
          best = v;
          bestCol = c;
        }
      }
      steps.push({ tag: 'ret', trace: ['Minimum falling path sum ', C(best), ' — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(best), resultDetail: `starts at column ${bestCol}` };
    },
    note: 'Up to three branches per row makes this O(3ⁿ). The DP updates each cell once from the three cells above it.',
    complexity: { time: 'O(n · 3ⁿ)', space: 'O(n) stack' },
  },
};

/* ================= Cherry Pickup II ================= */
const cherryPickupII: ProblemDef = {
  slug: 'cherry-pickup-ii',
  title: 'Cherry Pickup II',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/cherry-pickup-ii/',
  technique: 'Move both robots down in lockstep — the state is (row, column of A, column of B).',
  widget: 'matrix',
  widgetTitle: 'Grid (two robots descending)',
  inputs: [{ key: 'grid', label: 'Cherries (rows ";" separated)', defaultValue: '3,1,1;2,5,1;1,5,5;2,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int cherryPickup(vector<vector<int>>& g) {'),
      L('        int R = g.size(), C = g[0].size();'),
      L('        vector dp(C, vector<int>(C, -1));'),
      L('        dp[0][C-1] = g[0][0] + g[0][C-1];', 'base'),
      L('        for (int r = 1; r < R; r++) {', 'row'),
      L('            vector nxt(C, vector<int>(C, -1));'),
      L('            for (int a = 0; a < C; a++)', 'state'),
      L('                for (int b = 0; b < C; b++) {', 'state'),
      L('                    if (dp[a][b] < 0) continue;', 'state'),
      L('                    for (int da = -1; da <= 1; da++)', 'move'),
      L('                        for (int db = -1; db <= 1; db++) {', 'move'),
      L('                            int na = a+da, nb = b+db;'),
      L('                            if (na < 0 || na >= C || nb < 0 || nb >= C) continue;'),
      L('                            int gain = g[r][na] + (na == nb ? 0 : g[r][nb]);', 'gain'),
      L('                            nxt[na][nb] = max(nxt[na][nb], dp[a][b] + gain);', 'gain'),
      L('                        }'),
      L('                }'),
      L('            dp = nxt;', 'row'),
      L('        }'),
      L('        int best = 0;'),
      L('        for (auto& row : dp) for (int v : row) best = max(best, v);', 'ret'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int cherryPickup(int[][] g) {'),
      L('        int R = g.length, C = g[0].length;'),
      L('        int[][] dp = new int[C][C];'),
      L('        for (int[] row : dp) Arrays.fill(row, -1);'),
      L('        dp[0][C-1] = g[0][0] + g[0][C-1];', 'base'),
      L('        for (int r = 1; r < R; r++) {', 'row'),
      L('            int[][] nxt = new int[C][C];'),
      L('            for (int[] row : nxt) Arrays.fill(row, -1);'),
      L('            for (int a = 0; a < C; a++)', 'state'),
      L('                for (int b = 0; b < C; b++) {', 'state'),
      L('                    if (dp[a][b] < 0) continue;', 'state'),
      L('                    for (int da = -1; da <= 1; da++)', 'move'),
      L('                        for (int db = -1; db <= 1; db++) {', 'move'),
      L('                            int na = a+da, nb = b+db;'),
      L('                            if (na < 0 || na >= C || nb < 0 || nb >= C) continue;'),
      L('                            int gain = g[r][na] + (na == nb ? 0 : g[r][nb]);', 'gain'),
      L('                            nxt[na][nb] = Math.max(nxt[na][nb], dp[a][b] + gain);', 'gain'),
      L('                        }'),
      L('                }'),
      L('            dp = nxt;', 'row'),
      L('        }'),
      L('        int best = 0;'),
      L('        for (int[] row : dp) for (int v : row) best = Math.max(best, v);', 'ret'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = numGrid(values.grid, 4, 4);
    if (typeof g === 'string') return { error: g };
    if (!g.every((r) => r.every((v) => v >= 0))) return { error: 'Cherry counts must be non-negative.' };
    const R = g.length;
    const Cn = g[0].length;
    if (Cn < 2) return { error: 'The grid needs at least two columns (one per robot).' };
    const NEG = -1;
    let dp: number[][] = [...Array(Cn)].map(() => [...Array(Cn)].map(() => NEG));
    dp[0][Cn - 1] = g[0][0] + g[0][Cn - 1];
    const steps: Step[] = [];
    const view = (r: number, a?: number, b?: number): MatrixState => ({
      grid: g.map((row, rr) => row.map((v, cc) => (rr === r && (cc === a || cc === b) ? `[${v}]` : v))),
      rowLabels: [...Array(R)].map((_, i) => (i === r ? `row ${i} ←` : `row ${i}`)),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark: {
        ...(a !== undefined ? { [`${r},${a}`]: 'active' as const } : {}),
        ...(b !== undefined ? { [`${r},${b}`]: 'good' as const } : {}),
      },
      aggs: [
        { label: 'best totals by (colA, colB)', value: dp.flatMap((row, i) => row.map((v, j) => (v >= 0 ? `${i},${j}:${v}` : null)).filter(Boolean)).join('  ') || '—', c: 'b' },
      ],
    });
    steps.push({
      tag: 'base',
      trace: [
        'Both robots move down one row per turn, so they are always on the ', A('same row'), '. That makes the state just (row, column A, column B).',
      ],
      state: view(0, 0, Cn - 1),
    });
    for (let r = 1; r < R; r++) {
      const nxt: number[][] = [...Array(Cn)].map(() => [...Array(Cn)].map(() => NEG));
      for (let a = 0; a < Cn; a++) {
        for (let b = 0; b < Cn; b++) {
          if (dp[a][b] < 0) continue;
          for (let da = -1; da <= 1; da++) {
            for (let db = -1; db <= 1; db++) {
              const na = a + da;
              const nb = b + db;
              if (na < 0 || na >= Cn || nb < 0 || nb >= Cn) continue;
              const gain = g[r][na] + (na === nb ? 0 : g[r][nb]);
              nxt[na][nb] = Math.max(nxt[na][nb], dp[a][b] + gain);
            }
          }
        }
      }
      dp = nxt;
      const best = Math.max(...dp.flat());
      let bi = 0;
      let bj = 0;
      for (let i = 0; i < Cn; i++) for (let j = 0; j < Cn; j++) if (dp[i][j] === best) {
        bi = i;
        bj = j;
      }
      steps.push({
        tag: 'gain',
        trace: [
          'Row ', A(r), ': each robot may shift left, straight or right — ', A(9), ' combinations per state. When they land on the ', B('same'), ' cell its cherries count ',
          B('once'), '. Best so far this row: ', B(best), ' with columns ', B(bi), ' and ', B(bj), '.',
        ],
        state: view(r, bi, bj),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const answer = Math.max(0, ...dp.flat());
    steps.push({
      tag: 'ret',
      trace: ['Most cherries the two robots can collect together: ', C(answer), '.'],
      state: view(R - 1),
    });
    return { steps, result: String(answer) };
  },
  note: 'Running one robot at a time and adding the results is wrong — the second robot would happily reuse cells the first already stripped. Moving them in lockstep makes the double-count detectable with a single na == nb check, which is the whole reason the state pairs the two columns.',
  complexity: { time: 'O(R·C²·9)', space: 'O(C²)' },
  brute: {
    label: 'Plain recursion',
    technique: 'go(row, a, b) tries all 9 move pairs for the two robots at each row, recursing without a memo table.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int cherryPickup(vector<vector<int>>& g) { return go(g, 0, 0, g[0].size() - 1); }', 'init', 'ret'),
        L('    int go(vector<vector<int>>& g, int r, int a, int b) {'),
        L('        int C = g[0].size();'),
        L('        if (a < 0 || b < 0 || a >= C || b >= C) return INT_MIN;'),
        L('        int here = g[r][a] + (a != b ? g[r][b] : 0);', 'call'),
        L('        if (r == g.size() - 1) return here;', 'base'),
        L('        int best = INT_MIN;', 'call'),
        L('        for (int da = -1; da <= 1; da++)', 'call'),
        L('            for (int db = -1; db <= 1; db++)', 'call'),
        L('                best = max(best, go(g, r + 1, a + da, b + db));', 'call'),
        L('        return here + best;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int cherryPickup(int[][] g) { return go(g, 0, 0, g[0].length - 1); }', 'init', 'ret'),
        L('    private int go(int[][] g, int r, int a, int b) {'),
        L('        int C = g[0].length;'),
        L('        if (a < 0 || b < 0 || a >= C || b >= C) return Integer.MIN_VALUE;'),
        L('        int here = g[r][a] + (a != b ? g[r][b] : 0);', 'call'),
        L('        if (r == g.length - 1) return here;', 'base'),
        L('        int best = Integer.MIN_VALUE;', 'call'),
        L('        for (int da = -1; da <= 1; da++)', 'call'),
        L('            for (int db = -1; db <= 1; db++)', 'call'),
        L('                best = Math.max(best, go(g, r + 1, a + da, b + db));', 'call'),
        L('        return here + best;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = numGrid(values.grid, 4, 4);
      if (typeof g === 'string') return { error: g };
      if (!g.every((r) => r.every((v) => v >= 0))) return { error: 'Cherry counts must be non-negative.' };
      const R = g.length;
      const Cn = g[0].length;
      if (Cn < 2) return { error: 'The grid needs at least two columns (one per robot).' };
      const calls = [...Array(Cn)].map(() => Array(Cn).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const cols = [...Array(Cn)].map((_, i) => i);
      const view = (act: [number, number] | null) => callGrid(calls, cols.map((c) => `A@${c}`), cols.map((c) => `B@${c}`), act, total);
      steps.push({ tag: 'init', trace: ['Cell (a, b) counts how often the pair of robot columns (A at a, B at b) is re-explored, over all rows.'], state: view(null) });
      const go = (r: number, a: number, b: number): number => {
        if (a < 0 || b < 0 || a >= Cn || b >= Cn) return -Infinity;
        total++;
        calls[a][b]++;
        const here = g[r][a] + (a !== b ? g[r][b] : 0);
        if (r === R - 1) return here;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['Row ', A(r), ': robots at ', A(a), ' and ', A(b), ' pick ', B(here), ', then try all 9 move pairs.'], state: view([a, b]) });
        let best = -Infinity;
        for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) best = Math.max(best, go(r + 1, a + da, b + db));
        return here + best;
      };
      const res = go(0, 0, Cn - 1);
      steps.push({ tag: 'ret', trace: ['Most cherries: ', C(res), ' — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Nine branches per row means up to 9^R calls, although only R·C² distinct (row, a, b) states exist. The DP keeps one C×C table per row instead.',
    complexity: { time: 'O(9^R)', space: 'O(R) stack' },
  },
};

/* ================= Last Stone Weight II ================= */
const lastStoneWeightII: ProblemDef = {
  slug: 'last-stone-weight-ii',
  title: 'Last Stone Weight II',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/last-stone-weight-ii/',
  technique: 'Split the stones into two piles as evenly as possible — a subset-sum problem in disguise.',
  widget: 'matrix',
  widgetTitle: 'Reachable subset sums',
  inputs: [{ key: 'stones', label: 'Stone weights', defaultValue: '2, 7, 4, 1, 8, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int lastStoneWeightII(vector<int>& stones) {'),
      L('        int total = accumulate(stones.begin(), stones.end(), 0);', 'total'),
      L('        int half = total / 2;'),
      L('        vector<bool> dp(half + 1, false);'),
      L('        dp[0] = true;', 'base'),
      L('        for (int s : stones)', 'stone'),
      L('            for (int j = half; j >= s; j--)', 'inner'),
      L('                dp[j] = dp[j] || dp[j - s];', 'set'),
      L('        for (int j = half; j >= 0; j--)', 'best'),
      L('            if (dp[j]) return total - 2 * j;', 'best'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int lastStoneWeightII(int[] stones) {'),
      L('        int total = 0;'),
      L('        for (int s : stones) total += s;', 'total'),
      L('        int half = total / 2;'),
      L('        boolean[] dp = new boolean[half + 1];'),
      L('        dp[0] = true;', 'base'),
      L('        for (int s : stones)', 'stone'),
      L('            for (int j = half; j >= s; j--)', 'inner'),
      L('                dp[j] = dp[j] || dp[j - s];', 'set'),
      L('        for (int j = half; j >= 0; j--)', 'best'),
      L('            if (dp[j]) return total - 2 * j;', 'best'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const stones = parseIntArray(values.stones, { min: 1, max: 20, maxLen: 8 });
    if (typeof stones === 'string') return { error: stones };
    const total = stones.reduce((a, b) => a + b, 0);
    if (total > 40) return { error: 'Keep the total weight to at most 40 so the table stays readable.' };
    const half = Math.floor(total / 2);
    const dp = [...Array(half + 1)].map(() => false);
    dp[0] = true;
    const steps: Step[] = [];
    const view = (si: number, j?: number, src?: number): MatrixState => ({
      grid: [dp.map((v) => (v ? '✓' : '·'))],
      rowLabels: ['reachable'],
      colLabels: [...Array(half + 1)].map((_, i) => i),
      mark: {
        ...(src !== undefined ? { [`0,${src}`]: 'src' as const } : {}),
        ...(j !== undefined ? { [`0,${j}`]: 'active' as const } : {}),
      },
      aggs: [
        { label: 'total weight', value: String(total), c: 'a' },
        { label: 'stones used', value: stones.slice(0, si).join(', ') || '—', c: 'b' },
      ],
    });
    steps.push({
      tag: 'total',
      trace: [
        'Every smash assigns a stone to one of two piles with a ', A('+'), ' or ', A('−'), ' sign. The leftover is |sum of pile A − sum of pile B|, so we want the ',
        B('most even'), ' split of ', A(total), '.',
      ],
      state: view(0),
    });
    steps.push({
      tag: 'base',
      trace: ['Sum ', B(0), ' is always reachable — take no stones. Now find which sums up to ', A(half), ' can be built.'],
      state: view(0, 0),
    });
    for (let i = 0; i < stones.length; i++) {
      const s = stones[i];
      const added: number[] = [];
      for (let j = half; j >= s; j--) {
        if (!dp[j] && dp[j - s]) {
          dp[j] = true;
          added.push(j);
        }
      }
      steps.push({
        tag: 'set',
        trace: [
          'Add stone ', A(s), ': ', added.length ? ['newly reachable sums ', B(added.sort((x, y) => x - y).join(', ')), '.'].join('') : 'no new sums appear.',
          ' The inner loop runs ', A('downwards'), ' so each stone is used at most once.',
        ],
        state: view(i + 1, added[0]),
      });
      if (steps.length > MAX_STEPS) break;
    }
    let best = 0;
    for (let j = half; j >= 0; j--) {
      if (dp[j]) {
        best = j;
        break;
      }
    }
    steps.push({
      tag: 'best',
      trace: ['The largest reachable sum not exceeding half is ', A(best), '.'],
      state: view(stones.length, best),
    });
    const ans = total - 2 * best;
    steps.push({
      tag: 'ret',
      trace: ['One pile weighs ', C(best), ', the other ', C(total - best), ' — the last stone weighs ', C(ans), '.'],
      state: view(stones.length, best),
    });
    return { steps, result: String(ans), resultDetail: `piles ${best} and ${total - best}` };
  },
  note: 'Recognising the smash sequence as a ± sign assignment is the whole insight — the order of smashes never matters, only the final partition. Iterating j downwards is what makes it 0/1 knapsack rather than unbounded; going upwards would let one stone be reused many times.',
  complexity: { time: 'O(n · total)', space: 'O(total)' },
  brute: {
    label: 'Try every sign',
    technique: 'Give each stone a + or − sign (which pile it ends up in) and keep the smallest non-negative total.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int lastStoneWeightII(vector<int>& stones) { return go(stones, 0, 0); }', 'init', 'ret'),
        L('    int go(vector<int>& s, int i, int sum) {'),
        L('        if (i == s.size()) return abs(sum);', 'leaf', 'better'),
        L('        return min(go(s, i + 1, sum + s[i]), go(s, i + 1, sum - s[i]));'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int lastStoneWeightII(int[] stones) { return go(stones, 0, 0); }', 'init', 'ret'),
        L('    private int go(int[] s, int i, int sum) {'),
        L('        if (i == s.length) return Math.abs(sum);', 'leaf', 'better'),
        L('        return Math.min(go(s, i + 1, sum + s[i]), go(s, i + 1, sum - s[i]));'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const stones = parseIntArray(values.stones, { min: 1, max: 20, maxLen: 8 });
      if (typeof stones === 'string') return { error: stones };
      const total = stones.reduce((a, b) => a + b, 0);
      if (total > 40) return { error: 'Keep the total weight to at most 40 so the table stays readable.' };
      const steps: Step[] = [];
      const signs: number[] = [];
      let best = Infinity;
      let leaves = 0;
      const view = (hit: boolean): MatrixState => ({
        grid: [stones.map((v, k) => (k < signs.length ? `${signs[k] > 0 ? '+' : '−'}${v}` : String(v)))],
        rowLabels: ['signs'],
        colLabels: stones.map((_, k) => k),
        mark: Object.fromEntries(signs.map((_, k) => [`0,${k}`, hit ? ('good' as const) : ('active' as const)])),
        aggs: [
          { label: 'assignments tried', value: `${leaves} / ${2 ** stones.length}`, c: 'a' },
          { label: 'smallest |sum|', value: best === Infinity ? '—' : String(best), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Any smash order leaves |(pile 1) − (pile 2)|. Try all ', A(2 ** stones.length), ' ways to split the stones into two piles.'], state: view(false) });
      const go = (i: number, sum: number) => {
        if (i === stones.length) {
          leaves++;
          const v = Math.abs(sum);
          const better = v < best;
          if (better) best = v;
          if (better || steps.length < 60) steps.push({ tag: better ? 'better' : 'leaf', trace: ['Split gives |', A(sum), '| = ', better ? B(v) : F(v), better ? ' — smallest so far.' : '.'], state: view(better) });
          return;
        }
        signs.push(1);
        go(i + 1, sum + stones[i]);
        signs[signs.length - 1] = -1;
        go(i + 1, sum - stones[i]);
        signs.pop();
      };
      go(0, 0);
      steps.push({ tag: 'ret', trace: ['Smallest possible last stone: ', C(best), ' (', A(leaves), ' splits tried).'], state: view(false) });
      return { steps, result: String(best) };
    },
    note: 'Always 2ⁿ splits. The subset-sum DP only tracks which pile totals up to half are reachable, which is at most total/2 + 1 values.',
    complexity: { time: 'O(2ⁿ)', space: 'O(n) stack' },
  },
};

/* ================= Coin Change II ================= */
const coinChangeII: ProblemDef = {
  slug: 'coin-change-ii',
  title: 'Coin Change II',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/coin-change-ii/',
  technique: 'Loop coins outside and amount inside — that counts combinations, not orderings.',
  widget: 'matrix',
  widgetTitle: 'Ways to make each amount',
  inputs: [
    { key: 'coins', label: 'Coin values', defaultValue: '1, 2, 5', wide: true },
    { key: 'amount', label: 'Amount', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int change(int amount, vector<int>& coins) {'),
      L('        vector<int> dp(amount + 1, 0);'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int c : coins)', 'coin'),
      L('            for (int a = c; a <= amount; a++)', 'inner'),
      L('                dp[a] += dp[a - c];', 'add'),
      L('        return dp[amount];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int change(int amount, int[] coins) {'),
      L('        int[] dp = new int[amount + 1];'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int c : coins)', 'coin'),
      L('            for (int a = c; a <= amount; a++)', 'inner'),
      L('                dp[a] += dp[a - c];', 'add'),
      L('        return dp[amount];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const coins = parseIntArray(values.coins, { min: 1, max: 20, maxLen: 5 });
    if (typeof coins === 'string') return { error: coins };
    const amount = parseInt1(values.amount, 'Amount', { min: 0, max: 20 });
    if (typeof amount === 'string') return { error: amount };
    const dp = [...Array(amount + 1)].map(() => 0);
    dp[0] = 1;
    const steps: Step[] = [];
    const view = (ci: number, a?: number, src?: number): MatrixState => ({
      grid: [dp.map((v) => v)],
      rowLabels: ['ways'],
      colLabels: [...Array(amount + 1)].map((_, i) => i),
      mark: {
        ...(src !== undefined ? { [`0,${src}`]: 'src' as const } : {}),
        ...(a !== undefined ? { [`0,${a}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'coins used so far', value: coins.slice(0, ci).join(', ') || '—', c: 'b' }],
    });
    steps.push({
      tag: 'base',
      trace: ['There is exactly ', B(1), ' way to make ', A(0), ': use no coins. Everything else starts at ', A(0), ' ways.'],
      state: view(0, 0),
    });
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      for (let a = c; a <= amount; a++) {
        const before = dp[a];
        dp[a] += dp[a - c];
        steps.push({
          tag: 'add',
          trace: [
            'With coin ', A(c), ' available, amount ', A(a), ' gains every way of making ', A(a - c), ' (', A(dp[a - c]), ' of them): ', A(before), ' + ',
            A(dp[a - c]), ' = ', B(dp[a]), '.',
          ],
          state: view(i + 1, a, a - c),
        });
        if (steps.length > MAX_STEPS) break;
      }
      steps.push({
        tag: 'coin',
        trace: ['All amounts updated for coin ', B(c), ': ', B(dp.join(', ')), '.'],
        state: view(i + 1),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Ways to make ', C(amount), ': ', C(dp[amount]), '.'],
      state: { ...view(coins.length), mark: { [`0,${amount}`]: 'final' } },
    });
    return { steps, result: String(dp[amount]) };
  },
  note: 'The loop order carries the entire meaning. Coins outside means each coin is fully considered before the next, so {1,2} and {2,1} are never counted separately — swap the loops and you count permutations instead, which is exactly Combination Sum IV.',
  complexity: { time: 'O(coins · amount)', space: 'O(amount)' },
  brute: {
    label: 'Plain recursion',
    technique: 'ways(i, a) = use coin i again, or move on to coin i+1 — recursed without a table.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int change(int amount, vector<int>& coins) { return ways(coins, 0, amount); }', 'init', 'ret'),
        L('    int ways(vector<int>& coins, int i, int a) {'),
        L('        if (a == 0) return 1;', 'base'),
        L('        if (i == coins.size() || a < 0) return 0;', 'base'),
        L('        return ways(coins, i, a - coins[i]) + ways(coins, i + 1, a);', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int change(int amount, int[] coins) { return ways(coins, 0, amount); }', 'init', 'ret'),
        L('    private int ways(int[] coins, int i, int a) {'),
        L('        if (a == 0) return 1;', 'base'),
        L('        if (i == coins.length || a < 0) return 0;', 'base'),
        L('        return ways(coins, i, a - coins[i]) + ways(coins, i + 1, a);', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const coins = parseIntArray(values.coins, { min: 1, max: 20, maxLen: 5 });
      if (typeof coins === 'string') return { error: coins };
      const amount = parseInt1(values.amount, 'Amount', { min: 0, max: 20 });
      if (typeof amount === 'string') return { error: amount };
      const calls = [...Array(coins.length)].map(() => Array(amount + 1).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, coins.map((c) => `coin ${c}`), [...Array(amount + 1)].map((_, i) => i), act, total);
      steps.push({ tag: 'init', trace: ['Cell (coin i, amount a) counts how often "ways to make a with coins i…" is recomputed.'], state: view(null) });
      const ways = (i: number, a: number): number => {
        total++;
        if (a === 0) return 1;
        if (i === coins.length || a < 0) return 0;
        calls[i][a]++;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['ways(coin ', A(coins[i]), ', ', A(a), ') = use it again + skip to the next coin.'], state: view([i, a]) });
        return ways(i, a - coins[i]) + ways(i + 1, a);
      };
      const res = ways(0, amount);
      steps.push({ tag: 'ret', trace: [C(res), ' combination(s) — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'The same (coin, amount) pair is reached along many different paths and re-solved each time. The DP array solves every amount once per coin.',
    complexity: { time: 'Exponential', space: 'O(amount) stack' },
  },
};

/* ================= Combination Sum IV ================= */
const combinationSumIV: ProblemDef = {
  slug: 'combination-sum-iv',
  title: 'Combination Sum IV',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/combination-sum-iv/',
  technique: 'Amount outside, numbers inside — order matters, so this counts permutations.',
  widget: 'matrix',
  widgetTitle: 'Ordered ways to make each total',
  inputs: [
    { key: 'nums', label: 'Numbers', defaultValue: '1, 2, 3', wide: true },
    { key: 'target', label: 'Target', defaultValue: '4' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int combinationSum4(vector<int>& nums, int target) {'),
      L('        vector<unsigned> dp(target + 1, 0);'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int t = 1; t <= target; t++)', 'total'),
      L('            for (int x : nums)', 'inner'),
      L('                if (x <= t) dp[t] += dp[t - x];', 'add'),
      L('        return dp[target];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int combinationSum4(int[] nums, int target) {'),
      L('        int[] dp = new int[target + 1];'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int t = 1; t <= target; t++)', 'total'),
      L('            for (int x : nums)', 'inner'),
      L('                if (x <= t) dp[t] += dp[t - x];', 'add'),
      L('        return dp[target];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 1, max: 20, maxLen: 5 });
    if (typeof nums === 'string') return { error: nums };
    const target = parseInt1(values.target, 'Target', { min: 0, max: 15 });
    if (typeof target === 'string') return { error: target };
    const dp = [...Array(target + 1)].map(() => 0);
    dp[0] = 1;
    const steps: Step[] = [];
    const view = (t?: number, src?: number): MatrixState => ({
      grid: [dp.map((v) => v)],
      rowLabels: ['ordered ways'],
      colLabels: [...Array(target + 1)].map((_, i) => i),
      mark: {
        ...(src !== undefined ? { [`0,${src}`]: 'src' as const } : {}),
        ...(t !== undefined ? { [`0,${t}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'numbers', value: nums.join(', '), c: 'b' }],
    });
    steps.push({
      tag: 'base',
      trace: ['One way to make ', A(0), ': the empty sequence. Here ', B('order matters'), ' — (1,2) and (2,1) count separately.'],
      state: view(0),
    });
    for (let t = 1; t <= target; t++) {
      for (const x of nums) {
        if (x > t) continue;
        const before = dp[t];
        dp[t] += dp[t - x];
        steps.push({
          tag: 'add',
          trace: [
            'Sequences for ', A(t), ' ending in ', A(x), ' are exactly the sequences for ', A(t - x), ' (', A(dp[t - x]), '): ', A(before), ' + ', A(dp[t - x]),
            ' = ', B(dp[t]), '.',
          ],
          state: view(t, t - x),
        });
        if (steps.length > MAX_STEPS) break;
      }
      steps.push({ tag: 'total', trace: ['Total ', B(t), ' can be formed ', B(dp[t]), ' way(s).'], state: view(t) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Ordered combinations summing to ', C(target), ': ', C(dp[target]), '.'],
      state: { ...view(), mark: { [`0,${target}`]: 'final' } },
    });
    return { steps, result: String(dp[target]) };
  },
  note: 'Despite the name, this counts permutations — the loop order (total outside) is what distinguishes it from Coin Change II. Fixing "the last number used" is the cleanest way to see why: each choice of last element partitions the sequences with no overlap.',
  complexity: { time: 'O(target · n)', space: 'O(target)' },
  brute: {
    label: 'Plain recursion',
    technique: 'count(t) = sum of count(t − x) over every number x ≤ t, recursed with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int combinationSum4(vector<int>& nums, int target) {', 'init', 'ret'),
        L('        if (target == 0) return 1;', 'base'),
        L('        int total = 0;', 'call'),
        L('        for (int x : nums)', 'call'),
        L('            if (x <= target) total += combinationSum4(nums, target - x);', 'call'),
        L('        return total;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int combinationSum4(int[] nums, int target) {', 'init', 'ret'),
        L('        if (target == 0) return 1;', 'base'),
        L('        int total = 0;', 'call'),
        L('        for (int x : nums)', 'call'),
        L('            if (x <= target) total += combinationSum4(nums, target - x);', 'call'),
        L('        return total;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 1, max: 20, maxLen: 5 });
      if (typeof nums === 'string') return { error: nums };
      const target = parseInt1(values.target, 'Target', { min: 0, max: 15 });
      if (typeof target === 'string') return { error: target };
      const calls = [Array(target + 1).fill(0)];
      let total = 0;
      const steps: Step[] = [];
      const view = (t: number | null) => callGrid(calls, ['calls'], [...Array(target + 1)].map((_, i) => i), t === null ? null : [0, t], total);
      steps.push({ tag: 'init', trace: ['Each column is a target value; it counts how often count(target) is recomputed.'], state: view(null) });
      const count = (t: number): number => {
        total++;
        calls[0][t]++;
        if (t === 0) return 1;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['count(', A(t), ') = Σ count(', A(t), ' − x) over x in [', A(nums.join(', ')), '].'], state: view(t) });
        let s = 0;
        for (const x of nums) if (x <= t) s += count(t - x);
        return s;
      };
      const res = count(target);
      steps.push({ tag: 'ret', trace: [C(res), ' ordered combination(s) — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Small targets like count(1) and count(2) are recomputed an exponential number of times. Filling dp[0…target] once removes every repeat.',
    complexity: { time: 'O(n^target)', space: 'O(target) stack' },
  },
};

/* ================= Count Square Submatrices with All Ones ================= */
const countSquares: ProblemDef = {
  slug: 'count-square-submatrices-with-all-ones',
  title: 'Count Square Submatrices with All Ones',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/count-square-submatrices-with-all-ones/',
  technique: 'dp[r][c] = size of the largest square ending here, which also counts the squares ending here.',
  widget: 'matrix',
  widgetTitle: 'Largest square ending at each cell',
  inputs: [{ key: 'grid', label: 'Binary grid (rows ";" separated)', defaultValue: '0,1,1,1;1,1,1,1;0,1,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countSquares(vector<vector<int>>& m) {'),
      L('        int R = m.size(), C = m[0].size(), total = 0;'),
      L('        for (int r = 0; r < R; r++)', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (m[r][c] == 0) continue;', 'zero'),
      L('                if (r && c)', 'grow'),
      L('                    m[r][c] = 1 + min({m[r-1][c], m[r][c-1],', 'grow'),
      L('                                       m[r-1][c-1]});', 'grow'),
      L('                total += m[r][c];', 'count'),
      L('            }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countSquares(int[][] m) {'),
      L('        int R = m.length, C = m[0].length, total = 0;'),
      L('        for (int r = 0; r < R; r++)', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (m[r][c] == 0) continue;', 'zero'),
      L('                if (r > 0 && c > 0)', 'grow'),
      L('                    m[r][c] = 1 + Math.min(m[r-1][c],', 'grow'),
      L('                        Math.min(m[r][c-1], m[r-1][c-1]));', 'grow'),
      L('                total += m[r][c];', 'count'),
      L('            }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m0 = numGrid(values.grid, 5, 5);
    if (typeof m0 === 'string') return { error: m0 };
    if (!m0.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
    const R = m0.length;
    const Cn = m0[0].length;
    const m: number[][] = m0.map((r) => [...r]);
    const steps: Step[] = [];
    let total = 0;
    const view = (r?: number, c?: number, src: string[] = []): MatrixState => ({
      grid: m.map((row) => [...row]),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(r !== undefined && c !== undefined ? { [`${r},${c}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'running total', value: String(total), c: 'c' }],
    });
    steps.push({
      tag: 'loop',
      trace: [
        'For each cell, compute the side of the ', A('largest'), ' all-ones square whose bottom-right corner is that cell. That number is also how many squares end there — sizes 1, 2, … up to it.',
      ],
      state: view(),
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (m0[r][c] === 0) {
          steps.push({ tag: 'zero', trace: ['(', F(r), ',', F(c), ') is a 0 — no square can end here.'], state: view(r, c) });
          continue;
        }
        if (r > 0 && c > 0) {
          const up = m[r - 1][c];
          const left = m[r][c - 1];
          const diag = m[r - 1][c - 1];
          m[r][c] = 1 + Math.min(up, left, diag);
          steps.push({
            tag: 'grow',
            trace: [
              'A square of side k ending here needs sides of at least k−1 ending above, left and diagonally. Those are ', A(up), ', ', A(left), ', ', A(diag),
              ' — so this cell reaches side ', B(m[r][c]), '.',
            ],
            state: view(r, c, [`${r - 1},${c}`, `${r},${c - 1}`, `${r - 1},${c - 1}`]),
          });
        } else {
          steps.push({ tag: 'grow', trace: ['On the top row or left column, only a ', B(1), '×1 square can end here.'], state: view(r, c) });
        }
        total += m[r][c];
        steps.push({
          tag: 'count',
          trace: ['That cell ends ', B(m[r][c]), ' square(s) — one of each side from 1 to ', B(m[r][c]), '. Running total ', C(total), '.'],
          state: view(r, c),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Total all-ones square submatrices: ', C(total), '.'],
      state: view(),
    });
    return { steps, result: String(total) };
  },
  note: 'The identity "largest side = number of squares ending here" is what makes counting free — if a 3×3 square ends at a cell, so do a 2×2 and a 1×1, and no larger one does. This is the same recurrence as Maximal Square; only the aggregation changes from max to sum.',
  complexity: { time: 'O(R·C)', space: 'O(1) in place' },
  brute: {
    label: 'Brute force',
    technique: 'For every top-left corner and every size, check whether the whole square is ones.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int countSquares(vector<vector<int>>& m) {'),
        L('        int R = m.size(), C = m[0].size(), total = 0;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'corner'),
        L('            for (int c = 0; c < C; c++)', 'corner'),
        L('                for (int k = 1; r + k <= R && c + k <= C; k++) {', 'corner'),
        L('                    if (!allOnes(m, r, c, k)) break;', 'corner'),
        L('                    total++;', 'corner'),
        L('                }'),
        L('        return total;', 'ret'),
        L('    }'),
        L('    // allOnes: every cell of the k×k square at (r, c) is 1'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int countSquares(int[][] m) {'),
        L('        int R = m.length, C = m[0].length, total = 0;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'corner'),
        L('            for (int c = 0; c < C; c++)', 'corner'),
        L('                for (int k = 1; r + k <= R && c + k <= C; k++) {', 'corner'),
        L('                    if (!allOnes(m, r, c, k)) break;', 'corner'),
        L('                    total++;', 'corner'),
        L('                }'),
        L('        return total;', 'ret'),
        L('    }'),
        L('    // allOnes: every cell of the k×k square at (r, c) is 1'),
        L('}'),
      ],
    },
    run(values) {
      const m = numGrid(values.grid, 5, 5);
      if (typeof m === 'string') return { error: m };
      if (!m.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
      const R = m.length;
      const Cn = m[0].length;
      let total = 0;
      let checks = 0;
      const steps: Step[] = [];
      const view = (mark: MatrixState['mark'] = {}): MatrixState => ({
        grid: m,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(Cn)].map((_, i) => i),
        mark,
        aggs: [
          { label: 'squares', value: String(total), c: 'c' },
          { label: 'cells checked', value: String(checks), c: 'a' },
        ],
      });
      const allOnes = (r: number, c: number, k: number) => {
        for (let dr = 0; dr < k; dr++)
          for (let dc = 0; dc < k; dc++) {
            checks++;
            if (m[r + dr][c + dc] !== 1) return false;
          }
        return true;
      };
      steps.push({ tag: 'init', trace: ['Try every corner and every size, re-checking each square cell by cell.'], state: view() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          let k = 1;
          while (r + k <= R && c + k <= Cn && allOnes(r, c, k)) {
            total++;
            k++;
          }
          if (k > 1) {
            const sq: MatrixState['mark'] = {};
            for (let dr = 0; dr < k - 1; dr++) for (let dc = 0; dc < k - 1; dc++) sq[`${r + dr},${c + dc}`] = 'active';
            steps.push({ tag: 'corner', trace: ['Corner (', A(r), ',', A(c), '): all-ones squares of side 1…', B(k - 1), ' → ', B(k - 1), ' more. Total ', C(total), '.'], state: view(sq) });
          }
        }
      steps.push({ tag: 'ret', trace: ['Total all-ones squares: ', C(total), ' (', A(checks), ' cell checks).'], state: view() });
      return { steps, result: String(total) };
    },
    note: 'Every square is re-verified cell by cell, even though a size-k square contains the size-(k−1) squares already checked. The DP reuses those: the largest square ending at a cell is 1 + the min of its three neighbours.',
    complexity: { time: 'O(R·C·min(R,C)³)', space: 'O(1)' },
  },
};

/* ================= House Robber III ================= */
const houseRobberIII: ProblemDef = {
  slug: 'house-robber-iii',
  title: 'House Robber III',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/house-robber-iii/',
  technique: 'Each node returns two numbers: the best if it is robbed, and the best if it is skipped.',
  widget: 'tree',
  widgetTitle: 'Tree of houses (rob / skip per node)',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 2, 3, null, 3, null, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int rob(TreeNode* root) {'),
      L('        auto [with, without] = solve(root);', 'start'),
      L('        return max(with, without);', 'ret'),
      L('    }'),
      L('    pair<int,int> solve(TreeNode* n) {', 'enter'),
      L('        if (!n) return {0, 0};', 'null'),
      L('        auto [lw, lo] = solve(n->left);', 'children'),
      L('        auto [rw, ro] = solve(n->right);', 'children'),
      L('        int with = n->val + lo + ro;      // children must be skipped', 'with'),
      L('        int without = max(lw, lo) + max(rw, ro);', 'without'),
      L('        return {with, without};', 'pair'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int rob(TreeNode root) {'),
      L('        int[] r = solve(root);', 'start'),
      L('        return Math.max(r[0], r[1]);', 'ret'),
      L('    }'),
      L('    int[] solve(TreeNode n) {', 'enter'),
      L('        if (n == null) return new int[]{0, 0};', 'null'),
      L('        int[] l = solve(n.left);', 'children'),
      L('        int[] r = solve(n.right);', 'children'),
      L('        int with = n.val + l[1] + r[1];   // children must be skipped', 'with'),
      L('        int without = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);', 'without'),
      L('        return new int[]{with, without};', 'pair'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const res = new Map<number, [number, number]>();
    const view = (cur: TNode | null): TreeState => ({
      ...layoutTree(root),
      nodes: layoutTree(root).nodes.map((nd) => ({
        ...nd,
        badge: res.has(nd.id) ? `${res.get(nd.id)![0]}/${res.get(nd.id)![1]}` : undefined,
      })),
      current: cur ? cur.id : null,
      done: [...res.keys()],
      aggs: [{ label: 'node badge', value: 'best if robbed / best if skipped', c: 'a' }],
    });
    steps.push({
      tag: 'start',
      trace: [
        'A single "best from here" number is not enough — the parent needs to know whether this node was robbed. So return ', A('two'), ' values from every node.',
      ],
      state: view(root),
    });
    const solve = (n: TNode | null): [number, number] => {
      if (!n || steps.length > MAX_STEPS) {
        if (!n) steps.push({ tag: 'null', trace: ['Empty subtree — ', B(0), ' either way.'], state: view(null) });
        return [0, 0];
      }
      steps.push({ tag: 'enter', trace: ['At house ', A(n.val), ' — solve both children first.'], state: view(n) });
      const [lw, lo] = solve(n.left);
      const [rw, ro] = solve(n.right);
      steps.push({
        tag: 'children',
        trace: ['Children report: left ', A(`${lw}/${lo}`), ', right ', A(`${rw}/${ro}`), ' (robbed/skipped).'],
        state: view(n),
      });
      const withNode = n.val + lo + ro;
      steps.push({
        tag: 'with',
        trace: [
          'If we ', B('rob'), ' house ', A(n.val), ', both children must be skipped: ', A(n.val), ' + ', A(lo), ' + ', A(ro), ' = ', B(withNode), '.',
        ],
        state: view(n),
      });
      const withoutNode = Math.max(lw, lo) + Math.max(rw, ro);
      steps.push({
        tag: 'without',
        trace: [
          'If we ', B('skip'), ' it, each child is free to do whatever is best: max(', A(lw), ',', A(lo), ') + max(', A(rw), ',', A(ro), ') = ', B(withoutNode), '.',
        ],
        state: view(n),
      });
      res.set(n.id, [withNode, withoutNode]);
      steps.push({ tag: 'pair', trace: ['House ', B(n.val), ' reports ', B(`${withNode}/${withoutNode}`), ' upward.'], state: view(n) });
      return [withNode, withoutNode];
    };
    const [w, wo] = solve(root);
    const ans = Math.max(w, wo);
    steps.push({
      tag: 'ret',
      trace: ['At the root, best is max(rob ', C(w), ', skip ', C(wo), ') = ', C(ans), '.'],
      state: view(null),
    });
    return { steps, result: String(ans) };
  },
  note: 'Returning a pair is what removes the exponential blow-up — the naive version recurses into grandchildren and recomputes the same subtrees repeatedly. Each node is visited once and combines four numbers, so this is O(n) with no memo table at all.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Plain recursion',
    technique: 'rob(node) = max(node + rob of all four grandchildren, rob(left) + rob(right)), with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int rob(TreeNode* n) {', 'enter', 'start'),
        L('        if (!n) return 0;', 'null'),
        L('        int with = n->val;', 'enter'),
        L('        if (n->left) with += rob(n->left->left) + rob(n->left->right);', 'enter'),
        L('        if (n->right) with += rob(n->right->left) + rob(n->right->right);', 'enter'),
        L('        int without = rob(n->left) + rob(n->right);', 'enter'),
        L('        return max(with, without);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int rob(TreeNode n) {', 'enter', 'start'),
        L('        if (n == null) return 0;', 'null'),
        L('        int with = n.val;', 'enter'),
        L('        if (n.left != null) with += rob(n.left.left) + rob(n.left.right);', 'enter'),
        L('        if (n.right != null) with += rob(n.right.left) + rob(n.right.right);', 'enter'),
        L('        int without = rob(n.left) + rob(n.right);', 'enter'),
        L('        return Math.max(with, without);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree, 12);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const steps: Step[] = [];
      const calls = new Map<number, number>();
      let total = 0;
      const layout = layoutTree(root);
      const view = (cur: TNode | null): TreeState => ({
        ...layout,
        nodes: layout.nodes.map((nd) => ({ ...nd, badge: calls.has(nd.id) ? `×${calls.get(nd.id)}` : undefined })),
        current: cur ? cur.id : null,
        done: [...calls.entries()].filter(([, c]) => c > 1).map(([id]) => id),
        aggs: [{ label: 'total calls', value: String(total), c: 'a' }],
      });
      steps.push({ tag: 'start', trace: ['Each node’s badge counts how many times rob(node) is computed. Robbing a node recurses into grandchildren, skipping it into children — so deep nodes are reached twice.'], state: view(root) });
      const rob = (n: TNode | null): number => {
        if (!n) return 0;
        total++;
        calls.set(n.id, (calls.get(n.id) ?? 0) + 1);
        if (steps.length < MAX_STEPS)
          steps.push({ tag: 'enter', trace: ['rob(', A(n.val), ')', calls.get(n.id)! > 1 ? [' — computing it for time #', calls.get(n.id)].join('') : '', ': rob it + grandchildren, or skip it + children.'], state: view(n) });
        let withN = n.val;
        if (n.left) withN += rob(n.left.left) + rob(n.left.right);
        if (n.right) withN += rob(n.right.left) + rob(n.right.right);
        const without = rob(n.left) + rob(n.right);
        return Math.max(withN, without);
      };
      const ans = rob(root);
      steps.push({ tag: 'ret', trace: ['Most loot: ', C(ans), ' — after ', C(total), ' calls for ', A(layout.nodes.length), ' houses.'], state: view(null) });
      return { steps, result: String(ans) };
    },
    note: 'Every node is solved once as someone’s child and again as someone’s grandchild, and the repetition compounds down the tree — exponential in the height. Returning a (robbed, skipped) pair from each node removes all repeats.',
    complexity: { time: 'O(1.6^h · …) — exponential', space: 'O(h)' },
  },
};

/* ================= Unique Binary Search Trees ================= */
const uniqueBST: ProblemDef = {
  slug: 'unique-binary-search-trees',
  title: 'Unique Binary Search Trees',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/unique-binary-search-trees/',
  technique: 'Fix each value as the root; the left and right counts multiply, and the roots sum.',
  widget: 'matrix',
  widgetTitle: 'Number of distinct BSTs per size',
  inputs: [{ key: 'n', label: 'n', defaultValue: '4' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numTrees(int n) {'),
      L('        vector<int> dp(n + 1, 0);'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int size = 1; size <= n; size++)', 'size'),
      L('            for (int root = 1; root <= size; root++)', 'root'),
      L('                dp[size] += dp[root-1] * dp[size-root];', 'add'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numTrees(int n) {'),
      L('        int[] dp = new int[n + 1];'),
      L('        dp[0] = 1;', 'base'),
      L('        for (int size = 1; size <= n; size++)', 'size'),
      L('            for (int root = 1; root <= size; root++)', 'root'),
      L('                dp[size] += dp[root-1] * dp[size-root];', 'add'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 10 });
    if (typeof n === 'string') return { error: n };
    const dp = [...Array(n + 1)].map(() => 0);
    dp[0] = 1;
    const steps: Step[] = [];
    const view = (size?: number, srcs: number[] = []): MatrixState => ({
      grid: [dp.map((v) => v)],
      rowLabels: ['count'],
      colLabels: [...Array(n + 1)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(srcs.map((k) => [`0,${k}`, 'src' as const])),
        ...(size !== undefined ? { [`0,${size}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'base',
      trace: ['An empty tree counts as ', B(1), ' shape. Only the ', A('size'), ' matters, not which specific values — any n distinct values give the same count.'],
      state: view(0),
    });
    for (let size = 1; size <= n; size++) {
      for (let root = 1; root <= size; root++) {
        const left = dp[root - 1];
        const right = dp[size - root];
        dp[size] += left * right;
        steps.push({
          tag: 'add',
          trace: [
            'With ', A(size), ' values, choosing the ', A(root), ordinalOf(root), ' smallest as the root leaves ', A(root - 1), ' on the left and ', A(size - root),
            ' on the right: ', A(left), ' × ', A(right), ' = ', B(left * right), ' shape(s). Running count ', B(dp[size]), '.',
          ],
          state: view(size, [root - 1, size - root]),
        });
        if (steps.length > MAX_STEPS) break;
      }
      steps.push({ tag: 'size', trace: [B(size), ' value(s) give ', B(dp[size]), ' distinct BST shape(s).'], state: view(size) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Distinct BSTs with ', C(n), ' node(s): ', C(dp[n]), '.'],
      state: { ...view(), mark: { [`0,${n}`]: 'final' } },
    });
    return { steps, result: String(dp[n]) };
  },
  note: 'These are the Catalan numbers, and the recurrence is the standard one: pick a root, multiply the independent left and right shapes, sum over roots. The BST ordering constraint is what makes "everything smaller goes left" forced — for arbitrary binary trees the labels would add another factor.',
  complexity: { time: 'O(n²)', space: 'O(n)' },
  brute: {
    label: 'Catalan formula',
    technique: 'The count is the n-th Catalan number, C(2n, n) / (n + 1), built up with one multiply and divide per step.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int numTrees(int n) {'),
        L('        long long c = 1;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'step'),
        L('            c = c * 2 * (2 * i + 1) / (i + 2);', 'step'),
        L('        return c;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int numTrees(int n) {'),
        L('        long c = 1;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'step'),
        L('            c = c * 2 * (2 * i + 1) / (i + 2);', 'step'),
        L('        return (int) c;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 1, max: 10 });
      if (typeof n === 'string') return { error: n };
      const cat = [1];
      const steps: Step[] = [];
      const view = (k: number | null): MatrixState => ({
        grid: [cat],
        rowLabels: ['Catalan'],
        colLabels: cat.map((_, i) => i),
        mark: k !== null ? { [`0,${k}`]: 'active' } : {},
      });
      steps.push({ tag: 'init', trace: ['The counts 1, 1, 2, 5, 14, … are the Catalan numbers, which obey Cₖ₊₁ = Cₖ · 2(2k + 1) / (k + 2).'], state: view(0) });
      for (let i = 0; i < n; i++) {
        const next = (cat[i] * 2 * (2 * i + 1)) / (i + 2);
        cat.push(next);
        steps.push({ tag: 'step', trace: ['C', A(i + 1), ' = ', A(cat[i]), ' × ', A(2 * (2 * i + 1)), ' / ', A(i + 2), ' = ', B(next), '.'], state: view(i + 1) });
      }
      steps.push({ tag: 'ret', trace: [C(cat[n]), ' structurally unique BSTs with ', A(n), ' nodes.'], state: view(n) });
      return { steps, result: String(cat[n]) };
    },
    note: 'The DP sums left × right counts over every root, which is O(n²). That recurrence is exactly the Catalan recurrence, which has a closed form computable in O(n).',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

const ordinalOf = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

/* ================= Partition Array for Maximum Sum ================= */
const partitionMaxSum: ProblemDef = {
  slug: 'partition-array-for-maximum-sum',
  title: 'Partition Array for Maximum Sum',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/partition-array-for-maximum-sum/',
  technique: 'dp[i] = best for the first i elements, trying every last group of length 1..k.',
  widget: 'array',
  widgetTitle: 'Array & best total per prefix',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 15, 7, 9, 2, 5, 10', wide: true },
    { key: 'k', label: 'Max group size (k)', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxSumAfterPartitioning(vector<int>& a, int k) {'),
      L('        int n = a.size();'),
      L('        vector<int> dp(n + 1, 0);', 'base'),
      L('        for (int i = 1; i <= n; i++) {', 'prefix'),
      L('            int mx = 0;'),
      L('            for (int len = 1; len <= k && len <= i; len++) {', 'len'),
      L('                mx = max(mx, a[i - len]);', 'max'),
      L('                dp[i] = max(dp[i], dp[i - len] + mx * len);', 'take'),
      L('            }'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxSumAfterPartitioning(int[] a, int k) {'),
      L('        int n = a.length;'),
      L('        int[] dp = new int[n + 1];', 'base'),
      L('        for (int i = 1; i <= n; i++) {', 'prefix'),
      L('            int mx = 0;'),
      L('            for (int len = 1; len <= k && len <= i; len++) {', 'len'),
      L('                mx = Math.max(mx, a[i - len]);', 'max'),
      L('                dp[i] = Math.max(dp[i], dp[i - len] + mx * len);', 'take'),
      L('            }'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 0, maxLen: 10 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 1, max: 5 });
    if (typeof k === 'string') return { error: k };
    const n = a.length;
    const dp = [...Array(n + 1)].map(() => 0);
    const steps: Step[] = [];
    const st = (i: number, win: [number, number] | null): ArrayState => ({
      arr: a,
      window: win,
      mark: win ? Object.fromEntries([...Array(win[1] - win[0] + 1)].map((_, x) => [win[0] + x, 'active' as const])) : {},
      aggs: [{ label: 'dp (best per prefix length)', value: dp.map((v, x) => `${x}:${v}`).join('  '), c: 'b' }],
    });
    steps.push({
      tag: 'base',
      trace: ['dp[i] is the best total using only the first ', A('i'), ' elements. An empty prefix scores ', B(0), '.'],
      state: st(0, null),
    });
    for (let i = 1; i <= n; i++) {
      let mx = 0;
      for (let len = 1; len <= k && len <= i; len++) {
        mx = Math.max(mx, a[i - len]);
        const cand = dp[i - len] + mx * len;
        const better = cand > dp[i];
        if (better) dp[i] = cand;
        steps.push({
          tag: 'take',
          trace: [
            'Make the last group the final ', A(len), ' element(s) — their max is ', A(mx), ', so the group scores ', A(`${mx}×${len}=${mx * len}`),
            ' on top of dp[', A(i - len), '] = ', A(dp[i - len], ), '. Total ', better ? B(cand) : F(cand), better ? ' — the best so far.' : `, no better than ${dp[i]}.`,
          ],
          state: st(i, [i - len, i - 1]),
        });
        if (steps.length > MAX_STEPS) break;
      }
      steps.push({ tag: 'prefix', trace: ['Best for the first ', B(i), ' element(s): ', B(dp[i]), '.'], state: st(i, null) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Maximum total after partitioning: ', C(dp[n]), '.'],
      state: { arr: a, mark: Object.fromEntries(a.map((_, i) => [i, 'final' as const])), aggs: [{ label: 'answer', value: String(dp[n]), c: 'c' }] },
    });
    return { steps, result: String(dp[n]) };
  },
  note: 'Extending the last group by one element lets the running max update in O(1), which is why the inner loop walks backwards from i rather than recomputing a max each time. Greedy fails here — taking the largest possible group is often worse than splitting to isolate a big value.',
  complexity: { time: 'O(n·k)', space: 'O(n)' },
  brute: {
    label: 'Plain recursion',
    technique: 'best(i) = max over group lengths 1…k of (group max × length) + best(i + length), with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxSumAfterPartitioning(vector<int>& a, int k) { return best(a, k, 0); }', 'init', 'ret'),
        L('    int best(vector<int>& a, int k, int i) {'),
        L('        if (i == a.size()) return 0;', 'base'),
        L('        int res = 0, mx = 0;', 'call'),
        L('        for (int len = 1; len <= k && i + len <= a.size(); len++) {', 'call'),
        L('            mx = max(mx, a[i + len - 1]);', 'call'),
        L('            res = max(res, mx * len + best(a, k, i + len));', 'call'),
        L('        }'),
        L('        return res;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxSumAfterPartitioning(int[] a, int k) { return best(a, k, 0); }', 'init', 'ret'),
        L('    private int best(int[] a, int k, int i) {'),
        L('        if (i == a.length) return 0;', 'base'),
        L('        int res = 0, mx = 0;', 'call'),
        L('        for (int len = 1; len <= k && i + len <= a.length; len++) {', 'call'),
        L('            mx = Math.max(mx, a[i + len - 1]);', 'call'),
        L('            res = Math.max(res, mx * len + best(a, k, i + len));', 'call'),
        L('        }'),
        L('        return res;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 0, maxLen: 10 });
      if (typeof a === 'string') return { error: a };
      const k = parseInt1(values.k, 'k', { min: 1, max: 5 });
      if (typeof k === 'string') return { error: k };
      const n = a.length;
      const calls = Array(n).fill(0);
      let total = 0;
      const steps: Step[] = [];
      const view = (i: number | null) => callsView(a, calls, i, total);
      steps.push({ tag: 'init', trace: ['best(i) = the most from a[i…]. Each box counts how often best(i) is recomputed.'], state: view(null) });
      const best = (i: number): number => {
        total++;
        if (i === n) return 0;
        calls[i]++;
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ['best(', A(i), '): try a first group of length 1…', A(Math.min(k, n - i)), '.'], state: view(i) });
        let res = 0;
        let mx = 0;
        for (let len = 1; len <= k && i + len <= n; len++) {
          mx = Math.max(mx, a[i + len - 1]);
          res = Math.max(res, mx * len + best(i + len));
        }
        return res;
      };
      const res = best(0);
      steps.push({ tag: 'ret', trace: ['Largest sum: ', C(res), ' — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Up to k branches per position gives roughly kⁿ calls, even though there are only n distinct starting points. The DP fills dp[0…n] once, each entry trying k group lengths.',
    complexity: { time: 'O(kⁿ)', space: 'O(n) stack' },
  },
};

/* ================= Largest Divisible Subset ================= */
const largestDivisibleSubset: ProblemDef = {
  slug: 'largest-divisible-subset',
  title: 'Largest Divisible Subset',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/largest-divisible-subset/',
  technique: 'Sort first — then divisibility becomes transitive along the chain, so it is longest-increasing-subsequence.',
  widget: 'array',
  widgetTitle: 'Sorted values & chain lengths',
  inputs: [{ key: 'nums', label: 'Distinct numbers', defaultValue: '1, 2, 4, 8, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> largestDivisibleSubset(vector<int>& nums) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        int n = nums.size(), best = 0;'),
      L('        vector<int> dp(n, 1), prev(n, -1);', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'outer'),
      L('            for (int j = 0; j < i; j++)', 'inner'),
      L('                if (nums[i] % nums[j] == 0 && dp[j] + 1 > dp[i]) {', 'extend'),
      L('                    dp[i] = dp[j] + 1; prev[i] = j;', 'extend'),
      L('                }'),
      L('            if (dp[i] > dp[best]) best = i;', 'best'),
      L('        }'),
      L('        vector<int> res;'),
      L('        for (int i = best; i >= 0; i = prev[i]) res.push_back(nums[i]);', 'rebuild'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> largestDivisibleSubset(int[] nums) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        int n = nums.length, best = 0;'),
      L('        int[] dp = new int[n], prev = new int[n];'),
      L('        Arrays.fill(dp, 1); Arrays.fill(prev, -1);', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'outer'),
      L('            for (int j = 0; j < i; j++)', 'inner'),
      L('                if (nums[i] % nums[j] == 0 && dp[j] + 1 > dp[i]) {', 'extend'),
      L('                    dp[i] = dp[j] + 1; prev[i] = j;', 'extend'),
      L('                }'),
      L('            if (dp[i] > dp[best]) best = i;', 'best'),
      L('        }'),
      L('        LinkedList<Integer> res = new LinkedList<>();'),
      L('        for (int i = best; i >= 0; i = prev[i]) res.addFirst(nums[i]);', 'rebuild'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { min: 1, maxLen: 10 });
    if (typeof parsed === 'string') return { error: parsed };
    if (new Set(parsed).size !== parsed.length) return { error: 'The numbers must be distinct.' };
    const nums = [...parsed].sort((x, y) => x - y);
    const n = nums.length;
    const dp = nums.map(() => 1);
    const prev = nums.map(() => -1);
    const steps: Step[] = [];
    let best = 0;
    const st = (i?: number, j?: number): ArrayState => ({
      arr: nums,
      mark: {
        ...(j !== undefined ? { [j]: 'good' as const } : {}),
        ...(i !== undefined ? { [i]: 'active' as const } : {}),
      },
      aggs: [
        { label: 'chain length ending here', value: dp.join(', '), c: 'b' },
        { label: 'longest so far', value: String(dp[best]), c: 'c' },
      ],
    });
    steps.push({
      tag: 'sort',
      trace: [
        'Sorting is what makes this work: in a sorted chain, checking each number against the ', A('previous one'), ' is enough — divisibility carries all the way back.',
      ],
      state: st(),
    });
    steps.push({ tag: 'init', trace: ['Every number alone is a valid subset of size ', B(1), '.'], state: st() });
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[i] % nums[j] === 0 && dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          prev[i] = j;
          steps.push({
            tag: 'extend',
            trace: [A(nums[i]), ' is divisible by ', B(nums[j]), ', so it extends that chain to length ', B(dp[i]), '.'],
            state: st(i, j),
          });
        } else if (nums[i] % nums[j] === 0) {
          steps.push({
            tag: 'inner',
            trace: [A(nums[i]), ' is divisible by ', F(nums[j]), ', but that chain is no longer than the current best of ', B(dp[i]), '.'],
            state: st(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (dp[i] > dp[best]) {
        best = i;
        steps.push({ tag: 'best', trace: ['Longest chain now ends at ', C(nums[i]), ' with length ', C(dp[i]), '.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const res: number[] = [];
    const chainIdx: number[] = [];
    for (let i = best; i >= 0; i = prev[i]) {
      res.unshift(nums[i]);
      chainIdx.push(i);
    }
    steps.push({
      tag: 'rebuild',
      trace: ['Follow the predecessor links backwards from ', A(nums[best]), ' to rebuild the subset.'],
      state: { arr: nums, mark: Object.fromEntries(chainIdx.map((i) => [i, 'good' as const])) },
    });
    steps.push({
      tag: 'ret',
      trace: ['Largest divisible subset: ', C(`[${res.join(', ')}]`), '.'],
      state: { arr: nums, mark: Object.fromEntries(chainIdx.map((i) => [i, 'final' as const])) },
    });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `size ${res.length}` };
  },
  note: 'Every pair in the answer must divide, but sorting reduces that to checking consecutive elements only — if a divides b and b divides c, then a divides c. The prev array is what turns "how long" into "which elements", a pattern worth reusing in any LIS-shaped problem that asks for the sequence itself.',
  complexity: { time: 'O(n²)', space: 'O(n)' },
  brute: {
    label: 'Try every subset',
    technique: 'Check all 2ⁿ subsets; keep the biggest one in which every pair divides.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> largestDivisibleSubset(vector<int>& nums) {'),
        L('        sort(nums.begin(), nums.end());', 'init'),
        L('        int n = nums.size(); vector<int> best;', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try', 'better'),
        L('            vector<int> sub;', 'try', 'better'),
        L('            for (int j = 0; j < n; j++) if (mask >> j & 1) sub.push_back(nums[j]);', 'try', 'better'),
        L('            if (sub.size() > best.size() && chainDivides(sub)) best = sub;', 'better'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('    // chainDivides: each element divides the next (enough once sorted)'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> largestDivisibleSubset(int[] nums) {'),
        L('        Arrays.sort(nums);', 'init'),
        L('        int n = nums.length; List<Integer> best = new ArrayList<>();', 'init'),
        L('        for (int mask = 1; mask < (1 << n); mask++) {', 'try', 'better'),
        L('            List<Integer> sub = new ArrayList<>();', 'try', 'better'),
        L('            for (int j = 0; j < n; j++) if ((mask >> j & 1) == 1) sub.add(nums[j]);', 'try', 'better'),
        L('            if (sub.size() > best.size() && chainDivides(sub)) best = sub;', 'better'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('    // chainDivides: each element divides the next (enough once sorted)'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntArray(values.nums, { min: 1, maxLen: 10 });
      if (typeof parsed === 'string') return { error: parsed };
      if (new Set(parsed).size !== parsed.length) return { error: 'The numbers must be distinct.' };
      const nums = [...parsed].sort((x, y) => x - y);
      const n = nums.length;
      const steps: Step[] = [];
      let best: number[] = [];
      let bestMask = 0;
      const st = (mask: number): ArrayState => ({
        arr: nums,
        mark: Object.fromEntries(nums.map((_, j) => [j, mask >> j & 1 ? 'good' : undefined]).filter(([, m]) => m)),
        aggs: [
          { label: 'subsets', value: String(2 ** n - 1), c: 'a' },
          { label: 'best', value: `[${best.join(', ')}]`, c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Sort, then test all ', A(2 ** n - 1), ' non-empty subsets. In sorted order it is enough that each element divides the next.'], state: st(0) });
      for (let mask = 1; mask < 1 << n; mask++) {
        const sub = nums.filter((_, j) => mask >> j & 1);
        if (sub.length <= best.length) continue;
        const ok = sub.every((v, i) => i === 0 || v % sub[i - 1] === 0);
        if (ok) {
          best = sub;
          bestMask = mask;
          steps.push({ tag: 'better', trace: ['Subset ', B(`[${sub.join(', ')}]`), ' is a divisible chain of size ', B(sub.length), ' — best so far.'], state: st(mask) });
        } else if (steps.length < 25) {
          steps.push({ tag: 'try', trace: ['Subset ', F(`[${sub.join(', ')}]`), ' breaks the chain — reject.'], state: st(mask) });
        }
      }
      steps.push({ tag: 'ret', trace: ['Largest divisible subset: ', C(`[${best.join(', ')}]`), '.'], state: { ...st(bestMask), mark: Object.fromEntries(nums.map((_, j) => [j, bestMask >> j & 1 ? 'final' : 'dim'])) } });
      return { steps, result: `[${best.join(', ')}]`, resultDetail: `size ${best.length}` };
    },
    note: 'Exponential: 2ⁿ subsets, each checked in O(n). Sorting makes divisibility chain-like, so the LIS-style DP only needs to link each number to its best divisor before it.',
    complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)' },
  },
};

/* ================= Longest String Chain ================= */
const longestStringChain: ProblemDef = {
  slug: 'longest-string-chain',
  title: 'Longest String Chain',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-string-chain/',
  technique: 'Sort by length, then for each word try deleting each letter and look the result up.',
  widget: 'array',
  widgetTitle: 'Words sorted by length',
  inputs: [{ key: 'words', label: 'Words', defaultValue: 'a, b, ba, bca, bda, bdca', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestStrChain(vector<string>& words) {'),
      L('        sort(words.begin(), words.end(), [](auto& a, auto& b) {', 'sort'),
      L('            return a.size() < b.size();', 'sort'),
      L('        });'),
      L('        unordered_map<string,int> dp;'),
      L('        int best = 0;'),
      L('        for (auto& w : words) {', 'word'),
      L('            dp[w] = 1;', 'word'),
      L('            for (int i = 0; i < w.size(); i++) {', 'drop'),
      L('                string pre = w.substr(0, i) + w.substr(i + 1);', 'drop'),
      L('                if (dp.count(pre))', 'found'),
      L('                    dp[w] = max(dp[w], dp[pre] + 1);', 'found'),
      L('            }'),
      L('            best = max(best, dp[w]);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestStrChain(String[] words) {'),
      L('        Arrays.sort(words, (a, b) -> a.length() - b.length());', 'sort'),
      L('        Map<String,Integer> dp = new HashMap<>();'),
      L('        int best = 0;'),
      L('        for (String w : words) {', 'word'),
      L('            dp.put(w, 1);', 'word'),
      L('            for (int i = 0; i < w.length(); i++) {', 'drop'),
      L('                String pre = w.substring(0,i) + w.substring(i+1);', 'drop'),
      L('                if (dp.containsKey(pre))', 'found'),
      L('                    dp.put(w, Math.max(dp.get(w), dp.get(pre) + 1));', 'found'),
      L('            }'),
      L('            best = Math.max(best, dp.get(w));', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const words = (values.words ?? '')
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0 || words.length > 10) return { error: 'Enter 1–10 words.' };
    if (words.some((w) => !/^[a-z]{1,8}$/.test(w))) return { error: 'Each word must be 1–8 lowercase letters.' };
    const sorted = [...words].sort((a, b) => a.length - b.length);
    const dp = new Map<string, number>();
    const steps: Step[] = [];
    let best = 0;
    const st = (i?: number, hit?: string): ArrayState => ({
      arr: sorted,
      mark: {
        ...Object.fromEntries(sorted.map((w, k) => [k, hit === w ? ('good' as const) : undefined]).filter(([, v]) => v)),
        ...(i !== undefined ? { [i]: 'active' as const } : {}),
      },
      aggs: [
        { label: 'chain length per word', value: [...dp.entries()].map(([w, v]) => `${w}:${v}`).join('  ') || '—', c: 'b' },
        { label: 'longest', value: String(best), c: 'c' },
      ],
    });
    steps.push({
      tag: 'sort',
      trace: [
        'A predecessor is always ', A('one letter shorter'), ', so sorting by length guarantees every predecessor is already solved when we reach a word.',
      ],
      state: st(),
    });
    for (let i = 0; i < sorted.length; i++) {
      const w = sorted[i];
      dp.set(w, 1);
      steps.push({ tag: 'word', trace: ['Word "', A(w), '" starts with a chain of ', B(1), ' (itself).'], state: st(i) });
      for (let k = 0; k < w.length; k++) {
        const pre = w.slice(0, k) + w.slice(k + 1);
        if (dp.has(pre)) {
          const cand = dp.get(pre)! + 1;
          if (cand > dp.get(w)!) dp.set(w, cand);
          steps.push({
            tag: 'found',
            trace: [
              'Dropping \'', A(w[k]), '\' gives "', B(pre), '", which is in the list with chain ', B(dp.get(pre)!), ' — so "', A(w), '" reaches ', B(dp.get(w)!), '.',
            ],
            state: st(i, pre),
          });
        } else {
          steps.push({
            tag: 'drop',
            trace: ['Dropping \'', F(w[k]), '\' gives "', F(pre), '", which is not in the word list.'],
            state: st(i),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (dp.get(w)! > best) {
        best = dp.get(w)!;
        steps.push({ tag: 'best', trace: ['New longest chain: ', C(best), ', ending at "', C(w), '".'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Longest possible string chain: ', C(best), '.'], state: st() });
    return { steps, result: String(best) };
  },
  note: 'Generating each word\'s predecessors by deletion is far cheaper than comparing every pair — L candidates per word instead of n comparisons of length L. That is what turns an O(n²·L) pairwise check into O(n·L²), which matters when the dictionary is large.',
  complexity: { time: 'O(n·L²)', space: 'O(n)' },
  brute: {
    label: 'Plain recursion',
    technique: 'chain(w) = 1 + the longest chain of any word obtained by deleting one letter, recursed with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    unordered_set<string> dict;'),
        L('    int chain(const string& w) {'),
        L('        int best = 1;', 'call'),
        L('        for (int i = 0; i < w.size(); i++) {', 'call'),
        L('            string prev = w.substr(0, i) + w.substr(i + 1);', 'call'),
        L('            if (dict.count(prev)) best = max(best, 1 + chain(prev));', 'call'),
        L('        }'),
        L('        return best;'),
        L('    }'),
        L('public:'),
        L('    int longestStrChain(vector<string>& words) {'),
        L('        dict = unordered_set<string>(words.begin(), words.end());', 'init'),
        L('        int best = 0;', 'init'),
        L('        for (auto& w : words) best = max(best, chain(w));', 'init', 'ret'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    Set<String> dict;'),
        L('    int chain(String w) {'),
        L('        int best = 1;', 'call'),
        L('        for (int i = 0; i < w.length(); i++) {', 'call'),
        L('            String prev = w.substring(0, i) + w.substring(i + 1);', 'call'),
        L('            if (dict.contains(prev)) best = Math.max(best, 1 + chain(prev));', 'call'),
        L('        }'),
        L('        return best;'),
        L('    }'),
        L('    public int longestStrChain(String[] words) {'),
        L('        dict = new HashSet<>(Arrays.asList(words));', 'init'),
        L('        int best = 0;', 'init'),
        L('        for (String w : words) best = Math.max(best, chain(w));', 'init', 'ret'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const words = (values.words ?? '')
        .split(/[,\s]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      if (words.length === 0 || words.length > 10) return { error: 'Enter 1–10 words.' };
      if (words.some((w) => !/^[a-z]{1,8}$/.test(w))) return { error: 'Each word must be 1–8 lowercase letters.' };
      const sorted = [...words].sort((a, b) => a.length - b.length);
      const dict = new Set(words);
      const calls = sorted.map(() => 0);
      let total = 0;
      const steps: Step[] = [];
      const view = (i: number | null) => callsView(sorted, calls, i, total);
      steps.push({ tag: 'init', trace: ['chain(w) = the longest chain ending at w. Each box counts how often chain(w) is recomputed.'], state: view(null) });
      const chain = (w: string): number => {
        total++;
        const idx = sorted.indexOf(w);
        calls[idx]++;
        const preds = [...new Set([...Array(w.length)].map((_, i) => w.slice(0, i) + w.slice(i + 1)))].filter((p) => dict.has(p));
        if (steps.length < MAX_STEPS)
          steps.push({ tag: 'call', trace: ['chain("', A(w), '"): predecessors in the list: ', preds.length ? A(preds.join(', ')) : F('none'), '.'], state: view(idx) });
        let best = 1;
        for (const p of preds) best = Math.max(best, 1 + chain(p));
        return best;
      };
      let best = 0;
      for (const w of sorted) best = Math.max(best, chain(w));
      steps.push({ tag: 'ret', trace: ['Longest chain: ', C(best), ' — after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(best) };
    },
    note: 'Short words sit at the bottom of many chains and get re-explored from every longer word above them. Processing words by length and storing dp[word] computes each chain length exactly once.',
    complexity: { time: 'Exponential in chain length', space: 'O(L) stack' },
  },
};

export const dp3: ProblemDef[] = [
  minCostClimbing,
  uniquePathsII,
  triangle,
  fallingPathSum,
  cherryPickupII,
  lastStoneWeightII,
  coinChangeII,
  combinationSumIV,
  countSquares,
  houseRobberIII,
  uniqueBST,
  partitionMaxSum,
  largestDivisibleSubset,
  longestStringChain,
];
