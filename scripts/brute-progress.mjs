// How far along the "second approach for every question" work is.
//
// Counts the ProblemDefs that carry a `brute` approach against the full
// registry and prints a percentage, plus the per-category breakdown so the
// next batch is obvious. Reads the TypeScript sources directly rather than
// importing the bundle — no build step, so it stays usable mid-edit.
//
// Usage:
//   node scripts/brute-progress.mjs            percentage + per-category bars
//   node scripts/brute-progress.mjs --todo     also list every pending slug
//   node scripts/brute-progress.mjs --json     machine-readable, for scripts
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBLEMS = path.join(ROOT, 'src/problems');
const wantTodo = process.argv.includes('--todo');
const wantJson = process.argv.includes('--json');

// Each ProblemDef literal starts at its `slug:` and ends where the next one
// starts, so slicing between consecutive slug offsets gives one problem's
// full source — enough to ask whether it declares a `brute:` approach.
function scanFile(file) {
  const src = readFileSync(path.join(PROBLEMS, file), 'utf8');
  const marks = [...src.matchAll(/^\s*slug: '([^']+)',/gm)];
  return marks.map((m, i) => {
    const body = src.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : src.length);
    const category = body.match(/^\s*category: '([^']+)',/m)?.[1] ?? 'Uncategorized';
    const title = body.match(/^\s*title: '([^']*)',/m)?.[1] ?? m[1];
    return { slug: m[1], title, category, file, done: /^\s*brute: \{/m.test(body) };
  });
}

const problems = readdirSync(PROBLEMS)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .flatMap(scanFile)
  .sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug));

const total = problems.length;
const done = problems.filter((p) => p.done).length;
const pct = total === 0 ? 0 : (done / total) * 100;

if (wantJson) {
  console.log(JSON.stringify({ done, total, pct: Number(pct.toFixed(1)), problems }, null, 2));
  process.exit(0);
}

const bar = (frac, width = 34) => {
  const filled = Math.round(frac * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

const byCategory = new Map();
for (const p of problems) {
  const c = byCategory.get(p.category) ?? { done: 0, total: 0, pending: [] };
  c.total++;
  if (p.done) c.done++;
  else c.pending.push(p.slug);
  byCategory.set(p.category, c);
}

const width = Math.max(...[...byCategory.keys()].map((k) => k.length));
console.log('\nSecond-approach (brute force) coverage\n');
for (const [name, c] of [...byCategory].sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total)) {
  const frac = c.done / c.total;
  const flag = c.done === c.total ? '✓' : ' ';
  console.log(
    `${flag} ${name.padEnd(width)}  ${bar(frac, 18)} ` +
      `${String(c.done).padStart(3)}/${String(c.total).padEnd(3)} ${(frac * 100).toFixed(0).padStart(3)}%`
  );
}

console.log(`\n  ${bar(done / (total || 1))}  ${done}/${total} questions  ${pct.toFixed(1)}% complete\n`);

if (wantTodo) {
  const pending = problems.filter((p) => !p.done);
  console.log(`Remaining (${pending.length}):`);
  for (const p of pending) console.log(`  ${p.category.padEnd(width)}  ${p.slug}   [${p.file}]`);
  console.log();
}
