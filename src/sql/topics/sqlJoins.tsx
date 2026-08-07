import { Dg, Rel, Txt, Venn } from '../dgm';
import type { SqlTopic } from '../types';

/** The four join types as Venn diagrams. */
function JoinVenns() {
  return (
    <Dg w={620} h={150} cap="Shaded = the rows the join keeps">
      <Venn x={16} y={14} r={34} keep="inner" label="INNER JOIN" />
      <Venn x={172} y={14} r={34} keep="left" label="LEFT JOIN" />
      <Venn x={328} y={14} r={34} keep="right" label="RIGHT JOIN" />
      <Venn x={484} y={14} r={34} keep="full" label="FULL OUTER JOIN" />
    </Dg>
  );
}

/** The same two tables joined four ways, with the actual rows. */
function JoinResults() {
  return (
    <Dg w={620} h={370} cap="Kiran has no department; Legal has no employees. Watch where each disappears.">
      <Rel
        x={40}
        y={26}
        title="employees"
        cols={['name', 'dept_id']}
        rows={[
          ['Asha', '1'],
          ['Neha', '2'],
          ['Kiran', 'NULL'],
        ]}
        cw={[76, 70]}
        c="a"
        mark={{ '2,1': 'c' }}
      />
      <Rel
        x={330}
        y={26}
        title="departments"
        cols={['id', 'name']}
        rows={[
          ['1', 'Eng'],
          ['2', 'Sales'],
          ['3', 'Legal'],
        ]}
        cw={[52, 84]}
        c="b"
        pk={[0]}
      />

      <Txt x={130} y={168} fs={11} bold c="a">
        INNER — only matches
      </Txt>
      <Rel
        x={40}
        y={178}
        cols={['name', 'dept']}
        rows={[
          ['Asha', 'Eng'],
          ['Neha', 'Sales'],
        ]}
        cw={[76, 76]}
        c="a"
      />

      <Txt x={330} y={168} fs={11} bold c="c">
        LEFT — keeps Kiran
      </Txt>
      <Rel
        x={240}
        y={178}
        cols={['name', 'dept']}
        rows={[
          ['Asha', 'Eng'],
          ['Neha', 'Sales'],
          ['Kiran', 'NULL'],
        ]}
        cw={[76, 76]}
        c="c"
        mark={{ '2,1': 'c' }}
      />

      <Txt x={510} y={168} fs={11} bold c="b">
        RIGHT — keeps Legal
      </Txt>
      <Rel
        x={440}
        y={178}
        cols={['name', 'dept']}
        rows={[
          ['Asha', 'Eng'],
          ['Neha', 'Sales'],
          ['NULL', 'Legal'],
        ]}
        cw={[76, 76]}
        c="b"
        mark={{ '2,0': 'c' }}
      />

      <Txt x={310} y={318} fs={11} bold c="n">
        FULL OUTER — keeps both unmatched rows: Asha, Neha, Kiran (NULL dept) and Legal (NULL name)
      </Txt>
      <Txt x={310} y={348} fs={10.5} soft>
        an outer join never loses rows from the side it favours — it pads the missing side with NULLs
      </Txt>
    </Dg>
  );
}

const topic: SqlTopic = {
  slug: 'sql-joins',
  num: 2,
  unit: 'Querying',
  title: 'Joins',
  blurb:
    'The four join types with the rows each keeps, self joins and cross joins, and the NULL trap that turns an outer join back into an inner one.',
  minutes: 11,
  free: true,
  tags: ['Very common', 'Guaranteed question'],

  sections: [
    {
      id: 'four-joins',
      heading: 'The four join types',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A join combines rows from two tables on a matching condition. The only question that separates the
              four types is <b>what happens to rows that do not match</b>.
            </>
          ),
        },
        { k: 'diagram', el: <JoinVenns />, caption: 'The classic Venn view.' },
        {
          k: 'table',
          head: ['Type', 'Keeps', 'Syntax'],
          rows: [
            ['INNER JOIN', 'Only rows with a match on both sides', 'JOIN departments d ON e.dept_id = d.id'],
            ['LEFT JOIN', 'All left rows; unmatched right columns become NULL', 'LEFT JOIN departments d ON …'],
            ['RIGHT JOIN', 'All right rows; unmatched left columns become NULL', 'RIGHT JOIN departments d ON …'],
            ['FULL OUTER JOIN', 'All rows from both sides, padded with NULLs', 'FULL OUTER JOIN departments d ON …'],
          ],
        },
        { k: 'diagram', el: <JoinResults />, caption: 'The same data, four results.' },
        {
          k: 'code',
          title: 'The query behind the left join above',
          code: `SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

  name  | dept
  ------+-------
  Asha  | Eng
  Neha  | Sales
  Kiran | NULL     <- kept, because LEFT keeps every employee`,
        },
      ],
    },

    {
      id: 'other-joins',
      heading: 'Self join and cross join',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Two more that come up constantly, and neither is a fifth "type" — they are ordinary joins applied
              differently.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Self join — a table joined to itself',
          code: `-- every employee alongside their manager, from one table
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- LEFT, not INNER: the CEO has no manager and would otherwise vanish`,
        },
        {
          k: 'code',
          title: 'Cross join — every combination',
          code: `SELECT s.size, c.colour
FROM sizes s
CROSS JOIN colours c;      -- 3 sizes x 4 colours = 12 rows

-- an INNER JOIN with no ON clause is the same thing, usually by accident`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              A forgotten <code>ON</code> clause silently becomes a <b>cross join</b>. On two tables of 10,000 rows
              that is 100 million rows — the classic cause of a query that "hangs".
            </>
          ),
        },
      ],
    },

    {
      id: 'traps',
      heading: 'The traps',
      blocks: [
        {
          k: 'note',
          tone: 'exam',
          title: 'Filtering a LEFT JOIN in WHERE turns it into an INNER JOIN',
          text: (
            <>
              This is the single most-asked join gotcha. A condition on the <i>right</i> table placed in{' '}
              <code>WHERE</code> is evaluated <b>after</b> the join, and the padded NULL rows fail it — so they are
              dropped, and your outer join quietly becomes an inner one.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The difference between ON and WHERE',
          code: `-- WRONG: the NULL row for Kiran fails "d.name <> 'HR'" and disappears
SELECT e.name, d.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.name <> 'HR';

-- RIGHT: put the condition in ON, so it filters what is joined,
--        not what survives
SELECT e.name, d.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id AND d.name <> 'HR';

-- Rule: conditions on the OUTER side belong in ON.
--       Conditions on the preserved side belong in WHERE.`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>NULL never equals NULL</b> in a join condition. Two rows with a NULL <code>dept_id</code> will not
              match each other.
            </>,
            <>
              <b>Joins can multiply rows.</b> If the right table has three matches for one left row, that left row
              appears three times — which quietly inflates any <code>SUM</code> you compute afterwards.
            </>,
            <>
              <b>RIGHT JOIN is rare in practice</b> — most people swap the table order and use LEFT, because it
              reads in the same direction as the FROM clause.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between INNER JOIN and LEFT JOIN?',
      a: (
        <>
          <b>INNER</b> returns only rows that match on both sides. <b>LEFT</b> returns every row from the left
          table, filling the right table's columns with NULL where there is no match. Use LEFT when the absence of a
          match is itself information.
        </>
      ),
    },
    {
      q: 'What is a FULL OUTER JOIN?',
      a: (
        <>
          It returns all rows from both tables — matched rows joined, plus unmatched rows from each side padded with
          NULLs. It is the union of a LEFT and a RIGHT join. MySQL has no FULL OUTER JOIN, so you emulate it with{' '}
          <code>LEFT ... UNION ... RIGHT</code>.
        </>
      ),
    },
    {
      q: 'What is a self join and when do you need one?',
      a: (
        <>
          A table joined to itself using two aliases — needed whenever rows relate to other rows in the same table,
          such as employee → manager, or comparing each row to its predecessor. Use LEFT so the top of the hierarchy
          is not dropped.
        </>
      ),
    },
    {
      q: 'What is a cross join?',
      a: (
        <>
          The Cartesian product — every row of one table paired with every row of the other, giving m × n rows.
          Deliberate uses are generating combinations or a date series; accidental ones come from omitting the{' '}
          <code>ON</code> clause, and are a common cause of a query that never returns.
        </>
      ),
    },
    {
      q: 'Why does putting a condition in WHERE break a LEFT JOIN?',
      a: (
        <>
          <code>WHERE</code> is applied <b>after</b> the join. The NULL-padded rows the LEFT JOIN added fail almost
          any condition on the right table, so they get filtered out — turning the outer join back into an inner
          one. Put such conditions in the <code>ON</code> clause instead.
        </>
      ),
    },
    {
      q: 'How many rows does a join return?',
      a: (
        <>
          Between 0 and m × n. If the join column is unique on one side you get at most one match per row; if it is
          non-unique on both sides rows <b>multiply</b>. That row multiplication is why a SUM after a join is often
          wrong.
        </>
      ),
    },
    {
      q: 'Do two NULLs match in a join condition?',
      a: (
        <>
          No. <code>NULL = NULL</code> evaluates to <b>unknown</b>, not true, so rows with NULL in the join column
          never match anything — including each other. That is exactly why they only survive an outer join.
        </>
      ),
    },
  ],
};

export default topic;
