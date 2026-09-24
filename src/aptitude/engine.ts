// Test generation, scoring and analytics. Pure functions over the bank and
// the attempt history — no storage, no React — so the same code runs in the
// browser, on the server (score re-check) and in the validation script.
import { QUESTION_BANK, QUESTION_BY_ID } from './bank';
import { CATEGORIES, CATEGORY_BY_KEY, TEST_COUNT, TEST_SECONDS } from './taxonomy';
import { DIFFICULTIES, type AptQuestion, type Attempt, type CategoryKey, type Difficulty, type TestConfig } from './types';

type Rng = () => number;
const DAY_MS = 86_400_000;

// ───────────────────────── random helpers ─────────────────────────

export function shuffle<T>(xs: T[], rng: Rng = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPick<T>(xs: T[], weight: (x: T) => number, rng: Rng): T {
  const ws = xs.map((x) => Math.max(weight(x), 1e-6));
  let r = rng() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < xs.length; i++) {
    r -= ws[i];
    if (r <= 0) return xs[i];
  }
  return xs[xs.length - 1];
}

/** Largest-remainder apportionment of `n` slots by `weights`. */
function apportion<K extends string>(n: number, weights: Map<K, number>, rng: Rng): Map<K, number> {
  const total = [...weights.values()].reduce((a, b) => a + b, 0) || 1;
  const out = new Map<K, number>();
  const rems: { k: K; r: number }[] = [];
  let used = 0;
  for (const [k, w] of weights) {
    const exact = (n * w) / total;
    out.set(k, Math.floor(exact));
    used += Math.floor(exact);
    rems.push({ k, r: exact - Math.floor(exact) + rng() * 1e-6 });
  }
  rems.sort((a, b) => b.r - a.r);
  for (let i = 0; used < n && rems.length; i = (i + 1) % rems.length, used++) out.set(rems[i].k, out.get(rems[i].k)! + 1);
  return out;
}

/** 8 Easy / 6 Medium / 6 Hard for a 20-question test, scaled for other sizes. */
export function difficultyTargets(count: number, focus: TestConfig['difficultyFocus'] = 'mixed'): Record<Difficulty, number> {
  if (focus && focus !== 'mixed') return { easy: 0, medium: 0, hard: 0, [focus]: count };
  const easy = Math.round(count * 0.4);
  const medium = Math.round(count * 0.3);
  return { easy, medium, hard: count - easy - medium };
}

// ───────────────────────── history index ─────────────────────────

export interface QuestionHistory {
  seen: number;
  correct: number;
  wrong: number;
  skipped: number;
  lastSeen: number;
  lastResult: 'correct' | 'wrong' | 'skipped';
}

const finished = (h: Attempt[]) => h.filter((a) => a.status !== 'active');

/** Per-question history across every finished attempt (abandoned ones included — the questions were seen). */
export function historyIndex(history: Attempt[]): Map<string, QuestionHistory> {
  const idx = new Map<string, QuestionHistory>();
  const ordered = [...finished(history)].sort((a, b) => a.startedAt - b.startedAt);
  for (const a of ordered) {
    a.questionIds.forEach((id, i) => {
      const q = QUESTION_BY_ID.get(id);
      if (!q) return;
      const s = idx.get(id) ?? { seen: 0, correct: 0, wrong: 0, skipped: 0, lastSeen: 0, lastResult: 'skipped' as const };
      const ans = a.answers[i];
      const res = ans === null || ans === undefined ? 'skipped' : ans === q.correctAnswer ? 'correct' : 'wrong';
      s.seen++;
      s[res]++;
      s.lastSeen = a.submittedAt ?? a.startedAt;
      s.lastResult = res;
      idx.set(id, s);
    });
  }
  return idx;
}

interface Tally {
  answered: number;
  correct: number;
}

function topicTallies(idx: Map<string, QuestionHistory>): Map<string, Tally> {
  const t = new Map<string, Tally>();
  for (const [id, s] of idx) {
    const q = QUESTION_BY_ID.get(id)!;
    const cur = t.get(q.topic) ?? { answered: 0, correct: 0 };
    cur.answered += s.correct + s.wrong;
    cur.correct += s.correct;
    t.set(q.topic, cur);
  }
  return t;
}

/**
 * Selection weight for one question. Random mode is uniform except that the
 * previous test's questions are damped, so back-to-back tests differ. Smart
 * mode favours unseen questions, past mistakes, stale questions and topics
 * where the student's accuracy is low.
 */
function makeWeigher(selection: TestConfig['selection'], history: Attempt[], now: number) {
  const done = finished(history).sort((a, b) => b.startedAt - a.startedAt);
  const lastIds = new Set(done[0]?.questionIds ?? []);
  if (selection === 'random') return (q: AptQuestion) => (lastIds.has(q.id) ? 0.3 : 1);

  const idx = historyIndex(history);
  const topics = topicTallies(idx);
  return (q: AptQuestion) => {
    const s = idx.get(q.id);
    let w: number;
    if (!s) w = 4;
    else {
      w = s.lastResult === 'wrong' ? 3.5 : s.lastResult === 'skipped' ? 2.5 : 0.5;
      const days = (now - s.lastSeen) / DAY_MS;
      w *= 0.5 + Math.min(Math.max(days, 0), 14) / 14; // stale questions come back
    }
    const t = topics.get(q.topic);
    if (t && t.answered >= 3) w *= 1 + 2 * (1 - t.correct / t.answered); // weak topics weigh up to 3×
    if (lastIds.has(q.id)) w *= 0.5;
    return w;
  };
}

// ───────────────────────── generation ─────────────────────────

export function availableFor(topics: string[]): AptQuestion[] {
  const set = new Set(topics);
  return QUESTION_BANK.filter((q) => set.has(q.topic));
}

/**
 * Builds a fresh attempt: `count` distinct questions from the selected topics,
 * split across categories by weight (evenly by default), spread across topics,
 * hitting the difficulty targets — falling back Hard → Medium → Easy (and back
 * up) when a difficulty runs short — then shuffled, with options shuffled
 * unless their order carries meaning.
 */
export function generateTest(config: TestConfig, history: Attempt[] = [], rng: Rng = Math.random, now = Date.now()): Attempt {
  const pool = availableFor(config.topics);
  const count = Math.min(config.count, pool.length);
  const weightOf = makeWeigher(config.selection, history, now);

  const cats = [...new Set(pool.map((q) => q.category))];
  const catWeights = new Map<CategoryKey, number>(
    cats.map((c) => [c, config.categoryWeights ? config.categoryWeights[c] ?? 0 : 1])
  );
  if ([...catWeights.values()].every((w) => w <= 0)) cats.forEach((c) => catWeights.set(c, 1));
  const quota = apportion(count, catWeights, rng);

  // A category cannot supply more than it has; hand its overflow to others.
  const have = new Map(cats.map((c) => [c, pool.filter((q) => q.category === c).length]));
  let overflow = 0;
  for (const c of cats) {
    const extra = quota.get(c)! - have.get(c)!;
    if (extra > 0) {
      quota.set(c, have.get(c)!);
      overflow += extra;
    }
  }
  while (overflow > 0) {
    const spare = cats.filter((c) => quota.get(c)! < have.get(c)!);
    if (!spare.length) break;
    const c = spare.sort((a, b) => (catWeights.get(b) ?? 0) - (catWeights.get(a) ?? 0))[0];
    quota.set(c, quota.get(c)! + 1);
    overflow--;
  }

  const remaining = [...pool];
  const picked: AptQuestion[] = [];
  const topicCount = new Map<string, number>();

  const take = (d: Difficulty): boolean => {
    const cands = remaining.filter((q) => q.difficulty === d);
    if (!cands.length) return false;
    const candCats = [...new Set(cands.map((q) => q.category))];
    const withQuota = candCats.filter((c) => (quota.get(c) ?? 0) > 0);
    let cat: CategoryKey;
    if (withQuota.length) {
      const most = Math.max(...withQuota.map((c) => quota.get(c)!));
      cat = shuffle(withQuota.filter((c) => quota.get(c) === most), rng)[0];
    } else {
      cat = weightedPick(candCats, (c) => catWeights.get(c) || 0.1, rng);
    }
    const q = weightedPick(
      cands.filter((x) => x.category === cat),
      (x) => weightOf(x) / (1 + (topicCount.get(x.topic) ?? 0)) ** 2, // spread across topics
      rng
    );
    remaining.splice(remaining.indexOf(q), 1);
    picked.push(q);
    topicCount.set(q.topic, (topicCount.get(q.topic) ?? 0) + 1);
    quota.set(cat, (quota.get(cat) ?? 0) - 1);
    return true;
  };

  const need = difficultyTargets(count, config.difficultyFocus);
  for (let i = 0; i < need.hard; i++) if (!take('hard')) need.medium++;
  for (let i = 0; i < need.medium; i++) if (!take('medium')) need.easy++;
  let short = 0;
  for (let i = 0; i < need.easy; i++) if (!take('easy')) short++;
  for (; short > 0; short--) if (!take('medium') && !take('hard')) break;

  const questions = shuffle(picked, rng);
  return {
    id: `apt_${now.toString(36)}_${Math.floor(rng() * 36 ** 6).toString(36)}`,
    // Topic practice is paced at a minute per question, so a short pool gets a shorter clock.
    config: { ...config, count: questions.length, durationSec: config.mode === 'topic' ? questions.length * 60 : config.durationSec },
    questionIds: questions.map((q) => q.id),
    optionOrder: questions.map((q) => (q.fixedOptions ? [0, 1, 2, 3] : shuffle([0, 1, 2, 3], rng))),
    answers: questions.map(() => null),
    marked: questions.map(() => false),
    visited: questions.map((_, i) => i === 0),
    current: 0,
    startedAt: now,
    status: 'active',
    warned: [],
  };
}

/** Topic practice: one topic, `count` questions, a minute per question. */
export function topicConfig(topic: string, count: number, focus: TestConfig['difficultyFocus'], selection: TestConfig['selection']): TestConfig {
  const label = focus && focus !== 'mixed' ? ` — ${focus[0].toUpperCase()}${focus.slice(1)}` : '';
  return { mode: 'topic', title: `${topic}${label} Practice`, topics: [topic], count, durationSec: count * 60, selection, difficultyFocus: focus };
}

export function fullConfig(topics: string[], selection: TestConfig['selection']): TestConfig {
  return { mode: 'full', title: 'Full Aptitude Test', topics, count: TEST_COUNT, durationSec: TEST_SECONDS, selection };
}

export const deadlineOf = (a: Attempt) => a.startedAt + a.config.durationSec * 1000;

// ───────────────────────── scoring ─────────────────────────

export interface Breakdown {
  key: string;
  label: string;
  total: number;
  attempted: number;
  correct: number;
}

export interface ItemResult {
  q: AptQuestion;
  index: number;
  order: number[];
  chosen: number | null;
  correct: boolean;
  marked: boolean;
}

export interface AttemptResult {
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  scorePct: number;
  /** Correct as a share of attempted questions. */
  accuracyPct: number;
  timeTakenSec: number;
  byDifficulty: Breakdown[];
  byCategory: Breakdown[];
  byTopic: Breakdown[];
  items: ItemResult[];
}

function tally(items: ItemResult[], keyOf: (q: AptQuestion) => string, labelOf: (k: string) => string, order?: string[]): Breakdown[] {
  const m = new Map<string, Breakdown>();
  for (const it of items) {
    const k = keyOf(it.q);
    const b = m.get(k) ?? { key: k, label: labelOf(k), total: 0, attempted: 0, correct: 0 };
    b.total++;
    if (it.chosen !== null) b.attempted++;
    if (it.correct) b.correct++;
    m.set(k, b);
  }
  const out = [...m.values()];
  return order ? out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)) : out.sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function scoreAttempt(a: Attempt): AttemptResult {
  const items: ItemResult[] = [];
  a.questionIds.forEach((id, index) => {
    const q = QUESTION_BY_ID.get(id);
    if (!q) return; // question retired from the bank — skip rather than crash
    const chosen = a.answers[index] ?? null;
    items.push({ q, index, order: a.optionOrder[index] ?? [0, 1, 2, 3], chosen, correct: chosen === q.correctAnswer, marked: !!a.marked[index] });
  });
  const correct = items.filter((i) => i.correct).length;
  const attempted = items.filter((i) => i.chosen !== null).length;
  const end = Math.min(a.submittedAt ?? Date.now(), deadlineOf(a));
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return {
    total: items.length,
    correct,
    incorrect: attempted - correct,
    unattempted: items.length - attempted,
    scorePct: items.length ? (correct / items.length) * 100 : 0,
    accuracyPct: attempted ? (correct / attempted) * 100 : 0,
    timeTakenSec: Math.max(0, Math.round((end - a.startedAt) / 1000)),
    byDifficulty: tally(items, (q) => q.difficulty, cap, DIFFICULTIES),
    byCategory: tally(items, (q) => q.category, (k) => CATEGORY_BY_KEY[k as CategoryKey].name, CATEGORIES.map((c) => c.key)),
    byTopic: tally(items, (q) => q.topic, (k) => k),
    items,
  };
}

// ───────────────────────── dashboard & coverage ─────────────────────────

const isComplete = (a: Attempt) => a.status === 'submitted' || a.status === 'timeout';
const dayKey = (t: number) => {
  const d = new Date(t);
  return Math.floor((t - d.getTimezoneOffset() * 60_000) / DAY_MS); // local calendar day
};

export interface TopicStat {
  topic: string;
  category: CategoryKey;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface DashboardStats {
  totalQuestions: number;
  attemptedUnique: number;
  correctUnique: number;
  answered: number;
  answeredCorrect: number;
  accuracyPct: number;
  testsCompleted: number;
  avgScorePct: number;
  avgTimeSec: number;
  streak: number;
  coveragePct: number;
  strongest: TopicStat[];
  weakest: TopicStat[];
}

export function dashboardStats(history: Attempt[], now = Date.now()): DashboardStats {
  const idx = historyIndex(history);
  const completed = history.filter(isComplete);
  const results = completed.map(scoreAttempt);
  let answered = 0;
  let answeredCorrect = 0;
  let attemptedUnique = 0;
  let correctUnique = 0;
  for (const s of idx.values()) {
    answered += s.correct + s.wrong;
    answeredCorrect += s.correct;
    if (s.correct + s.wrong > 0) attemptedUnique++;
    if (s.correct > 0) correctUnique++;
  }

  const days = new Set(completed.map((a) => dayKey(a.submittedAt ?? a.startedAt)));
  let cursor = days.has(dayKey(now)) ? dayKey(now) : dayKey(now) - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }

  const topics: TopicStat[] = [...topicTallies(idx)]
    .filter(([, t]) => t.answered >= 3)
    .map(([topic, t]) => ({ topic, category: QUESTION_BANK.find((q) => q.topic === topic)!.category, ...t, accuracy: (t.correct / t.answered) * 100 }));
  const byAcc = [...topics].sort((a, b) => b.accuracy - a.accuracy || b.answered - a.answered);

  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return {
    totalQuestions: QUESTION_BANK.length,
    attemptedUnique,
    correctUnique,
    answered,
    answeredCorrect,
    accuracyPct: answered ? (answeredCorrect / answered) * 100 : 0,
    testsCompleted: completed.length,
    avgScorePct: mean(results.map((r) => r.scorePct)),
    avgTimeSec: mean(results.map((r) => r.timeTakenSec)),
    streak,
    coveragePct: (idx.size / QUESTION_BANK.length) * 100,
    strongest: byAcc.filter((t) => t.accuracy >= 60).slice(0, 3),
    weakest: byAcc.filter((t) => t.accuracy < 75).reverse().slice(0, 3),
  };
}

export interface CoverageRow {
  name: string;
  total: number;
  seen: number;
  correct: number; // questions answered correctly at least once
  wrong: number; // questions whose latest answer was wrong
  answered: number; // answers given (with repeats)
  answeredCorrect: number;
}

export interface TopicCoverage extends CoverageRow {
  subtopics: CoverageRow[];
}

export interface CategoryCoverage extends CoverageRow {
  key: CategoryKey;
  icon: string;
  topics: TopicCoverage[];
}

export function coverage(history: Attempt[]): CategoryCoverage[] {
  const idx = historyIndex(history);
  const row = (name: string, qs: AptQuestion[]): CoverageRow => {
    const r: CoverageRow = { name, total: qs.length, seen: 0, correct: 0, wrong: 0, answered: 0, answeredCorrect: 0 };
    for (const q of qs) {
      const s = idx.get(q.id);
      if (!s) continue;
      r.seen++;
      if (s.correct > 0) r.correct++;
      if (s.lastResult === 'wrong') r.wrong++;
      r.answered += s.correct + s.wrong;
      r.answeredCorrect += s.correct;
    }
    return r;
  };
  return CATEGORIES.map((c) => {
    const catQs = QUESTION_BANK.filter((q) => q.category === c.key);
    return {
      ...row(c.name, catQs),
      key: c.key,
      icon: c.icon,
      topics: c.topics.map((t) => {
        const tq = catQs.filter((q) => q.topic === t);
        const subs = [...new Set(tq.map((q) => q.subtopic))];
        return { ...row(t, tq), subtopics: subs.map((s) => row(s, tq.filter((q) => q.subtopic === s))) };
      }),
    };
  });
}

/** Questions whose most recent answer was wrong, most-missed first. */
export function missedQuestions(history: Attempt[], limit = 8): { q: AptQuestion; h: QuestionHistory }[] {
  return [...historyIndex(history)]
    .filter(([, h]) => h.lastResult === 'wrong')
    .map(([id, h]) => ({ q: QUESTION_BY_ID.get(id)!, h }))
    .sort((a, b) => b.h.wrong - a.h.wrong || b.h.lastSeen - a.h.lastSeen)
    .slice(0, limit);
}

// ───────────────────────── recommendations ─────────────────────────

export interface Recommendation {
  reason: string;
  label: string;
  detail: string;
  config: TestConfig;
}

export function recommendations(attempt: Attempt, history: Attempt[]): Recommendation[] {
  const res = scoreAttempt(attempt);
  const recs: Recommendation[] = [];
  const weak = res.byTopic
    .map((b) => ({ ...b, pct: (b.correct / b.total) * 100 }))
    .filter((b) => b.pct < 60)
    .sort((a, b) => a.pct - b.pct || b.total - a.total)
    .slice(0, 2);

  for (const w of weak) {
    const misses = res.items.filter((i) => i.q.topic === w.key && !i.correct);
    const focus = DIFFICULTIES.find((d) => misses.some((m) => m.q.difficulty === d)) ?? 'medium';
    const avail = availableFor([w.key]);
    const inFocus = avail.filter((q) => q.difficulty === focus).length;
    const count = Math.min(10, avail.length);
    // A focused set needs enough questions of that difficulty; otherwise stay mixed.
    const useFocus = inFocus >= Math.min(count, 3) ? focus : 'mixed';
    recs.push({
      reason: `You scored ${Math.round(w.pct)}% in ${w.key} (${w.correct}/${w.total}).`,
      label: `${w.key}${useFocus !== 'mixed' ? ` — ${focus[0].toUpperCase()}${focus.slice(1)}` : ''} Practice`,
      detail: `${count} questions · ${count} min · smart selection`,
      config: topicConfig(w.key, count, useFocus, 'smart'),
    });
  }

  // Point at the least-covered topic in the same area, so practice keeps widening.
  const cov = coverage([...history, attempt]).flatMap((c) => c.topics.filter((t) => t.total > 0 && attempt.config.topics.includes(t.name)));
  const fresh = cov.filter((t) => !weak.some((w) => w.key === t.name)).sort((a, b) => a.seen / a.total - b.seen / b.total)[0];
  if (fresh && fresh.seen < fresh.total) {
    const count = Math.min(10, fresh.total);
    recs.push({
      reason: `You've seen only ${fresh.seen} of ${fresh.total} ${fresh.name} questions.`,
      label: `${fresh.name} Practice`,
      detail: `${count} questions · ${count} min · unseen questions first`,
      config: topicConfig(fresh.name, count, 'mixed', 'smart'),
    });
  }

  recs.push({
    reason: 'Retest the same topics, weighted towards your mistakes and unseen questions.',
    label: 'Smart Practice — same topics',
    detail: `${TEST_COUNT} questions · 20 min`,
    config: { ...attempt.config, selection: 'smart', count: TEST_COUNT, durationSec: attempt.config.mode === 'topic' ? TEST_COUNT * 60 : attempt.config.durationSec, title: `${attempt.config.title.replace(/ \(Smart\)$/, '')} (Smart)` },
  });
  return recs;
}
