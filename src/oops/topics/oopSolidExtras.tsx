import { Box, Dg, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** SOLID as five labelled cards. */
function SolidCards() {
  const card = (x: number, y: number, letter: string, name: string, line: string, c: 'a' | 'b' | 'c') => (
    <g key={letter}>
      <Box x={x} y={y} w={286} h={54} c={c} ghost />
      <text x={x + 26} y={y + 34} textAnchor="middle" fontSize="21" fontWeight="800" fill={`var(--${c === 'a' ? 'accent' : c === 'b' ? 'accent-2' : 'accent-3'})`}>
        {letter}
      </text>
      <text x={x + 50} y={y + 22} fontSize="12" fontWeight="800" fill="var(--ink)">
        {name}
      </text>
      <text x={x + 50} y={y + 40} fontSize="10.5" fill="var(--ink-soft)">
        {line}
      </text>
    </g>
  );
  return (
    <Dg w={608} h={196} cap="Five rules for classes that survive change">
      {card(2, 8, 'S', 'Single Responsibility', 'one class, one reason to change', 'a')}
      {card(312, 8, 'O', 'Open / Closed', 'extend by adding, not by editing', 'b')}
      {card(2, 70, 'L', 'Liskov Substitution', 'a child must work wherever the parent does', 'c')}
      {card(312, 70, 'I', 'Interface Segregation', 'many small interfaces beat one fat one', 'a')}
      {card(157, 132, 'D', 'Dependency Inversion', 'depend on abstractions, not concretions', 'b')}
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-solid-extras',
  num: 7,
  unit: 'Design & Revision',
  title: 'const, mutable, Exceptions, Namespaces & SOLID',
  blurb:
    'The C++ extras interviewers still ask about, the five SOLID principles with a violation example each, and the twenty one-line comparisons to drill.',
  minutes: 14,
  tags: ['Very common', 'Revision'],

  sections: [
    {
      id: 'const-mutable',
      heading: 'const member functions and mutable',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Writing <code>const</code> after a member function's parentheses is a signed promise: "calling me will
              never modify the object."
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
    int age = 20;
public:
    int getAge() const {         // the const goes HERE
        // age++;                compile error - the promise is enforced
        return age;              // reading is fine
    }
};

const Student s;                 // a const OBJECT...
s.getAge();                      // ...may ONLY call const member functions`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Habit worth having: mark every getter <code>const</code>. It documents intent, and it is{' '}
              <b>required</b> for the function to be callable on const objects and const references — which is how
              objects are usually passed around.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              <code>mutable</code> is the one escape hatch: a member marked mutable <b>may</b> be modified even
              inside a const function, for bookkeeping data that is not part of the object's real state.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
    int age = 20;
    mutable int accessCount = 0;     // bookkeeping, not "real" data

public:
    int getAge() const {
        accessCount++;               // allowed - mutable overrides const
        // age++;                    still an error - age is not mutable
        return age;
    }
};`,
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Legitimate uses are counters, caches and debug logs — cases where the object is still{' '}
              <i>logically</i> unchanged. If you are marking real data <code>mutable</code>, the design is wrong.
            </>
          ),
        },
      ],
    },

    {
      id: 'exceptions',
      heading: 'Exception handling',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A structured way to say "something went wrong" (<code>throw</code>) and to deal with it somewhere
              sensible (<code>try</code>/<code>catch</code>), instead of crashing or returning cryptic error codes.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `double divide(double a, double b) {
    if (b == 0)
        throw runtime_error("Division by zero!");   // raise the alarm
    return a / b;
}

try {
    cout << divide(10, 0);          // risky code goes in try
}
catch (runtime_error& e) {          // catch by REFERENCE (avoids slicing)
    cout << "Problem: " << e.what();
}
catch (...) {                       // "..." catches ANYTHING - last resort
    cout << "Unknown error";
}`,
        },
        {
          k: 'ul',
          items: [
            <>
              <code>throw</code> immediately abandons the current function and <b>unwinds the stack</b> until a
              matching <code>catch</code> is found. Stack objects are properly destructed on the way — another
              reason destructors matter.
            </>,
            <>
              Always <b>catch by reference</b>. Catching by value slices a derived exception down to its base type,
              losing the specific information you wanted.
            </>,
            <>
              Unlike Java, C++ has <b>no <code>finally</code></b>. Cleanup is done by destructors — the RAII
              pattern.
            </>,
          ],
        },
      ],
    },

    {
      id: 'namespaces',
      heading: 'Namespaces',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Named containers for code, so two libraries can both have a <code>print()</code> without colliding —
              like two students named Arjun distinguished by surname.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `namespace School {
    void print() { cout << "School"; }
}
namespace Office {
    void print() { cout << "Office"; }
}

School::print();          // :: = "the print that lives inside School"
Office::print();

using namespace School;   // shortcut: now plain print() means School::print()
                          // (fine in small programs; avoided in headers)`,
        },
        {
          k: 'p',
          text: (
            <>
              You have used one since day one: <code>std</code> is the standard library's namespace —{' '}
              <code>std::cout</code>, <code>std::string</code> — which is exactly what{' '}
              <code>using namespace std;</code> unlocks.
            </>
          ),
        },
      ],
    },

    {
      id: 'solid',
      heading: 'The SOLID principles',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Five rules for designing classes that survive change, and the vocabulary of every design-round
              interview. Learn each as <b>one sentence plus one violation example</b> — the example is what proves
              you understand it.
            </>
          ),
        },
        { k: 'diagram', el: <SolidCards />, caption: 'The thread connecting all five: code you can change without breaking what already works.' },
        {
          k: 'table',
          head: ['', 'Principle', 'Plain meaning', 'A smell that violates it'],
          rows: [
            [
              'S',
              'Single Responsibility',
              'A class should have exactly one reason to change — one job.',
              'A Report class that computes data AND formats HTML AND saves to disk — three jobs, so three classes.',
            ],
            [
              'O',
              'Open / Closed',
              'Open for extension, closed for modification: add behaviour with new classes, not by editing tested ones.',
              'A payment function full of if (type == "upi") … else if (type == "card") … that must be edited for every new method.',
            ],
            [
              'L',
              'Liskov Substitution',
              'Any child object must work wherever its parent is expected, without surprises.',
              'Square extends Rectangle but breaks setWidth(); Penguin extends Bird but fly() throws.',
            ],
            [
              'I',
              'Interface Segregation',
              'Many small, focused interfaces beat one fat one — no class should implement methods it does not need.',
              'A Machine interface with print + scan + fax, forcing a simple printer to write an empty fax().',
            ],
            [
              'D',
              'Dependency Inversion',
              'Depend on abstractions, not concrete classes — high-level logic should not be welded to low-level details.',
              'OrderService constructing a MySQLDatabase directly; it should receive a Database interface instead.',
            ],
          ],
        },
      ],
    },

    {
      id: 'comparisons',
      heading: 'The twenty comparisons, one line each',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The rapid-fire sheet. Each row answers a "what is the difference between…?" question. Drill these
              until every answer is automatic.
            </>
          ),
        },
        {
          k: 'table',
          head: ['Comparison', 'The one-line answer'],
          rows: [
            ['Class vs Object', 'Blueprint vs the real instance built from it; the class takes no memory, each object takes its own.'],
            ['Constructor vs Destructor', 'Runs at birth to initialise vs runs at death to clean up; many constructors allowed, exactly one destructor.'],
            ['Constructor vs Method', "Class's name + no return type + automatic + once, vs any name + return type + manual + many times."],
            ['Copy Constructor vs Assignment', 'Copy ctor creates a NEW object from an existing one; assignment overwrites an object that already exists.'],
            ['Shallow vs Deep Copy', 'Copies the pointer (shared memory, double-delete danger) vs allocates new memory and copies the data.'],
            ['Abstraction vs Encapsulation', 'Hides complexity at design level vs hides data at code level; encapsulation is a tool of abstraction.'],
            ['Overloading vs Overriding', 'Same name, different parameters, one class, compile time vs same signature, child class, runtime + virtual.'],
            ['Compile-time vs Runtime Polymorphism', 'Overloading resolved by the compiler vs overriding resolved through the vtable while running.'],
            ['Abstract Class vs Interface', 'Half-built house (code + promises, extend one) vs pure checklist (only promises, sign many).'],
            ['Composition vs Aggregation', 'Strong HAS-A, part dies with the whole vs weak HAS-A, part outlives the whole.'],
            ['Aggregation vs Association', 'Has-but-does-not-own vs merely uses or knows — no ownership at all.'],
            ['public vs private vs protected', 'Everyone / only the class / the class plus its children.'],
            ['Stack vs Heap objects', 'Automatic creation and destruction at scope end vs manual new/delete, alive until freed.'],
            ['Static vs Non-static members', 'One copy owned by the class, usable without objects, no this vs one copy per object.'],
            ['Friend Function vs Friend Class', 'One trusted outside function vs an entire trusted class — a key vs the whole keyring.'],
            ['Virtual vs Pure Virtual', 'Has a body, overriding optional vs = 0, no body, overriding compulsory and the class becomes abstract.'],
            ['new vs malloc', 'C++ operator that calls the constructor and throws on failure vs C function returning raw void* bytes.'],
            ['delete vs free', 'Calls the destructor then frees vs frees raw bytes only; never mix the pairs.'],
            ['Virtual vs Normal Destructor', 'Deleting a derived object via a base pointer runs both destructors vs runs only the base one — the derived part leaks.'],
            ['Upcasting vs Downcasting', 'Child → parent, implicit and always safe vs parent → child, explicit and checked with dynamic_cast.'],
          ],
        },
      ],
    },

    {
      id: 'roadmap',
      heading: 'Revision order',
      blocks: [
        {
          k: 'p',
          text: <>The order that builds correctly — each item only needs the ones before it.</>,
        },
        {
          k: 'ol',
          items: [
            'Class & object — the foundation everything sits on',
            'Constructors & destructors — object birth and death',
            'Access specifiers — who can touch what',
            'Encapsulation — the first pillar, which needs access specifiers',
            'Abstraction — the second pillar, plus the abstraction-vs-encapsulation answer',
            'Inheritance — all five types, and the IS-A test',
            'Polymorphism — overloading and overriding',
            'Virtual functions & the vtable — how runtime polymorphism actually works',
            'Abstract classes & interfaces — pure virtual, contracts',
            'Static members & the this pointer',
            'Friend functions & classes',
            'Shallow vs deep copy, plus the Rule of Three',
            'Object slicing, upcasting & downcasting',
            'Composition, aggregation & association',
            'Virtual destructors',
            'SOLID — the design-round finale',
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Then drill the twenty comparisons until each answer is automatic. If you can also <b>explain the
              vtable</b> and <b>write a deep copy constructor from memory</b>, you are ahead of most candidates.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does a const member function guarantee?',
      a: (
        <>
          That calling it will not modify the object's observable state — the compiler rejects any write to a
          non-mutable member. It is also <b>required</b> for the function to be callable on a const object or a
          const reference, which is how objects are usually passed.
        </>
      ),
    },
    {
      q: 'What is mutable for?',
      a: (
        <>
          It exempts one member from const-ness, so it can be modified inside a const function. Legitimate for
          bookkeeping that is not part of the logical state — access counters, memoisation caches, lazily computed
          values. Using it on real data means the design is wrong.
        </>
      ),
    },
    {
      q: 'Why should exceptions be caught by reference?',
      a: (
        <>
          Catching by value <b>slices</b> the exception down to the declared base type, losing the derived type's
          information and its virtual behaviour. Catching by reference (usually <code>const&amp;</code>) preserves
          the real exception and avoids a copy.
        </>
      ),
    },
    {
      q: 'C++ has no finally — how do you guarantee cleanup?',
      a: (
        <>
          With <b>RAII</b>: wrap the resource in an object whose <b>destructor</b> releases it. Stack unwinding
          destroys that object on any exit path — normal return or thrown exception — so the release is guaranteed
          without a finally block. <code>unique_ptr</code> and <code>lock_guard</code> are exactly this.
        </>
      ),
    },
    {
      q: 'What is a namespace and why avoid "using namespace std" in headers?',
      a: (
        <>
          A named scope preventing name collisions between libraries. Putting <code>using namespace std;</code> in a{' '}
          <b>header</b> forces it on every file that includes it, which can silently make an ambiguous or wrong
          overload win. It is acceptable inside a small .cpp file, never in a header.
        </>
      ),
    },
    {
      q: 'Explain the SOLID principles.',
      a: (
        <>
          <b>S</b>ingle Responsibility — one reason to change. <b>O</b>pen/Closed — extend by adding, not editing.{' '}
          <b>L</b>iskov Substitution — a child must be usable wherever the parent is. <b>I</b>nterface Segregation —
          many small interfaces beat one fat one. <b>D</b>ependency Inversion — depend on abstractions, not
          concretions. Always pair each with a violation example.
        </>
      ),
    },
    {
      q: 'Give a Liskov Substitution violation.',
      a: (
        <>
          <code>Square extends Rectangle</code>: setting the width of a Square must also change its height, so code
          written against Rectangle ("set width to 5, set height to 4, expect area 20") breaks. Or{' '}
          <code>Penguin extends Bird</code> where <code>fly()</code> throws — the child betrays a promise the parent
          made.
        </>
      ),
    },
    {
      q: 'How would you fix an Open/Closed violation in a payment function?',
      a: (
        <>
          Replace the <code>if (type == "upi") … else if (type == "card") …</code> chain with a{' '}
          <code>Payable</code> interface that each payment method implements. Adding a new method then means adding
          a new class, with no edit to the tested dispatch code.
        </>
      ),
    },
    {
      q: 'What does Dependency Inversion look like in practice?',
      a: (
        <>
          Instead of <code>OrderService</code> constructing a <code>MySQLDatabase</code> itself, it accepts a{' '}
          <code>Database</code> interface through its constructor. The concrete class is chosen at the composition
          root, so the service is testable with a fake and the database can be swapped without touching it — this
          is dependency injection.
        </>
      ),
    },
  ],
};

export default topic;
