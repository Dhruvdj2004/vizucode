import { build, type Raw } from './build';

const SYL: [string, string, string, string] = [
  'Only conclusion I follows',
  'Only conclusion II follows',
  'Both I and II follow',
  'Neither I nor II follows',
];
const DS: [string, string, string, string] = [
  'Statement I alone is sufficient',
  'Statement II alone is sufficient',
  'Both statements together are needed',
  'Both statements together are not sufficient',
];

export const rawLogical: Raw[] = [
  // ───────── Series ─────────
  {
    id: 'logic_001', t: 'Series', s: 'Number Series', d: 'E',
    q: 'Find the next number: 2, 6, 12, 20, 30, ?',
    o: ['40', '42', '44', '48'], a: 1,
    e: 'The differences are 4, 6, 8, 10, so the next difference is 12: 30 + 12 = 42. (Each term is n(n + 1): 1×2, 2×3, …, 6×7 = 42.)',
    calc: 6 * 7,
  },
  {
    id: 'logic_002', t: 'Series', s: 'Number Series', d: 'E',
    q: 'Find the next number: 3, 9, 27, 81, ?',
    o: ['162', '216', '243', '324'], a: 2,
    e: 'Each term is 3 times the previous one: 81 × 3 = 243.',
    calc: 81 * 3,
  },
  {
    id: 'logic_003', t: 'Series', s: 'Number Series', d: 'M',
    q: 'Find the next number: 5, 11, 23, 47, 95, ?',
    o: ['143', '181', '190', '191'], a: 3,
    e: 'Each term is double the previous term plus 1: 5×2+1 = 11, 11×2+1 = 23, …, 95×2+1 = 191.',
    calc: 95 * 2 + 1,
  },
  {
    id: 'logic_004', t: 'Series', s: 'Interleaved Series', d: 'H',
    q: 'Find the missing number: 10, 3, 12, 6, 14, 12, 16, ?',
    o: ['18', '20', '24', '36'], a: 2,
    e: 'Two series are interleaved. Odd positions: 10, 12, 14, 16 (+2 each). Even positions: 3, 6, 12, ? (×2 each), so the missing term is 24.',
    calc: 12 * 2,
  },
  {
    id: 'logic_005', t: 'Series', s: 'Wrong Term', d: 'H',
    q: 'Find the wrong number in the series: 2, 5, 10, 17, 26, 38, 50',
    o: ['17', '26', '38', '50'], a: 2,
    e: 'The terms follow n² + 1: 1+1, 4+1, 9+1, 16+1, 25+1, 36+1, 49+1 = 2, 5, 10, 17, 26, 37, 50. So 38 is wrong; it should be 37.',
    check: () => [2, 5, 10, 17, 26, 37, 50].every((v, i) => v === (i + 1) ** 2 + 1),
  },
  {
    id: 'logic_006', t: 'Series', s: 'Alphabet Series', d: 'M',
    q: 'Find the next letter: A, C, F, J, O, ?',
    o: ['T', 'U', 'V', 'S'], a: 1,
    e: 'The gaps increase by one each time: A(+2)C(+3)F(+4)J(+5)O(+6) → O is the 15th letter, and 15 + 6 = 21, which is U.',
    check: () => String.fromCharCode(64 + 15 + 6) === 'U',
  },
  {
    id: 'logic_007', t: 'Series', s: 'Alphanumeric Series', d: 'E',
    q: 'Find the next term: B2, D4, F8, H16, ?',
    o: ['I32', 'J32', 'J24', 'K32'], a: 1,
    e: 'The letters skip one each time (B, D, F, H, J) and the numbers double (2, 4, 8, 16, 32). The next term is J32.',
  },
  {
    id: 'logic_008', t: 'Series', s: 'Alphabet Series', d: 'E',
    q: 'Find the next term: AZ, BY, CX, DW, ?',
    o: ['EV', 'EU', 'FV', 'VE'], a: 0,
    e: 'The first letter moves forward (A, B, C, D, E) while the second moves backward (Z, Y, X, W, V). The next pair is EV.',
  },

  // ───────── Coding-Decoding ─────────
  {
    id: 'logic_009', t: 'Coding-Decoding', s: 'Letter Shift', d: 'E',
    q: 'If CAT is coded as DBU, how is DOG coded in the same language?',
    o: ['EPH', 'EOH', 'CNF', 'FQI'], a: 0,
    e: 'Each letter is shifted one place forward: C→D, A→B, T→U. So D→E, O→P, G→H gives EPH.',
  },
  {
    id: 'logic_010', t: 'Coding-Decoding', s: 'Reverse & Shift', d: 'M',
    q: 'In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?',
    o: ['SHFDQ', 'QDFHS', 'UJHFS', 'RDFHS'], a: 1,
    e: 'The word is reversed and each letter is moved one step back: MONKEY → YEKNOM → XDJMNL. For TIGER: reversed = REGIT, one step back → QDFHS.',
    check: () => {
      const enc = (w: string) => [...w].reverse().map((c) => String.fromCharCode(c.charCodeAt(0) - 1)).join('');
      return enc('MONKEY') === 'XDJMNL' && enc('TIGER') === 'QDFHS';
    },
  },
  {
    id: 'logic_011', t: 'Coding-Decoding', s: 'Letter Values', d: 'E',
    q: 'If A = 1, B = 2, …, Z = 26 and CAT = 24, what is the value of DOG?',
    o: ['24', '25', '26', '27'], a: 2,
    e: 'CAT = 3 + 1 + 20 = 24. Likewise DOG = 4 + 15 + 7 = 26.',
    calc: 4 + 15 + 7,
  },
  {
    id: 'logic_012', t: 'Coding-Decoding', s: 'Sentence Codes', d: 'H',
    q: 'In a code language, "sky is blue" is written as "ta pa ka", "blue is colour" as "pa ma ta", and "colour of sky" as "ma ra ka". What is the code for "of"?',
    o: ['ma', 'ka', 'ra', 'pa'], a: 2,
    e: 'Sentences 1 and 2 share "is" and "blue" → {ta, pa}, so "sky" = ka. Sentences 2 and 3 share "colour" → ma. In sentence 3, "colour of sky" = "ma ra ka": colour = ma, sky = ka, so "of" = ra.',
  },

  // ───────── Blood Relations ─────────
  {
    id: 'logic_013', t: 'Blood Relations', s: 'Pointing', d: 'E',
    q: 'Pointing to a man, Riya said, "He is the son of my grandfather\'s only son." How is the man related to Riya?',
    o: ['Cousin', 'Brother', 'Uncle', 'Nephew'], a: 1,
    e: 'Her grandfather\'s only son is her father. The son of her father is her brother.',
  },
  {
    id: 'logic_014', t: 'Blood Relations', s: 'Family Chain', d: 'M',
    q: 'A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?',
    o: ['Father', 'Grandfather', 'Uncle', 'Brother'], a: 2,
    e: 'A, B and C are siblings. C is D\'s father, so C\'s brother A is D\'s uncle.',
  },
  {
    id: 'logic_015', t: 'Blood Relations', s: 'Coded Relations', d: 'H',
    q: 'P + Q means P is the mother of Q; P − Q means P is the brother of Q; P × Q means P is the father of Q. In the expression A + B − C × D, how is A related to D?',
    o: ['Mother', 'Grandmother', 'Aunt', 'Sister'], a: 1,
    e: 'A + B: A is B\'s mother. B − C: B is C\'s brother, so A is also C\'s mother. C × D: C is D\'s father. So A is the mother of D\'s father — D\'s grandmother.',
  },
  {
    id: 'logic_016', t: 'Blood Relations', s: 'Introductions', d: 'M',
    q: 'Introducing a woman, Arun said, "Her mother is the only daughter of my mother." How is Arun related to the woman?',
    o: ['Father', 'Brother', 'Maternal uncle', 'Cousin'], a: 2,
    e: 'The only daughter of Arun\'s mother is Arun\'s sister. The woman is his sister\'s daughter, so Arun is her maternal uncle.',
  },

  // ───────── Direction Sense ─────────
  {
    id: 'logic_017', t: 'Direction Sense', s: 'Final Position', d: 'E',
    q: 'A man walks 5 km north, turns right and walks 3 km, then turns right again and walks 5 km. Where is he now with respect to his starting point?',
    o: ['3 km east', '3 km west', '5 km south', '8 km east'], a: 0,
    e: 'North 5, then right (east) 3, then right (south) 5. The north and south legs cancel, leaving him 3 km east of the start.',
  },
  {
    id: 'logic_018', t: 'Direction Sense', s: 'Distance & Direction', d: 'M',
    q: 'Ravi walks 10 m south, turns left and walks 20 m, turns left again and walks 10 m, then turns right and walks 5 m. How far is he from his starting point, and in which direction?',
    o: ['25 m east', '25 m west', '15 m east', '20 m north'], a: 0,
    e: 'Facing south, a left turn faces east: he walks 20 m east. Another left faces north: 10 m back to the starting row. A right turn faces east again: 5 m. Net: 25 m east of the start.',
  },
  {
    id: 'logic_019', t: 'Direction Sense', s: 'Distance & Direction', d: 'M',
    q: 'Sita walks 4 km east, then 6 km north, then 4 km east again. How far is she from the start, and in which direction?',
    o: ['10 km north-east', '14 km east', '10 km north-west', '8 km north-east'], a: 0,
    e: 'Net displacement is 8 km east and 6 km north. Distance = √(8² + 6²) = 10 km, towards the north-east — so 10 km north-east.',
    check: () => Math.hypot(4 + 4, 6) === 10,
  },
  {
    id: 'logic_020', t: 'Direction Sense', s: 'Shadows', d: 'H',
    q: 'One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. Which direction was he facing?',
    o: ['North', 'South', 'East', 'West'], a: 1,
    e: 'In the morning the sun is in the east, so shadows fall towards the west. The shadow is on his right, so his right hand points west — which means he is facing south.',
  },

  // ───────── Ranking & Ordering ─────────
  {
    id: 'logic_021', t: 'Ranking & Ordering', s: 'Position in Row', d: 'E',
    q: 'Ravi is 7th from the left end and 12th from the right end of a row. How many people are in the row?',
    o: ['17', '18', '19', '20'], a: 1,
    e: 'Total = left position + right position − 1 = 7 + 12 − 1 = 18 (Ravi is counted twice otherwise).',
    calc: 7 + 12 - 1,
  },
  {
    id: 'logic_022', t: 'Ranking & Ordering', s: 'Rank', d: 'E',
    q: 'In a class of 40 students, Priya is 11th from the top. What is her rank from the bottom?',
    o: ['29th', '30th', '31st', '28th'], a: 1,
    e: 'Rank from bottom = total − rank from top + 1 = 40 − 11 + 1 = 30th.',
    calc: 40 - 11 + 1,
  },
  {
    id: 'logic_023', t: 'Ranking & Ordering', s: 'Interchange', d: 'H',
    q: 'In a row, A is 12th from the left and B is 18th from the right. When they interchange places, A becomes 20th from the left. How many people are in the row?',
    o: ['35', '36', '37', '38'], a: 2,
    e: 'After the swap A occupies B\'s old seat, so that seat is 20th from the left and (still) 18th from the right. Total = 20 + 18 − 1 = 37.',
    calc: 20 + 18 - 1,
  },
  {
    id: 'logic_024', t: 'Ranking & Ordering', s: 'Height Ordering', d: 'M',
    q: 'A is taller than B, C is shorter than B, and D is taller than A. Who is the second tallest?',
    o: ['A', 'B', 'C', 'D'], a: 0,
    e: 'From the clues: D > A > B > C. The second tallest is A.',
  },

  // ───────── Syllogisms ─────────
  {
    id: 'logic_025', t: 'Syllogisms', s: 'Two Statements', d: 'E', fixed: true,
    q: 'Statements: All cats are animals. All animals are living beings.\nConclusions: I. All cats are living beings.  II. Some living beings are cats.',
    o: SYL, a: 2,
    e: 'Cats ⊂ animals ⊂ living beings, so all cats are living beings (I). Since cats exist within living beings, some living beings are cats (II). Both I and II follow.',
  },
  {
    id: 'logic_026', t: 'Syllogisms', s: 'Negative Premise', d: 'M', fixed: true,
    q: 'Statements: Some pens are books. No book is a table.\nConclusions: I. Some pens are not tables.  II. No pen is a table.',
    o: SYL, a: 0,
    e: 'The pens that are books cannot be tables (no book is a table), so some pens are not tables — I follows. Other pens might still be tables, so II does not follow. Only conclusion I follows.',
  },
  {
    id: 'logic_027', t: 'Syllogisms', s: 'Undistributed Middle', d: 'M', fixed: true,
    q: 'Statements: All roses are flowers. Some flowers are red.\nConclusions: I. Some roses are red.  II. Some red things are flowers.',
    o: SYL, a: 1,
    e: 'The red flowers might not include any roses, so I is not certain. "Some flowers are red" converts directly to "some red things are flowers", so II follows. Only conclusion II follows.',
  },
  {
    id: 'logic_028', t: 'Syllogisms', s: 'Negative Premise', d: 'H', fixed: true,
    q: 'Statements: No A is B. Some B are C.\nConclusions: I. Some C are not A.  II. Some A are C.',
    o: SYL, a: 0,
    e: 'The C\'s that are B cannot be A (no B is A), so some C are not A — I follows. Nothing links A to C positively, so II is not certain. Only conclusion I follows.',
  },
  {
    id: 'logic_029', t: 'Syllogisms', s: 'Complementary Pair', d: 'H', fixed: true,
    q: 'Statements: Some dogs are cats. Some cats are rats.\nConclusions: I. Some dogs are rats.  II. No dog is a rat.',
    o: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'], a: 2,
    e: 'Neither conclusion is certain on its own. But I ("some dogs are rats") and II ("no dog is a rat") are complementary — exactly one of them must be true. So either I or II follows.',
  },

  // ───────── Statements & Assumptions / Conclusions ─────────
  {
    id: 'logic_030', t: 'Statements & Assumptions', s: 'Assumptions', d: 'M', fixed: true,
    q: 'Statement: "The government has made helmets compulsory for all two-wheeler riders."\nAssumptions: I. Helmets reduce the severity of head injuries in accidents.  II. All riders already own helmets.',
    o: ['Only assumption I is implicit', 'Only assumption II is implicit', 'Both are implicit', 'Neither is implicit'], a: 0,
    e: 'A rule like this only makes sense if helmets protect riders, so I is implicit. The rule does not assume riders already own helmets — they may need to buy one. Only assumption I is implicit.',
  },
  {
    id: 'logic_031', t: 'Statements & Assumptions', s: 'Assumptions', d: 'E', fixed: true,
    q: 'Statement: "Use our toothpaste for whiter teeth — recommended by dentists."\nAssumptions: I. People want whiter teeth.  II. People trust dentists\' recommendations.',
    o: ['Only assumption I is implicit', 'Only assumption II is implicit', 'Both are implicit', 'Neither is implicit'], a: 2,
    e: 'The advertiser promises whiter teeth (assuming people want that) and cites dentists (assuming people trust them). Both are implicit.',
  },
  {
    id: 'logic_032', t: 'Statements & Assumptions', s: 'Conclusions', d: 'M', fixed: true,
    q: 'Statement: "Of the 500 candidates who appeared for the test, only 20 were selected for the interview."\nConclusions: I. The test was of a very high standard.  II. Most candidates were not selected for the interview.',
    o: ['Only conclusion I follows', 'Only conclusion II follows', 'Both follow', 'Neither follows'], a: 1,
    e: '480 of 500 were not selected, so II follows directly. A low selection rate could be due to limited vacancies rather than a hard test, so I does not follow. Only conclusion II follows.',
  },

  // ───────── Analogies & Classification ─────────
  {
    id: 'logic_033', t: 'Analogies & Classification', s: 'Word Analogy', d: 'E',
    q: 'Doctor : Hospital :: Teacher : ?',
    o: ['Student', 'School', 'Book', 'Principal'], a: 1,
    e: 'A doctor works in a hospital; a teacher works in a school.',
  },
  {
    id: 'logic_034', t: 'Analogies & Classification', s: 'Number Analogy', d: 'M',
    q: '3 : 28 :: 5 : ?',
    o: ['124', '125', '126', '130'], a: 2,
    e: '3³ + 1 = 28, so the rule is n³ + 1. For 5: 5³ + 1 = 126.',
    calc: 5 ** 3 + 1,
  },
  {
    id: 'logic_035', t: 'Analogies & Classification', s: 'Odd One Out', d: 'E',
    q: 'Which one is the odd one out?',
    o: ['Apple', 'Mango', 'Potato', 'Banana'], a: 2,
    e: 'Apple, mango and banana are fruits; potato is a vegetable (a tuber).',
  },
  {
    id: 'logic_036', t: 'Analogies & Classification', s: 'Odd One Out', d: 'M',
    q: 'Which number is the odd one out?',
    o: ['27', '64', '144', '216'], a: 2,
    e: '27 = 3³, 64 = 4³ and 216 = 6³ are perfect cubes. 144 = 12² is a square but not a cube.',
    check: () => [27, 64, 216].every((n) => Math.round(Math.cbrt(n)) ** 3 === n) && Math.round(Math.cbrt(144)) ** 3 !== 144,
  },
  {
    id: 'logic_037', t: 'Analogies & Classification', s: 'Letter Classification', d: 'M',
    q: 'Which letter group is the odd one out?',
    o: ['BDF', 'HJL', 'MOQ', 'RTW'], a: 3,
    e: 'In BDF, HJL and MOQ each letter is 2 places after the previous one. In RTW the gaps are 2 and 3 (R→T→W), so it is the odd one out.',
  },
  {
    id: 'logic_038', t: 'Analogies & Classification', s: 'Letter Analogy', d: 'H',
    q: 'If CUP is related to DWS, then PEN is related to:',
    o: ['QFO', 'QGQ', 'RGQ', 'QGP'], a: 1,
    e: 'C→D is +1, U→W is +2, P→S is +3. Applying +1, +2, +3 to PEN: P→Q, E→G, N→Q, giving QGQ.',
    check: () => {
      const f = (w: string) => [...w].map((c, i) => String.fromCharCode(c.charCodeAt(0) + i + 1)).join('');
      return f('CUP') === 'DWS' && f('PEN') === 'QGQ';
    },
  },

  // ───────── Seating Arrangement ─────────
  {
    id: 'logic_039', t: 'Seating Arrangement', s: 'Linear Arrangement', d: 'M',
    passage: 'Five friends A, B, C, D and E sit in a row facing north. C sits exactly in the middle. A sits at the extreme left end. E sits immediately to the right of C. B does not sit next to A.',
    q: 'Who sits second from the left?',
    o: ['B', 'D', 'E', 'C'], a: 1,
    e: 'Positions 1–5 from the left: A = 1, C = 3, E = 4. B and D take seats 2 and 5. B cannot be next to A, so B = 5 and D = 2. D is second from the left.',
  },
  {
    id: 'logic_040', t: 'Seating Arrangement', s: 'Circular Arrangement', d: 'H',
    passage: 'Six friends A, B, C, D, E and F sit around a circular table with six equally spaced seats, all facing the centre. A sits opposite D. C sits opposite F.',
    q: 'Who sits opposite B?',
    o: ['A', 'C', 'E', 'Cannot be determined'], a: 2,
    e: 'Six seats form three opposite pairs. A–D uses one pair and C–F another, so B and E must occupy the last pair — E sits opposite B, whatever the exact seating.',
  },

  // ───────── Venn Diagrams ─────────
  {
    id: 'logic_041', t: 'Venn Diagrams', s: 'Two Sets', d: 'E',
    q: 'In a class of 50 students, 30 like tea, 25 like coffee and 10 like both. How many like neither?',
    o: ['0', '5', '10', '15'], a: 1,
    e: 'Students who like at least one = 30 + 25 − 10 = 45. Neither = 50 − 45 = 5.',
    calc: 50 - (30 + 25 - 10),
  },
  {
    id: 'logic_042', t: 'Venn Diagrams', s: 'Two Sets', d: 'M',
    q: 'In a group of 100 people, 60 speak Hindi, 50 speak English and 20 speak neither. How many speak both?',
    o: ['10', '20', '30', '40'], a: 2,
    e: '80 people speak at least one language. Both = 60 + 50 − 80 = 30.',
    calc: 60 + 50 - 80,
  },
  {
    id: 'logic_043', t: 'Venn Diagrams', s: 'Three Sets', d: 'H',
    q: 'Of 120 students, 60 play cricket, 50 play football and 40 play hockey. 20 play cricket and football, 15 play football and hockey, 10 play cricket and hockey, and 5 play all three. How many play none of the three?',
    o: ['5', '10', '15', '20'], a: 1,
    e: 'At least one = 60 + 50 + 40 − 20 − 15 − 10 + 5 = 110. None = 120 − 110 = 10.',
    calc: 120 - (60 + 50 + 40 - 20 - 15 - 10 + 5),
  },

  // ───────── Data Sufficiency ─────────
  {
    id: 'logic_044', t: 'Data Sufficiency', s: 'Equations', d: 'H', fixed: true,
    q: 'What is the value of x?\nI. 2x + 3y = 12\nII. 4x + 6y = 24',
    o: DS, a: 3,
    e: 'Statement II is just Statement I multiplied by 2, so together they are still one equation in two unknowns. x cannot be found: even both together are not sufficient.',
  },
  {
    id: 'logic_045', t: 'Data Sufficiency', s: 'Ages', d: 'M', fixed: true,
    q: 'How old is Ravi?\nI. Ravi is 5 years older than Sita.\nII. Sita\'s age is half of Ravi\'s age.',
    o: DS, a: 2,
    e: 'Neither statement alone gives a number. Together: R = S + 5 and S = R/2, so R = R/2 + 5 and R = 10. Both statements together are needed.',
  },
  {
    id: 'logic_046', t: 'Data Sufficiency', s: 'Ordering', d: 'E', fixed: true,
    q: 'Among P, Q and R, who is the tallest?\nI. P is taller than Q.\nII. R is shorter than Q.',
    o: DS, a: 2,
    e: 'I alone does not place R, and II alone does not place P. Together: P > Q > R, so P is the tallest. Both statements together are needed.',
  },
];

export default build('logical', rawLogical);
