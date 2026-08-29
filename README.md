# BuildMate

Find a partner for the project you're building. Post what you're working on
and what skill you're missing; applicants sign in with GitHub, so their
skills are backed by a real profile.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Enable the GitHub provider**: Supabase dashboard → Authentication →
   Providers → GitHub. This requires a GitHub OAuth App
   (github.com/settings/developers → New OAuth App) with its callback URL
   set to the one Supabase shows on that page
   (`https://<project-ref>.supabase.co/auth/v1/callback`). Put the GitHub
   App's Client ID/Secret into Supabase.
3. **Add your site's own callback as an additional redirect URL**: Supabase
   dashboard → Authentication → URL Configuration → Redirect URLs, add
   `http://localhost:3000/auth/callback` (and your production URL later).
4. **Run the schema**: Supabase dashboard → SQL Editor, paste and run
   [`supabase/schema.sql`](supabase/schema.sql). This creates the
   `profiles`/`posts`/`applications` tables, row-level security policies,
   and a trigger that auto-creates a profile from GitHub metadata on
   sign-up.
5. **Run the schema additions**: SQL Editor again, paste and run
   [`supabase/schema_v2.sql`](supabase/schema_v2.sql) (after `schema.sql`
   above). Adds the `bookmarks` table and a `get_counterpart_email`
   function used for notification emails — it reads `auth.users` directly
   so a real email address is never exposed through the regular
   `profiles` table.
6. **Copy env vars**: `cp .env.local.example .env.local` and fill in your
   project's URL and anon key (Supabase dashboard → Project Settings →
   API).
7. **(Optional) Email notifications**: sign up at [resend.com](https://resend.com),
   grab an API key, and set `RESEND_API_KEY` in `.env.local`. Without it,
   notification emails are skipped (logged to the console) rather than
   failing anything.

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Auth**: GitHub OAuth via Supabase Auth (`src/lib/supabase`,
  `src/app/auth/`). Session is kept fresh on every request by
  `src/proxy.ts` (this Next.js version renamed `middleware.ts` → `proxy.ts`
  — see `AGENTS.md`).
- **Posting a project**: `/posts/new` — title, short pitch, and a
  comma-separated list of skills/roles you're looking for. Deliberately
  minimal.
- **Browsing/applying**: `/browse` lists open posts; `/posts/[id]` is where
  people apply with an optional message.
- **Matching**: the post's author accepts/declines from `/posts/[id]`. On
  accept, both sides can already reach each other via GitHub (the login
  itself); an optional contact field (email/Discord/number) set on `/me`
  is also revealed once matched. There's no in-app chat by design — see
  `AGENTS.md`/project memory for the reasoning.
- **Public profiles**: `/u/[username]` pulls live public GitHub data (bio,
  top languages, recent repos) via `src/lib/github.ts`, plus that user's
  posts on BuildMate. No token needed, cached for an hour.
- **Search & filter**: `/browse` supports `?q=` (title/pitch text) and
  `?tag=` (repeatable) via plain GET form params — shareable/bookmarkable
  URLs, no client JS required for the filtering itself.
- **Bookmarks**: save a project without applying yet (`src/app/actions/bookmarks.ts`),
  visible under "Saved for later" on `/me`.
- **Email notifications**: best-effort emails via Resend on new applicant
  and on acceptance (`src/lib/email.ts`). Never blocks the action it's
  attached to — a missing key or a Resend outage just skips the email.
