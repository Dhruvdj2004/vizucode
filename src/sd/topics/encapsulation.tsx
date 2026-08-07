import { Arrow, Box, Dg, Txt } from '../dgm';
import type { SdTopic } from '../types';

/** A BankAccount's private balance only reachable through validated methods. */
function EncapsulationDiagram() {
  return (
    <Dg w={560} h={240} cap="Callers can only reach balance through withdraw() and deposit(), never directly">
      <Box x={200} y={20} w={160} h={200} label="" c="a" ghost />
      <Txt x={280} y={40} fs={11} bold c="a">BankAccount</Txt>
      <Box x={220} y={60} w={120} h={40} label="- balance" sub="private" c="a" fs={11} />
      <Box x={220} y={150} w={120} h={40} label="+ withdraw()" c="b" fs={11} />

      <Box x={20} y={90} w={120} h={40} label="Caller" c="n" fs={12} />
      <Arrow x1={140} y1={110} x2={220} y2={110} c="c" plain />
      <Txt x={180} y={98} fs={10} soft>blocked ✕</Txt>

      <Box x={420} y={90} w={120} h={40} label="Caller" c="n" fs={12} />
      <Arrow x1={420} y1={130} x2={340} y2={170} c="b" label="withdraw(amt)" dx={20} dy={20} />
    </Dg>
  );
}

const topic: SdTopic = {
  slug: 'encapsulation',
  num: 29,
  unit: 'OOP Fundamentals',
  title: 'Encapsulation',
  blurb:
    'Bundle data with the methods that operate on it, and hide internal state behind a controlled interface.',
  minutes: 8,
  free: true,
  tags: ['OOP basics', 'Very common'],

  sections: [
    {
      id: 'analogy',
      heading: 'The medicine capsule analogy',
      blocks: [
        {
          k: 'note',
          tone: 'tip',
          title: 'Analogy',
          text: (
            <>
              Like a medicine capsule — you never handle the raw powder directly, you just swallow the capsule. The
              packaging controls exactly how you interact with what's inside, and prevents you from taking the wrong
              dose by accident.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              Encapsulation applies the same idea to code: an object's internal data is packaged behind methods that
              decide what changes are allowed.
            </>
          ),
        },
      ],
    },
    {
      id: 'how',
      heading: 'How it actually works',
      blocks: [
        { k: 'diagram', el: <EncapsulationDiagram />, caption: 'The private balance field can only be changed through withdraw(), which can validate before mutating.' },
        {
          k: 'p',
          text: (
            <>
              Fields are made <b>private</b>, so nothing outside the class can read or write them directly. Access
              happens only through public methods, which can validate input, log the change, or transform the value
              before it ever touches internal state.
            </>
          ),
        },
        {
          k: 'p',
          text: (
            <>
              This means the object can guarantee its own invariants — a <code>BankAccount</code> can guarantee its
              balance never goes negative, because every path that changes it goes through the same validation.
            </>
          ),
        },
      ],
    },
    {
      id: 'example',
      heading: 'A concrete example, and the common mistake',
      blocks: [
        {
          k: 'code',
          title: 'BankAccount.java (pseudo-Java)',
          code: `class BankAccount {
    private double balance;

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Invalid amount");
        if (amount > balance) throw new IllegalStateException("Insufficient funds");
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}`,
        },
        {
          k: 'p',
          text: (
            <>
              <code>balance</code> is private, so nothing can set it to a negative number by accident — every
              mutation is forced through <code>withdraw()</code>, which validates first.
            </>
          ),
        },
        {
          k: 'note',
          tone: 'warn',
          title: 'Watch out',
          text: (
            <>
              Getters/setters on every field that just pass the value through with no logic aren't real
              encapsulation — they're a workaround for having made everything private by convention only, without
              actually hiding or protecting anything.
            </>
          ),
        },
      ],
    },
  ],

  interview: [
    {
      q: 'What is encapsulation?',
      a: <>Bundling data with the methods that operate on it, and hiding internal state so it can only be changed through a controlled interface.</>,
    },
    {
      q: 'Why make fields private instead of public?',
      a: (
        <>
          So the object can validate every change to its state — a private field can only be mutated through methods
          that enforce invariants, preventing the object from ever being put into an invalid state.
        </>
      ),
    },
    {
      q: 'Is a class with only trivial getters and setters truly encapsulated?',
      a: (
        <>
          Not meaningfully — if every setter just assigns the value with no validation, the field is effectively
          public with extra steps. Real encapsulation means the methods enforce rules.
        </>
      ),
    },
    {
      q: 'How is encapsulation different from abstraction?',
      a: (
        <>
          Encapsulation is about hiding data via access control (private fields, controlled methods). Abstraction is
          about hiding complexity via design (interfaces, exposing only what's needed) — they're related but
          distinct.
        </>
      ),
    },
    {
      q: 'Give a real-world example of encapsulation.',
      a: (
        <>
          A <code>BankAccount</code> exposes <code>withdraw(amount)</code>, which checks for sufficient balance,
          instead of exposing the <code>balance</code> field directly for any caller to mutate.
        </>
      ),
    },
    {
      q: 'What invariant does encapsulation let an object guarantee?',
      a: (
        <>
          Any rule the object's methods enforce on every mutation path — e.g. balance never goes negative — because
          there's no other way to change that state that bypasses the check.
        </>
      ),
    },
  ],
};

export default topic;
