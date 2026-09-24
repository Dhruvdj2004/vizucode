import { build, type Raw } from './build';

const RC1 =
  'Remote work was once a perk offered by a handful of technology firms. Today, many organisations treat it as a standard option. Supporters argue that it saves commuting time and widens the talent pool, since companies can hire people regardless of where they live. Critics point out that new employees often find it harder to learn informal skills — how to handle a difficult client, or whom to approach for help — when they rarely see experienced colleagues at work. Some firms have responded with a hybrid model, asking staff to come to the office on fixed days so that mentoring can happen in person.';

const RC2 =
  'The city\'s new cycling lanes were built with the promise of reducing traffic congestion. Six months later, car traffic on the main avenue has fallen by 12%, but traffic on two parallel streets has risen by nearly the same amount. City planners argue that the lanes have still succeeded, because the number of daily cyclists has tripled and road accidents involving cyclists have dropped.';

export const rawVerbal: Raw[] = [
  // ───────── Reading Comprehension ─────────
  {
    id: 'verbal_001', t: 'Reading Comprehension', s: 'Detail', d: 'E', passage: RC1,
    q: 'According to the passage, which benefit of remote work do its supporters mention?',
    o: [
      'It lets companies hire people regardless of where they live',
      'It improves how employees handle difficult clients',
      'It removes the need for mentoring',
      'It allows companies to reduce salaries',
    ], a: 0,
    e: 'The passage says supporters argue remote work "widens the talent pool, since companies can hire people regardless of where they live". The other options are either the critics\' concern or not mentioned.',
  },
  {
    id: 'verbal_002', t: 'Reading Comprehension', s: 'Main Idea', d: 'M', passage: RC1,
    q: 'What is the main concern raised by critics of remote work?',
    o: [
      'It increases commuting costs',
      'It makes it harder for new employees to learn informal skills',
      'It reduces the size of the talent pool',
      'Experienced employees dislike it',
    ], a: 1,
    e: 'Critics point out that new employees "find it harder to learn informal skills" when they rarely see experienced colleagues — that is the concern described.',
  },
  {
    id: 'verbal_003', t: 'Reading Comprehension', s: 'Inference', d: 'H', passage: RC1,
    q: 'Which of the following can be inferred from the passage?',
    o: [
      'Most companies have abandoned remote work',
      'Hybrid models are partly meant to address a weakness of fully remote work',
      'Remote work lowers productivity for all employees',
      'Experienced employees prefer to work from the office',
    ], a: 1,
    e: 'Firms adopted hybrid models "so that mentoring can happen in person" — a direct response to the critics\' point about learning informal skills. The other options go beyond what the passage says.',
  },
  {
    id: 'verbal_004', t: 'Reading Comprehension', s: 'Inference', d: 'M', passage: RC2,
    q: 'What do the car-traffic figures in the passage suggest?',
    o: [
      'Overall car traffic in the city has fallen by 12%',
      'Congestion may have shifted to other streets rather than reduced',
      'The cycling lanes caused more accidents',
      'Cyclists now avoid the main avenue',
    ], a: 1,
    e: 'Traffic fell on the main avenue but rose by nearly the same amount on two parallel streets, which suggests the cars moved elsewhere rather than disappearing.',
  },
  {
    id: 'verbal_005', t: 'Reading Comprehension', s: 'Argument Structure', d: 'H', passage: RC2,
    q: 'The planners\' claim that the lanes "succeeded" relies mainly on:',
    o: [
      'Evidence that congestion across the city has fallen',
      'Measures other than congestion, such as cycling numbers and safety',
      'The reduction in traffic on parallel streets',
      'Comparisons with other cities',
    ], a: 1,
    e: 'Since congestion only shifted, the planners justify success with other outcomes: cyclist numbers tripled and cyclist accidents dropped. The lanes were promised for congestion, but the claim of success rests on different measures.',
  },

  // ───────── Grammar & Error Detection ─────────
  {
    id: 'verbal_006', t: 'Grammar & Error Detection', s: 'Error Detection', d: 'E', fixed: true,
    q: 'Which part of the sentence contains an error?\n"Each of the students / have submitted / the assignment / on time."',
    o: ['Each of the students', 'have submitted', 'the assignment', 'on time'], a: 1,
    e: '"Each" is singular, so the verb must be singular: "Each of the students has submitted the assignment on time." The error is in "have submitted".',
  },
  {
    id: 'verbal_007', t: 'Grammar & Error Detection', s: 'Tenses', d: 'E',
    q: 'Choose the correct option: "She ______ in Pune since 2019."',
    o: ['lives', 'is living', 'has been living', 'lived'], a: 2,
    e: '"Since 2019" marks an action that started in the past and continues now, which calls for the present perfect continuous: "has been living".',
  },
  {
    id: 'verbal_008', t: 'Grammar & Error Detection', s: 'Subject-Verb Agreement', d: 'M',
    q: 'Choose the correct option: "Neither the manager nor the employees ______ aware of the change."',
    o: ['was', 'were', 'is', 'has been'], a: 1,
    e: 'With "neither … nor", the verb agrees with the nearer subject. "Employees" is plural, so the verb is "were".',
  },
  {
    id: 'verbal_009', t: 'Grammar & Error Detection', s: 'Sentence Correction', d: 'M',
    q: 'Which sentence is grammatically correct?',
    o: [
      'If I was you, I would accept the offer.',
      'If I were you, I would accept the offer.',
      'If I am you, I would accept the offer.',
      'If I would be you, I accept the offer.',
    ], a: 1,
    e: 'Imaginary or hypothetical conditions use the subjunctive "were" for every subject: "If I were you, I would accept the offer."',
  },
  {
    id: 'verbal_010', t: 'Grammar & Error Detection', s: 'Correlatives', d: 'H',
    q: 'Choose the correct option: "Hardly had he reached the station ______ the train left."',
    o: ['than', 'when', 'then', 'that'], a: 1,
    e: '"Hardly" and "scarcely" pair with "when"; it is "no sooner" that pairs with "than". So: "Hardly had he reached the station when the train left."',
  },
  {
    id: 'verbal_011', t: 'Grammar & Error Detection', s: 'Error Detection', d: 'H', fixed: true,
    q: 'Which part of the sentence contains an error?\n"The committee / comprises of / seven members."',
    o: ['The committee', 'comprises of', 'seven members', 'No error'], a: 1,
    e: '"Comprise" means "consist of" and never takes "of": "The committee comprises seven members" (or "consists of seven members"). The error is in "comprises of".',
  },
  {
    id: 'verbal_012', t: 'Grammar & Error Detection', s: 'Subject-Verb Agreement', d: 'E',
    q: 'Choose the correct option: "One of my friends ______ settled in Canada."',
    o: ['have', 'has', 'are', 'were'], a: 1,
    e: 'The subject is "one", which is singular, so the verb is "has": "One of my friends has settled in Canada."',
  },

  // ───────── Vocabulary ─────────
  {
    id: 'verbal_013', t: 'Vocabulary', s: 'Synonyms', d: 'E',
    q: 'Choose the word closest in meaning to ABUNDANT.',
    o: ['Scarce', 'Plentiful', 'Hidden', 'Costly'], a: 1,
    e: '"Abundant" means existing in large quantities — plentiful. "Scarce" is its opposite.',
  },
  {
    id: 'verbal_014', t: 'Vocabulary', s: 'Antonyms', d: 'E',
    q: 'Choose the word opposite in meaning to ANCIENT.',
    o: ['Old', 'Historic', 'Modern', 'Antique'], a: 2,
    e: '"Ancient" means very old; its opposite is "modern". The other options are near-synonyms.',
  },
  {
    id: 'verbal_015', t: 'Vocabulary', s: 'Synonyms', d: 'M',
    q: 'Choose the word closest in meaning to METICULOUS.',
    o: ['Careless', 'Thorough', 'Hasty', 'Timid'], a: 1,
    e: '"Meticulous" means showing great attention to detail — thorough. "Careless" and "hasty" are opposites.',
  },
  {
    id: 'verbal_016', t: 'Vocabulary', s: 'Antonyms', d: 'M',
    q: 'Choose the word opposite in meaning to OBSCURE.',
    o: ['Vague', 'Hidden', 'Prominent', 'Dim'], a: 2,
    e: '"Obscure" means not well known or hard to see; its opposite is "prominent". The other options are close in meaning to obscure.',
  },
  {
    id: 'verbal_017', t: 'Vocabulary', s: 'Synonyms', d: 'H',
    q: 'Choose the word closest in meaning to EPHEMERAL.',
    o: ['Eternal', 'Transient', 'Ethereal', 'Evident'], a: 1,
    e: '"Ephemeral" means lasting a very short time — transient. "Ethereal" (delicate, heavenly) is a look-alike trap, and "eternal" is the opposite.',
  },
  {
    id: 'verbal_018', t: 'Vocabulary', s: 'One Word Substitution', d: 'E',
    q: 'One word for: "A person who can speak two languages fluently".',
    o: ['Bilingual', 'Polyglot', 'Linguist', 'Translator'], a: 0,
    e: 'Bilingual = speaking two languages. A polyglot speaks many; a linguist studies language; a translator converts text between languages.',
  },
  {
    id: 'verbal_019', t: 'Vocabulary', s: 'One Word Substitution', d: 'M',
    q: 'One word for: "An abnormal fear of heights".',
    o: ['Claustrophobia', 'Acrophobia', 'Hydrophobia', 'Agoraphobia'], a: 1,
    e: 'Acrophobia is the fear of heights. Claustrophobia is fear of confined spaces, hydrophobia of water, agoraphobia of open or crowded places.',
  },
  {
    id: 'verbal_020', t: 'Vocabulary', s: 'One Word Substitution', d: 'H',
    q: 'One word for: "Government by the wealthy".',
    o: ['Aristocracy', 'Plutocracy', 'Autocracy', 'Oligarchy'], a: 1,
    e: 'Plutocracy is rule by the wealthy. Oligarchy is rule by a small group (not necessarily rich), aristocracy by nobility, autocracy by one person.',
  },
  {
    id: 'verbal_021', t: 'Vocabulary', s: 'Antonyms', d: 'H',
    q: 'Choose the word opposite in meaning to LOQUACIOUS.',
    o: ['Garrulous', 'Taciturn', 'Verbose', 'Eloquent'], a: 1,
    e: '"Loquacious" means very talkative; its opposite is "taciturn" (saying little). Garrulous and verbose are synonyms of loquacious.',
  },

  // ───────── Para Jumbles ─────────
  {
    id: 'verbal_022', t: 'Para Jumbles', s: 'Sentence Ordering', d: 'M', fixed: true,
    q: 'Arrange the sentences in a logical order:\nP. As a result, many small farmers now sell directly to urban buyers.\nQ. Mobile internet has spread rapidly across rural India.\nR. This has given farmers access to real-time market prices.\nS. They no longer depend entirely on middlemen to learn what their crops are worth.',
    o: ['QRSP', 'QPRS', 'RQSP', 'QSRP'], a: 0,
    e: 'Q introduces the topic; R ("This") refers back to mobile internet; S ("They") continues about farmers and prices; P ("As a result") gives the outcome. Order: QRSP.',
  },
  {
    id: 'verbal_023', t: 'Para Jumbles', s: 'Sentence Ordering', d: 'H', fixed: true,
    q: 'Arrange the sentences in a logical order:\nP. However, their batteries depend on minerals that are difficult to mine responsibly.\nQ. Electric vehicles produce no tailpipe emissions.\nR. So the environmental benefit of an electric car depends on how its battery is made and how its electricity is generated.\nS. Their charging electricity, too, may come from coal-fired plants.',
    o: ['QSPR', 'QPSR', 'PQSR', 'QPRS'], a: 1,
    e: 'Q states the benefit; P ("However") introduces the first catch; S ("too") adds a second catch, so it must follow P; R ("So") concludes. Order: QPSR.',
  },
  {
    id: 'verbal_024', t: 'Para Jumbles', s: 'Sentence Ordering', d: 'E', fixed: true,
    q: 'Arrange the sentences in a logical order:\nP. Then she wrote the first draft in a single weekend.\nQ. Meera spent months researching the history of her town.\nR. Finally, after several rounds of editing, the book was published.\nS. She interviewed dozens of elderly residents along the way.',
    o: ['QPSR', 'QSPR', 'SQPR', 'QSRP'], a: 1,
    e: 'Q introduces Meera and her research; S continues the research; P ("Then") moves to writing; R ("Finally") ends with publication. Order: QSPR.',
  },

  // ───────── Sentence Completion ─────────
  {
    id: 'verbal_025', t: 'Sentence Completion', s: 'Phrasal Verbs', d: 'E',
    q: 'Fill in the blank: "Despite the heavy rain, the match ______ as scheduled."',
    o: ['went ahead', 'called off', 'put up', 'broke down'], a: 0,
    e: '"Despite the rain" signals that the match happened anyway — it "went ahead". "Called off" would contradict "despite".',
  },
  {
    id: 'verbal_026', t: 'Sentence Completion', s: 'Context Clues', d: 'M',
    q: 'Fill in the blank: "The new policy met with ______ criticism; almost every group opposed it."',
    o: ['scant', 'widespread', 'mild', 'occasional'], a: 1,
    e: 'The second clause says almost every group opposed it, so the criticism was "widespread". The other words suggest little criticism.',
  },
  {
    id: 'verbal_027', t: 'Sentence Completion', s: 'Context Clues', d: 'M',
    q: 'Fill in the blank: "Her argument was so ______ that even her fiercest critics could find no flaw in it."',
    o: ['tenuous', 'cogent', 'verbose', 'ambiguous'], a: 1,
    e: 'An argument with no flaw is "cogent" — clear, logical and convincing. "Tenuous" and "ambiguous" suggest weakness; "verbose" is about length, not soundness.',
  },
  {
    id: 'verbal_028', t: 'Sentence Completion', s: 'Double Blanks', d: 'H',
    q: 'Fill in the blanks: "The scientist was ______ about the results; she wanted to repeat the experiment before making any ______ claims."',
    o: ['cautious, definitive', 'excited, modest', 'careless, bold', 'certain, tentative'], a: 0,
    e: 'Wanting to repeat the experiment shows caution, and a cautious scientist avoids "definitive" claims until results are confirmed — hence "cautious, definitive". The other pairs contradict each other or the context.',
  },

  // ───────── Critical Reasoning ─────────
  {
    id: 'verbal_029', t: 'Critical Reasoning', s: 'Weaken', d: 'H',
    q: 'Argument: "Students who eat breakfast score higher on tests. Therefore, eating breakfast improves test performance." Which statement, if true, most weakens the argument?',
    o: [
      'Many students skip breakfast because they wake up late',
      'Students who eat breakfast also tend to sleep more and study more regularly',
      'Breakfast is considered the most important meal of the day',
      'Test scores have risen over the past decade',
    ], a: 1,
    e: 'The argument assumes breakfast is the cause. If breakfast-eaters also sleep and study more, those factors could explain the higher scores — a correlation, not causation. That weakens the argument most.',
  },
  {
    id: 'verbal_030', t: 'Critical Reasoning', s: 'Assumption', d: 'M',
    q: 'Argument: "Our app downloads rose 40% after the advertising campaign, so the campaign caused the increase." Which assumption does the argument depend on?',
    o: [
      'The campaign was the company\'s most expensive ever',
      'No other major factor, such as a price cut or festival sale, drove downloads during that period',
      'Competitors did not run advertising campaigns',
      'Downloads will keep rising at 40% every month',
    ], a: 1,
    e: 'To conclude that the campaign caused the rise, the argument must assume nothing else explains it. If a price cut happened at the same time, the conclusion falls apart.',
  },
];

export default build('verbal', rawVerbal);
