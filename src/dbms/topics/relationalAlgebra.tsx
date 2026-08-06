import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** σ picks rows, π picks columns. */
function SelectProject() {
  return (
    <Dg w={620} h={276} cap="Selection keeps rows; projection keeps columns">
      <Txt x={310} y={26} fs={11.5} bold c="n">
        σ keeps rows · π keeps columns
      </Txt>
      <Rel
        x={14}
        y={60}
        title="STUDENT"
        cols={['roll', 'name', 'dept']}
        rows={[
          ['101', 'Riya', 'CSE'],
          ['102', 'Arjun', 'ECE'],
          ['103', 'Meera', 'CSE'],
          ['104', 'Kabir', 'MEC'],
        ]}
        cw={[46, 60, 50]}
        c="n"
      />
      <Arrow x1={172} y1={140} x2={236} y2={140} c="a" label="σ" dy={-10} />
      <Txt x={204} y={166} fs={10} soft>
        dept = 'CSE'
      </Txt>

      <Rel
        x={242}
        y={60}
        title="after σ"
        cols={['roll', 'name', 'dept']}
        rows={[
          ['101', 'Riya', 'CSE'],
          ['103', 'Meera', 'CSE'],
        ]}
        cw={[46, 60, 50]}
        c="a"
      />
      <Arrow x1={404} y1={140} x2={456} y2={140} c="b" label="π" dy={-10} />
      <Txt x={430} y={166} fs={10} soft>
        name
      </Txt>

      <Rel x={462} y={60} title="after π" cols={['name']} rows={[['Riya'], ['Meera']]} cw={[86]} c="b" />

      <Txt x={310} y={230} fs={10.5} soft>
        π also removes duplicates — the result of a projection is a set
      </Txt>
      <Txt x={310} y={252} fs={10.5} bold c="c">
        π name ( σ dept='CSE' ( STUDENT ) )
      </Txt>
    </Dg>
  );
}

/** Inner vs left outer vs full outer, on the same two relations. */
function JoinTypes() {
  return (
    <Dg w={620} h={352} cap="The same two relations joined three ways">
      <Rel
        x={80}
        y={26}
        title="EMP"
        cols={['eid', 'did']}
        rows={[
          ['E1', 'D1'],
          ['E2', 'D2'],
          ['E3', 'D1'],
        ]}
        cw={[54, 54]}
        c="a"
      />
      <Txt x={252} y={100} fs={22} bold c="c">
        ⋈
      </Txt>
      <Txt x={252} y={122} fs={10} soft>
        on did
      </Txt>
      <Rel
        x={320}
        y={26}
        title="DEPT"
        cols={['did', 'dname']}
        rows={[
          ['D1', 'CSE'],
          ['D3', 'MEC'],
        ]}
        cw={[54, 72]}
        c="b"
      />

      <Rel
        x={20}
        y={186}
        title="INNER JOIN"
        cols={['eid', 'did', 'dname']}
        rows={[
          ['E1', 'D1', 'CSE'],
          ['E3', 'D1', 'CSE'],
        ]}
        cw={[48, 48, 60]}
        c="n"
      />
      <Rel
        x={212}
        y={186}
        title="LEFT OUTER"
        cols={['eid', 'did', 'dname']}
        rows={[
          ['E1', 'D1', 'CSE'],
          ['E3', 'D1', 'CSE'],
          ['E2', 'D2', 'NULL'],
        ]}
        cw={[48, 48, 60]}
        c="a"
        mark={{ '2,2': 'c' }}
      />
      <Rel
        x={404}
        y={186}
        title="FULL OUTER"
        cols={['eid', 'did', 'dname']}
        rows={[
          ['E1', 'D1', 'CSE'],
          ['E3', 'D1', 'CSE'],
          ['E2', 'D2', 'NULL'],
          ['NULL', 'D3', 'MEC'],
        ]}
        cw={[48, 48, 60]}
        c="b"
        mark={{ '2,2': 'c', '3,0': 'c' }}
      />
      <Txt x={310} y={340} fs={10.5} soft>
        outer joins keep the unmatched rows and pad the missing side with NULLs
      </Txt>
    </Dg>
  );
}

/** Division: "for all" as an algebra operator. */
function Division() {
  return (
    <Dg w={600} h={268} cap="Division finds the values that appear with every value of the divisor">
      <Rel
        x={40}
        y={26}
        title="ENROLLS"
        cols={['roll', 'cid']}
        rows={[
          ['101', 'C1'],
          ['101', 'C2'],
          ['102', 'C1'],
          ['103', 'C1'],
          ['103', 'C2'],
        ]}
        cw={[56, 56]}
        c="a"
      />
      <Txt x={202} y={110} fs={24} bold c="c">
        ÷
      </Txt>
      <Rel x={250} y={26} title="COURSE" cols={['cid']} rows={[['C1'], ['C2']]} cw={[74]} c="b" />
      <Txt x={362} y={110} fs={20} bold c="n">
        =
      </Txt>
      <Rel x={404} y={26} title="RESULT" cols={['roll']} rows={[['101'], ['103']]} cw={[74]} c="c" />

      <Txt x={300} y={228} fs={11} bold c="c">
        which students are enrolled in EVERY course?
      </Txt>
      <Txt x={300} y={250} fs={10.5} soft>
        101 and 103 appear with both C1 and C2 · 102 only took C1, so it is dropped
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'relational-algebra',
  num: 9,
  unit: 'Relational Theory',
  title: 'Relational Algebra',
  blurb:
    'The six fundamental operations, every join variant, and division — the procedural language the query optimizer actually thinks in.',
  minutes: 16,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'why',
      heading: 'Why relational algebra matters',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Relational algebra is a <b>procedural</b> query language: each operation takes one or two relations and
              produces a new relation. Because the output is always a relation, operations compose — which is the
              whole trick.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              It is the <b>formal semantics</b> of the relational model — a query means precisely what its algebra
              expression evaluates to.
            </>,
            <>
              Query optimizers work by <b>rewriting algebra expressions</b> into equivalent, cheaper ones. "Push
              selection below join" is an algebraic identity, not a heuristic hack.
            </>,
            <>
              It defines <b>relational completeness</b>: a query language is relationally complete if it can express
              everything the algebra can.
            </>,
          ],
        },
      ],
    },

    {
      id: 'fundamental',
      heading: 'The six fundamental operations',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Everything else is built from these six. If an interviewer asks you to "name the basic operations",
              this is the list.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Op', 'Symbol', 'Does', 'Note'],
          rows: [
            ['Select', 'σ (sigma)', 'Keeps the tuples that satisfy a condition', 'Unary. Degree unchanged, cardinality shrinks.'],
            ['Project', 'π (pi)', 'Keeps only the listed attributes', 'Unary. Removes duplicates from the result.'],
            ['Union', '∪', 'All tuples in either relation', 'Needs union compatibility. Removes duplicates.'],
            ['Set difference', '−', 'Tuples in the first but not the second', 'Needs union compatibility. Not commutative.'],
            ['Cartesian product', '×', 'Every tuple of R paired with every tuple of S', 'Result degree = m + n, cardinality = |R| × |S|'],
            ['Rename', 'ρ (rho)', 'Gives a relation or its attributes a new name', 'Essential for self-joins.'],
          ],
        },
        { k: 'diagram', el: <SelectProject />, caption: 'σ then π — the two you will use in almost every answer.' },
        {
          k: 'note',
          tone: 'warn',
          title: 'Union compatibility',
          text: (
            <>
              ∪, ∩ and − require the two relations to have the <b>same number of attributes</b>, with{' '}
              <b>corresponding attributes drawn from the same domains</b>. Attribute <i>names</i> do not have to
              match. Forgetting this condition is the most common mistake in written answers.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Reading a nested expression — always inside-out',
          code: `π name ( σ cgpa > 8.5 ( STUDENT ) )

  step 1   σ cgpa > 8.5 (STUDENT)     keep the high scorers
  step 2   π name (...)               keep only their names

Order matters for cost, not for meaning:
  π name ( σ cgpa > 8.5 (STUDENT) )   ← filter first, project 2 rows   CHEAP
  σ cgpa > 8.5 ( π name (STUDENT) )   ← INVALID: cgpa was projected away`,
        },
      ],
    },

    {
      id: 'derived',
      heading: 'Derived operations',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              These are conveniences — each can be rewritten using only the six fundamentals, which is exactly what
              an interviewer may ask you to prove.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Op', 'Symbol', 'Equivalent to'],
          rows: [
            ['Intersection', '∩', <code>R ∩ S = R − (R − S)</code>],
            ['Theta join', '⋈θ', <code>R ⋈θ S = σθ (R × S)</code>],
            [
              'Natural join',
              '⋈',
              <>
                <code>π (σ common-attributes-match (R × S))</code>, with the duplicate column removed
              </>,
            ],
            ['Left outer join', '⟕', 'Natural join, plus the unmatched left tuples padded with NULLs'],
            [
              'Semi join',
              '⋉',
              <>
                <code>R ⋉ S = π attrs(R) (R ⋈ S)</code> — left rows that have a match, without S's columns
              </>,
            ],
            ['Division', '÷', 'Expressible with ×, − and π (see below)'],
          ],
        },
      ],
    },

    {
      id: 'joins',
      heading: 'Joins',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A join is a Cartesian product followed by a selection — conceptually. No real DBMS computes it that
              way, because the product would be enormous; it uses nested-loop, hash or merge algorithms instead. But
              the <i>meaning</i> is exactly that.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Theta join (⋈θ)</b> — join on any condition: <code>{'R ⋈ R.age > S.age S'}</code>.
            </>,
            <>
              <b>Equi join</b> — a theta join whose condition uses only <b>=</b>. The common attribute appears{' '}
              <b>twice</b> in the result.
            </>,
            <>
              <b>Natural join (⋈)</b> — an equi join on <i>all</i> attributes that share a name, with the duplicate
              column removed. Convenient, but fragile: it silently changes meaning if someone adds a column with a
              colliding name.
            </>,
            <>
              <b>Outer joins</b> — keep the unmatched tuples too. Left (⟕) keeps unmatched left tuples, right (⟖)
              keeps unmatched right tuples, full (⟗) keeps both. The missing side is filled with NULLs.
            </>,
            <>
              <b>Semi join (⋉)</b> — the rows of R that have <i>at least one</i> match in S, returning only R's
              columns. Heavily used in distributed query processing to avoid shipping whole relations.
            </>,
            <>
              <b>Anti join</b> — the rows of R that have <i>no</i> match in S: <code>R − (R ⋉ S)</code>.
            </>,
            <>
              <b>Self join</b> — a relation joined to itself, which is only possible after ρ renames one copy.
            </>,
          ],
        },
        { k: 'diagram', el: <JoinTypes />, caption: 'E2 has a department that is not in DEPT; D3 has no employees. Which join keeps them?' },
        {
          k: 'note',
          tone: 'exam',
          title: 'Natural join with no common attributes?',
          text: (
            <>
              It degenerates into a <b>Cartesian product</b>. If R and S share no attribute name, "match on all
              common attributes" is vacuously true for every pair. A neat gotcha question.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Result sizes — the counting questions',
          code: `|R| = m rows, degree a       |S| = n rows, degree b

R × S            rows = m × n              degree = a + b
R ⋈ S (natural)  rows = 0 … m × n          degree = a + b − (common attrs)
R ⟕ S            rows ≥ m                  (every left row survives)
R ⟗ S            rows ≥ max(m, n)
R ∪ S            rows ≤ m + n              (duplicates removed)
R ∩ S            rows ≤ min(m, n)
R − S            rows ≤ m
σ (R)            rows ≤ m,  degree = a
π (R)            rows ≤ m,  degree = number of listed attributes`,
        },
      ],
    },

    {
      id: 'division',
      heading: 'Division — the "for all" operator',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Division is the operation people freeze on, because it is the only one that expresses{' '}
              <b>"for all"</b> rather than "there exists". Its trigger phrase in a question is the word{' '}
              <b>every</b> or <b>all</b>.
            </>
          ),
        },
        { k: 'diagram', el: <Division />, caption: 'R ÷ S returns the values in R that are paired with every value in S.' },
        {
          k: 'p',
          text: (
            <>
              Formally, for <code>R(A, B) ÷ S(B)</code>, the result contains every value of <b>A</b> that appears in
              R paired with <b>every single</b> value of B present in S. The result's attributes are those of R{' '}
              <i>minus</i> those of S.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Division from the fundamentals',
          code: `R(A, B) ÷ S(B)

  all_A       = π A (R)                        every candidate
  impossible  = π A ( (all_A × S) − R )        candidates missing some B
  result      = all_A − impossible

Read it as: "start with everyone, then remove anyone
who is missing even one required value."`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Phrases that mean division: "students who took <b>all</b> courses", "suppliers who supply{' '}
              <b>every</b> part", "employees who worked on <b>each</b> project". Phrases that do <b>not</b>: "at
              least one", "any" — those are ordinary joins.
            </>
          ),
        },
      ],
    },

    {
      id: 'extended',
      heading: 'Extended operations',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Generalised projection</b> — allows computed expressions in the projection list, e.g.{' '}
              <code>π name, salary × 12 (EMP)</code>.
            </>,
            <>
              <b>Aggregation (𝒢)</b> — grouping with functions: <code>dept 𝒢 avg(salary) (EMP)</code> reads
              "group by dept, compute the average salary". The attributes on the left of 𝒢 are the grouping
              attributes; with none, the whole relation is one group.
            </>,
            <>
              <b>Assignment (←)</b> — names an intermediate result so a long expression stays readable.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'A multi-step query, written with assignment',
          code: `Query: names of employees earning more than the average in their own department.

DeptAvg   ← dept 𝒢 avg(salary) → avgSal ( EMP )
Joined    ← EMP ⋈ DeptAvg
Result    ← π name ( σ salary > avgSal ( Joined ) )`,
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is relational algebra and why is it important?',
      a: (
        <>
          A procedural query language whose operations take relations and return relations, so they compose. It
          matters because it gives the relational model formal semantics, and because query optimizers work by
          rewriting algebra expressions into equivalent cheaper ones.
        </>
      ),
    },
    {
      q: 'Name the fundamental operations.',
      a: (
        <>
          Six: <b>select (σ)</b>, <b>project (π)</b>, <b>union (∪)</b>, <b>set difference (−)</b>,{' '}
          <b>Cartesian product (×)</b> and <b>rename (ρ)</b>. Intersection, all joins and division are derived from
          these.
        </>
      ),
    },
    {
      q: 'Difference between select and project?',
      a: (
        <>
          <b>Select (σ)</b> is horizontal — it keeps whole tuples that satisfy a condition, leaving the degree
          unchanged. <b>Project (π)</b> is vertical — it keeps chosen attributes for all tuples, reducing the degree
          and eliminating any duplicate tuples that result.
        </>
      ),
    },
    {
      q: 'What is union compatibility?',
      a: (
        <>
          Two relations are union compatible when they have the <b>same degree</b> and each pair of corresponding
          attributes is defined over the <b>same domain</b>. It is required for ∪, ∩ and −. Attribute names need
          not match.
        </>
      ),
    },
    {
      q: 'Natural join vs equi join?',
      a: (
        <>
          An equi join is any join whose condition uses only equality, and it keeps <b>both</b> copies of the joined
          columns. A natural join is an equi join on <b>all identically named attributes</b>, and it removes the
          duplicate column. Natural join is a special case of equi join.
        </>
      ),
    },
    {
      q: 'What does a natural join return if the two relations share no attribute names?',
      a: (
        <>
          The <b>Cartesian product</b>. With no common attributes, the implicit matching condition is vacuously true
          for every pair of tuples.
        </>
      ),
    },
    {
      q: 'What is a semi join and why is it useful?',
      a: (
        <>
          <code>R ⋉ S</code> returns the tuples of R that have at least one match in S, projected back onto R's
          attributes only. It is central to <b>distributed</b> query processing: you ship only the join column to
          the other site, get back the matching keys, and avoid transferring an entire relation across the network.
        </>
      ),
    },
    {
      q: 'Explain division with an example.',
      a: (
        <>
          <code>R(A,B) ÷ S(B)</code> returns every A value that appears in R paired with <b>every</b> B value in S.
          Classic use: <code>ENROLLS(roll, cid) ÷ COURSE(cid)</code> gives the students enrolled in <b>all</b>{' '}
          courses. Whenever a question says "all" or "every", division (or a double NOT EXISTS) is the answer.
        </>
      ),
    },
    {
      q: 'If |R| = m and |S| = n, how many tuples in R × S? In R ⋈ S?',
      a: (
        <>
          <code>R × S</code> always has exactly <b>m × n</b> tuples. A natural join has between <b>0</b> and{' '}
          <b>m × n</b>, depending on how many pairs match — it is a subset of the product.
        </>
      ),
    },
    {
      q: 'Which relational algebra operation removes duplicates?',
      a: (
        <>
          <b>Projection (π)</b> — and the set operations ∪, ∩ and −. Since a relation is formally a set, every
          operation's output is duplicate-free; projection is the one where you notice, because dropping the key
          column can collapse many tuples into one.
        </>
      ),
    },
  ],
};

export default topic;
