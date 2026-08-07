import type { Topic } from '../../content/types';

const topic: Topic = {
  slug: 'dp-pitfalls',
  num: 12,
  unit: 'Dynamic Programming',
  title: 'Pitfalls & Practice Roadmap',
  blurb:
    'The five mistakes that silently produce wrong answers instead of crashes, and the order to work through DP families so each one builds on the last.',
  minutes: 8,
  tags: ['Revision'],

  sections: [
    {
      id: 'pitfalls',
      heading: 'Common pitfalls',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              DP bugs rarely crash. They quietly return a plausible-looking wrong number, which is exactly what
              makes them expensive. These five account for most of them.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Wrong or missing base cases',
          text: (
            <>
              Off-by-one errors here silently propagate through the entire table. Always sanity-check{' '}
              <code>dp[0]</code> and <code>dp[1]</code> by hand before trusting anything downstream.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Filling the table in the wrong order',
          text: (
            <>
              In tabulation, if you read <code>dp[i][j]</code> before it has been written you get a stale zero, not
              a crash — which is precisely why this bug is easy to miss. Every state must be computed{' '}
              <i>before</i> anything that depends on it.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: "A cache key that's missing a dimension",
          text: (
            <>
              If the true state needs two variables — say index <i>and</i> remaining capacity — but you memoize on
              only one, you will silently reuse answers computed under a different capacity. The memo key must
              contain <b>every</b> variable the answer depends on.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Reaching for DP when greedy or brute force fits better',
          text: (
            <>
              DP needs optimal substructure. If the locally best choice provably never has to be undone, a greedy
              algorithm is simpler, faster and just as correct. And if <code>n</code> is tiny, plain recursion is
              easier to get right.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Forgetting to compress space',
          text: (
            <>
              Most 2D DP only ever reads the previous row. Once the recurrence works, ask whether you really need
              the full table or just the last row or two — it is usually a two-line change from O(nm) to O(m).
            </>
          ),
        },
      ],
    },

    {
      id: 'debugging',
      heading: 'How to debug a DP that returns the wrong number',
      blocks: [
        {
          k: 'steps',
          items: [
            {
              t: 'Say the state out loud',
              d: (
                <>
                  In one sentence: "<code>dp[i][j]</code> is the …". If you cannot finish that sentence cleanly, the
                  state is wrong and no amount of index fiddling will fix it.
                </>
              ),
            },
            {
              t: 'Print the whole table for a tiny input',
              d: 'Three or four elements. Compare every cell against what you compute by hand — the first cell that disagrees is where the bug lives.',
            },
            {
              t: 'Check the base row and column separately',
              d: 'More than half of DP bugs are in the initialisation, not the recurrence.',
            },
            {
              t: 'Cross-check against brute force',
              d: 'Write the naive exponential recursion, run both on random small inputs, and compare. This finds recurrence errors instantly and is worth the five minutes.',
            },
            {
              t: 'Only then optimise space',
              d: 'Get the full table correct first. Compressing rows before the recurrence is right just hides the bug behind index arithmetic.',
            },
          ],
        },
      ],
    },

    {
      id: 'roadmap',
      heading: 'Practice roadmap',
      blocks: [
        {
          k: 'p',
          text: <>Work through these families in order — each builds on the intuition of the last.</>,
        },
        {
          k: 'steps',
          items: [
            {
              t: '1D fundamentals',
              d: 'Fibonacci, Climbing Stairs, House Robber — get comfortable with a single rolling index.',
            },
            {
              t: 'Grid fundamentals',
              d: 'Unique Paths, Minimum Path Sum — the same idea spread across two dimensions.',
            },
            {
              t: 'Knapsack family',
              d: '0/1 Knapsack, Subset Sum, Partition Equal Subset Sum — "include or skip" choices under a budget.',
            },
            {
              t: 'Unbounded knapsack family',
              d: 'Coin Change, Coin Change II — the same budget idea, but items can repeat.',
            },
            {
              t: 'String DP',
              d: 'Longest Common Subsequence, Edit Distance, Longest Palindromic Subsequence.',
            },
            {
              t: 'Subsequence & substring DP',
              d: 'Longest Increasing Subsequence, Longest Palindromic Substring, Word Break.',
            },
            {
              t: 'Interval DP (advanced)',
              d: (
                <>
                  Matrix Chain Multiplication, Burst Balloons — the state is a range <code>(i, j)</code> instead of
                  a single index.
                </>
              ),
            },
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Resist jumping ahead. Interval DP looks like the others but the state is a <i>range</i>, and the loop
              structure changes completely — it only makes sense once the single-index and two-string shapes feel
              automatic.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Your DP returns a wrong answer but never crashes. Where do you look first?',
      a: (
        <>
          The <b>base cases</b> and the <b>fill order</b>. A stale zero read from an unwritten cell looks like a
          valid answer, so it propagates silently. Print the whole table for a three-element input and find the
          first cell that disagrees with hand calculation.
        </>
      ),
    },
    {
      q: 'What happens if your memo key is missing one of the state variables?',
      a: (
        <>
          You return a cached answer computed under different conditions — a silently wrong result, not an error.
          The memo key must include every variable the answer depends on; if the state is (index, capacity), keying
          on index alone is a bug.
        </>
      ),
    },
    {
      q: 'How do you decide between DP and greedy?',
      a: (
        <>
          Ask whether a locally optimal choice could ever need to be undone. If you can prove it cannot (the
          exchange argument), greedy is correct and simpler. If a choice that looks worse now can pay off later, you
          need DP to try both branches.
        </>
      ),
    },
    {
      q: 'When can you compress a 2D DP to one dimension?',
      a: (
        <>
          When the recurrence only reads the previous row (and possibly cells already written in the current one).
          Then one array suffices — but the iteration direction matters: downwards keeps the old row's values (0/1
          knapsack), upwards deliberately reuses the new ones (unbounded).
        </>
      ),
    },
    {
      q: 'How would you verify a DP solution before submitting it?',
      a: (
        <>
          Write the naive exponential recursion, then run both on many small random inputs and compare outputs. It
          takes a few minutes and catches recurrence and base-case errors that reading the code will not.
        </>
      ),
    },
    {
      q: 'What is the general recipe for the time complexity of a DP?',
      a: (
        <>
          <b>Number of distinct states × work per state.</b> Climbing Stairs: n states × O(1) = O(n). LCS: n·m
          states × O(1) = O(nm). LIS: n states × O(n) scan = O(n²). Knapsack: n·W states × O(1) = O(nW).
        </>
      ),
    },
  ],
};

export default topic;
