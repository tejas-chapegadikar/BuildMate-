import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookmarkButton } from "@/components/BookmarkButton";
import type { PostWithAuthor } from "@/lib/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string | string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { q, tag } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const selectedTags = new Set(
    (Array.isArray(tag) ? tag : tag ? [tag] : []).map((t) => t.toLowerCase())
  );

  const [{ data: allPosts }, { data: myBookmarks }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, author:profiles(id, github_username, name, avatar_url)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .returns<PostWithAuthor[]>(),
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
  ]);

  const bookmarkedIds = new Set((myBookmarks ?? []).map((b) => b.post_id));

  const availableTags = [...new Set((allPosts ?? []).flatMap((p) => p.looking_for))].sort(
    (a, b) => a.localeCompare(b)
  );

  const posts = (allPosts ?? []).filter((post) => {
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.pitch.toLowerCase().includes(query);
    const matchesTags =
      selectedTags.size === 0 ||
      post.looking_for.some((t) => selectedTags.has(t.toLowerCase()));
    return matchesQuery && matchesTags;
  });

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Open projects</h1>
          <p className="mt-1.5 text-sm text-[var(--text-dim)] sm:text-base">
            {posts.length} of {allPosts?.length ?? 0} project{allPosts?.length === 1 ? "" : "s"}{" "}
            looking for a partner
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary w-full sm:w-auto">
          + Post a project
        </Link>
      </div>

      <form className="mb-8 space-y-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by title or pitch…"
          className="field max-w-md"
        />
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {availableTags.map((t) => {
              const checked = selectedTags.has(t.toLowerCase());
              return (
                <label key={t} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="tag"
                    value={t}
                    defaultChecked={checked}
                    className="peer sr-only"
                  />
                  <span className="chip transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[color-mix(in_oklab,var(--accent)_16%,var(--surface-2))] peer-checked:text-[var(--accent-strong)]">
                    {t}
                  </span>
                </label>
              );
            })}
            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
              Apply filters
            </button>
            {(query || selectedTags.size > 0) && (
              <Link href="/browse" className="btn-ghost">
                Clear
              </Link>
            )}
          </div>
        )}
      </form>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--text-dim)]">
          {allPosts && allPosts.length > 0
            ? "No projects match those filters."
            : (
              <>
                No open projects yet. Be the first to{" "}
                <Link href="/posts/new" className="accent-text font-medium">
                  post one
                </Link>
                .
              </>
            )}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="card interactive relative flex h-full flex-col p-5 sm:p-6">
              <Link href={`/posts/${post.id}`} className="absolute inset-0" aria-label={post.title} />
              <div className="pointer-events-none flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-medium">{post.title}</h2>
                <span className="shrink-0 text-xs text-[var(--text-faint)]">
                  @{post.author?.github_username ?? "unknown"}
                </span>
              </div>
              <p className="pointer-events-none mt-1.5 line-clamp-3 text-sm text-[var(--text-dim)]">
                {post.pitch}
              </p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-3.5">
                {post.looking_for.length > 0 && (
                  <div className="pointer-events-none flex flex-wrap gap-1.5">
                    {post.looking_for.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <BookmarkButton
                  postId={post.id}
                  isBookmarked={bookmarkedIds.has(post.id)}
                  className="relative z-10 ml-auto shrink-0"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
