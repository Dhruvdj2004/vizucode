import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { SqlTopic } from '../types';

/** GROUP BY collapses rows; a window function keeps them. */
function WindowVsGroup() {
  return (
    <Dg w={620} h={296} cap="Both compute an average per department — only one keeps the individual rows">
      <Rel
        x={190}
        y={22}
        title="employees"
        cols={['name', 'dept', 'salary']}
        rows={[
          ['Asha', 'Eng', '90000'],
          ['Ravi', 'Eng', '85000'],
          ['Neha', 'Sales', '62500'],
        ]}
        cw={[66, 62, 70]}
        c="n"
      />

      <Arrow x1={240} y1={140} x2={150} y2={172} c="a" label="GROUP BY" dy={-8} dx={-16} />
      <Arrow x1={400} y1={140} x2={470} y2={172} c="b" label="OVER()" dy={-8} dx={18} />

      <Rel
        x={16}
        y={178}
        title="GROUP BY dept"
        cols={['dept', 'avg']}
        rows={[
          ['Eng', '87500'],
          ['Sales', '62500'],
        ]}
        cw={[66, 74]}
        c="a"
      />
      <Txt x={86} y={286} fs={10.5} bold c="a">
        3 rows → 2 · names gone
      </Txt>

      <Rel
        x={318}
        y={178}
        title="AVG(salary) OVER (PARTITION BY dept)"
        cols={['name', 'salary', 'dept_avg']}
        rows={[
          ['Asha', '90000', '87500'],
          ['Ravi', '85000', '87500'],
          ['Neha', '62500', '62500'],
        ]}
        cw={[66, 70, 78]}
        c="b"
      />
      <Txt x={430} y={286} fs={10.5} bold c="b">
        3 rows → 3 · every name kept, average alongside
      </Txt>
    </Dg>
  );
}

/** How the three ranking functions differ on ties. */
function RankingFunctions() {
  return (
    <Dg w={600} h={220} cap="The same salaries, ranked three ways — watch rows 2, 3 and 4">
      <Rel
        x={60}
        y={26}
        cols={['salary', 'ROW_NUMBER()', 'RANK()', 'DENSE_RANK()']}
        rows={[
          ['90000', '1', '1', '1'],
          ['85000', '2', '2', '2'],
          ['85000', '3', '2', '2'],
          ['70000', '4', '4', '3'],
        ]}
        cw={[76, 116, 84, 106]}
        c="a"
        mark={{
          '1,2': 'b', '2,2': 'b',
          '1,3': 'b', '2,3': 'b',
          '3,1': 'c', '3,2': 'c', '3,3': 'c',
        }}
      />
      <Txt x={300} y={168} fs={10.5} soft>
        ROW_NUMBER never ties · RANK ties then skips · DENSE_RANK ties and does not skip
      </Txt>
      <Txt x={300} y={196} fs={10.5} bold c="c">
        after the tie: ROW_NUMBER gives 4, RANK gives 4, DENSE_RANK gives 3
      </Txt>
    </Dg>
  );
}

const topic: SqlTopic = {
  slug: 'sql-window',
  num: 4,
  unit: 'Querying',
  title: 'Window Functions',
  blurb:
    'Computing across a set of related rows without collapsing them — PARTITION BY, the three ranking functions, and the tie behaviour interviewers test.',
  minutes: 10,
  tags: ['Very common', 'Senior signal'],

  sections: [
    {
      id: 'idea',
      heading: 'What a window function does',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Unlike <code>GROUP BY</code>, a window function <b>keeps every row visible</b> while still computing
              something across a related set of rows — the "window", defined by{' '}
              <code>OVER (PARTITION BY … ORDER BY …)</code>.
            </>
          ),
        },
        { k: 'diagram', el: <WindowVsGroup />, caption: 'GROUP BY collapses; OVER() annotates.' },
        {
          k: 'code',
          title: 'The two ways to ask "how does this row compare to its group?"',
          code: `-- GROUP BY: three rows become two. The names are gone.
SELECT dept, AVG(salary)
FROM employees
GROUP BY dept;

-- WINDOW: three rows stay three. Each keeps its name AND gains the average.
SELECT name, salary, dept,
       AVG(salary) OVER (PARTITION BY dept) AS dept_avg
FROM employees;`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The one-line answer',
          text: (
            <>
              <b>GROUP BY collapses rows into one per group; a window function computes across the group but
              returns one row per input row.</b> That is why "show each employee next to their department average"
              is impossible with GROUP BY alone and trivial with a window function.
            </>
          ),
        },
      ],
    },

    {
      id: 'syntax',
      heading: 'The OVER clause',
      blocks: [
        {
          k: 'code',
          title: 'Three parts, all optional',
          code: `func() OVER (
    PARTITION BY dept       -- split rows into windows (like GROUP BY, but non-collapsing)
    ORDER BY salary DESC    -- order within each window (required for ranking)
    ROWS BETWEEN ...        -- narrow the frame further (running totals, moving averages)
)

OVER ()                     -- empty: the window is the entire result set`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>PARTITION BY</b> — resets the calculation for each group. Omit it and the whole result set is one
              window.
            </>,
            <>
              <b>ORDER BY</b> — orders rows inside the window. Required by the ranking functions, and it is what
              turns <code>SUM</code> into a <b>running total</b>.
            </>,
            <>
              <b>Frame clause</b> — narrows the window further, for moving averages and rolling sums.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'A running total, which needs ORDER BY',
          code: `SELECT name, salary,
       SUM(salary) OVER (ORDER BY id) AS running_total
FROM employees;

-- without ORDER BY, SUM(salary) OVER () is the grand total on every row`,
        },
      ],
    },

    {
      id: 'ranking',
      heading: 'The three ranking functions',
      blocks: [
        {
          k: 'code',
          title: 'Rank employees by salary, within each department',
          code: `SELECT name, dept, salary,
       RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
FROM employees;`,
        },
        { k: 'diagram', el: <RankingFunctions />, caption: 'They only differ when there is a tie.' },
        {
          k: 'table',
          head: ['Function', 'On a tie', 'Sequence'],
          rows: [
            ['ROW_NUMBER()', 'Breaks ties arbitrarily — always unique', '1, 2, 3, 4'],
            ['RANK()', 'Ties share a rank, then the next rank skips', '1, 2, 2, 4'],
            ['DENSE_RANK()', 'Ties share a rank, and the next rank does not skip', '1, 2, 2, 3'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Which to use: <b>ROW_NUMBER</b> to pick exactly one row per group (deduplication, "latest record per
              user"), <b>RANK</b> for competition-style placings where two silvers mean no bronze, and{' '}
              <b>DENSE_RANK</b> for "the Nth distinct value" — which is the clean way to answer the Nth-highest
              salary question.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The two classic uses',
          code: `-- Nth highest salary, ties counted once
SELECT DISTINCT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r
  FROM employees
) t WHERE r = 3;

-- one row per group: the most recent order per customer
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id
                               ORDER BY created_at DESC) AS rn
  FROM orders
) t WHERE rn = 1;`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              A window function cannot appear in <code>WHERE</code> — it is evaluated <b>after</b> WHERE, alongside
              SELECT. That is why both queries above wrap it in a subquery or CTE and filter on the outside. This
              catches almost everyone the first time.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a window function?',
      a: (
        <>
          A function that computes a value across a set of rows related to the current row — the window — while{' '}
          <b>still returning one row per input row</b>. Defined with{' '}
          <code>OVER (PARTITION BY … ORDER BY …)</code>.
        </>
      ),
    },
    {
      q: 'Difference between GROUP BY and a window function?',
      a: (
        <>
          <b>GROUP BY collapses</b> many rows into one per group, so the individual rows are gone. A{' '}
          <b>window function preserves</b> every row and attaches the computed value to each. If you need each
          employee shown next to their department average, only the window function can do it.
        </>
      ),
    },
    {
      q: 'Difference between ROW_NUMBER, RANK and DENSE_RANK?',
      a: (
        <>
          They differ only on ties. <b>ROW_NUMBER</b> always assigns unique numbers (1,2,3,4). <b>RANK</b> gives
          tied rows the same rank then skips (1,2,2,4). <b>DENSE_RANK</b> gives tied rows the same rank and does
          not skip (1,2,2,3).
        </>
      ),
    },
    {
      q: 'What does PARTITION BY do?',
      a: (
        <>
          Splits the rows into independent windows, restarting the calculation for each — like <code>GROUP BY</code>{' '}
          but without collapsing. Omit it and the entire result set is treated as one window.
        </>
      ),
    },
    {
      q: 'Why can you not use a window function in a WHERE clause?',
      a: (
        <>
          Because window functions are evaluated at the <b>SELECT</b> stage, which runs <i>after</i>{' '}
          <code>WHERE</code>. The value does not exist yet when WHERE is applied. Wrap the query in a subquery or
          CTE and filter on the outer level.
        </>
      ),
    },
    {
      q: 'How would you find the third-highest salary using a window function?',
      a: (
        <>
          Compute <code>DENSE_RANK() OVER (ORDER BY salary DESC)</code> in a subquery, then filter{' '}
          <code>WHERE r = 3</code> on the outside. DENSE_RANK rather than RANK, so that ties do not consume a
          position and skip the third distinct value.
        </>
      ),
    },
    {
      q: 'How do you get the most recent row per group?',
      a: (
        <>
          <code>ROW_NUMBER() OVER (PARTITION BY group_col ORDER BY created_at DESC)</code> in a subquery, then keep{' '}
          <code>rn = 1</code>. ROW_NUMBER rather than RANK, because you want exactly one row even if two share a
          timestamp.
        </>
      ),
    },
    {
      q: 'How do you compute a running total?',
      a: (
        <>
          <code>SUM(col) OVER (ORDER BY something)</code>. The <code>ORDER BY</code> inside OVER is what makes it
          cumulative — without it the window is the whole partition and you get the same grand total on every row.
        </>
      ),
    },
  ],
};

export default topic;
