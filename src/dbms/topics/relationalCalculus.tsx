import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Procedural pipeline vs declarative description. */
function ProceduralVsDeclarative() {
  return (
    <Dg w={608} h={206} cap="Algebra spells out the steps; calculus describes the answer">
      <Frame x={2} y={8} w={292} h={188} label="PROCEDURAL — algebra" c="a" />
      <Box x={30} y={44} w={236} h={32} label="STUDENT" c="n" fs={11} />
      <Arrow x1={148} y1={76} x2={148} y2={94} c="a" />
      <Box x={30} y={96} w={236} h={32} label="σ dept = 'CSE'" c="a" fs={11} />
      <Arrow x1={148} y1={128} x2={148} y2={146} c="a" />
      <Box x={30} y={148} w={236} h={32} label="π name" c="a" fs={11} />

      <Frame x={314} y={8} w={292} h={188} label="DECLARATIVE — calculus" c="b" />
      <Box x={336} y={62} w={250} h={56} label="{ t.name | STUDENT(t)" sub="∧ t.dept = 'CSE' }" c="b" fs={11.5} />
      <Txt x={461} y={148} fs={10.5} soft>
        you state what the answer is;
      </Txt>
      <Txt x={461} y={166} fs={10.5} soft>
        the DBMS decides the steps
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'relational-calculus',
  num: 10,
  unit: 'Relational Theory',
  title: 'Relational Calculus (TRC & DRC)',
  blurb:
    'The declarative half of relational theory — tuple and domain calculus, safe expressions, and why algebra and calculus are exactly as powerful as each other.',
  minutes: 9,
  tags: ['Theory question'],

  sections: [
    {
      id: 'idea',
      heading: 'Procedural vs declarative',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Relational algebra tells the system <b>how</b> to compute the answer, one operation at a time.
              Relational calculus describes <b>what</b> the answer looks like and leaves the how entirely to the
              DBMS. It is based on first-order predicate logic.
            </>
          ),
        },
        { k: 'diagram', el: <ProceduralVsDeclarative />, caption: 'Both expressions return the same relation.' },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              SQL is closer in spirit to <b>calculus</b> than to algebra — you describe the result set, not the
              access path. The optimizer then translates it into an algebra-like plan. That is exactly why both
              formalisms are worth knowing.
            </>
          ),
        },
      ],
    },

    {
      id: 'trc',
      heading: 'Tuple Relational Calculus (TRC)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              In TRC the variables range over <b>tuples</b>. The general form is:
            </>
          ),
        },
        {
          k: 'code',
          title: 'TRC form',
          code: `{ t | P(t) }

  t     a tuple variable
  P(t)  a predicate — the condition every result tuple must satisfy

Read as: "the set of all tuples t such that P(t) is true."`,
        },
        {
          k: 'code',
          title: 'Worked examples',
          code: `STUDENT(roll, name, dept, cgpa)      ENROLLS(roll, cid)

1. All students in CSE
   { t | t ∈ STUDENT ∧ t.dept = 'CSE' }

2. Names of students with cgpa above 8.5
   { t.name | t ∈ STUDENT ∧ t.cgpa > 8.5 }

3. Students who are enrolled in at least one course      ← ∃ "there exists"
   { t | t ∈ STUDENT ∧ ∃ e ( e ∈ ENROLLS ∧ e.roll = t.roll ) }

4. Students enrolled in EVERY course                      ← ∀ "for all"
   { t | t ∈ STUDENT ∧ ∀ c ( c ∈ COURSE →
           ∃ e ( e ∈ ENROLLS ∧ e.roll = t.roll ∧ e.cid = c.cid ) ) }

5. Students NOT enrolled in any course
   { t | t ∈ STUDENT ∧ ¬ ∃ e ( e ∈ ENROLLS ∧ e.roll = t.roll ) }`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>∃ (exists)</b> maps to "at least one" — the same idea as an ordinary join.
            </>,
            <>
              <b>∀ (for all)</b> maps to "every" — the same idea as division in algebra.
            </>,
            <>
              <b>¬∃</b> maps to "none" — an anti-join.
            </>,
            <>
              Remember the logical identity <code>∀x P(x) ≡ ¬∃x ¬P(x)</code>. It is how a "for all" question gets
              rewritten as a double negation, which is exactly the double <code>NOT EXISTS</code> trick.
            </>,
          ],
        },
      ],
    },

    {
      id: 'drc',
      heading: 'Domain Relational Calculus (DRC)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Same idea, but the variables range over <b>attribute values (domains)</b> instead of whole tuples. You
              list one variable per column.
            </>
          ),
        },
        {
          k: 'code',
          title: 'DRC form and examples',
          code: `{ < x1, x2, …, xn > | P(x1, x2, …, xn) }

STUDENT(roll, name, dept, cgpa)

1. All students in CSE
   { <r, n, d, c> | <r, n, d, c> ∈ STUDENT ∧ d = 'CSE' }

2. Names of students with cgpa above 8.5
   { <n> | ∃ r, d, c ( <r, n, d, c> ∈ STUDENT ∧ c > 8.5 ) }

3. Students enrolled in at least one course
   { <r, n> | ∃ d, c ( <r, n, d, c> ∈ STUDENT )
              ∧ ∃ cid ( <r, cid> ∈ ENROLLS ) }`,
        },
        {
          k: 'table',
          head: ['', 'TRC', 'DRC'],
          rows: [
            ['Variables range over', 'Whole tuples', 'Individual attribute values'],
            ['Notation', '{ t | P(t) }', '{ <x1,…,xn> | P(x1,…,xn) }'],
            ['Refer to a column as', 't.name', 'a named domain variable'],
            ['Verbosity', 'Shorter — one variable per relation', 'Longer — one variable per attribute'],
            ['Influenced', 'SQL', 'QBE (Query By Example)'],
            ['Expressive power', 'Identical', 'Identical'],
          ],
        },
      ],
    },

    {
      id: 'safety',
      heading: 'Safe expressions',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Calculus has one dangerous property algebra does not: you can write an expression whose answer is{' '}
              <b>infinite</b>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'An unsafe expression',
          code: `{ t | ¬ ( t ∈ STUDENT ) }

"every tuple that is not a student" — that includes every tuple
that could ever exist, over every possible domain. Infinite.`,
        },
        {
          k: 'p',
          text: (
            <>
              An expression is <b>safe</b> if every tuple in its result is built from values that appear in the{' '}
              <b>domain of the expression</b> — the finite set of values occurring in the relations named in it or
              written as constants. Real query languages only allow safe expressions, which is why{' '}
              <code>NOT</code> in SQL is always evaluated against a specific table rather than against "everything
              else".
            </>
          ),
        },
      ],
    },

    {
      id: 'equivalence',
      heading: 'Algebra, calculus and relational completeness',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Codd's theorem</b>: relational algebra, safe tuple calculus and safe domain calculus are{' '}
              <b>exactly equivalent in expressive power</b>. Anything you can write in one, you can write in the
              others.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A language is called <b>relationally complete</b> if it can express every query relational algebra
              can. SQL is relationally complete — and then goes beyond it, with aggregation, ordering, recursion and
              duplicate handling that pure algebra has no equivalent for.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              If asked "which is more powerful, algebra or calculus?" the answer is <b>neither</b> — they are
              equivalent. They differ in <i>style</i> (procedural vs declarative), not in power. A confident
              "equivalent, by Codd's theorem" is the whole answer.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between relational algebra and relational calculus?',
      a: (
        <>
          Algebra is <b>procedural</b> — you specify the sequence of operations. Calculus is <b>declarative</b> —
          you describe the properties the result must satisfy and leave the evaluation strategy to the DBMS. They
          are equally expressive.
        </>
      ),
    },
    {
      q: 'Difference between TRC and DRC?',
      a: (
        <>
          In <b>tuple</b> relational calculus the variables range over whole tuples (<code>t.name</code>); in{' '}
          <b>domain</b> relational calculus they range over individual attribute values, so you write one variable
          per column. Same expressive power; TRC inspired SQL, DRC inspired QBE.
        </>
      ),
    },
    {
      q: 'What is a safe expression and why does it matter?',
      a: (
        <>
          One whose result contains only values drawn from the finite domain of the expression — the values
          appearing in the referenced relations or written as constants. It matters because unsafe expressions like{' '}
          <code>{'{ t | ¬(t ∈ R) }'}</code> denote infinite results, which no system can materialise. Real query
          languages permit only safe expressions.
        </>
      ),
    },
    {
      q: 'What does "relationally complete" mean?',
      a: (
        <>
          A query language is relationally complete if it can express every query expressible in relational algebra.
          SQL is relationally complete and strictly exceeds it, with aggregation, ordering, recursive queries and
          multiset semantics.
        </>
      ),
    },
    {
      q: 'How do you express "students enrolled in every course" in TRC?',
      a: (
        <>
          With a universal quantifier:{' '}
          <code>
            {'{ t | t ∈ STUDENT ∧ ∀c ( c ∈ COURSE → ∃e ( e ∈ ENROLLS ∧ e.roll = t.roll ∧ e.cid = c.cid ) ) }'}
          </code>
          . The algebra equivalent is division, and the SQL equivalent is the double <code>NOT EXISTS</code>{' '}
          pattern.
        </>
      ),
    },
    {
      q: 'Which is more powerful, algebra or calculus?',
      a: (
        <>
          Neither — by <b>Codd's theorem</b> relational algebra, safe TRC and safe DRC are exactly equivalent in
          expressive power. They differ only in style.
        </>
      ),
    },
    {
      q: 'How does ∀ relate to ∃?',
      a: (
        <>
          By the identity <code>∀x P(x) ≡ ¬∃x ¬P(x)</code>. This is why "students who took all courses" is written
          in practice as "students for whom there is no course they did not take" — the double-negation pattern.
        </>
      ),
    },
  ],
};

export default topic;
