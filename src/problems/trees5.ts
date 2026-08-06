// Trees, part 5 — construction, restructuring and binary-search-tree operations.
import type { ProblemDef, Step, TreeState } from '../lib/types';
import { parseInt1, parseIntArray, parseLevelOrder } from '../lib/parse';
import { buildTree, layoutTree, type TNode } from '../lib/tree';
import { A, B, C, F, L } from '../lib/trace';

const MAX_STEPS = 340;

const snap = (root: TNode | null, extra?: Partial<TreeState>): TreeState => ({ ...layoutTree(root), ...extra });

const allIds = (n: TNode | null): number[] => (n ? [n.id, ...allIds(n.left), ...allIds(n.right)] : []);

/* ================= Construct Binary Tree from Inorder and Postorder ================= */
const buildFromInPost: ProblemDef = {
  slug: 'construct-binary-tree-from-inorder-and-postorder-traversal',
  title: 'Construct Binary Tree from Inorder and Postorder Traversal',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/',
  technique: "Postorder's last value is the root; inorder tells you how the rest splits into two subtrees.",
  widget: 'tree',
  widgetTitle: 'Tree being reconstructed',
  inputs: [
    { key: 'inorder', label: 'Inorder', defaultValue: '9, 3, 15, 20, 7', wide: true },
    { key: 'postorder', label: 'Postorder', defaultValue: '9, 15, 7, 20, 3', wide: true },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    unordered_map<int,int> pos; int idx;'),
      L('public:'),
      L('    TreeNode* buildTree(vector<int>& in, vector<int>& post) {'),
      L('        for (int i = 0; i < in.size(); i++) pos[in[i]] = i;', 'index'),
      L('        idx = post.size() - 1;', 'index'),
      L('        return build(post, 0, in.size() - 1);', 'start'),
      L('    }'),
      L('    TreeNode* build(vector<int>& post, int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return nullptr;', 'empty'),
      L('        int val = post[idx--];', 'root'),
      L('        TreeNode* node = new TreeNode(val);'),
      L('        int mid = pos[val];', 'split'),
      L('        node->right = build(post, mid + 1, hi);   // right first!', 'right'),
      L('        node->left  = build(post, lo, mid - 1);', 'left'),
      L('        return node;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    Map<Integer,Integer> pos = new HashMap<>(); int idx;'),
      L('    int[] post;'),
      L('    public TreeNode buildTree(int[] in, int[] postorder) {'),
      L('        post = postorder;'),
      L('        for (int i = 0; i < in.length; i++) pos.put(in[i], i);', 'index'),
      L('        idx = post.length - 1;', 'index'),
      L('        return build(0, in.length - 1);', 'start'),
      L('    }'),
      L('    TreeNode build(int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return null;', 'empty'),
      L('        int val = post[idx--];', 'root'),
      L('        TreeNode node = new TreeNode(val);'),
      L('        int mid = pos.get(val);', 'split'),
      L('        node.right = build(mid + 1, hi);          // right first!', 'right'),
      L('        node.left  = build(lo, mid - 1);', 'left'),
      L('        return node;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const inorder = parseIntArray(values.inorder, { maxLen: 9 });
    if (typeof inorder === 'string') return { error: inorder };
    const postorder = parseIntArray(values.postorder, { maxLen: 9 });
    if (typeof postorder === 'string') return { error: postorder };
    if (inorder.length !== postorder.length) return { error: 'Both traversals must have the same length.' };
    if (new Set(inorder).size !== inorder.length) return { error: 'Values must be distinct.' };
    if ([...inorder].sort((a, b) => a - b).join() !== [...postorder].sort((a, b) => a - b).join()) {
      return { error: 'Both traversals must contain the same values.' };
    }
    const pos = new Map(inorder.map((v, i) => [v, i]));
    let idx = postorder.length - 1;
    let nextId = 0;
    let root: TNode | null = null;
    const steps: Step[] = [];
    const placed: number[] = [];
    const view = (cur: number | null, note: string): TreeState =>
      snap(root, {
        current: cur,
        done: [...placed],
        stack: [{ text: note }],
        stackTitle: 'current segment',
        aggs: [
          { label: 'inorder', value: inorder.join(', '), c: 'a' },
          { label: 'postorder', value: postorder.join(', '), c: 'b' },
          { label: 'next root taken from', value: idx >= 0 ? `postorder[${idx}] = ${postorder[idx]}` : '— exhausted —', c: 'c' },
        ],
      });
    steps.push({
      tag: 'index',
      trace: [
        'Postorder ends with the ', A('root'), '. Inorder puts everything left of a node in its left subtree and everything right in its right subtree — together that pins down the shape.',
      ],
      state: view(null, 'about to start'),
    });
    const build = (lo: number, hi: number): TNode | null => {
      if (steps.length > MAX_STEPS) return null;
      if (lo > hi) {
        steps.push({ tag: 'empty', trace: ['Empty inorder range — nothing to build here.'], state: view(null, `range [${lo}..${hi}] is empty`) });
        return null;
      }
      const val = postorder[idx--];
      const node: TNode = { id: nextId++, val, left: null, right: null };
      if (!root) root = node;
      const mid = pos.get(val)!;
      steps.push({
        tag: 'root',
        trace: ['Take ', A(val), ' from the end of the unused postorder — it is the root of inorder range [', A(lo), '..', A(hi), '].'],
        state: view(node.id, `root ${val} for inorder [${inorder.slice(lo, hi + 1).join(', ')}]`),
      });
      placed.push(node.id);
      steps.push({
        tag: 'split',
        trace: [
          'Find ', A(val), ' in inorder at index ', B(mid), ': left subtree is [', B(inorder.slice(lo, mid).join(', ') || '—'), '], right subtree is [',
          B(inorder.slice(mid + 1, hi + 1).join(', ') || '—'), '].',
        ],
        state: view(node.id, `split at inorder index ${mid}`),
      });
      steps.push({
        tag: 'right',
        trace: ['Build the ', A('right'), ' subtree first — postorder is being consumed backwards, so the right child is the next value up.'],
        state: view(node.id, `building right of ${val}`),
      });
      node.right = build(mid + 1, hi);
      steps.push({ tag: 'left', trace: ['Now the ', A('left'), ' subtree of ', A(val), '.'], state: view(node.id, `building left of ${val}`) });
      node.left = build(lo, mid - 1);
      return node;
    };
    build(0, inorder.length - 1);
    steps.push({
      tag: 'ret',
      trace: ['Tree fully reconstructed from the two traversals.'],
      state: snap(root, { done: allIds(root) }),
    });
    const levelOut: (number | null)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        levelOut.push(null);
        continue;
      }
      levelOut.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    return { steps, result: `[${levelOut.map((v) => (v === null ? 'null' : v)).join(', ')}]`, resultDetail: 'level order' };
  },
  note: 'Consuming postorder from the back means you meet each node before its children, but right-to-left — which is exactly why the right subtree must be built before the left. Swap those two lines and the tree comes out mirrored on every level.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Flatten Binary Tree to Linked List ================= */
const flattenTree: ProblemDef = {
  slug: 'flatten-binary-tree-to-linked-list',
  title: 'Flatten Binary Tree to Linked List',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/',
  technique: 'Morris-style: splice the left subtree between a node and its right child, then move on.',
  widget: 'tree',
  widgetTitle: 'Tree flattening in place',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '1, 2, 5, 3, 4, null, 6', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void flatten(TreeNode* root) {'),
      L('        TreeNode* cur = root;', 'init'),
      L('        while (cur) {', 'loop'),
      L('            if (cur->left) {', 'hasLeft'),
      L('                TreeNode* pre = cur->left;'),
      L('                while (pre->right) pre = pre->right;', 'rightmost'),
      L('                pre->right = cur->right;', 'splice'),
      L('                cur->right = cur->left;', 'splice'),
      L('                cur->left = nullptr;', 'splice'),
      L('            }'),
      L('            cur = cur->right;', 'advance'),
      L('        }'),
      L('    }', 'ret'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void flatten(TreeNode root) {'),
      L('        TreeNode cur = root;', 'init'),
      L('        while (cur != null) {', 'loop'),
      L('            if (cur.left != null) {', 'hasLeft'),
      L('                TreeNode pre = cur.left;'),
      L('                while (pre.right != null) pre = pre.right;', 'rightmost'),
      L('                pre.right = cur.right;', 'splice'),
      L('                cur.right = cur.left;', 'splice'),
      L('                cur.left = null;', 'splice'),
      L('            }'),
      L('            cur = cur.right;', 'advance'),
      L('        }'),
      L('    }', 'ret'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 10);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const done: number[] = [];
    const view = (cur: TNode | null, queued: number[] = []): TreeState =>
      snap(root, { current: cur ? cur.id : null, done: [...done], queued });
    steps.push({
      tag: 'init',
      trace: [
        'The target order is ', A('preorder'), ', laid out along right pointers. Rather than recursing, rewire as we walk — no stack, no extra memory.',
      ],
      state: view(root),
    });
    let cur: TNode | null = root;
    while (cur) {
      steps.push({ tag: 'loop', trace: ['At node ', A(cur.val), '.'], state: view(cur) });
      if (cur.left) {
        steps.push({
          tag: 'hasLeft',
          trace: ['It has a left subtree, which must come ', A('immediately after'), ' it in preorder.'],
          state: view(cur, allIds(cur.left)),
        });
        let pre = cur.left;
        while (pre.right) pre = pre.right;
        steps.push({
          tag: 'rightmost',
          trace: [
            'Find the ', B('rightmost'), ' node of that left subtree — ', B(pre.val), '. It is the last node of the left subtree in preorder, so the old right subtree hangs off it.',
          ],
          state: view(cur, [pre.id]),
        });
        pre.right = cur.right;
        cur.right = cur.left;
        cur.left = null;
        steps.push({
          tag: 'splice',
          trace: ['Splice: ', B(pre.val), ' now points at the old right subtree, the left subtree becomes the right child, and the left pointer is cleared.'],
          state: view(cur),
        });
      }
      done.push(cur.id);
      cur = cur.right;
      steps.push({
        tag: 'advance',
        trace: cur ? ['Step right to ', A(cur.val), '.'] : ['No right child — the list is complete.'],
        state: view(cur),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const chain: number[] = [];
    let walk: TNode | null = root;
    while (walk) {
      chain.push(walk.val);
      walk = walk.right;
    }
    steps.push({
      tag: 'ret',
      trace: ['Flattened into a right-leaning chain: ', C(chain.join(' → ')), '.'],
      state: snap(root, { done: allIds(root) }),
    });
    return { steps, result: chain.join(' → ') };
  },
  note: 'This is the Morris traversal idea reused for restructuring: the rightmost node of the left subtree is exactly where the old right subtree belongs, so one relink handles a whole subtree. The recursive version is easier to write but costs O(h) stack; this one is genuinely O(1) space.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= Populating Next Right Pointers in Each Node ================= */
const nextRightPointers: ProblemDef = {
  slug: 'populating-next-right-pointers-in-each-node',
  title: 'Populating Next Right Pointers in Each Node',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/',
  technique: 'Use the next pointers of the level above as a ready-made queue for the level below.',
  widget: 'tree',
  widgetTitle: 'Perfect tree with next pointers',
  inputs: [{ key: 'tree', label: 'Level-order (perfect tree)', defaultValue: '1, 2, 3, 4, 5, 6, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    Node* connect(Node* root) {'),
      L('        Node* head = root;', 'init'),
      L('        while (head && head->left) {', 'level'),
      L('            for (Node* n = head; n; n = n->next) {', 'walk'),
      L('                n->left->next = n->right;', 'sibling'),
      L('                if (n->next)', 'cousin'),
      L('                    n->right->next = n->next->left;', 'cousin'),
      L('            }'),
      L('            head = head->left;', 'down'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public Node connect(Node root) {'),
      L('        Node head = root;', 'init'),
      L('        while (head != null && head.left != null) {', 'level'),
      L('            for (Node n = head; n != null; n = n.next) {', 'walk'),
      L('                n.left.next = n.right;', 'sibling'),
      L('                if (n.next != null)', 'cousin'),
      L('                    n.right.next = n.next.left;', 'cousin'),
      L('            }'),
      L('            head = head.left;', 'down'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 15);
    if (typeof levels === 'string') return { error: levels };
    if (levels.some((v) => v === null)) return { error: 'This version assumes a perfect tree — remove the nulls.' };
    if (![1, 3, 7, 15].includes(levels.length)) return { error: 'A perfect tree has 1, 3, 7 or 15 nodes.' };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const nextOf = new Map<number, TNode>();
    const linked: number[] = [];
    const view = (cur: TNode | null, mark: number[] = []): TreeState =>
      snap(root, {
        nodes: layoutTree(root).nodes.map((nd) => ({ ...nd, badge: nextOf.has(nd.id) ? `→${nextOf.get(nd.id)!.val}` : undefined })),
        current: cur ? cur.id : null,
        done: [...linked],
        queued: mark,
        aggs: [{ label: 'links made', value: String(nextOf.size), c: 'c' }],
      });
    steps.push({
      tag: 'init',
      trace: [
        'A BFS queue would cost O(n) memory. Instead, once a level is linked it ', A('is'), ' a queue — walk it with next and wire up the level below for free.',
      ],
      state: view(root),
    });
    let head: TNode | null = root;
    while (head && head.left) {
      steps.push({ tag: 'level', trace: ['Start of a level, leftmost node is ', A(head.val), '. Wire up its children\'s level.'], state: view(head) });
      let n: TNode | null = head;
      while (n) {
        steps.push({ tag: 'walk', trace: ['At ', A(n.val), ' — it has two children to connect.'], state: view(n, [n.left!.id, n.right!.id]) });
        nextOf.set(n.left!.id, n.right!);
        linked.push(n.left!.id);
        steps.push({
          tag: 'sibling',
          trace: ['Its own two children are siblings — link ', B(n.left!.val), ' → ', B(n.right!.val), '.'],
          state: view(n, [n.left!.id, n.right!.id]),
        });
        const nxt: TNode | undefined = nextOf.get(n.id);
        if (nxt) {
          nextOf.set(n.right!.id, nxt.left!);
          linked.push(n.right!.id);
          steps.push({
            tag: 'cousin',
            trace: [
              'The gap between cousins is the hard part — but ', A(n.val), ' already knows its own next (', A(nxt.val), '), so link ', B(n.right!.val), ' → ', B(nxt.left!.val), '.',
            ],
            state: view(n, [n.right!.id, nxt.left!.id]),
          });
        }
        n = nextOf.get(n.id) ?? null;
        if (steps.length > MAX_STEPS) break;
      }
      head = head.left;
      steps.push({ tag: 'down', trace: ['Level done — drop to its leftmost child ', A(head!.val), ' and repeat.'], state: view(head) });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Every node now points to its right neighbour, ', C(nextOf.size), ' link(s) in total — using ', C('O(1)'), ' extra space.'],
      state: view(null),
    });
    const rows: string[] = [];
    let h: TNode | null = root;
    while (h) {
      const row: number[] = [];
      let n: TNode | null = h;
      while (n) {
        row.push(n.val);
        n = nextOf.get(n.id) ?? null;
      }
      rows.push(row.join(' → ') + ' → #');
      h = h.left;
    }
    return { steps, result: rows.join('  |  ') };
  },
  note: 'The level above is fully linked before the level below is touched, which is what makes the cousin connection possible in constant space — n.next.left is reachable only because n.next was set on the previous pass. In the general (non-perfect) version this same idea still works, but you need a dummy head to skip over missing children.',
  complexity: { time: 'O(n)', space: 'O(1)' },
};

/* ================= All Nodes Distance K in Binary Tree ================= */
const distanceK: ProblemDef = {
  slug: 'all-nodes-distance-k-in-binary-tree',
  title: 'All Nodes Distance K in Binary Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/',
  technique: 'Add parent pointers so the tree becomes an undirected graph, then BFS k levels from the target.',
  widget: 'tree',
  widgetTitle: 'Tree as an undirected graph',
  inputs: [
    { key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', wide: true },
    { key: 'target', label: 'Target node value', defaultValue: '5' },
    { key: 'k', label: 'Distance k', defaultValue: '2' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    unordered_map<TreeNode*, TreeNode*> par;'),
      L('public:'),
      L('    vector<int> distanceK(TreeNode* root, TreeNode* target, int k) {'),
      L('        mark(root, nullptr);', 'parents'),
      L('        queue<TreeNode*> q; q.push(target);', 'bfs'),
      L('        unordered_set<TreeNode*> seen{target};'),
      L('        int d = 0;'),
      L('        while (!q.empty()) {', 'level'),
      L('            if (d == k) break;', 'level'),
      L('            for (int i = q.size(); i > 0; i--) {', 'expand'),
      L('                TreeNode* n = q.front(); q.pop();'),
      L('                for (TreeNode* nb : {n->left, n->right, par[n]})', 'expand'),
      L('                    if (nb && seen.insert(nb).second) q.push(nb);', 'expand'),
      L('            }'),
      L('            d++;', 'level'),
      L('        }'),
      L('        vector<int> res;'),
      L('        while (!q.empty()) { res.push_back(q.front()->val); q.pop(); }', 'ret'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    Map<TreeNode,TreeNode> par = new HashMap<>();'),
      L('    public List<Integer> distanceK(TreeNode root, TreeNode target, int k) {'),
      L('        mark(root, null);', 'parents'),
      L('        Queue<TreeNode> q = new LinkedList<>(); q.add(target);', 'bfs'),
      L('        Set<TreeNode> seen = new HashSet<>(); seen.add(target);'),
      L('        int d = 0;'),
      L('        while (!q.isEmpty()) {', 'level'),
      L('            if (d == k) break;', 'level'),
      L('            for (int i = q.size(); i > 0; i--) {', 'expand'),
      L('                TreeNode n = q.remove();'),
      L('                for (TreeNode nb : new TreeNode[]{n.left, n.right, par.get(n)})', 'expand'),
      L('                    if (nb != null && seen.add(nb)) q.add(nb);', 'expand'),
      L('            }'),
      L('            d++;', 'level'),
      L('        }'),
      L('        List<Integer> res = new ArrayList<>();'),
      L('        for (TreeNode n : q) res.add(n.val);', 'ret'),
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
    const targetVal = parseInt1(values.target, 'Target node value');
    if (typeof targetVal === 'string') return { error: targetVal };
    const k = parseInt1(values.k, 'k', { min: 0, max: 6 });
    if (typeof k === 'string') return { error: k };
    const parent = new Map<number, TNode>();
    const byId = new Map<number, TNode>();
    const mark = (n: TNode | null, p: TNode | null) => {
      if (!n) return;
      byId.set(n.id, n);
      if (p) parent.set(n.id, p);
      mark(n.left, n);
      mark(n.right, n);
    };
    mark(root, null);
    const target = [...byId.values()].find((n) => n.val === targetVal);
    if (!target) return { error: `No node has value ${targetVal}.` };

    const steps: Step[] = [];
    const seen = new Set<number>([target.id]);
    let frontier: TNode[] = [target];
    let d = 0;
    const view = (extra: { label: string; value: string; c: 'a' | 'b' | 'c' }[] = []): TreeState =>
      snap(root, {
        current: target.id,
        done: [...seen].filter((id) => !frontier.some((n) => n.id === id)),
        queued: frontier.map((n) => n.id),
        aggs: [{ label: 'distance', value: `${d} / ${k}`, c: 'a' }, ...extra],
      });
    steps.push({
      tag: 'parents',
      trace: [
        'Distance can go ', A('upward'), ' too, but tree nodes only point down. Record every node\'s parent first — that turns the tree into an undirected graph.',
      ],
      state: view(),
    });
    steps.push({
      tag: 'bfs',
      trace: ['BFS from the target ', A(target.val), '. Level ', A('d'), ' of the search is exactly the set of nodes at distance ', A('d'), '.'],
      state: view(),
    });
    while (frontier.length && d < k) {
      const next: TNode[] = [];
      for (const n of frontier) {
        const nbrs = [n.left, n.right, parent.get(n.id) ?? null].filter((x): x is TNode => !!x);
        const fresh = nbrs.filter((nb) => !seen.has(nb.id));
        for (const nb of fresh) {
          seen.add(nb.id);
          next.push(nb);
        }
        steps.push({
          tag: 'expand',
          trace: [
            'From ', A(n.val), ', neighbours are ', B(nbrs.map((x) => x.val).join(', ') || 'none'), fresh.length ? [' — new: ', B(fresh.map((x) => x.val).join(', '))].join('') : ' — all already seen',
            '.',
          ],
          state: view(),
        });
        if (steps.length > MAX_STEPS) break;
      }
      frontier = next;
      d++;
      steps.push({
        tag: 'level',
        trace: ['Now at distance ', A(d), ': ', B(frontier.map((n) => n.val).join(', ') || 'nothing left'), '.'],
        state: view(),
      });
      if (steps.length > MAX_STEPS) break;
    }
    const res = frontier.map((n) => n.val);
    steps.push({
      tag: 'ret',
      trace: res.length ? ['Nodes at distance ', C(k), ' from ', C(targetVal), ': ', C(res.join(', ')), '.'] : ['No node sits at distance ', C(k), ' from ', C(targetVal), '.'],
      state: view(),
    });
    return { steps, result: res.length ? `[${res.join(', ')}]` : '[]' };
  },
  note: 'The seen set is doing double duty: it prevents BFS from bouncing back down the edge it just came up, which without it would revisit the target on step two and loop forever. Once parents exist, this is a completely ordinary graph BFS — the tree structure stops mattering.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Vertical Order Traversal ================= */
const verticalOrder: ProblemDef = {
  slug: 'vertical-order-traversal-of-a-binary-tree',
  title: 'Vertical Order Traversal of a Binary Tree',
  category: 'Trees',
  difficulty: 'Hard',
  leetcode: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/',
  technique: 'Tag every node with (column, row), then sort by column, then row, then value.',
  widget: 'tree',
  widgetTitle: 'Tree with (column, row) tags',
  inputs: [{ key: 'tree', label: 'Level-order (null = gap)', defaultValue: '3, 9, 20, null, null, 15, 7', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<array<int,3>> nodes;   // {col, row, val}'),
      L('public:'),
      L('    vector<vector<int>> verticalTraversal(TreeNode* root) {'),
      L('        dfs(root, 0, 0);', 'tag'),
      L('        sort(nodes.begin(), nodes.end());', 'sort'),
      L('        vector<vector<int>> res;'),
      L('        for (int i = 0; i < nodes.size(); ) {', 'group'),
      L('            int col = nodes[i][0]; vector<int> colVals;'),
      L('            while (i < nodes.size() && nodes[i][0] == col)', 'group'),
      L('                colVals.push_back(nodes[i++][2]);', 'group'),
      L('            res.push_back(colVals);'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode* n, int col, int row) {', 'tag'),
      L('        if (!n) return;'),
      L('        nodes.push_back({col, row, n->val});', 'tag'),
      L('        dfs(n->left, col - 1, row + 1);', 'tag'),
      L('        dfs(n->right, col + 1, row + 1);', 'tag'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<int[]> nodes = new ArrayList<>();   // {col, row, val}'),
      L('    public List<List<Integer>> verticalTraversal(TreeNode root) {'),
      L('        dfs(root, 0, 0);', 'tag'),
      L('        nodes.sort((a, b) -> a[0] != b[0] ? a[0]-b[0]', 'sort'),
      L('                 : a[1] != b[1] ? a[1]-b[1] : a[2]-b[2]);', 'sort'),
      L('        List<List<Integer>> res = new ArrayList<>();'),
      L('        for (int i = 0; i < nodes.size(); ) {', 'group'),
      L('            int col = nodes.get(i)[0];'),
      L('            List<Integer> colVals = new ArrayList<>();'),
      L('            while (i < nodes.size() && nodes.get(i)[0] == col)', 'group'),
      L('                colVals.add(nodes.get(i++)[2]);', 'group'),
      L('            res.add(colVals);'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('    void dfs(TreeNode n, int col, int row) {', 'tag'),
      L('        if (n == null) return;'),
      L('        nodes.add(new int[]{col, row, n.val});', 'tag'),
      L('        dfs(n.left, col - 1, row + 1);', 'tag'),
      L('        dfs(n.right, col + 1, row + 1);', 'tag'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 13);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const steps: Step[] = [];
    const tagged: { id: number; col: number; row: number; val: number }[] = [];
    const view = (cur: number | null): TreeState =>
      snap(root, {
        nodes: layoutTree(root).nodes.map((nd) => {
          const t = tagged.find((x) => x.id === nd.id);
          return { ...nd, badge: t ? `${t.col},${t.row}` : undefined };
        }),
        current: cur,
        done: tagged.map((t) => t.id),
        aggs: [{ label: 'tagged (col,row,val)', value: tagged.map((t) => `(${t.col},${t.row},${t.val})`).join(' ') || '—', c: 'b' }],
      });
    steps.push({
      tag: 'tag',
      trace: [
        'Give the root column ', A(0), '. Going left is ', A('col − 1'), ', going right is ', A('col + 1'), ', and every step down is ', B('row + 1'), '.',
      ],
      state: view(root.id),
    });
    const dfs = (n: TNode | null, col: number, row: number) => {
      if (!n || steps.length > MAX_STEPS) return;
      tagged.push({ id: n.id, col, row, val: n.val });
      steps.push({
        tag: 'tag',
        trace: ['Node ', A(n.val), ' sits at column ', B(col), ', row ', B(row), '.'],
        state: view(n.id),
      });
      dfs(n.left, col - 1, row + 1);
      dfs(n.right, col + 1, row + 1);
    };
    dfs(root, 0, 0);
    const sorted = [...tagged].sort((a, b) => a.col - b.col || a.row - b.row || a.val - b.val);
    steps.push({
      tag: 'sort',
      trace: [
        'Sort by column, then row, then ', A('value'), '. That last key is the subtle one: two nodes can share a cell, and the problem wants the smaller value first.',
      ],
      state: snap(root, {
        nodes: layoutTree(root).nodes.map((nd) => {
          const t = tagged.find((x) => x.id === nd.id);
          return { ...nd, badge: t ? `${t.col},${t.row}` : undefined };
        }),
        done: tagged.map((t) => t.id),
        aggs: [{ label: 'sorted', value: sorted.map((t) => `(${t.col},${t.row},${t.val})`).join(' '), c: 'b' }],
      }),
    });
    const cols: number[][] = [];
    let i = 0;
    while (i < sorted.length) {
      const col = sorted[i].col;
      const vals: number[] = [];
      const ids: number[] = [];
      while (i < sorted.length && sorted[i].col === col) {
        vals.push(sorted[i].val);
        ids.push(sorted[i].id);
        i++;
      }
      cols.push(vals);
      steps.push({
        tag: 'group',
        trace: ['Column ', A(col), ' reads top to bottom as [', B(vals.join(', ')), '].'],
        state: snap(root, { done: ids, aggs: [{ label: `column ${col}`, value: vals.join(', '), c: 'b' }] }),
      });
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: ['Vertical order: ', C(cols.map((c) => `[${c.join(',')}]`).join(' ')), '.'],
      state: snap(root, { done: allIds(root), aggs: [{ label: 'result', value: cols.map((c) => `[${c.join(',')}]`).join(' '), c: 'c' }] }),
    });
    return { steps, result: cols.map((c) => `[${c.join(',')}]`).join(', ') };
  },
  note: 'This is rated hard purely because of the tie-break: nodes at the same (column, row) must be ordered by value, not by traversal order — which is what separates it from the easier "vertical order traversal" variant. Collecting triples and sorting once keeps that rule in a single comparator instead of scattered through the traversal.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

/* ================= Convert Sorted Array to Binary Search Tree ================= */
const sortedArrayToBST: ProblemDef = {
  slug: 'convert-sorted-array-to-binary-search-tree',
  title: 'Convert Sorted Array to Binary Search Tree',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/',
  technique: 'Take the middle element as the root — that splits the array into two equal halves.',
  widget: 'tree',
  widgetTitle: 'BST being built',
  inputs: [{ key: 'nums', label: 'Sorted array', defaultValue: '-10, -3, 0, 5, 9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* sortedArrayToBST(vector<int>& a) {'),
      L('        return build(a, 0, a.size() - 1);', 'start'),
      L('    }'),
      L('    TreeNode* build(vector<int>& a, int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return nullptr;', 'empty'),
      L('        int mid = lo + (hi - lo) / 2;', 'mid'),
      L('        TreeNode* n = new TreeNode(a[mid]);', 'make'),
      L('        n->left  = build(a, lo, mid - 1);', 'left'),
      L('        n->right = build(a, mid + 1, hi);', 'right'),
      L('        return n;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode sortedArrayToBST(int[] a) {'),
      L('        return build(a, 0, a.length - 1);', 'start'),
      L('    }'),
      L('    TreeNode build(int[] a, int lo, int hi) {', 'enter'),
      L('        if (lo > hi) return null;', 'empty'),
      L('        int mid = lo + (hi - lo) / 2;', 'mid'),
      L('        TreeNode n = new TreeNode(a[mid]);', 'make'),
      L('        n.left  = build(a, lo, mid - 1);', 'left'),
      L('        n.right = build(a, mid + 1, hi);', 'right'),
      L('        return n;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const a = parseIntArray(values.nums, { maxLen: 9 });
    if (typeof a === 'string') return { error: a };
    for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) return { error: 'The array must be sorted and strictly increasing.' };
    const steps: Step[] = [];
    let nextId = 0;
    let root: TNode | null = null;
    const placed: number[] = [];
    const view = (cur: number | null, note: string): TreeState =>
      snap(root, {
        current: cur,
        done: [...placed],
        stack: [{ text: note }],
        stackTitle: 'current slice',
        aggs: [{ label: 'array', value: a.join(', '), c: 'a' }],
      });
    steps.push({
      tag: 'start',
      trace: ['Any middle element makes a valid BST, but picking the ', A('exact middle'), ' keeps the two halves equal — that is what makes the tree height-balanced.'],
      state: view(null, `full range [0..${a.length - 1}]`),
    });
    const build = (lo: number, hi: number): TNode | null => {
      if (steps.length > MAX_STEPS) return null;
      if (lo > hi) {
        steps.push({ tag: 'empty', trace: ['Empty slice — this child is null.'], state: view(null, `[${lo}..${hi}] is empty`) });
        return null;
      }
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({
        tag: 'mid',
        trace: ['Slice [', A(a.slice(lo, hi + 1).join(', ')), '] — its middle is ', B(a[mid]), ' at index ', B(mid), '.'],
        state: view(null, `[${a.slice(lo, hi + 1).join(', ')}] → root ${a[mid]}`),
      });
      const n: TNode = { id: nextId++, val: a[mid], left: null, right: null };
      if (!root) root = n;
      placed.push(n.id);
      steps.push({
        tag: 'make',
        trace: [B(a[mid]), ' becomes a node. Everything to its left is smaller, everything to its right is larger — the BST property holds automatically.'],
        state: view(n.id, `node ${a[mid]}`),
      });
      steps.push({ tag: 'left', trace: ['Build its left child from [', A(a.slice(lo, mid).join(', ') || '—'), '].'], state: view(n.id, `left of ${a[mid]}`) });
      n.left = build(lo, mid - 1);
      steps.push({ tag: 'right', trace: ['Build its right child from [', A(a.slice(mid + 1, hi + 1).join(', ') || '—'), '].'], state: view(n.id, `right of ${a[mid]}`) });
      n.right = build(mid + 1, hi);
      return n;
    };
    build(0, a.length - 1);
    const height = (n: TNode | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
    steps.push({
      tag: 'ret',
      trace: ['Balanced BST built — height ', C(height(root)), ' for ', C(a.length), ' node(s).'],
      state: snap(root, { done: allIds(root) }),
    });
    const levelOut: (number | null)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        levelOut.push(null);
        continue;
      }
      levelOut.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    return { steps, result: `[${levelOut.map((v) => (v === null ? 'null' : v)).join(', ')}]`, resultDetail: `height ${height(root)}` };
  },
  note: 'Inserting the values one by one would build a completely degenerate right-leaning chain — sorted input is the worst case for naive BST insertion. Choosing the midpoint recursively guarantees the two subtrees differ in size by at most one, giving O(log n) height for free.',
  complexity: { time: 'O(n)', space: 'O(log n)' },
};

/* ================= Insert into a Binary Search Tree ================= */
const insertBST: ProblemDef = {
  slug: 'insert-into-a-binary-search-tree',
  title: 'Insert into a Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/',
  technique: 'Walk down comparing, and hang the new node off the first empty slot you find.',
  widget: 'tree',
  widgetTitle: 'BST',
  inputs: [
    { key: 'tree', label: 'BST level-order', defaultValue: '4, 2, 7, 1, 3', wide: true },
    { key: 'val', label: 'Value to insert', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* insertIntoBST(TreeNode* root, int val) {'),
      L('        if (!root) return new TreeNode(val);', 'empty'),
      L('        TreeNode* cur = root;', 'init'),
      L('        while (true) {', 'loop'),
      L('            if (val < cur->val) {', 'left'),
      L('                if (!cur->left) { cur->left = new TreeNode(val); break; }', 'attach'),
      L('                cur = cur->left;', 'left'),
      L('            } else {', 'right'),
      L('                if (!cur->right) { cur->right = new TreeNode(val); break; }', 'attach'),
      L('                cur = cur->right;', 'right'),
      L('            }'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode insertIntoBST(TreeNode root, int val) {'),
      L('        if (root == null) return new TreeNode(val);', 'empty'),
      L('        TreeNode cur = root;', 'init'),
      L('        while (true) {', 'loop'),
      L('            if (val < cur.val) {', 'left'),
      L('                if (cur.left == null) {', 'attach'),
      L('                    cur.left = new TreeNode(val); break;', 'attach'),
      L('                }'),
      L('                cur = cur.left;', 'left'),
      L('            } else {', 'right'),
      L('                if (cur.right == null) {', 'attach'),
      L('                    cur.right = new TreeNode(val); break;', 'attach'),
      L('                }'),
      L('                cur = cur.right;', 'right'),
      L('            }'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const val = parseInt1(values.val, 'Value to insert');
    if (typeof val === 'string') return { error: val };
    const isBST = (n: TNode | null, lo: number, hi: number): boolean =>
      !n || (n.val > lo && n.val < hi && isBST(n.left, lo, n.val) && isBST(n.right, n.val, hi));
    if (!isBST(root, -Infinity, Infinity)) return { error: 'That level-order is not a valid binary search tree.' };

    const steps: Step[] = [];
    const path: number[] = [];
    let maxId = Math.max(...allIds(root));
    const view = (cur: TNode | null, fresh?: number): TreeState =>
      snap(root, { current: cur ? cur.id : null, done: [...path], queued: fresh !== undefined ? [fresh] : [] });
    steps.push({
      tag: 'init',
      trace: ['A BST search never branches — at each node one comparison rules out an entire subtree. Insertion follows that same single path.'],
      state: view(root),
    });
    let cur: TNode = root;
    while (true) {
      path.push(cur.id);
      if (val < cur.val) {
        steps.push({ tag: 'left', trace: [A(val), ' < ', A(cur.val), ' — it belongs in the ', B('left'), ' subtree.'], state: view(cur) });
        if (!cur.left) {
          cur.left = { id: ++maxId, val, left: null, right: null };
          steps.push({ tag: 'attach', trace: ['Left slot is empty — hang ', C(val), ' here as a new leaf.'], state: view(cur, cur.left.id) });
          break;
        }
        cur = cur.left;
      } else {
        steps.push({ tag: 'right', trace: [A(val), ' ≥ ', A(cur.val), ' — it belongs in the ', B('right'), ' subtree.'], state: view(cur) });
        if (!cur.right) {
          cur.right = { id: ++maxId, val, left: null, right: null };
          steps.push({ tag: 'attach', trace: ['Right slot is empty — hang ', C(val), ' here as a new leaf.'], state: view(cur, cur.right.id) });
          break;
        }
        cur = cur.right;
      }
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'ret',
      trace: [C(val), ' inserted as a leaf — no existing node had to move, so the BST property still holds everywhere.'],
      state: snap(root, { done: allIds(root) }),
    });
    const levelOut: (number | null)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        levelOut.push(null);
        continue;
      }
      levelOut.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    return { steps, result: `[${levelOut.map((v) => (v === null ? 'null' : v)).join(', ')}]` };
  },
  note: 'A new value can always go in as a leaf, which is why no restructuring is needed — the search path you followed is precisely the set of constraints the new node satisfies. Without rebalancing, though, inserting sorted data degenerates the tree to a list, which is what AVL and red-black trees exist to prevent.',
  complexity: { time: 'O(h)', space: 'O(1)' },
};

/* ================= Delete Node in a BST ================= */
const deleteBST: ProblemDef = {
  slug: 'delete-node-in-a-bst',
  title: 'Delete Node in a BST',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/delete-node-in-a-bst/',
  technique: 'Zero or one child: splice it out. Two children: swap in the inorder successor first.',
  widget: 'tree',
  widgetTitle: 'BST',
  inputs: [
    { key: 'tree', label: 'BST level-order', defaultValue: '5, 3, 6, 2, 4, null, 7', wide: true },
    { key: 'key', label: 'Value to delete', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    TreeNode* deleteNode(TreeNode* root, int key) {', 'enter'),
      L('        if (!root) return nullptr;', 'enter'),
      L('        if (key < root->val) root->left = deleteNode(root->left, key);', 'search'),
      L('        else if (key > root->val) root->right = deleteNode(root->right, key);', 'search'),
      L('        else {', 'found'),
      L('            if (!root->left) return root->right;', 'oneChild'),
      L('            if (!root->right) return root->left;', 'oneChild'),
      L('            TreeNode* s = root->right;'),
      L('            while (s->left) s = s->left;      // inorder successor', 'successor'),
      L('            root->val = s->val;', 'replace'),
      L('            root->right = deleteNode(root->right, s->val);', 'replace'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public TreeNode deleteNode(TreeNode root, int key) {', 'enter'),
      L('        if (root == null) return null;', 'enter'),
      L('        if (key < root.val) root.left = deleteNode(root.left, key);', 'search'),
      L('        else if (key > root.val) root.right = deleteNode(root.right, key);', 'search'),
      L('        else {', 'found'),
      L('            if (root.left == null) return root.right;', 'oneChild'),
      L('            if (root.right == null) return root.left;', 'oneChild'),
      L('            TreeNode s = root.right;'),
      L('            while (s.left != null) s = s.left;   // inorder successor', 'successor'),
      L('            root.val = s.val;', 'replace'),
      L('            root.right = deleteNode(root.right, s.val);', 'replace'),
      L('        }'),
      L('        return root;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    let root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const key = parseInt1(values.key, 'Value to delete');
    if (typeof key === 'string') return { error: key };
    const isBST = (n: TNode | null, lo: number, hi: number): boolean =>
      !n || (n.val > lo && n.val < hi && isBST(n.left, lo, n.val) && isBST(n.right, n.val, hi));
    if (!isBST(root, -Infinity, Infinity)) return { error: 'That level-order is not a valid binary search tree.' };

    const steps: Step[] = [];
    const view = (cur: TNode | null, queued: number[] = []): TreeState =>
      snap(root, { current: cur ? cur.id : null, queued });
    steps.push({
      tag: 'enter',
      trace: ['Deleting is search plus repair. Finding the node is easy; the interesting part is keeping the BST valid once it is gone.'],
      state: view(root),
    });
    const del = (n: TNode | null, k: number): TNode | null => {
      if (!n || steps.length > MAX_STEPS) {
        if (!n) steps.push({ tag: 'enter', trace: ['Reached an empty branch — ', F(k), ' is not in this tree.'], state: view(null) });
        return null;
      }
      if (k < n.val) {
        steps.push({ tag: 'search', trace: [A(k), ' < ', A(n.val), ' — search the left subtree.'], state: view(n) });
        n.left = del(n.left, k);
        return n;
      }
      if (k > n.val) {
        steps.push({ tag: 'search', trace: [A(k), ' > ', A(n.val), ' — search the right subtree.'], state: view(n) });
        n.right = del(n.right, k);
        return n;
      }
      steps.push({ tag: 'found', trace: ['Found ', B(k), '. Now decide how to remove it, based on how many children it has.'], state: view(n) });
      if (!n.left) {
        steps.push({
          tag: 'oneChild',
          trace: ['No left child — just promote its right subtree (', B(n.right ? n.right.val : 'nothing'), ') into its place.'],
          state: view(n, n.right ? [n.right.id] : []),
        });
        return n.right;
      }
      if (!n.right) {
        steps.push({
          tag: 'oneChild',
          trace: ['No right child — promote its left subtree (', B(n.left.val), ') into its place.'],
          state: view(n, [n.left.id]),
        });
        return n.left;
      }
      let s = n.right;
      while (s.left) s = s.left;
      steps.push({
        tag: 'successor',
        trace: [
          'Two children, so nothing can simply be promoted. Find the ', A('inorder successor'), ' — the smallest value in the right subtree, which is ', B(s.val), '.',
        ],
        state: view(n, [s.id]),
      });
      n.val = s.val;
      steps.push({
        tag: 'replace',
        trace: [
          'Copy ', B(s.val), ' into this node. It is larger than everything on the left and smaller than everything else on the right, so the BST stays valid. Now delete the duplicate below.',
        ],
        state: view(n, [s.id]),
      });
      n.right = del(n.right, s.val);
      return n;
    };
    root = del(root, key);
    steps.push({
      tag: 'ret',
      trace: root ? ['Done — the tree is still a valid BST without ', C(key), '.'] : ['The tree is now ', C('empty'), '.'],
      state: snap(root, { done: allIds(root) }),
    });
    const levelOut: (number | null)[] = [];
    const q: (TNode | null)[] = [root];
    while (q.length) {
      const n = q.shift()!;
      if (!n) {
        levelOut.push(null);
        continue;
      }
      levelOut.push(n.val);
      if (n.left || n.right) {
        q.push(n.left);
        q.push(n.right);
      }
    }
    return { steps, result: root ? `[${levelOut.map((v) => (v === null ? 'null' : v)).join(', ')}]` : '[]' };
  },
  note: 'The successor is the only value that can replace a two-child node without moving anything else, because it is the unique value that sits directly between the two subtrees in sorted order. The predecessor (largest on the left) works equally well — pick one and stay consistent.',
  complexity: { time: 'O(h)', space: 'O(h)' },
};

/* ================= Binary Search Tree Iterator ================= */
const bstIterator: ProblemDef = {
  slug: 'binary-search-tree-iterator',
  title: 'Binary Search Tree Iterator',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/binary-search-tree-iterator/',
  technique: 'Keep only the left spine on a stack — a paused inorder traversal you can resume on demand.',
  widget: 'tree',
  widgetTitle: 'BST & iterator stack',
  inputs: [{ key: 'tree', label: 'BST level-order', defaultValue: '7, 3, 15, null, null, 9, 20', wide: true }],
  code: {
    cpp: [
      L('class BSTIterator {'),
      L('    stack<TreeNode*> st;'),
      L('    void pushLeft(TreeNode* n) {', 'pushLeft'),
      L('        while (n) { st.push(n); n = n->left; }', 'pushLeft'),
      L('    }'),
      L('public:'),
      L('    BSTIterator(TreeNode* root) { pushLeft(root); }', 'init'),
      L('    int next() {', 'next'),
      L('        TreeNode* n = st.top(); st.pop();', 'next'),
      L('        pushLeft(n->right);', 'descend'),
      L('        return n->val;', 'next'),
      L('    }'),
      L('    bool hasNext() { return !st.empty(); }', 'hasNext'),
      L('};'),
    ],
    java: [
      L('class BSTIterator {'),
      L('    Deque<TreeNode> st = new ArrayDeque<>();'),
      L('    private void pushLeft(TreeNode n) {', 'pushLeft'),
      L('        while (n != null) { st.push(n); n = n.left; }', 'pushLeft'),
      L('    }'),
      L('    public BSTIterator(TreeNode root) { pushLeft(root); }', 'init'),
      L('    public int next() {', 'next'),
      L('        TreeNode n = st.pop();', 'next'),
      L('        pushLeft(n.right);', 'descend'),
      L('        return n.val;', 'next'),
      L('    }'),
      L('    public boolean hasNext() { return !st.isEmpty(); }', 'hasNext'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const isBST = (n: TNode | null, lo: number, hi: number): boolean =>
      !n || (n.val > lo && n.val < hi && isBST(n.left, lo, n.val) && isBST(n.right, n.val, hi));
    if (!isBST(root, -Infinity, Infinity)) return { error: 'That level-order is not a valid binary search tree.' };

    const steps: Step[] = [];
    const stack: TNode[] = [];
    const emitted: number[] = [];
    const emittedIds: number[] = [];
    const view = (cur: TNode | null): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: [...emittedIds],
        queued: stack.map((n) => n.id),
        stack: [...stack].reverse().map((n) => ({ text: `${n.val}` })),
        stackTitle: 'stack (top = next value)',
        aggs: [{ label: 'emitted', value: emitted.join(', ') || '—', c: 'c' }],
      });
    const pushLeft = (n: TNode | null) => {
      while (n) {
        stack.push(n);
        steps.push({
          tag: 'pushLeft',
          trace: ['Push ', A(n.val), ' and keep going left — in a BST the leftmost node of any subtree is its smallest.'],
          state: view(n),
        });
        n = n.left;
        if (steps.length > MAX_STEPS) return;
      }
    };
    steps.push({
      tag: 'init',
      trace: [
        'Flattening the whole tree first would cost ', A('O(n)'), ' memory. Instead hold only the ', B('left spine'), ' — a paused inorder walk, ', B('O(h)'), ' deep.',
      ],
      state: view(null),
    });
    pushLeft(root);
    const total = allIds(root).length;
    for (let i = 0; i < total; i++) {
      steps.push({ tag: 'hasNext', trace: ['hasNext() → ', B(stack.length > 0 ? 'true' : 'false'), ' — the stack is ', stack.length ? 'not empty' : 'empty', '.'], state: view(null) });
      if (!stack.length) break;
      const n = stack.pop()!;
      emitted.push(n.val);
      emittedIds.push(n.id);
      steps.push({
        tag: 'next',
        trace: ['next() → ', C(n.val), '. Its left subtree is already exhausted, so it is the smallest value remaining.'],
        state: view(n),
      });
      steps.push({
        tag: 'descend',
        trace: n.right ? ['Now everything in its ', A('right'), ' subtree comes next — push that subtree\'s left spine.'] : ['No right subtree, so the next value is already waiting on the stack.'],
        state: view(n),
      });
      pushLeft(n.right);
      if (steps.length > MAX_STEPS) break;
    }
    steps.push({
      tag: 'hasNext',
      trace: ['Stack empty — the iterator is exhausted. Values came out in sorted order: ', C(emitted.join(', ')), '.'],
      state: snap(root, { done: [...emittedIds], aggs: [{ label: 'emitted', value: emitted.join(', '), c: 'c' }] }),
    });
    return { steps, result: `[${emitted.join(', ')}]`, resultDetail: `${emitted.length} calls to next()` };
  },
  note: 'Each node is pushed once and popped once across the entire iteration, so next() is O(1) amortised even though a single call can push a whole spine. The O(h) memory is the point of the exercise — an iterator you can stop early, unlike a precomputed list.',
  complexity: { time: 'O(1) amortised per next()', space: 'O(h)' },
};

/* ================= Two Sum IV - Input is a BST ================= */
const twoSumBST: ProblemDef = {
  slug: 'two-sum-iv-input-is-a-bst',
  title: 'Two Sum IV - Input is a BST',
  category: 'Trees',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/',
  technique: 'Inorder gives a sorted array — then it is plain two-pointer two-sum.',
  widget: 'tree',
  widgetTitle: 'BST & sorted inorder',
  inputs: [
    { key: 'tree', label: 'BST level-order', defaultValue: '5, 3, 6, 2, 4, null, 7', wide: true },
    { key: 'k', label: 'Target sum', defaultValue: '9' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('    vector<int> a;'),
      L('public:'),
      L('    bool findTarget(TreeNode* root, int k) {'),
      L('        inorder(root);', 'inorder'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int s = a[lo] + a[hi];', 'sum'),
      L('            if (s == k) return true;', 'hit'),
      L('            if (s < k) lo++;', 'low'),
      L('            else hi--;', 'high'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('    void inorder(TreeNode* n) {', 'inorder'),
      L('        if (!n) return;'),
      L('        inorder(n->left); a.push_back(n->val); inorder(n->right);', 'inorder'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    List<Integer> a = new ArrayList<>();'),
      L('    public boolean findTarget(TreeNode root, int k) {'),
      L('        inorder(root);', 'inorder'),
      L('        int lo = 0, hi = a.size() - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int s = a.get(lo) + a.get(hi);', 'sum'),
      L('            if (s == k) return true;', 'hit'),
      L('            if (s < k) lo++;', 'low'),
      L('            else hi--;', 'high'),
      L('        }'),
      L('        return false;', 'ret'),
      L('    }'),
      L('    void inorder(TreeNode n) {', 'inorder'),
      L('        if (n == null) return;'),
      L('        inorder(n.left); a.add(n.val); inorder(n.right);', 'inorder'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const k = parseInt1(values.k, 'Target sum');
    if (typeof k === 'string') return { error: k };
    const isBST = (n: TNode | null, lo: number, hi: number): boolean =>
      !n || (n.val > lo && n.val < hi && isBST(n.left, lo, n.val) && isBST(n.right, n.val, hi));
    if (!isBST(root, -Infinity, Infinity)) return { error: 'That level-order is not a valid binary search tree.' };

    const steps: Step[] = [];
    const order: TNode[] = [];
    const collect = (n: TNode | null) => {
      if (!n) return;
      collect(n.left);
      order.push(n);
      collect(n.right);
    };
    collect(root);
    const a = order.map((n) => n.val);
    const view = (loI: number, hiI: number, mark: number[] = []): TreeState =>
      snap(root, {
        done: mark,
        queued: loI <= hiI ? [order[loI].id, order[hiI].id] : [],
        aggs: [
          { label: 'inorder (sorted)', value: a.join(', '), c: 'a' },
          { label: 'pair', value: loI < hiI ? `${a[loI]} + ${a[hiI]} = ${a[loI] + a[hiI]}` : '—', c: 'b' },
          { label: 'target', value: String(k), c: 'c' },
        ],
      });
    steps.push({
      tag: 'inorder',
      trace: ['An inorder walk of a BST comes out ', A('sorted'), ': [', B(a.join(', ')), ']. That unlocks the two-pointer solution.'],
      state: snap(root, { done: order.map((n) => n.id), aggs: [{ label: 'inorder', value: a.join(', '), c: 'a' }] }),
    });
    let lo = 0;
    let hi = a.length - 1;
    steps.push({ tag: 'init', trace: ['Point ', A('lo'), ' at the smallest value and ', B('hi'), ' at the largest.'], state: view(lo, hi) });
    let found: [number, number] | null = null;
    while (lo < hi) {
      const s = a[lo] + a[hi];
      steps.push({ tag: 'sum', trace: [A(a[lo]), ' + ', A(a[hi]), ' = ', B(s), '.'], state: view(lo, hi) });
      if (s === k) {
        found = [a[lo], a[hi]];
        steps.push({ tag: 'hit', trace: ['That is the target — ', C(a[lo]), ' + ', C(a[hi]), ' = ', C(k), '.'], state: view(lo, hi, [order[lo].id, order[hi].id]) });
        break;
      }
      if (s < k) {
        steps.push({ tag: 'low', trace: [F(s), ' is too small — the only way to grow it is a bigger ', A('lo'), '.'], state: view(lo, hi) });
        lo++;
      } else {
        steps.push({ tag: 'high', trace: [F(s), ' is too big — shrink it by lowering ', B('hi'), '.'], state: view(lo, hi) });
        hi--;
      }
      if (steps.length > MAX_STEPS) break;
    }
    if (!found) {
      steps.push({ tag: 'ret', trace: ['The pointers met with no match — no two values sum to ', C(k), '.'], state: snap(root, {}) });
    }
    return { steps, result: found ? 'true' : 'false', resultDetail: found ? `${found[0]} + ${found[1]}` : undefined };
  },
  note: 'A hash set while traversing solves it in one pass with O(n) memory and no sortedness needed; the two-pointer route trades that for reusing what a BST already gives you. Both are O(n) — the interesting follow-up is doing it in O(h) space with two BST iterators walking inward from both ends.',
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ================= Recover Binary Search Tree ================= */
const recoverBST: ProblemDef = {
  slug: 'recover-binary-search-tree',
  title: 'Recover Binary Search Tree',
  category: 'Trees',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/recover-binary-search-tree/',
  technique: 'Inorder must be increasing — the two swapped nodes show up as the dips.',
  widget: 'tree',
  widgetTitle: 'BST with two swapped nodes',
  inputs: [{ key: 'tree', label: 'Level-order (two nodes swapped)', defaultValue: '3, 1, 4, null, null, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('    TreeNode *first = nullptr, *second = nullptr, *prev = nullptr;'),
      L('public:'),
      L('    void recoverTree(TreeNode* root) {'),
      L('        inorder(root);', 'walk'),
      L('        swap(first->val, second->val);', 'swap'),
      L('    }', 'ret'),
      L('    void inorder(TreeNode* n) {', 'walk'),
      L('        if (!n) return;'),
      L('        inorder(n->left);', 'walk'),
      L('        if (prev && prev->val > n->val) {', 'dip'),
      L('            if (!first) first = prev;      // first dip', 'dip'),
      L('            second = n;                    // always update', 'dip'),
      L('        }'),
      L('        prev = n;', 'advance'),
      L('        inorder(n->right);', 'walk'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    TreeNode first, second, prev;'),
      L('    public void recoverTree(TreeNode root) {'),
      L('        inorder(root);', 'walk'),
      L('        int t = first.val; first.val = second.val; second.val = t;', 'swap'),
      L('    }', 'ret'),
      L('    void inorder(TreeNode n) {', 'walk'),
      L('        if (n == null) return;'),
      L('        inorder(n.left);', 'walk'),
      L('        if (prev != null && prev.val > n.val) {', 'dip'),
      L('            if (first == null) first = prev;   // first dip', 'dip'),
      L('            second = n;                        // always update', 'dip'),
      L('        }'),
      L('        prev = n;', 'advance'),
      L('        inorder(n.right);', 'walk'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const levels = parseLevelOrder(values.tree, 12);
    if (typeof levels === 'string') return { error: levels };
    const root = buildTree(levels);
    if (!root) return { error: 'Tree is empty.' };
    const order: TNode[] = [];
    const collect = (n: TNode | null) => {
      if (!n) return;
      collect(n.left);
      order.push(n);
      collect(n.right);
    };
    collect(root);
    const vals = order.map((n) => n.val);
    const sorted = [...vals].sort((a, b) => a - b);
    const diff = vals.map((v, i) => (v !== sorted[i] ? i : -1)).filter((i) => i >= 0);
    if (diff.length !== 2) return { error: 'Exactly two nodes must be swapped — this tree has ' + (diff.length === 0 ? 'none' : `${diff.length}`) + ' out of place.' };

    const steps: Step[] = [];
    const seen: number[] = [];
    let first: TNode | null = null;
    let second: TNode | null = null;
    const view = (cur: TNode | null): TreeState =>
      snap(root, {
        current: cur ? cur.id : null,
        done: [...seen],
        queued: [first?.id, second?.id].filter((x): x is number => x !== undefined),
        aggs: [
          { label: 'inorder so far', value: seen.map((id) => order.find((n) => n.id === id)!.val).join(', ') || '—', c: 'a' },
          { label: 'suspects', value: `${first ? first.val : '—'} , ${second ? second.val : '—'}`, c: 'c' },
        ],
      });
    steps.push({
      tag: 'walk',
      trace: ['Inorder on a healthy BST is strictly increasing. Two swapped nodes break that in at most ', A('two'), ' places — find them in one pass.'],
      state: view(null),
    });
    let prev: TNode | null = null;
    for (const n of order) {
      if (prev && prev.val > n.val) {
        if (!first) {
          first = prev;
          second = n;
          steps.push({
            tag: 'dip',
            trace: [
              'First dip: ', F(prev.val), ' comes before ', F(n.val), ' but is larger. Record ', A(prev.val), ' as the first suspect and ', A(n.val), ' as the second (for now).',
            ],
            state: view(n),
          });
        } else {
          second = n;
          steps.push({
            tag: 'dip',
            trace: ['Second dip at ', F(n.val), ' — the swapped nodes were far apart, so update the second suspect to ', A(n.val), '.'],
            state: view(n),
          });
        }
      } else {
        steps.push({ tag: 'advance', trace: ['Node ', B(n.val), ' — still increasing, nothing wrong here.'], state: view(n) });
      }
      seen.push(n.id);
      prev = n;
      if (steps.length > MAX_STEPS) break;
    }
    const a = first!.val;
    const b = second!.val;
    first!.val = b;
    second!.val = a;
    steps.push({
      tag: 'swap',
      trace: ['Swap the two suspects back: ', C(a), ' ↔ ', C(b), '.'],
      state: snap(root, { done: allIds(root), queued: [first!.id, second!.id] }),
    });
    steps.push({
      tag: 'ret',
      trace: ['Inorder is increasing again — the BST is repaired without changing its ', C('shape'), '.'],
      state: snap(root, { done: allIds(root) }),
    });
    return { steps, result: `swapped ${a} ↔ ${b}` };
  },
  note: 'Two cases hide behind one rule: if the swapped nodes are adjacent in inorder there is a single dip, otherwise there are two. Setting first only on the first dip while always overwriting second handles both without branching. Swapping values rather than nodes keeps every pointer intact.',
  complexity: { time: 'O(n)', space: 'O(h)' },
};

export const trees5: ProblemDef[] = [
  buildFromInPost,
  flattenTree,
  nextRightPointers,
  distanceK,
  verticalOrder,
  sortedArrayToBST,
  insertBST,
  deleteBST,
  bstIterator,
  twoSumBST,
  recoverBST,
];
