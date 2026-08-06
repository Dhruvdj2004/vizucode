// Registry for the DSA revision module — the written notes that sit alongside
// the step-by-step visualizers. Add a topic file under ./topics and register it
// here; ordering, unit grouping and prev/next all follow from `num`.

import { createModule } from '../content/module';

import graphBasics from './topics/graphBasics';
import graphTraversal from './topics/graphTraversal';
import graphCyclesTopo from './topics/graphCyclesTopo';
import graphShortestPaths from './topics/graphShortestPaths';
import graphMstScc from './topics/graphMstScc';
import graphBridges from './topics/graphBridges';
import dpIntuition from './topics/dpIntuition';
import dp1dGrid from './topics/dp1dGrid';
import dpKnapsack from './topics/dpKnapsack';
import dpStrings from './topics/dpStrings';
import dpPitfalls from './topics/dpPitfalls';

export const dsaModule = createModule({
  key: 'revision',
  nav: 'Revision',
  eyebrow: 'Interview prep, in plain language',
  title: 'DSA Revision Notes',
  back: '← DSA revision',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the graph and dynamic programming syllabus interviews actually ask — ` +
    `every algorithm explained in plain language, drawn as a diagram, and paired with working code plus ` +
    `the questions that follow it. About ${hours} hours end to end.`,
  topics: [
    graphBasics,
    graphTraversal,
    graphCyclesTopo,
    graphShortestPaths,
    graphMstScc,
    graphBridges,
    dpIntuition,
    dp1dGrid,
    dpKnapsack,
    dpStrings,
    dpPitfalls,
  ],
});
