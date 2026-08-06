import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Pushing selection below the join. */
function QueryTrees() {
  return (
    <Dg w={620} h={322} cap="The same query as two expression trees — filtering before the join is dramatically cheaper">
      <Frame x={2} y={8} w={300} h={302} label="BEFORE" c="c" />
      <Box x={112} y={30} w={80} h={30} label="π name" c="c" fs={11.5} />
      <Box x={112} y={88} w={80} h={30} label="σ cgpa>9" c="c" fs={11} />
      <Box x={122} y={146} w={60} h={30} label="⋈" c="c" fs={13} />
      <Box x={30} y={208} w={98} h={32} label="STUDENT" c="n" fs={11} />
      <Box x={176} y={208} w={98} h={32} label="ENROLLS" c="n" fs={11} />
      <Arrow x1={152} y1={60} x2={152} y2={86} c="n" plain />
      <Arrow x1={152} y1={118} x2={152} y2={144} c="n" plain />
      <Arrow x1={140} y1={176} x2={79} y2={206} c="n" plain />
      <Arrow x1={164} y1={176} x2={225} y2={206} c="n" plain />
      <Txt x={152} y={266} fs={10.5} soft>
        joins 10,000 × 50,000 rows,
      </Txt>
      <Txt x={152} y={284} fs={10.5} soft>
        then throws almost all away
      </Txt>

      <Frame x={318} y={8} w={300} h={302} label="AFTER — selection pushed down" c="b" />
      <Box x={424} y={30} w={80} h={30} label="π name" c="b" fs={11.5} />
      <Box x={434} y={88} w={60} h={30} label="⋈" c="b" fs={13} />
      <Box x={344} y={146} w={96} h={30} label="σ cgpa>9" c="b" fs={11} />
      <Box x={343} y={208} w={98} h={32} label="STUDENT" c="n" fs={11} />
      <Box x={488} y={208} w={98} h={32} label="ENROLLS" c="n" fs={11} />
      <Arrow x1={464} y1={60} x2={464} y2={86} c="n" plain />
      <Arrow x1={452} y1={118} x2={400} y2={144} c="n" plain />
      <Arrow x1={476} y1={118} x2={537} y2={206} c="n" plain />
      <Arrow x1={392} y1={176} x2={392} y2={206} c="n" plain />
      <Txt x={468} y={266} fs={10.5} soft>
        filters to ~200 rows first,
      </Txt>
      <Txt x={468} y={284} fs={10.5} soft>
        so the join input is tiny
      </Txt>
    </Dg>
  );
}

/** The three stages a query passes through. */
function Pipeline() {
  return (
    <Dg w={620} h={196} cap="From query text to result: parse, plan, execute">
      <Box x={14} y={54} w={112} h={54} label="Query text" c="n" fs={11.5} />
      <Arrow x1={128} y1={81} x2={158} y2={81} c="n" />
      <Box x={160} y={54} w={112} h={54} label="Parser" sub="syntax + names" c="a" fs={11.5} />
      <Arrow x1={274} y1={81} x2={304} y2={81} c="n" />
      <Box x={306} y={54} w={130} h={54} label="Optimizer" sub="pick the plan" c="c" fs={11.5} />
      <Arrow x1={438} y1={81} x2={468} y2={81} c="n" />
      <Box x={470} y={54} w={136} h={54} label="Executor" sub="run the operators" c="b" fs={11.5} />

      <Txt x={371} y={140} fs={10.5} soft>
        the optimizer reads table statistics from the data dictionary
      </Txt>
      <Txt x={371} y={158} fs={10.5} soft>
        and estimates the cost of every candidate plan in disk I/Os
      </Txt>
      <Arrow x1={371} y1={132} x2={371} y2={112} c="c" />
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'query-processing',
  num: 24,
  unit: 'Storage & Performance',
  title: 'Query Processing & Optimization',
  blurb:
    'How a query becomes a plan: parsing, algebraic rewriting, cost estimation from statistics, and the four join algorithms with their costs.',
  minutes: 14,
  tags: ['Practical'],

  sections: [
    {
      id: 'pipeline',
      heading: 'The pipeline',
      blocks: [
        { k: 'diagram', el: <Pipeline />, caption: 'Only the optimizer stage is genuinely hard — and it is where all the performance lives.' },
        {
          k: 'steps',
          items: [
            {
              t: 'Parsing and translation',
              d: 'Check the syntax, verify that the named tables and columns exist and that you have permission, then translate the query into a relational algebra expression tree.',
            },
            {
              t: 'Optimization',
              d: 'Generate equivalent expression trees, choose an access method and algorithm for each operator, estimate the cost of each candidate, and pick the cheapest. The output is an execution plan.',
            },
            {
              t: 'Evaluation',
              d: 'The execution engine runs the plan, pulling rows through the operator tree and asking the storage manager for blocks.',
            },
          ],
        },
      ],
    },

    {
      id: 'heuristic',
      heading: 'Heuristic (rule-based) optimization',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Some rewrites are almost always an improvement, so the optimizer applies them without costing them.
              They all follow from relational algebra identities.
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            <>
              <b>Push selections down</b> — filter as early as possible, so every operator above works on fewer
              rows. This is by far the biggest single win.
            </>,
            <>
              <b>Push projections down</b> — drop unneeded columns early, so fewer bytes flow through the plan and
              more rows fit per block.
            </>,
            <>
              <b>Turn Cartesian products followed by a selection into joins</b> — never materialise a product.
            </>,
            <>
              <b>Do the most restrictive operations first</b> — order joins so the smallest intermediate results
              appear earliest.
            </>,
            <>
              <b>Combine adjacent selections</b> into a single conjunctive predicate, evaluated in one pass.
            </>,
          ],
        },
        { k: 'diagram', el: <QueryTrees />, caption: 'Same result, wildly different cost.' },
      ],
    },

    {
      id: 'cost',
      heading: 'Cost-based optimization',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Heuristics are not enough — whether an index beats a scan depends on the data. So the optimizer
              estimates costs numerically, using <b>statistics</b> kept in the data dictionary.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <code>n_r</code> — number of tuples in relation r.
            </>,
            <>
              <code>b_r</code> — number of blocks r occupies.
            </>,
            <>
              <code>V(A, r)</code> — number of distinct values of attribute A. This drives selectivity: a predicate{' '}
              <code>A = v</code> is estimated to return <code>n_r / V(A, r)</code> rows.
            </>,
            <>
              <b>Histograms</b> — a distribution of values, so skewed data is estimated correctly rather than
              assuming uniformity.
            </>,
            <>
              Index height, clustering factor, and the number of leaf blocks.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Stale statistics are the classic cause of a suddenly slow query',
          text: (
            <>
              If statistics say a table has 100 rows and it now has 10 million, the optimizer will happily pick a
              nested-loop join and the query will take hours. This is why <code>ANALYZE</code> /{' '}
              <code>UPDATE STATISTICS</code> exists, and why "the query got slow overnight and nothing changed" is
              usually this.
            </>
          ),
        },
      ],
    },

    {
      id: 'joins',
      heading: 'The join algorithms',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Choosing the join algorithm is the most consequential decision in a plan. Four appear in every
              system.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Algorithm', 'How it works', 'Cost (blocks)', 'Best when'],
          rows: [
            [
              'Nested loop join',
              'For every tuple of R, scan all of S',
              'b_r + n_r × b_s',
              'One relation is tiny; almost never otherwise',
            ],
            [
              'Block nested loop join',
              'For every block of R, scan all of S',
              'b_r + b_r × b_s',
              'No index and no sort order available — the fallback',
            ],
            [
              'Index nested loop join',
              'For every tuple of R, probe an index on S\'s join column',
              'b_r + n_r × (index lookup cost)',
              'The outer relation is small and an index exists on the inner join column',
            ],
            [
              'Sort-merge join',
              'Sort both on the join key, then merge in one pass',
              'b_r + b_s (plus sorting, if not already sorted)',
              'Both inputs are large, or already sorted by an index',
            ],
            [
              'Hash join',
              'Build a hash table on the smaller relation, probe it with the larger',
              'roughly 3 × (b_r + b_s)',
              'Large equality joins with no useful index — the workhorse',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Two facts that make an answer sound informed: <b>hash join only works for equality predicates</b>{' '}
              (you cannot hash a <code>&gt;</code>), and <b>sort-merge join is preferred when the inputs are
              already sorted</b>, because the expensive part has already been paid for by an index.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              For nested-loop variants, always make the <b>smaller relation the outer one</b> — it is scanned once,
              while the inner is scanned repeatedly. Getting that backwards is a classic exam trap.
            </>
          ),
        },
      ],
    },

    {
      id: 'plans',
      heading: 'Reading an execution plan',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Every database exposes the chosen plan (<code>EXPLAIN</code>, or <code>EXPLAIN ANALYZE</code> to also
              run it and show real numbers). Knowing what to look for is a very practical interview answer.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Sequential / full table scan on a large table</b> — fine if you need most of the rows, a red flag
              if the filter is selective. Usually a missing index.
            </>,
            <>
              <b>Estimated rows far from actual rows</b> — stale or missing statistics. Everything downstream of a
              bad estimate is likely wrong too.
            </>,
            <>
              <b>Nested loop with a large outer input</b> — often a sign that the optimizer underestimated the row
              count.
            </>,
            <>
              <b>A sort you did not ask for</b> — an ordered index could remove it.
            </>,
            <>
              <b>The deepest, most expensive node</b> is where to start. Fixing the top of the plan rarely helps.
            </>,
          ],
        },
      ],
    },

    {
      id: 'materialization',
      heading: 'Materialization vs pipelining',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Materialization</b> — each operator writes its full result to a temporary relation, and the next
              one reads it. Simple, but it pays extra I/O for every intermediate result.
            </>,
            <>
              <b>Pipelining</b> — each operator passes tuples to the next as it produces them, so intermediate
              results are never written to disk. Far faster, and it lets the first rows appear before the query
              finishes.
            </>,
            <>
              Some operators are <b>blocking</b> — sort, and aggregation without an index — because they cannot emit
              anything until they have consumed all their input. Those force materialization at that point, which
              is why a <code>SORT</code> node in a plan is worth attention.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What are the stages of query processing?',
      a: (
        <>
          <b>Parsing and translation</b> (syntax, name resolution, permissions → an algebra tree),{' '}
          <b>optimization</b> (rewrite the tree, choose algorithms and access paths, estimate costs, pick the
          cheapest plan) and <b>evaluation</b> (the execution engine runs the plan).
        </>
      ),
    },
    {
      q: 'What is the single most effective query optimization rule?',
      a: (
        <>
          <b>Push selections down</b> — apply filters as early as possible, before joins. It shrinks every
          intermediate result, so every operator above does less work. Projections are pushed down for the same
          reason.
        </>
      ),
    },
    {
      q: 'Heuristic vs cost-based optimization?',
      a: (
        <>
          <b>Heuristic</b> applies algebraic rules that are almost always improvements, with no reference to the
          data. <b>Cost-based</b> enumerates candidate plans and estimates each one's I/O cost using statistics.
          Real optimizers use heuristics to prune the search space, then cost the survivors.
        </>
      ),
    },
    {
      q: 'What statistics does an optimizer keep, and where?',
      a: (
        <>
          Row counts, block counts, distinct-value counts per column, histograms of value distributions, and index
          metadata such as height and clustering factor. They live in the <b>data dictionary / system catalog</b>{' '}
          and are refreshed by ANALYZE or an automatic background job.
        </>
      ),
    },
    {
      q: 'Name the join algorithms and when each is chosen.',
      a: (
        <>
          <b>Nested loop</b> — only when one side is tiny. <b>Block nested loop</b> — the no-index fallback.{' '}
          <b>Index nested loop</b> — small outer relation plus an index on the inner join column.{' '}
          <b>Sort-merge</b> — both sides large, especially if already sorted. <b>Hash join</b> — large equality
          joins with no useful index, and the most common choice for big joins.
        </>
      ),
    },
    {
      q: 'Why can hash join not be used for a non-equality join?',
      a: (
        <>
          Hashing maps equal values to the same bucket and says nothing about ordering, so it can only find matches
          for <code>=</code>. For <code>&lt;</code>, <code>&gt;</code> or <code>BETWEEN</code>, the system falls back
          to sort-merge or a block nested loop.
        </>
      ),
    },
    {
      q: 'In a nested loop join, which relation should be the outer one?',
      a: (
        <>
          The <b>smaller</b> one. The outer relation is scanned once while the inner is scanned repeatedly, so cost
          is roughly <code>b_outer + n_outer × b_inner</code> — you want the multiplier to be the small number.
        </>
      ),
    },
    {
      q: 'A query that was fast is suddenly slow, with no code change. What would you check first?',
      a: (
        <>
          <b>Statistics.</b> If the table has grown a lot since the last ANALYZE, the optimizer's row estimates are
          wrong and it may have switched to a nested loop or dropped an index. Compare estimated vs actual rows in{' '}
          <code>EXPLAIN ANALYZE</code>, then refresh the statistics.
        </>
      ),
    },
    {
      q: 'What is pipelining and why is it better than materialization?',
      a: (
        <>
          Pipelining passes tuples from one operator to the next as they are produced, so intermediate results are
          never written to disk and the first rows can be returned early. Materialization writes each intermediate
          result to a temporary relation, paying extra I/O. Blocking operators like sort force materialization
          because they must consume all input first.
        </>
      ),
    },
    {
      q: 'What does a full table scan in a plan tell you?',
      a: (
        <>
          Not necessarily a problem — it is the right choice when the query needs a large fraction of the table,
          because sequential I/O beats many random lookups. It <i>is</i> a red flag when the filter is highly
          selective, which usually means a missing index or a predicate written in a way that prevents the index
          from being used.
        </>
      ),
    },
  ],
};

export default topic;
