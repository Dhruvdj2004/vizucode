import { Arrow, Box, Dg, Frame, Queue, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** Program on disk → process in memory → threads sharing it. */
function ProgramProcessThread() {
  return (
    <Dg w={608} h={252} cap="A program is a file, a process is that file running, threads live inside a process">
      <Box x={16} y={70} w={140} h={66} label="PROGRAM" sub="a file on disk" c="n" />
      <Txt x={86} y={154} fs={10} soft>
        passive
      </Txt>
      <Arrow x1={158} y1={103} x2={206} y2={103} c="c" label="run it" dy={-9} />

      <Frame x={210} y={40} w={192} h={140} label="PROCESS" c="a" />
      <Box x={224} y={68} w={164} h={26} label="own memory" c="a" fs={10.5} />
      <Box x={224} y={98} w={164} h={26} label="own resources" c="a" fs={10.5} />
      <Box x={224} y={128} w={164} h={26} label="own state (PCB)" c="a" fs={10.5} />
      <Txt x={306} y={198} fs={10} soft>
        active — isolated from other processes
      </Txt>

      <Arrow x1={404} y1={103} x2={440} y2={103} c="c" />
      <Frame x={442} y={40} w={162} h={140} label="THREADS" c="b" />
      <Box x={454} y={68} w={138} h={24} label="thread 1" c="b" fs={10.5} />
      <Box x={454} y={96} w={138} h={24} label="thread 2" c="b" fs={10.5} />
      <Box x={454} y={124} w={138} h={24} label="thread 3" c="b" fs={10.5} />
      <Txt x={523} y={198} fs={10} soft>
        share the process's memory
      </Txt>

      <Txt x={304} y={236} fs={10.5} soft>
        recipe → someone cooking from it in their own kitchen → several cooks sharing that kitchen
      </Txt>
    </Dg>
  );
}

/** A low-priority job repeatedly overtaken, then rescued by aging. */
function StarvationAging() {
  return (
    <Dg w={608} h={224} cap="Aging raises a waiting process's priority until it finally gets the CPU">
      <Frame x={2} y={8} w={292} h={208} label="STARVATION" c="c" />
      <Queue x={22} y={54} items={['P1', 'P2', 'P3', 'P4']} name="high priority — keeps arriving" c="a" bw={46} />
      <Box x={22} y={116} w={250} h={34} label="P9  (priority 1)" sub="waiting… still waiting…" c="c" fs={11.5} />
      <Txt x={148} y={182} fs={10.5} soft>
        the queue never empties, so P9
      </Txt>
      <Txt x={148} y={198} fs={10.5} soft>
        never runs — indefinite blocking
      </Txt>

      <Frame x={314} y={8} w={292} h={208} label="AGING — the fix" c="b" />
      <Box x={334} y={44} w={250} h={30} label="P9 waits 1s → priority 2" c="n" fs={11} />
      <Arrow x1={459} y1={74} x2={459} y2={86} c="b" />
      <Box x={334} y={88} w={250} h={30} label="P9 waits 2s → priority 5" c="n" fs={11} />
      <Arrow x1={459} y1={118} x2={459} y2={130} c="b" />
      <Box x={334} y={132} w={250} h={34} label="P9 now outranks the queue → runs" c="b" fs={11} />
      <Txt x={459} y={196} fs={10.5} soft>
        priority rises with waiting time
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-processes-threads',
  num: 2,
  unit: 'Foundations',
  title: 'Processes, Threads & Starvation',
  blurb:
    'Program vs process vs thread and the kinds of process, dynamic binding and linking, and how starvation is fixed by aging.',
  minutes: 10,
  free: true,
  tags: ['Very common'],

  sections: [
    {
      id: 'process-thread',
      heading: 'Program vs process vs thread',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Program</b> — a file on disk containing instructions, like an app installer. <b>Passive</b>: it is
              not running.
            </>,
            <>
              <b>Process</b> — a program that is actually running, with its own memory, resources and state.{' '}
              <b>Active</b>.
            </>,
            <>
              <b>Thread</b> — the smallest unit of execution <i>inside</i> a process. One process can have many
              threads that share the same memory but run independently.
            </>,
          ],
        },
        { k: 'diagram', el: <ProgramProcessThread />, caption: 'Program = recipe. Process = someone cooking from it in their own kitchen. Threads = several cooks sharing that kitchen.' },
        {
          k: 'note',
          tone: 'exam',
          title: 'Process vs thread — the follow-up',
          text: (
            <>
              Processes are <b>isolated</b>: each has its own address space, so a crash in one cannot corrupt
              another, and communication needs IPC. Threads <b>share</b> the process's address space, so
              communication is free but one bad write corrupts everyone — which is exactly why threads need
              synchronisation and processes mostly do not. Context switching between threads is also much cheaper,
              since the memory map does not change.
            </>
          ),
        },
        { k: 'h', text: 'Types of process' },
        {
          k: 'ul',
          items: [
            <>
              <b>Foreground</b> — interacts directly with the user.
            </>,
            <>
              <b>Background</b> — runs without user interaction, like an antivirus scan.
            </>,
            <>
              <b>Batch</b> — runs without user input, processed in groups.
            </>,
            <>
              <b>Daemon</b> — a background process that keeps running to provide a service, like a web server.
            </>,
          ],
        },
      ],
    },

    {
      id: 'dynamic-binding',
      heading: 'Dynamic binding and dynamic linking',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Dynamic binding</b> is deciding which piece of code to run at <b>runtime</b> rather than at compile
              time.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              With <b>dynamic linking</b>, a program does not embed library code inside itself — it links to the
              library only when it actually runs. That saves memory, because one copy of a shared library serves
              every program using it, and it lets libraries be updated without recompiling the programs that depend
              on them.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Static linking', 'Dynamic linking'],
          rows: [
            ['When resolved', 'At compile / link time', 'At load time or on first call'],
            ['Executable size', 'Larger — library code is copied in', 'Smaller — only a reference is stored'],
            ['Memory with many programs', 'Each has its own copy', 'One shared copy in memory'],
            ['Library update', 'Requires recompiling every program', 'Replace the library and restart'],
            ['Startup', 'Faster — nothing to resolve', 'Slightly slower — symbols resolved at load'],
          ],
        },
      ],
    },

    {
      id: 'starvation',
      heading: 'Starvation and aging',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Starvation</b> — a process waits indefinitely because the system keeps prioritising others over it.
              A low-priority process never gets the CPU because high-priority ones keep arriving.
            </>,
            <>
              <b>Aging</b> — the fix. The OS gradually <b>increases the priority of a process the longer it
              waits</b>, so eventually even a low-priority process is picked.
            </>,
          ],
        },
        { k: 'diagram', el: <StarvationAging />, caption: 'Aging converts waiting time into priority, guaranteeing every process eventually runs.' },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Do not confuse starvation with <b>deadlock</b>. In a deadlock nothing in the set can ever proceed. In
              starvation the system is making progress perfectly well — one unlucky process is just never chosen.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between a program, a process and a thread?',
      a: (
        <>
          A <b>program</b> is a passive file on disk. A <b>process</b> is that program in execution, with its own
          memory, resources and state. A <b>thread</b> is the smallest unit of execution inside a process; threads
          of one process share its memory but schedule independently.
        </>
      ),
    },
    {
      q: 'Process vs thread — which is more expensive and why?',
      a: (
        <>
          Processes. Creating one needs a fresh address space, and switching between them means swapping the memory
          map and flushing caches/TLB. Threads share the address space, so creation and switching are far cheaper —
          the trade-off is that they can corrupt each other's data and therefore need synchronisation.
        </>
      ),
    },
    {
      q: 'What are the types of process?',
      a: (
        <>
          <b>Foreground</b> (interacts with the user), <b>background</b> (runs without interaction),{' '}
          <b>batch</b> (no user input, processed in groups) and <b>daemon</b> (a long-lived background service such
          as a web server).
        </>
      ),
    },
    {
      q: 'What is dynamic binding?',
      a: (
        <>
          Deciding which code to execute at <b>runtime</b> rather than compile time. In the linking sense, a
          program references a library and resolves it when it runs — saving memory through sharing and allowing the
          library to be updated without recompiling the program.
        </>
      ),
    },
    {
      q: 'Static vs dynamic linking?',
      a: (
        <>
          <b>Static</b> copies library code into the executable: bigger binaries, duplicated in memory, but no
          runtime resolution and no missing-library failures. <b>Dynamic</b> links at load time: smaller binaries,
          one shared copy in memory, and libraries patchable independently — at the cost of slower startup and
          version-mismatch risk.
        </>
      ),
    },
    {
      q: 'What is starvation and how is it solved?',
      a: (
        <>
          A process waits indefinitely because the scheduler keeps preferring others — typical of strict priority
          scheduling when high-priority work keeps arriving. The fix is <b>aging</b>: raise a process's priority the
          longer it has waited, so it is eventually selected.
        </>
      ),
    },
    {
      q: 'Difference between starvation and deadlock?',
      a: (
        <>
          In a <b>deadlock</b> a set of processes is permanently blocked waiting on each other and none can ever
          proceed. In <b>starvation</b> the system as a whole progresses fine; a particular process is simply never
          scheduled. Deadlock needs detection or prevention; starvation needs fairness (aging).
        </>
      ),
    },
  ],
};

export default topic;
