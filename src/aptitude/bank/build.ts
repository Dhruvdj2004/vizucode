// Compact authoring format for the question bank. Bank files list `Raw`
// entries (short keys keep ~250 questions readable); `build` expands them into
// full AptQuestion objects. `calc` and `check` exist only for
// scripts/validate-aptitude.mjs: `calc` is the answer recomputed in code (the
// correct option must contain that number, and no other option may), `check`
// is any extra assertion (e.g. a simulation) that must return true.
import type { AptQuestion, CategoryKey, QuestionTable } from '../types';

export interface Raw {
  id: string;
  t: string; // topic
  s: string; // subtopic
  d: 'E' | 'M' | 'H';
  q: string;
  o: [string, string, string, string];
  a: 0 | 1 | 2 | 3;
  e: string;
  passage?: string;
  table?: QuestionTable;
  code?: string;
  fixed?: boolean;
  calc?: number;
  check?: () => boolean;
}

const DIFF = { E: 'easy', M: 'medium', H: 'hard' } as const;

export function build(category: CategoryKey, raw: Raw[]): AptQuestion[] {
  return raw.map((r) => ({
    id: r.id,
    category,
    topic: r.t,
    subtopic: r.s,
    difficulty: DIFF[r.d],
    ...(r.passage ? { passage: r.passage } : {}),
    ...(r.table ? { table: r.table } : {}),
    ...(r.code ? { code: r.code } : {}),
    question: r.q,
    options: r.o,
    correctAnswer: r.a,
    explanation: r.e,
    source: 'generated',
    ...(r.fixed ? { fixedOptions: true } : {}),
  }));
}
