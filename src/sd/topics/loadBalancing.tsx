import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A load balancer spreading requests across a server pool, with a dead node pulled out. */
function LoadBalancerDiagram() {
  return (
    <Dg w={600} h={240} cap="A load balancer spreads incoming requests across a pool of servers, skipping unhealthy ones">
      <Box x={20} y={90} w={110} h={50} label="Clients" c="n" fs={12} />
      <Arrow x1={130} y1={115} x2={200} y2={115} c="n" />
      <Box x={200} y={90} w={140} h={50} label="Load balancer" sub="round-robin / least-conn" c="a" fs={12} />

      <Arrow x1={340} y1={100} x2={430} y2={40} c="b" />
      <Box x={430} y={16} w={130} h={44} label="Server 1" c="b" fs={12} />

      <Arrow x1={340} y1={115} x2={430} y2={115} c="b" />
      <Box x={430} y={92} w={130} h={44} label="Server 2" c="b" fs={12} />

      <Arrow x1={340} y1={130} x2={430} y2={190} c="n" dashed />
      <Box x={430} y={168} w={130} h={44} label="Server 3" sub="health check failed" c="c" fs={11} dashed />

      <Txt x={495} y={224} fs={11} soft>
        removed from rotation
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'load-balancing',
  num: 6,
  unit: 'Networking & Traffic',
  title: 'Load Balancing',
  blurb:
    'Distributes incoming requests across a pool of servers so no single instance is overwhelmed, and routes around unhealthy ones automatically.',
  minutes: 9,
  tags: ['Very common', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The mall checkout analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a mall with multiple checkout counters and a guard directing each new customer to the shortest
              queue instead of everyone piling onto one counter. The guard doesn't process any purchases — it just
              decides where each customer goes.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A load balancer plays exactly that role in front of a fleet of servers: it doesn't do the work itself,
              it decides which server does.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'Layers and algorithms',
      blocks: [
        {
          k: 'diagram',
          el: <LoadBalancerDiagram />,
          caption: 'Requests are spread across healthy servers; an unhealthy one is pulled out of rotation.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>L4 balancers</b> route based on IP/port without reading the request itself — fast and
              protocol-agnostic, but blind to what's actually being requested. <b>L7 balancers</b> read the actual
              HTTP request and can route by path, header, or cookie, e.g. sending <code>/api/*</code> to one fleet
              and <code>/static/*</code> to another.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Common algorithms: <b>round-robin</b> spreads requests evenly in a fixed rotation; <b>least-connections</b>{' '}
              sends new requests to whichever server currently has the fewest active connections, adapting to
              uneven load; <b>consistent hashing</b> maps the same client to the same server whenever possible,
              useful when that server has cached something for that client.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Real deployments and the failure mode',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Nginx or a cloud ALB in front of a fleet of API servers, with <b>health checks</b> continuously
              pinging each instance and pulling dead ones out of rotation automatically.
            </>,
            <>
              Consistent hashing is common in front of caching layers, so repeat requests from the same user tend to
              land on a server that already has their data warm in memory.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              The load balancer itself becomes a single point of failure unless it's deployed in a redundant pair
              (active-passive or active-active) with a floating IP or DNS failover in front of it.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between L4 and L7 load balancing?',
      a: (
        <>
          L4 routes based on IP/port without inspecting the request — fast and protocol-agnostic. L7 reads the
          actual HTTP request and can route by path, header, or cookie, enabling smarter, content-aware routing.
        </>
      ),
    },
    {
      q: 'Name three load balancing algorithms and how they differ.',
      a: (
        <>
          Round-robin cycles through servers evenly. Least-connections sends new requests to the server with fewest
          active connections, adapting to uneven load. Consistent hashing maps the same client to the same server,
          useful for cache locality.
        </>
      ),
    },
    {
      q: 'How does a load balancer detect and handle an unhealthy server?',
      a: (
        <>
          Via periodic health checks (e.g. pinging a /health endpoint). A server that fails checks is pulled out of
          rotation automatically until it starts passing again.
        </>
      ),
    },
    {
      q: 'Isn\'t the load balancer itself a single point of failure?',
      a: (
        <>
          Yes, unless it's deployed redundantly — typically an active-passive or active-active pair behind a
          floating IP or DNS-based failover, so one balancer dying doesn't take down all traffic routing.
        </>
      ),
    },
    {
      q: 'When would you prefer least-connections over round-robin?',
      a: (
        <>
          When request processing times vary a lot — round-robin can overload a server stuck on slow requests, while
          least-connections adapts by sending new traffic to whichever server is least busy right now.
        </>
      ),
    },
    {
      q: 'Why would you use consistent hashing at a load balancer?',
      a: (
        <>
          To keep the same client routed to the same backend server, which helps when that server has cached
          per-client data — avoiding cache misses that would happen if requests were spread randomly.
        </>
      ),
    },
  ],
};

export default topic;
