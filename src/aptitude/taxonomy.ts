// The category → topic tree the whole Aptitude section is organised around.
// Topics are the selectable unit (topic picker, coverage bars, topic practice);
// each question also carries a finer-grained subtopic. Adding a topic here and
// questions with that topic in bank/ is all a new topic needs.
import type { CategoryKey, TestConfig } from './types';

export interface CategoryDef {
  key: CategoryKey;
  name: string;
  short: string;
  icon: string;
  topics: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'quant',
    name: 'Quantitative Aptitude',
    short: 'Quant',
    icon: '➗',
    topics: [
      'Number System',
      'Percentages',
      'Profit & Loss',
      'Ratio & Proportion',
      'Averages & Ages',
      'Simple & Compound Interest',
      'Time & Work',
      'Time, Speed & Distance',
      'Probability',
      'Permutation & Combination',
      'Algebra',
      'Geometry & Mensuration',
      'Data Interpretation',
      'Clocks & Calendars',
    ],
  },
  {
    key: 'logical',
    name: 'Logical Reasoning',
    short: 'Logical',
    icon: '🧩',
    topics: [
      'Series',
      'Coding-Decoding',
      'Blood Relations',
      'Direction Sense',
      'Ranking & Ordering',
      'Syllogisms',
      'Statements & Assumptions',
      'Analogies & Classification',
      'Seating Arrangement',
      'Venn Diagrams',
      'Data Sufficiency',
    ],
  },
  {
    key: 'analytical',
    name: 'Analytical Reasoning',
    short: 'Analytical',
    icon: '🔍',
    topics: [
      'Puzzles & Arrangements',
      'Scheduling & Selection',
      'Logical Deductions',
      'Pattern Recognition',
      'Decision Making',
    ],
  },
  {
    key: 'verbal',
    name: 'Verbal Ability',
    short: 'Verbal',
    icon: '📖',
    topics: [
      'Reading Comprehension',
      'Grammar & Error Detection',
      'Vocabulary',
      'Para Jumbles',
      'Sentence Completion',
      'Critical Reasoning',
    ],
  },
  {
    key: 'cs',
    name: 'Core Computer Science',
    short: 'Core CS',
    icon: '💻',
    topics: ['DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'DSA', 'Programming'],
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<
  CategoryKey,
  CategoryDef
>;

/** topic name → category key */
export const TOPIC_CATEGORY: Record<string, CategoryKey> = Object.fromEntries(
  CATEGORIES.flatMap((c) => c.topics.map((t) => [t, c.key]))
);

export const ALL_TOPICS = CATEGORIES.flatMap((c) => c.topics);
export const APTITUDE_TOPICS = CATEGORIES.filter((c) => c.key !== 'cs').flatMap((c) => c.topics);
export const CS_TOPICS = CATEGORY_BY_KEY.cs.topics;

export const TEST_COUNT = 20;
export const TEST_SECONDS = 20 * 60;

export interface CompanyStyle {
  key: string;
  name: string;
  blurb: string;
  weights: Partial<Record<CategoryKey, number>>;
}

// Weights describe the *shape* of each company's public test pattern, not its
// questions. These are practice sets in that style, never real company papers.
export const COMPANY_STYLES: CompanyStyle[] = [
  {
    key: 'tcs',
    name: 'TCS-style',
    blurb: 'Numerical-heavy with reasoning and verbal sections.',
    weights: { quant: 0.4, logical: 0.35, verbal: 0.25 },
  },
  {
    key: 'infosys',
    name: 'Infosys-style',
    blurb: 'Reasoning-led: puzzles, arrangements, and verbal.',
    weights: { logical: 0.3, analytical: 0.25, quant: 0.2, verbal: 0.25 },
  },
  {
    key: 'accenture',
    name: 'Accenture-style',
    blurb: 'Cognitive ability plus technical CS fundamentals.',
    weights: { cs: 0.3, logical: 0.25, analytical: 0.15, verbal: 0.2, quant: 0.1 },
  },
  {
    key: 'cognizant',
    name: 'Cognizant-style',
    blurb: 'Balanced quant, logical and English sections.',
    weights: { quant: 0.35, logical: 0.35, verbal: 0.3 },
  },
  {
    key: 'capgemini',
    name: 'Capgemini-style',
    blurb: 'Pseudo-reasoning, analytical puzzles and quant.',
    weights: { quant: 0.3, analytical: 0.3, logical: 0.2, verbal: 0.2 },
  },
  {
    key: 'product',
    name: 'Product-company OA',
    blurb: 'CS fundamentals, DSA and code-output questions first.',
    weights: { cs: 0.6, quant: 0.2, analytical: 0.2 },
  },
  {
    key: 'mixed',
    name: 'Mixed Company OA',
    blurb: 'Every section in equal measure.',
    weights: { quant: 0.2, logical: 0.2, analytical: 0.2, verbal: 0.2, cs: 0.2 },
  },
];

/** Ready-made test configs for the modes that need no topic picking. */
export function presetConfig(
  mode: 'mixed' | 'cs' | 'company',
  selection: TestConfig['selection'],
  company?: CompanyStyle
): TestConfig {
  if (mode === 'mixed') {
    return { mode, title: 'Mixed Aptitude Practice', topics: APTITUDE_TOPICS, count: TEST_COUNT, durationSec: TEST_SECONDS, selection };
  }
  if (mode === 'cs') {
    return { mode, title: 'Core CS OA', topics: CS_TOPICS, count: TEST_COUNT, durationSec: TEST_SECONDS, selection };
  }
  const c = company ?? COMPANY_STYLES[0];
  const cats = Object.keys(c.weights) as CategoryKey[];
  return {
    mode,
    title: `${c.name} practice`,
    topics: CATEGORIES.filter((x) => cats.includes(x.key)).flatMap((x) => x.topics),
    count: TEST_COUNT,
    durationSec: TEST_SECONDS,
    selection,
    categoryWeights: c.weights,
    companyStyle: c.key,
  };
}
