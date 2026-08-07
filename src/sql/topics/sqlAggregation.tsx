import { Arrow, Dg, Rel, Txt } from '../dgm';
import type { SqlTopic } from '../types';

/** Rows collapsing into buckets, then buckets being filtered. */
function GroupByFlow() {
  return (
    <Dg w={620} h={300} cap="GROUP BY collapses rows into buckets; HAVING then filters the buckets">
      <Rel
        x={16}
        y={30}
        title="employees"
        cols={['name', 'dept', 'salary']}
        rows={[
          ['Asha', 'Eng', '90000'],
          ['Ravi', 'Eng', '85000'],
          ['Neha', 'Sales', '62500'],
          ['Imran', 'Sales', '55000'],
          ['Kiran', 'HR', '50000'],
        ]}
        cw={[64, 60, 66]}
        c="n"
      />

      <Arrow x1={216} y1={110} x2={266} y2={110} c="a" label="GROUP BY dept" dy={-10} dx={16} />

      <Rel
        x={272}
        y={44}
        title="after GROUP BY"
        cols={['dept', 'AVG(salary)']}
        rows={[
          ['Eng', '87500'],
          ['Sales', '58750'],
          ['HR', '50000'],
        ]}
        cw={[66, 100]}
        c="a"
      />

      <Arrow x1={442} y1={110} x2={492} y2={110} c="b" label="HAVING > 60000" dy={-10} dx={20} />

      <Rel
        x={498}
        y={68}
        title="result"
        cols={['dept', 'avg']}
        rows={[['Eng', '87500']]}
        cw={[54, 62]}
        c="b"
      />

      <Txt x={310} y={230} fs={11} bold c="c">
        WHERE filters rows · HAVING filters groups
      </Txt>
      <Txt x={310} y={254} fs={10.5} soft>
        WHERE runs before the buckets exist, so it can never see an aggregate
      </Txt>
      <Txt x={310} y={276} fs={10.5} soft>
        five rows became three buckets, and one bucket survived the filter
      </Txt>
    </Dg>
  );
}

const topic: SqlTopic = {
  slug: 'sql-aggregation',
  num: 3,
  unit: 'Querying',
  title: 'Aggregates, GROUP BY, HAVING & Subqueries',
  blurb:
    'The five aggregate functions, how grouping and filtering groups differ from filtering rows, and when a subquery beats a join.',
  minutes: 12,
  tags: ['Very common'],

  sections: [
    {
      id: 'aggregates',
      heading: 'Aggregate functions',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Functions that collapse many rows into one number. They are what makes <code>GROUP BY</code> useful —
              without one, grouping has nothing to compute.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Function', 'Returns', 'Ignores NULL?'],
          rows: [
            ['COUNT(*)', 'Number of rows', 'No — counts every row'],
            ['COUNT(col)', 'Number of non-NULL values in that column', 'Yes'],
            ['SUM(col)', 'Total of a numeric column', 'Yes'],
            ['AVG(col)', 'Mean of a numeric column', 'Yes'],
            ['MIN(col) / MAX(col)', 'Smallest / largest value', 'Yes'],
          ],
        },
        {
          k: 'code',
          title: 'Example',
          code: `SELECT COUNT(*) AS headcount, MAX(salary) AS top_salary
FROM employees;

  headcount | top_salary
  ----------+-----------
          5 |      90000`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)',
          text: (
            <>
              <code>COUNT(*)</code> counts <b>rows</b>. <code>COUNT(col)</code> counts rows where that column is{' '}
              <b>not NULL</b>. <code>COUNT(DISTINCT col)</code> counts distinct non-NULL values. On a table with
              five rows where two have a NULL email, the three answers are 5, 3 and however many unique emails
              exist.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>AVG ignores NULLs entirely</b> — it divides by the count of non-NULL values, not by the row count.
              If you want NULL treated as zero you must say so: <code>AVG(COALESCE(col, 0))</code>. This is a
              genuine source of wrong reports.
            </>
          ),
        },
      ],
    },

    {
      id: 'group-by',
      heading: 'GROUP BY and HAVING',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <code>GROUP BY</code> collapses rows into buckets so aggregate functions can run per bucket.{' '}
              <code>HAVING</code> filters those buckets <b>after</b> aggregation — <code>WHERE</code> cannot,
              because it runs before grouping.
            </>
          ),
        },
        { k: 'diagram', el: <GroupByFlow />, caption: 'Five rows → three buckets → one surviving bucket.' },
        {
          k: 'code',
          title: 'Departments with an average salary above 60,000',
          code: `SELECT dept, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept
HAVING AVG(salary) > 60000;

  dept | avg_salary
  -----+-----------
  Eng  |      87500      -- Sales 58750 and HR 50000 were filtered out`,
        },
        {
          k: 'table',
          head: ['', 'WHERE', 'HAVING'],
          rows: [
            ['Filters', 'Individual rows', 'Groups'],
            ['Runs', 'Before GROUP BY', 'After GROUP BY'],
            ['Can use aggregates', 'No', 'Yes'],
            ['Can use a plain column', 'Yes', 'Only if it is in the GROUP BY'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Use <b>both</b> when you can: <code>WHERE</code> first to throw away rows you never want, then{' '}
              <code>HAVING</code> on the groups. Filtering early means fewer rows to aggregate, which is faster.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Every column in <code>SELECT</code> must either appear in <code>GROUP BY</code> or be wrapped in an
              aggregate. Selecting a bare column that is not grouped is an error in most databases — and in older
              MySQL it silently returned an arbitrary row, which is worse.
            </>
          ),
        },
      ],
    },

    {
      id: 'subquery',
      heading: 'Subquery vs join',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>subquery</b> is a query nested inside another — useful when you need a computed value, like an
              average, before you can filter against it. A <b>join</b> is usually faster when you are actually
              combining columns from two tables.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Employees earning above the company average',
          code: `SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- the inner query runs first and produces one number (68500);
-- the outer query then filters against it`,
        },
        {
          k: 'table',
          head: ['Reach for a subquery when', 'Reach for a join when'],
          rows: [
            ['You need an aggregate as a filter condition', 'You want columns from both tables in the output'],
            ['The nested logic is genuinely easier to read on its own', 'Performance matters on large tables — joins are better optimized'],
            ['You are testing existence with EXISTS / NOT EXISTS', 'You are matching rows, not computing a threshold'],
          ],
        },
        { k: 'h', text: 'Correlated vs non-correlated' },
        {
          k: 'code',
          title: 'The distinction that matters for performance',
          code: `-- NON-CORRELATED: the inner query is independent.
-- It runs ONCE, and its result is reused.
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- CORRELATED: the inner query references the outer row (e.dept).
-- It runs ONCE PER ROW of the outer query - potentially very slow.
SELECT name FROM employees e
WHERE salary > (SELECT AVG(salary) FROM employees WHERE dept = e.dept);`,
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              If asked "why is this query slow?", a <b>correlated subquery in the WHERE clause</b> is one of the
              first things to look for — it re-executes for every candidate row. Rewriting it as a join against a
              grouped subquery usually fixes it.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between WHERE and HAVING?',
      a: (
        <>
          <code>WHERE</code> filters <b>rows before</b> grouping and cannot use aggregates. <code>HAVING</code>{' '}
          filters <b>groups after</b> aggregation and can. Use both together where possible — WHERE first to cut the
          row count, HAVING after to drop unwanted groups.
        </>
      ),
    },
    {
      q: 'Difference between COUNT(*) and COUNT(column)?',
      a: (
        <>
          <code>COUNT(*)</code> counts every row. <code>COUNT(column)</code> counts only rows where that column is{' '}
          <b>not NULL</b>. So they differ exactly by the number of NULLs in that column.
        </>
      ),
    },
    {
      q: 'How do aggregate functions treat NULL?',
      a: (
        <>
          They <b>skip</b> it — except <code>COUNT(*)</code>. <code>AVG</code> divides by the count of non-NULL
          values, not the row count, so a column with NULLs gives a higher average than treating them as zero. Use{' '}
          <code>COALESCE</code> if you want them counted.
        </>
      ),
    },
    {
      q: 'What must appear in GROUP BY?',
      a: (
        <>
          Every column in the <code>SELECT</code> list that is not wrapped in an aggregate. Otherwise the database
          cannot tell which of the many rows in a group the value should come from — most engines reject it
          outright.
        </>
      ),
    },
    {
      q: 'When would you use a subquery instead of a join?',
      a: (
        <>
          When you need a <b>computed value as a filter</b> — like comparing each salary against the overall average
          — or when testing existence with <code>EXISTS</code>. Use a join when you need columns from both tables in
          the result, or when performance matters on large tables.
        </>
      ),
    },
    {
      q: 'Difference between a correlated and a non-correlated subquery?',
      a: (
        <>
          A <b>non-correlated</b> subquery is independent, runs once, and its result is reused. A{' '}
          <b>correlated</b> subquery references a column from the outer query, so it re-executes <b>once per outer
          row</b> — which is a common cause of slow queries and is usually rewritable as a join.
        </>
      ),
    },
    {
      q: 'How would you find the second-highest salary?',
      a: (
        <>
          Several ways. Simplest portable version:{' '}
          <code>
            SELECT MAX(salary) FROM employees WHERE salary &lt; (SELECT MAX(salary) FROM employees)
          </code>
          . Alternatives are <code>LIMIT 1 OFFSET 1</code> on a sorted distinct list, or{' '}
          <code>DENSE_RANK() = 2</code> with a window function — the last is the one to mention if they want the
          Nth.
        </>
      ),
    },
    {
      q: 'Why might a SUM be wrong after a join?',
      a: (
        <>
          Because the join <b>multiplied rows</b>. If each order has three line items, joining orders to items
          repeats the order total three times and the SUM triples. Aggregate in a subquery first, then join to the
          result.
        </>
      ),
    },
  ],
};

export default topic;
