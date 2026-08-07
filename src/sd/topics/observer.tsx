import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function ObserverDiagram() {
  return (
    <Dg w={560} h={220} cap="PriceAlertSubject notifying every subscribed Watcher when the price drops">
      <Box x={210} y={80} w={160} h={60} label="PriceAlertSubject" sub="setPrice(p)" c="a" fs={12} />
      <Box x={20} y={20} w={130} h={50} label="Watcher A" c="b" fs={12} />
      <Box x={20} y={150} w={130} h={50} label="Watcher B" c="b" fs={12} />
      <Box x={410} y={85} w={130} h={50} label="Watcher C" c="b" fs={12} />
      <Arrow x1={210} y1={95} x2={150} y2={45} c="a" label="notify" plain />
      <Arrow x1={210} y1={125} x2={150} y2={170} c="a" label="notify" plain />
      <Arrow x1={370} y1={105} x2={410} y2={105} c="a" label="notify" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'observer',
  num: 43,
  unit: 'Design Patterns',
  title: 'Observer',
  blurb: "Subscribers register to be notified automatically when a subject's state changes, without polling for it.",
  minutes: 9,
  tags: ['Design pattern', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The exam-result SMS alert analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like subscribing to exam-result SMS alerts — the exam board doesn't know you personally, it just
              blasts the update to everyone who signed up, the moment results are out.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The key relationship is <b>one-to-many</b>: one subject, many observers, and the subject doesn't care
              how many observers exist or what they do with the notification.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <ObserverDiagram />, caption: 'A single price change fans out to every currently subscribed watcher.' },
        {
          k: 'p',
          text: (
            <>
              The subject keeps a list of observers and calls a common <code>update()</code> method on each one
              whenever its state changes — subject and observers stay loosely coupled since the subject never needs
              to know observer internals, only that they implement the shared interface.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Notify every subscribed buyer on a price drop',
          code: `interface Watcher { void onPriceDrop(double newPrice); }

class PriceAlertSubject {
  List<Watcher> watchers = new ArrayList<>();
  void subscribe(Watcher w) { watchers.add(w); }

  void setPrice(double p) {
    for (Watcher w : watchers) w.onPriceDrop(p);
  }
}`,
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
              A <b>PriceAlertSubject</b> for a listing notifies every subscribed buyer's <b>Watcher</b> the moment
              the seller drops the price — buyers never poll the listing, they just wait to be called.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is the in-process, single-app version of pub/sub — good to mention the parallel when asked to
              compare LLD and HLD patterns (a message queue like Kafka is the distributed-system equivalent).
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the Observer pattern solve?',
      a: <>It lets multiple objects (observers) get notified automatically when a subject's state changes, without polling and without the subject needing to know observer internals.</>,
    },
    {
      q: 'What is the relationship cardinality in Observer?',
      a: <>One-to-many: a single subject can have many observers subscribed at once, and all of them receive the same notification when state changes.</>,
    },
    {
      q: 'How does Observer keep subject and observers loosely coupled?',
      a: <>The subject only depends on a shared observer interface (e.g. a single update method), not on any concrete observer class, so new observer types can subscribe without the subject changing.</>,
    },
    {
      q: 'Give a concrete example of Observer.',
      a: <>A PriceAlertSubject that keeps a list of Watcher objects and calls onPriceDrop() on each one whenever the price is updated.</>,
    },
    {
      q: 'How does Observer relate to pub/sub systems like Kafka?',
      a: <>Observer is the in-process, single-application version of the same idea — Kafka and similar message queues generalise it across processes and machines with durable, decoupled delivery.</>,
    },
    {
      q: 'What is a downside of the Observer pattern?',
      a: <>If observers are slow or throw exceptions, a naive synchronous notify loop can block the subject or let one bad observer disrupt notifying the rest, unless errors are isolated per observer.</>,
    },
  ],
};

export default topic;
