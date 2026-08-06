import { Arrow, Box, Cyl, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** File-per-application chaos vs one shared database. */
function FileVsDbms() {
  const apps = ['Payroll app', 'HR app', 'Sales app'];
  return (
    <Dg w={600} h={440} cap="File-based systems duplicate data; a DBMS stores it once and shares it">
      <Frame x={2} y={10} w={596} h={196} label="FILE-BASED APPROACH" c="n" />
      {apps.map((a, i) => (
        <Box key={a} x={22} y={48 + i * 52} w={112} h={36} label={a} c="a" fs={11.5} />
      ))}
      {['payroll.dat', 'employee.dat', 'sales.dat'].map((f, i) => (
        <Box key={f} x={196} y={48 + i * 52} w={118} h={36} label={f} c="n" fs={11} r={3} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x1={136} y1={66 + i * 52} x2={194} y2={66 + i * 52} c="n" />
      ))}
      <Txt x={340} y={64} anchor="start" fs={11.5} soft>
        ✗ The same employee is stored 3 times
      </Txt>
      <Txt x={340} y={90} anchor="start" fs={11.5} soft>
        ✗ One address change → 3 edits, or bad data
      </Txt>
      <Txt x={340} y={116} anchor="start" fs={11.5} soft>
        ✗ Every app rewrites its own search code
      </Txt>
      <Txt x={340} y={142} anchor="start" fs={11.5} soft>
        ✗ No shared security, no crash safety
      </Txt>
      <Txt x={340} y={168} anchor="start" fs={11.5} soft>
        ✗ Two users writing at once = corruption
      </Txt>

      <Frame x={2} y={232} w={596} h={200} label="DATABASE APPROACH" c="b" />
      {apps.map((a, i) => (
        <Box key={a} x={22} y={268 + i * 52} w={112} h={36} label={a} c="a" fs={11.5} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x1={136} y1={286 + i * 52} x2={186} y2={338} c="n" />
      ))}
      <Box x={188} y={296} w={106} h={84} label="DBMS" sub="one gatekeeper" c="a" />
      <Arrow x1={296} y1={338} x2={334} y2={338} c="b" />
      <Cyl x={338} y={294} w={92} h={92} label="Database" c="b" />
      <Txt x={452} y={306} anchor="start" fs={11.5} soft>
        ✓ Stored once, no duplicates
      </Txt>
      <Txt x={452} y={332} anchor="start" fs={11.5} soft>
        ✓ Rules live in one place
      </Txt>
      <Txt x={452} y={358} anchor="start" fs={11.5} soft>
        ✓ Many users, safely
      </Txt>
      <Txt x={452} y={384} anchor="start" fs={11.5} soft>
        ✓ Survives a crash
      </Txt>
    </Dg>
  );
}

/** What sits inside the DBMS box. */
function DbmsComponents() {
  return (
    <Dg w={600} h={400} cap="Users go through the query processor, which goes through the storage manager, which touches disk">
      {[
        { x: 15, label: 'End users', sub: 'forms, apps' },
        { x: 225, label: 'App programmers', sub: 'write queries' },
        { x: 435, label: 'DBA', sub: 'tunes, secures' },
      ].map((u) => (
        <Box key={u.label} x={u.x} y={8} w={150} h={44} label={u.label} sub={u.sub} c="c" fs={12} />
      ))}
      {[90, 300, 510].map((x) => (
        <Arrow key={x} x1={x} y1={54} x2={x} y2={88} c="n" />
      ))}

      <Frame x={12} y={92} w={576} h={84} label="QUERY PROCESSOR" c="a" />
      <Box x={32} y={118} w={150} h={42} label="Parser" sub="is it valid?" c="a" fs={12} />
      <Box x={212} y={118} w={150} h={42} label="Optimizer" sub="cheapest plan?" c="a" fs={12} />
      <Box x={392} y={118} w={176} h={42} label="Execution engine" sub="run the plan" c="a" fs={12} />
      <Arrow x1={300} y1={178} x2={300} y2={200} c="n" />

      <Frame x={12} y={204} w={576} h={84} label="STORAGE MANAGER" c="b" />
      <Box x={32} y={230} w={150} h={42} label="Buffer manager" sub="RAM ↔ disk" c="b" fs={12} />
      <Box x={212} y={230} w={150} h={42} label="Transaction mgr" sub="ACID, locks" c="b" fs={12} />
      <Box x={392} y={230} w={176} h={42} label="File & index mgr" sub="where is the row?" c="b" fs={12} />
      <Arrow x1={300} y1={290} x2={300} y2={312} c="n" />

      <Cyl x={190} y={314} w={220} h={80} label="Disk" c="n" />
      <Txt x={300} y={386} fs={10.5} soft>
        data files · indexes · log · data dictionary
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'dbms-basics',
  num: 1,
  unit: 'Foundations',
  title: 'What a DBMS Is (and Why Files Failed)',
  blurb:
    'Data vs information vs database, what the DBMS software actually does, and the file-system problems it was invented to fix.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Warm-up question'],

  sections: [
    {
      id: 'definitions',
      heading: 'The four words interviewers mix up',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Almost every DBMS interview opens here, and most people fumble it because the words sound
              interchangeable. They are not.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Term', 'Meaning', 'Example'],
          rows: [
            ['Data', 'Raw facts. On their own they mean nothing.', <code>1996, "Riya", 87</code>],
            [
              'Information',
              'Data placed in context so it answers a question.',
              'Riya, born 1996, scored 87 in DBMS.',
            ],
            [
              'Database',
              'An organised collection of related data, stored so it can be searched and updated.',
              'The college student database.',
            ],
            [
              'DBMS',
              'The software layer that stores, retrieves and protects that data.',
              'MySQL, PostgreSQL, Oracle, MongoDB.',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              <b>"Is MySQL a database?"</b> No. MySQL is a <b>DBMS</b>. The database is the actual collection of
              data MySQL manages. Saying this correctly signals you understand the layer boundary.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>DBMS</b> therefore sits between the people (or applications) that want data and the disk where
              the data physically lives. Nobody touches the file directly — everything goes through the DBMS, and
              that single rule is where all of its power comes from.
            </>
          ),
        },
      ],
    },

    {
      id: 'why-not-files',
      heading: 'Why plain files were not enough',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Before databases, each application kept its own files. It works for one small program and falls apart
              the moment a second program needs the same data.
            </>
          ),
        },
        { k: 'diagram', el: <FileVsDbms />, caption: 'The same organisation, stored two ways.' },
        { k: 'h', text: 'The six classic file-system problems' },
        {
          k: 'ul',
          items: [
            <>
              <b>Data redundancy</b> — the same employee record is copied into payroll, HR and sales files.
            </>,
            <>
              <b>Data inconsistency</b> — you update the address in one copy and forget the others, so now the
              organisation has two "truths".
            </>,
            <>
              <b>Difficulty accessing data</b> — every new question ("list employees in Pune earning &gt; 50k")
              needs a brand-new program written by hand.
            </>,
            <>
              <b>Data isolation</b> — data is scattered across files in different formats, so combining it is
              painful.
            </>,
            <>
              <b>Integrity problems</b> — a rule like "salary must be positive" lives buried inside application
              code, and the next application forgets it.
            </>,
            <>
              <b>Atomicity &amp; concurrency failures</b> — if the machine crashes halfway through a transfer,
              money vanishes; if two clerks write at once, one update is silently lost.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Memorise them as a story, not a list: <b>copies → contradictions → hand-written code → scattered
              formats → broken rules → crashes</b>. Each one is exactly the problem the next DBMS feature solves.
            </>
          ),
        },
      ],
    },

    {
      id: 'advantages',
      heading: 'What a DBMS gives you in return',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Controlled redundancy</b> — data is stored once; where copies exist, the DBMS keeps them in sync.
            </>,
            <>
              <b>Data sharing</b> — many users and applications read the same live data at the same time.
            </>,
            <>
              <b>Integrity enforcement</b> — rules (constraints) are declared once, in the database, and cannot be
              bypassed by a careless app.
            </>,
            <>
              <b>Security</b> — permissions per user, per table, even per column.
            </>,
            <>
              <b>Backup &amp; recovery</b> — after a crash the DBMS restores the database to a consistent state on
              its own.
            </>,
            <>
              <b>Concurrency control</b> — thousands of simultaneous transactions behave as if they ran one at a
              time.
            </>,
            <>
              <b>Data independence</b> — you can reorganise the storage without rewriting applications.
            </>,
            <>
              <b>Declarative querying</b> — you say <i>what</i> you want, not <i>how</i> to fetch it; the optimizer
              works out the how.
            </>,
          ],
        },
        { k: 'h', text: 'And the honest disadvantages' },
        {
          k: 'ul',
          items: [
            'Cost — licences, hardware, and a DBA to run it.',
            'Complexity — a real learning curve, and a badly tuned DBMS is slower than a flat file.',
            'Overhead — all that safety machinery costs CPU and memory.',
            'Single point of failure — if the database is down, every application is down.',
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'When would you NOT use a DBMS?',
          text: (
            <>
              A great follow-up to be ready for. Answer: single-user apps with tiny, simple data (a config file); data
              that is written once and never queried (raw logs, archives); or hard real-time systems where the DBMS
              overhead breaks the timing budget.
            </>
          ),
        },
      ],
    },

    {
      id: 'components',
      heading: 'Inside the DBMS box',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              When you fire a query, it does not go straight to disk. It falls through two layers, and knowing their
              names lets you answer half the "how does a query run" questions.
            </>
          ),
        },
        { k: 'diagram', el: <DbmsComponents />, caption: 'The path of a query, from a user down to the disk.' },
        {
          k: 'steps',
          items: [
            {
              t: 'Parser',
              d: 'Checks the syntax and that the tables and columns you named actually exist. Produces a parse tree.',
            },
            {
              t: 'Optimizer',
              d: 'Generates several possible execution plans, estimates the cost of each using statistics, and picks the cheapest one.',
            },
            {
              t: 'Execution engine',
              d: 'Runs the chosen plan, asking the storage manager for the pages it needs.',
            },
            {
              t: 'Buffer manager',
              d: 'Keeps hot pages in RAM. A disk read is roughly a hundred thousand times slower than RAM, so this is where performance is won or lost.',
            },
            {
              t: 'Transaction manager',
              d: 'Hands out locks and writes the log so that ACID holds even if the power fails mid-write.',
            },
            {
              t: 'File & index manager',
              d: 'Knows which disk block a row lives in, and maintains the indexes that avoid scanning everything.',
            },
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Data dictionary',
          text: (
            <>
              The DBMS also stores <b>metadata</b> — the list of tables, columns, types, constraints and indexes — in
              a <b>data dictionary</b> (also called the system catalog). It is a database describing the database, and
              the optimizer reads it constantly.
            </>
          ),
        },
      ],
    },

    {
      id: 'people',
      heading: 'Who uses a database',
      blocks: [
        {
          k: 'table',
          head: ['Role', 'What they do'],
          rows: [
            [
              'Naive / end users',
              'Never see the database. They click buttons in an app — an ATM screen, a booking site — that fires queries for them.',
            ],
            [
              'Application programmers',
              'Write the code that embeds queries and turns results into screens.',
            ],
            [
              'Sophisticated users',
              'Analysts who write their own ad-hoc queries directly against the database.',
            ],
            [
              'DBA (Database Administrator)',
              'Owns the schema, grants permissions, tunes performance, plans backups, and handles recovery. The single most important human in this list.',
            ],
            [
              'Database designers',
              'Decide what tables exist and how they relate — the ER and normalization work covered later in this module.',
            ],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a DBMS, in one sentence?',
      a: (
        <>
          Software that lets you <b>define, store, retrieve, update and protect</b> a collection of related data,
          while guaranteeing consistency and controlled access for many users at once.
        </>
      ),
    },
    {
      q: 'Difference between a database and a DBMS?',
      a: (
        <>
          The <b>database</b> is the data itself — the organised collection stored on disk. The <b>DBMS</b> is the
          software that manages that collection. MySQL is a DBMS; the <code>college</code> schema inside it is a
          database.
        </>
      ),
    },
    {
      q: 'What problems of the file system does a DBMS solve?',
      a: (
        <>
          Redundancy, inconsistency, difficulty of access, data isolation, integrity violations, and the lack of
          atomicity, concurrency control and recovery. Each DBMS feature maps to exactly one of these.
        </>
      ),
    },
    {
      q: 'What is data redundancy and why is it dangerous?',
      a: (
        <>
          Storing the same fact in more than one place. It wastes space, but the real danger is <b>inconsistency</b>:
          update one copy and miss another, and the database now holds two contradictory answers with no way to tell
          which is right.
        </>
      ),
    },
    {
      q: 'What is metadata? Where does the DBMS keep it?',
      a: (
        <>
          Data about the data — table names, column names and types, constraints, indexes, user permissions. It lives
          in the <b>data dictionary</b> / system catalog, and the query optimizer reads it on every query.
        </>
      ),
    },
    {
      q: 'What does a DBA actually do?',
      a: (
        <>
          Defines and evolves the schema, grants and revokes access, monitors and tunes performance (indexes, query
          plans, buffer sizes), schedules backups, and performs recovery after a failure.
        </>
      ),
    },
    {
      q: 'Name a situation where a plain file beats a database.',
      a: (
        <>
          Small single-user configuration data, write-once archival logs, or hard real-time systems where the DBMS
          layer's latency is unacceptable. If you never need concurrent access, querying, or crash consistency, the
          DBMS is pure overhead.
        </>
      ),
    },
    {
      q: 'Why is a DBMS said to support "declarative" access?',
      a: (
        <>
          You state <i>what</i> data you want, not the procedure to get it. The optimizer chooses the access path —
          index vs full scan, join order, join algorithm — so the same query keeps working (and can get faster) as
          the data and indexes change underneath it.
        </>
      ),
    },
  ],
};

export default topic;
