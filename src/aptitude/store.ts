// Attempt storage. localStorage (per signed-in user) is the working copy — it
// keeps an in-progress test alive across refreshes and makes the section work
// with no backend. Finished attempts are also pushed to /api/aptitude, which
// scores them server-side and keeps them per account; on load the server copy
// is merged in, so history follows the user across devices.
import type { Attempt, AttemptStatus } from './types';
import { deadlineOf } from './engine';

const MAX_HISTORY = 300;
const key = (uid: number, part: 'history' | 'active') => `vizucode-apt-${uid}-${part}`;

function read<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(k: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage full or blocked — the test still runs in memory */
  }
}

const isAttempt = (a: unknown): a is Attempt =>
  !!a && typeof a === 'object' && Array.isArray((a as Attempt).questionIds) && typeof (a as Attempt).startedAt === 'number';

export function loadHistory(uid: number): Attempt[] {
  const h = read<unknown[]>(key(uid, 'history'));
  return Array.isArray(h) ? h.filter(isAttempt) : [];
}

function saveHistory(uid: number, list: Attempt[]) {
  const sorted = [...list].sort((a, b) => b.startedAt - a.startedAt).slice(0, MAX_HISTORY);
  write(key(uid, 'history'), sorted);
}

export function getActive(uid: number): Attempt | null {
  const a = read<Attempt>(key(uid, 'active'));
  return isAttempt(a) && a.status === 'active' ? a : null;
}

export function setActive(uid: number, a: Attempt) {
  write(key(uid, 'active'), a);
}

/** Ends the attempt, moves it into history and syncs it. Returns the finished attempt. */
export function finishAttempt(uid: number, a: Attempt, status: Exclude<AttemptStatus, 'active'>, token?: string): Attempt {
  const done: Attempt = { ...a, status, submittedAt: Math.min(Date.now(), deadlineOf(a)) };
  write(key(uid, 'active'), null);
  saveHistory(uid, [done, ...loadHistory(uid).filter((x) => x.id !== done.id)]);
  if (token) void pushAttempt(token, done);
  return done;
}

/**
 * An active test whose clock ran out while the tab was closed is submitted
 * as timed out. Returns the still-running test, or the one just timed out.
 */
export function resolveActive(uid: number, token?: string): { active: Attempt | null; timedOut: Attempt | null } {
  const a = getActive(uid);
  if (!a) return { active: null, timedOut: null };
  if (Date.now() >= deadlineOf(a)) return { active: null, timedOut: finishAttempt(uid, a, 'timeout', token) };
  return { active: a, timedOut: null };
}

// ───────── server sync (best-effort: the section works fully offline) ─────────

async function pushAttempt(token: string, a: Attempt): Promise<boolean> {
  try {
    const res = await fetch(`/api/aptitude/attempts/${encodeURIComponent(a.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(a),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Merges server history into local history and uploads anything the server lacks. */
export async function syncHistory(uid: number, token: string): Promise<Attempt[]> {
  let remote: Attempt[] = [];
  try {
    const res = await fetch('/api/aptitude/attempts', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return loadHistory(uid);
    const data = (await res.json()) as { attempts?: unknown[] };
    remote = (data.attempts ?? []).filter(isAttempt);
  } catch {
    return loadHistory(uid);
  }
  const local = loadHistory(uid);
  const byId = new Map(remote.map((a) => [a.id, a]));
  for (const a of local) byId.set(a.id, a); // local copy wins — it is the one the user just worked on
  const merged = [...byId.values()];
  saveHistory(uid, merged);
  const remoteIds = new Set(remote.map((a) => a.id));
  await Promise.all(local.filter((a) => !remoteIds.has(a.id)).map((a) => pushAttempt(token, a)));
  return loadHistory(uid);
}
