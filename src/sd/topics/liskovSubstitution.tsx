import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

function LspDiagram() {
  return (
    <Dg w={560} h={220} cap="Code expecting a Rectangle breaks when handed a Square subclass">
      <Box x={30} y={30} w={180} h={60} label="Rectangle" sub="setWidth, setHeight independent" c="a" fs={12} />
      <Arrow x1={120} y1={90} x2={120} y2={130} c="b" label="extends" />
      <Box x={30} y={132} w={180} h={60} label="Square" sub="setWidth also changes height" c="c" fs={12} />
      <Box x={330} y={70} w={200} h={70} label="Client code" sub={'assumes w, h independent'} c="n" fs={12} />
      <Arrow x1={330} y1={100} x2={210} y2={160} c="c" dashed label="breaks" />
      <Txt x={430} y={165} fs={11} soft>
        expects a Rectangle, gets a Square
      </Txt>
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'liskov-substitution',
  num: 37,
  unit: 'SOLID Principles',
  title: 'Liskov Substitution',
  blurb: 'A subclass must be usable anywhere its parent is expected, without breaking correctness for the caller.',
  minutes: 9,
  tags: ['SOLID', 'Classic pitfall'],
  sections: [
    {
      id: 'analogy',
      heading: 'The toy duck analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              If a toy claims to be a "duck" in a box of ducks but doesn't actually quack or float like the rest,
              kids playing with it get confused — a substitute must behave like what it's replacing, not just share
              its label.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              LSP is about <b>behavioural</b> compatibility, not just matching method signatures — a subtype must
              honour the same promises the base type made to its callers.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <LspDiagram />, caption: 'Client code that trusts width/height are independent breaks when a Square is substituted in.' },
        {
          k: 'p',
          text: (
            <>
              A subclass shouldn't <b>strengthen preconditions</b> or <b>weaken postconditions</b> the caller relies
              on. If calling code has to check "is this actually a Square?" before using a <b>Rectangle</b>, LSP is
              already broken — the whole point of polymorphism was to avoid that check.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The classic broken Square/Rectangle example',
          code: `class Rectangle {
  protected int width, height;
  void setWidth(int w)  { width = w; }
  void setHeight(int h) { height = h; }
  int area() { return width * height; }
}

class Square extends Rectangle {
  // breaks LSP: callers assume width/height vary independently
  @Override void setWidth(int w)  { width = w; height = w; }
  @Override void setHeight(int h) { width = h; height = h; }
}

// client code, written only against Rectangle:
Rectangle r = getRectangle(); // could be a Square at runtime
r.setWidth(5);
r.setHeight(10);
assert r.area() == 50; // FAILS if r is actually a Square (area == 100)`,
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
              The classic case: <b>Square extends Rectangle</b>, but overriding <code>setWidth()</code> to also
              change height breaks any code that assumed width and height could be set independently — a
              mathematically "correct" inheritance relationship (a square is-a rectangle) still violates LSP.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'Asked in interviews',
          text: (
            <>
              This is the SOLID principle freshers most often skip explaining correctly — be ready with the
              Square/Rectangle example specifically, including exactly why the <code>area()</code> assertion fails.
            </>
          ),
        },
      ],
    },
  ],
  interview: [
    {
      q: 'What does the Liskov Substitution Principle state?',
      a: <>Objects of a subclass must be substitutable for objects of the base class without altering the correctness of the program — callers shouldn't need to know or check which subtype they actually have.</>,
    },
    {
      q: 'Walk through the Square/Rectangle LSP violation.',
      a: <>Square extends Rectangle and overrides setWidth/setHeight to keep both sides equal. Client code that calls setWidth(5) then setHeight(10) and expects area() == 50 gets 100 instead when handed a Square, breaking an assumption the base class's contract implied.</>,
    },
    {
      q: 'What does "strengthening preconditions" mean in LSP terms?',
      a: <>A subclass requiring stricter input than its parent did (e.g. throwing on inputs the parent accepted) — callers written against the parent's contract can now fail unexpectedly.</>,
    },
    {
      q: 'What does "weakening postconditions" mean in LSP terms?',
      a: <>A subclass returning or guaranteeing less than its parent promised — e.g. returning null where the parent guaranteed a non-null result — breaking code that relied on the stronger guarantee.</>,
    },
    {
      q: 'How would you fix the Square/Rectangle problem?',
      a: <>Don't model Square as a subclass of a mutable Rectangle. Either make both immutable, or have both implement a common Shape interface without an inheritance relationship between them.</>,
    },
    {
      q: 'How is LSP different from just "does the code compile"?',
      a: <>Compiling only checks the type signature matches; LSP is about behavioural compatibility — the subtype must honour the same runtime guarantees, not just the same method names.</>,
    },
  ],
};

export default topic;
