import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** Sedan and SUV extending a shared Vehicle base class. */
function InheritanceDiagram() {
  return (
    <Dg w={520} h={240} cap="Sedan and SUV both extend Vehicle, inheriting shared behaviour and overriding some of it">
      <Box x={190} y={20} w={160} h={60} label="Vehicle" sub="getFuelEfficiency()" c="a" fs={13} />
      <Box x={60} y={150} w={160} h={60} label="Sedan" sub="overrides getTrunkCapacity()" c="b" fs={12} />
      <Box x={300} y={150} w={160} h={60} label="SUV" sub="overrides getTrunkCapacity()" c="b" fs={12} />
      <Arrow x1={140} y1={150} x2={250} y2={80} c="a" label="extends" plain dx={-50} dy={0} />
      <Arrow x1={380} y1={150} x2={310} y2={80} c="a" label="extends" plain dx={50} dy={0} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'inheritance',
  num: 31,
  unit: 'OOP Fundamentals',
  title: 'Inheritance',
  blurb: 'A class reuses and extends the behaviour of a parent class, for genuine "is-a" relationships.',
  minutes: 8,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The family surname analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like children inheriting a surname and general traits from their parents, while each child still
              develops their own individual personality on top of it. They share what's common by default, and
              differ where it matters.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Inheritance lets a class reuse a parent's fields and methods automatically, instead of copying that
              code into every related class by hand.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <InheritanceDiagram />, caption: 'Sedan and SUV both extend Vehicle — they share getFuelEfficiency(), but each overrides getTrunkCapacity() with its own logic.' },
        {
          k: 'p',
          text: (
            <>
              The subclass gets the parent's fields and methods automatically, and can <b>override</b> specific
              methods to provide its own behaviour where it needs to differ from the parent.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This reduces duplication when multiple types truly share a base shape — the shared logic lives in one
              place (the parent), and each subclass only needs to write the parts that are genuinely different.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the common mistake',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <code>Sedan</code> and <code>SUV</code> both extend <code>Vehicle</code>, inheriting{' '}
              <code>getFuelEfficiency()</code> as-is while overriding <code>getTrunkCapacity()</code> with
              body-specific logic.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Deep inheritance chains (4–5 levels) get brittle fast — a change in the base class ripples
              unpredictably through every descendant. Once a hierarchy gets that deep, prefer{' '}
              <b>composition</b> instead of pushing inheritance further.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is inheritance?',
      a: <>A class reusing and extending the fields/methods of a parent class, used for genuine "is-a" relationships.</>,
    },
    {
      q: 'What is the benefit of inheritance?',
      a: (
        <>
          It removes duplication — shared behaviour lives once in the parent class, and subclasses only implement
          what's genuinely different from it.
        </>
      ),
    },
    {
      q: 'When should you use inheritance vs composition?',
      a: (
        <>
          Use inheritance only for a true "is-a" relationship with shared behaviour that won't need to change
          independently per subclass. Prefer composition when you just need to reuse behaviour across otherwise
          unrelated classes.
        </>
      ),
    },
    {
      q: 'What is method overriding?',
      a: (
        <>
          A subclass providing its own implementation of a method already defined in the parent class, replacing the
          parent's behaviour for that subclass.
        </>
      ),
    },
    {
      q: 'Why are deep inheritance chains considered risky?',
      a: (
        <>
          A change to a base class several levels up can ripple unpredictably through every descendant class, making
          the system fragile and hard to reason about — the deeper the chain, the worse this gets.
        </>
      ),
    },
    {
      q: 'Give a concrete "is-a" example suitable for inheritance.',
      a: <>Sedan and SUV both genuinely "are" a Vehicle, sharing fuel-efficiency logic while differing in trunk capacity — a textbook inheritance case.</>,
    },
  ],
};

export default topic;
