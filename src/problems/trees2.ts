// Trees, part 2 (recursive metrics + comparisons + BFS views).
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 350;

const treeInput = (def: string) => [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: def, wide: true }];

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

/* ================= 60. Diameter of Binary Tree ================= */
const diameter: ProblemDef = {
  slug: 'diameter-of-binary-tree',
  title: 'Diameter of Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/diameter-of-binary-tree/',
  technique: 'Post-order heights: at every node, the best path through it is leftHeight + rightHeight.',
  widget: 'tree',
  widgetTitle: 'Tree (height badges) & call stack',
  inputs: treeInput('1, 2, 3, 4, 5'),
  code: {
    cpp: [
      L('class Solution {'),
      L('    int best = 0;', 'init'),
      L('public:'),
      L('    int diameterOfBinaryTree(TreeNode* root) {'),
      L('        height(root);', 'init'),
      L('        return best;', 'retall'),
      L('    }'),
      L('    int height(TreeNode* n) {', 'enter'),
      L('        if (n == nullptr) return 0;', 'enter'),
      L('        int l = height(n->left);', 'recl'),
      L('        int r = height(n->right);', 'recr'),
      L('        best = max(best, l + r);', 'update'),
      L('        return 1 + max(l, r);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int best = 0;', 'init'),
      L('    public int diameterOfBinaryTree(TreeNode root) {'),
      L('        height(root);', 'init'),
      L('        return best;', 'retall'),
      L('    }'),
      L('    private int height(TreeNode n) {', 'enter'),
      L('        if (n == null) return 0;', 'enter'),
      L('        int l = height(n.left);', 'recl'),
      L('        int r = height(n.right);', 'recr'),
      L('        best = Math.max(best, l + r);', 'update'),
      L('        return 1 + Math.max(l, r);', 'ret'),
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
    let best = 0;
    const aggs = () => [{ label: 'best diameter', value: String(best), c: 'b' as const }];
    steps.push({ tag: 'init', trace: ['The diameter is the longest path between any two nodes — it "bends" at exactly one node, where it equals left height + right height.'], state: snap({ aggs: aggs() }) });
    const walk = (n: TNode): number => {
      if (steps.length > MAX_STEPS) return 0;
      stack.push(`height(${n.val})`);
      steps.push({ tag: 'enter', trace: ['Enter ', A(`height(${n.val})`), '.'], state: snap({ current: n.id, aggs: aggs() }) });
      let l = 0;
      let r = 0;
      if (n.left) {
        steps.push({ tag: 'recl', tag2: 'enter', trace: ['Ask the left child ', A(n.left.val), ' for its height.'], state: snap({ current: n.id, aggs: aggs() }) });
        l = walk(n.left);
      }
      if (n.right) {
        steps.push({ tag: 'recr', tag2: 'enter', trace: ['Ask the right child ', A(n.right.val), ' for its height.'], state: snap({ current: n.id, aggs: aggs() }) });
        r = walk(n.right);
      }
      const through = l + r;
      if (through > best) best = through;
      steps.push({
        tag: 'update',
        trace: ['At ', A(n.val), ': path through it spans ', A(l), ' + ', A(r), ' = ', through === best ? B(through) : A(through), ' edges', through === best ? ' — best so far.' : '.'],
        state: snap({ current: n.id, aggs: aggs() }),
      });
      const h = 1 + Math.max(l, r);
      badges.set(n.id, `h=${h}`);
      stack.pop();
      done.push(n.id);
      steps.push({ tag: 'ret', trace: ['Report height ', B(h), ' up to the parent.'], state: snap({ current: n.id, aggs: aggs() }) });
      return h;
    };
    walk(root);
    steps.push({ tag: 'retall', trace: ['Every bend tried — the diameter is ', C(best), ' edges.'], state: snap({ aggs: aggs() }) });
    return { steps, result: String(best), resultDetail: 'longest path, in edges' };
  },
  note: 'The trick is answering a different question than asked: the recursion returns *height*, but as a side effect each node checks whether the path bending at it (l + r) beats the global best. One traversal computes both.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Recompute heights',
    technique: 'At every node, call a separate height() on each child and add them; heights are recomputed from scratch each time.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    int height(TreeNode* n) { return n ? 1 + max(height(n->left), height(n->right)) : 0; }'),
        L('public:'),
        L('    int diameterOfBinaryTree(TreeNode* root) {', 'enter'),
        L('        if (!root) return 0;', 'enter'),
        L('        int through = height(root->left) + height(root->right);  // O(n) each time', 'best'),
        L('        return max({through, diameterOfBinaryTree(root->left), diameterOfBinaryTree(root->right)});', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int height(TreeNode n) { return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right)); }'),
        L('    public int diameterOfBinaryTree(TreeNode root) {', 'enter'),
        L('        if (root == null) return 0;', 'enter'),
        L('        int through = height(root.left) + height(root.right);  // O(n) each time', 'best'),
        L('        return Math.max(through, Math.max(diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right)));', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const { done, badges, snap } = makeSnap(root);
      const steps: Step[] = [];
      let best = 0;
      let heightCalls = 0;
      const height = (n: TNode | null): number => {
        if (!n) return 0;
        heightCalls++;
        return 1 + Math.max(height(n.left), height(n.right));
      };
      const aggs = () => [
        { label: 'best diameter', value: String(best), c: 'b' as const },
        { label: 'height() calls', value: String(heightCalls), c: 'a' as const },
      ];
      steps.push({ tag: 'enter', trace: ['At each node, measure both subtree heights from scratch and add them.'], state: snap({ aggs: aggs() }) });
      const walk = (n: TNode | null) => {
        if (!n || steps.length > MAX_STEPS) return;
        const l = height(n.left);
        const r = height(n.right);
        const through = l + r;
        if (through > best) best = through;
        badges.set(n.id, `${l}+${r}`);
        done.push(n.id);
        steps.push({ tag: 'best', trace: ['At ', A(n.val), ': heights ', A(l), ' + ', A(r), ' = ', B(through), ' edges through this node. Best ', C(best), '.'], state: snap({ current: n.id, aggs: aggs() }) });
        walk(n.left);
        walk(n.right);
      };
      walk(root);
      steps.push({ tag: 'ret', trace: ['Diameter: ', C(best), ' — after ', A(heightCalls), ' height() calls.'], state: snap({ aggs: aggs() }) });
      return { steps, result: String(best), resultDetail: 'longest path, in edges' };
    },
    note: 'Every node re-measures its whole subtree, so a skewed tree costs O(n²). Computing the height once per node on the way back up — and updating the best diameter at the same time — makes it O(n).',
    complexity: { time: 'O(n²) worst case', space: 'O(h)' },
  },
};

/* ================= 61. Balanced Binary Tree ================= */
const balanced: ProblemDef = {
  slug: 'balanced-binary-tree',
  title: 'Balanced Binary Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/balanced-binary-tree/',
  technique: 'Bottom-up heights, short-circuiting with −1 the instant any subtree is lopsided.',
  widget: 'tree',
  widgetTitle: 'Tree (height badges) & call stack',
  inputs: treeInput('3, 9, 20, null, null, 15, 7'),
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isBalanced(TreeNode* root) {'),
      L('        return check(root) != -1;', 'retall'),
      L('    }'),
      L('    int check(TreeNode* n) {', 'enter'),
      L('        if (n == nullptr) return 0;', 'enter'),
      L('        int l = check(n->left);', 'recl'),
      L('        if (l == -1) return -1;', 'abort'),
      L('        int r = check(n->right);', 'recr'),
      L('        if (r == -1) return -1;', 'abort'),
      L('        if (abs(l - r) > 1) return -1;', 'bad'),
      L('        return 1 + max(l, r);', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isBalanced(TreeNode root) {'),
      L('        return check(root) != -1;', 'retall'),
      L('    }'),
      L('    private int check(TreeNode n) {', 'enter'),
      L('        if (n == null) return 0;', 'enter'),
      L('        int l = check(n.left);', 'recl'),
      L('        if (l == -1) return -1;', 'abort'),
      L('        int r = check(n.right);', 'recr'),
      L('        if (r == -1) return -1;', 'abort'),
      L('        if (Math.abs(l - r) > 1) return -1;', 'bad'),
      L('        return 1 + Math.max(l, r);', 'ret'),
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
    let verdict = true;
    const walk = (n: TNode): number => {
      if (steps.length > MAX_STEPS || !verdict) return -1;
      stack.push(`check(${n.val})`);
      steps.push({ tag: 'enter', trace: ['Enter ', A(`check(${n.val})`), ' — measure both subtree heights.'], state: snap({ current: n.id }) });
      const l = n.left ? walk(n.left) : 0;
      if (l === -1) {
        stack.pop();
        return -1;
      }
      const r = n.right ? walk(n.right) : 0;
      if (r === -1) {
        stack.pop();
        return -1;
      }
      stack.pop();
      if (Math.abs(l - r) > 1) {
        verdict = false;
        badges.set(n.id, '✗');
        steps.push({
          tag: 'bad',
          trace: ['At ', F(n.val), ': heights ', F(l), ' vs ', F(r), ' differ by more than 1 — unbalanced. Short-circuit with −1 all the way up.'],
          state: snap({ current: n.id }),
        });
        return -1;
      }
      const h = 1 + Math.max(l, r);
      badges.set(n.id, `h=${h}`);
      done.push(n.id);
      steps.push({
        tag: 'ret',
        trace: ['At ', B(n.val), ': heights ', A(l), ' and ', A(r), ' — balanced here; report height ', B(h), '.'],
        state: snap({ current: n.id }),
      });
      return h;
    };
    walk(root);
    steps.push({
      tag: 'retall',
      trace: verdict
        ? ['No node ever exceeded a height gap of 1 — the tree is balanced: ', C('true'), '.']
        : ['A −1 bubbled to the root — the tree is not balanced: ', C('false'), '.'],
      state: snap(),
    });
    return { steps, result: String(verdict) };
  },
  note: 'Checking balance top-down recomputes heights O(n) times. Bottom-up, each node\'s height is computed once, and −1 doubles as a poison value that aborts the rest of the traversal the moment imbalance is proven.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Top-down heights',
    technique: 'At each node, compute both subtree heights from scratch and compare them, then check both children the same way.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    int height(TreeNode* n) { return n ? 1 + max(height(n->left), height(n->right)) : 0; }'),
        L('public:'),
        L('    bool isBalanced(TreeNode* root) {', 'enter'),
        L('        if (!root) return true;', 'enter'),
        L('        if (abs(height(root->left) - height(root->right)) > 1) return false;', 'fail'),
        L('        return isBalanced(root->left) && isBalanced(root->right);', 'ok'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    int height(TreeNode n) { return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right)); }'),
        L('    public boolean isBalanced(TreeNode root) {', 'enter'),
        L('        if (root == null) return true;', 'enter'),
        L('        if (Math.abs(height(root.left) - height(root.right)) > 1) return false;', 'fail'),
        L('        return isBalanced(root.left) && isBalanced(root.right);', 'ok'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const { done, badges, snap } = makeSnap(root);
      const steps: Step[] = [];
      let heightCalls = 0;
      const height = (n: TNode | null): number => {
        if (!n) return 0;
        heightCalls++;
        return 1 + Math.max(height(n.left), height(n.right));
      };
      const aggs = () => [{ label: 'height() calls', value: String(heightCalls), c: 'a' as const }];
      steps.push({ tag: 'enter', trace: ['Check every node top-down, measuring its subtree heights from scratch each time.'], state: snap({ aggs: aggs() }) });
      let verdict = true;
      const check = (n: TNode | null): boolean => {
        if (!n || steps.length > MAX_STEPS) return true;
        const l = height(n.left);
        const r = height(n.right);
        badges.set(n.id, `${l}|${r}`);
        if (Math.abs(l - r) > 1) {
          steps.push({ tag: 'fail', trace: ['At ', F(n.val), ': heights ', F(l), ' and ', F(r), ' differ by more than 1 — ', C('not balanced'), '.'], state: snap({ current: n.id, aggs: aggs() }) });
          return false;
        }
        done.push(n.id);
        steps.push({ tag: 'ok', trace: ['At ', A(n.val), ': heights ', A(l), ' and ', A(r), ' — fine here; now check its children.'], state: snap({ current: n.id, aggs: aggs() }) });
        return check(n.left) && check(n.right);
      };
      verdict = check(root);
      if (verdict) steps.push({ tag: 'ok', trace: ['Every node passed — ', C('balanced'), ' (', A(heightCalls), ' height() calls).'], state: snap({ aggs: aggs() }) });
      return { steps, result: String(verdict) };
    },
    note: 'Heights of deep nodes are recomputed once for every ancestor, which is O(n²) on a skewed tree. The bottom-up version returns each height once and uses −1 to signal "already unbalanced", for O(n).',
    complexity: { time: 'O(n²) worst case', space: 'O(h)' },
  },
};

/* ================= 62. Same Tree ================= */
const sameTree: ProblemDef = {
  slug: 'same-tree',
  title: 'Same Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/same-tree/',
  technique: 'Walk both trees in lockstep — equal iff every pair of positions matches.',
  widget: 'tree',
  widgetTitle: 'Tree p (compared against q)',
  inputs: [
    { key: 'p', label: 'Tree p (level-order)', defaultValue: '1, 2, 3', wide: true },
    { key: 'q', label: 'Tree q (level-order)', defaultValue: '1, 2, 3', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isSameTree(TreeNode* p, TreeNode* q) {', 'enter'),
      L('        if (p == nullptr && q == nullptr) return true;', 'bothnull'),
      L('        if (p == nullptr || q == nullptr) return false;', 'onenull'),
      L('        if (p->val != q->val) return false;', 'diff'),
      L('        return isSameTree(p->left, q->left) &&', 'rec'),
      L('               isSameTree(p->right, q->right);', 'rec'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isSameTree(TreeNode p, TreeNode q) {', 'enter'),
      L('        if (p == null && q == null) return true;', 'bothnull'),
      L('        if (p == null || q == null) return false;', 'onenull'),
      L('        if (p.val != q.val) return false;', 'diff'),
      L('        return isSameTree(p.left, q.left) &&', 'rec'),
      L('               isSameTree(p.right, q.right);', 'rec'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const lp = parseLevelOrder(values.p);
    if (typeof lp === 'string') return { error: `Tree p: ${lp}` };
    const lq = parseLevelOrder(values.q);
    if (typeof lq === 'string') return { error: `Tree q: ${lq}` };
    const p = buildTree(lp);
    const q = buildTree(lq);
    if (!p || !q) return { error: 'Both trees must be non-empty.' };
    const { done, stack, snap } = makeSnap(p);
    const steps: Step[] = [];
    let same = true;
    const walk = (a: TNode | null, b: TNode | null, pos: string): boolean => {
      if (steps.length > MAX_STEPS) return true;
      if (a === null && b === null) return true;
      if (a === null || b === null) {
        same = false;
        steps.push({
          tag: 'onenull',
          trace: ['At the ', A(pos), ' position, one tree has a node (', F(a ? a.val : b!.val), ') and the other has ', F('null'), ' — structures differ. Return ', C('false'), '.'],
          state: snap(),
        });
        return false;
      }
      stack.push(`cmp(${a.val},${b.val})`);
      if (a.val !== b.val) {
        same = false;
        steps.push({
          tag: 'diff',
          trace: ['Position ', A(pos), ': p has ', F(a.val), ' but q has ', F(b.val), ' — values differ. Return ', C('false'), '.'],
          state: snap({ current: a.id }),
        });
        stack.pop();
        return false;
      }
      steps.push({
        tag: 'enter',
        trace: ['Position ', A(pos), ': both trees hold ', B(a.val), ' — match; compare children in lockstep.'],
        state: snap({ current: a.id }),
      });
      const ok = walk(a.left, b.left, `${pos}.L`) && walk(a.right, b.right, `${pos}.R`);
      stack.pop();
      if (ok) {
        done.push(a.id);
        steps.push({ tag: 'rec', trace: ['Subtree at ', B(a.val), ' fully matches.'], state: snap({ current: a.id }) });
      }
      return ok;
    };
    walk(p, q, 'root');
    steps.push({
      tag: same ? 'bothnull' : 'onenull',
      trace: same ? ['Every position agreed — the trees are identical: ', C('true'), '.'] : ['Comparison stopped at the first mismatch: ', C('false'), '.'],
      state: snap(),
    });
    return { steps, result: String(same) };
  },
  note: 'Structural equality decomposes perfectly: two trees match iff their roots match and both child pairs match — so the recursion mirrors the definition, and short-circuit && abandons the walk at the first disagreement.',
  complexity: { time: 'O(min(m,n))', space: 'O(h)' },
  brute: {
    label: 'BFS over pairs',
    technique: 'Walk both trees together with a queue of node pairs, comparing each pair and enqueueing their children pairwise.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isSameTree(TreeNode* p, TreeNode* q) {'),
        L('        queue<pair<TreeNode*, TreeNode*>> Q; Q.push({p, q});', 'enter'),
        L('        while (!Q.empty()) {', 'enter'),
        L('            auto [a, b] = Q.front(); Q.pop();', 'match'),
        L('            if (!a && !b) continue;', 'match'),
        L('            if (!a || !b || a->val != b->val) return false;', 'diff'),
        L('            Q.push({a->left, b->left}); Q.push({a->right, b->right});', 'match'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isSameTree(TreeNode p, TreeNode q) {'),
        L('        Deque<TreeNode[]> Q = new ArrayDeque<>(); Q.add(new TreeNode[]{p, q});', 'enter'),
        L('        while (!Q.isEmpty()) {', 'enter'),
        L('            TreeNode[] pr = Q.poll(); TreeNode a = pr[0], b = pr[1];', 'match'),
        L('            if (a == null && b == null) continue;', 'match'),
        L('            if (a == null || b == null || a.val != b.val) return false;', 'diff'),
        L('            Q.add(new TreeNode[]{a.left, b.left}); Q.add(new TreeNode[]{a.right, b.right});', 'match'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const lp = parseLevelOrder(values.p);
      if (typeof lp === 'string') return { error: `Tree p: ${lp}` };
      const lq = parseLevelOrder(values.q);
      if (typeof lq === 'string') return { error: `Tree q: ${lq}` };
      const p = buildTree(lp);
      const q = buildTree(lq);
      if (!p || !q) return { error: 'Both trees must be non-empty.' };
      const { done, snap } = makeSnap(p);
      const steps: Step[] = [];
      const Q: [TNode | null, TNode | null][] = [[p, q]];
      steps.push({ tag: 'enter', trace: ['Compare the two trees pair by pair with a queue (tree p is drawn).'], state: snap() });
      let same = true;
      while (Q.length) {
        const [a, b] = Q.shift()!;
        if (!a && !b) continue;
        if (!a || !b || a.val !== b.val) {
          same = false;
          steps.push({ tag: 'diff', trace: ['Pair (', F(a ? a.val : 'null'), ', ', F(b ? b.val : 'null'), ') differs — ', C('false'), '.'], state: snap({ current: a ? a.id : null }) });
          break;
        }
        done.push(a.id);
        steps.push({ tag: 'match', trace: ['Pair (', B(a.val), ', ', B(b.val), ') matches — enqueue both left children and both right children.'], state: snap({ current: a.id }) });
        Q.push([a.left, b.left], [a.right, b.right]);
      }
      if (same) steps.push({ tag: 'ret', trace: ['Every pair matched — ', C('true'), '.'], state: snap() });
      return { steps, result: String(same) };
    },
    note: 'Same O(n) comparisons as the recursive version, done level by level. The queue avoids deep recursion when the trees are long chains.',
    complexity: { time: 'O(n)', space: 'O(w) queue' },
  },
};

/* ================= 63. Subtree of Another Tree ================= */
const subtreeOf: ProblemDef = {
  slug: 'subtree-of-another-tree',
  title: 'Subtree of Another Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/subtree-of-another-tree/',
  technique: 'Try an exact same-tree match anchored at every node of the big tree.',
  widget: 'tree',
  widgetTitle: 'Main tree (candidates tried)',
  inputs: [
    { key: 'root', label: 'Main tree (level-order)', defaultValue: '3, 4, 5, 1, 2', wide: true },
    { key: 'sub', label: 'Subtree (level-order)', defaultValue: '4, 1, 2', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isSubtree(TreeNode* root, TreeNode* subRoot) {', 'enter'),
      L('        if (root == nullptr) return false;', 'enter'),
      L('        if (same(root, subRoot)) return true;', 'try'),
      L('        return isSubtree(root->left, subRoot) ||', 'rec'),
      L('               isSubtree(root->right, subRoot);', 'rec'),
      L('    }'),
      L('    bool same(TreeNode* a, TreeNode* b) {', 'try'),
      L('        if (!a && !b) return true;'),
      L('        if (!a || !b || a->val != b->val) return false;'),
      L('        return same(a->left, b->left) && same(a->right, b->right);'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isSubtree(TreeNode root, TreeNode subRoot) {', 'enter'),
      L('        if (root == null) return false;', 'enter'),
      L('        if (same(root, subRoot)) return true;', 'try'),
      L('        return isSubtree(root.left, subRoot) ||', 'rec'),
      L('               isSubtree(root.right, subRoot);', 'rec'),
      L('    }'),
      L('    private boolean same(TreeNode a, TreeNode b) {', 'try'),
      L('        if (a == null && b == null) return true;'),
      L('        if (a == null || b == null || a.val != b.val) return false;'),
      L('        return same(a.left, b.left) && same(a.right, b.right);'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const lr = parseLevelOrder(values.root);
    if (typeof lr === 'string') return { error: `Main tree: ${lr}` };
    const ls = parseLevelOrder(values.sub);
    if (typeof ls === 'string') return { error: `Subtree: ${ls}` };
    const root = buildTree(lr);
    const sub = buildTree(ls);
    if (!root || !sub) return { error: 'Both trees must be non-empty.' };
    const { done, snap } = makeSnap(root);
    const steps: Step[] = [];
    const subDesc = ls.filter((v) => v !== null).join(',');
    const same = (a: TNode | null, b: TNode | null): boolean => {
      if (!a && !b) return true;
      if (!a || !b || a.val !== b.val) return false;
      return same(a.left, b.left) && same(a.right, b.right);
    };
    const collect = (n: TNode | null, ids: number[]) => {
      if (!n) return;
      ids.push(n.id);
      collect(n.left, ids);
      collect(n.right, ids);
    };
    steps.push({ tag: 'enter', trace: ['Looking for an exact copy of [', C(subDesc), '] anchored somewhere in the main tree.'], state: snap() });
    let found = false;
    const walk = (n: TNode | null): boolean => {
      if (!n || found || steps.length > MAX_STEPS) return false;
      const ok = same(n, sub);
      if (ok) {
        found = true;
        const ids: number[] = [];
        collect(n, ids);
        done.push(...ids);
        steps.push({
          tag: 'try',
          trace: ['Anchor at ', B(n.val), ': the whole subtree matches node-for-node — return ', C('true'), '.'],
          state: snap({ current: n.id }),
        });
        return true;
      }
      steps.push({
        tag: 'try',
        trace: ['Anchor at ', A(n.val), ': mismatch against the pattern — this anchor fails.'],
        state: snap({ current: n.id }),
      });
      steps.push({ tag: 'rec', trace: ['Descend and try the children as anchors.'], state: snap({ current: n.id }) });
      return walk(n.left) || walk(n.right);
    };
    walk(root);
    if (!found) steps.push({ tag: 'rec', trace: ['Every anchor tried and failed — return ', C('false'), '.'], state: snap() });
    return { steps, result: String(found), resultDetail: found ? 'exact subtree match found' : 'no anchor matched' };
  },
  note: 'A subtree match must be *exact* — same structure, nothing extra below — which is why the helper is the full Same Tree check, not a containment test. Every node gets one chance to be the anchor.',
  complexity: { time: 'O(m · n) worst case', space: 'O(h)' },
  brute: {
    label: 'Serialise & search',
    technique: 'Write both trees as pre-order strings with explicit null markers, then check whether one string contains the other.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    string ser(TreeNode* n) { return n ? "^" + to_string(n->val) + ser(n->left) + ser(n->right) : "#"; }', 'anchor'),
        L('public:'),
        L('    bool isSubtree(TreeNode* root, TreeNode* sub) {'),
        L('        string a = ser(root), b = ser(sub);', 'anchor'),
        L('        return a.find(b) != string::npos;  // or KMP for guaranteed O(m + n)', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    String ser(TreeNode n) { return n == null ? "#" : "^" + n.val + ser(n.left) + ser(n.right); }', 'anchor'),
        L('    public boolean isSubtree(TreeNode root, TreeNode sub) {'),
        L('        String a = ser(root), b = ser(sub);', 'anchor'),
        L('        return a.contains(b);  // or KMP for guaranteed O(m + n)', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const lr = parseLevelOrder(values.root);
      if (typeof lr === 'string') return { error: `Main tree: ${lr}` };
      const ls = parseLevelOrder(values.sub);
      if (typeof ls === 'string') return { error: `Subtree: ${ls}` };
      const root = buildTree(lr);
      const sub = buildTree(ls);
      if (!root || !sub) return { error: 'Both trees must be non-empty.' };
      const { snap } = makeSnap(root);
      const ser = (n: TNode | null): string => (n ? `^${n.val}${ser(n.left)}${ser(n.right)}` : '#');
      const a = ser(root);
      const b = ser(sub);
      const steps: Step[] = [];
      steps.push({ tag: 'anchor', trace: ['Serialise the main tree (pre-order, # for null, ^ before each value): ', A(a), '.'], state: snap({ aggs: [{ label: 'main', value: a, c: 'a' }] }) });
      steps.push({ tag: 'anchor', trace: ['Serialise the candidate subtree the same way: ', B(b), '.'], state: snap({ aggs: [{ label: 'main', value: a, c: 'a' }, { label: 'sub', value: b, c: 'b' }] }) });
      const at = a.indexOf(b);
      const found = at >= 0;
      steps.push({
        tag: 'ret',
        trace: found ? ['"', B(b), '" appears inside the main string at position ', C(at), ' — ', C('true'), '.'] : ['The subtree string does not appear — ', C('false'), '.'],
        state: snap({ aggs: [{ label: 'main', value: a, c: 'a' }, { label: 'sub', value: b, c: 'b' }] }),
      });
      return { steps, result: String(found), resultDetail: found ? 'exact subtree match found' : 'no anchor matched' };
    },
    note: 'The null markers and the ^ separators make the encoding unambiguous, so a substring match is exactly a subtree match. With KMP the search is O(m + n), better than comparing the subtree at every node (O(m·n)).',
    complexity: { time: 'O(m + n) with KMP', space: 'O(m + n)' },
  },
};

/* ================= 64. LCA of a BST ================= */
const lcaBST: ProblemDef = {
  slug: 'lowest-common-ancestor-of-a-binary-search-tree',
  title: 'Lowest Common Ancestor of a Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
  technique: 'Walk from the root: the first node between p and q in value is the LCA.',
  widget: 'tree',
  widgetTitle: 'BST walk',
  inputs: [
    { key: 'tree', label: 'BST (level-order)', defaultValue: '6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', wide: true },
    { key: 'p', label: 'p', defaultValue: '2' },
    { key: 'q', label: 'q', defaultValue: '8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {'),
      L('        TreeNode* node = root;', 'init'),
      L('        while (node != nullptr) {', 'loop'),
      L('            if (p->val < node->val && q->val < node->val)', 'left'),
      L('                node = node->left;', 'left'),
      L('            else if (p->val > node->val && q->val > node->val)', 'right'),
      L('                node = node->right;', 'right'),
      L('            else'),
      L('                return node;', 'found'),
      L('        }'),
      L('        return nullptr;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {'),
      L('        TreeNode node = root;', 'init'),
      L('        while (node != null) {', 'loop'),
      L('            if (p.val < node.val && q.val < node.val)', 'left'),
      L('                node = node.left;', 'left'),
      L('            else if (p.val > node.val && q.val > node.val)', 'right'),
      L('                node = node.right;', 'right'),
      L('            else'),
      L('                return node;', 'found'),
      L('        }'),
      L('        return null;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const pv = Number(values.p);
    const qv = Number(values.q);
    if (!Number.isInteger(pv) || !Number.isInteger(qv)) return { error: 'p and q must be integers.' };
    const exists = (n: TNode | null, v: number): boolean => !!n && (n.val === v || exists(n.left, v) || exists(n.right, v));
    if (!exists(root, pv) || !exists(root, qv)) return { error: 'Both p and q must exist in the tree.' };

    const { done, snap } = makeSnap(root);
    const steps: Step[] = [];
    steps.push({ tag: 'init', trace: ['In a BST, values steer the walk: find the first node where ', A(pv), ' and ', A(qv), ' split apart.'], state: snap() });
    let node: TNode | null = root;
    let ans: TNode | null = null;
    while (node) {
      if (pv < node.val && qv < node.val) {
        steps.push({ tag: 'left', trace: ['Both ', A(pv), ' and ', A(qv), ' are less than ', A(node.val), ' — the split must be in the left subtree.'], state: snap({ current: node.id }) });
        done.push(node.id);
        node = node.left;
      } else if (pv > node.val && qv > node.val) {
        steps.push({ tag: 'right', trace: ['Both ', A(pv), ' and ', A(qv), ' are greater than ', A(node.val), ' — go right.'], state: snap({ current: node.id }) });
        done.push(node.id);
        node = node.right;
      } else {
        ans = node;
        steps.push({
          tag: 'found',
          trace: [C(node.val), ' sits between them (or equals one) — the paths to p and q diverge here. This is the LCA.'],
          state: snap({ current: node.id }),
        });
        break;
      }
    }
    return { steps, result: String(ans!.val), resultDetail: `lowest common ancestor of ${pv} and ${qv}` };
  },
  note: 'BST ordering collapses ancestry into arithmetic: an ancestor of both nodes has both in one subtree iff both values are on the same side of it. The first node where they straddle (or hit) is by definition the lowest common ancestor — no parent pointers, no backtracking.',
  complexity: { time: 'O(h)', space: 'O(1)' },
  brute: {
    label: 'Compare root-to-node paths',
    technique: 'Ignore the BST ordering: find the path from the root to p and to q, and take the last node the two paths share.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    bool path(TreeNode* n, int v, vector<TreeNode*>& out) {', 'walk'),
        L('        if (!n) return false;', 'walk'),
        L('        out.push_back(n);', 'walk'),
        L('        if (n->val == v || path(n->left, v, out) || path(n->right, v, out)) return true;', 'walk'),
        L('        out.pop_back(); return false;', 'walk'),
        L('    }'),
        L('public:'),
        L('    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {'),
        L('        vector<TreeNode*> a, b;', 'init'),
        L('        path(root, p->val, a); path(root, q->val, b);', 'init'),
        L('        TreeNode* lca = root;', 'split'),
        L('        for (int i = 0; i < min(a.size(), b.size()) && a[i] == b[i]; i++) lca = a[i];', 'split'),
        L('        return lca;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    boolean path(TreeNode n, int v, List<TreeNode> out) {', 'walk'),
        L('        if (n == null) return false;', 'walk'),
        L('        out.add(n);', 'walk'),
        L('        if (n.val == v || path(n.left, v, out) || path(n.right, v, out)) return true;', 'walk'),
        L('        out.remove(out.size() - 1); return false;', 'walk'),
        L('    }'),
        L('    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {'),
        L('        List<TreeNode> a = new ArrayList<>(), b = new ArrayList<>();', 'init'),
        L('        path(root, p.val, a); path(root, q.val, b);', 'init'),
        L('        TreeNode lca = root;', 'split'),
        L('        for (int i = 0; i < Math.min(a.size(), b.size()) && a.get(i) == b.get(i); i++) lca = a.get(i);', 'split'),
        L('        return lca;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const pv = Number(values.p);
      const qv = Number(values.q);
      if (!Number.isInteger(pv) || !Number.isInteger(qv)) return { error: 'p and q must be integers.' };
      const findPath = (n: TNode | null, v: number, out: TNode[]): boolean => {
        if (!n) return false;
        out.push(n);
        if (n.val === v || findPath(n.left, v, out) || findPath(n.right, v, out)) return true;
        out.pop();
        return false;
      };
      const a: TNode[] = [];
      const b: TNode[] = [];
      if (!findPath(root, pv, a) || !findPath(root, qv, b)) return { error: 'Both p and q must exist in the tree.' };
      const { done, snap } = makeSnap(root);
      const steps: Step[] = [];
      steps.push({ tag: 'init', trace: ['No BST shortcut: record the full root-to-node path for each target.'], state: snap() });
      steps.push({ tag: 'walk', trace: ['Path to ', A(pv), ': ', A(a.map((n) => n.val).join(' → ')), '.'], state: snap({ done: a.map((n) => n.id) }) });
      steps.push({ tag: 'walk', trace: ['Path to ', A(qv), ': ', A(b.map((n) => n.val).join(' → ')), '.'], state: snap({ done: b.map((n) => n.id) }) });
      let lca = root;
      for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) {
        lca = a[i];
        done.push(a[i].id);
        steps.push({ tag: 'split', trace: ['Both paths pass through ', B(a[i].val), '.'], state: snap({ current: a[i].id }) });
      }
      steps.push({ tag: 'ret', trace: ['The paths split after ', C(lca.val), ' — it is the lowest common ancestor.'], state: snap({ current: lca.id }) });
      return { steps, result: String(lca.val), resultDetail: `lowest common ancestor of ${pv} and ${qv}` };
    },
    note: 'Works on any binary tree, but it searches the whole tree twice (O(n)) and stores both paths. In a BST the values tell you which way to go, so the split point is found in O(h) with O(1) memory.',
    complexity: { time: 'O(n)', space: 'O(h)' },
  },
};

/* ================= 65. LCA of a Binary Tree ================= */
const lcaBT: ProblemDef = {
  slug: 'lowest-common-ancestor-of-a-binary-tree',
  title: 'Lowest Common Ancestor of a Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
  technique: 'Post-order search: a node reporting hits from both sides is the answer.',
  widget: 'tree',
  widgetTitle: 'Tree & call stack',
  inputs: [
    { key: 'tree', label: 'Tree (level-order)', defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', wide: true },
    { key: 'p', label: 'p', defaultValue: '5' },
    { key: 'q', label: 'q', defaultValue: '4' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {', 'enter'),
      L('        if (root == nullptr || root == p || root == q)', 'hit'),
      L('            return root;', 'hit'),
      L('        TreeNode* left = lowestCommonAncestor(root->left, p, q);', 'recl'),
      L('        TreeNode* right = lowestCommonAncestor(root->right, p, q);', 'recr'),
      L('        if (left && right) return root;', 'both'),
      L('        return left ? left : right;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {', 'enter'),
      L('        if (root == null || root == p || root == q)', 'hit'),
      L('            return root;', 'hit'),
      L('        TreeNode left = lowestCommonAncestor(root.left, p, q);', 'recl'),
      L('        TreeNode right = lowestCommonAncestor(root.right, p, q);', 'recr'),
      L('        if (left != null && right != null) return root;', 'both'),
      L('        return left != null ? left : right;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const pv = Number(values.p);
    const qv = Number(values.q);
    if (!Number.isInteger(pv) || !Number.isInteger(qv)) return { error: 'p and q must be integers.' };
    const exists = (n: TNode | null, v: number): boolean => !!n && (n.val === v || exists(n.left, v) || exists(n.right, v));
    if (!exists(root, pv) || !exists(root, qv)) return { error: 'Both p and q must exist in the tree.' };

    const { done, stack, snap } = makeSnap(root);
    const steps: Step[] = [];
    let answer: TNode | null = null;
    steps.push({ tag: 'enter', trace: ['No ordering to exploit — search everywhere, and let hits for ', A(pv), ' and ', A(qv), ' bubble upward.'], state: snap() });
    const walk = (n: TNode | null): TNode | null => {
      if (!n || steps.length > MAX_STEPS) return null;
      if (n.val === pv || n.val === qv) {
        steps.push({ tag: 'hit', trace: ['Found ', B(n.val), ' — report this hit upward without searching deeper.'], state: snap({ current: n.id }) });
        done.push(n.id);
        return n;
      }
      stack.push(`lca(${n.val})`);
      steps.push({ tag: 'recl', tag2: 'recr', trace: ['At ', A(n.val), ': search both subtrees.'], state: snap({ current: n.id }) });
      const l = walk(n.left);
      const r = walk(n.right);
      stack.pop();
      if (l && r) {
        if (!answer) answer = n;
        steps.push({
          tag: 'both',
          trace: [C(n.val), ' hears a hit from ', B('both sides'), ' — p and q live in different subtrees. This is the LCA.'],
          state: snap({ current: n.id }),
        });
        return n;
      }
      const res = l ?? r;
      if (res) {
        steps.push({ tag: 'ret', trace: ['At ', A(n.val), ': one hit (from the ', l ? 'left' : 'right', ') — pass ', B(res.val), ' upward.'], state: snap({ current: n.id }) });
      }
      done.push(n.id);
      return res;
    };
    const res = walk(root);
    if (!answer) answer = res;
    return { steps, result: String(answer!.val), resultDetail: `LCA of ${pv} and ${qv}` };
  },
  note: 'Each call answers "does p or q appear in this subtree?" with the node found (or null). The unique node receiving non-null from both children is where the two paths converge — and returning early at p or q handles the "ancestor of itself" case for free.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  brute: {
    label: 'Parent map + ancestor set',
    technique: 'Record every node’s parent, collect all ancestors of p in a set, then climb from q until you hit one.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {'),
        L('        unordered_map<TreeNode*, TreeNode*> parent{{root, nullptr}};', 'enter'),
        L('        stack<TreeNode*> st; st.push(root);', 'enter'),
        L('        while (!st.empty()) {', 'enter'),
        L('            TreeNode* n = st.top(); st.pop();', 'enter'),
        L('            for (TreeNode* c : {n->left, n->right}) if (c) { parent[c] = n; st.push(c); }', 'enter'),
        L('        }'),
        L('        unordered_set<TreeNode*> anc;', 'hit'),
        L('        for (TreeNode* x = p; x; x = parent[x]) anc.insert(x);', 'hit'),
        L('        TreeNode* y = q;', 'up'),
        L('        while (!anc.count(y)) y = parent[y];', 'up'),
        L('        return y;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {'),
        L('        Map<TreeNode, TreeNode> parent = new HashMap<>(); parent.put(root, null);', 'enter'),
        L('        Deque<TreeNode> st = new ArrayDeque<>(List.of(root));', 'enter'),
        L('        while (!st.isEmpty()) {', 'enter'),
        L('            TreeNode n = st.pop();', 'enter'),
        L('            for (TreeNode c : new TreeNode[]{n.left, n.right}) if (c != null) { parent.put(c, n); st.push(c); }', 'enter'),
        L('        }'),
        L('        Set<TreeNode> anc = new HashSet<>();', 'hit'),
        L('        for (TreeNode x = p; x != null; x = parent.get(x)) anc.add(x);', 'hit'),
        L('        TreeNode y = q;', 'up'),
        L('        while (!anc.contains(y)) y = parent.get(y);', 'up'),
        L('        return y;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const levels = parseLevelOrder(values.tree);
      if (typeof levels === 'string') return { error: levels };
      const root = buildTree(levels);
      if (!root) return { error: 'Tree is empty.' };
      const pv = Number(values.p);
      const qv = Number(values.q);
      if (!Number.isInteger(pv) || !Number.isInteger(qv)) return { error: 'p and q must be integers.' };
      const parent = new Map<TNode, TNode | null>([[root, null]]);
      const all: TNode[] = [];
      const st = [root];
      while (st.length) {
        const n = st.pop()!;
        all.push(n);
        for (const c of [n.left, n.right]) if (c) {
          parent.set(c, n);
          st.push(c);
        }
      }
      const p = all.find((n) => n.val === pv);
      const q = all.find((n) => n.val === qv);
      if (!p || !q) return { error: 'Both p and q must exist in the tree.' };
      const { done, snap } = makeSnap(root);
      const steps: Step[] = [];
      steps.push({ tag: 'enter', trace: ['Walk the whole tree once, recording each node’s parent.'], state: snap() });
      const anc = new Set<TNode>();
      for (let x: TNode | null = p; x; x = parent.get(x) ?? null) {
        anc.add(x);
        done.push(x.id);
      }
      steps.push({ tag: 'hit', trace: ['Ancestors of ', A(pv), ' (including itself): ', B([...anc].map((n) => n.val).join(' → ')), '.'], state: snap({ current: p.id }) });
      let y: TNode = q;
      while (!anc.has(y)) {
        steps.push({ tag: 'up', trace: [F(y.val), ' is not an ancestor of ', A(pv), ' — climb to its parent.'], state: snap({ current: y.id }) });
        y = parent.get(y)!;
      }
      steps.push({ tag: 'ret', trace: ['Climbing from ', A(qv), ' first meets ', C(y.val), ' — the lowest common ancestor.'], state: snap({ current: y.id }) });
      return { steps, result: String(y.val), resultDetail: `LCA of ${pv} and ${qv}` };
    },
    note: 'O(n) time like the recursive solution, but it stores a parent pointer for every node and a set of ancestors — O(n) memory. The single post-order recursion needs only the call stack.',
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
};

/* ================= 67. Binary Tree Right Side View ================= */
const rightSideView: ProblemDef = {
  slug: 'binary-tree-right-side-view',
  title: 'Binary Tree Right Side View',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/binary-tree-right-side-view/',
  technique: 'BFS by levels — the last node dequeued in each level is the one visible from the right.',
  widget: 'tree',
  widgetTitle: 'Tree & BFS queue',
  inputs: treeInput('1, 2, 3, null, 5, null, 4'),
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> rightSideView(TreeNode* root) {'),
      L('        vector<int> res;', 'init'),
      L('        if (!root) return res;', 'init'),
      L('        queue<TreeNode*> q;', 'init'),
      L('        q.push(root);', 'init'),
      L('        while (!q.empty()) {', 'loop'),
      L('            int sz = q.size();', 'level'),
      L('            for (int i = 0; i < sz; i++) {', 'level'),
      L('                TreeNode* node = q.front(); q.pop();', 'pop'),
      L('                if (i == sz - 1)', 'take'),
      L('                    res.push_back(node->val);', 'take'),
      L('                if (node->left) q.push(node->left);', 'push'),
      L('                if (node->right) q.push(node->right);', 'push'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> rightSideView(TreeNode root) {'),
      L('        List<Integer> res = new ArrayList<>();', 'init'),
      L('        if (root == null) return res;', 'init'),
      L('        Queue<TreeNode> q = new LinkedList<>();', 'init'),
      L('        q.add(root);', 'init'),
      L('        while (!q.isEmpty()) {', 'loop'),
      L('            int sz = q.size();', 'level'),
      L('            for (int i = 0; i < sz; i++) {', 'level'),
      L('                TreeNode node = q.poll();', 'pop'),
      L('                if (i == sz - 1)', 'take'),
      L('                    res.add(node.val);', 'take'),
      L('                if (node.left != null) q.add(node.left);', 'push'),
      L('                if (node.right != null) q.add(node.right);', 'push'),
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
    const layout = layoutTree(root);
    const steps: Step[] = [];
    const done: number[] = [];
    const res: number[] = [];
    let queue: TNode[] = [root];
    const snap = (current: number | null): TreeState => ({
      nodes: layout.nodes,
      edges: layout.edges,
      current,
      done: [...done],
      queued: queue.map((n) => n.id),
      stack: queue.map((n) => ({ text: `node ${n.val}` })),
      stackTitle: 'Queue (front last)',
      aggs: [{ label: 'right view', value: `[${res.join(', ')}]`, c: 'c' }],
    });
    steps.push({ tag: 'init', trace: ['Standard level-order BFS — but only the ', A('last node of each level'), ' makes it into the answer.'], state: snap(null) });
    while (queue.length > 0 && steps.length < MAX_STEPS) {
      const sz = queue.length;
      steps.push({ tag: 'level', trace: ['Next level has ', A(sz), ' node(s).'], state: snap(null) });
      for (let i = 0; i < sz; i++) {
        const node = queue.shift()!;
        if (i === sz - 1) {
          res.push(node.val);
          steps.push({ tag: 'take', trace: [B(node.val), ' is the level\'s rightmost node — visible from the right. Take it.'], state: snap(node.id) });
        } else {
          steps.push({ tag: 'pop', trace: [F(node.val), ' is hidden behind nodes to its right — skip.'], state: snap(node.id) });
        }
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
        done.push(node.id);
      }
    }
    steps.push({ tag: 'ret', trace: ['Right-side view, top to bottom: ', C(`[${res.join(', ')}]`), '.'], state: snap(null) });
    return { steps, result: `[${res.join(', ')}]` };
  },
  note: 'The right-side view is one node per depth — the rightmost. BFS hands you levels as clean batches, so "last one dequeued this level" is exactly the visible node, with no depth bookkeeping.',
  complexity: { time: 'O(n)', space: 'O(w)' },
  brute: {
    label: 'DFS, right child first',
    technique: 'Depth-first search visiting the right child before the left; the first node reached at each new depth is the one you can see.',
    code: {
      cpp: [
        L('class Solution {'),
        L('    void dfs(TreeNode* n, int depth, vector<int>& res) {', 'pop'),
        L('        if (!n) return;', 'pop'),
        L('        if (depth == res.size()) res.push_back(n->val);', 'see'),
        L('        dfs(n->right, depth + 1, res);', 'push'),
        L('        dfs(n->left, depth + 1, res);', 'push'),
        L('    }'),
        L('public:'),
        L('    vector<int> rightSideView(TreeNode* root) {'),
        L('        vector<int> res; dfs(root, 0, res); return res;', 'init', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    void dfs(TreeNode n, int depth, List<Integer> res) {', 'pop'),
        L('        if (n == null) return;', 'pop'),
        L('        if (depth == res.size()) res.add(n.val);', 'see'),
        L('        dfs(n.right, depth + 1, res);', 'push'),
        L('        dfs(n.left, depth + 1, res);', 'push'),
        L('    }'),
        L('    public List<Integer> rightSideView(TreeNode root) {'),
        L('        List<Integer> res = new ArrayList<>(); dfs(root, 0, res); return res;', 'init', 'ret'),
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
      const res: number[] = [];
      const seen: number[] = [];
      const visited: number[] = [];
      const steps: Step[] = [];
      const snap = (current: number | null): TreeState => ({
        nodes: layout.nodes,
        edges: layout.edges,
        current,
        done: [...seen],
        queued: [...visited],
        aggs: [{ label: 'visible', value: `[${res.join(', ')}]`, c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['No queue: DFS right-first. The first node reached at a new depth is the rightmost one there.'], state: snap(null) });
      const dfs = (n: TNode | null, depth: number) => {
        if (!n || steps.length > MAX_STEPS) return;
        visited.push(n.id);
        if (depth === res.length) {
          res.push(n.val);
          seen.push(n.id);
          steps.push({ tag: 'see', trace: ['First visit to depth ', A(depth), ' is ', B(n.val), ' — it is visible from the right.'], state: snap(n.id) });
        } else {
          steps.push({ tag: 'pop', trace: [F(n.val), ' is at depth ', A(depth), ', already covered by a node further right.'], state: snap(n.id) });
        }
        dfs(n.right, depth + 1);
        dfs(n.left, depth + 1);
      };
      dfs(root, 0);
      steps.push({ tag: 'ret', trace: ['Right side view: ', C(`[${res.join(', ')}]`), '.'], state: snap(null) });
      return { steps, result: `[${res.join(', ')}]` };
    },
    note: 'Same O(n) as the level-order BFS, but using recursion depth instead of a queue. Visiting right before left is what guarantees the first node at each depth is the rightmost one.',
    complexity: { time: 'O(n)', space: 'O(h) recursion' },
  },
};

export const trees2 = [diameter, balanced, sameTree, subtreeOf, lcaBST, lcaBT, rightSideView];
