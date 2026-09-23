// Linked List, part 1.
import type { ArrayState, ListState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 47. Reverse Linked List ================= */
const reverseList: ProblemDef = {
  slug: 'reverse-linked-list',
  title: 'Reverse Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/reverse-linked-list/',
  technique: 'Walk the list once, flipping each node\'s next pointer back toward prev.',
  widget: 'list',
  widgetTitle: 'Reversed part & remaining part',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* reverseList(ListNode* head) {'),
      L('        ListNode* prev = nullptr;', 'init'),
      L('        ListNode* curr = head;', 'init'),
      L('        while (curr != nullptr) {', 'loop'),
      L('            ListNode* next = curr->next;', 'save'),
      L('            curr->next = prev;', 'flip'),
      L('            prev = curr;', 'advance'),
      L('            curr = next;', 'advance'),
      L('        }'),
      L('        return prev;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode reverseList(ListNode head) {'),
      L('        ListNode prev = null;', 'init'),
      L('        ListNode curr = head;', 'init'),
      L('        while (curr != null) {', 'loop'),
      L('            ListNode next = curr.next;', 'save'),
      L('            curr.next = prev;', 'flip'),
      L('            prev = curr;', 'advance'),
      L('            curr = next;', 'advance'),
      L('        }'),
      L('        return prev;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };

    const steps: Step[] = [];
    let split = 0; // vals[0..split) reversed, vals[split..) remaining
    const view = (currMark?: number): ListState => {
      const rev = vals.slice(0, split).reverse();
      const rem = vals.slice(split);
      return {
        chains: [
          { label: 'reversed', items: rev.map((v, i) => ({ v, mark: i === 0 && currMark === 1 ? ('good' as const) : ('win' as const) })) },
          { label: 'remaining', items: rem.map((v, i) => ({ v, mark: i === 0 && currMark === 0 ? ('active' as const) : undefined })) },
        ],
        ptrs: [
          ...(rev.length > 0 ? [{ name: 'prev', chain: 0, i: 0, c: 'b' as const }] : []),
          ...(rem.length > 0 ? [{ name: 'curr', chain: 1, i: 0, c: 'a' as const }] : []),
        ],
      };
    };
    steps.push({ tag: 'init', trace: [B('prev'), ' starts as null; ', A('curr'), ' at the head. The reversed chain grows one node per iteration.'], state: view() });
    while (split < vals.length) {
      const v = vals[split];
      steps.push({ tag: 'save', trace: ['Save curr\'s successor (', A(vals[split + 1] ?? '∅'), ') so the walk can continue after the flip.'], state: view(0) });
      split++;
      steps.push({
        tag: 'flip',
        trace: ['Flip: node ', B(v), '\'s next now points backward — it joins the reversed chain.'],
        state: view(1),
      });
      steps.push({ tag: 'advance', trace: ['Slide both pointers forward: prev = ', B(v), ', curr = ', A(vals[split] ?? '∅'), '.'], state: view() });
    }
    steps.push({
      tag: 'ret',
      trace: ['curr fell off the end — ', C('prev'), ' is the new head: ', C(`[${[...vals].reverse().join(' → ')}]`), '.'],
      state: view(),
    });
    return { steps, result: `[${[...vals].reverse().join(' → ')}]`, resultDetail: 'reversed in place' };
  },
  note: 'The list is always split into two valid lists — an already-reversed prefix and an untouched suffix — and each iteration moves exactly one node across the boundary. Saving next before the flip is the one move that keeps the suffix reachable.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Recursion',
    technique: 'Reverse the rest of the list recursively, then hook the current node onto the end of that reversed tail.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    ListNode* reverseList(ListNode* head) {', 'init'),
        L('        if (!head || !head->next) return head;', 'base'),
        L('        ListNode* newHead = reverseList(head->next);', 'loop'),
        L('        head->next->next = head;', 'flip'),
        L('        head->next = nullptr;', 'flip'),
        L('        return newHead;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public ListNode reverseList(ListNode head) {', 'init'),
        L('        if (head == null || head.next == null) return head;', 'base'),
        L('        ListNode newHead = reverseList(head.next);', 'loop'),
        L('        head.next.next = head;', 'flip'),
        L('        head.next = null;', 'flip'),
        L('        return newHead;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const vals = parseIntArray(values.list, { maxLen: 10 });
      if (typeof vals === 'string') return { error: vals };
      const steps: Step[] = [];
      const n = vals.length;
      let reversedFrom = n;
      const view = (depth: number, active?: number): ListState => ({
        chains: [
          { label: 'waiting on the call stack', items: vals.slice(0, reversedFrom).map((v, i) => ({ v, mark: i === active ? ('active' as const) : i < depth ? ('dim' as const) : undefined })) },
          { label: 'reversed tail', items: vals.slice(reversedFrom).reverse().map((v) => ({ v, mark: 'win' as const })) },
        ],
        aggs: [{ label: 'recursion depth', value: String(depth), c: 'a' }],
      });
      if (n === 0) {
        steps.push({ tag: 'base', trace: ['Empty list — nothing to reverse.'], state: view(0) });
        return { steps, result: '[]', resultDetail: 'reversed recursively' };
      }
      steps.push({ tag: 'init', trace: ['reverseList(head) first reverses everything after head, then fixes head itself.'], state: view(0) });
      for (let d = 0; d < n - 1; d++) steps.push({ tag: 'loop', trace: ['Call on node ', A(vals[d]), ' — recurse into the rest first (depth ', A(d + 1), ').'], state: view(d + 1, d) });
      reversedFrom = n - 1;
      steps.push({ tag: 'base', trace: ['Node ', B(vals[n - 1]), ' has no next — it becomes the new head. Start unwinding.'], state: view(n - 1) });
      for (let d = n - 2; d >= 0; d--) {
        reversedFrom = d;
        steps.push({ tag: 'flip', trace: ['Back at ', A(vals[d]), ': set ', A(`${vals[d + 1]}.next = ${vals[d]}`), ' and clear ', A(`${vals[d]}.next`), '.'], state: view(d, d) });
      }
      steps.push({ tag: 'ret', trace: ['Every call returned the same new head ', C(vals[n - 1]), '.'], state: view(0) });
      return { steps, result: `[${[...vals].reverse().join(' → ')}]`, resultDetail: 'reversed recursively' };
    },
    note: 'Elegant and still O(n) time, but every node waits on the call stack, so it uses O(n) memory and can overflow on very long lists. The iterative three-pointer loop needs O(1).',
    complexity: { time: 'O(n)', space: 'O(n) stack' },
  },
};

/* ================= 48. Merge Two Sorted Lists ================= */
const mergeTwoLists: ProblemDef = {
  slug: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/merge-two-sorted-lists/',
  technique: 'A dummy head plus one tail pointer: always splice on the smaller front node.',
  widget: 'list',
  widgetTitle: 'Both lists & merged result',
  inputs: [
    { key: 'l1', label: 'List 1 (sorted)', defaultValue: '1, 2, 4', wide: true },
    { key: 'l2', label: 'List 2 (sorted)', defaultValue: '1, 3, 4', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {'),
      L('        ListNode dummy, *tail = &dummy;', 'init'),
      L('        while (l1 && l2) {', 'loop'),
      L('            if (l1->val <= l2->val) {', 'cmp'),
      L('                tail->next = l1;', 'take1'),
      L('                l1 = l1->next;', 'take1'),
      L('            } else {'),
      L('                tail->next = l2;', 'take2'),
      L('                l2 = l2->next;', 'take2'),
      L('            }'),
      L('            tail = tail->next;', 'loop'),
      L('        }'),
      L('        tail->next = l1 ? l1 : l2;', 'rest'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {'),
      L('        ListNode dummy = new ListNode(0), tail = dummy;', 'init'),
      L('        while (l1 != null && l2 != null) {', 'loop'),
      L('            if (l1.val <= l2.val) {', 'cmp'),
      L('                tail.next = l1;', 'take1'),
      L('                l1 = l1.next;', 'take1'),
      L('            } else {'),
      L('                tail.next = l2;', 'take2'),
      L('                l2 = l2.next;', 'take2'),
      L('            }'),
      L('            tail = tail.next;', 'loop'),
      L('        }'),
      L('        tail.next = (l1 != null) ? l1 : l2;', 'rest'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.l1, { maxLen: 8 });
    if (typeof a === 'string') return { error: a };
    const b = parseIntArray(values.l2, { maxLen: 8 });
    if (typeof b === 'string') return { error: b };
    for (const arr of [a, b]) for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Both lists must be sorted.' };

    const steps: Step[] = [];
    let i = 0;
    let j = 0;
    const merged: number[] = [];
    const view = (hl?: 'a' | 'b'): ListState => ({
      chains: [
        { label: 'list 1', items: a.slice(i).map((v, k) => ({ v, mark: k === 0 && hl === 'a' ? ('active' as const) : undefined })) },
        { label: 'list 2', items: b.slice(j).map((v, k) => ({ v, mark: k === 0 && hl === 'b' ? ('active' as const) : undefined })) },
        { label: 'merged', items: merged.map((v, k) => ({ v, mark: k === merged.length - 1 ? ('good' as const) : ('win' as const) })) },
      ],
    });
    steps.push({ tag: 'init', trace: ['A dummy node anchors the result; ', A('tail'), ' always points at the merged list\'s last node.'], state: view() });
    while (i < a.length && j < b.length) {
      steps.push({ tag: 'cmp', trace: ['Compare fronts: ', A(a[i]), ' vs ', A(b[j]), '.'], state: view() });
      if (a[i] <= b[j]) {
        merged.push(a[i]);
        steps.push({ tag: 'take1', trace: [B(a[i]), ' is smaller (or equal) — splice it from list 1.'], state: view('a') });
        i++;
      } else {
        merged.push(b[j]);
        steps.push({ tag: 'take2', trace: [B(b[j]), ' is smaller — splice it from list 2.'], state: view('b') });
        j++;
      }
    }
    const rest = i < a.length ? a.slice(i) : b.slice(j);
    if (rest.length > 0) {
      merged.push(...rest);
      steps.push({ tag: 'rest', trace: ['One list is empty — attach the other\'s remainder ', B(`[${rest.join(' → ')}]`), ' wholesale.'], state: view() });
    } else {
      steps.push({ tag: 'rest', trace: ['Both lists exhausted simultaneously — nothing left to attach.'], state: view() });
    }
    steps.push({ tag: 'ret', trace: ['Merged: ', C(`[${merged.join(' → ')}]`), '.'], state: view() });
    return { steps, result: `[${merged.join(' → ')}]` };
  },
  note: 'Because both inputs are sorted, the globally smallest unmerged node is always one of the two fronts — so a single comparison per output node suffices. The dummy head removes every "is this the first node?" special case.',
  complexity: { time: 'O(m + n)', space: 'O(1)' },
  brute: {
    label: 'Recursive merge',
    technique: 'The smaller head goes first, followed by the merge of everything that remains.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    ListNode* mergeTwoLists(ListNode* a, ListNode* b) {', 'init'),
        L('        if (!a) return b;', 'tail'),
        L('        if (!b) return a;', 'tail'),
        L('        if (a->val <= b->val) { a->next = mergeTwoLists(a->next, b); return a; }', 'take'),
        L('        b->next = mergeTwoLists(a, b->next); return b;', 'take'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public ListNode mergeTwoLists(ListNode a, ListNode b) {', 'init'),
        L('        if (a == null) return b;', 'tail'),
        L('        if (b == null) return a;', 'tail'),
        L('        if (a.val <= b.val) { a.next = mergeTwoLists(a.next, b); return a; }', 'take'),
        L('        b.next = mergeTwoLists(a, b.next); return b;', 'take'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const a = parseIntArray(values.l1, { maxLen: 8 });
      if (typeof a === 'string') return { error: a };
      const b = parseIntArray(values.l2, { maxLen: 8 });
      if (typeof b === 'string') return { error: b };
      for (const arr of [a, b]) for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: 'Both lists must be sorted.' };
      let i = 0;
      let j = 0;
      const merged: number[] = [];
      const steps: Step[] = [];
      const view = (hl?: 'a' | 'b'): ListState => ({
        chains: [
          { label: 'list 1', items: a.slice(i).map((v, k) => ({ v, mark: k === 0 && hl === 'a' ? ('active' as const) : undefined })) },
          { label: 'list 2', items: b.slice(j).map((v, k) => ({ v, mark: k === 0 && hl === 'b' ? ('active' as const) : undefined })) },
          { label: 'result (one frame per node)', items: merged.map((v, k) => ({ v, mark: k === merged.length - 1 ? ('good' as const) : ('win' as const) })) },
        ],
        aggs: [{ label: 'recursion depth', value: String(merged.length), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['merge(a, b) = the smaller head, then merge(what is left).'], state: view() });
      while (i < a.length && j < b.length) {
        const fromA = a[i] <= b[j];
        steps.push({ tag: 'take', trace: ['Heads ', A(a[i]), ' and ', A(b[j]), ': ', B(fromA ? a[i] : b[j]), ' goes first; recurse on the rest.'], state: view(fromA ? 'a' : 'b') });
        merged.push(fromA ? a[i++] : b[j++]);
      }
      const rest = i < a.length ? a.slice(i) : b.slice(j);
      if (rest.length) steps.push({ tag: 'tail', trace: ['One list is empty — return the other as-is: ', A(rest.join(' → ')), '.'], state: view() });
      merged.push(...rest);
      i = a.length;
      j = b.length;
      steps.push({ tag: 'take', trace: ['The calls unwind, each returning its node: ', C(merged.join(' → ')), '.'], state: view() });
      return { steps, result: `[${merged.join(' → ')}]` };
    },
    note: 'Beautifully short, but the recursion is as deep as the merged list — O(m + n) stack. The dummy-head loop does the same splicing iteratively in O(1) extra space.',
    complexity: { time: 'O(m + n)', space: 'O(m + n) stack' },
  },
};

/* ================= 49. Reorder List ================= */
const reorderList: ProblemDef = {
  slug: 'reorder-list',
  title: 'Reorder List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reorder-list/',
  technique: 'Three classics chained: find the middle, reverse the back half, interleave the two halves.',
  widget: 'list',
  widgetTitle: 'List through the three phases',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void reorderList(ListNode* head) {'),
      L('        ListNode *slow = head, *fast = head;', 'mid'),
      L('        while (fast->next && fast->next->next) {', 'mid'),
      L('            slow = slow->next;', 'mid'),
      L('            fast = fast->next->next;', 'mid'),
      L('        }'),
      L('        ListNode* second = reverse(slow->next);', 'rev'),
      L('        slow->next = nullptr;', 'rev'),
      L('        ListNode* first = head;', 'weave'),
      L('        while (second) {', 'weave'),
      L('            ListNode *t1 = first->next, *t2 = second->next;', 'weave'),
      L('            first->next = second;', 'weave'),
      L('            second->next = t1;', 'weave'),
      L('            first = t1; second = t2;', 'weave'),
      L('        }'),
      L('    }'),
      L('    ListNode* reverse(ListNode* h) {', 'rev'),
      L('        ListNode* prev = nullptr;'),
      L('        while (h) { ListNode* n = h->next; h->next = prev; prev = h; h = n; }'),
      L('        return prev;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void reorderList(ListNode head) {'),
      L('        ListNode slow = head, fast = head;', 'mid'),
      L('        while (fast.next != null && fast.next.next != null) {', 'mid'),
      L('            slow = slow.next;', 'mid'),
      L('            fast = fast.next.next;', 'mid'),
      L('        }'),
      L('        ListNode second = reverse(slow.next);', 'rev'),
      L('        slow.next = null;', 'rev'),
      L('        ListNode first = head;', 'weave'),
      L('        while (second != null) {', 'weave'),
      L('            ListNode t1 = first.next, t2 = second.next;', 'weave'),
      L('            first.next = second;', 'weave'),
      L('            second.next = t1;', 'weave'),
      L('            first = t1; second = t2;', 'weave'),
      L('        }'),
      L('    }'),
      L('    private ListNode reverse(ListNode h) {', 'rev'),
      L('        ListNode prev = null;'),
      L('        while (h != null) { ListNode n = h.next; h.next = prev; prev = h; h = n; }'),
      L('        return prev;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    if (vals.length < 3) return { error: 'Need at least three nodes to see the reorder.' };

    const steps: Step[] = [];
    const midIdx = Math.floor((vals.length - 1) / 2);
    const first = vals.slice(0, midIdx + 1);
    const second = vals.slice(midIdx + 1).reverse();

    steps.push({
      tag: 'mid',
      trace: ['Phase 1 — slow/fast pointers find the middle: slow lands on ', A(vals[midIdx]), ' (index ', A(midIdx), ') when fast hits the end.'],
      state: {
        chains: [{ label: 'list', items: vals.map((v, i) => ({ v, mark: i === midIdx ? ('active' as const) : undefined })) }],
        ptrs: [
          { name: 'slow', chain: 0, i: midIdx, c: 'a' },
          { name: 'fast', chain: 0, i: vals.length - 1, c: 'c' },
        ],
      } satisfies ListState,
    });
    steps.push({
      tag: 'rev',
      trace: ['Phase 2 — detach and reverse the back half: ', A(`[${vals.slice(midIdx + 1).join(' → ')}]`), ' becomes ', B(`[${second.join(' → ')}]`), '.'],
      state: {
        chains: [
          { label: 'front', items: first.map((v) => ({ v })) },
          { label: 'back (rev)', items: second.map((v) => ({ v, mark: 'win' as const })) },
        ],
      } satisfies ListState,
    });
    const woven: number[] = [];
    let fi = 0;
    let si = 0;
    while (fi < first.length || si < second.length) {
      if (fi < first.length) woven.push(first[fi++]);
      if (si < second.length) woven.push(second[si++]);
      steps.push({
        tag: 'weave',
        trace: ['Phase 3 — interleave: take one from the front, one from the reversed back → ', B(`[${woven.join(' → ')}]`), '.'],
        state: {
          chains: [
            { label: 'woven', items: woven.map((v, i) => ({ v, mark: i >= woven.length - 2 ? ('good' as const) : ('win' as const) })) },
            { label: 'front', items: first.slice(fi).map((v) => ({ v })) },
            { label: 'back', items: second.slice(si).map((v) => ({ v })) },
          ],
        } satisfies ListState,
      });
    }
    steps.push({
      tag: 'weave',
      trace: ['Reordered: ', C(`[${woven.join(' → ')}]`), ' — first, last, second, second-to-last, …'],
      state: { chains: [{ label: 'result', items: woven.map((v) => ({ v, mark: 'final' as const })) }] } satisfies ListState,
    });
    return { steps, result: `[${woven.join(' → ')}]`, resultDetail: 'L0→Ln→L1→Ln−1→…' };
  },
  note: 'The target order alternates between the list\'s front and back — and a singly linked list can only walk forward. Reversing the second half converts "walk backward from the end" into "walk forward", after which the interleave is a plain two-list merge.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Copy to an array',
    technique: 'Store every node in an array, then relink by taking one from the front and one from the back alternately.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void reorderList(ListNode* head) {'),
        L('        vector<ListNode*> nodes;', 'mid'),
        L('        for (ListNode* p = head; p; p = p->next) nodes.push_back(p);', 'mid'),
        L('        int i = 0, j = nodes.size() - 1;', 'merge'),
        L('        while (i < j) {', 'merge'),
        L('            nodes[i]->next = nodes[j]; i++;', 'merge'),
        L('            if (i == j) break;', 'merge'),
        L('            nodes[j]->next = nodes[i]; j--;', 'merge'),
        L('        }'),
        L('        nodes[i]->next = nullptr;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void reorderList(ListNode head) {'),
        L('        List<ListNode> nodes = new ArrayList<>();', 'mid'),
        L('        for (ListNode p = head; p != null; p = p.next) nodes.add(p);', 'mid'),
        L('        int i = 0, j = nodes.size() - 1;', 'merge'),
        L('        while (i < j) {', 'merge'),
        L('            nodes.get(i).next = nodes.get(j); i++;', 'merge'),
        L('            if (i == j) break;', 'merge'),
        L('            nodes.get(j).next = nodes.get(i); j--;', 'merge'),
        L('        }'),
        L('        nodes.get(i).next = null;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const vals = parseIntArray(values.list, { maxLen: 10 });
      if (typeof vals === 'string') return { error: vals };
      if (vals.length < 3) return { error: 'Need at least three nodes to see the reorder.' };
      const steps: Step[] = [];
      const woven: number[] = [];
      const view = (i: number, j: number): ListState => ({
        chains: [
          { label: 'array of nodes', items: vals.map((v, k) => ({ v, mark: k < i || k > j ? ('dim' as const) : k === i || k === j ? ('active' as const) : undefined })), broken: true },
          { label: 'relinked', items: woven.map((v) => ({ v, mark: 'good' as const })) },
        ],
        ptrs: [
          ...(i <= j ? [{ name: 'i', chain: 0, i, c: 'a' as const }] : []),
          ...(j >= i ? [{ name: 'j', chain: 0, i: j, c: 'b' as const }] : []),
        ],
      });
      steps.push({ tag: 'mid', trace: ['Copy all ', A(vals.length), ' node pointers into an array — now the back of the list is reachable in O(1).'], state: view(0, vals.length - 1) });
      let i = 0;
      let j = vals.length - 1;
      while (i <= j) {
        woven.push(vals[i]);
        if (i !== j) woven.push(vals[j]);
        steps.push({ tag: 'merge', trace: ['Take ', B(vals[i]), i !== j ? [' from the front, then ', vals[j], ' from the back.'].join('') : ' (the middle node).'], state: view(i, j) });
        i++;
        j--;
      }
      steps.push({ tag: 'ret', trace: ['Terminate the last node: ', C(woven.join(' → ')), '.'], state: view(i, j) });
      return { steps, result: `[${woven.join(' → ')}]`, resultDetail: 'L0→Ln→L1→Ln−1→…' };
    },
    note: 'Simple and O(n), but the array costs O(n) extra memory. Finding the middle, reversing the second half and weaving in place does it in O(1).',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= 50. Remove Nth Node From End ================= */
const removeNth: ProblemDef = {
  slug: 'remove-nth-node-from-end-of-list',
  title: 'Remove Nth Node From End of List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
  technique: 'Two pointers a fixed n apart — when the leader hits the end, the follower is at the target.',
  widget: 'list',
  widgetTitle: 'List & gap pointers',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true },
    { key: 'n', label: 'n (from end)', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* removeNthFromEnd(ListNode* head, int n) {'),
      L('        ListNode dummy(0, head);', 'init'),
      L('        ListNode *lead = &dummy, *trail = &dummy;', 'init'),
      L('        for (int i = 0; i < n + 1; i++)', 'advance'),
      L('            lead = lead->next;', 'advance'),
      L('        while (lead != nullptr) {', 'walk'),
      L('            lead = lead->next;', 'walk'),
      L('            trail = trail->next;', 'walk'),
      L('        }'),
      L('        trail->next = trail->next->next;', 'unlink'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode removeNthFromEnd(ListNode head, int n) {'),
      L('        ListNode dummy = new ListNode(0, head);', 'init'),
      L('        ListNode lead = dummy, trail = dummy;', 'init'),
      L('        for (int i = 0; i < n + 1; i++)', 'advance'),
      L('            lead = lead.next;', 'advance'),
      L('        while (lead != null) {', 'walk'),
      L('            lead = lead.next;', 'walk'),
      L('            trail = trail.next;', 'walk'),
      L('        }'),
      L('        trail.next = trail.next.next;', 'unlink'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    const n = parseInt1(values.n, 'n', { min: 1 });
    if (typeof n === 'string') return { error: n };
    if (n > vals.length) return { error: 'n must be ≤ list length.' };

    const steps: Step[] = [];
    const withDummy = ['d', ...vals.map(String)];
    const view = (lead: number, trail: number, gone?: number): ListState => ({
      chains: [
        {
          label: 'list',
          items: withDummy.map((v, i) => ({
            v,
            mark: gone !== undefined && i === gone ? ('dim' as const) : i === 0 ? ('win' as const) : undefined,
          })),
        },
      ],
      ptrs: [
        ...(lead < withDummy.length ? [{ name: 'lead', chain: 0, i: lead, c: 'a' as const }] : []),
        { name: 'trail', chain: 0, i: trail, c: 'b' as const },
      ],
    });
    steps.push({ tag: 'init', trace: ['A dummy node fronts the list (shown as ', A('d'), '); both pointers start there.'], state: view(0, 0) });
    let lead = 0;
    let trail = 0;
    for (let i = 0; i < n + 1; i++) lead++;
    steps.push({ tag: 'advance', trace: ['Advance ', A('lead'), ' ', A(n + 1), ' steps — the gap between the pointers is now exactly n+1.'], state: view(lead, trail) });
    while (lead < withDummy.length) {
      lead++;
      trail++;
      steps.push({ tag: 'walk', trace: ['March both pointers in lockstep — gap preserved.'], state: view(lead, trail) });
    }
    const goneIdx = trail + 1;
    steps.push({
      tag: 'unlink',
      trace: ['lead fell off the end, so ', B('trail'), ' sits just before the target — unlink ', F(withDummy[goneIdx]), ' (the ', A(n), 'th from the end).'],
      state: view(lead, trail, goneIdx),
    });
    const out = vals.filter((_, i) => i !== vals.length - n);
    steps.push({
      tag: 'ret',
      trace: ['Result: ', C(`[${out.join(' → ')}]`), '.'],
      state: { chains: [{ label: 'result', items: out.map((v) => ({ v, mark: 'final' as const })) }] } satisfies ListState,
    });
    return { steps, result: `[${out.join(' → ')}]`, resultDetail: `removed ${vals[vals.length - n]}` };
  },
  note: '"nth from the end" is a distance constraint, and a fixed gap between two pointers encodes it without knowing the length: when the leader reaches null, the follower is n+1 from the end — exactly the predecessor of the node to delete. One pass, and the dummy handles deleting the head.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Two passes',
    technique: 'Count the length L in a first pass, then walk to the node just before position L − n and unlink the next one.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    ListNode* removeNthFromEnd(ListNode* head, int n) {'),
        L('        int len = 0;', 'init'),
        L('        for (ListNode* p = head; p; p = p->next) len++;', 'gap'),
        L('        ListNode dummy(0, head); ListNode* prev = &dummy;', 'walk'),
        L('        for (int i = 0; i < len - n; i++) prev = prev->next;', 'walk'),
        L('        prev->next = prev->next->next;', 'unlink'),
        L('        return dummy.next;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public ListNode removeNthFromEnd(ListNode head, int n) {'),
        L('        int len = 0;', 'init'),
        L('        for (ListNode p = head; p != null; p = p.next) len++;', 'gap'),
        L('        ListNode dummy = new ListNode(0, head), prev = dummy;', 'walk'),
        L('        for (int i = 0; i < len - n; i++) prev = prev.next;', 'walk'),
        L('        prev.next = prev.next.next;', 'unlink'),
        L('        return dummy.next;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const vals = parseIntArray(values.list, { maxLen: 10 });
      if (typeof vals === 'string') return { error: vals };
      const n = parseInt1(values.n, 'n', { min: 1 });
      if (typeof n === 'string') return { error: n };
      if (n > vals.length) return { error: 'n must be ≤ list length.' };
      const withDummy = ['d', ...vals.map(String)];
      const len = vals.length;
      const steps: Step[] = [];
      const view = (p: number | null, gone?: number, name = 'p'): ListState => ({
        chains: [{ label: 'list', items: withDummy.map((v, i) => ({ v, mark: gone !== undefined && i === gone ? ('dim' as const) : i === 0 ? ('win' as const) : undefined })) }],
        ptrs: p !== null ? [{ name, chain: 0, i: p, c: 'a' }] : [],
        aggs: [{ label: 'length', value: String(len), c: 'b' }],
      });
      steps.push({ tag: 'init', trace: ['Pass 1 counts the nodes; pass 2 walks to the one before the target.'], state: view(null) });
      for (let i = 1; i <= len; i++) steps.push({ tag: 'gap', trace: ['Pass 1: count node ', A(vals[i - 1]), ' → ', A(i), '.'], state: view(i) });
      steps.push({ tag: 'walk', trace: ['Length ', B(len), '. The ', A(n), 'th from the end is node #', B(len - n + 1), ', so stop ', A(len - n), ' steps after the dummy.'], state: view(0, undefined, 'prev') });
      for (let i = 1; i <= len - n; i++) steps.push({ tag: 'walk', trace: ['Pass 2: prev → ', A(vals[i - 1]), '.'], state: view(i, undefined, 'prev') });
      const target = len - n + 1;
      steps.push({ tag: 'unlink', trace: ['Unlink ', F(vals[target - 1]), ' by pointing prev past it.'], state: view(len - n, target, 'prev') });
      const out = vals.filter((_, i) => i !== target - 1);
      steps.push({ tag: 'ret', trace: ['Result: ', C(out.join(' → ') || 'empty'), '.'], state: view(null, target) });
      return { steps, result: `[${out.join(' → ')}]`, resultDetail: `removed ${vals[len - n]}` };
    },
    note: 'Still O(n) and O(1) space, but it walks the list twice. Keeping two pointers exactly n apart finds the same node in a single pass.',
    complexity: { time: 'O(n), two passes', space: 'O(1)' },
  },
};

/* ================= 51. Linked List Cycle ================= */
const listCycle: ProblemDef = {
  slug: 'linked-list-cycle',
  title: 'Linked List Cycle',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/linked-list-cycle/',
  technique: 'Floyd\'s tortoise and hare: a fast pointer laps a slow one iff the list loops.',
  widget: 'array',
  widgetTitle: 'Nodes (arrow shows the cycle)',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '3, 2, 0, -4', wide: true },
    { key: 'pos', label: 'Cycle to index (-1 = none)', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool hasCycle(ListNode *head) {'),
      L('        ListNode *slow = head, *fast = head;', 'init'),
      L('        while (fast != nullptr && fast->next != nullptr) {', 'loop'),
      L('            slow = slow->next;', 'move'),
      L('            fast = fast->next->next;', 'move'),
      L('            if (slow == fast)', 'meet'),
      L('                return true;', 'meet'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Solution {'),
      L('    public boolean hasCycle(ListNode head) {'),
      L('        ListNode slow = head, fast = head;', 'init'),
      L('        while (fast != null && fast.next != null) {', 'loop'),
      L('            slow = slow.next;', 'move'),
      L('            fast = fast.next.next;', 'move'),
      L('            if (slow == fast)', 'meet'),
      L('                return true;', 'meet'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    const pos = parseInt1(values.pos, 'Cycle index', { min: -1 });
    if (typeof pos === 'string') return { error: pos };
    if (pos >= vals.length) return { error: 'Cycle index must be < list length (or -1).' };

    const n = vals.length;
    const next = (i: number): number | null => (i === n - 1 ? (pos === -1 ? null : pos) : i + 1);
    const steps: Step[] = [];
    const st = (slow: number | null, fast: number | null): ArrayState => ({
      arr: vals,
      ptrs: [
        ...(slow !== null ? [{ name: 'slow', i: slow, c: 'b' as const }] : []),
        ...(fast !== null ? [{ name: 'fast', i: fast, c: 'a' as const }] : []),
      ],
      aggs: [{ label: 'tail links to', value: pos === -1 ? '∅ (no cycle)' : `index ${pos}`, c: pos === -1 ? undefined : 'c' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Both pointers start at the head. ', B('slow'), ' moves 1 node per tick, ', A('fast'), ' moves 2.'],
      state: st(0, 0),
    });
    let slow: number | null = 0;
    let fast: number | null = 0;
    let met = false;
    let guard = 0;
    while (fast !== null && next(fast) !== null && guard++ < 50) {
      slow = next(slow!)!;
      fast = next(next(fast)!);
      steps.push({
        tag: 'move',
        trace: ['Tick: slow → index ', B(slow), ', fast → ', fast === null ? F('∅') : A(fast), '.'],
        state: st(slow, fast),
      });
      if (fast !== null && slow === fast) {
        met = true;
        steps.push({
          tag: 'meet',
          trace: ['The hare caught the tortoise at index ', C(slow), ' — impossible unless the track loops. Return ', C('true'), '.'],
          state: st(slow, fast),
        });
        break;
      }
    }
    if (!met) {
      steps.push({ tag: 'ret', trace: ['fast reached the end — a straight track has an end, so there is no cycle. Return ', C('false'), '.'], state: st(slow, fast) });
    }
    return { steps, result: String(met), resultDetail: met ? `pointers met at index ${slow}` : 'list terminates' };
  },
  note: 'In a cycle the gap between fast and slow shrinks by exactly 1 each tick (fast gains 1 net node per step), so a meeting is guaranteed within one lap — O(n) time with two pointers of memory, versus a hash set\'s O(n) space.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Hash set of nodes',
    technique: 'Walk the list remembering every node visited; seeing a node twice means there is a cycle.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool hasCycle(ListNode* head) {'),
        L('        unordered_set<ListNode*> seen;', 'init'),
        L('        for (ListNode* p = head; p; p = p->next) {', 'move'),
        L('            if (seen.count(p)) return true;', 'meet'),
        L('            seen.insert(p);', 'move'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('public class Solution {'),
        L('    public boolean hasCycle(ListNode head) {'),
        L('        Set<ListNode> seen = new HashSet<>();', 'init'),
        L('        for (ListNode p = head; p != null; p = p.next) {', 'move'),
        L('            if (!seen.add(p)) return true;', 'meet', 'move'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const vals = parseIntArray(values.list, { maxLen: 10 });
      if (typeof vals === 'string') return { error: vals };
      const pos = parseInt1(values.pos, 'Cycle index', { min: -1 });
      if (typeof pos === 'string') return { error: pos };
      if (pos >= vals.length) return { error: 'Cycle index must be < list length (or -1).' };
      const n = vals.length;
      const next = (i: number): number | null => (i === n - 1 ? (pos === -1 ? null : pos) : i + 1);
      const seen = new Set<number>();
      const steps: Step[] = [];
      const st = (p: number | null, m?: 'final'): ArrayState => ({
        arr: vals,
        ptrs: p !== null ? [{ name: 'p', i: p, c: 'a' }] : [],
        mark: { ...Object.fromEntries([...seen].map((i) => [i, 'good' as const])), ...(p !== null && m ? { [p]: m } : {}) },
        aggs: [
          { label: 'nodes in the set', value: String(seen.size), c: 'b' },
          { label: 'tail links to', value: pos === -1 ? '∅ (no cycle)' : `index ${pos}`, c: pos === -1 ? undefined : 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Remember every node (by identity) as you walk.'], state: st(0) });
      let p: number | null = n ? 0 : null;
      let met = false;
      while (p !== null) {
        if (seen.has(p)) {
          met = true;
          steps.push({ tag: 'meet', trace: ['Node at index ', C(p), ' is already in the set — we are going round in a loop. Return ', C('true'), '.'], state: st(p, 'final') });
          break;
        }
        seen.add(p);
        steps.push({ tag: 'move', trace: ['New node (index ', A(p), ', value ', A(vals[p]), ') — add it and follow next.'], state: st(p) });
        p = next(p);
      }
      if (!met) steps.push({ tag: 'ret', trace: ['Reached null — no cycle. Return ', C('false'), '.'], state: st(null) });
      return { steps, result: String(met), resultDetail: met ? `node at index ${p} repeats` : 'list terminates' };
    },
    note: 'Linear time, but the set stores up to n node addresses. Floyd’s slow/fast pointers detect the loop with two pointers and O(1) memory.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= 52. Merge k Sorted Lists ================= */
const mergeKLists: ProblemDef = {
  slug: 'merge-k-sorted-lists',
  title: 'Merge k Sorted Lists',
  category: 'Linked List',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/merge-k-sorted-lists/',
  technique: 'A min-heap of the k current front nodes — always pop the global minimum.',
  widget: 'list',
  widgetTitle: 'k lists & merged output',
  inputs: [{ key: 'lists', label: 'Lists (";" separated)', defaultValue: '1,4,5; 1,3,4; 2,6', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* mergeKLists(vector<ListNode*>& lists) {'),
      L('        auto cmp = [](ListNode* a, ListNode* b) {', 'init'),
      L('            return a->val > b->val;', 'init'),
      L('        };'),
      L('        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);', 'init'),
      L('        for (ListNode* l : lists)', 'seed'),
      L('            if (l) pq.push(l);', 'seed'),
      L('        ListNode dummy, *tail = &dummy;', 'seed'),
      L('        while (!pq.empty()) {', 'loop'),
      L('            ListNode* node = pq.top(); pq.pop();', 'pop'),
      L('            tail->next = node;', 'pop'),
      L('            tail = node;', 'pop'),
      L('            if (node->next)', 'push'),
      L('                pq.push(node->next);', 'push'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode mergeKLists(ListNode[] lists) {'),
      L('        PriorityQueue<ListNode> pq =', 'init'),
      L('            new PriorityQueue<>((a, b) -> a.val - b.val);', 'init'),
      L('        for (ListNode l : lists)', 'seed'),
      L('            if (l != null) pq.add(l);', 'seed'),
      L('        ListNode dummy = new ListNode(0), tail = dummy;', 'seed'),
      L('        while (!pq.isEmpty()) {', 'loop'),
      L('            ListNode node = pq.poll();', 'pop'),
      L('            tail.next = node;', 'pop'),
      L('            tail = node;', 'pop'),
      L('            if (node.next != null)', 'push'),
      L('                pq.add(node.next);', 'push'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const listStrs = (values.lists ?? '').split(';').map((s) => s.trim()).filter(Boolean);
    if (listStrs.length === 0) return { error: 'Enter at least one list.' };
    if (listStrs.length > 5) return { error: 'Keep it to at most 5 lists.' };
    const lists: number[][] = [];
    for (const s of listStrs) {
      const arr = parseIntArray(s, { maxLen: 8 });
      if (typeof arr === 'string') return { error: `List "${s}": ${arr}` };
      for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: `List "${s}" must be sorted.` };
      lists.push(arr);
    }

    const steps: Step[] = [];
    const heads = lists.map(() => 0);
    const merged: number[] = [];
    const heapView = () =>
      lists
        .map((l, li) => (heads[li] < l.length ? `${l[heads[li]]}(L${li + 1})` : null))
        .filter(Boolean)
        .join(' ');
    const view = (activeList?: number): ListState => ({
      chains: [
        ...lists.map((l, li) => ({
          label: `list ${li + 1}`,
          items: l.slice(heads[li]).map((v, k) => ({ v, mark: li === activeList && k === 0 ? ('active' as const) : undefined })),
        })),
        { label: 'merged', items: merged.map((v, k) => ({ v, mark: k === merged.length - 1 ? ('good' as const) : ('win' as const) })) },
      ],
      aggs: [{ label: 'heap (fronts)', value: heapView() || 'empty', c: 'a' }],
    });
    steps.push({ tag: 'seed', trace: ['Seed a min-heap with each list\'s head — only ', A(lists.length), ' candidates ever compete at once.'], state: view() });
    let guard = 0;
    while (guard++ < 60) {
      let bestList = -1;
      for (let li = 0; li < lists.length; li++) {
        if (heads[li] < lists[li].length && (bestList === -1 || lists[li][heads[li]] < lists[bestList][heads[bestList]])) bestList = li;
      }
      if (bestList === -1) break;
      const v = lists[bestList][heads[bestList]];
      merged.push(v);
      heads[bestList]++;
      const hasNext = heads[bestList] < lists[bestList].length;
      steps.push({
        tag: 'pop',
        trace: ['Heap\'s minimum is ', B(v), ' (from list ', A(bestList + 1), ') — append it to the output.'],
        state: view(bestList),
      });
      if (hasNext) {
        steps.push({
          tag: 'push',
          trace: ['Its successor ', A(lists[bestList][heads[bestList]]), ' enters the heap in its place.'],
          state: view(bestList),
        });
      }
    }
    steps.push({ tag: 'ret', trace: ['Heap empty — fully merged: ', C(`[${merged.join(' → ')}]`), '.'], state: view() });
    return { steps, result: `[${merged.join(' → ')}]`, resultDetail: `${merged.length} nodes from ${lists.length} lists` };
  },
  note: 'The next output node must be some list\'s current front, so only k candidates matter at any moment — a heap keeps their minimum at hand for O(log k) per node, giving O(N log k) instead of O(N·k) repeated scanning.',
  complexity: { time: 'O(N log k)', space: 'O(k)' },
  brute: {
    label: 'Merge one at a time',
    technique: 'Merge list 1 with list 2, then the result with list 3, and so on — k − 1 two-list merges.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    ListNode* mergeKLists(vector<ListNode*>& lists) {'),
        L('        ListNode* res = nullptr;', 'init'),
        L('        for (ListNode* l : lists)', 'merge'),
        L('            res = mergeTwo(res, l);  // standard two-list merge', 'merge'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public ListNode mergeKLists(ListNode[] lists) {'),
        L('        ListNode res = null;', 'init'),
        L('        for (ListNode l : lists)', 'merge'),
        L('            res = mergeTwo(res, l);  // standard two-list merge', 'merge'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const listStrs = (values.lists ?? '').split(';').map((s) => s.trim()).filter(Boolean);
      if (listStrs.length === 0) return { error: 'Enter at least one list.' };
      if (listStrs.length > 5) return { error: 'Keep it to at most 5 lists.' };
      const lists: number[][] = [];
      for (const s of listStrs) {
        const arr = parseIntArray(s, { maxLen: 8 });
        if (typeof arr === 'string') return { error: `List "${s}": ${arr}` };
        for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return { error: `List "${s}" must be sorted.` };
        lists.push(arr);
      }
      let res: number[] = [];
      let touched = 0;
      const steps: Step[] = [];
      const view = (k: number): ListState => ({
        chains: [
          ...lists.map((l, i) => ({ label: `list ${i + 1}`, items: l.map((v) => ({ v, mark: i < k ? ('dim' as const) : i === k ? ('active' as const) : undefined })) })),
          { label: 'result so far', items: res.map((v) => ({ v, mark: 'good' as const })) },
        ],
        aggs: [{ label: 'nodes touched', value: String(touched), c: 'a' }],
      });
      steps.push({ tag: 'init', trace: ['Fold the lists into one result, merging one list at a time.'], state: view(-1) });
      lists.forEach((l, k) => {
        const out: number[] = [];
        let i = 0;
        let j = 0;
        while (i < res.length || j < l.length) out.push(j >= l.length || (i < res.length && res[i] <= l[j]) ? res[i++] : l[j++]);
        touched += out.length;
        res = out;
        steps.push({ tag: 'merge', trace: ['Merge list ', A(k + 1), ' into the result — walking all ', A(out.length), ' nodes so far.'], state: view(k) });
      });
      steps.push({ tag: 'ret', trace: ['Merged: ', C(res.join(' → ')), ' after touching ', A(touched), ' nodes.'], state: view(lists.length) });
      return { steps, result: `[${res.join(' → ')}]`, resultDetail: `${res.length} nodes from ${lists.length} lists` };
    },
    note: 'Early nodes get re-walked in every later merge, so the total is O(k·N). A min-heap of the k current heads (or pairwise divide-and-conquer merging) brings it down to O(N log k).',
    complexity: { time: 'O(k · N)', space: 'O(1)' },
  },
};

/* ================= 25. Reverse Nodes in k-Group ================= */
const reverseKGroup: ProblemDef = {
  slug: 'reverse-nodes-in-k-group',
  title: 'Reverse Nodes in k-Group',
  category: 'Linked List',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/reverse-nodes-in-k-group/',
  technique: 'Look ahead k nodes to confirm a full group exists, then reverse it in place and reconnect to groupPrev.',
  widget: 'list',
  widgetTitle: 'List, k nodes at a time',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5, 6, 7, 8', wide: true },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* reverseKGroup(ListNode* head, int k) {'),
      L('        ListNode dummy(0, head);', 'init'),
      L('        ListNode* groupPrev = &dummy;', 'init'),
      L('        while (true) {'),
      L('            ListNode* kth = groupPrev;', 'check'),
      L('            for (int i = 0; i < k && kth; i++) kth = kth->next;', 'check'),
      L('            if (!kth) break;', 'stop'),
      L('            ListNode* groupNext = kth->next;', 'check'),
      L('            ListNode* prev = groupNext;', 'reverse'),
      L('            ListNode* curr = groupPrev->next;', 'reverse'),
      L('            while (curr != groupNext) {', 'reverse'),
      L('                ListNode* tmp = curr->next;', 'reverse'),
      L('                curr->next = prev;', 'reverse'),
      L('                prev = curr;', 'reverse'),
      L('                curr = tmp;', 'reverse'),
      L('            }'),
      L('            ListNode* tmp = groupPrev->next;', 'connect'),
      L('            groupPrev->next = kth;', 'connect'),
      L('            groupPrev = tmp;', 'connect'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode reverseKGroup(ListNode head, int k) {'),
      L('        ListNode dummy = new ListNode(0, head);', 'init'),
      L('        ListNode groupPrev = dummy;', 'init'),
      L('        while (true) {'),
      L('            ListNode kth = groupPrev;', 'check'),
      L('            for (int i = 0; i < k && kth != null; i++) kth = kth.next;', 'check'),
      L('            if (kth == null) break;', 'stop'),
      L('            ListNode groupNext = kth.next;', 'check'),
      L('            ListNode prev = groupNext;', 'reverse'),
      L('            ListNode curr = groupPrev.next;', 'reverse'),
      L('            while (curr != groupNext) {', 'reverse'),
      L('                ListNode tmp = curr.next;', 'reverse'),
      L('                curr.next = prev;', 'reverse'),
      L('                prev = curr;', 'reverse'),
      L('                curr = tmp;', 'reverse'),
      L('            }'),
      L('            ListNode tmp = groupPrev.next;', 'connect'),
      L('            groupPrev.next = kth;', 'connect'),
      L('            groupPrev = tmp;', 'connect'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr0 = parseIntArray(values.list, { maxLen: 12 });
    if (typeof arr0 === 'string') return { error: arr0 };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > arr0.length) return { error: `k must be ≤ the list length (${arr0.length}).` };

    const arr = [...arr0];
    const n = arr.length;
    const steps: Step[] = [];
    const view = (hl: number[] = [], done: number): ListState => ({
      chains: [
        {
          label: 'list',
          items: arr.map((v, i) => ({
            v,
            mark: hl.includes(i) ? ('active' as const) : i < done ? ('win' as const) : undefined,
          })),
        },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Reverse the list ', A(`k = ${k}`), ' nodes at a time; a trailing group shorter than k stays untouched.'],
      state: view([], 0),
    });
    let start = 0;
    while (start + k <= n) {
      const groupIdx = Array.from({ length: k }, (_, i) => start + i);
      steps.push({
        tag: 'check',
        trace: ['Look ahead ', A(k), ' nodes: ', A(`[${groupIdx.map((i) => arr[i]).join(', ')}]`), ' is a full group, so it gets reversed.'],
        state: view(groupIdx, start),
      });
      const seg = arr.slice(start, start + k).reverse();
      for (let i = 0; i < k; i++) arr[start + i] = seg[i];
      steps.push({
        tag: 'reverse',
        trace: ['Reverse pointers within the group — it becomes ', B(`[${seg.join(', ')}]`), '.'],
        state: view(groupIdx, start),
      });
      start += k;
      steps.push({
        tag: 'connect',
        trace: ['Reconnect: groupPrev now points at the new head ', B(seg[0]), ', and advances to the group\'s tail, ', B(seg[seg.length - 1]), '.'],
        state: view([], start),
      });
    }
    if (start < n) {
      const rem = Array.from({ length: n - start }, (_, i) => start + i);
      steps.push({
        tag: 'stop',
        trace: ['Only ', F(`${n - start}`), ' node(s) remain — fewer than k, so the lookahead hits the end and they\'re left in original order.'],
        state: view(rem, start),
      });
    }
    steps.push({ tag: 'ret', trace: ['Done: ', C(`[${arr.join(' → ')}]`)], state: view([], n) });
    return { steps, result: `[${arr.join(' → ')}]`, resultDetail: `groups of ${k} reversed` };
  },
  note: 'Scanning ahead k nodes before touching any pointer is what makes a short trailing group safe: if the lookahead falls off the list, nothing has been rewired yet, so that remainder is left exactly as found. groupPrev always tracks the previous group\'s new tail, which is what makes the next group\'s reversal a self-contained, in-place operation.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  brute: {
    label: 'Copy values out and back',
    technique: 'Copy the values into an array, reverse every full block of k in the array, and write the values back into the nodes.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    ListNode* reverseKGroup(ListNode* head, int k) {'),
        L('        vector<int> v;', 'check'),
        L('        for (ListNode* p = head; p; p = p->next) v.push_back(p->val);', 'check'),
        L('        for (int i = 0; i + k <= v.size(); i += k)', 'reverse'),
        L('            reverse(v.begin() + i, v.begin() + i + k);', 'reverse'),
        L('        int i = 0;', 'ret'),
        L('        for (ListNode* p = head; p; p = p->next) p->val = v[i++];', 'ret'),
        L('        return head;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public ListNode reverseKGroup(ListNode head, int k) {'),
        L('        List<Integer> v = new ArrayList<>();', 'check'),
        L('        for (ListNode p = head; p != null; p = p.next) v.add(p.val);', 'check'),
        L('        for (int i = 0; i + k <= v.size(); i += k)', 'reverse'),
        L('            Collections.reverse(v.subList(i, i + k));', 'reverse'),
        L('        int i = 0;', 'ret'),
        L('        for (ListNode p = head; p != null; p = p.next) p.val = v.get(i++);', 'ret'),
        L('        return head;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr0 = parseIntArray(values.list, { maxLen: 12 });
      if (typeof arr0 === 'string') return { error: arr0 };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      if (k > arr0.length) return { error: `k must be ≤ the list length (${arr0.length}).` };
      const arr = [...arr0];
      const n = arr.length;
      const steps: Step[] = [];
      const view = (hl: number[] = [], done = 0): ListState => ({
        chains: [{ label: 'values array', items: arr.map((v, i) => ({ v, mark: hl.includes(i) ? ('active' as const) : i < done ? ('win' as const) : undefined })), broken: true }],
      });
      steps.push({ tag: 'check', trace: ['Copy every value into an array; the node links will not change at all.'], state: view() });
      let i = 0;
      for (; i + k <= n; i += k) {
        const block = arr.slice(i, i + k).reverse();
        arr.splice(i, k, ...block);
        steps.push({ tag: 'reverse', trace: ['Reverse block ', A(`[${i}..${i + k - 1}]`), ' → ', B(block.join(', ')), '.'], state: view([...Array(k)].map((_, t) => i + t), i + k) });
      }
      if (i < n) steps.push({ tag: 'reverse', trace: ['Only ', F(n - i), ' value(s) left — fewer than k, leave them.'], state: view([], i) });
      steps.push({ tag: 'ret', trace: ['Write the values back into the nodes: ', C(arr.join(' → ')), '.'], state: view([], n) });
      return { steps, result: `[${arr.join(' → ')}]`, resultDetail: `groups of ${k} reversed` };
    },
    note: 'Easy to get right, but it uses O(n) extra memory and swaps values rather than nodes — the problem explicitly asks you not to change values. Reversing the links of each group in place keeps O(1) extra space.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

export const linkedList1 = [reverseList, mergeTwoLists, reorderList, removeNth, listCycle, mergeKLists, reverseKGroup];
