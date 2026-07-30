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
};

export const intervals = [mergeIntervals, insertInterval, nonOverlapping, meetingRooms, meetingRoomsII];
