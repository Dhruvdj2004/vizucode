import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** One request's travel time vs how many requests complete per second. */
function LatencyThroughputDiagram() {
  return (
    <Dg w={600} h={260} cap="Latency is one request's travel time; throughput is requests completed per second">
      <Frame x={2} y={8} w={280} h={236} label="LATENCY" c="a" />
      <Txt x={142} y={36} fs={11} soft>
        one request
      </Txt>
      <Box x={40} y={56} w={90} h={40} label="Client" c="n" fs={12} />
      <Arrow x1={130} y1={76} x2={190} y2={76} c="a" label="120ms" />
      <Box x={190} y={56} w={90} h={40} label="Server" c="a" fs={12} />
      <Txt x={142} y={200} fs={11} soft>
        how long ONE trip takes,
      </Txt>
      <Txt x={142} y={222} fs={11} soft>
        end to end
      </Txt>

      <Frame x={318} y={8} w={280} h={236} label="THROUGHPUT" c="b" />
      <Txt x={458} y={36} fs={11} soft>
        many requests / second
      </Txt>
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={340} y1={64 + i * 24} x2={430} y2={64 + i * 24} c="b" />
      ))}
      <Box x={430} y={56} w={110} h={112} label="Server" sub="handles N/s" c="b" fs={12} />
      <Txt x={458} y={200} fs={11} soft>
        how many trips finish
      </Txt>
      <Txt x={458} y={222} fs={11} soft>
        per second, in total
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'latency-vs-throughput',
  num: 2,
  unit: 'Foundations',
  title: 'Latency vs Throughput',
  blurb:
    "Latency is the time one request takes end-to-end; throughput is how many requests the system completes per second — and optimising for one can hurt the other.",
  minutes: 8,
  tags: ['Very common', 'Trade-off question'],

  sections: [
    {
      id: 'analogy',
      heading: 'The auto-rickshaw fleet analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              <b>Latency</b> is how long it takes one auto-rickshaw to reach your destination. <b>Throughput</b> is
              how many passengers the entire auto fleet in the city can drop off in an hour. A single fast auto
              gives one rider a great trip; a large fleet moves the whole city, even if any one trip isn't the
              fastest possible.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              They sound related but they measure completely different things, and a system can be great at one
              while being mediocre at the other.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How optimising for one affects the other',
      blocks: [
        {
          k: 'diagram',
          el: <LatencyThroughputDiagram />,
          caption: 'Latency measures one trip; throughput measures total trips completed per second.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Batching</b> requests together — collecting several before processing — raises throughput because
              each batch amortises fixed overhead across many items. But it adds waiting time per request while the
              batch fills up, which directly hurts latency for any individual request.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Adding parallel workers</b> raises throughput without touching per-request latency at all — each
              request still takes the same time, there are just more of them happening at once. This works until a
              shared resource, like a database connection pool or a lock, becomes the bottleneck and requests start
              queuing behind it.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Which one to optimise for',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <b>payment API</b> optimises for low latency — the user is actively waiting and staring at a
              spinner, so every extra 100ms is felt directly.
            </>,
            <>
              A <b>nightly report pipeline</b> optimises for throughput — total volume processed matters, not how
              fast any one row was handled.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              State which one your design is optimising for — interviewers listen for this distinction explicitly.
              Saying "I'll batch writes to improve performance" without naming the trade-off (better throughput,
              worse per-request latency) is a common miss.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between latency and throughput?',
      a: (
        <>
          Latency is the time a single request takes end-to-end. Throughput is the number of requests the system
          completes per unit time. A system can have low latency but low throughput, or vice versa.
        </>
      ),
    },
    {
      q: 'Does increasing throughput always hurt latency?',
      a: (
        <>
          No. Adding parallel workers to independent requests raises throughput without changing any individual
          request's latency — until a shared resource like a DB or lock becomes a bottleneck. Batching, on the other
          hand, trades latency for throughput directly.
        </>
      ),
    },
    {
      q: 'Give an example of a system that should optimise for latency over throughput.',
      a: (
        <>
          A payment or checkout API — the user is actively waiting, so minimising per-request response time matters
          more than total volume processed.
        </>
      ),
    },
    {
      q: 'Give an example of a system that should optimise for throughput over latency.',
      a: (
        <>
          A nightly batch report or ETL pipeline — total rows processed per hour matters, and no one is waiting on
          any single row's completion time.
        </>
      ),
    },
    {
      q: 'How does batching affect latency and throughput?',
      a: (
        <>
          Batching raises throughput by amortising fixed overhead across many items, but it adds waiting time while
          the batch fills, which increases per-request latency.
        </>
      ),
    },
    {
      q: 'What eventually limits throughput even with unlimited parallel workers?',
      a: (
        <>
          A shared resource — a database, a lock, a connection pool, or the network itself — becomes the bottleneck,
          and requests start queuing behind it regardless of how many workers exist.
        </>
      ),
    },
  ],
};

export default topic;
