// Client for the teacher panel (/api/teacher/*) and the admin review panel
// (/api/admin/*). Teachers have their own login and token, separate from
// student accounts; admins use their normal VizuCode session.
import { getSession } from './auth';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'published';

export interface Example {
  input: string;
  output: string;
  explanation: string;
}
export interface HiddenTest {
  input: string;
  output: string;
}

export interface QuestionDraft {
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: Example[];
  constraints: string;
  hiddenTests: HiddenTest[];
  sourceUrl: string;
  notes: string;
}

export interface RequestSummary {
  id: number;
  status: RequestStatus;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  sourceUrl: string | null;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  teacher?: { name: string; email: string };
  alreadyOnSite: boolean;
  /** Questions already on the site that this request probably duplicates. */
  siteMatches: SiteMatch[];
  publishedCommit: string | null;
}

export interface SiteMatch {
  slug: string;
  title: string;
  category: string;
  hasVisualizer: boolean;
  kind: 'exact' | 'title' | 'alias' | 'similar';
}

export const MATCH_LABEL: Record<SiteMatch['kind'], string> = {
  exact: 'Same question',
  title: 'Same title',
  alias: 'Same problem, different name',
  similar: 'Similar title',
};

export interface RequestFull extends RequestSummary {
  description: string;
  examples: Example[];
  constraints: string;
  hiddenTests: HiddenTest[];
  notes: string;
  generatedCode?: string | null;
  generations?: { at: string; prompt: string; ms: number; model: string }[];
}

export interface Teacher {
  id: number;
  email: string;
  name: string;
}

// ---------- teacher session ----------

const KEY = 'vizucode-teacher';

export function getTeacherSession(): { token: string; teacher: Teacher } | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return s?.token ? s : null;
  } catch {
    return null;
  }
}

export function teacherLogout() {
  localStorage.removeItem(KEY);
}

async function call<T>(path: string, token: string | undefined, method = 'GET', body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is `npm run server` running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/api/teacher') && path !== '/api/teacher/login') teacherLogout();
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

const tToken = () => getTeacherSession()?.token;

export async function teacherLogin(email: string, password: string): Promise<Teacher> {
  const r = await call<{ token: string; teacher: Teacher }>('/api/teacher/login', undefined, 'POST', { email, password });
  localStorage.setItem(KEY, JSON.stringify(r));
  return r.teacher;
}

export const teacherApi = {
  me: () => call<{ teacher: Teacher; categories: string[] }>('/api/teacher/me', tToken()),
  scrape: (url: string) =>
    call<{ question: Partial<QuestionDraft> & { tags?: string[]; source?: string } }>(
      '/api/teacher/scrape',
      tToken(),
      'POST',
      { url }
    ),
  list: () => call<{ requests: RequestSummary[] }>('/api/teacher/requests', tToken()),
  get: (id: number) => call<{ request: RequestFull }>(`/api/teacher/requests/${id}`, tToken()),
  create: (d: QuestionDraft) =>
    call<{ id: number; slug: string; alreadyOnSite: boolean }>('/api/teacher/requests', tToken(), 'POST', d),
};

// ---------- admin ----------

const aToken = () => getSession()?.token;

export interface AdminInfo {
  admin: string;
  categories: string[];
  ai: boolean;
  model: string;
  github: { repo: string; branch: string; ready: boolean };
}

export const adminApi = {
  me: () => call<AdminInfo>('/api/admin/me', aToken()),
  teachers: () =>
    call<{ teachers: (Teacher & { active: boolean; created_at: string; requests: number })[] }>(
      '/api/admin/teachers',
      aToken()
    ),
  addTeacher: (t: { email: string; name: string; password: string }) =>
    call<{ id: number }>('/api/admin/teachers', aToken(), 'POST', t),
  updateTeacher: (id: number, patch: { active?: boolean; password?: string }) =>
    call('/api/admin/teachers/' + id, aToken(), 'PATCH', patch),
  list: (status?: RequestStatus) =>
    call<{ requests: RequestSummary[] }>('/api/admin/requests' + (status ? `?status=${status}` : ''), aToken()),
  get: (id: number) => call<{ request: RequestFull }>(`/api/admin/requests/${id}`, aToken()),
  decide: (id: number, decision: 'accept' | 'reject', note: string) =>
    call(`/api/admin/requests/${id}/decision`, aToken(), 'POST', { decision, note }),
  generate: (id: number, prompt: string, sample: number) =>
    call<{ code: string }>(`/api/admin/requests/${id}/generate`, aToken(), 'POST', { prompt, sample }),
  saveCode: (id: number, code: string) => call(`/api/admin/requests/${id}/code`, aToken(), 'PUT', { code }),
  publish: (id: number, staticDef: unknown) =>
    call<{ commit: string; url: string; branch: string }>(`/api/admin/requests/${id}/publish`, aToken(), 'POST', {
      static: staticDef,
    }),
};
