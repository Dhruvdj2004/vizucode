// Fast, headless sanity check for every ProblemDef in the local registry.
//
// Bundles src/problems/index.ts with esbuild (already a dependency) and, for
// each problem, calls run() with its own default inputs. Flags anything that
// throws, returns a RunError, produces zero steps, or emits a step whose tag
// matches no tagged code line (a step that would highlight nothing).
//
// Usage:
//   node scripts/smoke-problems.mjs            # all problems
//   node scripts/smoke-problems.mjs <slug>...  # only these slugs
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2);

const out = path.join(mkdtempSync(path.join(tmpdir(), 'vizu-smoke-')), 'problems.mjs');
await build({
  entryPoints: [path.join(ROOT, 'src/problems/index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'warning',
});
const { problemRegistry } = await import(pathToFileURL(out).href);

const slugs = only.length ? only : Object.keys(problemRegistry);
const failures = [];
let steps = 0;

for (const slug of slugs) {
  const p = problemRegistry[slug];
  if (!p) {
    failures.push([slug, 'not in registry']);
    continue;
  }
  const values = Object.fromEntries(p.inputs.map((f) => [f.key, f.defaultValue]));
  let res;
  try {
    res = p.run(values);
  } catch (e) {
    failures.push([slug, `threw: ${e.message}`]);
    continue;
  }
  if (res.error !== undefined) {
    failures.push([slug, `default inputs rejected: ${res.error}`]);
    continue;
  }
  if (!res.steps?.length) {
    failures.push([slug, 'produced no steps']);
    continue;
  }
  if (typeof res.result !== 'string' || res.result === '') {
    failures.push([slug, 'empty result string']);
    continue;
  }
  for (const lang of ['cpp', 'java']) {
    const tags = new Set(p.code[lang].flatMap((l) => l.tags ?? []));
    const dead = [...new Set(res.steps.flatMap((s) => [s.tag, s.tag2]).filter(Boolean))].filter((t) => !tags.has(t));
    // Only the reverse direction is a real bug: a step whose tag highlights
    // nothing. A tagged line with no step is normal — it is a branch this
    // particular input never took.
    if (dead.length) failures.push([slug, `${lang}: step tag(s) match no code line: ${dead.join(', ')}`]);
  }
  for (const [i, s] of res.steps.entries()) {
    if (s.state === undefined || s.state === null) failures.push([slug, `step ${i} has no state`]);
    if (!Array.isArray(s.trace) || s.trace.length === 0) failures.push([slug, `step ${i} has an empty trace`]);
  }
  steps += res.steps.length;
}

console.log(`checked ${slugs.length} problem(s), ${steps} steps generated`);
if (failures.length) {
  console.log(`\n${failures.length} problem(s) with issues:`);
  for (const [slug, msg] of failures) console.log(`  ${slug}: ${msg}`);
  process.exit(1);
}
console.log('all good');
