// Site tags (LeetCode topic tags, GFG tags, CodeChef tags) -> VizuCode categories.
// First match wins, most specific first.
const RULES: [string, string][] = [
  ['Linked List', 'Linked List'],
  ['Trie', 'Tries & Design'],
  ['Design', 'Tries & Design'],
  ['Heap', 'Heap / Priority Queue'],
  ['Priority Queue', 'Heap / Priority Queue'],
  ['Backtracking', 'Backtracking'],
  ['Dynamic Programming', 'Dynamic Programming'],
  ['Graph', 'Graphs'],
  ['Breadth-First Search', 'Graphs'],
  ['Union Find', 'Graphs'],
  ['Tree', 'Trees'],
  ['Binary Search', 'Binary Search'],
  ['Sliding Window', 'Sliding Window'],
  ['Two Pointers', 'Two Pointers'],
  ['Monotonic Stack', 'Stack'],
  ['Stack', 'Stack'],
  ['Interval', 'Intervals'],
  ['Greedy', 'Greedy'],
  ['Bit Manipulation', 'Math & Bit Manipulation'],
  ['Bit Magic', 'Math & Bit Manipulation'],
  ['Math', 'Math & Bit Manipulation'],
  ['String', 'Strings'],
  ['Hash Table', 'Arrays & Hashing'],
  ['Hash', 'Arrays & Hashing'],
  ['Array', 'Arrays & Hashing'],
];

export const CATEGORY_RULES_FALLBACK = 'Arrays & Hashing';

export function guessCategory(tags: string[]): string {
  const low = tags.map((t) => t.toLowerCase());
  for (const [key, cat] of RULES) if (low.some((t) => t.includes(key.toLowerCase()))) return cat;
  return CATEGORY_RULES_FALLBACK;
}
