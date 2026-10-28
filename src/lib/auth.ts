// Frontend auth client: talks to /api/auth/* and keeps the session in
// localStorage. Unlike the catalog data there is no local fallback — auth
// requires the API server to be running.

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  isPro: boolean;
}

export interface Session {
  token: string;
  user: AuthUser;
}

export interface DeviceSession {
  id: string;
  label: string;
  createdAt: string;
}

/** Thrown by login() when the account is already signed in on MAX_DEVICES devices. */
export class DeviceLimitError extends Error {
  sessions: DeviceSession[];
  constructor(message: string, sessions: DeviceSession[]) {
    super(message);
    this.name = 'DeviceLimitError';
    this.sessions = sessions;
  }
}

const STORAGE_KEY = 'vizucode-session';
const listeners = new Set<() => void>();

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return s.token && s.user ? s : null;
  } catch {
    return null;
  }
}

function setSession(s: Session | null) {
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((fn) => fn());
}

/** Subscribe to sign-in/sign-out; returns an unsubscribe function. */
export function onAuthChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function postAuth(path: string, body: Record<string, string>): Promise<Session> {
  let res: globalThis.Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server — is `npm run server` running?');
  }
  const data = (await res.json().catch(() => ({}))) as Partial<Session> & { error?: string };
  if (!res.ok || !data.token || !data.user) {
    throw new Error(data.error ?? 'Something went wrong — try again.');
  }
  const session = { token: data.token, user: data.user };
  setSession(session);
  return session;
}

/** POSTs JSON and returns the parsed body, throwing the server's error message on a non-2xx. */
async function postJson<T>(path: string, body: Record<string, string>, token?: string): Promise<T & { status: number }> {
  let res: globalThis.Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server — is `npm run server` running?');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong — try again.');
  return { ...data, status: res.status };
}

/** College emails (@ietdavv.edu.in) get Pro free once the address is verified. */
export const COLLEGE_EMAIL_SUFFIX = '@ietdavv.edu.in';
export const isCollegeEmail = (email: string | undefined) => !!email?.trim().toLowerCase().endsWith(COLLEGE_EMAIL_SUFFIX);

/**
 * Signs up. Returns the new session, or `{ verify: true }` for a college
 * email: the server has emailed a code, and the account is created by
 * verifyRegistration() once the student enters it.
 */
export async function register(
  email: string,
  password: string,
  firstName: string
): Promise<Session | { verify: true }> {
  const data = await postJson<Partial<Session> & { verify?: boolean }>('/api/auth/register', { email, password, firstName });
  if (data.verify) return { verify: true };
  if (!data.token || !data.user) throw new Error('Something went wrong — try again.');
  const session = { token: data.token, user: data.user };
  setSession(session);
  return session;
}

/** Finishes a college sign-up with the emailed code. */
export function verifyRegistration(email: string, code: string): Promise<Session> {
  return postAuth('/api/auth/register/verify', { email, code });
}

/** Emails a password-reset code (the server answers the same whether or not the account exists). */
export async function forgotPassword(email: string): Promise<void> {
  await postJson('/api/auth/password/forgot', { email });
}

/** Sets a new password with the emailed code. Every device is signed out; sign in again afterwards. */
export async function resetPassword(email: string, code: string, password: string): Promise<void> {
  await postJson('/api/auth/password/reset', { email, code, password });
}

/** Signed-in college account: email a code that proves the address. */
export async function sendCollegeCode(token: string): Promise<void> {
  await postJson('/api/auth/college/send', {}, token);
}

/** Signed-in college account: check the code, become Pro, and store the fresh session. */
export async function verifyCollegeCode(token: string, code: string): Promise<Session> {
  const data = await postJson<Partial<Session>>('/api/auth/college/verify', { code }, token);
  if (!data.token || !data.user) throw new Error('Something went wrong — try again.');
  const session = { token: data.token, user: data.user };
  setSession(session);
  return session;
}

/** Throws DeviceLimitError (carrying the signed-in device list) at the device cap, like login(). */
export async function googleLogin(credential: string, revokeSessionId?: string): Promise<Session> {
  let res: globalThis.Response;
  try {
    res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, revokeSessionId }),
    });
  } catch {
    throw new Error('Cannot reach the server — is `npm run server` running?');
  }
  const data = (await res.json().catch(() => ({}))) as Partial<Session> & {
    error?: string;
    sessions?: DeviceSession[];
  };
  if (res.status === 409 && data.sessions) {
    throw new DeviceLimitError(data.error ?? 'Too many devices are signed in.', data.sessions);
  }
  if (!res.ok || !data.token || !data.user) {
    throw new Error(data.error ?? 'Something went wrong — try again.');
  }
  const session = { token: data.token, user: data.user };
  setSession(session);
  return session;
}

/** Throws DeviceLimitError (carrying the signed-in device list) instead of a plain Error at the device cap. */
export async function login(email: string, password: string): Promise<Session> {
  let res: globalThis.Response;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Cannot reach the server — is `npm run server` running?');
  }
  const data = (await res.json().catch(() => ({}))) as Partial<Session> & {
    error?: string;
    sessions?: DeviceSession[];
  };
  if (res.status === 409 && data.sessions) {
    throw new DeviceLimitError(data.error ?? 'Too many devices are signed in.', data.sessions);
  }
  if (!res.ok || !data.token || !data.user) {
    throw new Error(data.error ?? 'Something went wrong — try again.');
  }
  const session = { token: data.token, user: data.user };
  setSession(session);
  return session;
}

/** Signs a named device out server-side, then logs the caller in on this one. */
export function forceLogin(email: string, password: string, revokeSessionId: string): Promise<Session> {
  return postAuth('/api/auth/login/force', { email, password, revokeSessionId });
}

export async function logout(): Promise<void> {
  const session = getSession();
  if (session) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch {
      // best effort — the local session is cleared below regardless
    }
  }
  setSession(null);
}

/** Persists a fresh session (used after a payment upgrades the account to Pro). */
export function applySession(session: Session): void {
  setSession(session);
}
