// Two Pointers, part 3 — Striver SDE / Love Babbar sheet staples.
import type { ArrayState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ================= 4Sum ================= */
const fourSum: ProblemDef = {
  slug: '4sum',
  title: '4Sum',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/4sum/',
  technique: 'Sort, fix two indices, then close in on the remaining pair from both ends.',
  widget: 'array',
  widgetTitle: 'Sorted array',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 0, -1, 0, -2, 2', wide: true },
    { key: 'target', label: 'Target', defaultValue: '0' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> fourSum(vector<int>& nums, int target) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        int n = nums.size();'),
      L('        vector<vector<int>> res;'),
      L('        for (int i = 0; i < n - 3; i++) {', 'i'),
      L('            if (i > 0 && nums[i] == nums[i-1]) continue;', 'skip'),
      L('            for (int j = i + 1; j < n - 2; j++) {', 'j'),
      L('                if (j > i+1 && nums[j] == nums[j-1]) continue;', 'skip'),
      L('                int lo = j + 1, hi = n - 1;'),
      L('                while (lo < hi) {', 'two'),
      L('                    long s = (long)nums[i] + nums[j] + nums[lo] + nums[hi];', 'two'),
      L('                    if (s == target) {', 'hit'),
      L('                        res.push_back({nums[i],nums[j],nums[lo],nums[hi]});', 'hit'),
      L('                        while (lo < hi && nums[lo] == nums[lo+1]) lo++;', 'hit'),
      L('                        while (lo < hi && nums[hi] == nums[hi-1]) hi--;', 'hit'),
      L('                        lo++; hi--;'),
      L('                    } else if (s < target) lo++;', 'low'),
      L('                    else hi--;', 'high'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> fourSum(int[] nums, int target) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        int n = nums.length;'),
      L('        List<List<Integer>> res = new ArrayList<>();'),
      L('        for (int i = 0; i < n - 3; i++) {', 'i'),
      L('            if (i > 0 && nums[i] == nums[i-1]) continue;', 'skip'),
      L('            for (int j = i + 1; j < n - 2; j++) {', 'j'),
      L('                if (j > i+1 && nums[j] == nums[j-1]) continue;', 'skip'),
      L('                int lo = j + 1, hi = n - 1;'),
      L('                while (lo < hi) {', 'two'),
      L('                    long s = (long)nums[i]+nums[j]+nums[lo]+nums[hi];', 'two'),
      L('                    if (s == target) {', 'hit'),
      L('                        res.add(List.of(nums[i],nums[j],nums[lo],nums[hi]));', 'hit'),
      L('                        while (lo < hi && nums[lo] == nums[lo+1]) lo++;', 'hit'),
      L('                        while (lo < hi && nums[hi] == nums[hi-1]) hi--;', 'hit'),
      L('                        lo++; hi--;'),
      L('                    } else if (s < target) lo++;', 'low'),
      L('                    else hi--;', 'high'),
      L('                }'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof parsed === 'string') return { error: parsed };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };
    if (parsed.length < 4) return { error: 'Give at least four numbers.' };
    const a = [...parsed].sort((x, y) => x - y);
    const n = a.length;
    const steps: Step[] = [];
    const res: number[][] = [];
    const st = (mark: ArrayState['mark'], ptrs: ArrayState['ptrs'] = []): ArrayState => ({
      arr: a,
      mark,
      ptrs,
      aggs: [{ label: 'quadruplets', value: res.length ? res.map((q) => `[${q.join(',')}]`).join(' ') : '—', c: 'c' }],
    });
    steps.push({
      tag: 'sort',
      trace: ['Sort first — that is what lets a pair of pointers know which way to move, and it puts duplicates next to each other so they are easy to skip.'],
      state: st({}),
    });
    outer: for (let i = 0; i < n - 3; i++) {
      if (i > 0 && a[i] === a[i - 1]) {
        steps.push({ tag: 'skip', trace: ['a[i] = ', F(a[i]), ' repeats the previous i — skip it, or we would emit the same quadruplet twice.'], state: st({ [i]: 'dim' }) });
        continue;
      }
      steps.push({ tag: 'i', trace: ['Fix the first number: ', A(a[i]), '.'], state: st({ [i]: 'active' }, [{ name: 'i', i, c: 'a' }]) });
      for (let j = i + 1; j < n - 2; j++) {
        if (j > i + 1 && a[j] === a[j - 1]) {
          steps.push({ tag: 'skip', trace: ['a[j] = ', F(a[j]), ' repeats the previous j — skip.'], state: st({ [i]: 'active', [j]: 'dim' }) });
          continue;
        }
        let lo = j + 1;
        let hi = n - 1;
        steps.push({
          tag: 'j',
          trace: ['Fix the second: ', A(a[j]), '. Now find a pair in the rest summing to ', B(target - a[i] - a[j]), '.'],
          state: st({ [i]: 'active', [j]: 'active' }, [{ name: 'j', i: j, c: 'a' }]),
        });
        while (lo < hi) {
          const s = a[i] + a[j] + a[lo] + a[hi];
          const ptrs: ArrayState['ptrs'] = [
            { name: 'lo', i: lo, c: 'b' },
            { name: 'hi', i: hi, c: 'c' },
          ];
          if (s === target) {
            res.push([a[i], a[j], a[lo], a[hi]]);
            steps.push({
              tag: 'hit',
              trace: [B(a[i]), ' + ', B(a[j]), ' + ', B(a[lo]), ' + ', B(a[hi]), ' = ', C(target), ' — a match!'],
              state: st({ [i]: 'good', [j]: 'good', [lo]: 'final', [hi]: 'final' }, ptrs),
            });
            while (lo < hi && a[lo] === a[lo + 1]) lo++;
            while (lo < hi && a[hi] === a[hi - 1]) hi--;
            lo++;
            hi--;
          } else if (s < target) {
            steps.push({
              tag: 'low',
              trace: ['Sum ', F(s), ' is below ', A(target), ' — the only way to grow it is to move ', B('lo'), ' right.'],
              state: st({ [i]: 'active', [j]: 'active', [lo]: 'dim', [hi]: 'win' }, ptrs),
            });
            lo++;
          } else {
            steps.push({
              tag: 'high',
              trace: ['Sum ', F(s), ' is above ', A(target), ' — shrink it by moving ', C('hi'), ' left.'],
              state: st({ [i]: 'active', [j]: 'active', [lo]: 'win', [hi]: 'dim' }, ptrs),
            });
            hi--;
          }
          if (steps.length > MAX_STEPS) break outer;
        }
      }
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Found ', C(res.length), ' unique quadruplet(s).'] : ['No quadruplet sums to ', C(target), '.'],
      state: st({}),
    });
    return { steps, result: res.length ? res.map((q) => `[${q.join(',')}]`).join(', ') : 'none' };
  },
  note: 'Sorting turns the inner search from "try every pair" into a single sweep, because a sum that is too small can only be fixed from the left and one that is too big only from the right. The duplicate skips are what make the output a set of unique quadruplets without any post-processing.',
  complexity: { time: 'O(n³)', space: 'O(1) beyond output' },
  brute: {
    label: 'Four loops',
    technique: 'Four nested loops over every index combination, with a set to throw away duplicate quadruplets.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> fourSum(vector<int>& nums, int target) {'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        set<vector<int>> uniq;', 'sort'),
        L('        int n = nums.size();'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++)', 'k'),
        L('              for (int l = k + 1; l < n; l++)', 'l'),
        L('                if (nums[i]+nums[j]+nums[k]+nums[l] == target)', 'test', 'hit'),
        L('                  uniq.insert({nums[i],nums[j],nums[k],nums[l]});', 'hit'),
        L('        return {uniq.begin(), uniq.end()};', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> fourSum(int[] nums, int target) {'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        Set<List<Integer>> uniq = new LinkedHashSet<>();', 'sort'),
        L('        int n = nums.length;'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++)', 'k'),
        L('              for (int l = k + 1; l < n; l++)', 'l'),
        L('                if (nums[i]+nums[j]+nums[k]+nums[l] == target)', 'test', 'hit'),
        L('                  uniq.add(List.of(nums[i],nums[j],nums[k],nums[l]));', 'hit'),
        L('        return new ArrayList<>(uniq);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums, { maxLen: 12 });
      if (typeof raw === 'string') return { error: raw };
      if (raw.length < 4) return { error: 'Need at least four numbers.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };

      const a = [...raw].sort((x, y) => x - y);
      const steps: Step[] = [];
      const seen = new Set<string>();
      const res: number[][] = [];
      let tested = 0;
      const st = (mark: Record<number, 'active' | 'good' | 'final' | 'dim'>, note?: string): ArrayState => ({
        arr: a,
        mark,
        aggs: [
          { label: 'combos tested', value: String(tested), c: 'a' },
          { label: 'target', value: String(target), c: 'c' },
          ...(note ? [{ label: 'found', value: note, c: 'b' as const }] : []),
        ],
      });

      steps.push({
        tag: 'sort',
        trace: ['Sort first so the quadruplets come out in a predictable order: ', A(`[${a.join(', ')}]`), '. Then test every 4-index combination.'],
        state: st({}),
      });
      outer: for (let i = 0; i < a.length; i++) {
        for (let j = i + 1; j < a.length; j++) {
          for (let k = j + 1; k < a.length; k++) {
            for (let l = k + 1; l < a.length; l++) {
              tested++;
              const sum = a[i] + a[j] + a[k] + a[l];
              const quad = [a[i], a[j], a[k], a[l]];
              const key = quad.join(',');
              const mark = { [i]: 'active', [j]: 'active', [k]: 'active', [l]: 'active' } as Record<
                number,
                'active'
              >;
              if (sum === target) {
                const fresh = !seen.has(key);
                if (fresh) {
                  seen.add(key);
                  res.push(quad);
                }
                steps.push({
                  tag: 'hit',
                  trace: [
                    quad.join(' + '), ' = ', B(sum), ' — ',
                    fresh ? B('new quadruplet') : F('a duplicate of one already found, discard'), '.',
                  ],
                  state: st(
                    Object.fromEntries(Object.keys(mark).map((x) => [x, fresh ? 'final' : 'dim'])) as never,
                    res.map((q) => `[${q.join(',')}]`).join(' ')
                  ),
                });
              } else {
                steps.push({
                  tag: 'test',
                  trace: [quad.join(' + '), ' = ', F(sum), ' ≠ ', C(target), '.'],
                  state: st(mark),
                });
              }
              if (steps.length > MAX_STEPS) break outer;
            }
          }
        }
      }
      steps.push({
        tag: 'ret',
        trace: [C(tested), ' combinations tested, yielding ', C(res.length), ' unique quadruplet(s).'],
        state: st({}, res.map((q) => `[${q.join(',')}]`).join(' ')),
      });
      return {
        steps,
        result: res.length ? res.map((q) => `[${q.join(',')}]`).join(', ') : 'none',
        resultDetail: `${tested} index combinations examined`,
      };
    },
    note: 'Two of the four loops are doing work the sorted order already answers: once i and j are fixed, the remaining pair is a Two Sum on a sorted range, which a converging pair of pointers finds in one sweep. That is the difference between O(n⁴) and O(n³) — and it is also what removes the need for a set, because the pointer version skips duplicates as it goes.',
    complexity: { time: 'O(n⁴)', space: 'O(k) for the dedupe set' },
  },
};

/* ================= 3Sum Closest ================= */
const threeSumClosest: ProblemDef = {
  slug: '3sum-closest',
  title: '3Sum Closest',
  category: 'Two Pointers',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/3sum-closest/',
  technique: 'Same sorted two-pointer sweep as 3Sum, but track the smallest distance instead of an exact hit.',
  widget: 'array',
  widgetTitle: 'Sorted array',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '-1, 2, 1, -4', wide: true },
    { key: 'target', label: 'Target', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int threeSumClosest(vector<int>& nums, int target) {'),
      L('        sort(nums.begin(), nums.end());', 'sort'),
      L('        int n = nums.size(), best = nums[0]+nums[1]+nums[2];', 'sort'),
      L('        for (int i = 0; i < n - 2; i++) {', 'i'),
      L('            int lo = i + 1, hi = n - 1;'),
      L('            while (lo < hi) {', 'two'),
      L('                int s = nums[i] + nums[lo] + nums[hi];', 'two'),
      L('                if (abs(s - target) < abs(best - target))', 'better'),
      L('                    best = s;', 'better'),
      L('                if (s == target) return s;', 'exact'),
      L('                if (s < target) lo++;', 'low'),
      L('                else hi--;', 'high'),
      L('            }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int threeSumClosest(int[] nums, int target) {'),
      L('        Arrays.sort(nums);', 'sort'),
      L('        int n = nums.length, best = nums[0]+nums[1]+nums[2];', 'sort'),
      L('        for (int i = 0; i < n - 2; i++) {', 'i'),
      L('            int lo = i + 1, hi = n - 1;'),
      L('            while (lo < hi) {', 'two'),
      L('                int s = nums[i] + nums[lo] + nums[hi];', 'two'),
      L('                if (Math.abs(s-target) < Math.abs(best-target))', 'better'),
      L('                    best = s;', 'better'),
      L('                if (s == target) return s;', 'exact'),
      L('                if (s < target) lo++;', 'low'),
      L('                else hi--;', 'high'),
      L('            }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof parsed === 'string') return { error: parsed };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };
    if (parsed.length < 3) return { error: 'Give at least three numbers.' };
    const a = [...parsed].sort((x, y) => x - y);
    const n = a.length;
    const steps: Step[] = [];
    let best = a[0] + a[1] + a[2];
    const st = (mark: ArrayState['mark'], ptrs: ArrayState['ptrs'] = []): ArrayState => ({
      arr: a,
      mark,
      ptrs,
      aggs: [
        { label: 'target', value: String(target), c: 'a' },
        { label: 'closest sum', value: String(best), c: 'c' },
        { label: 'distance', value: String(Math.abs(best - target)), c: 'b' },
      ],
    });
    steps.push({ tag: 'sort', trace: ['Sort, then sweep. Start with the first three as a placeholder best: ', B(best), '.'], state: st({ 0: 'good', 1: 'good', 2: 'good' }) });
    let exact = false;
    outer: for (let i = 0; i < n - 2; i++) {
      let lo = i + 1;
      let hi = n - 1;
      steps.push({ tag: 'i', trace: ['Fix ', A(a[i]), ' and look for the best pair to its right.'], state: st({ [i]: 'active' }, [{ name: 'i', i, c: 'a' }]) });
      while (lo < hi) {
        const s = a[i] + a[lo] + a[hi];
        const ptrs: ArrayState['ptrs'] = [
          { name: 'lo', i: lo, c: 'b' },
          { name: 'hi', i: hi, c: 'c' },
        ];
        if (Math.abs(s - target) < Math.abs(best - target)) {
          best = s;
          steps.push({
            tag: 'better',
            trace: [A(a[i]), ' + ', A(a[lo]), ' + ', A(a[hi]), ' = ', B(s), ', distance ', B(Math.abs(s - target)), ' — closer than anything so far.'],
            state: st({ [i]: 'good', [lo]: 'good', [hi]: 'good' }, ptrs),
          });
        } else {
          steps.push({
            tag: 'two',
            trace: ['Sum ', F(s), ' sits ', F(Math.abs(s - target)), ' away — no better than the current best ', B(best), '.'],
            state: st({ [i]: 'active', [lo]: 'dim', [hi]: 'dim' }, ptrs),
          });
        }
        if (s === target) {
          steps.push({ tag: 'exact', trace: ['Exact hit on ', C(target), ' — distance 0 cannot be beaten, stop early.'], state: st({ [i]: 'final', [lo]: 'final', [hi]: 'final' }, ptrs) });
          exact = true;
          break outer;
        }
        if (s < target) {
          lo++;
        } else {
          hi--;
        }
        if (steps.length > MAX_STEPS) break outer;
      }
    }
    if (!exact) {
      steps.push({ tag: 'ret', trace: ['Closest achievable sum: ', C(best), ' (', C(Math.abs(best - target)), ' from the target).'], state: st({}) });
    }
    return { steps, result: String(best), resultDetail: `distance ${Math.abs(best - target)}` };
  },
  note: 'Moving the pointer on the side that is "wrong" is safe because sorting makes the sum monotonic in each pointer: every pair skipped would have moved the sum further from the target, not closer. Tracking distance instead of equality is the only change from 3Sum.',
  complexity: { time: 'O(n²)', space: 'O(1)' },
  brute: {
    label: 'Three loops',
    technique: 'Add up every triple and keep whichever sum lands nearest the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int threeSumClosest(vector<int>& nums, int target) {'),
        L('        int best = nums[0] + nums[1] + nums[2];', 'init'),
        L('        int n = nums.size();'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++) {', 'k'),
        L('              int sum = nums[i] + nums[j] + nums[k];', 'sum'),
        L('              if (abs(sum - target) < abs(best - target))', 'sum', 'better'),
        L('                best = sum;', 'better'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int threeSumClosest(int[] nums, int target) {'),
        L('        int best = nums[0] + nums[1] + nums[2];', 'init'),
        L('        int n = nums.length;'),
        L('        for (int i = 0; i < n; i++)', 'i'),
        L('          for (int j = i + 1; j < n; j++)', 'j'),
        L('            for (int k = j + 1; k < n; k++) {', 'k'),
        L('              int sum = nums[i] + nums[j] + nums[k];', 'sum'),
        L('              if (Math.abs(sum - target) < Math.abs(best - target))', 'sum', 'better'),
        L('                best = sum;', 'better'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums, { maxLen: 12 });
      if (typeof raw === 'string') return { error: raw };
      if (raw.length < 3) return { error: 'Need at least three numbers.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };

      const a = [...raw].sort((x, y) => x - y);
      const steps: Step[] = [];
      let best = a[0] + a[1] + a[2];
      let bestTriple: [number, number, number] = [0, 1, 2];
      let tested = 0;
      const st = (mark: Record<number, 'active' | 'final' | 'dim'>): ArrayState => ({
        arr: a,
        mark,
        aggs: [
          { label: 'triples tested', value: String(tested), c: 'a' },
          { label: 'closest sum', value: String(best), c: 'b' },
          { label: 'distance', value: String(Math.abs(best - target)), c: 'c' },
        ],
      });

      steps.push({
        tag: 'init',
        trace: ['No shortcuts: add up ', A('every triple'), ' and keep the sum closest to ', C(target), '. Start with ', B(best), '.'],
        state: st({ 0: 'active', 1: 'active', 2: 'active' }),
      });
      outer: for (let i = 0; i < a.length; i++) {
        for (let j = i + 1; j < a.length; j++) {
          for (let k = j + 1; k < a.length; k++) {
            tested++;
            const sum = a[i] + a[j] + a[k];
            const better = Math.abs(sum - target) < Math.abs(best - target);
            if (better) {
              best = sum;
              bestTriple = [i, j, k];
            }
            steps.push({
              tag: better ? 'better' : 'sum',
              trace: [
                `${a[i]} + ${a[j]} + ${a[k]} = `, better ? B(sum) : F(sum),
                ` (distance ${Math.abs(sum - target)})`,
                better ? ' — closer than anything so far.' : ` — the best is still ${best}.`,
              ],
              state: st({ [i]: 'active', [j]: 'active', [k]: 'active' }),
            });
            if (steps.length > MAX_STEPS) break outer;
          }
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['All ', C(tested), ' triples added — the closest sum is ', C(best), '.'],
        state: st({ [bestTriple[0]]: 'final', [bestTriple[1]]: 'final', [bestTriple[2]]: 'final' }),
      });
      return { steps, result: String(best), resultDetail: `distance ${Math.abs(best - target)} — after ${tested} triples` };
    },
    note: 'The innermost loop is the wasteful one. With the array sorted and i fixed, the remaining two numbers form a sorted pair search: if their sum is under the target only a bigger left value can help, and if it is over, only a smaller right one. One converging sweep replaces the whole k-loop, taking this from O(n³) to O(n²).',
    complexity: { time: 'O(n³)', space: 'O(1)' },
  },
};

/* ================= Remove Duplicates from Sorted Array ================= */
const removeDuplicates: ProblemDef = {
  slug: 'remove-duplicates-from-sorted-array',
  title: 'Remove Duplicates from Sorted Array',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
  technique: 'A slow write head trails a fast read head, copying only the first of each run.',
  widget: 'array',
  widgetTitle: 'Sorted array',
  inputs: [{ key: 'nums', label: 'Sorted array', defaultValue: '0, 0, 1, 1, 1, 2, 2, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int removeDuplicates(vector<int>& nums) {'),
      L('        if (nums.empty()) return 0;'),
      L('        int k = 1;', 'init'),
      L('        for (int i = 1; i < nums.size(); i++)', 'loop'),
      L('            if (nums[i] != nums[k - 1])', 'new'),
      L('                nums[k++] = nums[i];', 'write'),
      L('        return k;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int removeDuplicates(int[] nums) {'),
      L('        if (nums.length == 0) return 0;'),
      L('        int k = 1;', 'init'),
      L('        for (int i = 1; i < nums.length; i++)', 'loop'),
      L('            if (nums[i] != nums[k - 1])', 'new'),
      L('                nums[k++] = nums[i];', 'write'),
      L('        return k;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof parsed === 'string') return { error: parsed };
    for (let i = 1; i < parsed.length; i++) if (parsed[i] < parsed[i - 1]) return { error: 'The array must be sorted ascending.' };
    const a = [...parsed];
    const steps: Step[] = [];
    let k = 1;
    const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: [...a],
      window: [0, k - 1],
      mark,
      ptrs: [
        { name: 'k', i: k, c: 'b' },
        ...(i < a.length ? [{ name: 'i', i, c: 'a' as const }] : []),
      ],
      aggs: [{ label: 'unique so far', value: String(k), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['The first element is always kept. ', B('k'), ' marks where the next unique value gets written; everything left of it is the answer.'],
      state: st(1),
    });
    for (let i = 1; i < a.length; i++) {
      if (a[i] !== a[k - 1]) {
        steps.push({
          tag: 'new',
          trace: [A(a[i]), ' differs from the last kept value ', B(a[k - 1]), ' — a new distinct value.'],
          state: st(i, { [i]: 'active', [k - 1]: 'good' }),
        });
        a[k] = a[i];
        k++;
        steps.push({ tag: 'write', trace: ['Write it at index ', B(k - 1), '. The kept prefix now has ', C(k), ' values.'], state: st(i, { [k - 1]: 'good' }) });
      } else {
        steps.push({
          tag: 'loop',
          trace: [F(a[i]), ' repeats the last kept value — skip it. Because the array is sorted, duplicates are always adjacent.'],
          state: st(i, { [i]: 'dim' }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['First ', C(k), ' slots hold the distinct values: [', C(a.slice(0, k).join(', ')), '].'],
      state: { arr: [...a], window: [0, k - 1], mark: Object.fromEntries(a.map((_, i) => [i, i < k ? ('final' as const) : ('dim' as const)])) },
    });
    return { steps, result: String(k), resultDetail: `[${a.slice(0, k).join(', ')}]` };
  },
  note: 'Sorted input is doing the heavy lifting: duplicates can only be adjacent, so comparing against the last kept value is enough — no set, no extra array. The write head can never overtake the read head, which is why the copy is safe in place.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Set + rebuild',
    technique: 'Collect the distinct values in a set, then write them back over the front of the array.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int removeDuplicates(vector<int>& nums) {'),
        L('        set<int> uniq(nums.begin(), nums.end());', 'collect'),
        L('        int k = 0;', 'rewrite'),
        L('        for (int v : uniq)', 'rewrite'),
        L('            nums[k++] = v;', 'write'),
        L('        return k;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int removeDuplicates(int[] nums) {'),
        L('        TreeSet<Integer> uniq = new TreeSet<>();', 'collect'),
        L('        for (int v : nums) uniq.add(v);', 'collect'),
        L('        int k = 0;', 'rewrite'),
        L('        for (int v : uniq)', 'rewrite'),
        L('            nums[k++] = v;', 'write'),
        L('        return k;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums);
      if (typeof raw === 'string') return { error: raw };
      for (let i = 1; i < raw.length; i++)
        if (raw[i] < raw[i - 1]) return { error: 'Array must be sorted in non-decreasing order.' };

      const steps: Step[] = [];
      const uniq: number[] = [];
      const seen = new Set<number>();
      const view = (read: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr: raw,
        ptrs: read < raw.length ? [{ name: 'read', i: read, c: 'a' }] : [],
        aggs: [{ label: 'set', value: `{${uniq.join(', ')}}`, c: 'b' }],
        ...extra,
      });

      steps.push({
        tag: 'collect',
        trace: ['Pour everything into a ', B('set'), ' and let it drop the duplicates for us.'],
        state: view(0),
      });
      for (let i = 0; i < raw.length; i++) {
        const fresh = !seen.has(raw[i]);
        if (fresh) {
          seen.add(raw[i]);
          uniq.push(raw[i]);
        }
        steps.push({
          tag: 'collect',
          trace: fresh
            ? [A(raw[i]), ' is new — the set is now ', B(`{${uniq.join(', ')}}`), '.']
            : [F(raw[i]), ' is already in the set — silently ignored.'],
          state: view(i, { mark: { [i]: fresh ? 'good' : 'dim' } }),
        });
      }
      const out = [...uniq, ...raw.slice(uniq.length).map(() => 0)];
      for (let k = 0; k < uniq.length; k++) {
        steps.push({
          tag: 'write',
          tag2: 'rewrite',
          trace: ['Write ', B(uniq[k]), ' back into slot ', A(k), '.'],
          state: {
            arr: out.map((v, i) => (i < raw.length ? (i <= k ? uniq[Math.min(i, uniq.length - 1)] : raw[i]) : v)),
            mark: Object.fromEntries(raw.map((_, i) => [i, i <= k ? 'good' : 'dim'])),
          } satisfies ArrayState,
        });
      }
      steps.push({
        tag: 'ret',
        trace: ['First ', C(uniq.length), ' slots hold the distinct values: [', C(uniq.join(', ')), '].'],
        state: {
          arr: raw.map((v, i) => (i < uniq.length ? uniq[i] : v)),
          window: [0, uniq.length - 1],
          mark: Object.fromEntries(raw.map((_, i) => [i, i < uniq.length ? 'final' : 'dim'])),
        } satisfies ArrayState,
      });
      return {
        steps,
        result: String(uniq.length),
        resultDetail: `[${uniq.join(', ')}] — but a set of up to ${raw.length} values was allocated to get there`,
      };
    },
    note: 'This works on any array, sorted or not — which is precisely why it is the wrong tool here. It pays O(n) memory and a log factor per insertion to rediscover something the input already guarantees: in a sorted array equal values are adjacent, so a single comparison with the previous kept value is enough.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  },
};

/* ================= Squares of a Sorted Array ================= */
const sortedSquares: ProblemDef = {
  slug: 'squares-of-a-sorted-array',
  title: 'Squares of a Sorted Array',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/squares-of-a-sorted-array/',
  technique: 'The biggest square is at one end or the other — fill the output from the back.',
  widget: 'array',
  widgetTitle: 'Input (sorted, may be negative)',
  inputs: [{ key: 'nums', label: 'Sorted array', defaultValue: '-4, -1, 0, 3, 10', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> sortedSquares(vector<int>& nums) {'),
      L('        int n = nums.size(), lo = 0, hi = n - 1;', 'init'),
      L('        vector<int> res(n);'),
      L('        for (int k = n - 1; k >= 0; k--) {', 'loop'),
      L('            if (abs(nums[lo]) > abs(nums[hi]))', 'cmp'),
      L('                res[k] = nums[lo] * nums[lo++];', 'takeLo'),
      L('            else'),
      L('                res[k] = nums[hi] * nums[hi--];', 'takeHi'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] sortedSquares(int[] nums) {'),
      L('        int n = nums.length, lo = 0, hi = n - 1;', 'init'),
      L('        int[] res = new int[n];'),
      L('        for (int k = n - 1; k >= 0; k--) {', 'loop'),
      L('            if (Math.abs(nums[lo]) > Math.abs(nums[hi]))', 'cmp'),
      L('                res[k] = nums[lo] * nums[lo++];', 'takeLo'),
      L('            else'),
      L('                res[k] = nums[hi] * nums[hi--];', 'takeHi'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) return { error: 'The array must be sorted ascending.' };
    const n = nums.length;
    const res: (number | string)[] = [...Array(n)].map(() => '·');
    const steps: Step[] = [];
    let lo = 0;
    let hi = n - 1;
    const st = (k: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: nums,
      mark,
      ptrs: [
        ...(lo <= hi ? [{ name: 'lo', i: lo, c: 'a' as const }, { name: 'hi', i: hi, c: 'b' as const }] : []),
      ],
      aggs: [{ label: `output (filling slot ${k})`, value: res.join(', '), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Squaring flips the negatives, so the ', A('largest'), ' square always sits at one of the two ends — never in the middle.'],
      state: st(n - 1),
    });
    for (let k = n - 1; k >= 0; k--) {
      if (Math.abs(nums[lo]) > Math.abs(nums[hi])) {
        steps.push({
          tag: 'cmp',
          trace: ['|', A(nums[lo]), '| beats |', F(nums[hi]), '| — the left end has the bigger square.'],
          state: st(k, { [lo]: 'active', [hi]: 'dim' }),
        });
        res[k] = nums[lo] * nums[lo];
        lo++;
        steps.push({ tag: 'takeLo', trace: ['Write ', B(res[k]), ' into slot ', B(k), ' and step ', A('lo'), ' inward.'], state: st(k) });
      } else {
        steps.push({
          tag: 'cmp',
          trace: ['|', A(nums[hi]), '| is at least |', F(nums[lo]), '| — the right end wins.'],
          state: st(k, { [hi]: 'active', [lo]: 'dim' }),
        });
        res[k] = nums[hi] * nums[hi];
        hi--;
        steps.push({ tag: 'takeHi', trace: ['Write ', B(res[k]), ' into slot ', B(k), ' and step ', A('hi'), ' inward.'], state: st(k) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Sorted squares: ', C(`[${res.join(', ')}]`), '.'],
      state: { arr: res, mark: Object.fromEntries(res.map((_, i) => [i, 'final' as const])) },
    });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'Sorting the squares afterwards is O(n log n); recognising that the input is already sorted by value, hence by |value| from the outside in, gets it to O(n). Filling the result backwards is the same trick as merging two sorted lists in place — write where the answer is largest first.',
  complexity: { time: 'O(n)', space: 'O(n) for the output' },
  brute: {
    label: 'Square then sort',
    technique: 'Square every element, then hand the whole array to a sort.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> sortedSquares(vector<int>& nums) {'),
        L('        for (int& x : nums)', 'square'),
        L('            x = x * x;', 'square'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        return nums;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] sortedSquares(int[] nums) {'),
        L('        for (int i = 0; i < nums.length; i++)', 'square'),
        L('            nums[i] = nums[i] * nums[i];', 'square'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        return nums;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = parseIntArray(values.nums);
      if (typeof raw === 'string') return { error: raw };
      for (let i = 1; i < raw.length; i++)
        if (raw[i] < raw[i - 1]) return { error: 'Array must be sorted in non-decreasing order.' };

      const steps: Step[] = [];
      const sq = [...raw];
      steps.push({
        tag: 'square',
        trace: ['Ignore the sortedness entirely — just square everything, then sort the result.'],
        state: { arr: [...sq] } satisfies ArrayState,
      });
      for (let i = 0; i < sq.length; i++) {
        sq[i] = raw[i] * raw[i];
        steps.push({
          tag: 'square',
          trace: [A(raw[i]), '² = ', B(sq[i]), '. Note the order is now broken — negatives squared can outrank positives.'],
          state: {
            arr: sq.map((v, k) => (k <= i ? v : raw[k])),
            mark: { [i]: 'good' },
          } satisfies ArrayState,
        });
      }
      const sorted = [...sq].sort((x, y) => x - y);
      steps.push({
        tag: 'sort',
        trace: ['Now sort the squares: ', F(`[${sq.join(', ')}]`), ' → ', C(`[${sorted.join(', ')}]`), '.'],
        state: { arr: sorted, mark: Object.fromEntries(sorted.map((_, i) => [i, 'good' as const])) } satisfies ArrayState,
      });
      steps.push({
        tag: 'ret',
        trace: ['Done — but that sort cost ', F('O(n log n)'), ', which the input had already paid for once.'],
        state: {
          arr: sorted,
          mark: Object.fromEntries(sorted.map((_, i) => [i, 'final' as const])),
        } satisfies ArrayState,
      });
      return { steps, result: `[${sorted.join(', ')}]`, resultDetail: 'correct, but it re-sorts data that was nearly ordered already' };
    },
    note: 'Squaring destroys the ordering only in the middle: the array is still sorted by absolute value reading inwards from both ends. The sort throws that structure away and rebuilds it from scratch. Merging from the two ends instead keeps it and lands the same answer in O(n).',
    complexity: { time: 'O(n log n)', space: 'O(n) for the output' },
  },
};

/* ================= Valid Palindrome II ================= */
const validPalindromeII: ProblemDef = {
  slug: 'valid-palindrome-ii',
  title: 'Valid Palindrome II',
  category: 'Two Pointers',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/valid-palindrome-ii/',
  technique: 'Walk inward; on the first mismatch, test both ways of deleting one character.',
  widget: 'array',
  widgetTitle: 'Characters',
  inputs: [{ key: 's', label: 'String', defaultValue: 'abca', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool validPalindrome(string s) {'),
      L('        int i = 0, j = s.size() - 1;', 'init'),
      L('        while (i < j) {', 'loop'),
      L('            if (s[i] != s[j])', 'mismatch'),
      L('                return isPal(s, i+1, j) || isPal(s, i, j-1);', 'branch'),
      L('            i++; j--;', 'match'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('    bool isPal(string& s, int i, int j) {', 'check'),
      L('        while (i < j) if (s[i++] != s[j--]) return false;', 'check'),
      L('        return true;', 'check'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean validPalindrome(String s) {'),
      L('        int i = 0, j = s.length() - 1;', 'init'),
      L('        while (i < j) {', 'loop'),
      L('            if (s.charAt(i) != s.charAt(j))', 'mismatch'),
      L('                return isPal(s, i+1, j) || isPal(s, i, j-1);', 'branch'),
      L('            i++; j--;', 'match'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('    boolean isPal(String s, int i, int j) {', 'check'),
      L('        while (i < j)', 'check'),
      L('            if (s.charAt(i++) != s.charAt(j--)) return false;', 'check'),
      L('        return true;', 'check'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,16}$/.test(s)) return { error: 'Use 1–16 lowercase letters.' };
    const ch = s.split('');
    const steps: Step[] = [];
    const st = (i: number, j: number, mark: ArrayState['mark'] = {}, note?: string): ArrayState => ({
      arr: ch,
      mark,
      ptrs: [
        { name: 'i', i, c: 'a' },
        { name: 'j', i: j, c: 'b' },
      ],
      aggs: note ? [{ label: 'checking', value: note, c: 'c' }] : [],
    });
    let i = 0;
    let j = ch.length - 1;
    steps.push({ tag: 'init', trace: ['Two pointers walk inward. A palindrome mirrors, so ', A('s[i]'), ' must equal ', B('s[j]'), ' at every step.'], state: st(i, j) });
    let ok = true;
    let deleted: string | null = null;
    while (i < j) {
      if (ch[i] === ch[j]) {
        steps.push({ tag: 'match', trace: ["'", B(ch[i]), "' matches '", B(ch[j]), "' — step both inward."], state: st(i, j, { [i]: 'good', [j]: 'good' }) });
        i++;
        j--;
      } else {
        steps.push({
          tag: 'mismatch',
          trace: ["'", F(ch[i]), "' ≠ '", F(ch[j]), "'. We are allowed exactly ", A('one'), ' deletion, so one of these two must go.'],
          state: st(i, j, { [i]: 'active', [j]: 'active' }),
        });
        const isPal = (x: number, y: number) => {
          while (x < y) {
            if (ch[x] !== ch[y]) return false;
            x++;
            y--;
          }
          return true;
        };
        const skipLeft = isPal(i + 1, j);
        steps.push({
          tag: 'check',
          trace: ['Try deleting the left one: is "', A(s.slice(i + 1, j + 1)), '" a palindrome? ', skipLeft ? B('yes') : F('no'), '.'],
          state: st(i + 1, j, { [i]: 'dim' }, `drop '${ch[i]}'`),
        });
        const skipRight = isPal(i, j - 1);
        steps.push({
          tag: 'check',
          trace: ['Try deleting the right one: is "', A(s.slice(i, j)), '" a palindrome? ', skipRight ? B('yes') : F('no'), '.'],
          state: st(i, j - 1, { [j]: 'dim' }, `drop '${ch[j]}'`),
        });
        ok = skipLeft || skipRight;
        deleted = skipLeft ? ch[i] : skipRight ? ch[j] : null;
        steps.push({
          tag: 'branch',
          trace: ok ? ['One deletion is enough — removing \'', C(deleted!), "' leaves a palindrome."] : ['Neither deletion works, and we only get one — ', C('not'), ' a near-palindrome.'],
          state: st(i, j, { [i]: ok ? 'final' : 'dim', [j]: ok ? 'final' : 'dim' }),
        });
        break;
      }
    }
    if (ok && deleted === null) {
      steps.push({
        tag: 'ret',
        trace: ['The pointers crossed with no mismatch at all — it is already a palindrome, so zero deletions are needed.'],
        state: { arr: ch, mark: Object.fromEntries(ch.map((_, k) => [k, 'final' as const])) },
      });
    }
    return { steps, result: ok ? 'true' : 'false', resultDetail: deleted ? `by deleting '${deleted}'` : ok ? 'already a palindrome' : undefined };
  },
  note: 'The first mismatch is the only place a deletion can possibly help — everything outside it already mirrors correctly, so deleting there would just create a new mismatch. That reduces "try deleting every character" (O(n²)) to two linear checks after one linear scan.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Delete each',
    technique: 'Remove one character at a time and test whether what is left reads the same backwards.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool validPalindrome(string s) {'),
        L('        if (isPal(s)) return true;', 'whole'),
        L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
        L('            string t = s.substr(0, i) + s.substr(i + 1);', 'build'),
        L('            if (isPal(t)) return true;', 'test', 'yes'),
        L('        }'),
        L('        return false;', 'no'),
        L('    }'),
        L('    bool isPal(const string& t) {'),
        L('        for (int i = 0, j = t.size()-1; i < j; i++, j--)'),
        L('            if (t[i] != t[j]) return false;'),
        L('        return true;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean validPalindrome(String s) {'),
        L('        if (isPal(s)) return true;', 'whole'),
        L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
        L('            String t = s.substring(0, i) + s.substring(i + 1);', 'build'),
        L('            if (isPal(t)) return true;', 'test', 'yes'),
        L('        }'),
        L('        return false;', 'no'),
        L('    }'),
        L('    boolean isPal(String t) {'),
        L('        for (int i = 0, j = t.length()-1; i < j; i++, j--)'),
        L('            if (t.charAt(i) != t.charAt(j)) return false;'),
        L('        return true;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      if (s.length === 0) return { error: 'Enter a non-empty string.' };
      if (s.length > 16) return { error: 'Keep it to at most 16 characters so the steps stay readable.' };

      const ch = s.split('');
      const isPal = (t: string) => {
        for (let i = 0, j = t.length - 1; i < j; i++, j--) if (t[i] !== t[j]) return false;
        return true;
      };
      const steps: Step[] = [];
      const st = (mark: Record<number, 'active' | 'good' | 'final' | 'dim'>, note: string): ArrayState => ({
        arr: ch,
        mark,
        aggs: [{ label: 'testing', value: note, c: 'a' }],
      });

      const wholeOk = isPal(s);
      steps.push({
        tag: 'whole',
        trace: ['First, is "', A(s), '" already a palindrome? ', wholeOk ? B('yes') : F('no'), '.'],
        state: st({}, s),
      });
      let ok = wholeOk;
      let deleted: string | null = null;
      if (!wholeOk) {
        for (let i = 0; i < ch.length; i++) {
          const t = s.slice(0, i) + s.slice(i + 1);
          const good = isPal(t);
          steps.push({
            tag: good ? 'yes' : 'test',
            tag2: 'build',
            trace: [
              "Delete '", A(ch[i]), "' at index ", A(i), ' → "', good ? B(t) : F(t), '" — ',
              good ? B('a palindrome!') : F('still not a palindrome'), '.',
            ],
            state: st({ [i]: good ? 'final' : 'dim' }, t),
          });
          if (good) {
            ok = true;
            deleted = ch[i];
            break;
          }
        }
      }
      if (!ok) {
        steps.push({
          tag: 'no',
          trace: ['Every single deletion was tried and none worked — ', C('not'), ' a near-palindrome.'],
          state: st(Object.fromEntries(ch.map((_, i) => [i, 'dim' as const])), 'exhausted'),
        });
      }
      return {
        steps,
        result: ok ? 'true' : 'false',
        resultDetail: deleted ? `by deleting '${deleted}'` : ok ? 'already a palindrome' : undefined,
      };
    },
    note: 'n deletions, each verified by a full O(n) palindrome scan — O(n²) to answer a question one pass can settle. The waste is testing deletions in places that already match: only the first mismatching pair is a candidate, so there are exactly two strings worth checking, not n.',
    complexity: { time: 'O(n²)', space: 'O(n) per candidate string' },
  },
};

export const pointers3: ProblemDef[] = [fourSum, threeSumClosest, removeDuplicates, sortedSquares, validPalindromeII];
