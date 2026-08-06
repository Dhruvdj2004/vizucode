import { Arrow, Box, Cyl, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** ANSI/SPARC three-level architecture. */
function ThreeSchema() {
  return (
    <Dg w={620} h={400} cap="Three-level architecture: external views, one conceptual schema, one internal schema">
      <Txt x={6} y={40} anchor="start" fs={11} bold c="c">
        EXTERNAL
      </Txt>
      <Txt x={6} y={55} anchor="start" fs={11} bold c="c">
        LEVEL
      </Txt>
      <Box x={150} y={20} w={148} h={52} label="Student view" sub="marks, fees" c="c" fs={12} />
      <Box x={308} y={20} w={148} h={52} label="Accounts view" sub="fees only" c="c" fs={12} />
      <Box x={466} y={20} w={148} h={52} label="Faculty view" sub="marks only" c="c" fs={12} />

      <Txt x={6} y={100} anchor="start" fs={10} soft>
        view mapping
      </Txt>
      {[224, 382, 540].map((x) => (
        <Arrow key={x} x1={x} y1={72} x2={x} y2={118} c="n" both />
      ))}

      <Txt x={6} y={148} anchor="start" fs={11} bold c="a">
        CONCEPTUAL
      </Txt>
      <Txt x={6} y={163} anchor="start" fs={11} bold c="a">
        LEVEL
      </Txt>
      <Box
        x={150}
        y={120}
        w={464}
        h={64}
        label="CONCEPTUAL SCHEMA"
        sub="every table, column, relationship and constraint — once"
        c="a"
      />

      <Txt x={6} y={212} anchor="start" fs={10} soft>
        storage mapping
      </Txt>
      <Arrow x1={382} y1={184} x2={382} y2={230} c="n" both />

      <Txt x={6} y={260} anchor="start" fs={11} bold c="b">
        INTERNAL
      </Txt>
      <Txt x={6} y={275} anchor="start" fs={11} bold c="b">
        LEVEL
      </Txt>
      <Box
        x={150}
        y={232}
        w={464}
        h={64}
        label="INTERNAL SCHEMA"
        sub="record layout, blocks, indexes, compression, placement"
        c="b"
      />

      <Arrow x1={382} y1={296} x2={382} y2={324} c="n" />
      <Cyl x={302} y={326} w={160} h={68} label="Physical disk" c="n" />
    </Dg>
  );
}

/** The two data independences, side by side. */
function DataIndependence() {
  return (
    <Dg w={608} h={244} cap="Logical independence absorbs conceptual changes; physical independence absorbs storage changes">
      <Frame x={2} y={8} w={294} h={228} label="LOGICAL DATA INDEPENDENCE" c="c" />
      <Box x={20} y={46} w={258} h={44} label="External schema" sub="apps unchanged ✓" c="n" fs={12} />
      <Arrow x1={149} y1={90} x2={149} y2={118} c="c" plain dashed />
      <Box x={20} y={120} w={258} h={46} label="Conceptual schema" sub="◆ split a table, add a column" c="c" fs={12} />
      <Box x={20} y={178} w={258} h={40} label="Internal schema" sub="untouched" c="n" fs={12} ghost />

      <Frame x={312} y={8} w={294} h={228} label="PHYSICAL DATA INDEPENDENCE" c="b" />
      <Box x={330} y={46} w={258} h={44} label="External schema" sub="apps unchanged ✓" c="n" fs={12} ghost />
      <Box x={330} y={102} w={258} h={44} label="Conceptual schema" sub="unchanged ✓" c="n" fs={12} />
      <Arrow x1={459} y1={146} x2={459} y2={174} c="b" plain dashed />
      <Box x={330} y={176} w={258} h={46} label="Internal schema" sub="◆ add an index, repack files" c="b" fs={12} />
    </Dg>
  );
}

/** 1-tier / 2-tier / 3-tier deployment shapes. */
function Tiers() {
  return (
    <Dg w={610} h={224} cap="How the same DBMS is deployed in one, two or three tiers">
      <Txt x={6} y={38} anchor="start" fs={11} bold c="n">
        1-TIER
      </Txt>
      <Box x={90} y={10} w={220} h={46} label="User + App + DBMS" sub="one machine — SQLite, MS Access" c="n" fs={12} />

      <Txt x={6} y={112} anchor="start" fs={11} bold c="n">
        2-TIER
      </Txt>
      <Box x={90} y={84} w={150} h={46} label="Client app" sub="UI + logic" c="a" fs={12} />
      <Arrow x1={242} y1={107} x2={298} y2={107} c="n" label="ODBC / JDBC" dy={-10} />
      <Box x={302} y={84} w={160} h={46} label="DBMS server" sub="data" c="b" fs={12} />

      <Txt x={6} y={186} anchor="start" fs={11} bold c="n">
        3-TIER
      </Txt>
      <Box x={90} y={158} w={130} h={46} label="Browser" sub="UI only" c="c" fs={12} />
      <Arrow x1={222} y1={181} x2={256} y2={181} c="n" />
      <Box x={258} y={158} w={150} h={46} label="App server" sub="business logic" c="a" fs={12} />
      <Arrow x1={410} y1={181} x2={446} y2={181} c="n" />
      <Box x={448} y={158} w={156} h={46} label="DB server" sub="data only" c="b" fs={12} />
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'dbms-architecture',
  num: 2,
  unit: 'Foundations',
  title: 'Three-Schema Architecture & Data Independence',
  blurb:
    'The three levels every database is described at, the two mappings between them, and why they let you change storage without touching a single application.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Definition-heavy'],

  sections: [
    {
      id: 'three-levels',
      heading: 'The three levels',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The ANSI/SPARC architecture says a database should be described at <b>three separate levels</b>. The
              whole point is <b>abstraction</b>: each level hides detail from the one above it, so a change at the
              bottom does not ripple to the top.
            </>
          ),
        },
        { k: 'diagram', el: <ThreeSchema />, caption: 'One database, described three times, at three levels of detail.' },
        {
          k: 'table',
          head: ['Level', 'Also called', 'Describes', 'How many?'],
          rows: [
            [
              'External',
              'View level',
              'What one particular user or application is allowed to see. Hides everything irrelevant or confidential.',
              'Many — one per user group',
            ],
            [
              'Conceptual',
              'Logical level',
              'The complete logical design: all tables, columns, data types, relationships and constraints. No storage detail.',
              'Exactly one',
            ],
            [
              'Internal',
              'Physical level',
              'How the data is actually stored: file organisation, record layout, blocks, indexes, compression.',
              'Exactly one',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Anchor it with one example. In a college database the <b>conceptual</b> level says "there is a Student
              table with roll number, name, marks and fees". The <b>accounts clerk's external view</b> shows only
              roll number and fees. The <b>internal</b> level says "Student rows are stored in a heap file with a
              B+ tree index on roll number". Same data, three descriptions.
            </>
          ),
        },
      ],
    },

    {
      id: 'mappings',
      heading: 'The two mappings',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The levels are joined by <b>mappings</b>, and this is the part candidates usually forget — but it is
              exactly what makes independence possible.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>External / conceptual mapping</b> — translates each user's view back to the real tables in the
              conceptual schema.
            </>,
            <>
              <b>Conceptual / internal mapping</b> — translates the logical tables into the physical files, records
              and indexes on disk.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              When something changes at a lower level, the DBMS only rewrites the <b>mapping</b>. Everything above it
              keeps working untouched. That rewrite-the-mapping trick <i>is</i> data independence.
            </>
          ),
        },
      ],
    },

    {
      id: 'independence',
      heading: 'Physical vs logical data independence',
      blocks: [
        { k: 'diagram', el: <DataIndependence />, caption: '◆ marks the level that changed. Everything above it is unaffected.' },
        {
          k: 'table',
          head: ['', 'Physical data independence', 'Logical data independence'],
          rows: [
            ['What changes', 'The internal (storage) schema', 'The conceptual (logical) schema'],
            [
              'Examples of the change',
              'Add or drop an index, switch file organisation, move to a new disk, change compression',
              'Add or drop a column, split one table into two, rename a table, change a relationship',
            ],
            ['Which mapping is rewritten', 'Conceptual / internal', 'External / conceptual'],
            ['Who must not notice', 'The conceptual schema and every application', 'Every application'],
            ['How hard to achieve', 'Easy — every real DBMS gives you this', 'Hard — the harder of the two'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why is logical data independence harder?',
          text: (
            <>
              This is the classic follow-up. Applications are written against the <b>logical</b> structure — they
              name tables and columns directly. If you split <code>Employee</code> into two tables, no mapping can
              always hide that from an app that asked for a column which no longer exists in that shape. Physical
              changes, by contrast, never alter what the data <i>means</i>, so they can always be hidden.
            </>
          ),
        },
      ],
    },

    {
      id: 'instance-schema',
      heading: 'Schema vs instance',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A one-line distinction that appears in almost every viva.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Schema</b> — the <i>design</i> of the database: the tables, their columns and types, the
              constraints. It changes rarely. Think of it as the class definition.
            </>,
            <>
              <b>Instance</b> — the <i>data</i> actually sitting in the database at one moment in time. It changes on
              every insert. Think of it as an object of that class.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'Schema vs instance',
          code: `SCHEMA   Student( roll : int,  name : varchar(40),  cgpa : decimal )
           ↑ the structure — one design, changes rarely

INSTANCE  (101, "Riya",  9.1)
          (102, "Arjun", 8.4)
          (103, "Meera", 8.9)
           ↑ the current contents — changes every second`,
        },
      ],
    },

    {
      id: 'tiers',
      heading: 'One-, two- and three-tier architecture',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A different axis: not levels of description, but how the system is <b>deployed across machines</b>.
              Interviewers sometimes deliberately blur this with the three-schema architecture — do not fall for it.
            </>
          ),
        },
        { k: 'diagram', el: <Tiers />, caption: 'Deployment tiers. More tiers = more separation, more scale, more moving parts.' },
        {
          k: 'ul',
          items: [
            <>
              <b>1-tier</b> — user, application and DBMS on one machine. Only for local tools and learning.
            </>,
            <>
              <b>2-tier</b> — a client application talks to the DBMS server directly over ODBC/JDBC. Simple and fast,
              but the database is exposed to every client and it does not scale past a few hundred connections.
            </>,
            <>
              <b>3-tier</b> — the client talks to an application server, which alone talks to the database. This is
              what real web applications use: better security (the DB is never public), central business logic, and
              connection pooling so thousands of users share a few database connections.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Explain the three-schema architecture.',
      a: (
        <>
          A database is described at three levels: the <b>external</b> level (many user-specific views), the{' '}
          <b>conceptual</b> level (one complete logical design — all tables, relationships, constraints), and the{' '}
          <b>internal</b> level (one physical storage design — files, records, indexes). Two mappings join them, and
          those mappings are what make data independence possible.
        </>
      ),
    },
    {
      q: 'What is data independence?',
      a: (
        <>
          The ability to change the schema at one level without having to change the level above it. It comes in two
          flavours: <b>physical</b> (change storage without touching the logical design) and <b>logical</b> (change
          the logical design without touching applications).
        </>
      ),
    },
    {
      q: 'Give a concrete example of physical data independence.',
      a: (
        <>
          You create a B+ tree index on <code>Student.roll</code>, or move the table to a faster disk. Queries return
          identical results and no application code changes — only the plans get faster. Only the
          conceptual/internal mapping was rewritten.
        </>
      ),
    },
    {
      q: 'Why is logical data independence harder to achieve than physical?',
      a: (
        <>
          Because applications are written directly against the logical structure. Hiding a storage change is always
          possible since the meaning of the data does not change; hiding a structural change (a dropped column, a
          split table) is often impossible without also rewriting the app.
        </>
      ),
    },
    {
      q: 'Difference between schema and instance?',
      a: (
        <>
          Schema is the <b>design</b> — the tables, columns, types and constraints; it is fairly static. Instance is
          the <b>data at a point in time</b>; it changes with every insert, update and delete. Schema is the class,
          instance is the object.
        </>
      ),
    },
    {
      q: 'What is a view, in terms of this architecture?',
      a: (
        <>
          A view is a concrete implementation of an <b>external schema</b>. It is a named query that presents a
          subset or reshaping of the conceptual schema, and it gives you both security (hide salary columns) and
          logical independence (the view definition absorbs a table change).
        </>
      ),
    },
    {
      q: 'Difference between 2-tier and 3-tier architecture?',
      a: (
        <>
          In 2-tier the client connects to the database directly, so credentials and the database itself are exposed
          to every client and each user consumes a connection. In 3-tier an application server sits in between — it
          holds the business logic, pools connections, and is the only thing allowed to reach the database. 3-tier
          scales and secures far better; 2-tier is simpler and has one less network hop.
        </>
      ),
    },
    {
      q: 'How many external, conceptual and internal schemas can a database have?',
      a: (
        <>
          Many external schemas (one per user group), but exactly <b>one</b> conceptual schema and exactly{' '}
          <b>one</b> internal schema.
        </>
      ),
    },
  ],
};

export default topic;
