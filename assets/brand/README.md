# VizuCode brand assets

The mark is a pair of code brackets forming an eye, with a three-node graph as the
pupil — "seeing the code run". Brackets for the editor, the graph for the data
structure being traced, the eye for the visualization itself.

## Source of truth

The mark is **vector**, not raster. Two copies of the same geometry:

- [`public/favicon.svg`](../../public/favicon.svg) — standalone, self-theming via
  `prefers-color-scheme`.
- [`src/components/Logo.tsx`](../../src/components/Logo.tsx) — in-app, brackets on
  `currentColor` and nodes/edges on `--accent` / `--accent-2`, so it follows the
  theme toggle rather than the OS setting.

Change the geometry in both, or the header and the tab icon drift apart.

## Colors

Straight from the `styles.css` design tokens.

| Role | Light | Dark |
| --- | --- | --- |
| Brackets | `#1b232c` (`--ink`) | `#e7ecf1` |
| Nodes | `#b96f27` (`--accent`) | `#e0a24f` |
| Graph edges | `#2f7d70` (`--accent-2`) | `#57c2ae` |
| Background | `#eef1f5` (`--bg`) | `#10151c` |

## Exports

Rendered from the vector above — regenerate rather than hand-editing.

- `logo-mark-light.png` / `logo-mark-dark.png` — 1024×1024 square mark.
- `logo-lockup-light.png` / `logo-lockup-dark.png` — 1600×440 horizontal lockup
  with the wordmark. "Vizu" in ink, "Code" in accent, matching the site header.
- `../../public/apple-touch-icon.png` — 180×180, opaque background (iOS ignores
  transparency and would composite it onto black).

`concept-*.png` are the four rejected first-round directions, kept for reference.

## Clear space

Keep at least the width of one bracket stroke clear on every side. The mark holds
up down to 16px; below that the graph nodes start to merge, so use the wordmark
alone instead.
