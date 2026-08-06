import { Arrow, Box, Dg, Frame, MemMap, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** Virtual pages mapped through a page table into frames, with the rest on disk. */
function VirtualMemory() {
  return (
    <Dg w={620} h={266} cap="The page table turns page numbers into frame numbers; pages not in RAM live on disk">
      <Txt x={70} y={26} fs={11} bold c="c">
        process's view
      </Txt>
      {['page 0', 'page 1', 'page 2', 'page 3'].map((p, i) => (
        <Box key={p} x={16} y={44 + i * 40} w={108} h={32} label={p} c="c" fs={11} />
      ))}

      <Txt x={244} y={26} fs={11} bold c="a">
        page table
      </Txt>
      <Box x={168} y={44} w={152} h={152} label="" c="a" ghost />
      {[
        ['0 → frame 2', 'a'],
        ['1 → on disk', 'n'],
        ['2 → frame 0', 'a'],
        ['3 → frame 3', 'a'],
      ].map(([t, c], i) => (
        <Box key={t} x={178} y={54 + i * 34} w={132} h={28} label={t} c={c as 'a' | 'n'} fs={10.5} r={4} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={126} y1={60 + i * 40} x2={166} y2={68 + i * 34} c="n" />
      ))}

      <Txt x={430} y={26} fs={11} bold c="b">
        physical RAM
      </Txt>
      {['frame 0 — pg 2', 'frame 1 — free', 'frame 2 — pg 0', 'frame 3 — pg 3'].map((f, i) => (
        <Box key={f} x={366} y={44 + i * 38} w={130} h={30} label={f} c={f.includes('free') ? 'n' : 'b'} fs={10} />
      ))}

      <Box x={520} y={100} w={90} h={62} label="DISK" sub="page 1" c="n" />
      <Arrow x1={518} y1={131} x2={500} y2={131} c="c" dashed label="page fault" dy={-8} dx={-6} />

      <Txt x={310} y={232} fs={10.5} soft>
        the program believes it has one big contiguous memory — the OS quietly keeps only part of it in RAM
      </Txt>
      <Txt x={310} y={254} fs={10.5} soft>
        a reference to a page that is not resident triggers a page fault, and the OS fetches it
      </Txt>
    </Dg>
  );
}

/** Internal fragmentation wastes space inside a block; external between blocks. */
function Fragmentation() {
  return (
    <Dg w={608} h={286} cap="Internal fragmentation is waste inside an allocation; external is waste between them">
      <Frame x={2} y={8} w={292} h={270} label="INTERNAL" c="a" />
      <MemMap
        x={86}
        y={54}
        w={124}
        px={0.5}
        regions={[
          { label: 'process A', size: 60, c: 'a' },
          { label: 'wasted', size: 20, hole: true },
          { label: 'process B', size: 70, c: 'a' },
          { label: 'wasted', size: 30, hole: true },
        ]}
      />
      <Txt x={148} y={244} fs={10.5} soft>
        each process got a bigger block
      </Txt>
      <Txt x={148} y={262} fs={10.5} soft>
        than it asked for — the slack is lost
      </Txt>

      <Frame x={314} y={8} w={292} h={270} label="EXTERNAL" c="c" />
      <MemMap
        x={398}
        y={54}
        w={124}
        px={0.5}
        regions={[
          { label: 'process A', size: 50, c: 'b' },
          { label: 'free 30K', size: 30, hole: true },
          { label: 'process B', size: 40, c: 'b' },
          { label: 'free 30K', size: 30, hole: true },
          { label: 'process C', size: 30, c: 'b' },
        ]}
      />
      <Txt x={460} y={244} fs={10.5} soft>
        60K free in total, but a 50K job
      </Txt>
      <Txt x={460} y={262} fs={10.5} bold c="c">
        still will not fit — no single hole is big enough
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-memory',
  num: 3,
  unit: 'Memory & Scheduling',
  title: 'Virtual Memory, Paging & Fragmentation',
  blurb:
    "Virtual memory and thrashing, paging and demand paging, segmentation, the two kinds of fragmentation, and Belady's anomaly.",
  minutes: 14,
  tags: ['Very common'],

  sections: [
    {
      id: 'virtual-memory',
      heading: 'Virtual memory and thrashing',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Virtual memory</b> lets a program use more memory than the RAM actually available, by using part of
              the disk as "extra RAM". The OS swaps data between RAM and disk as needed, making RAM feel bigger than
              it is.
            </>
          ),
        },
        { k: 'diagram', el: <VirtualMemory />, caption: 'Every memory reference goes through the page table.' },
        {
          k: 'p',
          text: (
            <>
              <b>Thrashing</b> is when the CPU spends more time swapping pages in and out than doing useful work.
              Performance collapses, because everything is busy moving data rather than processing it.
            </>
          ),
        },
        { k: 'h', text: 'Why thrashing occurs' },
        {
          k: 'p',
          text: (
            <>
              Too many processes are running with too little RAM, so the OS constantly swaps pages. The root cause
              is that the <b>degree of multiprogramming is too high</b> for the available memory: each process gets
              too few frames to hold its working set, so every process page-faults almost immediately after being
              scheduled.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The cruel feedback loop',
          text: (
            <>
              CPU utilisation drops because everyone is blocked on disk. The OS sees idle CPU and concludes it
              should admit <i>more</i> processes — which takes frames away from the existing ones and makes the
              thrashing worse. The fixes are to <b>reduce the degree of multiprogramming</b> (suspend some
              processes) or to allocate frames by <b>working-set size</b> rather than evenly.
            </>
          ),
        },
      ],
    },

    {
      id: 'paging',
      heading: 'Paging',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Memory is divided into fixed-size blocks: <b>pages</b> in the process and <b>frames</b> in RAM, both
              the same size. A process's pages can sit in <i>any</i> available frames — they do not have to be next
              to each other.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Why we need it:</b> it removes the requirement that a process occupy one continuous block of
              memory. That solves <b>external fragmentation</b> completely and lets the OS use whatever scattered
              frames are free.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Paging kills external fragmentation but introduces a little <b>internal</b> fragmentation instead: the
              last page of a process is rarely exactly full, so on average half a page per process is wasted. That
              is a very cheap price compared to unusable scattered holes.
            </>
          ),
        },
      ],
    },

    {
      id: 'demand-paging',
      heading: 'Demand paging and segmentation',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Demand paging</b> — pages are loaded into RAM only when they are actually needed, saving memory and
              startup time. If a needed page is not resident, a <b>page fault</b> occurs and the OS fetches it from
              disk.
            </>,
            <>
              <b>Segmentation</b> — memory is divided into <b>variable-sized segments</b> based on the logical units
              of a program (code, data, stack) rather than fixed-size blocks, matching how a programmer actually
              thinks about a program's structure.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['', 'Paging', 'Segmentation'],
          rows: [
            ['Block size', 'Fixed', 'Variable'],
            ['Divided by', 'The OS, mechanically', 'The program\'s logical structure'],
            ['Visible to the programmer', 'No', 'Yes'],
            ['Fragmentation', 'Internal only', 'External only'],
            ['Address', 'Page number + offset', 'Segment number + offset'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Real systems often use <b>segmentation with paging</b>: segments give the logical view a programmer
              wants, and each segment is then paged so no contiguous physical memory is required. You get the
              benefits of both and only internal fragmentation.
            </>
          ),
        },
      ],
    },

    {
      id: 'fragmentation',
      heading: 'Fragmentation',
      blocks: [
        {
          k: 'p',
          text: <>Fragmentation means memory is wasted because it has been split into small, unusable pieces.</>,
        },
        { k: 'diagram', el: <Fragmentation />, caption: 'The same total free bytes — but only one of these can accept a new 50K process.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Internal fragmentation</b> — a process is given more memory than it needs, and the leftover space
              <i> inside</i> that block is wasted. Caused by fixed-size allocation.
            </>,
            <>
              <b>External fragmentation</b> — free memory is scattered in small chunks <i>between</i> allocated
              blocks, so even though the total free memory is enough, no single chunk is big enough for a new
              process.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              External fragmentation can also be fixed by <b>compaction</b> — sliding allocated blocks together to
              merge the holes. It works, but it is expensive and requires relocatable addresses, which is why paging
              is the preferred answer.
            </>
          ),
        },
      ],
    },

    {
      id: 'belady',
      heading: "Belady's anomaly",
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Normally, more memory frames should mean fewer page faults. <b>Belady's anomaly</b> is the strange
              case where <b>increasing the number of frames actually increases the number of page faults</b>. It
              happens with <b>FIFO</b> page replacement, and does not happen with LRU or Optimal.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The classic demonstration — reference string 1 2 3 4 1 2 5 1 2 3 4 5, FIFO',
          code: `THREE FRAMES
ref    1   2   3   4   1   2   5   1   2   3   4   5
       F   F   F   F   F   F   F   ·   ·   F   F   ·
                                                        9 page faults

FOUR FRAMES
ref    1   2   3   4   1   2   5   1   2   3   4   5
       F   F   F   F   ·   ·   F   F   F   F   F   F
                                                       10 page faults

More memory, MORE faults. F = fault, · = hit.`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why FIFO and not LRU?',
          text: (
            <>
              LRU is a <b>stack algorithm</b>: the set of pages held with n frames is always a subset of the set
              held with n+1 frames, so adding a frame can never lose a page you would have kept. FIFO has no such
              guarantee — it evicts by arrival order, ignoring use, so a bigger buffer can change the eviction
              pattern for the worse. Saying "FIFO is not a stack algorithm" is the precise answer.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is virtual memory?',
      a: (
        <>
          A technique that lets a process use more address space than the physical RAM, by keeping only part of it
          resident and holding the rest on disk. The page table maps virtual pages to physical frames, and a
          reference to a non-resident page causes a page fault that the OS services.
        </>
      ),
    },
    {
      q: 'What is thrashing and why does it happen?',
      a: (
        <>
          The system spends more time swapping pages than executing. It happens when the <b>degree of
          multiprogramming is too high</b> for the available memory, so no process holds enough frames for its
          working set. It is self-worsening: CPU utilisation drops, the OS admits more processes, and the frames per
          process shrink further.
        </>
      ),
    },
    {
      q: 'What is paging and what problem does it solve?',
      a: (
        <>
          Splitting memory into fixed-size pages (in the process) and frames (in RAM) so a process's pages can be
          placed in any free frames. It removes the need for contiguous allocation, which eliminates{' '}
          <b>external fragmentation</b>.
        </>
      ),
    },
    {
      q: 'Paging vs segmentation?',
      a: (
        <>
          Paging uses <b>fixed-size</b> blocks decided by the OS and is invisible to the programmer, causing only
          internal fragmentation. Segmentation uses <b>variable-sized</b> blocks matching the program's logical
          parts (code, data, stack) and is visible to the programmer, causing external fragmentation. Real systems
          often combine them.
        </>
      ),
    },
    {
      q: 'What is demand paging?',
      a: (
        <>
          Loading a page into memory only when it is first referenced, rather than loading the whole process up
          front. It cuts start-up time and memory use; the cost is a page fault on first touch of each page.
        </>
      ),
    },
    {
      q: 'Internal vs external fragmentation?',
      a: (
        <>
          <b>Internal</b> is wasted space <i>inside</i> an allocated block, because the block is bigger than
          requested — the price of fixed-size allocation. <b>External</b> is free space scattered <i>between</i>{' '}
          blocks: the total is sufficient but no single hole is large enough. Paging removes external; compaction is
          the alternative fix.
        </>
      ),
    },
    {
      q: "What is Belady's anomaly?",
      a: (
        <>
          The counter-intuitive case where adding more frames <b>increases</b> page faults. It occurs with{' '}
          <b>FIFO</b> replacement — the classic string 1 2 3 4 1 2 5 1 2 3 4 5 gives 9 faults with three frames but
          10 with four.
        </>
      ),
    },
    {
      q: "Why doesn't LRU suffer Belady's anomaly?",
      a: (
        <>
          Because LRU is a <b>stack algorithm</b>: the pages resident with n frames are always a subset of those
          resident with n+1 frames, so more memory can never evict something you would otherwise have kept. FIFO
          orders by arrival rather than use, so it lacks that property.
        </>
      ),
    },
    {
      q: 'What is a page fault, and is it an error?',
      a: (
        <>
          A trap raised when a process references a page that is not currently in RAM. It is <b>not an error</b> —
          it is the normal mechanism of demand paging. The OS finds the page on disk, loads it into a free (or
          evicted) frame, updates the page table and restarts the instruction.
        </>
      ),
    },
  ],
};

export default topic;
