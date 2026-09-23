// Trees, part 4 — traversals, root-to-leaf paths and shape queries.
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1, parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 340;

const snap = (root: TNode | null, extra?: Partial<TreeState>): TreeState => ({
  ...layoutTree(root),
  ...extra,
});

/* ================= Binary Tree Inorder Traversal ================= */
const inorderTraversal: ProblemDef = {
  slug: 'binary-tree-inorder-traversal',
  title: 'Binary Tree Inorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
  technique: 'Iterative: dive left pushing everything, then visit and turn right.',
  widget: 'tree',
  widgetTitle: 'Tree & explicit stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, null, 2, null, null, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> inorderTraversal(TreeNode* root) {'),
      L('        vector<int> out; stack<TreeNode*> st;'),
      L('        TreeNode* cur = root;', 'init'),
      L('        while (cur || !st.empty()) {', 'loop'),
      L('            while (cur) {', 'dive'),
      L('                st.push(cur); cur = cur->left;', 'dive'),
      L('            }'),
      L('            cur = st.top(); st.pop();', 'pop'),
      L('            out.push_back(cur->val);', 'visit'),
      L('            cur = cur->right;', 'right'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> inorderTraversal(TreeNode root) {'),
      L('        List<Integer> out = new ArrayList<>();'),
      L('        Deque<TreeNode> st = new ArrayDeque<>();'),
      L('        TreeNode cur = root;', 'init'),
      L('        while (cur != null || !st.isEmpty()) {', 'loop'),
      L('            while (cur != null) {', 'dive'),
      L('                st.push(cur); cur = cur.left;', 'dive'),
      L('            }'),
      L('            cur = st.pop();', 'pop'),
      L('            out.add(cur.val);', 'visit'),
      L('            cur = cur.right;', 'right'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const out: number[] = [];
    const stack: TNode[] = [];
    let cur: TNode | null = root;
    const visited: number[] = [];
    const view2 = (): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: [...visited],
        stack: stack.map((n) => ({ text: `node ${n.val}` })),
        stackTitle: 'stack (waiting to be visited)',
        aggs: [{ label: 'output', value: out.join(', ') || '—', c: 'c' }],
      });
    steps.push({
      tag: 'init',
      trace: ['Inorder means ', A('left, node, right'), '. Recursion hides a stack — here we hold it explicitly.'],
      state: view2(),
    });
    while (cur || stack.length) {
      while (cur) {
        stack.push(cur);
        steps.push({
          tag: 'dive',
          trace: ['Push ', A(cur.val), ' and keep diving left — its left subtree must be finished before it can be visited.'],
          state: view2(),
        });
        cur = cur.left;
        if (steps.length > MAX_STEPS) break;
      }
      if (steps.length > MAX_STEPS) break;
      cur = stack.pop()!;
      steps.push({ tag: 'pop', trace: ['No left child left — pop ', A(cur.val), '; its left subtree is done.'], state: view2() });
      out.push(cur.val);
      visited.push(cur.id);
      steps.push({ tag: 'visit', trace: ['Visit ', B(cur.val), ' — output is now ', B(out.join(', ')), '.'], state: view2() });
      cur = cur.right;
      steps.push({
        tag: 'right',
        trace: cur ? ['Turn right into ', A(cur.val), ' and repeat the dive.'] : ['No right child — pop the next node from the stack.'],
        state: view2(),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Inorder traversal: ', C(`[${out.join(', ')}]`), '.'],
      state: snap(root, { done: [...visited], aggs: [{ label: 'output', value: out.join(', '), c: 'c' }] }),
    });
    return { steps, result: `[${out.join(', ')}]` };
  },
  note: 'On a binary search tree this order comes out sorted, which is why inorder underpins BST validation, the kth-smallest query and the BST iterator. The iterative form is the usual follow-up: same O(n) time, but the stack is yours to control rather than the runtime\'s.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Recursion',
    technique: 'inorder(node) = inorder(left), visit node, inorder(right) — the call stack does the bookkeeping.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void go(TreeNode* n, vector<int>& out) {', 'enter'),
        L('        if (!n) return;', 'enter'),
        L('        go(n->left, out);', 'enter'),
        L('        out.push_back(n->val);', 'visit'),
        L('        go(n->right, out);', 'visit'),
        L('    }'),
        L('public:'),
        L('    vector<int> inorderTraversal(TreeNode* root) {'),
        L('        vector<int> out; go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void go(TreeNode n, List<Integer> out) {', 'enter'),
        L('        if (n == null) return;', 'enter'),
        L('        go(n.left, out);', 'enter'),
        L('        out.add(n.val);', 'visit'),
        L('        go(n.right, out);', 'visit'),
        L('    }'),
        L('    public List<Integer> inorderTraversal(TreeNode root) {'),
        L('        List<Integer> out = new ArrayList<>(); go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const out: number[] = [];
      const done: number[] = [];
      const calls: string[] = [];
      const steps: Step[] = [];
      const view = (cur: TNode | null) =>
        snap(root, { current: cur ? cur.id : null, done: [...done], stack: calls.map((text) => ({ text })), stackTitle: 'Call stack', aggs: [{ label: 'output', value: `[${out.join(', ')}]`, c: 'c' }] });
      steps.push({ tag: 'init', trace: ['No explicit stack: let recursion remember where to come back to.'], state: view(null) });
      const go = (n: TNode | null) => {
        if (!n || steps.length > MAX_STEPS) return;
        calls.push(`in(${n.val})`);
        steps.push({ tag: 'enter', trace: ['Enter ', A(n.val), ' — finish its left subtree first.'], state: view(n) });
        go(n.left);
        out.push(n.val);
        done.push(n.id);
        steps.push({ tag: 'visit', trace: ['Left side of ', B(n.val), ' is done — output it, then go right.'], state: view(n) });
        go(n.right);
        calls.pop();
      };
      go(root);
      steps.push({ tag: 'ret', trace: ['In-order: ', C(`[${out.join(', ')}]`), '.'], state: view(null) });
      return { steps, result: `[${out.join(', ')}]` };
    },
    note: 'The shortest correct version: O(n) time and O(h) stack, exactly like the iterative one. Interviewers often ask for the iterative form precisely because it makes that hidden stack explicit.',
    complexity: { time: 'O(n)', space: 'O(h) recursion' },
  },
};

/* ================= Binary Tree Preorder Traversal ================= */
const preorderTraversal: ProblemDef = {
  slug: 'binary-tree-preorder-traversal',
  title: 'Binary Tree Preorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
  technique: 'Visit on pop, then push right before left so left comes off first.',
  widget: 'tree',
  widgetTitle: 'Tree & explicit stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 3, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> preorderTraversal(TreeNode* root) {'),
      L('        vector<int> out;'),
      L('        if (!root) return out;'),
      L('        stack<TreeNode*> st; st.push(root);', 'init'),
      L('        while (!st.empty()) {', 'loop'),
      L('            TreeNode* n = st.top(); st.pop();', 'pop'),
      L('            out.push_back(n->val);', 'visit'),
      L('            if (n->right) st.push(n->right);', 'pushR'),
      L('            if (n->left) st.push(n->left);', 'pushL'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> preorderTraversal(TreeNode root) {'),
      L('        List<Integer> out = new ArrayList<>();'),
      L('        if (root == null) return out;'),
      L('        Deque<TreeNode> st = new ArrayDeque<>(); st.push(root);', 'init'),
      L('        while (!st.isEmpty()) {', 'loop'),
      L('            TreeNode n = st.pop();', 'pop'),
      L('            out.add(n.val);', 'visit'),
      L('            if (n.right != null) st.push(n.right);', 'pushR'),
      L('            if (n.left != null) st.push(n.left);', 'pushL'),
      L('        }'),
      L('        return out;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const out: number[] = [];
    const visited: number[] = [];
    const stack: TNode[] = [root];
    const view = (cur?: number | null): TreeState =>
      snap(root, {
        current: cur ?? null,
        done: [...visited],
        queued: stack.map((n) => n.id),
        stack: [...stack].reverse().map((n) => ({ text: `node ${n.val}` })),
        stackTitle: 'stack (top first)',
        aggs: [{ label: 'output', value: out.join(', ') || '—', c: 'c' }],
      });
    steps.push({
      tag: 'init',
      trace: ['Preorder is ', A('node, left, right'), ' — the node is emitted the moment it is reached, so no waiting is needed.'],
      state: view(),
    });
    while (stack.length) {
      const n = stack.pop()!;
      steps.push({ tag: 'pop', trace: ['Pop ', A(n.val), '.'], state: view(n.id) });
      out.push(n.val);
      visited.push(n.id);
      steps.push({ tag: 'visit', trace: ['Emit it immediately — output ', B(out.join(', ')), '.'], state: view(n.id) });
      if (n.right) {
        stack.push(n.right);
        steps.push({ tag: 'pushR', trace: ['Push the ', A('right'), ' child ', A(n.right.val), ' first, so it is served last.'], state: view(n.id) });
      }
      if (n.left) {
        stack.push(n.left);
        steps.push({ tag: 'pushL', trace: ['Push the ', B('left'), ' child ', B(n.left.val), ' second — it lands on top and is popped next.'], state: view(n.id) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Preorder traversal: ', C(`[${out.join(', ')}]`), '.'],
      state: snap(root, { done: [...visited], aggs: [{ label: 'output', value: out.join(', '), c: 'c' }] }),
    });
    return { steps, result: `[${out.join(', ')}]` };
  },
  note: 'Pushing right before left is the whole trick — a stack reverses insertion order, so the left child must go on last to come off first. Preorder is also the natural order for serialising a tree, since the parent always appears before the children it describes.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Recursion',
    technique: 'preorder(node) = visit node, preorder(left), preorder(right).',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void go(TreeNode* n, vector<int>& out) {', 'visit'),
        L('        if (!n) return;', 'visit'),
        L('        out.push_back(n->val);', 'visit'),
        L('        go(n->left, out);', 'push'),
        L('        go(n->right, out);', 'push'),
        L('    }'),
        L('public:'),
        L('    vector<int> preorderTraversal(TreeNode* root) {'),
        L('        vector<int> out; go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void go(TreeNode n, List<Integer> out) {', 'visit'),
        L('        if (n == null) return;', 'visit'),
        L('        out.add(n.val);', 'visit'),
        L('        go(n.left, out);', 'push'),
        L('        go(n.right, out);', 'push'),
        L('    }'),
        L('    public List<Integer> preorderTraversal(TreeNode root) {'),
        L('        List<Integer> out = new ArrayList<>(); go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const out: number[] = [];
      const done: number[] = [];
      const steps: Step[] = [];
      const view = (cur: TNode | null) => snap(root, { current: cur ? cur.id : null, done: [...done], aggs: [{ label: 'output', value: `[${out.join(', ')}]`, c: 'c' }] });
      steps.push({ tag: 'init', trace: ['Visit a node the moment you arrive, then recurse left and right.'], state: view(null) });
      const go = (n: TNode | null) => {
        if (!n || steps.length > MAX_STEPS) return;
        out.push(n.val);
        done.push(n.id);
        steps.push({ tag: 'visit', trace: ['Arrive at ', B(n.val), ' — output it immediately.'], state: view(n) });
        go(n.left);
        go(n.right);
      };
      go(root);
      steps.push({ tag: 'ret', trace: ['Pre-order: ', C(`[${out.join(', ')}]`), '.'], state: view(null) });
      return { steps, result: `[${out.join(', ')}]` };
    },
    note: 'Same O(n) time and O(h) space as the explicit stack; the language’s call stack stores the “come back and do the right child” reminders for you.',
    complexity: { time: 'O(n)', space: 'O(h) recursion' },
  },
};

/* ================= Binary Tree Postorder Traversal ================= */
const postorderTraversal: ProblemDef = {
  slug: 'binary-tree-postorder-traversal',
  title: 'Binary Tree Postorder Traversal',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/binary-tree-postorder-traversal/',
  technique: 'Do a node-right-left walk, then reverse it — that is postorder backwards.',
  widget: 'tree',
  widgetTitle: 'Tree & explicit stack',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 3, 4, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> postorderTraversal(TreeNode* root) {'),
      L('        vector<int> out;'),
      L('        if (!root) return out;'),
      L('        stack<TreeNode*> st; st.push(root);', 'init'),
      L('        while (!st.empty()) {', 'loop'),
      L('            TreeNode* n = st.top(); st.pop();', 'pop'),
      L('            out.push_back(n->val);       // node, right, left', 'visit'),
      L('            if (n->left) st.push(n->left);', 'pushL'),
      L('            if (n->right) st.push(n->right);', 'pushR'),
      L('        }'),
      L('        reverse(out.begin(), out.end());', 'reverse'),
      L('        return out;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> postorderTraversal(TreeNode root) {'),
      L('        LinkedList<Integer> out = new LinkedList<>();'),
      L('        if (root == null) return out;'),
      L('        Deque<TreeNode> st = new ArrayDeque<>(); st.push(root);', 'init'),
      L('        while (!st.isEmpty()) {', 'loop'),
      L('            TreeNode n = st.pop();', 'pop'),
      L('            out.addFirst(n.val);         // reverse as we go', 'visit'),
      L('            if (n.left != null) st.push(n.left);', 'pushL'),
      L('            if (n.right != null) st.push(n.right);', 'pushR'),
      L('        }'),
      L('        return out;', 'reverse'),
      L('    }', 'ret'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const rev: number[] = [];
    const visited: number[] = [];
    const stack: TNode[] = [root];
    const view = (cur?: number | null): TreeState =>
      snap(root, {
        current: cur ?? null,
        done: [...visited],
        queued: stack.map((n) => n.id),
        stack: [...stack].reverse().map((n) => ({ text: `node ${n.val}` })),
        stackTitle: 'stack (top first)',
        aggs: [{ label: 'collected (node,right,left)', value: rev.join(', ') || '—', c: 'a' }],
      });
    steps.push({
      tag: 'init',
      trace: [
        'Postorder is ', A('left, right, node'), ' — awkward directly, because a node must wait for both subtrees. But its exact ', B('reverse'),
        ' is node-right-left, which is just preorder with the children swapped.',
      ],
      state: view(),
    });
    while (stack.length) {
      const n = stack.pop()!;
      steps.push({ tag: 'pop', trace: ['Pop ', A(n.val), '.'], state: view(n.id) });
      rev.push(n.val);
      visited.push(n.id);
      steps.push({ tag: 'visit', trace: ['Collect it — building the ', A('reversed'), ' order: ', B(rev.join(', ')), '.'], state: view(n.id) });
      if (n.left) {
        stack.push(n.left);
        steps.push({ tag: 'pushL', trace: ['Push the left child ', A(n.left.val), ' first.'], state: view(n.id) });
      }
      if (n.right) {
        stack.push(n.right);
        steps.push({ tag: 'pushR', trace: ['Push the right child ', B(n.right.val), ' second so it pops first.'], state: view(n.id) });
      }
      if (steps.length > MAX_STEPS) break;
    }
    const out = [...rev].reverse();
    steps.push({
      tag: 'reverse',
      trace: ['Reverse the collected list and postorder falls out: ', B(out.join(', ')), '.'],
      state: snap(root, { done: [...visited], aggs: [{ label: 'postorder', value: out.join(', '), c: 'b' }] }),
    });
    steps.push({
      tag: 'ret',
      trace: ['Postorder traversal: ', C(`[${out.join(', ')}]`), '.'],
      state: snap(root, { done: [...visited], aggs: [{ label: 'output', value: out.join(', '), c: 'c' }] }),
    });
    return { steps, result: `[${out.join(', ')}]` };
  },
  note: 'The reversal trick avoids the usual two-stack or last-visited-pointer bookkeeping. Postorder is the order that matters whenever a node needs answers from both children first — computing height, diameter, or freeing a tree safely.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Recursion',
    technique: 'postorder(node) = postorder(left), postorder(right), then visit node.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void go(TreeNode* n, vector<int>& out) {', 'pop'),
        L('        if (!n) return;', 'pop'),
        L('        go(n->left, out);', 'push'),
        L('        go(n->right, out);', 'push'),
        L('        out.push_back(n->val);', 'rev'),
        L('    }'),
        L('public:'),
        L('    vector<int> postorderTraversal(TreeNode* root) {'),
        L('        vector<int> out; go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void go(TreeNode n, List<Integer> out) {', 'pop'),
        L('        if (n == null) return;', 'pop'),
        L('        go(n.left, out);', 'push'),
        L('        go(n.right, out);', 'push'),
        L('        out.add(n.val);', 'rev'),
        L('    }'),
        L('    public List<Integer> postorderTraversal(TreeNode root) {'),
        L('        List<Integer> out = new ArrayList<>(); go(root, out); return out;', 'init', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const out: number[] = [];
      const done: number[] = [];
      const steps: Step[] = [];
      const view = (cur: TNode | null) => snap(root, { current: cur ? cur.id : null, done: [...done], aggs: [{ label: 'output', value: `[${out.join(', ')}]`, c: 'c' }] });
      steps.push({ tag: 'init', trace: ['A node is output only after both of its subtrees are finished.'], state: view(null) });
      const go = (n: TNode | null) => {
        if (!n || steps.length > MAX_STEPS) return;
        steps.push({ tag: 'push', trace: ['At ', A(n.val), ' — finish both children first.'], state: view(n) });
        go(n.left);
        go(n.right);
        out.push(n.val);
        done.push(n.id);
        steps.push({ tag: 'rev', trace: ['Both subtrees of ', B(n.val), ' are done — output it.'], state: view(n) });
      };
      go(root);
      steps.push({ tag: 'ret', trace: ['Post-order: ', C(`[${out.join(', ')}]`), '.'], state: view(null) });
      return { steps, result: `[${out.join(', ')}]` };
    },
    note: 'Recursion makes post-order trivial, while the iterative version needs a trick (reverse a root-right-left traversal) or a “last visited” pointer. O(n) time, O(h) stack.',
    complexity: { time: 'O(n)', space: 'O(h) recursion' },
  },
};

/* ================= Zigzag Level Order Traversal ================= */
const zigzagLevelOrder: ProblemDef = {
  slug: 'binary-tree-zigzag-level-order-traversal',
  title: 'Binary Tree Zigzag Level Order Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/',
  technique: 'Ordinary BFS, but reverse every other level before storing it.',
  widget: 'tree',
  widgetTitle: 'Tree & BFS queue',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 9, 20, null, null, 15, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {'),
      L('        vector<vector<int>> res;'),
      L('        if (!root) return res;'),
      L('        queue<TreeNode*> q; q.push(root);', 'init'),
      L('        bool ltr = true;', 'init'),
      L('        while (!q.empty()) {', 'level'),
      L('            int n = q.size(); vector<int> row(n);'),
      L('            for (int i = 0; i < n; i++) {', 'node'),
      L('                TreeNode* cur = q.front(); q.pop();'),
      L('                row[ltr ? i : n - 1 - i] = cur->val;', 'place'),
      L('                if (cur->left) q.push(cur->left);', 'enqueue'),
      L('                if (cur->right) q.push(cur->right);', 'enqueue'),
      L('            }'),
      L('            res.push_back(row); ltr = !ltr;', 'flip'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {'),
      L('        List<List<Integer>> res = new ArrayList<>();'),
      L('        if (root == null) return res;'),
      L('        Queue<TreeNode> q = new LinkedList<>(); q.add(root);', 'init'),
      L('        boolean ltr = true;', 'init'),
      L('        while (!q.isEmpty()) {', 'level'),
      L('            int n = q.size();'),
      L('            Integer[] row = new Integer[n];'),
      L('            for (int i = 0; i < n; i++) {', 'node'),
      L('                TreeNode cur = q.remove();'),
      L('                row[ltr ? i : n - 1 - i] = cur.val;', 'place'),
      L('                if (cur.left != null) q.add(cur.left);', 'enqueue'),
      L('                if (cur.right != null) q.add(cur.right);', 'enqueue'),
      L('            }'),
      L('            res.add(Arrays.asList(row)); ltr = !ltr;', 'flip'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 14);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const res: number[][] = [];
    let queue: TNode[] = [root];
    let ltr = true;
    const done: number[] = [];
    const view = (cur?: number | null, row?: (number | undefined)[]): TreeState =>
      snap(root, {
        current: cur ?? null,
        done: [...done],
        queued: queue.map((n) => n.id),
        stack: queue.map((n) => ({ text: `node ${n.val}` })),
        stackTitle: 'BFS queue (front first)',
        aggs: [
          { label: 'direction', value: ltr ? 'left → right' : 'right → left', c: 'a' },
          ...(row ? [{ label: 'current row', value: row.map((v) => (v === undefined ? '·' : String(v))).join(', '), c: 'b' as const }] : []),
          { label: 'levels done', value: res.map((r) => `[${r.join(',')}]`).join(' ') || '—', c: 'c' },
        ],
      });
    steps.push({
      tag: 'init',
      trace: ['BFS already visits one full level at a time. Zigzag only changes ', A('where inside the row'), ' each node is written.'],
      state: view(),
    });
    while (queue.length) {
      const n = queue.length;
      const row: (number | undefined)[] = [...Array(n)];
      steps.push({
        tag: 'level',
        trace: ['New level with ', A(n), ' node(s), to be written ', B(ltr ? 'left → right' : 'right → left'), '.'],
        state: view(null, row),
      });
      const next: TNode[] = [];
      for (let i = 0; i < n; i++) {
        const cur = queue[i];
        row[ltr ? i : n - 1 - i] = cur.val;
        steps.push({
          tag: 'place',
          trace: ['Node ', A(cur.val), ' is the ', A(i + 1), ordinalSuffix(i + 1), ' dequeued — write it at slot ', B(ltr ? i : n - 1 - i), ' of the row.'],
          state: view(cur.id, row),
        });
        if (cur.left) next.push(cur.left);
        if (cur.right) next.push(cur.right);
        if (cur.left || cur.right) {
          steps.push({
            tag: 'enqueue',
            trace: ['Queue its child(ren) ', B([cur.left?.val, cur.right?.val].filter((v) => v !== undefined).join(', ')), ' for the next level.'],
            state: view(cur.id, row),
          });
        }
        done.push(cur.id);
        if (steps.length > MAX_STEPS) break;
      }
      res.push(row as number[]);
      queue = next;
      ltr = !ltr;
      steps.push({ tag: 'flip', trace: ['Level stored as ', B(`[${res[res.length - 1].join(', ')}]`), '. Flip the direction for the next one.'], state: view() });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Zigzag levels: ', C(res.map((r) => `[${r.join(',')}]`).join(' ')), '.'],
      state: snap(root, { done: [...done], aggs: [{ label: 'result', value: res.map((r) => `[${r.join(',')}]`).join(' '), c: 'c' }] }),
    });
    return { steps, result: res.map((r) => `[${r.join(',')}]`).join(', ') };
  },
  note: 'Writing straight into the correct slot beats reversing the row afterwards — same complexity, but it makes clear that the traversal itself never changes, only the indexing. Reversing the queue instead is the classic wrong turn: it corrupts the parent order for the level below.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'DFS, then reverse odd levels',
    technique: 'Collect every level left to right with a depth-indexed DFS, then reverse every second level at the end.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void dfs(TreeNode* n, int d, vector<vector<int>>& res) {', 'pop'),
        L('        if (!n) return;', 'pop'),
        L('        if (res.size() == d) res.push_back({});', 'level'),
        L('        res[d].push_back(n->val);', 'pop'),
        L('        dfs(n->left, d + 1, res); dfs(n->right, d + 1, res);', 'push'),
        L('    }'),
        L('public:'),
        L('    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {'),
        L('        vector<vector<int>> res; dfs(root, 0, res);', 'init'),
        L('        for (int d = 1; d < res.size(); d += 2) reverse(res[d].begin(), res[d].end());', 'flip'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void dfs(TreeNode n, int d, List<List<Integer>> res) {', 'pop'),
        L('        if (n == null) return;', 'pop'),
        L('        if (res.size() == d) res.add(new ArrayList<>());', 'level'),
        L('        res.get(d).add(n.val);', 'pop'),
        L('        dfs(n.left, d + 1, res); dfs(n.right, d + 1, res);', 'push'),
        L('    }'),
        L('    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {'),
        L('        List<List<Integer>> res = new ArrayList<>(); dfs(root, 0, res);', 'init'),
        L('        for (int d = 1; d < res.size(); d += 2) Collections.reverse(res.get(d));', 'flip'),
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
      const res: number[][] = [];
      const done: number[] = [];
      const steps: Step[] = [];
      const fmt = () => res.map((r) => `[${r.join(',')}]`).join(', ') || '—';
      const view = (cur: TNode | null) => snap(root, { current: cur ? cur.id : null, done: [...done], aggs: [{ label: 'levels', value: fmt(), c: 'b' }] });
      steps.push({ tag: 'init', trace: ['First gather every level left to right with DFS; fix the zigzag afterwards.'], state: view(null) });
      const dfs = (n: TNode | null, d: number) => {
        if (!n || steps.length > MAX_STEPS) return;
        if (res.length === d) res.push([]);
        res[d].push(n.val);
        done.push(n.id);
        steps.push({ tag: 'pop', trace: ['Depth ', A(d), ': append ', B(n.val), '.'], state: view(n) });
        dfs(n.left, d + 1);
        dfs(n.right, d + 1);
      };
      dfs(root, 0);
      for (let d = 1; d < res.length; d += 2) {
        res[d].reverse();
        steps.push({ tag: 'flip', trace: ['Level ', A(d), ' runs right to left — reverse it: ', B(`[${res[d].join(', ')}]`), '.'], state: view(null) });
      }
      steps.push({ tag: 'ret', trace: ['Zigzag order: ', C(fmt()), '.'], state: view(null) });
      return { steps, result: res.map((r) => `[${r.join(',')}]`).join(', ') };
    },
    note: 'Same O(n) work: the direction is applied in a clean-up pass instead of while the level is being built. Building each row in the right direction during BFS avoids the extra reversal.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

const ordinalSuffix = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

/* ================= Symmetric Tree ================= */
const symmetricTree: ProblemDef = {
  slug: 'symmetric-tree',
  title: 'Symmetric Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/symmetric-tree/',
  technique: 'Walk two pointers down in mirror image — left-vs-right and right-vs-left.',
  widget: 'tree',
  widgetTitle: 'Tree & mirror comparison',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 2, 3, 4, 4, 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isSymmetric(TreeNode* root) {'),
      L('        return !root || mirror(root->left, root->right);', 'start'),
      L('    }'),
      L('    bool mirror(TreeNode* a, TreeNode* b) {', 'enter'),
      L('        if (!a && !b) return true;', 'bothNull'),
      L('        if (!a || !b || a->val != b->val) return false;', 'mismatch'),
      L('        return mirror(a->left, b->right)', 'recurse'),
      L('            && mirror(a->right, b->left);', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isSymmetric(TreeNode root) {'),
      L('        return root == null || mirror(root.left, root.right);', 'start'),
      L('    }'),
      L('    boolean mirror(TreeNode a, TreeNode b) {', 'enter'),
      L('        if (a == null && b == null) return true;', 'bothNull'),
      L('        if (a == null || b == null || a.val != b.val)', 'mismatch'),
      L('            return false;', 'mismatch'),
      L('        return mirror(a.left, b.right)', 'recurse'),
      L('            && mirror(a.right, b.left);', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 15);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const ok: number[] = [];
    const view = (a: TNode | null, b: TNode | null, depth: number): TreeState =>
      snap(root, {
        current: a ? a.id : null,
        done: [...ok],
        queued: b ? [b.id] : [],
        stack: [{ text: `mirror(${a ? a.val : 'null'}, ${b ? b.val : 'null'})  depth ${depth}` }],
        stackTitle: 'comparing this pair',
      });
    steps.push({
      tag: 'start',
      trace: ['Symmetry is about the ', A('two subtrees of the root'), ' being mirror images — so compare them as a pair, not each against itself.'],
      state: view(root.left, root.right, 1),
    });
    let symmetric = true;
    const mirror = (a: TNode | null, b: TNode | null, depth: number): boolean => {
      if (steps.length > MAX_STEPS) return true;
      steps.push({
        tag: 'enter',
        trace: ['Compare ', A(a ? a.val : 'null'), ' with ', B(b ? b.val : 'null'), ' at depth ', A(depth), '.'],
        state: view(a, b, depth),
      });
      if (!a && !b) {
        steps.push({ tag: 'bothNull', trace: ['Both are empty — that side matches trivially.'], state: view(a, b, depth) });
        return true;
      }
      if (!a || !b || a.val !== b.val) {
        steps.push({
          tag: 'mismatch',
          trace: [!a || !b ? 'One side has a node where the other has a gap' : ['Values differ (', F(a.val), ' vs ', F(b.val), ')'].join(''), ' — the tree is ', F('not'), ' symmetric.'],
          state: view(a, b, depth),
        });
        return false;
      }
      if (a) ok.push(a.id);
      if (b) ok.push(b.id);
      steps.push({
        tag: 'recurse',
        trace: [
          'Both read ', B(a.val), '. Now the mirror rule: compare ', A('a.left'), ' with ', A('b.right'), ', and ', A('a.right'), ' with ', A('b.left'), '.',
        ],
        state: view(a, b, depth),
      });
      return mirror(a.left, b.right, depth + 1) && mirror(a.right, b.left, depth + 1);
    };
    symmetric = mirror(root.left, root.right, 1);
    steps.push({
      tag: symmetric ? 'bothNull' : 'mismatch',
      trace: symmetric ? ['Every mirrored pair agreed — the tree is ', C('symmetric'), '.'] : ['A mirrored pair disagreed — the tree is ', C('not symmetric'), '.'],
      state: snap(root, { done: symmetric ? [...ok, root.id] : [] }),
    });
    return { steps, result: symmetric ? 'true' : 'false' };
  },
  note: 'Comparing a node against itself gets you nowhere — symmetry is a property of pairs, which is why the helper takes two nodes. The crossed recursion (a.left with b.right) is the whole algorithm; recursing straight down instead tests whether the two subtrees are identical, which is a different question.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Queue of mirror pairs',
    technique: 'Compare nodes in mirrored pairs with a queue: (left.left, right.right) and (left.right, right.left).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isSymmetric(TreeNode* root) {'),
        L('        queue<pair<TreeNode*, TreeNode*>> q; q.push({root->left, root->right});', 'init'),
        L('        while (!q.empty()) {', 'pair'),
        L('            auto [a, b] = q.front(); q.pop();', 'pair'),
        L('            if (!a && !b) continue;', 'pair'),
        L('            if (!a || !b || a->val != b->val) return false;', 'bad'),
        L('            q.push({a->left, b->right}); q.push({a->right, b->left});', 'pair'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isSymmetric(TreeNode root) {'),
        L('        Deque<TreeNode[]> q = new ArrayDeque<>(); q.add(new TreeNode[]{root.left, root.right});', 'init'),
        L('        while (!q.isEmpty()) {', 'pair'),
        L('            TreeNode[] p = q.poll(); TreeNode a = p[0], b = p[1];', 'pair'),
        L('            if (a == null && b == null) continue;', 'pair'),
        L('            if (a == null || b == null || a.val != b.val) return false;', 'bad'),
        L('            q.add(new TreeNode[]{a.left, b.right}); q.add(new TreeNode[]{a.right, b.left});', 'pair'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const ok: number[] = [];
      const steps: Step[] = [];
      const view = (a: TNode | null, b: TNode | null) => snap(root, { done: [...ok], queued: [a, b].filter((x): x is TNode => !!x).map((x) => x.id) });
      steps.push({ tag: 'init', trace: ['Queue the root’s two children as the first mirror pair.'], state: view(root.left, root.right) });
      const q: [TNode | null, TNode | null][] = [[root.left, root.right]];
      let symmetric = true;
      while (q.length) {
        const [a, b] = q.shift()!;
        if (!a && !b) continue;
        if (!a || !b || a.val !== b.val) {
          symmetric = false;
          steps.push({ tag: 'bad', trace: ['Mirror pair (', F(a ? a.val : 'null'), ', ', F(b ? b.val : 'null'), ') does not match — ', C('false'), '.'], state: view(a, b) });
          break;
        }
        ok.push(a.id, b.id);
        steps.push({ tag: 'pair', trace: ['Pair (', B(a.val), ', ', B(b.val), ') matches — enqueue the outer pair and the inner pair.'], state: view(a, b) });
        q.push([a.left, b.right], [a.right, b.left]);
      }
      if (symmetric) steps.push({ tag: 'ret', trace: ['Every mirror pair matched — ', C('symmetric'), '.'], state: view(null, null) });
      return { steps, result: symmetric ? 'true' : 'false' };
    },
    note: 'Same O(n) comparisons as the recursive mirror check, level by level. The queue holds at most a level’s worth of pairs, avoiding deep recursion on tall trees.',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================= Path Sum ================= */
const pathSum: ProblemDef = {
  slug: 'path-sum',
  title: 'Path Sum',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/path-sum/',
  technique: 'Subtract each node from the target on the way down; a leaf hitting exactly zero wins.',
  widget: 'tree',
  widgetTitle: 'Tree & remaining target',
  inputs: [
    { key: 'tree', label: 'Level-order (null = gap)', defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2', wide: true },
    { key: 'target', label: 'Target sum', defaultValue: '22' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool hasPathSum(TreeNode* root, int target) {', 'enter'),
      L('        if (!root) return false;', 'null'),
      L('        target -= root->val;', 'subtract'),
      L('        if (!root->left && !root->right)', 'leaf'),
      L('            return target == 0;', 'leaf'),
      L('        return hasPathSum(root->left, target)', 'recurse'),
      L('            || hasPathSum(root->right, target);', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean hasPathSum(TreeNode root, int target) {', 'enter'),
      L('        if (root == null) return false;', 'null'),
      L('        target -= root.val;', 'subtract'),
      L('        if (root.left == null && root.right == null)', 'leaf'),
      L('            return target == 0;', 'leaf'),
      L('        return hasPathSum(root.left, target)', 'recurse'),
      L('            || hasPathSum(root.right, target);', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 14);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const target = parseInt1(values.target, 'Target sum');
    if (typeof target === 'string') return { error: target };
    const steps: Step[] = [];
    const path: TNode[] = [];
    const won: { path: TNode[] | null } = { path: null };
    const view = (cur: TNode | null, remaining: number): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: path.map((n) => n.id),
        stack: path.map((n) => ({ text: `${n.val}` })),
        stackTitle: 'path from the root',
        aggs: [{ label: 'remaining', value: String(remaining), c: remaining === 0 ? 'b' : 'a' }],
      });
    steps.push({
      tag: 'enter',
      trace: ['Rather than summing at the leaf, ', A('subtract'), ' each value on the way down. Then a leaf just needs the remainder to be exactly ', B(0), '.'],
      state: view(root, target),
    });
    const walk = (n: TNode | null, remaining: number): boolean => {
      if (steps.length > MAX_STEPS) return false;
      if (!n) {
        steps.push({ tag: 'null', trace: ['Empty branch — nothing here.'], state: view(null, remaining) });
        return false;
      }
      path.push(n);
      const rem = remaining - n.val;
      steps.push({
        tag: 'subtract',
        trace: ['At node ', A(n.val), ': ', A(remaining), ' − ', A(n.val), ' = ', B(rem), ' still needed below.'],
        state: view(n, rem),
      });
      if (!n.left && !n.right) {
        const hit = rem === 0;
        steps.push({
          tag: 'leaf',
          trace: hit
            ? [B(n.val), ' is a leaf and the remainder is exactly ', B(0), ' — the path ', C(path.map((p) => p.val).join(' → ')), ' works.']
            : [F(n.val), ' is a leaf but ', F(rem), ' is left over — this path fails.'],
          state: view(n, rem),
        });
        if (hit) won.path = [...path];
        path.pop();
        return hit;
      }
      steps.push({ tag: 'recurse', trace: ['Not a leaf — try both children with ', A(rem), ' remaining.'], state: view(n, rem) });
      const found = walk(n.left, rem) || walk(n.right, rem);
      path.pop();
      return found;
    };
    const found = walk(root, target);
    steps.push({
      tag: found ? 'leaf' : 'null',
      trace: found
        ? ['A root-to-leaf path sums to ', C(target), ': ', C((won.path ?? []).map((n) => n.val).join(' → ')), '.']
        : ['No root-to-leaf path sums to ', C(target), '.'],
      state: snap(root, { done: won.path ? won.path.map((n) => n.id) : [] }),
    });
    return { steps, result: found ? 'true' : 'false', resultDetail: won.path ? won.path.map((n) => n.val).join(' → ') : undefined };
  },
  note: 'The leaf test must be "no left and no right" — checking only one side makes a node with a single child look like a leaf, which is the most common wrong answer here. Short-circuit || means the right subtree is skipped entirely once the left one succeeds.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'BFS with running sums',
    technique: 'Walk the tree with a queue of (node, sum so far) pairs and check the sum whenever a leaf is dequeued.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool hasPathSum(TreeNode* root, int target) {'),
        L('        if (!root) return false;', 'init'),
        L('        queue<pair<TreeNode*, int>> q; q.push({root, root->val});', 'init'),
        L('        while (!q.empty()) {', 'step'),
        L('            auto [n, s] = q.front(); q.pop();', 'step'),
        L('            if (!n->left && !n->right && s == target) return true;', 'hit'),
        L('            if (n->left) q.push({n->left, s + n->left->val});', 'step'),
        L('            if (n->right) q.push({n->right, s + n->right->val});', 'step'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean hasPathSum(TreeNode root, int target) {'),
        L('        if (root == null) return false;', 'init'),
        L('        Deque<Object[]> q = new ArrayDeque<>(); q.add(new Object[]{root, root.val});', 'init'),
        L('        while (!q.isEmpty()) {', 'step'),
        L('            Object[] p = q.poll(); TreeNode n = (TreeNode) p[0]; int s = (int) p[1];', 'step'),
        L('            if (n.left == null && n.right == null && s == target) return true;', 'hit'),
        L('            if (n.left != null) q.add(new Object[]{n.left, s + n.left.val});', 'step'),
        L('            if (n.right != null) q.add(new Object[]{n.right, s + n.right.val});', 'step'),
        L('        }'),
        L('        return false;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const target = parseInt1(values.target, 'Target sum');
      if (typeof target === 'string') return { error: target };
      const badges = new Map<number, string>();
      const done: number[] = [];
      const steps: Step[] = [];
      const layout = layoutTree(root);
      const view = (cur: TNode | null): TreeState => ({
        nodes: layout.nodes.map((n) => ({ ...n, badge: badges.get(n.id) })),
        edges: layout.edges,
        current: cur ? cur.id : null,
        done: [...done],
        aggs: [{ label: 'target', value: String(target), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['BFS carrying each node’s root-to-here sum (shown as badges).'], state: view(null) });
      const q: [TNode, number][] = [[root, root.val]];
      badges.set(root.id, `Σ${root.val}`);
      let found = false;
      while (q.length) {
        const [n, s] = q.shift()!;
        done.push(n.id);
        if (!n.left && !n.right) {
          if (s === target) {
            found = true;
            steps.push({ tag: 'hit', trace: ['Leaf ', B(n.val), ' has path sum ', C(s), ' = target — ', C('true'), '.'], state: view(n) });
            break;
          }
          steps.push({ tag: 'step', trace: ['Leaf ', A(n.val), ' has path sum ', F(s), ' ≠ ', A(target), '.'], state: view(n) });
          continue;
        }
        for (const c of [n.left, n.right]) if (c) {
          badges.set(c.id, `Σ${s + c.val}`);
          q.push([c, s + c.val]);
        }
        steps.push({ tag: 'step', trace: ['Dequeue ', A(n.val), ' (sum ', A(s), ') and pass the running sum to its children.'], state: view(n) });
      }
      if (!found) steps.push({ tag: 'ret', trace: ['No leaf matched — ', C('false'), '.'], state: view(null) });
      return { steps, result: found ? 'true' : 'false' };
    },
    note: 'Same O(n) work as the recursive DFS; each queue entry carries its own sum so no backtracking is needed. BFS finds the shallowest matching leaf first.',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================= Path Sum II ================= */
const pathSumII: ProblemDef = {
  slug: 'path-sum-ii',
  title: 'Path Sum II',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/path-sum-ii/',
  technique: 'Backtracking DFS: push the node, recurse, pop it again on the way out.',
  widget: 'tree',
  widgetTitle: 'Tree & current path',
  inputs: [
    { key: 'tree', label: 'Level-order (null = gap)', defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1', wide: true },
    { key: 'target', label: 'Target sum', defaultValue: '22' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<vector<int>> res; vector<int> path;'),
      L('public:'),
      L('    vector<vector<int>> pathSum(TreeNode* root, int target) {'),
      L('        dfs(root, target); return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode* n, int rem) {', 'enter'),
      L('        if (!n) return;', 'enter'),
      L('        path.push_back(n->val); rem -= n->val;', 'push'),
      L('        if (!n->left && !n->right && rem == 0)', 'hit'),
      L('            res.push_back(path);', 'hit'),
      L('        dfs(n->left, rem);', 'recurse'),
      L('        dfs(n->right, rem);', 'recurse'),
      L('        path.pop_back();            // backtrack', 'pop'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<List<Integer>> res = new ArrayList<>();'),
      L('    List<Integer> path = new ArrayList<>();'),
      L('    public List<List<Integer>> pathSum(TreeNode root, int target) {'),
      L('        dfs(root, target); return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode n, int rem) {', 'enter'),
      L('        if (n == null) return;', 'enter'),
      L('        path.add(n.val); rem -= n.val;', 'push'),
      L('        if (n.left == null && n.right == null && rem == 0)', 'hit'),
      L('            res.add(new ArrayList<>(path));', 'hit'),
      L('        dfs(n.left, rem);', 'recurse'),
      L('        dfs(n.right, rem);', 'recurse'),
      L('        path.remove(path.size() - 1);   // backtrack', 'pop'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 15);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const target = parseInt1(values.target, 'Target sum');
    if (typeof target === 'string') return { error: target };
    const steps: Step[] = [];
    const path: TNode[] = [];
    const res: number[][] = [];
    const view = (cur: TNode | null, rem: number): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: path.map((n) => n.id),
        stack: path.map((n) => ({ text: `${n.val}` })),
        stackTitle: 'current path',
        aggs: [
          { label: 'remaining', value: String(rem), c: 'a' },
          { label: 'paths found', value: res.map((p) => `[${p.join(',')}]`).join(' ') || '—', c: 'c' },
        ],
      });
    steps.push({
      tag: 'enter',
      trace: ['One shared path array is reused for every branch — that is only safe because every push is undone by a matching ', A('pop'), ' on the way back up.'],
      state: view(root, target),
    });
    const dfs = (n: TNode | null, rem: number) => {
      if (!n || steps.length > MAX_STEPS) return;
      path.push(n);
      const r = rem - n.val;
      steps.push({ tag: 'push', trace: ['Extend the path with ', A(n.val), ' — ', B(r), ' still needed.'], state: view(n, r) });
      if (!n.left && !n.right) {
        if (r === 0) {
          res.push(path.map((p) => p.val));
          steps.push({
            tag: 'hit',
            trace: ['Leaf reached with remainder ', B(0), ' — record a ', C('copy'), ' of the path: [', C(path.map((p) => p.val).join(', ')), '].'],
            state: view(n, r),
          });
        } else {
          steps.push({ tag: 'hit', trace: ['Leaf reached but ', F(r), ' is left over — discard this path.'], state: view(n, r) });
        }
      } else {
        steps.push({ tag: 'recurse', trace: ['Recurse into both children with ', A(r), ' remaining.'], state: view(n, r) });
        dfs(n.left, r);
        dfs(n.right, r);
      }
      path.pop();
      steps.push({
        tag: 'pop',
        trace: ['Backtrack: remove ', F(n.val), ' so a sibling branch starts from a clean path.'],
        state: view(null, rem),
      });
    };
    dfs(root, target);
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Paths summing to ', C(target), ': ', C(res.map((p) => `[${p.join(',')}]`).join(' ')), '.'] : ['No root-to-leaf path sums to ', C(target), '.'],
      state: snap(root, { aggs: [{ label: 'result', value: res.map((p) => `[${p.join(',')}]`).join(' ') || 'none', c: 'c' }] }),
    });
    return { steps, result: res.length ? res.map((p) => `[${p.join(',')}]`).join(', ') : 'none' };
  },
  note: 'Storing a copy of the path on a hit is essential — the live array keeps mutating as the search continues, so pushing the reference would leave every recorded answer pointing at the same, eventually empty, list. That single missing copy is the classic bug in every backtracking problem.',
  complexity: { time: 'O(n·h) worst case', space: 'O(h)' },
  brute: {
    label: 'BFS carrying whole paths',
    technique: 'Queue each node together with a full copy of its root-to-node path; record the path when a leaf hits the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> pathSum(TreeNode* root, int target) {'),
        L('        vector<vector<int>> res; if (!root) return res;', 'init'),
        L('        queue<tuple<TreeNode*, int, vector<int>>> q; q.push({root, root->val, {root->val}});', 'init'),
        L('        while (!q.empty()) {', 'go'),
        L('            auto [n, s, path] = q.front(); q.pop();', 'go'),
        L('            if (!n->left && !n->right) { if (s == target) res.push_back(path); continue; }', 'hit'),
        L('            for (TreeNode* c : {n->left, n->right}) if (c) {', 'go'),
        L('                auto p = path; p.push_back(c->val);  // copy the whole path', 'go'),
        L('                q.push({c, s + c->val, p});', 'go'),
        L('            }'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<List<Integer>> pathSum(TreeNode root, int target) {'),
        L('        List<List<Integer>> res = new ArrayList<>(); if (root == null) return res;', 'init'),
        L('        Deque<Object[]> q = new ArrayDeque<>(); q.add(new Object[]{root, root.val, new ArrayList<>(List.of(root.val))});', 'init'),
        L('        while (!q.isEmpty()) {', 'go'),
        L('            Object[] e = q.poll(); TreeNode n = (TreeNode) e[0]; int s = (int) e[1]; List<Integer> path = (List<Integer>) e[2];', 'go'),
        L('            if (n.left == null && n.right == null) { if (s == target) res.add(path); continue; }', 'hit'),
        L('            for (TreeNode c : new TreeNode[]{n.left, n.right}) if (c != null) {', 'go'),
        L('                List<Integer> p = new ArrayList<>(path); p.add(c.val);  // copy the whole path', 'go'),
        L('                q.add(new Object[]{c, s + c.val, p});', 'go'),
        L('            }'),
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
      const target = parseInt1(values.target, 'Target sum');
      if (typeof target === 'string') return { error: target };
      const res: number[][] = [];
      let copied = 0;
      const steps: Step[] = [];
      const view = (path: TNode[]) =>
        snap(root, { done: path.map((n) => n.id), current: path.length ? path[path.length - 1].id : null, aggs: [{ label: 'values copied into paths', value: String(copied), c: 'a' }, { label: 'found', value: res.map((p) => `[${p.join(',')}]`).join(' ') || '—', c: 'c' }] });
      steps.push({ tag: 'init', trace: ['BFS where every queue entry owns a full copy of its path — no backtracking.'], state: view([]) });
      const q: [TNode, number, TNode[]][] = [[root, root.val, [root]]];
      while (q.length && steps.length < MAX_STEPS) {
        const [n, s, path] = q.shift()!;
        if (!n.left && !n.right) {
          if (s === target) res.push(path.map((p) => p.val));
          steps.push({ tag: 'hit', trace: ['Leaf ', A(n.val), ': path ', A(path.map((p) => p.val).join('→')), ' sums to ', s === target ? B(s) : F(s), s === target ? ' — keep it.' : '.'], state: view(path) });
          continue;
        }
        for (const c of [n.left, n.right]) if (c) {
          copied += path.length + 1;
          q.push([c, s + c.val, [...path, c]]);
        }
        steps.push({ tag: 'go', trace: ['Dequeue ', A(n.val), ' — hand each child its own copy of the path.'], state: view(path) });
      }
      steps.push({ tag: 'ret', trace: [C(res.length), ' path(s) found; ', A(copied), ' values were copied along the way.'], state: view([]) });
      return { steps, result: res.length ? res.map((p) => `[${p.join(',')}]`).join(', ') : 'none' };
    },
    note: 'Correct, but every queue entry holds its own copy of the path, costing O(n · h) memory. Backtracking DFS shares one path list, pushing on the way down and popping on the way up.',
    complexity: { time: 'O(n · h)', space: 'O(n · h)' },
  },
};

/* ================= Binary Tree Paths ================= */
const binaryTreePaths: ProblemDef = {
  slug: 'binary-tree-paths',
  title: 'Binary Tree Paths',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/binary-tree-paths/',
  technique: 'DFS carrying the path so far; emit it whenever a leaf is reached.',
  widget: 'tree',
  widgetTitle: 'Tree & current path',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 3, null, 5', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<string> res;'),
      L('public:'),
      L('    vector<string> binaryTreePaths(TreeNode* root) {'),
      L('        if (root) dfs(root, "");', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode* n, string path) {', 'enter'),
      L('        path += to_string(n->val);', 'append'),
      L('        if (!n->left && !n->right) { res.push_back(path); return; }', 'leaf'),
      L('        if (n->left) dfs(n->left, path + "->");', 'recurse'),
      L('        if (n->right) dfs(n->right, path + "->");', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<String> res = new ArrayList<>();'),
      L('    public List<String> binaryTreePaths(TreeNode root) {'),
      L('        if (root != null) dfs(root, "");', 'start'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode n, String path) {', 'enter'),
      L('        path += n.val;', 'append'),
      L('        if (n.left == null && n.right == null) {', 'leaf'),
      L('            res.add(path); return;', 'leaf'),
      L('        }'),
      L('        if (n.left != null) dfs(n.left, path + "->");', 'recurse'),
      L('        if (n.right != null) dfs(n.right, path + "->");', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const res: string[] = [];
    const chain: TNode[] = [];
    const view = (cur: TNode | null): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: chain.map((n) => n.id),
        stack: chain.map((n) => ({ text: `${n.val}` })),
        stackTitle: 'path so far',
        aggs: [{ label: 'paths', value: res.join('   ') || '—', c: 'c' }],
      });
    steps.push({
      tag: 'start',
      trace: ['Each recursive call carries its own ', A('copy'), ' of the path string, so no explicit backtracking is needed — the copy simply goes out of scope.'],
      state: view(root),
    });
    const dfs = (n: TNode) => {
      if (steps.length > MAX_STEPS) return;
      chain.push(n);
      steps.push({ tag: 'append', trace: ['Append ', A(n.val), ' — path is now "', B(chain.map((c) => c.val).join('->')), '".'], state: view(n) });
      if (!n.left && !n.right) {
        res.push(chain.map((c) => c.val).join('->'));
        steps.push({ tag: 'leaf', trace: [B(n.val), ' is a leaf — the path is complete: "', C(res[res.length - 1]), '".'], state: view(n) });
        chain.pop();
        return;
      }
      steps.push({ tag: 'recurse', trace: ['Not a leaf — carry the path down into each existing child.'], state: view(n) });
      if (n.left) dfs(n.left);
      if (n.right) dfs(n.right);
      chain.pop();
    };
    dfs(root);
    steps.push({
      tag: 'ret',
      trace: ['All ', C(res.length), ' root-to-leaf path(s): ', C(res.join(', ')), '.'],
      state: snap(root, { aggs: [{ label: 'paths', value: res.join('   '), c: 'c' }] }),
    });
    return { steps, result: res.join(', ') };
  },
  note: 'Passing the path by value trades a little memory for much simpler code — there is no undo step to forget. Guarding each recursive call with a null check matters: recursing into a missing child would emit a phantom path ending at the present sibling.',
  complexity: { time: 'O(n·h)', space: 'O(h)' },
  brute: {
    label: 'BFS with path strings',
    technique: 'Queue each node with the string of its path so far; when a leaf is dequeued, its string is a finished path.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<string> binaryTreePaths(TreeNode* root) {'),
        L('        vector<string> res;', 'init'),
        L('        queue<pair<TreeNode*, string>> q; q.push({root, to_string(root->val)});', 'init'),
        L('        while (!q.empty()) {', 'go'),
        L('            auto [n, s] = q.front(); q.pop();', 'go'),
        L('            if (!n->left && !n->right) { res.push_back(s); continue; }', 'leaf'),
        L('            if (n->left) q.push({n->left, s + "->" + to_string(n->left->val)});', 'go'),
        L('            if (n->right) q.push({n->right, s + "->" + to_string(n->right->val)});', 'go'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<String> binaryTreePaths(TreeNode root) {'),
        L('        List<String> res = new ArrayList<>();', 'init'),
        L('        Deque<Object[]> q = new ArrayDeque<>(); q.add(new Object[]{root, String.valueOf(root.val)});', 'init'),
        L('        while (!q.isEmpty()) {', 'go'),
        L('            Object[] e = q.poll(); TreeNode n = (TreeNode) e[0]; String s = (String) e[1];', 'go'),
        L('            if (n.left == null && n.right == null) { res.add(s); continue; }', 'leaf'),
        L('            if (n.left != null) q.add(new Object[]{n.left, s + "->" + n.left.val});', 'go'),
        L('            if (n.right != null) q.add(new Object[]{n.right, s + "->" + n.right.val});', 'go'),
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
      const res: string[] = [];
      const done: number[] = [];
      const steps: Step[] = [];
      const view = (cur: TNode | null) => snap(root, { current: cur ? cur.id : null, done: [...done], aggs: [{ label: 'paths', value: res.join('  ') || '—', c: 'c' }] });
      steps.push({ tag: 'init', trace: ['BFS where each entry carries the path string built so far.'], state: view(null) });
      const q: [TNode, string][] = [[root, String(root.val)]];
      while (q.length && steps.length < MAX_STEPS) {
        const [n, s] = q.shift()!;
        done.push(n.id);
        if (!n.left && !n.right) {
          res.push(s);
          steps.push({ tag: 'leaf', trace: ['Leaf ', B(n.val), ' — path "', C(s), '" is complete.'], state: view(n) });
          continue;
        }
        for (const c of [n.left, n.right]) if (c) q.push([c, `${s}->${c.val}`]);
        steps.push({ tag: 'go', trace: ['Dequeue ', A(n.val), ' (', A(s), ') — extend the string for each child.'], state: view(n) });
      }
      steps.push({ tag: 'ret', trace: ['All root-to-leaf paths: ', C(res.join(', ')), '.'], state: view(null) });
      return { steps, result: res.join(', ') };
    },
    note: 'Each queue entry builds its own string, so memory is O(n · h) and paths come out shortest-first rather than left-to-right. DFS with a shared path list outputs them in left-to-right order with O(h) extra space.',
    complexity: { time: 'O(n · h)', space: 'O(n · h)' },
  },
};

/* ================= Sum Root to Leaf Numbers ================= */
const sumRootToLeaf: ProblemDef = {
  slug: 'sum-root-to-leaf-numbers',
  title: 'Sum Root to Leaf Numbers',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/sum-root-to-leaf-numbers/',
  technique: 'Carry the number built so far: cur = cur·10 + node, and add it up at each leaf.',
  widget: 'tree',
  widgetTitle: 'Tree & number being built',
  inputs: [{ key: 'tree', label: 'Level-order (digits 0–9)', defaultValue: '4, 9, 0, 5, 1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int sumNumbers(TreeNode* root) {'),
      L('        return dfs(root, 0);', 'start', 'ret'),
      L('    }'),
      L('    int dfs(TreeNode* n, int cur) {', 'enter'),
      L('        if (!n) return 0;', 'enter'),
      L('        cur = cur * 10 + n->val;', 'build'),
      L('        if (!n->left && !n->right) return cur;', 'leaf'),
      L('        return dfs(n->left, cur) + dfs(n->right, cur);', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int sumNumbers(TreeNode root) {'),
      L('        return dfs(root, 0);', 'start', 'ret'),
      L('    }'),
      L('    int dfs(TreeNode n, int cur) {', 'enter'),
      L('        if (n == null) return 0;', 'enter'),
      L('        cur = cur * 10 + n.val;', 'build'),
      L('        if (n.left == null && n.right == null) return cur;', 'leaf'),
      L('        return dfs(n.left, cur) + dfs(n.right, cur);', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    if (levels.some((v) => v !== null && (v < 0 || v > 9))) return { error: 'Every node must be a single digit 0–9.' };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const chain: TNode[] = [];
    const leaves: string[] = [];
    let total = 0;
    const view = (cur: TNode | null, num: number): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: chain.map((n) => n.id),
        stack: chain.map((n) => ({ text: `${n.val}` })),
        stackTitle: 'path from the root',
        aggs: [
          { label: 'number so far', value: String(num), c: 'a' },
          { label: 'leaf numbers', value: leaves.join(' + ') || '—', c: 'b' },
          { label: 'total', value: String(total), c: 'c' },
        ],
      });
    steps.push({
      tag: 'start',
      trace: ['Each root-to-leaf path spells a number. Build it digit by digit going down: ', A('cur × 10 + node'), '.'],
      state: view(root, 0),
    });
    const dfs = (n: TNode | null, cur: number): number => {
      if (!n || steps.length > MAX_STEPS) return 0;
      chain.push(n);
      const num = cur * 10 + n.val;
      steps.push({
        tag: 'build',
        trace: ['At ', A(n.val), ': ', A(cur), ' × 10 + ', A(n.val), ' = ', B(num), '.'],
        state: view(n, num),
      });
      if (!n.left && !n.right) {
        leaves.push(String(num));
        total += num;
        steps.push({ tag: 'leaf', trace: ['Leaf — the path spells ', C(num), '. Running total ', C(total), '.'], state: view(n, num) });
        chain.pop();
        return num;
      }
      steps.push({ tag: 'recurse', trace: ['Carry ', A(num), ' into both children.'], state: view(n, num) });
      const s = dfs(n.left, num) + dfs(n.right, num);
      chain.pop();
      return s;
    };
    dfs(root, 0);
    steps.push({
      tag: 'ret',
      trace: ['Sum of all root-to-leaf numbers: ', C(leaves.join(' + ')), ' = ', C(total), '.'],
      state: snap(root, { aggs: [{ label: 'total', value: String(total), c: 'c' }] }),
    });
    return { steps, result: String(total), resultDetail: leaves.join(' + ') };
  },
  note: 'Passing the partial number down as a parameter means no string building and no reversing at the end — the ×10 shift does the place-value work for free. Because cur is a value parameter, sibling branches never see each other\'s digits.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'BFS with running numbers',
    technique: 'Queue each node with the number formed so far (prefix × 10 + digit) and add it to the total at each leaf.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int sumNumbers(TreeNode* root) {'),
        L('        int total = 0;', 'init'),
        L('        queue<pair<TreeNode*, int>> q; q.push({root, root->val});', 'init'),
        L('        while (!q.empty()) {', 'go'),
        L('            auto [n, num] = q.front(); q.pop();', 'go'),
        L('            if (!n->left && !n->right) { total += num; continue; }', 'leaf'),
        L('            if (n->left) q.push({n->left, num * 10 + n->left->val});', 'go'),
        L('            if (n->right) q.push({n->right, num * 10 + n->right->val});', 'go'),
        L('        }'),
        L('        return total;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int sumNumbers(TreeNode root) {'),
        L('        int total = 0;', 'init'),
        L('        Deque<Object[]> q = new ArrayDeque<>(); q.add(new Object[]{root, root.val});', 'init'),
        L('        while (!q.isEmpty()) {', 'go'),
        L('            Object[] e = q.poll(); TreeNode n = (TreeNode) e[0]; int num = (int) e[1];', 'go'),
        L('            if (n.left == null && n.right == null) { total += num; continue; }', 'leaf'),
        L('            if (n.left != null) q.add(new Object[]{n.left, num * 10 + n.left.val});', 'go'),
        L('            if (n.right != null) q.add(new Object[]{n.right, num * 10 + n.right.val});', 'go'),
        L('        }'),
        L('        return total;', 'ret'),
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
      const badges = new Map<number, string>();
      const done: number[] = [];
      const leaves: string[] = [];
      let total = 0;
      const steps: Step[] = [];
      const view = (cur: TNode | null): TreeState => ({
        nodes: layout.nodes.map((n) => ({ ...n, badge: badges.get(n.id) })),
        edges: layout.edges,
        current: cur ? cur.id : null,
        done: [...done],
        aggs: [{ label: 'total', value: String(total), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['BFS where each node carries the number spelled by its path (badge).'], state: view(null) });
      const q: [TNode, number][] = [[root, root.val]];
      badges.set(root.id, String(root.val));
      while (q.length) {
        const [n, num] = q.shift()!;
        done.push(n.id);
        if (!n.left && !n.right) {
          total += num;
          leaves.push(String(num));
          steps.push({ tag: 'leaf', trace: ['Leaf ', A(n.val), ' finishes the number ', B(num), ' — total ', C(total), '.'], state: view(n) });
          continue;
        }
        for (const c of [n.left, n.right]) if (c) {
          badges.set(c.id, String(num * 10 + c.val));
          q.push([c, num * 10 + c.val]);
        }
        steps.push({ tag: 'go', trace: ['Dequeue ', A(n.val), ' (', A(num), ') — each child extends it: ×10 + digit.'], state: view(n) });
      }
      steps.push({ tag: 'ret', trace: ['Sum of all root-to-leaf numbers: ', C(total), '.'], state: view(null) });
      return { steps, result: String(total), resultDetail: leaves.join(' + ') };
    },
    note: 'Same O(n) work as the DFS, with each queue entry carrying its own prefix number. DFS keeps just one running number on the call stack, using O(h) memory instead of O(w).',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================= Maximum Width of Binary Tree ================= */
const maxWidth: ProblemDef = {
  slug: 'maximum-width-of-binary-tree',
  title: 'Maximum Width of Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/maximum-width-of-binary-tree/',
  technique: 'Number nodes as in a heap (2i, 2i+1); a level\'s width is last index − first index + 1.',
  widget: 'tree',
  widgetTitle: 'Tree with heap indices',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 3, 2, 5, 3, null, 9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int widthOfBinaryTree(TreeNode* root) {'),
      L('        if (!root) return 0;'),
      L('        int best = 0;'),
      L('        queue<pair<TreeNode*, unsigned>> q;'),
      L('        q.push({root, 0});', 'init'),
      L('        while (!q.empty()) {', 'level'),
      L('            int n = q.size();'),
      L('            unsigned first = q.front().second, last = first;', 'ends'),
      L('            for (int i = 0; i < n; i++) {', 'node'),
      L('                auto [cur, idx] = q.front(); q.pop();'),
      L('                last = idx;', 'ends'),
      L('                idx -= first;               // keep indices small', 'rebase'),
      L('                if (cur->left) q.push({cur->left, 2*idx});', 'children'),
      L('                if (cur->right) q.push({cur->right, 2*idx+1});', 'children'),
      L('            }'),
      L('            best = max(best, (int)(last - first + 1));', 'width'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int widthOfBinaryTree(TreeNode root) {'),
      L('        if (root == null) return 0;'),
      L('        int best = 0;'),
      L('        Queue<Object[]> q = new LinkedList<>();'),
      L('        q.add(new Object[]{root, 0});', 'init'),
      L('        while (!q.isEmpty()) {', 'level'),
      L('            int n = q.size();'),
      L('            int first = (int) q.peek()[1], last = first;', 'ends'),
      L('            for (int i = 0; i < n; i++) {', 'node'),
      L('                Object[] e = q.remove();'),
      L('                TreeNode cur = (TreeNode) e[0];'),
      L('                int idx = (int) e[1];'),
      L('                last = idx;', 'ends'),
      L('                idx -= first;               // keep indices small', 'rebase'),
      L('                if (cur.left != null) q.add(new Object[]{cur.left, 2*idx});', 'children'),
      L('                if (cur.right != null) q.add(new Object[]{cur.right, 2*idx+1});', 'children'),
      L('            }'),
      L('            best = Math.max(best, last - first + 1);', 'width'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 14);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    let queue: { n: TNode; idx: number }[] = [{ n: root, idx: 0 }];
    let best = 0;
    let bestLevel = 0;
    let level = 0;
    const idxOf = new Map<number, number>([[root.id, 0]]);
    const view = (cur?: number | null, highlight: number[] = []): TreeState =>
      snap(root, {
        nodes: layoutTree(root).nodes.map((nd) => ({ ...nd, badge: idxOf.has(nd.id) ? `#${idxOf.get(nd.id)}` : undefined })),
        current: cur ?? null,
        done: highlight,
        queued: queue.map((e) => e.n.id),
        stack: queue.map((e) => ({ text: `${e.n.val} @ ${e.idx}` })),
        stackTitle: 'queue (node @ heap index)',
        aggs: [
          { label: 'level', value: String(level), c: 'a' },
          { label: 'widest so far', value: `${best} (level ${bestLevel})`, c: 'c' },
        ],
      });
    steps.push({
      tag: 'init',
      trace: [
        'Width counts the ', A('gaps'), ' too, so a plain node count is wrong. Give each node a heap index — left = ', B('2i'), ', right = ', B('2i+1'),
        ' — and the missing nodes still take up index space.',
      ],
      state: view(root.id),
    });
    while (queue.length) {
      const n = queue.length;
      const first = queue[0].idx;
      const last = queue[n - 1].idx;
      steps.push({
        tag: 'ends',
        trace: ['Level ', A(level), ' spans heap index ', A(first), ' to ', A(last), '.'],
        state: view(null, queue.map((e) => e.n.id)),
      });
      const next: { n: TNode; idx: number }[] = [];
      for (const e of queue) {
        const rebased = e.idx - first;
        if (e.n.left) {
          next.push({ n: e.n.left, idx: 2 * rebased });
          idxOf.set(e.n.left.id, 2 * rebased);
        }
        if (e.n.right) {
          next.push({ n: e.n.right, idx: 2 * rebased + 1 });
          idxOf.set(e.n.right.id, 2 * rebased + 1);
        }
      }
      const width = last - first + 1;
      if (width > best) {
        best = width;
        bestLevel = level;
      }
      steps.push({
        tag: 'width',
        trace: ['Width = ', B(last), ' − ', B(first), ' + 1 = ', C(width), width === best ? ' — the widest level so far.' : `.`],
        state: view(null, queue.map((e) => e.n.id)),
      });
      steps.push({
        tag: 'rebase',
        trace: ['Before descending, subtract ', A(first), ' from every index on this level. That keeps the numbers small enough to never overflow on a deep tree.'],
        state: view(),
      });
      queue = next;
      level++;
      if (queue.length) {
        steps.push({
          tag: 'children',
          trace: ['Next level queued with indices ', B(queue.map((e) => e.idx).join(', ')), '.'],
          state: view(),
        });
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Maximum width: ', C(best), ' (at level ', C(bestLevel), ').'],
      state: snap(root, { aggs: [{ label: 'max width', value: String(best), c: 'c' }] }),
    });
    return { steps, result: String(best), resultDetail: `at level ${bestLevel}` };
  },
  note: 'The rebasing step is not cosmetic — on a left-skewed tree of depth 50 the raw indices would exceed 64 bits, and this is exactly the case the judge tests. Subtracting the level\'s first index each round keeps every value bounded by the level width while leaving differences unchanged.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'DFS with leftmost index per depth',
    technique: 'Number nodes like a heap (left = 2i, right = 2i + 1); DFS records the first index seen at each depth, and every node measures its distance from it.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    vector<unsigned long long> first; unsigned long long best = 0;'),
        L('    void dfs(TreeNode* n, int d, unsigned long long idx) {', 'pop'),
        L('        if (!n) return;', 'pop'),
        L('        if (first.size() == d) first.push_back(idx);', 'level'),
        L('        best = max(best, idx - first[d] + 1);', 'width'),
        L('        dfs(n->left, d + 1, 2 * idx); dfs(n->right, d + 1, 2 * idx + 1);', 'push'),
        L('    }'),
        L('public:'),
        L('    int widthOfBinaryTree(TreeNode* root) { dfs(root, 0, 0); return best; }', 'init', 'ret'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    List<Long> first = new ArrayList<>(); long best = 0;'),
        L('    void dfs(TreeNode n, int d, long idx) {', 'pop'),
        L('        if (n == null) return;', 'pop'),
        L('        if (first.size() == d) first.add(idx);', 'level'),
        L('        best = Math.max(best, idx - first.get(d) + 1);', 'width'),
        L('        dfs(n.left, d + 1, 2 * idx); dfs(n.right, d + 1, 2 * idx + 1);', 'push'),
        L('    }'),
        L('    public int widthOfBinaryTree(TreeNode root) { dfs(root, 0, 0); return (int) best; }', 'init', 'ret'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const layout = layoutTree(root);
      const badges = new Map<number, string>();
      const first: number[] = [];
      let best = 0;
      let bestLevel = 0;
      const steps: Step[] = [];
      const view = (cur: TNode | null): TreeState => ({
        nodes: layout.nodes.map((n) => ({ ...n, badge: badges.get(n.id) })),
        edges: layout.edges,
        current: cur ? cur.id : null,
        done: [...badges.keys()],
        aggs: [
          { label: 'leftmost index per depth', value: first.join(', ') || '—', c: 'b' },
          { label: 'max width', value: String(best), c: 'c' },
        ],
      });
      steps.push({ tag: 'init', trace: ['Give each node a position index (children of i are 2i and 2i + 1) and remember the first index met at each depth.'], state: view(null) });
      const dfs = (n: TNode | null, d: number, idx: number) => {
        if (!n || steps.length > MAX_STEPS) return;
        if (first.length === d) first.push(idx);
        badges.set(n.id, `#${idx}`);
        const w = idx - first[d] + 1;
        if (w > best) {
          best = w;
          bestLevel = d + 1;
        }
        steps.push({ tag: 'width', trace: ['Node ', A(n.val), ' at depth ', A(d), ' has index ', A(idx), ' — width from the leftmost (', A(first[d]), ') is ', w === best ? B(w) : A(w), '.'], state: view(n) });
        dfs(n.left, d + 1, 2 * idx);
        dfs(n.right, d + 1, 2 * idx + 1);
      };
      dfs(root, 0, 0);
      steps.push({ tag: 'ret', trace: ['Maximum width: ', C(best), '.'], state: view(null) });
      return { steps, result: String(best), resultDetail: `at level ${bestLevel}` };
    },
    note: 'Same O(n) indexing idea as the BFS, but the leftmost index of each depth is stored in a small array instead of read off the front of a queue. Visiting left before right guarantees the first index recorded per depth is the leftmost.',
    complexity: { time: 'O(n)', space: 'O(h)' },
  },
};

/* ================= Count Complete Tree Nodes ================= */
const countCompleteNodes: ProblemDef = {
  slug: 'count-complete-tree-nodes',
  title: 'Count Complete Tree Nodes',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/count-complete-tree-nodes/',
  technique: 'If the left and right spines match, the subtree is perfect — use 2^h − 1 instead of walking it.',
  widget: 'tree',
  widgetTitle: 'Complete tree',
  inputs: [{ key: 'tree', label: 'Level-order (complete tree)', defaultValue: '1, 2, 3, 4, 5, 6', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int countNodes(TreeNode* root) {', 'enter'),
      L('        if (!root) return 0;', 'enter'),
      L('        int l = 0, r = 0;'),
      L('        for (auto n = root; n; n = n->left) l++;', 'spines'),
      L('        for (auto n = root; n; n = n->right) r++;', 'spines'),
      L('        if (l == r) return (1 << l) - 1;', 'perfect'),
      L('        return 1 + countNodes(root->left)', 'recurse', 'ret'),
      L('                 + countNodes(root->right);', 'recurse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int countNodes(TreeNode root) {', 'enter'),
      L('        if (root == null) return 0;', 'enter'),
      L('        int l = 0, r = 0;'),
      L('        for (TreeNode n = root; n != null; n = n.left) l++;', 'spines'),
      L('        for (TreeNode n = root; n != null; n = n.right) r++;', 'spines'),
      L('        if (l == r) return (1 << l) - 1;', 'perfect'),
      L('        return 1 + countNodes(root.left)', 'recurse', 'ret'),
      L('                 + countNodes(root.right);', 'recurse'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 15);
    if (typeof levels === 'string') return { error: levels };
    if (levels.some((v) => v === null)) return { error: 'A complete tree has no gaps — remove the nulls.' };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const counted: number[] = [];
    const view = (cur: TNode | null, extra: { label: string; value: string; c: 'a' | 'b' | 'c' }[] = []): TreeState =>
      snap(root, { current: cur ? cur.id : null, done: [...counted], aggs: extra });
    steps.push({
      tag: 'enter',
      trace: ['A plain traversal is O(n). Because the tree is ', A('complete'), ', most subtrees are perfect — and a perfect subtree can be counted by formula, not by walking.'],
      state: view(root),
    });
    const spineIds = (n: TNode, dir: 'left' | 'right') => {
      const ids: number[] = [];
      let cur: TNode | null = n;
      while (cur) {
        ids.push(cur.id);
        cur = cur[dir];
      }
      return ids;
    };
    const count = (n: TNode | null): number => {
      if (!n || steps.length > MAX_STEPS) return 0;
      const ls = spineIds(n, 'left');
      const rs = spineIds(n, 'right');
      steps.push({
        tag: 'spines',
        trace: ['At node ', A(n.val), ': the left spine is ', A(ls.length), ' deep, the right spine ', B(rs.length), '.'],
        state: snap(root, { current: n.id, done: [...counted], queued: [...ls, ...rs] }),
      });
      if (ls.length === rs.length) {
        const total = (1 << ls.length) - 1;
        counted.push(...collectIds(n));
        steps.push({
          tag: 'perfect',
          trace: [
            'Equal spines means this subtree is ', B('perfect'), ' — every level is full. So it holds exactly 2^', B(ls.length), ' − 1 = ', C(total),
            ' node(s), with no traversal needed.',
          ],
          state: view(n, [{ label: 'counted', value: String(total), c: 'c' }]),
        });
        return total;
      }
      steps.push({
        tag: 'recurse',
        trace: ['Spines differ, so the last level is partly filled — recurse into both children and add ', A(1), ' for this node.'],
        state: view(n),
      });
      counted.push(n.id);
      return 1 + count(n.left) + count(n.right);
    };
    const total = count(root);
    steps.push({
      tag: 'ret',
      trace: ['Total nodes: ', C(total), '.'],
      state: snap(root, { done: collectIds(root), aggs: [{ label: 'count', value: String(total), c: 'c' }] }),
    });
    return { steps, result: String(total) };
  },
  note: 'Only one child of any node can be imperfect, so the recursion follows a single path down the tree — O(log n) calls, each doing O(log n) spine work, for O(log² n) overall. Recognising that "complete" is a promise you can exploit is the whole point; ignoring it and traversing is correct but misses what the problem is testing.',
  complexity: { time: 'O(log² n)', space: 'O(log n)' },
  brute: {
    label: 'Count every node',
    technique: 'Ignore completeness: count = 1 + count(left) + count(right), visiting every node.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int countNodes(TreeNode* root) {', 'init'),
        L('        if (!root) return 0;', 'visit'),
        L('        return 1 + countNodes(root->left) + countNodes(root->right);', 'visit', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int countNodes(TreeNode root) {', 'init'),
        L('        if (root == null) return 0;', 'visit'),
        L('        return 1 + countNodes(root.left) + countNodes(root.right);', 'visit', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const done: number[] = [];
      let total = 0;
      const steps: Step[] = [];
      const view = (cur: TNode | null) => snap(root, { current: cur ? cur.id : null, done: [...done], aggs: [{ label: 'counted', value: String(total), c: 'c' }] });
      steps.push({ tag: 'init', trace: ['No shortcut: visit and count every node.'], state: view(null) });
      const go = (n: TNode | null) => {
        if (!n) return;
        total++;
        done.push(n.id);
        steps.push({ tag: 'visit', trace: ['Count ', A(n.val), ' → ', B(total), '.'], state: view(n) });
        go(n.left);
        go(n.right);
      };
      go(root);
      steps.push({ tag: 'ret', trace: [C(total), ' nodes, each visited once.'], state: view(null) });
      return { steps, result: String(total) };
    },
    note: 'O(n), fine for any tree but it wastes the “complete” guarantee. Comparing the leftmost and rightmost depths spots perfect subtrees whose size is 2^h − 1 instantly, giving O(log² n).',
    complexity: { time: 'O(n)', space: 'O(h)' },
  },
};

function collectIds(n: TNode | null): number[] {
  if (!n) return [];
  return [n.id, ...collectIds(n.left), ...collectIds(n.right)];
}

export const trees4: ProblemDef[] = [
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
  zigzagLevelOrder,
  symmetricTree,
  pathSum,
  pathSumII,
  binaryTreePaths,
  sumRootToLeaf,
  maxWidth,
  countCompleteNodes,
];
