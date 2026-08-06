import { Arrow, Box, Dg, Frame, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** The lost update problem, as an interleaved schedule. */
function LostUpdate() {
  return (
    <Dg w={620} h={286} cap="Two transactions read the same value and one update is silently overwritten">
      <Rel
        x={150}
        y={30}
        title="LOST UPDATE"
        cols={['T1', 'T2', 'A']}
        rows={[
          ['read(A)', '', '100'],
          ['A = A−10', '', '100'],
          ['', 'read(A)', '100'],
          ['', 'A = A−20', '100'],
          ['write(A)', '', '90'],
          ['', 'write(A)', '80'],
        ]}
        cw={[132, 132, 56]}
        c="c"
        mark={{ '5,2': 'c' }}
      />
      <Txt x={310} y={254} fs={11} bold c="c">
        A should be 70. It is 80 — T1's write vanished.
      </Txt>
      <Txt x={310} y={274} fs={10.5} soft>
        T2 read A before T1 wrote it, so T2's write was based on a stale value
      </Txt>
    </Dg>
  );
}

/** Precedence graphs: acyclic vs cyclic. */
function PrecedenceGraphs() {
  const node = (cx: number, cy: number, label: string, c: string) => (
    <g key={label + cx}>
      <circle cx={cx} cy={cy} r={24} fill={`var(--${c}-soft)`} stroke={`var(--${c})`} strokeWidth="1.6" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={`var(--${c})`}>
        {label}
      </text>
    </g>
  );
  return (
    <Dg w={608} h={252} cap="A precedence graph with no cycle means the schedule is conflict serializable">
      <Frame x={2} y={8} w={292} h={236} label="NO CYCLE → serializable" c="b" />
      {node(84, 84, 'T1', 'accent-2')}
      {node(204, 84, 'T2', 'accent-2')}
      {node(144, 178, 'T3', 'accent-2')}
      <Arrow x1={108} y1={84} x2={178} y2={84} c="b" label="A" dy={-10} />
      <Arrow x1={191.6} y1={104.6} x2={156.4} y2={157.4} c="b" label="B" dx={16} dy={0} />
      <Txt x={148} y={230} fs={10.5} soft>
        equivalent serial order: T1 → T2 → T3
      </Txt>

      <Frame x={314} y={8} w={292} h={236} label="CYCLE → not serializable" c="c" />
      {node(396, 84, 'T1', 'accent-3')}
      {node(516, 84, 'T2', 'accent-3')}
      {node(456, 178, 'T3', 'accent-3')}
      <Arrow x1={420} y1={84} x2={490} y2={84} c="c" label="A" dy={-10} />
      <Arrow x1={503.6} y1={104.6} x2={468.4} y2={157.4} c="c" label="B" dx={16} dy={0} />
      <Arrow x1={443.6} y1={157.4} x2={408.4} y2={104.6} c="c" label="C" dx={-18} dy={0} />
      <Txt x={460} y={230} fs={10.5} soft>
        T1 before T3 before T1 — impossible
      </Txt>
    </Dg>
  );
}

/** Containment of schedule classes. */
function ScheduleClasses() {
  return (
    <Dg w={600} h={236} cap="Serial ⊂ conflict serializable ⊂ view serializable ⊂ all schedules">
      <Frame x={16} y={10} w={568} h={214} label="ALL SCHEDULES" c="n" />
      <Frame x={56} y={46} w={488} h={150} label="VIEW SERIALIZABLE" c="c" />
      <Frame x={104} y={82} w={392} h={98} label="CONFLICT SERIALIZABLE" c="a" />
      <Box x={168} y={114} w={264} h={54} label="SERIAL" sub="no interleaving at all" c="b" fs={13} />
      <Txt x={300} y={214} fs={10.5} soft>
        every conflict serializable schedule is view serializable — not the other way round
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'schedules-serializability',
  num: 15,
  unit: 'Transactions & Concurrency',
  title: 'Schedules & Serializability',
  blurb:
    'The four concurrency problems, conflict and view serializability, how to test a schedule with a precedence graph, and the recoverability classes.',
  minutes: 16,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'problems',
      heading: 'What goes wrong without control',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Interleaving transactions freely produces four classic problems. Naming all four, in order, is a
              standard question.
            </>
          ),
        },
        { k: 'diagram', el: <LostUpdate />, caption: 'The lost update — the simplest and most damaging of the four.' },
        {
          k: 'table',
          head: ['Problem', 'Pattern', 'What happens'],
          rows: [
            [
              'Lost update',
              'W – W',
              'Two transactions read the same value and both write. The second write overwrites the first, whose update disappears.',
            ],
            [
              'Dirty read (uncommitted dependency)',
              'W – R',
              'T2 reads a value T1 wrote but has not committed. If T1 aborts, T2 acted on data that never officially existed.',
            ],
            [
              'Unrepeatable read',
              'R – W – R',
              'T1 reads a row, T2 updates and commits it, T1 reads it again and gets a different value inside one transaction.',
            ],
            [
              'Phantom read',
              'R – Insert – R',
              'T1 runs a range query, T2 inserts a new row matching that range and commits, T1 reruns and sees an extra row that was not there before.',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>Unrepeatable read vs phantom read</b> is the distinction interviewers press on. Unrepeatable read
              is about an <b>existing row changing</b>; phantom read is about the <b>set of rows changing</b>.
              Locking the rows you read prevents the first but not the second — you need a range lock or predicate
              lock for phantoms.
            </>
          ),
        },
      ],
    },

    {
      id: 'schedules',
      heading: 'Schedules',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>schedule</b> is the chronological order in which the operations of several transactions actually
              execute. The operations of each individual transaction must keep their relative order — you may
              interleave transactions, never reorder within one.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Serial schedule</b> — one transaction runs completely before the next begins. Always correct, but
              slow. With n transactions there are <b>n!</b> serial schedules, and they need not all give the same
              result — any of them is considered acceptable.
            </>,
            <>
              <b>Non-serial schedule</b> — operations are interleaved. Faster, but correctness must be proved.
            </>,
            <>
              <b>Serializable schedule</b> — a non-serial schedule whose <i>effect</i> is equivalent to some serial
              schedule. This is the correctness criterion the whole field is built on.
            </>,
          ],
        },
        { k: 'diagram', el: <ScheduleClasses />, caption: 'The containment interviewers ask you to draw.' },
      ],
    },

    {
      id: 'conflict',
      heading: 'Conflict serializability',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Two operations <b>conflict</b> when all three of these hold: they belong to <b>different
              transactions</b>, they access the <b>same data item</b>, and <b>at least one is a write</b>.
            </>
          ),
        },
        {
          k: 'table',
          head: ['T1 op', 'T2 op', 'Conflict?'],
          rows: [
            ['read(A)', 'read(A)', 'No — reads never conflict, order does not matter'],
            ['read(A)', 'write(A)', 'Yes'],
            ['write(A)', 'read(A)', 'Yes'],
            ['write(A)', 'write(A)', 'Yes'],
            ['write(A)', 'write(B)', 'No — different data items'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A schedule is <b>conflict serializable</b> if you can turn it into a serial schedule by repeatedly
              swapping <b>adjacent non-conflicting</b> operations.
            </>
          ),
        },
        { k: 'h', text: 'Testing with a precedence graph' },
        {
          k: 'steps',
          items: [
            { t: 'Draw one node per transaction', d: 'T1, T2, T3 …' },
            {
              t: 'Add an edge Ti → Tj for every conflict',
              d: 'Whenever an operation of Ti comes before a conflicting operation of Tj on the same data item.',
            },
            {
              t: 'Look for a cycle',
              d: 'No cycle → the schedule is conflict serializable. A cycle → it is not, because the required orderings contradict each other.',
            },
            {
              t: 'Topologically sort the graph',
              d: 'Any topological order gives an equivalent serial schedule. If more than one exists, all are valid answers.',
            },
          ],
        },
        { k: 'diagram', el: <PrecedenceGraphs />, caption: 'Cycle detection is the whole test.' },
        {
          k: 'code',
          title: 'Worked example',
          code: `S:  T1: read(A)
    T2: read(A)
    T2: write(A)
    T1: write(A)
    T1: read(B)
    T2: write(B)

Conflicts
    T1.read(A)  before  T2.write(A)     →  edge T1 → T2
    T2.read(A)  before  T1.write(A)     →  edge T2 → T1
    T2.write(A) before  T1.write(A)     →  edge T2 → T1
    T1.read(B)  before  T2.write(B)     →  edge T1 → T2

Graph:  T1 → T2  and  T2 → T1   →  CYCLE
Verdict: NOT conflict serializable.`,
        },
      ],
    },

    {
      id: 'view',
      heading: 'View serializability',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A weaker, more permissive notion. Two schedules are <b>view equivalent</b> if all three conditions
              hold:
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            <>
              <b>Initial reads match</b> — if Ti reads the initial value of A in one schedule, it does so in the
              other too.
            </>,
            <>
              <b>Read-from matches</b> — if Ti reads a value of A written by Tj in one schedule, the same holds in
              the other.
            </>,
            <>
              <b>Final writes match</b> — the transaction that performs the last write on each data item is the
              same in both.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A schedule is <b>view serializable</b> if it is view equivalent to some serial schedule. Every
              conflict-serializable schedule is view serializable; the reverse is false. The schedules that are view
              but not conflict serializable always contain a <b>blind write</b> — a write with no preceding read of
              that item by the same transaction.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Why do systems use conflict serializability if view serializability accepts more schedules? Because
              testing conflict serializability is a <b>cycle check — polynomial time</b>, while testing view
              serializability is <b>NP-complete</b>. Conflict serializability is the practical, checkable
              approximation.
            </>
          ),
        },
      ],
    },

    {
      id: 'recoverability',
      heading: 'Recoverability',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Serializability guarantees the <i>result</i> is correct. It says nothing about what happens when a
              transaction <b>aborts</b> — that is a separate hierarchy.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Class', 'Rule', 'Problem it removes'],
          rows: [
            [
              'Irrecoverable',
              'Tj reads from Ti and commits before Ti commits',
              'Nothing — if Ti later aborts, Tj is already committed on bad data and cannot be undone',
            ],
            [
              'Recoverable',
              'Tj commits only after every transaction it read from has committed',
              'Guarantees a correct rollback is at least possible',
            ],
            [
              'Cascadeless (ACA)',
              'Tj reads a value only after the transaction that wrote it has committed',
              'Removes cascading rollback — one abort can no longer force a chain of others',
            ],
            [
              'Strict',
              'No other transaction may read OR write an item until the writer commits or aborts',
              'Makes recovery trivial: undo just restores the before-image',
            ],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              The containment is <b>Strict ⊂ Cascadeless ⊂ Recoverable ⊂ All schedules</b>. Real systems use{' '}
              <b>strict</b> schedules, which is exactly what Strict 2PL produces.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Cascading rollback',
          text: (
            <>
              If T2 read T1's uncommitted data and T1 aborts, T2 must abort too — and anything that read T2 must
              abort as well. One failure can unwind an unbounded chain of work. Cascadeless schedules exist purely
              to make that impossible.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a schedule?',
      a: (
        <>
          The chronological order in which the operations of several concurrent transactions execute. Operations
          within a single transaction must retain their original relative order; only the interleaving between
          transactions varies.
        </>
      ),
    },
    {
      q: 'When do two operations conflict?',
      a: (
        <>
          When they are from <b>different transactions</b>, access the <b>same data item</b>, and{' '}
          <b>at least one is a write</b>. Two reads never conflict, and operations on different items never
          conflict.
        </>
      ),
    },
    {
      q: 'How do you check if a schedule is conflict serializable?',
      a: (
        <>
          Build a <b>precedence graph</b>: one node per transaction, and an edge Ti → Tj for each conflicting pair
          where Ti's operation comes first. If the graph is <b>acyclic</b>, the schedule is conflict serializable,
          and any topological order gives an equivalent serial schedule.
        </>
      ),
    },
    {
      q: 'Difference between conflict and view serializability?',
      a: (
        <>
          Conflict serializability requires reordering into a serial schedule using only swaps of adjacent
          non-conflicting operations. View serializability only requires the same initial reads, the same read-from
          relationships and the same final writes. Conflict ⊂ view; the extra schedules view admits always involve{' '}
          <b>blind writes</b>.
        </>
      ),
    },
    {
      q: 'Why do systems use conflict serializability rather than view?',
      a: (
        <>
          Because it is <b>efficiently testable</b> — a cycle check runs in polynomial time, whereas testing view
          serializability is <b>NP-complete</b>. Conflict serializability is a slightly conservative but practical
          approximation.
        </>
      ),
    },
    {
      q: 'Explain dirty read, unrepeatable read and phantom read.',
      a: (
        <>
          <b>Dirty read</b>: reading data written by an uncommitted transaction that may still abort.{' '}
          <b>Unrepeatable read</b>: re-reading the same row inside one transaction and getting a different value,
          because someone updated and committed in between. <b>Phantom read</b>: re-running the same range query
          and getting a different <i>set</i> of rows because someone inserted or deleted.
        </>
      ),
    },
    {
      q: 'What is a cascading rollback and how is it prevented?',
      a: (
        <>
          When one transaction aborts, every transaction that read its uncommitted data must abort too, and so on
          down the chain. It is prevented by using <b>cascadeless</b> schedules — only ever read data that has
          already been committed, which Strict 2PL enforces automatically.
        </>
      ),
    },
    {
      q: 'What is a strict schedule?',
      a: (
        <>
          One where no other transaction may read <b>or write</b> a data item until the transaction that last wrote
          it has committed or aborted. It makes recovery trivial — undo just restores the before-image — and it is
          what real systems implement.
        </>
      ),
    },
    {
      q: 'How many serial schedules exist for n transactions?',
      a: (
        <>
          <b>n!</b> — every permutation. They may produce different final states, and all of them are considered
          correct; serializability only requires equivalence to <i>some</i> serial schedule, not a specific one.
        </>
      ),
    },
    {
      q: 'Is every serializable schedule recoverable?',
      a: (
        <>
          No — the two properties are independent. Serializability is about the correctness of the result when
          everything commits; recoverability is about what happens when something <b>aborts</b>. A schedule can be
          conflict serializable and still irrecoverable, which is why systems require both.
        </>
      ),
    },
  ],
};

export default topic;
