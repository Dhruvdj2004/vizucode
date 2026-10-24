import type { ProblemDef, Step, ArrayState } from '../../lib/types';
import { parseInt1 } from '../../lib/parse';
import { A, B, C, F, L } from '../../lib/trace';

function parseWords(input: string): string[] | string {
  const words = input
    .replace(/[\[\]"]/g, '')
    .split(/[,\s]+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return 'Enter at least one word.';
  if (words.length > 12) return 'Keep it to at most 12 words so the visualization stays readable.';
  for (const w of words) {
    if (!/^[a-zA-Z0-9]+$/.test(w)) return `Word "${w}" should contain alphanumeric characters only.`;
  }
  return words;
}

export const problem: ProblemDef = {
  slug: 'justified-text',
  title: 'Justified Text',
  category: 'Strings',
  difficulty: 'Medium',
  leetcode: 'https://www.geeksforgeeks.org/dsa/justify-the-given-text-based-on-the-given-width-of-each-line/',
  technique: 'Greedy line packing with proportional space distribution',
  widget: 'array',
  widgetTitle: 'Words & Line Formatting',
  inputs: [
    {
      key: 'words',
      label: 'Words array',
      defaultValue: 'geeksforgeeks, is, the, best, computer, science, portal, for, geeks',
      wide: true,
    },
    {
      key: 'l',
      label: 'Line width l',
      defaultValue: '16',
    },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<string> fullJustify(vector<string>& words, int maxWidth) {'),
      L('        vector<string> result;', 'init'),
      L('        int i = 0, n = words.size();'),
      L('        while (i < n) {', 'pack'),
      L('            int j = i + 1, lineLen = words[i].length();'),
      L('            while (j < n && lineLen + 1 + words[j].length() <= maxWidth) {', 'check'),
      L('                lineLen += 1 + words[j].length();'),
      L('                j++;'),
      L('            }'),
      L('            string line = "";'),
      L('            int numWords = j - i;'),
      L('            if (j == n || numWords == 1) {', 'lastLine'),
      L('                for (int k = i; k < j; k++) line += words[k] + (k < j - 1 ? " " : "");'),
      L('                while (line.length() < maxWidth) line += " ";'),
      L('            } else {', 'justify'),
      L('                int totalChars = 0;'),
      L('                for (int k = i; k < j; k++) totalChars += words[k].length();'),
      L('                int totalSpaces = maxWidth - totalChars;'),
      L('                int spaceEq = totalSpaces / (numWords - 1);'),
      L('                int extraSpaces = totalSpaces % (numWords - 1);'),
      L('                for (int k = i; k < j; k++) {'),
      L('                    line += words[k];'),
      L('                    if (k < j - 1) {'),
      L('                        int s = spaceEq + (k - i < extraSpaces ? 1 : 0);'),
      L('                        line += string(s, \' \');'),
      L('                    }'),
      L('                }'),
      L('            }'),
      L('            result.push_back(line);', 'push'),
      L('            i = j;'),
      L('        }'),
      L('        return result;'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<String> fullJustify(String[] words, int maxWidth) {'),
      L('        List<String> result = new ArrayList<>();', 'init'),
      L('        int i = 0, n = words.length;'),
      L('        while (i < n) {', 'pack'),
      L('            int j = i + 1, lineLen = words[i].length();'),
      L('            while (j < n && lineLen + 1 + words[j].length() <= maxWidth) {', 'check'),
      L('                lineLen += 1 + words[j].length();'),
      L('                j++;'),
      L('            }'),
      L('            StringBuilder line = new StringBuilder();'),
      L('            int numWords = j - i;'),
      L('            if (j == n || numWords == 1) {', 'lastLine'),
      L('                for (int k = i; k < j; k++) line.append(words[k]).append(k < j - 1 ? " " : "");'),
      L('                while (line.length() < maxWidth) line.append(" ");'),
      L('            } else {', 'justify'),
      L('                int totalChars = 0;'),
      L('                for (int k = i; k < j; k++) totalChars += words[k].length();'),
      L('                int totalSpaces = maxWidth - totalChars;'),
      L('                int spaceEq = totalSpaces / (numWords - 1);'),
      L('                int extraSpaces = totalSpaces % (numWords - 1);'),
      L('                for (int k = i; k < j; k++) {'),
      L('                    line.append(words[k]);'),
      L('                    if (k < j - 1) {'),
      L('                        int s = spaceEq + (k - i < extraSpaces ? 1 : 0);'),
      L('                        for (int sp = 0; sp < s; sp++) line.append(" ");'),
      L('                    }'),
      L('                }'),
      L('            }'),
      L('            result.add(line.toString());', 'push'),
      L('            i = j;'),
      L('        }'),
      L('        return result;'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsedWords = parseWords(values.words);
    if (typeof parsedWords === 'string') return { error: parsedWords };

    const l = parseInt1(values.l, 'Line width l', { min: 1, max: 60 });
    if (typeof l === 'string') return { error: l };

    for (const w of parsedWords) {
      if (w.length > l) {
        return { error: `Word "${w}" (length ${w.length}) exceeds maximum line width l = ${l}.` };
      }
    }

    const words = parsedWords;
    const n = words.length;
    const lines: string[] = [];
    const steps: Step[] = [];

    steps.push({
      tag: 'init',
      trace: ['Initialize line formatting for ', B(n), ' word(s) with max line width ', B(l), '.'],
      state: {
        arr: words,
        ptrs: [{ name: 'i', i: 0, c: 'a' }],
        aggs: [{ label: 'Formatted Lines', value: '0', c: 'a' }],
      } satisfies ArrayState,
    });

    let i = 0;
    while (i < n) {
      let j = i + 1;
      let lineLen = words[i].length;

      steps.push({
        tag: 'pack',
        trace: [
          'Start line ',
          B(lines.length + 1),
          ': pick word ',
          A(`"${words[i]}"`),
          ' (len ',
          B(words[i].length),
          ').',
        ],
        state: {
          arr: words,
          window: [i, i],
          ptrs: [
            { name: 'i', i, c: 'a' },
            { name: 'j', i, c: 'b' },
          ],
          mark: Object.fromEntries(
            words.map((_, idx) => [idx, idx < i ? 'dim' : idx === i ? 'active' : 'good'])
          ),
          aggs: [
            { label: 'Min width needed', value: `${lineLen}`, c: 'a' },
            { label: 'Lines done', value: `${lines.length}`, c: 'b' },
          ],
        } satisfies ArrayState,
      });

      while (j < n && lineLen + 1 + words[j].length <= l) {
        lineLen += 1 + words[j].length;
        steps.push({
          tag: 'check',
          trace: [
            'Word ',
            A(`"${words[j]}"`),
            ' fits! New minimum width with spaces = ',
            B(lineLen),
            ' ≤ ',
            B(l),
            '.',
          ],
          state: {
            arr: words,
            window: [i, j],
            ptrs: [
              { name: 'i', i, c: 'a' },
              { name: 'j', i, c: 'b' },
            ],
            mark: Object.fromEntries(
              words.map((_, idx) => [idx, idx < i ? 'dim' : idx >= i && idx <= j ? 'active' : 'good'])
            ),
            aggs: [
              { label: 'Min width needed', value: `${lineLen}`, c: 'a' },
              { label: 'Lines done', value: `${lines.length}`, c: 'b' },
            ],
          } satisfies ArrayState,
        });
        j++;
      }

      if (j < n) {
        steps.push({
          tag: 'check',
          trace: [
            'Word ',
            F(`"${words[j]}"`),
            ' cannot fit (would require width ',
            F(lineLen + 1 + words[j].length),
            ' > ',
            B(l),
            '). Pack window set to words ',
            B(`[${i}..${j - 1}]`),
            '.',
          ],
          state: {
            arr: words,
            window: [i, j - 1],
            ptrs: [
              { name: 'i', i, c: 'a' },
              { name: 'next', i: j, c: 'b' },
            ],
            mark: Object.fromEntries(
              words.map((_, idx) => [
                idx,
                idx < i ? 'dim' : idx >= i && idx < j ? 'active' : idx === j ? 'dim' : 'good',
              ])
            ),
            aggs: [
              { label: 'Words in line', value: `${j - i}`, c: 'b' },
              { label: 'Lines done', value: `${lines.length}`, c: 'b' },
            ],
          } satisfies ArrayState,
        });
      }

      let formattedLine = '';
      const numWords = j - i;
      const isLastLine = j === n;

      if (isLastLine || numWords === 1) {
        let line = '';
        for (let k = i; k < j; k++) {
          line += words[k] + (k < j - 1 ? ' ' : '');
        }
        while (line.length < l) {
          line += ' ';
        }
        formattedLine = line;

        steps.push({
          tag: 'lastLine',
          trace: isLastLine
            ? [
                'Last line reached: left-justify words with 1 space each and pad trailing spaces up to width ',
                B(l),
                '.',
              ]
            : [
                'Single-word line: left-justify ',
                B(`"${words[i]}"`),
                ' and pad trailing spaces up to width ',
                B(l),
                '.',
              ],
          state: {
            arr: words,
            window: [i, j - 1],
            ptrs: [
              { name: 'start', i, c: 'a' },
              { name: 'end', i: j - 1, c: 'b' },
            ],
            mark: Object.fromEntries(
              words.map((_, idx) => [idx, idx >= i && idx < j ? 'good' : idx < i ? 'dim' : 'good'])
            ),
            aggs: [
              { label: 'Line result', value: `"${formattedLine}"`, c: 'c' },
              { label: 'Lines done', value: `${lines.length}`, c: 'b' },
            ],
          } satisfies ArrayState,
        });
      } else {
        let totalChars = 0;
        for (let k = i; k < j; k++) totalChars += words[k].length;
        const totalSpaces = l - totalChars;
        const gaps = numWords - 1;
        const spaceEq = Math.floor(totalSpaces / gaps);
        const extraSpaces = totalSpaces % gaps;

        let line = '';
        for (let k = i; k < j; k++) {
          line += words[k];
          if (k < j - 1) {
            const count = spaceEq + (k - i < extraSpaces ? 1 : 0);
            line += ' '.repeat(count);
          }
        }
        formattedLine = line;

        steps.push({
          tag: 'justify',
          trace: [
            'Fully justify: distribute ',
            B(totalSpaces),
            ' spaces across ',
            B(gaps),
            ' gap(s) → ',
            B(spaceEq),
            ' space(s)/gap with ',
            B(extraSpaces),
            ' left gap(s) getting +1 extra space.',
          ],
          state: {
            arr: words,
            window: [i, j - 1],
            ptrs: [
              { name: 'start', i, c: 'a' },
              { name: 'end', i: j - 1, c: 'b' },
            ],
            mark: Object.fromEntries(
              words.map((_, idx) => [idx, idx >= i && idx < j ? 'good' : idx < i ? 'dim' : 'good'])
            ),
            aggs: [
              { label: 'Line result', value: `"${formattedLine}"`, c: 'c' },
              { label: 'Lines done', value: `${lines.length}`, c: 'b' },
            ],
          } satisfies ArrayState,
        });
      }

      lines.push(formattedLine);

      steps.push({
        tag: 'push',
        trace: ['Formatted line ', B(lines.length), ': ', C(`"${formattedLine}"`), '.'],
        state: {
          arr: words,
          window: [i, j - 1],
          ptrs: [{ name: 'done', i: j - 1, c: 'c' }],
          mark: Object.fromEntries(words.map((_, idx) => [idx, idx < j ? 'final' : 'good'])),
          aggs: [
            { label: 'Latest line', value: `"${formattedLine}"`, c: 'c' },
            { label: 'Total lines', value: `${lines.length}`, c: 'b' },
          ],
        } satisfies ArrayState,
      });

      i = j;
    }

    const resultStr = '[' + lines.map((line) => JSON.stringify(line)).join(', ') + ']';

    return {
      steps,
      result: resultStr,
      resultDetail: `${lines.length} fully justified line(s) formatted for width l = ${l}`,
    };
  },
  note: 'By greedily packing as many words as fit into each line, we determine line boundaries in a single pass. Spaces are distributed evenly across internal gaps with left gaps prioritized for remainders, while single-word and final lines are left-justified.',
  complexity: { time: 'O(N)', space: 'O(N)' },
};
