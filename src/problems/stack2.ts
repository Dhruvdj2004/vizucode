// Stack & Queue, part 2 — Striver SDE / Love Babbar sheet staples.
import type { MatrixState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/* ================= Next Greater Element II ================= */
const nextGreaterII: ProblemDef = {
  slug: 'next-greater-element-ii',
  title: 'Next Greater Element II',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/next-greater-element-ii/',
  technique: 'A decreasing stack of indices, swept twice to simulate the array wrapping around.',
  widget: 'stack',
  widgetTitle: 'Circular array & index stack',
  inputs: [{ key: 'nums', label: 'Circular array', defaultValue: '1, 2, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> nextGreaterElements(vector<int>& a) {'),
      L('        int n = a.size();'),
      L('        vector<int> res(n, -1);', 'init'),
      L('        stack<int> st;'),
      L('        for (int i = 0; i < 2 * n; i++) {', 'loop'),
      L('            int v = a[i % n];'),
      L('            while (!st.empty() && a[st.top()] < v) {', 'pop'),
      L('                res[st.top()] = v;', 'pop'),
      L('                st.pop();', 'pop'),
      L('            }'),
      L('            if (i < n) st.push(i);', 'push'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] nextGreaterElements(int[] a) {'),
      L('        int n = a.length;'),
      L('        int[] res = new int[n];'),
      L('        Arrays.fill(res, -1);', 'init'),
      L('        Deque<Integer> st = new ArrayDeque<>();'),
      L('        for (int i = 0; i < 2 * n; i++) {', 'loop'),
      L('            int v = a[i % n];'),
      L('            while (!st.isEmpty() && a[st.peek()] < v) {', 'pop'),
      L('                res[st.pop()] = v;', 'pop'),
      L('            }'),
      L('            if (i < n) st.push(i);', 'push'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 9 });
    if (typeof a === 'string') return { error: a };
    const n = a.length;
    const res = a.map(() => -1);
    const stack: number[] = [];
    const steps: Step[] = [];
    const st = (i: number, mark?: 'active' | 'good'): StackState => ({
      array: {
        arr: a,
        mark: {
          ...Object.fromEntries(a.map((_, k) => [k, res[k] !== -1 ? ('good' as const) : undefined]).filter(([, v]) => v)),
          ...(i < 2 * n ? { [i % n]: mark ?? ('active' as const) } : {}),
        },
        ptrs: i < 2 * n ? [{ name: i < n ? 'pass 1' : 'pass 2', i: i % n, c: 'a' }] : [],
      },
      stack: stack.map((k) => ({ v: `${a[k]}@${k}`, c: 'b' as const })),
      stackLabel: 'indices still waiting for a bigger value',
      aggs: [{ label: 'answers', value: res.join(', '), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Everything starts at ', A(-1), '. Walking the array ', B('twice'), ' is what lets the search wrap past the end.'],
      state: st(2 * n),
    });
    for (let i = 0; i < 2 * n; i++) {
      const v = a[i % n];
      steps.push({
        tag: 'loop',
        trace: [i < n ? 'First pass' : 'Second pass (wrapping)', ' — value ', A(v), ' at index ', A(i % n), '.'],
        state: st(i),
      });
      while (stack.length && a[stack[stack.length - 1]] < v) {
        const idx = stack.pop()!;
        res[idx] = v;
        steps.push({
          tag: 'pop',
          trace: [A(v), ' is the first value bigger than ', B(a[idx]), ' (index ', B(idx), ') — that index is answered and leaves the stack.'],
          state: st(i, 'good'),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (i < n) {
        stack.push(i);
        steps.push({ tag: 'push', trace: ['Index ', A(i), ' still has no bigger value — park it on the stack.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Anything still on the stack has no greater element even after wrapping, so it keeps ', C(-1), '. Result: ', C(`[${res.join(', ')}]`), '.'],
      state: st(2 * n),
    });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'The stack always holds indices in decreasing value order, so a new value answers a whole run of them at once — each index is pushed and popped once, giving O(n) despite the nested loop. Pushing only during the first pass is what stops the second sweep from creating duplicate work.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Circular scan',
    technique: 'For each index, walk forward around the circle (up to n − 1 steps) until a larger value appears.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> nextGreaterElements(vector<int>& a) {'),
        L('        int n = a.size();', 'init'),
        L('        vector<int> res(n, -1);', 'init'),
        L('        for (int i = 0; i < n; i++)', 'scan'),
        L('            for (int k = 1; k < n; k++)', 'scan'),
        L('                if (a[(i + k) % n] > a[i]) { res[i] = a[(i + k) % n]; break; }', 'scan'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] nextGreaterElements(int[] a) {'),
        L('        int n = a.length;', 'init'),
        L('        int[] res = new int[n]; Arrays.fill(res, -1);', 'init'),
        L('        for (int i = 0; i < n; i++)', 'scan'),
        L('            for (int k = 1; k < n; k++)', 'scan'),
        L('                if (a[(i + k) % n] > a[i]) { res[i] = a[(i + k) % n]; break; }', 'scan'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { maxLen: 9 });
      if (typeof a === 'string') return { error: a };
      const n = a.length;
      const res = a.map(() => -1);
      let looks = 0;
      const steps: Step[] = [];
      const st = (i?: number, j?: number): StackState => ({
        array: {
          arr: a,
          ptrs: [...(i !== undefined ? [{ name: 'i', i, c: 'a' as const }] : []), ...(j !== undefined ? [{ name: 'next', i: j, c: 'b' as const }] : [])],
        },
        stack: [],
        stackLabel: 'no stack',
        aggs: [
          { label: 'answers', value: `[${res.join(', ')}]`, c: 'c' },
          { label: 'values looked at', value: String(looks), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['For every index, walk around the circle until something bigger shows up.'], state: st() });
      for (let i = 0; i < n; i++) {
        let hit: number | undefined;
        for (let k = 1; k < n; k++) {
          looks++;
          if (a[(i + k) % n] > a[i]) {
            res[i] = a[(i + k) % n];
            hit = (i + k) % n;
            break;
          }
        }
        steps.push({ tag: 'scan', trace: ['Index ', A(i), ' (', A(a[i]), '): ', hit !== undefined ? ['next greater is ', res[i], ' at index ', hit].join('') : 'nothing larger anywhere', ' → ', B(res[i]), '.'], state: st(i, hit) });
      }
      steps.push({ tag: 'ret', trace: ['Answer: ', C(`[${res.join(', ')}]`), '.'], state: st() });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'Each index may walk almost the whole circle, so this is O(n²). A decreasing stack swept over the array twice settles every index as soon as its next greater value arrives.',
    complexity: { time: 'O(n²)', space: 'O(1) beyond output' },
  },
};

/* ================= Implement Queue using Stacks ================= */
const queueUsingStacks: ProblemDef = {
  slug: 'implement-queue-using-stacks',
  title: 'Implement Queue using Stacks',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/implement-queue-using-stacks/',
  technique: 'An in-stack and an out-stack — pouring one into the other reverses the order exactly once.',
  widget: 'stack',
  widgetTitle: 'Two stacks acting as one queue',
  inputs: [{ key: 'ops', label: 'Operations (e.g. push 1, push 2, pop, peek)', defaultValue: 'push 1, push 2, pop, push 3, pop, pop', wide: true }],
  code: {
    cpp: [
      L('class MyQueue {'),
      L('    stack<int> in, out;'),
      L('public:'),
      L('    void push(int x) { in.push(x); }', 'push'),
      L('    int pop() {'),
      L('        peek();', 'pop'),
      L('        int v = out.top(); out.pop();', 'pop'),
      L('        return v;'),
      L('    }'),
      L('    int peek() {'),
      L('        if (out.empty())', 'peek'),
      L('            while (!in.empty()) {', 'pour'),
      L('                out.push(in.top()); in.pop();', 'pour'),
      L('            }'),
      L('        return out.top();', 'peek'),
      L('    }'),
      L('    bool empty() { return in.empty() && out.empty(); }'),
      L('};'),
    ],
    java: [
      L('class MyQueue {'),
      L('    Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();'),
      L('    public void push(int x) { in.push(x); }', 'push'),
      L('    public int pop() {'),
      L('        peek();', 'pop'),
      L('        return out.pop();', 'pop'),
      L('    }'),
      L('    public int peek() {'),
      L('        if (out.isEmpty())', 'peek'),
      L('            while (!in.isEmpty())', 'pour'),
      L('                out.push(in.pop());', 'pour'),
      L('        return out.peek();', 'peek'),
      L('    }'),
      L('    public boolean empty() {'),
      L('        return in.isEmpty() && out.isEmpty();'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter at least one operation.' };
    if (raw.length > 12) return { error: 'Keep it to at most 12 operations.' };
    const inSt: number[] = [];
    const outSt: number[] = [];
    const steps: Step[] = [];
    const results: string[] = [];
    const st = (): StackState => ({
      stack: inSt.map((v) => ({ v, c: 'a' as const })),
      stackLabel: 'in — newest pushes land here',
      stack2: outSt.map((v) => ({ v, c: 'b' as const })),
      stack2Label: 'out — front of the queue is on top',
      aggs: [{ label: 'returned', value: results.join(', ') || '—', c: 'c' }],
    });
    steps.push({
      tag: 'push',
      trace: ['A stack is last-in-first-out; a queue is first-in-first-out. Pouring one stack into another ', A('reverses'), ' it — which converts one discipline into the other.'],
      state: st(),
    });
    for (const op of raw) {
      const [name, arg] = op.split(/\s+/);
      const cmd = name.toLowerCase();
      if (cmd === 'push') {
        const v = Number(arg);
        if (!Number.isInteger(v)) return { error: `"${op}" needs an integer, e.g. "push 5".` };
        inSt.push(v);
        steps.push({ tag: 'push', trace: ['push(', A(v), ') — straight onto the ', A('in'), ' stack, O(1).'], state: st() });
      } else if (cmd === 'pop' || cmd === 'peek') {
        if (outSt.length === 0) {
          if (inSt.length === 0) return { error: `"${op}" on an empty queue.` };
          steps.push({
            tag: 'peek',
            trace: ['The ', B('out'), ' stack is empty, so the front of the queue is not available yet.'],
            state: st(),
          });
          while (inSt.length) {
            const v = inSt.pop()!;
            outSt.push(v);
            steps.push({
              tag: 'pour',
              trace: ['Pour ', A(v), ' across. Popping from in and pushing to out flips the order, so the ', B('oldest'), ' element ends up on top.'],
              state: st(),
            });
            if (steps.length > MAX_STEPS) break;
          }
        }
        const top = outSt[outSt.length - 1];
        if (cmd === 'peek') {
          results.push(String(top));
          steps.push({ tag: 'peek', trace: ['peek() → ', C(top), ' — the oldest element, sitting on top of out.'], state: st() });
        } else {
          outSt.pop();
          results.push(String(top));
          steps.push({ tag: 'pop', trace: ['pop() → ', C(top), ' — removed from out.'], state: st() });
        }
      } else {
        return { error: `Unknown operation "${op}". Use push <n>, pop or peek.` };
      }
      if (steps.length > MAX_STEPS) break;
    }
    return { steps, result: results.join(', ') || 'no values returned', resultDetail: `${raw.length} operations` };
  },
  note: 'Only refilling out when it is empty is what makes this amortised O(1): each element is moved across exactly once in its lifetime, so a costly pour is always paid for by the cheap pops that follow. Pouring on every pop would be correct but O(n) each time.',
  complexity: { time: 'O(1) amortised per op', space: 'O(n)' },
  brute: {
    label: 'Costly push',
    technique: 'Keep one stack always in queue order: every push empties it into a helper, drops the new value at the bottom, and pours everything back.',
    code: {
      cpp: [
        L('class MyQueue {'),
        L('    stack<int> s, tmp;  // s.top() is always the front'),
        L('public:'),
        L('    void push(int x) {'),
        L('        while (!s.empty()) { tmp.push(s.top()); s.pop(); }', 'pour'),
        L('        s.push(x);', 'push'),
        L('        while (!tmp.empty()) { s.push(tmp.top()); tmp.pop(); }', 'pour'),
        L('    }'),
        L('    int pop() { int v = s.top(); s.pop(); return v; }', 'pop'),
        L('    int peek() { return s.top(); }', 'peek'),
        L('};'),
      ],
      java: [
        L('class MyQueue {'),
        L('    Deque<Integer> s = new ArrayDeque<>(), tmp = new ArrayDeque<>();  // s.peek() is the front'),
        L('    public void push(int x) {'),
        L('        while (!s.isEmpty()) tmp.push(s.pop());', 'pour'),
        L('        s.push(x);', 'push'),
        L('        while (!tmp.isEmpty()) s.push(tmp.pop());', 'pour'),
        L('    }'),
        L('    public int pop() { return s.pop(); }', 'pop'),
        L('    public int peek() { return s.peek(); }', 'peek'),
        L('}'),
      ],
    },
    run(values) {
      const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      if (raw.length === 0) return { error: 'Enter at least one operation.' };
      if (raw.length > 12) return { error: 'Keep it to at most 12 operations.' };
      const s: number[] = [];
      const tmp: number[] = [];
      const results: string[] = [];
      let moves = 0;
      const steps: Step[] = [];
      const st = (): StackState => ({
        stack: s.map((v) => ({ v, c: 'b' as const })),
        stackLabel: 'main — front of the queue on top',
        stack2: tmp.map((v) => ({ v, c: 'a' as const })),
        stack2Label: 'helper',
        aggs: [
          { label: 'element moves', value: String(moves), c: 'a' },
          { label: 'returned', value: results.join(', ') || '—', c: 'c' },
        ],
      });
      steps.push({ tag: 'push', trace: ['Keep the main stack in queue order at all times, so pop and peek are trivial — pushing pays the price.'], state: st() });
      for (const op of raw) {
        const [name, arg] = op.split(/\s+/);
        const cmd = name.toLowerCase();
        if (cmd === 'push') {
          const v = Number(arg);
          if (!Number.isInteger(v)) return { error: `"${op}" needs an integer, e.g. "push 5".` };
          while (s.length) {
            tmp.push(s.pop()!);
            moves++;
          }
          steps.push({ tag: 'pour', trace: ['push(', A(v), '): move all ', A(tmp.length), ' value(s) to the helper first.'], state: st() });
          s.push(v);
          steps.push({ tag: 'push', trace: ['Put ', A(v), ' at the bottom — it is the newest, so it belongs at the back of the queue.'], state: st() });
          while (tmp.length) {
            s.push(tmp.pop()!);
            moves++;
          }
          steps.push({ tag: 'pour', trace: ['Pour everything back on top of it. The front of the queue is on top again.'], state: st() });
        } else if (cmd === 'pop' || cmd === 'peek') {
          if (!s.length) return { error: `"${op}" on an empty queue.` };
          const top = s[s.length - 1];
          if (cmd === 'pop') s.pop();
          results.push(String(top));
          steps.push({ tag: cmd, trace: [cmd, '() → ', C(top), ' — O(1), it is already on top.'], state: st() });
        } else {
          return { error: `Unknown operation "${op}". Use push <n>, pop or peek.` };
        }
      }
      return { steps, result: results.join(', ') || 'no values returned', resultDetail: `${raw.length} operations` };
    },
    note: 'Every push moves the whole queue twice, so pushes are O(n). The in/out design pours only when the out-stack runs dry, which is O(1) amortised per operation.',
    complexity: { time: 'O(n) push, O(1) pop/peek', space: 'O(n)' },
  },
};

/* ================= Implement Stack using Queues ================= */
const stackUsingQueues: ProblemDef = {
  slug: 'implement-stack-using-queues',
  title: 'Implement Stack using Queues',
  category: 'Stack',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/implement-stack-using-queues/',
  technique: 'After each push, rotate the queue so the newest element sits at the front.',
  widget: 'stack',
  widgetTitle: 'One queue behaving as a stack',
  inputs: [{ key: 'ops', label: 'Operations (e.g. push 1, push 2, pop, top)', defaultValue: 'push 1, push 2, push 3, pop, top', wide: true }],
  code: {
    cpp: [
      L('class MyStack {'),
      L('    queue<int> q;'),
      L('public:'),
      L('    void push(int x) {'),
      L('        q.push(x);', 'push'),
      L('        for (int i = 1; i < q.size(); i++) {', 'rotate'),
      L('            q.push(q.front()); q.pop();', 'rotate'),
      L('        }'),
      L('    }'),
      L('    int pop() { int v = q.front(); q.pop(); return v; }', 'pop'),
      L('    int top() { return q.front(); }', 'top'),
      L('    bool empty() { return q.empty(); }'),
      L('};'),
    ],
    java: [
      L('class MyStack {'),
      L('    Queue<Integer> q = new LinkedList<>();'),
      L('    public void push(int x) {'),
      L('        q.add(x);', 'push'),
      L('        for (int i = 1; i < q.size(); i++)', 'rotate'),
      L('            q.add(q.remove());', 'rotate'),
      L('    }'),
      L('    public int pop() { return q.remove(); }', 'pop'),
      L('    public int top() { return q.peek(); }', 'top'),
      L('    public boolean empty() { return q.isEmpty(); }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter at least one operation.' };
    if (raw.length > 10) return { error: 'Keep it to at most 10 operations.' };
    const q: number[] = []; // index 0 = front
    const steps: Step[] = [];
    const results: string[] = [];
    const st = (): StackState => ({
      stack: [...q].reverse().map((v, i) => ({ v, c: i === q.length - 1 ? ('a' as const) : ('b' as const) })),
      stackLabel: 'queue — front is at the top of this column',
      aggs: [
        { label: 'front (acts as stack top)', value: q.length ? String(q[0]) : '—', c: 'a' },
        { label: 'returned', value: results.join(', ') || '—', c: 'c' },
      ],
    });
    steps.push({
      tag: 'push',
      trace: ['A queue hands back its ', A('oldest'), ' element. To fake a stack, make sure the ', B('newest'), ' element is always the one sitting at the front.'],
      state: st(),
    });
    for (const op of raw) {
      const [name, arg] = op.split(/\s+/);
      const cmd = name.toLowerCase();
      if (cmd === 'push') {
        const v = Number(arg);
        if (!Number.isInteger(v)) return { error: `"${op}" needs an integer, e.g. "push 5".` };
        q.push(v);
        steps.push({ tag: 'push', trace: ['push(', A(v), ') — it goes to the ', F('back'), ' of the queue, which is the wrong end.'], state: st() });
        for (let i = 1; i < q.length; i++) {
          const front = q.shift()!;
          q.push(front);
          steps.push({
            tag: 'rotate',
            trace: ['Rotate: move ', A(front), ' from the front to the back. After ', B(q.length - 1), ' such moves, ', B(v), ' will be at the front.'],
            state: st(),
          });
          if (steps.length > MAX_STEPS) break;
        }
      } else if (cmd === 'pop') {
        if (q.length === 0) return { error: `"${op}" on an empty stack.` };
        const v = q.shift()!;
        results.push(String(v));
        steps.push({ tag: 'pop', trace: ['pop() → ', C(v), ' — the front is already the most recently pushed value, so this is O(1).'], state: st() });
      } else if (cmd === 'top') {
        if (q.length === 0) return { error: `"${op}" on an empty stack.` };
        results.push(String(q[0]));
        steps.push({ tag: 'top', trace: ['top() → ', C(q[0]), ' — just read the front.'], state: st() });
      } else {
        return { error: `Unknown operation "${op}". Use push <n>, pop or top.` };
      }
      if (steps.length > MAX_STEPS) break;
    }
    return { steps, result: results.join(', ') || 'no values returned', resultDetail: `${raw.length} operations` };
  },
  note: 'This makes push O(n) and pop O(1); you can flip the trade-off by rotating during pop instead. Unlike the queue-from-stacks version, there is no amortisation to hide behind — every push genuinely costs a full rotation, which is why one queue is enough and a second buys you nothing.',
  complexity: { time: 'O(n) push, O(1) pop/top', space: 'O(n)' },
  brute: {
    label: 'Two queues, costly pop',
    technique: 'Push is a plain enqueue; pop moves all but the last element into a second queue, takes the last one, and swaps the queues.',
    code: {
      cpp: [
        L('class MyStack {'),
        L('    queue<int> q, other;'),
        L('public:'),
        L('    void push(int x) { q.push(x); }', 'push'),
        L('    int pop() {'),
        L('        while (q.size() > 1) { other.push(q.front()); q.pop(); }', 'rotate'),
        L('        int v = q.front(); q.pop();', 'pop'),
        L('        swap(q, other);', 'pop'),
        L('        return v;', 'pop'),
        L('    }'),
        L('    int top() { int v = pop(); push(v); return v; }', 'top'),
        L('};'),
      ],
      java: [
        L('class MyStack {'),
        L('    Queue<Integer> q = new ArrayDeque<>(), other = new ArrayDeque<>();'),
        L('    public void push(int x) { q.add(x); }', 'push'),
        L('    public int pop() {'),
        L('        while (q.size() > 1) other.add(q.remove());', 'rotate'),
        L('        int v = q.remove();', 'pop'),
        L('        Queue<Integer> t = q; q = other; other = t;', 'pop'),
        L('        return v;', 'pop'),
        L('    }'),
        L('    public int top() { int v = pop(); push(v); return v; }', 'top'),
        L('}'),
      ],
    },
    run(values) {
      const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      if (raw.length === 0) return { error: 'Enter at least one operation.' };
      if (raw.length > 10) return { error: 'Keep it to at most 10 operations.' };
      let q: number[] = [];
      let other: number[] = [];
      const results: string[] = [];
      let moves = 0;
      const steps: Step[] = [];
      const st = (): StackState => ({
        stack: [...q].reverse().map((v) => ({ v, c: 'b' as const })),
        stackLabel: 'queue q — front at the top',
        stack2: [...other].reverse().map((v) => ({ v, c: 'a' as const })),
        stack2Label: 'queue other',
        aggs: [
          { label: 'element moves', value: String(moves), c: 'a' },
          { label: 'returned', value: results.join(', ') || '—', c: 'c' },
        ],
      });
      const popLast = (): number => {
        while (q.length > 1) {
          other.push(q.shift()!);
          moves++;
        }
        steps.push({ tag: 'rotate', trace: ['Move all but the last element into the other queue.'], state: st() });
        const v = q.shift()!;
        [q, other] = [other, q];
        return v;
      };
      steps.push({ tag: 'push', trace: ['Push is a plain enqueue; the newest element is at the back, so pop has to dig it out.'], state: st() });
      for (const op of raw) {
        const [name, arg] = op.split(/\s+/);
        const cmd = name.toLowerCase();
        if (cmd === 'push') {
          const v = Number(arg);
          if (!Number.isInteger(v)) return { error: `"${op}" needs an integer, e.g. "push 5".` };
          q.push(v);
          steps.push({ tag: 'push', trace: ['push(', A(v), ') — enqueue at the back, O(1).'], state: st() });
        } else if (cmd === 'pop' || cmd === 'top') {
          if (!q.length) return { error: `"${op}" on an empty stack.` };
          const v = popLast();
          if (cmd === 'top') q.push(v);
          results.push(String(v));
          steps.push({ tag: cmd, trace: [cmd, '() → ', C(v), cmd === 'top' ? ' (and put it back).' : '.'], state: st() });
        } else {
          return { error: `Unknown operation "${op}". Use push <n>, pop or top.` };
        }
      }
      return { steps, result: results.join(', ') || 'no values returned', resultDetail: `${raw.length} operations` };
    },
    note: 'The mirror image of the rotate-on-push design: push is O(1) but every pop or top moves n − 1 elements. Which side should pay depends on whether pushes or pops dominate.',
    complexity: { time: 'O(1) push, O(n) pop/top', space: 'O(n)' },
  },
};

/* ================= Asteroid Collision ================= */
const asteroidCollision: ProblemDef = {
  slug: 'asteroid-collision',
  title: 'Asteroid Collision',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/asteroid-collision/',
  technique: 'Only a right-mover already on the stack can be hit by an incoming left-mover.',
  widget: 'stack',
  widgetTitle: 'Asteroids (+ = right, − = left)',
  inputs: [{ key: 'nums', label: 'Asteroids', defaultValue: '5, 10, -5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> asteroidCollision(vector<int>& a) {'),
      L('        vector<int> st;'),
      L('        for (int x : a) {', 'loop'),
      L('            bool alive = true;'),
      L('            while (alive && x < 0 && !st.empty() && st.back() > 0) {', 'collide'),
      L('                if (st.back() < -x) st.pop_back();', 'smaller'),
      L('                else if (st.back() == -x) { st.pop_back(); alive = false; }', 'equal'),
      L('                else alive = false;', 'bigger'),
      L('            }'),
      L('            if (alive) st.push_back(x);', 'push'),
      L('        }'),
      L('        return st;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[] asteroidCollision(int[] a) {'),
      L('        Deque<Integer> st = new ArrayDeque<>();'),
      L('        for (int x : a) {', 'loop'),
      L('            boolean alive = true;'),
      L('            while (alive && x < 0 && !st.isEmpty() && st.peek() > 0) {', 'collide'),
      L('                if (st.peek() < -x) st.pop();', 'smaller'),
      L('                else if (st.peek() == -x) { st.pop(); alive = false; }', 'equal'),
      L('                else alive = false;', 'bigger'),
      L('            }'),
      L('            if (alive) st.push(x);', 'push'),
      L('        }'),
      L('        return toArray(st);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 12 });
    if (typeof a === 'string') return { error: a };
    if (a.some((v) => v === 0)) return { error: 'Asteroid sizes cannot be 0 (they must move left or right).' };
    const stack: number[] = [];
    const steps: Step[] = [];
    const st = (i: number, mark?: 'active' | 'dim'): StackState => ({
      array: {
        arr: a.map((v) => (v > 0 ? `${v}→` : `←${-v}`)),
        mark: i < a.length ? { [i]: mark ?? 'active' } : {},
      },
      stack: stack.map((v) => ({ v: v > 0 ? `${v}→` : `←${-v}`, c: v > 0 ? ('b' as const) : ('a' as const) })),
      stackLabel: 'surviving asteroids (left → right)',
    });
    steps.push({
      tag: 'loop',
      trace: ['A collision needs a ', B('right-mover'), ' on the left and a ', A('left-mover'), ' on the right. Anything else passes by harmlessly.'],
      state: st(a.length),
    });
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      let alive = true;
      steps.push({
        tag: 'loop',
        trace: ['Next asteroid: ', A(Math.abs(x)), ' moving ', A(x > 0 ? 'right' : 'left'), '.'],
        state: st(i),
      });
      while (alive && x < 0 && stack.length && stack[stack.length - 1] > 0) {
        const top = stack[stack.length - 1];
        if (top < -x) {
          stack.pop();
          steps.push({
            tag: 'smaller',
            trace: ['Boom — ', F(top), ' is smaller than ', A(-x), ', so it explodes and the incoming asteroid keeps going.'],
            state: st(i),
          });
        } else if (top === -x) {
          stack.pop();
          alive = false;
          steps.push({
            tag: 'equal',
            trace: ['Equal sizes (', F(top), ' vs ', F(-x), ') — ', F('both'), ' are destroyed.'],
            state: st(i, 'dim'),
          });
        } else {
          alive = false;
          steps.push({
            tag: 'bigger',
            trace: [B(top), ' outweighs ', F(-x), ' — the incoming asteroid is destroyed and the stack is untouched.'],
            state: st(i, 'dim'),
          });
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (alive) {
        stack.push(x);
        steps.push({ tag: 'push', trace: ['It survives — push ', B(Math.abs(x)), ' onto the stack.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Nothing left to collide: ', C(`[${stack.join(', ')}]`), '.'],
      state: st(a.length),
    });
    return { steps, result: `[${stack.join(', ')}]` };
  },
  note: 'The stack top is exactly the only asteroid an incoming left-mover can meet first, which is why one pass suffices. The three-way size comparison must be exhaustive — the equal case destroys both, and treating it like either inequality is the bug that fails on inputs such as [8, -8].',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Resolve until stable',
    technique: 'Repeatedly find the first right-mover immediately followed by a left-mover, resolve that crash, and rescan.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> asteroidCollision(vector<int>& a) {'),
        L('        bool changed = true;', 'push'),
        L('        while (changed) {', 'scan'),
        L('            changed = false;', 'scan'),
        L('            for (int i = 0; i + 1 < a.size(); i++)', 'scan'),
        L('                if (a[i] > 0 && a[i + 1] < 0) {', 'crash'),
        L('                    int l = a[i], r = -a[i + 1];', 'crash'),
        L('                    if (l == r) a.erase(a.begin() + i, a.begin() + i + 2);', 'crash'),
        L('                    else a.erase(a.begin() + (l > r ? i + 1 : i));', 'crash'),
        L('                    changed = true; break;', 'crash'),
        L('                }'),
        L('        }'),
        L('        return a;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[] asteroidCollision(int[] arr) {'),
        L('        List<Integer> a = new ArrayList<>(); for (int x : arr) a.add(x);', 'push'),
        L('        boolean changed = true;', 'push'),
        L('        while (changed) {', 'scan'),
        L('            changed = false;', 'scan'),
        L('            for (int i = 0; i + 1 < a.size(); i++)', 'scan'),
        L('                if (a.get(i) > 0 && a.get(i + 1) < 0) {', 'crash'),
        L('                    int l = a.get(i), r = -a.get(i + 1);', 'crash'),
        L('                    if (l == r) { a.remove(i + 1); a.remove(i); }', 'crash'),
        L('                    else a.remove(l > r ? i + 1 : i);', 'crash'),
        L('                    changed = true; break;', 'crash'),
        L('                }'),
        L('        }'),
        L('        return a.stream().mapToInt(x -> x).toArray();', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a0 = parseIntArray(values.nums, { maxLen: 12 });
      if (typeof a0 === 'string') return { error: a0 };
      if (a0.some((v) => v === 0)) return { error: 'Asteroid sizes cannot be 0 (they must move left or right).' };
      const a = [...a0];
      let scans = 0;
      const steps: Step[] = [];
      const fmt = (v: number) => (v > 0 ? `${v}→` : `←${-v}`);
      const st = (hl?: number): StackState => ({
        array: { arr: a.length ? a.map(fmt) : ['∅'], mark: hl !== undefined ? { [hl]: 'active', [hl + 1]: 'active' } : {} },
        stack: [],
        stackLabel: 'no stack — the row itself is rewritten',
        aggs: [{ label: 'rescans', value: String(scans), c: 'a' }],
      });
      steps.push({ tag: 'push', trace: ['Only a right-mover (→) directly before a left-mover (←) can collide. Find one, resolve it, and start over.'], state: st() });
      let changed = true;
      while (changed) {
        changed = false;
        scans++;
        for (let i = 0; i + 1 < a.length; i++) {
          if (a[i] > 0 && a[i + 1] < 0) {
            const l = a[i];
            const r = -a[i + 1];
            steps.push({ tag: 'crash', trace: [A(fmt(a[i])), ' meets ', A(fmt(a[i + 1])), ': ', l === r ? F('both explode') : l > r ? [fmt(a[i + 1]), ' explodes'].join('') : [fmt(a[i]), ' explodes'].join(''), '.'], state: st(i) });
            if (l === r) a.splice(i, 2);
            else a.splice(l > r ? i + 1 : i, 1);
            changed = true;
            break;
          }
        }
      }
      steps.push({ tag: 'ret', trace: ['No more collisions — survivors ', C(`[${a.join(', ')}]`), ' after ', A(scans), ' scans.'], state: st() });
      return { steps, result: `[${a.join(', ')}]` };
    },
    note: 'Each crash triggers a fresh scan from the left, so a long chain of collisions costs O(n²). The stack resolves each incoming left-mover against the survivors right where it lands.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= Sum of Subarray Minimums ================= */
const sumSubarrayMins: ProblemDef = {
  slug: 'sum-of-subarray-minimums',
  title: 'Sum of Subarray Minimums',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sum-of-subarray-minimums/',
  technique: 'Count how many subarrays each element is the minimum of, using nearest smaller on both sides.',
  widget: 'stack',
  widgetTitle: 'Array & monotonic stack',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '3, 1, 2, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int sumSubarrayMins(vector<int>& a) {'),
      L('        const long MOD = 1e9 + 7;'),
      L('        int n = a.size(); long ans = 0;'),
      L('        vector<int> st;'),
      L('        for (int i = 0; i <= n; i++) {', 'loop'),
      L('            while (!st.empty() &&', 'pop'),
      L('                   (i == n || a[st.back()] >= a[i])) {', 'pop'),
      L('                int mid = st.back(); st.pop_back();', 'pop'),
      L('                int left = st.empty() ? -1 : st.back();', 'span'),
      L('                long count = (long)(mid - left) * (i - mid);', 'span'),
      L('                ans = (ans + count * a[mid]) % MOD;', 'add'),
      L('            }'),
      L('            st.push_back(i);', 'push'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int sumSubarrayMins(int[] a) {'),
      L('        final long MOD = 1_000_000_007L;'),
      L('        int n = a.length; long ans = 0;'),
      L('        Deque<Integer> st = new ArrayDeque<>();'),
      L('        for (int i = 0; i <= n; i++) {', 'loop'),
      L('            while (!st.isEmpty() &&', 'pop'),
      L('                   (i == n || a[st.peek()] >= a[i])) {', 'pop'),
      L('                int mid = st.pop();', 'pop'),
      L('                int left = st.isEmpty() ? -1 : st.peek();', 'span'),
      L('                long count = (long)(mid - left) * (i - mid);', 'span'),
      L('                ans = (ans + count * a[mid]) % MOD;', 'add'),
      L('            }'),
      L('            st.push(i);', 'push'),
      L('        }'),
      L('        return (int) ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { min: 1, maxLen: 8 });
    if (typeof a === 'string') return { error: a };
    const n = a.length;
    const stack: number[] = [];
    const steps: Step[] = [];
    let ans = 0;
    const st = (i: number, mark: Record<number, 'active' | 'good' | 'final' | 'win' | 'dim'> = {}): StackState => ({
      array: { arr: a, mark, ptrs: i < n ? [{ name: 'i', i, c: 'a' }] : [] },
      stack: stack.map((k) => ({ v: `${a[k]}@${k}`, c: 'b' as const })),
      stackLabel: 'increasing stack of indices',
      aggs: [{ label: 'running sum', value: String(ans), c: 'c' }],
    });
    steps.push({
      tag: 'loop',
      trace: [
        'Instead of listing every subarray, ask per element: for how many subarrays is ', A('this'), ' the minimum? Multiply that count by its value and add.',
      ],
      state: st(n),
    });
    for (let i = 0; i <= n; i++) {
      if (i < n) {
        steps.push({ tag: 'loop', trace: ['Right boundary candidate: index ', A(i), ' (value ', A(a[i]), ').'], state: st(i, { [i]: 'active' }) });
      } else {
        steps.push({ tag: 'loop', trace: ['Past the end — flush anything still on the stack using ', A(n), ' as the right boundary.'], state: st(n) });
      }
      while (stack.length && (i === n || a[stack[stack.length - 1]] >= a[i])) {
        const mid = stack.pop()!;
        const left = stack.length ? stack[stack.length - 1] : -1;
        const count = (mid - left) * (i - mid);
        steps.push({
          tag: 'span',
          trace: [
            'Value ', A(a[mid]), ' at index ', A(mid), ' is the minimum for any subarray starting after ', B(left), ' and ending before ', B(i), ' — that is ',
            B(mid - left), ' × ', B(i - mid), ' = ', B(count), ' subarray(s).',
          ],
          state: st(i, {
            [mid]: 'active',
            ...Object.fromEntries([...Array(Math.max(i - left - 1, 0))].map((_, k) => [left + 1 + k, 'win' as const])),
            [mid]: 'active',
          }),
        });
        ans += count * a[mid];
        steps.push({
          tag: 'add',
          trace: ['Contribute ', A(count), ' × ', A(a[mid]), ' = ', B(count * a[mid]), '. Running total ', C(ans), '.'],
          state: st(i, { [mid]: 'good' }),
        });
        if (steps.length > MAX_STEPS) break;
      }
      if (i < n) {
        stack.push(i);
        steps.push({ tag: 'push', trace: ['Push index ', A(i), ' — its own span is still open.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Sum over all subarray minimums: ', C(ans), '.'], state: st(n) });
    return { steps, result: String(ans) };
  },
  note: 'Flipping the question from "iterate subarrays" to "count each element\'s reign" is what collapses O(n²) into O(n). The asymmetric comparison — >= on one side, > on the other — is deliberate: with duplicate values it makes exactly one of the equal elements own each subarray, so nothing is double counted.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Every subarray',
    technique: 'For each start, extend right while tracking the running minimum, and add it for every subarray.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int sumSubarrayMins(vector<int>& a) {'),
        L('        const long MOD = 1e9 + 7; long ans = 0;', 'loop'),
        L('        for (int i = 0; i < a.size(); i++) {', 'start'),
        L('            int mn = INT_MAX;', 'start'),
        L('            for (int j = i; j < a.size(); j++) {', 'add'),
        L('                mn = min(mn, a[j]);', 'add'),
        L('                ans = (ans + mn) % MOD;', 'add'),
        L('            }'),
        L('        }'),
        L('        return ans;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int sumSubarrayMins(int[] a) {'),
        L('        final long MOD = 1_000_000_007L; long ans = 0;', 'loop'),
        L('        for (int i = 0; i < a.length; i++) {', 'start'),
        L('            int mn = Integer.MAX_VALUE;', 'start'),
        L('            for (int j = i; j < a.length; j++) {', 'add'),
        L('                mn = Math.min(mn, a[j]);', 'add'),
        L('                ans = (ans + mn) % MOD;', 'add'),
        L('            }'),
        L('        }'),
        L('        return (int) ans;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.nums, { min: 1, maxLen: 8 });
      if (typeof a === 'string') return { error: a };
      const n = a.length;
      let ans = 0;
      const steps: Step[] = [];
      const st = (i?: number, j?: number, mn?: number): StackState => ({
        array: { arr: a, mark: i !== undefined && j !== undefined ? Object.fromEntries([...Array(j - i + 1)].map((_, k) => [i + k, a[i + k] === mn ? ('good' as const) : ('active' as const)])) : {} },
        stack: [],
        stackLabel: 'no stack',
        aggs: [{ label: 'running sum', value: String(ans), c: 'c' }],
      });
      steps.push({ tag: 'loop', trace: ['Visit all ', A((n * (n + 1)) / 2), ' subarrays and add each one’s minimum.'], state: st() });
      for (let i = 0; i < n; i++) {
        let mn = Infinity;
        steps.push({ tag: 'start', trace: ['Start at index ', A(i), '.'], state: st() });
        for (let j = i; j < n; j++) {
          mn = Math.min(mn, a[j]);
          ans += mn;
          steps.push({ tag: 'add', trace: ['[', A(i), '..', A(j), '] has minimum ', B(mn), ' → sum ', C(ans), '.'], state: st(i, j, mn) });
        }
      }
      steps.push({ tag: 'ret', trace: ['Sum of subarray minimums: ', C(ans), '.'], state: st() });
      return { steps, result: String(ans) };
    },
    note: 'All n(n+1)/2 subarrays are visited — O(n²). Flipping the question to "how many subarrays is a[i] the minimum of?" lets monotonic stacks count each element’s contribution in O(n).',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= Remove K Digits ================= */
const removeKDigits: ProblemDef = {
  slug: 'remove-k-digits',
  title: 'Remove K Digits',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-k-digits/',
  technique: 'Greedily drop any digit larger than the one after it — a rising stack gives the smallest number.',
  widget: 'stack',
  widgetTitle: 'Digits & result stack',
  inputs: [
    { key: 'num', label: 'Number', defaultValue: '1432219', wide: true },
    { key: 'k', label: 'Digits to remove (k)', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string removeKdigits(string num, int k) {'),
      L('        string st;'),
      L('        for (char c : num) {', 'loop'),
      L('            while (k > 0 && !st.empty() && st.back() > c) {', 'drop'),
      L('                st.pop_back(); k--;', 'drop'),
      L('            }'),
      L('            st.push_back(c);', 'push'),
      L('        }'),
      L('        st.resize(st.size() - k);', 'trim'),
      L('        int i = 0;'),
      L('        while (i < st.size() && st[i] == \'0\') i++;', 'zeros'),
      L('        return i == st.size() ? "0" : st.substr(i);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String removeKdigits(String num, int k) {'),
      L('        StringBuilder st = new StringBuilder();'),
      L('        for (char c : num.toCharArray()) {', 'loop'),
      L('            while (k > 0 && st.length() > 0 &&', 'drop'),
      L('                   st.charAt(st.length()-1) > c) {', 'drop'),
      L('                st.deleteCharAt(st.length()-1); k--;', 'drop'),
      L('            }'),
      L('            st.append(c);', 'push'),
      L('        }'),
      L('        st.setLength(st.length() - k);', 'trim'),
      L('        int i = 0;'),
      L('        while (i < st.length() && st.charAt(i) == \'0\') i++;', 'zeros'),
      L('        String r = st.substring(i);'),
      L('        return r.isEmpty() ? "0" : r;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const num = (values.num ?? '').trim();
    if (!/^[0-9]{1,12}$/.test(num)) return { error: 'Enter 1–12 digits.' };
    let k = parseInt1(values.k, 'k', { min: 0 });
    if (typeof k === 'string') return { error: k };
    if (k > num.length) return { error: `k cannot exceed the number of digits (${num.length}).` };
    const digits = num.split('');
    const stack: string[] = [];
    const steps: Step[] = [];
    const kLeft = () => k as number;
    const st = (i: number, mark?: 'active' | 'dim'): StackState => ({
      array: { arr: digits, mark: i < digits.length ? { [i]: mark ?? 'active' } : {} },
      stack: stack.map((v) => ({ v, c: 'b' as const })),
      stackLabel: 'kept digits (left → right)',
      aggs: [{ label: 'removals left', value: String(kLeft()), c: 'a' }],
    });
    steps.push({
      tag: 'loop',
      trace: [
        'To make the number small, the ', A('leftmost'), ' digits matter most. So whenever a digit is followed by something smaller, dropping it is always a win.',
      ],
      state: st(digits.length),
    });
    for (let i = 0; i < digits.length; i++) {
      const c = digits[i];
      steps.push({ tag: 'loop', trace: ['Next digit: ', A(c), '.'], state: st(i) });
      while (k > 0 && stack.length && stack[stack.length - 1] > c) {
        const dropped = stack.pop()!;
        k--;
        steps.push({
          tag: 'drop',
          trace: [F(dropped), ' is bigger than the incoming ', A(c), ' — removing it lowers a more significant place. ', B(k), ' removal(s) left.'],
          state: st(i),
        });
        if (steps.length > MAX_STEPS) break;
      }
      stack.push(c);
      steps.push({ tag: 'push', trace: ['Keep ', B(c), ' for now.'], state: st(i) });
      if (steps.length > MAX_STEPS) break;
    }
    if (k > 0) {
      const cut = stack.splice(stack.length - k, k);
      steps.push({
        tag: 'trim',
        trace: ['The digits never decreased, so ', A(k), ' removal(s) are unspent — chop them off the ', A('end'), ' (', F(cut.join('')), '), where they cost the least.'],
        state: st(digits.length),
      });
      k = 0;
    }
    let i = 0;
    while (i < stack.length && stack[i] === '0') i++;
    if (i > 0) {
      steps.push({
        tag: 'zeros',
        trace: ['Strip ', F(i), ' leading zero(s) — they are not part of a valid number.'],
        state: st(digits.length),
      });
    }
    const out = stack.slice(i).join('') || '0';
    steps.push({ tag: 'ret', trace: ['Smallest number after the removals: ', C(out), '.'], state: st(digits.length) });
    return { steps, result: out };
  },
  note: 'Greedy works because a digit in a higher place always outweighs everything to its right — so removing the first descent is never worse than any other choice. The two clean-ups matter: leftover k is spent at the tail (where digits are already ascending), and leading zeros must be stripped or the result is not a number.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'k greedy passes',
    technique: 'Repeat k times: scan left to right and delete the first digit that is larger than the digit after it (or the last digit).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    string removeKdigits(string num, int k) {'),
        L('        while (k--) {', 'pass'),
        L('            int i = 0;', 'pass'),
        L('            while (i + 1 < num.size() && num[i] <= num[i + 1]) i++;', 'pass'),
        L('            num.erase(i, 1);', 'pop'),
        L('        }'),
        L('        int z = 0;', 'zeros'),
        L('        while (z < num.size() && num[z] == \'0\') z++;', 'zeros'),
        L('        num = num.substr(z);', 'zeros'),
        L('        return num.empty() ? "0" : num;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public String removeKdigits(String num, int k) {'),
        L('        StringBuilder s = new StringBuilder(num);'),
        L('        while (k-- > 0) {', 'pass'),
        L('            int i = 0;', 'pass'),
        L('            while (i + 1 < s.length() && s.charAt(i) <= s.charAt(i + 1)) i++;', 'pass'),
        L('            s.deleteCharAt(i);', 'pop'),
        L('        }'),
        L('        int z = 0;', 'zeros'),
        L('        while (z < s.length() && s.charAt(z) == \'0\') z++;', 'zeros'),
        L('        String out = s.substring(z);', 'zeros'),
        L('        return out.isEmpty() ? "0" : out;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const num = (values.num ?? '').trim();
      if (!/^[0-9]{1,12}$/.test(num)) return { error: 'Enter 1–12 digits.' };
      const k = parseInt1(values.k, 'k', { min: 0 });
      if (typeof k === 'string') return { error: k };
      if (k > num.length) return { error: `k cannot exceed the number of digits (${num.length}).` };
      let d = num.split('');
      let scanned = 0;
      const steps: Step[] = [];
      const st = (hl?: number): StackState => ({
        array: { arr: d.length ? d : ['∅'], mark: hl !== undefined ? { [hl]: 'dim' } : {} },
        stack: [],
        stackLabel: 'no stack — one deletion per pass',
        aggs: [{ label: 'digits scanned', value: String(scanned), c: 'a' }],
      });
      steps.push({ tag: 'pass', trace: ['Each pass removes the first digit that is bigger than its right neighbour — the first "peak".'], state: st() });
      for (let pass = 0; pass < k; pass++) {
        let i = 0;
        while (i + 1 < d.length && d[i] <= d[i + 1]) i++;
        scanned += i + 1;
        steps.push({ tag: 'pop', trace: ['Pass ', A(pass + 1), ': the first peak is ', F(d[i]), ' at index ', A(i), ' — delete it.'], state: st(i) });
        d.splice(i, 1);
      }
      let z = 0;
      while (z < d.length && d[z] === '0') z++;
      if (z > 0) {
        d = d.slice(z);
        steps.push({ tag: 'zeros', trace: ['Strip ', F(z), ' leading zero(s).'], state: st() });
      }
      const out = d.join('') || '0';
      steps.push({ tag: 'ret', trace: ['Smallest number: ', C(out), ' (', A(scanned), ' digits scanned).'], state: st() });
      return { steps, result: out };
    },
    note: 'The greedy choice is the same, but each pass restarts its scan from the left, costing O(k·n). The increasing stack remembers where the last pass stopped, so the whole thing is one O(n) sweep.',
    complexity: { time: 'O(k · n)', space: 'O(n)' },
  },
};

/* ================= Maximal Rectangle ================= */
const maximalRectangle: ProblemDef = {
  slug: 'maximal-rectangle',
  title: 'Maximal Rectangle',
  category: 'Stack',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/maximal-rectangle/',
  technique: 'Treat each row as the ground of a histogram, then reuse largest-rectangle-in-histogram.',
  widget: 'matrix',
  widgetTitle: 'Binary grid & per-row heights',
  inputs: [{ key: 'grid', label: 'Binary grid (rows ";" separated)', defaultValue: '10100;10111;11111;10010', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maximalRectangle(vector<vector<char>>& m) {'),
      L('        if (m.empty()) return 0;'),
      L('        int n = m[0].size(), best = 0;'),
      L('        vector<int> h(n, 0);', 'init'),
      L('        for (auto& row : m) {', 'row'),
      L('            for (int c = 0; c < n; c++)', 'heights'),
      L('                h[c] = row[c] == \'1\' ? h[c] + 1 : 0;', 'heights'),
      L('            best = max(best, largestRectangle(h));', 'hist'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maximalRectangle(char[][] m) {'),
      L('        if (m.length == 0) return 0;'),
      L('        int n = m[0].length, best = 0;'),
      L('        int[] h = new int[n];', 'init'),
      L('        for (char[] row : m) {', 'row'),
      L('            for (int c = 0; c < n; c++)', 'heights'),
      L('                h[c] = row[c] == \'1\' ? h[c] + 1 : 0;', 'heights'),
      L('            best = Math.max(best, largestRectangle(h));', 'hist'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.grid ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (rows.length === 0) return { error: 'Enter a grid, rows separated by ";".' };
    const w = rows[0].length;
    if (!rows.every((r) => r.length === w)) return { error: 'All rows must be the same length.' };
    if (rows.length > 6 || w > 7) return { error: 'Keep the grid to at most 6 rows × 7 columns.' };
    if (!rows.every((r) => /^[01]+$/.test(r))) return { error: 'Use only 0 and 1.' };

    const R = rows.length;
    const grid = rows.map((r) => r.split('').map(Number));
    const h = [...Array(w)].map(() => 0);
    const steps: Step[] = [];
    let best = 0;
    let bestBox: { r0: number; r1: number; c0: number; c1: number } | null = null;
    const view = (r: number, mark: Record<string, 'active' | 'good' | 'final' | 'win' | 'dim'> = {}): MatrixState => ({
      grid: grid.map((row, ri) => row.map((v, ci) => (ri === r ? `${v}|${h[ci]}` : v))),
      rowLabels: [...Array(R)].map((_, i) => (i === r ? `row ${i} ←` : `row ${i}`)),
      colLabels: [...Array(w)].map((_, i) => i),
      mark,
      aggs: [
        { label: 'heights', value: h.join(' '), c: 'a' },
        { label: 'best area', value: String(best), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Any all-ones rectangle has a ', A('bottom row'), '. Fix that row, and the shape becomes a histogram of how far the ones stretch upward — a problem we already know how to solve.',
      ],
      state: view(-1),
    });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < w; c++) h[c] = grid[r][c] === 1 ? h[c] + 1 : 0;
      steps.push({
        tag: 'heights',
        trace: ['Row ', A(r), ': each column\'s bar is how many consecutive 1s sit above it — ', B(`[${h.join(', ')}]`), '. A 0 resets its bar.'],
        state: view(r, Object.fromEntries(grid[r].map((v, c) => [`${r},${c}`, v === 1 ? ('good' as const) : ('dim' as const)]))),
      });
      // Largest rectangle in this histogram.
      const stack: number[] = [];
      for (let i = 0; i <= w; i++) {
        while (stack.length && (i === w || h[stack[stack.length - 1]] >= h[i])) {
          const mid = stack.pop()!;
          const left = stack.length ? stack[stack.length - 1] : -1;
          const width = i - left - 1;
          const area = h[mid] * width;
          if (area > best && area > 0) {
            best = area;
            bestBox = { r0: r - h[mid] + 1, r1: r, c0: left + 1, c1: i - 1 };
            steps.push({
              tag: 'hist',
              trace: ['Bar of height ', A(h[mid]), ' spans ', A(width), ' column(s) → area ', C(area), ' — the biggest so far.'],
              state: view(
                r,
                Object.fromEntries(
                  [...Array(h[mid])].flatMap((_, dr) => [...Array(width)].map((__, dc) => [`${r - dr},${left + 1 + dc}`, 'final' as const]))
                )
              ),
            });
          }
          if (steps.length > MAX_STEPS) break;
        }
        if (i < w) stack.push(i);
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Largest all-ones rectangle has area ', C(best), bestBox ? [' — rows ', C(`${bestBox.r0}…${bestBox.r1}`), ', columns ', C(`${bestBox.c0}…${bestBox.c1}`)].join('') : '', '.'],
      state: view(
        -1,
        bestBox
          ? Object.fromEntries(
              [...Array(bestBox.r1 - bestBox.r0 + 1)].flatMap((_, dr) =>
                [...Array(bestBox!.c1 - bestBox!.c0 + 1)].map((__, dc) => [`${bestBox!.r0 + dr},${bestBox!.c0 + dc}`, 'final' as const])
              )
            )
          : {}
      ),
    });
    return { steps, result: String(best), resultDetail: bestBox ? `rows ${bestBox.r0}…${bestBox.r1}, cols ${bestBox.c0}…${bestBox.c1}` : undefined };
  },
  note: 'The reduction is the entire insight: every candidate rectangle is counted exactly once, at the row forming its bottom edge. The heights array updates in O(1) per cell because a 1 extends the bar above and a 0 kills it, so the total cost is R histogram solves at O(C) each.',
  complexity: { time: 'O(R·C)', space: 'O(C)' },
  brute: {
    label: 'Grow from every corner',
    technique: 'For every top-left cell, extend downwards row by row, shrinking the width to the shortest run of 1s seen so far.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maximalRectangle(vector<vector<char>>& g) {'),
        L('        int R = g.size(), C = g[0].size(), best = 0;', 'init'),
        L('        for (int r0 = 0; r0 < R; r0++)', 'corner'),
        L('            for (int c0 = 0; c0 < C; c0++) {', 'corner'),
        L('                int width = C;', 'corner'),
        L('                for (int r1 = r0; r1 < R; r1++) {', 'grow'),
        L('                    int run = 0;', 'grow'),
        L('                    while (c0 + run < C && g[r1][c0 + run] == \'1\') run++;', 'grow'),
        L('                    width = min(width, run);', 'grow'),
        L('                    if (!width) break;', 'grow'),
        L('                    best = max(best, width * (r1 - r0 + 1));', 'grow'),
        L('                }'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maximalRectangle(char[][] g) {'),
        L('        int R = g.length, C = g[0].length, best = 0;', 'init'),
        L('        for (int r0 = 0; r0 < R; r0++)', 'corner'),
        L('            for (int c0 = 0; c0 < C; c0++) {', 'corner'),
        L('                int width = C;', 'corner'),
        L('                for (int r1 = r0; r1 < R; r1++) {', 'grow'),
        L('                    int run = 0;', 'grow'),
        L('                    while (c0 + run < C && g[r1][c0 + run] == \'1\') run++;', 'grow'),
        L('                    width = Math.min(width, run);', 'grow'),
        L('                    if (width == 0) break;', 'grow'),
        L('                    best = Math.max(best, width * (r1 - r0 + 1));', 'grow'),
        L('                }'),
        L('            }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const rows = (values.grid ?? '')
        .split(/[;|]/)
        .map((r) => r.trim())
        .filter(Boolean);
      if (rows.length === 0) return { error: 'Enter a grid, rows separated by ";".' };
      const w = rows[0].length;
      if (!rows.every((r) => r.length === w)) return { error: 'All rows must be the same length.' };
      if (rows.length > 6 || w > 7) return { error: 'Keep the grid to at most 6 rows × 7 columns.' };
      if (!rows.every((r) => /^[01]+$/.test(r))) return { error: 'Use only 0 and 1.' };
      const R = rows.length;
      const g = rows.map((r) => r.split('').map(Number));
      let best = 0;
      let bestBox: { r0: number; r1: number; c0: number; c1: number } | null = null;
      const steps: Step[] = [];
      const view = (box?: { r0: number; r1: number; c0: number; c1: number }, m: 'active' | 'final' = 'active'): MatrixState => {
        const mark: MatrixState['mark'] = {};
        if (box) for (let r = box.r0; r <= box.r1; r++) for (let c = box.c0; c <= box.c1; c++) mark[`${r},${c}`] = m;
        return { grid: g, rowLabels: [...Array(R)].map((_, i) => i), colLabels: [...Array(w)].map((_, i) => i), mark, aggs: [{ label: 'best area', value: String(best), c: 'c' }] };
      };
      steps.push({ tag: 'init', trace: ['Treat every 1-cell as a possible top-left corner and grow a rectangle downwards from it.'], state: view() });
      for (let r0 = 0; r0 < R; r0++)
        for (let c0 = 0; c0 < w; c0++) {
          if (!g[r0][c0]) continue;
          let width = w;
          for (let r1 = r0; r1 < R; r1++) {
            let run = 0;
            while (c0 + run < w && g[r1][c0 + run] === 1) run++;
            width = Math.min(width, run);
            if (!width) break;
            const area = width * (r1 - r0 + 1);
            if (area > best) {
              best = area;
              bestBox = { r0, r1, c0, c1: c0 + width - 1 };
              steps.push({ tag: 'grow', trace: ['Corner (', A(r0), ',', A(c0), ') down to row ', A(r1), ': width ', A(width), ' × height ', A(r1 - r0 + 1), ' = ', B(area), ' — best so far.'], state: view(bestBox) });
            }
          }
        }
      steps.push({ tag: 'ret', trace: ['Largest all-ones rectangle: ', C(best), '.'], state: view(bestBox ?? undefined, 'final') });
      return { steps, result: String(best), resultDetail: bestBox ? `rows ${bestBox.r0}…${bestBox.r1}, cols ${bestBox.c0}…${bestBox.c1}` : undefined };
    },
    note: 'Every corner re-measures the runs below it, costing about O(R²·C²). Building a histogram of column heights per row and running the stack-based histogram solution makes it O(R·C).',
    complexity: { time: 'O(R² · C²)', space: 'O(1)' },
  },
};

/* ================= Online Stock Span ================= */
const stockSpan: ProblemDef = {
  slug: 'online-stock-span',
  title: 'Online Stock Span',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/online-stock-span/',
  technique: 'Pop smaller-or-equal prices and absorb their spans — the stack stays strictly decreasing.',
  widget: 'stack',
  widgetTitle: 'Prices & span stack',
  inputs: [{ key: 'nums', label: 'Daily prices', defaultValue: '100, 80, 60, 70, 60, 75, 85', wide: true }],
  code: {
    cpp: [
      L('class StockSpanner {'),
      L('    stack<pair<int,int>> st;   // (price, span)'),
      L('public:'),
      L('    int next(int price) {', 'call'),
      L('        int span = 1;', 'call'),
      L('        while (!st.empty() && st.top().first <= price) {', 'absorb'),
      L('            span += st.top().second;', 'absorb'),
      L('            st.pop();', 'absorb'),
      L('        }'),
      L('        st.push({price, span});', 'push'),
      L('        return span;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class StockSpanner {'),
      L('    Deque<int[]> st = new ArrayDeque<>();   // {price, span}'),
      L('    public int next(int price) {', 'call'),
      L('        int span = 1;', 'call'),
      L('        while (!st.isEmpty() && st.peek()[0] <= price) {', 'absorb'),
      L('            span += st.pop()[1];', 'absorb'),
      L('        }'),
      L('        st.push(new int[]{price, span});', 'push'),
      L('        return span;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const prices = parseIntArray(values.nums, { min: 1, maxLen: 12 });
    if (typeof prices === 'string') return { error: prices };
    const stack: { p: number; s: number }[] = [];
    const spans: number[] = [];
    const steps: Step[] = [];
    const st = (i: number): StackState => ({
      array: {
        arr: prices,
        mark: {
          ...Object.fromEntries(spans.map((_, k) => [k, 'good' as const])),
          ...(i < prices.length ? { [i]: 'active' as const } : {}),
        },
      },
      stack: stack.map((e) => ({ v: `${e.p} (span ${e.s})`, c: 'b' as const })),
      stackLabel: 'strictly decreasing prices with their spans',
      aggs: [{ label: 'spans', value: spans.join(', ') || '—', c: 'c' }],
    });
    steps.push({
      tag: 'call',
      trace: ['The span is how many consecutive days back the price was ', A('≤ today'), '. Days already beaten can be summarised, never revisited.'],
      state: st(prices.length),
    });
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      let span = 1;
      steps.push({ tag: 'call', trace: ['Day ', A(i), ': price ', A(price), '. Start the span at ', B(1), ' (today itself).'], state: st(i) });
      while (stack.length && stack[stack.length - 1].p <= price) {
        const e = stack.pop()!;
        span += e.s;
        steps.push({
          tag: 'absorb',
          trace: [
            'Price ', F(e.p), ' is not above today, so its whole ', F(e.s), '-day span is swallowed — span grows to ', B(span),
            '. That block can never matter again, because today beats it too.',
          ],
          state: st(i),
        });
        if (steps.length > MAX_STEPS) break;
      }
      stack.push({ p: price, s: span });
      spans.push(span);
      steps.push({ tag: 'push', trace: ['Day ', A(i), ' has span ', C(span), '. Push (', B(price), ', ', B(span), ') for future days.'], state: st(i) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({ tag: 'ret', trace: ['Spans day by day: ', C(`[${spans.join(', ')}]`), '.'], state: st(prices.length) });
    return { steps, result: `[${spans.join(', ')}]` };
  },
  note: 'Storing the span alongside the price is what makes this online: a popped entry hands over its entire history in one addition, so no day is ever re-examined. Each price is pushed and popped at most once, giving O(1) amortised per call even though a single call can pop many entries.',
  complexity: { time: 'O(1) amortised per call', space: 'O(n)' },
  brute: {
    label: 'Walk back each day',
    technique: 'For each new price, walk backwards through the history while prices are at most today’s.',
    code: {
      cpp: [
        L('class StockSpanner {'),
        L('    vector<int> hist;', 'init'),
        L('public:'),
        L('    int next(int price) {'),
        L('        hist.push_back(price);', 'span'),
        L('        int span = 0;', 'span'),
        L('        for (int i = hist.size() - 1; i >= 0 && hist[i] <= price; i--) span++;', 'span'),
        L('        return span;', 'span', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class StockSpanner {'),
        L('    List<Integer> hist = new ArrayList<>();', 'init'),
        L('    public int next(int price) {'),
        L('        hist.add(price);', 'span'),
        L('        int span = 0;', 'span'),
        L('        for (int i = hist.size() - 1; i >= 0 && hist.get(i) <= price; i--) span++;', 'span'),
        L('        return span;', 'span', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const prices = parseIntArray(values.nums, { min: 1, maxLen: 12 });
      if (typeof prices === 'string') return { error: prices };
      const spans: number[] = [];
      let looks = 0;
      const steps: Step[] = [];
      const st = (i?: number, from?: number): StackState => ({
        array: {
          arr: prices,
          mark: i !== undefined && from !== undefined ? { ...Object.fromEntries([...Array(i - from + 1)].map((_, k) => [from + k, 'good' as const])), [i]: 'active' as const } : {},
        },
        stack: [],
        stackLabel: 'no stack — full history kept',
        aggs: [
          { label: 'spans', value: `[${spans.join(', ')}]`, c: 'c' },
          { label: 'prices looked back at', value: String(looks), c: 'a' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Keep every past price; each day walks back until it meets a higher one.'], state: st() });
      prices.forEach((p, i) => {
        let span = 0;
        for (let j = i; j >= 0 && prices[j] <= p; j--) span++;
        looks += span;
        spans.push(span);
        steps.push({ tag: 'span', trace: ['Day ', A(i), ' (price ', A(p), '): the previous ', B(span - 1), ' day(s) were not higher → span ', B(span), '.'], state: st(i, i - span + 1) });
      });
      steps.push({ tag: 'ret', trace: ['Spans: ', C(`[${spans.join(', ')}]`), '.'], state: st() });
      return { steps, result: `[${spans.join(', ')}]` };
    },
    note: 'A long rising trend makes every day walk all the way back, so n calls cost O(n²). The monotonic stack folds dominated days into a single entry with their span, making each call O(1) amortised.',
    complexity: { time: 'O(n) per call', space: 'O(n)' },
  },
};

/* ================= Basic Calculator II ================= */
const basicCalculatorII: ProblemDef = {
  slug: 'basic-calculator-ii',
  title: 'Basic Calculator II',
  category: 'Stack',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/basic-calculator-ii/',
  technique: 'Push additions, but resolve × and ÷ immediately against the stack top.',
  widget: 'stack',
  widgetTitle: 'Expression & operand stack',
  inputs: [{ key: 'expr', label: 'Expression (+ − × ÷, no parentheses)', defaultValue: '3+2*2-6/3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int calculate(string s) {'),
      L('        stack<int> st; long num = 0; char op = \'+\';', 'init'),
      L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
      L('            char c = s[i];'),
      L('            if (isdigit(c)) num = num * 10 + (c - \'0\');', 'digit'),
      L('            if ((!isdigit(c) && c != \' \') || i + 1 == s.size()) {', 'apply'),
      L('                if (op == \'+\') st.push(num);', 'add'),
      L('                else if (op == \'-\') st.push(-num);', 'add'),
      L('                else if (op == \'*\') { int t = st.top(); st.pop(); st.push(t * num); }', 'mul'),
      L('                else { int t = st.top(); st.pop(); st.push(t / num); }', 'mul'),
      L('                op = c; num = 0;', 'apply'),
      L('            }'),
      L('        }'),
      L('        int res = 0;'),
      L('        while (!st.empty()) { res += st.top(); st.pop(); }', 'sum'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int calculate(String s) {'),
      L('        Deque<Integer> st = new ArrayDeque<>();'),
      L('        long num = 0; char op = \'+\';', 'init'),
      L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
      L('            char c = s.charAt(i);'),
      L('            if (Character.isDigit(c)) num = num * 10 + (c - \'0\');', 'digit'),
      L('            if ((!Character.isDigit(c) && c != \' \')', 'apply'),
      L('                    || i + 1 == s.length()) {', 'apply'),
      L('                if (op == \'+\') st.push((int) num);', 'add'),
      L('                else if (op == \'-\') st.push((int) -num);', 'add'),
      L('                else if (op == \'*\') st.push((int) (st.pop() * num));', 'mul'),
      L('                else st.push((int) (st.pop() / num));', 'mul'),
      L('                op = c; num = 0;', 'apply'),
      L('            }'),
      L('        }'),
      L('        int res = 0;'),
      L('        for (int v : st) res += v;', 'sum'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const expr = (values.expr ?? '').replace(/\s+/g, '');
    if (!/^\d+([+\-*/]\d+)*$/.test(expr)) return { error: 'Use digits and + − * / only, e.g. 3+2*2-6/3.' };
    if (expr.length > 20) return { error: 'Keep the expression to at most 20 characters.' };
    const chars = expr.split('');
    const stack: number[] = [];
    const steps: Step[] = [];
    let num = 0;
    let op = '+';
    const st = (i: number): StackState => ({
      array: { arr: chars, mark: i < chars.length ? { [i]: 'active' } : {} },
      stack: stack.map((v) => ({ v, c: v >= 0 ? ('b' as const) : ('a' as const) })),
      stackLabel: 'terms waiting to be added up',
      aggs: [
        { label: 'current number', value: String(num), c: 'a' },
        { label: 'pending operator', value: op, c: 'b' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Precedence without parentheses is easy to fake: ', A('+'), ' and ', A('−'), ' just park a term on the stack, while ', B('×'), ' and ', B('÷'),
        ' must fold into the term already there.',
      ],
      state: st(chars.length),
    });
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (/\d/.test(c)) {
        num = num * 10 + Number(c);
        steps.push({ tag: 'digit', trace: ['Digit ', A(c), ' — building the number: ', B(num), '.'], state: st(i) });
      }
      if (!/\d/.test(c) || i + 1 === chars.length) {
        if (op === '+') {
          stack.push(num);
          steps.push({ tag: 'add', trace: ['Pending operator is ', A('+'), ' — push ', B(num), ' as its own term.'], state: st(i) });
        } else if (op === '-') {
          stack.push(-num);
          steps.push({ tag: 'add', trace: ['Pending operator is ', A('−'), ' — push ', B(-num), ', so the final sum handles the subtraction.'], state: st(i) });
        } else if (op === '*') {
          const t = stack.pop()!;
          stack.push(t * num);
          steps.push({ tag: 'mul', trace: ['× binds tighter than + — resolve now: ', A(t), ' × ', A(num), ' = ', B(t * num), '.'], state: st(i) });
        } else {
          const t = stack.pop()!;
          const q = Math.trunc(t / num);
          stack.push(q);
          steps.push({ tag: 'mul', trace: ['÷ binds tighter too: ', A(t), ' ÷ ', A(num), ' = ', B(q), ' (truncated toward zero).'], state: st(i) });
        }
        if (!/\d/.test(c)) op = c;
        num = 0;
        steps.push({ tag: 'apply', trace: ['Remember ', A(op), ' as the next pending operator and reset the number buffer.'], state: st(i) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const res = stack.reduce((x, y) => x + y, 0);
    steps.push({
      tag: 'sum',
      trace: ['Every term on the stack is already sign-correct and fully multiplied — add them: ', A(stack.join(' + ')), '.'],
      state: st(chars.length),
    });
    steps.push({ tag: 'ret', trace: ['Result: ', C(res), '.'], state: st(chars.length) });
    return { steps, result: String(res) };
  },
  note: 'Storing subtraction as a negative term turns the final pass into a plain sum, removing any need to track operators a second time. Note that the operator is applied one character late — you can only act on "3+2" once you see the character after the 2 — which is why the loop also fires on the last index.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Two passes',
    technique: 'First pass: evaluate every × and ÷ left to right into a list of terms. Second pass: add and subtract the terms.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int calculate(string s) {'),
        L('        vector<long> nums; vector<char> ops;  // tokenise', 'tok'),
        L('        /* ... fill nums and ops from s ... */', 'tok'),
        L('        vector<long> terms = {nums[0]}; vector<char> addOps;', 'mul'),
        L('        for (int i = 0; i < ops.size(); i++) {', 'mul'),
        L('            if (ops[i] == \'*\') terms.back() *= nums[i + 1];', 'mul'),
        L('            else if (ops[i] == \'/\') terms.back() /= nums[i + 1];', 'mul'),
        L('            else { terms.push_back(nums[i + 1]); addOps.push_back(ops[i]); }', 'mul'),
        L('        }'),
        L('        long res = terms[0];', 'sum'),
        L('        for (int i = 0; i < addOps.size(); i++)', 'sum'),
        L('            res += addOps[i] == \'+\' ? terms[i + 1] : -terms[i + 1];', 'sum'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int calculate(String s) {'),
        L('        List<Long> nums = new ArrayList<>(); List<Character> ops = new ArrayList<>();  // tokenise', 'tok'),
        L('        /* ... fill nums and ops from s ... */', 'tok'),
        L('        List<Long> terms = new ArrayList<>(List.of(nums.get(0))); List<Character> addOps = new ArrayList<>();', 'mul'),
        L('        for (int i = 0; i < ops.size(); i++) {', 'mul'),
        L('            char op = ops.get(i); long v = nums.get(i + 1); int last = terms.size() - 1;', 'mul'),
        L('            if (op == \'*\') terms.set(last, terms.get(last) * v);', 'mul'),
        L('            else if (op == \'/\') terms.set(last, terms.get(last) / v);', 'mul'),
        L('            else { terms.add(v); addOps.add(op); }', 'mul'),
        L('        }'),
        L('        long res = terms.get(0);', 'sum'),
        L('        for (int i = 0; i < addOps.size(); i++) res += addOps.get(i) == \'+\' ? terms.get(i + 1) : -terms.get(i + 1);', 'sum'),
        L('        return (int) res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const expr = (values.expr ?? '').replace(/\s+/g, '');
      if (!/^\d+([+\-*/]\d+)*$/.test(expr)) return { error: 'Use digits and + − * / only, e.g. 3+2*2-6/3.' };
      if (expr.length > 20) return { error: 'Keep the expression to at most 20 characters.' };
      const nums = expr.split(/[+\-*/]/).map(Number);
      const ops = expr.replace(/\d+/g, '').split('');
      for (let i = 0; i < ops.length; i++) if (ops[i] === '/' && nums[i + 1] === 0) return { error: 'Division by zero.' };
      const steps: Step[] = [];
      const terms = [nums[0]];
      const addOps: string[] = [];
      const st = (label: string): StackState => ({
        array: { arr: expr.split('') },
        stack: terms.map((v, i) => ({ v: i === 0 ? String(v) : `${addOps[i - 1]} ${v}`, c: 'b' as const })),
        stackLabel: label,
      });
      steps.push({ tag: 'tok', trace: ['Tokenise: numbers ', A(nums.join(', ')), ' and operators ', A(ops.join(' ') || '—'), '.'], state: st('terms after pass 1') });
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        const v = nums[i + 1];
        if (op === '*' || op === '/') {
          const before = terms[terms.length - 1];
          terms[terms.length - 1] = op === '*' ? before * v : Math.trunc(before / v);
          steps.push({ tag: 'mul', trace: ['Pass 1: ', A(`${before} ${op} ${v}`), ' = ', B(terms[terms.length - 1]), ' — folded into the current term.'], state: st('terms after pass 1') });
        } else {
          terms.push(v);
          addOps.push(op);
          steps.push({ tag: 'mul', trace: ['Pass 1: "', A(op), '" starts a new term ', B(v), '.'], state: st('terms after pass 1') });
        }
      }
      let res = terms[0];
      for (let i = 0; i < addOps.length; i++) res += addOps[i] === '+' ? terms[i + 1] : -terms[i + 1];
      steps.push({ tag: 'sum', trace: ['Pass 2: add up the terms left to right → ', B(res), '.'], state: st('terms, combined in pass 2') });
      steps.push({ tag: 'ret', trace: ['Result: ', C(res), '.'], state: st('done') });
      return { steps, result: String(res) };
    },
    note: 'Same O(n) time, but it tokenises first and stores every term before a second pass. The single-pass stack version folds × and ÷ as it reads, keeping only signed terms on the stack.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= Longest Valid Parentheses ================= */
const longestValidParens: ProblemDef = {
  slug: 'longest-valid-parentheses',
  title: 'Longest Valid Parentheses',
  category: 'Stack',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/longest-valid-parentheses/',
  technique: 'Keep the index of the last unmatched character on the stack — it is the wall each valid run measures from.',
  widget: 'stack',
  widgetTitle: 'String & index stack',
  inputs: [{ key: 's', label: 'Parentheses string', defaultValue: ')()())', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestValidParentheses(string s) {'),
      L('        stack<int> st; st.push(-1);', 'init'),
      L('        int best = 0;'),
      L('        for (int i = 0; i < s.size(); i++) {', 'loop'),
      L('            if (s[i] == \'(\') st.push(i);', 'open'),
      L('            else {'),
      L('                st.pop();', 'close'),
      L('                if (st.empty()) st.push(i);', 'wall'),
      L('                else best = max(best, i - st.top());', 'measure'),
      L('            }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestValidParentheses(String s) {'),
      L('        Deque<Integer> st = new ArrayDeque<>(); st.push(-1);', 'init'),
      L('        int best = 0;'),
      L('        for (int i = 0; i < s.length(); i++) {', 'loop'),
      L('            if (s.charAt(i) == \'(\') st.push(i);', 'open'),
      L('            else {'),
      L('                st.pop();', 'close'),
      L('                if (st.isEmpty()) st.push(i);', 'wall'),
      L('                else best = Math.max(best, i - st.peek());', 'measure'),
      L('            }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^[()]{1,18}$/.test(s)) return { error: 'Use 1–18 characters, only ( and ).' };
    const ch = s.split('');
    const stack: number[] = [-1];
    const steps: Step[] = [];
    let best = 0;
    let bestRange: [number, number] | null = null;
    const st = (i: number, mark: Record<number, 'active' | 'good' | 'final' | 'win' | 'dim'> = {}): StackState => ({
      array: { arr: ch, mark: { ...(i < ch.length ? { [i]: 'active' as const } : {}), ...mark } },
      stack: stack.map((v) => ({ v: v === -1 ? 'wall @ -1' : `@${v}`, c: v === -1 ? ('f' as const) : ('b' as const) })),
      stackLabel: 'indices: bottom is the last unmatched position',
      aggs: [{ label: 'best length', value: String(best), c: 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Seed the stack with ', A(-1), ' as a ', A('wall'), '. The bottom entry always marks the last position that can never be part of a valid run — lengths are measured from it.',
      ],
      state: st(ch.length),
    });
    for (let i = 0; i < ch.length; i++) {
      if (ch[i] === '(') {
        stack.push(i);
        steps.push({ tag: 'open', trace: ["'", A('('), "' at index ", A(i), ' — push it; it is waiting for a partner.'], state: st(i) });
      } else {
        stack.pop();
        steps.push({ tag: 'close', trace: ["'", A(')'), "' at index ", A(i), ' — pop, cancelling the most recent unmatched position.'], state: st(i) });
        if (stack.length === 0) {
          stack.push(i);
          steps.push({
            tag: 'wall',
            trace: ['The stack emptied, so this ', F(')'), ' had nothing to match — index ', F(i), ' becomes the new wall.'],
            state: st(i, { [i]: 'dim' }),
          });
        } else {
          const len = i - stack[stack.length - 1];
          if (len > best) {
            best = len;
            bestRange = [stack[stack.length - 1] + 1, i];
          }
          steps.push({
            tag: 'measure',
            trace: [
              'Everything from just after the wall at ', B(stack[stack.length - 1]), ' through index ', B(i), ' is balanced — length ', B(len),
              len === best ? ' — the best so far.' : ` (best stays ${best}).`,
            ],
            state: st(i, Object.fromEntries([...Array(len)].map((_, k) => [stack[stack.length - 1] + 1 + k, 'good' as const]))),
          });
        }
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: best ? ['Longest valid substring is ', C(best), ' character(s) long', bestRange ? [' (indices ', C(`${bestRange[0]}…${bestRange[1]}`), ')'].join('') : '', '.'] : ['Nothing balances — the answer is ', C(0), '.'],
      state: st(ch.length, bestRange ? Object.fromEntries([...Array(best)].map((_, k) => [bestRange![0] + k, 'final' as const])) : {}),
    });
    return { steps, result: String(best), resultDetail: bestRange ? `indices ${bestRange[0]}…${bestRange[1]}` : undefined };
  },
  note: 'Storing indices rather than characters is what lets a single subtraction recover the length, including runs that merge across earlier matches — "()(())" measures 6 in one step. The −1 sentinel removes the empty-stack special case for the very first valid run.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Two counters (O(1) space)',
    technique: 'Scan left to right counting "(" and ")"; equal counts mark a valid run, too many ")" resets. Repeat right to left to catch runs with extra "(".',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int longestValidParentheses(string s) {'),
        L('        int best = 0, open = 0, close = 0;', 'init'),
        L('        for (char c : s) {', 'ltr'),
        L('            c == \'(\' ? open++ : close++;', 'ltr'),
        L('            if (open == close) best = max(best, 2 * close);', 'ltr'),
        L('            else if (close > open) open = close = 0;', 'ltr'),
        L('        }'),
        L('        open = close = 0;', 'rtl'),
        L('        for (int i = s.size() - 1; i >= 0; i--) {', 'rtl'),
        L('            s[i] == \'(\' ? open++ : close++;', 'rtl'),
        L('            if (open == close) best = max(best, 2 * open);', 'rtl'),
        L('            else if (open > close) open = close = 0;', 'rtl'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int longestValidParentheses(String s) {'),
        L('        int best = 0, open = 0, close = 0;', 'init'),
        L('        for (char c : s.toCharArray()) {', 'ltr'),
        L('            if (c == \'(\') open++; else close++;', 'ltr'),
        L('            if (open == close) best = Math.max(best, 2 * close);', 'ltr'),
        L('            else if (close > open) open = close = 0;', 'ltr'),
        L('        }'),
        L('        open = close = 0;', 'rtl'),
        L('        for (int i = s.length() - 1; i >= 0; i--) {', 'rtl'),
        L('            if (s.charAt(i) == \'(\') open++; else close++;', 'rtl'),
        L('            if (open == close) best = Math.max(best, 2 * open);', 'rtl'),
        L('            else if (open > close) open = close = 0;', 'rtl'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const s = (values.s ?? '').trim();
      if (!/^[()]{1,18}$/.test(s)) return { error: 'Use 1–18 characters, only ( and ).' };
      const ch = s.split('');
      const n = ch.length;
      let best = 0;
      let bestRange: [number, number] | null = null;
      let open = 0;
      let close = 0;
      const steps: Step[] = [];
      const st = (i: number, dir: string, run?: [number, number]): StackState => ({
        array: { arr: ch, mark: { ...(run ? Object.fromEntries([...Array(run[1] - run[0] + 1)].map((_, k) => [run[0] + k, 'good' as const])) : {}), ...(i >= 0 && i < n ? { [i]: 'active' as const } : {}) } },
        stack: [],
        stackLabel: 'no stack — just two counters',
        aggs: [
          { label: `open / close (${dir})`, value: `${open} / ${close}`, c: 'a' },
          { label: 'best length', value: String(best), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Count opens and closes while scanning. Equal counts close a valid run; the wrong kind of excess resets.'], state: st(-1, '→') });
      let start = 0;
      for (let i = 0; i < n; i++) {
        if (ch[i] === '(') open++;
        else close++;
        if (open === close) {
          if (2 * close > best) {
            best = 2 * close;
            bestRange = [i - best + 1, i];
          }
          steps.push({ tag: 'ltr', trace: ['→ Counts balance at ', A(open), ' each — valid run of length ', B(2 * close), '.'], state: st(i, '→', [i - 2 * close + 1, i]) });
        } else if (close > open) {
          open = close = 0;
          start = i + 1;
          steps.push({ tag: 'ltr', trace: ['→ More ")" than "(" — nothing through here can be valid. Reset.'], state: st(i, '→') });
        } else {
          steps.push({ tag: 'ltr', trace: ['→ ', A(open), ' open, ', A(close), ' close — keep going.'], state: st(i, '→', open > 0 ? [start, i] : undefined) });
        }
      }
      open = close = 0;
      steps.push({ tag: 'rtl', trace: ['Now scan right to left — this catches runs that the first pass missed because of an unmatched "(" on their left.'], state: st(n, '←') });
      for (let i = n - 1; i >= 0; i--) {
        if (ch[i] === '(') open++;
        else close++;
        if (open === close) {
          if (2 * open > best) {
            best = 2 * open;
            bestRange = [i, i + best - 1];
          }
          steps.push({ tag: 'rtl', trace: ['← Counts balance — valid run of length ', B(2 * open), '.'], state: st(i, '←', [i, i + 2 * open - 1]) });
        } else if (open > close) {
          open = close = 0;
          steps.push({ tag: 'rtl', trace: ['← More "(" than ")" — reset.'], state: st(i, '←') });
        }
      }
      steps.push({ tag: 'ret', trace: ['Longest valid run: ', C(best), '.'], state: st(-1, '←', bestRange ?? undefined) });
      return { steps, result: String(best), resultDetail: bestRange ? `indices ${bestRange[0]}…${bestRange[1]}` : undefined };
    },
    note: 'Better on memory: the same O(n) time, but only two integers instead of a stack of indices. The second, right-to-left pass is what handles strings like "(()" where the left-to-right counts never balance.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

export const stack2: ProblemDef[] = [
  nextGreaterII,
  queueUsingStacks,
  stackUsingQueues,
  asteroidCollision,
  sumSubarrayMins,
  removeKDigits,
  maximalRectangle,
  stockSpan,
  basicCalculatorII,
  longestValidParens,
];
