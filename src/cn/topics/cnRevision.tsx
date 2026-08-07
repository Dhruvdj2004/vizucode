import type { CnTopic } from '../types';

const topic: CnTopic = {
  slug: 'cn-revision',
  num: 7,
  unit: 'Quick Revision',
  title: '10-Minute Networking Revision',
  blurb:
    'The whole CN module as recall — the layer tables, every port number, the comparisons and the walkthrough interviewers open with.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'layers',
      heading: 'The layers, and what lives where',
      blocks: [
        {
          k: 'table',
          head: ['#', 'OSI layer', 'Does', 'Unit', 'Device', 'Protocols'],
          rows: [
            ['7', 'Application', 'The user-facing service', 'Data', '—', 'HTTP, FTP, SMTP, DNS'],
            ['6', 'Presentation', 'Format, encrypt, compress', 'Data', '—', 'TLS, JPEG'],
            ['5', 'Session', 'Open, maintain, close', 'Data', '—', '—'],
            ['4', 'Transport', 'End-to-end delivery', 'Segment', '—', 'TCP, UDP'],
            ['3', 'Network', 'Routing between networks', 'Packet', 'Router', 'IP, ICMP, ARP'],
            ['2', 'Data Link', 'Delivery on one link, MAC', 'Frame', 'Switch', 'Ethernet, wifi'],
            ['1', 'Physical', 'Signals on the wire', 'Bits', 'Hub', '—'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Mnemonic top-down: <b>All People Seem To Need Data Processing</b>. TCP/IP collapses 5–7 into{' '}
              <b>Application</b> and 1–2 into <b>Network Access</b>, giving four layers.
            </>
          ),
        },
      ],
    },

    {
      id: 'ports',
      heading: 'Ports and protocols worth memorising',
      blocks: [
        {
          k: 'table',
          head: ['Protocol', 'Port', 'Transport', 'For'],
          rows: [
            ['HTTP', '80', 'TCP', 'Web, unencrypted'],
            ['HTTPS', '443', 'TCP', 'Web over TLS'],
            ['DNS', '53', 'UDP (TCP for large)', 'Name → IP'],
            ['SMTP', '25 / 587', 'TCP', 'Sending mail'],
            ['POP3', '110 / 995', 'TCP', 'Receiving — downloads and deletes'],
            ['IMAP', '143 / 993', 'TCP', 'Receiving — syncs across devices'],
            ['SSH', '22', 'TCP', 'Secure remote shell'],
            ['FTP', '20 / 21', 'TCP', 'File transfer'],
            ['DHCP', '67 / 68', 'UDP', 'Handing out IP addresses'],
          ],
        },
      ],
    },

    {
      id: 'comparisons',
      heading: 'The comparisons',
      blocks: [
        {
          k: 'table',
          head: ['Pair', 'The distinction'],
          rows: [
            ['TCP vs UDP', 'Connection-oriented, reliable, ordered, slower vs connectionless, best-effort, unordered, fast.'],
            ['MAC vs IP', 'Permanent hardware address for one link (rewritten every hop) vs logical address for the whole journey.'],
            ['Hub vs switch', 'Layer 1, floods every port, one collision domain vs layer 2, forwards on MAC, a collision domain per port.'],
            ['Switch vs router', 'Within one network on MAC (layer 2) vs between networks on IP (layer 3). Only the router splits broadcast domains.'],
            ['Router vs gateway', 'Forwards on IP within a protocol family vs joins dissimilar networks and can translate protocols.'],
            ['IPv4 vs IPv6', '32-bit, ~4.3 billion, dotted decimal vs 128-bit, effectively unlimited, hex with colons, IPsec built in.'],
            ['Private vs public IP', 'Reused inside a LAN, never routed on the internet vs globally unique, assigned by the ISP. NAT bridges them.'],
            ['HTTP vs HTTPS', 'Plain text on 80 vs TLS on 443 — confidentiality, integrity AND server authentication.'],
            ['POP3 vs IMAP', 'Downloads and deletes, one device vs keeps on the server and syncs state everywhere.'],
            ['Symmetric vs asymmetric crypto', 'One shared key, fast vs public/private pair, slow. TLS uses asymmetric to agree a symmetric key.'],
          ],
        },
      ],
    },

    {
      id: 'delays',
      heading: 'The four delays',
      blocks: [
        {
          k: 'table',
          head: ['Delay', 'Is', 'Depends on'],
          rows: [
            ['Transmission', 'Pushing all the bits onto the link', 'Packet size ÷ bandwidth'],
            ['Propagation', 'The signal covering the distance', 'Distance ÷ signal speed'],
            ['Queuing', 'Waiting in a router buffer', 'Congestion — the only variable one'],
            ['Processing', 'Reading the header and deciding', 'Router speed; microseconds'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The trap: <b>transmission</b> depends on how <i>big</i> the packet is and how <i>fast</i> the link
              is; <b>propagation</b> on how <i>far</i> it travels. A small packet on a satellite link has tiny
              transmission delay and huge propagation delay.
            </>
          ),
        },
      ],
    },

    {
      id: 'walkthroughs',
      heading: 'The two walkthroughs',
      blocks: [
        {
          k: 'code',
          title: 'TCP three-way handshake',
          code: `Client ---- SYN ------------> Server     "I want to connect" + my seq number
Client <--- SYN + ACK ------- Server     "ready" + acks yours + my seq number
Client ---- ACK ------------> Server     acks the server's number
                                          data flows immediately after

Why three? Both sides must agree a sequence number AND know the other
received theirs. Two messages only confirm one direction.

Closing takes FOUR (FIN, ACK, FIN, ACK) - each direction shuts down
independently, so one side can keep sending after the other stops.`,
        },
        {
          k: 'code',
          title: 'What happens when you type google.com',
          code: `1. Browser + OS cache checked for the IP
2. DNS resolves the name    (resolver -> root -> TLD -> authoritative)
3. TCP three-way handshake opens the connection  (port 80 or 443)
4. TLS handshake if HTTPS   (certificate validated, session key agreed)
5. HTTP GET sent            (headers, cookies)
6. Server responds          (HTML, then CSS / JS / images)
7. Browser renders          (parse -> DOM -> paint)`,
        },
      ],
    },

    {
      id: 'gotchas',
      heading: 'The gotchas',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>A /24 subnet has 254 usable hosts</b>, not 256 — the all-zeros network address and the all-ones
              broadcast address cannot be assigned.
            </>,
            <>
              <b>169.254.x.x means DHCP failed.</b> That is APIPA self-assigning, which is why the machine reaches
              the local link but never the internet.
            </>,
            <>
              <b>A failed ping does not mean the host is down</b> — it uses ICMP, and plenty of hosts and firewalls
              drop ICMP while serving traffic fine.
            </>,
            <>
              <b>Why UDP for live media?</b> A late packet is worse than a missing one. TCP would stall the stream
              retransmitting a frame that is already useless.
            </>,
            <>
              <b>HTTPS gives three things</b>, and people forget the third: confidentiality, integrity, and{' '}
              <b>authentication</b> — the certificate proves the server is genuine, which is what defeats
              man-in-the-middle.
            </>,
            <>
              <b>A VPN moves trust, it does not remove it.</b> Your ISP can no longer see your traffic; the VPN
              provider now can.
            </>,
            <>
              <b>DNS uses UDP</b> because queries are tiny and a handshake would triple the cost — it falls back to
              TCP only for large responses and zone transfers.
            </>,
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Name the OSI layers and what each does.',
      a: (
        <>
          Application (user service), Presentation (format/encrypt), Session (connection management), Transport
          (end-to-end delivery, TCP/UDP), Network (routing, IP), Data Link (MAC, one link), Physical (signals).
          "All People Seem To Need Data Processing".
        </>
      ),
    },
    {
      q: 'TCP vs UDP, and when would you pick UDP?',
      a: (
        <>
          TCP is connection-oriented, reliable, ordered and flow-controlled; UDP is connectionless and best-effort
          with far less overhead. Pick UDP for live video, voice, gaming and DNS — anywhere{' '}
          <b>a late packet is worse than a lost one</b>.
        </>
      ),
    },
    {
      q: 'Explain the three-way handshake and why it needs three messages.',
      a: (
        <>
          SYN → SYN-ACK → ACK. Both sides must exchange initial sequence numbers <b>and</b> each must know the other
          received theirs. Two messages would confirm only the client-to-server direction; TCP is full-duplex, so
          both must be established.
        </>
      ),
    },
    {
      q: 'Difference between a MAC address and an IP address?',
      a: (
        <>
          MAC is a permanent layer-2 hardware address used for delivery on the <b>current link</b> and rewritten at
          every hop. IP is a logical layer-3 address identifying the <b>final destination</b> and unchanged across
          the journey. ARP maps IP to MAC locally.
        </>
      ),
    },
    {
      q: 'Which layer does a hub, switch and router work at?',
      a: (
        <>
          <b>Hub</b> — layer 1, repeats signals to every port. <b>Switch</b> — layer 2, forwards on MAC to one port.{' '}
          <b>Router</b> — layer 3, forwards on IP between networks and separates broadcast domains.
        </>
      ),
    },
    {
      q: 'What happens when you type google.com and press enter?',
      a: (
        <>
          Cache check → <b>DNS</b> resolution → <b>TCP</b> three-way handshake → <b>TLS</b> handshake if HTTPS →{' '}
          <b>HTTP GET</b> → server response with HTML and assets → browser parses and <b>renders</b>.
        </>
      ),
    },
    {
      q: 'Why does IPv6 exist, and why has adoption been slow?',
      a: (
        <>
          IPv4's 32-bit space (~4.3 billion addresses) ran out. Adoption has been slow precisely because <b>NAT</b>{' '}
          worked so well — sharing one public address across a whole network postponed exhaustion for decades and
          removed the urgency.
        </>
      ),
    },
    {
      q: 'What does HTTPS protect against?',
      a: (
        <>
          <b>Eavesdropping</b> (traffic is encrypted), <b>tampering</b> (modification is detectable) and{' '}
          <b>impersonation</b> (the CA-issued certificate proves the server's identity). The third is what stops a
          man-in-the-middle attack.
        </>
      ),
    },
    {
      q: 'How many usable hosts in a /24, and why not 256?',
      a: (
        <>
          <b>254.</b> Eight host bits give 256 addresses, minus the all-zeros <b>network address</b> and the
          all-ones <b>broadcast address</b>, neither of which can be assigned to a device.
        </>
      ),
    },
  ],
};

export default topic;
