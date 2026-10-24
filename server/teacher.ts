// Teacher panel (local server for now).
//
// Teachers (accounts created with scripts/add-teacher.mjs, no self sign-up) log in with email +
// password and request a visualizer for any DSA question — typed in by hand or
// scraped from a LeetCode / GeeksforGeeks / CodeChef URL by
// scripts/scrape_question.py (requests + BeautifulSoup).
//
// Teachers then do the whole job themselves on their own questions: have Gemini
// write the visualizer (a ProblemDef TS module) from the question + one sample
// test case, preview it in the browser, regenerate with extra instructions or
// edit the code, and publish: one commit to GitHub (the new file, its registry
// entry and its catalog entry) plus an upsert into Postgres.
import { Router, type Request, type Response, type NextFunction } from 'express';
import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pool } from './db';
import { typecheckModule } from './typecheck';
import { scrapeQuestion, ScrapeError } from './scrape';
import { catalog } from '../src/data/catalog';
import { problemRegistry } from '../src/problems';

const JWT_SECRET = process.env.JWT_SECRET ?? 'vizucode-dev-secret-change-me';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_CODE_MODEL = process.env.GEMINI_CODE_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
const GITHUB_REPO = process.env.GITHUB_REPO ?? 'Dhruvdj2004/vizucode';
const PUBLISH_BRANCH = process.env.PUBLISH_BRANCH ?? 'main';
/** Generate + fix calls allowed per teacher per day (protects the Gemini credit). */
const DAILY_GENERATIONS = Number(process.env.TEACHER_DAILY_GENERATIONS ?? 40);
const ROOT = process.cwd();

export const CATEGORIES = [...new Set(catalog.map((q) => q.category))];

// ---------- tables (created on first use, so no re-seed is needed) ----------

let tablesReady: Promise<void> | null = null;
function ensureTables(): Promise<void> {
  if (!pool) return Promise.reject(new HttpError(503, 'The teacher panel needs DATABASE_URL (Postgres).'));
  tablesReady ??= pool
    .query(
      `create table if not exists teachers (
         id            serial primary key,
         email         text not null unique,
         name          text not null,
         password_hash text not null,
         active        boolean not null default true,
         created_at    timestamptz not null default now()
       );
       create table if not exists question_requests (
         id               serial primary key,
         teacher_id       integer references teachers(id) on delete set null,
         status           text not null default 'pending'
                          check (status in ('pending', 'accepted', 'rejected', 'published')),
         source_url       text,
         title            text not null,
         slug             text not null,
         difficulty       text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
         category         text not null,
         description      text not null,
         examples         jsonb not null default '[]',
         constraints      text not null default '',
         hidden_tests     jsonb not null default '[]',
         notes            text not null default '',
         admin_note       text not null default '',
         generated_code   text,
         generations      jsonb not null default '[]',
         published_commit text,
         created_at       timestamptz not null default now(),
         updated_at       timestamptz not null default now()
       );
       create index if not exists idx_requests_status on question_requests (status, created_at desc);
       -- Publishing opens a pull request; the question goes live when it is merged.
       alter table question_requests add column if not exists pr_number  integer;
       alter table question_requests add column if not exists pr_url     text;
       alter table question_requests add column if not exists pr_branch  text;
       alter table question_requests add column if not exists static_def jsonb;
       alter table question_requests add column if not exists catalog_id integer;
       alter table question_requests drop constraint if exists question_requests_status_check;
       alter table question_requests add constraint question_requests_status_check
         check (status in ('pending', 'accepted', 'rejected', 'in_review', 'published'));
       alter table teachers enable row level security;
       alter table question_requests enable row level security;`
    )
    .then(() => undefined)
    .catch((e) => {
      tablesReady = null;
      throw e;
    });
  return tablesReady;
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch((e) => {
      if (e instanceof HttpError) res.status(e.status).json({ error: e.message });
      else if (e instanceof z.ZodError) res.status(400).json({ error: e.issues[0]?.message ?? 'Invalid input.' });
      else next(e);
    });
  };

// ---------- shared schemas ----------

const exampleSchema = z.object({
  input: z.string().trim().max(2000),
  output: z.string().trim().max(2000),
  explanation: z.string().trim().max(2000).default(''),
});
const hiddenTestSchema = z.object({ input: z.string().trim().max(5000), output: z.string().trim().max(5000) });

const requestSchema = z.object({
  title: z.string().trim().min(2, 'Title is required.').max(160),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], { error: 'Pick a difficulty.' }),
  category: z.enum(CATEGORIES as [string, ...string[]], { error: 'Pick a category.' }),
  description: z.string().trim().min(10, 'Add the problem statement.').max(20000),
  examples: z.array(exampleSchema).min(1, 'Add at least one example (sample test case).').max(10),
  constraints: z.string().trim().max(5000).default(''),
  hiddenTests: z.array(hiddenTestSchema).max(50).default([]),
  sourceUrl: z.string().trim().url('Enter a valid URL.').max(500).optional().or(z.literal('')),
  notes: z.string().trim().max(3000).default(''),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** LeetCode links carry the canonical slug; everything else is slugged from the title. */
function slugFor(title: string, sourceUrl?: string): string {
  const m = sourceUrl?.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
  return m ? m[1].toLowerCase() : slugify(title);
}

// ---------- "is this already on the site?" ----------

export interface SiteMatch {
  slug: string;
  title: string;
  category: string;
  hasVisualizer: boolean;
  /** exact: same slug · title: same title · alias: a well-known other name · similar: title words overlap */
  kind: 'exact' | 'title' | 'alias' | 'similar';
}

// Common names other sites use for questions the catalog lists under the LeetCode title.
const ALIASES: [RegExp, string][] = [
  [/kadane|max(imum)? (sum )?sub ?array|largest sum contiguous/, 'maximum-subarray'],
  [/dutch national flag|sort (an array of )?0s,? 1s,? (and )?2s/, 'sort-colors'],
  [/detect (a )?(loop|cycle) in (a )?linked list|floyd/, 'linked-list-cycle'],
  [/missing (number|in array)/, 'missing-number'],
  [/reverse (a )?linked list$/, 'reverse-linked-list'],
  [/nth node from (the )?end/, 'remove-nth-node-from-end-of-list'],
  [/stock buy (and )?sell/, 'best-time-to-buy-and-sell-stock'],
  [/(count )?(number of )?islands?/, 'number-of-islands'],
  [/longest common subsequence|\blcs\b/, 'longest-common-subsequence'],
  [/longest increasing subsequence|\blis\b/, 'longest-increasing-subsequence'],
  [/0[ -/]?1 knapsack|subset sum/, 'partition-equal-subset-sum'],
  [/majority element/, 'majority-element'],
  [/valid(ate)? (bst|binary search tree)|check (for )?bst/, 'validate-binary-search-tree'],
  [/(height|depth) of (a )?binary tree/, 'maximum-depth-of-binary-tree'],
  [/mirror (of )?(a )?(binary )?tree|invert/, 'invert-binary-tree'],
  [/lru cache/, 'lru-cache'],
];

const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'to', 'for', 'and', 'is', 'with', 'from', 'by', 'given', 'problem', 'find']);

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w && !STOP.has(w));
}

/** Questions on the site that this request probably duplicates, best match first (at most 3). */
export function findSiteMatches(slug: string, title: string): SiteMatch[] {
  const out = new Map<string, SiteMatch>();
  const add = (s: string, kind: SiteMatch['kind']) => {
    const q = catalog.find((c) => c.slug === s);
    if (q && !out.has(s))
      out.set(s, { slug: s, title: q.title, category: q.category, hasVisualizer: !!problemRegistry[s], kind });
  };
  add(slug, 'exact');
  const norm = words(title).join(' ');
  for (const q of catalog) if (words(q.title).join(' ') === norm) add(q.slug, 'title');
  const low = title.toLowerCase();
  for (const [re, s] of ALIASES) if (re.test(low)) add(s, 'alias');
  const mine = new Set(words(title));
  if (mine.size && out.size === 0) {
    const scored = catalog
      .map((q) => {
        const theirs = new Set(words(q.title));
        const inter = [...mine].filter((w) => theirs.has(w)).length;
        const jaccard = inter / (mine.size + theirs.size - inter);
        // "Valid Palindrome" vs "Valid Palindrome II" differ only by a numeral: keep it a strong match.
        const contained = inter >= 2 && inter === Math.min(mine.size, theirs.size) ? 0.75 : 0;
        return { q, score: Math.max(jaccard, contained) };
      })
      .filter((x) => x.score >= 0.6)
      .sort((a, b) => b.score - a.score);
    for (const { q } of scored.slice(0, 3)) add(q.slug, 'similar');
  }
  return [...out.values()].slice(0, 3);
}

type RequestRow = {
  id: number;
  teacher_id: number | null;
  teacher_name?: string;
  teacher_email?: string;
  status: string;
  source_url: string | null;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  examples: unknown;
  constraints: string;
  hidden_tests: unknown;
  notes: string;
  admin_note: string;
  generated_code: string | null;
  generations: unknown;
  published_commit: string | null;
  pr_number: number | null;
  pr_url: string | null;
  pr_branch: string | null;
  static_def: unknown;
  catalog_id: number | null;
  created_at: string;
  updated_at: string;
};

function toApi(r: RequestRow, full: boolean) {
  const base = {
    id: r.id,
    status: r.status,
    title: r.title,
    slug: r.slug,
    difficulty: r.difficulty,
    category: r.category,
    sourceUrl: r.source_url,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    teacher: r.teacher_name ? { name: r.teacher_name, email: r.teacher_email } : undefined,
    alreadyOnSite: !!problemRegistry[r.slug],
    siteMatches: findSiteMatches(r.slug, r.title),
    publishedCommit: r.published_commit,
    review: r.pr_number ? { number: r.pr_number, url: r.pr_url, branch: r.pr_branch } : null,
  };
  if (!full) return base;
  return {
    ...base,
    description: r.description,
    examples: r.examples,
    constraints: r.constraints,
    hiddenTests: r.hidden_tests,
    notes: r.notes,
    generatedCode: r.generated_code,
    generations: r.generations,
  };
}

const REQUEST_SELECT = `select q.*, t.name as teacher_name, t.email as teacher_email
                          from question_requests q left join teachers t on t.id = q.teacher_id`;

async function getRequest(id: number): Promise<RequestRow> {
  const r = await pool!.query(`${REQUEST_SELECT} where q.id = $1`, [id]);
  if (!r.rows[0]) throw new HttpError(404, 'Request not found.');
  return r.rows[0];
}

// ---------- per-IP / per-teacher limits ----------

// Sign-in attempts per IP per 15 minutes (per instance on Vercel: a soft limit).
const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX = 10;
const loginHits = new Map<string, { start: number; n: number }>();
function loginAllowed(ip: string): boolean {
  const now = Date.now();
  const e = loginHits.get(ip);
  if (!e || now - e.start > LOGIN_WINDOW_MS) {
    loginHits.set(ip, { start: now, n: 1 });
    return true;
  }
  e.n++;
  return e.n <= LOGIN_MAX;
}

/** Gemini calls (generate + fix) this teacher made since midnight UTC. */
async function generationsToday(teacherId: number): Promise<number> {
  const r = await pool!.query(
    `select count(*)::int as n
       from question_requests q, jsonb_array_elements(q.generations) g
      where q.teacher_id = $1 and (g->>'at')::timestamptz >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'`,
    [teacherId]
  );
  return r.rows[0].n;
}

async function checkDailyLimit(teacherId: number): Promise<void> {
  if ((await generationsToday(teacherId)) >= DAILY_GENERATIONS)
    throw new HttpError(429, `Daily limit reached (${DAILY_GENERATIONS} AI generations). It resets at midnight UTC.`);
}

// ---------- teacher auth ----------

interface TeacherRequest extends Request {
  teacher?: { id: number; email: string; name: string };
}

async function requireTeacher(req: TeacherRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  let payload: { role?: string; tid?: number } = {};
  try {
    payload = token ? (jwt.verify(token, JWT_SECRET) as typeof payload) : {};
  } catch {
    /* falls through */
  }
  if (payload.role !== 'teacher' || !payload.tid) {
    res.status(401).json({ error: 'Sign in as a teacher to continue.' });
    return;
  }
  try {
    await ensureTables();
    const r = await pool!.query('select id, email, name, active from teachers where id = $1', [payload.tid]);
    const t = r.rows[0];
    if (!t || !t.active) {
      res.status(401).json({ error: 'This teacher account is disabled.' });
      return;
    }
    req.teacher = { id: t.id, email: t.email, name: t.name };
    next();
  } catch (e) {
    next(e);
  }
}

export const teacherRouter = Router();
teacherRouter.use(express.json({ limit: '2mb' }));

const loginSchema = z.object({
  // A username like "name@school" is fine too: it's only an account identifier.
  email: z.string().trim().toLowerCase().min(3, 'Enter your email.').max(120),
  password: z.string().min(1, 'Password is required.').max(72),
});

teacherRouter.post(
  '/login',
  wrap(async (req, res) => {
    if (!loginAllowed(req.ip ?? 'unknown')) throw new HttpError(429, 'Too many sign-in attempts. Wait 15 minutes and try again.');
    await ensureTables();
    const { email, password } = loginSchema.parse(req.body);
    const r = await pool!.query('select id, email, name, password_hash, active from teachers where email = $1', [email]);
    const t = r.rows[0];
    if (!t || !(await bcrypt.compare(password, t.password_hash))) throw new HttpError(401, 'Wrong email or password.');
    if (!t.active) throw new HttpError(403, 'This teacher account is disabled. Contact the VizuCode team.');
    const token = jwt.sign({ role: 'teacher', tid: t.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, teacher: { id: t.id, email: t.email, name: t.name } });
  })
);

teacherRouter.get('/me', requireTeacher, (req: TeacherRequest, res) => {
  res.json({
    teacher: req.teacher,
    categories: CATEGORIES,
    ai: !!GEMINI_API_KEY,
    model: GEMINI_CODE_MODEL,
    github: { repo: GITHUB_REPO, branch: PUBLISH_BRANCH, ready: !!githubToken() },
  });
});

teacherRouter.post(
  '/scrape',
  requireTeacher,
  wrap(async (req, res) => {
    const { url } = z.object({ url: z.string().trim().url('Enter a valid URL.').max(500) }).parse(req.body);
    let data;
    try {
      data = await scrapeQuestion(url);
    } catch (e) {
      if (e instanceof ScrapeError) throw new HttpError(422, e.message);
      throw e;
    }
    if (!CATEGORIES.includes(data.category)) data.category = 'Arrays & Hashing';
    res.json({ question: data });
  })
);

teacherRouter.get(
  '/requests',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const r = await pool!.query(`${REQUEST_SELECT} where q.teacher_id = $1 order by q.created_at desc`, [req.teacher!.id]);
    const rows: RequestRow[] = await Promise.all(r.rows.map((row: RequestRow) => syncReview(row)));
    res.json({ requests: rows.map((row) => toApi(row, false)) });
  })
);

/** The signed-in teacher's own question, or 404. */
async function ownRequest(req: TeacherRequest): Promise<RequestRow> {
  const row = await getRequest(Number(req.params.id));
  if (row.teacher_id !== req.teacher!.id) throw new HttpError(404, 'Question not found.');
  return row;
}

teacherRouter.get(
  '/requests/:id',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const row = await syncReview(await ownRequest(req));
    const typeErrors = row.generated_code && row.status !== 'published' ? await typecheckModule(row.generated_code, row.slug) : [];
    res.json({ request: { ...toApi(row, true), typeErrors } });
  })
);

teacherRouter.post(
  '/requests',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const b = requestSchema.parse(req.body);
    const slug = slugFor(b.title, b.sourceUrl || undefined);
    if (!slug) throw new HttpError(400, 'The title needs some letters or numbers.');
    if (problemRegistry[slug]) throw new HttpError(409, 'VizuCode already has a visualizer for this question.');
    const dup = await pool!.query(
      `select q.id, t.name from question_requests q left join teachers t on t.id = q.teacher_id
        where q.slug = $1 and q.status <> 'published'`,
      [slug]
    );
    if (dup.rows[0])
      throw new HttpError(409, `This question is already being built (#${dup.rows[0].id} by ${dup.rows[0].name ?? 'another teacher'}).`);
    const r = await pool!.query(
      `insert into question_requests
         (teacher_id, source_url, title, slug, difficulty, category, description, examples, constraints, hidden_tests, notes)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
      [
        req.teacher!.id,
        b.sourceUrl || null,
        b.title,
        slug,
        b.difficulty,
        b.category,
        b.description,
        JSON.stringify(b.examples),
        b.constraints,
        JSON.stringify(b.hiddenTests),
        b.notes,
      ]
    );
    res.status(201).json({ id: r.rows[0].id, slug });
  })
);

teacherRouter.delete(
  '/requests/:id',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const row = await ownRequest(req);
    if (row.status === 'published') throw new HttpError(409, 'Published questions are live on the site and cannot be deleted here.');
    if (row.pr_number) await closeReview(row).catch((e) => console.error('[teacher] closing review failed:', e.message));
    await pool!.query('delete from question_requests where id = $1', [row.id]);
    res.json({ ok: true });
  })
);

teacherRouter.put(
  '/requests/:id/code',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const { code } = z.object({ code: z.string().min(20).max(400_000) }).parse(req.body);
    const row = await ownRequest(req);
    if (row.status === 'published') throw new HttpError(409, 'Already published.');
    await pool!.query('update question_requests set generated_code = $1, updated_at = now() where id = $2', [code, row.id]);
    res.json({ ok: true, typeErrors: await typecheckModule(code, row.slug) });
  })
);

teacherRouter.post(
  '/requests/:id/generate',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const { prompt, sample } = z
      .object({ prompt: z.string().trim().max(4000).default(''), sample: z.number().int().min(0).max(9).default(0) })
      .parse(req.body ?? {});
    const row = await ownRequest(req);
    if (row.status === 'published') throw new HttpError(409, 'Already published.');
    await checkDailyLimit(req.teacher!.id);
    const started = Date.now();
    const code = await generateVisualizer(row, prompt, sample);
    res.json(await saveGeneration(row, code, { prompt, kind: 'generate', ms: Date.now() - started }));
  })
);

// One type-fix round per request (each Gemini call fits the serverless time
// limit); the page calls this again while errors remain, up to MAX_TYPE_FIXES.
teacherRouter.post(
  '/requests/:id/fix',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const row = await ownRequest(req);
    if (row.status === 'published') throw new HttpError(409, 'Already published.');
    if (!row.generated_code) throw new HttpError(409, 'Generate the visualizer first.');
    const errors = await typecheckModule(row.generated_code, row.slug);
    if (!errors.length) {
      res.json({ code: row.generated_code, typeErrors: [] });
      return;
    }
    await checkDailyLimit(req.teacher!.id);
    const started = Date.now();
    const code = await fixTypeErrors(row.generated_code, errors);
    res.json(await saveGeneration(row, code, { prompt: '(auto type fix)', kind: 'fix', ms: Date.now() - started }));
  })
);

async function saveGeneration(row: RequestRow, code: string, meta: { prompt: string; kind: string; ms: number }) {
  const entry = { at: new Date().toISOString(), ...meta, model: GEMINI_CODE_MODEL };
  await pool!.query(
    `update question_requests
        set generated_code = $1, generations = generations || $2::jsonb, updated_at = now()
      where id = $3`,
    [code, JSON.stringify([entry]), row.id]
  );
  return { code, generation: entry, typeErrors: await typecheckModule(code, row.slug) };
}

teacherRouter.post(
  '/requests/:id/publish',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const staticSchema = z
      .object({
        slug: z.string(),
        technique: z.string(),
        widget: z.string(),
        widgetTitle: z.string(),
        inputs: z.array(z.unknown()),
        code: z.object({ cpp: z.array(z.unknown()), java: z.array(z.unknown()) }),
        note: z.string(),
        complexity: z.object({ time: z.string(), space: z.string() }),
        brute: z.unknown().optional(),
      })
      .passthrough();
    const { static: s } = z.object({ static: staticSchema }).parse(req.body);
    const row = await ownRequest(req);
    if (row.status === 'published') throw new HttpError(409, 'Already published.');
    if (!row.generated_code) throw new HttpError(409, 'Generate (and preview) the visualizer first.');
    if (s.slug !== row.slug) throw new HttpError(400, `The code's slug must be "${row.slug}".`);
    if (problemRegistry[row.slug]) throw new HttpError(409, 'This question already has a visualizer on the site.');
    const typeErrors = await typecheckModule(row.generated_code, row.slug);
    if (typeErrors.length)
      throw new HttpError(409, `The code has ${typeErrors.length} TypeScript error(s), so it would break the site build. Regenerate or fix them first.`);

    const review = await sendForReview(row);
    await pool!.query(
      `update question_requests
          set status = 'in_review', pr_number = $1, pr_url = $2, pr_branch = $3, static_def = $4,
              catalog_id = $5, admin_note = '', updated_at = now()
        where id = $6`,
      [review.number, review.url, review.branch, JSON.stringify(s), review.catalogId, row.id]
    );
    res.json({ ok: true, review: { number: review.number, url: review.url, branch: review.branch } });
  })
);

// ---------- Gemini: question -> ProblemDef module ----------

function readSrc(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

/** One complete, short reference visualizer (Move Zeroes) cut out of pointers.ts. */
function referenceExample(): string {
  const src = readSrc('src/problems/pointers.ts');
  const start = src.indexOf('const moveZeroes: ProblemDef');
  const end = src.indexOf('\n};', start);
  return src.slice(start, end + 3);
}

export async function generateVisualizer(row: RequestRow, extra: string, sampleIdx: number): Promise<string> {
  if (!GEMINI_API_KEY) throw new HttpError(503, 'GEMINI_API_KEY is not set on the server.');
  const examples = (row.examples as { input: string; output: string; explanation?: string }[]) ?? [];
  const sample = examples[sampleIdx] ?? examples[0];
  const previous = row.generated_code;

  const prompt = `You write interactive algorithm visualizers for VizuCode, a site that teaches DSA questions step by step.
Write ONE TypeScript module for the question below. Output ONLY the TypeScript source, no markdown fences, no commentary.

## Hard rules
- The file lives at src/problems/generated/${row.slug}.ts. Import ONLY from:
  import type { ProblemDef, Step, ... } from '../../lib/types';
  import { parseIntArray, parseInt1, parseLevelOrder } from '../../lib/parse';   // only the ones you use
  import { A, B, C, F, L } from '../../lib/trace';                              // only the ones you use
- Export exactly: export const problem: ProblemDef = { ... };
- slug must be '${row.slug}', title '${row.title.replace(/'/g, "\\'")}', category '${row.category}', difficulty '${row.difficulty}'.
- leetcode: '${row.source_url ?? ''}' (the source link; may be a non-LeetCode site).
- Pick the widget that fits the data structure: ${'binary-search | array | tree | graph | matrix | stack | list | heap | bits | intervals'}. The state object of every Step must match that widget's *State interface in types.ts exactly.
- inputs: one InputField per input with a defaultValue equal to the SAMPLE TEST CASE below (in the format the parser expects, e.g. "1, 2, 3"). Keep inputs small and validate them (return { error } on bad input, never throw). Cap sizes so the trace stays short (e.g. at most 12 elements).
- code.cpp and code.java: a clean, correct, idiomatic solution, one L(text, ...tags) per line. Tag the lines each step highlights; every Step.tag must exist in BOTH code listings.
- run(values): run the REAL algorithm on the input and push a Step for every meaningful state change, with a short plain-English trace (A/B/C/F tokens) a beginner can follow. Finish with result (string) and resultDetail.
- run(defaults) MUST produce the sample's expected output: ${sample ? JSON.stringify(sample.output) : '(see examples)'}.
- Fill technique, widgetTitle, note ("why this works"), complexity. Add a brute approach only if it's simple.
- Valid TypeScript that compiles under strict mode. No external libraries, no DOM, no network.

## types.ts (widget state shapes)
${readSrc('src/lib/types.ts')}

## parse.ts
${readSrc('src/lib/parse.ts')}

## trace.ts
${readSrc('src/lib/trace.ts')}

## Reference visualizer (style to copy; it lives in another folder so its imports use '../lib/...')
${referenceExample()}

## The question
Title: ${row.title} (${row.difficulty}, ${row.category})
Statement:
${row.description}

Examples:
${examples.map((e, i) => `Example ${i + 1}:\nInput: ${e.input}\nOutput: ${e.output}${e.explanation ? `\nExplanation: ${e.explanation}` : ''}`).join('\n\n')}

Constraints:
${row.constraints || '(none given)'}

SAMPLE TEST CASE to use as the default input: ${sample ? `Input: ${sample.input} -> Output: ${sample.output}` : 'the first example'}
${row.notes ? `\nTeacher's notes: ${row.notes}` : ''}
${previous && extra ? `\n## Previous version (revise it; keep what works)\n${previous}` : ''}
${extra ? `\n## Teacher's instructions for this version (highest priority)\n${extra}` : ''}`;

  return geminiModule(prompt);
}

/**
 * tsc is stricter than the browser preview (which only strips types): send its
 * errors back to Gemini so what gets published also builds.
 */
async function fixTypeErrors(code: string, errors: string[]): Promise<string> {
  return geminiModule(
    `This TypeScript module must compile under strict mode, but tsc reports these errors:\n${errors.join('\n')}\n\n` +
      `Fix them without changing the behaviour. Output ONLY the full corrected module, no markdown fences.\n` +
      `Reminder of the types it must satisfy:\n${readSrc('src/lib/types.ts')}\n\n## Module\n${code}`
  );
}

/** One Gemini call that must return a whole visualizer module; retries a busy/overloaded model briefly. */
async function geminiModule(prompt: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await geminiModuleOnce(prompt);
    } catch (e) {
      const busy = e instanceof HttpError && /HTTP (500|503)\b/.test(e.message);
      if (!busy || attempt >= 3) throw e;
      console.warn(`[teacher] Gemini busy, retry ${attempt}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function geminiModuleOnce(prompt: string): Promise<string> {
  let r: globalThis.Response;
  try {
    r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CODE_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY! },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 32768 },
      }),
      // Stay inside the serverless function limit (vercel.json maxDuration).
      signal: AbortSignal.timeout(Number(process.env.GEMINI_TIMEOUT_MS ?? 55_000)),
    }
  );
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError'))
      throw new HttpError(504, 'Gemini took too long this time. Click Generate again (it usually finishes in under a minute).');
    throw new HttpError(502, "Couldn't reach Gemini. Try again in a minute.");
  }
  if (!r.ok) {
    console.error(`[teacher] Gemini HTTP ${r.status}: ${(await r.text()).slice(0, 400)}`);
    if (r.status === 402)
      throw new HttpError(502, 'Gemini credits are used up. Top up the project at https://ai.studio/projects and try again.');
    if (r.status === 429) throw new HttpError(502, 'Gemini rate limit hit. Wait a minute and try again.');
    if (r.status === 503 || r.status === 500)
      throw new HttpError(503, `Gemini is overloaded right now (HTTP ${r.status}). Try again in a minute.`);
    throw new HttpError(502, `Gemini returned HTTP ${r.status}. Try again in a minute.`);
  }
  const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
  let text = (data.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  text = text.replace(/^```[a-z]*\s*\n/i, '').replace(/\n```\s*$/, '').trim();
  if (!/export const problem\s*:/.test(text)) {
    console.error('[teacher] unexpected Gemini output:', text.slice(0, 400));
    throw new HttpError(502, 'Gemini returned something that is not a visualizer module. Generate again.');
  }
  return text + '\n';
}

// ---------- GitHub publish ----------

function githubToken(): string | null {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}

async function gh<T>(method: string, url: string, body?: unknown, allow404 = false): Promise<T> {
  const token = githubToken();
  if (!token) throw new HttpError(503, 'No GitHub token: set GITHUB_TOKEN or run `gh auth login` on the server.');
  const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (allow404 && (r.status === 404 || r.status === 422 && method === 'DELETE')) return null as T;
  if (!r.ok) {
    const msg = (await r.text()).slice(0, 300);
    console.error(`[teacher] GitHub ${method} ${url} -> ${r.status}: ${msg}`);
    throw new HttpError(502, `GitHub refused the request (HTTP ${r.status}).`);
  }
  return (r.status === 204 ? null : await r.json()) as T;
}

async function ghFile(file: string, ref: string, allow404 = false): Promise<string | null> {
  const f = await gh<{ content: string } | null>('GET', `/contents/${file}?ref=${ref}`, undefined, allow404);
  return f ? Buffer.from(f.content, 'base64').toString('utf8') : null;
}

const GEN_INDEX = 'src/problems/generated/index.ts';
const REGISTRY = 'src/problems/index.ts';

/** generated/index.ts as it looks before any question is added (used when main doesn't have it yet). */
export const EMPTY_GEN_INDEX = `// Visualizers published from the teacher panel (written by Gemini, checked in
// its live preview, merged after review). Publishing adds one import above
// \`@generated-imports\` and one entry above \`@generated-list\` per question,
// so keep both marker comments.
import type { ProblemDef } from '../../lib/types';
// @generated-imports

export const generatedProblems: ProblemDef[] = [
  // @generated-list
];
`;

/** Wires generated/index.ts into the problem registry (only needed once, on a main that predates the folder). */
export function wireRegistry(src: string): string {
  if (src.includes("from './generated'")) return src;
  const lastImport = src.lastIndexOf('\nimport ');
  const eol = src.indexOf('\n', lastImport + 1);
  const close = src.indexOf('\n];', src.indexOf('const all: ProblemDef[] = ['));
  if (lastImport < 0 || close < 0) throw new HttpError(500, `Unexpected ${REGISTRY} format; publish by hand.`);
  return (
    src.slice(0, eol + 1) +
    "import { generatedProblems } from './generated';\n" +
    src.slice(eol + 1, close) +
    '\n  ...generatedProblems,' +
    src.slice(close)
  );
}
const CATALOG = 'src/data/catalog.ts';

/**
 * The two text edits a publish makes: register the module in generated/index.ts
 * and add a catalog entry (reusing the slug's entry if it is already listed).
 * Pure, so it can be tested without touching GitHub.
 */
export function applyPublishEdits(
  indexSrc: string,
  catalogSrc: string,
  row: Pick<RequestRow, 'slug' | 'title' | 'category' | 'difficulty' | 'source_url'>
): { index: string; catalog: string; catalogId: number } {
  let index = indexSrc;
  const ident = 'p_' + row.slug.replace(/[^a-z0-9]/gi, '_');
  if (!index.includes('// @generated-imports') || !index.includes('  // @generated-list'))
    throw new HttpError(500, `${GEN_INDEX} is missing its marker comments; publish by hand.`);
  if (!index.includes(`'./${row.slug}'`)) {
    index = index
      .replace('// @generated-imports', `import { problem as ${ident} } from './${row.slug}';\n// @generated-imports`)
      .replace('  // @generated-list', `  ${ident},\n  // @generated-list`);
  }

  let cat = catalogSrc;
  const existing = cat.match(new RegExp(`"id": (\\d+),[^}]*?"slug": "${row.slug}"`, 's'));
  let catalogId: number;
  if (existing) {
    catalogId = Number(existing[1]);
  } else {
    catalogId = Math.max(...[...cat.matchAll(/"id": (\d+)/g)].map((m) => Number(m[1]))) + 1;
    const entry = JSON.stringify(
      {
        id: catalogId,
        category: row.category,
        title: row.title,
        difficulty: row.difficulty,
        leetcode: row.source_url ?? '',
        slug: row.slug,
      },
      null,
      2
    )
      .split('\n')
      .map((l) => '  ' + l)
      .join('\n');
    const end = cat.lastIndexOf('}\n];');
    if (end < 0) throw new HttpError(500, 'Unexpected catalog.ts format; publish by hand.');
    cat = cat.slice(0, end) + '},\n' + entry + '\n];' + cat.slice(end + 4);
  }
  return { index, catalog: cat, catalogId };
}

function reviewBranch(row: Pick<RequestRow, 'id' | 'slug'>): string {
  return `teacher-panel/${row.id}-${row.slug}`.slice(0, 120);
}

/**
 * Puts the question on its own branch as one commit on top of the current
 * main (rebuilt from scratch each time, so it never conflicts with other
 * questions merged in the meantime) and opens a pull request for review —
 * or updates the open one.
 */
export async function sendForReview(
  row: RequestRow
): Promise<{ number: number; url: string; branch: string; catalogId: number }> {
  const branch = row.pr_branch ?? reviewBranch(row);
  const commit = await commitOnMain(row);
  const exists = await gh('GET', `/git/ref/heads/${encodeURIComponent(branch)}`, undefined, true);
  if (exists) await gh('PATCH', `/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha, force: true });
  else await gh('POST', '/git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });

  if (row.pr_number) {
    const pr = await gh<{ state: string; html_url: string }>('GET', `/pulls/${row.pr_number}`);
    if (pr.state === 'open') return { number: row.pr_number, url: pr.html_url, branch, catalogId: commit.catalogId };
  }
  const examples = (row.examples as { input: string; output: string }[]) ?? [];
  const pr = await gh<{ number: number; html_url: string }>('POST', '/pulls', {
    title: `Teacher panel: add ${row.title} visualizer`,
    head: branch,
    base: PUBLISH_BRANCH,
    body: [
      `Submitted from the teacher panel by **${row.teacher_name ?? 'a teacher'}** (${row.teacher_email ?? 'unknown'}), question #${row.id}.`,
      '',
      `- **${row.title}** · ${row.difficulty} · ${row.category}${row.source_url ? ` · [source](${row.source_url})` : ''}`,
      `- Sample: \`${(examples[0]?.input ?? '').slice(0, 120)}\` → \`${(examples[0]?.output ?? '').slice(0, 120)}\``,
      '- Generated with Gemini; passed the type check and the in-browser run check.',
      '',
      `Merge to publish it: Vercel deploys main, and the teacher panel adds the question to the database the next time it is opened. Close without merging to send it back to the teacher as a draft.`,
    ].join('\n'),
  });
  return { number: pr.number, url: pr.html_url, branch, catalogId: commit.catalogId };
}

/** Builds (but doesn't push to main) one commit on top of main with the module + its two edits. */
async function commitOnMain(row: RequestRow): Promise<{ sha: string; catalogId: number }> {
  const ref = await gh<{ object: { sha: string } }>('GET', `/git/ref/heads/${PUBLISH_BRANCH}`);
  const parentSha = ref.object.sha;
  const parent = await gh<{ tree: { sha: string } }>('GET', `/git/commits/${parentSha}`);
  const existingIndex = await ghFile(GEN_INDEX, parentSha, true);
  const { index, catalog: cat, catalogId } = applyPublishEdits(
    existingIndex ?? EMPTY_GEN_INDEX,
    (await ghFile(CATALOG, parentSha))!,
    row
  );
  const files = [
    { path: `src/problems/generated/${row.slug}.ts`, mode: '100644', type: 'blob', content: row.generated_code },
    { path: GEN_INDEX, mode: '100644', type: 'blob', content: index },
    { path: CATALOG, mode: '100644', type: 'blob', content: cat },
  ];
  // First question ever on this main: also register the generated folder.
  if (!existingIndex)
    files.push({ path: REGISTRY, mode: '100644', type: 'blob', content: wireRegistry((await ghFile(REGISTRY, parentSha))!) });
  const tree = await gh<{ sha: string }>('POST', '/git/trees', { base_tree: parent.tree.sha, tree: files });
  const commit = await gh<{ sha: string }>('POST', '/git/commits', {
    message: `Add ${row.title} visualizer (teacher panel #${row.id})\n\nGenerated with Gemini in the teacher panel and checked in its live preview.`,
    tree: tree.sha,
    parents: [parentSha],
  });
  return { sha: commit.sha, catalogId };
}

async function closeReview(row: RequestRow): Promise<void> {
  if (row.pr_number) await gh('PATCH', `/pulls/${row.pr_number}`, { state: 'closed' });
  if (row.pr_branch) await gh('DELETE', `/git/refs/heads/${encodeURIComponent(row.pr_branch)}`, undefined, true);
}

// Don't ask GitHub about the same pull request more than once a minute.
const lastSync = new Map<number, number>();

/**
 * For a question in review, looks at its pull request: merged -> mark it
 * published and add it to the database (the deploy of main brings the code);
 * closed -> back to draft; open but conflicting -> rebuild it on today's main.
 */
async function syncReview(row: RequestRow): Promise<RequestRow> {
  if (row.status !== 'in_review' || !row.pr_number) return row;
  if (Date.now() - (lastSync.get(row.id) ?? 0) < 60_000) return row;
  lastSync.set(row.id, Date.now());
  try {
    const pr = await gh<{ state: string; merged: boolean; merge_commit_sha: string | null; mergeable_state?: string }>(
      'GET',
      `/pulls/${row.pr_number}`
    );
    if (pr.merged) {
      if (row.static_def) await upsertDb(row, row.static_def as never, row.catalog_id ?? 0);
      await pool!.query(
        `update question_requests set status = 'published', published_commit = $1, updated_at = now() where id = $2`,
        [pr.merge_commit_sha, row.id]
      );
      return { ...row, status: 'published', published_commit: pr.merge_commit_sha };
    }
    if (pr.state === 'closed') {
      const note = 'The review was closed without merging. Fix it and send it for review again.';
      await pool!.query(
        `update question_requests set status = 'pending', admin_note = $1, pr_number = null, pr_url = null, updated_at = now() where id = $2`,
        [note, row.id]
      );
      return { ...row, status: 'pending', admin_note: note, pr_number: null, pr_url: null };
    }
    if (pr.mergeable_state === 'dirty') {
      // Another question was merged first and touched the same lines: rebuild on top of main.
      const fresh = await sendForReview(row);
      await pool!.query('update question_requests set catalog_id = $1 where id = $2', [fresh.catalogId, row.id]);
    }
  } catch (e) {
    console.error(`[teacher] review sync for #${row.id} failed:`, e instanceof Error ? e.message : e);
  }
  return row;
}

/** Same rows `npm run db:seed` would write, so the live API lists it without a re-seed. */
async function upsertDb(
  row: RequestRow,
  s: {
    technique: string;
    widget: string;
    widgetTitle: string;
    inputs: unknown;
    code: { cpp: unknown; java: unknown };
    note: string;
    complexity: { time: string; space: string };
    brute?: unknown;
  },
  id: number
): Promise<void> {
  const client = await pool!.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into questions (id, slug, category, title, difficulty, leetcode)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (slug) do update set category = excluded.category, title = excluded.title,
         difficulty = excluded.difficulty, leetcode = excluded.leetcode`,
      [id, row.slug, row.category, row.title, row.difficulty, row.source_url ?? '']
    );
    await client.query(
      `insert into problem_content
         (slug, technique, widget, widget_title, inputs, code_cpp, code_java, note, time_complexity, space_complexity, brute)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       on conflict (slug) do update set technique = excluded.technique, widget = excluded.widget,
         widget_title = excluded.widget_title, inputs = excluded.inputs, code_cpp = excluded.code_cpp,
         code_java = excluded.code_java, note = excluded.note, time_complexity = excluded.time_complexity,
         space_complexity = excluded.space_complexity, brute = excluded.brute`,
      [
        row.slug,
        s.technique,
        s.widget,
        s.widgetTitle,
        JSON.stringify(s.inputs),
        JSON.stringify(s.code.cpp),
        JSON.stringify(s.code.java),
        s.note,
        s.complexity.time,
        s.complexity.space,
        s.brute ? JSON.stringify(s.brute) : null,
      ]
    );
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}
