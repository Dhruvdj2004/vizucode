import { Arrow, Box, Dg, Dia, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** 1:N becomes a foreign key on the many side — no extra table. */
function OneToManyMapping() {
  return (
    <Dg w={620} h={262} cap="A one-to-many relationship becomes a foreign key column on the many side">
      <Box x={40} y={28} w={120} h={46} label="DEPT" c="a" fs={12} r={3} />
      <Arrow x1={160} y1={51} x2={200} y2={51} c="n" plain label="1" dy={-8} />
      <Dia cx={250} cy={51} rx={48} ry={25} label="has" c="c" />
      <Arrow x1={298} y1={51} x2={352} y2={51} c="n" plain label="N" dy={-8} />
      <Box x={352} y={28} w={130} h={46} label="EMPLOYEE" c="a" fs={12} r={3} />

      <Arrow x1={300} y1={92} x2={300} y2={128} c="c" label="maps to" dy={-4} dx={48} />

      <Rel
        x={40}
        y={140}
        title="DEPT"
        cols={['did', 'dname']}
        rows={[
          ['D1', 'CSE'],
          ['D2', 'ECE'],
        ]}
        cw={72}
        c="a"
        pk={[0]}
      />
      <Rel
        x={266}
        y={140}
        title="EMPLOYEE"
        cols={['eid', 'name', 'did']}
        rows={[
          ['E1', 'Riya', 'D1'],
          ['E2', 'Arjun', 'D1'],
        ]}
        cw={[58, 72, 58]}
        c="a"
        pk={[0]}
        fk={[2]}
        mark={{ '0,2': 'c', '1,2': 'c' }}
      />
      <Arrow x1={188} y1={188} x2={262} y2={188} c="c" dashed />
      <Txt x={510} y={176} anchor="start" fs={11} bold c="c">
        did is the foreign key
      </Txt>
      <Txt x={510} y={196} anchor="start" fs={10.5} soft>
        It sits on the N side.
      </Txt>
      <Txt x={510} y={214} anchor="start" fs={10.5} soft>
        No third table needed.
      </Txt>
    </Dg>
  );
}

/** M:N always needs a junction table. */
function ManyToManyMapping() {
  return (
    <Dg w={620} h={290} cap="A many-to-many relationship becomes its own table holding both keys">
      <Box x={40} y={24} w={120} h={46} label="STUDENT" c="a" fs={12} r={3} />
      <Arrow x1={160} y1={47} x2={200} y2={47} c="n" plain label="M" dy={-8} />
      <Dia cx={250} cy={47} rx={50} ry={25} label="enrolls" c="c" />
      <Arrow x1={300} y1={47} x2={352} y2={47} c="n" plain label="N" dy={-8} />
      <Box x={352} y={24} w={120} h={46} label="COURSE" c="a" fs={12} r={3} />

      <Arrow x1={300} y1={88} x2={300} y2={124} c="c" label="maps to" dy={-4} dx={48} />

      <Rel
        x={16}
        y={136}
        title="STUDENT"
        cols={['roll', 'name']}
        rows={[
          ['101', 'Riya'],
          ['102', 'Arjun'],
        ]}
        cw={66}
        c="a"
        pk={[0]}
      />
      <Rel
        x={172}
        y={136}
        title="ENROLLS"
        cols={['roll', 'cid', 'grade']}
        rows={[
          ['101', 'C1', 'A'],
          ['101', 'C2', 'B'],
          ['102', 'C1', 'A'],
        ]}
        cw={[56, 52, 58]}
        c="c"
        pk={[0, 1]}
        fk={[0, 1]}
      />
      <Rel
        x={366}
        y={136}
        title="COURSE"
        cols={['cid', 'title']}
        rows={[
          ['C1', 'DBMS'],
          ['C2', 'OS'],
        ]}
        cw={[52, 74]}
        c="a"
        pk={[0]}
      />
      <Txt x={512} y={172} anchor="start" fs={11} bold c="c">
        junction table
      </Txt>
      <Txt x={512} y={192} anchor="start" fs={10.5} soft>
        PK = (roll, cid)
      </Txt>
      <Txt x={512} y={210} anchor="start" fs={10.5} soft>
        both columns are
      </Txt>
      <Txt x={512} y={226} anchor="start" fs={10.5} soft>
        also foreign keys
      </Txt>
      <Txt x={512} y={250} anchor="start" fs={10.5} soft>
        grade lives here —
      </Txt>
      <Txt x={512} y={266} anchor="start" fs={10.5} soft>
        it belongs to the pair
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'er-to-relational',
  num: 6,
  unit: 'Database Design',
  title: 'Converting an ER Diagram into Tables',
  blurb:
    'The seven mechanical rules that turn any ER diagram into a relational schema — entities, weak entities, every cardinality, multivalued attributes and ISA hierarchies.',
  minutes: 13,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'overview',
      heading: 'The seven rules at a glance',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              This conversion is <b>mechanical</b>. Learn the seven rules and you can convert any diagram they put in
              front of you, without thinking about the meaning at all.
            </>
          ),
        },
        {
          k: 'table',
          head: ['#', 'ER construct', 'Becomes'],
          rows: [
            ['1', 'Strong entity type', 'Its own table. Key attribute → primary key.'],
            ['2', 'Weak entity type', 'Its own table. PK = owner\'s PK + partial key. Owner key is also a FK.'],
            ['3', '1:1 relationship', 'Foreign key on either side — prefer the side with total participation. Or merge both entities into one table.'],
            ['4', '1:N relationship', 'Foreign key on the N side. No new table.'],
            ['5', 'M:N relationship', 'A new junction table. PK = both foreign keys together.'],
            ['6', 'Multivalued attribute', 'A new table: owner\'s PK + the attribute. PK = both together.'],
            ['7', 'n-ary relationship (n ≥ 3)', 'A new table holding the keys of all n participants.'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A composite attribute is the one case that <b>does not</b> get its own rule: you simply flatten it.{' '}
              <code>name(first, last)</code> becomes two columns, <code>first_name</code> and <code>last_name</code>.
              The composite itself disappears.
            </>
          ),
        },
      ],
    },

    {
      id: 'entities',
      heading: 'Rule 1 & 2 — entities',
      blocks: [
        { k: 'h', text: 'Strong entity' },
        {
          k: 'p',
          text: (
            <>
              One table. Every simple attribute becomes a column, composite attributes are flattened into their
              parts, derived attributes are <b>skipped</b> (they are computed, not stored), and the underlined key
              attribute becomes the primary key.
            </>
          ),
        },
        {
          k: 'code',
          title: 'STUDENT( roll, name, dob ) — age was derived, so it is not stored',
          code: `STUDENT
┌────────┬─────────┬────────────┐
│ roll   │ name    │ dob        │   PK = roll
├────────┼─────────┼────────────┤
│ 101    │ Riya    │ 2003-04-11 │
│ 102    │ Arjun   │ 2003-09-02 │
└────────┴─────────┴────────────┘`,
        },
        { k: 'h', text: 'Weak entity' },
        {
          k: 'p',
          text: (
            <>
              Also one table — but it must carry the owner's primary key as a foreign key, and its own primary key is
              the <b>combination</b> of that foreign key and its partial key.
            </>
          ),
        },
        {
          k: 'code',
          title: 'EMPLOYEE has DEPENDENT (weak)',
          code: `EMPLOYEE( eid, name )                     PK = eid

DEPENDENT( eid, d_name, relation )        PK = (eid, d_name)
              ↑        ↑                  FK: eid → EMPLOYEE.eid
             FK    partial key

Two employees may each have a dependent called "Riya" —
that is exactly why d_name alone cannot be the key.`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The identifying relationship (double diamond) never becomes its own table. It is already captured by
              the foreign key inside the weak entity's table.
            </>
          ),
        },
      ],
    },

    {
      id: 'one-to-many',
      heading: 'Rule 4 — one-to-many',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The most common case in real schemas, and the one worth being fastest at. The foreign key always goes
              on the <b>many</b> side.
            </>
          ),
        },
        { k: 'diagram', el: <OneToManyMapping />, caption: 'Each employee has one department, so one department column on EMPLOYEE captures everything.' },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why on the N side, and not the 1 side?',
          text: (
            <>
              Because a column holds exactly one value. If you put <code>eid</code> on DEPT, a department with 50
              employees would need 50 values in one cell — which violates 1NF. On the N side each employee has
              exactly one department, so a single column fits perfectly.
            </>
          ),
        },
      ],
    },

    {
      id: 'many-to-many',
      heading: 'Rule 5 — many-to-many',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              M:N can never be captured by a foreign key on either side — both sides would need multiple values. So it
              always gets its own table.
            </>
          ),
        },
        { k: 'diagram', el: <ManyToManyMapping />, caption: 'The junction table is where any descriptive attribute of the relationship also lands.' },
        {
          k: 'ol',
          items: [
            'Create a new table named after the relationship.',
            'Put the primary key of each participating entity into it — both become foreign keys.',
            'The combination of those foreign keys is the primary key of the new table.',
            'Any descriptive attribute of the relationship (grade, quantity, date_joined) becomes a column here.',
          ],
        },
      ],
    },

    {
      id: 'one-to-one',
      heading: 'Rule 3 — one-to-one',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              You have three legitimate options, and the interviewer usually wants to hear you weigh them.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Foreign key on the total-participation side</b> — the default. If every employee must have a
              locker but not every locker is assigned, put <code>locker_id</code> on EMPLOYEE so the column is never
              NULL.
            </>,
            <>
              <b>Merge both entities into one table</b> — only when <i>both</i> sides have total participation.
              Person and Passport where neither can exist without the other.
            </>,
            <>
              <b>A separate relationship table</b> — correct but usually wasteful for 1:1; it forces an extra join
              for no benefit unless both sides are partial and the pairing is rare.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Whichever side you choose, add a <b>UNIQUE</b> constraint on that foreign key column. Without it you
              have built a 1:N, not a 1:1 — this is the mistake interviewers look for.
            </>
          ),
        },
      ],
    },

    {
      id: 'multivalued',
      heading: 'Rule 6 — multivalued attributes',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A multivalued attribute cannot live in a column, because a column holds one atomic value. It gets its
              own table.
            </>
          ),
        },
        {
          k: 'code',
          title: 'EMPLOYEE with a multivalued phone attribute',
          code: `WRONG                              RIGHT
EMPLOYEE( eid, name, phones )      EMPLOYEE( eid, name )
  E1  Riya  "999, 888"               E1  Riya

  ✗ not atomic → violates 1NF     EMP_PHONE( eid, phone )   PK = (eid, phone)
  ✗ cannot index or search          E1  999                 FK: eid → EMPLOYEE
  ✗ cannot constrain the format     E1  888`,
        },
      ],
    },

    {
      id: 'isa',
      heading: 'Mapping an ISA hierarchy',
      blocks: [
        {
          k: 'table',
          head: ['Approach', 'Tables produced', 'Good when', 'Cost'],
          rows: [
            [
              'Superclass + subclass tables',
              'One for the superclass, one per subclass (each keyed by the superclass key)',
              'Always valid — the safe default, especially for overlapping specializations',
              'Every query about a subclass needs a join',
            ],
            [
              'Subclass tables only',
              'One per subclass, each repeating the superclass attributes',
              'Only when the specialization is total AND disjoint',
              'Cannot store a superclass entity that fits no subclass; queries over all employees need a UNION',
            ],
            [
              'One single table',
              'One table with every attribute plus a type column',
              'Few subclasses with few local attributes',
              'Lots of NULLs; constraints must be enforced in application logic',
            ],
          ],
        },
      ],
    },

    {
      id: 'worked',
      heading: 'Worked example',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Convert the college diagram from the previous topic: STUDENT (roll, name, dob) enrolls M:N in COURSE
              (cid, title) with a grade; INSTRUCTOR (iid, iname) teaches COURSE 1:N.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Resulting relational schema',
          code: `STUDENT( roll, name, dob )
    PK  roll

COURSE( cid, title, iid )
    PK  cid
    FK  iid → INSTRUCTOR(iid)        ← rule 4: 1:N, FK on the N side

INSTRUCTOR( iid, iname )
    PK  iid

ENROLLS( roll, cid, grade )
    PK  (roll, cid)                  ← rule 5: M:N needs its own table
    FK  roll → STUDENT(roll)
    FK  cid  → COURSE(cid)

4 entities/relationships → 4 tables.
The teaches relationship vanished into a column; enrolls could not.`,
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              A reliable way to sanity-check your answer: <b>count the tables</b>. Strong entities + weak entities +
              M:N relationships + multivalued attributes + n-ary relationships. 1:1 and 1:N relationships add zero
              tables. If your count does not match, you converted something wrong.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'How do you convert a 1:N relationship to tables?',
      a: (
        <>
          Put the primary key of the "1" side as a <b>foreign key column on the "N" side table</b>. No third table is
          needed. If participation on the N side is total, that column is also <code>NOT NULL</code>.
        </>
      ),
    },
    {
      q: 'Why does M:N always need a separate table?',
      a: (
        <>
          Because a foreign key column holds one value. In M:N both sides need to reference many rows, so neither
          table can hold the link without repeating values in a cell — which breaks 1NF. A junction table keyed on
          both foreign keys stores one row per pairing instead.
        </>
      ),
    },
    {
      q: 'How is a weak entity mapped?',
      a: (
        <>
          It gets its own table containing its attributes plus the owner's primary key as a foreign key. Its primary
          key is the <b>composite</b> of that foreign key and its partial key. The identifying relationship itself
          produces no table.
        </>
      ),
    },
    {
      q: 'Where do you put the foreign key for a 1:1 relationship?',
      a: (
        <>
          On the side with <b>total participation</b>, so the column is never NULL, and add a <b>UNIQUE</b>{' '}
          constraint on it to enforce the 1:1. If both sides are total, merging the two entities into a single table
          is usually better.
        </>
      ),
    },
    {
      q: 'How do you handle a multivalued attribute?',
      a: (
        <>
          Create a separate table holding the owner's primary key plus the attribute, with the two together as the
          primary key. You cannot keep it as a column because that value would not be atomic.
        </>
      ),
    },
    {
      q: 'What happens to a composite attribute?',
      a: (
        <>
          It is flattened — <code>address(street, city, pin)</code> becomes three columns. The composite attribute
          itself does not survive into the relational schema. You could alternatively store only the whole thing as
          one column if you never query the parts, but flattening is the standard answer.
        </>
      ),
    },
    {
      q: 'What happens to a derived attribute?',
      a: (
        <>
          It is <b>not stored</b>. You compute it on read, or expose it as a view / computed column. Storing it
          creates an update anomaly the moment the underlying attribute changes.
        </>
      ),
    },
    {
      q: 'How many tables does an ER diagram with 3 entities and one M:N relationship between two of them produce?',
      a: (
        <>
          Four — three for the entities, plus one junction table for the M:N relationship. Any 1:1 or 1:N
          relationships among them add no tables, only foreign key columns.
        </>
      ),
    },
  ],
};

export default topic;
