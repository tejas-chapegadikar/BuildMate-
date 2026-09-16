-- BuildMate schema additions (run AFTER schema_v3.sql, in the Supabase SQL
-- editor). Adds indexes on the foreign-key/lookup columns every page query
-- filters or joins on. Postgres auto-indexes primary keys but NOT foreign
-- keys, so these were doing full sequential scans — fine at low row counts,
-- increasingly slow as posts/applications/profiles grow. Purely additive,
-- no behavior change.

create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_status_idx on public.posts (status);

create index if not exists applications_post_id_idx on public.applications (post_id);
create index if not exists applications_applicant_id_idx on public.applications (applicant_id);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);

-- profiles.github_username is looked up on every /u/[username] visit and
-- isn't unique-constrained today, so it has no index at all.
create index if not exists profiles_github_username_idx on public.profiles (github_username);
