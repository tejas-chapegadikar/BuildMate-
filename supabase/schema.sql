-- BuildMate database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once
-- you've created a Supabase project and enabled the GitHub auth provider.

-- ========== profiles ==========
-- One row per authenticated user, auto-created from their GitHub OAuth
-- metadata (see the trigger below). `contact` is the only field users
-- edit themselves — an optional way to share email/Discord/phone once
-- matched. Their GitHub profile is always available as a fallback since
-- GitHub is the login method itself.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  github_username text,
  name text,
  avatar_url text,
  contact text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up via GitHub OAuth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, github_username, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'user_name',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== posts ==========
-- A project someone is building, with a short pitch and the role/skill
-- they're looking for. Deliberately minimal fields.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  pitch text not null,
  looking_for text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ========== applications ==========
-- One application per (post, applicant). Status starts pending; only the
-- post's author can accept/reject.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (post_id, applicant_id)
);

alter table public.applications enable row level security;

-- Visible to the applicant themselves and to the post's author.
create policy "Applicants and post authors can view applications"
  on public.applications for select
  to authenticated
  using (
    auth.uid() = applicant_id
    or auth.uid() in (
      select author_id from public.posts where posts.id = applications.post_id
    )
  );

create policy "Users can apply to posts as themselves"
  on public.applications for insert
  to authenticated
  with check (
    auth.uid() = applicant_id
    and auth.uid() not in (
      select author_id from public.posts where posts.id = applications.post_id
    )
  );

-- Only the post author can change status (accept/reject).
create policy "Post authors can update application status"
  on public.applications for update
  to authenticated
  using (
    auth.uid() in (
      select author_id from public.posts where posts.id = applications.post_id
    )
  );

create policy "Applicants can withdraw their own application"
  on public.applications for delete
  to authenticated
  using (auth.uid() = applicant_id);
