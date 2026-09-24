// Question-bank quality gate, run by scripts/validate-aptitude.mjs. Returns a
// list of human-readable problems; an empty list means the bank is clean.
import type { Raw } from './bank/build';
import { CATEGORY_BY_KEY } from './taxonomy';
import type { CategoryKey } from './types';

/** Every number appearing in an option ("₹1,200" → 1200, "2^20" → 2, 20). */
function numbersIn(s: string): number[] {
  return (s.replace(/(\d),(?=\d{2,3}\b)/g, '$1').match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function validateBank(groups: Record<CategoryKey, Raw[]>): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const texts = new Map<string, string>();

  for (const [cat, raws] of Object.entries(groups) as [CategoryKey, Raw[]][]) {
    const topics = new Set(CATEGORY_BY_KEY[cat].topics);
    for (const r of raws) {
      const p = (msg: string) => problems.push(`${r.id}: ${msg}`);

      if (ids.has(r.id)) p('duplicate id');
      ids.add(r.id);
      if (!topics.has(r.t)) p(`topic "${r.t}" is not a ${cat} topic`);
      if (!r.s.trim()) p('empty subtopic');
      if (!['E', 'M', 'H'].includes(r.d)) p(`bad difficulty ${r.d}`);
      if (!r.q.trim()) p('empty question');
      if (r.e.trim().length < 20) p('explanation too short');

      if (r.o.length !== 4) p(`expected 4 options, got ${r.o.length}`);
      if (r.o.some((o) => !o.trim())) p('empty option');
      if (new Set(r.o.map((o) => o.trim().toLowerCase())).size !== r.o.length) p('duplicate options');
      if (!Number.isInteger(r.a) || r.a < 0 || r.a > 3) p('correct answer index out of range');

      // No duplicate questions: same stem + same passage/table/code = same question.
      const key = norm(r.q + (r.passage ?? '') + JSON.stringify(r.table ?? '') + (r.code ?? ''));
      if (texts.has(key)) p(`duplicate of ${texts.get(key)}`);
      texts.set(key, r.id);

      // Options that only make sense in authored order must be flagged fixed.
      const orderSensitive = r.o.some((o) => /\b(all|none) of (the above|these)\b|\bboth\b.*\b(and|follow)|\bneither\b|\beither\b/i.test(o));
      if (orderSensitive && !r.fixed) p('option set references other options but is not marked fixed');

      // Explanation must agree with the keyed answer: a short correct option
      // (a number, a word, a letter code) has to appear in the explanation.
      const correct = r.o[r.a];
      if (correct && correct.length <= 24 && !r.fixed) {
        const want = norm(correct);
        if (want && !norm(r.e).includes(want)) p(`explanation never mentions the correct option "${correct}"`);
      }

      if (r.calc !== undefined) {
        if (!Number.isFinite(r.calc)) p('calc is not a finite number');
        const hit = (o: string) => numbersIn(o).some((n) => Math.abs(n - r.calc!) <= Math.max(0.01, Math.abs(r.calc!) * 0.001));
        if (!hit(correct)) p(`calc ${r.calc} does not match correct option "${correct}"`);
        r.o.forEach((o, i) => {
          if (i !== r.a && hit(o)) p(`calc ${r.calc} also matches wrong option "${o}"`);
        });
      }
      if (r.check) {
        try {
          if (r.check() !== true) p('check() returned false');
        } catch (err) {
          p(`check() threw: ${(err as Error).message}`);
        }
      }
    }
  }
  return problems;
}
