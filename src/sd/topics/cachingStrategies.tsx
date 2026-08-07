import { Arrow, Box, Cyl, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Cache-aside: check the cache first, fall back to the database on a miss. */
function CachingDiagram() {
  return (
    <Dg w={560} h={240} cap="Cache-aside: the app checks the cache first and only hits the database on a miss">
      <Box x={20} y={90} w={110} h={60} label="App" c="n" fs={13} />

      <Arrow x1={130} y1={110} x2={230} y2={110} c="a" label="1. read" dy={-8} />
      <Box x={230} y={80} w={130} h={60} label="Cache" sub="Redis" c="a" fs={13} />

      <Arrow x1={230} y1={150} x2={130} y2={150} c="a" label="hit → return" dy={16} dx={-10} both={false} />

      <Arrow x1={360} y1={95} x2={440} y2={65} c="c" label="2. miss" dx={10} dy={-10} />
      <Cyl x={440} y={20} w={110} h={70} label="DB" c="c" />

      <Arrow x1={440} y1={90} x2={360} y2={125} c="c" label="3. populate" dx={0} dy={16} />

      <Txt x={280} y={200} fs={11} soft>
        next read for the same key is a cache hit
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'caching-strategies',
  num: 17,
  unit: 'Data Layer',
  title: 'Caching Strategies',
  blurb: 'Cache-aside, write-through, and write-back describe when the cache is populated relative to the database.',
  minutes: 9,
  tags: ['Very common', 'Performance'],

  sections: [
    {
      id: 'analogy',
      heading: 'The sticky note analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like writing today's most-asked answer on a sticky note on your desk, instead of digging through the
              file cabinet every single time someone asks the same question. The sticky note is fast to check —
              but it can go stale if the real answer changes.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A cache is exactly that sticky note: a small, fast store that holds copies of data that's expensive
              to fetch from the real source, trading a little staleness for a lot of speed.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'The three main caching patterns',
      blocks: [
        {
          k: 'diagram',
          el: <CachingDiagram />,
          caption: 'Cache-aside: check the cache first, fall back to the database on a miss, then populate the cache.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Cache-aside</b> (the most common): the app reads the cache first; on a miss, it reads the
              database and writes the result into the cache for next time. Simple and used almost everywhere.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Write-through</b>: every write goes to the cache and the database together, keeping them
              consistent, at the cost of slower writes. <b>Write-back</b>: a write hits the cache first and is
              flushed to the database later — fast writes, but data can be lost if the cache crashes before the
              flush happens.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Picking a strategy, and the classic hard problem',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Redis in front of Postgres for a listing's view count — <b>cache-aside</b> with a short TTL is
              enough; exact consistency isn't critical for a view counter.
            </>,
            <>A payments ledger would never use write-back caching — losing an un-flushed write is unacceptable there.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Cache invalidation on update is the classic hard problem — decide explicitly whether you{' '}
              <b>invalidate</b> the cached entry, <b>update</b> it in place, or just let the <b>TTL</b> expire and
              accept some staleness.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is cache-aside and why is it the most common pattern?',
      a: (
        <>
          The app reads the cache first, and on a miss reads the database and populates the cache for next time.
          It's common because it's simple, works with any cache and database, and only caches data that's
          actually being requested.
        </>
      ),
    },
    {
      q: 'Compare write-through and write-back caching.',
      a: (
        <>
          Write-through writes to cache and database together — consistent but slower writes. Write-back writes
          to the cache first and flushes to the database later — faster writes but risks data loss if the cache
          crashes before flushing.
        </>
      ),
    },
    {
      q: 'What is the "classic hard problem" in caching?',
      a: <>Cache invalidation — deciding when and how a stale cached value gets removed or refreshed after the underlying data changes.</>,
    },
    {
      q: 'Name three ways to handle a cached value going stale after an update.',
      a: <>Explicitly invalidate (delete) the entry, update it in place, or let a TTL expire it and accept temporary staleness.</>,
    },
    {
      q: 'Would you use write-back caching for a payments ledger? Why or why not?',
      a: (
        <>
          No — write-back risks losing a write if the cache crashes before flushing to the database, which is
          unacceptable for financial data that must be durable immediately.
        </>
      ),
    },
    {
      q: 'What does a cache trade off in exchange for speed?',
      a: <>Freshness — a cached value can be briefly out of date compared to the source of truth, which every caching strategy has to manage explicitly.</>,
    },
  ],
};

export default topic;
