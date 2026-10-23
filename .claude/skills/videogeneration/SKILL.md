---
name: videogeneration
description: Generate an animated teaching reel (vertical 1080x1920 MP4, ~45-60s) that explains a DSA / LeetCode problem to students in the VizuCode brand style — hook, problem statement, brute force, key idea, animated step-by-step walkthrough, code with synced line highlights, complexity, and a VizuCode CTA — with an Indian-English text-to-speech voiceover, word-chunk captions, synthesized music bed and sound effects. Everything is rendered from scratch in Python (PIL + numpy) and encoded with ffmpeg; no source footage needed. Use when the user asks to "make a reel/short/video teaching <problem>", "make a video explaining <algorithm>", "make an Instagram reel for <question>", or "/videogeneration <problem>". Not for editing existing footage (use joke-clips / shorts-fx / subtitle for that).
user-invocable: true
---

# videogeneration — animated DSA teaching reels

Pipeline: **script → voiceover (TTS) → scene code → stills check → full render → deliver.**

## Where it runs (set this up first)

`K` = this skill's folder. It lives in the VizuCode repo at `.claude/skills/videogeneration` (and may also
exist at `~/.claude/skills/videogeneration` on the Mac). Always run:

    export K=<absolute path of this skill folder>; export VIDEOGEN_K=$K   # reel.py finds the engine via VIDEOGEN_K

- **Mac (local):** everything is installed. Voiceover uses macOS `say` (voices Aman / Tara / Rishi).
- **Linux / cloud session (claude.ai/code):** run `bash $K/scripts/setup_cloud.sh` once (installs ffmpeg,
  pillow, numpy, edge-tts). With no `say` on the machine, voiceover automatically uses **edge-tts** Indian-English
  neural voices instead (Aman/Rishi → `en-IN-PrabhatNeural`, Tara → `en-IN-NeerjaNeural`), spoken 1.4× faster than
  natural (`EDGE_SPEED` in `scripts/tts.py`) — the user's preferred pace; reels come out ~30% shorter than on the Mac. edge-tts needs
  network access to `speech.platform.bing.com`; if it fails with a connection error, tell the user to set the
  cloud environment's network access to **Full** (or allow that domain) and stop. Use a scratch dir under
  `/tmp` if no scratchpad is given.

The shared engine is `scripts/engine.py` (background, glow, captions, music/SFX, encode, plus built-in
`code` and `outro` scenes and widget helpers). Each reel is one small `reel.py` that imports it and only
defines its timeline + 5 scenes (hook, problem, brute, idea, walk). Start from the closest example:

| Example (`examples/<slug>/reel.py` + `lines.txt`) | Data structure / widgets shown |
|---|---|
| `valid-parentheses` | stack: char row + U-shaped stack, push/pop fly animations, type-coloured brackets |
| `climbing-stairs` | DP: staircase + hopping ball, recursion tree with repeated calls, DP table with arcs, O(2ⁿ) stamp |
| `max-depth-binary-tree` | tree: `node()` circles + edges, return-value badges, post-order bottom-up |
| `number-of-islands` | graph/grid: scan cursor, flood-fill colouring per island, counter |
| `contains-duplicate` | array + hash set (`lines.txt` only; its full script is the older standalone `scripts/render_template.py`) |
| `two-sum` (FX) | array + hash map panel with key→index chips, values fly into the map |
| `valid-anagram` (FX) | string rows + letter-count bar chart going up then down to zero |
| `daily-temperatures` (FX) | monotonic stack, temperature-coloured cells, pop→answer fly, gap arcs |
| `queue-using-stacks` (FX) | two side-by-side stacks (in/out), pour animation, returned-values row |
| `invert-tree` (FX) | tree with animated mirror flips (`positions(swaps)`), empty-child ∅ circles |
| `container-water` (FX) | bar walls + animated water fill, L/R pointers, best counter |
| `longest-substring` (FX) | sliding-window box, l/r pointers, set chips, repeat = coral |
| `binary-search` (FX) | lo/hi/mid pointers, range bracket, dimmed discarded halves, halving hook |
| `reverse-list` (FX) | linked-list nodes with flipping arrows, prev/curr/next tags, null boxes |

## Workflow

1. **Pick the problem + example.** If the user's project has a visualizer for it (e.g. VizuCode's
   `src/problems/*.ts` — search for the slug/title), read it: reuse its technique line, code (C++ default,
   Java if asked), brute-force variant, complexity and default input. Choose a small example array
   (5–7 values) where the interesting moment happens near the end.

2. **Set up a work dir** in the scratchpad: `W=<scratchpad>/reel-<slug>; mkdir -p $W/vo $W/stills`
   then copy the closest example: `cp $K/examples/<closest>/reel.py $W/reel.py`. Several reels → one work
   dir each; they can share nothing but the engine.

3. **Write `$W/vo/lines.txt`** — one `key|spoken text` per line. Standard keys, in order:
   `hook` (question that stops the scroll + "LeetCode N, <title>"), `problem`, `brute`, `idea`,
   `w0..wN` (one short line per walkthrough step — keep each 1–3 s), `code`, `outro`
   (complexity + "watch every step live on vizu code dot site, and follow at vizu code 26 for more").
   Spell the brand as **"vizu code"** in VO so TTS says it right — the caption chunker maps it back to
   "vizucode"/"vizucode.site". Write numbers the way they should be spoken. Keep the whole VO ≈ 40–50 s.

4. **Record the VO:** `bash $K/scripts/make_vo.sh $W [voice] [rate]`. Default voice **Aman** (Indian-English,
   most natural) at rate 165 (slower, student-friendly; 180 = brisk). Alternatives: `Tara` (Indian-English female),
   `Rishi` (older Indian-English male, more robotic). Durations print per clip; scene lengths derive from them.
   - **Never record VO while a render is running** — `say` under heavy CPU load produces garbled, non-English
     speech (it happened: "Here Chloe's thermal, postman..." in place of the hook).
   - **Verify every clip** (always on the Mac; in the cloud only if `setup_cloud.sh --whisper` was run — edge-tts
     doesn't garble, so there it is optional): `/opt/miniconda3/bin/python $K/scripts/check_vo.py $W Aman 165` — Whisper
     transcribes each clip, compares with lines.txt (numbers→words, letter-level too) and re-records bad clips.
     A clip that stays "STILL BAD" after 5 tries is usually just an accent mishearing (e.g. "colder too") —
     reword that line and re-run. Do not render before every clip is OK.

5. **Adapt `$W/reel.py`:**
   - `E.CFG.update(...)`: `HEADER_TAG` ("Topic · Difficulty"), `CODE` (C++ lines, ≤ ~17 lines, ≤ ~52 chars —
     font/line height auto-fit), `CODE_TITLE`, `CODE_MARKS` = [(fraction of the `code` VO, [line idx])]
     (fraction ≈ character position of that phrase in the VO line), `FN` (function names to colour),
     `COMPLEXITY`, `CAPTION_GOLD` (words to colour gold in captions).
   - `vo_at(key, phrase)` → seconds into a VO clip where that phrase is spoken (by character position) — use it
     for every event time instead of hand-tuned numbers: `at = WSTEPS[k][0] + 0.1 + vo_at('w2', 'Pop')`.
   - **timeline**: `add_vo(0.3,'hook'); scene('hook', ...)`, then `vo_scene(name, key, pad)` for each
     scene (returns its start, use it to place `sfx`), and `steps_scene('walk', ['w0',...])` which returns
     `(start, steps)`; schedule per-step events as offsets `u` within each step, matched to where the VO
     says them (e.g. `MATCH_AT`, `BADGE_AT` dicts in the examples). SFX kinds: pop tick whoosh buzz ding win.
   - **scenes** `fn(L, G, dl, dg, lt, dur[, steps])` then `E.SCENES.update(...)`; `code`/`outro` are built in.
     Helpers: `cell()` (states idle/active/done/found/good/dim or custom `colors=`, `h=` for non-square,
     `glow=`), `node()`, `label_pill()`, `pill()`, `grad_pill()`, `result_badge()`, `burst()`, `gtext()`,
     `text()`, `rich()`, `arrow_up()`, `arrow_line()`, `check_mark()`, `cross_mark()`, `section_title()`,
     `big_o_stamp()` (use `sup='n'` for exponents), `row_x()`, `step_at()`, `tint()`, easing
     `prog/ease_out/back/ease_in_out/pop_in`.
   - Draw translucent fills (windows, water, highlight boxes) **before** the cells/bars they sit behind —
     drawing a semi-transparent fill on top erases what is under it on the RGBA layer.
   - Don't hide a moving element by painting a BG-coloured box over its static copy (the FX grid shows the
     patch) — skip drawing the static copy instead.
   - Fonts: Poppins lacks **→ ✓ ∅ ⁿ ↔ ⇄**; JetBrains Mono lacks **⇄** (use ↔) — use `mono`/`monor` (JetBrains Mono has → ✓ ∅) or `big_o_stamp(sup=)`.
   - Keep content in y 330–1420; the hook's title must be fully visible at frame 0.

6. **Check stills before the full render** (fast, ~10 s):
   `cd $W && python3 reel.py $W/stills stills 3,10,16,22,30,38,45 && cd stills && ffmpeg -loglevel error -y -pattern_type glob -i 'still_*.png' -vf "scale=360:-1,tile=4x2" -frames:v 1 contact.png`
   then Read `contact.png`. Look for: missing-glyph boxes, text overlapping, glow washing out text,
   content in the bottom Reels-UI zone, highlights out of sync. Also check frame 0 — it must already show
   the full hook title (it is the scroll-stopper / thumbnail).

7. **Render:** `cd $W && python3 reel.py full.mp4` (multiprocess, ~3-5 min for 80 s with FX).
   FX reels (`FX=True`) at CRF 18 come out ~25 MB for 85 s. **Size cap (default ≤ 10 MB):**
   `bash $K/scripts/fit_size.sh $W/full.mp4 <final.mp4> 9.5` — two-pass x264 to the target size, AAC 128k.
   Target length 1–2 min (VO ≈ 65–100 s at rate 165). Verify with `ffprobe` (1080x1920, h264 + aac) and
   `ffmpeg -i <out> -af volumedetect -f null -` (max ≈ -1 dB, mean ≈ -18 dB).

8. **Deliver:** on the Mac, save to `~/Downloads/<slug>-reel.mp4` and, inside the VizuCode repo, also keep
   a copy in `marketing/`. In a cloud session, save to `marketing/<slug>-reel.mp4` (≤ 10 MB) and commit it
   on the session's branch so the user can download it from the PR / branch. Tell the user the length, the scene outline, and the voice used,
   and offer: different voice (Aman/Tara), Java code, different example, shorter cut, or syncing to
   their own recorded voiceover (replace the `vo/<key>.wav` files and re-render).

## Style rules (VizuCode brand)

- Dark navy background with graph-paper grid, orange→coral gradient (`G1`→`G2`) for emphasis, teal for
  "good/seen/true", coral for "found/false", gold for the current value. Poppins Black/ExtraBold
  headings, JetBrains Mono for code, indices and labels.
- Persistent header (VizuCode wordmark + topic pill) at top; captions at y≈1480, max ~3 words per chunk,
  `true`=teal, `false`=coral, numbers/key terms=gold.
- Teaching arc: hook question → task with true/false examples → brute force + why it's slow (Big-O
  stamp) → the one key idea → animated walkthrough with an explicit question per step ("Is 7 in seen?")
  → code → complexity → CTA (vizucode.site + Follow @vizucode26).
- Music bed is quiet and ducks under the voice; SFX mark every state change.
