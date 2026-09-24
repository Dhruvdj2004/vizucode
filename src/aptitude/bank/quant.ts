import { build, type Raw } from './build';

const modpow = (b: number, e: number, m: number) => {
  let r = 1;
  b %= m;
  for (; e > 0; e >>= 1, b = (b * b) % m) if (e & 1) r = (r * b) % m;
  return r;
};
const nCr = (n: number, r: number): number => (r < 0 || r > n ? 0 : r === 0 ? 1 : (nCr(n - 1, r - 1) * n) / r);

export const rawQuant: Raw[] = [
  // ───────── Number System ─────────
  {
    id: 'quant_001', t: 'Number System', s: 'HCF & LCM', d: 'E',
    q: 'The HCF of two numbers is 12 and their LCM is 360. If one of the numbers is 72, what is the other number?',
    o: ['48', '60', '72', '90'], a: 1,
    e: 'For two numbers, HCF × LCM = product of the numbers. So the other number = (12 × 360) / 72 = 4320 / 72 = 60.',
    calc: (12 * 360) / 72,
  },
  {
    id: 'quant_002', t: 'Number System', s: 'Divisibility', d: 'E',
    q: 'Which of the following numbers is divisible by 11?',
    o: ['34521', '46172', '25630', '58213'], a: 2,
    e: 'A number is divisible by 11 when the alternating sum of its digits is a multiple of 11. For 25630: 2 − 5 + 6 − 3 + 0 = 0, so 25630 is divisible by 11 (25630 = 11 × 2330). The others give 3, −6 and 1.',
    check: () => 25630 % 11 === 0 && [34521, 46172, 58213].every((n) => n % 11 !== 0),
  },
  {
    id: 'quant_003', t: 'Number System', s: 'Unit Digit', d: 'M',
    q: 'What is the unit digit of 7^95?',
    o: ['1', '3', '7', '9'], a: 1,
    e: 'Unit digits of powers of 7 repeat in a cycle of 4: 7, 9, 3, 1. 95 = 4 × 23 + 3, so 7^95 has the same unit digit as 7^3, which is 3.',
    calc: modpow(7, 95, 10),
  },
  {
    id: 'quant_004', t: 'Number System', s: 'HCF & LCM', d: 'M',
    q: 'What is the least number which, when divided by 12, 15 and 20, leaves a remainder of 5 in each case?',
    o: ['60', '65', '125', '185'], a: 1,
    e: 'The number must be 5 more than a common multiple of 12, 15 and 20. LCM(12, 15, 20) = 60, so the least such number is 60 + 5 = 65. (125 also works but is not the least.)',
    check: () => [12, 15, 20].every((d) => 65 % d === 5) && ![60].some((n) => [12, 15, 20].every((d) => n % d === 5)),
  },
  {
    id: 'quant_005', t: 'Number System', s: 'Remainders', d: 'H',
    q: 'A number leaves a remainder of 3 when divided by 5 and a remainder of 4 when divided by 7. What is the remainder when the same number is divided by 35?',
    o: ['13', '18', '23', '28'], a: 1,
    e: 'Numbers leaving remainder 3 on division by 5: 3, 8, 13, 18, 23, 28, 33. Among these, the one leaving remainder 4 on division by 7 is 18 (18 = 2 × 7 + 4). Since 5 and 7 are coprime, the combined pattern repeats every 35, so the remainder on division by 35 is 18.',
    check: () => Array.from({ length: 35 }, (_, n) => n).filter((n) => n % 5 === 3 && n % 7 === 4).join() === '18',
  },
  {
    id: 'quant_006', t: 'Number System', s: 'Factorials', d: 'M',
    q: 'How many trailing zeros does 125! (125 factorial) have?',
    o: ['25', '30', '31', '32'], a: 2,
    e: 'Trailing zeros come from factors of 10 = 2 × 5, and 5s are the scarcer factor. Count them: ⌊125/5⌋ + ⌊125/25⌋ + ⌊125/125⌋ = 25 + 5 + 1 = 31.',
    calc: Math.floor(125 / 5) + Math.floor(125 / 25) + Math.floor(125 / 125),
  },
  {
    id: 'quant_007', t: 'Number System', s: 'HCF & LCM', d: 'E',
    q: 'Three bells ring at intervals of 9, 12 and 15 minutes. If they ring together at 8:00 AM, when will they next ring together?',
    o: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'], a: 2,
    e: 'They ring together again after LCM(9, 12, 15) = 180 minutes = 3 hours. 8:00 AM + 3 hours = 11:00 AM.',
  },
  {
    id: 'quant_008', t: 'Number System', s: 'HCF & LCM', d: 'H',
    q: 'What is the largest 4-digit number which, when divided by 6, 9, 12 and 15, leaves a remainder of 4 in each case?',
    o: ['9904', '9814', '9984', '9964'], a: 0,
    e: 'LCM(6, 9, 12, 15) = 180. The largest 4-digit multiple of 180 is 180 × 55 = 9900 (180 × 56 = 10080 has 5 digits). Adding the remainder: 9900 + 4 = 9904.',
    check: () => [6, 9, 12, 15].every((d) => 9904 % d === 4) && [9814, 9984, 9964].every((n) => ![6, 9, 12, 15].every((d) => n % d === 4)),
  },

  // ───────── Percentages ─────────
  {
    id: 'quant_009', t: 'Percentages', s: 'Basic Percentage', d: 'E',
    q: 'What is 35% of 480?',
    o: ['158', '168', '172', '186'], a: 1,
    e: '35% of 480 = (35/100) × 480 = 0.35 × 480 = 168.',
    calc: 0.35 * 480,
  },
  {
    id: 'quant_010', t: 'Percentages', s: 'Percentage Increase', d: 'E',
    q: 'The price of a notebook rises from ₹250 to ₹290. What is the percentage increase?',
    o: ['14%', '15%', '16%', '18%'], a: 2,
    e: 'Increase = 290 − 250 = 40. Percentage increase = (40 / 250) × 100 = 16%.',
    calc: ((290 - 250) / 250) * 100,
  },
  {
    id: 'quant_011', t: 'Percentages', s: 'Successive Percentage', d: 'M',
    q: 'A salary is first increased by 20% and then decreased by 20%. What is the net change in the salary?',
    o: ['No change', '4% decrease', '4% increase', '2% decrease'], a: 1,
    e: 'Take the salary as 100. After +20% it is 120; after −20% it is 120 × 0.8 = 96. The net change is 100 → 96, a 4% decrease. (Successive changes a% and b% give a + b + ab/100 = 20 − 20 − 4 = −4%.)',
    check: () => Math.abs(100 * 1.2 * 0.8 - 96) < 1e-9,
  },
  {
    id: 'quant_012', t: 'Percentages', s: 'Population', d: 'M',
    q: 'The population of a town is 20,000 and grows at 10% per year. What will the population be after 2 years?',
    o: ['24,000', '24,200', '24,400', '22,000'], a: 1,
    e: 'Growth compounds each year: 20,000 × 1.1 × 1.1 = 20,000 × 1.21 = 24,200.',
    calc: 20000 * 1.1 * 1.1,
  },
  {
    id: 'quant_013', t: 'Percentages', s: 'Election', d: 'H',
    q: 'In an election between two candidates, 10% of the voters on the list did not vote and 60 of the votes cast were invalid. The winner got 47% of all the voters on the list and won by 1,300 votes. How many voters were on the list?',
    o: ['29,500', '30,000', '31,000', '32,500'], a: 2,
    e: 'Let the list have N voters. Votes cast = 0.9N, valid votes = 0.9N − 60. Winner = 0.47N, so loser = 0.9N − 60 − 0.47N = 0.43N − 60. Margin: 0.47N − (0.43N − 60) = 0.04N + 60 = 1300, so 0.04N = 1240 and N = 31,000.',
    calc: (1300 - 60) / 0.04,
  },
  {
    id: 'quant_014', t: 'Percentages', s: 'Salary Comparison', d: 'M',
    q: "A's salary is 25% more than B's salary. By what percentage is B's salary less than A's?",
    o: ['20%', '25%', '15%', '22.5%'], a: 0,
    e: "Let B = 100, so A = 125. B is less than A by 25, relative to A: (25 / 125) × 100 = 20%. The base changes, which is why the answer is not 25%.",
    calc: (25 / 125) * 100,
  },
  {
    id: 'quant_015', t: 'Percentages', s: 'Consumption & Expenditure', d: 'M',
    q: 'The price of sugar rises by 25%. By what percentage must a family reduce its sugar consumption so that its expenditure on sugar stays the same?',
    o: ['25%', '20%', '18%', '15%'], a: 1,
    e: 'Expenditure = price × quantity. If price becomes 1.25 times, quantity must become 1/1.25 = 0.8 times, i.e. a reduction of 20%. Shortcut: r / (100 + r) × 100 = 25/125 × 100 = 20%.',
    calc: (25 / 125) * 100,
  },
  {
    id: 'quant_016', t: 'Percentages', s: 'Exam Marks', d: 'E',
    q: 'A student needs 40% of the maximum marks to pass. She scores 178 marks and fails by 22 marks. What are the maximum marks?',
    o: ['400', '450', '500', '550'], a: 2,
    e: 'Pass marks = 178 + 22 = 200, which is 40% of the maximum. Maximum = 200 / 0.4 = 500.',
    calc: (178 + 22) / 0.4,
  },

  // ───────── Profit & Loss ─────────
  {
    id: 'quant_017', t: 'Profit & Loss', s: 'Profit Percentage', d: 'E',
    q: 'An article bought for ₹800 is sold for ₹920. What is the profit percentage?',
    o: ['12%', '15%', '13%', '18%'], a: 1,
    e: 'Profit = 920 − 800 = 120. Profit % = (120 / 800) × 100 = 15%.',
    calc: (120 / 800) * 100,
  },
  {
    id: 'quant_018', t: 'Profit & Loss', s: 'Marked Price & Discount', d: 'M',
    q: 'A shopkeeper marks an article 40% above its cost price and then gives successive discounts of 10% and 5%. What is his profit percentage?',
    o: ['25%', '21%', '19.7%', '17.5%'], a: 2,
    e: 'Take CP = 100. Marked price = 140. After 10% off: 126. After a further 5% off: 126 × 0.95 = 119.7. Profit = 19.7 on a cost of 100, i.e. 19.7%.',
    calc: (1.4 * 0.9 * 0.95 - 1) * 100,
  },
  {
    id: 'quant_019', t: 'Profit & Loss', s: 'Loss to Gain', d: 'M',
    q: 'By selling an article for ₹960, a man loses 20%. At what price should he sell it to gain 20%?',
    o: ['₹1,152', '₹1,200', '₹1,440', '₹1,380'], a: 2,
    e: 'Selling at a 20% loss means SP = 0.8 × CP, so CP = 960 / 0.8 = ₹1,200. For a 20% gain, SP = 1.2 × 1200 = ₹1,440.',
    calc: (960 / 0.8) * 1.2,
  },
  {
    id: 'quant_020', t: 'Profit & Loss', s: 'Equal Selling Prices', d: 'H',
    q: 'A trader sells two articles for ₹1,200 each. He gains 20% on one and loses 20% on the other. What is his overall result?',
    o: ['No profit, no loss', '4% loss', '4% gain', '2% loss'], a: 1,
    e: 'Cost prices: 1200 / 1.2 = 1000 and 1200 / 0.8 = 1500, so total CP = 2500 while total SP = 2400. Loss = 100, i.e. 100 / 2500 = 4% loss. With equal selling prices and equal ± rates there is always a loss of (r²/100)% = 4%.',
    check: () => 1200 / 1.2 + 1200 / 0.8 === 2500 && ((2500 - 2400) / 2500) * 100 === 4,
  },
  {
    id: 'quant_021', t: 'Profit & Loss', s: 'Faulty Weights', d: 'H',
    q: 'A shopkeeper uses a 900 g weight in place of 1 kg and also sells at 10% above the cost price. What is his actual profit percentage?',
    o: ['11.11%', '20%', '21%', '22.22%'], a: 3,
    e: 'Let 1 g cost ₹1. He gives 900 g (cost ₹900) but charges for 1 kg at 10% above cost = ₹1,100. Profit = 200 on 900, i.e. 200/900 × 100 = 22.22%.',
    calc: (200 / 900) * 100,
  },
  {
    id: 'quant_022', t: 'Profit & Loss', s: 'CP-SP Relation', d: 'M',
    q: 'The cost price of 12 pens is equal to the selling price of 10 pens. What is the profit percentage?',
    o: ['16.67%', '20%', '18%', '25%'], a: 1,
    e: 'Let each pen cost ₹1. Then 12 = SP of 10 pens, so SP of one pen = 1.2. Profit per pen = 0.2 on 1, i.e. 20%.',
    calc: ((12 - 10) / 10) * 100,
  },

  // ───────── Ratio & Proportion (incl. Partnership, Mixtures) ─────────
  {
    id: 'quant_023', t: 'Ratio & Proportion', s: 'Ratio', d: 'E',
    q: '₹1,800 is divided between two people in the ratio 4 : 5. What is the larger share?',
    o: ['₹800', '₹900', '₹1,000', '₹1,100'], a: 2,
    e: 'Total parts = 4 + 5 = 9, so one part = 1800 / 9 = 200. The larger share = 5 × 200 = ₹1,000.',
    calc: (1800 / 9) * 5,
  },
  {
    id: 'quant_024', t: 'Ratio & Proportion', s: 'Proportion', d: 'E',
    q: 'What is the fourth proportional to 4, 9 and 12?',
    o: ['21', '24', '27', '36'], a: 2,
    e: 'If 4 : 9 = 12 : x, then 4x = 9 × 12 = 108, so x = 27.',
    calc: (9 * 12) / 4,
  },
  {
    id: 'quant_025', t: 'Ratio & Proportion', s: 'Partnership', d: 'M',
    q: 'A invests ₹20,000 for 12 months and B invests ₹30,000 for 8 months in a business. Out of a total profit of ₹18,000, what is A\'s share?',
    o: ['₹7,200', '₹9,000', '₹10,800', '₹12,000'], a: 1,
    e: 'Profit is shared in the ratio of capital × time: A = 20,000 × 12 = 2,40,000 and B = 30,000 × 8 = 2,40,000. The ratio is 1 : 1, so A gets 18,000 / 2 = ₹9,000.',
    calc: 18000 / 2,
  },
  {
    id: 'quant_026', t: 'Ratio & Proportion', s: 'Mixtures & Alligation', d: 'M',
    q: 'In what ratio must rice costing ₹30 per kg be mixed with rice costing ₹45 per kg so that the mixture is worth ₹35 per kg?',
    o: ['1 : 2', '2 : 1', '3 : 2', '2 : 3'], a: 1,
    e: 'By alligation, cheaper : dearer = (45 − 35) : (35 − 30) = 10 : 5 = 2 : 1.',
  },
  {
    id: 'quant_027', t: 'Ratio & Proportion', s: 'Mixtures & Alligation', d: 'H',
    q: 'A container holds 80 litres of pure milk. 8 litres are taken out and replaced with water. This is done three times in total. How much milk is left in the container?',
    o: ['56 litres', '57.6 litres', '58.32 litres', '60.2 litres'], a: 2,
    e: 'Each operation keeps (80 − 8)/80 = 0.9 of the milk. After three operations: 80 × 0.9³ = 80 × 0.729 = 58.32 litres.',
    calc: 80 * 0.9 ** 3,
  },
  {
    id: 'quant_028', t: 'Ratio & Proportion', s: 'Mixtures & Alligation', d: 'M',
    q: 'A 40-litre mixture contains milk and water in the ratio 3 : 1. How much water must be added to make the ratio 2 : 1?',
    o: ['4 litres', '5 litres', '6 litres', '8 litres'], a: 1,
    e: 'Milk = 30 L and water = 10 L. For milk : water = 2 : 1 with 30 L milk, water must be 15 L. So add 15 − 10 = 5 litres.',
    calc: 30 / 2 - 10,
  },
  {
    id: 'quant_029', t: 'Ratio & Proportion', s: 'Income & Expenditure', d: 'M',
    q: 'The incomes of A and B are in the ratio 5 : 4 and their expenditures are in the ratio 3 : 2. If each of them saves ₹1,600, what is A\'s income?',
    o: ['₹3,200', '₹4,000', '₹4,800', '₹5,000'], a: 1,
    e: 'Let incomes be 5x and 4x, expenditures 3y and 2y. Then 5x − 3y = 1600 and 4x − 2y = 1600. From the second, y = 2x − 800. Substituting: 5x − 6x + 2400 = 1600, so x = 800. A\'s income = 5 × 800 = ₹4,000.',
    calc: 5 * 800,
  },
  {
    id: 'quant_030', t: 'Ratio & Proportion', s: 'Partnership', d: 'H',
    q: 'A and B start a business with ₹30,000 and ₹40,000. After 4 months, A adds ₹10,000 and B withdraws ₹10,000. At the end of the year the profit is ₹42,000. What is A\'s share?',
    o: ['₹20,000', '₹21,000', '₹22,000', '₹24,000'], a: 2,
    e: 'A: 30,000 × 4 + 40,000 × 8 = 4,40,000. B: 40,000 × 4 + 30,000 × 8 = 4,00,000. Ratio = 44 : 40 = 11 : 10. A\'s share = 42,000 × 11/21 = ₹22,000.',
    calc: (42000 * 11) / 21,
  },

  // ───────── Averages & Ages ─────────
  {
    id: 'quant_031', t: 'Averages & Ages', s: 'Averages', d: 'E',
    q: 'The average of five numbers is 24. When one number is removed, the average of the remaining four becomes 22. What number was removed?',
    o: ['26', '28', '30', '32'], a: 3,
    e: 'Sum of five numbers = 5 × 24 = 120. Sum of the remaining four = 4 × 22 = 88. Removed number = 120 − 88 = 32.',
    calc: 5 * 24 - 4 * 22,
  },
  {
    id: 'quant_032', t: 'Averages & Ages', s: 'Averages', d: 'M',
    q: 'The average of 11 results is 50. The average of the first six results is 49 and the average of the last six is 52. What is the sixth result?',
    o: ['50', '54', '56', '58'], a: 2,
    e: 'The sixth result is counted in both groups. Sum of first six + sum of last six = 6 × 49 + 6 × 52 = 294 + 312 = 606. Sum of all 11 = 550. So the sixth result = 606 − 550 = 56.',
    calc: 6 * 49 + 6 * 52 - 11 * 50,
  },
  {
    id: 'quant_033', t: 'Averages & Ages', s: 'Averages', d: 'E',
    q: 'The average age of 30 students in a class is 15 years. When the teacher\'s age is included, the average rises by 1 year. What is the teacher\'s age?',
    o: ['40 years', '44 years', '46 years', '48 years'], a: 2,
    e: 'Total age of students = 30 × 15 = 450. With the teacher, 31 people average 16, so the total is 31 × 16 = 496. Teacher = 496 − 450 = 46 years.',
    calc: 31 * 16 - 30 * 15,
  },
  {
    id: 'quant_034', t: 'Averages & Ages', s: 'Averages', d: 'M',
    q: 'A batsman scores 87 runs in his 17th innings and thereby increases his average by 3. What is his average after the 17th innings?',
    o: ['36', '39', '42', '45'], a: 1,
    e: 'Let the average after 16 innings be a. Then 16a + 87 = 17(a + 3), so a = 87 − 51 = 36. The new average is 36 + 3 = 39.',
    calc: 87 - 51 + 3,
  },
  {
    id: 'quant_035', t: 'Averages & Ages', s: 'Ages', d: 'E',
    q: 'A father is three times as old as his son. After 12 years, he will be twice as old as his son. What is the son\'s present age?',
    o: ['10 years', '12 years', '14 years', '15 years'], a: 1,
    e: 'Let the son be x, the father 3x. In 12 years: 3x + 12 = 2(x + 12), so x = 12 years.',
    calc: 12,
    check: () => 3 * 12 + 12 === 2 * (12 + 12),
  },
  {
    id: 'quant_036', t: 'Averages & Ages', s: 'Ages', d: 'M',
    q: 'The ratio of the present ages of A and B is 3 : 4. Ten years ago, A was half as old as B. What is the sum of their present ages?',
    o: ['28 years', '35 years', '42 years', '49 years'], a: 1,
    e: 'Let the ages be 3k and 4k. Ten years ago: 3k − 10 = (4k − 10)/2, so 6k − 20 = 4k − 10 and k = 5. Ages are 15 and 20; sum = 35 years.',
    calc: 15 + 20,
    check: () => 15 - 10 === (20 - 10) / 2,
  },
  {
    id: 'quant_037', t: 'Averages & Ages', s: 'Ages', d: 'H',
    q: 'The sum of the ages of a mother and her daughter is 50 years. Five years ago, the mother was 7 times as old as the daughter. How old will the mother be five years from now?',
    o: ['40 years', '45 years', '42 years', '50 years'], a: 1,
    e: 'Let the daughter be D and the mother 50 − D. Five years ago: 45 − D = 7(D − 5), so 45 − D = 7D − 35 and D = 10. The mother is 40 now, so five years from now she will be 45 years old. (Read the question carefully — it asks for the future age.)',
    calc: 50 - 10 + 5,
    check: () => 40 - 5 === 7 * (10 - 5),
  },

  // ───────── Simple & Compound Interest ─────────
  {
    id: 'quant_038', t: 'Simple & Compound Interest', s: 'Simple Interest', d: 'E',
    q: 'What is the simple interest on ₹5,000 at 8% per annum for 3 years?',
    o: ['₹1,000', '₹1,200', '₹1,250', '₹1,400'], a: 1,
    e: 'SI = P × R × T / 100 = 5000 × 8 × 3 / 100 = ₹1,200.',
    calc: (5000 * 8 * 3) / 100,
  },
  {
    id: 'quant_039', t: 'Simple & Compound Interest', s: 'Compound Interest', d: 'M',
    q: 'What is the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually?',
    o: ['₹2,000', '₹2,050', '₹2,100', '₹2,200'], a: 2,
    e: 'Amount = 10,000 × 1.1² = 12,100. CI = 12,100 − 10,000 = ₹2,100. (SI would be ₹2,000 — the extra ₹100 is interest on the first year\'s interest.)',
    calc: 10000 * 1.1 ** 2 - 10000,
  },
  {
    id: 'quant_040', t: 'Simple & Compound Interest', s: 'CI − SI Difference', d: 'M',
    q: 'The difference between compound interest and simple interest on a sum for 2 years at 5% per annum is ₹25. What is the sum?',
    o: ['₹5,000', '₹8,000', '₹10,000', '₹12,500'], a: 2,
    e: 'For 2 years, CI − SI = P × (R/100)². So 25 = P × (0.05)² = P × 0.0025, giving P = ₹10,000.',
    calc: 25 / 0.05 ** 2,
  },
  {
    id: 'quant_041', t: 'Simple & Compound Interest', s: 'Simple Interest', d: 'M',
    q: 'A sum of money doubles itself in 5 years at simple interest. In how many years will it become four times itself?',
    o: ['10 years', '12 years', '15 years', '20 years'], a: 2,
    e: 'Doubling means the interest equals P in 5 years, so the rate is 20% per year. To become 4 times, the interest must be 3P, which takes 3 × 5 = 15 years. (10 years is the compound-interest intuition — a trap here.)',
    calc: 3 * 5,
  },
  {
    id: 'quant_042', t: 'Simple & Compound Interest', s: 'Compound Interest', d: 'H',
    q: 'A sum at compound interest amounts to ₹6,050 in 2 years and ₹6,655 in 3 years. What is the sum (principal)?',
    o: ['₹4,500', '₹5,000', '₹5,500', '₹4,800'], a: 1,
    e: 'The third year\'s interest is 6655 − 6050 = 605, which is interest on 6050 for one year: rate = 605/6050 = 10%. Then P × 1.1² = 6050, so P = 6050 / 1.21 = ₹5,000.',
    calc: 6050 / 1.21,
  },
  {
    id: 'quant_043', t: 'Simple & Compound Interest', s: 'Half-yearly Compounding', d: 'M',
    q: 'What is the compound interest on ₹8,000 at 20% per annum for 1 year if interest is compounded half-yearly?',
    o: ['₹1,600', '₹1,680', '₹1,720', '₹1,760'], a: 1,
    e: 'Half-yearly means 10% per half-year for 2 half-years. Amount = 8000 × 1.1² = 9680. CI = 9680 − 8000 = ₹1,680.',
    calc: 8000 * 1.1 ** 2 - 8000,
  },

  // ───────── Time & Work (incl. Pipes & Cisterns) ─────────
  {
    id: 'quant_044', t: 'Time & Work', s: 'Working Together', d: 'E',
    q: 'A can finish a job in 10 days and B in 15 days. In how many days can they finish it working together?',
    o: ['5 days', '6 days', '7.5 days', '12.5 days'], a: 1,
    e: 'Together they do 1/10 + 1/15 = 3/30 + 2/30 = 1/6 of the job per day, so they need 6 days.',
    calc: 1 / (1 / 10 + 1 / 15),
  },
  {
    id: 'quant_045', t: 'Time & Work', s: 'Working Together', d: 'E',
    q: 'A and B together can complete a work in 12 days. A alone can complete it in 20 days. How long will B alone take?',
    o: ['24 days', '28 days', '30 days', '32 days'], a: 2,
    e: 'B\'s rate = 1/12 − 1/20 = 5/60 − 3/60 = 2/60 = 1/30. So B alone takes 30 days.',
    calc: 1 / (1 / 12 - 1 / 20),
  },
  {
    id: 'quant_046', t: 'Time & Work', s: 'Pipes & Cisterns', d: 'M',
    q: 'Pipe A can fill a tank in 6 hours and pipe B can empty the full tank in 9 hours. If both are opened together on an empty tank, how long will it take to fill?',
    o: ['12 hours', '15 hours', '18 hours', '20 hours'], a: 2,
    e: 'Net rate = 1/6 − 1/9 = 3/18 − 2/18 = 1/18 of the tank per hour, so it fills in 18 hours.',
    calc: 1 / (1 / 6 - 1 / 9),
  },
  {
    id: 'quant_047', t: 'Time & Work', s: 'Leaving Midway', d: 'M',
    q: 'A can do a piece of work in 20 days and B in 30 days. They work together for 5 days, after which A leaves. In how many more days will B finish the remaining work?',
    o: ['15 days', '17.5 days', '18 days', '20 days'], a: 1,
    e: 'Together they do 1/20 + 1/30 = 1/12 per day, so in 5 days they finish 5/12. Remaining = 7/12. B alone needs (7/12) × 30 = 17.5 days.',
    calc: (7 / 12) * 30,
  },
  {
    id: 'quant_048', t: 'Time & Work', s: 'Efficiency', d: 'M',
    q: 'A is twice as efficient as B, and together they finish a job in 14 days. How many days would A alone take?',
    o: ['18 days', '21 days', '28 days', '42 days'], a: 1,
    e: 'If B does 1 unit/day, A does 2, together 3 units/day. The job = 3 × 14 = 42 units. A alone: 42 / 2 = 21 days.',
    calc: (3 * 14) / 2,
  },
  {
    id: 'quant_049', t: 'Time & Work', s: 'Pipes & Cisterns', d: 'H',
    q: 'Pipes A and B can fill a tank in 12 hours and 18 hours respectively. Both are opened together, but B is turned off after some time, and the tank is full exactly 9 hours after the start. For how long was pipe B open?',
    o: ['3 hours', '4 hours', '4.5 hours', '6 hours'], a: 2,
    e: 'A runs all 9 hours and fills 9/12 = 3/4 of the tank. B must have filled the remaining 1/4, which takes (1/4) × 18 = 4.5 hours.',
    calc: (1 - 9 / 12) * 18,
  },
  {
    id: 'quant_050', t: 'Time & Work', s: 'Man-Days', d: 'M',
    q: '6 men or 10 women can complete a job in 15 days. In how many days will 3 men and 5 women complete it?',
    o: ['12 days', '15 days', '18 days', '20 days'], a: 1,
    e: '6 men = 10 women, so 3 men = 5 women. Then 3 men + 5 women = 10 women, who take 15 days.',
    calc: 15,
  },
  {
    id: 'quant_051', t: 'Time & Work', s: 'Work & Wages', d: 'H',
    q: 'A can do a job in 6 days and B in 8 days. With the help of C, they finish it in 3 days and are paid ₹3,200 in total. How much should C get?',
    o: ['₹400', '₹600', '₹800', '₹1,000'], a: 0,
    e: 'In 3 days A does 3/6 = 1/2 and B does 3/8 of the job, so C does 1 − 1/2 − 3/8 = 1/8. Wages follow work done: C gets 3200 × 1/8 = ₹400.',
    calc: 3200 * (1 - 1 / 2 - 3 / 8),
  },
  {
    id: 'quant_052', t: 'Time & Work', s: 'Man-Days', d: 'M',
    q: '12 men can complete a work in 18 days. After working for 6 days, 4 more men join them. In how many days will the remaining work be finished?',
    o: ['8 days', '9 days', '10 days', '12 days'], a: 1,
    e: 'Total work = 12 × 18 = 216 man-days. After 6 days, 12 × 6 = 72 are done, leaving 144. With 16 men: 144 / 16 = 9 days.',
    calc: (12 * 18 - 12 * 6) / 16,
  },

  // ───────── Time, Speed & Distance (incl. Trains, Boats) ─────────
  {
    id: 'quant_053', t: 'Time, Speed & Distance', s: 'Unit Conversion', d: 'E',
    q: 'A car travels at 72 km/h. What is its speed in metres per second?',
    o: ['18 m/s', '20 m/s', '24 m/s', '25 m/s'], a: 1,
    e: 'Multiply km/h by 5/18 to get m/s: 72 × 5/18 = 20 m/s.',
    calc: (72 * 5) / 18,
  },
  {
    id: 'quant_054', t: 'Time, Speed & Distance', s: 'Trains', d: 'E',
    q: 'A train 150 m long passes a pole in 10 seconds. What is its speed in km/h?',
    o: ['45 km/h', '54 km/h', '60 km/h', '72 km/h'], a: 1,
    e: 'To pass a pole the train covers its own length: speed = 150/10 = 15 m/s = 15 × 18/5 = 54 km/h.',
    calc: (150 / 10) * 3.6,
  },
  {
    id: 'quant_055', t: 'Time, Speed & Distance', s: 'Trains', d: 'M',
    q: 'A 200 m long train running at 72 km/h crosses a bridge 300 m long. How long does it take?',
    o: ['15 s', '20 s', '25 s', '30 s'], a: 2,
    e: 'Distance = train + bridge = 500 m. Speed = 72 × 5/18 = 20 m/s. Time = 500/20 = 25 s.',
    calc: 500 / 20,
  },
  {
    id: 'quant_056', t: 'Time, Speed & Distance', s: 'Boats & Streams', d: 'E',
    q: 'A boat\'s speed is 18 km/h downstream and 12 km/h upstream. What is the speed of the stream?',
    o: ['2 km/h', '3 km/h', '5 km/h', '6 km/h'], a: 1,
    e: 'Stream speed = (downstream − upstream)/2 = (18 − 12)/2 = 3 km/h. (The boat\'s speed in still water is (18 + 12)/2 = 15 km/h.)',
    calc: (18 - 12) / 2,
  },
  {
    id: 'quant_057', t: 'Time, Speed & Distance', s: 'Average Speed', d: 'M',
    q: 'A person travels from A to B at 60 km/h and returns along the same route at 40 km/h. What is the average speed for the whole journey?',
    o: ['45 km/h', '48 km/h', '50 km/h', '52 km/h'], a: 1,
    e: 'For equal distances, average speed = 2xy/(x + y) = 2 × 60 × 40 / 100 = 48 km/h — not the simple mean of 50.',
    calc: (2 * 60 * 40) / 100,
  },
  {
    id: 'quant_058', t: 'Time, Speed & Distance', s: 'Trains', d: 'M',
    q: 'Two trains, 150 m and 210 m long, run on parallel tracks in the same direction at 72 km/h and 54 km/h. How long does the faster train take to completely pass the slower one?',
    o: ['36 s', '60 s', '72 s', '90 s'], a: 2,
    e: 'Relative speed (same direction) = 72 − 54 = 18 km/h = 5 m/s. Distance = 150 + 210 = 360 m. Time = 360/5 = 72 s.',
    calc: 360 / ((18 * 5) / 18),
  },
  {
    id: 'quant_059', t: 'Time, Speed & Distance', s: 'Late & Early', d: 'H',
    q: 'Walking at 5 km/h, a person reaches the office 6 minutes late. Walking at 6 km/h, he reaches 4 minutes early. What is the distance to the office?',
    o: ['4 km', '5 km', '6 km', '7.5 km'], a: 1,
    e: 'The two times differ by 6 + 4 = 10 minutes = 1/6 hour. d/5 − d/6 = 1/6, so d/30 = 1/6 and d = 5 km.',
    calc: 30 / 6,
    check: () => Math.abs(5 / 5 - 5 / 6 - 1 / 6) < 1e-9,
  },
  {
    id: 'quant_060', t: 'Time, Speed & Distance', s: 'Trains', d: 'H',
    q: 'A train crosses a man standing on a platform in 12 seconds and crosses the 180 m long platform itself in 20 seconds. What is the length of the train?',
    o: ['240 m', '270 m', '300 m', '320 m'], a: 1,
    e: 'The extra 8 seconds are spent covering the platform\'s 180 m, so the speed is 180/8 = 22.5 m/s. The train\'s length = 22.5 × 12 = 270 m.',
    calc: (180 / 8) * 12,
  },
  {
    id: 'quant_061', t: 'Time, Speed & Distance', s: 'Boats & Streams', d: 'H',
    q: 'A boat takes 4.5 hours to go 30 km downstream and come back the same distance. If the stream flows at 5 km/h, what is the speed of the boat in still water?',
    o: ['10 km/h', '12.5 km/h', '15 km/h', '20 km/h'], a: 2,
    e: 'Solve 30/(b + 5) + 30/(b − 5) = 4.5. Checking b = 15: 30/20 + 30/10 = 1.5 + 3 = 4.5 ✓. So the speed in still water is 15 km/h. (b = 20 gives 3.2 h and b = 12.5 gives about 5.7 h.)',
    check: () =>
      Math.abs(30 / 20 + 30 / 10 - 4.5) < 1e-9 &&
      [10, 12.5, 20].every((b) => Math.abs(30 / (b + 5) + 30 / (b - 5) - 4.5) > 0.1),
  },

  // ───────── Probability ─────────
  {
    id: 'quant_062', t: 'Probability', s: 'Coins', d: 'E',
    q: 'Two fair coins are tossed. What is the probability of getting at least one head?',
    o: ['1/4', '1/2', '3/4', '1'], a: 2,
    e: 'Outcomes: HH, HT, TH, TT. Only TT has no head, so P(at least one head) = 1 − 1/4 = 3/4.',
  },
  {
    id: 'quant_063', t: 'Probability', s: 'Dice', d: 'M',
    q: 'Two fair dice are rolled. What is the probability that the sum is 8?',
    o: ['1/9', '5/36', '1/6', '7/36'], a: 1,
    e: 'Favourable pairs: (2,6), (3,5), (4,4), (5,3), (6,2) — 5 of 36 outcomes. P = 5/36.',
    check: () => {
      let c = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === 8) c++;
      return c === 5;
    },
  },
  {
    id: 'quant_064', t: 'Probability', s: 'Drawing Without Replacement', d: 'M',
    q: 'A bag has 5 red and 3 blue balls. Two balls are drawn at random without replacement. What is the probability that both are red?',
    o: ['5/14', '25/64', '5/16', '3/8'], a: 0,
    e: 'P = C(5,2)/C(8,2) = 10/28 = 5/14. Equivalently (5/8) × (4/7) = 20/56 = 5/14.',
    check: () => Math.abs(nCr(5, 2) / nCr(8, 2) - 5 / 14) < 1e-12,
  },
  {
    id: 'quant_065', t: 'Probability', s: 'Independent Events', d: 'M',
    q: 'A and B independently try to solve a problem with probabilities 1/2 and 1/3 respectively. What is the probability that the problem gets solved?',
    o: ['1/6', '1/3', '5/6', '2/3'], a: 3,
    e: 'The problem stays unsolved only if both fail: (1/2) × (2/3) = 1/3. So P(solved) = 1 − 1/3 = 2/3.',
  },
  {
    id: 'quant_066', t: 'Probability', s: 'Calendar Probability', d: 'H',
    q: 'What is the probability that a leap year chosen at random has 53 Sundays?',
    o: ['1/7', '2/7', '3/7', '1/366'], a: 1,
    e: 'A leap year has 366 days = 52 weeks + 2 extra days. The two extra days form one of 7 equally likely pairs (Sun–Mon, Mon–Tue, …, Sat–Sun); two of these contain a Sunday. So P = 2/7.',
  },
  {
    id: 'quant_067', t: 'Probability', s: 'At Least One', d: 'H',
    q: 'From a group of 4 men and 3 women, 3 people are chosen at random. What is the probability that at least one woman is chosen?',
    o: ['4/35', '31/35', '18/35', '27/35'], a: 1,
    e: 'Use the complement. P(no woman) = C(4,3)/C(7,3) = 4/35. So P(at least one woman) = 1 − 4/35 = 31/35.',
    check: () => nCr(4, 3) === 4 && nCr(7, 3) === 35,
  },

  // ───────── Permutation & Combination ─────────
  {
    id: 'quant_068', t: 'Permutation & Combination', s: 'Arrangements', d: 'E',
    q: 'In how many ways can the letters of the word "LEAF" be arranged?',
    o: ['12', '16', '24', '48'], a: 2,
    e: 'LEAF has 4 distinct letters, so they can be arranged in 4! = 24 ways.',
    calc: 24,
  },
  {
    id: 'quant_069', t: 'Permutation & Combination', s: 'Repeated Letters', d: 'M',
    q: 'In how many distinct ways can the letters of the word "BANANA" be arranged?',
    o: ['60', '120', '180', '720'], a: 0,
    e: 'BANANA has 6 letters with A repeated 3 times and N twice. Arrangements = 6! / (3! × 2!) = 720 / 12 = 60.',
    calc: 720 / (6 * 2),
  },
  {
    id: 'quant_070', t: 'Permutation & Combination', s: 'Committee Selection', d: 'M',
    q: 'A committee of 3 is to be formed from 5 men and 4 women so that it has exactly 2 women. In how many ways can this be done?',
    o: ['20', '30', '40', '60'], a: 1,
    e: 'Choose 2 of 4 women: C(4,2) = 6. Choose 1 of 5 men: 5. Total = 6 × 5 = 30.',
    calc: nCr(4, 2) * nCr(5, 1),
  },
  {
    id: 'quant_071', t: 'Permutation & Combination', s: 'Vowels Together', d: 'H',
    q: 'In how many ways can the letters of the word "LEADER" be arranged so that the vowels always come together?',
    o: ['36', '72', '144', '360'], a: 1,
    e: 'Vowels E, A, E form one block. Units to arrange: L, D, R and the block = 4! = 24. Inside the block, E, A, E can be arranged in 3!/2! = 3 ways (E repeats). Total = 24 × 3 = 72.',
    calc: 24 * 3,
  },
  {
    id: 'quant_072', t: 'Permutation & Combination', s: 'Number Formation', d: 'H',
    q: 'How many 3-digit numbers divisible by 5 can be formed using the digits 0, 1, 2, 3, 4, 5 if no digit is repeated?',
    o: ['30', '36', '40', '48'], a: 1,
    e: 'Last digit 0: first digit from 5 choices, middle from 4 → 20. Last digit 5: first digit cannot be 0 or 5 → 4 choices, middle from the remaining 4 → 16. Total = 20 + 16 = 36.',
    check: () => {
      let c = 0;
      for (let n = 100; n <= 999; n++) {
        const d = String(n).split('');
        if (new Set(d).size === 3 && d.every((x) => '012345'.includes(x)) && n % 5 === 0) c++;
      }
      return c === 36;
    },
  },
  {
    id: 'quant_073', t: 'Permutation & Combination', s: 'Handshakes', d: 'E',
    q: 'At a party, each of 10 people shakes hands exactly once with every other person. How many handshakes take place?',
    o: ['45', '50', '90', '100'], a: 0,
    e: 'Each handshake is a pair of people: C(10,2) = 10 × 9 / 2 = 45.',
    calc: nCr(10, 2),
  },

  // ───────── Algebra ─────────
  {
    id: 'quant_074', t: 'Algebra', s: 'Linear Equations', d: 'E',
    q: 'The sum of two numbers is 45 and their difference is 9. What is the larger number?',
    o: ['18', '24', '27', '30'], a: 2,
    e: 'Adding x + y = 45 and x − y = 9 gives 2x = 54, so x = 27 (and y = 18).',
    calc: (45 + 9) / 2,
  },
  {
    id: 'quant_075', t: 'Algebra', s: 'Quadratic Equations', d: 'M',
    q: 'The roots of the equation x² − 7x + k = 0 differ by 1. What is the value of k?',
    o: ['10', '12', '6', '14'], a: 1,
    e: 'Let the roots be r and r + 1. Their sum 2r + 1 = 7 gives r = 3, so the roots are 3 and 4 and k = product = 12.',
    calc: 3 * 4,
  },
  {
    id: 'quant_076', t: 'Algebra', s: 'Identities', d: 'E',
    q: 'If x + 1/x = 4, what is the value of x² + 1/x²?',
    o: ['12', '14', '16', '18'], a: 1,
    e: 'Square both sides: x² + 2 + 1/x² = 16, so x² + 1/x² = 14.',
    calc: 4 * 4 - 2,
  },
  {
    id: 'quant_077', t: 'Algebra', s: 'Identities', d: 'M',
    q: 'If x + 1/x = 3, what is the value of x³ + 1/x³?',
    o: ['18', '24', '27', '36'], a: 0,
    e: 'Use (x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x). So 27 = x³ + 1/x³ + 9, giving x³ + 1/x³ = 18.',
    calc: 27 - 9,
  },
  {
    id: 'quant_078', t: 'Algebra', s: 'Quadratic Equations', d: 'H',
    q: 'One root of x² + px + 12 = 0 is three times the other. If p > 0, what is p?',
    o: ['6', '7', '8', '9'], a: 2,
    e: 'Let the roots be r and 3r. Product 3r² = 12 gives r = ±2. Sum of roots = 4r = −p. For p > 0 we need r = −2, so the roots are −2 and −6 and p = −(−8) = 8.',
    check: () => (-2) * (-6) === 12 && -(-2 + -6) === 8,
  },
  {
    id: 'quant_079', t: 'Algebra', s: 'Linear Equations', d: 'M',
    q: 'A two-digit number is 4 times the sum of its digits. If 18 is added to the number, its digits are reversed. What is the number?',
    o: ['24', '36', '42', '48'], a: 0,
    e: 'Let the number be 10a + b. 10a + b = 4(a + b) gives b = 2a. Adding 18 reverses the digits: 10a + b + 18 = 10b + a, so b − a = 2. Hence a = 2, b = 4 and the number is 24 (check: 24 = 4 × 6, and 24 + 18 = 42).',
    check: () => {
      const ok = (n: number) => n === 4 * (Math.floor(n / 10) + (n % 10)) && n + 18 === (n % 10) * 10 + Math.floor(n / 10);
      return ok(24) && ![36, 42, 48].some(ok);
    },
  },

  // ───────── Geometry & Mensuration ─────────
  {
    id: 'quant_080', t: 'Geometry & Mensuration', s: 'Squares', d: 'E',
    q: 'The perimeter of a square is 48 cm. What is its area?',
    o: ['96 cm²', '144 cm²', '160 cm²', '196 cm²'], a: 1,
    e: 'Side = 48/4 = 12 cm, so area = 12² = 144 cm².',
    calc: (48 / 4) ** 2,
  },
  {
    id: 'quant_081', t: 'Geometry & Mensuration', s: 'Circles', d: 'M',
    q: 'If the radius of a circle is increased by 10%, by what percentage does its area increase?',
    o: ['10%', '20%', '21%', '25%'], a: 2,
    e: 'Area ∝ r². The new area = (1.1)² = 1.21 times the old one, an increase of 21%.',
    calc: (1.1 ** 2 - 1) * 100,
  },
  {
    id: 'quant_082', t: 'Geometry & Mensuration', s: 'Polygons', d: 'E',
    q: 'What is the measure of each interior angle of a regular hexagon?',
    o: ['108°', '120°', '135°', '140°'], a: 1,
    e: 'Sum of interior angles = (n − 2) × 180° = 4 × 180° = 720°. Each of the 6 angles = 720/6 = 120°.',
    calc: 720 / 6,
  },
  {
    id: 'quant_083', t: 'Geometry & Mensuration', s: 'Triangles', d: 'E',
    q: 'A right-angled triangle has a hypotenuse of 13 cm and one side of 5 cm. What is its area?',
    o: ['30 cm²', '32.5 cm²', '60 cm²', '65 cm²'], a: 0,
    e: 'The other side = √(13² − 5²) = √144 = 12 cm. Area = ½ × 5 × 12 = 30 cm².',
    calc: 0.5 * 5 * Math.sqrt(169 - 25),
  },
  {
    id: 'quant_084', t: 'Geometry & Mensuration', s: 'Volume', d: 'M',
    q: 'A solid metal sphere of radius 6 cm is melted and recast into a cylinder of radius 4 cm. What is the height of the cylinder?',
    o: ['12 cm', '16 cm', '18 cm', '24 cm'], a: 2,
    e: 'Volume is conserved: (4/3)π × 6³ = π × 4² × h. So 288π = 16πh and h = 18 cm.',
    calc: ((4 / 3) * 216) / 16,
  },
  {
    id: 'quant_085', t: 'Geometry & Mensuration', s: 'Quadrilaterals', d: 'M',
    q: 'The diagonals of a rhombus are 24 cm and 10 cm. What is its perimeter?',
    o: ['48 cm', '52 cm', '56 cm', '60 cm'], a: 1,
    e: 'The diagonals of a rhombus bisect each other at right angles, so each side = √(12² + 5²) = √169 = 13 cm. Perimeter = 4 × 13 = 52 cm.',
    calc: 4 * Math.sqrt(144 + 25),
  },
  {
    id: 'quant_086', t: 'Geometry & Mensuration', s: 'Pythagoras', d: 'H',
    q: 'A 25 m ladder leans against a wall with its top 24 m above the ground. If its foot is moved 8 m farther away from the wall, by how much does the top slide down?',
    o: ['2 m', '3 m', '4 m', '5 m'], a: 2,
    e: 'Initially the foot is √(25² − 24²) = 7 m from the wall. After moving, it is 15 m away, so the top is at √(625 − 225) = 20 m. It slides down 24 − 20 = 4 m.',
    calc: 24 - Math.sqrt(625 - 15 ** 2),
  },

  // ───────── Data Interpretation ─────────
  {
    id: 'quant_087', t: 'Data Interpretation', s: 'Growth Rate', d: 'E',
    table: { caption: 'Annual sales of Company X (₹ lakh)', head: ['Year', '2019', '2020', '2021', '2022', '2023'], rows: [['Sales', 120, 150, 135, 180, 210]] },
    q: 'By what percentage did sales grow from 2019 to 2020?',
    o: ['20%', '25%', '30%', '15%'], a: 1,
    e: 'Growth = (150 − 120)/120 × 100 = 30/120 × 100 = 25%.',
    calc: ((150 - 120) / 120) * 100,
  },
  {
    id: 'quant_088', t: 'Data Interpretation', s: 'Average', d: 'M',
    table: { caption: 'Annual sales of Company X (₹ lakh)', head: ['Year', '2019', '2020', '2021', '2022', '2023'], rows: [['Sales', 120, 150, 135, 180, 210]] },
    q: 'What are the average annual sales over the five years?',
    o: ['₹155 lakh', '₹159 lakh', '₹162 lakh', '₹165 lakh'], a: 1,
    e: 'Total = 120 + 150 + 135 + 180 + 210 = 795. Average = 795 / 5 = ₹159 lakh.',
    calc: (120 + 150 + 135 + 180 + 210) / 5,
  },
  {
    id: 'quant_089', t: 'Data Interpretation', s: 'Growth Rate', d: 'M',
    table: { caption: 'Annual sales of Company X (₹ lakh)', head: ['Year', '2019', '2020', '2021', '2022', '2023'], rows: [['Sales', 120, 150, 135, 180, 210]] },
    q: 'In which year was the percentage growth over the previous year the highest?',
    o: ['2020', '2021', '2022', '2023'], a: 2,
    e: 'Year-on-year growth: 2020: +25%, 2021: −10%, 2022: 45/135 = +33.3%, 2023: 30/180 = +16.7%. The highest is 2022, even though 2023 has the largest absolute sales.',
    check: () => {
      const s = [120, 150, 135, 180, 210];
      const g = s.slice(1).map((v, i) => v / s[i] - 1);
      return g.indexOf(Math.max(...g)) === 2;
    },
  },
  {
    id: 'quant_090', t: 'Data Interpretation', s: 'Pie / Share', d: 'H',
    table: {
      caption: 'Company expenses — total ₹50 lakh',
      head: ['Head', 'Salary', 'Rent', 'Raw material', 'Marketing', 'Misc'],
      rows: [['Share', '40%', '15%', '25%', '12%', '8%']],
    },
    q: 'Next year the salary expense rises by 10% and every other expense stays the same. What share of the new total will salary be (approximately)?',
    o: ['40.0%', '41.5%', '42.3%', '44.0%'], a: 2,
    e: 'Salary now = 40% of 50 = ₹20 lakh; next year 22. New total = 50 + 2 = 52. Share = 22/52 × 100 ≈ 42.3%.',
    calc: (22 / 52) * 100,
  },

  // ───────── Clocks & Calendars ─────────
  {
    id: 'quant_091', t: 'Clocks & Calendars', s: 'Clock Angles', d: 'E',
    q: 'What is the angle between the hour and minute hands of a clock at 3:30?',
    o: ['60°', '75°', '90°', '105°'], a: 1,
    e: 'Angle = |30H − 5.5M| = |30 × 3 − 5.5 × 30| = |90 − 165| = 75°.',
    calc: Math.abs(30 * 3 - 5.5 * 30),
  },
  {
    id: 'quant_092', t: 'Clocks & Calendars', s: 'Calendars', d: 'E',
    q: 'If 1 January 2023 was a Sunday, what day of the week was 1 January 2024?',
    o: ['Sunday', 'Monday', 'Tuesday', 'Saturday'], a: 1,
    e: '2023 is not a leap year, so it has 365 days = 52 weeks + 1 odd day. The day moves forward by one: Sunday → Monday.',
    check: () => new Date(Date.UTC(2023, 0, 1)).getUTCDay() === 0 && new Date(Date.UTC(2024, 0, 1)).getUTCDay() === 1,
  },
  {
    id: 'quant_093', t: 'Clocks & Calendars', s: 'Clock Hands', d: 'M',
    q: 'How many times do the hour and minute hands of a clock coincide in a day (24 hours)?',
    o: ['20', '22', '24', '48'], a: 1,
    e: 'The hands coincide every 12/11 hours, i.e. 11 times in 12 hours (the 11 → 12 o\'clock meeting happens at 12:00 itself). In 24 hours that is 22 times.',
    calc: 22,
  },
  {
    id: 'quant_094', t: 'Clocks & Calendars', s: 'Clock Hands', d: 'H',
    q: 'At what time between 4 and 5 o\'clock are the hands of a clock exactly together?',
    o: ['4:20', '4:21 9/11', '4:22 2/11', '4:24'], a: 1,
    e: 'At 4:00 the minute hand is 20 minute-divisions behind. It gains 11/12 of a division per minute (55 per hour), so it catches up in 20 × 12/11 = 240/11 = 21 9/11 minutes. The hands meet at 4:21 9/11.',
    check: () => Math.abs(240 / 11 - (21 + 9 / 11)) < 1e-9 && Math.abs(5.5 * (240 / 11) - 30 * 4) < 1e-9,
  },
  {
    id: 'quant_095', t: 'Clocks & Calendars', s: 'Calendars', d: 'H',
    q: 'On which day of the week did 15 August 1947 fall?',
    o: ['Thursday', 'Friday', 'Saturday', 'Sunday'], a: 1,
    e: 'Count odd days. Up to 1600: 0; 1601–1900: 300 years = 1 odd day; 1901–1946: 46 years with 11 leap years = 46 + 11 = 57 → 1 odd day. Jan–Jul 1947: 31+28+31+30+31+30+31 = 212 → 2 odd days; plus 15 days → 1 odd day. Total = 0 + 1 + 1 + 2 + 1 = 5 → Friday.',
    check: () => new Date(Date.UTC(1947, 7, 15)).getUTCDay() === 5,
  },
];

export default build('quant', rawQuant);
