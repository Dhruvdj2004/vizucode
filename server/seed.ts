// VizuCode Phase 3 seeder: applies schema.sql, then loads the question
// catalog and per-problem static content into Postgres. Idempotent —
// wipes and reinserts both tables in one transaction.
//
// Usage: npm run db:seed  (reads DATABASE_URL from .env)
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { catalog } from '../src/data/catalog';
import { problemRegistry } from '../src/problems';
import { toStatic } from '../src/lib/serialize';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Put it in .env (see .env.example).');
  process.exit(1);
}

const schema = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');

const client = new pg.Client({
  connectionString: url,
  // Supabase's pooler presents a cert that node's default CA set rejects.
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  await client.query(schema);

  await client.query('begin');
  try {
    await client.query('truncate questions cascade');

    for (const q of catalog) {
      await client.query(
        `insert into questions (id, slug, category, title, difficulty, leetcode)
         values ($1, $2, $3, $4, $5, $6)`,
        [q.id, q.slug, q.category, q.title, q.difficulty, q.leetcode]
      );
    }

    for (const def of Object.values(problemRegistry)) {
      const s = toStatic(def);
      await client.query(
        `insert into problem_content
           (slug, technique, widget, widget_title, inputs,
            code_cpp, code_java, note, time_complexity, space_complexity)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          s.slug,
          s.technique,
          s.widget,
          s.widgetTitle,
          JSON.stringify(s.inputs),
          JSON.stringify(s.code.cpp),
          JSON.stringify(s.code.java),
          s.note,
          s.complexity.time,
          s.complexity.space,
        ]
      );
    }

    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  }

  const counts = await client.query(
    `select (select count(*) from questions)::int as questions,
            (select count(*) from problem_content)::int as visualizers`
  );
  console.log(
    `Seeded ${counts.rows[0].questions} questions and ${counts.rows[0].visualizers} visualizer contents.`
  );
  await client.end();
}

main().catch((e) => {
  console.error('Seed failed:', e.message ?? e);
  process.exit(1);
});
