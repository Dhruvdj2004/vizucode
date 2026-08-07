import { Arrow, Dg, Rel, Stage, Txt } from '../dgm';
import type { SqlTopic } from '../types';

/** Written order vs the order the engine actually evaluates clauses. */
function ExecutionOrder() {
  return (
    <Dg w={620} h={250} cap="You write SELECT first, but the engine runs it fifth">
      <Txt x={310} y={22} fs={11} bold c="c">
        THE ORDER YOU WRITE IT
      </Txt>
      {['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'].map((s, i) => (
        <Stage key={s} x={12 + i * 100} y={36} w={92} h={34} label={s} c="n" dim />
      ))}

      <Arrow x1={310} y1={82} x2={310} y2={106} c="c" />

      <Txt x={310} y={128} fs={11} bold c="a">
        THE ORDER IT RUNS
      </Txt>
      {[
        ['FROM', 'get rows'],
        ['WHERE', 'filter rows'],
        ['GROUP BY', 'make buckets'],
        ['HAVING', 'filter buckets'],
        ['SELECT', 'pick columns'],
        ['ORDER BY', 'sort'],
      ].map(([s, sub], i) => (
        <Stage key={s} x={12 + i * 100} y={142} w={92} h={44} label={s} sub={sub} c="a" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Arrow key={i} x1={104 + i * 100} y1={164} x2={112 + i * 100} y2={164} c="a" />
      ))}

      <Txt x={310} y={218} fs={10.5} soft>
        this is why WHERE cannot use an aggregate, and why a SELECT alias cannot be used in WHERE
      </Txt>
      <Txt x={310} y={240} fs={10.5} soft>
        — both run before the clause that would have created what they need
      </Txt>
    </Dg>
  );
}

/** A tiny employees table used across the whole module. */
function EmployeesTable() {
  return (
    <Dg w={520} h={190} cap="The example table used throughout this module">
      <Rel
        x={60}
        y={20}
        title="employees"
        cols={['id', 'name', 'dept', 'salary']}
        rows={[
          ['1', 'Asha', 'Eng', '90000'],
          ['2', 'Ravi', 'Eng', '85000'],
          ['3', 'Neha', 'Sales', '62500'],
          ['4', 'Imran', 'Sales', '55000'],
          ['5', 'Kiran', 'HR', '50000'],
        ]}
        cw={[44, 76, 76, 84]}
        c="a"
        pk={[0]}
      />
    </Dg>
  );
}

const topic: SqlTopic = {
  slug: 'sql-basics',
  num: 1,
  unit: 'Foundations',
  title: 'Command Families, SELECT & Constraints',
  blurb:
    'The four kinds of SQL statement, the read pipeline and the clause execution order that explains half of all SQL errors, plus the constraints that keep bad data out.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'families',
      heading: 'The four command families',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Every SQL statement falls into one of four buckets, split by what it actually changes — the schema,
              the data, permissions, or the transaction itself. Interviewers ask you to <b>classify</b> a command
              far more often than to write one.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Family', 'Changes', 'Commands'],
          rows: [
            ['DDL — Data Definition Language', 'The table structure', 'CREATE, ALTER, DROP, TRUNCATE'],
            ['DML — Data Manipulation Language', 'The data itself', 'SELECT, INSERT, UPDATE, DELETE'],
            ['DCL — Data Control Language', 'Permissions', 'GRANT, REVOKE'],
            ['TCL — Transaction Control Language', 'Transaction state', 'COMMIT, ROLLBACK, SAVEPOINT'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'DELETE vs TRUNCATE vs DROP',
          text: (
            <>
              <b>DELETE</b> is DML — removes rows one at a time, can be filtered with WHERE, fires triggers, is
              logged per row, and can be rolled back. <b>TRUNCATE</b> is DDL — deallocates all pages at once, no
              WHERE, far faster, and auto-commits in most systems. <b>DROP</b> is DDL and removes the table's{' '}
              <i>definition</i> as well as its data.
            </>
          ),
        },
      ],
    },

    {
      id: 'select',
      heading: 'SELECT, WHERE and ORDER BY',
      blocks: [
        { k: 'diagram', el: <EmployeesTable />, caption: 'Five employees across three departments.' },
        {
          k: 'p',
          text: (
            <>
              The read pipeline is simple: filter rows with <code>WHERE</code>, then sort what is left with{' '}
              <code>ORDER BY</code>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Engineering staff, highest paid first',
          code: `SELECT name, salary
FROM employees
WHERE dept = 'Eng'
ORDER BY salary DESC;

  name   | salary
  -------+-------
  Asha   | 90000
  Ravi   | 85000`,
        },
      ],
    },

    {
      id: 'execution-order',
      heading: 'The clause execution order',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              SQL is not executed in the order you write it. Knowing the real order explains a whole family of
              errors that otherwise look arbitrary.
            </>
          ),
        },
        { k: 'diagram', el: <ExecutionOrder />, caption: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.' },
        {
          k: 'ul',
          items: [
            <>
              <b>WHERE cannot use an aggregate</b> — it runs before <code>GROUP BY</code>, so no aggregate has been
              computed yet. That is what <code>HAVING</code> is for.
            </>,
            <>
              <b>WHERE cannot use a SELECT alias</b> — the alias is created in <code>SELECT</code>, which runs
              later. You must repeat the expression.
            </>,
            <>
              <b>ORDER BY can use a SELECT alias</b> — it runs last, after <code>SELECT</code> has created it. This
              asymmetry surprises people, and it follows directly from the order.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'The two errors this explains',
          code: `-- FAILS: WHERE runs before GROUP BY, so AVG does not exist yet
SELECT dept FROM employees
WHERE AVG(salary) > 60000
GROUP BY dept;                  -- use HAVING instead

-- FAILS: the alias is created by SELECT, which runs after WHERE
SELECT salary * 12 AS annual
FROM employees
WHERE annual > 600000;          -- repeat the expression, or wrap in a subquery

-- WORKS: ORDER BY runs last, so the alias exists by then
SELECT salary * 12 AS annual
FROM employees
ORDER BY annual DESC;`,
        },
      ],
    },

    {
      id: 'constraints',
      heading: 'Constraints',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Rules attached to a column or table that the database enforces on <b>every write</b>. This is what
              stops bad data getting in before your application code even runs — and unlike application checks, it
              cannot be bypassed.
            </>
          ),
        },
        {
          k: 'code',
          title: 'All six, in one table definition',
          code: `CREATE TABLE employees (
  id      INT PRIMARY KEY,
  name    VARCHAR(50)  NOT NULL,
  email   VARCHAR(100) UNIQUE,
  dept_id INT,
  salary  INT CHECK (salary > 0),
  joined  DATE DEFAULT CURRENT_DATE,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);`,
        },
        {
          k: 'table',
          head: ['Constraint', 'Guarantees'],
          rows: [
            ['PRIMARY KEY', 'Unique and not null — identifies each row. One per table.'],
            ['FOREIGN KEY', 'The value must match one that exists in another table.'],
            ['UNIQUE', 'No two rows may share this value. NULLs are allowed.'],
            ['NOT NULL', 'This column can never be empty.'],
            ['CHECK', 'The value must satisfy a boolean condition.'],
            ['DEFAULT', 'A value used automatically when none is supplied.'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>PRIMARY KEY vs UNIQUE</b> is the usual follow-up: a primary key is <code>NOT NULL</code> and there
              is exactly one per table; a unique constraint permits NULLs and you can have several. Both prevent
              duplicates and both normally create an index.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What are DDL, DML, DCL and TCL?',
      a: (
        <>
          <b>DDL</b> defines structure (CREATE, ALTER, DROP, TRUNCATE). <b>DML</b> manipulates data (SELECT, INSERT,
          UPDATE, DELETE). <b>DCL</b> controls permissions (GRANT, REVOKE). <b>TCL</b> controls transactions
          (COMMIT, ROLLBACK, SAVEPOINT).
        </>
      ),
    },
    {
      q: 'Difference between DELETE, TRUNCATE and DROP?',
      a: (
        <>
          <b>DELETE</b> (DML) removes rows, supports WHERE, fires triggers, is logged per row and can be rolled
          back. <b>TRUNCATE</b> (DDL) removes all rows by deallocating pages — much faster, no WHERE, usually
          auto-commits and resets identity counters. <b>DROP</b> (DDL) removes the table definition itself.
        </>
      ),
    },
    {
      q: 'What is the actual execution order of a SELECT statement?',
      a: (
        <>
          <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</b> (with LIMIT last). You write SELECT first but
          it is evaluated fifth, which is why aliases and aggregates behave the way they do.
        </>
      ),
    },
    {
      q: 'Why can you not use a column alias in WHERE but you can in ORDER BY?',
      a: (
        <>
          The alias is created by <code>SELECT</code>. <code>WHERE</code> runs <b>before</b> SELECT, so the alias
          does not exist yet; <code>ORDER BY</code> runs <b>after</b> it, so it does. Follows directly from the
          execution order.
        </>
      ),
    },
    {
      q: 'Why can WHERE not contain an aggregate function?',
      a: (
        <>
          Because <code>WHERE</code> filters individual rows <b>before</b> <code>GROUP BY</code> has created any
          groups, so no aggregate has been computed. Filtering on an aggregate is <code>HAVING</code>'s job.
        </>
      ),
    },
    {
      q: 'Name the SQL constraints and what each guarantees.',
      a: (
        <>
          <b>PRIMARY KEY</b> (unique + not null, one per table), <b>FOREIGN KEY</b> (must match a row in another
          table), <b>UNIQUE</b> (no duplicates, NULLs allowed), <b>NOT NULL</b>, <b>CHECK</b> (a boolean condition)
          and <b>DEFAULT</b> (value used when none is given).
        </>
      ),
    },
    {
      q: 'Difference between a PRIMARY KEY and a UNIQUE constraint?',
      a: (
        <>
          A primary key cannot be NULL and there is only one per table. A unique constraint allows NULLs and you may
          declare several. Both enforce uniqueness and both normally create an index.
        </>
      ),
    },
    {
      q: 'Why enforce rules with constraints rather than in application code?',
      a: (
        <>
          Because a constraint is declared once and <b>cannot be bypassed</b> — by another application, a migration
          script or someone at a SQL prompt. It is also checked atomically as part of the statement, and the
          optimizer can reason about it.
        </>
      ),
    },
  ],
};

export default topic;
