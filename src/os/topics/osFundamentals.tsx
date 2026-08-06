import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** The OS as the layer between programs and hardware. */
function OsLayers() {
  return (
    <Dg w={560} h={266} cap="The OS sits between what you run and the hardware it runs on">
      <Box x={80} y={16} w={400} h={44} label="User & applications" sub="browser, editor, games" c="c" />
      <Arrow x1={280} y1={60} x2={280} y2={84} c="n" both />
      <Frame x={60} y={88} w={440} h={110} label="OPERATING SYSTEM" c="a" />
      <Box x={78} y={114} w={196} h={34} label="Process manager" c="a" fs={11.5} />
      <Box x={286} y={114} w={196} h={34} label="Memory manager" c="a" fs={11.5} />
      <Box x={78} y={156} w={196} h={34} label="File system" c="a" fs={11.5} />
      <Box x={286} y={156} w={196} h={34} label="Device / I-O manager" c="a" fs={11.5} />
      <Arrow x1={280} y1={198} x2={280} y2={222} c="n" both />
      <Box x={80} y={224} w={400} h={40} label="Hardware" sub="CPU · RAM · disk · devices" c="b" />
    </Dg>
  );
}

/** Monolithic keeps everything in kernel mode; a microkernel keeps almost nothing. */
function KernelKinds() {
  return (
    <Dg w={608} h={248} cap="Monolithic puts the whole OS in kernel mode; a microkernel pushes services into user mode">
      <Frame x={2} y={8} w={292} h={232} label="MONOLITHIC (Linux)" c="a" />
      <Box x={22} y={40} w={252} h={30} label="user programs" c="n" fs={11} />
      <Txt x={148} y={86} fs={9.5} soft>
        ── kernel-mode boundary ──
      </Txt>
      <Box x={22} y={94} w={252} h={124} label="" c="a" ghost />
      <Box x={34} y={104} w={112} h={30} label="scheduler" c="a" fs={10.5} />
      <Box x={152} y={104} w={112} h={30} label="memory" c="a" fs={10.5} />
      <Box x={34} y={140} w={112} h={30} label="file system" c="a" fs={10.5} />
      <Box x={152} y={140} w={112} h={30} label="drivers" c="a" fs={10.5} />
      <Box x={34} y={176} w={230} h={30} label="IPC + everything else" c="a" fs={10.5} />
      <Txt x={148} y={232} fs={10} soft>
        fast — no crossings; one bug can take the system down
      </Txt>

      <Frame x={314} y={8} w={292} h={232} label="MICROKERNEL" c="b" />
      <Box x={334} y={34} w={116} h={28} label="file system" c="n" fs={10.5} />
      <Box x={458} y={34} w={116} h={28} label="drivers" c="n" fs={10.5} />
      <Box x={334} y={66} w={240} h={28} label="user programs" c="n" fs={10.5} />
      <Txt x={454} y={112} fs={9.5} soft>
        ── kernel-mode boundary ──
      </Txt>
      <Box x={334} y={120} w={240} h={62} label="IPC · scheduling" sub="bare minimum only" c="b" fs={11.5} />
      <Txt x={454} y={210} fs={10} soft>
        a crashed driver is just a crashed
      </Txt>
      <Txt x={454} y={226} fs={10} soft>
        program — but more mode switches
      </Txt>
    </Dg>
  );
}

/** Multitasking interleaves on one CPU; multiprocessing runs truly in parallel. */
function TaskVsProcess() {
  const slot = (x: number, y: number, w: number, label: string, c: 'a' | 'b' | 'c') => (
    <Box key={`${x}-${y}-${label}`} x={x} y={y} w={w} h={26} label={label} c={c} fs={11} r={4} />
  );
  return (
    <Dg w={608} h={218} cap="One CPU switching quickly, versus several CPUs genuinely running at once">
      <Frame x={2} y={8} w={292} h={202} label="MULTITASKING — 1 CPU" c="a" />
      <Txt x={30} y={64} anchor="start" fs={10.5} soft>
        CPU
      </Txt>
      {slot(62, 50, 52, 'P1', 'a')}
      {slot(116, 50, 52, 'P2', 'b')}
      {slot(170, 50, 52, 'P3', 'c')}
      {slot(224, 50, 52, 'P1', 'a')}
      <Arrow x1={62} y1={92} x2={276} y2={92} c="n" label="time" dy={16} />
      <Txt x={148} y={140} fs={10.5} soft>
        one worker switching between jobs
      </Txt>
      <Txt x={148} y={158} fs={10.5} soft>
        so fast it looks simultaneous
      </Txt>
      <Txt x={148} y={186} fs={10.5} bold c="c">
        concurrent, not parallel
      </Txt>

      <Frame x={314} y={8} w={292} h={202} label="MULTIPROCESSING — N CPUs" c="b" />
      <Txt x={342} y={46} anchor="start" fs={10.5} soft>
        CPU 1
      </Txt>
      {slot(390, 32, 196, 'P1', 'a')}
      <Txt x={342} y={78} anchor="start" fs={10.5} soft>
        CPU 2
      </Txt>
      {slot(390, 64, 196, 'P2', 'b')}
      <Txt x={342} y={110} anchor="start" fs={10.5} soft>
        CPU 3
      </Txt>
      {slot(390, 96, 196, 'P3', 'c')}
      <Txt x={460} y={140} fs={10.5} soft>
        many workers, same moment
      </Txt>
      <Txt x={460} y={186} fs={10.5} bold c="b">
        genuinely parallel
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-fundamentals',
  num: 1,
  unit: 'Foundations',
  title: 'What an OS Does, Kernels & Types',
  blurb:
    'The purpose of an operating system and its six types, kernel vs socket vs monolithic, real-time systems, and multitasking versus multiprocessing.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'purpose',
      heading: 'Purpose of an OS, and its types',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              An OS is the <b>manager between you and the hardware</b>. It handles the CPU, memory, files and
              devices so you never have to talk to hardware directly. Its main jobs: run programs, manage memory,
              manage files, handle I/O devices, and keep things secure.
            </>
          ),
        },
        { k: 'diagram', el: <OsLayers />, caption: 'Every request from a program reaches hardware through the OS.' },
        {
          k: 'table',
          head: ['Type', 'What it is', 'Where you see it'],
          rows: [
            ['Batch OS', 'Jobs run in batches with no user interaction during execution', 'Old mainframes'],
            ['Time-sharing OS', 'CPU time is divided among users and programs so it feels like everyone runs at once', 'Multi-user servers'],
            ['Distributed OS', 'Manages separate computers and makes them look like one system', 'Clusters'],
            ['Real-Time OS', 'Must respond within a strict time limit', 'Medical devices, rockets'],
            ['Network OS', 'Manages data, users and security across a network', 'Server operating systems'],
            ['Mobile OS', 'Built around battery, touch and sensors', 'Android, iOS'],
          ],
        },
      ],
    },

    {
      id: 'kernel',
      heading: 'Kernel, socket and monolithic kernel',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Kernel</b> — the core of the OS. It talks directly to hardware (CPU, memory, devices) and controls
              everything else. The "brain" of the OS.
            </>,
            <>
              <b>Socket</b> — an endpoint for communication between two programs, usually over a network. One
              program plugs in at one end, another at the other, and data flows between them. Identified by IP +
              port.
            </>,
            <>
              <b>Monolithic kernel</b> — the entire OS (file system, memory management, drivers, everything) runs as
              one big program in kernel mode. Fast, because everything is in one place, but if one part crashes the
              whole system can crash. Linux is the example.
            </>,
          ],
        },
        { k: 'diagram', el: <KernelKinds />, caption: 'The opposite of monolithic is a microkernel, where only the bare minimum runs in kernel mode.' },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The trade-off in one sentence: <b>monolithic buys speed by putting everything in one privileged
              address space; a microkernel buys reliability by paying for message passing between user-mode
              services.</b>
            </>
          ),
        },
      ],
    },

    {
      id: 'rtos',
      heading: 'Real-Time Operating Systems',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              An RTOS processes data and responds within a <b>guaranteed, strict time limit</b>. Used where delays
              are unacceptable — pacemakers, airbags, robotics.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Kind', 'Missing a deadline means', 'Example'],
          rows: [
            ['Hard RTOS', 'Total failure — the system is wrong', 'Airbag deployment'],
            ['Soft RTOS', 'Undesirable but tolerable; quality degrades', 'Video streaming'],
            ['Firm RTOS', 'Occasional misses are tolerated, but that result is now useless', 'Some multimedia systems'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A real-time system is about <b>predictability</b>, not raw speed. An RTOS that always answers in 5 ms
              beats a general OS that usually answers in 1 ms but occasionally takes 200 ms.
            </>
          ),
        },
      ],
    },

    {
      id: 'memory-hierarchy',
      heading: 'Main memory vs secondary memory',
      blocks: [
        {
          k: 'table',
          head: ['', 'Main memory (RAM)', 'Secondary memory (disk / SSD)'],
          rows: [
            ['Persistence', 'Volatile — lost on power off', 'Non-volatile — data stays'],
            ['Speed', 'Very fast', 'Slower'],
            ['CPU access', 'Directly accessed by the CPU', 'Not directly accessed by the CPU'],
            ['Size', 'Smaller', 'Larger'],
            ['Cost per GB', 'Expensive', 'Cheaper'],
          ],
        },
      ],
    },

    {
      id: 'multitasking',
      heading: 'Multitasking vs multiprocessing',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Multitasking</b> — running multiple tasks on a <b>single CPU</b> by switching between them quickly.
              It looks simultaneous but is not truly parallel.
            </>,
            <>
              <b>Multiprocessing</b> — using <b>multiple CPUs or cores</b> to run multiple processes genuinely at
              the same time.
            </>,
          ],
        },
        { k: 'diagram', el: <TaskVsProcess />, caption: 'One worker juggling many jobs quickly, versus many workers each doing a job at the same actual moment.' },
      ],
    },
  ],

  interview: [
    {
      q: 'What is an operating system and what does it do?',
      a: (
        <>
          Software that manages hardware on behalf of programs and users. Its five main jobs are process management,
          memory management, file management, I/O device management and security — so that applications never talk
          to hardware directly.
        </>
      ),
    },
    {
      q: 'Name the types of operating system.',
      a: (
        <>
          <b>Batch</b>, <b>time-sharing</b>, <b>distributed</b>, <b>real-time</b>, <b>network</b> and <b>mobile</b>.
          The distinguishing question for each is who it serves and how strictly it must respond.
        </>
      ),
    },
    {
      q: 'What is a kernel?',
      a: (
        <>
          The core of the OS — the part that talks directly to hardware and controls memory, processes and devices.
          It runs in a privileged mode that ordinary programs cannot enter.
        </>
      ),
    },
    {
      q: 'Monolithic kernel vs microkernel?',
      a: (
        <>
          In a <b>monolithic</b> kernel the whole OS — file system, drivers, memory management — runs in kernel
          mode as one program: fast, but one bug can crash everything (Linux). A <b>microkernel</b> keeps only IPC
          and scheduling in kernel mode and pushes the rest into user-mode services: far more robust, at the cost of
          extra message passing.
        </>
      ),
    },
    {
      q: 'What is a socket?',
      a: (
        <>
          An endpoint for communication between two programs, typically across a network, identified by an IP
          address plus a port. One program binds one end, the other connects, and data flows between them.
        </>
      ),
    },
    {
      q: 'What is a real-time OS, and what are hard, soft and firm variants?',
      a: (
        <>
          An OS that guarantees a response within a strict deadline. <b>Hard</b>: missing the deadline is a total
          failure (airbags). <b>Soft</b>: missing it degrades quality but is survivable (streaming). <b>Firm</b>:
          occasional misses are tolerated, but the late result has no value.
        </>
      ),
    },
    {
      q: 'Multitasking vs multiprocessing?',
      a: (
        <>
          <b>Multitasking</b> interleaves several tasks on one CPU by switching quickly — concurrent but not
          parallel. <b>Multiprocessing</b> uses several CPUs or cores so processes genuinely execute at the same
          instant — truly parallel.
        </>
      ),
    },
    {
      q: 'Why is RAM called volatile, and why does that matter to the OS?',
      a: (
        <>
          Its contents are lost when power goes. It matters because everything the OS holds in memory — process
          state, buffered writes, page tables — must either be reconstructible or already flushed to non-volatile
          storage, which is exactly why file systems and databases keep write-ahead logs on disk.
        </>
      ),
    },
  ],
};

export default topic;
