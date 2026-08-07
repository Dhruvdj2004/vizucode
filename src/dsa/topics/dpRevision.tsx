import type { Topic } from '../../content/types';

const topic: Topic = {
  slug: 'dp-revision',
  num: 13,
  unit: 'Dynamic Programming',
  title: '10-Minute DP Revision',
  blurb:
    'Every pattern from the DP unit as state, recurrence and base case — the three lines you actually need to reproduce under pressure.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'patterns',
      heading: 'Every pattern, as three lines',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              If you can write the <b>state</b>, the <b>recurrence</b> and the <b>base case</b>, the code follows
              mechanically. This table is the whole unit.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Problem', 'State', 'Recurrence', 'Base'],
          rows: [
            [
              'Climbing Stairs',
              'dp[i] = ways to reach step i',
              'dp[i] = dp[i−1] + dp[i−2]',
              'dp[0] = dp[1] = 1',
            ],
            [
              'Unique Paths',
              'dp[i][j] = ways to reach (i, j)',
              'dp[i][j] = dp[i−1][j] + dp[i][j−1]',
              'First row and column = 1',
            ],
            [
              '0/1 Knapsack',
              'dp[i][w] = best value, first i items, capacity w',
              'max(skip: dp[i−1][w], take: dp[i−1][w−wt] + val)',
              'dp[0][w] = 0',
            ],
            [
              'Coin Change (min coins)',
              'dp[a] = fewest coins for amount a',
              'dp[a] = min(dp[a − coin] + 1) over usable coins',
              'dp[0] = 0, rest ∞',
            ],
            [
              'LCS',
              'dp[i][j] = LCS of first i of A, first j of B',
              'match → dp[i−1][j−1] + 1, else max(dp[i−1][j], dp[i][j−1])',
              'Row 0 and column 0 = 0',
            ],
            [
              'LIS',
              'dp[i] = longest increasing subsequence ENDING at i',
              'dp[i] = max(dp[j] + 1) for j < i with nums[j] < nums[i]',
              'Every dp[i] = 1',
            ],
            [
              'Edit Distance',
              'dp[i][j] = edits to turn first i of A into first j of B',
              'match → dp[i−1][j−1], else 1 + min(3 neighbours)',
              'dp[i][0] = i, dp[0][j] = j',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              <b>LIS is the odd one out.</b> The answer is <code>max(dp)</code> over the whole array, not{' '}
              <code>dp[n−1]</code> — the longest subsequence need not end at the last element. Every other row above
              reads its answer from the final cell.
            </>
          ),
        },
      ],
    },

    {
      id: 'complexity',
      heading: 'Complexity, and how to derive it',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'The formula',
          text: (
            <>
              <b>number of distinct states × work done per state.</b> Say that, then plug in — it beats guessing
              every time.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Problem', 'States', 'Work each', 'Time', 'Space (compressed)'],
          rows: [
            ['Climbing Stairs', 'n', 'O(1)', 'O(n)', 'O(1) — two variables'],
            ['Unique Paths', 'm × n', 'O(1)', 'O(mn)', 'O(n) — one row'],
            ['0/1 Knapsack', 'n × W', 'O(1)', 'O(nW)', 'O(W) — iterate capacity DOWN'],
            ['Coin Change', 'amount × coins', 'O(1)', 'O(amount × coins)', 'O(amount)'],
            ['LCS / Edit Distance', 'n × m', 'O(1)', 'O(nm)', 'O(min(n, m)) — two rows'],
            ['LIS', 'n', 'O(n) scan', 'O(n²)', 'O(n) — O(n log n) with binary search'],
          ],
        },
      ],
    },

    {
      id: 'one-liners',
      heading: 'The one-line answers',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>When does DP apply?</b> <b>Overlapping subproblems</b> (the same smaller inputs recur, so caching
              pays) and <b>optimal substructure</b> (the best whole is built from best parts).
            </>,
            <>
              <b>Memoization vs tabulation?</b> Top-down recursion plus a cache, vs bottom-up filling a table.
              Memoization is quicker to write; tabulation is faster to run and easier to space-optimise.
            </>,
            <>
              <b>DP vs divide-and-conquer?</b> D&C subproblems are <b>disjoint</b> — nothing repeats, so there is
              nothing to cache. DP exists because they <b>overlap</b>.
            </>,
            <>
              <b>DP vs greedy?</b> Greedy commits and never reconsiders; correct only when a local choice provably
              never needs undoing. DP tries every choice. If greedy works, use it — it is simpler and faster.
            </>,
            <>
              <b>0/1 vs unbounded knapsack?</b> 0/1 reads <code>dp[i−1][…]</code> — the row without this item.
              Unbounded reads <code>dp[i][…]</code> — the same row, so the item can repeat.
            </>,
            <>
              <b>The 1D loop direction.</b> Iterate capacity <b>downwards</b> for 0/1 (preserves the previous row);{' '}
              <b>upwards</b> for unbounded (deliberately reuses this round's values). Two identical-looking loops,
              opposite meanings.
            </>,
            <>
              <b>Longest Palindromic Subsequence?</b> It is LCS of the string with its own reverse. One-line
              reduction.
            </>,
          ],
        },
      ],
    },

    {
      id: 'debugging',
      heading: 'When the answer is wrong',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              DP bugs rarely crash — they return a plausible wrong number. Check these four, in order.
            </>
          ),
        },
        {
          k: 'steps',
          items: [
            {
              t: 'Base cases',
              d: (
                <>
                  More than half of DP bugs live here. Verify <code>dp[0]</code> and <code>dp[1]</code> by hand
                  before trusting anything else.
                </>
              ),
            },
            {
              t: 'Fill order',
              d: 'Reading a cell before it is written gives a stale zero, not an error — so the bug is silent. Every state must be computed before anything that depends on it.',
            },
            {
              t: 'The memo key',
              d: 'It must contain every variable the answer depends on. Keying on index alone when the state is (index, capacity) silently reuses wrong answers.',
            },
            {
              t: 'Where you read the answer',
              d: 'dp[n], the last cell, or max over the whole table? LIS and "best subarray" problems are the max; most others are the last cell.',
            },
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Fastest debug that exists: write the naive exponential recursion, run both on random small inputs, and
              compare. It finds recurrence errors in minutes that reading the code will not.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What two properties must a problem have for DP to apply?',
      a: (
        <>
          <b>Overlapping subproblems</b> — the same smaller inputs recur, so caching helps — and{' '}
          <b>optimal substructure</b> — the optimal solution is composed of optimal solutions to subproblems.
          Without the first there is nothing to cache; without the second the composition is invalid.
        </>
      ),
    },
    {
      q: 'How do you state the time complexity of any DP?',
      a: (
        <>
          <b>Number of distinct states × work per state.</b> Climbing Stairs: n × O(1) = O(n). LCS: n·m × O(1) =
          O(nm). LIS: n × O(n) = O(n²). Knapsack: n·W × O(1) = O(nW).
        </>
      ),
    },
    {
      q: 'Memoization or tabulation — which and why?',
      a: (
        <>
          <b>Memoization</b> when you want to write it fast, since it mirrors the recursion you already thought of.{' '}
          <b>Tabulation</b> when recursion depth risks a stack overflow, when call overhead matters, or when you
          want to compress space to one or two rows.
        </>
      ),
    },
    {
      q: 'How do you reduce 0/1 knapsack from O(nW) space to O(W)?',
      a: (
        <>
          Keep one array and iterate capacity from <b>W down to 0</b>. Going downwards guarantees{' '}
          <code>dp[w − weight]</code> still holds the <i>previous</i> item's value, which is exactly what "use each
          item at most once" requires. Iterating upwards would let it repeat — which is unbounded knapsack.
        </>
      ),
    },
    {
      q: 'Why is the LIS answer max(dp) rather than the last cell?',
      a: (
        <>
          Because <code>dp[i]</code> is defined as the longest subsequence <b>ending at i</b>, and the overall
          longest need not end at the last element. You have to scan the whole array.
        </>
      ),
    },
    {
      q: 'Coin Change: fewest coins vs number of ways — what changes?',
      a: (
        <>
          Swap <code>min(…) + 1</code> for a sum, and put the <b>coin loop outside</b> with the amount loop inside.
          That order counts each <i>combination</i> once; the reverse counts permutations, so 1+3 and 3+1 would both
          be tallied.
        </>
      ),
    },
    {
      q: 'Difference between DP and greedy?',
      a: (
        <>
          Greedy takes the locally best option and never revisits it — correct only if you can prove that choice is
          never wrong. DP explores every choice and keeps the best, so it is slower but far more widely applicable.
        </>
      ),
    },
    {
      q: 'Your DP returns a wrong answer but never crashes. Where do you look?',
      a: (
        <>
          <b>Base cases and fill order</b> first — a stale zero read from an unwritten cell looks like a valid
          number and propagates silently. Print the whole table for a three-element input and find the first cell
          that disagrees with hand calculation.
        </>
      ),
    },
  ],
};

export default topic;
