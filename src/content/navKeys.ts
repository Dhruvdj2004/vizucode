// Route-base → nav-section mapping used by App.tsx's header, which renders on
// every route and must not pull in full module content (topics, code
// snippets) just to know which nav link to highlight. Keep these keys in
// sync with each module's `key` in ../dbms, ../os, ../oops, ../cn, ../sql,
// ../sd and ../dsa — a mismatch only misses a nav highlight, nothing breaks.
const CORE_KEYS = ['dbms', 'os', 'oops', 'cn', 'sql', 'sd'];
const REVISION_KEYS = ['revision'];
const NON_SECTION_BASES = ['login', 'register', 'upgrade', 'feedback'];

/** Which header nav entry should light up for a given pathname. */
export function navSection(pathname: string): 'dsa' | 'revision' | 'core' | 'none' {
  const base = pathname.split('/')[1] ?? '';
  if (base === 'core' || CORE_KEYS.includes(base)) return 'core';
  if (REVISION_KEYS.includes(base)) return 'revision';
  if (NON_SECTION_BASES.includes(base)) return 'none';
  return 'dsa';
}
