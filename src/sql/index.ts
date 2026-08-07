// Registry for the SQL module. Add a topic file under ./topics and register it
// here — ordering, unit grouping and prev/next all follow from `num`.

import { createModule } from '../content/module';

import sqlBasics from './topics/sqlBasics';
import sqlJoins from './topics/sqlJoins';
import sqlAggregation from './topics/sqlAggregation';
import sqlWindow from './topics/sqlWindow';
import sqlRevision from './topics/sqlRevision';

export const sqlModule = createModule({
  key: 'sql',
  nav: 'SQL',
  eyebrow: 'Core subject · placement prep',
  title: 'SQL for Interviews',
  back: '← SQL module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the SQL interviews actually test — the command families and clause execution ` +
    `order, every join with the rows it keeps, aggregation and subqueries, and window functions. Worked on one ` +
    `small table throughout, about ${hours} hours end to end.`,
  topics: [sqlBasics, sqlJoins, sqlAggregation, sqlWindow, sqlRevision],
});
