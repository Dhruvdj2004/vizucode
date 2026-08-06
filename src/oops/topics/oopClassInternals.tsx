import { Arrow, Box, Cell, ClassBox, Dg, Frame, Txt } from '../dgm';
import type { OopTopic } from '../types';

/** One shared static member versus one copy per object. */
function StaticVsInstance() {
  return (
    <Dg w={600} h={236} cap="name lives in each object; count lives once, in the class">
      <Box x={196} y={20} w={208} h={44} label="static int count = 3" sub="ONE copy, owned by the class" c="c" />
      <Arrow x1={240} y1={64} x2={110} y2={104} c="c" dashed />
      <Arrow x1={300} y1={64} x2={300} y2={104} c="c" dashed />
      <Arrow x1={360} y1={64} x2={490} y2={104} c="c" dashed />

      <ClassBox x={40} y={106} w={140} name="student a" members={['name = "Aarav"']} c="b" headH={26} />
      <ClassBox x={230} y={106} w={140} name="student b" members={['name = "Diya"']} c="b" headH={26} />
      <ClassBox x={420} y={106} w={140} name="student c" members={['name = "Meera"']} c="b" headH={26} />

      <Txt x={300} y={196} fs={10.5} soft>
        name is each student's own notebook · count is the one attendance board on the wall
      </Txt>
      <Txt x={300} y={222} fs={10.5} bold c="c">
        Student::count works with no object at all
      </Txt>
    </Dg>
  );
}

/** Stack vs heap allocation and who is responsible for cleanup. */
function StackVsHeap() {
  return (
    <Dg w={608} h={244} cap="The stack cleans up after you; the heap does not">
      <Frame x={2} y={8} w={292} h={228} label="STACK" c="b" />
      <Cell x={70} y={48} w={156} h={38} label="Student s;" c="b" />
      <Txt x={148} y={112} fs={10.5} soft>
        created when the line runs
      </Txt>
      <Txt x={148} y={132} fs={10.5} soft>
        destroyed at the closing brace
      </Txt>
      <Txt x={148} y={168} fs={11} bold c="b">
        automatic — destructor guaranteed
      </Txt>
      <Txt x={148} y={200} fs={10} soft>
        fast, size known at compile time
      </Txt>

      <Frame x={314} y={8} w={292} h={228} label="HEAP" c="a" />
      <Cell x={340} y={48} w={110} h={38} label="s ●───┐" c="n" />
      <Arrow x1={452} y1={67} x2={492} y2={67} c="a" />
      <Cell x={496} y={48} w={96} h={38} label="Student" c="a" />
      <Txt x={460} y={112} fs={10.5} soft>
        created by new, lives until…
      </Txt>
      <Txt x={460} y={132} fs={10.5} bold c="c">
        …you call delete — your job
      </Txt>
      <Txt x={460} y={168} fs={11} bold c="c">
        forget it and the memory leaks
      </Txt>
      <Txt x={460} y={200} fs={10} soft>
        size and lifetime decided at runtime
      </Txt>
    </Dg>
  );
}

const topic: OopTopic = {
  slug: 'oop-class-internals',
  num: 4,
  unit: 'Polymorphism & Internals',
  title: 'static, this, friend, inline & Dynamic Memory',
  blurb:
    'Members that belong to the class rather than the object, the hidden self-pointer, controlled breaches of encapsulation, and manual heap management.',
  minutes: 13,
  tags: ['Very common'],

  sections: [
    {
      id: 'static',
      heading: 'The static keyword',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A static member belongs to the <b>class</b>, not to any object — one single shared copy, existing even
              before any object is created.
            </>
          ),
        },
        { k: 'diagram', el: <StaticVsInstance />, caption: 'Three objects, three names — but one count.' },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
public:
    static int count;            // ONE copy shared by ALL students
    string name;                 // ordinary member: one copy PER student

    Student() { count++; }       // every birth bumps the shared counter

    static void show() {         // static function: call without any object
        cout << "Total: " << count;
        // cout << name;          error! Which student's name? There is no object,
    }                            // no 'this' - statics can only touch statics
};

int Student::count = 0;          // static variables are DEFINED outside the class

Student a, b, c;
cout << Student::count;          // 3 - accessed via the class name, no object needed
Student::show();`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: "Why can't a static function use non-static members?",
          text: (
            <>
              Because a static function is called on the <b>class</b>, so there is no object and therefore no{' '}
              <code>this</code> pointer. <code>name</code> only means something relative to a particular object —
              and there isn't one.
            </>
          ),
        },
      ],
    },

    {
      id: 'this',
      heading: 'The this pointer',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Inside every non-static member function, <code>this</code> is a hidden pointer holding the address of
              the object the function was called on — the word for "myself".
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `class Student {
    int age;
public:
    void setAge(int age) {
        this->age = age;         // MY age = the parameter
    }                            // without 'this', both sides mean the parameter!

    Student& grow() {
        age++;
        return *this;            // return myself -> enables chaining:
    }                            //   s.grow().grow().grow();
};`,
        },
        {
          k: 'ul',
          items: [
            <>
              <b>Job 1</b> — resolve the name clash between a data member and a parameter of the same name.
            </>,
            <>
              <b>Job 2</b> — return the current object (<code>*this</code>) so calls can be chained.
            </>,
            <>
              It does <b>not exist</b> in static functions: no object, no "myself".
            </>,
          ],
        },
      ],
    },

    {
      id: 'friend',
      heading: 'Friend functions and friend classes',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>friend function</b> is an outside function that a class explicitly trusts with its private
              members — like giving a trusted neighbour a key to your house.
            </>
          ),
        },
        {
          k: 'code',
          title: 'Friend function',
          code: `class Student {
private:
    int marks = 95;

    friend void display(Student s);   // the class grants the key - note:
};                                    // declared INSIDE, but it is not a member

void display(Student s) {             // an ordinary outside function...
    cout << s.marks;                  // ...yet it reads private data legally
}`,
        },
        {
          k: 'ul',
          items: [
            <>
              Friendship must be <b>granted by the class itself</b> — you cannot demand it from outside.
            </>,
            <>
              A friend is called normally (<code>display(s)</code>, not <code>s.display()</code>) and has no{' '}
              <code>this</code>.
            </>,
            <>
              The classic legitimate use is overloading <code>operator&lt;&lt;</code> for printing, where the left
              operand is the stream rather than your object.
            </>,
          ],
        },
        {
          k: 'code',
          title: 'Friend class',
          code: `class Engine {
private:
    int temperature = 90;
    friend class Mechanic;        // the whole Mechanic class gets access
};

class Mechanic {
public:
    void check(Engine& e) {
        cout << e.temperature;    // legal - Mechanic is a friend
    }
};`,
        },
        {
          k: 'note',
          tone: 'exam',
          title: 'The two facts interviewers check',
          text: (
            <>
              Friendship is <b>not mutual</b> — Engine cannot see Mechanic's privates unless Mechanic also declares
              it — and <b>not inherited</b> — Mechanic's child classes get nothing.
            </>
          ),
        },
      ],
    },

    {
      id: 'inline',
      heading: 'Inline functions',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              A <b>request</b> to the compiler: "instead of jumping to this function, paste its body directly at the
              call site", saving the small cost of a function call for very small functions.
            </>
          ),
        },
        {
          k: 'code',
          title: 'C++',
          code: `inline int square(int x) {
    return x * x;
}

int y = square(5);      // the compiler may turn this into:  int y = 5 * 5;`,
        },
        {
          k: 'ul',
          items: [
            <>
              <code>inline</code> is a <b>suggestion</b>, not a command — the compiler freely ignores it for large
              functions, and freely inlines without it.
            </>,
            <>
              Functions defined <b>inside a class body</b> are implicitly inline.
            </>,
            <>
              Overusing it bloats the executable, since the body is copied to every call site.
            </>,
          ],
        },
      ],
    },

    {
      id: 'dynamic-memory',
      heading: 'Dynamic memory allocation',
      blocks: [
        {
          k: 'p',
          text: (
            <>
              Creating objects on the <b>heap</b> at runtime with <code>new</code>, when sizes or lifetimes are not
              known in advance — and taking responsibility for freeing them with <code>delete</code>.
            </>
          ),
        },
        { k: 'diagram', el: <StackVsHeap />, caption: 'Where an object lives decides who cleans it up.' },
        {
          k: 'code',
          title: 'C++',
          code: `Student* s = new Student();      // allocate on heap + run constructor
s->name = "Aarav";
delete s;                        // run destructor + free the memory - YOUR job

int* arr = new int[100];         // dynamic array
delete[] arr;                    // arrays need delete[]  (plain delete = UB)`,
        },
        {
          k: 'ul',
          items: [
            <>
              Forget <code>delete</code> → a <b>memory leak</b>: the memory is lost until the program exits.
            </>,
            <>
              Delete twice → undefined behaviour, usually a crash.
            </>,
            <>
              This manual bookkeeping is exactly what Java's garbage collector automates, and why modern C++ prefers{' '}
              <b>smart pointers</b> (<code>unique_ptr</code>, <code>shared_ptr</code>) that call delete for you.
            </>,
          ],
        },
        {
          k: 'table',
          head: ['', 'new / delete', 'malloc / free'],
          rows: [
            ['What it is', 'A C++ operator', 'A C library function'],
            ['Constructor / destructor', 'Calls them', 'Does not — raw bytes only'],
            ['Return type', 'The correct pointer type', 'void* — you must cast'],
            ['On failure', 'Throws bad_alloc', 'Returns NULL'],
            ['Sizing', 'Computed automatically', 'You pass sizeof yourself'],
          ],
        },
        {
          k: 'note',
          tone: 'warn',
          text: (
            <>
              Never mix the pairs. <code>new</code> must be matched with <code>delete</code>,{' '}
              <code>new[]</code> with <code>delete[]</code>, and <code>malloc</code> with <code>free</code>. Mixing
              them skips a constructor or destructor and is undefined behaviour.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What does the static keyword mean for a class member?',
      a: (
        <>
          The member belongs to the <b>class</b>, not to any object: one shared copy that exists even before any
          object is created and is accessed as <code>ClassName::member</code>. A static function can be called
          without an object.
        </>
      ),
    },
    {
      q: 'Why can a static member function not access non-static members?',
      a: (
        <>
          Because it is called on the class, so no object exists and there is no <code>this</code> pointer.
          Non-static members only have meaning relative to a particular object.
        </>
      ),
    },
    {
      q: 'What is the this pointer and what is it used for?',
      a: (
        <>
          A hidden pointer inside every non-static member function holding the address of the object the function
          was called on. Its two everyday uses are disambiguating a member from a same-named parameter (
          <code>this-&gt;age = age</code>) and returning <code>*this</code> to allow method chaining.
        </>
      ),
    },
    {
      q: 'What is a friend function, and does it break encapsulation?',
      a: (
        <>
          An external function that a class explicitly grants access to its private members. It is a{' '}
          <b>controlled</b> breach, not a broken one: the class itself decides who is trusted, and the grant is
          visible in the class definition. The main legitimate use is operator overloading where your object is not
          the left operand.
        </>
      ),
    },
    {
      q: 'Is friendship inherited or mutual?',
      a: (
        <>
          Neither. If A declares B a friend, B's <b>derived classes</b> get no access, and <b>A</b> gets no access
          to B's privates unless B declares A a friend in return.
        </>
      ),
    },
    {
      q: 'What does inline do?',
      a: (
        <>
          It <b>requests</b> that the compiler replace a call with the function's body, avoiding call overhead for
          very small functions. It is only a hint — the compiler may ignore it, and it inlines plenty of functions
          not marked inline. Functions defined inside a class body are implicitly inline.
        </>
      ),
    },
    {
      q: 'Difference between new and malloc?',
      a: (
        <>
          <code>new</code> is a C++ operator: it allocates <b>and calls the constructor</b>, returns the correct
          pointer type, throws <code>bad_alloc</code> on failure, and pairs with <code>delete</code> (which calls
          the destructor). <code>malloc</code> is a C function: raw bytes only, no constructor, returns{' '}
          <code>void*</code>, returns NULL on failure, and pairs with <code>free</code>.
        </>
      ),
    },
    {
      q: 'Why does delete[] exist separately from delete?',
      a: (
        <>
          For an array, the runtime must call the destructor for <b>every</b> element, so it needs to know the
          element count. <code>delete[]</code> reads that bookkeeping; plain <code>delete</code> does not, and using
          it on an array is undefined behaviour.
        </>
      ),
    },
    {
      q: 'Stack vs heap objects?',
      a: (
        <>
          <b>Stack</b> objects are created when their declaration runs and destroyed automatically at the end of
          scope — fast, and the destructor is guaranteed. <b>Heap</b> objects are created with <code>new</code> and
          live until you <code>delete</code> them — flexible lifetime and runtime-decided size, but you own the
          cleanup and can leak.
        </>
      ),
    },
    {
      q: 'What is a memory leak and how do you avoid it in modern C++?',
      a: (
        <>
          Heap memory that is never freed, so it stays occupied until the process exits. Avoid it with <b>RAII</b> —
          let a destructor own the release — and in practice by using <code>unique_ptr</code> or{' '}
          <code>shared_ptr</code> instead of raw <code>new</code>/<code>delete</code>.
        </>
      ),
    },
  ],
};

export default topic;
