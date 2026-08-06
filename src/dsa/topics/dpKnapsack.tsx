import { Dg, Rel, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** The full 0/1 knapsack table for the worked example. */
function KnapsackTable() {
  return (
    <Dg w={620} h={224} cap="dp[i][w] = best value using only the first i items with capacity w">
      <Rel
        x={30}
        y={34}
        cols={['items', 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7']}
        rows={[
          ['none', '0', '0', '0', '0', '0', '0', '0', '0'],
          ['+(1,1)', '0', '1', '1', '1', '1', '1', '1', '1'],
          ['+(3,4)', '0', '1', '1', '4', '5', '5', '5', '5'],
          ['+(4,5)', '0', '1', '4', '5', '6', '6', '9', '9'],
          ['+(5,7)', '0', '1', '4', '5', '7', '8', '9', '9'],
        ]}
        cw={[74, 60, 60, 60, 60, 60, 60, 60, 60]}
        c="a"
        mark={{ '4,8': 'b' }}
      />
      <Txt x={310} y={22} fs={10.5} soft>
        items (weight, value): (1,1) (3,4) (4,5) (5,7) · capacity W = 7
      </Txt>
      <Txt x={310} y={200} fs={10.5} bold c="b">
        best value is 9 — the weight-3 and weight-4 items together
      </Txt>
      <Txt x={310} y={220} fs={10} soft>
        each row adds one more item to the set you are allowed to choose from
      </Txt>
    </Dg>
  );
}

/** Coin change: the 1D minimum-coins array. */
function CoinStrip() {
  return (
    <Dg w={540} h={158} cap="dp[a] = fewest coins that sum to amount a">
      <Rel
        x={40}
        y={38}
        cols={['a', '0', '1', '2', '3', '4', '5', '6']}
        rows={[['dp[a]', '0', '1', '2', '1', '1', '2', '2']]}
        cw={[58, 58, 58, 58, 58, 58, 58, 58]}
        c="b"
        mark={{ '0,1': 'a', '0,7': 'b' }}
      />
      <Txt x={270} y={22} fs={10.5} soft>
        coins [1, 3, 4] · target amount 6
      </Txt>
      <Txt x={270} y={126} fs={10.5} bold c="b">
        dp[6] = 2 — three plus three
      </Txt>
      <Txt x={270} y={148} fs={10} soft>
        dp[a] = min over every usable coin c of dp[a − c] + 1
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'dp-knapsack',
  num: 9,
  unit: 'Dynamic Programming',
  title: '0/1 Knapsack & Unbounded Knapsack',
  blurb:
    'The "include or skip under a budget" family — the 2D knapsack table, the coin-change variant where items repeat, and why the loop order decides which one you built.',
  minutes: 12,
  tags: ['Very common', 'Pattern'],

  sections: [
    {
      id: 'knapsack',
      heading: '0/1 Knapsack',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> items each have a weight and a value; a bag holds weight up to <code>W</code>; each
              item can be taken at most once. Maximise the total value.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i][w]</code> = best value achievable using only the first <code>i</code> items
              with capacity <code>w</code>.
            </>,
            <>
              <b>Recurrence</b> — for each item, either skip it (<code>dp[i−1][w]</code>) or take it if it fits (
              <code>dp[i−1][w−weight] + value</code>) — keep whichever is bigger.
            </>,
            <>
              <b>Base</b> — <code>dp[0][w] = 0</code>; zero items means zero value no matter the capacity.
            </>,
          ],
        },
        { k: 'diagram', el: <KnapsackTable />, caption: 'Read a row as "what is the best I can do if I am also allowed this item?"' },
        {
          k: 'code',
          title: 'python',
          code: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]                      # skip
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1],   # take
                )
    return dp[n][W]`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Complexity',
          text: (
            <>
              <b>Time</b> O(n · W) · <b>Space</b> O(n · W), reducible to O(W) by keeping one row and iterating
              capacity <b>downwards</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'coin',
      heading: 'Unbounded Knapsack — Coin Change',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> given coin denominations you can reuse as many times as you like, find the{' '}
              <i>fewest</i> coins that sum to a target amount.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[a]</code> = minimum coins needed to make amount <code>a</code>.
            </>,
            <>
              <b>Recurrence</b> — try every coin that fits: <code>dp[a] = min(dp[a − coin] + 1)</code> over all
              usable coins. Because a coin can be reused, this loops over amounts rather than over items — that is
              what makes it "unbounded".
            </>,
            <>
              <b>Base</b> — <code>dp[0] = 0</code>.
            </>,
          ],
        },
        { k: 'diagram', el: <CoinStrip />, caption: 'Every cell asks: which single coin, removed, leaves a cheaper amount?' },
        {
          k: 'code',
          title: 'python',
          code: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'The loop order is the whole difference',
          text: (
            <>
              In the space-optimised 1D form, iterating capacity <b>downwards</b> gives <b>0/1</b> knapsack (each
              item used at most once, because you never read a cell you already updated this round). Iterating{' '}
              <b>upwards</b> gives <b>unbounded</b> knapsack (you deliberately reuse this round's values, letting an
              item be taken again). Two identical-looking loops, opposite meanings.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does 0/1 in "0/1 knapsack" mean?',
      a: (
        <>
          Each item is taken zero times or one time — no fractions and no repeats. The fractional version, where you
          may take part of an item, is solved <b>greedily</b> by value-to-weight ratio and needs no DP at all. That
          contrast is a common follow-up.
        </>
      ),
    },
    {
      q: 'Difference between 0/1 and unbounded knapsack?',
      a: (
        <>
          In 0/1 each item can be used once, so the recurrence looks at <code>dp[i−1][...]</code> — the row without
          this item. In unbounded an item can repeat, so it looks at <code>dp[i][...]</code> — the same row,
          allowing the item to be taken again. Coin Change is the classic unbounded case.
        </>
      ),
    },
    {
      q: 'How do you reduce knapsack from O(nW) space to O(W)?',
      a: (
        <>
          Keep a single array and iterate capacity from <b>W down to 0</b>. Going downwards guarantees that{' '}
          <code>dp[w − weight]</code> still holds the previous item's value, which is exactly what "use this item at
          most once" requires. Iterating upwards would let the same item be reused.
        </>
      ),
    },
    {
      q: 'Why does Coin Change need dp[0] = 0 rather than infinity?',
      a: (
        <>
          Because making amount 0 takes zero coins — it is the base case every other cell ultimately bottoms out in.
          If <code>dp[0]</code> were infinity, no amount could ever be built and the whole table would stay
          unreachable.
        </>
      ),
    },
    {
      q: 'Coin Change asks for the fewest coins. How would you count the number of ways instead?',
      a: (
        <>
          Swap <code>min(...) + 1</code> for a sum, and — crucially — put the <b>coin loop outside</b> and the
          amount loop inside. That order counts each combination once. The reverse order counts permutations, so{' '}
          <code>1+3</code> and <code>3+1</code> would both be tallied. This is "Coin Change II" and the loop-order
          trap is the entire question.
        </>
      ),
    },
    {
      q: 'Which other well-known problems are knapsack in disguise?',
      a: (
        <>
          <b>Subset Sum</b> ("can I hit exactly this total?"), <b>Partition Equal Subset Sum</b> (subset sum for
          half the total), <b>Target Sum</b>, and <b>Rod Cutting</b> (unbounded). Recognising the "choose items
          under a budget" shape is what makes them all one problem.
        </>
      ),
    },
    {
      q: 'Is knapsack polynomial time?',
      a: (
        <>
          It is <b>pseudo-polynomial</b>: O(nW) is polynomial in the <i>value</i> of W, but W is written in binary
          in the input, so it is exponential in the input's <i>length</i>. The knapsack decision problem is
          NP-complete — a nice detail to have ready if pushed.
        </>
      ),
    },
  ],
};

export default topic;
