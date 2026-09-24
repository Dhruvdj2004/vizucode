// End-to-end check of the Aptitude & OA section in headless Chrome:
// dashboard → topic selection → 20-question / 20-minute test → answering,
// marking, palette, previous/next → refresh restores the test → time warnings
// → submit → results + review → server sync → coverage → dashboard. Also
// covers the leave-guard (abandon), live auto-submit at 00:00, a test that
// expired while the tab was closed, smart topic practice, and phone layout.
//
// Runs its own API server on :4100 WITHOUT a database (in-memory store, never
// touches DATABASE_URL) and its own Vite dev server on :5196 proxying to it.
//
// Usage: node scripts/verify-aptitude.mjs [--screenshot]
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_PORT = 4100;
const VITE_PORT = 5196;
const CDP_PORT = 9336;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = path.join(ROOT, '.verify-chrome-profile-aptitude');
const SHOTS = path.join(ROOT, '.verify-screenshots');
const wantShots = process.argv.includes('--screenshot');
const BASE = `http://localhost:${VITE_PORT}/`;

let api, vite, chrome;
let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => {
  failures++;
  console.log(`  ✗ ${m}`);
};
const expect = (cond, m) => (cond ? ok(m) : fail(m));

function cdp(ws) {
  let nextId = 1;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result ?? { error: msg.error });
      pending.delete(msg.id);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  });
  const call = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  call.on = (fn) => listeners.push(fn);
  return call;
}

async function main() {
  // API server, database-free.
  const tmp = mkdtempSync(path.join(tmpdir(), 'vizu-apt-api-'));
  const apiFile = path.join(tmp, 'server.mjs');
  await build({ entryPoints: [path.join(ROOT, 'server/index.ts')], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: apiFile, logLevel: 'warning', absWorkingDir: ROOT });
  const env = { ...process.env, PORT: String(API_PORT), NODE_PATH: path.join(ROOT, 'node_modules') };
  delete env.DATABASE_URL;
  writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
  rmSync(path.join(tmp, 'node_modules'), { force: true, recursive: true });
  // Resolve bare imports against the project's node_modules.
  const { symlinkSync } = await import('node:fs');
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'));
  api = spawn(process.execPath, [apiFile], { env, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => {
    api.stdout.on('data', (d) => String(d).includes('listening') && resolve());
    api.on('exit', (c) => reject(new Error(`API exited ${c}`)));
  });

  vite = await createServer({ root: ROOT, logLevel: 'warn', server: { port: VITE_PORT, strictPort: true, proxy: { '/api': `http://localhost:${API_PORT}` } } });
  await vite.listen();

  rmSync(PROFILE_DIR, { recursive: true, force: true });
  chrome = spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE_DIR}`, '--headless=new', '--disable-gpu', '--no-first-run', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      target = (await (await fetch(`http://localhost:${CDP_PORT}/json`)).json()).find((t) => t.type === 'page');
    } catch {}
    if (!target) await sleep(250);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  const call = cdp(ws);
  const errors = [];
  call.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    if (m.method === 'Page.javascriptDialogOpening') call('Page.handleJavaScriptDialog', { accept: true });
  });
  await call('Runtime.enable');
  await call('Page.enable');

  const ev = async (expr) => {
    const r = await call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`${expr.slice(0, 80)} → ${r.exceptionDetails.exception?.description}`);
    return r.result?.value;
  };
  const waitFor = async (expr, ms = 10000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await ev(expr).catch(() => false)) return true;
      await sleep(120);
    }
    return false;
  };
  const go = async (hash) => {
    await ev(`location.hash = ${JSON.stringify(hash)}`);
    await sleep(350);
  };
  const text = () => ev('document.body.innerText');
  const shot = async (name) => {
    if (!wantShots) return;
    mkdirSync(SHOTS, { recursive: true });
    const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(path.join(SHOTS, `aptitude-${name}.png`), Buffer.from(data, 'base64'));
  };
  const clickText = (sel, t) => ev(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.textContent.trim().startsWith(${JSON.stringify(t)})); if (!el) return false; el.click(); return true; })()`);
  const active = () => ev(`(() => { const s = JSON.parse(localStorage.getItem('vizucode-session')); return JSON.parse(localStorage.getItem('vizucode-apt-' + s.user.id + '-active')); })()`);
  const history = () => ev(`(() => { const s = JSON.parse(localStorage.getItem('vizucode-session')); return JSON.parse(localStorage.getItem('vizucode-apt-' + s.user.id + '-history') || '[]'); })()`);
  const patchActive = (js) => ev(`(() => { const s = JSON.parse(localStorage.getItem('vizucode-session')); const k = 'vizucode-apt-' + s.user.id + '-active'; const a = JSON.parse(localStorage.getItem(k)); ${js}; localStorage.setItem(k, JSON.stringify(a)); })()`);
  const reload = async () => {
    await call('Page.reload', { ignoreCache: false });
    await sleep(900);
  };

  // ── sign in (fresh account on the in-memory API) ──
  await call('Page.navigate', { url: `${BASE}#/login` });
  await waitFor(`document.readyState === 'complete'`);
  const email = `apt-${Date.now()}@example.com`;
  const reg = await ev(`fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: '${email}', password: 'aptitude-test-1', firstName: 'Tester' }) }).then(r => r.json())`);
  if (!reg?.token) throw new Error(`register failed: ${JSON.stringify(reg)}`);
  await ev(`localStorage.setItem('vizucode-session', JSON.stringify(${JSON.stringify({ token: reg.token, user: reg.user })}))`);
  const token = reg.token;

  console.log('Dashboard');
  await go('#/aptitude');
  expect(await waitFor(`document.body.innerText.includes('Aptitude & OA Practice')`), 'dashboard renders');
  expect(await ev(`!!document.querySelector('.site-nav a[href="#/aptitude"].on')`), 'header nav highlights Aptitude');
  expect((await text()).includes('No attempts yet'), 'empty state for a new user');
  await shot('01-dashboard-empty');

  console.log('Topic selection');
  await go('#/aptitude/start/full');
  await waitFor(`!!document.querySelector('.apt-cat-head input')`);
  expect(await ev(`document.querySelector('.apt-start').disabled`), 'start disabled with no topics');
  await clickText('button', 'Select all');
  expect(await ev(`[...document.querySelectorAll('.apt-chip input')].every(i => i.checked)`), 'Select all ticks every topic');
  await clickText('button', 'Clear all');
  expect(await ev(`[...document.querySelectorAll('.apt-chip input')].every(i => !i.checked)`), 'Clear all unticks every topic');
  await ev(`document.querySelectorAll('.apt-cat-head input')[0].click()`); // Quant
  await ev(`document.querySelectorAll('.apt-cat-head input')[1].click()`); // Logical
  await sleep(150);
  const summary = await ev(`document.querySelector('.apt-summary').innerText`);
  expect(/Questions\s*20/.test(summary) && /20 min/.test(summary) && /8 \/ 6 \/ 6/.test(summary), 'summary shows 20 questions · 20 min · 8/6/6');
  await shot('02-setup');
  await ev(`document.querySelector('.apt-start').click()`);

  console.log('Test');
  expect(await waitFor(`!!document.querySelector('.apt-topbar')`), 'test screen opens');
  const a0 = await active();
  const bank = await ev(`import('/src/aptitude/bank/index.ts').then(m => Object.fromEntries(m.QUESTION_BANK.map(q => [q.id, { d: q.difficulty, c: q.category, a: q.correctAnswer }])))`);
  const diff = { easy: 0, medium: 0, hard: 0 };
  const cats = {};
  a0.questionIds.forEach((id) => {
    diff[bank[id].d]++;
    cats[bank[id].c] = (cats[bank[id].c] ?? 0) + 1;
  });
  expect(a0.questionIds.length === 20 && new Set(a0.questionIds).size === 20, '20 distinct questions');
  expect(a0.config.durationSec === 1200, 'duration is exactly 20 minutes');
  expect(diff.easy === 8 && diff.medium === 6 && diff.hard === 6, `difficulty 8/6/6 (got ${diff.easy}/${diff.medium}/${diff.hard})`);
  expect(cats.quant === 10 && cats.logical === 10, `10 quant + 10 logical (got ${JSON.stringify(cats)})`);
  expect(a0.optionOrder.some((o) => o.join() !== '0,1,2,3'), 'options are shuffled');
  const t0 = await ev(`document.querySelector('.apt-timer').innerText`);
  expect(/(20:00|19:5\d)/.test(t0), `timer starts at 20:00 (shows ${t0.replace(/\s+/g, ' ')})`);
  expect((await text()).includes('Question 1 / 20'), 'shows Question 1 / 20');
  expect(!(await ev(`!!document.querySelector('.apt-question .badge')`)), 'difficulty is hidden during the test');
  expect(!(await ev(`!!document.querySelector('.apt-explain')`)), 'no explanations during the test');
  expect((await ev(`document.querySelectorAll('.apt-palette .apt-palette-grid .apt-cell').length`)) === 20, 'palette has 20 cells');

  // Answer 0–13 (correct for even k, wrong for odd), mark 3 and 7, answer+clear 14, skip 15–19, mark 17.
  const plan = [];
  for (let k = 0; k < 20; k++) {
    const q = bank[a0.questionIds[k]];
    const order = a0.optionOrder[k];
    let pick = null;
    if (k < 14) pick = k % 2 === 0 ? q.a : (q.a + 1) % 4;
    if (k === 14) {
      await ev(`document.querySelectorAll('.apt-option')[0].click()`);
      await sleep(60);
      await clickText('.apt-q-actions button', 'Clear answer');
    }
    if (pick !== null) await ev(`document.querySelectorAll('.apt-option')[${order.indexOf(pick)}].click()`);
    if (k === 3 || k === 7 || k === 17) await ev(`document.querySelector('.apt-mark-btn').click()`);
    plan.push(pick);
    await sleep(60);
    if (k < 19) await ev(`document.querySelector('.apt-q-actions .btn.primary').click()`);
    await sleep(60);
  }
  expect((await text()).includes('Question 20 / 20'), 'Next walks to question 20');
  await clickText('.apt-q-actions button', '← Previous');
  await sleep(100);
  expect((await text()).includes('Question 19 / 20'), 'Previous goes back');
  await ev(`document.querySelectorAll('.apt-palette .apt-palette-grid .apt-cell')[12].click()`);
  await sleep(100);
  expect((await text()).includes('Question 13 / 20'), 'palette jumps to a question');
  const cells = await ev(`[...document.querySelectorAll('.apt-palette .apt-palette-grid .apt-cell')].map(c => c.className)`);
  expect(cells.filter((c) => c.includes('ans-marked')).length === 2, 'answered + marked state (2)');
  expect(cells.filter((c) => /\bmarked\b/.test(c) && !c.includes('ans-marked')).length === 1, 'marked-only state (1)');
  expect(cells.filter((c) => /\banswered\b/.test(c)).length === 12, 'answered state (12)');
  expect(cells.filter((c) => /\bvisited\b/.test(c)).length === 5, 'visited-not-answered state (5)');
  const a1 = await active();
  expect(a1.answers.filter((x) => x !== null).length === 14, '14 answers stored (clear answer worked)');
  await shot('03-test');

  console.log('Refresh restores the test');
  const before = await ev(`document.querySelector('.apt-timer').innerText`);
  await sleep(1200);
  await reload();
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  const after = await ev(`document.querySelector('.apt-timer').innerText`);
  const secs = (s) => {
    const [m, x] = s.match(/\d\d:\d\d/)[0].split(':').map(Number);
    return m * 60 + x;
  };
  expect((await text()).includes('Question 13 / 20'), 'same question after refresh');
  expect(secs(after) < secs(before) && secs(after) > secs(before) - 10, `timer kept running across refresh (${before.match(/\d\d:\d\d/)} → ${after.match(/\d\d:\d\d/)})`);
  expect((await active()).answers.filter((x) => x !== null).length === 14, 'answers survived refresh');

  console.log('Time warnings');
  await patchActive(`a.startedAt = Date.now() - (a.config.durationSec - 598) * 1000`);
  await reload();
  expect(await waitFor(`document.querySelector('.apt-toast')?.innerText.includes('10 minutes remaining')`, 4000), '10-minute warning');
  await patchActive(`a.startedAt = Date.now() - (a.config.durationSec - 58) * 1000`);
  await reload();
  expect(await waitFor(`document.querySelector('.apt-toast')?.innerText.includes('1 minute remaining')`, 4000), '1-minute warning (skips stale 5-min warning)');
  expect(await ev(`document.querySelector('.apt-timer').classList.contains('crit')`), 'timer turns critical under a minute');
  await shot('04-test-warning');
  await patchActive(`a.startedAt = Date.now() - 300 * 1000`); // back to 15 min left

  await reload();
  await waitFor(`!!document.querySelector('.apt-submit')`);
  console.log('Submit');
  await ev(`document.querySelector('.apt-submit').click()`);
  expect(await waitFor(`document.querySelector('.apt-modal')?.innerText.includes('14 answered')`), 'submit dialog shows counts');
  await clickText('.apt-modal button', 'Keep working');
  expect(!(await ev(`!!document.querySelector('.apt-modal')`)), 'Keep working closes the dialog');
  await ev(`document.querySelector('.apt-submit').click()`);
  await sleep(100);
  await clickText('.apt-modal button', 'Submit');
  expect(await waitFor(`location.hash.startsWith('#/aptitude/result/')`), 'manual submit opens results');
  await waitFor(`document.body.innerText.includes('Test completed')`);
  const exp = { correct: plan.filter((p, k) => p !== null && k % 2 === 0).length, incorrect: plan.filter((p, k) => p !== null && k % 2 === 1).length };
  const tiles = await ev(`Object.fromEntries([...document.querySelectorAll('.apt-result-tiles .apt-stat')].map(t => [t.querySelector('.lbl').innerText, t.querySelector('.num').innerText]))`);
  expect(tiles.Correct === String(exp.correct) && tiles.Incorrect === String(exp.incorrect) && tiles.Unattempted === '6', `correct/incorrect/unattempted = ${exp.correct}/${exp.incorrect}/6 (got ${tiles.Correct}/${tiles.Incorrect}/${tiles.Unattempted})`);
  expect((await ev(`document.querySelector('.apt-score-num').innerText`)).replace(/\s/g, '') === `${exp.correct}/20`, `score ${exp.correct}/20`);
  const diffRows = await ev(`[...document.querySelectorAll('.apt-two .panel')[0].querySelectorAll('li')].slice(0,3).map(l => l.innerText.replace(/\\s+/g,' '))`);
  expect(/Easy.*\/8/.test(diffRows[0]) && /Medium.*\/6/.test(diffRows[1]) && /Hard.*\/6/.test(diffRows[2]), `difficulty performance rows (${diffRows.join(' | ')})`);
  expect((await text()).includes('Quantitative Aptitude') && (await text()).includes('Logical Reasoning'), 'section performance lists both sections');
  expect((await ev(`document.querySelectorAll('.apt-review').length`)) === 20, 'review shows all 20 questions');
  expect((await ev(`document.querySelectorAll('.apt-review .apt-explain').length`)) === 20, 'every review item has an explanation');
  expect((await ev(`document.querySelectorAll('.apt-review .badge').length`)) === 20, 'difficulty shown after submission');
  expect((await ev(`document.querySelectorAll('.apt-rec').length`)) >= 1, 'recommended next practice');
  await clickText('.apt-filter button', 'Incorrect');
  await sleep(100);
  expect((await ev(`document.querySelectorAll('.apt-review').length`)) === exp.incorrect, 'review filter: Incorrect');
  await clickText('.apt-filter button', 'Marked');
  await sleep(100);
  expect((await ev(`document.querySelectorAll('.apt-review').length`)) === 3, 'review filter: Marked');
  await clickText('.apt-filter button', 'All');
  await shot('05-result');

  console.log('Server sync');
  await sleep(500);
  const remote = await ev(`fetch('/api/aptitude/attempts', { headers: { Authorization: 'Bearer ${token}' } }).then(r => r.json())`);
  expect(remote.attempts?.length === 1 && remote.attempts[0].status === 'submitted', 'attempt stored on the server');
  const tamper = await ev(`fetch('/api/aptitude/attempts/apt_x', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ${token}' }, body: JSON.stringify({ id: 'apt_x', questionIds: ['nope'] }) }).then(r => r.status)`);
  expect(tamper === 400, 'server rejects a malformed attempt');
  const noauth = await ev(`fetch('/api/aptitude/attempts').then(r => r.status)`);
  expect(noauth === 401, 'server requires auth');

  console.log('Coverage & dashboard');
  await go('#/aptitude/coverage');
  await waitFor(`!!document.querySelector('.apt-cov-cat')`);
  const total = Object.keys(bank).length;
  expect((await ev(`document.querySelector('.apt-coverage-total').innerText`)).includes(`20/${total}`), `whole-bank coverage 20/${total}`);
  expect((await ev(`document.querySelectorAll('.apt-missed').length`)) === exp.incorrect, 'questions to revisit = incorrect answers');
  await ev(`document.querySelector('.apt-cov-row').click()`);
  expect(await waitFor(`!!document.querySelector('.apt-cov-subs')`), 'topic expands to subtopics');
  await shot('06-coverage');
  await go('#/aptitude');
  await waitFor(`!!document.querySelector('.apt-stats')`);
  const stats = await ev(`Object.fromEntries([...document.querySelectorAll('.apt-stats .apt-stat')].map(t => [t.querySelector('.lbl').innerText, t.querySelector('.num').innerText]))`);
  expect(stats['Tests completed'] === '1' && stats['Questions attempted'] === '14' && stats['Solved correctly'] === String(exp.correct), `dashboard stats (${JSON.stringify(stats)})`);
  expect((await ev(`document.querySelectorAll('.apt-recent li').length`)) === 1, 'recent attempts list');
  await shot('07-dashboard');

  console.log('Practice again gives a different set');
  await go(`#/aptitude/result/${remote.attempts[0].id}`);
  await waitFor(`document.body.innerText.includes('Practice again')`);
  await clickText('button', '↻ Practice again');
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  const again = await active();
  const overlap = again.questionIds.filter((id) => a0.questionIds.includes(id)).length;
  expect(overlap < 10, `new set differs from the last one (${overlap}/20 overlap)`);

  console.log('Leave guard');
  await ev(`document.querySelector('.site-nav a[href="#/core"]').click()`);
  expect(await waitFor(`document.querySelector('.apt-modal')?.innerText.includes('Your test is in progress. Are you sure you want to leave?')`), 'leaving shows the confirm dialog');
  await clickText('.apt-modal button', 'Stay on test');
  expect((await ev('location.hash')) === '#/aptitude/test', 'Stay keeps you on the test');
  await ev(`document.querySelector('.site-nav a[href="#/core"]').click()`);
  await sleep(100);
  await clickText('.apt-modal button', 'Leave');
  expect(await waitFor(`location.hash === '#/core'`), 'Leave navigates away');
  const h1 = await history();
  expect(h1[0]?.status === 'abandoned' && !(await active()), 'attempt saved as abandoned');

  console.log('Auto-submit at 00:00');
  await go('#/aptitude/start/mixed');
  await waitFor(`!!document.querySelector('.apt-start')`);
  await ev(`document.querySelector('.apt-start').click()`);
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  await ev(`document.querySelectorAll('.apt-option')[0].click()`);
  const liveId = (await active()).id;
  await patchActive(`a.startedAt = Date.now() - (a.config.durationSec - 3) * 1000`);
  await reload();
  expect(await waitFor(`location.hash.startsWith('#/aptitude/result/') && document.body.innerText.includes("Time's up")`, 8000), 'live timer auto-submits at 00:00');
  const live = (await history()).find((a) => a.id === liveId);
  expect(live?.status === 'timeout' && live.answers.filter((x) => x !== null).length === 1, 'stored as timed out, with the answer given');

  console.log('Expired while the tab was closed');
  await go('#/aptitude/start/company');
  await waitFor(`!!document.querySelector('.apt-company')`);
  expect((await text()).includes('not actual or leaked company questions'), 'company mode shows the "company-style" disclaimer');
  await ev(`document.querySelector('.apt-start').click()`);
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  expect((await text()).includes('TCS-style practice'), 'company-style test title');
  const awayId = (await active()).id;
  await patchActive(`a.startedAt = Date.now() - 25 * 60 * 1000`);
  await go('#/aptitude');
  await reload();
  await sleep(400);
  const away = (await history()).find((a) => a.id === awayId);
  expect(away?.status === 'timeout' && !(await active()), 'dashboard auto-submits an expired test');
  expect(away && away.submittedAt === away.startedAt + away.config.durationSec * 1000, 'expired test is capped at the 20-minute deadline');

  console.log('Topic practice (smart)');
  await go('#/aptitude/start/topic');
  await waitFor(`!!document.querySelector('.apt-seg')`);
  await clickText('.apt-chip', 'Time & Work');
  await clickText('.apt-seg button', 'Smart');
  await ev(`document.querySelector('.apt-start').click()`);
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  const tp = await active();
  expect(tp.config.selection === 'smart' && tp.config.topics.join() === 'Time & Work' && tp.questionIds.every((id) => id.startsWith('quant_')), 'smart topic practice starts on the chosen topic');
  expect(tp.config.durationSec === tp.questionIds.length * 60, 'topic practice is paced at 1 min/question');

  console.log('Phone layout');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await reload();
  await waitFor(`!!document.querySelector('.apt-topbar')`);
  expect((await ev(`document.documentElement.scrollWidth`)) <= 390, 'test screen has no horizontal scroll at 390px');
  expect(await ev(`getComputedStyle(document.querySelector('.apt-palette')).display === 'none'`), 'palette collapses on phones');
  await shot('08-phone-test');
  await clickText('button', 'All questions');
  expect(await ev(`getComputedStyle(document.querySelector('.apt-palette')).display !== 'none'`), 'palette toggle opens it');
  await shot('09-phone-palette');
  await ev(`document.querySelector('.apt-submit').click()`);
  await sleep(100);
  await clickText('.apt-modal button', 'Submit');
  await waitFor(`document.body.innerText.includes('Test completed')`);
  expect((await ev(`document.documentElement.scrollWidth`)) <= 390, 'result page has no horizontal scroll at 390px');
  await shot('10-phone-result');
  for (const h of ['#/aptitude', '#/aptitude/start/full', '#/aptitude/coverage']) {
    await go(h);
    await sleep(300);
    expect((await ev(`document.documentElement.scrollWidth`)) <= 390, `${h} has no horizontal scroll at 390px`);
  }
  await go('#/aptitude');
  await sleep(300);
  await shot('11-phone-dashboard');

  const real = errors.filter((e) => !/Download the React DevTools|favicon/.test(e));
  expect(real.length === 0, `no console errors${real.length ? ': ' + real.slice(0, 3).join(' | ') : ''}`);
}

try {
  await main();
} catch (e) {
  fail(`crashed: ${e.stack ?? e}`);
} finally {
  if (chrome && chrome.exitCode === null) {
    const exited = new Promise((r) => chrome.once('exit', r));
    chrome.kill();
    await Promise.race([exited, sleep(3000)]);
  }
  api?.kill();
  await vite?.close();
  try {
    rmSync(PROFILE_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    /* Chrome still flushing — the profile dir is gitignored, harmless */
  }
}
console.log(failures ? `\n${failures} check(s) failed.` : '\nAll aptitude flow checks passed.');
process.exit(failures ? 1 : 0);
