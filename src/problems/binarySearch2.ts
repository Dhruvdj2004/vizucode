// Binary Search, remaining problems.
import type { BinarySearchState, ListState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { parseNumGrid } from './arraysHashing2';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 40. Search a 2D Matrix ================= */
const search2D: ProblemDef = {
  slug: 'search-a-2d-matrix',
  title: 'Search a 2D Matrix',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/search-a-2d-matrix/',
  technique: 'Treat the matrix as one sorted array — binary search on virtual indices.',
  widget: 'matrix',
  widgetTitle: 'Matrix as flattened array',
  inputs: [
    { key: 'matrix', label: 'Matrix (rows ";" separated, rows sorted)', defaultValue: '1,3,5,7;10,11,16,20;23,30,34,60', wide: true },
    { key: 'target', label: 'Target', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool searchMatrix(vector<vector<int>>& matrix, int target) {'),
      L('        int R = matrix.size(), C = matrix[0].size();', 'init'),
      L('        int lo = 0, hi = R * C - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int val = matrix[mid / C][mid % C];', 'mid'),
      L('            if (val == target)', 'found'),
      L('                return true;', 'found'),
      L('            else if (val < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return false;', 'notfound'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean searchMatrix(int[][] matrix, int target) {'),
      L('        int R = matrix.length, C = matrix[0].length;', 'init'),
      L('        int lo = 0, hi = R * C - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            int val = matrix[mid / C][mid % C];', 'mid'),
      L('            if (val == target)', 'found'),
      L('                return true;', 'found'),
      L('            else if (val < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return false;', 'notfound'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.matrix, 8, 8);
    if (typeof g === 'string') return { error: g };
    const flat = g.flat();
    for (let i = 1; i < flat.length; i++) if (flat[i] <= flat[i - 1]) return { error: 'Matrix must be sorted: each row ascending, each row\'s first > previous row\'s last.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };
    const R = g.length;
    const Cn = g[0].length;

    const steps: Step[] = [];
    const rc = (i: number) => [Math.floor(i / Cn), i % Cn] as const;
    const st = (lo: number, hi: number, mid?: number, extra?: MatrixState['mark']): MatrixState => {
      const mark: MatrixState['mark'] = {};
      for (let i = 0; i < flat.length; i++) {
        const [r, c] = rc(i);
        if (i < lo || i > hi) mark[`${r},${c}`] = 'dim';
      }
      if (mid !== undefined) {
        const [r, c] = rc(mid);
        mark[`${r},${c}`] = 'active';
      }
      return {
        grid: g,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(Cn)].map((_, i) => i),
        mark: { ...mark, ...extra },
        aggs: [{ label: 'virtual range', value: `[${lo} … ${hi}]`, c: 'a' }],
      };
    };

    let lo = 0;
    let hi = R * Cn - 1;
    steps.push({
      tag: 'init',
      trace: ['Reading row-major, the matrix is one sorted list of ', A(R * Cn), ' values — binary search indices 0…', A(R * Cn - 1), '.'],
      state: st(lo, hi),
    });
    let found = false;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const [r, c] = rc(mid);
      const val = g[r][c];
      steps.push({
        tag: 'mid',
        trace: ['Virtual mid = ', A(mid), ' maps to cell (', A(r), ',', A(c), ') holding ', A(val), '.'],
        state: st(lo, hi, mid),
      });
      if (val === target) {
        found = true;
        steps.push({
          tag: 'found',
          trace: [B(val), ' equals the target — found at (', C(r), ',', C(c), '). Return ', C('true'), '.'],
          state: st(lo, hi, undefined, { [`${r},${c}`]: 'final' }),
        });
        break;
      } else if (val < target) {
        lo = mid + 1;
        steps.push({ tag: 'right', trace: [F(val), ' < ', C(target), ' — discard everything up to mid.'], state: st(lo, hi) });
      } else {
        hi = mid - 1;
        steps.push({ tag: 'left', trace: [F(val), ' > ', C(target), ' — discard everything from mid on.'], state: st(lo, hi) });
      }
    }
    if (!found) steps.push({ tag: 'notfound', trace: ['Range empty — ', C(target), ' is not in the matrix. Return ', C('false'), '.'], state: st(lo, hi) });
    return { steps, result: String(found), resultDetail: found ? undefined : 'target absent' };
  },
  note: 'The sorted-rows + sorted-row-starts property means row-major order is globally sorted, so index arithmetic (mid / C, mid % C) turns a 2D search into one ordinary binary search over R·C virtual slots — log(R·C), not log R + log C.',
  complexity: { time: 'O(log R·C)', space: 'O(1)' },
  brute: {
    label: 'Staircase search',
    technique: 'Start at the top-right corner: too big means move left, too small means move down.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool searchMatrix(vector<vector<int>>& m, int target) {'),
        L('        int r = 0, c = m[0].size() - 1;', 'init'),
        L('        while (r < m.size() && c >= 0) {', 'probe'),
        L('            if (m[r][c] == target) return true;', 'probe', 'found'),
        L('            if (m[r][c] > target) c--;', 'left'),
        L('            else r++;', 'down'),
        L('        }'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean searchMatrix(int[][] m, int target) {'),
        L('        int r = 0, c = m[0].length - 1;', 'init'),
        L('        while (r < m.length && c >= 0) {', 'probe'),
        L('            if (m[r][c] == target) return true;', 'probe', 'found'),
        L('            if (m[r][c] > target) c--;', 'left'),
        L('            else r++;', 'down'),
        L('        }'),
        L('        return false;', 'notfound'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.matrix, 8, 8);
      if (typeof g === 'string') return { error: g };
      const flat = g.flat();
      for (let i = 1; i < flat.length; i++) if (flat[i] <= flat[i - 1]) return { error: "Matrix must be sorted: each row ascending, each row's first > previous row's last." };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const R = g.length;
      const Cn = g[0].length;
      const steps: Step[] = [];
      const gone: MatrixState['mark'] = {};
      const st = (extra?: MatrixState['mark']): MatrixState => ({
        grid: g,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(Cn)].map((_, i) => i),
        mark: { ...gone, ...extra },
      });
      let r = 0;
      let c = Cn - 1;
      steps.push({ tag: 'init', trace: ['Start at the top-right cell: everything left of it is smaller, everything below it is larger.'], state: st({ [`${r},${c}`]: 'active' }) });
      let found = false;
      while (r < R && c >= 0) {
        const v = g[r][c];
        if (v === target) {
          found = true;
          steps.push({ tag: 'found', trace: ['(', A(r), ',', A(c), ') holds ', B(v), ' — found. Return ', C('true'), '.'], state: st({ [`${r},${c}`]: 'final' }) });
          break;
        }
        if (v > target) {
          for (let rr = r; rr < R; rr++) gone[`${rr},${c}`] = 'dim';
          steps.push({ tag: 'left', trace: [F(v), ' > ', C(target), ' — the rest of column ', A(c), ' is even larger. Move left.'], state: st({ [`${r},${c}`]: 'active' }) });
          c--;
        } else {
          for (let cc = 0; cc <= c; cc++) gone[`${r},${cc}`] = 'dim';
          steps.push({ tag: 'down', trace: [F(v), ' < ', C(target), ' — the rest of row ', A(r), ' is even smaller. Move down.'], state: st({ [`${r},${c}`]: 'active' }) });
          r++;
        }
      }
      if (!found) steps.push({ tag: 'notfound', trace: ['Walked off the grid — return ', C('false'), '.'], state: st() });
      return { steps, result: String(found), resultDetail: found ? undefined : 'target absent' };
    },
    note: 'Each step removes a whole row or column, so it takes at most R + C steps. It only needs rows and columns to be sorted, which makes it the go-to for Search a 2D Matrix II; here the stronger row-major ordering lets binary search reach O(log(R·C)).',
    complexity: { time: 'O(R + C)', space: 'O(1)' },
  },
};

/* ================= 43. Search in Rotated Sorted Array ================= */
const searchRotated: ProblemDef = {
  slug: 'search-in-rotated-sorted-array',
  title: 'Search in Rotated Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
  technique: 'One half of any rotated range is always sorted — check if the target lives there.',
  widget: 'binary-search',
  widgetTitle: 'Search range',
  inputs: [
    { key: 'nums', label: 'Rotated array', defaultValue: '4, 5, 6, 7, 0, 1, 2', wide: true },
    { key: 'target', label: 'Target', defaultValue: '0' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int search(vector<int>& nums, int target) {'),
      L('        int lo = 0, hi = nums.size() - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target) return mid;', 'found'),
      L('            if (nums[lo] <= nums[mid]) {', 'leftsorted'),
      L('                if (nums[lo] <= target && target < nums[mid])', 'leftsorted'),
      L('                    hi = mid - 1;', 'goleft'),
      L('                else'),
      L('                    lo = mid + 1;', 'goright'),
      L('            } else {', 'rightsorted'),
      L('                if (nums[mid] < target && target <= nums[hi])', 'rightsorted'),
      L('                    lo = mid + 1;', 'goright'),
      L('                else'),
      L('                    hi = mid - 1;', 'goleft'),
      L('            }'),
      L('        }'),
      L('        return -1;', 'notfound'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int search(int[] nums, int target) {'),
      L('        int lo = 0, hi = nums.length - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target) return mid;', 'found'),
      L('            if (nums[lo] <= nums[mid]) {', 'leftsorted'),
      L('                if (nums[lo] <= target && target < nums[mid])', 'leftsorted'),
      L('                    hi = mid - 1;', 'goleft'),
      L('                else'),
      L('                    lo = mid + 1;', 'goright'),
      L('            } else {', 'rightsorted'),
      L('                if (nums[mid] < target && target <= nums[hi])', 'rightsorted'),
      L('                    lo = mid + 1;', 'goright'),
      L('                else'),
      L('                    hi = mid - 1;', 'goleft'),
      L('            }'),
      L('        }'),
      L('        return -1;', 'notfound'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    if (new Set(arr).size !== arr.length) return { error: 'Values must be distinct.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const st = (lo: number, hi: number, s?: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'array', arr, lo, hi, ...s } as BinarySearchState);
    let lo = 0;
    let hi = arr.length - 1;
    steps.push({ tag: 'init', trace: ['The array is sorted but rotated — plain binary search breaks, unless we exploit that one half of [lo…hi] is always sorted.'], state: st(lo, hi) });
    let found = -1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({ tag: 'mid', trace: ['Probe mid = ', A(mid), ': nums[mid] = ', A(arr[mid]), '.'], state: st(lo, hi, { mid }) });
      if (arr[mid] === target) {
        found = mid;
        steps.push({ tag: 'found', trace: ['Hit — ', B(arr[mid]), ' is the target, at index ', C(mid), '.'], state: st(lo, hi, { mid, finalIndex: mid }) });
        break;
      }
      if (arr[lo] <= arr[mid]) {
        if (arr[lo] <= target && target < arr[mid]) {
          steps.push({
            tag: 'goleft',
            trace: ['Left half [', A(arr[lo]), '…', A(arr[mid]), '] is sorted and contains ', C(target), ' — search it: hi = ', A(mid - 1), '.'],
            state: st(lo, mid - 1, { mid }),
          });
          hi = mid - 1;
        } else {
          steps.push({
            tag: 'goright',
            trace: ['Left half [', A(arr[lo]), '…', A(arr[mid]), '] is sorted but ', F(target), ' is not in it — go right: lo = ', A(mid + 1), '.'],
            state: st(mid + 1, hi, { mid }),
          });
          lo = mid + 1;
        }
      } else {
        if (arr[mid] < target && target <= arr[hi]) {
          steps.push({
            tag: 'goright',
            trace: ['Right half [', A(arr[mid]), '…', A(arr[hi]), '] is sorted and contains ', C(target), ' — go right: lo = ', A(mid + 1), '.'],
            state: st(mid + 1, hi, { mid }),
          });
          lo = mid + 1;
        } else {
          steps.push({
            tag: 'goleft',
            trace: ['Right half [', A(arr[mid]), '…', A(arr[hi]), '] is sorted but ', F(target), ' is not in it — go left: hi = ', A(mid - 1), '.'],
            state: st(lo, mid - 1, { mid }),
          });
          hi = mid - 1;
        }
      }
    }
    if (found === -1) steps.push({ tag: 'notfound', trace: ['Range empty — ', C(target), ' is absent. Return ', C('-1'), '.'], state: st(lo, hi, { finalIndex: null }) });
    return { steps, result: found === -1 ? '-1' : `index ${found}`, resultDetail: found === -1 ? undefined : `nums[${found}] = ${target}` };
  },
  note: 'A rotation has exactly one "cliff", so any midpoint splits the range into one clean sorted half and one half containing the cliff. Range-checking the target against the sorted half is decidable in O(1) — which is all binary search ever needed.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Check every element from left to right, ignoring the rotation.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int search(vector<int>& nums, int target) {'),
        L('        for (int i = 0; i < nums.size(); i++)', 'scan'),
        L('            if (nums[i] == target) return i;', 'scan', 'found'),
        L('        return -1;', 'notfound'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int search(int[] nums, int target) {'),
        L('        for (int i = 0; i < nums.length; i++)', 'scan'),
        L('            if (nums[i] == target) return i;', 'scan', 'found'),
        L('        return -1;', 'notfound'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      if (new Set(arr).size !== arr.length) return { error: 'Values must be distinct.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const hi = arr.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr, lo: 0, hi, ...s }) as BinarySearchState;
      let found = -1;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
          found = i;
          steps.push({ tag: 'found', trace: ['nums[', A(i), '] = ', B(arr[i]), ' — found after ', C(i + 1), ' comparisons.'], state: st({ lo: i, mid: i, finalIndex: i }) });
          break;
        }
        steps.push({ tag: 'scan', trace: ['nums[', A(i), '] = ', F(arr[i]), ' ≠ ', C(target), '.'], state: st({ lo: i, mid: i }) });
      }
      if (found === -1) steps.push({ tag: 'notfound', trace: ['Not in the array — return ', C('-1'), '.'], state: st({ lo: arr.length, finalIndex: null }) });
      return { steps, result: found === -1 ? '-1' : `index ${found}`, resultDetail: found === -1 ? undefined : `nums[${found}] = ${target}` };
    },
    note: 'Simple and always correct, but O(n). At every mid of a rotated array at least one half is sorted, which lets binary search decide which half can hold the target.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= 44. Find First and Last Position ================= */
const firstLastPos: ProblemDef = {
  slug: 'find-first-and-last-position-of-element-in-sorted-array',
  title: 'Find First and Last Position of Element in Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
  technique: 'Two biased binary searches: one hugs the left edge of the run, one hugs the right.',
  widget: 'binary-search',
  widgetTitle: 'Search range',
  inputs: [
    { key: 'nums', label: 'Sorted array', defaultValue: '5, 7, 7, 8, 8, 10', wide: true },
    { key: 'target', label: 'Target', defaultValue: '8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> searchRange(vector<int>& nums, int target) {'),
      L('        return {bound(nums, target, true), bound(nums, target, false)};', 'init'),
      L('    }'),
      L('    int bound(vector<int>& nums, int target, bool first) {'),
      L('        int lo = 0, hi = nums.size() - 1, ans = -1;', 'binit'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target) {', 'hit'),
      L('                ans = mid;', 'hit'),
      L('                if (first) hi = mid - 1;', 'hugl'),
      L('                else lo = mid + 1;', 'hugr'),
      L('            } else if (nums[mid] < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] searchRange(int[] nums, int target) {'),
      L('        return new int[]{bound(nums, target, true), bound(nums, target, false)};', 'init'),
      L('    }'),
      L('    private int bound(int[] nums, int target, boolean first) {'),
      L('        int lo = 0, hi = nums.length - 1, ans = -1;', 'binit'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target) {', 'hit'),
      L('                ans = mid;', 'hit'),
      L('                if (first) hi = mid - 1;', 'hugl'),
      L('                else lo = mid + 1;', 'hugr'),
      L('            } else if (nums[mid] < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Array must be sorted.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const st = (lo: number, hi: number, s?: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'array', arr, lo, hi, ...s } as BinarySearchState);

    const bound = (first: boolean): number => {
      let lo = 0;
      let hi = arr.length - 1;
      let ans = -1;
      steps.push({
        tag: 'binit',
        trace: [first ? 'Pass 1 — find the ' : 'Pass 2 — find the ', A(first ? 'first' : 'last'), ' occurrence: on a hit, keep searching ', A(first ? 'leftward' : 'rightward'), '.'],
        state: st(lo, hi),
      });
      while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        steps.push({ tag: 'mid', trace: ['mid = ', A(mid), ': nums[mid] = ', A(arr[mid]), '.'], state: st(lo, hi, { mid, finalIndex: ans === -1 ? undefined : ans }) });
        if (arr[mid] === target) {
          ans = mid;
          if (first) {
            steps.push({ tag: 'hugl', trace: ['Hit at ', B(mid), ' — remember it, but an earlier copy may exist: hi = ', A(mid - 1), '.'], state: st(lo, mid - 1, { finalIndex: ans }) });
            hi = mid - 1;
          } else {
            steps.push({ tag: 'hugr', trace: ['Hit at ', B(mid), ' — remember it, but a later copy may exist: lo = ', A(mid + 1), '.'], state: st(mid + 1, hi, { finalIndex: ans }) });
            lo = mid + 1;
          }
        } else if (arr[mid] < target) {
          lo = mid + 1;
          steps.push({ tag: 'right', trace: [F(arr[mid]), ' < ', C(target), ' — go right.'], state: st(lo, hi, { finalIndex: ans === -1 ? undefined : ans }) });
        } else {
          hi = mid - 1;
          steps.push({ tag: 'left', trace: [F(arr[mid]), ' > ', C(target), ' — go left.'], state: st(lo, hi, { finalIndex: ans === -1 ? undefined : ans }) });
        }
      }
      steps.push({
        tag: 'ret',
        trace: [first ? 'First' : 'Last', ' occurrence settles at ', ans === -1 ? F('-1') : C(ans), '.'],
        state: st(0, arr.length - 1, { finalIndex: ans === -1 ? null : ans }),
      });
      return ans;
    };
    const lo = bound(true);
    const hi = bound(false);
    return { steps, result: `[${lo}, ${hi}]`, resultDetail: lo === -1 ? 'target absent' : `${hi - lo + 1} occurrence(s)` };
  },
  note: 'The only change from vanilla binary search is refusing to stop on a hit: biasing the shrink direction turns the same O(log n) loop into a boundary-finder. Two biased runs bracket the whole run of duplicates.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Scan from the left for the first match and from the right for the last match.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> searchRange(vector<int>& nums, int target) {'),
        L('        int first = -1, last = -1;', 'init'),
        L('        for (int i = 0; i < nums.size(); i++)', 'first'),
        L('            if (nums[i] == target) { first = i; break; }', 'first'),
        L('        for (int i = nums.size() - 1; i >= 0; i--)', 'last'),
        L('            if (nums[i] == target) { last = i; break; }', 'last'),
        L('        return {first, last};', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] searchRange(int[] nums, int target) {'),
        L('        int first = -1, last = -1;', 'init'),
        L('        for (int i = 0; i < nums.length; i++)', 'first'),
        L('            if (nums[i] == target) { first = i; break; }', 'first'),
        L('        for (int i = nums.length - 1; i >= 0; i--)', 'last'),
        L('            if (nums[i] == target) { last = i; break; }', 'last'),
        L('        return new int[]{first, last};', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Array must be sorted.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const hi = arr.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr, lo: 0, hi, ...s }) as BinarySearchState;
      steps.push({ tag: 'init', trace: ['Two plain scans: one from the left for the ', A('first'), ' match, one from the right for the ', A('last'), '.'], state: st({}) });
      let first = -1;
      for (let i = 0; i < arr.length; i++) {
        const hit = arr[i] === target;
        steps.push({ tag: 'first', trace: ['Left scan: nums[', A(i), '] = ', hit ? B(arr[i]) : F(arr[i]), hit ? ' — first occurrence.' : '.'], state: st({ lo: i, mid: i }) });
        if (hit) {
          first = i;
          break;
        }
      }
      let last = -1;
      if (first !== -1) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const hit = arr[i] === target;
          steps.push({ tag: 'last', trace: ['Right scan: nums[', A(i), '] = ', hit ? B(arr[i]) : F(arr[i]), hit ? ' — last occurrence.' : '.'], state: st({ hi: i, mid: i }) });
          if (hit) {
            last = i;
            break;
          }
        }
      }
      steps.push({ tag: 'ret', trace: ['Range: ', C(`[${first}, ${last}]`), '.'], state: st({ lo: Math.max(first, 0), hi: Math.max(last, 0), finalIndex: first === -1 ? null : first }) });
      return { steps, result: `[${first}, ${last}]`, resultDetail: first === -1 ? 'target absent' : `${last - first + 1} occurrence(s)` };
    },
    note: 'Two linear scans cost O(n) — and if the target fills most of the array, both scans are short, but a missing target forces a full pass. Two boundary binary searches guarantee O(log n).',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= 45. Median of Two Sorted Arrays ================= */
const medianTwoSorted: ProblemDef = {
  slug: 'median-of-two-sorted-arrays',
  title: 'Median of Two Sorted Arrays',
  category: 'Binary Search',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
  technique: 'Binary search the partition of the shorter array so both left halves hold exactly half the values.',
  widget: 'list',
  widgetTitle: 'Two arrays & the partition',
  inputs: [
    { key: 'nums1', label: 'Sorted array 1', defaultValue: '1, 3, 8', wide: true },
    { key: 'nums2', label: 'Sorted array 2', defaultValue: '7, 9, 10, 11', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    double findMedianSortedArrays(vector<int>& A, vector<int>& B) {'),
      L('        if (A.size() > B.size()) return findMedianSortedArrays(B, A);', 'init'),
      L('        int m = A.size(), n = B.size();', 'init'),
      L('        int lo = 0, hi = m;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int i = (lo + hi) / 2;          // cut in A', 'cut'),
      L('            int j = (m + n + 1) / 2 - i;    // cut in B', 'cut'),
      L('            int Al = (i == 0) ? INT_MIN : A[i-1];', 'vals'),
      L('            int Ar = (i == m) ? INT_MAX : A[i];', 'vals'),
      L('            int Bl = (j == 0) ? INT_MIN : B[j-1];', 'vals'),
      L('            int Br = (j == n) ? INT_MAX : B[j];', 'vals'),
      L('            if (Al <= Br && Bl <= Ar) {', 'check'),
      L('                if ((m + n) % 2 == 1)', 'odd'),
      L('                    return max(Al, Bl);', 'odd'),
      L('                return (max(Al, Bl) + min(Ar, Br)) / 2.0;', 'even'),
      L('            } else if (Al > Br)', 'movel'),
      L('                hi = i - 1;', 'movel'),
      L('            else'),
      L('                lo = i + 1;', 'mover'),
      L('        }'),
      L('        return 0.0;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public double findMedianSortedArrays(int[] A, int[] B) {'),
      L('        if (A.length > B.length) return findMedianSortedArrays(B, A);', 'init'),
      L('        int m = A.length, n = B.length;', 'init'),
      L('        int lo = 0, hi = m;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int i = (lo + hi) / 2;', 'cut'),
      L('            int j = (m + n + 1) / 2 - i;', 'cut'),
      L('            int Al = (i == 0) ? Integer.MIN_VALUE : A[i-1];', 'vals'),
      L('            int Ar = (i == m) ? Integer.MAX_VALUE : A[i];', 'vals'),
      L('            int Bl = (j == 0) ? Integer.MIN_VALUE : B[j-1];', 'vals'),
      L('            int Br = (j == n) ? Integer.MAX_VALUE : B[j];', 'vals'),
      L('            if (Al <= Br && Bl <= Ar) {', 'check'),
      L('                if ((m + n) % 2 == 1)', 'odd'),
      L('                    return Math.max(Al, Bl);', 'odd'),
      L('                return (Math.max(Al, Bl) + Math.min(Ar, Br)) / 2.0;', 'even'),
      L('            } else if (Al > Br)', 'movel'),
      L('                hi = i - 1;', 'movel'),
      L('            else'),
      L('                lo = i + 1;', 'mover'),
      L('        }'),
      L('        return 0.0;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a0 = parseIntArray(values.nums1, { maxLen: 10 });
    if (typeof a0 === 'string') return { error: a0 };
    const b0 = parseIntArray(values.nums2, { maxLen: 10 });
    if (typeof b0 === 'string') return { error: b0 };
    for (const arr of [a0, b0]) for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Both arrays must be sorted.' };

    const swapped = a0.length > b0.length;
    const A0 = swapped ? b0 : a0;
    const B0 = swapped ? a0 : b0;
    const m = A0.length;
    const n = B0.length;
    const steps: Step[] = [];
    const half = Math.floor((m + n + 1) / 2);

    const view = (i: number | null, j: number | null): ListState => ({
      chains: [
        {
          label: swapped ? 'B (short)' : 'A (short)',
          items: A0.map((v, k) => ({ v, mark: i === null ? undefined : k < i ? ('win' as const) : undefined })),
          broken: true,
        },
        {
          label: swapped ? 'A' : 'B',
          items: B0.map((v, k) => ({ v, mark: j === null ? undefined : k < j ? ('win' as const) : undefined })),
          broken: true,
        },
      ],
      ptrs: [
        ...(i !== null && i < m ? [{ name: 'cut', chain: 0, i, c: 'a' as const }] : []),
        ...(j !== null && j < n ? [{ name: 'cut', chain: 1, i: j, c: 'a' as const }] : []),
      ],
      aggs: [{ label: 'left-half size needed', value: String(half), c: 'c' }],
    });

    steps.push({
      tag: 'init',
      trace: ['Cut both arrays so the combined ', A('left side'), ' holds exactly ', C(half), ' values — then only 4 border values decide the median. Search cuts of the shorter array.'],
      state: view(null, null),
    });
    let lo = 0;
    let hi = m;
    let result = '';
    let detail = '';
    while (lo <= hi) {
      const i = Math.floor((lo + hi) / 2);
      const j = half - i;
      const Al = i === 0 ? -Infinity : A0[i - 1];
      const Ar = i === m ? Infinity : A0[i];
      const Bl = j === 0 ? -Infinity : B0[j - 1];
      const Br = j === n ? Infinity : B0[j];
      const fmt = (x: number) => (x === -Infinity ? '−∞' : x === Infinity ? '+∞' : String(x));
      steps.push({
        tag: 'cut',
        trace: ['Try taking ', A(i), ' from the short array and ', A(j), ' from the other (', A(i), ' + ', A(j), ' = ', C(half), ').'],
        state: view(i, j),
      });
      steps.push({
        tag: 'check',
        trace: ['Border check: max-left values ', A(fmt(Al)), ', ', A(fmt(Bl)), ' vs min-right values ', A(fmt(Ar)), ', ', A(fmt(Br)), ' — need Al ≤ Br and Bl ≤ Ar.'],
        state: view(i, j),
      });
      if (Al <= Br && Bl <= Ar) {
        if ((m + n) % 2 === 1) {
          const med = Math.max(Al, Bl);
          result = String(med);
          detail = 'odd total — median is the largest left-side value';
          steps.push({ tag: 'odd', trace: ['Valid cut! Odd total count, so the median is max(', B(fmt(Al)), ', ', B(fmt(Bl)), ') = ', C(med), '.'], state: view(i, j) });
        } else {
          const med = (Math.max(Al, Bl) + Math.min(Ar, Br)) / 2;
          result = String(med);
          detail = 'even total — average of the two middle values';
          steps.push({
            tag: 'even',
            trace: ['Valid cut! Even total, so median = (max(', B(fmt(Al)), ',', B(fmt(Bl)), ') + min(', B(fmt(Ar)), ',', B(fmt(Br)), ')) / 2 = ', C(med), '.'],
            state: view(i, j),
          });
        }
        break;
      } else if (Al > Br) {
        hi = i - 1;
        steps.push({ tag: 'movel', trace: [F(fmt(Al)), ' > ', F(fmt(Br)), ' — the short array contributes too much; cut smaller.'], state: view(i, j) });
      } else {
        lo = i + 1;
        steps.push({ tag: 'mover', trace: [F(fmt(Bl)), ' > ', F(fmt(Ar)), ' — the short array contributes too little; cut bigger.'], state: view(i, j) });
      }
    }
    return { steps, result, resultDetail: detail };
  },
  note: 'The median is a partition statement: half the values on each side, every left value ≤ every right value. Fixing the cut in one array forces the cut in the other, and the validity test is just 2 comparisons — so binary searching the shorter array\'s cut gives O(log min(m,n)), with no merging at all.',
  complexity: { time: 'O(log min(m,n))', space: 'O(1)' },
  brute: {
    label: 'Merge',
    technique: 'Merge the two sorted arrays like in merge sort, then read the middle element(s).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    double findMedianSortedArrays(vector<int>& a, vector<int>& b) {'),
        L('        vector<int> m;', 'init'),
        L('        int i = 0, j = 0;', 'init'),
        L('        while (i < a.size() || j < b.size()) {', 'take'),
        L('            if (j == b.size() || (i < a.size() && a[i] <= b[j])) m.push_back(a[i++]);', 'take'),
        L('            else m.push_back(b[j++]);', 'take'),
        L('        }'),
        L('        int n = m.size();', 'ret'),
        L('        return n % 2 ? m[n / 2] : (m[n / 2 - 1] + m[n / 2]) / 2.0;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public double findMedianSortedArrays(int[] a, int[] b) {'),
        L('        int[] m = new int[a.length + b.length];', 'init'),
        L('        int i = 0, j = 0, k = 0;', 'init'),
        L('        while (i < a.length || j < b.length) {', 'take'),
        L('            if (j == b.length || (i < a.length && a[i] <= b[j])) m[k++] = a[i++];', 'take'),
        L('            else m[k++] = b[j++];', 'take'),
        L('        }'),
        L('        int n = m.length;', 'ret'),
        L('        return n % 2 == 1 ? m[n / 2] : (m[n / 2 - 1] + m[n / 2]) / 2.0;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums1, { maxLen: 10 });
      if (typeof a === 'string') return { error: a };
      const b = parseIntArray(values.nums2, { maxLen: 10 });
      if (typeof b === 'string') return { error: b };
      for (const arr of [a, b]) for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Both arrays must be sorted.' };
      const steps: Step[] = [];
      const merged: number[] = [];
      let i = 0;
      let j = 0;
      const view = (hl: 'a' | 'b' | null): ListState => ({
        chains: [
          { label: 'nums1', items: a.map((v, k) => ({ v, mark: k < i ? ('dim' as const) : undefined })), broken: true },
          { label: 'nums2', items: b.map((v, k) => ({ v, mark: k < j ? ('dim' as const) : undefined })), broken: true },
          { label: 'merged', items: merged.map((v, k) => ({ v, mark: k === merged.length - 1 && hl ? ('active' as const) : undefined })), broken: true },
        ],
        ptrs: [
          ...(i < a.length ? [{ name: 'i', chain: 0, i, c: 'a' as const }] : []),
          ...(j < b.length ? [{ name: 'j', chain: 1, i: j, c: 'b' as const }] : []),
        ],
      });
      steps.push({ tag: 'init', trace: ['Merge both arrays into one sorted list of ', A(a.length + b.length), ' values.'], state: view(null) });
      while (i < a.length || j < b.length) {
        const fromA = j === b.length || (i < a.length && a[i] <= b[j]);
        const v = fromA ? a[i++] : b[j++];
        merged.push(v);
        steps.push({ tag: 'take', trace: ['Take the smaller front value ', A(v), ' from ', A(fromA ? 'nums1' : 'nums2'), '.'], state: view(fromA ? 'a' : 'b') });
      }
      const n = merged.length;
      const med = n % 2 ? merged[(n - 1) / 2] : (merged[n / 2 - 1] + merged[n / 2]) / 2;
      const mid = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
      steps.push({
        tag: 'ret',
        trace: n % 2 ? ['Odd length ', A(n), ' — the middle value is ', C(med), '.'] : ['Even length ', A(n), ' — average of ', B(merged[mid[0]]), ' and ', B(merged[mid[1]]), ' = ', C(med), '.'],
        state: {
          chains: [{ label: 'merged', items: merged.map((v, k) => ({ v, mark: mid.includes(k) ? ('final' as const) : undefined })), broken: true }],
        },
      });
      return { steps, result: String(med), resultDetail: n % 2 ? 'odd total — median is the middle value' : 'even total — average of the two middle values' };
    },
    note: 'Easy to reason about, but it touches all m + n values and needs O(m + n) memory, missing the problem’s O(log(m + n)) requirement. Binary-searching the partition of the shorter array needs only a handful of comparisons.',
    complexity: { time: 'O(m + n)', space: 'O(m + n)' },
  },
};

export const binarySearch2 = [search2D, searchRotated, firstLastPos, medianTwoSorted];
