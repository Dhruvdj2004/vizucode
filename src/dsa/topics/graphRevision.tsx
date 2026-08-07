import type { Topic } from '../../content/types';

const topic: Topic = {
  slug: 'graph-revision',
  num: 7,
  unit: 'Graphs',
  title: '10-Minute Graph Revision',
  blurb:
    'Everything from the Graphs unit compressed into recall-only form — complexities, the problem-to-algorithm map, and the traps. Read this last, on the way in.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'complexity',
      heading: 'Every complexity on one screen',
      blocks: [
        {
          k: 'table',
          head: ['Algorithm', 'Time', 'Space', 'The one thing to remember'],
          rows: [
            ['BFS', 'O(V + E)', 'O(V)', 'Queue. Mark visited when you ADD, not when you pop.'],
            ['DFS', 'O(V + E)', 'O(V)', 'Recursion. Watch stack depth on long chains.'],
            ['Cycle — undirected', 'O(V + E)', 'O(V)', 'DFS + parent trick: visited AND not my parent.'],
            ['Cycle — directed', 'O(V + E)', 'O(V)', 'DFS + recursion stack: an edge into inStack.'],
            ['Topological sort', 'O(V + E)', 'O(V)', "DFS post-order push, or Kahn's indegrees."],
            ['Dijkstra', 'O(E log V)', 'O(V)', 'Min-heap of (dist, vertex). No negative edges.'],
            ['Bellman-Ford', 'O(V · E)', 'O(V)', 'Relax all edges V−1 times; extra pass detects a negative cycle.'],
            ["Prim's MST", 'O(E log E)', 'O(V)', 'Like Dijkstra but push the EDGE WEIGHT, not the distance.'],
            ["Kruskal's MST", 'O(E log E)', 'O(V)', 'Sort edges, add if no cycle, using Union-Find.'],
            ['Kosaraju SCC', 'O(V + E)', 'O(V)', 'DFS → transpose → DFS in stack order.'],
            ['Tarjan bridges / APs', 'O(V + E)', 'O(V)', 'disc & low. Bridge uses >, articulation uses ≥.'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Only <b>three</b> break O(V + E): Dijkstra and Prim's because of the heap (a log per edge), and
              Bellman-Ford because it repeats all E edges V−1 times. Everything else is one pass over vertices and
              edges.
            </>
          ),
        },
      ],
    },

    {
      id: 'which-algorithm',
      heading: 'The problem-to-algorithm map',
      blocks: [
        {
          k: 'table',
          head: ['If the problem says…', 'Reach for'],
          rows: [
            ['"minimum steps / moves", unweighted', 'BFS'],
            ['"count islands / regions / provinces"', 'DFS or BFS + a component loop'],
            ['"can all courses be finished" / deadlock', 'Directed cycle detection'],
            ['"valid order given prerequisites"', 'Topological sort'],
            ['"cheapest / fastest route", positive weights', 'Dijkstra'],
            ['negative weights, or "detect a negative cycle" / arbitrage', 'Bellman-Ford'],
            ['"minimum cost to connect all points"', "MST — Prim's or Kruskal's"],
            ['"critical connection" / single point of failure', 'Tarjan bridges or articulation points'],
            ['"mutually reachable groups" in a directed graph', 'Kosaraju or Tarjan SCC'],
            ['"print every path"', 'DFS backtracking with an onPath array'],
          ],
        },
      ],
    },

    {
      id: 'one-liners',
      heading: 'The one-line answers',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Why does BFS give the shortest path?</b> It visits in increasing distance order, so the first time
              you reach a vertex you used the fewest edges. Breaks the moment edges have weights.
            </>,
            <>
              <b>Why does Dijkstra fail on negative edges?</b> It finalises a vertex when popped, assuming nothing
              later can improve it. A negative edge can. Counterexample: S→A (2), S→B (5), B→A (−4).
            </>,
            <>
              <b>Dijkstra vs Prim's?</b> Same heap, different priority. Dijkstra pushes{' '}
              <code>dist[u] + weight</code> — cheapest <i>route</i>. Prim's pushes <code>weight</code> — cheapest{' '}
              <i>network</i>.
            </>,
            <>
              <b>Why different cycle algorithms?</b> Undirected edges are stored both ways, so seeing your parent is
              normal — you need "visited and not parent". Directed edges have no automatic reverse, so you need
              "still on the recursion stack".
            </>,
            <>
              <b>Why does Kosaraju need the transpose?</b> Reversing edges changes nothing inside an SCC but kills
              the one-way bridges between them, trapping each second-pass DFS in exactly one component.
            </>,
            <>
              <b>Bridge vs articulation point?</b> <code>low[v] &gt; disc[u]</code> is a bridge;{' '}
              <code>low[v] ≥ disc[u]</code> is an articulation point. Reaching back <i>to</i> u still means removing
              u disconnects things.
            </>,
            <>
              <b>Adjacency list or matrix?</b> List by default — O(V+E) space, fast neighbour iteration. Matrix only
              for dense graphs, small V, or repeated "does edge (u,v) exist?".
            </>,
          ],
        },
      ],
    },

    {
      id: 'traps',
      heading: 'The traps',
      blocks: [
        {
          k: 'note',
          tone: 'warn',
          title: 'Undirected edges must be added twice',
          text: (
            <>
              <code>graph[u].push_back(v)</code> <b>and</b> <code>graph[v].push_back(u)</code>. Forgetting the
              second line is the most common bug in this entire unit.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Mark visited on push, not on pop',
          text: (
            <>
              In BFS, marking when you pop lets the same vertex enter the queue many times and can blow up to
              exponential work.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'All-paths needs un-marking',
          text: (
            <>
              Plain DFS marks visited forever. Printing every path means marking only while a vertex is{' '}
              <i>on the current path</i>, then <code>onPath[src] = false</code> on the way out.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: "Bellman-Ford's infinity guard",
          text: (
            <>
              Check <code>dist[e.src] != INT_MAX</code> before adding, or the overflow wraps to a huge negative and
              corrupts every distance.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Disconnected graphs',
          text: (
            <>
              One traversal only covers one component. Loop{' '}
              <code>for (i = 0; i &lt; V; i++) if (!visited[i]) dfs(i);</code> — and the number of times that loop
              fires is the component count.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'BFS or DFS — how do you choose?',
      a: (
        <>
          <b>BFS</b> whenever the answer is a minimum number of steps in an unweighted graph, or anything level-based.{' '}
          <b>DFS</b> for cycle detection, topological sort, connected components and enumerating paths. For "does a
          path exist", either works.
        </>
      ),
    },
    {
      q: 'Unweighted, weighted-positive, weighted-negative — which shortest-path algorithm?',
      a: (
        <>
          BFS, Dijkstra, Bellman-Ford — in that order. Bellman-Ford is also the one that <b>detects</b> a negative
          cycle, using one extra relaxation pass.
        </>
      ),
    },
    {
      q: "What is the difference between Dijkstra and Prim's?",
      a: (
        <>
          Both pop from a min-heap; the priority differs. Dijkstra minimises the cumulative distance from the
          source; Prim's minimises the single edge connecting a new vertex to the tree. Different objectives:
          cheapest route vs cheapest network.
        </>
      ),
    },
    {
      q: 'How do you detect a cycle in a directed graph?',
      a: (
        <>
          DFS with an <b>inStack</b> array alongside <b>visited</b>. An edge to a vertex that is still on the
          recursion stack is a back edge, and therefore a cycle. Alternatively run Kahn's algorithm — if fewer than
          V vertices come out, a cycle exists.
        </>
      ),
    },
    {
      q: 'What does a topological sort require, and is it unique?',
      a: (
        <>
          It requires a <b>DAG</b> — a directed graph with no cycles. It is usually <b>not unique</b>; it is unique
          only when the DAG has a Hamiltonian path. For the lexicographically smallest order, use Kahn's with a
          min-heap.
        </>
      ),
    },
    {
      q: 'How many edges does a spanning tree have, and is the MST unique?',
      a: (
        <>
          Exactly <b>V − 1</b>. The MST is unique if all edge weights are distinct; with ties there can be several,
          all with the same total weight.
        </>
      ),
    },
    {
      q: 'What is the time complexity of BFS and DFS, and why?',
      a: (
        <>
          Both <b>O(V + E)</b>: every vertex is enqueued or visited once, and every edge is examined once (twice in
          an undirected adjacency list). Space is O(V) for the visited array plus the queue or recursion stack.
        </>
      ),
    },
    {
      q: 'Connected component vs strongly connected component?',
      a: (
        <>
          Connected components are an <b>undirected</b> idea — reachable ignoring direction. Strongly connected
          components are <b>directed</b> — every vertex reaches every other <i>along the arrows</i>. Found with
          Kosaraju (two DFS passes) or Tarjan (one).
        </>
      ),
    },
  ],
};

export default topic;
