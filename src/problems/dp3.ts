// Dynamic Programming, part 3 — grids, knapsack variants and subsequence chains.
import type { ArrayState, MatrixState, ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1, parseIntArray, parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';

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
