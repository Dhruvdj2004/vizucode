// Visualizers written for the Code Catalyst question list (src/data/codeCatalyst.ts).
// Many of that list's questions already had visualizers elsewhere in
// src/problems; these are the ones that did not.
import type { ProblemDef } from '../../lib/types';
import { ccBasicsMath } from './basicsMath';
import { ccBasicsArrays } from './basicsArrays';
import { ccHashing } from './hashing';
import { ccPrefix } from './prefix';
import { ccWindow } from './window';
import { ccSearch } from './search';
import { ccLists } from './lists';
import { ccStacks } from './stacks';
import { ccQueues } from './queues';
import { ccDequeWindow } from './dequeWindow';

export const codeCatalystProblems: ProblemDef[] = [
  ...ccBasicsMath,
  ...ccBasicsArrays,
  ...ccHashing,
  ...ccPrefix,
  ...ccWindow,
  ...ccSearch,
  ...ccLists,
  ...ccStacks,
  ...ccQueues,
  ...ccDequeWindow,
];
