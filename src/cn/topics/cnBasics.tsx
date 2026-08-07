import { Box, Dg, Topo, Txt } from '../dgm';
import type { CnTopic } from '../types';

/** The five standard topologies, drawn to the same scale. */
function Topologies() {
  return (
    <Dg w={620} h={318} cap="The layout decides cost, reliability and what happens when one link fails">
      <Topo x={12} y={10} size={118} kind="bus" label="Bus" />
      <Topo x={150} y={10} size={118} kind="star" label="Star" />
      <Topo x={288} y={10} size={118} kind="ring" label="Ring" />
      <Topo x={426} y={10} size={118} kind="mesh" label="Mesh" />
      <Topo x={150} y={168} size={118} kind="tree" label="Tree" />

      <Txt x={430} y={200} anchor="start" fs={10.5} soft>
        Hybrid = any mix of these.
      </Txt>
      <Txt x={430} y={222} anchor="start" fs={10.5} soft>
        Star is the one you actually
      </Txt>
      <Txt x={430} y={240} anchor="start" fs={10.5} soft>
        meet — every device wired
      </Txt>
      <Txt x={430} y={258} anchor="start" fs={10.5} soft>
        to a central switch.
      </Txt>
      <Txt x={310} y={300} fs={10.5} soft>
        orange dots are hubs or switches · grey lines are links
      </Txt>
    </Dg>
  );
}

/** Bandwidth as pipe width. */
function BandwidthPipe() {
  return (
    <Dg w={580} h={190} cap="Bandwidth is how much fits through per second, not how fast one bit travels">
      <Box x={40} y={40} w={130} h={26} label="1 Mbps" c="n" fs={11} />
      <Box x={40} y={82} w={130} h={44} label="10 Mbps" c="b" fs={11} />
      <Box x={40} y={140} w={130} h={30} label="latency" c="c" fs={11} />

      <Txt x={196} y={58} anchor="start" fs={10.5} soft>
        a narrow pipe — same water speed, less water per second
      </Txt>
      <Txt x={196} y={108} anchor="start" fs={10.5} soft>
        a wider pipe — more data per second
      </Txt>
      <Txt x={196} y={152} anchor="start" fs={10.5} bold c="c">
        a different question entirely: how long one drop takes to arrive
      </Txt>
      <Txt x={196} y={172} anchor="start" fs={10} soft>
        a satellite link can be high-bandwidth and still high-latency
      </Txt>
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-basics',
  num: 1,
  unit: 'Foundations',
  title: 'Networks, Topologies & LAN',
  blurb:
    'What a network actually is, the five topologies and their trade-offs, the bandwidth-vs-latency distinction, and how networks are classified by size.',
  minutes: 10,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'network',
      heading: 'What a network is',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>network</b> is a group of computers or devices, wired or wirelessly connected, so they can share
              files, data or an internet connection with each other. That is the whole definition.
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Node</b> — any device on the network: a computer, printer, phone or router.
            </>,
            <>
              <b>Link</b> — the wired or wireless path connecting two nodes.
            </>,
            <>
              <b>Bandwidth</b> — how much data can pass through a connection per second, like the width of a pipe
              carrying water. Measured in Mbps or Gbps.
            </>,
          ],
        },
        { k: 'diagram', el: <BandwidthPipe />, caption: 'Bandwidth is capacity; latency is delay. They are independent.' },
        {
          k: 'note',
          tone: 'exam',
          title: 'Bandwidth vs latency vs throughput',
          text: (
            <>
              <b>Bandwidth</b> is the maximum capacity of the link. <b>Latency</b> is how long one packet takes to
              get there. <b>Throughput</b> is what you actually achieve in practice, which is always ≤ bandwidth.
              A satellite link can have enormous bandwidth and terrible latency at the same time — being able to
              separate these three is what the question is testing.
            </>
          ),
        },
      ],
    },

    {
      id: 'topology',
      heading: 'Network topology and its types',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Topology</b> is the layout — the pattern in which devices are connected to each other.
            </>
          ),
        },
        { k: 'diagram', el: <Topologies />, caption: 'The same five devices, wired five ways.' },
        {
          k: 'table',
          head: ['Topology', 'How it works', 'Strength', 'Weakness'],
          rows: [
            ['Bus', 'Every device shares one main cable, like stops along a bus route', 'Cheap, little cabling', 'One cable break kills the whole network; collisions'],
            ['Star', 'Every device connects to one central hub or switch', 'Easy to add devices; one failed link affects only that device', 'The central device is a single point of failure'],
            ['Ring', 'Devices form a circle; data travels one way round the loop', 'No collisions — orderly access', 'One break can bring down the ring'],
            ['Mesh', 'Every device connects directly to every other', 'Extremely reliable — many alternative paths', 'Very expensive; n(n−1)/2 links'],
            ['Tree', 'Several star networks linked in a hierarchy', 'Scales well; easy to segment', 'The root is a single point of failure'],
            ['Hybrid', 'A mix of two or more of the above', 'Flexible — real networks are this', 'Complex to design and troubleshoot'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>Star is the answer to "which is used today"</b> — every device plugged into a central switch. Bus
              and ring are historical, and full mesh is reserved for backbones where the reliability justifies the
              cost.
            </>
          ),
        },
      ],
    },

    {
      id: 'by-size',
      heading: 'Networks classified by size',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>LAN</b> (Local Area Network) connects devices within a small area — a home, office or school
              building. It is fast, and mostly wired or wifi within that local space.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Type', 'Covers', 'Speed', 'Example'],
          rows: [
            ['LAN — Local Area Network', 'One building or site', 'Very fast', 'Home wifi, an office floor'],
            ['MAN — Metropolitan Area Network', 'A city', 'Fast', 'A campus network, a city cable network'],
            ['WAN — Wide Area Network', 'Countries or the globe', 'Slower', 'The internet itself'],
            ['PAN — Personal Area Network', 'A few metres around you', 'Short range', 'Bluetooth earphones, a smartwatch'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a computer network?',
      a: (
        <>
          A group of devices connected by wired or wireless links so they can exchange data and share resources —
          files, printers, an internet connection.
        </>
      ),
    },
    {
      q: 'What is network topology, and which types exist?',
      a: (
        <>
          The physical or logical layout of the connections. The types are <b>bus</b>, <b>star</b>, <b>ring</b>,{' '}
          <b>mesh</b>, <b>tree</b> and <b>hybrid</b>.
        </>
      ),
    },
    {
      q: 'Which topology is most common today, and why?',
      a: (
        <>
          <b>Star.</b> Every device has its own link to a central switch, so one failed cable affects only that
          device, adding a device needs no rewiring of the others, and the switch can send traffic only where it
          belongs. The trade-off is that the central switch is a single point of failure.
        </>
      ),
    },
    {
      q: 'Why is mesh topology reliable but rarely used?',
      a: (
        <>
          Every node has a direct link to every other, so there are many alternative paths and no single failure
          disconnects anything. But a full mesh needs <b>n(n−1)/2</b> links — 45 cables for just 10 devices — so the
          cost and cabling become impractical outside backbone networks.
        </>
      ),
    },
    {
      q: 'Difference between bandwidth and latency?',
      a: (
        <>
          <b>Bandwidth</b> is capacity — how much data can pass per second. <b>Latency</b> is delay — how long a
          single packet takes to arrive. They are independent: a satellite link can have very high bandwidth and
          very high latency at the same time.
        </>
      ),
    },
    {
      q: 'What is a node and what is a link?',
      a: (
        <>
          A <b>node</b> is any device attached to the network — computer, phone, printer, router. A <b>link</b> is
          the wired or wireless connection between two nodes.
        </>
      ),
    },
    {
      q: 'Difference between LAN, MAN and WAN?',
      a: (
        <>
          <b>LAN</b> covers a single building or site and is the fastest. <b>MAN</b> spans a city. <b>WAN</b> spans
          countries or the world — the internet is the largest WAN. Speed generally falls and cost rises as the area
          grows.
        </>
      ),
    },
  ],
};

export default topic;
