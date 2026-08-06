import { Arrow, Box, Cell, ClassBox, Dg, Extends, Frame, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** Shallow copy shares the heap block; deep copy duplicates it. */
function ShallowVsDeep() {
  return (
    <Dg w={608} h={250} cap="Two keys to one house, versus two keys to two houses">
      <Frame x={2} y={8} w={292} h={234} label="SHALLOW COPY (the default)" c="c" />
      <Cell x={24} y={48} w={110} h={36} label="a.ptr ●" c="n" />
      <Cell x={24} y={108} w={110} h={36} label="b.ptr ●" c="n" />
      <Cell x={196} y={78} w={76} h={36} label="10" c="c" />
      <Arrow x1={136} y1={66} x2={192} y2={90} c="c" />
      <Arrow x1={136} y1={126} x2={192} y2={104} c="c" />
      <Txt x={148} y={176} fs={10.5} soft>
        *b.ptr = 99 also changes a
      </Txt>
      <Txt x={148} y={198} fs={10.5} bold c="c">
        both destructors delete the SAME memory
      </Txt>
      <Txt x={148} y={220} fs={10.5} bold c="c">
        → double delete → crash
      </Txt>

      <Frame x={314} y={8} w={292} h={234} label="DEEP COPY (write it yourself)" c="b" />
      <Cell x={336} y={48} w={110} h={36} label="a.ptr ●" c="n" />
      <Cell x={336} y={108} w={110} h={36} label="b.ptr ●" c="n" />
      <Cell x={508} y={48} w={76} h={36} label="10" c="b" />
      <Cell x={508} y={108} w={76} h={36} label="10" c="b" />
      <Arrow x1={448} y1={66} x2={504} y2={66} c="b" />
      <Arrow x1={448} y1={126} x2={504} y2={126} c="b" />
      <Txt x={460} y={176} fs={10.5} soft>
        each object owns its own memory
      </Txt>
      <Txt x={460} y={198} fs={10.5} bold c="b">
        independent, and both destructors are safe
      </Txt>
    </Dg>
  );
}

/** Copying a Derived into a Base by value loses the derived part. */
function ObjectSlicing() {
  return (
    <Dg w={600} h={222} cap="Assigning by value into a base type discards everything the derived class added">
      <ClassBox x={30} y={40} w={150} name="Derived d" members={['int x = 1;', 'int y = 2;', 'who() → Derived']} c="b" />
      <Arrow x1={186} y1={80} x2={266} y2={80} c="c" label="Base b = d;" dy={-9} />
      <ClassBox x={272} y={40} w={150} name="Base b" members={['int x = 1;', '(y — gone)', 'who() → Base']} c="c" />

      <Txt x={226} y={158} fs={11} bold c="c">
        the extra data AND the polymorphism are sliced off
      </Txt>

      <Box x={446} y={40} w={140} h={38} label="Base& r = d;" c="b" fs={11.5} />
      <Box x={446} y={86} w={140} h={38} label="Base* p = &d;" c="b" fs={11.5} />
      <Txt x={516} y={148} fs={10.5} bold c="b">
        no copy → no slicing
      </Txt>
      <Txt x={516} y={168} fs={10.5} soft>
        p-&gt;who() prints "Derived"
      </Txt>
      <Txt x={300} y={210} fs={10.5} soft>
        polymorphism only works through pointers and references — never through a by-value copy
      </Txt>
    </Dg>
  );
}

/** The diamond, with and without virtual inheritance. */
function Diamond() {
  return (
    <Dg w={608} h={278} cap="Without virtual inheritance D physically contains two copies of A">
      <Frame x={2} y={8} w={292} h={262} label="PLAIN — ambiguous" c="c" />
      <ClassBox x={92} y={38} w={110} name="A" members={['int value']} c="n" headH={26} />
      <Extends x1={92} y1={132} x2={126} y2={86} />
      <Extends x1={202} y1={132} x2={168} y2={86} />
      <ClassBox x={30} y={132} w={100} name="B" members={["A's copy #1"]} c="c" headH={26} />
      <ClassBox x={164} y={132} w={100} name="C" members={["A's copy #2"]} c="c" headH={26} />
      <Extends x1={124} y1={214} x2={80} y2={180} />
      <Extends x1={170} y1={214} x2={214} y2={180} />
      <ClassBox x={92} y={214} w={110} name="D" c="c" headH={26} />
      <Txt x={148} y={262} fs={10.5} bold c="c">
        d.value → error: which A?
      </Txt>

      <Frame x={314} y={8} w={292} h={262} label="VIRTUAL — one shared A" c="b" />
      <ClassBox x={404} y={38} w={110} name="A" members={['int value']} c="b" headH={26} />
      <Extends x1={404} y1={132} x2={438} y2={86} />
      <Extends x1={514} y1={132} x2={480} y2={86} />
      <ClassBox x={342} y={132} w={100} name="B" members={['virtual A']} c="n" headH={26} />
      <ClassBox x={476} y={132} w={100} name="C" members={['virtual A']} c="n" headH={26} />
      <Extends x1={436} y1={214} x2={392} y2={180} />
      <Extends x1={482} y1={214} x2={526} y2={180} />
      <ClassBox x={404} y={214} w={110} name="D" c="b" headH={26} />
      <Txt x={460} y={262} fs={10.5} bold c="b">
        d.value → fine, exactly one A
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-copying-casting',
  num: 5,
  unit: 'Advanced C++',
  title: 'Shallow vs Deep Copy, Slicing, Casting & the Diamond',
  blurb:
    'The copy problems that cause real crashes — shared pointers, missing virtual destructors, sliced objects — plus upcasting, downcasting and the diamond fix.',
  minutes: 16,
  tags: ['Very common', 'Crash-causing'],

  sections: [
    {
      id: 'shallow-deep',
      heading: 'Shallow copy vs deep copy',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>shallow copy</b> copies an object's fields bit for bit — <i>including pointers</i>. Both objects
              then point at the same underlying memory. Like photocopying a house key: two keys, one house.
            </>
          ),
        },
        { k: 'diagram', el: <ShallowVsDeep />, caption: 'One piece of heap memory with two owners is the whole problem.' },
        {
          k: 'code',
          title: 'The bug',
          code: `class Data {
public:
    int* ptr;
    Data(int v) { ptr = new int(v); }
    ~Data()     { delete ptr; }
    // no copy constructor written -> the compiler's DEFAULT one does a SHALLOW copy
};

Data a(10);
Data b = a;          // b.ptr = a.ptr  <- both point to the SAME int

*b.ptr = 99;         // changes a's data too
// worse: when a and b are destroyed, BOTH destructors delete the SAME memory
// -> double delete -> crash`,
        },
        {
          k: 'code',
          title: 'The fix — a deep copy',
          code: `class Data {
public:
    int* ptr;
    Data(int v) { ptr = new int(v); }

    Data(Data &obj) {                // custom copy constructor = deep copy
        ptr = new int(*obj.ptr);     // NEW memory, copy the VALUE into it
    }

    ~Data() { delete ptr; }
};

Data a(10);
Data b = a;          // b gets its OWN int holding 10
*b.ptr = 99;         // a is untouched, and both destructors are safe`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The Rule of Three',
          text: (
            <>
              If a class needs a custom <b>destructor</b> — because it owns raw memory — it almost certainly also
              needs a custom <b>copy constructor</b> and a custom <b>assignment operator</b>. All three deal with
              the same ownership problem, so needing one is a strong sign you need all three. (Modern C++ extends
              this to the Rule of Five with move operations.)
            </>
          ),
        },
      ],
    },

    {
      id: 'virtual-destructor',
      heading: 'Virtual destructor',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              If a class will be inherited from and deleted through a <b>base pointer</b>, its destructor must be{' '}
              <code>virtual</code> — otherwise the derived part of the object is never cleaned up.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The leak, and the one-word fix',
          code: `class Base {
public:
    ~Base() { cout << "Base destroyed\\n"; }          // NOT virtual (bug!)
};
class Derived : public Base {
    int* big = new int[1000];
public:
    ~Derived() { delete[] big; cout << "Derived destroyed\\n"; }
};

Base* p = new Derived();
delete p;            // prints ONLY "Base destroyed" -
                     // ~Derived() never runs -> big[] LEAKS

// The fix, in Base:
virtual ~Base() { cout << "Base destroyed\\n"; }
// now delete p prints "Derived destroyed" then "Base destroyed" - correct order`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The rule to state: <b>any class with virtual functions should have a virtual destructor.</b>{' '}
              Destruction runs child-first then parent — the exact reverse of construction.
            </>
          ),
        },
      ],
    },

    {
      id: 'slicing',
      heading: 'Object slicing',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Assigning a derived <b>object</b> — not a pointer — to a base object copies only the base part. The
              derived extras are "sliced off". Like pouring a large bottle into a small glass: the extra spills.
            </>
          ),
        },
        { k: 'diagram', el: <ObjectSlicing />, caption: 'Slicing loses data and polymorphism at the same time.' },
        {
          k: 'code',
          title: 'C++',
          code: `class Base    { public: int x = 1; virtual void who() { cout << "Base"; } };
class Derived : public Base { public: int y = 2; void who() override { cout << "Derived"; } };

Derived d;
Base b = d;          // SLICED: b has only x. y and the Derived-ness are gone.
b.who();             // prints "Base" - polymorphism is lost too

Base& r = d;         // reference: no copy, no slicing
Base* p = &d;        // pointer:   no copy, no slicing
p->who();            // prints "Derived" - polymorphism works`,
        },
      ],
    },

    {
      id: 'casting',
      heading: 'Upcasting and downcasting',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              <b>Upcasting</b> treats a derived object as its base type — going <i>up</i> the family tree. Always
              safe (a Dog genuinely is an Animal), implicit, no cast syntax needed.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Upcasting — the heart of runtime polymorphism',
          code: `Base* b = new Derived();     // upcast: implicit, always safe
Animal* a = new Dog();       // one Animal* can hold any animal,
a->sound();                  // and virtual picks the right behaviour`,
        },
        {
          k: 'p',
          text: (
            <>
              <b>Downcasting</b> goes back <i>down</i>: treating a base pointer as a specific derived type. Risky,
              because the object might not actually be that type — so C++ makes you ask explicitly and gives you a
              way to check.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Downcasting — always check',
          code: `Base* b = new Derived();

Derived* d = dynamic_cast<Derived*>(b);   // SAFE downcast: checks at runtime
if (d != nullptr) {                       // success -> it really was a Derived
    d->derivedOnlyMethod();
} else {
    // b was NOT pointing at a Derived - dynamic_cast returned nullptr
}

// static_cast<Derived*>(b) also compiles - faster but NO runtime check:
// if you are wrong, undefined behaviour.
// dynamic_cast requires the base to have at least one virtual function.`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Every Dog is an Animal, so going up is free. Not every Animal is a Dog, so going down requires an
              identity check. Needing frequent downcasts is usually a design smell — it often means a virtual
              function is missing from the base.
            </>
          ),
        },
      ],
    },

    {
      id: 'diamond',
      heading: 'The diamond problem and virtual base classes',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              With multiple inheritance, D can inherit A twice — once via B and once via C — so <code>d.value</code>{' '}
              is ambiguous: <i>which</i> A's value? The inheritance diagram is diamond-shaped, hence the name.
            </>
          ),
        },
        { k: 'diagram', el: <Diamond />, caption: 'Virtual inheritance collapses the two copies of A into one.' },
        {
          k: 'code',
          title: 'The problem and the fix',
          code: `// PROBLEM
class A { public: int value; };
class B : public A { };            // no "virtual"
class C : public A { };
class D : public B, public C { };

D d;
d.value = 10;      // ERROR: ambiguous - B's A or C's A?
d.B::value = 10;   // ugly workaround: pick a path manually

// FIX - virtual base class
class B : virtual public A { };    // "virtual" = share A, don't duplicate it
class C : virtual public A { };
class D : public B, public C { };  // D now contains exactly ONE A

D d;
d.value = 10;      // unambiguous, compiles fine`,
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              Worth adding: <b>Java sidesteps the whole problem</b> by banning multiple inheritance of classes and
              using interfaces instead — interfaces carry no data, so there is nothing to duplicate.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between shallow copy and deep copy?',
      a: (
        <>
          A <b>shallow</b> copy duplicates the fields bit for bit, so a pointer member ends up shared — both objects
          reference the same heap memory, changes leak between them, and both destructors free it (double delete). A{' '}
          <b>deep</b> copy allocates new memory and copies the pointed-to <i>data</i>, so the objects are
          independent.
        </>
      ),
    },
    {
      q: 'What is the Rule of Three?',
      a: (
        <>
          If a class needs a custom <b>destructor</b>, it almost certainly also needs a custom <b>copy
          constructor</b> and <b>copy assignment operator</b> — all three exist because the class owns a resource.
          Modern C++ extends it to the Rule of Five by adding the move constructor and move assignment.
        </>
      ),
    },
    {
      q: 'Why does a base class need a virtual destructor?',
      a: (
        <>
          Because <code>delete basePtr</code> on an object that is really a Derived would otherwise call only{' '}
          <b>~Base</b>, leaving the derived part's resources unfreed. Marking the base destructor{' '}
          <code>virtual</code> makes the call dynamic, so ~Derived runs first and then ~Base.
        </>
      ),
    },
    {
      q: 'What is object slicing and how do you avoid it?',
      a: (
        <>
          Copying a derived object <b>by value</b> into a base object discards the derived members and the dynamic
          type, so virtual calls resolve to the base version. Avoid it by using <b>pointers or references</b> to the
          base rather than by-value copies — which is also why exceptions should be caught by reference.
        </>
      ),
    },
    {
      q: 'Upcasting vs downcasting?',
      a: (
        <>
          <b>Upcasting</b> is derived → base: implicit, always safe, and the basis of runtime polymorphism.{' '}
          <b>Downcasting</b> is base → derived: explicit and potentially wrong, so use{' '}
          <code>dynamic_cast</code>, which returns <code>nullptr</code> (or throws for references) if the object is
          not really that type.
        </>
      ),
    },
    {
      q: 'Difference between static_cast and dynamic_cast for downcasting?',
      a: (
        <>
          <code>static_cast</code> is compile-time only — fast, but if the object is not really that type you get
          undefined behaviour. <code>dynamic_cast</code> checks the actual type at runtime using RTTI and returns{' '}
          <code>nullptr</code> on failure. It requires the base class to have at least one virtual function.
        </>
      ),
    },
    {
      q: 'What is the diamond problem?',
      a: (
        <>
          With multiple inheritance, if B and C both inherit A and D inherits both, D contains <b>two copies</b> of
          A — so referring to an inherited member is ambiguous and the compiler rejects it.
        </>
      ),
    },
    {
      q: 'How is the diamond problem solved?',
      a: (
        <>
          With a <b>virtual base class</b>: declare <code>class B : virtual public A</code> and{' '}
          <code>class C : virtual public A</code>. D then contains exactly one shared A and member access is
          unambiguous. Java avoids the problem entirely by disallowing multiple class inheritance.
        </>
      ),
    },
    {
      q: 'Why must a copy constructor take its parameter by reference?',
      a: (
        <>
          Because passing by value would itself require making a copy — which would call the copy constructor —
          which would need another copy, infinitely. Taking it by reference (and normally{' '}
          <code>const&amp;</code>) breaks the regress.
        </>
      ),
    },
    {
      q: 'Difference between a copy constructor and the assignment operator?',
      a: (
        <>
          The <b>copy constructor</b> builds a <i>brand-new</i> object from an existing one (
          <code>Student b = a;</code>). The <b>assignment operator</b> overwrites an object that <i>already
          exists</i> (<code>b = a;</code> on a later line), so it must also release whatever b was holding and guard
          against self-assignment.
        </>
      ),
    },
  ],
};

export default topic;
