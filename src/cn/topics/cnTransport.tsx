import { Dg, Lifeline, Msg, Txt } from '../dgm';
import type { CnTopic } from '../types';

/** The TCP three-way handshake, and the four-way teardown beside it. */
function Handshake() {
  return (
    <Dg w={608} h={300} cap="Three messages to open a connection, four to close one">
      <Lifeline x={110} y={14} h={250} label="Client" c="a" />
      <Lifeline x={300} y={14} h={250} label="Server" c="b" />
      <Msg x1={110} x2={300} y={82} label="SYN" c="a" />
      <Msg x1={110} x2={300} y={128} label="SYN + ACK" c="b" back />
      <Msg x1={110} x2={300} y={174} label="ACK" c="a" />
      <Txt x={205} y={214} fs={10.5} bold c="b">
        connection open — data flows
      </Txt>

      <Txt x={205} y={252} fs={10} soft>
        "I want to connect" → "okay, ready" → "let's go"
      </Txt>

      <Txt x={480} y={40} fs={11} bold c="c">
        why three, not two?
      </Txt>
      <Txt x={480} y={64} fs={10.5} soft>
        Both sides must agree on
      </Txt>
      <Txt x={480} y={80} fs={10.5} soft>
        a starting sequence number,
      </Txt>
      <Txt x={480} y={96} fs={10.5} soft>
        and each must know the other
      </Txt>
      <Txt x={480} y={112} fs={10.5} soft>
        received theirs. Two messages
      </Txt>
      <Txt x={480} y={128} fs={10.5} soft>
        only confirms one direction.
      </Txt>
      <Txt x={480} y={162} fs={11} bold c="c">
        closing takes four
      </Txt>
      <Txt x={480} y={186} fs={10.5} soft>
        FIN, ACK, FIN, ACK — each
      </Txt>
      <Txt x={480} y={202} fs={10.5} soft>
        direction is shut down
      </Txt>
      <Txt x={480} y={218} fs={10.5} soft>
        separately, so one side can
      </Txt>
      <Txt x={480} y={234} fs={10.5} soft>
        keep sending after the other
      </Txt>
      <Txt x={480} y={250} fs={10.5} soft>
        has finished.
      </Txt>
    </Dg>
  );
}

/** What happens between typing a URL and seeing the page. */
function UrlJourney() {
  const step = (i: number, y: number, label: string, sub: string, c: 'a' | 'b' | 'c' | 'n') => (
    <g key={label}>
      <circle cx={40} cy={y} r={13} fill={`var(--${c === 'n' ? 'surface-2' : c === 'a' ? 'accent' : c === 'b' ? 'accent-2' : 'accent-3'}${c === 'n' ? '' : '-soft'})`} stroke={`var(--${c === 'n' ? 'ink-faint' : c === 'a' ? 'accent' : c === 'b' ? 'accent-2' : 'accent-3'})`} strokeWidth="1.5" />
      <text x={40} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={`var(--${c === 'n' ? 'ink' : c === 'a' ? 'accent' : c === 'b' ? 'accent-2' : 'accent-3'})`}>
        {i}
      </text>
      <text x={66} y={y - 2} fontSize="12" fontWeight="700" fill="var(--ink)">
        {label}
      </text>
      <text x={66} y={y + 14} fontSize="10.5" fill="var(--ink-soft)">
        {sub}
      </text>
    </g>
  );
  return (
    <Dg w={600} h={266} cap="Typing a URL touches DNS, TCP, TLS and HTTP in that order">
      {step(1, 24, 'Browser checks its cache', 'do I already know the IP for google.com?', 'n')}
      {step(2, 60, 'DNS lookup', 'resolver → root → TLD → authoritative, returns an IP', 'a')}
      {step(3, 96, 'TCP three-way handshake', 'SYN, SYN-ACK, ACK — the connection opens', 'b')}
      {step(4, 132, 'TLS handshake (if HTTPS)', 'certificate checked, session key agreed', 'c')}
      {step(5, 168, 'HTTP request sent', 'GET / with headers and cookies', 'a')}
      {step(6, 204, 'Server responds', 'HTML, then CSS, JS and images', 'b')}
      {step(7, 240, 'Browser renders', 'parse, build the DOM, paint the page', 'n')}
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-transport',
  num: 5,
  unit: 'Transport & Web',
  title: 'TCP vs UDP, the Handshake & the URL Journey',
  blurb:
    'The two transport protocols and when each is right, why opening a TCP connection takes three messages, and everything that happens when you type a URL.',
  minutes: 12,
  tags: ['Very common', 'Guaranteed question'],

  sections: [
    {
      id: 'tcp-udp',
      heading: 'TCP vs UDP',
      blocks: [
        {
          k: 'table',
          head: ['', 'TCP', 'UDP'],
          rows: [
            ['Connection', 'Connection-oriented — handshake required', 'Connectionless — just send'],
            ['Reliability', 'Guarantees delivery; retransmits what is lost', 'No delivery guarantee'],
            ['Ordering', 'Data arrives in order', 'May arrive out of order'],
            ['Speed', 'Slower, because of the checks', 'Faster — almost no overhead'],
            ['Error handling', 'Checksum + acknowledgement + retransmission', 'Checksum only; bad data is discarded'],
            ['Flow / congestion control', 'Yes', 'No'],
            ['Header size', '20 bytes', '8 bytes'],
            ['Used for', 'Email, file transfer, web browsing', 'Video streaming, gaming, VoIP, DNS'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why would anyone choose unreliable?',
          text: (
            <>
              Because for live media, <b>a late packet is worse than a missing one</b>. If a video frame from two
              seconds ago finally arrives, it is useless — you would rather skip it and stay in sync. TCP would
              stall the whole stream retransmitting it. That is the real answer, and it beats simply saying "UDP is
              faster".
            </>
          ),
        },
      ],
    },

    {
      id: 'handshake',
      heading: 'The TCP three-way handshake',
      blocks: [
        {
          k: 'p',
          text: <>How TCP opens a connection between a client and a server.</>,
        },
        { k: 'diagram', el: <Handshake />, caption: 'Data transfer starts immediately after the third message.' },
        {
          k: 'ol',
          items: [
            <>
              <b>SYN</b> — the client says "I want to connect", sending its initial sequence number.
            </>,
            <>
              <b>SYN-ACK</b> — the server replies "okay, ready", acknowledging the client's number and sending its
              own.
            </>,
            <>
              <b>ACK</b> — the client confirms "let's go", acknowledging the server's number.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          title: 'Why three and not two?',
          text: (
            <>
              Both sides need to agree on a starting sequence number <b>and</b> each needs to know the other
              received theirs. Two messages would only confirm the client-to-server direction; the third confirms
              the reverse. Closing takes <b>four</b> (FIN, ACK, FIN, ACK) because each direction is shut down
              independently — one side can keep sending after the other has finished.
            </>
          ),
        },
      ],
    },

    {
      id: 'url-journey',
      heading: 'What happens when you type google.com',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A favourite question because it touches every layer at once. Answer it as an ordered list — the
              structure is most of the marks.
            </>
          ),
        },
        { k: 'diagram', el: <UrlJourney />, caption: 'Name → address → connection → security → request → response → pixels.' },
        {
          k: 'steps',
          items: [
            { t: 'Browser checks its cache', d: 'Browser cache, then OS cache, then the hosts file — is the IP for google.com already known?' },
            { t: 'DNS resolves the name', d: 'If not cached, a DNS resolver is asked; it walks root → TLD → authoritative servers and returns an IP address.' },
            { t: 'TCP connection opens', d: 'The browser opens a connection to that IP on port 80 or 443 using the three-way handshake.' },
            { t: 'TLS handshake, if HTTPS', d: "The server's certificate is validated and a symmetric session key is agreed, so everything after this is encrypted." },
            { t: 'HTTP request is sent', d: 'A GET request with headers and any cookies for that domain.' },
            { t: 'Server responds', d: 'It processes the request and returns HTML, followed by the CSS, JavaScript and images the page references.' },
            { t: 'Browser renders', d: 'Parses the HTML into a DOM, applies CSS, runs JavaScript, and paints the page.' },
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between TCP and UDP?',
      a: (
        <>
          <b>TCP</b> is connection-oriented and reliable: it handshakes first, acknowledges and retransmits lost
          data, delivers in order, and does flow and congestion control. <b>UDP</b> is connectionless and
          best-effort: no handshake, no retransmission, no ordering — but far less overhead and much lower latency.
        </>
      ),
    },
    {
      q: 'When would you choose UDP over TCP?',
      a: (
        <>
          For live video, voice calls, gaming and DNS — anywhere <b>a late packet is worse than a lost one</b>.
          Retransmitting a two-second-old video frame is useless and would stall the stream, so it is better to drop
          it and stay in sync.
        </>
      ),
    },
    {
      q: 'Explain the TCP three-way handshake.',
      a: (
        <>
          <b>SYN</b>: the client sends its initial sequence number. <b>SYN-ACK</b>: the server acknowledges it and
          sends its own. <b>ACK</b>: the client acknowledges the server's. Both sides now know the other's starting
          sequence number and that it was received, so reliable ordered transfer can begin.
        </>
      ),
    },
    {
      q: 'Why does the handshake need three messages rather than two?',
      a: (
        <>
          Two would only confirm that the <i>server</i> received the client's sequence number. The third message
          confirms the reverse direction — that the client received the server's. Both directions must be
          established, because TCP is full-duplex.
        </>
      ),
    },
    {
      q: 'Why does closing a TCP connection take four messages?',
      a: (
        <>
          Because each direction is closed independently: FIN from one side, ACK, then FIN from the other, then ACK.
          This allows a <b>half-close</b> — one side can finish sending while still receiving data from the other.
        </>
      ),
    },
    {
      q: 'Walk me through what happens when you type google.com and press enter.',
      a: (
        <>
          Browser and OS cache are checked for the IP; if absent, <b>DNS</b> resolves the name. A <b>TCP</b>{' '}
          connection is opened with the three-way handshake. For HTTPS a <b>TLS</b> handshake validates the
          certificate and agrees a session key. The browser sends an <b>HTTP GET</b>, the server responds with HTML
          and then the referenced assets, and the browser parses and <b>renders</b> the page.
        </>
      ),
    },
    {
      q: 'Which protocol does DNS use, and why?',
      a: (
        <>
          Usually <b>UDP</b> on port 53. Queries and answers are small and fit in a single datagram, so a handshake
          would triple the cost of a lookup — it is cheaper to just retry on timeout. DNS falls back to <b>TCP</b>{' '}
          for large responses and for zone transfers.
        </>
      ),
    },
    {
      q: 'How does TCP guarantee data arrives in order?',
      a: (
        <>
          Every byte carries a <b>sequence number</b>. The receiver acknowledges what it has received, buffers
          anything that arrives early, and reassembles in sequence order before handing data to the application.
          Anything unacknowledged within the timeout is retransmitted.
        </>
      ),
    },
  ],
};

export default topic;
