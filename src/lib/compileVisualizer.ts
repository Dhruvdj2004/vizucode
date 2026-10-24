// Turns a generated visualizer module (TypeScript source from the admin panel)
// into a live ProblemDef in the browser, so it can be previewed before it is
// committed. Admin-only: the source comes from our own Gemini call and is
// reviewed on screen, and it only gets the same helpers real visualizers use.
import * as trace from './trace';
import * as parse from './parse';
import * as types from './types';
import { isRunError, type ProblemDef } from './types';

const MODULES: Record<string, unknown> = {
  '../../lib/trace': trace,
  '../../lib/parse': parse,
  '../../lib/types': types,
  '../lib/trace': trace,
  '../lib/parse': parse,
  '../lib/types': types,
};

const WIDGETS = ['binary-search', 'array', 'tree', 'graph', 'matrix', 'stack', 'list', 'heap', 'bits', 'intervals'];

export interface CompileResult {
  def?: ProblemDef;
  /** Blocking problems: the preview can't render or publishing would break the site. */
  errors: string[];
  /** Things worth a look that don't block. */
  warnings: string[];
  steps?: number;
  result?: string;
}

export async function compileVisualizer(source: string, expectedSlug: string, expectedOutput?: string): Promise<CompileResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { transform } = await import('sucrase');

  let js: string;
  try {
    js = transform(source, { transforms: ['typescript', 'imports'] }).code;
  } catch (e) {
    return { errors: [`Syntax error: ${e instanceof Error ? e.message : e}`], warnings };
  }

  const bad = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((m) => !(m in MODULES));
  if (bad.length) return { errors: [`Imports not allowed: ${bad.join(', ')}`], warnings };

  const mod: { exports: Record<string, unknown> } = { exports: {} };
  try {
    // eslint-disable-next-line no-new-func
    new Function('require', 'module', 'exports', js)((name: string) => MODULES[name], mod, mod.exports);
  } catch (e) {
    return { errors: [`The module crashed while loading: ${e instanceof Error ? e.message : e}`], warnings };
  }

  const def = mod.exports.problem as ProblemDef | undefined;
  if (!def || typeof def !== 'object') return { errors: ['The module must `export const problem: ProblemDef`.'], warnings };
  if (def.slug !== expectedSlug) errors.push(`slug is "${def.slug}" but must be "${expectedSlug}".`);
  if (!WIDGETS.includes(def.widget)) errors.push(`Unknown widget "${def.widget}".`);
  if (typeof def.run !== 'function') errors.push('run(values) is missing.');
  if (!Array.isArray(def.inputs) || !def.inputs.length) errors.push('inputs is empty.');
  if (!def.code?.cpp?.length || !def.code?.java?.length) errors.push('code.cpp and code.java are both required.');
  if (errors.length) return { def, errors, warnings };

  const defaults = Object.fromEntries(def.inputs.map((f) => [f.key, f.defaultValue]));
  let steps: number | undefined;
  let result: string | undefined;
  type Runner = ProblemDef['run'];
  const runners: [string, Runner][] = [['optimal', def.run]];
  if (def.brute) runners.push(['brute force', def.brute.run]);
  for (const [label, run] of runners) {
    try {
      const r = run(defaults);
      if (isRunError(r)) {
        errors.push(`${label}: run(default inputs) returned an error: ${r.error}`);
        continue;
      }
      if (!r.steps.length) errors.push(`${label}: produced no steps.`);
      const tags = new Set([...def.code.cpp, ...def.code.java].flatMap((l) => l.tags ?? []));
      const missing = [...new Set(r.steps.flatMap((s) => [s.tag, s.tag2]).filter((t): t is string => !!t && !tags.has(t)))];
      if (missing.length && label === 'optimal') warnings.push(`Steps use tags with no code line: ${missing.join(', ')}`);
      if (label === 'optimal') {
        steps = r.steps.length;
        result = r.result;
        if (r.steps.length > 200) warnings.push(`${steps} steps is long for a default example; consider a smaller input.`);
        if (expectedOutput && norm(r.result) !== norm(expectedOutput))
          warnings.push(`Result "${r.result}" differs from the sample's expected output "${expectedOutput}".`);
      }
    } catch (e) {
      errors.push(`${label}: run() threw: ${e instanceof Error ? e.message : e}`);
    }
  }
  return { def, errors, warnings, steps, result };
}

/** Loose compare: "[0, 1]" == "[0,1]" == "0 1". */
function norm(s: string): string {
  return String(s).replace(/[\s,[\]"'()]/g, '').toLowerCase();
}
