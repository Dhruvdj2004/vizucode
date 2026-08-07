// Registry for the OOP module. Add a topic file under ./topics and register it
// here — ordering, unit grouping and prev/next all follow from `num`.

import { createModule } from '../content/module';

import oopBasics from './topics/oopBasics';
import oopPillars from './topics/oopPillars';
import oopVirtual from './topics/oopVirtual';
import oopClassInternals from './topics/oopClassInternals';
import oopCopyingCasting from './topics/oopCopyingCasting';
import oopRelationships from './topics/oopRelationships';
import oopSolidExtras from './topics/oopSolidExtras';
import oopRevision from './topics/oopRevision';

export const oopsModule = createModule({
  key: 'oops',
  nav: 'OOPS',
  eyebrow: 'Core subject · placement prep',
  title: 'OOP for Interviews',
  back: '← OOP module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering every object-oriented concept interviews ask about, in C++ — the four pillars, ` +
    `virtual functions and the vtable, copy semantics, casting, the diamond problem and SOLID. Each one in plain ` +
    `English with the code and the follow-up questions. About ${hours} hours end to end.`,
  topics: [
    oopBasics,
    oopPillars,
    oopVirtual,
    oopClassInternals,
    oopCopyingCasting,
    oopRelationships,
    oopSolidExtras,
    oopRevision,
  ],
});
