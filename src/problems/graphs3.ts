// Graphs, part 3 — grid traversals (matrix widget).
import type { MatrixState, ProblemDef, Step } from '../lib/types';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/** Parse a grid of small integers, rows separated by ";". */
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

const labels = (R: number, C: number) => ({
  rowLabels: [...Array(R)].map((_, i) => i),
  colLabels: [...Array(C)].map((_, i) => i),
});

/* ================= Flood Fill ================= */
const floodFill: ProblemDef = {
  slug: 'flood-fill',
  title: 'Flood Fill',
  category: 'Graphs',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/flood-fill/',
  technique: 'DFS from the start cell through every 4-neighbour sharing the original colour.',
  widget: 'matrix',
  widgetTitle: 'Image',
  inputs: [
    { key: 'grid', label: 'Image (rows ";" separated)', defaultValue: '1,1,1;1,1,0;1,0,1', wide: true },
    { key: 'sr', label: 'Start row', defaultValue: '1' },
    { key: 'sc', label: 'Start column', defaultValue: '1' },
    { key: 'color', label: 'New colour', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> floodFill(vector<vector<int>>& img,'),
      L('                                  int sr, int sc, int color) {'),
      L('        int old = img[sr][sc];', 'init'),
      L('        if (old != color) fill(img, sr, sc, old, color);', 'guard'),
      L('        return img;', 'ret'),
      L('    }'),
      L('    void fill(vector<vector<int>>& g, int r, int c, int old, int color) {', 'enter'),
      L('        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size()) return;', 'bounds'),
      L('        if (g[r][c] != old) return;', 'mismatch'),
      L('        g[r][c] = color;', 'paint'),
      L('        fill(g, r+1, c, old, color); fill(g, r-1, c, old, color);', 'recurse'),
      L('        fill(g, r, c+1, old, color); fill(g, r, c-1, old, color);', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] floodFill(int[][] img, int sr, int sc, int color) {'),
      L('        int old = img[sr][sc];', 'init'),
      L('        if (old != color) fill(img, sr, sc, old, color);', 'guard'),
      L('        return img;', 'ret'),
      L('    }'),
      L('    void fill(int[][] g, int r, int c, int old, int color) {', 'enter'),
      L('        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length) return;', 'bounds'),
      L('        if (g[r][c] != old) return;', 'mismatch'),
      L('        g[r][c] = color;', 'paint'),
      L('        fill(g, r+1, c, old, color); fill(g, r-1, c, old, color);', 'recurse'),
      L('        fill(g, r, c+1, old, color); fill(g, r, c-1, old, color);', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = numGrid(values.grid);
    if (typeof g0 === 'string') return { error: g0 };
    const g = g0.map((r) => [...r]);
    const R = g.length;
    const Cn = g[0].length;
    const sr = Number(values.sr);
    const sc = Number(values.sc);
    if (!Number.isInteger(sr) || sr < 0 || sr >= R) return { error: `Start row must be between 0 and ${R - 1}.` };
    if (!Number.isInteger(sc) || sc < 0 || sc >= Cn) return { error: `Start column must be between 0 and ${Cn - 1}.` };
    const color = Number(values.color);
    if (!Number.isInteger(color)) return { error: 'New colour must be an integer.' };

    const steps: Step[] = [];
    const painted = new Set<string>();
    const old = g[sr][sc];
    const view = (active?: [number, number], mark: 'active' | 'dim' = 'active'): MatrixState => ({
      grid: g.map((r) => [...r]),
      ...labels(R, Cn),
      mark: {
        ...Object.fromEntries([...painted].map((k) => [k, 'good' as const])),
        ...(active ? { [`${active[0]},${active[1]}`]: mark } : {}),
      },
      aggs: [
        { label: 'original colour', value: String(old), c: 'a' },
        { label: 'new colour', value: String(color), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['The starting pixel is colour ', A(old), '. Spread to every 4-connected pixel sharing that exact colour.'],
      state: view([sr, sc]),
    });
    if (old === color) {
      steps.push({
        tag: 'guard',
        trace: [
          'The new colour is already ', F(color), ' — repainting would never change a cell, so the "already painted" test could never stop the recursion. Return immediately.',
        ],
        state: view([sr, sc]),
      });
      steps.push({ tag: 'ret', trace: ['Image unchanged.'], state: view() });
      return { steps, result: g.map((r) => r.join('')).join(';') };
    }
    steps.push({ tag: 'guard', trace: ['New colour differs from the old one, so the fill is safe to start.'], state: view([sr, sc]) });
    const fill = (r: number, c: number) => {
      if (steps.length > MAX_STEPS) return;
      if (r < 0 || r >= R || c < 0 || c >= Cn) {
        steps.push({ tag: 'bounds', trace: ['(', F(r), ',', F(c), ') is off the image — stop.'], state: view() });
        return;
      }
      if (g[r][c] !== old) {
        steps.push({
          tag: 'mismatch',
          trace: ['(', F(r), ',', F(c), ') holds ', F(g[r][c]), ', not the original ', A(old), ' — the region ends here.'],
          state: view([r, c], 'dim'),
        });
        return;
      }
      g[r][c] = color;
      painted.add(`${r},${c}`);
      steps.push({ tag: 'paint', trace: ['Paint (', B(r), ',', B(c), ') with ', B(color), '. Repainting also marks it visited.'], state: view([r, c]) });
      steps.push({ tag: 'recurse', trace: ['Spread to its four neighbours.'], state: view([r, c]) });
      fill(r + 1, c);
      fill(r - 1, c);
      fill(r, c + 1);
      fill(r, c - 1);
    };
    fill(sr, sc);
    steps.push({
      tag: 'ret',
      trace: [C(painted.size), ' pixel(s) repainted.'],
      state: view(),
    });
    return { steps, result: g.map((r) => r.join('')).join(';'), resultDetail: `${painted.size} pixels changed` };
  },
  note: 'Overwriting the colour is what doubles as the visited marker, so no separate seen array is needed — but only because the new colour differs from the old. That single guard is the entire trick to the problem; without it the recursion never terminates.',
  complexity: { time: 'O(R·C)', space: 'O(R·C) recursion' },
  brute: {
    label: 'BFS with a queue',
    technique: 'Paint breadth-first: recolour the start pixel, then repeatedly dequeue a pixel and enqueue its same-coloured neighbours.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> floodFill(vector<vector<int>>& g, int sr, int sc, int color) {'),
        L('        int old = g[sr][sc];', 'init'),
        L('        if (old == color) return g;', 'guard'),
        L('        queue<pair<int,int>> q; q.push({sr, sc}); g[sr][sc] = color;', 'paint'),
        L('        while (!q.empty()) {', 'paint'),
        L('            auto [r, c] = q.front(); q.pop();', 'paint'),
        L('            for (auto [dr, dc] : {pair{1,0}, {-1,0}, {0,1}, {0,-1}}) {', 'paint'),
        L('                int nr = r + dr, nc = c + dc;', 'paint'),
        L('                if (nr >= 0 && nc >= 0 && nr < g.size() && nc < g[0].size() && g[nr][nc] == old)', 'paint'),
        L('                    { g[nr][nc] = color; q.push({nr, nc}); }', 'paint'),
        L('            }'),
        L('        }'),
        L('        return g;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] floodFill(int[][] g, int sr, int sc, int color) {'),
        L('        int old = g[sr][sc];', 'init'),
        L('        if (old == color) return g;', 'guard'),
        L('        Deque<int[]> q = new ArrayDeque<>(); q.add(new int[]{sr, sc}); g[sr][sc] = color;', 'paint'),
        L('        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};', 'paint'),
        L('        while (!q.isEmpty()) {', 'paint'),
        L('            int[] p = q.poll();', 'paint'),
        L('            for (int[] d : dirs) {', 'paint'),
        L('                int nr = p[0] + d[0], nc = p[1] + d[1];', 'paint'),
        L('                if (nr >= 0 && nc >= 0 && nr < g.length && nc < g[0].length && g[nr][nc] == old)', 'paint'),
        L('                    { g[nr][nc] = color; q.add(new int[]{nr, nc}); }', 'paint'),
        L('            }'),
        L('        }'),
        L('        return g;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g0 = numGrid(values.grid);
      if (typeof g0 === 'string') return { error: g0 };
      const g = g0.map((r) => [...r]);
      const R = g.length;
      const Cn = g[0].length;
      const sr = Number(values.sr);
      const sc = Number(values.sc);
      if (!Number.isInteger(sr) || sr < 0 || sr >= R) return { error: `Start row must be between 0 and ${R - 1}.` };
      if (!Number.isInteger(sc) || sc < 0 || sc >= Cn) return { error: `Start column must be between 0 and ${Cn - 1}.` };
      const color = Number(values.color);
      if (!Number.isInteger(color)) return { error: 'New colour must be an integer.' };
      const old = g[sr][sc];
      const painted = new Set<string>();
      const steps: Step[] = [];
      const view = (active?: string, queued: string[] = []): MatrixState => ({
        grid: g.map((r) => [...r]),
        ...labels(R, Cn),
        mark: { ...Object.fromEntries([...painted].map((k) => [k, 'good' as const])), ...Object.fromEntries(queued.map((k) => [k, 'win' as const])), ...(active ? { [active]: 'active' as const } : {}) },
      });
      steps.push({ tag: 'init', trace: ['Start pixel colour is ', A(old), '. Spread level by level with a queue.'], state: view(`${sr},${sc}`) });
      if (old === color) {
        steps.push({ tag: 'guard', trace: ['Already colour ', F(color), ' — nothing to do.'], state: view() });
        return { steps, result: g.map((r) => r.join('')).join(';') };
      }
      g[sr][sc] = color;
      painted.add(`${sr},${sc}`);
      const q: [number, number][] = [[sr, sc]];
      while (q.length && steps.length < MAX_STEPS) {
        const [r, c] = q.shift()!;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < R && nc < Cn && g[nr][nc] === old) {
            g[nr][nc] = color;
            painted.add(`${nr},${nc}`);
            q.push([nr, nc]);
          }
        }
        steps.push({ tag: 'paint', trace: ['Dequeue (', A(r), ',', A(c), ') and paint its matching neighbours — ', A(q.length), ' pixel(s) waiting.'], state: view(`${r},${c}`, q.map(([a, b]) => `${a},${b}`)) });
      }
      steps.push({ tag: 'ret', trace: ['Done — ', C(painted.size), ' pixel(s) repainted.'], state: view() });
      return { steps, result: g.map((r) => r.join('')).join(';'), resultDetail: `${painted.size} pixels changed` };
    },
    note: 'Same O(R·C) work as the recursive DFS, painting pixels in rings around the start instead of along one deep path. The queue avoids stack overflow on large regions.',
    complexity: { time: 'O(R·C)', space: 'O(R·C) queue' },
  },
};

/* ================= 01 Matrix ================= */
const zeroOneMatrix: ProblemDef = {
  slug: '01-matrix',
  title: '01 Matrix',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/01-matrix/',
  technique: 'Multi-source BFS: start from every 0 at once, so the first visit is the nearest one.',
  widget: 'matrix',
  widgetTitle: 'Distance to the nearest 0',
  inputs: [{ key: 'grid', label: 'Binary grid (rows ";" separated)', defaultValue: '0,0,0;0,1,0;1,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> updateMatrix(vector<vector<int>>& m) {'),
      L('        int R = m.size(), C = m[0].size();'),
      L('        vector<vector<int>> d(R, vector<int>(C, -1));'),
      L('        queue<pair<int,int>> q;'),
      L('        for (int r = 0; r < R; r++)', 'seed'),
      L('            for (int c = 0; c < C; c++)', 'seed'),
      L('                if (m[r][c] == 0) { d[r][c] = 0; q.push({r,c}); }', 'seed'),
      L('        int dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1};'),
      L('        while (!q.empty()) {', 'pop'),
      L('            auto [r, c] = q.front(); q.pop();', 'pop'),
      L('            for (int k = 0; k < 4; k++) {', 'expand'),
      L('                int nr = r + dr[k], nc = c + dc[k];'),
      L('                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;'),
      L('                if (d[nr][nc] != -1) continue;', 'skip'),
      L('                d[nr][nc] = d[r][c] + 1;', 'set'),
      L('                q.push({nr, nc});', 'set'),
      L('            }'),
      L('        }'),
      L('        return d;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] updateMatrix(int[][] m) {'),
      L('        int R = m.length, C = m[0].length;'),
      L('        int[][] d = new int[R][C];'),
      L('        for (int[] row : d) Arrays.fill(row, -1);'),
      L('        Queue<int[]> q = new LinkedList<>();'),
      L('        for (int r = 0; r < R; r++)', 'seed'),
      L('            for (int c = 0; c < C; c++)', 'seed'),
      L('                if (m[r][c] == 0) { d[r][c] = 0; q.add(new int[]{r,c}); }', 'seed'),
      L('        int[] dr = {1,-1,0,0}, dc = {0,0,1,-1};'),
      L('        while (!q.isEmpty()) {', 'pop'),
      L('            int[] cur = q.remove();', 'pop'),
      L('            for (int k = 0; k < 4; k++) {', 'expand'),
      L('                int nr = cur[0]+dr[k], nc = cur[1]+dc[k];'),
      L('                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;'),
      L('                if (d[nr][nc] != -1) continue;', 'skip'),
      L('                d[nr][nc] = d[cur[0]][cur[1]] + 1;', 'set'),
      L('                q.add(new int[]{nr, nc});', 'set'),
      L('            }'),
      L('        }'),
      L('        return d;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m = numGrid(values.grid, 5, 5);
    if (typeof m === 'string') return { error: m };
    if (!m.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
    if (!m.some((r) => r.some((v) => v === 0))) return { error: 'The grid needs at least one 0.' };
    const R = m.length;
    const Cn = m[0].length;
    const d = m.map((r) => r.map(() => -1));
    const steps: Step[] = [];
    const queue: [number, number][] = [];
    const view = (active?: [number, number], frontier: string[] = []): MatrixState => ({
      grid: d.map((r) => r.map((v) => (v === -1 ? '?' : v))),
      ...labels(R, Cn),
      mark: {
        ...Object.fromEntries(frontier.map((k) => [k, 'good' as const])),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'queue', value: queue.map(([r, c]) => `(${r},${c})`).join(' ') || '—', c: 'b' }],
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (m[r][c] === 0) {
          d[r][c] = 0;
          queue.push([r, c]);
        }
      }
    }
    steps.push({
      tag: 'seed',
      trace: [
        'Seed the queue with ', A('every'), ' zero at distance 0. Running one BFS per 1-cell would be O((R·C)²); starting from all sources at once does the whole grid in one sweep.',
      ],
      state: view(undefined, queue.map(([r, c]) => `${r},${c}`)),
    });
    const dirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];
      steps.push({ tag: 'pop', trace: ['Take (', A(r), ',', A(c), ') at distance ', A(d[r][c]), ' off the queue.'], state: view([r, c]) });
      const added: string[] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= Cn) continue;
        if (d[nr][nc] !== -1) continue;
        d[nr][nc] = d[r][c] + 1;
        queue.push([nr, nc]);
        added.push(`${nr},${nc}`);
      }
      if (added.length) {
        steps.push({
          tag: 'set',
          trace: [
            'Its unvisited neighbours ', B(added.map((k) => `(${k})`).join(' ')), ' get distance ', B(d[r][c] + 1), '. BFS reaches each cell on its ', A('shortest'), ' path, so this is final.',
          ],
          state: view([r, c], added),
        });
      } else {
        steps.push({ tag: 'skip', trace: ['All its neighbours already have a distance — nothing to do.'], state: view([r, c]) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Every cell now holds its distance to the nearest zero.'],
      state: { grid: d, ...labels(R, Cn), mark: Object.fromEntries(d.flatMap((row, r) => row.map((_, c) => [`${r},${c}`, 'final' as const]))) },
    });
    return { steps, result: d.map((r) => r.join(',')).join(';') };
  },
  note: 'Multi-source BFS works because the queue stays sorted by distance no matter how many starting points there are — the first time a cell is reached is via the nearest source. Marking distance at enqueue time rather than dequeue time is what stops a cell being queued twice.',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
  brute: {
    label: 'Measure against every 0',
    technique: 'For every 1-cell, compute the Manhattan distance to every 0-cell and keep the smallest.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> updateMatrix(vector<vector<int>>& m) {'),
        L('        int R = m.size(), C = m[0].size();', 'init'),
        L('        vector<vector<int>> d(R, vector<int>(C, 0));', 'init'),
        L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (m[r][c] == 1) {', 'cell'),
        L('            int best = INT_MAX;', 'cell'),
        L('            for (int zr = 0; zr < R; zr++) for (int zc = 0; zc < C; zc++)', 'cell'),
        L('                if (m[zr][zc] == 0) best = min(best, abs(r - zr) + abs(c - zc));', 'cell'),
        L('            d[r][c] = best;', 'cell'),
        L('        }'),
        L('        return d;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] updateMatrix(int[][] m) {'),
        L('        int R = m.length, C = m[0].length;', 'init'),
        L('        int[][] d = new int[R][C];', 'init'),
        L('        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (m[r][c] == 1) {', 'cell'),
        L('            int best = Integer.MAX_VALUE;', 'cell'),
        L('            for (int zr = 0; zr < R; zr++) for (int zc = 0; zc < C; zc++)', 'cell'),
        L('                if (m[zr][zc] == 0) best = Math.min(best, Math.abs(r - zr) + Math.abs(c - zc));', 'cell'),
        L('            d[r][c] = best;', 'cell'),
        L('        }'),
        L('        return d;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const m = numGrid(values.grid, 5, 5);
      if (typeof m === 'string') return { error: m };
      if (!m.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
      if (!m.some((r) => r.some((v) => v === 0))) return { error: 'The grid needs at least one 0.' };
      const R = m.length;
      const Cn = m[0].length;
      const zeros: [number, number][] = [];
      m.forEach((row, r) => row.forEach((v, c) => v === 0 && zeros.push([r, c])));
      const d: number[][] = m.map((r) => r.map((v) => (v === 0 ? 0 : -1)));
      let checks = 0;
      const steps: Step[] = [];
      const view = (active?: [number, number], near?: [number, number]): MatrixState => ({
        grid: d.map((r) => r.map((v) => (v === -1 ? '?' : v))),
        ...labels(R, Cn),
        mark: { ...(near ? { [`${near[0]},${near[1]}`]: 'good' as const } : {}), ...(active ? { [`${active[0]},${active[1]}`]: 'active' as const } : {}) },
        aggs: [{ label: 'distance checks', value: String(checks), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['0-cells are already distance 0. Every 1-cell will be compared with all ', A(zeros.length), ' zeros.'], state: view() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          if (m[r][c] !== 1) continue;
          let best = Infinity;
          let near: [number, number] = zeros[0];
          for (const [zr, zc] of zeros) {
            checks++;
            const dd = Math.abs(r - zr) + Math.abs(c - zc);
            if (dd < best) {
              best = dd;
              near = [zr, zc];
            }
          }
          d[r][c] = best;
          steps.push({ tag: 'cell', trace: ['(', A(r), ',', A(c), '): nearest 0 is at (', B(near[0]), ',', B(near[1]), '), distance ', B(best), '.'], state: view([r, c], near) });
        }
      steps.push({ tag: 'ret', trace: ['All distances filled after ', A(checks), ' checks.'], state: view() });
      return { steps, result: d.map((r) => r.join(',')).join(';') };
    },
    note: 'Every 1 is compared with every 0, which is O((R·C)²) in the worst case. Multi-source BFS from all zeros at once reaches each cell exactly once, at its shortest distance.',
    complexity: { time: 'O((R·C)²)', space: 'O(1) extra' },
  },
};

/* ================= Shortest Path in Binary Matrix ================= */
const shortestPathBinary: ProblemDef = {
  slug: 'shortest-path-in-binary-matrix',
  title: 'Shortest Path in Binary Matrix',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
  technique: 'BFS over 8-directional moves — unweighted edges mean the first arrival is the shortest.',
  widget: 'matrix',
  widgetTitle: 'Grid (0 = open, 1 = blocked)',
  inputs: [{ key: 'grid', label: 'Grid (rows ";" separated)', defaultValue: '0,0,0;1,1,0;1,1,0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int shortestPathBinaryMatrix(vector<vector<int>>& g) {'),
      L('        int n = g.size();'),
      L('        if (g[0][0] || g[n-1][n-1]) return -1;', 'blocked'),
      L('        queue<array<int,3>> q; q.push({0, 0, 1});', 'init'),
      L('        g[0][0] = 1;                      // mark visited', 'init'),
      L('        while (!q.empty()) {', 'pop'),
      L('            auto [r, c, d] = q.front(); q.pop();', 'pop'),
      L('            if (r == n-1 && c == n-1) return d;', 'done'),
      L('            for (int dr = -1; dr <= 1; dr++)', 'expand'),
      L('                for (int dc = -1; dc <= 1; dc++) {', 'expand'),
      L('                    int nr = r+dr, nc = c+dc;'),
      L('                    if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;'),
      L('                    if (g[nr][nc]) continue;', 'expand'),
      L('                    g[nr][nc] = 1; q.push({nr, nc, d+1});', 'push'),
      L('                }'),
      L('        }'),
      L('        return -1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int shortestPathBinaryMatrix(int[][] g) {'),
      L('        int n = g.length;'),
      L('        if (g[0][0] == 1 || g[n-1][n-1] == 1) return -1;', 'blocked'),
      L('        Queue<int[]> q = new LinkedList<>(); q.add(new int[]{0,0,1});', 'init'),
      L('        g[0][0] = 1;                      // mark visited', 'init'),
      L('        while (!q.isEmpty()) {', 'pop'),
      L('            int[] cur = q.remove();', 'pop'),
      L('            if (cur[0] == n-1 && cur[1] == n-1) return cur[2];', 'done'),
      L('            for (int dr = -1; dr <= 1; dr++)', 'expand'),
      L('                for (int dc = -1; dc <= 1; dc++) {', 'expand'),
      L('                    int nr = cur[0]+dr, nc = cur[1]+dc;'),
      L('                    if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;'),
      L('                    if (g[nr][nc] == 1) continue;', 'expand'),
      L('                    g[nr][nc] = 1; q.add(new int[]{nr, nc, cur[2]+1});', 'push'),
      L('                }'),
      L('        }'),
      L('        return -1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = numGrid(values.grid, 6, 6);
    if (typeof g0 === 'string') return { error: g0 };
    const n = g0.length;
    if (!g0.every((r) => r.length === n)) return { error: 'The grid must be square.' };
    if (!g0.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
    const g = g0.map((r) => [...r]);
    const steps: Step[] = [];
    const dist = new Map<string, number>();
    const view = (active?: [number, number], added: string[] = []): MatrixState => ({
      grid: g0.map((row, r) => row.map((v, c) => (v === 1 ? '█' : dist.has(`${r},${c}`) ? dist.get(`${r},${c}`)! : '·'))),
      ...labels(n, n),
      mark: {
        ...Object.fromEntries([...dist.keys()].map((k) => [k, 'good' as const])),
        ...Object.fromEntries(added.map((k) => [k, 'win' as const])),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' as const } : {}),
      },
    });
    if (g[0][0] === 1 || g[n - 1][n - 1] === 1) {
      steps.push({
        tag: 'blocked',
        trace: ['The start or the goal is blocked — there is no path at all. Return ', C(-1), '.'],
        state: view(),
      });
      return { steps, result: '-1' };
    }
    const queue: [number, number, number][] = [[0, 0, 1]];
    g[0][0] = 1;
    dist.set('0,0', 1);
    steps.push({
      tag: 'init',
      trace: [
        'Start at (0,0) with path length ', A(1), ' — the problem counts ', A('cells'), ', not moves. Movement is 8-directional, so diagonals are allowed.',
      ],
      state: view([0, 0]),
    });
    let head = 0;
    let answer = -1;
    while (head < queue.length) {
      const [r, c, d] = queue[head++];
      steps.push({ tag: 'pop', trace: ['Dequeue (', A(r), ',', A(c), ') at length ', A(d), '.'], state: view([r, c]) });
      if (r === n - 1 && c === n - 1) {
        answer = d;
        steps.push({
          tag: 'done',
          trace: ['That is the bottom-right corner. Because BFS explores in order of distance, ', C(d), ' is the shortest possible path length.'],
          state: view([r, c]),
        });
        break;
      }
      const added: string[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
          if (g[nr][nc] === 1) continue;
          g[nr][nc] = 1;
          dist.set(`${nr},${nc}`, d + 1);
          queue.push([nr, nc, d + 1]);
          added.push(`${nr},${nc}`);
        }
      }
      steps.push({
        tag: added.length ? 'push' : 'expand',
        trace: added.length
          ? ['Enqueue ', B(added.map((k) => `(${k})`).join(' ')), ' at length ', B(d + 1), ', marking each blocked so it is never queued twice.']
          : ['No new cells reachable from here.'],
        state: view([r, c], added),
      });
      if (steps.length > MAX_STEPS) break;
    }
    if (answer < 0) {
      steps.push({ tag: 'ret', trace: ['The queue drained without reaching the corner — no clear path exists. ', C(-1), '.'], state: view() });
    }
    return { steps, result: String(answer) };
  },
  note: 'BFS is the right tool precisely because every move costs the same — with varying costs you would need Dijkstra. Marking a cell blocked the moment it is enqueued, not when dequeued, keeps the queue linear in grid size; the lazier version can queue the same cell many times over.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
  brute: {
    label: 'Relax until stable',
    technique: 'Start with distance 1 at the top-left and keep sweeping the grid, lowering each cell to 1 + its best neighbour, until nothing changes.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int shortestPathBinaryMatrix(vector<vector<int>>& g) {'),
        L('        int n = g.size();', 'init'),
        L('        if (g[0][0] || g[n-1][n-1]) return -1;', 'blocked'),
        L('        vector<vector<int>> d(n, vector<int>(n, INT_MAX)); d[0][0] = 1;', 'init'),
        L('        for (bool changed = true; changed; ) {', 'sweep'),
        L('            changed = false;', 'sweep'),
        L('            for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (!g[r][c])', 'sweep'),
        L('                for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {', 'sweep'),
        L('                    int pr = r + dr, pc = c + dc;', 'sweep'),
        L('                    if (pr >= 0 && pc >= 0 && pr < n && pc < n && d[pr][pc] != INT_MAX && d[pr][pc] + 1 < d[r][c])', 'sweep'),
        L('                        { d[r][c] = d[pr][pc] + 1; changed = true; }', 'sweep'),
        L('                }'),
        L('        }'),
        L('        return d[n-1][n-1] == INT_MAX ? -1 : d[n-1][n-1];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int shortestPathBinaryMatrix(int[][] g) {'),
        L('        int n = g.length;', 'init'),
        L('        if (g[0][0] == 1 || g[n-1][n-1] == 1) return -1;', 'blocked'),
        L('        int[][] d = new int[n][n];', 'init'),
        L('        for (int[] row : d) Arrays.fill(row, Integer.MAX_VALUE);', 'init'),
        L('        d[0][0] = 1;', 'init'),
        L('        for (boolean changed = true; changed; ) {', 'sweep'),
        L('            changed = false;', 'sweep'),
        L('            for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (g[r][c] == 0)', 'sweep'),
        L('                for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {', 'sweep'),
        L('                    int pr = r + dr, pc = c + dc;', 'sweep'),
        L('                    if (pr >= 0 && pc >= 0 && pr < n && pc < n && d[pr][pc] != Integer.MAX_VALUE && d[pr][pc] + 1 < d[r][c])', 'sweep'),
        L('                        { d[r][c] = d[pr][pc] + 1; changed = true; }', 'sweep'),
        L('                }'),
        L('        }'),
        L('        return d[n-1][n-1] == Integer.MAX_VALUE ? -1 : d[n-1][n-1];', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = numGrid(values.grid, 6, 6);
      if (typeof g === 'string') return { error: g };
      const n = g.length;
      if (!g.every((r) => r.length === n)) return { error: 'The grid must be square.' };
      if (!g.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
      const d = g.map((r) => r.map(() => Infinity));
      const steps: Step[] = [];
      let sweeps = 0;
      const view = (changed: string[] = []): MatrixState => ({
        grid: g.map((row, r) => row.map((v, c) => (v === 1 ? '█' : d[r][c] === Infinity ? '·' : d[r][c]))),
        ...labels(n, n),
        mark: Object.fromEntries(changed.map((k) => [k, 'active' as const])),
        aggs: [{ label: 'full sweeps', value: String(sweeps), c: 'a' }],
      });
      if (g[0][0] === 1 || g[n - 1][n - 1] === 1) {
        steps.push({ tag: 'blocked', trace: ['Start or end is blocked — ', C('-1'), '.'], state: view() });
        return { steps, result: '-1' };
      }
      d[0][0] = 1;
      steps.push({ tag: 'init', trace: ['No queue: set the start to 1 and sweep the whole grid repeatedly, improving any cell that a neighbour can beat.'], state: view(['0,0']) });
      let changed = true;
      while (changed && sweeps < 40) {
        changed = false;
        sweeps++;
        const improved: string[] = [];
        for (let r = 0; r < n; r++)
          for (let c = 0; c < n; c++) {
            if (g[r][c]) continue;
            for (let dr = -1; dr <= 1; dr++)
              for (let dc = -1; dc <= 1; dc++) {
                const pr = r + dr;
                const pc = c + dc;
                if (pr >= 0 && pc >= 0 && pr < n && pc < n && d[pr][pc] + 1 < d[r][c]) {
                  d[r][c] = d[pr][pc] + 1;
                  changed = true;
                  improved.push(`${r},${c}`);
                }
              }
          }
        steps.push({ tag: 'sweep', trace: ['Sweep ', A(sweeps), ': ', changed ? [improved.length, ' cell(s) improved.'].join('') : 'nothing changed — distances are final.'], state: view(improved) });
      }
      const answer = d[n - 1][n - 1] === Infinity ? -1 : d[n - 1][n - 1];
      steps.push({ tag: 'ret', trace: answer === -1 ? ['The bottom-right cell was never reached — ', C('-1'), '.'] : ['Shortest clear path visits ', C(answer), ' cell(s).'], state: view() });
      return { steps, result: String(answer) };
    },
    note: 'Each sweep costs O(n²·8), and a winding path may need O(n²) sweeps before the distances settle — O(n⁴) overall. BFS reaches every cell once, in order of distance, so the first arrival is final.',
    complexity: { time: 'O(n⁴)', space: 'O(n²)' },
  },
};

/* ================= Path With Minimum Effort ================= */
const minimumEffort: ProblemDef = {
  slug: 'path-with-minimum-effort',
  title: 'Path With Minimum Effort',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/path-with-minimum-effort/',
  technique: 'Dijkstra where a path\'s cost is the largest single step on it, not the sum.',
  widget: 'matrix',
  widgetTitle: 'Heights & best effort to reach each cell',
  inputs: [{ key: 'grid', label: 'Heights (rows ";" separated)', defaultValue: '1,2,2;3,8,2;5,3,5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minimumEffortPath(vector<vector<int>>& h) {'),
      L('        int R = h.size(), C = h[0].size();'),
      L('        vector<vector<int>> eff(R, vector<int>(C, INT_MAX));'),
      L('        priority_queue<array<int,3>, vector<array<int,3>>, greater<>> pq;'),
      L('        eff[0][0] = 0; pq.push({0, 0, 0});', 'init'),
      L('        int dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1};'),
      L('        while (!pq.empty()) {', 'pop'),
      L('            auto [e, r, c] = pq.top(); pq.pop();', 'pop'),
      L('            if (r == R-1 && c == C-1) return e;', 'done'),
      L('            if (e > eff[r][c]) continue;', 'stale'),
      L('            for (int k = 0; k < 4; k++) {', 'relax'),
      L('                int nr = r+dr[k], nc = c+dc[k];'),
      L('                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;'),
      L('                int ne = max(e, abs(h[nr][nc] - h[r][c]));', 'relax'),
      L('                if (ne < eff[nr][nc]) {', 'improve'),
      L('                    eff[nr][nc] = ne; pq.push({ne, nr, nc});', 'improve'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return 0;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minimumEffortPath(int[][] h) {'),
      L('        int R = h.length, C = h[0].length;'),
      L('        int[][] eff = new int[R][C];'),
      L('        for (int[] row : eff) Arrays.fill(row, Integer.MAX_VALUE);'),
      L('        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0]-b[0]);'),
      L('        eff[0][0] = 0; pq.add(new int[]{0,0,0});', 'init'),
      L('        int[] dr = {1,-1,0,0}, dc = {0,0,1,-1};'),
      L('        while (!pq.isEmpty()) {', 'pop'),
      L('            int[] cur = pq.poll();', 'pop'),
      L('            int e = cur[0], r = cur[1], c = cur[2];'),
      L('            if (r == R-1 && c == C-1) return e;', 'done'),
      L('            if (e > eff[r][c]) continue;', 'stale'),
      L('            for (int k = 0; k < 4; k++) {', 'relax'),
      L('                int nr = r+dr[k], nc = c+dc[k];'),
      L('                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;'),
      L('                int ne = Math.max(e, Math.abs(h[nr][nc]-h[r][c]));', 'relax'),
      L('                if (ne < eff[nr][nc]) {', 'improve'),
      L('                    eff[nr][nc] = ne; pq.add(new int[]{ne, nr, nc});', 'improve'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return 0;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const h = numGrid(values.grid, 4, 4);
    if (typeof h === 'string') return { error: h };
    const R = h.length;
    const Cn = h[0].length;
    const INF = Infinity;
    const eff = h.map((r) => r.map(() => INF));
    const steps: Step[] = [];
    const settled = new Set<string>();
    const pq: [number, number, number][] = [];
    const view = (active?: [number, number], touched: string[] = []): MatrixState => ({
      grid: h.map((row, r) => row.map((v, c) => `${v}|${eff[r][c] === INF ? '∞' : eff[r][c]}`)),
      ...labels(R, Cn),
      mark: {
        ...Object.fromEntries([...settled].map((k) => [k, 'good' as const])),
        ...Object.fromEntries(touched.map((k) => [k, 'win' as const])),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'frontier (effort, cell)', value: pq.map(([e, r, c]) => `${e}@(${r},${c})`).join(' ') || '—', c: 'b' }],
    });
    eff[0][0] = 0;
    pq.push([0, 0, 0]);
    steps.push({
      tag: 'init',
      trace: [
        'Effort is the ', A('largest'), ' single height change along a path — not the total. Dijkstra still works: swap "sum of edges" for "max of edges" and the relaxation stays valid.',
      ],
      state: view([0, 0]),
    });
    const dirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    let answer = 0;
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [e, r, c] = pq.shift()!;
      steps.push({ tag: 'pop', trace: ['Cheapest frontier cell is (', A(r), ',', A(c), ') with effort ', A(e), '.'], state: view([r, c]) });
      if (r === R - 1 && c === Cn - 1) {
        answer = e;
        steps.push({
          tag: 'done',
          trace: ['That is the destination. Nothing cheaper remains in the queue, so ', C(e), ' is the minimum possible effort.'],
          state: view([r, c]),
        });
        break;
      }
      if (e > eff[r][c]) {
        steps.push({ tag: 'stale', trace: ['A better route to this cell was already found — skip this stale entry.'], state: view([r, c]) });
        continue;
      }
      settled.add(`${r},${c}`);
      const touched: string[] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= Cn) continue;
        const ne = Math.max(e, Math.abs(h[nr][nc] - h[r][c]));
        if (ne < eff[nr][nc]) {
          eff[nr][nc] = ne;
          pq.push([ne, nr, nc]);
          touched.push(`${nr},${nc}`);
        }
      }
      steps.push({
        tag: touched.length ? 'improve' : 'relax',
        trace: touched.length
          ? ['Improved ', B(touched.map((k) => `(${k})`).join(' ')), ' — each new effort is max(current effort, the step\'s height change).']
          : ['No neighbour can be reached more cheaply than it already is.'],
        state: view([r, c], touched),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Minimum effort from top-left to bottom-right: ', C(answer), '.'],
      state: view(),
    });
    return { steps, result: String(answer) };
  },
  note: 'The proof Dijkstra needs is that extending a path never lowers its cost — true for max just as for sum, which is why the same greedy settling order is safe. Binary-searching the answer and running a plain BFS per guess is the other standard route, at O(R·C·log(maxHeight)).',
  complexity: { time: 'O(R·C·log(R·C))', space: 'O(R·C)' },
  brute: {
    label: 'Binary search + BFS',
    technique: 'Guess an effort limit and BFS using only steps within it; binary search for the smallest limit that still reaches the corner.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool reachable(vector<vector<int>>& h, int limit);  // BFS using steps with |Δh| ≤ limit'),
        L('public:'),
        L('    int minimumEffortPath(vector<vector<int>>& h) {'),
        L('        int lo = 0, hi = 1e6;', 'init'),
        L('        while (lo < hi) {', 'try'),
        L('            int mid = (lo + hi) / 2;', 'try'),
        L('            if (reachable(h, mid)) hi = mid;', 'try', 'yes'),
        L('            else lo = mid + 1;', 'no'),
        L('        }'),
        L('        return lo;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean reachable(int[][] h, int limit) { /* BFS using steps with |Δh| ≤ limit */ }'),
        L('    public int minimumEffortPath(int[][] h) {'),
        L('        int lo = 0, hi = 1_000_000;', 'init'),
        L('        while (lo < hi) {', 'try'),
        L('            int mid = (lo + hi) / 2;', 'try'),
        L('            if (reachable(h, mid)) hi = mid;', 'try', 'yes'),
        L('            else lo = mid + 1;', 'no'),
        L('        }'),
        L('        return lo;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const h = numGrid(values.grid, 4, 4);
      if (typeof h === 'string') return { error: h };
      const R = h.length;
      const Cn = h[0].length;
      const steps: Step[] = [];
      const reach = (limit: number) => {
        const seen = new Set(['0,0']);
        const q: [number, number][] = [[0, 0]];
        while (q.length) {
          const [r, c] = q.shift()!;
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nc >= 0 && nr < R && nc < Cn && !seen.has(`${nr},${nc}`) && Math.abs(h[nr][nc] - h[r][c]) <= limit) {
              seen.add(`${nr},${nc}`);
              q.push([nr, nc]);
            }
          }
        }
        return seen;
      };
      const view = (seen: Set<string>, ok: boolean, lo: number, hi: number): MatrixState => ({
        grid: h,
        ...labels(R, Cn),
        mark: { ...Object.fromEntries([...seen].map((k) => [k, 'good' as const])), [`${R - 1},${Cn - 1}`]: ok ? ('final' as const) : ('dim' as const) },
        aggs: [{ label: 'effort range', value: `[${lo}, ${hi}]`, c: 'a' }],
      });
      let lo = 0;
      let hi = Math.max(...h.flat()) - Math.min(...h.flat());
      steps.push({ tag: 'init', trace: ['The answer lies between 0 and the biggest height difference, ', A(hi), '. Binary search it, testing each guess with a BFS.'], state: view(new Set(['0,0']), false, lo, hi) });
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const seen = reach(mid);
        const ok = seen.has(`${R - 1},${Cn - 1}`);
        steps.push({ tag: ok ? 'yes' : 'no', trace: ['Limit ', A(mid), ': BFS reaches ', A(seen.size), ' cell(s) — the corner is ', ok ? B('reachable, try lower') : F('not reachable, go higher'), '.'], state: view(seen, ok, lo, hi) });
        if (ok) hi = mid;
        else lo = mid + 1;
      }
      steps.push({ tag: 'ret', trace: ['Smallest workable effort: ', C(lo), '.'], state: view(reach(lo), true, lo, lo) });
      return { steps, result: String(lo) };
    },
    note: 'Each guess costs one O(R·C) BFS and there are log(max height) guesses, so O(R·C · log H). It works because reachability only improves as the limit grows; Dijkstra on the max-step cost gets there directly.',
    complexity: { time: 'O(R·C · log H)', space: 'O(R·C)' },
  },
};

/* ================= Making A Large Island ================= */
const makingLargeIsland: ProblemDef = {
  slug: 'making-a-large-island',
  title: 'Making A Large Island',
  category: 'Graphs',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/making-a-large-island/',
  technique: 'Label every island with its size, then for each 0 sum the distinct islands it touches.',
  widget: 'matrix',
  widgetTitle: 'Grid (islands labelled)',
  inputs: [{ key: 'grid', label: 'Binary grid (rows ";" separated)', defaultValue: '1,1,0;1,0,1;0,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int largestIsland(vector<vector<int>>& g) {'),
      L('        int n = g.size(), id = 2;'),
      L('        unordered_map<int,int> size;'),
      L('        for (int r = 0; r < n; r++)', 'label'),
      L('            for (int c = 0; c < n; c++)', 'label'),
      L('                if (g[r][c] == 1) size[id] = paint(g, r, c, id++);', 'label'),
      L('        int best = 0;'),
      L('        for (auto& [k, v] : size) best = max(best, v);', 'noZero'),
      L('        for (int r = 0; r < n; r++)', 'scan'),
      L('            for (int c = 0; c < n; c++) {', 'scan'),
      L('                if (g[r][c] != 0) continue;'),
      L('                unordered_set<int> nb;'),
      L('                for (auto [nr,nc] : neighbours(r,c,n))', 'gather'),
      L('                    if (g[nr][nc] > 1) nb.insert(g[nr][nc]);', 'gather'),
      L('                int tot = 1;'),
      L('                for (int k : nb) tot += size[k];', 'sum'),
      L('                best = max(best, tot);', 'sum'),
      L('            }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int largestIsland(int[][] g) {'),
      L('        int n = g.length, id = 2;'),
      L('        Map<Integer,Integer> size = new HashMap<>();'),
      L('        for (int r = 0; r < n; r++)', 'label'),
      L('            for (int c = 0; c < n; c++)', 'label'),
      L('                if (g[r][c] == 1) size.put(id, paint(g, r, c, id++));', 'label'),
      L('        int best = 0;'),
      L('        for (int v : size.values()) best = Math.max(best, v);', 'noZero'),
      L('        for (int r = 0; r < n; r++)', 'scan'),
      L('            for (int c = 0; c < n; c++) {', 'scan'),
      L('                if (g[r][c] != 0) continue;'),
      L('                Set<Integer> nb = new HashSet<>();'),
      L('                for (int[] p : neighbours(r, c, n))', 'gather'),
      L('                    if (g[p[0]][p[1]] > 1) nb.add(g[p[0]][p[1]]);', 'gather'),
      L('                int tot = 1;'),
      L('                for (int k : nb) tot += size.get(k);', 'sum'),
      L('                best = Math.max(best, tot);', 'sum'),
      L('            }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = numGrid(values.grid, 5, 5);
    if (typeof g0 === 'string') return { error: g0 };
    const n = g0.length;
    if (!g0.every((r) => r.length === n)) return { error: 'The grid must be square.' };
    if (!g0.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
    // Annotated: island labels (2, 3, …) are written back into this grid.
    const g: number[][] = g0.map((r) => [...r]);
    const steps: Step[] = [];
    const size = new Map<number, number>();
    let id = 2;
    const view = (active?: string, marks: Record<string, 'active' | 'good' | 'final' | 'win' | 'dim'> = {}): MatrixState => ({
      grid: g.map((r) => r.map((v) => (v === 0 ? '·' : v))),
      ...labels(n, n),
      mark: { ...marks, ...(active ? { [active]: 'active' as const } : {}) },
      aggs: [{ label: 'island sizes', value: [...size.entries()].map(([k, v]) => `#${k}:${v}`).join('  ') || '—', c: 'b' }],
    });
    steps.push({
      tag: 'label',
      trace: [
        'Flipping a 0 and re-flood-filling for every candidate would be O(n⁴). Instead label each island ', A('once'), ' with a unique id and remember its size.',
      ],
      state: view(),
    });
    const dirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const paint = (r: number, c: number, label: number): number => {
      if (r < 0 || r >= n || c < 0 || c >= n || g[r][c] !== 1) return 0;
      g[r][c] = label;
      let s = 1;
      for (const [dr, dc] of dirs) s += paint(r + dr, c + dc, label);
      return s;
    };
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] === 1) {
          const s = paint(r, c, id);
          size.set(id, s);
          steps.push({
            tag: 'label',
            trace: ['Island starting at (', A(r), ',', A(c), ') is labelled ', B(id), ' and has ', B(s), ' cell(s).'],
            state: view(`${r},${c}`, Object.fromEntries(g.flatMap((row, rr) => row.map((v, cc) => [`${rr},${cc}`, v === id ? ('good' as const) : ('dim' as const)])).filter(([, v]) => v === 'good'))),
          });
          id++;
        }
        if (steps.length > MAX_STEPS) break;
      }
    }
    let best = size.size ? Math.max(...size.values()) : 0;
    steps.push({
      tag: 'noZero',
      trace: [
        'Largest existing island is ', A(best), '. That is the answer if no flip helps — and it also covers a grid with no zeros at all.',
      ],
      state: view(),
    });
    let bestCell: string | null = null;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] !== 0) continue;
        const nb = new Set<number>();
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
          if (g[nr][nc] > 1) nb.add(g[nr][nc]);
        }
        const tot = 1 + [...nb].reduce((acc, k) => acc + (size.get(k) ?? 0), 0);
        steps.push({
          tag: 'gather',
          trace: [
            'Flip (', A(r), ',', A(c), '): it touches island(s) ', B([...nb].map((k) => `#${k}`).join(', ') || 'none'), '. Using a ', A('set'),
            ' matters — the same island can border this cell on two sides.',
          ],
          state: view(`${r},${c}`),
        });
        if (tot > best) {
          best = tot;
          bestCell = `${r},${c}`;
        }
        steps.push({
          tag: 'sum',
          trace: ['Merged size would be 1 + ', B([...nb].map((k) => size.get(k)).join(' + ') || '0'), ' = ', tot === best ? C(tot) : A(tot), tot === best ? ' — a new best.' : `.`],
          state: view(`${r},${c}`),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Largest island achievable with one flip: ', C(best), bestCell ? [' (flip cell (', C(bestCell), '))'].join('') : ' (no flip needed)', '.'],
      state: view(bestCell ?? undefined),
    });
    return { steps, result: String(best), resultDetail: bestCell ? `flip (${bestCell})` : 'no flip needed' };
  },
  note: 'Reusing 1 as a label would be ambiguous, which is why ids start at 2 — a cell value above 1 now means "belongs to island #value". The set around each zero is essential: a U-shaped island can touch the same gap twice, and adding its size twice inflates the answer.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
  brute: {
    label: 'Flip each 0 and re-measure',
    technique: 'For every 0-cell, pretend to flip it to 1 and flood fill from it to measure the island it would join.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int largestIsland(vector<vector<int>>& g) {'),
        L('        int n = g.size(), best = 0; bool anyZero = false;', 'label'),
        L('        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (g[r][c] == 0) {', 'try'),
        L('            anyZero = true;', 'try'),
        L('            g[r][c] = 1;', 'try'),
        L('            best = max(best, floodSize(g, r, c));  // fresh DFS each time', 'try'),
        L('            g[r][c] = 0;', 'try'),
        L('        }'),
        L('        return anyZero ? best : n * n;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int largestIsland(int[][] g) {'),
        L('        int n = g.length, best = 0; boolean anyZero = false;', 'label'),
        L('        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (g[r][c] == 0) {', 'try'),
        L('            anyZero = true;', 'try'),
        L('            g[r][c] = 1;', 'try'),
        L('            best = Math.max(best, floodSize(g, r, c));  // fresh DFS each time', 'try'),
        L('            g[r][c] = 0;', 'try'),
        L('        }'),
        L('        return anyZero ? best : n * n;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g0 = numGrid(values.grid, 5, 5);
      if (typeof g0 === 'string') return { error: g0 };
      const n = g0.length;
      if (!g0.every((r) => r.length === n)) return { error: 'The grid must be square.' };
      if (!g0.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Use only 0 and 1.' };
      const g = g0.map((r) => [...r]);
      let best = 0;
      let bestCell: string | null = null;
      let visits = 0;
      const steps: Step[] = [];
      const view = (flip?: string, island: string[] = []): MatrixState => ({
        grid: g.map((r) => r.map((v) => (v === 0 ? '·' : '●'))),
        ...labels(n, n),
        mark: { ...Object.fromEntries(island.map((k) => [k, 'good' as const])), ...(flip ? { [flip]: 'active' as const } : {}) },
        aggs: [
          { label: 'best', value: String(best), c: 'c' },
          { label: 'cells flooded in total', value: String(visits), c: 'a' },
        ],
      });
      steps.push({ tag: 'label', trace: ['No island labels: try flipping each 0 and flood-fill from it to measure the result.'], state: view() });
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++) {
          if (g[r][c] !== 0) continue;
          g[r][c] = 1;
          const seen = new Set([`${r},${c}`]);
          const stack: [number, number][] = [[r, c]];
          while (stack.length) {
            const [x, y] = stack.pop()!;
            visits++;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < n && ny < n && g[nx][ny] === 1 && !seen.has(`${nx},${ny}`)) {
                seen.add(`${nx},${ny}`);
                stack.push([nx, ny]);
              }
            }
          }
          const better = seen.size > best;
          if (better) {
            best = seen.size;
            bestCell = `${r},${c}`;
          }
          if (steps.length < MAX_STEPS) steps.push({ tag: 'try', trace: ['Flip (', A(r), ',', A(c), '): the island through it has size ', better ? B(seen.size) : A(seen.size), better ? ' — a new best.' : '.'], state: view(`${r},${c}`, [...seen]) });
          g[r][c] = 0;
        }
      if (!bestCell) best = n * n;
      steps.push({ tag: 'ret', trace: ['Largest island achievable with one flip: ', C(best), '.'], state: view(bestCell ?? undefined) });
      return { steps, result: String(best), resultDetail: bestCell ? `flip (${bestCell})` : 'no flip needed' };
    },
    note: 'Every 0 triggers a full flood fill, so the cost is O(n⁴). Labelling each island once with its size lets every 0 simply add up its distinct neighbouring islands in O(1), for O(n²) total.',
    complexity: { time: 'O(n⁴)', space: 'O(n²)' },
  },
};

export const graphs3: ProblemDef[] = [floodFill, zeroOneMatrix, shortestPathBinary, minimumEffort, makingLargeIsland];
