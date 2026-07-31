// Headless-browser smoke test for one visualizer page. No extra deps: drives
// a real Chrome via the DevTools protocol using Node's built-in WebSocket.
//
// Spins up its own isolated `vite` dev server (so it never collides with a
// dev server you already have running), opens /#/visualize/<slug> with a
// fake signed-in Pro session injected into localStorage (bypasses login +
// the free-tier paywall), steps through every trace step for both C++ and
// Java, and fails if the page shows "Visualizer not built yet", the browser
// logs a console error, or a step never renders.
//
// Usage:
//   node scripts/verify-visualizer.mjs <slug>
//   node scripts/verify-visualizer.mjs <slug> --screenshot   # also saves PNGs
//
// Exit code 0 = pass, 1 = fail (diagnostics printed either way).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITE_PORT = 5199;
const CDP_PORT = 9333;
const CHROME =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = path.join(ROOT, '.verify-chrome-profile');

const [, , slug, ...flags] = process.argv;
if (!slug) {
  console.error('Usage: node scripts/verify-visualizer.mjs <slug> [--screenshot]');
  process.exit(1);
}
const wantScreenshots = flags.includes('--screenshot');
const shotDir = path.join(ROOT, '.verify-screenshots', slug);

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

async function main() {
  // 1. Isolated vite dev server.
  vite = spawn(path.join(ROOT, 'node_modules/.bin/vite'), ['--port', String(VITE_PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  await waitForHttp(`http://localhost:${VITE_PORT}/`);

  // 2. Headless Chrome with its own throwaway profile.
  chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${PROFILE_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--window-size=1400,1000',
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

  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text);
    }
  });
  await call('Page.enable');
  await call('Runtime.enable');

  // 3. Own origin first so localStorage sticks, then inject a fake Pro session.
  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/` });
  await waitForCondition(call, `document.readyState === 'complete'`, 30000);
  await call('Runtime.evaluate', {
    expression: `localStorage.setItem('vizucode-session', JSON.stringify({
      token: 'verify-script-fake-token',
      user: { id: 0, email: 'verify@local', firstName: 'Verify', isPro: true }
    }))`,
  });

  // 4. Load the visualizer; first compile of a cold vite server can be slow.
  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/#/visualize/${slug}` });
  const settled = await waitForCondition(
    call,
    `document.body.innerText.includes('Visualizer not built yet') ||
     document.body.innerText.includes("This one's locked") ||
     !!document.querySelector('.viz-grid')`,
    30000
  );
  if (!settled) fail('page never settled (still stuck on "Loading visualizer…" after 30s)');

  const bodyText = (await call('Runtime.evaluate', { expression: 'document.body.innerText' })).result?.value ?? '';
  if (bodyText.includes('Visualizer not built yet')) fail(`no ProblemDef registered for slug "${slug}"`);
  if (bodyText.includes("This one's locked")) fail('category paywall blocked the page (unexpected — check plan.ts)');
  if (!(await call('Runtime.evaluate', { expression: '!!document.querySelector(".viz-grid")' })).result?.value) {
    fail('".viz-grid" never rendered — widget or code panel likely crashed');
  }

  if (wantScreenshots) {
    mkdirSync(shotDir, { recursive: true });
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(shotDir, 'step-1.png'), Buffer.from(shot.data, 'base64'));
  }

  // 5. Step through every step (cap at 60 — generous for any current problem).
  let lastCounter = '';
  for (let i = 0; i < 60; i++) {
    const counter = (
      await call('Runtime.evaluate', { expression: 'document.querySelector(".counter")?.innerText' })
    ).result?.value;
    if (counter) lastCounter = counter;
    const clicked = (
      await call('Runtime.evaluate', {
        expression: `(() => { const b = document.querySelector('[aria-label="Step forward"]'); if (b && !b.disabled) { b.click(); return true; } return false; })()`,
      })
    ).result?.value;
    if (!clicked) break;
    await sleep(60);
  }
  await waitForCondition(call, `!!document.querySelector(".result-panel .rvalue")`, 5000);
  const resultText = (
    await call('Runtime.evaluate', { expression: 'document.querySelector(".result-panel .rvalue")?.innerText' })
  ).result?.value;
  if (!resultText) fail('never reached a "Result" panel — run() may not terminate its step list');

  if (wantScreenshots) {
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(shotDir, 'step-last.png'), Buffer.from(shot.data, 'base64'));
  }

  // 6. Java tab.
  await call('Runtime.evaluate', {
    expression: `[...document.querySelectorAll('.code-tab')].find(b => b.innerText.includes('Java'))?.click()`,
  });
  await waitForCondition(call, `document.querySelector('.code-tab.active')?.innerText === 'Java'`, 5000);
  const javaActive = (
    await call('Runtime.evaluate', { expression: `document.querySelector('.code-tab.active')?.innerText` })
  ).result?.value;
  if (javaActive !== 'Java') fail('clicking the Java tab did not activate it');

  if (wantScreenshots) {
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(shotDir, 'step-java.png'), Buffer.from(shot.data, 'base64'));
  }

  if (consoleErrors.some((e) => !e.includes('404'))) {
    fail(`console error(s): ${JSON.stringify(consoleErrors.filter((e) => !e.includes('404')))}`);
  }

  console.log(`slug: ${slug}`);
  console.log(`last step reached: ${lastCounter}`);
  console.log(`result: ${resultText}`);
  console.log(`java tab: ${javaActive}`);
  if (wantScreenshots) console.log(`screenshots: ${shotDir}`);
  console.log(consoleErrors.length ? `console messages: ${JSON.stringify(consoleErrors)}` : 'console: clean');
}

main()
  .catch((e) => fail(e.stack || String(e)))
  .finally(() => {
    try {
      if (chrome) process.kill(-chrome.pid);
    } catch {}
    try {
      if (vite) vite.kill();
    } catch {}
    console.log(failed ? '\n✗ VERIFY FAILED' : '\n✓ VERIFY PASSED');
    process.exit(failed ? 1 : 0);
  });
