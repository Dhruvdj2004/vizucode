import { Arrow, Box, Dg, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** The three anomalies, on one badly designed table. */
function Anomalies() {
  return (
    <Dg w={620} h={266} cap="Insert, update and delete anomalies caused by storing two facts in one table">
      <Rel
        x={16}
        y={44}
        title="STUDENT_COURSE"
        cols={['roll', 'sname', 'cid', 'cfee']}
        rows={[
          ['101', 'Riya', 'C1', '5000'],
          ['101', 'Riya', 'C2', '4000'],
          ['102', 'Arjun', 'C1', '5000'],
        ]}
        cw={[52, 62, 48, 56]}
        c="n"
        pk={[0, 2]}
        mark={{ '0,3': 'b', '2,3': 'b', '0,1': 'b', '1,1': 'b' }}
      />
      <Txt x={125} y={190} fs={10.5} soft>
        highlighted values are stored twice
      </Txt>
      <Txt x={125} y={208} fs={10.5} soft>
        — that redundancy causes all three
      </Txt>
      <Txt x={125} y={226} fs={10.5} soft>
        anomalies on the right
      </Txt>

      <Txt x={266} y={62} anchor="start" fs={11.5} bold c="a">
        INSERT anomaly
      </Txt>
      <Txt x={266} y={80} anchor="start" fs={10.5} soft>
        A new course with no students yet cannot be
      </Txt>
      <Txt x={266} y={96} anchor="start" fs={10.5} soft>
        stored — roll is part of the key and cannot be NULL.
      </Txt>

      <Txt x={266} y={128} anchor="start" fs={11.5} bold c="b">
        UPDATE anomaly
      </Txt>
      <Txt x={266} y={146} anchor="start" fs={10.5} soft>
        C1's fee lives in two rows. Change one and forget
      </Txt>
      <Txt x={266} y={162} anchor="start" fs={10.5} soft>
        the other, and the database now contradicts itself.
      </Txt>

      <Txt x={266} y={194} anchor="start" fs={11.5} bold c="c">
        DELETE anomaly
      </Txt>
      <Txt x={266} y={212} anchor="start" fs={10.5} soft>
        Remove Arjun's only enrolment and you also lose the
      </Txt>
      <Txt x={266} y={228} anchor="start" fs={10.5} soft>
        fact that course C1 costs 5000.
      </Txt>
    </Dg>
  );
}

/** The normalization ladder, with the rule applied at each rung. */
function Ladder() {
  const rung = (y: number, label: string, sub: string, c: 'n' | 'a' | 'b') => (
    <Box x={20} y={y} w={244} h={42} label={label} sub={sub} c={c} fs={13} />
  );
  const step = (y: number, text: string) => (
    <>
      <Arrow x1={142} y1={y} x2={142} y2={y + 26} c="c" />
      <Txt x={286} y={y + 18} anchor="start" fs={11} bold c="c">
        {text}
      </Txt>
    </>
  );
  return (
    <Dg w={600} h={330} cap="Each normal form removes one specific kind of dependency">
      {rung(10, 'UNF', 'repeating groups, non-atomic cells', 'n')}
      {step(52, 'make every value atomic')}
      {rung(80, '1NF', 'atomic values only', 'a')}
      {step(122, 'remove partial dependencies')}
      {rung(150, '2NF', 'no partial dependency', 'a')}
      {step(192, 'remove transitive dependencies')}
      {rung(220, '3NF', 'no transitive dependency', 'a')}
      {step(262, 'every determinant is a super key')}
      {rung(290, 'BCNF', 'strictest of the four', 'b')}
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'normal-forms',
  num: 12,
  unit: 'Normalization',
  title: 'Normalization — 1NF, 2NF, 3NF and BCNF',
  blurb:
    'The anomalies bad tables cause, the exact rule each normal form removes, how to decompose step by step, and the 3NF-vs-BCNF trade-off.',
  minutes: 18,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'why',
      heading: 'Why normalize',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Normalization</b> is the process of decomposing tables so that each one stores exactly{' '}
              <b>one kind of fact</b>. Redundancy disappears, and with it the three anomalies.
            </>
          ),
        },
        { k: 'diagram', el: <Anomalies />, caption: 'Student facts and course facts crammed into one table.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Insertion anomaly</b> — you cannot record one fact without also knowing an unrelated one.
            </>,
            <>
              <b>Update anomaly</b> — a fact stored in many rows must be updated in all of them, or the database
              becomes inconsistent.
            </>,
            <>
              <b>Deletion anomaly</b> — removing one fact silently destroys another.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              One sentence that covers the whole topic: <b>"a table should describe one thing, and every non-key
              column should depend on the key, the whole key, and nothing but the key."</b> That phrase encodes 1NF,
              2NF and 3NF in order.
            </>
          ),
        },
      ],
    },

    {
      id: 'ladder',
      heading: 'The ladder',
      blocks: [
        { k: 'diagram', el: <Ladder />, caption: 'Each form assumes the one above it. A table in 3NF is automatically in 2NF and 1NF.' },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Normal forms are <b>cumulative</b>. If asked "is this table in 3NF?" you must first satisfy 1NF and
              2NF. A table failing 2NF cannot be in 3NF, no matter how it looks.
            </>
          ),
        },
      ],
    },

    {
      id: 'first',
      heading: 'First Normal Form (1NF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Rule:</b> every attribute value is <b>atomic</b> — no lists, no sets, no repeating groups, no
              nested tables. Each cell holds exactly one indivisible value.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Violation and fix',
          code: `NOT IN 1NF                            IN 1NF
STUDENT                               STUDENT               STUDENT_PHONE
┌──────┬───────┬────────────┐         ┌──────┬───────┐      ┌──────┬───────┐
│ roll │ name  │ phones     │         │ roll │ name  │      │ roll │ phone │
├──────┼───────┼────────────┤         ├──────┼───────┤      ├──────┼───────┤
│ 101  │ Riya  │ 999, 888   │  ✗      │ 101  │ Riya  │      │ 101  │ 999   │
│ 102  │ Arjun │ 777        │         │ 102  │ Arjun │      │ 101  │ 888   │
└──────┴───────┴────────────┘         └──────┴───────┘      │ 102  │ 777   │
                                                            └──────┴───────┘
                                                            PK = (roll, phone)`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Do <b>not</b> "fix" 1NF by adding columns <code>phone1, phone2, phone3</code>. That is still a
              repeating group: it caps the number of phones arbitrarily, fills the table with NULLs, and makes
              "find the student with phone 888" require searching three columns.
            </>
          ),
        },
      ],
    },

    {
      id: 'second',
      heading: 'Second Normal Form (2NF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Rule:</b> in 1NF, and no <b>non-prime attribute</b> is partially dependent on any candidate key —
              every non-prime attribute must depend on the <b>whole</b> key, not a part of it.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              2NF can only be violated when the candidate key is <b>composite</b>. If every candidate key is a
              single attribute, a 1NF table is automatically in 2NF — a fast way to answer half of these questions.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Violation and fix',
          code: `ENROLL( roll, cid, sname, grade )       PK = (roll, cid)

FDs   (roll, cid) → grade      ✓ full dependency
      roll        → sname      ✗ PARTIAL — sname needs only half the key

Problem: Riya's name is repeated in every row she has, and cannot be
stored at all until she enrols in something.

Decompose by pulling out the partial dependency:

    STUDENT( roll, sname )              PK = roll
    ENROLL ( roll, cid, grade )         PK = (roll, cid),  FK roll → STUDENT

Both are now in 2NF: every non-prime attribute depends on its full key.`,
        },
      ],
    },

    {
      id: 'third',
      heading: 'Third Normal Form (3NF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Rule:</b> in 2NF, and no non-prime attribute is <b>transitively</b> dependent on a candidate key.
              Equivalently, for every non-trivial FD <code>X → A</code>, either <b>X is a super key</b> or{' '}
              <b>A is a prime attribute</b>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Violation and fix',
          code: `STUDENT( roll, sname, dept, hod )       PK = roll

FDs   roll → sname
      roll → dept
      dept → hod              ✗ dept is not a super key, hod is not prime
                                so roll → dept → hod is TRANSITIVE

Problem: the CSE head-of-department is repeated for every CSE student.
Change the HOD and you must update hundreds of rows.

Decompose along the offending FD:

    STUDENT( roll, sname, dept )        PK = roll,  FK dept → DEPT
    DEPT   ( dept, hod )                PK = dept

Now the HOD is stored exactly once.`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The "or A is prime" escape clause',
          text: (
            <>
              This second half of the 3NF definition is what makes 3NF weaker than BCNF, and it is the detail that
              separates a memorised answer from an understood one. If the dependent attribute is part of some
              candidate key, 3NF tolerates the dependency; BCNF does not.
            </>
          ),
        },
      ],
    },

    {
      id: 'bcnf',
      heading: 'Boyce-Codd Normal Form (BCNF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Rule:</b> for every non-trivial FD <code>X → Y</code>, <b>X must be a super key</b>. No exceptions,
              no escape clause. BCNF is sometimes called 3.5NF.
            </>
          ),
        },
        {
          k: 'code',
          title: 'In 3NF but not in BCNF',
          code: `STUDENT_TEACHER( student, subject, teacher )

Rules of the world
    a student takes a subject from exactly one teacher   (student, subject) → teacher
    each teacher teaches exactly one subject             teacher → subject

Candidate keys : (student, subject)  and  (student, teacher)
Prime attrs    : student, subject, teacher       Non-prime : none!

3NF?    Yes — there are no non-prime attributes at all, so no
        non-prime attribute can depend on anything wrongly.

BCNF?   No — the FD  teacher → subject  has a determinant (teacher)
        that is NOT a super key.

Consequence: the fact "Dr Rao teaches DBMS" is repeated once per student.

Decompose
    TEACHES  ( teacher, subject )        PK = teacher
    STUDIES  ( student, teacher )        PK = (student, teacher)

Both are in BCNF — but the FD (student, subject) → teacher can no longer
be checked inside a single table. The decomposition is lossless but NOT
dependency-preserving. That trade-off is inherent to BCNF.`,
        },
        {
          k: 'table',
          head: ['', '3NF', 'BCNF'],
          rows: [
            ['Condition on X → A', 'X is a super key OR A is prime', 'X must be a super key — always'],
            ['Strictness', 'Weaker', 'Stronger'],
            ['Lossless decomposition', 'Always achievable', 'Always achievable'],
            ['Dependency preserving', 'Always achievable', 'Not always achievable'],
            ['Redundancy left behind', 'A little, involving prime attributes', 'Essentially none from FDs'],
            ['Used in practice', 'Very common — the usual target', 'Preferred when it costs no dependency'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The one-line answer to "3NF vs BCNF"',
          text: (
            <>
              "3NF allows a non-super-key determinant as long as the dependent attribute is prime; BCNF does not.
              3NF can always be achieved losslessly <b>and</b> dependency-preservingly, BCNF only guarantees
              lossless." That sentence answers the question completely.
            </>
          ),
        },
      ],
    },

    {
      id: 'procedure',
      heading: 'How to answer "what is the highest normal form?"',
      blocks: [
        {
          k: 'steps',
          items: [
            { t: 'Find all candidate keys', d: 'Use attribute closure. Everything else depends on getting this right.' },
            { t: 'Mark prime and non-prime attributes', d: 'Prime = in some candidate key.' },
            { t: 'Check 1NF', d: 'Are all values atomic? In an exam, assume yes unless a cell obviously holds a list.' },
            {
              t: 'Check BCNF first — it is fastest',
              d: 'Scan every FD. If every determinant is a super key, the answer is BCNF and you are finished.',
            },
            {
              t: 'If BCNF fails, check 3NF',
              d: 'For each offending FD X → A, is A prime? If yes for all of them, the answer is 3NF.',
            },
            {
              t: 'If 3NF fails, check 2NF',
              d: 'Is any non-prime attribute determined by a proper subset of a candidate key? If not, the answer is 2NF; otherwise 1NF.',
            },
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Working <b>top-down</b> (BCNF first) is much faster than climbing from 1NF, because a single pass over
              the FDs usually settles it. Most exam relations turn out to be in 2NF or 3NF.
            </>
          ),
        },
      ],
    },

    {
      id: 'denormalization',
      heading: 'Denormalization',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Normalization optimises for <b>write correctness</b>; it costs <b>read joins</b>.{' '}
              <b>Denormalization</b> is the deliberate reintroduction of redundancy to avoid those joins — and it is
              a real engineering decision, not a mistake.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            'Storing a customer name alongside an order so the order list needs no join.',
            'Keeping a running order_total instead of summing line items on every read.',
            'Materialised views and reporting/OLAP tables, which are denormalized on purpose.',
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The cost is that every duplicated value must now be kept in sync by triggers or application code, and
              every anomaly you normalized away comes back. Normalize first; denormalize only where a measured read
              path demands it.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is normalization and why do it?',
      a: (
        <>
          Decomposing relations to remove redundancy, so that each table stores one kind of fact. It eliminates
          insertion, update and deletion anomalies and keeps the database internally consistent.
        </>
      ),
    },
    {
      q: 'Explain the three anomalies with one example.',
      a: (
        <>
          In <code>STUDENT_COURSE(roll, sname, cid, cfee)</code>: you cannot add a course with no students
          (insertion), changing a course fee means updating every enrolment row (update), and deleting the last
          enrolment for a course erases its fee entirely (deletion).
        </>
      ),
    },
    {
      q: 'What does 1NF require?',
      a: (
        <>
          Every attribute value must be <b>atomic</b> — no lists, sets or repeating groups in a cell, and no
          repeating column groups like <code>phone1, phone2, phone3</code>. Multivalued data moves to its own
          table.
        </>
      ),
    },
    {
      q: 'What is 2NF?',
      a: (
        <>
          1NF plus no <b>partial dependency</b>: no non-prime attribute may depend on only part of a candidate key.
          It can only be violated when a candidate key is composite — with single-attribute keys, 1NF implies 2NF.
        </>
      ),
    },
    {
      q: 'What is 3NF?',
      a: (
        <>
          2NF plus no <b>transitive dependency</b> of a non-prime attribute on a candidate key. Formally: for every
          non-trivial <code>X → A</code>, either X is a super key or A is a prime attribute.
        </>
      ),
    },
    {
      q: 'What is BCNF and how does it differ from 3NF?',
      a: (
        <>
          BCNF requires that for <b>every</b> non-trivial FD <code>X → Y</code>, X is a super key — dropping 3NF's
          "or A is prime" exception. Every BCNF relation is in 3NF, but not the reverse. BCNF removes more
          redundancy but a BCNF decomposition may fail to preserve dependencies.
        </>
      ),
    },
    {
      q: 'Give a relation that is in 3NF but not in BCNF.',
      a: (
        <>
          <code>STUDENT_TEACHER(student, subject, teacher)</code> with{' '}
          <code>(student, subject) → teacher</code> and <code>teacher → subject</code>. Candidate keys are
          (student, subject) and (student, teacher), so <b>every</b> attribute is prime and 3NF is satisfied
          vacuously. But <code>teacher → subject</code> has a non-super-key determinant, so BCNF fails.
        </>
      ),
    },
    {
      q: 'Is a relation with only two attributes always in BCNF?',
      a: (
        <>
          Yes. With <code>R(A, B)</code> the only possible non-trivial FDs are <code>A → B</code> and{' '}
          <code>B → A</code>, and in either case the determinant is a super key. A nice fact to have ready.
        </>
      ),
    },
    {
      q: 'Can normalization hurt performance?',
      a: (
        <>
          Yes — more tables means more joins on read. That is exactly why denormalization exists: read-heavy paths,
          reporting tables and materialised views deliberately reintroduce redundancy, accepting the maintenance
          cost in exchange for fewer joins.
        </>
      ),
    },
    {
      q: 'How would you determine the highest normal form of a given relation?',
      a: (
        <>
          Find all candidate keys via attribute closure, mark prime attributes, then test <b>BCNF first</b> — if
          every determinant is a super key you are done. Otherwise check whether each offending dependent attribute
          is prime (3NF), then check for partial dependencies (2NF). Working downward from BCNF is much faster than
          climbing up from 1NF.
        </>
      ),
    },
  ],
};

export default topic;
