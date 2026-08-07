// Two Pointers / Sliding Window template problems.
import type { ArrayState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================================================================
 * 167. Two Sum II — Input Array Is Sorted
 * ================================================================ */
const twoSumII: ProblemDef = {
  slug: 'two-sum-ii-input-array-is-sorted',
  title: 'Two Sum II — Input Array Is Sorted',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  technique: 'Converging pointers from both ends — the sorted order tells you which pointer to move.',
  widget: 'array',
  widgetTitle: 'Array & pointers',
  inputs: [
    { key: 'numbers', label: 'Sorted array', defaultValue: '2, 7, 11, 15', wide: true },
    { key: 'target', label: 'Target', defaultValue: '9' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> twoSum(vector<int>& numbers, int target) {'),
      L('        int l = 0, r = numbers.size() - 1;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            int sum = numbers[l] + numbers[r];', 'sum'),
      L('            if (sum == target)', 'sum', 'found'),
      L('                return {l + 1, r + 1};', 'found'),
      L('            else if (sum < target)', 'movel'),
      L('                l++;', 'movel'),
      L('            else'),
      L('                r--;', 'mover'),
      L('        }'),
      L('        return {};', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] twoSum(int[] numbers, int target) {'),
      L('        int l = 0, r = numbers.length - 1;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            int sum = numbers[l] + numbers[r];', 'sum'),
      L('            if (sum == target)', 'sum', 'found'),
      L('                return new int[]{l + 1, r + 1};', 'found'),
      L('            else if (sum < target)', 'movel'),
      L('                l++;', 'movel'),
      L('            else'),
      L('                r--;', 'mover'),
      L('        }'),
      L('        return new int[]{};', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.numbers);
    if (typeof arr === 'string') return { error: arr };
    if (arr.length < 2) return { error: 'Need at least two numbers.' };
    for (let i = 1; i < arr.length; i++)
      if (arr[i] < arr[i - 1]) return { error: 'Array must be sorted in non-decreasing order.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const st = (l: number, r: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: [
        { name: 'l', i: l, c: 'a' },
        { name: 'r', i: r, c: 'c' },
      ],
      aggs: [{ label: 'target', value: String(target), c: 'c' }],
      ...extra,
    });

    let l = 0;
    let r = arr.length - 1;
    steps.push({
      tag: 'init',
      trace: ['Start with the extremes: ', A('l = 0'), ' and ', C(`r = ${r}`), ' — the smallest and largest values available.'],
      state: st(l, r),
    });
    let found: [number, number] | null = null;
    while (l < r) {
      const sum = arr[l] + arr[r];
      steps.push({
        tag: 'sum',
        trace: ['Pair check: ', A(arr[l]), ' + ', A(arr[r]), ' = ', A(sum), ' vs target ', C(target), '.'],
        state: st(l, r, {
          mark: { [l]: 'active', [r]: 'active' },
          aggs: [
            { label: 'sum', value: String(sum), c: 'a' },
            { label: 'target', value: String(target), c: 'c' },
          ],
        }),
      });
      if (sum === target) {
        found = [l + 1, r + 1];
        steps.push({
          tag: 'found',
          trace: ['Exact match — return 1-based indices ', C(`[${l + 1}, ${r + 1}]`), '.'],
          state: st(l, r, { mark: { [l]: 'final', [r]: 'final' } }),
        });
        break;
      } else if (sum < target) {
        steps.push({
          tag: 'movel',
          trace: [F(sum), ' is too small — only a bigger left value can help, since r already holds the biggest candidate. Move ', A('l → ' + (l + 1)), '.'],
          state: st(l + 1, r, { mark: { [l]: 'dim' } }),
        });
        l++;
      } else {
        steps.push({
          tag: 'mover',
          trace: [F(sum), ' is too big — shrink from the right. Move ', A('r → ' + (r - 1)), '.'],
          state: st(l, r - 1, { mark: { [r]: 'dim' } }),
        });
        r--;
      }
    }
    if (!found) {
      steps.push({
        tag: 'none',
        trace: ['Pointers met — no pair sums to ', C(target), '.'],
        state: st(l, r),
      });
    }
    return {
      steps,
      result: found ? `[${found[0]}, ${found[1]}]` : 'no pair',
      resultDetail: found ? `numbers[${found[0]}] + numbers[${found[1]}] = ${target} (1-indexed)` : undefined,
    };
  },
  note: 'Sorted order makes each comparison decisive: if the pair sum is too small, no pair using the current left value can ever work (the right pointer already sits on the largest remaining number), so l advances — and symmetrically for r. Each step permanently eliminates one element, giving O(n).',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'Try every pair with two nested loops — no use is made of the fact that the array is sorted.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> twoSum(vector<int>& numbers, int target) {'),
        L('        int n = numbers.size();', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = i + 1; j < n; j++) {', 'inner'),
        L('                if (numbers[i] + numbers[j] == target)', 'test', 'found'),
        L('                    return {i + 1, j + 1};', 'found'),
        L('            }'),
        L('        }'),
        L('        return {};', 'none'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] twoSum(int[] numbers, int target) {'),
        L('        int n = numbers.length;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            for (int j = i + 1; j < n; j++) {', 'inner'),
        L('                if (numbers[i] + numbers[j] == target)', 'test', 'found'),
        L('                    return new int[]{i + 1, j + 1};', 'found'),
        L('            }'),
        L('        }'),
        L('        return new int[]{};', 'none'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.numbers);
      if (typeof arr === 'string') return { error: arr };
      if (arr.length < 2) return { error: 'Need at least two numbers.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };

      const steps: Step[] = [];
      const st = (i: number, j: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: [
          { name: 'i', i, c: 'b' },
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
      let found: [number, number] | null = null;
      let tried = 0;
      outer: for (let i = 0; i < arr.length; i++) {
        steps.push({
          tag: 'outer',
          trace: ['Fix the left number ', B(arr[i]), ' at index ', B(i), ' and pair it against everything to its right.'],
          state: st(i, i + 1, { mark: { [i]: 'good' } }),
        });
        for (let j = i + 1; j < arr.length; j++) {
          const sum = arr[i] + arr[j];
          tried++;
          if (sum === target) {
            found = [i + 1, j + 1];
            steps.push({
              tag: 'found',
              trace: [B(arr[i]), ' + ', A(arr[j]), ' = ', C(sum), ' — match after ', C(tried), ' pair checks. Return ', C(`[${i + 1}, ${j + 1}]`), '.'],
              state: st(i, j, { mark: { [i]: 'final', [j]: 'final' } }),
            });
            break outer;
          }
          steps.push({
            tag: 'test',
            trace: [B(arr[i]), ' + ', A(arr[j]), ' = ', F(sum), ' ≠ ', C(target), ' — try the next j.'],
            state: st(i, j, { mark: { [i]: 'good', [j]: 'dim' } }),
          });
        }
      }
      if (!found) {
        steps.push({
          tag: 'none',
          trace: ['All ', F(tried), ' pairs tested — nothing sums to ', C(target), '.'],
          state: st(arr.length - 2, arr.length - 1),
        });
      }
      return {
        steps,
        result: found ? `[${found[0]}, ${found[1]}]` : 'no pair',
        resultDetail: `${tried} pair checks — the two-pointer version needs at most ${arr.length}`,
      };
    },
    note: 'This is correct but wasteful: it re-tests pairs the sorted order has already ruled out. Once numbers[i] + numbers[j] overshoots the target, every larger j overshoots too — the nested loop keeps going anyway. Recognising that is exactly the step from O(n²) to the O(n) two-pointer sweep.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================================================================
 * 11. Container With Most Water
 * ================================================================ */
const container: ProblemDef = {
  slug: 'container-with-most-water',
  title: 'Container With Most Water',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/container-with-most-water/',
  technique: 'Converging pointers: always move the shorter wall — it is the only move that can improve the area.',
  widget: 'array',
  widgetTitle: 'Wall heights',
  inputs: [{ key: 'height', label: 'Heights', defaultValue: '1, 8, 6, 2, 5, 4, 8, 3, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxArea(vector<int>& height) {'),
      L('        int l = 0, r = height.size() - 1, best = 0;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            int area = min(height[l], height[r]) * (r - l);', 'area'),
      L('            best = max(best, area);', 'best'),
      L('            if (height[l] < height[r])', 'movel'),
      L('                l++;', 'movel'),
      L('            else'),
      L('                r--;', 'mover'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxArea(int[] height) {'),
      L('        int l = 0, r = height.length - 1, best = 0;', 'init'),
      L('        while (l < r) {', 'loop'),
      L('            int area = Math.min(height[l], height[r]) * (r - l);', 'area'),
      L('            best = Math.max(best, area);', 'best'),
      L('            if (height[l] < height[r])', 'movel'),
      L('                l++;', 'movel'),
      L('            else'),
      L('                r--;', 'mover'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.height, { min: 0 });
    if (typeof arr === 'string') return { error: arr };
    if (arr.length < 2) return { error: 'Need at least two walls.' };

    const steps: Step[] = [];
    let l = 0;
    let r = arr.length - 1;
    let best = 0;
    const st = (extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      bars: true,
      ptrs: [
        { name: 'l', i: l, c: 'a' },
        { name: 'r', i: r, c: 'c' },
      ],
      aggs: [{ label: 'best area', value: String(best), c: 'b' }],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Start with the widest possible container: walls at ', A('l = 0'), ' and ', C(`r = ${r}`), '.'],
      state: st(),
    });
    while (l < r) {
      const h = Math.min(arr[l], arr[r]);
      const area = h * (r - l);
      const improved = area > best;
      const mark: ArrayState['mark'] = { [l]: 'active', [r]: 'active' };
      steps.push({
        tag: 'area',
        tag2: improved ? 'best' : undefined,
        trace: [
          'Water held = min(', A(arr[l]), ', ', A(arr[r]), ') × width ', A(r - l), ' = ', A(area),
          improved ? ' — a new best!' : ` — not better than ${best}.`,
        ],
        state: st({
          mark,
          aggs: [
            { label: 'area', value: `${h} × ${r - l} = ${area}`, c: 'a' },
            { label: 'best area', value: String(Math.max(best, area)), c: 'b' },
          ],
        }),
      });
      best = Math.max(best, area);
      if (arr[l] < arr[r]) {
        steps.push({
          tag: 'movel',
          trace: ['The left wall ', F(arr[l]), ' is shorter — keeping it can never beat the current pair. Move ', A('l → ' + (l + 1)), '.'],
          state: st({ mark: { [l]: 'dim', [r]: 'active' } }),
        });
        l++;
      } else {
        steps.push({
          tag: 'mover',
          trace: ['The right wall ', F(arr[r]), ' is not taller — move ', A('r → ' + (r - 1)), ' hoping for a taller wall.'],
          state: st({ mark: { [l]: 'active', [r]: 'dim' } }),
        });
        r--;
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Pointers met — the biggest container held ', C(best), ' units of water.'],
      state: st(),
    });
    return { steps, result: String(best), resultDetail: 'maximum water area' };
  },
  note: 'Area is limited by the shorter wall. Moving the taller wall inward can only shrink the width while the height stays capped — so the only move that might help is advancing the shorter wall. That single insight prunes O(n²) pairs down to one O(n) sweep.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'Measure the container formed by every pair of walls and keep the largest.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxArea(vector<int>& height) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < height.size(); i++)', 'outer'),
        L('            for (int j = i + 1; j < height.size(); j++) {', 'inner'),
        L('                int area = min(height[i], height[j]) * (j - i);', 'area'),
        L('                best = max(best, area);', 'best'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxArea(int[] height) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < height.length; i++)', 'outer'),
        L('            for (int j = i + 1; j < height.length; j++) {', 'inner'),
        L('                int area = Math.min(height[i], height[j]) * (j - i);', 'area'),
        L('                best = Math.max(best, area);', 'best'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.height, { min: 0 });
      if (typeof arr === 'string') return { error: arr };
      if (arr.length < 2) return { error: 'Need at least two walls.' };

      const steps: Step[] = [];
      let best = 0;
      let bestPair: [number, number] = [0, 1];
      let tried = 0;
      const st = (i: number, j: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        bars: true,
        ptrs: [
          { name: 'i', i, c: 'b' },
          ...(j < arr.length ? [{ name: 'j', i: j, c: 'a' as const }] : []),
        ],
        aggs: [
          { label: 'pairs tried', value: String(tried), c: 'a' },
          { label: 'best area', value: String(best), c: 'c' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Brute force: measure ', A('every pair of walls'), ' and remember the largest area.'],
        state: st(0, 1),
      });
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const area = Math.min(arr[i], arr[j]) * (j - i);
          tried++;
          const improved = area > best;
          if (improved) {
            best = area;
            bestPair = [i, j];
          }
          steps.push({
            tag: improved ? 'best' : 'area',
            tag2: 'inner',
            trace: [
              'Walls ', B(i), ' and ', A(j), ': height ', A(Math.min(arr[i], arr[j])), ' × width ', A(j - i), ' = ',
              improved ? B(area) : F(area),
              improved ? ' — new best.' : ` — best stays ${best}.`,
            ],
            state: st(i, j, { window: [i, j], mark: { [i]: 'active', [j]: 'active' } }),
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['All ', C(tried), ' pairs measured — the biggest container holds ', C(best), '.'],
        state: st(bestPair[0], bestPair[1], {
          window: bestPair,
          mark: { [bestPair[0]]: 'final', [bestPair[1]]: 'final' },
        }),
      });
      return {
        steps,
        result: String(best),
        resultDetail: `${tried} pairs measured — the two-pointer sweep needs ${arr.length - 1}`,
      };
    },
    note: 'Every pair really is measured here, which is why it is obviously correct and obviously slow. The waste is that after fixing wall i, shrinking the width can only pay off if the height goes up — and once you notice that only the shorter wall limits the area, the whole inner loop collapses into a single pointer move.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================================================================
 * 283. Move Zeroes
 * ================================================================ */
const moveZeroes: ProblemDef = {
  slug: 'move-zeroes',
  title: 'Move Zeroes',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/move-zeroes/',
  technique: 'Slow/fast pointers: the slow pointer marks where the next non-zero belongs.',
  widget: 'array',
  widgetTitle: 'Array & pointers',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '0, 1, 0, 3, 12', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void moveZeroes(vector<int>& nums) {'),
      L('        int slow = 0;', 'init'),
      L('        for (int fast = 0; fast < nums.size(); fast++) {', 'loop'),
      L('            if (nums[fast] != 0) {', 'check', 'skip'),
      L('                swap(nums[slow], nums[fast]);', 'swap'),
      L('                slow++;', 'swap'),
      L('            }'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void moveZeroes(int[] nums) {'),
      L('        int slow = 0;', 'init'),
      L('        for (int fast = 0; fast < nums.length; fast++) {', 'loop'),
      L('            if (nums[fast] != 0) {', 'check', 'skip'),
      L('                int t = nums[slow]; nums[slow] = nums[fast]; nums[fast] = t;', 'swap'),
      L('                slow++;', 'swap'),
      L('            }'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.nums);
    if (typeof input === 'string') return { error: input };
    const arr = [...input];

    const steps: Step[] = [];
    let slow = 0;
    const st = (fast: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: [...arr],
      ptrs: [
        { name: 'slow', i: slow, c: 'b' },
        ...(fast < arr.length ? [{ name: 'fast', i: fast, c: 'a' as const }] : []),
      ],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: [B('slow'), ' marks where the next non-zero value belongs; ', A('fast'), ' scans every element.'],
      state: st(0),
    });
    for (let fast = 0; fast < arr.length; fast++) {
      if (arr[fast] !== 0) {
        const doSwap = slow !== fast;
        steps.push({
          tag: 'check',
          trace: ['nums[fast] = ', A(arr[fast]), ' is non-zero — it belongs at position ', B(slow), '.'],
          state: st(fast, { mark: { [fast]: 'active' } }),
        });
        [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
        const swappedTo = slow;
        slow++;
        steps.push({
          tag: 'swap',
          trace: doSwap
            ? ['Swap it into place: positions ', B(swappedTo), ' ↔ ', A(fast), ', then advance slow to ', B(slow), '.']
            : ['Already in place — just advance slow to ', B(slow), '.'],
          state: st(fast, { mark: { [swappedTo]: 'good' } }),
        });
      } else {
        steps.push({
          tag: 'skip',
          trace: ['nums[fast] = ', F(0), ' — skip it; zeroes drift toward the back as swaps happen.'],
          state: st(fast, { mark: { [fast]: 'dim' } }),
        });
      }
    }
    steps.push({
      tag: 'loop',
      trace: ['Scan complete — all non-zeroes are packed in front, in their original order: ', C(`[${arr.join(', ')}]`), '.'],
      state: {
        arr: [...arr],
        ptrs: [{ name: 'slow', i: Math.min(slow, arr.length - 1), c: 'b' }],
        mark: Object.fromEntries(arr.map((v, i) => [i, v === 0 ? 'dim' : 'good'])),
      } satisfies ArrayState,
    });
    return { steps, result: `[${arr.join(', ')}]`, resultDetail: 'in-place, one pass, order preserved' };
  },
  note: 'Everything left of slow is a non-zero prefix in original order, and everything between slow and fast is zeroes — the swap maintains both invariants, so when fast finishes, the array is exactly the answer with no extra memory.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Extra array',
    technique: 'Copy the non-zeroes into a second array, then pad it with zeroes and copy back.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void moveZeroes(vector<int>& nums) {'),
        L('        vector<int> out;', 'init'),
        L('        for (int x : nums)', 'scan'),
        L('            if (x != 0) out.push_back(x);', 'keep', 'drop'),
        L('        while (out.size() < nums.size())', 'pad'),
        L('            out.push_back(0);', 'pad'),
        L('        nums = out;', 'copy'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void moveZeroes(int[] nums) {'),
        L('        int[] out = new int[nums.length];', 'init'),
        L('        int k = 0;', 'init'),
        L('        for (int x : nums)', 'scan'),
        L('            if (x != 0) out[k++] = x;', 'keep', 'drop'),
        L('        while (k < nums.length)', 'pad'),
        L('            out[k++] = 0;', 'pad'),
        L('        System.arraycopy(out, 0, nums, 0, nums.length);', 'copy'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums);
      if (typeof input === 'string') return { error: input };

      const steps: Step[] = [];
      const out: number[] = [];
      const view = (read: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: input,
        ptrs: read < input.length ? [{ name: 'read', i: read, c: 'a' }] : [],
        aggs: [{ label: 'out', value: `[${out.join(', ')}]`, c: 'b' }],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Start an ', B('empty second array'), ' — the non-zeroes will be copied into it in order.'],
        state: view(0),
      });
      for (let i = 0; i < input.length; i++) {
        if (input[i] !== 0) {
          out.push(input[i]);
          steps.push({
            tag: 'keep',
            tag2: 'scan',
            trace: [A(input[i]), ' is non-zero — append it to out, now ', B(`[${out.join(', ')}]`), '.'],
            state: view(i, { mark: { [i]: 'good' } }),
          });
        } else {
          steps.push({
            tag: 'drop',
            tag2: 'scan',
            trace: [F(0), ' — skip it entirely; the padding step will put the zeroes back at the end.'],
            state: view(i, { mark: { [i]: 'dim' } }),
          });
        }
      }
      const zeros = input.length - out.length;
      for (let z = 0; z < zeros; z++) out.push(0);
      steps.push({
        tag: 'pad',
        trace: ['Scan done. Pad with the ', A(zeros), ' zeroes that were dropped: ', B(`[${out.join(', ')}]`), '.'],
        state: {
          arr: [...out],
          mark: Object.fromEntries(out.map((v, i) => [i, v === 0 ? 'dim' : 'good'])),
        } satisfies ArrayState,
      });
      steps.push({
        tag: 'copy',
        trace: ['Copy the second array back over the original: ', C(`[${out.join(', ')}]`), '.'],
        state: {
          arr: [...out],
          mark: Object.fromEntries(out.map((_, i) => [i, 'final' as const])),
        } satisfies ArrayState,
      });
      return {
        steps,
        result: `[${out.join(', ')}]`,
        resultDetail: `correct, but it allocated a second array of ${input.length} elements`,
      };
    },
    note: 'Correct and easy to reason about, and the usual first answer — but it breaks the "do this in-place" requirement by allocating a whole second array. The two-pointer version reaches the same layout by noticing that the space just past the non-zero prefix is exactly where a zero can be parked, so the swap needs no new memory at all.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================================================================
 * 3. Longest Substring Without Repeating Characters
 * ================================================================ */
const longestSubstring: ProblemDef = {
  slug: 'longest-substring-without-repeating-characters',
  title: 'Longest Substring Without Repeating Characters',
  category: 'Sliding Window',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  technique: 'A sliding window that jumps its left edge past any repeated character.',
  widget: 'array',
  widgetTitle: 'String & window',
  inputs: [{ key: 's', label: 'String s', defaultValue: 'abcabcbb', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int lengthOfLongestSubstring(string s) {'),
      L('        vector<int> last(128, -1);', 'init'),
      L('        int best = 0, l = 0;', 'init'),
      L('        for (int r = 0; r < s.size(); r++) {', 'loop'),
      L('            if (last[s[r]] >= l)', 'dup', 'nodup'),
      L('                l = last[s[r]] + 1;', 'dup'),
      L('            last[s[r]] = r;', 'record'),
      L('            best = max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int lengthOfLongestSubstring(String s) {'),
      L('        int[] last = new int[128];', 'init'),
      L('        java.util.Arrays.fill(last, -1);', 'init'),
      L('        int best = 0, l = 0;', 'init'),
      L('        for (int r = 0; r < s.length(); r++) {', 'loop'),
      L('            char c = s.charAt(r);', 'loop'),
      L('            if (last[c] >= l)', 'dup', 'nodup'),
      L('                l = last[c] + 1;', 'dup'),
      L('            last[c] = r;', 'record'),
      L('            best = Math.max(best, r - l + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = values.s ?? '';
    if (s.length === 0) return { error: 'Enter a non-empty string.' };
    if (s.length > 20) return { error: 'Keep it to at most 20 characters so the steps stay readable.' };
    if (/\s/.test(s)) return { error: 'No whitespace characters, please.' };

    const chars = s.split('');
    const steps: Step[] = [];
    const last = new Map<string, number>();
    let best = 0;
    let bestRange: [number, number] = [0, -1];
    let l = 0;

    const st = (r: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: chars,
      window: r >= l ? [l, r] : null,
      ptrs: [
        { name: 'l', i: l, c: 'b' },
        { name: 'r', i: Math.min(r, chars.length - 1), c: 'a' },
      ],
      aggs: [
        { label: 'window', value: r >= l ? `"${s.slice(l, r + 1)}" (${r - l + 1})` : '(empty)', c: 'a' },
        { label: 'best', value: String(best), c: 'b' },
      ],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Start with an empty window; ', B('l'), ' and ', A('r'), ' both at 0. Remember the last index of every character seen.'],
      state: st(0),
    });
    for (let r = 0; r < chars.length; r++) {
      const ch = chars[r];
      const prev = last.get(ch);
      if (prev !== undefined && prev >= l) {
        l = prev + 1;
        steps.push({
          tag: 'dup',
          trace: ["'", A(ch), "' is already inside the window (index ", F(prev), ') — jump the left edge past it: l = ', B(l), '.'],
          state: st(r, { mark: { [prev]: 'dim', [r]: 'active' } }),
        });
      } else {
        steps.push({
          tag: 'nodup',
          trace: ["'", A(ch), "' is new to the window — extend it."],
          state: st(r, { mark: { [r]: 'active' } }),
        });
      }
      last.set(ch, r);
      const len = r - l + 1;
      const improved = len > best;
      if (improved) {
        best = len;
        bestRange = [l, r];
      }
      steps.push({
        tag: 'best',
        tag2: 'record',
        trace: improved
          ? ['Window "', B(s.slice(l, r + 1)), '" has length ', B(len), ' — new best!']
          : ['Window length ', A(len), ' does not beat best = ', B(best), '.'],
        state: st(r),
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Scan done — the longest run without repeats was "', C(s.slice(bestRange[0], bestRange[1] + 1)), '" with length ', C(best), '.'],
      state: {
        arr: chars,
        window: bestRange[1] >= bestRange[0] ? bestRange : null,
        aggs: [{ label: 'answer', value: String(best), c: 'c' }],
      } satisfies ArrayState,
    });
    return {
      steps,
      result: String(best),
      resultDetail: `longest substring: "${s.slice(bestRange[0], bestRange[1] + 1)}"`,
    };
  },
  note: 'The window only ever moves forward: r advances every iteration, and l jumps directly past a duplicate instead of creeping one step at a time (that is what remembering each character\'s last index buys). Both pointers traverse the string once, so the whole thing is O(n).',
  complexity: { time: 'O(n)', space: 'O(min(n, alphabet))' },
  brute: {
    label: 'Every substring',
    technique: 'Start at each index, extend one character at a time, and stop the moment a repeat appears.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int lengthOfLongestSubstring(string s) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < s.size(); i++) {', 'outer'),
        L('            set<char> seen;', 'reset'),
        L('            for (int j = i; j < s.size(); j++) {', 'inner'),
        L('                if (seen.count(s[j])) break;', 'stop'),
        L('                seen.insert(s[j]);', 'extend'),
        L('                best = max(best, j - i + 1);', 'best'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int lengthOfLongestSubstring(String s) {'),
        L('        int best = 0;', 'init'),
        L('        for (int i = 0; i < s.length(); i++) {', 'outer'),
        L('            Set<Character> seen = new HashSet<>();', 'reset'),
        L('            for (int j = i; j < s.length(); j++) {', 'inner'),
        L('                if (!seen.add(s.charAt(j))) break;', 'stop', 'extend'),
        L('                best = Math.max(best, j - i + 1);', 'best'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = values.s ?? '';
      if (s.length === 0) return { error: 'Enter a non-empty string.' };
      if (s.length > 20) return { error: 'Keep it to at most 20 characters so the steps stay readable.' };
      if (/\s/.test(s)) return { error: 'No whitespace characters, please.' };

      const chars = s.split('');
      const steps: Step[] = [];
      let best = 0;
      let bestRange: [number, number] = [0, -1];
      let examined = 0;
      const st = (i: number, j: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: chars,
        window: j >= i ? [i, j] : null,
        aggs: [
          { label: 'substrings tried', value: String(examined), c: 'a' },
          { label: 'best', value: String(best), c: 'c' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Try every starting index in turn and grow the substring until a character repeats.'],
        state: st(0, -1),
      });
      for (let i = 0; i < chars.length; i++) {
        const seen = new Set<string>();
        steps.push({
          tag: 'reset',
          tag2: 'outer',
          trace: ['New start at index ', A(i), " ('", A(chars[i]), "') — the seen-set is emptied and rebuilt from scratch."],
          state: st(i, -1, { mark: { [i]: 'active' } }),
        });
        for (let j = i; j < chars.length; j++) {
          examined++;
          if (seen.has(chars[j])) {
            steps.push({
              tag: 'stop',
              trace: ["'", F(chars[j]), "' already appears in this window — stop extending from ", F(i), '.'],
              state: st(i, j - 1, { mark: { [j]: 'dim' } }),
            });
            break;
          }
          seen.add(chars[j]);
          const len = j - i + 1;
          const improved = len > best;
          if (improved) {
            best = len;
            bestRange = [i, j];
          }
          steps.push({
            tag: improved ? 'best' : 'extend',
            trace: [
              'Window "', improved ? B(s.slice(i, j + 1)) : A(s.slice(i, j + 1)), '" has length ',
              improved ? B(len) : F(len),
              improved ? ' — new best.' : ` — best stays ${best}.`,
            ],
            state: st(i, j),
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: [C(examined), ' substrings examined; the longest without repeats was "', C(s.slice(bestRange[0], bestRange[1] + 1)), '" at length ', C(best), '.'],
        state: st(bestRange[0], bestRange[1]),
      });
      return {
        steps,
        result: String(best),
        resultDetail: `longest substring: "${s.slice(bestRange[0], bestRange[1] + 1)}" — after ${examined} substring checks`,
      };
    },
    note: 'Every start index rebuilds its seen-set from nothing, so work already done is thrown away — that is the whole inefficiency. The sliding window keeps one set alive across the entire string and moves the left edge forward instead of restarting it, which is why the same answer falls out in a single pass.',
    complexity: { time: 'O(n²)', space: 'O(min(n, alphabet))' },
  },
};

/* ================================================================
 * 121. Best Time to Buy and Sell Stock
 * ================================================================ */
const buySellStock: ProblemDef = {
  slug: 'best-time-to-buy-and-sell-stock',
  title: 'Best Time to Buy and Sell Stock',
  category: 'Sliding Window',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  technique: 'One pass tracking the cheapest day seen so far — every day is a potential sell.',
  widget: 'array',
  widgetTitle: 'Prices by day',
  inputs: [{ key: 'prices', label: 'Prices', defaultValue: '7, 1, 5, 3, 6, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxProfit(vector<int>& prices) {'),
      L('        int minPrice = INT_MAX, best = 0;', 'init'),
      L('        for (int i = 0; i < prices.size(); i++) {', 'loop'),
      L('            if (prices[i] < minPrice)', 'buy', 'profit'),
      L('                minPrice = prices[i];', 'buy'),
      L('            else'),
      L('                best = max(best, prices[i] - minPrice);', 'profit', 'newbest'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxProfit(int[] prices) {'),
      L('        int minPrice = Integer.MAX_VALUE, best = 0;', 'init'),
      L('        for (int i = 0; i < prices.length; i++) {', 'loop'),
      L('            if (prices[i] < minPrice)', 'buy', 'profit'),
      L('                minPrice = prices[i];', 'buy'),
      L('            else'),
      L('                best = Math.max(best, prices[i] - minPrice);', 'profit', 'newbest'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const prices = parseIntArray(values.prices, { min: 0 });
    if (typeof prices === 'string') return { error: prices };
    if (prices.length < 1) return { error: 'Enter at least one price.' };

    const steps: Step[] = [];
    let minPrice = Infinity;
    let minIdx = -1;
    let best = 0;
    let bestBuy = -1;
    let bestSell = -1;
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: prices,
      bars: true,
      ptrs: [
        ...(minIdx >= 0 ? [{ name: 'buy', i: minIdx, c: 'b' as const }] : []),
        { name: 'day', i: Math.min(i, prices.length - 1), c: 'a' },
      ],
      aggs: [
        { label: 'cheapest so far', value: minIdx >= 0 ? `${minPrice} (day ${minIdx})` : '—', c: 'b' },
        { label: 'best profit', value: String(best), c: 'c' },
      ],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Walk the days once. Track the ', B('cheapest buy price'), ' so far and the ', C('best profit'), ' seen.'],
      state: st(0),
    });
    for (let i = 0; i < prices.length; i++) {
      if (prices[i] < minPrice) {
        minPrice = prices[i];
        minIdx = i;
        steps.push({
          tag: 'buy',
          trace: ['Day ', A(i), ': price ', B(prices[i]), ' is the cheapest yet — this becomes the new buy day.'],
          state: st(i, { mark: { [i]: 'good' } }),
        });
      } else {
        const profit = prices[i] - minPrice;
        const improved = profit > best;
        if (improved) {
          best = profit;
          bestBuy = minIdx;
          bestSell = i;
        }
        steps.push({
          tag: 'profit',
          tag2: improved ? 'newbest' : undefined,
          trace: [
            'Day ', A(i), ': selling at ', A(prices[i]), ' after buying at ', B(minPrice), ' earns ', A(profit),
            improved ? ' — new best profit!' : ` — not better than ${best}.`,
          ],
          state: st(i, { mark: { [i]: 'active' } }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Done — the best single buy/sell earns ', C(best), '.'],
      state: st(prices.length),
    });
    return {
      steps,
      result: String(best),
      resultDetail:
        best === 0
          ? 'prices only fell — never trade'
          : `buy day ${bestBuy} at ${prices[bestBuy]}, sell day ${bestSell} at ${prices[bestSell]}`,
    };
  },
  note: 'For any sell day, the only buy that matters is the cheapest price before it — so carrying one running minimum replaces checking every earlier day. One number of state turns an O(n²) pair search into a single pass.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'Try every buy day against every later sell day and keep the largest profit.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxProfit(vector<int>& prices) {'),
        L('        int best = 0;', 'init'),
        L('        for (int buy = 0; buy < prices.size(); buy++)', 'outer'),
        L('            for (int sell = buy + 1; sell < prices.size(); sell++)', 'inner'),
        L('                best = max(best, prices[sell] - prices[buy]);', 'profit'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxProfit(int[] prices) {'),
        L('        int best = 0;', 'init'),
        L('        for (int buy = 0; buy < prices.length; buy++)', 'outer'),
        L('            for (int sell = buy + 1; sell < prices.length; sell++)', 'inner'),
        L('                best = Math.max(best, prices[sell] - prices[buy]);', 'profit'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const prices = parseIntArray(values.prices, { min: 0 });
      if (typeof prices === 'string') return { error: prices };
      if (prices.length < 1) return { error: 'Need at least one price.' };

      const steps: Step[] = [];
      let best = 0;
      let bestBuy = -1;
      let bestSell = -1;
      let tried = 0;
      const st = (buy: number, sell: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: prices,
        bars: true,
        ptrs: [
          { name: 'buy', i: buy, c: 'b' },
          ...(sell < prices.length ? [{ name: 'sell', i: sell, c: 'a' as const }] : []),
        ],
        aggs: [
          { label: 'pairs tried', value: String(tried), c: 'a' },
          { label: 'best profit', value: String(best), c: 'c' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'init',
        trace: ['Brute force: test ', A('every buy day'), ' against ', A('every later sell day'), '.'],
        state: st(0, 1),
      });
      for (let buy = 0; buy < prices.length; buy++) {
        steps.push({
          tag: 'outer',
          trace: ['Suppose we buy on day ', B(buy), ' at ', B(prices[buy]), ' — now try selling on each later day.'],
          state: st(buy, buy + 1, { mark: { [buy]: 'good' } }),
        });
        for (let sell = buy + 1; sell < prices.length; sell++) {
          const profit = prices[sell] - prices[buy];
          tried++;
          const improved = profit > best;
          if (improved) {
            best = profit;
            bestBuy = buy;
            bestSell = sell;
          }
          steps.push({
            tag: 'profit',
            tag2: 'inner',
            trace: [
              'Sell on day ', A(sell), ' at ', A(prices[sell]), ' → profit ',
              improved ? B(profit) : F(profit),
              improved ? ' — new best.' : ` — best stays ${best}.`,
            ],
            state: st(buy, sell, { mark: { [buy]: 'good', [sell]: 'active' } }),
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['All ', C(tried), ' buy/sell pairs tried — the best profit is ', C(best), '.'],
        state:
          bestBuy >= 0
            ? st(bestBuy, bestSell, { mark: { [bestBuy]: 'final', [bestSell]: 'final' } })
            : st(0, prices.length),
      });
      return {
        steps,
        result: String(best),
        resultDetail:
          best === 0
            ? `prices only fell — never trade (after ${tried} pair checks)`
            : `buy day ${bestBuy} at ${prices[bestBuy]}, sell day ${bestSell} at ${prices[bestSell]} — after ${tried} pair checks`,
      };
    },
    note: 'Watch the buy pointer: for a fixed sell day it revisits every earlier price, even though only the cheapest of them could ever win. Replacing that inner loop with one running minimum is the entire optimisation, and it is why the answer drops from O(n²) to O(n).',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

export const pointerProblems = [twoSumII, container, moveZeroes, longestSubstring, buySellStock];
