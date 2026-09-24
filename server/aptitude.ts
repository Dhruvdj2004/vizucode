// Aptitude & OA practice attempts (JWT required). The browser keeps the
// working copy in localStorage; finished attempts are uploaded here so a
// user's history survives across devices. The server re-scores every attempt
// against the question bank instead of trusting a client-sent score.
// Backed by the aptitude_attempts table when DATABASE_URL is set, otherwise an
// in-memory map (dev fallback, resets on restart).
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from './auth';
import { pool } from './db';
import { QUESTION_BY_ID } from '../src/aptitude/bank';
import { ALL_TOPICS } from '../src/aptitude/taxonomy';
import { scoreAttempt } from '../src/aptitude/engine';
import type { Attempt } from '../src/aptitude/types';

const MAX_PER_USER = 300;
const topics = new Set(ALL_TOPICS);

const attemptSchema = z.object({
  id: z.string().regex(/^apt_[a-z0-9_]{1,40}$/),
  config: z.object({
    mode: z.enum(['full', 'topic', 'mixed', 'cs', 'company']),
    title: z.string().max(120),
    topics: z.array(z.string().refine((t) => topics.has(t))).min(1).max(80),
    count: z.number().int().min(1).max(50),
    durationSec: z.number().int().min(60).max(7200),
    selection: z.enum(['random', 'smart']),
    categoryWeights: z.record(z.string(), z.number().min(0).max(1)).optional(),
    difficultyFocus: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
    companyStyle: z.string().max(40).optional(),
  }),
  questionIds: z.array(z.string().refine((id) => QUESTION_BY_ID.has(id), 'Unknown question.')).min(1).max(50),
  optionOrder: z.array(z.array(z.number().int().min(0).max(3)).length(4)),
  answers: z.array(z.number().int().min(0).max(3).nullable()),
  marked: z.array(z.boolean()),
  visited: z.array(z.boolean()),
  current: z.number().int().min(0),
  startedAt: z.number().int().positive(),
  submittedAt: z.number().int().positive(),
  status: z.enum(['submitted', 'timeout', 'abandoned']),
  warned: z.array(z.number().int()).max(10),
});

// Dev fallback store: userId -> attemptId -> attempt.
const memAttempts = new Map<number, Map<string, Attempt>>();

const wrap =
  (fn: (req: AuthedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res).catch(next);
  };

export const aptitudeRouter = Router();
aptitudeRouter.use(requireAuth);

/** GET /api/aptitude/attempts — the signed-in user's finished attempts, newest first. */
aptitudeRouter.get('/attempts', wrap(async (req, res) => {
  const userId = req.user!.id;
  if (pool) {
    const r = await pool.query(
      'select data from aptitude_attempts where user_id = $1 order by started_at desc limit $2',
      [userId, MAX_PER_USER]
    );
    res.json({ attempts: r.rows.map((row: { data: Attempt }) => row.data) });
    return;
  }
  const mine = [...(memAttempts.get(userId)?.values() ?? [])].sort((a, b) => b.startedAt - a.startedAt);
  res.json({ attempts: mine.slice(0, MAX_PER_USER) });
}));

/** PUT /api/aptitude/attempts/:id — store (or overwrite) one finished attempt. */
aptitudeRouter.put('/attempts/:id', wrap(async (req, res) => {
  const parsed = attemptSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.id !== req.params.id) {
    res.status(400).json({ error: 'Invalid attempt.' });
    return;
  }
  const a = parsed.data as Attempt;
  const n = a.questionIds.length;
  if (a.optionOrder.length !== n || a.answers.length !== n || a.marked.length !== n || a.visited.length !== n) {
    res.status(400).json({ error: 'Invalid attempt.' });
    return;
  }
  const result = scoreAttempt(a);
  const userId = req.user!.id;
  if (pool) {
    await pool.query(
      `insert into aptitude_attempts (id, user_id, mode, status, score, total, started_at, submitted_at, data)
       values ($1, $2, $3, $4, $5, $6, to_timestamp($7 / 1000.0), to_timestamp($8 / 1000.0), $9)
       on conflict (id) do update set status = excluded.status, score = excluded.score,
         submitted_at = excluded.submitted_at, data = excluded.data
       where aptitude_attempts.user_id = excluded.user_id`,
      [a.id, userId, a.config.mode, a.status, result.correct, result.total, a.startedAt, a.submittedAt, JSON.stringify(a)]
    );
  } else {
    let mine = memAttempts.get(userId);
    if (!mine) {
      mine = new Map();
      memAttempts.set(userId, mine);
    }
    mine.set(a.id, a);
    if (mine.size > MAX_PER_USER) {
      const oldest = [...mine.values()].sort((x, y) => x.startedAt - y.startedAt)[0];
      mine.delete(oldest.id);
    }
  }
  res.json({ id: a.id, score: result.correct, total: result.total });
}));
