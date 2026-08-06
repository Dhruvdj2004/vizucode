import { Arrow, ClassBox, Dg, Frame, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** One blueprint, three independent instances. */
function ClassVsObject() {
  return (
    <Dg w={608} h={232} cap="The class takes no memory; each object gets its own copy of every data member">
      <ClassBox x={20} y={44} w={168} name="Student" members={['string name;', 'int age;', 'void display();']} c="a" />
      <Txt x={104} y={168} fs={10.5} soft>
        the blueprint — a description
      </Txt>
      <Txt x={104} y={186} fs={10.5} soft>
        nobody can live in a drawing
      </Txt>

      <Arrow x1={194} y1={80} x2={244} y2={62} c="c" />
      <Arrow x1={194} y1={92} x2={244} y2={112} c="c" />
      <Arrow x1={194} y1={104} x2={244} y2={162} c="c" />
      <Txt x={218} y={128} fs={10} bold c="c">
        new
      </Txt>

      <ClassBox x={248} y={38} w={162} name="s1" members={['"Aarav"', '20']} c="b" headH={26} />
      <ClassBox x={248} y={112} w={162} name="s2" members={['"Diya"', '22']} c="b" headH={26} />
      <ClassBox x={430} y={38} w={162} name="s3" members={['"Meera"', '21']} c="b" headH={26} />

      <Txt x={430} y={140} anchor="start" fs={10.5} soft>
        three objects, three
      </Txt>
      <Txt x={430} y={158} anchor="start" fs={10.5} soft>
        separate copies of the
      </Txt>
      <Txt x={430} y={176} anchor="start" fs={10.5} soft>
        data — changing s1.name
      </Txt>
      <Txt x={430} y={194} anchor="start" fs={10.5} soft>
        touches nothing else
      </Txt>
    </Dg>
  );
}

/** Who can reach a public, private or protected member. */
function AccessScope() {
  return (
    <Dg w={580} h={250} cap="Three concentric levels of visibility">
      <Frame x={2} y={8} w={576} h={232} label="OUTSIDE — through an object" c="n" />
      <Txt x={290} y={44} fs={10.5} bold c="n">
        can reach: public only
      </Txt>
      <Frame x={54} y={58} w={472} h={168} label="DERIVED (CHILD) CLASS" c="b" />
      <Txt x={290} y={94} fs={10.5} bold c="b">
        can reach: public + protected
      </Txt>
      <Frame x={112} y={108} w={356} h={106} label="INSIDE THE CLASS ITSELF" c="a" />
      <Txt x={290} y={150} fs={11} bold c="a">
        can reach: public + protected + private
      </Txt>
      <Txt x={290} y={186} fs={10.5} soft>
        public = open door · protected = family room · private = locked room
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-basics',
  num: 1,
  unit: 'Fundamentals',
  title: 'Class, Object, Constructor, Destructor & Access',
  blurb:
    'The five foundations everything else rests on — blueprint vs instance, the three constructor types, why destructors exist, and who can see what.',
  minutes: 14,
  free: true,
  tags: ['Very common', 'Start here'],

  sections: [
    {
      id: 'class-object',
      heading: 'Class and object',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>class</b> is a blueprint — a description of what data a thing holds and what actions it can
              perform. It uses <b>no memory by itself</b>. An <b>object</b> is a real instance built from that
              blueprint, with its own copy of every data member.
            </>
          ),
        },
        { k: 'diagram', el: <ClassVsObject />, caption: 'Like a house blueprint: the drawing describes rooms and doors, but nobody can live in a drawing.' },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
public:
    string name;                 // data member
    int age;

    void display() {             // member function
        cout << name << " " << age;
    }
};   // <- note: a class definition ends with a semicolon in C++

Student s1;                      // object on the STACK (destroyed automatically)
s1.name = "Aarav";
s1.display();

Student* s2 = new Student();     // object on the HEAP (you must delete it)
s2->name = "Diya";               // a pointer uses ->  instead of  .
delete s2;                       // manual cleanup`,
        },
        {
          k: 'note',
          tone: 'tip',
          text: (
            <>
              Use the dot <code>.</code> with a normal object and the arrow <code>-&gt;</code> with a pointer to
              one. Two objects never share data members — changing <code>s1.name</code> does not touch any other
              Student.
            </>
          ),
        },
      ],
    },

    {
      id: 'constructor',
      heading: 'Constructor',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A special function that runs <b>automatically the moment an object is created</b>. Its job is to put
              the object into a valid starting state. How to recognise one: <b>same name as the class, no return
              type</b> — not even <code>void</code>.
            </>
          ),
        },
        {
          k: 'code',
          title: 'The three types',
          code: `class Student {
public:
    string name;
    int age;

    // 1) DEFAULT constructor - no parameters
    Student() {
        name = "Unknown";
        age = 0;
    }

    // 2) PARAMETERIZED constructor - takes values at creation time
    Student(string n, int a) {
        name = n;
        age = a;
    }

    // 3) COPY constructor - builds a new object as a clone of an existing one
    Student(Student &obj) {          // takes the other object BY REFERENCE
        name = obj.name;
        age = obj.age;
    }
};

Student a;                    // default runs
Student b("Aarav", 20);       // parameterized runs
Student c(b);                 // copy constructor runs (c is a clone of b)
Student d = b;                // copy constructor runs here TOO`,
        },
        {
          k: 'p',
          text: (
            <>
              Having all three together is <b>constructor overloading</b> — several constructors told apart by their
              parameter lists.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'When exactly does the copy constructor run?',
          text: (
            <>
              Three situations: <b>(1)</b> <code>Student c(b);</code> or <code>Student c = b;</code>, <b>(2)</b>{' '}
              passing an object to a function <i>by value</i>, <b>(3)</b> returning an object <i>by value</i>. It
              must take its argument <b>by reference</b> — taking it by value would itself require a copy, which is
              an infinite regress.
            </>
          ),
        },
      ],
    },

    {
      id: 'destructor',
      heading: 'Destructor',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              The opposite of a constructor: it runs <b>automatically when an object is destroyed</b>, and its job
              is cleanup — freeing memory, closing files, releasing connections.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
public:
    Student()  { cout << "Constructor\\n"; }
    ~Student() { cout << "Destructor\\n"; }    // tilde ~ + class name, no params
};

int main() {
    Student s;        // "Constructor" prints here
}                     // s goes out of scope -> "Destructor" prints automatically`,
        },
        {
          k: 'ul',
          items: [
            <>
              A class has exactly <b>one</b> destructor. It takes no parameters and returns nothing, so there is
              nothing to overload on. Constructors: many. Destructor: one.
            </>,
            <>
              If a constructor acquired resources (heap memory with <code>new</code>, an open file, a socket),
              something must release them or they leak — the destructor is the guaranteed place.
            </>,
            <>
              Destruction runs in <b>reverse order</b> of construction, and for inheritance the child destructor
              runs before the parent's.
            </>,
          ],
        },
      ],
    },

    {
      id: 'access',
      heading: 'Access specifiers',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Three visibility levels deciding who may touch a member: everyone (<code>public</code>), only the class
              itself (<code>private</code>), or the class plus its children (<code>protected</code>).
            </>
          ),
        },
        { k: 'diagram', el: <AccessScope />, caption: 'Each ring can reach everything inside it, and nothing further in.' },
        {
          k: 'table',
          head: ['Accessible from…', 'public', 'private', 'protected'],
          rows: [
            ['Inside the same class', '✓', '✓', '✓'],
            ['Inside a derived (child) class', '✓', '✗', '✓'],
            ['Outside, through an object', '✓', '✗', '✗'],
          ],
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'class vs struct in C++',
          text: (
            <>
              The <b>only</b> real difference: members of a <code>class</code> are <b>private</b> by default, and
              members of a <code>struct</code> are <b>public</b> by default. Everything else — methods,
              constructors, inheritance — works identically in both.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'Difference between a class and an object?',
      a: (
        <>
          A <b>class</b> is a blueprint describing data and behaviour, and consumes no memory itself. An{' '}
          <b>object</b> is a concrete instance of that blueprint with its own copy of every data member. One class,
          many independent objects.
        </>
      ),
    },
    {
      q: 'What is a constructor?',
      a: (
        <>
          A member function with the class's name and <b>no return type</b>, invoked automatically at object
          creation to initialise it. Think of it as the account-opening procedure at a bank — you cannot get an
          account without going through it.
        </>
      ),
    },
    {
      q: "Why can't a constructor have a return type?",
      a: (
        <>
          Because you never call it yourself and there is nowhere for a returned value to go — the compiler invokes
          it during <code>Student s;</code> and the "result" <i>is</i> the constructed object. Having no return type
          is also how the compiler distinguishes a constructor from an ordinary member function.
        </>
      ),
    },
    {
      q: 'Constructor vs method?',
      a: (
        <>
          Constructor: the class's own name, no return type, called automatically exactly once per object, cannot be
          virtual. Method: any name, has a return type, called manually as often as you like, can be virtual.
        </>
      ),
    },
    {
      q: 'What is constructor chaining?',
      a: (
        <>
          One constructor calling another so setup code is written once. In C++ that is a{' '}
          <b>delegating constructor</b>: <code>Student() : Student("Unknown", 0) {'{}'}</code>. In inheritance,
          chaining also means the base constructor always runs before the derived one.
        </>
      ),
    },
    {
      q: 'When is the copy constructor called?',
      a: (
        <>
          When an object is initialised from another (<code>Student c = b;</code>), when one is passed to a function{' '}
          <b>by value</b>, and when one is returned <b>by value</b>. It takes its parameter by reference, because
          by value would need a copy to make the copy.
        </>
      ),
    },
    {
      q: 'Can a destructor be overloaded?',
      a: (
        <>
          <b>No.</b> A class has exactly one destructor — it takes no parameters and has no return type, so there is
          no signature to vary. Constructors can be overloaded freely; the destructor cannot.
        </>
      ),
    },
    {
      q: 'Why do we need a destructor at all?',
      a: (
        <>
          Because if a constructor acquired a resource — heap memory, a file handle, a lock — someone must release
          it or it leaks. The destructor is the one place guaranteed to run when the object dies, which is the basis
          of the RAII pattern in C++.
        </>
      ),
    },
    {
      q: 'public vs private vs protected?',
      a: (
        <>
          <b>Public</b>: reachable from anywhere. <b>Private</b>: only from inside the class. <b>Protected</b>: from
          inside the class and from derived classes, but not from outside through an object. Open door, locked room,
          family room.
        </>
      ),
    },
    {
      q: 'Default access in a class vs a struct?',
      a: (
        <>
          <code>class</code> members default to <b>private</b>; <code>struct</code> members default to{' '}
          <b>public</b>. That is the only meaningful difference between the two in C++.
        </>
      ),
    },
  ],
};

export default topic;
