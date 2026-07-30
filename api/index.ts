// Vercel serverless entry point. vercel.json rewrites every /api/* request
// here; the Express app's own routing (server/app.ts) takes it from there.
import type { IncomingMessage, ServerResponse } from 'http';
import { app } from '../server/app';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
