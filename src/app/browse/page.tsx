import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor } from "@/lib/types";

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(id, github_username, name, avatar_url)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .returns<PostWithAuthor[]>();

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Open projects</h1>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            {posts?.length ?? 0} project{posts?.length === 1 ? "" : "s"} looking for a partner
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary w-full sm:w-auto">
          + Post a project
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--text-dim)]">
          No open projects yet. Be the first to{" "}
          <Link href="/posts/new" className="accent-text font-medium">
            post one
          </Link>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="card interactive flex h-full flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="min-w-0 truncate font-medium">{post.title}</h2>
                  <span className="shrink-0 text-xs text-[var(--text-faint)]">
                    @{post.author?.github_username ?? "unknown"}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-3 text-sm text-[var(--text-dim)]">
                  {post.pitch}
                </p>
                {post.looking_for.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3.5">
                    {post.looking_for.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
