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
};

export const pointerProblems = [twoSumII, container, moveZeroes, longestSubstring, buySellStock];
