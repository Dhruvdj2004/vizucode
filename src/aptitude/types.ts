// Aptitude & OA practice — shared types. The question bank, the test engine,
// the storage layer and the server all speak these shapes.

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export type CategoryKey = 'quant' | 'logical' | 'analytical' | 'verbal' | 'cs';

/** A small table shown above a question (data interpretation, SQL output …). */
export interface QuestionTable {
  caption?: string;
  head: string[];
  rows: (string | number)[][];
}

export interface AptQuestion {
  /** Stable, unique id — attempt history refers to questions by it, so never renumber. */
  id: string;
  category: CategoryKey;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  /** Optional shared context (reading passage, puzzle conditions). */
  passage?: string;
  table?: QuestionTable;
  /** Optional code snippet, shown monospaced. */
  code?: string;
  question: string;
  options: [string, string, string, string];
  /** Index into `options` (as authored, before any shuffling). */
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
  source: 'generated';
  /** True when option order carries meaning (A/B/C/D parts, "Both", "Neither") — never shuffle. */
  fixedOptions?: boolean;
}

/** What the test engine needs to build a test. */
export interface TestConfig {
  mode: ModeKey;
  title: string;
  /** Topic names to draw from (see taxonomy.ts). */
  topics: string[];
  count: number;
  durationSec: number;
  selection: 'random' | 'smart';
  /** Company-style presets weight categories unevenly; otherwise categories share evenly. */
  categoryWeights?: Partial<Record<CategoryKey, number>>;
  /** Topic practice can lean on one difficulty; 'mixed' keeps the 8/6/6 ratio. */
  difficultyFocus?: Difficulty | 'mixed';
  companyStyle?: string;
}

export type ModeKey = 'full' | 'topic' | 'mixed' | 'cs' | 'company';

export type AttemptStatus = 'active' | 'submitted' | 'timeout' | 'abandoned';

export interface Attempt {
  id: string;
  config: TestConfig;
  questionIds: string[];
  /** optionOrder[i][displayPos] = original option index for question i. */
  optionOrder: number[][];
  /** Chosen ORIGINAL option index per question, or null. */
  answers: (number | null)[];
  marked: boolean[];
  visited: boolean[];
  current: number;
  startedAt: number;
  submittedAt?: number;
  status: AttemptStatus;
  /** Time warnings already shown (minutes left), so a refresh does not replay them. */
  warned: number[];
}
