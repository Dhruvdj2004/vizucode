import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function StrategyDiagram() {
  return (
    <Dg w={560} h={240} cap="Listing delegates to whichever PricingStrategy is currently active">
      <Box x={200} y={20} w={180} h={55} label="Listing (Context)" c="a" fs={12} />
      <Box x={210} y={110} w={160} h={50} label="PricingStrategy" sub="interface" c="n" fs={12} />
      <Arrow x1={290} y1={75} x2={290} y2={110} c="a" label="delegates to" />
      <Box x={20} y={190} w={150} h={45} label="FlatDiscount" c="b" fs={11} />
      <Box x={205} y={190} w={170} h={45} label="PercentageDiscount" c="b" fs={11} />
      <Box x={400} y={190} w={150} h={45} label="SeasonalDiscount" c="b" fs={11} />
      <Arrow x1={95} y1={190} x2={250} y2={160} c="b" plain />
      <Arrow x1={290} y1={190} x2={290} y2={160} c="b" plain />
      <Arrow x1={475} y1={190} x2={330} y2={160} c="b" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'strategy',
  num: 44,
  unit: 'Design Patterns',
  title: 'Strategy',
  blurb: 'Encapsulates interchangeable algorithms behind a common interface, swappable at runtime.',
  minutes: 8,
  tags: ['Design pattern', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The Google Maps route analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like choosing a route on Google Maps — fastest, shortest, or avoid-tolls. Same origin and destination,
              a different strategy plugged in each time, and the app doesn't need separate code paths per option.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The context (the class using the algorithm) never contains the algorithm's logic itself — it just
              holds a reference to whichever strategy is active and calls the same method on it every time.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <StrategyDiagram />, caption: 'The Listing never branches on discount type — it delegates to whatever PricingStrategy it was given.' },
        {
          k: 'p',
          text: (
            <>
              Each algorithm variant implements the same interface; the context class holds a reference to whichever
              strategy is active and <b>delegates</b> to it, instead of branching internally on a type flag with an{' '}
              <code>if/else</code> or <code>switch</code>.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Swapping the active strategy is just reassigning the reference — often done at runtime, based on user
              choice or config — with no change to the context class's own code.
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
              A <b>PricingStrategy</b> interface with <b>FlatDiscount</b>, <b>PercentageDiscount</b>, and{' '}
              <b>SeasonalDiscount</b> implementations, swapped based on the active campaign.
            </>,
            <>A sorting utility accepting a Comparator strategy so callers can sort by price, rating, or distance without the sort function itself changing.</>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is the pattern that directly satisfies Open/Closed — adding a new discount type is a new{' '}
              <b>PricingStrategy</b> implementation, with zero changes to the pricing engine. Pair the two in your
              answer.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Strategy pattern solve?',
      a: <>It lets an algorithm be selected and swapped at runtime by encapsulating each variant behind a common interface, instead of branching on type inside one big method.</>,
    },
    {
      q: 'How does the context use a strategy?',
      a: <>It holds a reference to the active strategy object (typed as the shared interface) and delegates the relevant call to it, without knowing which concrete implementation is plugged in.</>,
    },
    {
      q: 'How does Strategy relate to Open/Closed?',
      a: <>Strategy is a direct implementation of OCP — adding a new algorithm variant means writing a new class implementing the strategy interface, with no changes to the context class.</>,
    },
    {
      q: 'Give a concrete example of Strategy.',
      a: <>A PricingStrategy interface with FlatDiscount, PercentageDiscount, and SeasonalDiscount implementations, where the active campaign decides which one a Listing delegates pricing to.</>,
    },
    {
      q: 'How is Strategy different from State?',
      a: <>Both delegate to interchangeable classes behind a common interface, but Strategy is chosen explicitly by the client/context for a specific call, while State represents the object's own internal condition and transitions are usually driven by the object itself.</>,
    },
    {
      q: 'What is a downside of overusing Strategy?',
      a: <>It can introduce a proliferation of small classes for very simple variations, where a plain parameter or lambda would have been simpler.</>,
    },
  ],
};

export default topic;
