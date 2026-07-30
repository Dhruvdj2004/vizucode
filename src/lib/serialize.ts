// Shared between the frontend and the API server: the part of a ProblemDef
// that can travel over the wire (everything except the trace generator).
import type { ProblemDef } from './types';

export type StaticProblem = Omit<ProblemDef, 'run'>;

export function toStatic(def: ProblemDef): StaticProblem {
  const { run: _run, ...rest } = def;
  return rest;
}
