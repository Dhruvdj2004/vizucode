// The one place that knows which content modules exist and how they are grouped
// in the UI. Nav, the home page cards and the /core hub all read from here, so
// adding a module means editing this file and nothing else.

import type { ContentModule } from './module';
import { dbmsModule } from '../dbms';
import { osModule } from '../os';
import { oopsModule } from '../oops';
import { cnModule } from '../cn';
import { sqlModule } from '../sql';
import { sdModule } from '../sd';
import { dsaModule } from '../dsa';

export { navSection } from './navKeys';

export interface ModuleLink {
  mod: ContentModule;
  /** Emoji shown on the card. */
  icon: string;
  /** Accent role, used for the card's left border. */
  tint: 'a' | 'b' | 'c';
  /** One line describing the module on a card. */
  tagline: string;
}

/** The classic placement "core subjects" — the /core hub lists exactly these. */
export const CORE_MODULES: ModuleLink[] = [
  {
    mod: dbmsModule,
    icon: '🗄️',
    tint: 'a',
    tagline: 'Relational design, normalization, transactions, indexing and CAP.',
  },
  {
    mod: osModule,
    icon: '⚙️',
    tint: 'b',
    tagline: 'Processes, memory and paging, scheduling, deadlock and storage.',
  },
  {
    mod: oopsModule,
    icon: '🧩',
    tint: 'c',
    tagline: 'The four pillars, virtual functions, copy semantics and SOLID.',
  },
  {
    mod: cnModule,
    icon: '🌐',
    tint: 'a',
    tagline: 'Topologies, OSI and TCP/IP, addressing, DNS, TCP vs UDP and HTTPS.',
  },
  {
    mod: sqlModule,
    icon: '🔍',
    tint: 'b',
    tagline: 'Clause execution order, joins, aggregation and window functions.',
  },
  {
    mod: sdModule,
    icon: '🏗️',
    tint: 'c',
    tagline: 'HLD + LLD for freshers — scaling, caching, SOLID and the patterns interviewers ask you to write.',
  },
];

/** Written notes that accompany the DSA visualizers. */
export const REVISION_MODULES: ModuleLink[] = [
  {
    mod: dsaModule,
    icon: '📗',
    tint: 'a',
    tagline: 'Graphs and dynamic programming, in plain language with diagrams.',
  },
];

export const ALL_MODULES: ModuleLink[] = [...REVISION_MODULES, ...CORE_MODULES];

/** Route bases owned by the Core Subjects section. */
export const CORE_KEYS = CORE_MODULES.map((m) => m.mod.key);
