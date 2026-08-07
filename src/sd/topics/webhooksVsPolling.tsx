import { Arrow, Box, Dg, Frame, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** Repeated "anything new?" requests vs one push the moment something happens. */
function WebhookVsPollingDiagram() {
  return (
    <Dg w={600} h={260} cap="Polling repeatedly asks for updates; a webhook pushes data the instant it exists">
      <Frame x={2} y={8} w={280} h={244} label="POLLING" c="n" />
      <Box x={30} y={40} w={100} h={40} label="Client" c="n" fs={12} />
      <Box x={170} y={40} w={100} h={40} label="Server" c="n" fs={12} />
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={130} y1={62} x2={170} y2={62 + i * 42} c="n" dashed label="any update?" dy={-4} />
      ))}
      <Txt x={142} y={230} fs={11} soft>
        wastes requests, delayed by poll interval
      </Txt>

      <Frame x={318} y={8} w={280} h={244} label="WEBHOOK" c="a" />
      <Box x={348} y={40} w={110} h={44} label="Payment gateway" c="a" fs={11} />
      <Box x={498} y={110} w={100} h={44} label="/webhooks" sub="callback URL" c="a" fs={11} />
      <Arrow x1={458} y1={62} x2={498} y2={124} c="a" label="event happens → push" dx={-10} dy={-14} />
      <Txt x={458} y={230} fs={11} soft>
        instant, one call, needs verification
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'webhooks-vs-polling',
  num: 22,
  unit: 'Messaging & Async',
  title: 'Webhooks vs Polling',
  blurb: 'Polling repeatedly asks "anything new?"; a webhook pushes data to you the moment it becomes available.',
  minutes: 8,
  tags: ['Common', 'Async'],

  sections: [
    {
      id: 'analogy',
      heading: 'The phone call analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Polling is repeatedly calling a friend to ask "are you home yet?" A webhook is your friend calling{' '}
              <b>you</b> the moment they actually reach home — no wasted calls, no guessing at the right interval.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Both solve the same problem — "tell me when something changes on the other side" — but they put
              the effort on opposite ends of the connection.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How each one actually delivers the update',
      blocks: [
        {
          k: 'diagram',
          el: <WebhookVsPollingDiagram />,
          caption: 'Polling repeats "anything new?" on a timer; a webhook calls you back the instant an event occurs.',
        },
        {
          k: 'p',
          text: (
            <>
              <b>Polling</b> means the client repeatedly asks the server "anything new?" on a timer. It wastes
              requests when nothing has changed, and adds delay up to the length of the poll interval — you only
              find out as fast as you're willing to keep asking.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              A <b>webhook</b> is a callback URL the other system calls immediately when an event happens —
              cheaper at scale and near-instant, but it needs the receiving end to handle <b>signature
              verification</b> (proving the caller is who they claim) and <b>retry/duplicate handling</b>.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the security gotcha',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              A payment gateway calling your <code>/webhooks/payment-success</code> endpoint instead of you
              polling "is this payment done yet?" every few seconds.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Webhook endpoints must verify the sender (signature) and handle duplicate deliveries — they're a
              public URL, effectively an API you didn't design the caller for, so anyone who finds the URL could
              try to spoof events if you skip verification.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is the fundamental difference between polling and webhooks?',
      a: (
        <>
          Polling has the client repeatedly ask the server for updates on a timer. A webhook has the server push
          data to the client the instant an event happens, via a pre-registered callback URL.
        </>
      ),
    },
    {
      q: 'What are the downsides of polling?',
      a: <>Wasted requests when nothing has changed, and update delay bounded by the poll interval — you can\'t find out faster than you\'re willing to keep asking.</>,
    },
    {
      q: 'What extra work does a webhook receiver have to do that a poller doesn\'t?',
      a: <>Verify the sender's signature to prove the request is genuine, and handle duplicate/out-of-order deliveries — a webhook endpoint is a public URL anyone could try to call.</>,
    },
    {
      q: 'Give a real-world example of a webhook.',
      a: <>A payment gateway calling your /webhooks/payment-success endpoint the instant a payment completes, instead of you polling its API repeatedly.</>,
    },
    {
      q: 'When might polling still be the right choice over a webhook?',
      a: <>When you can\'t expose a public callback URL (e.g. behind a firewall with no inbound access), or when near-real-time isn\'t required and simplicity matters more.</>,
    },
    {
      q: 'Why are webhooks generally cheaper at scale than polling?',
      a: <>Because no request is made until there\'s actually something to report — polling generates constant traffic regardless of whether anything changed.</>,
    },
  ],
};

export default topic;
