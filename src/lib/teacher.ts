// Client for the teacher panel (/api/teacher/*). Teachers have their own login
// and token, separate from student accounts, and do everything themselves:
// add a question, generate its visualizer with Gemini, preview, publish.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'in_review' | 'published';

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
  /** The pull request this question was sent for review in, if any. */
  review: { number: number; url: string; branch: string } | null;
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
  /** tsc errors in generatedCode (server-side check; publishing needs none). */
  typeErrors?: string[];
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
    const msg = (data as { error?: string }).error;
    if (!msg && (res.status === 504 || res.status === 502))
      throw new Error('The server took too long (Gemini may be busy). Wait a minute and try again.');
    throw new Error(msg ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

const tToken = () => getTeacherSession()?.token;

export async function teacherLogin(email: string, password: string): Promise<Teacher> {
  const r = await call<{ token: string; teacher: Teacher }>('/api/teacher/login', undefined, 'POST', { email, password });
  localStorage.setItem(KEY, JSON.stringify(r));
  return r.teacher;
}

export interface TeacherInfo {
  teacher: Teacher;
  categories: string[];
  ai: boolean;
  model: string;
  github: { repo: string; branch: string; ready: boolean };
}

export const teacherApi = {
  me: () => call<TeacherInfo>('/api/teacher/me', tToken()),
  scrape: (url: string) =>
    call<{ question: Partial<QuestionDraft> & { tags?: string[]; source?: string } }>(
      '/api/teacher/scrape',
      tToken(),
      'POST',
      { url }
    ),
  list: () => call<{ requests: RequestSummary[] }>('/api/teacher/requests', tToken()),
  get: (id: number) => call<{ request: RequestFull }>(`/api/teacher/requests/${id}`, tToken()),
  create: (d: QuestionDraft) => call<{ id: number; slug: string }>('/api/teacher/requests', tToken(), 'POST', d),
  remove: (id: number) => call(`/api/teacher/requests/${id}`, tToken(), 'DELETE'),
  generate: (id: number, prompt: string, sample: number) =>
    call<{ code: string; typeErrors: string[] }>(`/api/teacher/requests/${id}/generate`, tToken(), 'POST', {
      prompt,
      sample,
    }),
  /** One automatic type-fix round (Gemini fixes the tsc errors). */
  fix: (id: number) => call<{ code: string; typeErrors: string[] }>(`/api/teacher/requests/${id}/fix`, tToken(), 'POST', {}),
  saveCode: (id: number, code: string) =>
    call<{ typeErrors: string[] }>(`/api/teacher/requests/${id}/code`, tToken(), 'PUT', { code }),
  /** Sends the question for review: a pull request to main (or an update to the open one). */
  publish: (id: number, staticDef: unknown) =>
    call<{ review: { number: number; url: string; branch: string } }>(`/api/teacher/requests/${id}/publish`, tToken(), 'POST', {
      static: staticDef,
    }),
};

/** Status shown to teachers: draft (working on it), in review (pull request open), published (merged). */
export function statusLabel(s: RequestStatus): string {
  return s === 'published' ? 'published' : s === 'in_review' ? 'in review' : 'draft';
}

/** CSS pill class for a status. */
export function statusClass(s: RequestStatus): string {
  return s === 'published' ? 'published' : s === 'in_review' ? 'accepted' : 'pending';
}
