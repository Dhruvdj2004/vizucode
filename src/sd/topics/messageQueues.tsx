import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Producer pushes onto a queue of pending messages; consumers pull at their own pace. */
function QueueDiagram() {
  return (
    <Dg w={600} h={220} cap="A producer pushes messages onto a queue; consumers pull and process them independently">
      <Box x={20} y={80} w={120} h={60} label="Producer" sub="upload photo" c="a" fs={12} />
      <Arrow x1={140} y1={110} x2={200} y2={110} c="a" label="push" dy={-8} />

      {[0, 1, 2, 3].map((i) => (
        <Box key={i} x={200 + i * 50} y={85} w={44} h={50} label={`m${i + 1}`} c="n" fs={11} />
      ))}
      <Txt x={310} y={160} fs={11} soft>
        queue — FIFO-ish, pending work
      </Txt>

      <Arrow x1={400} y1={100} x2={460} y2={70} c="b" label="pull" dx={10} dy={-6} />
      <Arrow x1={400} y1={120} x2={460} y2={150} c="b" label="pull" dx={10} dy={16} />

      <Box x={460} y={30} w={130} h={54} label="Consumer 1" sub="resize image" c="b" fs={12} />
      <Box x={460} y={132} w={130} h={54} label="Consumer 2" sub="run moderation" c="b" fs={12} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'message-queues',
  num: 19,
  unit: 'Messaging & Async',
  title: 'Message Queues',
  blurb: 'Decouple producers from consumers, absorb traffic spikes, and let slow work happen off the request path.',
  minutes: 9,
  tags: ['Very common', 'Async'],

  sections: [
    {
      id: 'analogy',
      heading: 'The hospital token system analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a token system at a hospital OPD — you take a token and go sit down; the doctor calls tokens
              one by one whenever free, instead of everyone standing crowded at the door waiting for immediate
              attention.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A queue lets the "customer" (producer) walk away the instant their request is registered, and the
              "doctor" (consumer) work through the backlog at a sustainable pace.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How producers and consumers stay decoupled',
      blocks: [
        {
          k: 'diagram',
          el: <QueueDiagram />,
          caption: 'The producer returns immediately after pushing; consumers pull and process at their own pace.',
        },
        {
          k: 'p',
          text: (
            <>
              A <b>producer</b> pushes a message onto the queue and returns immediately — it doesn't wait for the
              work to finish. One or more <b>consumers</b> pull messages and process them at their own pace, so a
              slow downstream step never blocks the user-facing request.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This also smooths out <b>traffic spikes</b>: if 10,000 uploads land in one second, they all queue
              up instantly and consumers work through the backlog over the next few minutes, instead of the
              backend falling over trying to process everything at once.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the delivery gotcha',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              Uploading a listing photo returns instantly to the user, while a worker consuming from Kafka/SQS
              resizes it and runs it through moderation in the background.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Messages can be delivered more than once (<b>at-least-once delivery</b> is the common default) —
              consumer logic must be <b>idempotent</b>, so processing the same message twice doesn't double-charge
              a card or resize an image twice into a corrupted file.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem do message queues solve?',
      a: (
        <>
          They decouple producers from consumers, letting slow or bursty work happen off the request path — the
          producer returns immediately, and consumers process at a sustainable pace.
        </>
      ),
    },
    {
      q: 'Why does a message queue help absorb traffic spikes?',
      a: <>Because a spike of incoming work just queues up instantly instead of overwhelming downstream processing — consumers work through the backlog at their own steady rate.</>,
    },
    {
      q: 'What does "at-least-once delivery" mean, and what does it require of consumers?',
      a: (
        <>
          A message might be delivered and processed more than once (e.g. after a consumer crash and retry).
          Consumer logic must be idempotent — processing the same message twice must produce the same result as
          processing it once.
        </>
      ),
    },
    {
      q: 'Give a concrete example of a message queue in a real system.',
      a: <>A photo upload endpoint returns instantly while a worker consuming from Kafka/SQS resizes the image and runs moderation checks in the background.</>,
    },
    {
      q: 'How is a message queue different from a synchronous API call?',
      a: (
        <>
          A synchronous call blocks the caller until the work completes and fails outright if the receiver is
          down. A queue lets the producer move on immediately and buffers work until a consumer is ready,
          tolerating temporary consumer outages.
        </>
      ),
    },
    {
      q: 'What happens if consumers process messages slower than producers push them?',
      a: <>The queue backs up — you scale out more consumer instances, or apply backpressure/rate-limiting upstream, to keep the backlog from growing unbounded.</>,
    },
  ],
};

export default topic;
