import type { ProblemDef } from '../lib/types';
import { binarySearchProblems } from './binarySearch';
import { pointerProblems } from './pointers';
import { treeProblems } from './trees';
import { arraysHashing1 } from './arraysHashing1';
import { arraysHashing2 } from './arraysHashing2';
import { pointers2 } from './pointers2';
import { stackProblems } from './stack';
import { binarySearch2 } from './binarySearch2';
import { linkedList1 } from './linkedList1';
import { linkedList2 } from './linkedList2';
import { trees2 } from './trees2';
import { trees3 } from './trees3';
import { triesDesign } from './triesDesign';
import { heapProblems } from './heap';
import { backtracking } from './backtracking';
import { graphs1 } from './graphs1';
import { graphs2 } from './graphs2';
import { dp1 } from './dp1';
import { dp2 } from './dp2';
import { greedy } from './greedy';
import { intervals } from './intervals';
import { mathBits } from './mathBits';
import { strings } from './strings';
import { arraysHashing3 } from './arraysHashing3';
import { pointers3 } from './pointers3';
import { slidingWindow2 } from './slidingWindow2';
import { binarySearch3 } from './binarySearch3';
import { linkedList3 } from './linkedList3';
import { stack2 } from './stack2';
import { trees4 } from './trees4';
import { trees5 } from './trees5';
import { triesHeapBacktracking } from './triesHeapBacktracking';
import { graphs3 } from './graphs3';
import { graphs4 } from './graphs4';
import { dp3 } from './dp3';
import { dp4 } from './dp4';
import { greedyStrings2 } from './greedyStrings2';
import { mathBits2 } from './mathBits2';

const all: ProblemDef[] = [
  ...binarySearchProblems,
  ...pointerProblems,
  ...treeProblems,
  ...arraysHashing1,
  ...arraysHashing2,
  ...pointers2,
  ...stackProblems,
  ...binarySearch2,
  ...linkedList1,
  ...linkedList2,
  ...trees2,
  ...trees3,
  ...triesDesign,
  ...heapProblems,
  ...backtracking,
  ...graphs1,
  ...graphs2,
  ...dp1,
  ...dp2,
  ...greedy,
  ...intervals,
  ...mathBits,
  ...strings,
  ...arraysHashing3,
  ...pointers3,
  ...slidingWindow2,
  ...binarySearch3,
  ...linkedList3,
  ...stack2,
  ...trees4,
  ...trees5,
  ...triesHeapBacktracking,
  ...graphs3,
  ...graphs4,
  ...dp3,
  ...dp4,
  ...greedyStrings2,
  ...mathBits2,
];

/** slug -> problem definition, for questions that have a visualizer built. */
export const problemRegistry: Record<string, ProblemDef> = Object.fromEntries(
  all.map((p) => [p.slug, p])
);
