import { Arrow, Box, Dg, Frame, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** A referential integrity violation, made visible. */
function ReferentialIntegrity() {
  return (
    <Dg w={620} h={262} cap="A foreign key value that has no matching primary key violates referential integrity">
      <Rel
        x={60}
        y={40}
        title="DEPARTMENT"
        cols={['did', 'dname']}
        rows={[
          ['D1', 'CSE'],
          ['D2', 'ECE'],
        ]}
        cw={[62, 82]}
        c="b"
        pk={[0]}
      />
      <Txt x={132} y={158} fs={10.5} soft>
        parent · referenced
      </Txt>

      <Rel
        x={330}
        y={40}
        title="EMPLOYEE"
        cols={['eid', 'name', 'did']}
        rows={[
          ['E1', 'Riya', 'D1'],
          ['E2', 'Arjun', 'D2'],
          ['E3', 'Kabir', 'D9'],
        ]}
        cw={[54, 74, 54]}
        c="a"
        pk={[0]}
        fk={[2]}
        mark={{ '2,2': 'c' }}
      />
      <Txt x={420} y={182} fs={10.5} soft>
        child · referencing
      </Txt>

      <Arrow x1={326} y1={100} x2={206} y2={100} c="b" dashed label="FK → PK" dy={-8} />

      <Txt x={310} y={228} fs={11.5} bold c="c">
        ✗ E3 points at D9, and D9 does not exist
      </Txt>
      <Txt x={310} y={248} fs={10.5} soft>
        the DBMS rejects this insert — referential integrity is violated
      </Txt>
    </Dg>
  );
}

/** What happens to children when the parent row is deleted. */
function ReferentialActions() {
  const panel = (
    fx: number,
    title: string,
    strike: boolean,
    outLabel: string,
    outSub: string,
    c: 'a' | 'b' | 'c',
    n1: string,
    n2: string
  ) => (
    <>
      <Frame x={fx} y={8} w={196} h={228} label={title} c={c} />
      <Box x={fx + 38} y={40} w={120} h={36} label="DEPT D1" c="n" fs={12} />
      {strike && (
        <line x1={fx + 44} y1={58} x2={fx + 152} y2={58} stroke="var(--accent-3)" strokeWidth="2" />
      )}
      <Arrow x1={fx + 98} y1={76} x2={fx + 98} y2={108} c="n" />
      <Box x={fx + 18} y={108} w={160} h={62} label={outLabel} sub={outSub} c={c} fs={12} />
      <Txt x={fx + 98} y={196} fs={10.5} soft>
        {n1}
      </Txt>
      <Txt x={fx + 98} y={212} fs={10.5} soft>
        {n2}
      </Txt>
    </>
  );

  return (
    <Dg w={608} h={246} cap="Three ways a DBMS can react when a referenced parent row is deleted">
      {panel(2, 'ON DELETE CASCADE', true, 'Employees deleted', 'E1, E2 gone too', 'a', 'children follow', 'the parent down')}
      {panel(206, 'ON DELETE SET NULL', true, 'did → NULL', 'employees survive', 'b', 'rows kept, the', 'link is cleared')}
      {panel(410, 'ON DELETE RESTRICT', false, 'DELETE refused', 'error returned', 'c', 'parent cannot go', 'while children exist')}
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'integrity-constraints',
  num: 8,
  unit: 'Relational Theory',
  title: 'Integrity Constraints',
  blurb:
    'Domain, entity and referential integrity — plus what the DBMS does to child rows when you delete or update the parent.',
  minutes: 11,
  tags: ['Very common'],

  sections: [
    {
      id: 'what',
      heading: 'Why constraints exist',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>constraint</b> is a rule the database itself enforces. Any operation that would break it is
              rejected. The point is that the rule lives in <b>one place</b> — the schema — rather than being
              re-implemented (and eventually forgotten) in every application that touches the data.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Constraints fall into two groups. <b>Implicit / inherent</b> constraints come from the model itself
              (no duplicate tuples, atomic values). <b>Explicit / schema-based</b> constraints are the ones you
              declare, and those are what interviews ask about.
            </>
          ),
        },
      ],
    },

    {
      id: 'four',
      heading: 'The four classic constraints',
      blocks: [
        {
          k: 'table',
          head: ['Constraint', 'Rule', 'Violated by'],
          rows: [
            [
              'Domain integrity',
              'Every value in a column must come from that column\'s domain — correct type, correct range, correct format.',
              "Inserting 'abc' into an integer column, or a cgpa of 14.2",
            ],
            [
              'Key integrity',
              'No two tuples may have the same value for a declared key.',
              'Inserting a second row with roll = 101',
            ],
            [
              'Entity integrity',
              'No part of a primary key may be NULL.',
              'Inserting a student with roll = NULL',
            ],
            [
              'Referential integrity',
              'A foreign key value must either match some primary key in the referenced relation, or be entirely NULL.',
              'An employee in department D9 when no D9 exists',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why can a primary key never be NULL?',
          text: (
            <>
              Because the primary key's whole job is to <b>identify</b> a tuple, and NULL means "unknown". A row you
              cannot identify cannot be referenced, updated reliably, or distinguished from another unknown row.
              That rule is called <b>entity integrity</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'referential',
      heading: 'Referential integrity in detail',
      blocks: [
        { k: 'diagram', el: <ReferentialIntegrity />, caption: 'The child row must point at a parent that actually exists — or at nothing at all.' },
        {
          k: 'ul',
          items: [
            <>
              The foreign key must reference a <b>primary key or a unique key</b> — you cannot point at a
              non-unique column, because the reference would be ambiguous.
            </>,
            <>
              A foreign key may be <b>NULL</b> (the relationship simply does not exist yet), unless you also declare
              the column <code>NOT NULL</code>.
            </>,
            <>
              A foreign key may reference <b>the same table</b> — a self-referencing key, e.g.{' '}
              <code>manager_id → emp_id</code>. That is how you store a hierarchy.
            </>,
            <>
              The referenced and referencing columns must have <b>compatible types</b>.
            </>,
            <>
              A composite foreign key references a composite primary key, and matches on <b>all</b> columns
              together.
            </>,
          ],
        },
      ],
    },

    {
      id: 'actions',
      heading: 'Referential actions — what happens to the children',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The interesting question is not "can I break referential integrity" (you cannot), but{' '}
              <b>"what should the DBMS do when the parent goes away?"</b>. You declare that answer per foreign key.
            </>
          ),
        },
        { k: 'diagram', el: <ReferentialActions />, caption: 'Deleting department D1 when employees still reference it.' },
        {
          k: 'table',
          head: ['Action', 'On delete of the parent', 'On update of the parent key', 'Use when'],
          rows: [
            ['CASCADE', 'Delete the child rows too', 'Update the child values to match', 'The child cannot exist without the parent — order items when the order is deleted'],
            ['SET NULL', 'Set the child foreign key to NULL', 'Same', 'The child is independent — an employee stays employed when a department closes'],
            ['SET DEFAULT', 'Set the child foreign key to its declared default', 'Same', 'There is a sensible fallback, e.g. an "Unassigned" department'],
            ['RESTRICT', 'Reject the operation immediately', 'Reject', 'You want the deletion to fail loudly and force explicit cleanup'],
            ['NO ACTION', 'Reject, but only after the whole statement (checked at the end)', 'Reject', 'Default in the SQL standard; differs from RESTRICT only in timing'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>CASCADE is dangerous at scale.</b> One delete can silently remove millions of rows across many
              tables, and cascades can chain through several levels. Many production teams deliberately use RESTRICT
              and delete explicitly, so the blast radius is visible in the code.
            </>
          ),
        },
      ],
    },

    {
      id: 'when-violated',
      heading: 'Which operations can violate which constraint',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A precise little table that answers a whole family of exam questions.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Operation', 'Can violate'],
          rows: [
            ['INSERT into the child', 'Referential integrity (parent may not exist), key integrity, entity integrity, domain integrity'],
            ['INSERT into the parent', 'Key, entity and domain integrity — never referential integrity'],
            ['DELETE from the child', 'Nothing — deleting a child is always safe'],
            ['DELETE from the parent', 'Referential integrity (children would be orphaned)'],
            ['UPDATE a non-key column', 'Domain integrity only'],
            ['UPDATE a primary key', 'Key integrity, and referential integrity for every child pointing at it'],
            ['UPDATE a foreign key', 'Referential integrity (the new value may not exist)'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The shortcut to remember: <b>inserting into the child</b> and <b>deleting from the parent</b> are the
              two risky moves. Deleting a child and inserting a parent are always safe.
            </>
          ),
        },
      ],
    },

    {
      id: 'other',
      heading: 'The other constraints you should be able to name',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>NOT NULL</b> — the column must always have a value.
            </>,
            <>
              <b>UNIQUE</b> — no duplicate values, but NULLs are allowed. This is how alternate keys are enforced.
            </>,
            <>
              <b>CHECK</b> — an arbitrary boolean condition on a row, e.g. <code>cgpa BETWEEN 0 AND 10</code> or{' '}
              <code>end_date &gt; start_date</code>. This is where most real domain rules live.
            </>,
            <>
              <b>DEFAULT</b> — a value supplied when the insert omits the column. Strictly a default rather than a
              constraint, but it is asked alongside them.
            </>,
            <>
              <b>Assertion</b> — a constraint spanning <i>several</i> tables ("total loans must not exceed total
              deposits"). Defined in the SQL standard, but rarely implemented, because checking it on every
              modification is expensive.
            </>,
            <>
              <b>Trigger</b> — procedural code that fires on insert/update/delete. The escape hatch for rules that
              cannot be expressed declaratively; powerful, but hard to debug and easy to make slow.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Constraint or trigger?',
          text: (
            <>
              Always prefer a <b>declarative constraint</b>. The optimizer can reason about it, it is checked
              atomically, it is visible in the schema, and it cannot be bypassed. Reach for a trigger only when the
              rule genuinely cannot be expressed as a constraint — for example one that must consult another table
              or write an audit row.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is referential integrity?',
      a: (
        <>
          The rule that every foreign key value must either match an existing primary key in the referenced
          relation, or be NULL. It is what prevents orphan rows — an employee in a department that does not exist.
        </>
      ),
    },
    {
      q: 'What is entity integrity?',
      a: (
        <>
          No attribute of a primary key may be NULL. Since the primary key exists to identify a tuple, an unknown
          value would make the tuple unidentifiable and unreferenceable.
        </>
      ),
    },
    {
      q: 'Difference between ON DELETE CASCADE and ON DELETE SET NULL?',
      a: (
        <>
          CASCADE deletes the child rows along with the parent — correct when the child is meaningless on its own
          (order items). SET NULL keeps the child rows but clears the foreign key — correct when the child is
          independent (an employee whose department was dissolved).
        </>
      ),
    },
    {
      q: 'Which operations can violate referential integrity?',
      a: (
        <>
          <b>INSERT</b> or <b>UPDATE</b> on the <b>child</b> (the new foreign key value may have no parent), and{' '}
          <b>DELETE</b> or a primary-key <b>UPDATE</b> on the <b>parent</b> (existing children would be orphaned).
          Deleting a child row and inserting a parent row can never violate it.
        </>
      ),
    },
    {
      q: 'Can a foreign key reference a non-primary-key column?',
      a: (
        <>
          It can reference any column with a <b>UNIQUE</b> constraint, not just the primary key — uniqueness is the
          real requirement, since the reference must resolve to exactly one row. It cannot reference an ordinary
          non-unique column.
        </>
      ),
    },
    {
      q: 'Can a table have a foreign key referencing itself?',
      a: (
        <>
          Yes — a self-referencing foreign key, such as <code>manager_id</code> referencing <code>emp_id</code> in
          the same EMPLOYEE table. It is the standard way to store a hierarchy, and the top of the hierarchy has a
          NULL there.
        </>
      ),
    },
    {
      q: 'Difference between a UNIQUE constraint and a PRIMARY KEY?',
      a: (
        <>
          A primary key is <b>NOT NULL</b> and there is exactly one per table. A UNIQUE constraint permits NULLs and
          you may declare several per table. Both prevent duplicate values and both are normally backed by an index.
        </>
      ),
    },
    {
      q: 'Constraint vs trigger — which would you use and why?',
      a: (
        <>
          Prefer a constraint: it is declarative, the optimizer understands it, it cannot be bypassed, and it is
          checked as part of the statement. Use a trigger only for rules that constraints cannot express — for
          example ones needing a lookup into another table, an audit trail, or a derived value maintained on write.
        </>
      ),
    },
  ],
};

export default topic;
