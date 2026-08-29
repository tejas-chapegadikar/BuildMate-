import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Application, Profile, PostWithAuthor } from "@/lib/types";
import { closePost } from "@/app/actions/posts";
import { updateApplicationStatus, withdrawApplication } from "@/app/actions/applications";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ApplyForm } from "./ApplyForm";

type ApplicationWithApplicant = Application & { applicant: Profile | null };

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(id, github_username, name, avatar_url)")
    .eq("id", id)
    .single<PostWithAuthor>();

  if (!post) notFound();

  const isOwner = post.author_id === user.id;

  const { data: myBookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", post.id)
    .eq("user_id", user.id)
    .maybeSingle();

  let applications: ApplicationWithApplicant[] = [];
  let myApplication: Application | null = null;

  if (isOwner) {
    const { data } = await supabase
      .from("applications")
      .select("*, applicant:profiles(*)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: false })
      .returns<ApplicationWithApplicant[]>();
    applications = data ?? [];
  } else {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("post_id", post.id)
      .eq("applicant_id", user.id)
      .maybeSingle<Application>();
    myApplication = data;
  }

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <Link href="/browse" className="btn-ghost">
        ← Back to open projects
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
        <div className="lg:order-2">
          <PostSummary post={post} showBookmark={!isOwner} isBookmarked={!!myBookmark} />
        </div>

        <div className="lg:order-1">
          {isOwner ? (
            <OwnerView post={post} applications={applications} />
          ) : (
            <ApplicantView postId={post.id} status={post.status} myApplication={myApplication} />
          )}
        </div>
      </div>
    </div>
  );
}

function PostSummary({
  post,
  showBookmark,
  isBookmarked,
}: {
  post: PostWithAuthor;
  showBookmark: boolean;
  isBookmarked: boolean;
}) {
  return (
    <div className="card lg:sticky lg:top-28 p-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{post.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          {post.status === "closed" && <span className="chip">Closed</span>}
          {showBookmark && (
            <BookmarkButton postId={post.id} isBookmarked={isBookmarked} />
          )}
        </div>
      </div>
      <p className="mt-1.5 text-sm text-[var(--text-dim)]">
        Posted by{" "}
        {post.author?.github_username ? (
          <Link href={`/u/${post.author.github_username}`} className="accent-text font-medium">
            @{post.author.github_username}
          </Link>
        ) : (
          "unknown"
        )}
      </p>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
        {post.pitch}
      </p>

      {post.looking_for.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.looking_for.map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerView({
  post,
  applications,
}: {
  post: PostWithAuthor;
  applications: ApplicationWithApplicant[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-dim)]">
          Applications {applications.length > 0 && `(${applications.length})`}
        </h2>
        {post.status === "open" && (
          <form action={closePost.bind(null, post.id)}>
            <button type="submit" className="btn-ghost">
              Close this project
            </button>
          </form>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-[var(--text-dim)]">No applications yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {applications.map((app) => (
            <li key={app.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {app.applicant?.avatar_url ? (
                    <Image
                      src={app.applicant.avatar_url}
                      alt=""
                      width={26}
                      height={26}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="size-[26px] rounded-full bg-[var(--surface-2)]" />
                  )}
                  <Link
                    href={`/u/${app.applicant?.github_username}`}
                    className="text-sm font-medium hover:underline"
                  >
                    @{app.applicant?.github_username}
                  </Link>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.message && (
                <p className="mt-3 text-sm text-[var(--text-dim)]">{app.message}</p>
              )}

              {app.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <form action={updateApplicationStatus.bind(null, app.id, post.id, "accepted")}>
                    <button type="submit" className="btn-primary px-4 py-1.5 text-xs">
                      Accept
                    </button>
                  </form>
                  <form action={updateApplicationStatus.bind(null, app.id, post.id, "rejected")}>
                    <button type="submit" className="btn-secondary px-4 py-1.5 text-xs">
                      Decline
                    </button>
                  </form>
                </div>
              )}

              {app.status === "accepted" && (
                <p className="mt-3 text-sm text-[var(--text-dim)]">
                  Reach them on GitHub above
                  {app.applicant?.contact ? `, or: ${app.applicant.contact}` : "."}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicantView({
  postId,
  status,
  myApplication,
}: {
  postId: string;
  status: string;
  myApplication: Application | null;
}) {
  if (status === "closed" && !myApplication) {
    return (
      <p className="text-sm text-[var(--text-dim)]">
        This project isn&apos;t taking applications right now.
      </p>
    );
  }

  if (!myApplication) {
    return <ApplyForm postId={postId} />;
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Your application</p>
        <StatusBadge status={myApplication.status} />
      </div>
      {myApplication.message && (
        <p className="mt-3 text-sm text-[var(--text-dim)]">{myApplication.message}</p>
      )}
      {myApplication.status === "pending" && (
        <form action={withdrawApplication.bind(null, myApplication.id, postId)} className="mt-4">
          <button type="submit" className="btn-ghost">
            Withdraw application
          </button>
        </form>
      )}
      {myApplication.status === "accepted" && (
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          You&apos;re in! Reach out via the poster&apos;s GitHub above to take it from here.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "badge-pending",
    accepted: "badge-accepted",
    rejected: "badge-rejected",
  };
  return (
    <span className={`chip shrink-0 capitalize ${styles[status] ?? ""}`}>{status}</span>
  );
}
