// Headless-browser smoke test for a theory module (dbms, revision, …). Same
// plumbing as verify-visualizer.mjs: its own vite dev server, its own throwaway
// Chrome profile, driven over the DevTools protocol with no extra dependencies.
//
// Walks the module index and then every topic page, and fails if a topic
// renders no sections, renders no diagrams, leaves the interview accordion
// empty, or logs a console error.
//
// Usage:
//   node scripts/verify-module.mjs                          # every module
//   node scripts/verify-module.mjs dbms                     # one module
//   node scripts/verify-module.mjs revision graph-basics    # one topic
//   node scripts/verify-module.mjs --screenshot             # also save PNGs
//
// Exit code 0 = pass, 1 = fail (diagnostics printed either way).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITE_PORT = 5198;
const CDP_PORT = 9334;
const CHROME =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = path.join(ROOT, '.verify-chrome-profile-module');

// Route bases of every theory module, matching the `key` in each registry.
const ALL_MODULES = ['dbms', 'os', 'oops', 'revision'];

const args = process.argv.slice(2);
const wantScreenshots = args.includes('--screenshot');
const positional = args.filter((a) => !a.startsWith('--'));
const modules = positional.filter((a) => ALL_MODULES.includes(a));
const onlySlugs = positional.filter((a) => !ALL_MODULES.includes(a));
const targets = modules.length ? modules : ALL_MODULES;

let vite, chrome;
let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`FAIL: ${msg}`);
};

function waitForHttp(url, tries = 60) {
  return (async () => {
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url);
        if (r.ok || r.status === 404) return true;
      } catch {}
      await sleep(500);
    }
    throw new Error(`Nothing answered at ${url}`);
  })();
}

async function waitForCondition(call, expression, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await call('Runtime.evaluate', { expression });
    if (r.result?.value) return true;
    await sleep(150);
  }
  return false;
}

function cdp(ws) {
  let nextId = 1;
  return (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      const handler = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
}

const evalNum = async (call, expr) =>
  (await call('Runtime.evaluate', { expression: expr })).result?.value ?? 0;

async function main() {
  vite = spawn(path.join(ROOT, 'node_modules/.bin/vite'), ['--port', String(VITE_PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  await waitForHttp(`http://localhost:${VITE_PORT}/`);

  chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--window-size=1400,1200',
    ],
    { stdio: 'ignore', detached: true }
  );
  await waitForHttp(`http://localhost:${CDP_PORT}/json/version`);

  const target = await (await fetch(`http://localhost:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  const call = cdp(ws);

  let consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      // `.text` is just "Uncaught" — the real message lives on the exception object.
      const d = msg.params.exceptionDetails;
      consoleErrors.push(d.exception?.description || d.exception?.value || d.text);
    }
  });
  await call('Page.enable');
  await call('Runtime.enable');

  // Own origin first so localStorage sticks, then inject a fake Pro session
  // (bypasses both login and the free-tier topic gate).
  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/` });
  await waitForCondition(call, `document.readyState === 'complete'`, 30000);
  await call('Runtime.evaluate', {
    expression: `localStorage.setItem('vizucode-session', JSON.stringify({
      token: 'verify-script-fake-token',
      user: { id: 0, email: 'verify@local', firstName: 'Verify', isPro: true }
    }))`,
  });

  let checked = 0;
  for (const base of targets) checked += await checkModule(call, base, () => consoleErrors, (v) => (consoleErrors = v));

  console.log(failed ? '\nFAILED' : `\nPASS — ${checked} topics checked across ${targets.join(', ')}`);
}

/** Walk one module's index page and every topic under it. Returns topics checked. */
async function checkModule(call, base, getErrors, setErrors) {
  const shotDir = path.join(ROOT, '.verify-screenshots', base);

  // ---- Module index ----
  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/#/${base}` });
  if (!(await waitForCondition(call, `!!document.querySelector('.db-card')`, 30000))) {
    fail(`/#/${base} never rendered any topic cards`);
    return 0;
  }
  const cardCount = await evalNum(call, `document.querySelectorAll('.db-card').length`);
  const unitCount = await evalNum(call, `document.querySelectorAll('.db-unit').length`);
  console.log(`\n${base}: ${cardCount} topic cards across ${unitCount} units`);
  if (cardCount === 0) fail(`${base}: index page has no topic cards`);

  if (wantScreenshots) {
    mkdirSync(shotDir, { recursive: true });
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    writeFileSync(path.join(shotDir, 'index.png'), Buffer.from(shot.data, 'base64'));
  }

  // Slugs come from the rendered links, so the script never drifts from the registry.
  const slugsRaw = (
    await call('Runtime.evaluate', {
      expression: `JSON.stringify([...document.querySelectorAll('.db-card')]
        .map(a => a.getAttribute('href'))
        .filter(h => h && h.includes('/${base}/'))
        .map(h => h.split('/${base}/')[1]))`,
    })
  ).result?.value;
  let slugs = JSON.parse(slugsRaw || '[]');
  if (onlySlugs.length) slugs = slugs.filter((s) => onlySlugs.includes(s));
  if (slugs.length === 0) {
    if (!onlySlugs.length) fail(`${base}: no topic slugs found to check`);
    return 0;
  }

  // ---- Each topic ----
  for (const slug of slugs) {
    setErrors([]);
    await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/#/${base}/${slug}` });
    const ok = await waitForCondition(call, `!!document.querySelector('.db-section')`, 20000);
    if (!ok) {
      // Report what the page actually showed — a bare "never rendered" line hides
      // the React error that usually caused it.
      const errs = getErrors();
      const url = (await call('Runtime.evaluate', { expression: 'location.hash' })).result?.value;
      const text = (
        await call('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 200)' })
      ).result?.value;
      fail(`${slug}: no .db-section rendered (hash=${url})`);
      for (const e of errs) console.error(`       console: ${String(e).split('\n')[0]}`);
      console.error(`       body: ${JSON.stringify(text)}`);
      continue;
    }

    const sections = await evalNum(call, `document.querySelectorAll('.db-section').length`);
    const diagrams = await evalNum(call, `document.querySelectorAll('svg.dg').length`);
    const questions = await evalNum(call, `document.querySelectorAll('.db-qa-item').length`);
    const tocLinks = await evalNum(call, `document.querySelectorAll('.db-toc a').length`);
    const gated = await evalNum(call, `!!document.querySelector('.db-gate')`);

    if (gated) fail(`${slug}: showed the Pro gate despite an isPro session`);
    // Every topic has its content sections plus the interview section.
    if (sections < 3) fail(`${slug}: only ${sections} sections rendered`);
    if (questions < 5) fail(`${slug}: only ${questions} interview questions`);
    if (tocLinks !== sections) fail(`${slug}: ${tocLinks} contents links vs ${sections} sections`);

    // Reveal the answers so the accordion body is exercised too. Wait for them
    // rather than sleeping a fixed amount — React had not always committed the
    // state update within a flat 120ms, which made this check flaky.
    await call('Runtime.evaluate', {
      expression: `document.querySelector('.db-qa-toggle')?.click()`,
    });
    await waitForCondition(call, `document.querySelectorAll('.db-qa-a').length === ${questions}`, 5000);
    const answers = await evalNum(call, `document.querySelectorAll('.db-qa-a').length`);
    if (answers !== questions) fail(`${slug}: "reveal all" opened ${answers}/${questions} answers`);

    // A diagram that renders zero-width means the SVG never laid out.
    const badSvg = await evalNum(
      call,
      `[...document.querySelectorAll('svg.dg')].filter(s => s.getBoundingClientRect().width < 50).length`
    );
    if (badSvg > 0) fail(`${slug}: ${badSvg} diagram(s) rendered with no width`);

    const errs = getErrors();
    if (errs.length) fail(`${slug}: console error — ${errs[0]}`);

    console.log(
      `${gated ? '✗' : '✓'} ${slug.padEnd(26)} ${String(sections).padStart(2)} sections · ` +
        `${String(diagrams).padStart(2)} diagrams · ${String(questions).padStart(2)} questions`
    );

    if (wantScreenshots) {
      mkdirSync(shotDir, { recursive: true });
      const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(path.join(shotDir, `${slug}.png`), Buffer.from(shot.data, 'base64'));
    }
  }

  return slugs.length;
}

main()
  .catch((e) => {
    console.error(e);
    failed = true;
  })
  .finally(() => {
    try {
      vite?.kill();
    } catch {}
    try {
      if (chrome?.pid) process.kill(-chrome.pid);
    } catch {}
    process.exit(failed ? 1 : 0);
  });
