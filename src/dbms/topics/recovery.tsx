import { Dg, Txt } from '../dgm';
import type { DbmsTopic } from '../types';

/** Which transactions get redone and which get undone after a crash. */
function RecoveryTimeline() {
  // 'none' is the already-safe transaction: neutral surface fill, no accent.
  const PAINT: Record<string, [string, string]> = {
    none: ['var(--surface-3)', 'var(--ink-faint)'],
    redo: ['var(--accent-2-soft)', 'var(--accent-2)'],
    undo: ['var(--accent-3-soft)', 'var(--accent-3)'],
  };
  const bar = (y: number, x1: number, x2: number, label: string, kind: string, committed: boolean) => {
    const [fill, stroke] = PAINT[kind];
    return (
      <g key={label}>
        <text x={26} y={y + 14} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--ink)">
          {label}
        </text>
        <rect x={x1} y={y} width={x2 - x1} height={20} rx={5} fill={fill} stroke={stroke} strokeWidth="1.4" />
        {committed && <circle cx={x2} cy={y + 10} r={4.5} fill={stroke} />}
      </g>
    );
  };
  return (
    <Dg w={620} h={264} cap="After a crash: redo committed work, undo everything still in flight">
      <line x1={260} y1={36} x2={260} y2={212} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="5 4" />
      <Txt x={260} y={28} fs={10.5} bold c="a">
        checkpoint
      </Txt>
      <line x1={540} y1={36} x2={540} y2={212} stroke="var(--accent-3)" strokeWidth="1.6" />
      <Txt x={540} y={28} fs={10.5} bold c="c">
        ⚡ crash
      </Txt>

      {bar(46, 70, 190, 'T1', 'none', true)}
      {bar(78, 110, 330, 'T2', 'redo', true)}
      {bar(110, 300, 450, 'T3', 'redo', true)}
      {bar(142, 200, 540, 'T4', 'undo', false)}
      {bar(174, 400, 540, 'T5', 'undo', false)}

      <Txt x={550} y={60} anchor="start" fs={10} soft>
        nothing
      </Txt>
      <Txt x={550} y={92} anchor="start" fs={10} bold c="b">
        REDO
      </Txt>
      <Txt x={550} y={124} anchor="start" fs={10} bold c="b">
        REDO
      </Txt>
      <Txt x={550} y={156} anchor="start" fs={10} bold c="c">
        UNDO
      </Txt>
      <Txt x={550} y={188} anchor="start" fs={10} bold c="c">
        UNDO
      </Txt>

      <line x1={40} y1={212} x2={580} y2={212} stroke="var(--ink-faint)" strokeWidth="1.2" />
      <Txt x={310} y={232} fs={10.5} soft>
        T1 finished before the checkpoint, so its changes are already on disk
      </Txt>
      <Txt x={310} y={252} fs={10.5} soft>
        redo everything committed after the checkpoint · undo everything uncommitted
      </Txt>
    </Dg>
  );
}

const topic: DbmsTopic = {
  slug: 'recovery',
  num: 19,
  unit: 'Transactions & Concurrency',
  title: 'Crash Recovery & Logging',
  blurb:
    'Write-ahead logging, deferred vs immediate update, checkpoints, the undo/redo lists, ARIES and shadow paging — how a database survives losing power mid-write.',
  minutes: 13,
  tags: ['Very common'],

  sections: [
    {
      id: 'failures',
      heading: 'What can fail, and what storage survives it',
      blocks: [
        {
          k: 'table',
          head: ['Failure type', 'What happened', 'Recovery'],
          rows: [
            ['Transaction failure', 'Logical error, constraint violation, or chosen as a deadlock victim', 'Undo that one transaction from the log'],
            ['System crash', 'Power loss, OS panic — memory is gone, disk is intact', 'Redo committed transactions, undo uncommitted ones'],
            ['Media failure', 'The disk itself is damaged', 'Restore from backup, then replay the archived log'],
          ],
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Volatile storage</b> — RAM and CPU cache. Fast, and gone the instant power drops.
            </>,
            <>
              <b>Non-volatile storage</b> — disk and SSD. Survives a crash, but can still fail.
            </>,
            <>
              <b>Stable storage</b> — a theoretical ideal that never fails, approximated by replicating data across
              several independent disks or machines. The log is written here.
            </>,
          ],
        },
      ],
    },

    {
      id: 'log',
      heading: 'The log and write-ahead logging',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The <b>log</b> is a sequential record of every change, written to stable storage. It is the single
              mechanism behind both <b>atomicity</b> and <b>durability</b>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Log record types',
          code: `<T1, start>                  T1 began
<T1, A, 1000, 900>           T1 changed A from 1000 (old) to 900 (new)
<T1, commit>                 T1 committed
<T1, abort>                  T1 was rolled back
<checkpoint, {T2, T4}>       checkpoint; T2 and T4 were active at the time

The old value drives UNDO.  The new value drives REDO.`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The Write-Ahead Logging (WAL) rule',
          text: (
            <>
              <b>The log record must reach stable storage before the corresponding data page does</b>, and the{' '}
              <b>commit record must be on disk before the commit is acknowledged</b>. Break the first rule and a
              crash leaves a changed page with no way to undo it. Break the second and you tell the user "saved"
              for work that then disappears.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This is also why a database can be fast <i>and</i> durable: writing to the log is a{' '}
              <b>sequential append</b>, which is far cheaper than the random page writes it defers. The data pages
              trickle out to disk later, in the background.
            </>
          ),
        },
      ],
    },

    {
      id: 'update-modes',
      heading: 'Deferred vs immediate update',
      blocks: [
        {
          k: 'table',
          head: ['', 'Deferred update (NO-UNDO/REDO)', 'Immediate update (UNDO/REDO)'],
          rows: [
            ['When the database is modified', 'Only after the transaction commits', 'As soon as the operation runs, possibly before commit'],
            ['Log needs old values?', 'No — nothing was written yet', 'Yes — needed for undo'],
            ['Recovery on crash', 'REDO committed transactions. Uncommitted ones need nothing.', 'REDO committed, UNDO uncommitted'],
            ['Drawback', 'Every change is buffered until commit — impossible for large transactions', 'More complex recovery, and more logging'],
            ['Used in practice', 'Rare', 'Yes — this is what real systems do'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Remember them by what recovery has to do. <b>Deferred</b> = the database was never dirtied by an
              uncommitted transaction, so there is nothing to undo. <b>Immediate</b> = the buffer manager may have
              already flushed uncommitted changes, so undo is essential.
            </>
          ),
        },
      ],
    },

    {
      id: 'checkpoints',
      heading: 'Checkpoints',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Without checkpoints, recovery would have to scan the log back to the beginning of time. A{' '}
              <b>checkpoint</b> bounds that work.
            </>
          ),
        },
        {
          k: 'ol',
          items: [
            'Stop accepting new operations briefly (or, in a fuzzy checkpoint, do not stop at all).',
            'Flush all modified buffer pages to disk.',
            'Write a <checkpoint, list-of-active-transactions> record to the log.',
            'Resume.',
          ],
        },
        {
          k: 'p',
          text: (
            <>
              Anything committed <i>before</i> the checkpoint is guaranteed already on disk, so recovery never needs
              to look further back than the last checkpoint record.
            </>
          ),
        },
        { k: 'diagram', el: <RecoveryTimeline />, caption: 'The classic exam picture: five transactions, one checkpoint, one crash.' },
        {
          k: 'steps',
          items: [
            { t: 'T1 — committed before the checkpoint', d: 'Its changes were flushed by the checkpoint. Nothing to do.' },
            { t: 'T2 — started before, committed after', d: 'REDO. It committed, so its effects must be present, but they may not have reached disk.' },
            { t: 'T3 — started and committed after', d: 'REDO, for the same reason.' },
            { t: 'T4 — started before, still running at the crash', d: 'UNDO. It never committed, so every trace of it must be erased.' },
            { t: 'T5 — started after, still running at the crash', d: 'UNDO.' },
          ],
        },
        {
          k: 'code',
          title: 'Building the two lists',
          code: `Scan the log BACKWARD from the end to the last checkpoint:
    <Ti, commit> seen   →  add Ti to the REDO list
    <Ti, start>  seen and Ti not in REDO  →  add Ti to the UNDO list
Add every transaction listed as active in the checkpoint record
    to UNDO, unless it has since committed.

Then:
    UNDO the undo-list, scanning BACKWARD  (restore old values)
    REDO the redo-list, scanning FORWARD   (apply new values)

Undo first, then redo — that is the order ARIES uses in reverse:
analysis, redo, undo. Both orders appear in textbooks; know that
redo must repeat history and undo must run newest-first.`,
        },
      ],
    },

    {
      id: 'aries',
      heading: 'ARIES — the algorithm real systems use',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) is the standard industrial recovery
              algorithm. Three passes:
            </>
          ),
        },
        {
          k: 'steps',
          items: [
            {
              t: '1. Analysis',
              d: 'Scan forward from the last checkpoint to work out which transactions were active at the crash (the losers) and which pages were dirty.',
            },
            {
              t: '2. Redo — "repeat history"',
              d: 'Replay every logged change from the earliest dirty page onward, including changes made by transactions that will later be undone. This restores the exact state at the moment of the crash.',
            },
            {
              t: '3. Undo',
              d: 'Roll back the losers, newest change first, writing compensation log records (CLRs) as it goes so that a crash during recovery does not lose progress.',
            },
          ],
        },
        {
          k: 'ul',
          items: [
            <>
              Every log record has a monotonically increasing <b>LSN</b> (log sequence number), and each page stores
              the LSN of the last change applied to it — so redo can tell instantly whether a change is already
              reflected.
            </>,
            <>
              <b>Compensation log records</b> make undo itself restartable: recovery can crash and resume without
              undoing anything twice.
            </>,
            <>
              "Repeat history" sounds wasteful, but it means redo and undo need not reason about each other, which
              is what makes ARIES tractable.
            </>,
          ],
        },
      ],
    },

    {
      id: 'shadow',
      heading: 'Shadow paging',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A log-free alternative, worth knowing as a contrast. Two page tables are kept: the{' '}
              <b>shadow page table</b> (the consistent state at the transaction's start, on disk) and a{' '}
              <b>current page table</b>. A modified page is never overwritten — a copy is written elsewhere and the
              current table is repointed. Commit is a single atomic write making the current table the new shadow.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Advantage', 'Disadvantage'],
          rows: [
            ['Shadow paging', 'No log at all; recovery is instant — just keep the shadow table. Undo is free.', 'Data fragmentation as pages scatter; garbage collection needed; very hard to make work with concurrent transactions'],
            ['Log-based (WAL)', 'Works with high concurrency, sequential writes, fine-grained recovery', 'Recovery takes time; the log must be managed and archived'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Shadow paging lost because of <b>concurrency</b>, not correctness. Committing means swapping the root
              page table atomically, which is essentially a single-writer design. Real workloads have thousands of
              concurrent transactions, so WAL won.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is write-ahead logging?',
      a: (
        <>
          The rule that a change's <b>log record must reach stable storage before the modified data page does</b>,
          and that the <b>commit record must be on disk before the commit is acknowledged</b>. It is what makes
          atomicity and durability possible while still allowing data pages to be written lazily.
        </>
      ),
    },
    {
      q: 'What does a log record contain and why?',
      a: (
        <>
          The transaction id, the data item, the <b>old value</b> and the <b>new value</b>, plus start, commit and
          abort markers. The old value drives <b>undo</b>, the new value drives <b>redo</b>.
        </>
      ),
    },
    {
      q: 'What is a checkpoint and why is it needed?',
      a: (
        <>
          A point where all dirty buffer pages are flushed and a record listing the currently active transactions is
          written to the log. It bounds recovery: nothing before the last checkpoint ever needs to be examined,
          which is what keeps restart time from growing with the age of the database.
        </>
      ),
    },
    {
      q: 'After a crash, which transactions are redone and which are undone?',
      a: (
        <>
          Transactions with a <b>commit record</b> in the log after the last checkpoint are <b>redone</b> (their
          changes may not have reached disk). Transactions with a start but <b>no commit</b> are <b>undone</b>.
          Transactions that committed before the checkpoint need nothing.
        </>
      ),
    },
    {
      q: 'Difference between deferred and immediate update?',
      a: (
        <>
          <b>Deferred</b> writes to the database only after commit, so recovery never needs undo — only redo.{' '}
          <b>Immediate</b> allows uncommitted changes to reach disk, so recovery needs both undo and redo. Real
          systems use immediate update, because buffering every change until commit is impossible for large
          transactions.
        </>
      ),
    },
    {
      q: 'What are the three phases of ARIES?',
      a: (
        <>
          <b>Analysis</b> (find the losers and the dirty pages), <b>redo</b> (repeat history — replay every logged
          change to restore the exact crash state), then <b>undo</b> (roll back the losers newest-first, writing
          compensation log records so recovery is itself restartable).
        </>
      ),
    },
    {
      q: 'Why does ARIES redo changes made by transactions it is about to undo?',
      a: (
        <>
          "Repeat history" reconstructs the exact state at the crash, so undo can then work against a known
          consistent starting point. It removes the need for redo and undo to reason about each other, which is what
          makes the algorithm correct and restartable.
        </>
      ),
    },
    {
      q: 'What is shadow paging and why is it not widely used?',
      a: (
        <>
          A log-free scheme where modified pages are written to new locations and commit atomically swaps a page
          table. Recovery is instant, but it fragments the data, requires garbage collection, and — decisively — it
          does not support high concurrency, since commit means atomically swapping a single root structure.
        </>
      ),
    },
    {
      q: 'Why is writing to the log faster than writing the data pages?',
      a: (
        <>
          The log is a <b>sequential append</b> to one file, whereas data pages are scattered across the disk and
          require random I/O. Forcing one sequential write at commit is far cheaper than forcing many random ones,
          which is exactly why WAL exists.
        </>
      ),
    },
    {
      q: 'What happens if the system crashes during recovery?',
      a: (
        <>
          Recovery restarts from the beginning. It is designed to be <b>idempotent</b>: LSNs on each page let redo
          skip changes already applied, and compensation log records let undo resume without repeating work
          already undone.
        </>
      ),
    },
  ],
};

export default topic;
