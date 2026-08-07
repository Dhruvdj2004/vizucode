import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** The resolution chain from browser to authoritative nameserver and back. */
function DnsDiagram() {
  const steps = [
    { label: 'Browser', sub: 'wants IP' },
    { label: 'OS cache', sub: 'checks local' },
    { label: 'Recursive resolver', sub: 'ISP / 8.8.8.8' },
    { label: 'Root server', sub: 'points to TLD' },
    { label: 'TLD server', sub: '.com nameservers' },
    { label: 'Authoritative NS', sub: 'returns IP' },
  ];
  const w = 92;
  const gap = 8;
  return (
    <Dg w={600} h={200} cap="DNS resolution chain: browser to OS cache to recursive resolver to root, TLD, and authoritative nameserver">
      {steps.map((s, i) => (
        <Box key={s.label} x={i * (w + gap) + 4} y={40} w={w} h={56} label={s.label} sub={s.sub} c={i === 0 ? 'a' : i === 5 ? 'b' : 'n'} fs={10} />
      ))}
      {steps.slice(0, -1).map((_, i) => (
        <Arrow key={i} x1={4 + i * (w + gap) + w} y1={68} x2={4 + (i + 1) * (w + gap)} y2={68} c="n" />
      ))}
      <Arrow x1={4 + 5 * (w + gap) + w / 2} y1={96} x2={4 + w / 2} y2={112} c="a" bend="v" label="IP returned" dy={16} />
      <Txt x={300} y={168} fs={11} soft>
        each layer caches the result per its TTL
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'dns-basics',
  num: 10,
  unit: 'Networking & Traffic',
  title: 'DNS Basics',
  blurb:
    'Resolves a domain name to an IP address through a chain of resolvers before the browser can even open a connection.',
  minutes: 8,
  tags: ['Definition-heavy', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The directory-enquiry analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like calling a directory-enquiry service to get someone's phone number before you're actually able to
              call them. You don't remember every phone number yourself — you look it up first, and DNS is the
              internet's version of that lookup.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Every request to a domain name — before any actual data can flow — starts with this lookup chain
              turning a human-readable name into an IP address.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'The resolution chain',
      blocks: [
        {
          k: 'diagram',
          el: <DnsDiagram />,
          caption: 'Browser checks its OS cache, then asks a recursive resolver, which walks root to TLD to authoritative NS.',
        },
        {
          k: 'p',
          text: (
            <>
              The chain runs: <b>Browser → OS cache → recursive resolver → root server → TLD server → authoritative
              nameserver</b>, which finally returns the IP address for the domain. Each hop only happens if the
              answer wasn't already cached at an earlier layer.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Results are cached at each layer according to a <b>TTL</b> (time-to-live) set on the DNS record —
              which is exactly why DNS changes take time to fully propagate: cached copies elsewhere keep answering
              with the old value until their TTL expires.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Practical use of TTL, and the cost of a cold lookup',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Low TTLs are set right before a planned migration so traffic can be redirected quickly once the DNS
              record changes — accepting more repeated lookups in exchange for faster propagation.
            </>,
            <>
              High TTLs are used for stable records to minimise repeated lookups and speed up subsequent
              connections for returning visitors.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              DNS lookup itself adds latency on a cold cache — one reason connection pooling and keep-alive matter,
              since they let a client reuse a connection instead of re-resolving and reconnecting on every request.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Walk through what happens when you type a URL and hit enter.',
      a: (
        <>
          The browser checks its own cache, then the OS cache, then asks a recursive resolver, which walks the root
          server, the TLD server, and finally the authoritative nameserver to get the IP — then the browser opens a
          connection to that IP.
        </>
      ),
    },
    {
      q: 'What is a TTL in DNS, and why does it matter?',
      a: (
        <>
          It's how long a DNS record is cached before being re-fetched. It controls how quickly a DNS change
          propagates — a low TTL means faster propagation but more repeated lookups; a high TTL means the opposite.
        </>
      ),
    },
    {
      q: 'Why does changing a DNS record not take effect immediately everywhere?',
      a: (
        <>
          Because resolvers and clients across the internet have cached the old record according to its TTL, and
          will keep serving that cached value until it expires, regardless of when the record was actually updated.
        </>
      ),
    },
    {
      q: 'Why would you lower a DNS record\'s TTL before a migration?',
      a: (
        <>
          So that once the record is switched to the new IP, cached copies expire quickly and traffic redirects to
          the new destination fast, minimising the window where some clients still hit the old server.
        </>
      ),
    },
    {
      q: 'What is a recursive resolver\'s job?',
      a: (
        <>
          It does the actual chain of lookups on behalf of the client — querying root, TLD, and authoritative
          nameservers in turn — and caches the final result so it can answer future queries for that domain
          directly.
        </>
      ),
    },
    {
      q: 'Why does DNS lookup latency matter for a client, and how is it mitigated?',
      a: (
        <>
          A cold DNS lookup adds real round-trip time before a connection can even start. Keep-alive connections and
          connection pooling avoid re-resolving and reconnecting on every request, amortising that cost.
        </>
      ),
    },
  ],
};

export default topic;
