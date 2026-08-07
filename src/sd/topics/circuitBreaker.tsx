import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

/** The 3-state circuit breaker state machine. */
function CircuitBreakerDiagram() {
  return (
    <Dg w={560} h={260} cap="Closed to Open on failures, Open to Half-Open after a timeout, Half-Open to Closed on success">
      <Box x={30} y={100} w={140} h={70} label="Closed" sub="calls flow normally" c="b" fs={14} />
      <Box x={420} y={100} w={140} h={70} label="Open" sub="calls fail fast" c="c" fs={14} />
      <Box x={220} y={20} w={150} h={60} label="Half-Open" sub="test a few calls" c="a" fs={13} />

      <Arrow x1={170} y1={125} x2={420} y2={125} c="c" label="too many failures" dx={0} dy={-10} />
      <Arrow x1={420} y1={100} x2={330} y2={60} c="a" label="cooldown timeout" bend="h" dx={20} dy={-4} />
      <Arrow x1={220} y1={55} x2={170} y2={110} c="b" label="test calls succeed" bend="v" dx={-40} dy={0} />
      <Arrow x1={330} y1={45} x2={420} y2={95} c="c" label="test call fails" dx={30} dy={-16} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'circuit-breaker',
  num: 25,
  unit: 'Architecture Style & Reliability',
  title: 'Circuit Breaker',
  blurb: 'Stops calling a failing downstream service for a cooldown period instead of retrying endlessly.',
  minutes: 9,
  tags: ['Resilience', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The electrical fuse analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like an electrical fuse — if there's a fault, it trips and cuts power instead of letting the whole
              house burn down. You only reset it once the fault is actually fixed, not by just flipping it back on
              and hoping.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Without something playing this role, a caller keeps hammering a failing dependency, wasting resources
              and making the failure worse instead of containing it.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How the state machine works',
      blocks: [
        { k: 'diagram', el: <CircuitBreakerDiagram />, caption: 'Closed → Open on repeated failures, Open → Half-Open after a cooldown, Half-Open → Closed once test calls succeed.' },
        {
          k: 'p',
          text: (
            <>
              <b>Closed</b>: calls flow normally to the downstream service, and the breaker counts failures. Once
              failures cross a threshold, it trips to <b>Open</b>: calls fail fast immediately, without even hitting
              the downstream service — protecting both sides from wasted, doomed requests.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              After a cooldown timeout, the breaker moves to <b>Half-Open</b> and lets through a small number of test
              calls. If they succeed, it closes fully again; if they still fail, it snaps back to Open and waits
              another cooldown before trying again.
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
              If the recommendation service is down, the product page circuit-breaks it and just omits
              recommendations instead of hanging the whole page load waiting for retries.
            </>,
            <>
              Netflix's <b>Hystrix</b> popularised this pattern for exactly this reason — isolate failures so one
              slow dependency can't cascade.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Without a circuit breaker, one slow dependency can exhaust thread pools upstream (every caller thread
              stuck waiting on a timeout) and take down services that don't even directly depend on it — this is
              exactly how a single failure cascades into a full outage.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What problem does a circuit breaker solve?',
      a: (
        <>
          It stops a caller from repeatedly calling a failing downstream service, failing fast instead — protecting
          both the caller's own resources (threads, connections) and giving the downstream service room to recover.
        </>
      ),
    },
    {
      q: 'What are the three states of a circuit breaker?',
      a: (
        <>
          Closed (calls flow normally), Open (calls fail fast without hitting the dependency), and Half-Open (a few
          test calls are let through to check if the dependency has recovered).
        </>
      ),
    },
    {
      q: 'What triggers a transition from Closed to Open?',
      a: <>The failure rate (or count) crossing a configured threshold within a time window.</>,
    },
    {
      q: 'What happens in the Half-Open state?',
      a: (
        <>
          A limited number of test requests are allowed through. If they succeed, the breaker closes again; if they
          fail, it reopens and waits another cooldown period.
        </>
      ),
    },
    {
      q: 'How does a circuit breaker prevent cascading failures?',
      a: (
        <>
          By failing fast instead of letting requests pile up waiting on a slow/dead dependency — this frees up
          threads and connections upstream that would otherwise be exhausted and take down unrelated services too.
        </>
      ),
    },
    {
      q: 'What should a caller do when the circuit is open?',
      a: (
        <>
          Return a fallback or degraded response immediately (e.g. omit a non-critical feature) rather than error
          out entirely, if the call isn't essential to the request.
        </>
      ),
    },
  ],
};

export default topic;
