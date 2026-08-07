import { Arrow, Box, Cyl, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A router sends each write to the one shard that owns its key range. */
function ShardingDiagram() {
  return (
    <Dg w={600} h={260} cap="A router directs each write to the shard that owns that row's shard key">
      <Box x={230} y={20} w={140} h={50} label="Router" sub="by shard key: city" c="n" fs={13} />

      <Arrow x1={280} y1={70} x2={130} y2={130} c="a" label="Mumbai" dx={-24} dy={-6} />
      <Arrow x1={300} y1={70} x2={300} y2={130} c="b" label="Delhi" dy={-6} />
      <Arrow x1={320} y1={70} x2={470} y2={130} c="c" label="Pune" dx={24} dy={-6} />

      <Cyl x={50} y={132} w={140} h={90} label="Shard 1" c="a" />
      <Cyl x={230} y={132} w={140} h={90} label="Shard 2" c="b" />
      <Cyl x={410} y={132} w={140} h={90} label="Shard 3" c="c" />

      <Txt x={120} y={238} fs={11} soft>
        holds Mumbai rows
      </Txt>
      <Txt x={300} y={238} fs={11} soft>
        holds Delhi rows
      </Txt>
      <Txt x={480} y={238} fs={11} soft>
        holds Pune rows
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'sharding-partitioning',
  num: 15,
  unit: 'Data Layer',
  title: 'Sharding / Partitioning',
  blurb: 'Splits one logical dataset across multiple databases by a shard key, so no single node holds everything.',
  minutes: 10,
  tags: ['Very common', 'Scale'],

  sections: [
    {
      id: 'analogy',
      heading: 'The city-wise phone book analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like splitting one giant national phone book into separate city-wise books, so "Mumbai" entries
              aren't tangled up with "Delhi" entries in the same fat volume — each book is smaller, faster to
              search, and can be printed independently.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Sharding solves what replication can't: replication copies the whole dataset onto more machines,
              but sharding actually splits the dataset so each machine only holds a slice of it.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How a shard key decides where a row lives',
      blocks: [
        {
          k: 'diagram',
          el: <ShardingDiagram />,
          caption: 'A router uses the shard key to send each row to the one database that owns it.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>shard key</b> (e.g. city, seller ID, user ID) determines which physical database a row lives
              on. Every read or write for that row is routed to that one shard, so no single machine ever has to
              hold — or query — the entire dataset.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Range-based</b> sharding (e.g. A–M on shard 1, N–Z on shard 2) is simple and keeps ranges
              together, but can create <b>hot shards</b> if data isn't evenly distributed. <b>Hash-based</b>{' '}
              sharding runs the key through a hash function to distribute rows evenly, but makes range queries
              across shards expensive since related rows scatter across every shard.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'The cost of getting the shard key wrong',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Sharding a listings database by city means "cars in Mumbai" hits exactly one shard — fast — but
              "cheapest car nationwide" now has to query <b>every shard</b> and merge the results in the
              application layer.
            </>,
            <>A celebrity seller with 10x the listings of anyone else can turn their shard into a hot shard under range-based sharding.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Resharding later — because one shard grew too large or too hot — is one of the most expensive
              operations in a system's life, often requiring live data migration. Choose the shard key carefully
              upfront based on your actual access patterns.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is sharding and how is it different from replication?',
      a: (
        <>
          Sharding splits a dataset across multiple databases so each holds only a slice of the data (scales
          writes and storage). Replication copies the whole dataset onto more machines (scales reads and
          availability). They're often combined.
        </>
      ),
    },
    {
      q: 'What is a shard key and why does choosing it matter?',
      a: (
        <>
          The column that determines which shard a row lives on. A poor choice creates hot shards or makes common
          queries scatter across every shard; resharding later to fix it is very expensive.
        </>
      ),
    },
    {
      q: 'Compare range-based and hash-based sharding.',
      a: (
        <>
          Range-based keeps related keys together (good for range queries) but risks hot shards if data isn't
          evenly distributed. Hash-based distributes load evenly but scatters related rows, making
          cross-shard range queries expensive.
        </>
      ),
    },
    {
      q: 'Why is a query like "cheapest car nationwide" expensive on a sharded database?',
      a: (
        <>
          Because the shard key (city) doesn't align with the query — it has to fan out to every shard, collect
          results, and merge them in the application layer instead of hitting one database.
        </>
      ),
    },
    {
      q: 'What is a hot shard?',
      a: <>A shard receiving disproportionately more traffic or data than others, becoming a bottleneck even though the cluster overall has spare capacity.</>,
    },
    {
      q: 'Why is resharding considered risky/expensive?',
      a: (
        <>
          It usually means migrating live data between shards while the system keeps serving traffic, requiring
          careful dual-write or copy-then-cutover strategies to avoid data loss or downtime.
        </>
      ),
    },
  ],
};

export default topic;
