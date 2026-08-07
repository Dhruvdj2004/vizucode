import { Box, Dg, Frame, Rel, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A rigid relation grid next to a handful of free-shaped documents. */
function SqlVsNosqlDiagram() {
  return (
    <Dg w={600} h={260} cap="A fixed-schema SQL table next to free-form NoSQL documents with different fields">
      <Frame x={2} y={8} w={280} h={244} label="SQL — fixed schema" c="a" />
      <Rel
        x={30}
        y={40}
        title="users"
        cols={['id', 'name', 'city']}
        rows={[
          ['1', 'Asha', 'Pune'],
          ['2', 'Ravi', 'Delhi'],
        ]}
        cw={72}
        c="a"
        pk={[0]}
      />
      <Txt x={142} y={180} fs={11} soft>
        every row has the same columns
      </Txt>

      <Frame x={318} y={8} w={280} h={244} label="NOSQL — flexible shape" c="b" />
      <Box x={338} y={40} w={110} h={64} label="doc 1" sub="{name, city}" c="b" fs={12} />
      <Box x={458} y={40} w={110} h={64} label="doc 2" sub="{name, tags[]}" c="b" fs={12} />
      <Box x={398} y={120} w={110} h={64} label="doc 3" sub="{name, addr:{}}" c="b" fs={12} />
      <Txt x={458} y={210} fs={11} soft>
        each document can differ
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'sql-vs-nosql',
  num: 12,
  unit: 'Data Layer',
  title: 'SQL vs NoSQL',
  blurb:
    'SQL gives strong schema, relations, and joins; NoSQL trades schema rigidity for horizontal scale and flexible data shapes.',
  minutes: 9,
  free: true,
  tags: ['Very common', 'Data modelling'],

  sections: [
    {
      id: 'analogy',
      heading: 'The register vs the diary analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              SQL is a strict school register with fixed columns — name, roll no, class — every row must fill in
              every column the same way. NoSQL is like a personal diary where every page is free to have its own
              format: one page is a list, another a paragraph, another a sketch.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Neither is "better" in the abstract — they optimise for different things: SQL optimises for
              relationships and correctness guarantees, NoSQL optimises for flexible shapes and horizontal scale.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each actually stores data',
      blocks: [
        {
          k: 'diagram',
          el: <SqlVsNosqlDiagram />,
          caption: 'SQL rows all share one schema; NoSQL documents can each carry different fields.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>SQL databases</b> (Postgres, MySQL) enforce a fixed schema up front and support multi-table{' '}
              <b>joins</b> with <b>ACID</b> transactions — strong guarantees, at the cost of needing a migration
              whenever the shape of the data changes.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>NoSQL</b> comes in several flavours, each tuned to a different access pattern rather than joins:
              document stores (MongoDB) for nested, evolving objects; key-value stores (DynamoDB, Redis) for
              simple fast lookups; wide-column stores (Cassandra) for huge write-heavy tables; graph databases
              (Neo4j) for traversing relationships directly.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Choosing between them',
      blocks: [
        {
          k: 'table',
          head: ['Aspect', 'SQL', 'NoSQL'],
          rows: [
            ['Schema', 'Fixed, enforced upfront', 'Flexible, per-record'],
            ['Joins', 'First-class, multi-table', 'Usually avoided/denormalised'],
            ['Scaling', 'Mostly vertical, shardable with effort', 'Built for horizontal scale'],
            ['Consistency', 'Strong (ACID) by default', 'Often eventual, tunable'],
            ['Best for', 'Transactions, relational data', 'High write volume, evolving shapes'],
          ],
        },
        {
          k: 'ul',
          items: [
            <>
              Bookings and payments belong in <b>SQL</b> — they need multi-table transactions that either fully
              commit or fully roll back.
            </>,
            <>
              A product catalog where every category has different attributes (a shirt has "size", a laptop has
              "RAM") fits a <b>document store</b> more naturally than dozens of nullable SQL columns.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              "NoSQL is more scalable" is not automatically true — a well-sharded SQL database also scales. The
              real question is your access pattern and consistency needs, not a blanket scalability claim.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the core trade-off between SQL and NoSQL?',
      a: (
        <>
          SQL gives a fixed schema, relational joins, and strong ACID guarantees. NoSQL trades schema rigidity for
          flexible data shapes and easier horizontal scaling, usually with weaker default consistency.
        </>
      ),
    },
    {
      q: 'Name the main NoSQL categories and give an example database for each.',
      a: (
        <>
          Document (MongoDB), key-value (DynamoDB/Redis), wide-column (Cassandra), and graph (Neo4j) — each tuned
          to a different access pattern.
        </>
      ),
    },
    {
      q: 'Why would you pick SQL for a payments system?',
      a: (
        <>
          Payments need multi-table transactions (deduct wallet, create order) that must either fully commit or
          fully roll back — that's exactly what ACID transactions in a SQL database guarantee.
        </>
      ),
    },
    {
      q: 'Is "NoSQL scales better than SQL" a correct statement?',
      a: (
        <>
          Not as a blanket claim. A well-sharded SQL database also scales horizontally; the real deciding factor
          is your access pattern and consistency requirements, not scalability alone.
        </>
      ),
    },
    {
      q: 'When does a document store fit better than a normalised SQL schema?',
      a: (
        <>
          When records in the same collection naturally have different fields — e.g. a product catalog where each
          category has different attributes — avoiding a table full of mostly-null columns.
        </>
      ),
    },
    {
      q: 'What do NoSQL databases typically give up compared to SQL?',
      a: <>Strong multi-record joins and, often, strict ACID consistency — many default to eventual consistency in exchange for scale.</>,
    },
  ],
};

export default topic;
