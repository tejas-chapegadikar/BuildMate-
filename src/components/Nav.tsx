import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";

export function Nav({ profile }: { profile: Profile | null }) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          hackermatch
        </Link>

        {profile ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/browse" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Browse
            </Link>
            <Link href="/posts/new" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Post a project
            </Link>
            <Link href="/me" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              {profile.avatar_url && (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={22}
                  height={22}
                  className="rounded-full"
                />
              )}
              {profile.github_username ?? "You"}
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
