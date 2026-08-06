import { Dg, GEdge, GNode, Rel, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** A small undirected graph with edge/vertex labelled. */
function SimpleGraph() {
  const P = {
    0: [70, 55],
    1: [175, 38],
    2: [130, 122],
    3: [275, 80],
    4: [360, 48],
  } as const;
  const e = (a: keyof typeof P, b: keyof typeof P) => (
    <GEdge key={`${a}${b}`} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} c="n" />
  );
  return (
    <Dg w={440} h={170} cap="A graph with five vertices and five edges">
      {e(0, 1)}
      {e(0, 2)}
      {e(1, 2)}
      {e(1, 3)}
      {e(3, 4)}
      {(Object.keys(P) as unknown as (keyof typeof P)[]).map((k) => (
        <GNode key={k} cx={P[k][0]} cy={P[k][1]} label={k} c="a" />
      ))}
      <Txt x={112} y={30} fs={10.5} soft>
        edge
      </Txt>
      <Txt x={392} y={72} fs={10.5} soft>
        vertex
      </Txt>
      <Txt x={220} y={158} fs={10.5} soft>
        V = 5 vertices · E = 5 edges · vertices are numbered 0 … V−1
      </Txt>
    </Dg>
  );
}

/** Undirected vs directed vs weighted, on the same three vertices. */
function GraphFlavours() {
  const panel = (fx: number, title: string, directed: boolean, weighted: boolean) => {
    const a: [number, number] = [fx + 40, 78];
    const b: [number, number] = [fx + 150, 50];
    const c: [number, number] = [fx + 120, 140];
    return (
      <g key={title}>
        <Txt x={fx + 96} y={24} fs={11} bold c="a">
          {title}
        </Txt>
        <GEdge x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} c="n" directed={directed} w={weighted ? 4 : undefined} />
        <GEdge
          x1={b[0]}
          y1={b[1]}
          x2={c[0]}
          y2={c[1]}
          c="n"
          directed={directed}
          w={weighted ? 7 : undefined}
          wdx={16}
          wdy={0}
        />
        <GEdge x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} c="n" directed={directed} w={weighted ? 2 : undefined} wdx={-14} />
        <GNode cx={a[0]} cy={a[1]} label="A" c="a" r={16} />
        <GNode cx={b[0]} cy={b[1]} label="B" c="a" r={16} />
        <GNode cx={c[0]} cy={c[1]} label="C" c="a" r={16} />
      </g>
    );
  };
  return (
    <Dg w={620} h={196} cap="The same three vertices as an undirected, directed and weighted graph">
      {panel(0, 'UNDIRECTED', false, false)}
      {panel(206, 'DIRECTED', true, false)}
      {panel(412, 'WEIGHTED', false, true)}
      <Txt x={100} y={182} fs={10} soft>
        friendship — both ways
      </Txt>
      <Txt x={306} y={182} fs={10} soft>
        following — one way
      </Txt>
      <Txt x={512} y={182} fs={10} soft>
        distance / cost / time
      </Txt>
    </Dg>
  );
}

/** Adjacency list vs adjacency matrix for the same graph. */
function ListVsMatrix() {
  return (
    <Dg w={620} h={252} cap="Edges (0–1), (0–2), (1–3), (2–3) stored as a list and as a matrix">
      <Txt x={96} y={22} fs={11} bold c="a">
        THE GRAPH
      </Txt>
      <GEdge x1={60} y1={70} x2={140} y2={70} c="n" r={16} />
      <GEdge x1={60} y1={70} x2={60} y2={150} c="n" r={16} />
      <GEdge x1={140} y1={70} x2={140} y2={150} c="n" r={16} />
      <GEdge x1={60} y1={150} x2={140} y2={150} c="n" r={16} />
      <GNode cx={60} cy={70} label="0" c="a" r={16} />
      <GNode cx={140} cy={70} label="1" c="a" r={16} />
      <GNode cx={60} cy={150} label="2" c="a" r={16} />
      <GNode cx={140} cy={150} label="3" c="a" r={16} />

      <Txt x={300} y={22} fs={11} bold c="b">
        ADJACENCY LIST
      </Txt>
      <Rel
        x={222}
        y={40}
        cols={['vertex', 'neighbours']}
        rows={[
          ['0', '1, 2'],
          ['1', '0, 3'],
          ['2', '0, 3'],
          ['3', '1, 2'],
        ]}
        cw={[70, 88]}
        c="b"
      />
      <Txt x={300} y={200} fs={10} soft>
        O(V + E) space
      </Txt>
      <Txt x={300} y={218} fs={10} soft>
        fast to loop over neighbours
      </Txt>

      <Txt x={508} y={22} fs={11} bold c="c">
        ADJACENCY MATRIX
      </Txt>
      <Rel
        x={420}
        y={40}
        cols={['', '0', '1', '2', '3']}
        rows={[
          ['0', '0', '1', '1', '0'],
          ['1', '1', '0', '0', '1'],
          ['2', '1', '0', '0', '1'],
          ['3', '0', '1', '1', '0'],
        ]}
        cw={[36, 36, 36, 36, 36]}
        c="c"
      />
      <Txt x={510} y={200} fs={10} soft>
        O(V²) space
      </Txt>
      <Txt x={510} y={218} fs={10} soft>
        O(1) "is u–v an edge?"
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-basics',
  num: 1,
  unit: 'Graphs',
  title: 'Graph Basics & Representations',
  blurb:
    'Vertices, edges and the vocabulary interviewers use — then the four ways to actually store a graph in memory, and when to pick each.',
  minutes: 13,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'what-is-a-graph',
      heading: 'What is a graph?',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>graph</b> is a collection of <b>vertices</b> (also called nodes) connected by <b>edges</b>. That
              is the whole definition. A vertex is a "thing", and an edge is a "relationship between two things".
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              Google Maps is a graph: cities are vertices, roads are edges. Instagram is a graph: people are
              vertices, "follows" are edges. Your course prerequisites, the internet, flight routes — all graphs.
            </>
          ),
        },
        { k: 'diagram', el: <SimpleGraph />, caption: 'A graph with 5 vertices (V = 5) and 5 edges (E = 5).' },
        { k: 'h', text: 'Vocabulary you must know' },
        { k: 'diagram', el: <GraphFlavours />, caption: 'The three flavours that change which algorithm you reach for.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Undirected graph</b> — edges go both ways. If A is friends with B, B is friends with A. (Facebook
              friendship)
            </>,
            <>
              <b>Directed graph (digraph)</b> — edges have a direction, drawn as arrows. A follows B does not mean B
              follows A. (Instagram)
            </>,
            <>
              <b>Weighted graph</b> — each edge carries a number (cost, distance, time). Roads between cities have
              lengths.
            </>,
            <>
              <b>Unweighted graph</b> — all edges are equal; you only care whether a connection exists.
            </>,
            <>
              <b>Degree</b> — the number of edges touching a vertex. Directed graphs split this into{' '}
              <i>indegree</i> (arrows in) and <i>outdegree</i> (arrows out).
            </>,
            <>
              <b>Path</b> — a sequence of vertices connected by edges, like 0 → 1 → 3 → 4.
            </>,
            <>
              <b>Cycle</b> — a path that starts and ends at the same vertex.
            </>,
            <>
              <b>Connected component</b> — a group of vertices that can all reach each other. A graph may be several
              disconnected islands.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Trees vs graphs',
          text: (
            <>
              A tree is just a special graph: connected, with no cycles, and exactly V−1 edges. Every tree is a
              graph, but not every graph is a tree. Graphs can have cycles, disconnected pieces, and multiple paths
              between the same two nodes — that is why graph algorithms need a <code>visited</code> array and tree
              algorithms do not.
            </>
          ),
        },
      ],
    },

    {
      id: 'representations',
      heading: 'Creating a graph — four ways',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The computer cannot see your drawing — you must store the graph in memory. There are four standard
              ways. Take this graph as the running example: edges (0–1), (0–2), (1–3), (2–3).
            </>
          ),
        },
        { k: 'diagram', el: <ListVsMatrix />, caption: 'The two representations that matter in practice.' },
        { k: 'h', text: 'Way 1 — Adjacency list (the default, use this 95% of the time)' },
        {
          k: 'p',
          text: (
            <>
              For every vertex, keep a list of its neighbours. In C++, a <code>vector&lt;vector&lt;int&gt;&gt;</code>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `int V = 4;
vector<vector<int>> graph(V);

// undirected edge u-v: add BOTH directions
void addEdge(int u, int v) {
    graph[u].push_back(v);
    graph[v].push_back(u);   // remove this line for a directed graph
}`,
        },
        {
          k: 'p',
          text: (
            <>
              For <b>weighted</b> graphs, store a tiny <code>Edge</code> struct instead of a plain integer:
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++ — weighted',
          code: `struct Edge {
    int src, dest, wt;
};
vector<vector<Edge>> graph;   // graph[u] = all edges leaving u`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Space</b> O(V + E) · <b>"Is v a neighbour of u?"</b> O(degree of u) · <b>Looping over
              neighbours</b> is fast.
            </>
          ),
        },
        { k: 'h', text: 'Way 2 — Adjacency matrix' },
        {
          k: 'p',
          text: (
            <>
              A V×V grid where <code>mat[u][v] = 1</code> (or the weight) if the edge exists.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `vector<vector<int>> mat(V, vector<int>(V, 0));
mat[0][1] = 1; mat[1][0] = 1;   // undirected edge 0-1`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Space</b> O(V²) — wasteful for sparse graphs · <b>"Is v a neighbour of u?"</b> O(1) — its one
              superpower.
            </>
          ),
        },
        { k: 'h', text: 'Way 3 — Edge list' },
        {
          k: 'p',
          text: (
            <>
              Just a flat list of all edges: <code>[(0,1), (0,2), (1,3), (2,3)]</code>. Barely usable for
              traversal, but exactly what <b>Bellman-Ford</b> and Kruskal's algorithm want, because they loop over
              "every edge" directly.
            </>
          ),
        },
        { k: 'h', text: 'Way 4 — Map of sets (for non-integer vertices)' },
        {
          k: 'p',
          text: (
            <>
              When vertices are strings ("Delhi", "Mumbai") instead of 0…V−1, use an{' '}
              <code>unordered_map&lt;string, unordered_set&lt;string&gt;&gt;</code>. Same idea as an adjacency
              list, keyed by name.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Undirected vs directed: how does it change the code?',
      a: (
        <>
          In an undirected graph, one edge (u, v) is stored <b>twice</b> in an adjacency list: v in u's list, and u
          in v's list. In a directed graph it is stored once. Nearly every bug beginners hit here is forgetting to
          add the reverse edge for undirected graphs.
        </>
      ),
    },
    {
      q: 'Why do graph problems always need a visited array?',
      a: (
        <>
          Because graphs can contain cycles. Without <code>visited</code>, a traversal walking 0 → 1 → 2 → 0 → 1 →
          2 … loops forever. Marking each vertex as visited the first time you see it guarantees every vertex is
          processed exactly once.
        </>
      ),
    },
    {
      q: 'What does "sparse" vs "dense" mean?',
      a: (
        <>
          A sparse graph has few edges relative to vertices (E close to V); a dense graph has many (E close to V²).
          This choice drives which representation you use: adjacency lists for sparse (almost always in
          interviews), matrices only for small or dense graphs.
        </>
      ),
    },
    {
      q: 'Interview classic: adjacency list vs adjacency matrix — when to use which?',
      a: (
        <>
          <b>List</b>: O(V+E) space, fast iteration over neighbours — the default for interviews since most
          problems are sparse. <b>Matrix</b>: O(V²) space but O(1) edge lookup — pick it when the graph is dense, V
          is small (≤ ~1000), or the problem repeatedly asks "does edge (u,v) exist?". Grid problems (islands,
          maze) are implicitly a matrix already.
        </>
      ),
    },
    {
      q: 'How do I represent a grid or maze as a graph?',
      a: (
        <>
          You do not build anything — each cell (r, c) is a vertex and its up/down/left/right cells are its
          neighbours, computed on the fly with a directions array:{' '}
          <code>int dirs[4][2] = {'{{-1,0},{1,0},{0,-1},{0,1}}'}</code>. "Number of Islands" is BFS/DFS on this
          implicit graph.
        </>
      ),
    },
  ],
};

export default topic;
