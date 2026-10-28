// Code Catalyst — Practice Set 8: stacks.
import type { ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { ag, arr, fmt, parseStrList, parseWord } from './util';

const cpp = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L('public:'),
  L(`    ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('};'),
];
const java = (sig: string, body: [string, ...string[]][]) => [
  L('class Solution {'),
  L(`    public ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('}'),
];

/* ================= Remove All Adjacent Duplicates In String ================= */
const removeAdjacent: ProblemDef = {
  slug: 'remove-all-adjacent-duplicates-in-string',
  title: 'Remove All Adjacent Duplicates In String',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/',
  technique: 'Use the result string as a stack: if the next char equals the top, pop; otherwise push.',
  widget: 'stack',
  widgetTitle: 's and the result stack',
  inputs: [{ key: 's', label: 's', defaultValue: 'abbaca' }],
  code: {
    cpp: cpp('string removeDuplicates(string s)', [
      ['string st;'],
      ['for (char c : s) {'],
      ['    if (!st.empty() && st.back() == c) st.pop_back();', 'pop'],
      ['    else st.push_back(c);', 'push'],
      ['}'],
      ['return st;', 'ret'],
    ]),
    java: java('String removeDuplicates(String s)', [
      ['StringBuilder st = new StringBuilder();'],
      ['for (char c : s.toCharArray()) {'],
      ['    int n = st.length();'],
      ['    if (n > 0 && st.charAt(n - 1) == c) st.deleteCharAt(n - 1);', 'pop'],
      ['    else st.append(c);', 'push'],
      ['}'],
      ['return st.toString();', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 18, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const cs = s.split('');
    const st: string[] = [];
    const out: Step[] = [];
    const view = (i: number | null): StackState => ({ array: arr(cs, { ptrs: i === null ? [] : [{ name: 'c', i, c: 'a' }] }), stack: st.map((v) => ({ v })), stackLabel: 'result' });
    cs.forEach((c, i) => {
      if (st.length && st[st.length - 1] === c) {
        st.pop();
        out.push({ tag: 'pop', trace: [A(c), ' matches the top — the pair cancels. Pop it.'], state: view(i) });
      } else {
        st.push(c);
        out.push({ tag: 'push', trace: [A(c), ' does not match the top — push it.'], state: view(i) });
      }
    });
    out.push({ tag: 'ret', trace: ['What remains: ', C(`"${st.join('')}"`), '.'], state: view(null) });
    return { steps: out, result: `"${st.join('')}"` };
  },
  note: 'Removing a pair can make two chars that were apart become neighbours ("abba" → "aa" → ""). A stack handles that chain reaction for free: after a pop, the new top is exactly the char that is now adjacent.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Remove All Adjacent Duplicates in String II ================= */
const removeAdjacentII: ProblemDef = {
  slug: 'remove-all-adjacent-duplicates-in-string-ii',
  title: 'Remove All Adjacent Duplicates in String II',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/',
  technique: 'Stack of (char, run length); when a run reaches k, pop it.',
  widget: 'stack',
  widgetTitle: 's and the (char × count) stack',
  inputs: [
    { key: 's', label: 's', defaultValue: 'deeedbbcccbdaa' },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: cpp('string removeDuplicates(string s, int k)', [
      ['vector<pair<char, int>> st;'],
      ['for (char c : s) {'],
      ['    if (!st.empty() && st.back().first == c) st.back().second++;', 'grow'],
      ['    else st.push_back({c, 1});', 'push'],
      ['    if (st.back().second == k) st.pop_back();', 'pop'],
      ['}'],
      ['string res;'],
      ['for (auto& [c, n] : st) res.append(n, c);', 'ret'],
      ['return res;', 'ret'],
    ]),
    java: java('String removeDuplicates(String s, int k)', [
      ['Deque<int[]> st = new ArrayDeque<>();'],
      ['for (char c : s.toCharArray()) {'],
      ['    if (!st.isEmpty() && st.peek()[0] == c) st.peek()[1]++;', 'grow'],
      ['    else st.push(new int[]{c, 1});', 'push'],
      ['    if (st.peek()[1] == k) st.pop();', 'pop'],
      ['}'],
      ['StringBuilder res = new StringBuilder();'],
      ['for (Iterator<int[]> it = st.descendingIterator(); it.hasNext();) { int[] p = it.next(); res.append(String.valueOf((char) p[0]).repeat(p[1])); }', 'ret'],
      ['return res.toString();', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 20, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const k = parseInt1(values.k, 'k', { min: 2, max: 10 });
    if (typeof k === 'string') return { error: k };
    const cs = s.split('');
    const st: [string, number][] = [];
    const out: Step[] = [];
    const view = (i: number | null): StackState => ({ array: arr(cs, { ptrs: i === null ? [] : [{ name: 'c', i, c: 'a' }] }), stack: st.map(([c, n]) => ({ v: `${c} × ${n}` })), stackLabel: 'runs', aggs: [ag('k', k)] });
    cs.forEach((c, i) => {
      if (st.length && st[st.length - 1][0] === c) {
        st[st.length - 1][1]++;
        out.push({ tag: 'grow', trace: [A(c), ' extends the run on top to ', B(st[st.length - 1][1]), '.'], state: view(i) });
      } else {
        st.push([c, 1]);
        out.push({ tag: 'push', trace: [A(c), ' starts a new run.'], state: view(i) });
      }
      if (st[st.length - 1][1] === k) {
        st.pop();
        out.push({ tag: 'pop', trace: ['The run of ', F(c), ' reached ', String(k), ' — remove it.'], state: view(i) });
      }
    });
    const res = st.map(([c, n]) => c.repeat(n)).join('');
    out.push({ tag: 'ret', trace: ['Rebuild from the runs: ', C(`"${res}"`), '.'], state: view(null) });
    return { steps: out, result: `"${res}"` };
  },
  note: 'Storing a count with each char means you never rescan the string to see how long the current run is. When a run of k vanishes, the new top already knows its own count, so cascading removals keep working.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Design a Stack With Increment Operation ================= */
const customStack: ProblemDef = {
  slug: 'design-a-stack-with-increment-operation',
  title: 'Design a Stack With Increment Operation',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-a-stack-with-increment-operation/',
  technique: 'Lazy increments: inc[i] stores a pending add for the bottom i+1 items; pop applies it and passes it down.',
  widget: 'stack',
  widgetTitle: 'stack / pending inc[]',
  inputs: [
    { key: 'maxSize', label: 'maxSize', defaultValue: '3' },
    { key: 'ops', label: 'operations', defaultValue: 'push 1, push 2, pop, push 2, push 3, push 4, increment 5 100, increment 2 100, pop, pop, pop, pop', wide: true },
  ],
  code: {
    cpp: [
      L('class CustomStack {'),
      L('    vector<int> st, inc;'),
      L('    int cap;'),
      L('public:'),
      L('    CustomStack(int maxSize) : cap(maxSize) {}'),
      L('    void push(int x) {'),
      L('        if (st.size() < cap) { st.push_back(x); inc.push_back(0); }', 'push', 'full'),
      L('    }'),
      L('    int pop() {'),
      L('        if (st.empty()) return -1;', 'empty'),
      L('        int i = st.size() - 1;', 'pop'),
      L('        if (i > 0) inc[i - 1] += inc[i];', 'pop'),
      L('        int v = st[i] + inc[i];', 'pop'),
      L('        st.pop_back(); inc.pop_back();', 'pop'),
      L('        return v;', 'pop'),
      L('    }'),
      L('    void increment(int k, int val) {'),
      L('        int i = min(k, (int) st.size()) - 1;', 'inc'),
      L('        if (i >= 0) inc[i] += val;', 'inc'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class CustomStack {'),
      L('    private final int[] st, inc;'),
      L('    private int n = 0;'),
      L('    public CustomStack(int maxSize) { st = new int[maxSize]; inc = new int[maxSize]; }'),
      L('    public void push(int x) {'),
      L('        if (n < st.length) { st[n] = x; inc[n] = 0; n++; }', 'push', 'full'),
      L('    }'),
      L('    public int pop() {'),
      L('        if (n == 0) return -1;', 'empty'),
      L('        int i = --n;', 'pop'),
      L('        if (i > 0) inc[i - 1] += inc[i];', 'pop'),
      L('        return st[i] + inc[i];', 'pop'),
      L('    }'),
      L('    public void increment(int k, int val) {'),
      L('        int i = Math.min(k, n) - 1;', 'inc'),
      L('        if (i >= 0) inc[i] += val;', 'inc'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const cap = parseInt1(values.maxSize, 'maxSize', { min: 1, max: 10 });
    if (typeof cap === 'string') return { error: cap };
    const ops = values.ops.split(',').map((o) => o.trim()).filter(Boolean);
    if (ops.length === 0 || ops.length > 20) return { error: 'Give 1–20 operations like "push 3, increment 2 100, pop".' };
    const st: number[] = [];
    const inc: number[] = [];
    const res: (number | string)[] = ['null'];
    const out: Step[] = [];
    const view = (): StackState => ({ stack: st.map((v) => ({ v })), stackLabel: 'stored values', stack2: inc.map((v) => ({ v: v ? `+${v}` : '0', c: v ? 'a' : 'f' })), stack2Label: 'pending inc', aggs: [ag('outputs', fmt(res), 'c')] });
    for (const op of ops) {
      const [name, ...args] = op.split(/\s+/);
      const nums = args.map(Number);
      if (nums.some((x) => !Number.isInteger(x))) return { error: `Bad arguments in "${op}".` };
      if (name === 'push' && nums.length === 1) {
        res.push('null');
        if (st.length < cap) {
          st.push(nums[0]);
          inc.push(0);
          out.push({ tag: 'push', trace: ['push(', A(nums[0]), '): room left, so store it with no pending increment.'], state: view() });
        } else out.push({ tag: 'full', trace: ['push(', F(nums[0]), '): the stack is full (', String(cap), ') — ignored.'], state: view() });
      } else if (name === 'pop' && nums.length === 0) {
        if (!st.length) {
          res.push(-1);
          out.push({ tag: 'empty', trace: ['pop(): empty stack → ', C(-1), '.'], state: view() });
        } else {
          const i = st.length - 1;
          if (i > 0) inc[i - 1] += inc[i];
          const v = st[i] + inc[i];
          const pend = inc[i];
          st.pop();
          inc.pop();
          res.push(v);
          out.push({ tag: 'pop', trace: ['pop(): stored ', A(v - pend), ' + pending ', B(pend), ' = ', C(v), pend && i > 0 ? '. Hand the pending add down to the next item.' : '.'], state: view() });
        }
      } else if (name === 'increment' && nums.length === 2) {
        res.push('null');
        const i = Math.min(nums[0], st.length) - 1;
        if (i >= 0) inc[i] += nums[1];
        out.push({ tag: 'inc', trace: ['increment(', String(nums[0]), ', ', String(nums[1]), '): instead of touching ', A(i + 1), ' items, note ', B(`+${nums[1]}`), ' once at index ', String(i), '. It applies to everything at or below it.'], state: view() });
      } else return { error: `Unknown operation "${op}". Use push x, pop, or increment k val.` };
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'A naive increment touches k items. Recording "+val for everything up to index i" at one slot, and pushing that pending amount down a level whenever the top is popped, makes every operation O(1).',
  complexity: { time: 'O(1) per operation', space: 'O(maxSize)' },
};

/* ================= Final Prices With a Special Discount in a Shop ================= */
const finalPrices: ProblemDef = {
  slug: 'final-prices-with-a-special-discount-in-a-shop',
  title: 'Final Prices With a Special Discount in a Shop',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/',
  technique: 'Monotonic stack of items waiting for a discount: the first later price ≤ theirs pops them.',
  widget: 'stack',
  widgetTitle: 'prices and items waiting for a discount',
  inputs: [{ key: 'prices', label: 'prices', defaultValue: '8, 4, 6, 2, 3', wide: true }],
  code: {
    cpp: cpp('vector<int> finalPrices(vector<int>& prices)', [
      ['vector<int> ans = prices;'],
      ['stack<int> st;'],
      ['for (int i = 0; i < prices.size(); i++) {'],
      ['    while (!st.empty() && prices[st.top()] >= prices[i]) {', 'pop'],
      ['        ans[st.top()] -= prices[i]; st.pop();', 'pop'],
      ['    }'],
      ['    st.push(i);', 'push'],
      ['}'],
      ['return ans;', 'ret'],
    ]),
    java: java('int[] finalPrices(int[] prices)', [
      ['int[] ans = prices.clone();'],
      ['Deque<Integer> st = new ArrayDeque<>();'],
      ['for (int i = 0; i < prices.length; i++) {'],
      ['    while (!st.isEmpty() && prices[st.peek()] >= prices[i]) {', 'pop'],
      ['        ans[st.pop()] -= prices[i];', 'pop'],
      ['    }'],
      ['    st.push(i);', 'push'],
      ['}'],
      ['return ans;', 'ret'],
    ]),
  },
  run(values) {
    const p = parseIntArray(values.prices, { maxLen: 14, min: 1 });
    if (typeof p === 'string') return { error: p };
    const ans = [...p];
    const st: number[] = [];
    const out: Step[] = [];
    const view = (i: number | null): StackState => ({ array: arr(p, { ptrs: i === null ? [] : [{ name: 'i', i, c: 'a' }], aggs: [ag('final', fmt(ans), 'c')] }), stack: st.map((j) => ({ v: `${p[j]} (#${j})` })), stackLabel: 'waiting' });
    p.forEach((x, i) => {
      while (st.length && p[st[st.length - 1]] >= x) {
        const j = st.pop()!;
        ans[j] -= x;
        out.push({ tag: 'pop', trace: [A(x), ' ≤ ', B(p[j]), ' (#', String(j), '), so item #', String(j), ' gets ', A(x), ' off: ', C(ans[j]), '.'], state: view(i) });
      }
      st.push(i);
      out.push({ tag: 'push', trace: ['Item #', String(i), ' (', A(x), ') waits for a later price ≤ ', String(x), '.'], state: view(i) });
    });
    out.push({ tag: 'ret', trace: ['Items still waiting get no discount. Final: ', C(fmt(ans)), '.'], state: view(null) });
    return { steps: out, result: fmt(ans) };
  },
  note: 'This is "next smaller-or-equal element". Waiting items are kept in increasing order on the stack, so a new price pops exactly those it discounts. Each index is pushed and popped once — O(n) instead of the O(n²) double loop.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Baseball Game ================= */
const baseballGame: ProblemDef = {
  slug: 'baseball-game',
  title: 'Baseball Game',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/baseball-game/',
  technique: 'Keep valid scores on a stack: "+" adds the top two, "D" doubles the top, "C" pops it.',
  widget: 'stack',
  widgetTitle: 'operations and the score stack',
  inputs: [{ key: 'ops', label: 'operations', defaultValue: '["5","-2","4","C","D","9","+","+"]', wide: true }],
  code: {
    cpp: cpp('int calPoints(vector<string>& operations)', [
      ['vector<int> st;'],
      ['for (auto& op : operations) {'],
      ['    if (op == "+") st.push_back(st[st.size() - 1] + st[st.size() - 2]);', 'plus'],
      ['    else if (op == "D") st.push_back(2 * st.back());', 'double'],
      ['    else if (op == "C") st.pop_back();', 'cancel'],
      ['    else st.push_back(stoi(op));', 'num'],
      ['}'],
      ['return accumulate(st.begin(), st.end(), 0);', 'ret'],
    ]),
    java: java('int calPoints(String[] operations)', [
      ['Deque<Integer> st = new ArrayDeque<>();'],
      ['for (String op : operations) {'],
      ['    if (op.equals("+")) { int a = st.pop(), b = st.peek(); st.push(a); st.push(a + b); }', 'plus'],
      ['    else if (op.equals("D")) st.push(2 * st.peek());', 'double'],
      ['    else if (op.equals("C")) st.pop();', 'cancel'],
      ['    else st.push(Integer.parseInt(op));', 'num'],
      ['}'],
      ['int sum = 0; for (int x : st) sum += x;'],
      ['return sum;', 'ret'],
    ]),
  },
  run(values) {
    const ops = parseStrList(values.ops, 'operations', 14);
    if ('error' in ops) return ops;
    const st: number[] = [];
    const out: Step[] = [];
    const view = (i: number | null): StackState => ({ array: arr(ops, { ptrs: i === null ? [] : [{ name: 'op', i, c: 'a' }] }), stack: st.map((v) => ({ v })), stackLabel: 'scores' });
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if (op === '+') {
        if (st.length < 2) return { error: '"+" needs two previous scores.' };
        st.push(st[st.length - 1] + st[st.length - 2]);
        out.push({ tag: 'plus', trace: ['"+": add the last two scores → push ', B(st[st.length - 1]), '.'], state: view(i) });
      } else if (op === 'D') {
        if (!st.length) return { error: '"D" needs a previous score.' };
        st.push(2 * st[st.length - 1]);
        out.push({ tag: 'double', trace: ['"D": double the last score → push ', B(st[st.length - 1]), '.'], state: view(i) });
      } else if (op === 'C') {
        if (!st.length) return { error: '"C" needs a previous score.' };
        const v = st.pop();
        out.push({ tag: 'cancel', trace: ['"C": the last score ', F(v), ' is invalid — pop it.'], state: view(i) });
      } else {
        const n = Number(op);
        if (!Number.isInteger(n)) return { error: `"${op}" is not a number, "+", "D" or "C".` };
        st.push(n);
        out.push({ tag: 'num', trace: ['Record a new score ', A(n), '.'], state: view(i) });
      }
    }
    const sum = st.reduce((a, b) => a + b, 0);
    out.push({ tag: 'ret', trace: ['Total of the remaining scores: ', C(sum), '.'], state: view(null) });
    return { steps: out, result: String(sum) };
  },
  note: 'Every operation only ever looks at the most recent valid scores, and "C" can undo them in reverse order. That last-in-first-out access is exactly what a stack gives you.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const ccStacks: ProblemDef[] = [removeAdjacent, removeAdjacentII, customStack, finalPrices, baseballGame];
