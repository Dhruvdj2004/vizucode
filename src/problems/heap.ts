// Heap / Priority Queue.
import type { HeapState, ProblemDef, StackState, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ---------- tiny binary heap that reports sift paths ---------- */
class Heap<T> {
  a: T[] = [];
  constructor(private lt: (x: T, y: T) => boolean) {}
  push(v: T): number[] {
    this.a.push(v);
    const path = [this.a.length - 1];
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.lt(this.a[i], this.a[p])) {
        [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
        i = p;
        path.push(i);
      } else break;
    }
    return path;
  }
  pop(): { v: T; path: number[] } {
    const v = this.a[0];
    const last = this.a.pop()!;
    const path = [0];
    if (this.a.length > 0) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let m = i;
        if (l < this.a.length && this.lt(this.a[l], this.a[m])) m = l;
        if (r < this.a.length && this.lt(this.a[r], this.a[m])) m = r;
        if (m === i) break;
        [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
        i = m;
        path.push(i);
      }
    }
    return { v, path };
  }
  get size() {
    return this.a.length;
  }
  get top() {
    return this.a[0];
  }
}

/* ================= 79. Kth Largest Element in an Array ================= */
const kthLargestArray: ProblemDef = {
  slug: 'kth-largest-element-in-an-array',
  title: 'Kth Largest Element in an Array',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
  technique: 'A min-heap capped at size k — its root is always the kth largest so far.',
  widget: 'heap',
  widgetTitle: 'Min-heap of the k largest',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '3, 2, 1, 5, 6, 4', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findKthLargest(vector<int>& nums, int k) {'),
      L('        priority_queue<int, vector<int>, greater<int>> heap;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            heap.push(x);', 'push'),
      L('            if (heap.size() > k)', 'trim'),
      L('                heap.pop();', 'trim'),
      L('        }'),
      L('        return heap.top();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findKthLargest(int[] nums, int k) {'),
      L('        PriorityQueue<Integer> heap = new PriorityQueue<>();', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            heap.add(x);', 'push'),
      L('            if (heap.size() > k)', 'trim'),
      L('                heap.poll();', 'trim'),
      L('        }'),
      L('        return heap.peek();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums, { maxLen: 12 });
    if (typeof arr === 'string') return { error: arr };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > arr.length) return { error: 'k must be ≤ array length.' };

    const steps: Step[] = [];
    const heap = new Heap<number>((x, y) => x < y);
    const st = (hl: number[] = []): HeapState => ({
      heap: [...heap.a],
      hl,
      label: `min-heap, capacity ${k} — root is the current kth largest`,
      aggs: [{ label: 'incoming', value: '', c: 'a' }],
    });
    steps.push({ tag: 'init', trace: ['Keep only the ', A(k), ' largest values seen, in a min-heap — the smallest of the elite sits at the root, ready to be evicted.'], state: { heap: [], label: `min-heap, capacity ${k}` } });
    for (const x of arr) {
      const path = heap.push(x);
      steps.push({ tag: 'push', trace: ['Push ', A(x), ' — it sifts up to keep the heap ordered.'], state: st(path) });
      if (heap.size > k) {
        const { v, path: p2 } = heap.pop();
        steps.push({ tag: 'trim', trace: ['Heap exceeds ', A(k), ' — evict the smallest, ', F(v), '. Only the top ', A(k), ' survive.'], state: st(p2) });
      }
    }
    steps.push({ tag: 'ret', trace: ['The heap holds the ', A(k), ' largest; its root is the smallest of them — the answer: ', C(heap.top), '.'], state: st([0]) });
    return { steps, result: String(heap.top), resultDetail: `${k}th largest element` };
  },
  note: 'Counter-intuitive but exact: to track the k *largest*, use a *min*-heap — the root is the weakest member of the elite, i.e. precisely the kth largest. n operations on a k-sized heap gives O(n log k), better than sorting when k ≪ n.',
  complexity: { time: 'O(n log k)', space: 'O(k)' },
  brute: {
    label: 'Quickselect',
    technique: 'Partition around a pivot like quicksort, but recurse only into the side that holds position n − k: O(n) on average.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findKthLargest(vector<int>& a, int k) {'),
        L('        int target = a.size() - k, lo = 0, hi = a.size() - 1;', 'init'),
        L('        while (true) {'),
        L('            int pivot = a[hi], p = lo;', 'part'),
        L('            for (int i = lo; i < hi; i++)', 'part'),
        L('                if (a[i] < pivot) swap(a[i], a[p++]);', 'part'),
        L('            swap(a[p], a[hi]);', 'part'),
        L('            if (p == target) return a[p];', 'found'),
        L('            if (p < target) lo = p + 1; else hi = p - 1;', 'narrow'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findKthLargest(int[] a, int k) {'),
        L('        int target = a.length - k, lo = 0, hi = a.length - 1;', 'init'),
        L('        while (true) {'),
        L('            int pivot = a[hi], p = lo;', 'part'),
        L('            for (int i = lo; i < hi; i++)', 'part'),
        L('                if (a[i] < pivot) { int t = a[i]; a[i] = a[p]; a[p++] = t; }', 'part'),
        L('            int t = a[p]; a[p] = a[hi]; a[hi] = t;', 'part'),
        L('            if (p == target) return a[p];', 'found'),
        L('            if (p < target) lo = p + 1; else hi = p - 1;', 'narrow'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums, { maxLen: 12 });
      if (typeof arr === 'string') return { error: arr };
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      if (k > arr.length) return { error: 'k must be ≤ array length.' };
      const a = [...arr];
      const target = a.length - k;
      const steps: Step[] = [];
      const st = (lo: number, hi: number, hl: number[] = [], ok: number[] = []): HeapState => ({
        heap: [...a],
        hl,
        ok,
        label: `array, drawn level by level — searching index ${target} within [${lo}..${hi}]`,
      });
      steps.push({ tag: 'init', trace: ['In sorted order the kth largest sits at index n − k = ', A(target), '. Partition until the pivot lands exactly there.'], state: st(0, a.length - 1) });
      let lo = 0;
      let hi = a.length - 1;
      let ans = a[0];
      for (let guard = 0; guard < 50; guard++) {
        const pivot = a[hi];
        let p = lo;
        for (let i = lo; i < hi; i++)
          if (a[i] < pivot) {
            [a[i], a[p]] = [a[p], a[i]];
            p++;
          }
        [a[p], a[hi]] = [a[hi], a[p]];
        steps.push({ tag: 'part', trace: ['Partition [', A(lo), '..', A(hi), '] around ', A(pivot), ': smaller values go left, so the pivot lands at index ', B(p), '.'], state: st(lo, hi, [p]) });
        if (p === target) {
          ans = a[p];
          steps.push({ tag: 'found', trace: ['Pivot index ', B(p), ' = target — the ', C(k), 'th largest is ', C(ans), '.'], state: st(lo, hi, [], [p]) });
          break;
        }
        if (p < target) lo = p + 1;
        else hi = p - 1;
        steps.push({ tag: 'narrow', trace: ['Target ', A(target), ' is to the ', A(p < target ? 'right' : 'left'), ' — only that side needs more work: [', A(lo), '..', A(hi), '].'], state: st(lo, hi) });
      }
      return { steps, result: String(ans), resultDetail: `${k}th largest element` };
    },
    note: 'Each partition throws away one side, so the expected work is n + n/2 + n/4 + … = O(n), beating the heap’s O(n log k). The worst case is O(n²) with unlucky pivots, which a random pivot makes vanishingly rare.',
    complexity: { time: 'O(n) average, O(n²) worst', space: 'O(1)' },
  },
};

/* ================= 80. Kth Largest Element in a Stream ================= */
const kthLargestStream: ProblemDef = {
  slug: 'kth-largest-element-in-a-stream',
  title: 'Kth Largest Element in a Stream',
  category: 'Heap / Priority Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/',
  technique: 'The same capped min-heap, kept alive between add() calls.',
  widget: 'heap',
  widgetTitle: 'Persistent min-heap of size k',
  inputs: [
    { key: 'k', label: 'k', defaultValue: '3' },
    { key: 'nums', label: 'Initial stream', defaultValue: '4, 5, 8, 2', wide: true },
    { key: 'adds', label: 'add() calls', defaultValue: '3, 5, 10, 9, 4', wide: true },
  ],
  code: {
    cpp: [
      L('class KthLargest {'),
      L('    priority_queue<int, vector<int>, greater<int>> heap;', 'init'),
      L('    int k;', 'init'),
      L('public:'),
      L('    KthLargest(int k, vector<int>& nums) : k(k) {', 'ctor'),
      L('        for (int x : nums) add(x);', 'ctor'),
      L('    }'),
      L('    int add(int val) {', 'add'),
      L('        heap.push(val);', 'push'),
      L('        if (heap.size() > k)', 'trim'),
      L('            heap.pop();', 'trim'),
      L('        return heap.top();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class KthLargest {'),
      L('    private PriorityQueue<Integer> heap = new PriorityQueue<>();', 'init'),
      L('    private int k;', 'init'),
      L('    public KthLargest(int k, int[] nums) {', 'ctor'),
      L('        this.k = k;', 'ctor'),
      L('        for (int x : nums) add(x);', 'ctor'),
      L('    }'),
      L('    public int add(int val) {', 'add'),
      L('        heap.add(val);', 'push'),
      L('        if (heap.size() > k)', 'trim'),
      L('            heap.poll();', 'trim'),
      L('        return heap.peek();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const nums = parseIntArray(values.nums, { maxLen: 8 });
    if (typeof nums === 'string') return { error: nums };
    const adds = parseIntArray(values.adds, { maxLen: 8 });
    if (typeof adds === 'string') return { error: adds };

    const steps: Step[] = [];
    const heap = new Heap<number>((x, y) => x < y);
    const outputs: number[] = [];
    const st = (hl: number[] = []): HeapState => ({
      heap: [...heap.a],
      hl,
      label: `min-heap, capacity ${k}`,
      aggs: [{ label: 'add() returns', value: outputs.join(', ') || '—', c: 'c' }],
    });
    steps.push({ tag: 'ctor', trace: ['Seed the heap with the initial stream, trimming to ', A(k), ' as we go.'], state: st() });
    const doAdd = (x: number, isSeed: boolean) => {
      const path = heap.push(x);
      steps.push({ tag: 'push', trace: [isSeed ? 'Seed ' : 'add(', A(x), isSeed ? ' arrives.' : ') arrives.'], state: st(path) });
      if (heap.size > k) {
        const { v, path: p2 } = heap.pop();
        steps.push({ tag: 'trim', trace: ['Over capacity — drop ', F(v), '; it can never be the kth largest again.'], state: st(p2) });
      }
      if (!isSeed && heap.size >= k) {
        outputs.push(heap.top);
        steps.push({ tag: 'ret', trace: ['Return the root: ', C(heap.top), ' — the kth largest right now.'], state: st([0]) });
      }
    };
    for (const x of nums) doAdd(x, true);
    for (const x of adds) doAdd(x, false);
    return { steps, result: outputs.join(', '), resultDetail: 'returned after each add()' };
  },
  note: 'A stream forbids re-sorting on every arrival. The capped heap is incremental by nature: each add() costs O(log k) and the answer is always sitting at the root, no recomputation.',
  complexity: { time: 'O(log k) per add', space: 'O(k)' },
  brute: {
    label: 'Sorted list',
    technique: 'Keep every number seen in a sorted list; each add() inserts in place and reads position k − 1.',
    code: {
      cpp: [
        L('class KthLargest {'),
        L('    int k; vector<int> all;  // sorted descending'),
        L('public:'),
        L('    KthLargest(int k, vector<int>& nums) : k(k) {', 'ctor'),
        L('        for (int x : nums) add(x);', 'ctor'),
        L('    }'),
        L('    int add(int val) {'),
        L('        all.insert(upper_bound(all.begin(), all.end(), val, greater<int>()), val);', 'push'),
        L('        return all[k - 1];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class KthLargest {'),
        L('    int k; List<Integer> all = new ArrayList<>();  // sorted descending'),
        L('    public KthLargest(int k, int[] nums) {', 'ctor'),
        L('        this.k = k;', 'ctor'),
        L('        for (int x : nums) add(x);', 'ctor'),
        L('    }'),
        L('    public int add(int val) {'),
        L('        int i = 0;', 'push'),
        L('        while (i < all.size() && all.get(i) >= val) i++;', 'push'),
        L('        all.add(i, val);', 'push'),
        L('        return all.get(k - 1);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      const nums = parseIntArray(values.nums, { maxLen: 8 });
      if (typeof nums === 'string') return { error: nums };
      const adds = parseIntArray(values.adds, { maxLen: 8 });
      if (typeof adds === 'string') return { error: adds };
      const steps: Step[] = [];
      const all: number[] = [];
      const outputs: number[] = [];
      const st = (hl: number[] = []): HeapState => ({
        heap: [...all],
        hl,
        ok: all.length >= k ? [k - 1] : [],
        label: 'every value, sorted descending (drawn level by level)',
        aggs: [{ label: 'add() returns', value: outputs.join(', ') || '—', c: 'c' }],
      });
      steps.push({ tag: 'ctor', trace: ['Keep ', A('every'), ' value in one sorted list — nothing is ever dropped.'], state: st() });
      const doAdd = (x: number, isSeed: boolean) => {
        let i = 0;
        while (i < all.length && all[i] >= x) i++;
        all.splice(i, 0, x);
        steps.push({ tag: 'push', trace: [isSeed ? 'Seed ' : 'add(', A(x), isSeed ? '' : ')', ': shift ', A(all.length - 1 - i), ' value(s) to insert it at position ', B(i), '.'], state: st([i]) });
        if (!isSeed && all.length >= k) {
          outputs.push(all[k - 1]);
          steps.push({ tag: 'ret', trace: ['Position ', A(k - 1), ' holds ', C(all[k - 1]), '.'], state: st([k - 1]) });
        }
      };
      for (const x of nums) doAdd(x, true);
      for (const x of adds) doAdd(x, false);
      return { steps, result: outputs.join(', '), resultDetail: 'returned after each add()' };
    },
    note: 'Inserting into a sorted list shifts up to n elements, and the list keeps growing forever. Only the top k values can ever matter, so a size-k min-heap does each add in O(log k) memory-bounded.',
    complexity: { time: 'O(n) per add', space: 'O(n)' },
  },
};

/* ================= 81. Last Stone Weight ================= */
const lastStone: ProblemDef = {
  slug: 'last-stone-weight',
  title: 'Last Stone Weight',
  category: 'Heap / Priority Queue',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/last-stone-weight/',
  technique: 'Max-heap simulation: always smash the two heaviest stones.',
  widget: 'heap',
  widgetTitle: 'Max-heap of stones',
  inputs: [{ key: 'stones', label: 'Stones', defaultValue: '2, 7, 4, 1, 8, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int lastStoneWeight(vector<int>& stones) {'),
      L('        priority_queue<int> heap(stones.begin(), stones.end());', 'init'),
      L('        while (heap.size() > 1) {', 'loop'),
      L('            int a = heap.top(); heap.pop();', 'take'),
      L('            int b = heap.top(); heap.pop();', 'take'),
      L('            if (a != b)', 'smash'),
      L('                heap.push(a - b);', 'smash'),
      L('        }'),
      L('        return heap.empty() ? 0 : heap.top();', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int lastStoneWeight(int[] stones) {'),
      L('        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());', 'init'),
      L('        for (int s : stones) heap.add(s);', 'init'),
      L('        while (heap.size() > 1) {', 'loop'),
      L('            int a = heap.poll(), b = heap.poll();', 'take'),
      L('            if (a != b)', 'smash'),
      L('                heap.add(a - b);', 'smash'),
      L('        }'),
      L('        return heap.isEmpty() ? 0 : heap.peek();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const stones = parseIntArray(values.stones, { min: 1, maxLen: 10 });
    if (typeof stones === 'string') return { error: stones };

    const steps: Step[] = [];
    const heap = new Heap<number>((x, y) => x > y);
    for (const s of stones) heap.push(s);
    const st = (hl: number[] = []): HeapState => ({ heap: [...heap.a], hl, label: 'max-heap — root is the heaviest stone' });
    steps.push({ tag: 'init', trace: ['Heapify all ', A(stones.length), ' stones — the heaviest floats to the root.'], state: st([0]) });
    while (heap.size > 1) {
      const { v: a } = heap.pop();
      const { v: b } = heap.pop();
      steps.push({ tag: 'take', trace: ['Take the two heaviest: ', A(a), ' and ', A(b), '.'], state: st() });
      if (a !== b) {
        const path = heap.push(a - b);
        steps.push({ tag: 'smash', trace: ['Smash! ', A(a), ' − ', A(b), ' = ', B(a - b), ' survives and re-enters the heap.'], state: st(path) });
      } else {
        steps.push({ tag: 'smash', trace: ['Equal weights — both stones are ', F('destroyed'), '.'], state: st() });
      }
    }
    const result = heap.size === 0 ? 0 : heap.top;
    steps.push({ tag: 'ret', trace: [heap.size === 0 ? 'No stones remain — return ' : 'One stone remains: ', C(result), '.'], state: st(heap.size ? [0] : []) });
    return { steps, result: String(result) };
  },
  note: 'The rules always consume the two maxima — a max-heap serves exactly that query in O(log n), whereas re-sorting after every smash would cost O(n log n) each round.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  brute: {
    label: 'Re-sort each round',
    technique: 'Sort the stones every round, smash the two heaviest, and put any remainder back.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int lastStoneWeight(vector<int>& s) {'),
        L('        while (s.size() > 1) {', 'take'),
        L('            sort(s.begin(), s.end());', 'take'),
        L('            int a = s.back(); s.pop_back();', 'take'),
        L('            int b = s.back(); s.pop_back();', 'take'),
        L('            if (a != b) s.push_back(a - b);', 'smash'),
        L('        }'),
        L('        return s.empty() ? 0 : s[0];', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int lastStoneWeight(int[] stones) {'),
        L('        List<Integer> s = new ArrayList<>();'),
        L('        for (int x : stones) s.add(x);'),
        L('        while (s.size() > 1) {', 'take'),
        L('            Collections.sort(s);', 'take'),
        L('            int a = s.remove(s.size() - 1), b = s.remove(s.size() - 1);', 'take'),
        L('            if (a != b) s.add(a - b);', 'smash'),
        L('        }'),
        L('        return s.isEmpty() ? 0 : s.get(0);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const stones = parseIntArray(values.stones, { min: 1, maxLen: 10 });
      if (typeof stones === 'string') return { error: stones };
      const s = [...stones];
      const steps: Step[] = [];
      const st = (label: string, hl: number[] = []): HeapState => ({ heap: [...s], hl, label });
      while (s.length > 1) {
        s.sort((x, y) => y - x);
        steps.push({ tag: 'take', trace: ['Sort all ', A(s.length), ' stones (heaviest first) and take ', A(s[0]), ' and ', A(s[1]), '.'], state: st('stones, sorted heaviest first (drawn level by level)', [0, 1]) });
        const a = s.shift()!;
        const b = s.shift()!;
        if (a !== b) s.push(a - b);
        steps.push({ tag: 'smash', trace: [a === b ? ['Equal weights — both are destroyed.'].join('') : ['Smash: ', a, ' − ', b, ' = '].join(''), a === b ? '' : B(a - b), a === b ? '' : ' goes back in.'], state: st('stones left, unsorted') });
      }
      const result = s.length ? s[0] : 0;
      steps.push({ tag: 'ret', trace: ['Last stone weighs ', C(result), '.'], state: st('done') });
      return { steps, result: String(result) };
    },
    note: 'Correct, but every round pays a full O(n log n) sort just to find the top two, for O(n² log n) total. A max-heap exposes the heaviest in O(1) and restores order in O(log n).',
    complexity: { time: 'O(n² log n)', space: 'O(n)' },
  },
};

/* ================= 82. K Closest Points to Origin ================= */
const kClosest: ProblemDef = {
  slug: 'k-closest-points-to-origin',
  title: 'K Closest Points to Origin',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/k-closest-points-to-origin/',
  technique: 'A max-heap of size k keyed on distance — the farthest of the chosen is always evictable.',
  widget: 'heap',
  widgetTitle: 'Max-heap by distance²',
  inputs: [
    { key: 'points', label: 'Points (x y; x y; …)', defaultValue: '1 3; -2 2; 5 8; 0 1', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {'),
      L('        priority_queue<pair<int, int>> heap;  // (dist², index)', 'init'),
      L('        for (int i = 0; i < points.size(); i++) {', 'loop'),
      L('            int d = points[i][0] * points[i][0] + points[i][1] * points[i][1];', 'dist'),
      L('            heap.push({d, i});', 'push'),
      L('            if (heap.size() > k)', 'trim'),
      L('                heap.pop();', 'trim'),
      L('        }'),
      L('        vector<vector<int>> res;', 'ret'),
      L('        while (!heap.empty()) {', 'ret'),
      L('            res.push_back(points[heap.top().second]); heap.pop();', 'ret'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] kClosest(int[][] points, int k) {'),
      L('        PriorityQueue<int[]> heap =', 'init'),
      L('            new PriorityQueue<>((a, b) -> b[0] - a[0]);  // (dist², index)', 'init'),
      L('        for (int i = 0; i < points.length; i++) {', 'loop'),
      L('            int d = points[i][0] * points[i][0] + points[i][1] * points[i][1];', 'dist'),
      L('            heap.add(new int[]{d, i});', 'push'),
      L('            if (heap.size() > k)', 'trim'),
      L('                heap.poll();', 'trim'),
      L('        }'),
      L('        int[][] res = new int[heap.size()][];', 'ret'),
      L('        for (int i = res.length - 1; i >= 0; i--)', 'ret'),
      L('            res[i] = points[heap.poll()[1]];', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parts = (values.points ?? '').split(';').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return { error: 'Enter points as "x y; x y; …".' };
    if (parts.length > 10) return { error: 'Keep it to at most 10 points.' };
    const pts: [number, number][] = [];
    for (const p of parts) {
      const m = p.split(/[\s,]+/).map(Number);
      if (m.length !== 2 || m.some((x) => !Number.isInteger(x))) return { error: `Bad point "${p}".` };
      pts.push([m[0], m[1]]);
    }
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > pts.length) return { error: 'k must be ≤ number of points.' };

    const steps: Step[] = [];
    const heap = new Heap<{ d: number; i: number }>((x, y) => x.d > y.d);
    const st = (hl: number[] = []): HeapState => ({
      heap: heap.a.map(({ d, i }) => `(${pts[i][0]},${pts[i][1]})`),
      hl,
      label: `max-heap by distance², capacity ${k}`,
    });
    steps.push({ tag: 'init', trace: ['Track the ', A(k), ' closest points; the ', A('farthest of the chosen'), ' sits at the root, first in line for eviction.'], state: st() });
    for (let i = 0; i < pts.length; i++) {
      const d = pts[i][0] ** 2 + pts[i][1] ** 2;
      steps.push({ tag: 'dist', trace: ['Point (', A(pts[i][0]), ',', A(pts[i][1]), '): dist² = ', A(d), ' (no sqrt needed — ordering is identical).'], state: st() });
      const path = heap.push({ d, i });
      steps.push({ tag: 'push', trace: ['Push it into the heap.'], state: st(path) });
      if (heap.size > k) {
        const { v, path: p2 } = heap.pop();
        steps.push({ tag: 'trim', trace: ['Over capacity — evict the farthest: ', F(`(${pts[v.i][0]},${pts[v.i][1]})`), ' with dist² ', F(v.d), '.'], state: st(p2) });
      }
    }
    const res = [...heap.a].sort((x, y) => x.d - y.d).map(({ i }) => `[${pts[i][0]},${pts[i][1]}]`);
    steps.push({ tag: 'ret', trace: ['Survivors are the ', C(k), ' closest: ', C(res.join(', ')), '.'], state: st([...Array(heap.size)].map((_, i) => i)) });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'Two tricks stack: squared distance preserves order (skip the sqrt), and a max-heap capped at k keeps eviction O(log k). For huge streams of points this beats sorting all n by a factor of log n / log k.',
  complexity: { time: 'O(n log k)', space: 'O(k)' },
  brute: {
    label: 'Sort all points',
    technique: 'Compute every distance², sort all points by it, and take the first k.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> kClosest(vector<vector<int>>& p, int k) {'),
        L('        sort(p.begin(), p.end(), [](auto& a, auto& b) {', 'dist', 'sort'),
        L('            return a[0]*a[0] + a[1]*a[1] < b[0]*b[0] + b[1]*b[1];', 'dist', 'sort'),
        L('        });'),
        L('        return vector<vector<int>>(p.begin(), p.begin() + k);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] kClosest(int[][] p, int k) {'),
        L('        Arrays.sort(p, (a, b) -> (a[0]*a[0] + a[1]*a[1]) - (b[0]*b[0] + b[1]*b[1]));', 'dist', 'sort'),
        L('        return Arrays.copyOf(p, k);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parts = (values.points ?? '').split(';').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return { error: 'Enter points as "x y; x y; …".' };
      if (parts.length > 10) return { error: 'Keep it to at most 10 points.' };
      const pts: [number, number][] = [];
      for (const p of parts) {
        const m = p.split(/[\s,]+/).map(Number);
        if (m.length !== 2 || m.some((x) => !Number.isInteger(x))) return { error: `Bad point "${p}".` };
        pts.push([m[0], m[1]]);
      }
      const k = parseInt1(values.k, 'k', { min: 1 });
      if (typeof k === 'string') return { error: k };
      if (k > pts.length) return { error: 'k must be ≤ number of points.' };
      const steps: Step[] = [];
      const withD = pts.map((p) => ({ p, d: p[0] ** 2 + p[1] ** 2 }));
      steps.push({
        tag: 'dist',
        trace: ['Distance² for every point: ', A(withD.map(({ p, d }) => `(${p[0]},${p[1]})→${d}`).join(', ')), '.'],
        state: { heap: withD.map(({ p }) => `(${p[0]},${p[1]})`), label: 'all points, input order' },
      });
      const sorted = [...withD].sort((x, y) => x.d - y.d);
      steps.push({
        tag: 'sort',
        trace: ['Sort all ', A(pts.length), ' points by distance² — the first ', A(k), ' are the answer.'],
        state: { heap: sorted.map(({ p }) => `(${p[0]},${p[1]})`), hl: sorted.slice(0, k).map((_, i) => i), label: 'sorted by distance (drawn level by level)' },
      });
      const res = sorted.slice(0, k).map(({ p }) => `[${p[0]},${p[1]}]`);
      steps.push({ tag: 'ret', trace: ['The ', C(k), ' closest: ', C(res.join(', ')), '.'], state: { heap: res, ok: res.map((_, i) => i), label: 'result' } });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'A full sort costs O(n log n) even when k is 1. The size-k max-heap costs O(n log k), and quickselect on distance can reach O(n) on average.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  },
};

/* ================= 83. Task Scheduler ================= */
const taskScheduler: ProblemDef = {
  slug: 'task-scheduler',
  title: 'Task Scheduler',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/task-scheduler/',
  technique: 'Greedy by remaining count: the busiest task runs whenever its cooldown allows.',
  widget: 'stack',
  widgetTitle: 'Task counts & timeline',
  inputs: [
    { key: 'tasks', label: 'Tasks (letters)', defaultValue: 'A, A, A, B, B, B', wide: true },
    { key: 'n', label: 'Cooldown n', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int leastInterval(vector<char>& tasks, int n) {'),
      L('        int count[26] = {0};', 'init'),
      L('        for (char t : tasks) count[t - \'A\']++;', 'init'),
      L('        priority_queue<int> heap;', 'init'),
      L('        for (int c : count) if (c > 0) heap.push(c);', 'init'),
      L('        queue<pair<int, int>> cooldown;  // (count, ready time)', 'init'),
      L('        int time = 0;', 'init'),
      L('        while (!heap.empty() || !cooldown.empty()) {', 'loop'),
      L('            time++;', 'tick'),
      L('            if (heap.empty()) {', 'idle'),
      L('                time = cooldown.front().second;', 'idle'),
      L('            } else {'),
      L('                int c = heap.top() - 1; heap.pop();', 'runtask'),
      L('                if (c > 0)', 'cool'),
      L('                    cooldown.push({c, time + n});', 'cool'),
      L('            }'),
      L('            if (!cooldown.empty() && cooldown.front().second == time) {', 'ready'),
      L('                heap.push(cooldown.front().first);', 'ready'),
      L('                cooldown.pop();', 'ready'),
      L('            }'),
      L('        }'),
      L('        return time;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int leastInterval(char[] tasks, int n) {'),
      L('        int[] count = new int[26];', 'init'),
      L('        for (char t : tasks) count[t - \'A\']++;', 'init'),
      L('        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());', 'init'),
      L('        for (int c : count) if (c > 0) heap.add(c);', 'init'),
      L('        Deque<int[]> cooldown = new ArrayDeque<>();  // (count, ready time)', 'init'),
      L('        int time = 0;', 'init'),
      L('        while (!heap.isEmpty() || !cooldown.isEmpty()) {', 'loop'),
      L('            time++;', 'tick'),
      L('            if (heap.isEmpty()) {', 'idle'),
      L('                time = cooldown.peek()[1];', 'idle'),
      L('            } else {'),
      L('                int c = heap.poll() - 1;', 'runtask'),
      L('                if (c > 0)', 'cool'),
      L('                    cooldown.add(new int[]{c, time + n});', 'cool'),
      L('            }'),
      L('            if (!cooldown.isEmpty() && cooldown.peek()[1] == time) {', 'ready'),
      L('                heap.add(cooldown.poll()[0]);', 'ready'),
      L('            }'),
      L('        }'),
      L('        return time;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const tasks = (values.tasks ?? '').split(/[,\s]+/).map((t) => t.trim().toUpperCase()).filter(Boolean);
    if (tasks.length === 0) return { error: 'Enter tasks (letters).' };
    if (tasks.length > 14) return { error: 'Keep it to at most 14 tasks.' };
    if (!tasks.every((t) => /^[A-Z]$/.test(t))) return { error: 'Tasks must be single letters A–Z.' };
    const n = parseInt1(values.n, 'n', { min: 0, max: 6 });
    if (typeof n === 'string') return { error: n };

    const count = new Map<string, number>();
    for (const t of tasks) count.set(t, (count.get(t) ?? 0) + 1);
    const steps: Step[] = [];
    const timeline: string[] = [];
    // heap of [count, letter]; cooldown queue of [count, letter, readyTime]
    const heap: [number, string][] = [...count.entries()].map(([l, c]) => [c, l]);
    heap.sort((a, b) => b[0] - a[0]);
    const cooldown: [number, string, number][] = [];
    let time = 0;
    const view = (): StackState => ({
      stack: heap.map(([c, l], i) => ({ v: `${l}×${c}`, c: i === 0 ? ('a' as const) : undefined })),
      stackLabel: 'Ready (by count)',
      stack2: cooldown.map(([c, l, r]) => ({ v: `${l}×${c} @t${r}`, c: 'f' as const })),
      stack2Label: 'Cooling down',
      aggs: [
        { label: 'timeline', value: timeline.join(' ') || '—', c: 'c' },
        { label: 'time', value: String(time), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['Count each task: ', A([...count.entries()].map(([l, c]) => `${l}×${c}`).join(' ')), '. Cooldown n = ', A(n), ' slots between same tasks.'], state: view() });
    let guard = 0;
    while ((heap.length > 0 || cooldown.length > 0) && guard++ < 80) {
      time++;
      if (heap.length === 0) {
        timeline.push('·');
        steps.push({ tag: 'idle', trace: ['t', A(time), ': nothing is ready — the CPU ', F('idles'), ' this slot.'], state: view() });
      } else {
        heap.sort((a, b) => b[0] - a[0]);
        const [c, l] = heap.shift()!;
        timeline.push(l);
        steps.push({ tag: 'runtask', trace: ['t', A(time), ': run ', B(l), ' (the busiest ready task) — ', A(c - 1), ' left.'], state: view() });
        if (c - 1 > 0) {
          cooldown.push([c - 1, l, time + n + 1]);
          steps.push({ tag: 'cool', trace: [B(l), ' enters cooldown until t', A(time + n + 1), '.'], state: view() });
        }
      }
      while (cooldown.length > 0 && cooldown[0][2] <= time + 1) {
        const [c, l] = cooldown.shift()!;
        heap.push([c, l]);
        steps.push({ tag: 'ready', trace: [B(l), ' finished cooling — back in the ready pool.'], state: view() });
      }
    }
    steps.push({ tag: 'ret', trace: ['Schedule complete in ', C(time), ' intervals: ', C(timeline.join(' ')), '.'], state: view() });
    return { steps, result: String(time), resultDetail: `timeline: ${timeline.join(' ')}` };
  },
  note: 'Idle slots are forced only by the most frequent task — its copies fence off the schedule into (maxCount−1) gaps of width n. Greedily running the busiest ready task fills those gaps as densely as possible, which is provably optimal.',
  complexity: { time: 'O(T · log 26)', space: 'O(26)' },
  brute: {
    label: 'Counting formula',
    technique: 'The busiest task sets a frame of (maxCount − 1) blocks of length n + 1, plus one slot per task tied for the max; the answer is that or the task count, whichever is larger.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int leastInterval(vector<char>& tasks, int n) {'),
        L('        int cnt[26] = {0}, mx = 0, tied = 0;', 'count'),
        L('        for (char t : tasks) mx = max(mx, ++cnt[t - \'A\']);', 'count'),
        L('        for (int c : cnt) tied += (c == mx);', 'tied'),
        L('        int frame = (mx - 1) * (n + 1) + tied;', 'frame'),
        L('        return max((int) tasks.size(), frame);', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int leastInterval(char[] tasks, int n) {'),
        L('        int[] cnt = new int[26]; int mx = 0, tied = 0;', 'count'),
        L('        for (char t : tasks) mx = Math.max(mx, ++cnt[t - \'A\']);', 'count'),
        L('        for (int c : cnt) if (c == mx) tied++;', 'tied'),
        L('        int frame = (mx - 1) * (n + 1) + tied;', 'frame'),
        L('        return Math.max(tasks.length, frame);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const tasks = (values.tasks ?? '').split(/[,\s]+/).map((t) => t.trim().toUpperCase()).filter(Boolean);
      if (tasks.length === 0) return { error: 'Enter tasks (letters).' };
      if (tasks.length > 14) return { error: 'Keep it to at most 14 tasks.' };
      if (!tasks.every((t) => /^[A-Z]$/.test(t))) return { error: 'Tasks must be single letters A–Z.' };
      const n = parseInt1(values.n, 'n', { min: 0, max: 6 });
      if (typeof n === 'string') return { error: n };
      const count = new Map<string, number>();
      for (const t of tasks) count.set(t, (count.get(t) ?? 0) + 1);
      const mx = Math.max(...count.values());
      const tiedTasks = [...count.entries()].filter(([, c]) => c === mx).map(([t]) => t);
      const frame = (mx - 1) * (n + 1) + tiedTasks.length;
      const ans = Math.max(tasks.length, frame);
      const steps: Step[] = [];
      const counts = [...count.entries()].sort((a, b) => b[1] - a[1]);
      const st = (rows: string[], label: string): StackState => ({
        stack: rows.map((v, i) => ({ v, c: i === 0 ? ('a' as const) : undefined })),
        stackLabel: label,
        aggs: [
          { label: 'max count', value: String(mx), c: 'a' },
          { label: 'tied for max', value: tiedTasks.join(', '), c: 'b' },
          { label: 'answer', value: String(ans), c: 'c' },
        ],
      });
      steps.push({ tag: 'count', trace: ['Count tasks: ', A(counts.map(([t, c]) => `${t}×${c}`).join(', ')), '. The busiest appears ', A(mx), ' times.'], state: st(counts.map(([t, c]) => `${t} × ${c}`), 'task counts') });
      steps.push({ tag: 'tied', trace: [B(tiedTasks.length), ' task(s) share that maximum: ', B(tiedTasks.join(', ')), '.'], state: st(counts.map(([t, c]) => `${t} × ${c}`), 'task counts') });
      const blocks = [...Array(mx - 1)].map((_, i) => `block ${i + 1}: ${tiedTasks.join('')} + ${n + 1 - tiedTasks.length > 0 ? `${n + 1 - tiedTasks.length} slot(s)` : 'full'}`);
      steps.push({
        tag: 'frame',
        trace: ['Between copies of the busiest task, ', A(n), ' other slots must pass: ', A(mx - 1), ' block(s) of ', A(n + 1), ' plus a final ', A(tiedTasks.length), ' → ', B(frame), ' slots.'],
        state: st([...blocks, `last: ${tiedTasks.join('')}`], 'frame built around the busiest task'),
      });
      steps.push({
        tag: 'ret',
        trace: frame >= tasks.length
          ? ['The frame (', C(frame), ') holds every task, with idles filling the gaps. Answer ', C(ans), '.']
          : ['There are more tasks (', C(tasks.length), ') than frame slots — they fill every gap with no idling. Answer ', C(ans), '.'],
        state: st([...blocks, `last: ${tiedTasks.join('')}`], 'frame built around the busiest task'),
      });
      return { steps, result: String(ans), resultDetail: `${ans - tasks.length} idle slot(s)` };
    },
    note: 'Better than simulating: the schedule length is decided entirely by the busiest task, so one counting pass gives the answer in O(T) with no heap and no timeline.',
    complexity: { time: 'O(T)', space: 'O(26)' },
  },
};

/* ================= 84. Find Median from Data Stream ================= */
const medianStream: ProblemDef = {
  slug: 'find-median-from-data-stream',
  title: 'Find Median from Data Stream',
  category: 'Heap / Priority Queue',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/find-median-from-data-stream/',
  technique: 'Two balanced heaps: a max-heap of the lower half, a min-heap of the upper half.',
  widget: 'stack',
  widgetTitle: 'Lower half & upper half',
  inputs: [{ key: 'ops', label: 'Ops (add n / median)', defaultValue: 'add 1, add 2, median, add 3, median, add 0, median', wide: true }],
  code: {
    cpp: [
      L('class MedianFinder {'),
      L('    priority_queue<int> lo;                            // max-heap', 'init'),
      L('    priority_queue<int, vector<int>, greater<int>> hi; // min-heap', 'init'),
      L('public:'),
      L('    void addNum(int num) {', 'add'),
      L('        lo.push(num);', 'add'),
      L('        hi.push(lo.top()); lo.pop();', 'balance'),
      L('        if (hi.size() > lo.size()) {', 'rebal'),
      L('            lo.push(hi.top()); hi.pop();', 'rebal'),
      L('        }'),
      L('    }'),
      L('    double findMedian() {', 'median'),
      L('        if (lo.size() > hi.size()) return lo.top();', 'odd'),
      L('        return (lo.top() + hi.top()) / 2.0;', 'even'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class MedianFinder {'),
      L('    private PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder());', 'init'),
      L('    private PriorityQueue<Integer> hi = new PriorityQueue<>();', 'init'),
      L('    public void addNum(int num) {', 'add'),
      L('        lo.add(num);', 'add'),
      L('        hi.add(lo.poll());', 'balance'),
      L('        if (hi.size() > lo.size())', 'rebal'),
      L('            lo.add(hi.poll());', 'rebal'),
      L('    }'),
      L('    public double findMedian() {', 'median'),
      L('        if (lo.size() > hi.size()) return lo.peek();', 'odd'),
      L('        return (lo.peek() + hi.peek()) / 2.0;', 'even'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 14) return { error: 'Keep it to at most 14 operations.' };

    const steps: Step[] = [];
    const lo = new Heap<number>((x, y) => x > y);
    const hi = new Heap<number>((x, y) => x < y);
    const outputs: string[] = [];
    const view = (): StackState => ({
      stack: lo.a.map((v, i) => ({ v, c: i === 0 ? ('a' as const) : undefined })),
      stackLabel: 'Lower half (max-heap)',
      stack2: hi.a.map((v, i) => ({ v, c: i === 0 ? ('b' as const) : undefined })),
      stack2Label: 'Upper half (min-heap)',
      aggs: [{ label: 'medians', value: outputs.join(', ') || '—', c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Split the stream: everything ≤ median in the ', A('lower max-heap'), ', everything above in the ', B('upper min-heap'), ' — the median lives at the two roots.'], state: view() });
    for (const op of raw) {
      const mAdd = op.match(/^add\s+(-?\d+)$/i);
      if (mAdd) {
        const v = Number(mAdd[1]);
        lo.push(v);
        steps.push({ tag: 'add', trace: ['add(', A(v), ') — drop it into the lower heap first.'], state: view() });
        const { v: moved } = lo.pop();
        hi.push(moved);
        steps.push({ tag: 'balance', trace: ['Push the lower heap\'s max (', A(moved), ') into the upper heap — this guarantees every lower value ≤ every upper value.'], state: view() });
        if (hi.size > lo.size) {
          const { v: back } = hi.pop();
          lo.push(back);
          steps.push({ tag: 'rebal', trace: ['Sizes drifted — send ', B(back), ' back so the lower heap holds the extra element on odd counts.'], state: view() });
        }
      } else if (/^median$/i.test(op)) {
        if (lo.size === 0) return { error: 'median before any add.' };
        const med = lo.size > hi.size ? lo.top : (lo.top + hi.top) / 2;
        outputs.push(String(med));
        steps.push({
          tag: lo.size > hi.size ? 'odd' : 'even',
          trace: lo.size > hi.size
            ? ['findMedian() — odd count: the extra element is the lower root: ', C(med), '.']
            : ['findMedian() — even count: average the two roots (', A(lo.top), ' + ', B(hi.top), ')/2 = ', C(med), '.'],
          state: view(),
        });
      } else {
        return { error: `Unknown op "${op}". Use: add n, median.` };
      }
    }
    return { steps, result: outputs.join(', '), resultDetail: 'O(log n) insert, O(1) median' };
  },
  note: 'The median is a boundary, and the two heaps materialize it: each heap\'s root is one side of the cut. The push-through-then-rebalance dance maintains both invariants (partition + size) in O(log n), making the median itself a free read.',
  complexity: { time: 'O(log n) add, O(1) median', space: 'O(n)' },
  brute: {
    label: 'Sorted list',
    technique: 'Keep all numbers in one sorted list: insertion shifts elements, and the median is read from the middle.',
    code: {
      cpp: [
        L('class MedianFinder {'),
        L('    vector<int> all;  // kept sorted', 'init'),
        L('public:'),
        L('    void addNum(int num) {'),
        L('        all.insert(upper_bound(all.begin(), all.end(), num), num);', 'add'),
        L('    }'),
        L('    double findMedian() {'),
        L('        int n = all.size();', 'odd', 'even'),
        L('        return n % 2 ? all[n / 2] : (all[n / 2 - 1] + all[n / 2]) / 2.0;', 'odd', 'even'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class MedianFinder {'),
        L('    List<Integer> all = new ArrayList<>();  // kept sorted', 'init'),
        L('    public void addNum(int num) {'),
        L('        int i = 0;', 'add'),
        L('        while (i < all.size() && all.get(i) <= num) i++;', 'add'),
        L('        all.add(i, num);', 'add'),
        L('    }'),
        L('    public double findMedian() {'),
        L('        int n = all.size();', 'odd', 'even'),
        L('        return n % 2 == 1 ? all.get(n / 2) : (all.get(n / 2 - 1) + all.get(n / 2)) / 2.0;', 'odd', 'even'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
      if (raw.length === 0) return { error: 'Enter operations.' };
      if (raw.length > 14) return { error: 'Keep it to at most 14 operations.' };
      const steps: Step[] = [];
      const all: number[] = [];
      const outputs: string[] = [];
      let shifted = 0;
      const view = (mid: number[] = []): StackState => ({
        stack: all.map((v, i) => ({ v, c: mid.includes(i) ? ('b' as const) : undefined })),
        stackLabel: 'All numbers, sorted (bottom → top)',
        aggs: [
          { label: 'elements shifted', value: String(shifted), c: 'a' },
          { label: 'medians', value: outputs.join(', ') || '—', c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['One sorted list holds everything; the median is always in the middle.'], state: view() });
      for (const op of raw) {
        const mAdd = op.match(/^add\s+(-?\d+)$/i);
        if (mAdd) {
          const v = Number(mAdd[1]);
          let i = 0;
          while (i < all.length && all[i] <= v) i++;
          shifted += all.length - i;
          all.splice(i, 0, v);
          steps.push({ tag: 'add', trace: ['add(', A(v), ') — insert at position ', A(i), ', shifting ', A(all.length - 1 - i), ' element(s).'], state: view([i]) });
        } else if (/^median$/i.test(op)) {
          if (!all.length) return { error: 'median before any add.' };
          const n = all.length;
          const med = n % 2 ? all[(n - 1) / 2] : (all[n / 2 - 1] + all[n / 2]) / 2;
          outputs.push(String(med));
          steps.push({
            tag: n % 2 ? 'odd' : 'even',
            trace: n % 2 ? ['Odd count — the middle element is ', C(med), '.'] : ['Even count — average the two middle elements: ', C(med), '.'],
            state: view(n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]),
          });
        } else {
          return { error: `Unknown op "${op}". Use: add n, median.` };
        }
      }
      return { steps, result: outputs.join(', '), resultDetail: 'O(n) insert, O(1) median' };
    },
    note: 'findMedian is O(1), but every addNum shifts up to n elements, so a long stream costs O(n²) overall. Two heaps keep just the two middle values at their roots, making each insert O(log n).',
    complexity: { time: 'O(n) add, O(1) median', space: 'O(n)' },
  },
};

export const heapProblems = [kthLargestArray, kthLargestStream, lastStone, kClosest, taskScheduler, medianStream];
