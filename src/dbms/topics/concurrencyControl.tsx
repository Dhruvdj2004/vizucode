import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Lock count over time: basic 2PL vs strict 2PL. */
function TwoPlPhases() {
  const axes = (fx: number) => (
    <>
      <line x1={fx + 34} y1={206} x2={fx + 268} y2={206} stroke="var(--ink-faint)" strokeWidth="1.2" />
      <line x1={fx + 34} y1={206} x2={fx + 34} y2={44} stroke="var(--ink-faint)" strokeWidth="1.2" />
      <Txt x={fx + 150} y={228} fs={10} soft>
        time →
      </Txt>
    </>
  );
  return (
    <Dg w={608} h={242} cap="Basic 2PL releases locks early; strict 2PL holds every exclusive lock until commit">
      <Frame x={2} y={8} w={292} h={228} label="BASIC 2PL" c="a" />
      {axes(2)}
      <polyline points="36,206 136,72 168,72 268,206" fill="none" stroke="var(--accent)" strokeWidth="2.2" />
      <line x1={152} y1={72} x2={152} y2={206} stroke="var(--accent-3)" strokeWidth="1.2" strokeDasharray="4 4" />
      <Txt x={152} y={62} fs={10} bold c="c">
        lock point
      </Txt>
      <Txt x={86} y={140} fs={10} bold c="a">
        growing
      </Txt>
      <Txt x={218} y={140} fs={10} bold c="a">
        shrinking
      </Txt>
      <Txt x={148} y={190} fs={9.5} soft>
        locks released before commit → cascading aborts possible
      </Txt>

      <Frame x={314} y={8} w={292} h={228} label="STRICT 2PL" c="b" />
      {axes(314)}
      <polyline points="348,206 448,72 566,72 568,206" fill="none" stroke="var(--accent-2)" strokeWidth="2.2" />
      <Txt x={566} y={62} fs={10} bold c="c">
        commit
      </Txt>
      <Txt x={400} y={140} fs={10} bold c="b">
        growing
      </Txt>
      <Txt x={508} y={140} fs={10} bold c="b">
        all locks held
      </Txt>
      <Txt x={460} y={190} fs={9.5} soft>
        everything released at once → strict, cascadeless
      </Txt>
    </Dg>
  );
}

/** MVCC: two readers, two versions, nobody blocked. */
function Mvcc() {
  return (
    <Dg w={600} h={256} cap="Multiversion concurrency control keeps old versions so readers never block">
      <Txt x={300} y={28} fs={11} bold c="n">
        one row, two versions kept side by side
      </Txt>
      <Box x={60} y={54} w={200} h={48} label="A = 100" sub="written by txn 10" c="b" fs={13} />
      <Arrow x1={262} y1={78} x2={336} y2={78} c="n" label="update by txn 20" dy={-10} />
      <Box x={340} y={54} w={200} h={48} label="A = 90" sub="written by txn 20" c="a" fs={13} />

      <Arrow x1={160} y1={168} x2={160} y2={108} c="b" />
      <Arrow x1={440} y1={168} x2={440} y2={108} c="a" />
      <Box x={60} y={170} w={200} h={50} label="Reader at time 15" sub="still sees 100" c="b" fs={12} />
      <Box x={340} y={170} w={200} h={50} label="Reader at time 25" sub="sees 90" c="a" fs={12} />

      <Txt x={300} y={246} fs={10.5} soft>
        readers never block writers · writers never block readers
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'concurrency-control',
  num: 16,
  unit: 'Transactions & Concurrency',
  title: 'Concurrency Control Protocols',
  blurb:
    'Locks and the lock compatibility matrix, all four flavours of two-phase locking, timestamp ordering, optimistic validation and MVCC.',
  minutes: 16,
  tags: ['Very common'],

  sections: [
    {
      id: 'locks',
      heading: 'Lock-based protocols',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>lock</b> is a claim on a data item. Before touching an item a transaction must acquire the right
              kind of lock, and it must wait if that lock is not compatible with one already held.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Shared lock (S)</b> — for reading. Many transactions can hold S on the same item at once.
            </>,
            <>
              <b>Exclusive lock (X)</b> — for writing. Only one transaction can hold it, and no S locks may coexist
              with it.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['Requested →  Held ↓', 'Shared (S)', 'Exclusive (X)'],
          rows: [
            ['Shared (S)', '✓ granted', '✗ wait'],
            ['Exclusive (X)', '✗ wait', '✗ wait'],
          ],
          caption: 'The lock compatibility matrix — only read-read is compatible.',
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Locking alone does <b>not</b> guarantee serializability. A transaction that grabs a lock, releases it,
              and later grabs another can still produce a non-serializable schedule. That is precisely the gap
              two-phase locking closes.
            </>
          ),
        },
      ],
    },

    {
      id: 'two-phase',
      heading: 'Two-Phase Locking (2PL)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>The rule:</b> a transaction may not acquire any lock after it has released its first one. Every
              transaction therefore has a <b>growing phase</b> (locks only acquired) followed by a{' '}
              <b>shrinking phase</b> (locks only released). The boundary is the <b>lock point</b>.
            </>
          ),
        },
        { k: 'diagram', el: <TwoPlPhases />, caption: 'The shape of the curve is the protocol.' },
        {
          k: 'p',
          text: (
            <>
              2PL <b>guarantees conflict serializability</b> — the equivalent serial order is simply the order of
              the transactions' lock points. That is the single most important fact in this topic.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Variant', 'Rule', 'Guarantees', 'Cost'],
          rows: [
            ['Basic 2PL', 'Growing then shrinking', 'Conflict serializability', 'Deadlock possible; cascading rollback possible'],
            [
              'Conservative (static) 2PL',
              'Acquire ALL locks before the transaction starts; block if any is unavailable',
              'Serializability and deadlock freedom',
              'Must know the full lock set in advance; very low concurrency',
            ],
            [
              'Strict 2PL',
              'Hold all EXCLUSIVE locks until commit or abort',
              'Serializability + strict + cascadeless schedules',
              'Deadlock still possible; longer lock hold times',
            ],
            [
              'Rigorous 2PL',
              'Hold ALL locks (shared and exclusive) until commit',
              'Same as strict, and the serial order equals the commit order',
              'Lowest concurrency of the practical variants',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              <b>Strict 2PL is what real databases implement.</b> Basic 2PL gives serializability but still allows
              cascading rollback; holding exclusive locks to commit costs a little concurrency and buys you a
              cascadeless, easily recoverable system. Conservative 2PL is the only deadlock-free variant, and it is
              impractical because you rarely know every item you will touch up front.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              One more useful piece of vocabulary: <b>lock upgrade</b> (S → X) is permitted only during the growing
              phase, and <b>lock downgrade</b> (X → S) only during the shrinking phase. Upgrades are a common source
              of deadlock, because two transactions holding S on the same row can both request X and wait forever.
            </>
          ),
        },
      ],
    },

    {
      id: 'granularity',
      heading: 'Lock granularity',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              What exactly do you lock — a row, a page, a table, the whole database? It is a direct trade-off.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Coarse (table-level)</b> — few locks, low bookkeeping overhead, but terrible concurrency.
            </>,
            <>
              <b>Fine (row-level)</b> — excellent concurrency, but thousands of locks means real memory and CPU cost
              in the lock manager.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              Real systems support several levels at once via <b>intention locks</b>: before locking a row, a
              transaction places an <b>IS</b> or <b>IX</b> lock on the table above it. That way a transaction
              wanting a full-table lock can tell instantly that someone is working inside, without scanning every
              row. The full set is <b>IS, IX, S, SIX and X</b>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Systems also apply <b>lock escalation</b>: once a transaction holds too many row locks, the manager
              swaps them for a single table lock to cap the overhead.
            </>
          ),
        },
      ],
    },

    {
      id: 'timestamp',
      heading: 'Timestamp ordering',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A lock-free alternative. Every transaction gets a unique <b>timestamp TS(T)</b> when it starts, and the
              system enforces that the schedule is equivalent to the serial order of those timestamps. Each data item
              X carries two stamps:
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>read_TS(X)</b> — the largest timestamp of any transaction that has read X.
            </>,
            <>
              <b>write_TS(X)</b> — the largest timestamp of any transaction that has written X.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'The protocol',
          code: `T issues read(X):
    if TS(T) < write_TS(X):     ABORT T
        (a younger transaction already wrote X — T is reading
         a value that, in timestamp order, no longer exists)
    else:                       allow, and set read_TS(X) = max(read_TS(X), TS(T))

T issues write(X):
    if TS(T) < read_TS(X):      ABORT T
        (someone younger already read the old value)
    if TS(T) < write_TS(X):     ABORT T   — or apply Thomas's Write Rule
    else:                       allow, and set write_TS(X) = TS(T)`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: "Thomas's Write Rule",
          text: (
            <>
              If <code>TS(T) &lt; write_TS(X)</code> — an older transaction is trying to write a value that a
              younger one already overwrote — you can simply <b>ignore the write</b> instead of aborting. Nobody
              will ever read it. This makes the protocol accept more schedules (it becomes view-serializable rather
              than merely conflict-serializable).
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Timestamp ordering is <b>deadlock-free</b> — nothing ever waits, it only aborts. The price is{' '}
              <b>starvation</b>: a long transaction can be repeatedly restarted and never finish.
            </>
          ),
        },
      ],
    },

    {
      id: 'optimistic',
      heading: 'Optimistic (validation-based) concurrency control',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Assume conflicts are rare. Let transactions run freely against a private workspace, and check for
              conflicts only at the end. Three phases:
            </>
          ),
        },
        {
          k: 'steps',
          items: [
            { t: 'Read phase', d: 'Read whatever you need and make all changes to a private local copy. Nothing is visible to anyone else, and nothing is locked.' },
            {
              t: 'Validation phase',
              d: 'Before committing, check whether this transaction conflicts with any transaction that committed while it was running. If it does, abort and restart.',
            },
            { t: 'Write phase', d: 'If validation passed, copy the private changes into the database.' },
          ],
        },
        {
          k: 'p',
          text: (
            <>
              Excellent when conflicts are genuinely rare — no locking overhead at all. Terrible under contention,
              because work is repeatedly done and thrown away. This is the model behind most application-level{' '}
              <b>optimistic locking</b> with a version column.
            </>
          ),
        },
      ],
    },

    {
      id: 'mvcc',
      heading: 'Multiversion concurrency control (MVCC)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The dominant technique in modern databases — PostgreSQL, Oracle, MySQL InnoDB and SQL Server's
              snapshot isolation all use it. Instead of overwriting a value, a write creates a <b>new version</b>{' '}
              and the old one is kept.
            </>
          ),
        },
        { k: 'diagram', el: <Mvcc />, caption: 'Each transaction reads the version that was current when it started.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Readers never block writers, and writers never block readers.</b> This is the entire selling
              point, and the sentence to say in an interview.
            </>,
            <>
              A read-only transaction never waits and never aborts — it just reads its snapshot.
            </>,
            <>
              Writers still conflict with each other, so write-write conflicts need locks or first-committer-wins
              validation.
            </>,
            <>
              The cost is <b>storage</b> and <b>garbage collection</b>: obsolete versions must eventually be cleaned
              up (PostgreSQL's <code>VACUUM</code>, InnoDB's purge threads, Oracle's undo segments).
            </>,
          ],
        },
      ],
    },

    {
      id: 'compare',
      heading: 'Choosing between them',
      blocks: [
        {
          k: 'table',
          head: ['Protocol', 'Deadlocks?', 'Starvation?', 'Best when'],
          rows: [
            ['Strict 2PL', 'Yes — needs detection or prevention', 'Possible', 'General purpose; the default in most systems'],
            ['Conservative 2PL', 'No', 'Possible', 'Lock set is known up front and conflicts are frequent'],
            ['Timestamp ordering', 'No — never waits', 'Yes — long transactions get restarted', 'Short transactions, low contention'],
            ['Optimistic', 'No', 'Yes', 'Conflicts genuinely rare; read-mostly workloads'],
            ['MVCC', 'Only between writers', 'Rare', 'Read-heavy workloads — the modern default'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is two-phase locking and what does it guarantee?',
      a: (
        <>
          A protocol where every transaction has a growing phase (locks acquired only) and a shrinking phase (locks
          released only), with no acquisition after the first release. It <b>guarantees conflict
          serializability</b> — the equivalent serial order is the order of the transactions' lock points.
        </>
      ),
    },
    {
      q: 'Does 2PL prevent deadlocks?',
      a: (
        <>
          No. Basic and strict 2PL are both deadlock-prone — two transactions can each hold a lock the other needs.
          Only <b>conservative 2PL</b>, which acquires every lock atomically before starting, is deadlock-free, and
          it is rarely practical.
        </>
      ),
    },
    {
      q: 'Difference between strict 2PL and rigorous 2PL?',
      a: (
        <>
          <b>Strict</b> holds only the <b>exclusive</b> locks until commit; shared locks may be released earlier.{' '}
          <b>Rigorous</b> holds <b>all</b> locks until commit, which makes the serialization order identical to the
          commit order. Rigorous is simpler to reason about but allows less concurrency.
        </>
      ),
    },
    {
      q: 'Why do real systems use strict 2PL?',
      a: (
        <>
          Because holding exclusive locks to commit makes every schedule <b>strict</b> and therefore{' '}
          <b>cascadeless</b>: nobody can read uncommitted data, so one abort never cascades into others, and
          recovery is a simple before-image restore.
        </>
      ),
    },
    {
      q: 'Explain the timestamp ordering protocol.',
      a: (
        <>
          Each transaction gets a start timestamp, and each item tracks the largest read and write timestamps seen.
          A read is rejected if a younger transaction has already written the item; a write is rejected if a younger
          transaction has already read or written it. Rejected transactions abort and restart. It is deadlock-free
          but starvation-prone.
        </>
      ),
    },
    {
      q: "What is Thomas's Write Rule?",
      a: (
        <>
          An optimisation for timestamp ordering: an obsolete write (one from a transaction older than{' '}
          <code>write_TS(X)</code>) is simply <b>ignored</b> instead of causing an abort, because no one will ever
          read that value. It lets the protocol accept view-serializable schedules that pure timestamp ordering
          would reject.
        </>
      ),
    },
    {
      q: 'What is MVCC and what is its main advantage?',
      a: (
        <>
          Multiversion concurrency control keeps multiple versions of each row, so a transaction reads a consistent
          snapshot from when it started. The advantage: <b>readers never block writers and writers never block
          readers</b>, which dramatically improves throughput on read-heavy workloads. The cost is storage plus
          garbage collection of old versions.
        </>
      ),
    },
    {
      q: 'What are intention locks and why are they needed?',
      a: (
        <>
          Locks (<b>IS</b>, <b>IX</b>, <b>SIX</b>) placed on a coarse object to signal that a finer-grained lock is
          held below it. They let a transaction requesting a table-level lock detect existing row-level locks
          instantly, instead of scanning every row. They are what makes multiple granularity locking practical.
        </>
      ),
    },
    {
      q: 'When would optimistic concurrency control beat locking?',
      a: (
        <>
          When conflicts are rare — read-mostly workloads, or transactions touching disjoint data. You avoid all
          locking overhead entirely. Under high contention it performs badly, because transactions repeatedly do
          work and then throw it away at validation.
        </>
      ),
    },
    {
      q: 'Can a lock upgrade cause a deadlock?',
      a: (
        <>
          Yes, and it is a common cause. If two transactions both hold a shared lock on the same row and both then
          request an exclusive lock, each waits for the other to release its S lock — a deadlock. Some systems use
          an <b>update lock</b> (U) specifically to avoid this pattern.
        </>
      ),
    },
  ],
};

export default topic;
