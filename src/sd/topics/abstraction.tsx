import { Arrow, Box, Dg, Frame } from '../dgm';
import type { SdTopic } from '../types';

/** Caller code depending only on the PaymentProcessor interface, unaware of which concrete gateway is behind it. */
function AbstractionDiagram() {
  return (
    <Dg w={560} h={240} cap="Caller code depends only on the PaymentProcessor interface, not on Razorpay or Stripe directly">
      <Box x={20} y={90} w={140} h={50} label="CheckoutService" c="n" fs={12} />
      <Box x={210} y={90} w={180} h={50} label="«interface»" sub="PaymentProcessor" c="a" fs={11} />
      <Arrow x1={160} y1={115} x2={210} y2={115} c="a" label="charge(amount)" dx={0} dy={-10} />

      <Frame x={440} y={30} w={110} h={180} label="IMPLS" c="b" />
      <Box x={450} y={50} w={90} h={40} label="Razorpay" c="b" fs={10} />
      <Box x={450} y={100} w={90} h={40} label="Stripe" c="b" fs={10} />
      <Box x={450} y={150} w={90} h={40} label="PayPal" c="b" fs={10} />
      <Arrow x1={390} y1={115} x2={450} y2={70} c="b" dashed plain />
      <Arrow x1={390} y1={115} x2={450} y2={120} c="b" dashed plain />
      <Arrow x1={390} y1={115} x2={450} y2={170} c="b" dashed plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'abstraction',
  num: 30,
  unit: 'OOP Fundamentals',
  title: 'Abstraction',
  blurb: "Expose only what a caller needs to use something correctly, and hide the \"how\" behind it.",
  minutes: 8,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The steering wheel analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like driving a car — you use the steering wheel and pedals without needing to know how the engine's
              combustion actually works internally. The dashboard gives you exactly the controls you need, nothing
              more.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Abstraction applies the same idea to code: a caller depends on a simple, stable contract, while the
              messy implementation details stay hidden and swappable behind it.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <AbstractionDiagram />, caption: 'CheckoutService only knows about PaymentProcessor — it never sees Razorpay, Stripe, or PayPal directly.' },
        {
          k: 'p',
          text: (
            <>
              Interfaces and abstract classes define a <b>contract</b> — the set of operations a caller can rely on.
              Concrete classes implement the actual details behind that contract.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The caller codes against the contract and never needs to know which concrete implementation is behind
              it — which also means the implementation can be swapped later without touching any calling code.
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
          k: 'ul',
          items: [
            <>
              Code that calls <code>paymentProcessor.charge(amount)</code> doesn't need to know if it's Razorpay or
              Stripe underneath — swapping the payment gateway later is a one-line change at the point where the
              concrete class is instantiated.
            </>,
            <>
              A <code>List&lt;T&gt;</code> interface in Java hides whether it's backed by an <code>ArrayList</code>{' '}
              or a <code>LinkedList</code> — calling code just uses <code>add()</code>/<code>get()</code>.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Abstraction and encapsulation are often confused in interviews — abstraction is about hiding{' '}
              <b>complexity via design</b> (interfaces, exposing a minimal contract), encapsulation is about hiding{' '}
              <b>data via access control</b> (private fields). They usually work together but answer different
              questions.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is abstraction in OOP?',
      a: <>Exposing only what a caller needs to use something correctly, via a contract (interface/abstract class), while hiding the implementation details behind it.</>,
    },
    {
      q: 'How does abstraction differ from encapsulation?',
      a: (
        <>
          Abstraction hides complexity through design — a caller depends on a simple contract, not the internals.
          Encapsulation hides data through access control — private fields reachable only via controlled methods.
        </>
      ),
    },
    {
      q: 'Give a real example of abstraction.',
      a: (
        <>
          A <code>PaymentProcessor</code> interface with a <code>charge(amount)</code> method — the caller never
          knows or cares whether Razorpay, Stripe, or PayPal is doing the actual work behind it.
        </>
      ),
    },
    {
      q: 'What is the practical benefit of coding against an abstraction?',
      a: (
        <>
          The concrete implementation can be swapped later — for testing (mocks), for a new vendor, or for a
          performance rewrite — without touching any of the calling code.
        </>
      ),
    },
    {
      q: 'Can abstraction exist without encapsulation?',
      a: (
        <>
          In principle they're separable, but in practice good OOP design uses both together — an abstraction
          usually wraps an encapsulated implementation underneath.
        </>
      ),
    },
    {
      q: 'What is a sign that abstraction is missing from a codebase?',
      a: (
        <>
          Calling code directly instantiates and depends on a concrete class (e.g. <code>new RazorpayClient()</code>{' '}
          scattered everywhere) — swapping that vendor later means touching every call site instead of one.
        </>
      ),
    },
  ],
};

export default topic;
