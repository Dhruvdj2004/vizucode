import type { SdTopic } from '../types';

const topic: SdTopic = {
  slug: 'sd-revision',
  num: 55,
  unit: 'Revision',
  title: 'System Design Revision',
  blurb:
    'Classic HLD and LLD interview problems, the four patterns you\'re most often asked to write from scratch, two problems worked end-to-end, the six-step approach frameworks, and the back-of-envelope numbers worth memorising.',
  minutes: 15,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'hld-problems',
      heading: 'Classic HLD interview problems',
      blocks: [
        {
          k: 'table',
          head: ['Problem', 'What it tests'],
          rows: [
            ['URL Shortener', 'base62 encoding vs random ID + collision check, redirect flow, storage and read-scale (frequently asked)'],
            ['Rate Limiter', 'token bucket vs sliding window, keeping counters consistent across distributed servers via Redis'],
            ['Notification System', 'fan-out to multiple channels (push/SMS/email), retry policy, user preference and dedup'],
            ['News Feed', 'push (fan-out on write) vs pull (fan-out on read) model, ranking, pagination via cursors'],
            ['Chat / Messaging App', 'delivery guarantees, read receipts, presence, WebSocket connection management at scale'],
            ['Vehicle Listing & Search Platform', 'faceted filters (make/model/price/city), catalog vs live inventory data, search index freshness (domain-relevant)'],
          ],
        },
      ],
    },

    {
      id: 'lld-problems',
      heading: 'Classic LLD interview problems',
      blocks: [
        {
          k: 'table',
          head: ['Problem', 'What it tests'],
          rows: [
            ['Parking Lot System', 'spot allocation strategy, pricing per vehicle type, ticket lifecycle (frequently asked)'],
            ['Elevator System', 'request scheduling (SCAN algorithm), direction state machine, multi-elevator dispatch'],
            ['Library Management System', 'catalog search, membership limits, due dates and fine calculation'],
            ['Vending Machine', 'State pattern for idle/selecting/dispensing/out-of-stock, change calculation'],
            ['Tic-Tac-Toe / Chess', 'board representation, move validation, win/check detection, undo support'],
            ['Splitwise / Expense Sharing', 'balance sheet per user pair, simplify-debts algorithm for settlement'],
            ['Vehicle Booking / Test-Drive Scheduler', 'slot locking to prevent double-booking, cancellation and reassignment flow (domain-relevant)'],
          ],
        },
      ],
    },

    {
      id: 'worked-hld',
      heading: 'HLD worked example: Design a URL Shortener',
      blocks: [
        {
          k: 'steps',
          items: [
            {
              t: '01 Requirements',
              d: 'Shorten a long URL to a short code, redirect the short code to the original on visit, links should not be guessable in sequence, expect reads to vastly outnumber writes.',
            },
            {
              t: '02 Estimate',
              d: 'Say 100M new URLs/month ≈ 40 writes/sec average. Reads are typically 100:1 over writes ≈ 4,000 reads/sec. At 7 years of URLs, storage is a few hundred GB — comfortably fits a single sharded database.',
            },
            {
              t: '03 API',
              d: (
                <>
                  <code>POST /shorten {'{longUrl}'} → {'{shortCode}'}</code> and <code>GET /{'{shortCode}'} → 302 redirect</code>.
                </>
              ),
            },
            {
              t: '04 Components',
              d: 'API servers behind a load balancer → key-generation service → database (shortCode → longUrl mapping) → cache (Redis) in front of the DB for hot reads → CDN/edge cache optional.',
            },
            {
              t: '05 Deep dive — key generation',
              d: 'base62-encode an auto-incrementing ID (no collisions, but predictable, needs a centralised counter), or a random 7-char code with retry on collision. Most real answers pick base62 of a distributed ID generator to avoid a single point of contention.',
            },
            {
              t: '06 Bottlenecks',
              d: 'Reads dominate, so cache-aside in front of the DB removes most read load; the write path is low-volume enough for a single leader DB with replicas. At far larger scale, shard the mapping table by hash of the short code.',
            },
          ],
        },
      ],
    },

    {
      id: 'worked-lld',
      heading: 'LLD worked example: Design a Parking Lot System',
      blocks: [
        {
          k: 'steps',
          items: [
            {
              t: '01 Requirements',
              d: 'Multiple levels, multiple spot types (compact/large/handicapped), assign a spot on entry, compute fee on exit, track availability.',
            },
            {
              t: '02 Entities',
              d: 'ParkingLot, Level, Spot, Vehicle (with subtypes Car/Bike), Ticket, PaymentProcessor.',
            },
            {
              t: '03 Relationships',
              d: 'ParkingLot composes Levels (a level doesn\'t exist outside a lot); a Level composes Spots; a Ticket associates a Vehicle with a Spot (both can exist independently of the ticket).',
            },
            {
              t: '04 Patterns applied',
              d: 'Strategy for spot-assignment policy (nearest-first vs largest-fit-first) and for fee calculation (hourly vs flat); State for a spot\'s lifecycle (Free → Occupied → UnderMaintenance) if in scope.',
            },
            {
              t: '05 Core flow',
              d: 'ParkingLot.parkVehicle(vehicle) asks a SpotAssignmentStrategy for a free matching spot, creates a Ticket, marks the spot occupied. ParkingLot.unparkVehicle(ticket) computes the fee via a PricingStrategy, frees the spot, closes the ticket.',
            },
            {
              t: '06 Extensibility',
              d: 'Adding EV charging spots means a new Spot subtype plus a matching branch in the assignment strategy — the rest of the system is untouched, which is Open/Closed paying off directly.',
            },
          ],
        },
      ],
    },

    {
      id: 'frameworks',
      heading: 'The two interview frameworks',
      blocks: [
        {
          k: 'table',
          head: ['HLD approach', 'LLD approach'],
          rows: [
            ['1. Clarify requirements — functional scope and non-functional constraints.', '1. Clarify requirements — exact use-cases in scope and out of scope.'],
            ['2. Estimate scale — back-of-envelope users, QPS, storage.', '2. Identify entities — nouns become candidate classes.'],
            ['3. Define the API — the contract before drawing boxes.', '3. Define relationships — inheritance vs composition, association vs aggregation.'],
            ['4. Sketch high-level components — services, DB, cache, queue.', '4. Apply SOLID/patterns — only where they solve a real flexibility need.'],
            ['5. Deep-dive one component — the interviewer usually points at the hardest part.', '5. Code the core flows — the 2-3 methods that actually matter.'],
            ['6. Discuss bottlenecks & trade-offs — what breaks first at 10x scale.', '6. Discuss extensibility — what would need to change for a new requirement.'],
          ],
        },
      ],
    },

    {
      id: 'crib',
      heading: 'Back-of-envelope numbers worth memorising',
      blocks: [
        {
          k: 'table',
          head: ['Quantity', 'Value'],
          rows: [
            ['1 day', '≈ 86,400 seconds'],
            ['1M req/day', '≈ 12 req/sec average'],
            ['RAM read', '≈ 100 nanoseconds'],
            ['SSD read', '≈ 0.1–1 millisecond'],
            ['Same-DC round trip', '≈ 0.5 millisecond'],
            ['Cross-region round trip', '≈ 100–150 milliseconds'],
            ['1 char (UTF-8)', '≈ 1 byte'],
            ['Availability target', '99.9% ≈ 8.7 hrs downtime/yr'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              These numbers exist to <b>unblock a stalled estimation conversation</b>, not to be recited
              perfectly — round generously, say your assumption out loud, and move on to the design.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Walk me through designing a URL shortener.',
      a: (
        <>
          Clarify requirements (shorten + redirect, reads {'>>'} writes), estimate scale (~40 writes/sec, ~4,000
          reads/sec), define the API, sketch components (API servers → key-gen service → DB → cache), deep-dive on
          key generation (base62 of a distributed ID vs random + collision check), then discuss bottlenecks —
          reads dominate so cache-aside handles most load.
        </>
      ),
    },
    {
      q: 'What is the standard six-step framework for an HLD interview?',
      a: (
        <>
          Clarify requirements, estimate scale, define the API, sketch high-level components, deep-dive one
          component, discuss bottlenecks and trade-offs.
        </>
      ),
    },
    {
      q: 'What is the standard six-step framework for an LLD interview?',
      a: (
        <>
          Clarify requirements, identify entities, define relationships, apply SOLID/patterns where they solve a
          real need, code the core flows, discuss extensibility.
        </>
      ),
    },
    {
      q: 'Name three classic LLD interview problems and what each tests.',
      a: (
        <>
          Parking Lot (spot allocation and pricing strategy), Elevator System (request scheduling and direction
          state machine), Splitwise (balance sheet per user pair and debt simplification).
        </>
      ),
    },
    {
      q: 'How many requests/sec is 1M requests/day?',
      a: <>≈ 12 requests/sec on average (1,000,000 ÷ 86,400 seconds).</>,
    },
    {
      q: 'What design patterns would you apply to a Parking Lot system, and where?',
      a: (
        <>
          Strategy for spot-assignment policy and fee calculation (swap the algorithm without touching callers),
          and State for a spot's Free/Occupied/UnderMaintenance lifecycle if that's in scope.
        </>
      ),
    },
    {
      q: 'What is the typical read:write ratio assumption for a URL shortener, and why does it matter?',
      a: (
        <>
          Around 100:1 reads to writes — it matters because it tells you to optimise the read path (caching,
          replicas) far more aggressively than the write path.
        </>
      ),
    },
    {
      q: 'What round-trip latency should you assume for a cross-region call vs a same-datacenter call?',
      a: <>≈ 0.5ms same-datacenter vs ≈ 100–150ms cross-region — a ~200-300x difference worth factoring into any architecture that spans regions.</>,
    },
  ],
};

export default topic;
