// Intervals (timeline widget).
import type { IntervalsState, ProblemDef, Step } from '../lib/types';
import { A, B, C, F, L } from '../lib/trace';

function parseIntervals(s: string, max = 10): [number, number][] | string {
  const parts = (s ?? '').split(';').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return 'Enter intervals like "1 3; 2 6; 8 10".';
  if (parts.length > max) return `Keep it to at most ${max} intervals.`;
  const out: [number, number][] = [];
  for (const p of parts) {
    const nums = p.split(/[\s,]+/).map(Number);
    if (nums.length !== 2 || nums.some((x) => !Number.isInteger(x))) return `Bad interval "${p}".`;
    if (nums[0] > nums[1]) return `Interval "${p}" has start > end.`;
    out.push([nums[0], nums[1]]);
  }
  return out;
}

const domainOf = (ivs: [number, number][]): [number, number] => [
  Math.min(...ivs.map(([s]) => s)),
  Math.max(...ivs.map(([, e]) => e)),
];

/* ================= 135. Merge Intervals ================= */
const mergeIntervals: ProblemDef = {
  slug: 'merge-intervals',
  title: 'Merge Intervals',
  category: 'Intervals',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/merge-intervals/',
  technique: 'Sort by start; each interval either extends the last merged one or starts a new block.',
  widget: 'intervals',
  widgetTitle: 'Timeline',
  inputs: [{ key: 'intervals', label: 'Intervals (s e; s e; …)', defaultValue: '1 3; 2 6; 8 10; 15 18', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> merge(vector<vector<int>>& intervals) {'),
      L('        sort(intervals.begin(), intervals.end());', 'sort'),
      L('        vector<vector<int>> res;', 'sort'),
      L('        for (auto& iv : intervals) {', 'loop'),
      L('            if (!res.empty() && iv[0] <= res.back()[1])', 'overlap'),
      L('                res.back()[1] = max(res.back()[1], iv[1]);', 'overlap'),
      L('            else'),
      L('                res.push_back(iv);', 'newblock'),
      L('        }'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] merge(int[][] intervals) {'),
      L('        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);', 'sort'),
      L('        List<int[]> res = new ArrayList<>();', 'sort'),
      L('        for (int[] iv : intervals) {', 'loop'),
      L('            if (!res.isEmpty() && iv[0] <= res.get(res.size() - 1)[1])', 'overlap'),
      L('                res.get(res.size() - 1)[1] =', 'overlap'),
      L('                    Math.max(res.get(res.size() - 1)[1], iv[1]);', 'overlap'),
      L('            else'),
      L('                res.add(iv);', 'newblock'),
      L('        }'),
      L('        return res.toArray(new int[0][]);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntervals(values.intervals);
    if (typeof parsed === 'string') return { error: parsed };
    const ivs = [...parsed].sort((a, b) => a[0] - b[0]);
    const domain = domainOf(ivs);
    const steps: Step[] = [];
    const merged: [number, number][] = [];
    const view = (activeIdx?: number): IntervalsState => ({
      intervals: [
        ...merged.map(([s, e], i) => ({ s, e, mark: i === merged.length - 1 && activeIdx === -1 ? ('good' as const) : ('win' as const) })),
        ...ivs.map(([s, e], i) => ({ s, e, mark: i === activeIdx ? ('active' as const) : i < (activeIdx ?? -1) ? ('dim' as const) : undefined })),
      ],
      domain,
    });
    steps.push({ tag: 'sort', trace: ['Sort by start: ', A(ivs.map(([s, e]) => `[${s},${e}]`).join(' ')), ' — overlaps are now always with the most recent block.'], state: view() });
    ivs.forEach(([s, e], i) => {
      if (merged.length > 0 && s <= merged[merged.length - 1][1]) {
        const lastEnd = merged[merged.length - 1][1];
        merged[merged.length - 1][1] = Math.max(lastEnd, e);
        steps.push({
          tag: 'overlap',
          trace: ['[', A(s), ',', A(e), '] starts before the current block ends (', A(lastEnd), ') — absorb it; block grows to [', B(merged[merged.length - 1][0]), ',', B(merged[merged.length - 1][1]), '].'],
          state: view(i),
        });
      } else {
        merged.push([s, e]);
        steps.push({ tag: 'newblock', trace: ['[', A(s), ',', A(e), '] starts after a gap — begin a new block.'], state: view(i) });
      }
    });
    steps.push({ tag: 'ret', trace: ['Merged: ', C(merged.map(([s, e]) => `[${s},${e}]`).join(' ')), '.'], state: view(-1) });
    return { steps, result: `[${merged.map(([s, e]) => `[${s},${e}]`).join(', ')}]`, resultDetail: `${merged.length} disjoint blocks` };
  },
  note: 'Sorting by start turns a global overlap question into a local one: any interval that overlaps *anything* earlier must overlap the block immediately before it. One linear sweep after the sort settles everything.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  brute: {
    label: 'Merge any overlapping pair',
    technique: 'Without sorting, repeatedly find any two overlapping intervals and fuse them, until no pair overlaps.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> merge(vector<vector<int>>& iv) {'),
        L('        bool changed = true;', 'init'),
        L('        while (changed) {', 'scan'),
        L('            changed = false;', 'scan'),
        L('            for (int i = 0; i < iv.size() && !changed; i++)', 'scan'),
        L('                for (int j = i + 1; j < iv.size() && !changed; j++)', 'scan'),
        L('                    if (iv[i][0] <= iv[j][1] && iv[j][0] <= iv[i][1]) {', 'fuse'),
        L('                        iv[i] = {min(iv[i][0], iv[j][0]), max(iv[i][1], iv[j][1])};', 'fuse'),
        L('                        iv.erase(iv.begin() + j);', 'fuse'),
        L('                        changed = true;', 'fuse'),
        L('                    }'),
        L('        }'),
        L('        sort(iv.begin(), iv.end());', 'ret'),
        L('        return iv;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] merge(int[][] intervals) {'),
        L('        List<int[]> iv = new ArrayList<>(Arrays.asList(intervals));', 'init'),
        L('        boolean changed = true;', 'init'),
        L('        while (changed) {', 'scan'),
        L('            changed = false;', 'scan'),
        L('            for (int i = 0; i < iv.size() && !changed; i++)', 'scan'),
        L('                for (int j = i + 1; j < iv.size() && !changed; j++)', 'scan'),
        L('                    if (iv.get(i)[0] <= iv.get(j)[1] && iv.get(j)[0] <= iv.get(i)[1]) {', 'fuse'),
        L('                        iv.set(i, new int[]{Math.min(iv.get(i)[0], iv.get(j)[0]), Math.max(iv.get(i)[1], iv.get(j)[1])});', 'fuse'),
        L('                        iv.remove(j);', 'fuse'),
        L('                        changed = true;', 'fuse'),
        L('                    }'),
        L('        }'),
        L('        iv.sort((a, b) -> a[0] - b[0]);', 'ret'),
        L('        return iv.toArray(new int[0][]);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntervals(values.intervals);
      if (typeof parsed === 'string') return { error: parsed };
      const iv = parsed.map(([s, e]) => [s, e] as [number, number]);
      const domain = domainOf(iv);
      const steps: Step[] = [];
      let checks = 0;
      const view = (hl: number[] = [], m: 'active' | 'good' = 'active'): IntervalsState => ({
        intervals: iv.map(([s, e], i) => ({ s, e, mark: hl.includes(i) ? m : undefined })),
        domain,
        aggs: [
          { label: 'intervals left', value: String(iv.length), c: 'a' },
          { label: 'pair checks', value: String(checks), c: 'b' },
        ],
      });
      steps.push({ tag: 'init', trace: ['No sorting: keep scanning all pairs for an overlap and fuse it, until a full pass finds none.'], state: view() });
      let changed = true;
      while (changed) {
        changed = false;
        for (let i = 0; i < iv.length && !changed; i++)
          for (let j = i + 1; j < iv.length && !changed; j++) {
            checks++;
            if (iv[i][0] <= iv[j][1] && iv[j][0] <= iv[i][1]) {
              steps.push({ tag: 'fuse', trace: ['[', A(iv[i][0]), ',', A(iv[i][1]), '] and [', A(iv[j][0]), ',', A(iv[j][1]), '] overlap — fuse them.'], state: view([i, j]) });
              iv[i] = [Math.min(iv[i][0], iv[j][0]), Math.max(iv[i][1], iv[j][1])];
              iv.splice(j, 1);
              changed = true;
              steps.push({ tag: 'scan', trace: ['Fused into [', B(iv[i][0]), ',', B(iv[i][1]), '] — start the pair scan over.'], state: view([i], 'good') });
            }
          }
      }
      iv.sort((a, b) => a[0] - b[0]);
      const out = `[${iv.map(([s, e]) => `[${s},${e}]`).join(', ')}]`;
      steps.push({ tag: 'ret', trace: ['A full pass found no overlaps. Merged (sorted for output): ', C(iv.map(([s, e]) => `[${s},${e}]`).join(' ')), ' after ', A(checks), ' pair checks.'], state: view(iv.map((_, i) => i), 'good') });
      return { steps, result: out, resultDetail: `${iv.length} disjoint blocks` };
    },
    note: 'Each fusion restarts an O(n²) pair scan, so the worst case is O(n³). Sorting by start first guarantees that any overlap is with the most recent block, so one pass suffices.',
    complexity: { time: 'O(n³)', space: 'O(1)' },
  },
};

/* ================= 136. Insert Interval ================= */
const insertInterval: ProblemDef = {
  slug: 'insert-interval',
  title: 'Insert Interval',
  category: 'Intervals',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/insert-interval/',
  technique: 'Three phases: copy the before, swallow the overlaps, copy the after.',
  widget: 'intervals',
  widgetTitle: 'Timeline',
  inputs: [
    { key: 'intervals', label: 'Sorted intervals (s e; …)', defaultValue: '1 2; 3 5; 6 7; 8 10; 12 16', wide: true },
    { key: 'newIv', label: 'New interval (s e)', defaultValue: '4 8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newIv) {'),
      L('        vector<vector<int>> res;', 'init'),
      L('        int i = 0, n = intervals.size();', 'init'),
      L('        while (i < n && intervals[i][1] < newIv[0])', 'before'),
      L('            res.push_back(intervals[i++]);', 'before'),
      L('        while (i < n && intervals[i][0] <= newIv[1]) {', 'swallow'),
      L('            newIv[0] = min(newIv[0], intervals[i][0]);', 'swallow'),
      L('            newIv[1] = max(newIv[1], intervals[i][1]);', 'swallow'),
      L('            i++;', 'swallow'),
      L('        }'),
      L('        res.push_back(newIv);', 'place'),
      L('        while (i < n)', 'after'),
      L('            res.push_back(intervals[i++]);', 'after'),
      L('        return res;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int[][] insert(int[][] intervals, int[] newIv) {'),
      L('        List<int[]> res = new ArrayList<>();', 'init'),
      L('        int i = 0, n = intervals.length;', 'init'),
      L('        while (i < n && intervals[i][1] < newIv[0])', 'before'),
      L('            res.add(intervals[i++]);', 'before'),
      L('        while (i < n && intervals[i][0] <= newIv[1]) {', 'swallow'),
      L('            newIv[0] = Math.min(newIv[0], intervals[i][0]);', 'swallow'),
      L('            newIv[1] = Math.max(newIv[1], intervals[i][1]);', 'swallow'),
      L('            i++;', 'swallow'),
      L('        }'),
      L('        res.add(newIv);', 'place'),
      L('        while (i < n)', 'after'),
      L('            res.add(intervals[i++]);', 'after'),
      L('        return res.toArray(new int[0][]);', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntervals(values.intervals);
    if (typeof parsed === 'string') return { error: parsed };
    for (let i = 1; i < parsed.length; i++) if (parsed[i][0] < parsed[i - 1][1]) return { error: 'Intervals must be sorted and non-overlapping.' };
    const nn = (values.newIv ?? '').split(/[\s,]+/).map(Number);
    if (nn.length !== 2 || nn.some((x) => !Number.isInteger(x)) || nn[0] > nn[1]) return { error: 'New interval must be two integers "s e" with s ≤ e.' };
    const newIv: [number, number] = [nn[0], nn[1]];
    const domain = domainOf([...parsed, newIv]);
    const steps: Step[] = [];
    const res: [number, number][] = [];
    let cur: [number, number] = [...newIv];
    const view = (phase: 'before' | 'swallow' | 'after' | 'done', consumed: number): IntervalsState => ({
      intervals: [
        ...res.map(([s, e]) => ({ s, e, mark: 'win' as const })),
        { s: cur[0], e: cur[1], label: `[${cur[0]},${cur[1]}]*`, mark: phase === 'done' ? ('final' as const) : ('active' as const) },
        ...parsed.slice(consumed).map(([s, e]) => ({ s, e })),
      ],
      domain,
    });
    steps.push({ tag: 'init', trace: ['The list is already sorted and disjoint — the new interval ', A(`[${newIv[0]},${newIv[1]}]`), ' (marked *) disturbs only a contiguous run of it.'], state: view('before', 0) });
    let i = 0;
    while (i < parsed.length && parsed[i][1] < cur[0]) {
      res.push(parsed[i]);
      steps.push({ tag: 'before', trace: ['[', B(parsed[i][0]), ',', B(parsed[i][1]), '] ends before the newcomer starts — copy it through untouched.'], state: view('before', i + 1) });
      i++;
    }
    while (i < parsed.length && parsed[i][0] <= cur[1]) {
      cur = [Math.min(cur[0], parsed[i][0]), Math.max(cur[1], parsed[i][1])];
      steps.push({ tag: 'swallow', trace: ['[', F(parsed[i][0]), ',', F(parsed[i][1]), '] overlaps — swallow it; the newcomer grows to [', A(cur[0]), ',', A(cur[1]), '].'], state: view('swallow', i + 1) });
      i++;
    }
    res.push(cur);
    steps.push({ tag: 'place', trace: ['No more overlaps — place the merged interval [', B(cur[0]), ',', B(cur[1]), '].'], state: view('after', i) });
    while (i < parsed.length) {
      res.push(parsed[i]);
      steps.push({ tag: 'after', trace: ['[', B(parsed[i][0]), ',', B(parsed[i][1]), '] starts after — copy the rest through.'], state: view('after', i + 1) });
      i++;
    }
    steps.push({ tag: 'ret', trace: ['Result: ', C(res.map(([s, e]) => `[${s},${e}]`).join(' ')), '.'], state: view('done', parsed.length) });
    return { steps, result: `[${res.map(([s, e]) => `[${s},${e}]`).join(', ')}]` };
  },
  note: 'Because the input is sorted and disjoint, the overlapping intervals form one contiguous run — so the algorithm is three simple while-loops, and only the middle one does any arithmetic. No sorting, O(n) exactly once.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  brute: {
    label: 'Append, sort & merge',
    technique: 'Add the new interval to the list, then run the standard sort-and-merge from scratch.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    vector<vector<int>> insert(vector<vector<int>>& iv, vector<int>& newIv) {'),
        L('        iv.push_back(newIv);', 'before'),
        L('        sort(iv.begin(), iv.end());', 'before'),
        L('        vector<vector<int>> res;', 'place'),
        L('        for (auto& x : iv)', 'swallow', 'after'),
        L('            if (!res.empty() && x[0] <= res.back()[1]) res.back()[1] = max(res.back()[1], x[1]);', 'swallow'),
        L('            else res.push_back(x);', 'after'),
        L('        return res;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int[][] insert(int[][] intervals, int[] newIv) {'),
        L('        List<int[]> iv = new ArrayList<>(Arrays.asList(intervals));', 'before'),
        L('        iv.add(newIv);', 'before'),
        L('        iv.sort((a, b) -> a[0] - b[0]);', 'before'),
        L('        List<int[]> res = new ArrayList<>();', 'place'),
        L('        for (int[] x : iv)', 'swallow', 'after'),
        L('            if (!res.isEmpty() && x[0] <= res.get(res.size() - 1)[1])', 'swallow'),
        L('                res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], x[1]);', 'swallow'),
        L('            else res.add(x);', 'after'),
        L('        return res.toArray(new int[0][]);', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntervals(values.intervals);
      if (typeof parsed === 'string') return { error: parsed };
      for (let i = 1; i < parsed.length; i++) if (parsed[i][0] < parsed[i - 1][1]) return { error: 'Intervals must be sorted and non-overlapping.' };
      const nn = (values.newIv ?? '').split(/[\s,]+/).map(Number);
      if (nn.length !== 2 || nn.some((x) => !Number.isInteger(x)) || nn[0] > nn[1]) return { error: 'New interval must be two integers "s e" with s ≤ e.' };
      const all = [...parsed, [nn[0], nn[1]] as [number, number]].sort((a, b) => a[0] - b[0]);
      const newIdx = all.findIndex(([s, e]) => s === nn[0] && e === nn[1]);
      const domain = domainOf(all);
      const steps: Step[] = [];
      const res: [number, number][] = [];
      const view = (active?: number): IntervalsState => ({
        intervals: [
          ...res.map(([s, e]) => ({ s, e, mark: 'win' as const })),
          ...all.map(([s, e], i) => ({ s, e, mark: i === active ? ('active' as const) : i === newIdx ? ('good' as const) : undefined })),
        ],
        domain,
      });
      steps.push({ tag: 'before', trace: ['Ignore that the list is already sorted: append [', B(nn[0]), ',', B(nn[1]), '] and re-sort everything.'], state: view() });
      all.forEach(([s, e], i) => {
        if (res.length && s <= res[res.length - 1][1]) {
          res[res.length - 1][1] = Math.max(res[res.length - 1][1], e);
          steps.push({ tag: 'swallow', trace: ['[', A(s), ',', A(e), '] overlaps the last block — extend it to end at ', B(res[res.length - 1][1]), '.'], state: view(i) });
        } else {
          res.push([s, e]);
          steps.push({ tag: 'after', trace: ['[', A(s), ',', A(e), '] starts a new block.'], state: view(i) });
        }
      });
      steps.push({ tag: 'ret', trace: ['Result: ', C(res.map(([s, e]) => `[${s},${e}]`).join(' ')), '.'], state: view() });
      return { steps, result: `[${res.map(([s, e]) => `[${s},${e}]`).join(', ')}]` };
    },
    note: 'Re-sorting costs O(n log n) and ignores that the input is already sorted and disjoint. The three-phase scan (copy before, swallow overlaps, copy after) does it in one O(n) pass.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  },
};

/* ================= 137. Non-overlapping Intervals ================= */
const nonOverlapping: ProblemDef = {
  slug: 'non-overlapping-intervals',
  title: 'Non-overlapping Intervals',
  category: 'Intervals',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/non-overlapping-intervals/',
  technique: 'Sort by end time; greedily keep every interval that starts after the last kept one ends.',
  widget: 'intervals',
  widgetTitle: 'Timeline (sorted by end)',
  inputs: [{ key: 'intervals', label: 'Intervals (s e; …)', defaultValue: '1 2; 2 3; 3 4; 1 3', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int eraseOverlapIntervals(vector<vector<int>>& intervals) {'),
      L('        sort(intervals.begin(), intervals.end(),', 'sort'),
      L('             [](auto& a, auto& b) { return a[1] < b[1]; });', 'sort'),
      L('        int removed = 0, lastEnd = INT_MIN;', 'init'),
      L('        for (auto& iv : intervals) {', 'loop'),
      L('            if (iv[0] >= lastEnd)', 'keep'),
      L('                lastEnd = iv[1];', 'keep'),
      L('            else'),
      L('                removed++;', 'drop'),
      L('        }'),
      L('        return removed;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int eraseOverlapIntervals(int[][] intervals) {'),
      L('        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);', 'sort'),
      L('        int removed = 0, lastEnd = Integer.MIN_VALUE;', 'init'),
      L('        for (int[] iv : intervals) {', 'loop'),
      L('            if (iv[0] >= lastEnd)', 'keep'),
      L('                lastEnd = iv[1];', 'keep'),
      L('            else'),
      L('                removed++;', 'drop'),
      L('        }'),
      L('        return removed;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntervals(values.intervals);
    if (typeof parsed === 'string') return { error: parsed };
    const ivs = [...parsed].sort((a, b) => a[1] - b[1]);
    const domain = domainOf(ivs);
    const steps: Step[] = [];
    let removed = 0;
    let lastEnd = -Infinity;
    const marks: ('good' | 'dim' | undefined)[] = ivs.map(() => undefined);
    const view = (activeIdx?: number): IntervalsState => ({
      intervals: ivs.map(([s, e], i) => ({ s, e, mark: i === activeIdx ? ('active' as const) : marks[i] })),
      domain,
      aggs: [{ label: 'removed', value: String(removed), c: 'c' }],
    });
    steps.push({ tag: 'sort', trace: ['Sort by ', A('end time'), ' — the interval that finishes earliest leaves the most room for everyone after it.'], state: view() });
    ivs.forEach(([s, e], i) => {
      if (s >= lastEnd) {
        lastEnd = e;
        marks[i] = 'good';
        steps.push({ tag: 'keep', trace: ['[', B(s), ',', B(e), '] starts at or after the last kept end — keep it; the bar moves to ', B(e), '.'], state: view(i) });
      } else {
        removed++;
        marks[i] = 'dim';
        steps.push({ tag: 'drop', trace: ['[', F(s), ',', F(e), '] collides with the kept set (starts before ', A(lastEnd), ') — remove it (total ', C(removed), ').'], state: view(i) });
      }
    });
    steps.push({ tag: 'ret', trace: ['Minimum removals for a conflict-free timeline: ', C(removed), '.'], state: view() });
    return { steps, result: String(removed), resultDetail: `${ivs.length - removed} intervals kept` };
  },
  note: '"Remove the fewest" is the mirror of "keep the most" — the classic activity-selection problem. Choosing the earliest-ending compatible interval is provably optimal by an exchange argument: any other choice can be swapped for it without losing anything.',
  complexity: { time: 'O(n log n)', space: 'O(1)' },
  brute: {
    label: 'LIS-style DP',
    technique: 'Sort by end; keep[i] = 1 + the best keep[j] over earlier intervals that end before i starts. Remove n − max(keep).',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int eraseOverlapIntervals(vector<vector<int>>& iv) {'),
        L('        sort(iv.begin(), iv.end(), [](auto& a, auto& b) { return a[1] < b[1]; });', 'sort'),
        L('        int n = iv.size(), best = 0;', 'sort'),
        L('        vector<int> keep(n, 1);', 'sort'),
        L('        for (int i = 0; i < n; i++) {', 'keep'),
        L('            for (int j = 0; j < i; j++)', 'keep'),
        L('                if (iv[j][1] <= iv[i][0]) keep[i] = max(keep[i], keep[j] + 1);', 'keep'),
        L('            best = max(best, keep[i]);', 'keep'),
        L('        }'),
        L('        return n - best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int eraseOverlapIntervals(int[][] iv) {'),
        L('        Arrays.sort(iv, (a, b) -> a[1] - b[1]);', 'sort'),
        L('        int n = iv.length, best = 0;', 'sort'),
        L('        int[] keep = new int[n];', 'sort'),
        L('        for (int i = 0; i < n; i++) {', 'keep'),
        L('            keep[i] = 1;', 'keep'),
        L('            for (int j = 0; j < i; j++)', 'keep'),
        L('                if (iv[j][1] <= iv[i][0]) keep[i] = Math.max(keep[i], keep[j] + 1);', 'keep'),
        L('            best = Math.max(best, keep[i]);', 'keep'),
        L('        }'),
        L('        return n - best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntervals(values.intervals);
      if (typeof parsed === 'string') return { error: parsed };
      const ivs = [...parsed].sort((a, b) => a[1] - b[1]);
      const domain = domainOf(ivs);
      const n = ivs.length;
      const keep = ivs.map(() => 1);
      let best = 0;
      const steps: Step[] = [];
      const view = (active?: number, src: number[] = []): IntervalsState => ({
        intervals: ivs.map(([s, e], i) => ({ s, e, label: i <= (active ?? -1) ? `keep ${keep[i]}` : undefined, mark: i === active ? ('active' as const) : src.includes(i) ? ('src' as const) : undefined })),
        domain,
        aggs: [{ label: 'most kept', value: String(best), c: 'c' }],
      });
      steps.push({ tag: 'sort', trace: ['Sort by end. keep[i] = the most non-overlapping intervals ending with interval i.'], state: view() });
      for (let i = 0; i < n; i++) {
        const src: number[] = [];
        for (let j = 0; j < i; j++)
          if (ivs[j][1] <= ivs[i][0]) {
            src.push(j);
            keep[i] = Math.max(keep[i], keep[j] + 1);
          }
        best = Math.max(best, keep[i]);
        steps.push({
          tag: 'keep',
          trace: ['[', A(ivs[i][0]), ',', A(ivs[i][1]), ']: ', src.length ? ['can follow ', src.length, ' earlier interval(s)'].join('') : 'follows nothing', ' → keep = ', B(keep[i]), '.'],
          state: view(i, src),
        });
      }
      steps.push({ tag: 'ret', trace: ['At most ', A(best), ' can stay, so remove ', C(n - best), '.'], state: view(n - 1) });
      return { steps, result: String(n - best), resultDetail: `${best} intervals kept` };
    },
    note: 'This is longest-chain DP and is O(n²). The greedy — always keep the interval that ends first — provably gives the same count in a single pass after sorting.',
    complexity: { time: 'O(n²)', space: 'O(n)' },
  },
};

/* ================= 138. Meeting Rooms ================= */
const meetingRooms: ProblemDef = {
  slug: 'meeting-rooms',
  title: 'Meeting Rooms',
  category: 'Intervals',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/meeting-rooms/',
  technique: 'Sort by start — one person can attend everything iff no meeting starts before the previous ends.',
  widget: 'intervals',
  widgetTitle: 'Timeline (sorted by start)',
  inputs: [{ key: 'intervals', label: 'Meetings (s e; …)', defaultValue: '0 30; 5 10; 15 20', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    bool canAttendMeetings(vector<vector<int>>& intervals) {'),
      L('        sort(intervals.begin(), intervals.end());', 'sort'),
      L('        for (int i = 1; i < intervals.size(); i++) {', 'loop'),
      L('            if (intervals[i][0] < intervals[i-1][1])', 'clash'),
      L('                return false;', 'clash'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public boolean canAttendMeetings(int[][] intervals) {'),
      L('        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);', 'sort'),
      L('        for (int i = 1; i < intervals.length; i++) {', 'loop'),
      L('            if (intervals[i][0] < intervals[i-1][1])', 'clash'),
      L('                return false;', 'clash'),
      L('        }'),
      L('        return true;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntervals(values.intervals);
    if (typeof parsed === 'string') return { error: parsed };
    const ivs = [...parsed].sort((a, b) => a[0] - b[0]);
    const domain = domainOf(ivs);
    const steps: Step[] = [];
    const view = (a?: number, b2?: number, bad?: boolean): IntervalsState => ({
      intervals: ivs.map(([s, e], i) => ({ s, e, mark: i === a || i === b2 ? (bad ? ('dim' as const) : ('active' as const)) : undefined })),
      domain,
    });
    steps.push({ tag: 'sort', trace: ['Sort by start time — then only ', A('adjacent'), ' meetings can possibly clash.'], state: view() });
    let ok = true;
    for (let i = 1; i < ivs.length; i++) {
      if (ivs[i][0] < ivs[i - 1][1]) {
        ok = false;
        steps.push({
          tag: 'clash',
          trace: ['Meeting [', F(ivs[i][0]), ',', F(ivs[i][1]), '] starts before [', F(ivs[i - 1][0]), ',', F(ivs[i - 1][1]), '] ends — clash. Return ', C('false'), '.'],
          state: view(i - 1, i, true),
        });
        break;
      }
      steps.push({
        tag: 'loop',
        trace: ['[', B(ivs[i - 1][0]), ',', B(ivs[i - 1][1]), '] then [', B(ivs[i][0]), ',', B(ivs[i][1]), '] — back-to-back is fine.'],
        state: view(i - 1, i),
      });
    }
    if (ok) steps.push({ tag: 'ret', trace: ['No adjacent pair overlaps — one person can attend everything: ', C('true'), '.'], state: view() });
    return { steps, result: String(ok) };
  },
  note: 'After sorting by start, an overlap anywhere implies an overlap between *neighbors* — so n−1 adjacent checks are exhaustive, and the whole question collapses to one linear scan.',
  complexity: { time: 'O(n log n)', space: 'O(1)' },
  brute: {
    label: 'Check every pair',
    technique: 'Compare every pair of meetings; any pair that overlaps makes attending all of them impossible.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    bool canAttendMeetings(vector<vector<int>>& m) {'),
        L('        for (int i = 0; i < m.size(); i++)', 'pair'),
        L('            for (int j = i + 1; j < m.size(); j++)', 'pair'),
        L('                if (m[i][0] < m[j][1] && m[j][0] < m[i][1]) return false;', 'pair', 'clash'),
        L('        return true;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public boolean canAttendMeetings(int[][] m) {'),
        L('        for (int i = 0; i < m.length; i++)', 'pair'),
        L('            for (int j = i + 1; j < m.length; j++)', 'pair'),
        L('                if (m[i][0] < m[j][1] && m[j][0] < m[i][1]) return false;', 'pair', 'clash'),
        L('        return true;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntervals(values.intervals);
      if (typeof parsed === 'string') return { error: parsed };
      const domain = domainOf(parsed);
      const steps: Step[] = [];
      const view = (i?: number, j?: number, m: 'active' | 'dim' = 'active'): IntervalsState => ({
        intervals: parsed.map(([s, e], k) => ({ s, e, mark: k === i || k === j ? m : undefined })),
        domain,
      });
      let ok = true;
      outer: for (let i = 0; i < parsed.length; i++)
        for (let j = i + 1; j < parsed.length; j++) {
          const clash = parsed[i][0] < parsed[j][1] && parsed[j][0] < parsed[i][1];
          steps.push({
            tag: clash ? 'clash' : 'pair',
            trace: ['[', A(parsed[i][0]), ',', A(parsed[i][1]), '] vs [', A(parsed[j][0]), ',', A(parsed[j][1]), ']: ', clash ? F('overlap') : B('no overlap'), '.'],
            state: view(i, j, clash ? 'dim' : 'active'),
          });
          if (clash) {
            ok = false;
            break outer;
          }
        }
      steps.push({ tag: 'ret', trace: ok ? ['No pair overlaps — ', C('true'), '.'] : ['Found a clash — ', C('false'), '.'], state: view() });
      return { steps, result: String(ok) };
    },
    note: 'O(n²) pair checks. After sorting by start, only neighbours can clash, so one pass of adjacent comparisons is enough.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

/* ================= 139. Meeting Rooms II ================= */
const meetingRoomsII: ProblemDef = {
  slug: 'meeting-rooms-ii',
  title: 'Meeting Rooms II',
  category: 'Intervals',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/meeting-rooms-ii/',
  technique: 'Sweep the sorted start and end times — the running "meetings in progress" peaks at the answer.',
  widget: 'intervals',
  widgetTitle: 'Timeline & concurrency',
  inputs: [{ key: 'intervals', label: 'Meetings (s e; …)', defaultValue: '0 30; 5 10; 15 20', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int minMeetingRooms(vector<vector<int>>& intervals) {'),
      L('        vector<int> starts, ends;', 'init'),
      L('        for (auto& iv : intervals) {', 'init'),
      L('            starts.push_back(iv[0]);', 'init'),
      L('            ends.push_back(iv[1]);', 'init'),
      L('        }'),
      L('        sort(starts.begin(), starts.end());', 'sort'),
      L('        sort(ends.begin(), ends.end());', 'sort'),
      L('        int rooms = 0, best = 0, e = 0;', 'init'),
      L('        for (int s = 0; s < starts.size(); s++) {', 'loop'),
      L('            while (ends[e] <= starts[s]) {', 'free'),
      L('                rooms--;', 'free'),
      L('                e++;', 'free'),
      L('            }'),
      L('            rooms++;', 'occupy'),
      L('            best = max(best, rooms);', 'occupy'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int minMeetingRooms(int[][] intervals) {'),
      L('        int n = intervals.length;', 'init'),
      L('        int[] starts = new int[n], ends = new int[n];', 'init'),
      L('        for (int i = 0; i < n; i++) {', 'init'),
      L('            starts[i] = intervals[i][0];', 'init'),
      L('            ends[i] = intervals[i][1];', 'init'),
      L('        }'),
      L('        Arrays.sort(starts);', 'sort'),
      L('        Arrays.sort(ends);', 'sort'),
      L('        int rooms = 0, best = 0, e = 0;', 'init'),
      L('        for (int s = 0; s < n; s++) {', 'loop'),
      L('            while (ends[e] <= starts[s]) {', 'free'),
      L('                rooms--;', 'free'),
      L('                e++;', 'free'),
      L('            }'),
      L('            rooms++;', 'occupy'),
      L('            best = Math.max(best, rooms);', 'occupy'),
      L('        }'),
      L('        return best;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const parsed = parseIntervals(values.intervals);
    if (typeof parsed === 'string') return { error: parsed };
    const domain = domainOf(parsed);
    const starts = parsed.map(([s]) => s).sort((a, b) => a - b);
    const ends = parsed.map(([, e]) => e).sort((a, b) => a - b);
    const steps: Step[] = [];
    let rooms = 0;
    let best = 0;
    let e = 0;
    const view = (time?: number): IntervalsState => ({
      intervals: parsed.map(([s2, e2]) => ({
        s: s2,
        e: e2,
        mark: time !== undefined && s2 <= time && time < e2 ? ('active' as const) : undefined,
      })),
      domain,
      aggs: [
        { label: 'rooms in use', value: String(rooms), c: 'a' },
        { label: 'peak', value: String(best), c: 'b' },
      ],
    });
    steps.push({ tag: 'sort', trace: ['Split into sorted start times ', A(starts.join(', ')), ' and end times ', A(ends.join(', ')), ' — the pairing no longer matters, only the counts.'], state: view() });
    for (let s = 0; s < starts.length; s++) {
      while (ends[e] <= starts[s]) {
        rooms--;
        steps.push({ tag: 'free', trace: ['A meeting ended at ', B(ends[e]), ' before this start — a room frees up (', A(rooms), ' in use).'], state: view(starts[s]) });
        e++;
      }
      rooms++;
      if (rooms > best) best = rooms;
      steps.push({
        tag: 'occupy',
        trace: ['Meeting starts at ', A(starts[s]), ' — ', A(rooms), ' room(s) now in use', rooms === best ? [' (new peak).'].join('') : '.'],
        state: view(starts[s]),
      });
    }
    steps.push({ tag: 'ret', trace: ['Peak concurrency = minimum rooms needed: ', C(best), '.'], state: view() });
    return { steps, result: String(best), resultDetail: 'peak simultaneous meetings' };
  },
  note: 'Which meeting occupies which room is irrelevant — only the count of simultaneous meetings matters, and that count changes only at start/end events. Sorting the two event lists separately is legal precisely because identity doesn\'t matter.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  brute: {
    label: 'Count at every start',
    technique: 'At each meeting’s start time, count how many meetings are in progress; the largest count is the number of rooms.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minMeetingRooms(vector<vector<int>>& m) {'),
        L('        int best = 0;', 'init'),
        L('        for (auto& a : m) {', 'count'),
        L('            int live = 0;', 'count'),
        L('            for (auto& b : m)', 'count'),
        L('                if (b[0] <= a[0] && a[0] < b[1]) live++;', 'count'),
        L('            best = max(best, live);', 'count'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minMeetingRooms(int[][] m) {'),
        L('        int best = 0;', 'init'),
        L('        for (int[] a : m) {', 'count'),
        L('            int live = 0;', 'count'),
        L('            for (int[] b : m)', 'count'),
        L('                if (b[0] <= a[0] && a[0] < b[1]) live++;', 'count'),
        L('            best = Math.max(best, live);', 'count'),
        L('        }'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const parsed = parseIntervals(values.intervals);
      if (typeof parsed === 'string') return { error: parsed };
      const domain = domainOf(parsed);
      const steps: Step[] = [];
      let best = 0;
      const view = (t?: number, live: number[] = []): IntervalsState => ({
        intervals: parsed.map(([s, e], k) => ({ s, e, mark: live.includes(k) ? ('active' as const) : undefined, label: t !== undefined && live.includes(k) ? `live @${t}` : undefined })),
        domain,
        aggs: [{ label: 'max in progress', value: String(best), c: 'c' }],
      });
      steps.push({ tag: 'init', trace: ['The room count peaks at some meeting’s start. Check each start time against every meeting.'], state: view() });
      for (const [t] of parsed) {
        const live = parsed.map(([s, e], k) => (s <= t && t < e ? k : -1)).filter((k) => k >= 0);
        const better = live.length > best;
        if (better) best = live.length;
        steps.push({ tag: 'count', trace: ['At time ', A(t), ', ', better ? B(live.length) : A(live.length), ' meeting(s) are in progress', better ? ' — a new peak.' : '.'], state: view(t, live) });
      }
      steps.push({ tag: 'ret', trace: ['Rooms needed: ', C(best), '.'], state: view() });
      return { steps, result: String(best), resultDetail: 'peak simultaneous meetings' };
    },
    note: 'Checking every start against every meeting is O(n²). Sweeping sorted start and end times keeps a running count and finds the same peak in O(n log n).',
    complexity: { time: 'O(n²)', space: 'O(1)' },
  },
};

export const intervals = [mergeIntervals, insertInterval, nonOverlapping, meetingRooms, meetingRoomsII];
