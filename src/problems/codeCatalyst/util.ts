// Small shared helpers for the Code Catalyst visualizers.
import type { ArrayState } from '../../lib/types';

/** Hard cap so a big custom input can never freeze the page. */
export const MAX_STEPS = 400;

/** Strips quotes and whitespace from a string input like `"abc"` or `abc`. */
export function parseWord(
  s: string,
  label: string,
  opts: { max?: number; min?: number; re?: RegExp; reMsg?: string } = {}
): string | { error: string } {
  const w = s.trim().replace(/^["']|["']$/g, '');
  const max = opts.max ?? 20;
  if (w.length < (opts.min ?? 1)) return { error: `${label} cannot be empty.` };
  if (w.length > max) return { error: `Keep ${label} to at most ${max} characters so the steps stay readable.` };
  if (opts.re && !opts.re.test(w)) return { error: opts.reMsg ?? `${label} has characters this visualizer does not support.` };
  return w;
}

/** Parses `["a","b"]`, `[a, b]` or `a, b` into a list of strings. */
export function parseStrList(s: string, label: string, maxLen = 12): string[] | { error: string } {
  const parts = s
    .replace(/[\[\]]/g, '')
    .split(',')
    .map((p) => p.trim().replace(/^["']|["']$/g, ''))
    .filter((p) => p.length > 0);
  if (parts.length === 0) return { error: `Enter at least one item for ${label}.` };
  if (parts.length > maxLen) return { error: `Keep ${label} to at most ${maxLen} items.` };
  return parts;
}

/** Parses `[[1,2],[3,4]]` into rows of integers. Rows may differ in length unless `rect`. */
export function parseMatrix(
  s: string,
  label: string,
  opts: { maxR?: number; maxC?: number; rect?: boolean; cols?: number; min?: number; max?: number } = {}
): number[][] | { error: string } {
  const body = s.trim().replace(/^\[\s*/, '').replace(/\s*\]$/, '');
  const rows = body.match(/\[[^\[\]]*\]/g);
  if (!rows || rows.length === 0) return { error: `${label} should look like [[1,2],[3,4]].` };
  const maxR = opts.maxR ?? 8;
  if (rows.length > maxR) return { error: `Keep ${label} to at most ${maxR} rows.` };
  const out: number[][] = [];
  for (const r of rows) {
    const cells = r.replace(/[\[\]]/g, '').split(/[,\s]+/).filter(Boolean);
    const nums: number[] = [];
    for (const c of cells) {
      const n = Number(c);
      if (!Number.isInteger(n)) return { error: `"${c}" in ${label} is not an integer.` };
      if (opts.min !== undefined && n < opts.min) return { error: `Values in ${label} must be ≥ ${opts.min}.` };
      if (opts.max !== undefined && n > opts.max) return { error: `Values in ${label} must be ≤ ${opts.max}.` };
      nums.push(n);
    }
    if (opts.cols !== undefined && nums.length !== opts.cols) return { error: `Each entry of ${label} needs exactly ${opts.cols} numbers.` };
    if (opts.maxC !== undefined && nums.length > opts.maxC) return { error: `Keep each row of ${label} to at most ${opts.maxC} numbers.` };
    out.push(nums);
  }
  if (opts.rect && out.some((r) => r.length !== out[0].length)) return { error: `Every row of ${label} must be the same length.` };
  return out;
}

/** `[1,2,3]` LeetCode-style. */
export const fmt = (a: (number | string)[]): string => `[${a.join(',')}]`;
/** `["a","b"]` LeetCode-style. */
export const fmtS = (a: string[]): string => `[${a.map((x) => `"${x}"`).join(',')}]`;

/** Builds an array-widget state with less boilerplate. */
export function arr(
  a: (number | string)[],
  o: Omit<ArrayState, 'arr'> = {}
): ArrayState {
  return { arr: a, ...o };
}

/** Shorthand for one aggregate chip. */
export const ag = (label: string, value: unknown, c: 'a' | 'b' | 'c' = 'a') => ({ label, value: String(value), c });

/** Marks every index in [l, r] with the same mark. */
export function range(l: number, r: number, m: 'active' | 'good' | 'final' | 'dim' | 'win'): ArrayState['mark'] {
  const out: NonNullable<ArrayState['mark']> = {};
  for (let i = l; i <= r; i++) out[i] = m;
  return out;
}
