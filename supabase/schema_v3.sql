-- BuildMate schema additions (run AFTER schema_v2.sql, in the Supabase SQL
-- editor). Adds a self-declared `skills` list on profiles, powering the
-- /people collaborator directory — distinct from the GitHub-derived
-- `topLanguages` already shown on /u/[username] (live API data, never
-- stored). No RLS changes needed: profiles' existing row-level policies
-- already cover every column, including this new one.
alter table public.profiles
  add column skills text[] not null default '{}';
