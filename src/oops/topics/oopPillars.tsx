import { Arrow, Box, ClassBox, Dg, Extends, Frame, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** Encapsulation: private data reachable only through methods. */
function Encapsulation() {
  return (
    <Dg w={580} h={226} cap="The data is sealed; the methods are the only doors, so every change can be validated">
      <Frame x={150} y={20} w={280} h={168} label="Student" c="a" />
      <Box x={200} y={100} w={180} h={46} label="private: int age" c="c" />
      <Box x={172} y={54} w={110} h={34} label="setAge(int)" c="b" fs={11} />
      <Box x={298} y={54} w={110} h={34} label="getAge()" c="b" fs={11} />
      <Arrow x1={227} y1={88} x2={252} y2={98} c="b" />
      <Arrow x1={340} y1={98} x2={353} y2={88} c="b" />

      <Arrow x1={60} y1={71} x2={168} y2={71} c="b" label="s.setAge(20) ✓" dy={-9} />
      <Arrow x1={60} y1={124} x2={196} y2={124} c="c" dashed label="s.age = −5 ✗" dy={-9} />
      <Txt x={80} y={148} fs={10} bold c="c">
        compile error
      </Txt>

      <Txt x={290} y={210} fs={10.5} soft>
        the internal representation can change later without breaking any outside code
      </Txt>
    </Dg>
  );
}

/** The five shapes of inheritance. */
function InheritanceTypes() {
  const node = (x: number, y: number, l: string, c: 'a' | 'b' | 'c' = 'a') => (
    <Box key={`${x}-${y}-${l}`} x={x} y={y} w={38} h={26} label={l} c={c} fs={11} r={5} />
  );
  return (
    <Dg w={620} h={220} cap="Five ways classes can be arranged — hybrid is where the diamond problem lives">
      <Txt x={62} y={24} fs={10.5} bold c="a">
        Single
      </Txt>
      {node(43, 38, 'A')}
      <Extends x1={62} y1={110} x2={62} y2={66} />
      {node(43, 110, 'B', 'b')}

      <Txt x={186} y={24} fs={10.5} bold c="a">
        Multilevel
      </Txt>
      {node(167, 38, 'A')}
      <Extends x1={186} y1={98} x2={186} y2={66} />
      {node(167, 98, 'B', 'b')}
      <Extends x1={186} y1={158} x2={186} y2={126} />
      {node(167, 158, 'C', 'c')}

      <Txt x={330} y={24} fs={10.5} bold c="a">
        Hierarchical
      </Txt>
      {node(311, 38, 'A')}
      <Extends x1={280} y1={110} x2={322} y2={66} />
      <Extends x1={330} y1={110} x2={330} y2={66} />
      <Extends x1={380} y1={110} x2={338} y2={66} />
      {node(261, 110, 'B', 'b')}
      {node(311, 110, 'C', 'b')}
      {node(361, 110, 'D', 'b')}

      <Txt x={480} y={24} fs={10.5} bold c="a">
        Multiple
      </Txt>
      {node(441, 38, 'A')}
      {node(511, 38, 'B')}
      <Extends x1={480} y1={110} x2={462} y2={66} />
      <Extends x1={490} y1={110} x2={520} y2={66} />
      {node(466, 110, 'C', 'c')}

      <Txt x={584} y={24} fs={10.5} bold c="c">
        Hybrid
      </Txt>
      {node(565, 38, 'A')}
      <Extends x1={548} y1={98} x2={578} y2={66} />
      <Extends x1={598} y1={98} x2={588} y2={66} />
      {node(529, 98, 'B', 'b')}
      {node(579, 98, 'C', 'b')}
      <Extends x1={565} y1={158} x2={548} y2={126} />
      <Extends x1={575} y1={158} x2={598} y2={126} />
      {node(546, 158, 'D', 'c')}

      <Txt x={310} y={206} fs={10.5} soft>
        the arrow points at the parent — read it as "B is an A"
      </Txt>
    </Dg>
  );
}

/** Compile-time vs runtime polymorphism. */
function PolymorphismKinds() {
  return (
    <Dg w={608} h={252} cap="The compiler decides one; the actual object decides the other">
      <Frame x={2} y={8} w={292} h={236} label="COMPILE-TIME (static)" c="a" />
      <Box x={22} y={46} w={252} h={30} label="add(int, int)" c="a" fs={11} />
      <Box x={22} y={80} w={252} h={30} label="add(int, int, int)" c="a" fs={11} />
      <Box x={22} y={114} w={252} h={30} label="add(double, double)" c="a" fs={11} />
      <Txt x={148} y={172} fs={10.5} soft>
        one name, different parameter lists
      </Txt>
      <Txt x={148} y={192} fs={10.5} soft>
        the compiler picks by the arguments
      </Txt>
      <Txt x={148} y={222} fs={10.5} bold c="a">
        overloading · operator overloading
      </Txt>

      <Frame x={314} y={8} w={292} h={236} label="RUNTIME (dynamic)" c="b" />
      <ClassBox x={396} y={38} w={132} name="Animal" members={['virtual sound()']} c="n" headH={26} />
      <Extends x1={462} y1={124} x2={462} y2={88} />
      <ClassBox x={396} y={124} w={132} name="Dog" members={['sound() override']} c="b" headH={26} />
      <Txt x={460} y={200} fs={10.5} soft>
        Animal* a = new Dog(); a-&gt;sound();
      </Txt>
      <Txt x={460} y={222} fs={10.5} bold c="b">
        prints "Dog" — the object wins, not the pointer
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-pillars',
  num: 2,
  unit: 'Fundamentals',
  title: 'Encapsulation, Abstraction, Inheritance & Polymorphism',
  blurb:
    'The four pillars, the abstraction-vs-encapsulation answer interviewers actually want, all five inheritance types, and overloading versus overriding.',
  minutes: 16,
  free: true,
  tags: ['Very common', 'Guaranteed question'],

  sections: [
    {
      id: 'encapsulation',
      heading: 'Pillar 1 — Encapsulation',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Wrapping data and the methods that operate on it into one unit (the class), and <b>locking the data</b>{' '}
              so it can only change through those methods. Like an ATM: the vault is sealed, and you get buttons.
            </>
          ),
        },
        { k: 'diagram', el: <Encapsulation />, caption: 'The setter is the only way in, so it can reject nonsense.' },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
private:
    int age;                     // the data is HIDDEN

public:
    void setAge(int a) {         // the only door in, so rules can be enforced
        if (a > 0) age = a;      // bad values simply rejected
    }
    int getAge() { return age; } // a safe, read-only window
};

Student s;
s.setAge(20);      // through the door
// s.age = -5;     // compile error - private!`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Data hiding</b> — no outsider can put the object into a nonsense state such as age = −5.
            </>,
            <>
              <b>Security</b> — every change passes through your validation code.
            </>,
            <>
              <b>Easy maintenance</b> — the internal representation can change later (age → date of birth) without
              breaking any code outside the class, because outsiders only ever used the methods.
            </>,
          ],
        },
      ],
    },

    {
      id: 'abstraction',
      heading: 'Pillar 2 — Abstraction',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Show <b>what</b> a thing does, hide <b>how</b> it does it. You press a car's start button — you never
              see fuel injection, spark timing or the ECU.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Car {
public:
    void start() {
        cout << "Car Started";   // the user calls start() and that's ALL they know
    }
private:
    void injectFuel()  { /* hidden complexity */ }
    void igniteSpark() { /* hidden complexity */ }
};`,
        },
        {
          k: 'p',
          text: (
            <>
              Achieved in C++ by <b>abstract classes</b> and <b>pure virtual functions</b>, and in Java by
              interfaces. They let you publish only the "what" — the function signatures — and force the "how" into
              hidden implementations.
            </>
          ),
        },
        {
          k: 'table',
          head: ['', 'Abstraction', 'Encapsulation'],
          rows: [
            ['Hides', 'Implementation complexity — "how it works"', 'Data — the variables themselves'],
            ['Level', 'Design level: deciding what to expose', 'Code level: access specifiers, getters and setters'],
            ['Tool', 'Abstract classes, interfaces, pure virtual functions', 'private / protected plus public methods'],
            ['Analogy', "The car's start button hides the engine logic", "The car's bonnet is locked so you cannot poke the engine"],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          text: (
            <>
              The one-liner to say out loud: <b>"Abstraction hides complexity; encapsulation protects data.
              Encapsulation is one of the tools that helps achieve abstraction."</b>
            </>
          ),
        },
      ],
    },

    {
      id: 'inheritance',
      heading: 'Pillar 3 — Inheritance',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              One class automatically receives the members of another. Write the common code once in a parent;
              children reuse it and add their own. The test: <b>"child IS A parent"</b> must sound true.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Animal {                       // base (parent) class
public:
    void eat() { cout << "eating\\n"; }
};

class Dog : public Animal {          // ": public Animal" = inherits
public:
    void bark() { cout << "woof\\n"; }
};

Dog d;
d.eat();     // inherited - never written in Dog
d.bark();    // Dog's own`,
        },
        { k: 'diagram', el: <InheritanceTypes />, caption: 'The five types of inheritance.' },
        {
          k: 'table',
          head: ['Type', 'Shape', 'Meaning'],
          rows: [
            ['Single', 'A → B', 'One parent, one child'],
            ['Multilevel', 'A → B → C', 'Grandparent → parent → child; C gets everything'],
            ['Hierarchical', 'A → B, C, D', 'One parent, many children'],
            ['Multiple', 'A, B → C', 'One child, two parents. Allowed in C++, banned for classes in Java'],
            ['Hybrid', 'a mix', 'Any combination — where the diamond problem lives'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Two reasons inheritance exists: <b>code reuse</b>, and — more importantly — it creates the parent-child
              relationship that makes <b>runtime polymorphism</b> possible, since a base pointer can hold any child.
            </>
          ),
        },
      ],
    },

    {
      id: 'polymorphism',
      heading: 'Pillar 4 — Polymorphism',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              "One interface, many forms" — the same call behaves differently depending on context. It comes in two
              kinds: decided by the <b>compiler</b>, or decided while <b>running</b>.
            </>
          ),
        },
        { k: 'diagram', el: <PolymorphismKinds />, caption: 'Overloading is resolved by arguments; overriding by the actual object.' },
        { k: 'h', text: 'Compile-time polymorphism (static binding)' },
        {
          k: 'code',
          title: 'Function overloading and operator overloading',
          code: `// (a) FUNCTION OVERLOADING - same name, different parameter lists
void add(int a, int b);
void add(int a, int b, int c);
void add(double a, double b);
// the compiler picks by looking at the arguments you pass

// (b) OPERATOR OVERLOADING - teach operators to work on your own types
class Complex {
public:
    int real, imag;
    Complex(int r, int i) : real(r), imag(i) {}

    Complex operator + (Complex obj) {              // defines what c1 + c2 means
        return Complex(real + obj.real, imag + obj.imag);
    }
};
Complex c3 = c1 + c2;    // calls our operator+ - reads like maths`,
        },
        { k: 'h', text: 'Runtime polymorphism (dynamic binding) — method overriding' },
        {
          k: 'code',
          title: 'C++',
          code: `class Animal {
public:
    virtual void sound() {        // "virtual" = children may replace me, and the
        cout << "Animal";         //  REAL object decides which runs, at runtime
    }
};

class Dog : public Animal {
public:
    void sound() override {       // same signature = overriding
        cout << "Dog";
    }
};

Animal* a = new Dog();    // base pointer -> derived object
a->sound();               // prints "Dog" - the OBJECT's type wins, not the pointer's
                          // (remove "virtual" and it would print "Animal")`,
        },
        {
          k: 'table',
          head: ['', 'Overloading', 'Overriding'],
          rows: [
            ['Where', 'Same class', 'Parent → child'],
            ['Signature', 'Same name, different parameters', 'Same name, same parameters'],
            ['Decided', 'Compile time, by the arguments', 'Runtime, by the actual object — needs virtual'],
            ['Inheritance needed?', 'No', 'Yes'],
          ],
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Memory trick: over<b>LOAD</b> = one name loaded with many input options. over<b>RIDE</b> = the child
              rides over the parent's version.
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
          <b>Encapsulation</b> (bundle data with its methods and hide the data), <b>abstraction</b> (expose what,
          hide how), <b>inheritance</b> (a child reuses a parent's members) and <b>polymorphism</b> (one interface,
          many behaviours).
        </>
      ),
    },
    {
      q: 'Abstraction vs encapsulation — the classic confusion.',
      a: (
        <>
          Both hide something, but different things at different levels. <b>Abstraction</b> hides{' '}
          <i>implementation complexity</i> and is a design-level decision, achieved with abstract classes and
          interfaces. <b>Encapsulation</b> hides <i>data</i> and is a code-level mechanism, achieved with access
          specifiers and accessor methods. Encapsulation is one of the tools that helps achieve abstraction.
        </>
      ),
    },
    {
      q: 'Why use inheritance?',
      a: (
        <>
          For <b>code reuse</b> — common members written once in the parent — and, more importantly, because it
          creates the IS-A relationship that makes <b>runtime polymorphism</b> possible: a base pointer can hold any
          derived object.
        </>
      ),
    },
    {
      q: 'What are the types of inheritance?',
      a: (
        <>
          <b>Single</b> (A→B), <b>multilevel</b> (A→B→C), <b>hierarchical</b> (one parent, many children),{' '}
          <b>multiple</b> (one child, several parents — allowed in C++, not for Java classes) and <b>hybrid</b> (a
          combination, which is where the diamond problem arises).
        </>
      ),
    },
    {
      q: 'Difference between overloading and overriding?',
      a: (
        <>
          <b>Overloading</b>: same function name with <i>different</i> parameters, in the <i>same</i> class,
          resolved at <b>compile time</b>, no inheritance needed. <b>Overriding</b>: same signature redefined in a{' '}
          <i>derived</i> class, resolved at <b>runtime</b> through the vtable, and it requires{' '}
          <code>virtual</code>.
        </>
      ),
    },
    {
      q: 'What is compile-time vs runtime polymorphism?',
      a: (
        <>
          <b>Compile-time</b> (static binding) is function and operator overloading — the compiler picks the right
          version from the arguments. <b>Runtime</b> (dynamic binding) is method overriding through virtual
          functions — the actual object's type decides while the program runs.
        </>
      ),
    },
    {
      q: 'Can you achieve runtime polymorphism without inheritance?',
      a: (
        <>
          No — not in the classical OOP sense. Runtime polymorphism requires a base type that a derived type
          substitutes for, so a base pointer or reference can hold a derived object. Without an inheritance
          relationship there is nothing for the dynamic dispatch to choose between.
        </>
      ),
    },
    {
      q: 'What is operator overloading, and can every operator be overloaded?',
      a: (
        <>
          Giving an existing operator a meaning for your own type, so <code>c1 + c2</code> works on a{' '}
          <code>Complex</code>. Most operators can be overloaded, but a few cannot in C++:{' '}
          <code>.</code>, <code>.*</code>, <code>::</code>, <code>sizeof</code> and <code>?:</code>. You also cannot
          invent new operators or change their arity or precedence.
        </>
      ),
    },
    {
      q: 'How does encapsulation make maintenance easier?',
      a: (
        <>
          Because outside code only ever calls methods, never touches fields. You can change the internal
          representation — store a date of birth instead of an age, or move a field into a sub-object — and as long
          as <code>getAge()</code> still returns the right number, nothing outside the class breaks.
        </>
      ),
    },
  ],
};

export default topic;
