import { Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A single-key washroom (mutex) vs a 4-seater lounge (semaphore). */
function LocksDiagram() {
  return (
    <Dg w={600} h={260} cap="A mutex allows one holder; a semaphore allows up to N concurrent holders">
      <Frame x={20} y={16} w={260} h={220} label="MUTEX" c="a" />
      <Box x={100} y={60} w={100} h={60} label="Washroom" sub="1 key" c="a" fs={12} />
      <Box x={60} y={150} w={50} h={34} label="T1 (in)" c="a" fs={10} />
      <Box x={190} y={150} w={80} h={34} label="T2, T3 wait" c="n" fs={10} dashed />

      <Frame x={320} y={16} w={260} h={220} label="SEMAPHORE (N=4)" c="b" />
      <Box x={330} y={60} w={240} h={50} label="Lounge" sub="4 seats" c="b" fs={12} />
      <Box x={330} y={130} w={54} h={34} label="T1" c="b" fs={10} />
      <Box x={392} y={130} w={54} h={34} label="T2" c="b" fs={10} />
      <Box x={454} y={130} w={54} h={34} label="T3" c="b" fs={10} />
      <Box x={516} y={130} w={54} h={34} label="T4" c="b" fs={10} />
      <Txt x={450} y={195} fs={11} soft>up to 4 in together</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'locks-mutex-semaphore',
  num: 49,
  unit: 'Concurrency Basics',
  title: 'Locks, Mutex, Semaphore',
  blurb:
    'Mechanisms to control access to shared state across threads — from a strict single-holder mutex to a semaphore that caps concurrent access at N.',
  minutes: 8,
  tags: ['Concurrency', 'Common follow-up'],

  sections: [
    {
      id: 'analogy',
      heading: 'The washroom and lounge analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A <b>mutex</b> is like a single-person washroom with one key — only one person inside at a time,
              everyone else waits outside. A <b>semaphore</b> is like a 4-seater waiting lounge — up to 4 people
              are allowed in together, the 5th has to wait for a seat to free up.
            </>
          ),
        },
        {
          k: 'p',
          text: <>Both are synchronisation primitives, but they answer a slightly different question.</>,
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually works',
      blocks: [
        {
          k: 'diagram',
          el: <LocksDiagram />,
          caption: 'Mutex: exactly one holder. Semaphore: up to N concurrent holders.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>mutex</b> (mutual exclusion lock) allows exactly one thread to hold it at a time — used to
              protect a <b>critical section</b> where shared state is read and written.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>semaphore</b> allows up to <b>N</b> concurrent holders, tracked with an internal counter — used
              to cap concurrent access to a limited resource pool rather than to fully serialise access. A
              semaphore with N=1 behaves like a mutex, but the two are conceptually distinct: a mutex has the
              notion of an <i>owner</i> that releases it; a plain counting semaphore does not.
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
              A <b>mutex</b> around updating a shared inventory counter — only one thread should read-modify-write
              it at a time.
            </>,
            <>
              A <b>semaphore</b> of size 10 limiting concurrent connections to an external API, so the service
              doesn't overwhelm a downstream dependency with unbounded parallel calls.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Holding a lock across a slow operation — a network call inside a critical section — is a common way
              to accidentally serialise a system that should be concurrent. Keep critical sections as short as
              possible, and never do I/O while holding a lock if it can be avoided.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between a mutex and a semaphore?',
      a: (
        <>
          A mutex allows exactly one holder at a time and has an owner concept. A semaphore allows up to N
          concurrent holders via an internal counter and has no ownership requirement.
        </>
      ),
    },
    {
      q: 'When would you use a semaphore instead of a mutex?',
      a: (
        <>
          When you want to cap concurrent access to a limited pool of resources — e.g. limiting connections to an
          external API to 10 at a time — rather than fully serialise access to one resource.
        </>
      ),
    },
    {
      q: 'What is a critical section?',
      a: <>The part of code that accesses shared state and must not be executed by more than one thread at a time without synchronisation.</>,
    },
    {
      q: 'Why is it a bad idea to do a network call while holding a lock?',
      a: (
        <>
          It holds every other waiting thread up for the duration of the slow call, effectively serialising work
          that should be concurrent — critical sections should be as short as possible.
        </>
      ),
    },
    {
      q: 'What does a semaphore with N=1 behave like?',
      a: (
        <>
          Functionally like a mutex, though a true mutex additionally has an owner concept that a plain counting
          semaphore lacks.
        </>
      ),
    },
    {
      q: 'What is the risk of not synchronising access to shared state at all?',
      a: <>Race conditions — two threads reading and writing the same state concurrently can corrupt it or produce inconsistent results.</>,
    },
  ],
};

export default topic;
