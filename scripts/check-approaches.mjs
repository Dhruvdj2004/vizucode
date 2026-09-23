// Fast headless check for the second approach (`brute`) of each ProblemDef.
//
// For every problem with a brute approach, runs it on the problem's default
// inputs and flags: a throw, a RunError, zero steps, a step tag that matches
// no tagged line in the brute's C++ or Java code, or a result that differs
// from the optimal solution's result on the same inputs.
//
// Usage:
//   node scripts/check-approaches.mjs              # all problems
//   node scripts/check-approaches.mjs <slug>...    # only these slugs
//   node scripts/check-approaches.mjs --missing    # list slugs with no brute
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const out = path.join(mkdtempSync(path.join(tmpdir(), 'vizu-approach-')), 'problems.mjs');
await build({
  entryPoints: [path.join(ROOT, 'src/problems/index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'warning',
});
const { problemRegistry } = await import(pathToFileURL(out).href);

if (args[0] === '--missing') {
  const missing = Object.values(problemRegistry).filter((p) => !p.brute).map((p) => p.slug);
  console.log(missing.join('\n'));
  console.log(`\n${missing.length} of ${Object.keys(problemRegistry).length} problems have no second approach.`);
  process.exit(0);
}

const slugs = args.length ? args : Object.keys(problemRegistry).filter((s) => problemRegistry[s].brute);
const failures = [];
const mismatches = [];

for (const slug of slugs) {
  const p = problemRegistry[slug];
  if (!p) { failures.push([slug, 'not in registry']); continue; }
  if (!p.brute) { failures.push([slug, 'no brute approach']); continue; }
  const values = Object.fromEntries(p.inputs.map((f) => [f.key, f.defaultValue]));
  let r;
  try { r = p.brute.run(values); } catch (e) { failures.push([slug, `throws: ${e.message}`]); continue; }
  if (r.error) { failures.push([slug, `RunError: ${r.error}`]); continue; }
  if (!r.steps?.length) { failures.push([slug, 'zero steps']); continue; }
  for (const lang of ['cpp', 'java']) {
    const tags = new Set(p.brute.code[lang].flatMap((l) => l.tags ?? []));
    const bad = [...new Set(r.steps.flatMap((s) => [s.tag, s.tag2].filter(Boolean)).filter((t) => !tags.has(t)))];
    if (bad.length) failures.push([slug, `${lang}: untagged step tag(s) ${bad.join(', ')}`]);
  }
  const opt = p.run(values);
  if (!opt.error && opt.result !== r.result) mismatches.push([slug, `optimal ${opt.result} vs ${p.brute.label} ${r.result}`]);
}

for (const [s, m] of mismatches) console.log(`~ ${s}: ${m}`);
for (const [s, m] of failures) console.log(`✗ ${s}: ${m}`);
console.log(`\nChecked ${slugs.length} approach(es): ${failures.length} failure(s), ${mismatches.length} result mismatch(es).`);
process.exit(failures.length ? 1 : 0);
