import { Dg, GEdge, GNode, Rel, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** A weighted graph plus the distance table Dijkstra produces. */
function DijkstraRun() {
  const P: Record<string, [number, number]> = {
    S: [60, 100],
    A: [180, 46],
    B: [180, 156],
    C: [310, 100],
    D: [430, 100],
  };
  return (
    <Dg w={600} h={252} cap="Dijkstra expands the closest unfinished vertex next, using a min-heap">
      <GEdge x1={P.S[0]} y1={P.S[1]} x2={P.A[0]} y2={P.A[1]} c="n" w={4} wdy={-10} />
      <GEdge x1={P.S[0]} y1={P.S[1]} x2={P.B[0]} y2={P.B[1]} c="n" w={1} wdy={16} />
      <GEdge x1={P.B[0]} y1={P.B[1]} x2={P.A[0]} y2={P.A[1]} c="n" w={2} wdx={-16} />
      <GEdge x1={P.A[0]} y1={P.A[1]} x2={P.C[0]} y2={P.C[1]} c="n" w={5} wdy={-10} />
      <GEdge x1={P.B[0]} y1={P.B[1]} x2={P.C[0]} y2={P.C[1]} c="n" w={8} wdy={16} />
      <GEdge x1={P.C[0]} y1={P.C[1]} x2={P.D[0]} y2={P.D[1]} c="n" w={3} wdy={-10} />
      {Object.keys(P).map((k) => (
        <GNode key={k} cx={P[k][0]} cy={P[k][1]} label={k} c={k === 'S' ? 'c' : 'a'} />
      ))}
      <Txt x={60} y={140} fs={10} bold c="c">
        source
      </Txt>

      <Rel
        x={470}
        y={30}
        title="dist[]"
        cols={['v', 'dist']}
        rows={[
          ['S', '0'],
          ['A', '3'],
          ['B', '1'],
          ['C', '8'],
          ['D', '11'],
        ]}
        cw={[46, 56]}
        c="b"
      />
      <Txt x={280} y={222} fs={10.5} soft>
        A is reached via B (1 + 2 = 3), not directly (4) — relaxation found the better route
      </Txt>
      <Txt x={280} y={242} fs={10.5} soft>
        C is reached via A (3 + 5 = 8), beating B → C (1 + 8 = 9)
      </Txt>
    </Dg>
  );
}

/** Why Dijkstra breaks when an edge is negative. */
function NegativeEdge() {
  return (
    <Dg w={520} h={216} cap="Dijkstra finalises A at 2 and never revisits it, missing the true shortest path of 1">
      <GEdge x1={70} y1={104} x2={210} y2={50} c="n" w={2} wdy={-10} />
      <GEdge x1={70} y1={104} x2={210} y2={160} c="n" w={5} wdy={18} />
      <GEdge x1={210} y1={160} x2={210} y2={52} c="c" w={-4} wdx={22} wdy={4} directed />
      <GNode cx={70} cy={104} label="S" c="c" />
      <GNode cx={210} cy={50} label="A" c="a" />
      <GNode cx={210} cy={160} label="B" c="a" />

      <Txt x={370} y={62} anchor="start" fs={11} bold c="c">
        Dijkstra says dist[A] = 2
      </Txt>
      <Txt x={370} y={84} anchor="start" fs={10.5} soft>
        it pops A first and freezes it
      </Txt>
      <Txt x={370} y={122} anchor="start" fs={11} bold c="b">
        truth: 5 + (−4) = 1
      </Txt>
      <Txt x={370} y={144} anchor="start" fs={10.5} soft>
        via B — but A was already final
      </Txt>
      <Txt x={260} y={200} fs={10.5} bold c="c">
        negative weights ⇒ use Bellman-Ford
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-shortest-paths',
  num: 4,
  unit: 'Graphs',
  title: "Dijkstra & Bellman-Ford",
  blurb:
    'Shortest paths once edges have weights — the greedy min-heap algorithm, why it breaks on negative edges, and the slower one that survives them.',
  minutes: 15,
  tags: ['Very common', 'Weighted graphs'],

  sections: [
    {
      id: 'dijkstra',
      heading: "Dijkstra's algorithm",
      blocks: [
        {
          k: 'p',
          text: (
            <>
              BFS finds shortest paths when every edge costs the same. When edges have <b>weights</b>, you need
              Dijkstra: it computes the minimum total weight from one source to <i>every</i> vertex, by always
              expanding the <b>closest unfinished vertex next</b> using a priority queue (min-heap).
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            <>
              Set <code>dist[source] = 0</code> and every other distance to infinity. Push (0, source) into a
              min-heap.
            </>,
            'Pop the vertex with the smallest distance. If it is already finalised, skip it.',
            <>
              <b>Relax</b> each outgoing edge: if <code>dist[u] + weight &lt; dist[v]</code>, update{' '}
              <code>dist[v]</code> and push (dist[v], v).
            </>,
            <>
              Repeat until the heap is empty. <code>dist[]</code> now holds all shortest distances.
            </>,
          ],
        },
        { k: 'diagram', el: <DijkstraRun />, caption: 'Relaxation is the only operation — everything else is bookkeeping.' },
        {
          k: 'code',
          title: 'C++',
          code: `vector<int> dijkstra(vector<vector<Edge>>& graph, int src, int V) {
    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    // pair = {distance, vertex}, min-heap ordered by distance
    priority_queue<pair<int,int>, vector<pair<int,int>>,
                   greater<>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;          // stale entry, skip
        for (Edge& e : graph[u]) {
            if (dist[u] + e.wt < dist[e.dest]) {
                dist[e.dest] = dist[u] + e.wt;   // relaxation
                pq.push({dist[e.dest], e.dest});
            }
        }
    }
    return dist;
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(E log V) with a binary heap · <b>Space</b> O(V).
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'The famous limitation',
          text: (
            <>
              Dijkstra <b>fails with negative edge weights</b>. Its greedy promise — "once popped with the smallest
              distance, a vertex is final" — breaks if a later negative edge could still shorten the path. Negative
              weights mean you need Bellman-Ford.
            </>
          ),
        },
        { k: 'diagram', el: <NegativeEdge />, caption: 'The counterexample worth memorising: S→A (2), S→B (5), B→A (−4).' },
      ],
    },

    {
      id: 'bellman-ford',
      heading: 'Bellman-Ford algorithm',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Bellman-Ford solves the same single-source shortest path problem, but survives <b>negative edge
              weights</b>. The idea is almost brute force: relax <b>every edge in the graph, V−1 times</b>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Why V−1? A shortest path can use at most V−1 edges (more would repeat a vertex). Each full pass
              guarantees all shortest paths using one more edge are correct — so after V−1 passes, everything is.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `vector<int> bellmanFord(vector<Edge>& edges, int src, int V) {
    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    for (int i = 0; i < V - 1; i++) {          // V-1 rounds
        for (Edge& e : edges) {                // relax EVERY edge
            if (dist[e.src] != INT_MAX
                && dist[e.src] + e.wt < dist[e.dest]) {
                dist[e.dest] = dist[e.src] + e.wt;
            }
        }
    }
    // one EXTRA round: if anything still improves -> negative cycle
    for (Edge& e : edges) {
        if (dist[e.src] != INT_MAX
            && dist[e.src] + e.wt < dist[e.dest]) {
            cout << "Negative weight cycle!\\n";
        }
    }
    return dist;
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V · E) — slower than Dijkstra's O(E log V), which is the price of handling negatives.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Negative edge ≠ negative cycle',
          text: (
            <>
              Negative <i>edges</i> are fine for Bellman-Ford. A negative <i>cycle</i> — a loop whose weights sum
              below zero — makes "shortest path" meaningless, since you could loop forever dropping the cost each
              lap. Bellman-Ford cannot fix that, but it <b>detects</b> it with the extra V-th pass.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Situation', 'Algorithm'],
          rows: [
            ['Unweighted graph', 'BFS'],
            ['Weighted, all weights non-negative', 'Dijkstra'],
            ['Any negative weights, or you must detect a negative cycle', 'Bellman-Ford'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why exactly does Dijkstra fail on negative weights? (top interview question)',
      a: (
        <>
          Dijkstra finalises a vertex the moment it is popped, assuming no future path can beat it — true only when
          all remaining edges can only <i>add</i> cost. A negative edge discovered later could produce a shorter
          path to an already-finalised vertex, but Dijkstra never revisits. Example: S→A (2), S→B (5), B→A (−4).
          Dijkstra finalises A at 2, but the real shortest is 5 + (−4) = 1.
        </>
      ),
    },
    {
      q: 'How do I recover the actual path, not just the distance?',
      a: (
        <>
          Keep a <code>parent[]</code> array: whenever you relax an edge u→v, set <code>parent[v] = u</code>.
          Afterwards walk backwards from the destination via parents and reverse the result.
        </>
      ),
    },
    {
      q: 'BFS vs Dijkstra vs Bellman-Ford — one-line answer?',
      a: (
        <>
          Unweighted → BFS. Weighted, non-negative → Dijkstra. Weighted with negatives (or you need to detect
          negative cycles) → Bellman-Ford.
        </>
      ),
    },
    {
      q: "Don't forget the infinity guard — why does Bellman-Ford need it?",
      a: (
        <>
          <code>dist[e.src] != INT_MAX</code> must be checked before adding, or <code>INT_MAX + weight</code>{' '}
          overflows into a huge negative number and corrupts every distance. Interviewers watch for this line.
        </>
      ),
    },
    {
      q: 'Where is Bellman-Ford used in the real world?',
      a: (
        <>
          Distance-vector routing protocols like RIP are distributed Bellman-Ford, and currency-arbitrage detection
          maps exchange rates to edge weights — take −log of the rates, and a negative cycle is a risk-free profit
          loop.
        </>
      ),
    },
    {
      q: 'What about "Cheapest Flights Within K Stops"?',
      a: (
        <>
          LeetCode 787 is Bellman-Ford with exactly <b>K+1 rounds</b> instead of V−1, using a copy of{' '}
          <code>dist</code> per round so each round adds at most one edge to any path. A favourite follow-up
          question.
        </>
      ),
    },
  ],
};

export default topic;
