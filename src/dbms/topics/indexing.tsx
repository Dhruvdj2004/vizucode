import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Dense index vs sparse index. */
function DenseVsSparse() {
  // Keys must include the coordinates: the same label appears in both panels,
  // and React checks key uniqueness across all siblings of the <Dg>.
  const idx = (x: number, y: number, k: string) => (
    <Box key={`i${x}-${y}`} x={x} y={y} w={56} h={26} label={k} c="a" fs={11} r={4} />
  );
  const rec = (x: number, y: number, t: string) => (
    <Box key={`r${x}-${y}`} x={x} y={y} w={116} h={22} label={t} c="b" fs={10.5} r={4} />
  );

  return (
    <Dg w={620} h={300} cap="A dense index has one entry per record; a sparse index has one per block">
      <Frame x={2} y={8} w={300} h={284} label="DENSE INDEX" c="a" />
      {idx(24, 48, '10')}
      {idx(24, 84, '20')}
      {idx(24, 120, '30')}
      {idx(24, 156, '40')}
      {rec(170, 50, '10  Riya')}
      {rec(170, 86, '20  Arjun')}
      {rec(170, 122, '30  Meera')}
      {rec(170, 158, '40  Kabir')}
      {[61, 97, 133, 169].map((y) => (
        <Arrow key={y} x1={82} y1={y} x2={166} y2={y} c="n" />
      ))}
      <Txt x={150} y={216} fs={11} bold c="a">
        one entry per record
      </Txt>
      <Txt x={150} y={238} fs={10.5} soft>
        larger index, but a hit is
      </Txt>
      <Txt x={150} y={254} fs={10.5} soft>
        answered without scanning
      </Txt>
      <Txt x={150} y={276} fs={10.5} soft>
        works on unsorted data too
      </Txt>

      <Frame x={318} y={8} w={300} h={284} label="SPARSE INDEX" c="b" />
      {idx(340, 60, '10')}
      {idx(340, 132, '30')}
      <Frame x={470} y={44} w={132} h={64} label="block 1" c="b" />
      {rec(478, 62, '10  Riya')}
      {rec(478, 86, '20  Arjun')}
      <Frame x={470} y={116} w={132} h={64} label="block 2" c="b" />
      {rec(478, 134, '30  Meera')}
      {rec(478, 158, '40  Kabir')}
      <Arrow x1={398} y1={73} x2={466} y2={73} c="n" />
      <Arrow x1={398} y1={145} x2={466} y2={145} c="n" />
      <Txt x={468} y={216} fs={11} bold c="b">
        one entry per block
      </Txt>
      <Txt x={468} y={238} fs={10.5} soft>
        much smaller index, but you
      </Txt>
      <Txt x={468} y={254} fs={10.5} soft>
        must scan inside the block
      </Txt>
      <Txt x={468} y={276} fs={10.5} soft>
        requires the data to be sorted
      </Txt>
    </Dg>
  );
}

/** Clustered index follows the physical order; non-clustered does not. */
function ClusteredVsNot() {
  const idx = (x: number, y: number, k: string, c: 'a' | 'b') => (
    <Box key={`i${x}-${y}`} x={x} y={y} w={54} h={28} label={k} c={c} fs={11} r={4} />
  );
  const row = (x: number, y: number, t: string) => (
    <Box key={`r${x}-${y}`} x={x} y={y} w={116} h={28} label={t} c="n" fs={11} r={4} />
  );
  return (
    <Dg w={620} h={268} cap="Clustered: index order equals physical order. Non-clustered: the arrows cross.">
      <Frame x={2} y={8} w={300} h={252} label="CLUSTERED" c="b" />
      {idx(26, 50, '10', 'b')}
      {idx(26, 92, '20', 'b')}
      {idx(26, 134, '30', 'b')}
      {row(160, 50, 'row 10')}
      {row(160, 92, 'row 20')}
      {row(160, 134, 'row 30')}
      {[64, 106, 148].map((y) => (
        <Arrow key={y} x1={82} y1={y} x2={156} y2={y} c="b" />
      ))}
      <Txt x={150} y={196} fs={10.5} soft>
        data is physically in key order
      </Txt>
      <Txt x={150} y={216} fs={10.5} soft>
        range scans read consecutive blocks
      </Txt>
      <Txt x={150} y={240} fs={10.5} bold c="b">
        only one per table
      </Txt>

      <Frame x={318} y={8} w={300} h={252} label="NON-CLUSTERED" c="a" />
      {idx(342, 50, '10', 'a')}
      {idx(342, 92, '20', 'a')}
      {idx(342, 134, '30', 'a')}
      {row(476, 50, 'row 30')}
      {row(476, 92, 'row 10')}
      {row(476, 134, 'row 20')}
      <Arrow x1={398} y1={64} x2={472} y2={106} c="a" />
      <Arrow x1={398} y1={106} x2={472} y2={148} c="a" />
      <Arrow x1={398} y1={148} x2={472} y2={64} c="a" />
      <Txt x={466} y={196} fs={10.5} soft>
        data order is unrelated to the index
      </Txt>
      <Txt x={466} y={216} fs={10.5} soft>
        each match costs an extra lookup
      </Txt>
      <Txt x={466} y={240} fs={10.5} bold c="a">
        many per table
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'indexing',
  num: 21,
  unit: 'Storage & Performance',
  title: 'Indexing',
  blurb:
    'Dense vs sparse, primary vs secondary, clustered vs non-clustered, multilevel indexes, composite key ordering, and when an index makes things slower.',
  minutes: 14,
  tags: ['Very common', 'Practical'],

  sections: [
    {
      id: 'why',
      heading: 'What an index is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              An <b>index</b> is an auxiliary structure that maps a search key to the location of the matching
              records. It is exactly the index at the back of a textbook: a small sorted thing you search first, so
              you do not have to read every page.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Every index entry is a pair <code>(search key, pointer)</code>. Because the index is far smaller than
              the table and is kept ordered, finding the pointer costs a handful of I/Os instead of a full scan.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              An index is <b>redundant data</b>. It speeds up reads and slows down every insert, update and delete,
              because the index must be maintained too. That trade-off is the entire subject.
            </>
          ),
        },
      ],
    },

    {
      id: 'dense-sparse',
      heading: 'Dense vs sparse',
      blocks: [
        { k: 'diagram', el: <DenseVsSparse />, caption: 'The same data, indexed two ways.' },
        {
          k: 'table',
          head: ['', 'Dense index', 'Sparse index'],
          rows: [
            ['Entries', 'One per search-key value', 'One per block'],
            ['Size', 'Large', 'Small — may fit in memory'],
            ['Lookup', 'Answered directly from the index', 'Find the largest key ≤ target, then scan inside that block'],
            ['Requires sorted data?', 'No', 'Yes — the data file must be ordered on the key'],
            ['Can answer "does this key exist?" alone', 'Yes', 'No — you must read the block'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              A sparse index is only possible when the file is <b>sorted on that key</b> — which is why you can have
              a sparse index on the clustering key but every secondary index must be <b>dense</b>.
            </>
          ),
        },
      ],
    },

    {
      id: 'types',
      heading: 'Primary, clustering and secondary',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Primary index</b> — built on the ordering key of a sorted file, where that key is also unique
              (usually the primary key). Can be sparse.
            </>,
            <>
              <b>Clustering index</b> — built on the ordering field when it is <b>not</b> unique, e.g. a file sorted
              by department. One entry per distinct value, pointing at the first record with it.
            </>,
            <>
              <b>Secondary index</b> — built on any other field. The data is not sorted on it, so it must be{' '}
              <b>dense</b>, and there can be many per table.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              A file can have <b>at most one</b> primary/clustering index, because it can only be physically sorted
              one way. It can have <b>as many secondary indexes as you like</b> — that asymmetry is the point of the
              question.
            </>
          ),
        },
      ],
    },

    {
      id: 'clustered',
      heading: 'Clustered vs non-clustered',
      blocks: [
        { k: 'diagram', el: <ClusteredVsNot />, caption: 'In a clustered index the leaf level is the table itself.' },
        {
          k: 'table',
          head: ['', 'Clustered', 'Non-clustered'],
          rows: [
            ['Physical row order', 'Matches the index order', 'Unrelated to the index'],
            ['How many per table', 'One', 'Many'],
            ['What the leaf holds', 'The full row itself', 'A pointer (row id, or the clustered key)'],
            ['Range queries', 'Very fast — consecutive blocks', 'Slow — one random lookup per match'],
            ['Extra lookup needed?', 'No', 'Yes, unless the index covers the query'],
            ['Insert cost', 'Higher — rows must go in the right place, causing page splits', 'Lower'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              In InnoDB the primary key <i>is</i> the clustered index, and every secondary index stores the primary
              key as its pointer — so a secondary lookup costs two traversals. In SQL Server you choose the
              clustered index explicitly. In PostgreSQL all indexes are non-clustered; <code>CLUSTER</code> is a
              one-off physical reordering that is not maintained.
            </>
          ),
        },
      ],
    },

    {
      id: 'multilevel',
      heading: 'Multilevel indexes',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              An index is itself a file. If it is too big to search cheaply, index the index — and keep going until
              the top level fits in one block.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Why it collapses the cost',
          code: `1,000,000 records · 100 index entries per block

single-level index    10,000 index blocks
                      binary search ≈ log2(10 000) ≈ 14 I/Os

two-level index       10,000 → 100 second-level blocks
                      → 1 top block
                      3 I/Os to reach the record

Each extra level divides the search space by the fan-out.
That is exactly what a B+ tree automates.`,
        },
        {
          k: 'p',
          text: (
            <>
              A static multilevel index degrades as the data changes, because inserts overflow. The <b>B+ tree</b>{' '}
              is the dynamic version that rebalances itself — which is why it, and not this, is what real databases
              build.
            </>
          ),
        },
      ],
    },

    {
      id: 'composite',
      heading: 'Composite indexes and the leftmost prefix rule',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              An index on <code>(a, b, c)</code> sorts by a, then b within equal a, then c. That ordering decides
              which queries it can serve.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Index on (dept, salary, name)',
          code: `USES THE INDEX
    dept = 'CSE'                              ← leftmost prefix
    dept = 'CSE' AND salary > 50000           ← prefix + range on the next column
    dept = 'CSE' AND salary = 60000 AND name = 'Riya'

CANNOT USE IT (or only partially)
    salary > 50000                            ← skips dept, the leading column
    name = 'Riya'                             ← no prefix at all
    dept = 'CSE' AND name = 'Riya'            ← uses dept only; name is
                                                 unusable because salary was skipped`,
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Column order rule of thumb',
          text: (
            <>
              Put <b>equality</b> columns first, then the <b>range</b> column, then anything you only want for
              covering. Once a range predicate is used, columns after it in the index cannot narrow the search
              further.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>covering index</b> is one that contains every column the query needs, so the engine never touches
              the table at all. It is often the single biggest win available on a hot read path.
            </>
          ),
        },
      ],
    },

    {
      id: 'costs',
      heading: 'When an index hurts',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Write-heavy tables</b> — every insert must also insert into every index. Ten indexes means eleven
              structures maintained per row.
            </>,
            <>
              <b>Low-selectivity columns</b> — an index on a boolean or a gender column matches half the table; the
              optimizer will correctly ignore it and scan instead, so you paid for it and got nothing.
            </>,
            <>
              <b>Small tables</b> — if the whole table is two blocks, scanning is cheaper than any index traversal.
            </>,
            <>
              <b>Queries returning a large fraction of rows</b> — beyond roughly 10–20% of the table, a full scan
              (sequential I/O) beats many random index lookups.
            </>,
            <>
              <b>Functions on the indexed column</b> — <code>WHERE YEAR(dob) = 2003</code> cannot use an index on{' '}
              <code>dob</code>, because the index stores <code>dob</code>, not <code>YEAR(dob)</code>. Rewrite it as
              a range, or build a functional index.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Selectivity',
          text: (
            <>
              <b>Selectivity</b> = distinct values ÷ total rows. High selectivity (an email column) makes a great
              index; low selectivity (a status flag with three values) makes a useless one. If asked "should I index
              this column?", the answer starts with selectivity and the read/write ratio.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is an index and what does it cost?',
      a: (
        <>
          An auxiliary (search key → location) structure that lets the DBMS find rows without scanning the table.
          It costs extra storage and slows every insert, update and delete, since the index must be kept in sync.
        </>
      ),
    },
    {
      q: 'Dense vs sparse index?',
      a: (
        <>
          A <b>dense</b> index has one entry per search-key value — bigger, but it answers existence directly and
          works on unsorted data. A <b>sparse</b> index has one entry per block — much smaller, but it requires the
          file to be sorted on that key and you must scan inside the block after the lookup.
        </>
      ),
    },
    {
      q: 'Why must a secondary index always be dense?',
      a: (
        <>
          Because the data file is not sorted on the secondary key. A sparse index works by finding the largest key
          ≤ the target and scanning forward, which only makes sense on ordered data. With no ordering, every value
          needs its own entry.
        </>
      ),
    },
    {
      q: 'Clustered vs non-clustered index?',
      a: (
        <>
          A <b>clustered</b> index determines the physical order of the rows, so its leaf level <i>is</i> the table;
          there can be only one, and range scans are very fast. A <b>non-clustered</b> index is a separate structure
          holding pointers; you can have many, but each match needs an extra lookup into the table unless the index
          covers the query.
        </>
      ),
    },
    {
      q: 'How many clustered indexes can a table have, and why?',
      a: (
        <>
          Exactly one, because a table can only be physically sorted in one order. Secondary (non-clustered) indexes
          are unlimited since they are independent structures.
        </>
      ),
    },
    {
      q: 'What is a covering index?',
      a: (
        <>
          One that contains every column a query references, so the engine answers entirely from the index and never
          reads the table. It eliminates the random-lookup step that usually dominates a non-clustered index scan.
        </>
      ),
    },
    {
      q: 'Explain the leftmost prefix rule.',
      a: (
        <>
          A composite index on <code>(a, b, c)</code> is sorted by a, then b, then c. It can serve queries filtering
          on <code>a</code>, on <code>(a, b)</code>, or on <code>(a, b, c)</code> — but not on <code>b</code> or{' '}
          <code>c</code> alone, because without a value for <code>a</code> the matching entries are scattered
          throughout the index.
        </>
      ),
    },
    {
      q: 'When is an index a bad idea?',
      a: (
        <>
          On write-heavy tables, on low-selectivity columns like flags, on very small tables, and for queries that
          return a large fraction of the rows — beyond roughly 10–20% a sequential full scan beats many random
          lookups.
        </>
      ),
    },
    {
      q: 'Why does a function on an indexed column defeat the index?',
      a: (
        <>
          The index stores the raw column values in sorted order. <code>YEAR(dob)</code> is a different value with a
          different ordering, so the DBMS cannot navigate the tree with it. The fix is to rewrite the predicate as a
          range on the raw column, or to create a functional / expression index.
        </>
      ),
    },
    {
      q: 'What is selectivity and why does it matter?',
      a: (
        <>
          The ratio of distinct values to total rows. High selectivity means a lookup returns few rows, which is
          exactly when an index pays off. Low selectivity means a large fraction matches, and the optimizer will
          prefer a sequential scan — so the index is dead weight.
        </>
      ),
    },
  ],
};

export default topic;
