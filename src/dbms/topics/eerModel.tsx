import { Arrow, Box, Dg, Dia, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** ISA hierarchy: one superclass, three subclasses. */
function IsaHierarchy() {
  return (
    <Dg w={600} h={296} cap="An ISA hierarchy: EMPLOYEE specialised into full-time, part-time and contract">
      <Box x={230} y={16} w={140} h={52} label="EMPLOYEE" sub="eid, name, salary" c="a" fs={13} r={3} />
      <Arrow x1={300} y1={68} x2={300} y2={100} c="n" plain />
      <polygon
        points="300,100 348,148 252,148"
        fill="var(--accent-3-soft)"
        stroke="var(--accent-3)"
        strokeWidth="1.5"
      />
      <Txt x={300} y={140} fs={11} bold c="c">
        ISA
      </Txt>
      <Arrow x1={300} y1={148} x2={300} y2={174} c="n" plain />
      <line x1={150} y1={174} x2={450} y2={174} stroke="var(--ink-faint)" strokeWidth="1.5" />
      {[150, 300, 450].map((x) => (
        <Arrow key={x} x1={x} y1={174} x2={x} y2={202} c="n" plain />
      ))}
      <Box x={85} y={202} w={130} h={54} label="Full-time" sub="pension_id" c="c" fs={12} r={3} />
      <Box x={235} y={202} w={130} h={54} label="Part-time" sub="hours/week" c="c" fs={12} r={3} />
      <Box x={385} y={202} w={130} h={54} label="Contract" sub="end_date" c="c" fs={12} r={3} />
      <Txt x={300} y={282} fs={10.5} soft>
        every subclass inherits eid, name, salary — and adds its own attributes
      </Txt>
    </Dg>
  );
}

/** Disjoint vs overlapping specialisation. */
function DisjointOverlap() {
  const panel = (fx: number, letter: string, title: string, sup: string, a: string, b: string, note: string, c: 'a' | 'b') => (
    <>
      <Frame x={fx} y={8} w={292} h={216} label={title} c={c} />
      <Box x={fx + 88} y={34} w={116} h={40} label={sup} c={c} fs={12} r={3} />
      <Arrow x1={fx + 146} y1={74} x2={fx + 146} y2={88} c="n" plain />
      <circle cx={fx + 146} cy={102} r={14} fill="var(--surface)" stroke="var(--ink-faint)" strokeWidth="1.5" />
      <Txt x={fx + 146} y={107} fs={12} bold c={c}>
        {letter}
      </Txt>
      <Arrow x1={fx + 146} y1={116} x2={fx + 146} y2={130} c="n" plain />
      <line x1={fx + 84} y1={130} x2={fx + 208} y2={130} stroke="var(--ink-faint)" strokeWidth="1.5" />
      <Arrow x1={fx + 84} y1={130} x2={fx + 84} y2={146} c="n" plain />
      <Arrow x1={fx + 208} y1={130} x2={fx + 208} y2={146} c="n" plain />
      <Box x={fx + 28} y={146} w={112} h={44} label={a} c="c" fs={12} r={3} />
      <Box x={fx + 152} y={146} w={112} h={44} label={b} c="c" fs={12} r={3} />
      <Txt x={fx + 146} y={210} fs={10.5} soft>
        {note}
      </Txt>
    </>
  );

  return (
    <Dg w={608} h={234} cap="Disjoint means a member belongs to exactly one subclass; overlapping allows several">
      {panel(2, 'd', 'DISJOINT  (d)', 'VEHICLE', 'Car', 'Truck', 'a vehicle is a car OR a truck', 'a')}
      {panel(314, 'o', 'OVERLAPPING  (o)', 'PERSON', 'Student', 'Employee', 'a person can be both at once', 'b')}
    </Dg>
  );
}

/** Aggregation: a relationship treated as a higher-level entity. */
function Aggregation() {
  return (
    <Dg w={660} h={240} cap="Aggregation lets a relationship itself participate in another relationship">
      <rect
        x={14}
        y={36}
        width={400}
        height={152}
        rx={12}
        fill="none"
        stroke="var(--accent-3)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      <Txt x={214} y={26} fs={10.5} bold c="c">
        AGGREGATION — treat all of this as one entity
      </Txt>
      <Box x={34} y={66} w={110} h={48} label="EMPLOYEE" c="a" fs={12} r={3} />
      <Arrow x1={144} y1={90} x2={164} y2={90} c="n" plain />
      <Dia cx={214} cy={90} rx={50} ry={26} label="works_on" c="c" />
      <Arrow x1={264} y1={90} x2={294} y2={90} c="n" plain />
      <Box x={294} y={66} w={100} h={48} label="PROJECT" c="a" fs={12} r={3} />
      <Txt x={214} y={166} fs={10.5} soft>
        "employee E works on project P"
      </Txt>

      <Arrow x1={414} y1={112} x2={446} y2={112} c="n" plain />
      <Dia cx={498} cy={112} rx={50} ry={26} label="monitors" c="c" />
      <Arrow x1={548} y1={112} x2={568} y2={112} c="n" plain />
      <Box x={568} y={88} w={86} h={48} label="MANAGER" c="a" fs={11} r={3} />
      <Txt x={498} y={186} fs={10.5} soft>
        "manager M monitors that
      </Txt>
      <Txt x={498} y={202} fs={10.5} soft>
        whole assignment"
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'eer-model',
  num: 5,
  unit: 'Database Design',
  title: 'Enhanced ER — Generalization, Specialization & Aggregation',
  blurb:
    'The extras added on top of plain ER: ISA hierarchies, inheritance, disjoint vs overlapping constraints, and how to relate a relationship to another entity.',
  minutes: 11,
  tags: ['Diagram question'],

  sections: [
    {
      id: 'why',
      heading: 'Why plain ER was not enough',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Basic ER handles "things and links between things" well. It struggles with two situations that come up
              constantly in real designs: <b>one entity type that has meaningful sub-kinds</b>, and{' '}
              <b>a relationship that itself needs to be related to something</b>. The Enhanced ER (EER) model adds
              exactly these.
            </>
          ),
        },
      ],
    },

    {
      id: 'spec-gen',
      heading: 'Specialization and generalization',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              These are the same relationship viewed from opposite ends, which is why they get confused so often.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Specialization', 'Generalization'],
          rows: [
            ['Direction', 'Top-down', 'Bottom-up'],
            [
              'You start with',
              'One general entity type you already have',
              'Several specific entity types you already have',
            ],
            [
              'You produce',
              'Sub-types that share the general one',
              'A common super-type holding what they share',
            ],
            [
              'Example',
              'EMPLOYEE → full-time, part-time, contract',
              'Car and Truck → VEHICLE',
            ],
            ['Driving question', '"What kinds of these are there?"', '"What do these have in common?"'],
          ],
        },
        { k: 'diagram', el: <IsaHierarchy />, caption: 'The triangle is the ISA symbol — read it as "Full-time IS A Employee".' },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The <b>result is identical</b> — an ISA hierarchy. Only the thought process differs. If asked to
              distinguish them, lead with "specialization is top-down, generalization is bottom-up; both produce the
              same ISA hierarchy."
            </>
          ),
        },
      ],
    },

    {
      id: 'inheritance',
      heading: 'Attribute and relationship inheritance',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Every subclass <b>inherits all attributes</b> of its superclass. <code>Full-time</code> automatically
              has <code>eid</code>, <code>name</code> and <code>salary</code>.
            </>,
            <>
              It also inherits the superclass's <b>key</b> — subclasses do not get a new primary key, they reuse the
              superclass key.
            </>,
            <>
              It inherits every <b>relationship</b> the superclass participates in. If EMPLOYEE works for a
              DEPARTMENT, so does every subclass.
            </>,
            <>
              A subclass may then add its own <b>local attributes</b> and its own relationships.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              A subclass entity is <b>not a separate entity</b> from its superclass entity — it is the{' '}
              <b>same real-world object</b> described in more detail. Employee 101 and Full-time-employee 101 are one
              person, not two.
            </>
          ),
        },
      ],
    },

    {
      id: 'constraints',
      heading: 'The two constraints on a specialization',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Every ISA hierarchy is labelled with two independent constraints, giving four possible combinations.
              This is a favourite exam question.
            </>
          ),
        },
        { k: 'h', text: '1. Disjointness — can one entity be in two subclasses?' },
        { k: 'diagram', el: <DisjointOverlap />, caption: 'The circle carries a "d" for disjoint or an "o" for overlapping.' },
        { k: 'h', text: '2. Completeness — must every superclass entity be in some subclass?' },
        {
          k: 'ul',
          items: [
            <>
              <b>Total (double line to the ISA triangle)</b> — every employee must be one of full-time, part-time or
              contract. No plain employees allowed.
            </>,
            <>
              <b>Partial (single line)</b> — an employee may belong to no subclass at all.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['Combination', 'Means', 'Example'],
          rows: [
            ['Disjoint + Total', 'Exactly one subclass, always', 'Every vehicle is a car or a truck, never both'],
            ['Disjoint + Partial', 'At most one subclass', 'Some employees are managers, nobody is two kinds of manager'],
            ['Overlapping + Total', 'At least one subclass, possibly several', 'Every person on campus is a student, staff, or both'],
            ['Overlapping + Partial', 'Any number, including none', 'A person may be a student, an employee, both, or neither'],
          ],
        },
      ],
    },

    {
      id: 'aggregation',
      heading: 'Aggregation',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              ER has one hard rule: a relationship connects <b>entities</b>. So what do you do when you need a
              relationship <i>to a relationship</i>?
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Say an employee works on a project, and a manager <b>monitors that particular assignment</b> — not the
              employee in general, and not the project in general, but the pairing. <b>Aggregation</b> is the trick:
              you draw a box around the whole relationship and treat it as a single higher-level entity that other
              relationships may attach to.
            </>
          ),
        },
        { k: 'diagram', el: <Aggregation />, caption: 'The dashed box turns "works_on" into something a relationship can point at.' },
        {
          k: 'note',
          tone: 'warn',
          title: 'Why not just make it ternary?',
          text: (
            <>
              A ternary <code>(Employee, Project, Manager)</code> would claim all three are needed for the fact to
              exist — it cannot record an assignment that has no manager yet, and it duplicates the employee-project
              pair for every manager. Aggregation keeps <i>assignment</i> as a fact in its own right and makes
              monitoring optional on top of it.
            </>
          ),
        },
      ],
    },

    {
      id: 'category',
      heading: 'Union types (categories)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              One more EER construct, worth a sentence in an interview. A <b>category</b> (or union type) is a
              subclass whose members come from <b>several different superclasses</b>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Example: <code>OWNER</code> of a vehicle may be a <code>PERSON</code>, a <code>BANK</code> or a{' '}
              <code>COMPANY</code>. It is drawn with a circle marked <b>∪</b>. Note the difference from a normal ISA:
              in a shared subclass an entity must belong to <b>all</b> superclasses; in a category it belongs to{' '}
              <b>one of</b> them.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between specialization and generalization?',
      a: (
        <>
          Specialization is <b>top-down</b>: you start with a general entity type and identify sub-types.
          Generalization is <b>bottom-up</b>: you start with several specific types and factor out what they share
          into a super-type. Both produce the same ISA hierarchy — only the design direction differs.
        </>
      ),
    },
    {
      q: 'What does a subclass inherit?',
      a: (
        <>
          All attributes of the superclass, the superclass's <b>key</b>, and every relationship the superclass
          participates in. It may then add its own local attributes and relationships.
        </>
      ),
    },
    {
      q: 'Disjoint vs overlapping specialization?',
      a: (
        <>
          <b>Disjoint (d)</b>: an entity may belong to at most one subclass — a vehicle is a car or a truck, never
          both. <b>Overlapping (o)</b>: an entity may belong to several — a person can be both a student and an
          employee.
        </>
      ),
    },
    {
      q: 'Total vs partial specialization?',
      a: (
        <>
          <b>Total</b> (double line): every superclass entity must belong to at least one subclass.{' '}
          <b>Partial</b> (single line): an entity may belong to none. This is independent of disjointness, so there
          are four valid combinations.
        </>
      ),
    },
    {
      q: 'What is aggregation and when do you need it?',
      a: (
        <>
          Treating an entire relationship (together with its participating entities) as a single higher-level entity,
          so that another relationship can connect to it. You need it when a relationship must relate to an entity —
          e.g. a manager monitors a specific employee-project assignment.
        </>
      ),
    },
    {
      q: 'Aggregation vs a ternary relationship?',
      a: (
        <>
          A ternary relationship says all three entities are required for the fact to exist at all. Aggregation keeps
          the inner relationship as an independent fact and layers an optional second relationship on top. If the
          assignment is meaningful without a manager, use aggregation.
        </>
      ),
    },
    {
      q: 'How do you convert an ISA hierarchy into tables?',
      a: (
        <>
          Three standard options: <b>(1)</b> one table per superclass and per subclass, subclass tables holding the
          inherited key plus local attributes; <b>(2)</b> tables only for the subclasses, each repeating the
          superclass attributes — only valid when the specialization is total and disjoint; <b>(3)</b> a single
          table with all attributes plus a type discriminator column, which is simple and join-free but full of
          NULLs.
        </>
      ),
    },
    {
      q: 'What is a category / union type?',
      a: (
        <>
          A subclass whose members are drawn from <b>several distinct superclasses</b> — an <code>OWNER</code> that
          may be a Person, Bank or Company. Marked with ∪. Unlike a shared subclass (where an entity must be in{' '}
          <i>all</i> superclasses), a category member belongs to exactly <i>one</i> of them.
        </>
      ),
    },
  ],
};

export default topic;
