// Code Catalyst — Practice Set 2: arrays, strings and hashing.
import type { ArrayState, MatrixState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, fmt, parseMatrix, parseStrList, parseWord } from './util';

const mapView = (m: Map<string | number, number>, hl?: string | number): StackState['stack'] =>
  [...m.entries()].map(([k, v]) => ({ v: `${k} → ${v}`, c: k === hl ? 'a' : undefined }));

/* ================= Intersection of Two Arrays ================= */
const intersection: ProblemDef = {
  slug: 'intersection-of-two-arrays',
  title: 'Intersection of Two Arrays',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/intersection-of-two-arrays/',
  technique: 'Put nums1 in a set, then keep each nums2 value found in it — erasing it so it is reported once.',
  widget: 'stack',
  widgetTitle: 'nums2 against set(nums1)',
  inputs: [
    { key: 'nums1', label: 'nums1', defaultValue: '4, 9, 5', wide: true },
    { key: 'nums2', label: 'nums2', defaultValue: '9, 4, 9, 8, 4', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {'),
      L('        unordered_set<int> seen(nums1.begin(), nums1.end());', 'build'),
      L('        vector<int> res;'),
      L('        for (int x : nums2) {'),
      L('            if (seen.erase(x)) res.push_back(x);', 'hit', 'miss'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] intersection(int[] nums1, int[] nums2) {'),
      L('        Set<Integer> seen = new HashSet<>();', 'build'),
      L('        for (int x : nums1) seen.add(x);', 'build'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        for (int x : nums2) {'),
      L('            if (seen.remove(x)) res.add(x);', 'hit', 'miss'),
      L('        }'),
      L('        return res.stream().mapToInt(i -> i).toArray();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums1, { maxLen: 12 });
    if (typeof a === 'string') return { error: a };
    const b = parseIntArray(values.nums2, { maxLen: 12 });
    if (typeof b === 'string') return { error: b };
    const seen = new Set(a);
    const res: number[] = [];
    const out: Step[] = [];
    const st = (mark: ArrayState['mark'], i?: number): StackState => ({
      array: arr(b, { mark, ptrs: i === undefined ? [] : [{ name: 'x', i, c: 'a' }] }),
      stack: [...seen].map((v) => ({ v })),
      stackLabel: 'set(nums1)',
      aggs: [ag('result', fmt(res), 'c')],
    });
    out.push({ tag: 'build', trace: ['Load nums1 into a set: ', A(fmt([...seen])), '. Lookups are now O(1).'], state: st({}) });
    const mark: NonNullable<ArrayState['mark']> = {};
    b.forEach((x, i) => {
      if (seen.delete(x)) {
        res.push(x);
        mark[i] = 'good';
        out.push({ tag: 'hit', trace: [A(x), ' is in the set — add it to the result and erase it so a repeat is not added again.'], state: st({ ...mark }, i) });
      } else {
        mark[i] = 'dim';
        out.push({ tag: 'miss', trace: [F(x), ' is not in the set (never there, or already used) — skip.'], state: st({ ...mark }, i) });
      }
    });
    out.push({ tag: 'ret', trace: ['Intersection: ', C(fmt(res)), '.'], state: st(mark) });
    return { steps: out, result: fmt(res) };
  },
  note: 'A set answers "is x in nums1?" in O(1). Erasing on a hit is what makes each common value appear only once in the output, without a second set.',
  complexity: { time: 'O(n + m)', space: 'O(n)' },
};

/* ================= Intersection of Two Arrays II ================= */
const intersectionII: ProblemDef = {
  slug: 'intersection-of-two-arrays-ii',
  title: 'Intersection of Two Arrays II',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/intersection-of-two-arrays-ii/',
  technique: 'Count nums1 in a hash map; for each nums2 value with a positive count, output it and decrement.',
  widget: 'stack',
  widgetTitle: 'nums2 against counts of nums1',
  inputs: [
    { key: 'nums1', label: 'nums1', defaultValue: '1, 2, 2, 1', wide: true },
    { key: 'nums2', label: 'nums2', defaultValue: '2, 2', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {'),
      L('        unordered_map<int, int> cnt;'),
      L('        for (int x : nums1) cnt[x]++;', 'build'),
      L('        vector<int> res;'),
      L('        for (int x : nums2) {'),
      L('            if (cnt[x] > 0) {', 'hit', 'miss'),
      L('                res.push_back(x); cnt[x]--;', 'hit'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] intersect(int[] nums1, int[] nums2) {'),
      L('        Map<Integer, Integer> cnt = new HashMap<>();'),
      L('        for (int x : nums1) cnt.merge(x, 1, Integer::sum);', 'build'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        for (int x : nums2) {'),
      L('            if (cnt.getOrDefault(x, 0) > 0) {', 'hit', 'miss'),
      L('                res.add(x); cnt.merge(x, -1, Integer::sum);', 'hit'),
      L('            }'),
      L('        }'),
      L('        return res.stream().mapToInt(i -> i).toArray();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums1, { maxLen: 12 });
    if (typeof a === 'string') return { error: a };
    const b = parseIntArray(values.nums2, { maxLen: 12 });
    if (typeof b === 'string') return { error: b };
    const cnt = new Map<number, number>();
    for (const x of a) cnt.set(x, (cnt.get(x) ?? 0) + 1);
    const res: number[] = [];
    const out: Step[] = [];
    const st = (mark: ArrayState['mark'], i?: number, hl?: number): StackState => ({
      array: arr(b, { mark, ptrs: i === undefined ? [] : [{ name: 'x', i, c: 'a' }] }),
      stack: mapView(cnt, hl),
      stackLabel: 'count in nums1',
      aggs: [ag('result', fmt(res), 'c')],
    });
    out.push({ tag: 'build', trace: ['Count how often each value appears in nums1.'], state: st({}) });
    const mark: NonNullable<ArrayState['mark']> = {};
    b.forEach((x, i) => {
      const c = cnt.get(x) ?? 0;
      if (c > 0) {
        res.push(x);
        cnt.set(x, c - 1);
        mark[i] = 'good';
        out.push({ tag: 'hit', trace: [A(x), ' still has ', B(c), ' unused copies in nums1 — take one. Count drops to ', B(c - 1), '.'], state: st({ ...mark }, i, x) });
      } else {
        mark[i] = 'dim';
        out.push({ tag: 'miss', trace: ['No copies of ', F(x), ' left in nums1 — skip.'], state: st({ ...mark }, i, x) });
      }
    });
    out.push({ tag: 'ret', trace: ['Each common value appears as many times as it does in both: ', C(fmt(res)), '.'], state: st(mark) });
    return { steps: out, result: fmt(res) };
  },
  note: 'A value can be matched min(count in nums1, count in nums2) times. Decrementing the nums1 count on every match enforces exactly that limit as nums2 is scanned.',
  complexity: { time: 'O(n + m)', space: 'O(n)' },
};

/* ================= Ransom Note ================= */
const ransomNote: ProblemDef = {
  slug: 'ransom-note',
  title: 'Ransom Note',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/ransom-note/',
  technique: 'Count magazine letters, then spend one count per note letter; running out means false.',
  widget: 'stack',
  widgetTitle: 'ransomNote vs magazine letter counts',
  inputs: [
    { key: 'ransomNote', label: 'ransomNote', defaultValue: 'aab' },
    { key: 'magazine', label: 'magazine', defaultValue: 'baa' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool canConstruct(string ransomNote, string magazine) {'),
      L('        int cnt[26] = {0};'),
      L('        for (char c : magazine) cnt[c - \'a\']++;', 'build'),
      L('        for (char c : ransomNote) {'),
      L('            if (--cnt[c - \'a\'] < 0) return false;', 'use', 'fail'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean canConstruct(String ransomNote, String magazine) {'),
      L('        int[] cnt = new int[26];'),
      L('        for (char c : magazine.toCharArray()) cnt[c - \'a\']++;', 'build'),
      L('        for (char c : ransomNote.toCharArray()) {'),
      L('            if (--cnt[c - \'a\'] < 0) return false;', 'use', 'fail'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const note = parseWord(values.ransomNote, 'ransomNote', { max: 14, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof note !== 'string') return note;
    const mag = parseWord(values.magazine, 'magazine', { max: 18, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof mag !== 'string') return mag;
    const cnt = new Map<string, number>();
    for (const c of [...mag].sort()) cnt.set(c, (cnt.get(c) ?? 0) + 1);
    const nc = note.split('');
    const out: Step[] = [];
    const st = (mark: ArrayState['mark'], hl?: string): StackState => ({ array: arr(nc, { mark }), stack: mapView(cnt, hl), stackLabel: 'magazine letters left' });
    out.push({ tag: 'build', trace: ['Count every letter the magazine offers.'], state: st({}) });
    const mark: NonNullable<ArrayState['mark']> = {};
    for (let i = 0; i < nc.length; i++) {
      const c = nc[i];
      const left = (cnt.get(c) ?? 0) - 1;
      cnt.set(c, left);
      if (left < 0) {
        mark[i] = 'dim';
        out.push({ tag: 'fail', trace: ['The note needs another ', F(`'${c}'`), ' but the magazine has none left → ', C('false'), '.'], state: st({ ...mark }, c) });
        return { steps: out, result: 'false' };
      }
      mark[i] = 'good';
      out.push({ tag: 'use', trace: ['Cut out one ', A(`'${c}'`), ' — ', B(left), ' left.'], state: st({ ...mark }, c) });
    }
    out.push({ tag: 'ret', trace: ['Every letter of the note was available → ', C('true'), '.'], state: st(mark) });
    return { steps: out, result: 'true' };
  },
  note: 'Order does not matter, only how many of each letter you have. A 26-slot count array turns the question into "does any count go negative?".',
  complexity: { time: 'O(n + m)', space: 'O(1) (26 letters)' },
};

/* ================= First Unique Character in a String ================= */
const firstUniqChar: ProblemDef = {
  slug: 'first-unique-character-in-a-string',
  title: 'First Unique Character in a String',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/first-unique-character-in-a-string/',
  technique: 'Pass 1 counts every letter; pass 2 returns the first index whose letter has count 1.',
  widget: 'stack',
  widgetTitle: 's with letter counts',
  inputs: [{ key: 's', label: 's', defaultValue: 'loveleetcode' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int firstUniqChar(string s) {'),
      L('        int cnt[26] = {0};'),
      L('        for (char c : s) cnt[c - \'a\']++;', 'count'),
      L('        for (int i = 0; i < s.size(); i++)'),
      L('            if (cnt[s[i] - \'a\'] == 1) return i;', 'check', 'found'),
      L('        return -1;', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int firstUniqChar(String s) {'),
      L('        int[] cnt = new int[26];'),
      L('        for (char c : s.toCharArray()) cnt[c - \'a\']++;', 'count'),
      L('        for (int i = 0; i < s.length(); i++)'),
      L('            if (cnt[s.charAt(i) - \'a\'] == 1) return i;', 'check', 'found'),
      L('        return -1;', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 18, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const cs = s.split('');
    const cnt = new Map<string, number>();
    for (const c of cs) cnt.set(c, (cnt.get(c) ?? 0) + 1);
    const out: Step[] = [];
    const st = (mark: ArrayState['mark'], i?: number, hl?: string): StackState => ({
      array: arr(cs, { mark, ptrs: i === undefined ? [] : [{ name: 'i', i, c: 'a' }] }),
      stack: mapView(cnt, hl),
      stackLabel: 'letter counts',
    });
    out.push({ tag: 'count', trace: ['First pass: count every letter.'], state: st({}) });
    const mark: NonNullable<ArrayState['mark']> = {};
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (cnt.get(c) === 1) {
        mark[i] = 'final';
        out.push({ tag: 'found', trace: [A(`'${c}'`), ' appears exactly once — the first unique char is at index ', C(i), '.'], state: st({ ...mark }, i, c) });
        return { steps: out, result: String(i) };
      }
      mark[i] = 'dim';
      out.push({ tag: 'check', trace: [F(`'${c}'`), ' appears ', F(cnt.get(c)), ' times — not unique.'], state: st({ ...mark }, i, c) });
    }
    out.push({ tag: 'none', trace: ['Every letter repeats → ', C(-1), '.'], state: st(mark) });
    return { steps: out, result: '-1' };
  },
  note: 'You cannot know whether a letter is unique until you have seen the whole string, so one counting pass is unavoidable. The second pass in original order is what makes it the first unique one.',
  complexity: { time: 'O(n)', space: 'O(1) (26 letters)' },
};

/* ================= Equal Row and Column Pairs ================= */
const equalPairs: ProblemDef = {
  slug: 'equal-row-and-column-pairs',
  title: 'Equal Row and Column Pairs',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/equal-row-and-column-pairs/',
  technique: 'Hash every row as a key with its count, then look up each column as a key.',
  widget: 'matrix',
  widgetTitle: 'grid',
  inputs: [{ key: 'grid', label: 'grid', defaultValue: '[[3,1,2,2],[1,4,4,5],[2,4,2,2],[2,4,2,2]]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int equalPairs(vector<vector<int>>& grid) {'),
      L('        int n = grid.size(), ans = 0;'),
      L('        map<vector<int>, int> rows;'),
      L('        for (auto& r : grid) rows[r]++;', 'row'),
      L('        for (int c = 0; c < n; c++) {'),
      L('            vector<int> col(n);', 'col'),
      L('            for (int r = 0; r < n; r++) col[r] = grid[r][c];', 'col'),
      L('            ans += rows.count(col) ? rows[col] : 0;', 'col'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int equalPairs(int[][] grid) {'),
      L('        int n = grid.length, ans = 0;'),
      L('        Map<String, Integer> rows = new HashMap<>();'),
      L('        for (int[] r : grid) rows.merge(Arrays.toString(r), 1, Integer::sum);', 'row'),
      L('        for (int c = 0; c < n; c++) {'),
      L('            int[] col = new int[n];', 'col'),
      L('            for (int r = 0; r < n; r++) col[r] = grid[r][c];', 'col'),
      L('            ans += rows.getOrDefault(Arrays.toString(col), 0);', 'col'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseMatrix(values.grid, 'grid', { maxR: 6, maxC: 6, rect: true });
    if ('error' in g) return g;
    const n = g.length;
    if (g[0].length !== n) return { error: 'grid must be square (n × n).' };
    const rows = new Map<string, number>();
    const out: Step[] = [];
    let ans = 0;
    const st = (mark: MatrixState['mark']): MatrixState => ({ grid: g, rowLabels: g.map((_, i) => `r${i}`), colLabels: g.map((_, j) => `c${j}`), mark, aggs: [ag('pairs', ans, 'c')] });
    for (let r = 0; r < n; r++) {
      const k = g[r].join(',');
      rows.set(k, (rows.get(k) ?? 0) + 1);
      const mark: MatrixState['mark'] = {};
      for (let c = 0; c < n; c++) mark[`${r},${c}`] = 'active';
      out.push({ tag: 'row', trace: ['Store row ', A(r), ' = [', A(k), '] in the map (seen ', B(rows.get(k)), '×).'], state: st(mark) });
    }
    for (let c = 0; c < n; c++) {
      const k = g.map((row) => row[c]).join(',');
      const hits = rows.get(k) ?? 0;
      ans += hits;
      const mark: MatrixState['mark'] = {};
      for (let r = 0; r < n; r++) mark[`${r},${c}`] = hits ? 'good' : 'dim';
      g.forEach((row, r) => { if (hits && row.join(',') === k) for (let cc = 0; cc < n; cc++) if (cc !== c) mark[`${r},${cc}`] = 'win'; });
      out.push({ tag: 'col', trace: hits ? ['Column ', A(c), ' = [', A(k), '] equals ', B(hits), ' row(s). Pairs so far: ', C(ans), '.'] : ['Column ', A(c), ' = [', F(k), '] matches no row.'], state: st(mark) });
    }
    out.push({ tag: 'ret', trace: ['Total equal row/column pairs: ', C(ans), '.'], state: st({}) });
    return { steps: out, result: String(ans) };
  },
  note: 'Comparing every row with every column is O(n³). Turning each row into a hashable key means each column needs one lookup, and the stored count handles duplicate rows automatically.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
};

/* ================= Count Nice Pairs in an Array ================= */
const rev = (x: number) => Number(String(x).split('').reverse().join(''));
const countNicePairs: ProblemDef = {
  slug: 'count-nice-pairs-in-an-array',
  title: 'Count Nice Pairs in an Array',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/count-nice-pairs-in-an-array/',
  technique: 'Rewrite x + rev(y) = y + rev(x) as x − rev(x) = y − rev(y), then count equal keys with a hash map.',
  widget: 'stack',
  widgetTitle: 'nums with key = x − rev(x)',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '13, 10, 35, 24, 76', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countNicePairs(vector<int>& nums) {'),
      L('        const int MOD = 1e9 + 7;'),
      L('        unordered_map<int, int> seen;'),
      L('        long ans = 0;'),
      L('        for (int x : nums) {'),
      L('            int r = 0, t = x;', 'key'),
      L('            while (t) { r = r * 10 + t % 10; t /= 10; }', 'key'),
      L('            int key = x - r;', 'key'),
      L('            ans = (ans + seen[key]) % MOD;', 'pair'),
      L('            seen[key]++;', 'pair'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countNicePairs(int[] nums) {'),
      L('        final int MOD = 1_000_000_007;'),
      L('        Map<Integer, Integer> seen = new HashMap<>();'),
      L('        long ans = 0;'),
      L('        for (int x : nums) {'),
      L('            int r = 0, t = x;', 'key'),
      L('            while (t > 0) { r = r * 10 + t % 10; t /= 10; }', 'key'),
      L('            int key = x - r;', 'key'),
      L('            ans = (ans + seen.getOrDefault(key, 0)) % MOD;', 'pair'),
      L('            seen.merge(key, 1, Integer::sum);', 'pair'),
      L('        }'),
      L('        return (int) ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 12, min: 0 });
    if (typeof a === 'string') return { error: a };
    const seen = new Map<number, number>();
    let ans = 0;
    const out: Step[] = [];
    const st = (i: number, hl?: number): StackState => ({
      array: arr(a, { ptrs: [{ name: 'x', i, c: 'a' }], mark: { [i]: 'active' } }),
      stack: mapView(seen, hl),
      stackLabel: 'key → times seen',
      aggs: [ag('nice pairs', ans, 'c')],
    });
    a.forEach((x, i) => {
      const r = rev(x);
      const key = x - r;
      out.push({ tag: 'key', trace: ['rev(', A(x), ') = ', A(r), ', so key = ', A(x), ' − ', A(r), ' = ', B(key), '.'], state: st(i, key) });
      const c = seen.get(key) ?? 0;
      ans = (ans + c) % 1000000007;
      seen.set(key, c + 1);
      out.push({ tag: 'pair', trace: c ? ['Key ', B(key), ' was seen ', B(c), ' time(s) before — each one pairs with this x. Total: ', C(ans), '.'] : ['Key ', B(key), ' is new — no pairs yet. Remember it.'], state: st(i, key) });
    });
    out.push({ tag: 'ret', trace: ['Nice pairs: ', C(ans), '.'], state: { array: arr(a), stack: mapView(seen), stackLabel: 'key → times seen', aggs: [ag('nice pairs', ans, 'c')] } as StackState });
    return { steps: out, result: String(ans) };
  },
  note: 'The condition mixes i and j on both sides; moving terms around separates them into f(i) = f(j) with f(x) = x − rev(x). Counting pairs with equal keys is then the classic "add how many times this key was seen before".',
  complexity: { time: 'O(n · digits)', space: 'O(n)' },
};

/* ================= 4Sum II ================= */
const fourSumII: ProblemDef = {
  slug: '4sum-ii',
  title: '4Sum II',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/4sum-ii/',
  technique: 'Meet in the middle: count every a + b in a map, then for every c + d look up −(c + d).',
  widget: 'matrix',
  widgetTitle: 'All a + b sums, then c + d lookups',
  inputs: [
    { key: 'nums1', label: 'nums1', defaultValue: '1, 2' },
    { key: 'nums2', label: 'nums2', defaultValue: '-2, -1' },
    { key: 'nums3', label: 'nums3', defaultValue: '-1, 2' },
    { key: 'nums4', label: 'nums4', defaultValue: '0, 2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int fourSumCount(vector<int>& A, vector<int>& B, vector<int>& C, vector<int>& D) {'),
      L('        unordered_map<int, int> ab;'),
      L('        for (int a : A) for (int b : B) ab[a + b]++;', 'ab'),
      L('        int ans = 0;'),
      L('        for (int c : C) for (int d : D) {'),
      L('            auto it = ab.find(-(c + d));', 'cd'),
      L('            if (it != ab.end()) ans += it->second;', 'cd'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int fourSumCount(int[] A, int[] B, int[] C, int[] D) {'),
      L('        Map<Integer, Integer> ab = new HashMap<>();'),
      L('        for (int a : A) for (int b : B) ab.merge(a + b, 1, Integer::sum);', 'ab'),
      L('        int ans = 0;'),
      L('        for (int c : C) for (int d : D)'),
      L('            ans += ab.getOrDefault(-(c + d), 0);', 'cd'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const lists: number[][] = [];
    for (const k of ['nums1', 'nums2', 'nums3', 'nums4']) {
      const p = parseIntArray(values[k], { maxLen: 5 });
      if (typeof p === 'string') return { error: `${k}: ${p}` };
      lists.push(p);
    }
    const [A1, B1, C1, D1] = lists;
    if (new Set(lists.map((l) => l.length)).size !== 1) return { error: 'All four arrays must have the same length.' };
    const ab = new Map<number, number>();
    const out: Step[] = [];
    const abGrid = A1.map((a) => B1.map((b) => a + b));
    const cdGrid = C1.map((c) => D1.map((d) => c + d));
    let ans = 0;
    const abState = (mark: MatrixState['mark']): MatrixState => ({ grid: abGrid, rowLabels: A1.map((a) => `a=${a}`), colLabels: B1.map((b) => `b=${b}`), mark, aggs: [ag('a+b counts', [...ab.entries()].map(([k, v]) => `${k}:${v}`).join(' '), 'b')] });
    A1.forEach((a, i) => {
      B1.forEach((b, j) => ab.set(a + b, (ab.get(a + b) ?? 0) + 1));
      const mark: MatrixState['mark'] = {};
      B1.forEach((_, j) => (mark[`${i},${j}`] = 'active'));
      out.push({ tag: 'ab', trace: ['Record every a + b with a = ', A(a), ': ', A(abGrid[i].join(', ')), '.'], state: abState(mark) });
    });
    const cdState = (mark: MatrixState['mark']): MatrixState => ({ grid: cdGrid, rowLabels: C1.map((c) => `c=${c}`), colLabels: D1.map((d) => `d=${d}`), mark, aggs: [ag('tuples', ans, 'c')] });
    C1.forEach((c, i) => D1.forEach((d, j) => {
      const need = -(c + d);
      const hits = ab.get(need) ?? 0;
      ans += hits;
      out.push({ tag: 'cd', trace: hits ? ['c + d = ', A(c + d), ', so we need a + b = ', B(need), ' — it occurred ', B(hits), ' time(s). Total ', C(ans), '.'] : ['c + d = ', A(c + d), ', need a + b = ', F(need), ' — never occurred.'], state: cdState({ [`${i},${j}`]: hits ? 'good' : 'dim' }) });
    }));
    out.push({ tag: 'ret', trace: ['Tuples summing to zero: ', C(ans), '.'], state: cdState({}) });
    return { steps: out, result: String(ans) };
  },
  note: 'Four nested loops are O(n⁴). Splitting the four arrays into two halves and matching sums through a hash map brings it down to O(n²) — the "meet in the middle" idea.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
};

/* ================= Determine if Two Strings Are Close ================= */
const closeStrings: ProblemDef = {
  slug: 'determine-if-two-strings-are-close',
  title: 'Determine if Two Strings Are Close',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/determine-if-two-strings-are-close/',
  technique: 'Close iff both use the same set of letters and the same multiset of letter frequencies.',
  widget: 'matrix',
  widgetTitle: 'Letter counts',
  inputs: [
    { key: 'word1', label: 'word1', defaultValue: 'cabbba' },
    { key: 'word2', label: 'word2', defaultValue: 'abbccc' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool closeStrings(string word1, string word2) {'),
      L('        if (word1.size() != word2.size()) return false;', 'len'),
      L('        vector<int> f1(26), f2(26);'),
      L('        for (char c : word1) f1[c - \'a\']++;', 'count'),
      L('        for (char c : word2) f2[c - \'a\']++;', 'count'),
      L('        for (int i = 0; i < 26; i++)'),
      L('            if ((f1[i] == 0) != (f2[i] == 0)) return false;', 'set'),
      L('        sort(f1.begin(), f1.end()); sort(f2.begin(), f2.end());', 'freq'),
      L('        return f1 == f2;', 'freq'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean closeStrings(String word1, String word2) {'),
      L('        if (word1.length() != word2.length()) return false;', 'len'),
      L('        int[] f1 = new int[26], f2 = new int[26];'),
      L('        for (char c : word1.toCharArray()) f1[c - \'a\']++;', 'count'),
      L('        for (char c : word2.toCharArray()) f2[c - \'a\']++;', 'count'),
      L('        for (int i = 0; i < 26; i++)'),
      L('            if ((f1[i] == 0) != (f2[i] == 0)) return false;', 'set'),
      L('        Arrays.sort(f1); Arrays.sort(f2);', 'freq'),
      L('        return Arrays.equals(f1, f2);', 'freq'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const w1 = parseWord(values.word1, 'word1', { max: 20, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof w1 !== 'string') return w1;
    const w2 = parseWord(values.word2, 'word2', { max: 20, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof w2 !== 'string') return w2;
    const letters = [...new Set([...w1, ...w2])].sort();
    const cnt = (w: string, c: string) => [...w].filter((x) => x === c).length;
    const f1 = letters.map((c) => cnt(w1, c));
    const f2 = letters.map((c) => cnt(w2, c));
    const st = (mark: MatrixState['mark'], sorted = false): MatrixState => ({
      grid: sorted ? [[...f1].sort((a, b) => a - b), [...f2].sort((a, b) => a - b)] : [f1, f2],
      rowLabels: ['word1', 'word2'],
      colLabels: sorted ? letters.map((_, i) => `#${i + 1}`) : letters,
      mark,
    });
    const out: Step[] = [];
    if (w1.length !== w2.length) {
      out.push({ tag: 'len', trace: ['Lengths differ (', F(w1.length), ' vs ', F(w2.length), '). Neither operation changes length → ', C('false'), '.'], state: st({}) });
      return { steps: out, result: 'false' };
    }
    out.push({ tag: 'len', trace: ['Same length ', A(w1.length), ' — keep checking.'], state: st({}) });
    out.push({ tag: 'count', trace: ['Count each letter in both words.'], state: st({}) });
    for (let i = 0; i < letters.length; i++) {
      if ((f1[i] === 0) !== (f2[i] === 0)) {
        out.push({ tag: 'set', trace: ['Letter ', F(`'${letters[i]}'`), ' is used in only one word. No operation can create a new letter → ', C('false'), '.'], state: st({ [`0,${i}`]: 'dim', [`1,${i}`]: 'dim' }) });
        return { steps: out, result: 'false' };
      }
    }
    const allGood: MatrixState['mark'] = {};
    letters.forEach((_, i) => { allGood[`0,${i}`] = 'good'; allGood[`1,${i}`] = 'good'; });
    out.push({ tag: 'set', trace: ['Both words use exactly the same letters: ', B(letters.join(' ')), '.'], state: st(allGood) });
    const s1 = [...f1].sort((a, b) => a - b);
    const s2 = [...f2].sort((a, b) => a - b);
    const ok = s1.join() === s2.join();
    const mark: MatrixState['mark'] = {};
    s1.forEach((v, i) => { const m = v === s2[i] ? 'good' : 'dim'; mark[`0,${i}`] = m; mark[`1,${i}`] = m; });
    out.push({ tag: 'freq', trace: ['Sort the counts: ', A(s1.join(',')), ' vs ', A(s2.join(',')), '. Swapping letters relabels counts, so these must match → ', C(ok ? 'true' : 'false'), '.'], state: st(mark, true) });
    return { steps: out, result: ok ? 'true' : 'false' };
  },
  note: 'Operation 1 (swap positions) means order is irrelevant. Operation 2 (swap two letters everywhere) means which letter owns which count is irrelevant too — only the set of letters and the bag of counts survive both.',
  complexity: { time: 'O(n)', space: 'O(1) (26 letters)' },
};

/* ================= Find Duplicate File in System ================= */
const findDuplicateFile: ProblemDef = {
  slug: 'find-duplicate-file-in-system',
  title: 'Find Duplicate File in System',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-duplicate-file-in-system/',
  technique: 'Parse every file, group full paths by content in a hash map, return groups with 2+ paths.',
  widget: 'stack',
  widgetTitle: 'content → file paths',
  inputs: [{ key: 'paths', label: 'paths', defaultValue: '["root/a 1.txt(abcd) 2.txt(efgh)","root/c 3.txt(abcd)","root/c/d 4.txt(efgh)","root 4.txt(efgh)"]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<string>> findDuplicate(vector<string>& paths) {'),
      L('        unordered_map<string, vector<string>> byContent;'),
      L('        for (auto& p : paths) {'),
      L('            stringstream ss(p); string dir, f;', 'dir'),
      L('            ss >> dir;', 'dir'),
      L('            while (ss >> f) {'),
      L('                int k = f.find(\'(\');', 'file'),
      L('                string content = f.substr(k + 1, f.size() - k - 2);', 'file'),
      L('                byContent[content].push_back(dir + "/" + f.substr(0, k));', 'file'),
      L('            }'),
      L('        }'),
      L('        vector<vector<string>> res;'),
      L('        for (auto& [c, files] : byContent)'),
      L('            if (files.size() > 1) res.push_back(files);', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<String>> findDuplicate(String[] paths) {'),
      L('        Map<String, List<String>> byContent = new HashMap<>();'),
      L('        for (String p : paths) {'),
      L('            String[] parts = p.split(" ");', 'dir'),
      L('            for (int i = 1; i < parts.length; i++) {'),
      L('                int k = parts[i].indexOf(\'(\');', 'file'),
      L('                String content = parts[i].substring(k + 1, parts[i].length() - 1);', 'file'),
      L('                byContent.computeIfAbsent(content, x -> new ArrayList<>())', 'file'),
      L('                         .add(parts[0] + "/" + parts[i].substring(0, k));', 'file'),
      L('            }'),
      L('        }'),
      L('        List<List<String>> res = new ArrayList<>();'),
      L('        for (List<String> files : byContent.values())'),
      L('            if (files.size() > 1) res.add(files);', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = values.paths.trim().replace(/^\[|\]$/g, '');
    const paths = [...raw.matchAll(/"([^"]*)"/g)].map((m) => m[1].trim());
    if (paths.length === 0) return { error: 'Give paths as a list of quoted strings, like ["root/a 1.txt(abcd)"].' };
    if (paths.length > 6) return { error: 'Keep it to at most 6 directory strings.' };
    const by = new Map<string, string[]>();
    const out: Step[] = [];
    const st = (hl?: string): StackState => ({
      array: arr(paths.map((_, i) => `dir ${i}`)),
      stack: [...by.entries()].map(([c, f]) => ({ v: `${c}: ${f.join(', ')}`, c: c === hl ? 'a' : f.length > 1 ? 'b' : undefined })),
      stackLabel: 'content → files',
    });
    for (const p of paths) {
      const parts = p.split(/\s+/);
      const dir = parts[0];
      out.push({ tag: 'dir', trace: ['Directory ', A(dir), ' holds ', A(parts.length - 1), ' file(s).'], state: st() });
      for (let i = 1; i < parts.length; i++) {
        const m = parts[i].match(/^(.+)\((.*)\)$/);
        if (!m) return { error: `"${parts[i]}" should look like name.txt(content).` };
        const [, name, content] = m;
        const list = by.get(content) ?? [];
        list.push(`${dir}/${name}`);
        by.set(content, list);
        out.push({ tag: 'file', trace: [B(`${dir}/${name}`), ' has content ', A(`"${content}"`), list.length > 1 ? ` — that content now has ${list.length} files.` : ' — first file with that content.'], state: st(content) });
      }
    }
    const res = [...by.values()].filter((f) => f.length > 1);
    out.push({ tag: 'ret', trace: ['Groups with 2+ files are duplicates: ', C(res.length), ' group(s).'], state: st() });
    return { steps: out, result: `[${res.map((g) => `[${g.map((x) => `"${x}"`).join(',')}]`).join(',')}]` };
  },
  note: 'Two files are duplicates exactly when their content strings are equal, so content is the natural hash key. Grouping by key in one pass avoids comparing every file with every other.',
  complexity: { time: 'O(total input length)', space: 'O(total input length)' },
};

export const ccHashing: ProblemDef[] = [
  intersection,
  intersectionII,
  ransomNote,
  firstUniqChar,
  equalPairs,
  countNicePairs,
  fourSumII,
  closeStrings,
  findDuplicateFile,
];

