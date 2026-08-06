import { Arrow, Box, Dg, Frame, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Every piece of relational vocabulary, labelled on one table. */
function RelationAnatomy() {
  return (
    <Dg w={620} h={266} cap="A relation with its schema, tuples, degree, cardinality and domains labelled">
      <Rel
        x={180}
        y={70}
        title="STUDENT"
        cols={['roll', 'name', 'dept', 'cgpa']}
        rows={[
          ['101', 'Riya', 'CSE', '9.1'],
          ['102', 'Arjun', 'ECE', '8.4'],
          ['103', 'Meera', 'CSE', '8.9'],
        ]}
        cw={80}
        c="a"
        pk={[0]}
      />

      <Txt x={100} y={88} anchor="end" fs={11} bold c="a">
        relation name
      </Txt>
      <Arrow x1={106} y1={84} x2={176} y2={84} c="a" />

      <Txt x={100} y={112} anchor="end" fs={11} bold c="b">
        attributes
      </Txt>
      <Arrow x1={106} y1={108} x2={176} y2={108} c="b" />

      <Txt x={100} y={136} anchor="end" fs={11} bold c="c">
        a tuple
      </Txt>
      <Arrow x1={106} y1={132} x2={176} y2={132} c="c" />

      <Txt x={300} y={30} fs={11} bold c="b">
        the relation schema — the design
      </Txt>
      <Arrow x1={300} y1={38} x2={300} y2={92} c="b" />

      <Txt x={512} y={112} anchor="start" fs={11} bold c="a">
        degree = 4
      </Txt>
      <Txt x={512} y={128} anchor="start" fs={10} soft>
        (number of attributes)
      </Txt>
      <Txt x={512} y={158} anchor="start" fs={11} bold c="c">
        cardinality = 3
      </Txt>
      <Txt x={512} y={174} anchor="start" fs={10} soft>
        (number of tuples)
      </Txt>

      <Arrow x1={460} y1={192} x2={460} y2={218} c="b" />
      <Txt x={430} y={240} fs={10.5} soft>
        domain of cgpa = decimal values 0.0 – 10.0
      </Txt>
    </Dg>
  );
}

/** Superkey ⊇ candidate key ⊇ primary key. */
function KeyHierarchy() {
  return (
    <Dg w={600} h={272} cap="Superkeys contain candidate keys, which contain the chosen primary key">
      <Frame x={30} y={20} w={540} h={220} label="SUPER KEYS" c="n" />
      <Txt x={300} y={54} fs={10.5} soft>
        any attribute set that uniquely identifies a tuple
      </Txt>
      <Frame x={70} y={66} w={460} h={162} label="CANDIDATE KEYS  =  minimal super keys" c="a" />
      <Box x={110} y={118} w={180} h={86} label="PRIMARY KEY" sub="the one you pick" c="c" fs={12} />
      <Box x={320} y={118} w={180} h={86} label="ALTERNATE KEYS" sub="the ones you didn't" c="b" fs={12} />
      <Txt x={300} y={262} fs={10.5} soft>
        {'{roll} and {email} are candidate keys · {roll, name} is a super key but not minimal'}
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'relational-model',
  num: 7,
  unit: 'Relational Theory',
  title: 'Relational Model & Keys',
  blurb:
    'Relations, tuples, degree and cardinality — then every kind of key, from super key down to surrogate key, with the differences interviewers dig into.',
  minutes: 14,
  tags: ['Very common', 'Definition-heavy'],

  sections: [
    {
      id: 'vocabulary',
      heading: 'The vocabulary',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The relational model describes data as <b>relations</b> — mathematically, sets of tuples. Everyday
              speech and exam speech differ, and interviewers use the formal words on purpose.
            </>
          ),
        },
        { k: 'diagram', el: <RelationAnatomy />, caption: 'One table, every term labelled.' },
        {
          k: 'table',
          head: ['Formal term', 'Everyday word', 'Meaning'],
          rows: [
            ['Relation', 'Table', 'A set of tuples over the same attributes'],
            ['Tuple', 'Row / record', 'One complete fact'],
            ['Attribute', 'Column / field', 'One named property'],
            ['Domain', 'Data type + allowed values', 'The set of legal values for an attribute — e.g. cgpa ∈ [0.0, 10.0]'],
            ['Degree (arity)', 'Number of columns', 'A property of the schema; changes rarely'],
            ['Cardinality', 'Number of rows', 'A property of the instance; changes constantly'],
            ['Relation schema', 'Table definition', 'STUDENT(roll, name, dept, cgpa)'],
            ['Relation instance', 'Current contents', 'The 3 rows sitting there right now'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>Degree vs cardinality</b> is a guaranteed question, and half of candidates swap them. Degree counts{' '}
              <b>columns</b>; cardinality counts <b>rows</b>. Mnemonic: a <i>card</i>inality is how many <i>cards</i>{' '}
              (rows) are in the deck.
            </>
          ),
        },
      ],
    },

    {
      id: 'properties',
      heading: 'Properties of a relation',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              These follow from the relation being a <b>set</b>, and they explain several DBMS behaviours that
              otherwise look arbitrary.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>No duplicate tuples</b> — a set has no repeats, which is why a relation must have a key.
            </>,
            <>
              <b>Tuple order is irrelevant</b> — this is why a query without <i>order by</i> may return rows in any
              order, and why relying on "insertion order" is a bug.
            </>,
            <>
              <b>Attribute order is irrelevant</b> — attributes are identified by name, not position.
            </>,
            <>
              <b>Every value is atomic</b> — one indivisible value per cell. No lists, no nested tables. This is
              precisely the 1NF requirement.
            </>,
            <>
              <b>All values in a column come from the same domain</b>.
            </>,
            <>
              <b>Attribute names are unique</b> within a relation.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Real SQL tables deliberately break the first rule — SQL tables are <b>bags</b> (multisets), so
              duplicates are allowed unless you declare a key. Saying this out loud shows you know the difference
              between the theory and the products.
            </>
          ),
        },
      ],
    },

    {
      id: 'keys',
      heading: 'Every kind of key',
      blocks: [
        { k: 'diagram', el: <KeyHierarchy />, caption: 'Every candidate key is a super key. Every primary key is a candidate key. The reverse is not true.' },
        {
          k: 'steps',
          items: [
            {
              t: 'Super key',
              d: (
                <>
                  Any set of attributes that uniquely identifies a tuple. It does <b>not</b> have to be minimal —{' '}
                  <code>{'{roll, name, cgpa}'}</code> is a perfectly valid super key.
                </>
              ),
            },
            {
              t: 'Candidate key',
              d: (
                <>
                  A <b>minimal</b> super key: remove any attribute from it and it stops being unique. A relation can
                  have several candidate keys.
                </>
              ),
            },
            {
              t: 'Primary key',
              d: (
                <>
                  The one candidate key the designer chooses as <i>the</i> identifier. It cannot be NULL and cannot
                  be duplicated. Exactly one per relation.
                </>
              ),
            },
            {
              t: 'Alternate (secondary) key',
              d: 'Every candidate key that was not chosen as the primary key. They are usually enforced with a UNIQUE constraint.',
            },
            {
              t: 'Composite key',
              d: 'A key made of two or more attributes — for example (roll, cid) in an enrolment table.',
            },
            {
              t: 'Foreign key',
              d: (
                <>
                  An attribute in one relation that refers to the primary key of another (or of the same) relation.
                  It is how relationships are represented, and it <i>may</i> be NULL.
                </>
              ),
            },
            {
              t: 'Surrogate key',
              d: 'An artificial, system-generated identifier (an auto-increment id or a UUID) with no business meaning. Used when no natural key is stable or compact.',
            },
          ],
        },
      ],
    },

    {
      id: 'finding-keys',
      heading: 'Working keys out on paper',
      blocks: [
        {
          k: 'code',
          title: 'EMPLOYEE( emp_id, pan, email, name, dept )',
          code: `Facts given:  emp_id is unique.  pan is unique.  email is unique.
              name and dept are not unique.

SUPER KEYS      any set containing emp_id, pan or email:
                {emp_id}, {pan}, {email},
                {emp_id, name}, {pan, dept}, {emp_id, pan, email, name, dept}, ...
                → many of them

CANDIDATE KEYS  the minimal ones only:
                {emp_id}, {pan}, {email}
                ({emp_id, name} is NOT minimal — drop name, still unique)

PRIMARY KEY     {emp_id}          ← designer's choice: short, stable, never NULL

ALTERNATE KEYS  {pan}, {email}    ← enforce with UNIQUE`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'How many super keys?',
          text: (
            <>
              A numeric favourite. If a relation has <b>n</b> attributes and <code>{'{A}'}</code> is the only
              candidate key, every subset that contains A is a super key — so there are <b>2ⁿ⁻¹</b> super keys. With{' '}
              <code>R(A, B, C, D)</code> and candidate key <code>A</code>: 2³ = <b>8</b> super keys.
            </>
          ),
        },
      ],
    },

    {
      id: 'choosing-pk',
      heading: 'Choosing a primary key',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Stable</b> — it must never need to change. An email address is a bad primary key because people
              change emails, and every referencing row would have to be updated.
            </>,
            <>
              <b>Never NULL</b> — this is enforced automatically, but it should also be true in reality.
            </>,
            <>
              <b>Small</b> — the primary key is copied into every foreign key and into every index entry, so a short
              integer beats a long string.
            </>,
            <>
              <b>Simple over composite</b> — where reasonable, since composite keys propagate into every referencing
              table.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['', 'Natural key', 'Surrogate key'],
          rows: [
            ['What it is', 'A real-world attribute (pan, isbn, email)', 'A generated id with no meaning'],
            ['Pros', 'Meaningful; no extra column; no lookup needed to recognise a row', 'Never changes; always compact; always available at insert time'],
            ['Cons', 'Business rules change, and then the key changes everywhere', 'Meaningless; needs a join to say anything human; duplicates can sneak in unless you also constrain the natural key'],
            ['Verdict', 'Fine when genuinely immutable and unique', 'The pragmatic default in most production schemas'],
          ],
        },
      ],
    },

    {
      id: 'nulls',
      heading: 'NULL — the value that is not a value',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              NULL means <b>"no value here"</b>, and it comes in three flavours: not applicable, unknown, or
              withheld. It is <b>not</b> zero, and <b>not</b> an empty string.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              Any arithmetic involving NULL yields NULL. <code>5 + NULL</code> is NULL.
            </>,
            <>
              Comparisons with NULL yield <b>unknown</b>, not true or false — which is why you test with{' '}
              <code>IS NULL</code> rather than <code>= NULL</code>.
            </>,
            <>
              Aggregates <b>skip</b> NULLs. An average over 10 rows where 3 are NULL divides by 7, not 10.
            </>,
            <>
              A primary key can never be NULL (entity integrity), but a foreign key can be — that is how you model
              "not assigned yet".
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between degree and cardinality?',
      a: (
        <>
          <b>Degree</b> is the number of <b>attributes</b> (columns) — a schema property. <b>Cardinality</b> is the
          number of <b>tuples</b> (rows) — an instance property that changes with every insert.
        </>
      ),
    },
    {
      q: 'Super key vs candidate key vs primary key?',
      a: (
        <>
          A <b>super key</b> is any attribute set that uniquely identifies a tuple. A <b>candidate key</b> is a super
          key that is <b>minimal</b> — no attribute can be removed. The <b>primary key</b> is the single candidate
          key the designer selects; the remaining candidates become alternate keys.
        </>
      ),
    },
    {
      q: 'Can a table have more than one primary key?',
      a: (
        <>
          No — exactly one. It <i>can</i> have multiple candidate keys, and the primary key <i>can</i> be composite
          (made of several columns), but there is only one primary key per relation. People often confuse "composite
          primary key" with "two primary keys".
        </>
      ),
    },
    {
      q: 'Can a foreign key be NULL? Can a primary key?',
      a: (
        <>
          A foreign key <b>can</b> be NULL — it means the relationship is not established yet (an employee not yet
          assigned to a department). A primary key can <b>never</b> be NULL; that is the entity integrity rule.
        </>
      ),
    },
    {
      q: 'Difference between a primary key and a unique key?',
      a: (
        <>
          Both enforce uniqueness. A primary key <b>cannot be NULL</b> and there is only one per table; a unique key{' '}
          <b>allows NULLs</b> (usually one, though this varies by DBMS) and you can have several per table. Both
          typically create an index.
        </>
      ),
    },
    {
      q: 'What is a surrogate key and when would you use one?',
      a: (
        <>
          A system-generated identifier with no business meaning — an auto-increment integer or UUID. Use it when no
          natural key is stable (emails change), when the natural key is large or composite, or when the natural key
          is not known at insert time.
        </>
      ),
    },
    {
      q: 'R(A, B, C, D) with A as the only candidate key — how many super keys?',
      a: (
        <>
          Every super key must contain A; the other three attributes are each independently in or out. So{' '}
          <b>2³ = 8</b> super keys. In general, 2<sup>n−1</sup> for n attributes with a single-attribute candidate
          key.
        </>
      ),
    },
    {
      q: 'Why is a relation formally a set, and where does SQL differ?',
      a: (
        <>
          Because the model is built on set theory: no duplicates, and no meaningful order of rows or columns. SQL
          relaxes this — tables and query results are <b>multisets</b>, so duplicates are permitted unless a key or{' '}
          <code>DISTINCT</code> removes them. This is a deliberate, practical deviation from the pure model.
        </>
      ),
    },
    {
      q: 'Why is NULL different from 0 or an empty string?',
      a: (
        <>
          0 and '' are real, known values. NULL means the value is absent or unknown, so it propagates through
          arithmetic, makes comparisons evaluate to <b>unknown</b> rather than false, and is skipped by aggregate
          functions. A salary of 0 and a salary of NULL mean very different things.
        </>
      ),
    },
  ],
};

export default topic;
