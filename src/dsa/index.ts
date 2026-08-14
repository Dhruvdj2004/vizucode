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
import graphRevision from './topics/graphRevision';
import dpRevision from './topics/dpRevision';

export const dsaModule = createModule({
  key: 'revision',
  nav: 'Revision',
  eyebrow: 'Interview prep, in plain language',
  title: 'DSA Revision Notes',
  back: '← DSA revision',
  intro: () => '',
  topics: [
    graphBasics,
    graphTraversal,
    graphCyclesTopo,
    graphShortestPaths,
    graphMstScc,
    graphBridges,
    graphRevision,
    dpIntuition,
    dp1dGrid,
    dpKnapsack,
    dpStrings,
    dpPitfalls,
    dpRevision,
  ],
});
