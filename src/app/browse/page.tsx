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
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Open projects</h1>
          <p className="mt-1 text-sm text-[var(--text-dim)]">
            {posts?.length ?? 0} project{posts?.length === 1 ? "" : "s"} looking for a partner
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary">
          + Post a project
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--text-dim)]">
          No open projects yet. Be the first to{" "}
          <Link href="/posts/new" className="gradient-text font-medium">
            post one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} className="card interactive block p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-medium">{post.title}</h2>
                  <span className="shrink-0 text-xs text-[var(--text-faint)]">
                    @{post.author?.github_username ?? "unknown"}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-[var(--text-dim)]">
                  {post.pitch}
                </p>
                {post.looking_for.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
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
