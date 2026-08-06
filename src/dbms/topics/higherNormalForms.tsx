import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** A lossy decomposition producing spurious tuples. */
function LossyJoin() {
  return (
    <Dg w={620} h={462} cap="Splitting on a non-key attribute lets the join invent tuples that were never there">
      <Rel
        x={200}
        y={26}
        title="EMP (original)"
        cols={['ename', 'dept', 'proj']}
        rows={[
          ['Riya', 'CSE', 'P1'],
          ['Arjun', 'CSE', 'P2'],
        ]}
        cw={[62, 54, 54]}
        c="b"
      />
      <Arrow x1={285} y1={122} x2={285} y2={152} c="c" label="split on dept" dx={70} dy={-4} />

      <Rel
        x={60}
        y={164}
        title="R1"
        cols={['ename', 'dept']}
        rows={[
          ['Riya', 'CSE'],
          ['Arjun', 'CSE'],
        ]}
        cw={[62, 54]}
        c="a"
      />
      <Rel
        x={360}
        y={164}
        title="R2"
        cols={['dept', 'proj']}
        rows={[
          ['CSE', 'P1'],
          ['CSE', 'P2'],
        ]}
        cw={[54, 54]}
        c="a"
      />
      <Arrow x1={118} y1={262} x2={230} y2={292} c="n" />
      <Arrow x1={414} y1={262} x2={310} y2={292} c="n" />
      <Txt x={270} y={282} fs={11} bold c="c">
        ⋈ on dept
      </Txt>

      <Rel
        x={180}
        y={296}
        title="R1 ⋈ R2"
        cols={['ename', 'dept', 'proj']}
        rows={[
          ['Riya', 'CSE', 'P1'],
          ['Riya', 'CSE', 'P2'],
          ['Arjun', 'CSE', 'P1'],
          ['Arjun', 'CSE', 'P2'],
        ]}
        cw={[62, 54, 54]}
        c="c"
        rowMark={{ 1: 'c', 2: 'c' }}
      />
      <Txt x={400} y={392} anchor="start" fs={11} bold c="c">
        ✗ two spurious tuples
      </Txt>
      <Txt x={400} y={410} anchor="start" fs={10.5} soft>
        Riya never worked on P2.
      </Txt>
      <Txt x={400} y={426} anchor="start" fs={10.5} soft>
        dept is not a key of
      </Txt>
      <Txt x={400} y={442} anchor="start" fs={10.5} soft>
        either half → lossy.
      </Txt>
    </Dg>
  );
}

/** Multivalued dependency and the 4NF fix. */
function Mvd() {
  return (
    <Dg w={620} h={368} cap="Two independent multivalued facts in one table multiply out; 4NF separates them">
      <Rel
        x={200}
        y={26}
        title="COURSE_INFO"
        cols={['course', 'instr', 'book']}
        rows={[
          ['DB', 'Rao', 'B1'],
          ['DB', 'Rao', 'B2'],
          ['DB', 'Sen', 'B1'],
          ['DB', 'Sen', 'B2'],
        ]}
        cw={[62, 56, 52]}
        c="n"
      />
      <Txt x={310} y={198} fs={10.5} soft>
        instructors and books have nothing to do with each other,
      </Txt>
      <Txt x={310} y={214} fs={10.5} soft>
        yet every pair must be listed: 2 × 2 = 4 rows for one course
      </Txt>
      <Arrow x1={310} y1={224} x2={310} y2={252} c="c" label="4NF" dx={34} dy={-4} />

      <Rel
        x={90}
        y={264}
        title="COURSE_INSTR"
        cols={['course', 'instr']}
        rows={[
          ['DB', 'Rao'],
          ['DB', 'Sen'],
        ]}
        cw={[70, 62]}
        c="a"
      />
      <Rel
        x={370}
        y={264}
        title="COURSE_BOOK"
        cols={['course', 'book']}
        rows={[
          ['DB', 'B1'],
          ['DB', 'B2'],
        ]}
        cw={[70, 62]}
        c="b"
      />
      <Txt x={310} y={356} fs={10.5} soft>
        2 + 2 rows instead of 2 × 2 — and adding a third book now costs one row, not two
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'higher-normal-forms',
  num: 13,
  unit: 'Normalization',
  title: 'Decomposition, 4NF & 5NF',
  blurb:
    'Lossless join and dependency preservation, the BCNF and 3NF decomposition algorithms, multivalued dependencies, and join dependencies.',
  minutes: 14,
  tags: ['Solve-it question'],

  sections: [
    {
      id: 'properties',
      heading: 'The two properties every decomposition must be judged on',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Splitting a table is easy. Splitting it <b>correctly</b> means preserving two things: the data, and
              the constraints.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Lossless join (non-additive)</b> — joining the pieces back together gives you exactly the original
              relation, with no extra tuples. This property is <b>mandatory</b>; a lossy decomposition is simply
              wrong.
            </>,
            <>
              <b>Dependency preservation</b> — every functional dependency of the original can still be checked
              inside a single resulting table, with no join. This one is <b>desirable</b> but sometimes impossible.
            </>,
          ],
        },
        { k: 'diagram', el: <LossyJoin />, caption: 'The join added tuples, so information was lost — hence "lossy".' },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              "Lossy" is a confusing name, because the decomposition produces <b>more</b> rows, not fewer. What is
              lost is <b>information</b>: you can no longer tell which original tuples were real.
            </>
          ),
        },
      ],
    },

    {
      id: 'testing',
      heading: 'Testing for a lossless join',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              For a decomposition into <b>two</b> relations there is a one-line test, and it is what interviews ask
              for.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The two-relation test',
          code: `R decomposed into R1 and R2 is LOSSLESS if and only if
the common attributes form a super key of at least one half:

        (R1 ∩ R2) → R1        or        (R1 ∩ R2) → R2

Example  R(A, B, C)   F = { A → B,  B → C }

  R1(A,B)  R2(B,C)      R1 ∩ R2 = {B},  B → C = R2   ✓ LOSSLESS
  R1(A,B)  R2(A,C)      R1 ∩ R2 = {A},  A → BC       ✓ LOSSLESS
  R1(A,C)  R2(B,C)      R1 ∩ R2 = {C},  C determines
                        nothing                       ✗ LOSSY`,
        },
        {
          k: 'p',
          text: (
            <>
              For <b>more than two</b> relations, use the <b>chase (matrix) algorithm</b>: build a table with one
              row per sub-relation and one column per attribute, mark <code>a</code> where the attribute is present
              and <code>b</code> where it is not, then repeatedly apply the FDs to equate symbols. The
              decomposition is lossless if any row becomes all <code>a</code>.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A useful shortcut for the common case: a decomposition that puts the <b>whole candidate key</b> in one
              of the pieces, and splits along an FD, is lossless. That covers almost every textbook decomposition.
            </>
          ),
        },
      ],
    },

    {
      id: 'algorithms',
      heading: 'The two decomposition algorithms',
      blocks: [
        { k: 'h', text: 'BCNF decomposition (analysis)' },
        {
          k: 'code',
          title: 'Repeatedly split on the offending FD',
          code: `while some relation Ri violates BCNF:
    pick a violating FD  X → Y  in Ri   (X is not a super key)
    replace Ri with:
        R_a =  X ∪ Y
        R_b =  Ri − (Y − X)             ← X stays in both halves

X is common to both halves and is a key of R_a, so every step
is lossless. But an FD may end up split across two relations,
which is why BCNF cannot promise dependency preservation.`,
        },
        { k: 'h', text: '3NF synthesis (synthesis)' },
        {
          k: 'code',
          title: 'Build the relations up from a canonical cover',
          code: `1. compute a canonical cover Fc of F
2. for each FD  X → Y  in Fc:
       create a relation  R_i = X ∪ Y
       (FDs with the same left side can share one relation)
3. if no R_i contains a candidate key of R:
       add one relation containing a candidate key
4. remove any R_i contained inside another

Guaranteed: 3NF, lossless AND dependency preserving — all three.`,
        },
        {
          k: 'table',
          head: ['', 'BCNF decomposition', '3NF synthesis'],
          rows: [
            ['Approach', 'Top-down: keep splitting the bad relation', 'Bottom-up: build relations from the FDs'],
            ['Result is in', 'BCNF', '3NF'],
            ['Lossless', 'Always', 'Always'],
            ['Dependency preserving', 'Not guaranteed', 'Always'],
            ['Number of relations', 'Usually fewer', 'Can be more'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The headline result, worth stating exactly: <b>3NF can always be achieved losslessly and
              dependency-preservingly. BCNF can always be achieved losslessly, but not always with dependency
              preservation.</b> That is the whole reason 3NF remains the practical target.
            </>
          ),
        },
      ],
    },

    {
      id: 'fourth',
      heading: 'Fourth Normal Form (4NF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>multivalued dependency</b> <code>X ↠ Y</code> holds when, for a given X, the set of Y values is
              <b> independent</b> of every other attribute. Independence is the key word: two unrelated
              multivalued facts about the same entity are forced to multiply out.
            </>
          ),
        },
        { k: 'diagram', el: <Mvd />, caption: 'course ↠ instructor and course ↠ book are independent, so every combination has to be stored.' },
        {
          k: 'p',
          text: (
            <>
              <b>4NF rule:</b> in BCNF, and for every non-trivial MVD <code>X ↠ Y</code>, X must be a{' '}
              <b>super key</b>.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              Every FD is an MVD, so MVDs generalise FDs. <code>X → Y</code> implies <code>X ↠ Y</code>.
            </>,
            <>
              MVDs come in pairs: if <code>X ↠ Y</code> holds in R(X, Y, Z), then <code>X ↠ Z</code> holds too.
            </>,
            <>
              An MVD is trivial if <code>Y ⊆ X</code>, or if <code>X ∪ Y</code> is the whole relation.
            </>,
            <>
              The fix is always the same: split the relation so each independent multivalued fact gets its own
              table.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              An MVD needs at least <b>three</b> attributes to exist non-trivially, and requires the two multivalued
              sets to be genuinely <b>independent</b>. If the instructor determined which book is used, this would
              be an ordinary FD, not an MVD — and there would be no 4NF violation.
            </>
          ),
        },
      ],
    },

    {
      id: 'fifth',
      heading: 'Fifth Normal Form (5NF / PJNF)',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              5NF, also called <b>Project-Join Normal Form</b>, deals with <b>join dependencies</b>: a relation that
              cannot be split losslessly into two pieces, but <i>can</i> be split losslessly into three or more.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Rule:</b> a relation is in 5NF if every non-trivial join dependency is implied by its candidate
              keys — that is, it cannot be decomposed any further without loss.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The classic example',
          code: `SUPPLIES( supplier, part, project )

Business rule (a cyclic one):
    IF  supplier s supplies part p
    AND part p is used in project j
    AND supplier s supplies project j
    THEN s supplies p for j.

No two-way split is lossless, but this three-way split is:

    SP( supplier, part )
    PJ( part, project )
    SJ( supplier, project )

Joining all three reconstructs SUPPLIES exactly.`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              5NF is rare in practice and rarer in interviews. Knowing the definition, the supplier-part-project
              example, and that "5NF is about join dependencies requiring a three-way decomposition" is enough.
            </>
          ),
        },
      ],
    },

    {
      id: 'summary',
      heading: 'All normal forms on one page',
      blocks: [
        {
          k: 'table',
          head: ['Form', 'Removes', 'Condition'],
          rows: [
            ['1NF', 'Non-atomic values', 'Every value is atomic; no repeating groups'],
            ['2NF', 'Partial dependencies', 'No non-prime attribute depends on part of a candidate key'],
            ['3NF', 'Transitive dependencies', 'For every X → A: X is a super key OR A is prime'],
            ['BCNF', 'Any non-super-key determinant', 'For every non-trivial X → Y: X is a super key'],
            ['4NF', 'Multivalued dependencies', 'For every non-trivial X ↠ Y: X is a super key'],
            ['5NF', 'Join dependencies', 'Every join dependency is implied by the candidate keys'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Also worth naming if it comes up: <b>6NF</b> (irreducible relations, used in temporal databases) and{' '}
              <b>DKNF</b>, Domain-Key Normal Form, where every constraint follows from domain constraints and key
              constraints alone. DKNF is the theoretical ideal and is rarely achievable.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a lossless join decomposition?',
      a: (
        <>
          One where joining the decomposed relations reproduces the original exactly, with no spurious tuples. For a
          two-way split it holds iff the common attributes <code>R1 ∩ R2</code> form a <b>super key of R1 or of
          R2</b>. Losslessness is mandatory — a lossy decomposition is simply incorrect.
        </>
      ),
    },
    {
      q: 'Why is it called "lossy" when the join produces more rows?',
      a: (
        <>
          Because what is lost is <b>information</b>, not rows. The extra (spurious) tuples mean you can no longer
          distinguish which combinations actually existed in the original relation.
        </>
      ),
    },
    {
      q: 'What is dependency preservation?',
      a: (
        <>
          Every functional dependency of the original relation can still be enforced by looking at a{' '}
          <b>single</b> decomposed relation, without a join. Without it, checking a constraint requires joining
          tables on every update, which is expensive enough that the constraint usually goes unenforced.
        </>
      ),
    },
    {
      q: 'Can every relation be decomposed into BCNF losslessly and dependency-preservingly?',
      a: (
        <>
          <b>Losslessly, yes. Both, no.</b> Some relations have no BCNF decomposition that preserves all
          dependencies — the standard example is <code>(student, subject, teacher)</code>. 3NF, by contrast, can
          always achieve both, which is why it is the usual practical target.
        </>
      ),
    },
    {
      q: 'Explain the 3NF synthesis algorithm.',
      a: (
        <>
          Compute a canonical cover; create one relation per FD (grouping FDs with the same left-hand side); if no
          relation contains a candidate key, add one that does; then drop any relation contained in another. The
          result is guaranteed 3NF, lossless and dependency preserving.
        </>
      ),
    },
    {
      q: 'What is a multivalued dependency?',
      a: (
        <>
          <code>X ↠ Y</code> holds when the set of Y values associated with an X is <b>independent</b> of the other
          attributes. It forces every combination of two unrelated multivalued facts to be stored — e.g. a course
          with 2 instructors and 3 books needs 6 rows. 4NF forbids non-trivial MVDs whose determinant is not a super
          key.
        </>
      ),
    },
    {
      q: 'Difference between an FD and an MVD?',
      a: (
        <>
          An FD determines <b>exactly one</b> value; an MVD determines a <b>set</b> of values independently of the
          rest of the tuple. Every FD is an MVD, but not the reverse — MVDs are the strictly more general notion,
          and they need at least three attributes to be non-trivial.
        </>
      ),
    },
    {
      q: 'What is 5NF?',
      a: (
        <>
          Project-Join Normal Form: a relation is in 5NF when every non-trivial <b>join dependency</b> is implied by
          its candidate keys — it cannot be decomposed further without loss. The classic case is a cyclic
          supplier-part-project rule that requires a three-way decomposition to break.
        </>
      ),
    },
    {
      q: 'Which normal form do real production databases usually target?',
      a: (
        <>
          <b>3NF</b>, or BCNF where it costs nothing, on the transactional (OLTP) side. Analytical and reporting
          schemas are deliberately denormalized — star and snowflake schemas trade redundancy for join-free reads.
        </>
      ),
    },
  ],
};

export default topic;
