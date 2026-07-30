---
name: vizucode
description: Add a new LeetCode visualizer (ProblemDef) to the VizuCode project, following the established pattern of tagged C++/Java code, a step-trace run() generator, and a widget. Use when the user asks to "add a visualizer", "add a question/problem", "wire up problem N", or wants to scale content toward all 158 catalog questions (Phase 4). Also covers adding a brand-new widget type when none of the 10 existing ones fit.
user-invocable: true
---

# vizucode — add a visualizer to VizuCode

VizuCode pairs each LeetCode question with an interactive `ProblemDef`: tagged
C++/Java source, a client-side `run(inputs)` step-trace generator, and one of
10 reusable widgets. Steps reference code lines by tag, so the code panel
highlight stays in sync automatically — no manual line-number bookkeeping.

## 1. Find the target question

- Look up the slug, category, and difficulty in `src/data/catalog.ts` (generated
  from `DSA_Interview_Questions.xlsx` — never hand-edit this file).
- The `slug` there **must exactly match** the `slug` you give the new `ProblemDef` —
  that's what turns on the "Visualize" button on the home page. No other file
  needs updating to "register" the question in the catalog sense.

## 2. Pick (or extend) a widget

Existing `WidgetKind`s (`src/lib/types.ts`): `binary-search`, `array`, `tree`
(also used for graphs), `matrix`, `stack` (also queues), `list` (linked-list
chains), `heap`, `bits`, `intervals`. Each has a matching `*State` interface in
the same file and a component in `src/components/widgets/`.

- Read 2–3 existing problems using the same widget in `src/problems/` (e.g.
  `mathBits.ts` for `bits`/`array`, `graphs1.ts`/`graphs2.ts` for `tree` as
  graph) to copy the state-shape conventions before writing a new one.
- Only add a genuinely new widget if none of the 10 fit the algorithm's shape
  — that also means a new component file and a case in `VisualizerPage.tsx`.

## 3. Write the ProblemDef

Put it in the most fitting existing file under `src/problems/` (grouped by
category/topic, e.g. `dp2.ts`, `graphs1.ts`) or start a new file for a new
category, matching the `ProblemDef` interface in `src/lib/types.ts`:

- **Code lines**: build with `L(text, ...tags)` from `src/lib/trace.ts` — a
  line with no tag never highlights. Tag every line that a step should light
  up; reuse the same tag across a loop body's lines that all activate together.
- **`run(values)`**: parse+validate inputs with the helpers in `src/lib/parse.ts`
  (`parseInt1`, `parseIntArray`, etc.) and return `{ error: string }` on bad
  input rather than throwing. Then run the real algorithm, pushing one `Step`
  per meaningful state change: `{ tag, tag2?, trace, state }`.
- **`trace`**: an array of plain strings mixed with colored tokens from
  `src/lib/trace.ts` — `A()` = active/being tested (amber), `B()` = just
  confirmed (teal), `C()` = final result, `F()` = rejected/skipped (dim).
  Write it as a plain-English sentence a beginner can follow, not pseudocode.
- **`state`**: the widget's `*State` shape for that instant — this is what
  actually renders, so keep it consistent with the `trace` wording (e.g. don't
  say "swap" in the trace without a visible mark change in `state`).
- Fill `technique`, `note` ("why this works" closing insight), and
  `complexity` — these are the other primary teaching surface besides the trace.

Export the new `ProblemDef` (or array of them) from the file, then import and
spread it into the `all` array in `src/problems/index.ts` — that's the only
wiring step (no catalog edit, no route change).

## 4. Verify

```sh
npm run build   # tsc -b (typechecks src + server) + vite build
```

There's no separate committed smoke-test script — `npm run build` is the
mechanical check (types + bundling). Then run `npm run dev`, open the new
slug's page, and click through all steps at least once for both C++ and Java
to confirm every tag resolves and the widget renders sensibly at each step,
including the first and last (often the easiest to get wrong).

## Editing this skill

This file is plain Markdown at
`.claude/skills/vizucode/SKILL.md` in the repo — edit it directly (e.g. to
record new widget conventions, or once Phase 2/3 change how problems are
registered) and the updated instructions apply on the next invocation.
