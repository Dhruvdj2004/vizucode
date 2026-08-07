import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function FactoryDiagram() {
  return (
    <Dg w={540} h={220} cap="VehicleFactory fanning out to concrete SUV, Sedan, and Hatchback classes">
      <Box x={190} y={30} w={160} h={55} label="VehicleFactory" sub='create("SUV")' c="a" fs={12} />
      <Box x={30} y={140} w={130} h={55} label="SUV" c="b" fs={13} />
      <Box x={205} y={140} w={130} h={55} label="Sedan" c="b" fs={13} />
      <Box x={380} y={140} w={130} h={55} label="Hatchback" c="b" fs={13} />
      <Arrow x1={230} y1={85} x2={95} y2={140} c="a" plain />
      <Arrow x1={270} y1={85} x2={270} y2={140} c="a" plain />
      <Arrow x1={310} y1={85} x2={445} y2={140} c="a" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'factory',
  num: 41,
  unit: 'Design Patterns',
  title: 'Factory',
  blurb: "Centralises object creation so calling code doesn't need to know which concrete class to instantiate.",
  minutes: 8,
  tags: ['Design pattern', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The Zomato analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like ordering on Zomato — you say "Pizza," and a kitchen behind the scenes decides exactly how to make
              it. You never talk to the chef or the recipe directly; you just get a pizza back.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The factory's whole job is to hide the <code>new SomeConcreteClass()</code> call behind a method, so
              callers only ever deal with a shared interface or base type.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <FactoryDiagram />, caption: 'One factory method decides which concrete Vehicle subclass to build.' },
        {
          k: 'p',
          text: (
            <>
              A factory method takes a type indicator and returns the right concrete implementation behind a shared
              interface — new types are added by extending the factory, not by changing every call site that used
              to write <code>new SUV()</code> directly.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Hiding which Vehicle subclass gets built',
          code: `class VehicleFactory {
  static Vehicle create(String type) {
    switch (type) {
      case "SUV": return new SUV();
      case "Sedan": return new Sedan();
      default: throw new IllegalArgumentException();
    }
  }
}`,
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
            <><code>VehicleFactory.create("SUV")</code> returns an <b>SUV</b> instance without the caller writing{' '}<code>new SUV()</code> directly.</>,
            <>A logging library's <code>LoggerFactory.getLogger(name)</code> deciding at runtime whether to hand back a console, file, or remote logger.</>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Don't reach for it when there's only ever one concrete type — a factory adds indirection with no real
              payoff until variation actually exists. Introduce it once a second concrete type genuinely shows up.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Factory pattern solve?',
      a: <>It centralises object creation so calling code depends only on a shared interface, not on knowing which concrete class to instantiate.</>,
    },
    {
      q: 'How is Factory different from just calling `new` directly?',
      a: <>Calling `new ConcreteClass()` couples the caller to that specific class; going through a factory method means the caller only ever depends on the returned interface, and the concrete choice can change without touching call sites.</>,
    },
    {
      q: 'How do you add a new product type to an existing Factory?',
      a: <>Add a new concrete class implementing the shared interface, and add one new case to the factory's switch/dispatch logic — call sites that already use the factory need no changes.</>,
    },
    {
      q: 'When would you avoid using a Factory?',
      a: <>When there's only ever one concrete implementation — the extra indirection buys nothing until a second variant actually needs to exist.</>,
    },
    {
      q: 'How does Factory relate to Open/Closed?',
      a: <>The factory itself still needs a new case per type, so it isn't fully closed to modification, but it isolates that change to one place instead of scattering `new` calls across the codebase.</>,
    },
    {
      q: 'Give a real-world example of Factory.',
      a: <>A LoggerFactory.getLogger(name) call that returns a console, file, or remote logger implementation depending on configuration, without the caller knowing which one it got.</>,
    },
  ],
};

export default topic;
