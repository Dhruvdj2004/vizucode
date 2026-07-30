// Binary tree construction + layout for the tree widget.
import type { TreeNodeLayout } from './types';

export interface TNode {
  id: number;
  val: number;
  left: TNode | null;
  right: TNode | null;
}

/** Build a tree from a LeetCode-style level-order array. */
export function buildTree(levels: (number | null)[]): TNode | null {
  if (levels.length === 0 || levels[0] === null) return null;
  let nextId = 0;
  const root: TNode = { id: nextId++, val: levels[0], left: null, right: null };
  const queue: TNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < levels.length) {
    const node = queue.shift()!;
    const lv = levels[i++];
    if (lv !== null && lv !== undefined) {
      node.left = { id: nextId++, val: lv, left: null, right: null };
      queue.push(node.left);
    }
    const rv = i < levels.length ? levels[i++] : null;
    if (rv !== null && rv !== undefined) {
      node.right = { id: nextId++, val: rv, left: null, right: null };
      queue.push(node.right);
    }
  }
  return root;
}

/** Snapshot the current tree shape into positioned nodes + edges (x,y in 0..1).
 *  Uses in-order rank for x so siblings never overlap. */
export function layoutTree(root: TNode | null): { nodes: TreeNodeLayout[]; edges: [number, number][] } {
  const nodes: TreeNodeLayout[] = [];
  const edges: [number, number][] = [];
  if (!root) return { nodes, edges };
  let rank = 0;
  let total = 0;
  let maxDepth = 0;
  const count = (n: TNode | null, d: number) => {
    if (!n) return;
    total++;
    maxDepth = Math.max(maxDepth, d);
    count(n.left, d + 1);
    count(n.right, d + 1);
  };
  count(root, 0);
  const walk = (n: TNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    nodes.push({
      id: n.id,
      val: n.val,
      x: total === 1 ? 0.5 : (rank + 0.5) / total,
      y: maxDepth === 0 ? 0.5 : depth / maxDepth,
    });
    rank++;
    if (n.left) edges.push([n.id, n.left.id]);
    if (n.right) edges.push([n.id, n.right.id]);
    walk(n.right, depth + 1);
  };
  walk(root, 0);
  return { nodes, edges };
}
