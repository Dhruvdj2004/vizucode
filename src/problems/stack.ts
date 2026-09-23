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
  brute: {
    label: 'Delete matched pairs',
    technique: 'Keep deleting any adjacent "()", "[]" or "{}" until nothing changes; the string was valid iff it ends up empty.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isValid(string s) {'),
        L('        bool changed = true;', 'init'),
        L('        while (changed) {', 'pass'),
        L('            changed = false;', 'pass'),
        L('            for (string p : {"()", "[]", "{}"}) {', 'pass'),
        L('                size_t at = s.find(p);', 'pass'),
        L('                if (at != string::npos) { s.erase(at, 2); changed = true; }', 'remove'),
        L('            }'),
        L('        }'),
        L('        return s.empty();', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isValid(String s) {'),
        L('        String prev = null;', 'init'),
        L('        while (!s.equals(prev)) {', 'pass'),
        L('            prev = s;', 'pass'),
        L('            s = s.replace("()", "").replace("[]", "").replace("{}", "");', 'pass', 'remove'),
        L('        }'),
        L('        return s.isEmpty();', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s0 = (values.s ?? '').trim();
      if (!s0) return { error: 'Enter a bracket string.' };
      if (!/^[()[\]{}]+$/.test(s0)) return { error: 'Only ()[]{}.' };
      if (s0.length > 20) return { error: 'Keep it to at most 20 characters.' };
      let s = s0;
      const steps: Step[] = [];
      const st = (at?: number): StackState => ({
        array: { arr: s.length ? s.split('') : ['∅'], mark: at !== undefined ? { [at]: 'active', [at + 1]: 'active' } : {} },
        stack: [],
        stackLabel: 'no stack — the string itself shrinks',
      });
      steps.push({ tag: 'init', trace: ['A valid string always contains an adjacent matched pair somewhere. Delete pairs until none are left.'], state: st() });
      let changed = true;
      while (changed) {
        changed = false;
        for (const p of ['()', '[]', '{}']) {
          const at = s.indexOf(p);
          if (at >= 0) {
            steps.push({ tag: 'remove', trace: ['Found "', A(p), '" at position ', A(at), ' — delete it.'], state: st(at) });
            s = s.slice(0, at) + s.slice(at + 2);
            changed = true;
          }
        }
      }
      const ok = s.length === 0;
      steps.push({ tag: 'ret', trace: ok ? ['Everything cancelled out — ', C('true'), '.'] : ['"', F(s), '" is left with no adjacent pair — ', C('false'), '.'], state: st() });
      return { steps, result: String(ok), resultDetail: ok ? undefined : `left over: ${s}` };
    },
    note: 'Each deletion rescans and rebuilds the string, so deeply nested input like "((((…))))" costs O(n²). The stack matches each closer against the most recent opener in a single pass.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Scan for the minimum',
    technique: 'Keep a single stack; getMin walks the whole stack to find the smallest value.',
    code: {
      cpp: [
        L('class MinStack {'),
        L('    vector<int> st;', 'init'),
        L('public:'),
        L('    void push(int v) { st.push_back(v); }', 'push'),
        L('    void pop() { st.pop_back(); }', 'pop'),
        L('    int top() { return st.back(); }', 'top'),
        L('    int getMin() { return *min_element(st.begin(), st.end()); }  // O(n)', 'min'),
        L('};'),
      ],
      java: [
        L('class MinStack {'),
        L('    Deque<Integer> st = new ArrayDeque<>();', 'init'),
        L('    public void push(int v) { st.push(v); }', 'push'),
        L('    public void pop() { st.pop(); }', 'pop'),
        L('    public int top() { return st.peek(); }', 'top'),
        L('    public int getMin() { return Collections.min(st); }  // O(n)', 'min'),
        L('}'),
      ],
    },
    run(values) {
      const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
      if (raw.length === 0) return { error: 'Enter at least one operation.' };
      if (raw.length > 15) return { error: 'Keep it to at most 15 operations.' };
      const stack: number[] = [];
      const outputs: string[] = [];
      const steps: Step[] = [];
      let scanned = 0;
      const st = (hl?: number): StackState => ({
        stack: stack.map((v, i) => ({ v, c: i === hl ? ('b' as const) : undefined })),
        stackLabel: 'Values (no twin stack)',
        aggs: [
          { label: 'values scanned by getMin', value: String(scanned), c: 'a' },
          { label: 'outputs', value: outputs.join(', ') || '—', c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['One plain stack. push/pop/top stay O(1); getMin has to look at everything.'], state: st() });
      for (const op of raw) {
        const m = op.match(/^push\s+(-?\d+)$/i);
        if (m) {
          stack.push(Number(m[1]));
          steps.push({ tag: 'push', trace: ['push(', A(m[1]), ').'], state: st() });
        } else if (/^pop$/i.test(op)) {
          if (!stack.length) return { error: `"${op}" on an empty stack.` };
          const v = stack.pop()!;
          steps.push({ tag: 'pop', trace: ['pop() removes ', F(v), '.'], state: st() });
        } else if (/^top$/i.test(op)) {
          if (!stack.length) return { error: `"${op}" on an empty stack.` };
          outputs.push(`top→${stack[stack.length - 1]}`);
          steps.push({ tag: 'top', trace: ['top() → ', C(stack[stack.length - 1]), '.'], state: st() });
        } else if (/^getmin$/i.test(op)) {
          if (!stack.length) return { error: `"${op}" on an empty stack.` };
          scanned += stack.length;
          const mn = Math.min(...stack);
          outputs.push(`min→${mn}`);
          steps.push({ tag: 'min', trace: ['getMin() scans all ', A(stack.length), ' values → ', C(mn), '.'], state: st(stack.lastIndexOf(mn)) });
        } else {
          return { error: `Unknown op "${op}". Use: push n, pop, top, getMin.` };
        }
      }
      return { steps, result: outputs.join('  ') || 'done', resultDetail: 'getMin is O(n)' };
    },
    note: 'Simple, but getMin is O(n) — the problem requires O(1). Storing the running minimum next to every value means the answer is always on top.',
    complexity: { time: 'O(1) push/pop/top, O(n) getMin', space: 'O(n)' },
  },
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
  brute: {
    label: 'Rewrite the token list',
    technique: 'Find the first operator, replace it and its two operands with their result, and repeat until one token is left.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int evalRPN(vector<string>& t) {'),
        L('        while (t.size() > 1) {', 'op'),
        L('            int i = 0;', 'op'),
        L('            while (!isOp(t[i])) i++;  // first operator', 'op'),
        L('            long a = stol(t[i - 2]), b = stol(t[i - 1]);', 'op'),
        L('            long r = apply(t[i], a, b);', 'op'),
        L('            t.erase(t.begin() + i - 2, t.begin() + i + 1);', 'op'),
        L('            t.insert(t.begin() + i - 2, to_string(r));', 'op'),
        L('        }'),
        L('        return stoi(t[0]);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int evalRPN(String[] tokens) {'),
        L('        List<String> t = new ArrayList<>(Arrays.asList(tokens));'),
        L('        while (t.size() > 1) {', 'op'),
        L('            int i = 0;', 'op'),
        L('            while (!isOp(t.get(i))) i++;  // first operator', 'op'),
        L('            long a = Long.parseLong(t.get(i - 2)), b = Long.parseLong(t.get(i - 1));', 'op'),
        L('            long r = apply(t.get(i), a, b);', 'op'),
        L('            for (int k = 0; k < 3; k++) t.remove(i - 2);', 'op'),
        L('            t.add(i - 2, String.valueOf(r));', 'op'),
        L('        }'),
        L('        return Integer.parseInt(t.get(0));', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const tokens = (values.tokens ?? '').split(/[,\s]+/).filter(Boolean);
      if (tokens.length === 0) return { error: 'Enter tokens.' };
      if (tokens.length > 18) return { error: 'Keep it to at most 18 tokens.' };
      const ops = ['+', '-', '*', '/'];
      for (const t of tokens) if (!ops.includes(t) && !Number.isFinite(Number(t))) return { error: `"${t}" is neither a number nor an operator.` };
      const t = [...tokens];
      const steps: Step[] = [];
      const st = (hl: number[] = []): StackState => ({
        array: { arr: [...t], mark: Object.fromEntries(hl.map((i) => [i, 'active' as const])) },
        stack: [],
        stackLabel: 'no stack — the token list is rewritten',
      });
      steps.push({ tag: 'op', trace: ['Repeatedly collapse the leftmost "a b op" into its value.'], state: st() });
      while (t.length > 1) {
        const i = t.findIndex((x) => ops.includes(x));
        if (i < 2) return { error: 'Malformed expression: an operator needs two operands before it.' };
        const a = Number(t[i - 2]);
        const b = Number(t[i - 1]);
        const op = t[i];
        if (ops.includes(t[i - 2]) || ops.includes(t[i - 1])) return { error: 'Malformed expression.' };
        const r = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b);
        steps.push({ tag: 'op', trace: ['Leftmost operator ', A(op), ' at position ', A(i), ': ', A(`${a} ${op} ${b}`), ' = ', B(r), '.'], state: st([i - 2, i - 1, i]) });
        t.splice(i - 2, 3, String(r));
      }
      if (ops.includes(t[0])) return { error: 'Malformed expression.' };
      steps.push({ tag: 'ret', trace: ['One token left — the answer: ', C(t[0]), '.'], state: st([0]) });
      return { steps, result: String(Number(t[0])) };
    },
    note: 'Every reduction searches for the next operator and shifts the list, giving O(n²). A stack keeps the pending operands exactly where the next operator needs them, so each token is handled once.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Generate & filter',
    technique: 'Build all 2²ⁿ strings of "(" and ")", then keep only the balanced ones.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool valid(const string& s) {'),
        L('        int bal = 0;'),
        L('        for (char c : s) { bal += c == \'(\' ? 1 : -1; if (bal < 0) return false; }'),
        L('        return bal == 0;'),
        L('    }'),
        L('    void gen(string& cur, int n, vector<string>& res) {'),
        L('        if (cur.size() == 2 * n) { if (valid(cur)) res.push_back(cur); return; }', 'check', 'hit'),
        L('        for (char c : {\'(\', \')\'}) { cur += c; gen(cur, n, res); cur.pop_back(); }'),
        L('    }'),
        L('public:'),
        L('    vector<string> generateParenthesis(int n) {'),
        L('        vector<string> res; string cur;', 'init'),
        L('        gen(cur, n, res);', 'init'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean valid(String s) {'),
        L('        int bal = 0;'),
        L('        for (char c : s.toCharArray()) { bal += c == \'(\' ? 1 : -1; if (bal < 0) return false; }'),
        L('        return bal == 0;'),
        L('    }'),
        L('    void gen(StringBuilder cur, int n, List<String> res) {'),
        L('        if (cur.length() == 2 * n) { if (valid(cur.toString())) res.add(cur.toString()); return; }', 'check', 'hit'),
        L('        for (char c : new char[]{\'(\', \')\'}) { cur.append(c); gen(cur, n, res); cur.deleteCharAt(cur.length() - 1); }'),
        L('    }'),
        L('    public List<String> generateParenthesis(int n) {'),
        L('        List<String> res = new ArrayList<>();', 'init'),
        L('        gen(new StringBuilder(), n, res);', 'init'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const n = parseInt1(values.n, 'n', { min: 1, max: 4 });
      if (typeof n === 'string') return { error: n };
      const steps: Step[] = [];
      const res: string[] = [];
      let tried = 0;
      const st = (cur: string): StackState => ({
        stack: cur.split('').map((v) => ({ v })),
        stackLabel: 'Candidate',
        stack2: res.map((v) => ({ v, c: 'c' as const })),
        stack2Label: 'Results',
        aggs: [{ label: 'strings tried', value: `${tried} / ${4 ** n}`, c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['No pruning: produce all ', A(4 ** n), ' strings of length ', A(2 * n), ' and test each one.'], state: st('') });
      const valid = (s: string) => {
        let bal = 0;
        for (const c of s) {
          bal += c === '(' ? 1 : -1;
          if (bal < 0) return false;
        }
        return bal === 0;
      };
      const gen = (cur: string) => {
        if (cur.length === 2 * n) {
          tried++;
          const ok = valid(cur);
          if (ok) res.push(cur);
          if (ok || steps.length < 40) steps.push({ tag: ok ? 'hit' : 'check', trace: ['"', ok ? B(cur) : F(cur), '" is ', ok ? B('balanced — keep it') : F('not balanced'), '.'], state: st(cur) });
          return;
        }
        gen(cur + '(');
        gen(cur + ')');
      };
      gen('');
      steps.push({ tag: 'ret', trace: [C(res.length), ' valid out of ', A(tried), ' generated.'], state: st('') });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: `${res.length} valid combinations (Catalan number)` };
    },
    note: 'Only the Catalan number of the 4ⁿ strings are valid (5 of 64 for n = 3), so almost all the work is wasted. Backtracking never places a ")" that would overtake the "(" count, so it only builds valid prefixes.',
    complexity: { time: 'O(4ⁿ · n)', space: 'O(n)' },
  },
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
  brute: {
    label: 'Scan forward',
    technique: 'For each day, walk forward until a warmer day appears.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> dailyTemperatures(vector<int>& t) {'),
        L('        int n = t.size();', 'init'),
        L('        vector<int> res(n, 0);', 'init'),
        L('        for (int i = 0; i < n; i++)', 'day'),
        L('            for (int j = i + 1; j < n; j++)', 'day'),
        L('                if (t[j] > t[i]) { res[i] = j - i; break; }', 'day'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] dailyTemperatures(int[] t) {'),
        L('        int n = t.length;', 'init'),
        L('        int[] res = new int[n];', 'init'),
        L('        for (int i = 0; i < n; i++)', 'day'),
        L('            for (int j = i + 1; j < n; j++)', 'day'),
        L('                if (t[j] > t[i]) { res[i] = j - i; break; }', 'day'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const t = parseIntArray(values.temps, { maxLen: 14 });
      if (typeof t === 'string') return { error: t };
      const n = t.length;
      const res = Array(n).fill(0);
      let looks = 0;
      const steps: Step[] = [];
      const st = (i: number, j?: number): StackState => ({
        array: {
          arr: t.map((v, k) => (k < i || (k === i && j !== undefined) ? `${v}｜${res[k]}` : `${v}｜·`)),
          ptrs: [...(i < n ? [{ name: 'i', i, c: 'a' as const }] : []), ...(j !== undefined && j < n ? [{ name: 'j', i: j, c: 'b' as const }] : [])],
        },
        stack: [],
        stackLabel: 'no stack',
        aggs: [{ label: 'days looked at', value: String(looks), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Each box shows ', A('temperature｜days to wait'), '. For every day, look ahead until it gets warmer.'], state: st(0) });
      for (let i = 0; i < n; i++) {
        let j = i + 1;
        for (; j < n; j++) {
          looks++;
          if (t[j] > t[i]) {
            res[i] = j - i;
            break;
          }
        }
        steps.push({
          tag: 'day',
          trace: res[i] ? ['Day ', A(i), ' (', A(t[i]), '°): first warmer day is ', B(j), ' → wait ', B(res[i]), '.'] : ['Day ', A(i), ' (', A(t[i]), '°): never gets warmer → ', F(0), '.'],
          state: st(i, res[i] ? j : undefined),
        });
      }
      steps.push({ tag: 'ret', trace: ['Answer: ', C(`[${res.join(', ')}]`), ' after ', A(looks), ' look-aheads.'], state: st(n) });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: 'days until a warmer temperature' };
    },
    note: 'A long cold spell makes every day scan far ahead, giving O(n²). The monotonic stack lets each new day settle all the colder days waiting on it, so each index is pushed and popped once.',
    complexity: { time: 'O(n²)', space: 'O(1) beyond output' },
  },
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
  brute: {
    label: 'Compare with every car ahead',
    technique: 'A car leads its own fleet exactly when it would arrive later than every car starting ahead of it; check all of them.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int carFleet(int target, vector<int>& pos, vector<int>& speed) {'),
        L('        int n = pos.size(), fleets = 0;', 'sort'),
        L('        for (int i = 0; i < n; i++) {', 'time'),
        L('            double ti = double(target - pos[i]) / speed[i];', 'time'),
        L('            bool leader = true;', 'time'),
        L('            for (int j = 0; j < n; j++)  // every car ahead', 'time'),
        L('                if (pos[j] > pos[i] && double(target - pos[j]) / speed[j] >= ti) leader = false;', 'time'),
        L('            fleets += leader;', 'newfleet'),
        L('        }'),
        L('        return fleets;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int carFleet(int target, int[] pos, int[] speed) {'),
        L('        int n = pos.length, fleets = 0;', 'sort'),
        L('        for (int i = 0; i < n; i++) {', 'time'),
        L('            double ti = (double) (target - pos[i]) / speed[i];', 'time'),
        L('            boolean leader = true;', 'time'),
        L('            for (int j = 0; j < n; j++)  // every car ahead', 'time'),
        L('                if (pos[j] > pos[i] && (double) (target - pos[j]) / speed[j] >= ti) leader = false;', 'time'),
        L('            if (leader) fleets++;', 'newfleet'),
        L('        }'),
        L('        return fleets;', 'ret'),
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
      const n = pos.length;
      const round = (x: number) => Math.round(x * 100) / 100;
      const times = pos.map((p, i) => (target - p) / speed[i]);
      const leaders: number[] = [];
      const steps: Step[] = [];
      const labels = pos.map((p, i) => `p${p} v${speed[i]} t${round(times[i])}`);
      const st = (i?: number): StackState => ({
        array: { arr: labels, ptrs: i !== undefined && i < n ? [{ name: 'car', i, c: 'a' }] : [] },
        stack: leaders.map((k) => ({ v: `lead: p${pos[k]} t=${round(times[k])}`, c: 'b' as const })),
        stackLabel: 'Fleet leaders',
      });
      steps.push({ tag: 'sort', trace: ['No sorting: for each car, compare its arrival time with every car that starts ahead of it.'], state: st() });
      for (let i = 0; i < n; i++) {
        const blocker = pos.findIndex((p, j) => p > pos[i] && times[j] >= times[i]);
        steps.push({
          tag: blocker < 0 ? 'newfleet' : 'time',
          trace: blocker < 0
            ? ['Car at ', A(pos[i]), ' (arrives ', A(round(times[i])), ') is not caught by anything ahead — it ', B('leads a fleet'), '.']
            : ['Car at ', A(pos[i]), ' would arrive at ', F(round(times[i])), ', but the car at ', A(pos[blocker]), ' ahead arrives at ', A(round(times[blocker])), ' — it gets stuck behind and ', F('merges'), '.'],
          state: st(i),
        });
        if (blocker < 0) leaders.push(i);
      }
      steps.push({ tag: 'ret', trace: ['Fleets that reach the target: ', C(leaders.length), '.'], state: st() });
      return { steps, result: String(leaders.length), resultDetail: 'distinct fleets at the target' };
    },
    note: 'Every car is compared with every other car — O(n²). Sorting by position and walking from the front keeps only the slowest arrival time seen so far, answering each car in O(1).',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
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
  brute: {
    label: 'Every pair of bars',
    technique: 'For each left bar, extend right while tracking the minimum height; each (left, right) pair gives one rectangle.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int largestRectangleArea(vector<int>& h) {'),
        L('        int best = 0;', 'init'),
        L('        for (int l = 0; l < h.size(); l++) {', 'left'),
        L('            int low = INT_MAX;', 'left'),
        L('            for (int r = l; r < h.size(); r++) {', 'area'),
        L('                low = min(low, h[r]);', 'area'),
        L('                best = max(best, low * (r - l + 1));', 'area'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int largestRectangleArea(int[] h) {'),
        L('        int best = 0;', 'init'),
        L('        for (int l = 0; l < h.length; l++) {', 'left'),
        L('            int low = Integer.MAX_VALUE;', 'left'),
        L('            for (int r = l; r < h.length; r++) {', 'area'),
        L('                low = Math.min(low, h[r]);', 'area'),
        L('                best = Math.max(best, low * (r - l + 1));', 'area'),
        L('            }'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const h = parseIntArray(values.heights, { min: 0, maxLen: 12 });
      if (typeof h === 'string') return { error: h };
      let best = 0;
      let bestRange: [number, number, number] | null = null;
      const steps: Step[] = [];
      const st = (l?: number, r?: number, low?: number): StackState => ({
        array: {
          arr: h,
          bars: true,
          mark: l !== undefined && r !== undefined ? Object.fromEntries([...Array(r - l + 1)].map((_, k) => [l + k, 'active' as const])) : {},
        },
        stack: [],
        stackLabel: 'no stack',
        aggs: [
          { label: 'this rectangle', value: l !== undefined && r !== undefined ? `${low} × ${r - l + 1} = ${low! * (r - l + 1)}` : '—', c: 'a' },
          { label: 'best area', value: String(best), c: 'b' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Every rectangle spans some bars l…r and is as tall as the shortest bar in between. Try them all.'], state: st() });
      for (let l = 0; l < h.length; l++) {
        let low = Infinity;
        for (let r = l; r < h.length; r++) {
          low = Math.min(low, h[r]);
          const area = low * (r - l + 1);
          const better = area > best;
          if (better) {
            best = area;
            bestRange = [l, r, low];
          }
          if (better || steps.length < 60) steps.push({ tag: 'area', trace: ['Bars ', A(l), '…', A(r), ': height ', A(low), ' × width ', A(r - l + 1), ' = ', better ? B(area) : F(area), better ? ' — best so far.' : '.'], state: st(l, r, low) });
        }
      }
      steps.push({ tag: 'ret', trace: ['Largest rectangle: ', C(best), '.'], state: bestRange ? st(bestRange[0], bestRange[1], bestRange[2]) : st() });
      return { steps, result: String(best), resultDetail: bestRange ? `height ${bestRange[2]} × width ${bestRange[1] - bestRange[0] + 1}` : undefined };
    },
    note: 'All n(n+1)/2 spans are examined — O(n²). The monotonic stack finds, for every bar, how far it can stretch left and right in a single pass.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
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
  brute: {
    label: 'Recursion',
    technique: 'Decode left to right; on "k[" recurse to decode the inside, then repeat that result k times.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    int i = 0;'),
        L('    string decode(string& s) {', 'open'),
        L('        string out;', 'open'),
        L('        while (i < s.size() && s[i] != \']\') {'),
        L('            if (isalpha(s[i])) out += s[i++];', 'char'),
        L('            else {', 'digit'),
        L('                int k = 0;', 'digit'),
        L('                while (isdigit(s[i])) k = k * 10 + (s[i++] - \'0\');', 'digit'),
        L('                i++;  // skip [', 'digit'),
        L('                string inner = decode(s);', 'digit'),
        L('                i++;  // skip ]', 'close'),
        L('                while (k--) out += inner;', 'close'),
        L('            }'),
        L('        }'),
        L('        return out;'),
        L('    }'),
        L('public:'),
        L('    string decodeString(string s) { i = 0; return decode(s); }', 'ret'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int i = 0;'),
        L('    String decode(String s) {', 'open'),
        L('        StringBuilder out = new StringBuilder();', 'open'),
        L('        while (i < s.length() && s.charAt(i) != \']\') {'),
        L('            if (Character.isLetter(s.charAt(i))) out.append(s.charAt(i++));', 'char'),
        L('            else {', 'digit'),
        L('                int k = 0;', 'digit'),
        L('                while (Character.isDigit(s.charAt(i))) k = k * 10 + (s.charAt(i++) - \'0\');', 'digit'),
        L('                i++;  // skip [', 'digit'),
        L('                String inner = decode(s);', 'digit'),
        L('                i++;  // skip ]', 'close'),
        L('                out.append(inner.repeat(k));', 'close'),
        L('            }'),
        L('        }'),
        L('        return out.toString();'),
        L('    }'),
        L('    public String decodeString(String s) { i = 0; return decode(s); }', 'ret'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      if (!s) return { error: 'Enter an encoded string.' };
      if (!/^[a-z0-9[\]]+$/.test(s)) return { error: 'Use lowercase letters, digits, and [ ] only.' };
      if (s.length > 24) return { error: 'Keep it to at most 24 characters.' };
      let depth = 0;
      for (const c of s) {
        if (c === '[') depth++;
        if (c === ']') depth--;
        if (depth < 0) return { error: 'Unbalanced brackets.' };
      }
      if (depth !== 0 || /\d(?!\d|\[)/.test(s) || /(^|[^\d])\[/.test(s)) return { error: 'Every "[" must follow a count and be closed by "]".' };
      const chars = s.split('');
      const frames: string[] = [];
      let i = 0;
      const steps: Step[] = [];
      const st = (): StackState => ({
        array: { arr: chars, ptrs: i < chars.length ? [{ name: 'c', i, c: 'a' }] : [] },
        stack: frames.map((f, k) => ({ v: `depth ${k}: "${f || 'ε'}"`, c: k === frames.length - 1 ? ('a' as const) : undefined })),
        stackLabel: 'Call stack',
      });
      const decode = (): string => {
        frames.push('');
        const me = frames.length - 1;
        steps.push({ tag: 'open', trace: ['Start decoding at depth ', A(me), '.'], state: st() });
        let out = '';
        while (i < chars.length && chars[i] !== ']') {
          if (/[a-z]/.test(chars[i])) {
            out += chars[i++];
            frames[me] = out;
            steps.push({ tag: 'char', trace: ["Letter — append: \"", B(out), '".'], state: st() });
          } else {
            let k = 0;
            while (/\d/.test(chars[i])) k = k * 10 + Number(chars[i++]);
            i++;
            steps.push({ tag: 'digit', trace: ['Count ', A(k), ' then "[" — recurse to decode the inside.'], state: st() });
            const inner = decode();
            i++;
            out += inner.repeat(k);
            frames[me] = out;
            steps.push({ tag: 'close', trace: ['"]" — the inside is "', A(inner), '"; repeat it ', A(k), ' times → "', B(out), '".'], state: st() });
          }
        }
        frames.pop();
        return out;
      };
      const cur = decode();
      steps.push({ tag: 'ret', trace: ['Decoded: "', C(cur), '".'], state: st() });
      return { steps, result: `"${cur}"`, resultDetail: `${cur.length} characters` };
    },
    note: 'The call stack does the job of the two explicit stacks — each "[" opens a new call and each "]" returns to the caller. Same output-sized work, but deep nesting uses real recursion depth.',
    complexity: { time: 'O(output length)', space: 'O(nesting depth)' },
  },
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
  brute: {
    label: 'Direct scan',
    technique: 'For each value in nums1, find it in nums2 and scan to its right for the first larger value.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {'),
        L('        vector<int> res;', 'init'),
        L('        for (int x : nums1) {', 'query'),
        L('            int j = find(nums2.begin(), nums2.end(), x) - nums2.begin();', 'query'),
        L('            int ans = -1;', 'query'),
        L('            for (int k = j + 1; k < nums2.size(); k++)', 'query'),
        L('                if (nums2[k] > x) { ans = nums2[k]; break; }', 'query'),
        L('            res.push_back(ans);', 'query'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] nextGreaterElement(int[] nums1, int[] nums2) {'),
        L('        int[] res = new int[nums1.length];', 'init'),
        L('        for (int q = 0; q < nums1.length; q++) {', 'query'),
        L('            int j = 0;', 'query'),
        L('            while (nums2[j] != nums1[q]) j++;', 'query'),
        L('            res[q] = -1;', 'query'),
        L('            for (int k = j + 1; k < nums2.length; k++)', 'query'),
        L('                if (nums2[k] > nums1[q]) { res[q] = nums2[k]; break; }', 'query'),
        L('        }'),
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
      const res: number[] = [];
      let looks = 0;
      const steps: Step[] = [];
      const st = (j?: number, k?: number): StackState => ({
        array: {
          arr: n2,
          ptrs: [...(j !== undefined ? [{ name: 'x', i: j, c: 'a' as const }] : []), ...(k !== undefined && k < n2.length ? [{ name: 'next', i: k, c: 'b' as const }] : [])],
        },
        stack: [],
        stackLabel: 'no stack',
        aggs: [
          { label: 'answers', value: `[${res.join(', ')}]`, c: 'c' },
          { label: 'elements looked at', value: String(looks), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Answer each query on its own: locate it in nums2, then look right.'], state: st() });
      for (const x of n1) {
        const j = n2.indexOf(x);
        looks += j + 1;
        let ans = -1;
        let k = j + 1;
        for (; k < n2.length; k++) {
          looks++;
          if (n2[k] > x) {
            ans = n2[k];
            break;
          }
        }
        res.push(ans);
        steps.push({ tag: 'query', trace: [A(x), ' is at index ', A(j), '; ', ans >= 0 ? ['the first larger value to its right is ', ans].join('') : 'nothing to its right is larger', ' → ', B(ans), '.'], state: st(j, ans >= 0 ? k : undefined) });
      }
      steps.push({ tag: 'ret', trace: ['Answer: ', C(`[${res.join(', ')}]`), ' after looking at ', A(looks), ' elements.'], state: st() });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'Each query costs up to O(n2), for O(n1 · n2) total. One monotonic-stack pass over nums2 precomputes every next-greater value, after which each query is a hash lookup.',
    complexity: { time: 'O(n1 · n2)', space: 'O(1) beyond output' },
  },
};

export const stackProblems = [validParens, minStack, evalRPN, generateParens, dailyTemps, carFleet, largestRect, decodeString, nextGreater];
