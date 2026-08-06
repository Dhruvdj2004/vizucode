import { Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** The storage hierarchy, fastest at the top. */
function MemoryHierarchy() {
  const level = (y: number, w: number, label: string, sub: string, c: 'a' | 'b' | 'c' | 'n') => (
    <Box key={label} x={(600 - w) / 2} y={y} w={w} h={34} label={label} sub={sub} c={c} fs={11.5} />
  );
  return (
    <Dg w={600} h={264} cap="The storage hierarchy: each step down is bigger, cheaper and far slower">
      {level(20, 120, 'Registers', '', 'c')}
      {level(58, 170, 'Cache L1–L3', '', 'c')}
      {level(96, 220, 'Main memory (RAM)', 'volatile', 'a')}
      {level(134, 280, 'SSD / Flash', 'persistent', 'b')}
      {level(172, 340, 'Magnetic disk', 'persistent', 'b')}
      {level(210, 420, 'Tape / archive', 'persistent', 'n')}

      <Txt x={16} y={62} anchor="start" fs={10.5} bold c="c">
        faster
      </Txt>
      <Txt x={16} y={78} anchor="start" fs={10.5} soft>
        smaller
      </Txt>
      <Txt x={16} y={94} anchor="start" fs={10.5} soft>
        costlier
      </Txt>

      <Txt x={584} y={182} anchor="end" fs={10.5} bold c="b">
        slower
      </Txt>
      <Txt x={584} y={198} anchor="end" fs={10.5} soft>
        bigger
      </Txt>
      <Txt x={584} y={214} anchor="end" fs={10.5} soft>
        cheaper
      </Txt>

      <Txt x={300} y={258} fs={10.5} soft>
        the database lives below the volatile line — every query eventually pays for that
      </Txt>
    </Dg>
  );
}

/** Records packed into one block. */
function BlockLayout() {
  return (
    <Dg w={600} h={228} cap="Records packed into a fixed-size disk block, with the leftover space wasted">
      <Frame x={40} y={44} w={520} h={80} label="ONE DISK BLOCK — 4096 bytes" c="a" />
      <Box x={56} y={70} w={116} h={40} label="record 1" c="b" fs={11} />
      <Box x={180} y={70} w={116} h={40} label="record 2" c="b" fs={11} />
      <Box x={304} y={70} w={116} h={40} label="record 3" c="b" fs={11} />
      <Box x={428} y={70} w={72} h={40} label="rec 4" c="b" fs={11} />
      <Box x={508} y={70} w={44} h={40} label="free" c="n" fs={9.5} />

      <Txt x={300} y={156} fs={11.5} bold c="a">
        blocking factor = ⌊ 4096 / 900 ⌋ = 4 records per block
      </Txt>
      <Txt x={300} y={180} fs={10.5} soft>
        the leftover 496 bytes are wasted — internal fragmentation
      </Txt>
      <Txt x={300} y={206} fs={10.5} soft>
        unspanned: a record never crosses a block · spanned: it may, saving space but costing two reads
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'file-organization',
  num: 20,
  unit: 'Storage & Performance',
  title: 'File Organization & Storage',
  blurb:
    'The storage hierarchy, how records are packed into blocks, and the five ways a table can be laid out on disk — heap, sequential, hash, clustered and ISAM.',
  minutes: 11,
  tags: ['Theory question'],

  sections: [
    {
      id: 'hierarchy',
      heading: 'Why disk dominates everything',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A database is designed around one fact: <b>reading a block from disk is thousands of times slower
              than reading from memory</b>. Every structure in this unit — blocking, indexes, B+ trees, buffer
              pools — exists to reduce the number of disk blocks touched.
            </>
          ),
        },
        { k: 'diagram', el: <MemoryHierarchy />, caption: 'Roughly: RAM in nanoseconds, SSD in microseconds, magnetic disk in milliseconds.' },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              This is why DBMS cost models count <b>block transfers (disk I/Os)</b>, not CPU instructions. If a
              question asks you to compare two algorithms, compare their I/O counts — that is the currency.
            </>
          ),
        },
      ],
    },

    {
      id: 'records',
      heading: 'Records, blocks and blocking factor',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The disk is read and written in fixed-size <b>blocks</b> (or pages), typically 4 KB or 8 KB. You never
              read one row — you read the whole block containing it.
            </>
          ),
        },
        { k: 'diagram', el: <BlockLayout />, caption: 'How many records fit in a block is the single most important number in a cost estimate.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Blocking factor</b> = ⌊ block size / record size ⌋ — how many records fit in one block. Higher is
              better, because it means fewer blocks to scan.
            </>,
            <>
              <b>Fixed-length records</b> are simple: the i-th record starts at a computable offset. Deletion leaves
              a gap, usually tracked with a free list.
            </>,
            <>
              <b>Variable-length records</b> (from VARCHAR or repeating fields) need a length prefix or field
              delimiters, plus a <b>slotted page</b> layout: a header of offsets at the front, records growing from
              the back, and free space in the middle.
            </>,
            <>
              <b>Spanned</b> records may cross a block boundary — no wasted space, but reading one record can cost
              two I/Os. <b>Unspanned</b> keeps each record inside one block, wasting the remainder.
            </>,
          ],
        },
      ],
    },

    {
      id: 'organizations',
      heading: 'The five file organizations',
      blocks: [
        {
          k: 'steps',
          items: [
            {
              t: 'Heap (unordered) file',
              d: 'New records are appended wherever there is space. Insertion is O(1) and superb; any search is a full scan of every block. This is the default for a table with no clustered index.',
            },
            {
              t: 'Sequential (ordered) file',
              d: 'Records are kept sorted on a key. Range queries and binary search are fast, but every insert in the middle needs shifting — so real implementations write into an overflow area and periodically reorganise.',
            },
            {
              t: 'Hash file',
              d: 'A hash function on the key decides the block. Equality search is roughly one I/O, which is unbeatable. Range queries are impossible, because hashing destroys ordering.',
            },
            {
              t: 'Clustered file',
              d: 'Records of two related tables are physically interleaved on the same blocks, so the join reads them together. Brilliant for one specific join, bad for scanning either table alone.',
            },
            {
              t: 'ISAM (Indexed Sequential Access Method)',
              d: 'A sorted file plus a static index over it. Fast until the overflow chains grow, at which point it degrades — the problem B+ trees were invented to fix.',
            },
          ],
        },
        {
          k: 'table',
          head: ['Organization', 'Equality search', 'Range search', 'Insert', 'Full scan'],
          rows: [
            ['Heap', 'Slow — full scan', 'Slow — full scan', 'Very fast', 'Fast (sequential)'],
            ['Sequential', 'Fast — binary search', 'Very fast', 'Slow — shifting or overflow', 'Fast'],
            ['Hash', 'Very fast — ~1 I/O', 'Impossible', 'Fast until buckets overflow', 'Fast'],
            ['Clustered', 'Fast for the clustering key', 'Fast for the clustering key', 'Moderate', 'Slow for a single table'],
            ['ISAM', 'Fast', 'Fast', 'Degrades as overflows grow', 'Fast'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why can a hash file not do range queries?',
          text: (
            <>
              Because a good hash function deliberately <b>destroys order</b> — it scatters similar keys into
              distant buckets so the load is even. Keys 100 and 101 may land in buckets far apart, so there is no
              way to walk a range without visiting every bucket.
            </>
          ),
        },
      ],
    },

    {
      id: 'buffer',
      heading: 'The buffer manager',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The DBMS keeps a pool of blocks in memory — the <b>buffer pool</b> — and serves reads from it whenever
              it can. Getting a high hit rate here matters more than almost any other tuning knob.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Replacement policy</b> — which block to evict when the pool is full. LRU is the usual starting
              point, but a plain full-table scan destroys an LRU pool, so systems use variants like LRU-K or clock
              with scan resistance.
            </>,
            <>
              <b>Pinning</b> — a block in use cannot be evicted.
            </>,
            <>
              <b>Dirty pages</b> — modified blocks must be written back, and WAL forces the log out first.
            </>,
            <>
              <b>Forced vs no-force output</b> — whether a transaction's pages must be flushed at commit. Real
              systems use <b>no-force</b> (flush lazily, rely on redo) plus <b>steal</b> (allow uncommitted pages
              to be written, rely on undo), which is why both undo and redo are needed.
            </>,
          ],
        },
      ],
    },

    {
      id: 'raid',
      heading: 'RAID — surviving disk failure',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              RAID combines several physical disks into one logical volume for speed, reliability or both. Two ideas
              underlie all of it: <b>striping</b> (spread data across disks for parallel I/O) and{' '}
              <b>redundancy</b> (mirror or compute parity so a failure loses nothing).
            </>
          ),
        },
        {
          k: 'table',
          head: ['Level', 'Technique', 'Redundancy', 'Notes'],
          rows: [
            ['RAID 0', 'Striping only', 'None', 'Fastest, but one disk failure loses everything'],
            ['RAID 1', 'Mirroring', 'Full copy', 'Excellent reads and reliability; 50% storage efficiency'],
            ['RAID 5', 'Striping + distributed parity', 'Survives 1 failure', 'Good balance; writes pay a read-modify-write parity penalty'],
            ['RAID 6', 'Striping + double parity', 'Survives 2 failures', 'Safer for large arrays where rebuilds take hours'],
            ['RAID 10', 'Mirrored stripes', 'Survives 1 per mirror', 'The usual choice for write-heavy databases'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              RAID is <b>not a backup</b>. It protects against a disk dying; it faithfully replicates an accidental
              delete, a corruption or a bad migration to every disk instantly.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why do database cost models count disk I/Os rather than CPU time?',
      a: (
        <>
          Because a disk block read is orders of magnitude slower than any in-memory computation — milliseconds
          versus nanoseconds. The number of block transfers dominates the runtime of almost every query, so it is
          the unit the optimizer estimates in.
        </>
      ),
    },
    {
      q: 'What is blocking factor?',
      a: (
        <>
          The number of records that fit in one disk block: <code>⌊ block size / record size ⌋</code>. It determines
          how many blocks a table occupies, and therefore the I/O cost of scanning it.
        </>
      ),
    },
    {
      q: 'Spanned vs unspanned records?',
      a: (
        <>
          <b>Spanned</b> records may cross a block boundary — no wasted space, but reading one record can require
          two block reads. <b>Unspanned</b> keeps every record wholly inside one block, which is simpler and faster
          but wastes the leftover bytes at the end of each block.
        </>
      ),
    },
    {
      q: 'What is a heap file and when is it the right choice?',
      a: (
        <>
          An unordered file where records are appended wherever there is room. Insertion is extremely fast and any
          search is a full scan — so it suits write-heavy tables, staging and log tables that are always read in
          full anyway.
        </>
      ),
    },
    {
      q: 'Why can hash organization not support range queries?',
      a: (
        <>
          A hash function intentionally scatters similar keys to spread the load evenly, which destroys ordering.
          Adjacent key values land in unrelated buckets, so a range scan would have to visit every bucket.
        </>
      ),
    },
    {
      q: 'What is a slotted page?',
      a: (
        <>
          A page layout for variable-length records: a header at the front holds a slot directory of (offset,
          length) pairs, records grow inward from the back, and free space sits in the middle. It lets records be
          moved within the page for compaction without invalidating external record ids, which point at slots
          rather than at offsets.
        </>
      ),
    },
    {
      q: 'What do "steal" and "no-force" mean in buffer management?',
      a: (
        <>
          <b>Steal</b> means the buffer manager may write an uncommitted transaction's dirty page to disk — so
          recovery needs <b>undo</b>. <b>No-force</b> means committed pages need not be flushed at commit time — so
          recovery needs <b>redo</b>. Real systems use steal/no-force, which is exactly why they implement both.
        </>
      ),
    },
    {
      q: 'Difference between RAID 1 and RAID 5?',
      a: (
        <>
          RAID 1 <b>mirrors</b> — a full copy on a second disk, giving excellent read speed and simple recovery at
          50% storage efficiency. RAID 5 <b>stripes with distributed parity</b> — better storage efficiency and
          still survives one disk failure, but writes pay a read-modify-write penalty to update parity.
        </>
      ),
    },
    {
      q: 'Is RAID a substitute for backups?',
      a: (
        <>
          No. RAID protects against hardware failure only. A dropped table, an application bug or a corruption is
          replicated to every disk instantly. You need backups plus an archived log for point-in-time recovery.
        </>
      ),
    },
  ],
};

export default topic;
