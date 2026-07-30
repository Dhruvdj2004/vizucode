import type { CodeLine, TraceToken } from './types';

/** Colored inline chips for the trace line (see 3-accent color language). */
export const A = (v: unknown): TraceToken => ({ t: String(v), c: 'a' }); // active / being tested
export const B = (v: unknown): TraceToken => ({ t: String(v), c: 'b' }); // confirmed / success
export const C = (v: unknown): TraceToken => ({ t: String(v), c: 'c' }); // final result
export const F = (v: unknown): TraceToken => ({ t: String(v), c: 'f' }); // rejected / skip

/** Code line with step tags. */
export const L = (text: string, ...tags: string[]): CodeLine =>
  tags.length > 0 ? { text, tags } : { text };
