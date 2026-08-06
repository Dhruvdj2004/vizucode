import { Arrow, Box, Cyl, Dg, Frame, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Hierarchical vs network vs relational, on the same data. */
function ModelsCompare() {
  return (
    <Dg w={620} h={252} cap="The same college data shaped as a tree, as a graph, and as tables">
      <Frame x={2} y={8} w={196} h={236} label="HIERARCHICAL" c="c" />
      <Box x={60} y={36} w={80} h={28} label="College" c="c" fs={11} r={5} />
      <Box x={16} y={96} w={76} h={28} label="Dept A" c="c" fs={11} r={5} />
      <Box x={108} y={96} w={76} h={28} label="Dept B" c="c" fs={11} r={5} />
      <Box x={12} y={156} w={52} h={26} label="S1" c="c" fs={11} r={5} />
      <Box x={68} y={156} w={52} h={26} label="S2" c="c" fs={11} r={5} />
      <Box x={124} y={156} w={52} h={26} label="S3" c="c" fs={11} r={5} />
      <Arrow x1={100} y1={64} x2={54} y2={94} c="c" />
      <Arrow x1={100} y1={64} x2={146} y2={94} c="c" />
      <Arrow x1={54} y1={124} x2={38} y2={154} c="c" />
      <Arrow x1={54} y1={124} x2={94} y2={154} c="c" />
      <Arrow x1={146} y1={124} x2={150} y2={154} c="c" />
      <Txt x={100} y={212} fs={10} soft>
        strictly one parent per child
      </Txt>

      <Frame x={212} y={8} w={196} h={236} label="NETWORK" c="a" />
      <Box x={270} y={36} w={80} h={28} label="College" c="a" fs={11} r={5} />
      <Box x={226} y={96} w={76} h={28} label="Dept A" c="a" fs={11} r={5} />
      <Box x={318} y={96} w={76} h={28} label="Dept B" c="a" fs={11} r={5} />
      <Box x={280} y={156} w={60} h={26} label="S1" c="a" fs={11} r={5} />
      <Arrow x1={310} y1={64} x2={264} y2={94} c="a" />
      <Arrow x1={310} y1={64} x2={356} y2={94} c="a" />
      <Arrow x1={264} y1={124} x2={300} y2={154} c="a" />
      <Arrow x1={356} y1={124} x2={320} y2={154} c="a" />
      <Txt x={310} y={212} fs={10} soft>
        a child may have many parents
      </Txt>

      <Frame x={422} y={8} w={196} h={236} label="RELATIONAL" c="b" />
      <Rel
        x={442}
        y={34}
        title="Dept"
        cols={['id', 'name']}
        rows={[
          ['D1', 'CSE'],
          ['D2', 'ECE'],
        ]}
        cw={76}
        c="b"
        pk={[0]}
      />
      <Rel
        x={442}
        y={144}
        title="Student"
        cols={['roll', 'dept']}
        rows={[
          ['101', 'D1'],
          ['102', 'D2'],
        ]}
        cw={76}
        c="b"
        pk={[0]}
        fk={[1]}
      />
    </Dg>
  );
}

/** Centralised vs distributed deployment. */
function CentralVsDistributed() {
  return (
    <Dg w={608} h={206} cap="One database on one site, versus data spread across cooperating sites">
      <Frame x={2} y={8} w={292} h={190} label="CENTRALISED" c="a" />
      {[46, 96, 146].map((y) => (
        <Box key={y} x={22} y={y} w={92} h={32} label="Client" c="a" fs={11} />
      ))}
      {[62, 112, 162].map((y) => (
        <Arrow key={y} x1={116} y1={y} x2={186} y2={112} c="n" />
      ))}
      <Cyl x={190} y={62} w={86} h={98} label="One DB" c="b" />

      <Frame x={310} y={8} w={296} h={190} label="DISTRIBUTED" c="b" />
      <Cyl x={334} y={46} w={80} h={72} label="Site 1" c="b" />
      <Cyl x={498} y={46} w={80} h={72} label="Site 2" c="b" />
      <Cyl x={416} y={124} w={80} h={66} label="Site 3" c="b" />
      <Arrow x1={416} y1={86} x2={496} y2={86} c="n" plain both dashed />
      <Arrow x1={382} y1={120} x2={442} y2={150} c="n" plain both dashed />
      <Arrow x1={540} y1={120} x2={478} y2={150} c="n" plain both dashed />
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'data-models',
  num: 3,
  unit: 'Foundations',
  title: 'Data Models & Types of DBMS',
  blurb:
    'Hierarchical, network, relational and object models — why relational won — plus centralised, distributed and cloud deployments.',
  minutes: 10,
  free: true,
  tags: ['Definition-heavy'],

  sections: [
    {
      id: 'what',
      heading: 'What a data model is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>data model</b> is the set of rules and notation you use to describe data: what the building blocks
              are, how they connect, and what constraints can be expressed. It is the vocabulary of your database
              design.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Every model answers three questions: <b>structure</b> (how is data organised?), <b>operations</b> (how
              do you retrieve and change it?), and <b>constraints</b> (what makes data valid?).
            </>
          ),
        },
      ],
    },

    {
      id: 'evolution',
      heading: 'How the models evolved',
      blocks: [
        { k: 'diagram', el: <ModelsCompare />, caption: 'One college, three models. Notice how the relational version needs no pointers at all.' },
        {
          k: 'steps',
          items: [
            {
              t: 'Hierarchical model (1960s, IBM IMS)',
              d: 'Data is a tree. Every record has exactly one parent. Fast to walk downwards, but a many-to-many relationship (a student in two clubs) is impossible without duplicating records, and adding a new query path means restructuring the tree.',
            },
            {
              t: 'Network model (CODASYL)',
              d: 'Data is a graph — a record may have several parents, so many-to-many finally works. The cost is complexity: the programmer navigates pointers by hand, so changing the structure breaks every program.',
            },
            {
              t: 'Relational model (1970, E. F. Codd)',
              d: 'Data is just tables of rows. Relationships are expressed by matching values (foreign keys), not pointers. You query declaratively, and the DBMS finds the path. This is why it won: simple to understand, backed by mathematics, and the physical layout is free to change.',
            },
            {
              t: 'Object-oriented & object-relational',
              d: 'Store objects with inheritance and methods, so complex types (images, geometry, JSON) stop being awkward. In practice, most systems became object-relational: a relational core plus rich types, like PostgreSQL.',
            },
            {
              t: 'Semi-structured / NoSQL',
              d: 'Documents, key-value pairs and graphs — schema-flexible models built for horizontal scale rather than for joins and strict consistency.',
            },
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why did the relational model replace hierarchical and network?',
          text: (
            <>
              Three reasons, in this order: <b>data independence</b> (no pointer chasing, so storage can change
              freely), <b>declarative querying</b> (say what, not how), and a <b>formal mathematical foundation</b>{' '}
              (set theory and relational algebra) that made correctness and optimization provable.
            </>
          ),
        },
      ],
    },

    {
      id: 'model-table',
      heading: 'Side-by-side comparison',
      blocks: [
        {
          k: 'table',
          head: ['Model', 'Structure', 'Many-to-many?', 'Main weakness'],
          rows: [
            ['Hierarchical', 'Tree, one parent per child', 'No — needs duplication', 'Rigid; new access paths mean redesign'],
            ['Network', 'Graph with pointer sets', 'Yes', 'Programmer navigates manually; very complex'],
            ['Relational', 'Tables joined by matching values', 'Yes — via a junction table', 'Joins can get expensive at very large scale'],
            ['Object-oriented', 'Objects with inheritance and methods', 'Yes', 'No universal query standard; niche adoption'],
            ['Document (NoSQL)', 'Self-contained JSON-like documents', 'Yes — by embedding or referencing', 'Weak joins; duplication is the norm'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The <b>ER model</b> is not in this table on purpose. ER is a <b>conceptual design</b> model — you draw
              it on a whiteboard to plan, then convert it into relational tables. It is not something a DBMS
              implements. That distinction is worth a mark.
            </>
          ),
        },
      ],
    },

    {
      id: 'types',
      heading: 'Types of DBMS by deployment',
      blocks: [
        { k: 'diagram', el: <CentralVsDistributed />, caption: 'Where the data physically lives changes almost every trade-off.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Centralised</b> — the entire database lives on one machine. Simple, consistent, easy to secure and
              back up; but it is a single point of failure and its capacity is capped by that one machine.
            </>,
            <>
              <b>Distributed</b> — data is split (or copied) across several sites that cooperate. Better
              availability and locality, and it scales horizontally; the price is network latency, hard
              distributed transactions, and much harder consistency.
            </>,
            <>
              <b>Client-server</b> — a server owns the data, clients send requests. The everyday shape of MySQL and
              PostgreSQL.
            </>,
            <>
              <b>Cloud / managed</b> — the DBMS runs as a service (RDS, Cloud SQL, Atlas). You get elasticity,
              automated backups and failover; you give up low-level control.
            </>,
            <>
              <b>Personal / embedded</b> — a single-user database inside the application itself, like SQLite in a
              mobile app.
            </>,
          ],
        },
      ],
    },

    {
      id: 'languages',
      heading: 'The four families of database commands',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Independently of any particular syntax, database commands fall into four families. Interviewers ask you
              to classify a command far more often than to write one.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Family', 'Full name', 'Purpose', 'Typical commands'],
          rows: [
            ['DDL', 'Data Definition Language', 'Define and change the structure — the schema itself', 'CREATE, ALTER, DROP, TRUNCATE, RENAME'],
            ['DML', 'Data Manipulation Language', 'Work with the rows inside that structure', 'INSERT, UPDATE, DELETE, SELECT'],
            ['DCL', 'Data Control Language', 'Control who is allowed to do what', 'GRANT, REVOKE'],
            ['TCL', 'Transaction Control Language', 'Mark the boundaries of a transaction', 'COMMIT, ROLLBACK, SAVEPOINT'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'DELETE vs TRUNCATE vs DROP',
          text: (
            <>
              <b>DELETE</b> is DML — it removes rows one at a time, can be filtered, fires triggers, is logged per
              row, and can be rolled back. <b>TRUNCATE</b> is DDL — it deallocates the whole table's pages at once,
              cannot be filtered, is far faster, and auto-commits in most systems. <b>DROP</b> is DDL and removes the
              table's <i>definition</i> as well as its data.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a data model?',
      a: (
        <>
          The notation and rules used to describe a database — its structure, the operations allowed on it, and the
          constraints that define valid data. Examples: the relational model, the ER model, the document model.
        </>
      ),
    },
    {
      q: 'Why did the relational model replace hierarchical and network models?',
      a: (
        <>
          It removed pointer navigation, which gave real <b>data independence</b>; it allowed <b>declarative</b>{' '}
          queries so the optimizer chooses the access path; and it had a <b>formal mathematical basis</b> that made
          query rewriting and correctness provable. The earlier models forced programmers to hard-code the traversal
          path, so any structural change broke every program.
        </>
      ),
    },
    {
      q: 'Can a hierarchical model represent a many-to-many relationship?',
      a: (
        <>
          Not directly. Each child may have only one parent, so you must duplicate records under each parent — which
          reintroduces exactly the redundancy and inconsistency a database is supposed to prevent. The network model
          was invented largely to fix this.
        </>
      ),
    },
    {
      q: 'Is the ER model a data model implemented by a DBMS?',
      a: (
        <>
          No. ER is a <b>conceptual design</b> notation used before implementation. You draw the ER diagram, then
          convert it to relational tables, and the DBMS implements the <b>relational</b> model.
        </>
      ),
    },
    {
      q: 'Centralised vs distributed DBMS — key trade-off?',
      a: (
        <>
          Centralised is simple and strongly consistent but has a hard capacity ceiling and a single point of
          failure. Distributed gives availability, locality and horizontal scale, but adds network latency,
          complicated distributed commit, and consistency compromises (see the CAP theorem topic).
        </>
      ),
    },
    {
      q: 'Classify: CREATE, INSERT, GRANT, ROLLBACK.',
      a: (
        <>
          <b>CREATE</b> is DDL, <b>INSERT</b> is DML, <b>GRANT</b> is DCL, <b>ROLLBACK</b> is TCL.
        </>
      ),
    },
    {
      q: 'Difference between DELETE and TRUNCATE?',
      a: (
        <>
          DELETE is DML: row-by-row, supports a filter, fires triggers, fully logged, rollback-able. TRUNCATE is DDL:
          deallocates all pages at once, no filter, no row triggers, minimal logging, much faster, and generally
          auto-commits. DELETE also keeps the identity/auto-increment counter; TRUNCATE usually resets it.
        </>
      ),
    },
    {
      q: 'What is an object-relational database?',
      a: (
        <>
          A relational database extended with object features — user-defined types, inheritance, arrays and complex
          types like JSON or geometry — while keeping tables, SQL and ACID. PostgreSQL is the standard example.
        </>
      ),
    },
  ],
};

export default topic;
