-- BuildMate schema additions (run AFTER schema.sql, in the Supabase SQL
-- editor). Adds: bookmarks, and a privacy-safe way for the server to look
-- up a counterpart's email for transactional notifications without ever
-- exposing email addresses through the regular profiles table.

-- ========== bookmarks ==========
-- "Save for later" — separate from applying.
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

alter table public.bookmarks enable row level security;

create policy "Users manage their own bookmarks"
  on public.bookmarks for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== counterpart email lookup ==========
-- profiles has no email column on purpose — RLS on profiles lets any
-- authenticated user read every row (needed to show usernames/avatars),
-- and a real email address is more sensitive than that. This function
-- instead reads auth.users directly (only possible because it's
-- `security definer`) and returns an email ONLY when the caller has a
-- legitimate relationship to target_user_id via the given post: caller
-- is the post's author and target is an applicant, or vice versa.
create or replace function public.get_counterpart_email(post_id uuid, target_user_id uuid)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_email text;
  v_author uuid;
begin
  select author_id into v_author from public.posts where posts.id = get_counterpart_email.post_id;
  if v_author is null then
    return null;
  end if;

  if auth.uid() = v_author and exists (
    select 1 from public.applications
    where applications.post_id = get_counterpart_email.post_id
      and applications.applicant_id = target_user_id
  ) then
    select email into v_email from auth.users where auth.users.id = target_user_id;
    return v_email;
  end if;

  if target_user_id = v_author and exists (
    select 1 from public.applications
    where applications.post_id = get_counterpart_email.post_id
      and applications.applicant_id = auth.uid()
  ) then
    select email into v_email from auth.users where auth.users.id = target_user_id;
    return v_email;
  end if;

  return null;
end;
$$;

grant execute on function public.get_counterpart_email(uuid, uuid) to authenticated;
