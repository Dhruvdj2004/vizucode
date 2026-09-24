import { build, type Raw } from './build';

/** All permutations of `xs` — used by the checks to brute-force puzzle uniqueness. */
function perms<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

export const rawAnalytical: Raw[] = [
  // ───────── Puzzles & Arrangements ─────────
  {
    id: 'anal_001', t: 'Puzzles & Arrangements', s: 'Floor Puzzle', d: 'M',
    passage: 'P, Q, R, S and T live on floors 1 to 5 of a building, one person per floor (floor 1 is the lowest). S lives on the top floor. P lives on an even-numbered floor. Q lives immediately above R. T does not live on floor 1.',
    q: 'Who lives on floor 3?',
    o: ['P', 'Q', 'R', 'T'], a: 3,
    e: 'S = 5, so P is on 2 or 4. If P = 2, Q–R must be 4 over 3 and T lands on floor 1 — not allowed. So P = 4, leaving floors 1–3 for Q, R, T. With Q directly above R and T not on 1: R = 1, Q = 2, T = 3.',
    check: () => {
      const sols = perms(['P', 'Q', 'R', 'S', 'T']).filter((f) => {
        const fl = (x: string) => f.indexOf(x) + 1;
        return fl('S') === 5 && fl('P') % 2 === 0 && fl('Q') === fl('R') + 1 && fl('T') !== 1;
      });
      return sols.length === 1 && sols[0][2] === 'T';
    },
  },
  {
    id: 'anal_002', t: 'Puzzles & Arrangements', s: 'Matching Puzzle', d: 'M',
    passage: 'Anu, Bela, Chitra and Divya each own a different pet: a cat, a dog, a parrot or a fish. Bela owns neither the cat nor the fish. Chitra owns the dog. Anu does not own the parrot. Divya does not own the fish.',
    q: 'Who owns the fish?',
    o: ['Anu', 'Bela', 'Chitra', 'Divya'], a: 0,
    e: 'Chitra has the dog. Bela cannot have the cat or fish, so she has the parrot. That leaves the cat and fish for Anu and Divya; Divya cannot have the fish, so Divya has the cat and Anu has the fish.',
    check: () => {
      const people = ['Anu', 'Bela', 'Chitra', 'Divya'];
      const sols = perms(['cat', 'dog', 'parrot', 'fish']).filter((p) => {
        const has = (who: string) => p[people.indexOf(who)];
        return !['cat', 'fish'].includes(has('Bela')) && has('Chitra') === 'dog' && has('Anu') !== 'parrot' && has('Divya') !== 'fish';
      });
      return sols.length === 1 && sols[0][0] === 'fish';
    },
  },
  {
    id: 'anal_003', t: 'Puzzles & Arrangements', s: 'Mislabelled Boxes', d: 'H', fixed: true,
    q: 'Three boxes are labelled "Apples", "Oranges" and "Apples & Oranges". Every label is wrong. You may take out one fruit from one box without looking inside. Which box should you pick from so that you can then label all three boxes correctly?',
    o: ['The box labelled "Apples"', 'The box labelled "Oranges"', 'The box labelled "Apples & Oranges"', 'It is impossible with just one fruit'], a: 2,
    e: 'The "Apples & Oranges" box is mislabelled, so it holds only one kind. If you draw an apple, it is the Apples box. Then the box labelled "Oranges" cannot be oranges (wrong label) or apples (taken), so it is the mixed box, and the last box is oranges. The same logic works if you draw an orange.',
  },
  {
    id: 'anal_004', t: 'Puzzles & Arrangements', s: 'Code Puzzle', d: 'H',
    passage: 'A 4-digit PIN uses each of the digits 1, 2, 3 and 4 exactly once. The first digit is even. The digit 4 is not at either end. The digit 3 is immediately to the left of 1.',
    q: 'What is the PIN?',
    o: ['2431', '2314', '4312', '2413'], a: 0,
    e: 'The first digit is 2 or 4, but 4 cannot be at an end, so it starts with 2. The remaining 1, 3, 4 must keep "31" together with 4 not last: 4 then 31 gives 2431. (2314 puts 4 at the end.)',
    check: () => {
      const sols = perms([1, 2, 3, 4]).filter(
        (p) => p[0] % 2 === 0 && p[0] !== 4 && p[3] !== 4 && p.indexOf(1) === p.indexOf(3) + 1
      );
      return sols.length === 1 && sols[0].join('') === '2431';
    },
  },
  {
    id: 'anal_005', t: 'Puzzles & Arrangements', s: 'Stacking', d: 'H',
    passage: 'Five books — Maths, Physics, Chemistry, Biology and English — are stacked one on top of another. Chemistry is at the bottom. English is immediately above Biology. Maths is somewhere above Physics. Physics is not directly on top of Chemistry.',
    q: 'Which book is third from the top?',
    o: ['Maths', 'Physics', 'English', 'Biology'], a: 2,
    e: 'Positions 1 (top) to 5: Chemistry = 5, and Physics cannot be 4. English–Biology is a consecutive pair. Trying (1,2) forces Physics to 4 ✗; (2,3) leaves Maths 1, Physics 4 ✗; (3,4) leaves Maths 1, Physics 2 ✓. Order: Maths, Physics, English, Biology, Chemistry — English is third.',
    check: () => {
      const sols = perms(['M', 'P', 'C', 'B', 'E']).filter((s) => {
        const at = (x: string) => s.indexOf(x);
        return at('C') === 4 && at('B') === at('E') + 1 && at('M') < at('P') && at('P') !== 3;
      });
      return sols.length === 1 && sols[0][2] === 'E';
    },
  },
  {
    id: 'anal_006', t: 'Puzzles & Arrangements', s: 'Distribution', d: 'E',
    q: '₹100 is shared among A, B and C so that A gets ₹20 more than B, and B gets ₹10 more than C. How much does A get?',
    o: ['₹40', '₹45', '₹50', '₹55'], a: 2,
    e: 'Let C = x, then B = x + 10 and A = x + 30. 3x + 40 = 100 gives x = 20, so A = ₹50.',
    calc: 20 + 30,
  },

  // ───────── Scheduling & Selection ─────────
  {
    id: 'anal_007', t: 'Scheduling & Selection', s: 'Team Selection', d: 'M',
    passage: 'A team of 3 is chosen from A, B, C, D and E with these rules: A and B cannot both be selected. If C is selected, D must also be selected. E must be selected.',
    q: 'Which of the following is a valid team?',
    o: ['A, B, E', 'A, C, E', 'B, D, E', 'A, C, D'], a: 2,
    e: 'A, B, E breaks the A–B rule. A, C, E has C without D. A, C, D has no E. Only B, D, E satisfies every rule.',
  },
  {
    id: 'anal_008', t: 'Scheduling & Selection', s: 'Team Selection', d: 'H',
    passage: 'A team of 3 is chosen from A, B, C, D and E with these rules: A and B cannot both be selected. If C is selected, D must also be selected. E must be selected.',
    q: 'How many different valid teams are possible?',
    o: ['2', '3', '4', '5'], a: 1,
    e: 'E is fixed, so pick 2 more from A, B, C, D: AB ✗ (A with B), AC ✗ (C without D), AD ✓, BC ✗, BD ✓, CD ✓. That makes 3 valid teams.',
    check: () => {
      const xs = ['A', 'B', 'C', 'D'];
      let n = 0;
      for (let i = 0; i < 4; i++)
        for (let j = i + 1; j < 4; j++) {
          const t = [xs[i], xs[j]];
          if (t.includes('A') && t.includes('B')) continue;
          if (t.includes('C') && !t.includes('D')) continue;
          n++;
        }
      return n === 3;
    },
  },
  {
    id: 'anal_009', t: 'Scheduling & Selection', s: 'Weekly Schedule', d: 'H',
    passage: 'Five lectures — P, Q, R, S and T — are held Monday to Friday, one per day. R is on Wednesday. P is held on the day immediately before Q. S is not on Friday. T is held on some day after R.',
    q: 'Which lecture is on Thursday?',
    o: ['P', 'Q', 'S', 'T'], a: 2,
    e: 'With R on Wednesday, P–Q is either Mon–Tue or Thu–Fri. If P–Q were Thu–Fri, T would have to be on Mon or Tue, before R ✗. So P = Mon, Q = Tue, and S, T take Thu and Fri. S cannot be Friday, so S = Thursday and T = Friday.',
    check: () => {
      const sols = perms(['P', 'Q', 'R', 'S', 'T']).filter((d) => {
        const at = (x: string) => d.indexOf(x);
        return at('R') === 2 && at('Q') === at('P') + 1 && at('S') !== 4 && at('T') > at('R');
      });
      return sols.length === 1 && sols[0][3] === 'S';
    },
  },
  {
    id: 'anal_010', t: 'Scheduling & Selection', s: 'Time Calculation', d: 'E',
    q: 'A meeting lasts 2 hours 45 minutes and ends at 1:15 PM. When did it start?',
    o: ['10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM'], a: 1,
    e: '1:15 PM minus 2 hours is 11:15 AM; minus a further 45 minutes is 10:30 AM.',
  },
  {
    id: 'anal_011', t: 'Scheduling & Selection', s: 'Task Dependencies', d: 'M',
    q: 'A project has four tasks: A (3 days); B (2 days, can start after A); C (4 days, can start after A); D (1 day, can start only after both B and C). Tasks can run in parallel. What is the minimum time to finish the project?',
    o: ['7 days', '8 days', '9 days', '10 days'], a: 1,
    e: 'The longest (critical) path decides: A (3) → C (4) → D (1) = 8 days. B runs alongside C and finishes earlier, so it does not delay D.',
    calc: 3 + Math.max(2, 4) + 1,
  },
  {
    id: 'anal_012', t: 'Scheduling & Selection', s: 'Minimising Waiting Time', d: 'H',
    q: 'A clinic has one doctor. Four patients arrive together at 9:00 AM and need 10, 20, 30 and 40 minutes of consultation. If the doctor orders them to minimise the average waiting time (time before a consultation begins), what is that average?',
    o: ['25 minutes', '30 minutes', '35 minutes', '50 minutes'], a: 0,
    e: 'Serving the shortest first minimises waiting. Waits are 0, 10, 10 + 20 = 30 and 10 + 20 + 30 = 60 minutes. Average = 100/4 = 25 minutes.',
    check: () => {
      const avg = (o: number[]) => o.reduce((acc, _x, i) => acc + o.slice(0, i).reduce((a, b) => a + b, 0), 0) / o.length;
      return Math.min(...perms([10, 20, 30, 40]).map(avg)) === 25;
    },
  },
  {
    id: 'anal_013', t: 'Scheduling & Selection', s: 'Room Allocation', d: 'H',
    q: 'Five meetings are scheduled: 9:00–10:00, 9:30–11:00, 10:00–11:30, 11:00–12:00 and 11:15–12:30. A room freed at a given time can be used by a meeting starting at that same time. What is the minimum number of rooms needed?',
    o: ['2', '3', '4', '5'], a: 1,
    e: 'Count the overlap at each point. At 11:15–11:30 three meetings run together: 10:00–11:30, 11:00–12:00 and 11:15–12:30. No moment has four overlapping meetings, so 3 rooms suffice.',
    check: () => {
      const m = [[540, 600], [570, 660], [600, 690], [660, 720], [675, 750]];
      let best = 0;
      for (let t = 540; t < 750; t++) best = Math.max(best, m.filter(([s, e]) => s <= t && t < e).length);
      return best === 3;
    },
  },

  // ───────── Logical Deductions (conditions, case-based) ─────────
  {
    id: 'anal_014', t: 'Logical Deductions', s: 'Contrapositive', d: 'E',
    q: '"If it rains, the match is cancelled." The match was not cancelled. What can you conclude?',
    o: ['It rained', 'It did not rain', 'It may or may not have rained', 'The match was postponed'], a: 1,
    e: 'The contrapositive of "rain → cancelled" is "not cancelled → no rain". Since the match was not cancelled, it did not rain.',
  },
  {
    id: 'anal_015', t: 'Logical Deductions', s: 'Affirming the Consequent', d: 'M',
    q: '"Every student who scored above 90 got a scholarship." Riya got a scholarship. Which statement must be true?',
    o: ['Riya scored above 90', 'Riya did not score above 90', 'Riya may or may not have scored above 90', 'Nobody else got a scholarship'], a: 2,
    e: 'The rule says scoring above 90 guarantees a scholarship, not that a scholarship implies a score above 90 — others may have got one for other reasons. So Riya may or may not have scored above 90.',
  },
  {
    id: 'anal_016', t: 'Logical Deductions', s: 'Truth & Lies', d: 'H',
    q: 'A says, "B is lying." B says, "C is lying." C says, "A and B are both lying." Who is telling the truth?',
    o: ['Only A', 'Only B', 'Only C', 'A and C'], a: 1,
    e: 'If A were truthful, B lies, so C is truthful — but C says A lies, a contradiction. So A lies, meaning B is truthful, so C lies. Check C: "A and B both lie" is false because B is truthful ✓. Only B tells the truth.',
    check: () => {
      const sols: string[] = [];
      for (let m = 0; m < 8; m++) {
        const [a, b, c] = [!!(m & 1), !!(m & 2), !!(m & 4)];
        if (a === !b && b === !c && c === (!a && !b)) sols.push([a, b, c].map((x) => (x ? 'T' : 'F')).join(''));
      }
      return sols.length === 1 && sols[0] === 'FTF';
    },
  },
  {
    id: 'anal_017', t: 'Logical Deductions', s: 'Knights & Knaves', d: 'H',
    q: 'On an island, knights always tell the truth and knaves always lie. X says, "At least one of X and Y is a knave." What are X and Y?',
    o: ['Both knights', 'Both knaves', 'X is a knight, Y is a knave', 'X is a knave, Y is a knight'], a: 2,
    e: 'If X were a knave, his statement "at least one of us is a knave" would be true — impossible for a knave. So X is a knight, the statement is true, and since X is not a knave, Y must be.',
    check: () => {
      const sols: string[] = [];
      for (const x of [true, false]) for (const y of [true, false]) if (x === (!x || !y)) sols.push(`${x}${y}`);
      return sols.length === 1 && sols[0] === 'truefalse';
    },
  },
  {
    id: 'anal_018', t: 'Logical Deductions', s: 'Set Deduction', d: 'M',
    q: '"All managers attend the Monday meeting. Some engineers are managers." Which statement must be true?',
    o: ['All engineers attend the Monday meeting', 'Some engineers attend the Monday meeting', 'No engineer attends the Monday meeting', 'Only managers attend the Monday meeting'], a: 1,
    e: 'The engineers who are managers attend (every manager does), so at least some engineers attend. Nothing is said about the other engineers or about non-managers.',
  },
  {
    id: 'anal_019', t: 'Logical Deductions', s: 'Case-based Rules', d: 'M',
    q: 'Library rules: a member may borrow at most 3 books at a time; premium members may borrow up to 5; anyone with an overdue book cannot borrow until it is returned. Ria is a premium member with one overdue book and no other books out. How many new books can she borrow now?',
    o: ['0', '3', '4', '5'], a: 0,
    e: 'The overdue rule overrides the borrowing limits: until she returns the overdue book, Ria cannot borrow any new book (0), premium or not.',
  },

  // ───────── Pattern Recognition ─────────
  {
    id: 'anal_020', t: 'Pattern Recognition', s: 'Number Grid', d: 'M',
    table: { caption: 'Find the missing number', head: ['Col 1', 'Col 2', 'Col 3'], rows: [[2, 3, 6], [4, 5, 20], [3, 7, '?']] },
    q: 'Which number replaces the question mark?',
    o: ['10', '18', '21', '24'], a: 2,
    e: 'In each row, the third number is the product of the first two: 2 × 3 = 6, 4 × 5 = 20, so 3 × 7 = 21.',
    calc: 3 * 7,
  },
  {
    id: 'anal_021', t: 'Pattern Recognition', s: 'Number Grid', d: 'H',
    table: { caption: 'Find the missing number', head: ['Col 1', 'Col 2', 'Col 3'], rows: [[5, 3, 34], [4, 2, 20], [6, 1, '?']] },
    q: 'Which number replaces the question mark?',
    o: ['35', '36', '37', '42'], a: 2,
    e: 'The third number is the sum of the squares of the first two: 25 + 9 = 34, 16 + 4 = 20, so 36 + 1 = 37.',
    calc: 36 + 1,
  },
  {
    id: 'anal_022', t: 'Pattern Recognition', s: 'Symbol Operations', d: 'M',
    q: 'If 2 # 3 = 13 and 4 # 1 = 17, what is 3 # 2?',
    o: ['12', '13', '14', '15'], a: 1,
    e: 'a # b = a² + b²: 4 + 9 = 13 and 16 + 1 = 17. So 3 # 2 = 9 + 4 = 13.',
    calc: 9 + 4,
  },

  // ───────── Decision Making (incl. DI reasoning) ─────────
  {
    id: 'anal_023', t: 'Decision Making', s: 'Cost Comparison', d: 'M',
    q: 'Vendor X charges ₹50 per unit with a 5% defect rate. Vendor Y charges ₹54 per unit with a 1% defect rate. Handling each defective unit costs an extra ₹200. Which vendor is cheaper per unit, and by how much?',
    o: ['X, by ₹4', 'Y, by ₹4', 'Both cost the same', 'X, by ₹6'], a: 1,
    e: 'Effective cost X = 50 + 0.05 × 200 = ₹60. Y = 54 + 0.01 × 200 = ₹56. So the answer is Y, by ₹4 per unit.',
    check: () => 50 + 0.05 * 200 - (54 + 0.01 * 200) === 4,
  },
  {
    id: 'anal_024', t: 'Decision Making', s: 'Break-even', d: 'M',
    q: 'Plan A costs ₹500 per month plus ₹1 per minute of calls. Plan B costs ₹2 per minute with no fixed charge. Above how many minutes a month is Plan A cheaper?',
    o: ['250', '500', '750', '1000'], a: 1,
    e: 'A is cheaper when 500 + m < 2m, i.e. m > 500 minutes. At exactly 500 minutes both cost ₹1,000.',
    calc: 500,
  },
  {
    id: 'anal_025', t: 'Decision Making', s: 'Data Reasoning', d: 'H',
    table: { caption: 'Units sold in a week', head: ['Day', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], rows: [['Units', 40, 55, 35, 60, 70]] },
    q: 'Between which two consecutive days was the percentage change in sales the largest (in either direction)?',
    o: ['Mon → Tue', 'Tue → Wed', 'Wed → Thu', 'Thu → Fri'], a: 2,
    e: 'Changes: Mon→Tue +37.5%, Tue→Wed −36.4%, Wed→Thu +71.4% (25 on a base of 35), Thu→Fri +16.7%. The largest is Wed → Thu.',
    check: () => {
      const s = [40, 55, 35, 60, 70];
      const g = s.slice(1).map((v, i) => Math.abs(v / s[i] - 1));
      return g.indexOf(Math.max(...g)) === 2;
    },
  },
];

export default build('analytical', rawAnalytical);
