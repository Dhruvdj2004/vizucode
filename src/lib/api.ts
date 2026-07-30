// Frontend data access (Phase 2): fetch from the API server, but fall back
// to the bundled local data when the API is unreachable, so `npm run dev`
// alone still works with no behavior change.
import { catalog, type CatalogEntry } from '../data/catalog';
import { problemRegistry } from '../problems';
import { toStatic, type StaticProblem } from './serialize';

export interface QuestionRow extends CatalogEntry {
  hasVisualizer: boolean;
}

export type DataSource = 'api' | 'local';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchQuestions(): Promise<{ rows: QuestionRow[]; source: DataSource }> {
  try {
    const rows = await getJson<QuestionRow[]>('/api/questions');
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('empty');
    return { rows, source: 'api' };
  } catch {
    return {
      rows: catalog.map((q) => ({ ...q, hasVisualizer: !!problemRegistry[q.slug] })),
      source: 'local',
    };
  }
}

export interface Streak {
  current: number;
  longest: number;
}

export interface ProgressSummary {
  solved: Set<string>;
  streak: Streak;
}

/** Solved slugs + streak for the signed-in user. Requires the API server (no local fallback). */
export async function fetchProgress(token: string): Promise<ProgressSummary> {
  const res = await fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = (await res.json()) as { solved: string[]; streak: Streak };
  return { solved: new Set(data.solved), streak: data.streak };
}

/** Tick (solved=true) or untick (solved=false) one question for the signed-in user. */
export async function updateProgress(token: string, slug: string, solved: boolean): Promise<void> {
  const res = await fetch(`/api/progress/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ solved }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? 'Could not save progress.');
  }
}

export async function fetchProblem(slug: string): Promise<{ def: StaticProblem | null; source: DataSource }> {
  try {
    const def = await getJson<StaticProblem & { hasVisualizer: boolean }>(`/api/questions/${encodeURIComponent(slug)}`);
    if (!def.hasVisualizer) return { def: null, source: 'api' };
    return { def, source: 'api' };
  } catch {
    const local = problemRegistry[slug];
    return { def: local ? toStatic(local) : null, source: 'local' };
  }
}
