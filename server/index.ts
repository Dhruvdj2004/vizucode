// Local dev entry (`npm run server`): attaches a listener to the shared
// Express app. The Vercel deployment uses the same app via api/index.ts
// instead of this file (serverless functions don't call .listen()).
import { app } from './app';
import { pool } from './db';

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  const source = pool ? 'Postgres (DATABASE_URL)' : 'local TS modules (set DATABASE_URL to use the database)';
  console.log(`VizuCode API listening on http://localhost:${PORT} — data source: ${source}`);
});
