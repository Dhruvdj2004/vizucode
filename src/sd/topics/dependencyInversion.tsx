import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function DipDiagram() {
  return (
    <Dg w={560} h={240} cap="OrderService depends on the PaymentGateway interface, not a concrete implementation">
      <Box x={190} y={20} w={180} h={55} label="OrderService" c="a" fs={13} />
      <Box x={190} y={100} w={180} h={50} label="PaymentGateway" sub="interface" c="n" fs={12} />
      <Arrow x1={280} y1={75} x2={280} y2={100} c="a" label="depends on" />
      <Box x={40} y={190} w={180} h={50} label="RazorpayGateway" c="b" fs={12} />
      <Box x={340} y={190} w={180} h={50} label="MockGateway" sub="for tests" c="c" fs={12} />
      <Arrow x1={130} y1={190} x2={250} y2={150} c="b" plain />
      <Arrow x1={430} y1={190} x2={310} y2={150} c="c" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'dependency-inversion',
  num: 39,
  unit: 'SOLID Principles',
  title: 'Dependency Inversion',
  blurb: 'High-level modules should depend on abstractions, not concrete low-level classes — so either side can change independently.',
  minutes: 9,
  tags: ['SOLID', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The TV remote analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a TV remote — you don't rewire your TV every time you buy a new remote brand. TV and remote just
              agree on infrared signals (the "interface") as the shared contract, and either side can be swapped
              without touching the other.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              "Inversion" refers to flipping the usual direction of dependency: instead of a high-level policy class
              depending directly on a low-level detail class, both depend on an abstraction that sits between them.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <DipDiagram />, caption: 'OrderService never mentions RazorpayGateway by name — it only knows the PaymentGateway interface.' },
        {
          k: 'p',
          text: (
            <>
              A high-level class takes an interface in its constructor (<b>dependency injection</b>) rather than
              instantiating a concrete implementation itself. The concrete choice is wired up from <b>outside</b> —
              by a DI framework, a factory, or just the code at startup — not decided inside the high-level class.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This is what "program to an interface, not an implementation" means in practice: the high-level class
              never even imports the concrete class, so it can't accidentally couple to details specific to one
              provider.
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
              <b>OrderService</b> depends on a <b>PaymentGateway</b> interface, not directly on{' '}
              <b>RazorpayGateway</b> — swapping providers, or mocking it in tests, needs zero changes to{' '}
              <b>OrderService</b>.
            </>,
            <>
              A notification module depending on a <b>MessageSender</b> interface rather than directly on an{' '}
              <b>SmtpEmailClient</b>, so switching to a different email provider only touches the injected
              implementation.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is what makes unit testing with mocks possible at all — connect the dots for the interviewer if
              they ask "how would you test this class without hitting a real payment gateway?"
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What does Dependency Inversion actually say?',
      a: <>High-level modules should not depend on low-level modules — both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.</>,
    },
    {
      q: 'What does "inversion" mean here?',
      a: <>Normally a high-level policy class would directly depend on a concrete low-level class. DIP inverts that: both depend on a shared interface instead, so the direction of source-code dependency no longer matches the direction of control flow.</>,
    },
    {
      q: 'How is DIP implemented in code?',
      a: <>Via dependency injection — the high-level class takes an interface (not a concrete class) through its constructor or setter, and the concrete implementation is supplied from outside, usually at startup or by a DI container.</>,
    },
    {
      q: 'How does DIP make unit testing easier?',
      a: <>Because a class depends on an interface, tests can inject a mock or fake implementation instead of the real one, letting the class be tested in isolation without hitting a real database, network, or payment gateway.</>,
    },
    {
      q: 'Give a concrete example of DIP.',
      a: <>OrderService takes a PaymentGateway interface in its constructor rather than instantiating RazorpayGateway directly, so it can be tested with a MockGateway and the provider can be swapped without touching OrderService.</>,
    },
    {
      q: 'How is DIP different from Dependency Injection?',
      a: <>DIP is the design principle (depend on abstractions, not concretions); dependency injection is one common technique used to satisfy it, by supplying the concrete implementation from outside the class.</>,
    },
    {
      q: 'How does DIP relate to Open/Closed?',
      a: <>Both push toward coding against stable interfaces — DIP focuses on which direction dependencies point, while OCP focuses on adding new implementations without editing existing code; together they enable swapping implementations freely.</>,
    },
  ],
};

export default topic;
