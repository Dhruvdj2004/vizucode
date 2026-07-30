// Trees, part 3 (BST properties, construction, hard paths).
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1, parseIntArray, parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 350;

function makeSnap(root: TNode) {
  const layout = layoutTree(root);
  const done: number[] = [];
  const badges = new Map<number, string>();
  const stack: string[] = [];
  const snap = (extra?: Partial<TreeState>): TreeState => ({
    nodes: layout.nodes.map((n) => ({ ...n, badge: badges.get(n.id) })),
    edges: layout.edges,
    done: [...done],
    stack: stack.map((text) => ({ text })),
    stackTitle: 'Call stack',
    ...extra,
  });
  return { done, badges, stack, snap };
}

/* ================= 68. Count Good Nodes ================= */
const goodNodes: ProblemDef = {
  slug: 'count-good-nodes-in-binary-tree',
  title: 'Count Good Nodes in Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/',
  technique: 'DFS carrying the max seen on the path — a node is good if it meets or beats it.',
  widget: 'tree',
  widgetTitle: 'Tree (✓ = good) & call stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 1, 4, 3, null, 1, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int goodNodes(TreeNode* root) {'),
      L('        return dfs(root, INT_MIN);', 'init'),
      L('    }'),
      L('    int dfs(TreeNode* n, int pathMax) {', 'enter'),
      L('        if (n == nullptr) return 0;', 'enter'),
      L('        int count = (n->val >= pathMax) ? 1 : 0;', 'check'),
      L('        pathMax = max(pathMax, n->val);', 'update'),
      L('        return count + dfs(n->left, pathMax)', 'rec'),
      L('                     + dfs(n->right, pathMax);', 'rec'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int goodNodes(TreeNode root) {'),
      L('        return dfs(root, Integer.MIN_VALUE);', 'init'),
      L('    }'),
      L('    private int dfs(TreeNode n, int pathMax) {', 'enter'),
      L('        if (n == null) return 0;', 'enter'),
      L('        int count = (n.val >= pathMax) ? 1 : 0;', 'check'),
      L('        pathMax = Math.max(pathMax, n.val);', 'update'),
      L('        return count + dfs(n.left, pathMax)', 'rec'),
      L('                     + dfs(n.right, pathMax);', 'rec'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const { done, badges, stack, snap } = makeSnap(root);
    const steps: Step[] = [];
    let count = 0;
    const aggs = () => [{ label: 'good nodes', value: String(count), c: 'b' as const }];
    steps.push({ tag: 'init', trace: ['A node is ', B('good'), ' if nothing on the path from the root above it is larger. Carry that path-max down the DFS.'], state: snap({ aggs: aggs() }) });
    const walk = (n: TNode, pathMax: number) => {
      if (steps.length > MAX_STEPS) return;
      stack.push(`dfs(${n.val}, max=${pathMax === -Infinity ? '−∞' : pathMax})`);
      const good = n.val >= pathMax;
      if (good) {
        count++;
        badges.set(n.id, '✓');
        steps.push({
          tag: 'check',
          trace: [B(n.val), ' ≥ path max ', A(pathMax === -Infinity ? '−∞' : pathMax), ' — ', B('good'), ' (total ', B(count), ').'],
          state: snap({ current: n.id, aggs: aggs() }),
        });
      } else {
        steps.push({
          tag: 'check',
          trace: [F(n.val), ' < path max ', A(pathMax), ' — an ancestor overshadows it; not good.'],
          state: snap({ current: n.id, aggs: aggs() }),
        });
      }
      const newMax = Math.max(pathMax, n.val);
      if (n.left) walk(n.left, newMax);
      if (n.right) walk(n.right, newMax);
      stack.pop();
      done.push(n.id);
    };
    walk(root, -Infinity);
    steps.push({ tag: 'rec', trace: ['DFS complete — ', C(count), ' good node(s).'], state: snap({ aggs: aggs() }) });
    return { steps, result: String(count) };
  },
  note: '"Good" depends only on the root-to-node path, and DFS visits nodes exactly along such paths — so one extra argument (the running max) is the entire state needed. No lookups back up the tree, ever.',
  complexity: { time: 'O(n)', space: 'O(h)' },
};

/* ================= 69. Validate Binary Search Tree ================= */
const validateBST: ProblemDef = {
  slug: 'validate-binary-search-tree',
  title: 'Validate Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/validate-binary-search-tree/',
  technique: 'DFS with an allowed (lo, hi) interval that tightens at every step down.',
  widget: 'tree',
  widgetTitle: 'Tree (bounds shown) & call stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '5, 1, 7, null, null, 6, 8', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isValidBST(TreeNode* root) {'),
      L('        return check(root, LONG_MIN, LONG_MAX);', 'init'),
      L('    }'),
      L('    bool check(TreeNode* n, long lo, long hi) {', 'enter'),
      L('        if (n == nullptr) return true;', 'enter'),
      L('        if (n->val <= lo || n->val >= hi)', 'bad'),
      L('            return false;', 'bad'),
      L('        return check(n->left, lo, n->val) &&', 'recl'),
      L('               check(n->right, n->val, hi);', 'recr'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isValidBST(TreeNode root) {'),
      L('        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);', 'init'),
      L('    }'),
      L('    private boolean check(TreeNode n, long lo, long hi) {', 'enter'),
      L('        if (n == null) return true;', 'enter'),
      L('        if (n.val <= lo || n.val >= hi)', 'bad'),
      L('            return false;', 'bad'),
      L('        return check(n.left, lo, n.val) &&', 'recl'),
      L('               check(n.right, n.val, hi);', 'recr'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const { done, badges, stack, snap } = makeSnap(root);
    const steps: Step[] = [];
    const fmt = (x: number) => (x === -Infinity ? '−∞' : x === Infinity ? '+∞' : String(x));
    let valid = true;
    steps.push({ tag: 'init', trace: ['"Left child smaller" is not enough — every node must respect bounds inherited from ', A('all'), ' its ancestors. Start with (−∞, +∞).'], state: snap() });
    const walk = (n: TNode | null, lo: number, hi: number): boolean => {
      if (!n || !valid || steps.length > MAX_STEPS) return true;
      stack.push(`check(${n.val})`);
      badges.set(n.id, `(${fmt(lo)},${fmt(hi)})`);
      if (n.val <= lo || n.val >= hi) {
        valid = false;
        steps.push({
          tag: 'bad',
          trace: [F(n.val), ' violates its allowed interval (', A(fmt(lo)), ', ', A(fmt(hi)), ') — not a BST. Return ', C('false'), '.'],
          state: snap({ current: n.id }),
        });
        stack.pop();
        return false;
      }
      steps.push({
        tag: 'enter',
        trace: [B(n.val), ' fits inside (', A(fmt(lo)), ', ', A(fmt(hi)), ') ✓ — left child inherits (', A(fmt(lo)), ', ', B(n.val), '), right child (', B(n.val), ', ', A(fmt(hi)), ').'],
        state: snap({ current: n.id }),
      });
      const ok = walk(n.left, lo, n.val) && walk(n.right, n.val, hi);
      stack.pop();
      if (ok) done.push(n.id);
      return ok;
    };
    walk(root, -Infinity, Infinity);
    steps.push({
      tag: valid ? 'enter' : 'bad',
      trace: valid ? ['Every node respected its interval — valid BST: ', C('true'), '.'] : ['Validation aborted at the violation: ', C('false'), '.'],
      state: snap(),
    });
    return { steps, result: String(valid) };
  },
  note: 'The classic trap: comparing only parent and child accepts trees where a grandchild sneaks outside a grandparent\'s range. Passing down an interval encodes *all* ancestor constraints in two numbers — each node checks once, O(n) total.',
  complexity: { time: 'O(n)', space: 'O(h)' },
};

/* ================= 70. Kth Smallest Element in a BST ================= */
const kthSmallest: ProblemDef = {
  slug: 'kth-smallest-element-in-a-bst',
  title: 'Kth Smallest Element in a BST',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
  technique: 'In-order traversal visits BST values in sorted order — stop at the kth visit.',
  widget: 'tree',
  widgetTitle: 'In-order walk (visit numbers)',
  inputs: [
    { key: 'tree', label: 'BST (level-order)', defaultValue: '5, 3, 6, 2, 4, null, null, 1', wide: true },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    int count = 0, result = -1;', 'init'),
      L('public:'),
      L('    int kthSmallest(TreeNode* root, int k) {'),
      L('        inorder(root, k);', 'init'),
      L('        return result;', 'ret'),
      L('    }'),
      L('    void inorder(TreeNode* n, int k) {', 'enter'),
      L('        if (n == nullptr || result != -1) return;', 'enter'),
      L('        inorder(n->left, k);', 'recl'),
      L('        if (++count == k) {', 'visit', 'found'),
      L('            result = n->val;', 'found'),
      L('            return;', 'found'),
      L('        }'),
      L('        inorder(n->right, k);', 'recr'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int count = 0, result = -1;', 'init'),
      L('    public int kthSmallest(TreeNode root, int k) {'),
      L('        inorder(root, k);', 'init'),
      L('        return result;', 'ret'),
      L('    }'),
      L('    private void inorder(TreeNode n, int k) {', 'enter'),
      L('        if (n == null || result != -1) return;', 'enter'),
      L('        inorder(n.left, k);', 'recl'),
      L('        if (++count == k) {', 'visit', 'found'),
      L('            result = n.val;', 'found'),
      L('            return;', 'found'),
      L('        }'),
      L('        inorder(n.right, k);', 'recr'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const k = parseInt1(values.k, 'k', { min: 1 });
    if (typeof k === 'string') return { error: k };
    const total = levels.filter((v) => v !== null).length;
    if (k > total) return { error: `k must be ≤ number of nodes (${total}).` };

    const { done, badges, stack, snap } = makeSnap(root);
    const steps: Step[] = [];
    let count = 0;
    let result: number | null = null;
    steps.push({ tag: 'init', trace: ['In-order = left, node, right — on a BST that yields values in ascending order. Count visits until ', C(k), '.'], state: snap() });
    const walk = (n: TNode | null) => {
      if (!n || result !== null || steps.length > MAX_STEPS) return;
      stack.push(`in(${n.val})`);
      if (n.left) {
        steps.push({ tag: 'recl', trace: ['Slide left below ', A(n.val), ' — smaller values first.'], state: snap({ current: n.id }) });
        walk(n.left);
      }
      if (result === null) {
        count++;
        badges.set(n.id, `#${count}`);
        if (count === k) {
          result = n.val;
          steps.push({ tag: 'found', trace: ['Visit #', C(count), ': ', C(n.val), ' — that is the kth smallest. Stop.'], state: snap({ current: n.id }) });
        } else {
          done.push(n.id);
          steps.push({ tag: 'visit', trace: ['Visit #', B(count), ': ', B(n.val), ' — not yet the ', A(k), 'th.'], state: snap({ current: n.id }) });
          if (n.right) {
            steps.push({ tag: 'recr', trace: ['Now the right side of ', A(n.val), '.'], state: snap({ current: n.id }) });
            walk(n.right);
          }
        }
      }
      stack.pop();
    };
    walk(root);
    steps.push({ tag: 'ret', trace: ['Answer: ', C(result!), '.'], state: snap() });
    return { steps, result: String(result), resultDetail: `${k}th smallest value` };
  },
  note: 'A BST *is* a sorted list folded into a tree, and in-order traversal unfolds it — so "kth smallest" needs no extra data structure, just a counter and early exit after k visits (O(h + k), not O(n)).',
  complexity: { time: 'O(h + k)', space: 'O(h)' },
};

/* ================= 71. Construct Binary Tree from Preorder and Inorder ================= */
const buildFromPreIn: ProblemDef = {
  slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
  title: 'Construct Binary Tree from Preorder and Inorder Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
  technique: 'Preorder names each root; inorder tells you what lies left and right of it.',
  widget: 'tree',
  widgetTitle: 'Tree materializing & call stack',
  inputs: [
    { key: 'preorder', label: 'Preorder', defaultValue: '3, 9, 20, 15, 7', wide: true },
    { key: 'inorder', label: 'Inorder', defaultValue: '9, 3, 15, 20, 7', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    int pre = 0;', 'init'),
      L('    unordered_map<int, int> inPos;', 'init'),
      L('public:'),
      L('    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {'),
      L('        for (int i = 0; i < inorder.size(); i++)', 'init'),
      L('            inPos[inorder[i]] = i;', 'init'),
      L('        return build(preorder, 0, inorder.size() - 1);', 'init'),
      L('    }'),
      L('    TreeNode* build(vector<int>& preorder, int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return nullptr;', 'enter'),
      L('        TreeNode* root = new TreeNode(preorder[pre++]);', 'root'),
      L('        int mid = inPos[root->val];', 'split'),
      L('        root->left = build(preorder, lo, mid - 1);', 'recl'),
      L('        root->right = build(preorder, mid + 1, hi);', 'recr'),
      L('        return root;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int pre = 0;', 'init'),
      L('    private Map<Integer, Integer> inPos = new HashMap<>();', 'init'),
      L('    public TreeNode buildTree(int[] preorder, int[] inorder) {'),
      L('        for (int i = 0; i < inorder.length; i++)', 'init'),
      L('            inPos.put(inorder[i], i);', 'init'),
      L('        return build(preorder, 0, inorder.length - 1);', 'init'),
      L('    }'),
      L('    private TreeNode build(int[] preorder, int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return null;', 'enter'),
      L('        TreeNode root = new TreeNode(preorder[pre++]);', 'root'),
      L('        int mid = inPos.get(root.val);', 'split'),
      L('        root.left = build(preorder, lo, mid - 1);', 'recl'),
      L('        root.right = build(preorder, mid + 1, hi);', 'recr'),
      L('        return root;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const pre = parseIntArray(values.preorder, { maxLen: 12 });
    if (typeof pre === 'string') return { error: pre };
    const ino = parseIntArray(values.inorder, { maxLen: 12 });
    if (typeof ino === 'string') return { error: ino };
    if (pre.length !== ino.length) return { error: 'Traversals must have the same length.' };
    if (new Set(pre).size !== pre.length) return { error: 'Values must be distinct.' };
    if ([...pre].sort().join() !== [...ino].sort().join()) return { error: 'Traversals must contain the same values.' };

    // Build the tree first (to lay it out), then replay construction steps.
    const inPos = new Map(ino.map((v, i) => [v, i]));
    let preIdx = 0;
    const build = (lo: number, hi: number): TNode | null => {
      if (lo > hi) return null;
      const val = pre[preIdx++];
      const node: TNode = { id: inPos.get(val)!, val, left: null, right: null };
      const mid = inPos.get(val)!;
      node.left = build(lo, mid - 1);
      node.right = build(mid + 1, hi);
      return node;
    };
    const root = build(0, ino.length - 1);
    if (!root) return { error: 'Empty input.' };
    const layout = layoutTree(root);
    const created: number[] = [];
    const stack: string[] = [];
    const steps: Step[] = [];
    const snap = (current: number | null): TreeState => ({
      nodes: layout.nodes.filter((n) => created.includes(n.id) || n.id === current),
      edges: layout.edges.filter(([a, b]) => (created.includes(a) || a === current) && (created.includes(b) || b === current)),
      current,
      done: [...created],
      stack: stack.map((text) => ({ text })),
      stackTitle: 'Build ranges',
    });
    steps.push({
      tag: 'init',
      trace: ['Index every inorder value for O(1) splits. Preorder = ', A(`[${pre.join(', ')}]`), ', inorder = ', A(`[${ino.join(', ')}]`), '.'],
      state: snap(null),
    });
    preIdx = 0;
    const replay = (lo: number, hi: number): void => {
      if (lo > hi || steps.length > MAX_STEPS) return;
      const val = pre[preIdx++];
      const mid = inPos.get(val)!;
      stack.push(`build[${lo}..${hi}]`);
      steps.push({
        tag: 'root',
        trace: ['Next preorder value ', A(val), ' is the root of inorder range [', A(lo), '…', A(hi), '].'],
        state: snap(mid),
      });
      created.push(mid);
      steps.push({
        tag: 'split',
        trace: ['In inorder, ', A(val), ' sits at index ', A(mid), ' — ', B(mid - lo), ' value(s) go left, ', B(hi - mid), ' go right.'],
        state: snap(mid),
      });
      replay(lo, mid - 1);
      replay(mid + 1, hi);
      stack.pop();
    };
    replay(0, ino.length - 1);
    steps.push({ tag: 'ret', trace: ['All ranges consumed — the tree is uniquely reconstructed.'], state: snap(null) });
    const lvl: (number | string)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        lvl.push('null');
        continue;
      }
      lvl.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    while (lvl[lvl.length - 1] === 'null') lvl.pop();
    return { steps, result: `[${lvl.join(', ')}]`, resultDetail: 'level-order of the rebuilt tree' };
  },
  note: 'Preorder\'s first element is always the current subtree\'s root; finding it in inorder splits the remaining values into exact left and right subtrees. The recursion consumes preorder strictly left to right, so a single shared index replaces slicing.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= 72. Binary Tree Maximum Path Sum ================= */
const maxPathSum: ProblemDef = {
  slug: 'binary-tree-maximum-path-sum',
  title: 'Binary Tree Maximum Path Sum',
  category: 'Trees',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
  technique: 'Post-order "gains": each node offers its parent one branch, but bids both branches for the global best.',
  widget: 'tree',
  widgetTitle: 'Tree (gain badges) & call stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '-10, 9, 20, null, null, 15, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    int best = INT_MIN;', 'init'),
      L('public:'),
      L('    int maxPathSum(TreeNode* root) {'),
      L('        gain(root);', 'init'),
      L('        return best;', 'retall'),
      L('    }'),
      L('    int gain(TreeNode* n) {', 'enter'),
      L('        if (n == nullptr) return 0;', 'enter'),
      L('        int l = max(gain(n->left), 0);', 'recl'),
      L('        int r = max(gain(n->right), 0);', 'recr'),
      L('        best = max(best, n->val + l + r);', 'update'),
      L('        return n->val + max(l, r);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int best = Integer.MIN_VALUE;', 'init'),
      L('    public int maxPathSum(TreeNode root) {'),
      L('        gain(root);', 'init'),
      L('        return best;', 'retall'),
      L('    }'),
      L('    private int gain(TreeNode n) {', 'enter'),
      L('        if (n == null) return 0;', 'enter'),
      L('        int l = Math.max(gain(n.left), 0);', 'recl'),
      L('        int r = Math.max(gain(n.right), 0);', 'recr'),
      L('        best = Math.max(best, n.val + l + r);', 'update'),
      L('        return n.val + Math.max(l, r);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const { done, badges, stack, snap } = makeSnap(root);
    const steps: Step[] = [];
    let best = -Infinity;
    const aggs = () => [{ label: 'best path sum', value: best === -Infinity ? '—' : String(best), c: 'b' as const }];
    steps.push({
      tag: 'init',
      trace: ['A path may bend at one node. Each node reports upward the best ', A('single-branch gain'), ' — but locally tries the full ', B('left + node + right'), ' bend.'],
      state: snap({ aggs: aggs() }),
    });
    const walk = (n: TNode): number => {
      if (steps.length > MAX_STEPS) return 0;
      stack.push(`gain(${n.val})`);
      steps.push({ tag: 'enter', trace: ['Enter ', A(`gain(${n.val})`), '.'], state: snap({ current: n.id, aggs: aggs() }) });
      const l = n.left ? Math.max(walk(n.left), 0) : 0;
      const r = n.right ? Math.max(walk(n.right), 0) : 0;
      const bend = n.val + l + r;
      if (bend > best) best = bend;
      steps.push({
        tag: 'update',
        trace: ['Bend at ', A(n.val), ': ', A(l), ' + ', A(n.val), ' + ', A(r), ' = ', bend === best ? B(bend) : A(bend), bend === best ? ' — best so far.' : '.'],
        state: snap({ current: n.id, aggs: aggs() }),
      });
      const up = n.val + Math.max(l, r);
      badges.set(n.id, `↑${up}`);
      stack.pop();
      done.push(n.id);
      steps.push({
        tag: 'ret',
        trace: ['Offer the parent only one branch: ', B(up), ' (negative gains are clamped to 0 — better to skip a losing subtree).'],
        state: snap({ current: n.id, aggs: aggs() }),
      });
      return up;
    };
    walk(root);
    steps.push({ tag: 'retall', trace: ['Maximum path sum: ', C(best), '.'], state: snap({ aggs: aggs() }) });
    return { steps, result: String(best) };
  },
  note: 'The asymmetry is the whole problem: a path through a node may use both children, but the value passed to the parent may use only one (a path cannot fork twice). Clamping negative gains to zero implements "you may simply not extend downward".',
  complexity: { time: 'O(n)', space: 'O(h)' },
};

/* ================= 73. Serialize and Deserialize Binary Tree ================= */
const serializeTree: ProblemDef = {
  slug: 'serialize-and-deserialize-binary-tree',
  title: 'Serialize and Deserialize Binary Tree',
  category: 'Trees',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
  technique: 'Preorder with explicit "#" nulls — the string rebuilds the tree with zero ambiguity.',
  widget: 'tree',
  widgetTitle: 'Tree ↔ string',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 3, null, null, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Codec {'),
      L('public:'),
      L('    string serialize(TreeNode* root) {', 'ser'),
      L('        if (root == nullptr) return "#";', 'sernull'),
      L('        return to_string(root->val) + "," +', 'ser'),
      L('               serialize(root->left) + "," +', 'ser'),
      L('               serialize(root->right);', 'ser'),
      L('    }'),
      L('    TreeNode* deserialize(string data) {', 'deser'),
      L('        queue<string> tokens = split(data);', 'deser'),
      L('        return build(tokens);', 'deser'),
      L('    }'),
      L('    TreeNode* build(queue<string>& t) {', 'build'),
      L('        string tok = t.front(); t.pop();', 'build'),
      L('        if (tok == "#") return nullptr;', 'buildnull'),
      L('        TreeNode* n = new TreeNode(stoi(tok));', 'build'),
      L('        n->left = build(t);', 'build'),
      L('        n->right = build(t);', 'build'),
      L('        return n;', 'build'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Codec {'),
      L('    public String serialize(TreeNode root) {', 'ser'),
      L('        if (root == null) return "#";', 'sernull'),
      L('        return root.val + "," +', 'ser'),
      L('               serialize(root.left) + "," +', 'ser'),
      L('               serialize(root.right);', 'ser'),
      L('    }'),
      L('    public TreeNode deserialize(String data) {', 'deser'),
      L('        Queue<String> t = new LinkedList<>(Arrays.asList(data.split(",")));', 'deser'),
      L('        return build(t);', 'deser'),
      L('    }'),
      L('    private TreeNode build(Queue<String> t) {', 'build'),
      L('        String tok = t.poll();', 'build'),
      L('        if (tok.equals("#")) return null;', 'buildnull'),
      L('        TreeNode n = new TreeNode(Integer.parseInt(tok));', 'build'),
      L('        n.left = build(t);', 'build'),
      L('        n.right = build(t);', 'build'),
      L('        return n;', 'build'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const layout = layoutTree(root);
    const steps: Step[] = [];
    const done: number[] = [];
    const tokens: string[] = [];
    const snap = (current: number | null): TreeState => ({
      nodes: layout.nodes,
      edges: layout.edges,
      current,
      done: [...done],
      aggs: [{ label: 'string', value: tokens.join(',') || '—', c: 'a' }],
    });
    steps.push({ tag: 'ser', trace: ['Serialize by preorder, writing ', A('#'), ' for every null — the nulls are what make the string unambiguous.'], state: snap(null) });
    const ser = (n: TNode | null) => {
      if (steps.length > MAX_STEPS) return;
      if (!n) {
        tokens.push('#');
        steps.push({ tag: 'sernull', trace: ['Null child — emit ', F('#'), '.'], state: snap(null) });
        return;
      }
      tokens.push(String(n.val));
      steps.push({ tag: 'ser', trace: ['Visit ', A(n.val), ' — emit it, then its left and right subtrees.'], state: snap(n.id) });
      ser(n.left);
      ser(n.right);
    };
    ser(root);
    const data = tokens.join(',');
    steps.push({ tag: 'deser', trace: ['Serialized: "', B(data), '". Now deserialize by replaying the same preorder.'], state: snap(null) });
    let idx = 0;
    const rebuild = (parentVal: string | null): void => {
      if (steps.length > MAX_STEPS || idx >= tokens.length) return;
      const tok = tokens[idx++];
      if (tok === '#') {
        steps.push({ tag: 'buildnull', trace: ['Token ', F('#'), ' — attach null', parentVal ? ` under ${parentVal}` : '', '.'], state: snap(null) });
        return;
      }
      const node = layout.nodes.find((n) => !done.includes(n.id) && String(n.val) === tok);
      if (node) done.push(node.id);
      steps.push({ tag: 'build', trace: ['Token ', B(tok), ' — create the node, then recursively read its two subtrees.'], state: snap(node?.id ?? null) });
      rebuild(tok);
      rebuild(tok);
    };
    rebuild(null);
    steps.push({ tag: 'build', trace: ['Every token consumed — the rebuilt tree is identical to the original. Round trip ', C('✓'), '.'], state: snap(null) });
    return { steps, result: `"${data}"`, resultDetail: 'serialized form (preorder with # nulls)' };
  },
  note: 'Preorder alone can\'t reconstruct a tree — but preorder *with explicit nulls* can: every "#" tells the builder exactly where a subtree ends, so deserialization is the same recursion reading tokens instead of nodes.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

export const trees3 = [goodNodes, validateBST, kthSmallest, buildFromPreIn, maxPathSum, serializeTree];
