// Generates one "explain the problem at a glance" cartoon image per LeetCode
// visualizer problem, using the Gemini image-generation API.
//
// Usage:
//   node --env-file=.env scripts/generate-problem-images.mjs                # all problems
//   node --env-file=.env scripts/generate-problem-images.mjs n-queens       # just one slug
//   node --env-file=.env scripts/generate-problem-images.mjs --dry-run      # print prompts only, no API calls
//
// Output: assets/problem-images/<slug>.png (skips slugs that already have a file).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROBLEMS_DIR = path.join(ROOT, 'src/problems');
const OUT_DIR = path.join(ROOT, 'assets/problem-images');
const MODEL = 'gemini-2.5-flash-image';
const API_KEY = process.env.GEMINI_API_KEY;

const STYLE_GUIDE =
  'Flat, minimal cartoon illustration style. Bold outlines, a small friendly ' +
  'palette (max 4-5 colors), soft rounded shapes, plenty of white space, no ' +
  'text/letters/numbers/labels anywhere in the image except when a number is ' +
  'the literal subject of the problem (e.g. showing a specific array value). ' +
  'No photorealism, no clutter, no UI chrome. The image should let someone ' +
  'understand the problem\'s setup and goal in a single glance, like a panel ' +
  'from an explainer comic. Square 1:1 composition.';

/** Hand-written visual briefs for problems where the generic template
 *  ("draw the {category} named {title}") would be too vague to produce a
 *  useful picture. Keyed by slug. Extend this as needed. */
const VISUAL_BRIEFS = {
  'n-queens': (p) =>
    `Show a chessboard (any small size, e.g. 4x4) viewed from above, with a ` +
    `few cartoon queen chess pieces placed on it, each glowing softly to show ` +
    `they are "safe" — no two queens share a row, column, or diagonal. Draw ` +
    `faint dotted lines radiating from one queen along its row, column, and ` +
    `both diagonals to show the danger zone it controls, so the viewer ` +
    `immediately grasps "place queens so none can attack each other."`,
  'two-sum': (p) =>
    `Show a row of numbered cartoon boxes (a small array) with two of the ` +
    `boxes glowing and connected by a curved arrow, and next to them a single ` +
    `target box, implying "find two boxes that add up to the target."`,
  'valid-parentheses': (p) =>
    `Show colorful cartoon bracket shapes ( ), { }, [ ] nesting neatly inside ` +
    `one another like matryoshka dolls, with one mismatched bracket glowing ` +
    `red/broken off to the side to show an invalid case.`,
};

function genericBrief(p) {
  return (
    `Illustrate, at a conceptual/metaphorical level, the core idea behind the ` +
    `"${p.category}" coding problem "${p.title}". Pick the single clearest ` +
    `visual metaphor for what this problem is asking (its input structure and ` +
    `its goal) rather than showing code or UI.`
  );
}

function buildPrompt(p) {
  const brief = (VISUAL_BRIEFS[p.slug] || genericBrief)(p);
  return `${brief}\n\nStyle: ${STYLE_GUIDE}`;
}

function loadProblems() {
  const files = fs.readdirSync(PROBLEMS_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
  const problems = [];
  const blockRe = /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']*)'[\s\S]*?category:\s*'([^']*)'[\s\S]*?difficulty:\s*'([^']*)'/g;
  for (const file of files) {
    const src = fs.readFileSync(path.join(PROBLEMS_DIR, file), 'utf8');
    let m;
    while ((m = blockRe.exec(src))) {
      problems.push({ slug: m[1], title: m[2], category: m[3], difficulty: m[4] });
    }
  }
  const seen = new Set();
  return problems.filter((p) => (seen.has(p.slug) ? false : seen.add(p.slug)));
}

async function generateImage(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) {
    throw new Error(`No image returned. Response: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugFilter = args.find((a) => !a.startsWith('--'));

  const problems = loadProblems().filter((p) => !slugFilter || p.slug === slugFilter);
  if (problems.length === 0) {
    console.error(`No problem found${slugFilter ? ` for slug "${slugFilter}"` : ''}.`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const promptsOut = {};
  for (const p of problems) {
    promptsOut[p.slug] = buildPrompt(p);
  }
  fs.writeFileSync(path.join(OUT_DIR, '_prompts.json'), JSON.stringify(promptsOut, null, 2));

  if (dryRun) {
    console.log(`Wrote ${problems.length} prompts to assets/problem-images/_prompts.json (no API calls made).`);
    return;
  }

  if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set (expected in .env). Aborting before making API calls.');
    process.exit(1);
  }

  let done = 0;
  for (const p of problems) {
    const outPath = path.join(OUT_DIR, `${p.slug}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`skip (exists): ${p.slug}`);
      continue;
    }
    try {
      const img = await generateImage(promptsOut[p.slug]);
      fs.writeFileSync(outPath, img);
      done++;
      console.log(`done: ${p.slug}`);
    } catch (err) {
      console.error(`FAILED: ${p.slug} — ${err.message}`);
    }
  }
  console.log(`Generated ${done} image(s) into ${path.relative(ROOT, OUT_DIR)}/`);
}

main();
