import { Arrow, Box, Dg, Frame } from '../dgm';
import type { SdTopic } from '../types';

/** A caller resolving a live instance address via a registry vs a fixed gateway. */
function DiscoveryDiagram() {
  return (
    <Dg w={600} h={280} cap="Client-side discovery via a registry vs server-side discovery via a load balancer">
      <Frame x={2} y={8} w={280} h={256} label="CLIENT-SIDE" c="a" />
      <Box x={50} y={40} w={130} h={40} label="Client" c="n" fs={12} />
      <Box x={50} y={190} w={130} h={40} label="Instance B" c="a" fs={11} />
      <Box x={160} y={130} w={110} h={40} label="Registry" sub="Consul / Eureka" c="c" fs={10} />
      <Arrow x1={115} y1={80} x2={200} y2={130} c="c" label="1. lookup" dx={30} />
      <Arrow x1={140} y1={80} x2={100} y2={190} c="a" label="2. call" dx={-20} />

      <Frame x={318} y={8} w={280} h={256} label="SERVER-SIDE" c="b" />
      <Box x={370} y={40} w={130} h={40} label="Client" c="n" fs={12} />
      <Box x={370} y={120} w={130} h={40} label="Load balancer" c="b" fs={11} />
      <Box x={340} y={200} w={80} h={40} label="Instance 1" c="b" fs={10} />
      <Box x={430} y={200} w={80} h={40} label="Instance 2" c="b" fs={10} />
      <Arrow x1={435} y1={80} x2={435} y2={120} c="b" label="fixed address" dx={0} />
      <Arrow x1={415} y1={160} x2={380} y2={200} c="n" plain />
      <Arrow x1={455} y1={160} x2={470} y2={200} c="n" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'service-discovery',
  num: 24,
  unit: 'Architecture Style & Reliability',
  title: 'Service Discovery',
  blurb:
    'How a service finds the current network address of another service when instances scale up, down, or move around.',
  minutes: 8,
  tags: ['Microservices', 'Infra'],

  sections: [
    {
      id: 'analogy',
      heading: 'The office directory board analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              It's like a directory board in an office lobby that tells you which floor a department has moved to,
              instead of you needing to remember it yourself. As departments relocate, the board updates — you never
              memorise a fixed floor number.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              In a system with dozens of service instances constantly starting, crashing, and scaling, hard-coding IP
              addresses breaks the moment anything changes. Service discovery is the mechanism that keeps addresses
              current.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How discovery actually works',
      blocks: [
        { k: 'diagram', el: <DiscoveryDiagram />, caption: 'Client-side: caller queries a registry itself. Server-side: caller hits a fixed address that gets resolved for it.' },
        {
          k: 'p',
          text: (
            <>
              <b>Client-side discovery</b>: the caller queries a registry (Consul, Eureka, ZooKeeper) that holds a
              live list of healthy instances, then picks one itself — often with its own load-balancing logic. More
              control, but every client needs registry-aware logic.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Server-side discovery</b>: the caller just hits a fixed address (a load balancer or gateway), which
              looks up the registry on the caller's behalf and forwards the request to a live instance. The caller
              stays simple; the smarts move to shared infrastructure.
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
              In <b>Kubernetes</b>, a Service object gives every pod group a stable DNS name; pods can come and go as
              they scale or crash without callers needing to track individual pod IPs — this is server-side
              discovery.
            </>,
            <>
              Netflix's <b>Eureka</b> is a classic client-side registry: services register themselves on startup and
              deregister on shutdown, and clients cache the instance list locally.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              The registry itself needs to be <b>highly available</b> — every other service depends on it to
              function. Registries (Consul, etcd) typically run as a clustered, self-replicating quorum precisely
              because they can't be a single point of failure.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem does service discovery solve?',
      a: (
        <>
          It lets a service find the current network address of another service, even as instances scale up, scale
          down, crash, or get rescheduled — so callers never hard-code IPs.
        </>
      ),
    },
    {
      q: 'What is the difference between client-side and server-side discovery?',
      a: (
        <>
          Client-side: the caller queries a registry and picks an instance itself. Server-side: the caller hits a
          fixed address (a load balancer/gateway) that resolves the actual instance on its behalf.
        </>
      ),
    },
    {
      q: 'Give an example of server-side discovery.',
      a: <>Kubernetes Services — a stable DNS name backed by a load balancer that routes to healthy pods.</>,
    },
    {
      q: 'Why does the service registry itself need to be highly available?',
      a: (
        <>
          Every other service depends on it to resolve addresses — if the registry goes down, services can't find
          each other even if they're individually healthy. That's why registries run as replicated clusters.
        </>
      ),
    },
    {
      q: 'How does a registry know an instance is no longer healthy?',
      a: (
        <>
          Via periodic heartbeats or health checks — instances that stop responding are removed from the registry so
          traffic stops being routed to them.
        </>
      ),
    },
    {
      q: 'What is a trade-off of client-side discovery?',
      a: (
        <>
          It gives the caller more control over load-balancing, but every client needs registry-aware logic, which
          duplicates that logic across every service in the system.
        </>
      ),
    },
  ],
};

export default topic;
