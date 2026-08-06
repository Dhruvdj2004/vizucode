import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** The bank transfer, with and without atomicity. */
function BankTransfer() {
  return (
    <Dg w={614} h={272} cap="A crash halfway through a transfer, with and without atomicity">
      <Frame x={2} y={8} w={296} h={252} label="WITHOUT ATOMICITY" c="c" />
      <Box x={24} y={40} w={112} h={36} label="A = 1000" c="n" fs={12} />
      <Box x={164} y={40} w={112} h={36} label="B = 500" c="n" fs={12} />
      <Arrow x1={150} y1={78} x2={150} y2={94} c="n" />
      <Txt x={150} y={112} fs={11} c="b" bold>
        debit A by 200 ✓
      </Txt>
      <Txt x={150} y={138} fs={13} bold c="c">
        ⚡ CRASH
      </Txt>
      <Txt x={150} y={160} fs={11} soft>
        credit B by 200 — never ran
      </Txt>
      <Box x={24} y={176} w={112} h={36} label="A = 800" c="c" fs={12} />
      <Box x={164} y={176} w={112} h={36} label="B = 500" c="c" fs={12} />
      <Txt x={150} y={236} fs={10.5} soft>
        total = 1300 · ₹200 vanished
      </Txt>

      <Frame x={314} y={8} w={296} h={252} label="WITH ATOMICITY" c="b" />
      <Box x={336} y={40} w={112} h={36} label="A = 1000" c="n" fs={12} />
      <Box x={476} y={40} w={112} h={36} label="B = 500" c="n" fs={12} />
      <Arrow x1={462} y1={78} x2={462} y2={94} c="n" />
      <Txt x={462} y={112} fs={11} c="b" bold>
        debit A by 200 ✓
      </Txt>
      <Txt x={462} y={138} fs={13} bold c="c">
        ⚡ CRASH
      </Txt>
      <Txt x={462} y={160} fs={11} c="b" bold>
        rollback undoes the debit
      </Txt>
      <Box x={336} y={176} w={112} h={36} label="A = 1000" c="b" fs={12} />
      <Box x={476} y={176} w={112} h={36} label="B = 500" c="b" fs={12} />
      <Txt x={462} y={236} fs={10.5} soft>
        total = 1500 · nothing lost
      </Txt>
    </Dg>
  );
}

/** Transaction state machine. */
function TxnStates() {
  return (
    <Dg w={620} h={268} cap="The five states a transaction moves through">
      <Txt x={16} y={132} anchor="start" fs={10.5} soft>
        begin
      </Txt>
      <Arrow x1={16} y1={142} x2={56} y2={142} c="n" />
      <Box x={58} y={120} w={112} h={44} label="ACTIVE" sub="executing" c="a" fs={12} />

      <Arrow x1={172} y1={128} x2={246} y2={78} c="n" label="last op done" dy={-8} dx={-6} />
      <Box x={248} y={40} w={152} h={44} label="PARTIALLY" sub="COMMITTED" c="a" fs={12} />

      <Arrow x1={402} y1={62} x2={464} y2={62} c="b" label="commit" dy={-8} />
      <Box x={466} y={40} w={136} h={44} label="COMMITTED" sub="permanent" c="b" fs={12} />

      <Arrow x1={140} y1={166} x2={272} y2={198} c="c" label="error" dy={16} dx={-30} />
      <Arrow x1={324} y1={86} x2={324} y2={196} c="c" label="write fails" dy={0} dx={54} />
      <Box x={248} y={198} w={130} h={44} label="FAILED" sub="cannot proceed" c="c" fs={12} />

      <Arrow x1={380} y1={220} x2={464} y2={220} c="c" label="rollback" dy={-8} />
      <Box x={466} y={198} w={136} h={44} label="ABORTED" sub="undone fully" c="c" fs={12} />
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'transactions-acid',
  num: 14,
  unit: 'Transactions & Concurrency',
  title: 'Transactions & ACID',
  blurb:
    'What a transaction is, the four ACID properties with the component that enforces each one, and the five states a transaction passes through.',
  minutes: 12,
  tags: ['Very common', 'Definition-heavy'],

  sections: [
    {
      id: 'what',
      heading: 'What a transaction is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>transaction</b> is a single logical unit of work — a group of operations that must either{' '}
              <b>all</b> take effect or <b>none</b> of them. The database may pass through invalid intermediate
              states inside a transaction, but never outside one.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The canonical example',
          code: `Transfer ₹200 from account A to account B

    read(A)
    A := A − 200
    write(A)
    read(B)
    B := B + 200
    write(B)
    commit

Between write(A) and write(B) the database is inconsistent —
₹200 exists nowhere. That window must never be observable.`,
        },
        { k: 'diagram', el: <BankTransfer />, caption: 'The same crash, with and without the atomicity guarantee.' },
      ],
    },

    {
      id: 'acid',
      heading: 'The ACID properties',
      blocks: [
        {
          k: 'table',
          head: ['Property', 'Guarantee', 'Enforced by', 'Broken by'],
          rows: [
            [
              'Atomicity',
              'All operations complete, or none do. There is no partial transaction.',
              'Transaction manager + the log (undo)',
              'A crash or an error mid-transaction',
            ],
            [
              'Consistency',
              'A transaction takes the database from one valid state to another — all constraints still hold.',
              'The application plus integrity constraints',
              'Buggy application logic; a violated constraint',
            ],
            [
              'Isolation',
              'Concurrent transactions produce the same result as some serial order. Nobody sees anybody else\'s uncommitted work.',
              'Concurrency control — locks, timestamps, MVCC',
              'Interleaving without control (dirty reads, lost updates)',
            ],
            [
              'Durability',
              'Once committed, the changes survive any subsequent crash.',
              'Write-ahead log + recovery manager',
              'Power loss before the log reaches disk',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The odd one out',
          text: (
            <>
              <b>Consistency is the only property the DBMS cannot enforce alone.</b> The database can check declared
              constraints, but "the transfer must not create money" is a rule of your application. If you write code
              that debits without crediting, ACID will faithfully make that bug atomic, isolated and durable.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A neat way to remember which component does what: <b>atomicity and durability come from the log</b>,{' '}
              <b>isolation comes from concurrency control</b>, and <b>consistency comes from you</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'states',
      heading: 'Transaction states',
      blocks: [
        { k: 'diagram', el: <TxnStates />, caption: 'Only COMMITTED and ABORTED are terminal states.' },
        {
          k: 'steps',
          items: [
            { t: 'Active', d: 'The transaction is executing. All reads and writes happen here, usually against buffer pages in memory.' },
            {
              t: 'Partially committed',
              d: 'The final statement has executed, but the changes may still only be in memory. The transaction is not safe yet.',
            },
            {
              t: 'Committed',
              d: 'The log record has reached stable storage. The transaction is now permanent and can never be rolled back.',
            },
            { t: 'Failed', d: 'Something went wrong — a constraint violation, a deadlock victim, a crash — and normal execution cannot continue.' },
            { t: 'Aborted', d: 'The database has been rolled back to the state before the transaction started. It may now be restarted or killed.' },
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The gap between <b>partially committed</b> and <b>committed</b> is where durability is actually won.
              A transaction is only committed once its log record is on <b>stable storage</b> — not when the last
              statement ran, and not when the data pages were modified in the buffer.
            </>
          ),
        },
      ],
    },

    {
      id: 'operations',
      heading: 'The operations that matter',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>read(X)</b> — copy data item X from disk (or the buffer) into a local variable.
            </>,
            <>
              <b>write(X)</b> — copy the local value back into the buffer. Note this does <i>not</i> necessarily
              touch disk.
            </>,
            <>
              <b>commit</b> — declare the transaction successful. All changes become permanent and visible.
            </>,
            <>
              <b>abort / rollback</b> — undo everything the transaction did.
            </>,
            <>
              <b>savepoint</b> — a marker inside a transaction that a partial rollback can return to, without
              abandoning the whole transaction.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why can a committed transaction never be rolled back?',
          text: (
            <>
              Because other transactions may already have read its output and committed themselves. Undoing it would
              require undoing them too, and then whatever read <i>those</i> — an unbounded cascade. Commit is
              therefore defined as the point of no return; to reverse its effect you issue a new, compensating
              transaction.
            </>
          ),
        },
      ],
    },

    {
      id: 'why-concurrent',
      heading: 'Why run transactions concurrently at all',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              If serial execution is the gold standard for correctness, why interleave at all? Two reasons, and
              interviewers like hearing both.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Throughput</b> — a transaction spends most of its life waiting for disk. While one waits, another
              can use the CPU, so the system does far more work per second.
            </>,
            <>
              <b>Response time</b> — without interleaving, a short query sitting behind a long report waits for the
              whole report. Interleaving lets short transactions finish quickly instead of being blocked by
              unrelated long ones.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              The cost of that concurrency is the possibility of interference — which is the entire subject of the
              next three topics.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a transaction?',
      a: (
        <>
          A single logical unit of work made up of one or more operations, which must execute completely or not at
          all. The database may be temporarily inconsistent inside a transaction, but never between transactions.
        </>
      ),
    },
    {
      q: 'Explain ACID.',
      a: (
        <>
          <b>Atomicity</b> — all or nothing. <b>Consistency</b> — a transaction moves the database from one valid
          state to another. <b>Isolation</b> — concurrent transactions behave as if run in some serial order.{' '}
          <b>Durability</b> — once committed, changes survive crashes.
        </>
      ),
    },
    {
      q: 'Which ACID property is not enforced by the DBMS alone?',
      a: (
        <>
          <b>Consistency.</b> The DBMS enforces declared constraints, but the business rule that a transfer must
          not create or destroy money lives in the application. ACID will make a buggy transaction atomic and
          durable — it will not make it correct.
        </>
      ),
    },
    {
      q: 'How is atomicity implemented?',
      a: (
        <>
          Through the <b>transaction log</b>. Before a page is modified, an undo record capturing the old value is
          written. If the transaction fails, the recovery manager replays those undo records backwards to erase
          every effect.
        </>
      ),
    },
    {
      q: 'How is durability implemented?',
      a: (
        <>
          Through <b>write-ahead logging</b>: the commit log record is forced to stable storage before the commit is
          acknowledged. Even if the data pages are still only in the buffer when the machine dies, recovery replays
          the log (redo) and reconstructs the committed state.
        </>
      ),
    },
    {
      q: 'What are the states of a transaction?',
      a: (
        <>
          Active → partially committed → committed, or Active/partially committed → failed → aborted. Committed and
          aborted are the two terminal states.
        </>
      ),
    },
    {
      q: 'Difference between partially committed and committed?',
      a: (
        <>
          <b>Partially committed</b> means the last statement executed but the changes may exist only in memory —
          a crash here still rolls the transaction back. <b>Committed</b> means the commit log record reached stable
          storage, making the transaction permanent.
        </>
      ),
    },
    {
      q: 'Can a committed transaction be rolled back?',
      a: (
        <>
          No. Other transactions may already have read its results and committed, so undoing it would cascade
          without bound. To reverse the effect you run a new <b>compensating transaction</b>.
        </>
      ),
    },
    {
      q: 'Why allow concurrent execution if serial execution is safest?',
      a: (
        <>
          For <b>throughput</b> — transactions spend most of their time waiting on I/O, and interleaving keeps the
          CPU and disks busy — and for <b>response time</b>, so a short transaction is not stuck behind a long one.
          Concurrency control exists to get those benefits without losing correctness.
        </>
      ),
    },
    {
      q: 'What is a savepoint?',
      a: (
        <>
          A named marker inside a transaction that you can roll back to without aborting the whole transaction.
          Useful for long transactions where one step may fail but the earlier work is still valid.
        </>
      ),
    },
  ],
};

export default topic;
