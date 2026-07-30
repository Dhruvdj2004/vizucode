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
};

export const linkedList1 = [reverseList, mergeTwoLists, reorderList, removeNth, listCycle, mergeKLists];
