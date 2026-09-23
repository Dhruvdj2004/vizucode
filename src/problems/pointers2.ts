// Two Pointers (remaining) + Sliding Window (remaining).
import type { ArrayState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';
import { everyWindow } from './slidingWindow2';

/* ================= 16. Valid Palindrome ================= */
const validPalindrome: ProblemDef = {
  slug: 'valid-palindrome',
  title: 'Valid Palindrome',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/valid-palindrome/',
  technique: 'Two pointers close in from the ends, skipping everything that is not a letter or digit.',
  widget: 'array',
  widgetTitle: 'Characters & pointers',
  inputs: [{ key: 's', label: 'String', defaultValue: 'A man, a plan, a canal: Panama', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isPalindrome(string s) {'),
      L('        int l = 0, r = s.size() - 1;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            if (!isalnum(s[l])) { l++; continue; }', 'skipl'),
      L('            if (!isalnum(s[r])) { r--; continue; }', 'skipr'),
      L('            if (tolower(s[l]) != tolower(s[r]))', 'cmp', 'bad'),
      L('                return false;', 'bad'),
      L('            l++; r--;', 'match'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isPalindrome(String s) {'),
      L('        int l = 0, r = s.length() - 1;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            char a = s.charAt(l), b = s.charAt(r);', 'loop'),
      L('            if (!Character.isLetterOrDigit(a)) { l++; continue; }', 'skipl'),
      L('            if (!Character.isLetterOrDigit(b)) { r--; continue; }', 'skipr'),
      L('            if (Character.toLowerCase(a) != Character.toLowerCase(b))', 'cmp', 'bad'),
      L('                return false;', 'bad'),
      L('            l++; r--;', 'match'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = values.s ?? '';
    if (!s.trim()) return { error: 'Enter a string.' };
    if (s.length > 32) return { error: 'Keep it to at most 32 characters.' };
    const chars = s.split('');
    const isAlnum = (c: string) => /[a-z0-9]/i.test(c);

    const steps: Step[] = [];
    let l = 0;
    let r = chars.length - 1;
    const st = (extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars.map((c) => (c === ' ' ? '␣' : c)),
      ptrs: [
        { name: 'l', i: l, c: 'a' },
        { name: 'r', i: r, c: 'c' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Compare from both ends inward, ignoring punctuation, spaces, and case.'], state: st() });
    let ok = true;
    let guard = 0;
    while (l < r && guard++ < 200) {
      if (!isAlnum(chars[l])) {
        steps.push({ tag: 'skipl', trace: ["'", F(chars[l] === ' ' ? '␣' : chars[l]), "' is not alphanumeric — skip it: l → ", A(l + 1), '.'], state: st({ mark: { [l]: 'dim' } }) });
        l++;
        continue;
      }
      if (!isAlnum(chars[r])) {
        steps.push({ tag: 'skipr', trace: ["'", F(chars[r] === ' ' ? '␣' : chars[r]), "' is not alphanumeric — skip it: r → ", A(r - 1), '.'], state: st({ mark: { [r]: 'dim' } }) });
        r--;
        continue;
      }
      if (chars[l].toLowerCase() !== chars[r].toLowerCase()) {
        ok = false;
        steps.push({ tag: 'bad', trace: ["'", F(chars[l]), "' ≠ '", F(chars[r]), "' — not a palindrome. Return ", C('false'), '.'], state: st({ mark: { [l]: 'dim', [r]: 'dim' } }) });
        break;
      }
      steps.push({ tag: 'match', trace: ["'", B(chars[l]), "' matches '", B(chars[r]), "' — step both pointers inward."], state: st({ mark: { [l]: 'good', [r]: 'good' } }) });
      l++;
      r--;
    }
    if (ok) steps.push({ tag: 'ret', trace: ['Pointers crossed with every pair matching — it reads the same both ways: ', C('true'), '.'], state: st() });
    return { steps, result: String(ok) };
  },
  note: 'Skipping non-alphanumerics inside the loop (rather than pre-cleaning the string) keeps it O(1) space — the pointers simply refuse to stop on characters that don\'t count.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Clean & reverse',
    technique: 'Build a cleaned lowercase copy, reverse it, and compare the two strings.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isPalindrome(string s) {'),
        L('        string t;', 'init'),
        L('        for (char c : s)', 'clean'),
        L('            if (isalnum(c)) t += tolower(c);', 'keep', 'drop'),
        L('        string rev = t;', 'rev'),
        L('        reverse(rev.begin(), rev.end());', 'rev'),
        L('        return t == rev;', 'cmp'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isPalindrome(String s) {'),
        L('        StringBuilder t = new StringBuilder();', 'init'),
        L('        for (char c : s.toCharArray())', 'clean'),
        L('            if (Character.isLetterOrDigit(c))', 'keep', 'drop'),
        L('                t.append(Character.toLowerCase(c));', 'keep'),
        L('        String rev = t.reverse().toString();', 'rev'),
        L('        return t.reverse().toString().equals(rev);', 'cmp'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = values.s ?? '';
      if (s.length === 0) return { error: 'Enter a non-empty string.' };
      if (s.length > 40) return { error: 'Keep it to at most 40 characters so the steps stay readable.' };

      const chars = s.split('');
      const isAlnum = (c: string) => /[a-z0-9]/i.test(c);
      const steps: Step[] = [];
      let cleaned = '';
      const view = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: chars.map((c) => (c === ' ' ? '␣' : c)),
        ptrs: i < chars.length ? [{ name: 'scan', i, c: 'a' }] : [],
        aggs: [{ label: 'cleaned', value: cleaned || '(empty)', c: 'b' }],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Build a ', B('cleaned copy'), ' first — only letters and digits, all lowercase.'],
        state: view(0),
      });
      for (let i = 0; i < chars.length; i++) {
        const keep = isAlnum(chars[i]);
        if (keep) cleaned += chars[i].toLowerCase();
        steps.push({
          tag: keep ? 'keep' : 'drop',
          tag2: 'clean',
          trace: keep
            ? ["Keep '", A(chars[i]), "' as '", B(chars[i].toLowerCase()), "' → \"", B(cleaned), '".']
            : ["'", F(chars[i] === ' ' ? '␣' : chars[i]), "' is punctuation or a space — dropped."],
          state: view(i, { mark: { [i]: keep ? 'good' : 'dim' } }),
        });
      }
      const rev = [...cleaned].reverse().join('');
      steps.push({
        tag: 'rev',
        trace: ['Reverse the cleaned string: "', B(cleaned), '" → "', A(rev), '".'],
        state: {
          arr: [...cleaned],
          aggs: [
            { label: 'cleaned', value: cleaned, c: 'b' },
            { label: 'reversed', value: rev, c: 'a' },
          ],
        } satisfies ArrayState,
      });
      const ok = cleaned === rev;
      steps.push({
        tag: 'cmp',
        trace: ok
          ? ['The two strings are identical — it reads the same both ways: ', C('true'), '.']
          : ['The two strings differ — not a palindrome: ', C('false'), '.'],
        state: {
          arr: [...cleaned],
          mark: Object.fromEntries([...cleaned].map((_, i) => [i, ok ? 'final' : 'dim'])),
          aggs: [
            { label: 'cleaned', value: cleaned, c: 'b' },
            { label: 'reversed', value: rev, c: ok ? 'b' : 'a' },
          ],
        } satisfies ArrayState,
      });
      return { steps, result: String(ok), resultDetail: `built two strings of length ${cleaned.length} to decide it` };
    },
    note: 'Perfectly readable, and the answer is right — but it allocates two whole extra strings and always scans the entire input, even when the very first pair already disagrees. The two-pointer version skips non-alphanumerics in place and bails at the first mismatch, so it uses no extra memory and often stops early.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= 18. 3Sum ================= */
const threeSum: ProblemDef = {
  slug: '3sum',
  title: '3Sum',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/3sum/',
  technique: 'Sort, fix the smallest element, then run converging two-pointers on the rest.',
  widget: 'array',
  widgetTitle: 'Sorted array & pointers',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '-1, 0, 1, 2, -1, -4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> threeSum(vector<int>& nums) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        vector<vector<int>> res;', 'sort'),
      L('        for (int i = 0; i < (int)nums.size() - 2; i++) {', 'fix'),
      L('            if (i > 0 && nums[i] == nums[i - 1]) continue;', 'dupi'),
      L('            int l = i + 1, r = nums.size() - 1;', 'fix'),
      L('            while (l < r) {', 'sum'),
      L('                int sum = nums[i] + nums[l] + nums[r];', 'sum'),
      L('                if (sum < 0) l++;', 'movel'),
      L('                else if (sum > 0) r--;', 'mover'),
      L('                else {'),
      L('                    res.push_back({nums[i], nums[l], nums[r]});', 'found'),
      L('                    while (l < r && nums[l] == nums[l + 1]) l++;', 'found'),
      L('                    l++; r--;', 'found'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> threeSum(int[] nums) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'sort'),
      L('        for (int i = 0; i < nums.length - 2; i++) {', 'fix'),
      L('            if (i > 0 && nums[i] == nums[i - 1]) continue;', 'dupi'),
      L('            int l = i + 1, r = nums.length - 1;', 'fix'),
      L('            while (l < r) {', 'sum'),
      L('                int sum = nums[i] + nums[l] + nums[r];', 'sum'),
      L('                if (sum < 0) l++;', 'movel'),
      L('                else if (sum > 0) r--;', 'mover'),
      L('                else {'),
      L('                    res.add(List.of(nums[i], nums[l], nums[r]));', 'found'),
      L('                    while (l < r && nums[l] == nums[l + 1]) l++;', 'found'),
      L('                    l++; r--;', 'found'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums, { maxLen: 12 });
    if (typeof input === 'string') return { error: input };
    if (input.length < 3) return { error: 'Need at least three numbers.' };
    const arr = [...input].sort((a, b) => a - b);
    const steps: Step[] = [];
    const res: number[][] = [];
    const st = (i: number, l?: number, r?: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: [
        { name: 'i', i, c: 'b' },
        ...(l !== undefined ? [{ name: 'l', i: l, c: 'a' as const }] : []),
        ...(r !== undefined ? [{ name: 'r', i: r, c: 'c' as const }] : []),
      ],
      aggs: [{ label: 'triplets', value: res.length === 0 ? '[]' : res.map((t) => `[${t.join(',')}]`).join(' '), c: 'c' }],
      ...extra,
    });
    steps.push({ tag: 'sort', trace: ['Sort first: ', A(`[${arr.join(', ')}]`), ' — order unlocks the two-pointer sweep and makes duplicates adjacent.'], state: st(0) });
    for (let i = 0; i < arr.length - 2; i++) {
      if (arr[i] > 0) break;
      if (i > 0 && arr[i] === arr[i - 1]) {
        steps.push({ tag: 'dupi', trace: ['nums[i] = ', F(arr[i]), ' repeats the previous anchor — skip to avoid duplicate triplets.'], state: st(i, undefined, undefined, { mark: { [i]: 'dim' } }) });
        continue;
      }
      let l = i + 1;
      let r = arr.length - 1;
      steps.push({ tag: 'fix', trace: ['Fix the anchor ', B(arr[i]), ' at i = ', B(i), '; two-pointer the remainder for a pair summing to ', C(-arr[i]), '.'], state: st(i, l, r, { mark: { [i]: 'good' } }) });
      while (l < r && steps.length < 350) {
        const sum = arr[i] + arr[l] + arr[r];
        steps.push({
          tag: 'sum',
          trace: [B(arr[i]), ' + ', A(arr[l]), ' + ', A(arr[r]), ' = ', A(sum), '.'],
          state: st(i, l, r, { mark: { [i]: 'good', [l]: 'active', [r]: 'active' } }),
        });
        if (sum < 0) {
          steps.push({ tag: 'movel', trace: [F(sum), ' too small — l → ', A(l + 1), '.'], state: st(i, l + 1, r) });
          l++;
        } else if (sum > 0) {
          steps.push({ tag: 'mover', trace: [F(sum), ' too big — r → ', A(r - 1), '.'], state: st(i, l, r - 1) });
          r--;
        } else {
          res.push([arr[i], arr[l], arr[r]]);
          steps.push({
            tag: 'found',
            trace: ['Zero! Record ', C(`[${arr[i]}, ${arr[l]}, ${arr[r]}]`), ', then move both pointers past any duplicates.'],
            state: st(i, l, r, { mark: { [i]: 'final', [l]: 'final', [r]: 'final' } }),
          });
          while (l < r && arr[l] === arr[l + 1]) l++;
          l++;
          r--;
        }
      }
    }
    steps.push({ tag: 'ret', trace: ['All anchors tried — found ', C(res.length), ' unique triplet(s).'], state: st(Math.max(0, arr.length - 3)) });
    return { steps, result: res.length === 0 ? '[]' : `[${res.map((t) => `[${t.join(',')}]`).join(', ')}]`, resultDetail: `${res.length} unique triplets` };
  },
  note: 'Fixing one element reduces 3Sum to the sorted-two-pointer 2Sum you already trust, and sorting makes duplicate handling trivial: equal values sit side by side, so skipping repeats of the anchor and of l removes duplicate triplets without a hash set.',
  complexity: { time: 'O(n²)', space: 'O(1) beyond output' },
  brute: {
    label: 'Three loops',
    technique: 'Test every triple of indices and use a set to drop the duplicate triplets.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> threeSum(vector<int>& nums) {'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        set<vector<int>> uniq;', 'sort'),
        L('        int n = nums.size();'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++)', 'k'),
        L('              if (nums[i] + nums[j] + nums[k] == 0)', 'test', 'hit'),
        L('                uniq.insert({nums[i], nums[j], nums[k]});', 'hit'),
        L('        return {uniq.begin(), uniq.end()};', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> threeSum(int[] nums) {'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        Set<List<Integer>> uniq = new LinkedHashSet<>();', 'sort'),
        L('        int n = nums.length;'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++)', 'k'),
        L('              if (nums[i] + nums[j] + nums[k] == 0)', 'test', 'hit'),
        L('                uniq.add(List.of(nums[i], nums[j], nums[k]));', 'hit'),
        L('        return new ArrayList<>(uniq);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums, { maxLen: 12 });
      if (typeof raw === 'string') return { error: raw };
      if (raw.length < 3) return { error: 'Need at least three numbers.' };

      const arr = [...raw].sort((x, y) => x - y);
      const steps: Step[] = [];
      const seen = new Set<string>();
      const res: number[][] = [];
      let tested = 0;
      const st = (mark: Record<number, 'active' | 'final' | 'dim'>): ArrayState => ({
        arr,
        mark,
        aggs: [
          { label: 'triples tested', value: String(tested), c: 'a' },
          { label: 'found', value: res.length ? res.map((t) => `[${t.join(',')}]`).join(' ') : '—', c: 'b' },
        ],
      });

      steps.push({
        tag: 'sort',
        trace: ['Sort so the output order is predictable: ', A(`[${arr.join(', ')}]`), '. Then test every triple of indices.'],
        state: st({}),
      });
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          for (let k = j + 1; k < arr.length; k++) {
            tested++;
            const sum = arr[i] + arr[j] + arr[k];
            const triple = [arr[i], arr[j], arr[k]];
            const key = triple.join(',');
            if (sum === 0) {
              const fresh = !seen.has(key);
              if (fresh) {
                seen.add(key);
                res.push(triple);
              }
              steps.push({
                tag: 'hit',
                trace: [
                  triple.join(' + '), ' = ', B(0), ' — ',
                  fresh ? B('new triplet') : F('a duplicate of one already found, discard'), '.',
                ],
                state: st({ [i]: fresh ? 'final' : 'dim', [j]: fresh ? 'final' : 'dim', [k]: fresh ? 'final' : 'dim' }),
              });
            } else {
              steps.push({
                tag: 'test',
                trace: [triple.join(' + '), ' = ', F(sum), ' ≠ 0.'],
                state: st({ [i]: 'active', [j]: 'active', [k]: 'active' }),
              });
            }
          }
        }
      }
      steps.push({
        tag: 'ret',
        trace: [C(tested), ' triples tested, giving ', C(res.length), ' unique triplet(s).'],
        state: st({}),
      });
      return {
        steps,
        result: res.length === 0 ? '[]' : `[${res.map((t) => `[${t.join(',')}]`).join(', ')}]`,
        resultDetail: `${res.length} unique triplets — after ${tested} index combinations`,
      };
    },
    note: 'The innermost loop is the one to kill. With the array sorted and i fixed, the other two numbers must sum to −nums[i] on a sorted range, which two converging pointers find in one sweep — and because equal values are then adjacent, skipping duplicates becomes a comparison rather than a set. That is O(n³) with O(k) memory down to O(n²) with none.',
    complexity: { time: 'O(n³)', space: 'O(k) for the dedupe set' },
  },
};

/* ================= 20. Trapping Rain Water ================= */
const trappingRain: ProblemDef = {
  slug: 'trapping-rain-water',
  title: 'Trapping Rain Water',
  category: 'Two Pointers',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/trapping-rain-water/',
  technique: 'Two pointers with running max walls — always settle the side with the lower wall.',
  widget: 'array',
  widgetTitle: 'Elevation map',
  inputs: [{ key: 'height', label: 'Heights', defaultValue: '0,1,0,2,1,0,1,3,2,1,2,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int trap(vector<int>& height) {'),
      L('        int l = 0, r = height.size() - 1;', 'init'),
      L('        int leftMax = 0, rightMax = 0, water = 0;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            if (height[l] < height[r]) {', 'side'),
      L('                leftMax = max(leftMax, height[l]);', 'left'),
      L('                water += leftMax - height[l];', 'left'),
      L('                l++;', 'left'),
      L('            } else {'),
      L('                rightMax = max(rightMax, height[r]);', 'right'),
      L('                water += rightMax - height[r];', 'right'),
      L('                r--;', 'right'),
      L('            }'),
      L('        }'),
      L('        return water;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int trap(int[] height) {'),
      L('        int l = 0, r = height.length - 1;', 'init'),
      L('        int leftMax = 0, rightMax = 0, water = 0;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            if (height[l] < height[r]) {', 'side'),
      L('                leftMax = Math.max(leftMax, height[l]);', 'left'),
      L('                water += leftMax - height[l];', 'left'),
      L('                l++;', 'left'),
      L('            } else {'),
      L('                rightMax = Math.max(rightMax, height[r]);', 'right'),
      L('                water += rightMax - height[r];', 'right'),
      L('                r--;', 'right'),
      L('            }'),
      L('        }'),
      L('        return water;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.height, { min: 0, maxLen: 16 });
    if (typeof arr === 'string') return { error: arr };
    if (arr.length < 3) return { error: 'Need at least three bars.' };
    const steps: Step[] = [];
    let l = 0;
    let r = arr.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;
    const settled: ArrayState['mark'] = {};
    const st = (extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      bars: true,
      ptrs: [
        { name: 'l', i: l, c: 'a' },
        { name: 'r', i: r, c: 'c' },
      ],
      aggs: [
        { label: 'leftMax', value: String(leftMax), c: 'a' },
        { label: 'rightMax', value: String(rightMax), c: 'a' },
        { label: 'water', value: String(water), c: 'b' },
      ],
      mark: { ...settled },
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Water above any bar = min(tallest wall left, tallest wall right) − bar height. Track both walls with two pointers.'], state: st() });
    while (l < r && steps.length < 300) {
      if (arr[l] < arr[r]) {
        leftMax = Math.max(leftMax, arr[l]);
        const add = leftMax - arr[l];
        water += add;
        steps.push({
          tag: 'left',
          trace: ['height[l] = ', A(arr[l]), ' < height[r] = ', A(arr[r]), ' — the left side is bounded by leftMax = ', A(leftMax), add > 0 ? [' → trap '] .join('') : ' → traps nothing', add > 0 ? B(add) : '', add > 0 ? ' water. l advances.' : '. l advances.'],
          state: st({ mark: { ...settled, [l]: add > 0 ? 'good' : 'dim' } }),
        });
        settled[l] = add > 0 ? 'good' : 'dim';
        l++;
      } else {
        rightMax = Math.max(rightMax, arr[r]);
        const add = rightMax - arr[r];
        water += add;
        steps.push({
          tag: 'right',
          trace: ['height[r] = ', A(arr[r]), ' ≤ height[l] = ', A(arr[l]), ' — the right side is bounded by rightMax = ', A(rightMax), add > 0 ? ' → trap ' : ' → traps nothing', add > 0 ? B(add) : '', add > 0 ? ' water. r retreats.' : '. r retreats.'],
          state: st({ mark: { ...settled, [r]: add > 0 ? 'good' : 'dim' } }),
        });
        settled[r] = add > 0 ? 'good' : 'dim';
        r--;
      }
    }
    steps.push({ tag: 'ret', trace: ['Pointers met — total trapped water: ', C(water), ' units.'], state: st() });
    return { steps, result: String(water), resultDetail: 'units of water trapped' };
  },
  note: 'When height[l] < height[r], the right side is guaranteed to have a wall at least as tall as the left one — so leftMax alone decides the water above l, no matter what lies between. That certainty is what lets each cell be settled the moment a pointer touches it.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Scan both sides',
    technique: 'For each bar, scan left and right for the tallest wall on each side; the water above it is the smaller of the two, minus its own height.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int trap(vector<int>& height) {'),
        L('        int water = 0;', 'init'),
        L('        for (int i = 0; i < height.size(); i++) {', 'loop'),
        L('            int lm = 0, rm = 0;', 'scan'),
        L('            for (int j = 0; j <= i; j++) lm = max(lm, height[j]);', 'scan'),
        L('            for (int j = i; j < height.size(); j++) rm = max(rm, height[j]);', 'scan'),
        L('            water += min(lm, rm) - height[i];', 'add'),
        L('        }'),
        L('        return water;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int trap(int[] height) {'),
        L('        int water = 0;', 'init'),
        L('        for (int i = 0; i < height.length; i++) {', 'loop'),
        L('            int lm = 0, rm = 0;', 'scan'),
        L('            for (int j = 0; j <= i; j++) lm = Math.max(lm, height[j]);', 'scan'),
        L('            for (int j = i; j < height.length; j++) rm = Math.max(rm, height[j]);', 'scan'),
        L('            water += Math.min(lm, rm) - height[i];', 'add'),
        L('        }'),
        L('        return water;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const h = parseIntArray(values.height, { min: 0 });
      if (typeof h === 'string') return { error: h };
      if (h.length === 0) return { error: 'Enter at least one height.' };

      const steps: Step[] = [];
      let water = 0;
      const settled: Record<number, 'good' | 'dim'> = {};
      const st = (i: number, lm: number, rm: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: h,
        bars: true,
        ptrs: i < h.length ? [{ name: 'i', i, c: 'a' }] : [],
        mark: { ...settled, ...(extra?.mark ?? {}) },
        aggs: [
          { label: 'leftMax', value: String(lm), c: 'b' },
          { label: 'rightMax', value: String(rm), c: 'b' },
          { label: 'water', value: String(water), c: 'c' },
        ],
      });

      steps.push({
        tag: 'init',
        trace: ['For every bar, rescan the whole array to find the tallest wall on ', A('each side'), '.'],
        state: st(0, 0, 0),
      });
      for (let i = 0; i < h.length; i++) {
        let lm = 0;
        for (let j = 0; j <= i; j++) lm = Math.max(lm, h[j]);
        let rm = 0;
        for (let j = i; j < h.length; j++) rm = Math.max(rm, h[j]);
        steps.push({
          tag: 'scan',
          tag2: 'loop',
          trace: [
            'Bar ', A(i), ' (height ', A(h[i]), '): rescanning left gives ', B(lm), ', rescanning right gives ', B(rm), '.',
          ],
          state: st(i, lm, rm, { mark: { [i]: 'active' } }),
        });
        const add = Math.min(lm, rm) - h[i];
        water += add;
        settled[i] = add > 0 ? 'good' : 'dim';
        steps.push({
          tag: 'add',
          trace:
            add > 0
              ? ['min(', B(lm), ', ', B(rm), ') − ', A(h[i]), ' = ', B(add), ' units held here. Running total ', C(water), '.']
              : ['This bar is as tall as its smaller wall — ', F('no water'), ' sits on it. Total stays ', C(water), '.'],
          state: st(i, lm, rm),
        });
      }
      steps.push({
        tag: 'ret',
        trace: ['Every bar measured — total trapped water: ', C(water), '.'],
        state: st(h.length, 0, 0),
      });
      return {
        steps,
        result: String(water),
        resultDetail: `units of water trapped — but the array was rescanned ${h.length} times`,
      };
    },
    note: 'The two inner scans recompute the same prefix and suffix maxima over and over. Caching them in two arrays already gets this to O(n) at O(n) space; the two-pointer version goes further by noticing that whichever side is currently shorter is the side whose maximum is already known — so it needs neither array.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 21. Sort Colors ================= */
const sortColors: ProblemDef = {
  slug: 'sort-colors',
  title: 'Sort Colors',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sort-colors/',
  technique: 'Dutch national flag: three pointers partition 0s, 1s, and 2s in one pass.',
  widget: 'array',
  widgetTitle: 'Array & three pointers',
  inputs: [{ key: 'nums', label: 'Array of 0/1/2', defaultValue: '2, 0, 2, 1, 1, 0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void sortColors(vector<int>& nums) {'),
      L('        int lo = 0, mid = 0, hi = nums.size() - 1;', 'init'),
      L('        while (mid <= hi) {', 'loop'),
      L('            if (nums[mid] == 0)', 'check'),
      L('                swap(nums[lo++], nums[mid++]);', 'zero'),
      L('            else if (nums[mid] == 2)', 'check'),
      L('                swap(nums[mid], nums[hi--]);', 'two'),
      L('            else'),
      L('                mid++;', 'one'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void sortColors(int[] nums) {'),
      L('        int lo = 0, mid = 0, hi = nums.length - 1;', 'init'),
      L('        while (mid <= hi) {', 'loop'),
      L('            if (nums[mid] == 0) {', 'check'),
      L('                int t = nums[lo]; nums[lo++] = nums[mid]; nums[mid++] = t;', 'zero'),
      L('            } else if (nums[mid] == 2) {', 'check'),
      L('                int t = nums[hi]; nums[hi--] = nums[mid]; nums[mid] = t;', 'two'),
      L('            } else'),
      L('                mid++;', 'one'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums, { min: 0, max: 2 });
    if (typeof input === 'string') return { error: input };
    const arr = [...input];
    const steps: Step[] = [];
    let lo = 0;
    let mid = 0;
    let hi = arr.length - 1;
    const st = (extra?: Partial<ArrayState>): ArrayState => ({
      arr: [...arr],
      ptrs: [
        { name: 'lo', i: lo, c: 'b' },
        ...(mid <= arr.length - 1 ? [{ name: 'mid', i: Math.min(mid, arr.length - 1), c: 'a' as const }] : []),
        { name: 'hi', i: Math.max(hi, 0), c: 'c' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Invariant: left of ', B('lo'), ' is all 0s, right of ', C('hi'), ' is all 2s, ', A('mid'), ' scans the unknown middle.'], state: st() });
    while (mid <= hi && steps.length < 300) {
      if (arr[mid] === 0) {
        [arr[lo], arr[mid]] = [arr[mid], arr[lo]];
        steps.push({ tag: 'zero', trace: [A(0), ' at mid — swap it down to the 0-zone (index ', B(lo), '); both lo and mid advance.'], state: st({ mark: { [lo]: 'good' } }) });
        lo++;
        mid++;
      } else if (arr[mid] === 2) {
        [arr[mid], arr[hi]] = [arr[hi], arr[mid]];
        steps.push({ tag: 'two', trace: [A(2), ' at mid — swap it up to the 2-zone (index ', C(hi), '); hi shrinks, mid stays (the newcomer is unvetted).'], state: st({ mark: { [hi]: 'final' } }) });
        hi--;
      } else {
        steps.push({ tag: 'one', trace: [A(1), ' belongs in the middle — mid just advances.'], state: st({ mark: { [mid]: 'active' } }) });
        mid++;
      }
    }
    steps.push({ tag: 'loop', trace: ['mid passed hi — fully partitioned: ', C(`[${arr.join(', ')}]`), '.'], state: st({ mark: Object.fromEntries(arr.map((v, i) => [i, v === 0 ? 'good' : v === 2 ? 'final' : 'active'])) }) });
    return { steps, result: `[${arr.join(', ')}]`, resultDetail: 'one pass, in place' };
  },
  note: 'The subtle beat: after swapping a 2 to the back, mid does NOT advance — the value that arrived from hi is unexamined and could be anything. Swapped-down 0s are safe because everything below mid has already been vetted.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Counting sort',
    technique: 'Count how many 0s, 1s and 2s there are, then overwrite the array with that many of each.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void sortColors(vector<int>& nums) {'),
        L('        int cnt[3] = {0, 0, 0};', 'init'),
        L('        for (int x : nums)', 'count'),
        L('            cnt[x]++;', 'count'),
        L('        int k = 0;', 'write'),
        L('        for (int c = 0; c < 3; c++)', 'write'),
        L('            for (int i = 0; i < cnt[c]; i++)', 'write'),
        L('                nums[k++] = c;', 'write'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void sortColors(int[] nums) {'),
        L('        int[] cnt = new int[3];', 'init'),
        L('        for (int x : nums)', 'count'),
        L('            cnt[x]++;', 'count'),
        L('        int k = 0;', 'write'),
        L('        for (int c = 0; c < 3; c++)', 'write'),
        L('            for (int i = 0; i < cnt[c]; i++)', 'write'),
        L('                nums[k++] = c;', 'write'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums, { min: 0, max: 2 });
      if (typeof raw === 'string') return { error: raw };

      const steps: Step[] = [];
      const cnt = [0, 0, 0];
      const view = (i: number, arr: number[], extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: i < arr.length ? [{ name: i < raw.length ? 'scan' : 'write', i, c: 'a' }] : [],
        aggs: [
          { label: '0s', value: String(cnt[0]), c: 'b' },
          { label: '1s', value: String(cnt[1]), c: 'a' },
          { label: '2s', value: String(cnt[2]), c: 'c' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Pass one: just ', A('count'), ' how many of each colour there are. Nothing moves yet.'],
        state: view(0, raw),
      });
      for (let i = 0; i < raw.length; i++) {
        cnt[raw[i]]++;
        steps.push({
          tag: 'count',
          trace: ['Saw a ', A(raw[i]), ' — that tally is now ', B(cnt[raw[i]]), '.'],
          state: view(i, raw, { mark: { [i]: 'good' } }),
        });
      }
      const out: number[] = [];
      for (let c = 0; c < 3; c++) for (let i = 0; i < cnt[c]; i++) out.push(c);
      for (let k = 0; k < out.length; k++) {
        steps.push({
          tag: 'write',
          trace: ['Pass two: overwrite slot ', A(k), ' with ', B(out[k]), '.'],
          state: view(k, raw.map((v, i) => (i <= k ? out[i] : v)), {
            mark: Object.fromEntries(raw.map((_, i) => [i, i <= k ? 'good' : 'dim'])),
          }),
        });
      }
      steps.push({
        tag: 'write',
        trace: ['Rewritten in order: ', C(`[${out.join(', ')}]`), '. Correct — but the array was touched twice.'],
        state: {
          arr: out,
          mark: Object.fromEntries(out.map((v, i) => [i, v === 0 ? 'good' : v === 2 ? 'final' : 'active'])),
        } satisfies ArrayState,
      });
      return { steps, result: `[${out.join(', ')}]`, resultDetail: 'two passes: one to count, one to overwrite' };
    },
    note: 'This is the standard counting sort, and for three values it is genuinely O(n) — the objection is not speed but that it reads the array twice and overwrites every element rather than sorting what is there. The Dutch-flag partition does it in a single pass, which is what the follow-up question is really asking for.',
    complexity: { time: 'O(n), two passes', space: 'O(1)' },
  },
};

/* ================= 25. Longest Repeating Character Replacement ================= */
const charReplacement: ProblemDef = {
  slug: 'longest-repeating-character-replacement',
  title: 'Longest Repeating Character Replacement',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
  technique: 'Grow a window while (size − count of majority letter) ≤ k; slide when it breaks.',
  widget: 'array',
  widgetTitle: 'String & window',
  inputs: [
    { key: 's', label: 'String', defaultValue: 'AABABBA', wide: true },
    { key: 'k', label: 'k (replacements)', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int characterReplacement(string s, int k) {'),
      L('        int count[26] = {0};', 'init'),
      L('        int l = 0, maxFreq = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < s.size(); r++) {', 'loop'),
      L('            maxFreq = max(maxFreq, ++count[s[r] - \'A\']);', 'add'),
      L('            if (r - l + 1 - maxFreq > k) {', 'shrink'),
      L('                count[s[l] - \'A\']--;', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int characterReplacement(String s, int k) {'),
      L('        int[] count = new int[26];', 'init'),
      L('        int l = 0, maxFreq = 0, best = 0;', 'init'),
      L('        for (int r = 0; r < s.length(); r++) {', 'loop'),
      L('            maxFreq = Math.max(maxFreq, ++count[s.charAt(r) - \'A\']);', 'add'),
      L('            if (r - l + 1 - maxFreq > k) {', 'shrink'),
      L('                count[s.charAt(l) - \'A\']--;', 'shrink'),
      L('                l++;', 'shrink'),
      L('            }'),
      L('            best = Math.max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').toUpperCase().trim();
    if (!/^[A-Z]+$/.test(s)) return { error: 'Uppercase letters A–Z only.' };
    if (s.length > 16) return { error: 'Keep it to at most 16 characters.' };
    const k = parseInt1(values.k, 'k', { min: 0 });
    if (typeof k === 'string') return { error: k };

    const chars = s.split('');
    const steps: Step[] = [];
    const count = new Map<string, number>();
    let l = 0;
    let maxFreq = 0;
    let best = 0;
    const st = (r: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars,
      window: r >= l ? [l, r] : null,
      ptrs: [
        { name: 'l', i: l, c: 'b' },
        { name: 'r', i: Math.min(r, chars.length - 1), c: 'a' },
      ],
      aggs: [
        { label: 'counts', value: [...count.entries()].filter(([, v]) => v > 0).map(([c, v]) => `${c}:${v}`).join(' ') || '—', c: 'a' },
        { label: 'maxFreq', value: String(maxFreq), c: 'a' },
        { label: 'replacements needed', value: r >= l ? String(r - l + 1 - maxFreq) : '0', c: 'a' },
        { label: 'best', value: String(best), c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['A window is fixable with ', C(k), ' replacements iff (window size − majority count) ≤ ', C(k), '.'], state: st(0) });
    for (let r = 0; r < chars.length; r++) {
      count.set(chars[r], (count.get(chars[r]) ?? 0) + 1);
      maxFreq = Math.max(maxFreq, count.get(chars[r])!);
      steps.push({
        tag: 'add',
        trace: ['Take \'', A(chars[r]), '\' — its count is now ', A(count.get(chars[r])!), ', majority letter count = ', A(maxFreq), '.'],
        state: st(r, { mark: { [r]: 'active' } }),
      });
      if (r - l + 1 - maxFreq > k) {
        count.set(chars[l], count.get(chars[l])! - 1);
        steps.push({
          tag: 'shrink',
          trace: ['Window needs ', F(r - l + 1 - maxFreq), ' replacements > k — slide the left edge: drop \'', F(chars[l]), '\', l → ', B(l + 1), '.'],
          state: st(r, { mark: { [l]: 'dim' } }),
        });
        l++;
      }
      if (r - l + 1 > best) best = r - l + 1;
      steps.push({ tag: 'best', trace: ['Window size ', A(r - l + 1), best === r - l + 1 ? ' — best so far.' : ` — best stays ${best}.`], state: st(r) });
    }
    steps.push({ tag: 'ret', trace: ['Answer: a block of ', C(best), ' identical letters is reachable with ≤ ', C(k), ' replacements.'], state: st(chars.length - 1) });
    return { steps, result: String(best) };
  },
  note: 'maxFreq is never decremented when the window slides — a deliberate "flaw" that works: best only needs to grow, and it can only grow when maxFreq itself grows, so a stale maxFreq merely keeps the window from shrinking below the best already found.',
  complexity: { time: 'O(n)', space: 'O(26)' },
  brute: {
    label: 'Brute force',
    technique: 'For every substring, check whether (length − count of its most common letter) ≤ k.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int characterReplacement(string s, int k) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < s.size(); i++) {', 'outer'),
        L('            int cnt[26] = {0}, top = 0;', 'outer'),
        L('            for (int j = i; j < s.size(); j++) {', 'grow', 'hit'),
        L('                top = max(top, ++cnt[s[j] - \'A\']);', 'grow', 'hit'),
        L('                if (j - i + 1 - top > k) break;', 'grow'),
        L('                best = max(best, j - i + 1);', 'hit'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int characterReplacement(String s, int k) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < s.length(); i++) {', 'outer'),
        L('            int[] cnt = new int[26]; int top = 0;', 'outer'),
        L('            for (int j = i; j < s.length(); j++) {', 'grow', 'hit'),
        L('                top = Math.max(top, ++cnt[s.charAt(j) - \'A\']);', 'grow', 'hit'),
        L('                if (j - i + 1 - top > k) break;', 'grow'),
        L('                best = Math.max(best, j - i + 1);', 'hit'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').toUpperCase().trim();
      if (!/^[A-Z]+$/.test(s)) return { error: 'Uppercase letters A–Z only.' };
      if (s.length > 16) return { error: 'Keep it to at most 16 characters.' };
      const k = parseInt1(values.k, 'k', { min: 0 });
      if (typeof k === 'string') return { error: k };
      const { steps, answer } = everyWindow<{ cnt: Map<string, number>; top: number; len: number }>({
        arr: s.split(''),
        fresh: () => ({ cnt: new Map(), top: 0, len: 0 }),
        add: (st, x) => {
          const c = (st.cnt.get(String(x)) ?? 0) + 1;
          st.cnt.set(String(x), c);
          st.top = Math.max(st.top, c);
          st.len++;
        },
        qualifies: (st) => st.len - st.top <= k,
        dead: (st) => st.len - st.top > k,
        goal: 'longest',
        show: (st) => `len ${st.len}, most common ×${st.top}, replace ${st.len - st.top}`,
        intro: ['A substring works if the letters that are not its most common letter number at most ', A(k), '. Test every substring.'],
      });
      return { steps, result: String(answer) };
    },
    note: 'Quadratic: every start re-counts letters from scratch. The sliding window keeps the counts as it moves and never shrinks the answer, so each pointer only moves forward.',
    complexity: { time: 'O(n²)', space: 'O(26)' },
  },
};

/* ================= 26. Permutation in String ================= */
const permutationInString: ProblemDef = {
  slug: 'permutation-in-string',
  title: 'Permutation in String',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/permutation-in-string/',
  technique: 'A fixed-size window over s2, compared to s1 by letter counts as it slides.',
  widget: 'array',
  widgetTitle: 's2 with sliding window',
  inputs: [
    { key: 's1', label: 'Pattern s1', defaultValue: 'ab' },
    { key: 's2', label: 'Text s2', defaultValue: 'eidbaooo', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool checkInclusion(string s1, string s2) {'),
      L('        if (s1.size() > s2.size()) return false;', 'init'),
      L('        int need[26] = {0}, have[26] = {0};', 'init'),
      L('        for (char c : s1) need[c - \'a\']++;', 'init'),
      L('        int m = s1.size();', 'init'),
      L('        for (int r = 0; r < s2.size(); r++) {', 'loop'),
      L('            have[s2[r] - \'a\']++;', 'add'),
      L('            if (r >= m) have[s2[r - m] - \'a\']--;', 'drop'),
      L('            if (r >= m - 1 && equal(need, need + 26, have))', 'cmp', 'found'),
      L('                return true;', 'found'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean checkInclusion(String s1, String s2) {'),
      L('        if (s1.length() > s2.length()) return false;', 'init'),
      L('        int[] need = new int[26], have = new int[26];', 'init'),
      L('        for (char c : s1.toCharArray()) need[c - \'a\']++;', 'init'),
      L('        int m = s1.length();', 'init'),
      L('        for (int r = 0; r < s2.length(); r++) {', 'loop'),
      L('            have[s2.charAt(r) - \'a\']++;', 'add'),
      L('            if (r >= m) have[s2.charAt(r - m) - \'a\']--;', 'drop'),
      L('            if (r >= m - 1 && Arrays.equals(need, have))', 'cmp', 'found'),
      L('                return true;', 'found'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s1 = (values.s1 ?? '').toLowerCase().trim();
    const s2 = (values.s2 ?? '').toLowerCase().trim();
    if (!/^[a-z]+$/.test(s1) || !/^[a-z]+$/.test(s2)) return { error: 'Lowercase letters only, both strings.' };
    if (s2.length > 18) return { error: 'Keep s2 to at most 18 characters.' };

    const chars = s2.split('');
    const m = s1.length;
    const steps: Step[] = [];
    const need = new Map<string, number>();
    for (const c of s1) need.set(c, (need.get(c) ?? 0) + 1);
    const have = new Map<string, number>();
    const fmt = (mp: Map<string, number>) => [...mp.entries()].filter(([, v]) => v > 0).map(([c, v]) => `${c}:${v}`).join(' ') || '—';
    const eq = () => [...need.entries()].every(([c, v]) => (have.get(c) ?? 0) === v) && [...have.entries()].every(([c, v]) => v === 0 || (need.get(c) ?? 0) === v);
    const st = (r: number, extra?: Partial<ArrayState>): ArrayState => {
      const l = Math.max(0, r - m + 1);
      return {
        arr: chars,
        window: r >= 0 ? [l, r] : null,
        aggs: [
          { label: 'need', value: fmt(need), c: 'c' },
          { label: 'have', value: fmt(have), c: 'a' },
        ],
        ...extra,
      };
    };
    if (m > s2.length) {
      return { error: 's1 must not be longer than s2.' };
    }
    steps.push({ tag: 'init', trace: ['Count s1\'s letters: ', C(fmt(need)), '. Slide a window of exactly ', A(m), ' characters over s2 and compare counts.'], state: st(-1) });
    let found = -1;
    for (let r = 0; r < chars.length; r++) {
      have.set(chars[r], (have.get(chars[r]) ?? 0) + 1);
      steps.push({ tag: 'add', trace: ['Window takes \'', A(chars[r]), '\'.'], state: st(r, { mark: { [r]: 'active' } }) });
      if (r >= m) {
        const out = chars[r - m];
        have.set(out, have.get(out)! - 1);
        steps.push({ tag: 'drop', trace: ['Window is over size — drop \'', F(out), '\' from the left.'], state: st(r, { mark: { [r - m]: 'dim' } }) });
      }
      if (r >= m - 1) {
        if (eq()) {
          found = r - m + 1;
          steps.push({
            tag: 'found',
            trace: ['Counts match exactly — "', C(s2.slice(found, r + 1)), '" is a permutation of "', C(s1), '". Return ', C('true'), '.'],
            state: st(r, { mark: Object.fromEntries([...Array(m)].map((_, i) => [found + i, 'final'])) }),
          });
          break;
        }
        steps.push({ tag: 'cmp', trace: ['Compare counts: have ', A(fmt(have)), ' vs need ', C(fmt(need)), ' — no match yet.'], state: st(r) });
      }
    }
    if (found === -1) steps.push({ tag: 'ret', trace: ['Window slid off the end with no match — return ', C('false'), '.'], state: st(chars.length - 1) });
    return { steps, result: String(found !== -1), resultDetail: found !== -1 ? `match starts at index ${found}` : undefined };
  },
  note: 'A permutation is fully described by its letter counts, and a fixed-size window\'s counts change by exactly one entering and one leaving character per slide — so each position is checked in O(26) instead of re-counting.',
  complexity: { time: 'O(n · 26)', space: 'O(26)' },
  brute: {
    label: 'Sort every window',
    technique: 'Sort s1 once; for every window of s2 with the same length, sort it and compare.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool checkInclusion(string s1, string s2) {'),
        L('        sort(s1.begin(), s1.end());', 'init'),
        L('        for (int i = 0; i + s1.size() <= s2.size(); i++) {', 'window'),
        L('            string w = s2.substr(i, s1.size());', 'window'),
        L('            sort(w.begin(), w.end());', 'window'),
        L('            if (w == s1) return true;', 'window', 'found'),
        L('        }'),
        L('        return false;', 'none'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean checkInclusion(String s1, String s2) {'),
        L('        char[] a = s1.toCharArray(); Arrays.sort(a);', 'init'),
        L('        String key = new String(a);', 'init'),
        L('        for (int i = 0; i + s1.length() <= s2.length(); i++) {', 'window'),
        L('            char[] w = s2.substring(i, i + s1.length()).toCharArray();', 'window'),
        L('            Arrays.sort(w);', 'window'),
        L('            if (new String(w).equals(key)) return true;', 'window', 'found'),
        L('        }'),
        L('        return false;', 'none'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s1 = (values.s1 ?? '').toLowerCase().trim();
      const s2 = (values.s2 ?? '').toLowerCase().trim();
      if (!/^[a-z]+$/.test(s1) || !/^[a-z]+$/.test(s2)) return { error: 'Lowercase letters only, both strings.' };
      if (s2.length > 18) return { error: 'Keep s2 to at most 18 characters.' };
      const m = s1.length;
      const key = s1.split('').sort().join('');
      const chars = s2.split('');
      const steps: Step[] = [];
      const st = (i: number | null, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: chars,
        window: i !== null ? [i, i + m - 1] : null,
        mark,
        aggs: [{ label: 'sorted s1', value: key, c: 'b' }],
      });
      steps.push({ tag: 'init', trace: ['Sort s1: "', B(key), '". Any permutation of s1 sorts to the same string.'], state: st(null) });
      let found = -1;
      for (let i = 0; i + m <= chars.length; i++) {
        const w = s2.slice(i, i + m).split('').sort().join('');
        if (w === key) {
          found = i;
          steps.push({ tag: 'found', trace: ['Window "', A(s2.slice(i, i + m)), '" sorts to "', B(w), '" — a match.'], state: st(i, Object.fromEntries([...Array(m)].map((_, k) => [i + k, 'final' as const]))) });
          break;
        }
        steps.push({ tag: 'window', trace: ['Window "', A(s2.slice(i, i + m)), '" sorts to "', F(w), '" — no.'], state: st(i) });
      }
      if (found === -1) steps.push({ tag: 'none', trace: ['No window matches — return ', C('false'), '.'], state: st(null) });
      return { steps, result: String(found !== -1), resultDetail: found !== -1 ? `match starts at index ${found}` : undefined };
    },
    note: 'Every window is re-sorted from scratch, costing O(m log m) each. Sliding a letter-count array updates only two counts per step, so each window costs O(26) instead.',
    complexity: { time: 'O(n · m log m)', space: 'O(m)' },
  },
};

/* ================= 27. Minimum Window Substring ================= */
const minWindow: ProblemDef = {
  slug: 'minimum-window-substring',
  title: 'Minimum Window Substring',
  category: 'Sliding Window',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/minimum-window-substring/',
  technique: 'Expand right until every needed character is covered, then contract left as far as possible.',
  widget: 'array',
  widgetTitle: 's with elastic window',
  inputs: [
    { key: 's', label: 'Text s', defaultValue: 'ADOBECODEBANC', wide: true },
    { key: 't', label: 'Pattern t', defaultValue: 'ABC' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string minWindow(string s, string t) {'),
      L('        unordered_map<char, int> need;', 'init'),
      L('        for (char c : t) need[c]++;', 'init'),
      L('        int required = need.size(), formed = 0;', 'init'),
      L('        unordered_map<char, int> have;', 'init'),
      L('        int l = 0, bestLen = INT_MAX, bestL = 0;', 'init'),
      L('        for (int r = 0; r < s.size(); r++) {', 'loop'),
      L('            have[s[r]]++;', 'add'),
      L('            if (need.count(s[r]) && have[s[r]] == need[s[r]])', 'add'),
      L('                formed++;', 'add'),
      L('            while (formed == required) {', 'valid'),
      L('                if (r - l + 1 < bestLen) {', 'record'),
      L('                    bestLen = r - l + 1; bestL = l;', 'record'),
      L('                }'),
      L('                have[s[l]]--;', 'contract'),
      L('                if (need.count(s[l]) && have[s[l]] < need[s[l]])', 'contract'),
      L('                    formed--;', 'contract'),
      L('                l++;', 'contract'),
      L('            }'),
      L('        }'),
      L('        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String minWindow(String s, String t) {'),
      L('        Map<Character, Integer> need = new HashMap<>();', 'init'),
      L('        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);', 'init'),
      L('        int required = need.size(), formed = 0;', 'init'),
      L('        Map<Character, Integer> have = new HashMap<>();', 'init'),
      L('        int l = 0, bestLen = Integer.MAX_VALUE, bestL = 0;', 'init'),
      L('        for (int r = 0; r < s.length(); r++) {', 'loop'),
      L('            char c = s.charAt(r);', 'add'),
      L('            have.merge(c, 1, Integer::sum);', 'add'),
      L('            if (need.containsKey(c) && have.get(c).intValue() == need.get(c))', 'add'),
      L('                formed++;', 'add'),
      L('            while (formed == required) {', 'valid'),
      L('                if (r - l + 1 < bestLen) {', 'record'),
      L('                    bestLen = r - l + 1; bestL = l;', 'record'),
      L('                }'),
      L('                char d = s.charAt(l);', 'contract'),
      L('                have.merge(d, -1, Integer::sum);', 'contract'),
      L('                if (need.containsKey(d) && have.get(d) < need.get(d))', 'contract'),
      L('                    formed--;', 'contract'),
      L('                l++;', 'contract'),
      L('            }'),
      L('        }'),
      L('        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    const t = (values.t ?? '').trim();
    if (!s || !t) return { error: 'Enter both strings.' };
    if (s.length > 20) return { error: 'Keep s to at most 20 characters.' };
    const chars = s.split('');
    const need = new Map<string, number>();
    for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
    const have = new Map<string, number>();
    const required = need.size;
    let formed = 0;
    let l = 0;
    let bestLen = Infinity;
    let bestL = 0;
    const steps: Step[] = [];
    const fmt = (mp: Map<string, number>) => [...mp.entries()].filter(([, v]) => v > 0).map(([c, v]) => `${c}:${v}`).join(' ') || '—';
    const st = (r: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars,
      window: r >= l ? [l, r] : null,
      ptrs: [
        { name: 'l', i: Math.min(l, chars.length - 1), c: 'b' },
        { name: 'r', i: Math.max(0, Math.min(r, chars.length - 1)), c: 'a' },
      ],
      aggs: [
        { label: 'need', value: fmt(need), c: 'c' },
        { label: 'have', value: fmt(have), c: 'a' },
        { label: 'formed', value: `${formed}/${required}`, c: formed === required ? 'b' : 'a' },
        { label: 'best', value: bestLen === Infinity ? '—' : `"${s.slice(bestL, bestL + bestLen)}" (${bestLen})`, c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Need ', C(fmt(need)), '. Expand right until covered, then squeeze from the left.'], state: st(-1) });
    for (let r = 0; r < chars.length && steps.length < 350; r++) {
      const c = chars[r];
      have.set(c, (have.get(c) ?? 0) + 1);
      if (need.has(c) && have.get(c) === need.get(c)) formed++;
      steps.push({
        tag: 'add',
        trace: ['Take \'', A(c), '\'', need.has(c) ? [' — a needed character ('].join('') : ' — not needed', need.has(c) ? B(`${have.get(c)}/${need.get(c)}`) : '', need.has(c) ? ' covered).' : '.'],
        state: st(r, { mark: { [r]: need.has(c) ? 'active' : 'dim' } }),
      });
      while (formed === required) {
        if (r - l + 1 < bestLen) {
          bestLen = r - l + 1;
          bestL = l;
          steps.push({
            tag: 'record',
            trace: ['Window "', B(s.slice(l, r + 1)), '" covers everything — new best, length ', B(bestLen), '.'],
            state: st(r),
          });
        }
        const d = chars[l];
        have.set(d, have.get(d)! - 1);
        if (need.has(d) && have.get(d)! < need.get(d)!) formed--;
        steps.push({
          tag: 'contract',
          trace: ['Squeeze: drop \'', F(d), '\' from the left', formed < required ? [', which breaks coverage — expansion resumes.'].join('') : ' — still covered, keep squeezing.'],
          state: st(r, { mark: { [l]: 'dim' } }),
        });
        l++;
      }
    }
    const result = bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen);
    steps.push({
      tag: 'ret',
      trace: bestLen === Infinity
        ? ['No window ever covered ', C(t), ' — return the empty string.']
        : ['Smallest covering window: "', C(result), '" (length ', C(bestLen), ').'],
      state: st(chars.length - 1, bestLen === Infinity ? {} : { mark: Object.fromEntries([...Array(bestLen)].map((_, i) => [bestL + i, 'final'])) }),
    });
    return { steps, result: result === '' ? '""' : `"${result}"`, resultDetail: bestLen === Infinity ? 'no valid window' : `length ${bestLen}` };
  },
  note: 'The window is elastic but never retreats: r only grows, and l only grows. The "formed" counter (how many distinct characters have met their quota) turns "is the window valid?" into an O(1) check instead of a map comparison.',
  complexity: { time: 'O(|s| + |t|)', space: 'O(alphabet)' },
  brute: {
    label: 'Brute force',
    technique: 'From every start, extend right until the window covers t; keep the shortest such window.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string minWindow(string s, string t) {'),
        L('        int bestL = 0, bestLen = INT_MAX;', 'init'),
        L('        for (int i = 0; i < s.size(); i++) {', 'outer'),
        L('            unordered_map<char, int> need;', 'outer'),
        L('            for (char c : t) need[c]++;', 'outer'),
        L('            int missing = t.size();', 'outer'),
        L('            for (int j = i; j < s.size(); j++) {', 'grow', 'hit'),
        L('                if (need[s[j]]-- > 0) missing--;', 'grow', 'hit'),
        L('                if (missing == 0) {', 'hit'),
        L('                    if (j - i + 1 < bestLen) { bestL = i; bestLen = j - i + 1; }', 'hit'),
        L('                    break;', 'hit'),
        L('                }'),
        L('            }'),
        L('        }'),
        L('        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String minWindow(String s, String t) {'),
        L('        int bestL = 0, bestLen = Integer.MAX_VALUE;', 'init'),
        L('        for (int i = 0; i < s.length(); i++) {', 'outer'),
        L('            int[] need = new int[128];', 'outer'),
        L('            for (char c : t.toCharArray()) need[c]++;', 'outer'),
        L('            int missing = t.length();', 'outer'),
        L('            for (int j = i; j < s.length(); j++) {', 'grow', 'hit'),
        L('                if (need[s.charAt(j)]-- > 0) missing--;', 'grow', 'hit'),
        L('                if (missing == 0) {', 'hit'),
        L('                    if (j - i + 1 < bestLen) { bestL = i; bestLen = j - i + 1; }', 'hit'),
        L('                    break;', 'hit'),
        L('                }'),
        L('            }'),
        L('        }'),
        L('        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      const t = (values.t ?? '').trim();
      if (!s || !t) return { error: 'Enter both strings.' };
      if (s.length > 20) return { error: 'Keep s to at most 20 characters.' };
      const { steps, answer, range } = everyWindow<{ need: Map<string, number>; missing: number }>({
        arr: s.split(''),
        fresh: () => {
          const need = new Map<string, number>();
          for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
          return { need, missing: t.length };
        },
        add: (st, x) => {
          const c = String(x);
          const left = st.need.get(c) ?? 0;
          if (left > 0) st.missing--;
          st.need.set(c, left - 1);
        },
        qualifies: (st) => st.missing === 0,
        goal: 'shortest',
        show: (st) => `still missing ${st.missing} of ${t.length}`,
        intro: ['From every start, extend right until the window contains all of "', A(t), '" (with multiplicity).'],
      });
      const result = range ? s.slice(range[0], range[1] + 1) : '';
      return { steps, result: result === '' ? '""' : `"${result}"`, resultDetail: range ? `length ${answer}` : 'no valid window' };
    },
    note: 'Each start rebuilds the need-counts and rescans to the right: O(|s|²). The two-pointer window never moves backwards, so every character is added and removed at most once.',
    complexity: { time: 'O(|s|² + |s|·|t|)', space: 'O(alphabet)' },
  },
};

/* ================= 28. Sliding Window Maximum ================= */
const slidingWindowMax: ProblemDef = {
  slug: 'sliding-window-maximum',
  title: 'Sliding Window Maximum',
  category: 'Sliding Window',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/sliding-window-maximum/',
  technique: 'A monotonic deque of indices — the front is always the window maximum.',
  widget: 'stack',
  widgetTitle: 'Array, window & deque',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 3, -1, -3, 5, 3, 6, 7', wide: true },
    { key: 'k', label: 'Window k', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> maxSlidingWindow(vector<int>& nums, int k) {'),
      L('        deque<int> dq;  // indices, values decreasing', 'init'),
      L('        vector<int> res;', 'init'),
      L('        for (int r = 0; r < nums.size(); r++) {', 'loop'),
      L('            while (!dq.empty() && nums[dq.back()] < nums[r])', 'pop'),
      L('                dq.pop_back();', 'pop'),
      L('            dq.push_back(r);', 'push'),
      L('            if (dq.front() <= r - k)', 'expire'),
      L('                dq.pop_front();', 'expire'),
      L('            if (r >= k - 1)', 'emit'),
      L('                res.push_back(nums[dq.front()]);', 'emit'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] maxSlidingWindow(int[] nums, int k) {'),
      L('        Deque<Integer> dq = new ArrayDeque<>();', 'init'),
      L('        int[] res = new int[nums.length - k + 1];', 'init'),
      L('        for (int r = 0; r < nums.length; r++) {', 'loop'),
      L('            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[r])', 'pop'),
      L('                dq.pollLast();', 'pop'),
      L('            dq.addLast(r);', 'push'),
      L('            if (dq.peekFirst() <= r - k)', 'expire'),
      L('                dq.pollFirst();', 'expire'),
      L('            if (r >= k - 1)', 'emit'),
      L('                res[r - k + 1] = nums[dq.peekFirst()];', 'emit'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof arr === 'string') return { error: arr };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > arr.length) return { error: 'k must be ≤ array length.' };

    const steps: Step[] = [];
    const dq: number[] = [];
    const res: number[] = [];
    const st = (r: number, extra?: { mark?: ArrayState['mark'] }): StackState => ({
      array: {
        arr,
        window: r >= k - 1 ? [r - k + 1, r] : r >= 0 ? [0, r] : null,
        ptrs: r < arr.length && r >= 0 ? [{ name: 'r', i: r, c: 'a' }] : [],
        mark: extra?.mark,
      },
      stack: dq.map((i, pos) => ({ v: `i${i}: ${arr[i]}`, c: pos === 0 ? 'b' : undefined })),
      stackLabel: 'Deque (front ↑)',
      aggs: [{ label: 'output', value: `[${res.join(', ')}]`, c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['The deque stores indices whose values are strictly decreasing — its ', B('front'), ' is always the current window\'s maximum.'], state: st(-1) });
    for (let r = 0; r < arr.length; r++) {
      while (dq.length > 0 && arr[dq[dq.length - 1]] < arr[r]) {
        const popped = dq.pop()!;
        steps.push({
          tag: 'pop',
          trace: [F(arr[popped]), ' at the back is smaller than the newcomer ', A(arr[r]), ' — it can never be a maximum again; evict it.'],
          state: st(r, { mark: { [popped]: 'dim' } }),
        });
      }
      dq.push(r);
      steps.push({ tag: 'push', trace: ['Push index ', A(r), ' (value ', A(arr[r]), ') onto the back.'], state: st(r) });
      if (dq[0] <= r - k) {
        const old = dq.shift()!;
        steps.push({ tag: 'expire', trace: ['Front index ', F(old), ' slid out of the window — expire it.'], state: st(r, { mark: { [old]: 'dim' } }) });
      }
      if (r >= k - 1) {
        res.push(arr[dq[0]]);
        steps.push({
          tag: 'emit',
          trace: ['Window [', A(r - k + 1), '…', A(r), '] complete — its max is the front: ', B(arr[dq[0]]), '.'],
          state: st(r, { mark: { [dq[0]]: 'good' } }),
        });
      }
    }
    steps.push({ tag: 'ret', trace: ['All windows emitted: ', C(`[${res.join(', ')}]`), '.'], state: st(arr.length - 1) });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'Every index is pushed once and popped at most once, so the whole run is O(n) despite the nested-looking while. The deque discards exactly the elements that are provably useless: anything smaller than a newer arrival can never be a future maximum.',
  complexity: { time: 'O(n)', space: 'O(k)' },
  brute: {
    label: 'Brute force',
    technique: 'For every window of size k, scan all k values to find its maximum.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> maxSlidingWindow(vector<int>& nums, int k) {'),
        L('        vector<int> res;', 'init'),
        L('        for (int i = 0; i + k <= nums.size(); i++) {', 'emit'),
        L('            int mx = nums[i];', 'emit'),
        L('            for (int j = i + 1; j < i + k; j++) mx = max(mx, nums[j]);', 'emit'),
        L('            res.push_back(mx);', 'emit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] maxSlidingWindow(int[] nums, int k) {'),
        L('        int[] res = new int[nums.length - k + 1];', 'init'),
        L('        for (int i = 0; i + k <= nums.length; i++) {', 'emit'),
        L('            int mx = nums[i];', 'emit'),
        L('            for (int j = i + 1; j < i + k; j++) mx = Math.max(mx, nums[j]);', 'emit'),
        L('            res[i] = mx;', 'emit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums, { maxLen: 14 });
      if (typeof arr === 'string') return { error: arr };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      if (k > arr.length) return { error: 'k must be ≤ array length.' };
      const steps: Step[] = [];
      const res: number[] = [];
      let scans = 0;
      const st = (i: number | null, maxAt?: number): StackState => ({
        array: {
          arr,
          window: i !== null ? [i, i + k - 1] : null,
          mark: maxAt !== undefined ? { [maxAt]: 'good' } : {},
        },
        stack: res.map((v) => ({ v })),
        stackLabel: 'Output',
        aggs: [{ label: 'values scanned', value: String(scans), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No deque: rescan all ', A(k), ' values of every window.'], state: st(null) });
      for (let i = 0; i + k <= arr.length; i++) {
        let at = i;
        for (let j = i + 1; j < i + k; j++) if (arr[j] > arr[at]) at = j;
        scans += k;
        res.push(arr[at]);
        steps.push({ tag: 'emit', trace: ['Window [', A(i), '..', A(i + k - 1), ']: scanning all ', A(k), ' values finds max ', B(arr[at]), '.'], state: st(i, at) });
      }
      steps.push({ tag: 'ret', trace: ['Output ', C(`[${res.join(', ')}]`), ' after scanning ', A(scans), ' values.'], state: st(null) });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'Neighbouring windows share k − 1 values, yet each is rescanned in full: O(n·k). The monotonic deque keeps only candidates that could still become a maximum, so every index is pushed and popped once.',
    complexity: { time: 'O(n · k)', space: 'O(1) beyond output' },
  },
};

/* ================= 29. Minimum Size Subarray Sum ================= */
const minSizeSubarray: ProblemDef = {
  slug: 'minimum-size-subarray-sum',
  title: 'Minimum Size Subarray Sum',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
  technique: 'Expand the window until the sum reaches the target, then shrink greedily.',
  widget: 'array',
  widgetTitle: 'Array & window',
  inputs: [
    { key: 'nums', label: 'Array (positive)', defaultValue: '2, 3, 1, 2, 4, 3', wide: true },
    { key: 'target', label: 'Target', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minSubArrayLen(int target, vector<int>& nums) {'),
      L('        int l = 0, sum = 0, best = INT_MAX;', 'init'),
      L('        for (int r = 0; r < nums.size(); r++) {', 'loop'),
      L('            sum += nums[r];', 'add'),
      L('            while (sum >= target) {', 'valid'),
      L('                best = min(best, r - l + 1);', 'record'),
      L('                sum -= nums[l++];', 'shrink'),
      L('            }'),
      L('        }'),
      L('        return best == INT_MAX ? 0 : best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minSubArrayLen(int target, int[] nums) {'),
      L('        int l = 0, sum = 0, best = Integer.MAX_VALUE;', 'init'),
      L('        for (int r = 0; r < nums.length; r++) {', 'loop'),
      L('            sum += nums[r];', 'add'),
      L('            while (sum >= target) {', 'valid'),
      L('                best = Math.min(best, r - l + 1);', 'record'),
      L('                sum -= nums[l++];', 'shrink'),
      L('            }'),
      L('        }'),
      L('        return best == Integer.MAX_VALUE ? 0 : best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums, { min: 1 });
    if (typeof arr === 'string') return { error: arr };
    const target = parseInt1(values.target, 'Target', { min: 1 });
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    let l = 0;
    let sum = 0;
    let best = Infinity;
    let bestRange: [number, number] | null = null;
    const st = (r: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      window: r >= l ? [l, r] : null,
      ptrs: [
        { name: 'l', i: Math.min(l, arr.length - 1), c: 'b' },
        { name: 'r', i: Math.max(0, Math.min(r, arr.length - 1)), c: 'a' },
      ],
      aggs: [
        { label: 'sum', value: String(sum), c: sum >= target ? 'b' : 'a' },
        { label: 'target', value: String(target), c: 'c' },
        { label: 'best length', value: best === Infinity ? '—' : String(best), c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['All values are positive, so growing the window only raises the sum and shrinking only lowers it — a perfect fit for two pointers.'], state: st(-1) });
    for (let r = 0; r < arr.length; r++) {
      sum += arr[r];
      steps.push({ tag: 'add', trace: ['Take ', A(arr[r]), ' — window sum is now ', A(sum), '.'], state: st(r, { mark: { [r]: 'active' } }) });
      while (sum >= target) {
        if (r - l + 1 < best) {
          best = r - l + 1;
          bestRange = [l, r];
          steps.push({ tag: 'record', trace: ['Sum ', B(sum), ' ≥ target — window of length ', B(best), ' works. Record it.'], state: st(r) });
        } else {
          steps.push({ tag: 'record', trace: ['Sum ', B(sum), ' still ≥ target at length ', A(r - l + 1), ' — not shorter than best.'], state: st(r) });
        }
        sum -= arr[l];
        steps.push({ tag: 'shrink', trace: ['Shrink: drop ', F(arr[l]), ', sum falls to ', A(sum), '.'], state: st(r, { mark: { [l]: 'dim' } }) });
        l++;
      }
    }
    const result = best === Infinity ? 0 : best;
    steps.push({
      tag: 'ret',
      trace: result === 0
        ? ['No window ever reached ', C(target), ' — return ', C(0), '.']
        : ['Shortest qualifying window has length ', C(result), '.'],
      state: st(arr.length - 1, bestRange ? { mark: Object.fromEntries([...Array(best)].map((_, i) => [bestRange![0] + i, 'final'])) } : {}),
    });
    return { steps, result: String(result), resultDetail: bestRange ? `[${arr.slice(bestRange[0], bestRange[1] + 1).join(', ')}]` : 'no valid subarray' };
  },
  note: 'Positivity is the license for the shrink loop: once a window qualifies, no longer window starting at the same l can be better, so l can advance permanently. Each pointer moves at most n times — O(n) total.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'From every start, add elements until the sum reaches the target; keep the shortest such subarray.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minSubArrayLen(int target, vector<int>& nums) {'),
        L('        int best = INT_MAX;', 'init'),
        L('        for (int i = 0; i < nums.size(); i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.size(); j++) {', 'grow', 'hit'),
        L('                sum += nums[j];', 'grow', 'hit'),
        L('                if (sum >= target) { best = min(best, j - i + 1); break; }', 'hit'),
        L('            }'),
        L('        }'),
        L('        return best == INT_MAX ? 0 : best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minSubArrayLen(int target, int[] nums) {'),
        L('        int best = Integer.MAX_VALUE;', 'init'),
        L('        for (int i = 0; i < nums.length; i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.length; j++) {', 'grow', 'hit'),
        L('                sum += nums[j];', 'grow', 'hit'),
        L('                if (sum >= target) { best = Math.min(best, j - i + 1); break; }', 'hit'),
        L('            }'),
        L('        }'),
        L('        return best == Integer.MAX_VALUE ? 0 : best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums, { min: 1 });
      if (typeof arr === 'string') return { error: arr };
      const target = parseInt1(values.target, 'Target', { min: 1 });
      if (typeof target === 'string') return { error: target };
      const { steps, answer, range } = everyWindow<{ sum: number }>({
        arr,
        fresh: () => ({ sum: 0 }),
        add: (s, x) => void (s.sum += Number(x)),
        qualifies: (s) => s.sum >= target,
        goal: 'shortest',
        show: (s) => `sum ${s.sum}`,
        intro: ['From every start, add elements until the sum reaches ', C(target), '.'],
      });
      return { steps, result: String(answer), resultDetail: range ? `[${arr.slice(range[0], range[1] + 1).join(', ')}]` : 'no valid subarray' };
    },
    note: 'Every start re-adds its elements: O(n²). Since all values are positive, the two-pointer window can shrink from the left the moment the sum reaches the target and never needs to go back.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

export const pointers2 = [validPalindrome, threeSum, trappingRain, sortColors, charReplacement, permutationInString, minWindow, slidingWindowMax, minSizeSubarray];
