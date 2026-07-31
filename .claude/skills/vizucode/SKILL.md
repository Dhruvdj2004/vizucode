---
name: vizucode
description: Add a new LeetCode visualizer (ProblemDef) to the VizuCode project, following the established pattern of tagged C++/Java code, a step-trace run() generator, and a widget. Use when the user asks to "add a visualizer", "add a question/problem", "wire up problem N", or wants to scale content toward all catalog questions (Phase 4). Also covers adding a brand-new widget type when none of the 10 existing ones fit, verifying a visualizer headlessly, and publishing new content to the live Supabase DB.
user-invocable: true
---

# vizucode — add a visualizer to VizuCode

VizuCode pairs each LeetCode question with an interactive `ProblemDef`: tagged
C++/Java source, a client-side `run(inputs)` step-trace generator, and one of
10 reusable widgets. Steps reference code lines by tag, so the code panel
highlight stays in sync automatically — no manual line-number bookkeeping.

When adding a batch of many problems (10s–100s), do steps 1–4 per problem,
then run step 5 (publish) once at the end of the batch, not after every
single problem — see the note there.

## 1. Find (or add) the catalog entry

- Look up the slug, category, and difficulty in `src/data/catalog.ts`
  (originally generated from `DSA_Interview_Questions.xlsx`). The `slug`
  there **must exactly match** the `slug` you give the new `ProblemDef` —
  that's what turns on the "Visualize" button on the home page and API.
- **If the question isn't in the catalog yet** (its LeetCode number ≠ the
  catalog's own sequential `id` field — those are unrelated; don't assume a
  match), append a new entry at the **end** of the `catalog` array with
  `id` = current max + 1. Never renumber or reorder existing entries: `id`
  is rendered on-site as that question's `#N` and is also its primary key
  in Postgres (`schema.sql`), so reusing/shifting one would relabel or
  collide with an existing question.

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
category/topic, e.g. `dp2.ts`, `graphs1.ts`, `linkedList1.ts`) or start a new
file for a new category, matching the `ProblemDef` interface in
`src/lib/types.ts`:

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
wiring step beyond the catalog entry from step 1.

Sanity-check the algorithm itself against LeetCode's known example
input/output before wiring up the trace (a plain `node -e '...'` scratch
snippet of just the core loop is enough) — it's much faster to catch a logic
bug there than by reading `state` objects.

## 4. Verify

```sh
npm run build   # tsc -b (typechecks src + server) + vite build
```

Then run the headless check — it spins up its own isolated dev server (port
5199, won't collide with one you already have open) and a headless Chrome via
the DevTools protocol (no Playwright/Puppeteer dependency needed), injects a
fake signed-in Pro session so login and the free-tier paywall don't block it,
steps through **every** step for both C++ and Java, and fails on a console
error, a stuck "Loading visualizer…", or a step that never renders:

```sh
node scripts/verify-visualizer.mjs <slug>               # fast, no screenshots
node scripts/verify-visualizer.mjs <slug> --screenshot   # also saves PNGs to
                                                          # .verify-screenshots/<slug>/
```

Exit code is 0/1, so for a batch you can loop it over many slugs and collect
failures instead of clicking through each one by hand:

```sh
for s in slug-one slug-two slug-three; do
  node scripts/verify-visualizer.mjs "$s" || echo "FAILED: $s"
done
```

Requires macOS Chrome at the default install path; override with
`CHROME_BIN=/path/to/chrome` if it's elsewhere. This only exercises the
frontend (local `problemRegistry` fallback) — it doesn't touch the DB or
`npm run server`, so it works even before publishing (step 5).

## 5. Publish to the live database (do this once per batch, not per problem)

The frontend works immediately off the local `problemRegistry` fallback (see
`src/lib/api.ts`), so steps 1–4 alone are enough to develop and verify
locally. To make new questions show up through the real API / on
`vizucode`'s deployed site, the Postgres catalog needs to be resynced:

```sh
npm run db:seed
```

This is safe to run even against the live Supabase DB: `schema.sql`
deliberately gives `user_progress` **no** foreign key to `questions`, exactly
so this seeder's `truncate questions cascade` can never touch real users'
accounts, sessions, or solved-progress rows — only the `questions` and
`problem_content` tables get rebuilt from `src/data/catalog.ts` +
`problemRegistry`.

If you have a local API server running (`npm run server`, port 4000 by
default), it caches `/api/questions` results in memory per process
(`server/app.ts`) — restart it after seeding or the list endpoint will keep
serving the pre-seed count even though individual `/api/questions/:slug`
lookups already reflect the new data:

```sh
lsof -ti:4000 -sTCP:LISTEN | xargs -r kill
npm run server &
```

A separate deployed backend (Vercel/Netlify) uses its own `DATABASE_URL` —
if one exists, `db:seed` needs to be run with that environment's `.env` too.

## Editing this skill

This file is plain Markdown at
`.claude/skills/vizucode/SKILL.md` in the repo — edit it directly (e.g. to
record new widget conventions, or once the registration/publishing flow
changes again) and the updated instructions apply on the next invocation.
