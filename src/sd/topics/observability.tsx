import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** One request traced as a horizontal waterfall across services, showing where time was actually spent. */
function TraceDiagram() {
  return (
    <Dg w={600} h={240} cap="A distributed trace: one request's time spent across gateway, search, and pricing services">
      <Txt x={20} y={30} anchor="start" fs={11} soft>trace id: 8f2a-91c</Txt>
      <Box x={20} y={50} w={100} h={40} label="Gateway" c="n" fs={11} />
      <Box x={130} y={50} w={140} h={40} label="Search svc" sub="400ms" c="a" fs={11} />
      <Box x={280} y={50} w={180} h={40} label="Pricing svc" sub="1200ms" c="c" fs={11} />
      <Box x={470} y={50} w={100} h={40} label="Gateway" c="n" fs={11} />

      <Arrow x1={120} y1={70} x2={130} y2={70} c="n" plain />
      <Arrow x1={270} y1={70} x2={280} y2={70} c="n" plain />
      <Arrow x1={460} y1={70} x2={470} y2={70} c="n" plain />

      <Txt x={20} y={140} anchor="start" fs={11} soft>0ms</Txt>
      <Box x={20} y={150} w={110} h={26} label="gateway" c="n" fs={10} />
      <Box x={130} y={150} w={140} h={26} label="search: 400ms" c="a" fs={10} />
      <Box x={270} y={150} w={230} h={26} label="pricing: 1200ms (slow!)" c="c" fs={10} />
      <Txt x={560} y={140} anchor="end" fs={11} soft>1620ms</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'observability',
  num: 28,
  unit: 'Architecture Style & Reliability',
  title: 'Observability',
  blurb:
    'Metrics, logs, and traces together let you answer "what is the system doing right now, and why did that request fail."',
  minutes: 9,
  tags: ['Ops', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The car dashboard analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a car's dashboard with speed, fuel, and an engine warning light — you don't have to open the
              bonnet to know something's wrong. Observability gives engineers that same at-a-glance signal for a
              distributed system.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              As a system grows into many services, you can no longer just SSH into "the server" and look at logs —
              you need structured signals designed to be correlated across services.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'The three pillars',
      blocks: [
        { k: 'diagram', el: <TraceDiagram />, caption: 'One request traced across three services, with the slow hop immediately visible.' },
        {
          k: 'p',
          text: (
            <>
              <b>Metrics</b> give aggregate numbers over time — error rate, p99 latency, request throughput — cheap
              to store and great for dashboards and alerting on trends.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Logs</b> give detailed per-event context — exactly what happened, with what inputs, on a specific
              request. <b>Distributed traces</b> follow one request across every service it touched, correlated by a
              shared trace ID, showing exactly where time was spent.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where this shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A trace ID attached to a request shows it spent 400ms in the search service and 1200ms waiting on a
              downstream pricing call — pinpointing the actual bottleneck instantly instead of guessing.
            </>,
            <>
              Tools like <b>Prometheus</b> (metrics), <b>ELK/Loki</b> (logs), and <b>Jaeger/Zipkin</b> (tracing) are
              the standard open-source stack implementing these three pillars.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Logging alone doesn't scale past a handful of services — without trace correlation (a shared trace ID
              propagated through every hop), debugging a multi-service failure becomes guesswork across dozens of
              disconnected log streams.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What are the three pillars of observability?',
      a: <>Metrics (aggregate numbers over time), logs (detailed per-event context), and traces (a single request followed across every service it touched).</>,
    },
    {
      q: 'How does a distributed trace correlate work across services?',
      a: (
        <>
          A trace ID is generated at the entry point and propagated through every downstream call (usually via a
          header), so every service's spans can be stitched back into one timeline for that request.
        </>
      ),
    },
    {
      q: 'When would you look at metrics vs traces?',
      a: (
        <>
          Metrics to notice something is wrong in aggregate (e.g. p99 latency spiked) — traces to drill into a
          specific slow or failed request and see exactly which hop caused it.
        </>
      ),
    },
    {
      q: 'Why is logging alone insufficient in a microservices system?',
      a: (
        <>
          Logs are scattered per-service with no built-in way to connect them for a single request — without a
          shared trace ID, correlating a failure across services becomes manual, slow guesswork.
        </>
      ),
    },
    {
      q: 'Name a real tool for each pillar.',
      a: <>Metrics: Prometheus. Logs: ELK stack or Loki. Traces: Jaeger or Zipkin.</>,
    },
    {
      q: 'What is p99 latency and why does it matter more than average latency?',
      a: (
        <>
          The latency below which 99% of requests complete — it surfaces the worst-case experience that averages
          hide, which matters because a small fraction of very slow requests can still mean many real users are
          affected at scale.
        </>
      ),
    },
  ],
};

export default topic;
