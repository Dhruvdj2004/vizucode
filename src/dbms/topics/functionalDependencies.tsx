import { Box, Dg, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Attributes with FD arcs drawn between them. */
function FdArcs() {
  const arc = (d: string, c: string, key: string) => (
    <path key={key} d={d} fill="none" stroke={c} strokeWidth="1.6" markerEnd={`url(#dg-head-${c === 'var(--accent-3)' ? 'c' : 'a'})`} />
  );
  return (
    <Dg w={600} h={244} cap="Functional dependencies drawn as arrows between attribute sets">
      <Box x={40} y={100} w={76} h={38} label="roll" c="a" fs={12} />
      <Box x={150} y={100} w={76} h={38} label="name" c="n" fs={12} />
      <Box x={260} y={100} w={76} h={38} label="dept" c="n" fs={12} />
      <Box x={370} y={100} w={76} h={38} label="hod" c="n" fs={12} />

      {arc('M 78 98 Q 133 52 186 96', 'var(--accent)', 'a1')}
      {arc('M 78 98 Q 188 18 296 96', 'var(--accent)', 'a2')}
      {arc('M 298 140 Q 353 192 406 142', 'var(--accent-3)', 'a3')}

      <Txt x={470} y={106} anchor="start" fs={11.5} bold c="a">
        roll → name
      </Txt>
      <Txt x={470} y={128} anchor="start" fs={11.5} bold c="a">
        roll → dept
      </Txt>
      <Txt x={470} y={150} anchor="start" fs={11.5} bold c="c">
        dept → hod
      </Txt>
      <Txt x={470} y={182} anchor="start" fs={10} soft>
        so roll → hod,
      </Txt>
      <Txt x={470} y={198} anchor="start" fs={10} soft>
        transitively
      </Txt>
      <Txt x={240} y={30} fs={10.5} soft>
        "if you know roll, you know exactly one name and one dept"
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'functional-dependencies',
  num: 11,
  unit: 'Normalization',
  title: 'Functional Dependencies & Attribute Closure',
  blurb:
    'The single most mechanical topic in DBMS: FD types, Armstrong\'s axioms, computing closures, finding all candidate keys and reducing an FD set to its canonical cover.',
  minutes: 15,
  tags: ['Very common', 'Solve-it question'],

  sections: [
    {
      id: 'definition',
      heading: 'What a functional dependency is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <code>X → Y</code> ("X determines Y") means: <b>any two tuples that agree on X must also agree on
              Y</b>. Knowing X pins Y down to exactly one value.
            </>
          ),
        },
        { k: 'diagram', el: <FdArcs />, caption: 'X → Y is a constraint on every possible instance, not just the current one.' },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              An FD is a statement about the <b>real world</b>, not about the rows you happen to see. If today's
              three rows all have distinct names, that does <b>not</b> prove <code>name → roll</code>. You can{' '}
              <b>disprove</b> an FD from an instance (find two rows agreeing on X but not on Y), but you can never
              prove one. Interviewers set this trap often.
            </>
          ),
        },
      ],
    },

    {
      id: 'types',
      heading: 'Types of functional dependency',
      blocks: [
        {
          k: 'table',
          head: ['Type', 'Definition', 'Example'],
          rows: [
            ['Trivial', 'X → Y where Y ⊆ X. Always true, tells you nothing.', 'roll, name → name'],
            ['Non-trivial', 'X → Y where Y ⊄ X. These are the useful ones.', 'roll → name'],
            [
              'Fully functional',
              'X → Y where Y depends on all of X — remove any attribute from X and it breaks.',
              '(roll, cid) → grade',
            ],
            [
              'Partial',
              'A non-prime attribute depends on only part of a composite candidate key.',
              '(roll, cid) → sname, where roll → sname alone. Breaks 2NF.',
            ],
            [
              'Transitive',
              'X → Y and Y → Z, with Y not a key, so X → Z indirectly.',
              'roll → dept, dept → hod ⇒ roll → hod. Breaks 3NF.',
            ],
            [
              'Multivalued (↠)',
              'X determines a set of values for Y, independently of the other attributes.',
              'course ↠ instructor. Breaks 4NF.',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Learn these three together, because they are the whole of normalization: <b>partial dependency breaks
              2NF</b>, <b>transitive dependency breaks 3NF</b>, and <b>any non-superkey determinant breaks
              BCNF</b>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Two more words you need: an attribute is <b>prime</b> if it belongs to <i>some</i> candidate key, and{' '}
              <b>non-prime</b> otherwise. Almost every normal-form definition is phrased in terms of non-prime
              attributes.
            </>
          ),
        },
      ],
    },

    {
      id: 'armstrong',
      heading: "Armstrong's axioms",
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A sound and complete set of inference rules: applying them repeatedly to a set F generates{' '}
              <b>F⁺</b>, the closure of F — every FD that logically follows from it.
            </>
          ),
        },
        {
          k: 'h', text: 'The three primary axioms',
        },
        {
          k: 'table',
          head: ['Axiom', 'Rule', 'In words'],
          rows: [
            ['Reflexivity', 'If Y ⊆ X then X → Y', 'A set determines its own subsets. Generates the trivial FDs.'],
            ['Augmentation', 'If X → Y then XZ → YZ', 'Adding the same attributes to both sides preserves the FD.'],
            ['Transitivity', 'If X → Y and Y → Z then X → Z', 'Dependencies chain. The most useful rule.'],
          ],
        },
        { k: 'h', text: 'Three derived rules (worth quoting)' },
        {
          k: 'table',
          head: ['Rule', 'Statement'],
          rows: [
            ['Union', 'If X → Y and X → Z then X → YZ'],
            ['Decomposition', 'If X → YZ then X → Y and X → Z'],
            ['Pseudo-transitivity', 'If X → Y and WY → Z then WX → Z'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'The rule that does NOT exist',
          text: (
            <>
              There is <b>no decomposition rule for the left-hand side</b>. From <code>AB → C</code> you may{' '}
              <b>not</b> conclude <code>A → C</code> or <code>B → C</code>. Splitting is legal only on the{' '}
              <b>right</b>. This is the single most common error in FD questions.
            </>
          ),
        },
      ],
    },

    {
      id: 'closure',
      heading: 'Attribute closure — the workhorse',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <code>X⁺</code> is the set of all attributes determined by X. Computing it is a three-line algorithm,
              and it answers almost every FD question you will be asked.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Algorithm',
          code: `closure(X, F):
    result ← X
    repeat until result stops changing:
        for each FD  A → B  in F:
            if A ⊆ result:
                result ← result ∪ B
    return result`,
        },
        {
          k: 'code',
          title: 'Worked example',
          code: `R(A, B, C, D, E)
F = { A → B,  B → C,  CD → E }

Find A⁺
    start          A⁺ = {A}
    A → B  fires   A⁺ = {A, B}
    B → C  fires   A⁺ = {A, B, C}
    CD → E ?       needs C and D — D is missing, so it cannot fire
    no change      A⁺ = {A, B, C}

Find (AD)⁺
    start          {A, D}
    A → B          {A, B, D}
    B → C          {A, B, C, D}
    CD → E         C ✓ and D ✓  →  {A, B, C, D, E}
                   AD⁺ = all attributes  ⇒  AD is a super key

Find (BD)⁺
    start          {B, D}
    B → C          {B, C, D}
    CD → E         {B, C, D, E}         ⇒ BD⁺ = {B,C,D,E}, missing A`,
        },
        { k: 'h', text: 'What closure lets you answer' },
        {
          k: 'ul',
          items: [
            <>
              <b>Is X → Y implied by F?</b> Yes exactly when <code>Y ⊆ X⁺</code>.
            </>,
            <>
              <b>Is X a super key?</b> Yes exactly when <code>X⁺</code> contains every attribute of R.
            </>,
            <>
              <b>Is X a candidate key?</b> X is a super key <i>and</i> no proper subset of X is.
            </>,
            <>
              <b>Are two FD sets equivalent?</b> Compute closures under each and compare.
            </>,
          ],
        },
      ],
    },

    {
      id: 'candidate-keys',
      heading: 'Finding all candidate keys',
      blocks: [
        {
          k: 'steps',
          items: [
            {
              t: 'Classify every attribute',
              d: 'Left-only (appears only on left sides), right-only (only on right sides), both, or neither (appears in no FD).',
            },
            {
              t: 'Seed the key',
              d: 'Every left-only and every "neither" attribute MUST be in every candidate key — nothing can determine them.',
            },
            {
              t: 'Test the seed',
              d: 'Compute its closure. If it already covers R, it is the unique candidate key and you are done.',
            },
            {
              t: 'Grow it',
              d: 'Otherwise add attributes from the "both" group one at a time, computing closures, keeping only minimal combinations.',
            },
            {
              t: 'Right-only attributes never appear in a key',
              d: 'They are always determined by something else, so including one can never be minimal.',
            },
          ],
        },
        {
          k: 'code',
          title: 'Example',
          code: `R(A, B, C, D, E, F)
FDs = { AB → C,  C → D,  D → E,  E → A,  F → B }

Classify
    left only     : F                 → must be in every key
    right only    : (none — A, B, C, D, E all appear on a left side too)
    both          : A, B, C, D, E
    neither       : none

Start with F
    F⁺ = {F, B}                       not everything — grow it

Try FA   F⁺ ∪ A:  {F,B,A} → AB→C → {A,B,C,F} → C→D → +D → D→E → +E
    (FA)⁺ = {A,B,C,D,E,F}  = R        ✓  FA is a candidate key

Try FC   {F,B,C} → C→D → +D → D→E → +E → E→A → +A
    (FC)⁺ = R                          ✓  FC is a candidate key

Similarly  FD and FE are candidate keys.

Candidate keys : FA, FC, FD, FE
Prime attrs    : A, C, D, E, F        Non-prime : B`,
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              If an attribute appears <b>only on the right</b> of every FD, it can never be part of any candidate
              key. If it appears <b>only on the left</b>, or in no FD at all, it must be part of <i>every</i>{' '}
              candidate key. Those two observations cut the search down enormously and are worth saying out loud.
            </>
          ),
        },
      ],
    },

    {
      id: 'canonical',
      heading: 'Canonical (minimal) cover',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>canonical cover Fc</b> is the smallest FD set equivalent to F. Normalization algorithms — 3NF
              synthesis in particular — start from it.
            </>
          ),
        },
        {
          k: 'steps',
          items: [
            { t: 'Split right-hand sides', d: 'Rewrite every FD so it has a single attribute on the right, using the decomposition rule.' },
            {
              t: 'Remove extraneous left attributes',
              d: 'For each FD AB → C, check whether A alone (or B alone) already determines C using the rest of the set. If so, drop the redundant attribute.',
            },
            {
              t: 'Remove redundant FDs',
              d: 'For each FD X → Y, delete it temporarily and recompute X⁺. If Y is still reachable, the FD was redundant — leave it out.',
            },
            { t: 'Regroup', d: 'Optionally recombine FDs with the same left-hand side using the union rule.' },
          ],
        },
        {
          k: 'code',
          title: 'Worked example',
          code: `F = { A → BC,  B → C,  A → B,  AB → C }

Step 1 — single attribute on the right
        A → B,  A → C,  B → C,  A → B,  AB → C
        (A → B is listed twice; keep one)
        A → B,  A → C,  B → C,  AB → C

Step 2 — extraneous left attributes
        AB → C :  is B extraneous?  A⁺ (using the rest) = {A,B,C} ∋ C  → yes
                  so AB → C  becomes  A → C, which we already have. Drop it.
        A → B,  A → C,  B → C

Step 3 — redundant FDs
        Remove A → C, then A⁺ = {A} → A→B → {A,B} → B→C → {A,B,C} ∋ C
        So A → C is redundant. Drop it.
        A → B,  B → C

Canonical cover  Fc = { A → B,  B → C }`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A canonical cover is <b>not unique</b> — the order in which you remove things can lead to different
              (but equivalent) minimal sets. Saying so pre-empts a follow-up.
            </>
          ),
        },
      ],
    },

    {
      id: 'equivalence',
      heading: 'Are two FD sets equivalent?',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              F and G are equivalent if <code>F⁺ = G⁺</code>. You never compute the full closures — you check
              coverage in both directions.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Procedure',
          code: `Does F cover G?
    for each  X → Y  in G:
        compute X⁺ using only F
        if Y ⊄ X⁺  →  F does not cover G

Does G cover F?    (same test, roles swapped)

Both directions hold  →  F ≡ G
Only F covers G       →  G is weaker; F ⊃ G
Neither               →  incomparable`,
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a functional dependency?',
      a: (
        <>
          <code>X → Y</code> holds if any two tuples that agree on X must also agree on Y — knowing X determines a
          unique Y. It is a constraint on all valid instances of the relation, decided by the real world, not by the
          current rows.
        </>
      ),
    },
    {
      q: 'Can you prove an FD holds by looking at the data?',
      a: (
        <>
          No. Data can only <b>disprove</b> an FD — find two tuples that agree on X but differ on Y. Holding in the
          current instance is a coincidence, not a guarantee; FDs come from the semantics of the domain.
        </>
      ),
    },
    {
      q: 'What is attribute closure and what is it used for?',
      a: (
        <>
          <code>X⁺</code> is the set of all attributes functionally determined by X. Use it to test whether an FD is
          implied (<code>Y ⊆ X⁺</code>), whether X is a super key (<code>X⁺ = R</code>), to find candidate keys, and
          to check FD-set equivalence.
        </>
      ),
    },
    {
      q: "State Armstrong's axioms.",
      a: (
        <>
          <b>Reflexivity</b>: if Y ⊆ X then X → Y. <b>Augmentation</b>: if X → Y then XZ → YZ.{' '}
          <b>Transitivity</b>: if X → Y and Y → Z then X → Z. They are sound (derive only valid FDs) and complete
          (derive all valid FDs). Union, decomposition and pseudo-transitivity follow from them.
        </>
      ),
    },
    {
      q: 'From AB → C, can you conclude A → C?',
      a: (
        <>
          <b>No.</b> Decomposition applies only to the right-hand side. <code>AB → C</code> says the{' '}
          <i>combination</i> of A and B determines C; neither alone need do so. Splitting a left-hand side is the
          classic FD mistake.
        </>
      ),
    },
    {
      q: 'Difference between partial and transitive dependency?',
      a: (
        <>
          A <b>partial</b> dependency is a non-prime attribute depending on only <i>part</i> of a composite
          candidate key — it violates 2NF. A <b>transitive</b> dependency is a non-prime attribute depending on
          another non-prime attribute (X → Y → Z) — it violates 3NF.
        </>
      ),
    },
    {
      q: 'How do you find all candidate keys from a set of FDs?',
      a: (
        <>
          Classify attributes: those appearing only on the <b>left</b> (or in no FD) must be in every key; those
          appearing only on the <b>right</b> can never be in a key. Seed with the mandatory attributes, compute the
          closure, and if it does not cover R add "both-side" attributes one at a time, keeping only minimal sets
          whose closure is R.
        </>
      ),
    },
    {
      q: 'What is a canonical cover and why compute one?',
      a: (
        <>
          The minimal FD set equivalent to F: single attributes on the right, no extraneous left attributes, no
          redundant FDs. It is the input to 3NF synthesis, and it makes constraint checking cheaper because there
          are fewer dependencies to verify on each update. It is not unique.
        </>
      ),
    },
    {
      q: 'What is a prime attribute?',
      a: (
        <>
          An attribute that belongs to at least one candidate key. Everything else is non-prime. Nearly every normal
          form is defined in terms of what non-prime attributes are allowed to depend on.
        </>
      ),
    },
    {
      q: 'How do you check whether two FD sets are equivalent?',
      a: (
        <>
          Check coverage both ways: for every FD <code>X → Y</code> in G, compute <code>X⁺</code> using only F and
          confirm <code>Y ⊆ X⁺</code>; then do the same with the roles swapped. If both directions hold, F ≡ G.
        </>
      ),
    },
  ],
};

export default topic;
