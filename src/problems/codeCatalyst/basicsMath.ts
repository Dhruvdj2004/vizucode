// Code Catalyst — Practice Set 1 warm-ups: small number problems.
import type { BinarySearchState, BitsState, ProblemDef, Step } from '../../lib/types';
import { parseInt1 } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { ag, arr, fmtS } from './util';

const toBits = (n: number, w: number): (0 | 1)[] => n.toString(2).padStart(w, '0').split('').map((c) => (c === '1' ? 1 : 0));

/* ================= Number of Steps to Reduce a Number to Zero ================= */
const numberOfSteps: ProblemDef = {
  slug: 'number-of-steps-to-reduce-a-number-to-zero',
  title: 'Number of Steps to Reduce a Number to Zero',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/',
  technique: 'Simulate: halve when even, subtract one when odd — in binary that is "drop the last bit" or "clear the last bit".',
  widget: 'bits',
  widgetTitle: 'num in binary',
  inputs: [{ key: 'num', label: 'num', defaultValue: '14' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int numberOfSteps(int num) {'),
      L('        int steps = 0;', 'init'),
      L('        while (num > 0) {', 'loop'),
      L('            if (num % 2 == 0) num /= 2;', 'even'),
      L('            else num -= 1;', 'odd'),
      L('            steps++;', 'even', 'odd'),
      L('        }'),
      L('        return steps;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int numberOfSteps(int num) {'),
      L('        int steps = 0;', 'init'),
      L('        while (num > 0) {', 'loop'),
      L('            if (num % 2 == 0) num /= 2;', 'even'),
      L('            else num -= 1;', 'odd'),
      L('            steps++;', 'even', 'odd'),
      L('        }'),
      L('        return steps;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const num = parseInt1(values.num, 'num', { min: 0, max: 100000 });
    if (typeof num === 'string') return { error: num };
    const w = Math.max(1, num.toString(2).length);
    let n = num;
    let steps = 0;
    const out: Step[] = [];
    const st = (hl?: number[]): BitsState => ({
      rows: [{ label: `num = ${n}`, bits: toBits(n, w), c: 'a', hl }],
      aggs: [ag('steps', steps, 'c')],
    });
    out.push({ tag: 'init', trace: ['Start with num = ', A(num), '. Count how many moves it takes to reach 0.'], state: st() });
    while (n > 0) {
      if (n % 2 === 0) {
        const before = n;
        n = n / 2;
        steps++;
        out.push({ tag: 'even', trace: [A(before), ' is even, so halve it to ', B(n), '. In binary that just drops the last 0.'], state: st([w - 1]) });
      } else {
        const before = n;
        n -= 1;
        steps++;
        out.push({ tag: 'odd', trace: [A(before), ' is odd, so subtract 1 to get ', B(n), '. In binary that clears the last 1.'], state: st([w - 1]) });
      }
    }
    out.push({ tag: 'ret', trace: ['num hit 0 after ', C(steps), ' steps.'], state: st() });
    return { steps: out, result: String(steps) };
  },
  note: 'Each 1-bit costs two moves (clear it, then shift) except the leading one, and each 0-bit costs one shift. So the answer is just (number of bits) + (number of 1s) − 1 — the simulation is that formula played out.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

/* ================= Subtract the Product and Sum of Digits ================= */
const subtractProductSum: ProblemDef = {
  slug: 'subtract-the-product-and-sum-of-digits-of-an-integer',
  title: 'Subtract the Product and Sum of Digits of an Integer',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/subtract-the-product-and-sum-of-digits-of-an-integer/',
  technique: 'Peel digits off the right with % 10 and / 10, keeping a running product and sum.',
  widget: 'array',
  widgetTitle: 'Digits of n',
  inputs: [{ key: 'n', label: 'n', defaultValue: '234' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int subtractProductAndSum(int n) {'),
      L('        int prod = 1, sum = 0;', 'init'),
      L('        while (n > 0) {', 'digit'),
      L('            int d = n % 10;', 'digit'),
      L('            prod *= d; sum += d;', 'digit'),
      L('            n /= 10;', 'digit'),
      L('        }'),
      L('        return prod - sum;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int subtractProductAndSum(int n) {'),
      L('        int prod = 1, sum = 0;', 'init'),
      L('        while (n > 0) {', 'digit'),
      L('            int d = n % 10;', 'digit'),
      L('            prod *= d; sum += d;', 'digit'),
      L('            n /= 10;', 'digit'),
      L('        }'),
      L('        return prod - sum;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 100000 });
    if (typeof n === 'string') return { error: n };
    const digits = String(n).split('').map(Number);
    let prod = 1;
    let sum = 0;
    const out: Step[] = [];
    const st = (mark: Record<number, 'active' | 'good'>) => arr(digits, { mark, aggs: [ag('product', prod, 'a'), ag('sum', sum, 'b')] });
    out.push({ tag: 'init', trace: ['Start with product = ', A(1), ' (multiplying by 1 changes nothing) and sum = ', B(0), '.'], state: st({}) });
    const done: Record<number, 'active' | 'good'> = {};
    for (let i = digits.length - 1; i >= 0; i--) {
      const d = digits[i];
      prod *= d;
      sum += d;
      out.push({ tag: 'digit', trace: ['n % 10 gives the last digit ', A(d), '. Product becomes ', A(prod), ', sum becomes ', B(sum), '. Then n / 10 drops it.'], state: st({ ...done, [i]: 'active' }) });
      done[i] = 'good';
    }
    out.push({ tag: 'ret', trace: ['Answer = ', A(prod), ' − ', B(sum), ' = ', C(prod - sum), '.'], state: st(done) });
    return { steps: out, result: String(prod - sum) };
  },
  note: 'n % 10 always hands you the last digit and n / 10 throws it away, so one loop visits every digit exactly once. Order does not matter for a product or a sum, so reading right-to-left is fine.',
  complexity: { time: 'O(digits)', space: 'O(1)' },
};

/* ================= Count Odd Numbers in an Interval Range ================= */
const countOdds: ProblemDef = {
  slug: 'count-odd-numbers-in-an-interval-range',
  title: 'Count Odd Numbers in an Interval Range',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/count-odd-numbers-in-an-interval-range/',
  technique: 'Odds in [0, x] = (x + 1) / 2, so odds in [low, high] = (high + 1) / 2 − low / 2.',
  widget: 'array',
  widgetTitle: 'Numbers from low to high',
  inputs: [
    { key: 'low', label: 'low', defaultValue: '3' },
    { key: 'high', label: 'high', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countOdds(int low, int high) {'),
      L('        int upToHigh = (high + 1) / 2;', 'high'),
      L('        int belowLow = low / 2;', 'low'),
      L('        return upToHigh - belowLow;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countOdds(int low, int high) {'),
      L('        int upToHigh = (high + 1) / 2;', 'high'),
      L('        int belowLow = low / 2;', 'low'),
      L('        return upToHigh - belowLow;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const low = parseInt1(values.low, 'low', { min: 0, max: 1000000 });
    if (typeof low === 'string') return { error: low };
    const high = parseInt1(values.high, 'high', { min: 0, max: 1000000 });
    if (typeof high === 'string') return { error: high };
    if (low > high) return { error: 'low must be ≤ high.' };
    const showAll = high - low <= 15;
    const nums = showAll ? Array.from({ length: high - low + 1 }, (_, i) => low + i) : [low, '…', high];
    const oddMarks: Record<number, 'good' | 'dim'> = {};
    if (showAll) nums.forEach((v, i) => (oddMarks[i] = (v as number) % 2 ? 'good' : 'dim'));
    const a = Math.floor((high + 1) / 2);
    const b = Math.floor(low / 2);
    const out: Step[] = [
      { tag: 'high', trace: ['Odd numbers from 0 up to ', A(high), ': there are (', A(high), ' + 1) / 2 = ', B(a), ' of them.'], state: arr(nums, { aggs: [ag('odds ≤ high', a, 'b')] }) },
      { tag: 'low', trace: ['Odd numbers strictly below ', A(low), ': ', A(low), ' / 2 = ', F(b), '. Those are outside the range.'], state: arr(nums, { aggs: [ag('odds ≤ high', a, 'b'), ag('odds < low', b, 'a')] }) },
      { tag: 'ret', trace: ['Subtract: ', B(a), ' − ', F(b), ' = ', C(a - b), ` odd numbers in [${low}, ${high}].`], state: arr(nums, { mark: oddMarks, aggs: [ag('answer', a - b, 'c')] }) },
    ];
    return { steps: out, result: String(a - b) };
  },
  note: 'Counting is "everything up to high" minus "everything before low" — the same prefix-count trick as prefix sums. Every pair of consecutive numbers has exactly one odd, which is where the / 2 comes from.',
  complexity: { time: 'O(1)', space: 'O(1)' },
};

/* ================= Valid Perfect Square ================= */
const validPerfectSquare: ProblemDef = {
  slug: 'valid-perfect-square',
  title: 'Valid Perfect Square',
  category: 'Binary Search',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/valid-perfect-square/',
  technique: 'Binary search for an integer x with x × x == num — squares grow in order, so halving works.',
  widget: 'binary-search',
  widgetTitle: 'Candidate roots',
  inputs: [{ key: 'num', label: 'num', defaultValue: '16' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isPerfectSquare(int num) {'),
      L('        long lo = 1, hi = num;', 'init'),
      L('        while (lo <= hi) {', 'mid'),
      L('            long mid = lo + (hi - lo) / 2;', 'mid'),
      L('            long sq = mid * mid;', 'mid'),
      L('            if (sq == num) return true;', 'hit'),
      L('            if (sq < num) lo = mid + 1;', 'low'),
      L('            else hi = mid - 1;', 'high'),
      L('        }'),
      L('        return false;', 'miss'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isPerfectSquare(int num) {'),
      L('        long lo = 1, hi = num;', 'init'),
      L('        while (lo <= hi) {', 'mid'),
      L('            long mid = lo + (hi - lo) / 2;', 'mid'),
      L('            long sq = mid * mid;', 'mid'),
      L('            if (sq == num) return true;', 'hit'),
      L('            if (sq < num) lo = mid + 1;', 'low'),
      L('            else hi = mid - 1;', 'high'),
      L('        }'),
      L('        return false;', 'miss'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const num = parseInt1(values.num, 'num', { min: 1, max: 2147483647 });
    if (typeof num === 'string') return { error: num };
    let lo = 1;
    let hi = num;
    const out: Step[] = [];
    const st = (mid?: number, probe?: BinarySearchState['probe'], best: number | null = null): BinarySearchState => ({
      mode: 'answer', lo, hi, mid, domain: [1, num], domainLabel: 'x', probe, best,
    });
    out.push({ tag: 'init', trace: ['The root, if it exists, is somewhere in [', A(1), ', ', A(num), '].'], state: st() });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const sq = mid * mid;
      if (sq === num) {
        out.push({ tag: 'hit', trace: [A(mid), ' × ', A(mid), ' = ', C(sq), ' — exactly num, so it is a perfect square.'], state: st(mid, { text: `${mid}² = ${sq}`, verdict: 'yes', verdictText: 'match' }, mid) });
        return { steps: out, result: 'true' };
      }
      if (sq < num) {
        out.push({ tag: 'low', trace: [A(mid), '² = ', F(sq), ' is too small. Any root must be bigger, so lo = ', B(mid + 1), '.'], state: st(mid, { text: `${mid}² = ${sq} < ${num}`, verdict: 'no', verdictText: 'too small' }) });
        lo = mid + 1;
      } else {
        out.push({ tag: 'high', trace: [A(mid), '² = ', F(sq), ' is too big. Any root must be smaller, so hi = ', B(mid - 1), '.'], state: st(mid, { text: `${mid}² = ${sq} > ${num}`, verdict: 'no', verdictText: 'too big' }) });
        hi = mid - 1;
      }
    }
    out.push({ tag: 'miss', trace: ['lo passed hi without an exact square, so ', C('false'), '.'], state: st() });
    return { steps: out, result: 'false' };
  },
  note: 'x² only ever grows as x grows, so comparing mid² with num tells you which half the root must be in. That turns an O(√n) scan into O(log n) checks without ever calling sqrt.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

/* ================= Power of Two ================= */
const powerOfTwo: ProblemDef = {
  slug: 'power-of-two',
  title: 'Power of Two',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/power-of-two/',
  technique: 'A power of two has exactly one 1-bit, so n & (n − 1) clears it and leaves 0.',
  widget: 'bits',
  widgetTitle: 'n and n − 1 in binary',
  inputs: [{ key: 'n', label: 'n', defaultValue: '16' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isPowerOfTwo(int n) {'),
      L('        if (n <= 0) return false;', 'neg'),
      L('        return (n & (n - 1)) == 0;', 'and'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isPowerOfTwo(int n) {'),
      L('        if (n <= 0) return false;', 'neg'),
      L('        return (n & (n - 1)) == 0;', 'and'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: -1000000, max: 1073741824 });
    if (typeof n === 'string') return { error: n };
    if (n <= 0) {
      return {
        steps: [{ tag: 'neg', trace: [A(n), ' is not positive, and every power of two is ≥ 1. Answer: ', C('false'), '.'], state: { rows: [{ label: 'n', bits: [String(n)] }] } as BitsState }],
        result: 'false',
      };
    }
    const w = n.toString(2).length;
    const a = n & (n - 1);
    const ones = n.toString(2).split('').filter((c) => c === '1').length;
    const st = (withAnd: boolean): BitsState => ({
      rows: [
        { label: 'n', bits: toBits(n, w), c: 'a' },
        { label: 'n − 1', bits: toBits(n - 1, w), c: 'b' },
        ...(withAnd ? [{ label: 'n & (n−1)', bits: toBits(a, w), c: 'c' as const }] : []),
      ],
      aggs: [ag('1-bits in n', ones)],
    });
    const out: Step[] = [
      { tag: 'neg', trace: [A(n), ' is positive, so keep going.'], state: st(false) },
      { tag: 'and', trace: ['Subtracting 1 flips the lowest 1-bit and every 0 below it. AND-ing with n wipes out that lowest 1.'], state: st(false) },
      {
        tag: 'and',
        trace: a === 0
          ? ['n & (n − 1) = ', C(0), ': n had only one 1-bit, so it is a power of two → ', C('true'), '.']
          : ['n & (n − 1) = ', F(a), ', not 0: n had more than one 1-bit → ', C('false'), '.'],
        state: st(true),
      },
    ];
    return { steps: out, result: a === 0 ? 'true' : 'false' };
  },
  note: 'Powers of two are 1, 10, 100, 1000… in binary — a single 1. n & (n − 1) removes the lowest 1-bit, so the result is zero exactly when there was only one to remove.',
  complexity: { time: 'O(1)', space: 'O(1)' },
};

/* ================= Fizz Buzz ================= */
const fizzBuzz: ProblemDef = {
  slug: 'fizz-buzz',
  title: 'Fizz Buzz',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/fizz-buzz/',
  technique: 'Check divisibility by 15 first, then 3, then 5 — the order of the checks is the whole trick.',
  widget: 'array',
  widgetTitle: 'answer[]',
  inputs: [{ key: 'n', label: 'n', defaultValue: '15' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<string> fizzBuzz(int n) {'),
      L('        vector<string> ans;'),
      L('        for (int i = 1; i <= n; i++) {'),
      L('            if (i % 15 == 0) ans.push_back("FizzBuzz");', 'fb'),
      L('            else if (i % 3 == 0) ans.push_back("Fizz");', 'f'),
      L('            else if (i % 5 == 0) ans.push_back("Buzz");', 'b'),
      L('            else ans.push_back(to_string(i));', 'num'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<String> fizzBuzz(int n) {'),
      L('        List<String> ans = new ArrayList<>();'),
      L('        for (int i = 1; i <= n; i++) {'),
      L('            if (i % 15 == 0) ans.add("FizzBuzz");', 'fb'),
      L('            else if (i % 3 == 0) ans.add("Fizz");', 'f'),
      L('            else if (i % 5 == 0) ans.add("Buzz");', 'b'),
      L('            else ans.add(String.valueOf(i));', 'num'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 20 });
    if (typeof n === 'string') return { error: n };
    const ans: string[] = [];
    const out: Step[] = [];
    for (let i = 1; i <= n; i++) {
      let tag: string;
      let why: string;
      if (i % 15 === 0) { ans.push('FizzBuzz'); tag = 'fb'; why = 'divisible by both 3 and 5 (so by 15)'; }
      else if (i % 3 === 0) { ans.push('Fizz'); tag = 'f'; why = 'divisible by 3'; }
      else if (i % 5 === 0) { ans.push('Buzz'); tag = 'b'; why = 'divisible by 5'; }
      else { ans.push(String(i)); tag = 'num'; why = 'not divisible by 3 or 5'; }
      out.push({ tag, trace: [A(i), ' is ', why, ' → write ', B(ans[i - 1]), '.'], state: arr([...ans], { mark: { [i - 1]: 'active' } }) });
    }
    out.push({ tag: 'ret', trace: ['Filled all ', C(n), ' slots.'], state: arr(ans) });
    return { steps: out, result: fmtS(ans) };
  },
  note: 'Test 15 before 3 and 5: a number like 15 passes all three checks, and only the first matching branch runs. Getting that order wrong is the classic bug.',
  complexity: { time: 'O(n)', space: 'O(1) beyond output' },
};

export const ccBasicsMath: ProblemDef[] = [numberOfSteps, subtractProductSum, countOdds, validPerfectSquare, powerOfTwo, fizzBuzz];
