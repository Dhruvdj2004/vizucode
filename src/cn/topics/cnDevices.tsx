import { Arrow, Box, Dg, Dot, Frame, Txt, Wire } from '../dgm';
import type { CnTopic } from '../types';

/** A hub floods every port; a switch sends only where it must. */
function HubVsSwitch() {
  const panel = (fx: number, hub: boolean) => {
    const cx = fx + 148;
    const cy = 118;
    const ports: [number, number][] = [
      [fx + 46, 62],
      [fx + 250, 62],
      [fx + 46, 178],
      [fx + 250, 178],
    ];
    return (
      <g key={fx}>
        {ports.map(([px, py], i) => (
          <Wire key={i} x1={cx} y1={cy} x2={px} y2={py} c={hub || i === 1 ? (hub ? 'c' : 'b') : 'n'} w={hub || i === 1 ? 2.2 : 1.4} />
        ))}
        {ports.map(([px, py], i) => (
          <Box
            key={`b${i}`}
            x={px - 34}
            y={py - 15}
            w={68}
            h={30}
            label={i === 0 ? 'sender' : `PC ${i + 1}`}
            c={i === 0 ? 'a' : hub ? 'c' : i === 1 ? 'b' : 'n'}
            fs={10}
            r={5}
          />
        ))}
        <Box x={cx - 44} y={cy - 22} w={88} h={44} label={hub ? 'HUB' : 'SWITCH'} c={hub ? 'c' : 'b'} fs={12} />
      </g>
    );
  };
  return (
    <Dg w={608} h={252} cap="The same frame, sent through a hub and through a switch">
      <Frame x={2} y={8} w={292} h={238} label="HUB — layer 1" c="c" />
      {panel(2, true)}
      <Txt x={148} y={222} fs={10.5} soft>
        copies the frame to every port
      </Txt>
      <Txt x={148} y={240} fs={10.5} bold c="c">
        wasteful, collision-prone, insecure
      </Txt>

      <Frame x={314} y={8} w={292} h={238} label="SWITCH — layer 2" c="b" />
      {panel(314, false)}
      <Txt x={460} y={222} fs={10.5} soft>
        reads the MAC, sends to that port only
      </Txt>
      <Txt x={460} y={240} fs={10.5} bold c="b">
        faster, private, no collisions
      </Txt>
    </Dg>
  );
}

/** A load balancer fanning requests out to a pool of servers. */
function LoadBalancer() {
  return (
    <Dg w={600} h={230} cap="One entry point, many backends — no single server takes the whole load">
      {[50, 110, 170].map((y, i) => (
        <Box key={y} x={16} y={y - 16} w={92} h={32} label={`client ${i + 1}`} c="n" fs={10.5} />
      ))}
      {[50, 110, 170].map((y) => (
        <Arrow key={y} x1={110} y1={y} x2={196} y2={110} c="n" />
      ))}
      <Box x={198} y={82} w={116} h={56} label="Load" sub="balancer" c="a" />
      {[50, 110, 170].map((y) => (
        <Arrow key={`o${y}`} x1={316} y1={110} x2={402} y2={y} c="b" />
      ))}
      {[50, 110, 170].map((y, i) => (
        <Box key={`s${y}`} x={404} y={y - 18} w={110} h={36} label={`server ${i + 1}`} c="b" fs={10.5} />
      ))}
      <Txt x={300} y={210} fs={10.5} soft>
        also gives you health checks, zero-downtime deploys and horizontal scaling
      </Txt>
    </Dg>
  );
}

/** Where each of the four delays happens. */
function Delays() {
  return (
    <Dg w={608} h={216} cap="Four different waits, all between one sender and one receiver">
      <Box x={16} y={78} w={92} h={44} label="Sender" c="a" fs={11.5} />
      <Wire x1={108} y1={100} x2={228} y2={100} c="n" w={2.4} />
      <Box x={230} y={70} w={110} h={60} label="Router" c="n" fs={11.5} />
      <Wire x1={340} y1={100} x2={476} y2={100} c="n" w={2.4} />
      <Box x={478} y={78} w={100} h={44} label="Receiver" c="b" fs={11.5} />

      <Txt x={168} y={62} fs={10} bold c="a">
        transmission
      </Txt>
      <Txt x={168} y={144} fs={10} soft>
        pushing bits onto the link
      </Txt>

      <Txt x={168} y={166} fs={10} bold c="c">
        propagation
      </Txt>
      <Txt x={168} y={182} fs={10} soft>
        signal travelling the distance
      </Txt>

      <Txt x={285} y={54} fs={10} bold c="a">
        queuing
      </Txt>
      <Txt x={285} y={152} fs={10} soft>
        waiting in the buffer
      </Txt>
      <Txt x={285} y={168} fs={10} bold c="a">
        + processing
      </Txt>
      <Txt x={285} y={184} fs={10} soft>
        reading the header
      </Txt>

      <Txt x={304} y={210} fs={10.5} soft>
        only queuing delay varies with congestion — the other three are fairly fixed
      </Txt>
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-devices',
  num: 4,
  unit: 'Addressing & Devices',
  title: 'Hubs, Switches, Routers, Gateways & Delays',
  blurb:
    'Which device works at which layer and why it matters, gateway versus router, what load balancers buy you, ping, and the four kinds of network delay.',
  minutes: 11,
  tags: ['Very common'],

  sections: [
    {
      id: 'hub-switch',
      heading: 'Hub vs switch',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Hub</b> — a dumb device that broadcasts incoming data to <b>every</b> connected device, causing
              collisions. Works at the <b>Physical</b> layer.
            </>,
            <>
              <b>Switch</b> — a smarter device that sends data only to the specific device it is meant for, using{' '}
              <b>MAC addresses</b>. Works at the <b>Data Link</b> layer, and is faster and more secure.
            </>,
          ],
        },
        { k: 'diagram', el: <HubVsSwitch />, caption: 'A hub cannot tell frames apart; a switch learns which MAC is on which port.' },
        {
          k: 'note',
          tone: 'exam',
          title: 'Collision domains',
          text: (
            <>
              A hub puts every port in <b>one collision domain</b> — two devices transmitting at once garble each
              other. A switch gives <b>each port its own collision domain</b>, which is the real reason it is faster.
              Both keep all ports in a single <b>broadcast</b> domain; separating those needs a router or VLANs.
            </>
          ),
        },
      ],
    },

    {
      id: 'router-gateway',
      heading: 'Gateway vs router',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Gateway</b> — a device or point that connects two <i>different types</i> of network, for example
              your home network to the internet, or two networks running different protocols. It is the broader,
              more general term, and it can <b>translate</b> between protocols.
            </>,
            <>
              <b>Router</b> — forwards data between networks using <b>IP addresses</b>, typically within the same
              protocol family such as LAN to WAN.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Every router can act as a gateway, but a gateway is the broader idea: a router <i>directs</i> traffic,
              while a gateway may also <i>translate</i> between entirely different protocols. In practice your home
              router is also your default gateway.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Device', 'Layer', 'Forwards using', 'Separates'],
          rows: [
            ['Hub', '1 — Physical', 'Nothing; it repeats signals', 'Nothing'],
            ['Switch', '2 — Data Link', 'MAC addresses', 'Collision domains'],
            ['Router', '3 — Network', 'IP addresses', 'Broadcast domains'],
            ['Gateway', 'Up to 7', 'Whatever it must translate', 'Entire protocol families'],
          ],
        },
      ],
    },

    {
      id: 'load-balancer',
      heading: 'Server-side load balancer',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Distributes incoming client requests across multiple servers so no single server gets overloaded,
              improving speed, reliability and uptime.
            </>
          ),
        },
        { k: 'diagram', el: <LoadBalancer />, caption: 'Clients see one address; the pool behind it can change freely.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Health checks</b> — it stops sending traffic to a server that has stopped responding.
            </>,
            <>
              <b>Horizontal scaling</b> — add another server to the pool instead of buying a bigger one.
            </>,
            <>
              <b>Zero-downtime deploys</b> — drain one server, update it, put it back, repeat.
            </>,
            <>
              Common strategies: <b>round robin</b>, <b>least connections</b>, and <b>IP hash</b> when a user must
              keep hitting the same server.
            </>,
          ],
        },
      ],
    },

    {
      id: 'ping',
      heading: 'The ping command',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <code>ping</code> checks whether another device or website is reachable. It sends a small packet,
              waits for a reply, and reports the time taken — useful for testing connectivity and latency.
            </>
          ),
        },
        {
          k: 'code',
          title: 'What you actually learn from it',
          code: `$ ping google.com
64 bytes from 142.250.196.14: icmp_seq=0 ttl=115 time=12.4 ms
64 bytes from 142.250.196.14: icmp_seq=1 ttl=115 time=11.9 ms

  name resolved       -> DNS is working
  replies coming back -> the host is reachable, routing is fine
  time=12 ms          -> round-trip latency
  no reply            -> host down, blocked by a firewall, or route broken`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              It uses <b>ICMP</b>, not TCP or UDP. A failed ping does <i>not</i> prove the host is down — many
              servers and firewalls deliberately drop ICMP while serving traffic perfectly. Use{' '}
              <code>traceroute</code> to find <i>where</i> a path breaks.
            </>
          ),
        },
      ],
    },

    {
      id: 'delays',
      heading: 'The four types of delay',
      blocks: [
        { k: 'diagram', el: <Delays />, caption: 'Total delay is the sum of all four, at every hop.' },
        {
          k: 'table',
          head: ['Delay', 'What it is', 'Depends on'],
          rows: [
            ['Propagation', 'Time for the signal to physically travel from sender to receiver', 'Distance and the medium — roughly the speed of light'],
            ['Transmission', 'Time to push all the bits of a packet onto the link', 'Packet size ÷ link bandwidth'],
            ['Queuing', 'Time a packet waits in line at a router before being handled', 'Congestion — the only one that varies a lot'],
            ['Processing', 'Time a router takes to read the header and decide where to send it', 'Router speed; usually microseconds'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              <b>Transmission vs propagation</b> is the trap. Transmission depends on how <i>big</i> the packet is
              and how <i>fast</i> the link is; propagation depends on how <i>far</i> it has to go. A short packet on
              a slow satellite link has tiny transmission delay and huge propagation delay.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between a hub and a switch?',
      a: (
        <>
          A <b>hub</b> works at layer 1 and blindly repeats an incoming frame to every port, so all ports share one
          collision domain. A <b>switch</b> works at layer 2, learns which MAC address is on which port, and
          forwards only to the correct port — giving each port its own collision domain, and making it faster and
          more secure.
        </>
      ),
    },
    {
      q: 'Difference between a router and a switch?',
      a: (
        <>
          A <b>switch</b> connects devices <i>within</i> one network and forwards on MAC addresses (layer 2). A{' '}
          <b>router</b> connects <i>different</i> networks and forwards on IP addresses (layer 3). A router also
          separates broadcast domains, which a switch does not.
        </>
      ),
    },
    {
      q: 'Difference between a gateway and a router?',
      a: (
        <>
          A <b>router</b> forwards packets between networks using IP, usually within the same protocol family. A{' '}
          <b>gateway</b> is the broader concept — a node joining two dissimilar networks, potentially{' '}
          <b>translating</b> between different protocols. Every router can act as a gateway; not every gateway is
          just a router.
        </>
      ),
    },
    {
      q: 'What does the ping command do, and what does it use?',
      a: (
        <>
          It tests reachability and latency by sending <b>ICMP</b> echo requests and timing the replies. It confirms
          DNS resolution, that a route exists and the round-trip time. A failure does not prove the host is down —
          many hosts block ICMP deliberately.
        </>
      ),
    },
    {
      q: 'What is a load balancer and what does it give you?',
      a: (
        <>
          A device or service that spreads incoming requests across a pool of servers so none is overloaded. Beyond
          throughput it provides health checking (route around a dead server), horizontal scaling, and zero-downtime
          deployments by draining servers one at a time.
        </>
      ),
    },
    {
      q: 'Name the four types of network delay.',
      a: (
        <>
          <b>Propagation</b> (signal travelling the distance), <b>transmission</b> (pushing the bits onto the link),{' '}
          <b>queuing</b> (waiting in a router's buffer) and <b>processing</b> (the router reading the header).
        </>
      ),
    },
    {
      q: 'Difference between transmission delay and propagation delay?',
      a: (
        <>
          <b>Transmission</b> = packet size ÷ bandwidth — how long to get all the bits onto the wire.{' '}
          <b>Propagation</b> = distance ÷ signal speed — how long the first bit takes to arrive. Bigger packets
          raise the first; longer distances raise the second.
        </>
      ),
    },
    {
      q: 'Which delay causes congestion problems?',
      a: (
        <>
          <b>Queuing delay.</b> The other three are essentially fixed for a given packet, link and route, but
          queuing grows without bound as a router's arrival rate approaches its service rate — which is what
          congestion actually feels like, and why packets start being dropped.
        </>
      ),
    },
  ],
};

export default topic;
