// Netlify Functions entry point. netlify.toml redirects every /api/* request
// here (as one function, path preserved) — same pattern as the Vercel entry.
//
// Imports the esbuild-bundled app (built by `npm run api:build`) rather than
// the raw TS source: it's a single self-contained file with every internal
// relative import already inlined, so there's nothing left for a bundler or
// runtime module loader to fail to resolve — the exact class of bug that
// broke the first Vercel deploy attempt.
import serverless from 'serverless-http';
import { app } from '../../server/dist/app.mjs';

export const handler = serverless(app);
