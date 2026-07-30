// Two Pointers (remaining) + Sliding Window (remaining).
import type { ArrayState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

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
};

export const pointers2 = [validPalindrome, threeSum, trappingRain, sortColors, charReplacement, permutationInString, minWindow, slidingWindowMax, minSizeSubarray];
