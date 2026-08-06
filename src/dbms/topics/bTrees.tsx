import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** A B+ tree: keys in internal nodes, data in chained leaves. */
function BPlusTree() {
  const leaves = [
    { x: 14, k: '5 · 8' },
    { x: 116, k: '10 · 15' },
    { x: 218, k: '20 · 25' },
    { x: 320, k: '30 · 35' },
    { x: 422, k: '40 · 45' },
    { x: 524, k: '50 · 60' },
  ];
  return (
    <Dg w={620} h={296} cap="A B+ tree: internal nodes route, leaves hold every key and are chained together">
      <Box x={265} y={16} w={90} h={36} label="30" c="c" fs={13} />
      <Txt x={392} y={38} anchor="start" fs={10} soft>
        root
      </Txt>

      <Box x={120} y={96} w={110} h={36} label="10 · 20" c="a" fs={12} />
      <Box x={390} y={96} w={110} h={36} label="40 · 50" c="a" fs={12} />
      <Txt x={540} y={118} anchor="start" fs={10} soft>
        internal
      </Txt>

      <Arrow x1={300} y1={52} x2={180} y2={94} c="n" />
      <Arrow x1={320} y1={52} x2={440} y2={94} c="n" />
      <Arrow x1={140} y1={132} x2={60} y2={178} c="n" />
      <Arrow x1={175} y1={132} x2={162} y2={178} c="n" />
      <Arrow x1={210} y1={132} x2={262} y2={178} c="n" />
      <Arrow x1={410} y1={132} x2={366} y2={178} c="n" />
      <Arrow x1={445} y1={132} x2={468} y2={178} c="n" />
      <Arrow x1={480} y1={132} x2={568} y2={178} c="n" />

      {leaves.map((l) => (
        <Box key={l.x} x={l.x} y={180} w={88} h={42} label={l.k} c="b" fs={11.5} />
      ))}
      {leaves.slice(0, -1).map((l) => (
        <Arrow key={`c${l.x}`} x1={l.x + 88} y1={201} x2={l.x + 100} y2={201} c="b" />
      ))}

      <Txt x={310} y={252} fs={10.5} soft>
        every key appears in a leaf · leaves form a linked list, so a range scan walks sideways
      </Txt>
      <Txt x={310} y={276} fs={10.5} soft>
        internal nodes store only keys, so the fan-out is huge and the tree stays 3–4 levels deep
      </Txt>
    </Dg>
  );
}

/** B-tree vs B+ tree side by side. */
function BvsBPlus() {
  return (
    <Dg w={620} h={266} cap="B-tree stores data at every node; B+ tree stores data only in chained leaves">
      <Frame x={2} y={8} w={300} h={250} label="B-TREE" c="a" />
      <Box x={98} y={44} w={110} h={34} label="20 ▪" c="a" fs={12} />
      <Arrow x1={128} y1={78} x2={80} y2={110} c="n" />
      <Arrow x1={178} y1={78} x2={228} y2={110} c="n" />
      <Box x={24} y={112} w={104} h={34} label="10 ▪" c="a" fs={12} />
      <Box x={178} y={112} w={104} h={34} label="30 ▪" c="a" fs={12} />
      <Txt x={150} y={180} fs={10.5} soft>
        ▪ = data pointer, present at every node
      </Txt>
      <Txt x={150} y={200} fs={10.5} soft>
        a key appears exactly once in the tree
      </Txt>
      <Txt x={150} y={220} fs={10.5} soft>
        a lucky search can stop at the root
      </Txt>
      <Txt x={150} y={244} fs={10.5} bold c="c">
        no leaf chain → range scans are slow
      </Txt>

      <Frame x={318} y={8} w={300} h={250} label="B+ TREE" c="b" />
      <Box x={414} y={44} w={110} h={34} label="20" c="c" fs={12} />
      <Arrow x1={444} y1={78} x2={396} y2={110} c="n" />
      <Arrow x1={494} y1={78} x2={544} y2={110} c="n" />
      <Box x={340} y={112} w={110} h={34} label="10 · 20 ▪" c="b" fs={11.5} />
      <Box x={490} y={112} w={110} h={34} label="30 · 40 ▪" c="b" fs={11.5} />
      <Arrow x1={450} y1={129} x2={486} y2={129} c="b" />
      <Txt x={468} y={180} fs={10.5} soft>
        data pointers only in the leaves
      </Txt>
      <Txt x={468} y={200} fs={10.5} soft>
        20 is duplicated upward as a separator
      </Txt>
      <Txt x={468} y={220} fs={10.5} soft>
        every search costs the same — leaf depth
      </Txt>
      <Txt x={468} y={244} fs={10.5} bold c="b">
        leaf chain → range scans are fast
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'b-trees',
  num: 22,
  unit: 'Storage & Performance',
  title: 'B-Trees & B+ Trees',
  blurb:
    'Why databases use B+ trees for almost every index — structure, order, height, splits and merges, and the exact differences from a B-tree.',
  minutes: 14,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'why',
      heading: 'Why not a binary search tree?',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A balanced binary search tree over a million keys is about 20 levels deep, and each level is a{' '}
              <b>separate disk block</b> — 20 random I/Os per lookup. The problem is that a binary node wastes a
              4 KB block on two pointers.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>B-tree</b> fixes this by making each node as wide as a disk block. With a fan-out of 100, a
              million keys fit in <b>three levels</b>. The tree is short and fat because <b>disk blocks are the unit
              of I/O</b> — that one sentence is the whole justification.
            </>
          ),
        },
      ],
    },

    {
      id: 'bplus',
      heading: 'The B+ tree',
      blocks: [
        { k: 'diagram', el: <BPlusTree />, caption: 'The structure behind almost every index in every relational database.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Internal nodes hold only keys and child pointers</b> — they are routers, not storage.
            </>,
            <>
              <b>Every key appears in a leaf</b>, along with its data pointer. Keys in internal nodes are duplicated
              copies used as separators.
            </>,
            <>
              <b>Leaves are chained</b> in a doubly linked list, so a range scan finds the start and then walks
              sideways without touching the tree again.
            </>,
            <>
              <b>All leaves are at the same depth</b> — the tree is perfectly balanced, so every search costs the
              same.
            </>,
            <>
              Every node except the root is at least <b>half full</b>, which bounds the height and keeps space
              utilisation around 67% in practice.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'Order and capacity',
          code: `A B+ tree of order n (n = max child pointers per node):

    internal node   at most  n     children,  n − 1  keys
                    at least ⌈n/2⌉ children
    leaf node       at most  n − 1 keys
                    at least ⌈(n−1)/2⌉ keys
    root            at least 2 children (unless it is also a leaf)

Height with N keys and fan-out n:      h ≈ log⌈n/2⌉(N)

Example: N = 1,000,000 keys, fan-out 100
    level 1        1 node        →       100 pointers
    level 2      100 nodes       →    10,000 pointers
    level 3   10,000 nodes       → 1,000,000 entries
    → 3 or 4 I/Os per lookup, and the top levels stay cached in RAM,
      so in practice most lookups cost 1 real disk read.`,
        },
      ],
    },

    {
      id: 'operations',
      heading: 'Search, insert and delete',
      blocks: [
        { k: 'h', text: 'Search' },
        {
          k: 'p',
          text: (
            <>
              Start at the root, compare the key against the separators, follow the matching child, repeat until you
              reach a leaf. Always exactly <b>h</b> node reads. For a range query, find the lower bound then follow
              the leaf chain until you pass the upper bound.
            </>
          ),
        },
        { k: 'h', text: 'Insert' },
        {
          k: 'steps',
          items: [
            { t: 'Find the leaf', d: 'Search as normal to locate the leaf the key belongs in.' },
            { t: 'If it has room, insert in order', d: 'Done — this is the common case.' },
            {
              t: 'If it is full, split it',
              d: 'Divide the keys into two halves. In a leaf split, the middle key is COPIED up to the parent (it must remain in a leaf). In an internal split, the middle key MOVES up.',
            },
            {
              t: 'Propagate upward',
              d: 'If the parent is now full, split it too. The tree grows in height only when the root splits — which is why it stays balanced automatically.',
            },
          ],
        },
        { k: 'h', text: 'Delete' },
        {
          k: 'steps',
          items: [
            { t: 'Remove the key from its leaf', d: 'If the leaf is still at least half full, you are finished.' },
            {
              t: 'Otherwise borrow from a sibling',
              d: 'If an adjacent sibling has a spare key, move one across and update the separator in the parent.',
            },
            {
              t: 'Otherwise merge',
              d: 'Combine the underfull node with a sibling and remove the separator from the parent. If the parent underflows, repeat upward. The height shrinks only when the root ends up with a single child.',
            },
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Copy up vs move up',
          text: (
            <>
              In a <b>B+ tree leaf split the middle key is copied up</b> — it must stay in the leaf, because every
              key has to be reachable in the leaf level. In an <b>internal split it moves up</b>. In a{' '}
              <b>B-tree it always moves up</b>, since keys are never duplicated. This detail is a favourite.
            </>
          ),
        },
      ],
    },

    {
      id: 'compare',
      heading: 'B-tree vs B+ tree',
      blocks: [
        { k: 'diagram', el: <BvsBPlus />, caption: 'The structural difference that decides the trade-off.' },
        {
          k: 'table',
          head: ['', 'B-tree', 'B+ tree'],
          rows: [
            ['Where data pointers live', 'In every node', 'Only in the leaves'],
            ['Key duplication', 'None — each key appears once', 'Internal keys are copies of leaf keys'],
            ['Leaves linked?', 'No', 'Yes — a doubly linked list'],
            ['Range queries', 'Slow — requires tree traversal per step', 'Very fast — find the start, then walk the chain'],
            ['Fan-out', 'Lower — nodes carry data pointers too', 'Higher — internal nodes hold only keys, so the tree is shorter'],
            ['Search cost', 'Variable — a lucky hit stops at the root', 'Constant — always down to a leaf'],
            ['Sequential full scan', 'Requires a full in-order traversal', 'Just read the leaf chain'],
            ['Used by databases', 'Rarely', 'Almost universally'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why do databases prefer B+ trees?',
          text: (
            <>
              Three reasons, in this order: <b>higher fan-out</b> (no data pointers in internal nodes means more
              keys per block, so a shorter tree), <b>fast range scans and ordered iteration</b> via the leaf chain,
              and <b>predictable cost</b> — every lookup takes the same number of I/Os, which makes the optimizer's
              estimates reliable.
            </>
          ),
        },
      ],
    },

    {
      id: 'practice',
      heading: 'What this means in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Because the leaves are ordered, a B+ tree index also satisfies <b>ORDER BY</b> on the indexed columns
              for free, and can answer MIN/MAX in one traversal.
            </>,
            <>
              <b>Random primary keys (UUID v4) hurt.</b> Every insert lands in a different leaf, causing scattered
              page splits and poor cache locality. Monotonic keys append to the rightmost leaf instead — which is
              why auto-increment ids and time-ordered UUIDs perform much better.
            </>,
            <>
              Deletes leave partially empty pages. Indexes gradually bloat, which is why databases provide{' '}
              <b>REBUILD / REINDEX</b> operations.
            </>,
            <>
              The upper levels of a hot index stay permanently in the buffer pool, so the effective cost of a lookup
              is usually <b>one</b> physical I/O, not three.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why do databases use B+ trees instead of binary search trees?',
      a: (
        <>
          Because the unit of disk I/O is a block. A binary node wastes a whole block on two pointers, giving a tree
          ~20 levels deep for a million keys. A B+ tree node fills the block, giving a fan-out of hundreds and a
          tree only 3–4 levels deep — roughly 3 I/Os instead of 20.
        </>
      ),
    },
    {
      q: 'What is the main difference between a B-tree and a B+ tree?',
      a: (
        <>
          In a <b>B-tree</b> data pointers live in every node and each key appears once. In a <b>B+ tree</b> data
          pointers live only in the leaves, internal keys are duplicated separators, and the leaves are linked
          together.
        </>
      ),
    },
    {
      q: 'Why is a B+ tree better for range queries?',
      a: (
        <>
          Its leaves form a linked list in key order, so you descend once to find the start of the range and then
          walk sideways. A B-tree has no such chain, so every subsequent key needs another partial tree traversal.
        </>
      ),
    },
    {
      q: 'Why does a B+ tree have a higher fan-out than a B-tree of the same block size?',
      a: (
        <>
          Its internal nodes store only keys and child pointers — no data pointers — so more entries fit in one
          block. Higher fan-out means fewer levels, which means fewer disk reads per lookup.
        </>
      ),
    },
    {
      q: 'What happens when a B+ tree node overflows on insert?',
      a: (
        <>
          It <b>splits</b> into two half-full nodes. On a <b>leaf</b> split the middle key is <b>copied</b> up to the
          parent (it must remain in the leaf level); on an <b>internal</b> split it <b>moves</b> up. If the parent
          overflows the split propagates, and the tree only grows taller when the root itself splits.
        </>
      ),
    },
    {
      q: 'What happens on delete when a node becomes underfull?',
      a: (
        <>
          The node first tries to <b>borrow</b> a key from an adjacent sibling that has a spare, updating the
          separator in the parent. If no sibling can spare one, the node <b>merges</b> with a sibling and the
          separator is removed from the parent, possibly propagating upward. The tree shrinks in height only when
          the root is left with one child.
        </>
      ),
    },
    {
      q: 'A B+ tree of order 100 holds one million keys — roughly how many disk reads per lookup?',
      a: (
        <>
          About <b>3 to 4</b>. With a fan-out around 100, three levels address 100³ = 1,000,000 entries. In practice
          the root and second level stay cached in the buffer pool, so a lookup usually costs a single physical
          read.
        </>
      ),
    },
    {
      q: 'Why are all leaves at the same depth?',
      a: (
        <>
          Because the tree grows and shrinks only at the <b>root</b> — splits push a new level on top, merges remove
          one. Nothing ever lengthens a single branch, so the structure stays perfectly balanced and every lookup
          costs the same.
        </>
      ),
    },
    {
      q: 'Why can random UUID primary keys hurt B+ tree performance?',
      a: (
        <>
          Each insert lands in a random leaf, so writes are scattered across the whole index — poor buffer locality
          and frequent page splits. A monotonically increasing key appends to the rightmost leaf, keeping the hot
          pages small and the index dense. Time-ordered UUIDs (v7) exist for exactly this reason.
        </>
      ),
    },
    {
      q: 'Can a B+ tree index satisfy an ORDER BY?',
      a: (
        <>
          Yes. The leaf chain is already in key order, so scanning it returns sorted rows with no sort step. The
          same property makes MIN and MAX single traversals — leftmost or rightmost leaf.
        </>
      ),
    },
  ],
};

export default topic;
