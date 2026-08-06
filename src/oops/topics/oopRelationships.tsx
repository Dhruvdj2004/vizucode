import { Arrow, Box, ClassBox, Dg, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** The ownership spectrum: association → aggregation → composition. */
function OwnershipSpectrum() {
  return (
    <Dg w={620} h={264} cap="How tightly the parts are bound to the whole">
      <Txt x={104} y={26} fs={11} bold c="n">
        ASSOCIATION
      </Txt>
      <ClassBox x={26} y={40} w={154} name="Teacher" c="n" headH={28} />
      <Arrow x1={103} y1={68} x2={103} y2={110} c="n" plain />
      <ClassBox x={26} y={110} w={154} name="Student" c="n" headH={28} />
      <Txt x={103} y={172} fs={10.5} soft>
        merely uses / knows
      </Txt>
      <Txt x={103} y={190} fs={10.5} soft>
        no ownership at all
      </Txt>
      <Txt x={103} y={216} fs={10} bold c="n">
        both live independently
      </Txt>

      <Txt x={310} y={26} fs={11} bold c="b">
        AGGREGATION
      </Txt>
      {/* Plain angle brackets: this is a JS string, so React escapes it for us. */}
      <ClassBox x={232} y={40} w={154} name="Department" members={['vector<Employee*>']} c="b" headH={28} />
      <Arrow x1={309} y1={90} x2={309} y2={110} c="b" plain dashed />
      <ClassBox x={232} y={110} w={154} name="Employee" c="b" headH={28} />
      <Txt x={309} y={172} fs={10.5} soft>
        has, but does not own
      </Txt>
      <Txt x={309} y={190} fs={10.5} soft>
        holds a POINTER
      </Txt>
      <Txt x={309} y={216} fs={10} bold c="b">
        close the department →
      </Txt>
      <Txt x={309} y={234} fs={10} bold c="b">
        employees still exist
      </Txt>

      <Txt x={516} y={26} fs={11} bold c="a">
        COMPOSITION
      </Txt>
      <ClassBox x={438} y={40} w={154} name="Car" members={['Engine e;']} c="a" headH={28} />
      <Arrow x1={515} y1={90} x2={515} y2={110} c="a" plain />
      <ClassBox x={438} y={110} w={154} name="Engine" c="a" headH={28} />
      <Txt x={515} y={172} fs={10.5} soft>
        has AND owns
      </Txt>
      <Txt x={515} y={190} fs={10.5} soft>
        holds the OBJECT directly
      </Txt>
      <Txt x={515} y={216} fs={10} bold c="a">
        destroy the car →
      </Txt>
      <Txt x={515} y={234} fs={10} bold c="a">
        the engine dies with it
      </Txt>
    </Dg>
  );
}

/** Where an object lives decides when it dies. */
function Lifetimes() {
  const row = (y: number, kind: string, born: string, dies: string, c: 'a' | 'b' | 'c' | 'n') => (
    <g key={kind}>
      <Box x={20} y={y} w={130} h={34} label={kind} c={c} fs={11.5} />
      <Box x={158} y={y} w={190} h={34} label={born} c="n" fs={10.5} r={4} />
      <Arrow x1={352} y1={y + 17} x2={372} y2={y + 17} c="n" />
      <Box x={376} y={y} w={214} h={34} label={dies} c="n" fs={10.5} r={4} />
    </g>
  );
  return (
    <Dg w={608} h={216} cap="Four homes, four lifespans">
      {row(20, 'Stack', 'when its line runs', 'automatically at the closing }', 'b')}
      {row(64, 'Heap', 'when you call new', 'only when YOU call delete', 'a')}
      {row(108, 'Static', 'first time its line runs', 'at program exit', 'c')}
      {row(152, 'Global', 'before main() starts', 'after main() ends', 'n')}
      <Txt x={304} y={204} fs={10.5} soft>
        only the heap row puts the responsibility on you — the rest are automatic
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-relationships',
  num: 6,
  unit: 'Advanced C++',
  title: 'Composition, Aggregation, Association & Object Lifetime',
  blurb:
    'The three HAS-A relationships and how to tell them apart in code, why composition usually beats inheritance, and the four places an object can live.',
  minutes: 10,
  tags: ['Very common', 'Design question'],

  sections: [
    {
      id: 'spectrum',
      heading: 'The three relationships',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Inheritance expresses <b>IS-A</b>. Everything else between classes is one of three <b>HAS-A</b> or
              uses-a relationships, differing only in how strongly the part is bound to the whole.
            </>
          ),
        },
        { k: 'diagram', el: <OwnershipSpectrum />, caption: 'Weakest to strongest: association → aggregation → composition.' },
        { k: 'h', text: 'Composition — strong HAS-A' },
        {
          k: 'p',
          text: (
            <>
              The part lives <b>inside</b> the whole and dies with it. A car has an engine; destroy the car and the
              engine is gone too.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Engine {
public:
    void start() { cout << "vroom\\n"; }
};

class Car {
    Engine e;                    // the Engine object lives INSIDE Car - created with
public:                          // it, destroyed with it. Their lifetimes are tied.
    void drive() { e.start(); }
};`,
        },
        { k: 'h', text: 'Aggregation — weak HAS-A' },
        {
          k: 'p',
          text: (
            <>
              The whole <b>uses</b> the part, but the part can exist independently. A department has employees;
              close the department and the employees still exist.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Employee { public: string name; };

class Department {
    vector<Employee*> staff;     // POINTERS - Department does not own the employees
public:
    void add(Employee* e) { staff.push_back(e); }
};   // Department destroyed -> Employee objects live on`,
        },
        { k: 'h', text: 'Association — no ownership' },
        {
          k: 'p',
          text: (
            <>
              The loosest link: two independent objects merely <b>know or use</b> each other. A teacher teaches
              students; neither owns the other.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Student;                       // forward declaration

class Teacher {
public:
    void teach(Student& s) { /* uses a Student for a moment */ }
};`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'How to tell them apart in code',
          text: (
            <>
              <b>Composition holds the object directly</b> as a member — it owns it. <b>Aggregation holds a pointer
              or reference</b> to something created elsewhere. <b>Association</b> does not store it at all; it just
              receives it as a parameter. That single distinction answers the whole question.
            </>
          ),
        },
      ],
    },

    {
      id: 'composition-over-inheritance',
      heading: 'Prefer composition over inheritance',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A design principle you should be ready to justify: <b>inherit only for a genuine IS-A relationship;
              for everything else, hold the other object as a member.</b>
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Inheritance', 'Composition'],
          rows: [
            ['Relationship', 'IS-A', 'HAS-A'],
            ['Coupling', 'Tight — the child depends on the parent\'s internals', 'Loose — only the public interface is used'],
            ['Changed at runtime?', 'No, fixed at compile time', 'Yes — swap the held object'],
            ['Breaks when', "The parent changes, or the IS-A isn't really true", 'Rarely'],
            ['Test', '"A Dog IS AN Animal" sounds right', '"A Car HAS AN Engine" sounds right'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              The classic misuse: making <code>Stack</code> inherit from <code>Vector</code> so it gets the storage
              for free. A stack is not a vector — inheriting exposes <code>insertAt()</code> and breaks the stack's
              own guarantees. It should <b>hold</b> a vector, not <b>be</b> one.
            </>
          ),
        },
      ],
    },

    {
      id: 'lifetime',
      heading: 'Object lifetime',
      blocks: [
        {
          k: 'p',
          text: <>Where you create an object decides when it dies. There are four homes.</>,
        },
        { k: 'diagram', el: <Lifetimes />, caption: 'Only heap objects need you to remember anything.' },
        {
          k: 'code',
          title: 'C++',
          code: `void demo() {
    Student a;                       // stack: dies at the } below
    static Student b;                // static: created once, remembers state across calls
    Student* c = new Student();      // heap: immortal until...
    delete c;                        // ...this line
}`,
        },
        {
          k: 'table',
          head: ['Kind', 'Created', 'Destroyed', 'Example'],
          rows: [
            ['Stack', 'When its line runs', 'Automatically at the closing brace of its scope', 'Student s;'],
            ['Heap', 'On new', 'Only when you call delete — forget it and it leaks', 'Student* s = new Student();'],
            ['Static', 'First time its line runs', 'At program exit; survives between calls', 'static Student s; inside a function'],
            ['Global', 'Before main() starts', 'After main() ends', 'Student s; at file scope'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between composition and aggregation?',
      a: (
        <>
          Both are HAS-A, but composition is <b>strong ownership</b> — the part is created and destroyed with the
          whole (an engine inside a car). Aggregation is <b>weak</b> — the whole references a part that exists
          independently and outlives it (employees in a department).
        </>
      ),
    },
    {
      q: 'How do you tell composition from aggregation by reading the code?',
      a: (
        <>
          Composition stores the object <b>directly</b> as a member, so its lifetime is tied to the container.
          Aggregation stores a <b>pointer or reference</b> to an object created elsewhere. That is the whole tell.
        </>
      ),
    },
    {
      q: 'Difference between aggregation and association?',
      a: (
        <>
          <b>Aggregation</b> is a has-a where the whole keeps a long-term reference to the part but does not own it.{' '}
          <b>Association</b> is weaker still — the objects merely use or know each other, typically by passing one
          to a method, with nothing stored at all.
        </>
      ),
    },
    {
      q: 'What does "prefer composition over inheritance" mean?',
      a: (
        <>
          Use inheritance only when the child genuinely <b>is a</b> parent; otherwise hold the other object as a
          member. Inheritance couples you to the parent's internals and is fixed at compile time, whereas
          composition depends only on a public interface and the held object can be swapped at runtime.
        </>
      ),
    },
    {
      q: 'Give an example of inheritance being the wrong choice.',
      a: (
        <>
          Making <code>Stack</code> inherit <code>Vector</code> to reuse its storage. A stack is not a vector, and
          inheriting leaks <code>insertAt()</code> and <code>removeAt()</code> into the stack's interface, breaking
          its LIFO guarantee. Composition — a stack that <i>holds</i> a vector — is correct.
        </>
      ),
    },
    {
      q: 'What are the four kinds of object lifetime?',
      a: (
        <>
          <b>Stack</b> (destroyed automatically at end of scope), <b>heap</b> (lives until you delete it),{' '}
          <b>static</b> (created once on first use, destroyed at program exit) and <b>global</b> (created before
          main, destroyed after it).
        </>
      ),
    },
    {
      q: 'Why does a static local variable keep its value between calls?',
      a: (
        <>
          Because it is created <b>once</b>, on the first execution of its line, and lives until the program exits —
          only its <i>visibility</i> is limited to the function. Ordinary locals are re-created on the stack for
          every call.
        </>
      ),
    },
    {
      q: 'Which relationship does inheritance model, and how is it different from these three?',
      a: (
        <>
          Inheritance models <b>IS-A</b>: the child is a kind of the parent and inherits its interface, which is
          what enables polymorphic substitution. Composition, aggregation and association all model{' '}
          <b>HAS-A / uses-a</b> — one object holding or using another with no type substitution involved.
        </>
      ),
    },
  ],
};

export default topic;
