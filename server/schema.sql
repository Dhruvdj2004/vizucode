-- Visucode Phase 3 schema (Supabase / PostgreSQL).
-- Applied automatically by `npm run db:seed` — safe to re-run.

create table if not exists questions (
  id         integer primary key,          -- catalog order; the UI sorts by this
  slug       text    not null unique,
  category   text    not null,
  title      text    not null,
  difficulty text    not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  leetcode   text    not null
);

-- Static visualizer content (everything in ProblemDef except the trace
-- generator, which is code and stays in the TS bundle).
create table if not exists problem_content (
  slug             text  primary key references questions(slug) on delete cascade,
  technique        text  not null,
  widget           text  not null,
  widget_title     text  not null,
  inputs           jsonb not null,  -- InputField[]
  code_cpp         jsonb not null,  -- CodeLine[] with step tags
  code_java        jsonb not null,  -- CodeLine[] with step tags
  note             text  not null,
  time_complexity  text  not null,
  space_complexity text  not null
);

create index if not exists idx_questions_category on questions (category);

-- Registered users (auth module). Never truncated by the seeder.
create table if not exists users (
  id            integer generated always as identity primary key,
  email         text not null unique,
  first_name    text not null,
  password_hash text not null,
  is_pro        boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Safety net for databases that already had `users` before is_pro existed.
alter table users add column if not exists is_pro boolean not null default false;

-- Per-user solved questions: one row = "this user solved this question".
-- Deliberately NO foreign key to questions(slug): the seeder re-creates the
-- questions table with `truncate … cascade`, and progress must survive that.
-- Slugs are validated against the catalog at the API layer instead.
create table if not exists user_progress (
  user_id   integer not null references users(id) on delete cascade,
  slug      text    not null,
  solved_at timestamptz not null default now(),
  primary key (user_id, slug)
);

create index if not exists idx_progress_user on user_progress (user_id);

-- The backend connects as the table owner and is unaffected; this keeps
-- Supabase's auto-generated public REST API from exposing the tables.
alter table questions enable row level security;
alter table problem_content enable row level security;
alter table users enable row level security;
alter table user_progress enable row level security;
