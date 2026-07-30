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

export function register(email: string, password: string, firstName: string): Promise<Session> {
  return postAuth('/api/auth/register', { email, password, firstName });
}

export function login(email: string, password: string): Promise<Session> {
  return postAuth('/api/auth/login', { email, password });
}

export function logout() {
  setSession(null);
}

/** Persists a fresh session (used after a payment upgrades the account to Pro). */
export function applySession(session: Session): void {
  setSession(session);
}
