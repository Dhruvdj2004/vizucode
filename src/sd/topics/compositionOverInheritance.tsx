import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** A Car composed of an Engine and a GPS, rather than inheriting from hybrid subclasses. */
function CompositionDiagram() {
  return (
    <Dg w={520} h={220} cap="Car has-a Engine and has-a GPS, rather than inheriting from EngineCar/GPSCar hybrids">
      <Box x={190} y={20} w={140} h={50} label="Car" c="a" fs={14} />
      <Box x={40} y={130} w={140} h={50} label="Engine" c="b" fs={12} />
      <Box x={340} y={130} w={140} h={50} label="GPS" c="c" fs={12} />
      <Arrow x1={230} y1={70} x2={120} y2={130} c="b" label="has-a" plain dx={-30} dy={10} />
      <Arrow x1={290} y1={70} x2={400} y2={130} c="c" label="has-a" plain dx={30} dy={10} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'composition-over-inheritance',
  num: 33,
  unit: 'OOP Fundamentals',
  title: 'Composition over Inheritance',
  blurb: 'Build behaviour by combining smaller objects ("has-a") rather than deep class hierarchies ("is-a").',
  minutes: 9,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The car-and-engine analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              A car <b>has</b> an engine — you'd never say a car <b>is</b> an engine. If a part needs replacing, you
              swap the engine, not rebuild the whole car from scratch. That's the essence of composition: build the
              whole out of independently replaceable parts.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Inheritance models "is-a"; composition models "has-a" — and most real-world relationships in software
              turn out to be "has-a" once you look closely.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <CompositionDiagram />, caption: 'Car holds references to Engine and GPS and delegates to them, instead of inheriting from a combined hierarchy.' },
        {
          k: 'p',
          text: (
            <>
              Instead of subclassing for every combination of behaviour, an object holds references to other objects
              that implement the behaviour it needs, and <b>delegates</b> to them.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This makes behaviour <b>swappable at runtime</b> — you can hand a <code>Car</code> a different{' '}
              <code>Engine</code> implementation (petrol, electric) without touching the <code>Car</code> class or
              creating a new subclass for every combination.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and why interviewers push on this',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <code>Car</code> has an <code>Engine</code> and a <code>GPS</code> as fields, rather than{' '}
              <code>Car</code> inheriting from an <code>EngineCar</code> and <code>GPSCar</code> hybrid class that
              doesn't really correspond to any real concept.
            </>,
            <>
              Inheritance would force a combinatorial explosion of subclasses (<code>PetrolEngineCarWithGPS</code>,{' '}
              <code>ElectricEngineCarWithoutGPS</code>...) — composition avoids this entirely by mixing and matching
              independent parts.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Asked in interviews',
          text: (
            <>
              Interviewers actively probe this — reach for composition by default and be ready to justify any
              inheritance you do use. "Favor composition over inheritance" is one of the most repeated OOP design
              principles for exactly this reason.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does "favor composition over inheritance" mean?',
      a: <>Prefer building behaviour by combining smaller "has-a" objects and delegating to them, over deep "is-a" class hierarchies, since composition is more flexible and less brittle.</>,
    },
    {
      q: 'Why does inheritance struggle with combinations of behaviour?',
      a: (
        <>
          Every new combination (e.g. petrol engine + GPS, electric engine + no GPS) would need its own subclass,
          leading to a combinatorial explosion of hybrid classes that don't map to real concepts.
        </>
      ),
    },
    {
      q: 'How does composition make behaviour swappable at runtime?',
      a: (
        <>
          The containing object holds a reference to an interface (e.g. Engine) rather than a concrete
          implementation, so a different implementation can be injected without changing the containing class.
        </>
      ),
    },
    {
      q: 'Give a concrete example of composition over inheritance.',
      a: (
        <>
          A <code>Car</code> has an <code>Engine</code> and a <code>GPS</code> as fields, instead of inheriting from
          combined hybrid classes like <code>EngineCar</code> or <code>GPSCar</code>.
        </>
      ),
    },
    {
      q: 'Does this mean inheritance should never be used?',
      a: (
        <>
          No — inheritance is still right for genuine "is-a" relationships with stable shared behaviour (like Sedan
          and SUV extending Vehicle). The guidance is to default to composition and justify inheritance when you
          reach for it.
        </>
      ),
    },
    {
      q: 'What OOP principle is most closely related to composition over inheritance?',
      a: (
        <>
          It pairs closely with abstraction/interfaces — composition is most powerful when the contained object is
          referenced via an interface, so the concrete implementation can vary independently.
        </>
      ),
    },
  ],
};

export default topic;
