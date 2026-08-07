import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** One loop calling pay() on a list of different PaymentMethod objects, each running its own logic. */
function PolymorphismDiagram() {
  return (
    <Dg w={560} h={240} cap="Calling pay() on a list of different PaymentMethod objects — each runs its own implementation">
      <Box x={20} y={90} w={160} h={50} label="for (p : list) p.pay()" c="n" fs={11} />
      <Box x={260} y={20} w={130} h={40} label="CreditCard" sub="pay()" c="a" fs={11} />
      <Box x={260} y={100} w={130} h={40} label="UPI" sub="pay()" c="b" fs={11} />
      <Box x={260} y={180} w={130} h={40} label="Wallet" sub="pay()" c="c" fs={11} />
      <Arrow x1={180} y1={100} x2={260} y2={40} c="a" plain />
      <Arrow x1={180} y1={115} x2={260} y2={120} c="b" plain />
      <Arrow x1={180} y1={130} x2={260} y2={200} c="c" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'polymorphism',
  num: 32,
  unit: 'OOP Fundamentals',
  title: 'Polymorphism',
  blurb: 'Different classes respond to the same method call in their own way, so calling code can treat them uniformly.',
  minutes: 8,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The "book" analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Think of the word "book" as a verb. Booking a train, a movie, or a doctor's appointment all use the
              same word, but each performs a completely different concrete action depending on what you're booking.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Polymorphism lets calling code use one uniform interface (<code>pay()</code>, "book") while each object
              behind it does something different when that call actually runs.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <PolymorphismDiagram />, caption: 'One loop calling pay() on a mixed list — CreditCard, UPI, and Wallet each run their own logic at runtime.' },
        {
          k: 'p',
          text: (
            <>
              <b>Runtime (dynamic) polymorphism</b> happens via method overriding plus an interface or base-class
              reference. The actual method that runs is resolved based on the <b>real object type</b> at runtime, not
              the declared/static type of the variable.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This is what lets a single piece of calling code stay unchanged even as new types are added — the code
              just calls the shared method name, and each type supplies its own behaviour.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the common mix-up',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A <code>List&lt;PaymentMethod&gt;</code> holding <code>CreditCard</code>, <code>UPI</code>, and{' '}
              <code>Wallet</code> objects can all be charged via one loop calling <code>pay()</code> — each object
              runs its own concrete logic without the loop needing to know which type it's looking at.
            </>
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Don't confuse this with <b>overloading</b> (same method name, different parameter lists on the same
              class) — that's resolved at <b>compile-time</b> based on the arguments, not <b>runtime</b> based on the
              actual object type. Interviewers frequently probe exactly this distinction.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is polymorphism?',
      a: <>Different classes responding to the same method call in their own way, so calling code can treat them uniformly through a shared interface.</>,
    },
    {
      q: 'What is the difference between runtime and compile-time polymorphism?',
      a: (
        <>
          Runtime (dynamic) polymorphism — method overriding — resolves which method runs based on the actual object
          type at runtime. Compile-time polymorphism — method overloading — resolves based on argument types at
          compile time.
        </>
      ),
    },
    {
      q: 'Give a real example of runtime polymorphism.',
      a: (
        <>
          A <code>List&lt;PaymentMethod&gt;</code> holding CreditCard, UPI, and Wallet objects — calling{' '}
          <code>pay()</code> on each in a loop runs each object's own overridden implementation.
        </>
      ),
    },
    {
      q: 'How does the JVM (or equivalent runtime) decide which overridden method to call?',
      a: (
        <>
          It looks at the actual object's type at runtime (via a virtual method table / dynamic dispatch), not the
          declared type of the reference variable holding it.
        </>
      ),
    },
    {
      q: 'What OOP feature does polymorphism depend on?',
      a: <>Inheritance or interface implementation — there must be a shared supertype/contract that multiple concrete types implement differently.</>,
    },
    {
      q: 'Why is polymorphism useful when adding new types to a system?',
      a: (
        <>
          Calling code that operates on the shared interface doesn't need to change when a new implementing type is
          added — it just needs to conform to the same contract, e.g. a new payment method that implements{' '}
          <code>pay()</code>.
        </>
      ),
    },
  ],
};

export default topic;
