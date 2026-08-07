import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { CnTopic } from '../types';

/** Public key encrypts, private key decrypts. */
function RsaKeys() {
  return (
    <Dg w={608} h={220} cap="Anyone can lock the box; only the holder of the private key can open it">
      <Box x={16} y={80} w={110} h={50} label="Sender" sub="has your public key" c="n" fs={11.5} />
      <Arrow x1={128} y1={105} x2={176} y2={105} c="n" />
      <Box x={180} y={78} w={116} h={54} label="🔒 encrypt" sub="with PUBLIC key" c="a" fs={11.5} />
      <Arrow x1={298} y1={105} x2={346} y2={105} c="a" label="ciphertext" dy={-9} />
      <Box x={350} y={78} w={116} h={54} label="🔓 decrypt" sub="with PRIVATE key" c="b" fs={11.5} />
      <Arrow x1={468} y1={105} x2={508} y2={105} c="b" />
      <Box x={512} y={80} w={92} h={50} label="You" c="n" fs={11.5} />

      <Txt x={238} y={158} fs={10} soft>
        shared with everyone
      </Txt>
      <Txt x={408} y={158} fs={10} soft>
        never leaves you
      </Txt>
      <Txt x={304} y={196} fs={10.5} soft>
        security rests on how hard it is to factor the product of two very large primes
      </Txt>
      <Txt x={304} y={214} fs={10.5} soft>
        trivial to encrypt · effectively impossible to reverse without the private key
      </Txt>
    </Dg>
  );
}

/** A firewall filtering traffic on rules. */
function Firewall() {
  return (
    <Dg w={580} h={220} cap="Traffic is checked against rules before it is allowed through">
      <Box x={16} y={40} w={116} h={34} label="HTTPS :443" c="b" fs={11} />
      <Box x={16} y={90} w={116} h={34} label="SSH :22" c="b" fs={11} />
      <Box x={16} y={140} w={116} h={34} label="Telnet :23" c="c" fs={11} />

      <Arrow x1={134} y1={57} x2={214} y2={57} c="b" />
      <Arrow x1={134} y1={107} x2={214} y2={107} c="b" />
      <Arrow x1={134} y1={157} x2={214} y2={157} c="c" />

      <Frame x={216} y={26} w={94} h={162} label="RULES" c="a" />
      <Txt x={263} y={62} fs={10} soft>
        allow 443
      </Txt>
      <Txt x={263} y={92} fs={10} soft>
        allow 22
      </Txt>
      <Txt x={263} y={122} fs={10} soft>
        from office
      </Txt>
      <Txt x={263} y={158} fs={10} bold c="c">
        deny all
      </Txt>

      <Arrow x1={312} y1={57} x2={392} y2={57} c="b" />
      <Arrow x1={312} y1={107} x2={392} y2={107} c="b" />
      <Txt x={352} y={152} fs={13} bold c="c">
        ✗ blocked
      </Txt>

      <Box x={396} y={62} w={160} h={90} label="Internal network" c="n" fs={11.5} />
      <Txt x={290} y={210} fs={10.5} soft>
        the last rule is almost always "deny everything not explicitly allowed"
      </Txt>
    </Dg>
  );
}

/** A VPN tunnel through an untrusted network. */
function VpnTunnel() {
  return (
    <Dg w={600} h={208} cap="An encrypted tunnel across a network you do not trust">
      <Box x={16} y={72} w={110} h={50} label="Your device" c="a" fs={11.5} />
      <rect
        x={132}
        y={62}
        width={300}
        height={70}
        rx={35}
        fill="var(--accent-2-soft)"
        stroke="var(--accent-2)"
        strokeWidth="1.6"
        strokeDasharray="7 5"
      />
      <Txt x={282} y={92} fs={11.5} bold c="b">
        encrypted tunnel
      </Txt>
      <Txt x={282} y={112} fs={10} soft>
        café wifi sees only noise
      </Txt>
      <Arrow x1={128} y1={97} x2={436} y2={97} c="b" />
      <Box x={438} y={72} w={106} h={50} label="VPN server" c="b" fs={11.5} />
      <Arrow x1={546} y1={97} x2={578} y2={97} c="n" />
      <Txt x={588} y={101} fs={12}>
        🌐
      </Txt>
      <Txt x={490} y={146} fs={10} soft>
        the website sees
      </Txt>
      <Txt x={490} y={162} fs={10} soft>
        this server's IP
      </Txt>
      <Txt x={300} y={196} fs={10.5} soft>
        your ISP and anyone on the local network can see that you used a VPN — not what you did
      </Txt>
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-security',
  num: 6,
  unit: 'Transport & Web',
  title: 'HTTP/HTTPS, SMTP, RSA, Firewalls & VPN',
  blurb:
    'The application protocols that carry the web and email, how public-key encryption works, and the two things standing between a network and the internet.',
  minutes: 12,
  tags: ['Very common', 'Security'],

  sections: [
    {
      id: 'http',
      heading: 'HTTP vs HTTPS',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>HTTP</b> transfers web pages between browser and server, <b>unencrypted</b>. <b>HTTPS</b> does the
              same but encrypts everything with <b>SSL/TLS</b>, so nobody in between can read it — used for
              banking, logins and anywhere data needs protecting. It is the lock icon in the browser.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'HTTP', 'HTTPS'],
          rows: [
            ['Port', '80', '443'],
            ['Encryption', 'None — plain text on the wire', 'TLS-encrypted'],
            ['Certificate', 'Not required', 'Required, issued by a CA'],
            ['Protects against', 'Nothing', 'Eavesdropping and tampering in transit'],
            ['Speed', 'Marginally faster (no handshake)', 'Negligible difference today'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'What HTTPS actually gives you',
          text: (
            <>
              Three things: <b>confidentiality</b> (nobody in the middle can read it), <b>integrity</b> (nobody can
              alter it undetected) and <b>authentication</b> (the certificate proves you are talking to the real
              server, not an impostor). The third is what stops a man-in-the-middle attack, and the one candidates
              usually forget.
            </>
          ),
        },
      ],
    },

    {
      id: 'smtp',
      heading: 'SMTP and email protocols',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>SMTP</b> (Simple Mail Transfer Protocol) is used to <b>send</b> email — client to server, and
              server to server. Receiving uses different protocols.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Protocol', 'Direction', 'Port', 'Behaviour'],
          rows: [
            ['SMTP', 'Sending', '25 / 587', 'Pushes mail towards the recipient\'s server'],
            ['POP3', 'Receiving', '110 / 995', 'Downloads and usually deletes from the server — one device'],
            ['IMAP', 'Receiving', '143 / 993', 'Keeps mail on the server and syncs — many devices'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              <b>POP3 vs IMAP</b> is the usual follow-up. POP3 downloads and removes, so mail lives on one machine.
              IMAP leaves everything on the server and mirrors state — read, flagged, foldered — across every
              device. Which is why every modern client uses IMAP.
            </>
          ),
        },
      ],
    },

    {
      id: 'rsa',
      heading: 'The RSA algorithm',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A popular encryption algorithm for secure data transfer, using <b>two</b> keys instead of one.
            </>
          ),
        },
        { k: 'diagram', el: <RsaKeys />, caption: 'Asymmetric: the key that locks is not the key that unlocks.' },
        {
          k: 'ul',
          items: [
            <>
              <b>Public key</b> — encrypts data. Shared with everyone; publishing it is safe.
            </>,
            <>
              <b>Private key</b> — decrypts data. Kept secret by the owner and never transmitted.
            </>,
            <>
              Security rests on how mathematically hard it is to <b>factor the product of two very large
              primes</b>. Multiplying them is instant; reversing it is effectively impossible.
            </>,
            <>
              Reversing the keys gives you a <b>digital signature</b>: sign with the private key, and anyone can
              verify with the public one that it really came from you.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Symmetric vs asymmetric — and why HTTPS uses both',
          text: (
            <>
              Asymmetric encryption like RSA is <b>slow</b>, so TLS does not use it for the whole conversation. The
              handshake uses asymmetric crypto to <b>authenticate the server and agree a shared secret</b>; the
              actual data is then encrypted with fast <b>symmetric</b> crypto (AES) using that secret. Knowing this
              split is a strong answer.
            </>
          ),
        },
      ],
    },

    {
      id: 'firewall',
      heading: 'Firewalls',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A security system — software or hardware — that watches incoming and outgoing traffic and blocks
              anything unauthorised or harmful, based on a set of rules.
            </>
          ),
        },
        { k: 'diagram', el: <Firewall />, caption: 'Rules are evaluated in order, and the last one is usually "deny everything else".' },
        {
          k: 'ul',
          items: [
            <>
              <b>Packet-filtering</b> — decides on source/destination IP, port and protocol. Fast, stateless, and
              blind to context.
            </>,
            <>
              <b>Stateful</b> — tracks live connections, so it can allow a reply to a request you made while
              blocking the same packet arriving unsolicited. This is the normal kind.
            </>,
            <>
              <b>Application-layer / proxy</b> — inspects the actual content, so it can block a specific URL or
              detect an attack in an HTTP body.
            </>,
          ],
        },
      ],
    },

    {
      id: 'vpn',
      heading: 'VPN',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A VPN builds a secure, <b>encrypted tunnel</b> between your device and the internet, hiding your real
              IP and location.
            </>
          ),
        },
        { k: 'diagram', el: <VpnTunnel />, caption: 'Traffic leaves the tunnel at the VPN server, wearing its address.' },
        {
          k: 'table',
          head: ['Advantages', 'Disadvantages'],
          rows: [
            ['Privacy and security — traffic is encrypted', 'Can slow your connection, since traffic takes a detour'],
            ['Access to blocked or region-restricted content', 'Some providers log your activity — a privacy risk in itself'],
            ['Safer on public wifi', 'Free VPNs are often unsafe and monetise your data'],
            ['Hides your real IP and location', 'Some sites and apps block known VPN addresses'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              A VPN moves your trust, it does not remove it. Your ISP can no longer see what you are doing — but the
              <b> VPN provider</b> now can. "Which do you trust more?" is the honest way to frame it, and it is why
              a free VPN with no revenue model deserves suspicion.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between HTTP and HTTPS?',
      a: (
        <>
          HTTP sends everything in <b>plain text</b> on port 80. HTTPS is the same protocol wrapped in <b>TLS</b> on
          port 443, requiring a CA-issued certificate. It provides confidentiality, integrity and — crucially —
          authentication that you are talking to the genuine server.
        </>
      ),
    },
    {
      q: 'What does HTTPS actually protect you from?',
      a: (
        <>
          <b>Eavesdropping</b> (nobody on the path can read the traffic), <b>tampering</b> (nobody can modify it
          undetected) and <b>impersonation</b> (the certificate proves the server's identity). The third is what
          defeats a man-in-the-middle attack.
        </>
      ),
    },
    {
      q: 'What is SMTP used for?',
      a: (
        <>
          <b>Sending</b> email — from a client to a mail server and between mail servers. It does not retrieve mail;
          that is POP3 or IMAP.
        </>
      ),
    },
    {
      q: 'Difference between POP3 and IMAP?',
      a: (
        <>
          <b>POP3</b> downloads mail to one device and typically deletes it from the server. <b>IMAP</b> keeps mail
          on the server and synchronises state — read, flagged, folders — across all your devices. IMAP is what
          modern clients use.
        </>
      ),
    },
    {
      q: 'How does RSA work?',
      a: (
        <>
          It is <b>asymmetric</b>: a <b>public key</b> encrypts and a <b>private key</b> decrypts. The public key
          can be shared freely because deriving the private key would require factoring the product of two very
          large primes, which is computationally infeasible. Used in reverse — signing with the private key — it
          also gives digital signatures.
        </>
      ),
    },
    {
      q: 'Why does TLS use both asymmetric and symmetric encryption?',
      a: (
        <>
          Asymmetric crypto is slow, so it is used only during the <b>handshake</b> — to authenticate the server and
          securely agree a shared session key. All the actual data is then encrypted with fast <b>symmetric</b>{' '}
          crypto such as AES using that key. Best of both.
        </>
      ),
    },
    {
      q: 'What is a firewall, and what kinds are there?',
      a: (
        <>
          A system that permits or blocks traffic according to rules. <b>Packet-filtering</b> firewalls decide on IP,
          port and protocol alone. <b>Stateful</b> firewalls track connections, so they can allow replies to your
          own requests while blocking unsolicited traffic. <b>Application-layer</b> firewalls inspect the content
          itself.
        </>
      ),
    },
    {
      q: 'What is a VPN and what are its drawbacks?',
      a: (
        <>
          An encrypted tunnel between your device and a VPN server, which then reaches the internet on your behalf —
          hiding your IP and protecting traffic on untrusted networks. Drawbacks: added latency, sites blocking
          known VPN IPs, and the fact that you have <b>transferred trust from your ISP to the VPN provider</b>,
          who can now see everything.
        </>
      ),
    },
    {
      q: 'Does a VPN make you anonymous?',
      a: (
        <>
          No. It hides your IP from the sites you visit and hides your traffic from the local network and ISP, but
          the VPN provider can still see it, and you remain identifiable through logins, cookies and browser
          fingerprinting. It is a privacy tool, not an anonymity tool.
        </>
      ),
    },
  ],
};

export default topic;
