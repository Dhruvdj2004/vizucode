import { Arrow, Box, Dg, Dia, Ell, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** The symbol vocabulary of an ER diagram. */
function ErLegend() {
  const cap = (x: number, y: number, t: string) => (
    <Txt x={x} y={y} fs={10.5} soft>
      {t}
    </Txt>
  );
  return (
    <Dg w={620} h={222} cap="ER diagram symbols: rectangles, diamonds and ellipses">
      <Box x={38} y={24} w={84} h={40} label="Student" c="a" fs={12} r={3} />
      {cap(80, 86, 'Entity type')}

      <Box x={191} y={20} w={88} h={48} c="a" fs={12} r={3} ghost />
      <Box x={195} y={24} w={80} h={40} label="Loan pmt" c="a" fs={11} r={3} />
      {cap(235, 86, 'Weak entity type')}

      <Dia cx={390} cy={44} rx={56} ry={26} label="enrolls" c="c" />
      {cap(390, 86, 'Relationship type')}

      <Dia cx={545} cy={44} rx={58} ry={28} label="has" c="c" weak />
      {cap(545, 86, 'Identifying relationship')}

      <Ell cx={80} cy={140} rx={54} ry={23} label="name" c="b" />
      {cap(80, 182, 'Simple attribute')}

      <Ell cx={235} cy={140} rx={54} ry={23} label="roll_no" c="b" keyAttr />
      {cap(235, 182, 'Key attribute (underlined)')}

      <Ell cx={390} cy={140} rx={48} ry={20} label="phone" c="b" multi />
      {cap(390, 182, 'Multivalued (double)')}

      <Ell cx={545} cy={140} rx={54} ry={23} label="age" c="b" derived />
      {cap(545, 182, 'Derived (dashed)')}
    </Dg>
  );
}

/** Cardinality ratios drawn as mappings between two entity sets. */
function Cardinality() {
  const L = (fx: number, ys: number[], p: string) =>
    ys.map((y, i) => <Box key={`l${i}`} x={fx + 20} y={y} w={58} h={24} label={`${p}${i + 1}`} c="a" fs={11} r={4} />);
  const R = (fx: number, ys: number[], p: string) =>
    ys.map((y, i) => <Box key={`r${i}`} x={fx + 114} y={y} w={58} h={24} label={`${p}${i + 1}`} c="b" fs={11} r={4} />);
  const link = (fx: number, ly: number, ry: number, k: string) => (
    <Arrow key={k} x1={fx + 78} y1={ly + 12} x2={fx + 114} y2={ry + 12} c="n" plain />
  );

  return (
    <Dg w={620} h={264} cap="One-to-one, one-to-many and many-to-many mappings between two entity sets">
      <Frame x={2} y={8} w={196} h={244} label="ONE-TO-ONE  1:1" c="n" />
      {L(2, [50, 92, 134], 'a')}
      {R(2, [50, 92, 134], 'b')}
      {[50, 92, 134].map((y) => link(2, y, y, `o${y}`))}
      <Txt x={100} y={200} fs={10.5} soft>
        Each a maps to at most
      </Txt>
      <Txt x={100} y={216} fs={10.5} soft>
        one b, and vice versa.
      </Txt>
      <Txt x={100} y={238} fs={10} c="a" bold>
        person ↔ passport
      </Txt>

      <Frame x={212} y={8} w={196} h={244} label="ONE-TO-MANY  1:N" c="n" />
      {L(212, [70, 134], 'a')}
      {R(212, [46, 88, 130, 172], 'b')}
      {link(212, 70, 46, 'p1')}
      {link(212, 70, 88, 'p2')}
      {link(212, 134, 130, 'p3')}
      {link(212, 134, 172, 'p4')}
      <Txt x={310} y={216} fs={10.5} soft>
        One a, many b — but each
      </Txt>
      <Txt x={310} y={232} fs={10.5} soft>
        b belongs to one a.
      </Txt>
      <Txt x={310} y={250} fs={10} c="a" bold>
        department → employees
      </Txt>

      <Frame x={422} y={8} w={196} h={244} label="MANY-TO-MANY  M:N" c="n" />
      {L(422, [70, 134], 'a')}
      {R(422, [46, 100, 154], 'b')}
      {link(422, 70, 46, 'q1')}
      {link(422, 70, 100, 'q2')}
      {link(422, 134, 100, 'q3')}
      {link(422, 134, 154, 'q4')}
      <Txt x={520} y={216} fs={10.5} soft>
        Any number on both sides.
      </Txt>
      <Txt x={520} y={232} fs={10.5} soft>
        Needs its own table later.
      </Txt>
      <Txt x={520} y={250} fs={10} c="a" bold>
        students ↔ courses
      </Txt>
    </Dg>
  );
}

/** Weak entity + identifying relationship + total participation. */
function WeakEntity() {
  return (
    <Dg w={580} h={206} cap="A weak entity has no key of its own and depends on an identifying relationship">
      <Box x={26} y={62} w={130} h={52} label="Employee" c="a" fs={13} r={3} />
      <Txt x={196} y={78} fs={12} bold c="n">
        1
      </Txt>
      {/* double line = total participation of the weak side */}
      <line x1={156} y1={84} x2={252} y2={84} stroke="var(--ink-faint)" strokeWidth="1.5" />
      <line x1={156} y1={92} x2={252} y2={92} stroke="var(--ink-faint)" strokeWidth="1.5" />
      <Dia cx={305} cy={88} rx={54} ry={28} label="has" c="c" weak />
      <Txt x={392} y={78} fs={12} bold c="n">
        N
      </Txt>
      <line x1={359} y1={84} x2={432} y2={84} stroke="var(--ink-faint)" strokeWidth="1.5" />
      <line x1={359} y1={92} x2={432} y2={92} stroke="var(--ink-faint)" strokeWidth="1.5" />
      <Box x={430} y={58} w={132} h={60} c="c" fs={13} r={3} ghost />
      <Box x={434} y={62} w={124} h={52} label="Dependent" c="c" fs={13} r={3} />
      <Arrow x1={496} y1={118} x2={496} y2={148} c="n" plain />
      <Ell cx={496} cy={172} rx={56} ry={22} label="d_name" c="b" keyAttr />
      <Txt x={496} y={16} fs={10.5} soft>
        double rectangle = weak entity · double diamond = identifying relationship
      </Txt>
      <Txt x={190} y={140} fs={10.5} soft>
        double line = total participation
      </Txt>
    </Dg>
  );
}

/** A complete small ER diagram. */
function CollegeEr() {
  return (
    <Dg w={660} h={450} cap="A complete ER diagram for a small college database">
      <Ell cx={62} cy={40} rx={40} ry={20} label="roll" c="b" keyAttr />
      <Ell cx={162} cy={40} rx={42} ry={20} label="name" c="b" />
      <Ell cx={266} cy={40} rx={40} ry={20} label="dob" c="b" />
      <Arrow x1={70} y1={58} x2={100} y2={110} c="n" plain />
      <Arrow x1={162} y1={60} x2={128} y2={110} c="n" plain />
      <Arrow x1={258} y1={57} x2={165} y2={110} c="n" plain />
      <Box x={60} y={110} w={130} h={50} label="STUDENT" c="a" fs={13} r={3} />

      <Arrow x1={190} y1={135} x2={276} y2={135} c="n" plain label="M" dy={-8} />
      <Dia cx={330} cy={135} rx={54} ry={28} label="enrolls" c="c" />
      <Arrow x1={384} y1={135} x2={460} y2={135} c="n" plain label="N" dy={-8} />
      <Arrow x1={330} y1={163} x2={330} y2={200} c="n" plain />
      <Ell cx={330} cy={222} rx={44} ry={20} label="grade" c="b" />

      <Ell cx={472} cy={40} rx={40} ry={20} label="cid" c="b" keyAttr />
      <Ell cx={578} cy={40} rx={44} ry={20} label="title" c="b" />
      <Arrow x1={478} y1={59} x2={500} y2={110} c="n" plain />
      <Arrow x1={572} y1={59} x2={552} y2={110} c="n" plain />
      <Box x={460} y={110} w={130} h={50} label="COURSE" c="a" fs={13} r={3} />

      <Box x={60} y={300} w={130} h={50} label="INSTRUCTOR" c="a" fs={12} r={3} />
      <Arrow x1={190} y1={325} x2={276} y2={325} c="n" plain label="1" dy={-8} />
      <Dia cx={330} cy={325} rx={54} ry={28} label="teaches" c="c" />
      <Arrow x1={384} y1={325} x2={525} y2={162} c="n" plain bend="h" label="N" dy={-8} dx={40} />
      <Ell cx={64} cy={412} rx={40} ry={20} label="iid" c="b" keyAttr />
      <Ell cx={172} cy={412} rx={46} ry={20} label="iname" c="b" />
      <Arrow x1={72} y1={394} x2={100} y2={352} c="n" plain />
      <Arrow x1={166} y1={393} x2={148} y2={352} c="n" plain />
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'er-model',
  num: 4,
  unit: 'Database Design',
  title: 'ER Model — Entities, Attributes & Relationships',
  blurb:
    'The whiteboard notation every database design starts from: entity types, the six kinds of attribute, cardinality ratios, participation and weak entities.',
  minutes: 16,
  tags: ['Very common', 'Diagram question'],

  sections: [
    {
      id: 'basics',
      heading: 'Entity, entity type, entity set',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The <b>Entity-Relationship model</b> is how you design a database <i>before</i> writing any tables. You
              draw the real-world things and how they connect, agree on it with everyone, and only then convert it to
              tables.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Entity</b> — one distinguishable real-world object. The student with roll number 101.
            </>,
            <>
              <b>Entity type</b> — the category itself, drawn as a rectangle. <code>STUDENT</code>.
            </>,
            <>
              <b>Entity set</b> — all the entities of that type present right now. Every student currently enrolled.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Entity <b>type</b> is the design (it goes in the diagram); entity <b>set</b> is the data (it lives in
              the database). It is the same schema-vs-instance distinction wearing different words, and interviewers
              like to test whether you noticed.
            </>
          ),
        },
      ],
    },

    {
      id: 'notation',
      heading: 'The symbols',
      blocks: [
        { k: 'diagram', el: <ErLegend />, caption: 'Learn these eight shapes and you can read any ER diagram in an exam.' },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Shape tells you the category: <b>rectangle = entity</b>, <b>diamond = relationship</b>,{' '}
              <b>ellipse = attribute</b>. Then the decoration tells you the variant: <b>doubled = weak or
              multivalued</b>, <b>dashed = derived</b>, <b>underlined = key</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'attributes',
      heading: 'The six kinds of attribute',
      blocks: [
        {
          k: 'table',
          head: ['Kind', 'Meaning', 'Example', 'Symbol'],
          rows: [
            ['Simple (atomic)', 'Cannot be broken down further', 'roll_no, age', 'Plain ellipse'],
            ['Composite', 'Made of smaller meaningful parts', 'name → first, middle, last', 'Ellipse with child ellipses'],
            ['Single-valued', 'Exactly one value per entity', 'date_of_birth', 'Plain ellipse'],
            ['Multivalued', 'Several values for one entity', 'phone_numbers', 'Double ellipse'],
            ['Derived', 'Computed from another attribute, not stored', 'age (from dob)', 'Dashed ellipse'],
            ['Key', 'Uniquely identifies the entity', 'roll_no', 'Underlined ellipse'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why store dob and derive age, rather than storing age?',
          text: (
            <>
              Because <code>age</code> goes stale every single day and would need a mass update; <code>dob</code>{' '}
              never changes. The general rule: <b>store the stable fact, derive the volatile one</b>. It is a small
              answer that makes you sound like you have designed a real schema.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>NULL</b> value is a fourth possibility worth naming: the attribute may be <i>not applicable</i>{' '}
              (a middle name that does not exist), <i>unknown</i> (a phone number that exists but nobody recorded), or{' '}
              <i>withheld</i>. Interviewers like to hear that NULL is not the same as zero or an empty string.
            </>
          ),
        },
      ],
    },

    {
      id: 'relationships',
      heading: 'Relationships and degree',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>relationship</b> is an association between entities, drawn as a diamond. The <b>degree</b> of a
              relationship is simply how many entity types take part in it.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Unary / recursive (degree 1)</b> — one entity type related to itself. An employee <i>manages</i>{' '}
              other employees.
            </>,
            <>
              <b>Binary (degree 2)</b> — two entity types. Student <i>enrolls in</i> Course. This is the overwhelming
              majority of real relationships.
            </>,
            <>
              <b>Ternary (degree 3)</b> — three entity types in one genuine relationship. Doctor <i>prescribes</i>{' '}
              Drug to Patient.
            </>,
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A relationship can carry its own attributes — the <b>grade</b> a student earned in a course belongs to
              neither the student nor the course, but to the pairing of the two. These are called{' '}
              <b>descriptive attributes</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'cardinality',
      heading: 'Cardinality ratios',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The <b>cardinality ratio</b> says how many entities on one side may be linked to entities on the other.
              This is the single most consequential decision in ER design, because it dictates how many tables you
              end up with.
            </>
          ),
        },
        { k: 'diagram', el: <Cardinality />, caption: 'Read the arrows as "may be associated with".' },
        {
          k: 'table',
          head: ['Ratio', 'Example', 'How it becomes tables'],
          rows: [
            ['1:1', 'Person ↔ Passport', 'Merge into one table, or put the foreign key on either side (prefer the total-participation side)'],
            ['1:N', 'Department → Employees', 'Put the foreign key on the N side. No extra table.'],
            ['M:N', 'Students ↔ Courses', 'Always needs a separate junction table holding both keys.'],
          ],
        },
        { k: 'h', text: 'Participation: total vs partial' },
        {
          k: 'ul',
          items: [
            <>
              <b>Total participation (double line)</b> — every entity in the set <i>must</i> take part. Every loan
              must belong to a customer. This becomes a <code>NOT NULL</code> constraint later.
            </>,
            <>
              <b>Partial participation (single line)</b> — participation is optional. Not every employee manages a
              department.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Cardinality and participation are <b>different questions</b>. Cardinality asks "<i>how many</i> can it
              be linked to?"; participation asks "<i>must</i> it be linked at all?". A relationship has both — for
              example 1:N with total participation on the N side.
            </>
          ),
        },
      ],
    },

    {
      id: 'weak',
      heading: 'Weak entities',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>weak entity</b> is one that cannot be identified by its own attributes alone. A{' '}
              <code>Dependent</code> named "Riya" means nothing until you know <i>whose</i> dependent she is.
            </>
          ),
        },
        { k: 'diagram', el: <WeakEntity />, caption: 'A weak entity, its owner, and the identifying relationship between them.' },
        {
          k: 'ul',
          items: [
            <>
              It is drawn as a <b>double rectangle</b>.
            </>,
            <>
              It connects to its owner through an <b>identifying relationship</b> — a <b>double diamond</b>.
            </>,
            <>
              It has a <b>partial key</b> (also called a discriminator), drawn with a <b>dashed underline</b>: unique
              only within one owner. Two different employees may each have a dependent called "Riya".
            </>,
            <>
              Its participation in the identifying relationship is always <b>total</b> — it cannot exist alone.
            </>,
            <>
              Its real primary key becomes <b>owner's key + partial key</b> once converted to a table.
            </>,
          ],
        },
      ],
    },

    {
      id: 'example',
      heading: 'Putting it together',
      blocks: [
        { k: 'diagram', el: <CollegeEr />, caption: 'STUDENT enrolls in COURSE (M:N, with grade as a descriptive attribute); INSTRUCTOR teaches COURSE (1:N).' },
        {
          k: 'steps',
          items: [
            { t: 'Find the nouns', d: 'Student, Course, Instructor — these become entity types.' },
            { t: 'Find the verbs', d: '"enrolls in", "teaches" — these become relationships.' },
            { t: 'Attach the facts', d: 'roll, name, dob belong to Student; cid, title to Course. Underline whatever identifies the entity.' },
            {
              t: 'Ask "how many?" on each side',
              d: 'A student takes many courses and a course has many students → M:N. An instructor teaches many courses but a course has one instructor → 1:N.',
            },
            {
              t: 'Ask "must it?"',
              d: 'Every course must have an instructor → total participation on the course side.',
            },
            {
              t: 'Park anything that belongs to the pair',
              d: 'grade depends on the (student, course) pair, so it hangs off the relationship, not off either entity.',
            },
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the ER model and why use it before creating tables?',
      a: (
        <>
          A high-level, implementation-independent notation for describing data as entities, attributes and
          relationships. You use it first because it is cheap to argue about a diagram and expensive to argue about a
          migrated production schema — and because it converts mechanically into tables afterwards.
        </>
      ),
    },
    {
      q: 'Difference between an entity type and an entity set?',
      a: (
        <>
          Entity type is the <b>definition</b> — the rectangle in the diagram, e.g. <code>STUDENT</code>. Entity set
          is the <b>collection of actual entities</b> of that type in the database right now. Type is schema, set is
          instance.
        </>
      ),
    },
    {
      q: 'What is a weak entity? Give an example.',
      a: (
        <>
          An entity that has no primary key of its own and depends on an owner entity for identification — e.g.{' '}
          <code>Dependent</code> of an <code>Employee</code>, or a <code>LoanPayment</code> of a <code>Loan</code>.
          It has a partial key, connects via an identifying relationship (double diamond), always has total
          participation, and its primary key becomes <b>owner key + partial key</b>.
        </>
      ),
    },
    {
      q: 'Difference between cardinality and participation?',
      a: (
        <>
          Cardinality is <b>how many</b> entities on the other side one entity can be linked to (1:1, 1:N, M:N).
          Participation is <b>whether the link is mandatory</b> (total, double line) or optional (partial, single
          line). They are independent — you specify both.
        </>
      ),
    },
    {
      q: 'What is a derived attribute? Why not just store it?',
      a: (
        <>
          One computed from other stored data — <code>age</code> from <code>dob</code>, or <code>total</code> from
          quantity × price. You do not store it because it would go stale and require mass updates; you store the
          stable underlying fact and compute the volatile one on read.
        </>
      ),
    },
    {
      q: 'What is a descriptive attribute?',
      a: (
        <>
          An attribute that belongs to the <b>relationship</b> rather than to either entity — like <code>grade</code>{' '}
          on <i>enrolls</i>, or <code>date_hired</code> on <i>works_for</i>. When the relationship becomes a table,
          the descriptive attribute becomes a column of that table.
        </>
      ),
    },
    {
      q: 'What is a recursive (unary) relationship?',
      a: (
        <>
          A relationship between an entity type and itself — <code>EMPLOYEE manages EMPLOYEE</code>. Each
          participation gets a <b>role name</b> ("manager", "subordinate") to keep the two ends apart, and it maps to
          a self-referencing foreign key in the table.
        </>
      ),
    },
    {
      q: 'When would you use a ternary relationship instead of three binary ones?',
      a: (
        <>
          When the fact genuinely involves all three entities at once and cannot be reconstructed from pairs. "Doctor
          prescribed Drug to Patient" is one fact — splitting it into doctor-drug, doctor-patient and drug-patient
          loses which drug went to which patient from which doctor.
        </>
      ),
    },
    {
      q: 'Can a relationship exist between more than two entity types?',
      a: (
        <>
          Yes — the number of participating entity types is the relationship's <b>degree</b>. Degree 1 is unary
          (recursive), 2 is binary, 3 is ternary, n is n-ary. Binary is by far the most common in practice.
        </>
      ),
    },
  ],
};

export default topic;
