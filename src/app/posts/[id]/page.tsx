import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Application, Profile, PostWithAuthor } from "@/lib/types";
import { closePost } from "@/app/actions/posts";
import { updateApplicationStatus, withdrawApplication } from "@/app/actions/applications";
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
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link href="/browse" className="text-sm text-neutral-400 hover:underline">
        ← Back to open projects
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{post.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Posted by{" "}
            {post.author?.github_username ? (
              <a
                href={`https://github.com/${post.author.github_username}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {post.author.github_username}
              </a>
            ) : (
              "unknown"
            )}
          </p>
        </div>
        {post.status === "closed" && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 dark:bg-neutral-800">
            Closed
          </span>
        )}
      </div>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">
        {post.pitch}
      </p>

      {post.looking_for.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.looking_for.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

      {isOwner ? (
        <OwnerView post={post} applications={applications} />
      ) : (
        <ApplicantView postId={post.id} status={post.status} myApplication={myApplication} />
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
        <h2 className="text-sm font-semibold">
          Applications {applications.length > 0 && `(${applications.length})`}
        </h2>
        {post.status === "open" && (
          <form action={closePost.bind(null, post.id)}>
            <button
              type="submit"
              className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Close this project
            </button>
          </form>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-neutral-500">No applications yet.</p>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li
              key={app.id}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {app.applicant?.avatar_url && (
                    <Image
                      src={app.applicant.avatar_url}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <a
                    href={`https://github.com/${app.applicant?.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium underline"
                  >
                    {app.applicant?.github_username}
                  </a>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.message && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {app.message}
                </p>
              )}

              {app.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <form action={updateApplicationStatus.bind(null, app.id, post.id, "accepted")}>
                    <button
                      type="submit"
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={updateApplicationStatus.bind(null, app.id, post.id, "rejected")}>
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              )}

              {app.status === "accepted" && (
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
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
    return <p className="text-sm text-neutral-500">This project isn&apos;t taking applications right now.</p>;
  }

  if (!myApplication) {
    return <ApplyForm postId={postId} />;
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Your application</p>
        <StatusBadge status={myApplication.status} />
      </div>
      {myApplication.message && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {myApplication.message}
        </p>
      )}
      {myApplication.status === "pending" && (
        <form action={withdrawApplication.bind(null, myApplication.id, postId)} className="mt-3">
          <button
            type="submit"
            className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Withdraw application
          </button>
        </form>
      )}
      {myApplication.status === "accepted" && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
          You&apos;re in! Reach out via the poster&apos;s GitHub above to take it from here.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    rejected: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
