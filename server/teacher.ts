// Teacher panel + admin review (local server for now).
//
// Teachers (accounts created by an admin, not self sign-up) log in with email +
// password and request a visualizer for any DSA question — typed in by hand or
// scraped from a LeetCode / GeeksforGeeks / CodeChef URL by
// scripts/scrape_question.py (requests + BeautifulSoup).
//
// Admins (site users whose email is in ADMIN_EMAILS) review requests, accept or
// reject them, have Gemini write the visualizer (a ProblemDef TS module) from
// the question + one sample test case, preview it in the browser, regenerate
// with extra instructions, and publish: one commit to GitHub (the new file,
// its registry entry and its catalog entry) plus an upsert into Postgres.
import { Router, type Request, type Response, type NextFunction } from 'express';
import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { execFile, execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pool } from './db';
import { requireAuth, type AuthedRequest } from './auth';
import { catalog } from '../src/data/catalog';
import { problemRegistry } from '../src/problems';

const JWT_SECRET = process.env.JWT_SECRET ?? 'vizucode-dev-secret-change-me';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_CODE_MODEL = process.env.GEMINI_CODE_MODEL ?? process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
const GITHUB_REPO = process.env.GITHUB_REPO ?? 'Dhruvdj2004/vizucode';
const PUBLISH_BRANCH = process.env.PUBLISH_BRANCH ?? 'main';
const PYTHON_BIN =
  process.env.PYTHON_BIN ?? (existsSync('/opt/miniconda3/bin/python') ? '/opt/miniconda3/bin/python' : 'python3');
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

// ---------- scraping (Python + BeautifulSoup) ----------

function scrape(url: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    execFile(
      PYTHON_BIN,
      ['-I', path.join(ROOT, 'scripts', 'scrape_question.py'), url],
      { timeout: 45_000, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        let data: Record<string, unknown> | null = null;
        try {
          data = JSON.parse(stdout);
        } catch {
          /* handled below */
        }
        if (data && typeof data.error === 'string') return reject(new HttpError(422, data.error));
        if (err || !data) {
          console.error('[teacher] scraper failed:', err?.message, stderr.slice(0, 500));
          const missing = /No module named/.test(stderr);
          return reject(
            new HttpError(
              500,
              missing
                ? 'The scraper needs Python packages: pip install -r scripts/requirements-scraper.txt'
                : "Couldn't read that page. Fill the form in by hand."
            )
          );
        }
        resolve(data);
      }
    );
  });
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
teacherRouter.use(express.json({ limit: '256kb' }));

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(72),
});

teacherRouter.post(
  '/login',
  wrap(async (req, res) => {
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
  res.json({ teacher: req.teacher, categories: CATEGORIES });
});

teacherRouter.post(
  '/scrape',
  requireTeacher,
  wrap(async (req, res) => {
    const { url } = z.object({ url: z.string().trim().url('Enter a valid URL.').max(500) }).parse(req.body);
    const data = await scrape(url);
    if (typeof data.category !== 'string' || !CATEGORIES.includes(data.category)) data.category = 'Arrays & Hashing';
    res.json({ question: data });
  })
);

teacherRouter.get(
  '/requests',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const r = await pool!.query(`${REQUEST_SELECT} where q.teacher_id = $1 order by q.created_at desc`, [req.teacher!.id]);
    res.json({ requests: r.rows.map((row: RequestRow) => toApi(row, false)) });
  })
);

teacherRouter.get(
  '/requests/:id',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const row = await getRequest(Number(req.params.id));
    if (row.teacher_id !== req.teacher!.id) throw new HttpError(404, 'Request not found.');
    const out = toApi(row, true) as Record<string, unknown>;
    delete out.generatedCode;
    delete out.generations;
    res.json({ request: out });
  })
);

teacherRouter.post(
  '/requests',
  requireTeacher,
  wrap(async (req: TeacherRequest, res) => {
    const b = requestSchema.parse(req.body);
    const slug = slugFor(b.title, b.sourceUrl || undefined);
    if (!slug) throw new HttpError(400, 'The title needs some letters or numbers.');
    const dup = await pool!.query(
      `select id from question_requests where slug = $1 and status in ('pending', 'accepted')`,
      [slug]
    );
    if (dup.rows[0]) throw new HttpError(409, 'This question has already been requested and is being reviewed.');
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
    res.status(201).json({ id: r.rows[0].id, slug, alreadyOnSite: !!problemRegistry[slug] });
  })
);

// ---------- admin ----------

async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, () => {
    if (!ADMIN_EMAILS.includes(req.user!.email.toLowerCase())) {
      res.status(403).json({ error: 'Admins only. Add your email to ADMIN_EMAILS on the server.' });
      return;
    }
    ensureTables().then(() => next(), next);
  });
}

export const adminRouter = Router();
adminRouter.use(express.json({ limit: '2mb' }));
adminRouter.use(requireAdmin);

adminRouter.get('/me', (req: AuthedRequest, res) => {
  res.json({
    admin: req.user!.email,
    categories: CATEGORIES,
    ai: !!GEMINI_API_KEY,
    model: GEMINI_CODE_MODEL,
    github: { repo: GITHUB_REPO, branch: PUBLISH_BRANCH, ready: !!githubToken() },
  });
});

adminRouter.get(
  '/teachers',
  wrap(async (_req, res) => {
    const r = await pool!.query(
      `select t.id, t.email, t.name, t.active, t.created_at,
              (select count(*)::int from question_requests q where q.teacher_id = t.id) as requests
         from teachers t order by t.created_at desc`
    );
    res.json({ teachers: r.rows });
  })
);

adminRouter.post(
  '/teachers',
  wrap(async (req, res) => {
    const b = z
      .object({
        email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
        name: z.string().trim().min(1, 'Name is required.').max(80),
        password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
      })
      .parse(req.body);
    const hash = await bcrypt.hash(b.password, 10);
    try {
      const r = await pool!.query(
        'insert into teachers (email, name, password_hash) values ($1, $2, $3) returning id',
        [b.email, b.name, hash]
      );
      res.status(201).json({ id: r.rows[0].id });
    } catch (e) {
      if ((e as { code?: string }).code === '23505') throw new HttpError(409, 'A teacher with this email already exists.');
      throw e;
    }
  })
);

adminRouter.patch(
  '/teachers/:id',
  wrap(async (req, res) => {
    const b = z
      .object({ active: z.boolean().optional(), password: z.string().min(8).max(72).optional() })
      .parse(req.body);
    if (b.active !== undefined) await pool!.query('update teachers set active = $1 where id = $2', [b.active, req.params.id]);
    if (b.password)
      await pool!.query('update teachers set password_hash = $1 where id = $2', [await bcrypt.hash(b.password, 10), req.params.id]);
    res.json({ ok: true });
  })
);

adminRouter.get(
  '/requests',
  wrap(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const r = status
      ? await pool!.query(`${REQUEST_SELECT} where q.status = $1 order by q.created_at desc`, [status])
      : await pool!.query(`${REQUEST_SELECT} order by q.created_at desc limit 300`);
    res.json({ requests: r.rows.map((row: RequestRow) => toApi(row, false)) });
  })
);

adminRouter.get(
  '/requests/:id',
  wrap(async (req, res) => {
    res.json({ request: toApi(await getRequest(Number(req.params.id)), true) });
  })
);

adminRouter.post(
  '/requests/:id/decision',
  wrap(async (req, res) => {
    const b = z
      .object({ decision: z.enum(['accept', 'reject']), note: z.string().trim().max(2000).default('') })
      .parse(req.body);
    const row = await getRequest(Number(req.params.id));
    if (row.status === 'published') throw new HttpError(409, 'This request is already published.');
    await pool!.query(
      `update question_requests set status = $1, admin_note = $2, updated_at = now() where id = $3`,
      [b.decision === 'accept' ? 'accepted' : 'rejected', b.note, row.id]
    );
    res.json({ ok: true });
  })
);

adminRouter.put(
  '/requests/:id/code',
  wrap(async (req, res) => {
    const { code } = z.object({ code: z.string().min(20).max(400_000) }).parse(req.body);
    await pool!.query('update question_requests set generated_code = $1, updated_at = now() where id = $2', [
      code,
      Number(req.params.id),
    ]);
    res.json({ ok: true });
  })
);

adminRouter.post(
  '/requests/:id/generate',
  wrap(async (req, res) => {
    const { prompt, sample } = z
      .object({ prompt: z.string().trim().max(4000).default(''), sample: z.number().int().min(0).max(9).default(0) })
      .parse(req.body ?? {});
    const row = await getRequest(Number(req.params.id));
    if (row.status !== 'accepted') throw new HttpError(409, 'Accept the request before generating.');
    const started = Date.now();
    const code = await generateVisualizer(row, prompt, sample);
    const entry = { at: new Date().toISOString(), prompt, ms: Date.now() - started, model: GEMINI_CODE_MODEL };
    await pool!.query(
      `update question_requests
          set generated_code = $1,
              generations = generations || $2::jsonb,
              updated_at = now()
        where id = $3`,
      [code, JSON.stringify([entry]), row.id]
    );
    res.json({ code, generation: entry });
  })
);

adminRouter.post(
  '/requests/:id/publish',
  wrap(async (req, res) => {
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
    const row = await getRequest(Number(req.params.id));
    if (row.status !== 'accepted') throw new HttpError(409, 'Only accepted requests can be published.');
    if (!row.generated_code) throw new HttpError(409, 'Generate (and preview) the visualizer first.');
    if (s.slug !== row.slug) throw new HttpError(400, `The code's slug must be "${row.slug}".`);
    if (problemRegistry[row.slug]) throw new HttpError(409, 'This question already has a visualizer on the site.');

    const commit = await publishToGithub(row);
    await upsertDb(row, s as never, commit.catalogId);
    await pool!.query(
      `update question_requests set status = 'published', published_commit = $1, updated_at = now() where id = $2`,
      [commit.sha, row.id]
    );
    res.json({ ok: true, commit: commit.sha, url: commit.url, branch: PUBLISH_BRANCH });
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
${extra ? `\n## Admin's instructions for this version (highest priority)\n${extra}` : ''}`;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CODE_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 32768 },
      }),
      signal: AbortSignal.timeout(240_000),
    }
  );
  if (!r.ok) {
    console.error(`[teacher] Gemini HTTP ${r.status}: ${(await r.text()).slice(0, 400)}`);
    if (r.status === 402)
      throw new HttpError(502, 'Gemini credits are used up. Top up the project at https://ai.studio/projects and try again.');
    if (r.status === 429) throw new HttpError(502, 'Gemini rate limit hit. Wait a minute and try again.');
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

async function gh<T>(method: string, url: string, body?: unknown): Promise<T> {
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
  if (!r.ok) {
    const msg = (await r.text()).slice(0, 300);
    console.error(`[teacher] GitHub ${method} ${url} -> ${r.status}: ${msg}`);
    throw new HttpError(502, `GitHub refused the publish (HTTP ${r.status}).`);
  }
  return (await r.json()) as T;
}

async function ghFile(file: string, ref: string): Promise<string> {
  const f = await gh<{ content: string }>('GET', `/contents/${file}?ref=${ref}`);
  return Buffer.from(f.content, 'base64').toString('utf8');
}

const GEN_INDEX = 'src/problems/generated/index.ts';
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
    throw new HttpError(500, `${GEN_INDEX} is missing its marker comments; merge the teacher-panel branch first.`);
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

export async function publishToGithub(row: RequestRow): Promise<{ sha: string; url: string; catalogId: number }> {
  const ref = await gh<{ object: { sha: string } }>('GET', `/git/ref/heads/${PUBLISH_BRANCH}`);
  const parentSha = ref.object.sha;
  const parent = await gh<{ tree: { sha: string } }>('GET', `/git/commits/${parentSha}`);

  const edits = applyPublishEdits(await ghFile(GEN_INDEX, parentSha), await ghFile(CATALOG, parentSha), row);
  const { index, catalog: cat, catalogId } = edits;

  const tree = await gh<{ sha: string }>('POST', '/git/trees', {
    base_tree: parent.tree.sha,
    tree: [
      { path: `src/problems/generated/${row.slug}.ts`, mode: '100644', type: 'blob', content: row.generated_code },
      { path: GEN_INDEX, mode: '100644', type: 'blob', content: index },
      { path: CATALOG, mode: '100644', type: 'blob', content: cat },
    ],
  });
  const commit = await gh<{ sha: string; html_url: string }>('POST', '/git/commits', {
    message: `Add ${row.title} visualizer (teacher request #${row.id})\n\nGenerated with Gemini from the teacher panel and reviewed in the admin preview.`,
    tree: tree.sha,
    parents: [parentSha],
  });
  await gh('PATCH', `/git/refs/heads/${PUBLISH_BRANCH}`, { sha: commit.sha });
  return { sha: commit.sha, url: commit.html_url, catalogId };
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
