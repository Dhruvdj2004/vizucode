// Dynamic Programming, part 2: 2-D tables & palindromes.
import type { ArrayState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';
import { parseNumGrid } from './arraysHashing2';

const MAX_STEPS = 320;

/* ================= 110. Longest Palindromic Substring ================= */
const longestPalindrome: ProblemDef = {
  slug: 'longest-palindromic-substring',
  title: 'Longest Palindromic Substring',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-palindromic-substring/',
  technique: 'Expand around every center — each of the 2n−1 centers grows as far as it can.',
  widget: 'array',
  widgetTitle: 'String & expansion',
  inputs: [{ key: 's', label: 'String', defaultValue: 'babad' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string longestPalindrome(string s) {'),
      L('        int bestL = 0, bestLen = 1;', 'init'),
      L('        for (int center = 0; center < s.size(); center++) {', 'loop'),
      L('            expand(s, center, center, bestL, bestLen);', 'odd'),
      L('            expand(s, center, center + 1, bestL, bestLen);', 'even'),
      L('        }'),
      L('        return s.substr(bestL, bestLen);', 'ret'),
      L('    }'),
      L('    void expand(string& s, int l, int r, int& bestL, int& bestLen) {', 'expand'),
      L('        while (l >= 0 && r < s.size() && s[l] == s[r]) {', 'expand'),
      L('            if (r - l + 1 > bestLen) {', 'record'),
      L('                bestL = l; bestLen = r - l + 1;', 'record'),
      L('            }'),
      L('            l--; r++;', 'expand'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int bestL = 0, bestLen = 1;', 'init'),
      L('    public String longestPalindrome(String s) {'),
      L('        for (int center = 0; center < s.length(); center++) {', 'loop'),
      L('            expand(s, center, center);', 'odd'),
      L('            expand(s, center, center + 1);', 'even'),
      L('        }'),
      L('        return s.substring(bestL, bestL + bestLen);', 'ret'),
      L('    }'),
      L('    private void expand(String s, int l, int r) {', 'expand'),
      L('        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {', 'expand'),
      L('            if (r - l + 1 > bestLen) {', 'record'),
      L('                bestL = l; bestLen = r - l + 1;', 'record'),
      L('            }'),
      L('            l--; r++;', 'expand'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,12}$/.test(s)) return { error: 'Lowercase letters, 1–12 characters.' };
    const chars = s.split('');
    const steps: Step[] = [];
    let bestL = 0;
    let bestLen = 1;
    const st = (win: [number, number] | null, extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars,
      window: win,
      aggs: [{ label: 'best', value: `"${s.slice(bestL, bestL + bestLen)}" (${bestLen})`, c: 'b' }],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['A palindrome mirrors around its center — and there are only ', A(2 * s.length - 1), ' possible centers (each char, each gap). Try them all.'], state: st(null) });
    const expand = (l0: number, r0: number, kind: string) => {
      let l = l0;
      let r = r0;
      if (l !== r && (r >= s.length || chars[l] !== chars[r])) return;
      while (l - 1 >= 0 && r + 1 < s.length && chars[l - 1] === chars[r + 1]) {
        l--;
        r++;
      }
      const len = r - l + 1;
      const improved = len > bestLen;
      if (improved) {
        bestL = l;
        bestLen = len;
      }
      if (steps.length < MAX_STEPS) {
        steps.push({
          tag: kind === 'odd' ? 'odd' : 'even',
          tag2: improved ? 'record' : 'expand',
          trace: [
            kind === 'odd' ? 'Odd center at ' : 'Even center at gap ', A(l0),
            ': grows to "', improved ? B(s.slice(l, r + 1)) : A(s.slice(l, r + 1)), '" (length ', A(len), ')',
            improved ? ' — new best!' : '.',
          ],
          state: st([l, r], { mark: { [l0]: 'active', ...(kind === 'even' ? { [r0]: 'active' } : {}) } }),
        });
      }
    };
    for (let c = 0; c < s.length; c++) {
      expand(c, c, 'odd');
      if (c + 1 < s.length && chars[c] === chars[c + 1]) expand(c, c + 1, 'even');
    }
    steps.push({
      tag: 'ret',
      trace: ['Longest palindromic substring: "', C(s.slice(bestL, bestL + bestLen)), '" (length ', C(bestLen), ').'],
      state: st([bestL, bestL + bestLen - 1], { mark: Object.fromEntries([...Array(bestLen)].map((_, i) => [bestL + i, 'final'])) }),
    });
    return { steps, result: `"${s.slice(bestL, bestL + bestLen)}"`, resultDetail: `length ${bestLen}` };
  },
  note: 'Enumerating centers instead of substrings flips the cost structure: each center\'s expansion is paid only as far as the palindrome actually reaches. Even-length palindromes have their center *between* characters — forgetting them is the classic bug.',
  complexity: { time: 'O(n²)', space: 'O(1)' },
};

/* ================= 111. Palindromic Substrings ================= */
const palindromicSubstrings: ProblemDef = {
  slug: 'palindromic-substrings',
  title: 'Palindromic Substrings',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/palindromic-substrings/',
  technique: 'Expand around each center, counting every successful widening.',
  widget: 'array',
  widgetTitle: 'String & expansion',
  inputs: [{ key: 's', label: 'String', defaultValue: 'aaa' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countSubstrings(string s) {'),
      L('        int count = 0;', 'init'),
      L('        for (int center = 0; center < s.size(); center++) {', 'loop'),
      L('            count += expand(s, center, center);', 'odd'),
      L('            count += expand(s, center, center + 1);', 'even'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    int expand(string& s, int l, int r) {', 'expand'),
      L('        int found = 0;', 'expand'),
      L('        while (l >= 0 && r < s.size() && s[l] == s[r]) {', 'expand'),
      L('            found++;', 'hit'),
      L('            l--; r++;', 'expand'),
      L('        }'),
      L('        return found;', 'expand'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countSubstrings(String s) {'),
      L('        int count = 0;', 'init'),
      L('        for (int center = 0; center < s.length(); center++) {', 'loop'),
      L('            count += expand(s, center, center);', 'odd'),
      L('            count += expand(s, center, center + 1);', 'even'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('    private int expand(String s, int l, int r) {', 'expand'),
      L('        int found = 0;', 'expand'),
      L('        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {', 'expand'),
      L('            found++;', 'hit'),
      L('            l--; r++;', 'expand'),
      L('        }'),
      L('        return found;', 'expand'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,10}$/.test(s)) return { error: 'Lowercase letters, 1–10 characters.' };
    const chars = s.split('');
    const steps: Step[] = [];
    let count = 0;
    const st = (win: [number, number] | null): ArrayState => ({
      arr: chars,
      window: win,
      aggs: [{ label: 'count', value: String(count), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Count every palindromic substring — each one has a center, so sweep all ', A(2 * s.length - 1), ' centers and count each successful width.'], state: st(null) });
    const expand = (l0: number, r0: number, kind: 'odd' | 'even') => {
      let l = l0;
      let r = r0;
      while (l >= 0 && r < s.length && chars[l] === chars[r]) {
        count++;
        if (steps.length < MAX_STEPS) {
          steps.push({
            tag: 'hit',
            tag2: kind,
            trace: ['"', B(s.slice(l, r + 1)), '" is a palindrome (', kind, ' center ', A(l0), ') — count is now ', C(count), '.'],
            state: st([l, r]),
          });
        }
        l--;
        r++;
      }
    };
    for (let c = 0; c < s.length; c++) {
      expand(c, c, 'odd');
      expand(c, c + 1, 'even');
    }
    steps.push({ tag: 'ret', trace: ['Total palindromic substrings: ', C(count), '.'], state: st(null) });
    return { steps, result: String(count) };
  },
  note: 'Identical machinery to Longest Palindromic Substring, but the aggregate changes: every successful widening step *is* one distinct palindrome (distinct because its span differs), so counting steps counts substrings.',
  complexity: { time: 'O(n²)', space: 'O(1)' },
};

/* ================= 117. Partition Equal Subset Sum ================= */
const partitionSubset: ProblemDef = {
  slug: 'partition-equal-subset-sum',
  title: 'Partition Equal Subset Sum',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/partition-equal-subset-sum/',
  technique: 'Subset-sum DP: can some subset hit exactly half the total?',
  widget: 'matrix',
  widgetTitle: 'Reachable sums (one row per item)',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 5, 11, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool canPartition(vector<int>& nums) {'),
      L('        int total = accumulate(nums.begin(), nums.end(), 0);', 'init'),
      L('        if (total % 2 != 0) return false;', 'oddsum'),
      L('        int target = total / 2;', 'init'),
      L('        vector<bool> dp(target + 1, false);', 'init'),
      L('        dp[0] = true;', 'init'),
      L('        for (int x : nums) {', 'item'),
      L('            for (int a = target; a >= x; a--)', 'sweep'),
      L('                dp[a] = dp[a] || dp[a - x];', 'sweep'),
      L('        }'),
      L('        return dp[target];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean canPartition(int[] nums) {'),
      L('        int total = 0;', 'init'),
      L('        for (int x : nums) total += x;', 'init'),
      L('        if (total % 2 != 0) return false;', 'oddsum'),
      L('        int target = total / 2;', 'init'),
      L('        boolean[] dp = new boolean[target + 1];', 'init'),
      L('        dp[0] = true;', 'init'),
      L('        for (int x : nums) {', 'item'),
      L('            for (int a = target; a >= x; a--)', 'sweep'),
      L('                dp[a] = dp[a] || dp[a - x];', 'sweep'),
      L('        }'),
      L('        return dp[target];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 1, maxLen: 8 });
    if (typeof nums === 'string') return { error: nums };
    const total = nums.reduce((a, b) => a + b, 0);
    const steps: Step[] = [];
    if (total % 2 !== 0) {
      steps.push({
        tag: 'oddsum',
        trace: ['Total is ', F(total), ' — odd, so two equal halves are impossible. Return ', C('false'), '.'],
        state: { grid: [[total]], colLabels: ['total'], mark: {} } satisfies MatrixState,
      });
      return { steps, result: 'false', resultDetail: 'odd total' };
    }
    const target = total / 2;
    if (target > 20) return { error: 'Keep total ≤ 40 so the table stays readable.' };
    const dp: boolean[] = Array(target + 1).fill(false);
    dp[0] = true;
    const rows: string[][] = [dp.map((v) => (v ? '✓' : ''))];
    const rowLabels = ['∅'];
    const view = (): MatrixState => ({
      grid: rows,
      rowLabels: [...rowLabels],
      colLabels: [...Array(target + 1)].map((_, i) => i),
      mark: Object.fromEntries(rows.flatMap((row, r) => row.map((v, c) => (v === '✓' ? [`${r},${c}`, c === target ? 'final' : 'good'] : null)).filter(Boolean) as [string, 'good' | 'final'][])),
      aggs: [{ label: 'target', value: String(target), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Total ', A(total), ' → find a subset summing to ', C(target), '. Row per item: which sums are reachable so far (sum ', B(0), ' always is).'], state: view() });
    for (const x of nums) {
      for (let a = target; a >= x; a--) dp[a] = dp[a] || dp[a - x];
      rows.push(dp.map((v) => (v ? '✓' : '')));
      rowLabels.push(`+${x}`);
      steps.push({
        tag: 'sweep',
        tag2: 'item',
        trace: ['Item ', A(x), ': every reachable sum s also makes ', A(`s+${x}`), ' reachable (sweeping right-to-left so ', A(x), ' is used at most once).'],
        state: view(),
      });
      if (dp[target]) {
        steps.push({ tag: 'ret', trace: ['Sum ', C(target), ' is reachable — a perfect half exists. Return ', C('true'), '.'], state: view() });
        return { steps, result: 'true', resultDetail: `subset sums to ${target}` };
      }
    }
    steps.push({ tag: 'ret', trace: ['All items used and ', F(target), ' never lit up — return ', C('false'), '.'], state: view() });
    return { steps, result: 'false', resultDetail: `no subset sums to ${target}` };
  },
  note: 'Equal partition ⇔ some subset hits total/2 (the rest is automatically the other half). The right-to-left sweep is the 0/1-knapsack trick: it reads only *last* round\'s values, preventing one item from being counted twice.',
  complexity: { time: 'O(n · total)', space: 'O(total)' },
};

/* ================= 118. Unique Paths ================= */
const uniquePaths: ProblemDef = {
  slug: 'unique-paths',
  title: 'Unique Paths',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/unique-paths/',
  technique: 'Each cell\'s count = paths from above + paths from the left.',
  widget: 'matrix',
  widgetTitle: 'Path counts',
  inputs: [
    { key: 'm', label: 'Rows m', defaultValue: '3' },
    { key: 'n', label: 'Cols n', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int uniquePaths(int m, int n) {'),
      L('        vector<vector<int>> dp(m, vector<int>(n, 1));', 'init'),
      L('        for (int r = 1; r < m; r++)', 'loop'),
      L('            for (int c = 1; c < n; c++)', 'loop'),
      L('                dp[r][c] = dp[r-1][c] + dp[r][c-1];', 'fill'),
      L('        return dp[m-1][n-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int uniquePaths(int m, int n) {'),
      L('        int[][] dp = new int[m][n];', 'init'),
      L('        for (int[] row : dp) Arrays.fill(row, 1);', 'init'),
      L('        for (int r = 1; r < m; r++)', 'loop'),
      L('            for (int c = 1; c < n; c++)', 'loop'),
      L('                dp[r][c] = dp[r-1][c] + dp[r][c-1];', 'fill'),
      L('        return dp[m-1][n-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const m = parseInt1(values.m, 'm', { min: 2, max: 7 });
    if (typeof m === 'string') return { error: m };
    const n = parseInt1(values.n, 'n', { min: 2, max: 8 });
    if (typeof n === 'string') return { error: n };

    const steps: Step[] = [];
    const dp: (number | string)[][] = [...Array(m)].map((_, r) => [...Array(n)].map((_, c) => (r === 0 || c === 0 ? 1 : '·')));
    const view = (r?: number, c?: number): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: [...Array(m)].map((_, i) => i),
      colLabels: [...Array(n)].map((_, i) => i),
      mark: r !== undefined && c !== undefined ? { [`${r},${c}`]: 'active', [`${r - 1},${c}`]: 'src', [`${r},${c - 1}`]: 'src' } : {},
    });
    steps.push({ tag: 'init', trace: ['The top row and left column have exactly ', B(1), ' path each (straight lines) — the rest fill from two neighbors.'], state: view() });
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) {
        dp[r][c] = (dp[r - 1][c] as number) + (dp[r][c - 1] as number);
        steps.push({
          tag: 'fill',
          trace: ['Cell (', A(r), ',', A(c), '): from above ', A(dp[r - 1][c]), ' + from the left ', A(dp[r][c - 1]), ' = ', B(dp[r][c]), '.'],
          state: view(r, c),
        });
        if (steps.length > MAX_STEPS) break;
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Paths to the bottom-right corner: ', C(dp[m - 1][n - 1]), '.'],
      state: { ...view(), mark: { [`${m - 1},${n - 1}`]: 'final' } },
    });
    return { steps, result: String(dp[m - 1][n - 1]), resultDetail: `${m}×${n} grid` };
  },
  note: 'Every path enters a cell from above or from the left — those two sets are disjoint and exhaustive, so addition is exact. (The closed form is C(m+n−2, m−1); the DP is that binomial coefficient computed as Pascal\'s triangle.)',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

/* ================= 119. Longest Common Subsequence ================= */
const lcs: ProblemDef = {
  slug: 'longest-common-subsequence',
  title: 'Longest Common Subsequence',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-common-subsequence/',
  technique: 'A 2-D table: match extends the diagonal, mismatch takes the better neighbor.',
  widget: 'matrix',
  widgetTitle: 'LCS table',
  inputs: [
    { key: 'a', label: 'Text 1', defaultValue: 'abcde' },
    { key: 'b', label: 'Text 2', defaultValue: 'ace' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestCommonSubsequence(string a, string b) {'),
      L('        int m = a.size(), n = b.size();', 'init'),
      L('        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));', 'init'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (a[i-1] == b[j-1])', 'match'),
      L('                    dp[i][j] = dp[i-1][j-1] + 1;', 'match'),
      L('                else'),
      L('                    dp[i][j] = max(dp[i-1][j], dp[i][j-1]);', 'miss'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestCommonSubsequence(String a, String b) {'),
      L('        int m = a.length(), n = b.length();', 'init'),
      L('        int[][] dp = new int[m + 1][n + 1];', 'init'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (a.charAt(i-1) == b.charAt(j-1))', 'match'),
      L('                    dp[i][j] = dp[i-1][j-1] + 1;', 'match'),
      L('                else'),
      L('                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);', 'miss'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = (values.a ?? '').trim().toLowerCase();
    const b = (values.b ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,7}$/.test(a) || !/^[a-z]{1,7}$/.test(b)) return { error: 'Both strings: lowercase, 1–7 characters.' };
    const m = a.length;
    const n = b.length;
    const dp: number[][] = [...Array(m + 1)].map(() => Array(n + 1).fill(0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, diag?: boolean): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: ['ε', ...a.split('')],
      colLabels: ['ε', ...b.split('')],
      mark:
        i !== undefined && j !== undefined
          ? {
              [`${i},${j}`]: 'active',
              ...(diag ? { [`${i - 1},${j - 1}`]: 'src' } : { [`${i - 1},${j}`]: 'src', [`${i},${j - 1}`]: 'src' }),
            }
          : {},
    });
    steps.push({ tag: 'init', trace: ['dp[i][j] = LCS length of the first i chars of "', A(a), '" and first j of "', A(b), '". Row/col 0 (empty prefix) are 0.'], state: view() });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            tag: 'match',
            trace: ["'", B(a[i - 1]), "' = '", B(b[j - 1]), "' — extend the diagonal: ", A(dp[i - 1][j - 1]), ' + 1 = ', B(dp[i][j]), '.'],
            state: view(i, j, true),
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            tag: 'miss',
            trace: ["'", F(a[i - 1]), "' ≠ '", F(b[j - 1]), "' — drop one character or the other: max(", A(dp[i - 1][j]), ', ', A(dp[i][j - 1]), ') = ', A(dp[i][j]), '.'],
            state: view(i, j, false),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
    }
    steps.push({ tag: 'ret', trace: ['LCS length: ', C(dp[m][n]), '.'], state: { ...view(), mark: { [`${m},${n}`]: 'final' } } });
    return { steps, result: String(dp[m][n]) };
  },
  note: 'The recurrence mirrors an editor\'s three options at each character pair — and the diagonal move is only legal on a match, which is precisely what makes the counted characters a *common* subsequence. This table is the backbone of diff tools.',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

/* ================= 121. Target Sum ================= */
const targetSum: ProblemDef = {
  slug: 'target-sum',
  title: 'Target Sum',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/target-sum/',
  technique: 'Count ways to reach each running sum — every number forks into + and −.',
  widget: 'matrix',
  widgetTitle: 'Ways per reachable sum (row per item)',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 1, 1, 1, 1', wide: true },
    { key: 'target', label: 'Target', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findTargetSumWays(vector<int>& nums, int target) {'),
      L('        unordered_map<int, int> ways{{0, 1}};', 'init'),
      L('        for (int x : nums) {', 'item'),
      L('            unordered_map<int, int> next;', 'item'),
      L('            for (auto& [sum, cnt] : ways) {', 'fork'),
      L('                next[sum + x] += cnt;', 'fork'),
      L('                next[sum - x] += cnt;', 'fork'),
      L('            }'),
      L('            ways = move(next);', 'item'),
      L('        }'),
      L('        return ways[target];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findTargetSumWays(int[] nums, int target) {'),
      L('        Map<Integer, Integer> ways = new HashMap<>();', 'init'),
      L('        ways.put(0, 1);', 'init'),
      L('        for (int x : nums) {', 'item'),
      L('            Map<Integer, Integer> next = new HashMap<>();', 'item'),
      L('            for (var e : ways.entrySet()) {', 'fork'),
      L('                next.merge(e.getKey() + x, e.getValue(), Integer::sum);', 'fork'),
      L('                next.merge(e.getKey() - x, e.getValue(), Integer::sum);', 'fork'),
      L('            }'),
      L('            ways = next;', 'item'),
      L('        }'),
      L('        return ways.getOrDefault(target, 0);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 5, maxLen: 6 });
    if (typeof nums === 'string') return { error: nums };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };
    const total = nums.reduce((x, y) => x + y, 0);

    const steps: Step[] = [];
    let ways = new Map<number, number>([[0, 1]]);
    const sums = [...Array(2 * total + 1)].map((_, i) => i - total);
    const rows: string[][] = [sums.map((s) => (ways.has(s) ? String(ways.get(s)) : ''))];
    const rowLabels = ['start'];
    const view = (): MatrixState => ({
      grid: rows,
      rowLabels: [...rowLabels],
      colLabels: sums,
      mark: Object.fromEntries(
        rows.flatMap((row, r) => row.map((v, c) => (v !== '' ? [`${r},${c}`, sums[c] === target && r === rows.length - 1 ? 'final' : 'good'] : null)).filter(Boolean) as [string, 'good' | 'final'][])
      ),
      aggs: [{ label: 'target', value: String(target), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Before any number, sum ', B(0), ' is reachable in ', B(1), ' way. Each number splits every reachable sum into two.'], state: view() });
    for (const x of nums) {
      const next = new Map<number, number>();
      for (const [sum, cnt] of ways) {
        next.set(sum + x, (next.get(sum + x) ?? 0) + cnt);
        next.set(sum - x, (next.get(sum - x) ?? 0) + cnt);
      }
      ways = next;
      rows.push(sums.map((s) => (ways.has(s) ? String(ways.get(s)) : '')));
      rowLabels.push(`±${x}`);
      steps.push({
        tag: 'fork',
        tag2: 'item',
        trace: ['Apply ', A(`±${x}`), ': every sum s forks into ', A(`s+${x}`), ' and ', A(`s−${x}`), ', counts adding where forks collide.'],
        state: view(),
      });
    }
    const result = ways.get(target) ?? 0;
    steps.push({
      tag: 'ret',
      trace: ['Ways to hit ', C(target), ': ', C(result), '.'],
      state: view(),
    });
    return { steps, result: String(result), resultDetail: `${result} sign assignments` };
  },
  note: 'The state is not "which numbers were used" (2ⁿ histories) but only "what is the running sum" — many histories collapse into one bucket, and their counts add. That collapse is the entire speedup of DP over brute force.',
  complexity: { time: 'O(n · total)', space: 'O(total)' },
};

/* ================= 122. Edit Distance ================= */
const editDistance: ProblemDef = {
  slug: 'edit-distance',
  title: 'Edit Distance',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/edit-distance/',
  technique: 'dp[i][j] = edits to turn the first i chars of one word into the first j of the other.',
  widget: 'matrix',
  widgetTitle: 'Edit-distance table',
  inputs: [
    { key: 'a', label: 'Word 1', defaultValue: 'horse' },
    { key: 'b', label: 'Word 2', defaultValue: 'ros' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minDistance(string a, string b) {'),
      L('        int m = a.size(), n = b.size();', 'init'),
      L('        vector<vector<int>> dp(m + 1, vector<int>(n + 1));', 'init'),
      L('        for (int i = 0; i <= m; i++) dp[i][0] = i;', 'base'),
      L('        for (int j = 0; j <= n; j++) dp[0][j] = j;', 'base'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (a[i-1] == b[j-1])', 'same'),
      L('                    dp[i][j] = dp[i-1][j-1];', 'same'),
      L('                else'),
      L('                    dp[i][j] = 1 + min({dp[i-1][j-1],   // replace', 'edit'),
      L('                                        dp[i-1][j],     // delete', 'edit'),
      L('                                        dp[i][j-1]});   // insert', 'edit'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minDistance(String a, String b) {'),
      L('        int m = a.length(), n = b.length();', 'init'),
      L('        int[][] dp = new int[m + 1][n + 1];', 'init'),
      L('        for (int i = 0; i <= m; i++) dp[i][0] = i;', 'base'),
      L('        for (int j = 0; j <= n; j++) dp[0][j] = j;', 'base'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (a.charAt(i-1) == b.charAt(j-1))', 'same'),
      L('                    dp[i][j] = dp[i-1][j-1];', 'same'),
      L('                else'),
      L('                    dp[i][j] = 1 + Math.min(dp[i-1][j-1],', 'edit'),
      L('                                   Math.min(dp[i-1][j], dp[i][j-1]));', 'edit'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = (values.a ?? '').trim().toLowerCase();
    const b = (values.b ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,7}$/.test(a) || !/^[a-z]{1,7}$/.test(b)) return { error: 'Both words: lowercase, 1–7 characters.' };
    const m = a.length;
    const n = b.length;
    const dp: number[][] = [...Array(m + 1)].map((_, i) => [...Array(n + 1)].map((_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, diagOnly?: boolean): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: ['ε', ...a.split('')],
      colLabels: ['ε', ...b.split('')],
      mark:
        i !== undefined && j !== undefined
          ? {
              [`${i},${j}`]: 'active',
              [`${i - 1},${j - 1}`]: 'src',
              ...(diagOnly ? {} : { [`${i - 1},${j}`]: 'src', [`${i},${j - 1}`]: 'src' }),
            }
          : {},
    });
    steps.push({ tag: 'base', trace: ['Turning any prefix into the empty string costs its length in deletions — that fills row 0 and column 0.'], state: view() });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            tag: 'same',
            trace: ["'", B(a[i - 1]), "' already matches — no edit; copy the diagonal: ", B(dp[i][j]), '.'],
            state: view(i, j, true),
          });
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            tag: 'edit',
            trace: [
              "'", F(a[i - 1]), "' vs '", F(b[j - 1]), "': 1 + min(replace ", A(dp[i - 1][j - 1]), ', delete ', A(dp[i - 1][j]), ', insert ', A(dp[i][j - 1]), ') = ', B(dp[i][j]), '.',
            ],
            state: view(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
    }
    steps.push({ tag: 'ret', trace: ['Minimum edits to turn "', A(a), '" into "', A(b), '": ', C(dp[m][n]), '.'], state: { ...view(), mark: { [`${m},${n}`]: 'final' } } });
    return { steps, result: String(dp[m][n]) };
  },
  note: 'The three table moves correspond exactly to the three edits — diagonal = replace, up = delete, left = insert — and a match makes the diagonal free. Every spell-checker and DNA aligner runs on this recurrence.',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

/* ================= 123. Maximal Square ================= */
const maximalSquare: ProblemDef = {
  slug: 'maximal-square',
  title: 'Maximal Square',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximal-square/',
  technique: 'dp = largest square ending at each cell: 1 + min of the three neighbors.',
  widget: 'matrix',
  widgetTitle: 'Square sizes',
  inputs: [{ key: 'matrix', label: 'Binary matrix (rows ";" separated)', defaultValue: '10100;10111;11111;10010', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maximalSquare(vector<vector<char>>& matrix) {'),
      L('        int R = matrix.size(), C = matrix[0].size(), best = 0;', 'init'),
      L('        vector<vector<int>> dp(R, vector<int>(C, 0));', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (matrix[r][c] == \'1\') {', 'one'),
      L('                    dp[r][c] = (r == 0 || c == 0) ? 1 :', 'one'),
      L('                        1 + min({dp[r-1][c-1], dp[r-1][c], dp[r][c-1]});', 'one'),
      L('                    best = max(best, dp[r][c]);', 'best'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return best * best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maximalSquare(char[][] matrix) {'),
      L('        int R = matrix.length, C = matrix[0].length, best = 0;', 'init'),
      L('        int[][] dp = new int[R][C];', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (matrix[r][c] == \'1\') {', 'one'),
      L('                    dp[r][c] = (r == 0 || c == 0) ? 1 :', 'one'),
      L('                        1 + Math.min(dp[r-1][c-1], Math.min(dp[r-1][c], dp[r][c-1]));', 'one'),
      L('                    best = Math.max(best, dp[r][c]);', 'best'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return best * best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.matrix, 6, 6);
    if (typeof g === 'string') return { error: g };
    if (!g.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Matrix must contain only 0 and 1.' };
    const R = g.length;
    const Cn = g[0].length;
    const dp: number[][] = [...Array(R)].map(() => Array(Cn).fill(0));
    const steps: Step[] = [];
    let best = 0;
    const view = (r?: number, c?: number): MatrixState => ({
      grid: dp.map((row, rr) => row.map((v, cc) => (g[rr][cc] === 0 ? '·' : v))),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark:
        r !== undefined && c !== undefined
          ? { [`${r},${c}`]: 'active', [`${r - 1},${c - 1}`]: 'src', [`${r - 1},${c}`]: 'src', [`${r},${c - 1}`]: 'src' }
          : {},
      aggs: [{ label: 'best side', value: String(best), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['dp[r][c] = side of the largest all-1s square whose ', A('bottom-right corner'), ' is (r,c). Zeros stay 0 (shown ·).'], state: view() });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (g[r][c] === 1) {
          dp[r][c] = r === 0 || c === 0 ? 1 : 1 + Math.min(dp[r - 1][c - 1], dp[r - 1][c], dp[r][c - 1]);
          const improved = dp[r][c] > best;
          if (improved) best = dp[r][c];
          steps.push({
            tag: 'one',
            tag2: improved ? 'best' : undefined,
            trace:
              r === 0 || c === 0
                ? ['Border cell (', A(r), ',', A(c), ') is 1 — a 1×1 square.']
                : ['Cell (', A(r), ',', A(c), '): 1 + min(', A(dp[r - 1][c - 1]), ', ', A(dp[r - 1][c]), ', ', A(dp[r][c - 1]), ') = ', B(dp[r][c]), improved ? ' — biggest square yet.' : '.'],
            state: view(r, c),
          });
          if (steps.length > MAX_STEPS) break;
        }
      }
    }
    steps.push({ tag: 'ret', trace: ['Largest square has side ', C(best), ' → area ', C(best * best), '.'], state: view() });
    return { steps, result: String(best * best), resultDetail: `side ${best}` };
  },
  note: 'A k-square ending at (r,c) needs (k−1)-squares ending at all three neighbors — the *minimum* of the three is the binding constraint, which is why one weak neighbor caps the square. Area falls out as best².',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

/* ================= 124. Minimum Path Sum ================= */
const minPathSum: ProblemDef = {
  slug: 'minimum-path-sum',
  title: 'Minimum Path Sum',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-path-sum/',
  technique: 'Each cell\'s cheapest path = its own cost + the cheaper of top/left.',
  widget: 'matrix',
  widgetTitle: 'Cumulative costs',
  inputs: [{ key: 'grid', label: 'Cost grid (rows ";" separated)', defaultValue: '1,3,1;1,5,1;4,2,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minPathSum(vector<vector<int>>& grid) {'),
      L('        int R = grid.size(), C = grid[0].size();', 'init'),
      L('        vector<vector<int>> dp(R, vector<int>(C));', 'init'),
      L('        dp[0][0] = grid[0][0];', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (r == 0 && c == 0) continue;', 'loop'),
      L('                int top = (r > 0) ? dp[r-1][c] : INT_MAX;', 'fill'),
      L('                int left = (c > 0) ? dp[r][c-1] : INT_MAX;', 'fill'),
      L('                dp[r][c] = grid[r][c] + min(top, left);', 'fill'),
      L('            }'),
      L('        }'),
      L('        return dp[R-1][C-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minPathSum(int[][] grid) {'),
      L('        int R = grid.length, C = grid[0].length;', 'init'),
      L('        int[][] dp = new int[R][C];', 'init'),
      L('        dp[0][0] = grid[0][0];', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'loop'),
      L('            for (int c = 0; c < C; c++) {', 'loop'),
      L('                if (r == 0 && c == 0) continue;', 'loop'),
      L('                int top = (r > 0) ? dp[r-1][c] : Integer.MAX_VALUE;', 'fill'),
      L('                int left = (c > 0) ? dp[r][c-1] : Integer.MAX_VALUE;', 'fill'),
      L('                dp[r][c] = grid[r][c] + Math.min(top, left);', 'fill'),
      L('            }'),
      L('        }'),
      L('        return dp[R-1][C-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.grid, 6, 6);
    if (typeof g === 'string') return { error: g };
    const R = g.length;
    const Cn = g[0].length;
    const dp: number[][] = [...Array(R)].map(() => Array(Cn).fill(0));
    dp[0][0] = g[0][0];
    const steps: Step[] = [];
    const view = (r?: number, c?: number): MatrixState => ({
      grid: dp.map((row, rr) => row.map((v, cc) => (rr > (r ?? R) || (rr === (r ?? R) && cc > (c ?? Cn)) ? g[rr][cc] : v))),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark:
        r !== undefined && c !== undefined
          ? { [`${r},${c}`]: 'active', ...(r > 0 ? { [`${r - 1},${c}`]: 'src' as const } : {}), ...(c > 0 ? { [`${r},${c - 1}`]: 'src' as const } : {}) }
          : {},
    });
    steps.push({ tag: 'init', trace: ['Start at (0,0) with cost ', A(g[0][0]), '. Fill each cell with its cheapest cumulative cost.'], state: view(0, 0) });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        if (r === 0 && c === 0) continue;
        const top = r > 0 ? dp[r - 1][c] : Infinity;
        const left = c > 0 ? dp[r][c - 1] : Infinity;
        dp[r][c] = g[r][c] + Math.min(top, left);
        steps.push({
          tag: 'fill',
          trace: ['Cell (', A(r), ',', A(c), ') costs ', A(g[r][c]), ' + min(top ', A(top === Infinity ? '∞' : top), ', left ', A(left === Infinity ? '∞' : left), ') = ', B(dp[r][c]), '.'],
          state: view(r, c),
        });
        if (steps.length > MAX_STEPS) break;
      }
    }
    steps.push({ tag: 'ret', trace: ['Cheapest path to the corner: ', C(dp[R - 1][Cn - 1]), '.'], state: { ...view(), mark: { [`${R - 1},${Cn - 1}`]: 'final' } } });
    return { steps, result: String(dp[R - 1][Cn - 1]) };
  },
  note: 'Down/right-only movement gives the grid a topological order for free — by the time a cell is filled, both cells it depends on are final. Greedy "step to the cheaper neighbor" fails; only accumulated bests are safe.',
  complexity: { time: 'O(R·C)', space: 'O(R·C)' },
};

/* ================= 126. Regular Expression Matching ================= */
const regexMatch: ProblemDef = {
  slug: 'regular-expression-matching',
  title: 'Regular Expression Matching',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/regular-expression-matching/',
  technique: 'dp[i][j] = does s[0..i) match p[0..j)? A "*" either takes zero or one-more of its char.',
  widget: 'matrix',
  widgetTitle: 'Match table (s rows × p cols)',
  inputs: [
    { key: 's', label: 'String s', defaultValue: 'aab' },
    { key: 'p', label: 'Pattern p', defaultValue: 'c*a*b' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isMatch(string s, string p) {'),
      L('        int m = s.size(), n = p.size();', 'init'),
      L('        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));', 'init'),
      L('        dp[0][0] = true;', 'init'),
      L('        for (int j = 2; j <= n; j += 1)', 'empty'),
      L('            if (p[j-1] == \'*\') dp[0][j] = dp[0][j-2];', 'empty'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (p[j-1] == \'*\') {', 'star'),
      L('                    dp[i][j] = dp[i][j-2] ||', 'star'),
      L('                        ((p[j-2] == \'.\' || p[j-2] == s[i-1]) && dp[i-1][j]);', 'star'),
      L('                } else {'),
      L('                    dp[i][j] = (p[j-1] == \'.\' || p[j-1] == s[i-1]) && dp[i-1][j-1];', 'char'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isMatch(String s, String p) {'),
      L('        int m = s.length(), n = p.length();', 'init'),
      L('        boolean[][] dp = new boolean[m + 1][n + 1];', 'init'),
      L('        dp[0][0] = true;', 'init'),
      L('        for (int j = 2; j <= n; j++)', 'empty'),
      L('            if (p.charAt(j-1) == \'*\') dp[0][j] = dp[0][j-2];', 'empty'),
      L('        for (int i = 1; i <= m; i++) {', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (p.charAt(j-1) == \'*\') {', 'star'),
      L('                    dp[i][j] = dp[i][j-2] ||', 'star'),
      L('                        ((p.charAt(j-2) == \'.\' || p.charAt(j-2) == s.charAt(i-1))', 'star'),
      L('                         && dp[i-1][j]);', 'star'),
      L('                } else {'),
      L('                    dp[i][j] = (p.charAt(j-1) == \'.\' || p.charAt(j-1) == s.charAt(i-1))', 'char'),
      L('                               && dp[i-1][j-1];', 'char'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    const p = (values.p ?? '').trim();
    if (!/^[a-z]{0,7}$/.test(s)) return { error: 's: lowercase letters, ≤ 7.' };
    if (!/^[a-z.*]{1,7}$/.test(p)) return { error: 'p: lowercase, "." and "*", ≤ 7.' };
    if (/^\*/.test(p) || /\*\*/.test(p)) return { error: 'Invalid pattern: "*" must follow a character.' };
    const m = s.length;
    const n = p.length;
    const dp: boolean[][] = [...Array(m + 1)].map(() => Array(n + 1).fill(false));
    dp[0][0] = true;
    const steps: Step[] = [];
    const view = (i?: number, j?: number, srcs: [number, number][] = []): MatrixState => ({
      grid: dp.map((row) => row.map((v) => (v ? '✓' : ''))),
      rowLabels: ['ε', ...s.split('')],
      colLabels: ['ε', ...p.split('')],
      mark: {
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
        ...Object.fromEntries(srcs.map(([r, c]) => [`${r},${c}`, 'src'])),
      },
    });
    steps.push({ tag: 'init', trace: ['dp[i][j]: do the first i chars of s match the first j of p? Empty matches empty: dp[0][0] = ', B('✓'), '.'], state: view(0, 0) });
    for (let j = 2; j <= n; j++) {
      if (p[j - 1] === '*') {
        dp[0][j] = dp[0][j - 2];
        if (dp[0][j]) {
          steps.push({ tag: 'empty', trace: ['"', A(p.slice(0, j)), '" can match the empty string — the ', A(`${p[j - 2]}*`), ' unit vanishes.'], state: view(0, j, [[0, j - 2]]) });
        }
      }
    }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') {
          const zero = dp[i][j - 2];
          const oneMore = (p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j];
          dp[i][j] = zero || oneMore;
          if (dp[i][j] && steps.length < MAX_STEPS) {
            steps.push({
              tag: 'star',
              trace: [
                's[0..', A(i), ') vs p[0..', A(j), ') — "', A(`${p[j - 2]}*`), '" matches via ',
                zero ? B('zero occurrences') : B('one more occurrence'), ': ✓.',
              ],
              state: view(i, j, zero ? [[i, j - 2]] : [[i - 1, j]]),
            });
          }
        } else {
          dp[i][j] = (p[j - 1] === '.' || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];
          if (dp[i][j] && steps.length < MAX_STEPS) {
            steps.push({
              tag: 'char',
              trace: ["'", B(s[i - 1]), "' matches '", B(p[j - 1]), "' and the shorter prefixes matched — ✓."],
              state: view(i, j, [[i - 1, j - 1]]),
            });
          }
        }
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Full match dp[', A(m), '][', A(n), '] = ', C(String(dp[m][n])), '.'],
      state: { ...view(), mark: { [`${m},${n}`]: dp[m][n] ? 'final' : 'dim' } },
    });
    return { steps, result: String(dp[m][n]) };
  },
  note: 'The "*" never stands alone — it forms a unit with the previous character, and that unit has exactly two behaviors: disappear (look two pattern columns left) or absorb one more character (look one string row up). Encoding those two arrows correctly is the whole problem.',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

export const dp2 = [longestPalindrome, palindromicSubstrings, partitionSubset, uniquePaths, lcs, targetSum, editDistance, maximalSquare, minPathSum, regexMatch];
