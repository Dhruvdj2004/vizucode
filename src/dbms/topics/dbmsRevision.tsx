import type { DbmsTopic } from '../types';

const topic: DbmsTopic = {
  slug: 'dbms-revision',
  num: 26,
  unit: 'Quick Revision',
  title: '10-Minute DBMS Revision',
  blurb:
    'All 25 DBMS topics as recall — the definitions, normal forms, ACID, the isolation-level grid and the indexing facts, on a few screens.',
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
            ['DBMS', 'Software that stores, retrieves and manages data with concurrency, recovery and security built in.'],
            ['Schema vs instance', 'The structure (rarely changes) vs the data in it right now (changes constantly).'],
            ['Three-level architecture', 'External (user views), conceptual (logical schema), internal (physical storage).'],
            ['Data independence', 'Changing one level without touching the level above. Logical is harder than physical.'],
            ['Super key', 'Any attribute set that uniquely identifies a row.'],
            ['Candidate key', 'A minimal super key — remove any attribute and uniqueness is lost.'],
            ['Primary key', 'The candidate key chosen. Unique and NOT NULL.'],
            ['Alternate key', 'The candidate keys not chosen.'],
            ['Foreign key', 'An attribute referencing another relation\'s primary key. Enforces referential integrity.'],
            ['Composite key', 'A primary key made of two or more attributes.'],
            ['Functional dependency', 'X → Y: one X value fixes exactly one Y value.'],
            ['Trivial FD', 'X → Y where Y ⊆ X. Always holds.'],
            ['Prime attribute', 'An attribute belonging to some candidate key.'],
            ['View', 'A stored query presented as a virtual table. No data of its own.'],
            ['Index', 'An auxiliary structure making lookups fast, at the cost of space and slower writes.'],
            ['Transaction', 'A unit of work that is all-or-nothing.'],
          ],
        },
      ],
    },

    {
      id: 'normalization',
      heading: 'The normal forms — the ladder',
      blocks: [
        {
          k: 'table',
          head: ['Form', 'Requires', 'Removes'],
          rows: [
            ['1NF', 'Atomic values, no repeating groups or multi-valued cells', 'Nested / list-valued columns'],
            ['2NF', '1NF + no partial dependency on part of a composite key', 'Partial dependencies'],
            ['3NF', '2NF + no transitive dependency (non-prime → non-prime)', 'Transitive dependencies'],
            ['BCNF', 'For every FD X → Y, X is a super key', 'The remaining key anomalies'],
            ['4NF', 'BCNF + no non-trivial multi-valued dependency', 'Independent multi-valued facts'],
            ['5NF', '4NF + every join dependency implied by candidate keys', 'Spurious-tuple join anomalies'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Say it as a sentence: <b>1NF</b> kills repeating groups, <b>2NF</b> partial dependencies, <b>3NF</b>{' '}
              transitive dependencies, <b>BCNF</b> anything where the determinant is not a key. 3NF is always
              achievable while preserving dependencies; <b>BCNF sometimes is not</b> — that is the trade-off
              question.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Denormalization is not a mistake',
          text: (
            <>
              Production systems deliberately denormalize to avoid expensive joins on read-heavy workloads,
              accepting redundancy and update anomalies in exchange for speed. Saying this is what separates a
              memorised answer from an understood one.
            </>
          ),
        },
      ],
    },

    {
      id: 'transactions',
      heading: 'ACID, schedules and isolation',
      blocks: [
        {
          k: 'table',
          head: ['Property', 'Means', 'Enforced by'],
          rows: [
            ['Atomicity', 'All operations happen or none do', 'Undo log, rollback'],
            ['Consistency', 'Constraints hold before and after', 'Integrity constraints + the application'],
            ['Isolation', 'Concurrent transactions do not see each other mid-flight', 'Locking / MVCC'],
            ['Durability', 'A committed change survives a crash', 'Redo log, write-ahead logging'],
          ],
        },
        {
          k: 'table',
          head: ['Isolation level', 'Dirty read', 'Non-repeatable read', 'Phantom read'],
          rows: [
            ['Read Uncommitted', 'Possible', 'Possible', 'Possible'],
            ['Read Committed', 'Prevented', 'Possible', 'Possible'],
            ['Repeatable Read', 'Prevented', 'Prevented', 'Possible'],
            ['Serializable', 'Prevented', 'Prevented', 'Prevented'],
          ],
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Dirty read</b> — reading uncommitted data. <b>Non-repeatable read</b> — the same row read twice
              gives different values. <b>Phantom read</b> — the same query returns a different <i>set of rows</i>{' '}
              because someone inserted.
            </>,
            <>
              <b>Conflict serializable</b> = the precedence graph has no cycle. Two operations conflict when they
              are on the same item, from different transactions, and <b>at least one is a write</b>.
            </>,
            <>
              <b>2PL</b> guarantees serializability: a growing phase acquiring locks, then a shrinking phase
              releasing them, never acquiring after the first release. <b>Strict 2PL</b> holds all exclusive locks
              until commit — that is what also prevents cascading rollback.
            </>,
            <>
              <b>Deadlock handling</b> — wait-die and wound-wait (timestamp-based prevention), timeouts, or
              detection via a cycle in the wait-for graph.
            </>,
          ],
        },
      ],
    },

    {
      id: 'storage',
      heading: 'Indexing and storage facts',
      blocks: [
        {
          k: 'table',
          head: ['Pair', 'The distinction'],
          rows: [
            ['Clustered vs non-clustered', 'Defines the physical row order — one per table vs a separate structure pointing at rows — many per table.'],
            ['Dense vs sparse index', 'An entry for every record vs one per block. Sparse is smaller but needs the file sorted.'],
            ['Primary vs secondary index', 'On the ordering key of a sorted file vs on any other attribute — always dense.'],
            ['B-tree vs B+ tree', 'Data in every node vs data only in leaves, leaves linked. B+ wins on range scans and fits more keys per node.'],
            ['Static vs dynamic hashing', 'Fixed bucket count, degrades as data grows vs extendible/linear hashing that splits buckets on demand.'],
            ['Hash vs B+ tree index', 'O(1) equality only vs O(log n) but supports ranges, ORDER BY and prefix matches.'],
          ],
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Why B+ trees for databases?</b> High fan-out means a very shallow tree — a few disk reads for
              millions of rows — and the linked leaves make range queries a sequential scan.
            </>,
            <>
              <b>When does an index hurt?</b> Write-heavy tables (every insert updates every index), tiny tables,
              and low-cardinality columns where the optimiser will scan anyway.
            </>,
            <>
              <b>CAP</b> — under a network <b>partition</b> you must choose consistency or availability. Not "pick
              two of three"; partitions are not optional.
            </>,
            <>
              <b>SQL vs NoSQL</b> — fixed schema, ACID, joins, vertical scaling vs flexible schema, BASE eventual
              consistency, horizontal scaling.
            </>,
          ],
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
              <b>Every candidate key is a super key, not the reverse.</b> Minimality is the whole difference.
            </>,
            <>
              <b>A primary key cannot be NULL; a unique key can</b> (usually one NULL). And a table has one primary
              key but many unique keys.
            </>,
            <>
              <b>2NF only bites with a composite key.</b> If your primary key is a single attribute, partial
              dependency is impossible and 1NF implies 2NF.
            </>,
            <>
              <b>Consistency in ACID ≠ consistency in CAP.</b> ACID means constraints hold; CAP means every node
              returns the same value. Different words, same spelling.
            </>,
            <>
              <b>A view is not stored data</b> — it is re-evaluated each time, unless it is a materialized view,
              which is.
            </>,
            <>
              <b>DELETE vs TRUNCATE vs DROP</b> — removes rows with WHERE and can be rolled back; empties the whole
              table fast, no WHERE; removes the table itself.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is normalization and why do it?',
      a: (
        <>
          Organising a schema to remove redundancy and the insert, update and delete anomalies it causes, by
          decomposing tables so every fact is stored once. The cost is more joins at query time.
        </>
      ),
    },
    {
      q: 'Difference between 3NF and BCNF?',
      a: (
        <>
          3NF allows a non-trivial FD X → Y where X is not a super key, provided Y is a <b>prime</b> attribute.
          BCNF forbids it outright — every determinant must be a super key. BCNF is stricter, but decomposition
          into BCNF may lose dependency preservation, which 3NF always keeps.
        </>
      ),
    },
    {
      q: 'Explain ACID.',
      a: (
        <>
          <b>Atomicity</b> — all or nothing, via the undo log. <b>Consistency</b> — constraints hold before and
          after. <b>Isolation</b> — concurrent transactions do not observe each other's intermediate state.{' '}
          <b>Durability</b> — a commit survives a crash, via write-ahead logging.
        </>
      ),
    },
    {
      q: 'Primary key vs unique key vs candidate key?',
      a: (
        <>
          <b>Candidate keys</b> are all the minimal uniquely-identifying attribute sets. The one chosen becomes
          the <b>primary key</b> — unique and NOT NULL, one per table. Other unique constraints are{' '}
          <b>unique keys</b>, which may allow a NULL and can be many per table.
        </>
      ),
    },
    {
      q: 'What are dirty, non-repeatable and phantom reads?',
      a: (
        <>
          <b>Dirty</b> — you read data another transaction has not committed and may roll back.{' '}
          <b>Non-repeatable</b> — you re-read a row and the value has changed. <b>Phantom</b> — you re-run a query
          and new rows have appeared. Read Committed stops the first, Repeatable Read the second, Serializable all
          three.
        </>
      ),
    },
    {
      q: 'Clustered vs non-clustered index?',
      a: (
        <>
          A <b>clustered</b> index determines the physical order of the rows, so there can only be one per table
          and range scans are very fast. A <b>non-clustered</b> index is a separate structure holding key values
          and pointers — many per table, with an extra lookup to fetch the row.
        </>
      ),
    },
    {
      q: 'Why do databases use B+ trees rather than binary trees?',
      a: (
        <>
          Because the bottleneck is <b>disk I/O</b>. A B+ tree node fills a whole disk block, giving a fan-out in
          the hundreds and a tree only three or four levels deep for millions of rows. The linked leaf level also
          makes range queries a sequential read.
        </>
      ),
    },
    {
      q: 'What is two-phase locking and what does it guarantee?',
      a: (
        <>
          Every transaction acquires all its locks in a <b>growing</b> phase and releases them in a{' '}
          <b>shrinking</b> phase, never acquiring after the first release. This guarantees{' '}
          <b>conflict serializability</b> — but not freedom from deadlock. Strict 2PL additionally holds exclusive
          locks until commit, preventing cascading rollbacks.
        </>
      ),
    },
    {
      q: 'Explain the CAP theorem.',
      a: (
        <>
          Under a network <b>partition</b>, a distributed system must choose between <b>consistency</b> (every read
          sees the latest write) and <b>availability</b> (every request gets a response). Partitions are not
          optional, so the real choice is CP or AP.
        </>
      ),
    },
  ],
};

export default topic;
