import { Arrow, Box, ClassBox, Dg, Extends, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** How a virtual call finds the right function at runtime. */
function VtableLookup() {
  return (
    <Dg w={620} h={272} cap="Object → vptr → vtable → function: the indirection that makes overriding work">
      <ClassBox
        x={16}
        y={56}
        w={162}
        name="Dog object"
        members={['vptr  ●───┐', 'int age', 'string name']}
        c="b"
      />
      <Txt x={97} y={168} fs={10} soft>
        every object of a class with
      </Txt>
      <Txt x={97} y={184} fs={10} soft>
        virtual functions carries a vptr
      </Txt>

      <Arrow x1={182} y1={98} x2={252} y2={98} c="c" label="1. follow" dy={-9} />

      <ClassBox
        x={256}
        y={56}
        w={190}
        name="Dog's vtable"
        members={['sound() → Dog::sound', 'eat()   → Animal::eat']}
        c="a"
      />
      <Txt x={351} y={150} fs={10} soft>
        one table per CLASS,
      </Txt>
      <Txt x={351} y={166} fs={10} soft>
        built by the compiler
      </Txt>

      <Arrow x1={450} y1={98} x2={514} y2={98} c="c" label="2. jump" dy={-9} />
      <Box x={518} y={76} w={90} h={44} label="Dog::sound" sub="the real code" c="b" fs={11} />

      <Txt x={310} y={224} fs={11} bold c="c">
        a-&gt;sound() where Animal* a = new Dog();
      </Txt>
      <Txt x={310} y={248} fs={10.5} soft>
        the pointer's type is Animal, but the object's vptr leads to Dog's table — so Dog::sound runs
      </Txt>
      <Txt x={310} y={266} fs={10} soft>
        cost: one extra pointer hop, and each object is 8 bytes larger
      </Txt>
    </Dg>
  );
}

/** Abstract class sits between a concrete base and a pure interface. */
function AbstractSpectrum() {
  return (
    <Dg w={608} h={244} cap="How much implementation each kind of base type provides">
      <ClassBox
        x={16}
        y={48}
        w={168}
        name="Concrete class"
        members={['int x;', 'void a() { … }', 'void b() { … }']}
        c="b"
      />
      <Txt x={100} y={172} fs={10.5} bold c="b">
        all code
      </Txt>
      <Txt x={100} y={192} fs={10.5} soft>
        objects can be created
      </Txt>

      <ClassBox
        x={220}
        y={48}
        w={168}
        name="Abstract class"
        members={['int x;', 'void a() { … }', 'virtual b() = 0;']}
        c="a"
        abstract
      />
      <Txt x={304} y={172} fs={10.5} bold c="a">
        some code + some promises
      </Txt>
      <Txt x={304} y={192} fs={10.5} soft>
        cannot be instantiated
      </Txt>
      <Txt x={304} y={212} fs={10.5} soft>
        you may extend only one
      </Txt>

      <ClassBox
        x={424}
        y={48}
        w={168}
        name="Interface"
        members={['virtual a() = 0;', 'virtual b() = 0;', 'virtual ~I() {}']}
        c="c"
        abstract
      />
      <Txt x={508} y={172} fs={10.5} bold c="c">
        promises only
      </Txt>
      <Txt x={508} y={192} fs={10.5} soft>
        no data, no code
      </Txt>
      <Txt x={508} y={212} fs={10.5} soft>
        a class may sign many
      </Txt>
    </Dg>
  );
}

/** A concrete child fulfilling an abstract parent's promise. */
function ShapeHierarchy() {
  return (
    <Dg w={560} h={210} cap="Shape cannot exist on its own; each real shape supplies its own area()">
      <ClassBox x={196} y={20} w={170} name="Shape" members={['virtual area() = 0;', 'void describe() {…}']} c="a" abstract />
      <Extends x1={130} y1={130} x2={250} y2={94} />
      <Extends x1={286} y1={130} x2={286} y2={94} />
      <Extends x1={442} y1={130} x2={320} y2={94} />
      <ClassBox x={54} y={130} w={150} name="Circle" members={['area() override']} c="b" headH={26} />
      <ClassBox x={214} y={130} w={150} name="Square" members={['area() override']} c="b" headH={26} />
      <ClassBox x={374} y={130} w={150} name="Triangle" members={['area() override']} c="b" headH={26} />
      <Txt x={286} y={202} fs={10.5} soft>
        Shape s;  ✗ error · Shape* p = new Circle();  ✓ fine
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-virtual',
  num: 3,
  unit: 'Polymorphism & Internals',
  title: 'Virtual Functions, vtable, Abstract Classes & Interfaces',
  blurb:
    'What virtual actually does, the vtable and vptr mechanism behind it, pure virtual functions, and abstract class versus interface.',
  minutes: 13,
  tags: ['Very common', 'Mechanism question'],

  sections: [
    {
      id: 'virtual',
      heading: 'Virtual function',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A function marked <code>virtual</code> in the base class tells C++: "when called through a base
              pointer or reference, run the version belonging to the <b>actual object</b>, not the pointer's type."
            </>
          ),
        },
        {
          k: 'code',
          title: 'That is the whole syntax',
          code: `virtual void display();          // in the base class - that's all it takes`,
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'What breaks without it',
          text: (
            <>
              Without <code>virtual</code>, C++ uses <b>early binding</b>: <code>Animal* a = new Dog();
              a-&gt;sound();</code> calls <b>Animal's</b> sound, because the compiler only looks at the pointer
              type. With <code>virtual</code>, binding is delayed to runtime and Dog's version runs. Virtual
              functions <i>are</i> the mechanism behind runtime polymorphism.
            </>
          ),
        },
      ],
    },

    {
      id: 'vtable',
      heading: 'The vtable and the vptr',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              This is the "how does it actually work" question, and being able to answer it separates a memorised
              definition from real understanding.
            </>
          ),
        },
        { k: 'diagram', el: <VtableLookup />, caption: 'Two pointer hops turn a base-typed call into the derived implementation.' },
        {
          k: 'ul',
          items: [
            <>
              <b>vtable (virtual table)</b> — for every class with virtual functions the compiler builds one hidden
              array holding the addresses of that class's virtual function versions. Dog's vtable points at Dog's{' '}
              <code>sound</code>; Animal's points at Animal's. <b>One table per class.</b>
            </>,
            <>
              <b>vptr (virtual pointer)</b> — every <i>object</i> of such a class secretly carries one hidden
              pointer to its class's vtable, set by the constructor. <b>One pointer per object.</b>
            </>,
            <>
              A virtual call therefore does: follow the object's vptr → find the function's slot in the vtable →
              jump there. That indirection is how the right version is found at runtime.
            </>,
            <>
              The cost is small but real: one extra pointer hop per call, each object is 8 bytes larger, and virtual
              calls cannot usually be inlined.
            </>,
          ],
        },
      ],
    },

    {
      id: 'pure-virtual',
      heading: 'Pure virtual function and abstract class',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>pure virtual function</b> is a virtual function with <code>= 0</code> instead of a body — a
              promise with no implementation. It says: "I do not know how; every child <b>must</b> provide this."
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `virtual void display() = 0;      // "= 0" makes it PURE virtual`,
        },
        {
          k: 'p',
          text: (
            <>
              The moment a class contains even one pure virtual function it becomes <b>abstract</b>: objects of it
              can no longer be created. A child that implements every pure virtual function becomes concrete and
              creatable; a child that does not stays abstract too.
            </>
          ),
        },
        { k: 'diagram', el: <ShapeHierarchy />, caption: '"Shape" alone is too vague to have an area — but every real shape must have one.' },
        {
          k: 'code',
          title: 'C++',
          code: `class Shape {                        // abstract: has a pure virtual function
public:
    virtual void area() = 0;         // every shape must define its own area
    void describe() { cout << "I am a shape\\n"; }   // normal methods still allowed
};

class Circle : public Shape {
public:
    void area() override { cout << "pi r squared\\n"; }   // promise fulfilled
};

// Shape s;                 error - cannot instantiate an abstract class
Shape* p = new Circle();    // fine - abstract POINTER to a concrete child
p->area();`,
        },
      ],
    },

    {
      id: 'interface',
      heading: 'Interface',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A pure contract: <b>only method promises</b>, no code, no data. "Whoever signs this must be able to do
              these things."
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Java has a dedicated <code>interface</code> keyword. C++ does not — an interface in C++ is simply an
              abstract class where <b>everything</b> is pure virtual.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Java vs C++',
          code: `// Java                                  // C++ equivalent
interface Payable {                      class Payable {
    void pay(double amount);             public:
}                                            virtual void pay(double amt) = 0;
                                             virtual ~Payable() {}      // good habit
class Upi implements Payable { ... }     };
                                         class Upi : public Payable { ... };`,
        },
        { k: 'diagram', el: <AbstractSpectrum />, caption: 'Concrete → abstract → interface: progressively less implementation, progressively more freedom.' },
        {
          k: 'table',
          head: ['', 'Abstract class', 'Interface'],
          rows: [
            ['Can contain code', 'Yes — some methods implemented', 'No — only signatures'],
            ['Can contain data members', 'Yes', 'No (constants aside)'],
            ['How many can a class use', 'One', 'Many'],
            ['Use it when', 'Children share real code and state', 'Unrelated classes share only a capability'],
            ['Analogy', 'A half-built house — some rooms finished', 'A checklist you sign'],
          ],
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is a virtual function and why do we need it?',
      a: (
        <>
          A base-class function marked <code>virtual</code>, so that a call through a base pointer or reference runs
          the <b>derived</b> version. Without it C++ uses early binding and calls the base version based on the
          pointer's type — so virtual functions are the mechanism that makes runtime polymorphism possible.
        </>
      ),
    },
    {
      q: 'Explain the vtable and the vptr.',
      a: (
        <>
          The compiler builds one <b>vtable</b> per class with virtual functions — an array of pointers to that
          class's virtual function implementations. Every <b>object</b> of such a class carries a hidden{' '}
          <b>vptr</b> to its class's vtable, set by the constructor. A virtual call follows the vptr, indexes the
          vtable and jumps — which is why the actual object's version runs.
        </>
      ),
    },
    {
      q: 'What does a virtual function cost?',
      a: (
        <>
          One extra pointer dereference per call, 8 bytes per object for the vptr, and the loss of inlining, since
          the target is not known at compile time. Negligible in most code, but it is why not everything is virtual
          by default in C++.
        </>
      ),
    },
    {
      q: 'Virtual vs pure virtual function?',
      a: (
        <>
          A <b>virtual</b> function has a body and overriding is optional. A <b>pure virtual</b> function is
          declared <code>= 0</code>, has no body, overriding is compulsory, and its presence makes the class{' '}
          <b>abstract</b>.
        </>
      ),
    },
    {
      q: 'What is an abstract class?',
      a: (
        <>
          A class you cannot instantiate, existing only to be inherited from. In C++ any class with at least one
          pure virtual function is abstract. It may still contain data and fully implemented methods, which children
          inherit.
        </>
      ),
    },
    {
      q: 'Can an abstract class have a constructor?',
      a: (
        <>
          Yes. You cannot create an object of it directly, but its constructor runs as part of constructing a
          derived object — that is exactly how the base part gets initialised.
        </>
      ),
    },
    {
      q: 'Abstract class vs interface — when do you use each?',
      a: (
        <>
          Use an <b>abstract class</b> when children genuinely share code and state — it is a half-built base you
          extend, and you can extend only one. Use an <b>interface</b> when unrelated classes share only a
          capability — it is a pure contract with no code, and a class can implement many.
        </>
      ),
    },
    {
      q: 'Can a constructor be virtual?',
      a: (
        <>
          No. Virtual dispatch needs the vptr, and the vptr is set up <i>by</i> the constructor — so at the moment
          the constructor runs there is nothing to dispatch through. The object's dynamic type does not exist yet.
          Destructors, by contrast, should often be virtual.
        </>
      ),
    },
    {
      q: 'What happens if a derived class does not override a pure virtual function?',
      a: (
        <>
          The derived class inherits the unfulfilled promise and is therefore <b>also abstract</b> — you cannot
          create objects of it either. Only once every pure virtual function has an implementation does a class
          become concrete.
        </>
      ),
    },
  ],
};

export default topic;
