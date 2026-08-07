import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function IspDiagram() {
  return (
    <Dg w={560} h={240} cap="One fat Worker interface split into Codeable and Eatable">
      <Box x={20} y={30} w={200} h={60} label="Worker (fat)" sub="code() + eat()" c="c" fs={12} />
      <Box x={330} y={10} w={190} h={50} label="Codeable" sub="code()" c="a" fs={12} />
      <Box x={330} y={90} w={190} h={50} label="Eatable" sub="eat()" c="b" fs={12} />
      <Arrow x1={220} y1={55} x2={330} y2={35} c="n" plain />
      <Arrow x1={220} y1={55} x2={330} y2={115} c="n" plain />
      <Box x={330} y={170} w={190} h={50} label="RobotWorker" sub="implements Codeable only" c="a" dashed fs={12} />
      <Arrow x1={425} y1={140} x2={425} y2={170} c="a" plain />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'interface-segregation',
  num: 38,
  unit: 'SOLID Principles',
  title: 'Interface Segregation',
  blurb: 'Prefer several small, specific interfaces over one large one — no class should be forced to implement methods it has no use for.',
  minutes: 7,
  tags: ['SOLID'],
  sections: [
    {
      id: 'analogy',
      heading: 'The restaurant menu analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a restaurant menu — a purely vegetarian customer shouldn't be handed the full combined veg +
              non-veg menu just to order one vegetable dish. A smaller, relevant menu serves them better than one
              giant menu everyone has to wade through.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              ISP is really SRP applied to interfaces: a "fat" interface bundling unrelated capabilities forces
              every implementer to take on all of them, whether it needs them or not.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <IspDiagram />, caption: 'Splitting Worker into Codeable and Eatable so RobotWorker only implements what applies to it.' },
        {
          k: 'p',
          text: (
            <>
              A fat interface forces implementing classes to define methods that make no sense for them — often as
              empty stubs, or by throwing an exception. Splitting it lets each class implement only the piece of
              the contract that actually applies to it.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This also decouples clients: a caller that only needs <code>code()</code> can depend on the narrow{' '}
              <b>Codeable</b> interface, and never has to know that <b>Eatable</b> even exists.
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
              Instead of one <b>Worker</b> interface with <code>code()</code> and <code>eat()</code>, split into{' '}
              <b>Codeable</b> and <b>Eatable</b> so a <b>RobotWorker</b> isn't forced to implement <code>eat()</code>
              .
            </>,
            <>
              A printer SDK splitting <b>Printable</b>, <b>Scannable</b>, and <b>Faxable</b> instead of one giant{' '}
              <b>MultiFunctionDevice</b> interface, so a simple printer-only driver doesn't stub out scan/fax
              methods.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              A telltale sign you're violating this: a method that throws <code>UnsupportedOperationException</code>{' '}
              (or returns a dummy value) because the interface it implements doesn't actually fit the class.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What does the Interface Segregation Principle say?',
      a: <>Clients shouldn't be forced to depend on methods they don't use — prefer several small, specific interfaces over one large general-purpose one.</>,
    },
    {
      q: 'How is ISP different from Single Responsibility?',
      a: <>SRP is about a class having one reason to change; ISP is the same idea applied to interfaces — no interface should bundle unrelated capabilities that force implementers to take on all of them.</>,
    },
    {
      q: 'What is a telltale sign of an ISP violation?',
      a: <>A class implementing an interface but leaving a method as an empty stub or throwing UnsupportedOperationException because that part of the interface doesn't apply to it.</>,
    },
    {
      q: 'Give an example of fixing an ISP violation.',
      a: <>Splitting a fat Worker interface (code() + eat()) into separate Codeable and Eatable interfaces, so a RobotWorker only implements Codeable.</>,
    },
    {
      q: 'Why does ISP help with testing and mocking?',
      a: <>A narrow interface has fewer methods to mock or stub out in a test double, and changes to unrelated methods on a fat interface can't force irrelevant test updates.</>,
    },
    {
      q: 'Does ISP mean every interface should have only one method?',
      a: <>No — it means grouping only cohesive, related methods together, not necessarily one method per interface; the goal is that no implementer is forced to support unrelated behaviour.</>,
    },
  ],
};

export default topic;
