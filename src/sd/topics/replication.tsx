import { Arrow, Cyl, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A leader taking writes and streaming them to followers that serve reads. */
function ReplicationDiagram() {
  return (
    <Dg w={600} h={260} cap="A leader database takes writes and streams changes to followers that serve reads">
      <Cyl x={220} y={20} w={160} h={80} label="Leader" c="a" />
      <Txt x={300} y={16} fs={11} soft>
        all writes go here
      </Txt>

      <Arrow x1={260} y1={100} x2={130} y2={160} c="b" label="replicate" dx={-30} dy={-4} />
      <Arrow x1={300} y1={100} x2={300} y2={160} c="b" label="replicate" dy={-6} />
      <Arrow x1={340} y1={100} x2={470} y2={160} c="b" label="replicate" dx={30} dy={-4} />

      <Cyl x={50} y={162} w={140} h={78} label="Follower 1" c="b" />
      <Cyl x={230} y={162} w={140} h={78} label="Follower 2" c="b" />
      <Cyl x={410} y={162} w={140} h={78} label="Follower 3" c="b" />

      <Txt x={120} y={252} fs={11} soft>
        reads served here
      </Txt>
      <Txt x={300} y={252} fs={11} soft>
        reads served here
      </Txt>
      <Txt x={480} y={252} fs={11} soft>
        reads served here
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'replication',
  num: 14,
  unit: 'Data Layer',
  title: 'Replication',
  blurb: 'Multiple copies of the same data live on different nodes, most commonly in a leader-follower arrangement.',
  minutes: 9,
  tags: ['Very common', 'Availability'],

  sections: [
    {
      id: 'analogy',
      heading: "The photocopied notes analogy",
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a teacher's notes photocopied for several assistant teachers — students can now ask any
              assistant instead of queuing up for the one original teacher, and the class survives even if the
              original teacher is out sick.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Replication exists for two reasons at once: spreading read load across more machines, and having a
              backup copy ready if one node fails.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How leader-follower replication works',
      blocks: [
        {
          k: 'diagram',
          el: <ReplicationDiagram />,
          caption: 'Writes go only to the leader; the leader streams changes to followers, which serve reads.',
        },
        {
          k: 'p',
          text: (
            <>
              All writes go to the <b>leader</b>. The leader streams every change to its <b>followers</b>, which
              apply the same changes and serve read traffic — this both spreads out read load and gives you
              standby copies if the leader dies.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Synchronous</b> replication waits for followers to confirm a write before acknowledging it —
              safer (no data loss on failover) but slower. <b>Asynchronous</b> replication doesn't wait — faster,
              but the last few writes can be lost if the leader crashes before followers catch up.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where reads and writes get routed',
      blocks: [
        {
          k: 'ul',
          items: [
            <>Read-heavy pages, like browsing listings, get routed to <b>followers</b> to spread out load.</>,
            <>Writes, like posting a new listing, always go to the <b>leader</b> — followers never accept writes directly.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Followers can lag behind the leader. A user who just wrote data and immediately re-reads it from a
              follower may not see their own write yet — this is <b>replication lag</b>, and it's a common source
              of confusing "my change disappeared" bugs.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is database replication and why is it used?',
      a: (
        <>
          Keeping multiple copies of the same data on different nodes, typically leader-follower, to spread read
          load across machines and provide a standby copy if a node fails.
        </>
      ),
    },
    {
      q: 'In leader-follower replication, where do writes go?',
      a: <>Only to the leader — followers receive changes by replicating from the leader, they never accept writes directly.</>,
    },
    {
      q: 'What is the difference between synchronous and asynchronous replication?',
      a: (
        <>
          Synchronous waits for followers to confirm before acknowledging the write — safer but slower.
          Asynchronous acknowledges immediately without waiting, which is faster but risks losing the last few
          writes if the leader crashes before followers catch up.
        </>
      ),
    },
    {
      q: 'What is replication lag, and why does it matter?',
      a: (
        <>
          The delay between a write landing on the leader and it being visible on a follower. It matters because
          a user reading from a follower right after writing may not see their own change yet.
        </>
      ),
    },
    {
      q: 'How would you fix a "read your own write" problem caused by replication lag?',
      a: (
        <>
          Route that user's immediate follow-up read to the leader (or a follower known to be caught up), or add
          a short client-side delay/sticky session before falling back to followers.
        </>
      ),
    },
    {
      q: 'Does replication alone solve horizontal write scaling?',
      a: (
        <>
          No — replication scales reads (more followers to serve from) but all writes still funnel through one
          leader. Scaling writes requires sharding instead.
        </>
      ),
    },
  ],
};

export default topic;
