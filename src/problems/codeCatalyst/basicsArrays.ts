// Code Catalyst — Practice Set 1: basic problem solving and two pointers.
import type { ArrayState, MatrixState, ProblemDef, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, fmt, fmtS, parseMatrix, parseStrList, parseWord, range } from './util';

/* ================= Reverse String ================= */
const reverseString: ProblemDef = {
  slug: 'reverse-string',
  title: 'Reverse String',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/reverse-string/',
  technique: 'Two pointers from both ends, swapping and walking inward until they meet.',
  widget: 'array',
  widgetTitle: 's (chars)',
  inputs: [{ key: 's', label: 's', defaultValue: '["h","e","l","l","o"]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void reverseString(vector<char>& s) {'),
      L('        int l = 0, r = s.size() - 1;', 'init'),
      L('        while (l < r) {', 'swap'),
      L('            swap(s[l], s[r]);', 'swap'),
      L('            l++; r--;', 'swap'),
      L('        }'),
      L('    }', 'done'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void reverseString(char[] s) {'),
      L('        int l = 0, r = s.length - 1;', 'init'),
      L('        while (l < r) {', 'swap'),
      L('            char t = s[l]; s[l] = s[r]; s[r] = t;', 'swap'),
      L('            l++; r--;', 'swap'),
      L('        }'),
      L('    }', 'done'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseStrList(values.s, 's', 16);
    if ('error' in parsed) return parsed;
    if (parsed.some((c) => c.length !== 1)) return { error: 'Each item must be a single character.' };
    const s = [...parsed];
    const out: Step[] = [];
    let l = 0;
    let r = s.length - 1;
    const fixed: Record<number, 'good'> = {};
    out.push({ tag: 'init', trace: ['Put ', A('l'), ' on the first char and ', A('r'), ' on the last.'], state: arr([...s], { ptrs: [{ name: 'l', i: l, c: 'a' }, { name: 'r', i: r, c: 'b' }] }) });
    while (l < r) {
      const a = s[l];
      const b = s[r];
      [s[l], s[r]] = [s[r], s[l]];
      fixed[l] = 'good';
      fixed[r] = 'good';
      out.push({ tag: 'swap', trace: ['Swap ', A(a), ' and ', A(b), ' — both are now in their final spots. Move the pointers inward.'], state: arr([...s], { mark: { ...fixed }, ptrs: [{ name: 'l', i: l, c: 'a' }, { name: 'r', i: r, c: 'b' }] }) });
      l++;
      r--;
    }
    out.push({ tag: 'done', trace: ['The pointers met, so every pair has been swapped: ', C(s.join('')), '.'], state: arr([...s], { mark: range(0, s.length - 1, 'final') }) });
    return { steps: out, result: fmtS(s) };
  },
  note: 'Reversing means the i-th char from the left trades places with the i-th from the right. Swapping pairs from the outside in does each trade exactly once, in place, with no extra array.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Remove Element ================= */
const removeElement: ProblemDef = {
  slug: 'remove-element',
  title: 'Remove Element',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/remove-element/',
  technique: 'A write pointer k copies forward every value that is not val; k ends as the new length.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [
    { key: 'nums', label: 'nums', defaultValue: '0, 1, 2, 2, 3, 0, 4, 2', wide: true },
    { key: 'val', label: 'val', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int removeElement(vector<int>& nums, int val) {'),
      L('        int k = 0;', 'init'),
      L('        for (int i = 0; i < nums.size(); i++) {'),
      L('            if (nums[i] != val)', 'keep', 'skip'),
      L('                nums[k++] = nums[i];', 'keep'),
      L('        }'),
      L('        return k;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int removeElement(int[] nums, int val) {'),
      L('        int k = 0;', 'init'),
      L('        for (int i = 0; i < nums.length; i++) {'),
      L('            if (nums[i] != val)', 'keep', 'skip'),
      L('                nums[k++] = nums[i];', 'keep'),
      L('        }'),
      L('        return k;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof nums === 'string') return { error: nums };
    const val = parseInt1(values.val, 'val');
    if (typeof val === 'string') return { error: val };
    const a = [...nums];
    let k = 0;
    const out: Step[] = [];
    const ptrs = (i: number): ArrayState['ptrs'] => [{ name: 'i', i, c: 'a' }, { name: 'k', i: Math.min(k, a.length - 1), c: 'b' }];
    out.push({ tag: 'init', trace: ['k marks where the next kept value goes. Everything left of k is the answer so far.'], state: arr([...a], { ptrs: ptrs(0), aggs: [ag('k', k, 'b')] }) });
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== val) {
        a[k] = a[i];
        out.push({ tag: 'keep', trace: [A(a[k]), ' is not ', String(val), ' — copy it to slot ', B(k), ' and move k.'], state: arr([...a], { mark: { ...range(0, k, 'good'), [i]: 'active' }, ptrs: ptrs(i), aggs: [ag('k', k + 1, 'b')] }) });
        k++;
      } else {
        out.push({ tag: 'skip', trace: [F(a[i]), ' equals val — skip it. k stays at ', B(k), '.'], state: arr([...a], { mark: { ...(k > 0 ? range(0, k - 1, 'good') : {}), [i]: 'dim' }, ptrs: ptrs(i), aggs: [ag('k', k, 'b')] }) });
      }
    }
    out.push({ tag: 'ret', trace: ['The first ', C(k), ' slots hold every value that is not ', String(val), '.'], state: arr([...a], { mark: k > 0 ? range(0, k - 1, 'final') : {}, aggs: [ag('k', k, 'c')] }) });
    return { steps: out, result: `${k}, nums = ${fmt([...a.slice(0, k), ...Array(a.length - k).fill('_')])}` };
  },
  note: 'The read pointer i sees every element once; the write pointer k only moves for keepers. Since k never passes i, a write can never overwrite something not yet read.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Is Subsequence ================= */
const isSubsequence: ProblemDef = {
  slug: 'is-subsequence',
  title: 'Is Subsequence',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/is-subsequence/',
  technique: 'Walk t once; advance a pointer in s every time the current chars match.',
  widget: 'array',
  widgetTitle: 't, with s matched in order',
  inputs: [
    { key: 's', label: 's', defaultValue: 'abc' },
    { key: 't', label: 't', defaultValue: 'ahbgdc' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isSubsequence(string s, string t) {'),
      L('        int i = 0;', 'init'),
      L('        for (int j = 0; j < t.size() && i < s.size(); j++) {'),
      L('            if (s[i] == t[j]) i++;', 'match', 'miss'),
      L('        }'),
      L('        return i == s.size();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isSubsequence(String s, String t) {'),
      L('        int i = 0;', 'init'),
      L('        for (int j = 0; j < t.length() && i < s.length(); j++) {'),
      L('            if (s.charAt(i) == t.charAt(j)) i++;', 'match', 'miss'),
      L('        }'),
      L('        return i == s.length();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = parseWord(values.s, 's', { min: 0, max: 10 });
    if (typeof s !== 'string') return s;
    const t = parseWord(values.t, 't', { max: 18 });
    if (typeof t !== 'string') return t;
    const tc = t.split('');
    let i = 0;
    const matched: Record<number, 'good'> = {};
    const out: Step[] = [];
    const aggs = () => [ag('s', s), ag('matched', s.slice(0, i) || '—', 'b')];
    out.push({ tag: 'init', trace: ['i points at the next char of s we still need: ', A(s[0] ?? '(none)'), '.'], state: arr(tc, { aggs: aggs() }) });
    for (let j = 0; j < tc.length && i < s.length; j++) {
      if (s[i] === tc[j]) {
        matched[j] = 'good';
        i++;
        out.push({ tag: 'match', trace: ['t[', String(j), '] = ', B(tc[j]), ' is the char we need. Match it and look for ', A(s[i] ?? 'nothing more'), ' next.'], state: arr(tc, { mark: { ...matched }, ptrs: [{ name: 'j', i: j, c: 'a' }], aggs: aggs() }) });
      } else {
        out.push({ tag: 'miss', trace: ['t[', String(j), '] = ', F(tc[j]), ' is not ', A(s[i]), ' — skip it.'], state: arr(tc, { mark: { ...matched, [j]: 'dim' }, ptrs: [{ name: 'j', i: j, c: 'a' }], aggs: aggs() }) });
      }
    }
    const ok = i === s.length;
    out.push({ tag: 'ret', trace: ok ? ['All of s was found in order → ', C('true'), '.'] : ['Ran out of t with ', F(s.slice(i)), ' still unmatched → ', C('false'), '.'], state: arr(tc, { mark: matched, aggs: aggs() }) });
    return { steps: out, result: ok ? 'true' : 'false' };
  },
  note: 'Matching each char of s at its earliest possible spot in t is always safe — taking a later spot could only leave less of t for the rest of s. That greedy choice is why one pass is enough.',
  complexity: { time: 'O(|t|)', space: 'O(1)' },
};

/* ================= Duplicate Zeros ================= */
const duplicateZeros: ProblemDef = {
  slug: 'duplicate-zeros',
  title: 'Duplicate Zeros',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/duplicate-zeros/',
  technique: 'Count the zeros, then fill from the back so nothing is overwritten before it is copied.',
  widget: 'array',
  widgetTitle: 'arr',
  inputs: [{ key: 'arr', label: 'arr', defaultValue: '1, 0, 2, 3, 0, 4, 5, 0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void duplicateZeros(vector<int>& arr) {'),
      L('        int n = arr.size(), zeros = 0;'),
      L('        for (int x : arr) if (x == 0) zeros++;', 'count'),
      L('        for (int i = n - 1, j = n + zeros - 1; i >= 0; i--, j--) {'),
      L('            if (j < n) arr[j] = arr[i];', 'copy'),
      L('            if (arr[i] == 0) {', 'zero'),
      L('                j--;', 'zero'),
      L('                if (j < n) arr[j] = 0;', 'zero'),
      L('            }'),
      L('        }'),
      L('    }', 'done'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void duplicateZeros(int[] arr) {'),
      L('        int n = arr.length, zeros = 0;'),
      L('        for (int x : arr) if (x == 0) zeros++;', 'count'),
      L('        for (int i = n - 1, j = n + zeros - 1; i >= 0; i--, j--) {'),
      L('            if (j < n) arr[j] = arr[i];', 'copy'),
      L('            if (arr[i] == 0) {', 'zero'),
      L('                j--;', 'zero'),
      L('                if (j < n) arr[j] = 0;', 'zero'),
      L('            }'),
      L('        }'),
      L('    }', 'done'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.arr, { maxLen: 14, min: 0 });
    if (typeof parsed === 'string') return { error: parsed };
    const a = [...parsed];
    const n = a.length;
    const zeros = a.filter((x) => x === 0).length;
    const out: Step[] = [];
    out.push({ tag: 'count', trace: ['There are ', A(zeros), ' zeros, so the "stretched" array would be ', A(n + zeros), ' long. Only the first ', B(n), ' slots survive.'], state: arr([...a], { aggs: [ag('zeros', zeros)] }) });
    const written: Record<number, 'good'> = {};
    for (let i = n - 1, j = n + zeros - 1; i >= 0; i--, j--) {
      const v = a[i];
      if (j < n) {
        a[j] = v;
        written[j] = 'good';
        out.push({ tag: 'copy', trace: ['Copy arr[', String(i), '] = ', A(v), ' to its stretched position ', B(j), '.'], state: arr([...a], { mark: { ...written, [i]: 'active' }, ptrs: [{ name: 'i', i, c: 'a' }, { name: 'j', i: j, c: 'b' }] }) });
      } else {
        out.push({ tag: 'copy', trace: ['arr[', String(i), '] = ', F(v), ' would land at ', F(j), ', past the end — it falls off.'], state: arr([...a], { mark: { ...written, [i]: 'dim' }, ptrs: [{ name: 'i', i, c: 'a' }] }) });
      }
      if (v === 0) {
        j--;
        if (j < n) {
          a[j] = 0;
          written[j] = 'good';
          out.push({ tag: 'zero', trace: ['It was a zero, so write its twin at ', B(j), ' too.'], state: arr([...a], { mark: { ...written }, ptrs: [{ name: 'i', i, c: 'a' }, { name: 'j', i: j, c: 'b' }] }) });
        }
      }
      if (out.length > MAX_STEPS) break;
    }
    out.push({ tag: 'done', trace: ['Done in place: ', C(fmt(a)), '.'], state: arr([...a], { mark: range(0, n - 1, 'final') }) });
    return { steps: out, result: fmt(a) };
  },
  note: 'Going left-to-right, each duplicated zero would overwrite a value you have not moved yet. Knowing the final shift (the zero count) lets you go right-to-left instead, where every destination is already safe to overwrite.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Remove Duplicates from Sorted Array II ================= */
const removeDupsII: ProblemDef = {
  slug: 'remove-duplicates-from-sorted-array-ii',
  title: 'Remove Duplicates from Sorted Array II',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/',
  technique: 'Keep nums[i] only if it differs from the value two slots behind the write pointer.',
  widget: 'array',
  widgetTitle: 'nums (sorted)',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '0, 0, 1, 1, 1, 1, 2, 3, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int removeDuplicates(vector<int>& nums) {'),
      L('        int k = 0;', 'init'),
      L('        for (int x : nums) {'),
      L('            if (k < 2 || x != nums[k - 2])', 'keep', 'skip'),
      L('                nums[k++] = x;', 'keep'),
      L('        }'),
      L('        return k;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int removeDuplicates(int[] nums) {'),
      L('        int k = 0;', 'init'),
      L('        for (int x : nums) {'),
      L('            if (k < 2 || x != nums[k - 2])', 'keep', 'skip'),
      L('                nums[k++] = x;', 'keep'),
      L('        }'),
      L('        return k;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof parsed === 'string') return { error: parsed };
    for (let i = 1; i < parsed.length; i++) if (parsed[i] < parsed[i - 1]) return { error: 'nums must be sorted (non-decreasing).' };
    const a = [...parsed];
    let k = 0;
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['k is the write position. The first two values are always kept.'], state: arr([...a], { aggs: [ag('k', 0, 'b')] }) });
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      const ptrs: ArrayState['ptrs'] = [{ name: 'i', i, c: 'a' }, { name: 'k', i: Math.min(k, a.length - 1), c: 'b' }];
      if (k < 2 || x !== a[k - 2]) {
        const why = k < 2 ? 'one of the first two values' : `different from nums[k−2] = ${a[k - 2]}`;
        a[k] = x;
        out.push({ tag: 'keep', trace: [A(x), ' is ', why, ' — write it at ', B(k), '.'], state: arr([...a], { mark: { ...range(0, k, 'good'), [i]: 'active' }, ptrs, aggs: [ag('k', k + 1, 'b')] }) });
        k++;
      } else {
        out.push({ tag: 'skip', trace: [F(x), ' equals nums[k−2] = ', F(a[k - 2]), ', so two copies are already kept — skip.'], state: arr([...a], { mark: { ...range(0, k - 1, 'good'), [i]: 'dim' }, ptrs, aggs: [ag('k', k, 'b')] }) });
      }
    }
    out.push({ tag: 'ret', trace: ['Kept ', C(k), ' values, each appearing at most twice.'], state: arr([...a], { mark: range(0, k - 1, 'final'), aggs: [ag('k', k, 'c')] }) });
    return { steps: out, result: `${k}, nums = ${fmt([...a.slice(0, k), ...Array(a.length - k).fill('_')])}` };
  },
  note: 'Because the array is sorted, if x equals the value two kept slots back, the two kept slots between are both x already. Comparing against nums[k−2] is the whole "at most twice" rule in one check — change 2 to any m for "at most m".',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= String Compression ================= */
const stringCompression: ProblemDef = {
  slug: 'string-compression',
  title: 'String Compression',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/string-compression/',
  technique: 'Read pointer finds each run; write pointer stores the char and, if the run is longer than 1, its count digits.',
  widget: 'array',
  widgetTitle: 'chars',
  inputs: [{ key: 'chars', label: 'chars', defaultValue: '["a","a","b","b","c","c","c"]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int compress(vector<char>& chars) {'),
      L('        int w = 0, i = 0, n = chars.size();', 'init'),
      L('        while (i < n) {'),
      L('            int j = i;', 'run'),
      L('            while (j < n && chars[j] == chars[i]) j++;', 'run'),
      L('            chars[w++] = chars[i];', 'write'),
      L('            if (j - i > 1)', 'count'),
      L('                for (char c : to_string(j - i)) chars[w++] = c;', 'count'),
      L('            i = j;'),
      L('        }'),
      L('        return w;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int compress(char[] chars) {'),
      L('        int w = 0, i = 0, n = chars.length;', 'init'),
      L('        while (i < n) {'),
      L('            int j = i;', 'run'),
      L('            while (j < n && chars[j] == chars[i]) j++;', 'run'),
      L('            chars[w++] = chars[i];', 'write'),
      L('            if (j - i > 1)', 'count'),
      L('                for (char c : String.valueOf(j - i).toCharArray()) chars[w++] = c;', 'count'),
      L('            i = j;'),
      L('        }'),
      L('        return w;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseStrList(values.chars, 'chars', 16);
    if ('error' in parsed) return parsed;
    if (parsed.some((c) => c.length !== 1)) return { error: 'Each item must be a single character.' };
    const a = [...parsed];
    const n = a.length;
    let w = 0;
    let i = 0;
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['w writes the compressed output over the front of the same array.'], state: arr([...a], { ptrs: [{ name: 'i', i: 0, c: 'a' }, { name: 'w', i: 0, c: 'b' }] }) });
    while (i < n) {
      let j = i;
      while (j < n && a[j] === a[i]) j++;
      const ch = a[i];
      const len = j - i;
      out.push({ tag: 'run', trace: ['A run of ', A(len), ' × ', A(`'${ch}'`), ' spans positions ', String(i), '–', String(j - 1), '.'], state: arr([...a], { window: [i, j - 1], mark: w > 0 ? range(0, w - 1, 'good') : {}, ptrs: [{ name: 'i', i, c: 'a' }, { name: 'w', i: Math.min(w, n - 1), c: 'b' }] }) });
      a[w++] = ch;
      out.push({ tag: 'write', trace: ['Write the char ', B(`'${ch}'`), '.'], state: arr([...a], { mark: range(0, w - 1, 'good'), ptrs: [{ name: 'w', i: Math.min(w, n - 1), c: 'b' }] }) });
      if (len > 1) {
        for (const d of String(len)) a[w++] = d;
        out.push({ tag: 'count', trace: ['The run is longer than 1, so write its count ', B(len), ' as separate digit chars.'], state: arr([...a], { mark: range(0, w - 1, 'good'), ptrs: [{ name: 'w', i: Math.min(w, n - 1), c: 'b' }] }) });
      }
      i = j;
    }
    out.push({ tag: 'ret', trace: ['The compressed form fills the first ', C(w), ' slots: ', C(a.slice(0, w).join('')), '.'], state: arr([...a], { mark: range(0, w - 1, 'final') }) });
    return { steps: out, result: String(w) };
  },
  note: 'A run of length L shrinks to 1 + digits(L) chars, which is never more than L. So the write pointer can never overtake the read pointer, and working in place is safe.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Longest Mountain in Array ================= */
const longestMountain: ProblemDef = {
  slug: 'longest-mountain-in-array',
  title: 'Longest Mountain in Array',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-mountain-in-array/',
  technique: 'From each start, climb while increasing, then descend while decreasing; a valid mountain needs both parts.',
  widget: 'array',
  widgetTitle: 'arr',
  inputs: [{ key: 'arr', label: 'arr', defaultValue: '2, 1, 4, 7, 3, 2, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestMountain(vector<int>& arr) {'),
      L('        int n = arr.size(), best = 0, i = 0;'),
      L('        while (i < n) {'),
      L('            int start = i;', 'start'),
      L('            while (i + 1 < n && arr[i] < arr[i + 1]) i++;', 'up'),
      L('            int peak = i;', 'up'),
      L('            while (i + 1 < n && arr[i] > arr[i + 1]) i++;', 'down'),
      L('            if (peak > start && i > peak)', 'valid', 'flat'),
      L('                best = max(best, i - start + 1);', 'valid'),
      L('            if (i == start) i++;', 'flat'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestMountain(int[] arr) {'),
      L('        int n = arr.length, best = 0, i = 0;'),
      L('        while (i < n) {'),
      L('            int start = i;', 'start'),
      L('            while (i + 1 < n && arr[i] < arr[i + 1]) i++;', 'up'),
      L('            int peak = i;', 'up'),
      L('            while (i + 1 < n && arr[i] > arr[i + 1]) i++;', 'down'),
      L('            if (peak > start && i > peak)', 'valid', 'flat'),
      L('                best = Math.max(best, i - start + 1);', 'valid'),
      L('            if (i == start) i++;', 'flat'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.arr, { maxLen: 16 });
    if (typeof a === 'string') return { error: a };
    const n = a.length;
    let best = 0;
    let i = 0;
    const out: Step[] = [];
    const st = (o: Omit<ArrayState, 'arr'>) => arr(a, { bars: true, ...o, aggs: [ag('best', best, 'c')] });
    while (i < n && out.length < MAX_STEPS) {
      const start = i;
      out.push({ tag: 'start', trace: ['Try a mountain starting at index ', A(start), ' (value ', A(a[start]), ').'], state: st({ ptrs: [{ name: 'start', i: start, c: 'a' }] }) });
      while (i + 1 < n && a[i] < a[i + 1]) i++;
      const peak = i;
      out.push({ tag: 'up', trace: peak > start ? ['Climb while values rise: up to the peak ', B(a[peak]), ' at index ', String(peak), '.'] : ['No rise from here — ', F('no uphill'), '.'], state: st({ window: [start, peak], ptrs: [{ name: 'peak', i: peak, c: 'b' }] }) });
      while (i + 1 < n && a[i] > a[i + 1]) i++;
      if (peak > start && i > peak) {
        const len = i - start + 1;
        best = Math.max(best, len);
        out.push({ tag: 'valid', trace: ['Then descend down to index ', String(i), '. Up and down both exist → a mountain of length ', B(len), '. Best = ', C(best), '.'], state: st({ window: [start, i], mark: { [peak]: 'good' } }) });
      } else {
        out.push({ tag: 'flat', trace: ['Missing ', F(peak > start ? 'a downhill' : 'an uphill'), ' — not a mountain.'], state: st({ window: [start, i], mark: range(start, i, 'dim') }) });
      }
      if (i === start) i++;
    }
    out.push({ tag: 'ret', trace: ['The longest mountain has length ', C(best), '.'], state: st({}) });
    return { steps: out, result: String(best) };
  },
  note: 'Each mountain ends where the next one could begin, so the scan restarts from the bottom of the last descent instead of the next index. Every element is climbed or descended over once, giving one linear pass.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Max Consecutive Ones ================= */
const maxConsecutiveOnes: ProblemDef = {
  slug: 'max-consecutive-ones',
  title: 'Max Consecutive Ones',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/max-consecutive-ones/',
  technique: 'Keep a running streak of 1s that resets on every 0, and remember the longest streak seen.',
  widget: 'array',
  widgetTitle: 'nums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '1, 1, 0, 1, 1, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findMaxConsecutiveOnes(vector<int>& nums) {'),
      L('        int cur = 0, best = 0;'),
      L('        for (int x : nums) {'),
      L('            if (x == 1) best = max(best, ++cur);', 'one'),
      L('            else cur = 0;', 'zero'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findMaxConsecutiveOnes(int[] nums) {'),
      L('        int cur = 0, best = 0;'),
      L('        for (int x : nums) {'),
      L('            if (x == 1) best = Math.max(best, ++cur);', 'one'),
      L('            else cur = 0;', 'zero'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 20, min: 0, max: 1 });
    if (typeof a === 'string') return { error: a };
    let cur = 0;
    let best = 0;
    const out: Step[] = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] === 1) {
        cur++;
        best = Math.max(best, cur);
        out.push({ tag: 'one', trace: ['A 1 extends the streak to ', A(cur), '. Best so far: ', B(best), '.'], state: arr(a, { window: [i - cur + 1, i], ptrs: [{ name: 'i', i, c: 'a' }], aggs: [ag('streak', cur), ag('best', best, 'b')] }) });
      } else {
        cur = 0;
        out.push({ tag: 'zero', trace: ['A ', F(0), ' breaks the streak — reset it to 0.'], state: arr(a, { mark: { [i]: 'dim' }, ptrs: [{ name: 'i', i, c: 'a' }], aggs: [ag('streak', 0), ag('best', best, 'b')] }) });
      }
    }
    out.push({ tag: 'ret', trace: ['Longest run of 1s: ', C(best), '.'], state: arr(a, { aggs: [ag('best', best, 'c')] }) });
    return { steps: out, result: String(best) };
  },
  note: 'Any run of 1s ends at some index, and the streak counter holds exactly the length of the run ending at the current index. Taking the max over all indices therefore sees every run once.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Running Sum of 1d Array ================= */
const runningSum: ProblemDef = {
  slug: 'running-sum-of-1d-array',
  title: 'Running Sum of 1d Array',
  category: 'Prefix Sum',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/running-sum-of-1d-array/',
  technique: 'Each slot adds the running total before it: nums[i] += nums[i − 1].',
  widget: 'array',
  widgetTitle: 'nums → running sums',
  inputs: [{ key: 'nums', label: 'nums', defaultValue: '1, 2, 3, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> runningSum(vector<int>& nums) {'),
      L('        for (int i = 1; i < nums.size(); i++)'),
      L('            nums[i] += nums[i - 1];', 'add'),
      L('        return nums;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] runningSum(int[] nums) {'),
      L('        for (int i = 1; i < nums.length; i++)'),
      L('            nums[i] += nums[i - 1];', 'add'),
      L('        return nums;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof parsed === 'string') return { error: parsed };
    const a = [...parsed];
    const out: Step[] = [];
    for (let i = 1; i < a.length; i++) {
      const before = a[i];
      a[i] += a[i - 1];
      out.push({ tag: 'add', trace: ['nums[', String(i), '] = ', A(before), ' + running total ', B(a[i - 1]), ' = ', C(a[i]), '.'], state: arr([...a], { mark: { ...range(0, i - 1, 'good'), [i]: 'active' } }) });
    }
    out.push({ tag: 'ret', trace: ['Every slot now holds the sum of everything up to it: ', C(fmt(a)), '.'], state: arr([...a], { mark: range(0, a.length - 1, 'final') }) });
    return { steps: out, result: fmt(a) };
  },
  note: 'The sum up to i is the sum up to i − 1 plus one more number, so each prefix sum costs one addition. This array is the "prefix sum" that later lets any range sum be answered with a single subtraction.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Richest Customer Wealth ================= */
const richestCustomer: ProblemDef = {
  slug: 'richest-customer-wealth',
  title: 'Richest Customer Wealth',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/richest-customer-wealth/',
  technique: 'Sum each row and keep the largest row sum.',
  widget: 'matrix',
  widgetTitle: 'accounts (customer × bank)',
  inputs: [{ key: 'accounts', label: 'accounts', defaultValue: '[[1,5],[7,3],[3,5]]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maximumWealth(vector<vector<int>>& accounts) {'),
      L('        int best = 0;'),
      L('        for (auto& row : accounts) {'),
      L('            int sum = 0;'),
      L('            for (int x : row) sum += x;', 'row'),
      L('            best = max(best, sum);', 'row'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maximumWealth(int[][] accounts) {'),
      L('        int best = 0;'),
      L('        for (int[] row : accounts) {'),
      L('            int sum = 0;'),
      L('            for (int x : row) sum += x;', 'row'),
      L('            best = Math.max(best, sum);', 'row'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseMatrix(values.accounts, 'accounts', { maxR: 8, maxC: 8, rect: true, min: 0 });
    if ('error' in g) return g;
    let best = 0;
    let bestRow = -1;
    const sums: (number | string)[] = g.map(() => '');
    const out: Step[] = [];
    const st = (mark: MatrixState['mark']): MatrixState => ({
      grid: g.map((r, i) => [...r, sums[i]]),
      rowLabels: g.map((_, i) => `cust ${i}`),
      colLabels: [...g[0].map((_, j) => `bank ${j}`), 'total'],
      mark,
      aggs: [ag('richest', best, 'c')],
    });
    for (let i = 0; i < g.length; i++) {
      const sum = g[i].reduce((x, y) => x + y, 0);
      sums[i] = sum;
      const mark: MatrixState['mark'] = {};
      g[i].forEach((_, j) => (mark[`${i},${j}`] = 'active'));
      if (sum > best) { best = sum; bestRow = i; }
      mark[`${i},${g[0].length}`] = bestRow === i ? 'good' : 'dim';
      out.push({ tag: 'row', trace: ['Customer ', A(i), ' has ', g[i].join(' + '), ' = ', A(sum), '. Richest so far: ', B(best), '.'], state: st(mark) });
    }
    out.push({ tag: 'ret', trace: ['The richest customer has ', C(best), '.'], state: st({ [`${bestRow},${g[0].length}`]: 'final' }) });
    return { steps: out, result: String(best) };
  },
  note: 'Wealth is a row sum, so the answer is just the biggest row sum. Every cell is read once — there is nothing to gain from being clever here, which is the point of a warm-up.',
  complexity: { time: 'O(m·n)', space: 'O(1)' },
};

/* ================= Defanging an IP Address ================= */
const defangIp: ProblemDef = {
  slug: 'defanging-an-ip-address',
  title: 'Defanging an IP Address',
  category: 'Strings',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/defanging-an-ip-address/',
  technique: 'Build a new string, copying each char but writing "[.]" in place of every ".".',
  widget: 'array',
  widgetTitle: 'address',
  inputs: [{ key: 'address', label: 'address', defaultValue: '1.1.1.1' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string defangIPaddr(string address) {'),
      L('        string res;'),
      L('        for (char c : address) {'),
      L('            if (c == \'.\') res += "[.]";', 'dot'),
      L('            else res += c;', 'char'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String defangIPaddr(String address) {'),
      L('        StringBuilder res = new StringBuilder();'),
      L('        for (char c : address.toCharArray()) {'),
      L('            if (c == \'.\') res.append("[.]");', 'dot'),
      L('            else res.append(c);', 'char'),
      L('        }'),
      L('        return res.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = parseWord(values.address, 'address', { max: 15, re: /^[0-9.]+$/, reMsg: 'Use digits and dots only, like 255.100.50.0.' });
    if (typeof s !== 'string') return s;
    const cs = s.split('');
    let res = '';
    const out: Step[] = [];
    cs.forEach((c, i) => {
      if (c === '.') {
        res += '[.]';
        out.push({ tag: 'dot', trace: ['A ', A('.'), ' — write ', B('[.]'), ' instead.'], state: arr(cs, { mark: { [i]: 'active' }, aggs: [ag('result', res, 'b')] }) });
      } else {
        res += c;
        out.push({ tag: 'char', trace: ['Copy ', A(c), ' as is.'], state: arr(cs, { mark: { [i]: 'good' }, aggs: [ag('result', res, 'b')] }) });
      }
    });
    out.push({ tag: 'ret', trace: ['Defanged: ', C(res), '.'], state: arr(cs, { aggs: [ag('result', res, 'c')] }) });
    return { steps: out, result: `"${res}"` };
  },
  note: 'Replacing one char with three changes every later position, so editing in place would mean shifting. Appending to a fresh builder sidesteps that and stays linear.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const ccBasicsArrays: ProblemDef[] = [
  reverseString,
  removeElement,
  isSubsequence,
  duplicateZeros,
  removeDupsII,
  stringCompression,
  longestMountain,
  maxConsecutiveOnes,
  runningSum,
  richestCustomer,
  defangIp,
];
