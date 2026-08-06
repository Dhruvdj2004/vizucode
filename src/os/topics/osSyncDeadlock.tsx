import { Arrow, Box, Dg, Frame, Queue, Txt } from '../dgm';
import type { OsTopic } from '../types';

/** Bounded-buffer producer/consumer with its two semaphores and a mutex. */
function ProducerConsumer() {
  return (
    <Dg w={608} h={244} cap="Two counting semaphores track free and filled slots; the mutex protects the buffer itself">
      <Box x={16} y={78} w={110} h={54} label="PRODUCER" sub="makes items" c="a" fs={12} />
      <Arrow x1={128} y1={105} x2={168} y2={105} c="a" />

      <Frame x={172} y={62} w={264} h={86} label="BOUNDED BUFFER" c="n" />
      <Queue x={186} y={92} items={['x', 'x', '·', '·', '·']} c="b" bw={44} h={30} />

      <Arrow x1={440} y1={105} x2={478} y2={105} c="b" />
      <Box x={482} y={78} w={110} h={54} label="CONSUMER" sub="takes items" c="b" fs={12} />

      <Txt x={304} y={176} fs={11} bold c="c">
        semaphore empty = 3 · semaphore full = 2 · mutex = 1
      </Txt>
      <Txt x={304} y={200} fs={10.5} soft>
        producer: wait(empty) → wait(mutex) → insert → signal(mutex) → signal(full)
      </Txt>
      <Txt x={304} y={220} fs={10.5} soft>
        consumer: wait(full) → wait(mutex) → remove → signal(mutex) → signal(empty)
      </Txt>
      <Txt x={304} y={240} fs={10} soft>
        the counters block a full producer and an empty consumer; the mutex stops both touching it at once
      </Txt>
    </Dg>
  );
}

/** The circular wait at the heart of every deadlock. */
function CircularWait() {
  return (
    <Dg w={560} h={252} cap="P1 holds R2 and wants R1; P2 holds R1 and wants R2 — neither can ever proceed">
      <Box x={60} y={40} w={120} h={46} label="P1" c="a" />
      <Box x={370} y={40} w={120} h={46} label="R1" sub="held by P2" c="c" />
      <Box x={370} y={160} w={120} h={46} label="P2" c="a" />
      <Box x={60} y={160} w={120} h={46} label="R2" sub="held by P1" c="c" />

      <Arrow x1={182} y1={63} x2={366} y2={63} c="a" label="requests" dy={-9} />
      <Arrow x1={430} y1={88} x2={430} y2={156} c="c" label="assigned to" dx={62} dy={0} />
      <Arrow x1={368} y1={183} x2={184} y2={183} c="a" label="requests" dy={20} />
      <Arrow x1={120} y1={158} x2={120} y2={90} c="c" label="assigned to" dx={-58} dy={0} />

      <Txt x={275} y={232} fs={10.5} bold c="c">
        follow the arrows and you return to where you started — that cycle is the deadlock
      </Txt>
    </Dg>
  );
}

const topic: OsTopic = {
  slug: 'os-sync-deadlock',
  num: 5,
  unit: 'Concurrency & Storage',
  title: 'Semaphores, Mutex, Deadlock & Banker\'s Algorithm',
  blurb:
    'Mutex versus semaphore, the producer-consumer problem, the four conditions for deadlock, and how the banker\'s algorithm avoids it.',
  minutes: 13,
  tags: ['Very common'],

  sections: [
    {
      id: 'mutex-semaphore',
      heading: 'Semaphore vs mutex',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Mutex</b> — a lock allowing only <b>one</b> thread to access a resource at a time. Whoever locks it
              must be the one to unlock it.
            </>,
            <>
              <b>Semaphore</b> — a signalling mechanism using a <b>counter</b> to control access. It can allow
              several threads into a limited pool of resources at once.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['', 'Mutex', 'Semaphore'],
          rows: [
            ['Ownership', 'Only the owner can lock and unlock', 'Any process may signal or wait'],
            ['Value', 'Binary — locked or unlocked', 'Binary or counting'],
            ['Purpose', 'Mutual exclusion', 'Signalling between processes'],
            ['Typical use', 'Protect a critical section', 'Count available resources; order events'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A <b>binary semaphore</b> takes only the values 0 or 1, so it behaves like a mutex — but it still has
              no notion of ownership, which is the real distinction.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The distinction interviewers want',
          text: (
            <>
              <b>A mutex is a locking mechanism; a semaphore is a signalling mechanism.</b> Because a mutex has an
              owner, it can support priority inheritance and it is an error for another thread to release it. A
              semaphore is just a counter, so one thread may wait and a completely different thread may signal —
              which is exactly what you need for producer-consumer.
            </>
          ),
        },
      ],
    },

    {
      id: 'producer-consumer',
      heading: 'The producer-consumer problem',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A producer creates data and puts it into a shared buffer; a consumer takes data out. Three things can
              go wrong: the producer adds when the buffer is <b>full</b>, the consumer removes when it is{' '}
              <b>empty</b>, or both touch the buffer at once and <b>corrupt</b> it.
            </>
          ),
        },
        { k: 'diagram', el: <ProducerConsumer />, caption: 'Two counting semaphores plus one mutex solve all three problems.' },
        {
          k: 'code',
          title: 'The solution',
          code: `semaphore empty = N;     // free slots — blocks a producer when 0
semaphore full  = 0;     // filled slots — blocks a consumer when 0
mutex     m     = 1;     // protects the buffer itself

PRODUCER                      CONSUMER
  wait(empty)                   wait(full)
  wait(m)                       wait(m)
     insert item                   remove item
  signal(m)                     signal(m)
  signal(full)                  signal(empty)`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The <b>order matters</b>. If you swap the first two lines — taking the mutex before the counting
              semaphore — a producer can grab the mutex, discover the buffer is full, and block while still holding
              the lock. The consumer can then never get in to make space. That is a deadlock, and it is the classic
              trap in this question.
            </>
          ),
        },
      ],
    },

    {
      id: 'deadlock',
      heading: 'Deadlock and its four conditions',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>deadlock</b> is when two or more processes are stuck waiting for each other forever and none can
              proceed. Process A holds Resource 1 and waits for Resource 2; Process B holds Resource 2 and waits for
              Resource 1.
            </>
          ),
        },
        { k: 'diagram', el: <CircularWait />, caption: 'A resource-allocation graph containing a cycle.' },
        {
          k: 'ol',
          items: [
            <>
              <b>Mutual exclusion</b> — only one process can use a resource at a time.
            </>,
            <>
              <b>Hold and wait</b> — a process holds one resource while waiting for another.
            </>,
            <>
              <b>No preemption</b> — a resource cannot be forcibly taken; it must be released voluntarily.
            </>,
            <>
              <b>Circular wait</b> — a cycle of processes exists, each waiting for a resource held by the next.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              All four must hold <b>simultaneously</b>. Every prevention technique works by making one of them
              impossible — which is a far better way to organise the answer than listing techniques at random. The
              easiest to break in practice is <b>circular wait</b>: impose a global ordering on resources and always
              acquire them in that order.
            </>
          ),
        },
      ],
    },

    {
      id: 'bankers',
      heading: "Banker's algorithm",
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A deadlock-<b>avoidance</b> algorithm. Before granting a resource request, the OS asks: "if I give
              this out, will the system remain in a <b>safe state</b> — can every process still finish eventually?"
              If yes it grants the request; if no, the process waits.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              It is named after a banker who will not lend money if doing so risks being unable to satisfy all
              customers' eventual needs.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The safety check',
          code: `Need[i] = Max[i] − Allocation[i]      // what process i could still ask for

safe():
    work   = Available
    finish = [false] * n
    repeat:
        find i with finish[i] == false AND Need[i] <= work
        if found:
            work   += Allocation[i]     // pretend i finishes and returns everything
            finish[i] = true
        else:
            break
    return all(finish)                  // all true → SAFE state`,
        },
        {
          k: 'ul',
          items: [
            <>
              A <b>safe state</b> means there is at least one ordering — a <b>safe sequence</b> — in which every
              process can obtain what it needs and complete.
            </>,
            <>
              An <b>unsafe</b> state is not the same as a deadlock. It means deadlock is <i>possible</i>; the
              banker's algorithm simply refuses to enter one.
            </>,
            <>
              The cost: each process must declare its <b>maximum</b> resource need in advance, and the check runs on
              every request. That is why it is rarely used in general-purpose systems.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['Strategy', 'Approach', 'Example'],
          rows: [
            ['Prevention', 'Structurally break one of the four conditions', 'Order resources; acquire everything up front'],
            ['Avoidance', 'Use advance knowledge to refuse risky grants', "Banker's algorithm"],
            ['Detection & recovery', 'Let it happen, find the cycle, kill a victim', 'Resource-allocation graph cycle check'],
            ['Ignore it', 'Assume it is rare enough not to matter', 'The "ostrich algorithm" — what Linux and Windows largely do'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between a mutex and a semaphore?',
      a: (
        <>
          A <b>mutex</b> is a locking mechanism with an <b>owner</b> — only the thread that locked it may unlock it —
          and it is strictly binary. A <b>semaphore</b> is a signalling mechanism built on a counter, with no
          ownership, so one thread can wait and another can signal. Use a mutex for mutual exclusion and a semaphore
          for counting resources or ordering events.
        </>
      ),
    },
    {
      q: 'What is a binary semaphore, and is it the same as a mutex?',
      a: (
        <>
          A semaphore restricted to the values 0 and 1. It <b>behaves</b> like a mutex but is not the same thing: it
          has no ownership, so any thread may release it, and it cannot support priority inheritance.
        </>
      ),
    },
    {
      q: 'Explain the producer-consumer problem and its solution.',
      a: (
        <>
          A producer fills a shared bounded buffer and a consumer empties it. The hazards are overfilling,
          over-emptying and concurrent corruption. The solution uses two counting semaphores —{' '}
          <code>empty</code> (free slots) and <code>full</code> (filled slots) — plus a <b>mutex</b> protecting the
          buffer.
        </>
      ),
    },
    {
      q: 'In producer-consumer, why must wait(empty) come before wait(mutex)?',
      a: (
        <>
          Otherwise a producer can acquire the mutex, find the buffer full and block <b>while holding the lock</b>.
          The consumer can then never enter to free a slot, and the two deadlock. Always take the counting semaphore
          first and the mutex second.
        </>
      ),
    },
    {
      q: 'What are the four necessary conditions for deadlock?',
      a: (
        <>
          <b>Mutual exclusion</b>, <b>hold and wait</b>, <b>no preemption</b> and <b>circular wait</b>. All four
          must hold at the same time, so breaking any one prevents deadlock.
        </>
      ),
    },
    {
      q: "What does the banker's algorithm do?",
      a: (
        <>
          Deadlock <b>avoidance</b>. Before granting a request it simulates the allocation and checks whether a{' '}
          <b>safe sequence</b> still exists — an order in which every process can get its maximum need and finish.
          If not, the request is denied and the process waits.
        </>
      ),
    },
    {
      q: 'Is an unsafe state the same as a deadlock?',
      a: (
        <>
          No. An <b>unsafe</b> state means deadlock is <i>possible</i>, not that it has happened — the system might
          still complete if processes ask for less than their declared maximum. The banker's algorithm is
          conservative: it refuses to leave the safe region at all.
        </>
      ),
    },
    {
      q: 'Deadlock prevention vs avoidance vs detection?',
      a: (
        <>
          <b>Prevention</b> structurally eliminates one of the four conditions (e.g. ordering resources).{' '}
          <b>Avoidance</b> uses advance knowledge of maximum needs to refuse dangerous grants (banker's).{' '}
          <b>Detection</b> allows deadlock, finds the cycle in the resource-allocation graph, and recovers by
          killing or rolling back a victim.
        </>
      ),
    },
    {
      q: 'Why do most real operating systems not implement deadlock avoidance?',
      a: (
        <>
          Because it requires every process to declare its maximum resource needs up front, which is impractical,
          and the safety check runs on every request. Deadlocks are rare enough in practice that Linux and Windows
          largely <b>ignore</b> the problem — the "ostrich algorithm" — and rely on the user or administrator to
          kill a stuck process.
        </>
      ),
    },
  ],
};

export default topic;
