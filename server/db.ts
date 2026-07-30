// Postgres pool for the API server. When DATABASE_URL is unset the server
// falls back to the bundled TS data modules, so local dev works without a DB.
import pg from 'pg';

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase's pooler presents a cert that node's default CA set rejects.
      ssl: { rejectUnauthorized: false },
      // On Vercel each warm function instance gets its own pool, and many
      // instances can run concurrently — keep each one small (ideally against
      // Supabase's connection pooler, not a direct connection) so they don't
      // collectively exhaust Postgres's connection limit. A single long-lived
      // local dev/server process can afford a bigger pool.
      max: process.env.VERCEL ? 1 : 5,
    })
  : null;

// An idle client can hit a background network error (e.g. a dropped
// connection). pg.Pool re-emits that as an 'error' event on the pool itself;
// with no listener, Node's default is to crash the process. Log and carry on
// — the pool discards the broken client and opens a fresh one on next use.
pool?.on('error', (err) => {
  console.error('[db] idle client error (pool continues):', err.message);
});
