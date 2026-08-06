// Registry for the Operating Systems module. Add a topic file under ./topics
// and register it here — ordering, unit grouping and prev/next follow from `num`.

import { createModule } from '../content/module';

import osFundamentals from './topics/osFundamentals';
import osProcesses from './topics/osProcesses';
import osMemory from './topics/osMemory';
import osScheduling from './topics/osScheduling';
import osSyncDeadlock from './topics/osSyncDeadlock';
import osStorage from './topics/osStorage';

export const osModule = createModule({
  key: 'os',
  nav: 'OS',
  eyebrow: 'Core subject · placement prep',
  title: 'Operating Systems for Interviews',
  back: '← OS module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the operating-systems questions interviews actually ask — processes and threads, ` +
    `memory and paging, every scheduling algorithm worked on one example, synchronization, deadlock and storage. ` +
    `Plain language, drawn out, about ${hours} hours end to end.`,
  topics: [osFundamentals, osProcesses, osMemory, osScheduling, osSyncDeadlock, osStorage],
});
