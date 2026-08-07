import { Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

function DecoratorDiagram() {
  return (
    <Dg w={480} h={260} cap="EmailDecorator wraps SMSDecorator wraps the base Notification, layered like rings">
      <Box x={40} y={40} w={400} h={180} label="" c="c" fs={0} ghost r={16} />
      <Txt x={60} y={64} fs={12} bold c="c">EmailDecorator</Txt>
      <Box x={70} y={80} w={340} h={120} label="" c="b" fs={0} ghost r={14} />
      <Txt x={90} y={100} fs={12} bold c="b">SMSDecorator</Txt>
      <Box x={120} y={120} w={240} h={60} label="Notification" sub="base send()" c="a" fs={13} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'decorator',
  num: 45,
  unit: 'Design Patterns',
  title: 'Decorator',
  blurb: 'Wraps an object to add behaviour dynamically, without altering its class or subclassing every combination.',
  minutes: 8,
  tags: ['Design pattern'],
  sections: [
    {
      id: 'analogy',
      heading: 'The pizza toppings analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like adding toppings on a base pizza — cheese burst, extra veggies. Each addition wraps the original
              pizza without changing what a "pizza" fundamentally is underneath, and you can stack as many toppings
              as you want.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A decorator looks like the object it wraps from the outside — same interface — so callers can't tell
              whether they're holding a plain object or one wrapped several layers deep.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <DecoratorDiagram />, caption: 'Each layer forwards the call inward and adds its own behaviour around it.' },
        {
          k: 'p',
          text: (
            <>
              A decorator implements the <b>same interface</b> as the object it wraps, forwards calls to it, and
              adds behaviour before/after. Decorators can be <b>stacked</b>, layering responsibilities instead of
              subclassing every combination of features up front.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Because each layer only knows about the interface, not the concrete type underneath it, layers can be
              added, removed, or reordered at runtime by choosing which object to wrap which.
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
          k: 'p',
          text: (
            <>
              Wrapping a base <b>Notification</b> with <b>SMSDecorator</b> then <b>EmailDecorator</b> sends both,
              without a combinatorial class explosion of <b>SMSAndEmailNotification</b>,{' '}
              <b>SMSAndPushNotification</b>, and so on for every combination.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Many small wrapper layers can get hard to debug — a stack trace through five decorators is harder to
              read than one branching method, and it can be unclear which layer actually produced a given side
              effect.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Decorator pattern solve?',
      a: <>It adds behaviour to an individual object at runtime by wrapping it, avoiding a combinatorial explosion of subclasses for every combination of optional features.</>,
    },
    {
      q: 'How does a Decorator stay transparent to the caller?',
      a: <>It implements the same interface as the object it wraps, forwarding calls to the wrapped object and adding behaviour around that call — so callers can't tell it's wrapped.</>,
    },
    {
      q: 'Give a concrete example of Decorator.',
      a: <>Wrapping a base Notification object with SMSDecorator then EmailDecorator to send both an SMS and an email, instead of writing a separate SMSAndEmailNotification class.</>,
    },
    {
      q: 'How is Decorator different from subclassing?',
      a: <>Subclassing fixes combinations at compile time (one class per combination); Decorator composes behaviour at runtime by wrapping objects, so any combination of layers can be assembled dynamically.</>,
    },
    {
      q: 'How is Decorator different from Adapter?',
      a: <>Adapter changes an interface's shape to make two incompatible things work together; Decorator keeps the same interface and adds new behaviour around an existing call.</>,
    },
    {
      q: 'What is a downside of the Decorator pattern?',
      a: <>Deeply stacked decorators can make debugging harder — a stack trace through many wrapper layers is less readable than a single method with clear branches.</>,
    },
  ],
};

export default topic;
