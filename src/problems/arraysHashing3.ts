// Arrays & Hashing, part 3 — Striver SDE / Love Babbar sheet staples.
import type { ArrayState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ================= Next Permutation ================= */
const nextPermutation: ProblemDef = {
  slug: 'next-permutation',
  title: 'Next Permutation',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/next-permutation/',
  technique: 'Find the rightmost rising step, swap it with its smallest bigger successor, then sort the tail.',
  widget: 'array',
  widgetTitle: 'Permutation',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 3, 5, 4, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void nextPermutation(vector<int>& nums) {'),
      L('        int n = nums.size(), i = n - 2;'),
      L('        while (i >= 0 && nums[i] >= nums[i + 1])', 'pivot'),
      L('            i--;', 'pivot'),
      L('        if (i >= 0) {', 'found'),
      L('            int j = n - 1;'),
      L('            while (nums[j] <= nums[i]) j--;', 'succ'),
      L('            swap(nums[i], nums[j]);', 'swap'),
      L('        }'),
      L('        reverse(nums.begin() + i + 1, nums.end());', 'rev'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void nextPermutation(int[] nums) {'),
      L('        int n = nums.length, i = n - 2;'),
      L('        while (i >= 0 && nums[i] >= nums[i + 1])', 'pivot'),
      L('            i--;', 'pivot'),
      L('        if (i >= 0) {', 'found'),
      L('            int j = n - 1;'),
      L('            while (nums[j] <= nums[i]) j--;', 'succ'),
      L('            int t = nums[i]; nums[i] = nums[j]; nums[j] = t;', 'swap'),
      L('        }'),
      L('        reverse(nums, i + 1, n - 1);', 'rev'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof nums === 'string') return { error: nums };
    const a = [...nums];
    const n = a.length;
    const steps: Step[] = [];
    const st = (marks: ArrayState['mark'], ptrs: ArrayState['ptrs'], win?: [number, number] | null): ArrayState => ({
      arr: [...a],
      mark: marks,
      ptrs,
      window: win ?? null,
    });

    let i = n - 2;
    steps.push({
      tag: 'pivot',
      trace: ['Scan from the right for the first index where the value ', A('rises'), ' — everything after it is already the largest arrangement possible.'],
      state: st({}, []),
    });
    while (i >= 0 && a[i] >= a[i + 1]) {
      steps.push({
        tag: 'pivot',
        trace: [A(a[i]), ' ≥ ', A(a[i + 1]), ' — still descending, so index ', F(i), ' cannot be the pivot. Step left.'],
        state: st({ [i]: 'dim', [i + 1]: 'dim' }, [{ name: 'i', i, c: 'a' }]),
      });
      i--;
    }

    if (i >= 0) {
      steps.push({
        tag: 'found',
        trace: ['Pivot found at index ', B(i), ': ', B(a[i]), ' < ', B(a[i + 1]), '. The suffix to its right is fully descending.'],
        state: st({ [i]: 'good' }, [{ name: 'pivot', i, c: 'b' }], [i + 1, n - 1]),
      });
      let j = n - 1;
      while (a[j] <= a[i]) {
        steps.push({
          tag: 'succ',
          trace: [F(a[j]), ' is not bigger than the pivot ', B(a[i]), ' — keep walking left.'],
          state: st({ [i]: 'good', [j]: 'dim' }, [{ name: 'j', i: j, c: 'a' }], [i + 1, n - 1]),
        });
        j--;
      }
      steps.push({
        tag: 'succ',
        trace: ['Because the suffix descends, ', A(a[j]), ' is the ', A('smallest'), ' value in it that still beats the pivot ', B(a[i]), '.'],
        state: st({ [i]: 'good', [j]: 'active' }, [{ name: 'j', i: j, c: 'a' }], [i + 1, n - 1]),
      });
      [a[i], a[j]] = [a[j], a[i]];
      steps.push({
        tag: 'swap',
        trace: ['Swap them — the prefix is now the next one up, by the smallest possible margin.'],
        state: st({ [i]: 'good', [j]: 'good' }, [], [i + 1, n - 1]),
      });
    } else {
      steps.push({
        tag: 'found',
        trace: ['No rising step anywhere — the array is the ', F('last'), ' permutation. Reversing gives the first one.'],
        state: st({}, []),
      });
    }

    const before = a.slice(i + 1).join(', ');
    const tail = a.slice(i + 1).reverse();
    for (let k = 0; k < tail.length; k++) a[i + 1 + k] = tail[k];
    steps.push({
      tag: 'rev',
      trace: ['The tail [', F(before), '] is descending, so reversing it makes it ', B('ascending'), ' — the smallest tail, which is exactly what "next" needs.'],
      state: st(Object.fromEntries([...Array(n - i - 1)].map((_, k) => [i + 1 + k, 'good'])), [], i + 1 <= n - 1 ? [i + 1, n - 1] : null),
    });
    steps.push({
      tag: 'rev',
      trace: ['Next permutation: ', C(`[${a.join(', ')}]`), '.'],
      state: st(Object.fromEntries(a.map((_, k) => [k, 'final'])), []),
    });
    return { steps, result: `[${a.join(', ')}]` };
  },
  note: 'Permutations in lexicographic order only change at the rightmost place they can. The pivot is that place; swapping in the smallest bigger successor bumps it minimally, and reversing the (already descending) tail resets it to its smallest arrangement. One pass each way — O(n) with no extra memory.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Brute force',
    technique: 'Generate every permutation, keep them sorted, and pick the first one larger than the input.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    set<vector<int>> perms;'),
        L('    void gen(vector<int>& a, int i) {'),
        L('        if (i == a.size()) { perms.insert(a); return; }', 'init'),
        L('        for (int j = i; j < a.size(); j++) {'),
        L('            swap(a[i], a[j]); gen(a, i + 1); swap(a[i], a[j]);', 'init'),
        L('        }'),
        L('    }'),
        L('public:'),
        L('    void nextPermutation(vector<int>& nums) {'),
        L('        vector<int> a = nums;', 'init'),
        L('        gen(a, 0);', 'init'),
        L('        auto it = perms.upper_bound(nums);', 'scan', 'found'),
        L('        nums = (it == perms.end()) ? *perms.begin() : *it;', 'found', 'wrap'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    TreeSet<List<Integer>> perms = new TreeSet<>(Solution::cmp);'),
        L('    void gen(int[] a, int i) {'),
        L('        if (i == a.length) { perms.add(toList(a)); return; }', 'init'),
        L('        for (int j = i; j < a.length; j++) {'),
        L('            swap(a, i, j); gen(a, i + 1); swap(a, i, j);', 'init'),
        L('        }'),
        L('    }'),
        L('    public void nextPermutation(int[] nums) {'),
        L('        gen(nums.clone(), 0);', 'init'),
        L('        List<Integer> next = perms.higher(toList(nums));', 'scan', 'found'),
        L('        if (next == null) next = perms.first();', 'wrap'),
        L('        for (int i = 0; i < nums.length; i++) nums[i] = next.get(i);', 'found', 'wrap'),
        L('    }'),
        L('    // cmp: lexicographic compare; toList / swap: small helpers'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 7 });
      if (typeof nums === 'string') return { error: nums };
      const n = nums.length;
      const cmp = (x: number[], y: number[]) => {
        for (let k = 0; k < n; k++) if (x[k] !== y[k]) return x[k] - y[k];
        return 0;
      };
      const seen = new Set<string>();
      const perms: number[][] = [];
      const gen = (a: number[], i: number) => {
        if (i === n) {
          const key = a.join(',');
          if (!seen.has(key)) {
            seen.add(key);
            perms.push([...a]);
          }
          return;
        }
        for (let j = i; j < n; j++) {
          [a[i], a[j]] = [a[j], a[i]];
          gen(a, i + 1);
          [a[i], a[j]] = [a[j], a[i]];
        }
      };
      gen([...nums], 0);
      perms.sort(cmp);

      const steps: Step[] = [];
      const st = (arr: number[], mark: ArrayState['mark'], idx: number): ArrayState => ({
        arr,
        mark,
        aggs: [
          { label: 'permutation', value: `#${idx + 1} of ${perms.length}`, c: 'a' },
          { label: 'input', value: `[${nums.join(', ')}]`, c: 'b' },
        ],
      });
      steps.push({
        tag: 'init',
        trace: ['Generate all ', A(perms.length), ' distinct permutations and sort them in dictionary order.'],
        state: st(perms[0], {}, 0),
      });
      let idx = 0;
      const SHOW = 12;
      while (idx < perms.length && cmp(perms[idx], nums) <= 0) {
        if (idx < SHOW || cmp(perms[idx], nums) === 0) {
          const same = cmp(perms[idx], nums) === 0;
          steps.push({
            tag: 'scan',
            trace: same
              ? ['Permutation #', A(idx + 1), ' is the input itself — the answer is the one right after it.']
              : ['Permutation #', A(idx + 1), ' ', F(`[${perms[idx].join(', ')}]`), ' is not larger than the input — skip.'],
            state: st(perms[idx], Object.fromEntries(perms[idx].map((_, k) => [k, same ? 'good' : 'dim'])), idx),
          });
        } else if (idx === SHOW) {
          steps.push({
            tag: 'scan',
            trace: ['… skipping ahead through the smaller permutations …'],
            state: st(perms[idx], {}, idx),
          });
        }
        idx++;
      }
      let res: number[];
      if (idx < perms.length) {
        res = perms[idx];
        steps.push({
          tag: 'found',
          trace: ['Permutation #', A(idx + 1), ' is the first one larger than the input: ', C(`[${res.join(', ')}]`), '.'],
          state: st(res, Object.fromEntries(res.map((_, k) => [k, 'final'])), idx),
        });
      } else {
        res = perms[0];
        steps.push({
          tag: 'wrap',
          trace: ['The input is the largest permutation — wrap around to the smallest: ', C(`[${res.join(', ')}]`), '.'],
          state: st(res, Object.fromEntries(res.map((_, k) => [k, 'final'])), 0),
        });
      }
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${perms.length} permutations generated` };
    },
    note: 'Correct by definition, but there are n! permutations — already 3.6 million for n = 10. The pivot-swap-reverse method jumps straight to the answer in O(n).',
    complexity: { time: 'O(n! · n)', space: 'O(n! · n)' },
  },
};

/* ================= Pascal's Triangle ================= */
const pascalsTriangle: ProblemDef = {
  slug: 'pascals-triangle',
  title: "Pascal's Triangle",
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/pascals-triangle/',
  technique: 'Each entry is the sum of the two directly above it — build row by row.',
  widget: 'matrix',
  widgetTitle: 'Triangle rows',
  inputs: [{ key: 'n', label: 'Number of rows', defaultValue: '6' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> generate(int numRows) {'),
      L('        vector<vector<int>> tri;'),
      L('        for (int i = 0; i < numRows; i++) {', 'row'),
      L('            vector<int> row(i + 1, 1);', 'ones'),
      L('            for (int j = 1; j < i; j++)', 'inner'),
      L('                row[j] = tri[i-1][j-1] + tri[i-1][j];', 'sum'),
      L('            tri.push_back(row);', 'push'),
      L('        }'),
      L('        return tri;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> generate(int numRows) {'),
      L('        List<List<Integer>> tri = new ArrayList<>();'),
      L('        for (int i = 0; i < numRows; i++) {', 'row'),
      L('            Integer[] row = new Integer[i + 1];'),
      L('            Arrays.fill(row, 1);', 'ones'),
      L('            for (int j = 1; j < i; j++)', 'inner'),
      L('                row[j] = tri.get(i-1).get(j-1) + tri.get(i-1).get(j);', 'sum'),
      L('            tri.add(Arrays.asList(row));', 'push'),
      L('        }'),
      L('        return tri;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'Number of rows', { min: 1, max: 9 });
    if (typeof n === 'string') return { error: n };
    const tri: number[][] = [];
    const steps: Step[] = [];
    const view = (mark: Record<string, 'active' | 'good' | 'final' | 'src'> = {}): MatrixState => ({
      grid: [...Array(n)].map((_, r) => [...Array(n)].map((_, c) => (tri[r] && c < tri[r].length ? tri[r][c] : ''))),
      rowLabels: [...Array(n)].map((_, i) => `row ${i}`),
      mark,
    });

    for (let i = 0; i < n; i++) {
      const row = [...Array(i + 1)].map(() => 1);
      tri.push(row);
      steps.push({
        tag: 'ones',
        trace: ['Row ', A(i), ' has ', A(i + 1), ' entries. Both ends are always ', B(1), ' — there is only one way to pick none or all.'],
        state: view({ [`${i},0`]: 'good', [`${i},${i}`]: 'good' }),
      });
      for (let j = 1; j < i; j++) {
        row[j] = tri[i - 1][j - 1] + tri[i - 1][j];
        steps.push({
          tag: 'sum',
          trace: ['Add the two above: ', A(tri[i - 1][j - 1]), ' + ', A(tri[i - 1][j]), ' = ', B(row[j]), '.'],
          state: view({ [`${i},${j}`]: 'active', [`${i - 1},${j - 1}`]: 'src', [`${i - 1},${j}`]: 'src' }),
        });
      }
      steps.push({
        tag: 'push',
        trace: ['Row ', B(i), ' complete: [', B(row.join(', ')), '].'],
        state: view(Object.fromEntries(row.map((_, c) => [`${i},${c}`, 'good' as const]))),
      });
    }
    steps.push({
      tag: 'ret',
      trace: [C(n), ' rows built — every entry is a binomial coefficient C(row, col).'],
      state: view(Object.fromEntries(tri.flatMap((r, ri) => r.map((_, ci) => [`${ri},${ci}`, 'final' as const])))),
    });
    return { steps, result: `${n} rows`, resultDetail: `last row [${tri[n - 1].join(', ')}]` };
  },
  note: 'The recurrence C(n,k) = C(n−1,k−1) + C(n−1,k) is just a choice: either the new element is in your subset or it is not. Because each row only reads the row above it, the whole triangle costs O(n²) — the same as its own size, so it is optimal.',
  complexity: { time: 'O(n²)', space: 'O(n²)' },
  brute: {
    label: 'Binomial formula',
    technique: 'Compute each entry directly as C(row, col), updating it along the row with one multiply and one divide.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> generate(int numRows) {'),
        L('        vector<vector<int>> tri;'),
        L('        for (int r = 0; r < numRows; r++) {', 'row'),
        L('            vector<int> row;', 'row'),
        L('            long long val = 1;', 'row'),
        L('            for (int c = 0; c <= r; c++) {', 'entry'),
        L('                row.push_back(val);', 'entry'),
        L('                val = val * (r - c) / (c + 1);', 'entry'),
        L('            }'),
        L('            tri.push_back(row);', 'push'),
        L('        }'),
        L('        return tri;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> generate(int numRows) {'),
        L('        List<List<Integer>> tri = new ArrayList<>();'),
        L('        for (int r = 0; r < numRows; r++) {', 'row'),
        L('            List<Integer> row = new ArrayList<>();', 'row'),
        L('            long val = 1;', 'row'),
        L('            for (int c = 0; c <= r; c++) {', 'entry'),
        L('                row.add((int) val);', 'entry'),
        L('                val = val * (r - c) / (c + 1);', 'entry'),
        L('            }'),
        L('            tri.add(row);', 'push'),
        L('        }'),
        L('        return tri;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'Number of rows', { min: 1, max: 9 });
      if (typeof n === 'string') return { error: n };
      const tri: number[][] = [];
      const steps: Step[] = [];
      const view = (mark: Record<string, 'active' | 'good' | 'final' | 'src'> = {}): MatrixState => ({
        grid: [...Array(n)].map((_, r) => [...Array(n)].map((_, c) => (tri[r] && c < tri[r].length ? tri[r][c] : ''))),
        rowLabels: [...Array(n)].map((_, i) => `row ${i}`),
        mark,
      });

      for (let r = 0; r < n; r++) {
        const row: number[] = [];
        tri.push(row);
        steps.push({
          tag: 'row',
          trace: ['Row ', A(r), ': start with ', B('C(r, 0) = 1'), ' and walk right using C(r, c+1) = C(r, c) × (r − c) / (c + 1).'],
          state: view(),
        });
        let val = 1;
        for (let c = 0; c <= r; c++) {
          row.push(val);
          steps.push({
            tag: 'entry',
            trace: ['C(', A(r), ', ', A(c), ') = ', B(val), c < r ? ['; next = ', val, ' × ', r - c, ' / ', c + 1, ' = ', (val * (r - c)) / (c + 1), '.'].join('') : '.'],
            state: view({ [`${r},${c}`]: 'active' }),
          });
          val = (val * (r - c)) / (c + 1);
        }
        steps.push({
          tag: 'push',
          trace: ['Row ', B(r), ' complete: [', B(row.join(', ')), '] — no row above was read.'],
          state: view(Object.fromEntries(row.map((_, c) => [`${r},${c}`, 'good' as const]))),
        });
      }
      steps.push({
        tag: 'ret',
        trace: [C(n), ' rows built straight from the binomial formula.'],
        state: view(Object.fromEntries(tri.flatMap((row, ri) => row.map((_, ci) => [`${ri},${ci}`, 'final' as const])))),
      });
      return { steps, result: `${n} rows`, resultDetail: `last row [${tri[n - 1].join(', ')}]` };
    },
    note: 'Each row can be built on its own from the binomial coefficient, which is handy when you need only row k. For the full triangle both methods are O(n²); the sum-of-two-above version avoids multiplication and division entirely.',
    complexity: { time: 'O(n²)', space: 'O(n²)' },
  },
};

/* ================= Majority Element II ================= */
const majorityII: ProblemDef = {
  slug: 'majority-element-ii',
  title: 'Majority Element II',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/majority-element-ii/',
  technique: 'Boyer–Moore with two slots: at most two values can each exceed n/3.',
  widget: 'array',
  widgetTitle: 'Array & two candidates',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '1, 1, 1, 3, 3, 2, 2, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> majorityElement(vector<int>& nums) {'),
      L('        int c1 = 0, c2 = 0, n1 = INT_MIN, n2 = INT_MIN;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (x == n1) c1++;', 'hit'),
      L('            else if (x == n2) c2++;', 'hit'),
      L('            else if (c1 == 0) { n1 = x; c1 = 1; }', 'claim'),
      L('            else if (c2 == 0) { n2 = x; c2 = 1; }', 'claim'),
      L('            else { c1--; c2--; }', 'cancel'),
      L('        }'),
      L('        int f1 = 0, f2 = 0;'),
      L('        for (int x : nums) { f1 += x == n1; f2 += x == n2; }', 'verify'),
      L('        vector<int> res;'),
      L('        if (f1 > nums.size() / 3) res.push_back(n1);', 'ret'),
      L('        if (f2 > nums.size() / 3) res.push_back(n2);', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> majorityElement(int[] nums) {'),
      L('        int c1 = 0, c2 = 0, n1 = Integer.MIN_VALUE, n2 = Integer.MIN_VALUE;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            if (x == n1) c1++;', 'hit'),
      L('            else if (x == n2) c2++;', 'hit'),
      L('            else if (c1 == 0) { n1 = x; c1 = 1; }', 'claim'),
      L('            else if (c2 == 0) { n2 = x; c2 = 1; }', 'claim'),
      L('            else { c1--; c2--; }', 'cancel'),
      L('        }'),
      L('        int f1 = 0, f2 = 0;'),
      L('        for (int x : nums) { if (x == n1) f1++; if (x == n2) f2++; }', 'verify'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        if (f1 > nums.length / 3) res.add(n1);', 'ret'),
      L('        if (f2 > nums.length / 3) res.add(n2);', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 16 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    let c1 = 0;
    let c2 = 0;
    let n1: number | null = null;
    let n2: number | null = null;
    const st = (i: number): ArrayState => ({
      arr: nums,
      ptrs: i < nums.length ? [{ name: 'x', i, c: 'a' }] : [],
      mark: i < nums.length ? { [i]: 'active' } : {},
      aggs: [
        { label: 'cand 1', value: n1 === null ? '—' : `${n1} ×${c1}`, c: 'b' },
        { label: 'cand 2', value: n2 === null ? '—' : `${n2} ×${c2}`, c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['At most ', A('two'), ' values can each appear more than n/3 times, so two candidate slots are enough.'],
      state: st(nums.length),
    });
    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      if (n1 !== null && x === n1) {
        c1++;
        steps.push({ tag: 'hit', trace: [A(x), ' matches candidate 1 — its count rises to ', B(c1), '.'], state: st(i) });
      } else if (n2 !== null && x === n2) {
        c2++;
        steps.push({ tag: 'hit', trace: [A(x), ' matches candidate 2 — its count rises to ', B(c2), '.'], state: st(i) });
      } else if (c1 === 0) {
        n1 = x;
        c1 = 1;
        steps.push({ tag: 'claim', trace: ['Slot 1 is empty — ', B(x), ' claims it with count 1.'], state: st(i) });
      } else if (c2 === 0) {
        n2 = x;
        c2 = 1;
        steps.push({ tag: 'claim', trace: ['Slot 2 is empty — ', B(x), ' claims it with count 1.'], state: st(i) });
      } else {
        c1--;
        c2--;
        steps.push({
          tag: 'cancel',
          trace: [F(x), ' matches neither candidate, so it cancels one vote from each: ', A(c1), ' and ', A(c2), '.'],
          state: st(i),
        });
      }
    }
    const cands = [...new Set([n1, n2].filter((v): v is number => v !== null))];
    const res: number[] = [];
    for (const cand of cands) {
      const f = nums.filter((v) => v === cand).length;
      const ok = f > Math.floor(nums.length / 3);
      if (ok) res.push(cand);
      steps.push({
        tag: 'verify',
        trace: ['Counting pass: ', A(cand), ' appears ', A(f), ' times; the bar is more than ', A(Math.floor(nums.length / 3)), ' — ', ok ? B('it qualifies') : F('it does not'), '.'],
        state: {
          arr: nums,
          mark: Object.fromEntries(nums.map((v, i) => [i, v === cand ? ('good' as const) : ('dim' as const)])),
          aggs: [{ label: 'count', value: String(f), c: ok ? 'b' : 'a' }],
        },
      });
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Majority elements: ', C(res.join(', ')), '.'] : ['No value clears the n/3 bar — the answer is ', C('empty'), '.'],
      state: {
        arr: nums,
        mark: Object.fromEntries(nums.map((v, i) => [i, res.includes(v) ? ('final' as const) : ('dim' as const)])),
      },
    });
    return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
  },
  note: 'Cancelling one vote from each candidate discards three distinct values at a time. Any value appearing more than n/3 times cannot be fully cancelled that way, so it must survive in a slot — but surviving is not proof of majority, which is exactly why the second counting pass is mandatory.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash map count',
    technique: 'Count every value in a hash map, then keep those whose count exceeds n / 3.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> majorityElement(vector<int>& nums) {'),
        L('        unordered_map<int, int> count;', 'init'),
        L('        for (int x : nums) count[x]++;', 'tally'),
        L('        vector<int> res;'),
        L('        for (auto& [v, c] : count)', 'check'),
        L('            if (c > nums.size() / 3) res.push_back(v);', 'check'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> majorityElement(int[] nums) {'),
        L('        Map<Integer, Integer> count = new HashMap<>();', 'init'),
        L('        for (int x : nums) count.merge(x, 1, Integer::sum);', 'tally'),
        L('        List<Integer> res = new ArrayList<>();'),
        L('        for (var e : count.entrySet())', 'check'),
        L('            if (e.getValue() > nums.length / 3) res.add(e.getKey());', 'check'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 16 });
      if (typeof nums === 'string') return { error: nums };
      const steps: Step[] = [];
      const count = new Map<number, number>();
      const bar = Math.floor(nums.length / 3);
      const fmt = () => (count.size ? `{ ${[...count.entries()].map(([v, c]) => `${v}→${c}`).join(', ')} }` : '{}');
      const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: nums,
        ptrs: i < nums.length ? [{ name: 'x', i, c: 'a' }] : [],
        mark,
        aggs: [
          { label: 'count', value: fmt(), c: 'b' },
          { label: 'need >', value: String(bar), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Tally every value; afterwards keep any value seen more than ', C(`n/3 = ${bar}`), ' times.'], state: st(nums.length) });
      for (let i = 0; i < nums.length; i++) {
        count.set(nums[i], (count.get(nums[i]) ?? 0) + 1);
        steps.push({ tag: 'tally', trace: ['Seen ', A(nums[i]), ' — count ', A(count.get(nums[i])!), '.'], state: st(i, { [i]: 'active' }) });
      }
      const res: number[] = [];
      for (const [v, c] of count) {
        const ok = c > bar;
        if (ok) res.push(v);
        steps.push({
          tag: 'check',
          trace: [A(v), ' appears ', A(c), ' times — ', ok ? B('more than n/3, keep it') : F('not enough'), '.'],
          state: st(nums.length, Object.fromEntries(nums.map((x, i) => [i, x === v ? (ok ? 'good' : 'dim') : undefined]).filter((e) => e[1]))),
        });
      }
      steps.push({
        tag: 'ret',
        trace: res.length ? ['Majority elements: ', C(res.join(', ')), '.'] : ['No value clears the n/3 bar — the answer is ', C('empty'), '.'],
        state: { arr: nums, mark: Object.fromEntries(nums.map((v, i) => [i, res.includes(v) ? ('final' as const) : ('dim' as const)])) },
      });
      return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
    },
    note: 'Counting is simple and O(n) time, but the map can hold up to n entries. Extended Boyer–Moore uses the fact that at most two values can pass n/3 to get away with four variables.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= Merge Sorted Array ================= */
const mergeSortedArray: ProblemDef = {
  slug: 'merge-sorted-array',
  title: 'Merge Sorted Array',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/merge-sorted-array/',
  technique: 'Fill from the back — the tail slots are free, so nothing gets overwritten.',
  widget: 'array',
  widgetTitle: 'nums1 (with trailing space)',
  inputs: [
    { key: 'a', label: 'nums1 (m real values)', defaultValue: '1, 2, 3', wide: true },
    { key: 'b', label: 'nums2', defaultValue: '2, 5, 6', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void merge(vector<int>& a, int m, vector<int>& b, int n) {'),
      L('        int i = m - 1, j = n - 1, k = m + n - 1;', 'init'),
      L('        while (j >= 0) {', 'loop'),
      L('            if (i >= 0 && a[i] > b[j])', 'cmp'),
      L('                a[k--] = a[i--];', 'takeA'),
      L('            else'),
      L('                a[k--] = b[j--];', 'takeB'),
      L('        }'),
      L('    }', 'ret'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void merge(int[] a, int m, int[] b, int n) {'),
      L('        int i = m - 1, j = n - 1, k = m + n - 1;', 'init'),
      L('        while (j >= 0) {', 'loop'),
      L('            if (i >= 0 && a[i] > b[j])', 'cmp'),
      L('                a[k--] = a[i--];', 'takeA'),
      L('            else'),
      L('                a[k--] = b[j--];', 'takeB'),
      L('        }'),
      L('    }', 'ret'),
      L('}'),
    ],
  },
  run(values) {
    const av = parseIntArray(values.a, { maxLen: 8 });
    if (typeof av === 'string') return { error: av };
    const bv = parseIntArray(values.b, { maxLen: 8 });
    if (typeof bv === 'string') return { error: bv };
    for (let i = 1; i < av.length; i++) if (av[i] < av[i - 1]) return { error: 'nums1 must be sorted ascending.' };
    for (let i = 1; i < bv.length; i++) if (bv[i] < bv[i - 1]) return { error: 'nums2 must be sorted ascending.' };

    const m = av.length;
    const n = bv.length;
    const a: (number | string)[] = [...av, ...[...Array(n)].map(() => '·')];
    const steps: Step[] = [];
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;
    const st = (mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: [...a],
      mark,
      ptrs: [
        ...(i >= 0 ? [{ name: 'i', i, c: 'a' as const }] : []),
        ...(k >= 0 ? [{ name: 'k', i: k, c: 'c' as const }] : []),
      ],
      aggs: [{ label: 'nums2 left', value: j >= 0 ? bv.slice(0, j + 1).join(', ') : '— empty —', c: 'b' }],
    });
    steps.push({
      tag: 'init',
      trace: ['nums1 has ', A(n), ' empty slots at the end. Writing ', B('backwards'), ' into them can never clobber a value we still need.'],
      state: st(),
    });
    while (j >= 0) {
      if (i >= 0 && (av[i] as number) > bv[j]) {
        steps.push({
          tag: 'cmp',
          trace: [A(av[i]), ' from nums1 beats ', F(bv[j]), ' from nums2 — it is the larger, so it takes slot ', C(k), '.'],
          state: st({ [i]: 'active', [k]: 'win' }),
        });
        a[k] = av[i];
        i--;
        k--;
        steps.push({ tag: 'takeA', trace: ['Placed. Both ', A('i'), ' and ', C('k'), ' step left.'], state: st({ [k + 1]: 'good' }) });
      } else {
        steps.push({
          tag: 'cmp',
          trace: [A(bv[j]), ' from nums2 wins', i >= 0 ? [' over ', F(av[i])].join('') : ' (nums1 is exhausted)', ' — it takes slot ', C(k), '.'],
          state: st({ ...(i >= 0 ? { [i]: 'dim' as const } : {}), [k]: 'win' }),
        });
        a[k] = bv[j];
        j--;
        k--;
        steps.push({ tag: 'takeB', trace: ['Placed. ', C('k'), ' steps left; nums2 shrinks.'], state: st({ [k + 1]: 'good' }) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['nums2 is drained. Anything still sitting in nums1 is already in the right place — merged: ', C(`[${a.join(', ')}]`), '.'],
      state: { arr: [...a], mark: Object.fromEntries(a.map((_, x) => [x, 'final' as const])) },
    });
    return { steps, result: `[${a.join(', ')}]` };
  },
  note: 'Merging forward would need a temporary copy, because writing to index 0 destroys a value nums1 has not read yet. Going backwards inverts that: the write head is always at or ahead of both read heads, so O(1) extra space is enough.',
  complexity: { time: 'O(m + n)', space: 'O(1)' },
  brute: {
    label: 'Append & sort',
    technique: 'Copy nums2 into the empty tail of nums1, then sort the whole array.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void merge(vector<int>& a, int m, vector<int>& b, int n) {'),
        L('        for (int j = 0; j < n; j++)', 'copy'),
        L('            a[m + j] = b[j];', 'copy'),
        L('        sort(a.begin(), a.end());', 'sort'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void merge(int[] a, int m, int[] b, int n) {'),
        L('        for (int j = 0; j < n; j++)', 'copy'),
        L('            a[m + j] = b[j];', 'copy'),
        L('        Arrays.sort(a);', 'sort'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const av = parseIntArray(values.a, { maxLen: 8 });
      if (typeof av === 'string') return { error: av };
      const bv = parseIntArray(values.b, { maxLen: 8 });
      if (typeof bv === 'string') return { error: bv };
      for (let i = 1; i < av.length; i++) if (av[i] < av[i - 1]) return { error: 'nums1 must be sorted ascending.' };
      for (let i = 1; i < bv.length; i++) if (bv[i] < bv[i - 1]) return { error: 'nums2 must be sorted ascending.' };

      const m = av.length;
      const a: (number | string)[] = [...av, ...bv.map(() => '·')];
      const steps: Step[] = [];
      steps.push({
        tag: 'copy',
        trace: ['Ignore the fact that both inputs are sorted: just drop nums2 into the ', A(bv.length), ' empty slots.'],
        state: { arr: [...a] },
      });
      bv.forEach((v, j) => {
        a[m + j] = v;
        steps.push({
          tag: 'copy',
          trace: ['Copy ', A(v), ' into slot ', A(m + j), '.'],
          state: { arr: [...a], mark: { [m + j]: 'active' } },
        });
      });
      const sorted = (a as number[]).slice().sort((x, y) => x - y);
      steps.push({
        tag: 'sort',
        trace: ['Sort the combined array: ', C(`[${sorted.join(', ')}]`), '.'],
        state: { arr: sorted, mark: Object.fromEntries(sorted.map((_, x) => [x, 'final' as const])) },
      });
      return { steps, result: `[${sorted.join(', ')}]` };
    },
    note: 'Two lines and hard to get wrong, but the sort costs O((m + n) log(m + n)) and throws away the fact that both halves are already sorted. Merging from the back uses that order to finish in one linear pass.',
    complexity: { time: 'O((m + n) log(m + n))', space: 'O(1)' },
  },
};

/* ================= Find the Duplicate Number ================= */
const findDuplicate: ProblemDef = {
  slug: 'find-the-duplicate-number',
  title: 'Find the Duplicate Number',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-duplicate-number/',
  technique: "Treat i → nums[i] as a linked list; the duplicate is the cycle's entry point (Floyd).",
  widget: 'array',
  widgetTitle: 'Array as a jump table',
  inputs: [{ key: 'nums', label: 'n+1 values from 1..n', defaultValue: '3, 1, 3, 4, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findDuplicate(vector<int>& nums) {'),
      L('        int slow = nums[0], fast = nums[0];', 'init'),
      L('        do {'),
      L('            slow = nums[slow];', 'walk'),
      L('            fast = nums[nums[fast]];', 'walk'),
      L('        } while (slow != fast);', 'meet'),
      L('        slow = nums[0];', 'reset'),
      L('        while (slow != fast) {', 'phase2'),
      L('            slow = nums[slow];', 'phase2'),
      L('            fast = nums[fast];', 'phase2'),
      L('        }'),
      L('        return slow;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findDuplicate(int[] nums) {'),
      L('        int slow = nums[0], fast = nums[0];', 'init'),
      L('        do {'),
      L('            slow = nums[slow];', 'walk'),
      L('            fast = nums[nums[fast]];', 'walk'),
      L('        } while (slow != fast);', 'meet'),
      L('        slow = nums[0];', 'reset'),
      L('        while (slow != fast) {', 'phase2'),
      L('            slow = nums[slow];', 'phase2'),
      L('            fast = nums[fast];', 'phase2'),
      L('        }'),
      L('        return slow;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 1, maxLen: 12 });
    if (typeof nums === 'string') return { error: nums };
    const n = nums.length - 1;
    if (n < 1) return { error: 'Give at least two values.' };
    if (!nums.every((v) => v >= 1 && v <= n)) return { error: `With ${nums.length} values, every entry must be between 1 and ${n}.` };
    const dupSet = nums.filter((v, i) => nums.indexOf(v) !== i);
    if (dupSet.length === 0) return { error: 'No value repeats — add a duplicate.' };

    const steps: Step[] = [];
    let slow = nums[0];
    let fast = nums[0];
    const st = (mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: nums,
      mark,
      ptrs: [
        { name: 'slow', i: slow, c: 'a' },
        { name: 'fast', i: fast, c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Read index ', A('i'), ' as a pointer to index ', A('nums[i]'), '. Since every value lands in 1..n but there are n+1 slots, some index is pointed at twice — that is a ', B('cycle entrance'), '.'],
      state: st({ [slow]: 'active' }),
    });
    let guard = 0;
    do {
      slow = nums[slow];
      fast = nums[nums[fast]];
      steps.push({
        tag: 'walk',
        trace: ['slow hops once to ', A(slow), '; fast hops twice to ', B(fast), '.'],
        state: st({ [slow]: 'active', [fast]: 'good' }),
      });
      guard++;
    } while (slow !== fast && guard < 200);
    steps.push({
      tag: 'meet',
      trace: ['They meet at index ', B(slow), ' — proof a cycle exists, though this is not yet its entrance.'],
      state: st({ [slow]: 'win' }),
    });
    slow = nums[0];
    steps.push({
      tag: 'reset',
      trace: ['Send slow back to the start. From here, both pointers move at the ', A('same speed'), ' — and the maths says they will collide exactly at the entrance.'],
      state: st({ [slow]: 'active', [fast]: 'good' }),
    });
    guard = 0;
    while (slow !== fast && guard < 200) {
      slow = nums[slow];
      fast = nums[fast];
      steps.push({
        tag: 'phase2',
        trace: ['Both step once: slow at ', A(slow), ', fast at ', B(fast), '.'],
        state: st({ [slow]: 'active', [fast]: 'good' }),
      });
      guard++;
    }
    steps.push({
      tag: 'ret',
      trace: ['They converge on ', C(slow), ' — the index two different slots point at, so ', C(slow), ' is the duplicate value.'],
      state: {
        arr: nums,
        mark: Object.fromEntries(nums.map((v, i) => [i, v === slow ? ('final' as const) : ('dim' as const)])),
      },
    });
    return { steps, result: String(slow) };
  },
  note: "Because values are confined to 1..n, following i → nums[i] never leaves the array, so the walk must eventually repeat — and the node where two arrows converge is the repeated value. Floyd's two-phase trick finds it in O(1) space without sorting or modifying the input, which is exactly what the problem forbids.",
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash set',
    technique: 'Walk the array with a set of values already seen; the first value already in the set is the duplicate.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findDuplicate(vector<int>& nums) {'),
        L('        unordered_set<int> seen;', 'init'),
        L('        for (int x : nums) {', 'loop'),
        L('            if (seen.count(x)) return x;', 'check', 'found'),
        L('            seen.insert(x);', 'store'),
        L('        }'),
        L('        return -1;'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findDuplicate(int[] nums) {'),
        L('        Set<Integer> seen = new HashSet<>();', 'init'),
        L('        for (int x : nums) {', 'loop'),
        L('            if (!seen.add(x)) return x;', 'check', 'found', 'store'),
        L('        }'),
        L('        return -1;'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 1, maxLen: 12 });
      if (typeof nums === 'string') return { error: nums };
      const n = nums.length - 1;
      if (n < 1) return { error: 'Give at least two values.' };
      if (!nums.every((v) => v >= 1 && v <= n)) return { error: `With ${nums.length} values, every entry must be between 1 and ${n}.` };
      if (new Set(nums).size === nums.length) return { error: 'No value repeats — add a duplicate.' };

      const steps: Step[] = [];
      const seen = new Set<number>();
      const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: nums,
        ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
        mark,
        aggs: [{ label: 'seen', value: `{ ${[...seen].join(', ')} }`, c: 'b' }],
      });
      steps.push({ tag: 'init', trace: ['Remember every value in a set ', B('seen'), '; the first repeat is the answer.'], state: st(0) });
      let dup = -1;
      for (let i = 0; i < nums.length; i++) {
        if (seen.has(nums[i])) {
          dup = nums[i];
          steps.push({
            tag: 'found',
            trace: [A(nums[i]), ' is already in the set — it is the duplicate. Return ', C(dup), '.'],
            state: st(i, { [i]: 'final', [nums.indexOf(dup)]: 'final' }),
          });
          break;
        }
        seen.add(nums[i]);
        steps.push({ tag: 'store', trace: [A(nums[i]), ' is new — add it to the set.'], state: st(i, { [i]: 'active' }) });
      }
      return { steps, result: String(dup) };
    },
    note: 'Straightforward and O(n) time, but it uses O(n) extra memory, which the problem forbids. Floyd’s cycle detection finds the same value with two pointers and no extra space.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= First Missing Positive ================= */
const firstMissingPositive: ProblemDef = {
  slug: 'first-missing-positive',
  title: 'First Missing Positive',
  category: 'Arrays & Hashing',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/first-missing-positive/',
  technique: 'Use the array itself as a hash table: put value v at index v−1, then scan for the first mismatch.',
  widget: 'array',
  widgetTitle: 'Array (value v wants slot v−1)',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '3, 4, -1, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int firstMissingPositive(vector<int>& nums) {'),
      L('        int n = nums.size();'),
      L('        for (int i = 0; i < n; i++)', 'scan'),
      L('            while (nums[i] > 0 && nums[i] <= n &&', 'check'),
      L('                   nums[nums[i] - 1] != nums[i])', 'check'),
      L('                swap(nums[i], nums[nums[i] - 1]);', 'swap'),
      L('        for (int i = 0; i < n; i++)', 'find'),
      L('            if (nums[i] != i + 1) return i + 1;', 'find'),
      L('        return n + 1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int firstMissingPositive(int[] nums) {'),
      L('        int n = nums.length;'),
      L('        for (int i = 0; i < n; i++)', 'scan'),
      L('            while (nums[i] > 0 && nums[i] <= n &&', 'check'),
      L('                   nums[nums[i] - 1] != nums[i]) {', 'check'),
      L('                int t = nums[nums[i] - 1];', 'swap'),
      L('                nums[nums[i] - 1] = nums[i];', 'swap'),
      L('                nums[i] = t;', 'swap'),
      L('            }'),
      L('        for (int i = 0; i < n; i++)', 'find'),
      L('            if (nums[i] != i + 1) return i + 1;', 'find'),
      L('        return n + 1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 10 });
    if (typeof parsed === 'string') return { error: parsed };
    const a = [...parsed];
    const n = a.length;
    const steps: Step[] = [];
    const st = (mark: ArrayState['mark'], i?: number): ArrayState => ({
      arr: [...a],
      mark,
      ptrs: i !== undefined && i < n ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'slot k holds', value: 'ideally k+1', c: 'b' }],
    });
    steps.push({
      tag: 'scan',
      trace: ['The answer is always in 1..', A(n + 1), ', so only those values matter. Park each one in its own slot: value ', B('v'), ' belongs at index ', B('v−1'), '.'],
      state: st({}),
    });
    for (let i = 0; i < n; i++) {
      while (a[i] > 0 && a[i] <= n && a[a[i] - 1] !== a[i]) {
        const v = a[i];
        const target = v - 1;
        steps.push({
          tag: 'check',
          trace: [A(v), ' belongs at index ', A(target), ', which currently holds ', F(a[target]), ' — swap it home.'],
          state: st({ [i]: 'active', [target]: 'win' }, i),
        });
        [a[i], a[target]] = [a[target], a[i]];
        steps.push({
          tag: 'swap',
          trace: [B(v), ' is now parked at index ', B(target), '. Whatever came back to index ', A(i), ' gets checked next.'],
          state: st({ [target]: 'good', [i]: 'active' }, i),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (a[i] <= 0 || a[i] > n) {
        steps.push({
          tag: 'check',
          trace: [F(a[i]), ' is outside 1..', F(n), ' — it can never be the answer, so leave it where it is.'],
          state: st({ [i]: 'dim' }, i),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    let ans = n + 1;
    for (let i = 0; i < n; i++) {
      if (a[i] !== i + 1) {
        ans = i + 1;
        steps.push({
          tag: 'find',
          trace: ['Index ', A(i), ' should hold ', A(i + 1), ' but holds ', F(a[i]), ' — so ', C(i + 1), ' never appeared.'],
          state: st({ [i]: 'final' }, i),
        });
        break;
      }
      steps.push({
        tag: 'find',
        trace: ['Index ', B(i), ' correctly holds ', B(i + 1), ' — that number is present, keep looking.'],
        state: st({ [i]: 'good' }, i),
      });
    }
    if (ans === n + 1) {
      steps.push({
        tag: 'ret',
        trace: ['Every slot is filled with 1..', B(n), ' — nothing is missing below, so the answer is ', C(n + 1), '.'],
        state: st(Object.fromEntries(a.map((_, i) => [i, 'good' as const]))),
      });
    }
    return { steps, result: String(ans) };
  },
  note: 'With n slots you can hold at most n distinct positives, so the answer never exceeds n+1 — that bound is what makes the array big enough to index itself. Each swap sends one value to its permanent home, so despite the nested while, no value moves twice: the whole placement phase is O(n).',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash set',
    technique: 'Put every value in a set, then test 1, 2, 3, … until one is missing.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int firstMissingPositive(vector<int>& nums) {'),
        L('        unordered_set<int> seen(nums.begin(), nums.end());', 'init'),
        L('        int k = 1;', 'init'),
        L('        while (seen.count(k)) k++;', 'probe'),
        L('        return k;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int firstMissingPositive(int[] nums) {'),
        L('        Set<Integer> seen = new HashSet<>();', 'init'),
        L('        for (int x : nums) seen.add(x);', 'init'),
        L('        int k = 1;', 'init'),
        L('        while (seen.contains(k)) k++;', 'probe'),
        L('        return k;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 10 });
      if (typeof a === 'string') return { error: a };
      const seen = new Set(a);
      const steps: Step[] = [];
      const st = (k: number, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: a,
        mark,
        aggs: [
          { label: 'set', value: `{ ${[...seen].join(', ')} }`, c: 'b' },
          { label: 'k', value: String(k), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Copy every value into a hash set, then probe ', A('k = 1, 2, 3, …'), '.'], state: st(1) });
      let k = 1;
      while (seen.has(k)) {
        const at = a.indexOf(k);
        steps.push({ tag: 'probe', trace: [B(k), ' is in the set — try ', A(k + 1), '.'], state: st(k, { [at]: 'good' }) });
        k++;
      }
      steps.push({ tag: 'ret', trace: [C(k), ' is not in the set — it is the first missing positive.'], state: st(k) });
      return { steps, result: String(k) };
    },
    note: 'Simple and linear, but the set costs O(n) extra memory, which the problem forbids. Swapping each value into slot v − 1 turns the input array itself into the set.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= Reverse Pairs ================= */
const reversePairs: ProblemDef = {
  slug: 'reverse-pairs',
  title: 'Reverse Pairs',
  category: 'Arrays & Hashing',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/reverse-pairs/',
  technique: 'Count pairs during a merge sort — each merge counts the pairs that straddle the split.',
  widget: 'array',
  widgetTitle: 'Array (merge sort in progress)',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '2, 4, 3, 5, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int reversePairs(vector<int>& nums) {'),
      L('        return sortCount(nums, 0, nums.size() - 1);', 'top'),
      L('    }'),
      L('    int sortCount(vector<int>& a, int lo, int hi) {', 'split'),
      L('        if (lo >= hi) return 0;', 'split'),
      L('        int mid = (lo + hi) / 2, cnt = 0;', 'split'),
      L('        cnt += sortCount(a, lo, mid);', 'split'),
      L('        cnt += sortCount(a, mid + 1, hi);', 'split'),
      L('        int j = mid + 1;'),
      L('        for (int i = lo; i <= mid; i++) {', 'count'),
      L('            while (j <= hi && a[i] > 2LL * a[j]) j++;', 'count'),
      L('            cnt += j - (mid + 1);', 'count'),
      L('        }'),
      L('        merge(a, lo, mid, hi);', 'merge'),
      L('        return cnt;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int reversePairs(int[] nums) {'),
      L('        return sortCount(nums, 0, nums.length - 1);', 'top'),
      L('    }'),
      L('    int sortCount(int[] a, int lo, int hi) {', 'split'),
      L('        if (lo >= hi) return 0;', 'split'),
      L('        int mid = (lo + hi) / 2, cnt = 0;', 'split'),
      L('        cnt += sortCount(a, lo, mid);', 'split'),
      L('        cnt += sortCount(a, mid + 1, hi);', 'split'),
      L('        int j = mid + 1;'),
      L('        for (int i = lo; i <= mid; i++) {', 'count'),
      L('            while (j <= hi && a[i] > 2L * a[j]) j++;', 'count'),
      L('            cnt += j - (mid + 1);', 'count'),
      L('        }'),
      L('        merge(a, lo, mid, hi);', 'merge'),
      L('        return cnt;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { maxLen: 9 });
    if (typeof parsed === 'string') return { error: parsed };
    const a = [...parsed];
    const steps: Step[] = [];
    let total = 0;
    const st = (lo: number, hi: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: [...a],
      window: [lo, hi],
      mark,
      aggs: [{ label: 'reverse pairs', value: String(total), c: 'c' }],
    });

    const sortCount = (lo: number, hi: number): void => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      steps.push({
        tag: 'split',
        trace: ['Split [', A(lo), '..', A(hi), '] at ', A(mid), ' and solve each half first — after that, both halves are sorted.'],
        state: st(lo, hi, { [mid]: 'active' }),
      });
      sortCount(lo, mid);
      sortCount(mid + 1, hi);
      let j = mid + 1;
      for (let i = lo; i <= mid; i++) {
        while (j <= hi && a[i] > 2 * a[j]) j++;
        const found = j - (mid + 1);
        total += found;
        steps.push({
          tag: 'count',
          trace: [
            'Left value ', A(a[i]), ' beats twice the first ', B(found), ' right value(s)',
            found ? [' (', B(a.slice(mid + 1, j).join(', ')), ')'].join('') : '',
            '. Both halves are sorted, so ', A('j never moves back'), '.',
          ],
          state: st(lo, hi, {
            [i]: 'active',
            ...Object.fromEntries([...Array(found)].map((_, k) => [mid + 1 + k, 'good' as const])),
          }),
        });
        if (steps.length > MAX_STEPS) return;
      }
      const merged = [...a.slice(lo, mid + 1), ...a.slice(mid + 1, hi + 1)].sort((x, y) => x - y);
      for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
      steps.push({
        tag: 'merge',
        trace: ['Merge the two halves back into sorted order so the parent call can reuse the same trick.'],
        state: st(lo, hi, Object.fromEntries([...Array(hi - lo + 1)].map((_, k) => [lo + k, 'win' as const]))),
      });
    };

    steps.push({
      tag: 'top',
      trace: ['A reverse pair is ', A('i < j'), ' with ', A('nums[i] > 2·nums[j]'), '. Counting them naively is O(n²); merge sort gets it to O(n log n).'],
      state: st(0, a.length - 1),
    });
    sortCount(0, a.length - 1);
    steps.push({
      tag: 'ret',
      trace: ['Every pair was counted exactly once, in the merge where the two indices first landed on opposite sides: ', C(total), '.'],
      state: { arr: [...a], mark: Object.fromEntries(a.map((_, i) => [i, 'final' as const])), aggs: [{ label: 'reverse pairs', value: String(total), c: 'c' }] },
    });
    return { steps, result: String(total) };
  },
  note: 'The key is that any pair (i, j) is separated by exactly one merge — the one whose split falls between them — so counting at every merge counts each pair once and only once. Sorting the halves first is what lets j sweep forward monotonically instead of restarting, turning a quadratic count into a linear one per level.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  brute: {
    label: 'Brute force',
    technique: 'Check every pair i < j directly for nums[i] > 2 · nums[j].',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int reversePairs(vector<int>& nums) {'),
        L('        int cnt = 0, n = nums.size();', 'init'),
        L('        for (int i = 0; i < n; i++)', 'outer'),
        L('            for (int j = i + 1; j < n; j++)', 'test', 'hit'),
        L('                if (nums[i] > 2LL * nums[j]) cnt++;', 'test', 'hit'),
        L('        return cnt;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int reversePairs(int[] nums) {'),
        L('        int cnt = 0, n = nums.length;', 'init'),
        L('        for (int i = 0; i < n; i++)', 'outer'),
        L('            for (int j = i + 1; j < n; j++)', 'test', 'hit'),
        L('                if (nums[i] > 2L * nums[j]) cnt++;', 'test', 'hit'),
        L('        return cnt;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 9 });
      if (typeof a === 'string') return { error: a };
      const steps: Step[] = [];
      let cnt = 0;
      const st = (i: number, j: number, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: a,
        mark,
        ptrs: [
          ...(i < a.length ? [{ name: 'i', i, c: 'b' as const }] : []),
          ...(j < a.length ? [{ name: 'j', i: j, c: 'a' as const }] : []),
        ],
        aggs: [{ label: 'reverse pairs', value: String(cnt), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['Test every pair ', A('i < j'), ' for ', A('nums[i] > 2·nums[j]'), '.'], state: st(0, 1) });
      for (let i = 0; i < a.length; i++) {
        steps.push({ tag: 'outer', trace: ['Fix ', B(a[i]), ' at index ', B(i), '.'], state: st(i, i + 1, { [i]: 'good' }) });
        for (let j = i + 1; j < a.length; j++) {
          const ok = a[i] > 2 * a[j];
          if (ok) cnt++;
          steps.push({
            tag: ok ? 'hit' : 'test',
            trace: [B(a[i]), ' vs 2 × ', A(a[j]), ' = ', A(2 * a[j]), ok ? [' — a reverse pair! Count ', cnt, '.'].join('') : ' — no.'],
            state: st(i, j, { [i]: 'good', [j]: ok ? 'final' : 'dim' }),
          });
        }
      }
      steps.push({ tag: 'ret', trace: ['All pairs checked — ', C(cnt), ' reverse pairs.'], state: st(a.length, a.length) });
      return { steps, result: String(cnt) };
    },
    note: 'Every one of the n(n−1)/2 pairs is examined, so it times out on large inputs. Merge sort counts the pairs that straddle each split in linear time per level, for O(n log n) overall.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= Contiguous Array ================= */
const contiguousArray: ProblemDef = {
  slug: 'contiguous-array',
  title: 'Contiguous Array',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/contiguous-array/',
  technique: 'Map 0 → −1, then the longest equal-count window is the longest zero-sum subarray.',
  widget: 'array',
  widgetTitle: 'Binary array & running balance',
  inputs: [{ key: 'nums', label: 'Binary array', defaultValue: '0, 1, 0, 0, 1, 1, 0', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findMaxLength(vector<int>& nums) {'),
      L('        unordered_map<int, int> first{{0, -1}};', 'init'),
      L('        int bal = 0, best = 0;', 'init'),
      L('        for (int i = 0; i < nums.size(); i++) {', 'loop'),
      L('            bal += nums[i] == 1 ? 1 : -1;', 'bal'),
      L('            if (first.count(bal))', 'seen'),
      L('                best = max(best, i - first[bal]);', 'seen'),
      L('            else'),
      L('                first[bal] = i;', 'store'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findMaxLength(int[] nums) {'),
      L('        Map<Integer, Integer> first = new HashMap<>();'),
      L('        first.put(0, -1);', 'init'),
      L('        int bal = 0, best = 0;', 'init'),
      L('        for (int i = 0; i < nums.length; i++) {', 'loop'),
      L('            bal += nums[i] == 1 ? 1 : -1;', 'bal'),
      L('            if (first.containsKey(bal))', 'seen'),
      L('                best = Math.max(best, i - first.get(bal));', 'seen'),
      L('            else'),
      L('                first.put(bal, i);', 'store'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 1, maxLen: 16 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    const first = new Map<number, number>([[0, -1]]);
    let bal = 0;
    let best = 0;
    let bestRange: [number, number] | null = null;
    const st = (i: number, win: [number, number] | null, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: nums,
      window: win,
      mark,
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'balance', value: String(bal), c: 'a' },
        { label: 'best length', value: String(best), c: 'c' },
        { label: 'first seen at', value: [...first.entries()].map(([k, v]) => `${k}→${v}`).join('  '), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Score each ', A('1'), ' as +1 and each ', A('0'), ' as −1. Then "equal counts" becomes "', B('balance returns to the same value'), '".'],
      state: st(nums.length, null),
    });
    for (let i = 0; i < nums.length; i++) {
      bal += nums[i] === 1 ? 1 : -1;
      if (first.has(bal)) {
        const start = first.get(bal)!;
        const len = i - start;
        const improved = len > best;
        if (improved) {
          best = len;
          bestRange = [start + 1, i];
        }
        steps.push({
          tag: 'seen',
          trace: [
            'Balance ', A(bal), ' was already seen at index ', A(start), '. Everything between cancels out — that is a window of length ', B(len),
            improved ? ' — a new best!' : ` (best stays ${best}).`,
          ],
          state: st(i, [start + 1, i], { [i]: 'active' }),
        });
      } else {
        first.set(bal, i);
        steps.push({
          tag: 'store',
          trace: ['Balance ', A(bal), ' is new — record its ', B('first'), ' index ', B(i), '. Earliest is best, since it gives the longest reach later.'],
          state: st(i, null, { [i]: 'active' }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: bestRange
        ? ['Longest balanced stretch: ', C(best), ' (indices ', C(`${bestRange[0]}…${bestRange[1]}`), ').']
        : ['No balanced stretch exists — answer ', C(0), '.'],
      state: st(nums.length, bestRange),
    });
    return { steps, result: String(best), resultDetail: bestRange ? `indices ${bestRange[0]}…${bestRange[1]}` : undefined };
  },
  note: 'Rewriting 0 as −1 converts a two-counter condition into a single prefix-sum condition, which a hash map answers in O(1). Storing only the first index per balance is deliberate: a later duplicate would only ever produce a shorter window.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Brute force',
    technique: 'For every start index, extend the end and keep counts of zeros and ones.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findMaxLength(vector<int>& nums) {'),
        L('        int best = 0, n = nums.size();', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            int zeros = 0, ones = 0;', 'outer'),
        L('            for (int j = i; j < n; j++) {', 'grow', 'eq'),
        L('                (nums[j] == 0 ? zeros : ones)++;', 'grow', 'eq'),
        L('                if (zeros == ones) best = max(best, j - i + 1);', 'eq'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findMaxLength(int[] nums) {'),
        L('        int best = 0, n = nums.length;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            int zeros = 0, ones = 0;', 'outer'),
        L('            for (int j = i; j < n; j++) {', 'grow', 'eq'),
        L('                if (nums[j] == 0) zeros++; else ones++;', 'grow', 'eq'),
        L('                if (zeros == ones) best = Math.max(best, j - i + 1);', 'eq'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, max: 1, maxLen: 16 });
      if (typeof nums === 'string') return { error: nums };
      const steps: Step[] = [];
      let best = 0;
      let zeros = 0;
      let ones = 0;
      const st = (i: number, j: number | null): ArrayState => ({
        arr: nums,
        window: j !== null ? [i, j] : null,
        ptrs: i < nums.length ? [{ name: 'i', i, c: 'b' }] : [],
        aggs: [
          { label: 'zeros / ones', value: `${zeros} / ${ones}`, c: 'a' },
          { label: 'best length', value: String(best), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Try every window nums[i..j] and compare its count of ', A('0s'), ' and ', A('1s'), '.'], state: st(0, null) });
      for (let i = 0; i < nums.length; i++) {
        zeros = 0;
        ones = 0;
        steps.push({ tag: 'outer', trace: ['New start index ', B(i), ' — reset both counts.'], state: st(i, null) });
        for (let j = i; j < nums.length; j++) {
          if (nums[j] === 0) zeros++;
          else ones++;
          if (zeros === ones) {
            const improved = j - i + 1 > best;
            if (improved) best = j - i + 1;
            steps.push({
              tag: 'eq',
              trace: ['Window [', B(i), '..', A(j), '] is balanced (', A(zeros), ' each) — length ', B(j - i + 1), improved ? ', a new best.' : '.'],
              state: st(i, j),
            });
          } else {
            steps.push({ tag: 'grow', trace: ['Window [', B(i), '..', A(j), ']: ', F(`${zeros} zeros vs ${ones} ones`), '.'], state: st(i, j) });
          }
        }
      }
      steps.push({ tag: 'ret', trace: ['Longest balanced window: ', C(best), '.'], state: st(nums.length, null) });
      return { steps, result: String(best) };
    },
    note: 'Correct but quadratic: every window is recounted from its start. Scoring 0 as −1 and remembering where each running balance first appeared finds the longest balanced window in one pass.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= Subarray Sums Divisible by K ================= */
const subarrayDivK: ProblemDef = {
  slug: 'subarray-sums-divisible-by-k',
  title: 'Subarray Sums Divisible by K',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/subarray-sums-divisible-by-k/',
  technique: 'Two prefix sums with the same remainder mod k bracket a subarray divisible by k.',
  widget: 'array',
  widgetTitle: 'Array & prefix remainders',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '4, 5, 0, -2, -3, 1', wide: true },
    { key: 'k', label: 'k', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int subarraysDivByK(vector<int>& nums, int k) {'),
      L('        vector<int> cnt(k, 0);'),
      L('        cnt[0] = 1;', 'init'),
      L('        int sum = 0, ans = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            sum = ((sum + x) % k + k) % k;', 'mod'),
      L('            ans += cnt[sum];', 'add'),
      L('            cnt[sum]++;', 'add'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int subarraysDivByK(int[] nums, int k) {'),
      L('        int[] cnt = new int[k];'),
      L('        cnt[0] = 1;', 'init'),
      L('        int sum = 0, ans = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            sum = ((sum + x) % k + k) % k;', 'mod'),
      L('            ans += cnt[sum];', 'add'),
      L('            cnt[sum]++;', 'add'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { maxLen: 14 });
    if (typeof nums === 'string') return { error: nums };
    const k = parseInt1(values.k, 'k', { min: 2, max: 9 });
    if (typeof k === 'string') return { error: k };
    const steps: Step[] = [];
    const cnt = [...Array(k)].map(() => 0);
    cnt[0] = 1;
    let sum = 0;
    let ans = 0;
    const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: nums,
      mark,
      ptrs: i < nums.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'prefix mod k', value: String(sum), c: 'a' },
        { label: 'seen counts', value: cnt.map((c, r) => `${r}:${c}`).join('  '), c: 'b' },
        { label: 'answer', value: String(ans), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Remainder ', A(0), ' starts with a count of 1 — the empty prefix, which lets a subarray starting at index 0 be counted.'],
      state: st(nums.length),
    });
    for (let i = 0; i < nums.length; i++) {
      sum = (((sum + nums[i]) % k) + k) % k;
      const hits = cnt[sum];
      ans += hits;
      steps.push({
        tag: 'add',
        trace: [
          'Prefix through index ', A(i), ' has remainder ', A(sum), '. It has been seen ', B(hits), ' time(s) before — each one closes a subarray whose sum is divisible by ', A(k), '. Total: ', C(ans), '.',
        ],
        state: st(i, { [i]: 'active' }),
      });
      cnt[sum]++;
    }
    steps.push({
      tag: 'ret',
      trace: [C(ans), ' subarrays have a sum divisible by ', C(k), '.'],
      state: st(nums.length, Object.fromEntries(nums.map((_, i) => [i, 'final' as const]))),
    });
    return { steps, result: String(ans) };
  },
  note: 'sum(i..j) = prefix[j] − prefix[i−1], and that difference is divisible by k exactly when the two prefixes share a remainder. Counting how many earlier prefixes carry each remainder turns a quadratic pair-search into one pass. The double modulo is not decoration — it fixes negative remainders, which is where most buggy submissions die.',
  complexity: { time: 'O(n + k)', space: 'O(k)' },
  brute: {
    label: 'Brute force',
    technique: 'Fix each start, extend the end with a running sum, and test divisibility by k every time.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int subarraysDivByK(vector<int>& nums, int k) {'),
        L('        int ans = 0, n = nums.size();', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < n; j++) {', 'add', 'hit'),
        L('                sum += nums[j];', 'add', 'hit'),
        L('                if (sum % k == 0) ans++;', 'hit'),
        L('            }'),
        L('        }'),
        L('        return ans;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int subarraysDivByK(int[] nums, int k) {'),
        L('        int ans = 0, n = nums.length;', 'init'),
        L('        for (int i = 0; i < n; i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < n; j++) {', 'add', 'hit'),
        L('                sum += nums[j];', 'add', 'hit'),
        L('                if (sum % k == 0) ans++;', 'hit'),
        L('            }'),
        L('        }'),
        L('        return ans;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { maxLen: 14 });
      if (typeof nums === 'string') return { error: nums };
      const k = parseInt1(values.k, 'k', { min: 2, max: 9 });
      if (typeof k === 'string') return { error: k };
      const steps: Step[] = [];
      let ans = 0;
      let sum = 0;
      const st = (i: number, j: number | null): ArrayState => ({
        arr: nums,
        window: j !== null ? [i, j] : null,
        ptrs: i < nums.length ? [{ name: 'i', i, c: 'b' }] : [],
        aggs: [
          { label: 'sum', value: String(sum), c: 'a' },
          { label: 'answer', value: String(ans), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Try every subarray and check whether its sum is divisible by ', A(k), '.'], state: st(0, null) });
      for (let i = 0; i < nums.length; i++) {
        sum = 0;
        steps.push({ tag: 'outer', trace: ['Start at index ', B(i), ' with sum 0.'], state: st(i, null) });
        for (let j = i; j < nums.length; j++) {
          sum += nums[j];
          const ok = ((sum % k) + k) % k === 0;
          if (ok) ans++;
          steps.push({
            tag: ok ? 'hit' : 'add',
            trace: ['Sum of [', B(i), '..', A(j), '] = ', ok ? B(sum) : F(sum), ok ? [' — divisible by ', k, '. Answer ', ans, '.'].join('') : [' — not divisible by ', k, '.'].join('')],
            state: st(i, j),
          });
        }
      }
      steps.push({ tag: 'ret', trace: [C(ans), ' subarrays have a sum divisible by ', C(k), '.'], state: st(nums.length, null) });
      return { steps, result: String(ans) };
    },
    note: 'There are n(n+1)/2 subarrays and each is tested once, so this is quadratic. Counting prefix-sum remainders answers "how many earlier prefixes match?" in O(1) per index.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= Largest Number ================= */
const largestNumber: ProblemDef = {
  slug: 'largest-number',
  title: 'Largest Number',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/largest-number/',
  technique: 'Sort by "which concatenation is bigger", not by numeric value.',
  widget: 'array',
  widgetTitle: 'Numbers being ordered',
  inputs: [{ key: 'nums', label: 'Non-negative numbers', defaultValue: '3, 30, 34, 5, 9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string largestNumber(vector<int>& nums) {'),
      L('        vector<string> s;'),
      L('        for (int x : nums) s.push_back(to_string(x));', 'strs'),
      L('        sort(s.begin(), s.end(), [](auto& a, auto& b) {', 'cmp'),
      L('            return a + b > b + a;', 'cmp'),
      L('        });'),
      L('        if (s[0] == "0") return "0";', 'zero'),
      L('        string res;'),
      L('        for (auto& t : s) res += t;', 'join'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String largestNumber(int[] nums) {'),
      L('        String[] s = new String[nums.length];'),
      L('        for (int i = 0; i < nums.length; i++)', 'strs'),
      L('            s[i] = String.valueOf(nums[i]);', 'strs'),
      L('        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));', 'cmp'),
      L('        if (s[0].equals("0")) return "0";', 'zero'),
      L('        StringBuilder res = new StringBuilder();'),
      L('        for (String t : s) res.append(t);', 'join'),
      L('        return res.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 999, maxLen: 8 });
    if (typeof nums === 'string') return { error: nums };
    const steps: Step[] = [];
    const s = nums.map(String);
    const st = (arr: string[], mark: ArrayState['mark'] = {}): ArrayState => ({ arr: [...arr], mark });
    steps.push({
      tag: 'strs',
      trace: ['Compare as ', A('strings'), ', not numbers — what matters is which order glues into a bigger result.'],
      state: st(s),
    });
    // Insertion sort so every comparison is a visible step.
    for (let i = 1; i < s.length; i++) {
      let j = i;
      while (j > 0) {
        const a = s[j - 1];
        const b = s[j];
        const keep = a + b >= b + a;
        steps.push({
          tag: 'cmp',
          trace: [
            '"', A(a), '" then "', A(b), '" makes ', A(a + b), '; the other way makes ', B(b + a), '. ',
            keep ? ['Keep ', B(a), ' first.'].join('') : ['So ', B(b), ' must come first — swap.'].join(''),
          ],
          state: st(s, { [j - 1]: keep ? 'good' : 'active', [j]: keep ? 'good' : 'active' }),
        });
        if (keep) break;
        [s[j - 1], s[j]] = [s[j], s[j - 1]];
        j--;
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    const joined = s[0] === '0' ? '0' : s.join('');
    if (s[0] === '0') {
      steps.push({
        tag: 'zero',
        trace: ['The largest piece is ', F('0'), ', so every number is zero — return plain "', C('0'), '" rather than "000".'],
        state: st(s),
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Glue them in this order: ', C(joined), '.'],
      state: st(s, Object.fromEntries(s.map((_, i) => [i, 'final' as const]))),
    });
    return { steps, result: joined };
  },
  note: 'Sorting by a+b vs b+a is a valid comparator because that relation is transitive — a fact worth knowing, since the "obvious" alternatives (sort descending numerically, or by first digit) both fail on inputs like 3 vs 30. The trailing zero guard matters for [0, 0], which would otherwise print "00".',
  complexity: { time: 'O(n log n · L)', space: 'O(n · L)' },
  brute: {
    label: 'Brute force',
    technique: 'Try every ordering of the numbers, glue each one together, and keep the largest string.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string largestNumber(vector<int>& nums) {'),
        L('        sort(nums.begin(), nums.end());', 'init'),
        L('        string best = "";', 'init'),
        L('        do {', 'try'),
        L('            string s;', 'try'),
        L('            for (int x : nums) s += to_string(x);', 'try'),
        L('            if (s > best) best = s;', 'better'),
        L('        } while (next_permutation(nums.begin(), nums.end()));'),
        L('        return best[0] == \'0\' ? "0" : best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    String best = "";'),
        L('    public String largestNumber(int[] nums) {'),
        L('        permute(nums, 0);', 'init'),
        L('        return best.charAt(0) == \'0\' ? "0" : best;', 'ret'),
        L('    }'),
        L('    void permute(int[] a, int i) {'),
        L('        if (i == a.length) {', 'try'),
        L('            StringBuilder s = new StringBuilder();', 'try'),
        L('            for (int x : a) s.append(x);', 'try'),
        L('            if (s.toString().compareTo(best) > 0) best = s.toString();', 'better'),
        L('            return;'),
        L('        }'),
        L('        for (int j = i; j < a.length; j++) {'),
        L('            swap(a, i, j); permute(a, i + 1); swap(a, i, j);'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, max: 999, maxLen: 6 });
      if (typeof nums === 'string') return { error: nums === 'Keep it to at most 6 values.' ? nums : nums };
      const steps: Step[] = [];
      const orders: number[][] = [];
      const gen = (a: number[], i: number) => {
        if (i === a.length) return void orders.push([...a]);
        for (let j = i; j < a.length; j++) {
          [a[i], a[j]] = [a[j], a[i]];
          gen(a, i + 1);
          [a[i], a[j]] = [a[j], a[i]];
        }
      };
      gen([...nums], 0);
      let best = '';
      let bestOrder = nums;
      const st = (order: number[], mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: order.map(String),
        mark,
        aggs: [
          { label: 'orderings', value: String(orders.length), c: 'a' },
          { label: 'best so far', value: best || '—', c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['There are ', A(orders.length), ' orderings of these numbers — glue each one and keep the biggest.'], state: st(nums) });
      let tried = 0;
      for (const o of orders) {
        const s = o.join('');
        tried++;
        if (s.length > best.length || s > best) {
          best = s;
          bestOrder = o;
          steps.push({ tag: 'better', trace: ['Ordering #', A(tried), ' glues to ', B(s), ' — a new best.'], state: st(o, Object.fromEntries(o.map((_, i) => [i, 'good' as const]))) });
        } else if (tried <= 8) {
          steps.push({ tag: 'try', trace: ['Ordering #', A(tried), ' glues to ', F(s), ' — not bigger.'], state: st(o) });
        }
      }
      const res = best[0] === '0' ? '0' : best;
      steps.push({
        tag: 'ret',
        trace: ['Checked all ', C(orders.length), ' orderings — the largest is ', C(res), '.'],
        state: st(bestOrder, Object.fromEntries(bestOrder.map((_, i) => [i, 'final' as const]))),
      });
      return { steps, result: res };
    },
    note: 'Guaranteed correct because it literally checks everything, but n! orderings is hopeless beyond about 10 numbers. The a+b vs b+a comparator finds the best order with a single sort.',
    complexity: { time: 'O(n! · n · L)', space: 'O(n · L)' },
  },
};

/* ================= Find All Duplicates in an Array ================= */
const findAllDuplicates: ProblemDef = {
  slug: 'find-all-duplicates-in-an-array',
  title: 'Find All Duplicates in an Array',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-all-duplicates-in-an-array/',
  technique: 'Flip the sign at index |v|−1 as a visited mark — a second visit finds it already negative.',
  widget: 'array',
  widgetTitle: 'Array (sign = visited flag)',
  inputs: [{ key: 'nums', label: 'Values from 1..n', defaultValue: '4, 3, 2, 7, 8, 2, 3, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> findDuplicates(vector<int>& nums) {'),
      L('        vector<int> res;'),
      L('        for (int x : nums) {', 'loop'),
      L('            int i = abs(x) - 1;', 'idx'),
      L('            if (nums[i] < 0) res.push_back(abs(x));', 'dup'),
      L('            else nums[i] = -nums[i];', 'mark'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> findDuplicates(int[] nums) {'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        for (int x : nums) {', 'loop'),
      L('            int i = Math.abs(x) - 1;', 'idx'),
      L('            if (nums[i] < 0) res.add(Math.abs(x));', 'dup'),
      L('            else nums[i] = -nums[i];', 'mark'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntArray(values.nums, { min: 1, maxLen: 12 });
    if (typeof parsed === 'string') return { error: parsed };
    const n = parsed.length;
    if (!parsed.every((v) => v >= 1 && v <= n)) return { error: `Every value must be between 1 and ${n} (the array length).` };
    const a = [...parsed];
    const steps: Step[] = [];
    const res: number[] = [];
    const st = (mark: ArrayState['mark'] = {}): ArrayState => ({
      arr: [...a],
      mark,
      aggs: [{ label: 'duplicates', value: res.length ? res.join(', ') : '—', c: 'c' }],
    });
    steps.push({
      tag: 'loop',
      trace: ['Values are all in 1..', A(n), ', so each one names a valid index. Use the ', B('sign'), ' of that slot as a "seen" flag — no extra memory.'],
      state: st(),
    });
    for (let k = 0; k < n; k++) {
      const v = Math.abs(a[k]);
      const i = v - 1;
      if (a[i] < 0) {
        res.push(v);
        steps.push({
          tag: 'dup',
          trace: ['Slot ', A(i), ' is already negative — so ', C(v), ' has been seen before. It is a duplicate.'],
          state: st({ [k]: 'active', [i]: 'final' }),
        });
      } else {
        a[i] = -a[i];
        steps.push({
          tag: 'mark',
          trace: ['First sighting of ', A(v), ' — flip slot ', B(i), ' negative to remember it.'],
          state: st({ [k]: 'active', [i]: 'good' }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Values appearing twice: ', C(res.join(', ')), '.'] : ['No value appears twice — ', C('empty'), '.'],
      state: st(),
    });
    return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
  },
  note: 'The guarantee that values lie in 1..n is what makes the array double as its own hash set, and negation is reversible so the data is never truly destroyed. Always read through abs(x) — by the time you visit a slot, an earlier mark may have flipped its sign.',
  complexity: { time: 'O(n)', space: 'O(1) extra' },
  brute: {
    label: 'Count array',
    technique: 'Tally each value in a separate array of size n + 1, then report every value counted twice.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> findDuplicates(vector<int>& nums) {'),
        L('        vector<int> cnt(nums.size() + 1, 0), res;', 'init'),
        L('        for (int x : nums)', 'loop', 'dup'),
        L('            if (++cnt[x] == 2) res.push_back(x);', 'loop', 'dup'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> findDuplicates(int[] nums) {'),
        L('        int[] cnt = new int[nums.length + 1];', 'init'),
        L('        List<Integer> res = new ArrayList<>();', 'init'),
        L('        for (int x : nums)', 'loop', 'dup'),
        L('            if (++cnt[x] == 2) res.add(x);', 'loop', 'dup'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 1, maxLen: 12 });
      if (typeof a === 'string') return { error: a };
      const n = a.length;
      if (!a.every((v) => v >= 1 && v <= n)) return { error: `Every value must be between 1 and ${n} (the array length).` };
      const cnt = Array(n + 1).fill(0);
      const res: number[] = [];
      const steps: Step[] = [];
      const st = (i: number, mark: ArrayState['mark'] = {}): ArrayState => ({
        arr: a,
        mark,
        ptrs: i < n ? [{ name: 'i', i, c: 'a' }] : [],
        aggs: [
          { label: 'counts', value: cnt.slice(1).map((c, v) => `${v + 1}:${c}`).join(' '), c: 'b' },
          { label: 'duplicates', value: res.length ? res.join(', ') : '—', c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Keep a separate counter for every value 1..', A(n), '.'], state: st(n) });
      for (let i = 0; i < n; i++) {
        cnt[a[i]]++;
        if (cnt[a[i]] === 2) {
          res.push(a[i]);
          steps.push({ tag: 'dup', trace: ['Count of ', A(a[i]), ' reaches 2 — it is a duplicate.'], state: st(i, { [i]: 'final' }) });
        } else {
          steps.push({ tag: 'loop', trace: ['Count of ', A(a[i]), ' is now ', B(cnt[a[i]]), '.'], state: st(i, { [i]: 'active' }) });
        }
      }
      steps.push({ tag: 'ret', trace: res.length ? ['Values appearing twice: ', C(res.join(', ')), '.'] : ['No value appears twice — ', C('empty'), '.'], state: st(n) });
      return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
    },
    note: 'Linear time and easy to follow, but the counter array is O(n) extra memory. Flipping signs inside the input stores the same "seen" bit for free.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= Game of Life ================= */
const gameOfLife: ProblemDef = {
  slug: 'game-of-life',
  title: 'Game of Life',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/game-of-life/',
  technique: 'Encode both generations in one cell: bit 0 = this generation, bit 1 = the next.',
  widget: 'matrix',
  widgetTitle: 'Board (1 = live)',
  inputs: [{ key: 'grid', label: 'Board (rows ";" separated)', defaultValue: '010;001;111;000', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void gameOfLife(vector<vector<int>>& b) {'),
      L('        int R = b.size(), C = b[0].size();'),
      L('        for (int r = 0; r < R; r++)', 'scan'),
      L('            for (int c = 0; c < C; c++) {', 'scan'),
      L('                int live = countLive(b, r, c);', 'count'),
      L('                if ((b[r][c] & 1) && (live < 2 || live > 3))', 'die'),
      L('                    b[r][c] = 1;   // 01 -> dies', 'die'),
      L('                else if ((b[r][c] & 1))', 'live'),
      L('                    b[r][c] = 3;   // 11 -> survives', 'live'),
      L('                else if (!(b[r][c] & 1) && live == 3)', 'born'),
      L('                    b[r][c] = 2;   // 10 -> born', 'born'),
      L('            }'),
      L('        for (auto& row : b)', 'shift'),
      L('            for (int& v : row) v >>= 1;', 'shift'),
      L('    }', 'ret'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void gameOfLife(int[][] b) {'),
      L('        int R = b.length, C = b[0].length;'),
      L('        for (int r = 0; r < R; r++)', 'scan'),
      L('            for (int c = 0; c < C; c++) {', 'scan'),
      L('                int live = countLive(b, r, c);', 'count'),
      L('                if ((b[r][c] & 1) == 1 && (live < 2 || live > 3))', 'die'),
      L('                    b[r][c] = 1;   // 01 -> dies', 'die'),
      L('                else if ((b[r][c] & 1) == 1)', 'live'),
      L('                    b[r][c] = 3;   // 11 -> survives', 'live'),
      L('                else if ((b[r][c] & 1) == 0 && live == 3)', 'born'),
      L('                    b[r][c] = 2;   // 10 -> born', 'born'),
      L('            }'),
      L('        for (int r = 0; r < R; r++)', 'shift'),
      L('            for (int c = 0; c < C; c++) b[r][c] >>= 1;', 'shift'),
      L('    }', 'ret'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.grid ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (raw.length === 0) return { error: 'Enter a board, rows separated by ";".' };
    const w = raw[0].length;
    if (!raw.every((r) => r.length === w)) return { error: 'All rows must be the same length.' };
    if (raw.length > 6 || w > 6) return { error: 'Keep the board to at most 6×6 so every cell fits on screen.' };
    if (!raw.every((r) => /^[01]+$/.test(r))) return { error: 'Use only 0 and 1.' };

    const R = raw.length;
    const Cn = w;
    const b = raw.map((r) => r.split('').map(Number));
    const steps: Step[] = [];
    const cell = (v: number) => ((v & 1) === 1 ? '●' : '·');
    const view = (mark: Record<string, 'active' | 'good' | 'final' | 'dim' | 'src'> = {}, useNew = false): MatrixState => ({
      grid: b.map((row) => row.map((v) => (useNew ? (v >= 1 ? '●' : '·') : cell(v)))),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark,
    });
    steps.push({
      tag: 'scan',
      trace: ['Every cell must update from the ', A('same'), ' snapshot. Instead of copying the board, stash the new bit ', B('one place to the left'), ' in the same integer.'],
      state: view(),
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cn; c++) {
        let live = 0;
        const nbrs: string[] = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < Cn) {
              if ((b[nr][nc] & 1) === 1) live++;
              nbrs.push(`${nr},${nc}`);
            }
          }
        }
        const wasLive = (b[r][c] & 1) === 1;
        const mark: Record<string, 'active' | 'good' | 'final' | 'dim' | 'src'> = {
          ...Object.fromEntries(nbrs.map((key) => [key, 'src' as const])),
          [`${r},${c}`]: 'active',
        };
        steps.push({
          tag: 'count',
          trace: ['Cell (', A(r), ',', A(c), ') is ', wasLive ? B('live') : F('dead'), ' with ', A(live), ' live neighbour(s).'],
          state: view(mark),
        });
        if (wasLive && (live < 2 || live > 3)) {
          b[r][c] = 1;
          steps.push({
            tag: 'die',
            trace: [live < 2 ? 'Under-population' : 'Over-population', ' — it ', F('dies'), '. Stored as 01: still reads live to its neighbours this round.'],
            state: view({ [`${r},${c}`]: 'dim' }),
          });
        } else if (wasLive) {
          b[r][c] = 3;
          steps.push({
            tag: 'live',
            trace: ['Two or three live neighbours — it ', B('survives'), '. Stored as 11: live now and live next round.'],
            state: view({ [`${r},${c}`]: 'good' }),
          });
        } else if (!wasLive && live === 3) {
          b[r][c] = 2;
          steps.push({
            tag: 'born',
            trace: ['Exactly three live neighbours — a cell is ', B('born'), '. Stored as 10: still reads dead to its neighbours this round.'],
            state: view({ [`${r},${c}`]: 'good' }),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) b[r][c] >>= 1;
    steps.push({
      tag: 'shift',
      trace: ['Whole board scanned — now shift every cell right by one bit to reveal the ', C('next generation'), '.'],
      state: view({}, true),
    });
    const out = b.map((row) => row.map((v) => (v >= 1 ? 1 : 0)).join('')).join(';');
    steps.push({ tag: 'ret', trace: ['Next generation: ', C(out), '.'], state: view({}, true) });
    return { steps, result: out };
  },
  note: 'The trap is updating in place with a plain 0/1 board: a cell you already flipped would feed the wrong value to its later neighbours. Packing both generations into two bits of one integer keeps the read (bit 0) and the write (bit 1) independent, so the whole board updates simultaneously with no copy.',
  complexity: { time: 'O(R·C)', space: 'O(1)' },
  brute: {
    label: 'Copy the board',
    technique: 'Read neighbours from an untouched copy of the board while writing the next generation into the original.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void gameOfLife(vector<vector<int>>& b) {'),
        L('        auto old = b;', 'copy'),
        L('        int R = b.size(), C = b[0].size();'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) {', 'scan'),
        L('                int live = countLive(old, r, c);', 'count'),
        L('                if (old[r][c] && (live < 2 || live > 3)) b[r][c] = 0;', 'die'),
        L('                else if (!old[r][c] && live == 3) b[r][c] = 1;', 'born'),
        L('            }'),
        L('    }', 'ret'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void gameOfLife(int[][] b) {'),
        L('        int R = b.length, C = b[0].length;'),
        L('        int[][] old = new int[R][];', 'copy'),
        L('        for (int r = 0; r < R; r++) old[r] = b[r].clone();', 'copy'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++) {', 'scan'),
        L('                int live = countLive(old, r, c);', 'count'),
        L('                if (old[r][c] == 1 && (live < 2 || live > 3)) b[r][c] = 0;', 'die'),
        L('                else if (old[r][c] == 0 && live == 3) b[r][c] = 1;', 'born'),
        L('            }'),
        L('    }', 'ret'),
        L('}'),
      ],
    },
    run(values) {
      const raw = (values.grid ?? '')
        .split(/[;|]/)
        .map((r) => r.trim())
        .filter(Boolean);
      if (raw.length === 0) return { error: 'Enter a board, rows separated by ";".' };
      const w = raw[0].length;
      if (!raw.every((r) => r.length === w)) return { error: 'All rows must be the same length.' };
      if (raw.length > 6 || w > 6) return { error: 'Keep the board to at most 6×6 so every cell fits on screen.' };
      if (!raw.every((r) => /^[01]+$/.test(r))) return { error: 'Use only 0 and 1.' };

      const R = raw.length;
      const old = raw.map((r) => r.split('').map(Number));
      const b = old.map((r) => [...r]);
      const steps: Step[] = [];
      const view = (mark: MatrixState['mark'] = {}): MatrixState => ({
        grid: b.map((row) => row.map((v) => (v ? '●' : '·'))),
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(w)].map((_, i) => i),
        mark,
      });
      steps.push({ tag: 'copy', trace: ['Snapshot the board into ', A('old'), '. Neighbours are always counted from the snapshot, never from cells already updated.'], state: view() });
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < w; c++) {
          let live = 0;
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
              if (!dr && !dc) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < R && nc >= 0 && nc < w) live += old[nr][nc];
            }
          if (old[r][c] && (live < 2 || live > 3)) {
            b[r][c] = 0;
            steps.push({ tag: 'die', trace: ['(', A(r), ',', A(c), ') has ', A(live), ' live neighbours in the snapshot — it ', F('dies'), '.'], state: view({ [`${r},${c}`]: 'dim' }) });
          } else if (!old[r][c] && live === 3) {
            b[r][c] = 1;
            steps.push({ tag: 'born', trace: ['(', A(r), ',', A(c), ') has exactly ', A(3), ' live neighbours — it is ', B('born'), '.'], state: view({ [`${r},${c}`]: 'good' }) });
          } else {
            steps.push({ tag: 'count', trace: ['(', A(r), ',', A(c), ') has ', A(live), ' live neighbours — unchanged.'], state: view({ [`${r},${c}`]: 'active' }) });
          }
        }
      }
      const out = b.map((row) => row.join('')).join(';');
      steps.push({ tag: 'ret', trace: ['Next generation: ', C(out), '.'], state: view() });
      return { steps, result: out };
    },
    note: 'The copy makes the "update everything simultaneously" rule trivial to honour, at the cost of O(R·C) extra memory. The two-bit encoding stores old and new state in the same cell instead.',
    complexity: { time: 'O(R·C)', space: 'O(R·C)' },
  },
};

/* ================= Sort Characters By Frequency ================= */
const sortByFrequency: ProblemDef = {
  slug: 'sort-characters-by-frequency',
  title: 'Sort Characters By Frequency',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sort-characters-by-frequency/',
  technique: 'Count each character, then emit them most-frequent first.',
  widget: 'array',
  widgetTitle: 'Characters',
  inputs: [{ key: 's', label: 'String', defaultValue: 'tree', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string frequencySort(string s) {'),
      L('        unordered_map<char, int> cnt;'),
      L('        for (char c : s) cnt[c]++;', 'count'),
      L('        vector<pair<char,int>> v(cnt.begin(), cnt.end());'),
      L('        sort(v.begin(), v.end(), [](auto& a, auto& b) {', 'sort'),
      L('            return a.second > b.second;', 'sort'),
      L('        });'),
      L('        string res;'),
      L('        for (auto& [c, k] : v)', 'build'),
      L('            res.append(k, c);', 'build'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String frequencySort(String s) {'),
      L('        Map<Character, Integer> cnt = new HashMap<>();'),
      L('        for (char c : s.toCharArray())', 'count'),
      L('            cnt.merge(c, 1, Integer::sum);', 'count'),
      L('        List<Character> keys = new ArrayList<>(cnt.keySet());'),
      L('        keys.sort((a, b) -> cnt.get(b) - cnt.get(a));', 'sort'),
      L('        StringBuilder res = new StringBuilder();'),
      L('        for (char c : keys)', 'build'),
      L('            res.append(String.valueOf(c).repeat(cnt.get(c)));', 'build'),
      L('        return res.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^[A-Za-z0-9]{1,14}$/.test(s)) return { error: 'Use 1–14 letters or digits.' };
    const steps: Step[] = [];
    const cnt = new Map<string, number>();
    const chars = s.split('');
    const aggs = () => [{ label: 'counts', value: [...cnt.entries()].map(([c, k]) => `${c}:${k}`).join('  '), c: 'b' as const }];
    for (let i = 0; i < chars.length; i++) {
      cnt.set(chars[i], (cnt.get(chars[i]) ?? 0) + 1);
      steps.push({
        tag: 'count',
        trace: ["'", A(chars[i]), "' seen ", B(cnt.get(chars[i])!), ' time(s) so far.'],
        state: { arr: chars, mark: { [i]: 'active' }, ptrs: [{ name: 'i', i, c: 'a' }], aggs: aggs() },
      });
    }
    const entries = [...cnt.entries()].sort((x, y) => y[1] - x[1]);
    steps.push({
      tag: 'sort',
      trace: ['Order the distinct characters by count, highest first: ', B(entries.map(([c, k]) => `${c}×${k}`).join(', ')), '.'],
      state: { arr: entries.map(([c, k]) => `${c}×${k}`), mark: { 0: 'good' }, aggs: aggs() },
    });
    const out: string[] = [];
    for (const [c, k] of entries) {
      for (let i = 0; i < k; i++) out.push(c);
      steps.push({
        tag: 'build',
        trace: ["Emit '", A(c), "' ", A(k), ' time(s) — running result "', B(out.join('')), '".'],
        state: { arr: [...out], mark: Object.fromEntries(out.map((_, i) => [i, 'good' as const])), aggs: aggs() },
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Sorted by frequency: "', C(out.join('')), '".'],
      state: { arr: out, mark: Object.fromEntries(out.map((_, i) => [i, 'final' as const])) },
    });
    return { steps, result: out.join('') };
  },
  note: 'Any output that groups equal characters and orders groups by size is accepted, so ties need no tie-break. With a fixed alphabet you can skip the comparison sort entirely and bucket by count, which drops the whole thing to O(n).',
  complexity: { time: 'O(n + k log k)', space: 'O(k)' },
  brute: {
    label: 'Bucket sort',
    technique: 'Put each character into a bucket indexed by its count, then read buckets from the highest count down.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string frequencySort(string s) {'),
        L('        unordered_map<char, int> cnt;'),
        L('        for (char c : s) cnt[c]++;', 'count'),
        L('        vector<string> bucket(s.size() + 1);', 'bucket'),
        L('        for (auto& [c, k] : cnt) bucket[k] += c;', 'bucket'),
        L('        string res;'),
        L('        for (int k = s.size(); k >= 1; k--)', 'build'),
        L('            for (char c : bucket[k]) res.append(k, c);', 'build'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String frequencySort(String s) {'),
        L('        Map<Character, Integer> cnt = new HashMap<>();'),
        L('        for (char c : s.toCharArray()) cnt.merge(c, 1, Integer::sum);', 'count'),
        L('        List<List<Character>> bucket = new ArrayList<>();', 'bucket'),
        L('        for (int i = 0; i <= s.length(); i++) bucket.add(new ArrayList<>());', 'bucket'),
        L('        for (var e : cnt.entrySet()) bucket.get(e.getValue()).add(e.getKey());', 'bucket'),
        L('        StringBuilder res = new StringBuilder();'),
        L('        for (int k = s.length(); k >= 1; k--)', 'build'),
        L('            for (char c : bucket.get(k)) res.append(String.valueOf(c).repeat(k));', 'build'),
        L('        return res.toString();', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      if (!/^[A-Za-z0-9]{1,14}$/.test(s)) return { error: 'Use 1–14 letters or digits.' };
      const steps: Step[] = [];
      const cnt = new Map<string, number>();
      for (const ch of s) cnt.set(ch, (cnt.get(ch) ?? 0) + 1);
      const counts = [...cnt.entries()].map(([c, k]) => `${c}:${k}`).join('  ');
      steps.push({
        tag: 'count',
        trace: ['Count every character: ', A(counts), '.'],
        state: { arr: s.split(''), aggs: [{ label: 'counts', value: counts, c: 'b' }] },
      });
      const bucket: string[][] = Array.from({ length: s.length + 1 }, () => []);
      for (const [c, k] of cnt) bucket[k].push(c);
      const shown = bucket.map((b, k) => (b.length ? `${k}:[${b.join('')}]` : '')).filter(Boolean).join('  ');
      steps.push({
        tag: 'bucket',
        trace: ['Drop each character in the bucket for its count — no comparison sort needed: ', B(shown), '.'],
        state: { arr: s.split(''), aggs: [{ label: 'buckets', value: shown, c: 'b' }] },
      });
      const out: string[] = [];
      for (let k = s.length; k >= 1; k--) {
        for (const c of bucket[k]) {
          for (let i = 0; i < k; i++) out.push(c);
          steps.push({
            tag: 'build',
            trace: ["Bucket ", A(k), ": emit '", A(c), "' ", A(k), ' time(s) — running result "', B(out.join('')), '".'],
            state: { arr: [...out], mark: Object.fromEntries(out.map((_, i) => [i, 'good' as const])), aggs: [{ label: 'buckets', value: shown, c: 'b' }] },
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['Sorted by frequency: "', C(out.join('')), '".'],
        state: { arr: out, mark: Object.fromEntries(out.map((_, i) => [i, 'final' as const])) },
      });
      return { steps, result: out.join('') };
    },
    note: 'Counts can never exceed n, so they work as bucket indices and replace the comparison sort. Walking buckets from n down to 1 emits the characters in frequency order in O(n) total.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

export const arraysHashing3: ProblemDef[] = [
  nextPermutation,
  pascalsTriangle,
  majorityII,
  mergeSortedArray,
  findDuplicate,
  firstMissingPositive,
  reversePairs,
  contiguousArray,
  subarrayDivK,
  largestNumber,
  findAllDuplicates,
  gameOfLife,
  sortByFrequency,
];
