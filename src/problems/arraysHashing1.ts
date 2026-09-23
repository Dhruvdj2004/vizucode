// Arrays & Hashing, part 1.
import type { ArrayState, ListState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 1. Two Sum ================= */
const twoSum: ProblemDef = {
  slug: 'two-sum',
  title: 'Two Sum',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/two-sum/',
  technique: 'One pass with a hash map: for each number, look up the complement you still need.',
  widget: 'array',
  widgetTitle: 'Array & seen-map',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '2, 7, 11, 15', wide: true },
    { key: 'target', label: 'Target', defaultValue: '9' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> twoSum(vector<int>& nums, int target) {'),
      L('        unordered_map<int, int> seen;', 'init'),
      L('        for (int i = 0; i < nums.size(); i++) {', 'loop'),
      L('            int need = target - nums[i];', 'need'),
      L('            if (seen.count(need))', 'need', 'found'),
      L('                return {seen[need], i};', 'found'),
      L('            seen[nums[i]] = i;', 'store'),
      L('        }'),
      L('        return {};', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] twoSum(int[] nums, int target) {'),
      L('        Map<Integer, Integer> seen = new HashMap<>();', 'init'),
      L('        for (int i = 0; i < nums.length; i++) {', 'loop'),
      L('            int need = target - nums[i];', 'need'),
      L('            if (seen.containsKey(need))', 'need', 'found'),
      L('                return new int[]{seen.get(need), i};', 'found'),
      L('            seen.put(nums[i], i);', 'store'),
      L('        }'),
      L('        return new int[]{};', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const seen = new Map<number, number>();
    const fmtMap = () =>
      seen.size === 0 ? '{}' : `{ ${[...seen.entries()].map(([v, i]) => `${v}→${i}`).join(', ')} }`;
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'seen', value: fmtMap(), c: 'b' },
        { label: 'target', value: String(target), c: 'c' },
      ],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Walk the array once, remembering every value\'s index in a hash map ', B('seen'), '.'],
      state: st(0),
    });
    let ans: [number, number] | null = null;
    for (let i = 0; i < arr.length && !ans; i++) {
      const need = target - arr[i];
      steps.push({
        tag: 'need',
        trace: ['At i = ', A(i), ': nums[i] = ', A(arr[i]), ', so we need ', C(need), ' to complete the pair. Is it in the map?'],
        state: st(i, { mark: { [i]: 'active' } }),
      });
      if (seen.has(need)) {
        ans = [seen.get(need)!, i];
        steps.push({
          tag: 'found',
          trace: ['Yes — ', B(need), ' was stored at index ', B(seen.get(need)!), '. Return ', C(`[${ans[0]}, ${ans[1]}]`), '.'],
          state: st(i, { mark: { [ans[0]]: 'final', [i]: 'final' } }),
        });
      } else {
        seen.set(arr[i], i);
        steps.push({
          tag: 'store',
          trace: ['Not seen yet — store ', A(arr[i]), ' → ', A(i), ' and move on.'],
          state: st(i, { mark: { [i]: 'active' } }),
        });
      }
    }
    if (!ans) {
      steps.push({ tag: 'none', trace: ['No pair sums to ', C(target), '.'], state: st(arr.length) });
    }
    return { steps, result: ans ? `[${ans[0]}, ${ans[1]}]` : 'no pair', resultDetail: ans ? `nums[${ans[0]}] + nums[${ans[1]}] = ${target}` : undefined };
  },
  note: 'Instead of asking "which pair sums to target?" (O(n²)), each element asks "has my complement already walked past?" — a hash map answers that in O(1), and every pair is still considered exactly once.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Brute force',
    technique: 'Try every pair (i, j) with two nested loops until one sums to the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> twoSum(vector<int>& nums, int target) {'),
        L('        int n = nums.size();', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = i + 1; j < n; j++) {', 'inner'),
        L('                if (nums[i] + nums[j] == target)', 'test', 'found'),
        L('                    return {i, j};', 'found'),
        L('            }'),
        L('        }'),
        L('        return {};', 'none'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] twoSum(int[] nums, int target) {'),
        L('        int n = nums.length;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = i + 1; j < n; j++) {', 'inner'),
        L('                if (nums[i] + nums[j] == target)', 'test', 'found'),
        L('                    return new int[]{i, j};', 'found'),
        L('            }'),
        L('        }'),
        L('        return new int[]{};', 'none'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };

      const steps: Step[] = [];
      const st = (i: number, j: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: [
          ...(i < arr.length ? [{ name: 'i', i, c: 'b' as const }] : []),
          ...(j < arr.length ? [{ name: 'j', i: j, c: 'a' as const }] : []),
        ],
        aggs: [{ label: 'target', value: String(target), c: 'c' }],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['No cleverness: test ', A('every pair'), ' (i, j) with i < j until one sums to ', C(target), '.'],
        state: st(0, 1),
      });
      let ans: [number, number] | null = null;
      let tried = 0;
      outer: for (let i = 0; i < arr.length; i++) {
        steps.push({
          tag: 'outer',
          trace: ['Fix ', B(arr[i]), ' at index ', B(i), ' and pair it against everything to its right.'],
          state: st(i, i + 1, { mark: { [i]: 'good' } }),
        });
        for (let j = i + 1; j < arr.length; j++) {
          tried++;
          const sum = arr[i] + arr[j];
          if (sum === target) {
            ans = [i, j];
            steps.push({
              tag: 'found',
              trace: [B(arr[i]), ' + ', A(arr[j]), ' = ', C(sum), ' — match after ', C(tried), ' pair checks. Return ', C(`[${i}, ${j}]`), '.'],
              state: st(i, j, { mark: { [i]: 'final', [j]: 'final' } }),
            });
            break outer;
          }
          steps.push({
            tag: 'test',
            trace: [B(arr[i]), ' + ', A(arr[j]), ' = ', F(sum), ' ≠ ', C(target), ' — try the next j.'],
            state: st(i, j, { mark: { [i]: 'good', [j]: 'active' } }),
          });
        }
      }
      if (!ans) {
        steps.push({
          tag: 'none',
          trace: ['All ', C(tried), ' pairs checked — none sums to ', C(target), '.'],
          state: st(arr.length, arr.length),
        });
      }
      return {
        steps,
        result: ans ? `[${ans[0]}, ${ans[1]}]` : 'no pair',
        resultDetail: ans ? `nums[${ans[0]}] + nums[${ans[1]}] = ${target}` : undefined,
      };
    },
    note: 'Correct but wasteful: each element is compared with every later element, so the work grows with n². The hash-map solution replaces the inner loop with a single O(1) lookup for the complement.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 2. Contains Duplicate ================= */
const containsDuplicate: ProblemDef = {
  slug: 'contains-duplicate',
  title: 'Contains Duplicate',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/contains-duplicate/',
  technique: 'A hash set catches the first value that appears twice.',
  widget: 'array',
  widgetTitle: 'Array & seen-set',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 2, 3, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool containsDuplicate(vector<int>& nums) {'),
      L('        unordered_set<int> seen;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (seen.count(x))', 'check', 'dup'),
      L('                return true;', 'dup'),
      L('            seen.insert(x);', 'store'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean containsDuplicate(int[] nums) {'),
      L('        Set<Integer> seen = new HashSet<>();', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (seen.contains(x))', 'check', 'dup'),
      L('                return true;', 'dup'),
      L('            seen.add(x);', 'store'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const steps: Step[] = [];
    const seen = new Set<number>();
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'seen', value: `{ ${[...seen].join(', ')} }`, c: 'b' }],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Scan left to right, collecting every value into a set ', B('seen'), '.'], state: st(0) });
    let dup: number | null = null;
    let dupAt = -1;
    for (let i = 0; i < arr.length; i++) {
      if (seen.has(arr[i])) {
        dup = arr[i];
        dupAt = i;
        steps.push({
          tag: 'dup',
          trace: [A(arr[i]), ' is already in the set — duplicate found. Return ', C('true'), '.'],
          state: st(i, { mark: { [i]: 'final', [arr.indexOf(arr[i])]: 'final' } }),
        });
        break;
      }
      seen.add(arr[i]);
      steps.push({
        tag: 'store',
        trace: [A(arr[i]), ' is new — add it to the set.'],
        state: st(i, { mark: { [i]: 'active' } }),
      });
    }
    if (dup === null) {
      steps.push({ tag: 'ret', trace: ['Reached the end with no repeats — return ', C('false'), '.'], state: st(arr.length) });
    }
    return { steps, result: dup === null ? 'false' : 'true', resultDetail: dup === null ? 'all values distinct' : `${dup} appears again at index ${dupAt}` };
  },
  note: 'A set gives O(1) membership checks, so "have I seen this before?" costs nothing per element — the sort-based alternative costs O(n log n) and rearranges the input.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Sorting',
    technique: 'Sort a copy of the array — any duplicates must then sit next to each other.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool containsDuplicate(vector<int>& nums) {'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        for (int i = 1; i < nums.size(); i++) {', 'loop'),
        L('            if (nums[i] == nums[i - 1])', 'check', 'dup'),
        L('                return true;', 'dup'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean containsDuplicate(int[] nums) {'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        for (int i = 1; i < nums.length; i++) {', 'loop'),
        L('            if (nums[i] == nums[i - 1])', 'check', 'dup'),
        L('                return true;', 'dup'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums);
      if (typeof input === 'string') return { error: input };
      const arr = [...input].sort((a, b) => a - b);
      const steps: Step[] = [];
      const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: i > 0 && i < arr.length ? [{ name: 'i-1', i: i - 1, c: 'b' }, { name: 'i', i, c: 'a' }] : [],
        ...extra,
      });

      steps.push({
        tag: 'sort',
        trace: ['Sort the array — equal values are now ', A('neighbours'), '.'],
        state: { arr },
      });
      let dupAt = -1;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i - 1]) {
          dupAt = i;
          steps.push({
            tag: 'dup',
            trace: [A(arr[i]), ' equals its left neighbour — duplicate found. Return ', C('true'), '.'],
            state: st(i, { mark: { [i]: 'final', [i - 1]: 'final' } }),
          });
          break;
        }
        steps.push({
          tag: 'check',
          trace: ['Compare ', B(arr[i - 1]), ' and ', A(arr[i]), ' — different, keep going.'],
          state: st(i, { mark: { [i - 1]: 'good', [i]: 'active' } }),
        });
      }
      if (dupAt < 0) {
        steps.push({ tag: 'ret', trace: ['No neighbours match — return ', C('false'), '.'], state: { arr } });
      }
      return {
        steps,
        result: dupAt < 0 ? 'false' : 'true',
        resultDetail: dupAt < 0 ? 'all values distinct' : `${arr[dupAt]} appears twice`,
      };
    },
    note: 'No extra memory, but sorting costs O(n log n) and reorders the input. The hash set finishes in O(n) at the price of O(n) space — a classic time-versus-space trade.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
  },
};

/* ================= 3. Valid Anagram ================= */
const validAnagram: ProblemDef = {
  slug: 'valid-anagram',
  title: 'Valid Anagram',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/valid-anagram/',
  technique: 'Count letters up in s and down in t — anagrams cancel to all zeroes.',
  widget: 'matrix',
  widgetTitle: 'Letter counts',
  inputs: [
    { key: 's', label: 'String s', defaultValue: 'anagram' },
    { key: 't', label: 'String t', defaultValue: 'nagaram' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isAnagram(string s, string t) {'),
      L('        if (s.size() != t.size()) return false;', 'len'),
      L('        int count[26] = {0};', 'init'),
      L('        for (char c : s) count[c - \'a\']++;', 'up'),
      L('        for (char c : t) {', 'down'),
      L('            if (--count[c - \'a\'] < 0)', 'down', 'neg'),
      L('                return false;', 'neg'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isAnagram(String s, String t) {'),
      L('        if (s.length() != t.length()) return false;', 'len'),
      L('        int[] count = new int[26];', 'init'),
      L('        for (char c : s.toCharArray()) count[c - \'a\']++;', 'up'),
      L('        for (char c : t.toCharArray()) {', 'down'),
      L('            if (--count[c - \'a\'] < 0)', 'down', 'neg'),
      L('                return false;', 'neg'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    const t = (values.t ?? '').trim().toLowerCase();
    if (!s || !t) return { error: 'Enter both strings.' };
    if (!/^[a-z]+$/.test(s + t)) return { error: 'Lowercase letters a–z only.' };
    if (s.length > 12 || t.length > 12) return { error: 'Keep each string to at most 12 characters.' };

    const letters = [...new Set((s + t).split(''))].sort();
    const count = new Map<string, number>(letters.map((c) => [c, 0]));
    const steps: Step[] = [];
    const st = (hl?: string, extra?: { c?: 'active' | 'good' | 'final' | 'dim' }) => ({
      grid: [letters.map((c) => count.get(c) ?? 0)],
      colLabels: letters,
      rowLabels: ['count'],
      mark: hl ? { [`0,${letters.indexOf(hl)}`]: extra?.c ?? ('active' as const) } : {},
    });

    if (s.length !== t.length) {
      steps.push({
        tag: 'len',
        trace: ['Lengths differ (', F(s.length), ' vs ', F(t.length), ') — they cannot be anagrams. Return ', C('false'), '.'],
        state: st(),
      });
      return { steps, result: 'false', resultDetail: 'different lengths' };
    }
    steps.push({ tag: 'init', trace: ['Same length — tally letters: ', A('+1'), ' for each char of s, ', F('−1'), ' for each char of t.'], state: st() });
    for (const c of s) {
      count.set(c, (count.get(c) ?? 0) + 1);
      steps.push({ tag: 'up', trace: ["s: '", A(c), "' → count[", A(c), '] = ', A(count.get(c)!), '.'], state: st(c) });
    }
    let ok = true;
    let bad = '';
    for (const c of t) {
      count.set(c, (count.get(c) ?? 0) - 1);
      if (count.get(c)! < 0) {
        ok = false;
        bad = c;
        steps.push({
          tag: 'neg',
          trace: ["t: '", F(c), "' drives its count below zero — t has more '", F(c), "' than s. Return ", C('false'), '.'],
          state: st(c, { c: 'dim' }),
        });
        break;
      }
      steps.push({ tag: 'down', trace: ["t: '", A(c), "' → count[", A(c), '] = ', A(count.get(c)!), '.'], state: st(c, { c: 'good' }) });
    }
    if (ok) {
      steps.push({ tag: 'ret', trace: ['Every count cancelled to ', B(0), ' — the strings are anagrams. Return ', C('true'), '.'], state: st() });
    }
    return { steps, result: String(ok), resultDetail: ok ? 'letter multisets match' : `extra '${bad}' in t` };
  },
  note: 'Equal length plus "no letter ever goes negative" forces every count to end at exactly zero — so one array of 26 tallies replaces sorting both strings.',
  complexity: { time: 'O(n)', space: 'O(1) — 26 counters' },
  brute: {
    label: 'Sorting',
    technique: 'Sort both strings — anagrams become identical, so compare them position by position.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isAnagram(string s, string t) {'),
        L('        if (s.size() != t.size()) return false;', 'len'),
        L('        sort(s.begin(), s.end());', 'sort'),
        L('        sort(t.begin(), t.end());', 'sort'),
        L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
        L('            if (s[i] != t[i])', 'cmp', 'diff'),
        L('                return false;', 'diff'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isAnagram(String s, String t) {'),
        L('        if (s.length() != t.length()) return false;', 'len'),
        L('        char[] a = s.toCharArray(), b = t.toCharArray();', 'sort'),
        L('        Arrays.sort(a);', 'sort'),
        L('        Arrays.sort(b);', 'sort'),
        L('        for (int i = 0; i < a.length; i++) {', 'loop'),
        L('            if (a[i] != b[i])', 'cmp', 'diff'),
        L('                return false;', 'diff'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim().toLowerCase();
      const t = (values.t ?? '').trim().toLowerCase();
      if (!s || !t) return { error: 'Enter both strings.' };
      if (!/^[a-z]+$/.test(s + t)) return { error: 'Lowercase letters a–z only.' };
      if (s.length > 12 || t.length > 12) return { error: 'Keep each string to at most 12 characters.' };

      const steps: Step[] = [];
      const grid = (a: string, b: string) => [a.split(''), b.split('')];
      const st = (a: string, b: string, mark: Record<string, 'active' | 'good' | 'final' | 'dim'> = {}) => ({
        grid: grid(a, b),
        rowLabels: ['s', 't'],
        colLabels: Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i),
        mark,
      });

      if (s.length !== t.length) {
        steps.push({
          tag: 'len',
          trace: ['Lengths differ (', F(s.length), ' vs ', F(t.length), ') — they cannot be anagrams. Return ', C('false'), '.'],
          state: st(s, t),
        });
        return { steps, result: 'false', resultDetail: 'different lengths' };
      }
      const ss = s.split('').sort().join('');
      const ts = t.split('').sort().join('');
      steps.push({
        tag: 'sort',
        trace: ['Sort both strings: ', A(`"${s}" → "${ss}"`), ' and ', A(`"${t}" → "${ts}"`), '.'],
        state: st(ss, ts),
      });
      let bad = -1;
      for (let i = 0; i < ss.length; i++) {
        if (ss[i] !== ts[i]) {
          bad = i;
          steps.push({
            tag: 'diff',
            trace: ["Position ", F(i), ": '", F(ss[i]), "' ≠ '", F(ts[i]), "' — the sorted strings differ. Return ", C('false'), '.'],
            state: st(ss, ts, { [`0,${i}`]: 'dim', [`1,${i}`]: 'dim' }),
          });
          break;
        }
        steps.push({
          tag: 'cmp',
          trace: ['Position ', A(i), ": '", B(ss[i]), "' = '", B(ts[i]), "' — match."],
          state: st(ss, ts, { [`0,${i}`]: 'good', [`1,${i}`]: 'good' }),
        });
      }
      const ok = bad < 0;
      if (ok) {
        steps.push({ tag: 'ret', trace: ['Sorted strings are identical — return ', C('true'), '.'], state: st(ss, ts) });
      }
      return { steps, result: String(ok), resultDetail: ok ? 'sorted strings are equal' : `first mismatch at position ${bad}` };
    },
    note: 'Sorting puts every letter in a canonical order, so two strings are anagrams exactly when their sorted forms are equal. Simple, but O(n log n) — the counting solution needs only one linear pass.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  },
};

/* ================= 4. Group Anagrams ================= */
const groupAnagrams: ProblemDef = {
  slug: 'group-anagrams',
  title: 'Group Anagrams',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/group-anagrams/',
  technique: 'Hash each word by its sorted letters — anagrams collide into the same bucket.',
  widget: 'list',
  widgetTitle: 'Buckets by canonical key',
  inputs: [{ key: 'strs', label: 'Words (comma separated)', defaultValue: 'eat, tea, tan, ate, nat, bat', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<string>> groupAnagrams(vector<string>& strs) {'),
      L('        unordered_map<string, vector<string>> groups;', 'init'),
      L('        for (string& s : strs) {', 'loop'),
      L('            string key = s;', 'key'),
      L('            sort(key.begin(), key.end());', 'key'),
      L('            groups[key].push_back(s);', 'add'),
      L('        }'),
      L('        vector<vector<string>> res;', 'ret'),
      L('        for (auto& [k, v] : groups) res.push_back(v);', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<String>> groupAnagrams(String[] strs) {'),
      L('        Map<String, List<String>> groups = new HashMap<>();', 'init'),
      L('        for (String s : strs) {', 'loop'),
      L('            char[] a = s.toCharArray();', 'key'),
      L('            Arrays.sort(a);', 'key'),
      L('            String key = new String(a);', 'key'),
      L('            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);', 'add'),
      L('        }'),
      L('        return new ArrayList<>(groups.values());', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const words = (values.strs ?? '')
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0) return { error: 'Enter at least one word.' };
    if (words.length > 12) return { error: 'Keep it to at most 12 words.' };
    if (!words.every((w) => /^[a-z]+$/.test(w))) return { error: 'Lowercase letters a–z only.' };

    const steps: Step[] = [];
    const groups = new Map<string, string[]>();
    const chains = (activeKey?: string, activeWord?: string) => ({
      chains: [...groups.entries()].map(([k, ws]) => ({
        label: `"${k}"`,
        items: ws.map((w) => ({
          v: w,
          mark: k === activeKey && w === activeWord ? ('active' as const) : k === activeKey ? ('win' as const) : undefined,
        })),
        broken: true,
      })),
    });

    steps.push({ tag: 'init', trace: ['Each word will be filed under its ', A('sorted letters'), ' — the canonical key all its anagrams share.'], state: chains() });
    for (const w of words) {
      const key = w.split('').sort().join('');
      steps.push({
        tag: 'key',
        trace: ['"', A(w), '" sorts to key "', A(key), '".'],
        state: chains(groups.has(key) ? key : undefined),
      });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(w);
      steps.push({
        tag: 'add',
        trace: ['Drop "', A(w), '" into bucket "', B(key), '" — it now holds ', B(groups.get(key)!.length), ' word(s).'],
        state: chains(key, w),
      });
    }
    const res = [...groups.values()];
    steps.push({
      tag: 'ret',
      trace: ['All words filed — ', C(res.length), ' anagram group(s) emerge.'],
      state: chains(),
    });
    return {
      steps,
      result: `[${res.map((g) => `[${g.join(', ')}]`).join(', ')}]`,
      resultDetail: `${res.length} groups`,
    };
  },
  note: 'Anagrams are exactly the words that become identical when their letters are sorted — so the sorted word is a perfect hash key: no pairwise comparisons, one map insert per word.',
  complexity: { time: 'O(n · k log k)', space: 'O(n · k)' },
  brute: {
    label: 'Brute force',
    technique: 'Compare each word against the first word of every existing group; start a new group if none match.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<string>> groupAnagrams(vector<string>& strs) {'),
        L('        vector<vector<string>> groups;', 'init'),
        L('        for (string& s : strs) {', 'loop'),
        L('            bool placed = false;', 'loop'),
        L('            for (auto& g : groups) {', 'scan'),
        L('                if (isAnagram(s, g[0])) {', 'scan', 'match'),
        L('                    g.push_back(s);', 'match'),
        L('                    placed = true;', 'match'),
        L('                    break;', 'match'),
        L('                }'),
        L('            }'),
        L('            if (!placed) groups.push_back({s});', 'new'),
        L('        }'),
        L('        return groups;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<String>> groupAnagrams(String[] strs) {'),
        L('        List<List<String>> groups = new ArrayList<>();', 'init'),
        L('        for (String s : strs) {', 'loop'),
        L('            boolean placed = false;', 'loop'),
        L('            for (List<String> g : groups) {', 'scan'),
        L('                if (isAnagram(s, g.get(0))) {', 'scan', 'match'),
        L('                    g.add(s);', 'match'),
        L('                    placed = true;', 'match'),
        L('                    break;', 'match'),
        L('                }'),
        L('            }'),
        L('            if (!placed) groups.add(new ArrayList<>(List.of(s)));', 'new'),
        L('        }'),
        L('        return groups;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const words = (values.strs ?? '')
        .split(',')
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      if (words.length === 0) return { error: 'Enter at least one word.' };
      if (words.length > 12) return { error: 'Keep it to at most 12 words.' };
      if (!words.every((w) => /^[a-z]+$/.test(w))) return { error: 'Lowercase letters a–z only.' };

      const steps: Step[] = [];
      const groups: string[][] = [];
      const canon = (w: string) => w.split('').sort().join('');
      const view = (activeGroup = -1, activeWord?: string, cmpGroup = -1): ListState => ({
        chains: groups.map((g, gi) => ({
          label: `group ${gi + 1}`,
          items: g.map((w, wi) => ({
            v: w,
            mark: gi === activeGroup && w === activeWord && wi === g.length - 1 ? ('active' as const) : gi === cmpGroup && wi === 0 ? ('src' as const) : undefined,
          })),
          broken: true,
        })),
      });

      steps.push({
        tag: 'init',
        trace: ['No hash key: every word is ', A('compared'), ' with the head word of each group already built.'],
        state: view(),
      });
      let comparisons = 0;
      for (const w of words) {
        steps.push({ tag: 'loop', trace: ['Next word: "', A(w), '". Where does it belong?'], state: view() });
        let placed = false;
        for (let gi = 0; gi < groups.length; gi++) {
          comparisons++;
          const head = groups[gi][0];
          const same = canon(w) === canon(head);
          steps.push({
            tag: 'scan',
            trace: ['Compare "', A(w), '" with group ', A(gi + 1), ' head "', A(head), '" — ', same ? B('anagrams') : F('not anagrams'), '.'],
            state: view(-1, undefined, gi),
          });
          if (same) {
            groups[gi].push(w);
            placed = true;
            steps.push({
              tag: 'match',
              trace: ['Match — add "', B(w), '" to group ', B(gi + 1), '.'],
              state: view(gi, w),
            });
            break;
          }
        }
        if (!placed) {
          groups.push([w]);
          steps.push({
            tag: 'new',
            trace: ['No group matched — "', A(w), '" starts group ', A(groups.length), '.'],
            state: view(groups.length - 1, w),
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['Done — ', C(groups.length), ' group(s) after ', C(comparisons), ' anagram comparisons.'],
        state: view(),
      });
      return {
        steps,
        result: `[${groups.map((g) => `[${g.join(', ')}]`).join(', ')}]`,
        resultDetail: `${groups.length} groups, ${comparisons} comparisons`,
      };
    },
    note: 'Each word may be checked against every group, and every check itself re-sorts letters, so the cost climbs as the number of groups grows. Hashing by the sorted key files each word in one lookup.',
    complexity: { time: 'O(n² · k log k)', space: 'O(n · k)' },
  },
};

/* ================= 5. Top K Frequent Elements ================= */
const topKFrequent: ProblemDef = {
  slug: 'top-k-frequent-elements',
  title: 'Top K Frequent Elements',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/top-k-frequent-elements/',
  technique: 'Bucket sort by frequency: a value with frequency f goes in bucket f — no heap needed.',
  widget: 'list',
  widgetTitle: 'Frequency buckets',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 1, 1, 2, 2, 3', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> topKFrequent(vector<int>& nums, int k) {'),
      L('        unordered_map<int, int> freq;', 'count'),
      L('        for (int x : nums) freq[x]++;', 'count'),
      L('        vector<vector<int>> buckets(nums.size() + 1);', 'bucket'),
      L('        for (auto& [val, f] : freq)', 'bucket'),
      L('            buckets[f].push_back(val);', 'bucket'),
      L('        vector<int> res;', 'collect'),
      L('        for (int f = nums.size(); f >= 1 && res.size() < k; f--)', 'collect'),
      L('            for (int val : buckets[f]) {', 'collect'),
      L('                res.push_back(val);', 'collect'),
      L('                if (res.size() == k) break;', 'collect'),
      L('            }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] topKFrequent(int[] nums, int k) {'),
      L('        Map<Integer, Integer> freq = new HashMap<>();', 'count'),
      L('        for (int x : nums) freq.merge(x, 1, Integer::sum);', 'count'),
      L('        List<List<Integer>> buckets = new ArrayList<>();', 'bucket'),
      L('        for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());', 'bucket'),
      L('        for (var e : freq.entrySet())', 'bucket'),
      L('            buckets.get(e.getValue()).add(e.getKey());', 'bucket'),
      L('        int[] res = new int[k]; int idx = 0;', 'collect'),
      L('        for (int f = nums.length; f >= 1 && idx < k; f--)', 'collect'),
      L('            for (int val : buckets.get(f)) {', 'collect'),
      L('                res[idx++] = val;', 'collect'),
      L('                if (idx == k) break;', 'collect'),
      L('            }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const freq = new Map<number, number>();
    for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
    if (k > freq.size) return { error: `k must be ≤ number of distinct values (${freq.size}).` };

    const steps: Step[] = [];
    const buckets = new Map<number, number[]>();
    const picked: number[] = [];
    const view = (extra?: { activeVal?: number; pickedSet?: Set<number> }) => ({
      chains: [
        {
          label: 'counts',
          items: [...freq.entries()].map(([v, f]) => ({
            v: `${v}×${f}`,
            mark: extra?.activeVal === v ? ('active' as const) : undefined,
          })),
          broken: true,
        },
        ...[...buckets.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([f, vals]) => ({
            label: `freq ${f}`,
            items: vals.map((v) => ({
              v,
              mark: extra?.pickedSet?.has(v) ? ('final' as const) : extra?.activeVal === v ? ('active' as const) : undefined,
            })),
            broken: true,
          })),
      ],
      aggs: [{ label: 'picked', value: `[${picked.join(', ')}]`, c: 'c' as const }],
    });

    steps.push({
      tag: 'count',
      trace: ['First pass: count occurrences — ', ...[...freq.entries()].flatMap(([v, f], i) => (i > 0 ? [', ', A(`${v}×${f}`)] : [A(`${v}×${f}`)])), '.'],
      state: view(),
    });
    for (const [v, f] of freq) {
      if (!buckets.has(f)) buckets.set(f, []);
      buckets.get(f)!.push(v);
      steps.push({
        tag: 'bucket',
        trace: ['Value ', A(v), ' appears ', A(f), ' time(s) → drop it in bucket ', A(f), '.'],
        state: view({ activeVal: v }),
      });
    }
    const pickedSet = new Set<number>();
    outer: for (let f = arr.length; f >= 1; f--) {
      for (const v of buckets.get(f) ?? []) {
        picked.push(v);
        pickedSet.add(v);
        steps.push({
          tag: 'collect',
          trace: ['Sweep buckets from the highest frequency down: take ', C(v), ' (freq ', B(f), ') — ', A(`${picked.length}/${k}`), ' collected.'],
          state: view({ pickedSet }),
        });
        if (picked.length === k) break outer;
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Done — the ', C(k), ' most frequent: ', C(`[${picked.join(', ')}]`), '.'],
      state: view({ pickedSet }),
    });
    return { steps, result: `[${picked.join(', ')}]`, resultDetail: `top ${k} by frequency` };
  },
  note: 'Frequencies are bounded by n, so they can be used directly as bucket indices — sweeping buckets from n downward yields the top-k in strict O(n), beating both sorting and a heap.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Sort by frequency',
    technique: 'Count each value, sort the (value, count) pairs by count descending, and take the first k.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> topKFrequent(vector<int>& nums, int k) {'),
        L('        unordered_map<int, int> freq;', 'count'),
        L('        for (int x : nums) freq[x]++;', 'count'),
        L('        vector<pair<int, int>> pairs(freq.begin(), freq.end());', 'sort'),
        L('        sort(pairs.begin(), pairs.end(),', 'sort'),
        L('             [](auto& a, auto& b) { return a.second > b.second; });', 'sort'),
        L('        vector<int> res;', 'collect'),
        L('        for (int i = 0; i < k; i++)', 'collect'),
        L('            res.push_back(pairs[i].first);', 'collect'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] topKFrequent(int[] nums, int k) {'),
        L('        Map<Integer, Integer> freq = new HashMap<>();', 'count'),
        L('        for (int x : nums) freq.merge(x, 1, Integer::sum);', 'count'),
        L('        List<Map.Entry<Integer, Integer>> pairs = new ArrayList<>(freq.entrySet());', 'sort'),
        L('        pairs.sort((a, b) -> b.getValue() - a.getValue());', 'sort'),
        L('        int[] res = new int[k];', 'collect'),
        L('        for (int i = 0; i < k; i++)', 'collect'),
        L('            res[i] = pairs.get(i).getKey();', 'collect'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      const freq = new Map<number, number>();
      for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
      if (k > freq.size) return { error: `k must be ≤ number of distinct values (${freq.size}).` };

      const steps: Step[] = [];
      const fmt = (pairs: [number, number][]) => pairs.map(([v, f]) => `${v}×${f}`);
      const view = (pairs: [number, number][], takenCount = 0, active = -1): ListState => ({
        chains: [
          {
            label: 'pairs',
            items: fmt(pairs).map((v, i) => ({
              v,
              mark: i < takenCount ? ('final' as const) : i === active ? ('active' as const) : undefined,
            })),
            broken: true,
          },
        ],
        aggs: [{ label: 'picked', value: `[${pairs.slice(0, takenCount).map((p) => p[0]).join(', ')}]`, c: 'c' }],
      });

      const pairs = [...freq.entries()] as [number, number][];
      steps.push({
        tag: 'count',
        trace: ['Count occurrences: ', ...pairs.flatMap(([v, f], i) => (i > 0 ? [', ', A(`${v}×${f}`)] : [A(`${v}×${f}`)])), '.'],
        state: view(pairs),
      });
      const sorted = [...pairs].sort((a, b) => b[1] - a[1]);
      steps.push({
        tag: 'sort',
        trace: ['Sort the pairs by count, ', A('highest first'), ' — an O(m log m) step over the m distinct values.'],
        state: view(sorted),
      });
      for (let i = 0; i < k; i++) {
        steps.push({
          tag: 'collect',
          trace: ['Take pair ', C(`${sorted[i][0]}×${sorted[i][1]}`), ' — ', A(`${i + 1}/${k}`), ' collected.'],
          state: view(sorted, i + 1),
        });
      }
      const res = sorted.slice(0, k).map((p) => p[0]);
      steps.push({
        tag: 'ret',
        trace: ['Done — the ', C(k), ' most frequent: ', C(`[${res.join(', ')}]`), '.'],
        state: view(sorted, k),
      });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `top ${k} by frequency` };
    },
    note: 'Sorting orders every distinct value even though only the top k matter, costing O(m log m). Bucket sort exploits the fact that counts never exceed n to skip the comparison sort entirely.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  },
};

/* ================= 6. Product of Array Except Self ================= */
const productExceptSelf: ProblemDef = {
  slug: 'product-of-array-except-self',
  title: 'Product of Array Except Self',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/product-of-array-except-self/',
  technique: 'Two sweeps: prefix products from the left, then suffix products from the right — no division.',
  widget: 'array',
  widgetTitle: 'Output under construction',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 2, 3, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> productExceptSelf(vector<int>& nums) {'),
      L('        int n = nums.size();', 'init'),
      L('        vector<int> res(n, 1);', 'init'),
      L('        int prefix = 1;', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'pre'),
      L('            res[i] = prefix;', 'pre'),
      L('            prefix *= nums[i];', 'pre'),
      L('        }'),
      L('        int suffix = 1;', 'sufinit'),
      L('        for (int i = n - 1; i >= 0; i--) {', 'suf'),
      L('            res[i] *= suffix;', 'suf'),
      L('            suffix *= nums[i];', 'suf'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] productExceptSelf(int[] nums) {'),
      L('        int n = nums.length;', 'init'),
      L('        int[] res = new int[n];', 'init'),
      L('        int prefix = 1;', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'pre'),
      L('            res[i] = prefix;', 'pre'),
      L('            prefix *= nums[i];', 'pre'),
      L('        }'),
      L('        int suffix = 1;', 'sufinit'),
      L('        for (int i = n - 1; i >= 0; i--) {', 'suf'),
      L('            res[i] *= suffix;', 'suf'),
      L('            suffix *= nums[i];', 'suf'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums, { min: -20, max: 20, maxLen: 10 });
    if (typeof arr === 'string') return { error: arr };
    const n = arr.length;
    if (n < 2) return { error: 'Need at least two numbers.' };

    const steps: Step[] = [];
    const res: (number | string)[] = Array(n).fill('');
    const st = (i: number | null, extra?: Partial<ArrayState>): ArrayState => ({
      arr: res.map((v, j) => `${arr[j]}｜${v === '' ? '·' : v}`),
      ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Each box shows ', A('input｜output'), '. Fill outputs with prefix products first, then multiply in suffix products.'],
      state: st(null),
    });
    let prefix = 1;
    for (let i = 0; i < n; i++) {
      res[i] = prefix;
      steps.push({
        tag: 'pre',
        trace: ['Left sweep at i = ', A(i), ': res[i] = product of everything before = ', B(prefix), ', then prefix ×= ', A(arr[i]), ' → ', A(prefix * arr[i]), '.'],
        state: st(i, { mark: { [i]: 'active' }, aggs: [{ label: 'prefix', value: String(prefix * arr[i]), c: 'a' }] }),
      });
      prefix *= arr[i];
    }
    let suffix = 1;
    steps.push({ tag: 'sufinit', trace: ['Now sweep back from the right with a running ', A('suffix'), ' product.'], state: st(null) });
    for (let i = n - 1; i >= 0; i--) {
      res[i] = (res[i] as number) * suffix;
      steps.push({
        tag: 'suf',
        trace: ['Right sweep at i = ', A(i), ': res[i] ×= suffix ', A(suffix), ' → ', B(res[i]), ', then suffix ×= ', A(arr[i]), ' → ', A(suffix * arr[i]), '.'],
        state: st(i, { mark: { [i]: 'good' }, aggs: [{ label: 'suffix', value: String(suffix * arr[i]), c: 'a' }] }),
      });
      suffix *= arr[i];
    }
    steps.push({
      tag: 'ret',
      trace: ['Every position now holds (left product) × (right product): ', C(`[${res.join(', ')}]`), '.'],
      state: st(null, { mark: Object.fromEntries(res.map((_, i) => [i, 'final'])) }),
    });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: 'no division used' };
  },
  note: '"Everything except me" factors into "everything to my left" × "everything to my right" — and both of those are runnning products you can carry through a sweep. Writing prefixes into the answer array first makes the whole thing O(1) extra space.',
  complexity: { time: 'O(n)', space: 'O(1) beyond output' },
  brute: {
    label: 'Brute force',
    technique: 'For every index, multiply all the other elements together with an inner loop.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> productExceptSelf(vector<int>& nums) {'),
        L('        int n = nums.size();', 'init'),
        L('        vector<int> res(n, 1);', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = 0; j < n; j++) {', 'inner'),
        L('                if (j != i)', 'inner'),
        L('                    res[i] *= nums[j];', 'mul'),
        L('            }'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] productExceptSelf(int[] nums) {'),
        L('        int n = nums.length;', 'init'),
        L('        int[] res = new int[n];', 'init'),
        L('        Arrays.fill(res, 1);', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = 0; j < n; j++) {', 'inner'),
        L('                if (j != i)', 'inner'),
        L('                    res[i] *= nums[j];', 'mul'),
        L('            }'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums, { min: -20, max: 20, maxLen: 10 });
      if (typeof arr === 'string') return { error: arr };
      const n = arr.length;
      if (n < 2) return { error: 'Need at least two numbers.' };

      const steps: Step[] = [];
      const res: (number | string)[] = Array(n).fill('');
      const st = (i: number | null, extra?: Partial<ArrayState>): ArrayState => ({
        arr: res.map((v, j) => `${arr[j]}｜${v === '' ? '·' : v}`),
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Each box shows ', A('input｜output'), '. For every position, multiply ', A('all the others'), ' from scratch.'],
        state: st(null),
      });
      let mults = 0;
      for (let i = 0; i < n; i++) {
        steps.push({
          tag: 'outer',
          trace: ['Position ', A(i), ': skip ', F(arr[i]), ' and multiply the remaining ', A(n - 1), ' numbers.'],
          state: st(i, { mark: { [i]: 'dim' } }),
        });
        let p = 1;
        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          p *= arr[j];
          mults++;
        }
        res[i] = p;
        steps.push({
          tag: 'mul',
          trace: ['Product of everything except index ', A(i), ' = ', B(p), '.'],
          state: st(i, { mark: { [i]: 'good' } }),
        });
      }
      steps.push({
        tag: 'ret',
        trace: ['Done: ', C(`[${res.join(', ')}]`), ' — but it took ', C(mults), ' multiplications.'],
        state: st(null, { mark: Object.fromEntries(res.map((_, i) => [i, 'final'])) }),
      });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${mults} multiplications` };
    },
    note: 'Every output re-multiplies almost the whole array, so the work is n × (n − 1). The prefix/suffix solution notices that neighbouring answers share most of their product and reuses it.',
    complexity: { time: 'O(n²)', space: 'O(1) beyond output' },
  },
};

/* ================= 11. Majority Element ================= */
const majorityElement: ProblemDef = {
  slug: 'majority-element',
  title: 'Majority Element',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/majority-element/',
  technique: 'Boyer–Moore voting: matching values vote up a candidate, differing values cancel it.',
  widget: 'array',
  widgetTitle: 'Voting sweep',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '2, 2, 1, 1, 1, 2, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int majorityElement(vector<int>& nums) {'),
      L('        int candidate = 0, count = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (count == 0)', 'pick'),
      L('                candidate = x;', 'pick'),
      L('            count += (x == candidate) ? 1 : -1;', 'vote'),
      L('        }'),
      L('        return candidate;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int majorityElement(int[] nums) {'),
      L('        int candidate = 0, count = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (count == 0)', 'pick'),
      L('                candidate = x;', 'pick'),
      L('            count += (x == candidate) ? 1 : -1;', 'vote'),
      L('        }'),
      L('        return candidate;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const steps: Step[] = [];
    let candidate: number | null = null;
    let count = 0;
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'candidate', value: candidate === null ? '—' : String(candidate), c: 'b' },
        { label: 'count', value: String(count), c: 'a' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['One counter, one candidate. Matches vote ', B('+1'), ', mismatches vote ', F('−1'), '.'], state: st(0) });
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i];
      if (count === 0) {
        candidate = x;
        steps.push({
          tag: 'pick',
          trace: ['Count hit 0 — crown a new candidate: ', B(x), '.'],
          state: st(i, { mark: { [i]: 'good' } }),
        });
      }
      count += x === candidate ? 1 : -1;
      steps.push({
        tag: 'vote',
        trace: [A(x), x === candidate ? ' matches the candidate — count rises to ' : ' clashes with the candidate — count drops to ', A(count), '.'],
        state: st(i, { mark: { [i]: x === candidate ? 'active' : 'dim' } }),
      });
    }
    steps.push({ tag: 'ret', trace: ['The survivor of all the cancelling is ', C(candidate!), ' — guaranteed to be the majority.'], state: st(arr.length) });
    return { steps, result: String(candidate), resultDetail: 'Boyer–Moore voting' };
  },
  note: 'Pair up every mismatched vote and both sides lose one — but the majority element has more than n/2 copies, so it can absorb every cancellation and still be the last candidate standing. That is why no hash map or sort is needed.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash map count',
    technique: 'Count every value in a hash map and return the first one whose count exceeds n / 2.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int majorityElement(vector<int>& nums) {'),
        L('        unordered_map<int, int> count;', 'init'),
        L('        for (int x : nums) {', 'loop'),
        L('            count[x]++;', 'tally'),
        L('            if (count[x] > nums.size() / 2)', 'check', 'found'),
        L('                return x;', 'found'),
        L('        }'),
        L('        return -1;', 'none'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int majorityElement(int[] nums) {'),
        L('        Map<Integer, Integer> count = new HashMap<>();', 'init'),
        L('        for (int x : nums) {', 'loop'),
        L('            count.merge(x, 1, Integer::sum);', 'tally'),
        L('            if (count.get(x) > nums.length / 2)', 'check', 'found'),
        L('                return x;', 'found'),
        L('        }'),
        L('        return -1;', 'none'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      const steps: Step[] = [];
      const count = new Map<number, number>();
      const half = Math.floor(arr.length / 2);
      const fmt = () => (count.size === 0 ? '{}' : `{ ${[...count.entries()].map(([v, c]) => `${v}→${c}`).join(', ')} }`);
      const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [
          { label: 'count', value: fmt(), c: 'b' },
          { label: 'need >', value: String(half), c: 'c' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Tally every value in a hash map; the majority is the first count that passes ', C(`n/2 = ${half}`), '.'],
        state: st(0),
      });
      let ans: number | null = null;
      for (let i = 0; i < arr.length; i++) {
        const x = arr[i];
        count.set(x, (count.get(x) ?? 0) + 1);
        steps.push({
          tag: 'tally',
          trace: ['Seen ', A(x), ' — its count is now ', A(count.get(x)!), '.'],
          state: st(i, { mark: { [i]: 'active' } }),
        });
        if (count.get(x)! > half) {
          ans = x;
          steps.push({
            tag: 'found',
            trace: [B(x), ' has ', B(count.get(x)!), ' > ', C(half), ' votes — it is the majority. Return ', C(x), '.'],
            state: st(i, { mark: { [i]: 'final' } }),
          });
          break;
        }
      }
      if (ans === null) {
        steps.push({ tag: 'none', trace: ['No value exceeds n/2 — return ', C(-1), '.'], state: st(arr.length) });
      }
      return { steps, result: String(ans ?? -1), resultDetail: 'hash-map counting' };
    },
    note: 'Easy to reason about and still O(n) time, but the map costs O(n) extra space. Boyer–Moore gets the same answer with two variables by letting mismatched votes cancel.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= 12. Rotate Array ================= */
const rotateArray: ProblemDef = {
  slug: 'rotate-array',
  title: 'Rotate Array',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/rotate-array/',
  technique: 'Three reversals: flip everything, then flip each part back into order.',
  widget: 'array',
  widgetTitle: 'Array through the reversals',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 2, 3, 4, 5, 6, 7', wide: true },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void rotate(vector<int>& nums, int k) {'),
      L('        int n = nums.size();', 'init'),
      L('        k %= n;', 'init'),
      L('        reverse(nums.begin(), nums.end());', 'rev1'),
      L('        reverse(nums.begin(), nums.begin() + k);', 'rev2'),
      L('        reverse(nums.begin() + k, nums.end());', 'rev3'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void rotate(int[] nums, int k) {'),
      L('        int n = nums.length;', 'init'),
      L('        k %= n;', 'init'),
      L('        reverse(nums, 0, n - 1);', 'rev1'),
      L('        reverse(nums, 0, k - 1);', 'rev2'),
      L('        reverse(nums, k, n - 1);', 'rev3'),
      L('    }'),
      L('    private void reverse(int[] a, int i, int j) {', 'rev1', 'rev2', 'rev3'),
      L('        while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums);
    if (typeof input === 'string') return { error: input };
    const kRaw = parseInt1(values.k, 'k', { min: 0 });
    if (typeof kRaw === 'string') return { error: kRaw };
    const arr = [...input];
    const n = arr.length;
    const k = kRaw % n;

    const steps: Step[] = [];
    const st = (win: [number, number] | null, extra?: Partial<ArrayState>): ArrayState => ({
      arr: [...arr],
      window: win,
      ...extra,
    });
    steps.push({
      tag: 'init',
      trace: ['k mod n = ', A(k), ' — the last ', A(k), ' elements must wrap to the front.'],
      state: st(k > 0 ? [n - k, n - 1] : null),
    });
    const rev = (l: number, r: number) => {
      while (l < r) [arr[l++], arr[r--]] = [arr[r], arr[l]];
    };
    rev(0, n - 1);
    steps.push({
      tag: 'rev1',
      trace: ['Reverse the whole array — the wrap-around order appears, but each part is backwards: ', A(`[${arr.join(', ')}]`), '.'],
      state: st([0, n - 1]),
    });
    rev(0, k - 1);
    steps.push({
      tag: 'rev2',
      trace: ['Reverse the first ', A(k), ' elements to fix the front: ', B(`[${arr.slice(0, k).join(', ')}]`), '.'],
      state: st(k > 0 ? [0, k - 1] : null, { mark: Object.fromEntries(arr.slice(0, k).map((_, i) => [i, 'good'])) }),
    });
    rev(k, n - 1);
    steps.push({
      tag: 'rev3',
      trace: ['Reverse the rest to fix the back: ', C(`[${arr.join(', ')}]`), ' — rotation complete.'],
      state: st(null, { mark: Object.fromEntries(arr.map((_, i) => [i, i < k ? 'good' : 'final'])) }),
    });
    return { steps, result: `[${arr.join(', ')}]`, resultDetail: `rotated right by ${k}, in place` };
  },
  note: 'Reversing the whole array puts both halves in the right *place* but the wrong *order* — and a reversal of each half is exactly the fix. Three O(n) flips, zero extra memory.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Extra array',
    technique: 'Copy every element to its rotated position (i + k) % n in a second array, then copy back.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void rotate(vector<int>& nums, int k) {'),
        L('        int n = nums.size();', 'init'),
        L('        vector<int> tmp(n);', 'init'),
        L('        for (int i = 0; i < n; i++)', 'place'),
        L('            tmp[(i + k) % n] = nums[i];', 'place'),
        L('        nums = tmp;', 'copy'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void rotate(int[] nums, int k) {'),
        L('        int n = nums.length;', 'init'),
        L('        int[] tmp = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++)', 'place'),
        L('            tmp[(i + k) % n] = nums[i];', 'place'),
        L('        System.arraycopy(tmp, 0, nums, 0, n);', 'copy'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums);
      if (typeof input === 'string') return { error: input };
      const kRaw = parseInt1(values.k, 'k', { min: 0 });
      if (typeof kRaw === 'string') return { error: kRaw };
      const n = input.length;
      const k = kRaw % n;

      const steps: Step[] = [];
      const tmp: (number | string)[] = Array(n).fill('·');
      const st = (i: number | null, extra?: Partial<ArrayState>): ArrayState => ({
        arr: [...input],
        ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [{ label: 'tmp', value: `[${tmp.join(', ')}]`, c: 'b' }],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Rotating right by ', A(k), ' means the element at ', A('i'), ' lands at ', A('(i + k) % n'), ' in a spare array ', B('tmp'), '.'],
        state: st(null),
      });
      for (let i = 0; i < n; i++) {
        const dest = (i + k) % n;
        tmp[dest] = input[i];
        steps.push({
          tag: 'place',
          trace: ['nums[', A(i), '] = ', A(input[i]), ' goes to tmp[', B(dest), '].'],
          state: st(i, { mark: { [i]: 'active' } }),
        });
      }
      steps.push({
        tag: 'copy',
        trace: ['Copy tmp back into nums: ', C(`[${tmp.join(', ')}]`), ' — rotation complete.'],
        state: { arr: [...tmp], mark: Object.fromEntries(tmp.map((_, i) => [i, 'final'])) },
      });
      return { steps, result: `[${tmp.join(', ')}]`, resultDetail: `rotated right by ${k}, using O(n) extra space` };
    },
    note: 'Direct and easy to get right, and still O(n) time — but it needs a full second array. The three-reversal trick reaches the same result in place with O(1) extra memory.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

export const arraysHashing1 = [twoSum, containsDuplicate, validAnagram, groupAnagrams, topKFrequent, productExceptSelf, majorityElement, rotateArray];
