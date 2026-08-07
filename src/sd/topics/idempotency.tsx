import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A retried request with the same idempotency key returning the stored result instead of repeating the side effect. */
function IdempotencyDiagram() {
  return (
    <Dg w={600} h={260} cap="A retried request with the same idempotency key returns the stored result instead of charging twice">
      <Box x={20} y={30} w={140} h={50} label="Client" c="n" fs={13} />
      <Box x={230} y={30} w={160} h={50} label="Payment service" c="a" fs={12} />
      <Box x={460} y={30} w={120} h={50} label="Key store" sub="key → result" c="c" fs={11} />

      <Arrow x1={160} y1={55} x2={230} y2={55} c="a" label="request #1" dx={0} dy={-10} />
      <Txt x={195} y={100} fs={10} soft>key: pay_7f3a</Txt>
      <Arrow x1={310} y1={80} x2={310} y2={140} c="a" label="charge once, store result" dx={40} dy={4} />
      <Box x={230} y={150} w={160} h={40} label="Charged $50" c="a" fs={11} />

      <Arrow x1={160} y1={200} x2={230} y2={175} c="b" label="retry (timeout) — same key" dx={-10} dy={30} bend="v" />
      <Arrow x1={390} y1={195} x2={520} y2={80} c="b" label="lookup key" bend="h" dx={40} dy={-4} />
      <Txt x={480} y={140} fs={10} soft c="b">already processed</Txt>
      <Txt x={310} y={230} fs={11} soft>no second charge — same result returned</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'idempotency',
  num: 26,
  unit: 'Architecture Style & Reliability',
  title: 'Idempotency',
  blurb: 'Calling the same operation twice should produce the same result once, not twice.',
  minutes: 8,
  tags: ['Very common', 'Retries'],

  sections: [
    {
      id: 'analogy',
      heading: 'The lift call-button analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like pressing a lift call-button five times because you're impatient — the lift doesn't come five
              times. Your request just gets registered once, and the extra presses do nothing new.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              In distributed systems, network timeouts mean the client often can't tell if a request succeeded or
              not — so it retries. Idempotency makes that retry safe.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How idempotency keys work',
      blocks: [
        { k: 'diagram', el: <IdempotencyDiagram />, caption: 'Same idempotency key on retry → the server returns the stored first result instead of repeating the side effect.' },
        {
          k: 'p',
          text: (
            <>
              The client generates a unique <b>idempotency key</b> per logical operation (often a UUID) and sends it
              with the request. The server checks if it has already processed that key.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              If it's new, the server performs the side effect and stores the key alongside the result. If the same
              key arrives again — because the client retried after a timeout — the server skips the side effect
              entirely and just returns the originally stored result.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where this shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <b>payment</b> retried after a network timeout must not charge the customer twice — the idempotency
              key ensures the second call is a no-op that returns the first call's result.
            </>,
            <>
              Stripe's API requires an <code>Idempotency-Key</code> header on charge-creation requests for exactly
              this reason.
            </>,
            <>
              A <b>PUT</b> request that sets a resource to an exact value is naturally idempotent — calling it twice
              leaves the resource in the same state. A <b>POST</b> that always creates a new resource is not, unless
              you add a key.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Retries are unavoidable in distributed systems — any endpoint with a side effect (charge a card, send
              an email, create an order) needs idempotency handling <b>by default</b>, not bolted on as an
              afterthought once double-charges start showing up in production.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does it mean for an operation to be idempotent?',
      a: <>Calling it once or many times with the same input produces the same end result — no duplicated side effects.</>,
    },
    {
      q: 'How is idempotency typically implemented for a "create" or "charge" API?',
      a: (
        <>
          The client sends a unique idempotency key with the request. The server stores which keys it has already
          processed; on a repeat, it returns the stored result instead of redoing the side effect.
        </>
      ),
    },
    {
      q: 'Why is idempotency important for retries?',
      a: (
        <>
          A client often can't tell if a timed-out request actually succeeded server-side. Safely retrying requires
          the operation to be idempotent, otherwise a retry can duplicate the side effect (e.g. double-charge).
        </>
      ),
    },
    {
      q: 'Are HTTP PUT and POST idempotent by default?',
      a: (
        <>
          PUT is expected to be idempotent (setting a resource to a given state). POST is not by default, since it
          usually creates a new resource each time — it needs an explicit idempotency key to be made safe to retry.
        </>
      ),
    },
    {
      q: 'Where should the idempotency key be generated?',
      a: (
        <>
          On the client, per logical operation — so a retry of the same logical request reuses the same key, letting
          the server recognise it as a duplicate.
        </>
      ),
    },
    {
      q: 'What happens to the idempotency key store over time?',
      a: (
        <>
          Keys are usually expired after a reasonable window (e.g. 24 hours) since retries beyond that point are
          unlikely and keeping every key forever wastes storage.
        </>
      ),
    },
  ],
};

export default topic;
