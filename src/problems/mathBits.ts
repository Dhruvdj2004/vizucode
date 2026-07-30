// Math & Bit Manipulation.
import type { ArrayState, BinarySearchState, BitsState, ListState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const toBits = (n: number, width: number): (0 | 1)[] =>
  [...Array(width)].map((_, i) => ((n >>> (width - 1 - i)) & 1) as 0 | 1);

/* ================= 140. Single Number ================= */
const singleNumber: ProblemDef = {
  slug: 'single-number',
  title: 'Single Number',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/single-number/',
  technique: 'XOR everything — pairs annihilate, the loner survives.',
  widget: 'bits',
  widgetTitle: 'Running XOR',
  inputs: [{ key: 'nums', label: 'Array (all pairs but one)', defaultValue: '4, 1, 2, 1, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int singleNumber(vector<int>& nums) {'),
      L('        int acc = 0;', 'init'),
      L('        for (int x : nums)', 'loop'),
      L('            acc ^= x;', 'xor'),
      L('        return acc;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int singleNumber(int[] nums) {'),
      L('        int acc = 0;', 'init'),
      L('        for (int x : nums)', 'loop'),
      L('            acc ^= x;', 'xor'),
      L('        return acc;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 255, maxLen: 11 });
    if (typeof nums === 'string') return { error: nums };
    const counts = new Map<number, number>();
    for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
    const singles = [...counts.entries()].filter(([, c]) => c % 2 === 1);
    if (singles.length !== 1) return { error: 'Exactly one value must appear an odd number of times.' };
    const width = 8;
    const steps: Step[] = [];
    let acc = 0;
    const view = (x: number | null): BitsState => ({
      rows: [
        ...(x !== null ? [{ label: `x = ${x}`, bits: toBits(x, width), c: 'a' as const }] : []),
        { label: `acc = ${acc}`, bits: toBits(acc, width), c: 'b' as const },
      ],
    });
    steps.push({ tag: 'init', trace: ['XOR is its own inverse: x ⊕ x = 0 and x ⊕ 0 = x. Fold the whole array through one accumulator.'], state: view(null) });
    for (const x of nums) {
      const prev = acc;
      acc ^= x;
      steps.push({ tag: 'xor', trace: [A(prev), ' ⊕ ', A(x), ' = ', B(acc), ' — matching bits cancel, differing bits stay.'], state: view(x) });
    }
    steps.push({ tag: 'ret', trace: ['Every pair annihilated itself — the survivor is ', C(acc), '.'], state: view(null) });
    return { steps, result: String(acc) };
  },
  note: 'XOR is associative and commutative, so the order of the array is irrelevant: conceptually all pairs slide together and vanish. One accumulator, no hash set, no sort — O(n) time, O(1) space, and it never overflows.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 141. Number of 1 Bits ================= */
const hammingWeight: ProblemDef = {
  slug: 'number-of-1-bits',
  title: 'Number of 1 Bits',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/number-of-1-bits/',
  technique: 'n & (n−1) deletes the lowest set bit — loop once per 1, not per bit.',
  widget: 'bits',
  widgetTitle: 'Bits of n',
  inputs: [{ key: 'n', label: 'n', defaultValue: '11' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int hammingWeight(uint32_t n) {'),
      L('        int count = 0;', 'init'),
      L('        while (n != 0) {', 'loop'),
      L('            n &= (n - 1);', 'drop'),
      L('            count++;', 'drop'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int hammingWeight(int n) {'),
      L('        int count = 0;', 'init'),
      L('        while (n != 0) {', 'loop'),
      L('            n &= (n - 1);', 'drop'),
      L('            count++;', 'drop'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n0 = parseInt1(values.n, 'n', { min: 0, max: 65535 });
    if (typeof n0 === 'string') return { error: n0 };
    const width = n0 < 256 ? 8 : 16;
    const steps: Step[] = [];
    let n = n0;
    let count = 0;
    const view = (prev?: number): BitsState => ({
      rows: [
        ...(prev !== undefined ? [{ label: `was ${prev}`, bits: toBits(prev, width), c: 'a' as const }] : []),
        { label: `n = ${n}`, bits: toBits(n, width), c: 'b' as const },
      ],
      aggs: [{ label: 'count', value: String(count), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Subtracting 1 flips the lowest set bit and everything below it — so ', A('n & (n−1)'), ' erases exactly that lowest 1.'], state: view() });
    while (n !== 0) {
      const prev = n;
      n &= n - 1;
      count++;
      steps.push({ tag: 'drop', trace: [A(prev), ' & ', A(prev - 1), ' = ', B(n), ' — one 1-bit gone, count = ', C(count), '.'], state: view(prev) });
    }
    steps.push({ tag: 'ret', trace: ['n hit zero after ', C(count), ' erasures — that is the number of set bits.'], state: view() });
    return { steps, result: String(count), resultDetail: `popcount(${n0})` };
  },
  note: 'The naive loop checks all 32 positions; this loop runs once per set bit and not once more. The identity n & (n−1) is a bit-twiddling primitive worth memorizing — it also powers "is a power of two?" (result == 0).',
  complexity: { time: 'O(set bits)', space: 'O(1)' },
};

/* ================= 142. Counting Bits ================= */
const countingBits: ProblemDef = {
  slug: 'counting-bits',
  title: 'Counting Bits',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/counting-bits/',
  technique: 'DP on bit structure: bits(i) = bits(i >> 1) + (i & 1).',
  widget: 'array',
  widgetTitle: 'ans[0..n]',
  inputs: [{ key: 'n', label: 'n', defaultValue: '8' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> countBits(int n) {'),
      L('        vector<int> ans(n + 1, 0);', 'init'),
      L('        for (int i = 1; i <= n; i++)', 'loop'),
      L('            ans[i] = ans[i >> 1] + (i & 1);', 'fill'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] countBits(int n) {'),
      L('        int[] ans = new int[n + 1];', 'init'),
      L('        for (int i = 1; i <= n; i++)', 'loop'),
      L('            ans[i] = ans[i >> 1] + (i & 1);', 'fill'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 16 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    const ans: (number | string)[] = Array(n + 1).fill('·');
    ans[0] = 0;
    const st = (i: number | null, src?: number): ArrayState => ({
      arr: ans.map(String),
      ptrs: i !== null ? [{ name: 'i', i, c: 'a' }] : [],
      mark: { ...(i !== null ? { [i]: 'active' as const } : {}), ...(src !== undefined ? { [src]: 'win' as const } : {}) },
    });
    steps.push({ tag: 'init', trace: ['ans[0] = ', B(0), '. Every other count derives from an already-computed smaller number.'], state: st(null) });
    for (let i = 1; i <= n; i++) {
      ans[i] = (ans[i >> 1] as number) + (i & 1);
      steps.push({
        tag: 'fill',
        trace: [A(i), ' in binary is ', A((i >> 1).toString(2) || '0'), ' shifted left plus bit ', A(i & 1), ' → ans[', A(i >> 1), '] + ', A(i & 1), ' = ', B(ans[i]), '.'],
        state: st(i, i >> 1),
      });
    }
    steps.push({ tag: 'ret', trace: ['Table complete: ', C(`[${ans.join(', ')}]`), '.'], state: st(null) });
    return { steps, result: `[${ans.join(', ')}]` };
  },
  note: 'Dropping the last bit (i >> 1) yields a number already in the table — so each entry is one addition. The recursion mirrors binary representation itself, which is why the whole range costs O(n) instead of O(n log n).',
  complexity: { time: 'O(n)', space: 'O(n) output' },
};

/* ================= 143. Reverse Bits ================= */
const reverseBits: ProblemDef = {
  slug: 'reverse-bits',
  title: 'Reverse Bits',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/reverse-bits/',
  technique: 'Peel bits off one end and push them onto the other, 32 times.',
  widget: 'bits',
  widgetTitle: 'Input & reversed build',
  inputs: [{ key: 'bits', label: 'Bit string (≤ 12 bits)', defaultValue: '00000010100101000001111010011100'.slice(-12), wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    uint32_t reverseBits(uint32_t n) {'),
      L('        uint32_t res = 0;', 'init'),
      L('        for (int i = 0; i < 32; i++) {', 'loop'),
      L('            res = (res << 1) | (n & 1);', 'move'),
      L('            n >>= 1;', 'move'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int reverseBits(int n) {'),
      L('        int res = 0;', 'init'),
      L('        for (int i = 0; i < 32; i++) {', 'loop'),
      L('            res = (res << 1) | (n & 1);', 'move'),
      L('            n >>>= 1;', 'move'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const bs = (values.bits ?? '').trim();
    if (!/^[01]{1,12}$/.test(bs)) return { error: 'Enter 1–12 binary digits.' };
    const width = bs.length;
    let n = parseInt(bs, 2);
    let res = 0;
    const steps: Step[] = [];
    const view = (hlIn?: number, hlOut?: number): BitsState => ({
      rows: [
        { label: `n`, bits: toBits(n, width), c: 'a', hl: hlIn !== undefined ? [hlIn] : [] },
        { label: `res`, bits: toBits(res, width), c: 'b', hl: hlOut !== undefined ? [hlOut] : [] },
      ],
    });
    steps.push({ tag: 'init', trace: ['Read ', A(width), ' bits off n\'s low end; each becomes the next low bit of res — first out, last in: a reversal.'], state: view() });
    for (let i = 0; i < width; i++) {
      const bit = n & 1;
      res = (res << 1) | bit;
      n >>>= 1;
      steps.push({
        tag: 'move',
        trace: ['Step ', A(i + 1), ': peel ', bit ? B(1) : F(0), ' from the right of n, append it to the right of res (shifting res left first).'],
        state: view(width - 1, width - 1),
      });
    }
    const resultBits = toBits(res, width).join('');
    steps.push({ tag: 'ret', trace: ['All bits transferred — ', A(bs), ' reversed is ', C(resultBits), ' (= ', C(res), ').'], state: view() });
    return { steps, result: resultBits, resultDetail: `decimal ${res} (shown at ${width} bits)` };
  },
  note: 'Shifting res left before OR-ing in each new bit is what flips the order: the first bit extracted ends up shifted the furthest. The same loop, run 32 times, is the real 32-bit solution — width changes nothing structurally.',
  complexity: { time: 'O(32)', space: 'O(1)' },
};

/* ================= 144. Missing Number ================= */
const missingNumber: ProblemDef = {
  slug: 'missing-number',
  title: 'Missing Number',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/missing-number/',
  technique: 'XOR all indices 0…n against all values — everything pairs off except the missing one.',
  widget: 'array',
  widgetTitle: 'Array & XOR fold',
  inputs: [{ key: 'nums', label: 'Array (0…n, one missing)', defaultValue: '3, 0, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int missingNumber(vector<int>& nums) {'),
      L('        int acc = nums.size();', 'init'),
      L('        for (int i = 0; i < nums.size(); i++)', 'loop'),
      L('            acc ^= i ^ nums[i];', 'xor'),
      L('        return acc;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int missingNumber(int[] nums) {'),
      L('        int acc = nums.length;', 'init'),
      L('        for (int i = 0; i < nums.length; i++)', 'loop'),
      L('            acc ^= i ^ nums[i];', 'xor'),
      L('        return acc;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0 });
    if (typeof nums === 'string') return { error: nums };
    const n = nums.length;
    if (new Set(nums).size !== n || nums.some((x) => x > n)) return { error: 'Values must be distinct numbers from 0…n with one missing.' };
    const steps: Step[] = [];
    let acc = n;
    const st = (i: number): ArrayState => ({
      arr: nums,
      ptrs: i < n ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [{ label: 'acc', value: String(acc), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Seed acc with ', A(n), ' (the one index with no array slot). Then XOR every index and every value into it.'], state: st(0) });
    for (let i = 0; i < n; i++) {
      const before = acc;
      acc ^= i ^ nums[i];
      steps.push({ tag: 'xor', trace: ['acc ⊕ index ', A(i), ' ⊕ value ', A(nums[i]), ': ', A(before), ' → ', B(acc), '.'], state: st(i) });
    }
    steps.push({ tag: 'ret', trace: ['Every present number met its index twin and vanished — the missing number is ', C(acc), '.'], state: st(n) });
    return { steps, result: String(acc) };
  },
  note: 'The multiset {0…n} ∪ {array values} contains every number twice except the missing one — XOR-folding the whole thing leaves exactly it. (Gauss\'s sum formula works too, but XOR cannot overflow.)',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 145. Sum of Two Integers ================= */
const sumTwoIntegers: ProblemDef = {
  slug: 'sum-of-two-integers',
  title: 'Sum of Two Integers',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sum-of-two-integers/',
  technique: 'XOR adds without carrying; AND-shift computes the carry — repeat until the carry dies.',
  widget: 'bits',
  widgetTitle: 'a, b and the carry',
  inputs: [
    { key: 'a', label: 'a', defaultValue: '13' },
    { key: 'b', label: 'b', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int getSum(int a, int b) {'),
      L('        while (b != 0) {', 'loop'),
      L('            unsigned carry = (unsigned)(a & b) << 1;', 'carry'),
      L('            a = a ^ b;', 'xor'),
      L('            b = carry;', 'assign'),
      L('        }'),
      L('        return a;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int getSum(int a, int b) {'),
      L('        while (b != 0) {', 'loop'),
      L('            int carry = (a & b) << 1;', 'carry'),
      L('            a = a ^ b;', 'xor'),
      L('            b = carry;', 'assign'),
      L('        }'),
      L('        return a;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a0 = parseInt1(values.a, 'a', { min: 0, max: 255 });
    if (typeof a0 === 'string') return { error: a0 };
    const b0 = parseInt1(values.b, 'b', { min: 0, max: 255 });
    if (typeof b0 === 'string') return { error: b0 };
    const width = 9;
    let a = a0;
    let b = b0;
    const steps: Step[] = [];
    const view = (): BitsState => ({
      rows: [
        { label: `a = ${a}`, bits: toBits(a, width), c: 'b' },
        { label: `b = ${b}`, bits: toBits(b, width), c: 'a' },
      ],
    });
    steps.push({ tag: 'loop', trace: ['Grade-school addition in binary: ', B('XOR'), ' is the sum digit, ', A('AND'), ' is the carry. Loop until no carry remains.'], state: view() });
    let guard = 0;
    while (b !== 0 && guard++ < 12) {
      const carry = (a & b) << 1;
      const x = a ^ b;
      steps.push({
        tag: 'carry',
        tag2: 'xor',
        trace: ['carry = (', A(a), ' & ', A(b), ') << 1 = ', A(carry), '; partial sum = ', A(a), ' ⊕ ', A(b), ' = ', B(x), '.'],
        state: view(),
      });
      a = x;
      b = carry;
      steps.push({ tag: 'assign', trace: ['Now add the partial sum and the carry — same problem, smaller carry: a = ', B(a), ', b = ', A(b), '.'], state: view() });
    }
    steps.push({ tag: 'ret', trace: ['Carry extinguished — ', A(a0), ' + ', A(b0), ' = ', C(a), ', computed without a single +.'], state: view() });
    return { steps, result: String(a), resultDetail: `${a0} + ${b0} without + or −` };
  },
  note: 'XOR and AND-shift decompose addition into its two physical parts (sum bits, carry bits) — exactly what a hardware adder does. The carry moves left every round, so it must die within the word width: the loop is bounded, not just hopeful.',
  complexity: { time: 'O(word bits)', space: 'O(1)' },
};

/* ================= 146. Roman to Integer ================= */
const romanToInt: ProblemDef = {
  slug: 'roman-to-integer',
  title: 'Roman to Integer',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/roman-to-integer/',
  technique: 'Scan left to right: a symbol smaller than its right neighbor subtracts, otherwise it adds.',
  widget: 'array',
  widgetTitle: 'Numerals & running total',
  inputs: [{ key: 's', label: 'Roman numeral', defaultValue: 'MCMXCIV' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int romanToInt(string s) {'),
      L('        unordered_map<char, int> val{{\'I\',1},{\'V\',5},{\'X\',10},{\'L\',50},', 'init'),
      L('                                     {\'C\',100},{\'D\',500},{\'M\',1000}};', 'init'),
      L('        int total = 0;', 'init'),
      L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
      L('            if (i + 1 < s.size() && val[s[i]] < val[s[i+1]])', 'sub'),
      L('                total -= val[s[i]];', 'sub'),
      L('            else'),
      L('                total += val[s[i]];', 'add'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int romanToInt(String s) {'),
      L('        Map<Character, Integer> val = Map.of(\'I\', 1, \'V\', 5, \'X\', 10,', 'init'),
      L('            \'L\', 50, \'C\', 100, \'D\', 500, \'M\', 1000);', 'init'),
      L('        int total = 0;', 'init'),
      L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
      L('            if (i + 1 < s.length() && val.get(s.charAt(i)) < val.get(s.charAt(i+1)))', 'sub'),
      L('                total -= val.get(s.charAt(i));', 'sub'),
      L('            else'),
      L('                total += val.get(s.charAt(i));', 'add'),
      L('        }'),
      L('        return total;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toUpperCase();
    if (!/^[IVXLCDM]{1,12}$/.test(s)) return { error: 'Roman numerals only (I V X L C D M), ≤ 12 chars.' };
    const val: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const chars = s.split('');
    const steps: Step[] = [];
    let total = 0;
    const st = (i: number, kind?: 'good' | 'dim'): ArrayState => ({
      arr: chars,
      ptrs: i < chars.length ? [{ name: 'i', i, c: 'a' }] : [],
      mark: kind ? { [i]: kind } : {},
      aggs: [{ label: 'total', value: String(total), c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Values: I=1 V=5 X=10 L=50 C=100 D=500 M=1000. The only twist is the ', A('subtractive pair'), ' (IV, IX, XL, …).'], state: st(0) });
    for (let i = 0; i < chars.length; i++) {
      if (i + 1 < chars.length && val[chars[i]] < val[chars[i + 1]]) {
        total -= val[chars[i]];
        steps.push({ tag: 'sub', trace: [F(chars[i]), ' (', F(val[chars[i]]), ') sits before the larger ', A(chars[i + 1]), ' — subtract it: total ', A(total), '.'], state: st(i, 'dim') });
      } else {
        total += val[chars[i]];
        steps.push({ tag: 'add', trace: [B(chars[i]), ' adds ', B(val[chars[i]]), ' — total ', A(total), '.'], state: st(i, 'good') });
      }
    }
    steps.push({ tag: 'ret', trace: [A(s), ' = ', C(total), '.'], state: st(chars.length) });
    return { steps, result: String(total) };
  },
  note: 'Roman numerals are almost purely additive; the subtractive exception is fully characterized by one local test — "am I smaller than my right neighbor?" — so no lookahead beyond one character is ever needed.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 147. Integer to Roman ================= */
const intToRoman: ProblemDef = {
  slug: 'integer-to-roman',
  title: 'Integer to Roman',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/integer-to-roman/',
  technique: 'Greedy over the 13 canonical symbols (including subtractive pairs), largest first.',
  widget: 'list',
  widgetTitle: 'Symbol table & build',
  inputs: [{ key: 'num', label: 'Number (1–3999)', defaultValue: '1994' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string intToRoman(int num) {'),
      L('        const pair<int, string> table[] = {', 'init'),
      L('            {1000,"M"},{900,"CM"},{500,"D"},{400,"CD"},', 'init'),
      L('            {100,"C"},{90,"XC"},{50,"L"},{40,"XL"},', 'init'),
      L('            {10,"X"},{9,"IX"},{5,"V"},{4,"IV"},{1,"I"}};', 'init'),
      L('        string res;', 'init'),
      L('        for (auto& [v, sym] : table) {', 'loop'),
      L('            while (num >= v) {', 'take'),
      L('                res += sym;', 'take'),
      L('                num -= v;', 'take'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String intToRoman(int num) {'),
      L('        int[] vals = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};', 'init'),
      L('        String[] syms = {"M", "CM", "D", "CD", "C", "XC", "L", "XL",', 'init'),
      L('                         "X", "IX", "V", "IV", "I"};', 'init'),
      L('        StringBuilder res = new StringBuilder();', 'init'),
      L('        for (int i = 0; i < vals.length; i++) {', 'loop'),
      L('            while (num >= vals[i]) {', 'take'),
      L('                res.append(syms[i]);', 'take'),
      L('                num -= vals[i];', 'take'),
      L('            }'),
      L('        }'),
      L('        return res.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const num0 = parseInt1(values.num, 'Number', { min: 1, max: 3999 });
    if (typeof num0 === 'string') return { error: num0 };
    const table: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let num = num0;
    let res = '';
    const steps: Step[] = [];
    const view = (activeIdx?: number): ListState => ({
      chains: [
        { label: 'table', items: table.map(([v, sym], i) => ({ v: `${sym}=${v}`, mark: i === activeIdx ? ('active' as const) : undefined })), broken: true },
        { label: 'build', items: res === '' ? [{ v: '(empty)', mark: 'dim' as const }] : res.split('').map((c) => ({ v: c, mark: 'good' as const })), broken: true },
      ],
      aggs: [{ label: 'remaining', value: String(num), c: 'a' }],
    });
    steps.push({ tag: 'init', trace: ['Treat the 13 symbols — including the subtractive pairs like ', A('CM=900'), ' — as denominations, and make change greedily.'], state: view() });
    table.forEach(([v, sym], i) => {
      while (num >= v) {
        res += sym;
        num -= v;
        steps.push({ tag: 'take', trace: ['Remaining ', A(num + v), ' ≥ ', A(v), ' — append ', B(sym), '; remaining ', A(num), '.'], state: view(i) });
      }
    });
    steps.push({ tag: 'ret', trace: [C(String(num0)), ' = ', C(res), '.'], state: view() });
    return { steps, result: res };
  },
  note: 'Greedy change-making usually needs proof — here it is safe because listing the subtractive pairs as first-class denominations makes the system canonical: each symbol\'s value exceeds the largest amount expressible without it.',
  complexity: { time: 'O(13)', space: 'O(1)' },
};

/* ================= 148. Pow(x, n) ================= */
const powXN: ProblemDef = {
  slug: 'powx-n',
  title: 'Pow(x, n)',
  category: 'Math & Bit Manipulation',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/powx-n/',
  technique: 'Fast exponentiation: square the base as you scan n\'s bits.',
  widget: 'bits',
  widgetTitle: 'Bits of n (low → high processed)',
  inputs: [
    { key: 'x', label: 'x', defaultValue: '2' },
    { key: 'n', label: 'n', defaultValue: '10' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    double myPow(double x, int n) {'),
      L('        long e = n;', 'init'),
      L('        if (e < 0) {', 'neg'),
      L('            x = 1 / x;', 'neg'),
      L('            e = -e;', 'neg'),
      L('        }'),
      L('        double result = 1;', 'init'),
      L('        while (e > 0) {', 'loop'),
      L('            if (e & 1)', 'take'),
      L('                result *= x;', 'take'),
      L('            x *= x;', 'square'),
      L('            e >>= 1;', 'square'),
      L('        }'),
      L('        return result;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public double myPow(double x, int n) {'),
      L('        long e = n;', 'init'),
      L('        if (e < 0) {', 'neg'),
      L('            x = 1 / x;', 'neg'),
      L('            e = -e;', 'neg'),
      L('        }'),
      L('        double result = 1;', 'init'),
      L('        while (e > 0) {', 'loop'),
      L('            if ((e & 1) == 1)', 'take'),
      L('                result *= x;', 'take'),
      L('            x *= x;', 'square'),
      L('            e >>= 1;', 'square'),
      L('        }'),
      L('        return result;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const x0 = Number(values.x);
    if (!Number.isFinite(x0)) return { error: 'x must be a number.' };
    const n0 = parseInt1(values.n, 'n', { min: -64, max: 64 });
    if (typeof n0 === 'string') return { error: n0 };
    const steps: Step[] = [];
    let x = x0;
    let e = n0;
    let result = 1;
    const width = 7;
    const round = (v: number) => (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-4 && v !== 0) ? v.toExponential(3) : String(Math.round(v * 1e6) / 1e6));
    const view = (bitIdx: number): BitsState => ({
      rows: [{ label: `e = ${e}`, bits: toBits(Math.abs(e), width), c: 'a', hl: [width - 1] }],
      aggs: [
        { label: 'base (x)', value: round(x), c: 'a' },
        { label: 'result', value: round(result), c: 'b' },
      ],
    });
    if (e < 0) {
      x = 1 / x;
      e = -e;
      steps.push({ tag: 'neg', trace: ['Negative exponent — flip to ', A(`(1/x)^${e}`), ': base becomes ', A(round(x)), '.'], state: view(0) });
    } else {
      steps.push({ tag: 'init', trace: ['Write the exponent in binary: ', A(e.toString(2)), '. Each bit corresponds to a squaring of the base.'], state: view(0) });
    }
    let bit = 0;
    while (e > 0) {
      if (e & 1) {
        result *= x;
        steps.push({ tag: 'take', trace: ['Bit ', A(bit), ' is ', B(1), ' — multiply result by the current base: result = ', B(round(result)), '.'], state: view(bit) });
      } else {
        steps.push({ tag: 'take', trace: ['Bit ', A(bit), ' is ', F(0), ' — skip the multiply.'], state: view(bit) });
      }
      x *= x;
      e >>= 1;
      bit++;
      if (e > 0) steps.push({ tag: 'square', trace: ['Square the base for the next bit: base = ', A(round(x)), '.'], state: view(bit) });
    }
    steps.push({ tag: 'ret', trace: [A(`${x0}^${n0}`), ' = ', C(round(result)), ' in only ', B(bit), ' squarings.'], state: view(bit) });
    return { steps, result: round(result), resultDetail: `${bit} squarings instead of ${Math.abs(n0)} multiplies` };
  },
  note: 'x^n factors along n\'s binary digits: x¹⁰ = x⁸·x² because 10 = 1010₂. Squaring walks the base through x, x², x⁴, x⁸… so each bit costs one multiply — log n total, and negative n is just (1/x) positive-powered.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
};

/* ================= 149. Sqrt(x) ================= */
const sqrtX: ProblemDef = {
  slug: 'sqrtx',
  title: 'Sqrt(x)',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/sqrtx/',
  technique: 'Binary search on the answer: the largest k with k² ≤ x.',
  widget: 'binary-search',
  widgetTitle: 'Candidate roots',
  inputs: [{ key: 'x', label: 'x', defaultValue: '8' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int mySqrt(int x) {'),
      L('        if (x < 2) return x;', 'base'),
      L('        long lo = 1, hi = x / 2, ans = 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            long mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (mid * mid <= x) {', 'check'),
      L('                ans = mid;', 'ok'),
      L('                lo = mid + 1;', 'ok'),
      L('            } else {'),
      L('                hi = mid - 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int mySqrt(int x) {'),
      L('        if (x < 2) return x;', 'base'),
      L('        long lo = 1, hi = x / 2, ans = 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            long mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (mid * mid <= x) {', 'check'),
      L('                ans = mid;', 'ok'),
      L('                lo = mid + 1;', 'ok'),
      L('            } else {'),
      L('                hi = mid - 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return (int) ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const x = parseInt1(values.x, 'x', { min: 0, max: 10000 });
    if (typeof x === 'string') return { error: x };
    const steps: Step[] = [];
    if (x < 2) {
      steps.push({ tag: 'base', trace: ['√', A(x), ' is just ', C(x), ' for 0 and 1.'], state: { mode: 'answer', domain: [0, 2], lo: x, hi: x, best: x } satisfies BinarySearchState });
      return { steps, result: String(x) };
    }
    let lo = 1;
    let hi = Math.floor(x / 2);
    let ans = 1;
    const domain: [number, number] = [1, Math.floor(x / 2)];
    const st = (s?: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'candidate k', lo, hi, ...s } as BinarySearchState);
    steps.push({ tag: 'init', trace: ['The root of ', A(x), ' lies between ', A(1), ' and ', A(Math.floor(x / 2)), '. k² ≤ x is monotone — binary search territory.'], state: st({ best: null }) });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const sq = mid * mid;
      const ok = sq <= x;
      steps.push({
        tag: 'check',
        tag2: 'mid',
        trace: ['Try k = ', A(mid), ': k² = ', A(sq), ok ? [' ≤ '].join('') : ' > ', A(x), ok ? ' ✓ — k fits.' : ' ✗ — too big.'],
        state: st({ mid, best: ans === 1 && lo === 1 ? null : ans, probe: { text: `${mid}² = ${sq}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${sq} ≤ ${x} ✓` : `${sq} > ${x} ✗` } }),
      });
      if (ok) {
        ans = mid;
        lo = mid + 1;
        steps.push({ tag: 'ok', trace: ['Record ', B(mid), ' and look for something bigger: lo = ', A(lo), '.'], state: st({ best: ans }) });
      } else {
        hi = mid - 1;
        steps.push({ tag: 'no', trace: ['Everything ≥ ', F(mid), ' also overshoots — hi = ', A(hi), '.'], state: st({ best: ans }) });
      }
    }
    steps.push({ tag: 'ret', trace: ['⌊√', A(x), '⌋ = ', C(ans), '.'], state: st({ best: ans }) });
    return { steps, result: String(ans), resultDetail: `${ans}² = ${ans * ans} ≤ ${x} < ${(ans + 1) * (ans + 1)}` };
  },
  note: 'k² ≤ x is a monotone predicate over k — true then false — which is the exact precondition for binary search on the answer. The same pattern as Koko and Ship Capacity, in its purest form.',
  complexity: { time: 'O(log x)', space: 'O(1)' },
};

/* ================= 150. Happy Number ================= */
const happyNumber: ProblemDef = {
  slug: 'happy-number',
  title: 'Happy Number',
  category: 'Math & Bit Manipulation',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/happy-number/',
  technique: 'The digit-square sequence either hits 1 or loops — detect the loop with slow/fast pointers.',
  widget: 'list',
  widgetTitle: 'Digit-square sequence',
  inputs: [{ key: 'n', label: 'n', defaultValue: '19' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isHappy(int n) {'),
      L('        int slow = n, fast = n;', 'init'),
      L('        do {', 'loop'),
      L('            slow = next(slow);', 'move'),
      L('            fast = next(next(fast));', 'move'),
      L('        } while (slow != fast);', 'meet'),
      L('        return slow == 1;', 'ret'),
      L('    }'),
      L('    int next(int n) {', 'nextfn'),
      L('        int sum = 0;'),
      L('        while (n > 0) {'),
      L('            int d = n % 10;'),
      L('            sum += d * d;'),
      L('            n /= 10;'),
      L('        }'),
      L('        return sum;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isHappy(int n) {'),
      L('        int slow = n, fast = n;', 'init'),
      L('        do {', 'loop'),
      L('            slow = next(slow);', 'move'),
      L('            fast = next(next(fast));', 'move'),
      L('        } while (slow != fast);', 'meet'),
      L('        return slow == 1;', 'ret'),
      L('    }'),
      L('    private int next(int n) {', 'nextfn'),
      L('        int sum = 0;'),
      L('        while (n > 0) {'),
      L('            int d = n % 10;'),
      L('            sum += d * d;'),
      L('            n /= 10;'),
      L('        }'),
      L('        return sum;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 999 });
    if (typeof n === 'string') return { error: n };
    const next = (v: number): number => {
      let s = 0;
      while (v > 0) {
        const d = v % 10;
        s += d * d;
        v = Math.floor(v / 10);
      }
      return s;
    };
    const steps: Step[] = [];
    const seq: number[] = [n];
    let slow = n;
    let fast = n;
    const view = (): ListState => ({
      chains: [
        {
          label: 'sequence',
          items: seq.map((v, i) => ({
            v,
            mark: v === 1 ? ('final' as const) : v === slow && v === fast && i === seq.length - 1 ? ('active' as const) : undefined,
          })),
          broken: true,
        },
      ],
      aggs: [
        { label: 'slow', value: String(slow), c: 'b' },
        { label: 'fast', value: String(fast), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Repeatedly replace n by the ', A('sum of its squared digits'), '. Happy numbers reach 1; the rest fall into a cycle. Floyd\'s tortoise & hare detects which.'], state: view() });
    let guard = 0;
    do {
      slow = next(slow);
      fast = next(next(fast));
      while (seq[seq.length - 1] !== fast && guard < 30) {
        const last = seq[seq.length - 1];
        seq.push(next(last));
        guard++;
      }
      steps.push({
        tag: 'move',
        tag2: 'nextfn',
        trace: ['Tick: slow → ', B(slow), ', fast (two hops) → ', A(fast), '.'],
        state: view(),
      });
    } while (slow !== fast && guard++ < 30);
    const happy = slow === 1;
    steps.push({
      tag: happy ? 'ret' : 'meet',
      trace: happy
        ? ['The pointers met at ', C(1), ' — the sequence collapsed to 1. ', C(String(n)), ' is happy!']
        : ['The pointers met at ', F(slow), ' ≠ 1 — the sequence is trapped in a cycle. ', C(String(n)), ' is not happy.'],
      state: view(),
    });
    return { steps, result: String(happy), resultDetail: happy ? 'sequence reaches 1' : `cycle detected at ${slow}` };
  },
  note: 'The digit-square map sends every number below ~1000 quickly into a small range, so the sequence must eventually repeat — meaning "unhappy" is precisely "cycles without touching 1". Floyd\'s cycle detection answers that in O(1) space, the same trick as Linked List Cycle.',
  complexity: { time: 'O(log n) per step', space: 'O(1)' },
};

export const mathBits = [singleNumber, hammingWeight, countingBits, reverseBits, missingNumber, sumTwoIntegers, romanToInt, intToRoman, powXN, sqrtX, happyNumber];
