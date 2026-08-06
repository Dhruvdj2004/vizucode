// A theory module (DBMS, OS, …) is just a list of topics plus the labels the
// index/topic pages need. Both pages are generic over this descriptor, so a new
// module is a folder of topic files and one call to `createModule`.

import type { AuthUser } from '../lib/auth';
import type { Topic } from './types';

export interface ContentModule {
  /** URL segment and route base, e.g. 'os' → /os and /os/:slug. */
  key: string;
  /** Label in the header nav. */
  nav: string;
  /** Small caps line above the page title. */
  eyebrow: string;
  /** Index page title, e.g. 'Operating Systems for Interviews'. */
  title: string;
  /** Index page intro. Receives the computed totals so the copy stays honest. */
  intro: (s: { topics: number; hours: number; free: number }) => string;
  /** What the "← back" link on a topic page reads. */
  back: string;
  topics: Topic[];
}

export function createModule(m: Omit<ContentModule, 'topics'> & { topics: Topic[] }): ContentModule {
  return { ...m, topics: [...m.topics].sort((a, b) => a.num - b.num) };
}

export const moduleStats = (m: ContentModule) => ({
  topics: m.topics.length,
  hours: Math.round(m.topics.reduce((a, t) => a + t.minutes, 0) / 60),
  free: m.topics.filter((t) => t.free).length,
});

export const getTopic = (m: ContentModule, slug: string | undefined) =>
  m.topics.find((t) => t.slug === slug);

/** Topics grouped under their unit heading, in `num` order. */
export function moduleUnits(m: ContentModule): { unit: string; topics: Topic[] }[] {
  const out: { unit: string; topics: Topic[] }[] = [];
  for (const t of m.topics) {
    const last = out[out.length - 1];
    if (last && last.unit === t.unit) last.topics.push(t);
    else out.push({ unit: t.unit, topics: [t] });
  }
  return out;
}

/** Free tier reads the topics marked `free`; the rest needs isPro. */
export function isTopicLocked(topic: Topic, user: AuthUser | undefined | null): boolean {
  if (user?.isPro) return false;
  return !topic.free;
}
