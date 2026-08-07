import { Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** One process box containing several thread boxes that share the same memory area. */
function ThreadsProcessesDiagram() {
  return (
    <Dg w={600} h={260} cap="A process has its own memory; threads inside it share that memory">
      <Frame x={20} y={16} w={230} h={220} label="PROCESS A" c="a" />
      <Box x={45} y={50} w={80} h={40} label="Thread 1" c="a" fs={11} />
      <Box x={145} y={50} w={80} h={40} label="Thread 2" c="a" fs={11} />
      <Box x={45} y={110} w={180} h={40} label="Shared memory" sub="heap, globals" c="n" fs={11} />
      <Txt x={135} y={200} fs={11} soft>threads share the pantry</Txt>

      <Frame x={330} y={16} w={230} h={220} label="PROCESS B" c="b" />
      <Box x={355} y={50} w={80} h={40} label="Thread 1" c="b" fs={11} />
      <Box x={455} y={50} w={80} h={40} label="Thread 2" c="b" fs={11} />
      <Box x={355} y={110} w={180} h={40} label="Own memory" sub="isolated" c="n" fs={11} />
      <Txt x={445} y={200} fs={11} soft>separate building entirely</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'threads-processes',
  num: 48,
  unit: 'Concurrency Basics',
  title: 'Threads & Processes',
  blurb:
    'A process is an isolated unit of execution with its own memory; threads share memory within a process — the trade-off between isolation and speed.',
  minutes: 8,
  tags: ['Concurrency', 'Foundations'],

  sections: [
    {
      id: 'analogy',
      heading: 'The office building analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A <b>process</b> is like a separate office building — its own address, its own supplies, nothing
              leaks into the building next door. <b>Threads</b> are like employees inside the same building,
              sharing the same pantry and meeting rooms — convenient, but they can bump into each other reaching
              for the same coffee pot.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This shared-vs-isolated memory model is the single fact that explains almost everything else about
              threads and processes.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually works',
      blocks: [
        {
          k: 'diagram',
          el: <ThreadsProcessesDiagram />,
          caption: 'Threads inside one process share memory; two processes stay isolated from each other.',
        },
        {
          k: 'p',
          text: (
            <>
              Spawning a <b>thread</b> is cheaper than spawning a <b>process</b> — there's shared memory to reuse
              and no separate address space to set up, so thread creation and context switches are lighter weight.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              But that shared memory is a double-edged sword: threads must <b>coordinate explicitly</b> (locks,
              atomics) to avoid corrupting shared state, while processes get isolation for free at the cost of
              needing explicit inter-process communication (pipes, sockets, shared memory segments) to talk to each
              other at all.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where each shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A web server spawning a <b>thread per request</b> to serve many users concurrently on one process —
              cheap to create, and they can share caches and connection pools already warmed in memory.
            </>,
            <>
              A browser running each tab as a <b>separate process</b> so one crashing tab doesn't take down the
              whole browser — isolation traded for a heavier footprint.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              More threads isn't free — context-switching overhead and contention on shared resources both grow as
              thread count rises. That's why <b>thread pools</b> (a bounded, reused set of threads) are preferred
              over spawning an unbounded thread per unit of work.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the core difference between a process and a thread?',
      a: (
        <>
          A process has its own isolated memory space; threads live inside a process and share its memory with
          each other.
        </>
      ),
    },
    {
      q: 'Why is creating a thread cheaper than creating a process?',
      a: (
        <>
          A thread reuses the process's existing memory and address space, while a process needs a whole new
          address space set up — more overhead to create and to context-switch into.
        </>
      ),
    },
    {
      q: 'What is the main risk that comes from threads sharing memory?',
      a: (
        <>
          Two threads can read and write the same data at the same time without coordination, corrupting shared
          state — this is why locks, mutexes, and other synchronisation are needed.
        </>
      ),
    },
    {
      q: 'Why do systems use a thread pool instead of spawning a new thread per task?',
      a: (
        <>
          Unbounded thread creation adds context-switching overhead and contention that grows with thread count. A
          bounded, reused pool caps that cost while still allowing concurrency.
        </>
      ),
    },
    {
      q: 'How do separate processes communicate with each other?',
      a: (
        <>
          Since they don't share memory, they need explicit inter-process communication — pipes, sockets, message
          queues, or an explicitly shared memory segment.
        </>
      ),
    },
    {
      q: 'Give a real example of using threads vs using separate processes.',
      a: (
        <>
          Threads: a web server handling many requests concurrently on one process. Processes: a browser isolating
          each tab into its own process so a crash in one doesn't affect the others.
        </>
      ),
    },
  ],
};

export default topic;
