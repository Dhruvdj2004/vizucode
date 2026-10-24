#!/usr/bin/env node
// Create (or update) a teacher-panel account. There is no admin page: run this
// on a machine whose .env has DATABASE_URL.
//
//   node --env-file=.env scripts/add-teacher.mjs <email> "<Name>" <password>   create / reset password
//   node --env-file=.env scripts/add-teacher.mjs --disable <email>             block sign-in
//   node --env-file=.env scripts/add-teacher.mjs --enable <email>              allow sign-in again
//   node --env-file=.env scripts/add-teacher.mjs --list                        show all teachers
import pg from 'pg';
import bcrypt from 'bcryptjs';

const [, , a, b, c] = process.argv;
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env scripts/add-teacher.mjs ...');
  process.exit(1);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(`create table if not exists teachers (
  id serial primary key, email text not null unique, name text not null, password_hash text not null,
  active boolean not null default true, created_at timestamptz not null default now())`);
try {
  if (a === '--list') {
    const r = await client.query('select id, email, name, active, created_at from teachers order by id');
    console.table(r.rows.map((t) => ({ ...t, created_at: t.created_at.toISOString().slice(0, 10) })));
  } else if (a === '--disable' || a === '--enable') {
    const r = await client.query('update teachers set active = $1 where email = $2', [a === '--enable', String(b).toLowerCase()]);
    console.log(r.rowCount ? `${b} ${a === '--enable' ? 'enabled' : 'disabled'}.` : `No teacher with email ${b}.`);
  } else if (a && b && c) {
    if (c.length < 8) throw new Error('Password must be at least 8 characters.');
    const email = a.trim().toLowerCase();
    await client.query(
      `insert into teachers (email, name, password_hash) values ($1, $2, $3)
       on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, active = true`,
      [email, b.trim(), await bcrypt.hash(c, 10)]
    );
    console.log(`Teacher ready: ${email}. They sign in at #/teacher/login.`);
  } else {
    console.log('Usage:\n  add-teacher.mjs <email> "<Name>" <password>\n  add-teacher.mjs --disable|--enable <email>\n  add-teacher.mjs --list');
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
