import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** SLI measured → SLO targeted internally → SLA promised externally. */
function SliSloSlaDiagram() {
  return (
    <Dg w={600} h={220} cap="SLI is the measured metric, SLO the internal target, SLA the external contractual promise">
      <Frame x={2} y={10} w={596} h={200} label="ONE METRIC, THREE LAYERS" c="n" />
      <Box x={30} y={50} w={150} h={70} label="SLI" sub="99.94% success (measured)" c="a" fs={13} />
      <Arrow x1={180} y1={85} x2={230} y2={85} c="n" />
      <Box x={230} y={50} w={150} h={70} label="SLO" sub="target: 99.9% (internal)" c="b" fs={13} />
      <Arrow x1={380} y1={85} x2={430} y2={85} c="n" />
      <Box x={430} y={50} w={150} h={70} label="SLA" sub="promise: 99.9% (customer)" c="c" fs={13} />
      <Txt x={105} y={148} fs={11} soft>
        what you observe
      </Txt>
      <Txt x={305} y={148} fs={11} soft>
        what you aim for
      </Txt>
      <Txt x={505} y={148} fs={11} soft>
        what you're penalised on
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'availability-sla-slo-sli',
  num: 3,
  unit: 'Foundations',
  title: 'Availability, SLA / SLO / SLI',
  blurb:
    'Availability is uptime as a percentage. SLI is the measured metric, SLO is the internal target, SLA is the external promise with penalties.',
  minutes: 9,
  tags: ['Definition-heavy', 'Asked in interviews'],

  sections: [
    {
      id: 'analogy',
      heading: "The shop's timing board analogy",
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a shop's promised timing board: "Open 24x7." If it's actually shut for 9 hours across the whole
              year for repairs, it's still keeping roughly a 99.9%-style promise — the board is the SLA, the actual
              hours logged are the SLI, and the internal target the owner aims for is the SLO.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              These three terms get used interchangeably in casual conversation, but they refer to distinct
              layers — one is a raw measurement, one is a goal, and only one is a binding contract.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How the three layers fit together',
      blocks: [
        {
          k: 'diagram',
          el: <SliSloSlaDiagram />,
          caption: 'A single metric flows from measurement (SLI) to internal target (SLO) to external promise (SLA).',
        },
        {
          k: 'p',
          text: (
            <>
              You instrument a metric — an <b>SLI</b> (Service Level Indicator), e.g. the ratio of successful
              requests to total requests — and commit internally to a target, an <b>SLO</b> (Service Level
              Objective), e.g. 99.95%. Only some SLOs become customer-facing contractual promises: an <b>SLA</b>{' '}
              (Service Level Agreement), which usually comes with refunds or service credits if missed.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The SLO is deliberately set a little tighter than the SLA, so that normal operational noise doesn't
              immediately trigger a breach of the external contract — it's a buffer, not just a duplicate number.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'The cost of chasing more nines',
      blocks: [
        {
          k: 'table',
          head: ['Availability', 'Downtime / year'],
          rows: [
            ['99%', '≈ 3.65 days/yr'],
            ['99.9%', '≈ 8.7 hrs/yr'],
            ['99.99%', '≈ 52 min/yr'],
            ['99.999%', '≈ 5 min/yr'],
          ],
          caption: 'Each extra "nine" is an order-of-magnitude tighter target, and disproportionately more expensive to hit.',
        },
        {
          k: 'p',
          text: (
            <>
              "99.9% uptime" allows roughly 8.7 hours of downtime a year; "99.99%" allows about 52 minutes — and
              closing that gap usually requires redundancy, automated failover, and on-call discipline that costs
              far more than the raw percentage difference suggests.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Higher availability isn't free — justify the target against what actually breaks if the system is
              briefly down. A 99.99% target for an internal analytics dashboard is usually wasted engineering
              effort.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between SLI, SLO, and SLA?',
      a: (
        <>
          SLI is the actual measured metric (e.g. request success rate). SLO is the internal target for that
          metric. SLA is the external, contractual promise made to customers, usually with penalties attached if
          missed.
        </>
      ),
    },
    {
      q: 'Why is the SLO usually set tighter than the SLA?',
      a: (
        <>
          To leave a buffer — so normal operational variance doesn't immediately trigger a breach of the external,
          penalty-bearing contract. Teams get an internal warning before customers are affected.
        </>
      ),
    },
    {
      q: 'How much downtime does 99.9% availability allow per year?',
      a: <>About 8.7 hours per year. 99.99% allows roughly 52 minutes, and 99.999% about 5 minutes.</>,
    },
    {
      q: 'Is it always a good idea to aim for the highest possible availability?',
      a: (
        <>
          No — each extra "nine" costs disproportionately more engineering effort (redundancy, automated failover,
          on-call). The target should be justified by what actually breaks downstream if the system is briefly
          unavailable.
        </>
      ),
    },
    {
      q: 'Give an example SLI for an API service.',
      a: <>The ratio of successful (non-5xx, within-latency-budget) responses to total requests over a rolling window.</>,
    },
    {
      q: 'What happens when an SLA is breached?',
      a: (
        <>
          Typically service credits or refunds are owed to the customer, as defined in the contract — this is what
          makes an SLA different from an SLO, which is purely an internal target with no external penalty.
        </>
      ),
    },
  ],
};

export default topic;
