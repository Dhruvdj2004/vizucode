// Linked List, part 2.
import type { ListState, ProblemDef, Step } from '../lib/types';
import { parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================= 53. Copy List with Random Pointer ================= */
const copyRandomList: ProblemDef = {
  slug: 'copy-list-with-random-pointer',
  title: 'Copy List with Random Pointer',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
  technique: 'Two passes with a hash map: clone every node first, then wire next/random via the map.',
  widget: 'list',
  widgetTitle: 'Original & clone',
  inputs: [
    { key: 'vals', label: 'Values', defaultValue: '7, 13, 11, 10, 1', wide: true },
    { key: 'randoms', label: 'Random targets (index or -1)', defaultValue: '-1, 0, 4, 2, 0', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    Node* copyRandomList(Node* head) {'),
      L('        unordered_map<Node*, Node*> clone;', 'init'),
      L('        for (Node* p = head; p; p = p->next)', 'pass1'),
      L('            clone[p] = new Node(p->val);', 'pass1'),
      L('        for (Node* p = head; p; p = p->next) {', 'pass2'),
      L('            clone[p]->next = clone[p->next];', 'wnext'),
      L('            clone[p]->random = clone[p->random];', 'wrand'),
      L('        }'),
      L('        return clone[head];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public Node copyRandomList(Node head) {'),
      L('        Map<Node, Node> clone = new HashMap<>();', 'init'),
      L('        for (Node p = head; p != null; p = p.next)', 'pass1'),
      L('            clone.put(p, new Node(p.val));', 'pass1'),
      L('        for (Node p = head; p != null; p = p.next) {', 'pass2'),
      L('            clone.get(p).next = clone.get(p.next);', 'wnext'),
      L('            clone.get(p).random = clone.get(p.random);', 'wrand'),
      L('        }'),
      L('        return clone.get(head);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.vals, { maxLen: 8 });
    if (typeof vals === 'string') return { error: vals };
    const rnd = parseIntArray(values.randoms, { min: -1, maxLen: 8 });
    if (typeof rnd === 'string') return { error: rnd };
    if (rnd.length !== vals.length) return { error: 'Random targets must match values in length.' };
    if (rnd.some((r) => r >= vals.length)) return { error: 'Random targets must be valid indices (or -1).' };

    const steps: Step[] = [];
    const cloned: boolean[] = vals.map(() => false);
    const wired: boolean[] = vals.map(() => false);
    const fmtRnd = (i: number) => (rnd[i] === -1 ? '∅' : `→[${rnd[i]}]`);
    const view = (active?: number): ListState => ({
      chains: [
        { label: 'original', items: vals.map((v, i) => ({ v: `${v}${fmtRnd(i)}`, mark: i === active ? ('active' as const) : undefined })) },
        {
          label: 'clone',
          items: vals.map((v, i) => ({
            v: cloned[i] ? (wired[i] ? `${v}${fmtRnd(i)}` : `${v}?`) : '·',
            mark: !cloned[i] ? ('dim' as const) : wired[i] ? ('good' as const) : ('win' as const),
          })),
        },
      ],
      aggs: [{ label: 'map', value: `${cloned.filter(Boolean).length}/${vals.length} nodes cloned`, c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Each node shows ', A('value→random target'), '. The map pairs every original with its clone.'], state: view() });
    for (let i = 0; i < vals.length; i++) {
      cloned[i] = true;
      steps.push({ tag: 'pass1', trace: ['Pass 1: clone node ', A(vals[i]), ' — pointers left dangling (', A('?'), ') for now.'], state: view(i) });
    }
    for (let i = 0; i < vals.length; i++) {
      wired[i] = true;
      steps.push({
        tag: 'wrand',
        tag2: 'wnext',
        trace: ['Pass 2: wire clone of ', A(vals[i]), ' — next → clone[', A(i + 1 < vals.length ? vals[i + 1] : '∅'), '], random → ', rnd[i] === -1 ? F('∅') : B(`clone[${vals[rnd[i]]}]`), '.'],
        state: view(i),
      });
    }
    steps.push({ tag: 'ret', trace: ['Deep copy complete — clone structure mirrors the original exactly, sharing nothing: ', C(`[${vals.join(' → ')}]`), '.'], state: view() });
    return { steps, result: `[${vals.map((v, i) => `${v}${fmtRnd(i)}`).join(', ')}]`, resultDetail: 'deep copy, originals untouched' };
  },
  note: 'Random pointers may point anywhere — including forward to nodes that don\'t exist yet in a single pass. Creating all clones first makes every wiring target exist before pass 2, and the hash map is precisely the original→clone translation table.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 54. Add Two Numbers ================= */
const addTwoNumbers: ProblemDef = {
  slug: 'add-two-numbers',
  title: 'Add Two Numbers',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/add-two-numbers/',
  technique: 'Grade-school addition, digit by digit, with a carry — the lists already store digits reversed.',
  widget: 'list',
  widgetTitle: 'Digit lists & running sum',
  inputs: [
    { key: 'l1', label: 'Number 1 (digits, least first)', defaultValue: '2, 4, 3', wide: true },
    { key: 'l2', label: 'Number 2 (digits, least first)', defaultValue: '5, 6, 4', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {'),
      L('        ListNode dummy, *tail = &dummy;', 'init'),
      L('        int carry = 0;', 'init'),
      L('        while (l1 || l2 || carry) {', 'loop'),
      L('            int sum = carry;', 'sum'),
      L('            if (l1) { sum += l1->val; l1 = l1->next; }', 'sum'),
      L('            if (l2) { sum += l2->val; l2 = l2->next; }', 'sum'),
      L('            carry = sum / 10;', 'carry'),
      L('            tail->next = new ListNode(sum % 10);', 'emit'),
      L('            tail = tail->next;', 'emit'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {'),
      L('        ListNode dummy = new ListNode(0), tail = dummy;', 'init'),
      L('        int carry = 0;', 'init'),
      L('        while (l1 != null || l2 != null || carry != 0) {', 'loop'),
      L('            int sum = carry;', 'sum'),
      L('            if (l1 != null) { sum += l1.val; l1 = l1.next; }', 'sum'),
      L('            if (l2 != null) { sum += l2.val; l2 = l2.next; }', 'sum'),
      L('            carry = sum / 10;', 'carry'),
      L('            tail.next = new ListNode(sum % 10);', 'emit'),
      L('            tail = tail.next;', 'emit'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.l1, { min: 0, max: 9, maxLen: 8 });
    if (typeof a === 'string') return { error: a };
    const b = parseIntArray(values.l2, { min: 0, max: 9, maxLen: 8 });
    if (typeof b === 'string') return { error: b };

    const steps: Step[] = [];
    const out: number[] = [];
    let carry = 0;
    let i = 0;
    const view = (): ListState => ({
      chains: [
        { label: 'num 1', items: a.slice(i).map((v, k) => ({ v, mark: k === 0 ? ('active' as const) : undefined })) },
        { label: 'num 2', items: b.slice(i).map((v, k) => ({ v, mark: k === 0 ? ('active' as const) : undefined })) },
        { label: 'sum', items: out.map((v, k) => ({ v, mark: k === out.length - 1 ? ('good' as const) : ('win' as const) })) },
      ],
      aggs: [{ label: 'carry', value: String(carry), c: carry ? 'a' : undefined }],
    });
    const numA = [...a].reverse().join('');
    const numB = [...b].reverse().join('');
    steps.push({
      tag: 'init',
      trace: ['Least-significant digits come first, so we can add left to right: ', A(numA), ' + ', A(numB), '.'],
      state: view(),
    });
    while (i < a.length || i < b.length || carry) {
      const d1 = a[i] ?? 0;
      const d2 = b[i] ?? 0;
      const sum = d1 + d2 + carry;
      steps.push({
        tag: 'sum',
        trace: ['Column ', A(i), ': ', A(d1), ' + ', A(d2), ' + carry ', A(carry), ' = ', A(sum), '.'],
        state: view(),
      });
      carry = Math.floor(sum / 10);
      out.push(sum % 10);
      i++;
      steps.push({
        tag: 'emit',
        tag2: 'carry',
        trace: ['Emit digit ', B(sum % 10), carry ? [', carry '].join('') : ', no carry.', carry ? A(1) : '', carry ? ' rolls to the next column.' : ''],
        state: view(),
      });
    }
    const total = Number(numA) + Number(numB);
    steps.push({ tag: 'ret', trace: ['All columns processed: ', C(`[${out.join(' → ')}]`), ' — that is ', C(total), ' reversed.'], state: view() });
    return { steps, result: `[${out.join(' → ')}]`, resultDetail: `${numA} + ${numB} = ${total}` };
  },
  note: 'Storing digits least-significant-first means addition and the list walk move in the same direction — the carry always flows toward nodes not yet visited. The "|| carry" in the loop condition is what grows the extra digit (e.g. 5+5 → 0→1).',
  complexity: { time: 'O(max(m,n))', space: 'O(max(m,n))' },
};

/* ================= 55. Palindrome Linked List ================= */
const palindromeList: ProblemDef = {
  slug: 'palindrome-linked-list',
  title: 'Palindrome Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/palindrome-linked-list/',
  technique: 'Find the middle, reverse the back half, then compare the two halves front to front.',
  widget: 'list',
  widgetTitle: 'Halves compared',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '1, 2, 2, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isPalindrome(ListNode* head) {'),
      L('        ListNode *slow = head, *fast = head;', 'mid'),
      L('        while (fast->next && fast->next->next) {', 'mid'),
      L('            slow = slow->next; fast = fast->next->next;', 'mid'),
      L('        }'),
      L('        ListNode *second = nullptr, *curr = slow->next;', 'rev'),
      L('        while (curr) {', 'rev'),
      L('            ListNode* n = curr->next;', 'rev'),
      L('            curr->next = second; second = curr; curr = n;', 'rev'),
      L('        }'),
      L('        for (ListNode* first = head; second; ) {', 'cmp'),
      L('            if (first->val != second->val)', 'cmp', 'bad'),
      L('                return false;', 'bad'),
      L('            first = first->next; second = second->next;', 'cmp'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isPalindrome(ListNode head) {'),
      L('        ListNode slow = head, fast = head;', 'mid'),
      L('        while (fast.next != null && fast.next.next != null) {', 'mid'),
      L('            slow = slow.next; fast = fast.next.next;', 'mid'),
      L('        }'),
      L('        ListNode second = null, curr = slow.next;', 'rev'),
      L('        while (curr != null) {', 'rev'),
      L('            ListNode n = curr.next;', 'rev'),
      L('            curr.next = second; second = curr; curr = n;', 'rev'),
      L('        }'),
      L('        ListNode first = head;', 'cmp'),
      L('        while (second != null) {', 'cmp'),
      L('            if (first.val != second.val)', 'cmp', 'bad'),
      L('                return false;', 'bad'),
      L('            first = first.next; second = second.next;', 'cmp'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const vals = parseIntArray(values.list, { maxLen: 12 });
    if (typeof vals === 'string') return { error: vals };
    if (vals.length < 2) return { error: 'Need at least two nodes.' };

    const steps: Step[] = [];
    const midIdx = Math.floor((vals.length - 1) / 2);
    const first = vals.slice(0, midIdx + 1);
    const second = vals.slice(midIdx + 1).reverse();

    steps.push({
      tag: 'mid',
      trace: ['Slow/fast pointers locate the middle: index ', A(midIdx), ' (value ', A(vals[midIdx]), ').'],
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
      trace: ['Reverse the back half in place: ', A(`[${vals.slice(midIdx + 1).join(' → ')}]`), ' → ', B(`[${second.join(' → ')}]`), '.'],
      state: {
        chains: [
          { label: 'front', items: first.map((v) => ({ v })) },
          { label: 'back (rev)', items: second.map((v) => ({ v, mark: 'win' as const })) },
        ],
      } satisfies ListState,
    });
    let ok = true;
    for (let k = 0; k < second.length; k++) {
      const match = first[k] === second[k];
      steps.push({
        tag: match ? 'cmp' : 'bad',
        trace: match
          ? ['Compare position ', A(k), ': ', B(first[k]), ' = ', B(second[k]), ' ✓']
          : ['Compare position ', A(k), ': ', F(first[k]), ' ≠ ', F(second[k]), ' — not a palindrome. Return ', C('false'), '.'],
        state: {
          chains: [
            { label: 'front', items: first.map((v, i) => ({ v, mark: i === k ? (match ? ('good' as const) : ('dim' as const)) : i < k ? ('win' as const) : undefined })) },
            { label: 'back (rev)', items: second.map((v, i) => ({ v, mark: i === k ? (match ? ('good' as const) : ('dim' as const)) : i < k ? ('win' as const) : undefined })) },
          ],
        } satisfies ListState,
      });
      if (!match) {
        ok = false;
        break;
      }
    }
    if (ok) {
      steps.push({
        tag: 'ret',
        trace: ['Every pair matched — the list is a palindrome. Return ', C('true'), '.'],
        state: { chains: [{ label: 'list', items: vals.map((v) => ({ v, mark: 'final' as const })) }] } satisfies ListState,
      });
    }
    return { steps, result: String(ok) };
  },
  note: 'A palindrome check needs to compare the list against its reverse — but reversing only the back half lets both comparisons run forward simultaneously, with O(1) extra space. (Interviews bonus: you can re-reverse the half afterward to restore the input.)',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 56. Swap Nodes in Pairs ================= */
const swapPairs: ProblemDef = {
  slug: 'swap-nodes-in-pairs',
  title: 'Swap Nodes in Pairs',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/swap-nodes-in-pairs/',
  technique: 'Rewire three pointers per pair, anchored by the node before the pair.',
  widget: 'list',
  widgetTitle: 'List, pair by pair',
  inputs: [{ key: 'list', label: 'List values', defaultValue: '1, 2, 3, 4', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    ListNode* swapPairs(ListNode* head) {'),
      L('        ListNode dummy(0, head);', 'init'),
      L('        ListNode* prev = &dummy;', 'init'),
      L('        while (prev->next && prev->next->next) {', 'loop'),
      L('            ListNode* a = prev->next;', 'pick'),
      L('            ListNode* b = a->next;', 'pick'),
      L('            a->next = b->next;', 'swap'),
      L('            b->next = a;', 'swap'),
      L('            prev->next = b;', 'swap'),
      L('            prev = a;', 'advance'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public ListNode swapPairs(ListNode head) {'),
      L('        ListNode dummy = new ListNode(0, head);', 'init'),
      L('        ListNode prev = dummy;', 'init'),
      L('        while (prev.next != null && prev.next.next != null) {', 'loop'),
      L('            ListNode a = prev.next;', 'pick'),
      L('            ListNode b = a.next;', 'pick'),
      L('            a.next = b.next;', 'swap'),
      L('            b.next = a;', 'swap'),
      L('            prev.next = b;', 'swap'),
      L('            prev = a;', 'advance'),
      L('        }'),
      L('        return dummy.next;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const input = parseIntArray(values.list, { maxLen: 10 });
    if (typeof input === 'string') return { error: input };
    const arr = [...input];
    const steps: Step[] = [];
    const view = (hl: number[] = [], done: number): ListState => ({
      chains: [
        {
          label: 'list',
          items: arr.map((v, i) => ({
            v,
            mark: hl.includes(i) ? ('active' as const) : i < done ? ('good' as const) : undefined,
          })),
        },
      ],
    });
    steps.push({ tag: 'init', trace: ['A dummy anchor lets the very first pair be rewired like any other; ', A('prev'), ' always sits just before the pair.'], state: view([], 0) });
    for (let i = 0; i + 1 < arr.length; i += 2) {
      steps.push({ tag: 'pick', trace: ['Pick the pair (', A(arr[i]), ', ', A(arr[i + 1]), ').'], state: view([i, i + 1], i) });
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      steps.push({
        tag: 'swap',
        trace: ['Three rewires: a→after-b, b→a, prev→b — the pair is now (', B(arr[i]), ', ', B(arr[i + 1]), ').'],
        state: view([i, i + 1], i),
      });
      steps.push({ tag: 'advance', trace: ['Advance prev to the pair\'s new tail, ready for the next pair.'], state: view([], i + 2) });
    }
    steps.push({ tag: 'ret', trace: ['Done: ', C(`[${arr.join(' → ')}]`), (input.length % 2 === 1 ? ' — the odd last node stays put.' : '.')], state: view([], arr.length) });
    return { steps, result: `[${arr.join(' → ')}]`, resultDetail: 'pairs swapped by pointer rewiring' };
  },
  note: 'Swapping list nodes is purely pointer surgery — no values move. The order of the three rewires matters: a must grab b\'s successor before b turns around, or the rest of the list is lost.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= 57. LRU Cache ================= */
const lruCache: ProblemDef = {
  slug: 'lru-cache',
  title: 'LRU Cache',
  category: 'Linked List',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/lru-cache/',
  technique: 'Hash map + doubly linked list: O(1) lookup, O(1) move-to-front, O(1) evict-from-back.',
  widget: 'list',
  widgetTitle: 'Recency list (MRU → LRU)',
  inputs: [
    { key: 'cap', label: 'Capacity', defaultValue: '2' },
    { key: 'ops', label: 'Ops (put k v / get k)', defaultValue: 'put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4', wide: true },
  ],
  code: {
    cpp: [
      L('class LRUCache {'),
      L('    int cap;', 'init'),
      L('    list<pair<int,int>> items;              // front = MRU', 'init'),
      L('    unordered_map<int, list<pair<int,int>>::iterator> pos;', 'init'),
      L('public:'),
      L('    LRUCache(int capacity) : cap(capacity) {}', 'init'),
      L('    int get(int key) {', 'get'),
      L('        if (!pos.count(key)) return -1;', 'miss'),
      L('        items.splice(items.begin(), items, pos[key]);', 'touch'),
      L('        return pos[key]->second;', 'get'),
      L('    }'),
      L('    void put(int key, int value) {', 'put'),
      L('        if (pos.count(key)) {', 'put'),
      L('            pos[key]->second = value;', 'put'),
      L('            items.splice(items.begin(), items, pos[key]);', 'touch'),
      L('            return;'),
      L('        }'),
      L('        if (items.size() == cap) {', 'evict'),
      L('            pos.erase(items.back().first);', 'evict'),
      L('            items.pop_back();', 'evict'),
      L('        }'),
      L('        items.emplace_front(key, value);', 'insert'),
      L('        pos[key] = items.begin();', 'insert'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class LRUCache extends LinkedHashMap<Integer, Integer> {'),
      L('    private final int cap;', 'init'),
      L('    public LRUCache(int capacity) {', 'init'),
      L('        super(capacity, 0.75f, true);  // access order', 'init'),
      L('        this.cap = capacity;', 'init'),
      L('    }'),
      L('    public int get(int key) {', 'get'),
      L('        return super.getOrDefault(key, -1);', 'get', 'miss', 'touch'),
      L('    }'),
      L('    public void put(int key, int value) {', 'put'),
      L('        super.put(key, value);', 'put', 'insert'),
      L('    }'),
      L('    protected boolean removeEldestEntries(Map.Entry<Integer, Integer> e) {', 'evict'),
      L('        return size() > cap;', 'evict'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const cap = Number(values.cap);
    if (!Number.isInteger(cap) || cap < 1 || cap > 5) return { error: 'Capacity must be an integer 1–5.' };
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 14) return { error: 'Keep it to at most 14 operations.' };

    const steps: Step[] = [];
    const order: number[] = []; // MRU first
    const map = new Map<number, number>();
    const outputs: string[] = [];
    const view = (activeKey?: number, evicted?: number): ListState => ({
      chains: [
        {
          label: 'MRU → LRU',
          items:
            order.length === 0
              ? [{ v: '(empty)', mark: 'dim' as const }]
              : order.map((k) => ({ v: `${k}:${map.get(k)}`, mark: k === activeKey ? ('active' as const) : undefined })),
        },
        ...(evicted !== undefined ? [{ label: 'evicted', items: [{ v: String(evicted), mark: 'dim' as const }], broken: true }] : []),
      ],
      aggs: [
        { label: 'capacity', value: `${order.length}/${cap}`, c: 'a' },
        { label: 'outputs', value: outputs.join(', ') || '—', c: 'c' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Capacity ', A(cap), '. The list orders keys by recency; the map jumps straight to any node.'], state: view() });
    for (const op of raw) {
      const mPut = op.match(/^put\s+(-?\d+)\s+(-?\d+)$/i);
      const mGet = op.match(/^get\s+(-?\d+)$/i);
      if (mPut) {
        const k = Number(mPut[1]);
        const v = Number(mPut[2]);
        if (map.has(k)) {
          map.set(k, v);
          order.splice(order.indexOf(k), 1);
          order.unshift(k);
          steps.push({ tag: 'touch', trace: ['put(', A(k), ',', A(v), ') — key exists: update and move to the front (MRU).'], state: view(k) });
        } else {
          let evicted: number | undefined;
          if (order.length === cap) {
            evicted = order.pop()!;
            map.delete(evicted);
            steps.push({ tag: 'evict', trace: ['Cache full — evict the least-recently-used key ', F(evicted), ' from the back.'], state: view(undefined, evicted) });
          }
          map.set(k, v);
          order.unshift(k);
          steps.push({ tag: 'insert', trace: ['Insert ', B(`${k}:${v}`), ' at the front.'], state: view(k) });
        }
      } else if (mGet) {
        const k = Number(mGet[1]);
        if (!map.has(k)) {
          outputs.push('-1');
          steps.push({ tag: 'miss', trace: ['get(', A(k), ') — not present: ', F('-1'), '.'], state: view() });
        } else {
          order.splice(order.indexOf(k), 1);
          order.unshift(k);
          outputs.push(String(map.get(k)));
          steps.push({ tag: 'touch', trace: ['get(', A(k), ') → ', B(map.get(k)!), ' — and touching it moves it to the front.'], state: view(k) });
        }
      } else {
        return { error: `Unknown op "${op}". Use: put k v, get k.` };
      }
    }
    steps.push({ tag: 'get', trace: ['All operations done. Outputs: ', C(outputs.join(', ') || 'none'), '.'], state: view() });
    return { steps, result: outputs.join(', ') || 'done', resultDetail: 'every op O(1)' };
  },
  note: 'Neither structure works alone: a map can\'t order by recency, a list can\'t find a key in O(1). Glued together — map values point at list nodes — every operation (find, move-to-front, evict-back) is a constant number of pointer moves.',
  complexity: { time: 'O(1) per op', space: 'O(capacity)' },
};

export const linkedList2 = [copyRandomList, addTwoNumbers, palindromeList, swapPairs, lruCache];
