// Dynamic Programming, part 4 — string tables, stock state machines and partition DP.
import type { ArrayState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/* ================= Maximum Length of Repeated Subarray ================= */
const repeatedSubarray: ProblemDef = {
  slug: 'maximum-length-of-repeated-subarray',
  title: 'Maximum Length of Repeated Subarray',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-length-of-repeated-subarray/',
  technique: 'dp[i][j] = length of the common run ending exactly at these two positions.',
  widget: 'matrix',
  widgetTitle: 'Common-suffix lengths',
  inputs: [
    { key: 'a', label: 'Array A', defaultValue: '1, 2, 3, 2, 1', wide: true },
    { key: 'b', label: 'Array B', defaultValue: '3, 2, 1, 4, 7', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findLength(vector<int>& a, vector<int>& b) {'),
      L('        int m = a.size(), n = b.size(), best = 0;'),
      L('        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++)', 'loop'),
      L('                if (a[i-1] == b[j-1]) {', 'match'),
      L('                    dp[i][j] = dp[i-1][j-1] + 1;', 'match'),
      L('                    best = max(best, dp[i][j]);', 'best'),
      L('                }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findLength(int[] a, int[] b) {'),
      L('        int m = a.length, n = b.length, best = 0;'),
      L('        int[][] dp = new int[m + 1][n + 1];', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++)', 'loop'),
      L('                if (a[i-1] == b[j-1]) {', 'match'),
      L('                    dp[i][j] = dp[i-1][j-1] + 1;', 'match'),
      L('                    best = Math.max(best, dp[i][j]);', 'best'),
      L('                }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.a, { maxLen: 7 });
    if (typeof a === 'string') return { error: a };
    const b = parseIntArray(values.b, { maxLen: 7 });
    if (typeof b === 'string') return { error: b };
    const m = a.length;
    const n = b.length;
    const dp = [...Array(m + 1)].map(() => [...Array(n + 1)].map(() => 0));
    const steps: Step[] = [];
    let best = 0;
    let bestAt: [number, number] = [0, 0];
    const view = (i?: number, j?: number, src = false): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: ['ε', ...a.map(String)],
      colLabels: ['ε', ...b.map(String)],
      mark: {
        ...(src && i && j ? { [`${i - 1},${j - 1}`]: 'src' as const } : {}),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'longest so far', value: String(best), c: 'c' }],
    });
    steps.push({
      tag: 'base',
      trace: [
        'dp[i][j] counts the common run ending ', A('exactly'), ' at a[i−1] and b[j−1]. Unlike LCS, a mismatch resets it to zero — subarrays must be contiguous.',
      ],
      state: view(),
    });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          const improved = dp[i][j] > best;
          if (improved) {
            best = dp[i][j];
            bestAt = [i, j];
          }
          steps.push({
            tag: 'match',
            trace: [
              A(a[i - 1]), ' = ', A(b[j - 1]), ' — extend the diagonal run: ', A(dp[i - 1][j - 1]), ' + 1 = ', B(dp[i][j]),
              improved ? ' — a new longest.' : '.',
            ],
            state: view(i, j, true),
          });
        } else {
          steps.push({
            tag: 'loop',
            trace: [F(a[i - 1]), ' ≠ ', F(b[j - 1]), ' — the run breaks, so dp stays ', F(0), '.'],
            state: view(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const sub = best ? a.slice(bestAt[0] - best, bestAt[0]) : [];
    steps.push({
      tag: 'ret',
      trace: best ? ['Longest repeated subarray has length ', C(best), ': [', C(sub.join(', ')), '].'] : ['The arrays share no common subarray.'],
      state: { ...view(), mark: best ? { [`${bestAt[0]},${bestAt[1]}`]: 'final' } : {} },
    });
    return { steps, result: String(best), resultDetail: best ? `[${sub.join(', ')}]` : undefined };
  },
  note: 'The answer is a maximum over the whole table, not dp[m][n] — a common run can end anywhere, unlike LCS where the bottom-right cell accumulates everything. That single difference is what separates "subarray" (contiguous) from "subsequence" problems.',
  complexity: { time: 'O(m·n)', space: 'O(m·n), reducible to O(n)' },
};

/* ================= Longest Palindromic Subsequence ================= */
const longestPalinSubseq: ProblemDef = {
  slug: 'longest-palindromic-subsequence',
  title: 'Longest Palindromic Subsequence',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-palindromic-subsequence/',
  technique: 'It is the LCS of the string with its own reverse — or an interval DP over [i, j].',
  widget: 'matrix',
  widgetTitle: 'Best palindrome inside each interval',
  inputs: [{ key: 's', label: 'String', defaultValue: 'bbbab', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestPalindromeSubseq(string s) {'),
      L('        int n = s.size();'),
      L('        vector<vector<int>> dp(n, vector<int>(n, 0));'),
      L('        for (int i = 0; i < n; i++) dp[i][i] = 1;', 'base'),
      L('        for (int len = 2; len <= n; len++)', 'len'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'interval'),
      L('                int j = i + len - 1;'),
      L('                if (s[i] == s[j])', 'match'),
      L('                    dp[i][j] = dp[i+1][j-1] + 2;', 'match'),
      L('                else'),
      L('                    dp[i][j] = max(dp[i+1][j], dp[i][j-1]);', 'skip'),
      L('            }'),
      L('        return dp[0][n-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestPalindromeSubseq(String s) {'),
      L('        int n = s.length();'),
      L('        int[][] dp = new int[n][n];'),
      L('        for (int i = 0; i < n; i++) dp[i][i] = 1;', 'base'),
      L('        for (int len = 2; len <= n; len++)', 'len'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'interval'),
      L('                int j = i + len - 1;'),
      L('                if (s.charAt(i) == s.charAt(j))', 'match'),
      L('                    dp[i][j] = dp[i+1][j-1] + 2;', 'match'),
      L('                else'),
      L('                    dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);', 'skip'),
      L('            }'),
      L('        return dp[0][n-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,8}$/.test(s)) return { error: 'Use 1–8 lowercase letters.' };
    const n = s.length;
    const dp = [...Array(n)].map(() => [...Array(n)].map(() => 0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row, r) => row.map((v, c) => (c < r ? '' : v))),
      rowLabels: s.split(''),
      colLabels: s.split(''),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
    });
    for (let i = 0; i < n; i++) dp[i][i] = 1;
    steps.push({
      tag: 'base',
      trace: ['Every single character is a palindrome of length ', B(1), '. Build outward from there, shortest intervals first.'],
      state: view(),
    });
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        if (s[i] === s[j]) {
          dp[i][j] = (len === 2 ? 0 : dp[i + 1][j - 1]) + 2;
          steps.push({
            tag: 'match',
            trace: [
              'Interval "', A(s.slice(i, j + 1)), '": the ends both read \'', B(s[i]), '\', so wrap them around the best inside (', A(len === 2 ? 0 : dp[i + 1][j - 1]),
              ') for ', B(dp[i][j]), '.',
            ],
            state: view(i, j, len === 2 ? [] : [`${i + 1},${j - 1}`]),
          });
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
          steps.push({
            tag: 'skip',
            trace: [
              'Interval "', A(s.slice(i, j + 1)), '": ends \'', F(s[i]), '\' and \'', F(s[j]), '\' differ, so at least one must be dropped — best of ',
              A(dp[i + 1][j]), ' and ', A(dp[i][j - 1]), ' is ', B(dp[i][j]), '.',
            ],
            state: view(i, j, [`${i + 1},${j}`, `${i},${j - 1}`]),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Longest palindromic subsequence of "', C(s), '" has length ', C(dp[0][n - 1]), '.'],
      state: { ...view(), mark: { [`0,${n - 1}`]: 'final' } },
    });
    return { steps, result: String(dp[0][n - 1]) };
  },
  note: 'Iterating by interval length is what guarantees the smaller intervals a cell depends on are already filled — a plain row-by-row loop reads dp[i+1][j−1] before it exists. The LCS-with-reverse formulation gives the same answer and reuses code you already have.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
};

/* ================= Minimum Insertion Steps to Make a String Palindrome ================= */
const minInsertPalindrome: ProblemDef = {
  slug: 'minimum-insertion-steps-to-make-a-string-palindrome',
  title: 'Minimum Insertion Steps to Make a String Palindrome',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/',
  technique: 'Keep the longest palindromic subsequence; every other character needs one insertion.',
  widget: 'matrix',
  widgetTitle: 'Longest palindromic subsequence table',
  inputs: [{ key: 's', label: 'String', defaultValue: 'mbadm', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minInsertions(string s) {'),
      L('        int n = s.size();'),
      L('        vector<vector<int>> dp(n, vector<int>(n, 0));'),
      L('        for (int i = 0; i < n; i++) dp[i][i] = 1;', 'base'),
      L('        for (int len = 2; len <= n; len++)', 'len'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'interval'),
      L('                int j = i + len - 1;'),
      L('                dp[i][j] = s[i] == s[j] ? dp[i+1][j-1] + 2', 'fill'),
      L('                         : max(dp[i+1][j], dp[i][j-1]);', 'fill'),
      L('            }'),
      L('        return n - dp[0][n-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minInsertions(String s) {'),
      L('        int n = s.length();'),
      L('        int[][] dp = new int[n][n];'),
      L('        for (int i = 0; i < n; i++) dp[i][i] = 1;', 'base'),
      L('        for (int len = 2; len <= n; len++)', 'len'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'interval'),
      L('                int j = i + len - 1;'),
      L('                dp[i][j] = s.charAt(i) == s.charAt(j)', 'fill'),
      L('                    ? dp[i+1][j-1] + 2', 'fill'),
      L('                    : Math.max(dp[i+1][j], dp[i][j-1]);', 'fill'),
      L('            }'),
      L('        return n - dp[0][n-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,8}$/.test(s)) return { error: 'Use 1–8 lowercase letters.' };
    const n = s.length;
    const dp = [...Array(n)].map(() => [...Array(n)].map(() => 0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row, r) => row.map((v, c) => (c < r ? '' : v))),
      rowLabels: s.split(''),
      colLabels: s.split(''),
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'length', value: String(n), c: 'a' }],
    });
    for (let i = 0; i < n; i++) dp[i][i] = 1;
    steps.push({
      tag: 'base',
      trace: [
        'Characters already in a palindromic subsequence need ', A('no'), ' partner inserted. Every other character needs exactly one — so the answer is ',
        B('n − longest palindromic subsequence'), '.',
      ],
      state: view(),
    });
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        if (s[i] === s[j]) {
          dp[i][j] = (len === 2 ? 0 : dp[i + 1][j - 1]) + 2;
          steps.push({
            tag: 'fill',
            trace: ['"', A(s.slice(i, j + 1)), '": matching ends \'', B(s[i]), '\' pair up — ', B(dp[i][j]), ' characters kept.'],
            state: view(i, j, len === 2 ? [] : [`${i + 1},${j - 1}`]),
          });
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
          steps.push({
            tag: 'fill',
            trace: ['"', A(s.slice(i, j + 1)), '": ends differ, so keep the better of ', A(dp[i + 1][j]), ' and ', A(dp[i][j - 1]), ' = ', B(dp[i][j]), '.'],
            state: view(i, j, [`${i + 1},${j}`, `${i},${j - 1}`]),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const keep = dp[0][n - 1];
    const ans = n - keep;
    steps.push({
      tag: 'ret',
      trace: [
        C(keep), ' character(s) already form a palindrome, so the other ', C(ans), ' each need a mirror inserted. Answer: ', C(ans), '.',
      ],
      state: { ...view(), mark: { [`0,${n - 1}`]: 'final' } },
    });
    return { steps, result: String(ans), resultDetail: `keeps ${keep} of ${n}` };
  },
  note: 'The reduction is worth internalising: inserting characters can never destroy an existing palindromic subsequence, so the optimal plan keeps the longest one and mirrors the rest. Deleting to make a palindrome has the identical answer, which is why the two problems share a solution.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
};

/* ================= Delete Operation for Two Strings ================= */
const deleteOperation: ProblemDef = {
  slug: 'delete-operation-for-two-strings',
  title: 'Delete Operation for Two Strings',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/delete-operation-for-two-strings/',
  technique: 'Keep the longest common subsequence; everything else in both words gets deleted.',
  widget: 'matrix',
  widgetTitle: 'LCS table',
  inputs: [
    { key: 'a', label: 'Word 1', defaultValue: 'sea' },
    { key: 'b', label: 'Word 2', defaultValue: 'eat' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minDistance(string a, string b) {'),
      L('        int m = a.size(), n = b.size();'),
      L('        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++)', 'loop'),
      L('                dp[i][j] = a[i-1] == b[j-1]', 'fill'),
      L('                         ? dp[i-1][j-1] + 1', 'match'),
      L('                         : max(dp[i-1][j], dp[i][j-1]);', 'skip'),
      L('        return m + n - 2 * dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minDistance(String a, String b) {'),
      L('        int m = a.length(), n = b.length();'),
      L('        int[][] dp = new int[m + 1][n + 1];', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++)', 'loop'),
      L('                dp[i][j] = a.charAt(i-1) == b.charAt(j-1)', 'fill'),
      L('                         ? dp[i-1][j-1] + 1', 'match'),
      L('                         : Math.max(dp[i-1][j], dp[i][j-1]);', 'skip'),
      L('        return m + n - 2 * dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = (values.a ?? '').trim().toLowerCase();
    const b = (values.b ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,7}$/.test(a) || !/^[a-z]{1,7}$/.test(b)) return { error: 'Both words: 1–7 lowercase letters.' };
    const m = a.length;
    const n = b.length;
    const dp = [...Array(m + 1)].map(() => [...Array(n + 1)].map(() => 0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: ['ε', ...a.split('')],
      colLabels: ['ε', ...b.split('')],
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'base',
      trace: [
        'Deleting is only about what ', A('survives'), '. Whatever remains must appear in both words in order — that is the ', B('longest common subsequence'), '.',
      ],
      state: view(),
    });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            tag: 'match',
            trace: ["'", B(a[i - 1]), "' appears in both — keep it: ", A(dp[i - 1][j - 1]), ' + 1 = ', B(dp[i][j]), '.'],
            state: view(i, j, [`${i - 1},${j - 1}`]),
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            tag: 'skip',
            trace: ["'", F(a[i - 1]), "' ≠ '", F(b[j - 1]), "' — drop one of them and take the better of ", A(dp[i - 1][j]), ' and ', A(dp[i][j - 1]), ' = ', B(dp[i][j]), '.'],
            state: view(i, j, [`${i - 1},${j}`, `${i},${j - 1}`]),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const lcs = dp[m][n];
    const ans = m + n - 2 * lcs;
    steps.push({
      tag: 'ret',
      trace: [
        'The words share ', A(lcs), ' character(s). Delete the rest from each side: ', C(m), ' + ', C(n), ' − 2×', C(lcs), ' = ', C(ans), ' deletion(s).',
      ],
      state: { ...view(), mark: { [`${m},${n}`]: 'final' } },
    });
    return { steps, result: String(ans), resultDetail: `LCS length ${lcs}` };
  },
  note: 'The 2× is the part people drop: each character outside the common subsequence must be deleted from its own word, and the two words are counted separately. This is also edit distance restricted to deletions — no substitutions allowed, which is why the answer is larger.',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

/* ================= Distinct Subsequences ================= */
const distinctSubsequences: ProblemDef = {
  slug: 'distinct-subsequences',
  title: 'Distinct Subsequences',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/distinct-subsequences/',
  technique: 'On a matching character you may use it or skip it; the counts add.',
  widget: 'matrix',
  widgetTitle: 'Ways to form each prefix of t',
  inputs: [
    { key: 's', label: 'Source s', defaultValue: 'rabbbit' },
    { key: 't', label: 'Target t', defaultValue: 'rabbit' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numDistinct(string s, string t) {'),
      L('        int m = s.size(), n = t.size();'),
      L('        vector<vector<unsigned>> dp(m + 1, vector<unsigned>(n + 1, 0));'),
      L('        for (int i = 0; i <= m; i++) dp[i][0] = 1;', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                dp[i][j] = dp[i-1][j];          // skip s[i-1]', 'skip'),
      L('                if (s[i-1] == t[j-1])', 'match'),
      L('                    dp[i][j] += dp[i-1][j-1];   // or use it', 'match'),
      L('            }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numDistinct(String s, String t) {'),
      L('        int m = s.length(), n = t.length();'),
      L('        int[][] dp = new int[m + 1][n + 1];'),
      L('        for (int i = 0; i <= m; i++) dp[i][0] = 1;', 'base'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                dp[i][j] = dp[i-1][j];          // skip s[i-1]', 'skip'),
      L('                if (s.charAt(i-1) == t.charAt(j-1))', 'match'),
      L('                    dp[i][j] += dp[i-1][j-1];   // or use it', 'match'),
      L('            }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    const t = (values.t ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,8}$/.test(s) || !/^[a-z]{1,6}$/.test(t)) return { error: 'Source: 1–8 letters, target: 1–6 letters, lowercase.' };
    const m = s.length;
    const n = t.length;
    const dp = [...Array(m + 1)].map(() => [...Array(n + 1)].map(() => 0));
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    const steps: Step[] = [];
    const view = (i?: number, j?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row) => [...row]),
      rowLabels: ['ε', ...s.split('')],
      colLabels: ['ε', ...t.split('')],
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'base',
      trace: [
        'The empty target can be formed exactly ', B(1), ' way from any prefix of s — delete everything. That seeds the whole first column.',
      ],
      state: view(),
    });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = dp[i - 1][j];
        if (s[i - 1] === t[j - 1]) {
          dp[i][j] += dp[i - 1][j - 1];
          steps.push({
            tag: 'match',
            trace: [
              "'", A(s[i - 1]), "' matches '", A(t[j - 1]), "'. Two choices: ", B('skip'), ' this s character (', A(dp[i - 1][j]), ' ways) or ', B('use'),
              ' it (', A(dp[i - 1][j - 1]), ' ways). Total ', B(dp[i][j]), '.',
            ],
            state: view(i, j, [`${i - 1},${j}`, `${i - 1},${j - 1}`]),
          });
        } else {
          steps.push({
            tag: 'skip',
            trace: ["'", F(s[i - 1]), "' ≠ '", F(t[j - 1]), "' — this character is unusable, so carry down ", A(dp[i - 1][j]), '.'],
            state: view(i, j, [`${i - 1},${j}`]),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['"', C(t), '" appears as a subsequence of "', C(s), '" in ', C(dp[m][n]), ' distinct way(s).'],
      state: { ...view(), mark: { [`${m},${n}`]: 'final' } },
    });
    return { steps, result: String(dp[m][n]) };
  },
  note: 'Adding rather than maxing is the whole difference from LCS — we are counting ways, not measuring length, so both branches contribute. Note the skip branch always applies: even on a match, ignoring that character is a legitimate way to build the same target.',
  complexity: { time: 'O(m·n)', space: 'O(m·n), reducible to O(n)' },
};

/* ================= Wildcard Matching ================= */
const wildcardMatching: ProblemDef = {
  slug: 'wildcard-matching',
  title: 'Wildcard Matching',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/wildcard-matching/',
  technique: '? consumes one character; * either matches nothing or swallows one more.',
  widget: 'matrix',
  widgetTitle: 'Match table (pattern vs string)',
  inputs: [
    { key: 's', label: 'String', defaultValue: 'adceb' },
    { key: 'p', label: 'Pattern (? and * allowed)', defaultValue: '*a*b' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isMatch(string s, string p) {'),
      L('        int m = s.size(), n = p.size();'),
      L('        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));'),
      L('        dp[0][0] = true;', 'base'),
      L('        for (int j = 1; j <= n; j++)', 'stars'),
      L('            if (p[j-1] == \'*\') dp[0][j] = dp[0][j-1];', 'stars'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                if (p[j-1] == \'*\')', 'star'),
      L('                    dp[i][j] = dp[i-1][j] || dp[i][j-1];', 'star'),
      L('                else if (p[j-1] == \'?\' || p[j-1] == s[i-1])', 'single'),
      L('                    dp[i][j] = dp[i-1][j-1];', 'single'),
      L('            }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isMatch(String s, String p) {'),
      L('        int m = s.length(), n = p.length();'),
      L('        boolean[][] dp = new boolean[m + 1][n + 1];'),
      L('        dp[0][0] = true;', 'base'),
      L('        for (int j = 1; j <= n; j++)', 'stars'),
      L('            if (p.charAt(j-1) == \'*\') dp[0][j] = dp[0][j-1];', 'stars'),
      L('        for (int i = 1; i <= m; i++)', 'loop'),
      L('            for (int j = 1; j <= n; j++) {', 'loop'),
      L('                char c = p.charAt(j-1);'),
      L('                if (c == \'*\')', 'star'),
      L('                    dp[i][j] = dp[i-1][j] || dp[i][j-1];', 'star'),
      L('                else if (c == \'?\' || c == s.charAt(i-1))', 'single'),
      L('                    dp[i][j] = dp[i-1][j-1];', 'single'),
      L('            }'),
      L('        return dp[m][n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    const p = (values.p ?? '').trim().toLowerCase();
    if (!/^[a-z]{0,8}$/.test(s)) return { error: 'String: up to 8 lowercase letters.' };
    if (!/^[a-z?*]{1,8}$/.test(p)) return { error: 'Pattern: up to 8 characters from a–z, ? and *.' };
    const m = s.length;
    const n = p.length;
    const dp = [...Array(m + 1)].map(() => [...Array(n + 1)].map(() => false));
    dp[0][0] = true;
    const steps: Step[] = [];
    const view = (i?: number, j?: number, src: string[] = []): MatrixState => ({
      grid: dp.map((row) => row.map((v) => (v ? '✓' : '·'))),
      rowLabels: ['ε', ...s.split('')],
      colLabels: ['ε', ...p.split('')],
      mark: {
        ...Object.fromEntries(src.map((k) => [k, 'src' as const])),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
    });
    steps.push({
      tag: 'base',
      trace: ['An empty pattern matches an empty string — the one certain truth to build from.'],
      state: view(0, 0),
    });
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        dp[0][j] = dp[0][j - 1];
        steps.push({
          tag: 'stars',
          trace: ['A leading ', A('*'), ' can match the empty string, so pattern prefix "', B(p.slice(0, j)), '" still matches ε.'],
          state: view(0, j, [`0,${j - 1}`]),
        });
      } else {
        steps.push({
          tag: 'stars',
          trace: ["'", F(p[j - 1]), "' must consume a character, so no longer prefix can match the empty string."],
          state: view(0, j),
        });
        break;
      }
    }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c = p[j - 1];
        if (c === '*') {
          dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
          steps.push({
            tag: 'star',
            trace: [
              A('*'), ' at pattern position ', A(j), ': either it ', B('swallows'), " '", A(s[i - 1]), "' (", dp[i - 1][j] ? B('✓') : F('✗'),
              ') or it ', B('matches nothing'), ' (', dp[i][j - 1] ? B('✓') : F('✗'), ') — result ', dp[i][j] ? B('✓') : F('✗'), '.',
            ],
            state: view(i, j, [`${i - 1},${j}`, `${i},${j - 1}`]),
          });
        } else if (c === '?' || c === s[i - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            tag: 'single',
            trace: [
              "'", A(c), "' ", c === '?' ? 'matches any single character' : `matches '${s[i - 1]}'`, ' — so this cell inherits the diagonal: ',
              dp[i][j] ? B('✓') : F('✗'), '.',
            ],
            state: view(i, j, [`${i - 1},${j - 1}`]),
          });
        } else {
          steps.push({
            tag: 'loop',
            trace: ["'", F(c), "' cannot match '", F(s[i - 1]), "' — this cell stays ", F('✗'), '.'],
            state: view(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Pattern "', C(p), '" ', dp[m][n] ? C('matches') : C('does not match'), ' "', C(s), '".'],
      state: { ...view(), mark: { [`${m},${n}`]: 'final' } },
    });
    return { steps, result: dp[m][n] ? 'true' : 'false' };
  },
  note: 'The * rule reads as a two-way choice, and expressing it as dp[i−1][j] || dp[i][j−1] is what keeps it O(1) per cell — the naive "try every split point" version is O(n) per cell and times out. Unlike regex matching, * here is standalone and never bound to the preceding character.',
  complexity: { time: 'O(m·n)', space: 'O(m·n)' },
};

/* ================= Best Time to Buy and Sell Stock II ================= */
const stockII: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock-ii',
  title: 'Best Time to Buy and Sell Stock II',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/',
  technique: 'Unlimited trades — just bank every upward step.',
  widget: 'array',
  widgetTitle: 'Prices',
  inputs: [{ key: 'prices', label: 'Prices', defaultValue: '7, 1, 5, 3, 6, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(vector<int>& p) {'),
      L('        int total = 0;', 'init'),
      L('        for (int i = 1; i < p.size(); i++)', 'loop'),
      L('            if (p[i] > p[i-1])', 'up'),
      L('                total += p[i] - p[i-1];', 'up'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int[] p) {'),
      L('        int total = 0;', 'init'),
      L('        for (int i = 1; i < p.length; i++)', 'loop'),
      L('            if (p[i] > p[i-1])', 'up'),
      L('                total += p[i] - p[i-1];', 'up'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const p = parseIntArray(values.prices, { min: 0, maxLen: 14 });
    if (typeof p === 'string') return { error: p };
    const steps: Step[] = [];
    let total = 0;
    const kept: number[] = [];
    const st = (i?: number): ArrayState => ({
      arr: p,
      bars: true,
      mark: {
        ...Object.fromEntries(kept.map((k) => [k, 'good' as const])),
        ...(i !== undefined ? { [i]: 'active' as const } : {}),
      },
      aggs: [{ label: 'total profit', value: String(total), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'With unlimited transactions, any multi-day rise can be split into its individual daily steps for the ', A('same'), ' profit — so just collect every up-step.',
      ],
      state: st(),
    });
    for (let i = 1; i < p.length; i++) {
      if (p[i] > p[i - 1]) {
        total += p[i] - p[i - 1];
        kept.push(i);
        steps.push({
          tag: 'up',
          trace: ['Day ', A(i - 1), ' → ', A(i), ': price rises ', A(p[i - 1]), ' → ', A(p[i]), '. Bank ', B(p[i] - p[i - 1]), ', running total ', C(total), '.'],
          state: st(i),
        });
      } else {
        steps.push({
          tag: 'loop',
          trace: ['Day ', F(i - 1), ' → ', F(i), ': price falls or holds — skip, never hold through a drop.'],
          state: st(i),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Maximum profit: ', C(total), '.'], state: st() });
    return { steps, result: String(total) };
  },
  note: 'The greedy is provably optimal because buying at a local minimum and selling at the next local maximum yields the same sum as taking each daily step — so no smarter grouping exists. The DP with two states (holding / not holding) gives the identical answer and is what generalises to the k-transaction versions.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Best Time to Buy and Sell Stock III ================= */
const stockIII: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock-iii',
  title: 'Best Time to Buy and Sell Stock III',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/',
  technique: 'Track four running states: after the first buy, first sell, second buy, second sell.',
  widget: 'array',
  widgetTitle: 'Prices & the four states',
  inputs: [{ key: 'prices', label: 'Prices', defaultValue: '3, 3, 5, 0, 0, 3, 1, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(vector<int>& p) {'),
      L('        int buy1 = INT_MIN, sell1 = 0;', 'init'),
      L('        int buy2 = INT_MIN, sell2 = 0;', 'init'),
      L('        for (int x : p) {', 'loop'),
      L('            buy1  = max(buy1, -x);', 'b1'),
      L('            sell1 = max(sell1, buy1 + x);', 's1'),
      L('            buy2  = max(buy2, sell1 - x);', 'b2'),
      L('            sell2 = max(sell2, buy2 + x);', 's2'),
      L('        }'),
      L('        return sell2;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int[] p) {'),
      L('        int buy1 = Integer.MIN_VALUE, sell1 = 0;', 'init'),
      L('        int buy2 = Integer.MIN_VALUE, sell2 = 0;', 'init'),
      L('        for (int x : p) {', 'loop'),
      L('            buy1  = Math.max(buy1, -x);', 'b1'),
      L('            sell1 = Math.max(sell1, buy1 + x);', 's1'),
      L('            buy2  = Math.max(buy2, sell1 - x);', 'b2'),
      L('            sell2 = Math.max(sell2, buy2 + x);', 's2'),
      L('        }'),
      L('        return sell2;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const p = parseIntArray(values.prices, { min: 0, maxLen: 12 });
    if (typeof p === 'string') return { error: p };
    const steps: Step[] = [];
    let buy1 = -Infinity;
    let sell1 = 0;
    let buy2 = -Infinity;
    let sell2 = 0;
    const fmt = (v: number) => (v === -Infinity ? '−∞' : String(v));
    const st = (i?: number): ArrayState => ({
      arr: p,
      bars: true,
      mark: i !== undefined ? { [i]: 'active' } : {},
      aggs: [
        { label: 'after 1st buy', value: fmt(buy1), c: 'a' },
        { label: 'after 1st sell', value: fmt(sell1), c: 'b' },
        { label: 'after 2nd buy', value: fmt(buy2), c: 'a' },
        { label: 'after 2nd sell', value: fmt(sell2), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'At most ', A('two'), ' transactions means four milestones. Each state holds the best cash balance achievable ', B('having reached that milestone'), ' so far.',
      ],
      state: st(),
    });
    for (let i = 0; i < p.length; i++) {
      const x = p[i];
      buy1 = Math.max(buy1, -x);
      sell1 = Math.max(sell1, buy1 + x);
      buy2 = Math.max(buy2, sell1 - x);
      sell2 = Math.max(sell2, buy2 + x);
      steps.push({
        tag: 's2',
        trace: [
          'Day ', A(i), ' at price ', A(x), ': best after buying once ', B(fmt(buy1)), ', after selling once ', B(fmt(sell1)),
          ', after buying again ', B(fmt(buy2)), ', after selling again ', C(fmt(sell2)), '.',
        ],
        state: st(i),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Maximum profit with at most two transactions: ', C(sell2), '.'], state: st() });
    return { steps, result: String(sell2) };
  },
  note: 'Updating all four in the same pass looks like it lets you buy and sell on the same day, but that is harmless — such a trade earns zero and never beats the alternative. The negative sign on buy states is the trick that makes profit a single running balance instead of a pair of prices.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Best Time to Buy and Sell Stock IV ================= */
const stockIV: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock-iv',
  title: 'Best Time to Buy and Sell Stock IV',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/',
  technique: 'Generalise the four states to 2k of them — one buy and one sell per allowed transaction.',
  widget: 'matrix',
  widgetTitle: 'Best balance per transaction state',
  inputs: [
    { key: 'prices', label: 'Prices', defaultValue: '3, 2, 6, 5, 0, 3', wide: true },
    { key: 'k', label: 'Max transactions (k)', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(int k, vector<int>& p) {'),
      L('        if (k >= p.size() / 2) return unlimited(p);', 'shortcut'),
      L('        vector<int> buy(k + 1, INT_MIN), sell(k + 1, 0);', 'init'),
      L('        for (int x : p)', 'day'),
      L('            for (int t = 1; t <= k; t++) {', 'trans'),
      L('                buy[t]  = max(buy[t], sell[t-1] - x);', 'buy'),
      L('                sell[t] = max(sell[t], buy[t] + x);', 'sell'),
      L('            }'),
      L('        return sell[k];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int k, int[] p) {'),
      L('        if (k >= p.length / 2) return unlimited(p);', 'shortcut'),
      L('        int[] buy = new int[k + 1], sell = new int[k + 1];'),
      L('        Arrays.fill(buy, Integer.MIN_VALUE);', 'init'),
      L('        for (int x : p)', 'day'),
      L('            for (int t = 1; t <= k; t++) {', 'trans'),
      L('                buy[t]  = Math.max(buy[t], sell[t-1] - x);', 'buy'),
      L('                sell[t] = Math.max(sell[t], buy[t] + x);', 'sell'),
      L('            }'),
      L('        return sell[k];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const p = parseIntArray(values.prices, { min: 0, maxLen: 10 });
    if (typeof p === 'string') return { error: p };
    const k = parseInt1(values.k, 'k', { min: 1, max: 4 });
    if (typeof k === 'string') return { error: k };
    const NEG = -1e9;
    const buy = [...Array(k + 1)].map(() => NEG);
    const sell = [...Array(k + 1)].map(() => 0);
    const steps: Step[] = [];
    const fmt = (v: number) => (v <= NEG ? '−∞' : String(v));
    const view = (day?: number, t?: number): MatrixState => ({
      grid: [buy.slice(1).map(fmt), sell.slice(1).map(fmt)],
      rowLabels: ['holding', 'sold'],
      colLabels: [...Array(k)].map((_, i) => `t${i + 1}`),
      mark: t !== undefined ? { [`0,${t - 1}`]: 'active', [`1,${t - 1}`]: 'good' } : {},
      aggs: [
        { label: 'prices', value: p.map((v, i) => (i === day ? `[${v}]` : String(v))).join(' '), c: 'a' },
        { label: 'best profit so far', value: String(sell[k]), c: 'c' },
      ],
    });
    if (k >= Math.floor(p.length / 2)) {
      let total = 0;
      for (let i = 1; i < p.length; i++) if (p[i] > p[i - 1]) total += p[i] - p[i - 1];
      steps.push({
        tag: 'shortcut',
        trace: [
          'k = ', A(k), ' is at least half the number of days, so the limit never binds — every profitable up-step can be taken. This collapses to the unlimited case.',
        ],
        state: view(),
      });
      steps.push({ tag: 'ret', trace: ['Sum of all up-steps: ', C(total), '.'], state: view() });
      return { steps, result: String(total), resultDetail: 'transaction limit not binding' };
    }
    steps.push({
      tag: 'init',
      trace: [
        'Two arrays of ', A(k), ' states: ', B('holding'), '[t] is the best balance while inside transaction t, ', B('sold'), '[t] is the best after closing it.',
      ],
      state: view(),
    });
    for (let d = 0; d < p.length; d++) {
      const x = p[d];
      for (let t = 1; t <= k; t++) {
        buy[t] = Math.max(buy[t], sell[t - 1] - x);
        sell[t] = Math.max(sell[t], buy[t] + x);
      }
      steps.push({
        tag: 'sell',
        trace: [
          'Day ', A(d), ' at price ', A(x), ': each transaction level updates from the level ', B('below'), ' it — you can only start trade t once trade t−1 is closed. Best now ',
          C(sell[k]), '.',
        ],
        state: view(d, k),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Maximum profit with at most ', C(k), ' transaction(s): ', C(sell[k]), '.'], state: view() });
    return { steps, result: String(sell[k]) };
  },
  note: 'The k ≥ n/2 shortcut is not an optimisation detail — without it, a large k (the problem allows 10⁹) blows up both time and memory. Each level reading sell[t−1] is what enforces that transactions cannot overlap.',
  complexity: { time: 'O(n·k)', space: 'O(k)' },
};

/* ================= Best Time to Buy and Sell Stock with Transaction Fee ================= */
const stockFee: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock-with-transaction-fee',
  title: 'Best Time to Buy and Sell Stock with Transaction Fee',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/',
  technique: 'Two states — holding or free — with the fee charged once per completed sale.',
  widget: 'array',
  widgetTitle: 'Prices & the two states',
  inputs: [
    { key: 'prices', label: 'Prices', defaultValue: '1, 3, 2, 8, 4, 9', wide: true },
    { key: 'fee', label: 'Transaction fee', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(vector<int>& p, int fee) {'),
      L('        int hold = -p[0], free = 0;', 'init'),
      L('        for (int i = 1; i < p.size(); i++) {', 'loop'),
      L('            hold = max(hold, free - p[i]);', 'hold'),
      L('            free = max(free, hold + p[i] - fee);', 'free'),
      L('        }'),
      L('        return free;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int[] p, int fee) {'),
      L('        int hold = -p[0], free = 0;', 'init'),
      L('        for (int i = 1; i < p.length; i++) {', 'loop'),
      L('            hold = Math.max(hold, free - p[i]);', 'hold'),
      L('            free = Math.max(free, hold + p[i] - fee);', 'free'),
      L('        }'),
      L('        return free;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const p = parseIntArray(values.prices, { min: 0, maxLen: 12 });
    if (typeof p === 'string') return { error: p };
    if (p.length === 0) return { error: 'Enter at least one price.' };
    const fee = parseInt1(values.fee, 'Transaction fee', { min: 0 });
    if (typeof fee === 'string') return { error: fee };
    const steps: Step[] = [];
    let hold = -p[0];
    let free = 0;
    const st = (i?: number): ArrayState => ({
      arr: p,
      bars: true,
      mark: i !== undefined ? { [i]: 'active' } : {},
      aggs: [
        { label: 'best while holding', value: String(hold), c: 'a' },
        { label: 'best while free', value: String(free), c: 'c' },
        { label: 'fee', value: String(fee), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Two states are enough: ', A('holding'), ' a share (cash is negative) or ', B('free'), ' of one. Buying on day 0 leaves ', A(-p[0]), '.',
      ],
      state: st(0),
    });
    for (let i = 1; i < p.length; i++) {
      const prevHold = hold;
      hold = Math.max(hold, free - p[i]);
      free = Math.max(free, hold + p[i] - fee);
      steps.push({
        tag: 'free',
        trace: [
          'Day ', A(i), ' at ', A(p[i]), ': keep holding (', A(prevHold), ') or buy now (', A(free), ' − ', A(p[i]), ') → ', B(hold),
          '. Stay free or sell now paying the fee (', A(hold), ' + ', A(p[i]), ' − ', A(fee), ') → ', C(free), '.',
        ],
        state: st(i),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Maximum profit after fees: ', C(free), '.'], state: st() });
    return { steps, result: String(free) };
  },
  note: 'Charging the fee on sale rather than on purchase keeps the buy state simple and matters only for consistency — either convention works as long as it is charged once per round trip. The fee is what kills the "take every up-step" greedy: small rises no longer cover their own cost.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Number of Longest Increasing Subsequence ================= */
const numberOfLIS: ProblemDef = {
  slug: 'number-of-longest-increasing-subsequence',
  title: 'Number of Longest Increasing Subsequence',
  category: 'Dynamic Programming',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/',
  technique: 'Alongside each LIS length, carry how many subsequences achieve it.',
  widget: 'array',
  widgetTitle: 'Array with length / count per index',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 3, 5, 4, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findNumberOfLIS(vector<int>& a) {'),
      L('        int n = a.size(), best = 0, total = 0;'),
      L('        vector<int> len(n, 1), cnt(n, 1);', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'outer'),
      L('            for (int j = 0; j < i; j++) {', 'inner'),
      L('                if (a[j] >= a[i]) continue;', 'inner'),
      L('                if (len[j] + 1 > len[i]) {', 'longer'),
      L('                    len[i] = len[j] + 1; cnt[i] = cnt[j];', 'longer'),
      L('                } else if (len[j] + 1 == len[i])', 'tie'),
      L('                    cnt[i] += cnt[j];', 'tie'),
      L('            }'),
      L('            if (len[i] > best) { best = len[i]; total = 0; }', 'best'),
      L('            if (len[i] == best) total += cnt[i];', 'best'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findNumberOfLIS(int[] a) {'),
      L('        int n = a.length, best = 0, total = 0;'),
      L('        int[] len = new int[n], cnt = new int[n];'),
      L('        Arrays.fill(len, 1); Arrays.fill(cnt, 1);', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'outer'),
      L('            for (int j = 0; j < i; j++) {', 'inner'),
      L('                if (a[j] >= a[i]) continue;', 'inner'),
      L('                if (len[j] + 1 > len[i]) {', 'longer'),
      L('                    len[i] = len[j] + 1; cnt[i] = cnt[j];', 'longer'),
      L('                } else if (len[j] + 1 == len[i])', 'tie'),
      L('                    cnt[i] += cnt[j];', 'tie'),
      L('            }'),
      L('            if (len[i] > best) { best = len[i]; total = 0; }', 'best'),
      L('            if (len[i] == best) total += cnt[i];', 'best'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof a === 'string') return { error: a };
    const n = a.length;
    const len = a.map(() => 1);
    const cnt = a.map(() => 1);
    const steps: Step[] = [];
    let best = 0;
    let total = 0;
    const st = (i?: number, j?: number): ArrayState => ({
      arr: a,
      mark: {
        ...(j !== undefined ? { [j]: 'good' as const } : {}),
        ...(i !== undefined ? { [i]: 'active' as const } : {}),
      },
      aggs: [
        { label: 'LIS length ending here', value: len.join(', '), c: 'a' },
        { label: 'ways to achieve it', value: cnt.join(', '), c: 'b' },
        { label: 'best / total', value: `${best} / ${total}`, c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Each index starts as a subsequence of length ', B(1), ' achievable ', B(1), ' way — itself.'],
      state: st(),
    });
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (a[j] >= a[i]) continue;
        if (len[j] + 1 > len[i]) {
          len[i] = len[j] + 1;
          cnt[i] = cnt[j];
          steps.push({
            tag: 'longer',
            trace: [
              A(a[j]), ' < ', A(a[i]), ' gives a ', B('longer'), ' subsequence of length ', B(len[i]), ' — all previous counts are obsolete, so ', A('replace'),
              ' the count with ', B(cnt[j]), '.',
            ],
            state: st(i, j),
          });
        } else if (len[j] + 1 === len[i]) {
          cnt[i] += cnt[j];
          steps.push({
            tag: 'tie',
            trace: [
              A(a[j]), ' gives the ', B('same'), ' length ', B(len[i]), ' by a different route — so the counts ', A('add'), ': ', B(cnt[i]), ' way(s).',
            ],
            state: st(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (len[i] > best) {
        best = len[i];
        total = cnt[i];
        steps.push({ tag: 'best', trace: ['New longest length ', C(best), ', currently achievable ', C(total), ' way(s).'], state: st(i) });
      } else if (len[i] === best) {
        total += cnt[i];
        steps.push({ tag: 'best', trace: ['Ties the best length ', A(best), ' — total ways rises to ', C(total), '.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['There are ', C(total), ' increasing subsequence(s) of the maximum length ', C(best), '.'],
      state: st(),
    });
    return { steps, result: String(total), resultDetail: `LIS length ${best}` };
  },
  note: 'Replace-versus-add is the same distinction as in the shortest-path counting problem: a strictly longer route invalidates the old counts, an equal one contributes to them. Resetting total to zero when best increases is easy to forget and silently inflates the answer.',
  complexity: { time: 'O(n²)', space: 'O(n)' },
};

/* ================= Minimum Cost to Cut a Stick ================= */
const cutStick: ProblemDef = {
  slug: 'minimum-cost-to-cut-a-stick',
  title: 'Minimum Cost to Cut a Stick',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/',
  technique: 'Interval DP over sorted cut positions — try every cut as the first one made in a segment.',
  widget: 'matrix',
  widgetTitle: 'Cheapest cost per segment',
  inputs: [
    { key: 'n', label: 'Stick length', defaultValue: '7' },
    { key: 'cuts', label: 'Cut positions', defaultValue: '1, 3, 4, 5', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minCost(int n, vector<int>& cuts) {'),
      L('        cuts.push_back(0); cuts.push_back(n);', 'pad'),
      L('        sort(cuts.begin(), cuts.end());', 'pad'),
      L('        int m = cuts.size();'),
      L('        vector<vector<int>> dp(m, vector<int>(m, 0));'),
      L('        for (int len = 2; len < m; len++)', 'len'),
      L('            for (int i = 0; i + len < m; i++) {', 'interval'),
      L('                int j = i + len, best = INT_MAX;'),
      L('                for (int k = i + 1; k < j; k++)', 'try'),
      L('                    best = min(best, dp[i][k] + dp[k][j]', 'try'),
      L('                                     + cuts[j] - cuts[i]);', 'try'),
      L('                dp[i][j] = best;', 'set'),
      L('            }'),
      L('        return dp[0][m-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minCost(int n, int[] cuts) {'),
      L('        int[] c = Arrays.copyOf(cuts, cuts.length + 2);'),
      L('        c[cuts.length] = 0; c[cuts.length + 1] = n;', 'pad'),
      L('        Arrays.sort(c);', 'pad'),
      L('        int m = c.length;'),
      L('        int[][] dp = new int[m][m];'),
      L('        for (int len = 2; len < m; len++)', 'len'),
      L('            for (int i = 0; i + len < m; i++) {', 'interval'),
      L('                int j = i + len, best = Integer.MAX_VALUE;'),
      L('                for (int k = i + 1; k < j; k++)', 'try'),
      L('                    best = Math.min(best, dp[i][k] + dp[k][j]', 'try'),
      L('                                          + c[j] - c[i]);', 'try'),
      L('                dp[i][j] = best;', 'set'),
      L('            }'),
      L('        return dp[0][m-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'Stick length', { min: 2, max: 20 });
    if (typeof n === 'string') return { error: n };
    const raw = parseIntArray(values.cuts, { min: 1, maxLen: 5 });
    if (typeof raw === 'string') return { error: raw };
    if (raw.some((c) => c >= n)) return { error: `Cut positions must be strictly between 0 and ${n}.` };
    if (new Set(raw).size !== raw.length) return { error: 'Cut positions must be distinct.' };
    const c = [0, ...[...raw].sort((x, y) => x - y), n];
    const m = c.length;
    const dp = [...Array(m)].map(() => [...Array(m)].map(() => 0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, k?: number): MatrixState => ({
      grid: dp.map((row, r) => row.map((v, cc) => (cc <= r + 1 ? '' : v))),
      rowLabels: c.map(String),
      colLabels: c.map(String),
      mark: {
        ...(k !== undefined && i !== undefined && j !== undefined ? { [`${i},${k}`]: 'src' as const, [`${k},${j}`]: 'src' as const } : {}),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'cut positions (with the two ends)', value: c.join(', '), c: 'a' }],
    });
    steps.push({
      tag: 'pad',
      trace: [
        'Add the two ends ', A(0), ' and ', A(n), ' to the cut list and sort. Now every segment is described by a pair of these positions.',
      ],
      state: view(),
    });
    for (let len = 2; len < m; len++) {
      for (let i = 0; i + len < m; i++) {
        const j = i + len;
        let best = Infinity;
        let bestK = i + 1;
        for (let k = i + 1; k < j; k++) {
          const cand = dp[i][k] + dp[k][j] + c[j] - c[i];
          if (cand < best) {
            best = cand;
            bestK = k;
          }
        }
        dp[i][j] = best;
        steps.push({
          tag: 'set',
          trace: [
            'Segment ', A(`[${c[i]}, ${c[j]}]`), ' costs ', A(c[j] - c[i]), ' to cut ', A('once'), ', whichever cut you pick. Trying each as the ', B('first'),
            ' cut, the cheapest is at ', B(c[bestK]), ' for a total of ', B(best), '.',
          ],
          state: view(i, j, bestK),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Minimum total cost: ', C(dp[0][m - 1]), '.'],
      state: { ...view(), mark: { [`0,${m - 1}`]: 'final' } },
    });
    return { steps, result: String(dp[0][m - 1]) };
  },
  note: 'The order of cuts matters because each cut costs the length of the piece it splits, so this is not greedy — the cheapest-first heuristic genuinely fails. Padding with 0 and n is what makes every subproblem a well-formed interval, removing all the boundary special cases.',
  complexity: { time: 'O(m³)', space: 'O(m²)' },
};

/* ================= Burst Balloons ================= */
const burstBalloons: ProblemDef = {
  slug: 'burst-balloons',
  title: 'Burst Balloons',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/burst-balloons/',
  technique: 'Think backwards: pick which balloon bursts LAST in each interval, so its neighbours are the ends.',
  widget: 'matrix',
  widgetTitle: 'Best coins per open interval',
  inputs: [{ key: 'nums', label: 'Balloon values', defaultValue: '3, 1, 5, 8', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxCoins(vector<int>& nums) {'),
      L('        vector<int> a{1};'),
      L('        for (int x : nums) a.push_back(x);'),
      L('        a.push_back(1);', 'pad'),
      L('        int m = a.size();'),
      L('        vector<vector<int>> dp(m, vector<int>(m, 0));'),
      L('        for (int len = 2; len < m; len++)', 'len'),
      L('            for (int i = 0; i + len < m; i++) {', 'interval'),
      L('                int j = i + len;'),
      L('                for (int k = i + 1; k < j; k++)', 'last'),
      L('                    dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j]', 'last'),
      L('                                   + a[i] * a[k] * a[j]);', 'last'),
      L('            }'),
      L('        return dp[0][m-1];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxCoins(int[] nums) {'),
      L('        int m = nums.length + 2;'),
      L('        int[] a = new int[m];'),
      L('        a[0] = a[m-1] = 1;', 'pad'),
      L('        for (int i = 0; i < nums.length; i++) a[i+1] = nums[i];'),
      L('        int[][] dp = new int[m][m];'),
      L('        for (int len = 2; len < m; len++)', 'len'),
      L('            for (int i = 0; i + len < m; i++) {', 'interval'),
      L('                int j = i + len;'),
      L('                for (int k = i + 1; k < j; k++)', 'last'),
      L('                    dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k][j]', 'last'),
      L('                                        + a[i] * a[k] * a[j]);', 'last'),
      L('            }'),
      L('        return dp[0][m-1];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 20, maxLen: 5 });
    if (typeof nums === 'string') return { error: nums };
    const a = [1, ...nums, 1];
    const m = a.length;
    const dp = [...Array(m)].map(() => [...Array(m)].map(() => 0));
    const steps: Step[] = [];
    const view = (i?: number, j?: number, k?: number): MatrixState => ({
      grid: dp.map((row, r) => row.map((v, cc) => (cc <= r + 1 ? '' : v))),
      rowLabels: a.map(String),
      colLabels: a.map(String),
      mark: {
        ...(k !== undefined && i !== undefined && j !== undefined ? { [`${i},${k}`]: 'src' as const, [`${k},${j}`]: 'src' as const } : {}),
        ...(i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' as const } : {}),
      },
      aggs: [{ label: 'padded balloons', value: a.join(', '), c: 'a' }],
    });
    steps.push({
      tag: 'pad',
      trace: [
        'Pad both ends with imaginary ', A('1'), ' balloons that never burst. Deciding which balloon bursts ', B('first'), ' is hopeless — its neighbours keep changing. So ask which bursts ', B('last'), '.',
      ],
      state: view(),
    });
    for (let len = 2; len < m; len++) {
      for (let i = 0; i + len < m; i++) {
        const j = i + len;
        let bestK = i + 1;
        for (let k = i + 1; k < j; k++) {
          const cand = dp[i][k] + dp[k][j] + a[i] * a[k] * a[j];
          if (cand > dp[i][j]) {
            dp[i][j] = cand;
            bestK = k;
          }
        }
        steps.push({
          tag: 'last',
          trace: [
            'Open interval between ', A(a[i]), ' and ', A(a[j]), ': if ', B(a[bestK]), ' bursts last, everything else is already gone, so it earns ',
            B(`${a[i]}×${a[bestK]}×${a[j]}=${a[i] * a[bestK] * a[j]}`), ' plus both sides — total ', B(dp[i][j]), '.',
          ],
          state: view(i, j, bestK),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Maximum coins: ', C(dp[0][m - 1]), '.'],
      state: { ...view(), mark: { [`0,${m - 1}`]: 'final' } },
    });
    return { steps, result: String(dp[0][m - 1]) };
  },
  note: 'Choosing the last balloon is what makes the subproblems independent: once k is last in (i, j), nothing outside that interval can ever be its neighbour, so the two halves never interact. Framed as "which bursts first" the state is not well-defined at all — this reversal is the entire problem.',
  complexity: { time: 'O(n³)', space: 'O(n²)' },
};

/* ================= Palindrome Partitioning II ================= */
const palindromePartitioningII: ProblemDef = {
  slug: 'palindrome-partitioning-ii',
  title: 'Palindrome Partitioning II',
  category: 'Dynamic Programming',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/palindrome-partitioning-ii/',
  technique: 'Precompute which substrings are palindromes, then a linear DP over cut positions.',
  widget: 'matrix',
  widgetTitle: 'Palindrome table & minimum cuts',
  inputs: [{ key: 's', label: 'String', defaultValue: 'aab', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minCut(string s) {'),
      L('        int n = s.size();'),
      L('        vector<vector<bool>> pal(n, vector<bool>(n, false));'),
      L('        for (int len = 1; len <= n; len++)', 'pal'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'pal'),
      L('                int j = i + len - 1;'),
      L('                pal[i][j] = s[i] == s[j] &&', 'pal'),
      L('                            (len < 3 || pal[i+1][j-1]);', 'pal'),
      L('            }'),
      L('        vector<int> dp(n + 1, 0);'),
      L('        for (int i = 1; i <= n; i++) {', 'cut'),
      L('            dp[i] = INT_MAX;'),
      L('            for (int j = 0; j < i; j++)', 'try'),
      L('                if (pal[j][i-1])', 'try'),
      L('                    dp[i] = min(dp[i], j == 0 ? 0 : dp[j] + 1);', 'take'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minCut(String s) {'),
      L('        int n = s.length();'),
      L('        boolean[][] pal = new boolean[n][n];'),
      L('        for (int len = 1; len <= n; len++)', 'pal'),
      L('            for (int i = 0; i + len - 1 < n; i++) {', 'pal'),
      L('                int j = i + len - 1;'),
      L('                pal[i][j] = s.charAt(i) == s.charAt(j) &&', 'pal'),
      L('                            (len < 3 || pal[i+1][j-1]);', 'pal'),
      L('            }'),
      L('        int[] dp = new int[n + 1];'),
      L('        for (int i = 1; i <= n; i++) {', 'cut'),
      L('            dp[i] = Integer.MAX_VALUE;'),
      L('            for (int j = 0; j < i; j++)', 'try'),
      L('                if (pal[j][i-1])', 'try'),
      L('                    dp[i] = Math.min(dp[i], j == 0 ? 0 : dp[j] + 1);', 'take'),
      L('        }'),
      L('        return dp[n];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,8}$/.test(s)) return { error: 'Use 1–8 lowercase letters.' };
    const n = s.length;
    const pal = [...Array(n)].map(() => [...Array(n)].map(() => false));
    const steps: Step[] = [];
    const dp = [...Array(n + 1)].map(() => 0);
    const palView = (i?: number, j?: number): MatrixState => ({
      grid: pal.map((row, r) => row.map((v, c) => (c < r ? '' : v ? '✓' : '·'))),
      rowLabels: s.split(''),
      colLabels: s.split(''),
      mark: i !== undefined && j !== undefined ? { [`${i},${j}`]: 'active' } : {},
      aggs: [{ label: 'minimum cuts per prefix', value: dp.map((v, k) => `${k}:${v === Infinity ? '∞' : v}`).join('  '), c: 'b' }],
    });
    for (let len = 1; len <= n; len++) {
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        pal[i][j] = s[i] === s[j] && (len < 3 || pal[i + 1][j - 1]);
        if (pal[i][j]) {
          steps.push({
            tag: 'pal',
            trace: ['"', B(s.slice(i, j + 1)), '" is a palindrome — the ends match and the inside already was.'],
            state: palView(i, j),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'pal',
      trace: ['Every palindromic substring is now known in ', A('O(1)'), ' — that is what keeps the cut DP from re-checking substrings.'],
      state: palView(),
    });
    for (let i = 1; i <= n; i++) {
      dp[i] = Infinity;
      let bestJ = -1;
      for (let j = 0; j < i; j++) {
        if (pal[j][i - 1]) {
          const cand = j === 0 ? 0 : dp[j] + 1;
          if (cand < dp[i]) {
            dp[i] = cand;
            bestJ = j;
          }
        }
      }
      steps.push({
        tag: 'take',
        trace:
          bestJ === 0
            ? ['Prefix "', A(s.slice(0, i)), '" is itself a palindrome — ', C(0), ' cuts needed.']
            : [
                'Prefix "', A(s.slice(0, i)), '": the cheapest final piece is "', B(s.slice(bestJ, i)), '", leaving ', B(dp[bestJ]),
                ' cut(s) before it plus ', B(1), ' more — ', C(dp[i]), ' total.',
              ],
        state: palView(bestJ, i - 1),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Minimum cuts to split "', C(s), '" into palindromes: ', C(dp[n]), '.'],
      state: palView(),
    });
    return { steps, result: String(dp[n]) };
  },
  note: 'Splitting the work in two is what makes this tractable: the palindrome table is O(n²) once, after which each cut decision is an O(1) lookup. Checking palindromes inside the cut loop instead would push it to O(n³) and time out on the judge\'s longer strings.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
};

export const dp4: ProblemDef[] = [
  repeatedSubarray,
  longestPalinSubseq,
  minInsertPalindrome,
  deleteOperation,
  distinctSubsequences,
  wildcardMatching,
  stockII,
  stockIII,
  stockIV,
  stockFee,
  numberOfLIS,
  cutStick,
  burstBalloons,
  palindromePartitioningII,
];
