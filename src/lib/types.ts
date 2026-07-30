// Shared contracts between the visualizer shell, the widget templates,
// and per-problem step-trace generators.

/** Inline colored token in the plain-English trace line.
 *  c: 'a' = accent (active/testing), 'b' = accent-2 (confirmed/success),
 *  'c' = accent-3 (final result), 'f' = faint (rejected/skip). */
export type TraceToken = string | { t: string; c: 'a' | 'b' | 'c' | 'f' };

export interface CodeLine {
  text: string;
  /** Step tags that light this line up. */
  tags?: string[];
}

export interface Step {
  /** Primary highlight tag — lines carrying this tag get the amber highlight. */
  tag: string;
  /** Optional secondary tag — teal highlight (e.g. caller while callee runs). */
  tag2?: string;
  trace: TraceToken[];
  /** Widget-specific render state; shape depends on ProblemDef.widget. */
  state: unknown;
}

export interface RunResult {
  steps: Step[];
  result: string;
  resultDetail?: string;
}

export interface RunError {
  error: string;
}

export interface InputField {
  key: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  wide?: boolean;
}

export type WidgetKind =
  | 'binary-search'
  | 'array'
  | 'tree'
  | 'graph'
  | 'matrix'
  | 'stack'
  | 'list'
  | 'heap'
  | 'bits'
  | 'intervals';

export interface ProblemDef {
  slug: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcode: string;
  /** One-line plain-English description of the technique. */
  technique: string;
  widget: WidgetKind;
  widgetTitle: string;
  inputs: InputField[];
  code: { cpp: CodeLine[]; java: CodeLine[] };
  run: (values: Record<string, string>) => RunResult | RunError;
  /** "Why this works" closing insight. */
  note: string;
  complexity: { time: string; space: string };
}

export const isRunError = (r: RunResult | RunError): r is RunError =>
  (r as RunError).error !== undefined;

/* ---------- Widget state shapes ---------- */

export interface BinarySearchState {
  mode: 'array' | 'answer';
  /** array mode: the values being searched */
  arr?: number[];
  lo: number;
  hi: number;
  mid?: number;
  /** confirmed best answer so far (answer mode) or found index (array mode) */
  best?: number | null;
  /** answer mode: fixed domain bounds for the number line */
  domain?: [number, number];
  domainLabel?: string;
  /** feasibility probe readout, e.g. "hours needed = 10" */
  probe?: { text: string; verdict?: 'yes' | 'no'; verdictText?: string };
  /** indices/values already eliminated are drawn dimmed (array mode) */
  finalIndex?: number | null;
}

export interface ArrayPointer {
  name: string;
  i: number;
  c: 'a' | 'b' | 'c';
}

export interface ArrayState {
  arr: (number | string)[];
  ptrs?: ArrayPointer[];
  /** inclusive [l, r] highlighted window */
  window?: [number, number] | null;
  /** per-index visual overrides */
  mark?: Partial<Record<number, 'active' | 'good' | 'final' | 'dim' | 'win'>>;
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
  /** render as height bars instead of value boxes */
  bars?: boolean;
}

export interface TreeNodeLayout {
  id: number;
  val: number | string;
  x: number; // 0..1
  y: number; // 0..1
  badge?: string;
}

export interface TreeState {
  nodes: TreeNodeLayout[];
  edges: [number, number][];
  current?: number | null;
  done?: number[];
  queued?: number[];
  stack?: { text: string }[];
  stackTitle?: string;
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
  /** graph mode: draw arrowheads */
  directed?: boolean;
  /** edges to emphasize, as "a-b" id pairs */
  edgeMark?: string[];
  /** edges to dim/reject, as "a-b" id pairs */
  edgeDim?: string[];
}

export type CellMark = 'active' | 'good' | 'final' | 'dim' | 'win' | 'src';

export interface MatrixState {
  grid: (string | number)[][];
  rowLabels?: (string | number)[];
  colLabels?: (string | number)[];
  /** "row,col" -> mark */
  mark?: Record<string, CellMark>;
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}

export interface StackItem {
  v: string | number;
  c?: 'a' | 'b' | 'c' | 'f';
}

export interface StackState {
  /** optional input row rendered above the stack (reuses the array widget) */
  array?: ArrayState;
  /** bottom -> top */
  stack: StackItem[];
  stackLabel?: string;
  /** optional second stack/queue column */
  stack2?: StackItem[];
  stack2Label?: string;
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}

export interface ListChainItem {
  v: string | number;
  mark?: CellMark;
}

export interface ListState {
  chains: { label?: string; items: ListChainItem[]; broken?: boolean }[];
  /** pointer carets: chain index + item index */
  ptrs?: { name: string; chain: number; i: number; c: 'a' | 'b' | 'c' }[];
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}

export interface HeapState {
  heap: (number | string)[];
  /** indices highlighted as active (amber) */
  hl?: number[];
  /** indices highlighted as confirmed (teal) */
  ok?: number[];
  label?: string;
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}

export interface BitsRow {
  label: string;
  bits: (0 | 1 | string)[];
  c?: 'a' | 'b' | 'c';
  /** highlighted bit positions (index into bits array) */
  hl?: number[];
}

export interface BitsState {
  rows: BitsRow[];
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}

export interface IntervalBar {
  s: number;
  e: number;
  label?: string;
  mark?: CellMark;
}

export interface IntervalsState {
  intervals: IntervalBar[];
  domain: [number, number];
  aggs?: { label: string; value: string; c?: 'a' | 'b' | 'c' }[];
}
