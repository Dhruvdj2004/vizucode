import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** A deadlock schedule next to its wait-for graph. */
function DeadlockScene() {
  const node = (cx: number, cy: number, label: string) => (
    <g key={label}>
      <circle cx={cx} cy={cy} r={26} fill="var(--accent-3-soft)" stroke="var(--accent-3)" strokeWidth="1.6" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--accent-3)">
        {label}
      </text>
    </g>
  );
  return (
    <Dg w={620} h={244} cap="Each transaction holds what the other needs — the wait-for graph has a cycle">
      <Rel
        x={16}
        y={26}
        title="SCHEDULE"
        cols={['T1', 'T2']}
        rows={[
          ['lock-X(A) ✓', ''],
          ['', 'lock-X(B) ✓'],
          ['lock-X(B) wait…', ''],
          ['', 'lock-X(A) wait…'],
        ]}
        cw={[136, 136]}
        c="c"
        rowMark={{ 2: 'c', 3: 'c' }}
      />

      {node(400, 82, 'T1')}
      {node(540, 82, 'T2')}
      <Arrow x1={420} y1={64} x2={519} y2={64} c="c" label="needs B" dy={-10} />
      <Arrow x1={521} y1={100} x2={422} y2={100} c="c" label="needs A" dy={22} />
      <Txt x={470} y={162} fs={11.5} bold c="c">
        cycle → deadlock
      </Txt>
      <Txt x={470} y={182} fs={10.5} soft>
        wait-for graph
      </Txt>
      <Txt x={470} y={214} fs={10.5} soft>
        neither will ever proceed
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'deadlocks',
  num: 17,
  unit: 'Transactions & Concurrency',
  title: 'Deadlock Handling',
  blurb:
    'The four necessary conditions, wait-for graph detection, wait-die and wound-wait prevention, victim selection and how starvation differs from deadlock.',
  minutes: 11,
  tags: ['Very common'],

  sections: [
    {
      id: 'what',
      heading: 'What a deadlock is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>deadlock</b> is a set of transactions in which every member is waiting for a lock held by another
              member of the same set. Nothing in the set can ever proceed without outside intervention.
            </>
          ),
        },
        { k: 'diagram', el: <DeadlockScene />, caption: 'The minimal deadlock: two transactions, two items, opposite order.' },
        { k: 'h', text: 'The four necessary conditions (Coffman conditions)' },
        {
          k: 'ul',
          items: [
            <>
              <b>Mutual exclusion</b> — at least one resource is held in a non-shareable mode.
            </>,
            <>
              <b>Hold and wait</b> — a transaction holds a resource while requesting another.
            </>,
            <>
              <b>No preemption</b> — a resource cannot be forcibly taken; it is released only voluntarily.
            </>,
            <>
              <b>Circular wait</b> — a closed chain of transactions, each waiting for the next.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              All four must hold <b>simultaneously</b>. Every prevention scheme works by making one of them
              impossible — which is a neat way to organise the answer rather than listing techniques at random.
            </>
          ),
        },
      ],
    },

    {
      id: 'detection',
      heading: 'Detection — the wait-for graph',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Let deadlocks happen, then find and break them. The tool is the <b>wait-for graph</b>: one node per
              active transaction, and an edge <code>Ti → Tj</code> whenever Ti is waiting for a lock held by Tj.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              A <b>cycle</b> in the wait-for graph means a deadlock, always.
            </>,
            <>
              The DBMS runs cycle detection periodically. Too often wastes CPU; too rarely leaves transactions
              frozen — real systems typically check every few seconds, or after a lock wait exceeds a threshold.
            </>,
            <>
              Note the difference from the <b>precedence graph</b> in serializability: that graph is about the
              order operations already happened; the wait-for graph is about who is blocked right now.
            </>,
          ],
        },
        { k: 'h', text: 'Recovery: choosing a victim' },
        {
          k: 'p',
          text: (
            <>
              Once a cycle is found, one transaction in it must be rolled back to break it. The choice minimises
              wasted work:
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            'How long has it run, and how much longer would it need?',
            'How many data items has it modified, and how many will it still touch?',
            'How many locks does it hold — killing it should free enough to unblock others.',
            'How many times has it already been chosen as a victim?',
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Starvation',
          text: (
            <>
              If the victim is always chosen as "the youngest" or "the cheapest to kill", the same unlucky
              transaction can be rolled back forever. The fix is to include the <b>rollback count</b> in the cost
              function, so a transaction that has been victimised repeatedly stops being chosen.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A victim can be handled with a <b>total rollback</b> (abort and restart it entirely — simple, and what
              most systems do) or a <b>partial rollback</b> to a point just before the conflicting lock request,
              which wastes less work but requires much more bookkeeping.
            </>
          ),
        },
      ],
    },

    {
      id: 'prevention',
      heading: 'Prevention — timestamp schemes',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Never let a deadlock form. The two classic schemes use transaction timestamps to decide who is allowed
              to wait for whom, which makes a circular wait impossible: waiting always runs in one direction of age.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Wait-Die', 'Wound-Wait'],
          rows: [
            ['Style', 'Non-preemptive', 'Preemptive'],
            [
              'Older transaction requests a lock held by a younger one',
              'Older WAITS',
              'Older WOUNDS — the younger one is rolled back',
            ],
            [
              'Younger transaction requests a lock held by an older one',
              'Younger DIES — rolled back and restarted with its original timestamp',
              'Younger WAITS',
            ],
            ['Direction of waiting', 'Only older → younger', 'Only younger → older'],
            ['Number of rollbacks', 'More — a young transaction may die repeatedly', 'Fewer'],
            ['Starvation', 'Avoided: the restarted transaction keeps its old timestamp, so it eventually becomes the oldest', 'Same guarantee'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'How to remember them',
          text: (
            <>
              In both names, the <b>first word describes what the older transaction does</b>. Wait-<b>die</b>: older
              waits, younger dies. <b>Wound</b>-wait: older wounds, younger waits. Both allow waiting in one
              age-direction only, so no cycle can form.
            </>
          ),
        },
        { k: 'h', text: 'Other prevention approaches' },
        {
          k: 'ul',
          items: [
            <>
              <b>Acquire all locks up front</b> (conservative 2PL) — kills "hold and wait". Deadlock-free, but you
              must know every item in advance and concurrency collapses.
            </>,
            <>
              <b>Impose a global ordering on data items</b> and require locks to be requested in that order — kills
              "circular wait". Cheap and very effective, and it is the standard advice for application code that
              updates several tables.
            </>,
            <>
              <b>Lock timeouts</b> — a transaction waiting longer than N seconds simply aborts. Crude, needs no
              graph, but tuning the timeout is guesswork: too short aborts healthy transactions, too long leaves
              real deadlocks sitting.
            </>,
          ],
        },
      ],
    },

    {
      id: 'related',
      heading: 'Deadlock, starvation and livelock',
      blocks: [
        {
          k: 'table',
          head: ['', 'Deadlock', 'Starvation', 'Livelock'],
          rows: [
            [
              'What happens',
              'A cycle of transactions each waiting on the next',
              'One transaction waits indefinitely while others keep overtaking it',
              'Transactions keep changing state but make no progress',
            ],
            ['Are they progressing?', 'No — completely frozen', 'Others progress; the victim does not', 'Everyone is busy, nobody advances'],
            [
              'Typical cause',
              'Locks acquired in conflicting orders',
              'Unfair scheduling, or always picking the same deadlock victim',
              'Repeated abort-and-retry of the same conflicting transactions',
            ],
            [
              'Fix',
              'Detection + victim rollback, or a prevention scheme',
              'Aging / FIFO lock queues; count rollbacks in victim selection',
              'Randomised backoff before retry',
            ],
          ],
        },
      ],
    },

    {
      id: 'practice',
      heading: 'What to do in practice',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Interviewers often finish with "so how would you actually reduce deadlocks in an application?". Have a
              concrete answer ready.
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            <>
              <b>Always touch tables in the same order</b> across the whole codebase. This alone removes most real
              deadlocks.
            </>,
            <>
              <b>Keep transactions short.</b> The longer locks are held, the wider the window for a conflict.
            </>,
            <>
              <b>Never wait for a human or a network call inside a transaction.</b>
            </>,
            <>
              <b>Take the strongest lock you will need up front</b> rather than upgrading S → X later, since
              upgrades are a classic deadlock source.
            </>,
            <>
              <b>Use a lower isolation level</b> where the workload genuinely tolerates it — fewer locks, fewer
              conflicts.
            </>,
            <>
              <b>Expect deadlocks and retry.</b> Every production system should catch the deadlock error code and
              retry the transaction with a short randomised backoff.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a deadlock?',
      a: (
        <>
          A situation where a set of transactions each hold a lock that another member of the set is waiting for, so
          none can ever proceed. It shows up as a <b>cycle in the wait-for graph</b>.
        </>
      ),
    },
    {
      q: 'What are the four conditions necessary for a deadlock?',
      a: (
        <>
          <b>Mutual exclusion</b>, <b>hold and wait</b>, <b>no preemption</b> and <b>circular wait</b>. All four
          must hold at once, so every prevention technique works by eliminating one of them.
        </>
      ),
    },
    {
      q: 'How does a DBMS detect deadlocks?',
      a: (
        <>
          It maintains a <b>wait-for graph</b> — a node per transaction and an edge Ti → Tj when Ti waits for a lock
          held by Tj — and periodically runs cycle detection. A cycle means a deadlock, and one transaction in it is
          chosen as a victim and rolled back.
        </>
      ),
    },
    {
      q: 'Explain wait-die and wound-wait.',
      a: (
        <>
          Both use timestamps so that waiting only ever runs in one age-direction. In <b>wait-die</b> an older
          transaction waits for a younger one, while a younger one requesting an older one's lock is killed. In{' '}
          <b>wound-wait</b> an older transaction preempts (wounds) the younger holder, while a younger one waits.
          Restarted transactions keep their original timestamp, which prevents starvation.
        </>
      ),
    },
    {
      q: 'Which of the two causes fewer rollbacks?',
      a: (
        <>
          <b>Wound-wait.</b> In wait-die a young transaction is killed every time it asks for a lock held by an
          older one, and it may die repeatedly. Wound-wait only rolls back when an older transaction actually needs
          the resource.
        </>
      ),
    },
    {
      q: 'Difference between deadlock prevention, avoidance and detection?',
      a: (
        <>
          <b>Prevention</b> structurally makes deadlock impossible (ordering locks, acquiring everything up front).{' '}
          <b>Avoidance</b> uses runtime information — the timestamp schemes — to refuse requests that could lead to
          a cycle. <b>Detection</b> allows deadlocks, finds them with the wait-for graph, and breaks them by
          rolling a victim back.
        </>
      ),
    },
    {
      q: 'How is a deadlock victim chosen?',
      a: (
        <>
          To minimise wasted work: how long the transaction has run and how much remains, how many items it has
          modified, how many locks it holds, and — crucially — <b>how many times it has already been rolled
          back</b>, so the same transaction is not starved.
        </>
      ),
    },
    {
      q: 'Difference between deadlock and starvation?',
      a: (
        <>
          In a <b>deadlock</b> nobody in the set can proceed, ever. In <b>starvation</b> the system as a whole makes
          progress, but one particular transaction is perpetually overtaken and never gets its turn. Starvation is
          fixed by fair scheduling and aging, deadlock by detection or prevention.
        </>
      ),
    },
    {
      q: 'How would you reduce deadlocks in an application?',
      a: (
        <>
          Access tables in a consistent order everywhere, keep transactions short, avoid user or network waits
          inside a transaction, take the strongest lock you will need up front instead of upgrading later, and
          always implement a <b>retry with randomised backoff</b> on the deadlock error.
        </>
      ),
    },
    {
      q: 'Does timestamp-ordering concurrency control suffer deadlocks?',
      a: (
        <>
          No — transactions never wait, they are simply aborted when they violate the timestamp order. It trades
          deadlock for <b>starvation</b>: a long transaction can be restarted repeatedly and never complete.
        </>
      ),
    },
  ],
};

export default topic;
