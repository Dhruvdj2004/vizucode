import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A network partition forces a choice between staying consistent or staying available. */
function CapDiagram() {
  return (
    <Dg w={600} h={260} cap="During a network partition, a system must choose consistency or availability">
      <Box x={20} y={16} w={110} h={44} label="Node A" c="a" fs={12} />
      <Box x={470} y={16} w={110} h={44} label="Node B" c="a" fs={12} />
      <Txt x={300} y={26} fs={12} soft bold>
        Network partition
      </Txt>
      <Arrow x1={130} y1={38} x2={470} y2={38} c="n" dashed plain />
      <Txt x={300} y={44} fs={16} c="c" bold>
        ⚡
      </Txt>

      <Frame x={10} y={90} w={280} h={160} label="CP: consistency" c="b" />
      <Txt x={150} y={116} fs={11} soft>
        Node B unreachable →
      </Txt>
      <Box x={60} y={130} w={180} h={44} label="Reject / block request" c="b" fs={12} />
      <Txt x={150} y={196} fs={11} soft>
        never returns a stale value,
      </Txt>
      <Txt x={150} y={216} fs={11} soft>
        but may be unavailable
      </Txt>

      <Frame x={310} y={90} w={280} h={160} label="AP: availability" c="c" />
      <Txt x={450} y={116} fs={11} soft>
        Node B unreachable →
      </Txt>
      <Box x={360} y={130} w={180} h={44} label="Serve last known data" c="c" fs={12} />
      <Txt x={450} y={196} fs={11} soft>
        always responds,
      </Txt>
      <Txt x={450} y={216} fs={11} soft>
        but may be stale
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'cap-theorem',
  num: 4,
  unit: 'Foundations',
  title: 'CAP Theorem',
  blurb:
    'Under a network partition, a distributed system must choose Consistency or Availability — it cannot guarantee both at once.',
  minutes: 9,
  tags: ['Very common', 'Definition-heavy'],

  sections: [
    {
      id: 'analogy',
      heading: 'The lost-call analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Two friends planning a meetup lose network mid-call. One can either wait for the call to reconnect
              before deciding anything (<b>consistency</b>), or just go ahead with the last known plan (
              <b>availability</b>) — not both at once.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              CAP theorem formalises this trade-off for distributed systems: Consistency, Availability, and
              Partition tolerance can't all be guaranteed simultaneously once the network actually splits.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'Why the real choice is CP vs AP',
      blocks: [
        {
          k: 'diagram',
          el: <CapDiagram />,
          caption: 'When Node A can\'t reach Node B, it must either reject the request (CP) or serve stale data (AP).',
        },
        {
          k: 'p',
          text: (
            <>
              Partition tolerance is non-negotiable in any real distributed system — networks do fail, packets get
              dropped, links get cut — so a design can't opt out of it. That leaves the real choice as{' '}
              <b>CP</b> (reject or block requests until the system is consistent again) versus <b>AP</b> (keep
              serving requests, accepting that some reads may be stale until the partition heals).
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This is a per-partition, in-the-moment decision, not a permanent label on the whole system — most
              systems behave as both C and A simultaneously whenever the network is healthy.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'CP and AP in real systems',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <b>banking ledger</b> leans CP — better to reject a transfer than show a wrong balance during a
              partition.
            </>,
            <>
              A <b>product catalog</b> leans AP — a slightly stale price is better than the page not loading at
              all.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              CAP only applies during an actual partition; most of the time both C and A hold — don't over-apply the
              theorem to normal operation. Saying "this system is CP" as a blanket, always-on label is a common
              misuse in interviews.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does CAP theorem state?',
      a: (
        <>
          A distributed system can't simultaneously guarantee Consistency, Availability, and Partition tolerance.
          Since partitions are unavoidable in real networks, the practical choice during a partition is between
          consistency and availability.
        </>
      ),
    },
    {
      q: 'Why can\'t you just design around partition tolerance?',
      a: (
        <>
          Because network partitions are a physical reality — links fail, packets drop — in any real distributed
          system spanning more than one node or region. You can't opt out of handling them.
        </>
      ),
    },
    {
      q: 'What is the difference between a CP and an AP system?',
      a: (
        <>
          A CP system rejects or blocks requests during a partition to avoid returning inconsistent data. An AP
          system keeps serving requests during a partition, accepting that some responses may be stale.
        </>
      ),
    },
    {
      q: 'Give an example of a system that should be CP.',
      a: <>A banking or payments ledger — showing a wrong balance is worse than briefly rejecting a transfer.</>,
    },
    {
      q: 'Give an example of a system that should be AP.',
      a: <>A product catalog or content feed — serving a slightly stale price or post is better than a blank page.</>,
    },
    {
      q: 'Does CAP theorem apply all the time, even without a partition?',
      a: (
        <>
          No — it only forces a trade-off during an actual network partition. Most of the time, when the network is
          healthy, a system can be both consistent and available.
        </>
      ),
    },
  ],
};

export default topic;
