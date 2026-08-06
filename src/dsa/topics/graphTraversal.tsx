import { Arrow, Box, Dg, Frame, GEdge, GNode, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** BFS spreading out in rings from vertex 0. */
function BfsRings() {
  const P: Record<string, [number, number]> = {
    '0': [70, 110],
    '1': [190, 60],
    '2': [190, 160],
    '3': [320, 40],
    '4': [320, 120],
    '5': [320, 190],
    '6': [450, 110],
  };
  const level: Record<string, 'a' | 'b' | 'c' | 'n'> = {
    '0': 'a',
    '1': 'b',
    '2': 'b',
    '3': 'c',
    '4': 'c',
    '5': 'c',
    '6': 'n',
  };
  const E: [string, string][] = [
    ['0', '1'],
    ['0', '2'],
    ['1', '3'],
    ['1', '4'],
    ['2', '5'],
    ['4', '6'],
    ['5', '6'],
  ];
  return (
    <Dg w={560} h={248} cap="BFS visits every vertex one edge away, then two edges away, and so on">
      {E.map(([a, b]) => (
        <GEdge key={a + b} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} c="n" />
      ))}
      {Object.keys(P).map((k) => (
        <GNode key={k} cx={P[k][0]} cy={P[k][1]} label={k} c={level[k]} />
      ))}
      <Txt x={70} y={222} fs={10.5} bold c="a">
        level 0
      </Txt>
      <Txt x={190} y={222} fs={10.5} bold c="b">
        level 1
      </Txt>
      <Txt x={320} y={222} fs={10.5} bold c="c">
        level 2
      </Txt>
      <Txt x={452} y={222} fs={10.5} soft>
        level 3
      </Txt>
      <Txt x={280} y={20} fs={10.5} soft>
        the queue holds one whole ring at a time — that is why BFS finds the fewest-edge path
      </Txt>
    </Dg>
  );
}

/** DFS diving down one branch before backtracking. */
function DfsDive() {
  const P: Record<string, [number, number]> = {
    '0': [70, 50],
    '1': [190, 50],
    '3': [310, 50],
    '4': [430, 50],
    '2': [70, 150],
    '5': [190, 150],
  };
  return (
    <Dg w={520} h={228} cap="DFS follows one branch to its end, then backtracks to the last junction">
      <GEdge x1={P['0'][0]} y1={P['0'][1]} x2={P['1'][0]} y2={P['1'][1]} c="a" directed />
      <GEdge x1={P['1'][0]} y1={P['1'][1]} x2={P['3'][0]} y2={P['3'][1]} c="a" directed />
      <GEdge x1={P['3'][0]} y1={P['3'][1]} x2={P['4'][0]} y2={P['4'][1]} c="a" directed />
      <GEdge x1={P['0'][0]} y1={P['0'][1]} x2={P['2'][0]} y2={P['2'][1]} c="n" dashed directed />
      <GEdge x1={P['2'][0]} y1={P['2'][1]} x2={P['5'][0]} y2={P['5'][1]} c="n" dashed directed />
      {Object.keys(P).map((k) => (
        <GNode key={k} cx={P[k][0]} cy={P[k][1]} label={k} c={['0', '1', '3', '4'].includes(k) ? 'a' : 'n'} />
      ))}
      <Txt x={250} y={22} fs={10.5} bold c="a">
        1st: dive all the way down this branch
      </Txt>
      <Txt x={150} y={196} fs={10.5} soft>
        2nd: backtrack to 0 and take the other corridor
      </Txt>
      <Txt x={260} y={218} fs={10.5} soft>
        visit order: 0 → 1 → 3 → 4 → (backtrack) → 2 → 5
      </Txt>
    </Dg>
  );
}

/** Queue vs call stack. */
function QueueVsStack() {
  return (
    <Dg w={608} h={210} cap="BFS keeps a wide frontier in a queue; DFS keeps a deep path on the stack">
      <Frame x={2} y={8} w={292} h={194} label="BFS — QUEUE (FIFO)" c="b" />
      <Box x={26} y={70} w={54} h={40} label="1" c="b" fs={12} />
      <Box x={84} y={70} w={54} h={40} label="2" c="b" fs={12} />
      <Box x={142} y={70} w={54} h={40} label="3" c="b" fs={12} />
      <Box x={200} y={70} w={54} h={40} label="4" c="b" fs={12} />
      <Arrow x1={20} y1={90} x2={-6} y2={90} c="b" />
      <Txt x={30} y={54} fs={10} soft>
        out ←
      </Txt>
      <Txt x={228} y={54} fs={10} soft>
        ← in
      </Txt>
      <Txt x={148} y={146} fs={10.5} soft>
        wide: the whole frontier is stored
      </Txt>
      <Txt x={148} y={168} fs={10.5} soft>
        memory grows with the widest level
      </Txt>

      <Frame x={314} y={8} w={292} h={194} label="DFS — STACK (LIFO)" c="a" />
      <Box x={430} y={34} w={64} h={30} label="4" c="a" fs={12} />
      <Box x={430} y={66} w={64} h={30} label="3" c="a" fs={12} />
      <Box x={430} y={98} w={64} h={30} label="1" c="a" fs={12} />
      <Box x={430} y={130} w={64} h={30} label="0" c="a" fs={12} />
      <Arrow x1={512} y1={49} x2={546} y2={49} c="a" both />
      <Txt x={556} y={52} anchor="start" fs={10} soft>
        top
      </Txt>
      <Txt x={370} y={100} fs={10.5} soft>
        deep:
      </Txt>
      <Txt x={370} y={118} fs={10.5} soft>
        one path
      </Txt>
      <Txt x={460} y={186} fs={10.5} soft>
        memory grows with the longest path
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'graph-traversal',
  num: 2,
  unit: 'Graphs',
  title: 'BFS, DFS & All Paths',
  blurb:
    'The two traversals every graph problem is built on — how each one moves, when to pick which, and the backtracking twist that finds every path.',
  minutes: 15,
  free: true,
  tags: ['Very common', 'Foundational'],

  sections: [
    {
      id: 'bfs',
      heading: 'Breadth-First Search (BFS)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              BFS explores the graph <b>level by level</b>: first the start vertex, then everything 1 edge away,
              then everything 2 edges away, and so on. The data structure that makes this happen is a <b>queue</b>{' '}
              (first in, first out).
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              Drop a stone in water — ripples spread outward in rings. BFS is those rings. That is also why BFS
              finds the <b>shortest path in an unweighted graph</b>: the first ring that touches the target used the
              fewest edges.
            </>
          ),
        },
        { k: 'diagram', el: <BfsRings />, caption: 'Colours are BFS levels — the distance in edges from the start.' },
        {
          k: 'ol',
          items: [
            'Put the start vertex into the queue and mark it visited.',
            'Remove the front vertex and process it.',
            'Add all its unvisited neighbours to the queue and mark them visited immediately.',
            'Repeat until the queue is empty.',
          ],
        },
        {
          k: 'code',
          title: 'C++',
          code: `void bfs(vector<vector<int>>& graph, int start, int V) {
    queue<int> q;
    vector<bool> visited(V, false);

    q.push(start);
    visited[start] = true;   // mark when ADDING, not when removing

    while (!q.empty()) {
        int curr = q.front(); q.pop();
        cout << curr << " ";
        for (int next : graph[curr]) {
            if (!visited[next]) {
                visited[next] = true;
                q.push(next);
            }
        }
    }
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) · <b>Space</b> O(V) for the queue plus the visited array.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Common bug',
          text: (
            <>
              Mark vertices visited <b>when you add them to the queue</b>, not when you pop them. Marking on pop
              lets the same vertex enter the queue multiple times and can blow up to exponential work on dense
              graphs.
            </>
          ),
        },
      ],
    },

    {
      id: 'dfs',
      heading: 'Depth-First Search (DFS)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              DFS goes <b>as deep as possible along one branch</b> before backtracking. It is naturally recursive:
              visit a vertex, then recursively visit each unvisited neighbour. The call stack plays the role the
              queue played in BFS.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Real-world picture',
          text: (
            <>
              Exploring a maze with one hand on the wall: keep walking forward until you hit a dead end, then walk
              back to the last junction and try the next corridor.
            </>
          ),
        },
        { k: 'diagram', el: <DfsDive />, caption: 'Solid edges are the first dive; dashed edges are explored after backtracking.' },
        {
          k: 'code',
          title: 'C++',
          code: `void dfs(vector<vector<int>>& graph, int curr, vector<bool>& visited) {
    visited[curr] = true;
    cout << curr << " ";
    for (int next : graph[curr]) {
        if (!visited[next]) {
            dfs(graph, next, visited);
        }
    }
}`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(V + E) · <b>Space</b> O(V) recursion stack (worst case: a long chain).
            </>
          ),
        },
      ],
    },

    {
      id: 'bfs-vs-dfs',
      heading: 'BFS vs DFS — the comparison everyone asks',
      blocks: [
        { k: 'diagram', el: <QueueVsStack />, caption: 'The data structure is the whole difference.' },
        {
          k: 'table',
          head: ['', 'BFS', 'DFS'],
          rows: [
            ['Structure', 'Queue', 'Recursion / stack'],
            ['Explores', 'Level by level', 'One branch fully, then backtrack'],
            [
              'Best for',
              'Shortest path (unweighted), nearest-X, levels',
              'Cycle detection, topological sort, all paths, connected regions',
            ],
            ['Memory shape', 'Wide (whole frontier in the queue)', 'Deep (the current path on the stack)'],
          ],
        },
      ],
    },

    {
      id: 'all-paths',
      heading: 'All paths from source to target',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              "Print <b>every</b> path from src to dest" is the classic <b>backtracking-on-a-graph</b> problem, and
              your first taste of un-marking. Since we need all paths — not just one — a vertex on the current path
              cannot be reused, but must become available again once we backtrack past it.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `// prints every path from src to dest
void allPaths(vector<vector<int>>& graph, vector<bool>& onPath,
              int src, int dest, string path) {
    if (src == dest) {
        cout << path << dest << "\\n";
        return;
    }
    onPath[src] = true;              // choose
    for (int next : graph[src]) {
        if (!onPath[next]) {
            allPaths(graph, onPath, next, dest, path + to_string(src) + "->");
        }
    }
    onPath[src] = false;             // un-choose (BACKTRACK!)
}`,
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'The key insight',
          text: (
            <>
              Plain DFS marks visited <i>forever</i> — fine for "visit each vertex once". All-paths marks a vertex
              only <i>while it is on the current path</i>, then unmarks it so other paths can pass through it.
              Forgetting the unmark line is the number one mistake.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> exponential in the worst case — there can be 2^V distinct paths, so no polynomial
              algorithm exists.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why does BFS give the shortest path in unweighted graphs?',
      a: (
        <>
          BFS visits vertices in increasing order of distance from the source — all distance-1 vertices before any
          distance-2 vertex. So the first time you reach any vertex, you got there via a minimum number of edges.
          Track it with <code>dist[next] = dist[curr] + 1</code>. This breaks for weighted graphs (a 2-edge path of
          weight 1+1 beats a 1-edge path of weight 10) — that is Dijkstra's job.
        </>
      ),
    },
    {
      q: 'What if the graph is disconnected?',
      a: (
        <>
          One BFS only covers the start vertex's component. To touch every vertex, wrap it in a loop:{' '}
          <code>for (int i = 0; i &lt; V; i++) if (!visited[i]) bfs(graph, i, V);</code> Counting how many times
          that loop actually starts a BFS gives the <b>number of connected components</b> — a very common interview
          question.
        </>
      ),
    },
    {
      q: 'What is multi-source BFS?',
      a: (
        <>
          Start BFS with <i>several</i> vertices in the queue at once. Classic problems: "Rotting Oranges" (all
          rotten oranges start together) and "01 Matrix" (distance to the nearest zero). Same code — you just seed
          the queue with all sources before the loop.
        </>
      ),
    },
    {
      q: 'When must I use BFS instead of DFS?',
      a: (
        <>
          Whenever the answer is about the <b>minimum number of steps</b> in an unweighted setting: shortest path,
          minimum moves (knight on a chessboard), word ladder. DFS finds <i>a</i> path, not the shortest one. For
          "does a path exist" or "visit everything", either works.
        </>
      ),
    },
    {
      q: 'Recursive DFS crashes with a stack overflow on big inputs — what do I do?',
      a: (
        <>
          Convert it to iterative DFS using an explicit <code>stack&lt;int&gt;</code>: pop a vertex, if unvisited
          mark and process it, then push its neighbours. Same behaviour, heap-allocated stack, no recursion-depth
          limit.
        </>
      ),
    },
    {
      q: 'Grid DFS: do I need to build an adjacency list first?',
      a: (
        <>
          No — recurse directly on cell coordinates: <code>dfs(r+1, c)</code>, <code>dfs(r-1, c)</code> and so on,
          checking bounds and visited. "Number of Islands", "Flood Fill" and "Max Area of Island" are all this
          pattern.
        </>
      ),
    },
    {
      q: 'LeetCode 797 "All Paths From Source to Target" — why is no visited check needed there?',
      a: (
        <>
          That problem guarantees a <b>DAG</b> (directed acyclic graph). No cycles means no infinite loops, so you
          can drop the <code>onPath</code> bookkeeping entirely. On a general graph you must keep it.
        </>
      ),
    },
  ],
};

export default topic;
