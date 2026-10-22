// End-to-end check of the AI mock interview in headless Chrome, with real
// Gemini calls: setup page → upload a generated resume PDF → questions →
// a spoken answer through a fake microphone (if --audio is given) → a typed
// answer → end interview → report → free-limit message → phone layout.
//
// Runs its own API server on :4107 WITHOUT a database (in-memory store, never
// touches DATABASE_URL) and its own Vite dev server on :5197 proxying to it.
// Needs GEMINI_API_KEY in the environment.
//
// Usage: GEMINI_API_KEY=... node scripts/verify-interview.mjs [--audio answer.webm] [--screenshot]
//   answer.webm (or .wav/.mp3): someone answering an interview question out loud.
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_PORT = 4107;
const VITE_PORT = 5197;
const CDP_PORT = 9337;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE_DIR = path.join(ROOT, '.verify-chrome-profile-interview');
const SHOTS = path.join(ROOT, '.verify-screenshots');
const wantShots = process.argv.includes('--screenshot');
const audioArg = process.argv.indexOf('--audio');
const AUDIO = audioArg > 0 ? path.resolve(process.argv[audioArg + 1]) : null;
const BASE = `http://localhost:${VITE_PORT}/`;

let api, vite, chrome;
let failures = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => {
  failures++;
  console.log(`  ✗ ${m}`);
};
const expect = (cond, m) => (cond ? ok(m) : fail(m));

/** A one-page text PDF, built by hand so the check needs no PDF library. */
function resumePdf(lines) {
  const esc = (s) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const stream = `BT /F1 11 Tf 50 790 Td 14 TL ${lines.map((l) => `(${esc(l)}) '`).join(' ')} ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const RESUME = [
  'Priya Verma - B.Tech CSE, 2026 - CGPA 8.4',
  'Skills: Java, Python, React, Node.js, Express, PostgreSQL, Redis, Git',
  'Projects:',
  '- QuickBite: food ordering app (React, Node.js, MongoDB). Cached menus in Redis, 40% faster loads.',
  '- Campus Connect: real-time club chat with Socket.io, 200 concurrent users.',
  '- Expense Splitter: Python Flask app with PostgreSQL that settles group debts with a greedy algorithm.',
  'Experience: Web Development Intern, ABC Technologies (2025) - React admin dashboard, REST APIs.',
  'Achievements: 400+ LeetCode problems, Smart India Hackathon finalist 2024.',
];

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
  if (!process.env.GEMINI_API_KEY) throw new Error('Set GEMINI_API_KEY — this check makes real Gemini calls.');
  const tmp = mkdtempSync(path.join(tmpdir(), 'vizu-iv-'));
  const pdfPath = path.join(tmp, 'resume.pdf');
  writeFileSync(pdfPath, resumePdf(RESUME));

  // API server, database-free.
  const apiFile = path.join(tmp, 'server.mjs');
  await build({ entryPoints: [path.join(ROOT, 'server/index.ts')], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: apiFile, logLevel: 'warning', absWorkingDir: ROOT });
  const env = { ...process.env, PORT: String(API_PORT) };
  delete env.DATABASE_URL;
  writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'));
  api = spawn(process.execPath, [apiFile], { env, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => {
    api.stdout.on('data', (d) => String(d).includes('listening') && resolve());
    api.on('exit', (c) => reject(new Error(`API exited ${c}`)));
  });

  vite = await createServer({ root: ROOT, logLevel: 'warn', server: { port: VITE_PORT, strictPort: true, proxy: { '/api': `http://localhost:${API_PORT}` } } });
  await vite.listen();

  rmSync(PROFILE_DIR, { recursive: true, force: true });
  // Chrome's fake mic: grants permission and produces a beep, never speech.
  const micFlags = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'];
  chrome = spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE_DIR}`, '--headless=new', '--disable-gpu', '--no-first-run', '--window-size=1280,900', ...micFlags, 'about:blank'], { stdio: 'ignore' });
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
  });
  await call('Runtime.enable');
  await call('Page.enable');
  await call('DOM.enable');

  const ev = async (expr) => {
    const r = await call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`${expr.slice(0, 80)} → ${r.exceptionDetails.exception?.description}`);
    return r.result?.value;
  };
  const waitFor = async (expr, ms = 10000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await ev(expr).catch(() => false)) return true;
      await sleep(150);
    }
    return false;
  };
  const text = () => ev('document.body.innerText');
  const has = (t) => `document.body.textContent.includes(${JSON.stringify(t)})`;
  const clickText = (t) => ev(`(() => { const el = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim().startsWith(${JSON.stringify(t)}) && !e.disabled); if (!el) return false; el.click(); return true; })()`);
  const shot = async (name) => {
    if (!wantShots) return;
    mkdirSync(SHOTS, { recursive: true });
    const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    writeFileSync(path.join(SHOTS, `interview-${name}.png`), Buffer.from(data, 'base64'));
  };

  console.log('Setup page');
  await call('Page.navigate', { url: BASE });
  await sleep(800);
  const reg = await ev(`fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'iv-${Date.now()}@example.com', password: 'interview-test-1', firstName: 'Tester' }) }).then(r => r.json())`);
  if (!reg?.token) throw new Error(`register failed: ${JSON.stringify(reg)}`);
  await ev(`localStorage.setItem('vizucode-session', JSON.stringify(${JSON.stringify({ token: reg.token, user: reg.user })}))`);
  await call('Page.navigate', { url: `${BASE}#/interview` });
  expect(await waitFor(has('10 free interviews left')), 'shows 10 free interviews');
  expect(await ev(`!!document.querySelector('.iv-launch.on') && !document.querySelector('.site-nav').textContent.includes('AI Interview')`), 'corner AI Interview button is highlighted, and it is gone from the menu');
  expect(await ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Start interview')).disabled`), 'start is disabled until a resume is chosen');

  const { root } = await call('DOM.getDocument');
  const { nodeId } = await call('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type=file]' });
  await call('DOM.setFileInputFiles', { nodeId, files: [pdfPath] });
  expect(await waitFor(has('resume.pdf')), 'chosen PDF is shown');
  await ev(`(() => { const s = document.querySelector('#iv-lang'); const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, 'hinglish'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await shot('1-setup');
  await clickText('Start interview');
  expect(await waitFor(has('Reading your resume')), 'shows progress while questions are written');
  expect(await waitFor(`location.hash.startsWith('#/interview/iv_')`, 60000), 'opens the interview session');
  expect(await waitFor(has('Begin interview')), 'intro card shown');

  console.log('Session');
  await clickText('Voice on'); // headless Chrome has no TTS voices
  await clickText('Begin interview');
  expect(await waitFor(has('Question 1 of 8')), 'question 1 of 8 shown');
  const q1 = await ev(`document.querySelector('.iv-q').textContent`);
  console.log(`    Q1: ${q1}`);
  await shot('2-question');

  await clickText('Start answering');
  expect(await waitFor(has('Recording')), 'recording started with the (fake) microphone');
  await sleep(5000);
  await shot('3-recording');
  await clickText('Done');
  expect(await waitFor(has('couldn’t hear a clear answer'), 60000), 'a beep-only recording is rejected, not graded');
  expect(await ev(has('Start answering')), 'student can record again after a rejected recording');

  if (AUDIO) {
    // Feed the recording into the page's recorder in place of the microphone.
    const b64 = readFileSync(AUDIO).toString('base64');
    await ev(`(async () => {
      const ctx = new AudioContext();
      await ctx.resume();
      const bytes = Uint8Array.from(atob(${JSON.stringify(b64)}), (c) => c.charCodeAt(0));
      const buf = await ctx.decodeAudioData(bytes.buffer);
      navigator.mediaDevices.getUserMedia = async () => {
        const dest = ctx.createMediaStreamDestination();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(dest);
        src.start();
        return dest.stream;
      };
      window.__answerSec = Math.ceil(buf.duration);
    })()`);
    const secs = await ev('window.__answerSec');
    await clickText('Start answering');
    expect(await waitFor(has('Recording')), 'recording the spoken answer');
    await sleep((secs + 1) * 1000);
    await clickText('Done');
    expect(await waitFor(has('What you said'), 60000), 'spoken answer transcribed and graded');
    const said = await ev(`document.querySelector('.iv-transcript').textContent`);
    expect(/redis/i.test(said), `transcript matches the recording: "${said.slice(0, 90)}…"`);
  } else {
    console.log('    (no --audio given: answering by typing instead)');
    await clickText('Type instead');
    await ev(`(() => { const t = document.querySelector('.iv-textarea'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(t, 'I am a final year CSE student. I built QuickBite, a food ordering app with React and Node, and Campus Connect, a real-time chat app. I interned at ABC Technologies building a React dashboard.'); t.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await clickText('Submit answer');
    expect(await waitFor(has('What you said'), 60000), 'typed answer graded');
  }
  expect(await ev(`/\\d/.test(document.querySelector('.iv-score b').textContent)`), 'score shown');
  expect(await ev(has('A strong answer covers')), 'key points revealed after answering');
  expect(await ev(has('Sample answer')), 'sample answer shown');
  await shot('4-feedback');

  await clickText('Next question');
  expect(await waitFor(has('Question 2 of 8')), 'moves to question 2');
  await clickText('Type instead');
  await ev(`(() => { const t = document.querySelector('.iv-textarea'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(t, 'Menus are read a lot but change rarely, isliye maine Redis mein cache kiya restaurant id ke key se, 10 minute TTL ke saath, aur menu update hone par key delete kar di.'); t.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await clickText('Submit answer');
  expect(await waitFor(has('What you said'), 60000), 'Hinglish typed answer graded');

  console.log('Report');
  await clickText('End interview');
  expect(await waitFor(has('Your result'), 60000), 'report page shown');
  expect(await ev(`document.querySelectorAll('.iv-report-q').length === 8`), 'all 8 questions listed');
  expect(await ev(`[...document.querySelectorAll('.iv-report-q')].filter(e => e.textContent.includes('Skipped')).length === 6`), 'unanswered questions marked Skipped');
  await ev(`document.querySelector('.iv-report-q-head').click()`);
  expect(await waitFor(`!!document.querySelector('.iv-report-q .iv-feedback')`), 'a question expands to its feedback');
  await shot('5-report');

  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  expect(await ev(`document.documentElement.scrollWidth <= 390`), 'no horizontal scroll on a phone');
  await shot('6-report-phone');
  await call('Emulation.clearDeviceMetricsOverride');

  console.log('Free quota');
  await clickText('Start another interview');
  expect(await waitFor(has('9 free interviews left')), 'one free interview used, 9 left');
  expect(await ev("!document.body.textContent.includes('Pay ₹19')"), 'no payment asked while free interviews remain');
  expect(await waitFor(has('Your interviews')), 'past interview listed');

  const real = errors.filter((e) => !/Download the React DevTools|favicon/.test(e));
  expect(real.length === 0, `no console errors${real.length ? ': ' + real.slice(0, 3).join(' | ') : ''}`);
  rmSync(tmp, { recursive: true, force: true });
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
console.log(failures ? `\n${failures} check(s) failed.` : '\nAll AI interview checks passed.');
process.exit(failures ? 1 : 0);
