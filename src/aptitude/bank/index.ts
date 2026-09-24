// The curated question bank. Tests are drawn from here at random — never
// generated on the fly — so every attempt uses reviewed, validated questions.
// To grow the bank: add entries to a category file (new ids only, never
// renumber) and run `node scripts/validate-aptitude.mjs`.
import type { AptQuestion } from '../types';
import quant from './quant';
import logical from './logical';
import analytical from './analytical';
import verbal from './verbal';
import corecs from './corecs';

export const QUESTION_BANK: AptQuestion[] = [...quant, ...logical, ...analytical, ...verbal, ...corecs];

export const QUESTION_BY_ID: Map<string, AptQuestion> = new Map(QUESTION_BANK.map((q) => [q.id, q]));
