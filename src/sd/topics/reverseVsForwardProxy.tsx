import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Reverse proxy hides servers from clients; forward proxy hides clients from servers. */
function ProxyDiagram() {
  return (
    <Dg w={600} h={260} cap="A reverse proxy hides servers from clients; a forward proxy hides clients from servers">
      <Frame x={2} y={8} w={280} h={244} label="REVERSE PROXY" c="a" />
      <Box x={30} y={44} w={90} h={36} label="Client" c="n" fs={11} />
      <Box x={160} y={44} w={90} h={36} label="Client" c="n" fs={11} />
      <Arrow x1={75} y1={80} x2={142} y2={116} c="n" />
      <Arrow x1={205} y1={80} x2={142} y2={116} c="n" />
      <Box x={82} y={118} w={120} h={40} label="Reverse proxy" c="a" fs={11} />
      <Arrow x1={142} y1={158} x2={142} y2={186} c="a" />
      <Box x={82} y={188} w={120} h={40} label="Server(s)" c="a" fs={11} />
      <Txt x={142} y={244} fs={11} soft>
        clients never see the server
      </Txt>

      <Frame x={318} y={8} w={280} h={244} label="FORWARD PROXY" c="b" />
      <Box x={346} y={44} w={120} h={36} label="Client" c="b" fs={11} />
      <Arrow x1={406} y1={80} x2={406} y2={116} c="b" />
      <Box x={346} y={118} w={120} h={40} label="Forward proxy" c="b" fs={11} />
      <Arrow x1={406} y1={158} x2={430} y2={186} c="n" />
      <Arrow x1={406} y1={158} x2={520} y2={186} c="n" />
      <Box x={360} y={188} w={90} h={40} label="Server" c="n" fs={11} />
      <Box x={478} y={188} w={90} h={40} label="Server" c="n" fs={11} />
      <Txt x={458} y={244} fs={11} soft>
        servers never see the client
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'reverse-vs-forward-proxy',
  num: 7,
  unit: 'Networking & Traffic',
  title: 'Reverse Proxy vs Forward Proxy',
  blurb:
    'A reverse proxy sits in front of servers and hides them from clients; a forward proxy sits in front of clients and hides them from servers.',
  minutes: 8,
  tags: ['Definition-heavy', 'Trade-off question'],

  sections: [
    {
      id: 'analogy',
      heading: 'The receptionist vs travel agent analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A <b>reverse proxy</b> is a company receptionist who takes every visitor call and forwards it to the
              right employee, so no visitor gets an employee's direct number. A <b>forward proxy</b> is a travel
              agent who books things on your behalf, hiding your identity from the seller.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Both terms describe an intermediary — the difference is entirely about <b>whose identity is being
              hidden from whom</b>.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'What each one actually protects',
      blocks: [
        {
          k: 'diagram',
          el: <ProxyDiagram />,
          caption: 'Reverse proxy: clients never see the real server. Forward proxy: servers never see the real client.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>reverse proxy</b> terminates client connections and forwards them to internal servers on the
              provider's side — it can add TLS termination, caching, and load balancing in one place, and clients
              only ever talk to the proxy's address, never the real backend.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>forward proxy</b> relays outbound requests on behalf of clients — the destination server only
              ever sees the proxy's identity, not the original client's. It's typically deployed on the client's
              side of the connection for anonymity or filtering, the mirror image of a reverse proxy's placement.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where each one shows up',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Nginx</b> sitting in front of your app servers, terminating TLS and load balancing, is a{' '}
              <b>reverse proxy</b>.
            </>,
            <>
              A <b>company VPN client</b> routing employee traffic out through one corporate exit point is a{' '}
              <b>forward proxy</b>, often used for content filtering or anonymity.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Interviewers commonly ask you to name which one a load balancer or CDN edge node actually is — it's
              always a <b>reverse proxy</b>, since it sits in front of servers, not clients.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between a reverse proxy and a forward proxy?',
      a: (
        <>
          A reverse proxy sits in front of servers and hides them from clients — clients only see the proxy. A
          forward proxy sits in front of clients and hides them from servers — the server only sees the proxy.
        </>
      ),
    },
    {
      q: 'Is a load balancer a forward proxy or a reverse proxy?',
      a: <>A reverse proxy — it sits in front of a pool of servers and clients never talk to the backend directly.</>,
    },
    {
      q: 'What extra responsibilities can a reverse proxy take on?',
      a: (
        <>
          TLS termination, caching, load balancing, and request routing — centralising cross-cutting concerns in one
          place in front of the actual application servers.
        </>
      ),
    },
    {
      q: 'Give a real-world example of a forward proxy.',
      a: (
        <>
          A corporate VPN or proxy server that all employee traffic routes through — the destination website only
          sees the proxy's IP, not the individual employee's.
        </>
      ),
    },
    {
      q: 'Why would a company use a forward proxy?',
      a: <>For anonymity of internal clients, content filtering/access control, or centralised outbound traffic monitoring.</>,
    },
    {
      q: 'Is a CDN edge node a reverse proxy?',
      a: (
        <>
          Yes — it sits in front of the origin server, caches and serves content on its behalf, and clients never
          connect to the origin directly.
        </>
      ),
    },
  ],
};

export default topic;
