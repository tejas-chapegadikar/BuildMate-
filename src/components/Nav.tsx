import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";
import { SignOutButton } from "./SignOutButton";

export function Nav({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="shell flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-base font-bold text-[var(--accent-ink)] sm:size-9">
            B
          </span>
          <span className="text-lg font-semibold tracking-tight sm:text-xl">BuildMate</span>
          <span className="hidden rounded-full border border-[var(--border)] px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-[var(--text-faint)] uppercase sm:inline">
            Beta
          </span>
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
            <SignOutButton />
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
