import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Token bucket: refills at a fixed rate, each request consumes a token. */
function RateLimitDiagram() {
  return (
    <Dg w={600} h={240} cap="Token bucket rate limiting: requests consume tokens, the bucket refills at a fixed rate">
      <Frame x={2} y={8} w={290} h={224} label="TOKEN BUCKET" c="a" />
      <Txt x={147} y={36} fs={11} soft>
        refills 5 tokens/sec
      </Txt>
      <Box x={87} y={50} w={120} h={90} label="Bucket" sub="●●●○○ 3/5 tokens" c="a" fs={12} />
      <Arrow x1={147} y1={140} x2={147} y2={168} c="a" label="request" dy={12} />
      <Txt x={147} y={200} fs={11} soft>
        no token left → reject
      </Txt>
      <Txt x={147} y={218} fs={11} soft>
        (bursts allowed up to bucket size)
      </Txt>

      <Frame x={310} y={8} w={288} h={224} label="SLIDING WINDOW" c="b" />
      <Txt x={454} y={36} fs={11} soft>
        limit: 5 requests / 10s
      </Txt>
      <Box x={340} y={54} w={228} h={40} label="requests in last 10s" c="b" fs={11} />
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} x={352 + i * 48} y={100} w={36} h={24} label="●" c="b" fs={12} />
      ))}
      <Txt x={454} y={150} fs={11} soft>
        4 counted so far, window slides
      </Txt>
      <Txt x={454} y={172} fs={11} soft>
        forward every moment
      </Txt>
      <Txt x={454} y={200} fs={11} soft>
        smoother, stricter than token bucket
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'rate-limiting-throttling',
  num: 11,
  unit: 'Networking & Traffic',
  title: 'Rate Limiting & Throttling',
  blurb:
    'Caps how many requests a client can make in a window, protecting the system from abuse, bugs, or traffic spikes.',
  minutes: 8,
  tags: ['Very common', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The movie counter analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a movie counter only issuing 2 tickets per person, so one scalper can't buy up the whole show. A
              rate limiter enforces the same kind of per-client cap on requests, not tickets.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Without a limit, a single misbehaving client — malicious or just buggy — can consume disproportionate
              capacity and degrade the service for everyone else.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'Two common algorithms',
      blocks: [
        {
          k: 'diagram',
          el: <RateLimitDiagram />,
          caption: 'Token bucket allows bursts up to the bucket size; sliding window counts requests in a rolling interval.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Token bucket</b>: a bucket refills at a fixed rate, each request consumes a token, and requests are
              rejected once the bucket is empty. Because tokens can accumulate while idle, this naturally allows
              short bursts of traffic up to the bucket's capacity.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Sliding window</b>: counts requests within a rolling time window rather than a fixed refill rate,
              giving smoother and stricter limiting with no burst allowance — a client can never exceed the cap at
              any point in time, not just on average.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where it applies, and the multi-server pitfall',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Limiting OTP-send requests per phone number per minute to stop SMS-bombing abuse.
            </>,
            <>
              Per-API-key limits on a public API (e.g. 100 requests/minute) to prevent one client from starving
              others of capacity.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              In a multi-server setup, the counter must live in a shared store (e.g. Redis) — a per-server
              in-memory counter under-limits, since a client can spread requests across servers and each one only
              sees a fraction of the total.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Why does a system need rate limiting?',
      a: (
        <>
          To protect against abuse, bugs, or traffic spikes from a single client consuming disproportionate
          capacity and degrading service for everyone else.
        </>
      ),
    },
    {
      q: 'Explain the token bucket algorithm.',
      a: (
        <>
          A bucket refills with tokens at a fixed rate; each request consumes one token, and requests are rejected
          when the bucket is empty. Because tokens accumulate while idle, it naturally allows short bursts up to
          the bucket's capacity.
        </>
      ),
    },
    {
      q: 'How does sliding window rate limiting differ from token bucket?',
      a: (
        <>
          Sliding window counts requests within a rolling time interval and enforces a hard cap with no burst
          allowance, giving smoother and stricter limiting compared to token bucket's burst-friendly refill model.
        </>
      ),
    },
    {
      q: 'Why can\'t you rate-limit using an in-memory counter on each server?',
      a: (
        <>
          Because in a multi-server setup, a client's requests get spread across servers, and each server's local
          counter only sees a fraction of the total — the combined rate can exceed the intended limit. The counter
          needs to live in a shared store like Redis.
        </>
      ),
    },
    {
      q: 'Give a real example of where rate limiting is critical.',
      a: <>Limiting OTP-send requests per phone number per minute, to prevent SMS-bombing abuse and cost blowup.</>,
    },
    {
      q: 'What is the difference between rate limiting and throttling?',
      a: (
        <>
          They're often used interchangeably; rate limiting typically rejects requests over the cap outright, while
          throttling can mean slowing/delaying excess requests instead of rejecting them immediately.
        </>
      ),
    },
  ],
};

export default topic;
