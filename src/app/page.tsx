import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";

export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/browse");
    }
  }

  return (
    <div className="shell flex flex-1 flex-col justify-center gap-16 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-0">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="chip-pop fade-up">
            <span className="size-1.5 rounded-full bg-current" />
            for builders, not resumes
          </span>

          <div className="space-y-4">
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight fade-up fade-up-1">
              <span className="block">Find your</span>
              <span className="accent-text block">co-builder.</span>
            </h1>
            <p className="mx-auto max-w-md text-balance text-sm leading-relaxed text-[var(--text-dim)] fade-up fade-up-2 sm:text-base lg:mx-0">
              Post what you&apos;re building and what you&apos;re missing.
              Sign in with GitHub — no fluffed-up bios, just real code to
              back up the skills.
            </p>
          </div>

          <div className="fade-up fade-up-3">
            <GitHubSignInButton />
          </div>
        </div>

        <div className="fade-up fade-up-2 mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <PreviewCard />
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 fade-up fade-up-3 sm:grid-cols-3 sm:gap-5">
        <Feature icon={<PostIcon />} title="Post the gap" body="One pitch, one skill you're missing. No 10-field form." />
        <Feature icon={<MatchIcon />} title="Real applicants" body="GitHub-verified — you see their actual repos, not a résumé." />
        <Feature icon={<HandshakeIcon />} title="You take it from there" body="Accept, then connect directly. No chat to manage, no noise." />
      </div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="card p-5 text-left">
      <div className="mb-3 grid size-9 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--accent-strong)]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{body}</p>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="card relative rounded-2xl border-[color-mix(in_oklab,var(--accent)_25%,var(--border))] p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-[var(--surface-2)]" />
        <span className="size-2.5 rounded-full bg-[var(--surface-2)]" />
        <span className="size-2.5 rounded-full bg-[var(--surface-2)]" />
        <span className="ml-2 text-[0.65rem] text-[var(--text-faint)]">buildmate — open project</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">A habit tracker with a twist</h2>
        <span className="shrink-0 text-xs text-[var(--text-faint)]">@rin</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
        Frontend&apos;s done in React, need someone to own the backend —
        auth, streaks logic, and a Postgres schema.
      </p>
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {["Backend", "Postgres", "Auth"].map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <span className="btn-secondary pointer-events-none text-xs">Apply</span>
      </div>
    </div>
  );
}

function PostIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 18a4 4 0 0 0-8 0" />
      <circle cx="12" cy="10" r="3.5" />
      <path d="M2 12a10 10 0 1 1 20 0" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 3 3a1 1 0 1 0 3-3l-3.5-3.5" />
      <path d="m8 12 4 4" />
      <path d="m2 10 5-5 4 4-5 5Z" />
      <path d="m22 10-5-5-4 4 5 5Z" />
    </svg>
  );
}
