import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** Two threads each holding one lock and waiting on the other's lock — a deadlock cycle. */
function DeadlockDiagram() {
  return (
    <Dg w={600} h={260} cap="Thread A holds Lock 1 and waits for Lock 2; Thread B holds Lock 2 and waits for Lock 1">
      <Box x={40} y={40} w={140} h={54} label="Thread A" c="a" fs={13} />
      <Box x={420} y={40} w={140} h={54} label="Thread B" c="b" fs={13} />
      <Box x={40} y={170} w={140} h={54} label="Lock 1" c="n" fs={13} />
      <Box x={420} y={170} w={140} h={54} label="Lock 2" c="n" fs={13} />

      <Arrow x1={110} y1={94} x2={110} y2={170} c="a" label="holds" />
      <Arrow x1={490} y1={94} x2={490} y2={170} c="b" label="holds" />
      <Arrow x1={180} y1={60} x2={420} y2={190} c="a" dashed label="waits for" />
      <Arrow x1={420} y1={60} x2={180} y2={190} c="b" dashed label="waits for" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'race-conditions-deadlocks',
  num: 50,
  unit: 'Concurrency Basics',
  title: 'Race Conditions & Deadlocks',
  blurb:
    'A race condition is an outcome that depends on timing; a deadlock is two or more threads waiting on each other forever — two very different failure modes of concurrent code.',
  minutes: 9,
  tags: ['Concurrency', 'Very common follow-up'],

  sections: [
    {
      id: 'analogy',
      heading: 'The laddoo and the narrow lane',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A <b>race condition</b> is two people grabbing the last laddoo from a plate at the same time — both
              think they got it, and only one actually did. A <b>deadlock</b> is two cars stuck nose-to-nose in a
              narrow lane, each waiting for the other to reverse first — neither ever moves.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Both come from concurrent access to shared resources, but a race condition is about{' '}
              <b>wrong results</b> while a deadlock is about the system <b>freezing entirely</b>.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually happens',
      blocks: [
        {
          k: 'diagram',
          el: <DeadlockDiagram />,
          caption: 'A wait-for cycle: A waits on B\'s lock, B waits on A\'s lock — neither can proceed.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>race condition</b> happens when two threads <b>read-modify-write</b> shared state without
              synchronisation, so the final result depends on the exact order the operations happened to
              interleave in.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>deadlock</b> happens when Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock
              2 and waits for Lock 1 — neither can proceed, and both stay blocked forever. This is a cycle in the
              "wait-for" graph between threads and the locks they want.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where each shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Two requests both reading "5 units left," both deciding to sell one, both writing back "4" — one
              sale is silently lost. That's a race condition caused by a missing lock around the check-then-act.
            </>,
            <>
              Two transactions each locking a different row first, then trying to lock the other's row next — a
              classic database deadlock, usually resolved by the DB detecting the cycle and aborting one
              transaction.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Deadlocks are avoided by always acquiring multiple locks in the <b>same global order</b> across every
              code path — if every thread locks Lock 1 before Lock 2, the cyclic wait can never form. This is the
              classic fix and worth stating explicitly in an interview.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a race condition?',
      a: (
        <>
          A bug where the outcome depends on the timing/interleaving of concurrent operations on shared state,
          typically from an unsynchronised read-modify-write.
        </>
      ),
    },
    {
      q: 'What is a deadlock, and what four conditions must hold for one to occur?',
      a: (
        <>
          Two or more threads blocked forever, each waiting on a resource the other holds. Requires mutual
          exclusion, hold-and-wait, no preemption, and a circular wait among the threads.
        </>
      ),
    },
    {
      q: 'How do you prevent a deadlock caused by acquiring two locks?',
      a: <>Always acquire locks in the same global order across every code path, so a circular wait can never form.</>,
    },
    {
      q: 'Give an example of a race condition without proper locking.',
      a: (
        <>
          Two requests both reading "5 units left" and both decrementing to 4 — the decrement from one request is
          silently lost because the check and the write weren't atomic together.
        </>
      ),
    },
    {
      q: 'Is a race condition always visible as a crash?',
      a: <>No — often it silently produces a wrong result (a lost update, a stale read) rather than crashing, which makes it harder to detect.</>,
    },
    {
      q: 'How does a database typically recover from a deadlock?',
      a: <>It detects the cycle in the wait-for graph and aborts (rolls back) one of the transactions involved, letting the other proceed.</>,
    },
  ],
};

export default topic;
