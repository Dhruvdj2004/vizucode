import { Dg, Frame, GEdge, GNode, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** A weighted graph and the MST edges picked out of it. */
function MstPick() {
  const P: Record<string, [number, number]> = {
    A: [70, 60],
    B: [200, 40],
    C: [200, 150],
    D: [330, 95],
  };
  const panel = (fx: number, chosen: string[]) => {
    const at = (k: string): [number, number] => [P[k][0] + fx, P[k][1]];
    const edge = (a: string, b: string, w: number, dy?: number, dx?: number) => {
      const on = chosen.includes(a + b) || chosen.includes(b + a);
      return (
        <GEdge
          key={a + b + fx}
          x1={at(a)[0]}
          y1={at(a)[1]}
          x2={at(b)[0]}
          y2={at(b)[1]}
          c={on ? 'b' : 'n'}
          w={w}
          wdy={dy}
          wdx={dx}
          dashed={!on && chosen.length > 0}
        />
      );
    };
    return (
      <g key={fx}>
        {edge('A', 'B', 1, -10)}
        {edge('A', 'C', 4, 16)}
        {edge('B', 'C', 3, 0, 18)}
        {edge('B', 'D', 5, -10)}
        {edge('C', 'D', 2, 16)}
        {Object.keys(P).map((k) => (
          <GNode key={k + fx} cx={at(k)[0]} cy={at(k)[1]} label={k} c="a" r={16} />
        ))}
      </g>
    );
  };
  return (
    <Dg w={800} h={228} cap="Every vertex connected, no cycle, smallest total weight">
      <Frame x={2} y={8} w={392} h={210} label="THE GRAPH" c="n" />
      {panel(20, [])}
      <Txt x={198} y={200} fs={10.5} soft>
        5 weighted edges
      </Txt>

      <Frame x={406} y={8} w={392} h={210} label="MINIMUM SPANNING TREE" c="b" />
      {panel(424, ['AB', 'BC', 'CD'])}
      <Txt x={602} y={200} fs={10.5} bold c="b">
        AB + BC + CD = 1 + 3 + 2 = 6 · exactly V−1 = 3 edges
      </Txt>
    </Dg>
  );
}

/** Dijkstra pushes cumulative distance; Prim pushes the single edge weight. */
function DijkstraVsPrim() {
  return (
    <Dg w={608} h={196} cap="Same heap, different priority — that is the whole difference">
      <Frame x={2} y={8} w={292} h={180} label="DIJKSTRA" c="a" />
      <Txt x={148} y={54} fs={12} bold c="a">
        pq.push(dist[u] + weight)
      </Txt>
      <Txt x={148} y={88} fs={10.5} soft>
        minimises total distance
      </Txt>
      <Txt x={148} y={106} fs={10.5} soft>
        from the source
      </Txt>
      <Txt x={148} y={148} fs={11} bold c="c">
        "cheapest route to everywhere"
      </Txt>

      <Frame x={314} y={8} w={292} h={180} label="PRIM'S" c="b" />
      <Txt x={460} y={54} fs={12} bold c="b">
        pq.push(weight)
      </Txt>
      <Txt x={460} y={88} fs={10.5} soft>
        minimises the single edge
      </Txt>
      <Txt x={460} y={106} fs={10.5} soft>
        that joins the tree
      </Txt>
      <Txt x={460} y={148} fs={11} bold c="c">
        "cheapest network overall"
      </Txt>
    </Dg>
  );
}

/** Two SCCs joined by a one-way bridge edge. */
function SccGraph() {
  return (
    <Dg w={560} h={224} cap="A⇄B and C⇄D are strongly connected; the edge B→C is not inside either">
      <rect x={22} y={38} width={186} height={130} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="6 5" />
      <rect x={330} y={38} width={186} height={130} rx={14} fill="var(--accent-2-soft)" stroke="var(--accent-2)" strokeWidth="1.4" strokeDasharray="6 5" />
      <Txt x={115} y={30} fs={10.5} bold c="a">
        SCC 1
      </Txt>
      <Txt x={423} y={30} fs={10.5} bold c="b">
        SCC 2
      </Txt>

      <GEdge x1={72} y1={78} x2={158} y2={78} c="a" directed />
      <GEdge x1={158} y1={128} x2={72} y2={128} c="a" directed />
      <GNode cx={72} cy={78} label="A" c="a" />
      <GNode cx={158} cy={128} label="B" c="a" />

      <GEdge x1={380} y1={78} x2={466} y2={78} c="b" directed />
      <GEdge x1={466} y1={128} x2={380} y2={128} c="b" directed />
      <GNode cx={380} cy={78} label="C" c="b" />
      <GNode cx={466} cy={128} label="D" c="b" />

      <GEdge x1={158} y1={128} x2={380} y2={78} c="c" directed />
      <Txt x={268} y={92} fs={10.5} bold c="c">
        B → C
      </Txt>
      <Txt x={268} y={196} fs={10.5} soft>
        C cannot get back to B, so this bridge edge belongs to no SCC
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-mst-scc',
  num: 5,
  unit: 'Graphs',
  title: "MST, Prim's & Kosaraju's SCC",
  blurb:
    "The cheapest way to connect everything, why Prim's looks like Dijkstra but isn't, and the two-pass DFS that finds strongly connected components.",
  minutes: 14,
  tags: ['Very common', 'Greedy'],

  sections: [
    {
      id: 'mst',
      heading: 'Minimum Spanning Tree',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>spanning tree</b> of a connected, undirected, weighted graph is a subset of edges that connects
              all V vertices with exactly V−1 edges and no cycles. The <b>minimum</b> spanning tree (MST) is the
              spanning tree whose total edge weight is smallest.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              You must lay internet cable so every village is connected, and cable costs money. The MST is the
              cheapest wiring plan that still reaches everyone. Same for electric grids and network design.
            </>
          ),
        },
        { k: 'diagram', el: <MstPick />, caption: 'Dashed edges were rejected; solid teal edges form the MST.' },
      ],
    },

    {
      id: 'prims',
      heading: "Prim's algorithm — grow the tree greedily",
      blocks: [
        {
          k: 'ol',
          items: [
            "Start with any vertex — it is your tree so far.",
            <>
              Look at all edges from the tree to outside vertices; pick the <b>cheapest</b> one (min-heap).
            </>,
            'Add that edge and its new vertex to the tree.',
            'Repeat until all V vertices are in. Skip any popped vertex already in the tree.',
          ],
        },
        {
          k: 'code',
          title: 'C++',
          code: `int primsMST(vector<vector<Edge>>& graph, int V) {
    vector<bool> inMST(V, false);
    // pair = {cost to reach, vertex}, min-heap
    priority_queue<pair<int,int>, vector<pair<int,int>>,
                   greater<>> pq;
    pq.push({0, 0});
    int totalCost = 0;

    while (!pq.empty()) {
        auto [cost, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;      // already inside, skip
        inMST[u] = true;
        totalCost += cost;
        for (Edge& e : graph[u])
            if (!inMST[e.dest])
                pq.push({e.wt, e.dest});
    }
    return totalCost;
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(E log E) with a heap. It looks like Dijkstra, but it pushes the <b>edge weight</b>, not
              a cumulative distance.
            </>
          ),
        },
        { k: 'diagram', el: <DijkstraVsPrim />, caption: 'One line of code separates the two algorithms.' },
      ],
    },

    {
      id: 'scc',
      heading: "Strongly Connected Components — Kosaraju's algorithm",
      blocks: [
        {
          k: 'p',
          text: (
            <>
              In a <b>directed</b> graph, a <b>strongly connected component (SCC)</b> is a maximal group of vertices
              where every vertex can reach every other vertex <i>following arrow directions</i>. Kosaraju's finds
              all SCCs with two DFS passes.
            </>
          ),
        },
        { k: 'diagram', el: <SccGraph />, caption: 'Mutual reachability is the test — not merely being linked.' },
        {
          k: 'ol',
          items: [
            <>
              <b>First DFS</b> — run DFS over the whole graph, pushing each vertex onto a stack <i>after</i> its DFS
              finishes (exactly like topological sort).
            </>,
            <>
              <b>Transpose</b> — build the reversed graph by flipping the direction of every edge.
            </>,
            <>
              <b>Second DFS</b> — pop vertices off the stack; for each unvisited one, DFS it in the{' '}
              <i>transposed</i> graph. Every vertex that DFS reaches forms one complete SCC.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Why it works, in one breath',
          text: (
            <>
              Inside an SCC, reversing edges changes nothing — everyone can still reach everyone. But reversing
              kills the one-way roads <i>between</i> SCCs. The stack order guarantees you start each second-pass DFS
              in a "source" SCC, so the traversal cannot leak into a different component.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) — two DFS passes plus building the transpose.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: "Dijkstra vs Prim's — they look identical. What's the difference? (huge interview favourite)",
      a: (
        <>
          Both greedily pop from a min-heap, but the priority differs. <b>Dijkstra</b> minimises the <i>total
          distance from the source</i>, pushing <code>dist[u] + weight</code>. <b>Prim's</b> minimises <i>the single
          connecting edge</i>, pushing just <code>weight</code>. Dijkstra answers "cheapest route", Prim's answers
          "cheapest network".
        </>
      ),
    },
    {
      q: "What is Kruskal's algorithm and when do I pick it over Prim's?",
      a: (
        <>
          Kruskal's sorts all edges by weight and adds each cheapest edge that does not form a cycle, using a
          Disjoint Set Union (Union-Find). Same MST result, same O(E log E) class. Kruskal's is nicer when you
          already have an edge list or the graph is sparse; Prim's when you have adjacency lists. Know both names.
        </>
      ),
    },
    {
      q: 'Is the MST unique?',
      a: (
        <>
          If all edge weights are distinct — yes, exactly one MST. With ties, multiple MSTs can exist, all having
          the same total weight.
        </>
      ),
    },
    {
      q: 'Connected component vs strongly connected component?',
      a: (
        <>
          "Connected component" is an undirected idea — linked, ignoring direction. "Strongly connected" is directed
          — mutual reachability along the arrows. A directed graph can look connected as a drawing yet have many
          SCCs.
        </>
      ),
    },
    {
      q: 'Why does Kosaraju need the transpose at all?',
      a: (
        <>
          A single DFS from a source SCC would flood across B→C-style bridge edges and merge components. In the
          transpose those bridges point backwards, so a DFS started inside one SCC is trapped exactly within it —
          which is precisely what we want to count.
        </>
      ),
    },
    {
      q: 'Is there a one-pass alternative to Kosaraju?',
      a: (
        <>
          Yes — <b>Tarjan's SCC algorithm</b> does it in a single DFS using discovery times and low-link values (the
          same machinery as bridges and articulation points). Kosaraju's is easier to explain; know Tarjan's by
          name.
        </>
      ),
    },
  ],
};

export default topic;
