// Binary Search template problems (array mode + "on the answer" mode).
import type { BinarySearchState, ProblemDef, Step } from '../lib/types';
import { parseInt1, parseIntArray } from '../lib/parse';
import { A, B, C, F, L } from '../lib/trace';

/* ================================================================
 * 704. Binary Search
 * ================================================================ */
const binarySearch: ProblemDef = {
  slug: 'binary-search',
  title: 'Binary Search',
  category: 'Binary Search',
  difficulty: 'Easy',
  leetcode: 'https://leetcode.com/problems/binary-search/',
  technique: 'Halve the search range each step by comparing the middle element with the target.',
  widget: 'binary-search',
  widgetTitle: 'Search range',
  inputs: [
    { key: 'nums', label: 'Sorted array', defaultValue: '-1, 0, 3, 5, 9, 12', wide: true },
    { key: 'target', label: 'Target', defaultValue: '9' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int search(vector<int>& nums, int target) {'),
      L('        int lo = 0, hi = nums.size() - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target)', 'mid', 'found'),
      L('                return mid;', 'found'),
      L('            else if (nums[mid] < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return -1;', 'notfound'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int search(int[] nums, int target) {'),
      L('        int lo = 0, hi = nums.length - 1;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] == target)', 'mid', 'found'),
      L('                return mid;', 'found'),
      L('            else if (nums[mid] < target)', 'right'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid - 1;', 'left'),
      L('        }'),
      L('        return -1;', 'notfound'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    for (let i = 1; i < arr.length; i++)
      if (arr[i] < arr[i - 1]) return { error: 'Array must be sorted in non-decreasing order.' };
    const target = parseInt1(values.target, 'Target');
    if (typeof target === 'string') return { error: target };

    const steps: Step[] = [];
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'array', arr, lo: 0, hi: arr.length - 1, ...s } as BinarySearchState);

    let lo = 0;
    let hi = arr.length - 1;
    steps.push({
      tag: 'init',
      trace: ['The whole array is in play: ', A(`lo = 0`), ' … ', A(`hi = ${hi}`), ', searching for target ', C(target), '.'],
      state: st({ lo, hi }),
    });
    let found = -1;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({
        tag: 'mid',
        trace: ['Probe the middle: ', A(`mid = ${mid}`), ', where nums[mid] = ', A(arr[mid]), '.'],
        state: st({ lo, hi, mid }),
      });
      if (arr[mid] === target) {
        found = mid;
        steps.push({
          tag: 'found',
          trace: ['nums[mid] = ', B(arr[mid]), ' equals the target — found it at index ', C(mid), '.'],
          state: st({ lo, hi, mid, finalIndex: mid }),
        });
        break;
      } else if (arr[mid] < target) {
        lo = mid + 1;
        steps.push({
          tag: 'right',
          trace: [F(arr[mid]), ' < ', C(target), ' — the target can only be to the right. Discard the left half: lo = ', A(lo), '.'],
          state: st({ lo, hi, mid }),
        });
      } else {
        hi = mid - 1;
        steps.push({
          tag: 'left',
          trace: [F(arr[mid]), ' > ', C(target), ' — the target can only be to the left. Discard the right half: hi = ', A(hi), '.'],
          state: st({ lo, hi, mid }),
        });
      }
    }
    if (found === -1) {
      steps.push({
        tag: 'notfound',
        trace: ['lo has passed hi — the range is empty. ', C(target), ' is not in the array; return ', C('-1'), '.'],
        state: st({ lo, hi, finalIndex: null }),
      });
    }
    return {
      steps,
      result: found === -1 ? '-1' : `index ${found}`,
      resultDetail: found === -1 ? 'Target not present.' : `nums[${found}] = ${target}`,
    };
  },
  note: 'Because the array is sorted, one comparison against the middle element tells you which half the target must live in — so every step throws away half of the remaining candidates, giving O(log n).',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Check every element from left to right until one equals the target.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int search(vector<int>& nums, int target) {'),
        L('        for (int i = 0; i < nums.size(); i++)', 'scan'),
        L('            if (nums[i] == target) return i;', 'scan', 'found'),
        L('        return -1;', 'notfound'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int search(int[] nums, int target) {'),
        L('        for (int i = 0; i < nums.length; i++)', 'scan'),
        L('            if (nums[i] == target) return i;', 'scan', 'found'),
        L('        return -1;', 'notfound'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      for (let i = 1; i < arr.length; i++)
        if (arr[i] < arr[i - 1]) return { error: 'Array must be sorted in non-decreasing order.' };
      const target = parseInt1(values.target, 'Target');
      if (typeof target === 'string') return { error: target };
      const steps: Step[] = [];
      const hi = arr.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr, lo: 0, hi, ...s }) as BinarySearchState;
      let found = -1;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
          found = i;
          steps.push({ tag: 'found', trace: ['nums[', A(i), '] = ', B(arr[i]), ' — found after ', C(i + 1), ' comparisons.'], state: st({ lo: i, mid: i, finalIndex: i }) });
          break;
        }
        steps.push({ tag: 'scan', trace: ['nums[', A(i), '] = ', F(arr[i]), ' ≠ ', C(target), ' — move one step right.'], state: st({ lo: i, mid: i }) });
      }
      if (found === -1) steps.push({ tag: 'notfound', trace: ['Checked all ', A(arr.length), ' elements — return ', C('-1'), '.'], state: st({ lo: arr.length, finalIndex: null }) });
      return {
        steps,
        result: found === -1 ? '-1' : `index ${found}`,
        resultDetail: found === -1 ? 'Target not present.' : `nums[${found}] = ${target}`,
      };
    },
    note: 'Works on any array, sorted or not, but looks at up to n elements. Binary search uses the sorted order to discard half the remaining range with each comparison.',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

/* ================================================================
 * 875. Koko Eating Bananas — binary search on the answer
 * ================================================================ */
const koko: ProblemDef = {
  slug: 'koko-eating-bananas',
  title: 'Koko Eating Bananas',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/koko-eating-bananas/',
  technique: 'Binary search on the answer: the eating speed itself, using a feasibility check as the comparison.',
  widget: 'binary-search',
  widgetTitle: 'Candidate speeds k',
  inputs: [
    { key: 'piles', label: 'Piles', defaultValue: '3, 6, 7, 11', wide: true },
    { key: 'h', label: 'Hours h', defaultValue: '8' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    long hoursNeeded(vector<int>& piles, int k) {', 'probe'),
      L('        long hours = 0;', 'probe'),
      L('        for (int p : piles) hours += (p + k - 1) / k;', 'probe'),
      L('        return hours;', 'probe'),
      L('    }'),
      L('    int minEatingSpeed(vector<int>& piles, int h) {'),
      L('        int lo = 1, hi = *max_element(piles.begin(), piles.end());', 'init'),
      L('        int ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (hoursNeeded(piles, mid) <= h) {', 'check'),
      L('                ans = mid; hi = mid - 1;', 'ok'),
      L('            } else {'),
      L('                lo = mid + 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private long hoursNeeded(int[] piles, int k) {', 'probe'),
      L('        long hours = 0;', 'probe'),
      L('        for (int p : piles) hours += (p + k - 1) / k;', 'probe'),
      L('        return hours;', 'probe'),
      L('    }'),
      L('    public int minEatingSpeed(int[] piles, int h) {'),
      L('        int lo = 1, hi = 0;', 'init'),
      L('        for (int p : piles) hi = Math.max(hi, p);', 'init'),
      L('        int ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (hoursNeeded(piles, mid) <= h) {', 'check'),
      L('                ans = mid; hi = mid - 1;', 'ok'),
      L('            } else {'),
      L('                lo = mid + 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const piles = parseIntArray(values.piles, { min: 1 });
    if (typeof piles === 'string') return { error: piles };
    const h = parseInt1(values.h, 'Hours', { min: 1 });
    if (typeof h === 'string') return { error: h };
    if (h < piles.length) return { error: `Hours must be ≥ number of piles (${piles.length}) or no speed works.` };

    const maxPile = Math.max(...piles);
    const domain: [number, number] = [1, maxPile];
    const steps: Step[] = [];
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'bananas / hour', lo: 1, hi: maxPile, ...s } as BinarySearchState);

    let lo = 1;
    let hi = maxPile;
    let ans = maxPile;
    let best: number | null = null;
    steps.push({
      tag: 'init',
      trace: [
        'Any speed from ', A(1), ' to ', A(maxPile), ' (the biggest pile) could be the answer. Search that range, not the array.',
      ],
      state: st({ lo, hi, best }),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({
        tag: 'mid',
        trace: ['Try the middle speed: ', A(`k = ${mid}`), ' bananas/hour.'],
        state: st({ lo, hi, mid, best }),
      });
      const hours = piles.reduce((acc, p) => acc + Math.ceil(p / mid), 0);
      const feasible = hours <= h;
      steps.push({
        tag: 'check',
        tag2: 'probe',
        trace: [
          'Feasibility probe: at speed ', A(mid), ', Koko needs ', A(hours), ' hours — ',
          feasible ? B(`${hours} ≤ ${h} ✓`) : F(`${hours} > ${h} ✗`), '.',
        ],
        state: st({
          lo, hi, mid, best,
          probe: {
            text: `hours(k=${mid}) = ${piles.map((p) => `⌈${p}/${mid}⌉`).join(' + ')} = ${hours}`,
            verdict: feasible ? 'yes' : 'no',
            verdictText: feasible ? `${hours} ≤ ${h} h ✓` : `${hours} > ${h} h ✗`,
          },
        }),
      });
      if (feasible) {
        ans = mid;
        best = mid;
        hi = mid - 1;
        steps.push({
          tag: 'ok',
          trace: ['Speed ', B(mid), ' works — record it as the best so far, then look for something slower: hi = ', A(hi), '.'],
          state: st({ lo, hi, best }),
        });
      } else {
        lo = mid + 1;
        steps.push({
          tag: 'no',
          trace: ['Too slow — every speed ≤ ', F(mid), ' also fails. Discard them: lo = ', A(lo), '.'],
          state: st({ lo, hi, best }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['The range is empty — the slowest feasible speed is ', C(ans), ' bananas/hour.'],
      state: st({ lo, hi, best: ans }),
    });
    return { steps, result: String(ans), resultDetail: 'minimum eating speed (bananas / hour)' };
  },
  note: 'Feasibility is monotone: if Koko can finish at speed k, she can finish at every speed above k. That yes/no boundary is exactly what binary search finds — we search the space of answers, never the array itself.',
  complexity: { time: 'O(n · log max(piles))', space: 'O(1)' },
  brute: {
    label: 'Try every speed',
    technique: 'Try speeds 1, 2, 3, … in order and return the first one that finishes within h hours.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int minEatingSpeed(vector<int>& piles, int h) {'),
        L('        for (int k = 1; ; k++) {', 'mid'),
        L('            long hours = 0;', 'check'),
        L('            for (int p : piles) hours += (p + k - 1) / k;', 'check'),
        L('            if (hours <= h) return k;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int minEatingSpeed(int[] piles, int h) {'),
        L('        for (int k = 1; ; k++) {', 'mid'),
        L('            long hours = 0;', 'check'),
        L('            for (int p : piles) hours += (p + k - 1) / k;', 'check'),
        L('            if (hours <= h) return k;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const piles = parseIntArray(values.piles, { min: 1 });
      if (typeof piles === 'string') return { error: piles };
      const h = parseInt1(values.h, 'Hours', { min: 1 });
      if (typeof h === 'string') return { error: h };
      if (h < piles.length) return { error: `Hours must be ≥ number of piles (${piles.length}) or no speed works.` };
      const maxPile = Math.max(...piles);
      const domain: [number, number] = [1, maxPile];
      const steps: Step[] = [];
      const st = (s: Partial<BinarySearchState>): BinarySearchState =>
        ({ mode: 'answer', domain, domainLabel: 'bananas / hour', lo: 1, hi: maxPile, ...s }) as BinarySearchState;
      let k = 1;
      for (; k <= maxPile; k++) {
        const hours = piles.reduce((acc, p) => acc + Math.ceil(p / k), 0);
        const ok = hours <= h;
        steps.push({
          tag: ok ? 'ret' : 'check',
          trace: ['Speed ', A(k), ': ', A(hours), ' hours — ', ok ? B(`${hours} ≤ ${h}, the first speed that works.`) : F(`${hours} > ${h}, too slow.`)],
          state: st({
            lo: k,
            mid: k,
            best: ok ? k : null,
            probe: { text: `hours(k=${k}) = ${hours}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${hours} ≤ ${h} h ✓` : `${hours} > ${h} h ✗` },
          }),
        });
        if (ok) break;
      }
      steps.push({ tag: 'ret', trace: ['Tried ', A(k), ' speeds — the slowest feasible speed is ', C(k), '.'], state: st({ lo: k, hi: k, best: k }) });
      return { steps, result: String(k), resultDetail: 'minimum eating speed (bananas / hour)' };
    },
    note: 'Each check costs O(n), and in the worst case every speed up to the biggest pile is tried. Because feasibility only ever flips from "no" to "yes" once, binary search finds that flip in log(max pile) checks.',
    complexity: { time: 'O(n · max(piles))', space: 'O(1)' },
  },
};

/* ================================================================
 * 1011. Capacity To Ship Packages Within D Days
 * ================================================================ */
const shipPackages: ProblemDef = {
  slug: 'capacity-to-ship-packages-within-d-days',
  title: 'Capacity To Ship Packages Within D Days',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
  technique: 'Binary search on the answer: the ship capacity, checked by greedily packing days.',
  widget: 'binary-search',
  widgetTitle: 'Candidate capacities',
  inputs: [
    { key: 'weights', label: 'Weights', defaultValue: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10', wide: true },
    { key: 'days', label: 'Days', defaultValue: '5' },
  ],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int daysNeeded(vector<int>& w, int cap) {', 'probe'),
      L('        int days = 1, load = 0;', 'probe'),
      L('        for (int x : w) {', 'probe'),
      L('            if (load + x > cap) { days++; load = 0; }', 'probe'),
      L('            load += x;', 'probe'),
      L('        }'),
      L('        return days;', 'probe'),
      L('    }'),
      L('    int shipWithinDays(vector<int>& weights, int days) {'),
      L('        int lo = *max_element(weights.begin(), weights.end());', 'init'),
      L('        int hi = accumulate(weights.begin(), weights.end(), 0);', 'init'),
      L('        int ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (daysNeeded(weights, mid) <= days) {', 'check'),
      L('                ans = mid; hi = mid - 1;', 'ok'),
      L('            } else {'),
      L('                lo = mid + 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    private int daysNeeded(int[] w, int cap) {', 'probe'),
      L('        int days = 1, load = 0;', 'probe'),
      L('        for (int x : w) {', 'probe'),
      L('            if (load + x > cap) { days++; load = 0; }', 'probe'),
      L('            load += x;', 'probe'),
      L('        }'),
      L('        return days;', 'probe'),
      L('    }'),
      L('    public int shipWithinDays(int[] weights, int days) {'),
      L('        int lo = 0, hi = 0;', 'init'),
      L('        for (int x : weights) { lo = Math.max(lo, x); hi += x; }', 'init'),
      L('        int ans = hi;', 'init'),
      L('        while (lo <= hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (daysNeeded(weights, mid) <= days) {', 'check'),
      L('                ans = mid; hi = mid - 1;', 'ok'),
      L('            } else {'),
      L('                lo = mid + 1;', 'no'),
      L('            }'),
      L('        }'),
      L('        return ans;', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const w = parseIntArray(values.weights, { min: 1 });
    if (typeof w === 'string') return { error: w };
    const days = parseInt1(values.days, 'Days', { min: 1 });
    if (typeof days === 'string') return { error: days };

    const minCap = Math.max(...w);
    const maxCap = w.reduce((a, b) => a + b, 0);
    const domain: [number, number] = [minCap, maxCap];
    const steps: Step[] = [];
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'answer', domain, domainLabel: 'ship capacity', lo: minCap, hi: maxCap, ...s } as BinarySearchState);

    const daysNeeded = (cap: number) => {
      let d = 1;
      let load = 0;
      for (const x of w) {
        if (load + x > cap) {
          d++;
          load = 0;
        }
        load += x;
      }
      return d;
    };

    let lo = minCap;
    let hi = maxCap;
    let ans = maxCap;
    let best: number | null = null;
    steps.push({
      tag: 'init',
      trace: [
        'The capacity must be at least the heaviest package (', A(minCap), ') and never needs to exceed the total weight (', A(maxCap), '). Search between them.',
      ],
      state: st({ lo, hi, best }),
    });
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({
        tag: 'mid',
        trace: ['Try the middle capacity: ', A(`cap = ${mid}`), '.'],
        state: st({ lo, hi, mid, best }),
      });
      const need = daysNeeded(mid);
      const feasible = need <= days;
      steps.push({
        tag: 'check',
        tag2: 'probe',
        trace: [
          'Greedy probe: packing days until full, capacity ', A(mid), ' ships everything in ', A(need), ' days — ',
          feasible ? B(`${need} ≤ ${days} ✓`) : F(`${need} > ${days} ✗`), '.',
        ],
        state: st({
          lo, hi, mid, best,
          probe: {
            text: `daysNeeded(cap=${mid}) = ${need}`,
            verdict: feasible ? 'yes' : 'no',
            verdictText: feasible ? `${need} ≤ ${days} days ✓` : `${need} > ${days} days ✗`,
          },
        }),
      });
      if (feasible) {
        ans = mid;
        best = mid;
        hi = mid - 1;
        steps.push({
          tag: 'ok',
          trace: ['Capacity ', B(mid), ' is enough — record it, then try smaller ships: hi = ', A(hi), '.'],
          state: st({ lo, hi, best }),
        });
      } else {
        lo = mid + 1;
        steps.push({
          tag: 'no',
          trace: ['Too small — every capacity ≤ ', F(mid), ' also fails. lo = ', A(lo), '.'],
          state: st({ lo, hi, best }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['Search exhausted — the least capacity that still fits in ', A(days), ' days is ', C(ans), '.'],
      state: st({ lo, hi, best: ans }),
    });
    return { steps, result: String(ans), resultDetail: 'minimum ship capacity' };
  },
  note: 'Once a capacity works, every larger capacity also works — the answer space splits cleanly into "too small" and "big enough". Binary search homes in on that boundary, and the greedy day-packing check is the cheapest possible feasibility test.',
  complexity: { time: 'O(n · log Σweights)', space: 'O(1)' },
  brute: {
    label: 'Try every capacity',
    technique: 'Start at the heaviest package and raise the capacity by 1 until the packages fit in the given days.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int shipWithinDays(vector<int>& weights, int days) {'),
        L('        int cap = *max_element(weights.begin(), weights.end());', 'init'),
        L('        for (; ; cap++) {', 'mid'),
        L('            int d = 1, load = 0;', 'check'),
        L('            for (int w : weights) {', 'check'),
        L('                if (load + w > cap) { d++; load = 0; }', 'check'),
        L('                load += w;', 'check'),
        L('            }'),
        L('            if (d <= days) return cap;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int shipWithinDays(int[] weights, int days) {'),
        L('        int cap = 0;', 'init'),
        L('        for (int w : weights) cap = Math.max(cap, w);', 'init'),
        L('        for (; ; cap++) {', 'mid'),
        L('            int d = 1, load = 0;', 'check'),
        L('            for (int w : weights) {', 'check'),
        L('                if (load + w > cap) { d++; load = 0; }', 'check'),
        L('                load += w;', 'check'),
        L('            }'),
        L('            if (d <= days) return cap;', 'check', 'ret'),
        L('        }'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const w = parseIntArray(values.weights, { min: 1 });
      if (typeof w === 'string') return { error: w };
      const days = parseInt1(values.days, 'Days', { min: 1 });
      if (typeof days === 'string') return { error: days };
      const minCap = Math.max(...w);
      const maxCap = w.reduce((a, b) => a + b, 0);
      const domain: [number, number] = [minCap, maxCap];
      const steps: Step[] = [];
      const st = (s: Partial<BinarySearchState>): BinarySearchState =>
        ({ mode: 'answer', domain, domainLabel: 'ship capacity', lo: minCap, hi: maxCap, ...s }) as BinarySearchState;
      const daysNeeded = (cap: number) => {
        let d = 1;
        let load = 0;
        for (const x of w) {
          if (load + x > cap) {
            d++;
            load = 0;
          }
          load += x;
        }
        return d;
      };
      steps.push({ tag: 'init', trace: ['Start at the smallest capacity that can carry every package: ', A(minCap), '.'], state: st({}) });
      let cap = minCap;
      let tries = 0;
      for (; cap <= maxCap; cap++) {
        tries++;
        const need = daysNeeded(cap);
        const ok = need <= days;
        if (ok || tries <= 30) {
          steps.push({
            tag: ok ? 'ret' : 'check',
            trace: ['Capacity ', A(cap), ' needs ', A(need), ' days — ', ok ? B(`fits in ${days}.`) : F(`more than ${days}, try ${cap + 1}.`)],
            state: st({
              lo: cap,
              mid: cap,
              best: ok ? cap : null,
              probe: { text: `daysNeeded(cap=${cap}) = ${need}`, verdict: ok ? 'yes' : 'no', verdictText: ok ? `${need} ≤ ${days} days ✓` : `${need} > ${days} days ✗` },
            }),
          });
        }
        if (ok) break;
      }
      steps.push({ tag: 'ret', trace: ['Tried ', A(tries), ' capacities — the least that works is ', C(cap), '.'], state: st({ lo: cap, hi: cap, best: cap }) });
      return { steps, result: String(cap), resultDetail: 'minimum ship capacity' };
    },
    note: 'The number of capacities tried can be as large as the total weight, each costing an O(n) packing pass. Binary search over the same range needs only log(Σ weights) packing passes.',
    complexity: { time: 'O(n · Σweights)', space: 'O(1)' },
  },
};

/* ================================================================
 * 153. Find Minimum in Rotated Sorted Array
 * ================================================================ */
const findMinRotated: ProblemDef = {
  slug: 'find-minimum-in-rotated-sorted-array',
  title: 'Find Minimum in Rotated Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  leetcode: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
  technique: 'Binary search using the last element as a pivot reference — no target needed.',
  widget: 'binary-search',
  widgetTitle: 'Search range',
  inputs: [{ key: 'nums', label: 'Rotated array', defaultValue: '4, 5, 6, 7, 0, 1, 2', wide: true }],
  code: {
    cpp: [
      L('class Solution {'),
      L('public:'),
      L('    int findMin(vector<int>& nums) {'),
      L('        int lo = 0, hi = nums.size() - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] > nums[hi])', 'cmp'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid;', 'left'),
      L('        }'),
      L('        return nums[lo];', 'ret'),
      L('    }'),
      L('};'),
    ],
    java: [
      L('class Solution {'),
      L('    public int findMin(int[] nums) {'),
      L('        int lo = 0, hi = nums.length - 1;', 'init'),
      L('        while (lo < hi) {', 'loop'),
      L('            int mid = lo + (hi - lo) / 2;', 'mid'),
      L('            if (nums[mid] > nums[hi])', 'cmp'),
      L('                lo = mid + 1;', 'right'),
      L('            else'),
      L('                hi = mid;', 'left'),
      L('        }'),
      L('        return nums[lo];', 'ret'),
      L('    }'),
      L('}'),
    ],
  },
  run(values) {
    const arr = parseIntArray(values.nums);
    if (typeof arr === 'string') return { error: arr };
    if (new Set(arr).size !== arr.length) return { error: 'Values must be distinct (as in the original problem).' };

    const steps: Step[] = [];
    const st = (s: Partial<BinarySearchState>): BinarySearchState =>
      ({ mode: 'array', arr, lo: 0, hi: arr.length - 1, ...s } as BinarySearchState);

    let lo = 0;
    let hi = arr.length - 1;
    steps.push({
      tag: 'init',
      trace: ['Search the whole array: ', A('lo = 0'), ' … ', A(`hi = ${hi}`), '. The minimum is the rotation point.'],
      state: st({ lo, hi }),
    });
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      steps.push({
        tag: 'mid',
        trace: ['Probe ', A(`mid = ${mid}`), ': compare nums[mid] = ', A(arr[mid]), ' against nums[hi] = ', A(arr[hi]), '.'],
        state: st({ lo, hi, mid }),
      });
      if (arr[mid] > arr[hi]) {
        lo = mid + 1;
        steps.push({
          tag: 'right',
          trace: [F(arr[mid]), ' > ', A(arr[hi]), ' — mid sits in the rotated upper run, so the minimum is strictly to its right: lo = ', A(lo), '.'],
          state: st({ lo, hi, mid }),
        });
      } else {
        hi = mid;
        steps.push({
          tag: 'left',
          trace: [B(arr[mid]), ' ≤ ', A(arr[hi]), ' — mid is already in the sorted tail, so the minimum is at mid or left of it: hi = ', A(hi), '.'],
          state: st({ lo, hi, mid }),
        });
      }
    }
    steps.push({
      tag: 'ret',
      trace: ['lo and hi meet at index ', A(lo), ' — the minimum is ', C(arr[lo]), '.'],
      state: st({ lo, hi, finalIndex: lo }),
    });
    return { steps, result: String(arr[lo]), resultDetail: `found at index ${lo}` };
  },
  note: 'Comparing mid against the last element always tells you which side of the rotation point you are on: greater means the "cliff" is to the right, otherwise mid itself may be the minimum. Note hi = mid (not mid − 1) — mid is never safely discardable on that branch.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  brute: {
    label: 'Linear scan',
    technique: 'Walk the whole array and keep the smallest value seen.',
    code: {
      cpp: [
        L('class Solution {'),
        L('public:'),
        L('    int findMin(vector<int>& nums) {'),
        L('        int best = nums[0];', 'init'),
        L('        for (int x : nums) best = min(best, x);', 'scan'),
        L('        return best;', 'ret'),
        L('    }'),
        L('};'),
      ],
      java: [
        L('class Solution {'),
        L('    public int findMin(int[] nums) {'),
        L('        int best = nums[0];', 'init'),
        L('        for (int x : nums) best = Math.min(best, x);', 'scan'),
        L('        return best;', 'ret'),
        L('    }'),
        L('}'),
      ],
    },
    run(values) {
      const arr = parseIntArray(values.nums);
      if (typeof arr === 'string') return { error: arr };
      if (new Set(arr).size !== arr.length) return { error: 'Values must be distinct (as in the original problem).' };
      const steps: Step[] = [];
      const hi = arr.length - 1;
      const st = (s: Partial<BinarySearchState>): BinarySearchState => ({ mode: 'array', arr, lo: 0, hi, ...s }) as BinarySearchState;
      let bi = 0;
      steps.push({ tag: 'init', trace: ['Ignore the rotation: start with ', A(arr[0]), ' as the smallest so far.'], state: st({ mid: 0 }) });
      for (let i = 1; i < arr.length; i++) {
        const better = arr[i] < arr[bi];
        if (better) bi = i;
        steps.push({
          tag: 'scan',
          trace: ['nums[', A(i), '] = ', better ? B(arr[i]) : F(arr[i]), better ? ' — a new minimum.' : [' is not smaller than ', arr[bi], '.'].join('')],
          state: st({ lo: i, mid: i }),
        });
      }
      steps.push({ tag: 'ret', trace: ['Scanned all ', A(arr.length), ' values — the minimum is ', C(arr[bi]), '.'], state: st({ lo: bi, hi: bi, finalIndex: bi }) });
      return { steps, result: String(arr[bi]), resultDetail: `found at index ${bi}` };
    },
    note: 'Always correct, but it reads every element and ignores the fact that both halves of a rotated array are sorted. Comparing mid with the last element finds the rotation point in O(log n).',
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
};

export const binarySearchProblems = [binarySearch, koko, shipPackages, findMinRotated];
