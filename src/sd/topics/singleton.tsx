import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

function SingletonDiagram() {
  return (
    <Dg w={520} h={220} cap="One shared ConnectionPool instance handed out through a static getInstance method">
      <Box x={170} y={40} w={180} h={80} label="ConnectionPool" sub="one shared instance" c="a" fs={13} />
      <Txt x={260} y={140} fs={11} soft>
        private constructor — no `new` from outside
      </Txt>
      <Arrow x1={60} y1={80} x2={170} y2={80} c="n" label="getInstance()" />
      <Arrow x1={520 - 60} y1={80} x2={350} y2={80} c="n" label="getInstance()" dx={0} dy={20} />
      <Txt x={60} y={65} fs={11} soft>caller A</Txt>
      <Txt x={460} y={65} fs={11} soft>caller B</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'singleton',
  num: 40,
  unit: 'Design Patterns',
  title: 'Singleton',
  blurb: 'Ensures a class has exactly one instance across the whole app, reached through a single global access point.',
  minutes: 9,
  free: true,
  tags: ['Design pattern', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The Prime Minister analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like the one Prime Minister of a country at any given time — many people may ask for "the PM," but
              they're all routed to the same single person, not a fresh one created per request.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Two things make a Singleton: nobody outside the class can construct a new instance, and there's a
              single well-known way to reach the one that already exists.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <SingletonDiagram />, caption: 'Every caller asking for getInstance() is handed the same shared object.' },
        {
          k: 'p',
          text: (
            <>
              A <b>private constructor</b> prevents outside code from instantiating the class directly. A static
              method returns the one shared instance — created either <b>eagerly</b> (at class load time) or{' '}
              <b>lazily</b> (on first request), and made thread-safe if multiple threads might race to create it
              concurrently.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Thread-safe Singleton via double-checked locking',
          code: `class ConnectionPool {
  private static volatile ConnectionPool instance;
  private ConnectionPool() {}

  static ConnectionPool getInstance() {
    if (instance == null) {
      synchronized (ConnectionPool.class) {
        if (instance == null)
          instance = new ConnectionPool();
      }
    }
    return instance;
  }
}`,
        },
        {
          k: 'p',
          text: (
            <>
              The outer null check avoids locking on every call once the instance exists; the inner check inside the
              lock guards against two threads both passing the outer check before either creates the instance.{' '}
              <code>volatile</code> stops another thread from seeing a half-constructed object due to instruction
              reordering.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Example and watch-out',
      blocks: [
        {
          k: 'ul',
          items: [
            <>A shared database connection pool, reused across the whole app instead of opening new connections per request.</>,
            <>A single config or logger instance, so every part of the app reads the same settings and writes to the same log sink.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Overused, singletons become hidden global state that makes unit testing painful — a test can't easily
              swap in a fresh or mock instance. Reach for dependency injection instead when the "one instance" isn't
              a hard technical requirement (like one shared connection pool truly needs to be).
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does Singleton solve?',
      a: <>It guarantees a class has exactly one instance for the whole application's lifetime, and gives every caller a single well-known way to reach it.</>,
    },
    {
      q: 'How do you implement a Singleton?',
      a: <>Make the constructor private so outside code can't call `new`, and expose a static method that lazily or eagerly creates the one instance and returns it on every call.</>,
    },
    {
      q: 'Why does a naive lazy Singleton break under multithreading?',
      a: <>Two threads can both see instance == null at the same time and both construct a new object, producing two separate instances instead of one.</>,
    },
    {
      q: 'Explain double-checked locking for a thread-safe Singleton.',
      a: <>Check if instance is null outside a lock first (cheap, fast path once created); only if null, acquire a lock and check again inside it before constructing, so only one thread ever creates the instance and later calls skip locking entirely.</>,
    },
    {
      q: 'Why is the instance field marked volatile?',
      a: <>To prevent another thread from observing a partially-constructed object due to compiler/CPU instruction reordering — volatile ensures the write to instance is fully visible before any thread reads it as non-null.</>,
    },
    {
      q: 'What is a downside of overusing Singleton?',
      a: <>It introduces hidden global state, making unit tests harder to isolate since a fresh or mock instance can't easily be substituted — dependency injection is usually a better fit unless one shared instance is a genuine hard requirement.</>,
    },
    {
      q: 'Give a real example of a legitimate Singleton.',
      a: <>A shared database connection pool or a single application-wide logger/config object, where having more than one instance would waste resources or produce inconsistent behaviour.</>,
    },
  ],
};

export default topic;
