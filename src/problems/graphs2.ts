// Graphs, part 2: node-link graphs (graph widget).
import type { ListState, ProblemDef, Step, TreeState } from '../lib/types';
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

/** Parse "1-2, 2-3" edge lists over integer nodes. */
function parseEdges(s: string, maxNodes = 8): { nodes: number[]; edges: [number, number][] } | string {
  const parts = (s ?? '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return 'Enter edges like "1-2, 2-3".';
  const edges: [number, number][] = [];
  const nodeSet = new Set<number>();
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*[-→>]\s*(\d+)(?:\s*[:@]\s*(-?\d+))?$/);
    if (!m) return `Bad edge "${p}" — use "u-v".`;
    const u = Number(m[1]);
    const v = Number(m[2]);
    nodeSet.add(u);
    nodeSet.add(v);
    edges.push([u, v]);
  }
  if (nodeSet.size > maxNodes) return `Keep it to at most ${maxNodes} nodes.`;
  return { nodes: [...nodeSet].sort((a, b) => a - b), edges };
}

/** Parse weighted edges "u-v:w". */
function parseWeightedEdges(s: string, maxNodes = 7): { nodes: number[]; edges: [number, number, number][] } | string {
  const parts = (s ?? '').split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return 'Enter edges like "1-2:5, 2-3:1".';
  const edges: [number, number, number][] = [];
  const nodeSet = new Set<number>();
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*[-→>]\s*(\d+)\s*[:@]\s*(-?\d+)$/);
    if (!m) return `Bad edge "${p}" — use "u-v:w".`;
    const u = Number(m[1]);
    const v = Number(m[2]);
    const w = Number(m[3]);
    if (w < 0) return 'Weights must be non-negative.';
    nodeSet.add(u);
    nodeSet.add(v);
    edges.push([u, v, w]);
  }
  if (nodeSet.size > maxNodes) return `Keep it to at most ${maxNodes} nodes.`;
  return { nodes: [...nodeSet].sort((a, b) => a - b), edges };
}

/* ================= 96. Clone Graph ================= */
const cloneGraph: ProblemDef = {
  slug: 'clone-graph',
  title: 'Clone Graph',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/clone-graph/',
  technique: 'DFS with a visited-map: clone a node once, and the map breaks every cycle.',
  widget: 'graph',
  widgetTitle: 'Graph (teal = cloned)',
  inputs: [{ key: 'edges', label: 'Undirected edges', defaultValue: '1-2, 1-4, 2-3, 3-4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    unordered_map<Node*, Node*> cloned;', 'init'),
      L('public:'),
      L('    Node* cloneGraph(Node* node) {', 'enter'),
      L('        if (node == nullptr) return nullptr;', 'enter'),
      L('        if (cloned.count(node))', 'cached'),
      L('            return cloned[node];', 'cached'),
      L('        Node* copy = new Node(node->val);', 'clone'),
      L('        cloned[node] = copy;', 'clone'),
      L('        for (Node* nb : node->neighbors)', 'rec'),
      L('            copy->neighbors.push_back(cloneGraph(nb));', 'rec'),
      L('        return copy;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private Map<Node, Node> cloned = new HashMap<>();', 'init'),
      L('    public Node cloneGraph(Node node) {', 'enter'),
      L('        if (node == null) return null;', 'enter'),
      L('        if (cloned.containsKey(node))', 'cached'),
      L('            return cloned.get(node);', 'cached'),
      L('        Node copy = new Node(node.val);', 'clone'),
      L('        cloned.put(node, copy);', 'clone'),
      L('        for (Node nb : node.neighbors)', 'rec'),
      L('            copy.neighbors.add(cloneGraph(nb));', 'rec'),
      L('        return copy;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { nodes, edges } = parsed;
    const idOf = new Map(nodes.map((v, i) => [v, i]));
    const adj = new Map<number, number[]>(nodes.map((v) => [v, []]));
    for (const [u, v] of edges) {
      adj.get(u)!.push(v);
      adj.get(v)!.push(u);
    }
    const layout = circleLayout(nodes);
    const steps: Step[] = [];
    const clonedSet = new Set<number>();
    const stack: string[] = [];
    const snap = (current: number | null): TreeState => ({
      nodes: layout,
      edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
      current,
      done: [...clonedSet].map((v) => idOf.get(v)!),
      stack: stack.map((text) => ({ text })),
      stackTitle: 'DFS stack',
    });
    steps.push({ tag: 'init', trace: ['The graph may contain cycles — a naive copy would recurse forever. The ', B('cloned map'), ' is both cache and cycle-breaker.'], state: snap(null) });
    const dfs = (v: number) => {
      if (steps.length > MAX_STEPS) return;
      if (clonedSet.has(v)) {
        steps.push({ tag: 'cached', trace: ['Node ', B(v), ' is already cloned — return the existing copy (this is how cycles close safely).'], state: snap(idOf.get(v)!) });
        return;
      }
      clonedSet.add(v);
      stack.push(`clone(${v})`);
      steps.push({ tag: 'clone', trace: ['Create copy of node ', B(v), ' and register it in the map ', A('before'), ' visiting neighbors.'], state: snap(idOf.get(v)!) });
      for (const nb of adj.get(v)!) {
        steps.push({ tag: 'rec', trace: ['Wire ', A(v), ' → clone of neighbor ', A(nb), '.'], state: snap(idOf.get(v)!) });
        dfs(nb);
      }
      stack.pop();
    };
    dfs(nodes[0]);
    steps.push({ tag: 'ret', trace: ['All ', C(clonedSet.size), ' nodes cloned with identical wiring — deep copy complete.'], state: snap(null) });
    return { steps, result: `${clonedSet.size} nodes cloned`, resultDetail: 'structure preserved, no shared references' };
  },
  note: 'Registering the copy in the map *before* recursing into neighbors is the critical ordering: when a cycle loops back, the half-built copy is already findable, so the recursion terminates and the cycle is faithfully reproduced.',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  brute: {
    label: 'BFS with a queue',
    technique: 'Clone breadth-first: create a copy when a node is first discovered, and wire edges as each node is dequeued.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    Node* cloneGraph(Node* node) {'),
        L('        if (!node) return nullptr;', 'init'),
        L('        unordered_map<Node*, Node*> copy{{node, new Node(node->val)}};', 'init'),
        L('        queue<Node*> q; q.push(node);', 'init'),
        L('        while (!q.empty()) {', 'rec'),
        L('            Node* u = q.front(); q.pop();', 'rec'),
        L('            for (Node* v : u->neighbors) {', 'rec'),
        L('                if (!copy.count(v)) { copy[v] = new Node(v->val); q.push(v); }', 'clone'),
        L('                copy[u]->neighbors.push_back(copy[v]);', 'cached'),
        L('            }'),
        L('        }'),
        L('        return copy[node];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public Node cloneGraph(Node node) {'),
        L('        if (node == null) return null;', 'init'),
        L('        Map<Node, Node> copy = new HashMap<>();', 'init'),
        L('        copy.put(node, new Node(node.val));', 'init'),
        L('        Deque<Node> q = new ArrayDeque<>(List.of(node));', 'init'),
        L('        while (!q.isEmpty()) {', 'rec'),
        L('            Node u = q.poll();', 'rec'),
        L('            for (Node v : u.neighbors) {', 'rec'),
        L('                if (!copy.containsKey(v)) { copy.put(v, new Node(v.val)); q.add(v); }', 'clone'),
        L('                copy.get(u).neighbors.add(copy.get(v));', 'cached'),
        L('            }'),
        L('        }'),
        L('        return copy.get(node);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { nodes, edges } = parsed;
      const idOf = new Map(nodes.map((v, i) => [v, i]));
      const adj = new Map<number, number[]>(nodes.map((v) => [v, []]));
      for (const [u, v] of edges) {
        adj.get(u)!.push(v);
        adj.get(v)!.push(u);
      }
      const layout = circleLayout(nodes);
      const cloned = new Set<number>();
      const queue: number[] = [];
      const steps: Step[] = [];
      const snap = (current: number | null): TreeState => ({
        nodes: layout,
        edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
        current,
        done: [...cloned].map((v) => idOf.get(v)!),
        queued: queue.map((v) => idOf.get(v)!),
        stack: queue.map((v) => ({ text: `node ${v}` })),
        stackTitle: 'BFS queue',
      });
      cloned.add(nodes[0]);
      queue.push(nodes[0]);
      steps.push({ tag: 'init', trace: ['Copy the start node ', B(nodes[0]), ' and put the original in a queue.'], state: snap(null) });
      while (queue.length && steps.length < MAX_STEPS) {
        const u = queue.shift()!;
        steps.push({ tag: 'rec', trace: ['Dequeue ', A(u), ' and wire its copy to copies of its neighbours.'], state: snap(idOf.get(u)!) });
        for (const v of adj.get(u)!) {
          if (!cloned.has(v)) {
            cloned.add(v);
            queue.push(v);
            steps.push({ tag: 'clone', trace: ['Neighbour ', B(v), ' is new — copy it and enqueue.'], state: snap(idOf.get(u)!) });
          } else {
            steps.push({ tag: 'cached', trace: ['Neighbour ', A(v), ' already has a copy — just link to it.'], state: snap(idOf.get(u)!) });
          }
        }
      }
      steps.push({ tag: 'ret', trace: ['All ', C(cloned.size), ' nodes copied level by level.'], state: snap(null) });
      return { steps, result: `${cloned.size} nodes cloned`, resultDetail: 'structure preserved, no shared references' };
    },
    note: 'Same O(V + E) as the recursive DFS, with the same map acting as the visited set. The explicit queue avoids deep recursion on long chains.',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
  },
};

/* ================= 101/102. Course Schedule I & II ================= */
function makeCourseSchedule(isII: boolean): ProblemDef {
  return {
    slug: isII ? 'course-schedule-ii' : 'course-schedule',
    title: isII ? 'Course Schedule II' : 'Course Schedule',
    category: 'Graphs',
    difficulty: 'Medium',
    leetcode: `https://leetcode.com/problems/course-schedule${isII ? '-ii' : ''}/`,
    technique: 'Kahn\'s topological sort: repeatedly take a course with no remaining prerequisites.',
    widget: 'graph',
    widgetTitle: 'Prerequisite graph (badge = indegree)',
    inputs: [
      { key: 'n', label: 'Courses n', defaultValue: '4' },
      { key: 'prereqs', label: 'Prereqs (a-b = b before a)', defaultValue: '1-0, 2-0, 3-1, 3-2', wide: true },
    ],
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L(isII ? '    vector<int> findOrder(int n, vector<vector<int>>& prereqs) {' : '    bool canFinish(int n, vector<vector<int>>& prereqs) {'),
        L('        vector<vector<int>> adj(n);', 'init'),
        L('        vector<int> indeg(n, 0);', 'init'),
        L('        for (auto& p : prereqs) {', 'init'),
        L('            adj[p[1]].push_back(p[0]);', 'init'),
        L('            indeg[p[0]]++;', 'init'),
        L('        }'),
        L('        queue<int> q;', 'seed'),
        L('        for (int i = 0; i < n; i++)', 'seed'),
        L('            if (indeg[i] == 0) q.push(i);', 'seed'),
        L('        vector<int> order;', 'seed'),
        L('        while (!q.empty()) {', 'loop'),
        L('            int u = q.front(); q.pop();', 'take'),
        L('            order.push_back(u);', 'take'),
        L('            for (int v : adj[u])', 'relax'),
        L('                if (--indeg[v] == 0)', 'relax'),
        L('                    q.push(v);', 'unlock'),
        L('        }'),
        L(isII ? '        return order.size() == n ? order : vector<int>{};' : '        return order.size() == n;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L(isII ? '    public int[] findOrder(int n, int[][] prereqs) {' : '    public boolean canFinish(int n, int[][] prereqs) {'),
        L('        List<List<Integer>> adj = new ArrayList<>();', 'init'),
        L('        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());', 'init'),
        L('        int[] indeg = new int[n];', 'init'),
        L('        for (int[] p : prereqs) {', 'init'),
        L('            adj.get(p[1]).add(p[0]);', 'init'),
        L('            indeg[p[0]]++;', 'init'),
        L('        }'),
        L('        Queue<Integer> q = new LinkedList<>();', 'seed'),
        L('        for (int i = 0; i < n; i++)', 'seed'),
        L('            if (indeg[i] == 0) q.add(i);', 'seed'),
        L('        List<Integer> order = new ArrayList<>();', 'seed'),
        L('        while (!q.isEmpty()) {', 'loop'),
        L('            int u = q.poll();', 'take'),
        L('            order.add(u);', 'take'),
        L('            for (int v : adj.get(u))', 'relax'),
        L('                if (--indeg[v] == 0)', 'relax'),
        L('                    q.add(v);', 'unlock'),
        L('        }'),
        L(isII
          ? '        return order.size() == n ? order.stream().mapToInt(i -> i).toArray() : new int[]{};'
          : '        return order.size() == n;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 2, max: 8 });
      if (typeof n === 'string') return { error: n };
      const parsed = parseEdges(values.prereqs, n);
      if (typeof parsed === 'string') return { error: parsed };
      const { edges } = parsed;
      if (edges.some(([u, v]) => u >= n || v >= n)) return { error: `Courses must be 0…${n - 1}.` };

      const labels = [...Array(n)].map((_, i) => i);
      const layout = circleLayout(labels);
      const adj = new Map<number, number[]>(labels.map((v) => [v, []]));
      const indeg = Array(n).fill(0);
      for (const [a, b] of edges) {
        adj.get(b)!.push(a); // b before a: edge b -> a
        indeg[a]++;
      }
      const steps: Step[] = [];
      const order: number[] = [];
      let queue: number[] = [];
      const doneSet: number[] = [];
      const snap = (current: number | null): TreeState => ({
        nodes: layout.map((nd, i) => ({ ...nd, badge: `in:${indeg[i]}` })),
        edges: edges.map(([a, b]) => [b, a] as [number, number]),
        directed: true,
        current,
        done: [...doneSet],
        queued: [...queue],
        stack: queue.map((v) => ({ text: `course ${v}` })),
        stackTitle: 'Ready queue',
        aggs: [{ label: 'order', value: `[${order.join(' → ')}]`, c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Draw an edge b → a for every prerequisite pair — indegree counts how many prerequisites a course still has.'], state: snap(null) });
      queue = labels.filter((v) => indeg[v] === 0);
      steps.push({ tag: 'seed', trace: ['Courses with ', B('indegree 0'), ' have no prerequisites — they can start immediately: ', B(`{${queue.join(', ')}}`), '.'], state: snap(null) });
      while (queue.length > 0 && steps.length < MAX_STEPS) {
        const u = queue.shift()!;
        order.push(u);
        doneSet.push(u);
        steps.push({ tag: 'take', trace: ['Take course ', B(u), ' — position ', A(order.length), ' in the order.'], state: snap(u) });
        for (const v of adj.get(u)!) {
          indeg[v]--;
          if (indeg[v] === 0) {
            queue.push(v);
            steps.push({ tag: 'unlock', trace: ['That was ', A(v), '\'s last prerequisite — course ', B(v), ' unlocks.'], state: snap(u) });
          } else {
            steps.push({ tag: 'relax', trace: ['Course ', A(v), ' loses one prerequisite — ', A(indeg[v]), ' still remain.'], state: snap(u) });
          }
        }
      }
      const ok = order.length === n;
      steps.push({
        tag: 'ret',
        trace: ok
          ? ['All ', C(n), ' courses ordered', isII ? [': '].join('') : ' — schedule is possible: ', isII ? C(`[${order.join(' → ')}]`) : C('true'), '.']
          : [F(String(n - order.length)), ' course(s) never unlocked — they sit on a ', F('cycle'), '. Return ', C(isII ? '[]' : 'false'), '.'],
        state: snap(null),
      });
      return {
        steps,
        result: isII ? (ok ? `[${order.join(', ')}]` : '[]') : String(ok),
        resultDetail: ok ? 'valid topological order' : 'cycle detected',
      };
    },
    note: 'A course sits on a cycle iff its indegree never reaches zero — so Kahn\'s algorithm detects impossibility for free: just compare how many courses were emitted against n. The emitted sequence is itself the answer for Course Schedule II.',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    brute: {
      label: 'DFS with three colours',
      technique: 'DFS each course, colouring it grey while on the stack and black when finished; reaching a grey course again means a cycle. Finished courses, reversed, form the order.',
      code: {
        cpp: [
          L('class Solution {'),
          L('    vector<vector<int>> adj; vector<int> color, post;  // 0 white, 1 grey, 2 black'),
          L('    bool dfs(int u) {', 'take'),
          L('        color[u] = 1;', 'take'),
          L('        for (int v : adj[u]) {', 'relax'),
          L('            if (color[v] == 1) return false;  // back edge: cycle', 'cycle'),
          L('            if (color[v] == 0 && !dfs(v)) return false;', 'relax'),
          L('        }'),
          L('        color[u] = 2; post.push_back(u);', 'unlock'),
          L('        return true;'),
          L('    }'),
          L('public:'),
          L(isII ? '    vector<int> findOrder(int n, vector<vector<int>>& prereqs) {' : '    bool canFinish(int n, vector<vector<int>>& prereqs) {'),
          L('        adj.assign(n, {}); color.assign(n, 0);', 'init'),
          L('        for (auto& p : prereqs) adj[p[1]].push_back(p[0]);', 'init'),
          L('        for (int i = 0; i < n; i++)', 'seed'),
          L(isII ? '            if (color[i] == 0 && !dfs(i)) return {};' : '            if (color[i] == 0 && !dfs(i)) return false;', 'seed'),
          L(isII ? '        return vector<int>(post.rbegin(), post.rend());' : '        return true;', 'ret'),
          L('    }'),
          L('};'),
        ],
        java: [
          L('class Solution {'),
          L('    List<List<Integer>> adj = new ArrayList<>(); int[] color; List<Integer> post = new ArrayList<>();'),
          L('    boolean dfs(int u) {', 'take'),
          L('        color[u] = 1;', 'take'),
          L('        for (int v : adj.get(u)) {', 'relax'),
          L('            if (color[v] == 1) return false;  // back edge: cycle', 'cycle'),
          L('            if (color[v] == 0 && !dfs(v)) return false;', 'relax'),
          L('        }'),
          L('        color[u] = 2; post.add(u);', 'unlock'),
          L('        return true;'),
          L('    }'),
          L(isII ? '    public int[] findOrder(int n, int[][] prereqs) {' : '    public boolean canFinish(int n, int[][] prereqs) {'),
          L('        color = new int[n];', 'init'),
          L('        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());', 'init'),
          L('        for (int[] p : prereqs) adj.get(p[1]).add(p[0]);', 'init'),
          L('        for (int i = 0; i < n; i++)', 'seed'),
          L(isII ? '            if (color[i] == 0 && !dfs(i)) return new int[]{};' : '            if (color[i] == 0 && !dfs(i)) return false;', 'seed'),
          L(isII ? '        Collections.reverse(post); return post.stream().mapToInt(x -> x).toArray();' : '        return true;', 'ret'),
          L('    }'),
          L('}'),
        ],
      },
      run(values) {
        const n = parseInt1(values.n, 'n', { min: 2, max: 8 });
        if (typeof n === 'string') return { error: n };
        const parsed = parseEdges(values.prereqs, n);
        if (typeof parsed === 'string') return { error: parsed };
        const { edges } = parsed;
        if (edges.some(([u, v]) => u >= n || v >= n)) return { error: `Courses must be 0…${n - 1}.` };
        const labels = [...Array(n)].map((_, i) => i);
        const layout = circleLayout(labels);
        const adj = new Map<number, number[]>(labels.map((v) => [v, []]));
        for (const [a, b] of edges) adj.get(b)!.push(a);
        const color = Array(n).fill(0);
        const post: number[] = [];
        const stack: number[] = [];
        const steps: Step[] = [];
        const snap = (current: number | null): TreeState => ({
          nodes: layout.map((nd, i) => ({ ...nd, badge: ['white', 'grey', 'black'][color[i]] })),
          edges: edges.map(([a, b]) => [b, a] as [number, number]),
          directed: true,
          current,
          done: labels.filter((i) => color[i] === 2),
          queued: labels.filter((i) => color[i] === 1),
          stack: stack.map((v) => ({ text: `course ${v}` })),
          stackTitle: 'DFS path (grey)',
          aggs: [{ label: 'finished (post-order)', value: `[${post.join(', ')}]`, c: 'c' }],
        });
        steps.push({ tag: 'init', trace: ['Grey = on the current DFS path, black = fully explored. An edge into a grey course means a cycle.'], state: snap(null) });
        let cyclic = false;
        const dfs = (u: number): boolean => {
          color[u] = 1;
          stack.push(u);
          steps.push({ tag: 'take', trace: ['Enter course ', A(u), ' — colour it grey.'], state: snap(u) });
          for (const v of adj.get(u)!) {
            if (color[v] === 1) {
              steps.push({ tag: 'cycle', trace: ['Edge ', A(u), ' → ', F(v), ' points back into the current path — a ', F('cycle'), '.'], state: snap(v) });
              return false;
            }
            if (color[v] === 0) {
              steps.push({ tag: 'relax', trace: ['Course ', A(v), ' depends on ', A(u), ' — explore it.'], state: snap(u) });
              if (!dfs(v)) return false;
            }
          }
          color[u] = 2;
          stack.pop();
          post.push(u);
          steps.push({ tag: 'unlock', trace: ['Everything after ', B(u), ' is done — colour it black.'], state: snap(u) });
          return true;
        };
        for (let i = 0; i < n && !cyclic; i++) {
          if (color[i] !== 0) continue;
          steps.push({ tag: 'seed', trace: ['Start a DFS from course ', A(i), '.'], state: snap(i) });
          if (!dfs(i)) cyclic = true;
        }
        const order = [...post].reverse();
        steps.push({
          tag: 'ret',
          trace: cyclic ? ['A cycle makes the schedule impossible — ', C(isII ? '[]' : 'false'), '.'] : isII ? ['Reverse the finishing order: ', C(`[${order.join(' → ')}]`), '.'] : ['No cycle — ', C('true'), '.'],
          state: snap(null),
        });
        return {
          steps,
          result: isII ? (cyclic ? '[]' : `[${order.join(', ')}]`) : String(!cyclic),
          resultDetail: cyclic ? 'cycle detected' : 'valid topological order',
        };
      },
      note: 'Also O(V + E): cycle detection comes from finding a grey node again, and reversing the finishing order gives a valid order. It can pick a different (equally valid) order than Kahn’s algorithm, and recursion depth grows with the longest prerequisite chain.',
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    },
  };
}
const courseSchedule = makeCourseSchedule(false);
const courseScheduleII = makeCourseSchedule(true);

/* ================= 103. Redundant Connection ================= */
const redundantConnection: ProblemDef = {
  slug: 'redundant-connection',
  title: 'Redundant Connection',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/redundant-connection/',
  technique: 'Union-Find: the first edge whose endpoints are already connected closes the cycle.',
  widget: 'graph',
  widgetTitle: 'Edges added one by one',
  inputs: [{ key: 'edges', label: 'Edges (in order)', defaultValue: '1-2, 1-3, 2-3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> parent;', 'init'),
      L('public:'),
      L('    vector<int> findRedundantConnection(vector<vector<int>>& edges) {'),
      L('        parent.resize(edges.size() + 1);', 'init'),
      L('        iota(parent.begin(), parent.end(), 0);', 'init'),
      L('        for (auto& e : edges) {', 'loop'),
      L('            int ru = find(e[0]), rv = find(e[1]);', 'find'),
      L('            if (ru == rv)', 'cycle'),
      L('                return e;', 'cycle'),
      L('            parent[ru] = rv;', 'union'),
      L('        }'),
      L('        return {};'),
      L('    }'),
      L('    int find(int x) {', 'findfn'),
      L('        while (parent[x] != x) {'),
      L('            parent[x] = parent[parent[x]];'),
      L('            x = parent[x];'),
      L('        }'),
      L('        return x;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int[] parent;', 'init'),
      L('    public int[] findRedundantConnection(int[][] edges) {'),
      L('        parent = new int[edges.length + 1];', 'init'),
      L('        for (int i = 0; i < parent.length; i++) parent[i] = i;', 'init'),
      L('        for (int[] e : edges) {', 'loop'),
      L('            int ru = find(e[0]), rv = find(e[1]);', 'find'),
      L('            if (ru == rv)', 'cycle'),
      L('                return e;', 'cycle'),
      L('            parent[ru] = rv;', 'union'),
      L('        }'),
      L('        return new int[]{};'),
      L('    }'),
      L('    private int find(int x) {', 'findfn'),
      L('        while (parent[x] != x) {'),
      L('            parent[x] = parent[parent[x]];'),
      L('            x = parent[x];'),
      L('        }'),
      L('        return x;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { nodes, edges } = parsed;
    const idOf = new Map(nodes.map((v, i) => [v, i]));
    const layout = circleLayout(nodes);
    const parent = new Map<number, number>(nodes.map((v) => [v, v]));
    const find = (x: number): number => {
      while (parent.get(x) !== x) x = parent.get(x)!;
      return x;
    };
    const steps: Step[] = [];
    const added: [number, number][] = [];
    const fmtParent = () => nodes.map((v) => `${v}→${find(v)}`).join(' ');
    const snap = (mark?: string[], dim?: string[]): TreeState => ({
      nodes: layout,
      edges: added.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
      edgeMark: mark,
      edgeDim: dim,
      aggs: [{ label: 'component roots', value: fmtParent(), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['n nodes + n edges = exactly one edge too many for a tree. Add edges in order; the first one joining an already-connected pair is the culprit.'], state: snap() });
    let answer: [number, number] | null = null;
    for (const [u, v] of edges) {
      const ru = find(u);
      const rv = find(v);
      steps.push({
        tag: 'find',
        tag2: 'findfn',
        trace: ['Edge (', A(u), ',', A(v), '): find their roots — ', A(ru), ' and ', A(rv), '.'],
        state: snap(),
      });
      if (ru === rv) {
        answer = [u, v];
        added.push([u, v]);
        steps.push({
          tag: 'cycle',
          trace: ['Same root — ', F(u), ' and ', F(v), ' were already connected, so this edge closes a cycle. It is the ', C('redundant edge'), '.'],
          state: snap([`${idOf.get(u)}-${idOf.get(v)}`, `${idOf.get(v)}-${idOf.get(u)}`]),
        });
        break;
      }
      parent.set(ru, rv);
      added.push([u, v]);
      steps.push({ tag: 'union', trace: ['Different roots — merge the components (root ', A(ru), ' now points to ', A(rv), ').'], state: snap() });
    }
    return {
      steps,
      result: answer ? `[${answer[0]}, ${answer[1]}]` : 'no cycle',
      resultDetail: answer ? 'last edge that completes a cycle' : undefined,
    };
  },
  note: 'Union-Find answers exactly one question — "are these already in the same component?" — in near-O(1). Processing edges in input order means the first "yes" is automatically the answer the problem wants (the latest removable edge).',
  complexity: { time: 'O(E · α(V))', space: 'O(V)' },
  brute: {
    label: 'Remove each edge and test',
    technique: 'Try deleting edges from last to first; the first deletion that leaves the graph connected is the answer.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> findRedundantConnection(vector<vector<int>>& edges) {'),
        L('        int n = edges.size();', 'init'),
        L('        for (int skip = n - 1; skip >= 0; skip--) {', 'find'),
        L('            // build the graph without edges[skip], then DFS from node 1', 'find'),
        L('            if (connectedWithout(edges, skip, n)) return edges[skip];', 'find', 'cycle'),
        L('        }'),
        L('        return {};', 'union'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] findRedundantConnection(int[][] edges) {'),
        L('        int n = edges.length;', 'init'),
        L('        for (int skip = n - 1; skip >= 0; skip--) {', 'find'),
        L('            // build the graph without edges[skip], then DFS from node 1', 'find'),
        L('            if (connectedWithout(edges, skip, n)) return edges[skip];', 'find', 'cycle'),
        L('        }'),
        L('        return new int[]{};', 'union'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { nodes, edges } = parsed;
      const idOf = new Map(nodes.map((v, i) => [v, i]));
      const layout = circleLayout(nodes);
      const steps: Step[] = [];
      let visits = 0;
      const snap = (skip: number, reached: number[] = [], ok?: boolean): TreeState => ({
        nodes: layout,
        edges: edges.filter((_, i) => i !== skip).map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
        done: reached.map((v) => idOf.get(v)!),
        edgeMark: ok ? [] : undefined,
        aggs: [
          { label: 'removed edge', value: skip >= 0 ? `${edges[skip][0]}-${edges[skip][1]}` : '—', c: 'a' },
          { label: 'node visits', value: String(visits), c: 'b' },
        ],
      });
      steps.push({ tag: 'init', trace: ['A tree on these nodes needs exactly ', A(nodes.length - 1), ' edges. Try removing each edge (latest first) and check the rest still connects everything.'], state: snap(-1) });
      let answer: [number, number] | null = null;
      for (let skip = edges.length - 1; skip >= 0; skip--) {
        const adj = new Map<number, number[]>(nodes.map((v) => [v, []]));
        edges.forEach(([u, v], i) => {
          if (i === skip) return;
          adj.get(u)!.push(v);
          adj.get(v)!.push(u);
        });
        const seen = new Set<number>([nodes[0]]);
        const stack = [nodes[0]];
        while (stack.length) {
          const u = stack.pop()!;
          visits++;
          for (const v of adj.get(u)!) if (!seen.has(v)) {
            seen.add(v);
            stack.push(v);
          }
        }
        const ok = seen.size === nodes.length;
        steps.push({
          tag: ok ? 'cycle' : 'find',
          trace: ['Without edge (', A(edges[skip][0]), ',', A(edges[skip][1]), '): DFS reaches ', A(seen.size), ' of ', A(nodes.length), ' nodes — ', ok ? B('still connected, so this edge was redundant') : F('disconnected, so it is needed'), '.'],
          state: snap(skip, [...seen], ok),
        });
        if (ok) {
          answer = edges[skip];
          break;
        }
      }
      return { steps, result: answer ? `[${answer[0]}, ${answer[1]}]` : 'no cycle', resultDetail: answer ? 'last edge whose removal leaves a tree' : undefined };
    },
    note: 'Each trial rebuilds the graph and runs a full DFS, so the cost is O(E · (V + E)). Union-Find detects the cycle-closing edge incrementally in near-constant time per edge.',
    complexity: { time: 'O(E · (V + E))', space: 'O(V + E)' },
  },
};

/* ================= 104. Word Ladder ================= */
const wordLadder: ProblemDef = {
  slug: 'word-ladder',
  title: 'Word Ladder',
  category: 'Graphs',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/word-ladder/',
  technique: 'BFS over the implicit graph where words differing by one letter are neighbors.',
  widget: 'list',
  widgetTitle: 'BFS levels',
  inputs: [
    { key: 'begin', label: 'Begin word', defaultValue: 'hit' },
    { key: 'end', label: 'End word', defaultValue: 'cog' },
    { key: 'wordList', label: 'Word list', defaultValue: 'hot, dot, dog, lot, log, cog', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {'),
      L('        unordered_set<string> dict(wordList.begin(), wordList.end());', 'init'),
      L('        if (!dict.count(endWord)) return 0;', 'init'),
      L('        queue<string> q;', 'init'),
      L('        q.push(beginWord);', 'init'),
      L('        int level = 1;', 'init'),
      L('        while (!q.empty()) {', 'loop'),
      L('            for (int sz = q.size(); sz > 0; sz--) {', 'level'),
      L('                string w = q.front(); q.pop();', 'pop'),
      L('                if (w == endWord) return level;', 'found'),
      L('                for (int i = 0; i < w.size(); i++) {', 'mutate'),
      L('                    string t = w;', 'mutate'),
      L('                    for (char c = \'a\'; c <= \'z\'; c++) {', 'mutate'),
      L('                        t[i] = c;', 'mutate'),
      L('                        if (dict.count(t)) {', 'push'),
      L('                            q.push(t);', 'push'),
      L('                            dict.erase(t);', 'push'),
      L('                        }'),
      L('                    }'),
      L('                }'),
      L('            }'),
      L('            level++;', 'level'),
      L('        }'),
      L('        return 0;', 'fail'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int ladderLength(String beginWord, String endWord, List<String> wordList) {'),
      L('        Set<String> dict = new HashSet<>(wordList);', 'init'),
      L('        if (!dict.contains(endWord)) return 0;', 'init'),
      L('        Queue<String> q = new LinkedList<>();', 'init'),
      L('        q.add(beginWord);', 'init'),
      L('        int level = 1;', 'init'),
      L('        while (!q.isEmpty()) {', 'loop'),
      L('            for (int sz = q.size(); sz > 0; sz--) {', 'level'),
      L('                String w = q.poll();', 'pop'),
      L('                if (w.equals(endWord)) return level;', 'found'),
      L('                char[] arr = w.toCharArray();', 'mutate'),
      L('                for (int i = 0; i < arr.length; i++) {', 'mutate'),
      L('                    char keep = arr[i];', 'mutate'),
      L('                    for (char c = \'a\'; c <= \'z\'; c++) {', 'mutate'),
      L('                        arr[i] = c;', 'mutate'),
      L('                        String t = new String(arr);', 'mutate'),
      L('                        if (dict.contains(t)) {', 'push'),
      L('                            q.add(t);', 'push'),
      L('                            dict.remove(t);', 'push'),
      L('                        }'),
      L('                    }'),
      L('                    arr[i] = keep;', 'mutate'),
      L('                }'),
      L('            }'),
      L('            level++;', 'level'),
      L('        }'),
      L('        return 0;', 'fail'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const begin = (values.begin ?? '').trim().toLowerCase();
    const end = (values.end ?? '').trim().toLowerCase();
    const words = (values.wordList ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (!/^[a-z]{2,5}$/.test(begin) || !/^[a-z]{2,5}$/.test(end)) return { error: 'Words: lowercase, 2–5 letters.' };
    if (begin.length !== end.length || !words.every((w) => w.length === begin.length)) return { error: 'All words must share one length.' };
    if (words.length > 10) return { error: 'Keep the list to at most 10 words.' };

    const dict = new Set(words);
    const steps: Step[] = [];
    const levels: string[][] = [[begin]];
    const view = (activeWord?: string): ListState => ({
      chains: levels.map((lv, i) => ({
        label: `level ${i + 1}`,
        items: lv.map((w) => ({
          v: w,
          mark: w === end && i === levels.length - 1 && activeWord === w ? ('final' as const) : w === activeWord ? ('active' as const) : ('win' as const),
        })),
        broken: true,
      })),
      aggs: [{ label: 'unvisited dict', value: [...dict].join(' ') || '∅', c: 'a' }],
    });
    if (!dict.has(end)) {
      steps.push({ tag: 'init', trace: ['"', F(end), '" is not in the word list — no ladder can end there. Return ', C(0), '.'], state: view() });
      return { steps, result: '0', resultDetail: 'end word missing from list' };
    }
    steps.push({ tag: 'init', trace: ['Words are graph nodes; an edge = one-letter difference. BFS finds the ', B('shortest'), ' ladder from "', A(begin), '" to "', C(end), '".'], state: view() });
    let queue = [begin];
    let level = 1;
    let result = 0;
    outer: while (queue.length > 0 && steps.length < MAX_STEPS) {
      const next: string[] = [];
      for (const w of queue) {
        if (w === end) {
          result = level;
          steps.push({ tag: 'found', trace: ['Dequeued "', C(end), '" at level ', C(level), ' — the shortest ladder has ', C(level), ' words.'], state: view(w) });
          break outer;
        }
        steps.push({ tag: 'pop', trace: ['Expand "', A(w), '": mutate each position through a–z and keep dictionary hits.'], state: view(w) });
        for (let i = 0; i < w.length; i++) {
          for (let c = 97; c <= 122; c++) {
            const t = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
            if (dict.has(t)) {
              dict.delete(t);
              next.push(t);
              steps.push({ tag: 'push', trace: ['"', A(w), '" → "', B(t), '" (position ', A(i), ') — enqueue for level ', A(level + 1), '.'], state: view(t) });
            }
          }
        }
      }
      if (next.length > 0) levels.push([...next]);
      queue = next;
      level++;
    }
    if (result === 0) steps.push({ tag: 'fail', trace: ['BFS exhausted without reaching "', F(end), '" — return ', C(0), '.'], state: view() });
    return { steps, result: String(result), resultDetail: result ? `${result}-word ladder` : 'no transformation sequence' };
  },
  note: 'Deleting a word from the dictionary the moment it is enqueued is BFS\'s visited-set — and because BFS explores level by level, the first time the end word is dequeued is provably via a shortest ladder.',
  complexity: { time: 'O(N · L · 26)', space: 'O(N)' },
  brute: {
    label: 'Compare every pair',
    technique: 'Build the word graph by comparing every pair of words letter by letter, then BFS over that explicit graph.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool oneApart(const string& a, const string& b) {'),
        L('        int diff = 0; for (int i = 0; i < a.size(); i++) diff += a[i] != b[i];'),
        L('        return diff == 1;'),
        L('    }'),
        L('public:'),
        L('    int ladderLength(string begin, string end, vector<string>& list) {'),
        L('        list.push_back(begin);', 'init'),
        L('        // edges: every pair (i, j) with oneApart(list[i], list[j])  — O(N² · L)', 'init'),
        L('        queue<pair<string,int>> q; q.push({begin, 1});', 'init'),
        L('        unordered_set<string> seen{begin};', 'init'),
        L('        while (!q.empty()) {'),
        L('            auto [w, d] = q.front(); q.pop();', 'pop'),
        L('            if (w == end) return d;', 'found'),
        L('            for (auto& nb : list)', 'push'),
        L('                if (!seen.count(nb) && oneApart(w, nb)) { seen.insert(nb); q.push({nb, d + 1}); }', 'push'),
        L('        }'),
        L('        return 0;', 'fail'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean oneApart(String a, String b) {'),
        L('        int diff = 0; for (int i = 0; i < a.length(); i++) if (a.charAt(i) != b.charAt(i)) diff++;'),
        L('        return diff == 1;'),
        L('    }'),
        L('    public int ladderLength(String begin, String end, List<String> list) {'),
        L('        Deque<Object[]> q = new ArrayDeque<>(); q.add(new Object[]{begin, 1});', 'init'),
        L('        Set<String> seen = new HashSet<>(List.of(begin));', 'init'),
        L('        while (!q.isEmpty()) {'),
        L('            Object[] cur = q.poll(); String w = (String) cur[0]; int d = (int) cur[1];', 'pop'),
        L('            if (w.equals(end)) return d;', 'found'),
        L('            for (String nb : list)', 'push'),
        L('                if (!seen.contains(nb) && oneApart(w, nb)) { seen.add(nb); q.add(new Object[]{nb, d + 1}); }', 'push'),
        L('        }'),
        L('        return 0;', 'fail'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const begin = (values.begin ?? '').trim().toLowerCase();
      const end = (values.end ?? '').trim().toLowerCase();
      const words = (values.wordList ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
      if (!/^[a-z]{2,5}$/.test(begin) || !/^[a-z]{2,5}$/.test(end)) return { error: 'Words: lowercase, 2–5 letters.' };
      if (begin.length !== end.length || !words.every((w) => w.length === begin.length)) return { error: 'All words must share one length.' };
      if (words.length > 10) return { error: 'Keep the list to at most 10 words.' };
      const oneApart = (a: string, b: string) => [...a].filter((c, i) => c !== b[i]).length === 1;
      let compares = 0;
      const seen = new Set([begin]);
      const levels: string[][] = [[begin]];
      const steps: Step[] = [];
      const view = (active?: string): ListState => ({
        chains: levels.map((lv, i) => ({ label: `level ${i + 1}`, items: lv.map((w) => ({ v: w, mark: w === active ? ('active' as const) : ('win' as const) })), broken: true })),
        aggs: [{ label: 'word comparisons', value: String(compares), c: 'a' }],
      });
      if (!words.includes(end)) {
        steps.push({ tag: 'init', trace: ['"', F(end), '" is not in the word list — return ', C(0), '.'], state: view() });
        return { steps, result: '0', resultDetail: 'end word missing from list' };
      }
      steps.push({ tag: 'init', trace: ['No letter mutations: find neighbours by comparing a word against every word in the list.'], state: view() });
      let queue = [begin];
      let level = 1;
      let result = 0;
      outer: while (queue.length && steps.length < MAX_STEPS) {
        const next: string[] = [];
        for (const w of queue) {
          if (w === end) {
            result = level;
            steps.push({ tag: 'found', trace: ['Reached "', C(end), '" at level ', C(level), '.'], state: view(w) });
            break outer;
          }
          steps.push({ tag: 'pop', trace: ['Expand "', A(w), '": compare it with all ', A(words.length), ' words.'], state: view(w) });
          for (const nb of words) {
            compares++;
            if (!seen.has(nb) && oneApart(w, nb)) {
              seen.add(nb);
              next.push(nb);
              steps.push({ tag: 'push', trace: ['"', A(w), '" and "', B(nb), '" differ in one letter — enqueue.'], state: view(nb) });
            }
          }
        }
        if (next.length) levels.push(next);
        queue = next;
        level++;
      }
      if (!result) steps.push({ tag: 'fail', trace: ['BFS ran out of words — ', C(0), '.'], state: view() });
      return { steps, result: String(result), resultDetail: result ? `${result}-word ladder` : 'no transformation sequence' };
    },
    note: 'Comparing against every word costs O(N · L) per expansion, O(N² · L) overall. Trying the 26 letters at each position and looking the result up in a set costs O(26 · L) per word instead — better when the list is long.',
    complexity: { time: 'O(N² · L)', space: 'O(N)' },
  },
};

/* ================= 105. Network Delay Time ================= */
const networkDelay: ProblemDef = {
  slug: 'network-delay-time',
  title: 'Network Delay Time',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/network-delay-time/',
  technique: 'Dijkstra: always settle the unvisited node with the smallest tentative distance.',
  widget: 'graph',
  widgetTitle: 'Network (badge = distance)',
  inputs: [
    { key: 'edges', label: 'Directed edges u-v:w', defaultValue: '2-1:1, 2-3:1, 3-4:1', wide: true },
    { key: 'k', label: 'Source k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int networkDelayTime(vector<vector<int>>& times, int n, int k) {'),
      L('        vector<vector<pair<int,int>>> adj(n + 1);', 'init'),
      L('        for (auto& t : times)', 'init'),
      L('            adj[t[0]].push_back({t[1], t[2]});', 'init'),
      L('        vector<int> dist(n + 1, INT_MAX);', 'init'),
      L('        dist[k] = 0;', 'init'),
      L('        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;', 'init'),
      L('        pq.push({0, k});', 'init'),
      L('        while (!pq.empty()) {', 'loop'),
      L('            auto [d, u] = pq.top(); pq.pop();', 'settle'),
      L('            if (d > dist[u]) continue;', 'stale'),
      L('            for (auto [v, w] : adj[u]) {', 'relax'),
      L('                if (d + w < dist[v]) {', 'relax'),
      L('                    dist[v] = d + w;', 'improve'),
      L('                    pq.push({dist[v], v});', 'improve'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        int ans = *max_element(dist.begin() + 1, dist.end());', 'ret'),
      L('        return ans == INT_MAX ? -1 : ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int networkDelayTime(int[][] times, int n, int k) {'),
      L('        Map<Integer, List<int[]>> adj = new HashMap<>();', 'init'),
      L('        for (int[] t : times)', 'init'),
      L('            adj.computeIfAbsent(t[0], x -> new ArrayList<>()).add(new int[]{t[1], t[2]});', 'init'),
      L('        int[] dist = new int[n + 1];', 'init'),
      L('        Arrays.fill(dist, Integer.MAX_VALUE);', 'init'),
      L('        dist[k] = 0;', 'init'),
      L('        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);', 'init'),
      L('        pq.add(new int[]{0, k});', 'init'),
      L('        while (!pq.isEmpty()) {', 'loop'),
      L('            int[] top = pq.poll();', 'settle'),
      L('            int d = top[0], u = top[1];', 'settle'),
      L('            if (d > dist[u]) continue;', 'stale'),
      L('            for (int[] e : adj.getOrDefault(u, List.of())) {', 'relax'),
      L('                if (d + e[1] < dist[e[0]]) {', 'relax'),
      L('                    dist[e[0]] = d + e[1];', 'improve'),
      L('                    pq.add(new int[]{dist[e[0]], e[0]});', 'improve'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        int ans = 0;', 'ret'),
      L('        for (int i = 1; i <= n; i++) ans = Math.max(ans, dist[i]);', 'ret'),
      L('        return ans == Integer.MAX_VALUE ? -1 : ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseWeightedEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { nodes, edges } = parsed;
    const k = parseInt1(values.k, 'Source', { min: 0 });
    if (typeof k === 'string') return { error: k };
    if (!nodes.includes(k)) return { error: 'Source must be one of the nodes.' };

    const idOf = new Map(nodes.map((v, i) => [v, i]));
    const layout = circleLayout(nodes);
    const adj = new Map<number, [number, number][]>(nodes.map((v) => [v, []]));
    for (const [u, v, w] of edges) adj.get(u)!.push([v, w]);
    const dist = new Map<number, number>(nodes.map((v) => [v, Infinity]));
    dist.set(k, 0);
    const settled: number[] = [];
    const steps: Step[] = [];
    const fmt = (d: number) => (d === Infinity ? '∞' : String(d));
    const snap = (current: number | null, mark?: string[]): TreeState => ({
      nodes: layout.map((nd) => ({ ...nd, badge: `d=${fmt(dist.get(nd.val as number)!)}` })),
      edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
      directed: true,
      current,
      done: [...settled].map((v) => idOf.get(v)!),
      edgeMark: mark,
    });
    steps.push({ tag: 'init', trace: ['Signal starts at node ', A(k), ' (distance 0); everything else is ', F('∞'), '. Settle nodes cheapest-first.'], state: snap(idOf.get(k)!) });
    const pq: [number, number][] = [[0, k]];
    while (pq.length > 0 && steps.length < MAX_STEPS) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (d > dist.get(u)!) {
        steps.push({ tag: 'stale', trace: ['Heap entry for ', F(u), ' at distance ', F(d), ' is stale (better path known) — discard.'], state: snap(null) });
        continue;
      }
      settled.push(u);
      steps.push({ tag: 'settle', trace: ['Settle node ', B(u), ' at distance ', B(d), ' — no shorter path to it can exist.'], state: snap(idOf.get(u)!) });
      for (const [v, w] of adj.get(u)!) {
        if (d + w < dist.get(v)!) {
          dist.set(v, d + w);
          pq.push([d + w, v]);
          steps.push({
            tag: 'improve',
            trace: ['Relax ', A(u), ' → ', A(v), ' (weight ', A(w), '): new best distance ', B(d + w), '.'],
            state: snap(idOf.get(u)!, [`${idOf.get(u)}-${idOf.get(v)}`]),
          });
        } else {
          steps.push({
            tag: 'relax',
            trace: ['Relax ', A(u), ' → ', A(v), ': ', F(d + w), ' does not beat ', A(fmt(dist.get(v)!)), ' — skip.'],
            state: snap(idOf.get(u)!),
          });
        }
      }
    }
    const worst = Math.max(...nodes.map((v) => dist.get(v)!));
    const result = worst === Infinity ? -1 : worst;
    steps.push({
      tag: 'ret',
      trace: worst === Infinity
        ? ['Some node was never reached — return ', C('-1'), '.']
        : ['The last node to hear the signal defines the delay: ', C(worst), '.'],
      state: snap(null),
    });
    return { steps, result: String(result), resultDetail: worst === Infinity ? 'graph not fully reachable' : 'time until every node receives the signal' };
  },
  note: 'Dijkstra\'s invariant: with non-negative weights, the unsettled node with the smallest tentative distance can never be improved — so it can be finalized greedily. The answer is the max settled distance, since the network "finishes" when the slowest node hears the signal.',
  complexity: { time: 'O(E log V)', space: 'O(V + E)' },
  brute: {
    label: 'Bellman-Ford',
    technique: 'Relax every edge, V − 1 times over; after that every shortest distance is final.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int networkDelayTime(vector<vector<int>>& times, int n, int k) {'),
        L('        vector<long> dist(n + 1, LONG_MAX); dist[k] = 0;', 'init'),
        L('        for (int round = 1; round < n; round++)', 'settle'),
        L('            for (auto& t : times)', 'relax'),
        L('                if (dist[t[0]] != LONG_MAX && dist[t[0]] + t[2] < dist[t[1]])', 'relax'),
        L('                    dist[t[1]] = dist[t[0]] + t[2];', 'improve'),
        L('        long ans = *max_element(dist.begin() + 1, dist.end());', 'ret'),
        L('        return ans == LONG_MAX ? -1 : ans;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int networkDelayTime(int[][] times, int n, int k) {'),
        L('        long[] dist = new long[n + 1];', 'init'),
        L('        Arrays.fill(dist, Long.MAX_VALUE); dist[k] = 0;', 'init'),
        L('        for (int round = 1; round < n; round++)', 'settle'),
        L('            for (int[] t : times)', 'relax'),
        L('                if (dist[t[0]] != Long.MAX_VALUE && dist[t[0]] + t[2] < dist[t[1]])', 'relax'),
        L('                    dist[t[1]] = dist[t[0]] + t[2];', 'improve'),
        L('        long ans = 0;', 'ret'),
        L('        for (int i = 1; i <= n; i++) ans = Math.max(ans, dist[i]);', 'ret'),
        L('        return ans == Long.MAX_VALUE ? -1 : (int) ans;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseWeightedEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { nodes, edges } = parsed;
      const k = parseInt1(values.k, 'Source', { min: 0 });
      if (typeof k === 'string') return { error: k };
      if (!nodes.includes(k)) return { error: 'Source must be one of the nodes.' };
      const idOf = new Map(nodes.map((v, i) => [v, i]));
      const layout = circleLayout(nodes);
      const dist = new Map<number, number>(nodes.map((v) => [v, Infinity]));
      dist.set(k, 0);
      let relaxations = 0;
      const steps: Step[] = [];
      const fmt = (d: number) => (d === Infinity ? '∞' : String(d));
      const snap = (mark?: string[]): TreeState => ({
        nodes: layout.map((nd) => ({ ...nd, badge: `d=${fmt(dist.get(nd.val as number)!)}` })),
        edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
        directed: true,
        current: idOf.get(k)!,
        edgeMark: mark,
        aggs: [{ label: 'edge relaxations', value: String(relaxations), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No priority queue: relax every edge, round after round, ', A(nodes.length - 1), ' rounds in all.'], state: snap() });
      for (let round = 1; round < nodes.length; round++) {
        let changed = false;
        steps.push({ tag: 'settle', trace: ['Round ', A(round), ': relax all ', A(edges.length), ' edges.'], state: snap() });
        for (const [u, v, w] of edges) {
          relaxations++;
          if (dist.get(u)! !== Infinity && dist.get(u)! + w < dist.get(v)!) {
            dist.set(v, dist.get(u)! + w);
            changed = true;
            steps.push({ tag: 'improve', trace: ['Edge ', A(u), ' → ', A(v), ' (', A(w), '): distance to ', B(v), ' drops to ', B(dist.get(v)!), '.'], state: snap([`${idOf.get(u)}-${idOf.get(v)}`]) });
          }
        }
        if (!changed) {
          steps.push({ tag: 'relax', trace: ['Nothing improved this round — every distance is already final.'], state: snap() });
          break;
        }
      }
      const worst = Math.max(...nodes.map((v) => dist.get(v)!));
      const result = worst === Infinity ? -1 : worst;
      steps.push({ tag: 'ret', trace: worst === Infinity ? ['Some node is unreachable — ', C('-1'), '.'] : ['Slowest node hears the signal at ', C(worst), '.'], state: snap() });
      return { steps, result: String(result), resultDetail: worst === Infinity ? 'graph not fully reachable' : 'time until every node receives the signal' };
    },
    note: 'O(V · E) instead of Dijkstra’s O(E log V), because it re-relaxes edges whose endpoints are already final. Its advantage is that it tolerates negative edge weights, which Dijkstra cannot.',
    complexity: { time: 'O(V · E)', space: 'O(V)' },
  },
};

/* ================= 106. Cheapest Flights Within K Stops ================= */
const cheapestFlights: ProblemDef = {
  slug: 'cheapest-flights-within-k-stops',
  title: 'Cheapest Flights Within K Stops',
  category: 'Graphs',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
  technique: 'Bellman-Ford, capped: k+1 rounds of edge relaxation = paths of at most k stops.',
  widget: 'graph',
  widgetTitle: 'Flights (badge = cheapest fare)',
  inputs: [
    { key: 'edges', label: 'Flights u-v:price', defaultValue: '0-1:100, 1-2:100, 0-2:500', wide: true },
    { key: 'src', label: 'From', defaultValue: '0' },
    { key: 'dst', label: 'To', defaultValue: '2' },
    { key: 'k', label: 'Max stops k', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findCheapestPrice(int n, vector<vector<int>>& flights,'),
      L('                          int src, int dst, int k) {'),
      L('        vector<int> dist(n, INT_MAX);', 'init'),
      L('        dist[src] = 0;', 'init'),
      L('        for (int round = 0; round <= k; round++) {', 'round'),
      L('            vector<int> next = dist;', 'copy'),
      L('            for (auto& f : flights) {', 'relax'),
      L('                if (dist[f[0]] != INT_MAX &&', 'relax'),
      L('                    dist[f[0]] + f[2] < next[f[1]])', 'relax'),
      L('                    next[f[1]] = dist[f[0]] + f[2];', 'improve'),
      L('            }'),
      L('            dist = next;', 'copy'),
      L('        }'),
      L('        return dist[dst] == INT_MAX ? -1 : dist[dst];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findCheapestPrice(int n, int[][] flights,'),
      L('                                 int src, int dst, int k) {'),
      L('        int[] dist = new int[n];', 'init'),
      L('        Arrays.fill(dist, Integer.MAX_VALUE);', 'init'),
      L('        dist[src] = 0;', 'init'),
      L('        for (int round = 0; round <= k; round++) {', 'round'),
      L('            int[] next = dist.clone();', 'copy'),
      L('            for (int[] f : flights) {', 'relax'),
      L('                if (dist[f[0]] != Integer.MAX_VALUE &&', 'relax'),
      L('                    dist[f[0]] + f[2] < next[f[1]])', 'relax'),
      L('                    next[f[1]] = dist[f[0]] + f[2];', 'improve'),
      L('            }'),
      L('            dist = next;', 'copy'),
      L('        }'),
      L('        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseWeightedEdges(values.edges);
    if (typeof parsed === 'string') return { error: parsed };
    const { nodes, edges } = parsed;
    const src = parseInt1(values.src, 'From', { min: 0 });
    if (typeof src === 'string') return { error: src };
    const dst = parseInt1(values.dst, 'To', { min: 0 });
    if (typeof dst === 'string') return { error: dst };
    const k = parseInt1(values.k, 'k', { min: 0, max: 5 });
    if (typeof k === 'string') return { error: k };
    if (!nodes.includes(src) || !nodes.includes(dst)) return { error: 'From/To must be nodes in the edge list.' };

    const idOf = new Map(nodes.map((v, i) => [v, i]));
    const layout = circleLayout(nodes);
    const dist = new Map<number, number>(nodes.map((v) => [v, Infinity]));
    dist.set(src, 0);
    const steps: Step[] = [];
    const fmt = (d: number) => (d === Infinity ? '∞' : String(d));
    const snap = (mark?: string[]): TreeState => ({
      nodes: layout.map((nd) => ({ ...nd, badge: `$${fmt(dist.get(nd.val as number)!)}` })),
      edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
      directed: true,
      edgeMark: mark,
      done: [idOf.get(src)!],
      current: idOf.get(dst)!,
    });
    steps.push({ tag: 'init', trace: ['Start: ', B(src), ' costs $0, everything else ', F('∞'), '. Run exactly ', A(k + 1), ' relaxation rounds — one per allowed flight leg.'], state: snap() });
    for (let round = 0; round <= k; round++) {
      const next = new Map(dist);
      steps.push({ tag: 'round', trace: ['Round ', A(round + 1), ' of ', A(k + 1), ' — extend every known route by one more flight (frozen snapshot prevents chaining).'], state: snap() });
      for (const [u, v, w] of edges) {
        if (dist.get(u)! !== Infinity && dist.get(u)! + w < next.get(v)!) {
          next.set(v, dist.get(u)! + w);
          steps.push({
            tag: 'improve',
            trace: ['Flight ', A(u), ' → ', A(v), ' ($', A(w), '): reaching ', B(v), ' now costs $', B(dist.get(u)! + w), '.'],
            state: snap([`${idOf.get(u)}-${idOf.get(v)}`]),
          });
        }
      }
      for (const [key, val] of next) dist.set(key, val);
      steps.push({ tag: 'copy', trace: ['Commit the round — prices after ', A(round + 1), ' leg(s): ', A(nodes.map((v) => `${v}:$${fmt(dist.get(v)!)}`).join(' ')), '.'], state: snap() });
    }
    const result = dist.get(dst) === Infinity ? -1 : dist.get(dst)!;
    steps.push({
      tag: 'ret',
      trace: result === -1
        ? [F(dst), ' is unreachable within ', A(k), ' stop(s) — return ', C('-1'), '.']
        : ['Cheapest fare ', A(src), ' → ', A(dst), ' with ≤ ', A(k), ' stop(s): ', C(`$${result}`), '.'],
      state: snap(),
    });
    return { steps, result: String(result), resultDetail: result === -1 ? undefined : `within ${k} stops` };
  },
  note: 'Plain Dijkstra can\'t handle the stop limit — a cheaper fare with too many legs poisons the table. Bellman-Ford\'s round structure *is* the leg count, and relaxing against a frozen copy of last round\'s distances is what stops multiple legs from sneaking into one round.',
  complexity: { time: 'O(k · E)', space: 'O(V)' },
  brute: {
    label: 'DFS over every route',
    technique: 'Explore every route from the source with at most k stops and keep the cheapest one that lands on the destination.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    int best = INT_MAX;'),
        L('    void dfs(vector<vector<pair<int,int>>>& adj, int u, int dst, int stops, int cost) {', 'round'),
        L('        if (u == dst) { best = min(best, cost); return; }', 'improve'),
        L('        if (stops < 0) return;', 'copy'),
        L('        for (auto [v, w] : adj[u]) dfs(adj, v, dst, stops - 1, cost + w);', 'relax'),
        L('    }'),
        L('public:'),
        L('    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {'),
        L('        vector<vector<pair<int,int>>> adj(n);', 'init'),
        L('        for (auto& f : flights) adj[f[0]].push_back({f[1], f[2]});', 'init'),
        L('        dfs(adj, src, dst, k, 0);', 'init'),
        L('        return best == INT_MAX ? -1 : best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int best = Integer.MAX_VALUE;'),
        L('    void dfs(List<int[]>[] adj, int u, int dst, int stops, int cost) {', 'round'),
        L('        if (u == dst) { best = Math.min(best, cost); return; }', 'improve'),
        L('        if (stops < 0) return;', 'copy'),
        L('        for (int[] e : adj[u]) dfs(adj, e[0], dst, stops - 1, cost + e[1]);', 'relax'),
        L('    }'),
        L('    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {'),
        L('        List<int[]>[] adj = new List[n];', 'init'),
        L('        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();', 'init'),
        L('        for (int[] f : flights) adj[f[0]].add(new int[]{f[1], f[2]});', 'init'),
        L('        dfs(adj, src, dst, k, 0);', 'init'),
        L('        return best == Integer.MAX_VALUE ? -1 : best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseWeightedEdges(values.edges);
      if (typeof parsed === 'string') return { error: parsed };
      const { nodes, edges } = parsed;
      const src = parseInt1(values.src, 'From', { min: 0 });
      if (typeof src === 'string') return { error: src };
      const dst = parseInt1(values.dst, 'To', { min: 0 });
      if (typeof dst === 'string') return { error: dst };
      const k = parseInt1(values.k, 'k', { min: 0, max: 5 });
      if (typeof k === 'string') return { error: k };
      if (!nodes.includes(src) || !nodes.includes(dst)) return { error: 'From/To must be nodes in the edge list.' };
      const idOf = new Map(nodes.map((v, i) => [v, i]));
      const layout = circleLayout(nodes);
      const adj = new Map<number, [number, number][]>(nodes.map((v) => [v, []]));
      for (const [u, v, w] of edges) adj.get(u)!.push([v, w]);
      let best = Infinity;
      let routes = 0;
      const path: number[] = [src];
      const steps: Step[] = [];
      const snap = (): TreeState => ({
        nodes: layout,
        edges: edges.map(([u, v]) => [idOf.get(u)!, idOf.get(v)!] as [number, number]),
        directed: true,
        done: path.map((v) => idOf.get(v)!),
        current: idOf.get(dst)!,
        edgeMark: path.slice(1).map((v, i) => `${idOf.get(path[i])}-${idOf.get(v)}`),
        aggs: [
          { label: 'route', value: path.join(' → '), c: 'a' },
          { label: 'cheapest', value: best === Infinity ? '—' : `$${best}`, c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Try every route of at most ', A(k), ' stops by depth-first search.'], state: snap() });
      const dfs = (u: number, stops: number, cost: number) => {
        if (u === dst) {
          routes++;
          const better = cost < best;
          if (better) best = cost;
          if (steps.length < MAX_STEPS) steps.push({ tag: 'improve', trace: ['Route ', A(path.join(' → ')), ' costs $', better ? B(cost) : F(cost), better ? ' — cheapest so far.' : '.'], state: snap() });
          return;
        }
        if (stops < 0) return;
        for (const [v, w] of adj.get(u)!) {
          if (path.includes(v)) continue;
          path.push(v);
          if (steps.length < MAX_STEPS) steps.push({ tag: 'relax', trace: ['Fly ', A(u), ' → ', A(v), ' ($', A(w), '), total $', A(cost + w), '.'], state: snap() });
          dfs(v, stops - 1, cost + w);
          path.pop();
        }
      };
      dfs(src, k, 0);
      const result = best === Infinity ? -1 : best;
      steps.push({ tag: 'ret', trace: result === -1 ? ['No route within ', A(k), ' stop(s) — ', C('-1'), '.'] : ['Checked ', A(routes), ' complete route(s): cheapest is ', C(`$${result}`), '.'], state: snap() });
      return { steps, result: String(result), resultDetail: result === -1 ? undefined : `within ${k} stops` };
    },
    note: 'The number of routes grows exponentially with k. Bellman-Ford’s k + 1 rounds of relaxation keep only the cheapest fare per city per round, which is O(k · E).',
    complexity: { time: 'O(branching^k)', space: 'O(k) stack' },
  },
};

export const graphs2 = [cloneGraph, courseSchedule, courseScheduleII, redundantConnection, wordLadder, networkDelay, cheapestFlights];
