import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** RAID 0 / 1 / 5 side by side. */
function RaidLevels() {
  const disk = (x: number, y: number, label: string, c: 'a' | 'b' | 'c' | 'n') => (
    <Box key={`${x}-${y}-${label}`} x={x} y={y} w={56} h={26} label={label} c={c} fs={10.5} r={4} />
  );
  return (
    <Dg w={620} h={228} cap="Striping spreads data for speed; mirroring and parity buy the ability to survive a failure">
      <Frame x={2} y={8} w={200} h={210} label="RAID 0 — striping" c="a" />
      {disk(24, 46, 'D1', 'a')}
      {disk(88, 46, 'D2', 'a')}
      {disk(24, 78, 'D3', 'a')}
      {disk(88, 78, 'D4', 'a')}
      <Txt x={102} y={132} fs={10.5} soft>
        fastest, full capacity
      </Txt>
      <Txt x={102} y={156} fs={10.5} bold c="c">
        one disk dies → all data lost
      </Txt>

      <Frame x={212} y={8} w={200} h={210} label="RAID 1 — mirroring" c="b" />
      {disk(240, 46, 'D1', 'b')}
      {disk(310, 46, 'D1', 'b')}
      {disk(240, 78, 'D2', 'b')}
      {disk(310, 78, 'D2', 'b')}
      <Arrow x1={300} y1={59} x2={306} y2={59} c="n" plain />
      <Txt x={312} y={132} fs={10.5} soft>
        survives a disk failure
      </Txt>
      <Txt x={312} y={156} fs={10.5} bold c="c">
        only 50% of the space usable
      </Txt>

      <Frame x={422} y={8} w={196} h={210} label="RAID 5 — striping + parity" c="c" />
      {disk(444, 46, 'D1', 'c')}
      {disk(506, 46, 'D2', 'c')}
      {disk(568, 46, 'P', 'n')}
      {disk(444, 78, 'D3', 'c')}
      {disk(506, 78, 'P', 'n')}
      {disk(568, 78, 'D4', 'c')}
      <Txt x={520} y={132} fs={10.5} soft>
        parity spread across disks
      </Txt>
      <Txt x={520} y={156} fs={10.5} bold c="b">
        survives one failure, ~n−1 usable
      </Txt>
      <Txt x={520} y={186} fs={10} soft>
        writes pay a parity penalty
      </Txt>
    </Dg>
  );
}

/** Spooling lets the CPU hand work to a queue instead of waiting on a slow device. */
function Spooling() {
  return (
    <Dg w={600} h={210} cap="The spool queue decouples a fast CPU from a slow device">
      <Box x={20} y={72} w={110} h={54} label="CPU" sub="fast" c="a" />
      <Arrow x1={132} y1={99} x2={172} y2={99} c="a" label="job" dy={-9} />
      <Frame x={176} y={54} w={224} h={92} label="SPOOL — a queue on disk" c="n" />
      {['job 1', 'job 2', 'job 3'].map((j, i) => (
        <Box key={j} x={192 + i * 68} y={86} w={62} h={30} label={j} c="b" fs={10.5} r={4} />
      ))}
      <Arrow x1={404} y1={99} x2={444} y2={99} c="b" label="one at a time" dy={-9} dx={4} />
      <Box x={448} y={72} w={132} h={54} label="PRINTER" sub="slow" c="c" />

      <Txt x={300} y={178} fs={10.5} soft>
        the CPU drops the job and moves on instead of blocking for the printer
      </Txt>
      <Txt x={300} y={198} fs={10.5} soft>
        Simultaneous Peripheral Operations On-Line
      </Txt>
    </Dg>
  );
}

/** Direct mapping forces one slot; associative allows any. */
function CacheMapping() {
  const slot = (x: number, y: number, label: string, c: 'a' | 'b' | 'n') => (
    <Box key={`${x}-${y}`} x={x} y={y} w={92} h={26} label={label} c={c} fs={10.5} r={4} />
  );
  return (
    <Dg w={608} h={240} cap="Where a memory block is allowed to sit in the cache">
      <Frame x={2} y={8} w={292} h={224} label="DIRECT MAPPING" c="a" />
      <Txt x={148} y={38} fs={10.5} soft>
        block 12 → slot (12 mod 4) = 0. Only there.
      </Txt>
      {slot(100, 52, 'slot 0 ← blk 12', 'a')}
      {slot(100, 84, 'slot 1', 'n')}
      {slot(100, 116, 'slot 2', 'n')}
      {slot(100, 148, 'slot 3', 'n')}
      <Txt x={148} y={200} fs={10.5} bold c="c">
        block 8 also maps to slot 0 →
      </Txt>
      <Txt x={148} y={218} fs={10.5} bold c="c">
        they evict each other, 3 slots idle
      </Txt>

      <Frame x={314} y={8} w={292} h={224} label="ASSOCIATIVE MAPPING" c="b" />
      <Txt x={460} y={38} fs={10.5} soft>
        block 12 may go into any free slot.
      </Txt>
      {slot(412, 52, 'slot 0 ← blk 12', 'b')}
      {slot(412, 84, 'slot 1 ← blk 8', 'b')}
      {slot(412, 116, 'slot 2', 'n')}
      {slot(412, 148, 'slot 3', 'n')}
      <Txt x={460} y={200} fs={10.5} bold c="b">
        no conflicts while space remains —
      </Txt>
      <Txt x={460} y={218} fs={10.5} soft>
        but every slot must be searched
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-storage-hardware',
  num: 6,
  unit: 'Concurrency & Storage',
  title: 'RAID, Spooling & Cache',
  blurb:
    'RAID levels and what each one buys, spooling as a decoupling buffer, cache and locality of reference, and direct versus associative mapping.',
  minutes: 11,
  tags: ['Theory question'],

  sections: [
    {
      id: 'raid',
      heading: 'RAID and its levels',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>RAID</b> — Redundant Array of Independent Disks — combines several physical disks into one logical
              unit to improve speed, reliability, or both. Two ideas underlie every level: <b>striping</b> (spread
              data across disks so they can be read in parallel) and <b>redundancy</b> (mirror the data or compute
              parity so a failure loses nothing).
            </>
          ),
        },
        { k: 'diagram', el: <RaidLevels />, caption: 'P = parity, computed from the data blocks on the other disks.' },
        {
          k: 'table',
          head: ['Level', 'Technique', 'Survives', 'Usable space', 'Notes'],
          rows: [
            ['RAID 0', 'Striping only', 'Nothing', '100%', 'Fastest; one failure loses everything'],
            ['RAID 1', 'Mirroring', '1 disk', '50%', 'Excellent reads, simple recovery'],
            ['RAID 5', 'Striping + distributed parity', '1 disk', '~(n−1)/n', 'Good balance; writes pay a parity penalty'],
            ['RAID 10', 'Mirroring + striping', '1 per mirror', '50%', 'Fast and safe; needs the most disks'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>RAID is not a backup.</b> It protects against a disk dying. An accidental delete, a corruption or a
              bad migration is replicated to every disk instantly.
            </>
          ),
        },
      ],
    },

    {
      id: 'spooling',
      heading: 'Spooling',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Spooling</b> — Simultaneous Peripheral Operations On-Line — temporarily stores data in a buffer or
              queue, usually on disk, before sending it to a slow device such as a printer.
            </>
          ),
        },
        { k: 'diagram', el: <Spooling />, caption: 'Print jobs queue in the spooler while you keep using the machine.' },
        {
          k: 'p',
          text: (
            <>
              The point is <b>decoupling</b>: the CPU hands the job to the spool and immediately gets on with
              something else, instead of idling at the speed of the device. It also lets several programs submit to
              one device without their output interleaving.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Compare with <b>buffering</b>: buffering smooths the speed difference <i>within</i> a single transfer
              (a small in-memory area), while spooling queues <i>whole jobs</i> on disk so an entire task can wait
              its turn. Spooling is buffering scaled up to job granularity.
            </>
          ),
        },
      ],
    },

    {
      id: 'cache',
      heading: 'Cache',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A small, very fast memory close to the CPU holding frequently used data and instructions, so the CPU
              does not fetch them from slower main memory every time.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              It works because of <b>locality of reference</b>: recently or frequently used data is likely to be
              used again soon (<b>temporal</b> locality), and data near what you just used is likely to be needed
              next (<b>spatial</b> locality — which is why a whole cache line is fetched, not one byte).
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>L1</b> — smallest and fastest, private to each core.
            </>,
            <>
              <b>L2</b> — larger and slower, usually per core.
            </>,
            <>
              <b>L3</b> — largest and slowest of the three, shared between cores.
            </>,
          ],
        },
      ],
    },

    {
      id: 'mapping',
      heading: 'Direct vs associative mapping',
      blocks: [
        { k: 'diagram', el: <CacheMapping />, caption: 'The trade-off is conflict misses against search hardware.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Direct mapping</b> — each memory block maps to exactly one specific cache location. Simple and
              fast, but two blocks competing for the same slot keep evicting each other even while the rest of the
              cache sits empty.
            </>,
            <>
              <b>Associative mapping</b> — a memory block can go into <i>any</i> cache location. Far fewer
              conflicts, but the hardware must search every location for a match, which is expensive.
            </>,
            <>
              <b>Set-associative mapping</b> — the middle ground used in practice: a block maps to a small group
              (a "set") of locations, so only that set is searched. A 4-way set-associative cache gives most of the
              benefit at a fraction of the cost.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['', 'Direct', 'Fully associative', 'Set-associative'],
          rows: [
            ['Placement', 'One fixed slot', 'Anywhere', 'Anywhere within one set'],
            ['Search cost', 'One comparison', 'Compare every slot', 'Compare the slots in one set'],
            ['Conflict misses', 'Many', 'None', 'Few'],
            ['Hardware', 'Cheapest', 'Most expensive', 'Practical compromise'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is RAID and what are the common levels?',
      a: (
        <>
          Combining several physical disks into one logical unit for speed, reliability or both. <b>RAID 0</b>{' '}
          stripes (fast, no redundancy); <b>RAID 1</b> mirrors (safe, 50% usable); <b>RAID 5</b> stripes with
          distributed parity (survives one failure, good capacity); <b>RAID 10</b> combines mirroring and striping.
        </>
      ),
    },
    {
      q: 'Why does RAID 5 have a write penalty?',
      a: (
        <>
          Updating one block requires the parity for that stripe to be recomputed, which means reading the old data
          and old parity, computing the new parity, then writing both — up to four I/Os for a single logical write.
          Mirroring has no such penalty, which is why write-heavy databases often prefer RAID 10.
        </>
      ),
    },
    {
      q: 'Is RAID a backup?',
      a: (
        <>
          No. It only protects against <b>hardware failure</b>. A deleted table, a corrupted file or a bad migration
          is faithfully written to every disk. You still need real backups plus an archived log.
        </>
      ),
    },
    {
      q: 'What is spooling and why is it used?',
      a: (
        <>
          Queuing whole jobs in a buffer (usually on disk) before sending them to a slow device. It{' '}
          <b>decouples</b> a fast CPU from a slow peripheral, so the CPU never blocks waiting on it, and it keeps
          output from several programs from interleaving on the same device.
        </>
      ),
    },
    {
      q: 'Difference between spooling and buffering?',
      a: (
        <>
          <b>Buffering</b> smooths the speed mismatch <i>within</i> one transfer using a small memory area, and the
          producer and consumer overlap on the same job. <b>Spooling</b> queues <i>entire jobs</i>, usually on disk,
          so one job is served completely while others wait their turn.
        </>
      ),
    },
    {
      q: 'What is cache and what principle makes it work?',
      a: (
        <>
          A small fast memory near the CPU holding frequently used data. It works because of{' '}
          <b>locality of reference</b>: <b>temporal</b> (what you used recently you will likely use again) and{' '}
          <b>spatial</b> (what is near what you used will likely be needed next).
        </>
      ),
    },
    {
      q: 'Direct vs associative cache mapping?',
      a: (
        <>
          <b>Direct</b>: each memory block has exactly one permitted cache slot — one cheap comparison, but two hot
          blocks mapping to the same slot thrash while the rest of the cache is idle. <b>Associative</b>: a block
          may occupy any slot — no conflict misses, but every slot must be searched.{' '}
          <b>Set-associative</b> is the practical compromise.
        </>
      ),
    },
    {
      q: 'Why are caches organised in levels (L1, L2, L3)?',
      a: (
        <>
          Speed and size trade against each other and against cost. A small L1 can answer in a couple of cycles but
          cannot hold much; a large L3 holds far more but is slower. Layering gives most accesses L1 latency while
          still catching the misses in progressively larger levels before paying the full cost of main memory.
        </>
      ),
    },
  ],
};

export default topic;
