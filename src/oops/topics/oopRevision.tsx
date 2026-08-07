import type { OopTopic } from '../types';

const topic: OopTopic = {
  slug: 'oop-revision',
  num: 8,
  unit: 'Quick Revision',
  title: '10-Minute OOP Revision',
  blurb:
    'The four pillars, the vtable, copy semantics, the diamond and SOLID — every OOP answer compressed to the lines you would actually say out loud.',
  minutes: 10,
  tags: ['Revision', 'Read this last'],

  sections: [
    {
      id: 'pillars',
      heading: 'The four pillars, one line each',
      blocks: [
        {
          k: 'table',
          head: ['Pillar', 'Is', 'In C++', 'The point'],
          rows: [
            [
              'Encapsulation',
              'Data and the methods on it bundled, internals hidden',
              'private members + public getters/setters',
              'You can change the internals without breaking callers',
            ],
            [
              'Abstraction',
              'Exposing what it does, hiding how',
              'Abstract class or pure virtual interface',
              'Callers depend on a contract, not an implementation',
            ],
            [
              'Inheritance',
              'A derived class reusing a base class',
              'class Dog : public Animal',
              'Reuse plus an is-a relationship',
            ],
            [
              'Polymorphism',
              'One interface, many behaviours',
              'Overloading (compile time), virtual (runtime)',
              'Add a new type without touching the calling code',
            ],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The follow-up is always <b>encapsulation vs abstraction</b>. Encapsulation is about{' '}
              <b>hiding data</b> — an implementation technique. Abstraction is about <b>hiding complexity</b> — a
              design idea. Encapsulation is one way you achieve abstraction.
            </>
          ),
        },
      ],
    },

    {
      id: 'comparisons',
      heading: 'The comparisons',
      blocks: [
        {
          k: 'table',
          head: ['Pair', 'The distinction'],
          rows: [
            ['Overloading vs overriding', 'Same name different parameters, resolved at COMPILE time, same class vs same signature, resolved at RUNTIME, base and derived.'],
            ['Compile-time vs runtime polymorphism', 'Overloading and templates, bound by the compiler vs virtual functions, bound through the vtable.'],
            ['Abstract class vs interface', 'Can hold data and implemented methods, single inheritance in Java vs pure contract, multiple implementations. In C++ an interface is just an all-pure-virtual class.'],
            ['Class vs object', 'A blueprint, no memory vs an instance with its own memory and state.'],
            ['Shallow vs deep copy', 'Copies the pointer — both objects share one buffer and double-free vs copies what it points to — independent objects.'],
            ['Composition vs inheritance', 'Has-a, flexible, swappable at runtime vs is-a, tighter coupling. Prefer composition.'],
            ['Association / aggregation / composition', 'Uses vs has-a with independent lifetimes vs has-a where the part dies with the whole.'],
            ['Static vs dynamic binding', 'Address fixed at compile time vs looked up in the vtable at call time.'],
            ['Struct vs class (C++)', 'Members public by default vs private by default. That is the only language difference.'],
            ['virtual vs pure virtual', 'Has a body, may be overridden vs = 0, must be overridden, makes the class abstract.'],
          ],
        },
      ],
    },

    {
      id: 'vtable',
      heading: 'The vtable, in four sentences',
      blocks: [
        {
          k: 'ol',
          items: [
            <>
              Any class with a virtual function gets one <b>vtable</b> — a per-class array of function pointers,
              one entry per virtual function.
            </>,
            <>
              Every object of that class carries a hidden <b>vptr</b> pointing at its class's vtable. That is why{' '}
              <code>sizeof</code> grows by a pointer the moment you add <code>virtual</code>.
            </>,
            <>
              A call through a base pointer reads the vptr, indexes the vtable, and jumps — so the{' '}
              <b>object's actual type</b> decides, not the pointer's type.
            </>,
            <>
              The cost is one extra indirection and no inlining. That is the whole runtime-polymorphism tradeoff.
            </>,
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Always make the base destructor virtual',
          text: (
            <>
              <code>delete basePtr</code> on a non-virtual destructor runs only the base destructor — the derived
              part is never cleaned up, and that is <b>undefined behaviour</b>, usually a leak. One keyword, and it
              is the most-asked C++ OOP question there is.
            </>
          ),
        },
      ],
    },

    {
      id: 'rules',
      heading: 'The rules worth memorising',
      blocks: [
        {
          k: 'ul',
          items: [
            <>
              <b>Rule of Three / Five.</b> If you write a destructor, copy constructor or copy assignment, you
              probably need all three (plus move constructor and move assignment in modern C++). Writing one and
              not the others is what causes double frees.
            </>,
            <>
              <b>Constructors run base first, destructors derived first.</b> Construction builds outwards,
              destruction unwinds inwards.
            </>,
            <>
              <b>Constructors cannot be virtual; destructors should be.</b> There is no object yet at construction
              time, so there is no vptr to dispatch through.
            </>,
            <>
              <b>The diamond problem</b> — D inherits B and C, both inheriting A, so D holds two copies of A and the
              call is ambiguous. Fix: <code>virtual</code> inheritance, which makes them share one A. Java sidesteps
              it by banning multiple class inheritance.
            </>,
            <>
              <b>static</b> members belong to the class, not to any object — one copy shared by all, callable
              without an instance.
            </>,
            <>
              <b>friend</b> breaks encapsulation deliberately, for operator overloading and tightly-paired classes.
              Friendship is not inherited and not mutual.
            </>,
            <>
              <b>Upcast is safe, downcast needs a check.</b> Derived→Base is implicit; Base→Derived should go
              through <code>dynamic_cast</code>, which returns <code>nullptr</code> when the type is wrong.
            </>,
          ],
        },
      ],
    },

    {
      id: 'solid',
      heading: 'SOLID, one line each',
      blocks: [
        {
          k: 'table',
          head: ['', 'Principle', 'Says'],
          rows: [
            ['S', 'Single Responsibility', 'A class should have one reason to change.'],
            ['O', 'Open/Closed', 'Open for extension, closed for modification — add a subclass, do not edit the old one.'],
            ['L', 'Liskov Substitution', 'A derived object must be usable anywhere the base is, without surprises.'],
            ['I', 'Interface Segregation', 'Many small interfaces beat one fat one nobody fully implements.'],
            ['D', 'Dependency Inversion', 'Depend on abstractions, not concrete classes.'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              The classic Liskov violation: <code>Square</code> deriving from <code>Rectangle</code>. Setting the
              width of a square silently changes its height, so code written against Rectangle breaks — an is-a
              relationship in English that is not one in behaviour.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What are the four pillars of OOP?',
      a: (
        <>
          <b>Encapsulation</b> (bundle data with its methods, hide internals), <b>abstraction</b> (expose what,
          hide how), <b>inheritance</b> (reuse via an is-a relationship) and <b>polymorphism</b> (one interface,
          many behaviours).
        </>
      ),
    },
    {
      q: 'Overloading vs overriding?',
      a: (
        <>
          <b>Overloading</b> — same name, different parameter list, in the same class, resolved at <b>compile
          time</b>. <b>Overriding</b> — same signature, in a derived class, resolved at <b>runtime</b> through the
          vtable. Compile-time vs runtime polymorphism.
        </>
      ),
    },
    {
      q: 'How does runtime polymorphism actually work?',
      a: (
        <>
          Each class with virtual functions has a <b>vtable</b> of function pointers; each object holds a hidden{' '}
          <b>vptr</b> to it. A virtual call dereferences the vptr and jumps to the entry, so the object's real type
          selects the implementation. Cost: one indirection, plus a pointer per object.
        </>
      ),
    },
    {
      q: 'Why must a base class destructor be virtual?',
      a: (
        <>
          So that <code>delete</code> through a base pointer runs the <b>derived</b> destructor first and then the
          base one. Without it, only the base destructor runs — undefined behaviour, and the derived class's
          resources leak.
        </>
      ),
    },
    {
      q: 'Abstract class vs interface?',
      a: (
        <>
          An <b>abstract class</b> can hold data members and implemented methods and shares state with its
          children; an <b>interface</b> is a pure contract with no state. In C++ an interface is simply a class
          where every method is pure virtual. Use an abstract class for shared behaviour, an interface for a
          capability.
        </>
      ),
    },
    {
      q: 'Shallow vs deep copy — why does it matter?',
      a: (
        <>
          A shallow copy duplicates pointers, so two objects share one buffer — modifying one changes the other and
          both destructors free it, giving a <b>double free</b>. A deep copy duplicates the pointed-to data. This
          is exactly why the <b>Rule of Three</b> exists.
        </>
      ),
    },
    {
      q: 'What is the diamond problem and how is it solved?',
      a: (
        <>
          D inherits from B and C, both of which inherit A, so D contains <b>two copies</b> of A and calls to A's
          members are ambiguous. C++ solves it with <b>virtual inheritance</b>, which makes B and C share a single
          A. Java avoids it by forbidding multiple class inheritance.
        </>
      ),
    },
    {
      q: 'Composition or inheritance — which do you prefer and why?',
      a: (
        <>
          <b>Composition</b>, generally. Inheritance couples you to the base class's implementation and is fixed at
          compile time; composition lets you swap the collaborating object at runtime and keeps each class small.
          Use inheritance only when the is-a relationship genuinely holds behaviourally (see Liskov).
        </>
      ),
    },
    {
      q: 'Explain SOLID briefly.',
      a: (
        <>
          One reason to change (S); extend rather than modify (O); a subclass must be substitutable for its base
          (L); prefer several small interfaces (I); depend on abstractions rather than concretions (D).
        </>
      ),
    },
  ],
};

export default topic;
