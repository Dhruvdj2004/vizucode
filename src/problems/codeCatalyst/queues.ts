// Code Catalyst — Practice Set 9: queues (simulations and designs).
import type { ArrayState, ProblemDef, StackState, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { MAX_STEPS, ag, arr, fmt, parseWord, range } from './util';

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
/** Lines of a design-class body, indented one level. */
const cls = (lines: [string, ...string[]][]) => lines.map(([t, ...tags]) => L(t, ...tags));

/** Parses "push 1, pop, increment 2 100" into [name, args]. */
function parseOps(s: string, allowed: Record<string, number>, max = 16): [string, number[]][] | { error: string } {
  const ops = s.split(',').map((o) => o.trim()).filter(Boolean);
  if (ops.length === 0 || ops.length > max) return { error: `Give 1–${max} operations separated by commas.` };
  const out: [string, number[]][] = [];
  for (const op of ops) {
    const [name, ...rest] = op.split(/\s+/);
    if (!(name in allowed)) return { error: `Unknown operation "${name}". Allowed: ${Object.keys(allowed).join(', ')}.` };
    const nums = rest.map(Number);
    if (nums.length !== allowed[name] || nums.some((x) => !Number.isInteger(x))) return { error: `"${op}" needs ${allowed[name]} integer argument(s).` };
    out.push([name, nums]);
  }
  return out;
}

/** A queue drawn as a row, front on the left. */
const qRow = (items: (number | string)[], o: Omit<ArrayState, 'arr'> = {}): ArrayState => arr(items.length ? items : ['(empty)'], o);

/* ================= Number of Recent Calls ================= */
const recentCounter: ProblemDef = {
  slug: 'number-of-recent-calls',
  title: 'Number of Recent Calls',
  category: 'Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/number-of-recent-calls/',
  technique: 'Keep ping times in a queue; drop from the front anything older than t − 3000. The size is the answer.',
  widget: 'array',
  widgetTitle: 'Queue of recent pings (front on the left)',
  inputs: [{ key: 'pings', label: 'ping times', defaultValue: '1, 100, 3001, 3002, 6500', wide: true }],
  code: {
    cpp: cls([
      ['class RecentCounter {'],
      ['    queue<int> q;'],
      ['public:'],
      ['    int ping(int t) {'],
      ['        q.push(t);', 'push'],
      ['        while (q.front() < t - 3000) q.pop();', 'drop'],
      ['        return q.size();', 'drop', 'push'],
      ['    }'],
      ['};'],
    ]),
    java: cls([
      ['class RecentCounter {'],
      ['    private final Deque<Integer> q = new ArrayDeque<>();'],
      ['    public int ping(int t) {'],
      ['        q.addLast(t);', 'push'],
      ['        while (q.peekFirst() < t - 3000) q.pollFirst();', 'drop'],
      ['        return q.size();', 'drop', 'push'],
      ['    }'],
      ['}'],
    ]),
  },
  run(values) {
    const t = parseIntArray(values.pings, { maxLen: 12, min: 1 });
    if (typeof t === 'string') return { error: t };
    for (let i = 1; i < t.length; i++) if (t[i] <= t[i - 1]) return { error: 'Ping times must be strictly increasing.' };
    const q: number[] = [];
    const res: (number | string)[] = ['null'];
    const out: Step[] = [];
    for (const x of t) {
      q.push(x);
      out.push({ tag: 'push', trace: ['ping(', A(x), '): add it. The window is [', String(x - 3000), ', ', String(x), '].'], state: qRow([...q], { mark: { [q.length - 1]: 'active' }, aggs: [ag('outputs', fmt(res), 'c')] }) });
      const dropped: number[] = [];
      while (q[0] < x - 3000) dropped.push(q.shift()!);
      res.push(q.length);
      out.push({ tag: dropped.length ? 'drop' : 'push', trace: dropped.length ? ['Drop ', F(dropped.join(', ')), ' — older than ', String(x - 3000), '. ', C(q.length), ' recent call(s).'] : ['Nothing is too old. ', C(q.length), ' recent call(s).'], state: qRow([...q], { mark: range(0, q.length - 1, 'good'), aggs: [ag('outputs', fmt(res), 'c')] }) });
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'Pings arrive in increasing time, so the old ones are always at the front. Each ping is added once and removed at most once, giving O(1) amortised per call.',
  complexity: { time: 'O(1) amortised per ping', space: 'O(3000) at most' },
};

/* ================= Number of Students Unable to Eat Lunch ================= */
const countStudents: ProblemDef = {
  slug: 'number-of-students-unable-to-eat-lunch',
  title: 'Number of Students Unable to Eat Lunch',
  category: 'Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/',
  technique: 'Queue order does not matter — only how many want each type. Serve the stack until nobody wants the top sandwich.',
  widget: 'array',
  widgetTitle: 'sandwiches (top on the left)',
  inputs: [
    { key: 'students', label: 'students', defaultValue: '1, 1, 1, 0, 0, 1', wide: true },
    { key: 'sandwiches', label: 'sandwiches', defaultValue: '1, 0, 0, 0, 1, 1', wide: true },
  ],
  code: {
    cpp: cpp('int countStudents(vector<int>& students, vector<int>& sandwiches)', [
      ['int want[2] = {0, 0};'],
      ['for (int s : students) want[s]++;', 'count'],
      ['for (int s : sandwiches) {'],
      ['    if (want[s] == 0) break;', 'stuck'],
      ['    want[s]--;', 'eat'],
      ['}'],
      ['return want[0] + want[1];', 'ret'],
    ]),
    java: java('int countStudents(int[] students, int[] sandwiches)', [
      ['int[] want = new int[2];'],
      ['for (int s : students) want[s]++;', 'count'],
      ['for (int s : sandwiches) {'],
      ['    if (want[s] == 0) break;', 'stuck'],
      ['    want[s]--;', 'eat'],
      ['}'],
      ['return want[0] + want[1];', 'ret'],
    ]),
  },
  run(values) {
    const st = parseIntArray(values.students, { maxLen: 14, min: 0, max: 1 });
    if (typeof st === 'string') return { error: st };
    const sw = parseIntArray(values.sandwiches, { maxLen: 14, min: 0, max: 1 });
    if (typeof sw === 'string') return { error: sw };
    if (st.length !== sw.length) return { error: 'students and sandwiches must be the same length.' };
    const want = [0, 0];
    for (const s of st) want[s]++;
    const out: Step[] = [];
    const aggs = () => [ag('want circular (0)', want[0]), ag('want square (1)', want[1])];
    out.push({ tag: 'count', trace: ['Students keep rotating until someone takes the top sandwich, so only the counts matter: ', A(want[0]), ' want 0, ', A(want[1]), ' want 1.'], state: arr(sw, { aggs: aggs() }) });
    const eaten: NonNullable<ArrayState['mark']> = {};
    for (let i = 0; i < sw.length; i++) {
      const s = sw[i];
      if (want[s] === 0) {
        out.push({ tag: 'stuck', trace: ['Nobody left wants sandwich type ', F(s), '. The line rotates forever — stop.'], state: arr(sw, { mark: { ...eaten, [i]: 'dim' }, aggs: aggs() }) });
        break;
      }
      want[s]--;
      eaten[i] = 'good';
      out.push({ tag: 'eat', trace: ['Someone who wants ', A(s), ' eventually reaches the front and takes it.'], state: arr(sw, { mark: { ...eaten }, aggs: aggs() }) });
    }
    const ans = want[0] + want[1];
    out.push({ tag: 'ret', trace: [C(ans), ' student(s) cannot eat.'], state: arr(sw, { mark: eaten, aggs: aggs() }) });
    return { steps: out, result: String(ans) };
  },
  note: 'Simulating the rotating queue works but is O(n²). Because a student who wants the top sandwich will always reach the front eventually, the process only gets stuck when no one wants it — which counting alone can detect.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Time Needed to Buy Tickets ================= */
const timeTickets: ProblemDef = {
  slug: 'time-needed-to-buy-tickets',
  title: 'Time Needed to Buy Tickets',
  category: 'Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/time-needed-to-buy-tickets/',
  technique: 'Person i ahead of k buys min(t[i], t[k]) tickets before k finishes; anyone behind buys min(t[i], t[k] − 1).',
  widget: 'array',
  widgetTitle: 'tickets',
  inputs: [
    { key: 'tickets', label: 'tickets', defaultValue: '2, 3, 2', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('int timeRequiredToBuy(vector<int>& tickets, int k)', [
      ['int time = 0;'],
      ['for (int i = 0; i < tickets.size(); i++) {'],
      ['    if (i <= k) time += min(tickets[i], tickets[k]);', 'ahead'],
      ['    else time += min(tickets[i], tickets[k] - 1);', 'behind'],
      ['}'],
      ['return time;', 'ret'],
    ]),
    java: java('int timeRequiredToBuy(int[] tickets, int k)', [
      ['int time = 0;'],
      ['for (int i = 0; i < tickets.length; i++) {'],
      ['    if (i <= k) time += Math.min(tickets[i], tickets[k]);', 'ahead'],
      ['    else time += Math.min(tickets[i], tickets[k] - 1);', 'behind'],
      ['}'],
      ['return time;', 'ret'],
    ]),
  },
  run(values) {
    const t = parseIntArray(values.tickets, { maxLen: 14, min: 1 });
    if (typeof t === 'string') return { error: t };
    const k = parseInt1(values.k, 'k', { min: 0, max: t.length - 1 });
    if (typeof k === 'string') return { error: k };
    let time = 0;
    const out: Step[] = [];
    t.forEach((x, i) => {
      if (i <= k) {
        const v = Math.min(x, t[k]);
        time += v;
        out.push({ tag: 'ahead', trace: ['Person ', String(i), i === k ? ' (that is k)' : ' (at or ahead of k)', ' buys ', A(v), ' ticket(s) before k is done — min(', String(x), ', ', String(t[k]), '). Time = ', B(time), '.'], state: arr(t, { mark: { [i]: 'active', [k]: 'final' }, aggs: [ag('time', time, 'c')] }) });
      } else {
        const v = Math.min(x, t[k] - 1);
        time += v;
        out.push({ tag: 'behind', trace: ['Person ', String(i), ' is behind k, so k finishes before their ', String(t[k]), 'th turn: ', A(v), ' ticket(s). Time = ', B(time), '.'], state: arr(t, { mark: { [i]: 'active', [k]: 'final' }, aggs: [ag('time', time, 'c')] }) });
      }
    });
    out.push({ tag: 'ret', trace: ['Person k is done at time ', C(time), '.'], state: arr(t, { mark: { [k]: 'final' }, aggs: [ag('time', time, 'c')] }) });
    return { steps: out, result: String(time) };
  },
  note: 'You can simulate the queue, but each person\'s contribution has a closed form: everyone gets a turn per round until k\'s last round, and the people behind k miss that final round. One pass adds it all up.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Design Circular Queue ================= */
const circularQueue: ProblemDef = {
  slug: 'design-circular-queue',
  title: 'Design Circular Queue',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-circular-queue/',
  technique: 'A fixed array with a head index and a size; the tail is (head + size) % k, so slots wrap around.',
  widget: 'array',
  widgetTitle: 'Backing array (k slots)',
  inputs: [
    { key: 'k', label: 'k', defaultValue: '3' },
    { key: 'ops', label: 'operations', defaultValue: 'enQueue 1, enQueue 2, enQueue 3, enQueue 4, Rear, isFull, deQueue, enQueue 4, Rear', wide: true },
  ],
  code: {
    cpp: cls([
      ['class MyCircularQueue {'],
      ['    vector<int> a; int head = 0, size = 0;'],
      ['public:'],
      ['    MyCircularQueue(int k) : a(k) {}'],
      ['    bool enQueue(int v) {'],
      ['        if (size == a.size()) return false;', 'full'],
      ['        a[(head + size++) % a.size()] = v; return true;', 'enq'],
      ['    }'],
      ['    bool deQueue() {'],
      ['        if (size == 0) return false;', 'emptyop'],
      ['        head = (head + 1) % a.size(); size--; return true;', 'deq'],
      ['    }'],
      ['    int Front() { return size ? a[head] : -1; }', 'peek'],
      ['    int Rear() { return size ? a[(head + size - 1) % a.size()] : -1; }', 'peek'],
      ['    bool isEmpty() { return size == 0; }', 'peek'],
      ['    bool isFull() { return size == a.size(); }', 'peek'],
      ['};'],
    ]),
    java: cls([
      ['class MyCircularQueue {'],
      ['    private final int[] a; private int head = 0, size = 0;'],
      ['    public MyCircularQueue(int k) { a = new int[k]; }'],
      ['    public boolean enQueue(int v) {'],
      ['        if (size == a.length) return false;', 'full'],
      ['        a[(head + size++) % a.length] = v; return true;', 'enq'],
      ['    }'],
      ['    public boolean deQueue() {'],
      ['        if (size == 0) return false;', 'emptyop'],
      ['        head = (head + 1) % a.length; size--; return true;', 'deq'],
      ['    }'],
      ['    public int Front() { return size > 0 ? a[head] : -1; }', 'peek'],
      ['    public int Rear() { return size > 0 ? a[(head + size - 1) % a.length] : -1; }', 'peek'],
      ['    public boolean isEmpty() { return size == 0; }', 'peek'],
      ['    public boolean isFull() { return size == a.length; }', 'peek'],
      ['}'],
    ]),
  },
  run(values) {
    const k = parseInt1(values.k, 'k', { min: 1, max: 8 });
    if (typeof k === 'string') return { error: k };
    const ops = parseOps(values.ops, { enQueue: 1, deQueue: 0, Front: 0, Rear: 0, isEmpty: 0, isFull: 0 });
    if ('error' in ops) return ops;
    const a: (number | string)[] = Array(k).fill('·');
    let head = 0;
    let size = 0;
    const res: (string | number)[] = ['null'];
    const out: Step[] = [];
    const view = (): ArrayState => {
      const mark: NonNullable<ArrayState['mark']> = {};
      for (let i = 0; i < k; i++) mark[i] = 'dim';
      for (let j = 0; j < size; j++) mark[(head + j) % k] = 'good';
      const ptrs: ArrayState['ptrs'] = [{ name: 'head', i: head, c: 'a' }];
      if (size) ptrs.push({ name: 'rear', i: (head + size - 1) % k, c: 'b' });
      return arr([...a], { mark, ptrs, aggs: [ag('size', size), ag('outputs', fmt(res), 'c')] });
    };
    for (const [name, args] of ops) {
      if (name === 'enQueue') {
        if (size === k) { res.push('false'); out.push({ tag: 'full', trace: ['enQueue(', F(args[0]), '): all ', String(k), ' slots are used → ', C('false'), '.'], state: view() }); continue; }
        const at = (head + size) % k;
        a[at] = args[0];
        size++;
        res.push('true');
        out.push({ tag: 'enq', trace: ['enQueue(', A(args[0]), '): write it at (head + size) % k = ', B(at), '.'], state: view() });
      } else if (name === 'deQueue') {
        if (!size) { res.push('false'); out.push({ tag: 'emptyop', trace: ['deQueue(): nothing to remove → ', C('false'), '.'], state: view() }); continue; }
        const v = a[head];
        a[head] = '·';
        head = (head + 1) % k;
        size--;
        res.push('true');
        out.push({ tag: 'deq', trace: ['deQueue(): drop ', F(v), ' by moving head forward (wrapping) to ', B(head), '.'], state: view() });
      } else {
        const v = name === 'Front' ? (size ? a[head] : -1) : name === 'Rear' ? (size ? a[(head + size - 1) % k] : -1) : name === 'isEmpty' ? String(size === 0) : String(size === k);
        res.push(v);
        out.push({ tag: 'peek', trace: [name, '() → ', C(v), '.'], state: view() });
      }
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'Storing head and size (instead of head and tail) removes the classic "is it full or empty?" ambiguity when the two indices meet. The % k is what lets freed slots at the front be reused.',
  complexity: { time: 'O(1) per operation', space: 'O(k)' },
};

/* ================= Design Circular Deque ================= */
const circularDeque: ProblemDef = {
  slug: 'design-circular-deque',
  title: 'Design Circular Deque',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-circular-deque/',
  technique: 'Circular array with head and size; inserting at the front moves head back by one, modulo k.',
  widget: 'array',
  widgetTitle: 'Backing array (k slots)',
  inputs: [
    { key: 'k', label: 'k', defaultValue: '3' },
    { key: 'ops', label: 'operations', defaultValue: 'insertLast 1, insertLast 2, insertFront 3, insertFront 4, getRear, isFull, deleteLast, insertFront 4, getFront', wide: true },
  ],
  code: {
    cpp: cls([
      ['class MyCircularDeque {'],
      ['    vector<int> a; int head = 0, size = 0, k;'],
      ['public:'],
      ['    MyCircularDeque(int k) : a(k), k(k) {}'],
      ['    bool insertFront(int v) {'],
      ['        if (size == k) return false;', 'full'],
      ['        head = (head - 1 + k) % k; a[head] = v; size++; return true;', 'front'],
      ['    }'],
      ['    bool insertLast(int v) {'],
      ['        if (size == k) return false;', 'full'],
      ['        a[(head + size) % k] = v; size++; return true;', 'last'],
      ['    }'],
      ['    bool deleteFront() {'],
      ['        if (!size) return false;', 'emptyop'],
      ['        head = (head + 1) % k; size--; return true;', 'delf'],
      ['    }'],
      ['    bool deleteLast() {'],
      ['        if (!size) return false;', 'emptyop'],
      ['        size--; return true;', 'dell'],
      ['    }'],
      ['    int getFront() { return size ? a[head] : -1; }', 'peek'],
      ['    int getRear() { return size ? a[(head + size - 1) % k] : -1; }', 'peek'],
      ['    bool isEmpty() { return size == 0; }', 'peek'],
      ['    bool isFull() { return size == k; }', 'peek'],
      ['};'],
    ]),
    java: cls([
      ['class MyCircularDeque {'],
      ['    private final int[] a; private int head = 0, size = 0;'],
      ['    public MyCircularDeque(int k) { a = new int[k]; }'],
      ['    public boolean insertFront(int v) {'],
      ['        if (size == a.length) return false;', 'full'],
      ['        head = (head - 1 + a.length) % a.length; a[head] = v; size++; return true;', 'front'],
      ['    }'],
      ['    public boolean insertLast(int v) {'],
      ['        if (size == a.length) return false;', 'full'],
      ['        a[(head + size) % a.length] = v; size++; return true;', 'last'],
      ['    }'],
      ['    public boolean deleteFront() {'],
      ['        if (size == 0) return false;', 'emptyop'],
      ['        head = (head + 1) % a.length; size--; return true;', 'delf'],
      ['    }'],
      ['    public boolean deleteLast() {'],
      ['        if (size == 0) return false;', 'emptyop'],
      ['        size--; return true;', 'dell'],
      ['    }'],
      ['    public int getFront() { return size > 0 ? a[head] : -1; }', 'peek'],
      ['    public int getRear() { return size > 0 ? a[(head + size - 1) % a.length] : -1; }', 'peek'],
      ['    public boolean isEmpty() { return size == 0; }', 'peek'],
      ['    public boolean isFull() { return size == a.length; }', 'peek'],
      ['}'],
    ]),
  },
  run(values) {
    const k = parseInt1(values.k, 'k', { min: 1, max: 8 });
    if (typeof k === 'string') return { error: k };
    const ops = parseOps(values.ops, { insertFront: 1, insertLast: 1, deleteFront: 0, deleteLast: 0, getFront: 0, getRear: 0, isEmpty: 0, isFull: 0 });
    if ('error' in ops) return ops;
    const a: (number | string)[] = Array(k).fill('·');
    let head = 0;
    let size = 0;
    const res: (string | number)[] = ['null'];
    const out: Step[] = [];
    const view = (): ArrayState => {
      const mark: NonNullable<ArrayState['mark']> = {};
      for (let i = 0; i < k; i++) mark[i] = 'dim';
      for (let j = 0; j < size; j++) mark[(head + j) % k] = 'good';
      const ptrs: ArrayState['ptrs'] = [{ name: 'front', i: head, c: 'a' }];
      if (size) ptrs.push({ name: 'rear', i: (head + size - 1) % k, c: 'b' });
      return arr([...a], { mark, ptrs, aggs: [ag('size', size), ag('outputs', fmt(res), 'c')] });
    };
    for (const [name, args] of ops) {
      if (name === 'insertFront' || name === 'insertLast') {
        if (size === k) { res.push('false'); out.push({ tag: 'full', trace: [name, '(', F(args[0]), '): full → ', C('false'), '.'], state: view() }); continue; }
        if (name === 'insertFront') { head = (head - 1 + k) % k; a[head] = args[0]; size++; out.push({ tag: 'front', trace: ['insertFront(', A(args[0]), '): step head back (wrapping) to ', B(head), ' and write there.'], state: view() }); }
        else { const at = (head + size) % k; a[at] = args[0]; size++; out.push({ tag: 'last', trace: ['insertLast(', A(args[0]), '): write at (head + size) % k = ', B(at), '.'], state: view() }); }
        res.push('true');
        out[out.length - 1].state = view();
      } else if (name === 'deleteFront' || name === 'deleteLast') {
        if (!size) { res.push('false'); out.push({ tag: 'emptyop', trace: [name, '(): empty → ', C('false'), '.'], state: view() }); continue; }
        if (name === 'deleteFront') { const v = a[head]; a[head] = '·'; head = (head + 1) % k; size--; res.push('true'); out.push({ tag: 'delf', trace: ['deleteFront(): drop ', F(v), '; head moves to ', B(head), '.'], state: view() }); }
        else { const at = (head + size - 1) % k; const v = a[at]; a[at] = '·'; size--; res.push('true'); out.push({ tag: 'dell', trace: ['deleteLast(): drop ', F(v), ' by shrinking size.'], state: view() }); }
      } else {
        const v = name === 'getFront' ? (size ? a[head] : -1) : name === 'getRear' ? (size ? a[(head + size - 1) % k] : -1) : name === 'isEmpty' ? String(size === 0) : String(size === k);
        res.push(v);
        out.push({ tag: 'peek', trace: [name, '() → ', C(v), '.'], state: view() });
      }
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'A deque is a circular queue that can also grow backwards. (head − 1 + k) % k keeps the index non-negative when the front wraps from slot 0 to slot k − 1.',
  complexity: { time: 'O(1) per operation', space: 'O(k)' },
};

/* ================= Find the Winner of the Circular Game ================= */
const circularGame: ProblemDef = {
  slug: 'find-the-winner-of-the-circular-game',
  title: 'Find the Winner of the Circular Game',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-winner-of-the-circular-game/',
  technique: 'Simulate with a queue: rotate k − 1 friends to the back, then remove the k-th, until one is left.',
  widget: 'array',
  widgetTitle: 'Friends in the circle (front of the queue on the left)',
  inputs: [
    { key: 'n', label: 'n', defaultValue: '5' },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('int findTheWinner(int n, int k)', [
      ['queue<int> q;'],
      ['for (int i = 1; i <= n; i++) q.push(i);', 'init'],
      ['while (q.size() > 1) {'],
      ['    for (int i = 0; i < k - 1; i++) { q.push(q.front()); q.pop(); }', 'rotate'],
      ['    q.pop();', 'out'],
      ['}'],
      ['return q.front();', 'ret'],
    ]),
    java: java('int findTheWinner(int n, int k)', [
      ['Deque<Integer> q = new ArrayDeque<>();'],
      ['for (int i = 1; i <= n; i++) q.addLast(i);', 'init'],
      ['while (q.size() > 1) {'],
      ['    for (int i = 0; i < k - 1; i++) q.addLast(q.pollFirst());', 'rotate'],
      ['    q.pollFirst();', 'out'],
      ['}'],
      ['return q.peekFirst();', 'ret'],
    ]),
  },
  run(values) {
    const n = parseInt1(values.n, 'n', { min: 1, max: 12 });
    if (typeof n === 'string') return { error: n };
    const k = parseInt1(values.k, 'k', { min: 1, max: 12 });
    if (typeof k === 'string') return { error: k };
    const q = Array.from({ length: n }, (_, i) => i + 1);
    const out: Step[] = [];
    out.push({ tag: 'init', trace: ['Line up friends ', A(`1..${n}`), '. Counting starts at the front.'], state: qRow([...q]) });
    while (q.length > 1) {
      for (let i = 0; i < k - 1; i++) q.push(q.shift()!);
      if (k > 1) out.push({ tag: 'rotate', trace: ['Count past ', String(k - 1), ' friend(s) by moving them to the back. Friend ', A(q[0]), ' is now k-th.'], state: qRow([...q], { mark: { 0: 'active' } }) });
      const gone = q.shift();
      out.push({ tag: 'out', trace: ['Friend ', F(gone), ' leaves the circle. ', String(q.length), ' left.'], state: qRow([...q]) });
    }
    out.push({ tag: 'ret', trace: ['The winner is friend ', C(q[0]), '.'], state: qRow([...q], { mark: { 0: 'final' } }) });
    return { steps: out, result: String(q[0]) };
  },
  note: 'A queue models the circle naturally: moving someone from front to back is "counting past them". This is the Josephus problem; the O(n) recurrence winner = (winner + k) % size skips the simulation entirely.',
  complexity: { time: 'O(n · k)', space: 'O(n)' },
};

/* ================= Find the Winner of an Array Game ================= */
const arrayGame: ProblemDef = {
  slug: 'find-the-winner-of-an-array-game',
  title: 'Find the Winner of an Array Game',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-winner-of-an-array-game/',
  technique: 'Keep the current champion and its streak while scanning once; if no one hits k, the maximum wins.',
  widget: 'array',
  widgetTitle: 'arr',
  inputs: [
    { key: 'arr', label: 'arr', defaultValue: '2, 1, 3, 5, 4, 6, 7', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('int getWinner(vector<int>& arr, int k)', [
      ['int champ = arr[0], wins = 0;', 'init'],
      ['for (int i = 1; i < arr.size(); i++) {'],
      ['    if (arr[i] > champ) { champ = arr[i]; wins = 1; }', 'lose'],
      ['    else wins++;', 'win'],
      ['    if (wins == k) return champ;', 'done'],
      ['}'],
      ['return champ;', 'max'],
    ]),
    java: java('int getWinner(int[] arr, int k)', [
      ['int champ = arr[0], wins = 0;', 'init'],
      ['for (int i = 1; i < arr.length; i++) {'],
      ['    if (arr[i] > champ) { champ = arr[i]; wins = 1; }', 'lose'],
      ['    else wins++;', 'win'],
      ['    if (wins == k) return champ;', 'done'],
      ['}'],
      ['return champ;', 'max'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.arr, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    if (new Set(a).size !== a.length || a.length < 2) return { error: 'Give at least two distinct integers.' };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    let champ = 0;
    let wins = 0;
    const out: Step[] = [];
    const st = (i: number | null) => arr(a, { mark: { [champ]: 'good', ...(i !== null ? { [i]: 'active' } : {}) }, aggs: [ag('champion', a[champ], 'b'), ag('streak', wins)] });
    out.push({ tag: 'init', trace: [A(a[0]), ' starts as champion with no wins.'], state: st(null) });
    for (let i = 1; i < a.length; i++) {
      if (a[i] > a[champ]) {
        out.push({ tag: 'lose', trace: [F(a[champ]), ' loses to ', B(a[i]), ' — new champion with 1 win.'], state: st(i) });
        champ = i;
        wins = 1;
      } else {
        wins++;
        out.push({ tag: 'win', trace: [B(a[champ]), ' beats ', F(a[i]), ' — streak ', A(wins), '.'], state: st(i) });
      }
      if (wins === k) {
        out.push({ tag: 'done', trace: [C(a[champ]), ' won ', String(k), ' in a row.'], state: st(null) });
        return { steps: out, result: String(a[champ]) };
      }
    }
    out.push({ tag: 'max', trace: ['Nobody reached ', String(k), ' wins in one pass. The maximum, ', C(a[champ]), ', now beats everyone forever.'], state: st(null) });
    return { steps: out, result: String(a[champ]) };
  },
  note: 'Losers go to the back, but they can never beat the current champion again until the champion is replaced. So one left-to-right pass is enough: either someone reaches k, or the maximum takes over and wins eventually.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Find The First Player to win K Games in a Row ================= */
const firstPlayerK: ProblemDef = {
  slug: 'find-the-first-player-to-win-k-games-in-a-row',
  title: 'Find The First Player to win K Games in a Row',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-the-first-player-to-win-k-games-in-a-row/',
  technique: 'Same as the array game but return the index: track champion index and streak; if no one hits k, the strongest wins.',
  widget: 'array',
  widgetTitle: 'skills',
  inputs: [
    { key: 'skills', label: 'skills', defaultValue: '4, 2, 6, 3, 9', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: cpp('int findWinningPlayer(vector<int>& skills, int k)', [
      ['int champ = 0, wins = 0;', 'init'],
      ['for (int i = 1; i < skills.size(); i++) {'],
      ['    if (skills[i] > skills[champ]) { champ = i; wins = 1; }', 'lose'],
      ['    else wins++;', 'win'],
      ['    if (wins == k) return champ;', 'done'],
      ['}'],
      ['return champ;', 'max'],
    ]),
    java: java('int findWinningPlayer(int[] skills, int k)', [
      ['int champ = 0, wins = 0;', 'init'],
      ['for (int i = 1; i < skills.length; i++) {'],
      ['    if (skills[i] > skills[champ]) { champ = i; wins = 1; }', 'lose'],
      ['    else wins++;', 'win'],
      ['    if (wins == k) return champ;', 'done'],
      ['}'],
      ['return champ;', 'max'],
    ]),
  },
  run(values) {
    const a = parseIntArray(values.skills, { maxLen: 14 });
    if (typeof a === 'string') return { error: a };
    if (new Set(a).size !== a.length || a.length < 2) return { error: 'Give at least two distinct skills.' };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    let champ = 0;
    let wins = 0;
    const out: Step[] = [];
    const st = (i: number | null) => arr(a, { mark: { [champ]: 'good', ...(i !== null ? { [i]: 'active' } : {}) }, ptrs: [{ name: 'champ', i: champ, c: 'b' }], aggs: [ag('streak', wins)] });
    out.push({ tag: 'init', trace: ['Player ', A(0), ' (skill ', A(a[0]), ') starts at the front.'], state: st(null) });
    for (let i = 1; i < a.length; i++) {
      if (a[i] > a[champ]) {
        out.push({ tag: 'lose', trace: ['Player ', String(i), ' (', B(a[i]), ') beats player ', String(champ), ' (', F(a[champ]), ') — new champion, streak 1.'], state: st(i) });
        champ = i;
        wins = 1;
      } else {
        wins++;
        out.push({ tag: 'win', trace: ['Player ', String(champ), ' beats player ', String(i), ' — streak ', A(wins), '.'], state: st(i) });
      }
      if (wins === k) {
        out.push({ tag: 'done', trace: ['Player ', C(champ), ' won ', String(k), ' in a row.'], state: st(null) });
        return { steps: out, result: String(champ) };
      }
    }
    out.push({ tag: 'max', trace: ['No one reached ', String(k), ' — the strongest player ', C(champ), ' will win every game from now on.'], state: st(null) });
    return { steps: out, result: String(champ) };
  },
  note: 'Simulating the queue could take k rounds, and k can be huge. But once the strongest player is at the front they never lose, so a single pass decides it.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Dota2 Senate ================= */
const dota2: ProblemDef = {
  slug: 'dota2-senate',
  title: 'Dota2 Senate',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/dota2-senate/',
  technique: 'Two queues of senator indices; the earlier one bans the other and re-enters at index + n for the next round.',
  widget: 'stack',
  widgetTitle: 'Radiant and Dire queues (front at the bottom)',
  inputs: [{ key: 'senate', label: 'senate', defaultValue: 'RDDRD' }],
  code: {
    cpp: cpp('string predictPartyVictory(string senate)', [
      ['int n = senate.size();'],
      ['queue<int> r, d;'],
      ['for (int i = 0; i < n; i++) (senate[i] == \'R\' ? r : d).push(i);', 'init'],
      ['while (!r.empty() && !d.empty()) {'],
      ['    int a = r.front(), b = d.front(); r.pop(); d.pop();', 'rwin', 'dwin'],
      ['    if (a < b) r.push(a + n);', 'rwin'],
      ['    else d.push(b + n);', 'dwin'],
      ['}'],
      ['return r.empty() ? "Dire" : "Radiant";', 'ret'],
    ]),
    java: java('String predictPartyVictory(String senate)', [
      ['int n = senate.length();'],
      ['Deque<Integer> r = new ArrayDeque<>(), d = new ArrayDeque<>();'],
      ['for (int i = 0; i < n; i++) (senate.charAt(i) == \'R\' ? r : d).addLast(i);', 'init'],
      ['while (!r.isEmpty() && !d.isEmpty()) {'],
      ['    int a = r.pollFirst(), b = d.pollFirst();', 'rwin', 'dwin'],
      ['    if (a < b) r.addLast(a + n);', 'rwin'],
      ['    else d.addLast(b + n);', 'dwin'],
      ['}'],
      ['return r.isEmpty() ? "Dire" : "Radiant";', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.senate, 'senate', { max: 14, re: /^[RD]+$/, reMsg: 'Use only R and D.' });
    if (typeof s !== 'string') return s;
    const n = s.length;
    const r: number[] = [];
    const d: number[] = [];
    [...s].forEach((c, i) => (c === 'R' ? r : d).push(i));
    const out: Step[] = [];
    const view = (): StackState => ({ array: arr(s.split('')), stack: r.map((v) => ({ v: `R@${v}` })), stackLabel: 'Radiant', stack2: d.map((v) => ({ v: `D@${v}` })), stack2Label: 'Dire' });
    out.push({ tag: 'init', trace: ['Queue each party\'s senators by their turn order.'], state: view() });
    while (r.length && d.length && out.length < MAX_STEPS) {
      const a = r.shift()!;
      const b = d.shift()!;
      if (a < b) {
        r.push(a + n);
        out.push({ tag: 'rwin', trace: ['Radiant ', A(`@${a}`), ' acts before Dire ', F(`@${b}`), ' and bans them. The Radiant senator votes again next round as ', B(`@${a + n}`), '.'], state: view() });
      } else {
        d.push(b + n);
        out.push({ tag: 'dwin', trace: ['Dire ', A(`@${b}`), ' acts before Radiant ', F(`@${a}`), ' and bans them. The Dire senator votes again next round as ', B(`@${b + n}`), '.'], state: view() });
      }
    }
    const win = r.length ? 'Radiant' : 'Dire';
    out.push({ tag: 'ret', trace: ['Only one party is left: ', C(win), '.'], state: view() });
    return { steps: out, result: `"${win}"` };
  },
  note: 'The best move is always to ban the next opposing senator in line — they are the most immediate threat. Re-queuing the survivor at index + n puts them correctly in the next round\'s order.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Faulty Keyboard ================= */
const faultyKeyboard: ProblemDef = {
  slug: 'faulty-keyboard',
  title: 'Faulty Keyboard',
  category: 'Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/faulty-keyboard/',
  technique: 'Use a deque and a "reversed" flag: an i flips the flag, other chars go on whichever end is currently the back.',
  widget: 'array',
  widgetTitle: 'Deque (as stored)',
  inputs: [{ key: 's', label: 's', defaultValue: 'poiinter' }],
  code: {
    cpp: cpp('string finalString(string s)', [
      ['deque<char> dq; bool rev = false;'],
      ['for (char c : s) {'],
      ['    if (c == \'i\') rev = !rev;', 'flip'],
      ['    else if (rev) dq.push_front(c);', 'front'],
      ['    else dq.push_back(c);', 'back'],
      ['}'],
      ['string res(dq.begin(), dq.end());', 'ret'],
      ['if (rev) reverse(res.begin(), res.end());', 'ret'],
      ['return res;', 'ret'],
    ]),
    java: java('String finalString(String s)', [
      ['Deque<Character> dq = new ArrayDeque<>(); boolean rev = false;'],
      ['for (char c : s.toCharArray()) {'],
      ['    if (c == \'i\') rev = !rev;', 'flip'],
      ['    else if (rev) dq.addFirst(c);', 'front'],
      ['    else dq.addLast(c);', 'back'],
      ['}'],
      ['StringBuilder sb = new StringBuilder();', 'ret'],
      ['for (char c : dq) sb.append(c);', 'ret'],
      ['return rev ? sb.reverse().toString() : sb.toString();', 'ret'],
    ]),
  },
  run(values) {
    const s = parseWord(values.s, 's', { max: 18, re: /^[a-z]+$/, reMsg: 'Use lowercase letters only.' });
    if (typeof s !== 'string') return s;
    const dq: string[] = [];
    let rev = false;
    const out: Step[] = [];
    const view = (hl?: number) => qRow([...dq], { mark: hl !== undefined ? { [hl]: 'active' } : {}, aggs: [ag('reversed?', rev ? 'yes' : 'no'), ag('screen shows', (rev ? [...dq].reverse() : dq).join('') || '—', 'c')] });
    for (const c of s) {
      if (c === 'i') {
        rev = !rev;
        out.push({ tag: 'flip', trace: ['Typed ', A('i'), ': the screen reverses. Instead of moving chars, just flip the flag.'], state: view() });
      } else if (rev) {
        dq.unshift(c);
        out.push({ tag: 'front', trace: ['Typed ', A(c), '. The text is reversed, so its visual end is the deque\'s front — push there.'], state: view(0) });
      } else {
        dq.push(c);
        out.push({ tag: 'back', trace: ['Typed ', A(c), ' — append it to the back.'], state: view(dq.length - 1) });
      }
    }
    const res = (rev ? [...dq].reverse() : dq).join('');
    out.push({ tag: 'ret', trace: ['Read the deque', rev ? ' backwards (flag is on)' : '', ': ', C(`"${res}"`), '.'], state: view() });
    return { steps: out, result: `"${res}"` };
  },
  note: 'Reversing the whole string on every i is O(n²). A deque plus a flag makes each keystroke O(1): reversing is just "from now on, the end you type at is the other end".',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Design Front Middle Back Queue ================= */
const fmbQueue: ProblemDef = {
  slug: 'design-front-middle-back-queue',
  title: 'Design Front Middle Back Queue',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-front-middle-back-queue/',
  technique: 'Two deques for the left and right halves, rebalanced after every operation so the middle sits at their seam.',
  widget: 'array',
  widgetTitle: 'Queue: left half | right half',
  inputs: [{ key: 'ops', label: 'operations', defaultValue: 'pushFront 1, pushBack 2, pushMiddle 3, pushMiddle 4, popFront, popMiddle, popMiddle, popBack, popFront', wide: true }],
  code: {
    cpp: cls([
      ['class FrontMiddleBackQueue {'],
      ['    deque<int> L, R;  // invariant: R.size() == L.size() or L.size() + 1'],
      ['    void fix() {', 'fix'],
      ['        if (L.size() > R.size()) { R.push_front(L.back()); L.pop_back(); }', 'fix'],
      ['        if (R.size() > L.size() + 1) { L.push_back(R.front()); R.pop_front(); }', 'fix'],
      ['    }', 'fix'],
      ['public:'],
      ['    void pushFront(int v) { L.push_front(v); fix(); }', 'push'],
      ['    void pushMiddle(int v) { L.push_back(v); fix(); }', 'push'],
      ['    void pushBack(int v) { R.push_back(v); fix(); }', 'push'],
      ['    int popFront() {'],
      ['        if (R.empty()) return -1;', 'empty'],
      ['        int v; if (L.empty()) { v = R.front(); R.pop_front(); } else { v = L.front(); L.pop_front(); }', 'pop'],
      ['        fix(); return v;', 'pop'],
      ['    }'],
      ['    int popMiddle() {'],
      ['        if (R.empty()) return -1;', 'empty'],
      ['        int v; if (L.size() == R.size()) { v = L.back(); L.pop_back(); } else { v = R.front(); R.pop_front(); }', 'pop'],
      ['        fix(); return v;', 'pop'],
      ['    }'],
      ['    int popBack() {'],
      ['        if (R.empty()) return -1;', 'empty'],
      ['        int v = R.back(); R.pop_back(); fix(); return v;', 'pop'],
      ['    }'],
      ['};'],
    ]),
    java: cls([
      ['class FrontMiddleBackQueue {'],
      ['    private final Deque<Integer> L = new ArrayDeque<>(), R = new ArrayDeque<>();'],
      ['    private void fix() {', 'fix'],
      ['        if (L.size() > R.size()) R.addFirst(L.pollLast());', 'fix'],
      ['        if (R.size() > L.size() + 1) L.addLast(R.pollFirst());', 'fix'],
      ['    }', 'fix'],
      ['    public void pushFront(int v) { L.addFirst(v); fix(); }', 'push'],
      ['    public void pushMiddle(int v) { L.addLast(v); fix(); }', 'push'],
      ['    public void pushBack(int v) { R.addLast(v); fix(); }', 'push'],
      ['    public int popFront() {'],
      ['        if (R.isEmpty()) return -1;', 'empty'],
      ['        int v = L.isEmpty() ? R.pollFirst() : L.pollFirst();', 'pop'],
      ['        fix(); return v;', 'pop'],
      ['    }'],
      ['    public int popMiddle() {'],
      ['        if (R.isEmpty()) return -1;', 'empty'],
      ['        int v = L.size() == R.size() ? L.pollLast() : R.pollFirst();', 'pop'],
      ['        fix(); return v;', 'pop'],
      ['    }'],
      ['    public int popBack() {'],
      ['        if (R.isEmpty()) return -1;', 'empty'],
      ['        int v = R.pollLast(); fix(); return v;', 'pop'],
      ['    }'],
      ['}'],
    ]),
  },
  run(values) {
    const ops = parseOps(values.ops, { pushFront: 1, pushMiddle: 1, pushBack: 1, popFront: 0, popMiddle: 0, popBack: 0 });
    if ('error' in ops) return ops;
    const Lq: number[] = [];
    const Rq: number[] = [];
    const fix = () => {
      if (Lq.length > Rq.length) Rq.unshift(Lq.pop()!);
      if (Rq.length > Lq.length + 1) Lq.push(Rq.shift()!);
    };
    const res: (number | string)[] = ['null'];
    const out: Step[] = [];
    const view = (): ArrayState => {
      const all = [...Lq, ...Rq];
      const mark: NonNullable<ArrayState['mark']> = {};
      Lq.forEach((_, i) => (mark[i] = 'win'));
      Rq.forEach((_, i) => (mark[Lq.length + i] = 'good'));
      return qRow(all, { mark: all.length ? mark : {}, aggs: [ag('left', fmt(Lq)), ag('right', fmt(Rq), 'b'), ag('outputs', fmt(res), 'c')] });
    };
    for (const [name, args] of ops) {
      if (name.startsWith('push')) {
        if (name === 'pushFront') Lq.unshift(args[0]);
        else if (name === 'pushMiddle') Lq.push(args[0]);
        else Rq.push(args[0]);
        fix();
        res.push('null');
        out.push({ tag: 'push', trace: [name, '(', A(args[0]), ')', name === 'pushMiddle' ? ': add to the end of the left half' : '', ', then rebalance so the right half has the same size or one more.'], state: view() });
      } else {
        if (!Rq.length) { res.push(-1); out.push({ tag: 'empty', trace: [name, '(): queue is empty → ', C(-1), '.'], state: view() }); continue; }
        let v: number;
        if (name === 'popFront') v = Lq.length ? Lq.shift()! : Rq.shift()!;
        else if (name === 'popMiddle') v = Lq.length === Rq.length ? Lq.pop()! : Rq.shift()!;
        else v = Rq.pop()!;
        fix();
        res.push(v);
        out.push({ tag: 'pop', trace: [name, '() removes ', C(v), name === 'popMiddle' ? ' (the frontmost middle sits at the seam of the halves)' : '', '.'], state: view() });
      }
    }
    return { steps: out, result: fmt(res) };
  },
  note: 'Keeping the halves balanced (right = left or left + 1) pins the middle to the seam between them, so every operation touches only deque ends — O(1) each, versus O(n) for inserting into the middle of one list.',
  complexity: { time: 'O(1) per operation', space: 'O(n)' },
};

/* ================= Reveal Cards In Increasing Order ================= */
const revealCards: ProblemDef = {
  slug: 'reveal-cards-in-increasing-order',
  title: 'Reveal Cards In Increasing Order',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reveal-cards-in-increasing-order/',
  technique: 'Simulate the reveal on a queue of positions; drop the sorted cards into positions in the order they get revealed.',
  widget: 'array',
  widgetTitle: 'Result deck (positions filled in reveal order)',
  inputs: [{ key: 'deck', label: 'deck', defaultValue: '17, 13, 11, 2, 3, 5, 7', wide: true }],
  code: {
    cpp: cpp('vector<int> deckRevealedIncreasing(vector<int>& deck)', [
      ['sort(deck.begin(), deck.end());', 'sort'],
      ['int n = deck.size();'],
      ['queue<int> pos;'],
      ['for (int i = 0; i < n; i++) pos.push(i);', 'sort'],
      ['vector<int> res(n);'],
      ['for (int card : deck) {'],
      ['    res[pos.front()] = card; pos.pop();', 'place'],
      ['    if (!pos.empty()) { pos.push(pos.front()); pos.pop(); }', 'place'],
      ['}'],
      ['return res;', 'ret'],
    ]),
    java: java('int[] deckRevealedIncreasing(int[] deck)', [
      ['Arrays.sort(deck);', 'sort'],
      ['int n = deck.length;'],
      ['Deque<Integer> pos = new ArrayDeque<>();'],
      ['for (int i = 0; i < n; i++) pos.addLast(i);', 'sort'],
      ['int[] res = new int[n];'],
      ['for (int card : deck) {'],
      ['    res[pos.pollFirst()] = card;', 'place'],
      ['    if (!pos.isEmpty()) pos.addLast(pos.pollFirst());', 'place'],
      ['}'],
      ['return res;', 'ret'],
    ]),
  },
  run(values) {
    const d = parseIntArray(values.deck, { maxLen: 12 });
    if (typeof d === 'string') return { error: d };
    const sorted = [...d].sort((a, b) => a - b);
    const n = sorted.length;
    const pos = Array.from({ length: n }, (_, i) => i);
    const res: (number | string)[] = Array(n).fill('·');
    const out: Step[] = [];
    out.push({ tag: 'sort', trace: ['Sort the cards: ', A(fmt(sorted)), '. The queue holds deck positions in the order they will be revealed.'], state: arr([...res], { aggs: [ag('position queue', fmt(pos))] }) });
    const filled: NonNullable<ArrayState['mark']> = {};
    for (const card of sorted) {
      const p = pos.shift()!;
      res[p] = card;
      filled[p] = 'good';
      if (pos.length) pos.push(pos.shift()!);
      out.push({ tag: 'place', trace: ['The next reveal shows position ', A(p), ', so put the next smallest card ', B(card), ' there. Then the next position moves to the bottom.'], state: arr([...res], { mark: { ...filled, [p]: 'active' }, aggs: [ag('position queue', fmt(pos))] }) });
    }
    out.push({ tag: 'ret', trace: ['Deck order: ', C(fmt(res)), '.'], state: arr(res, { mark: range(0, n - 1, 'final') }) });
    return { steps: out, result: fmt(res) };
  },
  note: 'Instead of working backwards from the cards, simulate the reveal process on positions only. That tells you which position is shown 1st, 2nd, 3rd…, and the sorted cards simply fill those positions in that order.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

/* ================= Implement Router ================= */
const router: ProblemDef = {
  slug: 'implement-router',
  title: 'Implement Router',
  category: 'Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/implement-router/',
  technique: 'FIFO queue of packets + a set for duplicates + per-destination sorted timestamps for range counts (binary search).',
  widget: 'array',
  widgetTitle: 'Packet queue (oldest on the left)',
  inputs: [
    { key: 'memoryLimit', label: 'memoryLimit', defaultValue: '3' },
    { key: 'ops', label: 'operations', defaultValue: 'addPacket 1 4 90, addPacket 2 5 90, addPacket 1 4 90, addPacket 3 5 95, addPacket 4 5 105, forwardPacket, addPacket 5 2 110, getCount 5 100 110', wide: true },
  ],
  code: {
    cpp: cls([
      ['class Router {'],
      ['    int cap;'],
      ['    deque<array<int, 3>> q;'],
      ['    set<array<int, 3>> seen;'],
      ['    unordered_map<int, vector<int>> times;  // per destination, in arrival order'],
      ['    unordered_map<int, int> start;          // how many of times[d] are gone'],
      ['    array<int, 3> popOldest() {'],
      ['        auto p = q.front(); q.pop_front(); seen.erase(p); start[p[1]]++;', 'evict', 'fwd'],
      ['        return p;'],
      ['    }'],
      ['public:'],
      ['    Router(int memoryLimit) : cap(memoryLimit) {}'],
      ['    bool addPacket(int s, int d, int t) {'],
      ['        if (seen.count({s, d, t})) return false;', 'dup'],
      ['        if (q.size() == cap) popOldest();', 'evict'],
      ['        q.push_back({s, d, t}); seen.insert({s, d, t}); times[d].push_back(t);', 'add'],
      ['        return true;', 'add'],
      ['    }'],
      ['    vector<int> forwardPacket() {'],
      ['        if (q.empty()) return {};', 'none'],
      ['        auto p = popOldest(); return {p[0], p[1], p[2]};', 'fwd'],
      ['    }'],
      ['    int getCount(int d, int lo, int hi) {'],
      ['        auto& v = times[d]; auto b = v.begin() + start[d];', 'count'],
      ['        return upper_bound(b, v.end(), hi) - lower_bound(b, v.end(), lo);', 'count'],
      ['    }'],
      ['};'],
    ]),
    java: cls([
      ['class Router {'],
      ['    private final int cap;'],
      ['    private final Deque<int[]> q = new ArrayDeque<>();'],
      ['    private final Set<String> seen = new HashSet<>();'],
      ['    private final Map<Integer, List<Integer>> times = new HashMap<>();'],
      ['    private final Map<Integer, Integer> start = new HashMap<>();'],
      ['    public Router(int memoryLimit) { cap = memoryLimit; }'],
      ['    private int[] popOldest() {'],
      ['        int[] p = q.pollFirst(); seen.remove(p[0] + "," + p[1] + "," + p[2]);', 'evict', 'fwd'],
      ['        start.merge(p[1], 1, Integer::sum); return p;', 'evict', 'fwd'],
      ['    }'],
      ['    public boolean addPacket(int s, int d, int t) {'],
      ['        if (!seen.add(s + "," + d + "," + t)) return false;', 'dup'],
      ['        if (q.size() == cap) popOldest();', 'evict'],
      ['        q.addLast(new int[]{s, d, t});', 'add'],
      ['        times.computeIfAbsent(d, x -> new ArrayList<>()).add(t);', 'add'],
      ['        return true;', 'add'],
      ['    }'],
      ['    public int[] forwardPacket() { return q.isEmpty() ? new int[0] : popOldest(); }', 'none', 'fwd'],
      ['    public int getCount(int d, int lo, int hi) {'],
      ['        List<Integer> v = times.getOrDefault(d, List.of()); int s = start.getOrDefault(d, 0);', 'count'],
      ['        return bound(v, s, hi + 1) - bound(v, s, lo);  // bound = first index with value >= x', 'count'],
      ['    }'],
      ['    private int bound(List<Integer> v, int lo, int x) {'],
      ['        int hi = v.size();'],
      ['        while (lo < hi) { int m = (lo + hi) / 2; if (v.get(m) < x) lo = m + 1; else hi = m; }'],
      ['        return lo;'],
      ['    }'],
      ['}'],
    ]),
  },
  run(values) {
    const cap = parseInt1(values.memoryLimit, 'memoryLimit', { min: 1, max: 8 });
    if (typeof cap === 'string') return { error: cap };
    const ops = parseOps(values.ops, { addPacket: 3, forwardPacket: 0, getCount: 3 });
    if ('error' in ops) return ops;
    const q: number[][] = [];
    const key = (p: number[]) => p.join(',');
    const seen = new Set<string>();
    const res: string[] = ['null'];
    const out: Step[] = [];
    let lastT = -Infinity;
    const view = (mark: ArrayState['mark'] = {}): ArrayState => qRow(q.map((p) => `${p[0]}→${p[1]}@${p[2]}`), { mark: q.length ? mark : {}, aggs: [ag('outputs', `[${res.join(',')}]`, 'c')] });
    for (const [name, args] of ops) {
      if (name === 'addPacket') {
        const [s, d, t] = args;
        if (t < lastT) return { error: 'addPacket timestamps must be non-decreasing.' };
        lastT = t;
        if (seen.has(key(args))) {
          res.push('false');
          out.push({ tag: 'dup', trace: ['addPacket(', F(`${s},${d},${t}`), '): an identical packet is already stored → ', C('false'), '.'], state: view() });
          continue;
        }
        if (q.length === cap) {
          const old = q.shift()!;
          seen.delete(key(old));
          out.push({ tag: 'evict', trace: ['Memory is full (', String(cap), '). Evict the oldest packet ', F(`${old[0]}→${old[1]}@${old[2]}`), '.'], state: view() });
        }
        q.push(args);
        seen.add(key(args));
        res.push('true');
        out.push({ tag: 'add', trace: ['addPacket(', A(`${s},${d},${t}`), '): stored at the back → ', C('true'), '.'], state: view({ [q.length - 1]: 'active' }) });
      } else if (name === 'forwardPacket') {
        if (!q.length) { res.push('[]'); out.push({ tag: 'none', trace: ['forwardPacket(): nothing stored → ', C('[]'), '.'], state: view() }); continue; }
        const p = q.shift()!;
        seen.delete(key(p));
        res.push(fmt(p));
        out.push({ tag: 'fwd', trace: ['forwardPacket(): send the oldest packet ', C(fmt(p)), ' and forget it.'], state: view() });
      } else {
        const [d, lo, hi] = args;
        const mark: NonNullable<ArrayState['mark']> = {};
        let cnt = 0;
        q.forEach((p, i) => { if (p[1] === d && p[2] >= lo && p[2] <= hi) { cnt++; mark[i] = 'good'; } else mark[i] = 'dim'; });
        res.push(String(cnt));
        out.push({ tag: 'count', trace: ['getCount(', String(d), ', ', String(lo), ', ', String(hi), '): stored packets to ', A(d), ' with time in [', String(lo), ', ', String(hi), '] → ', C(cnt), '. (Timestamps per destination are sorted, so two binary searches find this.)'], state: view(mark) });
      }
    }
    return { steps: out, result: `[${res.join(',')}]` };
  },
  note: 'Three questions, three structures: "oldest packet?" is a queue, "duplicate?" is a hash set, and "how many to d in a time range?" is a sorted list per destination. Packets leave in arrival order, so removing one only advances a start pointer on its destination\'s list.',
  complexity: { time: 'O(log n) per add/forward/count', space: 'O(memoryLimit + total adds)' },
};

export const ccQueues: ProblemDef[] = [
  recentCounter,
  countStudents,
  timeTickets,
  circularQueue,
  circularGame,
  arrayGame,
  firstPlayerK,
  dota2,
  router,
  faultyKeyboard,
  circularDeque,
  fmbQueue,
  revealCards,
];
