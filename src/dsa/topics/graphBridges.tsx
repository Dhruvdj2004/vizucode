import { Dg, GEdge, GNode, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** A graph with its bridges highlighted and disc/low values shown. */
function BridgeGraph() {
  const P: Record<string, [number, number]> = {
    '0': [70, 95],
    '1': [175, 48],
    '2': [175, 145],
    '3': [315, 95],
    '4': [440, 95],
  };
  const meta: Record<string, [number, number]> = {
    // vertex -> [disc, low]
    '0': [1, 1],
    '1': [2, 1],
    '2': [3, 1],
    '3': [4, 4],
    '4': [5, 5],
  };
  return (
    <Dg w={600} h={270} cap="Bridges are the edges whose removal splits the graph in two">
      <GEdge x1={P['0'][0]} y1={P['0'][1]} x2={P['1'][0]} y2={P['1'][1]} c="n" />
      <GEdge x1={P['1'][0]} y1={P['1'][1]} x2={P['2'][0]} y2={P['2'][1]} c="n" />
      <GEdge x1={P['2'][0]} y1={P['2'][1]} x2={P['0'][0]} y2={P['0'][1]} c="n" />
      <GEdge x1={P['2'][0]} y1={P['2'][1]} x2={P['3'][0]} y2={P['3'][1]} c="c" />
      <GEdge x1={P['3'][0]} y1={P['3'][1]} x2={P['4'][0]} y2={P['4'][1]} c="c" />

      {Object.keys(P).map((k) => (
        <GNode key={k} cx={P[k][0]} cy={P[k][1]} label={k} c={k === '2' || k === '3' ? 'c' : 'a'} />
      ))}
      {Object.keys(P).map((k) => (
        <Txt key={`m${k}`} x={P[k][0]} y={P[k][1] + 34} fs={9.5} soft>
          {`disc ${meta[k][0]} · low ${meta[k][1]}`}
        </Txt>
      ))}

      <Txt x={245} y={100} fs={10.5} bold c="c">
        bridge
      </Txt>
      <Txt x={378} y={78} fs={10.5} bold c="c">
        bridge
      </Txt>
      <Txt x={122} y={20} fs={10.5} soft>
        the triangle 0–1–2 has a way back, so none of its edges is a bridge
      </Txt>
      <Txt x={300} y={218} fs={10.5} bold c="c">
        edge 2–3: low[3] = 4 &gt; disc[2] = 3 ⇒ bridge
      </Txt>
      <Txt x={300} y={240} fs={10.5} soft>
        edge 0–1: low[1] = 1 is not &gt; disc[0] = 1 ⇒ not a bridge
      </Txt>
      <Txt x={300} y={262} fs={10.5} soft>
        vertices 2 and 3 are articulation points — removing either splits the graph
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-bridges',
  num: 6,
  unit: 'Graphs',
  title: 'Bridges, Articulation Points & Cheat Sheet',
  blurb:
    "Tarjan's disc/low machinery for finding single points of failure — plus the complexity table and the problem-to-algorithm map to revise from.",
  minutes: 13,
  tags: ['Advanced', 'Revision'],

  sections: [
    {
      id: 'disc-low',
      heading: 'The tools: discovery time and low-link',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              These are the "single point of failure" questions on <b>undirected</b> graphs. A <b>bridge</b> is an
              edge whose removal disconnects the graph. An <b>articulation point</b> is a <i>vertex</i> whose
              removal disconnects it.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              Bridge = the only cable between two data centres. Articulation point = the one router all traffic must
              pass through. Both are exactly what network engineers hunt for when asking "what breaks us?"
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <code>disc[u]</code> — the "timestamp" when DFS first reached u (1st, 2nd, 3rd…).
            </>,
            <>
              <code>low[u]</code> — the <i>earliest-discovered</i> vertex that u, or anything in u's DFS subtree,
              can reach using at most one back edge.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              Intuition: <code>low[v]</code> answers "can v's subtree sneak back above me without using our tree
              edge?" If it cannot, that edge or vertex is critical.
            </>
          ),
        },
        { k: 'diagram', el: <BridgeGraph />, caption: 'Both conditions read straight off the disc and low values.' },
      ],
    },

    {
      id: 'bridges',
      heading: 'Bridge condition',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Tree edge u–v is a bridge when <code>low[v] &gt; disc[u]</code> — v's subtree has <b>no</b> back edge
              climbing to u or higher, so the edge u–v is its only escape route.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `int timer = 0;
void dfsBridge(vector<vector<int>>& graph, int u, int parent,
               vector<bool>& visited, vector<int>& disc, vector<int>& low) {
    visited[u] = true;
    disc[u] = low[u] = ++timer;
    for (int v : graph[u]) {
        if (v == parent) continue;          // don't go straight back
        if (visited[v]) {
            low[u] = min(low[u], disc[v]);   // back edge
        } else {
            dfsBridge(graph, v, u, visited, disc, low);
            low[u] = min(low[u], low[v]);    // child reports up
            if (low[v] > disc[u])
                cout << "Bridge: " << u << "-" << v << "\\n";
        }
    }
}`,
        },
      ],
    },

    {
      id: 'articulation',
      heading: 'Articulation point conditions',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Non-root u</b> — an articulation point if any child v has <code>low[v] &gt;= disc[u]</code>, since
              v's subtree cannot bypass u. Note the <code>&gt;=</code>, not the <code>&gt;</code> used for bridges:
              reaching back <i>to u itself</i> still means u is the choke point.
            </>,
            <>
              <b>Root of the DFS</b> — an articulation point only if it has <b>two or more DFS children</b>.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) — a single DFS pass handles either problem.
            </>
          ),
        },
      ],
    },

    {
      id: 'cheatsheet',
      heading: 'Complexity at a glance',
      blocks: [
        {
          k: 'table',
          head: ['Algorithm', 'Solves', 'Time', 'Remember'],
          rows: [
            ['BFS', 'Traversal, shortest path (unweighted)', 'O(V + E)', 'Queue; mark visited on add'],
            ['DFS', 'Traversal, reachability, components', 'O(V + E)', 'Recursion; watch stack depth'],
            ['Cycle (undirected)', 'Does a loop exist?', 'O(V + E)', 'DFS + parent trick'],
            ['Cycle (directed)', 'Does a loop exist?', 'O(V + E)', 'DFS + recursion stack'],
            ['Topological sort', 'Ordering a DAG', 'O(V + E)', "DFS post-order stack, or Kahn's indegrees"],
            ['Dijkstra', 'Shortest path, weighted, no negatives', 'O(E log V)', 'Min-heap of (dist, vertex)'],
            [
              'Bellman-Ford',
              'Shortest path with negatives',
              'O(V · E)',
              'Relax all edges V−1 times; extra pass = cycle check',
            ],
            ["Prim's (MST)", 'Cheapest network connecting all', 'O(E log E)', 'Like Dijkstra but push edge weight only'],
            ['Kosaraju (SCC)', 'Mutually reachable groups', 'O(V + E)', 'DFS → transpose → DFS in stack order'],
            [
              'Tarjan bridges / APs',
              'Single points of failure',
              'O(V + E)',
              'disc & low; bridge uses >, articulation uses ≥',
            ],
          ],
        },
      ],
    },

    {
      id: 'which-algorithm',
      heading: 'Which algorithm does this problem want?',
      blocks: [
        {
          k: 'table',
          head: ['The problem says…', 'Reach for'],
          rows: [
            ['"minimum steps / moves / shortest path", unweighted', 'BFS'],
            ['"count islands / regions / provinces"', 'DFS or BFS + a component loop'],
            ['"can all courses be finished" / deadlock', 'Directed cycle detection'],
            ['"valid order given prerequisites"', 'Topological sort'],
            ['"cheapest / fastest route", positive weights', 'Dijkstra'],
            ['negative weights, or "detect negative cycle" / arbitrage', 'Bellman-Ford'],
            ['"minimum cost to connect all points / cities"', "Prim's or Kruskal's (MST)"],
            ['"critical connection / single point of failure"', 'Tarjan bridges / articulation points'],
          ],
        },
      ],
    },

    {
      id: 'practice',
      heading: 'Practice ladder',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Do these in order — each one uses only concepts from earlier topics, so you are never blindsided.
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            <>
              <b>Flood Fill</b> (LC 733) and <b>Number of Islands</b> (LC 200) — grid DFS/BFS
            </>,
            <>
              <b>Rotting Oranges</b> (LC 994) — multi-source BFS
            </>,
            <>
              <b>All Paths From Source to Target</b> (LC 797) — backtracking on a DAG
            </>,
            <>
              <b>Course Schedule</b> (LC 207) and <b>Course Schedule II</b> (LC 210) — cycle detection + topological
              sort
            </>,
            <>
              <b>Network Delay Time</b> (LC 743) — Dijkstra
            </>,
            <>
              <b>Cheapest Flights Within K Stops</b> (LC 787) — Bellman-Ford flavour
            </>,
            <>
              <b>Min Cost to Connect All Points</b> (LC 1584) — MST
            </>,
            <>
              <b>Critical Connections in a Network</b> (LC 1192) — bridges
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why ≥ for articulation points but a strict > for bridges?',
      a: (
        <>
          If v's subtree can climb back exactly to u (<code>low[v] == disc[u]</code>), then the edge u–v is{' '}
          <i>not</i> a bridge — there is another route to u. But removing <i>vertex u itself</i> destroys that route
          too, so u is still an articulation point. Edges and vertices fail differently; explaining this distinction
          cleanly is a strong interview signal.
        </>
      ),
    },
    {
      q: 'Does every bridge endpoint become an articulation point?',
      a: (
        <>
          Only endpoints with degree ≥ 2. A leaf hanging off a bridge disconnects nothing when removed — the bridge
          dies with it.
        </>
      ),
    },
    {
      q: 'Which LeetCode problem tests this directly?',
      a: (
        <>
          LeetCode 1192 "Critical Connections in a Network" is literally "find all bridges" — a frequent question at
          big tech companies.
        </>
      ),
    },
    {
      q: 'A problem says "minimum cost to connect all cities". Which algorithm, and why not Dijkstra?',
      a: (
        <>
          That is an <b>MST</b> — Prim's or Kruskal's. Dijkstra optimises the distance from one source to each
          vertex, which is a different objective: it can pick an expensive edge if it shortens a route. MST
          minimises the <i>total</i> weight of the edges that keep everything connected.
        </>
      ),
    },
    {
      q: 'Every graph algorithm here is O(V + E) except two. Which, and why?',
      a: (
        <>
          <b>Dijkstra</b> is O(E log V) and <b>Prim's</b> is O(E log E), because both use a heap — each edge can
          trigger a push, and every heap operation costs a logarithm. <b>Bellman-Ford</b> is the outlier at O(V·E),
          since it relaxes all E edges V−1 times. Everything driven by a plain BFS or DFS visits each vertex and
          edge once, giving O(V + E).
        </>
      ),
    },
  ],
};

export default topic;
