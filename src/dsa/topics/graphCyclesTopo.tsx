import { Arrow, Box, Dg, Frame, GEdge, GNode, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** Undirected: seeing your parent is not a cycle; seeing anyone else is. */
function UndirectedCycle() {
  return (
    <Dg w={560} h={232} cap="In an undirected graph a cycle means meeting a visited vertex that is not your parent">
      <Frame x={2} y={8} w={272} h={214} label="NOT A CYCLE" c="b" />
      <GEdge x1={82} y1={86} x2={192} y2={86} c="b" />
      <GNode cx={82} cy={86} label="0" c="b" />
      <GNode cx={192} cy={86} label="1" c="b" />
      <Txt x={138} y={146} fs={10.5} soft>
        standing on 1, vertex 0 is visited —
      </Txt>
      <Txt x={138} y={164} fs={10.5} soft>
        but 0 is my parent, so ignore it
      </Txt>
      <Txt x={138} y={196} fs={10.5} bold c="b">
        every undirected edge looks like this
      </Txt>

      <Frame x={288} y={8} w={272} h={214} label="REAL CYCLE" c="c" />
      <GEdge x1={362} y1={64} x2={482} y2={64} c="c" />
      <GEdge x1={482} y1={64} x2={422} y2={148} c="c" />
      <GEdge x1={422} y1={148} x2={362} y2={64} c="c" />
      <GNode cx={362} cy={64} label="0" c="c" />
      <GNode cx={482} cy={64} label="1" c="c" />
      <GNode cx={422} cy={148} label="2" c="c" />
      <Txt x={424} y={196} fs={10.5} bold c="c">
        from 2, vertex 0 is visited and is NOT my parent
      </Txt>
    </Dg>
  );
}

/** Directed: only a back edge into the current recursion stack is a cycle. */
function DirectedCycle() {
  return (
    <Dg w={560} h={232} cap="In a directed graph only an edge back into the current recursion stack is a cycle">
      <Frame x={2} y={8} w={272} h={214} label="NOT A CYCLE" c="b" />
      <GEdge x1={80} y1={62} x2={196} y2={104} c="b" directed />
      <GEdge x1={80} y1={148} x2={196} y2={106} c="b" directed />
      <GNode cx={80} cy={62} label="A" c="b" />
      <GNode cx={80} cy={148} label="B" c="b" />
      <GNode cx={198} cy={105} label="C" c="b" />
      <Txt x={138} y={196} fs={10.5} bold c="b">
        two separate paths may legally reach C
      </Txt>

      <Frame x={288} y={8} w={272} h={214} label="CYCLE" c="c" />
      <GEdge x1={358} y1={62} x2={478} y2={62} c="c" directed />
      <GEdge x1={478} y1={62} x2={418} y2={146} c="c" directed />
      <GEdge x1={418} y1={146} x2={358} y2={62} c="c" directed />
      <GNode cx={358} cy={62} label="A" c="c" />
      <GNode cx={478} cy={62} label="B" c="c" />
      <GNode cx={418} cy={146} label="C" c="c" />
      <Txt x={424} y={196} fs={10.5} bold c="c">
        C → A, and A is still on the recursion stack
      </Txt>
    </Dg>
  );
}

/** A DAG and one of its valid linear orders. */
function TopoOrder() {
  return (
    <Dg w={560} h={252} cap="A topological order lines the vertices up so every edge points forward">
      <GEdge x1={64} y1={70} x2={184} y2={44} c="a" directed />
      <GEdge x1={64} y1={70} x2={184} y2={116} c="a" directed />
      <GEdge x1={184} y1={44} x2={304} y2={80} c="a" directed />
      <GEdge x1={184} y1={116} x2={304} y2={80} c="a" directed />
      <GEdge x1={304} y1={80} x2={424} y2={80} c="a" directed />
      <GNode cx={64} cy={70} label="0" c="a" />
      <GNode cx={184} cy={44} label="1" c="a" />
      <GNode cx={184} cy={116} label="2" c="a" />
      <GNode cx={304} cy={80} label="3" c="a" />
      <GNode cx={424} cy={80} label="4" c="a" />
      <Txt x={490} y={84} anchor="start" fs={10.5} soft>
        the DAG
      </Txt>

      <Arrow x1={244} y1={158} x2={244} y2={182} c="c" label="one valid order" dx={72} dy={-6} />

      {['0', '1', '2', '3', '4'].map((v, i) => (
        <Box key={v} x={64 + i * 78} y={186} w={56} h={38} label={v} c="b" fs={13} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={120 + i * 78} y1={205} x2={140 + i * 78} y2={205} c="n" />
      ))}
      <Txt x={280} y={244} fs={10} soft>
        0, 2, 1, 3, 4 would be just as valid — topological order is usually not unique
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-cycles-topo',
  num: 3,
  unit: 'Graphs',
  title: 'Cycle Detection & Topological Sort',
  blurb:
    "Why directed and undirected cycles need different algorithms, and the two ways to flatten a DAG into order — DFS post-order and Kahn's indegrees.",
  minutes: 14,
  tags: ['Very common', 'Course Schedule'],

  sections: [
    {
      id: 'undirected-cycle',
      heading: 'Cycles in an undirected graph',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Directed and undirected graphs need <b>different</b> cycle algorithms — this trips up everyone, and
              interviewers know it.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              In an undirected graph every edge u–v means v also lists u. So seeing your own parent again is{' '}
              <i>not</i> a cycle. A real cycle is: you meet a <b>visited vertex that is not your parent</b>.
            </>
          ),
        },
        { k: 'diagram', el: <UndirectedCycle />, caption: 'The parent check is the entire algorithm.' },
        {
          k: 'code',
          title: 'C++ — DFS + parent trick',
          code: `bool hasCycleUndirected(vector<vector<int>>& graph, vector<bool>& visited,
                        int curr, int parent) {
    visited[curr] = true;
    for (int next : graph[curr]) {
        if (!visited[next]) {
            if (hasCycleUndirected(graph, visited, next, curr)) return true;
        } else if (next != parent) {
            return true;   // visited AND not my parent -> cycle
        }
    }
    return false;
}`,
        },
      ],
    },

    {
      id: 'directed-cycle',
      heading: 'Cycles in a directed graph',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              In a directed graph, meeting a visited vertex is not enough — two separate paths can legally reach the
              same node. A cycle exists only if you reach a vertex that is <b>currently in your own recursion
              stack</b>, i.e. an ancestor of the call you are inside right now.
            </>
          ),
        },
        { k: 'diagram', el: <DirectedCycle />, caption: 'Visited is not enough; you need "still on the stack".' },
        {
          k: 'code',
          title: 'C++ — DFS + recursion stack',
          code: `bool hasCycleDirected(vector<vector<int>>& graph, vector<bool>& visited,
                      vector<bool>& inStack, int curr) {
    visited[curr] = true;
    inStack[curr] = true;
    for (int next : graph[curr]) {
        if (inStack[next]) return true;      // back edge -> cycle
        if (!visited[next] &&
            hasCycleDirected(graph, visited, inStack, next)) return true;
    }
    inStack[curr] = false;   // leaving this call - pop from the "stack"
    return false;
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) for both. Run the search from every unvisited vertex so disconnected pieces are
              covered too.
            </>
          ),
        },
      ],
    },

    {
      id: 'topological-sort',
      heading: 'Topological sort',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>topological order</b> is a line-up of vertices such that every directed edge u → v has u
              appearing <i>before</i> v. It only exists for <b>DAGs</b> — directed graphs with no cycles.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              Getting dressed: socks before shoes, shirt before jacket. Each rule is an edge; a topological sort is
              any valid dressing order. Course prerequisites and build systems (compile A before B) work the same
              way.
            </>
          ),
        },
        { k: 'diagram', el: <TopoOrder />, caption: 'Flatten the DAG so no arrow ever points backwards.' },
        { k: 'h', text: 'Method 1 — DFS + stack' },
        {
          k: 'p',
          text: (
            <>
              Run DFS; <b>after</b> finishing all of a vertex's neighbours, push it onto a stack. Popping the stack
              gives topological order — a vertex is only pushed once everything that must come after it is already
              below it.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `void topoDFS(vector<vector<int>>& graph, vector<bool>& visited,
             int curr, stack<int>& st) {
    visited[curr] = true;
    for (int next : graph[curr])
        if (!visited[next]) topoDFS(graph, visited, next, st);
    st.push(curr);   // push AFTER exploring - that's the whole trick
}`,
        },
        { k: 'h', text: "Method 2 — Kahn's algorithm (BFS)" },
        {
          k: 'ol',
          items: [
            <>
              Compute every vertex's <b>indegree</b> (number of incoming edges).
            </>,
            'Put all vertices with indegree 0 into a queue.',
            'Pop a vertex — it is next in the order. Decrease each neighbour\'s indegree by 1; any that hit 0 join the queue.',
            'If you output fewer than V vertices, the graph has a cycle and no valid order exists.',
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) both ways · Kahn's doubles as cycle detection for free.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: "Why can't I use the parent trick on directed graphs (or the stack trick on undirected)?",
      a: (
        <>
          Directed edges have no automatic reverse edge, so "not my parent" catches false cycles: paths A→C and B→C
          meeting at C is not a cycle, but C would already be visited. Conversely, in an undirected graph every
          single edge would look like a back edge to the recursion stack (u→v, then v sees u in-stack). Different
          edge semantics need different algorithms.
        </>
      ),
    },
    {
      q: 'Can BFS detect cycles too?',
      a: (
        <>
          Yes. <b>Undirected</b>: BFS storing each node's parent — meeting a visited non-parent is a cycle.{' '}
          <b>Directed</b>: <b>Kahn's algorithm</b> — do a BFS topological sort, and if you process fewer than V
          vertices the leftovers form a cycle. Interviewers love asking for this alternative.
        </>
      ),
    },
    {
      q: 'Where does cycle detection show up in real problems?',
      a: (
        <>
          "Course Schedule" (LeetCode 207) — can you finish all courses given the prerequisites? That is exactly
          "does this directed graph have a cycle?". Deadlock detection in operating systems is the same question on
          a wait-for graph.
        </>
      ),
    },
    {
      q: 'Is the topological order unique?',
      a: (
        <>
          Usually not — socks-shirt-shoes and shirt-socks-shoes can both be valid. It is unique only when the DAG
          has a Hamiltonian path (every consecutive pair connected). For the lexicographically smallest order, use
          Kahn's with a min-heap (<code>priority_queue</code>) instead of a plain queue.
        </>
      ),
    },
    {
      q: "DFS-based or Kahn's — which should I use in an interview?",
      a: (
        <>
          Either is accepted; know both. Kahn's is often safer: it is iterative (no stack-overflow risk) and detects
          cycles automatically, which "Course Schedule II" requires anyway.
        </>
      ),
    },
  ],
};

export default topic;
