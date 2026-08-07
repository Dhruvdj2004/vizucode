import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Strong consistency reads the leader; eventual consistency reads any replica. */
function ConsistencyDiagram() {
  return (
    <Dg w={600} h={260} cap="Strong consistency routes reads through the leader; eventual consistency reads any replica">
      <Frame x={2} y={8} w={280} h={244} label="STRONG" c="a" />
      <Box x={92} y={30} w={100} h={40} label="Leader" c="a" fs={12} />
      <Arrow x1={92} y1={50} x2={40} y2={100} c="n" bend="v" />
      <Arrow x1={192} y1={50} x2={244} y2={100} c="n" bend="v" />
      <Box x={30} y={100} w={80} h={36} label="Replica" c="n" fs={11} />
      <Box x={192} y={100} w={80} h={36} label="Replica" c="n" fs={11} />
      <Arrow x1={142} y1={160} x2={142} y2={130} c="a" label="read" dy={-6} />
      <Txt x={142} y={190} fs={11} soft>
        every read hits leader
      </Txt>
      <Txt x={142} y={212} fs={11} soft>
        always latest, more latency
      </Txt>

      <Frame x={318} y={8} w={280} h={244} label="EVENTUAL" c="b" />
      <Box x={408} y={30} w={100} h={40} label="Leader" c="n" fs={12} />
      <Arrow x1={408} y1={50} x2={356} y2={100} c="n" bend="v" dashed />
      <Arrow x1={508} y1={50} x2={560} y2={100} c="n" bend="v" dashed />
      <Box x={346} y={100} w={80} h={36} label="Replica" c="b" fs={11} />
      <Box x={508} y={100} w={80} h={36} label="Replica" c="b" fs={11} />
      <Arrow x1={386} y1={160} x2={386} y2={130} c="b" label="read" dy={-6} />
      <Arrow x1={548} y1={160} x2={548} y2={130} c="b" label="read" dy={-6} />
      <Txt x={458} y={190} fs={11} soft>
        any replica answers
      </Txt>
      <Txt x={458} y={212} fs={11} soft>
        fast, briefly stale
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'consistency-models',
  num: 5,
  unit: 'Foundations',
  title: 'Consistency Models',
  blurb:
    'Strong consistency guarantees every read sees the latest write; eventual consistency allows replicas to lag and catch up over time.',
  minutes: 8,
  tags: ['Trade-off question', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The notice board vs WhatsApp broadcast analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              <b>Strong consistency</b> is a single notice board everyone reads directly — post something and
              everyone sees the same version instantly. <b>Eventual consistency</b> is a WhatsApp broadcast — it
              takes a few seconds before every friend's phone shows the same message, but they all converge
              eventually.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This is a spectrum, not a binary — real systems pick different points on it depending on what a
              particular piece of data needs.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each model routes reads',
      blocks: [
        {
          k: 'diagram',
          el: <ConsistencyDiagram />,
          caption: 'Strong consistency funnels reads through the leader; eventual consistency lets any replica answer.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Strong consistency</b> usually routes reads through the leader/primary node, so every read reflects
              the latest write. This adds latency (extra hop, potential contention) and reduces availability during
              failover, since the leader is a bottleneck and a temporary single point of failure.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Eventual consistency</b> lets any replica answer reads immediately, without waiting for it to sync
              with the leader. This is fast and highly available, but accepts a short <b>staleness window</b> where
              different replicas can briefly disagree before converging.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Picking the model per feature',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Inventory count during checkout</b> needs strong consistency — reading a stale "in stock" value
              risks overselling.
            </>,
            <>
              A <b>"likes" counter</b> can be eventually consistent — off by one for a second is harmless and
              unnoticeable to users.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Pick the model per-feature, not per-system — most real products mix both. Claiming an entire system is
              "eventually consistent" without naming which specific reads tolerate staleness is a common gap in
              interview answers.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between strong and eventual consistency?',
      a: (
        <>
          Strong consistency guarantees every read returns the most recent write. Eventual consistency allows
          replicas to temporarily lag behind, converging to the same value only after some delay.
        </>
      ),
    },
    {
      q: 'Why does strong consistency add latency?',
      a: (
        <>
          Reads typically have to go through the leader/primary node to guarantee they see the latest write, adding
          an extra hop and potential contention compared to reading from the nearest replica.
        </>
      ),
    },
    {
      q: 'When would you choose eventual consistency over strong consistency?',
      a: (
        <>
          When brief staleness is harmless to the user — e.g. a like counter or view count — in exchange for lower
          latency and higher availability from letting any replica serve the read.
        </>
      ),
    },
    {
      q: 'Give an example where strong consistency is required.',
      a: <>Inventory count at checkout — a stale "in stock" read can cause overselling the same item to two buyers.</>,
    },
    {
      q: 'Does a real system have to pick one consistency model for everything?',
      a: (
        <>
          No — most production systems mix models per feature: strongly consistent for money/inventory paths,
          eventually consistent for counters, feeds, or recommendations.
        </>
      ),
    },
    {
      q: 'How does eventual consistency affect availability during a partition?',
      a: (
        <>
          It improves it — since any replica can answer without waiting to confirm it has the latest write, the
          system keeps serving reads even if some replicas are temporarily unreachable or lagging.
        </>
      ),
    },
  ],
};

export default topic;
