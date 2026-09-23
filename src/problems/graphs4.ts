// Graphs, part 4 — node-link graphs: union-find, colouring, shortest paths, MST, bridges.
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1 } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/** Positions n nodes on a circle (0..1 coordinates). */
function circleLayout(labels: (string | number)[]): TreeState['nodes'] {
  const n = labels.length;
  return labels.map((val, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { id: i, val, x: 0.5 + 0.42 * Math.cos(angle), y: 0.5 + 0.42 * Math.sin(angle) };
  });
}

/** Parse "0-1, 1-2" edges over 0-based node ids. */
function parseEdges(s: string, maxNodes = 8): { n: number; edges: [number, number][] } | string {
  const parts = (s ?? '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return 'Enter edges like "0-1, 1-2".';
  const edges: [number, number][] = [];
  let maxId = 0;
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*[-→>]\s*(\d+)$/);
    if (!m) return `Bad edge "${p}" — use "u-v".`;
    const u = Number(m[1]);
    const v = Number(m[2]);
    maxId = Math.max(maxId, u, v);
    edges.push([u, v]);
  }
  if (maxId + 1 > maxNodes) return `Keep it to at most ${maxNodes} nodes (0..${maxNodes - 1}).`;
  return { n: maxId + 1, edges };
}

/** Parse weighted "0-1:5" edges. */
function parseWeighted(s: string, maxNodes = 7): { n: number; edges: [number, number, number][] } | string {
  const parts = (s ?? '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return 'Enter edges like "0-1:5, 1-2:3".';
  const edges: [number, number, number][] = [];
  let maxId = 0;
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*[-→>]\s*(\d+)\s*[:@]\s*(\d+)$/);
    if (!m) return `Bad edge "${p}" — use "u-v:w".`;
    const u = Number(m[1]);
    const v = Number(m[2]);
    const w = Number(m[3]);
    maxId = Math.max(maxId, u, v);
    edges.push([u, v, w]);
  }
  if (maxId + 1 > maxNodes) return `Keep it to at most ${maxNodes} nodes (0..${maxNodes - 1}).`;
  return { n: maxId + 1, edges };
}

const key = (u: number, v: number) => `${u}-${v}`;

/* ================= Number of Provinces ================= */
const numberOfProvinces: ProblemDef = {
  slug: 'number-of-provinces',
  title: 'Number of Provinces',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-provinces/',
  technique: 'Count connected components — one DFS per city not yet reached.',
  widget: 'graph',
  widgetTitle: 'Cities & direct roads',
  inputs: [{ key: 'edges', label: 'Connections (e.g. 0-1, 2-3)', defaultValue: '0-1, 2-3, 3-4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findCircleNum(vector<vector<int>>& g) {'),
      L('        int n = g.size(), count = 0;'),
      L('        vector<bool> seen(n, false);', 'init'),
      L('        for (int i = 0; i < n; i++)', 'scan'),
      L('            if (!seen[i]) { count++; dfs(g, seen, i); }', 'new'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    void dfs(vector<vector<int>>& g, vector<bool>& seen, int u) {', 'dfs'),
      L('        seen[u] = true;', 'dfs'),
      L('        for (int v = 0; v < g.size(); v++)', 'dfs'),
      L('            if (g[u][v] && !seen[v]) dfs(g, seen, v);', 'dfs'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findCircleNum(int[][] g) {'),
      L('        int n = g.length, count = 0;'),
      L('        boolean[] seen = new boolean[n];', 'init'),
      L('        for (int i = 0; i < n; i++)', 'scan'),
      L('            if (!seen[i]) { count++; dfs(g, seen, i); }', 'new'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    void dfs(int[][] g, boolean[] seen, int u) {', 'dfs'),
      L('        seen[u] = true;', 'dfs'),
      L('        for (int v = 0; v < g.length; v++)', 'dfs'),
      L('            if (g[u][v] == 1 && !seen[v]) dfs(g, seen, v);', 'dfs'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const adj: number[][] = [...Array(n)].map(() => []);
    for (const [u, v] of edges) {
      adj[u].push(v);
      adj[v].push(u);
    }
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const steps: Step[] = [];
    const seen = new Array(n).fill(false);
    const province = new Array<number>(n).fill(-1);
    let count = 0;
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: province[nd.id] >= 0 ? `P${province[nd.id]}` : undefined })),
      edges,
      current: cur,
      done: [...Array(n)].map((_, i) => i).filter((i) => seen[i]),
      aggs: [{ label: 'provinces so far', value: String(count), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['A province is a ', A('connected component'), ' — cities linked directly or through others. Count them by launching one search per unreached city.'],
      state: view(null),
    });
    const dfs = (u: number) => {
      if (steps.length > MAX_STEPS) return;
      seen[u] = true;
      province[u] = count;
      steps.push({ tag: 'dfs', trace: ['Reach city ', B(u), ' — it belongs to province ', B(count), '.'], state: view(u) });
      for (const v of adj[u]) if (!seen[v]) dfs(v);
    };
    for (let i = 0; i < n; i++) {
      if (!seen[i]) {
        count++;
        steps.push({
          tag: 'new',
          trace: ['City ', A(i), ' has not been reached by any earlier search, so it starts province #', C(count), '.'],
          state: view(i),
        });
        dfs(i);
      } else {
        steps.push({ tag: 'scan', trace: ['City ', F(i), ' was already absorbed into province ', F(province[i]), ' — skip.'], state: view(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Total provinces: ', C(count), '.'], state: view(null) });
    return { steps, result: String(count) };
  },
  note: 'The outer loop is what makes this a component count rather than a single traversal — a graph can be disconnected, so one DFS from node 0 is not enough. Union-find gives the same answer and is the natural choice when edges arrive one at a time instead of all at once.',
  complexity: { time: 'O(n²) on an adjacency matrix', space: 'O(n)' },
  brute: {
    label: 'Union-Find',
    technique: 'Start with every city as its own group and union the two ends of every connection; the groups left are the provinces.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<int> p;'),
        L('    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }'),
        L('public:'),
        L('    int findCircleNum(vector<vector<int>>& isConnected) {'),
        L('        int n = isConnected.size(), count = n;', 'init'),
        L('        p.resize(n); iota(p.begin(), p.end(), 0);', 'init'),
        L('        for (int i = 0; i < n; i++)', 'union'),
        L('            for (int j = i + 1; j < n; j++)', 'union'),
        L('                if (isConnected[i][j] && find(i) != find(j)) { p[find(i)] = find(j); count--; }', 'union'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int[] p;'),
        L('    int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }'),
        L('    public int findCircleNum(int[][] isConnected) {'),
        L('        int n = isConnected.length, count = n;', 'init'),
        L('        p = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++) p[i] = i;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'union'),
        L('            for (int j = i + 1; j < n; j++)', 'union'),
        L('                if (isConnected[i][j] == 1 && find(i) != find(j)) { p[find(i)] = find(j); count--; }', 'union'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const p = [...Array(n)].map((_, i) => i);
      const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
      let count = n;
      const merged: string[] = [];
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const steps: Step[] = [];
      const view = (): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: `g${find(nd.id)}` })),
        edges,
        edgeMark: merged,
        aggs: [{ label: 'provinces', value: String(count), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Every city starts as its own province (badge = group root).'], state: view() });
      for (const [u, v] of edges) {
        if (find(u) !== find(v)) {
          p[find(u)] = find(v);
          count--;
          merged.push(key(u, v));
          steps.push({ tag: 'union', trace: ['Connection ', A(`${u}–${v}`), ' joins two provinces — ', C(count), ' left.'], state: view() });
        } else {
          steps.push({ tag: 'union', trace: ['Connection ', F(`${u}–${v}`), ' is inside one province already.'], state: view() });
        }
      }
      steps.push({ tag: 'ret', trace: [C(count), ' province(s).'], state: view() });
      return { steps, result: String(count) };
    },
    note: 'Same answer as one DFS per unvisited city, with near-constant work per connection. Union-Find also handles connections arriving one at a time, where re-running DFS would be wasteful.',
    complexity: { time: 'O(n² · α(n)) on a matrix', space: 'O(n)' },
  },
};

/* ================= Is Graph Bipartite? ================= */
const isBipartite: ProblemDef = {
  slug: 'is-graph-bipartite',
  title: 'Is Graph Bipartite?',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/is-graph-bipartite/',
  technique: 'Two-colour the graph by BFS; a conflict means an odd cycle exists.',
  widget: 'graph',
  widgetTitle: 'Graph being 2-coloured',
  inputs: [{ key: 'edges', label: 'Edges (e.g. 0-1, 1-2)', defaultValue: '0-1, 1-2, 2-3, 3-0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isBipartite(vector<vector<int>>& g) {'),
      L('        int n = g.size();'),
      L('        vector<int> color(n, -1);', 'init'),
      L('        for (int s = 0; s < n; s++) {', 'component'),
      L('            if (color[s] != -1) continue;'),
      L('            queue<int> q; q.push(s); color[s] = 0;', 'seed'),
      L('            while (!q.empty()) {', 'pop'),
      L('                int u = q.front(); q.pop();', 'pop'),
      L('                for (int v : g[u]) {', 'neighbour'),
      L('                    if (color[v] == -1) {', 'paint'),
      L('                        color[v] = 1 - color[u]; q.push(v);', 'paint'),
      L('                    } else if (color[v] == color[u])', 'conflict'),
      L('                        return false;', 'conflict'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isBipartite(int[][] g) {'),
      L('        int n = g.length;'),
      L('        int[] color = new int[n];'),
      L('        Arrays.fill(color, -1);', 'init'),
      L('        for (int s = 0; s < n; s++) {', 'component'),
      L('            if (color[s] != -1) continue;'),
      L('            Queue<Integer> q = new LinkedList<>();'),
      L('            q.add(s); color[s] = 0;', 'seed'),
      L('            while (!q.isEmpty()) {', 'pop'),
      L('                int u = q.remove();', 'pop'),
      L('                for (int v : g[u]) {', 'neighbour'),
      L('                    if (color[v] == -1) {', 'paint'),
      L('                        color[v] = 1 - color[u]; q.add(v);', 'paint'),
      L('                    } else if (color[v] == color[u])', 'conflict'),
      L('                        return false;', 'conflict'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const adj: number[][] = [...Array(n)].map(() => []);
    for (const [u, v] of edges) {
      adj[u].push(v);
      adj[v].push(u);
    }
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const color = new Array(n).fill(-1);
    const steps: Step[] = [];
    const view = (cur: number | null, badEdge?: string): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: color[nd.id] === -1 ? undefined : color[nd.id] === 0 ? '●' : '○' })),
      edges,
      current: cur,
      done: [...Array(n)].map((_, i) => i).filter((i) => color[i] === 0),
      queued: [...Array(n)].map((_, i) => i).filter((i) => color[i] === 1),
      edgeMark: badEdge ? [badEdge] : [],
      aggs: [{ label: 'colours', value: color.map((c, i) => `${i}:${c === -1 ? '?' : c === 0 ? '●' : '○'}`).join(' '), c: 'b' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Bipartite means the nodes split into two groups with every edge crossing between them. Equivalently: the graph can be ', A('2-coloured'), ' with no edge joining same colours.',
      ],
      state: view(null),
    });
    let ok = true;
    outer: for (let s = 0; s < n; s++) {
      if (color[s] !== -1) continue;
      color[s] = 0;
      const q = [s];
      steps.push({
        tag: 'seed',
        trace: ['Start a new component at node ', A(s), ' and paint it ', B('●'), '. The choice is arbitrary — only the alternation matters.'],
        state: view(s),
      });
      let head = 0;
      while (head < q.length) {
        const u = q[head++];
        steps.push({ tag: 'pop', trace: ['Expand node ', A(u), ' (colour ', A(color[u] === 0 ? '●' : '○'), ').'], state: view(u) });
        for (const v of adj[u]) {
          if (color[v] === -1) {
            color[v] = 1 - color[u];
            q.push(v);
            steps.push({
              tag: 'paint',
              trace: ['Neighbour ', B(v), ' is uncoloured — give it the ', B('opposite'), ' colour ', B(color[v] === 0 ? '●' : '○'), '.'],
              state: view(u),
            });
          } else if (color[v] === color[u]) {
            ok = false;
            steps.push({
              tag: 'conflict',
              trace: [
                'Edge ', F(`${u}–${v}`), ' joins two nodes of the same colour. That means an ', F('odd cycle'), ' — the graph is ', C('not bipartite'), '.',
              ],
              state: view(u, key(u, v)),
            });
            break outer;
          }
        }
        if (steps.length > MAX_STEPS) break outer;
      }
      steps.push({ tag: 'component', trace: ['Component finished with no conflict — check whether any node is still uncoloured.'], state: view(null) });
    }
    if (ok) {
      steps.push({
        tag: 'ret',
        trace: ['Every edge connects a ', C('●'), ' to a ', C('○'), ' — the graph ', C('is bipartite'), '.'],
        state: view(null),
      });
    }
    return { steps, result: ok ? 'true' : 'false' };
  },
  note: 'A graph is bipartite exactly when it has no odd-length cycle, and the colouring conflict is how you detect one — walking an odd cycle returns you to the start needing the opposite colour. Looping over every start node matters because a disconnected graph can hide the offending component.',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  brute: {
    label: 'Try every colouring',
    technique: 'Assign each node one of two colours in all 2ⁿ ways and check whether any assignment has no same-coloured edge.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isBipartite(vector<vector<int>>& graph) {'),
        L('        int n = graph.size();', 'init'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'try'),
        L('            bool ok = true;', 'try'),
        L('            for (int u = 0; u < n && ok; u++)', 'try'),
        L('                for (int v : graph[u])', 'try'),
        L('                    if (((mask >> u) & 1) == ((mask >> v) & 1)) { ok = false; break; }', 'try'),
        L('            if (ok) return true;', 'ok'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isBipartite(int[][] graph) {'),
        L('        int n = graph.length;', 'init'),
        L('        for (int mask = 0; mask < (1 << n); mask++) {', 'try'),
        L('            boolean ok = true;', 'try'),
        L('            for (int u = 0; u < n && ok; u++)', 'try'),
        L('                for (int v : graph[u])', 'try'),
        L('                    if (((mask >> u) & 1) == ((mask >> v) & 1)) { ok = false; break; }', 'try'),
        L('            if (ok) return true;', 'ok'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const steps: Step[] = [];
      const view = (mask: number, bad?: [number, number]): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: (mask >> nd.id) & 1 ? '○' : '●' })),
        edges,
        done: [...Array(n)].map((_, i) => i).filter((i) => !((mask >> i) & 1)),
        queued: [...Array(n)].map((_, i) => i).filter((i) => (mask >> i) & 1),
        edgeMark: bad ? [key(bad[0], bad[1])] : [],
        aggs: [{ label: 'colourings tried', value: `${mask + 1} / ${2 ** n}`, c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No BFS: test every one of the ', A(2 ** n), ' ways to colour the nodes ● or ○.'], state: view(0) });
      let ok = false;
      for (let mask = 0; mask < 1 << n; mask++) {
        const bad = edges.find(([u, v]) => ((mask >> u) & 1) === ((mask >> v) & 1));
        if (!bad) {
          ok = true;
          steps.push({ tag: 'ok', trace: ['Colouring #', A(mask + 1), ' has no edge between equal colours — ', C('bipartite'), '.'], state: view(mask) });
          break;
        }
        if (steps.length < 40) steps.push({ tag: 'try', trace: ['Colouring #', A(mask + 1), ': edge ', F(`${bad[0]}–${bad[1]}`), ' joins two equal colours.'], state: view(mask, bad) });
      }
      if (!ok) steps.push({ tag: 'ret', trace: ['All ', A(2 ** n), ' colourings fail — ', C('not bipartite'), '.'], state: view((1 << n) - 1) });
      return { steps, result: ok ? 'true' : 'false' };
    },
    note: 'Exponential in the number of nodes. Once one node’s colour is fixed, every neighbour’s colour is forced, so BFS/DFS colouring decides it in O(V + E).',
    complexity: { time: 'O(2ⁿ · E)', space: 'O(1)' },
  },
};

/* ================= Find Eventual Safe States ================= */
const eventualSafeStates: ProblemDef = {
  slug: 'find-eventual-safe-states',
  title: 'Find Eventual Safe States',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-eventual-safe-states/',
  technique: 'A node is safe when every outgoing path ends at a terminal — DFS with three colours finds cycles.',
  widget: 'graph',
  widgetTitle: 'Directed graph',
  inputs: [{ key: 'edges', label: 'Directed edges (e.g. 0-1, 1-2)', defaultValue: '0-1, 0-2, 1-2, 1-3, 2-5, 3-0, 4-5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> state;   // 0 = new, 1 = in progress, 2 = safe'),
      L('public:'),
      L('    vector<int> eventualSafeNodes(vector<vector<int>>& g) {'),
      L('        state.assign(g.size(), 0);', 'init'),
      L('        vector<int> res;'),
      L('        for (int i = 0; i < g.size(); i++)', 'scan'),
      L('            if (safe(g, i)) res.push_back(i);', 'scan'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    bool safe(vector<vector<int>>& g, int u) {', 'enter'),
      L('        if (state[u] > 0) return state[u] == 2;', 'known'),
      L('        state[u] = 1;                       // on the current path', 'mark'),
      L('        for (int v : g[u])', 'explore'),
      L('            if (!safe(g, v)) return false;', 'unsafe'),
      L('        state[u] = 2;', 'safe'),
      L('        return true;', 'safe'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    int[] state;   // 0 = new, 1 = in progress, 2 = safe'),
      L('    public List<Integer> eventualSafeNodes(int[][] g) {'),
      L('        state = new int[g.length];', 'init'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        for (int i = 0; i < g.length; i++)', 'scan'),
      L('            if (safe(g, i)) res.add(i);', 'scan'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    boolean safe(int[][] g, int u) {', 'enter'),
      L('        if (state[u] > 0) return state[u] == 2;', 'known'),
      L('        state[u] = 1;                       // on the current path', 'mark'),
      L('        for (int v : g[u])', 'explore'),
      L('            if (!safe(g, v)) return false;', 'unsafe'),
      L('        state[u] = 2;', 'safe'),
      L('        return true;', 'safe'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const adj: number[][] = [...Array(n)].map(() => []);
    for (const [u, v] of edges) adj[u].push(v);
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const state = new Array(n).fill(0);
    const steps: Step[] = [];
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: state[nd.id] === 1 ? '…' : state[nd.id] === 2 ? '✓' : state[nd.id] === 3 ? '✗' : undefined })),
      edges,
      directed: true,
      current: cur,
      done: [...Array(n)].map((_, i) => i).filter((i) => state[i] === 2),
      queued: [...Array(n)].map((_, i) => i).filter((i) => state[i] === 1),
      aggs: [{ label: 'safe so far', value: [...Array(n)].map((_, i) => i).filter((i) => state[i] === 2).join(', ') || '—', c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'A node is ', A('safe'), ' if every path leaving it stops at a dead end. Equivalently, it can never reach a cycle. Three states track this: unvisited, on the current path, and proven safe.',
      ],
      state: view(null),
    });
    const safe = (u: number): boolean => {
      if (steps.length > MAX_STEPS) return true;
      if (state[u] > 0) {
        steps.push({
          tag: 'known',
          trace:
            state[u] === 1
              ? ['Node ', F(u), ' is already ', F('on the current path'), ' — we have looped back, so a cycle exists and this route is unsafe.']
              : state[u] === 2
                ? ['Node ', B(u), ' was already proven ', B('safe'), ' — reuse that answer.']
                : ['Node ', F(u), ' was already proven ', F('unsafe'), '.'],
          state: view(u),
        });
        return state[u] === 2;
      }
      state[u] = 1;
      steps.push({ tag: 'mark', trace: ['Enter node ', A(u), ' and mark it as ', A('in progress'), '.'], state: view(u) });
      for (const v of adj[u]) {
        steps.push({ tag: 'explore', trace: ['Follow edge ', A(u), ' → ', A(v), '.'], state: view(u) });
        if (!safe(v)) {
          state[u] = 3;
          steps.push({ tag: 'unsafe', trace: ['That route leads into a cycle, so node ', F(u), ' is ', F('unsafe'), ' too.'], state: view(u) });
          return false;
        }
      }
      state[u] = 2;
      steps.push({
        tag: 'safe',
        trace: ['Every edge out of node ', B(u), ' ends somewhere safe (or it has none) — so ', B(u), ' is ', C('safe'), '.'],
        state: view(u),
      });
      return true;
    };
    const res: number[] = [];
    for (let i = 0; i < n; i++) {
      if (safe(i)) res.push(i);
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Safe nodes, in order: ', C(res.join(', ')), '.'] : ['No node is safe — every path reaches a cycle.'],
      state: view(null),
    });
    return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
  },
  note: 'The middle state ("in progress") is what distinguishes a back edge into the current path — a real cycle — from a cross edge into an already-finished subtree, which is harmless. Reversing the edges and running Kahn topological sort gives the same answer iteratively.',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  brute: {
    label: 'Reverse graph + Kahn',
    technique: 'Reverse every edge and peel nodes with no outgoing edges (terminals) layer by layer; everything peeled is safe.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> eventualSafeNodes(vector<vector<int>>& g) {'),
        L('        int n = g.size();', 'init'),
        L('        vector<vector<int>> rev(n); vector<int> out(n);', 'init'),
        L('        for (int u = 0; u < n; u++) { out[u] = g[u].size(); for (int v : g[u]) rev[v].push_back(u); }', 'init'),
        L('        queue<int> q;', 'seed'),
        L('        for (int u = 0; u < n; u++) if (!out[u]) q.push(u);', 'seed'),
        L('        vector<bool> safe(n);', 'seed'),
        L('        while (!q.empty()) {', 'safe'),
        L('            int v = q.front(); q.pop(); safe[v] = true;', 'safe'),
        L('            for (int u : rev[v]) if (--out[u] == 0) q.push(u);', 'safe'),
        L('        }'),
        L('        vector<int> res;', 'ret'),
        L('        for (int u = 0; u < n; u++) if (safe[u]) res.push_back(u);', 'ret'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> eventualSafeNodes(int[][] g) {'),
        L('        int n = g.length;', 'init'),
        L('        List<List<Integer>> rev = new ArrayList<>(); int[] out = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++) rev.add(new ArrayList<>());', 'init'),
        L('        for (int u = 0; u < n; u++) { out[u] = g[u].length; for (int v : g[u]) rev.get(v).add(u); }', 'init'),
        L('        Deque<Integer> q = new ArrayDeque<>();', 'seed'),
        L('        for (int u = 0; u < n; u++) if (out[u] == 0) q.add(u);', 'seed'),
        L('        boolean[] safe = new boolean[n];', 'seed'),
        L('        while (!q.isEmpty()) {', 'safe'),
        L('            int v = q.poll(); safe[v] = true;', 'safe'),
        L('            for (int u : rev.get(v)) if (--out[u] == 0) q.add(u);', 'safe'),
        L('        }'),
        L('        List<Integer> res = new ArrayList<>();', 'ret'),
        L('        for (int u = 0; u < n; u++) if (safe[u]) res.add(u);', 'ret'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const out = Array(n).fill(0);
      const rev: number[][] = [...Array(n)].map(() => []);
      for (const [u, v] of edges) {
        out[u]++;
        rev[v].push(u);
      }
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const safe = Array(n).fill(false);
      let queue: number[] = [];
      const steps: Step[] = [];
      const view = (cur: number | null): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: safe[nd.id] ? '✓' : `out:${out[nd.id]}` })),
        edges,
        directed: true,
        current: cur,
        done: [...Array(n)].map((_, i) => i).filter((i) => safe[i]),
        queued: [...queue],
        aggs: [{ label: 'safe so far', value: [...Array(n)].map((_, i) => i).filter((i) => safe[i]).join(', ') || '—', c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Count each node’s outgoing edges. A node whose every exit leads to safe nodes is safe too.'], state: view(null) });
      queue = [...Array(n)].map((_, i) => i).filter((i) => out[i] === 0);
      steps.push({ tag: 'seed', trace: ['Terminal nodes (no exits) are safe: ', B(`{${queue.join(', ')}}`), '.'], state: view(null) });
      while (queue.length) {
        const v = queue.shift()!;
        safe[v] = true;
        const unlocked: number[] = [];
        for (const u of rev[v]) {
          out[u]--;
          if (out[u] === 0) {
            queue.push(u);
            unlocked.push(u);
          }
        }
        steps.push({ tag: 'safe', trace: ['Node ', B(v), ' is safe. ', unlocked.length ? ['Nodes ', unlocked.join(', '), ' now have only safe exits — safe too.'].join('') : 'No new node becomes safe.'], state: view(v) });
      }
      const res = [...Array(n)].map((_, i) => i).filter((i) => safe[i]);
      steps.push({ tag: 'ret', trace: ['Safe nodes: ', C(res.length ? res.join(', ') : 'none'), '. Nodes never peeled can reach a cycle.'], state: view(null) });
      return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
    },
    note: 'Also O(V + E), but iterative: it peels the graph from the terminals backwards instead of detecting cycles with a coloured DFS, so there is no recursion depth to worry about.',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
  },
};

/* ================= Number of Ways to Arrive at Destination ================= */
const numberOfWays: ProblemDef = {
  slug: 'number-of-ways-to-arrive-at-destination',
  title: 'Number of Ways to Arrive at Destination',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/',
  technique: 'Dijkstra carrying a path counter: equal distance adds counts, shorter distance resets them.',
  widget: 'graph',
  widgetTitle: 'Weighted graph',
  inputs: [{ key: 'edges', label: 'Weighted edges (e.g. 0-1:5)', defaultValue: '0-1:1, 0-2:1, 1-3:1, 2-3:1, 3-4:1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countPaths(int n, vector<vector<int>>& roads) {'),
      L('        const long MOD = 1e9 + 7;'),
      L('        vector<vector<pair<int,long>>> g(n);'),
      L('        for (auto& r : roads) {'),
      L('            g[r[0]].push_back({r[1], r[2]});'),
      L('            g[r[1]].push_back({r[0], r[2]});'),
      L('        }'),
      L('        vector<long> dist(n, LONG_MAX), ways(n, 0);'),
      L('        dist[0] = 0; ways[0] = 1;', 'init'),
      L('        priority_queue<pair<long,int>, vector<pair<long,int>>, greater<>> pq;'),
      L('        pq.push({0, 0});'),
      L('        while (!pq.empty()) {', 'pop'),
      L('            auto [d, u] = pq.top(); pq.pop();', 'pop'),
      L('            if (d > dist[u]) continue;', 'stale'),
      L('            for (auto [v, w] : g[u]) {', 'relax'),
      L('                if (d + w < dist[v]) {', 'shorter'),
      L('                    dist[v] = d + w; ways[v] = ways[u];', 'shorter'),
      L('                    pq.push({dist[v], v});'),
      L('                } else if (d + w == dist[v])', 'equal'),
      L('                    ways[v] = (ways[v] + ways[u]) % MOD;', 'equal'),
      L('            }'),
      L('        }'),
      L('        return ways[n-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countPaths(int n, int[][] roads) {'),
      L('        final long MOD = 1_000_000_007L;'),
      L('        List<long[]>[] g = new List[n];'),
      L('        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();'),
      L('        for (int[] r : roads) {'),
      L('            g[r[0]].add(new long[]{r[1], r[2]});'),
      L('            g[r[1]].add(new long[]{r[0], r[2]});'),
      L('        }'),
      L('        long[] dist = new long[n], ways = new long[n];'),
      L('        Arrays.fill(dist, Long.MAX_VALUE);'),
      L('        dist[0] = 0; ways[0] = 1;', 'init'),
      L('        PriorityQueue<long[]> pq = new PriorityQueue<>((a,b) ->'),
      L('            Long.compare(a[0], b[0]));'),
      L('        pq.add(new long[]{0, 0});'),
      L('        while (!pq.isEmpty()) {', 'pop'),
      L('            long[] cur = pq.poll(); long d = cur[0]; int u = (int) cur[1];', 'pop'),
      L('            if (d > dist[u]) continue;', 'stale'),
      L('            for (long[] e : g[u]) {', 'relax'),
      L('                int v = (int) e[0]; long w = e[1];'),
      L('                if (d + w < dist[v]) {', 'shorter'),
      L('                    dist[v] = d + w; ways[v] = ways[u];', 'shorter'),
      L('                    pq.add(new long[]{dist[v], v});'),
      L('                } else if (d + w == dist[v])', 'equal'),
      L('                    ways[v] = (ways[v] + ways[u]) % MOD;', 'equal'),
      L('            }'),
      L('        }'),
      L('        return (int) ways[n-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseWeighted(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const adj: [number, number][][] = [...Array(n)].map(() => []);
    for (const [u, v, w] of edges) {
      adj[u].push([v, w]);
      adj[v].push([u, w]);
    }
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const INF = Infinity;
    const dist = new Array(n).fill(INF);
    const ways = new Array(n).fill(0);
    const steps: Step[] = [];
    const pq: [number, number][] = [];
    const view = (cur: number | null, touched: string[] = []): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: dist[nd.id] === INF ? '∞' : `${dist[nd.id]}/${ways[nd.id]}` })),
      edges: edges.map(([u, v]) => [u, v] as [number, number]),
      current: cur,
      edgeMark: touched,
      aggs: [
        { label: 'node badge', value: 'distance / number of shortest paths', c: 'a' },
        { label: 'frontier', value: pq.map(([d, u]) => `${u}@${d}`).join(' ') || '—', c: 'b' },
      ],
    });
    dist[0] = 0;
    ways[0] = 1;
    pq.push([0, 0]);
    steps.push({
      tag: 'init',
      trace: [
        'Node 0 is reachable in ', A(0), ' time by exactly ', A(1), ' path (the empty one). Every other node starts unreachable with ', A(0), ' paths.',
      ],
      state: view(0),
    });
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      steps.push({ tag: 'pop', trace: ['Settle node ', A(u), ' at distance ', A(d), ' — nothing shorter remains in the queue.'], state: view(u) });
      if (d > dist[u]) {
        steps.push({ tag: 'stale', trace: ['A shorter route to ', F(u), ' was found since this entry was queued — discard it.'], state: view(u) });
        continue;
      }
      const touched: string[] = [];
      for (const [v, w] of adj[u]) {
        if (d + w < dist[v]) {
          dist[v] = d + w;
          ways[v] = ways[u];
          pq.push([dist[v], v]);
          touched.push(key(u, v));
          steps.push({
            tag: 'shorter',
            trace: [
              'Reaching ', B(v), ' via ', A(u), ' costs ', B(d + w), ', beating its old ', F(dist[v] === d + w ? '∞' : dist[v]), '. Every previous count is now obsolete — ', A('reset'),
              ' ways[', B(v), '] to ', B(ways[u]), '.',
            ],
            state: view(u, touched),
          });
        } else if (d + w === dist[v]) {
          ways[v] += ways[u];
          touched.push(key(u, v));
          steps.push({
            tag: 'equal',
            trace: [
              'Another route to ', B(v), ' with the ', A('same'), ' cost ', A(dist[v]), ' — so its path count ', A('adds'), ': ways[', B(v), '] = ', B(ways[v]), '.',
            ],
            state: view(u, touched),
          });
        }
      }
      if (!touched.length) {
        steps.push({ tag: 'relax', trace: ['No neighbour improves or ties from here.'], state: view(u) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Shortest time to node ', C(n - 1), ' is ', C(dist[n - 1] === INF ? '∞' : dist[n - 1]), ', achievable ', C(ways[n - 1]), ' way(s).'],
      state: view(null),
    });
    return { steps, result: String(ways[n - 1]), resultDetail: `shortest time ${dist[n - 1] === INF ? '∞' : dist[n - 1]}` };
  },
  note: 'The reset-versus-add distinction is the whole problem: a strictly shorter route invalidates every path counted so far, while an equally short one contributes its own count. Because Dijkstra settles nodes in non-decreasing distance order, ways[u] is already final when u is used to relax its neighbours.',
  complexity: { time: 'O(E log V)', space: 'O(V + E)' },
  brute: {
    label: 'Enumerate every path',
    technique: 'DFS every simple path from 0 to n − 1, tracking the smallest total time and how many paths achieve it.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    long best = LONG_MAX, ways = 0;'),
        L('    void dfs(vector<vector<pair<int,int>>>& adj, int u, long t, vector<bool>& on) {', 'pop'),
        L('        if (u == adj.size() - 1) {', 'better', 'equal'),
        L('            if (t < best) { best = t; ways = 1; } else if (t == best) ways++;', 'better', 'equal'),
        L('            return;'),
        L('        }'),
        L('        for (auto [v, w] : adj[u]) if (!on[v]) {', 'relax'),
        L('            on[v] = true; dfs(adj, v, t + w, on); on[v] = false;', 'relax'),
        L('        }'),
        L('    }'),
        L('public:'),
        L('    int countPaths(int n, vector<vector<int>>& roads) { /* build adj, dfs from 0 */ return ways; }', 'init', 'ret'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    long best = Long.MAX_VALUE, ways = 0;'),
        L('    void dfs(List<int[]>[] adj, int u, long t, boolean[] on) {', 'pop'),
        L('        if (u == adj.length - 1) {', 'better', 'equal'),
        L('            if (t < best) { best = t; ways = 1; } else if (t == best) ways++;', 'better', 'equal'),
        L('            return;'),
        L('        }'),
        L('        for (int[] e : adj[u]) if (!on[e[0]]) {', 'relax'),
        L('            on[e[0]] = true; dfs(adj, e[0], t + e[1], on); on[e[0]] = false;', 'relax'),
        L('        }'),
        L('    }'),
        L('    public int countPaths(int n, int[][] roads) { /* build adj, dfs from 0 */ return (int) ways; }', 'init', 'ret'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseWeighted(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const adj: [number, number][][] = [...Array(n)].map(() => []);
      for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
      }
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      let best = Infinity;
      let ways = 0;
      let paths = 0;
      const path = [0];
      const steps: Step[] = [];
      const view = (): TreeState => ({
        nodes,
        edges: edges.map(([u, v]) => [u, v] as [number, number]),
        done: [...path],
        current: n - 1,
        edgeMark: path.slice(1).map((v, i) => key(path[i], v)),
        aggs: [
          { label: 'shortest time', value: best === Infinity ? '—' : String(best), c: 'b' },
          { label: 'ways', value: String(ways), c: 'c' },
          { label: 'complete paths', value: String(paths), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No Dijkstra: walk every simple path from ', A(0), ' to ', A(n - 1), '.'], state: view() });
      const on = Array(n).fill(false);
      on[0] = true;
      const dfs = (u: number, t: number) => {
        if (u === n - 1) {
          paths++;
          if (t < best) {
            best = t;
            ways = 1;
            if (steps.length < MAX_STEPS) steps.push({ tag: 'better', trace: ['Path ', A(path.join(' → ')), ' takes ', B(t), ' — a new shortest time; ways reset to 1.'], state: view() });
          } else if (t === best) {
            ways++;
            if (steps.length < MAX_STEPS) steps.push({ tag: 'equal', trace: ['Path ', A(path.join(' → ')), ' also takes ', B(t), ' — ways = ', C(ways), '.'], state: view() });
          } else if (steps.length < MAX_STEPS) steps.push({ tag: 'pop', trace: ['Path ', A(path.join(' → ')), ' takes ', F(t), ' — too slow.'], state: view() });
          return;
        }
        for (const [v, w] of adj[u]) {
          if (on[v]) continue;
          on[v] = true;
          path.push(v);
          dfs(v, t + w);
          path.pop();
          on[v] = false;
        }
      };
      dfs(0, 0);
      steps.push({ tag: 'ret', trace: ['Checked ', A(paths), ' paths: ', C(ways), ' of them take the shortest time ', C(best === Infinity ? '∞' : best), '.'], state: view() });
      return { steps, result: String(ways), resultDetail: `shortest time ${best === Infinity ? '∞' : best}` };
    },
    note: 'The number of simple paths can be exponential in the number of nodes. Dijkstra that carries a path count alongside each distance finds the same answer in O(E log V).',
    complexity: { time: 'O(V!) worst case', space: 'O(V) stack' },
  },
};

/* ================= Find the City With the Smallest Number of Neighbors ================= */
const findTheCity: ProblemDef = {
  slug: 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance',
  title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/',
  technique: 'Floyd–Warshall: allow one more intermediate city at a time until all pairs are optimal.',
  widget: 'graph',
  widgetTitle: 'Weighted graph',
  inputs: [
    { key: 'edges', label: 'Weighted edges (e.g. 0-1:3)', defaultValue: '0-1:3, 1-2:1, 1-3:4, 2-3:1', wide: true },
    { key: 'threshold', label: 'Distance threshold', defaultValue: '4' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findTheCity(int n, vector<vector<int>>& edges, int limit) {'),
      L('        vector<vector<int>> d(n, vector<int>(n, 1e9));'),
      L('        for (int i = 0; i < n; i++) d[i][i] = 0;', 'init'),
      L('        for (auto& e : edges)', 'init'),
      L('            d[e[0]][e[1]] = d[e[1]][e[0]] = e[2];', 'init'),
      L('        for (int k = 0; k < n; k++)', 'via'),
      L('            for (int i = 0; i < n; i++)', 'via'),
      L('                for (int j = 0; j < n; j++)', 'via'),
      L('                    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);', 'relax'),
      L('        int best = -1, bestCount = n + 1;'),
      L('        for (int i = 0; i < n; i++) {', 'count'),
      L('            int c = 0;'),
      L('            for (int j = 0; j < n; j++)', 'count'),
      L('                if (i != j && d[i][j] <= limit) c++;', 'count'),
      L('            if (c <= bestCount) { bestCount = c; best = i; }', 'pick'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findTheCity(int n, int[][] edges, int limit) {'),
      L('        int[][] d = new int[n][n];'),
      L('        for (int[] row : d) Arrays.fill(row, 1_000_000_000);'),
      L('        for (int i = 0; i < n; i++) d[i][i] = 0;', 'init'),
      L('        for (int[] e : edges)', 'init'),
      L('            d[e[0]][e[1]] = d[e[1]][e[0]] = e[2];', 'init'),
      L('        for (int k = 0; k < n; k++)', 'via'),
      L('            for (int i = 0; i < n; i++)', 'via'),
      L('                for (int j = 0; j < n; j++)', 'via'),
      L('                    d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);', 'relax'),
      L('        int best = -1, bestCount = n + 1;'),
      L('        for (int i = 0; i < n; i++) {', 'count'),
      L('            int c = 0;'),
      L('            for (int j = 0; j < n; j++)', 'count'),
      L('                if (i != j && d[i][j] <= limit) c++;', 'count'),
      L('            if (c <= bestCount) { bestCount = c; best = i; }', 'pick'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseWeighted(values.edges, 6);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const limit = parseInt1(values.threshold, 'Distance threshold', { min: 0 });
    if (typeof limit === 'string') return { error: limit };
    const INF = 1e9;
    const d: number[][] = [...Array(n)].map((_, i) => [...Array(n)].map((_, j) => (i === j ? 0 : INF)));
    for (const [u, v, w] of edges) {
      d[u][v] = Math.min(d[u][v], w);
      d[v][u] = Math.min(d[v][u], w);
    }
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const steps: Step[] = [];
    const view = (cur: number | null, note: { label: string; value: string; c: 'a' | 'b' | 'c' }[]): TreeState => ({
      nodes,
      edges: edges.map(([u, v]) => [u, v] as [number, number]),
      current: cur,
      aggs: note,
    });
    const matrixText = () => d.map((row, i) => `${i}: ${row.map((v) => (v >= INF ? '∞' : v)).join(' ')}`).join('   ');
    steps.push({
      tag: 'init',
      trace: [
        'Start from direct roads only: distance to yourself is ', A(0), ', a road is its own weight, and everything else is ', A('∞'), '.',
      ],
      state: view(null, [{ label: 'distance matrix', value: matrixText(), c: 'b' }]),
    });
    for (let k = 0; k < n; k++) {
      let improved = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (d[i][k] + d[k][j] < d[i][j]) {
            d[i][j] = d[i][k] + d[k][j];
            improved++;
          }
        }
      }
      steps.push({
        tag: 'via',
        trace: [
          'Now allow city ', A(k), ' as an intermediate stop. ', improved ? [B(improved), ' pair(s) got shorter.'].join('') : 'No pair improves through it.',
        ],
        state: view(k, [{ label: 'distance matrix', value: matrixText(), c: 'b' }]),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'relax',
      trace: ['After considering every city as an intermediate, the matrix holds ', B('all-pairs'), ' shortest distances.'],
      state: view(null, [{ label: 'distance matrix', value: matrixText(), c: 'b' }]),
    });
    let best = -1;
    let bestCount = n + 1;
    for (let i = 0; i < n; i++) {
      let c = 0;
      const reach: number[] = [];
      for (let j = 0; j < n; j++) if (i !== j && d[i][j] <= limit) {
        c++;
        reach.push(j);
      }
      const wins = c <= bestCount;
      if (wins) {
        bestCount = c;
        best = i;
      }
      steps.push({
        tag: 'count',
        trace: [
          'City ', A(i), ' can reach ', A(c), ' other city(ies) within ', A(limit), ' (', B(reach.join(', ') || 'none'), ')',
          wins ? ' — the fewest so far, and ties go to the larger index, so it takes the lead.' : '.',
        ],
        state: view(i, [
          { label: `reachable from ${i}`, value: reach.join(', ') || 'none', c: 'b' },
          { label: 'best so far', value: `city ${best} with ${bestCount}`, c: 'c' },
        ]),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'pick',
      trace: ['Answer: city ', C(best), ', reaching only ', C(bestCount), ' other city(ies) within ', C(limit), '.'],
      state: view(best, [{ label: 'answer', value: `city ${best}`, c: 'c' }]),
    });
    steps.push({ tag: 'ret', trace: ['Return ', C(best), '.'], state: view(best, [{ label: 'answer', value: `city ${best}`, c: 'c' }]) });
    return { steps, result: String(best), resultDetail: `${bestCount} cities within ${limit}` };
  },
  note: 'The k loop must be outermost — it is what makes the invariant "shortest paths using only cities 0..k as intermediates" hold. Swapping the loop order is the classic Floyd–Warshall bug and quietly produces wrong answers on graphs where a path needs two intermediates.',
  complexity: { time: 'O(n³)', space: 'O(n²)' },
  brute: {
    label: 'Dijkstra from every city',
    technique: 'Run a single-source shortest path from each city in turn and count how many cities land within the threshold.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src);  // O(n²) array version'),
        L('public:'),
        L('    int findTheCity(int n, vector<vector<int>>& edges, int limit) {'),
        L('        vector<vector<pair<int,int>>> adj(n);', 'init'),
        L('        for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }', 'init'),
        L('        int best = -1, bestCount = INT_MAX;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'count'),
        L('            auto d = dijkstra(n, adj, i);', 'count'),
        L('            int c = 0; for (int j = 0; j < n; j++) if (j != i && d[j] <= limit) c++;', 'count'),
        L('            if (c <= bestCount) { bestCount = c; best = i; }', 'count'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int[] dijkstra(int n, List<int[]>[] adj, int src) { /* O(n²) array version */ }'),
        L('    public int findTheCity(int n, int[][] edges, int limit) {'),
        L('        List<int[]>[] adj = new List[n];', 'init'),
        L('        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();', 'init'),
        L('        for (int[] e : edges) { adj[e[0]].add(new int[]{e[1], e[2]}); adj[e[1]].add(new int[]{e[0], e[2]}); }', 'init'),
        L('        int best = -1, bestCount = Integer.MAX_VALUE;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'count'),
        L('            int[] d = dijkstra(n, adj, i);', 'count'),
        L('            int c = 0; for (int j = 0; j < n; j++) if (j != i && d[j] <= limit) c++;', 'count'),
        L('            if (c <= bestCount) { bestCount = c; best = i; }', 'count'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseWeighted(values.edges, 6);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const limit = parseInt1(values.threshold, 'Distance threshold', { min: 0 });
      if (typeof limit === 'string') return { error: limit };
      const adj: [number, number][][] = [...Array(n)].map(() => []);
      for (const [u, v, w] of edges) {
        adj[u].push([v, w]);
        adj[v].push([u, w]);
      }
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const steps: Step[] = [];
      let best = -1;
      let bestCount = Infinity;
      const view = (cur: number | null, dist?: number[]): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: dist ? (dist[nd.id] === Infinity ? '∞' : String(dist[nd.id])) : undefined })),
        edges: edges.map(([u, v]) => [u, v] as [number, number]),
        current: cur,
        done: dist ? [...Array(n)].map((_, j) => j).filter((j) => j !== cur && dist[j] <= limit) : [],
        aggs: [{ label: 'best so far', value: best < 0 ? '—' : `city ${best} with ${bestCount}`, c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['No all-pairs table: run Dijkstra once per city. Badges show distances from the current city.'], state: view(null) });
      for (let i = 0; i < n; i++) {
        const dist = Array(n).fill(Infinity);
        const done = Array(n).fill(false);
        dist[i] = 0;
        for (let it = 0; it < n; it++) {
          let u = -1;
          for (let j = 0; j < n; j++) if (!done[j] && (u < 0 || dist[j] < dist[u])) u = j;
          if (dist[u] === Infinity) break;
          done[u] = true;
          for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
        const c = dist.filter((d, j) => j !== i && d <= limit).length;
        if (c <= bestCount) {
          bestCount = c;
          best = i;
        }
        steps.push({ tag: 'count', trace: ['From city ', A(i), ': ', A(c), ' other city(ies) within ', A(limit), c === bestCount && best === i ? ' — the fewest so far (ties go to the larger index).' : '.'], state: view(i, dist) });
      }
      steps.push({ tag: 'ret', trace: ['Answer: city ', C(best), '.'], state: view(best) });
      return { steps, result: String(best), resultDetail: `${bestCount} cities within ${limit}` };
    },
    note: 'n runs of O(n²) Dijkstra is O(n³) — the same order as Floyd–Warshall on dense graphs, and faster on sparse ones with a heap. Floyd–Warshall is simply shorter to write.',
    complexity: { time: 'O(n³)', space: 'O(n)' },
  },
};

/* ================= Min Cost to Connect All Points ================= */
const minCostConnect: ProblemDef = {
  slug: 'min-cost-to-connect-all-points',
  title: 'Min Cost to Connect All Points',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/min-cost-to-connect-all-points/',
  technique: "Prim's MST: repeatedly absorb the nearest point not yet in the tree.",
  widget: 'graph',
  widgetTitle: 'Points & chosen edges',
  inputs: [{ key: 'points', label: 'Points (e.g. 0,0; 2,2; 3,10)', defaultValue: '0,0; 2,2; 3,10; 5,2; 7,0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minCostConnectPoints(vector<vector<int>>& p) {'),
      L('        int n = p.size(), total = 0, used = 1;'),
      L('        vector<int> best(n, INT_MAX);'),
      L('        vector<bool> inTree(n, false);'),
      L('        inTree[0] = true;', 'init'),
      L('        for (int i = 1; i < n; i++)', 'init'),
      L('            best[i] = dist(p[0], p[i]);', 'init'),
      L('        while (used < n) {', 'loop'),
      L('            int pick = -1;'),
      L('            for (int i = 0; i < n; i++)', 'choose'),
      L('                if (!inTree[i] && (pick == -1 || best[i] < best[pick]))', 'choose'),
      L('                    pick = i;', 'choose'),
      L('            inTree[pick] = true; total += best[pick]; used++;', 'add'),
      L('            for (int i = 0; i < n; i++)', 'update'),
      L('                if (!inTree[i])', 'update'),
      L('                    best[i] = min(best[i], dist(p[pick], p[i]));', 'update'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minCostConnectPoints(int[][] p) {'),
      L('        int n = p.length, total = 0, used = 1;'),
      L('        int[] best = new int[n];'),
      L('        boolean[] inTree = new boolean[n];'),
      L('        Arrays.fill(best, Integer.MAX_VALUE);'),
      L('        inTree[0] = true;', 'init'),
      L('        for (int i = 1; i < n; i++)', 'init'),
      L('            best[i] = dist(p[0], p[i]);', 'init'),
      L('        while (used < n) {', 'loop'),
      L('            int pick = -1;'),
      L('            for (int i = 0; i < n; i++)', 'choose'),
      L('                if (!inTree[i] && (pick == -1 || best[i] < best[pick]))', 'choose'),
      L('                    pick = i;', 'choose'),
      L('            inTree[pick] = true; total += best[pick]; used++;', 'add'),
      L('            for (int i = 0; i < n; i++)', 'update'),
      L('                if (!inTree[i])', 'update'),
      L('                    best[i] = Math.min(best[i], dist(p[pick], p[i]));', 'update'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const pts = (values.points ?? '')
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.split(/[,\s]+/).filter(Boolean).map(Number));
    if (pts.length < 2) return { error: 'Enter at least two points, e.g. "0,0; 2,2".' };
    if (pts.length > 6) return { error: 'Keep it to at most 6 points.' };
    if (!pts.every((p) => p.length === 2 && p.every((v) => Number.isFinite(v)))) return { error: 'Each point needs exactly two numbers, e.g. "3,10".' };

    const n = pts.length;
    const dist = (i: number, j: number) => Math.abs(pts[i][0] - pts[j][0]) + Math.abs(pts[i][1] - pts[j][1]);
    const nodes = circleLayout(pts.map((p) => `(${p[0]},${p[1]})`));
    const steps: Step[] = [];
    const inTree = new Array(n).fill(false);
    const best = new Array(n).fill(Infinity);
    const from = new Array(n).fill(-1);
    const chosen: [number, number][] = [];
    let total = 0;
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: inTree[nd.id] ? '✓' : best[nd.id] === Infinity ? '∞' : String(best[nd.id]) })),
      edges: chosen,
      edgeMark: chosen.map(([u, v]) => key(u, v)),
      current: cur,
      done: [...Array(n)].map((_, i) => i).filter((i) => inTree[i]),
      aggs: [
        { label: 'node badge', value: 'cheapest known link into the tree', c: 'a' },
        { label: 'total cost', value: String(total), c: 'c' },
      ],
    });
    inTree[0] = true;
    for (let i = 1; i < n; i++) {
      best[i] = dist(0, i);
      from[i] = 0;
    }
    steps.push({
      tag: 'init',
      trace: [
        'Start the tree with point ', A(0), '. Every other point records the cheapest known link ', B('into'), ' the tree — right now that is its distance to point 0.',
      ],
      state: view(0),
    });
    let used = 1;
    while (used < n) {
      let pick = -1;
      for (let i = 0; i < n; i++) if (!inTree[i] && (pick === -1 || best[i] < best[pick])) pick = i;
      steps.push({
        tag: 'choose',
        trace: ['Cheapest point still outside the tree is ', A(pick), ' at cost ', A(best[pick]), ' (via point ', A(from[pick]), ').'],
        state: view(pick),
      });
      inTree[pick] = true;
      total += best[pick];
      chosen.push([from[pick], pick]);
      used++;
      steps.push({
        tag: 'add',
        trace: ['Absorb it — running total ', B(total), '. That edge is now permanently part of the minimum spanning tree.'],
        state: view(pick),
      });
      const improved: number[] = [];
      for (let i = 0; i < n; i++) {
        if (!inTree[i] && dist(pick, i) < best[i]) {
          best[i] = dist(pick, i);
          from[i] = pick;
          improved.push(i);
        }
      }
      steps.push({
        tag: 'update',
        trace: improved.length
          ? ['Point ', A(pick), ' offers a cheaper link to ', B(improved.join(', ')), ' — update their best costs.']
          : ['No outside point gets a cheaper link through ', F(pick), '.'],
        state: view(pick),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['All ', C(n), ' points connected using ', C(n - 1), ' edge(s) at total cost ', C(total), '.'],
      state: view(null),
    });
    return { steps, result: String(total), resultDetail: `${n - 1} edges` };
  },
  note: 'On a complete graph — which this is, since any two points can be joined — Prim\'s with a simple array beats a heap, because the graph has O(n²) edges anyway. The greedy is safe by the cut property: the cheapest edge crossing any split of the nodes always belongs to some minimum spanning tree.',
  complexity: { time: 'O(n²)', space: 'O(n)' },
  brute: {
    label: "Kruskal's MST",
    technique: 'List every pair of points with its distance, sort the pairs, and add each one that joins two different groups.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<int> p;'),
        L('    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }'),
        L('public:'),
        L('    int minCostConnectPoints(vector<vector<int>>& pts) {'),
        L('        int n = pts.size(), total = 0, used = 0;', 'init'),
        L('        vector<array<int,3>> e;', 'init'),
        L('        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++)', 'init'),
        L('            e.push_back({abs(pts[i][0]-pts[j][0]) + abs(pts[i][1]-pts[j][1]), i, j});', 'init'),
        L('        sort(e.begin(), e.end());', 'sort'),
        L('        p.resize(n); iota(p.begin(), p.end(), 0);', 'sort'),
        L('        for (auto [w, a, b] : e) {', 'edge'),
        L('            if (find(a) == find(b)) continue;', 'skip'),
        L('            p[find(a)] = find(b); total += w;', 'take'),
        L('            if (++used == n - 1) break;', 'take'),
        L('        }'),
        L('        return total;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int[] p;'),
        L('    int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }'),
        L('    public int minCostConnectPoints(int[][] pts) {'),
        L('        int n = pts.length, total = 0, used = 0;', 'init'),
        L('        List<int[]> e = new ArrayList<>();', 'init'),
        L('        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++)', 'init'),
        L('            e.add(new int[]{Math.abs(pts[i][0]-pts[j][0]) + Math.abs(pts[i][1]-pts[j][1]), i, j});', 'init'),
        L('        e.sort((a, b) -> a[0] - b[0]);', 'sort'),
        L('        p = new int[n]; for (int i = 0; i < n; i++) p[i] = i;', 'sort'),
        L('        for (int[] ed : e) {', 'edge'),
        L('            if (find(ed[1]) == find(ed[2])) continue;', 'skip'),
        L('            p[find(ed[1])] = find(ed[2]); total += ed[0];', 'take'),
        L('            if (++used == n - 1) break;', 'take'),
        L('        }'),
        L('        return total;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const pts = (values.points ?? '')
        .split(/[;|]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.split(/[,\s]+/).filter(Boolean).map(Number));
      if (pts.length < 2) return { error: 'Enter at least two points, e.g. "0,0; 2,2".' };
      if (pts.length > 6) return { error: 'Keep it to at most 6 points.' };
      if (!pts.every((p) => p.length === 2 && p.every((v) => Number.isFinite(v)))) return { error: 'Each point needs exactly two numbers, e.g. "3,10".' };
      const n = pts.length;
      const dist = (i: number, j: number) => Math.abs(pts[i][0] - pts[j][0]) + Math.abs(pts[i][1] - pts[j][1]);
      const nodes = circleLayout(pts.map((p) => `(${p[0]},${p[1]})`));
      const all: [number, number, number][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([dist(i, j), i, j]);
      all.sort((a, b) => a[0] - b[0]);
      const p = [...Array(n)].map((_, i) => i);
      const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
      const chosen: [number, number][] = [];
      let total = 0;
      const steps: Step[] = [];
      const view = (cand?: [number, number]): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: `g${find(nd.id)}` })),
        edges: [...chosen, ...(cand ? [cand] : [])],
        edgeMark: chosen.map(([u, v]) => key(u, v)),
        aggs: [{ label: 'total cost', value: String(total), c: 'c' }],
      });
      steps.push({ tag: 'sort', trace: ['Build all ', A(all.length), ' point pairs and sort them by distance, cheapest first.'], state: view() });
      for (const [w, a, b] of all) {
        if (chosen.length === n - 1) break;
        if (find(a) === find(b)) {
          steps.push({ tag: 'skip', trace: ['Pair ', F(`${a}–${b}`), ' (', F(w), ') would close a loop — skip.'], state: view([a, b]) });
          continue;
        }
        p[find(a)] = find(b);
        chosen.push([a, b]);
        total += w;
        steps.push({ tag: 'take', trace: ['Take ', A(`${a}–${b}`), ' (', B(w), ') — total ', C(total), '.'], state: view() });
      }
      steps.push({ tag: 'ret', trace: ['Minimum spanning tree costs ', C(total), '.'], state: view() });
      return { steps, result: String(total), resultDetail: `${n - 1} edges` };
    },
    note: 'On a complete graph there are n² pairs to sort, so Kruskal costs O(n² log n) — a little more than Prim’s O(n²). Kruskal is the better choice when the graph is sparse and the edge list is given.',
    complexity: { time: 'O(n² log n)', space: 'O(n²)' },
  },
};

/* ================= Number of Operations to Make Network Connected ================= */
const networkConnected: ProblemDef = {
  slug: 'number-of-operations-to-make-network-connected',
  title: 'Number of Operations to Make Network Connected',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-operations-to-make-network-connected/',
  technique: 'Every redundant cable can be moved — you need components − 1 of them.',
  widget: 'graph',
  widgetTitle: 'Computers & cables',
  inputs: [
    { key: 'n', label: 'Number of computers', defaultValue: '6' },
    { key: 'edges', label: 'Cables (e.g. 0-1, 0-2)', defaultValue: '0-1, 0-2, 0-3, 1-2, 1-3', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> p;'),
      L('    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }', 'find'),
      L('public:'),
      L('    int makeConnected(int n, vector<vector<int>>& cables) {'),
      L('        if (cables.size() < n - 1) return -1;', 'enough'),
      L('        p.resize(n); iota(p.begin(), p.end(), 0);', 'init'),
      L('        int comps = n;'),
      L('        for (auto& e : cables) {', 'loop'),
      L('            int a = find(e[0]), b = find(e[1]);'),
      L('            if (a == b) continue;              // spare cable', 'spare'),
      L('            p[a] = b; comps--;', 'union'),
      L('        }'),
      L('        return comps - 1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    int[] p;'),
      L('    int find(int x) {', 'find'),
      L('        return p[x] == x ? x : (p[x] = find(p[x]));', 'find'),
      L('    }'),
      L('    public int makeConnected(int n, int[][] cables) {'),
      L('        if (cables.length < n - 1) return -1;', 'enough'),
      L('        p = new int[n];'),
      L('        for (int i = 0; i < n; i++) p[i] = i;', 'init'),
      L('        int comps = n;'),
      L('        for (int[] e : cables) {', 'loop'),
      L('            int a = find(e[0]), b = find(e[1]);'),
      L('            if (a == b) continue;              // spare cable', 'spare'),
      L('            p[a] = b; comps--;', 'union'),
      L('        }'),
      L('        return comps - 1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'Number of computers', { min: 2, max: 8 });
    if (typeof n === 'string') return { error: n };
    const parsed = parseEdges(values.edges, n);
    if (typeof parsed === 'string') return { error: parsed };
    const edges = parsed.edges;
    if (parsed.n > n) return { error: `Computer ids must be between 0 and ${n - 1}.` };
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const p = [...Array(n)].map((_, i) => i);
    const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
    const steps: Step[] = [];
    let comps = n;
    let spare = 0;
    const usedEdges: string[] = [];
    const spareEdges: string[] = [];
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: `g${find(nd.id)}` })),
      edges,
      current: cur,
      edgeMark: usedEdges,
      edgeDim: spareEdges,
      aggs: [
        { label: 'components', value: String(comps), c: 'a' },
        { label: 'spare cables', value: String(spare), c: 'b' },
      ],
    });
    if (edges.length < n - 1) {
      steps.push({
        tag: 'enough',
        trace: [
          'Connecting ', F(n), ' computers needs at least ', F(n - 1), ' cables, but there are only ', F(edges.length), '. ', C('Impossible'), '.',
        ],
        state: view(null),
      });
      return { steps, result: '-1' };
    }
    steps.push({
      tag: 'enough',
      trace: [
        'There are ', A(edges.length), ' cables for ', A(n), ' computers — at least ', A(n - 1), ', so a solution exists. Now find how many groups need joining.',
      ],
      state: view(null),
    });
    steps.push({
      tag: 'init',
      trace: ['Every computer starts as its own group: ', A(n), ' components.'],
      state: view(null),
    });
    for (const [u, v] of edges) {
      const a = find(u);
      const b = find(v);
      if (a === b) {
        spare++;
        spareEdges.push(key(u, v));
        steps.push({
          tag: 'spare',
          trace: [
            'Cable ', F(`${u}–${v}`), ' links two computers already in the same group — it is ', B('redundant'), ', so it can be unplugged and reused elsewhere.',
          ],
          state: view(u),
        });
      } else {
        p[a] = b;
        comps--;
        usedEdges.push(key(u, v));
        steps.push({
          tag: 'union',
          trace: ['Cable ', A(`${u}–${v}`), ' merges two groups — components drop to ', B(comps), '.'],
          state: view(u),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const ans = comps - 1;
    steps.push({
      tag: 'ret',
      trace: [
        C(comps), ' group(s) remain, so ', C(ans), ' cable move(s) are needed — and there are ', C(spare), ' spare cable(s), which is always enough.',
      ],
      state: view(null),
    });
    return { steps, result: String(ans), resultDetail: `${comps} components, ${spare} spare cables` };
  },
  note: 'You never need to count the spares against the requirement: if there are at least n−1 cables in total, the number of redundant ones always covers components − 1. That is why the only failure case is checked up front, before any union at all.',
  complexity: { time: 'O(E · α(n))', space: 'O(n)' },
  brute: {
    label: 'DFS components',
    technique: 'If there are at least n − 1 cables, count connected components with DFS; you need one move per extra component.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int makeConnected(int n, vector<vector<int>>& cables) {'),
        L('        if (cables.size() < n - 1) return -1;', 'enough'),
        L('        vector<vector<int>> adj(n);', 'init'),
        L('        for (auto& c : cables) { adj[c[0]].push_back(c[1]); adj[c[1]].push_back(c[0]); }', 'init'),
        L('        vector<bool> seen(n); int comps = 0;', 'init'),
        L('        for (int i = 0; i < n; i++) if (!seen[i]) { comps++; dfs(adj, i, seen); }', 'merge'),
        L('        return comps - 1;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int makeConnected(int n, int[][] cables) {'),
        L('        if (cables.length < n - 1) return -1;', 'enough'),
        L('        List<List<Integer>> adj = new ArrayList<>();', 'init'),
        L('        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());', 'init'),
        L('        for (int[] c : cables) { adj.get(c[0]).add(c[1]); adj.get(c[1]).add(c[0]); }', 'init'),
        L('        boolean[] seen = new boolean[n]; int comps = 0;', 'init'),
        L('        for (int i = 0; i < n; i++) if (!seen[i]) { comps++; dfs(adj, i, seen); }', 'merge'),
        L('        return comps - 1;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'Number of computers', { min: 2, max: 8 });
      if (typeof n === 'string') return { error: n };
      const parsed = parseEdges(values.edges, n);
      if (typeof parsed === 'string') return { error: parsed };
      const edges = parsed.edges;
      if (parsed.n > n) return { error: `Computer ids must be between 0 and ${n - 1}.` };
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const comp = Array(n).fill(-1);
      let comps = 0;
      const steps: Step[] = [];
      const view = (cur: number | null): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: comp[nd.id] >= 0 ? `C${comp[nd.id]}` : undefined })),
        edges,
        current: cur,
        done: [...Array(n)].map((_, i) => i).filter((i) => comp[i] >= 0),
        aggs: [{ label: 'components', value: String(comps), c: 'a' }],
      });
      if (edges.length < n - 1) {
        steps.push({ tag: 'enough', trace: ['Only ', F(edges.length), ' cables for ', F(n), ' computers — impossible. ', C('-1'), '.'], state: view(null) });
        return { steps, result: '-1' };
      }
      const adj: number[][] = [...Array(n)].map(() => []);
      for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
      }
      steps.push({ tag: 'init', trace: ['Enough cables exist. Count the connected groups with DFS.'], state: view(null) });
      for (let i = 0; i < n; i++) {
        if (comp[i] >= 0) continue;
        const stack = [i];
        comp[i] = comps;
        while (stack.length) {
          const u = stack.pop()!;
          for (const v of adj[u]) if (comp[v] < 0) {
            comp[v] = comps;
            stack.push(v);
          }
        }
        comps++;
        steps.push({ tag: 'merge', trace: ['DFS from computer ', A(i), ' finds group ', B(`C${comps - 1}`), '.'], state: view(i) });
      }
      steps.push({ tag: 'ret', trace: [A(comps), ' group(s) need ', C(comps - 1), ' cable move(s) to join.'], state: view(null) });
      return { steps, result: String(comps - 1), resultDetail: `${comps} components` };
    },
    note: 'Same O(V + E) work as the Union-Find version. The key insight is identical: with at least n − 1 cables, redundant ones always exist, so the answer depends only on the number of components.',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
  },
};

/* ================= Accounts Merge ================= */
const accountsMerge: ProblemDef = {
  slug: 'accounts-merge',
  title: 'Accounts Merge',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/accounts-merge/',
  technique: 'Union every email in an account together; each final group is one person.',
  widget: 'graph',
  widgetTitle: 'Emails grouped by owner',
  inputs: [{ key: 'accounts', label: 'Accounts (name: email email; …)', defaultValue: 'John: a b; John: b c; Mary: d; John: e', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    unordered_map<string,string> parent;'),
      L('    string find(string x) {', 'find'),
      L('        return parent[x] == x ? x : parent[x] = find(parent[x]);', 'find'),
      L('    }'),
      L('public:'),
      L('    vector<vector<string>> accountsMerge(vector<vector<string>>& acc) {'),
      L('        unordered_map<string,string> owner;'),
      L('        for (auto& a : acc)', 'init'),
      L('            for (int i = 1; i < a.size(); i++) {', 'init'),
      L('                parent[a[i]] = a[i]; owner[a[i]] = a[0];', 'init'),
      L('            }'),
      L('        for (auto& a : acc)', 'union'),
      L('            for (int i = 2; i < a.size(); i++)', 'union'),
      L('                parent[find(a[i])] = find(a[1]);', 'union'),
      L('        unordered_map<string, set<string>> groups;'),
      L('        for (auto& [mail, _] : parent)', 'group'),
      L('            groups[find(mail)].insert(mail);', 'group'),
      L('        vector<vector<string>> res;'),
      L('        for (auto& [root, mails] : groups) {', 'build'),
      L('            vector<string> row{owner[root]};'),
      L('            row.insert(row.end(), mails.begin(), mails.end());'),
      L('            res.push_back(row);'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    Map<String,String> parent = new HashMap<>();'),
      L('    String find(String x) {', 'find'),
      L('        if (!parent.get(x).equals(x))', 'find'),
      L('            parent.put(x, find(parent.get(x)));', 'find'),
      L('        return parent.get(x);'),
      L('    }'),
      L('    public List<List<String>> accountsMerge(List<List<String>> acc) {'),
      L('        Map<String,String> owner = new HashMap<>();'),
      L('        for (List<String> a : acc)', 'init'),
      L('            for (int i = 1; i < a.size(); i++) {', 'init'),
      L('                parent.put(a.get(i), a.get(i));'),
      L('                owner.put(a.get(i), a.get(0));', 'init'),
      L('            }'),
      L('        for (List<String> a : acc)', 'union'),
      L('            for (int i = 2; i < a.size(); i++)', 'union'),
      L('                parent.put(find(a.get(i)), find(a.get(1)));', 'union'),
      L('        Map<String,TreeSet<String>> groups = new HashMap<>();'),
      L('        for (String mail : parent.keySet())', 'group'),
      L('            groups.computeIfAbsent(find(mail),'),
      L('                k -> new TreeSet<>()).add(mail);', 'group'),
      L('        List<List<String>> res = new ArrayList<>();'),
      L('        for (var e : groups.entrySet()) {', 'build'),
      L('            List<String> row = new ArrayList<>();'),
      L('            row.add(owner.get(e.getKey()));'),
      L('            row.addAll(e.getValue()); res.add(row);'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.accounts ?? '')
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (rows.length === 0) return { error: 'Enter accounts like "John: a b; Mary: c".' };
    if (rows.length > 6) return { error: 'Keep it to at most 6 accounts.' };
    const accounts: { name: string; emails: string[] }[] = [];
    for (const r of rows) {
      const m = r.match(/^([A-Za-z]+)\s*:\s*(.+)$/);
      if (!m) return { error: `Bad account "${r}" — use "Name: email email".` };
      const emails = m[2].split(/[,\s]+/).filter(Boolean);
      if (emails.length === 0) return { error: `Account "${m[1]}" has no emails.` };
      if (emails.some((e) => !/^[a-z0-9]{1,6}$/.test(e))) return { error: 'Use short lowercase email labels like a, b, c1.' };
      accounts.push({ name: m[1], emails });
    }
    const allMails = [...new Set(accounts.flatMap((a) => a.emails))];
    if (allMails.length > 8) return { error: 'Keep it to at most 8 distinct emails.' };

    const idx = new Map(allMails.map((m, i) => [m, i]));
    const parent = [...allMails].map((_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const owner = new Map<string, string>();
    for (const a of accounts) for (const e of a.emails) owner.set(e, a.name);
    const nodes = circleLayout(allMails);
    const edges: [number, number][] = [];
    for (const a of accounts) for (let i = 1; i < a.emails.length; i++) edges.push([idx.get(a.emails[0])!, idx.get(a.emails[i])!]);

    const steps: Step[] = [];
    const merged: string[] = [];
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: `g${find(nd.id)}` })),
      edges,
      current: cur,
      edgeMark: merged,
      aggs: [
        { label: 'groups', value: String(new Set(allMails.map((m) => find(idx.get(m)!))).size), c: 'a' },
        { label: 'owners', value: [...owner.entries()].map(([e, o]) => `${e}→${o}`).join(' '), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Two accounts belong to the same person if they share ', A('any'), ' email. Treat emails as nodes and union all the emails inside one account together.',
      ],
      state: view(null),
    });
    for (const a of accounts) {
      for (let i = 1; i < a.emails.length; i++) {
        const x = find(idx.get(a.emails[0])!);
        const y = find(idx.get(a.emails[i])!);
        merged.push(key(idx.get(a.emails[0])!, idx.get(a.emails[i])!));
        if (x !== y) {
          parent[x] = y;
          steps.push({
            tag: 'union',
            trace: [
              'Account "', A(a.name), '" lists ', A(a.emails[0]), ' and ', A(a.emails[i]), ' together — same person, so merge their groups.',
            ],
            state: view(idx.get(a.emails[i])!),
          });
        } else {
          steps.push({
            tag: 'union',
            trace: [A(a.emails[0]), ' and ', A(a.emails[i]), ' are already in the same group — nothing to do.'],
            state: view(idx.get(a.emails[i])!),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
    }
    steps.push({
      tag: 'find',
      trace: ['Path compression keeps every lookup near ', A('O(1)'), ' — each email now points close to its group root.'],
      state: view(null),
    });
    const groups = new Map<number, string[]>();
    for (const m of allMails) {
      const r = find(idx.get(m)!);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r)!.push(m);
    }
    for (const [root, mails] of groups) {
      mails.sort();
      steps.push({
        tag: 'group',
        trace: ['Group ', A(`g${root}`), ' holds ', B(mails.join(', ')), ' — owned by ', B(owner.get(mails[0])!), '.'],
        state: view(idx.get(mails[0])!),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const res = [...groups.values()].map((mails) => `${owner.get(mails[0])}: ${mails.join(' ')}`);
    steps.push({
      tag: 'build',
      trace: [C(res.length), ' merged account(s).'],
      state: view(null),
    });
    steps.push({ tag: 'ret', trace: [C(res.join('  |  ')), '.'], state: view(null) });
    return { steps, result: res.join(' | ') };
  },
  note: 'The name cannot be the union key — two different people can share a name, and the problem\'s examples exploit exactly that. Emails are the identity; the name is only looked up at the end from any member of the group, since every account in a group carries the same one.',
  complexity: { time: 'O(total emails · α)', space: 'O(total emails)' },
  brute: {
    label: 'DFS over an email graph',
    technique: 'Link every email in an account to that account’s first email, then DFS the resulting graph; each component is one person.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {'),
        L('        unordered_map<string, vector<string>> adj; unordered_map<string, string> owner;', 'init'),
        L('        for (auto& a : accounts)', 'union'),
        L('            for (int i = 1; i < a.size(); i++) {', 'union'),
        L('                owner[a[i]] = a[0];', 'union'),
        L('                adj[a[1]].push_back(a[i]); adj[a[i]].push_back(a[1]);', 'union'),
        L('            }'),
        L('        unordered_set<string> seen; vector<vector<string>> res;', 'group'),
        L('        for (auto& [e, _] : adj) if (!seen.count(e)) {', 'group'),
        L('            vector<string> comp; dfs(adj, e, seen, comp);', 'group'),
        L('            sort(comp.begin(), comp.end());', 'group'),
        L('            comp.insert(comp.begin(), owner[e]); res.push_back(comp);', 'build'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<String>> accountsMerge(List<List<String>> accounts) {'),
        L('        Map<String, List<String>> adj = new HashMap<>(); Map<String, String> owner = new HashMap<>();', 'init'),
        L('        for (List<String> a : accounts)', 'union'),
        L('            for (int i = 1; i < a.size(); i++) {', 'union'),
        L('                owner.put(a.get(i), a.get(0));', 'union'),
        L('                adj.computeIfAbsent(a.get(1), k -> new ArrayList<>()).add(a.get(i));', 'union'),
        L('                adj.computeIfAbsent(a.get(i), k -> new ArrayList<>()).add(a.get(1));', 'union'),
        L('            }'),
        L('        Set<String> seen = new HashSet<>(); List<List<String>> res = new ArrayList<>();', 'group'),
        L('        for (String e : adj.keySet()) if (!seen.contains(e)) {', 'group'),
        L('            List<String> comp = new ArrayList<>(); dfs(adj, e, seen, comp);', 'group'),
        L('            Collections.sort(comp);', 'group'),
        L('            comp.add(0, owner.get(e)); res.add(comp);', 'build'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const rows = (values.accounts ?? '')
        .split(/[;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (rows.length === 0) return { error: 'Enter accounts like "John: a b; Mary: c".' };
      if (rows.length > 6) return { error: 'Keep it to at most 6 accounts.' };
      const accounts: { name: string; emails: string[] }[] = [];
      for (const r of rows) {
        const m = r.match(/^([A-Za-z]+)\s*:\s*(.+)$/);
        if (!m) return { error: `Bad account "${r}" — use "Name: email email".` };
        const emails = m[2].split(/[,\s]+/).filter(Boolean);
        if (emails.length === 0) return { error: `Account "${m[1]}" has no emails.` };
        if (emails.some((e) => !/^[a-z0-9]{1,6}$/.test(e))) return { error: 'Use short lowercase email labels like a, b, c1.' };
        accounts.push({ name: m[1], emails });
      }
      const allMails = [...new Set(accounts.flatMap((a) => a.emails))];
      if (allMails.length > 8) return { error: 'Keep it to at most 8 distinct emails.' };
      const idx = new Map(allMails.map((m, i) => [m, i]));
      const owner = new Map<string, string>();
      for (const a of accounts) for (const e of a.emails) owner.set(e, a.name);
      const adj = new Map<string, string[]>(allMails.map((m) => [m, []]));
      const links: [number, number][] = [];
      for (const a of accounts)
        for (const e of a.emails.slice(1)) {
          adj.get(a.emails[0])!.push(e);
          adj.get(e)!.push(a.emails[0]);
          links.push([idx.get(a.emails[0])!, idx.get(e)!]);
        }
      const nodes = circleLayout(allMails);
      const compOf = new Map<string, number>();
      const steps: Step[] = [];
      const view = (cur: number | null): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: compOf.has(String(nd.val)) ? `P${compOf.get(String(nd.val))}` : undefined })),
        edges: links,
        current: cur,
        done: [...compOf.keys()].map((m) => idx.get(m)!),
      });
      steps.push({ tag: 'init', trace: ['Emails are nodes. Link each account’s emails to its first email.'], state: view(null) });
      steps.push({ tag: 'union', trace: ['Built ', A(links.length), ' link(s) from ', A(accounts.length), ' account(s).'], state: view(null) });
      const res: string[] = [];
      let comp = 0;
      for (const m of allMails) {
        if (compOf.has(m)) continue;
        const group: string[] = [];
        const stack = [m];
        compOf.set(m, comp);
        while (stack.length) {
          const e = stack.pop()!;
          group.push(e);
          for (const f of adj.get(e)!) if (!compOf.has(f)) {
            compOf.set(f, comp);
            stack.push(f);
          }
        }
        group.sort();
        res.push(`${owner.get(group[0])}: ${group.join(' ')}`);
        steps.push({ tag: 'group', trace: ['DFS from ', A(m), ' collects ', B(group.join(', ')), ' — one person: ', B(owner.get(group[0])!), '.'], state: view(idx.get(m)!) });
        comp++;
      }
      steps.push({ tag: 'build', trace: [C(res.length), ' merged account(s).'], state: view(null) });
      steps.push({ tag: 'ret', trace: [C(res.join('  |  ')), '.'], state: view(null) });
      return { steps, result: res.join(' | ') };
    },
    note: 'Same near-linear work as Union-Find: building the graph is O(total emails) and each DFS visits each email once. Union-Find avoids building adjacency lists, DFS avoids the parent array — pick whichever reads better.',
    complexity: { time: 'O(total emails · log)', space: 'O(total emails)' },
  },
};

/* ================= Most Stones Removed with Same Row or Column ================= */
const mostStonesRemoved: ProblemDef = {
  slug: 'most-stones-removed-with-same-row-or-column',
  title: 'Most Stones Removed with Same Row or Column',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/',
  technique: 'Each connected group collapses to one survivor, so the answer is stones − components.',
  widget: 'graph',
  widgetTitle: 'Stones linked by shared row or column',
  inputs: [{ key: 'stones', label: 'Stones (e.g. 0,0; 0,1; 1,0)', defaultValue: '0,0; 0,1; 1,0; 1,2; 2,1; 2,2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> p;'),
      L('    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }', 'find'),
      L('public:'),
      L('    int removeStones(vector<vector<int>>& s) {'),
      L('        int n = s.size();'),
      L('        p.resize(n); iota(p.begin(), p.end(), 0);', 'init'),
      L('        int comps = n;'),
      L('        for (int i = 0; i < n; i++)', 'pair'),
      L('            for (int j = i + 1; j < n; j++)', 'pair'),
      L('                if (s[i][0] == s[j][0] || s[i][1] == s[j][1]) {', 'share'),
      L('                    int a = find(i), b = find(j);'),
      L('                    if (a != b) { p[a] = b; comps--; }', 'union'),
      L('                }'),
      L('        return n - comps;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    int[] p;'),
      L('    int find(int x) {', 'find'),
      L('        return p[x] == x ? x : (p[x] = find(p[x]));', 'find'),
      L('    }'),
      L('    public int removeStones(int[][] s) {'),
      L('        int n = s.length;'),
      L('        p = new int[n];'),
      L('        for (int i = 0; i < n; i++) p[i] = i;', 'init'),
      L('        int comps = n;'),
      L('        for (int i = 0; i < n; i++)', 'pair'),
      L('            for (int j = i + 1; j < n; j++)', 'pair'),
      L('                if (s[i][0] == s[j][0] || s[i][1] == s[j][1]) {', 'share'),
      L('                    int a = find(i), b = find(j);'),
      L('                    if (a != b) { p[a] = b; comps--; }', 'union'),
      L('                }'),
      L('        return n - comps;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const stones = (values.stones ?? '')
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.split(/[,\s]+/).filter(Boolean).map(Number));
    if (stones.length < 1) return { error: 'Enter at least one stone, e.g. "0,0; 0,1".' };
    if (stones.length > 8) return { error: 'Keep it to at most 8 stones.' };
    if (!stones.every((s) => s.length === 2 && s.every((v) => Number.isInteger(v) && v >= 0))) return { error: 'Each stone needs a row and column, e.g. "1,2".' };

    const n = stones.length;
    const p = [...Array(n)].map((_, i) => i);
    const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
    const nodes = circleLayout(stones.map((s) => `${s[0]},${s[1]}`));
    const edges: [number, number][] = [];
    const steps: Step[] = [];
    let comps = n;
    const view = (cur: number | null, cand?: [number, number]): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: `g${find(nd.id)}` })),
      edges: [...edges, ...(cand && !edges.some(([a, b]) => a === cand[0] && b === cand[1]) ? [cand] : [])],
      current: cur,
      edgeMark: edges.map(([u, v]) => key(u, v)),
      aggs: [
        { label: 'stones', value: String(n), c: 'a' },
        { label: 'components', value: String(comps), c: 'b' },
        { label: 'removable', value: String(n - comps), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Two stones sharing a row or column can reach each other. Within one connected group you can always remove every stone but ', A('one'), ' — so the answer is stones minus components.',
      ],
      state: view(null),
    });
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sameRow = stones[i][0] === stones[j][0];
        const sameCol = stones[i][1] === stones[j][1];
        if (!sameRow && !sameCol) continue;
        steps.push({
          tag: 'share',
          trace: [
            'Stones ', A(`(${stones[i].join(',')})`), ' and ', A(`(${stones[j].join(',')})`), ' share a ', B(sameRow ? 'row' : 'column'), '.',
          ],
          state: view(i, [i, j]),
        });
        const a = find(i);
        const b = find(j);
        if (a !== b) {
          p[a] = b;
          comps--;
          edges.push([i, j]);
          steps.push({ tag: 'union', trace: ['Different groups — merge them. Components drop to ', B(comps), '.'], state: view(j) });
        } else {
          edges.push([i, j]);
          steps.push({ tag: 'find', trace: ['Already in the same group — the link adds nothing new.'], state: view(j) });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const ans = n - comps;
    steps.push({
      tag: 'pair',
      trace: [C(n), ' stone(s) across ', C(comps), ' group(s).'],
      state: view(null),
    });
    steps.push({
      tag: 'ret',
      trace: ['Each group leaves exactly one stone behind, so ', C(n), ' − ', C(comps), ' = ', C(ans), ' can be removed.'],
      state: view(null),
    });
    return { steps, result: String(ans), resultDetail: `${comps} components` };
  },
  note: 'The non-obvious claim is that a group can always be reduced to exactly one stone — true because you can remove in reverse order of a spanning tree\'s leaves, so each stone still has a live neighbour when its turn comes. Once you believe that, no simulation is needed: just count components.',
  complexity: { time: 'O(n² · α)', space: 'O(n)' },
  brute: {
    label: 'DFS components',
    technique: 'Treat stones sharing a row or column as connected; count components with DFS. Each component can be cleared down to one stone.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int removeStones(vector<vector<int>>& s) {'),
        L('        int n = s.size(), comps = 0;', 'init'),
        L('        vector<bool> seen(n);', 'init'),
        L('        for (int i = 0; i < n; i++) if (!seen[i]) {', 'pair'),
        L('            comps++;', 'pair'),
        L('            vector<int> st = {i}; seen[i] = true;', 'pair'),
        L('            while (!st.empty()) {', 'merge'),
        L('                int u = st.back(); st.pop_back();', 'merge'),
        L('                for (int v = 0; v < n; v++)  // O(n) neighbour scan', 'merge'),
        L('                    if (!seen[v] && (s[u][0] == s[v][0] || s[u][1] == s[v][1])) { seen[v] = true; st.push_back(v); }', 'merge'),
        L('            }'),
        L('        }'),
        L('        return n - comps;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int removeStones(int[][] s) {'),
        L('        int n = s.length, comps = 0;', 'init'),
        L('        boolean[] seen = new boolean[n];', 'init'),
        L('        for (int i = 0; i < n; i++) if (!seen[i]) {', 'pair'),
        L('            comps++;', 'pair'),
        L('            Deque<Integer> st = new ArrayDeque<>(List.of(i)); seen[i] = true;', 'pair'),
        L('            while (!st.isEmpty()) {', 'merge'),
        L('                int u = st.pop();', 'merge'),
        L('                for (int v = 0; v < n; v++)  // O(n) neighbour scan', 'merge'),
        L('                    if (!seen[v] && (s[u][0] == s[v][0] || s[u][1] == s[v][1])) { seen[v] = true; st.push(v); }', 'merge'),
        L('            }'),
        L('        }'),
        L('        return n - comps;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const stones = (values.stones ?? '')
        .split(/[;|]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.split(/[,\s]+/).filter(Boolean).map(Number));
      if (stones.length < 1) return { error: 'Enter at least one stone, e.g. "0,0; 0,1".' };
      if (stones.length > 8) return { error: 'Keep it to at most 8 stones.' };
      if (!stones.every((s) => s.length === 2 && s.every((v) => Number.isInteger(v) && v >= 0))) return { error: 'Each stone needs a row and column, e.g. "1,2".' };
      const n = stones.length;
      const nodes = circleLayout(stones.map((s) => `${s[0]},${s[1]}`));
      const linked: [number, number][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (stones[i][0] === stones[j][0] || stones[i][1] === stones[j][1]) linked.push([i, j]);
      const comp = Array(n).fill(-1);
      let comps = 0;
      const steps: Step[] = [];
      const view = (cur: number | null): TreeState => ({
        nodes: nodes.map((nd) => ({ ...nd, badge: comp[nd.id] >= 0 ? `C${comp[nd.id]}` : undefined })),
        edges: linked,
        current: cur,
        done: [...Array(n)].map((_, i) => i).filter((i) => comp[i] >= 0),
        aggs: [{ label: 'components', value: String(comps), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Stones sharing a row or column are linked (edges shown). Count components with DFS.'], state: view(null) });
      for (let i = 0; i < n; i++) {
        if (comp[i] >= 0) continue;
        const st = [i];
        comp[i] = comps;
        let size = 0;
        while (st.length) {
          const u = st.pop()!;
          size++;
          for (let v = 0; v < n; v++)
            if (comp[v] < 0 && (stones[u][0] === stones[v][0] || stones[u][1] === stones[v][1])) {
              comp[v] = comps;
              st.push(v);
            }
        }
        comps++;
        steps.push({ tag: 'merge', trace: ['DFS from stone (', A(stones[i].join(',')), ') finds a group of ', B(size), ' — ', B(size - 1), ' of them can be removed.'], state: view(i) });
      }
      steps.push({ tag: 'ret', trace: [A(n), ' stones − ', A(comps), ' group(s) = ', C(n - comps), ' removable.'], state: view(null) });
      return { steps, result: String(n - comps), resultDetail: `${comps} components` };
    },
    note: 'Scanning all stones for neighbours makes each DFS step O(n), for O(n²) total — the same bound as the pairwise Union-Find. Unioning rows with columns instead of stones with stones brings it down to near-linear.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

/* ================= Word Ladder II ================= */
const wordLadderII: ProblemDef = {
  slug: 'word-ladder-ii',
  title: 'Word Ladder II',
  category: 'Graphs',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/word-ladder-ii/',
  technique: 'BFS level by level to find the shortest length, recording every parent so all paths can be rebuilt.',
  widget: 'graph',
  widgetTitle: 'Word graph (one-letter edges)',
  inputs: [
    { key: 'begin', label: 'Begin word', defaultValue: 'hit' },
    { key: 'end', label: 'End word', defaultValue: 'cog' },
    { key: 'words', label: 'Word list', defaultValue: 'hot, dot, dog, lot, log, cog', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<string>> findLadders(string begin, string end,'),
      L('                                       vector<string>& words) {'),
      L('        unordered_set<string> dict(words.begin(), words.end());'),
      L('        unordered_map<string, vector<string>> parents;'),
      L('        unordered_set<string> level{begin};', 'init'),
      L('        bool found = false;'),
      L('        while (!level.empty() && !found) {', 'level'),
      L('            unordered_set<string> next;'),
      L('            for (auto& w : level) dict.erase(w);', 'remove'),
      L('            for (auto& w : level)', 'expand'),
      L('                for (int i = 0; i < w.size(); i++)', 'expand'),
      L('                    for (char c = \'a\'; c <= \'z\'; c++) {', 'expand'),
      L('                        string t = w; t[i] = c;'),
      L('                        if (!dict.count(t)) continue;', 'expand'),
      L('                        next.insert(t);', 'edge'),
      L('                        parents[t].push_back(w);', 'edge'),
      L('                        if (t == end) found = true;', 'found'),
      L('                    }'),
      L('            level = next;', 'level'),
      L('        }'),
      L('        vector<vector<string>> res;'),
      L('        if (found) backtrack(end, begin, parents, {}, res);', 'build'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<String>> findLadders(String begin, String end,'),
      L('                                          List<String> words) {'),
      L('        Set<String> dict = new HashSet<>(words);'),
      L('        Map<String,List<String>> parents = new HashMap<>();'),
      L('        Set<String> level = new HashSet<>(); level.add(begin);', 'init'),
      L('        boolean found = false;'),
      L('        while (!level.isEmpty() && !found) {', 'level'),
      L('            Set<String> next = new HashSet<>();'),
      L('            dict.removeAll(level);', 'remove'),
      L('            for (String w : level)', 'expand'),
      L('                for (int i = 0; i < w.length(); i++)', 'expand'),
      L('                    for (char c = \'a\'; c <= \'z\'; c++) {', 'expand'),
      L('                        String t = w.substring(0,i) + c + w.substring(i+1);'),
      L('                        if (!dict.contains(t)) continue;', 'expand'),
      L('                        next.add(t);', 'edge'),
      L('                        parents.computeIfAbsent(t,'),
      L('                            k -> new ArrayList<>()).add(w);', 'edge'),
      L('                        if (t.equals(end)) found = true;', 'found'),
      L('                    }'),
      L('            level = next;', 'level'),
      L('        }'),
      L('        List<List<String>> res = new ArrayList<>();'),
      L('        if (found) backtrack(end, begin, parents, new LinkedList<>(), res);', 'build'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const begin = (values.begin ?? '').trim().toLowerCase();
    const end = (values.end ?? '').trim().toLowerCase();
    if (!/^[a-z]{2,5}$/.test(begin) || !/^[a-z]{2,5}$/.test(end)) return { error: 'Begin and end words must be 2–5 lowercase letters.' };
    if (begin.length !== end.length) return { error: 'Begin and end words must be the same length.' };
    const words = (values.words ?? '')
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0 || words.length > 8) return { error: 'Enter 1–8 dictionary words.' };
    if (words.some((w) => w.length !== begin.length || !/^[a-z]+$/.test(w))) return { error: `Every word must be ${begin.length} lowercase letters.` };
    if (!words.includes(end)) return { error: 'The end word must appear in the word list.' };

    const all = [...new Set([begin, ...words])];
    const idx = new Map(all.map((w, i) => [w, i]));
    const nodes = circleLayout(all);
    const oneApart = (a: string, b: string) => {
      let diff = 0;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
      return diff === 1;
    };
    const graphEdges: [number, number][] = [];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (oneApart(all[i], all[j])) graphEdges.push([i, j]);

    const steps: Step[] = [];
    const dict = new Set(words);
    const parents = new Map<string, string[]>();
    let level = new Set([begin]);
    let found = false;
    const reached: string[] = [begin];
    const view = (note: { label: string; value: string; c: 'a' | 'b' | 'c' }[], mark: string[] = []): TreeState => ({
      nodes,
      edges: graphEdges,
      done: reached.map((w) => idx.get(w)!).filter((v) => v !== undefined),
      queued: [...level].map((w) => idx.get(w)!).filter((v) => v !== undefined),
      edgeMark: mark,
      aggs: note,
    });
    steps.push({
      tag: 'init',
      trace: [
        'Words are nodes; an edge joins words differing in ', A('one letter'), '. We want every ', A('shortest'), ' path from "', A(begin), '" to "', A(end), '".',
      ],
      state: view([{ label: 'current level', value: begin, c: 'a' }]),
    });
    let depth = 1;
    while (level.size && !found) {
      for (const w of level) dict.delete(w);
      steps.push({
        tag: 'remove',
        trace: [
          'Remove this level\'s words from the dictionary ', A('before'), ' expanding. That blocks any longer route back to them while still allowing several parents at the same depth.',
        ],
        state: view([{ label: `level ${depth}`, value: [...level].join(', '), c: 'a' }]),
      });
      const next = new Set<string>();
      const marks: string[] = [];
      for (const w of level) {
        for (let i = 0; i < w.length; i++) {
          for (let c = 97; c < 123; c++) {
            const t = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
            if (!dict.has(t)) continue;
            next.add(t);
            if (!parents.has(t)) parents.set(t, []);
            parents.get(t)!.push(w);
            marks.push(key(idx.get(w)!, idx.get(t)!));
            marks.push(key(idx.get(t)!, idx.get(w)!));
            if (t === end) found = true;
          }
        }
      }
      if (next.size) {
        steps.push({
          tag: 'edge',
          trace: [
            'Level ', A(depth), ' reaches ', B([...next].join(', ')), '. Each new word records ', A('all'), ' the words on this level that led to it — that is what preserves every shortest path.',
          ],
          state: view([{ label: `level ${depth + 1}`, value: [...next].join(', '), c: 'b' }], marks),
        });
      } else {
        steps.push({ tag: 'expand', trace: ['No new words reachable — the search is exhausted.'], state: view([{ label: 'dead end', value: '—', c: 'a' }]) });
      }
      reached.push(...next);
      level = next;
      depth++;
      if (found) {
        steps.push({
          tag: 'found',
          trace: ['"', C(end), '" reached at depth ', C(depth), '. Stop expanding — anything deeper would be a longer ladder.'],
          state: view([{ label: 'found at depth', value: String(depth), c: 'c' }]),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const res: string[][] = [];
    if (found) {
      const build = (w: string, path: string[]) => {
        if (w === begin) {
          res.push([begin, ...path]);
          return;
        }
        for (const p of parents.get(w) ?? []) build(p, [w, ...path]);
      };
      build(end, []);
      steps.push({
        tag: 'build',
        trace: [
          'Walk the parent links backwards from "', A(end), '". Because a word can have several parents, this enumerates ', C(res.length), ' distinct shortest ladder(s).',
        ],
        state: view([{ label: 'ladders', value: res.map((r) => r.join('→')).join('   '), c: 'c' }]),
      });
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? [C(res.length), ' shortest ladder(s): ', C(res.map((r) => r.join(' → ')).join('  |  ')), '.'] : ['No ladder connects the two words.'],
      state: view([{ label: 'result', value: res.map((r) => r.join('→')).join('   ') || 'none', c: 'c' }]),
    });
    return { steps, result: res.length ? res.map((r) => r.join(' → ')).join(' | ') : 'none' };
  },
  note: 'Deleting words per level rather than per word is the crux: deleting immediately would let the first discoverer claim a word and hide equally short alternatives, while never deleting would allow longer paths back. Collecting parents instead of full paths during BFS keeps memory proportional to the graph, not to the number of ladders.',
  complexity: { time: 'O(N · L · 26 + paths)', space: 'O(N · L)' },
  brute: {
    label: 'DFS every route',
    technique: 'Depth-first search every simple route from begin to end through one-letter changes, keeping all routes of the shortest length.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<vector<string>> res; int best = INT_MAX;'),
        L('    void dfs(string w, string& end, vector<string>& path, unordered_set<string>& left) {', 'expand'),
        L('        if (path.size() > best) return;', 'expand'),
        L('        if (w == end) {', 'found'),
        L('            if (path.size() < best) { best = path.size(); res.clear(); }', 'found'),
        L('            res.push_back(path); return;', 'found'),
        L('        }'),
        L('        for (auto nb : vector<string>(left.begin(), left.end())) if (oneApart(w, nb)) {', 'expand'),
        L('            left.erase(nb); path.push_back(nb);', 'expand'),
        L('            dfs(nb, end, path, left);', 'expand'),
        L('            path.pop_back(); left.insert(nb);', 'expand'),
        L('        }'),
        L('    }'),
        L('public:'),
        L('    vector<vector<string>> findLadders(string b, string e, vector<string>& list) { /* dfs from b */ return res; }', 'init', 'ret'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    List<List<String>> res = new ArrayList<>(); int best = Integer.MAX_VALUE;'),
        L('    void dfs(String w, String end, List<String> path, Set<String> left) {', 'expand'),
        L('        if (path.size() > best) return;', 'expand'),
        L('        if (w.equals(end)) {', 'found'),
        L('            if (path.size() < best) { best = path.size(); res.clear(); }', 'found'),
        L('            res.add(new ArrayList<>(path)); return;', 'found'),
        L('        }'),
        L('        for (String nb : new ArrayList<>(left)) if (oneApart(w, nb)) {', 'expand'),
        L('            left.remove(nb); path.add(nb);', 'expand'),
        L('            dfs(nb, end, path, left);', 'expand'),
        L('            path.remove(path.size() - 1); left.add(nb);', 'expand'),
        L('        }'),
        L('    }'),
        L('    public List<List<String>> findLadders(String b, String e, List<String> list) { /* dfs from b */ return res; }', 'init', 'ret'),
        L('}'),
      ],
    },
    run(values) {
      const begin = (values.begin ?? '').trim().toLowerCase();
      const end = (values.end ?? '').trim().toLowerCase();
      if (!/^[a-z]{2,5}$/.test(begin) || !/^[a-z]{2,5}$/.test(end)) return { error: 'Begin and end words must be 2–5 lowercase letters.' };
      if (begin.length !== end.length) return { error: 'Begin and end words must be the same length.' };
      const words = (values.words ?? '')
        .split(/[,\s]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      if (words.length === 0 || words.length > 8) return { error: 'Enter 1–8 dictionary words.' };
      if (words.some((w) => w.length !== begin.length || !/^[a-z]+$/.test(w))) return { error: `Every word must be ${begin.length} lowercase letters.` };
      if (!words.includes(end)) return { error: 'The end word must appear in the word list.' };
      const all = [...new Set([begin, ...words])];
      const idx = new Map(all.map((w, i) => [w, i]));
      const oneApart = (a: string, b: string) => [...a].filter((c, i) => c !== b[i]).length === 1;
      const graphEdges: [number, number][] = [];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (oneApart(all[i], all[j])) graphEdges.push([i, j]);
      const nodes = circleLayout(all);
      let best = Infinity;
      let res: string[][] = [];
      let routes = 0;
      const path = [begin];
      const steps: Step[] = [];
      const view = (): TreeState => ({
        nodes,
        edges: graphEdges,
        done: path.map((w) => idx.get(w)!),
        current: idx.get(end)!,
        edgeMark: path.slice(1).map((w, i) => { const a = idx.get(path[i])!; const b = idx.get(w)!; return key(Math.min(a, b), Math.max(a, b)); }),
        aggs: [
          { label: 'shortest length', value: best === Infinity ? '—' : String(best), c: 'b' },
          { label: 'routes explored', value: String(routes), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No BFS layering: try every route by depth-first search, pruning routes already longer than the best.'], state: view() });
      const left = new Set(words.filter((w) => w !== begin));
      const dfs = (w: string) => {
        if (path.length > best) return;
        if (w === end) {
          routes++;
          if (path.length < best) {
            best = path.length;
            res = [];
          }
          res.push([...path]);
          if (steps.length < MAX_STEPS) steps.push({ tag: 'found', trace: ['Reached "', C(end), '" via ', B(path.join(' → ')), ' (', A(path.length), ' words).'], state: view() });
          return;
        }
        for (const nb of [...left]) {
          if (!oneApart(w, nb)) continue;
          left.delete(nb);
          path.push(nb);
          if (steps.length < MAX_STEPS) steps.push({ tag: 'expand', trace: ['"', A(w), '" → "', A(nb), '".'], state: view() });
          dfs(nb);
          path.pop();
          left.add(nb);
        }
      };
      dfs(begin);
      steps.push({
        tag: 'ret',
        trace: res.length ? [C(res.length), ' shortest ladder(s): ', C(res.map((r) => r.join(' → ')).join('  |  ')), '.'] : ['No ladder connects the two words.'],
        state: view(),
      });
      return { steps, result: res.length ? res.map((r) => r.join(' → ')).join(' | ') : 'none' };
    },
    note: 'Without BFS layering the DFS explores many long routes before the depth bound tightens, which is exponential in the word count. BFS finds the shortest length first and records parents, so only shortest ladders are ever rebuilt.',
    complexity: { time: 'Exponential in the word count', space: 'O(N · L)' },
  },
};

/* ================= Critical Connections in a Network ================= */
const criticalConnections: ProblemDef = {
  slug: 'critical-connections-in-a-network',
  title: 'Critical Connections in a Network',
  category: 'Graphs',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/critical-connections-in-a-network/',
  technique: "Tarjan bridges: an edge is critical when the subtree below it can't reach any earlier node.",
  widget: 'graph',
  widgetTitle: 'Network (bridges highlighted)',
  inputs: [{ key: 'edges', label: 'Connections (e.g. 0-1, 1-2)', defaultValue: '0-1, 1-2, 2-0, 1-3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> disc, low; int timer = 0;'),
      L('    vector<vector<int>> g, res;'),
      L('public:'),
      L('    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& conns) {'),
      L('        g.assign(n, {}); disc.assign(n, -1); low.assign(n, -1);', 'init'),
      L('        for (auto& e : conns) {'),
      L('            g[e[0]].push_back(e[1]); g[e[1]].push_back(e[0]);'),
      L('        }'),
      L('        dfs(0, -1);', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(int u, int parent) {', 'enter'),
      L('        disc[u] = low[u] = timer++;', 'stamp'),
      L('        for (int v : g[u]) {', 'edge'),
      L('            if (v == parent) continue;', 'skipParent'),
      L('            if (disc[v] == -1) {', 'child'),
      L('                dfs(v, u);', 'child'),
      L('                low[u] = min(low[u], low[v]);', 'update'),
      L('                if (low[v] > disc[u])', 'bridge'),
      L('                    res.push_back({u, v});', 'bridge'),
      L('            } else'),
      L('                low[u] = min(low[u], disc[v]);', 'back'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    int[] disc, low; int timer = 0;'),
      L('    List<Integer>[] g; List<List<Integer>> res = new ArrayList<>();'),
      L('    public List<List<Integer>> criticalConnections(int n,'),
      L('            List<List<Integer>> conns) {'),
      L('        g = new List[n]; disc = new int[n]; low = new int[n];'),
      L('        for (int i = 0; i < n; i++) { g[i] = new ArrayList<>(); }'),
      L('        Arrays.fill(disc, -1);', 'init'),
      L('        for (List<Integer> e : conns) {'),
      L('            g.get(0); g[e.get(0)].add(e.get(1)); g[e.get(1)].add(e.get(0));'),
      L('        }'),
      L('        dfs(0, -1);', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(int u, int parent) {', 'enter'),
      L('        disc[u] = low[u] = timer++;', 'stamp'),
      L('        for (int v : g[u]) {', 'edge'),
      L('            if (v == parent) continue;', 'skipParent'),
      L('            if (disc[v] == -1) {', 'child'),
      L('                dfs(v, u);', 'child'),
      L('                low[u] = Math.min(low[u], low[v]);', 'update'),
      L('                if (low[v] > disc[u])', 'bridge'),
      L('                    res.add(List.of(u, v));', 'bridge'),
      L('            } else'),
      L('                low[u] = Math.min(low[u], disc[v]);', 'back'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges, 7);
    if (typeof parsed === 'string') return { error: parsed };
    const { n, edges } = parsed;
    const adj: number[][] = [...Array(n)].map(() => []);
    for (const [u, v] of edges) {
      adj[u].push(v);
      adj[v].push(u);
    }
    const nodes = circleLayout([...Array(n)].map((_, i) => i));
    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(-1);
    let timer = 0;
    const bridges: [number, number][] = [];
    const steps: Step[] = [];
    const view = (cur: number | null): TreeState => ({
      nodes: nodes.map((nd) => ({ ...nd, badge: disc[nd.id] === -1 ? undefined : `${disc[nd.id]}/${low[nd.id]}` })),
      edges,
      current: cur,
      done: [...Array(n)].map((_, i) => i).filter((i) => disc[i] !== -1),
      edgeMark: bridges.map(([u, v]) => key(u, v)),
      aggs: [
        { label: 'node badge', value: 'discovery time / lowest reachable time', c: 'a' },
        { label: 'bridges', value: bridges.map(([u, v]) => `${u}-${v}`).join(' ') || '—', c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'A ', A('bridge'), ' is an edge whose removal disconnects the network. Give each node a discovery time, and track the ', B('earliest'), ' node its subtree can climb back to.',
      ],
      state: view(null),
    });
    const dfs = (u: number, parent: number) => {
      if (steps.length > MAX_STEPS) return;
      disc[u] = low[u] = timer++;
      steps.push({
        tag: 'stamp',
        trace: ['Visit node ', A(u), ' — discovery time ', A(disc[u]), '. Its low value starts equal to that.'],
        state: view(u),
      });
      for (const v of adj[u]) {
        if (v === parent) {
          steps.push({ tag: 'skipParent', trace: ['Skip the edge back to parent ', F(v), ' — that is how we arrived.'], state: view(u) });
          continue;
        }
        if (disc[v] === -1) {
          steps.push({ tag: 'child', trace: ['Node ', A(v), ' is unvisited — descend into it.'], state: view(u) });
          dfs(v, u);
          low[u] = Math.min(low[u], low[v]);
          steps.push({
            tag: 'update',
            trace: ['Back at ', A(u), ': its subtree through ', A(v), ' reaches as far back as ', B(low[v]), ', so low[', A(u), '] = ', B(low[u]), '.'],
            state: view(u),
          });
          if (low[v] > disc[u]) {
            bridges.push([u, v]);
            steps.push({
              tag: 'bridge',
              trace: [
                'low[', A(v), '] = ', B(low[v]), ' is greater than disc[', A(u), '] = ', B(disc[u]), ' — nothing under ', A(v),
                ' can reach ', A(u), ' or earlier except through this edge. So ', C(`${u}–${v}`), ' is ', C('critical'), '.',
              ],
              state: view(u),
            });
          } else {
            steps.push({
              tag: 'bridge',
              trace: ['low[', B(v), '] = ', B(low[v]), ' ≤ disc[', B(u), '] = ', B(disc[u]), ' — there is a way around, so this edge is ', F('not'), ' critical.'],
              state: view(u),
            });
          }
        } else {
          low[u] = Math.min(low[u], disc[v]);
          steps.push({
            tag: 'back',
            trace: ['Edge ', A(`${u}–${v}`), ' points back to already-visited node ', A(v), ' (time ', A(disc[v]), ') — a cycle. low[', A(u), '] drops to ', B(low[u]), '.'],
            state: view(u),
          });
        }
        if (steps.length > MAX_STEPS) return;
      }
    };
    steps.push({ tag: 'start', trace: ['Start the depth-first search at node ', A(0), '.'], state: view(0) });
    for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i, -1);
    steps.push({
      tag: 'ret',
      trace: bridges.length ? ['Critical connections: ', C(bridges.map(([u, v]) => `[${u},${v}]`).join(', ')), '.'] : ['Every edge lies on a cycle — there are ', C('no'), ' critical connections.'],
      state: view(null),
    });
    return { steps, result: bridges.length ? bridges.map(([u, v]) => `[${u},${v}]`).join(', ') : 'none' };
  },
  note: 'The strict inequality low[v] > disc[u] is what makes this bridges rather than articulation points — equality means v can reach u itself, so a cycle covers the edge. Skipping only the single parent edge is correct for simple graphs; with parallel edges you must skip by edge id, or every duplicated edge is wrongly called a bridge.',
  complexity: { time: 'O(V + E)', space: 'O(V + E)' },
  brute: {
    label: 'Remove each edge and test',
    technique: 'Delete one connection at a time and check with a DFS whether the network is still connected; if not, that connection is critical.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& conns) {'),
        L('        vector<vector<int>> res;', 'start'),
        L('        for (int skip = 0; skip < conns.size(); skip++)', 'visit'),
        L('            if (!connectedWithout(n, conns, skip))  // fresh DFS each time', 'visit', 'bridge'),
        L('                res.push_back(conns[skip]);', 'bridge'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> conns) {'),
        L('        List<List<Integer>> res = new ArrayList<>();', 'start'),
        L('        for (int skip = 0; skip < conns.size(); skip++)', 'visit'),
        L('            if (!connectedWithout(n, conns, skip))  // fresh DFS each time', 'visit', 'bridge'),
        L('                res.add(conns.get(skip));', 'bridge'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges, 7);
      if (typeof parsed === 'string') return { error: parsed };
      const { n, edges } = parsed;
      const nodes = circleLayout([...Array(n)].map((_, i) => i));
      const bridges: [number, number][] = [];
      const steps: Step[] = [];
      const view = (skip: number, reached: number[] = []): TreeState => ({
        nodes,
        edges: edges.filter((_, i) => i !== skip),
        done: reached,
        edgeMark: bridges.map(([u, v]) => key(u, v)),
        aggs: [{ label: 'removed edge', value: skip >= 0 ? `${edges[skip][0]}-${edges[skip][1]}` : '—', c: 'a' }],
      });
      steps.push({ tag: 'start', trace: ['No low-link times: remove each connection in turn and re-check connectivity from scratch.'], state: view(-1) });
      edges.forEach(([a, b], skip) => {
        const adj: number[][] = [...Array(n)].map(() => []);
        edges.forEach(([u, v], i) => {
          if (i === skip) return;
          adj[u].push(v);
          adj[v].push(u);
        });
        const seen = new Set([0]);
        const st = [0];
        while (st.length) {
          const u = st.pop()!;
          for (const v of adj[u]) if (!seen.has(v)) {
            seen.add(v);
            st.push(v);
          }
        }
        const critical = seen.size < n;
        if (critical) bridges.push([a, b]);
        steps.push({
          tag: critical ? 'bridge' : 'visit',
          trace: ['Without ', A(`${a}–${b}`), ', DFS reaches ', A(seen.size), ' of ', A(n), ' nodes — ', critical ? B('critical') : F('not critical'), '.'],
          state: view(skip, [...seen]),
        });
      });
      steps.push({ tag: 'ret', trace: bridges.length ? ['Critical connections: ', C(bridges.map(([u, v]) => `[${u},${v}]`).join(', ')), '.'] : ['No critical connections.'], state: view(-1) });
      return { steps, result: bridges.length ? bridges.map(([u, v]) => `[${u},${v}]`).join(', ') : 'none' };
    },
    note: 'One full DFS per edge makes this O(E · (V + E)). Tarjan’s algorithm finds every bridge in a single DFS by comparing each child’s lowest reachable discovery time with its parent’s.',
    complexity: { time: 'O(E · (V + E))', space: 'O(V + E)' },
  },
};

export const graphs4: ProblemDef[] = [
  numberOfProvinces,
  isBipartite,
  eventualSafeStates,
  numberOfWays,
  findTheCity,
  minCostConnect,
  networkConnected,
  accountsMerge,
  mostStonesRemoved,
  wordLadderII,
  criticalConnections,
];
