import { Dg, Rel, Txt } from '../dgm';
import type { Topic } from '../../content/types';

/** LCS table for "AC" vs "ABC". */
function LcsTable() {
  return (
    <Dg w={460} h={200} cap='dp[i][j] = LCS length of the first i characters of A and the first j of B'>
      <Rel
        x={70}
        y={40}
        cols={['', '∅', 'A', 'B', 'C']}
        rows={[
          ['∅', '0', '0', '0', '0'],
          ['A', '0', '1', '1', '1'],
          ['C', '0', '1', '1', '2'],
        ]}
        cw={[62, 62, 62, 62, 62]}
        c="a"
        mark={{ '2,4': 'b' }}
      />
      <Txt x={230} y={24} fs={10.5} soft>
        A = "AC" · B = "ABC"
      </Txt>
      <Txt x={230} y={166} fs={10.5} bold c="b">
        longest shared subsequence is "AC", length 2
      </Txt>
      <Txt x={230} y={188} fs={10} soft>
        match → take the diagonal + 1 · mismatch → the better of left and above
      </Txt>
    </Dg>
  );
}

/** LIS: the array and its dp row. */
function LisStrip() {
  return (
    <Dg w={600} h={162} cap="dp[i] = length of the longest increasing subsequence ending exactly at index i">
      <Rel
        x={30}
        y={38}
        cols={['nums', '10', '9', '2', '5', '3', '7', '101', '18']}
        rows={[['dp', '1', '1', '1', '2', '2', '3', '4', '4']]}
        cw={[58, 62, 62, 62, 62, 62, 62, 62, 62]}
        c="a"
        mark={{ '0,7': 'b', '0,8': 'b' }}
      />
      <Txt x={300} y={22} fs={10.5} soft>
        for each i, look at every earlier j: if nums[j] &lt; nums[i], try dp[j] + 1
      </Txt>
      <Txt x={300} y={130} fs={10.5} bold c="b">
        the answer is the largest value in the dp row: 4 — for example 2, 3, 7, 18
      </Txt>
      <Txt x={300} y={152} fs={10} soft>
        note it is NOT dp[last] — the longest subsequence need not end at the last element
      </Txt>
    </Dg>
  );
}

/** Edit distance table for "cat" -> "cut". */
function EditTable() {
  return (
    <Dg w={460} h={218} cap='dp[i][j] = edit distance between the first i characters of A and the first j of B'>
      <Rel
        x={70}
        y={40}
        cols={['', '∅', 'c', 'u', 't']}
        rows={[
          ['∅', '0', '1', '2', '3'],
          ['c', '1', '0', '1', '2'],
          ['a', '2', '1', '1', '2'],
          ['t', '3', '2', '2', '1'],
        ]}
        cw={[62, 62, 62, 62, 62]}
        c="a"
        mark={{ '3,4': 'b' }}
      />
      <Txt x={230} y={24} fs={10.5} soft>
        "cat" → "cut"
      </Txt>
      <Txt x={230} y={186} fs={10.5} bold c="b">
        1 edit — substitute a → u
      </Txt>
      <Txt x={230} y={208} fs={10} soft>
        first row and column are the cost of deleting or inserting everything
      </Txt>
    </Dg>
  );
}

const topic: Topic = {
  slug: 'dp-strings',
  num: 10,
  unit: 'Dynamic Programming',
  title: 'LCS, LIS & Edit Distance',
  blurb:
    'The three sequence problems every other string DP is built from — matching two strings diagonally, extending a subsequence, and paying for edits.',
  minutes: 13,
  tags: ['Very common', 'Pattern'],

  sections: [
    {
      id: 'lcs',
      heading: 'Longest Common Subsequence',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> given two strings, find the length of the longest sequence of characters (not
              necessarily contiguous) that appears, in order, in both.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i][j]</code> = LCS length using the first <code>i</code> characters of{' '}
              <code>A</code> and the first <code>j</code> of <code>B</code>.
            </>,
            <>
              <b>Recurrence</b> — if the characters match, extend the diagonal:{' '}
              <code>dp[i][j] = dp[i−1][j−1] + 1</code>; otherwise take the better of dropping one character from
              either side: <code>max(dp[i−1][j], dp[i][j−1])</code>.
            </>,
            <>
              <b>Base</b> — an empty string shares nothing, so the first row and column are <code>0</code>.
            </>,
          ],
        },
        { k: 'diagram', el: <LcsTable />, caption: 'Diagonal on a match, best-of-neighbours on a mismatch.' },
        {
          k: 'code',
          title: 'python',
          code: `def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
        },
      ],
    },

    {
      id: 'lis',
      heading: 'Longest Increasing Subsequence',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> in an array, find the length of the longest subsequence that is strictly increasing.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i]</code> = length of the longest increasing subsequence{' '}
              <i>ending exactly at index</i> <code>i</code>.
            </>,
            <>
              <b>Recurrence</b> — look at every earlier index <code>j</code>; if <code>nums[j] &lt; nums[i]</code>,
              you could extend that subsequence: <code>dp[i] = max(dp[i], dp[j] + 1)</code>.
            </>,
            <>
              <b>Base</b> — every element is a subsequence of length 1 by itself.
            </>,
          ],
        },
        { k: 'diagram', el: <LisStrip />, caption: 'The answer is the maximum over the whole row, not the last cell.' },
        {
          k: 'code',
          title: 'python',
          code: `def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Going further',
          text: (
            <>
              This runs in <code>O(n²)</code>. There is a neat <code>O(n log n)</code> version using binary search
              over a "smallest possible tail" array — worth learning once this <code>O(n²)</code> version feels
              natural, not before.
            </>
          ),
        },
      ],
    },

    {
      id: 'edit-distance',
      heading: 'Edit Distance',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Problem:</b> the minimum number of single-character insertions, deletions or substitutions needed
              to turn string <code>A</code> into string <code>B</code>.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>State</b> — <code>dp[i][j]</code> = edit distance between the first <code>i</code> characters of{' '}
              <code>A</code> and the first <code>j</code> of <code>B</code>.
            </>,
            <>
              <b>Recurrence</b> — matching characters cost nothing (<code>dp[i−1][j−1]</code>); otherwise pay one
              edit and take the cheapest of insert, delete or substitute:{' '}
              <code>1 + min(dp[i−1][j], dp[i][j−1], dp[i−1][j−1])</code>.
            </>,
            <>
              <b>Base</b> — turning <code>i</code> characters into nothing (or nothing into <code>j</code>{' '}
              characters) costs <code>i</code> (or <code>j</code>) deletions or insertions.
            </>,
          ],
        },
        { k: 'diagram', el: <EditTable />, caption: 'Each of the three neighbours corresponds to one kind of edit.' },
        {
          k: 'code',
          title: 'python',
          code: `def edit_distance(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete
                    dp[i][j - 1],      # insert
                    dp[i - 1][j - 1],  # substitute
                )
    return dp[n][m]`,
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Subsequence vs substring — why does it matter here?',
      a: (
        <>
          A <b>substring</b> is contiguous; a <b>subsequence</b> keeps order but may skip characters. It changes the
          recurrence completely: on a mismatch, LCS can drop a character from either side and carry the best answer
          forward, whereas a longest-common-<i>substring</i> DP must reset that cell to 0.
        </>
      ),
    },
    {
      q: 'How do you recover the actual LCS string, not just its length?',
      a: (
        <>
          Walk backwards from <code>dp[n][m]</code>. If the characters match, that character is in the LCS — move
          diagonally. Otherwise move toward whichever neighbour (<code>dp[i−1][j]</code> or <code>dp[i][j−1]</code>)
          holds the larger value. Reverse what you collected.
        </>
      ),
    },
    {
      q: 'For LIS, why is the answer max(dp) rather than dp[n−1]?',
      a: (
        <>
          Because <code>dp[i]</code> is defined as the best subsequence <b>ending at i</b>, and the longest one need
          not end at the last element. In <code>[10, 9, 2, 5, 3, 7, 101, 18]</code>, <code>dp[7] = 4</code> but so
          does <code>dp[6]</code> — you must scan the whole row.
        </>
      ),
    },
    {
      q: 'What are the three edits in edit distance, and which table neighbour is each?',
      a: (
        <>
          <b>Delete</b> from A → <code>dp[i−1][j]</code>. <b>Insert</b> into A → <code>dp[i][j−1]</code>.{' '}
          <b>Substitute</b> → <code>dp[i−1][j−1]</code>. On a character match you take the diagonal for free, with
          no +1.
        </>
      ),
    },
    {
      q: 'How is Longest Palindromic Subsequence related to LCS?',
      a: (
        <>
          It <i>is</i> LCS: run LCS between the string and its own reverse. Any common subsequence of{' '}
          <code>s</code> and <code>reverse(s)</code> reads the same forwards and backwards, so its length is the
          answer. A very common one-line reduction.
        </>
      ),
    },
    {
      q: 'Can these be space-optimised?',
      a: (
        <>
          LCS and edit distance both only read the previous row and the current row, so two rows of size{' '}
          <code>m</code> suffice — O(m) instead of O(nm). The catch: once compressed you can no longer backtrack to
          reconstruct the actual string, only its length.
        </>
      ),
    },
    {
      q: 'What is the complexity of each of the three?',
      a: (
        <>
          LCS and edit distance are <b>O(n·m)</b> time and space (O(min(n,m)) space if compressed). The basic LIS is{' '}
          <b>O(n²)</b> time, O(n) space, improvable to <b>O(n log n)</b> with the patience-sorting / binary-search
          variant.
        </>
      ),
    },
  ],
};

export default topic;
