import type { ProblemDef, Step, StackState } from '../../lib/types';
import { parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';

function makeStackState(
  nums: number[],
  currI: number | null,
  ak: number,
  stack: number[],
  marks: Record<number, 'active' | 'good' | 'dim' | 'final'> = {}
): StackState {
  return {
    array: {
      arr: nums,
      ptrs: currI !== null ? [{ name: 'i', i: currI, c: 'a' }] : [],
      mark: marks,
    },
    stack: stack.map((val) => ({ v: val, c: 'a' })),
    stackLabel: 'Monotonic Stack (j candidates)',
    aggs: [
      {
        label: 'ak (nums[k])',
        value: ak === -Infinity ? '-∞' : String(ak),
        c: ak === -Infinity ? undefined : 'b',
      },
    ],
  };
}

export const problem: ProblemDef = {
  slug: '132-pattern',
  title: '132 Pattern',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/132-pattern/',
  technique: 'Right-to-left monotonic stack: maintain the maximum valid nums[k] (ak) popped by larger nums[j] values.',
  widget: 'stack',
  widgetTitle: 'Array & Stack Trace',
  inputs: [
    {
      key: 'nums',
      label: 'Array',
      defaultValue: '1, 2, 3, 4',
      wide: true,
    },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool find132pattern(vector<int>& nums) {'),
      L('        int ak = INT_MIN;', 'init'),
      L('        stack<int> st;', 'init'),
      L('        for (int i = nums.size() - 1; i >= 0; i--) {', 'loop'),
      L('            if (nums[i] < ak) return true;', 'check', 'found'),
      L('            while (!st.empty() && nums[i] > st.top()) {', 'pop'),
      L('                ak = st.top(); st.pop();', 'pop'),
      L('            }'),
      L('            st.push(nums[i]);', 'push'),
      L('        }'),
      L('        return false;', 'return-false'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean find132pattern(int[] nums) {'),
      L('        int ak = Integer.MIN_VALUE;', 'init'),
      L('        Deque<Integer> st = new ArrayDeque<>();', 'init'),
      L('        for (int i = nums.length - 1; i >= 0; i--) {', 'loop'),
      L('            if (nums[i] < ak) return true;', 'check', 'found'),
      L('            while (!st.isEmpty() && nums[i] > st.peek()) {', 'pop'),
      L('                ak = st.pop();', 'pop'),
      L('            }'),
      L('            st.push(nums[i]);', 'push'),
      L('        }'),
      L('        return false;', 'return-false'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { min: -1000, max: 1000, maxLen: 12 });
    if (typeof parsed === 'string') return { error: parsed };
    if (parsed.length < 3) return { error: 'Please enter at least 3 numbers to look for a 132 pattern.' };

    const nums = parsed;
    const steps: Step[] = [];
    const stack: number[] = [];
    let ak = -Infinity;
    const marks: Record<number, 'active' | 'good' | 'dim' | 'final'> = {};

    steps.push({
      tag: 'init',
      trace: [
        'Initialize ',
        B('ak = -∞'),
        ' (best third element candidates) and an empty stack of potential ',
        A('nums[j]'),
        ' elements.',
      ],
      state: makeStackState(nums, null, ak, stack, marks),
    });

    for (let i = nums.length - 1; i >= 0; i--) {
      const val = nums[i];

      steps.push({
        tag: 'loop',
        trace: ['Scan right-to-left: inspect nums[', A(i), '] = ', A(val), '.'],
        state: makeStackState(nums, i, ak, stack, { ...marks, [i]: 'active' }),
      });

      if (val < ak) {
        marks[i] = 'good';
        steps.push({
          tag: 'found',
          tag2: 'check',
          trace: [
            'Found 132 pattern! nums[',
            A(i),
            '] = ',
            A(val),
            ' < ak (',
            B(ak),
            '). Satisfies ',
            C(`nums[i] (${val}) < nums[k] (${ak}) < nums[j]`),
            '!',
          ],
          state: makeStackState(nums, i, ak, stack, marks),
        });
        return {
          steps,
          result: 'true',
          resultDetail: `132 pattern found: nums[${i}] = ${val} < ak = ${ak}`,
        };
      }

      steps.push({
        tag: 'check',
        trace: [
          'nums[',
          A(i),
          '] = ',
          A(val),
          ' is not strictly smaller than ak (',
          F(ak === -Infinity ? '-∞' : ak),
          ') — cannot form 132 pattern with current ak.',
        ],
        state: makeStackState(nums, i, ak, stack, { ...marks, [i]: 'active' }),
      });

      let poppedAny = false;
      while (stack.length > 0 && val > stack[stack.length - 1]) {
        const popped = stack.pop()!;
        ak = popped;
        poppedAny = true;
        steps.push({
          tag: 'pop',
          trace: [
            'nums[i] = ',
            A(val),
            ' > stack top ',
            F(popped),
            '. Pop ',
            B(popped),
            ' and set ',
            B(`ak = ${ak}`),
            '.',
          ],
          state: makeStackState(nums, i, ak, stack, { ...marks, [i]: 'active' }),
        });
      }

      if (!poppedAny && stack.length > 0) {
        steps.push({
          tag: 'pop',
          trace: [
            'nums[i] = ',
            A(val),
            ' ≤ stack top ',
            F(stack[stack.length - 1]),
            ' — no popping needed.',
          ],
          state: makeStackState(nums, i, ak, stack, { ...marks, [i]: 'active' }),
        });
      }

      stack.push(val);
      marks[i] = 'dim';
      steps.push({
        tag: 'push',
        trace: ['Push ', A(val), ' onto the stack as a future ', A('nums[j]'), ' candidate.'],
        state: makeStackState(nums, i, ak, stack, { ...marks, [i]: 'dim' }),
      });
    }

    steps.push({
      tag: 'return-false',
      trace: ['Scanned entire array without finding a valid 132 pattern. Return ', C('false'), '.'],
      state: makeStackState(nums, null, ak, stack, Object.fromEntries(nums.map((_, idx) => [idx, 'final']))),
    });

    return {
      steps,
      result: 'false',
      resultDetail: 'No 132 pattern exists in the array.',
    };
  },
  note: 'By iterating from right to left, we treat nums[i] as element 1. The monotonic stack maintains candidates for element 3 (nums[j]), and whenever we pop smaller values from the stack, we record the largest popped element as ak (element 2). If nums[i] < ak, a valid 132 pattern is confirmed.',
  complexity: {
    time: 'O(n)',
    space: 'O(n)',
  },
  brute: {
    label: 'Prefix Min & Linear Scan',
    technique: 'Maintain prefix minimums for nums[i], then test all possible peak indices j and right indices k.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool find132pattern(vector<int>& nums) {'),
        L('        int n = nums.size();'),
        L('        int min_i = INT_MAX;', 'init'),
        L('        for (int j = 0; j < n; j++) {', 'loop_j'),
        L('            min_i = min(min_i, nums[j]);', 'min'),
        L('            if (min_i == nums[j]) continue;', 'check_j'),
        L('            for (int k = j + 1; k < n; k++) {', 'loop_k'),
        L('                if (nums[k] > min_i && nums[k] < nums[j]) return true;', 'found'),
        L('            }'),
        L('        }'),
        L('        return false;', 'return-false'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean find132pattern(int[] nums) {'),
        L('        int n = nums.length;'),
        L('        int minI = Integer.MAX_VALUE;', 'init'),
        L('        for (int j = 0; j < n; j++) {', 'loop_j'),
        L('            minI = Math.min(minI, nums[j]);', 'min'),
        L('            if (minI == nums[j]) continue;', 'check_j'),
        L('            for (int k = j + 1; k < n; k++) {', 'loop_k'),
        L('                if (nums[k] > minI && nums[k] < nums[j]) return true;', 'found'),
        L('            }'),
        L('        }'),
        L('        return false;', 'return-false'),
        L('    }'),
        L('}'),
      ],
    },
    note: 'For every peak candidate nums[j], the smallest available element to its left is the prefix minimum. Checking all indices k to the right takes O(n²) total time.',
    complexity: {
      time: 'O(n²)',
      space: 'O(1)',
    },
    run(values) {
      const parsed = parseIntArray(values.nums, { min: -1000, max: 1000, maxLen: 12 });
      if (typeof parsed === 'string') return { error: parsed };
      if (parsed.length < 3) return { error: 'Please enter at least 3 numbers.' };

      const nums = parsed;
      const steps: Step[] = [];
      let minI = Infinity;

      const makeBruteState = (
        j: number | null,
        k: number | null,
        currentMin: number,
        marks: Record<number, 'active' | 'good' | 'dim' | 'final'> = {}
      ): StackState => {
        const ptrs = [];
        if (j !== null) ptrs.push({ name: 'j', i: j, c: 'a' as const });
        if (k !== null) ptrs.push({ name: 'k', i: k, c: 'b' as const });
        return {
          array: {
            arr: nums,
            ptrs,
            mark: marks,
          },
          stack: [],
          stackLabel: 'Stack (unused in brute force)',
          aggs: [
            {
              label: 'min_i',
              value: currentMin === Infinity ? '∞' : String(currentMin),
              c: currentMin === Infinity ? undefined : 'a',
            },
          ],
        };
      };

      steps.push({
        tag: 'init',
        trace: ['Initialize ', A('min_i = ∞'), ' to track the minimum value seen to the left of j.'],
        state: makeBruteState(null, null, minI),
      });

      for (let j = 0; j < nums.length; j++) {
        const prevMin = minI;
        minI = Math.min(minI, nums[j]);

        steps.push({
          tag: 'min',
          tag2: 'loop_j',
          trace: ['Inspect j = ', A(j), ' (nums[j] = ', A(nums[j]), '). Update min_i = ', A(minI), '.'],
          state: makeBruteState(j, null, minI, { [j]: 'active' }),
        });

        if (minI === nums[j]) {
          steps.push({
            tag: 'check_j',
            trace: ['min_i equals nums[j] (', F(nums[j]), '), so no valid nums[i] < nums[j] exists left of j. Skip k scan.'],
            state: makeBruteState(j, null, minI, { [j]: 'dim' }),
          });
          continue;
        }

        for (let k = j + 1; k < nums.length; k++) {
          steps.push({
            tag: 'loop_k',
            trace: [
              'Check k = ',
              B(k),
              ' (nums[k] = ',
              B(nums[k]),
              '): need min_i (',
              A(minI),
              ') < nums[k] (',
              B(nums[k]),
              ') < nums[j] (',
              A(nums[j]),
              ').',
            ],
            state: makeBruteState(j, k, minI, { [j]: 'active', [k]: 'good' }),
          });

          if (nums[k] > minI && nums[k] < nums[j]) {
            steps.push({
              tag: 'found',
              trace: [
                'Found valid 132 pattern! ',
                C(`min_i (${minI}) < nums[k] (${nums[k]}) < nums[j] (${nums[j]})`),
                '!',
              ],
              state: makeBruteState(j, k, minI, { [j]: 'good', [k]: 'good' }),
            });
            return {
              steps,
              result: 'true',
              resultDetail: `132 pattern found: min_i=${minI}, nums[j]=${nums[j]}, nums[k]=${nums[k]}`,
            };
          }
        }
      }

      steps.push({
        tag: 'return-false',
        trace: ['Checked all pairs (j, k) without finding a 132 pattern. Return ', C('false'), '.'],
        state: makeBruteState(null, null, minI, Object.fromEntries(nums.map((_, i) => [i, 'final']))),
      });

      return {
        steps,
        result: 'false',
        resultDetail: 'No 132 pattern found after O(n²) checks.',
      };
    },
  },
};
