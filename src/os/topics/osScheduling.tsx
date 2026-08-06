import { Dg, Gantt, Rel, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** The same three processes scheduled four different ways. */
function SchedulingComparison() {
  return (
    <Dg w={620} h={402} cap="P1(arrive 0, burst 4), P2(arrive 1, burst 3), P3(arrive 2, burst 1)">
      <Txt x={310} y={18} fs={10.5} soft>
        P1 arrives at 0 needing 4 · P2 arrives at 1 needing 3 · P3 arrives at 2 needing 1
      </Txt>

      <Gantt
        x={40}
        y={48}
        px={44}
        h={30}
        title="FCFS — strictly by arrival"
        slices={[
          { label: 'P1', start: 0, end: 4, c: 'a' },
          { label: 'P2', start: 4, end: 7, c: 'b' },
          { label: 'P3', start: 7, end: 8, c: 'c' },
        ]}
      />
      <Txt x={420} y={68} anchor="start" fs={10.5} soft>
        avg wait 2.67
      </Txt>

      <Gantt
        x={40}
        y={136}
        px={44}
        h={30}
        title="SJF — shortest burst next (non-preemptive)"
        slices={[
          { label: 'P1', start: 0, end: 4, c: 'a' },
          { label: 'P3', start: 4, end: 5, c: 'c' },
          { label: 'P2', start: 5, end: 8, c: 'b' },
        ]}
      />
      <Txt x={420} y={156} anchor="start" fs={10.5} soft>
        avg wait 2.00
      </Txt>

      <Gantt
        x={40}
        y={224}
        px={44}
        h={30}
        title="SRTF — preemptive SJF"
        slices={[
          { label: 'P1', start: 0, end: 2, c: 'a' },
          { label: 'P3', start: 2, end: 3, c: 'c' },
          { label: 'P1', start: 3, end: 5, c: 'a' },
          { label: 'P2', start: 5, end: 8, c: 'b' },
        ]}
      />
      <Txt x={420} y={244} anchor="start" fs={10.5} bold c="b">
        avg wait 1.67 — best
      </Txt>

      <Gantt
        x={40}
        y={312}
        px={44}
        h={30}
        title="Round Robin — quantum 2"
        slices={[
          { label: 'P1', start: 0, end: 2, c: 'a' },
          { label: 'P2', start: 2, end: 4, c: 'b' },
          { label: 'P3', start: 4, end: 5, c: 'c' },
          { label: 'P1', start: 5, end: 7, c: 'a' },
          { label: 'P2', start: 7, end: 8, c: 'b' },
        ]}
      />
      <Txt x={420} y={332} anchor="start" fs={10.5} soft>
        avg wait 3.00
      </Txt>
      <Txt x={420} y={350} anchor="start" fs={10} soft>
        worst average, but
      </Txt>
      <Txt x={420} y={366} anchor="start" fs={10} soft>
        nobody waits long
      </Txt>
    </Dg>
  );
}

/** The convoy effect: one long job at the front delays everyone. */
function ConvoyEffect() {
  return (
    <Dg w={600} h={216} cap="One long process at the front of an FCFS queue holds up every short one behind it">
      <Gantt
        x={30}
        y={40}
        px={11}
        h={30}
        title="FCFS — the long job arrived first"
        slices={[
          { label: 'P1 (burst 40)', start: 0, end: 40, c: 'c' },
          { label: 'P2', start: 40, end: 42, c: 'a' },
          { label: 'P3', start: 42, end: 44, c: 'b' },
        ]}
        ticks="none"
      />
      <Txt x={300} y={102} fs={10.5} soft>
        two 2-unit jobs each waited 40 units · avg wait ≈ 27
      </Txt>

      <Gantt
        x={30}
        y={140}
        px={11}
        h={30}
        title="SJF — same jobs, shortest first"
        slices={[
          { label: 'P2', start: 0, end: 2, c: 'a' },
          { label: 'P3', start: 2, end: 4, c: 'b' },
          { label: 'P1 (burst 40)', start: 4, end: 44, c: 'c' },
        ]}
        ticks="none"
      />
      <Txt x={300} y={202} fs={10.5} bold c="b">
        avg wait 2 — the same work, a fraction of the waiting
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-scheduling',
  num: 4,
  unit: 'Memory & Scheduling',
  title: 'CPU Scheduling Algorithms',
  blurb:
    'FCFS, SJF, SRTF, LRTF, priority and round robin — worked on one example, with the trade-off each one makes.',
  minutes: 14,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'basics',
      heading: 'The vocabulary first',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Every scheduling question is scored with the same four numbers. Getting these definitions exactly
              right is most of the marks.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Term', 'Definition', 'Formula'],
          rows: [
            ['Arrival time (AT)', 'When the process entered the ready queue', '—'],
            ['Burst time (BT)', 'CPU time the process needs', '—'],
            ['Completion time (CT)', 'When the process finished', '—'],
            ['Turnaround time (TAT)', 'Total time from arrival to completion', 'CT − AT'],
            ['Waiting time (WT)', 'Time spent waiting, not running', 'TAT − BT'],
            ['Response time', 'Arrival until it first gets the CPU', 'first start − AT'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>Preemptive</b> means the OS can take the CPU away from a running process; <b>non-preemptive</b>{' '}
              means a process keeps the CPU until it finishes or blocks. SRTF, LRTF and round robin are preemptive;
              FCFS and plain SJF are not.
            </>
          ),
        },
      ],
    },

    {
      id: 'comparison',
      heading: 'The same processes, four algorithms',
      blocks: [
        { k: 'diagram', el: <SchedulingComparison />, caption: 'Identical work, very different waiting times.' },
        {
          k: 'code',
          title: 'Working the FCFS numbers by hand',
          code: `           AT   BT   CT   TAT = CT−AT   WT = TAT−BT
    P1      0    4    4      4              0
    P2      1    3    7      6              3
    P3      2    1    8      6              5
                                   average WT = 8 / 3 = 2.67

Same table for SRTF gives 1.67 — the improvement comes entirely
from letting the 1-unit job cut ahead instead of waiting.`,
        },
      ],
    },

    {
      id: 'algorithms',
      heading: 'The six algorithms',
      blocks: [
        { k: 'h', text: 'FCFS — First Come First Serve' },
        {
          k: 'p',
          text: (
            <>
              Processes execute strictly in arrival order, like a queue at a ticket counter. Simple and fair in
              intent, but if a long process arrives first everyone behind it waits — the <b>convoy effect</b>.
            </>
          ),
        },
        { k: 'diagram', el: <ConvoyEffect />, caption: 'The convoy effect, and why shortest-first exists.' },
        { k: 'h', text: 'SJF — Shortest Job First' },
        {
          k: 'p',
          text: (
            <>
              The process with the smallest burst time runs next, regardless of arrival order. It provably{' '}
              <b>minimises average waiting time</b> — but it needs the burst time known in advance, and long
              processes can starve.
            </>
          ),
        },
        { k: 'h', text: 'SRTF — Shortest Remaining Time First' },
        {
          k: 'p',
          text: (
            <>
              The preemptive version of SJF. If a new process arrives with less remaining time than the running one,
              the CPU switches immediately. Best average waiting time of all, at the cost of frequent context
              switches and worse starvation for long jobs.
            </>
          ),
        },
        { k: 'h', text: 'LRTF — Longest Remaining Time First' },
        {
          k: 'p',
          text: (
            <>
              The opposite: the process with the <b>most</b> remaining time runs first, preemptively. Rarely used —
              it is mostly a theoretical counterpoint, since it maximises rather than minimises average waiting
              time.
            </>
          ),
        },
        { k: 'h', text: 'Priority scheduling' },
        {
          k: 'p',
          text: (
            <>
              Each process carries a priority number and the CPU picks the highest first. It can be preemptive or
              non-preemptive. The problem is <b>starvation</b> of low-priority processes, fixed by <b>aging</b> —
              raising priority the longer a process has waited.
            </>
          ),
        },
        { k: 'h', text: 'Round Robin' },
        {
          k: 'p',
          text: (
            <>
              Each process gets a fixed <b>time quantum</b>. When it expires the process is paused and moved to the
              back of the queue. Fair, predictable, and the standard choice for time-sharing systems.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Choosing the quantum',
          text: (
            <>
              Too <b>small</b> and the CPU spends its time context switching instead of working. Too <b>large</b>{' '}
              and round robin degenerates into <b>FCFS</b>. The usual rule of thumb is that the quantum should
              exceed about 80% of typical CPU bursts, so most processes finish within one slice.
            </>
          ),
        },
      ],
    },

    {
      id: 'summary',
      heading: 'Which one, and why',
      blocks: [
        {
          k: 'table',
          head: ['Algorithm', 'Preemptive?', 'Optimises', 'Weakness'],
          rows: [
            ['FCFS', 'No', 'Simplicity, no starvation', 'Convoy effect; terrible average wait'],
            ['SJF', 'No', 'Average waiting time', 'Needs burst time up front; starves long jobs'],
            ['SRTF', 'Yes', 'Average waiting time (best)', 'Heavy context switching; worse starvation'],
            ['LRTF', 'Yes', 'Nothing practical', 'Maximises average wait — theoretical only'],
            ['Priority', 'Either', 'Important work first', 'Starvation — needs aging'],
            ['Round Robin', 'Yes', 'Response time and fairness', 'Higher average turnaround; quantum tuning'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The one-line trade-off to state: <b>SRTF gives the best average waiting time, round robin gives the
              best response time.</b> Interactive systems care about response, batch systems care about throughput
              — which is why your laptop uses a round-robin-like scheduler and not SJF.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between preemptive and non-preemptive scheduling?',
      a: (
        <>
          <b>Preemptive</b> lets the OS take the CPU from a running process (on a timer or a higher-priority
          arrival); <b>non-preemptive</b> lets it run until it finishes or blocks. Preemption improves responsiveness
          and prevents one process monopolising the CPU, at the cost of context-switch overhead.
        </>
      ),
    },
    {
      q: 'How do you calculate waiting time and turnaround time?',
      a: (
        <>
          <b>Turnaround = Completion − Arrival</b> and <b>Waiting = Turnaround − Burst</b>. Waiting time is
          therefore all the time the process existed but was not executing.
        </>
      ),
    },
    {
      q: 'What is the convoy effect?',
      a: (
        <>
          Under FCFS, one long CPU-bound process at the front of the queue forces every short process behind it to
          wait, wrecking the average waiting time. It is the main argument against pure FCFS and the reason
          shortest-job-first exists.
        </>
      ),
    },
    {
      q: 'Which algorithm gives the minimum average waiting time?',
      a: (
        <>
          <b>SJF</b> is provably optimal among non-preemptive algorithms, and <b>SRTF</b> — its preemptive form — is
          optimal overall. Neither is usable directly in practice, because the burst time is not known in advance;
          real schedulers estimate it from recent history (exponential averaging).
        </>
      ),
    },
    {
      q: 'Why is SJF not used in real operating systems?',
      a: (
        <>
          It requires knowing each process's CPU burst <b>before</b> running it, which is impossible in general.
          Real schedulers approximate it by predicting the next burst from previous ones. SJF also starves long
          processes, which needs aging to fix.
        </>
      ),
    },
    {
      q: 'What happens if the round-robin quantum is too small or too large?',
      a: (
        <>
          Too <b>small</b>: context-switch overhead dominates and useful throughput collapses. Too <b>large</b>:
          each process effectively runs to completion, so round robin degenerates into <b>FCFS</b> and the response
          time advantage disappears.
        </>
      ),
    },
    {
      q: 'Difference between SJF and SRTF?',
      a: (
        <>
          SJF is <b>non-preemptive</b> — once chosen, a process runs to completion. SRTF is its <b>preemptive</b>{' '}
          version: an arriving process with a shorter remaining time takes the CPU immediately. SRTF gives lower
          average waiting time but far more context switches.
        </>
      ),
    },
    {
      q: 'Which scheduling algorithm suffers no starvation?',
      a: (
        <>
          <b>FCFS</b> and <b>round robin</b>. FCFS serves strictly in arrival order and round robin guarantees every
          process a slice each cycle. SJF, SRTF and priority scheduling all can starve processes, and are fixed with
          aging.
        </>
      ),
    },
    {
      q: 'What is response time, and which algorithm optimises it?',
      a: (
        <>
          The time from arrival until the process <b>first</b> gets the CPU — not until it finishes.{' '}
          <b>Round robin</b> optimises it, because every process is served within one full cycle of the queue. That
          is why interactive and time-sharing systems prefer it despite its worse average turnaround.
        </>
      ),
    },
  ],
};

export default topic;
