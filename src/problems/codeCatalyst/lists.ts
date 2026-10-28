// Code Catalyst — Practice Set 7: linked lists.
import type { ListChainItem, ListState, ProblemDef, Step } from '../../lib/types';
import { parseInt1, parseIntArray } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';
import { ag, fmt } from './util';

const NODE = {
  cpp: [L('/* struct ListNode { int val; ListNode *next; }; */')],
  java: [L('/* class ListNode { int val; ListNode next; } */')],
};
const cpp = (sig: string, body: [string, ...string[]][]) => [
  ...NODE.cpp,
  L('class Solution {'),
  L('public:'),
  L(`    ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('};'),
];
const java = (sig: string, body: [string, ...string[]][]) => [
  ...NODE.java,
  L('class Solution {'),
  L(`    public ${sig} {`),
  ...body.map(([t, ...tags]) => L(`        ${t}`, ...tags)),
  L('    }'),
  L('}'),
];

const chain = (vals: (number | string)[], marks: Record<number, ListChainItem['mark']> = {}, label?: string) => ({
  label,
  items: vals.map((v, i) => ({ v, mark: marks[i] })),
});
const parseList = (s: string, label: string, max = 12) => {
  const a = parseIntArray(s, { maxLen: max });
  return typeof a === 'string' ? { error: `${label}: ${a}` } : a;
};

/* ================= Delete the Middle Node of a Linked List ================= */
const deleteMiddle: ProblemDef = {
  slug: 'delete-the-middle-node-of-a-linked-list',
  title: 'Delete the Middle Node of a Linked List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/',
  technique: 'Slow/fast pointers, with fast starting two ahead, so slow stops just before the middle and can unlink it.',
  widget: 'list',
  widgetTitle: 'head',
  inputs: [{ key: 'head', label: 'head', defaultValue: '1, 3, 4, 7, 1, 2, 6', wide: true }],
  code: {
    cpp: cpp('ListNode* deleteMiddle(ListNode* head)', [
      ['if (!head->next) return nullptr;', 'one'],
      ['ListNode *slow = head, *fast = head->next->next;', 'init'],
      ['while (fast && fast->next) {'],
      ['    slow = slow->next;', 'move'],
      ['    fast = fast->next->next;', 'move'],
      ['}'],
      ['slow->next = slow->next->next;', 'cut'],
      ['return head;', 'ret'],
    ]),
    java: java('ListNode deleteMiddle(ListNode head)', [
      ['if (head.next == null) return null;', 'one'],
      ['ListNode slow = head, fast = head.next.next;', 'init'],
      ['while (fast != null && fast.next != null) {'],
      ['    slow = slow.next;', 'move'],
      ['    fast = fast.next.next;', 'move'],
      ['}'],
      ['slow.next = slow.next.next;', 'cut'],
      ['return head;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseList(values.head, 'head', 14);
    if ('error' in a) return a;
    const n = a.length;
    const out: Step[] = [];
    if (n === 1) {
      out.push({ tag: 'one', trace: ['Only one node — it is the middle. Return an empty list ', C('[]'), '.'], state: { chains: [chain(a, { 0: 'dim' })] } as ListState });
      return { steps: out, result: '[]' };
    }
    let slow = 0;
    let fast = 2;
    const st = (): ListState => ({ chains: [chain(a)], ptrs: [{ name: 'slow', chain: 0, i: slow, c: 'a' }, ...(fast < n ? [{ name: 'fast', chain: 0, i: fast, c: 'b' as const }] : [])] });
    out.push({ tag: 'init', trace: ['slow at the head; fast starts two nodes ahead so slow ends one node ', A('before'), ' the middle.'], state: st() });
    while (fast < n && fast + 1 < n) {
      slow++;
      fast += 2;
      out.push({ tag: 'move', trace: ['slow steps 1 → ', A(a[slow]), ', fast steps 2', fast < n ? [' → ', String(a[fast])].join('') : ' → past the end', '.'], state: st() });
    }
    const mid = slow + 1;
    out.push({ tag: 'cut', trace: ['fast ran out. The middle is the node after slow: ', F(a[mid]), '. Point slow past it.'], state: { chains: [chain(a, { [mid]: 'dim', [slow]: 'active' })], ptrs: [{ name: 'slow', chain: 0, i: slow, c: 'a' }] } as ListState });
    const res = a.filter((_, i) => i !== mid);
    out.push({ tag: 'ret', trace: ['Result: ', C(fmt(res)), '.'], state: { chains: [chain(res, {}, 'head')] } as ListState });
    return { steps: out, result: fmt(res) };
  },
  note: 'Fast moves twice as quickly, so when it reaches the end slow is halfway. Giving fast a two-node head start shifts slow back by one — exactly the predecessor you need to unlink the middle in a single pass.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Odd Even Linked List ================= */
const oddEven: ProblemDef = {
  slug: 'odd-even-linked-list',
  title: 'Odd Even Linked List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/odd-even-linked-list/',
  technique: 'Weave two chains — odd positions and even positions — then attach the even chain after the odd one.',
  widget: 'list',
  widgetTitle: 'odd chain / even chain',
  inputs: [{ key: 'head', label: 'head', defaultValue: '2, 1, 3, 5, 6, 4, 7', wide: true }],
  code: {
    cpp: cpp('ListNode* oddEvenList(ListNode* head)', [
      ['if (!head) return head;'],
      ['ListNode *odd = head, *even = head->next, *evenHead = even;', 'init'],
      ['while (even && even->next) {'],
      ['    odd->next = even->next; odd = odd->next;', 'step'],
      ['    even->next = odd->next; even = even->next;', 'step'],
      ['}'],
      ['odd->next = evenHead;', 'join'],
      ['return head;', 'join'],
    ]),
    java: java('ListNode oddEvenList(ListNode head)', [
      ['if (head == null) return head;'],
      ['ListNode odd = head, even = head.next, evenHead = even;', 'init'],
      ['while (even != null && even.next != null) {'],
      ['    odd.next = even.next; odd = odd.next;', 'step'],
      ['    even.next = odd.next; even = even.next;', 'step'],
      ['}'],
      ['odd.next = evenHead;', 'join'],
      ['return head;', 'join'],
    ]),
  },
  run(values) {
    const a = parseList(values.head, 'head', 14);
    if ('error' in a) return a;
    const out: Step[] = [];
    const odd: number[] = [a[0]];
    const even: number[] = a.length > 1 ? [a[1]] : [];
    const rest = () => a.slice(odd.length + even.length);
    const st = (): ListState => ({
      chains: [chain(odd, { [odd.length - 1]: 'active' }, 'odd'), chain(even, { [even.length - 1]: 'good' }, 'even'), ...(rest().length ? [chain(rest(), {}, 'left')] : [])],
    });
    out.push({ tag: 'init', trace: ['Position 1 starts the odd chain, position 2 starts the even chain.'], state: st() });
    let i = 2;
    while (i < a.length) {
      odd.push(a[i]);
      if (i + 1 < a.length) even.push(a[i + 1]);
      out.push({ tag: 'step', trace: ['Hook ', A(a[i]), ' onto the odd chain', i + 1 < a.length ? [' and ', String(a[i + 1]), ' onto the even chain'].join('') : '', '.'], state: st() });
      i += 2;
    }
    const res = [...odd, ...even];
    out.push({ tag: 'join', trace: ['Attach the even chain to the end of the odd chain: ', C(fmt(res)), '.'], state: { chains: [chain(res, Object.fromEntries(res.map((_, j) => [j, j < odd.length ? 'active' : 'good'])), 'head')] } as ListState });
    return { steps: out, result: fmt(res) };
  },
  note: 'Each odd node\'s next becomes the node two ahead, and the same for even nodes — that just rewires existing pointers, so no extra nodes or arrays are needed. Saving evenHead is what lets you stitch the halves together at the end.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Merge In Between Linked Lists ================= */
const mergeInBetween: ProblemDef = {
  slug: 'merge-in-between-linked-lists',
  title: 'Merge In Between Linked Lists',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/merge-in-between-linked-lists/',
  technique: 'Find the node before index a and the node after index b, then splice list2 between them.',
  widget: 'list',
  widgetTitle: 'list1 / list2',
  inputs: [
    { key: 'list1', label: 'list1', defaultValue: '10, 1, 13, 6, 9, 5', wide: true },
    { key: 'a', label: 'a', defaultValue: '3' },
    { key: 'b', label: 'b', defaultValue: '4' },
    { key: 'list2', label: 'list2', defaultValue: '100, 101, 102', wide: true },
  ],
  code: {
    cpp: cpp('ListNode* mergeInBetween(ListNode* list1, int a, int b, ListNode* list2)', [
      ['ListNode* before = list1;'],
      ['for (int i = 0; i < a - 1; i++) before = before->next;', 'find'],
      ['ListNode* after = before;'],
      ['for (int i = a - 1; i <= b; i++) after = after->next;', 'find'],
      ['before->next = list2;', 'splice'],
      ['while (list2->next) list2 = list2->next;', 'splice'],
      ['list2->next = after;', 'splice'],
      ['return list1;', 'ret'],
    ]),
    java: java('ListNode mergeInBetween(ListNode list1, int a, int b, ListNode list2)', [
      ['ListNode before = list1;'],
      ['for (int i = 0; i < a - 1; i++) before = before.next;', 'find'],
      ['ListNode after = before;'],
      ['for (int i = a - 1; i <= b; i++) after = after.next;', 'find'],
      ['before.next = list2;', 'splice'],
      ['while (list2.next != null) list2 = list2.next;', 'splice'],
      ['list2.next = after;', 'splice'],
      ['return list1;', 'ret'],
    ]),
  },
  run(values) {
    const l1 = parseList(values.list1, 'list1');
    if ('error' in l1) return l1;
    const l2 = parseList(values.list2, 'list2', 6);
    if ('error' in l2) return l2;
    const a = parseInt1(values.a, 'a', { min: 1, max: l1.length - 2 });
    if (typeof a === 'string') return { error: a };
    const b = parseInt1(values.b, 'b', { min: a, max: l1.length - 2 });
    if (typeof b === 'string') return { error: b };
    const out: Step[] = [];
    const m1: Record<number, ListChainItem['mark']> = { [a - 1]: 'active', [b + 1]: 'good' };
    for (let i = a; i <= b; i++) m1[i] = 'dim';
    out.push({
      tag: 'find',
      trace: ['Walk to the node before index ', String(a), ' (', A(l1[a - 1]), ') and the node after index ', String(b), ' (', B(l1[b + 1]), '). Nodes ', F(`${a}..${b}`), ' get removed.'],
      state: { chains: [chain(l1, m1, 'list1'), chain(l2, {}, 'list2')], ptrs: [{ name: 'before', chain: 0, i: a - 1, c: 'a' }, { name: 'after', chain: 0, i: b + 1, c: 'b' }] } as ListState,
    });
    const res = [...l1.slice(0, a), ...l2, ...l1.slice(b + 1)];
    const mk: Record<number, ListChainItem['mark']> = {};
    for (let i = a; i < a + l2.length; i++) mk[i] = 'good';
    out.push({ tag: 'splice', trace: ['Point before → list2\'s head, walk to list2\'s tail, and point it → after.'], state: { chains: [chain(res, mk, 'list1')] } as ListState });
    out.push({ tag: 'ret', trace: ['Merged: ', C(fmt(res)), '.'], state: { chains: [chain(res, {}, 'list1')] } as ListState });
    return { steps: out, result: fmt(res) };
  },
  note: 'Only two pointers change: before.next and list2\'s tail.next. Finding the two anchor nodes first means the removed nodes are simply skipped, not deleted one by one.',
  complexity: { time: 'O(n + m)', space: 'O(1)' },
};

/* ================= Add Two Numbers II ================= */
const addTwoII: ProblemDef = {
  slug: 'add-two-numbers-ii',
  title: 'Add Two Numbers II',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/add-two-numbers-ii/',
  technique: 'Push both lists onto stacks so the ones digits come out first; add with carry, building the result by prepending.',
  widget: 'list',
  widgetTitle: 'l1 / l2 / result',
  inputs: [
    { key: 'l1', label: 'l1', defaultValue: '7, 2, 4, 3', wide: true },
    { key: 'l2', label: 'l2', defaultValue: '5, 6, 4', wide: true },
  ],
  code: {
    cpp: cpp('ListNode* addTwoNumbers(ListNode* l1, ListNode* l2)', [
      ['stack<int> s1, s2;'],
      ['for (; l1; l1 = l1->next) s1.push(l1->val);', 'push'],
      ['for (; l2; l2 = l2->next) s2.push(l2->val);', 'push'],
      ['ListNode* head = nullptr; int carry = 0;'],
      ['while (!s1.empty() || !s2.empty() || carry) {'],
      ['    int sum = carry;', 'add'],
      ['    if (!s1.empty()) { sum += s1.top(); s1.pop(); }', 'add'],
      ['    if (!s2.empty()) { sum += s2.top(); s2.pop(); }', 'add'],
      ['    ListNode* node = new ListNode(sum % 10);', 'add'],
      ['    node->next = head; head = node;', 'add'],
      ['    carry = sum / 10;', 'add'],
      ['}'],
      ['return head;', 'ret'],
    ]),
    java: java('ListNode addTwoNumbers(ListNode l1, ListNode l2)', [
      ['Deque<Integer> s1 = new ArrayDeque<>(), s2 = new ArrayDeque<>();'],
      ['for (; l1 != null; l1 = l1.next) s1.push(l1.val);', 'push'],
      ['for (; l2 != null; l2 = l2.next) s2.push(l2.val);', 'push'],
      ['ListNode head = null; int carry = 0;'],
      ['while (!s1.isEmpty() || !s2.isEmpty() || carry > 0) {'],
      ['    int sum = carry;', 'add'],
      ['    if (!s1.isEmpty()) sum += s1.pop();', 'add'],
      ['    if (!s2.isEmpty()) sum += s2.pop();', 'add'],
      ['    ListNode node = new ListNode(sum % 10);', 'add'],
      ['    node.next = head; head = node;', 'add'],
      ['    carry = sum / 10;', 'add'],
      ['}'],
      ['return head;', 'ret'],
    ]),
  },
  run(values) {
    const a = parseList(values.l1, 'l1', 8);
    if ('error' in a) return a;
    const b = parseList(values.l2, 'l2', 8);
    if ('error' in b) return b;
    if ([...a, ...b].some((d) => d < 0 || d > 9)) return { error: 'Every node must be a single digit 0–9.' };
    const out: Step[] = [];
    out.push({ tag: 'push', trace: ['The most significant digit comes first, but addition starts from the ones place. Push both lists onto stacks to read them backwards.'], state: { chains: [chain(a, {}, 'l1'), chain(b, {}, 'l2')] } as ListState });
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    const res: number[] = [];
    while (i >= 0 || j >= 0 || carry) {
      let sum = carry;
      const parts: string[] = carry ? [`carry ${carry}`] : [];
      if (i >= 0) { sum += a[i]; parts.push(String(a[i])); }
      if (j >= 0) { sum += b[j]; parts.push(String(b[j])); }
      res.unshift(sum % 10);
      const mk1 = i >= 0 ? { [i]: 'active' as const } : {};
      const mk2 = j >= 0 ? { [j]: 'active' as const } : {};
      out.push({ tag: 'add', trace: [A(parts.join(' + ')), ' = ', A(sum), ': write ', B(sum % 10), ' at the front, carry ', B(Math.floor(sum / 10)), '.'], state: { chains: [chain(a, mk1, 'l1'), chain(b, mk2, 'l2'), chain(res, { 0: 'good' }, 'result')], aggs: [ag('carry', Math.floor(sum / 10))] } as ListState });
      carry = Math.floor(sum / 10);
      i--;
      j--;
    }
    out.push({ tag: 'ret', trace: ['Sum: ', C(fmt(res)), '.'], state: { chains: [chain(res, {}, 'result')] } as ListState });
    return { steps: out, result: fmt(res) };
  },
  note: 'Stacks reverse the read order without modifying the input lists. Prepending each new digit (node.next = head) builds the result in the correct most-significant-first order with no final reverse.',
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
};

/* ================= Next Greater Node In Linked List ================= */
const nextGreaterNode: ProblemDef = {
  slug: 'next-greater-node-in-linked-list',
  title: 'Next Greater Node In Linked List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/next-greater-node-in-linked-list/',
  technique: 'Copy values to an array, then a monotonic stack of waiting indices resolves each one when a bigger value arrives.',
  widget: 'stack',
  widgetTitle: 'Values with a stack of indices still waiting',
  inputs: [{ key: 'head', label: 'head', defaultValue: '2, 7, 4, 3, 5', wide: true }],
  code: {
    cpp: cpp('vector<int> nextLargerNodes(ListNode* head)', [
      ['vector<int> v;'],
      ['for (; head; head = head->next) v.push_back(head->val);'],
      ['vector<int> ans(v.size(), 0);'],
      ['stack<int> st;'],
      ['for (int i = 0; i < v.size(); i++) {'],
      ['    while (!st.empty() && v[st.top()] < v[i]) {', 'pop'],
      ['        ans[st.top()] = v[i]; st.pop();', 'pop'],
      ['    }'],
      ['    st.push(i);', 'push'],
      ['}'],
      ['return ans;', 'ret'],
    ]),
    java: java('int[] nextLargerNodes(ListNode head)', [
      ['List<Integer> v = new ArrayList<>();'],
      ['for (; head != null; head = head.next) v.add(head.val);'],
      ['int[] ans = new int[v.size()];'],
      ['Deque<Integer> st = new ArrayDeque<>();'],
      ['for (int i = 0; i < v.size(); i++) {'],
      ['    while (!st.isEmpty() && v.get(st.peek()) < v.get(i)) {', 'pop'],
      ['        ans[st.pop()] = v.get(i);', 'pop'],
      ['    }'],
      ['    st.push(i);', 'push'],
      ['}'],
      ['return ans;', 'ret'],
    ]),
  },
  run(values) {
    const v = parseList(values.head, 'head', 14);
    if ('error' in v) return v;
    const ans = v.map(() => 0);
    const st: number[] = [];
    const out: Step[] = [];
    const view = (i: number | null) => ({
      array: { arr: v, ptrs: i === null ? [] : [{ name: 'i', i, c: 'a' as const }], aggs: [ag('answer', fmt(ans), 'c')] },
      stack: st.map((idx) => ({ v: `${v[idx]} (#${idx})` })),
      stackLabel: 'waiting',
    });
    for (let i = 0; i < v.length; i++) {
      while (st.length && v[st[st.length - 1]] < v[i]) {
        const j = st.pop()!;
        ans[j] = v[i];
        out.push({ tag: 'pop', trace: [A(v[i]), ' is bigger than waiting ', B(v[j]), ' (#', String(j), ') — that is its next greater node.'], state: view(i) });
      }
      st.push(i);
      out.push({ tag: 'push', trace: [A(v[i]), ' now waits for something bigger.'], state: view(i) });
    }
    out.push({ tag: 'ret', trace: ['Anything still waiting has no bigger node after it (stays 0): ', C(fmt(ans)), '.'], state: view(null) });
    return { steps: out, result: fmt(ans) };
  },
  note: 'The stack always holds values in decreasing order — a smaller value under a bigger one would already have been answered. Each index is pushed and popped once, so the whole scan is O(n).',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Remove Nodes From Linked List ================= */
const removeNodes: ProblemDef = {
  slug: 'remove-nodes-from-linked-list',
  title: 'Remove Nodes From Linked List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-nodes-from-linked-list/',
  technique: 'Monotonic stack: pop every kept node smaller than the incoming one; what is left is non-increasing.',
  widget: 'stack',
  widgetTitle: 'Nodes kept so far',
  inputs: [{ key: 'head', label: 'head', defaultValue: '5, 2, 13, 3, 8', wide: true }],
  code: {
    cpp: cpp('ListNode* removeNodes(ListNode* head)', [
      ['vector<ListNode*> st;'],
      ['for (ListNode* cur = head; cur; cur = cur->next) {'],
      ['    while (!st.empty() && st.back()->val < cur->val) st.pop_back();', 'pop'],
      ['    if (!st.empty()) st.back()->next = cur;', 'push'],
      ['    st.push_back(cur);', 'push'],
      ['}'],
      ['return st[0];', 'ret'],
    ]),
    java: java('ListNode removeNodes(ListNode head)', [
      ['Deque<ListNode> st = new ArrayDeque<>();'],
      ['for (ListNode cur = head; cur != null; cur = cur.next) {'],
      ['    while (!st.isEmpty() && st.peekLast().val < cur.val) st.pollLast();', 'pop'],
      ['    if (!st.isEmpty()) st.peekLast().next = cur;', 'push'],
      ['    st.addLast(cur);', 'push'],
      ['}'],
      ['return st.peekFirst();', 'ret'],
    ]),
  },
  run(values) {
    const v = parseList(values.head, 'head', 14);
    if ('error' in v) return v;
    const st: number[] = [];
    const out: Step[] = [];
    const view = (i: number | null, popped: number[] = []) => ({
      array: { arr: v, ptrs: i === null ? [] : [{ name: 'cur', i, c: 'a' as const }], mark: Object.fromEntries(popped.map((p) => [p, 'dim' as const])) },
      stack: st.map((idx) => ({ v: v[idx] })),
      stackLabel: 'kept (bottom = head)',
    });
    const gone: number[] = [];
    for (let i = 0; i < v.length; i++) {
      const popped: number[] = [];
      while (st.length && v[st[st.length - 1]] < v[i]) popped.push(st.pop()!);
      gone.push(...popped);
      if (popped.length) out.push({ tag: 'pop', trace: [A(v[i]), ' is bigger than ', F(popped.map((p) => v[p]).join(', ')), ' — those have a greater node to their right, so remove them.'], state: view(i, gone) });
      st.push(i);
      out.push({ tag: 'push', trace: ['Keep ', B(v[i]), ' (for now) and link it after the previous kept node.'], state: view(i, gone) });
    }
    const res = st.map((i) => v[i]);
    out.push({ tag: 'ret', trace: ['Remaining list: ', C(fmt(res)), '.'], state: view(null, gone) });
    return { steps: out, result: fmt(res) };
  },
  note: 'A node survives only if nothing to its right is bigger, so the result is non-increasing. A stack that pops smaller values whenever a bigger one arrives builds exactly that sequence in one pass.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const ccLists: ProblemDef[] = [deleteMiddle, oddEven, mergeInBetween, addTwoII, nextGreaterNode, removeNodes];
