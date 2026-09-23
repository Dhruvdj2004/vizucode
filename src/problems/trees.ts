// Trees template problems: DFS recursion (call stack) and BFS (queue).
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, L } from '../lib/trace';

const MAX_STEPS = 400;

/* ================================================================
 * 226. Invert Binary Tree
 * ================================================================ */
const invertTree: ProblemDef = {
  slug: 'invert-binary-tree',
  title: 'Invert Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/invert-binary-tree/',
  technique: 'Recursive DFS: swap the two children at every node, then recurse into both.',
  widget: 'tree',
  widgetTitle: 'Tree (live) & call stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '4, 2, 7, 1, 3, 6, 9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* invertTree(TreeNode* root) {', 'enter'),
      L('        if (root == nullptr) return nullptr;', 'enter'),
      L('        swap(root->left, root->right);', 'swap'),
      L('        invertTree(root->left);', 'recl'),
      L('        invertTree(root->right);', 'recr'),
      L('        return root;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode invertTree(TreeNode root) {', 'enter'),
      L('        if (root == null) return null;', 'enter'),
      L('        TreeNode t = root.left;', 'swap'),
      L('        root.left = root.right;', 'swap'),
      L('        root.right = t;', 'swap'),
      L('        invertTree(root.left);', 'recl'),
      L('        invertTree(root.right);', 'recr'),
      L('        return root;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };

    const steps: Step[] = [];
    const done: number[] = [];
    const stack: string[] = [];
    const snap = (extra?: Partial<TreeState>): TreeState => ({
      ...layoutTree(root),
      done: [...done],
      stack: stack.map((text) => ({ text })),
      stackTitle: 'Call stack',
      ...extra,
    });

    const walk = (node: TNode) => {
      if (steps.length > MAX_STEPS) return;
      stack.push(`invert(${node.val})`);
      steps.push({
        tag: 'enter',
        trace: ['Call ', A(`invert(${node.val})`), ' — node is not null, so we do real work here.'],
        state: snap({ current: node.id }),
      });
      const hadChildren = node.left !== null || node.right !== null;
      [node.left, node.right] = [node.right, node.left];
      steps.push({
        tag: 'swap',
        trace: hadChildren
          ? ['Swap the children of ', A(node.val), ' — watch the subtrees trade places.']
          : [A(node.val), ' is a leaf — swapping two null children changes nothing.'],
        state: snap({ current: node.id }),
      });
      if (node.left) {
        steps.push({
          tag: 'recl',
          tag2: 'enter',
          trace: ['Recurse into the (new) left child ', A(node.left.val), '.'],
          state: snap({ current: node.id }),
        });
        walk(node.left);
      }
      if (node.right) {
        steps.push({
          tag: 'recr',
          tag2: 'enter',
          trace: ['Recurse into the (new) right child ', A(node.right.val), '.'],
          state: snap({ current: node.id }),
        });
        walk(node.right);
      }
      stack.pop();
      done.push(node.id);
      steps.push({
        tag: 'ret',
        trace: ['Subtree under ', B(node.val), ' is fully inverted — return to the caller.'],
        state: snap({ current: node.id }),
      });
    };
    walk(root);

    // Final level-order readout of the inverted tree.
    const out: (number | string)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        out.push('null');
        continue;
      }
      out.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    while (out[out.length - 1] === 'null') out.pop();
    steps.push({
      tag: 'ret',
      trace: ['Every node has been visited — the whole tree is mirrored: ', C(`[${out.join(', ')}]`), '.'],
      state: snap(),
    });
    return { steps, result: `[${out.join(', ')}]`, resultDetail: 'inverted tree, level order' };
  },
  note: 'Mirroring a tree is just "swap children" applied at every node — the recursion guarantees every node gets its turn exactly once. The order (swap before recursing) does not matter, because each swap is local to its node.',
  complexity: { time: 'O(n)', space: 'O(h) recursion stack' },
  brute: {
    label: 'BFS with a queue',
    technique: 'Visit nodes level by level with a queue, swapping each node’s children as it is dequeued.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    TreeNode* invertTree(TreeNode* root) {'),
        L('        if (!root) return root;', 'enter'),
        L('        queue<TreeNode*> q; q.push(root);', 'enter'),
        L('        while (!q.empty()) {', 'swap'),
        L('            TreeNode* node = q.front(); q.pop();', 'swap'),
        L('            swap(node->left, node->right);', 'swap'),
        L('            if (node->left) q.push(node->left);', 'recl'),
        L('            if (node->right) q.push(node->right);', 'recr'),
        L('        }'),
        L('        return root;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public TreeNode invertTree(TreeNode root) {'),
        L('        if (root == null) return root;', 'enter'),
        L('        Queue<TreeNode> q = new LinkedList<>(List.of(root));', 'enter'),
        L('        while (!q.isEmpty()) {', 'swap'),
        L('            TreeNode node = q.poll();', 'swap'),
        L('            TreeNode t = node.left; node.left = node.right; node.right = t;', 'swap'),
        L('            if (node.left != null) q.add(node.left);', 'recl'),
        L('            if (node.right != null) q.add(node.right);', 'recr'),
        L('        }'),
        L('        return root;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const steps: Step[] = [];
      const done: number[] = [];
      let queue: TNode[] = [root];
      const snap = (current: number | null): TreeState => ({
        ...layoutTree(root),
        current,
        done: [...done],
        queued: queue.map((n) => n.id),
        stack: queue.map((n) => ({ text: `node ${n.val}` })),
        stackTitle: 'Queue',
      });
      steps.push({ tag: 'enter', trace: ['No recursion: put the root in a queue and swap children as nodes come out.'], state: snap(null) });
      while (queue.length && steps.length < MAX_STEPS) {
        const node = queue.shift()!;
        [node.left, node.right] = [node.right, node.left];
        done.push(node.id);
        steps.push({ tag: 'swap', trace: ['Dequeue ', A(node.val), ' and swap its children.'], state: snap(node.id) });
        const kids = [node.left, node.right].filter((c): c is TNode => c !== null);
        queue = [...queue, ...kids];
        if (kids.length) steps.push({ tag: 'recl', trace: ['Enqueue ', A(kids.map((k) => k.val).join(' and ')), '.'], state: snap(node.id) });
      }
      const out: (number | string)[] = [];
      const q: (TNode | null)[] = [root];
      while (q.length) {
        const n = q.shift()!;
        if (!n) {
          out.push('null');
          continue;
        }
        out.push(n.val);
        if (n.left || n.right) q.push(n.left, n.right);
      }
      while (out[out.length - 1] === 'null') out.pop();
      steps.push({ tag: 'ret', trace: ['Every node swapped — mirrored tree: ', C(`[${out.join(', ')}]`), '.'], state: snap(null) });
      return { steps, result: `[${out.join(', ')}]`, resultDetail: 'inverted tree, level order' };
    },
    note: 'Same O(n) work as the recursive version, since each node’s swap is independent of order. The queue holds at most one level (O(w)) instead of a call stack as deep as the tree (O(h)).',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================================================================
 * 104. Maximum Depth of Binary Tree
 * ================================================================ */
const maxDepth: ProblemDef = {
  slug: 'maximum-depth-of-binary-tree',
  title: 'Maximum Depth of Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
  technique: 'Post-order DFS: a node\'s depth is 1 + the deeper of its two subtrees.',
  widget: 'tree',
  widgetTitle: 'Tree (depth badges) & call stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 9, 20, null, null, 15, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int maxDepth(TreeNode* root) {', 'enter'),
      L('        if (root == nullptr) return 0;', 'base'),
      L('        int left = maxDepth(root->left);', 'recl'),
      L('        int right = maxDepth(root->right);', 'recr'),
      L('        return 1 + max(left, right);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int maxDepth(TreeNode root) {', 'enter'),
      L('        if (root == null) return 0;', 'base'),
      L('        int left = maxDepth(root.left);', 'recl'),
      L('        int right = maxDepth(root.right);', 'recr'),
      L('        return 1 + Math.max(left, right);', 'ret'),
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

    const walk = (node: TNode): number => {
      if (steps.length > MAX_STEPS) return 0;
      stack.push(`depth(${node.val})`);
      steps.push({
        tag: 'enter',
        tag2: 'base',
        trace: ['Call ', A(`maxDepth(${node.val})`), ' — not null, so ask both children how deep they go.'],
        state: snap({ current: node.id }),
      });
      let l = 0;
      let r = 0;
      if (node.left) {
        steps.push({
          tag: 'recl',
          tag2: 'enter',
          trace: ['Recurse left from ', A(node.val), ' into ', A(node.left.val), '.'],
          state: snap({ current: node.id }),
        });
        l = walk(node.left);
      }
      if (node.right) {
        steps.push({
          tag: 'recr',
          tag2: 'enter',
          trace: ['Recurse right from ', A(node.val), ' into ', A(node.right.val), '.'],
          state: snap({ current: node.id }),
        });
        r = walk(node.right);
      }
      const d = 1 + Math.max(l, r);
      badges.set(node.id, `d=${d}`);
      stack.pop();
      done.push(node.id);
      steps.push({
        tag: 'ret',
        trace: ['Node ', B(node.val), ' returns 1 + max(', A(l), ', ', A(r), ') = ', B(d), '.'],
        state: snap({ current: node.id }),
      });
      return d;
    };
    const answer = walk(root);
    steps.push({
      tag: 'ret',
      trace: ['The root\'s answer is the tree\'s height: ', C(answer), '.'],
      state: snap(),
    });
    return { steps, result: String(answer), resultDetail: 'maximum depth (nodes on the longest root-to-leaf path)' };
  },
  note: 'Depth composes bottom-up: a node cannot know its depth until both subtrees report theirs, which is why the "work" (the +1 and the max) happens after the recursive calls return — classic post-order. Null children contribute 0, which makes leaves depth 1 automatically.',
  complexity: { time: 'O(n)', space: 'O(h) recursion stack' },
  brute: {
    label: 'BFS level count',
    technique: 'Process the tree one level at a time with a queue and count how many levels there are.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int maxDepth(TreeNode* root) {'),
        L('        if (!root) return 0;', 'base'),
        L('        queue<TreeNode*> q; q.push(root); int depth = 0;', 'enter'),
        L('        while (!q.empty()) {', 'recl'),
        L('            depth++;', 'recl'),
        L('            for (int i = q.size(); i > 0; i--) {', 'recr'),
        L('                TreeNode* n = q.front(); q.pop();', 'recr'),
        L('                if (n->left) q.push(n->left);', 'recr'),
        L('                if (n->right) q.push(n->right);', 'recr'),
        L('            }'),
        L('        }'),
        L('        return depth;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int maxDepth(TreeNode root) {'),
        L('        if (root == null) return 0;', 'base'),
        L('        Queue<TreeNode> q = new LinkedList<>(List.of(root)); int depth = 0;', 'enter'),
        L('        while (!q.isEmpty()) {', 'recl'),
        L('            depth++;', 'recl'),
        L('            for (int i = q.size(); i > 0; i--) {', 'recr'),
        L('                TreeNode n = q.poll();', 'recr'),
        L('                if (n.left != null) q.add(n.left);', 'recr'),
        L('                if (n.right != null) q.add(n.right);', 'recr'),
        L('            }'),
        L('        }'),
        L('        return depth;', 'ret'),
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
      const badges = new Map<number, string>();
      let queue: TNode[] = [root];
      let depth = 0;
      const snap = (): TreeState => ({
        nodes: layout.nodes.map((n) => ({ ...n, badge: badges.get(n.id) })),
        edges: layout.edges,
        queued: queue.map((n) => n.id),
        done: [...badges.keys()],
        aggs: [{ label: 'levels counted', value: String(depth), c: 'c' }],
      });
      steps.push({ tag: 'enter', trace: ['Count levels instead of recursing: start with the root alone in the queue.'], state: snap() });
      while (queue.length) {
        depth++;
        const next: TNode[] = [];
        for (const n of queue) {
          badges.set(n.id, `L${depth}`);
          if (n.left) next.push(n.left);
          if (n.right) next.push(n.right);
        }
        steps.push({ tag: 'recl', trace: ['Level ', A(depth), ' has ', A(queue.length), ' node(s): ', B(queue.map((n) => n.val).join(', ')), '.'], state: snap() });
        queue = next;
      }
      steps.push({ tag: 'ret', trace: ['The queue ran dry after ', C(depth), ' level(s) — that is the depth.'], state: snap() });
      return { steps, result: String(depth), resultDetail: 'maximum depth (nodes on the longest root-to-leaf path)' };
    },
    note: 'Also O(n), counting levels top-down instead of combining heights bottom-up. BFS uses O(w) memory for the widest level; recursion uses O(h) for the deepest path — pick the one that is smaller for your trees.',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================================================================
 * 102. Binary Tree Level Order Traversal
 * ================================================================ */
const levelOrder: ProblemDef = {
  slug: 'binary-tree-level-order-traversal',
  title: 'Binary Tree Level Order Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
  technique: 'BFS with a queue, snapshotting the queue size to slice the traversal into levels.',
  widget: 'tree',
  widgetTitle: 'Tree & BFS queue',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 9, 20, null, null, 15, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> levelOrder(TreeNode* root) {'),
      L('        vector<vector<int>> res;', 'init'),
      L('        if (root == nullptr) return res;', 'init'),
      L('        queue<TreeNode*> q;', 'init'),
      L('        q.push(root);', 'init'),
      L('        while (!q.empty()) {', 'loop'),
      L('            int sz = q.size();', 'level'),
      L('            vector<int> level;', 'level'),
      L('            for (int i = 0; i < sz; i++) {'),
      L('                TreeNode* node = q.front(); q.pop();', 'pop'),
      L('                level.push_back(node->val);', 'pop'),
      L('                if (node->left) q.push(node->left);', 'push'),
      L('                if (node->right) q.push(node->right);', 'push'),
      L('            }'),
      L('            res.push_back(level);', 'commit'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> levelOrder(TreeNode root) {'),
      L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
      L('        if (root == null) return res;', 'init'),
      L('        Queue<TreeNode> q = new LinkedList<>();', 'init'),
      L('        q.add(root);', 'init'),
      L('        while (!q.isEmpty()) {', 'loop'),
      L('            int sz = q.size();', 'level'),
      L('            List<Integer> level = new ArrayList<>();', 'level'),
      L('            for (int i = 0; i < sz; i++) {'),
      L('                TreeNode node = q.poll();', 'pop'),
      L('                level.add(node.val);', 'pop'),
      L('                if (node.left != null) q.add(node.left);', 'push'),
      L('                if (node.right != null) q.add(node.right);', 'push'),
      L('            }'),
      L('            res.add(level);', 'commit'),
      L('        }'),
      L('        return res;', 'ret'),
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
    const res: number[][] = [];
    let queue: TNode[] = [root];

    const fmtRes = (extra?: number[]) => {
      const all = extra ? [...res, extra] : res;
      return all.length === 0 ? '[]' : `[${all.map((lv) => `[${lv.join(',')}]`).join(', ')}]`;
    };
    const snap = (current: number | null, level?: number[], extra?: Partial<TreeState>): TreeState => ({
      nodes: layout.nodes,
      edges: layout.edges,
      current,
      done: [...done],
      queued: queue.map((n) => n.id),
      stack: queue.map((n) => ({ text: `node ${n.val}` })),
      stackTitle: 'Queue (front last)',
      aggs: [
        { label: 'current level', value: level ? `[${level.join(', ')}]` : '—', c: 'a' },
        { label: 'result', value: fmtRes(), c: 'b' },
      ],
      ...extra,
    });

    steps.push({
      tag: 'init',
      trace: ['Seed the queue with the root ', A(root.val), '. Each loop pass will consume exactly one level.'],
      state: snap(null),
    });
    while (queue.length > 0 && steps.length < MAX_STEPS) {
      const sz = queue.length;
      const level: number[] = [];
      steps.push({
        tag: 'level',
        trace: ['The queue holds ', A(sz), ` node${sz > 1 ? 's' : ''} — that is the entire next level. Freeze that count.`],
        state: snap(null, level),
      });
      for (let i = 0; i < sz; i++) {
        const node = queue.shift()!;
        level.push(node.val);
        steps.push({
          tag: 'pop',
          trace: ['Dequeue ', A(node.val), ' and add it to the current level.'],
          state: snap(node.id, level),
        });
        const children = [node.left, node.right].filter((c): c is TNode => c !== null);
        if (children.length > 0) {
          queue.push(...children);
          steps.push({
            tag: 'push',
            trace: ['Enqueue its child', children.length > 1 ? 'ren ' : ' ', ...children.flatMap((c, j) => (j > 0 ? [' and ', A(c.val)] : [A(c.val)])), ' for the next level.'],
            state: snap(node.id, level),
          });
        }
        done.push(node.id);
      }
      res.push(level);
      steps.push({
        tag: 'commit',
        trace: ['Level complete — commit ', B(`[${level.join(', ')}]`), ' to the result.'],
        state: snap(null),
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Queue empty — every level has been captured: ', C(fmtRes()), '.'],
      state: snap(null),
    });
    return { steps, result: fmtRes(), resultDetail: 'values grouped level by level' };
  },
  note: 'A queue naturally serves nodes in the order they were discovered, so parents always come out before their children. Freezing the queue size before the inner loop is the trick that draws the boundary between one level and the next.',
  complexity: { time: 'O(n)', space: 'O(w) — widest level' },
  brute: {
    label: 'DFS with a depth index',
    technique: 'Walk the tree depth-first, appending each value to the list for its depth; lists fill in level order automatically.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void dfs(TreeNode* n, int depth, vector<vector<int>>& res) {', 'pop'),
        L('        if (!n) return;', 'pop'),
        L('        if (res.size() == depth) res.push_back({});', 'level'),
        L('        res[depth].push_back(n->val);', 'commit'),
        L('        dfs(n->left, depth + 1, res);', 'push'),
        L('        dfs(n->right, depth + 1, res);', 'push'),
        L('    }'),
        L('public:'),
        L('    vector<vector<int>> levelOrder(TreeNode* root) {'),
        L('        vector<vector<int>> res;', 'init'),
        L('        dfs(root, 0, res);', 'init'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void dfs(TreeNode n, int depth, List<List<Integer>> res) {', 'pop'),
        L('        if (n == null) return;', 'pop'),
        L('        if (res.size() == depth) res.add(new ArrayList<>());', 'level'),
        L('        res.get(depth).add(n.val);', 'commit'),
        L('        dfs(n.left, depth + 1, res);', 'push'),
        L('        dfs(n.right, depth + 1, res);', 'push'),
        L('    }'),
        L('    public List<List<Integer>> levelOrder(TreeNode root) {'),
        L('        List<List<Integer>> res = new ArrayList<>();', 'init'),
        L('        dfs(root, 0, res);', 'init'),
        L('        return res;', 'ret'),
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
      const res: number[][] = [];
      const stack: string[] = [];
      const done: number[] = [];
      const steps: Step[] = [];
      const fmtRes = () => (res.length === 0 ? '[]' : `[${res.map((lv) => `[${lv.join(',')}]`).join(', ')}]`);
      const snap = (current: number | null): TreeState => ({
        nodes: layout.nodes,
        edges: layout.edges,
        current,
        done: [...done],
        stack: stack.map((text) => ({ text })),
        stackTitle: 'Call stack',
        aggs: [{ label: 'result', value: fmtRes(), c: 'b' }],
      });
      steps.push({ tag: 'init', trace: ['No queue: a pre-order DFS carries the depth, and each value goes to res[depth].'], state: snap(null) });
      const dfs = (n: TNode | null, depth: number) => {
        if (!n || steps.length > MAX_STEPS) return;
        stack.push(`dfs(${n.val}, d=${depth})`);
        if (res.length === depth) res.push([]);
        res[depth].push(n.val);
        done.push(n.id);
        steps.push({ tag: 'commit', trace: ['Node ', A(n.val), ' at depth ', A(depth), ' → append to level ', B(depth), ': ', B(`[${res[depth].join(', ')}]`), '.'], state: snap(n.id) });
        dfs(n.left, depth + 1);
        dfs(n.right, depth + 1);
        stack.pop();
      };
      dfs(root, 0);
      steps.push({ tag: 'ret', trace: ['Every node placed: ', C(fmtRes()), '.'], state: snap(null) });
      return { steps, result: fmtRes(), resultDetail: 'values grouped level by level' };
    },
    note: 'Visiting left before right keeps each level’s values in left-to-right order even though levels are filled out of order. Same O(n) time; memory is the tree height instead of the widest level.',
    complexity: { time: 'O(n)', space: 'O(h) recursion' },
  },
};

export const treeProblems = [invertTree, maxDepth, levelOrder];
