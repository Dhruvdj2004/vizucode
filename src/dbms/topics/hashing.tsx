import { Arrow, Box, Dg, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Static hashing with an overflow chain. */
function StaticHashing() {
  return (
    <Dg w={614} h={258} cap="A fixed number of buckets; a full bucket chains to an overflow bucket">
      <Txt x={68} y={42} fs={11} bold c="n">
        keys
      </Txt>
      {['1004', '1007', '1010', '1008'].map((k, i) => (
        <Txt key={k} x={68} y={68 + i * 20} fs={11} mono soft>
          {k}
        </Txt>
      ))}
      <Arrow x1={104} y1={96} x2={144} y2={96} c="n" />
      <Box x={146} y={72} w={124} h={48} label="h(k) = k mod 4" c="a" fs={11} />
      <Arrow x1={270} y1={96} x2={312} y2={96} c="n" />

      <Box x={316} y={30} w={150} h={32} label="B0   1004 · 1008" c="b" fs={11} />
      <Box x={316} y={70} w={150} h={32} label="B1   —" c="b" fs={11} />
      <Box x={316} y={110} w={150} h={32} label="B2   1010" c="b" fs={11} />
      <Box x={316} y={150} w={150} h={32} label="B3   1007" c="b" fs={11} />

      <Arrow x1={468} y1={46} x2={496} y2={46} c="c" />
      <Box x={498} y={30} w={104} h={32} label="overflow" c="c" fs={10.5} />

      <Txt x={306} y={212} fs={10.5} soft>
        the number of buckets is fixed at creation — as the file grows, overflow chains grow with it
      </Txt>
      <Txt x={306} y={234} fs={10.5} soft>
        a lookup that used to cost 1 I/O now costs 1 + the length of the chain
      </Txt>
    </Dg>
  );
}

/** Extendible hashing: a directory of pointers, buckets with local depths. */
function ExtendibleHashing() {
  return (
    <Dg w={608} h={286} cap="The directory doubles instead of rehashing the whole file">
      <Txt x={100} y={34} fs={11} bold c="a">
        directory · global depth = 2
      </Txt>
      {['00', '01', '10', '11'].map((b, i) => (
        <Box key={b} x={62} y={50 + i * 34} w={78} h={30} label={b} c="a" fs={11.5} r={4} />
      ))}

      <Box x={300} y={44} w={230} h={42} label="bucket A" sub="local depth 2 — keys ending 00" c="b" fs={11.5} />
      <Box x={300} y={100} w={230} h={42} label="bucket C" sub="local depth 2 — keys ending 10" c="b" fs={11.5} />
      <Box x={300} y={156} w={230} h={42} label="bucket B" sub="local depth 1 — keys ending 1" c="c" fs={11.5} />

      <Arrow x1={142} y1={65} x2={296} y2={65} c="n" />
      <Arrow x1={142} y1={133} x2={296} y2={121} c="n" />
      <Arrow x1={142} y1={99} x2={296} y2={177} c="n" />
      <Arrow x1={142} y1={167} x2={296} y2={177} c="n" />

      <Txt x={304} y={232} fs={10.5} soft>
        global depth = how many bits the directory uses · local depth = how many this bucket depends on
      </Txt>
      <Txt x={304} y={254} fs={10.5} soft>
        two directory entries share bucket B, because its local depth is smaller than the global depth
      </Txt>
      <Txt x={304} y={276} fs={10.5} bold c="b">
        a full bucket splits on its own — no full-file rehash, ever
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'hashing',
  num: 23,
  unit: 'Storage & Performance',
  title: 'Hashing Techniques',
  blurb:
    'Static hashing and its overflow problem, extendible and linear hashing, and exactly when a hash index beats a B+ tree.',
  minutes: 11,
  tags: ['Theory question'],

  sections: [
    {
      id: 'idea',
      heading: 'The idea',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Instead of searching a structure, <b>compute</b> the location. A hash function maps a search key to a
              bucket number, and the bucket is a disk block. An equality lookup is one arithmetic operation plus one
              block read.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A good hash function is <b>uniform</b> (every bucket equally likely) and <b>random</b> with respect to
              the key's meaning (consecutive keys should not cluster). That randomness is exactly why hashing cannot
              do ranges.
            </>
          ),
        },
      ],
    },

    {
      id: 'static',
      heading: 'Static hashing',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The number of buckets <b>B</b> is fixed when the file is created, and <code>h(k) = k mod B</code> (or
              similar) picks one.
            </>
          ),
        },
        { k: 'diagram', el: <StaticHashing />, caption: 'It works beautifully until a bucket fills up.' },
        { k: 'h', text: 'Handling collisions and overflow' },
        {
          k: 'ul',
          items: [
            <>
              <b>Open hashing (chaining)</b> — a full bucket links to an overflow bucket, forming a chain. This is
              what databases use, because records stay findable and the bucket stays logically intact.
            </>,
            <>
              <b>Closed hashing (open addressing)</b> — probe the next bucket linearly (or quadratically) until a
              free slot is found. Compact, but deletions need tombstones and clustering degrades it badly.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'The fatal flaw',
          text: (
            <>
              B is fixed but the data is not. If the file grows, every bucket develops a long overflow chain and the
              one-I/O guarantee disappears. If the file shrinks, most buckets sit empty and space is wasted. Fixing
              it means <b>rehashing the entire file</b> — an offline operation. Dynamic hashing exists to avoid
              exactly this.
            </>
          ),
        },
      ],
    },

    {
      id: 'extendible',
      heading: 'Extendible hashing',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Add a level of indirection. A <b>directory</b> of pointers sits between the hash value and the
              buckets, and only the directory doubles when needed — never the whole file.
            </>
          ),
        },
        { k: 'diagram', el: <ExtendibleHashing />, caption: 'Global depth is a property of the directory; local depth is a property of each bucket.' },
        {
          k: 'steps',
          items: [
            {
              t: 'Hash, then take the last d bits',
              d: 'd is the global depth. Those bits index into the directory, which has 2^d entries.',
            },
            {
              t: 'Follow the pointer to a bucket',
              d: 'Several directory entries may point at the same bucket — that happens whenever the bucket\'s local depth is less than the global depth.',
            },
            {
              t: 'On overflow, split that bucket only',
              d: 'Increment its local depth and redistribute its records between the old and new bucket using one more bit.',
            },
            {
              t: 'If local depth would exceed global depth, double the directory',
              d: 'Global depth increases by 1, the directory doubles, and every existing pointer is duplicated. No records are rehashed — only pointers are copied.',
            },
          ],
        },
        {
          k: 'table',
          head: ['', 'Advantage', 'Cost'],
          rows: [
            ['Extendible hashing', 'No full rehash; performance does not degrade as the file grows; still ~1–2 I/Os', 'The directory can grow large and may itself not fit in memory; doubling is a sudden jump'],
          ],
        },
      ],
    },

    {
      id: 'linear',
      heading: 'Linear hashing',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The other dynamic scheme, and the one that avoids a directory entirely. Buckets are split{' '}
              <b>in a fixed round-robin order</b>, tracked by a pointer, regardless of which bucket actually
              overflowed.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              When any bucket overflows, the bucket at the <b>split pointer</b> is split and the pointer advances.
              The overflowing bucket itself just chains for now.
            </>,
            <>
              Once the pointer has gone all the way round, the hash function advances from <code>h_i</code> to{' '}
              <code>h_i+1</code> and the round starts again.
            </>,
            <>
              <b>No directory</b> — the address is computed directly, which saves memory and a level of
              indirection.
            </>,
            <>
              The cost is that overflow chains do exist temporarily, so performance is slightly less predictable
              than extendible hashing.
            </>,
          ],
        },
      ],
    },

    {
      id: 'vs-btree',
      heading: 'Hash index vs B+ tree index',
      blocks: [
        {
          k: 'table',
          head: ['Operation', 'Hash index', 'B+ tree index'],
          rows: [
            ['Equality lookup (= value)', 'Best — ~1 I/O', 'Good — ~3 I/Os'],
            ['Range query (BETWEEN, <, >)', 'Impossible — full scan', 'Excellent'],
            ['ORDER BY on the key', 'Impossible', 'Free — the leaves are already sorted'],
            ['Prefix / LIKE "abc%"', 'Impossible', 'Works — it is a range'],
            ['MIN / MAX', 'Full scan', 'One traversal'],
            ['Composite key, partial match', 'Impossible — the hash needs all columns', 'Works via the leftmost prefix'],
            ['Growth behaviour', 'Degrades unless dynamic hashing is used', 'Self-balancing'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              This is why <b>B+ trees are the default everywhere and hash indexes are the exception</b>. A hash
              index is faster for one thing only — a pure equality lookup — and useless for everything else. Most
              real workloads mix equality with ranges and sorting, so the general-purpose structure wins. PostgreSQL
              and MySQL both support hash indexes; both default to B-trees.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is hashing in the context of file organization?',
      a: (
        <>
          Computing the address of a record's bucket directly from its key using a hash function, so an equality
          lookup costs roughly one block read instead of a search.
        </>
      ),
    },
    {
      q: 'What is the main problem with static hashing?',
      a: (
        <>
          The bucket count is fixed at creation. As the file grows, buckets overflow and chains lengthen, destroying
          the one-I/O guarantee; as it shrinks, space is wasted. Fixing it requires <b>rehashing the entire
          file</b>, which is an offline operation.
        </>
      ),
    },
    {
      q: 'Open hashing vs closed hashing?',
      a: (
        <>
          <b>Open hashing (chaining)</b> links a full bucket to an overflow bucket — records stay in their logical
          bucket, and this is what databases use. <b>Closed hashing (open addressing)</b> probes for the next free
          slot in another bucket — more compact, but deletions need tombstones and clustering degrades performance.
        </>
      ),
    },
    {
      q: 'Explain extendible hashing.',
      a: (
        <>
          A directory of 2<sup>d</sup> pointers (d = global depth) is indexed by the last d bits of the hash. Each
          bucket has a <b>local depth</b>. On overflow only that bucket splits and its local depth increases; if
          that would exceed the global depth, the <b>directory doubles</b> — pointers are copied, but no records are
          rehashed.
        </>
      ),
    },
    {
      q: 'Difference between global depth and local depth?',
      a: (
        <>
          <b>Global depth</b> is how many hash bits the directory uses, so the directory has 2<sup>global</sup>{' '}
          entries. <b>Local depth</b> is how many bits a particular bucket actually depends on. When local &lt;
          global, several directory entries share that bucket.
        </>
      ),
    },
    {
      q: 'Extendible vs linear hashing?',
      a: (
        <>
          Extendible hashing uses a <b>directory</b> and splits exactly the bucket that overflowed — predictable
          performance, but the directory may grow large and doubles in sudden jumps. Linear hashing has{' '}
          <b>no directory</b> and splits buckets in a fixed round-robin order, so growth is smooth, at the cost of
          temporary overflow chains.
        </>
      ),
    },
    {
      q: 'Why can a hash index not serve a range query?',
      a: (
        <>
          A good hash function deliberately destroys ordering to distribute keys evenly, so adjacent key values land
          in unrelated buckets. There is no way to walk a range without visiting every bucket.
        </>
      ),
    },
    {
      q: 'When would you choose a hash index over a B+ tree?',
      a: (
        <>
          Only when the workload is <b>purely equality lookups</b> on a single column — a session or cache table
          keyed by token, for example — with no ranges, sorting or prefix matching. Otherwise the B+ tree's
          versatility wins easily, which is why it is everyone's default.
        </>
      ),
    },
    {
      q: 'What makes a hash function good for a database?',
      a: (
        <>
          <b>Uniformity</b> — every bucket equally likely, so no bucket becomes a hotspot — and{' '}
          <b>independence from the key's structure</b>, so patterned keys (sequential ids, common prefixes) still
          scatter evenly across buckets.
        </>
      ),
    },
  ],
};

export default topic;
