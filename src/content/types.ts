// Content model shared by every theory module (DBMS, OS, …).
//
// Topics are authored as data (see src/dbms/topics/*.tsx, src/os/topics/*.tsx)
// and rendered by src/components/ContentBlocks.tsx, so the reading experience
// stays identical across every topic of every module.

import type { ReactNode } from 'react';

/** Any inline content — plain text, or JSX for <b>/<code>/<em> emphasis. */
export type Rich = ReactNode;

export type Tone = 'tip' | 'warn' | 'exam';

export type Block =
  /** Sub-heading inside a section. */
  | { k: 'h'; text: string }
  /** Plain-English paragraph. */
  | { k: 'p'; text: Rich }
  /** Bulleted list. */
  | { k: 'ul'; items: Rich[] }
  /** Numbered list. */
  | { k: 'ol'; items: Rich[] }
  /** A drawn diagram with an optional caption underneath. */
  | { k: 'diagram'; el: ReactNode; caption?: Rich }
  /** Comparison / reference table. */
  | { k: 'table'; head: string[]; rows: Rich[][]; caption?: Rich }
  /** Monospace block — relational algebra, FD sets, schedules, C snippets. */
  | { k: 'code'; title?: string; code: string }
  /** Highlighted aside. 'exam' = "this is what they actually ask". */
  | { k: 'note'; tone: Tone; title?: string; text: Rich }
  /** Numbered walkthrough where each step has a short label + explanation. */
  | { k: 'steps'; items: { t: string; d: Rich }[] };

export interface Section {
  /** Anchor id, used by the on-page contents rail. */
  id: string;
  heading: string;
  blocks: Block[];
}

export interface QA {
  q: string;
  a: Rich;
}

export interface Topic {
  slug: string;
  /** Display order and the numbering on cards. */
  num: number;
  /** Grouping heading on the index page, e.g. 'Normalization'. */
  unit: string;
  title: string;
  /** One line, plain English — shown on the index card. */
  blurb: string;
  /** Rough read time in minutes. */
  minutes: number;
  /** Free tier topics; everything else needs isPro. */
  free?: boolean;
  /** Short chips on the card, e.g. 'Asked in every interview'. */
  tags: string[];
  sections: Section[];
  /** Placement-style Q&A, shown as an accordion at the end of the topic. */
  interview: QA[];
}
