import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";

export function Nav({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-[var(--accent-from)] via-[var(--accent-via)] to-[var(--accent-to)] text-xs font-bold text-black">
            /
          </span>
          <span className="text-sm font-semibold tracking-tight">hackermatch</span>
        </Link>

        {profile ? (
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/browse" className="text-[var(--text-dim)] transition-colors hover:text-[var(--text)]">
              Browse
            </Link>
            <Link href="/posts/new" className="text-[var(--text-dim)] transition-colors hover:text-[var(--text)]">
              Post
            </Link>
            <Link
              href="/me"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pr-3 pl-1 text-[var(--text-dim)] transition-colors hover:border-[color-mix(in_oklab,var(--accent-via)_45%,var(--border))] hover:text-[var(--text)]"
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
              <span className="text-xs font-medium">{profile.github_username ?? "You"}</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-ghost">
                Sign out
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
