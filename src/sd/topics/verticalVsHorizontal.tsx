import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** One superhuman box vs five ordinary boxes sharing the load. */
function ScalingDiagram() {
  return (
    <Dg w={600} h={280} cap="Vertical scaling grows one machine; horizontal scaling adds more machines">
      <Frame x={2} y={8} w={280} h={256} label="VERTICAL" c="a" />
      <Txt x={142} y={40} fs={11} soft>
        1000 req/s of traffic
      </Txt>
      <Arrow x1={142} y1={50} x2={142} y2={78} c="n" />
      <Box x={62} y={80} w={160} h={70} label="Server" sub="8 → 64 vCPU" c="a" fs={13} />
      <Txt x={142} y={190} fs={11} soft>
        one box, one ceiling
      </Txt>
      <Txt x={142} y={214} fs={11} soft>
        one crash = total outage
      </Txt>

      <Frame x={318} y={8} w={280} h={256} label="HORIZONTAL" c="b" />
      <Txt x={458} y={40} fs={11} soft>
        1000 req/s of traffic
      </Txt>
      <Box x={398} y={58} w={120} h={30} label="Load balancer" c="n" fs={11} />
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x1={398 + 20 * i + 20} y1={88} x2={358 + i * 80} y2={116} c="n" />
      ))}
      {[0, 1, 2].map((i) => (
        <Box key={i} x={338 + i * 80} y={118} w={64} h={48} label={`Box ${i + 1}`} c="b" fs={11} />
      ))}
      <Txt x={458} y={196} fs={11} soft>
        no single ceiling
      </Txt>
      <Txt x={458} y={220} fs={11} soft>
        one box dies, two still serve
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'vertical-vs-horizontal-scaling',
  num: 1,
  unit: 'Foundations',
  title: 'Vertical vs Horizontal Scaling',
  blurb:
    'Two ways to handle more load: make one machine bigger, or add more machines and spread the work — with the trade-offs of each.',
  minutes: 8,
  free: true,
  tags: ['Very common', 'Warm-up question'],

  sections: [
    {
      id: 'analogy',
      heading: 'The food stall analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A busy food stall has two ways to serve more customers. <b>Vertical scaling</b> is hiring one
              superhuman cook who works twice as fast. <b>Horizontal scaling</b> is opening five ordinary stalls
              side by side, so more customers get served at once, each by an ordinary cook.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Both approaches solve the same problem — "the system is running out of capacity" — but they change
              completely different things about how the system is built and operated.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually works',
      blocks: [
        { k: 'diagram', el: <ScalingDiagram />, caption: 'One bigger box vs several ordinary boxes behind a load balancer.' },
        {
          k: 'p',
          text: (
            <>
              <b>Vertical scaling</b> ("scaling up") adds power — more CPU, RAM, or faster disk — to a single
              machine. It is usually a config change or a hardware upgrade: no code changes, nothing to
              redistribute. But every machine has a hard physical ceiling, and that one machine is a single point of
              failure.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Horizontal scaling</b> ("scaling out") adds more machines and spreads the load across them, usually
              behind a load balancer. This requires the application to be <b>stateless</b> — or to externalise its
              state (sessions, cache) — so that any instance can serve any request. In return, capacity has no fixed
              ceiling: you keep adding boxes as traffic grows, and losing one box doesn't take the whole system down.
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
              Upgrading a single Postgres server's RAM or moving it to a bigger instance type is <b>vertical</b>{' '}
              scaling — it buys time cheaply, with zero application changes.
            </>,
            <>
              Adding read replicas, or sharding a database across multiple nodes, is <b>horizontal</b> scaling — it
              buys headroom that keeps growing as you add more nodes.
            </>,
            <>
              A stateless API server behind a load balancer, auto-scaled from 3 to 30 instances during a sale, is the
              textbook horizontal-scaling story.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Horizontal scaling only helps once the app has <b>no in-memory session or state tying a user to one
              specific server</b>. If user sessions live only in that server's memory, spreading requests across
              boxes breaks logins the moment a request lands on a different box than the one that authenticated it.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between vertical and horizontal scaling?',
      a: (
        <>
          Vertical scaling adds resources (CPU/RAM/disk) to a single existing machine. Horizontal scaling adds more
          machines and distributes load across them, usually via a load balancer.
        </>
      ),
    },
    {
      q: 'Why is horizontal scaling generally preferred for large systems?',
      a: (
        <>
          It has no hard ceiling — you keep adding machines as traffic grows — and it removes the single point of
          failure a lone vertically-scaled server represents. The trade-off is added complexity: the app must be
          stateless or externalise its state.
        </>
      ),
    },
    {
      q: 'What has to be true about an application before it can scale horizontally?',
      a: (
        <>
          It must be <b>stateless</b>, or store its state somewhere shared (a database, a distributed cache like
          Redis) rather than in one server's memory — otherwise a request landing on the "wrong" box loses context
          like a logged-in session.
        </>
      ),
    },
    {
      q: 'What is a downside of vertical scaling?',
      a: (
        <>
          A physical ceiling — you eventually run out of bigger hardware to buy — and it remains a single point of
          failure: if that one machine goes down, the whole system goes down with it.
        </>
      ),
    },
    {
      q: 'Give a real example of each.',
      a: (
        <>
          Vertical: upgrading a database server to more RAM. Horizontal: adding more stateless API server instances
          behind a load balancer, or sharding a database across several nodes.
        </>
      ),
    },
  ],
};

export default topic;
