// Public feedback/suggestions routes. No auth required — anyone can submit
// a star rating + message. Backed by the `feedback` table when DATABASE_URL
// is set, otherwise an in-memory array (dev fallback, resets on restart).
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { pool } from './db';

export interface FeedbackEntry {
  id: number;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
}

// Dev fallback store.
const memFeedback: FeedbackEntry[] = [];
let nextId = 1;

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

// Submissions are open to everyone (no auth), so cap them separately and
// more tightly than plain reads to keep the table from being spammed.
const SUBMIT_WINDOW_MS = 60_000;
const SUBMIT_LIMIT = 5;
const submitHits = new Map<string, { windowStart: number; count: number }>();
function limitSubmissions(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  let entry = submitHits.get(ip);
  if (!entry || now - entry.windowStart > SUBMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 0 };
    submitHits.set(ip, entry);
  }
  if (submitHits.size > 10_000) submitHits.clear(); // crude memory guard
  if (++entry.count > SUBMIT_LIMIT) {
    res.status(429).json({ error: 'Too many submissions — try again in a minute.' });
    return;
  }
  next();
}

export const feedbackRouter = Router();

const bodySchema = z.object({
  name: z.string({ error: 'Name is required.' }).trim().min(1, 'Name is required.').max(80, 'Name is too long.'),
  rating: z
    .number({ error: 'Rating is required.' })
    .int('Rating must be a whole number.')
    .min(1, 'Rating must be between 1 and 5.')
    .max(5, 'Rating must be between 1 and 5.'),
  message: z
    .string({ error: 'Message is required.' })
    .trim()
    .min(1, 'Message is required.')
    .max(1000, 'Message is too long.'),
});

function firstIssue(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue ? issue.message : 'Invalid input.';
}

/** GET /api/feedback — most recent submissions, plus the average rating. */
feedbackRouter.get('/', wrap(async (_req, res) => {
  if (pool) {
    const r = await pool.query(
      `select id, name, rating, message, created_at from feedback order by created_at desc limit 50`
    );
    const avg = await pool.query(`select coalesce(avg(rating), 0)::float as avg, count(*)::int as count from feedback`);
    res.json({
      entries: r.rows.map((row: { id: number; name: string; rating: number; message: string; created_at: Date }) => ({
        id: row.id,
        name: row.name,
        rating: row.rating,
        message: row.message,
        createdAt: row.created_at.toISOString(),
      })),
      average: avg.rows[0].avg,
      count: avg.rows[0].count,
    });
    return;
  }
  const entries = memFeedback.slice(0, 50);
  const count = memFeedback.length;
  const average = count ? memFeedback.reduce((sum, e) => sum + e.rating, 0) / count : 0;
  res.json({ entries, average, count });
}));

/** POST /api/feedback — body: { name, rating, message }. Open to everyone. */
feedbackRouter.post('/', limitSubmissions, wrap(async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { name, rating, message } = parsed.data;

  if (pool) {
    const r = await pool.query(
      `insert into feedback (name, rating, message) values ($1, $2, $3)
       returning id, name, rating, message, created_at`,
      [name, rating, message]
    );
    const row = r.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      rating: row.rating,
      message: row.message,
      createdAt: row.created_at.toISOString(),
    } satisfies FeedbackEntry);
    return;
  }

  const entry: FeedbackEntry = { id: nextId++, name, rating, message, createdAt: new Date().toISOString() };
  memFeedback.unshift(entry);
  if (memFeedback.length > 500) memFeedback.length = 500; // crude memory guard
  res.status(201).json(entry);
}));
