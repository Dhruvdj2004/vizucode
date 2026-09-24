// VizuCode API (Phase 3): the Express app itself, with no listener attached.
// Exported so both the local dev entry (server/index.ts, `npm run server`)
// and the Vercel serverless entry (api/index.ts) can reuse the exact same
// routes — same behavior in dev and in production.
//
// Serves the question catalog and per-problem content, and can generate
// step traces server-side. Reads come from Postgres when DATABASE_URL is
// set, otherwise from the bundled TS data modules — same routes either way.
// Trace generation always runs from the TS registry (the generators are code).
import express from 'express';
import cors from 'cors';
import { catalog } from '../src/data/catalog';
import { problemRegistry } from '../src/problems';
import { toStatic } from '../src/lib/serialize';
import { isRunError } from '../src/lib/types';
import { authRouter } from './auth';
import { progressRouter } from './progress';
import { paymentRouter } from './payment';
import { feedbackRouter } from './feedback';
import { aptitudeRouter } from './aptitude';
import { newsRouter } from './news';
import { pool } from './db';

// In production set ALLOWED_ORIGIN to the deployed frontend URL
// (e.g. https://vizucode.vercel.app). Unset = permissive, for local dev.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

export const app = express();
app.disable('x-powered-by');
app.use(cors(ALLOWED_ORIGIN ? { origin: ALLOWED_ORIGIN } : {}));
app.use(express.json({ limit: '16kb' }));

// Security headers on every response.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Simple in-memory rate limit: per-IP, per-minute window. On Vercel this is
// per-instance, not global — a soft limit there, not a hard guarantee.
const WINDOW_MS = 60_000;
const LIMITS = { read: 300, trace: 60, auth: 20, payment: 20 } as const;
type LimitKind = keyof typeof LIMITS;
const hits = new Map<string, { windowStart: number; counts: Record<LimitKind, number> }>();
function rateLimit(kind: LimitKind) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    let entry = hits.get(ip);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
      entry = { windowStart: now, counts: { read: 0, trace: 0, auth: 0, payment: 0 } };
      hits.set(ip, entry);
    }
    if (hits.size > 10_000) hits.clear(); // crude memory guard
    if (++entry.counts[kind] > LIMITS[kind]) {
      res.status(429).json({ error: 'Too many requests — slow down.' });
      return;
    }
    next();
  };
}

/** Express 4 doesn't route async rejections to the error handler on its own. */
const wrap =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next);
  };

// Auth routes (register/login/me) — see server/auth.ts.
app.use('/api/auth', rateLimit('auth'), authRouter);

// Per-user progress (JWT required) — see server/progress.ts.
app.use('/api/progress', rateLimit('read'), progressRouter);

// Razorpay order create/verify (JWT required) — see server/payment.ts.
app.use('/api/payment', rateLimit('payment'), paymentRouter);

// Aptitude & OA practice attempts (JWT required) — see server/aptitude.ts.
app.use('/api/aptitude', rateLimit('read'), aptitudeRouter);

// Public feedback/suggestions (open to everyone) — see server/feedback.ts.
// Its own POST-specific rate limit lives inside the router.
app.use('/api/feedback', rateLimit('read'), feedbackRouter);

// Daily "Top 5 in AI" digest: public reads + the Vercel Cron job that fills
// it — see server/news.ts.
app.use('/api/news', rateLimit('read'), newsRouter);

app.get('/api/health', rateLimit('read'), wrap(async (_req, res) => {
  if (!pool) {
    res.json({ ok: true, source: 'local', questions: catalog.length, visualizers: Object.keys(problemRegistry).length });
    return;
  }
  const r = await pool.query(
    `select (select count(*) from questions)::int as questions,
            (select count(*) from problem_content)::int as visualizers`
  );
  res.json({ ok: true, source: 'database', ...r.rows[0] });
}));

// Catalog/content reads only change via `npm run db:seed` (a separate
// process), so a process-lifetime in-memory cache avoids a ~200ms Supabase
// round trip on every request for data that's effectively static. On Vercel
// this caches per warm instance — still a large win since instances are
// reused across nearby invocations.
let categoriesCache: unknown[] | null = null;
let questionsCache: unknown[] | null = null;
const questionCache = new Map<string, unknown>();

/** Categories with question + visualizer counts, in catalog order. */
app.get('/api/categories', rateLimit('read'), wrap(async (_req, res) => {
  if (pool) {
    if (categoriesCache) {
      res.json(categoriesCache);
      return;
    }
    const r = await pool.query(
      `select q.category as name, count(*)::int as total, count(pc.slug)::int as visualized
       from questions q left join problem_content pc using (slug)
       group by q.category order by min(q.id)`
    );
    categoriesCache = r.rows;
    res.json(r.rows);
    return;
  }
  const order: string[] = [];
  const byCat = new Map<string, { name: string; total: number; visualized: number }>();
  for (const q of catalog) {
    if (!byCat.has(q.category)) {
      order.push(q.category);
      byCat.set(q.category, { name: q.category, total: 0, visualized: 0 });
    }
    const c = byCat.get(q.category)!;
    c.total++;
    if (problemRegistry[q.slug]) c.visualized++;
  }
  res.json(order.map((name) => byCat.get(name)!));
}));

/** Full question list (catalog + availability flag). */
app.get('/api/questions', rateLimit('read'), wrap(async (_req, res) => {
  if (pool) {
    if (questionsCache) {
      res.json(questionsCache);
      return;
    }
    const r = await pool.query(
      `select q.id, q.category, q.title, q.difficulty, q.leetcode, q.slug,
              (pc.slug is not null) as "hasVisualizer"
       from questions q left join problem_content pc using (slug)
       order by q.id`
    );
    questionsCache = r.rows;
    res.json(r.rows);
    return;
  }
  res.json(catalog.map((q) => ({ ...q, hasVisualizer: !!problemRegistry[q.slug] })));
}));

/** One question's full static content: metadata, code, inputs, note, complexity. */
app.get('/api/questions/:slug', rateLimit('read'), wrap(async (req, res) => {
  if (pool) {
    const cached = questionCache.get(req.params.slug);
    if (cached) {
      res.json(cached);
      return;
    }
    const r = await pool.query(
      `select q.id, q.slug, q.category, q.title, q.difficulty, q.leetcode,
              pc.technique, pc.widget, pc.widget_title, pc.inputs,
              pc.code_cpp, pc.code_java, pc.note, pc.time_complexity, pc.space_complexity,
              pc.brute
       from questions q left join problem_content pc using (slug)
       where q.slug = $1`,
      [req.params.slug]
    );
    const row = r.rows[0];
    if (!row) {
      res.status(404).json({ error: 'Unknown question.' });
      return;
    }
    const has = row.technique !== null;
    const body = {
      id: row.id,
      slug: row.slug,
      category: row.category,
      title: row.title,
      difficulty: row.difficulty,
      leetcode: row.leetcode,
      ...(has
        ? {
            technique: row.technique,
            widget: row.widget,
            widgetTitle: row.widget_title,
            inputs: row.inputs,
            code: { cpp: row.code_cpp, java: row.code_java },
            note: row.note,
            complexity: { time: row.time_complexity, space: row.space_complexity },
            ...(row.brute ? { brute: row.brute } : {}),
          }
        : {}),
      hasVisualizer: has,
    };
    // Bounded by the catalog size (~158 slugs) — never grows from arbitrary input.
    questionCache.set(req.params.slug, body);
    res.json(body);
    return;
  }
  const meta = catalog.find((q) => q.slug === req.params.slug);
  const def = problemRegistry[req.params.slug];
  if (!meta && !def) {
    res.status(404).json({ error: 'Unknown question.' });
    return;
  }
  res.json({ ...(meta ?? {}), ...(def ? toStatic(def) : {}), hasVisualizer: !!def });
}));

/** Server-side trace generation: body = { inputs: { key: value } }. */
app.post('/api/questions/:slug/trace', rateLimit('trace'), (req, res) => {
  const def = problemRegistry[req.params.slug];
  if (!def) {
    res.status(404).json({ error: 'No visualizer for this question.' });
    return;
  }
  const inputs = req.body?.inputs;
  if (inputs === undefined || typeof inputs !== 'object' || Array.isArray(inputs)) {
    res.status(400).json({ error: 'Body must be { inputs: { … } }.' });
    return;
  }
  // Only accept declared input keys, as short strings — nothing else reaches run().
  const values: Record<string, string> = {};
  for (const f of def.inputs) {
    const raw = (inputs as Record<string, unknown>)[f.key];
    const v = raw === undefined ? f.defaultValue : String(raw);
    if (v.length > 200) {
      res.status(400).json({ error: `Input "${f.key}" is too long.` });
      return;
    }
    values[f.key] = v;
  }
  const result = def.run(values);
  if (isRunError(result)) {
    res.status(422).json(result);
    return;
  }
  res.json(result);
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Never leak stack traces to clients.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal error.' });
});
