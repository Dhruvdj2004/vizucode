// Client for the resume editor service (resume-editor/ — a separate Python app,
// because compiling LaTeX needs Tectonic, which can't run on Vercel). It accepts
// the VizuCode JWT, so the signed-in user's token is all it needs.
import { getSession } from './auth';

const BASE = (import.meta.env.VITE_RESUME_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000';

export interface ResumeVersion {
  version: number;
  summary: string | null;
  request: string | null;
  created_at: string;
}

export interface EditResult {
  status: 'ok' | 'refused' | 'unchanged' | 'error';
  message: string;
  version?: number;
}

function authHeaders(): Record<string, string> {
  const token = getSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function call(path: string, init: RequestInit = {}): Promise<globalThis.Response> {
  let res: globalThis.Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { ...authHeaders(), ...(init.headers ?? {}) } });
  } catch {
    throw new Error('The resume editor service is not reachable right now. Try again in a minute.');
  }
  if (res.status === 401) throw new Error('Your session expired — sign in again.');
  return res;
}

async function json<T>(res: globalThis.Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { detail?: string; message?: string; status?: string };
  // The edit route answers 422 with {status:"error", message} — that is a normal result, not a throw.
  if (!res.ok && !data.status) throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  return data;
}

export async function uploadResume(file: File): Promise<{ session_id: string; version: number }> {
  const form = new FormData();
  form.append('file', file);
  return json(await call('/api/upload', { method: 'POST', body: form }));
}

export async function listVersions(sid: string): Promise<ResumeVersion[]> {
  return json(await call(`/api/sessions/${sid}/versions`));
}

export async function editResume(sid: string, message: string): Promise<EditResult> {
  return json(
    await call(`/api/sessions/${sid}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
  );
}

export async function revertResume(sid: string, version: number): Promise<{ version: number; message: string }> {
  return json(await call(`/api/sessions/${sid}/revert/${version}`, { method: 'POST' }));
}

/** Fetches a version's PDF or .tex as a Blob (auth header needed, so no plain links). */
export async function fetchFile(sid: string, version: number, kind: 'pdf' | 'tex'): Promise<{ blob: Blob; name: string }> {
  const res = await call(`/api/sessions/${sid}/versions/${version}/${kind}`);
  if (!res.ok) throw new Error(`Could not load the ${kind.toUpperCase()} (${res.status})`);
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? `resume_v${version}.${kind}`;
  return { blob: await res.blob(), name };
}

/** Saves a Blob with its server-given name. The .tex bytes are passed through untouched. */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
