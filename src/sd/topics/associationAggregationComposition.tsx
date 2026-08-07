import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Three side-by-side box pairs, each with a differently-styled connecting line. */
function RelationshipsDiagram() {
  return (
    <Dg w={600} h={240} cap="Association: plain link. Aggregation: dashed diamond link. Composition: solid strong link.">
      <Txt x={95} y={20} fs={12} bold>Association</Txt>
      <Box x={20} y={40} w={90} h={44} label="Driver" c="a" fs={11} />
      <Box x={130} y={40} w={90} h={44} label="Car" c="a" fs={11} />
      <Arrow x1={110} y1={62} x2={130} y2={62} c="a" plain />
      <Txt x={95} y={110} fs={10} soft>independent lifecycles</Txt>

      <Txt x={295} y={20} fs={12} bold>Aggregation</Txt>
      <Box x={220} y={40} w={90} h={44} label="Department" c="b" fs={11} />
      <Box x={330} y={40} w={90} h={44} label="Employee" c="b" fs={11} />
      <Arrow x1={310} y1={62} x2={330} y2={62} c="b" dashed label="has" />
      <Txt x={295} y={110} fs={10} soft>part can outlive whole</Txt>

      <Txt x={495} y={20} fs={12} bold>Composition</Txt>
      <Box x={420} y={40} w={90} h={44} label="House" c="c" fs={11} />
      <Box x={530} y={40} w={90} h={44} label="Room" c="c" fs={11} />
      <Arrow x1={510} y1={62} x2={530} y2={62} c="c" label="owns" />
      <Txt x={495} y={110} fs={10} soft>part dies with whole</Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'association-aggregation-composition',
  num: 54,
  unit: 'UML & Class Design',
  title: 'Association, Aggregation, Composition',
  blurb: 'Three strengths of "has-a" relationship, from loosest to strongest ownership — the distinction interviewers use to check you understand object lifecycles.',
  minutes: 8,
  tags: ['UML', 'Common follow-up'],

  sections: [
    {
      id: 'analogy',
      heading: 'The gym trainer, the team, and the heart',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              <b>Association</b> is you and your gym trainer — linked, but each exists independently.{' '}
              <b>Aggregation</b> is a cricket team and its players — a player can leave and join another team.{' '}
              <b>Composition</b> is a human body and its heart — the heart doesn't meaningfully exist outside that
              body.
            </>
          ),
        },
        {
          k: 'p',
          text: <>All three describe a "has-a" relationship — they differ only in who owns whose lifecycle.</>,
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually differs',
      blocks: [
        {
          k: 'diagram',
          el: <RelationshipsDiagram />,
          caption: 'Same "has-a" shape, three different ownership strengths.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Association</b>: two classes are linked, but neither owns the other's lifecycle — a{' '}
              <code>Driver</code> and a <code>Car</code> can each exist independently of the other.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Aggregation</b>: a whole-part relationship where the part can outlive the whole — a{' '}
              <code>Department</code> has <code>Employees</code>, who can move to another department and keep
              existing.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <b>Composition</b>: a whole-part relationship where the part cannot exist without the whole — a{' '}
              <code>House</code> and its <code>Room</code>s; delete the house and the rooms are gone too.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'Where this shows up in practice',
      blocks: [
        {
          k: 'table',
          head: ['Relationship', 'Ownership', 'Example'],
          rows: [
            ['Association', 'Neither owns the other; both independent', 'Driver and Car'],
            ['Aggregation', 'Whole groups the part; part survives without whole', 'Department and Employee'],
            ['Composition', 'Whole owns the part; part dies with the whole', 'House and Room'],
          ],
        },
        {
          k: 'p',
          text: (
            <>
              A <b>ParkingLot</b> composed of <b>Level</b>s (delete the lot, the levels are gone) versus a{' '}
              <b>Level</b> aggregating <b>Vehicle</b>s (remove the level, the vehicles still exist elsewhere) shows
              both strengths inside the same system.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              Interviewers use this to check whether you actually understand <b>ownership and lifecycle</b>, not
              just terminology — be ready to justify which one applies to a given pair of classes, and why.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the difference between association, aggregation, and composition?',
      a: (
        <>
          Association: two independent classes linked with no ownership. Aggregation: a whole-part relationship
          where the part can outlive the whole. Composition: a whole-part relationship where the part cannot exist
          without the whole.
        </>
      ),
    },
    {
      q: 'Give an example of aggregation vs composition in the same system.',
      a: (
        <>
          A ParkingLot composed of Levels (levels die with the lot) versus a Level aggregating Vehicles (vehicles
          survive independently of the level).
        </>
      ),
    },
    {
      q: 'How would you decide whether two classes should be modeled with aggregation or composition?',
      a: <>Ask whether the "part" object can meaningfully exist and be reused if the "whole" object is deleted — if yes, aggregation; if no, composition.</>,
    },
    {
      q: 'Why do interviewers care about this distinction?',
      a: <>It tests whether you understand object lifecycle and ownership, not just memorised UML vocabulary — you should be able to justify your choice.</>,
    },
    {
      q: 'Is association the weakest or strongest of the three relationships?',
      a: <>The weakest — it implies a link with no ownership at all, unlike aggregation and composition which are both whole-part relationships.</>,
    },
    {
      q: 'Give an everyday analogy for each of the three relationships.',
      a: (
        <>
          Association: you and your gym trainer. Aggregation: a cricket team and its players. Composition: a human
          body and its heart.
        </>
      ),
    },
  ],
};

export default topic;
