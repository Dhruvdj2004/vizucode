import { Dg, Rel, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** Climbing stairs: the 1D table, which is Fibonacci in disguise. */
function StairsStrip() {
  return (
    <Dg w={560} h={160} cap="dp[i] = number of ways to reach step i">
      <Rel
        x={40}
        y={40}
        cols={['i', '0', '1', '2', '3', '4', '5', '6']}
        rows={[['dp[i]', '1', '1', '2', '3', '5', '8', '13']]}
        cw={[54, 56, 56, 56, 56, 56, 56, 56]}
        c="b"
        mark={{ '0,6': 'a', '0,7': 'b' }}
      />
      <Txt x={280} y={20} fs={10.5} soft>
        dp[i] = dp[i−1] + dp[i−2] — each value is the sum of the two before it
      </Txt>
      <Txt x={280} y={130} fs={10.5} bold c="b">
        8 + 5 = 13 ways to climb 6 steps
      </Txt>
      <Txt x={280} y={150} fs={10} soft>
        base cases: dp[0] = 1 (stand still), dp[1] = 1
      </Txt>
    </Dg>
  );
}

/** Unique paths: the 2D grid table, which is Pascal's triangle. */
function UniquePathsGrid() {
  return (
    <Dg w={520} h={216} cap="dp[i][j] = number of ways to reach cell (i, j) moving only right or down">
      <Rel
        x={90}
        y={30}
        cols={['', 'j=0', 'j=1', 'j=2', 'j=3']}
        rows={[
          ['i=0', '1', '1', '1', '1'],
          ['i=1', '1', '2', '3', '4'],
          ['i=2', '1', '3', '6', '10'],
          ['i=3', '1', '4', '10', '20'],
        ]}
        cw={[56, 66, 66, 66, 66]}
        c="a"
        mark={{ '3,4': 'b' }}
      />
      <Txt x={260} y={20} fs={10.5} soft>
        dp[i][j] = dp[i−1][j] + dp[i][j−1] — arrive from above, or from the left
      </Txt>
      <Txt x={260} y={186} fs={10.5} soft>
        the whole first row and column are 1: only one straight-line way to reach an edge cell
      </Txt>
      <Txt x={260} y={208} fs={10.5} bold c="b">
        20 distinct paths across a 4×4 grid
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'dp-1d-grid',
  num: 9,
  unit: 'Dynamic Programming',
  title: '1D DP & Grid DP',
  blurb:
    'The two simplest shapes a DP problem takes — a single rolling index (Climbing Stairs) and a two-dimensional table (Unique Paths).',
  minutes: 10,
  tags: ['Very common', 'Pattern'],

  sections: [
    {
      id: 'pattern-1d',
      heading: '1D DP — Climbing Stairs',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> a staircase has <code>n</code> steps; you can climb 1 or 2 at a time. How many
              distinct ways are there to reach the top?
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i]</code> = number of ways to reach step <code>i</code>.
            </>,
            <>
              <b>Recurrence</b> — your last move was either a single step from <code>i−1</code> or a double step
              from <code>i−2</code>, so <code>dp[i] = dp[i−1] + dp[i−2]</code>.
            </>,
            <>
              <b>Base</b> — <code>dp[0] = 1</code> (stand still) and <code>dp[1] = 1</code>.
            </>,
          ],
        },
        { k: 'diagram', el: <StairsStrip />, caption: 'That recurrence is exactly Fibonacci wearing a different costume.' },
        {
          k: 'code',
          title: 'python',
          code: `def climb_stairs(n):
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0], dp[1] = 1, 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A good reminder that the same pattern hides behind very different-sounding problems. House Robber,
              Min Cost Climbing Stairs and Decode Ways are all this shape with a different combining rule.
            </>
          ),
        },
      ],
    },

    {
      id: 'pattern-grid',
      heading: '2D Grid DP — Unique Paths',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> a robot sits at the top-left of an <code>m × n</code> grid and can only move right or
              down. How many distinct paths reach the bottom-right?
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i][j]</code> = number of ways to reach cell <code>(i, j)</code>.
            </>,
            <>
              <b>Recurrence</b> — you arrive from above or from the left:{' '}
              <code>dp[i][j] = dp[i−1][j] + dp[i][j−1]</code>.
            </>,
            <>
              <b>Base</b> — the entire first row and first column are <code>1</code>; there is only one
              straight-line way to reach any edge cell.
            </>,
          ],
        },
        { k: 'diagram', el: <UniquePathsGrid />, caption: "The values are Pascal's triangle, rotated." },
        {
          k: 'code',
          title: 'python',
          code: `def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Space compression',
          text: (
            <>
              Notice that row <code>i</code> only ever reads row <code>i−1</code>. You can throw the rest of the
              table away and keep a single array of length <code>n</code>, updating it in place left to right —
              O(n) memory instead of O(mn). This trick applies to most grid DP.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Climbing Stairs is Fibonacci — why?',
      a: (
        <>
          Because the last move into step <code>i</code> came from either <code>i−1</code> or <code>i−2</code>, and
          those are disjoint sets of ways. So <code>dp[i] = dp[i−1] + dp[i−2]</code>, which is the Fibonacci
          recurrence. Only the base cases are shifted.
        </>
      ),
    },
    {
      q: 'Can you solve Climbing Stairs in O(1) space?',
      a: (
        <>
          Yes. The recurrence only reads the last two values, so keep two variables and roll them forward instead of
          allocating an array. Same O(n) time, O(1) space — a standard follow-up.
        </>
      ),
    },
    {
      q: 'How would you change Climbing Stairs if you could climb 1, 2 or 3 steps?',
      a: (
        <>
          The state and base cases stay; only the recurrence widens to{' '}
          <code>dp[i] = dp[i−1] + dp[i−2] + dp[i−3]</code>. That generalises: for a set of allowed step sizes, sum{' '}
          <code>dp[i − s]</code> over every valid <code>s</code>.
        </>
      ),
    },
    {
      q: 'Unique Paths has a closed-form solution — what is it?',
      a: (
        <>
          Every path is a fixed sequence of (m−1) downs and (n−1) rights, so the count is the binomial coefficient{' '}
          <code>C(m+n−2, m−1)</code>. The DP table is literally Pascal's triangle. Mentioning this shows you saw the
          structure, but the DP version is what generalises once obstacles are added.
        </>
      ),
    },
    {
      q: 'How does Unique Paths change if some cells are blocked?',
      a: (
        <>
          That is "Unique Paths II". Same recurrence, but a blocked cell gets <code>dp[i][j] = 0</code> — no path
          may pass through it. Note the first row and column are no longer all 1: once you hit an obstacle,
          everything after it in that row or column becomes 0.
        </>
      ),
    },
    {
      q: 'Why can most grid DP be compressed to one row?',
      a: (
        <>
          Because <code>dp[i][j]</code> only reads the row above and the cell to its left. Iterating left to right
          over a single array, the value still sitting in a slot is the previous row's, and the value you just wrote
          is the current row's left neighbour — exactly the two you need. That drops memory from O(mn) to O(n).
        </>
      ),
    },
  ],
};

export default topic;
