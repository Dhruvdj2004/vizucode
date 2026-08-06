import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Which phenomena each isolation level still allows. */
function LevelMatrix() {
  return (
    <Dg w={620} h={224} cap="The four SQL isolation levels and the anomalies each one still permits">
      <Rel
        x={30}
        y={52}
        cols={['Isolation level', 'Dirty', 'Unrepeatable', 'Phantom']}
        rows={[
          ['READ UNCOMMITTED', 'yes', 'yes', 'yes'],
          ['READ COMMITTED', 'no', 'yes', 'yes'],
          ['REPEATABLE READ', 'no', 'no', 'yes *'],
          ['SERIALIZABLE', 'no', 'no', 'no'],
        ]}
        cw={[178, 72, 116, 84]}
        c="n"
        mark={{
          '0,1': 'c', '0,2': 'c', '0,3': 'c',
          '1,1': 'b', '1,2': 'c', '1,3': 'c',
          '2,1': 'b', '2,2': 'b', '2,3': 'c',
          '3,1': 'b', '3,2': 'b', '3,3': 'b',
        }}
      />
      <Txt x={498} y={78} anchor="start" fs={10.5} bold c="c">
        fastest
      </Txt>
      <Arrow x1={528} y1={88} x2={528} y2={140} c="n" />
      <Txt x={498} y={158} anchor="start" fs={10.5} bold c="b">
        safest
      </Txt>
      <Txt x={280} y={196} fs={10} soft>
        * the standard permits phantoms here; MySQL InnoDB blocks them anyway via next-key locking
      </Txt>
    </Dg>
  );
}

/** Write skew — the anomaly snapshot isolation cannot stop. */
function WriteSkew() {
  return (
    <Dg w={620} h={278} cap="Two transactions each read a valid state and each make a valid change, yet together break the rule">
      <Txt x={310} y={24} fs={11} bold c="c">
        rule: at least one doctor must remain on call
      </Txt>
      <Rel
        x={118}
        y={38}
        title="WRITE SKEW"
        cols={['T1 — Alice', 'T2 — Bob']}
        rows={[
          ['reads: 2 on call', ''],
          ['', 'reads: 2 on call'],
          ['Alice → off call', ''],
          ['', 'Bob → off call'],
          ['commit ✓', ''],
          ['', 'commit ✓'],
        ]}
        cw={[192, 192]}
        c="c"
      />
      <Txt x={310} y={252} fs={11} bold c="c">
        zero doctors on call — yet neither transaction did anything wrong
      </Txt>
      <Txt x={310} y={270} fs={10.5} soft>
        they wrote different rows, so snapshot isolation sees no conflict
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'isolation-levels',
  num: 18,
  unit: 'Transactions & Concurrency',
  title: 'Isolation Levels & Read Phenomena',
  blurb:
    'The four SQL isolation levels, exactly which anomaly each one prevents, how they are implemented, and the write skew that snapshot isolation misses.',
  minutes: 11,
  tags: ['Very common', 'Practical'],

  sections: [
    {
      id: 'tradeoff',
      heading: 'The trade-off',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Full isolation — every transaction behaving as if it ran alone — is expensive. It means holding locks
              longer, blocking more readers, and doing more work. Most applications do not need that much
              protection, so SQL lets you <b>buy back concurrency by accepting specific anomalies</b>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              An isolation level is therefore a contract: <i>"these anomalies may happen to you, these may
              not"</i>. Choosing one is a deliberate engineering decision, not a default to ignore.
            </>
          ),
        },
      ],
    },

    {
      id: 'phenomena',
      heading: 'The three read phenomena',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Dirty read</b> — you read a row another transaction has written but not committed. If it rolls
              back, you acted on data that never existed.
            </>,
            <>
              <b>Non-repeatable read</b> — you read a row, someone else updates and commits it, you read it again
              inside the same transaction and get a different value.
            </>,
            <>
              <b>Phantom read</b> — you run a range query, someone else inserts a row matching that range and
              commits, you re-run the query and a new row has appeared.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The difference that gets tested: a <b>non-repeatable read</b> is an existing row <i>changing</i>; a{' '}
              <b>phantom</b> is the <i>set</i> of matching rows changing. Locking the rows you read stops the first
              but not the second, because you cannot lock a row that does not exist yet — you need a range or
              predicate lock.
            </>
          ),
        },
      ],
    },

    {
      id: 'levels',
      heading: 'The four levels',
      blocks: [
        { k: 'diagram', el: <LevelMatrix />, caption: 'Memorise this grid — it is asked almost verbatim.' },
        {
          k: 'steps',
          items: [
            {
              t: 'READ UNCOMMITTED',
              d: 'Effectively no read isolation — you may see uncommitted data. Fast, and almost never appropriate. Realistically only for approximate reporting where a slightly wrong number is acceptable.',
            },
            {
              t: 'READ COMMITTED',
              d: 'You only ever see committed data, but each statement sees a fresh view. The default in PostgreSQL, Oracle and SQL Server. Good general choice for OLTP.',
            },
            {
              t: 'REPEATABLE READ',
              d: 'Every read of the same row inside one transaction returns the same value. The default in MySQL InnoDB. Under the standard, phantoms are still allowed.',
            },
            {
              t: 'SERIALIZABLE',
              d: 'The result is equivalent to some serial execution. No anomalies. The slowest, and the level with the most aborts or blocking.',
            },
          ],
        },
      ],
    },

    {
      id: 'implementation',
      heading: 'How each level is actually implemented',
      blocks: [
        {
          k: 'table',
          head: ['Level', 'Lock-based implementation', 'MVCC implementation'],
          rows: [
            ['READ UNCOMMITTED', 'No shared locks taken on read', 'Read the latest version, committed or not'],
            [
              'READ COMMITTED',
              'Shared locks taken and released immediately after the read; exclusive locks held to commit',
              'A fresh snapshot at the start of each statement',
            ],
            [
              'REPEATABLE READ',
              'Shared locks held until commit (strict 2PL on reads too)',
              'One snapshot taken at the start of the transaction and used throughout',
            ],
            [
              'SERIALIZABLE',
              'Strict 2PL plus range / predicate locks to block phantoms',
              'Snapshot isolation plus conflict detection (e.g. PostgreSQL\'s serializable snapshot isolation)',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              This table explains the anomalies rather than just listing them. Non-repeatable reads happen at READ
              COMMITTED precisely because the shared lock is <b>released right after the read</b> (or the snapshot
              is refreshed per statement). Say that, and you have explained the mechanism instead of reciting a
              grid.
            </>
          ),
        },
      ],
    },

    {
      id: 'snapshot',
      heading: 'Snapshot isolation and write skew',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Snapshot isolation</b> is what most MVCC databases actually give you when you ask for REPEATABLE
              READ. Each transaction reads a consistent snapshot from its start time, and write-write conflicts are
              resolved by first-committer-wins. It prevents all three classic read phenomena — but it is{' '}
              <b>not</b> serializable.
            </>
          ),
        },
        { k: 'diagram', el: <WriteSkew />, caption: 'Write skew: the anomaly that survives snapshot isolation.' },
        {
          k: 'p',
          text: (
            <>
              Write skew happens when two transactions read an overlapping set of rows, then each write{' '}
              <b>different</b> rows based on what they read. There is no write-write conflict, so nothing is
              detected — yet the invariant that spanned both rows is violated. Fixes: use true SERIALIZABLE, or
              explicitly lock the rows you read.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Being able to name <b>write skew</b> and explain why snapshot isolation misses it is a strong signal.
              It shows you understand isolation as a mechanism rather than as a memorised table.
            </>
          ),
        },
      ],
    },

    {
      id: 'choosing',
      heading: 'Choosing a level',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Money, inventory, seat booking, anything with an invariant across rows</b> → SERIALIZABLE, or
              READ COMMITTED with explicit row locking on the rows you check.
            </>,
            <>
              <b>Ordinary CRUD</b> → READ COMMITTED. It is the default almost everywhere for good reason.
            </>,
            <>
              <b>A report that must see one consistent point in time</b> → REPEATABLE READ / snapshot, so the
              numbers across many queries agree with each other.
            </>,
            <>
              <b>Approximate dashboards where speed beats precision</b> → READ UNCOMMITTED, reluctantly.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Higher isolation does not only cost throughput — it changes <b>failure modes</b>. Under SERIALIZABLE,
              MVCC systems abort transactions that cannot be serialized, so your application <i>must</i> handle
              serialization failures and retry. Choosing the strictest level without retry logic makes the system
              less reliable, not more.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What are the four isolation levels?',
      a: (
        <>
          READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ and SERIALIZABLE — in increasing order of isolation and
          decreasing order of concurrency.
        </>
      ),
    },
    {
      q: 'Which anomalies does each level allow?',
      a: (
        <>
          READ UNCOMMITTED allows dirty, non-repeatable and phantom reads. READ COMMITTED prevents dirty reads only.
          REPEATABLE READ additionally prevents non-repeatable reads but permits phantoms under the standard.
          SERIALIZABLE prevents all three.
        </>
      ),
    },
    {
      q: 'Difference between non-repeatable read and phantom read?',
      a: (
        <>
          A non-repeatable read is an <b>existing row's value changing</b> between two reads in one transaction. A
          phantom is the <b>set of rows matching a predicate changing</b> — a new row appears or disappears.
          Row-level locks prevent the first; you need range or predicate locks for the second.
        </>
      ),
    },
    {
      q: 'Why does READ COMMITTED allow non-repeatable reads?',
      a: (
        <>
          Because the shared lock on a row is released as soon as the read finishes (or, in MVCC, the snapshot is
          refreshed for each statement). Another transaction is then free to update and commit that row before you
          read it again.
        </>
      ),
    },
    {
      q: 'What is the default isolation level in MySQL and PostgreSQL?',
      a: (
        <>
          MySQL InnoDB defaults to <b>REPEATABLE READ</b> (and its next-key locking blocks phantoms too, going
          beyond the standard). PostgreSQL, Oracle and SQL Server default to <b>READ COMMITTED</b>.
        </>
      ),
    },
    {
      q: 'What is snapshot isolation?',
      a: (
        <>
          An MVCC-based level where each transaction reads a consistent snapshot taken at its start, and
          write-write conflicts are resolved by first-committer-wins. It prevents all three read phenomena but is{' '}
          <b>not serializable</b> — it still allows <b>write skew</b>.
        </>
      ),
    },
    {
      q: 'What is write skew?',
      a: (
        <>
          Two transactions read an overlapping set of rows and then write <b>different</b> rows based on what they
          read. Neither sees a write-write conflict, so snapshot isolation permits both, yet an invariant spanning
          those rows is broken — like two on-call doctors each going off call because each saw two on call.
        </>
      ),
    },
    {
      q: 'Is a higher isolation level always better?',
      a: (
        <>
          No. It costs concurrency and, in MVCC systems, causes <b>serialization failures</b> that the application
          must catch and retry. If your application does not retry, choosing SERIALIZABLE can make it less reliable
          than READ COMMITTED with well-placed explicit locks.
        </>
      ),
    },
    {
      q: 'How would you prevent a double-booking of a seat?',
      a: (
        <>
          Either SERIALIZABLE with retry, or — more commonly — READ COMMITTED plus an explicit exclusive lock on
          the seat row before checking availability, so the check and the update are atomic. A unique constraint on
          (show, seat) is a valuable second line of defence, since the database will reject the duplicate regardless
          of the isolation level.
        </>
      ),
    },
  ],
};

export default topic;
