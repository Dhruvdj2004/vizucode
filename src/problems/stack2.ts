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
