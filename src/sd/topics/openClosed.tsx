import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function OcpDiagram() {
  return (
    <Dg w={560} h={260} cap="A DiscountStrategy interface with existing and newly added implementations">
      <Box x={200} y={20} w={160} h={50} label="DiscountStrategy" c="a" fs={12} />
      <Box x={20} y={140} w={140} h={60} label="FlatDiscount" sub="existing" c="b" fs={12} />
      <Box x={210} y={140} w={140} h={60} label="PercentDiscount" sub="existing" c="b" fs={12} />
      <Box x={400} y={140} w={140} h={60} label="SeasonalDiscount" sub="new — added" c="c" dashed fs={12} />
      <Arrow x1={90} y1={140} x2={250} y2={70} c="b" plain />
      <Arrow x1={280} y1={140} x2={280} y2={70} c="b" plain />
      <Arrow x1={470} y1={140} x2={320} y2={70} c="c" plain dashed />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'open-closed',
  num: 36,
  unit: 'SOLID Principles',
  title: 'Open/Closed',
  blurb: 'Code should be open for extension but closed for modification — add new behaviour without editing what already ships.',
  minutes: 8,
  tags: ['SOLID', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The phone case analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a mobile phone with a case — you snap on a new cover to change the look, without opening up and
              modifying the phone's own internals. The phone is <b>closed</b> to that kind of change; the case slot
              is <b>open</b> for it.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              "Closed for modification" doesn't mean a class is frozen forever — it means adding a new variant of
              behaviour shouldn't require editing code that's already written, tested, and shipped.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <OcpDiagram />, caption: 'Adding SeasonalDiscount without touching FlatDiscount, PercentDiscount, or the pricing engine.' },
        {
          k: 'p',
          text: (
            <>
              Add new behaviour via a <b>new class implementing an existing interface</b>, instead of adding an{' '}
              <b>if/else</b> branch inside code that's already tested and shipped. Every new branch in a shared
              function is a place a future change can break an unrelated case.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              In practice this means designing around a stable interface up front — once callers depend only on
              that interface, new implementations can be dropped in without recompiling or re-testing the callers.
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
              Adding a new discount type means writing a new <b>DiscountStrategy</b> implementation, not editing the
              existing pricing engine's conditional logic.
            </>,
            <>
              A payment system adding UPI support writes a new <b>PaymentMethod</b> implementation instead of adding
              a fourth branch to an existing <code>if (type == "card") ... else if (type == "netbanking")</code>{' '}
              chain.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is exactly what the <b>Strategy pattern</b> is built to enable — the two are usually asked
              together, so mention the connection when you explain OCP.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What does "open for extension, closed for modification" mean?',
      a: <>New behaviour should be addable by writing new code (a new class implementing a shared interface), not by editing existing, already-tested code.</>,
    },
    {
      q: 'How do you achieve OCP in practice?',
      a: <>Design against an interface, and implement new variants as new classes behind it, rather than adding branches to a shared function that handles every case internally.</>,
    },
    {
      q: 'Give an example of an OCP violation and its fix.',
      a: <>A pricing function with a growing if/else chain per discount type violates OCP; replacing it with a DiscountStrategy interface and one implementation per discount type fixes it.</>,
    },
    {
      q: 'How does OCP relate to the Strategy pattern?',
      a: <>Strategy is a direct implementation of OCP — new algorithms are added as new strategy classes, and the context class never needs to change to support them.</>,
    },
    {
      q: 'Why does OCP reduce risk during development?',
      a: <>Because existing, already-tested code paths aren't touched when adding new behaviour, there's far less chance of regressing something that already worked.</>,
    },
    {
      q: 'Is OCP free — any downside?',
      a: <>It adds a layer of abstraction (an interface plus implementations) even when only one variant currently exists, which is unnecessary indirection until real variation shows up.</>,
    },
  ],
};

export default topic;
