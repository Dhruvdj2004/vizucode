import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** Producers pushing into a bounded queue, consumers pulling from it. */
function ProducerConsumerDiagram() {
  return (
    <Dg w={600} h={240} cap="Producers push onto a bounded queue; consumers pull from it at their own pace">
      <Box x={30} y={30} w={110} h={44} label="Producer 1" c="a" fs={11} />
      <Box x={30} y={90} w={110} h={44} label="Producer 2" c="a" fs={11} />

      <Box x={225} y={60} w={150} h={90} label="Bounded queue" sub="blocks when full/empty" c="n" fs={11} />

      <Box x={460} y={30} w={110} h={44} label="Consumer 1" c="b" fs={11} />
      <Box x={460} y={90} w={110} h={44} label="Consumer 2" c="b" fs={11} />
      <Box x={460} y={150} w={110} h={44} label="Consumer 3" c="b" fs={11} />

      <Arrow x1={140} y1={52} x2={225} y2={85} c="a" />
      <Arrow x1={140} y1={112} x2={225} y2={105} c="a" />
      <Arrow x1={375} y1={85} x2={460} y2={52} c="b" />
      <Arrow x1={375} y1={100} x2={460} y2={112} c="b" />
      <Arrow x1={375} y1={115} x2={460} y2={172} c="b" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'producer-consumer',
  num: 51,
  unit: 'Concurrency Basics',
  title: 'Producer-Consumer',
  blurb:
    'Producers add work to a shared queue while consumers process it independently — the pattern that decouples generating work from doing it.',
  minutes: 8,
  tags: ['Concurrency', 'Design pattern'],

  sections: [
    {
      id: 'analogy',
      heading: 'The dhaba kitchen analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a dhaba kitchen — the cook keeps preparing dishes and placing them on the counter (
              <b>producer</b>), while waiters keep picking up ready dishes to serve (<b>consumer</b>), each working
              at their own pace, with the counter acting as the buffer between them.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Neither side needs to know or care how fast the other is working — the counter absorbs the
              difference.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        {
          k: 'diagram',
          el: <ProducerConsumerDiagram />,
          caption: 'A thread-safe bounded queue decouples producers from consumers.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>thread-safe bounded queue</b> sits between producers and consumers. Producers <b>block</b> (or
              drop items) when the queue is full; consumers <b>block</b> when it's empty — this decouples the rate
              of work generation from the rate of work processing.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>fixed pool</b> of consumer threads is usually paired with the queue, so processing capacity is
              bounded and predictable rather than growing unboundedly with the number of producers.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where it shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              An image-upload thread pushing resize jobs onto a queue, while a fixed pool of worker threads pulls
              and processes them concurrently.
            </>,
            <>
              A logging system where application threads (producers) write log lines to an in-memory queue, and a
              single background thread (consumer) drains it to disk — so slow disk I/O never blocks the app
              threads.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Interview framing',
          text: (
            <>
              This is the <b>in-process version</b> of the message queue pattern (Kafka, SQS, RabbitMQ) — same
              idea, different scale. Drawing that parallel explicitly is a strong signal in an interview.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem does the producer-consumer pattern solve?',
      a: (
        <>
          It decouples the rate at which work is generated from the rate at which it's processed, so producers and
          consumers can each run at their own pace.
        </>
      ),
    },
    {
      q: 'What happens when the queue is full or empty?',
      a: (
        <>
          Producers block (or drop the item) when the queue is full; consumers block when the queue is empty,
          waiting for new work.
        </>
      ),
    },
    {
      q: 'Why use a bounded queue instead of an unbounded one?',
      a: (
        <>
          An unbounded queue lets a fast producer pile up unlimited memory if consumers can't keep up — a bounded
          queue applies backpressure by blocking the producer instead.
        </>
      ),
    },
    {
      q: 'How does producer-consumer relate to message queues like Kafka or SQS?',
      a: (
        <>
          It's the same pattern at in-process scale — a queue decoupling producers from consumers — just realised
          as a distributed, durable service instead of an in-memory data structure.
        </>
      ),
    },
    {
      q: 'Why pair the queue with a fixed pool of consumer threads rather than spawning one per item?',
      a: <>To bound processing capacity and resource usage predictably, instead of letting thread count grow unboundedly with incoming work.</>,
    },
    {
      q: 'Give a concrete example of producer-consumer in a real system.',
      a: <>A logging pipeline where app threads (producers) enqueue log lines and a background thread (consumer) drains them to disk, keeping slow disk I/O off the request path.</>,
    },
  ],
};

export default topic;
