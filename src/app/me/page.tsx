import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post, Profile } from "@/lib/types";
import { ContactForm } from "./ContactForm";

type MyApplication = {
  id: string;
  status: string;
  post: Pick<Post, "id" | "title"> | null;
};

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { data: myPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Post[]>();

  const { data: sentRaw } = await supabase
    .from("applications")
    .select("id, status, post:posts(id, title)")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });
  const myApplications = (sentRaw ?? []) as unknown as MyApplication[];

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {profile?.name ?? profile?.github_username ?? "You"}
      </h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--text-dim)]">Contact info</h2>
        <p className="mt-1 mb-3 text-xs text-[var(--text-faint)]">
          Shown only to people whose application you accept, or who accept yours.
        </p>
        <ContactForm initialContact={profile?.contact ?? null} />
      </section>

      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-dim)]">Your posts</h2>
          <Link href="/posts/new" className="text-xs gradient-text font-medium">
            + New post
          </Link>
        </div>
        {!myPosts || myPosts.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">You haven&apos;t posted a project yet.</p>
        ) : (
          <ul className="space-y-2">
            {myPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="card interactive flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span>{post.title}</span>
                  <span className="chip capitalize">{post.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-dim)]">
          Projects you&apos;ve applied to
        </h2>
        {myApplications.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">
            No applications yet — go{" "}
            <Link href="/browse" className="gradient-text font-medium">
              browse open projects
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {myApplications.map((app) =>
              app.post ? (
                <li key={app.id}>
                  <Link
                    href={`/posts/${app.post.id}`}
                    className="card interactive flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span>{app.post.title}</span>
                    <span className="chip capitalize">{app.status}</span>
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
