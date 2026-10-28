// The Code Catalyst practice list (from "DSA Basics 2026 - Code Catalyst.xlsx"),
// grouped by practice set in the sheet's order. Every slug has a visualizer
// in src/problems (shared with the main list or under ./codeCatalyst).
export interface CodeCatalystQuestion {
  slug: string;
  title: string;
  /** LeetCode problem number. */
  number: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CodeCatalystSet {
  set: number;
  name: string;
  questions: CodeCatalystQuestion[];
}

export const codeCatalystSets: CodeCatalystSet[] = [
  {
    "set": 1,
    "name": "Basic Problem Solving and 2 Pointers",
    "questions": [
      {
        "slug": "number-of-steps-to-reduce-a-number-to-zero",
        "title": "Number of Steps to Reduce a Number to Zero",
        "number": 1342,
        "difficulty": "Easy"
      },
      {
        "slug": "subtract-the-product-and-sum-of-digits-of-an-integer",
        "title": "Subtract the Product and Sum of Digits of an Integer",
        "number": 1281,
        "difficulty": "Easy"
      },
      {
        "slug": "count-odd-numbers-in-an-interval-range",
        "title": "Count Odd Numbers in an Interval Range",
        "number": 1523,
        "difficulty": "Easy"
      },
      {
        "slug": "valid-perfect-square",
        "title": "Valid Perfect Square",
        "number": 367,
        "difficulty": "Easy"
      },
      {
        "slug": "palindrome-number",
        "title": "Palindrome Number",
        "number": 9,
        "difficulty": "Easy"
      },
      {
        "slug": "reverse-string",
        "title": "Reverse String",
        "number": 344,
        "difficulty": "Easy"
      },
      {
        "slug": "valid-palindrome",
        "title": "Valid Palindrome",
        "number": 125,
        "difficulty": "Easy"
      },
      {
        "slug": "remove-element",
        "title": "Remove Element",
        "number": 27,
        "difficulty": "Easy"
      },
      {
        "slug": "remove-duplicates-from-sorted-array",
        "title": "Remove Duplicates from Sorted Array",
        "number": 26,
        "difficulty": "Easy"
      },
      {
        "slug": "move-zeroes",
        "title": "Move Zeroes",
        "number": 283,
        "difficulty": "Easy"
      },
      {
        "slug": "squares-of-a-sorted-array",
        "title": "Squares of a Sorted Array",
        "number": 977,
        "difficulty": "Easy"
      },
      {
        "slug": "is-subsequence",
        "title": "Is Subsequence",
        "number": 392,
        "difficulty": "Easy"
      },
      {
        "slug": "merge-sorted-array",
        "title": "Merge Sorted Array",
        "number": 88,
        "difficulty": "Easy"
      },
      {
        "slug": "valid-palindrome-ii",
        "title": "Valid Palindrome II",
        "number": 680,
        "difficulty": "Easy"
      },
      {
        "slug": "duplicate-zeros",
        "title": "Duplicate Zeros",
        "number": 1089,
        "difficulty": "Easy"
      },
      {
        "slug": "intersection-of-two-arrays-ii",
        "title": "Intersection of Two Arrays II",
        "number": 350,
        "difficulty": "Easy"
      },
      {
        "slug": "reverse-integer",
        "title": "Reverse Integer",
        "number": 7,
        "difficulty": "Medium"
      },
      {
        "slug": "two-sum-ii-input-array-is-sorted",
        "title": "Two Sum II - Input Array Is Sorted",
        "number": 167,
        "difficulty": "Medium"
      },
      {
        "slug": "remove-duplicates-from-sorted-array-ii",
        "title": "Remove Duplicates from Sorted Array II",
        "number": 80,
        "difficulty": "Medium"
      },
      {
        "slug": "string-compression",
        "title": "String Compression",
        "number": 443,
        "difficulty": "Medium"
      },
      {
        "slug": "reverse-words-in-a-string",
        "title": "Reverse Words in a String",
        "number": 151,
        "difficulty": "Medium"
      },
      {
        "slug": "interval-list-intersections",
        "title": "Interval List Intersections",
        "number": 986,
        "difficulty": "Medium"
      },
      {
        "slug": "container-with-most-water",
        "title": "Container With Most Water",
        "number": 11,
        "difficulty": "Medium"
      },
      {
        "slug": "longest-mountain-in-array",
        "title": "Longest Mountain in Array",
        "number": 845,
        "difficulty": "Medium"
      },
      {
        "slug": "fizz-buzz",
        "title": "Fizz Buzz",
        "number": 412,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 2,
    "name": "Arrays, Strings & Hashing",
    "questions": [
      {
        "slug": "best-time-to-buy-and-sell-stock",
        "title": "Best Time to Buy and Sell Stock",
        "number": 121,
        "difficulty": "Easy"
      },
      {
        "slug": "richest-customer-wealth",
        "title": "Richest Customer Wealth",
        "number": 1672,
        "difficulty": "Easy"
      },
      {
        "slug": "defanging-an-ip-address",
        "title": "Defanging an IP Address",
        "number": 1108,
        "difficulty": "Easy"
      },
      {
        "slug": "longest-common-prefix",
        "title": "Longest Common Prefix",
        "number": 14,
        "difficulty": "Easy"
      },
      {
        "slug": "contains-duplicate",
        "title": "Contains Duplicate",
        "number": 217,
        "difficulty": "Easy"
      },
      {
        "slug": "intersection-of-two-arrays",
        "title": "Intersection of Two Arrays",
        "number": 349,
        "difficulty": "Easy"
      },
      {
        "slug": "ransom-note",
        "title": "Ransom Note",
        "number": 383,
        "difficulty": "Easy"
      },
      {
        "slug": "first-unique-character-in-a-string",
        "title": "First Unique Character in a String",
        "number": 387,
        "difficulty": "Easy"
      },
      {
        "slug": "valid-anagram",
        "title": "Valid Anagram",
        "number": 242,
        "difficulty": "Easy"
      },
      {
        "slug": "two-sum",
        "title": "Two Sum",
        "number": 1,
        "difficulty": "Easy"
      },
      {
        "slug": "isomorphic-strings",
        "title": "Isomorphic Strings",
        "number": 205,
        "difficulty": "Easy"
      },
      {
        "slug": "rotate-array",
        "title": "Rotate Array",
        "number": 189,
        "difficulty": "Medium"
      },
      {
        "slug": "spiral-matrix",
        "title": "Spiral Matrix",
        "number": 54,
        "difficulty": "Medium"
      },
      {
        "slug": "set-matrix-zeroes",
        "title": "Set Matrix Zeroes",
        "number": 73,
        "difficulty": "Medium"
      },
      {
        "slug": "rotate-image",
        "title": "Rotate Image",
        "number": 48,
        "difficulty": "Medium"
      },
      {
        "slug": "zigzag-conversion",
        "title": "Zigzag Conversion",
        "number": 6,
        "difficulty": "Medium"
      },
      {
        "slug": "valid-sudoku",
        "title": "Valid Sudoku",
        "number": 36,
        "difficulty": "Medium"
      },
      {
        "slug": "longest-consecutive-sequence",
        "title": "Longest Consecutive Sequence",
        "number": 128,
        "difficulty": "Medium"
      },
      {
        "slug": "group-anagrams",
        "title": "Group Anagrams",
        "number": 49,
        "difficulty": "Medium"
      },
      {
        "slug": "equal-row-and-column-pairs",
        "title": "Equal Row and Column Pairs",
        "number": 2352,
        "difficulty": "Medium"
      },
      {
        "slug": "count-nice-pairs-in-an-array",
        "title": "Count Nice Pairs in an Array",
        "number": 1814,
        "difficulty": "Medium"
      },
      {
        "slug": "4sum-ii",
        "title": "4Sum II",
        "number": 454,
        "difficulty": "Medium"
      },
      {
        "slug": "determine-if-two-strings-are-close",
        "title": "Determine if Two Strings Are Close",
        "number": 1657,
        "difficulty": "Medium"
      },
      {
        "slug": "find-duplicate-file-in-system",
        "title": "Find Duplicate File in System",
        "number": 609,
        "difficulty": "Medium"
      },
      {
        "slug": "max-consecutive-ones",
        "title": "Max Consecutive Ones",
        "number": 485,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 3,
    "name": "Prefix Sum & Difference Arrays",
    "questions": [
      {
        "slug": "find-the-highest-altitude",
        "title": "Find the Highest Altitude",
        "number": 1732,
        "difficulty": "Easy"
      },
      {
        "slug": "minimum-value-to-get-positive-step-by-step-sum",
        "title": "Minimum Value to Get Positive Step by Step Sum",
        "number": 1413,
        "difficulty": "Easy"
      },
      {
        "slug": "range-sum-query-immutable",
        "title": "Range Sum Query - Immutable",
        "number": 303,
        "difficulty": "Easy"
      },
      {
        "slug": "find-pivot-index",
        "title": "Find Pivot Index",
        "number": 724,
        "difficulty": "Easy"
      },
      {
        "slug": "left-and-right-sum-differences",
        "title": "Left and Right Sum Differences",
        "number": 2574,
        "difficulty": "Easy"
      },
      {
        "slug": "number-of-ways-to-split-array",
        "title": "Number of Ways to Split Array",
        "number": 2270,
        "difficulty": "Medium"
      },
      {
        "slug": "product-of-array-except-self",
        "title": "Product of Array Except Self",
        "number": 238,
        "difficulty": "Medium"
      },
      {
        "slug": "subarray-sum-equals-k",
        "title": "Subarray Sum Equals K",
        "number": 560,
        "difficulty": "Medium"
      },
      {
        "slug": "binary-subarrays-with-sum",
        "title": "Binary Subarrays With Sum",
        "number": 930,
        "difficulty": "Medium"
      },
      {
        "slug": "count-number-of-nice-subarrays",
        "title": "Count Number of Nice Subarrays",
        "number": 1248,
        "difficulty": "Medium"
      },
      {
        "slug": "contiguous-array",
        "title": "Contiguous Array",
        "number": 525,
        "difficulty": "Medium"
      },
      {
        "slug": "subarray-sums-divisible-by-k",
        "title": "Subarray Sums Divisible by K",
        "number": 974,
        "difficulty": "Medium"
      },
      {
        "slug": "continuous-subarray-sum",
        "title": "Continuous Subarray Sum",
        "number": 523,
        "difficulty": "Medium"
      },
      {
        "slug": "range-sum-query-2d-immutable",
        "title": "Range Sum Query 2D - Immutable",
        "number": 304,
        "difficulty": "Medium"
      },
      {
        "slug": "matrix-block-sum",
        "title": "Matrix Block Sum",
        "number": 1314,
        "difficulty": "Medium"
      },
      {
        "slug": "corporate-flight-bookings",
        "title": "Corporate Flight Bookings",
        "number": 1109,
        "difficulty": "Medium"
      },
      {
        "slug": "car-pooling",
        "title": "Car Pooling",
        "number": 1094,
        "difficulty": "Medium"
      },
      {
        "slug": "shifting-letters-ii",
        "title": "Shifting Letters II",
        "number": 2381,
        "difficulty": "Medium"
      },
      {
        "slug": "zero-array-transformation-i",
        "title": "Zero Array Transformation I",
        "number": 3355,
        "difficulty": "Medium"
      },
      {
        "slug": "running-sum-of-1d-array",
        "title": "Running Sum of 1d Array",
        "number": 1480,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 4,
    "name": "Sliding Windows",
    "questions": [
      {
        "slug": "minimum-recolors-to-get-k-consecutive-black-blocks",
        "title": "Minimum Recolors to Get K Consecutive Black Blocks",
        "number": 2379,
        "difficulty": "Easy"
      },
      {
        "slug": "find-the-k-beauty-of-a-number",
        "title": "Find the K-Beauty of a Number",
        "number": 2269,
        "difficulty": "Easy"
      },
      {
        "slug": "maximum-number-of-vowels-in-a-substring-of-given-length",
        "title": "Maximum Number of Vowels in a Substring of Given Length",
        "number": 1456,
        "difficulty": "Medium"
      },
      {
        "slug": "grumpy-bookstore-owner",
        "title": "Grumpy Bookstore Owner",
        "number": 1052,
        "difficulty": "Medium"
      },
      {
        "slug": "find-all-anagrams-in-a-string",
        "title": "Find All Anagrams in a String",
        "number": 438,
        "difficulty": "Medium"
      },
      {
        "slug": "permutation-in-string",
        "title": "Permutation in String",
        "number": 567,
        "difficulty": "Medium"
      },
      {
        "slug": "repeated-dna-sequences",
        "title": "Repeated DNA Sequences",
        "number": 187,
        "difficulty": "Medium"
      },
      {
        "slug": "contains-duplicate-ii",
        "title": "Contains Duplicate II",
        "number": 219,
        "difficulty": "Easy"
      },
      {
        "slug": "minimum-size-subarray-sum",
        "title": "Minimum Size Subarray Sum",
        "number": 209,
        "difficulty": "Medium"
      },
      {
        "slug": "longest-substring-without-repeating-characters",
        "title": "Longest Substring Without Repeating Characters",
        "number": 3,
        "difficulty": "Medium"
      },
      {
        "slug": "fruit-into-baskets",
        "title": "Fruit Into Baskets",
        "number": 904,
        "difficulty": "Medium"
      },
      {
        "slug": "max-consecutive-ones-iii",
        "title": "Max Consecutive Ones III",
        "number": 1004,
        "difficulty": "Medium"
      },
      {
        "slug": "get-equal-substrings-within-budget",
        "title": "Get Equal Substrings Within Budget",
        "number": 1208,
        "difficulty": "Medium"
      },
      {
        "slug": "maximum-erasure-value",
        "title": "Maximum Erasure Value",
        "number": 1695,
        "difficulty": "Medium"
      },
      {
        "slug": "number-of-substrings-containing-all-three-characters",
        "title": "Number of Substrings Containing All Three Characters",
        "number": 1358,
        "difficulty": "Medium"
      },
      {
        "slug": "subarray-product-less-than-k",
        "title": "Subarray Product Less Than K",
        "number": 713,
        "difficulty": "Medium"
      },
      {
        "slug": "maximum-points-you-can-obtain-from-cards",
        "title": "Maximum Points You Can Obtain from Cards",
        "number": 1423,
        "difficulty": "Medium"
      },
      {
        "slug": "minimum-operations-to-reduce-x-to-zero",
        "title": "Minimum Operations to Reduce X to Zero",
        "number": 1658,
        "difficulty": "Medium"
      },
      {
        "slug": "minimum-swaps-to-group-all-1s-together-ii",
        "title": "Minimum Swaps to Group All 1's Together II",
        "number": 2134,
        "difficulty": "Medium"
      },
      {
        "slug": "maximum-average-subarray-i",
        "title": "Maximum Average Subarray I",
        "number": 643,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 5,
    "name": "Binary Search",
    "questions": [
      {
        "slug": "search-insert-position",
        "title": "Search Insert Position",
        "number": 35,
        "difficulty": "Easy"
      },
      {
        "slug": "first-bad-version",
        "title": "First Bad Version",
        "number": 278,
        "difficulty": "Easy"
      },
      {
        "slug": "find-first-and-last-position-of-element-in-sorted-array",
        "title": "Find First and Last Position of Element in Sorted Array",
        "number": 34,
        "difficulty": "Medium"
      },
      {
        "slug": "search-a-2d-matrix",
        "title": "Search a 2D Matrix",
        "number": 74,
        "difficulty": "Medium"
      },
      {
        "slug": "successful-pairs-of-spells-and-potions",
        "title": "Successful Pairs of Spells and Potions",
        "number": 2300,
        "difficulty": "Medium"
      },
      {
        "slug": "find-right-interval",
        "title": "Find Right Interval",
        "number": 436,
        "difficulty": "Medium"
      },
      {
        "slug": "find-peak-element",
        "title": "Find Peak Element",
        "number": 162,
        "difficulty": "Medium"
      },
      {
        "slug": "peak-index-in-a-mountain-array",
        "title": "Peak Index in a Mountain Array",
        "number": 852,
        "difficulty": "Medium"
      },
      {
        "slug": "find-minimum-in-rotated-sorted-array",
        "title": "Find Minimum in Rotated Sorted Array",
        "number": 153,
        "difficulty": "Medium"
      },
      {
        "slug": "search-in-rotated-sorted-array",
        "title": "Search in Rotated Sorted Array",
        "number": 33,
        "difficulty": "Medium"
      },
      {
        "slug": "sqrtx",
        "title": "Sqrt(x)",
        "number": 69,
        "difficulty": "Easy"
      },
      {
        "slug": "koko-eating-bananas",
        "title": "Koko Eating Bananas",
        "number": 875,
        "difficulty": "Medium"
      },
      {
        "slug": "capacity-to-ship-packages-within-d-days",
        "title": "Capacity To Ship Packages Within D Days",
        "number": 1011,
        "difficulty": "Medium"
      },
      {
        "slug": "find-the-smallest-divisor-given-a-threshold",
        "title": "Find the Smallest Divisor Given a Threshold",
        "number": 1283,
        "difficulty": "Medium"
      },
      {
        "slug": "minimum-number-of-days-to-make-m-bouquets",
        "title": "Minimum Number of Days to Make m Bouquets",
        "number": 1482,
        "difficulty": "Medium"
      },
      {
        "slug": "maximum-candies-allocated-to-k-children",
        "title": "Maximum Candies Allocated to K Children",
        "number": 2226,
        "difficulty": "Medium"
      },
      {
        "slug": "minimum-time-to-complete-trips",
        "title": "Minimum Time to Complete Trips",
        "number": 2187,
        "difficulty": "Medium"
      },
      {
        "slug": "minimum-time-to-repair-cars",
        "title": "Minimum Time to Repair Cars",
        "number": 2594,
        "difficulty": "Medium"
      },
      {
        "slug": "magnetic-force-between-two-balls",
        "title": "Magnetic Force Between Two Balls",
        "number": 1552,
        "difficulty": "Medium"
      },
      {
        "slug": "binary-search",
        "title": "Binary Search",
        "number": 704,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 6,
    "name": "Recursion",
    "questions": [
      {
        "slug": "longest-nice-substring",
        "title": "Longest Nice Substring",
        "number": 1763,
        "difficulty": "Easy"
      },
      {
        "slug": "k-th-symbol-in-grammar",
        "title": "K-th Symbol in Grammar",
        "number": 779,
        "difficulty": "Medium"
      },
      {
        "slug": "power-of-two",
        "title": "Power of Two",
        "number": 231,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 7,
    "name": "Linked Lists",
    "questions": [
      {
        "slug": "middle-of-the-linked-list",
        "title": "Middle of the Linked List",
        "number": 876,
        "difficulty": "Easy"
      },
      {
        "slug": "merge-two-sorted-lists",
        "title": "Merge Two Sorted Lists",
        "number": 21,
        "difficulty": "Easy"
      },
      {
        "slug": "linked-list-cycle",
        "title": "Linked List Cycle",
        "number": 141,
        "difficulty": "Easy"
      },
      {
        "slug": "intersection-of-two-linked-lists",
        "title": "Intersection of Two Linked Lists",
        "number": 160,
        "difficulty": "Easy"
      },
      {
        "slug": "palindrome-linked-list",
        "title": "Palindrome Linked List",
        "number": 234,
        "difficulty": "Easy"
      },
      {
        "slug": "swap-nodes-in-pairs",
        "title": "Swap Nodes in Pairs",
        "number": 24,
        "difficulty": "Medium"
      },
      {
        "slug": "remove-nth-node-from-end-of-list",
        "title": "Remove Nth Node From End of List",
        "number": 19,
        "difficulty": "Medium"
      },
      {
        "slug": "rotate-list",
        "title": "Rotate List",
        "number": 61,
        "difficulty": "Medium"
      },
      {
        "slug": "delete-the-middle-node-of-a-linked-list",
        "title": "Delete the Middle Node of a Linked List",
        "number": 2095,
        "difficulty": "Medium"
      },
      {
        "slug": "linked-list-cycle-ii",
        "title": "Linked List Cycle II",
        "number": 142,
        "difficulty": "Medium"
      },
      {
        "slug": "partition-list",
        "title": "Partition List",
        "number": 86,
        "difficulty": "Medium"
      },
      {
        "slug": "odd-even-linked-list",
        "title": "Odd Even Linked List",
        "number": 328,
        "difficulty": "Medium"
      },
      {
        "slug": "add-two-numbers",
        "title": "Add Two Numbers",
        "number": 2,
        "difficulty": "Medium"
      },
      {
        "slug": "reverse-linked-list-ii",
        "title": "Reverse Linked List II",
        "number": 92,
        "difficulty": "Medium"
      },
      {
        "slug": "merge-in-between-linked-lists",
        "title": "Merge In Between Linked Lists",
        "number": 1669,
        "difficulty": "Medium"
      },
      {
        "slug": "reorder-list",
        "title": "Reorder List",
        "number": 143,
        "difficulty": "Medium"
      },
      {
        "slug": "sort-list",
        "title": "Sort List",
        "number": 148,
        "difficulty": "Medium"
      },
      {
        "slug": "copy-list-with-random-pointer",
        "title": "Copy List with Random Pointer",
        "number": 138,
        "difficulty": "Medium"
      },
      {
        "slug": "lru-cache",
        "title": "LRU Cache",
        "number": 146,
        "difficulty": "Medium"
      },
      {
        "slug": "reverse-linked-list",
        "title": "Reverse Linked List",
        "number": 206,
        "difficulty": "Easy"
      },
      {
        "slug": "baseball-game",
        "title": "Baseball Game",
        "number": 682,
        "difficulty": "Easy"
      }
    ]
  },
  {
    "set": 8,
    "name": "Stacks",
    "questions": [
      {
        "slug": "valid-parentheses",
        "title": "Valid Parentheses",
        "number": 20,
        "difficulty": "Easy"
      },
      {
        "slug": "evaluate-reverse-polish-notation",
        "title": "Evaluate Reverse Polish Notation",
        "number": 150,
        "difficulty": "Medium"
      },
      {
        "slug": "decode-string",
        "title": "Decode String",
        "number": 394,
        "difficulty": "Medium"
      },
      {
        "slug": "simplify-path",
        "title": "Simplify Path",
        "number": 71,
        "difficulty": "Medium"
      },
      {
        "slug": "add-two-numbers-ii",
        "title": "Add Two Numbers II",
        "number": 445,
        "difficulty": "Medium"
      },
      {
        "slug": "remove-all-adjacent-duplicates-in-string",
        "title": "Remove All Adjacent Duplicates In String",
        "number": 1047,
        "difficulty": "Easy"
      },
      {
        "slug": "asteroid-collision",
        "title": "Asteroid Collision",
        "number": 735,
        "difficulty": "Medium"
      },
      {
        "slug": "remove-all-adjacent-duplicates-in-string-ii",
        "title": "Remove All Adjacent Duplicates in String II",
        "number": 1209,
        "difficulty": "Medium"
      },
      {
        "slug": "min-stack",
        "title": "Min Stack",
        "number": 155,
        "difficulty": "Medium"
      },
      {
        "slug": "design-a-stack-with-increment-operation",
        "title": "Design a Stack With Increment Operation",
        "number": 1381,
        "difficulty": "Medium"
      },
      {
        "slug": "next-greater-element-i",
        "title": "Next Greater Element I",
        "number": 496,
        "difficulty": "Easy"
      },
      {
        "slug": "final-prices-with-a-special-discount-in-a-shop",
        "title": "Final Prices With a Special Discount in a Shop",
        "number": 1475,
        "difficulty": "Easy"
      },
      {
        "slug": "daily-temperatures",
        "title": "Daily Temperatures",
        "number": 739,
        "difficulty": "Medium"
      },
      {
        "slug": "online-stock-span",
        "title": "Online Stock Span",
        "number": 901,
        "difficulty": "Medium"
      },
      {
        "slug": "next-greater-element-ii",
        "title": "Next Greater Element II",
        "number": 503,
        "difficulty": "Medium"
      },
      {
        "slug": "next-greater-node-in-linked-list",
        "title": "Next Greater Node In Linked List",
        "number": 1019,
        "difficulty": "Medium"
      },
      {
        "slug": "remove-nodes-from-linked-list",
        "title": "Remove Nodes From Linked List",
        "number": 2487,
        "difficulty": "Medium"
      },
      {
        "slug": "largest-rectangle-in-histogram",
        "title": "Largest Rectangle in Histogram",
        "number": 84,
        "difficulty": "Hard"
      },
      {
        "slug": "sum-of-subarray-minimums",
        "title": "Sum of Subarray Minimums",
        "number": 907,
        "difficulty": "Medium"
      }
    ]
  },
  {
    "set": 9,
    "name": "Queues",
    "questions": [
      {
        "slug": "implement-stack-using-queues",
        "title": "Implement Stack using Queues",
        "number": 225,
        "difficulty": "Easy"
      },
      {
        "slug": "number-of-recent-calls",
        "title": "Number of Recent Calls",
        "number": 933,
        "difficulty": "Easy"
      },
      {
        "slug": "number-of-students-unable-to-eat-lunch",
        "title": "Number of Students Unable to Eat Lunch",
        "number": 1700,
        "difficulty": "Easy"
      },
      {
        "slug": "time-needed-to-buy-tickets",
        "title": "Time Needed to Buy Tickets",
        "number": 2073,
        "difficulty": "Easy"
      },
      {
        "slug": "design-circular-queue",
        "title": "Design Circular Queue",
        "number": 622,
        "difficulty": "Medium"
      },
      {
        "slug": "find-the-winner-of-the-circular-game",
        "title": "Find the Winner of the Circular Game",
        "number": 1823,
        "difficulty": "Medium"
      },
      {
        "slug": "find-the-winner-of-an-array-game",
        "title": "Find the Winner of an Array Game",
        "number": 1535,
        "difficulty": "Medium"
      },
      {
        "slug": "find-the-first-player-to-win-k-games-in-a-row",
        "title": "Find The First Player to win K Games in a Row",
        "number": 3175,
        "difficulty": "Medium"
      },
      {
        "slug": "dota2-senate",
        "title": "Dota2 Senate",
        "number": 649,
        "difficulty": "Medium"
      },
      {
        "slug": "implement-router",
        "title": "Implement Router",
        "number": 3508,
        "difficulty": "Medium"
      },
      {
        "slug": "faulty-keyboard",
        "title": "Faulty Keyboard",
        "number": 2810,
        "difficulty": "Easy"
      },
      {
        "slug": "design-circular-deque",
        "title": "Design Circular Deque",
        "number": 641,
        "difficulty": "Medium"
      },
      {
        "slug": "design-front-middle-back-queue",
        "title": "Design Front Middle Back Queue",
        "number": 1670,
        "difficulty": "Medium"
      },
      {
        "slug": "reveal-cards-in-increasing-order",
        "title": "Reveal Cards In Increasing Order",
        "number": 950,
        "difficulty": "Medium"
      },
      {
        "slug": "sliding-window-maximum",
        "title": "Sliding Window Maximum",
        "number": 239,
        "difficulty": "Hard"
      },
      {
        "slug": "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
        "title": "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
        "number": 1438,
        "difficulty": "Medium"
      },
      {
        "slug": "continuous-subarrays",
        "title": "Continuous Subarrays",
        "number": 2762,
        "difficulty": "Medium"
      },
      {
        "slug": "maximum-number-of-robots-within-budget",
        "title": "Maximum Number of Robots Within Budget",
        "number": 2398,
        "difficulty": "Hard"
      },
      {
        "slug": "max-value-of-equation",
        "title": "Max Value of Equation",
        "number": 1499,
        "difficulty": "Hard"
      }
    ]
  }
];

export const codeCatalystSlugs: ReadonlySet<string> = new Set(
  codeCatalystSets.flatMap((s) => s.questions.map((q) => q.slug))
);
