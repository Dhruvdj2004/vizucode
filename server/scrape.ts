// Fills the teacher panel's question form from a link: LeetCode (its public
// GraphQL API), GeeksforGeeks (the __NEXT_DATA__ JSON its page is built from),
// CodeChef (its problem JSON API), or any other page (best effort). Plain
// `fetch` + cheerio, so it runs inside the Node API locally and on Vercel.
// Pages that only render with JavaScript (e.g. HackerRank) can't be read.
import { CATEGORY_RULES_FALLBACK, guessCategory } from './categories';

export interface ScrapedQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  slug?: string;
}

export class ScrapeError extends Error {}

export const BAD_LINK = "We couldn't open that link. Check the URL.";
const NOT_A_QUESTION =
  "This doesn't look like a coding question (no examples found on the page). Check the link, or fill the form in by hand.";
const BLOCKED = 'That site blocked the request. Fill the form in by hand.';

const UA = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
};

async function get(url: string, init: RequestInit = {}): Promise<Response> {
  let r: Response;
  try {
    r = await fetch(url, { ...init, headers: { ...UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(20_000) });
  } catch {
    throw new ScrapeError(BAD_LINK);
  }
  if ([401, 403, 429].includes(r.status)) throw new ScrapeError(BLOCKED);
  if (!r.ok) throw new ScrapeError(BAD_LINK);
  return r;
}

function normDifficulty(d: unknown): ScrapedQuestion['difficulty'] {
  const s = String(d ?? '').trim().toLowerCase();
  if (s.startsWith('e') || s === 'basic' || s === 'school') return 'Easy';
  if (s.startsWith('h')) return 'Hard';
  return 'Medium';
}

function clean(text: string): string {
  return (text ?? '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function htmlToText(html: string): Promise<string> {
  const { load } = await import('cheerio');
  const $ = load(html ?? '');
  $('sup').each((_, el) => {
    $(el).replaceWith('^' + $(el).text()); // 10<sup>4</sup> -> 10^4
  });
  $('br').replaceWith('\n');
  $('p, pre, li, div').each((_, el) => {
    $(el).after('\n');
  });
  return clean($.root().text());
}

/** Plain-text statement -> description / examples / constraints. */
function splitSections(text: string): Pick<ScrapedQuestion, 'description' | 'examples' | 'constraints'> {
  const m = /\n\s*Constraints?\s*:?\s*\n/i.exec(text);
  const constraints = m ? clean(text.slice(m.index + m[0].length)) : '';
  const body = m ? text.slice(0, m.index) : text;
  let parts = ('\n' + body).split(/\n\s*Example\s*\d+\s*:?\s*\n/i);
  if (parts.length === 1) {
    // GFG style: one "Examples:" heading, then repeated Input/Output blocks.
    const head = ('\n' + body).split(/\n\s*Examples?\s*:?\s*\n/i);
    if (head.length >= 2) parts = [head[0], ...head.slice(1).join('\n').split(/(?=\bInput\s*:)/i)];
  }
  const examples: ScrapedQuestion['examples'] = [];
  for (const part of parts.slice(1)) {
    const grab = (label: string) => {
      const mm = new RegExp(`${label}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:Input|Output|Explanation)\\s*:|$)`, 'i').exec(part);
      return mm ? clean(mm[1]) : '';
    };
    const ex = { input: grab('Input'), output: grab('Output'), explanation: grab('Explanation') };
    if (ex.input || ex.output) examples.push(ex);
  }
  return { description: clean(parts[0]), examples, constraints };
}

async function leetcode(url: string): Promise<ScrapedQuestion> {
  const slug = /\/problems\/([^/?#]+)/.exec(url)?.[1];
  if (!slug) throw new ScrapeError("Couldn't find the problem name in this LeetCode link.");
  const query = `query q($s: String!) { question(titleSlug: $s) {
    questionFrontendId title difficulty content isPaidOnly topicTags { name } } }`;
  const r = await get('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: url },
    body: JSON.stringify({ query, variables: { s: slug } }),
  });
  const d = ((await r.json()) as { data?: { question?: Record<string, unknown> | null } }).data?.question;
  if (!d) throw new ScrapeError("LeetCode didn't return this problem.");
  if (d.isPaidOnly && !d.content) throw new ScrapeError("This is a LeetCode Premium problem; its statement isn't public.");
  const tags = ((d.topicTags as { name: string }[]) ?? []).map((t) => t.name);
  return {
    title: String(d.title),
    difficulty: normDifficulty(d.difficulty),
    category: guessCategory(tags),
    ...splitSections(await htmlToText(String(d.content ?? ''))),
    tags,
    source: 'LeetCode',
    sourceUrl: `https://leetcode.com/problems/${slug}/`,
    slug,
  };
}

/** Depth-first search of nested JSON for the first truthy value under any of `keys`. */
function findKey(obj: unknown, keys: string[]): unknown {
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const f = findKey(v, keys);
      if (f) return f;
    }
  } else if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>;
    for (const k of keys) if (o[k]) return o[k];
    for (const v of Object.values(o)) {
      const f = findKey(v, keys);
      if (f) return f;
    }
  }
  return null;
}

async function gfg(url: string): Promise<ScrapedQuestion> {
  const html = await (await get(url)).text();
  const { load } = await import('cheerio');
  const $ = load(html);
  let title: unknown = null;
  let statement: unknown = null;
  let difficulty: unknown = null;
  let tags: string[] = [];
  const nd = $('script#__NEXT_DATA__').text();
  if (nd) {
    // The problem lives under initialState.problemData; the rest of the page data is site chrome.
    let data: unknown = JSON.parse(nd);
    data = findKey(data, ['probData']) ?? findKey(data, ['problemData']) ?? data;
    title = findKey(data, ['problem_name']);
    statement = findKey(data, ['problem_question', 'question']);
    difficulty = findKey(data, ['difficulty']);
    const t = findKey(data, ['tags']);
    if (Array.isArray(t)) tags = t.map((x) => (typeof x === 'string' ? x : String((x as { name?: string }).name ?? '')));
    else if (t && typeof t === 'object')
      tags = Object.values(t as Record<string, unknown>).flatMap((v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []));
  }
  if (!statement) statement = $('[class*=problems_problem_content], [class*=problem-statement], article').first().html() ?? '';
  if (!title) title = $('h1').first().text() || $('title').text() || 'Untitled';
  const text = String(statement).includes('<') ? await htmlToText(String(statement)) : clean(String(statement));
  return {
    title: String(title).replace(/\s*\|\s*Practice.*$/, '').trim(),
    difficulty: normDifficulty(difficulty),
    category: guessCategory(tags),
    ...splitSections(text),
    tags,
    source: 'GeeksforGeeks',
    sourceUrl: url,
  };
}

async function codechef(url: string): Promise<ScrapedQuestion> {
  const code = /\/problems\/([A-Za-z0-9_]+)/.exec(url)?.[1];
  if (!code) throw new ScrapeError("Couldn't find the problem code in this CodeChef link.");
  const d = (await (await get(`https://www.codechef.com/api/contests/PRACTICE/problems/${code}`)).json()) as Record<string, unknown>;
  if (d.status && d.status !== 'success') throw new ScrapeError(String(d.message ?? "CodeChef didn't return this problem."));
  const comps = (d.problemComponents ?? {}) as Record<string, unknown>;
  const statement = String(comps.statement ?? d.body ?? '');
  const text = statement.includes('<') ? await htmlToText(statement) : clean(statement);
  const split = splitSections(text);
  const samples = ((comps.sampleTestCases as Record<string, string>[]) ?? []).map((tc) => ({
    input: clean(tc.input ?? ''),
    output: clean(tc.output ?? ''),
    explanation: clean(tc.explanation ?? ''),
  }));
  let constraints = split.constraints;
  if (comps.constraints) {
    const c = String(comps.constraints);
    constraints = c.includes('<') ? await htmlToText(c) : clean(c);
  }
  const tags = ((d.user_tags ?? d.tags ?? []) as unknown[]).map((t) =>
    t && typeof t === 'object' ? String((t as { tag?: string }).tag ?? '') : String(t)
  );
  const rating = Number(d.difficulty_rating) || 0;
  return {
    title: String(d.problem_name ?? code),
    difficulty: rating && rating < 1400 ? 'Easy' : rating >= 2000 ? 'Hard' : 'Medium',
    category: guessCategory(tags),
    description: split.description,
    examples: samples.length ? samples : split.examples,
    constraints,
    tags,
    source: 'CodeChef',
    sourceUrl: `https://www.codechef.com/problems/${code}`,
  };
}

async function generic(url: string): Promise<ScrapedQuestion> {
  const html = await (await get(url)).text();
  const { load } = await import('cheerio');
  const $ = load(html);
  $('script, style, nav, header, footer').remove();
  const title = $('h1').first().text().trim() || $('title').text().trim() || 'Untitled';
  const main = $('main').first().html() ?? $('article').first().html() ?? $('body').html() ?? '';
  return {
    title,
    difficulty: 'Medium',
    category: CATEGORY_RULES_FALLBACK,
    ...splitSections((await htmlToText(main)).slice(0, 8000)),
    tags: [],
    source: new URL(url).host,
    sourceUrl: url,
  };
}

export async function scrapeQuestion(url: string): Promise<ScrapedQuestion> {
  let host: string;
  try {
    host = new URL(url).host.toLowerCase();
  } catch {
    throw new ScrapeError(BAD_LINK);
  }
  let data: ScrapedQuestion;
  try {
    if (host.includes('leetcode.')) data = await leetcode(url);
    else if (host.includes('geeksforgeeks.')) data = await gfg(url);
    else if (host.includes('codechef.')) data = await codechef(url);
    else data = await generic(url);
  } catch (e) {
    if (e instanceof ScrapeError) throw e;
    console.error('[scrape] failed:', url, e instanceof Error ? e.message : e);
    throw new ScrapeError("We couldn't read that page. Fill the form in by hand.");
  }
  // A real problem page always shows at least one sample input/output.
  if (!data.examples.length) throw new ScrapeError(NOT_A_QUESTION);
  return data;
}
