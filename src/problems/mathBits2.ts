// Math & Bit Manipulation, part 2 — Striver SDE / Love Babbar sheet staples.
import type { ArrayState, BitsState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;
const toBits = (n: number, width: number): (0 | 1)[] => [...Array(width)].map((_, i) => ((n >>> (width - 1 - i)) & 1) as 0 | 1);

/* ================= Single Number II ================= */
const singleNumberII: ProblemDef = {
  slug: 'single-number-ii',
  title: 'Single Number II',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/single-number-ii/',
  technique: 'Track two accumulators that model each bit cycling through counts 0 → 1 → 2 → 0.',
  widget: 'bits',
  widgetTitle: 'ones / twos accumulators',
  inputs: [{ key: 'nums', label: 'Array (all triples but one)', defaultValue: '2, 2, 3, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int singleNumber(vector<int>& nums) {'),
      L('        int ones = 0, twos = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            ones = (ones ^ x) & ~twos;', 'ones'),
      L('            twos = (twos ^ x) & ~ones;', 'twos'),
      L('        }'),
      L('        return ones;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int singleNumber(int[] nums) {'),
      L('        int ones = 0, twos = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            ones = (ones ^ x) & ~twos;', 'ones'),
      L('            twos = (twos ^ x) & ~ones;', 'twos'),
      L('        }'),
      L('        return ones;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 255, maxLen: 10 });
    if (typeof nums === 'string') return { error: nums };
    const counts = new Map<number, number>();
    for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
    const singles = [...counts.entries()].filter(([, c]) => c % 3 !== 0);
    if (singles.length !== 1 || singles[0][1] % 3 !== 1) return { error: 'Every value must appear exactly three times, except one that appears once.' };
    const width = 8;
    const steps: Step[] = [];
    let ones = 0;
    let twos = 0;
    const view = (x: number | null): BitsState => ({
      rows: [
        ...(x !== null ? [{ label: `x = ${x}`, bits: toBits(x, width), c: 'a' as const }] : []),
        { label: `ones = ${ones}`, bits: toBits(ones, width), c: 'b' as const },
        { label: `twos = ${twos}`, bits: toBits(twos, width), c: 'c' as const },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Each bit of a repeated-3-times value must cancel out. Model every bit position as a tiny counter cycling ', A('0 → 1 → 2 → 0'), ' — ',
        B('ones'), ' holds the bits currently at count 1, ', C('twos'), ' the bits at count 2.',
      ],
      state: view(null),
    });
    for (const x of nums) {
      const prevOnes = ones;
      ones = (ones ^ x) & ~twos;
      twos = (twos ^ x) & ~ones;
      steps.push({
        tag: 'ones',
        trace: [
          'XOR ', A(x), ' into ones (toggles bits at count 0↔1), then mask out any bit already in twos — that bit is mid-cycle and must not re-enter ones. ones: ',
          F(prevOnes), ' → ', B(ones), '.',
        ],
        state: view(x),
      });
      steps.push({
        tag: 'twos',
        trace: ['Symmetrically fold x into twos, masking out whatever ones just claimed — twos: ', C(twos), '.'],
        state: view(x),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['After every triple cancels, only the lone survivor remains in ones: ', C(ones), '.'], state: view(null) });
    return { steps, result: String(ones) };
  },
  note: 'Each bit position runs through the same 3-state cycle independently, so ones ends up holding exactly the bits of whichever value did not appear a multiple of three times. The general k-times version replaces the two accumulators with k−1 of them, using the same masking pattern.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Count each bit mod 3',
    technique: 'For every bit position, count how many numbers have it set; tripled values contribute multiples of 3, so count % 3 is the loner’s bit.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int singleNumber(vector<int>& nums) {'),
        L('        int res = 0;', 'init'),
        L('        for (int b = 0; b < 32; b++) {', 'bit'),
        L('            int cnt = 0;', 'bit'),
        L('            for (int x : nums) cnt += (x >> b) & 1;', 'bit'),
        L('            if (cnt % 3) res |= 1 << b;', 'bit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int singleNumber(int[] nums) {'),
        L('        int res = 0;', 'init'),
        L('        for (int b = 0; b < 32; b++) {', 'bit'),
        L('            int cnt = 0;', 'bit'),
        L('            for (int x : nums) cnt += (x >> b) & 1;', 'bit'),
        L('            if (cnt % 3 != 0) res |= 1 << b;', 'bit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, max: 255, maxLen: 10 });
      if (typeof nums === 'string') return { error: nums };
      const counts = new Map<number, number>();
      for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
      const singles = [...counts.entries()].filter(([, c]) => c % 3 !== 0);
      if (singles.length !== 1 || singles[0][1] % 3 !== 1) return { error: 'Every value must appear exactly three times, except one that appears once.' };
      const width = 8;
      let res = 0;
      const steps: Step[] = [];
      const view = (b?: number, cnt?: number): BitsState => ({
        rows: [
          ...nums.map((x) => ({ label: String(x), bits: toBits(x, width), c: 'a' as const, hl: b !== undefined ? [width - 1 - b] : [] })),
          { label: `result = ${res}`, bits: toBits(res, width), c: 'c' as const, hl: b !== undefined ? [width - 1 - b] : [] },
        ],
        aggs: cnt !== undefined ? [{ label: 'ones in this column', value: String(cnt), c: 'b' }] : [],
      });
      steps.push({ tag: 'init', trace: ['Work column by column: in every bit position, the tripled values add a multiple of 3.'], state: view() });
      for (let b = 0; b < width; b++) {
        const cnt = nums.reduce((acc, x) => acc + ((x >> b) & 1), 0);
        if (cnt % 3) res |= 1 << b;
        steps.push({ tag: 'bit', trace: ['Bit ', A(b), ': ', A(cnt), ' one(s); ', A(cnt), ' mod 3 = ', cnt % 3 ? B(1) : F(0), ' → the loner’s bit is ', cnt % 3 ? B('1') : F('0'), '.'], state: view(b, cnt) });
      }
      steps.push({ tag: 'ret', trace: ['The loner is ', C(res), '.'], state: view() });
      return { steps, result: String(res) };
    },
    note: 'Easy to prove and O(1) space, but it makes 32 passes over the array. The ones/twos state machine performs the same mod-3 counting for all bits at once in a single pass.',
    complexity: { time: 'O(32 · n)', space: 'O(1)' },
  },
};

/* ================= Single Number III ================= */
const singleNumberIII: ProblemDef = {
  slug: 'single-number-iii',
  title: 'Single Number III',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/single-number-iii/',
  technique: 'XOR everything, then split the array by any bit where the two answers differ.',
  widget: 'bits',
  widgetTitle: 'Combined XOR & the splitting bit',
  inputs: [{ key: 'nums', label: 'Array (all pairs but two)', defaultValue: '1, 2, 1, 3, 2, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> singleNumber(vector<int>& nums) {'),
      L('        int xorAll = 0;', 'init'),
      L('        for (int x : nums) xorAll ^= x;', 'init'),
      L('        int bit = xorAll & (-xorAll);', 'lowbit'),
      L('        int a = 0, b = 0;'),
      L('        for (int x : nums)', 'split'),
      L('            (x & bit) ? a ^= x : b ^= x;', 'split'),
      L('        return {a, b};', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] singleNumber(int[] nums) {'),
      L('        int xorAll = 0;', 'init'),
      L('        for (int x : nums) xorAll ^= x;', 'init'),
      L('        int bit = xorAll & (-xorAll);', 'lowbit'),
      L('        int a = 0, b = 0;'),
      L('        for (int x : nums)', 'split'),
      L('            if ((x & bit) != 0) a ^= x; else b ^= x;', 'split'),
      L('        return new int[]{a, b};', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 127, maxLen: 10 });
    if (typeof nums === 'string') return { error: nums };
    const counts = new Map<number, number>();
    for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
    const singles = [...counts.entries()].filter(([, c]) => c % 2 === 1);
    if (singles.length !== 2) return { error: 'Exactly two values must appear an odd number of times.' };
    const width = 8;
    const steps: Step[] = [];
    let xorAll = 0;
    const view = (x: number | null, extra?: { label: string; value: string; c: 'a' | 'b' | 'c' }[]): BitsState => ({
      rows: [
        ...(x !== null ? [{ label: `x = ${x}`, bits: toBits(x, width), c: 'a' as const }] : []),
        { label: `xorAll = ${xorAll}`, bits: toBits(xorAll, width), c: 'b' as const },
      ],
      aggs: extra,
    });
    steps.push({
      tag: 'init',
      trace: ['XOR everything: pairs cancel, leaving ', A('a ⊕ b'), ' where a and b are the two lone survivors.'],
      state: view(null),
    });
    for (const x of nums) {
      xorAll ^= x;
      steps.push({ tag: 'init', trace: ['XOR in ', A(x), ' — running total ', B(xorAll), '.'], state: view(x) });
    }
    const bit = xorAll & -xorAll;
    steps.push({
      tag: 'lowbit',
      trace: [
        'a ≠ b, so ', A('xorAll'), ' has at least one set bit — pick its ', B('lowest'), ' one with ', B('xorAll & −xorAll'), '. That bit differs between a and b, so it cleanly separates them.',
      ],
      state: view(null, [{ label: 'splitting bit', value: String(bit), c: 'c' }]),
    });
    let a = 0;
    let b = 0;
    for (const x of nums) {
      if (x & bit) {
        a ^= x;
        steps.push({ tag: 'split', trace: [A(x), ' has that bit set — XOR it into group ', B('a'), ': ', B(a), '.'], state: view(x, [{ label: 'a', value: String(a), c: 'b' }]) });
      } else {
        b ^= x;
        steps.push({ tag: 'split', trace: [A(x), " doesn't have that bit — XOR it into group ", C('b'), ': ', C(b), '.'], state: view(x, [{ label: 'b', value: String(b), c: 'c' }]) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Every other value is in a pair and lands in the same group both times, cancelling — leaving ', C(a), ' and ', C(b), '.'],
      state: view(null, [{ label: 'answer', value: `${a}, ${b}`, c: 'c' }]),
    });
    return { steps, result: `[${a}, ${b}]` };
  },
  note: 'The splitting bit works because a and b differ there by definition of XOR, so it partitions the array into two groups each containing exactly one of them plus complete pairs. Any set bit of xorAll would work — isolating the lowest one is just the simplest to compute.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash count',
    technique: 'Count every value; the two values seen an odd number of times are the answer.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> singleNumber(vector<int>& nums) {'),
        L('        unordered_map<int, int> cnt;', 'init'),
        L('        for (int x : nums) cnt[x]++;', 'count'),
        L('        vector<int> res;', 'ret'),
        L('        for (auto& [v, c] : cnt) if (c % 2) res.push_back(v);', 'ret'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] singleNumber(int[] nums) {'),
        L('        Map<Integer, Integer> cnt = new HashMap<>();', 'init'),
        L('        for (int x : nums) cnt.merge(x, 1, Integer::sum);', 'count'),
        L('        return cnt.entrySet().stream().filter(e -> e.getValue() % 2 == 1)', 'ret'),
        L('                  .mapToInt(Map.Entry::getKey).toArray();', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const nums = parseIntArray(values.nums, { min: 0, max: 127, maxLen: 10 });
      if (typeof nums === 'string') return { error: nums };
      const counts = new Map<number, number>();
      for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
      if ([...counts.values()].filter((c) => c % 2 === 1).length !== 2) return { error: 'Exactly two values must appear an odd number of times.' };
      const width = 8;
      const seen = new Map<number, number>();
      const steps: Step[] = [];
      const view = (hl?: number): BitsState => ({
        rows: [...seen.entries()].map(([v, c]) => ({ label: `${v} seen ×${c}`, bits: toBits(v, width), c: v === hl ? ('a' as const) : c % 2 ? ('b' as const) : ('c' as const) })),
        aggs: [{ label: 'distinct values stored', value: String(seen.size), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No XOR split: count every value in a hash map.'], state: view() });
      for (const x of nums) {
        seen.set(x, (seen.get(x) ?? 0) + 1);
        steps.push({ tag: 'count', trace: ['Seen ', A(x), ' — count ', A(seen.get(x)!), '.'], state: view(x) });
      }
      const res = [...seen.entries()].filter(([, c]) => c % 2 === 1).map(([v]) => v);
      steps.push({ tag: 'ret', trace: [C(res.join(' and ')), ' have odd counts.'], state: view() });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'O(n) time but O(n) space for the map. XORing everything and splitting on a bit where the two answers differ finds both with two integers.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= Divide Two Integers ================= */
const divideIntegers: ProblemDef = {
  slug: 'divide-two-integers',
  title: 'Divide Two Integers',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/divide-two-integers/',
  technique: 'Subtract the largest doubling of the divisor that still fits, shift by shift.',
  widget: 'array',
  widgetTitle: 'Remaining dividend',
  inputs: [
    { key: 'a', label: 'Dividend', defaultValue: '43' },
    { key: 'b', label: 'Divisor', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int divide(int a, int b) {'),
      L('        if (a == INT_MIN && b == -1) return INT_MAX;', 'overflow'),
      L('        long dvd = labs(a), dvs = labs(b), q = 0;', 'init'),
      L('        while (dvd >= dvs) {', 'outer'),
      L('            long t = dvs, m = 1;'),
      L('            while (t << 1 <= dvd) { t <<= 1; m <<= 1; }', 'grow'),
      L('            dvd -= t; q += m;', 'subtract'),
      L('        }'),
      L('        return (a < 0) == (b < 0) ? q : -q;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int divide(int a, int b) {'),
      L('        if (a == Integer.MIN_VALUE && b == -1) return Integer.MAX_VALUE;', 'overflow'),
      L('        long dvd = Math.abs((long) a), dvs = Math.abs((long) b), q = 0;', 'init'),
      L('        while (dvd >= dvs) {', 'outer'),
      L('            long t = dvs, m = 1;'),
      L('            while (t << 1 <= dvd) { t <<= 1; m <<= 1; }', 'grow'),
      L('            dvd -= t; q += m;', 'subtract'),
      L('        }'),
      L('        return (a < 0) == (b < 0) ? (int) q : (int) -q;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseInt1(values.a, 'Dividend', { min: -1000, max: 1000 });
    if (typeof a === 'string') return { error: a };
    const b = parseInt1(values.b, 'Divisor', { min: -1000, max: 1000 });
    if (typeof b === 'string') return { error: b };
    if (b === 0) return { error: 'Divisor cannot be 0.' };
    const steps: Step[] = [];
    let dvd = Math.abs(a);
    let dvs = Math.abs(b);
    let q = 0;
    const st = (note: string): ArrayState => ({
      arr: [dvd],
      aggs: [
        { label: 'quotient so far', value: String(q), c: 'c' },
        { label: 'step', value: note, c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Repeated subtraction is O(quotient) and too slow. Instead subtract the ', A('largest doubling'), ' of the divisor that still fits — like long division in binary.',
      ],
      state: st(`|${a}| ÷ |${b}|`),
    });
    while (dvd >= dvs) {
      let t = dvs;
      let m = 1;
      steps.push({ tag: 'outer', trace: ['Remaining: ', A(dvd), '. Find how far ', A(dvs), ' can double while staying ≤ it.'], state: st('doubling') });
      while (t * 2 <= dvd) {
        t *= 2;
        m *= 2;
        steps.push({ tag: 'grow', trace: ['Double: ', B(t), ' still fits (× ', B(m), ' the divisor).'], state: st('doubling') });
        if (steps.length > MAX_STEPS) break;
      }
      dvd -= t;
      q += m;
      steps.push({
        tag: 'subtract',
        trace: ['Subtract ', B(t), ' (', B(m), ' divisor-lengths at once) — remaining ', C(dvd), ', quotient so far ', C(q), '.'],
        state: st('subtracted'),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const sign = (a < 0) === (b < 0) ? 1 : -1;
    const ans = sign * q;
    steps.push({ tag: 'ret', trace: ['Magnitude ', C(q), ', sign ', C(sign > 0 ? '+' : '-'), ' — result ', C(ans), '.'], state: st('done') });
    return { steps, result: String(ans) };
  },
  note: 'Doubling the divisor before each subtraction is what turns O(quotient) repeated subtraction into O(log quotient) — each outer iteration removes at least half of what remains, the same idea as binary search. The INT_MIN / −1 overflow case is the one edge case worth remembering even though this visualizer works in plain numbers.',
  complexity: { time: 'O(log² (dividend))', space: 'O(1)' },
  brute: {
    label: 'Repeated subtraction',
    technique: 'Subtract the divisor from the dividend one copy at a time, counting how many times it fits.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int divide(int a, int b) {'),
        L('        long dvd = labs(a), dvs = labs(b), q = 0;', 'init'),
        L('        while (dvd >= dvs) {', 'subtract'),
        L('            dvd -= dvs;', 'subtract'),
        L('            q++;', 'subtract'),
        L('        }'),
        L('        return (a < 0) == (b < 0) ? q : -q;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int divide(int a, int b) {'),
        L('        long dvd = Math.abs((long) a), dvs = Math.abs((long) b), q = 0;', 'init'),
        L('        while (dvd >= dvs) {', 'subtract'),
        L('            dvd -= dvs;', 'subtract'),
        L('            q++;', 'subtract'),
        L('        }'),
        L('        return (int) ((a < 0) == (b < 0) ? q : -q);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseInt1(values.a, 'Dividend', { min: -1000, max: 1000 });
      if (typeof a === 'string') return { error: a };
      const b = parseInt1(values.b, 'Divisor', { min: -1000, max: 1000 });
      if (typeof b === 'string') return { error: b };
      if (b === 0) return { error: 'Divisor cannot be 0.' };
      let dvd = Math.abs(a);
      const dvs = Math.abs(b);
      let q = 0;
      const steps: Step[] = [];
      const st = (): ArrayState => ({
        arr: [dvd],
        aggs: [
          { label: 'divisor', value: String(dvs), c: 'a' },
          { label: 'quotient so far', value: String(q), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Take off one copy of ', A(dvs), ' at a time from ', A(dvd), '.'], state: st() });
      while (dvd >= dvs) {
        dvd -= dvs;
        q++;
        if (q <= 12) steps.push({ tag: 'subtract', trace: ['Subtract ', A(dvs), ' → remaining ', B(dvd), ', quotient ', C(q), '.'], state: st() });
        else if (q === 13) steps.push({ tag: 'subtract', trace: ['… one subtraction per unit of the quotient …'], state: st() });
      }
      const ans = (a < 0) === (b < 0) ? q : -q;
      steps.push({ tag: 'ret', trace: ['Result ', C(ans), ' after ', A(q), ' subtractions.'], state: st() });
      return { steps, result: String(ans) };
    },
    note: 'The loop runs once per unit of the quotient — about 2³¹ times for INT_MIN ÷ 1. Subtracting the largest doubled copy of the divisor that fits brings it down to O(log²) steps.',
    complexity: { time: 'O(quotient)', space: 'O(1)' },
  },
};

/* ================= Count Primes ================= */
const countPrimes: ProblemDef = {
  slug: 'count-primes',
  title: 'Count Primes',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/count-primes/',
  technique: 'Sieve of Eratosthenes: cross out every multiple of each prime you find.',
  widget: 'array',
  widgetTitle: 'Sieve (numbers 2..n−1)',
  inputs: [{ key: 'n', label: 'n (count primes below n)', defaultValue: '20' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countPrimes(int n) {'),
      L('        if (n < 3) return 0;'),
      L('        vector<bool> composite(n, false);', 'init'),
      L('        for (int i = 2; (long)i * i < n; i++) {', 'outer'),
      L('            if (composite[i]) continue;', 'skip'),
      L('            for (int j = i * i; j < n; j += i)', 'mark'),
      L('                composite[j] = true;', 'mark'),
      L('        }'),
      L('        int count = 0;'),
      L('        for (int i = 2; i < n; i++) if (!composite[i]) count++;', 'count'),
      L('        return count;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countPrimes(int n) {'),
      L('        if (n < 3) return 0;'),
      L('        boolean[] composite = new boolean[n];', 'init'),
      L('        for (int i = 2; (long) i * i < n; i++) {', 'outer'),
      L('            if (composite[i]) continue;', 'skip'),
      L('            for (int j = i * i; j < n; j += i)', 'mark'),
      L('                composite[j] = true;', 'mark'),
      L('        }'),
      L('        int count = 0;'),
      L('        for (int i = 2; i < n; i++) if (!composite[i]) count++;', 'count'),
      L('        return count;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 0, max: 60 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    if (n < 3) {
      steps.push({ tag: 'outer', trace: ['n = ', A(n), ' is too small for any prime below it — the answer is ', C(0), '.'], state: { arr: [] } });
      return { steps, result: '0' };
    }
    const composite = new Array(n).fill(false);
    const view = (mark: 'active' | 'good' = 'active', hi?: number): ArrayState => ({
      arr: [...Array(n)].map((_, i) => (i < 2 ? '·' : composite[i] ? '✗' : i)),
      mark: hi !== undefined ? { [hi]: mark } : {},
    });
    steps.push({
      tag: 'init',
      trace: [
        'Instead of testing each number for primality, ', A('cross off'), ' multiples of every prime found — far cheaper than trial division per number.',
      ],
      state: view(),
    });
    for (let i = 2; i * i < n; i++) {
      if (composite[i]) {
        steps.push({ tag: 'skip', trace: [F(i), ' was already crossed off — it is not prime, so its multiples are already handled by a smaller factor.'], state: view('active', i) });
        continue;
      }
      steps.push({ tag: 'outer', trace: [A(i), ' is still standing — it is prime. Cross off all its multiples, starting from ', A(i * i), ' (smaller ones were already crossed by a smaller prime).'], state: view('active', i) });
      for (let j = i * i; j < n; j += i) {
        composite[j] = true;
      }
      steps.push({ tag: 'mark', trace: ['Multiples of ', B(i), ' up to ', B(n - 1), ' are now marked composite.'], state: view('good', i) });
      if (steps.length > MAX_STEPS) break;
    }
    let count = 0;
    for (let i = 2; i < n; i++) if (!composite[i]) count++;
    steps.push({
      tag: 'ret',
      trace: ['Primes below ', C(n), ': ', C(count), '.'],
      state: view(),
    });
    return { steps, result: String(count) };
  },
  note: 'Starting each inner loop at i·i rather than 2i is what keeps the sieve near-linear — every smaller multiple of i already has a smaller prime factor and was crossed off earlier. Stopping the outer loop once i·i ≥ n is safe for the same reason: any larger composite has already been found through a smaller factor.',
  complexity: { time: 'O(n log log n)', space: 'O(n)' },
  brute: {
    label: 'Trial division',
    technique: 'Test each number below n separately by trying every divisor up to its square root.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool isPrime(int x) {'),
        L('        for (int d = 2; d * d <= x; d++) if (x % d == 0) return false;'),
        L('        return true;'),
        L('    }'),
        L('public:'),
        L('    int countPrimes(int n) {'),
        L('        int count = 0;', 'outer'),
        L('        for (int x = 2; x < n; x++)', 'test'),
        L('            if (isPrime(x)) count++;', 'test', 'prime'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean isPrime(int x) {'),
        L('        for (int d = 2; d * d <= x; d++) if (x % d == 0) return false;'),
        L('        return true;'),
        L('    }'),
        L('    public int countPrimes(int n) {'),
        L('        int count = 0;', 'outer'),
        L('        for (int x = 2; x < n; x++)', 'test'),
        L('            if (isPrime(x)) count++;', 'test', 'prime'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 0, max: 60 });
      if (typeof n === 'string') return { error: n };
      const steps: Step[] = [];
      if (n < 3) {
        steps.push({ tag: 'outer', trace: ['n = ', A(n), ' is too small for any prime below it — the answer is ', C(0), '.'], state: { arr: [] } });
        return { steps, result: '0' };
      }
      const status: (number | string)[] = [...Array(n)].map((_, i) => (i < 2 ? '·' : i));
      let count = 0;
      let divisions = 0;
      const view = (hi?: number, m?: 'good' | 'dim'): ArrayState => ({
        arr: status,
        mark: hi !== undefined && m ? { [hi]: m } : {},
        aggs: [
          { label: 'primes', value: String(count), c: 'c' },
          { label: 'divisions tried', value: String(divisions), c: 'a' },
        ],
      });
      steps.push({ tag: 'outer', trace: ['No sieve: test each number on its own.'], state: view() });
      for (let x = 2; x < n; x++) {
        let divisor = 0;
        for (let d = 2; d * d <= x; d++) {
          divisions++;
          if (x % d === 0) {
            divisor = d;
            break;
          }
        }
        if (divisor) {
          status[x] = '✗';
          steps.push({ tag: 'test', trace: [F(x), ' is divisible by ', A(divisor), ' — composite.'], state: view(x, 'dim') });
        } else {
          count++;
          steps.push({ tag: 'prime', trace: [B(x), ' has no divisor up to √', A(x), ' — prime. Count ', C(count), '.'], state: view(x, 'good') });
        }
      }
      steps.push({ tag: 'ret', trace: [C(count), ' primes below ', A(n), ' (', A(divisions), ' divisions).'], state: view() });
      return { steps, result: String(count) };
    },
    note: 'Each number costs up to √x divisions, so the total is O(n√n). The sieve crosses out composites by marking multiples, reaching O(n log log n).',
    complexity: { time: 'O(n √n)', space: 'O(1)' },
  },
};

/* ================= Reverse Integer ================= */
const reverseInteger: ProblemDef = {
  slug: 'reverse-integer',
  title: 'Reverse Integer',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reverse-integer/',
  technique: 'Peel off digits from the end and rebuild in reverse, checking overflow before each step.',
  widget: 'array',
  widgetTitle: 'Digits peeled off',
  inputs: [{ key: 'x', label: 'Integer', defaultValue: '-123' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int reverse(int x) {'),
      L('        long res = 0;', 'init'),
      L('        while (x != 0) {', 'loop'),
      L('            res = res * 10 + x % 10;', 'digit'),
      L('            x /= 10;', 'digit'),
      L('            if (res < INT_MIN || res > INT_MAX) return 0;', 'overflow'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int reverse(int x) {'),
      L('        long res = 0;', 'init'),
      L('        while (x != 0) {', 'loop'),
      L('            res = res * 10 + x % 10;', 'digit'),
      L('            x /= 10;', 'digit'),
      L('            if (res < Integer.MIN_VALUE || res > Integer.MAX_VALUE) return 0;', 'overflow'),
      L('        }'),
      L('        return (int) res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    let x = parseInt1(values.x, 'Integer', { min: -999999999, max: 999999999 });
    if (typeof x === 'string') return { error: x };
    const steps: Step[] = [];
    let res = 0;
    const INT_MIN = -(2 ** 31);
    const INT_MAX = 2 ** 31 - 1;
    const st = (): ArrayState => ({
      arr: [x],
      aggs: [{ label: 'reversed so far', value: String(res), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Peel one digit off the ', A('end'), ' of x at a time and append it to the ', B('end'), ' of the running result — that reverses the order.'],
      state: st(),
    });
    while (x !== 0) {
      const digit = x % 10;
      res = res * 10 + digit;
      x = Math.trunc(x / 10);
      steps.push({
        tag: 'digit',
        trace: ['Peel off digit ', A(digit), ' — result becomes ', B(res), '. Remaining input: ', B(x), '.'],
        state: st(),
      });
      if (res < INT_MIN || res > INT_MAX) {
        steps.push({
          tag: 'overflow',
          trace: [F(res), ' has escaped the 32-bit signed range — the problem defines this as ', C('overflow'), ', so return ', C(0), '.'],
          state: st(),
        });
        return { steps, result: '0', resultDetail: 'overflow' };
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Reversed value: ', C(res), '.'], state: st() });
    return { steps, result: String(res) };
  },
  note: 'Checking for overflow after every digit, not just at the end, matters: the running total can spike past the limit mid-computation and then wrap back into range if you only check at the very end. Using x % 10 works for negative x directly in languages that truncate toward zero, so no separate sign handling is needed.',
  complexity: { time: 'O(log x)', space: 'O(1)' },
  brute: {
    label: 'String reversal',
    technique: 'Turn the absolute value into a string, reverse it, parse it back, restore the sign, and reject anything outside 32 bits.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int reverse(int x) {'),
        L('        string s = to_string(labs((long) x));', 'init'),
        L('        std::reverse(s.begin(), s.end());', 'rev'),
        L('        long r = stol(s) * (x < 0 ? -1 : 1);', 'rev'),
        L('        if (r < INT_MIN || r > INT_MAX) return 0;', 'overflow'),
        L('        return r;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int reverse(int x) {'),
        L('        String s = new StringBuilder(String.valueOf(Math.abs((long) x))).reverse().toString();', 'init', 'rev'),
        L('        long r = Long.parseLong(s) * (x < 0 ? -1 : 1);', 'rev'),
        L('        if (r < Integer.MIN_VALUE || r > Integer.MAX_VALUE) return 0;', 'overflow'),
        L('        return (int) r;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const x = parseInt1(values.x, 'Integer', { min: -999999999, max: 999999999 });
      if (typeof x === 'string') return { error: x };
      const INT_MIN = -(2 ** 31);
      const INT_MAX = 2 ** 31 - 1;
      const digits = String(Math.abs(x));
      const steps: Step[] = [];
      steps.push({ tag: 'init', trace: ['Write |x| as text: "', A(digits), '".'], state: { arr: digits.split('') } });
      const rev = digits.split('').reverse().join('');
      const r = Number(rev) * (x < 0 ? -1 : 1);
      steps.push({ tag: 'rev', trace: ['Reverse the characters: "', B(rev), '", parse it and restore the sign → ', B(r), '.'], state: { arr: rev.split(''), mark: Object.fromEntries(rev.split('').map((_, i) => [i, 'good' as const])) } });
      if (r < INT_MIN || r > INT_MAX) {
        steps.push({ tag: 'overflow', trace: [F(r), ' does not fit in 32 bits — return ', C(0), '.'], state: { arr: rev.split('') } });
        return { steps, result: '0', resultDetail: 'overflow' };
      }
      steps.push({ tag: 'ret', trace: ['Result: ', C(r), '.'], state: { arr: String(r).split('') } });
      return { steps, result: String(r) };
    },
    note: 'Short and clear, but it relies on a 64-bit integer to hold the reversed value before checking the range — which the problem forbids. The digit-by-digit version checks for overflow before each multiply, staying within 32 bits.',
    complexity: { time: 'O(log x)', space: 'O(log x)' },
  },
};

/* ================= Palindrome Number ================= */
const palindromeNumber: ProblemDef = {
  slug: 'palindrome-number',
  title: 'Palindrome Number',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/palindrome-number/',
  technique: 'Reverse only the second half and compare it against the first — no string conversion needed.',
  widget: 'array',
  widgetTitle: 'Splitting the number in half',
  inputs: [{ key: 'x', label: 'Integer', defaultValue: '1221' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isPalindrome(int x) {'),
      L('        if (x < 0 || (x % 10 == 0 && x != 0)) return false;', 'reject'),
      L('        int rev = 0;', 'init'),
      L('        while (x > rev) {', 'loop'),
      L('            rev = rev * 10 + x % 10;', 'build'),
      L('            x /= 10;', 'build'),
      L('        }'),
      L('        return x == rev || x == rev / 10;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isPalindrome(int x) {'),
      L('        if (x < 0 || (x % 10 == 0 && x != 0)) return false;', 'reject'),
      L('        int rev = 0;', 'init'),
      L('        while (x > rev) {', 'loop'),
      L('            rev = rev * 10 + x % 10;', 'build'),
      L('            x /= 10;', 'build'),
      L('        }'),
      L('        return x == rev || x == rev / 10;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    let x = parseInt1(values.x, 'Integer', { min: -99999, max: 99999 });
    if (typeof x === 'string') return { error: x };
    const steps: Step[] = [];
    const original = x;
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
      steps.push({
        tag: 'reject',
        trace: [
          x < 0
            ? 'Negative numbers can never be palindromes — the minus sign only appears on one end.'
            : "A number ending in 0 (other than 0 itself) can't be a palindrome — the leading digit is never 0.",
        ],
        state: { arr: [original] },
      });
      return { steps, result: 'false' };
    }
    let rev = 0;
    const st = (): ArrayState => ({
      arr: [x, rev],
      aggs: [
        { label: 'remaining (first half)', value: String(x), c: 'a' },
        { label: 'reversed (second half)', value: String(rev), c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Converting to a string and checking both ends works, but reversing ', A('half'), ' the digits in place avoids extra memory entirely.',
      ],
      state: st(),
    });
    while (x > rev) {
      const digit = x % 10;
      rev = rev * 10 + digit;
      x = Math.trunc(x / 10);
      steps.push({
        tag: 'build',
        trace: ['Move digit ', A(digit), ' from the end of x into rev — now x = ', B(x), ', rev = ', B(rev), '.'],
        state: st(),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const ok = x === rev || x === Math.trunc(rev / 10);
    steps.push({
      tag: 'ret',
      trace: [
        'x has shrunk to ', A(x), ', rev has grown to ', A(rev), '. They match', ok ? '' : ' — wait, they do not', ' (accounting for an odd middle digit) — ',
        String(original), ' is ', ok ? C('a palindrome') : C('not a palindrome'), '.',
      ],
      state: st(),
    });
    return { steps, result: ok ? 'true' : 'false' };
  },
  note: 'The loop stops once x ≤ rev, meaning exactly half the digits (or half minus the middle one) have moved — dividing rev by 10 discards that middle digit for an odd-length number without ever needing to count the digits up front. Rejecting trailing zeros early is what stops a number like 10 from spuriously passing.',
  complexity: { time: 'O(log x)', space: 'O(1)' },
  brute: {
    label: 'Convert to string',
    technique: 'Turn the number into text and compare characters from both ends toward the middle.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isPalindrome(int x) {'),
        L('        string s = to_string(x);', 'init'),
        L('        for (int i = 0, j = s.size() - 1; i < j; i++, j--)', 'cmp'),
        L('            if (s[i] != s[j]) return false;', 'cmp', 'reject'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isPalindrome(int x) {'),
        L('        String s = String.valueOf(x);', 'init'),
        L('        for (int i = 0, j = s.length() - 1; i < j; i++, j--)', 'cmp'),
        L('            if (s.charAt(i) != s.charAt(j)) return false;', 'cmp', 'reject'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const x = parseInt1(values.x, 'Integer', { min: -99999, max: 99999 });
      if (typeof x === 'string') return { error: x };
      const s = String(x);
      const steps: Step[] = [];
      const st = (i?: number, j?: number, m: 'active' | 'dim' = 'active'): ArrayState => ({
        arr: s.split(''),
        ptrs: i !== undefined && j !== undefined ? [{ name: 'i', i, c: 'a' }, { name: 'j', i: j, c: 'b' }] : [],
        mark: i !== undefined && j !== undefined ? { [i]: m, [j]: m } : {},
      });
      steps.push({ tag: 'init', trace: ['Write it as text: "', A(s), '".'], state: st() });
      for (let i = 0, j = s.length - 1; i < j; i++, j--) {
        if (s[i] !== s[j]) {
          steps.push({ tag: 'reject', trace: ["'", F(s[i]), "' ≠ '", F(s[j]), "' — ", C('false'), '.'], state: st(i, j, 'dim') });
          return { steps, result: 'false' };
        }
        steps.push({ tag: 'cmp', trace: ["'", B(s[i]), "' = '", B(s[j]), "'."], state: st(i, j) });
      }
      steps.push({ tag: 'ret', trace: ['All mirrored characters match — ', C('true'), '.'], state: st() });
      return { steps, result: 'true' };
    },
    note: 'Simple and correct (the minus sign automatically fails), but the follow-up asks for no string conversion. Reversing just the second half of the digits arithmetically needs O(1) extra space.',
    complexity: { time: 'O(log x)', space: 'O(log x)' },
  },
};

/* ================= Factorial Trailing Zeroes ================= */
const factorialTrailingZeroes: ProblemDef = {
  slug: 'factorial-trailing-zeroes',
  title: 'Factorial Trailing Zeroes',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/factorial-trailing-zeroes/',
  technique: 'Count factors of 5 in n! — factors of 2 are never the bottleneck.',
  widget: 'array',
  widgetTitle: 'n divided by powers of 5',
  inputs: [{ key: 'n', label: 'n', defaultValue: '25' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int trailingZeroes(int n) {'),
      L('        int count = 0;', 'init'),
      L('        for (long p = 5; p <= n; p *= 5)', 'loop'),
      L('            count += n / p;', 'add'),
      L('        return count;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int trailingZeroes(int n) {'),
      L('        int count = 0;', 'init'),
      L('        for (long p = 5; p <= n; p *= 5)', 'loop'),
      L('            count += n / p;', 'add'),
      L('        return count;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 0, max: 10000 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    let count = 0;
    const st = (p?: number, contrib?: number): ArrayState => ({
      arr: [n],
      aggs: [
        ...(p !== undefined ? [{ label: `⌊n / ${p}⌋`, value: String(contrib), c: 'a' as const }] : []),
        { label: 'total trailing zeroes', value: String(count), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'A trailing zero needs a factor of ', A(10), ' = 2 × 5. In n!, factors of ', A(2), ' vastly outnumber factors of ', A(5), ', so ', B('counting the 5s'),
        ' alone gives the answer.',
      ],
      state: st(),
    });
    for (let p = 5; p <= n; p *= 5) {
      const contrib = Math.floor(n / p);
      count += contrib;
      steps.push({
        tag: 'add',
        trace: [
          '⌊', A(n), ' / ', A(p), '⌋ = ', B(contrib), ' — that counts multiples of ', A(p), ' up to n, each contributing at least one more factor of 5 than the previous power caught (numbers like 25 contribute twice, once at p=5 and once at p=25).',
        ],
        state: st(p, contrib),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: [C(n), '! has ', C(count), ' trailing zero(s).'], state: st() });
    return { steps, result: String(count) };
  },
  note: 'Summing ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … is Legendre\'s formula: each term recounts numbers like 25 or 125 that contribute more than one factor of 5, since dividing by 25 catches them a second time. Actually computing n! first would overflow almost immediately — this sidesteps big-integer arithmetic entirely.',
  complexity: { time: 'O(log₅ n)', space: 'O(1)' },
  brute: {
    label: 'Count 5s in every factor',
    technique: 'For each k from 1 to n, count how many times 5 divides it and add them all up.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int trailingZeroes(int n) {'),
        L('        int count = 0;', 'init'),
        L('        for (int k = 5; k <= n; k += 5)', 'term'),
        L('            for (int x = k; x % 5 == 0; x /= 5) count++;', 'term'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int trailingZeroes(int n) {'),
        L('        int count = 0;', 'init'),
        L('        for (int k = 5; k <= n; k += 5)', 'term'),
        L('            for (int x = k; x % 5 == 0; x /= 5) count++;', 'term'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 0, max: 10000 });
      if (typeof n === 'string') return { error: n };
      let count = 0;
      const steps: Step[] = [];
      const st = (k?: number, f?: number): ArrayState => ({
        arr: [n],
        aggs: [
          ...(k !== undefined ? [{ label: `factors of 5 in ${k}`, value: String(f), c: 'a' as const }] : []),
          { label: 'total trailing zeroes', value: String(count), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Every trailing zero needs a 5 (2s are plentiful). Visit every multiple of 5 up to ', A(n), ' and count its 5s.'], state: st() });
      let shown = 0;
      for (let k = 5; k <= n; k += 5) {
        let f = 0;
        for (let x = k; x % 5 === 0; x /= 5) f++;
        count += f;
        if (shown++ < 14 || f > 1) steps.push({ tag: 'term', trace: [A(k), ' contributes ', B(f), ' five(s) → total ', C(count), '.'], state: st(k, f) });
      }
      steps.push({ tag: 'ret', trace: [A(n), '! ends in ', C(count), ' zero(s).'], state: st() });
      return { steps, result: String(count) };
    },
    note: 'Visits n/5 numbers, so it is O(n). Counting them in bulk — ⌊n/5⌋ multiples of 5, plus ⌊n/25⌋ extra, plus ⌊n/125⌋… — gives the same total in O(log₅ n).',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================= Minimum Bit Flips to Convert Number ================= */
const minBitFlips: ProblemDef = {
  slug: 'minimum-bit-flips-to-convert-number',
  title: 'Minimum Bit Flips to Convert Number',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/minimum-bit-flips-to-convert-number/',
  technique: 'XOR the two numbers — every set bit in the result is exactly one flip needed.',
  widget: 'bits',
  widgetTitle: 'start, goal, and their XOR',
  inputs: [
    { key: 'start', label: 'Start', defaultValue: '10' },
    { key: 'goal', label: 'Goal', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minBitFlips(int start, int goal) {'),
      L('        int diff = start ^ goal;', 'xor'),
      L('        int count = 0;'),
      L('        while (diff) {', 'loop'),
      L('            count += diff & 1;', 'count'),
      L('            diff >>= 1;', 'shift'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minBitFlips(int start, int goal) {'),
      L('        int diff = start ^ goal;', 'xor'),
      L('        int count = 0;'),
      L('        while (diff != 0) {', 'loop'),
      L('            count += diff & 1;', 'count'),
      L('            diff >>>= 1;', 'shift'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const start = parseInt1(values.start, 'Start', { min: 0, max: 255 });
    if (typeof start === 'string') return { error: start };
    const goal = parseInt1(values.goal, 'Goal', { min: 0, max: 255 });
    if (typeof goal === 'string') return { error: goal };
    const width = 8;
    const steps: Step[] = [];
    const diff = start ^ goal;
    steps.push({
      tag: 'xor',
      trace: [
        'Flipping a bit is exactly what ', A('XOR'), ' models: a bit is ', B('1'), ' in the XOR result precisely where start and goal disagree.',
      ],
      state: {
        rows: [
          { label: `start = ${start}`, bits: toBits(start, width), c: 'a' },
          { label: `goal = ${goal}`, bits: toBits(goal, width), c: 'a' },
          { label: `diff = ${diff}`, bits: toBits(diff, width), c: 'b' },
        ],
      },
    });
    let d = diff;
    let count = 0;
    for (let i = 0; i < width; i++) {
      const bit = d & 1;
      if (bit) {
        count++;
        steps.push({
          tag: 'count',
          trace: ['Bit ', A(i), ' of the difference is ', B(1), ' — that position needs a flip. Running total ', C(count), '.'],
          state: {
            rows: [{ label: `diff = ${diff}`, bits: toBits(diff, width), c: 'b', hl: [width - 1 - i] }],
            aggs: [{ label: 'flips needed', value: String(count), c: 'c' }],
          },
        });
      }
      d >>= 1;
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Minimum bit flips: ', C(count), ' — the number of set bits in start ⊕ goal.'], state: { rows: [{ label: `diff = ${diff}`, bits: toBits(diff, width), c: 'b' }] } });
    return { steps, result: String(count) };
  },
  note: 'No search or simulation is needed because bit flips are independent of each other — flipping one position never affects another, so the answer is simply the Hamming distance between the two numbers. Popcount instructions compute this in a single CPU cycle on most hardware.',
  complexity: { time: 'O(log(max))', space: 'O(1)' },
  brute: {
    label: 'Compare bit by bit',
    technique: 'Shift both numbers right together and count the positions where their lowest bits differ.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minBitFlips(int start, int goal) {'),
        L('        int count = 0;', 'xor'),
        L('        while (start || goal) {', 'bit'),
        L('            if ((start & 1) != (goal & 1)) count++;', 'bit'),
        L('            start >>= 1; goal >>= 1;', 'bit'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minBitFlips(int start, int goal) {'),
        L('        int count = 0;', 'xor'),
        L('        while (start != 0 || goal != 0) {', 'bit'),
        L('            if ((start & 1) != (goal & 1)) count++;', 'bit'),
        L('            start >>= 1; goal >>= 1;', 'bit'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const start = parseInt1(values.start, 'Start', { min: 0, max: 255 });
      if (typeof start === 'string') return { error: start };
      const goal = parseInt1(values.goal, 'Goal', { min: 0, max: 255 });
      if (typeof goal === 'string') return { error: goal };
      const width = 8;
      let count = 0;
      const steps: Step[] = [];
      const view = (i?: number): BitsState => ({
        rows: [
          { label: `start = ${start}`, bits: toBits(start, width), c: 'a', hl: i !== undefined ? [width - 1 - i] : [] },
          { label: `goal = ${goal}`, bits: toBits(goal, width), c: 'b', hl: i !== undefined ? [width - 1 - i] : [] },
        ],
        aggs: [{ label: 'flips', value: String(count), c: 'c' }],
      });
      steps.push({ tag: 'xor', trace: ['No XOR: compare the two numbers one column at a time.'], state: view() });
      for (let i = 0; (start >> i) || (goal >> i); i++) {
        const x = (start >> i) & 1;
        const y = (goal >> i) & 1;
        if (x !== y) count++;
        steps.push({ tag: 'bit', trace: ['Bit ', A(i), ': ', A(x), ' vs ', A(y), x !== y ? [' — differ, flips = ', count].join('') : ' — same.'], state: view(i) });
      }
      steps.push({ tag: 'ret', trace: ['Minimum flips: ', C(count), '.'], state: view() });
      return { steps, result: String(count) };
    },
    note: 'Walks every bit position up to the longer number. XOR marks all differing bits at once, and popcount with n & (n − 1) then loops only once per difference.',
    complexity: { time: 'O(log(max))', space: 'O(1)' },
  },
};

export const mathBits2: ProblemDef[] = [
  singleNumberII,
  singleNumberIII,
  divideIntegers,
  countPrimes,
  reverseInteger,
  palindromeNumber,
  factorialTrailingZeroes,
  minBitFlips,
];
