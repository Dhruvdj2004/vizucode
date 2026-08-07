import { Arrow, Box, Dg, Frame } from '../dgm';
import type { SdTopic } from '../types';

/** One shared house vs several independent houses that still coordinate. */
function MonolithDiagram() {
  return (
    <Dg w={600} h={280} cap="A monolith is one deployable unit; microservices split by business domain">
      <Frame x={2} y={8} w={260} h={256} label="MONOLITH" c="a" />
      <Box x={42} y={50} w={180} h={40} label="UI" c="a" fs={12} />
      <Box x={42} y={104} w={180} h={40} label="Orders + Payments" c="a" fs={12} />
      <Box x={42} y={158} w={180} h={40} label="Search" c="a" fs={12} />
      <Box x={42} y={212} w={180} h={30} label="One database" c="a" fs={11} />

      <Frame x={318} y={8} w={280} h={256} label="MICROSERVICES" c="b" />
      <Box x={338} y={50} w={90} h={50} label="Orders" sub="own DB" c="b" fs={11} />
      <Box x={438} y={50} w={140} h={50} label="Payments" sub="own DB" c="b" fs={11} />
      <Box x={338} y={130} w={90} h={50} label="Search" sub="own DB" c="b" fs={11} />
      <Box x={438} y={130} w={140} h={50} label="Gateway" c="c" fs={11} />
      <Arrow x1={428} y1={75} x2={438} y2={75} c="n" plain />
      <Arrow x1={478} y1={130} x2={478} y2={100} c="n" plain />
      <Arrow x1={428} y1={155} x2={438} y2={155} c="n" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'monolith-vs-microservices',
  num: 23,
  unit: 'Architecture Style & Reliability',
  title: 'Monolith vs Microservices',
  blurb:
    'A monolith is one deployable unit; microservices split the system by business domain into independently deployable services.',
  minutes: 10,
  tags: ['Very common', 'Architecture'],

  sections: [
    {
      id: 'analogy',
      heading: 'The joint family analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A <b>monolith</b> is one joint family living in one house, sharing the kitchen, the budget, and every
              decision. <b>Microservices</b> are separate nuclear families in separate houses — each independent day
              to day, but still needing to coordinate for family events like weddings.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Neither is inherently better — a joint family is simpler to run when small, but gets harder to
              coordinate as it grows; separate houses give freedom but add the overhead of getting everyone in the
              same room.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one is actually built',
      blocks: [
        { k: 'diagram', el: <MonolithDiagram />, caption: 'One shared codebase and database vs independent services each with their own.' },
        {
          k: 'p',
          text: (
            <>
              A <b>monolith</b> shares one codebase, one build, one deploy, and usually one database. It's simple to
              develop, test, and reason about early on — there's no network between modules, just function calls.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Microservices</b> split the system along business domains — orders, payments, search — each with its
              own codebase, deploy pipeline, and often its own database. Teams can own, scale, and ship their service
              independently, at the cost of network calls between services, distributed debugging, and real
              operational overhead (service discovery, monitoring, versioned APIs).
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where the split actually pays off',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A startup usually ships a <b>monolith</b> first — one team, one deploy, fast iteration with no network
              overhead to fight.
            </>,
            <>
              As the "search" team and "payments" team start blocking each other's deploys and scaling needs diverge,
              splitting those into <b>services</b> starts paying off.
            </>,
            <>
              Netflix and Amazon run large microservice fleets today, but both started as monoliths and split only
              once team and traffic scale demanded it.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Microservices aren't inherently "better" — they solve an <b>organisational</b> scaling problem (many
              teams needing to move independently) more than a technical one, and they add real cost: network
              latency, partial failures, and distributed transactions that a monolith never has to deal with.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the core difference between a monolith and microservices?',
      a: (
        <>
          A monolith is one deployable unit with a shared codebase and usually one database. Microservices split the
          system into independently deployable services, each owning its own domain and often its own database.
        </>
      ),
    },
    {
      q: 'Why would a team choose microservices over a monolith?',
      a: (
        <>
          To let multiple teams deploy and scale independently without blocking each other, and to scale individual
          hot paths (e.g. search) without over-provisioning the whole system.
        </>
      ),
    },
    {
      q: 'What are the real costs of microservices?',
      a: (
        <>
          Network calls replace function calls (latency, partial failures), debugging spans multiple services,
          and you need infrastructure for service discovery, distributed tracing, and versioned APIs — all absent in
          a monolith.
        </>
      ),
    },
    {
      q: 'Should a new startup start with microservices?',
      a: (
        <>
          Usually no — a monolith is faster to build and iterate on with one small team. Split into services once
          specific domains have genuinely different scaling or team-ownership needs.
        </>
      ),
    },
    {
      q: 'Is the microservices decision mainly technical or organisational?',
      a: (
        <>
          Mostly organisational — it solves the problem of multiple teams needing to deploy and scale independently.
          A single team rarely needs the operational overhead microservices bring.
        </>
      ),
    },
    {
      q: 'What is a common mistake teams make when adopting microservices?',
      a: (
        <>
          Splitting services along technical layers (e.g. "UI service", "DB service") instead of business domains,
          which just recreates the monolith's coupling but now over the network, with worse latency.
        </>
      ),
    },
  ],
};

export default topic;
