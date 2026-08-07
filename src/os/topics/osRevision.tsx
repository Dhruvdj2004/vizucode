import type { OsTopic } from '../types';

const topic: OsTopic = {
  slug: 'os-revision',
  num: 7,
  unit: 'Quick Revision',
  title: '10-Minute OS Revision',
  blurb:
    'The whole OS module compressed into recall-only form — every definition, every comparison and every scheduling formula on a few screens.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'definitions',
      heading: 'The definitions, one line each',
      blocks: [
        {
          k: 'table',
          head: ['Term', 'One-line answer'],
          rows: [
            ['Operating system', 'Software managing hardware for programs — processes, memory, files, I/O, security.'],
            ['Kernel', 'The core that talks directly to hardware, running in privileged mode.'],
            ['Monolithic kernel', 'The whole OS in kernel mode. Fast; one bug can crash everything (Linux).'],
            ['Microkernel', 'Only IPC and scheduling in kernel mode; drivers and FS are user-mode services.'],
            ['Process', 'A program in execution, with its own memory and state. Isolated.'],
            ['Thread', 'The smallest unit of execution inside a process. Shares the process memory.'],
            ['RTOS', 'Guarantees a response within a strict deadline. Hard / soft / firm.'],
            ['Virtual memory', 'Using disk as extra RAM so a process can exceed physical memory.'],
            ['Thrashing', 'More time spent swapping pages than executing. Cause: degree of multiprogramming too high.'],
            ['Paging', 'Fixed-size pages into fixed-size frames. Kills external fragmentation.'],
            ['Demand paging', 'Load a page only when first referenced; a miss is a page fault.'],
            ['Deadlock', 'A set of processes each waiting on another. A cycle in the wait-for graph.'],
            ['Starvation', 'One process perpetually overtaken. Fixed by aging.'],
            ['Spooling', 'Queuing whole jobs on disk so a fast CPU never waits on a slow device.'],
            ['Cache', 'Small fast memory near the CPU, working because of locality of reference.'],
          ],
        },
      ],
    },

    {
      id: 'comparisons',
      heading: 'The comparisons they ask for',
      blocks: [
        {
          k: 'table',
          head: ['Pair', 'The distinction'],
          rows: [
            ['Process vs thread', 'Process has its own address space (isolated, expensive to switch); threads share one (cheap, need synchronisation).'],
            ['Multitasking vs multiprocessing', 'One CPU switching fast (concurrent) vs many CPUs at once (truly parallel).'],
            ['Paging vs segmentation', 'Fixed size, OS-decided, internal fragmentation vs variable size, logical units, external fragmentation.'],
            ['Internal vs external fragmentation', 'Waste INSIDE an allocated block vs free space scattered BETWEEN blocks.'],
            ['Main vs secondary memory', 'Volatile, fast, CPU-addressable, small vs non-volatile, slow, not directly addressable, large.'],
            ['Mutex vs semaphore', 'A lock with an owner (only the locker unlocks) vs a signalling counter with no ownership.'],
            ['Preemptive vs non-preemptive', 'The OS can take the CPU away vs the process keeps it until it finishes or blocks.'],
            ['Deadlock vs starvation', 'Nobody in the set can ever proceed vs the system progresses but one process never gets a turn.'],
            ['Hub vs switch (if asked)', 'Layer 1, floods every port vs layer 2, forwards on MAC to one port.'],
            ['Static vs dynamic linking', 'Library copied into the binary vs resolved at load time and shared in memory.'],
          ],
        },
      ],
    },

    {
      id: 'scheduling',
      heading: 'Scheduling — the formulas and the verdict',
      blocks: [
        {
          k: 'code',
          title: 'The only two formulas you need',
          code: `Turnaround Time  TAT = Completion − Arrival
Waiting Time     WT  = Turnaround − Burst
Response Time        = first time on CPU − Arrival

Average anything = sum over all processes / n`,
        },
        {
          k: 'table',
          head: ['Algorithm', 'Preemptive', 'Optimises', 'Weakness'],
          rows: [
            ['FCFS', 'No', 'Simplicity; no starvation', 'Convoy effect — one long job blocks everyone'],
            ['SJF', 'No', 'Average waiting time (optimal, non-preemptive)', 'Burst must be known; starves long jobs'],
            ['SRTF', 'Yes', 'Average waiting time (optimal overall)', 'Heavy context switching; worse starvation'],
            ['LRTF', 'Yes', 'Nothing practical', 'Theoretical only — maximises waiting time'],
            ['Priority', 'Either', 'Important work first', 'Starvation — needs aging'],
            ['Round Robin', 'Yes', 'Response time and fairness', 'Higher average turnaround; quantum tuning'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The trade-off sentence: <b>SRTF gives the best average waiting time; round robin gives the best
              response time.</b> Interactive systems care about response, so real schedulers are round-robin-like.
              Quantum too small → all context switching; too large → degenerates into FCFS.
            </>
          ),
        },
      ],
    },

    {
      id: 'deadlock',
      heading: 'Deadlock, in four bullets',
      blocks: [
        {
          k: 'ol',
          items: [
            <>
              <b>The four conditions</b> — mutual exclusion, hold and wait, no preemption, circular wait. All four
              must hold simultaneously, so breaking any one prevents deadlock.
            </>,
            <>
              <b>Prevention</b> structurally removes one condition. Easiest in practice: impose a global ordering on
              resources and always acquire in that order (kills circular wait).
            </>,
            <>
              <b>Avoidance</b> is the banker's algorithm — before granting, check a <b>safe sequence</b> still
              exists. Needs maximum needs declared up front, so it is rarely used.
            </>,
            <>
              <b>Detection</b> finds a cycle in the wait-for graph and rolls back a victim. Real systems mostly{' '}
              <b>ignore</b> the problem — the "ostrich algorithm".
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Producer-consumer: the order matters',
          text: (
            <>
              <code>wait(empty)</code> <b>before</b> <code>wait(mutex)</code>. Reversed, a producer can take the
              mutex, find the buffer full, and block while holding the lock — the consumer can never get in to make
              space. That is the deadlock the question is really testing.
            </>
          ),
        },
      ],
    },

    {
      id: 'gotchas',
      heading: 'The gotchas',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Belady's anomaly</b> — more frames giving <i>more</i> page faults. Happens with <b>FIFO</b>{' '}
              (1 2 3 4 1 2 5 1 2 3 4 5: 9 faults with 3 frames, 10 with 4). Never with LRU, because LRU is a{' '}
              <b>stack algorithm</b>.
            </>,
            <>
              <b>A page fault is not an error</b> — it is the normal mechanism of demand paging.
            </>,
            <>
              <b>Thrashing is self-worsening</b> — CPU utilisation drops, the OS admits more processes, frames per
              process shrink further.
            </>,
            <>
              <b>An unsafe state is not a deadlock</b> — it means deadlock is <i>possible</i>. The banker's
              algorithm refuses to enter one anyway.
            </>,
            <>
              <b>RAID is not a backup</b> — it survives a disk dying, not a bad DELETE.
            </>,
            <>
              <b>Steal / no-force</b> is why recovery needs both undo and redo: uncommitted pages may reach disk
              (steal → undo), committed ones may not (no-force → redo).
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Process vs thread — the one-line answer?',
      a: (
        <>
          A process has its own address space and is isolated, so switching is expensive and communication needs
          IPC. Threads share the process's address space, so they are cheap to create and switch but can corrupt
          each other and therefore need synchronisation.
        </>
      ),
    },
    {
      q: 'What is thrashing and how do you fix it?',
      a: (
        <>
          The system spends more time swapping pages than executing, because the degree of multiprogramming is too
          high for available memory. Fix it by <b>reducing the degree of multiprogramming</b> — suspend processes —
          or by allocating frames according to each process's working-set size.
        </>
      ),
    },
    {
      q: 'How do you calculate waiting time?',
      a: (
        <>
          <b>Turnaround = Completion − Arrival</b>, then <b>Waiting = Turnaround − Burst</b>. Waiting time is all
          the time a process existed but was not running.
        </>
      ),
    },
    {
      q: 'Which scheduling algorithm minimises average waiting time?',
      a: (
        <>
          <b>SJF</b> among non-preemptive, and <b>SRTF</b> overall. Neither is directly usable because burst time
          is not known in advance — real schedulers estimate it from recent history.
        </>
      ),
    },
    {
      q: 'Name the four conditions for deadlock.',
      a: (
        <>
          Mutual exclusion, hold and wait, no preemption, circular wait. All four must hold at once — every
          prevention technique works by eliminating one.
        </>
      ),
    },
    {
      q: 'Mutex vs semaphore?',
      a: (
        <>
          A <b>mutex</b> is a lock with an <b>owner</b> — only the thread that locked it may unlock it, and it is
          binary. A <b>semaphore</b> is a counter used for signalling with no ownership, so one thread can wait and
          another signal. Locking vs signalling.
        </>
      ),
    },
    {
      q: "What is Belady's anomaly and which algorithm suffers it?",
      a: (
        <>
          Adding more frames <b>increases</b> page faults. It occurs with <b>FIFO</b> replacement. LRU is immune
          because it is a <b>stack algorithm</b> — the pages held with n frames are always a subset of those held
          with n+1.
        </>
      ),
    },
    {
      q: 'Internal vs external fragmentation, and which does paging solve?',
      a: (
        <>
          <b>Internal</b> is waste inside an allocated block; <b>external</b> is free space scattered between
          blocks. Paging eliminates <b>external</b> fragmentation entirely, at the cost of a little internal
          fragmentation in each process's last page.
        </>
      ),
    },
    {
      q: 'What does the banker\'s algorithm actually check?',
      a: (
        <>
          Whether granting a request leaves the system in a <b>safe state</b> — that is, whether a{' '}
          <b>safe sequence</b> still exists in which every process can obtain its declared maximum and finish. If
          not, the request is denied and the process waits.
        </>
      ),
    },
  ],
};

export default topic;
