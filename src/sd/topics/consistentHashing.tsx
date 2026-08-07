import { Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Nodes and keys placed around a hash ring; each key belongs to the next node clockwise. */
function ConsistentHashingDiagram() {
  const cx = 300;
  const cy = 150;
  const r = 100;
  const angle = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const pos = (deg: number, radius = r) => ({
    x: cx + radius * Math.cos(angle(deg)),
    y: cy + radius * Math.sin(angle(deg)),
  });

  const nodes = [
    { deg: 20, label: 'Node A' },
    { deg: 110, label: 'Node B' },
    { deg: 200, label: 'Node C' },
    { deg: 290, label: 'Node D' },
  ];
  const keys = [
    { deg: 0, label: 'k1' },
    { deg: 60, label: 'k2' },
    { deg: 150, label: 'k3' },
    { deg: 240, label: 'k4' },
    { deg: 320, label: 'k5' },
  ];

  return (
    <Dg w={600} h={300} cap="Keys and nodes placed on a ring; each key belongs to the next node clockwise from it">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="4 5" />
      {keys.map((k) => {
        const p = pos(k.deg, r);
        const lp = pos(k.deg, r + 22);
        return (
          <g key={k.label}>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--accent-3)" />
            <Txt x={lp.x} y={lp.y + 4} fs={11} c="c" mono>
              {k.label}
            </Txt>
          </g>
        );
      })}
      {nodes.map((n) => {
        const p = pos(n.deg);
        return <Box key={n.label} x={p.x - 44} y={p.y - 18} w={88} h={36} label={n.label} c="a" fs={11} />;
      })}
      <Txt x={cx} y={cy - 6} fs={12} bold soft>
        hash ring
      </Txt>
      <Txt x={cx} y={cy + 14} fs={11} soft>
        key → next node clockwise
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'consistent-hashing',
  num: 16,
  unit: 'Data Layer',
  title: 'Consistent Hashing',
  blurb: 'A hashing scheme that minimises data movement when nodes are added or removed from a sharded system.',
  minutes: 10,
  tags: ['Advanced', 'Scale'],

  sections: [
    {
      id: 'analogy',
      heading: 'The circular cloakroom analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a cloakroom where every coat hangs at a numbered spot on a circular rail — adding one new rack
              section only shifts the few coats nearest to it onto the new section, not the entire cloakroom.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Plain <code>hash(key) % N</code> sharding has the opposite problem: change N (add or remove one
              node) and almost every key remaps to a different node, forcing a massive data shuffle.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How the ring assigns keys to nodes',
      blocks: [
        {
          k: 'diagram',
          el: <ConsistentHashingDiagram />,
          caption: 'Nodes and keys sit on a hash ring; a key belongs to the first node found going clockwise.',
        },
        {
          k: 'p',
          text: (
            <>
              Both nodes and keys are hashed onto positions on a virtual <b>ring</b>. A key belongs to whichever
              node is <b>next clockwise</b> from it. Adding a node only steals the keys between it and its
              clockwise neighbour; removing a node only hands its keys to its clockwise neighbour — the rest of
              the ring is untouched.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Compare that to <code>hash(key) % N</code>: changing N changes almost every key's assigned node,
              because the modulo result depends on N directly. Consistent hashing decouples "which node" from the
              total node count.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where this shows up, and its rough edge',
      blocks: [
        {
          k: 'ul',
          items: [
            <>Used inside distributed caches, e.g. client-side hashing in Memcached, to rebalance smoothly as cache servers are added or removed.</>,
            <>Used by distributed databases like Cassandra and DynamoDB to add/remove nodes without re-copying the entire dataset.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Plain consistent hashing can still create uneven load if nodes happen to land close together on the
              ring. The fix used in practice is <b>virtual nodes</b> — giving each physical node multiple ring
              positions — which smooths out the distribution.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem does consistent hashing solve?',
      a: (
        <>
          It minimises data movement when the number of nodes changes. Plain <code>hash(key) % N</code> remaps
          almost every key when N changes; consistent hashing only reshuffles the keys near the node that was
          added or removed.
        </>
      ),
    },
    {
      q: 'How does consistent hashing decide which node owns a key?',
      a: <>Both nodes and keys are hashed onto positions on a ring; a key belongs to the first node found going clockwise from its position.</>,
    },
    {
      q: 'What happens to the ring when a node is added?',
      a: <>Only the keys between the new node and its clockwise neighbour move to it — every other key\'s ownership is unaffected.</>,
    },
    {
      q: 'What is a virtual node and why is it used?',
      a: (
        <>
          Multiple ring positions assigned to one physical node. Without it, uneven node placement on the ring can
          create load imbalance; virtual nodes spread each physical node's share more evenly across the ring.
        </>
      ),
    },
    {
      q: 'Name two real systems that use consistent hashing.',
      a: <>Distributed caches like Memcached (client-side hashing), and distributed databases like Cassandra and DynamoDB.</>,
    },
    {
      q: 'Why is consistent hashing better than modulo-based sharding for a growing cluster?',
      a: (
        <>
          Modulo sharding ties a key's node directly to the total node count N, so any change to N remaps nearly
          everything. Consistent hashing only affects keys adjacent to the changed node, keeping rebalancing
          cheap.
        </>
      ),
    },
  ],
};

export default topic;
