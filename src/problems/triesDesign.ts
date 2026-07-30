// Tries & Design.
import type { ArrayState, ListState, MatrixState, ProblemDef, Step, TreeState } from '../lib/types';
import { A, B, C, F, L } from '../lib/trace';
import { parseGrid } from './arraysHashing2';

const MAX_STEPS = 350;

/* ---------- shared trie machinery ---------- */
interface TrieNode {
  id: number;
  ch: string;
  children: Map<string, TrieNode>;
  end: boolean;
}

function newTrie(): { root: TrieNode; nextId: () => number } {
  let id = 0;
  const root: TrieNode = { id: id++, ch: '·', children: new Map(), end: false };
  return { root, nextId: () => id++ };
}

function insertWord(root: TrieNode, nextId: () => number, w: string): void {
  let n = root;
  for (const c of w) {
    if (!n.children.has(c)) n.children.set(c, { id: nextId(), ch: c, children: new Map(), end: false });
    n = n.children.get(c)!;
  }
  n.end = true;
}

function layoutTrie(root: TrieNode): { nodes: TreeState['nodes']; edges: [number, number][] } {
  const nodes: TreeState['nodes'] = [];
  const edges: [number, number][] = [];
  let maxDepth = 0;
  const depthOf = (n: TrieNode, d: number) => {
    maxDepth = Math.max(maxDepth, d);
    for (const c of n.children.values()) depthOf(c, d + 1);
  };
  depthOf(root, 0);
  let leaf = 0;
  const countLeaves = (n: TrieNode): number => {
    if (n.children.size === 0) return 1;
    let s = 0;
    for (const c of n.children.values()) s += countLeaves(c);
    return s;
  };
  const total = countLeaves(root);
  const walk = (n: TrieNode, d: number): number => {
    let x: number;
    if (n.children.size === 0) {
      x = total === 1 ? 0.5 : (leaf + 0.5) / total;
      leaf++;
    } else {
      const xs = [...n.children.values()].map((c) => {
        edges.push([n.id, c.id]);
        return walk(c, d + 1);
      });
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    nodes.push({ id: n.id, val: n.end ? `${n.ch}•` : n.ch, x, y: maxDepth === 0 ? 0.5 : d / maxDepth });
    return x;
  };
  walk(root, 0);
  return { nodes, edges };
}

/* ================= 74. Implement Trie ================= */
const implementTrie: ProblemDef = {
  slug: 'implement-trie-prefix-tree',
  title: 'Implement Trie (Prefix Tree)',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
  technique: 'One node per character edge — shared prefixes share a path.',
  widget: 'tree',
  widgetTitle: 'Trie (• = word end)',
  inputs: [{ key: 'ops', label: 'Ops (insert w / search w / startsWith p)', defaultValue: 'insert apple, search apple, search app, startsWith app, insert app, search app', wide: true }],
  code: {
    cpp: [
      L('class Trie {'),
      L('    Trie* next[26] = {};', 'init'),
      L('    bool isEnd = false;', 'init'),
      L('public:'),
      L('    void insert(string word) {', 'insert'),
      L('        Trie* n = this;', 'insert'),
      L('        for (char c : word) {', 'insert'),
      L('            if (!n->next[c - \'a\'])', 'newnode'),
      L('                n->next[c - \'a\'] = new Trie();', 'newnode'),
      L('            n = n->next[c - \'a\'];', 'insert'),
      L('        }'),
      L('        n->isEnd = true;', 'mark'),
      L('    }'),
      L('    bool search(string word) {', 'search'),
      L('        Trie* n = walk(word);', 'search'),
      L('        return n != nullptr && n->isEnd;', 'search'),
      L('    }'),
      L('    bool startsWith(string prefix) {', 'prefix'),
      L('        return walk(prefix) != nullptr;', 'prefix'),
      L('    }'),
      L('    Trie* walk(string s) {', 'walkfn'),
      L('        Trie* n = this;'),
      L('        for (char c : s) {'),
      L('            if (!n->next[c - \'a\']) return nullptr;'),
      L('            n = n->next[c - \'a\'];'),
      L('        }'),
      L('        return n;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Trie {'),
      L('    private Trie[] next = new Trie[26];', 'init'),
      L('    private boolean isEnd = false;', 'init'),
      L('    public void insert(String word) {', 'insert'),
      L('        Trie n = this;', 'insert'),
      L('        for (char c : word.toCharArray()) {', 'insert'),
      L('            if (n.next[c - \'a\'] == null)', 'newnode'),
      L('                n.next[c - \'a\'] = new Trie();', 'newnode'),
      L('            n = n.next[c - \'a\'];', 'insert'),
      L('        }'),
      L('        n.isEnd = true;', 'mark'),
      L('    }'),
      L('    public boolean search(String word) {', 'search'),
      L('        Trie n = walk(word);', 'search'),
      L('        return n != null && n.isEnd;', 'search'),
      L('    }'),
      L('    public boolean startsWith(String prefix) {', 'prefix'),
      L('        return walk(prefix) != null;', 'prefix'),
      L('    }'),
      L('    private Trie walk(String s) {', 'walkfn'),
      L('        Trie n = this;'),
      L('        for (char c : s.toCharArray()) {'),
      L('            if (n.next[c - \'a\'] == null) return null;'),
      L('            n = n.next[c - \'a\'];'),
      L('        }'),
      L('        return n;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 10) return { error: 'Keep it to at most 10 operations.' };
    const ops: { kind: 'insert' | 'search' | 'startsWith'; arg: string }[] = [];
    for (const op of raw) {
      const m = op.match(/^(insert|search|startsWith)\s+([a-z]+)$/i);
      if (!m) return { error: `Bad op "${op}". Use: insert w, search w, startsWith p (lowercase words).` };
      ops.push({ kind: m[1] as 'insert', arg: m[2].toLowerCase() });
      if (m[2].length > 8) return { error: 'Keep words to at most 8 characters.' };
    }

    // Build the final trie for stable layout, revealing nodes as ops execute.
    const { root, nextId } = newTrie();
    for (const op of ops) if (op.kind === 'insert') insertWord(root, nextId, op.arg);
    const layout = layoutTrie(root);
    const revealed = new Set<number>([root.id]);
    const endMarked = new Set<number>();
    const outputs: string[] = [];
    const steps: Step[] = [];
    const snap = (current: number | null): TreeState => ({
      nodes: layout.nodes
        .filter((n) => revealed.has(n.id))
        .map((n) => ({ ...n, val: endMarked.has(n.id) ? n.val : String(n.val).replace('•', '') })),
      edges: layout.edges.filter(([a, b]) => revealed.has(a) && revealed.has(b)),
      current,
      done: [...endMarked],
      aggs: [{ label: 'outputs', value: outputs.join(', ') || '—', c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Every path from the root spells a prefix; a ', B('•'), ' marks where an inserted word ends.'], state: snap(null) });

    // Replay ops on a fresh walker over the same node ids.
    const findChild = (n: TrieNode, c: string) => n.children.get(c);
    const liveTrie = newTrie();
    // map from live path to prebuilt ids: rebuild inserts against prebuilt trie directly instead.
    for (const op of ops) {
      if (op.kind === 'insert') {
        let n = root;
        for (const c of op.arg) {
          const child = findChild(n, c)!;
          const isNew = !revealed.has(child.id);
          revealed.add(child.id);
          steps.push({
            tag: isNew ? 'newnode' : 'insert',
            trace: isNew
              ? ['insert "', A(op.arg), '": no edge for \'', A(c), '\' — create a node.']
              : ['insert "', A(op.arg), '": edge \'', A(c), '\' already exists — walk it (shared prefix).'],
            state: snap(child.id),
          });
          n = child;
        }
        endMarked.add(n.id);
        steps.push({ tag: 'mark', trace: ['Mark the final node — "', B(op.arg), '" is now a complete word.'], state: snap(n.id) });
      } else {
        let n: TrieNode | undefined = root;
        let failed = false;
        for (const c of op.arg) {
          n = n ? findChild(n, c) : undefined;
          if (!n || !revealed.has(n.id)) {
            failed = true;
            break;
          }
        }
        const ok = !failed && (op.kind === 'startsWith' || endMarked.has(n!.id));
        outputs.push(`${op.kind}(${op.arg})→${ok}`);
        steps.push({
          tag: op.kind === 'search' ? 'search' : 'prefix',
          tag2: 'walkfn',
          trace: [
            op.kind, '("', A(op.arg), '") — ',
            failed ? F('path breaks') : endMarked.has(n!.id) ? B('path ends at a word mark') : op.kind === 'startsWith' ? B('path exists') : F('path exists but no word mark'),
            ': ', ok ? C('true') : C('false'), '.',
          ],
          state: snap(failed ? null : n!.id),
        });
      }
    }
    liveTrie; // (unused helper kept for clarity)
    return { steps, result: outputs.filter((o) => !o.startsWith('insert')).join('  ') || 'done', resultDetail: 'trie operations, O(word length) each' };
  },
  note: 'The trie\'s cost depends only on the word\'s length, never on how many words are stored — and the isEnd flag is what distinguishes "app is a stored word" from "app is merely a prefix of apple".',
  complexity: { time: 'O(L) per op', space: 'O(total characters)' },
};

/* ================= 75. Design Add and Search Words ================= */
const addSearchWords: ProblemDef = {
  slug: 'design-add-and-search-words-data-structure',
  title: 'Design Add and Search Words Data Structure',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/',
  technique: 'A trie where "." fans out into every child — backtracking search.',
  widget: 'tree',
  widgetTitle: 'Trie (• = word end)',
  inputs: [{ key: 'ops', label: 'Ops (add w / search w, "." = wildcard)', defaultValue: 'add bad, add dad, add mad, search pad, search bad, search .ad, search b..', wide: true }],
  code: {
    cpp: [
      L('class WordDictionary {'),
      L('    WordDictionary* next[26] = {};', 'init'),
      L('    bool isEnd = false;', 'init'),
      L('public:'),
      L('    void addWord(string word) {', 'add'),
      L('        WordDictionary* n = this;', 'add'),
      L('        for (char c : word) {', 'add'),
      L('            if (!n->next[c - \'a\']) n->next[c - \'a\'] = new WordDictionary();', 'add'),
      L('            n = n->next[c - \'a\'];', 'add'),
      L('        }'),
      L('        n->isEnd = true;', 'add'),
      L('    }'),
      L('    bool search(string word) {', 'search'),
      L('        return dfs(word, 0);', 'search'),
      L('    }'),
      L('    bool dfs(const string& w, int i) {', 'dfs'),
      L('        if (i == w.size()) return isEnd;', 'end'),
      L('        if (w[i] == \'.\') {', 'wild'),
      L('            for (int c = 0; c < 26; c++)', 'wild'),
      L('                if (next[c] && next[c]->dfs(w, i + 1))', 'wild'),
      L('                    return true;', 'wild'),
      L('            return false;', 'wildfail'),
      L('        }'),
      L('        WordDictionary* child = next[w[i] - \'a\'];', 'step'),
      L('        return child && child->dfs(w, i + 1);', 'step'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class WordDictionary {'),
      L('    private WordDictionary[] next = new WordDictionary[26];', 'init'),
      L('    private boolean isEnd = false;', 'init'),
      L('    public void addWord(String word) {', 'add'),
      L('        WordDictionary n = this;', 'add'),
      L('        for (char c : word.toCharArray()) {', 'add'),
      L('            if (n.next[c - \'a\'] == null) n.next[c - \'a\'] = new WordDictionary();', 'add'),
      L('            n = n.next[c - \'a\'];', 'add'),
      L('        }'),
      L('        n.isEnd = true;', 'add'),
      L('    }'),
      L('    public boolean search(String word) {', 'search'),
      L('        return dfs(word, 0, this);', 'search'),
      L('    }'),
      L('    private boolean dfs(String w, int i, WordDictionary n) {', 'dfs'),
      L('        if (i == w.length()) return n.isEnd;', 'end'),
      L('        char c = w.charAt(i);', 'step'),
      L('        if (c == \'.\') {', 'wild'),
      L('            for (WordDictionary child : n.next)', 'wild'),
      L('                if (child != null && dfs(w, i + 1, child))', 'wild'),
      L('                    return true;', 'wild'),
      L('            return false;', 'wildfail'),
      L('        }'),
      L('        WordDictionary child = n.next[c - \'a\'];', 'step'),
      L('        return child != null && dfs(w, i + 1, child);', 'step'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 10) return { error: 'Keep it to at most 10 operations.' };
    const ops: { kind: 'add' | 'search'; arg: string }[] = [];
    for (const op of raw) {
      const m = op.match(/^(add|search)\s+([a-z.]+)$/i);
      if (!m) return { error: `Bad op "${op}". Use: add w, search w.` };
      if (m[1] === 'add' && m[2].includes('.')) return { error: 'Wildcards only allowed in search.' };
      if (m[2].length > 8) return { error: 'Keep words to at most 8 characters.' };
      ops.push({ kind: m[1] as 'add', arg: m[2].toLowerCase() });
    }

    const { root, nextId } = newTrie();
    for (const op of ops) if (op.kind === 'add') insertWord(root, nextId, op.arg);
    const layout = layoutTrie(root);
    const revealed = new Set<number>([root.id]);
    const endIds = new Set<number>();
    const markEnds = (n: TrieNode) => {
      if (n.end) endIds.add(n.id);
      for (const c of n.children.values()) markEnds(c);
    };
    const outputs: string[] = [];
    const steps: Step[] = [];
    const snap = (current: number | null): TreeState => ({
      nodes: layout.nodes.filter((n) => revealed.has(n.id)).map((n) => ({ ...n, val: endIds.has(n.id) && revealed.has(n.id) ? n.val : String(n.val).replace('•', '') })),
      edges: layout.edges.filter(([a, b]) => revealed.has(a) && revealed.has(b)),
      current,
      aggs: [{ label: 'outputs', value: outputs.join(', ') || '—', c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['A trie again — but search may contain ', A('.'), ', which must try ', A('every child'), ' at that depth.'], state: snap(null) });
    for (const op of ops) {
      if (op.kind === 'add') {
        let n = root;
        for (const c of op.arg) {
          n = n.children.get(c)!;
          revealed.add(n.id);
        }
        endIds.add(n.id);
        steps.push({ tag: 'add', trace: ['addWord("', B(op.arg), '") — path created/extended, end marked.'], state: snap(n.id) });
      } else {
        let found = false;
        const dfs = (n: TrieNode, i: number): boolean => {
          if (steps.length > MAX_STEPS) return false;
          if (i === op.arg.length) {
            const ok = endIds.has(n.id);
            steps.push({
              tag: 'end',
              trace: ['Pattern consumed at node \'', A(n.ch), '\' — ', ok ? B('word mark present ✓') : F('no word mark ✗'), '.'],
              state: snap(n.id),
            });
            return ok;
          }
          const c = op.arg[i];
          if (c === '.') {
            steps.push({
              tag: 'wild',
              trace: ["'.' at position ", A(i), ' — fan out into ', A(n.children.size), ' child branch(es) of \'', A(n.ch), '\'.'],
              state: snap(n.id),
            });
            for (const child of n.children.values()) {
              if (dfs(child, i + 1)) return true;
            }
            steps.push({ tag: 'wildfail', trace: ['Every branch under \'', F(n.ch), '\' failed — backtrack.'], state: snap(n.id) });
            return false;
          }
          const child = n.children.get(c);
          if (!child || !revealed.has(child.id)) {
            steps.push({ tag: 'step', trace: ["No edge '", F(c), "' from '", A(n.ch), "' — dead end."], state: snap(n.id) });
            return false;
          }
          steps.push({ tag: 'step', trace: ["Follow edge '", A(c), "'."], state: snap(child.id) });
          return dfs(child, i + 1);
        };
        found = dfs(root, 0);
        outputs.push(`search(${op.arg})→${found}`);
        steps.push({ tag: 'search', trace: ['search("', A(op.arg), '") → ', found ? C('true') : C('false'), '.'], state: snap(null) });
      }
    }
    return { steps, result: outputs.join('  ') || 'done', resultDetail: 'wildcard = backtracking over children' };
  },
  note: 'A literal character follows one edge; a dot follows all of them — so the search degrades gracefully from O(L) to a backtracking walk only where wildcards appear. The trie\'s sharing keeps even the fan-out cheap.',
  complexity: { time: 'O(26^d · L) worst', space: 'O(total characters)' },
};

/* ================= 76. Word Search II ================= */
const wordSearchII: ProblemDef = {
  slug: 'word-search-ii',
  title: 'Word Search II',
  category: 'Tries & Design',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/word-search-ii/',
  technique: 'One DFS over the board, steered by a trie of all target words at once.',
  widget: 'matrix',
  widgetTitle: 'Board & DFS path',
  inputs: [
    { key: 'board', label: 'Board (rows ";" separated)', defaultValue: 'oaan;etae;ihkr;iflv', wide: true },
    { key: 'words', label: 'Words', defaultValue: 'oath, pea, eat, rain', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    struct Node { Node* next[26] = {}; string word; };', 'trie'),
      L('public:'),
      L('    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {'),
      L('        Node* root = new Node();', 'trie'),
      L('        for (string& w : words) {', 'trie'),
      L('            Node* n = root;', 'trie'),
      L('            for (char c : w) {', 'trie'),
      L('                if (!n->next[c - \'a\']) n->next[c - \'a\'] = new Node();', 'trie'),
      L('                n = n->next[c - \'a\'];', 'trie'),
      L('            }'),
      L('            n->word = w;', 'trie'),
      L('        }'),
      L('        vector<string> res;', 'init'),
      L('        for (int r = 0; r < board.size(); r++)', 'start'),
      L('            for (int c = 0; c < board[0].size(); c++)', 'start'),
      L('                dfs(board, r, c, root, res);', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(vector<vector<char>>& b, int r, int c, Node* n, vector<string>& res) {', 'dfs'),
      L('        if (r < 0 || r >= b.size() || c < 0 || c >= b[0].size()) return;', 'prune'),
      L('        char ch = b[r][c];', 'dfs'),
      L('        if (ch == \'#\' || !n->next[ch - \'a\']) return;', 'prune'),
      L('        n = n->next[ch - \'a\'];', 'dfs'),
      L('        if (!n->word.empty()) {', 'found'),
      L('            res.push_back(n->word);', 'found'),
      L('            n->word.clear();', 'found'),
      L('        }'),
      L('        b[r][c] = \'#\';', 'markcell'),
      L('        dfs(b, r + 1, c, n, res); dfs(b, r - 1, c, n, res);', 'dfs'),
      L('        dfs(b, r, c + 1, n, res); dfs(b, r, c - 1, n, res);', 'dfs'),
      L('        b[r][c] = ch;', 'unmark'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    static class Node { Node[] next = new Node[26]; String word; }', 'trie'),
      L('    public List<String> findWords(char[][] board, String[] words) {'),
      L('        Node root = new Node();', 'trie'),
      L('        for (String w : words) {', 'trie'),
      L('            Node n = root;', 'trie'),
      L('            for (char c : w.toCharArray()) {', 'trie'),
      L('                if (n.next[c - \'a\'] == null) n.next[c - \'a\'] = new Node();', 'trie'),
      L('                n = n.next[c - \'a\'];', 'trie'),
      L('            }'),
      L('            n.word = w;', 'trie'),
      L('        }'),
      L('        List<String> res = new ArrayList<>();', 'init'),
      L('        for (int r = 0; r < board.length; r++)', 'start'),
      L('            for (int c = 0; c < board[0].length; c++)', 'start'),
      L('                dfs(board, r, c, root, res);', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    private void dfs(char[][] b, int r, int c, Node n, List<String> res) {', 'dfs'),
      L('        if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return;', 'prune'),
      L('        char ch = b[r][c];', 'dfs'),
      L('        if (ch == \'#\' || n.next[ch - \'a\'] == null) return;', 'prune'),
      L('        n = n.next[ch - \'a\'];', 'dfs'),
      L('        if (n.word != null) {', 'found'),
      L('            res.add(n.word);', 'found'),
      L('            n.word = null;', 'found'),
      L('        }'),
      L('        b[r][c] = \'#\';', 'markcell'),
      L('        dfs(b, r + 1, c, n, res); dfs(b, r - 1, c, n, res);', 'dfs'),
      L('        dfs(b, r, c + 1, n, res); dfs(b, r, c - 1, n, res);', 'dfs'),
      L('        b[r][c] = ch;', 'unmark'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseGrid(values.board, { maxR: 4, maxC: 4 });
    if (typeof g === 'string') return { error: g };
    if (!g.every((row) => row.every((c) => /^[a-z]$/.test(c)))) return { error: 'Board must contain lowercase letters only (no commas needed: rows like "oaan").' };
    const words = (values.words ?? '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.length === 0 || words.length > 6) return { error: 'Enter 1–6 words.' };
    if (!words.every((w) => /^[a-z]{1,8}$/.test(w))) return { error: 'Words: lowercase, ≤ 8 letters.' };

    const R = g.length;
    const Cn = g[0].length;
    const { root, nextId } = newTrie();
    for (const w of words) insertWord(root, nextId, w);
    const wordAt = new Map<TrieNode, string>();
    const tag = (n: TrieNode, prefix: string) => {
      if (n.end) wordAt.set(n, prefix);
      for (const [c, ch] of n.children) tag(ch, prefix + c);
    };
    tag(root, '');

    const found: string[] = [];
    const steps: Step[] = [];
    const path: [number, number][] = [];
    const foundCells = new Set<string>();
    const snap = (extra?: MatrixState['mark']): MatrixState => ({
      grid: g,
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(Cn)].map((_, i) => i),
      mark: {
        ...Object.fromEntries([...foundCells].map((k) => [k, 'good'])),
        ...Object.fromEntries(path.map(([r, c], i) => [`${r},${c}`, i === path.length - 1 ? 'active' : 'win'])),
        ...extra,
      },
      aggs: [{ label: 'found', value: found.length ? found.join(', ') : '—', c: 'c' }],
    });
    steps.push({ tag: 'trie', trace: ['Build one trie of all ', A(words.length), ' words — the board is searched once for all of them simultaneously.'], state: snap() });
    const claimed = new Set<TrieNode>();
    const visited = new Set<string>();
    const dfs = (r: number, c: number, n: TrieNode) => {
      if (steps.length > MAX_STEPS) return;
      if (r < 0 || r >= R || c < 0 || c >= Cn) return;
      const key = `${r},${c}`;
      if (visited.has(key)) return;
      const ch = g[r][c];
      const child = n.children.get(ch);
      if (!child) {
        if (path.length > 0) {
          steps.push({ tag: 'prune', trace: ['Cell (', A(r), ',', A(c), ") = '", F(ch), "' extends no word in the trie — prune this branch instantly."], state: snap({ [key]: 'dim' }) });
        }
        return;
      }
      visited.add(key);
      path.push([r, c]);
      steps.push({ tag: 'dfs', trace: ["Step onto '", A(ch), "' at (", A(r), ',', A(c), ') — trie path "', A(path.map(([pr, pc]) => g[pr][pc]).join('')), '" is alive.'], state: snap() });
      if (wordAt.has(child) && !claimed.has(child)) {
        claimed.add(child);
        found.push(wordAt.get(child)!);
        path.forEach(([pr, pc]) => foundCells.add(`${pr},${pc}`));
        steps.push({ tag: 'found', trace: ['The trie node carries a word mark — found "', C(wordAt.get(child)!), '"!'], state: snap() });
      }
      dfs(r + 1, c, child);
      dfs(r - 1, c, child);
      dfs(r, c + 1, child);
      dfs(r, c - 1, child);
      visited.delete(key);
      path.pop();
    };
    for (let r = 0; r < R && steps.length < MAX_STEPS; r++) {
      for (let c = 0; c < Cn && steps.length < MAX_STEPS; c++) {
        if (root.children.has(g[r][c])) {
          steps.push({ tag: 'start', trace: ['Start a DFS at (', A(r), ',', A(c), ") — '", A(g[r][c]), "' begins at least one word."], state: snap() });
          dfs(r, c, root);
        }
      }
    }
    steps.push({ tag: 'ret', trace: ['Board exhausted — found ', C(found.length), ' word(s): ', C(found.join(', ') || 'none'), '.'], state: snap() });
    return { steps, result: `[${found.join(', ')}]`, resultDetail: `${found.length} of ${words.length} words found` };
  },
  note: 'Searching each word separately re-walks the board per word. The trie merges all words into one automaton: the DFS dies the moment the current path is a prefix of nothing, and every complete word lights up wherever the walk happens to pass a word-mark node.',
  complexity: { time: 'O(R·C·4^L)', space: 'O(total characters)' },
};

/* ================= 77. Insert Delete GetRandom O(1) ================= */
const insertDeleteRandom: ProblemDef = {
  slug: 'insert-delete-getrandom-o1',
  title: 'Insert Delete GetRandom O(1)',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/insert-delete-getrandom-o1/',
  technique: 'Array + hash map: delete by swapping with the last element, random by index.',
  widget: 'array',
  widgetTitle: 'Backing array',
  inputs: [{ key: 'ops', label: 'Ops (insert n / remove n / getRandom)', defaultValue: 'insert 1, insert 2, insert 3, remove 1, insert 4, getRandom, remove 2, getRandom', wide: true }],
  code: {
    cpp: [
      L('class RandomizedSet {'),
      L('    vector<int> vals;', 'init'),
      L('    unordered_map<int, int> pos;', 'init'),
      L('public:'),
      L('    bool insert(int val) {', 'insert'),
      L('        if (pos.count(val)) return false;', 'dup'),
      L('        pos[val] = vals.size();', 'insert'),
      L('        vals.push_back(val);', 'insert'),
      L('        return true;', 'insert'),
      L('    }'),
      L('    bool remove(int val) {', 'remove'),
      L('        if (!pos.count(val)) return false;', 'miss'),
      L('        int i = pos[val], last = vals.back();', 'swap'),
      L('        vals[i] = last; pos[last] = i;', 'swap'),
      L('        vals.pop_back(); pos.erase(val);', 'swap'),
      L('        return true;', 'remove'),
      L('    }'),
      L('    int getRandom() {', 'rand'),
      L('        return vals[rand() % vals.size()];', 'rand'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class RandomizedSet {'),
      L('    private List<Integer> vals = new ArrayList<>();', 'init'),
      L('    private Map<Integer, Integer> pos = new HashMap<>();', 'init'),
      L('    private Random rng = new Random();', 'init'),
      L('    public boolean insert(int val) {', 'insert'),
      L('        if (pos.containsKey(val)) return false;', 'dup'),
      L('        pos.put(val, vals.size());', 'insert'),
      L('        vals.add(val);', 'insert'),
      L('        return true;', 'insert'),
      L('    }'),
      L('    public boolean remove(int val) {', 'remove'),
      L('        if (!pos.containsKey(val)) return false;', 'miss'),
      L('        int i = pos.get(val), last = vals.get(vals.size() - 1);', 'swap'),
      L('        vals.set(i, last); pos.put(last, i);', 'swap'),
      L('        vals.remove(vals.size() - 1); pos.remove(val);', 'swap'),
      L('        return true;', 'remove'),
      L('    }'),
      L('    public int getRandom() {', 'rand'),
      L('        return vals.get(rng.nextInt(vals.size()));', 'rand'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 14) return { error: 'Keep it to at most 14 operations.' };

    const vals: number[] = [];
    const pos = new Map<number, number>();
    const outputs: string[] = [];
    const steps: Step[] = [];
    let rngState = 42; // deterministic "random" so the trace is reproducible
    const nextRng = () => {
      rngState = (rngState * 1103515245 + 12345) % 2147483648;
      return rngState;
    };
    const st = (hl?: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr: vals.length ? [...vals] : ['∅'],
      mark: hl !== undefined ? { [hl]: 'active' } : {},
      aggs: [
        { label: 'map', value: [...pos.entries()].map(([v, i]) => `${v}→${i}`).join(' ') || '—', c: 'b' },
        { label: 'outputs', value: outputs.join(', ') || '—', c: 'c' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['The array gives O(1) random access; the map gives O(1) lookup of any value\'s index. Deletion is the clever bit.'], state: st() });
    for (const op of raw) {
      const mIns = op.match(/^insert\s+(-?\d+)$/i);
      const mRem = op.match(/^remove\s+(-?\d+)$/i);
      if (mIns) {
        const v = Number(mIns[1]);
        if (pos.has(v)) {
          outputs.push('false');
          steps.push({ tag: 'dup', trace: ['insert(', F(v), ') — already present: ', F('false'), '.'], state: st(pos.get(v)) });
        } else {
          pos.set(v, vals.length);
          vals.push(v);
          outputs.push('true');
          steps.push({ tag: 'insert', trace: ['insert(', B(v), ') — append at index ', B(vals.length - 1), ' and record it in the map.'], state: st(vals.length - 1) });
        }
      } else if (mRem) {
        const v = Number(mRem[1]);
        if (!pos.has(v)) {
          outputs.push('false');
          steps.push({ tag: 'miss', trace: ['remove(', F(v), ') — not present: ', F('false'), '.'], state: st() });
        } else {
          const i = pos.get(v)!;
          const last = vals[vals.length - 1];
          vals[i] = last;
          pos.set(last, i);
          vals.pop();
          pos.delete(v);
          outputs.push('true');
          steps.push({
            tag: 'swap',
            trace: ['remove(', A(v), ') — overwrite its slot ', A(i), ' with the last element ', B(last), ', then chop the tail. No shifting, O(1).'],
            state: st(Math.min(i, Math.max(0, vals.length - 1))),
          });
        }
      } else if (/^getrandom$/i.test(op)) {
        if (vals.length === 0) return { error: 'getRandom on an empty set.' };
        const i = nextRng() % vals.length;
        outputs.push(String(vals[i]));
        steps.push({ tag: 'rand', trace: ['getRandom() — pick index ', A(i), ' uniformly → ', C(vals[i]), '.'], state: st(i) });
      } else {
        return { error: `Unknown op "${op}". Use: insert n, remove n, getRandom.` };
      }
    }
    return { steps, result: outputs.join(', '), resultDetail: 'all three ops O(1) (random shown deterministically)' };
  },
  note: 'Arrays alone can\'t delete in O(1); maps alone can\'t sample uniformly. The swap-with-last trick removes the array\'s weakness: order was never promised, so overwriting the victim with the tail preserves everything that matters.',
  complexity: { time: 'O(1) per op', space: 'O(n)' },
};

/* ================= 78. Design Twitter ================= */
const designTwitter: ProblemDef = {
  slug: 'design-twitter',
  title: 'Design Twitter',
  category: 'Tries & Design',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/design-twitter/',
  technique: 'Per-user tweet lists with global timestamps; a feed merges the k most recent across followees.',
  widget: 'list',
  widgetTitle: 'Users, tweets & feed',
  inputs: [{ key: 'ops', label: 'Ops (post u t / follow a b / unfollow a b / feed u)', defaultValue: 'post 1 5, post 2 6, follow 1 2, feed 1, post 2 7, unfollow 1 2, feed 1', wide: true }],
  code: {
    cpp: [
      L('class Twitter {'),
      L('    int time = 0;', 'init'),
      L('    unordered_map<int, vector<pair<int,int>>> tweets;  // user -> (time, id)', 'init'),
      L('    unordered_map<int, unordered_set<int>> follows;', 'init'),
      L('public:'),
      L('    void postTweet(int userId, int tweetId) {', 'post'),
      L('        tweets[userId].push_back({time++, tweetId});', 'post'),
      L('    }'),
      L('    vector<int> getNewsFeed(int userId) {', 'feed'),
      L('        priority_queue<tuple<int,int>> pq;   // (time, id)', 'feed'),
      L('        auto add = [&](int u) {', 'gather'),
      L('            for (auto& [t, id] : tweets[u]) pq.push({t, id});', 'gather'),
      L('        };'),
      L('        add(userId);', 'gather'),
      L('        for (int f : follows[userId]) add(f);', 'gather'),
      L('        vector<int> res;', 'take'),
      L('        while (!pq.empty() && res.size() < 10) {', 'take'),
      L('            res.push_back(get<1>(pq.top())); pq.pop();', 'take'),
      L('        }'),
      L('        return res;', 'take'),
      L('    }'),
      L('    void follow(int a, int b) { follows[a].insert(b); }', 'follow'),
      L('    void unfollow(int a, int b) { follows[a].erase(b); }', 'unfollow'),
      L('};'),
    ],
    java: [
      L('class Twitter {'),
      L('    private int time = 0;', 'init'),
      L('    private Map<Integer, List<int[]>> tweets = new HashMap<>();', 'init'),
      L('    private Map<Integer, Set<Integer>> follows = new HashMap<>();', 'init'),
      L('    public void postTweet(int userId, int tweetId) {', 'post'),
      L('        tweets.computeIfAbsent(userId, k -> new ArrayList<>())', 'post'),
      L('              .add(new int[]{time++, tweetId});', 'post'),
      L('    }'),
      L('    public List<Integer> getNewsFeed(int userId) {', 'feed'),
      L('        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);', 'feed'),
      L('        pq.addAll(tweets.getOrDefault(userId, List.of()));', 'gather'),
      L('        for (int f : follows.getOrDefault(userId, Set.of()))', 'gather'),
      L('            pq.addAll(tweets.getOrDefault(f, List.of()));', 'gather'),
      L('        List<Integer> res = new ArrayList<>();', 'take'),
      L('        while (!pq.isEmpty() && res.size() < 10)', 'take'),
      L('            res.add(pq.poll()[1]);', 'take'),
      L('        return res;', 'take'),
      L('    }'),
      L('    public void follow(int a, int b) {', 'follow'),
      L('        follows.computeIfAbsent(a, k -> new HashSet<>()).add(b);', 'follow'),
      L('    }'),
      L('    public void unfollow(int a, int b) {', 'unfollow'),
      L('        follows.getOrDefault(a, new HashSet<>()).remove(b);', 'unfollow'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const raw = (values.ops ?? '').split(',').map((o) => o.trim()).filter(Boolean);
    if (raw.length === 0) return { error: 'Enter operations.' };
    if (raw.length > 14) return { error: 'Keep it to at most 14 operations.' };

    let time = 0;
    const tweets = new Map<number, [number, number][]>();
    const follows = new Map<number, Set<number>>();
    const outputs: string[] = [];
    const steps: Step[] = [];
    const view = (feedUser?: number, feed?: number[]): ListState => ({
      chains: [
        ...[...tweets.entries()].map(([u, ts]) => ({
          label: `user ${u}`,
          items: ts.map(([t, id]) => ({ v: `t${t}:#${id}` })),
          broken: true,
        })),
        ...(feed ? [{ label: `feed(${feedUser})`, items: feed.length ? feed.map((id) => ({ v: `#${id}`, mark: 'final' as const })) : [{ v: '(empty)', mark: 'dim' as const }], broken: true }] : []),
      ],
      aggs: [
        {
          label: 'follows',
          value: [...follows.entries()].filter(([, s]) => s.size).map(([a, s]) => `${a}→{${[...s].join(',')}}`).join(' ') || '—',
          c: 'b',
        },
        { label: 'clock', value: String(time), c: 'a' },
      ],
    });
    steps.push({ tag: 'init', trace: ['A single global clock stamps every tweet — recency comparisons across users become plain number comparisons.'], state: view() });
    for (const op of raw) {
      const mPost = op.match(/^post\s+(\d+)\s+(\d+)$/i);
      const mFollow = op.match(/^follow\s+(\d+)\s+(\d+)$/i);
      const mUnfollow = op.match(/^unfollow\s+(\d+)\s+(\d+)$/i);
      const mFeed = op.match(/^feed\s+(\d+)$/i);
      if (mPost) {
        const u = Number(mPost[1]);
        const id = Number(mPost[2]);
        if (!tweets.has(u)) tweets.set(u, []);
        tweets.get(u)!.push([time, id]);
        steps.push({ tag: 'post', trace: ['User ', A(u), ' posts tweet ', B(`#${id}`), ' at time ', A(time), '.'], state: view() });
        time++;
      } else if (mFollow) {
        const a = Number(mFollow[1]);
        const b = Number(mFollow[2]);
        if (!follows.has(a)) follows.set(a, new Set());
        follows.get(a)!.add(b);
        steps.push({ tag: 'follow', trace: ['User ', A(a), ' follows ', B(b), '.'], state: view() });
      } else if (mUnfollow) {
        const a = Number(mUnfollow[1]);
        const b = Number(mUnfollow[2]);
        follows.get(a)?.delete(b);
        steps.push({ tag: 'unfollow', trace: ['User ', A(a), ' unfollows ', F(b), '.'], state: view() });
      } else if (mFeed) {
        const u = Number(mFeed[1]);
        const sources = [u, ...(follows.get(u) ?? [])];
        const pool: [number, number][] = sources.flatMap((s) => tweets.get(s) ?? []);
        pool.sort((x, y) => y[0] - x[0]);
        const feed = pool.slice(0, 10).map(([, id]) => id);
        outputs.push(`feed(${u})→[${feed.join(',')}]`);
        steps.push({
          tag: 'gather',
          tag2: 'take',
          trace: ['feed(', A(u), '): gather tweets from ', A(`{${sources.join(', ')}}`), ', heap-merge by timestamp, take the newest 10 → ', C(`[${feed.join(', ')}]`), '.'],
          state: view(u, feed),
        });
      } else {
        return { error: `Unknown op "${op}". Use: post u t, follow a b, unfollow a b, feed u.` };
      }
    }
    return { steps, result: outputs.join('  ') || 'done', resultDetail: 'feed = k-way merge by global timestamp' };
  },
  note: 'The design splits cleanly: writes are trivially cheap (append + set ops), and the only interesting read — the feed — is exactly the "merge k sorted lists" pattern, because each user\'s tweets are already in time order.',
  complexity: { time: 'feed O(T log T), rest O(1)', space: 'O(users + tweets)' },
};

export const triesDesign = [implementTrie, addSearchWords, wordSearchII, insertDeleteRandom, designTwitter];
