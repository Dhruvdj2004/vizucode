// Dynamic Programming, part 2: 2-D tables & palindromes.
import type { ArrayState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';
import { parseNumGrid } from './arraysHashing2';

const MAX_STEPS = 320;

/** Matrix view for a plain-recursion brute force over (i, j) subproblems: each
 *  cell shows how many times that subproblem has been solved so far, and cells
 *  solved more than once are highlighted — the repetition the DP table removes. */
export function callGrid(calls: number[][], rowLabels: (string | number)[], colLabels: (string | number)[], active: [number, number] | null, total: number): MatrixState {
  const mark: MatrixState['mark'] = {};
  calls.forEach((row, r) => row.forEach((c, k) => { if (c > 1) mark[`${r},${k}`] = 'win'; }));
  if (active) mark[`${active[0]},${active[1]}`] = 'active';
  return {
    grid: calls.map((row) => row.map((c) => (c ? `×${c}` : ''))),
    rowLabels,
    colLabels,
    mark,
    aggs: [{ label: 'total calls', value: String(total), c: 'a' }],
  };
}

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
  brute: {
    label: "Manacher's algorithm",
    technique: 'Reuse the mirror image inside the rightmost palindrome found so far, so no character is ever re-compared: O(n).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string longestPalindrome(string s) {'),
        L('        string t = "#";', 'init'),
        L('        for (char c : s) { t += c; t += \'#\'; }', 'init'),
        L('        int n = t.size(), C = 0, R = 0, best = 0, at = 0;', 'init'),
        L('        vector<int> P(n, 0);', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'center'),
        L('            if (i < R) P[i] = min(R - i, P[2 * C - i]);', 'mirror'),
        L('            while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n &&', 'grow'),
        L('                   t[i - P[i] - 1] == t[i + P[i] + 1]) P[i]++;', 'grow'),
        L('            if (i + P[i] > R) { C = i; R = i + P[i]; }', 'center'),
        L('            if (P[i] > best) { best = P[i]; at = i; }', 'record'),
        L('        }'),
        L('        return s.substr((at - best) / 2, best);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String longestPalindrome(String s) {'),
        L('        StringBuilder sb = new StringBuilder("#");', 'init'),
        L('        for (char c : s.toCharArray()) sb.append(c).append(\'#\');', 'init'),
        L('        char[] t = sb.toString().toCharArray();', 'init'),
        L('        int n = t.length, C = 0, R = 0, best = 0, at = 0;', 'init'),
        L('        int[] P = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'center'),
        L('            if (i < R) P[i] = Math.min(R - i, P[2 * C - i]);', 'mirror'),
        L('            while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n &&', 'grow'),
        L('                   t[i - P[i] - 1] == t[i + P[i] + 1]) P[i]++;', 'grow'),
        L('            if (i + P[i] > R) { C = i; R = i + P[i]; }', 'center'),
        L('            if (P[i] > best) { best = P[i]; at = i; }', 'record'),
        L('        }'),
        L('        return s.substring((at - best) / 2, (at - best) / 2 + best);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,12}$/.test(s)) return { error: 'Lowercase letters, 1–12 characters.' };
      const t = ['#', ...s.split('').flatMap((c) => [c, '#'])];
      const n = t.length;
      const P = Array(n).fill(0);
      let ctr = 0;
      let R = 0;
      let best = 0;
      let at = 0;
      const steps: Step[] = [];
      const st = (i: number | null, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: t.map((c, k) => (k <= (i ?? -1) ? `${c}｜${P[k]}` : c)),
        window: i !== null && P[i] > 0 ? [i - P[i], i + P[i]] : null,
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        mark,
        aggs: [
          { label: 'right edge R', value: String(R), c: 'b' },
          { label: 'best', value: `"${s.slice((at - best) / 2, (at - best) / 2 + best)}"`, c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Insert ', A('#'), ' between letters so odd and even palindromes both have a single center. Each box will show ', A('char｜radius'), '.'], state: st(null) });
      for (let i = 0; i < n; i++) {
        let reused = 0;
        if (i < R) {
          P[i] = Math.min(R - i, P[2 * ctr - i]);
          reused = P[i];
        }
        while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n && t[i - P[i] - 1] === t[i + P[i] + 1]) P[i]++;
        if (i + P[i] > R) {
          ctr = i;
          R = i + P[i];
        }
        const improved = P[i] > best;
        if (improved) {
          best = P[i];
          at = i;
        }
        steps.push({
          tag: improved ? 'record' : reused > 0 ? 'mirror' : 'grow',
          trace: [
            'Center ', A(i), reused > 0 ? [': the mirror at ', 2 * ctr - i, ' gives radius ', reused, ' for free'].join('') : '',
            ' → radius ', B(P[i]), improved ? ' — longest so far.' : '.',
          ],
          state: st(i, { [i]: improved ? 'good' : 'active' }),
        });
      }
      const res = s.slice((at - best) / 2, (at - best) / 2 + best);
      steps.push({ tag: 'ret', trace: ['Longest palindrome: ', C(`"${res}"`), ' (length ', C(best), ').'], state: st(n - 1) });
      return { steps, result: `"${res}"`, resultDetail: `length ${best}` };
    },
    note: 'Expanding around centers can redo up to O(n) comparisons per center. Inside the rightmost palindrome, a center’s radius is at least its mirror’s, so the right edge R only ever moves forward, which makes the whole scan linear.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
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
  brute: {
    label: "Manacher's algorithm",
    technique: 'Compute every center’s palindrome radius in O(n) with Manacher, then each radius r contributes ⌈r / 2⌉ palindromes.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int countSubstrings(string s) {'),
        L('        string t = "#";', 'init'),
        L('        for (char c : s) { t += c; t += \'#\'; }', 'init'),
        L('        int n = t.size(), C = 0, R = 0, count = 0;', 'init'),
        L('        vector<int> P(n, 0);', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'center'),
        L('            if (i < R) P[i] = min(R - i, P[2 * C - i]);', 'center'),
        L('            while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n &&', 'center'),
        L('                   t[i - P[i] - 1] == t[i + P[i] + 1]) P[i]++;', 'center'),
        L('            if (i + P[i] > R) { C = i; R = i + P[i]; }', 'center'),
        L('            count += (P[i] + 1) / 2;', 'center'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int countSubstrings(String s) {'),
        L('        StringBuilder sb = new StringBuilder("#");', 'init'),
        L('        for (char c : s.toCharArray()) sb.append(c).append(\'#\');', 'init'),
        L('        char[] t = sb.toString().toCharArray();', 'init'),
        L('        int n = t.length, C = 0, R = 0, count = 0;', 'init'),
        L('        int[] P = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'center'),
        L('            if (i < R) P[i] = Math.min(R - i, P[2 * C - i]);', 'center'),
        L('            while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n &&', 'center'),
        L('                   t[i - P[i] - 1] == t[i + P[i] + 1]) P[i]++;', 'center'),
        L('            if (i + P[i] > R) { C = i; R = i + P[i]; }', 'center'),
        L('            count += (P[i] + 1) / 2;', 'center'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      if (!/^[a-z]{1,10}$/.test(s)) return { error: 'Lowercase letters, 1–10 characters.' };
      const t = ['#', ...s.split('').flatMap((c) => [c, '#'])];
      const n = t.length;
      const P = Array(n).fill(0);
      let ctr = 0;
      let R = 0;
      let count = 0;
      const steps: Step[] = [];
      const st = (i: number | null): ArrayState => ({
        arr: t.map((c, k) => (k <= (i ?? -1) ? `${c}｜${P[k]}` : c)),
        window: i !== null && P[i] > 0 ? [i - P[i], i + P[i]] : null,
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [{ label: 'count', value: String(count), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Transform with ', A('#'), ' separators and find each center’s radius. A radius r means ', A('⌈r/2⌉'), ' palindromes share that center.'], state: st(null) });
      for (let i = 0; i < n; i++) {
        if (i < R) P[i] = Math.min(R - i, P[2 * ctr - i]);
        while (i - P[i] - 1 >= 0 && i + P[i] + 1 < n && t[i - P[i] - 1] === t[i + P[i] + 1]) P[i]++;
        if (i + P[i] > R) {
          ctr = i;
          R = i + P[i];
        }
        const add = Math.floor((P[i] + 1) / 2);
        count += add;
        steps.push({ tag: 'center', trace: ['Center ', A(i), ' has radius ', B(P[i]), ' → ', A(add), ' palindrome(s). Total ', C(count), '.'], state: st(i) });
      }
      steps.push({ tag: 'ret', trace: [C(count), ' palindromic substrings.'], state: st(n - 1) });
      return { steps, result: String(count) };
    },
    note: 'Counting by expansion re-compares characters that an enclosing palindrome already proved equal. Manacher reuses the mirror radius, so the total work is O(n) instead of O(n²).',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Plain recursion',
    technique: 'For each number, try putting it in the subset and leaving it out, until some choice hits half the total.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool canPartition(vector<int>& nums) {'),
        L('        int total = accumulate(nums.begin(), nums.end(), 0);', 'init'),
        L('        if (total % 2) return false;', 'oddsum'),
        L('        return can(nums, 0, total / 2);', 'init', 'ret'),
        L('    }'),
        L('    bool can(vector<int>& nums, int i, int need) {'),
        L('        if (need == 0) return true;', 'hit'),
        L('        if (i == nums.size() || need < 0) return false;', 'dead'),
        L('        return can(nums, i + 1, need - nums[i])', 'take'),
        L('            || can(nums, i + 1, need);', 'take'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean canPartition(int[] nums) {'),
        L('        int total = 0;', 'init'),
        L('        for (int x : nums) total += x;', 'init'),
        L('        if (total % 2 == 1) return false;', 'oddsum'),
        L('        return can(nums, 0, total / 2);', 'init', 'ret'),
        L('    }'),
        L('    private boolean can(int[] nums, int i, int need) {'),
        L('        if (need == 0) return true;', 'hit'),
        L('        if (i == nums.length || need < 0) return false;', 'dead'),
        L('        return can(nums, i + 1, need - nums[i])', 'take'),
        L('            || can(nums, i + 1, need);', 'take'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 1, maxLen: 8 });
      if (typeof nums === 'string') return { error: nums };
      const total = nums.reduce((a, b) => a + b, 0);
      const steps: Step[] = [];
      const chosen = new Set<number>();
      let calls = 0;
      const view = (i: number | null, need: number): MatrixState => ({
        grid: [nums],
        rowLabels: ['nums'],
        colLabels: nums.map((_, k) => k),
        mark: {
          ...Object.fromEntries([...chosen].map((k) => [`0,${k}`, 'good' as const])),
          ...(i !== null && i < nums.length ? { [`0,${i}`]: 'active' as const } : {}),
        },
        aggs: [
          { label: 'still needed', value: String(need), c: 'a' },
          { label: 'calls', value: String(calls), c: 'b' },
        ],
      });
      if (total % 2 !== 0) {
        steps.push({ tag: 'oddsum', trace: ['Total is ', F(total), ' — odd, so return ', C('false'), '.'], state: view(null, total) });
        return { steps, result: 'false', resultDetail: 'odd total' };
      }
      const target = total / 2;
      steps.push({ tag: 'init', trace: ['Look for a subset summing to ', C(target), ' by trying every take/skip choice.'], state: view(null, target) });
      const can = (i: number, need: number): boolean => {
        calls++;
        if (need === 0) {
          steps.push({ tag: 'hit', trace: ['Chosen numbers sum to exactly ', C(target), ' — ', C('true'), '.'], state: view(null, 0) });
          return true;
        }
        if (i === nums.length || need < 0) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'dead', trace: [need < 0 ? 'Overshot' : 'Ran out of numbers', ' — dead end, back up.'], state: view(null, need) });
          return false;
        }
        chosen.add(i);
        if (steps.length < MAX_STEPS) steps.push({ tag: 'take', trace: ['Take ', A(nums[i]), ' → still need ', A(need - nums[i]), '.'], state: view(i, need - nums[i]) });
        if (can(i + 1, need - nums[i])) return true;
        chosen.delete(i);
        if (steps.length < MAX_STEPS) steps.push({ tag: 'take', trace: ['Skip ', F(nums[i]), ' instead → still need ', A(need), '.'], state: view(i, need) });
        return can(i + 1, need);
      };
      const ok = can(0, target);
      steps.push({ tag: 'ret', trace: ['Answer: ', C(String(ok)), ' after ', A(calls), ' calls.'], state: view(null, ok ? 0 : target) });
      return { steps, result: String(ok), resultDetail: ok ? `subset sums to ${target}` : `no subset sums to ${target}` };
    },
    note: 'Up to 2ⁿ take/skip combinations are tried. The subset-sum table observes that only the sum reached matters, not which numbers produced it, so there are at most n × (total/2) distinct states.',
    complexity: { time: 'O(2ⁿ)', space: 'O(n) stack' },
  },
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
  brute: {
    label: 'Combinatorics',
    technique: 'Every path is m−1 downs and n−1 rights in some order, so the answer is C(m+n−2, m−1).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int uniquePaths(int m, int n) {'),
        L('        long long res = 1;', 'init'),
        L('        for (int k = 1; k < m; k++)', 'mul'),
        L('            res = res * (n - 1 + k) / k;', 'mul'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int uniquePaths(int m, int n) {'),
        L('        long res = 1;', 'init'),
        L('        for (int k = 1; k < m; k++)', 'mul'),
        L('            res = res * (n - 1 + k) / k;', 'mul'),
        L('        return (int) res;', 'ret'),
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
      let res = 1;
      const view = (): MatrixState => ({
        grid: [...Array(m)].map((_, r) => [...Array(n)].map((_, c) => (r === 0 && c === 0 ? 'S' : r === m - 1 && c === n - 1 ? 'E' : ''))),
        rowLabels: [...Array(m)].map((_, i) => i),
        colLabels: [...Array(n)].map((_, i) => i),
        mark: { '0,0': 'good', [`${m - 1},${n - 1}`]: 'final' },
        aggs: [
          { label: 'moves', value: `${m - 1} down + ${n - 1} right`, c: 'b' },
          { label: 'result so far', value: String(res), c: 'c' },
        ],
      });
      steps.push({
        tag: 'init',
        trace: ['Any path is a sequence of ', A(m + n - 2), ' moves, of which ', A(m - 1), ' are "down". Choosing where the downs go gives C(', A(m + n - 2), ', ', A(m - 1), ').'],
        state: view(),
      });
      for (let k = 1; k < m; k++) {
        res = (res * (n - 1 + k)) / k;
        steps.push({ tag: 'mul', trace: ['× ', A(n - 1 + k), ' / ', A(k), ' → ', B(res), ' (always a whole number).'], state: view() });
      }
      steps.push({ tag: 'ret', trace: ['C(', A(m + n - 2), ', ', A(m - 1), ') = ', C(res), ' paths.'], state: view() });
      return { steps, result: String(res), resultDetail: `${m}×${n} grid` };
    },
    note: 'The grid DP counts paths cell by cell in O(m·n). Recognising that a path is just an arrangement of downs and rights gives a closed-form binomial coefficient, computed in O(min(m, n)).',
    complexity: { time: 'O(min(m, n))', space: 'O(1)' },
  },
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
  brute: {
    label: 'Plain recursion',
    technique: 'lcs(i, j): if the characters match take 1 + lcs(i+1, j+1), else the better of skipping one character — no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int longestCommonSubsequence(string a, string b) { return lcs(a, b, 0, 0); }', 'init', 'ret'),
        L('    int lcs(string& a, string& b, int i, int j) {'),
        L('        if (i == a.size() || j == b.size()) return 0;', 'base'),
        L('        if (a[i] == b[j]) return 1 + lcs(a, b, i + 1, j + 1);', 'match'),
        L('        return max(lcs(a, b, i + 1, j), lcs(a, b, i, j + 1));', 'skip'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int longestCommonSubsequence(String a, String b) { return lcs(a, b, 0, 0); }', 'init', 'ret'),
        L('    private int lcs(String a, String b, int i, int j) {'),
        L('        if (i == a.length() || j == b.length()) return 0;', 'base'),
        L('        if (a.charAt(i) == b.charAt(j)) return 1 + lcs(a, b, i + 1, j + 1);', 'match'),
        L('        return Math.max(lcs(a, b, i + 1, j), lcs(a, b, i, j + 1));', 'skip'),
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
      const calls = [...Array(m + 1)].map(() => Array(n + 1).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, [...a.split(''), 'ε'], [...b.split(''), 'ε'], act, total);
      steps.push({ tag: 'init', trace: ['Cell (i, j) counts how many times lcs of the suffixes a[i…], b[j…] is solved.'], state: view(null) });
      const lcs = (i: number, j: number): number => {
        total++;
        calls[i][j]++;
        if (i === m || j === n) return 0;
        if (a[i] === b[j]) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'match', trace: ["'", B(a[i]), "' matches — take it and move both on."], state: view([i, j]) });
          return 1 + lcs(i + 1, j + 1);
        }
        if (steps.length < MAX_STEPS) steps.push({ tag: 'skip', trace: ["'", F(a[i]), "' ≠ '", F(b[j]), "' — branch: skip from a, or skip from b."], state: view([i, j]) });
        return Math.max(lcs(i + 1, j), lcs(i, j + 1));
      };
      const res = lcs(0, 0);
      steps.push({ tag: 'ret', trace: ['LCS length ', C(res), ' — after ', C(total), ' calls for only ', A((m + 1) * (n + 1)), ' distinct subproblems.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Every mismatch doubles the work, and the same (i, j) pair is solved along many different paths. The DP table stores each of the (m+1)(n+1) answers once.',
    complexity: { time: 'O(2^(m+n))', space: 'O(m + n) stack' },
  },
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
  brute: {
    label: 'Try every sign',
    technique: 'Recursively give each number a + or − sign and count the assignments that land on the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findTargetSumWays(vector<int>& nums, int target) {'),
        L('        return count(nums, 0, 0, target);', 'init', 'ret'),
        L('    }'),
        L('    int count(vector<int>& nums, int i, int sum, int target) {'),
        L('        if (i == nums.size()) return sum == target ? 1 : 0;', 'leaf', 'hit'),
        L('        return count(nums, i + 1, sum + nums[i], target)'),
        L('             + count(nums, i + 1, sum - nums[i], target);'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findTargetSumWays(int[] nums, int target) {'),
        L('        return count(nums, 0, 0, target);', 'init', 'ret'),
        L('    }'),
        L('    private int count(int[] nums, int i, int sum, int target) {'),
        L('        if (i == nums.length) return sum == target ? 1 : 0;', 'leaf', 'hit'),
        L('        return count(nums, i + 1, sum + nums[i], target)'),
        L('             + count(nums, i + 1, sum - nums[i], target);'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, max: 5, maxLen: 6 });
      if (typeof nums === 'string') return { error: nums };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const signs: number[] = [];
      let ways = 0;
      let leaves = 0;
      const view = (hit: boolean): MatrixState => ({
        grid: [nums.map((v, k) => (k < signs.length ? `${signs[k] > 0 ? '+' : '−'}${v}` : String(v)))],
        rowLabels: ['signs'],
        colLabels: nums.map((_, k) => k),
        mark: Object.fromEntries(signs.map((_, k) => [`0,${k}`, hit ? ('final' as const) : ('active' as const)])),
        aggs: [
          { label: 'assignments tried', value: `${leaves} / ${2 ** nums.length}`, c: 'a' },
          { label: 'ways', value: String(ways), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['There are ', A(2 ** nums.length), ' ways to assign signs. Try them all.'], state: view(false) });
      const go = (i: number, sum: number) => {
        if (i === nums.length) {
          leaves++;
          const hit = sum === target;
          if (hit) ways++;
          if (hit || steps.length < MAX_STEPS)
            steps.push({ tag: hit ? 'hit' : 'leaf', trace: ['Signs give ', hit ? B(sum) : F(sum), hit ? [' = target — ways = ', ways, '.'].join('') : [' ≠ ', target, '.'].join('')], state: view(hit) });
          return;
        }
        signs.push(1);
        go(i + 1, sum + nums[i]);
        signs[signs.length - 1] = -1;
        go(i + 1, sum - nums[i]);
        signs.pop();
      };
      go(0, 0);
      steps.push({ tag: 'ret', trace: [C(ways), ' of the ', A(leaves), ' assignments hit ', C(target), '.'], state: view(false) });
      return { steps, result: String(ways), resultDetail: `${ways} sign assignments` };
    },
    note: 'Always 2ⁿ leaves. The DP notices that after i numbers only the running sum matters, and there are at most 2·total + 1 possible sums, so it counts ways per sum instead.',
    complexity: { time: 'O(2ⁿ)', space: 'O(n) stack' },
  },
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
  brute: {
    label: 'Plain recursion',
    technique: 'ed(i, j): if characters match move both on, else 1 + the best of insert, delete or replace — no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minDistance(string a, string b) { return ed(a, b, 0, 0); }', 'init', 'ret'),
        L('    int ed(string& a, string& b, int i, int j) {'),
        L('        if (i == a.size()) return b.size() - j;', 'base'),
        L('        if (j == b.size()) return a.size() - i;', 'base'),
        L('        if (a[i] == b[j]) return ed(a, b, i + 1, j + 1);', 'match'),
        L('        return 1 + min({ed(a, b, i, j + 1),      // insert', 'edit'),
        L('                        ed(a, b, i + 1, j),      // delete', 'edit'),
        L('                        ed(a, b, i + 1, j + 1)}); // replace', 'edit'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minDistance(String a, String b) { return ed(a, b, 0, 0); }', 'init', 'ret'),
        L('    private int ed(String a, String b, int i, int j) {'),
        L('        if (i == a.length()) return b.length() - j;', 'base'),
        L('        if (j == b.length()) return a.length() - i;', 'base'),
        L('        if (a.charAt(i) == b.charAt(j)) return ed(a, b, i + 1, j + 1);', 'match'),
        L('        return 1 + Math.min(ed(a, b, i, j + 1),', 'edit'),
        L('                   Math.min(ed(a, b, i + 1, j), ed(a, b, i + 1, j + 1)));', 'edit'),
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
      const calls = [...Array(m + 1)].map(() => Array(n + 1).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, [...a.split(''), 'ε'], [...b.split(''), 'ε'], act, total);
      steps.push({ tag: 'init', trace: ['Cell (i, j) counts how many times the edit distance of suffixes a[i…], b[j…] is recomputed.'], state: view(null) });
      const ed = (i: number, j: number): number => {
        total++;
        calls[i][j]++;
        if (i === m) return n - j;
        if (j === n) return m - i;
        if (a[i] === b[j]) {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'match', trace: ["'", B(a[i]), "' = '", B(b[j]), "' — free, move both on."], state: view([i, j]) });
          return ed(i + 1, j + 1);
        }
        if (steps.length < MAX_STEPS) steps.push({ tag: 'edit', trace: ["'", F(a[i]), "' ≠ '", F(b[j]), "' — branch three ways: insert, delete, replace."], state: view([i, j]) });
        return 1 + Math.min(ed(i, j + 1), ed(i + 1, j), ed(i + 1, j + 1));
      };
      const res = ed(0, 0);
      steps.push({ tag: 'ret', trace: ['Edit distance ', C(res), ' — after ', C(total), ' calls for ', A((m + 1) * (n + 1)), ' distinct subproblems.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Each mismatch branches three ways, so the call tree grows like 3^min(m, n). The DP table computes each of the (m+1)(n+1) cells once from its three neighbours.',
    complexity: { time: 'O(3^(m+n))', space: 'O(m + n) stack' },
  },
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
  brute: {
    label: 'Brute force',
    technique: 'From every 1-cell, grow a square one size at a time for as long as the new row and column are all 1s.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maximalSquare(vector<vector<char>>& g) {'),
        L('        int R = g.size(), C = g[0].size(), best = 0;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'cell'),
        L('            for (int c = 0; c < C; c++) {', 'cell'),
        L('                int k = 0;', 'cell'),
        L('                while (r + k < R && c + k < C && allOnes(g, r, c, k)) k++;', 'grow'),
        L('                best = max(best, k);', 'grow'),
        L('            }'),
        L('        return best * best;', 'ret'),
        L('    }'),
        L('    // allOnes: the new bottom row and right column of size k + 1 are all 1'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maximalSquare(char[][] g) {'),
        L('        int R = g.length, C = g[0].length, best = 0;', 'init'),
        L('        for (int r = 0; r < R; r++)', 'cell'),
        L('            for (int c = 0; c < C; c++) {', 'cell'),
        L('                int k = 0;', 'cell'),
        L('                while (r + k < R && c + k < C && allOnes(g, r, c, k)) k++;', 'grow'),
        L('                best = Math.max(best, k);', 'grow'),
        L('            }'),
        L('        return best * best;', 'ret'),
        L('    }'),
        L('    // allOnes: the new bottom row and right column of size k + 1 are all 1'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.matrix, 6, 6);
      if (typeof g === 'string') return { error: g };
      if (!g.every((r) => r.every((v) => v === 0 || v === 1))) return { error: 'Matrix must contain only 0 and 1.' };
      const R = g.length;
      const Cn = g[0].length;
      const steps: Step[] = [];
      let best = 0;
      let bestAt: [number, number] = [0, 0];
      const view = (mark: MatrixState['mark'] = {}): MatrixState => ({
        grid: g,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(Cn)].map((_, i) => i),
        mark,
        aggs: [{ label: 'largest side', value: String(best), c: 'c' }],
      });
      const square = (r: number, c: number, k: number, m: 'active' | 'final') => {
        const out: MatrixState['mark'] = {};
        for (let dr = 0; dr < k; dr++) for (let dc = 0; dc < k; dc++) out[`${r + dr},${c + dc}`] = m;
        return out;
      };
      steps.push({ tag: 'init', trace: ['From every cell holding 1, grow a square outward and see how big it can get.'], state: view() });
      for (let r = 0; r < R; r++)
        for (let c = 0; c < Cn; c++) {
          if (g[r][c] !== 1) continue;
          let k = 0;
          const fits = (kk: number) => {
            for (let d = 0; d <= kk; d++) if (g[r + kk][c + d] !== 1 || g[r + d][c + kk] !== 1) return false;
            return true;
          };
          while (r + k < R && c + k < Cn && fits(k)) k++;
          const improved = k > best;
          if (improved) {
            best = k;
            bestAt = [r, c];
          }
          steps.push({ tag: 'grow', trace: ['From (', A(r), ',', A(c), ') the square grows to side ', improved ? B(k) : A(k), improved ? ' — largest so far.' : '.'], state: view(square(r, c, k, 'active')) });
        }
      steps.push({ tag: 'ret', trace: ['Largest square has side ', C(best), ', area ', C(best * best), '.'], state: view(square(bestAt[0], bestAt[1], best, 'final')) });
      return { steps, result: String(best * best), resultDetail: `side ${best}` };
    },
    note: 'Each growth step re-reads a whole row and column, and every cell starts its own growth, so the cost is roughly O((R·C)·min(R,C)²). The DP gets each cell’s largest square from its three neighbours in O(1).',
    complexity: { time: 'O(R·C·min(R,C)²)', space: 'O(1)' },
  },
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
  brute: {
    label: 'Plain recursion',
    technique: 'cost(r, c) = grid[r][c] + the cheaper of going down or right, recursed without memoisation.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minPathSum(vector<vector<int>>& g) { return cost(g, 0, 0); }', 'init', 'ret'),
        L('    int cost(vector<vector<int>>& g, int r, int c) {'),
        L('        int R = g.size(), C = g[0].size();'),
        L('        if (r == R - 1 && c == C - 1) return g[r][c];', 'base'),
        L('        if (r == R - 1) return g[r][c] + cost(g, r, c + 1);', 'call'),
        L('        if (c == C - 1) return g[r][c] + cost(g, r + 1, c);', 'call'),
        L('        return g[r][c] + min(cost(g, r + 1, c), cost(g, r, c + 1));', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minPathSum(int[][] g) { return cost(g, 0, 0); }', 'init', 'ret'),
        L('    private int cost(int[][] g, int r, int c) {'),
        L('        int R = g.length, C = g[0].length;'),
        L('        if (r == R - 1 && c == C - 1) return g[r][c];', 'base'),
        L('        if (r == R - 1) return g[r][c] + cost(g, r, c + 1);', 'call'),
        L('        if (c == C - 1) return g[r][c] + cost(g, r + 1, c);', 'call'),
        L('        return g[r][c] + Math.min(cost(g, r + 1, c), cost(g, r, c + 1));', 'call'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.grid, 6, 6);
      if (typeof g === 'string') return { error: g };
      const R = g.length;
      const Cn = g[0].length;
      const calls = [...Array(R)].map(() => Array(Cn).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, [...Array(R)].map((_, i) => i), [...Array(Cn)].map((_, i) => i), act, total);
      steps.push({ tag: 'init', trace: ['Cell (r, c) counts how many times the cheapest path from that cell is recomputed.'], state: view(null) });
      const cost = (r: number, c: number): number => {
        total++;
        calls[r][c]++;
        if (r === R - 1 && c === Cn - 1) return g[r][c];
        if (steps.length < MAX_STEPS)
          steps.push({ tag: 'call', trace: ['cost(', A(r), ',', A(c), ') = ', A(g[r][c]), ' + the cheaper way onward', calls[r][c] > 1 ? [' — solved ', calls[r][c], ' times now'].join('') : '', '.'], state: view([r, c]) });
        if (r === R - 1) return g[r][c] + cost(r, c + 1);
        if (c === Cn - 1) return g[r][c] + cost(r + 1, c);
        return g[r][c] + Math.min(cost(r + 1, c), cost(r, c + 1));
      };
      const res = cost(0, 0);
      steps.push({ tag: 'ret', trace: ['Cheapest path costs ', C(res), ' — after ', C(total), ' calls for ', A(R * Cn), ' cells.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'The recursion enumerates every down/right path, and there are C(R+C−2, R−1) of them. The DP fills each cell once from its top and left neighbours.',
    complexity: { time: 'O(2^(R+C))', space: 'O(R + C) stack' },
  },
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
  brute: {
    label: 'Plain recursion',
    technique: 'match(i, j): a "x*" either matches nothing (skip it) or eats one more matching character; recursed with no memo.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isMatch(string s, string p) { return match(s, p, 0, 0); }', 'init', 'ret'),
        L('    bool match(string& s, string& p, int i, int j) {'),
        L('        if (j == p.size()) return i == s.size();', 'base'),
        L('        bool first = i < s.size() && (p[j] == s[i] || p[j] == \'.\');', 'call'),
        L('        if (j + 1 < p.size() && p[j + 1] == \'*\')', 'star'),
        L('            return match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));', 'star'),
        L('        return first && match(s, p, i + 1, j + 1);', 'call'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isMatch(String s, String p) { return match(s, p, 0, 0); }', 'init', 'ret'),
        L('    private boolean match(String s, String p, int i, int j) {'),
        L('        if (j == p.length()) return i == s.length();', 'base'),
        L('        boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == \'.\');', 'call'),
        L('        if (j + 1 < p.length() && p.charAt(j + 1) == \'*\')', 'star'),
        L('            return match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));', 'star'),
        L('        return first && match(s, p, i + 1, j + 1);', 'call'),
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
      const calls = [...Array(m + 1)].map(() => Array(n + 1).fill(0));
      let total = 0;
      const steps: Step[] = [];
      const view = (act: [number, number] | null) => callGrid(calls, [...s.split(''), 'ε'], [...p.split(''), 'ε'], act, total);
      steps.push({ tag: 'init', trace: ['Cell (i, j) counts how often "does s[i…] match p[j…]?" gets asked.'], state: view(null) });
      const match = (i: number, j: number): boolean => {
        total++;
        calls[i][j]++;
        if (j === n) return i === m;
        const first = i < m && (p[j] === s[i] || p[j] === '.');
        if (j + 1 < n && p[j + 1] === '*') {
          if (steps.length < MAX_STEPS) steps.push({ tag: 'star', trace: ['"', A(p[j] + '*'), '" at s[', A(i), ']: try matching zero copies', first ? ', or eat one more character' : '', '.'], state: view([i, j]) });
          return match(i, j + 2) || (first && match(i + 1, j));
        }
        if (steps.length < MAX_STEPS) steps.push({ tag: 'call', trace: ["p[", A(j), "] = '", A(p[j]), "' vs s[", A(i), '] — ', first ? B('match') : F('no match'), '.'], state: view([i, j]) });
        return first && match(i + 1, j + 1);
      };
      const res = match(0, 0);
      steps.push({ tag: 'ret', trace: ['Answer: ', C(String(res)), ' after ', C(total), ' calls.'], state: view(null) });
      return { steps, result: String(res) };
    },
    note: 'Patterns with several stars (like "a*a*a*b") make the zero-or-more choice branch repeatedly over the same (i, j) states — exponential in the worst case. The DP table answers each (i, j) once.',
    complexity: { time: 'O(2^(m+n)) worst case', space: 'O(m + n) stack' },
  },
};

export const dp2 = [longestPalindrome, palindromicSubstrings, partitionSubset, uniquePaths, lcs, targetSum, editDistance, maximalSquare, minPathSum, regexMatch];
