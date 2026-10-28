// Code Catalyst — Practice Set 4: sliding windows.
import type { ArrayState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, fmt, fmtS, parseWord } from './util';

const cpp = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L('public:'),
  L(`    ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('};'),
];
const java = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L(`    public ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('}'),
];

/* ================= Maximum Average Subarray I ================= */
const maxAverage: ProblemDef = {
  slug: 'maximum-average-subarray-i',
  title: 'Maximum Average Subarray I',
  category: 'Sliding Window',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  technique: 'Fixed window of size k: add the entering value, subtract the leaving one, track the best sum.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '1, 12, -5, -6, 50, 3', wide: true },
    { key: 'k', label: 'k', defaultValue: '4' },
  ],
  code: {
    cpp: cpp('double findMaxAverage(vector<int>& nums, int k)', [
      ['int sum = 0;'],
      ['for (int i = 0; i < k; i++) sum += nums[i];', 'init'],
      ['int best = sum;', 'init'],
      ['for (int i = k; i < nums.size(); i++) {'],
      ['    sum += nums[i] - nums[i - k];', 'slide'],
      ['    best = max(best, sum);', 'slide'],
      ['}'],
      ['return (double) best / k;', 'ret'],
    ]),
    java: java('double findMaxAverage(int[] nums, int k)', [
      ['int sum = 0;'],
      ['for (int i = 0; i < k; i++) sum += nums[i];', 'init'],
      ['int best = sum;', 'init'],
      ['for (int i = k; i < nums.length; i++) {'],
      ['    sum += nums[i] - nums[i - k];', 'slide'],
      ['    best = Math.max(best, sum);', 'slide'],
      ['}'],
      ['return (double) best / k;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 1, max: a.length });
    if (typeof k === 'string') return { error: k };
    let sum = a.slice(0, k).reduce((x, y) => x + y, 0);
    let best = sum;
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['First window (indices 0–', String(k - 1), ') sums to ', A(sum), '.'], state: arr(a, { window: [0, k - 1], aggs: [ag('sum', sum), ag('best', best, 'b')] }) });
    for (let i = k; i < a.length; i++) {
      sum += a[i] - a[i - k];
      const was = best;
      best = Math.max(best, sum);
      out.push({ tag: 'slide', trace: ['Slide: add ', B(a[i]), ', drop ', F(a[i - k]), '. Sum = ', A(sum), best > was ? '. New best!' : '.'], state: arr(a, { window: [i - k + 1, i], mark: { [i]: 'good', [i - k]: 'dim' }, aggs: [ag('sum', sum), ag('best', best, 'b')] }) });
    }
    const avg = best / k;
    const res = avg.toFixed(5);
    out.push({ tag: 'ret', trace: ['Best sum ', B(best), ' / ', String(k), ' = ', C(res), '.'], state: arr(a, { aggs: [ag('max average', res, 'c')] }) });
    return { steps: out, result: res };
  },
  note: 'Neighbouring windows share k − 1 values, so re-summing each one wastes work. Sliding adds one value and removes one, making every window O(1). Comparing sums instead of averages avoids division until the very end.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Minimum Recolors to Get K Consecutive Black Blocks ================= */
const minRecolors: ProblemDef = {
  slug: 'minimum-recolors-to-get-k-consecutive-black-blocks',
  title: 'Minimum Recolors to Get K Consecutive Black Blocks',
  category: 'Sliding Window',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/minimum-recolors-to-get-k-consecutive-black-blocks/',
  technique: 'Slide a window of size k and count the whites inside; the fewest whites is the answer.',
  widget: 'array',
  widgetTitle: 'blocks',
  inputs: [
    { key: 'blocks', label: 'blocks', defaultValue: 'WBBWWBBWBW' },
    { key: 'k', label: 'k', defaultValue: '7' },
  ],
  code: {
    cpp: cpp('int minimumRecolors(string blocks, int k)', [
      ['int whites = 0, best;'],
      ['for (int i = 0; i < k; i++) whites += blocks[i] == \'W\';', 'init'],
      ['best = whites;', 'init'],
      ['for (int i = k; i < blocks.size(); i++) {'],
      ['    whites += (blocks[i] == \'W\') - (blocks[i - k] == \'W\');', 'slide'],
      ['    best = min(best, whites);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int minimumRecolors(String blocks, int k)', [
      ['int whites = 0, best;'],
      ['for (int i = 0; i < k; i++) if (blocks.charAt(i) == \'W\') whites++;', 'init'],
      ['best = whites;', 'init'],
      ['for (int i = k; i < blocks.length(); i++) {'],
      ['    if (blocks.charAt(i) == \'W\') whites++;', 'slide'],
      ['    if (blocks.charAt(i - k) == \'W\') whites--;', 'slide'],
      ['    best = Math.min(best, whites);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.blocks, 'blocks', { max: 18, re: /^[WB]+$/, reMsg: 'Use only W and B.' });
    if (typeof s !== 'string') return s;
    const k = parseInt1(values.k, 'k', { min: 1, max: s.length });
    if (typeof k === 'string') return { error: k };
    const b = s.split('');
    const dimW = (l: number, r: number): ArrayState['mark'] => { const m: NonNullable<ArrayState['mark']> = {}; for (let i = l; i <= r; i++) if (b[i] === 'W') m[i] = 'active'; return m; };
    let whites = b.slice(0, k).filter((c) => c === 'W').length;
    let best = whites;
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['The first ', String(k), ' blocks contain ', A(whites), ' white(s) to recolor.'], state: arr(b, { window: [0, k - 1], mark: dimW(0, k - 1), aggs: [ag('whites', whites), ag('best', best, 'b')] }) });
    for (let i = k; i < b.length; i++) {
      whites += (b[i] === 'W' ? 1 : 0) - (b[i - k] === 'W' ? 1 : 0);
      best = Math.min(best, whites);
      out.push({ tag: 'slide', trace: ['Slide: ', B(b[i]), ' enters, ', F(b[i - k]), ' leaves. Whites in window = ', A(whites), '. Fewest so far: ', B(best), '.'], state: arr(b, { window: [i - k + 1, i], mark: dimW(i - k + 1, i), aggs: [ag('whites', whites), ag('best', best, 'b')] }) });
    }
    out.push({ tag: 'ret', trace: ['Recolor ', C(best), ' block(s).'], state: arr(b, { aggs: [ag('answer', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'To make a length-k run all black, you must repaint exactly the whites in it. So try every length-k window and pick the one with the fewest whites — sliding keeps the white count updated in O(1).',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Find the K-Beauty of a Number ================= */
const kBeauty: ProblemDef = {
  slug: 'find-the-k-beauty-of-a-number',
  title: 'Find the K-Beauty of a Number',
  category: 'Sliding Window',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/find-the-k-beauty-of-a-number/',
  technique: 'Slide a k-digit window over the number\'s digits; count windows whose value is non-zero and divides num.',
  widget: 'array',
  widgetTitle: 'Digits of num',
  inputs: [
    { key: 'num', label: 'num', defaultValue: '430043' },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('int divisorSubstrings(int num, int k)', [
      ['string s = to_string(num);'],
      ['int count = 0;'],
      ['for (int i = 0; i + k <= s.size(); i++) {'],
      ['    int v = stoi(s.substr(i, k));', 'yes', 'no'],
      ['    if (v != 0 && num % v == 0) count++;', 'yes', 'no'],
      ['}'],
      ['return count;', 'ret'],
    ]),
    java: java('int divisorSubstrings(int num, int k)', [
      ['String s = String.valueOf(num);'],
      ['int count = 0;'],
      ['for (int i = 0; i + k <= s.length(); i++) {'],
      ['    int v = Integer.parseInt(s.substring(i, i + k));', 'yes', 'no'],
      ['    if (v != 0 && num % v == 0) count++;', 'yes', 'no'],
      ['}'],
      ['return count;', 'ret'],
    ]),
  },
  run(values) {
    const num = parseInt1(values.num, 'num', { min: 1, max: 1000000000 });
    if (typeof num === 'string') return { error: num };
    const s = String(num);
    const k = parseInt1(values.k, 'k', { min: 1, max: s.length });
    if (typeof k === 'string') return { error: k };
    const d = s.split('');
    let count = 0;
    const out: Step[] = [];
    for (let i = 0; i + k <= s.length; i++) {
      const v = Number(s.slice(i, i + k));
      const ok = v !== 0 && num % v === 0;
      if (ok) count++;
      out.push({ tag: ok ? 'yes' : 'no', trace: ok ? ['Window "', A(s.slice(i, i + k)), '" = ', B(v), ' divides ', String(num), '. Count = ', C(count), '.'] : v === 0 ? ['Window "', F(s.slice(i, i + k)), '" is 0 — cannot divide by it.'] : ['Window "', A(s.slice(i, i + k)), '" = ', F(v), ' does not divide ', String(num), '.'], state: arr(d, { window: [i, i + k - 1], mark: ok ? range2(i, i + k - 1) : {}, aggs: [ag('k-beauty', count, 'c')] }) });
    }
    out.push({ tag: 'ret', trace: ['k-beauty = ', C(count), '.'], state: arr(d, { aggs: [ag('k-beauty', count, 'c')] }) });
    return { steps: out, result: String(count) };
  },
  note: 'There are only (digits − k + 1) windows, so checking each directly is already linear in the digit count. Watch for a window of all zeros — dividing by it is undefined, so it never counts.',
  complexity: { time: 'O(d · k), d = digits', space: 'O(d)' },
};
function range2(l: number, r: number): ArrayState['mark'] { const m: NonNullable<ArrayState['mark']> = {}; for (let i = l; i <= r; i++) m[i] = 'good'; return m; }

/* ================= Maximum Number of Vowels in a Substring ================= */
const isV = (c: string) => 'aeiou'.includes(c);
const maxVowels: ProblemDef = {
  slug: 'maximum-number-of-vowels-in-a-substring-of-given-length',
  title: 'Maximum Number of Vowels in a Substring of Given Length',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/',
  technique: 'Fixed window of size k; update the vowel count by the char entering and the char leaving.',
  widget: 'array',
  widgetTitle: 's',
  inputs: [
    { key: 's', label: 's', defaultValue: 'abciiidef' },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('int maxVowels(string s, int k)', [
      ['auto v = [](char c) { return string("aeiou").find(c) != string::npos; };'],
      ['int cnt = 0, best = 0;'],
      ['for (int i = 0; i < s.size(); i++) {'],
      ['    cnt += v(s[i]);', 'slide'],
      ['    if (i >= k) cnt -= v(s[i - k]);', 'slide'],
      ['    best = max(best, cnt);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int maxVowels(String s, int k)', [
      ['int cnt = 0, best = 0;'],
      ['for (int i = 0; i < s.length(); i++) {'],
      ['    if ("aeiou".indexOf(s.charAt(i)) >= 0) cnt++;', 'slide'],
      ['    if (i >= k && "aeiou".indexOf(s.charAt(i - k)) >= 0) cnt--;', 'slide'],
      ['    best = Math.max(best, cnt);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 18, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const k = parseInt1(values.k, 'k', { min: 1, max: s.length });
    if (typeof k === 'string') return { error: k };
    const cs = s.split('');
    let cnt = 0;
    let best = 0;
    const out: Step[] = [];
    for (let i = 0; i < cs.length; i++) {
      if (isV(cs[i])) cnt++;
      const left = i >= k ? cs[i - k] : null;
      if (left !== null && isV(left)) cnt--;
      best = Math.max(best, cnt);
      const l = Math.max(0, i - k + 1);
      const mark: NonNullable<ArrayState['mark']> = {};
      for (let j = l; j <= i; j++) if (isV(cs[j])) mark[j] = 'good';
      out.push({ tag: 'slide', trace: [A(cs[i]), isV(cs[i]) ? ' is a vowel' : ' is not a vowel', left !== null ? ['; ', left, ' leaves'].join('') : '', '. Vowels in window = ', A(cnt), ', best = ', B(best), '.'], state: arr(cs, { window: [l, i], mark, aggs: [ag('vowels', cnt), ag('best', best, 'b')] }) });
    }
    out.push({ tag: 'ret', trace: ['Most vowels in any length-', String(k), ' substring: ', C(best), '.'], state: arr(cs, { aggs: [ag('answer', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'Only two chars change between neighbouring windows, so only they can change the vowel count. That keeps each window O(1) instead of O(k).',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Grumpy Bookstore Owner ================= */
const grumpyOwner: ProblemDef = {
  slug: 'grumpy-bookstore-owner',
  title: 'Grumpy Bookstore Owner',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/grumpy-bookstore-owner/',
  technique: 'Count customers already satisfied, then slide a window of length minutes to find the most grumpy-minute customers to rescue.',
  widget: 'array',
  widgetTitle: 'customers (grumpy minutes in amber)',
  inputs: [
    { key: 'customers', label: 'customers', defaultValue: '1, 0, 1, 2, 1, 1, 7, 5', wide: true },
    { key: 'grumpy', label: 'grumpy', defaultValue: '0, 1, 0, 1, 0, 1, 0, 1', wide: true },
    { key: 'minutes', label: 'minutes', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('int maxSatisfied(vector<int>& customers, vector<int>& grumpy, int minutes)', [
      ['int base = 0, extra = 0, best = 0;'],
      ['for (int i = 0; i < customers.size(); i++)'],
      ['    if (!grumpy[i]) base += customers[i];', 'base'],
      ['for (int i = 0; i < customers.size(); i++) {'],
      ['    if (grumpy[i]) extra += customers[i];', 'slide'],
      ['    if (i >= minutes && grumpy[i - minutes]) extra -= customers[i - minutes];', 'slide'],
      ['    best = max(best, extra);', 'slide'],
      ['}'],
      ['return base + best;', 'ret'],
    ]),
    java: java('int maxSatisfied(int[] customers, int[] grumpy, int minutes)', [
      ['int base = 0, extra = 0, best = 0;'],
      ['for (int i = 0; i < customers.length; i++)'],
      ['    if (grumpy[i] == 0) base += customers[i];', 'base'],
      ['for (int i = 0; i < customers.length; i++) {'],
      ['    if (grumpy[i] == 1) extra += customers[i];', 'slide'],
      ['    if (i >= minutes && grumpy[i - minutes] == 1) extra -= customers[i - minutes];', 'slide'],
      ['    best = Math.max(best, extra);', 'slide'],
      ['}'],
      ['return base + best;', 'ret'],
    ]),
  },
  run(values) {
    const c = parseIntArray(values.customers, { maxLen: 14, min: 0 });
    if (typeof c === 'string') return { error: c };
    const g = parseIntArray(values.grumpy, { maxLen: 14, min: 0, max: 1 });
    if (typeof g === 'string') return { error: g };
    if (c.length !== g.length) return { error: 'customers and grumpy must be the same length.' };
    const m = parseInt1(values.minutes, 'minutes', { min: 1, max: c.length });
    if (typeof m === 'string') return { error: m };
    const gm: NonNullable<ArrayState['mark']> = {};
    g.forEach((x, i) => (gm[i] = x ? 'active' : 'good'));
    const base = c.reduce((s, x, i) => s + (g[i] ? 0 : x), 0);
    let extra = 0;
    let best = 0;
    const out: Step[] = [];
    out.push({ tag: 'base', trace: ['Customers in calm minutes (teal) are happy no matter what: ', B(base), '.'], state: arr(c, { mark: gm, aggs: [ag('always happy', base, 'b')] }) });
    for (let i = 0; i < c.length; i++) {
      if (g[i]) extra += c[i];
      if (i >= m && g[i - m]) extra -= c[i - m];
      best = Math.max(best, extra);
      out.push({ tag: 'slide', trace: ['Technique used on minutes ', String(Math.max(0, i - m + 1)), '–', String(i), ' would rescue ', A(extra), ' grumpy-minute customers. Best rescue: ', B(best), '.'], state: arr(c, { window: [Math.max(0, i - m + 1), i], mark: gm, aggs: [ag('always happy', base, 'b'), ag('rescued', extra), ag('best rescue', best, 'b')] }) });
    }
    out.push({ tag: 'ret', trace: [B(base), ' + ', B(best), ' = ', C(base + best), ' satisfied customers.'], state: arr(c, { mark: gm, aggs: [ag('answer', base + best, 'c')] }) });
    return { steps: out, result: String(base + best) };
  },
  note: 'The technique only matters in grumpy minutes, so split the total into "always satisfied" plus "rescued by the window". The first part is fixed; maximising the second is a plain fixed-size sliding window.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Find All Anagrams in a String ================= */
const findAnagrams: ProblemDef = {
  slug: 'find-all-anagrams-in-a-string',
  title: 'Find All Anagrams in a String',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/',
  technique: 'Slide a window of length |p| over s, keeping letter counts; record the start whenever counts equal p\'s.',
  widget: 'array',
  widgetTitle: 's',
  inputs: [
    { key: 's', label: 's', defaultValue: 'cbaebabacd' },
    { key: 'p', label: 'p', defaultValue: 'abc' },
  ],
  code: {
    cpp: cpp('vector<int> findAnagrams(string s, string p)', [
      ['vector<int> need(26), have(26), res;'],
      ['for (char c : p) need[c - \'a\']++;', 'init'],
      ['for (int i = 0; i < s.size(); i++) {'],
      ['    have[s[i] - \'a\']++;', 'slide', 'hit'],
      ['    if (i >= p.size()) have[s[i - p.size()] - \'a\']--;', 'slide', 'hit'],
      ['    if (have == need) res.push_back(i - p.size() + 1);', 'hit'],
      ['}'],
      ['return res;', 'ret'],
    ]),
    java: java('List<Integer> findAnagrams(String s, String p)', [
      ['int[] need = new int[26], have = new int[26];'],
      ['List<Integer> res = new ArrayList<>();'],
      ['for (char c : p.toCharArray()) need[c - \'a\']++;', 'init'],
      ['for (int i = 0; i < s.length(); i++) {'],
      ['    have[s.charAt(i) - \'a\']++;', 'slide', 'hit'],
      ['    if (i >= p.length()) have[s.charAt(i - p.length()) - \'a\']--;', 'slide', 'hit'],
      ['    if (Arrays.equals(have, need)) res.add(i - p.length() + 1);', 'hit'],
      ['}'],
      ['return res;', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 20, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const p = parseWord(values.p, 'p', { max: 8, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof p !== 'string') return p;
    const key = (w: string) => [...w].sort().join('');
    const need = key(p);
    const cs = s.split('');
    const res: number[] = [];
    const out: Step[] = [];
    const found: NonNullable<ArrayState['mark']> = {};
    out.push({ tag: 'init', trace: ['Count the letters of p = ', A(p), '. Any window with the same counts is an anagram.'], state: arr(cs, { aggs: [ag('p', p)] }) });
    for (let i = 0; i < cs.length; i++) {
      const l = i - p.length + 1;
      if (l < 0) {
        out.push({ tag: 'slide', trace: ['Grow the window with ', A(cs[i]), ' — not full length yet.'], state: arr(cs, { window: [0, i], mark: { ...found }, aggs: [ag('p', p), ag('starts', fmt(res), 'c')] }) });
        continue;
      }
      const w = s.slice(l, i + 1);
      if (key(w) === need) {
        res.push(l);
        found[l] = 'final';
        out.push({ tag: 'hit', trace: ['Window "', B(w), '" has the same letter counts as p — anagram starting at ', C(l), '.'], state: arr(cs, { window: [l, i], mark: { ...found }, aggs: [ag('p', p), ag('starts', fmt(res), 'c')] }) });
      } else {
        out.push({ tag: 'slide', trace: ['Window "', F(w), '" — counts differ from p.'], state: arr(cs, { window: [l, i], mark: { ...found }, aggs: [ag('p', p), ag('starts', fmt(res), 'c')] }) });
      }
    }
    out.push({ tag: 'ret', trace: ['Anagram start indices: ', C(fmt(res)), '.'], state: arr(cs, { mark: found, aggs: [ag('starts', fmt(res), 'c')] }) });
    return { steps: out, result: fmt(res) };
  },
  note: 'Two strings are anagrams iff their 26 letter counts match. Sliding changes just two counts per step, and comparing two 26-length arrays is O(1), so the whole scan is linear.',
  complexity: { time: 'O(n · 26)', space: 'O(1)' },
};

/* ================= Repeated DNA Sequences ================= */
const repeatedDna: ProblemDef = {
  slug: 'repeated-dna-sequences',
  title: 'Repeated DNA Sequences',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/repeated-dna-sequences/',
  technique: 'Slide a 10-letter window; a hash set of seen windows flags any window that shows up a second time.',
  widget: 'stack',
  widgetTitle: 's with seen windows',
  inputs: [
    { key: 's', label: 's', defaultValue: 'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT', wide: true },
    { key: 'L', label: 'window length (10 on LeetCode)', defaultValue: '10' },
  ],
  code: {
    cpp: cpp('vector<string> findRepeatedDnaSequences(string s)', [
      ['unordered_set<string> seen, rep;'],
      ['for (int i = 0; i + 10 <= (int) s.size(); i++) {'],
      ['    string w = s.substr(i, 10);', 'new', 'dup'],
      ['    if (!seen.insert(w).second) rep.insert(w);', 'new', 'dup'],
      ['}'],
      ['return vector<string>(rep.begin(), rep.end());', 'ret'],
    ]),
    java: java('List<String> findRepeatedDnaSequences(String s)', [
      ['Set<String> seen = new HashSet<>(), rep = new LinkedHashSet<>();'],
      ['for (int i = 0; i + 10 <= s.length(); i++) {'],
      ['    String w = s.substring(i, i + 10);', 'new', 'dup'],
      ['    if (!seen.add(w)) rep.add(w);', 'new', 'dup'],
      ['}'],
      ['return new ArrayList<>(rep);', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 40, re: /^[ACGT]+$/, reMsg: 'Use only A, C, G, T.' });
    if (typeof s !== 'string') return s;
    const Lw = parseInt1(values.L, 'window length', { min: 1, max: 12 });
    if (typeof Lw === 'string') return { error: Lw };
    const cs = s.split('');
    const seen = new Set<string>();
    const rep: string[] = [];
    const out: Step[] = [];
    const st = (l: number, hl?: string): StackState => ({
      array: arr(cs, { window: [l, l + Lw - 1] }),
      stack: [...seen].slice(-8).map((w) => ({ v: w, c: w === hl ? 'a' : rep.includes(w) ? 'b' : undefined })),
      stackLabel: `seen (last 8 of ${seen.size})`,
      aggs: [ag('repeated', rep.length ? fmtS(rep) : '—', 'c')],
    });
    for (let i = 0; i + Lw <= s.length && out.length < MAX_STEPS; i++) {
      const w = s.slice(i, i + Lw);
      if (seen.has(w)) {
        if (!rep.includes(w)) rep.push(w);
        out.push({ tag: 'dup', trace: ['"', B(w), '" was seen before — it repeats.'], state: st(i, w) });
      } else {
        seen.add(w);
        out.push({ tag: 'new', trace: ['"', A(w), '" is new — add it to the set.'], state: st(i, w) });
      }
    }
    if (out.length === 0) return { error: 's is shorter than the window length.' };
    out.push({ tag: 'ret', trace: ['Repeated sequences: ', C(rep.length ? fmtS(rep) : 'none'), '.'], state: { ...st(0), array: arr(cs) } });
    return { steps: out, result: fmtS(rep) };
  },
  note: 'Every 10-letter substring is one window, so there are only n − 9 of them. A hash set turns "have I seen this before?" into O(1); a second set makes sure each repeat is reported once. (You can go further by encoding each window as a 20-bit integer.)',
  complexity: { time: 'O(n · 10)', space: 'O(n · 10)' },
};

/* ================= Contains Duplicate II ================= */
const containsDupII: ProblemDef = {
  slug: 'contains-duplicate-ii',
  title: 'Contains Duplicate II',
  category: 'Sliding Window',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/contains-duplicate-ii/',
  technique: 'Keep a set of the last k values; a value already in the set is a duplicate within distance k.',
  widget: 'stack',
  widgetTitle: 'nums with a window set of the last k values',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '1, 2, 3, 1, 2, 3', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('bool containsNearbyDuplicate(vector<int>& nums, int k)', [
      ['unordered_set<int> win;'],
      ['for (int i = 0; i < nums.size(); i++) {'],
      ['    if (win.count(nums[i])) return true;', 'hit'],
      ['    win.insert(nums[i]);', 'add'],
      ['    if (win.size() > k) win.erase(nums[i - k]);', 'add'],
      ['}'],
      ['return false;', 'ret'],
    ]),
    java: java('boolean containsNearbyDuplicate(int[] nums, int k)', [
      ['Set<Integer> win = new HashSet<>();'],
      ['for (int i = 0; i < nums.length; i++) {'],
      ['    if (win.contains(nums[i])) return true;', 'hit'],
      ['    win.add(nums[i]);', 'add'],
      ['    if (win.size() > k) win.remove(nums[i - k]);', 'add'],
      ['}'],
      ['return false;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 0, max: 20 });
    if (typeof k === 'string') return { error: k };
    const win = new Set<number>();
    const out: Step[] = [];
    const st = (i: number, mark: ArrayState['mark'] = {}): StackState => ({
      array: arr(a, { window: [Math.max(0, i - k), Math.max(0, i - 1)], mark, ptrs: [{ name: 'i', i, c: 'a' }] }),
      stack: [...win].map((v) => ({ v, c: v === a[i] ? 'a' : undefined })),
      stackLabel: `last ${k} values`,
    });
    for (let i = 0; i < a.length; i++) {
      if (win.has(a[i])) {
        const j = a.lastIndexOf(a[i], i - 1);
        out.push({ tag: 'hit', trace: [A(a[i]), ' is already among the last ', String(k), ' values (index ', B(j), ') → ', C('true'), '.'], state: st(i, { [i]: 'final', [j]: 'final' }) });
        return { steps: out, result: 'true' };
      }
      win.add(a[i]);
      let dropped: number | null = null;
      if (win.size > k) { dropped = a[i - k]; win.delete(a[i - k]); }
      out.push({ tag: 'add', trace: dropped !== null ? [A(a[i]), ' is new — add it, and drop ', F(dropped), ' which is now more than ', String(k), ' away.'] : [A(a[i]), ' is new — add it to the window.'], state: st(i, { [i]: 'active' }) });
    }
    out.push({ tag: 'ret', trace: ['No value repeated within distance ', String(k), ' → ', C('false'), '.'], state: { array: arr(a), stack: [...win].map((v) => ({ v })), stackLabel: `last ${k} values` } as StackState });
    return { steps: out, result: 'false' };
  },
  note: 'Only the previous k values can pair with nums[i], so the set never needs to hold more than k items. Evicting the value that falls out of range keeps lookups O(1) and memory O(k).',
  complexity: { time: 'O(n)', space: 'O(min(n, k))' },
};

/* ================= Get Equal Substrings Within Budget ================= */
const equalSubstring: ProblemDef = {
  slug: 'get-equal-substrings-within-budget',
  title: 'Get Equal Substrings Within Budget',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/get-equal-substrings-within-budget/',
  technique: 'Variable window over per-position costs |s[i] − t[i]|; shrink from the left whenever cost exceeds the budget.',
  widget: 'array',
  widgetTitle: 'cost[i] = |s[i] − t[i]|',
  inputs: [
    { key: 's', label: 's', defaultValue: 'abcd' },
    { key: 't', label: 't', defaultValue: 'bcdf' },
    { key: 'maxCost', label: 'maxCost', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('int equalSubstring(string s, string t, int maxCost)', [
      ['int l = 0, cost = 0, best = 0;'],
      ['for (int r = 0; r < s.size(); r++) {'],
      ['    cost += abs(s[r] - t[r]);', 'grow'],
      ['    while (cost > maxCost) { cost -= abs(s[l] - t[l]); l++; }', 'shrink'],
      ['    best = max(best, r - l + 1);', 'grow'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int equalSubstring(String s, String t, int maxCost)', [
      ['int l = 0, cost = 0, best = 0;'],
      ['for (int r = 0; r < s.length(); r++) {'],
      ['    cost += Math.abs(s.charAt(r) - t.charAt(r));', 'grow'],
      ['    while (cost > maxCost) { cost -= Math.abs(s.charAt(l) - t.charAt(l)); l++; }', 'shrink'],
      ['    best = Math.max(best, r - l + 1);', 'grow'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 16, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const t = parseWord(values.t, 't', { max: 16, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof t !== 'string') return t;
    if (s.length !== t.length) return { error: 's and t must be the same length.' };
    const maxCost = parseInt1(values.maxCost, 'maxCost', { min: 0 });
    if (typeof maxCost === 'string') return { error: maxCost };
    const cost = [...s].map((c, i) => Math.abs(c.charCodeAt(0) - t.charCodeAt(i)));
    let l = 0;
    let cur = 0;
    let best = 0;
    const out: Step[] = [];
    const st = (r: number) => arr(cost, { window: l <= r ? [l, r] : null, ptrs: [{ name: 'l', i: l, c: 'b' }, { name: 'r', i: r, c: 'a' }], aggs: [ag('s', s), ag('t', t), ag('cost', cur), ag('best', best, 'c')] });
    for (let r = 0; r < s.length; r++) {
      cur += cost[r];
      if (cur > maxCost) {
        out.push({ tag: 'grow', trace: ['Add ', A(`${s[r]}→${t[r]}`), ' costing ', A(cost[r]), '. Total ', F(cur), ' is over budget ', String(maxCost), '.'], state: st(r) });
        while (cur > maxCost) { cur -= cost[l]; l++; }
        out.push({ tag: 'shrink', trace: ['Drop chars from the left until the cost fits: now ', B(cur), '.'], state: st(r) });
      }
      best = Math.max(best, r - l + 1);
      out.push({ tag: 'grow', trace: ['Window ', String(l), '–', String(r), ' costs ', B(cur), ' ≤ ', String(maxCost), '. Length ', A(r - l + 1), ', best ', C(best), '.'], state: st(r) });
    }
    out.push({ tag: 'ret', trace: ['Longest affordable substring: ', C(best), '.'], state: arr(cost, { aggs: [ag('answer', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'All costs are non-negative, so growing a window can only raise its cost and shrinking can only lower it. That monotonic behaviour is exactly what makes a two-pointer window correct here.',
  complexity: { time: 'O(n)', space: 'O(n) for the cost view (O(1) possible)' },
};

/* ================= Maximum Erasure Value ================= */
const maxErasure: ProblemDef = {
  slug: 'maximum-erasure-value',
  title: 'Maximum Erasure Value',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-erasure-value/',
  technique: 'Window of distinct values: on a repeat, shrink from the left until the old copy is gone; track the best sum.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '5, 2, 1, 2, 5, 2, 1, 2, 5', wide: true }],
  code: {
    cpp: cpp('int maximumUniqueSubarray(vector<int>& nums)', [
      ['unordered_set<int> in;'],
      ['int l = 0, sum = 0, best = 0;'],
      ['for (int r = 0; r < nums.size(); r++) {'],
      ['    while (in.count(nums[r])) { in.erase(nums[l]); sum -= nums[l++]; }', 'shrink'],
      ['    in.insert(nums[r]); sum += nums[r];', 'grow'],
      ['    best = max(best, sum);', 'grow'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int maximumUniqueSubarray(int[] nums)', [
      ['Set<Integer> in = new HashSet<>();'],
      ['int l = 0, sum = 0, best = 0;'],
      ['for (int r = 0; r < nums.length; r++) {'],
      ['    while (in.contains(nums[r])) { in.remove(nums[l]); sum -= nums[l++]; }', 'shrink'],
      ['    in.add(nums[r]); sum += nums[r];', 'grow'],
      ['    best = Math.max(best, sum);', 'grow'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16, min: 1 });
    if (typeof a === 'string') return { error: a };
    const inW = new Set<number>();
    let l = 0;
    let sum = 0;
    let best = 0;
    const out: Step[] = [];
    const st = (r: number) => arr(a, { window: [l, r], ptrs: [{ name: 'l', i: l, c: 'b' }, { name: 'r', i: r, c: 'a' }], aggs: [ag('sum', sum), ag('best', best, 'c')] });
    for (let r = 0; r < a.length; r++) {
      if (inW.has(a[r])) {
        while (inW.has(a[r])) { inW.delete(a[l]); sum -= a[l]; l++; }
        out.push({ tag: 'shrink', trace: [A(a[r]), ' is already in the window — drop values from the left until its old copy is gone.'], state: st(Math.max(l, r - 1)) });
      }
      inW.add(a[r]);
      sum += a[r];
      best = Math.max(best, sum);
      out.push({ tag: 'grow', trace: ['Add ', A(a[r]), '. All values in ', String(l), '–', String(r), ' are distinct; sum = ', B(sum), ', best = ', C(best), '.'], state: st(r) });
    }
    out.push({ tag: 'ret', trace: ['Best score: ', C(best), '.'], state: arr(a, { aggs: [ag('answer', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'This is Longest Substring Without Repeating Characters, scoring by sum instead of length. Every value enters and leaves the window at most once, so the inner while loop is O(n) in total.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Subarray Product Less Than K ================= */
const productLessThanK: ProblemDef = {
  slug: 'subarray-product-less-than-k',
  title: 'Subarray Product Less Than K',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/subarray-product-less-than-k/',
  technique: 'Grow r, shrink l while product ≥ k; every window ending at r contributes r − l + 1 subarrays.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '10, 5, 2, 6', wide: true },
    { key: 'k', label: 'k', defaultValue: '100' },
  ],
  code: {
    cpp: cpp('int numSubarrayProductLessThanK(vector<int>& nums, int k)', [
      ['if (k <= 1) return 0;', 'edge'],
      ['long prod = 1; int l = 0, count = 0;'],
      ['for (int r = 0; r < nums.size(); r++) {'],
      ['    prod *= nums[r];', 'grow'],
      ['    while (prod >= k) prod /= nums[l++];', 'shrink'],
      ['    count += r - l + 1;', 'count'],
      ['}'],
      ['return count;', 'ret'],
    ]),
    java: java('int numSubarrayProductLessThanK(int[] nums, int k)', [
      ['if (k <= 1) return 0;', 'edge'],
      ['long prod = 1; int l = 0, count = 0;'],
      ['for (int r = 0; r < nums.length; r++) {'],
      ['    prod *= nums[r];', 'grow'],
      ['    while (prod >= k) prod /= nums[l++];', 'shrink'],
      ['    count += r - l + 1;', 'count'],
      ['}'],
      ['return count;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14, min: 1, max: 1000 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 0, max: 1000000 });
    if (typeof k === 'string') return { error: k };
    const out: Step[] = [];
    if (k <= 1) {
      out.push({ tag: 'edge', trace: ['Every number is ≥ 1, so no product is below ', String(k), ' → ', C(0), '.'], state: arr(a) });
      return { steps: out, result: '0' };
    }
    let prod = 1;
    let l = 0;
    let count = 0;
    const st = (r: number) => arr(a, { window: l <= r ? [l, r] : null, ptrs: [{ name: 'l', i: Math.min(l, a.length - 1), c: 'b' }, { name: 'r', i: r, c: 'a' }], aggs: [ag('product', prod), ag('count', count, 'c')] });
    for (let r = 0; r < a.length; r++) {
      prod *= a[r];
      out.push({ tag: 'grow', trace: ['Multiply in ', A(a[r]), ': product = ', A(prod), '.'], state: st(r) });
      if (prod >= k) {
        while (prod >= k) { prod /= a[l]; l++; }
        out.push({ tag: 'shrink', trace: ['That is ≥ ', String(k), ', so divide out values from the left until it fits: product = ', B(prod), '.'], state: st(r) });
      }
      count += r - l + 1;
      out.push({ tag: 'count', trace: ['Every subarray ending at ', String(r), ' and starting in ', String(l), '..', String(r), ' works: +', B(r - l + 1), ' → ', C(count), '.'], state: st(r) });
    }
    out.push({ tag: 'ret', trace: ['Subarrays with product < ', String(k), ': ', C(count), '.'], state: arr(a, { aggs: [ag('answer', count, 'c')] }) });
    return { steps: out, result: String(count) };
  },
  note: 'If [l, r] has product < k, so does every suffix of it — dropping positive factors only shrinks the product. That is why one window gives r − l + 1 answers at once, and why l never needs to move back.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Minimum Operations to Reduce X to Zero ================= */
const minOpsX: ProblemDef = {
  slug: 'minimum-operations-to-reduce-x-to-zero',
  title: 'Minimum Operations to Reduce X to Zero',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/',
  technique: 'Flip it: keep the longest middle subarray summing to total − x; everything outside it is removed.',
  widget: 'array',
  widgetTitle: 'nums — window = the part we keep',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '3, 2, 20, 1, 1, 3', wide: true },
    { key: 'x', label: 'x', defaultValue: '10' },
  ],
  code: {
    cpp: cpp('int minOperations(vector<int>& nums, int x)', [
      ['int target = accumulate(nums.begin(), nums.end(), 0) - x;', 'init'],
      ['if (target < 0) return -1;', 'init'],
      ['int l = 0, sum = 0, keep = -1, n = nums.size();'],
      ['for (int r = 0; r < n; r++) {'],
      ['    sum += nums[r];', 'grow'],
      ['    while (sum > target) sum -= nums[l++];', 'shrink'],
      ['    if (sum == target) keep = max(keep, r - l + 1);', 'hit'],
      ['}'],
      ['return keep == -1 ? -1 : n - keep;', 'ret'],
    ]),
    java: java('int minOperations(int[] nums, int x)', [
      ['int total = 0; for (int v : nums) total += v;'],
      ['int target = total - x;', 'init'],
      ['if (target < 0) return -1;', 'init'],
      ['int l = 0, sum = 0, keep = -1, n = nums.length;'],
      ['for (int r = 0; r < n; r++) {'],
      ['    sum += nums[r];', 'grow'],
      ['    while (sum > target) sum -= nums[l++];', 'shrink'],
      ['    if (sum == target) keep = Math.max(keep, r - l + 1);', 'hit'],
      ['}'],
      ['return keep == -1 ? -1 : n - keep;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14, min: 1 });
    if (typeof a === 'string') return { error: a };
    const x = parseInt1(values.x, 'x', { min: 1 });
    if (typeof x === 'string') return { error: x };
    const n = a.length;
    const target = a.reduce((p, q) => p + q, 0) - x;
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['Removing from both ends with total ', A(x), ' is the same as keeping a middle part that sums to total − x = ', B(target), '. Keep it as long as possible.'], state: arr(a, { aggs: [ag('keep sum', target, 'b')] }) });
    if (target < 0) {
      out.push({ tag: 'ret', trace: ['Even removing everything is not enough → ', C(-1), '.'], state: arr(a) });
      return { steps: out, result: '-1' };
    }
    let l = 0;
    let sum = 0;
    let keep = -1;
    const st = (r: number) => arr(a, { window: l <= r ? [l, r] : null, ptrs: [{ name: 'l', i: Math.min(l, n - 1), c: 'b' }, { name: 'r', i: r, c: 'a' }], aggs: [ag('window sum', sum), ag('need', target, 'b'), ag('longest keep', keep, 'c')] });
    for (let r = 0; r < n; r++) {
      sum += a[r];
      out.push({ tag: 'grow', trace: ['Extend the kept part with ', A(a[r]), ': sum = ', A(sum), '.'], state: st(r) });
      if (sum > target) {
        while (sum > target && l <= r) { sum -= a[l]; l++; }
        out.push({ tag: 'shrink', trace: ['Over ', String(target), ' — drop from the left: sum = ', B(sum), '.'], state: st(r) });
      }
      if (sum === target) {
        keep = Math.max(keep, r - l + 1);
        out.push({ tag: 'hit', trace: ['Kept part ', String(l), '–', String(r), ' sums to exactly ', B(target), ' (length ', A(r - l + 1), '). Longest so far: ', C(keep), '.'], state: st(r) });
      }
    }
    const ans = keep === -1 ? -1 : n - keep;
    out.push({ tag: 'ret', trace: keep === -1 ? ['No middle part works → ', C(-1), '.'] : ['Keep ', B(keep), ' numbers, remove the other ', C(ans), '.'], state: arr(a, { aggs: [ag('answer', ans, 'c')] }) });
    return { steps: out, result: String(ans) };
  },
  note: 'Choosing elements from both ends is awkward; what remains is always one contiguous middle block. Fewest removals = longest middle block with sum total − x, which a positive-number sliding window finds in one pass.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Minimum Swaps to Group All 1's Together II ================= */
const minSwapsII: ProblemDef = {
  slug: 'minimum-swaps-to-group-all-1s-together-ii',
  title: "Minimum Swaps to Group All 1's Together II",
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-swaps-to-group-all-1s-together-ii/',
  technique: 'Window size = number of 1s; slide it around the circle, the fewest 0s inside is the number of swaps.',
  widget: 'array',
  widgetTitle: 'nums (circular)',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '0, 1, 1, 1, 0, 0, 1, 1, 0', wide: true }],
  code: {
    cpp: cpp('int minSwaps(vector<int>& nums)', [
      ['int n = nums.size(), k = count(nums.begin(), nums.end(), 1);', 'init'],
      ['int ones = 0, best;'],
      ['for (int i = 0; i < k; i++) ones += nums[i];', 'init'],
      ['best = k - ones;', 'init'],
      ['for (int i = k; i < n + k; i++) {'],
      ['    ones += nums[i % n] - nums[(i - k) % n];', 'slide'],
      ['    best = min(best, k - ones);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
    java: java('int minSwaps(int[] nums)', [
      ['int n = nums.length, k = 0;'],
      ['for (int v : nums) k += v;', 'init'],
      ['int ones = 0, best;'],
      ['for (int i = 0; i < k; i++) ones += nums[i];', 'init'],
      ['best = k - ones;', 'init'],
      ['for (int i = k; i < n + k; i++) {'],
      ['    ones += nums[i % n] - nums[(i - k) % n];', 'slide'],
      ['    best = Math.min(best, k - ones);', 'slide'],
      ['}'],
      ['return best;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 16, min: 0, max: 1 });
    if (typeof a === 'string') return { error: a };
    const n = a.length;
    const k = a.filter((v) => v === 1).length;
    const out: Step[] = [];
    if (k === 0) return { steps: [{ tag: 'init', trace: ['There are no 1s → ', C(0), ' swaps.'], state: arr(a) }], result: '0' };
    const winMark = (start: number): ArrayState['mark'] => { const m: NonNullable<ArrayState['mark']> = {}; for (let j = 0; j < k; j++) { const idx = (start + j) % n; m[idx] = a[idx] ? 'good' : 'active'; } return m; };
    let ones = a.slice(0, k).reduce((p, q) => p + q, 0);
    let best = k - ones;
    out.push({ tag: 'init', trace: ['There are ', A(k), ' ones, so the final group is a window of size ', A(k), '. The first window has ', F(k - ones), ' zero(s) to swap out.'], state: arr(a, { mark: winMark(0), aggs: [ag('zeros in window', k - ones), ag('best', best, 'c')] }) });
    for (let i = k; i < n + k - 1; i++) {
      ones += a[i % n] - a[(i - k) % n];
      best = Math.min(best, k - ones);
      const start = i - k + 1;
      out.push({ tag: 'slide', trace: ['Window starting at ', A(start % n), start + k > n ? ' (wrapping around)' : '', ' has ', F(k - ones), ' zero(s). Fewest so far: ', C(best), '.'], state: arr(a, { mark: winMark(start % n), aggs: [ag('zeros in window', k - ones), ag('best', best, 'c')] }) });
    }
    out.push({ tag: 'ret', trace: ['Minimum swaps: ', C(best), '.'], state: arr(a, { aggs: [ag('answer', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'Each swap can move one 1 into the target block and one 0 out, so the swaps needed for a block equal the zeros inside it. Indexing with i % n lets the window wrap around the circular array without copying it.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

export const ccWindow: ProblemDef[] = [
  maxAverage,
  minRecolors,
  kBeauty,
  maxVowels,
  grumpyOwner,
  findAnagrams,
  repeatedDna,
  containsDupII,
  equalSubstring,
  maxErasure,
  productLessThanK,
  minOpsX,
  minSwapsII,
];
