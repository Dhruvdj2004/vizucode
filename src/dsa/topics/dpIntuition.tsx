import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** The fib(4) call tree, with the repeated subproblem highlighted. */
function FibTree() {
  const node = (cx: number, y: number, label: string, dup?: boolean) => (
    <Box key={label + cx + y} x={cx - 36} y={y} w={72} h={32} label={label} c={dup ? 'c' : 'a'} fs={12} r={6} />
  );
  const link = (x1: number, y1: number, x2: number, y2: number, k: string) => (
    <Arrow key={k} x1={x1} y1={y1} x2={x2} y2={y2} c="n" plain />
  );
  return (
    <Dg w={600} h={286} cap="Naive recursion for fib(4): fib(2) is solved twice, from scratch, in two different branches">
      {node(300, 20, 'fib(4)')}
      {link(300, 52, 190, 88, 'a')}
      {link(300, 52, 452, 88, 'b')}

      {node(190, 90, 'fib(3)')}
      {node(452, 90, 'fib(2)', true)}
      {link(190, 122, 110, 158, 'c')}
      {link(190, 122, 262, 158, 'd')}
      {link(452, 122, 400, 158, 'e')}
      {link(452, 122, 508, 158, 'f')}

      {node(110, 160, 'fib(2)', true)}
      {node(262, 160, 'fib(1)')}
      {node(400, 160, 'fib(1)')}
      {node(508, 160, 'fib(0)')}
      {link(110, 192, 62, 226, 'g')}
      {link(110, 192, 166, 226, 'h')}

      {node(62, 228, 'fib(1)')}
      {node(166, 228, 'fib(0)')}

      <Txt x={452} y={72} fs={10} bold c="c">
        …solved again from zero
      </Txt>
      <Txt x={110} y={142} fs={10} bold c="c">
        solved here…
      </Txt>
      <Txt x={330} y={250} anchor="start" fs={10.5} soft>
        this doubling repeats at every
      </Txt>
      <Txt x={330} y={268} anchor="start" fs={10.5} soft>
        level → about 2ⁿ calls
      </Txt>
    </Dg>
  );
}

/** Memoization descends; tabulation climbs. */
function MemoVsTab() {
  const cells = (fx: number, c: 'a' | 'b') =>
    ['0', '1', '2', '3', 'n'].map((l, i) => (
      <Box key={`${fx}${l}`} x={fx + 24 + i * 50} y={62} w={44} h={38} label={l} c={c} fs={12} r={6} />
    ));
  return (
    <Dg w={608} h={196} cap="Both fill the same table of answers — they just fill it in opposite directions">
      <Frame x={2} y={8} w={292} h={180} label="TOP-DOWN — memoization" c="a" />
      {cells(2, 'a')}
      <Arrow x1={248} y1={124} x2={34} y2={124} c="a" />
      <Txt x={148} y={152} fs={10.5} soft>
        recursion asks downward,
      </Txt>
      <Txt x={148} y={170} fs={10.5} soft>
        the cache fills on the way back up
      </Txt>

      <Frame x={314} y={8} w={292} h={180} label="BOTTOM-UP — tabulation" c="b" />
      {cells(314, 'b')}
      <Arrow x1={348} y1={124} x2={562} y2={124} c="b" />
      <Txt x={460} y={152} fs={10.5} soft>
        start at the base case and
      </Txt>
      <Txt x={460} y={170} fs={10.5} soft>
        fill forward — no call stack at all
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'dp-intuition',
  num: 8,
  unit: 'Dynamic Programming',
  title: 'The Core Idea, Memoization & the 5-Step Framework',
  blurb:
    'What DP is actually fixing, the two conditions that tell you it applies, memoization vs tabulation, and the five questions that crack almost every DP problem.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'intuition',
      heading: 'What problem is DP actually solving?',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Write the obvious recursive solution to a problem like Fibonacci and it works — but it is slow,
              because it keeps solving the <i>exact same smaller problem</i> over and over. <code>fib(4)</code>{' '}
              needs <code>fib(2)</code> twice. <code>fib(30)</code> needs <code>fib(2)</code> over a million times.
              Dynamic Programming is just this: <b>solve each distinct smaller problem once, write the answer down,
              and reuse it.</b> Trade a bit of memory for a lot of time.
            </>
          ),
        },
        { k: 'h', text: 'Two conditions tell you DP is the right tool' },
        {
          k: 'table',
          head: ['Condition', 'What it means'],
          rows: [
            [
              'Overlapping subproblems',
              'The same smaller inputs show up again and again while solving the bigger problem. If nothing repeats, there is nothing to cache — DP will not help.',
            ],
            [
              'Optimal substructure',
              "The best answer to the whole problem is built directly from the best answers to its pieces. If today's best choice depends on tomorrow's in a way you cannot decompose, DP does not apply cleanly.",
            ],
          ],
        },
        { k: 'h', text: 'Seeing the repetition' },
        { k: 'diagram', el: <FibTree />, caption: 'Watch fib(2) get computed twice, in two separate branches.' },
        {
          k: 'note',
          tone: 'tip',
          title: 'Take-away',
          text: (
            <>
              For <code>fib(n)</code> this doubling repeats at every level, so naive recursion costs roughly{' '}
              <code>2ⁿ</code> calls. Cache each <code>fib(k)</code> the first time you compute it, and the whole
              thing collapses to <code>n</code> calls.
            </>
          ),
        },
      ],
    },

    {
      id: 'approaches',
      heading: 'Memoization vs tabulation',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              There are exactly two ways to attach "remember what you have solved" to a problem. Both compute the
              same table of answers — they just fill it in different directions.
            </>
          ),
        },
        { k: 'diagram', el: <MemoVsTab />, caption: 'Same table, opposite directions.' },
        { k: 'h', text: 'Top-down: memoization' },
        {
          k: 'p',
          text: (
            <>
              Write the natural recursion. Before computing, check a cache; after computing, save to it. You still
              think in recursive terms — you have just made the repeats free.
            </>
          ),
        },
        {
          k: 'code',
          title: 'python',
          code: `def fib(n, memo={}):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]`,
        },
        { k: 'h', text: 'Bottom-up: tabulation' },
        {
          k: 'p',
          text: (
            <>
              Flip it around: start from the base cases and fill a table forward, in an order that guarantees every
              value you need already exists. No recursion, no call stack.
            </>
          ),
        },
        {
          k: 'code',
          title: 'python',
          code: `def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Which to pick',
          text: (
            <>
              Memoization is usually the fastest to <i>write</i> — it mirrors the recursive definition you already
              thought of. Tabulation is usually faster to <i>run</i> (no call-stack overhead, no recursion limits)
              and makes it obvious when you can shrink memory by keeping only the last couple of rows instead of the
              whole table.
            </>
          ),
        },
      ],
    },

    {
      id: 'framework',
      heading: 'The 5-step framework',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Almost every DP problem, from a one-line array question to a gnarly interview problem, falls out of
              the same five questions asked in order:
            </>
          ),
        },
        {
          k: 'steps',
          items: [
            {
              t: 'Define the state',
              d: (
                <>
                  What does <code>dp[i]</code> (or <code>dp[i][j]</code>) mean, in one plain sentence? Get this
                  wrong and everything after it is noise.
                </>
              ),
            },
            {
              t: 'Find the recurrence',
              d: (
                <>
                  How is <code>dp[i]</code> built from smaller, already-solved states? This is usually "try each
                  choice and take the best / sum / etc."
                </>
              ),
            },
            {
              t: 'Nail the base cases',
              d: (
                <>
                  The smallest inputs you can answer directly, with no recursion needed — <code>dp[0]</code>, empty
                  strings, empty knapsacks.
                </>
              ),
            },
            {
              t: 'Decide the order',
              d: 'In tabulation, compute every state before anything that depends on it. In memoization, recursion plus the cache handle this for you.',
            },
            {
              t: 'Read off the answer',
              d: (
                <>
                  Which cell holds the final answer? Often <code>dp[n]</code> — but sometimes it is the max or min
                  over the whole table.
                </>
              ),
            },
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is dynamic programming, in one sentence?',
      a: (
        <>
          Solving a problem by breaking it into smaller subproblems, solving each <b>distinct</b> subproblem exactly
          once, and storing the answer so repeated occurrences are free. It trades memory for time.
        </>
      ),
    },
    {
      q: 'What two properties must a problem have for DP to apply?',
      a: (
        <>
          <b>Overlapping subproblems</b> — the same smaller inputs recur, so caching pays off — and{' '}
          <b>optimal substructure</b> — the optimal answer is built from optimal answers to the pieces. Without the
          first, there is nothing to cache; without the second, combining sub-answers gives a wrong result.
        </>
      ),
    },
    {
      q: 'Difference between memoization and tabulation?',
      a: (
        <>
          <b>Memoization</b> is top-down: natural recursion plus a cache checked before computing.{' '}
          <b>Tabulation</b> is bottom-up: start at the base cases and fill a table forward. Both compute the same
          values; memoization is quicker to write, tabulation is faster to run and easier to space-optimise.
        </>
      ),
    },
    {
      q: 'When would you prefer tabulation over memoization?',
      a: (
        <>
          When the recursion depth would overflow the stack, when you want to avoid call overhead in a tight loop,
          or when you want to <b>compress space</b> — a bottom-up loop makes it obvious that you only need the last
          row or two instead of the full table.
        </>
      ),
    },
    {
      q: 'Difference between DP and divide-and-conquer?',
      a: (
        <>
          Both split a problem into subproblems, but in divide-and-conquer (merge sort, binary search) the
          subproblems are <b>disjoint</b> — nothing repeats, so there is nothing to cache. DP exists precisely
          because the subproblems <b>overlap</b>.
        </>
      ),
    },
    {
      q: 'Difference between DP and greedy?',
      a: (
        <>
          Greedy commits to the locally best choice and never reconsiders — correct only when that choice provably
          never needs undoing. DP <b>tries every choice</b> and keeps the best, which is why it is slower but
          applies far more widely. If greedy works, prefer it: it is simpler and faster.
        </>
      ),
    },
    {
      q: 'What is the time complexity of a DP solution, in general?',
      a: (
        <>
          <b>number of distinct states × work done per state</b>. For Fibonacci that is n states × O(1) = O(n). For
          0/1 knapsack it is n×W states × O(1) = O(nW). Stating it this way, rather than guessing, is what
          interviewers look for.
        </>
      ),
    },
  ],
};

export default topic;
