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
//   node scripts/brute-progress.mjs --watch    live view: redraws every 5s with
//                                              elapsed time, pace and an ETA
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBLEMS = path.join(ROOT, 'src/problems');
const wantTodo = process.argv.includes('--todo');
const wantJson = process.argv.includes('--json');
const wantWatch = process.argv.includes('--watch');

// Each ProblemDef literal starts at its `slug:` and ends where the next one
// starts, so slicing between consecutive slug offsets gives one problem's
// full source — enough to ask whether it declares a `brute:` approach.
function scanFile(file) {
  const src = readFileSync(path.join(PROBLEMS, file), 'utf8');
  // A factory can build several problems from one literal, e.g.
  // `slug: isII ? 'course-schedule-ii' : 'course-schedule',` — every quoted
  // string on the slug line is its own problem sharing that body.
  const marks = [...src.matchAll(/^\s*slug: (.+),$/gm)];
  return marks.flatMap((m, i) => {
    const body = src.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : src.length);
    const category = body.match(/^\s*category: '([^']+)',/m)?.[1] ?? 'Uncategorized';
    const done = /^\s*brute: \{/m.test(body);
    return [...m[1].matchAll(/'([^']+)'/g)].map(([, slug]) => ({ slug, title: slug, category, file, done }));
  });
}

function report(out) {
  const problems = readdirSync(PROBLEMS)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .flatMap(scanFile)
    .sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug));

  const total = problems.length;
  const done = problems.filter((p) => p.done).length;
  const pct = total === 0 ? 0 : (done / total) * 100;

  if (wantJson) {
    out(JSON.stringify({ done, total, pct: Number(pct.toFixed(1)), problems }, null, 2));
    return;
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
  out('\nSecond-approach (brute force) coverage\n');
  for (const [name, c] of [...byCategory].sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total)) {
    const frac = c.done / c.total;
    const flag = c.done === c.total ? '✓' : ' ';
    out(
      `${flag} ${name.padEnd(width)}  ${bar(frac, 18)} ` +
        `${String(c.done).padStart(3)}/${String(c.total).padEnd(3)} ${(frac * 100).toFixed(0).padStart(3)}%`
    );
  }

  out(`\n  ${bar(done / (total || 1))}  ${done}/${total} questions  ${pct.toFixed(1)}% complete\n`);

  if (wantTodo) {
    const pending = problems.filter((p) => !p.done);
    out(`Remaining (${pending.length}):`);
    for (const p of pending) out(`  ${p.category.padEnd(width)}  ${p.slug}   [${p.file}]`);
    out();
  }
  return { done, total };
}

const fmtDuration = (ms) => {
  const t = Math.round(ms / 1000);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(sec).padStart(2, '0')}s`;
};

if (!wantWatch) {
  report(console.log);
} else {
  // Pace is measured from when the watch started, so the ETA reflects the
  // current session's speed rather than all-time history.
  const startedAt = Date.now();
  let startDone = null;
  const tick = () => {
    const lines = [];
    const { done, total } = report((...a) => lines.push(a.join(' ')));
    startDone ??= done;
    const elapsed = Date.now() - startedAt;
    const gained = done - startDone;
    const perHour = elapsed > 0 ? (gained / elapsed) * 3_600_000 : 0;
    const eta = gained > 0 ? fmtDuration(((total - done) / gained) * elapsed) : '— (waiting for the first new question)';
    process.stdout.write('\x1b[2J\x1b[H');
    console.log(lines.join('\n'));
    console.log(`  ⏱  elapsed ${fmtDuration(elapsed)}   +${gained} this session   ${perHour.toFixed(1)} / hour`);
    console.log(`  ⏳ remaining ${total - done}   ETA ${eta}`);
    console.log(`  (refreshing every 5s — ${new Date().toLocaleTimeString()}; Ctrl+C to stop)`);
  };
  tick();
  setInterval(tick, 5000);
}
