import { Arrow, Dg, Stack, Txt } from '../dgm';
import type { CnTopic } from '../types';

/** OSI's seven layers beside the four TCP/IP layers they collapse into. */
function OsiVsTcpIp() {
  return (
    <Dg w={620} h={330} cap="The same job, split seven ways in theory and four ways in practice">
      <Stack
        x={16}
        y={40}
        w={286}
        rowH={34}
        title="OSI — the teaching model"
        layers={[
          { n: 7, name: 'Application', eg: 'browser, email', c: 'c' },
          { n: 6, name: 'Presentation', eg: 'format, encrypt', c: 'c' },
          { n: 5, name: 'Session', eg: 'open / close', c: 'c' },
          { n: 4, name: 'Transport', eg: 'TCP, UDP', c: 'a' },
          { n: 3, name: 'Network', eg: 'IP, routing', c: 'b' },
          { n: 2, name: 'Data Link', eg: 'MAC, switches', c: 'n' },
          { n: 1, name: 'Physical', eg: 'cables, signals', c: 'n' },
        ]}
      />

      <Stack
        x={342}
        y={40}
        w={262}
        rowH={34}
        title="TCP/IP — what is actually used"
        layers={[{ n: 4, name: 'Application', eg: 'HTTP, FTP, SMTP', c: 'c' }]}
      />
      <Stack
        x={342}
        y={188}
        w={262}
        rowH={34}
        layers={[
          { n: 3, name: 'Transport', eg: 'TCP, UDP', c: 'a' },
          { n: 2, name: 'Internet', eg: 'IP', c: 'b' },
          { n: 1, name: 'Network Access', eg: 'cables, MAC', c: 'n' },
        ]}
      />
      <Arrow x1={306} y1={91} x2={338} y2={57} c="c" dashed />
      <Arrow x1={306} y1={159} x2={338} y2={57} c="c" dashed />
      <Txt x={322} y={126} fs={9} soft>
        5-7
      </Txt>
      <Arrow x1={306} y1={193} x2={338} y2={205} c="a" dashed />
      <Arrow x1={306} y1={227} x2={338} y2={239} c="b" dashed />
      <Arrow x1={306} y1={278} x2={338} y2={273} c="n" dashed />

      <Txt x={310} y={318} fs={10.5} soft>
        OSI layers 5, 6 and 7 all collapse into TCP/IP's single Application layer
      </Txt>
    </Dg>
  );
}

/** What each layer adds to the packet on the way down. */
function Encapsulation() {
  const row = (y: number, label: string, parts: { w: number; t: string; c: 'a' | 'b' | 'c' | 'n' }[]) => {
    let x = 150;
    return (
      <g key={label}>
        <Txt x={140} y={y + 20} anchor="end" fs={10.5} bold c="n">
          {label}
        </Txt>
        {parts.map((p) => {
          const el = (
            <g key={p.t + x}>
              <rect
                x={x}
                y={y}
                width={p.w}
                height={30}
                rx={4}
                fill={`var(--${p.c === 'a' ? 'accent' : p.c === 'b' ? 'accent-2' : p.c === 'c' ? 'accent-3' : 'surface-2'}${p.c === 'n' ? '' : '-soft'})`}
                stroke={`var(--${p.c === 'a' ? 'accent' : p.c === 'b' ? 'accent-2' : p.c === 'c' ? 'accent-3' : 'ink-faint'})`}
                strokeWidth="1.3"
              />
              <text
                x={x + p.w / 2}
                y={y + 20}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={`var(--${p.c === 'a' ? 'accent' : p.c === 'b' ? 'accent-2' : p.c === 'c' ? 'accent-3' : 'ink'})`}
              >
                {p.t}
              </text>
            </g>
          );
          x += p.w + 2;
          return el;
        })}
      </g>
    );
  };
  return (
    <Dg w={608} h={218} cap="Each layer wraps the one above it in its own header before handing it down">
      {row(20, 'Application', [{ w: 200, t: 'data', c: 'c' }])}
      {row(60, 'Transport', [
        { w: 74, t: 'TCP hdr', c: 'a' },
        { w: 200, t: 'data', c: 'c' },
      ])}
      {row(100, 'Network', [
        { w: 66, t: 'IP hdr', c: 'b' },
        { w: 74, t: 'TCP hdr', c: 'a' },
        { w: 200, t: 'data', c: 'c' },
      ])}
      {row(140, 'Data Link', [
        { w: 76, t: 'frame hdr', c: 'n' },
        { w: 66, t: 'IP hdr', c: 'b' },
        { w: 74, t: 'TCP hdr', c: 'a' },
        { w: 130, t: 'data', c: 'c' },
      ])}
      <Txt x={304} y={196} fs={10.5} soft>
        going up the stack at the receiver, each layer strips its own header off again
      </Txt>
      <Txt x={304} y={214} fs={10} soft>
        segment (transport) → packet (network) → frame (data link)
      </Txt>
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-models',
  num: 2,
  unit: 'Foundations',
  title: 'OSI & TCP/IP Models',
  blurb:
    'The seven OSI layers and the four TCP/IP layers, what each one is responsible for, how they map onto each other, and why the data link layer matters.',
  minutes: 12,
  free: true,
  tags: ['Very common', 'Guaranteed question'],

  sections: [
    {
      id: 'osi',
      heading: 'The OSI model — seven layers',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              OSI is the <b>reference</b> model: a way of splitting "get this data from here to there" into seven
              independent jobs, so each can be designed and replaced on its own.
            </>
          ),
        },
        {
          k: 'table',
          head: ['#', 'Layer', 'Responsible for', 'Example'],
          rows: [
            ['7', 'Application', 'The user-facing service itself', 'Browser, email client'],
            ['6', 'Presentation', 'Formatting, encryption, compression — the translator', 'SSL/TLS, JPEG'],
            ['5', 'Session', 'Opening, maintaining and closing the conversation', 'Session tokens'],
            ['4', 'Transport', 'Reliable end-to-end delivery, segmentation', 'TCP, UDP'],
            ['3', 'Network', 'Logical addressing and routing between networks', 'IP, routers'],
            ['2', 'Data Link', 'Node-to-node delivery on the same link, MAC addressing', 'Ethernet, switches'],
            ['1', 'Physical', 'Actual signals on the wire or in the air', 'Cables, voltages, radio'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Memory trick',
          text: (
            <>
              Top to bottom: <b>All People Seem To Need Data Processing</b> — Application, Presentation, Session,
              Transport, Network, Data Link, Physical.
            </>
          ),
        },
      ],
    },

    {
      id: 'tcp-ip',
      heading: 'The TCP/IP model — four layers',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              TCP/IP is the model the internet actually runs on. It does the same work in four layers, because
              several of OSI's distinctions were never implemented separately in practice.
            </>
          ),
        },
        { k: 'diagram', el: <OsiVsTcpIp />, caption: 'OSI is what you are taught; TCP/IP is what is deployed.' },
        {
          k: 'table',
          head: ['#', 'TCP/IP layer', 'Covers OSI', 'Protocols'],
          rows: [
            ['4', 'Application', 'Application + Presentation + Session', 'HTTP, FTP, SMTP, DNS'],
            ['3', 'Transport', 'Transport', 'TCP, UDP'],
            ['2', 'Internet', 'Network', 'IP, ICMP, ARP'],
            ['1', 'Network Access', 'Data Link + Physical', 'Ethernet, wifi'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'OSI vs TCP/IP — the comparison',
          text: (
            <>
              OSI has <b>7</b> layers, TCP/IP has <b>4</b>. OSI was defined <i>before</i> the protocols and is a
              theoretical reference; TCP/IP was defined <i>around</i> protocols that already worked. OSI strictly
              separates the service from the protocol; TCP/IP does not. In practice OSI is used for teaching and
              troubleshooting vocabulary ("that's a layer 2 problem"), while TCP/IP is what is implemented.
            </>
          ),
        },
      ],
    },

    {
      id: 'encapsulation',
      heading: 'How data moves through the layers',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Going <b>down</b> the stack at the sender, each layer wraps what it received in its own header. This
              is <b>encapsulation</b>. Going up at the receiver, each layer strips its own header off again.
            </>
          ),
        },
        { k: 'diagram', el: <Encapsulation />, caption: 'The unit has a different name at each layer.' },
        {
          k: 'ul',
          items: [
            <>
              Transport layer unit: a <b>segment</b> (TCP) or <b>datagram</b> (UDP).
            </>,
            <>
              Network layer unit: a <b>packet</b>.
            </>,
            <>
              Data link layer unit: a <b>frame</b>.
            </>,
            <>
              Physical layer unit: <b>bits</b>.
            </>,
          ],
        },
      ],
    },

    {
      id: 'data-link',
      heading: 'Significance of the data link layer',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              It takes data handed down from the network layer and prepares it for the physical medium. Concretely
              it:
            </>
          ),
        },
        {
          k: 'ul',
          items: [
            <>
              Adds the source and destination <b>MAC addresses</b> so the frame reaches the right device on this
              link.
            </>,
            <>
              <b>Detects and corrects errors</b> introduced during transfer, using a checksum or CRC.
            </>,
            <>
              <b>Controls access to a shared medium</b>, so two devices transmitting at once do not destroy each
              other's signal — this is where CSMA/CD and CSMA/CA live.
            </>,
            <>
              Performs <b>flow control</b> so a fast sender does not overwhelm a slow receiver.
            </>,
            <>
              It is the layer <b>switches</b> operate at.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The distinction to state clearly',
          text: (
            <>
              The <b>network layer</b> gets a packet across many networks, end to end, using IP addresses. The{' '}
              <b>data link layer</b> gets a frame across <i>one</i> link, hop to hop, using MAC addresses. An IP
              address is the final destination; the MAC address changes at every hop along the way.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Name the seven OSI layers in order.',
      a: (
        <>
          Top to bottom: <b>Application, Presentation, Session, Transport, Network, Data Link, Physical</b> —
          "All People Seem To Need Data Processing".
        </>
      ),
    },
    {
      q: 'Difference between the OSI and TCP/IP models?',
      a: (
        <>
          OSI has <b>7</b> layers and was designed as a theoretical reference before the protocols existed. TCP/IP
          has <b>4</b> and was designed around protocols already in use. TCP/IP's Application layer covers OSI's
          Application, Presentation and Session; its Network Access layer covers Data Link and Physical.
        </>
      ),
    },
    {
      q: 'Which layer does a router work at? A switch? A hub?',
      a: (
        <>
          <b>Router</b> — layer 3, the Network layer, forwarding on IP addresses. <b>Switch</b> — layer 2, the Data
          Link layer, forwarding on MAC addresses. <b>Hub</b> — layer 1, Physical; it just repeats electrical
          signals to every port.
        </>
      ),
    },
    {
      q: 'What is the significance of the data link layer?',
      a: (
        <>
          It delivers frames across a single physical link: it adds source and destination <b>MAC addresses</b>,
          detects and corrects transmission errors, controls access to a shared medium so frames do not collide, and
          does flow control. Switches operate here.
        </>
      ),
    },
    {
      q: 'What is encapsulation?',
      a: (
        <>
          Each layer wrapping the data it receives from the layer above in its own header before passing it down.
          The receiver reverses it, each layer stripping its own header. That is why the same data is called a
          segment, then a packet, then a frame.
        </>
      ),
    },
    {
      q: 'Segment, packet, frame — what is the difference?',
      a: (
        <>
          Names for the data unit at different layers: <b>segment</b> at the Transport layer, <b>packet</b> at the
          Network layer, <b>frame</b> at the Data Link layer, and <b>bits</b> at the Physical layer.
        </>
      ),
    },
    {
      q: 'Which layer does encryption happen at?',
      a: (
        <>
          In the OSI model, the <b>Presentation</b> layer (layer 6) is responsible for encryption, compression and
          formatting. In practice TLS sits between the Application and Transport layers, which is one of the places
          the tidy OSI split does not match reality.
        </>
      ),
    },
    {
      q: 'Why does the OSI model still matter if TCP/IP is what is implemented?',
      a: (
        <>
          Because it gives everyone shared vocabulary for isolating faults — "that is a layer 2 issue" immediately
          narrows the problem to switching or cabling rather than routing or the application. It is a diagnostic and
          teaching framework, not a specification anyone implements literally.
        </>
      ),
    },
  ],
};

export default topic;
