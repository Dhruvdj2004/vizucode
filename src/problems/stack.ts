// Stack / Monotonic Stack problems.
import type { ArrayState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 30. Valid Parentheses ================= */
const validParens: ProblemDef = {
  slug: 'valid-parentheses',
  title: 'Valid Parentheses',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/valid-parentheses/',
  technique: 'A stack: openers wait on the stack, and every closer must match the most recent opener.',
  widget: 'stack',
  widgetTitle: 'Input & stack',
  inputs: [{ key: 's', label: 'Brackets', defaultValue: '({[]})', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isValid(string s) {'),
      L('        stack<char> st;', 'init'),
      L('        for (char c : s) {', 'loop'),
      L('            if (c == \'(\' || c == \'[\' || c == \'{\')', 'push'),
      L('                st.push(c);', 'push'),
      L('            else {'),
      L('                if (st.empty()) return false;', 'bad'),
      L('                char open = st.top(); st.pop();', 'match'),
      L('                if ((c == \')\' && open != \'(\') ||', 'match', 'bad'),
      L('                    (c == \']\' && open != \'[\') ||', 'bad'),
      L('                    (c == \'}\' && open != \'{\'))', 'bad'),
      L('                    return false;', 'bad'),
      L('            }'),
      L('        }'),
      L('        return st.empty();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isValid(String s) {'),
      L('        Deque<Character> st = new ArrayDeque<>();', 'init'),
      L('        for (char c : s.toCharArray()) {', 'loop'),
      L('            if (c == \'(\' || c == \'[\' || c == \'{\')', 'push'),
      L('                st.push(c);', 'push'),
      L('            else {'),
      L('                if (st.isEmpty()) return false;', 'bad'),
      L('                char open = st.pop();', 'match'),
      L('                if ((c == \')\' && open != \'(\') ||', 'match', 'bad'),
      L('                    (c == \']\' && open != \'[\') ||', 'bad'),
      L('                    (c == \'}\' && open != \'{\'))', 'bad'),
      L('                    return false;', 'bad'),
      L('            }'),
      L('        }'),
      L('        return st.isEmpty();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!s) return { error: 'Enter a bracket string.' };
    if (!/^[()[\]{}]+$/.test(s)) return { error: 'Only ()[]{}.' };
    if (s.length > 20) return { error: 'Keep it to at most 20 characters.' };

    const chars = s.split('');
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: string[] = [];
    const steps: Step[] = [];
    const st = (i: number, extra?: { mark?: ArrayState['mark'] }): StackState => ({
      array: { arr: chars, ptrs: i < chars.length && i >= 0 ? [{ name: 'i', i, c: 'a' }] : [], mark: extra?.mark },
      stack: stack.map((v) => ({ v })),
      stackLabel: 'Stack',
    });
    steps.push({ tag: 'init', trace: ['Openers pile up; each closer must pair with the ', A('top of the stack'), '.'], state: st(-1) });
    let ok = true;
    let failMsg = '';
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (pairs[c] === undefined) {
        stack.push(c);
        steps.push({ tag: 'push', trace: ["'", A(c), "' opens — push it."], state: st(i) });
      } else {
        if (stack.length === 0) {
          ok = false;
          failMsg = `'${c}' has nothing to close`;
          steps.push({ tag: 'bad', trace: ["'", F(c), "' closes, but the stack is empty — nothing to match. Return ", C('false'), '.'], state: st(i, { mark: { [i]: 'dim' } }) });
          break;
        }
        const open = stack.pop()!;
        if (open !== pairs[c]) {
          ok = false;
          failMsg = `'${c}' closes '${open}'`;
          steps.push({ tag: 'bad', trace: ["'", F(c), "' closes, but the top is '", F(open), "' — wrong type. Return ", C('false'), '.'], state: st(i, { mark: { [i]: 'dim' } }) });
          break;
        }
        steps.push({ tag: 'match', trace: ["'", B(c), "' matches the popped '", B(open), "' — balanced so far."], state: st(i, { mark: { [i]: 'good' } }) });
      }
    }
    if (ok && stack.length > 0) {
      ok = false;
      failMsg = `${stack.length} unclosed opener(s)`;
      steps.push({ tag: 'ret', trace: ['Input ended but ', F(stack.join(' ')), ' never closed — return ', C('false'), '.'], state: st(chars.length) });
    } else if (ok) {
      steps.push({ tag: 'ret', trace: ['Every bracket found its partner and the stack is empty — return ', C('true'), '.'], state: st(chars.length) });
    }
    return { steps, result: String(ok), resultDetail: ok ? undefined : failMsg };
  },
  note: 'Brackets nest — the most recently opened must close first — and "most recent first" is literally what a stack is. Any mismatch, early closer, or leftover opener falsifies the string.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 31. Min Stack ================= */
const minStack: ProblemDef = {
  slug: 'min-stack',
  title: 'Min Stack',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/min-stack/',
  technique: 'A twin stack records the minimum alongside every pushed value.',
  widget: 'stack',
  widgetTitle: 'Value stack & min stack',
  inputs: [{ key: 'ops', label: 'Ops (push n / pop / top / getMin)', defaultValue: 'push -2, push 0, push -3, getMin, pop, top, getMin', wide: true }],
  code: {
    cpp: [
      L('class MinStack {'),
      L('    stack<int> st, mins;', 'init'),
      L('public:'),
      L('    void push(int val) {', 'push'),
      L('        st.push(val);', 'push'),
      L('        mins.push(mins.empty() ? val : min(val, mins.top()));', 'push'),
      L('    }'),
      L('    void pop() {', 'pop'),
      L('        st.pop();', 'pop'),
      L('        mins.pop();', 'pop'),
      L('    }'),
      L('    int top() { return st.top(); }', 'top'),
      L('    int getMin() { return mins.top(); }', 'min'),
      L('};'),
    ],
    java: [
      L('class MinStack {'),
      L('    private Deque<Integer> st = new ArrayDeque<>();', 'init'),
      L('    private Deque<Integer> mins = new ArrayDeque<>();', 'init'),
      L('    public void push(int val) {', 'push'),
      L('        st.push(val);', 'push'),
      L('        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));', 'push'),
      L('    }'),
      L('    public void pop() {', 'pop'),
      L('        st.pop();', 'pop'),
      L('        mins.pop();', 'pop'),
      L('    }'),
      L('    public int top() { return st.peek(); }', 'top'),
      L('    public int getMin() { return mins.peek(); }', 'min'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter at least one operation.' };
    if (raw.length > 15) return { error: 'Keep it to at most 15 operations.' };

    const stack: number[] = [];
    const mins: number[] = [];
    const steps: Step[] = [];
    const outputs: string[] = [];
    const st = (): StackState => ({
      stack: stack.map((v) => ({ v })),
      stackLabel: 'Values',
      stack2: mins.map((v) => ({ v, c: 'b' as const })),
      stack2Label: 'Mins',
      aggs: [{ label: 'outputs', value: outputs.join(', ') || '—', c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Two stacks move in lockstep: the second remembers ', B('the min of everything below it'), '.'], state: st() });
    for (const op of raw) {
      const m = op.match(/^push\s+(-?\d+)$/i);
      if (m) {
        const v = Number(m[1]);
        stack.push(v);
        mins.push(mins.length === 0 ? v : Math.min(v, mins[mins.length - 1]));
        steps.push({
          tag: 'push',
          trace: ['push(', A(v), ') — mins gets ', B(mins[mins.length - 1]), ' (min of new value and old min).'],
          state: st(),
        });
      } else if (/^pop$/i.test(op)) {
        if (stack.length === 0) return { error: `"${op}" on an empty stack.` };
        const v = stack.pop()!;
        mins.pop();
        steps.push({ tag: 'pop', trace: ['pop() removes ', F(v), ' — both stacks shrink together.'], state: st() });
      } else if (/^top$/i.test(op)) {
        if (stack.length === 0) return { error: `"${op}" on an empty stack.` };
        outputs.push(`top→${stack[stack.length - 1]}`);
        steps.push({ tag: 'top', trace: ['top() → ', C(stack[stack.length - 1]), '.'], state: st() });
      } else if (/^getmin$/i.test(op)) {
        if (mins.length === 0) return { error: `"${op}" on an empty stack.` };
        outputs.push(`min→${mins[mins.length - 1]}`);
        steps.push({ tag: 'min', trace: ['getMin() → ', C(mins[mins.length - 1]), ' — read straight off the twin stack, O(1).'], state: st() });
      } else {
        return { error: `Unknown op "${op}". Use: push n, pop, top, getMin.` };
      }
    }
    return { steps, result: outputs.join('  ') || 'done', resultDetail: 'all operations O(1)' };
  },
  note: 'The minimum of a stack only changes when the element holding it is pushed or popped — so recording "min so far" at every level keeps getMin O(1), trading a second stack of memory for zero recomputation.',
  complexity: { time: 'O(1) per op', space: 'O(n)' },
};

/* ================= 32. Evaluate Reverse Polish Notation ================= */
const evalRPN: ProblemDef = {
  slug: 'evaluate-reverse-polish-notation',
  title: 'Evaluate Reverse Polish Notation',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
  technique: 'Numbers go on the stack; every operator consumes the top two and pushes the result.',
  widget: 'stack',
  widgetTitle: 'Tokens & stack',
  inputs: [{ key: 'tokens', label: 'Tokens (space/comma separated)', defaultValue: '2, 1, +, 3, *', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int evalRPN(vector<string>& tokens) {'),
      L('        stack<long> st;', 'init'),
      L('        for (string& t : tokens) {', 'loop'),
      L('            if (t == "+" || t == "-" || t == "*" || t == "/") {', 'op'),
      L('                long b = st.top(); st.pop();', 'op'),
      L('                long a = st.top(); st.pop();', 'op'),
      L('                if (t == "+") st.push(a + b);', 'op'),
      L('                else if (t == "-") st.push(a - b);', 'op'),
      L('                else if (t == "*") st.push(a * b);', 'op'),
      L('                else st.push(a / b);', 'op'),
      L('            } else {'),
      L('                st.push(stol(t));', 'num'),
      L('            }'),
      L('        }'),
      L('        return st.top();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int evalRPN(String[] tokens) {'),
      L('        Deque<Long> st = new ArrayDeque<>();', 'init'),
      L('        for (String t : tokens) {', 'loop'),
      L('            switch (t) {', 'op'),
      L('                case "+": { long b = st.pop(), a = st.pop(); st.push(a + b); break; }', 'op'),
      L('                case "-": { long b = st.pop(), a = st.pop(); st.push(a - b); break; }', 'op'),
      L('                case "*": { long b = st.pop(), a = st.pop(); st.push(a * b); break; }', 'op'),
      L('                case "/": { long b = st.pop(), a = st.pop(); st.push(a / b); break; }', 'op'),
      L('                default: st.push(Long.parseLong(t));', 'num'),
      L('            }'),
      L('        }'),
      L('        return st.pop().intValue();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const tokens = (values.tokens ?? '').split(/[,\s]+/).filter(Boolean);
    if (tokens.length === 0) return { error: 'Enter tokens.' };
    if (tokens.length > 18) return { error: 'Keep it to at most 18 tokens.' };

    const stack: number[] = [];
    const steps: Step[] = [];
    const st = (i: number): StackState => ({
      array: { arr: tokens, ptrs: i >= 0 && i < tokens.length ? [{ name: 't', i, c: 'a' }] : [] },
      stack: stack.map((v) => ({ v })),
      stackLabel: 'Stack',
    });
    steps.push({ tag: 'init', trace: ['RPN has no parentheses: by the time an operator appears, its two operands are the top of the stack.'], state: st(-1) });
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (['+', '-', '*', '/'].includes(t)) {
        if (stack.length < 2) return { error: `Operator "${t}" needs two operands on the stack.` };
        const b = stack.pop()!;
        const a = stack.pop()!;
        const r = t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : Math.trunc(a / b);
        stack.push(r);
        steps.push({
          tag: 'op',
          trace: ["'", A(t), "' pops ", F(a), ' and ', F(b), ' → pushes ', B(`${a} ${t} ${b} = ${r}`), '.'],
          state: st(i),
        });
      } else {
        const n = Number(t);
        if (!Number.isFinite(n)) return { error: `"${t}" is neither a number nor an operator.` };
        stack.push(n);
        steps.push({ tag: 'num', trace: ['Number ', A(n), ' — push it.'], state: st(i) });
      }
    }
    if (stack.length !== 1) return { error: 'Malformed expression: stack should end with exactly one value.' };
    steps.push({ tag: 'ret', trace: ['One value remains — the answer: ', C(stack[0]), '.'], state: st(tokens.length) });
    return { steps, result: String(stack[0]) };
  },
  note: 'Postfix order *is* evaluation order — the stack replays exactly the operand lifetimes a compiler would compute, which is why RPN needs no precedence rules and no parentheses.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 33. Generate Parentheses ================= */
const generateParens: ProblemDef = {
  slug: 'generate-parentheses',
  title: 'Generate Parentheses',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/generate-parentheses/',
  technique: 'Backtracking with two counters: add "(" while any remain, add ")" only when it would not overtake.',
  widget: 'stack',
  widgetTitle: 'Current build & results',
  inputs: [{ key: 'n', label: 'n (pairs)', defaultValue: '3' }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<string> generateParenthesis(int n) {'),
      L('        vector<string> res;', 'init'),
      L('        string cur;', 'init'),
      L('        backtrack(n, 0, 0, cur, res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    void backtrack(int n, int open, int close, string& cur, vector<string>& res) {'),
      L('        if (cur.size() == 2 * n) {', 'done'),
      L('            res.push_back(cur);', 'done'),
      L('            return;', 'done'),
      L('        }'),
      L('        if (open < n) {', 'open'),
      L('            cur.push_back(\'(\');', 'open'),
      L('            backtrack(n, open + 1, close, cur, res);', 'open'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('        if (close < open) {', 'close'),
      L('            cur.push_back(\')\');', 'close'),
      L('            backtrack(n, open, close + 1, cur, res);', 'close'),
      L('            cur.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<String> generateParenthesis(int n) {'),
      L('        List<String> res = new ArrayList<>();', 'init'),
      L('        backtrack(n, 0, 0, new StringBuilder(), res);', 'init'),
      L('        return res;', 'retall'),
      L('    }'),
      L('    private void backtrack(int n, int open, int close, StringBuilder cur, List<String> res) {'),
      L('        if (cur.length() == 2 * n) {', 'done'),
      L('            res.add(cur.toString());', 'done'),
      L('            return;', 'done'),
      L('        }'),
      L('        if (open < n) {', 'open'),
      L('            cur.append(\'(\');', 'open'),
      L('            backtrack(n, open + 1, close, cur, res);', 'open'),
      L('            cur.deleteCharAt(cur.length() - 1);', 'undo'),
      L('        }'),
      L('        if (close < open) {', 'close'),
      L('            cur.append(\')\');', 'close'),
      L('            backtrack(n, open, close + 1, cur, res);', 'close'),
      L('            cur.deleteCharAt(cur.length() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 4 });
    if (typeof n === 'string') return { error: n };

    const steps: Step[] = [];
    const res: string[] = [];
    let cur = '';
    const st = (): StackState => ({
      stack: cur.split('').map((v) => ({ v })),
      stackLabel: 'Current (top = last)',
      stack2: res.map((v) => ({ v, c: 'c' as const })),
      stack2Label: 'Results',
      aggs: [
        { label: 'open used', value: `${cur.split('(').length - 1}/${n}`, c: 'a' },
        { label: 'close used', value: `${cur.split(')').length - 1}/${n}`, c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Build strings character by character; a prefix stays legal iff closers never outnumber openers.'], state: st() });
    const backtrack = (open: number, close: number) => {
      if (steps.length > 300) return;
      if (cur.length === 2 * n) {
        res.push(cur);
        steps.push({ tag: 'done', trace: ['Length ', B(2 * n), ' reached — "', C(cur), '" is complete. Record it.'], state: st() });
        return;
      }
      if (open < n) {
        cur += '(';
        steps.push({ tag: 'open', trace: ['Room for another opener — try "', A('('), '" → "', A(cur), '".'], state: st() });
        backtrack(open + 1, close);
        cur = cur.slice(0, -1);
        steps.push({ tag: 'undo', trace: ['Backtrack: remove the "', F('('), '" and explore the other branch from "', A(cur || 'ε'), '".'], state: st() });
      }
      if (close < open) {
        cur += ')';
        steps.push({ tag: 'close', trace: ['A closer is safe (', A(close), ' < ', A(open), ' opens) — try "', A(')'), '" → "', A(cur), '".'], state: st() });
        backtrack(open, close + 1);
        cur = cur.slice(0, -1);
        steps.push({ tag: 'undo', trace: ['Backtrack: remove the "', F(')'), '".'], state: st() });
      }
    };
    backtrack(0, 0);
    steps.push({ tag: 'retall', trace: ['Search space exhausted — all ', C(res.length), ' well-formed strings found.'], state: st() });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} valid combinations (Catalan number)` };
  },
  note: 'The two guards — "open < n" and "close < open" — are precisely the invariant of well-formed prefixes, so the recursion never generates an invalid string and never needs to validate anything after the fact.',
  complexity: { time: 'O(Catalan(n) · n)', space: 'O(n)' },
};

/* ================= 34. Daily Temperatures ================= */
const dailyTemps: ProblemDef = {
  slug: 'daily-temperatures',
  title: 'Daily Temperatures',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/daily-temperatures/',
  technique: 'Monotonic decreasing stack: each new day resolves every colder day still waiting.',
  widget: 'stack',
  widgetTitle: 'Temperatures & waiting stack',
  inputs: [{ key: 'temps', label: 'Temperatures', defaultValue: '73, 74, 75, 71, 69, 72, 76, 73', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> dailyTemperatures(vector<int>& t) {'),
      L('        vector<int> res(t.size(), 0);', 'init'),
      L('        stack<int> st;  // indices, temps decreasing', 'init'),
      L('        for (int i = 0; i < t.size(); i++) {', 'loop'),
      L('            while (!st.empty() && t[st.top()] < t[i]) {', 'resolve'),
      L('                int j = st.top(); st.pop();', 'resolve'),
      L('                res[j] = i - j;', 'resolve'),
      L('            }'),
      L('            st.push(i);', 'push'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] dailyTemperatures(int[] t) {'),
      L('        int[] res = new int[t.length];', 'init'),
      L('        Deque<Integer> st = new ArrayDeque<>();', 'init'),
      L('        for (int i = 0; i < t.length; i++) {', 'loop'),
      L('            while (!st.isEmpty() && t[st.peek()] < t[i]) {', 'resolve'),
      L('                int j = st.pop();', 'resolve'),
      L('                res[j] = i - j;', 'resolve'),
      L('            }'),
      L('            st.push(i);', 'push'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const t = parseIntArray(values.temps, { maxLen: 14 });
    if (typeof t === 'string') return { error: t };

    const res = Array(t.length).fill(0);
    const stack: number[] = [];
    const steps: Step[] = [];
    const resolved: ArrayState['mark'] = {};
    const st = (i: number): StackState => ({
      array: {
        arr: t.map((v, j) => (res[j] > 0 ? `${v}｜${res[j]}` : `${v}｜·`)),
        ptrs: i >= 0 && i < t.length ? [{ name: 'i', i, c: 'a' }] : [],
        mark: { ...resolved },
      },
      stack: stack.map((j, pos) => ({ v: `d${j}: ${t[j]}°`, c: pos === stack.length - 1 ? undefined : undefined })),
      stackLabel: 'Waiting (colder ↓)',
    });
    steps.push({ tag: 'init', trace: ['Each box shows ', A('temp｜answer'), '. Days wait on the stack until a warmer day arrives.'], state: st(-1) });
    for (let i = 0; i < t.length; i++) {
      while (stack.length > 0 && t[stack[stack.length - 1]] < t[i]) {
        const j = stack.pop()!;
        res[j] = i - j;
        resolved[j] = 'good';
        steps.push({
          tag: 'resolve',
          trace: ['Day ', A(i), ' (', A(t[i]), '°) is warmer than waiting day ', B(j), ' (', B(t[j]), '°) — its answer is ', B(i - j), ' day(s).'],
          state: st(i),
        });
      }
      stack.push(i);
      steps.push({ tag: 'push', trace: ['Day ', A(i), ' joins the waiting stack.'], state: st(i) });
    }
    steps.push({
      tag: 'ret',
      trace: [F(String(stack.length)), ' day(s) never saw a warmer day — they stay 0. Result: ', C(`[${res.join(', ')}]`), '.'],
      state: st(t.length),
    });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: 'days until a warmer temperature' };
  },
  note: 'The stack holds exactly the days whose answer is still unknown, and they are necessarily in decreasing temperature order — so a new day pops (resolves) precisely the suffix it beats. Every index is pushed and popped once: O(n).',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 35. Car Fleet ================= */
const carFleet: ProblemDef = {
  slug: 'car-fleet',
  title: 'Car Fleet',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/car-fleet/',
  technique: 'Sort by position, then compare arrival times from the car nearest the target backwards.',
  widget: 'stack',
  widgetTitle: 'Cars (sorted) & fleet stack',
  inputs: [
    { key: 'target', label: 'Target', defaultValue: '12' },
    { key: 'position', label: 'Positions', defaultValue: '10, 8, 0, 5, 3', wide: true },
    { key: 'speed', label: 'Speeds', defaultValue: '2, 4, 1, 1, 3', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int carFleet(int target, vector<int>& pos, vector<int>& speed) {'),
      L('        int n = pos.size();', 'init'),
      L('        vector<int> idx(n);', 'init'),
      L('        iota(idx.begin(), idx.end(), 0);', 'init'),
      L('        sort(idx.begin(), idx.end(), [&](int a, int b) {', 'sort'),
      L('            return pos[a] > pos[b];', 'sort'),
      L('        });'),
      L('        stack<double> fleets;  // arrival times', 'init'),
      L('        for (int i : idx) {', 'loop'),
      L('            double time = (double)(target - pos[i]) / speed[i];', 'time'),
      L('            if (fleets.empty() || time > fleets.top())', 'newfleet'),
      L('                fleets.push(time);', 'newfleet'),
      L('        }'),
      L('        return fleets.size();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int carFleet(int target, int[] pos, int[] speed) {'),
      L('        int n = pos.length;', 'init'),
      L('        Integer[] idx = new Integer[n];', 'init'),
      L('        for (int i = 0; i < n; i++) idx[i] = i;', 'init'),
      L('        Arrays.sort(idx, (a, b) -> pos[b] - pos[a]);', 'sort'),
      L('        Deque<Double> fleets = new ArrayDeque<>();', 'init'),
      L('        for (int i : idx) {', 'loop'),
      L('            double time = (double)(target - pos[i]) / speed[i];', 'time'),
      L('            if (fleets.isEmpty() || time > fleets.peek())', 'newfleet'),
      L('                fleets.push(time);', 'newfleet'),
      L('        }'),
      L('        return fleets.size();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const target = parseInt1(values.target, 'Target', { min: 1 });
    if (typeof target === 'string') return { error: target };
    const pos = parseIntArray(values.position, { min: 0, maxLen: 10 });
    if (typeof pos === 'string') return { error: pos };
    const speed = parseIntArray(values.speed, { min: 1, maxLen: 10 });
    if (typeof speed === 'string') return { error: speed };
    if (pos.length !== speed.length) return { error: 'Positions and speeds must have the same length.' };
    if (pos.some((p) => p >= target)) return { error: 'All positions must be < target.' };

    const idx = pos.map((_, i) => i).sort((a, b) => pos[b] - pos[a]);
    const fleets: number[] = [];
    const steps: Step[] = [];
    const round = (x: number) => Math.round(x * 100) / 100;
    const sorted = idx.map((i) => `p${pos[i]} v${speed[i]}`);
    const st = (i: number): StackState => ({
      array: { arr: sorted, ptrs: i >= 0 && i < sorted.length ? [{ name: 'car', i, c: 'a' }] : [] },
      stack: fleets.map((tm) => ({ v: `t=${round(tm)}`, c: 'b' as const })),
      stackLabel: 'Fleets (arrival)',
    });
    steps.push({
      tag: 'sort',
      trace: ['Sort cars by starting position, nearest to the target first: ', A(sorted.join(' · ')), '.'],
      state: st(-1),
    });
    for (let k = 0; k < idx.length; k++) {
      const i = idx[k];
      const time = (target - pos[i]) / speed[i];
      steps.push({
        tag: 'time',
        trace: ['Car at ', A(pos[i]), ' needs (', A(target), ' − ', A(pos[i]), ') / ', A(speed[i]), ' = ', A(round(time)), ' to arrive (if unblocked).'],
        state: st(k),
      });
      if (fleets.length === 0 || time > fleets[fleets.length - 1]) {
        fleets.push(time);
        steps.push({
          tag: 'newfleet',
          trace: ['It arrives ', B('later'), ' than the fleet ahead — it can never catch up. A ', B('new fleet'), ' forms (total ', B(fleets.length), ').'],
          state: st(k),
        });
      } else {
        steps.push({
          tag: 'newfleet',
          trace: ['It would arrive at ', F(round(time)), ' ≤ the fleet ahead (', B(round(fleets[fleets.length - 1])), ') — it catches up and ', F('merges'), '; speed capped by the leader.'],
          state: st(k),
        });
      }
    }
    steps.push({ tag: 'ret', trace: ['Fleets that reach the target: ', C(fleets.length), '.'], state: st(idx.length) });
    return { steps, result: String(fleets.length), resultDetail: 'distinct fleets at the target' };
  },
  note: 'Once sorted by position, a car merges into the fleet ahead iff its solo arrival time is ≤ that fleet\'s time — merging can only slow you to the leader\'s pace, never speed you up. The stack of strictly increasing arrival times is exactly the set of surviving fleets.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

/* ================= 36. Largest Rectangle in Histogram ================= */
const largestRect: ProblemDef = {
  slug: 'largest-rectangle-in-histogram',
  title: 'Largest Rectangle in Histogram',
  category: 'Stack',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
  technique: 'Monotonic increasing stack: a falling edge finalizes every taller bar\'s widest rectangle.',
  widget: 'stack',
  widgetTitle: 'Histogram & stack',
  inputs: [{ key: 'heights', label: 'Heights', defaultValue: '2, 1, 5, 6, 2, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int largestRectangleArea(vector<int>& h) {'),
      L('        stack<int> st;  // indices, heights increasing', 'init'),
      L('        int best = 0;', 'init'),
      L('        for (int i = 0; i <= h.size(); i++) {', 'loop'),
      L('            int cur = (i == h.size()) ? 0 : h[i];', 'loop'),
      L('            while (!st.empty() && h[st.top()] > cur) {', 'popcalc'),
      L('                int height = h[st.top()]; st.pop();', 'popcalc'),
      L('                int width = st.empty() ? i : i - st.top() - 1;', 'popcalc'),
      L('                best = max(best, height * width);', 'popcalc'),
      L('            }'),
      L('            st.push(i);', 'push'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int largestRectangleArea(int[] h) {'),
      L('        Deque<Integer> st = new ArrayDeque<>();', 'init'),
      L('        int best = 0;', 'init'),
      L('        for (int i = 0; i <= h.length; i++) {', 'loop'),
      L('            int cur = (i == h.length) ? 0 : h[i];', 'loop'),
      L('            while (!st.isEmpty() && h[st.peek()] > cur) {', 'popcalc'),
      L('                int height = h[st.pop()];', 'popcalc'),
      L('                int width = st.isEmpty() ? i : i - st.peek() - 1;', 'popcalc'),
      L('                best = Math.max(best, height * width);', 'popcalc'),
      L('            }'),
      L('            st.push(i);', 'push'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const h = parseIntArray(values.heights, { min: 0, maxLen: 12 });
    if (typeof h === 'string') return { error: h };

    const stack: number[] = [];
    let best = 0;
    let bestRange: [number, number, number] | null = null; // [l, r, height]
    const steps: Step[] = [];
    const st = (i: number, mark?: ArrayState['mark']): StackState => ({
      array: { arr: h, bars: true, ptrs: i >= 0 && i < h.length ? [{ name: 'i', i, c: 'a' }] : [], mark },
      stack: stack.map((j) => ({ v: `i${j}: h=${h[j]}` })),
      stackLabel: 'Rising bars',
      aggs: [{ label: 'best area', value: String(best), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Bars wait on the stack while heights rise; a drop tells each taller bar exactly how far right it could stretch.'], state: st(-1) });
    for (let i = 0; i <= h.length; i++) {
      const cur = i === h.length ? 0 : h[i];
      while (stack.length > 0 && h[stack[stack.length - 1]] > cur) {
        const height = h[stack.pop()!];
        const l = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
        const width = i - l;
        const area = height * width;
        if (area > best) {
          best = area;
          bestRange = [l, i - 1, height];
        }
        steps.push({
          tag: 'popcalc',
          trace: [
            i === h.length ? 'End of bars' : `Height drops to ${cur}`,
            ' — bar of height ', A(height), ' stretches over [', A(l), '…', A(i - 1), ']: area = ', A(height), ' × ', A(width), ' = ',
            area === best && bestRange && bestRange[2] === height ? B(area) : A(area), '.',
          ],
          state: st(Math.min(i, h.length - 1), Object.fromEntries([...Array(width)].map((_, k) => [l + k, 'win']))),
        });
      }
      if (i < h.length) {
        stack.push(i);
        steps.push({ tag: 'push', trace: ['Bar ', A(i), ' (height ', A(h[i]), ') joins the rising stack.'], state: st(i) });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Largest rectangle: ', C(best), bestRange ? [' — height '].join('') : '', bestRange ? C(bestRange[2]) : '', bestRange ? ' spanning columns ' : '', bestRange ? C(`${bestRange[0]}…${bestRange[1]}`) : '', '.'],
      state: st(h.length, bestRange ? Object.fromEntries([...Array(bestRange[1] - bestRange[0] + 1)].map((_, k) => [bestRange![0] + k, 'final'])) : undefined),
    });
    return { steps, result: String(best), resultDetail: bestRange ? `height ${bestRange[2]} × width ${bestRange[1] - bestRange[0] + 1}` : undefined };
  },
  note: 'A bar\'s maximal rectangle is bounded by the first shorter bar on each side. The increasing stack discovers both bounds at once: the popping moment supplies the right bound, and the new stack top is the left bound. One pass, every bar settled exactly once.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 37. Decode String ================= */
const decodeString: ProblemDef = {
  slug: 'decode-string',
  title: 'Decode String',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/decode-string/',
  technique: 'Two stacks save the outer context at every "[", and "]" restores and repeats.',
  widget: 'stack',
  widgetTitle: 'Input & saved contexts',
  inputs: [{ key: 's', label: 'Encoded string', defaultValue: '3[a2[c]]', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string decodeString(string s) {'),
      L('        stack<int> counts;', 'init'),
      L('        stack<string> saved;', 'init'),
      L('        string cur; int k = 0;', 'init'),
      L('        for (char c : s) {', 'loop'),
      L('            if (isdigit(c))', 'digit'),
      L('                k = k * 10 + (c - \'0\');', 'digit'),
      L('            else if (c == \'[\') {', 'open'),
      L('                counts.push(k); saved.push(cur);', 'open'),
      L('                k = 0; cur = "";', 'open'),
      L('            } else if (c == \']\') {', 'closeb'),
      L('                int n = counts.top(); counts.pop();', 'closeb'),
      L('                string prev = saved.top(); saved.pop();', 'closeb'),
      L('                string repeated;', 'closeb'),
      L('                while (n--) repeated += cur;', 'closeb'),
      L('                cur = prev + repeated;', 'closeb'),
      L('            } else'),
      L('                cur += c;', 'char'),
      L('        }'),
      L('        return cur;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String decodeString(String s) {'),
      L('        Deque<Integer> counts = new ArrayDeque<>();', 'init'),
      L('        Deque<String> saved = new ArrayDeque<>();', 'init'),
      L('        StringBuilder cur = new StringBuilder();', 'init'),
      L('        int k = 0;', 'init'),
      L('        for (char c : s.toCharArray()) {', 'loop'),
      L('            if (Character.isDigit(c))', 'digit'),
      L('                k = k * 10 + (c - \'0\');', 'digit'),
      L('            else if (c == \'[\') {', 'open'),
      L('                counts.push(k); saved.push(cur.toString());', 'open'),
      L('                k = 0; cur = new StringBuilder();', 'open'),
      L('            } else if (c == \']\') {', 'closeb'),
      L('                StringBuilder tmp = new StringBuilder(saved.pop());', 'closeb'),
      L('                int n = counts.pop();', 'closeb'),
      L('                tmp.append(cur.toString().repeat(n));', 'closeb'),
      L('                cur = tmp;', 'closeb'),
      L('            } else'),
      L('                cur.append(c);', 'char'),
      L('        }'),
      L('        return cur.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!s) return { error: 'Enter an encoded string.' };
    if (!/^[a-z0-9[\]]+$/.test(s)) return { error: 'Use lowercase letters, digits, and [ ] only.' };
    if (s.length > 24) return { error: 'Keep it to at most 24 characters.' };

    const chars = s.split('');
    const counts: number[] = [];
    const saved: string[] = [];
    let cur = '';
    let k = 0;
    const steps: Step[] = [];
    const st = (i: number): StackState => ({
      array: { arr: chars, ptrs: i >= 0 && i < chars.length ? [{ name: 'c', i, c: 'a' }] : [] },
      stack: saved.map((v, j) => ({ v: `"${v || 'ε'}" ×${counts[j]}` })),
      stackLabel: 'Saved contexts',
      aggs: [
        { label: 'cur', value: `"${cur}"`, c: 'a' },
        { label: 'k', value: String(k), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Build the current segment; brackets save and restore the surrounding context.'], state: st(-1) });
    let expanded = 0;
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (/\d/.test(c)) {
        k = k * 10 + Number(c);
        steps.push({ tag: 'digit', trace: ['Digit ', A(c), ' — pending repeat count k = ', A(k), '.'], state: st(i) });
      } else if (c === '[') {
        counts.push(k);
        saved.push(cur);
        steps.push({ tag: 'open', trace: ["'", A('['), "' — save (\"", A(cur || 'ε'), '", ×', A(k), ') and start a fresh segment.'], state: st(i) });
        k = 0;
        cur = '';
      } else if (c === ']') {
        if (counts.length === 0) return { error: 'Unbalanced "]" — nothing to close.' };
        const n = counts.pop()!;
        const prev = saved.pop()!;
        expanded += cur.length * n;
        if (expanded > 200) return { error: 'Decoded string would exceed 200 characters — use a smaller input.' };
        cur = prev + cur.repeat(n);
        steps.push({
          tag: 'closeb',
          trace: ["'", A(']'), "' — repeat the segment ×", B(n), ' and reattach: cur = "', B(cur), '".'],
          state: st(i),
        });
      } else {
        cur += c;
        steps.push({ tag: 'char', trace: ["Letter '", A(c), "' appends → \"", A(cur), '".'], state: st(i) });
      }
    }
    if (counts.length > 0) return { error: 'Unbalanced "[" — never closed.' };
    steps.push({ tag: 'ret', trace: ['Fully decoded: "', C(cur), '".'], state: st(chars.length) });
    return { steps, result: `"${cur}"`, resultDetail: `${cur.length} characters` };
  },
  note: 'Nested encodings are recursive, and the stack is the iterative stand-in for that recursion: "[" is a call (save the frame), "]" is a return (restore and combine). The pair of stacks is exactly a call stack split into its two fields.',
  complexity: { time: 'O(output length)', space: 'O(nesting depth)' },
};

/* ================= 38. Next Greater Element I ================= */
const nextGreater: ProblemDef = {
  slug: 'next-greater-element-i',
  title: 'Next Greater Element I',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/next-greater-element-i/',
  technique: 'Monotonic stack over nums2 precomputes every element\'s next greater; nums1 just looks up.',
  widget: 'stack',
  widgetTitle: 'nums2 scan & stack',
  inputs: [
    { key: 'nums1', label: 'nums1 (subset)', defaultValue: '4, 1, 2', wide: true },
    { key: 'nums2', label: 'nums2', defaultValue: '1, 3, 4, 2', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {'),
      L('        unordered_map<int, int> next;', 'init'),
      L('        stack<int> st;', 'init'),
      L('        for (int x : nums2) {', 'loop'),
      L('            while (!st.empty() && st.top() < x) {', 'resolve'),
      L('                next[st.top()] = x;', 'resolve'),
      L('                st.pop();', 'resolve'),
      L('            }'),
      L('            st.push(x);', 'push'),
      L('        }'),
      L('        vector<int> res;', 'lookup'),
      L('        for (int x : nums1)', 'lookup'),
      L('            res.push_back(next.count(x) ? next[x] : -1);', 'lookup'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] nextGreaterElement(int[] nums1, int[] nums2) {'),
      L('        Map<Integer, Integer> next = new HashMap<>();', 'init'),
      L('        Deque<Integer> st = new ArrayDeque<>();', 'init'),
      L('        for (int x : nums2) {', 'loop'),
      L('            while (!st.isEmpty() && st.peek() < x)', 'resolve'),
      L('                next.put(st.pop(), x);', 'resolve'),
      L('            st.push(x);', 'push'),
      L('        }'),
      L('        int[] res = new int[nums1.length];', 'lookup'),
      L('        for (int i = 0; i < nums1.length; i++)', 'lookup'),
      L('            res[i] = next.getOrDefault(nums1[i], -1);', 'lookup'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const n1 = parseIntArray(values.nums1, { maxLen: 10 });
    if (typeof n1 === 'string') return { error: n1 };
    const n2 = parseIntArray(values.nums2, { maxLen: 12 });
    if (typeof n2 === 'string') return { error: n2 };
    if (new Set(n2).size !== n2.length) return { error: 'nums2 values must be distinct.' };
    if (!n1.every((x) => n2.includes(x))) return { error: 'Every nums1 value must appear in nums2.' };

    const next = new Map<number, number>();
    const stack: number[] = [];
    const steps: Step[] = [];
    const fmtNext = () => ([...next.entries()].map(([a, b]) => `${a}→${b}`).join(' ') || '—');
    const st = (i: number): StackState => ({
      array: { arr: n2, ptrs: i >= 0 && i < n2.length ? [{ name: 'x', i, c: 'a' }] : [] },
      stack: stack.map((v) => ({ v })),
      stackLabel: 'Awaiting greater',
      aggs: [{ label: 'next-greater map', value: fmtNext(), c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Scan nums2 once; values wait on the stack until something bigger arrives.'], state: st(-1) });
    for (let i = 0; i < n2.length; i++) {
      const x = n2[i];
      while (stack.length > 0 && stack[stack.length - 1] < x) {
        const y = stack.pop()!;
        next.set(y, x);
        steps.push({ tag: 'resolve', trace: [A(x), ' is the first value greater than waiting ', B(y), ' — record ', B(`${y} → ${x}`), '.'], state: st(i) });
      }
      stack.push(x);
      steps.push({ tag: 'push', trace: ['Push ', A(x), ' to wait for its own greater element.'], state: st(i) });
    }
    const res = n1.map((x) => next.get(x) ?? -1);
    steps.push({
      tag: 'lookup',
      trace: ['Now nums1 is pure lookup: ', ...n1.flatMap((x, i) => (i > 0 ? [', ', A(x), '→', res[i] === -1 ? F('-1') : B(res[i])] : [A(x), '→', res[i] === -1 ? F('-1') : B(res[i])])), '.'],
      state: st(n2.length),
    });
    steps.push({ tag: 'ret', trace: ['Answer: ', C(`[${res.join(', ')}]`), '.'], state: st(n2.length) });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'The stack always holds a decreasing run of values still waiting for their "next greater" — a newcomer resolves exactly the ones it exceeds. Precomputing over nums2 makes each nums1 query O(1) instead of a rightward rescan.',
  complexity: { time: 'O(n1 + n2)', space: 'O(n2)' },
};

export const stackProblems = [validParens, minStack, evalRPN, generateParens, dailyTemps, carFleet, largestRect, decodeString, nextGreater];
