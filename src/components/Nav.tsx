import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";

export function Nav({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="shell flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-[var(--accent)] text-xs font-bold text-[var(--accent-ink)]">
            B
          </span>
          <span className="text-sm font-semibold tracking-tight">BuildMate</span>
        </Link>

        {profile ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/browse"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)] sm:px-3"
            >
              <CompassIcon />
              <span className="hidden sm:inline">Browse</span>
            </Link>
            <Link
              href="/posts/new"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)] sm:px-3"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Post</span>
            </Link>
            <Link
              href="/me"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pr-2.5 pl-1 text-[var(--text-dim)] transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] hover:text-[var(--text)] sm:pr-3"
            >
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={22}
                  height={22}
                  className="rounded-full"
                />
              ) : (
                <span className="size-[22px] rounded-full bg-[var(--surface-2)]" />
              )}
              <span className="hidden text-xs font-medium sm:inline">
                {profile.github_username ?? "You"}
              </span>
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-full p-2 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]" aria-label="Sign out">
                <SignOutIcon />
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-2 5-5 2 2-5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
