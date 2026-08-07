import { Arrow, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Four lifelines with time-ordered horizontal calls between them. */
function SequenceDiagramExample() {
  const xs = [70, 250, 430, 560];
  const labels = ['User', 'BookingService', 'InventoryService', 'PaymentService'];
  return (
    <Dg w={620} h={280} cap="Time flows top to bottom; each horizontal arrow is a call between two lifelines">
      {xs.map((x, i) => (
        <Txt key={i} x={x} y={20} fs={11} anchor="middle" bold>
          {labels[i]}
        </Txt>
      ))}
      {xs.map((x, i) => (
        <Arrow key={i} x1={x} y1={32} x2={x} y2={250} c="n" dashed plain />
      ))}

      <Arrow x1={70} y1={70} x2={250} y2={70} c="a" label="createBooking()" />
      <Arrow x1={250} y1={110} x2={430} y2={110} c="a" label="checkStock()" />
      <Arrow x1={430} y1={150} x2={250} y2={150} c="b" dashed label="ok" />
      <Arrow x1={250} y1={190} x2={560} y2={190} c="a" label="charge()" />
      <Arrow x1={560} y1={225} x2={250} y2={225} c="b" dashed label="success" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'sequence-diagrams',
  num: 53,
  unit: 'UML & Class Design',
  title: 'Sequence Diagrams',
  blurb: 'Show the order of calls between objects over time for one specific flow — the strongest way to answer "walk me through what happens."',
  minutes: 8,
  tags: ['UML', 'Interview technique'],

  sections: [
    {
      id: 'analogy',
      heading: 'The chat timeline analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a WhatsApp chat timeline — who messaged whom, in what order, showing the exact back-and-forth
              flow of one specific conversation, not every possible conversation that could happen.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A sequence diagram captures <b>one concrete scenario</b>, not the whole system's structure — that's
              what makes it precise.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        {
          k: 'diagram',
          el: <SequenceDiagramExample />,
          caption: 'Placing a booking: User → BookingService → InventoryService → PaymentService, in call order.',
        },
        {
          k: 'p',
          text: (
            <>
              Each participant gets a vertical <b>lifeline</b>. Horizontal arrows between lifelines represent
              method calls, drawn in <b>top-to-bottom time order</b> — the further down the diagram, the later the
              call happens.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A solid arrow is typically a call/request; a dashed arrow is the response returning back — this
              matches the request/response pairs shown above between InventoryService and PaymentService.
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
              For "place a booking": <b>User → BookingService → InventoryService → PaymentService →
              NotificationService</b>, in exact call order — showing precisely what happens and when.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              Reach for this specifically when an interviewer asks <b>"walk me through what happens when X"</b> —
              it's a much stronger, more precise answer than describing the flow in prose.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does a sequence diagram capture that a class diagram doesn\'t?',
      a: <>The time-ordered sequence of calls between objects for one specific flow, rather than the static structure of the classes involved.</>,
    },
    {
      q: 'What does a vertical line in a sequence diagram represent?',
      a: <>A lifeline — one participant/object that exists over the duration of the interaction shown.</>,
    },
    {
      q: 'How is time represented in a sequence diagram?',
      a: <>Top to bottom — calls higher up happen earlier, calls lower down happen later.</>,
    },
    {
      q: 'When should you draw a sequence diagram in an interview instead of describing the flow verbally?',
      a: <>Whenever asked to "walk through what happens when X" — it makes the exact order and participants of a flow unambiguous.</>,
    },
    {
      q: 'What is typically the difference between a solid and a dashed arrow in a sequence diagram?',
      a: <>Solid usually represents a call/request; dashed represents the response returning back to the caller.</>,
    },
    {
      q: 'Walk through a sequence diagram for placing a booking.',
      a: <>User calls BookingService, which calls InventoryService to check stock, then calls PaymentService to charge, each call and its response shown in the order it happens.</>,
    },
  ],
};

export default topic;
