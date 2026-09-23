// Arrays & Hashing, part 2 (grid + prefix-sum problems).
import type { ArrayState, MatrixState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

export function parseGrid(s: string, opts?: { maxR?: number; maxC?: number; chars?: RegExp }): string[][] | string {
  const rows = s
    .split(/[;|]/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => (r.includes(',') ? r.split(',').map((c) => c.trim()) : r.split('')));
  if (rows.length === 0) return 'Enter a grid (rows separated by ";").';
  const w = rows[0].length;
  if (!rows.every((r) => r.length === w)) return 'All rows must have the same length.';
  if (rows.length > (opts?.maxR ?? 9) || w > (opts?.maxC ?? 9)) return `Keep it to at most ${opts?.maxR ?? 9}×${opts?.maxC ?? 9}.`;
  return rows;
}

export function parseNumGrid(s: string, maxR = 8, maxC = 8): number[][] | string {
  const g = parseGrid(s, { maxR, maxC });
  if (typeof g === 'string') return g;
  const out: number[][] = [];
  for (const row of g) {
    const r: number[] = [];
    for (const c of row) {
      const n = Number(c);
      if (!Number.isFinite(n)) return `"${c}" is not a number.`;
      r.push(n);
    }
    out.push(r);
  }
  return out;
}

/* ================= 7. Valid Sudoku ================= */
const validSudoku: ProblemDef = {
  slug: 'valid-sudoku',
  title: 'Valid Sudoku',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/valid-sudoku/',
  technique: 'One pass with three families of hash sets: rows, columns, and 3×3 boxes.',
  widget: 'matrix',
  widgetTitle: 'Board',
  inputs: [
    {
      key: 'board',
      label: 'Board (9 rows, ";" separated, "." = empty)',
      defaultValue: '53..7....;6..195...;.98....6.;8...6...3;4..8.3..1;7...2...6;.6....28.;...419..5;....8..79',
      wide: true,
    },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool isValidSudoku(vector<vector<char>>& board) {'),
      L('        set<string> seen;', 'init'),
      L('        for (int r = 0; r < 9; r++)', 'loop'),
      L('            for (int c = 0; c < 9; c++) {', 'loop'),
      L('                char d = board[r][c];', 'cell'),
      L('                if (d == \'.\') continue;', 'cell'),
      L('                string row = "r" + to_string(r) + d;', 'keys'),
      L('                string col = "c" + to_string(c) + d;', 'keys'),
      L('                string box = "b" + to_string(r/3) + to_string(c/3) + d;', 'keys'),
      L('                if (!seen.insert(row).second ||', 'dup'),
      L('                    !seen.insert(col).second ||', 'dup'),
      L('                    !seen.insert(box).second)', 'dup'),
      L('                    return false;', 'dup'),
      L('            }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean isValidSudoku(char[][] board) {'),
      L('        Set<String> seen = new HashSet<>();', 'init'),
      L('        for (int r = 0; r < 9; r++)', 'loop'),
      L('            for (int c = 0; c < 9; c++) {', 'loop'),
      L('                char d = board[r][c];', 'cell'),
      L('                if (d == \'.\') continue;', 'cell'),
      L('                if (!seen.add("r" + r + d) ||', 'keys', 'dup'),
      L('                    !seen.add("c" + c + d) ||', 'dup'),
      L('                    !seen.add("b" + r/3 + c/3 + d))', 'dup'),
      L('                    return false;', 'dup'),
      L('            }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseGrid(values.board, { maxR: 9, maxC: 9 });
    if (typeof g === 'string') return { error: g };
    if (g.length !== 9 || g[0].length !== 9) return { error: 'Board must be exactly 9×9.' };

    const steps: Step[] = [];
    const seen = new Set<string>();
    const checked: Record<string, 'good' | 'active' | 'dim' | 'final'> = {};
    const st = (mark?: MatrixState['mark']): MatrixState => ({
      grid: g.map((row) => row.map((c) => (c === '.' ? '' : c))),
      rowLabels: [...Array(9)].map((_, i) => i),
      colLabels: [...Array(9)].map((_, i) => i),
      mark: { ...checked, ...mark },
    });

    steps.push({ tag: 'init', trace: ['Scan every filled cell once; each digit must be new to its ', A('row'), ', ', A('column'), ', and ', A('3×3 box'), '.'], state: st() });
    let ok = true;
    let conflictMsg = '';
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const d = g[r][c];
        if (d === '.') continue;
        const keys = [`r${r}${d}`, `c${c}${d}`, `b${Math.floor(r / 3)}${Math.floor(c / 3)}${d}`];
        const clash = keys.find((k) => seen.has(k));
        if (clash) {
          ok = false;
          const kind = clash[0] === 'r' ? `row ${r}` : clash[0] === 'c' ? `column ${c}` : 'its 3×3 box';
          conflictMsg = `digit ${d} repeats in ${kind}`;
          steps.push({
            tag: 'dup',
            trace: ['Cell (', A(r), ',', A(c), ') holds ', F(d), ' — but ', F(d), ` already appeared in ${kind}. Invalid: return `, C('false'), '.'],
            state: st({ [`${r},${c}`]: 'dim' }),
          });
          break outer;
        }
        keys.forEach((k) => seen.add(k));
        checked[`${r},${c}`] = 'good';
        steps.push({
          tag: 'keys',
          trace: ['Cell (', A(r), ',', A(c), ') = ', A(d), ' — new to row ', B(r), ', col ', B(c), ', and box ', B(`${Math.floor(r / 3)},${Math.floor(c / 3)}`), '. OK.'],
          state: st({ [`${r},${c}`]: 'active' }),
        });
      }
    }
    if (ok) steps.push({ tag: 'ret', trace: ['Every filled cell passed all three uniqueness checks — the board is ', C('valid'), '.'], state: st() });
    return { steps, result: String(ok), resultDetail: ok ? 'no rule violated' : conflictMsg };
  },
  note: 'Validity is purely local: a board is valid iff no digit repeats within any single unit. Encoding "digit d in row r / col c / box b" as set keys lets one linear scan test all 27 units simultaneously.',
  complexity: { time: 'O(81)', space: 'O(81)' },
  brute: {
    label: 'Three passes',
    technique: 'Check the 9 rows, then the 9 columns, then the 9 boxes — a fresh set per unit.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool isValidSudoku(vector<vector<char>>& board) {'),
        L('        for (int r = 0; r < 9; r++) {', 'rows'),
        L('            unordered_set<char> seen;', 'rows'),
        L('            for (int c = 0; c < 9; c++) {', 'rows'),
        L('                char d = board[r][c];', 'rows'),
        L('                if (d != \'.\' && !seen.insert(d).second) return false;', 'duprows'),
        L('            }'),
        L('        }'),
        L('        for (int c = 0; c < 9; c++) {', 'cols'),
        L('            unordered_set<char> seen;', 'cols'),
        L('            for (int r = 0; r < 9; r++) {', 'cols'),
        L('                char d = board[r][c];', 'cols'),
        L('                if (d != \'.\' && !seen.insert(d).second) return false;', 'dupcols'),
        L('            }'),
        L('        }'),
        L('        for (int b = 0; b < 9; b++) {', 'boxes'),
        L('            unordered_set<char> seen;', 'boxes'),
        L('            for (int i = 0; i < 9; i++) {', 'boxes'),
        L('                char d = board[b / 3 * 3 + i / 3][b % 3 * 3 + i % 3];', 'boxes'),
        L('                if (d != \'.\' && !seen.insert(d).second) return false;', 'dupboxes'),
        L('            }'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean isValidSudoku(char[][] board) {'),
        L('        for (int r = 0; r < 9; r++) {', 'rows'),
        L('            Set<Character> seen = new HashSet<>();', 'rows'),
        L('            for (int c = 0; c < 9; c++) {', 'rows'),
        L('                char d = board[r][c];', 'rows'),
        L('                if (d != \'.\' && !seen.add(d)) return false;', 'duprows'),
        L('            }'),
        L('        }'),
        L('        for (int c = 0; c < 9; c++) {', 'cols'),
        L('            Set<Character> seen = new HashSet<>();', 'cols'),
        L('            for (int r = 0; r < 9; r++) {', 'cols'),
        L('                char d = board[r][c];', 'cols'),
        L('                if (d != \'.\' && !seen.add(d)) return false;', 'dupcols'),
        L('            }'),
        L('        }'),
        L('        for (int b = 0; b < 9; b++) {', 'boxes'),
        L('            Set<Character> seen = new HashSet<>();', 'boxes'),
        L('            for (int i = 0; i < 9; i++) {', 'boxes'),
        L('                char d = board[b / 3 * 3 + i / 3][b % 3 * 3 + i % 3];', 'boxes'),
        L('                if (d != \'.\' && !seen.add(d)) return false;', 'dupboxes'),
        L('            }'),
        L('        }'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseGrid(values.board, { maxR: 9, maxC: 9 });
      if (typeof g === 'string') return { error: g };
      if (g.length !== 9 || g[0].length !== 9) return { error: 'Board must be exactly 9×9.' };

      const steps: Step[] = [];
      const st = (mark?: MatrixState['mark']): MatrixState => ({
        grid: g.map((row) => row.map((c) => (c === '.' ? '' : c))),
        rowLabels: [...Array(9)].map((_, i) => i),
        colLabels: [...Array(9)].map((_, i) => i),
        mark,
      });
      const units: { kind: 'rows' | 'cols' | 'boxes'; name: string; cells: [number, number][] }[] = [];
      for (let r = 0; r < 9; r++) units.push({ kind: 'rows', name: `row ${r}`, cells: [...Array(9)].map((_, c) => [r, c]) });
      for (let c = 0; c < 9; c++) units.push({ kind: 'cols', name: `column ${c}`, cells: [...Array(9)].map((_, r) => [r, c]) });
      for (let b = 0; b < 9; b++)
        units.push({
          kind: 'boxes',
          name: `box ${b}`,
          cells: [...Array(9)].map((_, i) => [Math.floor(b / 3) * 3 + Math.floor(i / 3), (b % 3) * 3 + (i % 3)]),
        });

      steps.push({
        tag: 'rows',
        trace: ['Check each of the ', A('27 units'), ' on its own: 9 rows, then 9 columns, then 9 boxes.'],
        state: st(),
      });
      let conflict = '';
      for (const u of units) {
        const seen = new Map<string, [number, number]>();
        let clash: [number, number, [number, number]] | null = null;
        for (const [r, c] of u.cells) {
          const d = g[r][c];
          if (d === '.') continue;
          if (seen.has(d)) {
            clash = [r, c, seen.get(d)!];
            break;
          }
          seen.set(d, [r, c]);
        }
        const unitMark = Object.fromEntries(u.cells.map(([r, c]) => [`${r},${c}`, 'good' as const]));
        if (clash) {
          const [r, c, [pr, pc]] = clash;
          conflict = `digit ${g[r][c]} repeats in ${u.name}`;
          steps.push({
            tag: `dup${u.kind}`,
            trace: ['In ', A(u.name), ', ', F(g[r][c]), ' appears twice — invalid. Return ', C('false'), '.'],
            state: st({ ...unitMark, [`${r},${c}`]: 'dim', [`${pr},${pc}`]: 'dim' }),
          });
          break;
        }
        steps.push({
          tag: u.kind,
          trace: [B(u.name), ' has no repeated digit (', A(seen.size), ' filled cells).'],
          state: st(unitMark),
        });
      }
      const ok = conflict === '';
      if (ok) steps.push({ tag: 'ret', trace: ['All 27 units passed — the board is ', C('valid'), '.'], state: st() });
      return { steps, result: String(ok), resultDetail: ok ? 'no rule violated' : conflict };
    },
    note: 'Each filled cell is read three times — once for its row, its column and its box — instead of once. Still constant work on a 9×9 board, but the one-pass version tests all three rules at the same time.',
    complexity: { time: 'O(3 · 81)', space: 'O(9)' },
  },
};

/* ================= 8. Encode and Decode Strings ================= */
const encodeDecode: ProblemDef = {
  slug: 'encode-and-decode-strings',
  title: 'Encode and Decode Strings',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/encode-and-decode-strings/',
  technique: 'Length-prefix framing: "len#string" makes any characters safe — no escape needed.',
  widget: 'list',
  widgetTitle: 'Words ↔ encoded stream',
  inputs: [{ key: 'strs', label: 'Words (comma separated)', defaultValue: 'neet, code, love, you', wide: true }],
  code: {
    cpp: [
      L('class Codec {'),
      L('public:'),
      L('    string encode(vector<string>& strs) {'),
      L('        string out;', 'einit'),
      L('        for (string& s : strs)', 'enc'),
      L('            out += to_string(s.size()) + "#" + s;', 'enc'),
      L('        return out;', 'eret'),
      L('    }'),
      L('    vector<string> decode(string s) {'),
      L('        vector<string> res;', 'dinit'),
      L('        int i = 0;', 'dinit'),
      L('        while (i < s.size()) {', 'dloop'),
      L('            int j = i;', 'dlen'),
      L('            while (s[j] != \'#\') j++;', 'dlen'),
      L('            int len = stoi(s.substr(i, j - i));', 'dlen'),
      L('            res.push_back(s.substr(j + 1, len));', 'dtake'),
      L('            i = j + 1 + len;', 'dtake'),
      L('        }'),
      L('        return res;', 'dret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('public class Codec {'),
      L('    public String encode(List<String> strs) {'),
      L('        StringBuilder out = new StringBuilder();', 'einit'),
      L('        for (String s : strs)', 'enc'),
      L('            out.append(s.length()).append(\'#\').append(s);', 'enc'),
      L('        return out.toString();', 'eret'),
      L('    }'),
      L('    public List<String> decode(String s) {'),
      L('        List<String> res = new ArrayList<>();', 'dinit'),
      L('        int i = 0;', 'dinit'),
      L('        while (i < s.length()) {', 'dloop'),
      L('            int j = i;', 'dlen'),
      L('            while (s.charAt(j) != \'#\') j++;', 'dlen'),
      L('            int len = Integer.parseInt(s.substring(i, j));', 'dlen'),
      L('            res.add(s.substring(j + 1, j + 1 + len));', 'dtake'),
      L('            i = j + 1 + len;', 'dtake'),
      L('        }'),
      L('        return res;', 'dret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const words = (values.strs ?? '').split(',').map((w) => w.trim());
    if (words.length === 0 || words.every((w) => !w)) return { error: 'Enter at least one word.' };
    if (words.length > 8) return { error: 'Keep it to at most 8 words.' };

    const steps: Step[] = [];
    let encoded = '';
    const decoded: string[] = [];
    const view = (opts?: { activeWord?: number; activeDec?: number }) => ({
      chains: [
        { label: 'input', items: words.map((w, i) => ({ v: `"${w}"`, mark: opts?.activeWord === i ? ('active' as const) : undefined })), broken: true },
        { label: 'encoded', items: [{ v: encoded === '' ? '(empty)' : `"${encoded}"`, mark: 'win' as const }], broken: true },
        ...(decoded.length > 0
          ? [{ label: 'decoded', items: decoded.map((w, i) => ({ v: `"${w}"`, mark: opts?.activeDec === i ? ('final' as const) : ('good' as const) })), broken: true }]
          : []),
      ],
    });

    steps.push({ tag: 'einit', trace: ['Encode each word as ', A('length + "#" + word'), ' and concatenate.'], state: view() });
    words.forEach((w, i) => {
      encoded += `${w.length}#${w}`;
      steps.push({
        tag: 'enc',
        trace: ['"', A(w), '" becomes "', A(`${w.length}#${w}`), '" — append it to the stream.'],
        state: view({ activeWord: i }),
      });
    });
    steps.push({ tag: 'eret', trace: ['Encoded stream complete: "', B(encoded), '".'], state: view() });
    steps.push({ tag: 'dinit', trace: ['Now decode: read a number, expect ', A('#'), ', then take exactly that many characters.'], state: view() });
    let i = 0;
    while (i < encoded.length) {
      let j = i;
      while (encoded[j] !== '#') j++;
      const len = Number(encoded.slice(i, j));
      steps.push({
        tag: 'dlen',
        trace: ['At position ', A(i), ': the header reads ', A(len), ' — the next word is exactly ', A(len), ' characters.'],
        state: view(),
      });
      const word = encoded.slice(j + 1, j + 1 + len);
      decoded.push(word);
      i = j + 1 + len;
      steps.push({
        tag: 'dtake',
        trace: ['Take "', B(word), '" and jump to position ', A(i), '.'],
        state: view({ activeDec: decoded.length - 1 }),
      });
    }
    steps.push({ tag: 'dret', trace: ['Round trip complete: ', C(`[${decoded.map((w) => `"${w}"`).join(', ')}]`), ' matches the input.'], state: view() });
    return { steps, result: `"${encoded}"`, resultDetail: 'decodes back losslessly' };
  },
  note: 'A delimiter alone can always be spoofed by the data — but a length prefix cannot: the decoder never has to *search* inside a word, it just counts. That is why real protocols (HTTP, protobuf) frame with lengths too.',
  complexity: { time: 'O(total chars)', space: 'O(total chars)' },
  brute: {
    label: 'Escaped delimiter',
    technique: 'End every word with "/:" and double any "/" inside a word, so the separator can never be faked.',
    code: {
      cpp: [
        L('class Codec {'),
        L('public:'),
        L('    string encode(vector<string>& strs) {'),
        L('        string out;', 'einit'),
        L('        for (string& s : strs) {', 'enc'),
        L('            for (char ch : s)', 'enc'),
        L('                out += (ch == \'/\') ? string("//") : string(1, ch);', 'enc'),
        L('            out += "/:";', 'enc'),
        L('        }'),
        L('        return out;', 'eret'),
        L('    }'),
        L('    vector<string> decode(string s) {'),
        L('        vector<string> res;', 'dinit'),
        L('        string cur;', 'dinit'),
        L('        for (int i = 0; i < s.size(); i++) {', 'dloop'),
        L('            if (s[i] == \'/\' && s[i + 1] == \':\') {', 'dend'),
        L('                res.push_back(cur); cur = ""; i++;', 'dend'),
        L('            } else if (s[i] == \'/\') {', 'desc'),
        L('                cur += \'/\'; i++;', 'desc'),
        L('            } else cur += s[i];', 'dloop'),
        L('        }'),
        L('        return res;', 'dret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('public class Codec {'),
        L('    public String encode(List<String> strs) {'),
        L('        StringBuilder out = new StringBuilder();', 'einit'),
        L('        for (String s : strs)', 'enc'),
        L('            out.append(s.replace("/", "//")).append("/:");', 'enc'),
        L('        return out.toString();', 'eret'),
        L('    }'),
        L('    public List<String> decode(String s) {'),
        L('        List<String> res = new ArrayList<>();', 'dinit'),
        L('        StringBuilder cur = new StringBuilder();', 'dinit'),
        L('        for (int i = 0; i < s.length(); i++) {', 'dloop'),
        L('            if (s.charAt(i) == \'/\' && s.charAt(i + 1) == \':\') {', 'dend'),
        L('                res.add(cur.toString()); cur.setLength(0); i++;', 'dend'),
        L('            } else if (s.charAt(i) == \'/\') {', 'desc'),
        L('                cur.append(\'/\'); i++;', 'desc'),
        L('            } else cur.append(s.charAt(i));', 'dloop'),
        L('        }'),
        L('        return res;', 'dret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const words = (values.strs ?? '').split(',').map((w) => w.trim());
      if (words.length === 0 || words.every((w) => !w)) return { error: 'Enter at least one word.' };
      if (words.length > 8) return { error: 'Keep it to at most 8 words.' };

      const steps: Step[] = [];
      let encoded = '';
      const decoded: string[] = [];
      const view = (opts?: { activeWord?: number; activeDec?: number }) => ({
        chains: [
          { label: 'input', items: words.map((w, i) => ({ v: `"${w}"`, mark: opts?.activeWord === i ? ('active' as const) : undefined })), broken: true },
          { label: 'encoded', items: [{ v: encoded === '' ? '(empty)' : `"${encoded}"`, mark: 'win' as const }], broken: true },
          ...(decoded.length > 0
            ? [{ label: 'decoded', items: decoded.map((w, i) => ({ v: `"${w}"`, mark: opts?.activeDec === i ? ('final' as const) : ('good' as const) })), broken: true }]
            : []),
        ],
      });

      steps.push({ tag: 'einit', trace: ['Encode each word with every ', A('/'), ' doubled, then mark its end with ', A('/:'), '.'], state: view() });
      words.forEach((w, i) => {
        const piece = w.split('/').join('//') + '/:';
        encoded += piece;
        steps.push({
          tag: 'enc',
          trace: ['"', A(w), '" becomes "', A(piece), '" — append it to the stream.'],
          state: view({ activeWord: i }),
        });
      });
      steps.push({ tag: 'eret', trace: ['Encoded stream complete: "', B(encoded), '".'], state: view() });
      steps.push({
        tag: 'dinit',
        trace: ['Decode character by character: ', A('//'), ' is a literal slash, ', A('/:'), ' ends a word, anything else is copied.'],
        state: view(),
      });
      let cur = '';
      let escapes = 0;
      for (let i = 0; i < encoded.length; i++) {
        if (encoded[i] === '/' && encoded[i + 1] === ':') {
          if (escapes > 0) {
            steps.push({
              tag: 'desc',
              trace: ['Inside this word, ', A(escapes), ' doubled slash(es) were turned back into single ', A('/'), '.'],
              state: view(),
            });
          }
          decoded.push(cur);
          steps.push({
            tag: 'dend',
            trace: ['Hit ', A('/:'), ' at position ', A(i), ' — the word "', B(cur), '" is complete.'],
            state: view({ activeDec: decoded.length - 1 }),
          });
          cur = '';
          escapes = 0;
          i++;
        } else if (encoded[i] === '/') {
          cur += '/';
          escapes++;
          i++;
        } else {
          cur += encoded[i];
        }
      }
      steps.push({ tag: 'dret', trace: ['Round trip complete: ', C(`[${decoded.map((w) => `"${w}"`).join(', ')}]`), ' matches the input.'], state: view() });
      return { steps, result: `"${encoded}"`, resultDetail: 'decodes back losslessly' };
    },
    note: 'Escaping also works for any input, but the encoded size depends on how many slashes the data contains and the decoder must inspect every character. A length prefix lets the decoder jump straight over each word.',
    complexity: { time: 'O(total chars)', space: 'O(total chars)' },
  },
};

/* ================= 9. Longest Consecutive Sequence ================= */
const longestConsecutive: ProblemDef = {
  slug: 'longest-consecutive-sequence',
  title: 'Longest Consecutive Sequence',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/longest-consecutive-sequence/',
  technique: 'Hash-set walk: only sequence *starts* (numbers with no predecessor) launch a count.',
  widget: 'array',
  widgetTitle: 'Values & runs',
  inputs: [{ key: 'nums', label: 'Array', defaultValue: '100, 4, 200, 1, 3, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int longestConsecutive(vector<int>& nums) {'),
      L('        unordered_set<int> set(nums.begin(), nums.end());', 'init'),
      L('        int best = 0;', 'init'),
      L('        for (int x : set) {', 'loop'),
      L('            if (set.count(x - 1)) continue;', 'skip', 'start'),
      L('            int y = x;', 'start'),
      L('            while (set.count(y + 1)) y++;', 'walk'),
      L('            best = max(best, y - x + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int longestConsecutive(int[] nums) {'),
      L('        Set<Integer> set = new HashSet<>();', 'init'),
      L('        for (int x : nums) set.add(x);', 'init'),
      L('        int best = 0;', 'init'),
      L('        for (int x : set) {', 'loop'),
      L('            if (set.contains(x - 1)) continue;', 'skip', 'start'),
      L('            int y = x;', 'start'),
      L('            while (set.contains(y + 1)) y++;', 'walk'),
      L('            best = Math.max(best, y - x + 1);', 'best'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const set = [...new Set(arr)];
    const steps: Step[] = [];
    let best = 0;
    let bestRun: number[] = [];
    const idxOf = (v: number) => arr.indexOf(v);
    const st = (marks?: Partial<Record<number, 'active' | 'good' | 'final' | 'dim' | 'win'>>): ArrayState => ({
      arr,
      mark: marks ?? {},
      aggs: [{ label: 'best run', value: best > 0 ? `${bestRun[0]}…${bestRun[bestRun.length - 1]} (${best})` : '—', c: 'b' }],
    });
    steps.push({ tag: 'init', trace: ['Dump everything into a set — order stops mattering, membership becomes O(1).'], state: st() });
    for (const x of set) {
      if (set.includes(x - 1)) {
        steps.push({
          tag: 'skip',
          trace: [F(x), ' has a predecessor (', F(x - 1), ' exists) — it cannot start a run; skip it.'],
          state: st({ [idxOf(x)]: 'dim' }),
        });
        continue;
      }
      steps.push({
        tag: 'start',
        trace: [A(x), ' has no ', A(x - 1), ' before it — a run starts here.'],
        state: st({ [idxOf(x)]: 'active' }),
      });
      let y = x;
      const run = [x];
      while (set.includes(y + 1)) {
        y++;
        run.push(y);
        steps.push({
          tag: 'walk',
          trace: ['Extend the run: ', ...run.flatMap((v, i) => (i > 0 ? [' → ', B(v)] : [B(v)])), ' (length ', A(run.length), ').'],
          state: st(Object.fromEntries(run.map((v) => [idxOf(v), 'good']))),
        });
      }
      if (y - x + 1 > best) {
        best = y - x + 1;
        bestRun = run;
      }
      steps.push({
        tag: 'best',
        trace: ['Run ', A(`${x}…${y}`), ' has length ', A(y - x + 1), best === y - x + 1 && bestRun[0] === x ? ' — best so far.' : '.'],
        state: st(Object.fromEntries(run.map((v) => [idxOf(v), 'good']))),
      });
    }
    steps.push({
      tag: 'ret',
      trace: ['Longest consecutive run: ', C(`${bestRun[0]}…${bestRun[bestRun.length - 1]}`), ' with length ', C(best), '.'],
      state: st(Object.fromEntries(bestRun.map((v) => [idxOf(v), 'final']))),
    });
    return { steps, result: String(best), resultDetail: `run ${bestRun.join(' → ')}` };
  },
  note: 'The "only start from run beginnings" guard is what makes this linear: every element is visited at most twice (once by the outer loop, once inside a walk), so the nested-looking while never multiplies the cost.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Sorting',
    technique: 'Sort the array, then count runs where each value is exactly one more than the previous.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int longestConsecutive(vector<int>& nums) {'),
        L('        if (nums.empty()) return 0;', 'sort'),
        L('        sort(nums.begin(), nums.end());', 'sort'),
        L('        int best = 1, cur = 1;', 'sort'),
        L('        for (int i = 1; i < nums.size(); i++) {', 'loop'),
        L('            if (nums[i] == nums[i - 1]) continue;', 'same'),
        L('            if (nums[i] == nums[i - 1] + 1) cur++;', 'ext'),
        L('            else cur = 1;', 'reset'),
        L('            best = max(best, cur);', 'ext', 'reset'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int longestConsecutive(int[] nums) {'),
        L('        if (nums.length == 0) return 0;', 'sort'),
        L('        Arrays.sort(nums);', 'sort'),
        L('        int best = 1, cur = 1;', 'sort'),
        L('        for (int i = 1; i < nums.length; i++) {', 'loop'),
        L('            if (nums[i] == nums[i - 1]) continue;', 'same'),
        L('            if (nums[i] == nums[i - 1] + 1) cur++;', 'ext'),
        L('            else cur = 1;', 'reset'),
        L('            best = Math.max(best, cur);', 'ext', 'reset'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const input = parseIntArray(values.nums);
      if (typeof input === 'string') return { error: input };
      const arr = [...input].sort((a, b) => a - b);
      const steps: Step[] = [];
      if (arr.length === 0) {
        steps.push({ tag: 'sort', trace: ['Empty array — the answer is ', C(0), '.'], state: { arr } });
        return { steps, result: '0' };
      }
      let best = 1;
      let cur = 1;
      let start = 0;
      let bestWin: [number, number] = [0, 0];
      const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
        window: [start, Math.min(i, arr.length - 1)],
        aggs: [
          { label: 'current run', value: String(cur), c: 'a' },
          { label: 'best', value: String(best), c: 'b' },
        ],
        ...extra,
      });

      steps.push({
        tag: 'sort',
        trace: ['Sort: ', A(`[${arr.join(', ')}]`), '. Consecutive numbers are now side by side.'],
        state: st(0),
      });
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i - 1]) {
          steps.push({
            tag: 'same',
            trace: [F(arr[i]), ' repeats the previous value — it neither extends nor breaks the run.'],
            state: st(i, { mark: { [i]: 'dim' } }),
          });
          continue;
        }
        if (arr[i] === arr[i - 1] + 1) {
          cur++;
          if (cur > best) {
            best = cur;
            bestWin = [start, i];
          }
          steps.push({
            tag: 'ext',
            trace: [A(arr[i]), ' = ', B(arr[i - 1]), ' + 1 — the run grows to ', A(cur), '.'],
            state: st(i, { mark: { [i]: 'good' } }),
          });
        } else {
          cur = 1;
          start = i;
          steps.push({
            tag: 'reset',
            trace: ['Gap between ', F(arr[i - 1]), ' and ', F(arr[i]), ' — start a new run at ', A(arr[i]), '.'],
            state: st(i, { mark: { [i]: 'active' } }),
          });
        }
      }
      steps.push({
        tag: 'ret',
        trace: ['Longest run has length ', C(best), '.'],
        state: {
          arr,
          window: bestWin,
          mark: Object.fromEntries([...Array(bestWin[1] - bestWin[0] + 1)].map((_, k) => [bestWin[0] + k, 'final'])),
        },
      });
      return { steps, result: String(best), resultDetail: 'via sorting' };
    },
    note: 'After sorting, a consecutive sequence is a contiguous stretch, so one scan finds it. The catch is the O(n log n) sort; the hash-set version finds each sequence start directly in O(n).',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
  },
};

/* ================= 10. Subarray Sum Equals K ================= */
const subarraySumK: ProblemDef = {
  slug: 'subarray-sum-equals-k',
  title: 'Subarray Sum Equals K',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/subarray-sum-equals-k/',
  technique: 'Prefix sums + hash map: a subarray sums to k when two prefixes differ by k.',
  widget: 'array',
  widgetTitle: 'Array & prefix sums',
  inputs: [
    { key: 'nums', label: 'Array', defaultValue: '1, 2, 3, -1, 1', wide: true },
    { key: 'k', label: 'k', defaultValue: '3' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int subarraySum(vector<int>& nums, int k) {'),
      L('        unordered_map<int, int> seen{{0, 1}};', 'init'),
      L('        int sum = 0, count = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            sum += x;', 'sum'),
      L('            if (seen.count(sum - k))', 'hit'),
      L('                count += seen[sum - k];', 'hit'),
      L('            seen[sum]++;', 'store'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int subarraySum(int[] nums, int k) {'),
      L('        Map<Integer, Integer> seen = new HashMap<>();', 'init'),
      L('        seen.put(0, 1);', 'init'),
      L('        int sum = 0, count = 0;', 'init'),
      L('        for (int x : nums) {', 'loop'),
      L('            sum += x;', 'sum'),
      L('            count += seen.getOrDefault(sum - k, 0);', 'hit'),
      L('            seen.merge(sum, 1, Integer::sum);', 'store'),
      L('        }'),
      L('        return count;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    const k = parseInt1(values.k, 'k');
    if (typeof k === 'string') return { error: k };

    const steps: Step[] = [];
    const seen = new Map<number, number>([[0, 1]]);
    let sum = 0;
    let count = 0;
    const fmtMap = () => `{ ${[...seen.entries()].map(([s, c]) => `${s}:${c}`).join(', ')} }`;
    const st = (i: number, extra?: Partial<ArrayState>): ArrayState => ({
      arr,
      ptrs: i < arr.length ? [{ name: 'i', i, c: 'a' }] : [],
      aggs: [
        { label: 'prefix sum', value: String(sum), c: 'a' },
        { label: 'count', value: String(count), c: 'c' },
        { label: 'seen', value: fmtMap(), c: 'b' },
      ],
      ...extra,
    });
    steps.push({ tag: 'init', trace: ['Track the running prefix sum, and remember how often each prefix value occurred (', B('{0:1}'), ' seeds the empty prefix).'], state: st(0) });
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
      steps.push({
        tag: 'sum',
        trace: ['i = ', A(i), ': prefix sum becomes ', A(sum), '. A subarray ending here sums to k iff some earlier prefix equals ', C(sum - k), '.'],
        state: st(i, { mark: { [i]: 'active' } }),
      });
      const hits = seen.get(sum - k) ?? 0;
      if (hits > 0) {
        count += hits;
        steps.push({
          tag: 'hit',
          trace: ['Prefix ', B(sum - k), ' has occurred ', B(hits), ' time(s) — that many subarrays end at i. Count is now ', C(count), '.'],
          state: st(i, { mark: { [i]: 'good' } }),
        });
      }
      seen.set(sum, (seen.get(sum) ?? 0) + 1);
      steps.push({ tag: 'store', trace: ['Record prefix ', A(sum), ' in the map.'], state: st(i) });
    }
    steps.push({ tag: 'ret', trace: ['Total subarrays summing to ', C(k), ': ', C(count), '.'], state: st(arr.length) });
    return { steps, result: String(count), resultDetail: `subarrays with sum ${k}` };
  },
  note: 'sum(i..j) = prefix(j) − prefix(i−1), so "some subarray ends here with sum k" is the same question as "did prefix − k ever appear?" — a map of prefix frequencies answers it instantly, and negative numbers (which break sliding windows) are handled for free.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Brute force',
    technique: 'Fix every start index and extend the end one element at a time, keeping a running sum.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int subarraySum(vector<int>& nums, int k) {'),
        L('        int count = 0;', 'init'),
        L('        for (int i = 0; i < nums.size(); i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.size(); j++) {', 'add', 'hit'),
        L('                sum += nums[j];', 'add', 'hit'),
        L('                if (sum == k) count++;', 'hit'),
        L('            }'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int subarraySum(int[] nums, int k) {'),
        L('        int count = 0;', 'init'),
        L('        for (int i = 0; i < nums.length; i++) {', 'outer'),
        L('            int sum = 0;', 'outer'),
        L('            for (int j = i; j < nums.length; j++) {', 'add', 'hit'),
        L('                sum += nums[j];', 'add', 'hit'),
        L('                if (sum == k) count++;', 'hit'),
        L('            }'),
        L('        }'),
        L('        return count;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      const k = parseInt1(values.k, 'k');
      if (typeof k === 'string') return { error: k };

      const steps: Step[] = [];
      let count = 0;
      let sum = 0;
      const st = (i: number, j: number | null, extra?: Partial<ArrayState>): ArrayState => ({
        arr,
        ptrs: [
          ...(i < arr.length ? [{ name: 'i', i, c: 'b' as const }] : []),
          ...(j !== null ? [{ name: 'j', i: j, c: 'a' as const }] : []),
        ],
        window: j !== null ? [i, j] : null,
        aggs: [
          { label: 'sum', value: String(sum), c: 'a' },
          { label: 'k', value: String(k), c: 'c' },
          { label: 'count', value: String(count), c: 'c' },
        ],
        ...extra,
      });

      steps.push({ tag: 'init', trace: ['Try every subarray nums[i..j] and add up its elements as j moves right.'], state: st(0, null) });
      for (let i = 0; i < arr.length; i++) {
        sum = 0;
        steps.push({ tag: 'outer', trace: ['Start a new subarray at i = ', B(i), ' with sum ', A(0), '.'], state: st(i, null) });
        for (let j = i; j < arr.length; j++) {
          sum += arr[j];
          if (sum === k) {
            count++;
            steps.push({
              tag: 'hit',
              trace: ['nums[', B(i), '..', A(j), '] sums to ', C(sum), ' = k — count becomes ', C(count), '.'],
              state: st(i, j, { mark: Object.fromEntries([...Array(j - i + 1)].map((_, t) => [i + t, 'good'])) }),
            });
          } else {
            steps.push({
              tag: 'add',
              trace: ['Add ', A(arr[j]), ': nums[', B(i), '..', A(j), '] sums to ', F(sum), ' ≠ ', C(k), '.'],
              state: st(i, j),
            });
          }
        }
      }
      steps.push({ tag: 'ret', trace: ['Checked every subarray — ', C(count), ' of them sum to ', C(k), '.'], state: st(arr.length, null) });
      return { steps, result: String(count), resultDetail: `subarrays with sum ${k}` };
    },
    note: 'A running sum avoids re-adding each subarray from scratch, but there are still n(n+1)/2 subarrays to visit. Prefix sums plus a hash map count all matches ending at j in one lookup.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 13. Set Matrix Zeroes ================= */
const setMatrixZeroes: ProblemDef = {
  slug: 'set-matrix-zeroes',
  title: 'Set Matrix Zeroes',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/set-matrix-zeroes/',
  technique: 'Use row 0 and column 0 as the marker storage — O(1) extra space.',
  widget: 'matrix',
  widgetTitle: 'Matrix',
  inputs: [{ key: 'matrix', label: 'Matrix (rows ";" separated)', defaultValue: '1,1,1;1,0,1;1,1,1', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void setZeroes(vector<vector<int>>& m) {'),
      L('        int R = m.size(), C = m[0].size();', 'init'),
      L('        bool firstColZero = false;', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'scan'),
      L('            if (m[r][0] == 0) firstColZero = true;', 'scan'),
      L('            for (int c = 1; c < C; c++)', 'scan'),
      L('                if (m[r][c] == 0)', 'markstep'),
      L('                    m[r][0] = m[0][c] = 0;', 'markstep'),
      L('        }'),
      L('        for (int r = R - 1; r >= 0; r--) {', 'apply'),
      L('            for (int c = 1; c < C; c++)', 'apply'),
      L('                if (m[r][0] == 0 || m[0][c] == 0)', 'apply'),
      L('                    m[r][c] = 0;', 'apply'),
      L('            if (firstColZero) m[r][0] = 0;', 'apply'),
      L('        }'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void setZeroes(int[][] m) {'),
      L('        int R = m.length, C = m[0].length;', 'init'),
      L('        boolean firstColZero = false;', 'init'),
      L('        for (int r = 0; r < R; r++) {', 'scan'),
      L('            if (m[r][0] == 0) firstColZero = true;', 'scan'),
      L('            for (int c = 1; c < C; c++)', 'scan'),
      L('                if (m[r][c] == 0)', 'markstep'),
      L('                    m[r][0] = m[0][c] = 0;', 'markstep'),
      L('        }'),
      L('        for (int r = R - 1; r >= 0; r--) {', 'apply'),
      L('            for (int c = 1; c < C; c++)', 'apply'),
      L('                if (m[r][0] == 0 || m[0][c] == 0)', 'apply'),
      L('                    m[r][c] = 0;', 'apply'),
      L('            if (firstColZero) m[r][0] = 0;', 'apply'),
      L('        }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.matrix, 7, 7);
    if (typeof g === 'string') return { error: g };
    const R = g.length;
    const cols = g[0].length;
    const m = g.map((r) => [...r]);
    const steps: Step[] = [];
    const st = (mark?: MatrixState['mark'], aggs?: MatrixState['aggs']): MatrixState => ({
      grid: m.map((r) => [...r]),
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(cols)].map((_, i) => i),
      mark,
      aggs,
    });

    steps.push({ tag: 'init', trace: ['Zeroes found in the body will be recorded in ', A('row 0'), ' and ', A('column 0'), ' — the matrix stores its own markers.'], state: st() });
    let firstColZero = false;
    const zeroCells: [number, number][] = [];
    for (let r = 0; r < R; r++) {
      if (m[r][0] === 0) firstColZero = true;
      for (let c = 1; c < cols; c++) {
        if (m[r][c] === 0) zeroCells.push([r, c]);
      }
    }
    if (m[0].some((v, c) => c >= 1 && v === 0) || zeroCells.length || firstColZero) {
      for (const [r, c] of zeroCells) {
        m[r][0] = 0;
        m[0][c] = 0;
        steps.push({
          tag: 'markstep',
          trace: ['Zero at (', A(r), ',', A(c), ') — flag its whole row and column by zeroing ', A(`m[${r}][0]`), ' and ', A(`m[0][${c}]`), '.'],
          state: st({ [`${r},${c}`]: 'active', [`${r},0`]: 'src', [`0,${c}`]: 'src' }),
        });
      }
    }
    steps.push({ tag: 'scan', trace: ['Scan complete — the border now encodes every doomed row and column.'], state: st() });
    const zeroed: MatrixState['mark'] = {};
    for (let r = R - 1; r >= 0; r--) {
      for (let c = 1; c < cols; c++) {
        if (m[r][0] === 0 || m[0][c] === 0) {
          m[r][c] = 0;
          zeroed[`${r},${c}`] = 'dim';
        }
      }
      if (firstColZero) {
        m[r][0] = 0;
        zeroed[`${r},0`] = 'dim';
      }
    }
    steps.push({
      tag: 'apply',
      trace: ['Second pass (bottom-up, so markers aren\'t destroyed early): zero every flagged cell.'],
      state: st(zeroed),
    });
    steps.push({
      tag: 'apply',
      trace: ['Done — matrix is ', C(`[${m.map((r) => `[${r.join(',')}]`).join(', ')}]`), '.'],
      state: st(zeroed),
    });
    return { steps, result: `[${m.map((r) => `[${r.join(',')}]`).join(', ')}]`, resultDetail: 'in place, O(1) extra space' };
  },
  note: 'The first row and column are going to be overwritten anyway if they contain zeroes — so they can double as the "which rows/columns die" bitmask. One boolean handles the only cell they share.',
  complexity: { time: 'O(R·C)', space: 'O(1)' },
  brute: {
    label: 'Row & column flags',
    technique: 'Record which rows and columns contain a zero in two separate arrays, then zero them.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void setZeroes(vector<vector<int>>& m) {'),
        L('        int R = m.size(), C = m[0].size();', 'init'),
        L('        vector<bool> zeroRow(R), zeroCol(C);', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++)', 'scan'),
        L('                if (m[r][c] == 0) zeroRow[r] = zeroCol[c] = true;', 'found'),
        L('        for (int r = 0; r < R; r++)', 'apply'),
        L('            for (int c = 0; c < C; c++)', 'apply'),
        L('                if (zeroRow[r] || zeroCol[c]) m[r][c] = 0;', 'apply'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void setZeroes(int[][] m) {'),
        L('        int R = m.length, C = m[0].length;', 'init'),
        L('        boolean[] zeroRow = new boolean[R], zeroCol = new boolean[C];', 'init'),
        L('        for (int r = 0; r < R; r++)', 'scan'),
        L('            for (int c = 0; c < C; c++)', 'scan'),
        L('                if (m[r][c] == 0) zeroRow[r] = zeroCol[c] = true;', 'found'),
        L('        for (int r = 0; r < R; r++)', 'apply'),
        L('            for (int c = 0; c < C; c++)', 'apply'),
        L('                if (zeroRow[r] || zeroCol[c]) m[r][c] = 0;', 'apply'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.matrix, 7, 7);
      if (typeof g === 'string') return { error: g };
      const R = g.length;
      const cols = g[0].length;
      const m = g.map((r) => [...r]);
      const zeroRow = new Set<number>();
      const zeroCol = new Set<number>();
      const steps: Step[] = [];
      const st = (mark?: MatrixState['mark']): MatrixState => ({
        grid: m.map((r) => [...r]),
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(cols)].map((_, i) => i),
        mark,
        aggs: [
          { label: 'zero rows', value: `{ ${[...zeroRow].join(', ')} }`, c: 'a' },
          { label: 'zero cols', value: `{ ${[...zeroCol].join(', ')} }`, c: 'a' },
        ],
      });

      steps.push({ tag: 'init', trace: ['Keep two flag arrays: one entry per ', A('row'), ' and one per ', A('column'), '.'], state: st() });
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < cols; c++) {
          if (m[r][c] !== 0) continue;
          zeroRow.add(r);
          zeroCol.add(c);
          steps.push({
            tag: 'found',
            trace: ['Zero at (', A(r), ',', A(c), ') — flag row ', A(r), ' and column ', A(c), '.'],
            state: st({ [`${r},${c}`]: 'active' }),
          });
        }
      }
      steps.push({ tag: 'scan', trace: ['Scan complete — every flagged row and column will be zeroed.'], state: st() });
      const zeroed: MatrixState['mark'] = {};
      for (let r = 0; r < R; r++) {
        let any = false;
        for (let c = 0; c < cols; c++) {
          if (zeroRow.has(r) || zeroCol.has(c)) {
            m[r][c] = 0;
            zeroed[`${r},${c}`] = 'dim';
            any = true;
          }
        }
        if (any)
          steps.push({
            tag: 'apply',
            trace: ['Row ', A(r), ': zero every cell whose row or column is flagged.'],
            state: st({ ...zeroed }),
          });
      }
      const res = `[${m.map((r) => `[${r.join(',')}]`).join(', ')}]`;
      steps.push({ tag: 'apply', trace: ['Done — matrix is ', C(res), '.'], state: st(zeroed) });
      return { steps, result: res, resultDetail: `O(R + C) extra space` };
    },
    note: 'Separate flag arrays are the clearest way to avoid zeroing cells too early, but they cost O(R + C) memory. The optimal version stores the same flags inside row 0 and column 0.',
    complexity: { time: 'O(R·C)', space: 'O(R + C)' },
  },
};

/* ================= 14. Spiral Matrix ================= */
const spiralMatrix: ProblemDef = {
  slug: 'spiral-matrix',
  title: 'Spiral Matrix',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/spiral-matrix/',
  technique: 'Four shrinking boundaries — peel one ring at a time.',
  widget: 'matrix',
  widgetTitle: 'Matrix & boundaries',
  inputs: [{ key: 'matrix', label: 'Matrix (rows ";" separated)', defaultValue: '1,2,3;4,5,6;7,8,9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<int> spiralOrder(vector<vector<int>>& m) {'),
      L('        int top = 0, bottom = m.size() - 1;', 'init'),
      L('        int left = 0, right = m[0].size() - 1;', 'init'),
      L('        vector<int> res;', 'init'),
      L('        while (top <= bottom && left <= right) {', 'loop'),
      L('            for (int c = left; c <= right; c++) res.push_back(m[top][c]);', 'top'),
      L('            top++;', 'top'),
      L('            for (int r = top; r <= bottom; r++) res.push_back(m[r][right]);', 'right'),
      L('            right--;', 'right'),
      L('            if (top <= bottom) {', 'bottom'),
      L('                for (int c = right; c >= left; c--) res.push_back(m[bottom][c]);', 'bottom'),
      L('                bottom--;', 'bottom'),
      L('            }'),
      L('            if (left <= right) {', 'left'),
      L('                for (int r = bottom; r >= top; r--) res.push_back(m[r][left]);', 'left'),
      L('                left++;', 'left'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public List<Integer> spiralOrder(int[][] m) {'),
      L('        int top = 0, bottom = m.length - 1;', 'init'),
      L('        int left = 0, right = m[0].length - 1;', 'init'),
      L('        List<Integer> res = new ArrayList<>();', 'init'),
      L('        while (top <= bottom && left <= right) {', 'loop'),
      L('            for (int c = left; c <= right; c++) res.add(m[top][c]);', 'top'),
      L('            top++;', 'top'),
      L('            for (int r = top; r <= bottom; r++) res.add(m[r][right]);', 'right'),
      L('            right--;', 'right'),
      L('            if (top <= bottom) {', 'bottom'),
      L('                for (int c = right; c >= left; c--) res.add(m[bottom][c]);', 'bottom'),
      L('                bottom--;', 'bottom'),
      L('            }'),
      L('            if (left <= right) {', 'left'),
      L('                for (int r = bottom; r >= top; r--) res.add(m[r][left]);', 'left'),
      L('                left++;', 'left'),
      L('            }'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.matrix, 7, 7);
    if (typeof g === 'string') return { error: g };
    const R = g.length;
    const cols = g[0].length;
    const steps: Step[] = [];
    const res: number[] = [];
    const taken: MatrixState['mark'] = {};
    const st = (active?: [number, number][]): MatrixState => ({
      grid: g,
      rowLabels: [...Array(R)].map((_, i) => i),
      colLabels: [...Array(cols)].map((_, i) => i),
      mark: { ...taken, ...Object.fromEntries((active ?? []).map(([r, c]) => [`${r},${c}`, 'active'])) },
      aggs: [{ label: 'output', value: `[${res.join(', ')}]`, c: 'c' }],
    });

    let top = 0;
    let bottom = R - 1;
    let left = 0;
    let right = cols - 1;
    steps.push({ tag: 'init', trace: ['Four boundaries fence the unvisited region: top, bottom, left, right. Walk the fence clockwise, shrinking it after each side.'], state: st() });
    const eat = (cells: [number, number][], tag: string, dir: string) => {
      const active = cells;
      for (const [r, c] of cells) res.push(g[r][c]);
      steps.push({
        tag,
        trace: ['Walk ', A(dir), ': collect ', ...cells.flatMap(([r, c], i) => (i > 0 ? [', ', B(g[r][c])] : [B(g[r][c])])), '.'],
        state: st(active),
      });
      for (const [r, c] of cells) taken[`${r},${c}`] = 'good';
    };
    while (top <= bottom && left <= right) {
      eat([...Array(right - left + 1)].map((_, i) => [top, left + i] as [number, number]), 'top', `row ${top} →`);
      top++;
      if (top <= bottom) {
        eat([...Array(bottom - top + 1)].map((_, i) => [top + i, right] as [number, number]), 'right', `col ${right} ↓`);
      }
      right--;
      if (top <= bottom) {
        eat([...Array(right - left + 1)].map((_, i) => [bottom, right - i] as [number, number]), 'bottom', `row ${bottom} ←`);
        bottom--;
      }
      if (left <= right && top <= bottom) {
        eat([...Array(bottom - top + 1)].map((_, i) => [bottom - i, left] as [number, number]), 'left', `col ${left} ↑`);
      }
      left++;
      if (steps.length > 300) break;
    }
    steps.push({ tag: 'ret', trace: ['Boundaries crossed — every cell visited exactly once: ', C(`[${res.join(', ')}]`), '.'], state: st() });
    return { steps, result: `[${res.join(', ')}]`, resultDetail: 'clockwise spiral order' };
  },
  note: 'The spiral is just "walk the current rectangle\'s border clockwise" repeated on ever-smaller rectangles. Keeping four explicit boundaries (and checking top ≤ bottom / left ≤ right before the return legs) is what prevents double-visiting single leftover rows or columns.',
  complexity: { time: 'O(R·C)', space: 'O(1) beyond output' },
  brute: {
    label: 'Visited grid',
    technique: 'Walk in the current direction and turn clockwise whenever the next cell is off the grid or already visited.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<int> spiralOrder(vector<vector<int>>& m) {'),
        L('        int R = m.size(), C = m[0].size();', 'init'),
        L('        vector<vector<bool>> seen(R, vector<bool>(C));', 'init'),
        L('        int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};', 'init'),
        L('        int r = 0, c = 0, d = 0;', 'init'),
        L('        vector<int> res;', 'init'),
        L('        for (int k = 0; k < R * C; k++) {', 'visit'),
        L('            res.push_back(m[r][c]);', 'visit'),
        L('            seen[r][c] = true;', 'visit'),
        L('            int nr = r + dr[d], nc = c + dc[d];', 'visit'),
        L('            if (nr < 0 || nr >= R || nc < 0 || nc >= C || seen[nr][nc]) {', 'turn'),
        L('                d = (d + 1) % 4;', 'turn'),
        L('                nr = r + dr[d]; nc = c + dc[d];', 'turn'),
        L('            }'),
        L('            r = nr; c = nc;', 'visit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public List<Integer> spiralOrder(int[][] m) {'),
        L('        int R = m.length, C = m[0].length;', 'init'),
        L('        boolean[][] seen = new boolean[R][C];', 'init'),
        L('        int[] dr = {0, 1, 0, -1}, dc = {1, 0, -1, 0};', 'init'),
        L('        int r = 0, c = 0, d = 0;', 'init'),
        L('        List<Integer> res = new ArrayList<>();', 'init'),
        L('        for (int k = 0; k < R * C; k++) {', 'visit'),
        L('            res.add(m[r][c]);', 'visit'),
        L('            seen[r][c] = true;', 'visit'),
        L('            int nr = r + dr[d], nc = c + dc[d];', 'visit'),
        L('            if (nr < 0 || nr >= R || nc < 0 || nc >= C || seen[nr][nc]) {', 'turn'),
        L('                d = (d + 1) % 4;', 'turn'),
        L('                nr = r + dr[d]; nc = c + dc[d];', 'turn'),
        L('            }'),
        L('            r = nr; c = nc;', 'visit'),
        L('        }'),
        L('        return res;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.matrix, 7, 7);
      if (typeof g === 'string') return { error: g };
      const R = g.length;
      const cols = g[0].length;
      const steps: Step[] = [];
      const res: number[] = [];
      const seen: MatrixState['mark'] = {};
      const dirs = ['→', '↓', '←', '↑'];
      const dr = [0, 1, 0, -1];
      const dc = [1, 0, -1, 0];
      const st = (active?: [number, number]): MatrixState => ({
        grid: g,
        rowLabels: [...Array(R)].map((_, i) => i),
        colLabels: [...Array(cols)].map((_, i) => i),
        mark: { ...seen, ...(active ? { [`${active[0]},${active[1]}`]: 'active' as const } : {}) },
        aggs: [{ label: 'output', value: `[${res.join(', ')}]`, c: 'c' }],
      });

      steps.push({
        tag: 'init',
        trace: ['Start at (0,0) heading ', A('→'), '. A ', B('visited'), ' grid tells us when to turn.'],
        state: st(),
      });
      let r = 0;
      let c = 0;
      let d = 0;
      for (let k = 0; k < R * cols; k++) {
        res.push(g[r][c]);
        seen[`${r},${c}`] = 'good';
        steps.push({
          tag: 'visit',
          trace: ['Visit (', A(r), ',', A(c), ') heading ', A(dirs[d]), ' — collect ', B(g[r][c]), '.'],
          state: st([r, c]),
        });
        let nr = r + dr[d];
        let nc = c + dc[d];
        const blocked = nr < 0 || nr >= R || nc < 0 || nc >= cols || seen[`${nr},${nc}`];
        if (blocked && k < R * cols - 1) {
          d = (d + 1) % 4;
          nr = r + dr[d];
          nc = c + dc[d];
          steps.push({
            tag: 'turn',
            trace: ['The next cell is a wall or already visited — turn clockwise to ', A(dirs[d]), '.'],
            state: st([r, c]),
          });
        }
        r = nr;
        c = nc;
      }
      steps.push({ tag: 'ret', trace: ['All ', C(R * cols), ' cells visited: ', C(`[${res.join(', ')}]`), '.'], state: st() });
      return { steps, result: `[${res.join(', ')}]`, resultDetail: 'clockwise spiral order' };
    },
    note: 'Simulating the walk is hard to get wrong, but the visited grid costs O(R·C) extra memory. Shrinking four boundaries encodes the same information in four integers.',
    complexity: { time: 'O(R·C)', space: 'O(R·C)' },
  },
};

/* ================= 15. Rotate Image ================= */
const rotateImage: ProblemDef = {
  slug: 'rotate-image',
  title: 'Rotate Image',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/rotate-image/',
  technique: 'Transpose, then reverse each row — 90° clockwise with no extra matrix.',
  widget: 'matrix',
  widgetTitle: 'Matrix',
  inputs: [{ key: 'matrix', label: 'Square matrix (rows ";" separated)', defaultValue: '1,2,3;4,5,6;7,8,9', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    void rotate(vector<vector<int>>& m) {'),
      L('        int n = m.size();', 'init'),
      L('        for (int r = 0; r < n; r++)', 'transpose'),
      L('            for (int c = r + 1; c < n; c++)', 'transpose'),
      L('                swap(m[r][c], m[c][r]);', 'transpose'),
      L('        for (int r = 0; r < n; r++)', 'reverse'),
      L('            reverse(m[r].begin(), m[r].end());', 'reverse'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public void rotate(int[][] m) {'),
      L('        int n = m.length;', 'init'),
      L('        for (int r = 0; r < n; r++)', 'transpose'),
      L('            for (int c = r + 1; c < n; c++) {', 'transpose'),
      L('                int t = m[r][c]; m[r][c] = m[c][r]; m[c][r] = t;', 'transpose'),
      L('            }'),
      L('        for (int r = 0; r < n; r++)', 'reverse'),
      L('            for (int i = 0, j = n - 1; i < j; i++, j--) {', 'reverse'),
      L('                int t = m[r][i]; m[r][i] = m[r][j]; m[r][j] = t;', 'reverse'),
      L('            }'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const g = parseNumGrid(values.matrix, 6, 6);
    if (typeof g === 'string') return { error: g };
    if (g.length !== g[0].length) return { error: 'Matrix must be square (n×n).' };
    const n = g.length;
    const m = g.map((r) => [...r]);
    const steps: Step[] = [];
    const st = (mark?: MatrixState['mark']): MatrixState => ({
      grid: m.map((r) => [...r]),
      rowLabels: [...Array(n)].map((_, i) => i),
      colLabels: [...Array(n)].map((_, i) => i),
      mark,
    });

    steps.push({ tag: 'init', trace: ['A 90° clockwise turn = ', A('transpose'), ' (flip over the diagonal) + ', A('reverse each row'), '.'], state: st() });
    for (let r = 0; r < n; r++) {
      for (let c = r + 1; c < n; c++) {
        [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
        steps.push({
          tag: 'transpose',
          trace: ['Transpose: swap (', A(r), ',', A(c), ') ↔ (', A(c), ',', A(r), ').'],
          state: st({ [`${r},${c}`]: 'active', [`${c},${r}`]: 'active' }),
        });
      }
    }
    for (let r = 0; r < n; r++) {
      m[r].reverse();
      steps.push({
        tag: 'reverse',
        trace: ['Reverse row ', A(r), ' → ', B(`[${m[r].join(', ')}]`), '.'],
        state: st(Object.fromEntries(m[r].map((_, c) => [`${r},${c}`, 'good']))),
      });
    }
    steps.push({
      tag: 'reverse',
      trace: ['Rotation complete: ', C(`[${m.map((r) => `[${r.join(',')}]`).join(', ')}]`), '.'],
      state: st(Object.fromEntries(m.flatMap((row, r) => row.map((_, c) => [`${r},${c}`, 'final'])))),
    });
    return { steps, result: `[${m.map((r) => `[${r.join(',')}]`).join(', ')}]`, resultDetail: '90° clockwise, in place' };
  },
  note: 'Rotation is a composition of two mirror flips: the transpose reflects across the main diagonal, the row-reverse reflects horizontally. Each flip is a set of independent swaps, which is why no scratch matrix is needed.',
  complexity: { time: 'O(n²)', space: 'O(1)' },
  brute: {
    label: 'Extra matrix',
    technique: 'Write each row r into column n − 1 − r of a new matrix, then copy it back.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    void rotate(vector<vector<int>>& m) {'),
        L('        int n = m.size();', 'init'),
        L('        vector<vector<int>> res(n, vector<int>(n));', 'init'),
        L('        for (int r = 0; r < n; r++)', 'place'),
        L('            for (int c = 0; c < n; c++)', 'place'),
        L('                res[c][n - 1 - r] = m[r][c];', 'place'),
        L('        m = res;', 'copy'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public void rotate(int[][] m) {'),
        L('        int n = m.length;', 'init'),
        L('        int[][] res = new int[n][n];', 'init'),
        L('        for (int r = 0; r < n; r++)', 'place'),
        L('            for (int c = 0; c < n; c++)', 'place'),
        L('                res[c][n - 1 - r] = m[r][c];', 'place'),
        L('        for (int r = 0; r < n; r++) m[r] = res[r].clone();', 'copy'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const g = parseNumGrid(values.matrix, 6, 6);
      if (typeof g === 'string') return { error: g };
      if (g.length !== g[0].length) return { error: 'Matrix must be square (n×n).' };
      const n = g.length;
      const res: (number | string)[][] = [...Array(n)].map(() => Array(n).fill('·'));
      const steps: Step[] = [];
      const st = (mark?: MatrixState['mark'], aggs?: MatrixState['aggs']): MatrixState => ({
        grid: res.map((r) => [...r]),
        rowLabels: [...Array(n)].map((_, i) => i),
        colLabels: [...Array(n)].map((_, i) => i),
        mark,
        aggs,
      });

      steps.push({
        tag: 'init',
        trace: ['Start from an empty ', A(`${n}×${n}`), ' result: row r of the input becomes column ', A('n − 1 − r'), '.'],
        state: st(),
      });
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) res[c][n - 1 - r] = g[r][c];
        steps.push({
          tag: 'place',
          trace: ['Input row ', A(r), ' ', B(`[${g[r].join(', ')}]`), ' fills result column ', A(n - 1 - r), ' top to bottom.'],
          state: st(Object.fromEntries([...Array(n)].map((_, c) => [`${c},${n - 1 - r}`, 'active'])), [
            { label: 'row', value: `[${g[r].join(', ')}]`, c: 'b' },
          ]),
        });
      }
      const out = `[${res.map((r) => `[${r.join(',')}]`).join(', ')}]`;
      steps.push({
        tag: 'copy',
        trace: ['Copy the result back into the input: ', C(out), '.'],
        state: st(Object.fromEntries(res.flatMap((row, r) => row.map((_, c) => [`${r},${c}`, 'final'])))),
      });
      return { steps, result: out, resultDetail: '90° clockwise, with an extra n×n matrix' };
    },
    note: 'The index formula res[c][n − 1 − r] = m[r][c] is the definition of a clockwise turn, which makes this easy to verify, but it needs a second n×n matrix. The problem asks for in-place, which transpose-then-reverse achieves.',
    complexity: { time: 'O(n²)', space: 'O(n²)' },
  },
};

export const arraysHashing2 = [validSudoku, encodeDecode, longestConsecutive, subarraySumK, setMatrixZeroes, spiralMatrix, rotateImage];
