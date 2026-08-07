import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** Vehicle as an abstract class with shared state, and Insurable as a pure-contract interface. */
function InterfaceVsAbstractDiagram() {
  return (
    <Dg w={560} h={240} cap="Vehicle (abstract class, shared state) vs Insurable (interface, pure contract) both implemented by Sedan">
      <Box x={180} y={20} w={180} h={60} label="Vehicle" sub="abstract: registrationNumber, honk()" c="a" fs={11} />
      <Box x={380} y={20} w={160} h={60} label="«interface»" sub="Insurable: getInsuranceValue()" c="c" fs={10} />
      <Box x={190} y={150} w={160} h={50} label="Sedan" c="b" fs={13} />
      <Arrow x1={260} y1={150} x2={260} y2={80} c="a" label="extends" plain dx={-30} />
      <Arrow x1={330} y1={150} x2={420} y2={80} c="c" label="implements" dashed dx={40} dy={-4} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'interface-vs-abstract-class',
  num: 34,
  unit: 'OOP Fundamentals',
  title: 'Interface vs Abstract Class',
  blurb: 'An interface is a pure contract with no shared state; an abstract class can hold shared implementation and fields.',
  minutes: 9,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The job ad vs offer letter analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              An <b>interface</b> is like a job ad ("must know Excel") — pure requirements, nothing given upfront. An{' '}
              <b>abstract class</b> is like a half-filled offer letter — some terms (salary, start date) are already
              fixed for you, others are left blank for you to complete.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Both let you define a contract that concrete classes must fulfil — they differ in how much they're
              allowed to provide upfront.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How they actually differ',
      blocks: [
        { k: 'diagram', el: <InterfaceVsAbstractDiagram />, caption: 'Sedan extends the abstract Vehicle (inheriting shared state) and separately implements the Insurable interface (pure contract).' },
        {
          k: 'p',
          text: (
            <>
              A class can <b>implement multiple interfaces</b> but <b>extend only one abstract class</b> — this is
              the single biggest structural difference across most OOP languages.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Use an <b>interface</b> for "can-do" capabilities (<code>Comparable</code>, <code>Payable</code>) that
              unrelated classes might share. Use an <b>abstract class</b> when subclasses genuinely share state or
              partial implementation that would otherwise be duplicated.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the comparison',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <code>Vehicle</code> as an abstract class holds a shared <code>registrationNumber</code> field and a
              default <code>honk()</code> implementation — every vehicle type gets this for free.
            </>,
            <>
              <code>Insurable</code> as an interface just requires <code>getInsuranceValue()</code> — any unrelated
              class (a Vehicle, a House, a Gadget) can implement it without sharing any lineage.
            </>,
          ],
        },
        {
          k: 'table',
          caption: 'Interface vs abstract class at a glance',
          head: ['Aspect', 'Interface', 'Abstract class'],
          rows: [
            ['Multiple inheritance', 'A class can implement many', 'A class can extend only one'],
            ['Fields / state', 'No instance state (constants only)', 'Can hold instance fields'],
            ['Constructors', 'None', 'Can have a constructor'],
            ['When to use', '"Can-do" capability, unrelated classes', 'Genuinely shared state/implementation'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Modern languages (Java 8+) let interfaces have default methods, blurring this line — the real question
              in an interview isn't "can it have code," it's <b>"is there shared state"</b>. Shared mutable state
              only belongs in an abstract class.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the core difference between an interface and an abstract class?',
      a: (
        <>
          An interface is a pure contract with no instance state — a class can implement many. An abstract class can
          hold shared fields, a constructor, and partial implementation — a class can extend only one.
        </>
      ),
    },
    {
      q: 'When would you choose an abstract class over an interface?',
      a: <>When subclasses genuinely share state or partial implementation that would otherwise be duplicated across every implementing class.</>,
    },
    {
      q: 'When would you choose an interface over an abstract class?',
      a: <>For a "can-do" capability that unrelated classes might need (e.g. Comparable), especially when a class already needs to extend something else.</>,
    },
    {
      q: 'Can a class extend multiple abstract classes?',
      a: <>No — most OOP languages allow extending only one class (abstract or not), but implementing multiple interfaces.</>,
    },
    {
      q: 'Do Java 8+ default methods make interfaces the same as abstract classes?',
      a: (
        <>
          No — they can share default behaviour now, but interfaces still can't hold instance state or
          constructors. The real distinguishing question remains "is there shared mutable state," not "is there
          shared code."
        </>
      ),
    },
    {
      q: 'Give an example combining both in one design.',
      a: (
        <>
          <code>Vehicle</code> as an abstract class holds a shared <code>registrationNumber</code> field and a
          default <code>honk()</code>; <code>Insurable</code> as an interface just requires{' '}
          <code>getInsuranceValue()</code>, implementable by Vehicle or completely unrelated classes.
        </>
      ),
    },
  ],
};

export default topic;
