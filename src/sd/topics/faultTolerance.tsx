import { Arrow, Box, Dg, Frame } from '../dgm';
import type { SdTopic } from '../types';

/** A replicated service surviving one node's failure via health-checked redundancy. */
function RedundancyDiagram() {
  return (
    <Dg w={600} h={260} cap="Three replicas behind a health-checked load balancer — one node dying doesn't take the service down">
      <Box x={230} y={20} w={140} h={44} label="Load balancer" c="n" fs={12} />
      <Frame x={40} y={100} w={520} h={130} label="REPLICAS" c="a" />
      <Box x={70} y={140} w={130} h={60} label="Node A" sub="healthy" c="a" fs={12} />
      <Box x={235} y={140} w={130} h={60} label="Node B" sub="crashed" c="c" dashed fs={12} />
      <Box x={400} y={140} w={130} h={60} label="Node C" sub="healthy" c="a" fs={12} />
      <Arrow x1={300} y1={64} x2={135} y2={140} c="a" plain bend="v" />
      <Arrow x1={300} y1={64} x2={300} y2={140} c="c" dashed plain />
      <Arrow x1={300} y1={64} x2={465} y2={140} c="a" plain bend="v" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'fault-tolerance-redundancy',
  num: 27,
  unit: 'Architecture Style & Reliability',
  title: 'Fault Tolerance & Redundancy',
  blurb: 'No single node, disk, or data-center failure should be able to take the whole system down.',
  minutes: 9,
  tags: ['Reliability', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The spare tyre analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like keeping a spare tyre in the car — if one tyre punctures, the journey doesn't have to stop. The
              spare isn't there because a puncture is expected on every trip; it's there because eventually one will
              happen, and the cost of not having it is far worse.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Fault tolerance isn't about preventing failures — failures are inevitable at scale. It's about making
              sure no single failure is catastrophic.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How systems stay up despite failures',
      blocks: [
        { k: 'diagram', el: <RedundancyDiagram />, caption: 'One replica crashes; health checks remove it from rotation while the others keep serving traffic.' },
        {
          k: 'p',
          text: (
            <>
              <b>Replicas</b> mean data and compute exist in more than one place, so one node dying doesn't lose data
              or capacity. <b>Health checks</b> continuously probe instances and remove unhealthy ones from load
              balancer rotation automatically.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Retries with backoff</b> let transient failures (a brief network blip) self-heal without any human
              intervention. <b>Graceful degradation</b> means serving a reduced experience instead of an outright
              error when a non-critical dependency fails.
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
              If the recommendations service is unreachable, the listing page renders without recommendations
              instead of returning a 500 — graceful degradation in action.
            </>,
            <>
              A database replicated across three <b>availability zones</b> survives one entire zone going offline,
              since the other two still hold full copies of the data.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Redundancy across availability zones only helps if it's actually <b>tested</b> — running periodic
              failure drills (chaos engineering, like Netflix's Chaos Monkey). Untested failover is a plan, not a
              guarantee — the failover code path is often the least-exercised code in the whole system.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the goal of fault tolerance?',
      a: <>Ensuring no single node, disk, or data-center failure takes down the whole system — failures are assumed inevitable, so the design absorbs them instead of preventing them.</>,
    },
    {
      q: 'What is the difference between redundancy and fault tolerance?',
      a: (
        <>
          Redundancy (replicas, spare capacity) is one mechanism that enables fault tolerance, which is the broader
          system property of continuing to function correctly despite failures.
        </>
      ),
    },
    {
      q: 'What is graceful degradation?',
      a: <>Serving a reduced but still-functional experience when a non-critical dependency fails, instead of returning an error for the whole request.</>,
    },
    {
      q: 'Why do health checks matter for fault tolerance?',
      a: (
        <>
          They let the system automatically detect an unhealthy instance and remove it from rotation before it can
          keep serving errors or timeouts to users.
        </>
      ),
    },
    {
      q: 'Why is "untested failover" considered risky?',
      a: (
        <>
          Failover code paths run rarely, so bugs in them go unnoticed until the real failure happens — at which
          point the backup fails too. Regular failure drills (chaos engineering) catch this ahead of time.
        </>
      ),
    },
    {
      q: 'How does retrying with backoff help fault tolerance?',
      a: (
        <>
          It lets transient failures — a brief network blip, a momentarily overloaded node — resolve themselves
          without manual intervention, while backoff prevents the retries themselves from overwhelming a recovering
          system.
        </>
      ),
    },
  ],
};

export default topic;
