import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchGitHubProfile } from "@/lib/github";
import type { Post } from "@/lib/types";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, github] = await Promise.all([
    supabase.from("profiles").select("*").eq("github_username", username).maybeSingle(),
    fetchGitHubProfile(username),
  ]);

  if (!profile && !github) notFound();

  const { data: posts } = profile
    ? await supabase
        .from("posts")
        .select("*")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .returns<Post[]>()
    : { data: [] as Post[] };

  const displayName = github?.name ?? profile?.name ?? username;
  const avatarUrl = github?.avatarUrl ?? profile?.avatar_url ?? undefined;

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-10">
        <aside className="card h-fit p-6">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={56} height={56} className="rounded-full" />
            ) : (
              <span className="size-14 rounded-full bg-[var(--surface-2)]" />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{displayName}</h1>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="accent-text text-sm font-medium"
              >
                @{username} ↗
              </a>
            </div>
          </div>

          {github?.bio && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-dim)]">{github.bio}</p>
          )}

          {github && (
            <div className="mt-5 flex gap-6 border-t border-[var(--border)] pt-4 text-sm">
              <div>
                <p className="font-semibold">{github.publicRepos}</p>
                <p className="text-xs text-[var(--text-faint)]">repos</p>
              </div>
              <div>
                <p className="font-semibold">{github.followers}</p>
                <p className="text-xs text-[var(--text-faint)]">followers</p>
              </div>
            </div>
          )}

          {github && github.topLanguages.length > 0 && (
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="mb-2 text-xs font-medium tracking-wide text-[var(--text-faint)] uppercase">
                Works in
              </p>
              <div className="flex flex-wrap gap-1.5">
                {github.topLanguages.map((lang) => (
                  <span key={lang} className="chip">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="space-y-10">
          {github && github.topRepos.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-dim)]">
                Recent repos
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {github.topRepos.map((repo) => (
                  <li key={repo.name}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="card interactive block h-full p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">{repo.name}</span>
                        {repo.stars > 0 && (
                          <span className="shrink-0 text-xs text-[var(--text-faint)]">
                            ★ {repo.stars}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--text-dim)]">
                          {repo.description}
                        </p>
                      )}
                      {repo.language && (
                        <span className="mt-2 inline-block chip">{repo.language}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-dim)]">
              Projects on BuildMate
            </h2>
            {!posts || posts.length === 0 ? (
              <p className="text-sm text-[var(--text-dim)]">Nothing posted yet.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="card interactive flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="min-w-0 truncate text-sm">{post.title}</span>
                      <span className="chip shrink-0 capitalize">{post.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
