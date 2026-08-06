// Tries & Design, Heap and Backtracking — Striver / Love Babbar sheet staples.
import type { ArrayState, HeapState, MatrixState, ProblemDef, StackState, Step, TreeState } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 320;

/* ============================================================
 * Tries & Design
 * ============================================================ */

/* ================= Maximum XOR of Two Numbers in an Array ================= */
const maximumXOR: ProblemDef = {
  slug: 'maximum-xor-of-two-numbers-in-an-array',
  title: 'Maximum XOR of Two Numbers in an Array',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/',
  technique: 'Build the answer bit by bit: greedily assume the next bit can be 1 and check if some pair delivers it.',
  widget: 'bits',
  widgetTitle: 'Answer being built bit by bit',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '3, 10, 5, 25, 2, 8', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findMaximumXOR(vector<int>& nums) {'),
      L('        int best = 0, mask = 0;', 'init'),
      L('        for (int bit = 31; bit >= 0; bit--) {', 'bit'),
      L('            mask |= (1 << bit);', 'mask'),
      L('            unordered_set<int> prefixes;'),
      L('            for (int x : nums) prefixes.insert(x & mask);', 'collect'),
      L('            int candidate = best | (1 << bit);', 'guess'),
      L('            for (int p : prefixes)', 'check'),
      L('                if (prefixes.count(p ^ candidate)) {', 'check'),
      L('                    best = candidate; break;', 'take'),
      L('                }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findMaximumXOR(int[] nums) {'),
      L('        int best = 0, mask = 0;', 'init'),
      L('        for (int bit = 31; bit >= 0; bit--) {', 'bit'),
      L('            mask |= (1 << bit);', 'mask'),
      L('            Set<Integer> prefixes = new HashSet<>();'),
      L('            for (int x : nums) prefixes.add(x & mask);', 'collect'),
      L('            int candidate = best | (1 << bit);', 'guess'),
      L('            for (int p : prefixes)', 'check'),
      L('                if (prefixes.contains(p ^ candidate)) {', 'check'),
      L('                    best = candidate; break;', 'take'),
      L('                }'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const nums = parseIntArray(values.nums, { min: 0, max: 255, maxLen: 10 });
    if (typeof nums === 'string') return { error: nums };
    const WIDTH = 8;
    const toBits = (n: number): (0 | 1)[] => [...Array(WIDTH)].map((_, i) => ((n >>> (WIDTH - 1 - i)) & 1) as 0 | 1);
    const steps: Step[] = [];
    let best = 0;
    let mask = 0;
    const view = (bit: number, note?: { label: string; value: string; c: 'a' | 'b' | 'c' }[]) => ({
      rows: [
        { label: `mask`, bits: toBits(mask), c: 'a' as const, hl: bit >= 0 ? [WIDTH - 1 - bit] : [] },
        { label: `best so far = ${best}`, bits: toBits(best), c: 'b' as const },
      ],
      aggs: note ?? [{ label: 'array', value: nums.join(', '), c: 'c' as const }],
    });
    steps.push({
      tag: 'init',
      trace: ['Trying every pair is O(n²). Instead build the answer from the ', A('top bit down'), ' — a 1 in a higher bit always beats anything below it.'],
      state: view(-1),
    });
    for (let bit = WIDTH - 1; bit >= 0; bit--) {
      mask |= 1 << bit;
      steps.push({
        tag: 'mask',
        trace: ['Extend the mask to bit ', A(bit), ' — from now on only the top ', A(WIDTH - bit), ' bit(s) of each number matter.'],
        state: view(bit),
      });
      const prefixes = new Set(nums.map((x) => x & mask));
      steps.push({
        tag: 'collect',
        trace: ['Masked prefixes: ', B([...prefixes].join(', ')), '.'],
        state: view(bit, [{ label: 'prefixes', value: [...prefixes].join(', '), c: 'b' }]),
      });
      const candidate = best | (1 << bit);
      steps.push({
        tag: 'guess',
        trace: ['Optimistically assume the answer can have a 1 here: candidate = ', A(candidate), '. Now check whether some pair actually produces it.'],
        state: view(bit, [{ label: 'candidate', value: String(candidate), c: 'a' }]),
      });
      let hit: [number, number] | null = null;
      for (const p of prefixes) {
        if (prefixes.has(p ^ candidate)) {
          hit = [p, p ^ candidate];
          break;
        }
      }
      if (hit) {
        best = candidate;
        steps.push({
          tag: 'take',
          trace: [
            'Because ', B('a ⊕ b = c'), ' implies ', B('a ⊕ c = b'), ', we only need one prefix whose partner is also present — ', A(hit[0]), ' and ', A(hit[1]),
            ' do it. Lock in ', C(best), '.',
          ],
          state: view(bit, [{ label: 'confirmed pair', value: `${hit[0]} ⊕ ${hit[1]}`, c: 'b' }]),
        });
      } else {
        steps.push({
          tag: 'check',
          trace: ['No pair of prefixes XORs to ', F(candidate), ' — this bit has to stay ', F(0), '.'],
          state: view(bit),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Maximum XOR of any two numbers: ', C(best), '.'],
      state: view(-1, [{ label: 'answer', value: String(best), c: 'c' }]),
    });
    return { steps, result: String(best) };
  },
  note: 'The identity a ⊕ b = c ⟺ a ⊕ c = b turns "is there a pair?" into a single hash lookup, which is what removes the inner loop. The trie solution stores the same prefixes as a binary tree and walks the opposite bit at each level — same greedy idea, different container.',
  complexity: { time: 'O(n · 32)', space: 'O(n)' },
};

/* ================= Replace Words ================= */
const replaceWords: ProblemDef = {
  slug: 'replace-words',
  title: 'Replace Words',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/replace-words/',
  technique: 'Store the roots in a trie, then walk each word until you land on an end-of-root marker.',
  widget: 'tree',
  widgetTitle: 'Trie of roots',
  inputs: [
    { key: 'roots', label: 'Dictionary roots', defaultValue: 'cat, bat, rat', wide: true },
    { key: 'sentence', label: 'Sentence', defaultValue: 'the cattle was rattled by the battery', wide: true },
  ],
  code: {
    cpp: [
      L('struct Node { Node* kid[26] = {}; bool end = false; };'),
      L('class Solution {'),
      L('    Node* root = new Node();'),
      L('public:'),
      L('    string replaceWords(vector<string>& dict, string s) {'),
      L('        for (auto& w : dict) insert(w);', 'build'),
      L('        stringstream in(s); string word, out;'),
      L('        while (in >> word) {', 'word'),
      L('            out += (out.empty() ? "" : " ") + shortest(word);', 'word'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('    string shortest(string& w) {'),
      L('        Node* n = root;'),
      L('        for (int i = 0; i < w.size(); i++) {', 'walk'),
      L('            if (!n->kid[w[i]-\'a\']) break;', 'miss'),
      L('            n = n->kid[w[i]-\'a\'];', 'walk'),
      L('            if (n->end) return w.substr(0, i + 1);', 'hit'),
      L('        }'),
      L('        return w;', 'keep'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    class Node { Node[] kid = new Node[26]; boolean end; }'),
      L('    Node root = new Node();'),
      L('    public String replaceWords(List<String> dict, String s) {'),
      L('        for (String w : dict) insert(w);', 'build'),
      L('        StringBuilder out = new StringBuilder();'),
      L('        for (String word : s.split(" ")) {', 'word'),
      L('            if (out.length() > 0) out.append(" ");'),
      L('            out.append(shortest(word));', 'word'),
      L('        }'),
      L('        return out.toString();', 'ret'),
      L('    }'),
      L('    String shortest(String w) {'),
      L('        Node n = root;'),
      L('        for (int i = 0; i < w.length(); i++) {', 'walk'),
      L('            int c = w.charAt(i) - \'a\';'),
      L('            if (n.kid[c] == null) break;', 'miss'),
      L('            n = n.kid[c];', 'walk'),
      L('            if (n.end) return w.substring(0, i + 1);', 'hit'),
      L('        }'),
      L('        return w;', 'keep'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const roots = (values.roots ?? '')
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (roots.length === 0) return { error: 'Enter at least one root.' };
    if (roots.length > 6 || roots.some((r) => !/^[a-z]{1,8}$/.test(r))) return { error: 'Up to 6 roots, each 1–8 lowercase letters.' };
    const words = (values.sentence ?? '')
      .split(/\s+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0) return { error: 'Enter a sentence.' };
    if (words.length > 10 || words.some((w) => !/^[a-z]+$/.test(w))) return { error: 'Up to 10 words, lowercase letters only.' };

    // Build a display trie using TNode-shaped layout.
    interface TrieNode {
      id: number;
      ch: string;
      end: boolean;
      kids: Map<string, TrieNode>;
      depth: number;
    }
    let nextId = 0;
    const root: TrieNode = { id: nextId++, ch: '·', end: false, kids: new Map(), depth: 0 };
    for (const r of roots) {
      let n = root;
      for (const c of r) {
        if (!n.kids.has(c)) n.kids.set(c, { id: nextId++, ch: c, end: false, kids: new Map(), depth: n.depth + 1 });
        n = n.kids.get(c)!;
      }
      n.end = true;
    }
    const flat: TrieNode[] = [];
    const edges: [number, number][] = [];
    let maxDepth = 0;
    const walkAll = (n: TrieNode) => {
      flat.push(n);
      maxDepth = Math.max(maxDepth, n.depth);
      for (const k of n.kids.values()) {
        edges.push([n.id, k.id]);
        walkAll(k);
      }
    };
    walkAll(root);
    const leafOrder: number[] = [];
    const order = (n: TrieNode) => {
      if (n.kids.size === 0) leafOrder.push(n.id);
      for (const k of n.kids.values()) order(k);
    };
    order(root);
    const xOf = new Map<number, number>();
    const assignX = (n: TrieNode): number => {
      if (n.kids.size === 0) {
        const x = (leafOrder.indexOf(n.id) + 0.5) / Math.max(leafOrder.length, 1);
        xOf.set(n.id, x);
        return x;
      }
      const kids = [...n.kids.values()].map(assignX);
      const x = kids.reduce((a, b) => a + b, 0) / kids.length;
      xOf.set(n.id, x);
      return x;
    };
    assignX(root);

    const steps: Step[] = [];
    const out: string[] = [];
    const view = (cur: number | null, active: number[], note: { label: string; value: string; c: 'a' | 'b' | 'c' }[]): TreeState => ({
      nodes: flat.map((n) => ({ id: n.id, val: n.ch, x: xOf.get(n.id)!, y: maxDepth === 0 ? 0.5 : n.depth / maxDepth, badge: n.end ? '★' : undefined })),
      edges,
      current: cur,
      done: active,
      aggs: note,
    });
    steps.push({
      tag: 'build',
      trace: [
        'Insert every root into a trie; ', A('★'), ' marks where a root ends. Now a word can be matched against all ', A(roots.length), ' roots in one walk.',
      ],
      state: view(root.id, [], [{ label: 'roots', value: roots.join(', '), c: 'a' }]),
    });
    for (const w of words) {
      steps.push({
        tag: 'word',
        trace: ['Word "', A(w), '" — walk it down the trie one letter at a time.'],
        state: view(root.id, [], [{ label: 'sentence so far', value: out.join(' ') || '—', c: 'c' }]),
      });
      let n = root;
      const path: number[] = [root.id];
      let replaced: string | null = null;
      for (let i = 0; i < w.length; i++) {
        const c = w[i];
        if (!n.kids.has(c)) {
          steps.push({
            tag: 'miss',
            trace: ["No '", F(c), "' branch — no root is a prefix of \"", F(w), '". Keep the word as it is.'],
            state: view(n.id, path, [{ label: 'sentence so far', value: out.join(' ') || '—', c: 'c' }]),
          });
          break;
        }
        n = n.kids.get(c)!;
        path.push(n.id);
        steps.push({
          tag: 'walk',
          trace: ["Matched '", A(c), "' — now at depth ", A(n.depth), ' ("', B(w.slice(0, i + 1)), '").'],
          state: view(n.id, path, [{ label: 'sentence so far', value: out.join(' ') || '—', c: 'c' }]),
        });
        if (n.end) {
          replaced = w.slice(0, i + 1);
          steps.push({
            tag: 'hit',
            trace: [
              'Hit a ', B('★'), ' — "', C(replaced), '" is a root. Stopping here is what gives the ', A('shortest'), ' root, since any longer match lies deeper.',
            ],
            state: view(n.id, path, [{ label: 'replacing', value: `${w} → ${replaced}`, c: 'b' }]),
          });
          break;
        }
        if (steps.length > MAX_STEPS) break;
      }
      if (!replaced) {
        steps.push({
          tag: 'keep',
          trace: ['"', B(w), '" is unchanged.'],
          state: view(null, [], [{ label: 'sentence so far', value: [...out, w].join(' '), c: 'c' }]),
        });
      }
      out.push(replaced ?? w);
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Result: "', C(out.join(' ')), '".'],
      state: view(null, [], [{ label: 'result', value: out.join(' '), c: 'c' }]),
    });
    return { steps, result: out.join(' ') };
  },
  note: 'Returning at the first ★ is what satisfies "replace with the shortest root" — a deeper marker would be a longer root, so stopping early is not just an optimisation but part of the specification. A hash set of roots also works, but you would have to try every prefix length separately.',
  complexity: { time: 'O(total characters)', space: 'O(dictionary size)' },
};

/* ================= Design Browser History ================= */
const browserHistory: ProblemDef = {
  slug: 'design-browser-history',
  title: 'Design Browser History',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-browser-history/',
  technique: 'One array plus a cursor — visiting truncates everything ahead of it.',
  widget: 'stack',
  widgetTitle: 'History array & cursor',
  inputs: [{ key: 'ops', label: 'Operations', defaultValue: 'visit b, visit c, back 1, back 1, forward 1, visit d, forward 2', wide: true }],
  code: {
    cpp: [
      L('class BrowserHistory {'),
      L('    vector<string> hist; int cur = 0;'),
      L('public:'),
      L('    BrowserHistory(string homepage) { hist.push_back(homepage); }', 'init'),
      L('    void visit(string url) {'),
      L('        hist.resize(cur + 1);      // drop the forward history', 'truncate'),
      L('        hist.push_back(url);', 'visit'),
      L('        cur++;', 'visit'),
      L('    }'),
      L('    string back(int steps) {'),
      L('        cur = max(0, cur - steps);', 'back'),
      L('        return hist[cur];', 'back'),
      L('    }'),
      L('    string forward(int steps) {'),
      L('        cur = min((int)hist.size() - 1, cur + steps);', 'forward'),
      L('        return hist[cur];', 'forward'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class BrowserHistory {'),
      L('    List<String> hist = new ArrayList<>(); int cur = 0;'),
      L('    public BrowserHistory(String homepage) { hist.add(homepage); }', 'init'),
      L('    public void visit(String url) {'),
      L('        while (hist.size() > cur + 1)', 'truncate'),
      L('            hist.remove(hist.size() - 1);', 'truncate'),
      L('        hist.add(url);', 'visit'),
      L('        cur++;', 'visit'),
      L('    }'),
      L('    public String back(int steps) {'),
      L('        cur = Math.max(0, cur - steps);', 'back'),
      L('        return hist.get(cur);', 'back'),
      L('    }'),
      L('    public String forward(int steps) {'),
      L('        cur = Math.min(hist.size() - 1, cur + steps);', 'forward'),
      L('        return hist.get(cur);', 'forward'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter at least one operation.' };
    if (raw.length > 12) return { error: 'Keep it to at most 12 operations.' };
    const hist: string[] = ['a'];
    let cur = 0;
    const steps: Step[] = [];
    const returned: string[] = [];
    const st = (): StackState => ({
      array: {
        arr: hist,
        mark: Object.fromEntries(hist.map((_, i) => [i, i === cur ? ('active' as const) : i < cur ? ('good' as const) : ('dim' as const)])),
        ptrs: [{ name: 'cur', i: cur, c: 'a' }],
      },
      stack: [],
      stackLabel: '',
      aggs: [
        { label: 'current page', value: hist[cur], c: 'a' },
        { label: 'forward pages available', value: String(hist.length - 1 - cur), c: 'b' },
        { label: 'returned', value: returned.join(', ') || '—', c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: ['Start on homepage "', A('a'), '". A single array plus a cursor models the whole thing — no two stacks needed.'],
      state: st(),
    });
    for (const op of raw) {
      const [name, arg] = op.split(/\s+/);
      const cmd = name.toLowerCase();
      if (cmd === 'visit') {
        if (!arg) return { error: `"${op}" needs a page name, e.g. "visit b".` };
        const dropped = hist.length - 1 - cur;
        if (dropped > 0) {
          hist.length = cur + 1;
          steps.push({
            tag: 'truncate',
            trace: ['Visiting from the middle of history ', F('erases'), ' the ', F(dropped), ' page(s) ahead — exactly what a real browser does.'],
            state: st(),
          });
        }
        hist.push(arg);
        cur++;
        steps.push({ tag: 'visit', trace: ['visit("', A(arg), '") — appended and the cursor moves to ', B(cur), '.'], state: st() });
      } else if (cmd === 'back' || cmd === 'forward') {
        const k = Number(arg);
        if (!Number.isInteger(k) || k < 1) return { error: `"${op}" needs a positive step count, e.g. "back 2".` };
        const before = cur;
        cur = cmd === 'back' ? Math.max(0, cur - k) : Math.min(hist.length - 1, cur + k);
        returned.push(hist[cur]);
        steps.push({
          tag: cmd,
          trace: [
            cmd, '(', A(k), ') — asked to move ', A(k), ' step(s) from ', A(before), ', clamped to ', B(cur), '. Returns "', C(hist[cur]), '".',
          ],
          state: st(),
        });
      } else {
        return { error: `Unknown operation "${op}". Use visit <page>, back <n> or forward <n>.` };
      }
      if (steps.length > MAX_STEPS) break;
    }
    return { steps, result: returned.join(', ') || 'no values returned', resultDetail: `now on "${hist[cur]}"` };
  },
  note: 'Clamping instead of erroring is the specified behaviour — "move as far as you can" — and it removes every bounds check from the calling code. The two-stack design also works, but truncation on visit becomes a loop of pops, and peeking the current page needs an extra variable anyway.',
  complexity: { time: 'O(1) back/forward, O(n) worst-case visit', space: 'O(n)' },
};

/* ================= LFU Cache ================= */
const lfuCache: ProblemDef = {
  slug: 'lfu-cache',
  title: 'LFU Cache',
  category: 'Tries & Design',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/lfu-cache/',
  technique: 'Bucket keys by use count; evict from the smallest bucket, oldest first.',
  widget: 'stack',
  widgetTitle: 'Cache contents by frequency',
  inputs: [
    { key: 'cap', label: 'Capacity', defaultValue: '2' },
    { key: 'ops', label: 'Operations', defaultValue: 'put 1 1, put 2 2, get 1, put 3 3, get 2, get 3', wide: true },
  ],
  code: {
    cpp: [
      L('class LFUCache {'),
      L('    int cap, minFreq = 0;'),
      L('    unordered_map<int, pair<int,int>> kv;        // key -> {value, freq}'),
      L('    unordered_map<int, list<int>> buckets;       // freq -> keys, LRU order'),
      L('    unordered_map<int, list<int>::iterator> pos;'),
      L('public:'),
      L('    int get(int key) {'),
      L('        if (!kv.count(key)) return -1;', 'miss'),
      L('        touch(key);', 'touch'),
      L('        return kv[key].first;', 'hit'),
      L('    }'),
      L('    void put(int key, int value) {'),
      L('        if (cap == 0) return;'),
      L('        if (kv.count(key)) { kv[key].first = value; touch(key); return; }', 'update'),
      L('        if (kv.size() == cap) {', 'evict'),
      L('            int victim = buckets[minFreq].back();', 'evict'),
      L('            buckets[minFreq].pop_back(); kv.erase(victim);', 'evict'),
      L('        }'),
      L('        kv[key] = {value, 1};', 'insert'),
      L('        buckets[1].push_front(key); minFreq = 1;', 'insert'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class LFUCache {'),
      L('    int cap, minFreq = 0;'),
      L('    Map<Integer,int[]> kv = new HashMap<>();          // key -> {value, freq}'),
      L('    Map<Integer,LinkedHashSet<Integer>> buckets = new HashMap<>();'),
      L('    public int get(int key) {'),
      L('        if (!kv.containsKey(key)) return -1;', 'miss'),
      L('        touch(key);', 'touch'),
      L('        return kv.get(key)[0];', 'hit'),
      L('    }'),
      L('    public void put(int key, int value) {'),
      L('        if (cap == 0) return;'),
      L('        if (kv.containsKey(key)) {', 'update'),
      L('            kv.get(key)[0] = value; touch(key); return;', 'update'),
      L('        }'),
      L('        if (kv.size() == cap) {', 'evict'),
      L('            int victim = buckets.get(minFreq).iterator().next();', 'evict'),
      L('            buckets.get(minFreq).remove(victim); kv.remove(victim);', 'evict'),
      L('        }'),
      L('        kv.put(key, new int[]{value, 1});', 'insert'),
      L('        buckets.computeIfAbsent(1, x -> new LinkedHashSet<>()).add(key);', 'insert'),
      L('        minFreq = 1;', 'insert'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const cap = parseInt1(values.cap, 'Capacity', { min: 1, max: 4 });
    if (typeof cap === 'string') return { error: cap };
    const raw = (values.ops ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter at least one operation.' };
    if (raw.length > 12) return { error: 'Keep it to at most 12 operations.' };

    const kv = new Map<number, { value: number; freq: number; seq: number }>();
    let seq = 0;
    let minFreq = 0;
    const returned: string[] = [];
    const steps: Step[] = [];
    const st = (mark?: number): StackState => {
      const byFreq = new Map<number, { key: number; value: number; seq: number }[]>();
      for (const [k, e] of kv) {
        if (!byFreq.has(e.freq)) byFreq.set(e.freq, []);
        byFreq.get(e.freq)!.push({ key: k, value: e.value, seq: e.seq });
      }
      const freqs = [...byFreq.keys()].sort((a, b) => a - b);
      return {
        stack: freqs.flatMap((f) =>
          byFreq
            .get(f)!
            .sort((a, b) => b.seq - a.seq)
            .map((e) => ({ v: `freq ${f}: key ${e.key} = ${e.value}`, c: e.key === mark ? ('a' as const) : f === minFreq ? ('b' as const) : ('f' as const) }))
        ),
        stackLabel: `cache (${kv.size}/${cap}) — grouped by use count`,
        aggs: [
          { label: 'min frequency', value: kv.size ? String(minFreq) : '—', c: 'a' },
          { label: 'returned', value: returned.join(', ') || '—', c: 'c' },
        ],
      };
    };
    const recomputeMin = () => {
      minFreq = kv.size ? Math.min(...[...kv.values()].map((e) => e.freq)) : 0;
    };
    steps.push({
      tag: 'insert',
      trace: [
        'LFU evicts the ', A('least used'), ' key. Ties are broken by ', B('least recently used'), ', so each frequency bucket keeps its own recency order.',
      ],
      state: st(),
    });
    for (const op of raw) {
      const parts = op.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      if (cmd === 'get') {
        const key = Number(parts[1]);
        if (!Number.isInteger(key)) return { error: `"${op}" needs a key, e.g. "get 1".` };
        if (!kv.has(key)) {
          returned.push('-1');
          steps.push({ tag: 'miss', trace: ['get(', A(key), ') — not in the cache, return ', C(-1), '.'], state: st() });
        } else {
          const e = kv.get(key)!;
          e.freq++;
          e.seq = ++seq;
          recomputeMin();
          returned.push(String(e.value));
          steps.push({
            tag: 'touch',
            trace: ['get(', A(key), ') — its use count rises to ', B(e.freq), ', so it leaves the low-frequency bucket.'],
            state: st(key),
          });
          steps.push({ tag: 'hit', trace: ['Return ', C(e.value), '.'], state: st(key) });
        }
      } else if (cmd === 'put') {
        const key = Number(parts[1]);
        const value = Number(parts[2]);
        if (!Number.isInteger(key) || !Number.isInteger(value)) return { error: `"${op}" needs a key and value, e.g. "put 1 5".` };
        if (kv.has(key)) {
          const e = kv.get(key)!;
          e.value = value;
          e.freq++;
          e.seq = ++seq;
          recomputeMin();
          steps.push({ tag: 'update', trace: ['put(', A(key), ', ', A(value), ') — key already present, so this is an update and also counts as a use.'], state: st(key) });
        } else {
          if (kv.size === cap) {
            const candidates = [...kv.entries()].filter(([, e]) => e.freq === minFreq);
            const victim = candidates.sort((a, b) => a[1].seq - b[1].seq)[0];
            kv.delete(victim[0]);
            steps.push({
              tag: 'evict',
              trace: [
                'Cache is full. The smallest use count is ', F(minFreq), '; among those, key ', F(victim[0]), ' is the least recently used — ', F('evict'), ' it.',
              ],
              state: st(),
            });
          }
          kv.set(key, { value, freq: 1, seq: ++seq });
          minFreq = 1;
          steps.push({
            tag: 'insert',
            trace: ['Insert key ', A(key), ' = ', A(value), ' with count ', B(1), '. A brand-new key always resets minFreq to ', B(1), '.'],
            state: st(key),
          });
        }
      } else {
        return { error: `Unknown operation "${op}". Use get <k> or put <k> <v>.` };
      }
      if (steps.length > MAX_STEPS) break;
    }
    return { steps, result: returned.join(', ') || 'no gets performed', resultDetail: `${kv.size} key(s) cached` };
  },
  note: 'Tracking minFreq explicitly is what keeps every operation O(1) — it only ever increases by one on a touch, or resets to 1 on an insert, so it never needs searching. Getting LFU right means remembering that an insert makes minFreq 1 unconditionally, even if every other key is used far more.',
  complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
};

/* ============================================================
 * Heap / Priority Queue
 * ============================================================ */

class MinHeap<T> {
  a: T[] = [];
  constructor(private lt: (x: T, y: T) => boolean) {}
  get size() {
    return this.a.length;
  }
  get top() {
    return this.a[0];
  }
  push(v: T) {
    this.a.push(v);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.lt(this.a[i], this.a[p])) break;
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }
  pop(): T {
    const top = this.a[0];
    const last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < this.a.length && this.lt(this.a[l], this.a[m])) m = l;
        if (r < this.a.length && this.lt(this.a[r], this.a[m])) m = r;
        if (m === i) break;
        [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
        i = m;
      }
    }
    return top;
  }
}

/* ================= Top K Frequent Words ================= */
const topKWords: ProblemDef = {
  slug: 'top-k-frequent-words',
  title: 'Top K Frequent Words',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/top-k-frequent-words/',
  technique: 'Count, then keep a size-k heap whose weakest entry is the one most easily beaten.',
  widget: 'heap',
  widgetTitle: 'Size-k heap (weakest at the root)',
  inputs: [
    { key: 'words', label: 'Words', defaultValue: 'i, love, leetcode, i, love, coding', wide: true },
    { key: 'k', label: 'k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<string> topKFrequent(vector<string>& words, int k) {'),
      L('        unordered_map<string,int> cnt;'),
      L('        for (auto& w : words) cnt[w]++;', 'count'),
      L('        auto worse = [](auto& a, auto& b) {'),
      L('            return a.second != b.second ? a.second > b.second', 'cmp'),
      L('                                        : a.first < b.first;', 'cmp'),
      L('        };'),
      L('        priority_queue<pair<string,int>, vector<pair<string,int>>,'),
      L('                       decltype(worse)> pq(worse);'),
      L('        for (auto& e : cnt) {', 'push'),
      L('            pq.push(e);', 'push'),
      L('            if (pq.size() > k) pq.pop();', 'evict'),
      L('        }'),
      L('        vector<string> res(k);'),
      L('        for (int i = k - 1; i >= 0; i--) {', 'drain'),
      L('            res[i] = pq.top().first; pq.pop();', 'drain'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<String> topKFrequent(String[] words, int k) {'),
      L('        Map<String,Integer> cnt = new HashMap<>();'),
      L('        for (String w : words) cnt.merge(w, 1, Integer::sum);', 'count'),
      L('        PriorityQueue<String> pq = new PriorityQueue<>(', 'cmp'),
      L('            (a, b) -> cnt.get(a).equals(cnt.get(b))', 'cmp'),
      L('                    ? b.compareTo(a) : cnt.get(a) - cnt.get(b));', 'cmp'),
      L('        for (String w : cnt.keySet()) {', 'push'),
      L('            pq.add(w);', 'push'),
      L('            if (pq.size() > k) pq.poll();', 'evict'),
      L('        }'),
      L('        List<String> res = new ArrayList<>();'),
      L('        while (!pq.isEmpty()) res.add(0, pq.poll());', 'drain'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const words = (values.words ?? '')
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0) return { error: 'Enter at least one word.' };
    if (words.length > 14 || words.some((w) => !/^[a-z]{1,10}$/.test(w))) return { error: 'Up to 14 words, each 1–10 lowercase letters.' };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const cnt = new Map<string, number>();
    for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
    if (k > cnt.size) return { error: `k cannot exceed the number of distinct words (${cnt.size}).` };

    const steps: Step[] = [];
    // "worse" = should be evicted first: lower count, or same count and lexicographically larger.
    const worse = (a: [string, number], b: [string, number]) => (a[1] !== b[1] ? a[1] < b[1] : a[0] > b[0]);
    const heap = new MinHeap<[string, number]>(worse);
    const view = (hl: number[] = [], note?: string): HeapState => ({
      heap: heap.a.map(([w, c]) => `${w}×${c}`),
      hl,
      label: note ?? 'heap root = the entry most likely to be dropped',
      aggs: [{ label: 'counts', value: [...cnt.entries()].map(([w, c]) => `${w}:${c}`).join('  '), c: 'b' }],
    });
    steps.push({
      tag: 'count',
      trace: ['Count every word first: ', B([...cnt.entries()].map(([w, c]) => `${w}×${c}`).join(', ')), '.'],
      state: view(),
    });
    steps.push({
      tag: 'cmp',
      trace: [
        'The comparator has two keys: fewer occurrences is weaker, and on a tie the ', A('alphabetically later'), ' word is weaker — that is how ties resolve in favour of earlier words.',
      ],
      state: view(),
    });
    for (const e of cnt.entries()) {
      heap.push(e);
      steps.push({ tag: 'push', trace: ['Push ', A(e[0]), '×', A(e[1]), ' — heap size ', B(heap.size), '.'], state: view([0]) });
      if (heap.size > k) {
        const dropped = heap.pop();
        steps.push({
          tag: 'evict',
          trace: ['Over capacity — drop the weakest entry ', F(`${dropped[0]}×${dropped[1]}`), '. The heap always holds the best ', B(k), ' seen so far.'],
          state: view([0]),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const res: string[] = [];
    while (heap.size) {
      const e = heap.pop();
      res.unshift(e[0]);
      steps.push({
        tag: 'drain',
        trace: ['Pop ', A(e[0]), ' — the heap gives the ', A('weakest'), ' first, so fill the answer from the ', B('back'), '.'],
        state: view([], `draining — answer so far: ${res.join(', ')}`),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Top ', C(k), ' word(s): ', C(res.join(', ')), '.'],
      state: { heap: res, ok: res.map((_, i) => i), label: 'result', aggs: [{ label: 'answer', value: res.join(', '), c: 'c' }] },
    });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'Capping the heap at k gives O(n log k) rather than O(n log n) — a real win when k is small and n is large. The tie-break must be inverted inside the heap: because the root is what gets discarded, the alphabetically later word has to compare as "smaller".',
  complexity: { time: 'O(n log k)', space: 'O(n)' },
};

/* ================= Kth Smallest Element in a Sorted Matrix ================= */
const kthSmallestMatrix: ProblemDef = {
  slug: 'kth-smallest-element-in-a-sorted-matrix',
  title: 'Kth Smallest Element in a Sorted Matrix',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/',
  technique: 'Merge the sorted rows with a heap holding one candidate per row.',
  widget: 'matrix',
  widgetTitle: 'Sorted matrix',
  inputs: [
    { key: 'grid', label: 'Matrix (rows ";" separated)', defaultValue: '1,5,9;10,11,13;12,13,15', wide: true },
    { key: 'k', label: 'k', defaultValue: '8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int kthSmallest(vector<vector<int>>& m, int k) {'),
      L('        int n = m.size();'),
      L('        priority_queue<array<int,3>, vector<array<int,3>>, greater<>> pq;'),
      L('        for (int r = 0; r < min(n, k); r++)', 'seed'),
      L('            pq.push({m[r][0], r, 0});', 'seed'),
      L('        while (--k) {', 'loop'),
      L('            auto [val, r, c] = pq.top(); pq.pop();', 'pop'),
      L('            if (c + 1 < n) pq.push({m[r][c+1], r, c+1});', 'push'),
      L('        }'),
      L('        return pq.top()[0];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int kthSmallest(int[][] m, int k) {'),
      L('        int n = m.length;'),
      L('        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0]-b[0]);'),
      L('        for (int r = 0; r < Math.min(n, k); r++)', 'seed'),
      L('            pq.add(new int[]{m[r][0], r, 0});', 'seed'),
      L('        while (--k > 0) {', 'loop'),
      L('            int[] e = pq.poll();', 'pop'),
      L('            if (e[2] + 1 < n)', 'push'),
      L('                pq.add(new int[]{m[e[1]][e[2]+1], e[1], e[2]+1});', 'push'),
      L('        }'),
      L('        return pq.peek()[0];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.grid ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
    if (rows.length === 0) return { error: 'Enter a matrix, rows separated by ";".' };
    if (rows.some((r) => r.some((v) => !Number.isFinite(v)))) return { error: 'All entries must be numbers.' };
    const n = rows.length;
    if (!rows.every((r) => r.length === n)) return { error: 'The matrix must be square.' };
    if (n > 5) return { error: 'Keep it to at most 5×5.' };
    for (const r of rows) for (let c = 1; c < n; c++) if (r[c] < r[c - 1]) return { error: 'Each row must be sorted ascending.' };
    for (let c = 0; c < n; c++) for (let r = 1; r < n; r++) if (rows[r][c] < rows[r - 1][c]) return { error: 'Each column must be sorted ascending.' };
    let k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    if (k > n * n) return { error: `k cannot exceed the number of cells (${n * n}).` };

    const steps: Step[] = [];
    const heap = new MinHeap<{ val: number; r: number; c: number }>((x, y) => x.val < y.val);
    const popped: string[] = [];
    const view = (active?: string): MatrixState => ({
      grid: rows,
      rowLabels: [...Array(n)].map((_, i) => i),
      colLabels: [...Array(n)].map((_, i) => i),
      mark: {
        ...Object.fromEntries(popped.map((key) => [key, 'dim' as const])),
        ...Object.fromEntries(heap.a.map((e) => [`${e.r},${e.c}`, 'good' as const])),
        ...(active ? { [active]: 'active' as const } : {}),
      },
      aggs: [
        { label: 'heap', value: heap.a.map((e) => e.val).join(', ') || '—', c: 'b' },
        { label: 'popped so far', value: String(popped.length), c: 'c' },
      ],
    });
    const seedRows = Math.min(n, k);
    for (let r = 0; r < seedRows; r++) heap.push({ val: rows[r][0], r, c: 0 });
    steps.push({
      tag: 'seed',
      trace: [
        'Every row is sorted, so the overall smallest must be one of the ', A('row heads'), '. Seed the heap with the first ', A(seedRows), ' of them.',
      ],
      state: view(),
    });
    let remaining = k;
    while (remaining > 1) {
      const e = heap.pop();
      popped.push(`${e.r},${e.c}`);
      steps.push({
        tag: 'pop',
        trace: ['Pop ', A(e.val), ' from row ', A(e.r), ' — that is the ', B(popped.length), ordinal(popped.length), ' smallest overall.'],
        state: view(`${e.r},${e.c}`),
      });
      if (e.c + 1 < n) {
        heap.push({ val: rows[e.r][e.c + 1], r: e.r, c: e.c + 1 });
        steps.push({
          tag: 'push',
          trace: ['Refill from the same row with its next value ', B(rows[e.r][e.c + 1]), ' — the heap keeps exactly one live candidate per row.'],
          state: view(`${e.r},${e.c + 1}`),
        });
      } else {
        steps.push({ tag: 'push', trace: ['Row ', F(e.r), ' is exhausted — nothing to refill.'], state: view() });
      }
      remaining--;
      if (steps.length > MAX_STEPS) break;
    }
    const ans = heap.top.val;
    steps.push({
      tag: 'ret',
      trace: ['The heap root is now the ', C(k), ordinal(k), ' smallest: ', C(ans), '.'],
      state: view(`${heap.top.r},${heap.top.c}`),
    });
    return { steps, result: String(ans) };
  },
  note: 'This is a k-way merge of n sorted lists, so the heap never exceeds n entries no matter how large the matrix is. Binary-searching the value range instead gives O(n log(max−min)) and beats this when k approaches n² — worth mentioning if the interviewer pushes on complexity.',
  complexity: { time: 'O(k log n)', space: 'O(n)' },
};

const ordinal = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

/* ================= Reorganize String ================= */
const reorganizeString: ProblemDef = {
  slug: 'reorganize-string',
  title: 'Reorganize String',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/reorganize-string/',
  technique: 'Always place the most frequent remaining character that is not the one just used.',
  widget: 'heap',
  widgetTitle: 'Max-heap of remaining characters',
  inputs: [{ key: 's', label: 'String', defaultValue: 'aab', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    string reorganizeString(string s) {'),
      L('        int cnt[26] = {};'),
      L('        for (char c : s) cnt[c - \'a\']++;', 'count'),
      L('        priority_queue<pair<int,char>> pq;'),
      L('        for (int i = 0; i < 26; i++)', 'build'),
      L('            if (cnt[i]) {', 'build'),
      L('                if (cnt[i] > (s.size() + 1) / 2) return "";', 'impossible'),
      L('                pq.push({cnt[i], \'a\' + i});', 'build'),
      L('            }'),
      L('        string out;'),
      L('        while (pq.size() > 1) {', 'pair'),
      L('            auto [c1, ch1] = pq.top(); pq.pop();', 'pair'),
      L('            auto [c2, ch2] = pq.top(); pq.pop();', 'pair'),
      L('            out += ch1; out += ch2;', 'place'),
      L('            if (--c1) pq.push({c1, ch1});', 'requeue'),
      L('            if (--c2) pq.push({c2, ch2});', 'requeue'),
      L('        }'),
      L('        if (!pq.empty()) out += pq.top().second;', 'last'),
      L('        return out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public String reorganizeString(String s) {'),
      L('        int[] cnt = new int[26];'),
      L('        for (char c : s.toCharArray()) cnt[c - \'a\']++;', 'count'),
      L('        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> b[0]-a[0]);'),
      L('        for (int i = 0; i < 26; i++)', 'build'),
      L('            if (cnt[i] > 0) {', 'build'),
      L('                if (cnt[i] > (s.length() + 1) / 2) return "";', 'impossible'),
      L('                pq.add(new int[]{cnt[i], i});', 'build'),
      L('            }'),
      L('        StringBuilder out = new StringBuilder();'),
      L('        while (pq.size() > 1) {', 'pair'),
      L('            int[] a = pq.poll(), b = pq.poll();', 'pair'),
      L('            out.append((char)(\'a\'+a[1])).append((char)(\'a\'+b[1]));', 'place'),
      L('            if (--a[0] > 0) pq.add(a);', 'requeue'),
      L('            if (--b[0] > 0) pq.add(b);', 'requeue'),
      L('        }'),
      L('        if (!pq.isEmpty()) out.append((char)(\'a\'+pq.peek()[1]));', 'last'),
      L('        return out.toString();', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,12}$/.test(s)) return { error: 'Use 1–12 lowercase letters.' };
    const cnt = new Map<string, number>();
    for (const c of s) cnt.set(c, (cnt.get(c) ?? 0) + 1);
    const steps: Step[] = [];
    const limit = Math.floor((s.length + 1) / 2);
    const heap = new MinHeap<[number, string]>((x, y) => (x[0] !== y[0] ? x[0] > y[0] : x[1] < y[1])); // max-heap by count
    const view = (note?: string, out = ''): HeapState => ({
      heap: heap.a.map(([c, ch]) => `${ch}×${c}`),
      hl: heap.a.length ? [0] : [],
      label: note ?? 'max-heap — root is the most frequent remaining',
      aggs: [{ label: 'output', value: out || '—', c: 'c' }],
    });
    steps.push({
      tag: 'count',
      trace: ['Counts: ', B([...cnt.entries()].map(([c, k]) => `${c}×${k}`).join(', ')), '. Length ', A(s.length), ' allows any one character at most ', A(limit), ' time(s).'],
      state: view(),
    });
    for (const [ch, c] of [...cnt.entries()].sort()) {
      if (c > limit) {
        steps.push({
          tag: 'impossible',
          trace: ["'", F(ch), "' appears ", F(c), ' times, more than the ceiling of ', F(limit), ' — some two copies must end up adjacent. ', C('Impossible'), '.'],
          state: view('cannot be rearranged'),
        });
        return { steps, result: '""', resultDetail: 'impossible' };
      }
      heap.push([c, ch]);
      steps.push({ tag: 'build', trace: ["Push '", A(ch), "' ×", A(c), ' into the heap.'], state: view() });
    }
    let out = '';
    while (heap.size > 1) {
      const [c1, ch1] = heap.pop();
      const [c2, ch2] = heap.pop();
      out += ch1 + ch2;
      steps.push({
        tag: 'pair',
        trace: [
          'Take the two most frequent: ', A(ch1), '×', A(c1), ' and ', A(ch2), '×', A(c2), '. Placing them ', B('together'), ' guarantees they are not adjacent to themselves.',
        ],
        state: view(undefined, out),
      });
      steps.push({ tag: 'place', trace: ['Append "', B(ch1 + ch2), '" — output is now "', B(out), '".'], state: view(undefined, out) });
      if (c1 - 1 > 0) heap.push([c1 - 1, ch1]);
      if (c2 - 1 > 0) heap.push([c2 - 1, ch2]);
      steps.push({ tag: 'requeue', trace: ['Push back whatever is left of them and repeat.'], state: view(undefined, out) });
      if (steps.length > MAX_STEPS) break;
    }
    if (heap.size === 1) {
      const [, ch] = heap.top;
      out += ch;
      steps.push({ tag: 'last', trace: ['One character remains — safe to append since its count must be ', B(1), ': "', B(out), '".'], state: view(undefined, out) });
    }
    steps.push({ tag: 'ret', trace: ['Rearranged with no two adjacent duplicates: ', C(out), '.'], state: view('done', out) });
    return { steps, result: out };
  },
  note: 'Taking two at a time is what makes the greedy provably safe — the two most frequent characters can never be the same one, so no adjacency is ever created. The feasibility check up front is exact: if any count exceeds ⌈n/2⌉ there are not enough gaps to separate its copies.',
  complexity: { time: 'O(n log k)', space: 'O(k)' },
};

/* ================= Furthest Building You Can Reach ================= */
const furthestBuilding: ProblemDef = {
  slug: 'furthest-building-you-can-reach',
  title: 'Furthest Building You Can Reach',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/furthest-building-you-can-reach/',
  technique: 'Ladder every climb, but when you run out, convert the smallest ladder used into bricks.',
  widget: 'heap',
  widgetTitle: 'Climbs currently covered by ladders',
  inputs: [
    { key: 'heights', label: 'Building heights', defaultValue: '4, 2, 7, 6, 9, 14, 12', wide: true },
    { key: 'bricks', label: 'Bricks', defaultValue: '5' },
    { key: 'ladders', label: 'Ladders', defaultValue: '1' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int furthestBuilding(vector<int>& h, int bricks, int ladders) {'),
      L('        priority_queue<int, vector<int>, greater<>> pq;', 'init'),
      L('        for (int i = 0; i + 1 < h.size(); i++) {', 'loop'),
      L('            int d = h[i+1] - h[i];'),
      L('            if (d <= 0) continue;', 'free'),
      L('            pq.push(d);', 'ladder'),
      L('            if (pq.size() > ladders) {', 'swap'),
      L('                bricks -= pq.top(); pq.pop();', 'swap'),
      L('                if (bricks < 0) return i;', 'stuck'),
      L('            }'),
      L('        }'),
      L('        return h.size() - 1;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int furthestBuilding(int[] h, int bricks, int ladders) {'),
      L('        PriorityQueue<Integer> pq = new PriorityQueue<>();', 'init'),
      L('        for (int i = 0; i + 1 < h.length; i++) {', 'loop'),
      L('            int d = h[i+1] - h[i];'),
      L('            if (d <= 0) continue;', 'free'),
      L('            pq.add(d);', 'ladder'),
      L('            if (pq.size() > ladders) {', 'swap'),
      L('                bricks -= pq.poll();', 'swap'),
      L('                if (bricks < 0) return i;', 'stuck'),
      L('            }'),
      L('        }'),
      L('        return h.length - 1;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const h = parseIntArray(values.heights, { min: 1, maxLen: 12 });
    if (typeof h === 'string') return { error: h };
    let bricks = parseInt1(values.bricks, 'Bricks', { min: 0 });
    if (typeof bricks === 'string') return { error: bricks };
    const ladders = parseInt1(values.ladders, 'Ladders', { min: 0, max: 6 });
    if (typeof ladders === 'string') return { error: ladders };
    const steps: Step[] = [];
    const heap = new MinHeap<number>((x, y) => x < y);
    let reached = 0;
    const view = (note: string): HeapState => ({
      heap: [...heap.a],
      hl: heap.a.length ? [0] : [],
      label: note,
      aggs: [
        { label: 'bricks left', value: String(bricks), c: 'a' },
        { label: 'ladders in use', value: `${heap.size} / ${ladders}`, c: 'b' },
        { label: 'reached building', value: String(reached), c: 'c' },
      ],
    });
    steps.push({
      tag: 'init',
      trace: [
        'Ladders should be spent on the ', A('largest'), ' climbs, but you do not know which those are until later. So use a ladder optimistically, and downgrade the smallest one when a bigger climb appears.',
      ],
      state: view('no climbs covered yet'),
    });
    for (let i = 0; i + 1 < h.length; i++) {
      const d = h[i + 1] - h[i];
      if (d <= 0) {
        reached = i + 1;
        steps.push({
          tag: 'free',
          trace: ['Building ', A(i), ' → ', A(i + 1), ': the drop of ', B(-d), ' costs nothing. Move on.'],
          state: view('going down is free'),
        });
        continue;
      }
      heap.push(d);
      steps.push({
        tag: 'ladder',
        trace: ['Climb of ', A(d), ' from building ', A(i), ' to ', A(i + 1), ' — cover it with a ', B('ladder'), ' for now.'],
        state: view('climb added to the ladder set'),
      });
      if (heap.size > ladders) {
        const smallest = heap.pop();
        bricks -= smallest;
        steps.push({
          tag: 'swap',
          trace: [
            'Out of ladders. The cheapest climb currently laddered is ', A(smallest), ' — downgrade it to bricks. That leaves ', bricks < 0 ? F(bricks) : B(bricks), ' brick(s).',
          ],
          state: view('smallest climb converted to bricks'),
        });
        if (bricks < 0) {
          steps.push({
            tag: 'stuck',
            trace: ['Not enough bricks — the climb to building ', F(i + 1), ' is impossible. The furthest reachable is building ', C(i), '.'],
            state: view('stuck'),
          });
          return { steps, result: String(i) };
        }
      }
      reached = i + 1;
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Every climb covered — you reach the last building, index ', C(h.length - 1), '.'],
      state: view('finished'),
    });
    return { steps, result: String(h.length - 1) };
  },
  note: 'A pure greedy "save ladders for big climbs" fails because you cannot see the future; the heap fixes that by letting an early decision be revised. Note the ladder set holds only the k largest climbs seen so far, which is exactly the optimal assignment at every prefix.',
  complexity: { time: 'O(n log L)', space: 'O(L)' },
};

/* ============================================================
 * Backtracking
 * ============================================================ */

/* ================= Combination Sum III ================= */
const combinationSumIII: ProblemDef = {
  slug: 'combination-sum-iii',
  title: 'Combination Sum III',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/combination-sum-iii/',
  technique: 'Pick k distinct digits from 1–9 that sum to n, always moving forward to avoid repeats.',
  widget: 'stack',
  widgetTitle: 'Digits chosen so far',
  inputs: [
    { key: 'k', label: 'Numbers to use (k)', defaultValue: '3' },
    { key: 'n', label: 'Target sum (n)', defaultValue: '7' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<vector<int>> res; vector<int> path;'),
      L('public:'),
      L('    vector<vector<int>> combinationSum3(int k, int n) {'),
      L('        dfs(1, k, n); return res;', 'ret'),
      L('    }'),
      L('    void dfs(int start, int k, int rem) {', 'enter'),
      L('        if (path.size() == k) {', 'full'),
      L('            if (rem == 0) res.push_back(path);', 'hit'),
      L('            return;', 'full'),
      L('        }'),
      L('        for (int d = start; d <= 9; d++) {', 'loop'),
      L('            if (d > rem) break;             // prune', 'prune'),
      L('            path.push_back(d);', 'choose'),
      L('            dfs(d + 1, k, rem - d);', 'recurse'),
      L('            path.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<List<Integer>> res = new ArrayList<>();'),
      L('    List<Integer> path = new ArrayList<>();'),
      L('    public List<List<Integer>> combinationSum3(int k, int n) {'),
      L('        dfs(1, k, n); return res;', 'ret'),
      L('    }'),
      L('    void dfs(int start, int k, int rem) {', 'enter'),
      L('        if (path.size() == k) {', 'full'),
      L('            if (rem == 0) res.add(new ArrayList<>(path));', 'hit'),
      L('            return;', 'full'),
      L('        }'),
      L('        for (int d = start; d <= 9; d++) {', 'loop'),
      L('            if (d > rem) break;             // prune', 'prune'),
      L('            path.add(d);', 'choose'),
      L('            dfs(d + 1, k, rem - d);', 'recurse'),
      L('            path.remove(path.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const k = parseInt1(values.k, 'k', { min: 1, max: 5 });
    if (typeof k === 'string') return { error: k };
    const n = parseInt1(values.n, 'n', { min: 1, max: 45 });
    if (typeof n === 'string') return { error: n };
    const steps: Step[] = [];
    const path: number[] = [];
    const res: number[][] = [];
    const st = (note: string, rem: number): StackState => ({
      array: {
        arr: [...Array(9)].map((_, i) => i + 1),
        mark: Object.fromEntries([...Array(9)].map((_, i) => [i, path.includes(i + 1) ? ('good' as const) : undefined]).filter(([, v]) => v)),
      },
      stack: path.map((v) => ({ v, c: 'b' as const })),
      stackLabel: note,
      aggs: [
        { label: 'remaining', value: String(rem), c: 'a' },
        { label: 'solutions', value: res.map((r) => `[${r.join(',')}]`).join(' ') || '—', c: 'c' },
      ],
    });
    steps.push({
      tag: 'enter',
      trace: [
        'Choose ', A(k), ' distinct digits from 1–9 summing to ', A(n), '. Always picking a digit ', B('larger'), ' than the last means each combination is generated once, in ascending order.',
      ],
      state: st('nothing chosen yet', n),
    });
    const dfs = (start: number, rem: number) => {
      if (steps.length > MAX_STEPS) return;
      if (path.length === k) {
        if (rem === 0) {
          res.push([...path]);
          steps.push({ tag: 'hit', trace: [B(k), ' digits and remainder ', B(0), ' — record [', C(path.join(', ')), '].'], state: st('complete and correct', rem) });
        } else {
          steps.push({ tag: 'full', trace: [F(k), ' digits chosen but ', F(rem), ' is left over — discard this branch.'], state: st('complete but wrong sum', rem) });
        }
        return;
      }
      for (let d = start; d <= 9; d++) {
        if (d > rem) {
          steps.push({
            tag: 'prune',
            trace: [
              'Digit ', F(d), ' already exceeds the remaining ', F(rem), ', and everything after it is larger — ', A('prune'), ' the whole rest of this loop.',
            ],
            state: st('pruned', rem),
          });
          break;
        }
        path.push(d);
        steps.push({ tag: 'choose', trace: ['Choose ', A(d), ' — path [', B(path.join(', ')), '], ', B(rem - d), ' still needed.'], state: st('chose ' + d, rem - d) });
        dfs(d + 1, rem - d);
        path.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: undo ', F(d), ' and try the next digit.'], state: st('backtracked', rem) });
        if (steps.length > MAX_STEPS) return;
      }
    };
    dfs(1, n);
    steps.push({
      tag: 'ret',
      trace: res.length ? [C(res.length), ' combination(s): ', C(res.map((r) => `[${r.join(',')}]`).join(' ')), '.'] : ['No combination of ', C(k), ' digits sums to ', C(n), '.'],
      state: st('done', 0),
    });
    return { steps, result: res.length ? res.map((r) => `[${r.join(',')}]`).join(', ') : 'none' };
  },
  note: 'Two constraints do the pruning: passing d + 1 downward enforces distinctness and ascending order in one move, and breaking when d > rem cuts an entire tail of the loop because the digits are already sorted. Without that break the search still works but explores far more dead ends.',
  complexity: { time: 'O(C(9,k) · k)', space: 'O(k)' },
};

/* ================= Sudoku Solver ================= */
const sudokuSolver: ProblemDef = {
  slug: 'sudoku-solver',
  title: 'Sudoku Solver',
  category: 'Backtracking',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/sudoku-solver/',
  technique: 'Fill the first empty cell with every legal digit; recurse, and undo whatever leads nowhere.',
  widget: 'matrix',
  widgetTitle: 'Sudoku grid (4×4 for clarity)',
  inputs: [{ key: 'grid', label: '4×4 grid (0 = empty, rows ";" separated)', defaultValue: '1,2,0,0;0,0,1,2;2,1,0,0;0,0,2,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void solveSudoku(vector<vector<char>>& b) { solve(b); }'),
      L('    bool solve(vector<vector<char>>& b) {', 'enter'),
      L('        for (int r = 0; r < 9; r++)', 'scan'),
      L('            for (int c = 0; c < 9; c++) {', 'scan'),
      L('                if (b[r][c] != \'.\') continue;', 'scan'),
      L('                for (char d = \'1\'; d <= \'9\'; d++) {', 'try'),
      L('                    if (!ok(b, r, c, d)) continue;', 'reject'),
      L('                    b[r][c] = d;', 'place'),
      L('                    if (solve(b)) return true;', 'recurse'),
      L('                    b[r][c] = \'.\';        // undo', 'undo'),
      L('                }'),
      L('                return false;             // no digit fits', 'dead'),
      L('            }'),
      L('        return true;                      // no empty cell left', 'solved'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void solveSudoku(char[][] b) { solve(b); }'),
      L('    boolean solve(char[][] b) {', 'enter'),
      L('        for (int r = 0; r < 9; r++)', 'scan'),
      L('            for (int c = 0; c < 9; c++) {', 'scan'),
      L('                if (b[r][c] != \'.\') continue;', 'scan'),
      L('                for (char d = \'1\'; d <= \'9\'; d++) {', 'try'),
      L('                    if (!ok(b, r, c, d)) continue;', 'reject'),
      L('                    b[r][c] = d;', 'place'),
      L('                    if (solve(b)) return true;', 'recurse'),
      L('                    b[r][c] = \'.\';        // undo', 'undo'),
      L('                }'),
      L('                return false;             // no digit fits', 'dead'),
      L('            }'),
      L('        return true;                      // no empty cell left', 'solved'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const rows = (values.grid ?? '')
      .split(/[;|]/)
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(/[,\s]+/).filter(Boolean).map(Number));
    if (rows.length !== 4 || !rows.every((r) => r.length === 4)) return { error: 'Enter a 4×4 grid, rows separated by ";".' };
    if (rows.some((r) => r.some((v) => !Number.isInteger(v) || v < 0 || v > 4))) return { error: 'Use digits 0–4 (0 means empty).' };
    const b = rows.map((r) => [...r]);
    const N = 4;
    const BOX = 2;
    const ok = (r: number, c: number, d: number) => {
      for (let i = 0; i < N; i++) if (b[r][i] === d || b[i][c] === d) return false;
      const br = Math.floor(r / BOX) * BOX;
      const bc = Math.floor(c / BOX) * BOX;
      for (let i = 0; i < BOX; i++) for (let j = 0; j < BOX; j++) if (b[br + i][bc + j] === d) return false;
      return true;
    };
    const given = new Set<string>();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (b[r][c] !== 0) given.add(`${r},${c}`);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (b[r][c] !== 0) {
          const d = b[r][c];
          b[r][c] = 0;
          if (!ok(r, c, d)) return { error: `The given grid already breaks the rules at row ${r}, column ${c}.` };
          b[r][c] = d;
        }
      }
    }
    const steps: Step[] = [];
    const view = (active?: string, mark: 'active' | 'good' | 'dim' = 'active'): MatrixState => ({
      grid: b.map((row) => row.map((v) => (v === 0 ? '·' : v))),
      rowLabels: [...Array(N)].map((_, i) => i),
      colLabels: [...Array(N)].map((_, i) => i),
      mark: {
        ...Object.fromEntries([...given].map((key) => [key, 'good' as const])),
        ...(active ? { [active]: mark } : {}),
      },
    });
    steps.push({
      tag: 'enter',
      trace: [
        'Shown on a ', A('4×4'), ' board so every step is visible; the 9×9 logic is identical. Rows, columns and ', A('2×2'), ' boxes must each hold 1–4 once.',
      ],
      state: view(),
    });
    let solved = false;
    const solve = (): boolean => {
      if (steps.length > MAX_STEPS) return true;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (b[r][c] !== 0) continue;
          steps.push({ tag: 'scan', trace: ['First empty cell is row ', A(r), ', column ', A(c), '.'], state: view(`${r},${c}`) });
          for (let d = 1; d <= N; d++) {
            if (!ok(r, c, d)) {
              steps.push({
                tag: 'reject',
                trace: [F(d), ' already appears in this row, column or box — skip it.'],
                state: view(`${r},${c}`, 'dim'),
              });
              continue;
            }
            b[r][c] = d;
            steps.push({ tag: 'place', trace: ['Place ', A(d), ' — legal so far. Recurse and see if the rest can be filled.'], state: view(`${r},${c}`) });
            if (solve()) return true;
            b[r][c] = 0;
            steps.push({
              tag: 'undo',
              trace: ['That led to a dead end — ', F('undo'), ' the ', F(d), ' and try the next digit.'],
              state: view(`${r},${c}`, 'dim'),
            });
            if (steps.length > MAX_STEPS) return true;
          }
          steps.push({ tag: 'dead', trace: ['No digit fits here at all — this whole branch is wrong. Back up further.'], state: view(`${r},${c}`, 'dim') });
          return false;
        }
      }
      solved = true;
      steps.push({ tag: 'solved', trace: ['No empty cells remain — the board is ', C('solved'), '.'], state: view() });
      return true;
    };
    solve();
    steps.push({
      tag: 'solved',
      trace: solved ? ['Final grid: ', C(b.map((r) => r.join('')).join(' / ')), '.'] : ['This puzzle has ', C('no solution'), '.'],
      state: view(),
    });
    return { steps, result: solved ? b.map((r) => r.join('')).join(';') : 'no solution' };
  },
  note: 'Returning true straight up the call stack is what stops the search the instant a solution appears — without it the recursion would keep exploring and the undo would wipe the answer out. Real speed comes from picking the most-constrained empty cell rather than the first one, which prunes vastly more.',
  complexity: { time: 'exponential worst case', space: 'O(empty cells)' },
};

/* ================= Restore IP Addresses ================= */
const restoreIP: ProblemDef = {
  slug: 'restore-ip-addresses',
  title: 'Restore IP Addresses',
  category: 'Backtracking',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/restore-ip-addresses/',
  technique: 'Cut 1–3 digits at a time for each of the four parts, rejecting anything over 255 or with a leading zero.',
  widget: 'stack',
  widgetTitle: 'Digits & parts chosen',
  inputs: [{ key: 's', label: 'Digit string', defaultValue: '25525511135', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<string> res; vector<string> parts;'),
      L('public:'),
      L('    vector<string> restoreIpAddresses(string s) {'),
      L('        dfs(s, 0); return res;', 'ret'),
      L('    }'),
      L('    void dfs(string& s, int i) {', 'enter'),
      L('        if (parts.size() == 4) {', 'four'),
      L('            if (i == s.size()) res.push_back(join(parts));', 'hit'),
      L('            return;', 'four'),
      L('        }'),
      L('        for (int len = 1; len <= 3 && i + len <= s.size(); len++) {', 'loop'),
      L('            string part = s.substr(i, len);'),
      L('            if (part.size() > 1 && part[0] == \'0\') break;', 'zero'),
      L('            if (stoi(part) > 255) break;', 'big'),
      L('            parts.push_back(part);', 'choose'),
      L('            dfs(s, i + len);', 'recurse'),
      L('            parts.pop_back();', 'undo'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<String> res = new ArrayList<>();'),
      L('    List<String> parts = new ArrayList<>();'),
      L('    public List<String> restoreIpAddresses(String s) {'),
      L('        dfs(s, 0); return res;', 'ret'),
      L('    }'),
      L('    void dfs(String s, int i) {', 'enter'),
      L('        if (parts.size() == 4) {', 'four'),
      L('            if (i == s.length()) res.add(String.join(".", parts));', 'hit'),
      L('            return;', 'four'),
      L('        }'),
      L('        for (int len = 1; len <= 3 && i + len <= s.length(); len++) {', 'loop'),
      L('            String part = s.substring(i, i + len);'),
      L('            if (part.length() > 1 && part.charAt(0) == \'0\') break;', 'zero'),
      L('            if (Integer.parseInt(part) > 255) break;', 'big'),
      L('            parts.add(part);', 'choose'),
      L('            dfs(s, i + len);', 'recurse'),
      L('            parts.remove(parts.size() - 1);', 'undo'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim();
    if (!/^[0-9]{4,12}$/.test(s)) return { error: 'Enter 4–12 digits.' };
    const steps: Step[] = [];
    const parts: string[] = [];
    const res: string[] = [];
    const st = (i: number, note: string): StackState => ({
      array: {
        arr: s.split(''),
        mark: Object.fromEntries(s.split('').map((_, k) => [k, k < i ? ('good' as const) : k === i ? ('active' as const) : undefined]).filter(([, v]) => v)),
      },
      stack: parts.map((p) => ({ v: p, c: 'b' as const })),
      stackLabel: note,
      aggs: [{ label: 'valid addresses', value: res.join('   ') || '—', c: 'c' }],
    });
    steps.push({
      tag: 'enter',
      trace: ['An IP has ', A('four'), ' parts, each 0–255 with no leading zero. Try every way of cutting the string into four such chunks.'],
      state: st(0, 'no parts yet'),
    });
    const dfs = (i: number) => {
      if (steps.length > MAX_STEPS) return;
      if (parts.length === 4) {
        if (i === s.length) {
          res.push(parts.join('.'));
          steps.push({ tag: 'hit', trace: ['Four parts and every digit used — valid address ', C(parts.join('.')), '.'], state: st(i, 'complete') });
        } else {
          steps.push({
            tag: 'four',
            trace: ['Four parts already, but ', F(s.length - i), ' digit(s) are left over — this split fails.'],
            state: st(i, 'four parts, digits remain'),
          });
        }
        return;
      }
      for (let len = 1; len <= 3 && i + len <= s.length; len++) {
        const part = s.slice(i, i + len);
        if (part.length > 1 && part[0] === '0') {
          steps.push({
            tag: 'zero',
            trace: ['"', F(part), '" has a leading zero — not allowed, and longer cuts starting here would too. Stop this loop.'],
            state: st(i, 'rejected: leading zero'),
          });
          break;
        }
        if (Number(part) > 255) {
          steps.push({
            tag: 'big',
            trace: ['"', F(part), '" is above ', F(255), ', and taking more digits only makes it larger — stop this loop.'],
            state: st(i, 'rejected: over 255'),
          });
          break;
        }
        parts.push(part);
        steps.push({ tag: 'choose', trace: ['Take "', A(part), '" as part ', A(parts.length), ' — so far ', B(parts.join('.')), '.'], state: st(i + len, 'chose ' + part) });
        dfs(i + len);
        parts.pop();
        steps.push({ tag: 'undo', trace: ['Backtrack: drop "', F(part), '" and try a longer cut.'], state: st(i, 'backtracked') });
        if (steps.length > MAX_STEPS) return;
      }
    };
    dfs(0);
    steps.push({
      tag: 'ret',
      trace: res.length ? [C(res.length), ' valid address(es): ', C(res.join(', ')), '.'] : ['No valid IP address can be formed.'],
      state: st(s.length, 'done'),
    });
    return { steps, result: res.length ? res.join(', ') : 'none' };
  },
  note: 'Both rejections use break rather than continue, which is correct because extending the cut can only make things worse — a leading zero stays, and a number over 255 only grows. The search space is tiny (at most 3⁴ splits), so the real risk here is validation bugs, not performance.',
  complexity: { time: 'O(1) — at most 81 splits', space: 'O(1)' },
};

/* ================= Word Break II ================= */
const wordBreakII: ProblemDef = {
  slug: 'word-break-ii',
  title: 'Word Break II',
  category: 'Backtracking',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/word-break-ii/',
  technique: 'Backtrack over every dictionary word that fits at the current position, memoising by index.',
  widget: 'stack',
  widgetTitle: 'String & words chosen',
  inputs: [
    { key: 's', label: 'String', defaultValue: 'catsanddog', wide: true },
    { key: 'dict', label: 'Dictionary', defaultValue: 'cat, cats, and, sand, dog', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    unordered_map<int, vector<string>> memo;'),
      L('    unordered_set<string> dict;'),
      L('public:'),
      L('    vector<string> wordBreak(string s, vector<string>& words) {'),
      L('        dict = {words.begin(), words.end()};', 'init'),
      L('        return dfs(s, 0);', 'ret'),
      L('    }'),
      L('    vector<string> dfs(string& s, int i) {', 'enter'),
      L('        if (memo.count(i)) return memo[i];', 'memo'),
      L('        if (i == s.size()) return {""};', 'base'),
      L('        vector<string> out;'),
      L('        for (int j = i + 1; j <= s.size(); j++) {', 'loop'),
      L('            string w = s.substr(i, j - i);'),
      L('            if (!dict.count(w)) continue;', 'reject'),
      L('            for (string& rest : dfs(s, j))', 'choose'),
      L('                out.push_back(w + (rest.empty() ? "" : " " + rest));', 'choose'),
      L('        }'),
      L('        return memo[i] = out;', 'store'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    Map<Integer,List<String>> memo = new HashMap<>();'),
      L('    Set<String> dict;'),
      L('    public List<String> wordBreak(String s, List<String> words) {'),
      L('        dict = new HashSet<>(words);', 'init'),
      L('        return dfs(s, 0);', 'ret'),
      L('    }'),
      L('    List<String> dfs(String s, int i) {', 'enter'),
      L('        if (memo.containsKey(i)) return memo.get(i);', 'memo'),
      L('        if (i == s.length()) return List.of("");', 'base'),
      L('        List<String> out = new ArrayList<>();'),
      L('        for (int j = i + 1; j <= s.length(); j++) {', 'loop'),
      L('            String w = s.substring(i, j);'),
      L('            if (!dict.contains(w)) continue;', 'reject'),
      L('            for (String rest : dfs(s, j))', 'choose'),
      L('                out.add(w + (rest.isEmpty() ? "" : " " + rest));', 'choose'),
      L('        }'),
      L('        memo.put(i, out); return out;', 'store'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const s = (values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,14}$/.test(s)) return { error: 'Use 1–14 lowercase letters.' };
    const words = (values.dict ?? '')
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
    if (words.length === 0 || words.length > 8 || words.some((w) => !/^[a-z]{1,8}$/.test(w))) {
      return { error: 'Enter 1–8 dictionary words, each 1–8 lowercase letters.' };
    }
    const dict = new Set(words);
    const steps: Step[] = [];
    const memo = new Map<number, string[]>();
    const chosen: string[] = [];
    const st = (i: number, note: string): StackState => ({
      array: {
        arr: s.split(''),
        mark: Object.fromEntries(s.split('').map((_, k) => [k, k < i ? ('good' as const) : k === i ? ('active' as const) : undefined]).filter(([, v]) => v)),
      },
      stack: chosen.map((w) => ({ v: w, c: 'b' as const })),
      stackLabel: note,
      aggs: [{ label: 'memoised indices', value: [...memo.keys()].sort((a, b) => a - b).join(', ') || '—', c: 'a' }],
    });
    steps.push({
      tag: 'init',
      trace: ['Dictionary: ', A(words.join(', ')), '. Find every way to cut "', A(s), '" into dictionary words.'],
      state: st(0, 'nothing chosen yet'),
    });
    const dfs = (i: number): string[] => {
      if (steps.length > MAX_STEPS) return [];
      if (memo.has(i)) {
        steps.push({
          tag: 'memo',
          trace: ['Index ', B(i), ' was solved before — reuse its ', B(memo.get(i)!.length), ' answer(s) instead of re-searching.'],
          state: st(i, 'memo hit'),
        });
        return memo.get(i)!;
      }
      if (i === s.length) {
        steps.push({ tag: 'base', trace: ['Reached the end of the string — one valid empty tail.'], state: st(i, 'end reached') });
        return [''];
      }
      const out: string[] = [];
      for (let j = i + 1; j <= s.length; j++) {
        const w = s.slice(i, j);
        if (!dict.has(w)) continue;
        chosen.push(w);
        steps.push({
          tag: 'choose',
          trace: ['"', A(w), '" is in the dictionary — take it and solve the rest from index ', B(j), '.'],
          state: st(j, 'chose ' + w),
        });
        const tails = dfs(j);
        for (const rest of tails) out.push(w + (rest ? ' ' + rest : ''));
        chosen.pop();
        steps.push({
          tag: 'reject',
          trace: tails.length
            ? ['"', B(w), '" leads to ', B(tails.length), ' complete sentence(s).']
            : ['"', F(w), '" leads nowhere — the rest of the string cannot be broken. Backtrack.'],
          state: st(i, 'backtracked'),
        });
        if (steps.length > MAX_STEPS) break;
      }
      memo.set(i, out);
      steps.push({
        tag: 'store',
        trace: ['Index ', A(i), ' yields ', B(out.length), ' sentence(s) — memoise so any later path here is instant.'],
        state: st(i, 'memoised'),
      });
      return out;
    };
    const res = dfs(0);
    steps.push({
      tag: 'ret',
      trace: res.length ? [C(res.length), ' sentence(s): ', C(res.join(' | ')), '.'] : ['The string cannot be broken into dictionary words.'],
      state: st(s.length, 'done'),
    });
    return { steps, result: res.length ? res.join(' | ') : 'none' };
  },
  note: 'Memoising by start index is what saves this from blowing up: a suffix like "anddog" gets solved once no matter how many prefixes lead into it. Note the cache stores every sentence for that suffix, not a boolean — the plain Word Break only needs the boolean, which is why it is a Medium and this is a Hard.',
  complexity: { time: 'O(n² · number of results)', space: 'O(n² )' },
};

export const triesHeapBacktracking: ProblemDef[] = [
  maximumXOR,
  replaceWords,
  browserHistory,
  lfuCache,
  topKWords,
  kthSmallestMatrix,
  reorganizeString,
  furthestBuilding,
  combinationSumIII,
  sudokuSolver,
  restoreIP,
  wordBreakII,
];
