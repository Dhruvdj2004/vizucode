// Strings.
import type { ArrayState, ListState, MatrixState, ProblemDef, StackState, Step } from '../lib/types';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/* ================= 151. Longest Common Prefix ================= */
const longestCommonPrefix: ProblemDef = {
  slug: 'longest-common-prefix',
  title: 'Longest Common Prefix',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/longest-common-prefix/',
  technique: 'Compare column by column — stop at the first column where any word disagrees or ends.',
  widget: 'list',
  widgetTitle: 'Words, column scan',
  inputs: [{ key: 'strs', label: 'Words (comma separated)', defaultValue: 'flower, flow, flight', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string longestCommonPrefix(vector<string>& strs) {'),
      L('        for (int col = 0; col < strs[0].size(); col++) {', 'loop'),
      L('            char c = strs[0][col];', 'col'),
      L('            for (int w = 1; w < strs.size(); w++) {', 'cmp'),
      L('                if (col == strs[w].size() || strs[w][col] != c)', 'stop'),
      L('                    return strs[0].substr(0, col);', 'stop'),
      L('            }'),
      L('        }'),
      L('        return strs[0];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String longestCommonPrefix(String[] strs) {'),
      L('        for (int col = 0; col < strs[0].length(); col++) {', 'loop'),
      L('            char c = strs[0].charAt(col);', 'col'),
      L('            for (int w = 1; w < strs.length; w++) {', 'cmp'),
      L('                if (col == strs[w].length() || strs[w].charAt(col) != c)', 'stop'),
      L('                    return strs[0].substring(0, col);', 'stop'),
      L('            }'),
      L('        }'),
      L('        return strs[0];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const words = (values.strs ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.length === 0 || words.length > 6) return { error: 'Enter 1–6 words.' };
    if (!words.every((w) => /^[a-z]{1,12}$/.test(w))) return { error: 'Lowercase words, ≤ 12 chars each.' };
    const steps: Step[] = [];
    let prefixLen = 0;
    const view = (col: number, bad?: number): ListState => ({
      chains: words.map((w, wi) => ({
        label: `w${wi + 1}`,
        items: w.split('').map((ch, i) => ({
          v: ch,
          mark: i < prefixLen ? ('win' as const) : i === col ? (bad === wi ? ('dim' as const) : ('active' as const)) : undefined,
        })),
        broken: true,
      })),
      aggs: [{ label: 'prefix', value: `"${words[0].slice(0, prefixLen)}"`, c: 'b' }],
    });
    steps.push({ tag: 'loop', trace: ['March a column pointer across all words simultaneously; the prefix grows while every word agrees.'], state: view(0) });
    outer: for (let col = 0; col < words[0].length; col++) {
      const c = words[0][col];
      for (let w = 1; w < words.length; w++) {
        if (col === words[w].length || words[w][col] !== c) {
          steps.push({
            tag: 'stop',
            trace: ['Column ', A(col), ': word ', F(w + 1), col === words[w].length ? [' has ended'].join('') : ` has '${words[w][col]}' ≠ '${c}'`, ' — the common prefix stops here.'],
            state: view(col, w),
          });
          break outer;
        }
      }
      prefixLen++;
      steps.push({ tag: 'col', trace: ['Column ', A(col), ": every word shows '", B(c), "' — prefix extends to \"", B(words[0].slice(0, prefixLen)), '".'], state: view(col) });
    }
    const result = words[0].slice(0, prefixLen);
    steps.push({ tag: 'ret', trace: ['Longest common prefix: "', C(result), '".'], state: view(prefixLen) });
    return { steps, result: `"${result}"`, resultDetail: `length ${prefixLen}` };
  },
  note: 'The prefix property is columnar: column k belongs to the answer iff all words agree on every column ≤ k. Scanning columns until the first disagreement examines no character more than once.',
  complexity: { time: 'O(total chars)', space: 'O(1)' },
};

/* ================= 152. String to Integer (atoi) ================= */
const atoi: ProblemDef = {
  slug: 'string-to-integer-atoi',
  title: 'String to Integer (atoi)',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/string-to-integer-atoi/',
  technique: 'A small state machine: skip spaces, read one sign, accumulate digits, clamp on overflow.',
  widget: 'array',
  widgetTitle: 'Characters & accumulator',
  inputs: [{ key: 's', label: 'String', defaultValue: '   -42 abc', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int myAtoi(string s) {'),
      L('        int i = 0, sign = 1;', 'init'),
      L('        long result = 0;', 'init'),
      L('        while (i < s.size() && s[i] == \' \')', 'space'),
      L('            i++;', 'space'),
      L('        if (i < s.size() && (s[i] == \'+\' || s[i] == \'-\'))', 'sign'),
      L('            sign = (s[i++] == \'-\') ? -1 : 1;', 'sign'),
      L('        while (i < s.size() && isdigit(s[i])) {', 'digit'),
      L('            result = result * 10 + (s[i++] - \'0\');', 'digit'),
      L('            if (sign * result <= INT_MIN) return INT_MIN;', 'clamp'),
      L('            if (sign * result >= INT_MAX) return INT_MAX;', 'clamp'),
      L('        }'),
      L('        return sign * result;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int myAtoi(String s) {'),
      L('        int i = 0, sign = 1;', 'init'),
      L('        long result = 0;', 'init'),
      L('        while (i < s.length() && s.charAt(i) == \' \')', 'space'),
      L('            i++;', 'space'),
      L('        if (i < s.length() && (s.charAt(i) == \'+\' || s.charAt(i) == \'-\'))', 'sign'),
      L('            sign = (s.charAt(i++) == \'-\') ? -1 : 1;', 'sign'),
      L('        while (i < s.length() && Character.isDigit(s.charAt(i))) {', 'digit'),
      L('            result = result * 10 + (s.charAt(i++) - \'0\');', 'digit'),
      L('            if (sign * result <= Integer.MIN_VALUE) return Integer.MIN_VALUE;', 'clamp'),
      L('            if (sign * result >= Integer.MAX_VALUE) return Integer.MAX_VALUE;', 'clamp'),
      L('        }'),
      L('        return (int)(sign * result);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = values.s ?? '';
    if (s.length === 0 || s.length > 20) return { error: 'Enter 1–20 characters.' };
    const chars = s.split('');
    const steps: Step[] = [];
    let i = 0;
    let sign = 1;
    let result = 0;
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;
    const st = (extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars.map((c) => (c === ' ' ? '␣' : c)),
      ptrs: i < chars.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'sign', value: sign === 1 ? '+' : '−', c: 'a' },
        { label: 'result', value: String(result), c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Four phases, strictly in order: whitespace → optional sign → digits → stop at anything else.'], state: st() });
    while (i < chars.length && chars[i] === ' ') {
      steps.push({ tag: 'space', trace: ['Leading space — skip.'], state: st({ mark: { [i]: 'dim' } }) });
      i++;
    }
    if (i < chars.length && (chars[i] === '+' || chars[i] === '-')) {
      sign = chars[i] === '-' ? -1 : 1;
      steps.push({ tag: 'sign', trace: ["Sign '", A(chars[i]), "' — the number will be ", A(sign === 1 ? 'positive' : 'negative'), '.'], state: st({ mark: { [i]: 'active' } }) });
      i++;
    }
    let clamped = false;
    while (i < chars.length && /\d/.test(chars[i])) {
      result = result * 10 + Number(chars[i]);
      steps.push({ tag: 'digit', trace: ["Digit '", A(chars[i]), "' — result = result × 10 + ", A(chars[i]), ' = ', B(result), '.'], state: st({ mark: { [i]: 'good' } }) });
      i++;
      if (sign * result <= INT_MIN) {
        result = -INT_MIN;
        clamped = true;
        steps.push({ tag: 'clamp', trace: ['Value fell below INT_MIN — ', F('clamp'), ' to ', C(INT_MIN), '.'], state: st() });
        break;
      }
      if (sign * result >= INT_MAX) {
        result = INT_MAX;
        sign = 1;
        clamped = true;
        steps.push({ tag: 'clamp', trace: ['Value exceeded INT_MAX — ', F('clamp'), ' to ', C(INT_MAX), '.'], state: st() });
        break;
      }
    }
    if (!clamped && i < chars.length) {
      steps.push({ tag: 'ret', trace: ["'", F(chars[i] === ' ' ? '␣' : chars[i]), "' is not a digit — parsing stops here; the rest is ignored."], state: st({ mark: { [i]: 'dim' } }) });
    }
    const final = clamped ? (sign === 1 ? result : INT_MIN) : sign * result;
    steps.push({ tag: 'ret', trace: ['Parsed value: ', C(final), '.'], state: st() });
    return { steps, result: String(final), resultDetail: clamped ? 'clamped to 32-bit range' : undefined };
  },
  note: 'atoi is less an algorithm than a specification-compliance test: the order of phases, single-sign rule, and 32-bit clamping are all edge-case landmines. Accumulating in a wider type (long) is the standard way to detect overflow before it corrupts.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 153. Find the Index of the First Occurrence ================= */
const strStr: ProblemDef = {
  slug: 'find-the-index-of-the-first-occurrence-in-a-string',
  title: 'Find the Index of the First Occurrence in a String',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
  technique: 'Slide the needle across the haystack, checking alignment by alignment.',
  widget: 'array',
  widgetTitle: 'Haystack & sliding needle',
  inputs: [
    { key: 'haystack', label: 'Haystack', defaultValue: 'sadbutsad', wide: true },
    { key: 'needle', label: 'Needle', defaultValue: 'sad' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int strStr(string haystack, string needle) {'),
      L('        int n = haystack.size(), m = needle.size();', 'init'),
      L('        for (int i = 0; i + m <= n; i++) {', 'align'),
      L('            int j = 0;', 'cmp'),
      L('            while (j < m && haystack[i + j] == needle[j])', 'cmp'),
      L('                j++;', 'cmp'),
      L('            if (j == m)', 'found'),
      L('                return i;', 'found'),
      L('        }'),
      L('        return -1;', 'fail'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int strStr(String haystack, String needle) {'),
      L('        int n = haystack.length(), m = needle.length();', 'init'),
      L('        for (int i = 0; i + m <= n; i++) {', 'align'),
      L('            int j = 0;', 'cmp'),
      L('            while (j < m && haystack.charAt(i + j) == needle.charAt(j))', 'cmp'),
      L('                j++;', 'cmp'),
      L('            if (j == m)', 'found'),
      L('                return i;', 'found'),
      L('        }'),
      L('        return -1;', 'fail'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const hay = (values.haystack ?? '').trim().toLowerCase();
    const needle = (values.needle ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,16}$/.test(hay) || !/^[a-z]{1,8}$/.test(needle)) return { error: 'Lowercase; haystack ≤ 16, needle ≤ 8.' };
    const chars = hay.split('');
    const m = needle.length;
    const steps: Step[] = [];
    const st = (i: number, matched: number, bad?: boolean): ArrayState => ({
      arr: chars,
      window: i + m <= hay.length ? [i, i + m - 1] : null,
      mark: {
        ...Object.fromEntries([...Array(matched)].map((_, k) => [i + k, 'good'])),
        ...(bad && matched < m ? { [i + matched]: 'dim' as const } : {}),
      },
      aggs: [{ label: 'needle', value: `"${needle}"`, c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Slide "', C(needle), '" across the haystack, one alignment at a time.'], state: st(0, 0) });
    let found = -1;
    for (let i = 0; i + m <= hay.length && steps.length < MAX_STEPS; i++) {
      let j = 0;
      while (j < m && hay[i + j] === needle[j]) j++;
      if (j === m) {
        found = i;
        steps.push({ tag: 'found', trace: ['Alignment ', B(i), ': all ', B(m), ' characters match — first occurrence at index ', C(i), '.'], state: st(i, m) });
        break;
      }
      steps.push({
        tag: 'cmp',
        trace: ['Alignment ', A(i), ': matched ', j > 0 ? B(j) : F(0), ' char(s), then \'', F(hay[i + j]), "' ≠ '", A(needle[j]), "' — slide on."],
        state: st(i, j, true),
      });
    }
    if (found === -1) steps.push({ tag: 'fail', trace: ['No alignment matched — return ', C('-1'), '.'], state: st(Math.max(0, hay.length - m), 0) });
    return { steps, result: String(found), resultDetail: found >= 0 ? `"${needle}" found at ${found}` : 'not found' };
  },
  note: 'The naive slide is O(n·m) worst case but perfectly fine at interview scale — and it is the baseline that KMP improves by never re-examining matched characters (reusing the needle\'s self-similarity structure).',
  complexity: { time: 'O(n·m)', space: 'O(1)' },
};

/* ================= 154. Zigzag Conversion ================= */
const zigzag: ProblemDef = {
  slug: 'zigzag-conversion',
  title: 'Zigzag Conversion',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/zigzag-conversion/',
  technique: 'Simulate the zigzag with a row pointer that bounces off the top and bottom.',
  widget: 'matrix',
  widgetTitle: 'Zigzag layout',
  inputs: [
    { key: 's', label: 'String', defaultValue: 'PAYPALISHIRING', wide: true },
    { key: 'rows', label: 'Rows', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string convert(string s, int numRows) {'),
      L('        if (numRows == 1) return s;', 'base'),
      L('        vector<string> rows(numRows);', 'init'),
      L('        int row = 0, dir = -1;', 'init'),
      L('        for (char c : s) {', 'loop'),
      L('            rows[row] += c;', 'place'),
      L('            if (row == 0 || row == numRows - 1)', 'bounce'),
      L('                dir = -dir;', 'bounce'),
      L('            row += dir;', 'place'),
      L('        }'),
      L('        string res;', 'read'),
      L('        for (string& r : rows) res += r;', 'read'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String convert(String s, int numRows) {'),
      L('        if (numRows == 1) return s;', 'base'),
      L('        StringBuilder[] rows = new StringBuilder[numRows];', 'init'),
      L('        for (int i = 0; i < numRows; i++) rows[i] = new StringBuilder();', 'init'),
      L('        int row = 0, dir = -1;', 'init'),
      L('        for (char c : s.toCharArray()) {', 'loop'),
      L('            rows[row].append(c);', 'place'),
      L('            if (row == 0 || row == numRows - 1)', 'bounce'),
      L('                dir = -dir;', 'bounce'),
      L('            row += dir;', 'place'),
      L('        }'),
      L('        StringBuilder res = new StringBuilder();', 'read'),
      L('        for (StringBuilder r : rows) res.append(r);', 'read'),
      L('        return res.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^[A-Za-z]{1,20}$/.test(s)) return { error: 'Letters only, ≤ 20.' };
    const numRows = Number(values.rows);
    if (!Number.isInteger(numRows) || numRows < 1 || numRows > 5) return { error: 'Rows must be 1–5.' };
    const steps: Step[] = [];
    if (numRows === 1) {
      steps.push({ tag: 'base', trace: ['One row — the zigzag is a straight line; the string is unchanged: ', C(s), '.'], state: { grid: [s.split('')], mark: {} } satisfies MatrixState });
      return { steps, result: `"${s}"` };
    }
    // Build the visual grid: each char gets its own column position.
    const grid: string[][] = [...Array(numRows)].map(() => Array(s.length).fill(''));
    let row = 0;
    let dir = -1;
    const rowsOut: string[][] = [...Array(numRows)].map(() => []);
    const view = (hlCol?: number): MatrixState => ({
      grid: grid.map((r2) => [...r2]),
      rowLabels: [...Array(numRows)].map((_, i) => i),
      mark: hlCol !== undefined ? { [`${row},${hlCol}`]: 'active' } : {},
      aggs: [{ label: 'rows so far', value: rowsOut.map((r2) => r2.join('')).join(' | '), c: 'a' }],
    });
    steps.push({ tag: 'init', trace: ['Walk the string, writing each character into the current row; bounce direction at the top and bottom rows.'], state: view() });
    for (let i = 0; i < s.length; i++) {
      grid[row][i] = s[i];
      rowsOut[row].push(s[i]);
      const bounced = row === 0 || row === numRows - 1;
      steps.push({
        tag: bounced ? 'bounce' : 'place',
        trace: ["'", A(s[i]), "' lands in row ", A(row), bounced ? ' — an edge row, so the direction flips.' : '.'],
        state: view(i),
      });
      if (bounced) dir = -dir;
      row += dir;
    }
    const result = rowsOut.map((r2) => r2.join('')).join('');
    steps.push({ tag: 'read', trace: ['Read the rows left to right, top to bottom: ', C(result), '.'], state: view() });
    return { steps, result: `"${result}"` };
  },
  note: 'No geometry needed — the zigzag is fully captured by which row each character lands in, and that row follows a simple bounce pattern. The columns exist only in the picture; the algorithm never stores them.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 155. Compare Version Numbers ================= */
const compareVersions: ProblemDef = {
  slug: 'compare-version-numbers',
  title: 'Compare Version Numbers',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/compare-version-numbers/',
  technique: 'Split on dots, compare numerically chunk by chunk; missing chunks count as 0.',
  widget: 'list',
  widgetTitle: 'Revision chunks',
  inputs: [
    { key: 'v1', label: 'Version 1', defaultValue: '1.01' },
    { key: 'v2', label: 'Version 2', defaultValue: '1.001.0' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int compareVersion(string version1, string version2) {'),
      L('        int i = 0, j = 0;', 'init'),
      L('        int n1 = version1.size(), n2 = version2.size();', 'init'),
      L('        while (i < n1 || j < n2) {', 'loop'),
      L('            long a = 0, b = 0;', 'chunk'),
      L('            while (i < n1 && version1[i] != \'.\')', 'chunk'),
      L('                a = a * 10 + (version1[i++] - \'0\');', 'chunk'),
      L('            while (j < n2 && version2[j] != \'.\')', 'chunk'),
      L('                b = b * 10 + (version2[j++] - \'0\');', 'chunk'),
      L('            if (a < b) return -1;', 'decide'),
      L('            if (a > b) return 1;', 'decide'),
      L('            i++; j++;', 'loop'),
      L('        }'),
      L('        return 0;', 'equal'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int compareVersion(String version1, String version2) {'),
      L('        String[] a = version1.split("\\\\.");', 'init'),
      L('        String[] b = version2.split("\\\\.");', 'init'),
      L('        int n = Math.max(a.length, b.length);', 'init'),
      L('        for (int k = 0; k < n; k++) {', 'loop'),
      L('            int x = k < a.length ? Integer.parseInt(a[k]) : 0;', 'chunk'),
      L('            int y = k < b.length ? Integer.parseInt(b[k]) : 0;', 'chunk'),
      L('            if (x < y) return -1;', 'decide'),
      L('            if (x > y) return 1;', 'decide'),
      L('        }'),
      L('        return 0;', 'equal'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const v1 = (values.v1 ?? '').trim();
    const v2 = (values.v2 ?? '').trim();
    if (!/^\d+(\.\d+){0,4}$/.test(v1) || !/^\d+(\.\d+){0,4}$/.test(v2)) return { error: 'Versions like "1.2.3" (digits and dots).' };
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    const n = Math.max(a.length, b.length);
    const steps: Step[] = [];
    const view = (k?: number, verdict?: 'lt' | 'gt'): ListState => ({
      chains: [
        { label: 'v1', items: [...Array(n)].map((_, i) => ({ v: a[i] ?? '0*', mark: i === k ? (verdict === 'lt' ? ('dim' as const) : ('active' as const)) : i < (k ?? -1) ? ('win' as const) : undefined })) },
        { label: 'v2', items: [...Array(n)].map((_, i) => ({ v: b[i] ?? '0*', mark: i === k ? (verdict === 'gt' ? ('dim' as const) : ('active' as const)) : i < (k ?? -1) ? ('win' as const) : undefined })) },
      ],
    });
    steps.push({ tag: 'init', trace: ['Split both versions on dots: ', A(`[${a.join(', ')}]`), ' vs ', A(`[${b.join(', ')}]`), '. Chunks compare as ', B('numbers'), ' — leading zeros vanish; missing chunks (0*) count as 0.'], state: view() });
    let result = 0;
    for (let k = 0; k < n; k++) {
      const x = a[k] ?? 0;
      const y = b[k] ?? 0;
      if (x < y) {
        result = -1;
        steps.push({ tag: 'decide', trace: ['Chunk ', A(k), ': ', F(x), ' < ', B(y), ' — version 1 is older. Return ', C('-1'), '.'], state: view(k, 'lt') });
        break;
      }
      if (x > y) {
        result = 1;
        steps.push({ tag: 'decide', trace: ['Chunk ', A(k), ': ', B(x), ' > ', F(y), ' — version 1 is newer. Return ', C('1'), '.'], state: view(k, 'gt') });
        break;
      }
      steps.push({ tag: 'chunk', trace: ['Chunk ', A(k), ': ', B(x), ' = ', B(y), ' — move to the next chunk.'], state: view(k) });
    }
    if (result === 0) steps.push({ tag: 'equal', trace: ['Every chunk tied (with missing chunks as 0) — the versions are equal. Return ', C('0'), '.'], state: view(n) });
    return { steps, result: String(result), resultDetail: result === 0 ? `${v1} == ${v2}` : result < 0 ? `${v1} < ${v2}` : `${v1} > ${v2}` };
  },
  note: 'Version strings are not decimal numbers — "1.01" equals "1.1" but "1.10" beats "1.9". Parsing each chunk as an integer erases the leading-zero trap, and padding with zeros makes "1.0" equal "1".',
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
};

/* ================= 156. Multiply Strings ================= */
const multiplyStrings: ProblemDef = {
  slug: 'multiply-strings',
  title: 'Multiply Strings',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/multiply-strings/',
  technique: 'Schoolbook multiplication into a digit array: digit i × digit j lands at position i+j+1.',
  widget: 'array',
  widgetTitle: 'Result digit array',
  inputs: [
    { key: 'num1', label: 'Number 1', defaultValue: '123' },
    { key: 'num2', label: 'Number 2', defaultValue: '456' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string multiply(string num1, string num2) {'),
      L('        int m = num1.size(), n = num2.size();', 'init'),
      L('        vector<int> res(m + n, 0);', 'init'),
      L('        for (int i = m - 1; i >= 0; i--) {', 'loop'),
      L('            for (int j = n - 1; j >= 0; j--) {', 'loop'),
      L('                int mul = (num1[i] - \'0\') * (num2[j] - \'0\');', 'mul'),
      L('                int sum = mul + res[i + j + 1];', 'mul'),
      L('                res[i + j + 1] = sum % 10;', 'placed'),
      L('                res[i + j] += sum / 10;', 'placed'),
      L('            }'),
      L('        }'),
      L('        string out;', 'strip'),
      L('        for (int d : res)', 'strip'),
      L('            if (!(out.empty() && d == 0)) out += (\'0\' + d);', 'strip'),
      L('        return out.empty() ? "0" : out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String multiply(String num1, String num2) {'),
      L('        int m = num1.length(), n = num2.length();', 'init'),
      L('        int[] res = new int[m + n];', 'init'),
      L('        for (int i = m - 1; i >= 0; i--) {', 'loop'),
      L('            for (int j = n - 1; j >= 0; j--) {', 'loop'),
      L('                int mul = (num1.charAt(i) - \'0\') * (num2.charAt(j) - \'0\');', 'mul'),
      L('                int sum = mul + res[i + j + 1];', 'mul'),
      L('                res[i + j + 1] = sum % 10;', 'placed'),
      L('                res[i + j] += sum / 10;', 'placed'),
      L('            }'),
      L('        }'),
      L('        StringBuilder out = new StringBuilder();', 'strip'),
      L('        for (int d : res)', 'strip'),
      L('            if (!(out.length() == 0 && d == 0)) out.append(d);', 'strip'),
      L('        return out.length() == 0 ? "0" : out.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const num1 = (values.num1 ?? '').trim();
    const num2 = (values.num2 ?? '').trim();
    if (!/^\d{1,5}$/.test(num1) || !/^\d{1,5}$/.test(num2)) return { error: 'Digits only, ≤ 5 each.' };
    const m = num1.length;
    const n = num2.length;
    const res = Array(m + n).fill(0);
    const steps: Step[] = [];
    const st = (hl?: number[], extra?: Partial<ArrayState>): ArrayState => ({
      arr: res.map(String),
      mark: hl ? Object.fromEntries(hl.map((i) => [i, 'active'])) : {},
      aggs: [
        { label: 'num1', value: num1, c: 'a' },
        { label: 'num2', value: num2, c: 'a' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['The product of an m-digit and n-digit number has at most ', A(m + n), ' digits — allocate exactly that array. Digit i × digit j lands at slot ', B('i+j+1'), '.'], state: st() });
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        const mul = Number(num1[i]) * Number(num2[j]);
        const sum = mul + res[i + j + 1];
        res[i + j + 1] = sum % 10;
        res[i + j] += Math.floor(sum / 10);
        if (steps.length < MAX_STEPS) {
          steps.push({
            tag: 'mul',
            tag2: 'placed',
            trace: [A(num1[i]), ' × ', A(num2[j]), ' = ', A(mul), ' + existing ', A(sum - mul), ' → digit ', B(sum % 10), ' at slot ', A(i + j + 1), ', carry ', A(Math.floor(sum / 10)), ' to slot ', A(i + j), '.'],
            state: st([i + j, i + j + 1]),
          });
        }
      }
    }
    let out = res.join('').replace(/^0+/, '');
    if (out === '') out = '0';
    steps.push({ tag: 'strip', trace: ['Strip leading zeros: ', C(out), '.'], state: st(undefined, { mark: Object.fromEntries(res.map((_, i) => [i, i < res.length - out.length ? 'dim' : 'final'])) }) });
    return { steps, result: out, resultDetail: `${num1} × ${num2}` };
  },
  note: 'The whole trick is the addressing formula: digits at positions i and j (from the left) multiply into positions i+j+1 (units) and i+j (carry) — schoolbook multiplication becomes pure index arithmetic, no BigInteger needed.',
  complexity: { time: 'O(m·n)', space: 'O(m+n)' },
};

/* ================= 157. Basic Calculator ================= */
const basicCalculator: ProblemDef = {
  slug: 'basic-calculator',
  title: 'Basic Calculator',
  category: 'Strings',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/basic-calculator/',
  technique: 'One pass with a sign; parentheses push the outer context onto a stack.',
  widget: 'stack',
  widgetTitle: 'Expression & saved contexts',
  inputs: [{ key: 's', label: 'Expression (+, −, parentheses)', defaultValue: '(1+(4+5+2)-3)+(6+8)', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int calculate(string s) {'),
      L('        stack<int> saved;', 'init'),
      L('        int result = 0, sign = 1, num = 0;', 'init'),
      L('        for (char c : s) {', 'loop'),
      L('            if (isdigit(c))', 'digit'),
      L('                num = num * 10 + (c - \'0\');', 'digit'),
      L('            else if (c == \'+\' || c == \'-\') {', 'op'),
      L('                result += sign * num;', 'op'),
      L('                num = 0;', 'op'),
      L('                sign = (c == \'+\') ? 1 : -1;', 'op'),
      L('            } else if (c == \'(\') {', 'open'),
      L('                saved.push(result); saved.push(sign);', 'open'),
      L('                result = 0; sign = 1;', 'open'),
      L('            } else if (c == \')\') {', 'closep'),
      L('                result += sign * num; num = 0;', 'closep'),
      L('                int outerSign = saved.top(); saved.pop();', 'closep'),
      L('                int outerResult = saved.top(); saved.pop();', 'closep'),
      L('                result = outerResult + outerSign * result;', 'closep'),
      L('            }'),
      L('        }'),
      L('        return result + sign * num;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int calculate(String s) {'),
      L('        Deque<Integer> saved = new ArrayDeque<>();', 'init'),
      L('        int result = 0, sign = 1, num = 0;', 'init'),
      L('        for (char c : s.toCharArray()) {', 'loop'),
      L('            if (Character.isDigit(c))', 'digit'),
      L('                num = num * 10 + (c - \'0\');', 'digit'),
      L('            else if (c == \'+\' || c == \'-\') {', 'op'),
      L('                result += sign * num;', 'op'),
      L('                num = 0;', 'op'),
      L('                sign = (c == \'+\') ? 1 : -1;', 'op'),
      L('            } else if (c == \'(\') {', 'open'),
      L('                saved.push(result); saved.push(sign);', 'open'),
      L('                result = 0; sign = 1;', 'open'),
      L('            } else if (c == \')\') {', 'closep'),
      L('                result += sign * num; num = 0;', 'closep'),
      L('                int outerSign = saved.pop();', 'closep'),
      L('                int outerResult = saved.pop();', 'closep'),
      L('                result = outerResult + outerSign * result;', 'closep'),
      L('            }'),
      L('        }'),
      L('        return result + sign * num;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').replace(/\s/g, '');
    if (!/^[\d+\-()]{1,24}$/.test(s)) return { error: 'Digits, + − and parentheses only, ≤ 24 chars.' };
    const chars = s.split('');
    const steps: Step[] = [];
    const saved: [number, number][] = []; // [result, sign]
    let result = 0;
    let sign = 1;
    let num = 0;
    const view = (i: number): StackState => ({
      array: { arr: chars, ptrs: i >= 0 && i < chars.length ? [{ name: 'c', i, c: 'a' }] : [] },
      stack: saved.map(([r, sg]) => ({ v: `${r} ${sg > 0 ? '+' : '−'}(…)` })),
      stackLabel: 'Outer contexts',
      aggs: [
        { label: 'result', value: String(result), c: 'b' },
        { label: 'sign', value: sign > 0 ? '+' : '−', c: 'a' },
        { label: 'num', value: String(num), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Only + and − here, so no precedence — just a running total, a pending sign, and a stack for parentheses.'], state: view(-1) });
    for (let i = 0; i < chars.length && steps.length < MAX_STEPS; i++) {
      const c = chars[i];
      if (/\d/.test(c)) {
        num = num * 10 + Number(c);
        steps.push({ tag: 'digit', trace: ["Digit '", A(c), "' — building num = ", A(num), '.'], state: view(i) });
      } else if (c === '+' || c === '-') {
        result += sign * num;
        num = 0;
        sign = c === '+' ? 1 : -1;
        steps.push({ tag: 'op', trace: ["'", A(c), "' — commit the pending number (result = ", B(result), '), remember the new sign.'], state: view(i) });
      } else if (c === '(') {
        saved.push([result, sign]);
        result = 0;
        sign = 1;
        steps.push({ tag: 'open', trace: ["'", A('('), "' — save the outer (result, sign) and start fresh inside."], state: view(i) });
      } else {
        result += sign * num;
        num = 0;
        if (saved.length === 0) return { error: 'Unbalanced ")".' };
        const [outerResult, outerSign] = saved.pop()!;
        result = outerResult + outerSign * result;
        sign = 1;
        steps.push({ tag: 'closep', trace: ["'", A(')'), "' — the inner value folds into the outer context: result = ", B(result), '.'], state: view(i) });
      }
    }
    result += sign * num;
    steps.push({ tag: 'ret', trace: ['Final commit — the expression evaluates to ', C(result), '.'], state: view(chars.length) });
    return { steps, result: String(result) };
  },
  note: 'Without × and ÷ there is no precedence to resolve — the only nonlocal structure is parentheses, and a stack of (result, sign) pairs handles them exactly like function calls: "(" saves the frame, ")" returns into it.',
  complexity: { time: 'O(n)', space: 'O(nesting depth)' },
};

/* ================= 158. Simplify Path ================= */
const simplifyPath: ProblemDef = {
  slug: 'simplify-path',
  title: 'Simplify Path',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/simplify-path/',
  technique: 'Split on "/", push real names, pop on "..", ignore "." and empties.',
  widget: 'stack',
  widgetTitle: 'Components & directory stack',
  inputs: [{ key: 'path', label: 'Unix path', defaultValue: '/a/./b/../../c/', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string simplifyPath(string path) {'),
      L('        vector<string> stack;', 'init'),
      L('        stringstream ss(path);', 'init'),
      L('        string part;', 'init'),
      L('        while (getline(ss, part, \'/\')) {', 'loop'),
      L('            if (part.empty() || part == ".")', 'skip'),
      L('                continue;', 'skip'),
      L('            else if (part == "..") {', 'up'),
      L('                if (!stack.empty()) stack.pop_back();', 'up'),
      L('            } else'),
      L('                stack.push_back(part);', 'push'),
      L('        }'),
      L('        string res;', 'ret'),
      L('        for (string& d : stack) res += "/" + d;', 'ret'),
      L('        return res.empty() ? "/" : res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String simplifyPath(String path) {'),
      L('        Deque<String> stack = new ArrayDeque<>();', 'init'),
      L('        for (String part : path.split("/")) {', 'loop'),
      L('            if (part.isEmpty() || part.equals("."))', 'skip'),
      L('                continue;', 'skip'),
      L('            else if (part.equals("..")) {', 'up'),
      L('                if (!stack.isEmpty()) stack.pollLast();', 'up'),
      L('            } else'),
      L('                stack.addLast(part);', 'push'),
      L('        }'),
      L('        return "/" + String.join("/", stack);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const path = (values.path ?? '').trim();
    if (!/^\/[\w./-]{0,30}$/.test(path)) return { error: 'Path must start with "/" (letters, dots, dashes; ≤ 31 chars).' };
    const parts = path.split('/');
    const steps: Step[] = [];
    const stack: string[] = [];
    const view = (i: number): StackState => ({
      array: { arr: parts.map((p) => (p === '' ? '∅' : p)), ptrs: i >= 0 && i < parts.length ? [{ name: 'p', i, c: 'a' }] : [] },
      stack: stack.map((v) => ({ v })),
      stackLabel: 'Directories',
    });
    steps.push({ tag: 'init', trace: ['Split on "/" — each component is either noise (', F('∅'), ', ', F('.'), '), a climb (', A('..'), '), or a real directory.'], state: view(-1) });
    parts.forEach((part, i) => {
      if (part === '' || part === '.') {
        steps.push({ tag: 'skip', trace: ['"', F(part === '' ? '∅' : '.'), '" changes nothing — skip.'], state: view(i) });
      } else if (part === '..') {
        if (stack.length > 0) {
          const popped = stack.pop()!;
          steps.push({ tag: 'up', trace: ['"..": climb out of "', F(popped), '" — pop it.'], state: view(i) });
        } else {
          steps.push({ tag: 'up', trace: ['".." at the root — there is nothing above ', A('/'), '; ignore.'], state: view(i) });
        }
      } else {
        stack.push(part);
        steps.push({ tag: 'push', trace: ['Enter directory "', B(part), '" — push it.'], state: view(i) });
      }
    });
    const result = '/' + stack.join('/');
    steps.push({ tag: 'ret', trace: ['Join the surviving stack under the root: ', C(result), '.'], state: view(parts.length) });
    return { steps, result: result, resultDetail: 'canonical path' };
  },
  note: '".." undoes the most recent directory entered — LIFO by definition, which is why a stack models paths perfectly. The edge cases (".." at root, trailing slash, "//") all collapse into "empty component" or "pop on empty" rules.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const strings = [longestCommonPrefix, atoi, strStr, zigzag, compareVersions, multiplyStrings, basicCalculator, simplifyPath];
