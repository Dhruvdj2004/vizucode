// Registry for the Computer Networks module. Add a topic file under ./topics
// and register it here — ordering, unit grouping and prev/next follow from `num`.

import { createModule } from '../content/module';

import cnBasics from './topics/cnBasics';
import cnModels from './topics/cnModels';
import cnAddressing from './topics/cnAddressing';
import cnDevices from './topics/cnDevices';
import cnTransport from './topics/cnTransport';
import cnSecurity from './topics/cnSecurity';

export const cnModule = createModule({
  key: 'cn',
  nav: 'CN',
  eyebrow: 'Core subject · placement prep',
  title: 'Computer Networks for Interviews',
  back: '← CN module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the networking questions interviews actually ask — topologies, the OSI and TCP/IP ` +
    `models, addressing and DNS, the devices at each layer, TCP versus UDP and the web protocols. Plain language, ` +
    `drawn out, about ${hours} hours end to end.`,
  topics: [cnBasics, cnModels, cnAddressing, cnDevices, cnTransport, cnSecurity],
});
