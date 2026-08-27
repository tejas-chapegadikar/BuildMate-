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
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Open projects</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Post a project
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No open projects yet. Be the first to{" "}
          <Link href="/posts/new" className="underline">
            post one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-medium">{post.title}</h2>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {post.author?.github_username ?? "unknown"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                  {post.pitch}
                </p>
                {post.looking_for.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.looking_for.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
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
