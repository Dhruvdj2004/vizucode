import { Arrow, Box, Cyl, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A wallet debit + order creation, committed together or rolled back together. */
function AcidDiagram() {
  return (
    <Dg w={560} h={240} cap="A transaction bundles a debit and a credit so both commit together, or neither does">
      <Frame x={30} y={10} w={330} h={160} label="TRANSACTION" c="a" />
      <Box x={50} y={40} w={140} h={56} label="Debit wallet" sub="-₹500" c="a" fs={12} />
      <Box x={220} y={40} w={120} h={56} label="Create order" c="a" fs={12} />
      <Txt x={195} y={68} fs={16} bold soft>
        +
      </Txt>
      <Txt x={195} y={132} fs={11} soft>
        all-or-nothing
      </Txt>

      <Arrow x1={195} y1={172} x2={195} y2={200} c="a" label="commit" dy={-8} />
      <Cyl x={130} y={202} w={130} h={30} label="DB" c="a" />

      <Arrow x1={370} y1={90} x2={430} y2={90} c="c" label="on failure" dashed dy={-8} />
      <Box x={430} y={62} w={110} h={56} label="Rollback" sub="nothing applied" c="c" fs={12} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'acid-transactions',
  num: 18,
  unit: 'Data Layer',
  title: 'ACID Transactions',
  blurb: 'Atomicity, Consistency, Isolation, Durability — the guarantees a database transaction gives you.',
  minutes: 9,
  tags: ['Very common', 'Definition-heavy'],

  sections: [
    {
      id: 'analogy',
      heading: 'The ATM withdrawal analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like an ATM withdrawal — either the cash comes out AND your balance drops, or neither happens. It
              never dispenses cash without deducting your account, and it never deducts your account without
              dispensing cash.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>transaction</b> groups multiple operations into one unit; ACID is the set of promises the
              database makes about how that unit behaves.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'What each letter actually guarantees',
      blocks: [
        {
          k: 'diagram',
          el: <AcidDiagram />,
          caption: 'Two writes bundled into one transaction — both commit together, or the whole thing rolls back.',
        },
        {
          k: 'table',
          head: ['Letter', 'Guarantee'],
          rows: [
            ['Atomicity', 'All operations in the transaction succeed, or none do'],
            ['Consistency', 'The database only moves between valid states, respecting its constraints'],
            ['Isolation', "Concurrent transactions don't see each other's half-finished work"],
            ['Durability', 'Once committed, a write survives a crash immediately after'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              <b>Atomicity</b> is the all-or-nothing execution. <b>Consistency</b> means the database moves
              between valid states only, never violating its own constraints. <b>Isolation</b> means concurrent
              transactions don't see each other's half-finished work. <b>Durability</b> means once a transaction
              commits, the write survives a crash right after.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where ACID matters, and where it stops applying',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Deducting a buyer's wallet balance and creating an order record must happen atomically — either
              both succeed or neither does, otherwise you could charge a buyer with no order created.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Distributed transactions across services don't get ACID for free — a single database transaction
              can't span two microservices' separate databases. That's why patterns like the <b>Saga</b> pattern
              exist to approximate cross-service consistency.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does each letter in ACID guarantee?',
      a: (
        <>
          Atomicity: all-or-nothing execution. Consistency: only valid states are ever committed. Isolation:
          concurrent transactions don't observe each other's half-finished work. Durability: a committed write
          survives a crash.
        </>
      ),
    },
    {
      q: 'Give a concrete example of why atomicity matters.',
      a: (
        <>
          Deducting a buyer's wallet and creating an order must both succeed or both fail — otherwise a buyer
          could be charged with no order created, or an order created with no payment taken.
        </>
      ),
    },
    {
      q: 'What does isolation protect against?',
      a: <>Two concurrent transactions reading or overwriting each other's uncommitted, in-progress changes, which could produce corrupted or inconsistent results.</>,
    },
    {
      q: 'Do ACID guarantees extend across microservices automatically?',
      a: (
        <>
          No — a single ACID transaction is scoped to one database. Cross-service consistency needs a different
          approach, like the Saga pattern, which coordinates a sequence of local transactions with compensating
          actions on failure.
        </>
      ),
    },
    {
      q: 'What is durability protecting against specifically?',
      a: <>Losing a committed write if the database crashes immediately afterward — durability guarantees it's already safely persisted before the commit is acknowledged.</>,
    },
    {
      q: 'How does consistency in ACID differ from consistency in the CAP theorem?',
      a: (
        <>
          ACID consistency means transactions keep the database within its own defined constraints (e.g. foreign
          keys, uniqueness). CAP consistency means every read sees the latest write across replicas — a
          distributed-systems property, not a single-node integrity rule.
        </>
      ),
    },
  ],
};

export default topic;
