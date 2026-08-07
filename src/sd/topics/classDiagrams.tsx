import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** ParkingLot composes Level composes Spot, with Vehicle associated to Spot. */
function ClassDiagramExample() {
  return (
    <Dg w={600} h={260} cap="ParkingLot composes Levels, Level composes Spots, Vehicle is associated with Spot">
      <Box x={20} y={30} w={140} h={70} label="ParkingLot" sub="- levels: Level[] + parkVehicle()" c="a" fs={11} />
      <Box x={230} y={30} w={140} h={70} label="Level" sub="- spots: Spot[] + findFreeSpot()" c="a" fs={11} />
      <Box x={440} y={30} w={140} h={70} label="Spot" sub="- occupied: bool + assign()" c="a" fs={11} />
      <Box x={440} y={160} w={140} h={70} label="Vehicle" sub="- plate: string + type" c="b" fs={11} />

      <Arrow x1={160} y1={65} x2={230} y2={65} c="a" label="composes" />
      <Arrow x1={370} y1={65} x2={440} y2={65} c="a" label="composes" />
      <Arrow x1={510} y1={100} x2={510} y2={160} c="b" label="associated with" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'class-diagrams',
  num: 52,
  unit: 'UML & Class Design',
  title: 'Class Diagrams',
  blurb:
    'Show classes, their attributes/methods, and how they relate — the diagram you\'re usually expected to sketch live in an LLD interview.',
  minutes: 9,
  tags: ['UML', 'LLD staple'],

  sections: [
    {
      id: 'analogy',
      heading: 'The family tree analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a family tree chart, but for classes instead of people — showing what each "class" owns
              (attributes), what it can do (methods), and how it's connected to the others.
            </>
          ),
        },
        {
          k: 'p',
          text: <>It's the single diagram that most LLD interviews expect you to be able to draw on a whiteboard.</>,
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        {
          k: 'diagram',
          el: <ClassDiagramExample />,
          caption: 'ParkingLot → Level → Spot via composition; Spot ↔ Vehicle via association.',
        },
        {
          k: 'p',
          text: (
            <>
              Each box lists the <b>class name</b>, then <b>fields</b>, then <b>methods</b>, with{' '}
              <code>+</code> for public and <code>-</code> for private.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Lines between boxes show relationships: a <b>plain line</b> for association, a{' '}
              <b>hollow arrow</b> for inheritance, a <b>hollow diamond</b> for aggregation, and a{' '}
              <b>filled diamond</b> for composition.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where it shows up in practice',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              For a parking lot: boxes for <b>ParkingLot</b>, <b>Level</b>, <b>Spot</b>, <b>Vehicle</b>, with a{' '}
              composition line from <b>ParkingLot</b> to <b>Level</b> — levels don't meaningfully exist without
              the lot they belong to.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              You don't need perfect UML notation in an interview — a clear box-and-arrow sketch that shows
              relationships <b>correctly</b> matters far more than notation purity. Getting composition vs
              aggregation right matters; getting the exact diamond style right does not.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does a class diagram show that a sequence diagram doesn\'t?',
      a: (
        <>
          The static structure — classes, their attributes/methods, and relationships — rather than a specific
          runtime flow of calls over time.
        </>
      ),
    },
    {
      q: 'What is the difference in notation between association, aggregation, and composition?',
      a: (
        <>
          A plain line for association, a hollow diamond for aggregation (whole-part, part can outlive the whole),
          and a filled diamond for composition (whole-part, part cannot outlive the whole).
        </>
      ),
    },
    {
      q: 'What does a hollow arrow represent in a class diagram?',
      a: <>Inheritance — the class at the arrow's tail extends/implements the class at its head.</>,
    },
    {
      q: 'How would you draw ParkingLot, Level, and Spot?',
      a: (
        <>
          ParkingLot composes Level (filled diamond, since levels don't exist outside a lot), Level composes Spot
          similarly, and Spot associates with Vehicle (plain line, since both exist independently of each other).
        </>
      ),
    },
    {
      q: 'How strict does UML notation need to be in an interview?',
      a: <>Not very — a clear, correct box-and-arrow sketch matters far more than exact UML syntax purity.</>,
    },
    {
      q: 'What do + and - mean on a field or method in a class diagram?',
      a: <>+ denotes public visibility, - denotes private visibility.</>,
    },
  ],
};

export default topic;
