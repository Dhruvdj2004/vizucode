import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function AdapterDiagram() {
  return (
    <Dg w={560} h={200} cap="PricingProvider adapter translating calls into the legacy SOAP vendor API's shape">
      <Box x={20} y={70} w={150} h={60} label="Rest of app" sub="calls PricingProvider" c="a" fs={12} />
      <Box x={210} y={70} w={150} h={60} label="PricingAdapter" sub="implements PricingProvider" c="b" fs={11} />
      <Box x={400} y={70} w={150} h={60} label="Legacy SOAP API" sub="vendor's own shape" c="c" fs={12} />
      <Arrow x1={170} y1={100} x2={210} y2={100} c="a" label="calls" />
      <Arrow x1={360} y1={100} x2={400} y2={100} c="b" label="translates" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'adapter',
  num: 46,
  unit: 'Design Patterns',
  title: 'Adapter',
  blurb: 'Converts one interface into another a client expects, bridging two things that were never designed for each other.',
  minutes: 7,
  tags: ['Design pattern'],
  sections: [
    {
      id: 'analogy',
      heading: 'The travel plug analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a travel plug adapter that lets an Indian charger work in a US socket — the plug and socket were
              never designed for each other, the adapter just bridges the gap without changing either side.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Adapter is almost always reached for at an <b>integration boundary</b> — connecting your codebase to
              something you don't control, like a third-party library or a legacy system.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <AdapterDiagram />, caption: 'The rest of the app only ever talks to PricingProvider; the adapter absorbs the legacy API shape.' },
        {
          k: 'p',
          text: (
            <>
              The adapter implements the interface your code already expects, and internally translates calls into
              whatever shape the third-party or legacy API actually needs — different method names, different
              parameter order, XML instead of JSON, whatever the mismatch happens to be.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This means the rest of the codebase never has to know the legacy system exists — it only sees the
              clean interface, and the messy translation logic lives in exactly one place.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Example and watch-out',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Wrapping an old SOAP-based vendor pricing API behind a <b>PricingProvider</b> interface so the rest of
              the codebase only ever talks to the modern interface, never to raw SOAP calls.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Different from Decorator — Adapter changes the interface <b>shape</b> to make two things compatible;
              Decorator keeps the <b>same</b> interface and adds behaviour. Confusing the two is a common interview
              slip-up.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Adapter pattern solve?',
      a: <>It converts the interface of an existing class (often third-party or legacy) into an interface the client code already expects, so the two can work together without either being modified.</>,
    },
    {
      q: 'Where is Adapter typically used?',
      a: <>At integration boundaries — wrapping a third-party library, legacy system, or vendor API behind an interface that matches what the rest of the codebase already expects.</>,
    },
    {
      q: 'Give a concrete example of Adapter.',
      a: <>Wrapping an old SOAP-based vendor pricing API behind a PricingProvider interface, so the rest of the app only ever calls PricingProvider methods, never raw SOAP calls directly.</>,
    },
    {
      q: 'How is Adapter different from Decorator?',
      a: <>Adapter changes the shape of an interface to make two incompatible things compatible; Decorator preserves the same interface and layers on extra behaviour without changing its shape.</>,
    },
    {
      q: 'Does using Adapter mean you have to modify the legacy system?',
      a: <>No — that's the whole point. The adapter sits between your code and the legacy system, translating calls, so the legacy system's code (which you may not even control) stays untouched.</>,
    },
    {
      q: 'What is a downside of overusing Adapter?',
      a: <>Each adapter adds a translation layer and a small performance/complexity cost — if you control both sides of an interface, it's usually simpler to just align them directly rather than adapt.</>,
    },
  ],
};

export default topic;
