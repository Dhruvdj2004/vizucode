# VizuCode — LeetCode Visualizer

Interactive, step-by-step visualizations of optimal LeetCode solutions, synced with C++/Java source code. Full spec in `PROJECT_PROMPT.txt`.

## Run

```sh
npm install
npm run dev      # frontend → http://localhost:5173
npm run server   # API      → http://localhost:4000  (separate terminal)
npm run build    # typecheck (src + server) + production build to dist/
```

The frontend proxies `/api/*` to the Express server (see `vite.config.ts`). If the API is down, the frontend silently falls back to its bundled local data — nothing breaks.

## API (Phase 2)

| Route | Description |
|---|---|
| `GET /api/health` | liveness + counts |
| `GET /api/categories` | categories with question/visualizer counts |
| `GET /api/questions` | all 158 questions (catalog + `hasVisualizer`) |
| `GET /api/questions/:slug` | one question's full static content (code, inputs, note, complexity) |
| `POST /api/questions/:slug/trace` | body `{ inputs: {…} }` → server-generated step trace (422 on invalid input) |
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` | JWT auth |
| `GET /api/progress` | signed-in user's solved slugs (JWT required) |
| `PUT /api/progress/:slug` | body `{ solved: bool }` — tick/untick a question (JWT required) |

The server (`server/index.ts`) imports the same data modules as the frontend, so there is one source of truth. In Phase 3 its reads move to a database without changing any route.

## Security

- **Deploy `dist/` only** (`npm run build`). The dev server (`npm run dev`) serves original TS source in DevTools → Sources — that is dev-only; the production build ships minified bundles with **no source maps** (`build.sourcemap: false`).
- API hardening: `X-Powered-By` removed; `nosniff` / `X-Frame-Options: DENY` / `Referrer-Policy` headers; JSON bodies capped at 16 kB; per-input length caps; per-IP rate limits (300 reads / 60 traces per minute); errors never leak stack traces.
- **Set `ALLOWED_ORIGIN=https://your-frontend-domain` in production** to lock CORS to your site (unset = permissive, for local dev).
- `.gitignore` keeps `node_modules/`, build output, and `.env` out of the repo.
- What cannot be hidden: solutions/notes shown in the UI are public by nature, and minified JS is always inspectable — true for every website.

## Status — Phase 1 complete (frontend, local data)

- **All 158 questions** (from `DSA_Interview_Questions.xlsx` → `src/data/catalog.ts`) have working interactive visualizers, organized in 16 categories.
- Shared visualizer shell: input panel with validation, transport controls (reset / step / play / scrub / speed), plain-English trace line with colored value chips, C++/Java code panel with tag-synced line highlighting (two-color: primary + caller/callee), result readout, "why this works" note, complexity footer.
- 10 visualization templates (`src/components/widgets/`): binary-search (array + answer-domain modes), array (boxes/bars, pointers, windows), tree/graph node-link SVG (call-stack & queue panels, directed edges), matrix/DP grid, stack/queue columns, linked-list chains, heap (array + tree views), bit rows, interval timelines.
- Traces are generated client-side by running each algorithm on the user's input (`run(values)` per problem), so custom examples work everywhere.
- Light/dark themes per the design-token spec (toggle in header, persisted).
- Verified: `npm run build` clean; smoke test runs all 158 trace generators on default inputs — 158 OK, every step tag resolves in both C++ and Java listings.

## Adding a question

Create a `ProblemDef` (see `src/lib/types.ts`) in `src/problems/…` and register it in `src/problems/index.ts`. The def bundles: metadata, tagged C++/Java code lines (`L(text, ...tags)`), a `run(inputs)` step-trace generator, the closing insight note, and complexity. Steps reference code lines by tag, so the code panel stays in sync automatically. The home page enables the Visualize button for any catalog slug present in the registry.

## Aptitude & OA practice (`#/aptitude`)

Timed placement-style tests: 20 questions in 20 minutes, 8 easy / 6 medium / 6 hard, drawn at random from a curated bank in `src/aptitude/bank/` (quant, logical, analytical, verbal, core CS). Modes: full test with a topic picker, topic practice, mixed, Core CS OA and company-style OA; random or smart selection (smart favors unseen questions, past mistakes and weak topics). Results include difficulty, section and topic breakdowns, a full review with explanations, recommendations, and per-topic coverage.

- `src/aptitude/engine.ts` generates tests, scores them and computes the dashboard and coverage stats. It is pure, and the server reuses it to re-score attempts.
- `src/aptitude/store.ts` keeps the in-progress test in localStorage, so a refresh never resets the timer, and syncs finished attempts to `/api/aptitude/attempts` (`server/aptitude.ts`, table `aptitude_attempts`).
- **Adding questions:** append to a file in `src/aptitude/bank/` with a new, never-reused id, then run `node scripts/validate-aptitude.mjs`. It checks structure, duplicates, whether the explanation agrees with the answer key, and each `calc`/`check` recomputation, and it exercises the generator.
- `node scripts/verify-aptitude.mjs --screenshot` runs the whole flow in headless Chrome against a database-free API on :4100.

## Remaining phases

2. Backend API (serve catalog/problems) · 3. Database (persist traces) · 4. Scale content to all 158 · 5. Deploy.
