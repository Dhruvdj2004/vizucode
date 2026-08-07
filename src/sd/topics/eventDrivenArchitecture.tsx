import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A fire-alarm-style event: one signal, every consumer reacts independently and can fail on its own. */
function EventDrivenDiagram() {
  return (
    <Dg w={600} h={240} cap="An order-placed event lets three services react independently instead of one service calling each directly">
      <Box x={20} y={92} w={130} h={56} label="Order service" sub="order.placed" c="a" fs={12} />
      <Arrow x1={150} y1={120} x2={220} y2={120} c="a" label="emit" dy={-8} />
      <Box x={220} y={92} w={110} h={56} label="Event broker" c="n" fs={12} />

      <Arrow x1={330} y1={100} x2={410} y2={30} c="b" />
      <Arrow x1={330} y1={120} x2={410} y2={120} c="b" />
      <Arrow x1={330} y1={140} x2={410} y2={200} c="b" />

      <Box x={410} y={4} w={170} h={50} label="Inventory" sub="update stock" c="b" fs={11} />
      <Box x={410} y={94} w={170} h={50} label="Invoicing" sub="generate invoice" c="b" fs={11} />
      <Box x={410} y={176} w={170} h={50} label="Notifications" sub="send SMS/email" c="b" fs={11} />

      <Txt x={495} y={236} fs={11} soft>
        each retries independently on its own failure
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'event-driven-architecture',
  num: 21,
  unit: 'Messaging & Async',
  title: 'Event-Driven Architecture',
  blurb: 'Services react to events rather than direct synchronous calls, improving decoupling and resilience.',
  minutes: 9,
  tags: ['Advanced', 'Async'],

  sections: [
    {
      id: 'analogy',
      heading: 'The fire alarm analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a school fire alarm — one event (the alarm rings) and every classroom independently reacts and
              exits, without the alarm system having to call each classroom one by one and wait for confirmation.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Event-driven architecture takes the pub/sub idea and applies it at the level of whole services: a
              service emits events describing "what happened," and other services subscribe to react.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How this replaces direct service-to-service calls',
      blocks: [
        {
          k: 'diagram',
          el: <EventDrivenDiagram />,
          caption: 'One order-placed event triggers independent, individually-retryable reactions in three services.',
        },
        {
          k: 'p',
          text: (
            <>
              Instead of Service A calling Service B directly — and failing the whole flow if B happens to be
              down — A emits an <b>event</b> to a broker; B (and anyone else interested) consumes it whenever
              it's ready. A never even knows B exists.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This trades <b>immediate consistency</b> for <b>resilience</b>: the order-placed flow no longer
              fails just because the notification service happens to be down — it just catches up when it comes
              back, and each consumer can retry independently without blocking the others.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete flow, and its cost',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              An <code>order.placed</code> event triggers inventory update, invoice generation, and notification —
              each as an independent consumer that can fail and retry on its own without stalling the others.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              This introduces <b>eventual consistency</b> everywhere it's used — inventory, invoice, and
              notification might each update a few seconds apart. Make sure the business actually tolerates that
              delay before adopting this pattern for a flow.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is event-driven architecture, in one sentence?',
      a: <>Services communicate by emitting and reacting to events through a broker, instead of calling each other directly and synchronously.</>,
    },
    {
      q: 'How does this improve resilience compared to direct service calls?',
      a: (
        <>
          A downstream service being down doesn't fail the whole flow — the event just waits in the broker until
          that service catches up, instead of the caller getting an immediate failure.
        </>
      ),
    },
    {
      q: 'What is the main trade-off of event-driven architecture?',
      a: <>Eventual consistency — different consumers of the same event update at slightly different times, so the system is briefly in a partially-updated state.</>,
    },
    {
      q: 'Give a concrete example with one event and multiple independent reactions.',
      a: <>An order.placed event independently triggering inventory update, invoice generation, and a customer notification — each consumer can fail and retry on its own.</>,
    },
    {
      q: 'Why does the order service not need to know that a notification service exists?',
      a: <>Because it only emits the event to a broker/topic — it has no direct dependency on, or knowledge of, which services consume it.</>,
    },
    {
      q: 'When would you avoid event-driven architecture for a given flow?',
      a: <>When the business genuinely needs immediate, strongly-consistent confirmation across steps — e.g. a flow where the user must see all side effects completed before the response returns.</>,
    },
  ],
};

export default topic;
