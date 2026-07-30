// Vercel serverless entry point. vercel.json rewrites every /api/* request
// here; the Express app's own routing (server/app.ts) takes it from there.
//
// Plain JS, importing the esbuild-bundled app (built by `npm run api:build`,
// which Vercel runs as part of `vercel-build`) rather than the raw TS source:
// Vercel compiles this file and server/app.ts separately rather than bundling
// them together, and under "type": "module" Node's ESM loader requires an
// explicit extension on relative imports — '../server/app' (no extension)
// fails at runtime with ERR_MODULE_NOT_FOUND even though the build succeeds.
// The bundle has everything inlined and only real node_modules imports left,
// so there's nothing left for the loader to fail to resolve.
import { app } from '../server/dist/app.mjs';

export default function handler(req, res) {
  return app(req, res);
}
