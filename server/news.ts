// Daily "Top 5 in AI" news. Public reads, plus one cron-only route:
//
//   GET /api/news/cron   (Vercel Cron, daily — see vercel.json)
//     fetch free RSS feeds → keep the last ~36h → drop duplicate stories →
//     Gemini picks the 5 that matter most and writes short summaries →
//     store them under today's IST date. Runs once per day; a second call
//     for a day that is already filled is a no-op unless ?force=1.
//   GET /api/news?day=YYYY-MM-DD
//     that day's 5 (default: the latest filled day) + the recent days that
//     have news, for the archive chips.
//
// We only ever store our own short summary and a link out — never article
// text. Without GEMINI_API_KEY (or if Gemini fails) the job still posts: the
// 5 newest stories from different sources, with the feed's own snippet.
// Backed by the ai_news table when DATABASE_URL is set, otherwise an
// in-memory map (dev fallback, resets on restart).
import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { pool } from './db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Overridable so a newer Flash model can be swapped in without a code change.
// Google retires Flash versions for new keys (2.5 already 404s), so expect to bump this.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
const CRON_SECRET = process.env.CRON_SECRET;

const TOP_N = 5;
const MAX_AGE_MS = 36 * 3600_000;
const MAX_CANDIDATES = 60;
const FEED_TIMEOUT_MS = 8_000;

/** Direct publishers first: on a duplicate story the earlier feed's copy wins. */
const FEEDS = [
  { source: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { source: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { source: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' },
  { source: 'Ars Technica', url: 'https://arstechnica.com/ai/feed/' },
  { source: 'Wired', url: 'https://www.wired.com/feed/tag/ai/latest/rss' },
  // Aggregator — each item names its real publisher in <source>. Its long tail
  // of small outlets only fills in around the curated AI desks above.
  {
    source: 'Google News',
    aggregator: true,
    url: 'https://news.google.com/rss/search?q=artificial+intelligence+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
  },
];

export interface NewsItem {
  rank: number;
  headline: string;
  summary: string;
  why: string;
  url: string;
  source: string;
  publishedAt: string;
}

/** Today's date in India (the audience), as YYYY-MM-DD. */
const istDay = (t = Date.now()) => new Date(t + 5.5 * 3600_000).toISOString().slice(0, 10);

// ---------- feed parsing (RSS 2.0 + Atom, no dependency) ----------

interface Candidate {
  title: string;
  url: string;
  source: string;
  snippet: string;
  published: number;
  /** From the aggregator feed rather than a curated AI desk. */
  aggregated: boolean;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    });
}
/** Feed text is often HTML inside CDATA (and sometimes entity-escaped HTML) — flatten to plain text. */
const plain = (s: string) =>
  decode(decode(s).replace(/<[^>]*>/g, ' '))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (xml: string, name: string) =>
  xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'))?.[1];

function parseFeed(xml: string, feedSource: string, aggregated: boolean): Candidate[] {
  const out: Candidate[] = [];
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  for (const b of blocks) {
    let title = plain(tag(b, 'title') ?? '');
    // RSS: <link>url</link>. Atom: <link rel="alternate" href="url"/>.
    const url = plain(
      tag(b, 'link') ??
        b.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i)?.[1] ??
        b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ??
        ''
    );
    const date = tag(b, 'pubDate') ?? tag(b, 'published') ?? tag(b, 'updated') ?? tag(b, 'dc:date');
    const published = date ? Date.parse(plain(date)) : NaN;
    let source = feedSource;
    const named = tag(b, 'source');
    if (named) {
      source = plain(named);
      // Google News titles end in " - Publisher"; the publisher is shown separately.
      if (title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    }
    let snippet = plain(tag(b, 'description') ?? tag(b, 'summary') ?? '');
    if (snippet.length > 300) snippet = `${snippet.slice(0, 300).replace(/\s+\S*$/, '')}…`;
    // Google News "descriptions" are just the title and publisher again.
    if (snippet.startsWith(title)) snippet = '';
    if (!title || !/^https?:\/\//.test(url) || !Number.isFinite(published)) continue;
    out.push({ title, url, source, snippet, published, aggregated });
  }
  return out;
}

async function fetchFeed(f: { source: string; url: string; aggregator?: boolean }): Promise<Candidate[]> {
  try {
    const r = await fetch(f.url, {
      headers: { 'User-Agent': 'VizuCodeNews/1.0 (+daily AI digest)', Accept: 'application/rss+xml, application/xml' },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return parseFeed(await r.text(), f.source, !!f.aggregator);
  } catch (e) {
    // One dead feed must not sink the whole day's digest.
    console.error(`[news] feed ${f.source} failed:`, e instanceof Error ? e.message : e);
    return [];
  }
}

const words = (t: string) => new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
function sameStory(a: Set<string>, b: Set<string>): boolean {
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / Math.min(a.size, b.size) >= 0.6;
}

/**
 * Fresh, de-duplicated candidates, newest first. Every curated-desk story makes
 * the cut; aggregator stories only fill the remaining slots, so Google News's
 * ~100 items a day can't crowd them out.
 */
async function gather(now: number): Promise<Candidate[]> {
  const perFeed = await Promise.all(FEEDS.map(fetchFeed));
  const kept: { c: Candidate; w: Set<string> }[] = [];
  const urls = new Set<string>();
  for (const c of perFeed.flat()) {
    if (now - c.published > MAX_AGE_MS || c.published > now + 3600_000) continue;
    if (urls.has(c.url)) continue;
    const w = words(c.title);
    if (w.size === 0 || kept.some((k) => sameStory(k.w, w))) continue;
    urls.add(c.url);
    kept.push({ c, w });
  }
  const byDate = (a: Candidate, b: Candidate) => b.published - a.published;
  const curated = kept.filter((k) => !k.c.aggregated).map((k) => k.c).sort(byDate);
  const extra = kept.filter((k) => k.c.aggregated).map((k) => k.c).sort(byDate);
  return [...curated, ...extra].slice(0, MAX_CANDIDATES).sort(byDate);
}

// ---------- picking the top 5 ----------

const pickSchema = z
  .array(
    z.object({
      id: z.number().int(),
      headline: z.string().min(5).max(160),
      summary: z.string().min(20).max(600),
      why: z.string().min(5).max(300),
    })
  )
  .length(TOP_N);

async function pickWithGemini(cands: Candidate[]): Promise<Omit<NewsItem, 'rank'>[]> {
  const list = cands
    .map((c, i) => `[${i}] ${c.title} — ${c.source}, ${new Date(c.published).toISOString()}\n${c.snippet}`)
    .join('\n\n');
  const prompt = `You are the editor of a daily "Top 5 in AI" digest for Indian college students and fresh software engineers.

From the candidate stories below, pick the ${TOP_N} most important AI stories of the last day. Prefer: major model or product launches, big moves by AI companies, significant research results, developer tools, jobs/careers impact, and regulation or policy (including India). Skip: opinion pieces, listicles, deals/discounts, stock-price chatter, and minor updates. Never pick two items about the same story. Order them by importance, most important first.

For each pick return:
- id: the candidate's number in brackets
- headline: a clear, neutral headline, at most 12 words, no clickbait
- summary: 2–3 plain-English sentences on what happened, understandable by a student; only use facts present in the candidate text
- why: one sentence on why it matters to someone learning or working in tech

CANDIDATES
${list}`;

  const r = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'INTEGER' },
              headline: { type: 'STRING' },
              summary: { type: 'STRING' },
              why: { type: 'STRING' },
            },
            required: ['id', 'headline', 'summary', 'why'],
          },
        },
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  const picks = pickSchema.parse(JSON.parse(text));
  const ids = new Set(picks.map((p) => p.id));
  if (ids.size !== TOP_N || picks.some((p) => !cands[p.id])) throw new Error('Gemini returned invalid ids');
  return picks.map((p) => {
    const c = cands[p.id];
    return {
      headline: p.headline,
      summary: p.summary,
      why: p.why,
      url: c.url,
      source: c.source,
      publishedAt: new Date(c.published).toISOString(),
    };
  });
}

/** No-AI fallback: the newest story from each of 5 different sources, curated desks first. */
function pickNewest(cands: Candidate[]): Omit<NewsItem, 'rank'>[] {
  const seen = new Set<string>();
  const out: Omit<NewsItem, 'rank'>[] = [];
  for (const c of [...cands.filter((c) => !c.aggregated), ...cands.filter((c) => c.aggregated)]) {
    if (seen.has(c.source)) continue;
    seen.add(c.source);
    out.push({
      headline: c.title,
      summary: c.snippet || 'Read the full story at the source.',
      why: '',
      url: c.url,
      source: c.source,
      publishedAt: new Date(c.published).toISOString(),
    });
    if (out.length === TOP_N) break;
  }
  return out;
}

// ---------- storage ----------

const memNews = new Map<string, NewsItem[]>();

async function hasDay(day: string): Promise<boolean> {
  if (!pool) return memNews.has(day);
  const r = await pool.query('select 1 from ai_news where day = $1 limit 1', [day]);
  return r.rowCount! > 0;
}

async function saveDay(day: string, items: NewsItem[]): Promise<void> {
  if (!pool) {
    memNews.set(day, items);
    return;
  }
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from ai_news where day = $1', [day]);
    for (const it of items) {
      await client.query(
        `insert into ai_news (day, rank, headline, summary, why, url, source, published_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [day, it.rank, it.headline, it.summary, it.why, it.url, it.source, it.publishedAt]
      );
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

/** Recent days that have news (newest first). */
async function listDays(limit = 14): Promise<string[]> {
  if (!pool) return [...memNews.keys()].sort().reverse().slice(0, limit);
  const r = await pool.query(
    `select distinct to_char(day, 'YYYY-MM-DD') as day from ai_news order by day desc limit $1`,
    [limit]
  );
  return r.rows.map((row: { day: string }) => row.day);
}

async function loadDay(day: string): Promise<NewsItem[]> {
  if (!pool) return memNews.get(day) ?? [];
  const r = await pool.query(
    `select rank, headline, summary, why, url, source, published_at
     from ai_news where day = $1 order by rank`,
    [day]
  );
  return r.rows.map(
    (row: {
      rank: number;
      headline: string;
      summary: string;
      why: string;
      url: string;
      source: string;
      published_at: Date;
    }) => ({
      rank: row.rank,
      headline: row.headline,
      summary: row.summary,
      why: row.why,
      url: row.url,
      source: row.source,
      publishedAt: row.published_at.toISOString(),
    })
  );
}

// ---------- routes ----------

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export const newsRouter = Router();

/** GET /api/news/cron — Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
newsRouter.get(
  '/cron',
  wrap(async (req, res) => {
    // Locally (not on Vercel) with no secret configured, allow it so the job can be tried by hand.
    const open = !CRON_SECRET && !process.env.VERCEL;
    if (!open && (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`)) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    const day = istDay();
    if (req.query.force !== '1' && (await hasDay(day))) {
      res.json({ ok: true, day, skipped: 'already posted' });
      return;
    }
    const cands = await gather(Date.now());
    if (cands.length < TOP_N) {
      res.status(502).json({ error: `Only ${cands.length} fresh stories found — not posting.` });
      return;
    }
    let picks: Omit<NewsItem, 'rank'>[];
    let via = 'gemini';
    if (GEMINI_API_KEY) {
      try {
        picks = await pickWithGemini(cands);
      } catch (e) {
        console.error('[news] Gemini pick failed, using newest:', e instanceof Error ? e.message : e);
        picks = pickNewest(cands);
        via = 'fallback';
      }
    } else {
      picks = pickNewest(cands);
      via = 'fallback (no GEMINI_API_KEY)';
    }
    const items = picks.map((p, i) => ({ ...p, rank: i + 1 }));
    await saveDay(day, items);
    res.json({ ok: true, day, via, candidates: cands.length, items: items.map((i) => i.headline) });
  })
);

/** GET /api/news?day=YYYY-MM-DD — public. */
newsRouter.get(
  '/',
  wrap(async (req, res) => {
    const days = await listDays();
    const asked = typeof req.query.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.day) ? req.query.day : null;
    const day = asked ?? days[0] ?? null;
    const items = day ? await loadDay(day) : [];
    // Changes at most once a day — let Vercel's edge serve repeat visits.
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900');
    res.json({ day, items, days });
  })
);
