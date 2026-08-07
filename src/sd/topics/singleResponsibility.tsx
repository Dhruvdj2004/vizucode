import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function SrpDiagram() {
  return (
    <Dg w={560} h={240} cap="A bloated Order class split into Order and OrderNotifier, each with one job">
      <Box x={20} y={30} w={200} h={70} label="Order (before)" sub="totals + emails + logging" c="c" fs={12} />
      <Arrow x1={220} y1={65} x2={320} y2={65} c="n" label="split" plain />
      <Box x={340} y={20} w={200} h={60} label="Order" sub="computes totals" c="a" fs={13} />
      <Box x={340} y={150} w={200} h={60} label="OrderNotifier" sub="sends confirmation email" c="b" fs={13} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'single-responsibility',
  num: 35,
  unit: 'SOLID Principles',
  title: 'Single Responsibility',
  blurb: 'A class should have exactly one reason to change — one job, done well, with nothing else tangled in.',
  minutes: 8,
  tags: ['SOLID', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The one-person-one-job analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              At a restaurant, one person, one job — the cook cooks, the waiter serves. If the cook is also forced
              to handle billing, both jobs start suffering: the food gets cold while they count cash, and mistakes
              creep into both.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              "Responsibility" here means <b>a reason to change</b> — not "does one thing" in a literal, one-method
              sense. A class can have several methods and still have a single responsibility, as long as they all
              serve the same purpose and change for the same reason.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <SrpDiagram />, caption: 'Splitting an overloaded class along its reasons to change.' },
        {
          k: 'p',
          text: (
            <>
              Separate <b>what a class does</b> from <b>how it's persisted, formatted, or notified</b>. Mixing
              those means a change to the email template, or a change to the pricing rule, both force edits to the
              same class — even though the two changes come from completely different parts of the business.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A useful test: if you can describe a class's job with an "and" — "computes totals <b>and</b> emails
              customers" — it likely has two responsibilities, and two different teams or tickets will eventually
              want to change it for two different reasons.
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
          k: 'ul',
          items: [
            <>
              Split an <b>Order</b> class that both computes totals and sends confirmation emails into{' '}
              <b>Order</b> (pricing logic) and a separate <b>OrderNotifier</b> (email logic).
            </>,
            <>
              A <b>UserRepository</b> that only reads/writes users to the database, separate from a{' '}
              <b>UserValidator</b> that only checks whether a signup form is valid.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Taken too far, this fragments a design into dozens of tiny classes that all have to be wired together
              — the test is "reason to change," not "number of methods." Don't split a cohesive class just to hit
              an arbitrary line count.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What does Single Responsibility actually mean?',
      a: <>A class should have exactly one reason to change — one axis along which the business or requirements can force an edit, not literally "one method."</>,
    },
    {
      q: 'How do you spot an SRP violation in a class?',
      a: <>If you describe its job with "and" ("computes totals and sends emails"), or if two unrelated tickets both require touching the same class, it likely has more than one responsibility.</>,
    },
    {
      q: 'Give an example of fixing an SRP violation.',
      a: <>Splitting an Order class that both computes totals and emails customers into Order (pricing) and OrderNotifier (notification), so each changes independently.</>,
    },
    {
      q: 'Can SRP be taken too far?',
      a: <>Yes — over-splitting a cohesive class into many tiny classes just to minimize method count adds indirection without a real independent reason to change for each piece.</>,
    },
    {
      q: 'How does SRP help with testing?',
      a: <>A class with one responsibility has a narrower, more predictable set of behaviors to test, and changes to unrelated concerns can't accidentally break its tests.</>,
    },
    {
      q: 'Is SRP only about classes?',
      a: <>No — the same idea applies to functions, modules, and services: each should own one coherent concern so changes are isolated to the place that actually needs them.</>,
    },
  ],
};

export default topic;
