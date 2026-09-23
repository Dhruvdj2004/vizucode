// Binary Search, part 3 — Striver SDE / Love Babbar sheet staples.
import type { BinarySearchState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ================= Search in Rotated Sorted Array II ================= */
const searchRotatedII: ProblemDef = {
  slug: 'search-in-rotated-sorted-array-ii',
  title: 'Search in Rotated Sorted Array II',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/',
  technique: 'One half is always sorted — unless duplicates hide which, in which case shrink both ends by one.',
  widget: 'binary-search',
  widgetTitle: 'Rotated array (duplicates allowed)',
  inputs: [
    { key: 'nums', label: 'Rotated sorted array', defaultValue: '2, 5, 6, 0, 0, 1, 2', wide: true },
    { key: 'target', label: 'Target', defaultValue: '0' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool search(vector<int>& a, int target) {'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (a[mid] == target) return true;', 'found'),
      L('            if (a[lo] == a[mid] && a[mid] == a[hi]) {', 'ambig'),
      L('                lo++; hi--;', 'ambig'),
      L('            } else if (a[lo] <= a[mid]) {', 'left'),
      L('                if (a[lo] <= target && target < a[mid]) hi = mid - 1;', 'left'),
      L('                else lo = mid + 1;', 'left'),
      L('            } else {', 'right'),
      L('                if (a[mid] < target && target <= a[hi]) lo = mid + 1;', 'right'),
      L('                else hi = mid - 1;', 'right'),
      L('            }'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean search(int[] a, int target) {'),
      L('        int lo = 0, hi = a.length - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (a[mid] == target) return true;', 'found'),
      L('            if (a[lo] == a[mid] && a[mid] == a[hi]) {', 'ambig'),
      L('                lo++; hi--;', 'ambig'),
      L('            } else if (a[lo] <= a[mid]) {', 'left'),
      L('                if (a[lo] <= target && target < a[mid]) hi = mid - 1;', 'left'),
      L('                else lo = mid + 1;', 'left'),
      L('            } else {', 'right'),
      L('                if (a[mid] < target && target <= a[hi]) lo = mid + 1;', 'right'),
      L('                else hi = mid - 1;', 'right'),
      L('            }'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };
    const steps: Step[] = [];
    let lo = 0;
    let hi = a.length - 1;
    let found = -1;
    const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo, hi, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: ['A rotated sorted array is two sorted runs glued together. At any midpoint, ', A('at least one side'), ' is a clean sorted run — find which, then decide.'],
      state: st({}),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Midpoint index ', A(mid), ' holds ', A(a[mid]), '.'], state: st({ mid }) });
      if (a[mid] === target) {
        found = mid;
        steps.push({ tag: 'found', trace: ['That is the target ', C(target), ' — found at index ', C(mid), '.'], state: st({ mid, best: mid, finalIndex: mid }) });
        break;
      }
      if (a[lo] === a[mid] && a[mid] === a[hi]) {
        steps.push({
          tag: 'ambig',
          trace: [
            'Both ends and the middle all read ', F(a[mid]), ' — duplicates make it impossible to tell which side is sorted. Give up one element from each end and retry.',
          ],
          state: st({ mid }),
        });
        lo++;
        hi--;
      } else if (a[lo] <= a[mid]) {
        const inLeft = a[lo] <= target && target < a[mid];
        steps.push({
          tag: 'left',
          trace: [
            'The left half [', B(a[lo]), '..', B(a[mid]), '] is sorted. Target ', A(target), inLeft ? B(' falls inside it') : F(' is not in that range'), ' — ',
            inLeft ? 'search left.' : 'so search right.',
          ],
          state: st({ mid }),
        });
        if (inLeft) hi = mid - 1;
        else lo = mid + 1;
      } else {
        const inRight = a[mid] < target && target <= a[hi];
        steps.push({
          tag: 'right',
          trace: [
            'The right half [', B(a[mid]), '..', B(a[hi]), '] is sorted. Target ', A(target), inRight ? B(' falls inside it') : F(' is not in that range'), ' — ',
            inRight ? 'search right.' : 'so search left.',
          ],
          state: st({ mid }),
        });
        if (inRight) lo = mid + 1;
        else hi = mid - 1;
      }
      if (steps.length > MAX_STEPS) break;
    }
    if (found < 0) {
      steps.push({ tag: 'ret', trace: ['The range collapsed with no hit — ', C(target), ' is not present.'], state: st({ lo, hi }) });
    }
    return { steps, result: found >= 0 ? 'true' : 'false', resultDetail: found >= 0 ? `found at index ${found}` : 'not present' };
  },
  note: 'Duplicates are the whole difference from version I. When a[lo], a[mid] and a[hi] are equal you genuinely cannot tell which side is sorted, so the only safe move is to trim one element and continue — which is why the worst case degrades to O(n) on inputs like [1,1,1,1,1,0,1].',
  complexity: { time: 'O(log n) average, O(n) worst', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Check every element; duplicates cannot fool a scan.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool search(vector<int>& nums, int target) {'),
        L('        for (int x : nums)', 'scan'),
        L('            if (x == target) return true;', 'scan', 'found'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean search(int[] nums, int target) {'),
        L('        for (int x : nums)', 'scan'),
        L('            if (x == target) return true;', 'scan', 'found'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 14 });
      if (typeof a === 'string') return { error: a };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const hi = a.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo: 0, hi, ...s }) as BinarySearchState;
      let found = -1;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === target) {
          found = i;
          steps.push({ tag: 'found', trace: ['nums[', A(i), '] = ', B(a[i]), ' — found. Return ', C('true'), '.'], state: st({ lo: i, mid: i, finalIndex: i }) });
          break;
        }
        steps.push({ tag: 'scan', trace: ['nums[', A(i), '] = ', F(a[i]), ' ≠ ', C(target), '.'], state: st({ lo: i, mid: i }) });
      }
      if (found < 0) steps.push({ tag: 'notfound', trace: ['Not present — return ', C('false'), '.'], state: st({ lo: a.length, finalIndex: null }) });
      return { steps, result: found >= 0 ? 'true' : 'false', resultDetail: found >= 0 ? `found at index ${found}` : 'not present' };
    },
    note: 'With duplicates, binary search can degrade to O(n) anyway (e.g. [1,1,1,1,1,2,1]), so the scan is the honest worst case. The binary version still wins on average by skipping the sorted half whenever the ends differ.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= Single Element in a Sorted Array ================= */
const singleElementSorted: ProblemDef = {
  slug: 'single-element-in-a-sorted-array',
  title: 'Single Element in a Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/single-element-in-a-sorted-array/',
  technique: 'Before the loner, pairs start at even indices; after it, they start at odd ones.',
  widget: 'binary-search',
  widgetTitle: 'Sorted array of pairs + one loner',
  inputs: [{ key: 'nums', label: 'Sorted array', defaultValue: '1, 1, 2, 3, 3, 4, 4, 8, 8', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int singleNonDuplicate(vector<int>& a) {'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (mid % 2 == 1) mid--;', 'even'),
      L('            if (a[mid] == a[mid + 1])', 'paired'),
      L('                lo = mid + 2;', 'paired'),
      L('            else'),
      L('                hi = mid;', 'broken'),
      L('        }'),
      L('        return a[lo];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int singleNonDuplicate(int[] a) {'),
      L('        int lo = 0, hi = a.length - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (mid % 2 == 1) mid--;', 'even'),
      L('            if (a[mid] == a[mid + 1])', 'paired'),
      L('                lo = mid + 2;', 'paired'),
      L('            else'),
      L('                hi = mid;', 'broken'),
      L('        }'),
      L('        return a[lo];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 15 });
    if (typeof a === 'string') return { error: a };
    if (a.length % 2 === 0) return { error: 'The array must have an odd length (pairs plus one loner).' };
    for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return { error: 'The array must be sorted ascending.' };
    const counts = new Map<number, number>();
    for (const v of a) counts.set(v, (counts.get(v) ?? 0) + 1);
    const singles = [...counts.values()].filter((c) => c === 1).length;
    if (singles !== 1 || [...counts.values()].some((c) => c > 2)) {
      return { error: 'Every value must appear exactly twice, except one that appears once.' };
    }
    const steps: Step[] = [];
    let lo = 0;
    let hi = a.length - 1;
    const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo, hi, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: ['Left of the loner, every pair sits at ', A('(even, odd)'), '. Right of it, the pairs are shunted to ', B('(odd, even)'), ' — that shift is what binary search hunts for.'],
      state: st({}),
    });
    while (lo < hi) {
      let mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Midpoint index ', A(mid), '.'], state: st({ mid }) });
      if (mid % 2 === 1) {
        mid--;
        steps.push({ tag: 'even', trace: ['Nudge to the even index ', A(mid), ' so we always look at the ', A('start'), ' of a would-be pair.'], state: st({ mid }) });
      }
      if (a[mid] === a[mid + 1]) {
        steps.push({
          tag: 'paired',
          trace: ['a[', B(mid), '] = a[', B(mid + 1), '] = ', B(a[mid]), ' — the pairing is still intact here, so the loner must be further ', A('right'), '.'],
          state: st({ mid }),
        });
        lo = mid + 2;
      } else {
        steps.push({
          tag: 'broken',
          trace: ['a[', F(mid), '] = ', F(a[mid]), ' ≠ a[', F(mid + 1), '] = ', F(a[mid + 1]), ' — the pairing already broke, so the loner is at ', A(mid), ' or to its left.'],
          state: st({ mid }),
        });
        hi = mid;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['The range collapsed onto index ', C(lo), ' — the single element is ', C(a[lo]), '.'], state: st({ lo, hi, best: lo, finalIndex: lo }) });
    return { steps, result: String(a[lo]), resultDetail: `at index ${lo}` };
  },
  note: 'The parity of the index is the sorted predicate here — "is the pairing still aligned?" is monotone false-then-true, which is exactly what binary search needs. A linear XOR scan also works but costs O(n); this is the O(log n) answer the problem is actually asking for.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Pair walk',
    technique: 'Step through the array two at a time; the first pair whose two values differ starts with the single element.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int singleNonDuplicate(vector<int>& nums) {'),
        L('        for (int i = 0; i + 1 < nums.size(); i += 2)', 'pair'),
        L('            if (nums[i] != nums[i + 1]) return nums[i];', 'pair', 'found'),
        L('        return nums.back();', 'found'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int singleNonDuplicate(int[] nums) {'),
        L('        for (int i = 0; i + 1 < nums.length; i += 2)', 'pair'),
        L('            if (nums[i] != nums[i + 1]) return nums[i];', 'pair', 'found'),
        L('        return nums[nums.length - 1];', 'found'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 15 });
      if (typeof a === 'string') return { error: a };
      if (a.length % 2 === 0) return { error: 'The array must have an odd length (pairs plus one loner).' };
      for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return { error: 'The array must be sorted ascending.' };
      const counts = new Map<number, number>();
      for (const v of a) counts.set(v, (counts.get(v) ?? 0) + 1);
      if ([...counts.values()].filter((c) => c === 1).length !== 1 || [...counts.values()].some((c) => c > 2)) {
        return { error: 'Every value must appear exactly twice, except one that appears once.' };
      }
      const steps: Step[] = [];
      const hi = a.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo: 0, hi, ...s }) as BinarySearchState;
      let at = a.length - 1;
      for (let i = 0; i + 1 < a.length; i += 2) {
        if (a[i] !== a[i + 1]) {
          at = i;
          break;
        }
        steps.push({ tag: 'pair', trace: ['Indices ', A(i), ' and ', A(i + 1), ' both hold ', B(a[i]), ' — a proper pair, skip both.'], state: st({ lo: i, hi: i + 1, mid: i }) });
      }
      steps.push({ tag: 'found', trace: ['Index ', A(at), ' holds ', C(a[at]), ', which has no partner next to it — that is the single element.'], state: st({ lo: at, hi: at, finalIndex: at }) });
      return { steps, result: String(a[at]), resultDetail: `at index ${at}` };
    },
    note: 'Pairs stay aligned on (even, odd) indices until the loner, so checking each pair works — but it visits up to n/2 pairs. Binary search checks that alignment at the midpoint and halves the range each time.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= Find Peak Element ================= */
const findPeakElement: ProblemDef = {
  slug: 'find-peak-element',
  title: 'Find Peak Element',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-peak-element/',
  technique: 'Always walk uphill — the slope at the midpoint says which half must contain a peak.',
  widget: 'binary-search',
  widgetTitle: 'Array (looking for any local peak)',
  inputs: [{ key: 'nums', label: 'Array (neighbours differ)', defaultValue: '1, 2, 1, 3, 5, 6, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findPeakElement(vector<int>& a) {'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (a[mid] < a[mid + 1])', 'up'),
      L('                lo = mid + 1;', 'up'),
      L('            else'),
      L('                hi = mid;', 'down'),
      L('        }'),
      L('        return lo;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findPeakElement(int[] a) {'),
      L('        int lo = 0, hi = a.length - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (a[mid] < a[mid + 1])', 'up'),
      L('                lo = mid + 1;', 'up'),
      L('            else'),
      L('                hi = mid;', 'down'),
      L('        }'),
      L('        return lo;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 15 });
    if (typeof a === 'string') return { error: a };
    for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) return { error: 'Adjacent values must differ (the problem guarantees this).' };
    const steps: Step[] = [];
    let lo = 0;
    let hi = a.length - 1;
    const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo, hi, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: ['Imagine walls of ', A('−∞'), ' on both ends. Any uphill step must eventually stop, so a peak is guaranteed — we only need to find ', B('one'), '.'],
      state: st({}),
    });
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Look at index ', A(mid), ' (value ', A(a[mid]), ') and its right neighbour ', A(a[mid + 1]), '.'], state: st({ mid }) });
      if (a[mid] < a[mid + 1]) {
        steps.push({
          tag: 'up',
          trace: ['The slope goes ', B('up'), ' (', A(a[mid]), ' < ', B(a[mid + 1]), '). Climbing must hit a peak eventually, so discard everything at or left of ', F(mid), '.'],
          state: st({ mid }),
        });
        lo = mid + 1;
      } else {
        steps.push({
          tag: 'down',
          trace: ['The slope goes ', B('down'), ' (', A(a[mid]), ' > ', F(a[mid + 1]), '). Then index ', A(mid), ' is itself on a descent from a peak — keep it and drop the right side.'],
          state: st({ mid }),
        });
        hi = mid;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Converged on index ', C(lo), ' with value ', C(a[lo]), ' — a local peak.'], state: st({ lo, hi, best: lo, finalIndex: lo }) });
    return { steps, result: String(lo), resultDetail: `value ${a[lo]}` };
  },
  note: 'This works on unsorted data, which surprises people — binary search only needs a rule that reliably eliminates half, not sortedness. "Walk toward the rising side" is that rule, and the imaginary −∞ boundaries guarantee the climb terminates inside the array.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Walk left to right and return the first index that is larger than its right neighbour.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findPeakElement(vector<int>& nums) {'),
        L('        for (int i = 0; i + 1 < nums.size(); i++)', 'up'),
        L('            if (nums[i] > nums[i + 1]) return i;', 'up', 'ret'),
        L('        return nums.size() - 1;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findPeakElement(int[] nums) {'),
        L('        for (int i = 0; i + 1 < nums.length; i++)', 'up'),
        L('            if (nums[i] > nums[i + 1]) return i;', 'up', 'ret'),
        L('        return nums.length - 1;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 15 });
      if (typeof a === 'string') return { error: a };
      for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) return { error: 'Adjacent values must differ (the problem guarantees this).' };
      const steps: Step[] = [];
      const hi = a.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo: 0, hi, ...s }) as BinarySearchState;
      let peak = a.length - 1;
      for (let i = 0; i + 1 < a.length; i++) {
        if (a[i] > a[i + 1]) {
          peak = i;
          break;
        }
        steps.push({ tag: 'up', trace: [A(a[i]), ' < ', B(a[i + 1]), ' — still climbing, move right.'], state: st({ lo: i, mid: i }) });
      }
      steps.push({
        tag: 'ret',
        trace: ['Index ', A(peak), ' (value ', C(a[peak]), ') is bigger than the next value (or is the last) — and we only got here by climbing, so it beats its left neighbour too. A peak.'],
        state: st({ lo: peak, hi: peak, finalIndex: peak }),
      });
      return { steps, result: String(peak), resultDetail: `value ${a[peak]}` };
    },
    note: 'Any peak is accepted, so this may return a different (equally valid) index than binary search. It is O(n); binary search follows the uphill slope from the midpoint and halves the range, for O(log n).',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= Find the Smallest Divisor Given a Threshold ================= */
const smallestDivisor: ProblemDef = {
  slug: 'find-the-smallest-divisor-given-a-threshold',
  title: 'Find the Smallest Divisor Given a Threshold',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/',
  technique: 'Binary search the answer: bigger divisor ⇒ smaller sum, so feasibility is monotone.',
  widget: 'binary-search',
  widgetTitle: 'Searching the divisor, not the array',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 2, 5, 9', wide: true },
    { key: 'threshold', label: 'Threshold', defaultValue: '6' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int smallestDivisor(vector<int>& a, int th) {'),
      L('        int lo = 1, hi = *max_element(a.begin(), a.end()), ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int s = 0;'),
      L('            for (int x : a) s += (x + mid - 1) / mid;', 'probe'),
      L('            if (s <= th) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int smallestDivisor(int[] a, int th) {'),
      L('        int lo = 1, hi = 0, ans;'),
      L('        for (int x : a) hi = Math.max(hi, x);'),
      L('        ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int s = 0;'),
      L('            for (int x : a) s += (x + mid - 1) / mid;', 'probe'),
      L('            if (s <= th) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 1, maxLen: 10 });
    if (typeof a === 'string') return { error: a };
    const th = parseInt1(values.threshold, 'Threshold', { min: 1 });
    if (typeof th === 'string') return { error: th };
    if (th < a.length) return { error: `Threshold must be at least the array length (${a.length}) — every element contributes at least 1.` };
    const maxV = Math.max(...a);
    const domain: [number, number] = [1, maxV];
    const steps: Step[] = [];
    let lo = 1;
    let hi = maxV;
    let ans = maxV;
    let best: number | null = null;
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'divisor', lo, hi, best, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: ['Divisor ', A(1), ' gives the largest possible sum; divisor ', A(maxV), ' makes every term 1. The answer is somewhere in between — search that range.'],
      state: st({}),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Try divisor ', A(mid), '.'], state: st({ mid }) });
      const s = a.reduce((acc, x) => acc + Math.ceil(x / mid), 0);
      const feasible = s <= th;
      steps.push({
        tag: 'probe',
        trace: ['Sum of rounded-up quotients is ', A(s), ' — ', feasible ? B(`${s} ≤ ${th} ✓`) : F(`${s} > ${th} ✗`), '.'],
        state: st({
          mid,
          probe: {
            text: `${a.map((x) => `⌈${x}/${mid}⌉`).join(' + ')} = ${s}`,
            verdict: feasible ? 'yes' : 'no',
            verdictText: feasible ? `${s} ≤ ${th} ✓` : `${s} > ${th} ✗`,
          },
        }),
      });
      if (feasible) {
        ans = mid;
        best = mid;
        hi = mid - 1;
        steps.push({ tag: 'ok', trace: ['Divisor ', B(mid), ' is within budget — record it, then try something ', A('smaller'), '.'], state: st({}) });
      } else {
        lo = mid + 1;
        steps.push({ tag: 'no', trace: ['Divisor ', F(mid), ' is too small — the sum overshoots. Search ', A('bigger'), ' divisors.'], state: st({}) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Smallest divisor keeping the sum ≤ ', C(th), ' is ', C(ans), '.'], state: st({ best: ans, lo, hi }) });
    return { steps, result: String(ans) };
  },
  note: 'The rounding-up is what makes this interesting: the sum is non-increasing in the divisor but not strictly, so plateaus exist. Binary search still works because feasibility flips exactly once from false to true — record the candidate and keep pushing left rather than returning on the first success.',
  complexity: { time: 'O(n log(max))', space: 'O(1)' },
  brute: {
    label: 'Try every divisor',
    technique: 'Try divisors 1, 2, 3, … and return the first whose rounded-up sum is within the threshold.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int smallestDivisor(vector<int>& nums, int threshold) {'),
        L('        for (int d = 1; ; d++) {', 'mid'),
        L('            long sum = 0;', 'check'),
        L('            for (int x : nums) sum += (x + d - 1) / d;', 'check'),
        L('            if (sum <= threshold) return d;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int smallestDivisor(int[] nums, int threshold) {'),
        L('        for (int d = 1; ; d++) {', 'mid'),
        L('            long sum = 0;', 'check'),
        L('            for (int x : nums) sum += (x + d - 1) / d;', 'check'),
        L('            if (sum <= threshold) return d;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 1, maxLen: 10 });
      if (typeof a === 'string') return { error: a };
      const th = parseInt1(values.threshold, 'Threshold', { min: 1 });
      if (typeof th === 'string') return { error: th };
      if (th < a.length) return { error: `Threshold must be at least the array length (${a.length}) — every element contributes at least 1.` };
      const maxV = Math.max(...a);
      const domain: [number, number] = [1, maxV];
      const steps: Step[] = [];
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'answer', domain, domainLabel: 'divisor', lo: 1, hi: maxV, ...s }) as BinarySearchState;
      let d = 1;
      for (; d <= maxV; d++) {
        const sum = a.reduce((acc, x) => acc + Math.ceil(x / d), 0);
        const ok = sum <= th;
        steps.push({
          tag: ok ? 'ret' : 'check',
          trace: ['Divisor ', A(d), ': sum = ', A(sum), ' — ', ok ? B(`${sum} ≤ ${th}, the first that works.`) : F(`${sum} > ${th}.`)],
          state: st({ lo: d, mid: d, best: ok ? d : null, probe: { text: `Σ⌈x/${d}⌉ = ${sum}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${sum} ≤ ${th} ✓` : `${sum} > ${th} ✗` } }),
        });
        if (ok) break;
      }
      steps.push({ tag: 'ret', trace: ['Smallest divisor: ', C(d), ' (after ', A(d), ' tries).'], state: st({ lo: d, hi: d, best: d }) });
      return { steps, result: String(d) };
    },
    note: 'Up to max(nums) divisors, each checked in O(n). The sum only shrinks as the divisor grows, so binary search finds the first good divisor in log(max) checks.',
    complexity: { time: 'O(n · max)', space: 'O(1)' },
  },
};

/* ================= Minimum Number of Days to Make m Bouquets ================= */
const minDaysBouquets: ProblemDef = {
  slug: 'minimum-number-of-days-to-make-m-bouquets',
  title: 'Minimum Number of Days to Make m Bouquets',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/',
  technique: 'Binary search the day — waiting longer never removes a bloomed flower, so feasibility is monotone.',
  widget: 'binary-search',
  widgetTitle: 'Searching the day',
  inputs: [
    { key: 'nums', label: 'Bloom day per flower', defaultValue: '1, 10, 3, 10, 2', wide: true },
    { key: 'm', label: 'Bouquets needed (m)', defaultValue: '3' },
    { key: 'k', label: 'Adjacent flowers each (k)', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minDays(vector<int>& b, int m, int k) {'),
      L('        if ((long)m * k > b.size()) return -1;', 'impossible'),
      L('        int lo = 1, hi = *max_element(b.begin(), b.end()), ans = -1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int run = 0, made = 0;'),
      L('            for (int x : b) {', 'probe'),
      L('                if (x <= mid) { if (++run == k) { made++; run = 0; } }', 'probe'),
      L('                else run = 0;', 'probe'),
      L('            }'),
      L('            if (made >= m) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minDays(int[] b, int m, int k) {'),
      L('        if ((long) m * k > b.length) return -1;', 'impossible'),
      L('        int lo = 1, hi = 0, ans = -1;'),
      L('        for (int x : b) hi = Math.max(hi, x);', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int run = 0, made = 0;'),
      L('            for (int x : b) {', 'probe'),
      L('                if (x <= mid) { if (++run == k) { made++; run = 0; } }', 'probe'),
      L('                else run = 0;', 'probe'),
      L('            }'),
      L('            if (made >= m) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const b = parseIntArray(values.nums, { min: 1, maxLen: 12 });
    if (typeof b === 'string') return { error: b };
    const m = parseInt1(values.m, 'm', { min: 1 });
    if (typeof m === 'string') return { error: m };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    const maxV = Math.max(...b);
    const domain: [number, number] = [1, maxV];
    let lo = 1;
    let hi = maxV;
    let ans = -1;
    let best: number | null = null;
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'day', lo, hi, best, ...s } as BinarySearchState);

    if (m * k > b.length) {
      steps.push({
        tag: 'impossible',
        trace: ['You need ', F(m * k), ' flowers in total but there are only ', F(b.length), ' — no day will ever work.'],
        state: st({}),
      });
      steps.push({ tag: 'ret', trace: ['Impossible: ', C(-1), '.'], state: st({}) });
      return { steps, result: '-1' };
    }
    steps.push({
      tag: 'init',
      trace: ['Waiting one more day only ever ', A('adds'), ' bloomed flowers — so "can I do it by day d?" is false then true. Binary search that flip.'],
      state: st({}),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Try day ', A(mid), '.'], state: st({ mid }) });
      let run = 0;
      let made = 0;
      for (const x of b) {
        if (x <= mid) {
          run++;
          if (run === k) {
            made++;
            run = 0;
          }
        } else run = 0;
      }
      const feasible = made >= m;
      steps.push({
        tag: 'probe',
        trace: ['By day ', A(mid), ' the bloomed pattern yields ', A(made), ' bouquet(s) — ', feasible ? B(`${made} ≥ ${m} ✓`) : F(`${made} < ${m} ✗`), '.'],
        state: st({
          mid,
          probe: {
            text: `bloomed: ${b.map((x) => (x <= mid ? '🌸' : '·')).join(' ')}  →  ${made} bouquet(s) of ${k}`,
            verdict: feasible ? 'yes' : 'no',
            verdictText: feasible ? `${made} ≥ ${m} ✓` : `${made} < ${m} ✗`,
          },
        }),
      });
      if (feasible) {
        ans = mid;
        best = mid;
        hi = mid - 1;
        steps.push({ tag: 'ok', trace: ['Day ', B(mid), ' is enough — record it and try an ', A('earlier'), ' day.'], state: st({}) });
      } else {
        lo = mid + 1;
        steps.push({ tag: 'no', trace: ['Not enough bouquets by day ', F(mid), ' — wait ', A('longer'), '.'], state: st({}) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Earliest day with ', C(m), ' bouquet(s): day ', C(ans), '.'], state: st({ best: ans, lo, hi }) });
    return { steps, result: String(ans) };
  },
  note: 'The adjacency requirement is what stops you from just sorting bloom days: a bouquet needs k consecutive flowers, so the check has to scan runs. Notice the run counter resets on any unbloomed flower — that reset is the single line most buggy submissions forget.',
  complexity: { time: 'O(n log(max day))', space: 'O(1)' },
  brute: {
    label: 'Try every day',
    technique: 'For day 1, 2, 3, … count how many bouquets of k adjacent bloomed flowers you can make; stop at the first day that gives m.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minDays(vector<int>& bloom, int m, int k) {'),
        L('        if ((long) m * k > bloom.size()) return -1;', 'impossible'),
        L('        int last = *max_element(bloom.begin(), bloom.end());'),
        L('        for (int day = 1; day <= last; day++) {', 'mid'),
        L('            int made = 0, run = 0;', 'check'),
        L('            for (int b : bloom) {', 'check'),
        L('                run = (b <= day) ? run + 1 : 0;', 'check'),
        L('                if (run == k) { made++; run = 0; }', 'check'),
        L('            }'),
        L('            if (made >= m) return day;', 'check', 'ret'),
        L('        }'),
        L('        return -1;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minDays(int[] bloom, int m, int k) {'),
        L('        if ((long) m * k > bloom.length) return -1;', 'impossible'),
        L('        int last = 0;'),
        L('        for (int b : bloom) last = Math.max(last, b);'),
        L('        for (int day = 1; day <= last; day++) {', 'mid'),
        L('            int made = 0, run = 0;', 'check'),
        L('            for (int b : bloom) {', 'check'),
        L('                run = (b <= day) ? run + 1 : 0;', 'check'),
        L('                if (run == k) { made++; run = 0; }', 'check'),
        L('            }'),
        L('            if (made >= m) return day;', 'check', 'ret'),
        L('        }'),
        L('        return -1;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const b = parseIntArray(values.nums, { min: 1, maxLen: 12 });
      if (typeof b === 'string') return { error: b };
      const m = parseInt1(values.m, 'm', { min: 1 });
      if (typeof m === 'string') return { error: m };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      const maxV = Math.max(...b);
      const domain: [number, number] = [1, maxV];
      const steps: Step[] = [];
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'answer', domain, domainLabel: 'day', lo: 1, hi: maxV, ...s }) as BinarySearchState;
      if (m * k > b.length) {
        steps.push({ tag: 'impossible', trace: ['You need ', F(m * k), ' flowers but there are only ', F(b.length), ' — return ', C(-1), '.'], state: st({}) });
        return { steps, result: '-1' };
      }
      const made = (day: number) => {
        let cnt = 0;
        let run = 0;
        for (const x of b) {
          run = x <= day ? run + 1 : 0;
          if (run === k) {
            cnt++;
            run = 0;
          }
        }
        return cnt;
      };
      let ans = -1;
      for (let day = 1; day <= maxV; day++) {
        const got = made(day);
        const ok = got >= m;
        steps.push({
          tag: ok ? 'ret' : 'check',
          trace: ['Day ', A(day), ': ', A(got), ' bouquet(s) possible — ', ok ? B(`enough for ${m}.`) : F(`need ${m}.`)],
          state: st({ lo: day, mid: day, best: ok ? day : null, probe: { text: `bouquets(day=${day}) = ${got}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${got} ≥ ${m} ✓` : `${got} < ${m} ✗` } }),
        });
        if (ok) {
          ans = day;
          break;
        }
      }
      steps.push({ tag: 'ret', trace: ['Earliest day: ', C(ans), '.'], state: st({ lo: ans, hi: ans, best: ans }) });
      return { steps, result: String(ans) };
    },
    note: 'Every candidate day costs an O(n) pass, and the last bloom day can be huge (up to 10⁹ on LeetCode). Since bouquets only increase with the day, binary search on the day needs just log(max day) passes.',
    complexity: { time: 'O(n · max day)', space: 'O(1)' },
  },
};

/* ================= Split Array Largest Sum ================= */
const splitArrayLargestSum: ProblemDef = {
  slug: 'split-array-largest-sum',
  title: 'Split Array Largest Sum',
  category: 'Binary Search',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/split-array-largest-sum/',
  technique: 'Binary search the allowed maximum, then greedily count how many parts it forces.',
  widget: 'binary-search',
  widgetTitle: 'Searching the largest allowed part sum',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '7, 2, 5, 10, 8', wide: true },
    { key: 'k', label: 'Parts (k)', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int splitArray(vector<int>& a, int k) {'),
      L('        int lo = *max_element(a.begin(), a.end());', 'init'),
      L('        int hi = accumulate(a.begin(), a.end(), 0), ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int parts = 1, cur = 0;'),
      L('            for (int x : a) {', 'probe'),
      L('                if (cur + x > mid) { parts++; cur = x; }', 'probe'),
      L('                else cur += x;', 'probe'),
      L('            }'),
      L('            if (parts <= k) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int splitArray(int[] a, int k) {'),
      L('        int lo = 0, hi = 0;'),
      L('        for (int x : a) { lo = Math.max(lo, x); hi += x; }'),
      L('        int ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int parts = 1, cur = 0;'),
      L('            for (int x : a) {', 'probe'),
      L('                if (cur + x > mid) { parts++; cur = x; }', 'probe'),
      L('                else cur += x;', 'probe'),
      L('            }'),
      L('            if (parts <= k) { ans = mid; hi = mid - 1; }', 'ok'),
      L('            else lo = mid + 1;', 'no'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 0, maxLen: 10 });
    if (typeof a === 'string') return { error: a };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > a.length) return { error: `k cannot exceed the array length (${a.length}).` };
    const maxV = Math.max(...a);
    const total = a.reduce((x, y) => x + y, 0);
    const domain: [number, number] = [maxV, total];
    const steps: Step[] = [];
    let lo = maxV;
    let hi = total;
    let ans = total;
    let best: number | null = null;
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'largest part sum', lo, hi, best, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: [
        'The answer is at least ', A(maxV), ' (the biggest element must fit in some part) and at most ', A(total), ' (one part holds everything). Search that window.',
      ],
      state: st({}),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Suppose no part may exceed ', A(mid), '.'], state: st({ mid }) });
      let parts = 1;
      let cur = 0;
      const layout: string[] = [];
      let piece: number[] = [];
      for (const x of a) {
        if (cur + x > mid) {
          layout.push(`[${piece.join(' ')}]`);
          piece = [x];
          parts++;
          cur = x;
        } else {
          piece.push(x);
          cur += x;
        }
      }
      layout.push(`[${piece.join(' ')}]`);
      const feasible = parts <= k;
      steps.push({
        tag: 'probe',
        trace: ['Greedily fill parts up to that cap — it takes ', A(parts), ' part(s). ', feasible ? B(`${parts} ≤ ${k} ✓`) : F(`${parts} > ${k} ✗`), '.'],
        state: st({
          mid,
          probe: {
            text: `cap ${mid} → ${layout.join(' ')}`,
            verdict: feasible ? 'yes' : 'no',
            verdictText: feasible ? `${parts} ≤ ${k} parts ✓` : `${parts} > ${k} parts ✗`,
          },
        }),
      });
      if (feasible) {
        ans = mid;
        best = mid;
        hi = mid - 1;
        steps.push({ tag: 'ok', trace: ['Cap ', B(mid), ' fits in ', B(k), ' part(s) — record it and try a ', A('tighter'), ' cap.'], state: st({}) });
      } else {
        lo = mid + 1;
        steps.push({ tag: 'no', trace: ['Cap ', F(mid), ' is too tight — it forces too many parts. Loosen it.'], state: st({}) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Smallest achievable largest-part sum: ', C(ans), '.'], state: st({ best: ans, lo, hi }) });
    return { steps, result: String(ans) };
  },
  note: 'Greedy filling is optimal for the check because starting a new part earlier than forced can never reduce the part count. Turning "minimise the maximum" into "is this maximum achievable?" is the standard move — the identical solution answers book allocation and painter\'s partition.',
  complexity: { time: 'O(n log(sum))', space: 'O(1)' },
  brute: {
    label: 'Try every limit',
    technique: 'Raise the allowed largest sum one at a time from max(nums) until a greedy split needs at most k parts.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int splitArray(vector<int>& nums, int k) {'),
        L('        int limit = *max_element(nums.begin(), nums.end());', 'init'),
        L('        for (; ; limit++) {', 'mid'),
        L('            int parts = 1, sum = 0;', 'check'),
        L('            for (int x : nums) {', 'check'),
        L('                if (sum + x > limit) { parts++; sum = 0; }', 'check'),
        L('                sum += x;', 'check'),
        L('            }'),
        L('            if (parts <= k) return limit;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int splitArray(int[] nums, int k) {'),
        L('        int limit = 0;', 'init'),
        L('        for (int x : nums) limit = Math.max(limit, x);', 'init'),
        L('        for (; ; limit++) {', 'mid'),
        L('            int parts = 1, sum = 0;', 'check'),
        L('            for (int x : nums) {', 'check'),
        L('                if (sum + x > limit) { parts++; sum = 0; }', 'check'),
        L('                sum += x;', 'check'),
        L('            }'),
        L('            if (parts <= k) return limit;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 0, maxLen: 10 });
      if (typeof a === 'string') return { error: a };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      if (k > a.length) return { error: `k cannot exceed the array length (${a.length}).` };
      const maxV = Math.max(...a);
      const total = a.reduce((x, y) => x + y, 0);
      const domain: [number, number] = [maxV, total];
      const steps: Step[] = [];
      const st = (s: Partial<BinarySearchState>): BinarySearchState =>
        ({ mode: 'answer', domain, domainLabel: 'largest part sum', lo: maxV, hi: total, ...s }) as BinarySearchState;
      const partsFor = (limit: number) => {
        let parts = 1;
        let sum = 0;
        for (const x of a) {
          if (sum + x > limit) {
            parts++;
            sum = 0;
          }
          sum += x;
        }
        return parts;
      };
      steps.push({ tag: 'init', trace: ['Start the limit at the biggest element, ', A(maxV), ', and raise it by 1 until k parts are enough.'], state: st({}) });
      let limit = maxV;
      let tries = 0;
      for (; limit <= total; limit++) {
        tries++;
        const parts = partsFor(limit);
        const ok = parts <= k;
        if (ok || tries <= 30) {
          steps.push({
            tag: ok ? 'ret' : 'check',
            trace: ['Limit ', A(limit), ' needs ', A(parts), ' part(s) — ', ok ? B(`≤ ${k}, done.`) : F(`more than ${k}.`)],
            state: st({ lo: limit, mid: limit, best: ok ? limit : null, probe: { text: `parts(limit=${limit}) = ${parts}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${parts} ≤ ${k} ✓` : `${parts} > ${k} ✗` } }),
          });
        } else if (tries === 31) {
          steps.push({ tag: 'check', trace: ['… still too small — keep raising the limit …'], state: st({ lo: limit, mid: limit }) });
        }
        if (ok) break;
      }
      steps.push({ tag: 'ret', trace: ['Smallest possible largest sum: ', C(limit), ' (', A(tries), ' limits tried).'], state: st({ lo: limit, hi: limit, best: limit }) });
      return { steps, result: String(limit) };
    },
    note: 'The number of limits between max(nums) and sum(nums) can be enormous, and each needs an O(n) greedy pass. The parts count only falls as the limit rises, so binary search finds the answer in log(sum) passes.',
    complexity: { time: 'O(n · (sum − max))', space: 'O(1)' },
  },
};

/* ================= Kth Missing Positive Number ================= */
const kthMissingPositive: ProblemDef = {
  slug: 'kth-missing-positive-number',
  title: 'Kth Missing Positive Number',
  category: 'Binary Search',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/kth-missing-positive-number/',
  technique: 'a[i] − (i+1) counts how many positives are missing up to index i — binary search that count.',
  widget: 'binary-search',
  widgetTitle: 'Strictly increasing array',
  inputs: [
    { key: 'nums', label: 'Sorted positive array', defaultValue: '2, 3, 4, 7, 11', wide: true },
    { key: 'k', label: 'k', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findKthPositive(vector<int>& a, int k) {'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int missing = a[mid] - (mid + 1);', 'count'),
      L('            if (missing < k) lo = mid + 1;', 'right'),
      L('            else hi = mid - 1;', 'left'),
      L('        }'),
      L('        return lo + k;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findKthPositive(int[] a, int k) {'),
      L('        int lo = 0, hi = a.length - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int missing = a[mid] - (mid + 1);', 'count'),
      L('            if (missing < k) lo = mid + 1;', 'right'),
      L('            else hi = mid - 1;', 'left'),
      L('        }'),
      L('        return lo + k;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 1, maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) return { error: 'The array must be strictly increasing.' };
    const k = parseInt1(values.k, 'k', { min: 1, max: 50 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    let lo = 0;
    let hi = a.length - 1;
    const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr: a, lo, hi, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: [
        'If nothing were missing, index ', A('i'), ' would hold ', A('i+1'), '. So ', B('a[i] − (i+1)'), ' is exactly how many positives are missing before it — and that count only grows.',
      ],
      state: st({}),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const missing = a[mid] - (mid + 1);
      steps.push({
        tag: 'count',
        trace: ['At index ', A(mid), ': value ', A(a[mid]), ' minus the expected ', A(mid + 1), ' means ', B(missing), ' number(s) are missing up to here.'],
        state: st({ mid }),
      });
      if (missing < k) {
        steps.push({ tag: 'right', trace: [B(missing), ' < ', A(k), ' — the k-th missing number is still ahead. Move right.'], state: st({ mid }) });
        lo = mid + 1;
      } else {
        steps.push({ tag: 'left', trace: [B(missing), ' ≥ ', A(k), ' — we have already passed the k-th missing number. Move left.'], state: st({ mid }) });
        hi = mid - 1;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const ans = lo + k;
    steps.push({
      tag: 'ret',
      trace: [
        'The search settles with ', A(lo), ' array elements sitting below the answer. Those elements push the count up by ', A(lo), ', so the k-th missing positive is ', C(`${lo} + ${k} = ${ans}`), '.',
      ],
      state: st({ lo, hi, best: null }),
    });
    return { steps, result: String(ans) };
  },
  note: 'The final "lo + k" is the part worth pausing on: lo ends up as the number of present values that are smaller than the answer, and each of them shifts the missing sequence up by one. Walking the array linearly also works in O(n) — the binary search is what gets it to O(log n).',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Count up',
    technique: 'Walk the positive integers 1, 2, 3, … counting the ones not in the array until the k-th is reached.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findKthPositive(vector<int>& arr, int k) {'),
        L('        int i = 0;', 'init'),
        L('        for (int x = 1; ; x++) {', 'walk'),
        L('            if (i < arr.size() && arr[i] == x) i++;', 'walk'),
        L('            else if (--k == 0) return x;', 'miss', 'ret'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findKthPositive(int[] arr, int k) {'),
        L('        int i = 0;', 'init'),
        L('        for (int x = 1; ; x++) {', 'walk'),
        L('            if (i < arr.length && arr[i] == x) i++;', 'walk'),
        L('            else if (--k == 0) return x;', 'miss', 'ret'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 1, maxLen: 14 });
      if (typeof a === 'string') return { error: a };
      for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) return { error: 'The array must be strictly increasing.' };
      const k = parseInt1(values.k, 'k', { min: 1, max: 50 });
      if (typeof k === 'string') return { error: k };
      const steps: Step[] = [];
      const hi = a.length - 1;
      let i = 0;
      let missing = 0;
      const st = (s: Partial<BinarySearchState>): BinarySearchState =>
        ({ mode: 'array', arr: a, lo: Math.min(i, hi), hi, ...s, probe: { text: `missing so far: ${missing} of ${k}` } }) as BinarySearchState;
      steps.push({ tag: 'init', trace: ['Count up from 1, skipping values that are in the array; every other value is ', A('missing'), '.'], state: st({}) });
      let x = 1;
      for (; ; x++) {
        if (i < a.length && a[i] === x) {
          steps.push({ tag: 'walk', trace: [B(x), ' is in the array — not missing.'], state: st({ mid: i }) });
          i++;
        } else {
          missing++;
          if (missing === k) {
            steps.push({ tag: 'ret', trace: [C(x), ' is missing — it is missing number #', C(k), '.'], state: st({}) });
            break;
          }
          steps.push({ tag: 'miss', trace: [A(x), ' is missing — that is #', A(missing), '.'], state: st({}) });
        }
      }
      return { steps, result: String(x) };
    },
    note: 'This walks every number up to the answer, which is O(n + k). Because a[i] − (i + 1) counts the missing numbers before index i and never decreases, binary search finds the right gap in O(log n).',
    complexity: { time: 'O(n + k)', space: 'O(1)' },
  },
};

/* ================= Search a 2D Matrix II ================= */
const search2DMatrixII: ProblemDef = {
  slug: 'search-a-2d-matrix-ii',
  title: 'Search a 2D Matrix II',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/search-a-2d-matrix-ii/',
  technique: 'Start at the top-right corner — each comparison eliminates a whole row or column.',
  widget: 'matrix',
  widgetTitle: 'Matrix (rows and columns both sorted)',
  inputs: [
    { key: 'grid', label: 'Matrix (rows ";" separated)', defaultValue: '1,4,7,11;2,5,8,12;3,6,9,16;10,13,14,17', wide: true },
    { key: 'target', label: 'Target', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool searchMatrix(vector<vector<int>>& m, int target) {'),
      L('        int r = 0, c = m[0].size() - 1;', 'init'),
      L('        while (r < m.size() && c >= 0) {', 'loop'),
      L('            if (m[r][c] == target) return true;', 'found'),
      L('            if (m[r][c] > target) c--;', 'left'),
      L('            else r++;', 'down'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean searchMatrix(int[][] m, int target) {'),
      L('        int r = 0, c = m[0].length - 1;', 'init'),
      L('        while (r < m.length && c >= 0) {', 'loop'),
      L('            if (m[r][c] == target) return true;', 'found'),
      L('            if (m[r][c] > target) c--;', 'left'),
      L('            else r++;', 'down'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.grid ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
    if (rows.length === 0) return { error: 'Enter a matrix, rows separated by ";".' };
    if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'All entries must be numbers.' };
    const w = rows[0].length;
    if (!rows.every((r) => r.length === w)) return { error: 'All rows must have the same length.' };
    if (rows.length > 6 || w > 6) return { error: 'Keep it to at most 6×6.' };
    for (const r of rows) for (let c = 1; c < w; c++) if (r[c] < r[c - 1]) return { error: 'Each row must be sorted ascending.' };
    for (let c = 0; c < w; c++) for (let r = 1; r < rows.length; r++) if (rows[r][c] < rows[r - 1][c]) return { error: 'Each column must be sorted ascending.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const R = rows.length;
    const steps: Step[] = [];
    const dead = new Set<string>();
    const view = (r: number, c: number, mark: 'active' | 'good' | 'final' = 'active'): MatrixState => ({
      grid: rows,
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(w)].map((_, i) => i),
      mark: { ...Object.fromEntries([...dead].map((key) => [key, 'dim' as const])), [`${r},${c}`]: mark },
      aggs: [{ label: 'target', value: String(target), c: 'a' }],
    });
    let r = 0;
    let c = w - 1;
    steps.push({
      tag: 'init',
      trace: [
        'Start at the ', A('top-right'), ' corner. It is the largest in its row and the smallest in its column — so one comparison always rules out an entire row or column.',
      ],
      state: view(r, c),
    });
    let found: [number, number] | null = null;
    while (r < R && c >= 0) {
      const v = rows[r][c];
      if (v === target) {
        found = [r, c];
        steps.push({ tag: 'found', trace: ['Found ', C(target), ' at row ', C(r), ', column ', C(c), '.'], state: view(r, c, 'final') });
        break;
      }
      if (v > target) {
        steps.push({
          tag: 'left',
          trace: [A(v), ' > ', A(target), ' — everything below it in column ', F(c), ' is even bigger, so drop the whole column.'],
          state: view(r, c),
        });
        for (let i = r; i < R; i++) dead.add(`${i},${c}`);
        c--;
      } else {
        steps.push({
          tag: 'down',
          trace: [A(v), ' < ', A(target), ' — everything to its left in row ', F(r), ' is even smaller, so drop the whole row.'],
          state: view(r, c),
        });
        for (let j = 0; j <= c; j++) dead.add(`${r},${j}`);
        r++;
      }
      if (steps.length > MAX_STEPS) break;
    }
    if (!found) {
      steps.push({ tag: 'ret', trace: ['Walked off the matrix without a hit — ', C(target), ' is not present.'], state: { grid: rows, mark: {} } });
    }
    return { steps, result: found ? 'true' : 'false', resultDetail: found ? `at (${found[0]}, ${found[1]})` : 'not present' };
  },
  note: 'The top-right corner is the only starting point where both moves are unambiguous — starting top-left, both "right" and "down" increase the value, so neither can be ruled out. Each step removes one row or one column, giving O(m + n): better than binary-searching every row at O(m log n).',
  complexity: { time: 'O(m + n)', space: 'O(1)' },
  brute: {
    label: 'Binary search each row',
    technique: 'Binary search every row separately, skipping rows whose range cannot contain the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool searchMatrix(vector<vector<int>>& m, int target) {'),
        L('        for (auto& row : m) {', 'row'),
        L('            if (row[0] > target || row.back() < target) continue;', 'skip'),
        L('            if (binary_search(row.begin(), row.end(), target))', 'row', 'found'),
        L('                return true;', 'found'),
        L('        }'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean searchMatrix(int[][] m, int target) {'),
        L('        for (int[] row : m) {', 'row'),
        L('            if (row[0] > target || row[row.length - 1] < target) continue;', 'skip'),
        L('            if (Arrays.binarySearch(row, target) >= 0)', 'row', 'found'),
        L('                return true;', 'found'),
        L('        }'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const rows = (values.grid ?? '')
        .split(/[;|]/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
      if (rows.length === 0) return { error: 'Enter a matrix, rows separated by ";".' };
      if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'All entries must be numbers.' };
      const w = rows[0].length;
      if (!rows.every((r) => r.length === w)) return { error: 'All rows must have the same length.' };
      if (rows.length > 6 || w > 6) return { error: 'Keep it to at most 6×6.' };
      for (const r of rows) for (let c = 1; c < w; c++) if (r[c] < r[c - 1]) return { error: 'Each row must be sorted ascending.' };
      for (let c = 0; c < w; c++) for (let r = 1; r < rows.length; r++) if (rows[r][c] < rows[r - 1][c]) return { error: 'Each column must be sorted ascending.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const R = rows.length;
      const steps: Step[] = [];
      const dead: MatrixState['mark'] = {};
      const view = (extra?: MatrixState['mark']): MatrixState => ({
        grid: rows,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(w)].map((_, i) => i),
        mark: { ...dead, ...extra },
      });
      let found: [number, number] | null = null;
      for (let r = 0; r < R && !found; r++) {
        const row = rows[r];
        if (row[0] > target || row[w - 1] < target) {
          for (let c = 0; c < w; c++) dead[`${r},${c}`] = 'dim';
          steps.push({ tag: 'skip', trace: ['Row ', A(r), ' spans ', F(`${row[0]}…${row[w - 1]}`), ' — ', C(target), ' cannot be in it. Skip.'], state: view() });
          continue;
        }
        let lo = 0;
        let hi = w - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (row[mid] === target) {
            found = [r, mid];
            break;
          }
          steps.push({
            tag: 'row',
            trace: ['Row ', A(r), ', binary search: mid column ', A(mid), ' holds ', F(row[mid]), row[mid] < target ? ' < target, go right.' : ' > target, go left.'],
            state: view({ [`${r},${mid}`]: 'active' }),
          });
          if (row[mid] < target) lo = mid + 1;
          else hi = mid - 1;
        }
        if (!found) for (let c = 0; c < w; c++) dead[`${r},${c}`] = 'dim';
      }
      if (found) steps.push({ tag: 'found', trace: ['Found ', C(target), ' at (', C(found[0]), ', ', C(found[1]), ').'], state: view({ [`${found[0]},${found[1]}`]: 'final' }) });
      else steps.push({ tag: 'notfound', trace: ['No row contains ', C(target), ' — return ', C('false'), '.'], state: view() });
      return { steps, result: found ? 'true' : 'false', resultDetail: found ? `at (${found[0]}, ${found[1]})` : 'not present' };
    },
    note: 'Uses only the row ordering, so it costs O(R log C). The staircase walk also uses the column ordering: each comparison discards a whole row or column, giving O(R + C).',
    complexity: { time: 'O(R · log C)', space: 'O(1)' },
  },
};

/* ================= First Bad Version ================= */
const firstBadVersion: ProblemDef = {
  slug: 'first-bad-version',
  title: 'First Bad Version',
  category: 'Binary Search',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/first-bad-version/',
  technique: 'Versions are good then bad — binary search the boundary with the fewest API calls.',
  widget: 'binary-search',
  widgetTitle: 'Version range',
  inputs: [
    { key: 'n', label: 'Number of versions (n)', defaultValue: '20' },
    { key: 'bad', label: 'First bad version (hidden from the algorithm)', defaultValue: '13' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int firstBadVersion(int n) {'),
      L('        int lo = 1, hi = n;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (isBadVersion(mid))', 'bad'),
      L('                hi = mid;', 'bad'),
      L('            else'),
      L('                lo = mid + 1;', 'good'),
      L('        }'),
      L('        return lo;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Solution extends VersionControl {'),
      L('    public int firstBadVersion(int n) {'),
      L('        int lo = 1, hi = n;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (isBadVersion(mid))', 'bad'),
      L('                hi = mid;', 'bad'),
      L('            else'),
      L('                lo = mid + 1;', 'good'),
      L('        }'),
      L('        return lo;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 200 });
    if (typeof n === 'string') return { error: n };
    const bad = parseInt1(values.bad, 'First bad version', { min: 1 });
    if (typeof bad === 'string') return { error: bad };
    if (bad > n) return { error: `The first bad version must be ≤ n (${n}).` };
    const steps: Step[] = [];
    const domain: [number, number] = [1, n];
    let lo = 1;
    let hi = n;
    let calls = 0;
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'version', lo, hi, ...s } as BinarySearchState);
    steps.push({
      tag: 'init',
      trace: ['Once a version is bad, every later one is too. That makes the API answer ', A('good, good, …, bad, bad'), ' — one clean flip to binary search for.'],
      state: st({}),
    });
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Test version ', A(mid), '.'], state: st({ mid }) });
      calls++;
      const isBad = mid >= bad;
      steps.push({
        tag: isBad ? 'bad' : 'good',
        trace: isBad
          ? ['isBadVersion(', A(mid), ') = ', B('true'), ' — so the first bad one is ', A(mid), ' or earlier. Keep ', A(mid), ' as a candidate.']
          : ['isBadVersion(', A(mid), ') = ', F('false'), ' — everything up to and including ', F(mid), ' is fine. Search after it.'],
        state: st({
          mid,
          probe: { text: `isBadVersion(${mid})`, verdict: isBad ? 'yes' : 'no', verdictText: isBad ? 'bad ✗' : 'good ✓' },
        }),
      });
      if (isBad) hi = mid;
      else lo = mid + 1;
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Range collapsed — first bad version is ', C(lo), ', found in ', C(calls), ' API call(s) instead of up to ', C(n), '.'],
      state: st({ lo, hi, best: lo }),
    });
    return { steps, result: String(lo), resultDetail: `${calls} API calls` };
  },
  note: 'Using hi = mid rather than mid − 1 is deliberate: mid might itself be the answer, so it must stay in the range. Paired with the lo < hi loop condition, the range always shrinks and converges without ever needing an extra bounds check.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Call isBadVersion(1), isBadVersion(2), … and return the first version that is bad.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int firstBadVersion(int n) {'),
        L('        for (int v = 1; v < n; v++)', 'mid'),
        L('            if (isBadVersion(v)) return v;', 'mid', 'ret'),
        L('        return n;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('public class Solution extends VersionControl {'),
        L('    public int firstBadVersion(int n) {'),
        L('        for (int v = 1; v < n; v++)', 'mid'),
        L('            if (isBadVersion(v)) return v;', 'mid', 'ret'),
        L('        return n;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 1, max: 200 });
      if (typeof n === 'string') return { error: n };
      const bad = parseInt1(values.bad, 'First bad version', { min: 1 });
      if (typeof bad === 'string') return { error: bad };
      if (bad > n) return { error: `The first bad version must be ≤ n (${n}).` };
      const steps: Step[] = [];
      const domain: [number, number] = [1, n];
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'answer', domain, domainLabel: 'version', lo: 1, hi: n, ...s }) as BinarySearchState;
      let calls = 0;
      let v = 1;
      for (; v < n; v++) {
        calls++;
        const isBad = v >= bad;
        steps.push({
          tag: isBad ? 'ret' : 'mid',
          trace: ['isBadVersion(', A(v), ') → ', isBad ? B('bad') : F('good'), isBad ? ' — the first bad one.' : '.'],
          state: st({ lo: v, mid: v, best: isBad ? v : null }),
        });
        if (isBad) break;
      }
      steps.push({ tag: 'ret', trace: ['First bad version: ', C(v), ', after ', A(calls), ' API call(s).'], state: st({ lo: v, hi: v, best: v }) });
      return { steps, result: String(v), resultDetail: `${calls} API calls` };
    },
    note: 'Each API call is expensive, and a late first-bad version costs close to n calls. The good→bad sequence has exactly one flip, so binary search needs only about log₂ n calls.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

export const binarySearch3: ProblemDef[] = [
  searchRotatedII,
  singleElementSorted,
  findPeakElement,
  smallestDivisor,
  minDaysBouquets,
  splitArrayLargestSum,
  kthMissingPositive,
  search2DMatrixII,
  firstBadVersion,
];
