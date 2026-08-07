import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { CnTopic } from '../types';

/** A DNS lookup, from browser cache outwards. */
function DnsLookup() {
  return (
    <Dg w={620} h={216} cap="The name is resolved to an address before any connection is opened">
      <Box x={14} y={70} w={120} h={50} label="Browser" sub="wants google.com" c="c" />
      <Arrow x1={136} y1={95} x2={176} y2={95} c="n" label="1" dy={-9} />
      <Box x={180} y={70} w={116} h={50} label="Local cache" sub="already known?" c="n" fs={11.5} />
      <Arrow x1={298} y1={95} x2={338} y2={95} c="n" label="2 miss" dy={-9} />
      <Box x={342} y={70} w={122} h={50} label="DNS resolver" sub="your ISP's" c="a" fs={11.5} />
      <Arrow x1={466} y1={95} x2={506} y2={95} c="n" label="3" dy={-9} />
      <Box x={510} y={70} w={98} h={50} label="Root → TLD" sub="→ authoritative" c="b" fs={11} />

      <Arrow x1={556} y1={126} x2={80} y2={140} c="b" bend="v" label="142.250.x.x" dx={-160} dy={-8} />

      <Txt x={310} y={186} fs={10.5} soft>
        computers only understand numbers — DNS is the internet's phonebook
      </Txt>
      <Txt x={310} y={206} fs={10.5} soft>
        a DNS forwarder does not resolve anything itself; it just passes the query on
      </Txt>
    </Dg>
  );
}

/** Private addresses behind one public address. */
function PrivateVsPublic() {
  return (
    <Dg w={600} h={230} cap="Many private addresses inside, one public address facing the internet">
      <Frame x={2} y={20} w={300} h={190} label="YOUR NETWORK — private" c="b" />
      {['192.168.1.2', '192.168.1.3', '192.168.1.4'].map((ip, i) => (
        <Box key={ip} x={22} y={50 + i * 48} w={140} h={36} label={ip} c="b" fs={10.5} />
      ))}
      {[68, 116, 164].map((y) => (
        <Arrow key={y} x1={164} y1={y} x2={210} y2={116} c="n" />
      ))}
      <Box x={212} y={92} w={80} h={48} label="Router" sub="NAT" c="a" fs={11} />

      <Arrow x1={294} y1={116} x2={352} y2={116} c="a" label="NAT" dy={-9} />
      <Box x={356} y={92} w={140} h={48} label="49.37.201.8" sub="one public IP" c="c" fs={11} />
      <Arrow x1={498} y1={116} x2={540} y2={116} c="n" />
      <Txt x={572} y={120} fs={11} bold c="n">
        🌐
      </Txt>

      <Txt x={300} y={224} fs={10.5} soft>
        private ranges (10.x, 172.16–31.x, 192.168.x) are reused everywhere and never routed on the internet
      </Txt>
    </Dg>
  );
}

const topic: CnTopic = {
  slug: 'cn-addressing',
  num: 3,
  unit: 'Addressing & Devices',
  title: 'MAC, IP, DNS, Subnets & IPv6',
  blurb:
    'The two addresses every packet carries, private vs public vs APIPA, how DNS turns a name into a number, subnetting, and why IPv6 exists.',
  minutes: 13,
  tags: ['Very common'],

  sections: [
    {
      id: 'mac-vs-ip',
      heading: 'MAC address vs IP address',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Every packet carries <b>two</b> kinds of address, and confusing them is the most common mistake in
              this topic.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'MAC address', 'IP address'],
          rows: [
            ['What it identifies', 'A physical network interface', 'A device\'s position in a network'],
            ['Assigned by', 'The manufacturer, burned in', 'The network — DHCP or manual config'],
            ['Layer', 'Data Link (2)', 'Network (3)'],
            ['Format', '48-bit hex, e.g. 00:1A:2B:3C:4D:5E', '32-bit (IPv4), e.g. 192.168.1.1'],
            ['Changes when you move network?', 'No — permanent', 'Yes'],
            ['Scope', 'One local link only', 'End to end, across the internet'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Why both are needed',
          text: (
            <>
              The <b>IP address is the final destination</b> and stays the same the whole journey. The <b>MAC
              address is only for the next hop</b> and is rewritten at every router along the way. Think of it as a
              parcel: the postal address never changes, but the specific delivery van handling it does at every
              depot. <b>ARP</b> is the protocol that finds the MAC for a given IP on the local link.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>NIC</b> (Network Interface Card) is the hardware in your computer that connects it to a network,
              wired or wireless. The MAC address belongs to the NIC.
            </>
          ),
        },
      ],
    },

    {
      id: 'ip-kinds',
      heading: 'Private, public and APIPA addresses',
      blocks: [
        { k: 'diagram', el: <PrivateVsPublic />, caption: 'NAT is what lets a whole household share one public address.' },
        {
          k: 'ul',
          items: [
            <>
              <b>IP address</b> — a unique address given to a device so it can send and receive data, like a postal
              address.
            </>,
            <>
              <b>Private IP</b> — used inside a local network (home or office) and invisible from the internet, e.g.{' '}
              <code>192.168.x.x</code>. These ranges are reused by every network in the world.
            </>,
            <>
              <b>Public IP</b> — the address visible on the internet, assigned by your ISP, unique worldwide.
            </>,
            <>
              <b>APIPA</b> — Automatic Private IP Addressing. If a device cannot reach a DHCP server it assigns
              itself an address starting <code>169.254.x.x</code>, so it can still talk to other local devices.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Seeing a <code>169.254.x.x</code> address is a <b>diagnostic</b>: it means DHCP failed. The device has
              given up and self-assigned, which is why it can reach the local network but never the internet.
            </>
          ),
        },
      ],
    },

    {
      id: 'ipv4-ipv6',
      heading: 'IPv4 vs IPv6',
      blocks: [
        {
          k: 'table',
          head: ['', 'IPv4', 'IPv6'],
          rows: [
            ['Address size', '32-bit', '128-bit'],
            ['Total addresses', '~4.3 billion', 'Practically unlimited (3.4 × 10³⁸)'],
            ['Notation', '192.168.1.1 — dotted decimal', '2001:db8::1 — hex, colon-separated'],
            ['Status', 'Running out of addresses', 'Solves the shortage'],
            ['Configuration', 'Manual or DHCP', 'Supports auto-configuration'],
            ['Security', 'Optional (IPsec added on)', 'IPsec built into the design'],
            ['Adoption', 'Simpler and still more common', 'Newer, rolling out gradually'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              A good follow-up answer: IPv6 adoption has been slow precisely <i>because</i> <b>NAT</b> worked so
              well. Sharing one public IPv4 address across a whole network postponed the exhaustion problem for
              decades — which removed the urgency to migrate.
            </>
          ),
        },
      ],
    },

    {
      id: 'dns',
      heading: 'DNS and DNS forwarders',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>DNS</b> (Domain Name System) converts a website name like <code>google.com</code> into an IP
              address, since computers only understand numbers. It is the internet's phonebook.
            </>
          ),
        },
        { k: 'diagram', el: <DnsLookup />, caption: 'Cache first, then the resolver, then the hierarchy.' },
        {
          k: 'p',
          text: (
            <>
              A <b>DNS forwarder</b> is a server that does not resolve the name itself — it forwards the request on
              to another DNS server and returns the answer. Organisations use them to centralise caching and to keep
              internal machines from querying the internet directly.
            </>
          ),
        },
      ],
    },

    {
      id: 'subnet',
      heading: 'Subnetting',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Subnetting</b> means dividing one large network into smaller ones. It makes the network easier to
              manage, more secure, and reduces unnecessary traffic.
            </>
          ),
        },
        {
          k: 'code',
          title: 'What the mask actually does',
          code: `192.168.1.10 / 24        ("slash 24" = 24 network bits)

  address   11000000.10101000.00000001.00001010
  mask      11111111.11111111.11111111.00000000    255.255.255.0
            └──────── network ────────┘└─ host ─┘

  network   192.168.1.0        the subnet itself
  broadcast 192.168.1.255      reaches every host in it
  usable    192.168.1.1 – .254 → 2^8 − 2 = 254 hosts

Borrow more bits for the network and you get more subnets,
each with fewer hosts:
  /25 → 2 subnets  × 126 hosts
  /26 → 4 subnets  ×  62 hosts`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Less broadcast traffic</b> — a broadcast stays inside its own subnet instead of reaching every
              device.
            </>,
            <>
              <b>Security and isolation</b> — put guests, servers and staff on separate subnets and control what
              crosses between them.
            </>,
            <>
              <b>Efficient address use</b> — allocate a size that matches each department rather than wasting a
              whole class of addresses.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The "<b>−2</b>" in the usable-host count catches people out: the all-zeros host is the{' '}
              <b>network address</b> and the all-ones host is the <b>broadcast address</b>, so neither can be
              assigned to a device.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between a MAC address and an IP address?',
      a: (
        <>
          A <b>MAC</b> is a permanent 48-bit hardware address burned into the NIC, used at layer 2 for delivery on
          the local link. An <b>IP</b> is a logical layer-3 address assigned by the network, used for end-to-end
          routing. The IP stays constant across the journey; the MAC is rewritten at every hop.
        </>
      ),
    },
    {
      q: 'Why do we need both MAC and IP addresses?',
      a: (
        <>
          IP identifies <i>where</i> the packet is ultimately going, across any number of networks. MAC identifies{' '}
          <i>which device on this particular link</i> should pick it up next. Routing needs the first; actual
          delivery on each hop needs the second. <b>ARP</b> maps one to the other locally.
        </>
      ),
    },
    {
      q: 'What is DNS?',
      a: (
        <>
          The Domain Name System — it translates human-readable names like <code>google.com</code> into IP
          addresses. Without it you would have to memorise numbers. The lookup checks the browser and OS cache
          first, then a resolver, then the root → TLD → authoritative hierarchy.
        </>
      ),
    },
    {
      q: 'What is a DNS forwarder?',
      a: (
        <>
          A DNS server that does not resolve queries itself but passes them to another DNS server and relays the
          answer. Organisations use them to centralise caching, reduce external traffic and keep internal clients
          from querying the internet directly.
        </>
      ),
    },
    {
      q: 'Private vs public IP address?',
      a: (
        <>
          <b>Private</b> addresses (10.x, 172.16–31.x, 192.168.x) are used inside a local network, reused by
          everyone and never routed on the internet. A <b>public</b> address is globally unique and assigned by an
          ISP. <b>NAT</b> on the router translates between them so a whole network can share one public address.
        </>
      ),
    },
    {
      q: 'What is APIPA, and what does a 169.254.x.x address tell you?',
      a: (
        <>
          Automatic Private IP Addressing — a device that cannot reach a DHCP server assigns itself an address in{' '}
          <code>169.254.x.x</code> so local communication still works. Seeing one is a diagnostic that{' '}
          <b>DHCP has failed</b>: the machine can talk to the local link but will never reach the internet.
        </>
      ),
    },
    {
      q: 'IPv4 vs IPv6?',
      a: (
        <>
          IPv4 is 32-bit with about 4.3 billion addresses, written in dotted decimal. IPv6 is 128-bit with a
          practically unlimited supply, written in hex with colons, supports auto-configuration and has IPsec built
          in. IPv6 exists because IPv4 addresses ran out.
        </>
      ),
    },
    {
      q: 'What is subnetting and why do it?',
      a: (
        <>
          Splitting one network into smaller ones by borrowing host bits for the network portion. It reduces
          broadcast traffic, improves security by isolating groups of devices, and lets addresses be allocated in
          sizes that match actual need.
        </>
      ),
    },
    {
      q: 'A /24 subnet — how many usable host addresses?',
      a: (
        <>
          <b>254.</b> Eight host bits give 2⁸ = 256 addresses, minus two: the all-zeros <b>network address</b> and
          the all-ones <b>broadcast address</b> cannot be assigned to devices.
        </>
      ),
    },
    {
      q: 'What is a NIC?',
      a: (
        <>
          A Network Interface Card — the hardware that connects a device to a network, wired or wireless. It carries
          the device's MAC address and operates at the physical and data link layers.
        </>
      ),
    },
  ],
};

export default topic;
