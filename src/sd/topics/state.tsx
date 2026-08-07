import { Arrow, Box, Dg } from '../dgm';
import type { SdTopic } from '../types';

function StateDiagram() {
  return (
    <Dg w={560} h={220} cap="VendingMachine transitioning between IdleState, SelectingState, and DispensingState">
      <Box x={30} y={80} w={150} h={60} label="IdleState" c="a" fs={12} />
      <Box x={210} y={80} w={150} h={60} label="SelectingState" c="b" fs={12} />
      <Box x={390} y={80} w={150} h={60} label="DispensingState" c="c" fs={12} />
      <Arrow x1={180} y1={110} x2={210} y2={110} c="n" label="insertCoin()" />
      <Arrow x1={360} y1={110} x2={390} y2={110} c="n" label="selectItem()" />
      <Arrow x1={465} y1={140} x2={105} y2={140} c="n" dashed label="dispense complete" bend="v" />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'state',
  num: 47,
  unit: 'Design Patterns',
  title: 'State',
  blurb: "Lets an object change its behaviour when its internal state changes, by delegating to state-specific classes.",
  minutes: 9,
  tags: ['Design pattern', 'Very common'],
  sections: [
    {
      id: 'analogy',
      heading: 'The traffic light analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a traffic light — its behaviour (stop, go, slow down) changes completely depending on which state
              (red, green, yellow) it's currently in, and it moves through a fixed sequence of states over time.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              The object using State (the "context") always exposes the same methods to its callers — what changes
              internally is which state object those calls get forwarded to.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <StateDiagram />, caption: 'Each state handles the same method calls differently, and hands off to the next state on transition.' },
        {
          k: 'p',
          text: (
            <>
              Each state is its own class implementing a common interface; the context object holds a reference to
              its <b>current state object</b> and delegates behaviour to it, swapping the reference on transition
              instead of branching on a status enum everywhere in the codebase.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Compare this to a naive approach where every method checks{' '}
              <code>if (status == DISPENSING) ... else if (status == IDLE) ...</code> — State replaces all of that
              scattered branching with one class per state, each owning its own logic.
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
              A <b>VendingMachine</b> in <b>IdleState</b>, <b>SelectingState</b>, and <b>DispensingState</b> — each
              handles <code>insertCoin()</code> and <code>selectItem()</code> differently, with no giant switch
              statement spread across the class.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is the standard answer to "design a vending machine / elevator / traffic light" — recognise it
              as the State pattern immediately whenever the problem is state-machine shaped.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What problem does the State pattern solve?',
      a: <>It lets an object change its behaviour when its internal state changes, by delegating to a state-specific class instead of branching on a status flag throughout the code.</>,
    },
    {
      q: 'How does the context interact with its states?',
      a: <>The context holds a reference to a "current state" object (typed as a shared interface) and forwards calls to it; on a transition, the context swaps that reference to a different state object.</>,
    },
    {
      q: 'Give a concrete example of the State pattern.',
      a: <>A VendingMachine with IdleState, SelectingState, and DispensingState classes, each implementing insertCoin() and selectItem() differently, and transitioning to the next state when its job is done.</>,
    },
    {
      q: 'How is State different from Strategy?',
      a: <>Both delegate to interchangeable classes behind a shared interface, but State represents the object's own internal condition with self-driven transitions, while Strategy is an algorithm choice made explicitly by the client for a given call.</>,
    },
    {
      q: 'Why is State better than a big switch on a status enum?',
      a: <>Each state's logic lives in one class instead of being scattered across every method as a case in a switch statement, so adding a new state means adding a new class, not editing every existing method.</>,
    },
    {
      q: 'When do you recognise a design problem as calling for State?',
      a: <>Whenever a system has a small, fixed set of states with clearly different behaviour per state and well-defined transitions between them, like a vending machine, elevator, or traffic light.</>,
    },
    {
      q: 'Does the context or the state decide when to transition?',
      a: <>Typically the state itself decides, often returning or setting the next state on the context after handling an event — keeping transition logic close to the state that triggers it.</>,
    },
  ],
};

export default topic;
