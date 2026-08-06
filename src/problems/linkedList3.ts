// Linked List, part 3 — Striver SDE / Love Babbar sheet staples.
import type { ListState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 300;

/* ================= Middle of the Linked List ================= */
const middleOfList: ProblemDef = {
  slug: 'middle-of-the-linked-list',
  title: 'Middle of the Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/middle-of-the-linked-list/',
  technique: 'Fast moves two steps per slow step — when fast falls off, slow is at the middle.',
  widget: 'list',
  widgetTitle: 'Linked list',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* middleNode(ListNode* head) {'),
      L('        ListNode *slow = head, *fast = head;', 'init'),
      L('        while (fast && fast->next) {', 'loop'),
      L('            slow = slow->next;', 'step'),
      L('            fast = fast->next->next;', 'step'),
      L('        }'),
      L('        return slow;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode middleNode(ListNode head) {'),
      L('        ListNode slow = head, fast = head;', 'init'),
      L('        while (fast != null && fast.next != null) {', 'loop'),
      L('            slow = slow.next;', 'step'),
      L('            fast = fast.next.next;', 'step'),
      L('        }'),
      L('        return slow;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 12 });
    if (typeof vals === 'string') return { error: vals };
    const steps: Step[] = [];
    let slow = 0;
    let fast = 0;
    const st = (): ListState => ({
      chains: [
        {
          label: 'head',
          items: vals.map((v, i) => ({ v, mark: i === slow ? ('active' as const) : i === fast ? ('good' as const) : undefined })),
        },
      ],
      ptrs: [
        { name: 'slow', chain: 0, i: slow, c: 'a' },
        ...(fast < vals.length ? [{ name: 'fast', chain: 0, i: fast, c: 'b' as const }] : []),
      ],
      aggs: [{ label: 'steps taken', value: `slow ${slow}, fast ${fast}`, c: 'b' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Both pointers start at the head. If ', B('fast'), ' always covers twice the ground of ', A('slow'), ', then when fast reaches the end slow has covered exactly half.'],
      state: st(),
    });
    while (fast < vals.length && fast + 1 < vals.length) {
      slow += 1;
      fast += 2;
      steps.push({
        tag: 'step',
        trace: ['slow → node ', A(vals[slow]), ' (index ', A(slow), '); fast → ', fast < vals.length ? ['node ', B(vals[fast]), ' (index ', B(fast), ')'].join('') : B('past the end'), '.'],
        state: st(),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['fast can no longer take two steps, so slow sits at the middle: ', C(vals[slow]), '.'],
      state: {
        chains: [{ label: 'head', items: vals.map((v, i) => ({ v, mark: i === slow ? ('final' as const) : undefined })) }],
        aggs: [{ label: 'middle', value: String(vals[slow]), c: 'c' }],
      },
    });
    return { steps, result: String(vals[slow]), resultDetail: `index ${slow} of ${vals.length}` };
  },
  note: 'Counting the length first and walking n/2 nodes also works, but needs two passes — and in a real interview the follow-up is usually a stream you can only read once. With an even length this returns the second middle, which is exactly what the problem asks for.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Linked List Cycle II ================= */
const cycleII: ProblemDef = {
  slug: 'linked-list-cycle-ii',
  title: 'Linked List Cycle II',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/linked-list-cycle-ii/',
  technique: "Floyd: detect the meeting point, then walk from the head at equal speed to the cycle's entrance.",
  widget: 'list',
  widgetTitle: 'Linked list with a cycle',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '3, 2, 0, -4', wide: true },
    { key: 'pos', label: 'Tail links back to index (−1 = no cycle)', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* detectCycle(ListNode* head) {'),
      L('        ListNode *slow = head, *fast = head;', 'init'),
      L('        while (fast && fast->next) {', 'loop'),
      L('            slow = slow->next;', 'step'),
      L('            fast = fast->next->next;', 'step'),
      L('            if (slow == fast) {', 'meet'),
      L('                slow = head;', 'reset'),
      L('                while (slow != fast) {', 'walk'),
      L('                    slow = slow->next;', 'walk'),
      L('                    fast = fast->next;', 'walk'),
      L('                }'),
      L('                return slow;', 'entry'),
      L('            }'),
      L('        }'),
      L('        return nullptr;', 'none'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Solution {'),
      L('    public ListNode detectCycle(ListNode head) {'),
      L('        ListNode slow = head, fast = head;', 'init'),
      L('        while (fast != null && fast.next != null) {', 'loop'),
      L('            slow = slow.next;', 'step'),
      L('            fast = fast.next.next;', 'step'),
      L('            if (slow == fast) {', 'meet'),
      L('                slow = head;', 'reset'),
      L('                while (slow != fast) {', 'walk'),
      L('                    slow = slow.next;', 'walk'),
      L('                    fast = fast.next;', 'walk'),
      L('                }'),
      L('                return slow;', 'entry'),
      L('            }'),
      L('        }'),
      L('        return null;', 'none'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    const pos = parseInt1(values.pos, 'Link-back index', { min: -1 });
    if (typeof pos === 'string') return { error: pos };
    if (pos >= vals.length) return { error: `Link-back index must be < ${vals.length} (or −1 for no cycle).` };
    const n = vals.length;
    const next = (i: number) => (i + 1 < n ? i + 1 : pos >= 0 ? pos : -1);
    const steps: Step[] = [];
    let slow = 0;
    let fast = 0;
    const st = (mark?: Record<number, 'active' | 'good' | 'final' | 'win' | 'dim'>): ListState => ({
      chains: [
        {
          label: pos >= 0 ? `head (tail loops back to index ${pos})` : 'head',
          items: vals.map((v, i) => ({ v, mark: mark?.[i] ?? (pos >= 0 && i >= pos ? ('win' as const) : undefined) })),
        },
      ],
      ptrs: [
        ...(slow >= 0 ? [{ name: 'slow', chain: 0, i: slow, c: 'a' as const }] : []),
        ...(fast >= 0 ? [{ name: 'fast', chain: 0, i: fast, c: 'b' as const }] : []),
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        pos >= 0
          ? ['The tail points back to index ', A(pos), ', so the list has a loop. Two pointers at different speeds must eventually collide inside it.'].join('')
          : 'No link-back, so this list ends normally — fast will simply run off the end.',
      ],
      state: st(),
    });
    let met = false;
    let guard = 0;
    while (fast >= 0 && next(fast) >= 0 && guard < 60) {
      slow = next(slow);
      fast = next(next(fast));
      steps.push({
        tag: 'step',
        trace: ['slow → index ', A(slow), ' (', A(vals[slow]), '); fast → index ', B(fast), ' (', B(vals[fast]), ').'],
        state: st(),
      });
      if (slow === fast) {
        met = true;
        steps.push({
          tag: 'meet',
          trace: ['They collide at index ', B(slow), ' — a loop definitely exists. This is ', F('not'), ' yet the entrance, though.'],
          state: st({ [slow]: 'active' }),
        });
        break;
      }
      guard++;
      if (steps.length > MAX_STEPS) break;
    }
    if (!met) {
      steps.push({
        tag: 'none',
        trace: ['fast reached the end of the list — there is ', C('no cycle'), '.'],
        state: { chains: [{ label: 'head', items: vals.map((v) => ({ v })) }] },
      });
      return { steps, result: 'null', resultDetail: 'no cycle' };
    }
    slow = 0;
    steps.push({
      tag: 'reset',
      trace: [
        'Now send slow back to the head and move ', A('both'), ' one step at a time. The distance head→entrance equals the distance meeting-point→entrance, so they meet exactly there.',
      ],
      state: st({ [fast]: 'good' }),
    });
    guard = 0;
    while (slow !== fast && guard < 60) {
      slow = next(slow);
      fast = next(fast);
      steps.push({ tag: 'walk', trace: ['Both step once: slow at ', A(slow), ', fast at ', B(fast), '.'], state: st() });
      guard++;
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'entry',
      trace: ['They converge at index ', C(slow), ' — node ', C(vals[slow]), ' is where the cycle begins.'],
      state: st({ [slow]: 'final' }),
    });
    return { steps, result: String(vals[slow]), resultDetail: `cycle starts at index ${slow}` };
  },
  note: 'The proof is short arithmetic: if the entrance is L nodes from the head and the pointers meet k nodes into the cycle, then slow travelled L+k and fast 2(L+k), so the extra L+k is a whole number of laps — meaning k nodes past the meeting point is L nodes from the head. That is why phase two works at equal speed.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Intersection of Two Linked Lists ================= */
const intersectionLists: ProblemDef = {
  slug: 'intersection-of-two-linked-lists',
  title: 'Intersection of Two Linked Lists',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
  technique: 'Switch each pointer to the other list at the end — both then travel a+c+b and meet.',
  widget: 'list',
  widgetTitle: 'Two lists sharing a tail',
  inputs: [
    { key: 'a', label: 'List A prefix', defaultValue: '4, 1', wide: true },
    { key: 'b', label: 'List B prefix', defaultValue: '5, 6, 1', wide: true },
    { key: 'shared', label: 'Shared tail (empty = no intersection)', defaultValue: '8, 4, 5', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* getIntersectionNode(ListNode* a, ListNode* b) {'),
      L('        ListNode *p = a, *q = b;', 'init'),
      L('        while (p != q) {', 'loop'),
      L('            p = p ? p->next : b;', 'stepP'),
      L('            q = q ? q->next : a;', 'stepQ'),
      L('        }'),
      L('        return p;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Solution {'),
      L('    public ListNode getIntersectionNode(ListNode a, ListNode b) {'),
      L('        ListNode p = a, q = b;', 'init'),
      L('        while (p != q) {', 'loop'),
      L('            p = (p == null) ? b : p.next;', 'stepP'),
      L('            q = (q == null) ? a : q.next;', 'stepQ'),
      L('        }'),
      L('        return p;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parseOpt = (s: string) => {
      if (!(s ?? '').trim()) return [] as number[];
      return parseIntArray(s, { maxLen: 6 });
    };
    const aPre = parseOpt(values.a);
    if (typeof aPre === 'string') return { error: aPre };
    const bPre = parseOpt(values.b);
    if (typeof bPre === 'string') return { error: bPre };
    const shared = parseOpt(values.shared);
    if (typeof shared === 'string') return { error: shared };
    if (aPre.length === 0 && bPre.length === 0 && shared.length === 0) return { error: 'Both lists cannot be empty.' };

    // Node identity: prefix nodes are unique, shared nodes are the same objects.
    const listA = [...aPre.map((v, i) => ({ v, id: `a${i}` })), ...shared.map((v, i) => ({ v, id: `s${i}` }))];
    const listB = [...bPre.map((v, i) => ({ v, id: `b${i}` })), ...shared.map((v, i) => ({ v, id: `s${i}` }))];
    const steps: Step[] = [];
    let p = 0; // index into listA-then-listB walk
    let q = 0;
    const nodeP = () => (p < listA.length ? listA[p] : p < listA.length + listB.length ? listB[p - listA.length] : null);
    const nodeQ = () => (q < listB.length ? listB[q] : q < listB.length + listA.length ? listA[q - listB.length] : null);

    const st = (): ListState => {
      const np = nodeP();
      const nq = nodeQ();
      const markFor = (id: string) => {
        if (np && nq && np.id === nq.id && id === np.id) return 'final' as const;
        if (np && id === np.id) return 'active' as const;
        if (nq && id === nq.id) return 'good' as const;
        return id.startsWith('s') ? ('win' as const) : undefined;
      };
      return {
        chains: [
          { label: 'list A', items: listA.map((n) => ({ v: n.v, mark: markFor(n.id) })) },
          { label: 'list B', items: listB.map((n) => ({ v: n.v, mark: markFor(n.id) })) },
        ],
        aggs: [
          { label: 'p travelled', value: String(p), c: 'a' },
          { label: 'q travelled', value: String(q), c: 'b' },
        ],
      };
    };
    steps.push({
      tag: 'init',
      trace: [
        'The lists have different lengths, so a naive lockstep walk misaligns. The trick: when a pointer runs off one list, restart it on the ', A('other'), ' — both then cover the same total distance.',
      ],
      state: st(),
    });
    const total = listA.length + listB.length;
    let guard = 0;
    while (guard <= total) {
      const np = nodeP();
      const nq = nodeQ();
      if (np && nq && np.id === nq.id) break;
      if (np === null && nq === null) break;
      p++;
      q++;
      const np2 = nodeP();
      const nq2 = nodeQ();
      steps.push({
        tag: 'stepP',
        tag2: 'stepQ',
        trace: [
          'p → ', np2 ? A(np2.v) : F('switches to list B'), '; q → ', nq2 ? B(nq2.v) : F('switches to list A'), '.',
        ],
        state: st(),
      });
      guard++;
      if (steps.length > MAX_STEPS) break;
    }
    const np = nodeP();
    const nq = nodeQ();
    const hit = np && nq && np.id === nq.id ? np : null;
    steps.push({
      tag: 'ret',
      trace: hit
        ? ['Both pointers land on the same node — the lists merge at ', C(hit.v), '.']
        : ['Both pointers hit the end at the same moment without ever coinciding — the lists ', C('never intersect'), '.'],
      state: st(),
    });
    return { steps, result: hit ? String(hit.v) : 'null', resultDetail: hit ? 'intersection node' : 'no intersection' };
  },
  note: 'Both pointers walk a + c + b nodes (prefix A, shared tail, prefix B), which is symmetric — so they arrive at the shared node simultaneously no matter how lopsided the lists are. If there is no intersection, both reach null on the same step, so the same loop returns null with no special case.',
  complexity: { time: 'O(m + n)', space: 'O(1)' },
};

/* ================= Remove Duplicates from Sorted List ================= */
const removeDupSorted: ProblemDef = {
  slug: 'remove-duplicates-from-sorted-list',
  title: 'Remove Duplicates from Sorted List',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/',
  technique: 'Sorted means duplicates are adjacent — unlink any node equal to the one before it.',
  widget: 'list',
  widgetTitle: 'Sorted linked list',
  inputs: [{ key: 'list', label: 'Sorted values', defaultValue: '1, 1, 2, 3, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* deleteDuplicates(ListNode* head) {'),
      L('        ListNode* cur = head;', 'init'),
      L('        while (cur && cur->next) {', 'loop'),
      L('            if (cur->val == cur->next->val)', 'dup'),
      L('                cur->next = cur->next->next;', 'unlink'),
      L('            else'),
      L('                cur = cur->next;', 'advance'),
      L('        }'),
      L('        return head;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode deleteDuplicates(ListNode head) {'),
      L('        ListNode cur = head;', 'init'),
      L('        while (cur != null && cur.next != null) {', 'loop'),
      L('            if (cur.val == cur.next.val)', 'dup'),
      L('                cur.next = cur.next.next;', 'unlink'),
      L('            else'),
      L('                cur = cur.next;', 'advance'),
      L('        }'),
      L('        return head;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 12 });
    if (typeof vals === 'string') return { error: vals };
    for (let i = 1; i < vals.length; i++) if (vals[i] < vals[i - 1]) return { error: 'The list must be sorted ascending.' };
    const alive = vals.map(() => true);
    const steps: Step[] = [];
    let cur = 0;
    const nextAlive = (i: number) => {
      let j = i + 1;
      while (j < vals.length && !alive[j]) j++;
      return j < vals.length ? j : -1;
    };
    const st = (mark?: Record<number, 'active' | 'good' | 'final' | 'dim'>): ListState => ({
      chains: [
        {
          label: 'list',
          items: vals.map((v, i) => ({ v, mark: mark?.[i] ?? (!alive[i] ? ('dim' as const) : undefined) })),
        },
      ],
      ptrs: [{ name: 'cur', chain: 0, i: cur, c: 'a' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Because the list is sorted, equal values are always ', A('neighbours'), ' — one pass comparing each node with the next is enough.'],
      state: st(),
    });
    let guard = 0;
    while (cur >= 0 && nextAlive(cur) >= 0 && guard < 60) {
      const nxt = nextAlive(cur);
      if (vals[cur] === vals[nxt]) {
        steps.push({
          tag: 'dup',
          trace: ['Node ', A(vals[nxt]), ' repeats the current node ', A(vals[cur]), ' — it has to go.'],
          state: st({ [cur]: 'active', [nxt]: 'active' }),
        });
        alive[nxt] = false;
        steps.push({
          tag: 'unlink',
          trace: ['Point cur past it: ', B(vals[cur]), ' now links to ', nextAlive(cur) >= 0 ? B(vals[nextAlive(cur)]) : B('null'), '.'],
          state: st({ [cur]: 'good' }),
        });
      } else {
        steps.push({
          tag: 'advance',
          trace: [B(vals[cur]), ' ≠ ', B(vals[nxt]), ' — keep both and step forward.'],
          state: st({ [cur]: 'good' }),
        });
        cur = nxt;
      }
      guard++;
      if (steps.length > MAX_STEPS) break;
    }
    const out = vals.filter((_, i) => alive[i]);
    steps.push({
      tag: 'ret',
      trace: ['Every run collapsed to a single node: ', C(`[${out.join(' → ')}]`), '.'],
      state: {
        chains: [{ label: 'list', items: vals.map((v, i) => ({ v, mark: alive[i] ? ('final' as const) : ('dim' as const) })) }],
      },
    });
    return { steps, result: `[${out.join(' → ')}]` };
  },
  note: 'Note that cur does not advance after an unlink — the new next might be another duplicate of the same value. Advancing unconditionally is the classic bug, and it silently survives inputs like [1,1,2] while failing on [1,1,1].',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Remove Duplicates from Sorted List II ================= */
const removeDupSortedII: ProblemDef = {
  slug: 'remove-duplicates-from-sorted-list-ii',
  title: 'Remove Duplicates from Sorted List II',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/',
  technique: 'Delete every node in a repeated run — a dummy head keeps the first node deletable.',
  widget: 'list',
  widgetTitle: 'Sorted linked list',
  inputs: [{ key: 'list', label: 'Sorted values', defaultValue: '1, 2, 3, 3, 4, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* deleteDuplicates(ListNode* head) {'),
      L('        ListNode dummy(0, head), *prev = &dummy;', 'dummy'),
      L('        ListNode* cur = head;'),
      L('        while (cur) {', 'loop'),
      L('            if (cur->next && cur->val == cur->next->val) {', 'run'),
      L('                int v = cur->val;'),
      L('                while (cur && cur->val == v) cur = cur->next;', 'skip'),
      L('                prev->next = cur;', 'skip'),
      L('            } else {'),
      L('                prev = cur;', 'keep'),
      L('                cur = cur->next;', 'keep'),
      L('            }'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode deleteDuplicates(ListNode head) {'),
      L('        ListNode dummy = new ListNode(0, head), prev = dummy;', 'dummy'),
      L('        ListNode cur = head;'),
      L('        while (cur != null) {', 'loop'),
      L('            if (cur.next != null && cur.val == cur.next.val) {', 'run'),
      L('                int v = cur.val;'),
      L('                while (cur != null && cur.val == v) cur = cur.next;', 'skip'),
      L('                prev.next = cur;', 'skip'),
      L('            } else {'),
      L('                prev = cur;', 'keep'),
      L('                cur = cur.next;', 'keep'),
      L('            }'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 12 });
    if (typeof vals === 'string') return { error: vals };
    for (let i = 1; i < vals.length; i++) if (vals[i] < vals[i - 1]) return { error: 'The list must be sorted ascending.' };
    const alive = vals.map(() => true);
    const steps: Step[] = [];
    const st = (cur: number, mark?: Record<number, 'active' | 'good' | 'final' | 'dim'>): ListState => ({
      chains: [
        { label: 'list', items: vals.map((v, i) => ({ v, mark: mark?.[i] ?? (!alive[i] ? ('dim' as const) : undefined) })) },
      ],
      ptrs: cur < vals.length ? [{ name: 'cur', chain: 0, i: cur, c: 'a' }] : [],
      aggs: [{ label: 'kept so far', value: vals.filter((_, i) => alive[i] && i < cur).join(', ') || '—', c: 'b' }],
    });
    steps.push({
      tag: 'dummy',
      trace: ['A ', A('dummy'), ' node in front of the head means even the first real node can be deleted without a special case.'],
      state: st(0),
    });
    let i = 0;
    while (i < vals.length) {
      let j = i;
      while (j + 1 < vals.length && vals[j + 1] === vals[i]) j++;
      if (j > i) {
        steps.push({
          tag: 'run',
          trace: ['Value ', A(vals[i]), ' repeats ', A(j - i + 1), ' times — this version deletes ', F('all'), ' of them, not just the extras.'],
          state: st(i, Object.fromEntries([...Array(j - i + 1)].map((_, k) => [i + k, 'active' as const]))),
        });
        for (let k = i; k <= j; k++) alive[k] = false;
        steps.push({
          tag: 'skip',
          trace: ['Skip past the whole run and relink prev to ', j + 1 < vals.length ? B(vals[j + 1]) : B('null'), '.'],
          state: st(Math.min(j + 1, vals.length)),
        });
      } else {
        steps.push({
          tag: 'keep',
          trace: [B(vals[i]), ' appears only once — keep it and move on.'],
          state: st(i, { [i]: 'good' }),
        });
      }
      i = j + 1;
      if (steps.length > MAX_STEPS) break;
    }
    const out = vals.filter((_, k) => alive[k]);
    steps.push({
      tag: 'ret',
      trace: out.length ? ['Only the values that appeared exactly once survive: ', C(`[${out.join(' → ')}]`), '.'] : ['Every value repeated — the list is now ', C('empty'), '.'],
      state: {
        chains: [{ label: 'list', items: vals.map((v, k) => ({ v, mark: alive[k] ? ('final' as const) : ('dim' as const) })) }],
      },
    });
    return { steps, result: out.length ? `[${out.join(' → ')}]` : '[]' };
  },
  note: 'The dummy head is what makes this materially harder than version I: here the head itself can be deleted, so without a stable node in front you would need a separate branch for "the answer starts later". prev only advances on a kept node, which is what lets it bridge across an entire deleted run.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Rotate List ================= */
const rotateList: ProblemDef = {
  slug: 'rotate-list',
  title: 'Rotate List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/rotate-list/',
  technique: 'Close the list into a ring, then reopen it k % n nodes before the old tail.',
  widget: 'list',
  widgetTitle: 'Linked list',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true },
    { key: 'k', label: 'Rotate right by k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* rotateRight(ListNode* head, int k) {'),
      L('        if (!head || !head->next || k == 0) return head;'),
      L('        int n = 1; ListNode* tail = head;'),
      L('        while (tail->next) { tail = tail->next; n++; }', 'count'),
      L('        tail->next = head;              // close the ring', 'ring'),
      L('        k %= n;', 'mod'),
      L('        int steps = n - k;', 'mod'),
      L('        ListNode* newTail = tail;'),
      L('        while (steps--) newTail = newTail->next;', 'walk'),
      L('        ListNode* newHead = newTail->next;', 'cut'),
      L('        newTail->next = nullptr;        // reopen', 'cut'),
      L('        return newHead;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode rotateRight(ListNode head, int k) {'),
      L('        if (head == null || head.next == null || k == 0) return head;'),
      L('        int n = 1; ListNode tail = head;'),
      L('        while (tail.next != null) { tail = tail.next; n++; }', 'count'),
      L('        tail.next = head;               // close the ring', 'ring'),
      L('        k %= n;', 'mod'),
      L('        int steps = n - k;', 'mod'),
      L('        ListNode newTail = tail;'),
      L('        while (steps-- > 0) newTail = newTail.next;', 'walk'),
      L('        ListNode newHead = newTail.next;', 'cut'),
      L('        newTail.next = null;            // reopen', 'cut'),
      L('        return newHead;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    const k0 = parseInt1(values.k, 'k', { min: 0, max: 100 });
    if (typeof k0 === 'string') return { error: k0 };
    const n = vals.length;
    const steps: Step[] = [];
    const st = (mark: Record<number, 'active' | 'good' | 'final' | 'dim' | 'win'> = {}, label = 'list', items = vals): ListState => ({
      chains: [{ label, items: items.map((v, i) => ({ v, mark: mark[i] })) }],
    });
    steps.push({
      tag: 'count',
      trace: ['Walk to the tail, counting: the list has ', A(n), ' node(s), tail = ', A(vals[n - 1]), '.'],
      state: st({ [n - 1]: 'active' }),
    });
    steps.push({
      tag: 'ring',
      trace: ['Link the tail back to the head, turning the list into a ', B('ring'), '. Now "rotating" is just choosing where to cut it open.'],
      state: st(Object.fromEntries(vals.map((_, i) => [i, 'win' as const]))),
    });
    const k = k0 % n;
    steps.push({
      tag: 'mod',
      trace: [
        'Rotating by ', A(k0), ' is the same as rotating by ', B(k), ' (', A(k0), ' mod ', A(n), ') — full laps change nothing. So the new tail is ', B(n - k), ' step(s) along.',
      ],
      state: st(),
    });
    const newTail = (n - k - 1 + n) % n;
    steps.push({
      tag: 'walk',
      trace: ['Walk ', A(n - k), ' node(s) from the head — the new tail is ', B(vals[newTail]), ' at index ', B(newTail), '.'],
      state: st({ [newTail]: 'good' }),
    });
    const newHead = (newTail + 1) % n;
    const out = [...vals.slice(newHead), ...vals.slice(0, newHead)];
    steps.push({
      tag: 'cut',
      trace: ['Cut after it: the node just past the new tail, ', A(vals[newHead]), ', becomes the new head.'],
      state: st({ [newTail]: 'good', [newHead]: 'active' }),
    });
    steps.push({
      tag: 'ret',
      trace: ['Rotated list: ', C(`[${out.join(' → ')}]`), '.'],
      state: st(Object.fromEntries(out.map((_, i) => [i, 'final' as const])), 'rotated', out),
    });
    return { steps, result: `[${out.join(' → ')}]` };
  },
  note: 'Taking k modulo n first is essential — the problem allows k far larger than the list, and walking k literal steps would time out. Closing the ring turns two separate relink operations into one clean cut, which is why this beats the "find the split, then splice" version on both code length and off-by-one risk.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Sort List ================= */
const sortList: ProblemDef = {
  slug: 'sort-list',
  title: 'Sort List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sort-list/',
  technique: 'Merge sort: split at the middle with slow/fast, sort both halves, merge them.',
  widget: 'list',
  widgetTitle: 'Linked list',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '4, 2, 1, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* sortList(ListNode* head) {'),
      L('        if (!head || !head->next) return head;', 'base'),
      L('        ListNode *slow = head, *fast = head->next;'),
      L('        while (fast && fast->next) {', 'split'),
      L('            slow = slow->next; fast = fast->next->next;', 'split'),
      L('        }'),
      L('        ListNode* mid = slow->next;'),
      L('        slow->next = nullptr;           // cut in two', 'cut'),
      L('        return merge(sortList(head), sortList(mid));', 'recurse', 'ret'),
      L('    }'),
      L('    ListNode* merge(ListNode* a, ListNode* b) {', 'merge'),
      L('        ListNode dummy, *t = &dummy;'),
      L('        while (a && b)', 'merge'),
      L('            if (a->val <= b->val) { t->next = a; a = a->next; t = t->next; }', 'merge'),
      L('            else { t->next = b; b = b->next; t = t->next; }', 'merge'),
      L('        t->next = a ? a : b;', 'merge'),
      L('        return dummy.next;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode sortList(ListNode head) {'),
      L('        if (head == null || head.next == null) return head;', 'base'),
      L('        ListNode slow = head, fast = head.next;'),
      L('        while (fast != null && fast.next != null) {', 'split'),
      L('            slow = slow.next; fast = fast.next.next;', 'split'),
      L('        }'),
      L('        ListNode mid = slow.next;'),
      L('        slow.next = null;               // cut in two', 'cut'),
      L('        return merge(sortList(head), sortList(mid));', 'recurse', 'ret'),
      L('    }'),
      L('    ListNode merge(ListNode a, ListNode b) {', 'merge'),
      L('        ListNode dummy = new ListNode(), t = dummy;'),
      L('        while (a != null && b != null) {', 'merge'),
      L('            if (a.val <= b.val) { t.next = a; a = a.next; }', 'merge'),
      L('            else { t.next = b; b = b.next; }', 'merge'),
      L('            t = t.next;'),
      L('        }'),
      L('        t.next = (a != null) ? a : b;', 'merge'),
      L('        return dummy.next;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 8 });
    if (typeof vals === 'string') return { error: vals };
    const steps: Step[] = [];
    const show = (chains: { label: string; items: number[]; mark?: 'active' | 'good' | 'final' | 'win' }[]): ListState => ({
      chains: chains.map((c) => ({ label: c.label, items: c.items.map((v) => ({ v, mark: c.mark })) })),
    });
    steps.push({
      tag: 'base',
      trace: ['Merge sort suits a linked list: splitting is O(1) relinking and merging needs no extra array — unlike quicksort, which needs random access.'],
      state: show([{ label: 'unsorted', items: vals }]),
    });

    const sort = (list: number[], depth: number): number[] => {
      if (list.length <= 1) return list;
      const mid = Math.ceil(list.length / 2);
      const left = list.slice(0, mid);
      const right = list.slice(mid);
      steps.push({
        tag: 'split',
        trace: ['Find the middle with the slow/fast walk, then ', A('cut'), ': [', A(left.join(' ')), '] and [', B(right.join(' ')), '].'],
        state: show([
          { label: `left (depth ${depth})`, items: left, mark: 'active' },
          { label: `right (depth ${depth})`, items: right, mark: 'good' },
        ]),
      });
      steps.push({
        tag: 'cut',
        trace: ['Setting slow->next to null severs the list into two independent chains — nothing is copied.'],
        state: show([
          { label: 'left', items: left, mark: 'active' },
          { label: 'right', items: right, mark: 'good' },
        ]),
      });
      const sl = sort(left, depth + 1);
      const sr = sort(right, depth + 1);
      steps.push({
        tag: 'recurse',
        trace: ['Both halves are now sorted: [', A(sl.join(' ')), '] and [', B(sr.join(' ')), ']. Merge them.'],
        state: show([
          { label: 'sorted left', items: sl, mark: 'active' },
          { label: 'sorted right', items: sr, mark: 'good' },
        ]),
      });
      const out: number[] = [];
      let i = 0;
      let j = 0;
      while (i < sl.length && j < sr.length) {
        if (sl[i] <= sr[j]) out.push(sl[i++]);
        else out.push(sr[j++]);
      }
      while (i < sl.length) out.push(sl[i++]);
      while (j < sr.length) out.push(sr[j++]);
      steps.push({
        tag: 'merge',
        trace: ['Repeatedly take the smaller head — merged into [', B(out.join(' ')), '].'],
        state: show([{ label: 'merged', items: out, mark: 'win' }]),
      });
      return out;
    };

    const sorted = sort(vals, 0);
    steps.push({
      tag: 'ret',
      trace: ['Fully sorted: ', C(`[${sorted.join(' → ')}]`), '.'],
      state: show([{ label: 'sorted', items: sorted, mark: 'final' }]),
    });
    return { steps, result: `[${sorted.join(' → ')}]` };
  },
  note: 'This is the O(n log n) sort the problem demands, and the only common one that reaches O(1) extra space on a list — recursion still costs O(log n) stack, so a strict constant-space answer needs the bottom-up iterative variant. Cutting with slow->next = null before recursing is mandatory; forget it and the two halves stay joined and recurse forever.',
  complexity: { time: 'O(n log n)', space: 'O(log n) recursion' },
};

/* ================= Partition List ================= */
const partitionList: ProblemDef = {
  slug: 'partition-list',
  title: 'Partition List',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/partition-list/',
  technique: 'Build two separate chains — smaller and not-smaller — then join them.',
  widget: 'list',
  widgetTitle: 'List being split around x',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '1, 4, 3, 2, 5, 2', wide: true },
    { key: 'x', label: 'Partition value x', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* partition(ListNode* head, int x) {'),
      L('        ListNode lo, hi, *l = &lo, *h = &hi;', 'init'),
      L('        while (head) {', 'loop'),
      L('            if (head->val < x) { l->next = head; l = l->next; }', 'small'),
      L('            else { h->next = head; h = h->next; }', 'big'),
      L('            head = head->next;'),
      L('        }'),
      L('        h->next = nullptr;', 'join'),
      L('        l->next = hi.next;', 'join'),
      L('        return lo.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode partition(ListNode head, int x) {'),
      L('        ListNode lo = new ListNode(), hi = new ListNode();'),
      L('        ListNode l = lo, h = hi;', 'init'),
      L('        while (head != null) {', 'loop'),
      L('            if (head.val < x) { l.next = head; l = l.next; }', 'small'),
      L('            else { h.next = head; h = h.next; }', 'big'),
      L('            head = head.next;'),
      L('        }'),
      L('        h.next = null;', 'join'),
      L('        l.next = hi.next;', 'join'),
      L('        return lo.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 12 });
    if (typeof vals === 'string') return { error: vals };
    const x = parseInt1(values.x, 'x');
    if (typeof x === 'string') return { error: x };
    const steps: Step[] = [];
    const small: number[] = [];
    const big: number[] = [];
    const st = (i: number): ListState => ({
      chains: [
        { label: 'remaining', items: vals.slice(i).map((v) => ({ v, mark: undefined })) },
        { label: `< ${x}`, items: small.map((v) => ({ v, mark: 'good' as const })) },
        { label: `≥ ${x}`, items: big.map((v) => ({ v, mark: 'win' as const })) },
      ],
      ptrs: i < vals.length ? [{ name: 'cur', chain: 0, i: 0, c: 'a' }] : [],
    });
    steps.push({
      tag: 'init',
      trace: ['Two dummy-headed chains: one collects nodes ', B(`< ${x}`), ', the other everything else. No node is ever copied — only relinked.'],
      state: st(0),
    });
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] < x) {
        small.push(vals[i]);
        steps.push({
          tag: 'small',
          trace: [A(vals[i]), ' < ', A(x), ' — append it to the smaller chain.'],
          state: st(i + 1),
        });
      } else {
        big.push(vals[i]);
        steps.push({
          tag: 'big',
          trace: [A(vals[i]), ' ≥ ', A(x), ' — append it to the other chain.'],
          state: st(i + 1),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'join',
      trace: ['Terminate the second chain, then hook the first chain\'s tail onto its head.'],
      state: st(vals.length),
    });
    const out = [...small, ...big];
    steps.push({
      tag: 'ret',
      trace: ['Partitioned, with the original order preserved inside each group: ', C(`[${out.join(' → ')}]`), '.'],
      state: { chains: [{ label: 'result', items: out.map((v) => ({ v, mark: 'final' as const })) }] },
    });
    return { steps, result: `[${out.join(' → ')}]` };
  },
  note: 'Appending to the end of each chain (rather than the front) is what preserves relative order, which the problem explicitly requires. Setting h->next = null before joining is easy to forget and leaves a cycle: the last "big" node would still point at whatever followed it originally.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Reverse Linked List II ================= */
const reverseListII: ProblemDef = {
  slug: 'reverse-linked-list-ii',
  title: 'Reverse Linked List II',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reverse-linked-list-ii/',
  technique: 'Walk to position left, then repeatedly lift the next node to the front of the sublist.',
  widget: 'list',
  widgetTitle: 'Linked list',
  inputs: [
    { key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4, 5', wide: true },
    { key: 'left', label: 'left (1-based)', defaultValue: '2' },
    { key: 'right', label: 'right (1-based)', defaultValue: '4' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* reverseBetween(ListNode* head, int left, int right) {'),
      L('        ListNode dummy(0, head), *prev = &dummy;', 'dummy'),
      L('        for (int i = 1; i < left; i++) prev = prev->next;', 'walk'),
      L('        ListNode* cur = prev->next;'),
      L('        for (int i = 0; i < right - left; i++) {', 'loop'),
      L('            ListNode* move = cur->next;', 'lift'),
      L('            cur->next = move->next;', 'lift'),
      L('            move->next = prev->next;', 'front'),
      L('            prev->next = move;', 'front'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode reverseBetween(ListNode head, int left, int right) {'),
      L('        ListNode dummy = new ListNode(0, head), prev = dummy;', 'dummy'),
      L('        for (int i = 1; i < left; i++) prev = prev.next;', 'walk'),
      L('        ListNode cur = prev.next;'),
      L('        for (int i = 0; i < right - left; i++) {', 'loop'),
      L('            ListNode move = cur.next;', 'lift'),
      L('            cur.next = move.next;', 'lift'),
      L('            move.next = prev.next;', 'front'),
      L('            prev.next = move;', 'front'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 10 });
    if (typeof vals === 'string') return { error: vals };
    const left = parseInt1(values.left, 'left', { min: 1 });
    if (typeof left === 'string') return { error: left };
    const right = parseInt1(values.right, 'right', { min: 1 });
    if (typeof right === 'string') return { error: right };
    if (left > right) return { error: 'left must be ≤ right.' };
    if (right > vals.length) return { error: `right must be ≤ the list length (${vals.length}).` };

    const cur = [...vals];
    const steps: Step[] = [];
    const lo = left - 1;
    const hi = right - 1;
    const st = (mark: Record<number, 'active' | 'good' | 'final' | 'win' | 'dim'> = {}): ListState => ({
      chains: [
        {
          label: 'list',
          items: cur.map((v, i) => ({ v, mark: mark[i] ?? (i >= lo && i <= hi ? ('win' as const) : undefined) })),
        },
      ],
      aggs: [{ label: 'reversing positions', value: `${left}…${right}`, c: 'a' }],
    });
    steps.push({
      tag: 'dummy',
      trace: ['A dummy in front means the case ', A('left = 1'), ' — where the head itself moves — needs no special handling.'],
      state: st(),
    });
    steps.push({
      tag: 'walk',
      trace: ['Walk ', A(left - 1), ' step(s) so prev sits just before position ', A(left), ' (node ', A(cur[lo]), ').'],
      state: st(lo > 0 ? { [lo - 1]: 'active' } : {}),
    });
    for (let i = 0; i < hi - lo; i++) {
      const move = cur[lo + 1];
      steps.push({
        tag: 'lift',
        trace: ['Lift node ', A(move), ' out of the sublist by linking its predecessor straight past it.'],
        state: st({ [lo + 1]: 'active' }),
      });
      cur.splice(lo + 1, 1);
      cur.splice(lo, 0, move);
      steps.push({
        tag: 'front',
        trace: ['Reinsert ', B(move), ' at the ', B('front'), ' of the sublist — the sublist is now [', B(cur.slice(lo, hi + 1).join(' ')), '].'],
        state: st({ [lo]: 'good' }),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Positions ', C(left), ' through ', C(right), ' are reversed: ', C(`[${cur.join(' → ')}]`), '.'],
      state: {
        chains: [{ label: 'result', items: cur.map((v, i) => ({ v, mark: i >= lo && i <= hi ? ('final' as const) : undefined })) }],
      },
    });
    return { steps, result: `[${cur.join(' → ')}]` };
  },
  note: 'The head-insertion variant reverses the sublist in one pass without ever detaching it, so the surrounding links stay correct for free — the alternative (cut out, reverse, splice back) needs four pointers held simultaneously and is far more error-prone under interview pressure.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

export const linkedList3: ProblemDef[] = [
  middleOfList,
  cycleII,
  intersectionLists,
  removeDupSorted,
  removeDupSortedII,
  rotateList,
  sortList,
  partitionList,
  reverseListII,
];
