import { Arrow, Box, Cyl, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A small sorted index tree pointing straight at one row instead of scanning all of them. */
function IndexDiagram() {
  return (
    <Dg w={600} h={260} cap="An index narrows a lookup to one row instead of scanning the whole table">
      <Frame x={2} y={8} w={280} h={244} label="NO INDEX — full scan" c="n" />
      <Cyl x={62} y={40} w={160} h={90} label="listings" c="n" />
      <Txt x={142} y={150} fs={11} soft>
        checks every row
      </Txt>
      <Txt x={142} y={170} fs={11} soft>
        O(n)
      </Txt>
      <Arrow x1={142} y1={190} x2={142} y2={214} c="n" plain />
      <Txt x={142} y={230} fs={11} soft>
        found: 1 row
      </Txt>

      <Frame x={318} y={8} w={280} h={244} label="WITH INDEX on city" c="a" />
      <Box x={358} y={38} w={200} h={30} label="index: city (sorted)" c="a" fs={11} />
      <Arrow x1={458} y1={68} x2={458} y2={94} c="a" label="jumps straight in" dy={-6} />
      <Cyl x={378} y={96} w={160} h={90} label="listings" c="a" />
      <Txt x={458} y={206} fs={11} soft>
        O(log n)
      </Txt>
      <Txt x={458} y={226} fs={11} soft>
        found: 1 row
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'indexing',
  num: 13,
  unit: 'Data Layer',
  title: 'Indexing',
  blurb: 'A separate structure — usually a B-tree — that lets the database find rows without scanning the whole table.',
  minutes: 8,
  tags: ['Very common', 'Data modelling'],

  sections: [
    {
      id: 'analogy',
      heading: "The textbook index analogy",
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like the index at the back of a textbook — instead of flipping through every page to find
              "photosynthesis," you jump straight to page 142 because the index already told you where to look.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A database index does exactly that for a column: it keeps a sorted, searchable copy of that
              column's values, each pointing back to the full row.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How an index actually speeds things up',
      blocks: [
        {
          k: 'diagram',
          el: <IndexDiagram />,
          caption: 'Without an index every row is checked; with one, the lookup goes almost straight to the match.',
        },
        {
          k: 'p',
          text: (
            <>
              An index on a column stores sorted pointers to rows — usually as a <b>B-tree</b> — turning a linear
              O(n) table scan into a roughly O(log n) lookup. The database chooses to use an index automatically
              when a query filters or sorts on an indexed column.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This speed isn't free: every index has to be updated on every <b>write</b> (insert, update, delete)
              to that column, so indexes trade write performance and storage for read performance.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Choosing what to index',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Indexing <b>city</b> and <b>price</b> on a listings table makes "cars in Pune under ₹8L" fast.
            </>,
            <>
              A <b>composite index</b> on <code>(city, price)</code> beats two separate single-column indexes for
              that exact query, because the database can narrow by both columns in one pass.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Over-indexing a write-heavy table (e.g. a table receiving thousands of log inserts per second) can
              noticeably slow ingestion — index what you actually query, not every column that might be useful
              someday.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a database index and what problem does it solve?',
      a: (
        <>
          A separate sorted structure (typically a B-tree) mapping column values to row locations, so lookups on
          that column avoid scanning the whole table — turning O(n) into roughly O(log n).
        </>
      ),
    },
    {
      q: 'What is the cost of adding an index?',
      a: (
        <>
          Every write to an indexed column has to update the index too, so indexes slow down inserts/updates/
          deletes and use extra storage — reads get faster, writes get slower.
        </>
      ),
    },
    {
      q: 'When is a composite index better than two single-column indexes?',
      a: (
        <>
          When queries consistently filter on the same combination of columns together — e.g.{' '}
          <code>(city, price)</code> — a composite index lets the database narrow by both in one pass instead of
          intersecting two separate index scans.
        </>
      ),
    },
    {
      q: 'Why shouldn\'t you index every column?',
      a: (
        <>
          Each extra index adds write overhead and storage cost. On a write-heavy table, over-indexing can
          noticeably slow ingestion — you should index columns that are actually filtered or sorted on.
        </>
      ),
    },
    {
      q: 'What data structure do most relational database indexes use, and why?',
      a: (
        <>
          A B-tree, because it keeps data sorted and supports both equality and range queries in roughly
          logarithmic time while staying balanced under inserts and deletes.
        </>
      ),
    },
    {
      q: 'Does an index help a query that doesn\'t filter or sort on the indexed column?',
      a: <>No — an index only helps queries that touch the indexed column(s); it does nothing for unrelated lookups.</>,
    },
  ],
};

export default topic;
