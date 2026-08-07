import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** All external traffic funnels through one gateway before reaching internal services. */
function ApiGatewayDiagram() {
  return (
    <Dg w={600} h={240} cap="External clients hit a single API gateway, which handles auth and routing before reaching internal services">
      <Box x={20} y={90} w={100} h={50} label="Clients" c="n" fs={12} />
      <Arrow x1={120} y1={115} x2={190} y2={115} c="n" />
      <Box x={190} y={70} w={160} h={90} label="API Gateway" sub="auth · rate limit · route" c="a" fs={13} />

      <Arrow x1={350} y1={90} x2={430} y2={40} c="b" />
      <Box x={430} y={16} w={140} h={44} label="Auth service" c="b" fs={11} />

      <Arrow x1={350} y1={115} x2={430} y2={115} c="b" />
      <Box x={430} y={92} w={140} h={44} label="Search service" c="b" fs={11} />

      <Arrow x1={350} y1={140} x2={430} y2={190} c="b" />
      <Box x={430} y={168} w={140} h={44} label="Orders service" c="b" fs={11} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'api-gateway',
  num: 8,
  unit: 'Networking & Traffic',
  title: 'API Gateway',
  blurb:
    'A single entry point that handles routing, auth, rate limiting and request shaping before traffic reaches internal services.',
  minutes: 8,
  tags: ['Very common', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The office security gate analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like the single security gate at an office building's entrance — everyone checks in once there,
              instead of every floor separately checking IDs. Once past the gate, visitors move freely to whichever
              floor they need.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              An API gateway plays that role for a microservices architecture — centralising the checks that would
              otherwise be duplicated in every single service.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'What the gateway does on every request',
      blocks: [
        {
          k: 'diagram',
          el: <ApiGatewayDiagram />,
          caption: 'Every external request hits the gateway first, then gets routed to the right internal service.',
        },
        {
          k: 'p',
          text: (
            <>
              Every external request hits the gateway first; it <b>validates the auth token</b>, applies{' '}
              <b>per-client rate limits</b>, and then <b>routes</b> the request to the right internal
              microservice based on path or header — keeping that cross-cutting logic out of every individual
              service.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Because this logic lives in one place, individual services can stay focused on their own domain logic
              — the search service, for example, never has to implement its own auth-token parsing or rate-limit
              bookkeeping.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Real deployments and the risk',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Kong</b>, <b>AWS API Gateway</b>, or a custom Express layer deployed in front of a microservices
              fleet, so the "search" service never has to know about auth headers.
            </>,
            <>
              Gateways commonly also handle response shaping — aggregating results from multiple downstream services
              into one response for mobile clients.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              A single gateway can become a bottleneck or single point of failure if not scaled and made redundant
              like any other critical service — it sits on the path of literally every request.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the role of an API gateway in a microservices architecture?',
      a: (
        <>
          It's the single entry point for external traffic — handling authentication, rate limiting, and routing to
          the correct internal service, so that cross-cutting logic isn't duplicated in every microservice.
        </>
      ),
    },
    {
      q: 'Why not let each microservice handle its own auth?',
      a: (
        <>
          It would duplicate the same logic across every service, be harder to update consistently, and increase
          the chance of one service having a gap. Centralising it in the gateway keeps services focused purely on
          their own domain logic.
        </>
      ),
    },
    {
      q: 'What is a downside of using an API gateway?',
      a: (
        <>
          It sits on the path of every request, so it can become a bottleneck or a single point of failure unless
          it's itself scaled and deployed redundantly.
        </>
      ),
    },
    {
      q: 'Name some real API gateway implementations.',
      a: <>Kong, AWS API Gateway, Apigee, or a custom-built layer using something like Express or Nginx.</>,
    },
    {
      q: 'What other responsibilities can an API gateway take on besides auth and routing?',
      a: (
        <>
          Rate limiting per client, request/response transformation, aggregating calls to multiple downstream
          services into one response, and logging/metrics for all incoming traffic.
        </>
      ),
    },
    {
      q: 'How does an API gateway differ from a load balancer?',
      a: (
        <>
          A load balancer mainly distributes traffic across identical instances of one service. An API gateway
          routes to different services based on the request itself, and adds auth, rate limiting, and shaping logic
          on top.
        </>
      ),
    },
  ],
};

export default topic;
