// Graphs, part 1: grid flood-fill / BFS problems (matrix widget).
import type { MatrixState, ProblemDef, Step } from '../lib/types';
import { A, B, C, F, L } from '../lib/trace';
import { parseGrid } from './arraysHashing2';

const MAX_STEPS = 320;

const gridLabels = (R: number, Cn: number) => ({
  rowLabels: [...Array(R)].map((_, i) => i),
  colLabels: [...Array(Cn)].map((_, i) => i),
});

/* ================= 95. Number of Islands ================= */
const numIslands: ProblemDef = {
  slug: 'number-of-islands',
  title: 'Number of Islands',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-islands/',
  technique: 'Flood-fill: each unvisited land cell starts a DFS that sinks its whole island.',
  widget: 'matrix',
  widgetTitle: 'Grid (1 = land)',
  inputs: [{ key: 'grid', label: 'Grid (rows ";" separated)', defaultValue: '11000;11000;00100;00011', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numIslands(vector<vector<char>>& grid) {'),
      L('        int count = 0;', 'init'),
      L('        for (int r = 0; r < grid.size(); r++)', 'scan'),
      L('            for (int c = 0; c < grid[0].size(); c++)', 'scan'),
      L('                if (grid[r][c] == \'1\') {', 'found'),
      L('                    count++;', 'found'),
      L('                    sink(grid, r, c);', 'found'),
      L('                }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    void sink(vector<vector<char>>& g, int r, int c) {', 'sink'),
      L('        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size() ||', 'sink'),
      L('            g[r][c] != \'1\') return;', 'sink'),
      L('        g[r][c] = \'0\';', 'sink'),
      L('        sink(g, r+1, c); sink(g, r-1, c);', 'sink'),
      L('        sink(g, r, c+1); sink(g, r, c-1);', 'sink'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numIslands(char[][] grid) {'),
      L('        int count = 0;', 'init'),
      L('        for (int r = 0; r < grid.length; r++)', 'scan'),
      L('            for (int c = 0; c < grid[0].length; c++)', 'scan'),
      L('                if (grid[r][c] == \'1\') {', 'found'),
      L('                    count++;', 'found'),
      L('                    sink(grid, r, c);', 'found'),
      L('                }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    private void sink(char[][] g, int r, int c) {', 'sink'),
      L('        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length ||', 'sink'),
      L('            g[r][c] != \'1\') return;', 'sink'),
      L('        g[r][c] = \'0\';', 'sink'),
      L('        sink(g, r+1, c); sink(g, r-1, c);', 'sink'),
      L('        sink(g, r, c+1); sink(g, r, c-1);', 'sink'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = parseGrid(values.grid, { maxR: 7, maxC: 8 });
    if (typeof g0 === 'string') return { error: g0 };
    if (!g0.every((r) => r.every((c) => c === '0' || c === '1'))) return { error: 'Grid must contain only 0 and 1.' };
    const g = g0.map((r) => [...r]);
    const R = g.length;
    const Cn = g[0].length;
    const steps: Step[] = [];
    let count = 0;
    const islandOf: Record<string, number> = {};
    const snap = (active?: [number, number]): MatrixState => ({
      grid: g0.map((row, r) => row.map((v, c) => (v === '1' ? '🏝' : ''))),
      ...gridLabels(R, Cn),
      mark: {
        ...Object.fromEntries(Object.keys(islandOf).map((k) => [k, 'good'])),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' } : {}),
      },
      aggs: [{ label: 'islands', value: String(count), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Scan the grid; every time we step on land not yet claimed, that is a ', B('new island'), ' — sink all of it before moving on.'], state: snap() });
    const sink = (r: number, c: number) => {
      if (r < 0 || r >= R || c < 0 || c >= Cn || g[r][c] !== '1' || steps.length > MAX_STEPS) return;
      g[r][c] = '0';
      islandOf[`${r},${c}`] = count;
      steps.push({ tag: 'sink', trace: ['Flood-fill claims (', B(r), ',', B(c), ') for island #', B(count), '.'], state: snap([r, c]) });
      sink(r + 1, c);
      sink(r - 1, c);
      sink(r, c + 1);
      sink(r, c - 1);
    };
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (g[r][c] === '1') {
          count++;
          steps.push({ tag: 'found', trace: ['Unclaimed land at (', A(r), ',', A(c), ') — island #', C(count), ' discovered. Sink it.'], state: snap([r, c]) });
          sink(r, c);
        }
      }
    }
    steps.push({ tag: 'ret', trace: ['Grid fully scanned — ', C(count), ' island(s).'], state: snap() });
    return { steps, result: String(count) };
  },
  note: 'Sinking (overwriting 1→0) makes the grid its own visited-set: an island is counted exactly once because by the time the scan reaches its other cells, they are already water. Every cell is touched a constant number of times — O(R·C).',
  complexity: { time: 'O(R·C)', space: 'O(R·C) recursion worst case' },
};

/* ================= 97. Max Area of Island ================= */
const maxAreaIsland: ProblemDef = {
  slug: 'max-area-of-island',
  title: 'Max Area of Island',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/max-area-of-island/',
  technique: 'The same flood-fill, but each DFS returns the size of what it sank.',
  widget: 'matrix',
  widgetTitle: 'Grid (1 = land)',
  inputs: [{ key: 'grid', label: 'Grid (rows ";" separated)', defaultValue: '01000;01101;00110;00001', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxAreaOfIsland(vector<vector<int>>& grid) {'),
      L('        int best = 0;', 'init'),
      L('        for (int r = 0; r < grid.size(); r++)', 'scan'),
      L('            for (int c = 0; c < grid[0].size(); c++)', 'scan'),
      L('                if (grid[r][c] == 1)', 'found'),
      L('                    best = max(best, area(grid, r, c));', 'found'),
      L('        return best;', 'ret'),
      L('    }'),
      L('    int area(vector<vector<int>>& g, int r, int c) {', 'sink'),
      L('        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size() ||', 'sink'),
      L('            g[r][c] != 1) return 0;', 'sink'),
      L('        g[r][c] = 0;', 'sink'),
      L('        return 1 + area(g, r+1, c) + area(g, r-1, c)', 'sink'),
      L('                 + area(g, r, c+1) + area(g, r, c-1);', 'sink'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxAreaOfIsland(int[][] grid) {'),
      L('        int best = 0;', 'init'),
      L('        for (int r = 0; r < grid.length; r++)', 'scan'),
      L('            for (int c = 0; c < grid[0].length; c++)', 'scan'),
      L('                if (grid[r][c] == 1)', 'found'),
      L('                    best = Math.max(best, area(grid, r, c));', 'found'),
      L('        return best;', 'ret'),
      L('    }'),
      L('    private int area(int[][] g, int r, int c) {', 'sink'),
      L('        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length ||', 'sink'),
      L('            g[r][c] != 1) return 0;', 'sink'),
      L('        g[r][c] = 0;', 'sink'),
      L('        return 1 + area(g, r+1, c) + area(g, r-1, c)', 'sink'),
      L('                 + area(g, r, c+1) + area(g, r, c-1);', 'sink'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = parseGrid(values.grid, { maxR: 7, maxC: 8 });
    if (typeof g0 === 'string') return { error: g0 };
    if (!g0.every((r) => r.every((c) => c === '0' || c === '1'))) return { error: 'Grid must contain only 0 and 1.' };
    const g = g0.map((r) => [...r]);
    const R = g.length;
    const Cn = g[0].length;
    const steps: Step[] = [];
    let best = 0;
    let current = 0;
    const claimed: Record<string, 'good' | 'final'> = {};
    const snap = (active?: [number, number]): MatrixState => ({
      grid: g0.map((row) => row.map((v) => (v === '1' ? '🏝' : ''))),
      ...gridLabels(R, Cn),
      mark: { ...claimed, ...(active ? { [`${active[0]},${active[1]}`]: 'active' } : {}) },
      aggs: [
        { label: 'current area', value: String(current), c: 'a' },
        { label: 'best area', value: String(best), c: 'b' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Same flood-fill as counting islands — but now each fill ', A('returns its size'), '.'], state: snap() });
    const area = (r: number, c: number): number => {
      if (r < 0 || r >= R || c < 0 || c >= Cn || g[r][c] !== '1' || steps.length > MAX_STEPS) return 0;
      g[r][c] = '0';
      current++;
      claimed[`${r},${c}`] = 'good';
      steps.push({ tag: 'sink', trace: ['Claim (', B(r), ',', B(c), ') — area so far ', A(current), '.'], state: snap([r, c]) });
      return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
    };
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (g[r][c] === '1') {
          current = 0;
          steps.push({ tag: 'found', trace: ['New island at (', A(r), ',', A(c), ') — measure it.'], state: snap([r, c]) });
          const a = area(r, c);
          if (a > best) best = a;
          steps.push({ tag: 'found', trace: ['Island measured: area ', A(a), a === best ? ' — the biggest so far.' : '.'], state: snap() });
        }
      }
    }
    steps.push({ tag: 'ret', trace: ['Largest island area: ', C(best), '.'], state: snap() });
    return { steps, result: String(best) };
  },
  note: 'The only change from counting islands is the return value: the recursion 1 + Σ(neighbors) accumulates the fill size on the way back up — the traversal itself is untouched.',
  complexity: { time: 'O(R·C)', space: 'O(R·C) recursion worst case' },
};

/* ================= 98. Pacific Atlantic Water Flow ================= */
const pacificAtlantic: ProblemDef = {
  slug: 'pacific-atlantic-water-flow',
  title: 'Pacific Atlantic Water Flow',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
  technique: 'Flow backwards: flood uphill from each ocean, then intersect the two reachable sets.',
  widget: 'matrix',
  widgetTitle: 'Heights (P = pacific, A = atlantic, ★ = both)',
  inputs: [{ key: 'grid', label: 'Heights (rows ";" separated)', defaultValue: '1,2,2,3,5;3,2,3,4,4;2,4,5,3,1;6,7,1,4,5;5,1,1,2,4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {'),
      L('        int R = h.size(), C = h[0].size();', 'init'),
      L('        vector<vector<bool>> pac(R, vector<bool>(C)), atl(R, vector<bool>(C));', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'seed'),
      L('            climb(h, r, 0, pac);', 'seed'),
      L('            climb(h, r, C - 1, atl);', 'seed'),
      L('        }'),
      L('        for (int c = 0; c < C; c++) {', 'seed'),
      L('            climb(h, 0, c, pac);', 'seed'),
      L('            climb(h, R - 1, c, atl);', 'seed'),
      L('        }'),
      L('        vector<vector<int>> res;', 'both'),
      L('        for (int r = 0; r < R; r++)', 'both'),
      L('            for (int c = 0; c < C; c++)', 'both'),
      L('                if (pac[r][c] && atl[r][c])', 'both'),
      L('                    res.push_back({r, c});', 'both'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void climb(vector<vector<int>>& h, int r, int c, vector<vector<bool>>& seen) {', 'climb'),
      L('        seen[r][c] = true;', 'climb'),
      L('        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};', 'climb'),
      L('        for (int k = 0; k < 4; k++) {', 'climb'),
      L('            int nr = r + dr[k], nc = c + dc[k];', 'climb'),
      L('            if (nr >= 0 && nr < h.size() && nc >= 0 && nc < h[0].size() &&', 'climb'),
      L('                !seen[nr][nc] && h[nr][nc] >= h[r][c])', 'climb'),
      L('                climb(h, nr, nc, seen);', 'climb'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> pacificAtlantic(int[][] h) {'),
      L('        int R = h.length, C = h[0].length;', 'init'),
      L('        boolean[][] pac = new boolean[R][C], atl = new boolean[R][C];', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'seed'),
      L('            climb(h, r, 0, pac);', 'seed'),
      L('            climb(h, r, C - 1, atl);', 'seed'),
      L('        }'),
      L('        for (int c = 0; c < C; c++) {', 'seed'),
      L('            climb(h, 0, c, pac);', 'seed'),
      L('            climb(h, R - 1, c, atl);', 'seed'),
      L('        }'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'both'),
      L('        for (int r = 0; r < R; r++)', 'both'),
      L('            for (int c = 0; c < C; c++)', 'both'),
      L('                if (pac[r][c] && atl[r][c])', 'both'),
      L('                    res.add(List.of(r, c));', 'both'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    private void climb(int[][] h, int r, int c, boolean[][] seen) {', 'climb'),
      L('        seen[r][c] = true;', 'climb'),
      L('        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};', 'climb'),
      L('        for (int k = 0; k < 4; k++) {', 'climb'),
      L('            int nr = r + dr[k], nc = c + dc[k];', 'climb'),
      L('            if (nr >= 0 && nr < h.length && nc >= 0 && nc < h[0].length &&', 'climb'),
      L('                !seen[nr][nc] && h[nr][nc] >= h[r][c])', 'climb'),
      L('                climb(h, nr, nc, seen);', 'climb'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = parseGrid(values.grid, { maxR: 6, maxC: 6 });
    if (typeof g0 === 'string') return { error: g0 };
    const h = g0.map((r) => r.map(Number));
    if (h.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'Heights must be numbers.' };
    const R = h.length;
    const Cn = h[0].length;
    const steps: Step[] = [];
    const pac = new Set<string>();
    const atl = new Set<string>();
    const snap = (active?: [number, number]): MatrixState => ({
      grid: h.map((row, r) =>
        row.map((v, c) => {
          const k = `${r},${c}`;
          const p = pac.has(k);
          const a = atl.has(k);
          return p && a ? `${v}★` : p ? `${v}ᴾ` : a ? `${v}ᴬ` : v;
        })
      ),
      ...gridLabels(R, Cn),
      mark: {
        ...Object.fromEntries([...pac].filter((k) => atl.has(k)).map((k) => [k, 'final'])),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' } : {}),
      },
      aggs: [
        { label: 'pacific-reachable', value: String(pac.size), c: 'a' },
        { label: 'atlantic-reachable', value: String(atl.size), c: 'a' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Water flows downhill to the oceans — so flood ', A('uphill from each coast'), ' instead: a cell reached this way can drain to that ocean.'],
      state: snap(),
    });
    const climb = (r: number, c: number, seen: Set<string>, ocean: string) => {
      const k = `${r},${c}`;
      if (seen.has(k) || steps.length > MAX_STEPS) return;
      seen.add(k);
      steps.push({ tag: 'climb', trace: ['(', B(r), ',', B(c), ') h=', A(h[r][c]), ' can drain to the ', B(ocean), ' — climb to equal-or-higher neighbors.'], state: snap([r, c]) });
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < Cn && !seen.has(`${nr},${nc}`) && h[nr][nc] >= h[r][c]) climb(nr, nc, seen, ocean);
      }
    };
    steps.push({ tag: 'seed', trace: ['Seed the Pacific flood from the ', A('top row and left column'), '.'], state: snap() });
    for (let r = 0; r < R; r++) climb(r, 0, pac, 'Pacific');
    for (let c = 0; c < Cn; c++) climb(0, c, pac, 'Pacific');
    steps.push({ tag: 'seed', trace: ['Seed the Atlantic flood from the ', A('bottom row and right column'), '.'], state: snap() });
    for (let r = 0; r < R; r++) climb(r, Cn - 1, atl, 'Atlantic');
    for (let c = 0; c < Cn; c++) climb(R - 1, c, atl, 'Atlantic');
    const res = [...pac].filter((k) => atl.has(k)).map((k) => `[${k}]`);
    steps.push({ tag: 'both', trace: ['Intersect the two floods — ', C(res.length), ' cell(s) drain to ', C('both oceans'), ' (★).'], state: snap() });
    steps.push({ tag: 'ret', trace: ['Answer: ', C(res.join(' ')), '.'], state: snap() });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} cells reach both oceans` };
  },
  note: 'Simulating water from every cell is O((R·C)²). Reversing gravity — climbing from the coasts — computes each ocean\'s entire reachable set in one flood, because "can flow from X to ocean" equals "ocean can climb to X".',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

/* ================= 99. Surrounded Regions ================= */
const surroundedRegions: ProblemDef = {
  slug: 'surrounded-regions',
  title: 'Surrounded Regions',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/surrounded-regions/',
  technique: 'Invert the question: only O-regions touching the border survive — mark them first.',
  widget: 'matrix',
  widgetTitle: 'Board',
  inputs: [{ key: 'grid', label: 'Board (X/O rows ";" separated)', defaultValue: 'XXXX;XOOX;XXOX;XOXX', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void solve(vector<vector<char>>& board) {'),
      L('        int R = board.size(), C = board[0].size();', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'border'),
      L('            save(board, r, 0); save(board, r, C - 1);', 'border'),
      L('        }'),
      L('        for (int c = 0; c < C; c++) {', 'border'),
      L('            save(board, 0, c); save(board, R - 1, c);', 'border'),
      L('        }'),
      L('        for (int r = 0; r < R; r++)', 'sweep'),
      L('            for (int c = 0; c < C; c++) {', 'sweep'),
      L('                if (board[r][c] == \'O\') board[r][c] = \'X\';', 'capture'),
      L('                if (board[r][c] == \'S\') board[r][c] = \'O\';', 'restore'),
      L('            }'),
      L('    }'),
      L('    void save(vector<vector<char>>& b, int r, int c) {', 'save'),
      L('        if (r < 0 || r >= b.size() || c < 0 || c >= b[0].size() ||', 'save'),
      L('            b[r][c] != \'O\') return;', 'save'),
      L('        b[r][c] = \'S\';', 'save'),
      L('        save(b, r+1, c); save(b, r-1, c);', 'save'),
      L('        save(b, r, c+1); save(b, r, c-1);', 'save'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void solve(char[][] board) {'),
      L('        int R = board.length, C = board[0].length;', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'border'),
      L('            save(board, r, 0); save(board, r, C - 1);', 'border'),
      L('        }'),
      L('        for (int c = 0; c < C; c++) {', 'border'),
      L('            save(board, 0, c); save(board, R - 1, c);', 'border'),
      L('        }'),
      L('        for (int r = 0; r < R; r++)', 'sweep'),
      L('            for (int c = 0; c < C; c++) {', 'sweep'),
      L('                if (board[r][c] == \'O\') board[r][c] = \'X\';', 'capture'),
      L('                if (board[r][c] == \'S\') board[r][c] = \'O\';', 'restore'),
      L('            }'),
      L('    }'),
      L('    private void save(char[][] b, int r, int c) {', 'save'),
      L('        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length ||', 'save'),
      L('            b[r][c] != \'O\') return;', 'save'),
      L('        b[r][c] = \'S\';', 'save'),
      L('        save(b, r+1, c); save(b, r-1, c);', 'save'),
      L('        save(b, r, c+1); save(b, r, c-1);', 'save'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = parseGrid(values.grid, { maxR: 6, maxC: 6 });
    if (typeof g0 === 'string') return { error: g0 };
    const b: string[][] = g0.map((r) => r.map((c) => c.toUpperCase()));
    if (!b.every((r) => r.every((c) => /^[XO]$/.test(c)))) return { error: 'Board must contain only X and O.' };
    const R = b.length;
    const Cn = b[0].length;
    const steps: Step[] = [];
    const snap = (active?: [number, number]): MatrixState => ({
      grid: b.map((r) => [...r]),
      ...gridLabels(R, Cn),
      mark: {
        ...Object.fromEntries(b.flatMap((row, r) => row.map((v, c) => [`${r},${c}`, v === 'S' ? 'good' : undefined]).filter(([, m]) => m))),
        ...(active ? { [`${active[0]},${active[1]}`]: 'active' } : {}),
      },
    });
    steps.push({ tag: 'init', trace: ['An O-region is captured unless it touches the border. So: find the ', B('survivors'), ' first (border-connected Os), then capture everything else.'], state: snap() });
    const save = (r: number, c: number) => {
      if (r < 0 || r >= R || c < 0 || c >= Cn || b[r][c] !== 'O' || steps.length > MAX_STEPS) return;
      b[r][c] = 'S';
      steps.push({ tag: 'save', trace: ['(', B(r), ',', B(c), ') connects to the border — mark it ', B('S'), ' (safe).'], state: snap([r, c]) });
      save(r + 1, c);
      save(r - 1, c);
      save(r, c + 1);
      save(r, c - 1);
    };
    steps.push({ tag: 'border', trace: ['Flood from every border ', A('O'), '.'], state: snap() });
    for (let r = 0; r < R; r++) {
      save(r, 0);
      save(r, Cn - 1);
    }
    for (let c = 0; c < Cn; c++) {
      save(0, c);
      save(R - 1, c);
    }
    let captured = 0;
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (b[r][c] === 'O') {
          b[r][c] = 'X';
          captured++;
        } else if (b[r][c] === 'S') {
          b[r][c] = 'O';
        }
      }
    }
    steps.push({ tag: 'capture', tag2: 'restore', trace: ['Sweep: unsaved Os flip to ', F('X'), ' (', F(captured), ' captured); saved cells revert to ', B('O'), '.'], state: snap() });
    steps.push({ tag: 'sweep', trace: ['Final board: ', C(b.map((r) => r.join('')).join(' ; ')), '.'], state: snap() });
    return { steps, result: b.map((r) => r.join('')).join(' ; '), resultDetail: `${captured} cell(s) captured` };
  },
  note: 'Deciding "is this region surrounded?" per region requires knowing where it ends — but the *complement* is trivial: any O reachable from the border survives. Marking survivors turns the final pass into a blind, per-cell rewrite.',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

/* ================= 100. Rotting Oranges ================= */
const rottingOranges: ProblemDef = {
  slug: 'rotting-oranges',
  title: 'Rotting Oranges',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/rotting-oranges/',
  technique: 'Multi-source BFS: all rotten oranges spread simultaneously, one minute per level.',
  widget: 'matrix',
  widgetTitle: 'Grid (🍊 fresh, 🤢 rotten)',
  inputs: [{ key: 'grid', label: 'Grid (2=rotten 1=fresh 0=empty)', defaultValue: '2,1,1;1,1,0;0,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int orangesRotting(vector<vector<int>>& grid) {'),
      L('        queue<pair<int,int>> q;', 'init'),
      L('        int fresh = 0;', 'init'),
      L('        for (int r = 0; r < grid.size(); r++)', 'init'),
      L('            for (int c = 0; c < grid[0].size(); c++) {', 'init'),
      L('                if (grid[r][c] == 2) q.push({r, c});', 'init'),
      L('                if (grid[r][c] == 1) fresh++;', 'init'),
      L('            }'),
      L('        int minutes = 0;', 'init'),
      L('        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};'),
      L('        while (!q.empty() && fresh > 0) {', 'loop'),
      L('            minutes++;', 'tick'),
      L('            for (int sz = q.size(); sz > 0; sz--) {', 'tick'),
      L('                auto [r, c] = q.front(); q.pop();', 'spread'),
      L('                for (int k = 0; k < 4; k++) {', 'spread'),
      L('                    int nr = r + dr[k], nc = c + dc[k];', 'spread'),
      L('                    if (nr < 0 || nr >= grid.size() || nc < 0 ||', 'spread'),
      L('                        nc >= grid[0].size() || grid[nr][nc] != 1) continue;', 'spread'),
      L('                    grid[nr][nc] = 2;', 'rot'),
      L('                    fresh--;', 'rot'),
      L('                    q.push({nr, nc});', 'rot'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return fresh == 0 ? minutes : -1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int orangesRotting(int[][] grid) {'),
      L('        Queue<int[]> q = new LinkedList<>();', 'init'),
      L('        int fresh = 0;', 'init'),
      L('        for (int r = 0; r < grid.length; r++)', 'init'),
      L('            for (int c = 0; c < grid[0].length; c++) {', 'init'),
      L('                if (grid[r][c] == 2) q.add(new int[]{r, c});', 'init'),
      L('                if (grid[r][c] == 1) fresh++;', 'init'),
      L('            }'),
      L('        int minutes = 0;', 'init'),
      L('        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};'),
      L('        while (!q.isEmpty() && fresh > 0) {', 'loop'),
      L('            minutes++;', 'tick'),
      L('            for (int sz = q.size(); sz > 0; sz--) {', 'tick'),
      L('                int[] cell = q.poll();', 'spread'),
      L('                for (int k = 0; k < 4; k++) {', 'spread'),
      L('                    int nr = cell[0] + dr[k], nc = cell[1] + dc[k];', 'spread'),
      L('                    if (nr < 0 || nr >= grid.length || nc < 0 ||', 'spread'),
      L('                        nc >= grid[0].length || grid[nr][nc] != 1) continue;', 'spread'),
      L('                    grid[nr][nc] = 2;', 'rot'),
      L('                    fresh--;', 'rot'),
      L('                    q.add(new int[]{nr, nc});', 'rot'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return fresh == 0 ? minutes : -1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g0 = parseGrid(values.grid, { maxR: 6, maxC: 6 });
    if (typeof g0 === 'string') return { error: g0 };
    const g = g0.map((r) => r.map(Number));
    if (!g.every((r) => r.every((v) => v === 0 || v === 1 || v === 2))) return { error: 'Grid must contain only 0, 1, 2.' };
    const R = g.length;
    const Cn = g[0].length;
    const steps: Step[] = [];
    let fresh = 0;
    let queue: [number, number][] = [];
    for (let r = 0; r < R; r++)
      for (let c = 0; c < Cn; c++) {
        if (g[r][c] === 2) queue.push([r, c]);
        if (g[r][c] === 1) fresh++;
      }
    let minutes = 0;
    const snap = (justRotted: string[] = []): MatrixState => ({
      grid: g.map((row) => row.map((v) => (v === 2 ? '🤢' : v === 1 ? '🍊' : ''))),
      ...gridLabels(R, Cn),
      mark: Object.fromEntries(justRotted.map((k) => [k, 'active'])),
      aggs: [
        { label: 'minute', value: String(minutes), c: 'a' },
        { label: 'fresh left', value: String(fresh), c: fresh === 0 ? 'b' : 'c' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Seed the queue with all ', A(queue.length), ' rotten orange(s) at once — they spread in parallel; ', C(fresh), ' fresh remain.'], state: snap() });
    while (queue.length > 0 && fresh > 0 && steps.length < MAX_STEPS) {
      minutes++;
      const next: [number, number][] = [];
      const justRotted: string[] = [];
      for (const [r, c] of queue) {
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < Cn && g[nr][nc] === 1) {
            g[nr][nc] = 2;
            fresh--;
            next.push([nr, nc]);
            justRotted.push(`${nr},${nc}`);
          }
        }
      }
      queue = next;
      steps.push({
        tag: 'tick',
        tag2: 'rot',
        trace: ['Minute ', A(minutes), ': the rot spreads to ', justRotted.length > 0 ? B(justRotted.length) : F(0), ' orange(s); ', fresh === 0 ? B(fresh) : A(fresh), ' fresh left.'],
        state: snap(justRotted),
      });
    }
    const result = fresh === 0 ? minutes : -1;
    steps.push({
      tag: 'ret',
      trace: fresh === 0
        ? ['All oranges rotten after ', C(minutes), ' minute(s).']
        : [F(fresh), ' orange(s) are unreachable — they never rot. Return ', C('-1'), '.'],
      state: snap(),
    });
    return { steps, result: String(result), resultDetail: fresh === 0 ? undefined : 'some oranges isolated' };
  },
  note: 'Starting BFS from *all* rotten oranges simultaneously makes each BFS level exactly one minute of real time — the level structure is the clock. A single-source loop per orange would badly overcount.',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

export const graphs1 = [numIslands, maxAreaIsland, pacificAtlantic, surroundedRegions, rottingOranges];
