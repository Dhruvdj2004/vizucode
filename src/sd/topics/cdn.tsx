import { Arrow, Box, Cyl, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Cache miss fetches once from origin; subsequent nearby requests hit the edge. */
function CdnDiagram() {
  return (
    <Dg w={600} h={260} cap="A CDN edge node caches origin content near users after the first fetch">
      <Box x={30} y={20} w={100} h={40} label="User A" c="n" fs={11} />
      <Box x={30} y={100} w={100} h={40} label="User B" c="n" fs={11} />
      <Box x={30} y={180} w={100} h={40} label="User C" c="n" fs={11} />

      <Arrow x1={130} y1={40} x2={220} y2={80} c="c" label="miss" dy={-6} />
      <Arrow x1={130} y1={120} x2={220} y2={100} c="a" label="hit" dy={-6} />
      <Arrow x1={130} y1={200} x2={220} y2={120} c="a" label="hit" dy={10} />

      <Box x={220} y={70} w={150} h={60} label="Edge node" sub="cache" c="a" fs={12} />

      <Arrow x1={370} y1={90} x2={460} y2={90} c="c" label="fetch once" dy={-10} />
      <Cyl x={460} y={64} w={110} h={56} label="Origin" c="n" />
      <Txt x={300} y={218} fs={11} soft>
        first request misses and pulls from origin;
      </Txt>
      <Txt x={300} y={238} fs={11} soft>
        later nearby requests hit the cached copy
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'cdn',
  num: 9,
  unit: 'Networking & Traffic',
  title: 'CDN',
  blurb:
    'Caches static assets at edge locations physically near the user, cutting latency and reducing load on the origin server.',
  minutes: 8,
  tags: ['Very common', 'Asked with diagrams'],

  sections: [
    {
      id: 'analogy',
      heading: 'The library photocopy analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like keeping a photocopy of a popular textbook at every local library branch, instead of making every
              student travel to the one central library that owns the original. Most students never need to reach
              the central library at all.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A CDN (Content Delivery Network) does exactly this for web content — pushing copies physically closer
              to the people requesting them.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How a request gets served from the edge',
      blocks: [
        {
          k: 'diagram',
          el: <CdnDiagram />,
          caption: 'The first nearby request misses and fetches from origin; later requests hit the cached edge copy.',
        },
        {
          k: 'p',
          text: (
            <>
              On a <b>cache miss</b>, the nearest edge node fetches the content from the origin server once, caches
              it locally, and serves that same copy to every subsequent nearby request — no repeated trip back to
              origin for the same file.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>TTL</b> (time-to-live) on each cached object controls how long the edge trusts its copy before
              re-checking or re-fetching from origin — a longer TTL means fewer origin hits but staler content if
              the source changes.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'What gets cached, and the hard part',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Product listing photos, thumbnails, and JS/CSS bundles served via <b>Cloudflare</b> or{' '}
              <b>CloudFront</b> instead of hitting the app server on every page load.
            </>,
            <>
              Video streaming platforms rely heavily on CDNs to serve large media files from a node close to the
              viewer, cutting buffering.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Cache invalidation is the hard part — a stale CDN copy of a changed listing photo is a real bug class,
              not a theoretical one. Updating the origin doesn't automatically flush every edge node's cached copy.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem does a CDN solve?',
      a: (
        <>
          It reduces latency and origin load by caching static content at edge locations physically near users, so
          most requests never have to travel all the way to the origin server.
        </>
      ),
    },
    {
      q: 'What happens on a CDN cache miss vs a cache hit?',
      a: (
        <>
          On a miss, the edge node fetches from origin once and caches the result. On a hit, it serves the cached
          copy directly, with no trip to origin at all.
        </>
      ),
    },
    {
      q: 'What is a TTL in the context of CDN caching?',
      a: (
        <>
          The time an edge node trusts its cached copy before re-validating or re-fetching from origin. A longer TTL
          reduces origin load but risks serving stale content longer.
        </>
      ),
    },
    {
      q: 'What is the hardest part of running a CDN in practice?',
      a: (
        <>
          Cache invalidation — making sure a changed origin file is reflected at every edge node promptly, instead
          of edges continuing to serve a stale copy.
        </>
      ),
    },
    {
      q: 'What kind of content is a CDN best suited for?',
      a: (
        <>
          Static or rarely-changing content — images, video, JS/CSS bundles, downloadable files — rather than
          highly dynamic, per-user data.
        </>
      ),
    },
    {
      q: 'Give two examples of real-world CDN providers.',
      a: <>Cloudflare and Amazon CloudFront (also Akamai, Fastly).</>,
    },
  ],
};

export default topic;
