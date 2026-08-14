// Frontend data access (Phase 2): fetch from the API server, but fall back
// to the bundled local data when the API is unreachable, so `npm run dev`
// alone still works with no behavior change.
import { catalog, type CatalogEntry } from '../data/catalog';
import { problemRegistry } from '../problems';
import { toStatic, type StaticProblem } from './serialize';
import type { Session } from './auth';

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

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
}

/** Creates a fixed-price Razorpay order for the signed-in user. Price is set server-side. */
export async function createOrder(token: string): Promise<RazorpayOrder> {
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as Partial<RazorpayOrder> & { error?: string };
  if (!res.ok || !data.orderId) throw new Error(data.error ?? 'Could not start checkout.');
  return data as RazorpayOrder;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Verifies the Razorpay checkout signature; on success the account is flipped to Pro. */
export async function verifyPayment(token: string, payload: VerifyPaymentPayload): Promise<Session> {
  const res = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<Session> & { error?: string };
  if (!res.ok || !data.token || !data.user) throw new Error(data.error ?? 'Payment verification failed.');
  return { token: data.token, user: data.user };
}

export interface FeedbackEntry {
  id: number;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface FeedbackSummary {
  entries: FeedbackEntry[];
  average: number;
  count: number;
}

/** Latest feedback/suggestions, plus the average star rating. Public — no auth. */
export async function fetchFeedback(): Promise<FeedbackSummary> {
  return getJson<FeedbackSummary>('/api/feedback');
}

/** Submits a piece of feedback with a 1-5 star rating. Public — no auth. */
export async function submitFeedback(name: string, rating: number, message: string): Promise<FeedbackEntry> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, rating, message }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<FeedbackEntry> & { error?: string };
  if (!res.ok || !data.id) throw new Error(data.error ?? 'Could not submit feedback.');
  return data as FeedbackEntry;
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
