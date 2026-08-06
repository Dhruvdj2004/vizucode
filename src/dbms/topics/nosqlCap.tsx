import { Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** CAP: pick two, because partitions are not optional. */
function CapTriangle() {
  return (
    <Dg w={600} h={300} cap="Under a network partition you must choose between consistency and availability">
      <polygon
        points="300,34 522,242 78,242"
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth="1.4"
        strokeDasharray="6 5"
      />
      <Box x={238} y={16} w={124} h={44} label="Consistency" sub="one true value" c="a" fs={12} />
      <Box x={16} y={222} w={124} h={44} label="Availability" sub="always answers" c="b" fs={12} />
      <Box x={460} y={222} w={124} h={44} label="Partition tol." sub="survives a split" c="c" fs={12} />

      <Txt x={172} y={148} fs={11} bold c="n">
        CP
      </Txt>
      <Txt x={172} y={166} fs={9.5} soft>
        refuse to answer
      </Txt>
      <Txt x={432} y={148} fs={11} bold c="n">
        AP
      </Txt>
      <Txt x={432} y={166} fs={9.5} soft>
        answer, maybe stale
      </Txt>
      <Txt x={300} y={262} fs={11} bold c="n">
        CA
      </Txt>
      <Txt x={300} y={280} fs={9.5} soft>
        only on a single node — networks do partition
      </Txt>

      <Txt x={300} y={140} fs={10.5} soft>
        P is not a choice.
      </Txt>
      <Txt x={300} y={158} fs={10.5} soft>
        The real question is
      </Txt>
      <Txt x={300} y={176} fs={10.5} soft>
        C or A when it happens.
      </Txt>
    </Dg>
  );
}

/** Sharding splits rows across nodes; replication copies them. */
function ShardVsReplicate() {
  return (
    <Dg w={614} h={252} cap="Sharding splits the data for capacity; replication copies it for availability">
      <Frame x={2} y={8} w={296} h={236} label="SHARDING — split" c="a" />
      <Box x={24} y={46} w={252} h={34} label="users 1 – 1M" c="n" fs={11.5} />
      <Box x={24} y={100} w={78} h={44} label="shard 1" sub="1–333k" c="a" fs={10.5} />
      <Box x={111} y={100} w={78} h={44} label="shard 2" sub="334–666k" c="a" fs={10.5} />
      <Box x={198} y={100} w={78} h={44} label="shard 3" sub="667k–1M" c="a" fs={10.5} />
      <Txt x={150} y={180} fs={10.5} soft>
        each node holds a different slice
      </Txt>
      <Txt x={150} y={198} fs={10.5} soft>
        → more capacity and write throughput
      </Txt>
      <Txt x={150} y={224} fs={10.5} bold c="c">
        cross-shard joins become hard
      </Txt>

      <Frame x={316} y={8} w={296} h={236} label="REPLICATION — copy" c="b" />
      <Box x={338} y={46} w={252} h={34} label="users 1 – 1M" c="n" fs={11.5} />
      <Box x={338} y={100} w={78} h={44} label="primary" sub="writes" c="b" fs={10.5} />
      <Box x={425} y={100} w={78} h={44} label="replica" sub="reads" c="b" fs={10.5} />
      <Box x={512} y={100} w={78} h={44} label="replica" sub="reads" c="b" fs={10.5} />
      <Txt x={464} y={180} fs={10.5} soft>
        every node holds the same data
      </Txt>
      <Txt x={464} y={198} fs={10.5} soft>
        → availability and read scaling
      </Txt>
      <Txt x={464} y={224} fs={10.5} bold c="c">
        replicas lag behind the primary
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'nosql-cap',
  num: 25,
  unit: 'Modern Databases',
  title: 'SQL vs NoSQL, CAP & Scaling',
  blurb:
    'The four NoSQL families and what each is for, the CAP theorem stated correctly, BASE vs ACID, and how sharding and replication actually differ.',
  minutes: 13,
  tags: ['Very common', 'Practical'],

  sections: [
    {
      id: 'why',
      heading: 'Why NoSQL appeared',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Relational databases scale <b>vertically</b> extremely well — buy a bigger machine — but scaling{' '}
              <b>horizontally</b> is hard, because joins, foreign keys and ACID transactions all assume the data is
              reachable from one place. Once a workload outgrew the biggest available machine, something had to
              give.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              NoSQL systems made a deliberate trade: <b>drop joins, drop a rigid schema, and relax consistency, in
              exchange for horizontal scale and availability</b>. That is the whole story, and it is the sentence to
              open with if asked.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              "NoSQL" does not mean "no SQL" — it is usually read as "not only SQL". Many NoSQL systems now offer a
              SQL-like query language, and relational databases now store JSON. The categories have converged
              considerably since the marketing peak.
            </>
          ),
        },
      ],
    },

    {
      id: 'families',
      heading: 'The four NoSQL families',
      blocks: [
        {
          k: 'table',
          head: ['Type', 'Data shape', 'Good at', 'Examples'],
          rows: [
            [
              'Key-value',
              'An opaque value under a key',
              'Caching, sessions, feature flags — the simplest and fastest lookups',
              'Redis, DynamoDB, Memcached',
            ],
            [
              'Document',
              'Self-contained JSON-like documents',
              'Content, catalogues, user profiles — anything read as a whole object',
              'MongoDB, CouchDB, Firestore',
            ],
            [
              'Column-family (wide-column)',
              'Rows with dynamic columns, grouped into families',
              'Huge write volumes and time-series data, queried by row key',
              'Cassandra, HBase, ScyllaDB',
            ],
            [
              'Graph',
              'Nodes and edges as first-class objects',
              'Relationship traversal — social graphs, fraud rings, recommendations',
              'Neo4j, Neptune, JanusGraph',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A graph database is the interesting one to mention, because it is <i>not</i> about scale. It exists
              because "friends of friends of friends" is a self-join repeated N times in SQL, which gets
              exponentially worse with depth, while a graph engine follows pointers in constant time per hop.
            </>
          ),
        },
      ],
    },

    {
      id: 'compare',
      heading: 'SQL vs NoSQL, honestly',
      blocks: [
        {
          k: 'table',
          head: ['', 'Relational (SQL)', 'NoSQL'],
          rows: [
            ['Schema', 'Fixed, declared up front, enforced by the DBMS', 'Flexible or schema-on-read; the application enforces shape'],
            ['Relationships', 'Joins and foreign keys', 'Embedding or application-side joins'],
            ['Scaling', 'Vertical first; horizontal is hard', 'Horizontal by design'],
            ['Transactions', 'Full ACID across many tables', 'Often per-document or per-partition only'],
            ['Consistency', 'Strong', 'Frequently eventual (tunable in some systems)'],
            ['Query language', 'SQL — declarative, standardised, optimizable', 'Proprietary APIs; less portable'],
            ['Best for', 'Data with real relationships and correctness requirements — money, orders, inventory', 'High-volume, loosely structured, read-scaled data — events, catalogues, sessions'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The mature answer',
          text: (
            <>
              Do not say "NoSQL is faster". Say: <b>they optimise for different things</b>. A relational database
              trades write throughput for correctness and query flexibility; a NoSQL store trades joins and strong
              consistency for scale and availability. Most real systems use <b>both</b> — a relational database for
              orders and payments, Redis for sessions, Elasticsearch for search.
            </>
          ),
        },
      ],
    },

    {
      id: 'cap',
      heading: 'The CAP theorem',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A distributed data store cannot simultaneously guarantee all three of:
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Consistency</b> — every read sees the most recent write. (Note: this is <i>not</i> the C in ACID.)
            </>,
            <>
              <b>Availability</b> — every request receives a non-error response.
            </>,
            <>
              <b>Partition tolerance</b> — the system keeps working when the network drops messages between nodes.
            </>,
          ],
        },
        { k: 'diagram', el: <CapTriangle />, caption: 'CA is not really an option for any distributed system.' },
        {
          k: 'note',
          tone: 'exam',
          title: 'State it correctly — most candidates do not',
          text: (
            <>
              "Pick two of three" is the pop version and it is misleading. In any real distributed system{' '}
              <b>partitions will happen</b>, so P is not something you choose. The theorem's real content is:{' '}
              <b>when a partition occurs, you must choose between consistency and availability</b>. Outside a
              partition you can have both.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Choice', 'Behaviour during a partition', 'Examples'],
          rows: [
            ['CP', 'Refuse requests it cannot answer correctly — some clients get errors', 'HBase, MongoDB (default), etcd, ZooKeeper'],
            ['AP', 'Answer from whatever node is reachable, possibly with stale data, and reconcile later', 'Cassandra, DynamoDB, CouchDB'],
            ['CA', 'Only meaningful for a single node or a network that never partitions', 'A single-instance relational database'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A useful extension to mention is <b>PACELC</b>: <i>if there is a Partition, choose A or C; Else,
              choose Latency or Consistency</i>. It captures the fact that even with a healthy network, strong
              consistency costs round trips — which is the trade-off you actually live with day to day.
            </>
          ),
        },
      ],
    },

    {
      id: 'base',
      heading: 'ACID vs BASE',
      blocks: [
        {
          k: 'table',
          head: ['', 'ACID', 'BASE'],
          rows: [
            ['Stands for', 'Atomicity, Consistency, Isolation, Durability', 'Basically Available, Soft state, Eventual consistency'],
            ['Consistency model', 'Strong — the database is always in a valid state', 'Eventual — replicas converge given enough time without new writes'],
            ['Priority', 'Correctness', 'Availability and scale'],
            ['Typical of', 'Relational databases', 'Distributed NoSQL stores'],
            ['Right for', 'Money, inventory, bookings — anywhere a wrong answer is unacceptable', 'Likes, view counts, feeds, catalogues — where a brief stale read is harmless'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>Eventual consistency</b> is a real guarantee, not an absence of one: if writes stop, all replicas
              will converge to the same value. What it does not promise is <i>when</i>. Deciding whether that
              window is acceptable is a product question, not a database one.
            </>
          ),
        },
      ],
    },

    {
      id: 'scaling',
      heading: 'Sharding and replication',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              These get confused constantly. They solve different problems and are almost always used together.
            </>
          ),
        },
        { k: 'diagram', el: <ShardVsReplicate />, caption: 'Split for capacity, copy for availability.' },
        { k: 'h', text: 'Sharding (horizontal partitioning)' },
        {
          k: 'ul',
          items: [
            <>
              <b>Range sharding</b> — users A–M here, N–Z there. Range queries stay efficient, but a popular range
              becomes a hotspot.
            </>,
            <>
              <b>Hash sharding</b> — hash the key to pick a shard. Even distribution, but no range queries.
            </>,
            <>
              <b>Directory sharding</b> — a lookup service maps keys to shards. Flexible, but the directory becomes
              a critical dependency.
            </>,
            <>
              <b>Consistent hashing</b> — arranges nodes on a ring so that adding or removing a node moves only a
              small fraction of the keys, rather than reshuffling everything.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The real cost of sharding is that <b>cross-shard joins and cross-shard transactions become your
              problem</b>. Choosing a shard key that keeps related data together — all of one customer's rows on one
              shard — is the single most important decision, and it is very hard to change afterwards.
            </>
          ),
        },
        { k: 'h', text: 'Replication' },
        {
          k: 'ul',
          items: [
            <>
              <b>Primary-replica (leader-follower)</b> — one node takes writes, replicas serve reads. Simple, and it
              scales reads well; the primary remains a write bottleneck and replicas lag.
            </>,
            <>
              <b>Multi-primary</b> — several nodes accept writes. No write bottleneck, but conflicting concurrent
              writes must be detected and resolved.
            </>,
            <>
              <b>Synchronous</b> replication waits for replicas to confirm — no data loss on failover, higher write
              latency. <b>Asynchronous</b> is fast but can lose the last few transactions if the primary dies.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Replication lag',
          text: (
            <>
              A classic real-world bug: the user posts a comment (write to primary), the page reloads (read from a
              replica), and the comment is missing. The fixes are <b>read-your-own-writes</b> consistency — route a
              user's reads to the primary for a short window after they write — or reading from the primary for
              those specific paths. Being able to name this scenario shows practical experience.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is NoSQL and why did it emerge?',
      a: (
        <>
          A family of non-relational stores built for <b>horizontal scale</b>. They emerged because relational
          databases are hard to scale across many machines — joins, foreign keys and cross-table ACID all assume the
          data is reachable together. NoSQL drops those to gain scale and availability.
        </>
      ),
    },
    {
      q: 'What are the four types of NoSQL database?',
      a: (
        <>
          <b>Key-value</b> (Redis, DynamoDB) for simple fast lookups; <b>document</b> (MongoDB) for self-contained
          JSON objects; <b>column-family</b> (Cassandra, HBase) for huge write volumes and time-series; and{' '}
          <b>graph</b> (Neo4j) for relationship traversal.
        </>
      ),
    },
    {
      q: 'State the CAP theorem correctly.',
      a: (
        <>
          A distributed store cannot simultaneously guarantee consistency, availability and partition tolerance.
          The accurate reading is not "pick two" — partitions <b>will</b> happen, so P is mandatory. The real
          statement is: <b>during a partition you must choose between consistency and availability</b>.
        </>
      ),
    },
    {
      q: 'Is the C in CAP the same as the C in ACID?',
      a: (
        <>
          No, and this is a good discriminating question. CAP's <b>consistency</b> means every read returns the most
          recent write — closer to ACID's <i>isolation</i>. ACID's <b>consistency</b> means the database satisfies
          its declared constraints and invariants. Different concepts sharing a letter.
        </>
      ),
    },
    {
      q: 'Give an example of a CP system and an AP system.',
      a: (
        <>
          <b>CP</b>: etcd, ZooKeeper, HBase — during a partition the minority side refuses requests rather than
          risk serving stale data. <b>AP</b>: Cassandra, DynamoDB — every reachable node answers, possibly with
          stale data, and replicas reconcile afterwards.
        </>
      ),
    },
    {
      q: 'What is eventual consistency?',
      a: (
        <>
          A guarantee that if no new writes are made, all replicas will eventually converge to the same value. It
          says nothing about <i>when</i>, so a read immediately after a write may return an older value. Acceptable
          for view counts and feeds; unacceptable for account balances.
        </>
      ),
    },
    {
      q: 'Difference between sharding and replication?',
      a: (
        <>
          <b>Sharding</b> splits the data — each node holds a different subset, which adds storage capacity and
          write throughput. <b>Replication</b> copies the data — each node holds the same subset, which adds
          availability and read capacity. They solve different problems and are usually combined.
        </>
      ),
    },
    {
      q: 'What makes a good shard key?',
      a: (
        <>
          One with <b>high cardinality</b> (so data spreads evenly), <b>no hotspots</b> (avoid a monotonic
          timestamp, which sends every new write to one shard), and <b>locality</b> — related rows that are queried
          together should land on the same shard, so most queries avoid a scatter-gather. It is very expensive to
          change later.
        </>
      ),
    },
    {
      q: 'What is replication lag and what problem does it cause?',
      a: (
        <>
          The delay before a write on the primary appears on an asynchronous replica. It causes the classic
          "I posted a comment and it vanished" bug when the write goes to the primary and the next read goes to a
          lagging replica. Fixed with <b>read-your-own-writes</b> routing — send a user's reads to the primary for a
          short window after they write.
        </>
      ),
    },
    {
      q: 'When would you still choose a relational database today?',
      a: (
        <>
          Whenever the data has real relationships and correctness matters more than raw scale — payments, orders,
          inventory, bookings, anything needing multi-row transactions or ad-hoc reporting. Modern relational
          databases also handle JSON and scale far further than people assume, so the honest default is relational
          until a measured requirement forces otherwise.
        </>
      ),
    },
  ],
};

export default topic;
