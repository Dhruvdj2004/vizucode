import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function BuilderDiagram() {
  return (
    <Dg w={560} h={200} cap="A Builder accumulating setMake, setPrice, setYear before producing the final CarListing">
      <Box x={20} y={70} w={140} h={60} label="Builder" sub="setMake, setPrice, setYear" c="a" fs={12} />
      <Arrow x1={160} y1={100} x2={260} y2={100} c="a" label="build()" />
      <Box x={280} y={70} w={160} h={60} label="CarListing" sub="final immutable object" c="b" fs={13} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'builder',
  num: 42,
  unit: 'Design Patterns',
  title: 'Builder',
  blurb: 'Constructs a complex object step by step, avoiding a constructor with a dozen optional parameters.',
  minutes: 7,
  tags: ['Design pattern'],
  sections: [
    {
      id: 'analogy',
      heading: 'The burger counter analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like customising a burger at the counter — bun, patty, cheese, extra toppings, added one step at a
              time until you say "that's it, make it." Each step is optional and readable on its own.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Builder exists mainly to fix a readability problem: a constructor with ten positional parameters,
              several of them optional, is easy to call with arguments in the wrong order and hard to read at the
              call site.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <BuilderDiagram />, caption: 'Chained setter calls accumulate configuration, then build() produces the final object.' },
        {
          k: 'p',
          text: (
            <>
              A separate builder object accumulates configuration via <b>chained calls</b>, then produces the final
              <b> immutable</b> object in one <code>build()</code> call. Every step names the field it's setting,
              so the call site reads like a sentence instead of a list of positional values.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Because the target object is only assembled at <code>build()</code>, the builder can validate that all
              required fields were actually set before handing back a fully-formed, immutable result.
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
          k: 'code',
          title: 'Chained builder instead of a long constructor',
          code: `CarListing listing = new CarListing.Builder()
    .setMake("Honda")
    .setPrice(850000)
    .setYear(2021)
    .build();

// vs. a nine-argument constructor:
// new CarListing("Honda", null, 850000, 2021, null, null, false, null, null)`,
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Only worth it once a class has several optional fields — for two or three required fields, a plain
              constructor is simpler and adding a Builder just adds ceremony with no real readability win.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Builder pattern solve?',
      a: <>It replaces a constructor with many (often optional) parameters with a step-by-step, named chain of calls that's readable and less error-prone at the call site.</>,
    },
    {
      q: 'How does Builder differ from just using a constructor with default values?',
      a: <>Many languages don't support named/default parameters cleanly, and even where they do, a builder can validate required fields and produce an immutable object only once build() is called.</>,
    },
    {
      q: 'Why is the final object usually immutable in the Builder pattern?',
      a: <>Because all configuration happens on the mutable builder first; once build() runs, the resulting object can be constructed as immutable and thread-safe from the start.</>,
    },
    {
      q: 'When would you NOT use Builder?',
      a: <>When a class has only two or three required fields — a plain constructor is simpler and a builder just adds unnecessary boilerplate.</>,
    },
    {
      q: 'Give a real example of Builder.',
      a: <>Constructing a CarListing with make, price, year, and several optional fields via chained setMake().setPrice().setYear().build() calls instead of a long positional constructor.</>,
    },
    {
      q: 'Can a Builder validate its inputs?',
      a: <>Yes — build() is a natural place to check that all required fields were set and throw if something mandatory is missing, before the final object is ever created.</>,
    },
  ],
};

export default topic;
