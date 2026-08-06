// Checks the home page's module entry points: that both cards render, show a
// non-zero topic count, and actually navigate to their module index.
//
// Usage: node scripts/verify-home.mjs [--screenshot]
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITE_PORT = 5197;
const CDP_PORT = 9335;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = path.join(ROOT, '.verify-chrome-profile-home');
const wantScreenshots = process.argv.includes('--screenshot');

let vite, chrome;
let failed = false;
const fail = (m) => {
  failed = true;
  console.error(`FAIL: ${m}`);
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

async function waitFor(call, expr, ms = 15000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const r = await call('Runtime.evaluate', { expression: expr });
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

const val = async (call, expr) => (await call('Runtime.evaluate', { expression: expr })).result?.value;

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
      '--window-size=1400,1100',
    ],
    { stdio: 'ignore', detached: true }
  );
  await waitForHttp(`http://localhost:${CDP_PORT}/json/version`);

  const target = await (await fetch(`http://localhost:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const call = cdp(ws);

  const errors = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push(d.exception?.description || d.exception?.value || d.text);
    }
  });
  await call('Page.enable');
  await call('Runtime.enable');

  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/` });
  await waitFor(call, `document.readyState === 'complete'`, 30000);
  await call('Runtime.evaluate', {
    expression: `localStorage.setItem('vizucode-session', JSON.stringify({
      token: 'verify', user: { id: 0, email: 'v@local', firstName: 'Verify', isPro: true } }))`,
  });
  await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/#/` });

  if (!(await waitFor(call, `document.querySelectorAll('.mod-cta').length === 2`, 30000))) {
    const n = await val(call, `document.querySelectorAll('.mod-cta').length`);
    fail(`expected 2 module cards on the home page, found ${n}`);
  }

  const cards = JSON.parse(
    (await val(
      call,
      `JSON.stringify([...document.querySelectorAll('.mod-cta')].map(a => ({
         href: a.getAttribute('href'),
         title: a.querySelector('.mod-cta-title')?.textContent,
         meta: a.querySelector('.mod-cta-meta')?.textContent,
         w: Math.round(a.getBoundingClientRect().width),
         h: Math.round(a.getBoundingClientRect().height),
       })))`
    )) || '[]'
  );

  for (const c of cards) {
    console.log(`card: ${c.title} → ${c.href}  [${c.meta}]  ${c.w}×${c.h}px`);
    if (!c.href) fail(`card "${c.title}" has no href`);
    if (!c.meta || /(^|\s)0 topics/.test(c.meta)) fail(`card "${c.title}" reports no topics: ${c.meta}`);
    if (c.h < 40 || c.w < 200) fail(`card "${c.title}" laid out too small (${c.w}×${c.h})`);
  }

  if (wantScreenshots) {
    const dir = path.join(ROOT, '.verify-screenshots', 'home');
    mkdirSync(dir, { recursive: true });
    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    writeFileSync(path.join(dir, 'home.png'), Buffer.from(shot.data, 'base64'));
  }

  // Click each card and confirm it lands on that module's index.
  for (const c of cards) {
    await call('Page.navigate', { url: `http://localhost:${VITE_PORT}/#/` });
    await waitFor(call, `!!document.querySelector('.mod-cta')`, 15000);
    await call('Runtime.evaluate', {
      expression: `[...document.querySelectorAll('.mod-cta')].find(a => a.getAttribute('href') === '${c.href}')?.click()`,
    });
    const landed = await waitFor(call, `!!document.querySelector('.db-card')`, 15000);
    const hash = await val(call, 'location.hash');
    if (!landed) fail(`clicking "${c.title}" did not open a module index (hash=${hash})`);
    else console.log(`click: ${c.title} → ${hash} ✓`);
  }

  if (errors.length) fail(`console error — ${String(errors[0]).split('\n')[0]}`);
  console.log(failed ? '\nFAILED' : '\nPASS — home page module buttons work');
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
