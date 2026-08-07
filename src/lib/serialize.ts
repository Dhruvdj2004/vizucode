// Shared between the frontend and the API server: the part of a ProblemDef
// that can travel over the wire (everything except the trace generators).
import type { Approach, ProblemDef } from './types';

export type StaticApproach = Omit<Approach, 'run'>;

export type StaticProblem = Omit<ProblemDef, 'run' | 'brute'> & {
  brute?: StaticApproach;
};

export function toStatic(def: ProblemDef): StaticProblem {
  const { run: _run, brute, ...rest } = def;
  if (!brute) return rest;
  const { run: _bruteRun, ...bruteRest } = brute;
  return { ...rest, brute: bruteRest };
}
