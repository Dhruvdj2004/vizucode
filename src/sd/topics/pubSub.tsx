import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** One publisher, one topic, several independent subscribers reacting to the same event. */
function PubSubDiagram() {
  return (
    <Dg w={600} h={240} cap="A publisher emits to a topic; every subscriber reacts independently, unaware of each other">
      <Box x={20} y={90} w={130} h={60} label="Publisher" sub="listing.updated" c="a" fs={12} />
      <Arrow x1={150} y1={120} x2={230} y2={120} c="a" label="publish" dy={-8} />

      <Box x={230} y={90} w={120} h={60} label="Topic" sub="listing.updated" c="n" fs={12} />

      <Arrow x1={350} y1={100} x2={430} y2={40} c="b" dx={0} dy={-4} />
      <Arrow x1={350} y1={120} x2={430} y2={120} c="b" dx={0} dy={-8} />
      <Arrow x1={350} y1={140} x2={430} y2={200} c="b" dx={0} dy={4} />

      <Box x={430} y={12} w={150} h={54} label="Search indexer" c="b" fs={11} />
      <Box x={430} y={94} w={150} h={54} label="Price alerts" c="b" fs={11} />
      <Box x={430} y={176} w={150} h={54} label="Analytics" c="b" fs={11} />

      <Txt x={505} y={236} fs={11} soft>
        each subscriber independent
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'pub-sub',
  num: 20,
  unit: 'Messaging & Async',
  title: 'Pub/Sub',
  blurb: "Publishers emit events without knowing who's listening; subscribers react independently to the ones they care about.",
  minutes: 8,
  tags: ['Very common', 'Async'],

  sections: [
    {
      id: 'analogy',
      heading: 'The YouTube channel analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a YouTube channel — the creator uploads a video without knowing exactly who's subscribed, and
              every subscriber gets notified independently, with no direct connection between the creator and any
              one viewer.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Pub/Sub is one-to-many by design: a single event can trigger any number of independent reactions
              without the publisher listing them out one by one.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How the topic decouples publisher from subscribers',
      blocks: [
        {
          k: 'diagram',
          el: <PubSubDiagram />,
          caption: 'One event fans out from a topic to every interested subscriber, simultaneously and independently.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>topic</b> (or channel) sits between the publisher and every subscriber. The publisher only
              ever talks to the topic — it has no idea how many subscribers exist, or what they do with the
              event.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This means new subscribers can be added later without touching the publisher's code at all — you
              just point a new consumer at the existing topic, and it starts receiving every future event.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A fan-out example, and the debugging cost',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <code>listing.updated</code> event fans out to the search-index updater, the price-alert service,
              and the analytics pipeline simultaneously — three independent teams' code, none aware of the
              others.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Debugging is harder — a single user action can trigger effects across many services with no single
              call stack to trace. Good tracing/correlation IDs across all subscribers become essential.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'How is pub/sub different from a message queue?',
      a: (
        <>
          A queue is typically one message consumed by one consumer (competing consumers share the backlog).
          Pub/sub is one event delivered to every interested subscriber independently — one-to-many fan-out.
        </>
      ),
    },
    {
      q: 'Why can subscribers be added without changing the publisher?',
      a: <>Because the publisher only ever talks to the topic, not to individual subscribers — it has no knowledge of who or how many are listening.</>,
    },
    {
      q: 'Give a concrete example of pub/sub fan-out.',
      a: <>A "listing.updated" event triggering the search-index updater, the price-alert service, and the analytics pipeline all at once, independently.</>,
    },
    {
      q: 'What is the main debugging cost of pub/sub?',
      a: <>A single action can trigger effects across many independent services with no single call stack to trace, so correlation IDs and distributed tracing become important.</>,
    },
    {
      q: 'What does the topic/channel actually do in a pub/sub system?',
      a: <>It decouples publisher from subscriber — the publisher emits to the topic, and any number of subscribers can attach to (or detach from) that topic independently.</>,
    },
    {
      q: 'Is pub/sub delivery typically synchronous with the publisher\'s request?',
      a: <>No — publishing is fire-and-forget from the publisher's point of view; subscribers process the event asynchronously, at their own pace.</>,
    },
  ],
};

export default topic;
