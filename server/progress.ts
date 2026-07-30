// Per-user progress routes. All routes require a valid JWT (requireAuth).
// Backed by the user_progress table when DATABASE_URL is set, otherwise an
// in-memory map (dev fallback, resets on restart).
import { Router, type NextFunction, type Request, type Response } from 'express';
import { requireAuth, type AuthedRequest } from './auth';
import { pool } from './db';
import { catalog } from '../src/data/catalog';

const validSlugs = new Set(catalog.map((q) => q.slug));

// Dev fallback store: userId -> slug -> solvedAt.
const memProgress = new Map<number, Map<string, Date>>();

const DAY_MS = 86_400_000;

/** UTC calendar-day index (days since epoch) for a timestamp. */
const dayIndex = (d: Date) => Math.floor(d.getTime() / DAY_MS);

/** Current and longest run of consecutive UTC calendar days with at least one solve. */
function computeStreak(solvedAt: Date[]): { current: number; longest: number } {
  const days = new Set(solvedAt.map(dayIndex));
  if (days.size === 0) return { current: 0, longest: 0 };
  const sorted = [...days].sort((a, b) => a - b);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dayIndex(new Date());
  // A solve yesterday (but none yet today) still counts as an active streak.
  let cursor = days.has(today) ? today : today - 1;
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor--;
  }
  return { current, longest };
}

const wrap =
  (fn: (req: AuthedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res).catch(next);
  };

export const progressRouter = Router();
progressRouter.use(requireAuth);

/** GET /api/progress — every slug the signed-in user has marked solved, plus their streak. */
progressRouter.get('/', wrap(async (req, res) => {
  const userId = req.user!.id;
  if (pool) {
    const r = await pool.query('select slug, solved_at from user_progress where user_id = $1', [userId]);
    res.json({
      solved: r.rows.map((row: { slug: string }) => row.slug),
      streak: computeStreak(r.rows.map((row: { solved_at: Date }) => row.solved_at)),
    });
    return;
  }
  const entries = memProgress.get(userId);
  res.json({
    solved: entries ? [...entries.keys()] : [],
    streak: computeStreak(entries ? [...entries.values()] : []),
  });
}));

/** PUT /api/progress/:slug — body { solved: boolean }. Tick or untick one question. */
progressRouter.put('/:slug', wrap(async (req, res) => {
  const userId = req.user!.id;
  const { slug } = req.params;
  if (!validSlugs.has(slug)) {
    res.status(404).json({ error: 'Unknown question.' });
    return;
  }
  const solved = req.body?.solved;
  if (typeof solved !== 'boolean') {
    res.status(400).json({ error: 'Body must be { solved: true | false }.' });
    return;
  }
  if (pool) {
    if (solved) {
      await pool.query(
        'insert into user_progress (user_id, slug) values ($1, $2) on conflict do nothing',
        [userId, slug]
      );
    } else {
      await pool.query('delete from user_progress where user_id = $1 and slug = $2', [userId, slug]);
    }
  } else {
    let map = memProgress.get(userId);
    if (!map) {
      map = new Map();
      memProgress.set(userId, map);
    }
    if (solved) map.set(slug, new Date());
    else map.delete(slug);
  }
  res.json({ slug, solved });
}));
