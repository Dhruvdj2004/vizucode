import type { SqlTopic } from '../types';

const topic: SqlTopic = {
  slug: 'sql-revision',
  num: 5,
  unit: 'Quick Revision',
  title: '10-Minute SQL Revision',
  blurb:
    'Clause execution order, every join, the aggregate rules and the window-function syntax — plus the query patterns interviews ask you to write on the spot.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'order',
      heading: 'The execution order — the answer to half the questions',
      blocks: [
        {
          k: 'code',
          title: 'Written order vs the order the engine runs it',
          code: `WRITTEN                 EXECUTED
SELECT                  1. FROM      + JOIN   pick and combine the tables
FROM                    2. WHERE                filter individual ROWS
JOIN                    3. GROUP BY             collapse into groups
WHERE                   4. HAVING               filter GROUPS
GROUP BY                5. SELECT               compute the output columns
HAVING                  6. DISTINCT
ORDER BY                7. ORDER BY             sort
LIMIT                   8. LIMIT                cut`,
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Two consequences you can quote directly: <b>WHERE cannot use an aggregate</b> (it runs before
              grouping — use HAVING), and <b>a SELECT alias cannot be used in WHERE</b> but <b>can</b> be used in
              ORDER BY, because ORDER BY runs after SELECT.
            </>
          ),
        },
      ],
    },

    {
      id: 'joins',
      heading: 'Joins — what each one keeps',
      blocks: [
        {
          k: 'table',
          head: ['Join', 'Keeps', 'Unmatched side becomes'],
          rows: [
            ['INNER JOIN', 'Only rows matching in both tables', '— (dropped)'],
            ['LEFT JOIN', 'All left rows + matches', 'NULLs on the right'],
            ['RIGHT JOIN', 'All right rows + matches', 'NULLs on the left'],
            ['FULL OUTER JOIN', 'Everything from both', 'NULLs on whichever side is missing'],
            ['CROSS JOIN', 'Every combination — n × m rows', '— (no condition)'],
            ['SELF JOIN', 'A table joined to itself, via aliases', 'Depends on the join type used'],
          ],
        },
        {
          k: 'code',
          title: 'The two patterns they ask you to write',
          code: `-- Rows in A with no match in B ("find employees with no manager")
SELECT a.*
FROM   a LEFT JOIN b ON a.id = b.a_id
WHERE  b.a_id IS NULL;

-- Self join: each employee with their manager's name
SELECT e.name AS employee, m.name AS manager
FROM   employees e LEFT JOIN employees m ON e.manager_id = m.id;`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Putting a condition on the right table in <code>WHERE</code> instead of <code>ON</code>{' '}
              <b>turns a LEFT JOIN back into an INNER JOIN</b> — the NULL rows you deliberately kept fail the
              filter and vanish. Filter the right table in <code>ON</code>; filter the left table in{' '}
              <code>WHERE</code>.
            </>
          ),
        },
      ],
    },

    {
      id: 'aggregates',
      heading: 'Aggregates, NULLs and subqueries',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>COUNT(*) counts rows; COUNT(col) skips NULLs</b>; <code>COUNT(DISTINCT col)</code> counts distinct
              non-NULL values. The most common one-line mistake in interviews.
            </>,
            <>
              <b>Every aggregate except COUNT(*) ignores NULLs</b>, so <code>AVG(col)</code> divides by the number
              of non-NULL rows — not by the row count.
            </>,
            <>
              <b>NULL is not a value</b>, it is unknown. <code>col = NULL</code> is never true; use{' '}
              <code>IS NULL</code>. And <code>NULL + 5</code> is NULL — use <code>COALESCE</code>.
            </>,
            <>
              <b>WHERE filters rows, HAVING filters groups.</b> If the condition mentions an aggregate it belongs
              in HAVING.
            </>,
            <>
              <b>Correlated subquery</b> references the outer query and re-runs per row (slow);{' '}
              <b>non-correlated</b> runs once. Rewriting a correlated subquery as a join is the standard
              optimisation answer.
            </>,
            <>
              <b>UNION removes duplicates and sorts; UNION ALL does not</b> — so UNION ALL is faster, and is the
              right default when you know there are no duplicates.
            </>,
            <>
              <b>DELETE vs TRUNCATE vs DROP</b> — DML with WHERE and rollback; DDL that empties the table fast; DDL
              that removes the table entirely.
            </>,
          ],
        },
      ],
    },

    {
      id: 'windows',
      heading: 'Window functions',
      blocks: [
        {
          k: 'code',
          title: 'The shape',
          code: `func() OVER (PARTITION BY col ORDER BY col)
        |            |                  |
     what to      reset the        order within
     compute      window per       each window
                  group

ROW_NUMBER()  1 2 3 4   always distinct, ties broken arbitrarily
RANK()        1 2 2 4   ties share, then the rank GAPS
DENSE_RANK()  1 2 2 3   ties share, no gap
LAG / LEAD    previous / next row's value in the window`,
        },
        {
          k: 'code',
          title: 'Nth highest salary — the canonical question',
          code: `-- 2nd highest, handling ties correctly
SELECT DISTINCT salary
FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r
      FROM employees) t
WHERE r = 2;

-- Top earner per department
SELECT * FROM (
  SELECT name, dept, salary,
         RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r
  FROM employees) t
WHERE r = 1;`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>GROUP BY collapses rows; a window function does not.</b> Use GROUP BY when you want one row per
              group, a window when you want every row to also see its group's aggregate. That single sentence
              answers the comparison question.
            </>
          ),
        },
      ],
    },

    {
      id: 'patterns',
      heading: 'Query patterns worth having memorised',
      blocks: [
        {
          k: 'code',
          title: 'Duplicates, second-highest, per-group filtering',
          code: `-- Find duplicate emails
SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Delete duplicates, keep the lowest id
DELETE FROM users
WHERE id NOT IN (SELECT MIN(id) FROM users GROUP BY email);

-- Departments with more than 5 employees, highest headcount first
SELECT dept, COUNT(*) AS n
FROM   employees
GROUP  BY dept
HAVING COUNT(*) > 5
ORDER  BY n DESC;

-- Employees earning more than their department average
SELECT e.name
FROM   employees e
WHERE  e.salary > (SELECT AVG(salary) FROM employees
                   WHERE dept = e.dept);        -- correlated`,
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the logical execution order of a SQL query?',
      a: (
        <>
          FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. This is why WHERE cannot
          reference an aggregate or a SELECT alias, while ORDER BY can reference both.
        </>
      ),
    },
    {
      q: 'WHERE vs HAVING?',
      a: (
        <>
          <b>WHERE</b> filters individual rows before grouping; <b>HAVING</b> filters groups after. Any condition
          involving an aggregate must go in HAVING.
        </>
      ),
    },
    {
      q: 'Difference between INNER JOIN and LEFT JOIN?',
      a: (
        <>
          INNER keeps only rows that match in both tables. LEFT keeps <b>every</b> left-table row, filling the
          right side with NULLs where there is no match — which is how you find rows with no counterpart, via{' '}
          <code>WHERE right.key IS NULL</code>.
        </>
      ),
    },
    {
      q: 'COUNT(*) vs COUNT(column)?',
      a: (
        <>
          <code>COUNT(*)</code> counts rows, including those with NULLs. <code>COUNT(column)</code> counts only
          rows where that column is <b>not NULL</b>. If a column has no NULLs the two agree, which is why the bug
          hides so well.
        </>
      ),
    },
    {
      q: 'How do you find the second highest salary?',
      a: (
        <>
          <code>DENSE_RANK() OVER (ORDER BY salary DESC)</code> in a subquery and filter <code>r = 2</code> —
          correct even with ties. Without window functions:{' '}
          <code>SELECT MAX(salary) FROM t WHERE salary &lt; (SELECT MAX(salary) FROM t)</code>.
        </>
      ),
    },
    {
      q: 'RANK vs DENSE_RANK vs ROW_NUMBER?',
      a: (
        <>
          For values 100, 90, 90, 80: <b>ROW_NUMBER</b> gives 1,2,3,4; <b>RANK</b> gives 1,2,2,4 (a gap after the
          tie); <b>DENSE_RANK</b> gives 1,2,2,3 (no gap).
        </>
      ),
    },
    {
      q: 'UNION vs UNION ALL?',
      a: (
        <>
          <b>UNION</b> removes duplicate rows, which requires a sort or hash and therefore costs more.{' '}
          <b>UNION ALL</b> concatenates as-is. Prefer UNION ALL whenever duplicates are impossible or acceptable.
        </>
      ),
    },
    {
      q: 'What is a correlated subquery and why is it slow?',
      a: (
        <>
          One that references a column from the outer query, so it must be re-evaluated{' '}
          <b>once per outer row</b> instead of once overall. Rewriting it as a JOIN or a window function usually
          removes the repeated work.
        </>
      ),
    },
    {
      q: 'How do you find duplicate rows in a table?',
      a: (
        <>
          <code>SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) &gt; 1</code>. To delete them keeping one,
          use <code>DELETE FROM t WHERE id NOT IN (SELECT MIN(id) FROM t GROUP BY col)</code>.
        </>
      ),
    },
  ],
};

export default topic;
