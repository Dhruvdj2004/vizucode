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
  brute: {
    label: 'Union-Find',
    technique: 'Treat every land cell as its own set and union it with land to its right and below; the number of sets left is the number of islands.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<int> parent;'),
        L('    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }'),
        L('public:'),
        L('    int numIslands(vector<vector<char>>& g) {'),
        L('        int R = g.size(), C = g[0].size(), count = 0;', 'init'),
        L('        parent.resize(R * C);', 'init'),
        L('        for (int i = 0; i < R * C; i++) parent[i] = i;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) if (g[r][c] == \'1\') {', 'scan'),
        L('                count++;', 'found'),
        L('                for (auto [nr, nc] : {pair{r + 1, c}, pair{r, c + 1}})', 'union'),
        L('                    if (nr < R && nc < C && g[nr][nc] == \'1\' && find(r * C + c) != find(nr * C + nc)) {', 'union'),
        L('                        parent[find(r * C + c)] = find(nr * C + nc);', 'union'),
        L('                        count--;', 'union'),
        L('                    }'),
        L('            }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int[] parent;'),
        L('    int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }'),
        L('    public int numIslands(char[][] g) {'),
        L('        int R = g.length, C = g[0].length, count = 0;', 'init'),
        L('        parent = new int[R * C];', 'init'),
        L('        for (int i = 0; i < R * C; i++) parent[i] = i;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) if (g[r][c] == \'1\') {', 'scan'),
        L('                count++;', 'found'),
        L('                int[][] nbrs = {{r + 1, c}, {r, c + 1}};', 'union'),
        L('                for (int[] nb : nbrs)', 'union'),
        L('                    if (nb[0] < R && nb[1] < C && g[nb[0]][nb[1]] == \'1\' && find(r * C + c) != find(nb[0] * C + nb[1])) {', 'union'),
        L('                        parent[find(r * C + c)] = find(nb[0] * C + nb[1]);', 'union'),
        L('                        count--;', 'union'),
        L('                    }'),
        L('            }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseGrid(values.grid, { maxR: 7, maxC: 8 });
      if (typeof g === 'string') return { error: g };
      if (!g.every((r) => r.every((c) => c === '0' || c === '1'))) return { error: 'Grid must contain only 0 and 1.' };
      const R = g.length;
      const Cn = g[0].length;
      const parent = [...Array(R * Cn)].map((_, i) => i);
      const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      let count = 0;
      const steps: Step[] = [];
      const snap = (active: number[] = []): MatrixState => ({
        grid: g.map((row, r) => row.map((c, k) => (c === '1' ? `●${find(r * Cn + k)}` : '·'))),
        ...gridLabels(R, Cn),
        mark: Object.fromEntries(active.map((i) => [`${Math.floor(i / Cn)},${i % Cn}`, 'active' as const])),
        aggs: [{ label: 'islands (sets)', value: String(count), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Each land cell shows ', A('●set id'), '. Start with every land cell as its own island, then merge neighbours.'], state: snap() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          if (g[r][c] !== '1') continue;
          count++;
          const me = r * Cn + c;
          for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
            if (nr < R && nc < Cn && g[nr][nc] === '1' && find(me) !== find(nr * Cn + nc)) {
              parent[find(me)] = find(nr * Cn + nc);
              count--;
              steps.push({ tag: 'union', trace: ['(', A(r), ',', A(c), ') touches (', A(nr), ',', A(nc), ') — union their sets. Islands: ', C(count), '.'], state: snap([me, nr * Cn + nc]) });
            }
          }
          if (steps.length < MAX_STEPS) steps.push({ tag: 'found', trace: ['Land at (', A(r), ',', A(c), ') processed. Islands so far: ', C(count), '.'], state: snap([me]) });
        }
      steps.push({ tag: 'ret', trace: [C(count), ' island(s) — one per remaining set.'], state: snap() });
      return { steps, result: String(count) };
    },
    note: 'Same O(R·C) (times a near-constant α) as flood fill, without recursion depth issues. Union-Find shines when land is added over time (Number of Islands II), where re-running a flood fill each time would be far slower.',
    complexity: { time: 'O(R·C · α)', space: 'O(R·C)' },
  },
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
  brute: {
    label: 'BFS with a queue',
    technique: 'Measure each island with a breadth-first flood using an explicit queue instead of recursion.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxAreaOfIsland(vector<vector<int>>& g) {'),
        L('        int R = g.size(), C = g[0].size(), best = 0;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) if (g[r][c] == 1) {', 'scan'),
        L('                int area = 0; queue<pair<int,int>> q; q.push({r, c}); g[r][c] = 0;', 'found'),
        L('                while (!q.empty()) {', 'sink'),
        L('                    auto [x, y] = q.front(); q.pop(); area++;', 'sink'),
        L('                    for (auto [dx, dy] : {pair{1,0}, {-1,0}, {0,1}, {0,-1}}) {', 'sink'),
        L('                        int nx = x + dx, ny = y + dy;', 'sink'),
        L('                        if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] == 1) { g[nx][ny] = 0; q.push({nx, ny}); }', 'sink'),
        L('                    }'),
        L('                }'),
        L('                best = max(best, area);', 'best'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxAreaOfIsland(int[][] g) {'),
        L('        int R = g.length, C = g[0].length, best = 0;', 'init'),
        L('        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) if (g[r][c] == 1) {', 'scan'),
        L('                int area = 0; Deque<int[]> q = new ArrayDeque<>(); q.add(new int[]{r, c}); g[r][c] = 0;', 'found'),
        L('                while (!q.isEmpty()) {', 'sink'),
        L('                    int[] p = q.poll(); area++;', 'sink'),
        L('                    for (int[] d : dirs) {', 'sink'),
        L('                        int nx = p[0] + d[0], ny = p[1] + d[1];', 'sink'),
        L('                        if (nx >= 0 && ny >= 0 && nx < R && ny < C && g[nx][ny] == 1) { g[nx][ny] = 0; q.add(new int[]{nx, ny}); }', 'sink'),
        L('                    }'),
        L('                }'),
        L('                best = Math.max(best, area);', 'best'),
        L('            }'),
        L('        return best;', 'ret'),
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
      let best = 0;
      const done = new Set<string>();
      const steps: Step[] = [];
      const snap = (active?: string, queued: string[] = []): MatrixState => ({
        grid: g0.map((row) => row.map((c) => (c === '1' ? '●' : '·'))),
        ...gridLabels(R, Cn),
        mark: {
          ...Object.fromEntries([...done].map((k) => [k, 'dim' as const])),
          ...Object.fromEntries(queued.map((k) => [k, 'win' as const])),
          ...(active ? { [active]: 'active' as const } : {}),
        },
        aggs: [{ label: 'largest area', value: String(best), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Measure every island with a queue-based flood (no recursion).'], state: snap() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          if (g[r][c] !== '1') continue;
          let area = 0;
          const q: [number, number][] = [[r, c]];
          g[r][c] = '0';
          steps.push({ tag: 'found', trace: ['New island at (', A(r), ',', A(c), ') — start a BFS.'], state: snap(`${r},${c}`) });
          while (q.length) {
            const [x, y] = q.shift()!;
            area++;
            done.add(`${x},${y}`);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < R && ny < Cn && g[nx][ny] === '1') {
                g[nx][ny] = '0';
                q.push([nx, ny]);
              }
            }
            if (steps.length < MAX_STEPS) steps.push({ tag: 'sink', trace: ['Dequeue (', A(x), ',', A(y), ') — area ', B(area), ', ', A(q.length), ' cell(s) waiting.'], state: snap(`${x},${y}`, q.map(([a, b]) => `${a},${b}`)) });
          }
          if (area > best) best = area;
          steps.push({ tag: 'best', trace: ['Island done: area ', B(area), '. Best so far ', C(best), '.'], state: snap() });
        }
      steps.push({ tag: 'ret', trace: ['Largest island: ', C(best), '.'], state: snap() });
      return { steps, result: String(best) };
    },
    note: 'Same O(R·C) work as the recursive DFS, but the explicit queue avoids stack overflow on huge islands (a 1000×1000 all-land grid recurses a million levels deep).',
    complexity: { time: 'O(R·C)', space: 'O(R·C) queue' },
  },
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
  brute: {
    label: 'Search from every cell',
    technique: 'For each cell, run a downhill search to see whether water starting there can reach the Pacific edge and the Atlantic edge.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {'),
        L('        vector<vector<int>> res;', 'init'),
        L('        for (int r = 0; r < h.size(); r++)', 'cell'),
        L('            for (int c = 0; c < h[0].size(); c++) {', 'cell'),
        L('                auto [pac, atl] = flowFrom(h, r, c);  // fresh DFS each time', 'cell'),
        L('                if (pac && atl) res.push_back({r, c});', 'both'),
        L('            }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('    // flowFrom: DFS to neighbours with height ≤ current, noting which edges it touches'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> pacificAtlantic(int[][] h) {'),
        L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
        L('        for (int r = 0; r < h.length; r++)', 'cell'),
        L('            for (int c = 0; c < h[0].length; c++) {', 'cell'),
        L('                boolean[] reach = flowFrom(h, r, c);  // fresh DFS each time', 'cell'),
        L('                if (reach[0] && reach[1]) res.add(List.of(r, c));', 'both'),
        L('            }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('    // flowFrom: DFS to neighbours with height ≤ current, noting which edges it touches'),
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
      const both = new Set<string>();
      let visits = 0;
      const steps: Step[] = [];
      const snap = (active?: string, reached: string[] = []): MatrixState => ({
        grid: h.map((row, r) => row.map((v, c) => (both.has(`${r},${c}`) ? `${v}★` : v))),
        ...gridLabels(R, Cn),
        mark: { ...Object.fromEntries(reached.map((k) => [k, 'win' as const])), ...Object.fromEntries([...both].map((k) => [k, 'final' as const])), ...(active ? { [active]: 'active' as const } : {}) },
        aggs: [{ label: 'cells visited in total', value: String(visits), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No reverse flood: pour water on every cell and follow it downhill.'], state: snap() });
      const res: string[] = [];
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          const seen = new Set<string>();
          let pac = false;
          let atl = false;
          const stack: [number, number][] = [[r, c]];
          seen.add(`${r},${c}`);
          while (stack.length) {
            const [x, y] = stack.pop()!;
            visits++;
            if (x === 0 || y === 0) pac = true;
            if (x === R - 1 || y === Cn - 1) atl = true;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < R && ny < Cn && !seen.has(`${nx},${ny}`) && h[nx][ny] <= h[x][y]) {
                seen.add(`${nx},${ny}`);
                stack.push([nx, ny]);
              }
            }
          }
          if (pac && atl) {
            both.add(`${r},${c}`);
            res.push(`[${r},${c}]`);
          }
          steps.push({
            tag: pac && atl ? 'both' : 'cell',
            trace: ['From (', A(r), ',', A(c), ') water reaches ', A(seen.size), ' cell(s): ', pac ? B('Pacific') : F('no Pacific'), ', ', atl ? B('Atlantic') : F('no Atlantic'), '.'],
            state: snap(`${r},${c}`, [...seen]),
          });
        }
      steps.push({ tag: 'ret', trace: [C(res.length), ' cell(s) drain to both oceans, after ', A(visits), ' cell visits.'], state: snap() });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} cells reach both oceans` };
    },
    note: 'Every cell launches its own search over up to the whole grid, so the cost is O((R·C)²). Flooding uphill from each ocean once and intersecting the two reachable sets needs only O(R·C).',
    complexity: { time: 'O((R·C)²)', space: 'O(R·C)' },
  },
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
  brute: {
    label: 'Check each region',
    technique: 'Flood each O-region on its own; if the flood ever touches the border, keep the region, otherwise flip it to X.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void solve(vector<vector<char>>& b) {'),
        L('        int R = b.size(), C = b[0].size();', 'border'),
        L('        vector<vector<bool>> seen(R, vector<bool>(C));', 'border'),
        L('        for (int r = 0; r < R; r++)', 'save'),
        L('            for (int c = 0; c < C; c++) if (b[r][c] == \'O\' && !seen[r][c]) {', 'save'),
        L('                vector<pair<int,int>> region; bool edge = false;', 'save'),
        L('                flood(b, r, c, seen, region, edge);  // collect the region', 'save'),
        L('                if (!edge) for (auto [x, y] : region) b[x][y] = \'X\';', 'capture'),
        L('            }'),
        L('    }', 'sweep'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void solve(char[][] b) {'),
        L('        int R = b.length, C = b[0].length;', 'border'),
        L('        boolean[][] seen = new boolean[R][C];', 'border'),
        L('        for (int r = 0; r < R; r++)', 'save'),
        L('            for (int c = 0; c < C; c++) if (b[r][c] == \'O\' && !seen[r][c]) {', 'save'),
        L('                List<int[]> region = new ArrayList<>(); boolean[] edge = {false};', 'save'),
        L('                flood(b, r, c, seen, region, edge);  // collect the region', 'save'),
        L('                if (!edge[0]) for (int[] p : region) b[p[0]][p[1]] = \'X\';', 'capture'),
        L('            }'),
        L('    }', 'sweep'),
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
      const seen = new Set<string>();
      let captured = 0;
      const steps: Step[] = [];
      const snap = (region: string[] = [], m: 'good' | 'dim' | 'active' = 'active'): MatrixState => ({
        grid: b.map((r) => [...r]),
        ...gridLabels(R, Cn),
        mark: Object.fromEntries(region.map((k) => [k, m])),
      });
      steps.push({ tag: 'border', trace: ['Look at every O-region as a whole and ask: does it reach the border?'], state: snap() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          if (b[r][c] !== 'O' || seen.has(`${r},${c}`)) continue;
          const region: [number, number][] = [];
          let edge = false;
          const stack: [number, number][] = [[r, c]];
          seen.add(`${r},${c}`);
          while (stack.length) {
            const [x, y] = stack.pop()!;
            region.push([x, y]);
            if (x === 0 || y === 0 || x === R - 1 || y === Cn - 1) edge = true;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < R && ny < Cn && b[nx][ny] === 'O' && !seen.has(`${nx},${ny}`)) {
                seen.add(`${nx},${ny}`);
                stack.push([nx, ny]);
              }
            }
          }
          const keys = region.map(([x, y]) => `${x},${y}`);
          steps.push({ tag: 'save', trace: ['Region of ', A(region.length), ' O(s) starting at (', A(r), ',', A(c), ') ', edge ? B('touches the border — keep it') : F('is fully enclosed'), '.'], state: snap(keys, edge ? 'good' : 'active') });
          if (!edge) {
            for (const [x, y] of region) b[x][y] = 'X';
            captured += region.length;
            steps.push({ tag: 'capture', trace: ['Flip all ', F(region.length), ' of them to X.'], state: snap(keys, 'dim') });
          }
        }
      steps.push({ tag: 'sweep', trace: ['Final board: ', C(b.map((r) => r.join('')).join(' ; ')), '.'], state: snap() });
      return { steps, result: b.map((r) => r.join('')).join(' ; '), resultDetail: `${captured} cell(s) captured` };
    },
    note: 'Also O(R·C), but every region must be fully collected before its fate is known, which needs a per-region list. Flooding only from the border marks the survivors directly, so everything else can be captured in one sweep.',
    complexity: { time: 'O(R·C)', space: 'O(R·C)' },
  },
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
  brute: {
    label: 'Rescan every minute',
    technique: 'Each minute, scan the whole grid and rot every fresh orange next to one that was rotten at the start of that minute.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int orangesRotting(vector<vector<int>>& g) {'),
        L('        int R = g.size(), C = g[0].size(), minutes = 0;', 'init'),
        L('        while (true) {', 'tick'),
        L('            vector<pair<int,int>> rot;', 'tick'),
        L('            for (int r = 0; r < R; r++) for (int c = 0; c < C; c++)  // full scan', 'tick'),
        L('                if (g[r][c] == 1 && hasRottenNeighbour(g, r, c)) rot.push_back({r, c});', 'rot'),
        L('            if (rot.empty()) break;', 'tick'),
        L('            for (auto [r, c] : rot) g[r][c] = 2;', 'rot'),
        L('            minutes++;', 'rot'),
        L('        }'),
        L('        for (auto& row : g) for (int v : row) if (v == 1) return -1;', 'ret'),
        L('        return minutes;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int orangesRotting(int[][] g) {'),
        L('        int R = g.length, C = g[0].length, minutes = 0;', 'init'),
        L('        while (true) {', 'tick'),
        L('            List<int[]> rot = new ArrayList<>();', 'tick'),
        L('            for (int r = 0; r < R; r++) for (int c = 0; c < C; c++)  // full scan', 'tick'),
        L('                if (g[r][c] == 1 && hasRottenNeighbour(g, r, c)) rot.add(new int[]{r, c});', 'rot'),
        L('            if (rot.isEmpty()) break;', 'tick'),
        L('            for (int[] p : rot) g[p[0]][p[1]] = 2;', 'rot'),
        L('            minutes++;', 'rot'),
        L('        }'),
        L('        for (int[] row : g) for (int v : row) if (v == 1) return -1;', 'ret'),
        L('        return minutes;', 'ret'),
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
      let minutes = 0;
      let scanned = 0;
      const steps: Step[] = [];
      const snap = (just: [number, number][] = []): MatrixState => ({
        grid: g.map((row) => row.map((v) => (v === 2 ? '●' : v === 1 ? '○' : '·'))),
        ...gridLabels(R, Cn),
        mark: Object.fromEntries(just.map(([r, c]) => [`${r},${c}`, 'active' as const])),
        aggs: [
          { label: 'minute', value: String(minutes), c: 'b' },
          { label: 'cells scanned', value: String(scanned), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No queue: every minute, look at every cell to decide what rots next. ● rotten, ○ fresh.'], state: snap() });
      while (true) {
        const rot: [number, number][] = [];
        for (let r = 0; r < R; r++)
          for (let c = 0; c < Cn; c++) {
            scanned++;
            if (g[r][c] !== 1) continue;
            if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => g[r + dr]?.[c + dc] === 2)) rot.push([r, c]);
          }
        if (!rot.length) {
          steps.push({ tag: 'tick', trace: ['A full scan finds nothing new to rot — stop.'], state: snap() });
          break;
        }
        for (const [r, c] of rot) g[r][c] = 2;
        minutes++;
        steps.push({ tag: 'rot', trace: ['Minute ', A(minutes), ': a full scan rots ', B(rot.length), ' orange(s).'], state: snap(rot) });
      }
      const fresh = g.flat().filter((v) => v === 1).length;
      const result = fresh === 0 ? minutes : -1;
      steps.push({ tag: 'ret', trace: fresh === 0 ? ['All rotten after ', C(minutes), ' minute(s).'] : [F(fresh), ' orange(s) never rot — ', C('-1'), '.'], state: snap() });
      return { steps, result: String(result), resultDetail: fresh === 0 ? undefined : 'some oranges isolated' };
    },
    note: 'Each minute rescans all R·C cells, and there can be up to R·C minutes, so the worst case is O((R·C)²). Multi-source BFS touches every cell exactly once.',
    complexity: { time: 'O((R·C)²)', space: 'O(1)' },
  },
};

export const graphs1 = [numIslands, maxAreaIsland, pacificAtlantic, surroundedRegions, rottingOranges];
