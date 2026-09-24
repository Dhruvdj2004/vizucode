// Quality gate for the Aptitude & OA question bank and test engine.
//
// 1. Validates every question: 4 distinct options, one keyed answer, a real
//    explanation that agrees with the key, a known topic, no duplicates, and
//    — where the bank supplies them — the answer recomputed in code (`calc`)
//    or checked by simulation (`check`).
// 2. Exercises the test generator across every mode: exact count, no
//    duplicates, 8/6/6 difficulty split when the pool allows, even category
//    split, valid option permutations, different sets on repeat attempts, and
//    smart mode actually favouring past mistakes.
//
// Usage: node scripts/validate-aptitude.mjs
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(mkdtempSync(path.join(tmpdir(), 'vizu-apt-')), 'apt.mjs');
await build({
  stdin: {
    contents: `
      export { rawQuant } from './src/aptitude/bank/quant';
      export { rawLogical } from './src/aptitude/bank/logical';
      export { rawAnalytical } from './src/aptitude/bank/analytical';
      export { rawVerbal } from './src/aptitude/bank/verbal';
      export { rawCoreCs } from './src/aptitude/bank/corecs';
      export { validateBank } from './src/aptitude/validate';
      export * from './src/aptitude/engine';
      export * from './src/aptitude/taxonomy';
      export { QUESTION_BANK, QUESTION_BY_ID } from './src/aptitude/bank';
    `,
    resolveDir: ROOT,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'warning',
});
const m = await import(pathToFileURL(out).href);

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log('  ✗ ' + msg);
};

// ── 1. bank ──
const problems = m.validateBank({
  quant: m.rawQuant,
  logical: m.rawLogical,
  analytical: m.rawAnalytical,
  verbal: m.rawVerbal,
  cs: m.rawCoreCs,
});
problems.forEach(fail);

const bank = m.QUESTION_BANK;
const by = (k) => bank.reduce((acc, q) => ((acc[q[k]] = (acc[q[k]] ?? 0) + 1), acc), {});
console.log(`Bank: ${bank.length} questions`);
console.log('  by category  ', by('category'));
console.log('  by difficulty', by('difficulty'));
const checked = [m.rawQuant, m.rawLogical, m.rawAnalytical, m.rawVerbal, m.rawCoreCs].flat().filter((r) => r.calc !== undefined || r.check).length;
console.log(`  ${checked} questions have a programmatic answer check`);
for (const c of m.CATEGORIES) {
  for (const t of c.topics) if (!bank.some((q) => q.topic === t)) fail(`topic "${t}" has no questions`);
}

// ── 2. engine ──
let seed = 12345;
const rng = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

function checkAttempt(label, a, { expectCount, expectDiff, expectCats }) {
  const qs = a.questionIds.map((id) => m.QUESTION_BY_ID.get(id));
  if (a.questionIds.length !== expectCount) fail(`${label}: ${a.questionIds.length} questions, expected ${expectCount}`);
  if (new Set(a.questionIds).size !== a.questionIds.length) fail(`${label}: duplicate question`);
  if (qs.some((q) => !a.config.topics.includes(q.topic))) fail(`${label}: question outside selected topics`);
  a.optionOrder.forEach((o, i) => {
    if ([...o].sort().join() !== '0,1,2,3') fail(`${label}: bad option order ${o}`);
    if (qs[i].fixedOptions && o.join() !== '0,1,2,3') fail(`${label}: fixed-option question shuffled`);
  });
  if (expectDiff) {
    const d = { easy: 0, medium: 0, hard: 0 };
    qs.forEach((q) => d[q.difficulty]++);
    if (d.easy !== expectDiff[0] || d.medium !== expectDiff[1] || d.hard !== expectDiff[2])
      fail(`${label}: difficulty ${d.easy}/${d.medium}/${d.hard}, expected ${expectDiff.join('/')}`);
  }
  if (expectCats) {
    const c = {};
    qs.forEach((q) => (c[q.category] = (c[q.category] ?? 0) + 1));
    for (const [k, n] of Object.entries(expectCats)) if (c[k] !== n) fail(`${label}: ${k} got ${c[k] ?? 0}, expected ${n}`);
  }
}

const quantLogic = [...m.CATEGORY_BY_KEY.quant.topics, ...m.CATEGORY_BY_KEY.logical.topics];
for (let i = 0; i < 300; i++) {
  checkAttempt('full quant+logical', m.generateTest(m.fullConfig(quantLogic, 'random'), [], rng), {
    expectCount: 20, expectDiff: [8, 6, 6], expectCats: { quant: 10, logical: 10 },
  });
  checkAttempt('full all', m.generateTest(m.fullConfig(m.ALL_TOPICS, 'random'), [], rng), { expectCount: 20, expectDiff: [8, 6, 6], expectCats: { quant: 4, logical: 4, analytical: 4, verbal: 4, cs: 4 } });
  checkAttempt('mixed', m.generateTest(m.presetConfig('mixed', 'random'), [], rng), { expectCount: 20, expectDiff: [8, 6, 6] });
  checkAttempt('core cs', m.generateTest(m.presetConfig('cs', 'random'), [], rng), { expectCount: 20, expectDiff: [8, 6, 6] });
}
for (const c of m.COMPANY_STYLES) {
  for (let i = 0; i < 50; i++) {
    const a = m.generateTest(m.presetConfig('company', 'random', c), [], rng);
    checkAttempt(`company ${c.key}`, a, { expectCount: 20, expectDiff: [8, 6, 6] });
  }
}
// Topic practice on every topic: never crashes, never duplicates, respects the pool size.
for (const t of m.ALL_TOPICS) {
  const n = m.availableFor([t]).length;
  const a = m.generateTest(m.topicConfig(t, 10, 'mixed', 'random'), [], rng);
  checkAttempt(`topic ${t}`, a, { expectCount: Math.min(10, n) });
  if (a.config.durationSec !== a.questionIds.length * 60) fail(`topic ${t}: duration not 1 min/question`);
  const h = m.generateTest(m.topicConfig(t, 10, 'hard', 'random'), [], rng);
  checkAttempt(`topic ${t} hard-focus`, h, { expectCount: Math.min(10, n) });
}
// Single topic with few hard questions: falls back instead of breaking.
const small = m.generateTest(m.fullConfig(['Percentages'], 'random'), [], rng);
checkAttempt('small pool', small, { expectCount: m.availableFor(['Percentages']).length });

// Repeat attempts differ.
const a1 = m.generateTest(m.fullConfig(m.ALL_TOPICS, 'random'), [], rng);
const done1 = { ...a1, status: 'submitted', submittedAt: a1.startedAt + 1000 };
const a2 = m.generateTest(m.fullConfig(m.ALL_TOPICS, 'random'), [done1], rng);
const overlap = a2.questionIds.filter((id) => a1.questionIds.includes(id)).length;
console.log(`Consecutive random tests share ${overlap}/20 questions`);
if (overlap > 6) fail(`consecutive tests overlap too much (${overlap})`);

// Smart mode prefers questions answered wrongly and weak topics.
const tw = m.fullConfig(['Time & Work', 'Percentages', 'Profit & Loss'], 'random');
const hist = [];
for (let k = 0; k < 3; k++) {
  const a = m.generateTest(tw, hist, rng, Date.now() - (5 - k) * 86400000);
  a.answers = a.questionIds.map((id) => {
    const q = m.QUESTION_BY_ID.get(id);
    return q.topic === 'Time & Work' ? (q.correctAnswer + 1) % 4 : q.correctAnswer;
  });
  a.status = 'submitted';
  a.submittedAt = a.startedAt + 600000;
  hist.push(a);
}
const count = (sel) => {
  let tw = 0;
  for (let i = 0; i < 200; i++) {
    const a = m.generateTest(m.fullConfig(['Time & Work', 'Percentages', 'Profit & Loss', 'Averages & Ages'], sel), hist, rng);
    tw += a.questionIds.filter((id) => m.QUESTION_BY_ID.get(id).topic === 'Time & Work').length;
  }
  return tw / 200;
};
const r = count('random');
const s = count('smart');
console.log(`Avg Time & Work questions per test after repeated mistakes: random ${r.toFixed(2)}, smart ${s.toFixed(2)}`);
if (!(s > r)) fail('smart practice does not favour the weak topic');

// Scoring round-trip.
const sc = m.generateTest(m.fullConfig(m.ALL_TOPICS, 'random'), [], rng);
sc.answers = sc.questionIds.map((id, i) => (i < 12 ? m.QUESTION_BY_ID.get(id).correctAnswer : i < 17 ? (m.QUESTION_BY_ID.get(id).correctAnswer + 1) % 4 : null));
sc.status = 'submitted';
sc.submittedAt = sc.startedAt + 16 * 60000 + 42000;
const res = m.scoreAttempt(sc);
if (res.correct !== 12 || res.incorrect !== 5 || res.unattempted !== 3) fail(`scoring: ${res.correct}/${res.incorrect}/${res.unattempted}`);
if (res.timeTakenSec !== 1002) fail(`time taken ${res.timeTakenSec}`);
if (res.byDifficulty.reduce((a, b) => a + b.total, 0) !== 20) fail('difficulty breakdown does not sum to 20');
const recs = m.recommendations(sc, []);
if (!recs.length) fail('no recommendations');
const dash = m.dashboardStats([sc]);
if (dash.testsCompleted !== 1 || dash.answered !== 17 || dash.answeredCorrect !== 12) fail('dashboard stats wrong');
const cov = m.coverage([sc]);
if (cov.reduce((a, c) => a + c.seen, 0) !== 20) fail('coverage seen != 20');

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
