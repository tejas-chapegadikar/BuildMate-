import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post, Profile } from "@/lib/types";
import { ContactForm } from "./ContactForm";
import { SkillsForm } from "./SkillsForm";

type MyApplication = {
  id: string;
  status: string;
  post: Pick<Post, "id" | "title"> | null;
};

type SavedBookmark = {
  post: Pick<Post, "id" | "title" | "status"> | null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const { data: savedRaw } = await supabase
    .from("bookmarks")
    .select("post:posts(id, title, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const savedPosts = ((savedRaw ?? []) as unknown as SavedBookmark[])
    .map((b) => b.post)
    .filter((p): p is Pick<Post, "id" | "title" | "status"> => p !== null);

  const posts = myPosts ?? [];
  const openPosts = posts.filter((p) => p.status === "open").length;
  const closedPosts = posts.length - openPosts;
  const acceptedSent = myApplications.filter((a) => a.status === "accepted").length;
  const skills = profile?.skills ?? [];
  const completeness = Math.round(
    (((profile?.contact ? 1 : 0) + (skills.length > 0 ? 1 : 0)) / 2) * 100
  );

  let pendingReceived = 0;
  if (posts.length > 0) {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in(
        "post_id",
        posts.map((p) => p.id)
      )
      .eq("status", "pending");
    pendingReceived = count ?? 0;
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const { data: recentSent } = await supabase
    .from("applications")
    .select("created_at")
    .eq("applicant_id", user.id)
    .gte("created_at", weekStart.toISOString())
    .returns<{ created_at: string }[]>();

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const key = day.toDateString();
    return {
      label: DAY_LABELS[day.getDay()],
      count: (recentSent ?? []).filter(
        (a) => new Date(a.created_at).toDateString() === key
      ).length,
      isToday: i === 6,
    };
  });
  const weekMax = Math.max(1, ...week.map((d) => d.count));
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back
          {profile?.github_username ? `, @${profile.github_username}` : ""}
        </h1>
        {profile?.github_username && (
          <Link href={`/u/${profile.github_username}`} className="accent-text text-sm font-medium">
            View public profile ↗
          </Link>
        )}
      </div>
      <p className="mt-1.5 text-sm text-[var(--text-dim)]">
        Here&apos;s how your BuildMate profile is doing.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-tile tone-accent flex items-center gap-4">
          <CompletenessRing value={completeness} />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-[var(--text-dim)] uppercase">
              Profile
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-dim)]">
              {completeness === 100
                ? "All set — nothing left to fill in."
                : !profile?.contact && skills.length === 0
                  ? "Add contact info and skills to finish up."
                  : !profile?.contact
                    ? "Add contact info to finish up."
                    : "Add your skills to finish up."}
            </p>
          </div>
        </div>

        <StatTile
          tone="tone-accent"
          label="Open posts"
          value={openPosts}
          sub={`${closedPosts} closed`}
          icon={<PostIcon />}
        />
        <StatTile
          tone="tone-warn"
          label="Pending"
          value={pendingReceived}
          sub="waiting on your review"
          icon={<ClockIcon />}
        />
        <StatTile
          tone="tone-info"
          label="Applications sent"
          value={myApplications.length}
          sub={`${acceptedSent} accepted`}
          icon={<SendIcon />}
        />
      </div>

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Applications you sent this week</h2>
          <span className="text-xs text-[var(--text-faint)]">
            {weekTotal} in the last 7 days
          </span>
        </div>
        <div className="mt-5 flex h-40 items-stretch gap-2 sm:gap-3">
          {week.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col justify-end gap-2">
              <span className="text-center text-[0.7rem] text-[var(--text-faint)]">
                {day.count > 0 ? day.count : ""}
              </span>
              <div
                className="w-full rounded-md"
                style={{
                  height: `${Math.max(4, Math.round((day.count / weekMax) * 104))}px`,
                  background: day.isToday
                    ? "var(--accent-strong)"
                    : "color-mix(in oklab, var(--accent) 28%, transparent)",
                }}
              />
              <span
                className={`text-center text-[0.7rem] ${
                  day.isToday ? "font-medium text-[var(--text)]" : "text-[var(--text-faint)]"
                }`}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <section className="card h-fit p-5">
            <h2 className="text-sm font-semibold text-[var(--text-dim)]">Contact info</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--text-faint)]">
              Shown only to people whose application you accept, or who accept
              yours.
            </p>
            <ContactForm initialContact={profile?.contact ?? null} />
          </section>

          <section className="card h-fit p-5">
            <h2 className="text-sm font-semibold text-[var(--text-dim)]">Your skills</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--text-faint)]">
              Comma-separated, up to 10. Shown on your public profile and in
              the collaborator directory.
            </p>
            <SkillsForm initialSkills={skills} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-dim)]">Your posts</h2>
              <Link href="/posts/new" className="accent-text text-xs font-medium">
                + New post
              </Link>
            </div>
            {posts.length === 0 ? (
              <p className="text-sm text-[var(--text-dim)]">You haven&apos;t posted a project yet.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="card interactive flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">{post.title}</span>
                      <span className="chip shrink-0 capitalize">{post.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-dim)]">Saved for later</h2>
            {savedPosts.length === 0 ? (
              <p className="text-sm text-[var(--text-dim)]">
                Nothing saved yet — bookmark a project from its page to come back to it.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {savedPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="card interactive flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate">{post.title}</span>
                      <span className="chip shrink-0 capitalize">{post.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-dim)]">
              Projects you&apos;ve applied to
            </h2>
            {myApplications.length === 0 ? (
              <p className="text-sm text-[var(--text-dim)]">
                No applications yet — go{" "}
                <Link href="/browse" className="accent-text font-medium">
                  browse open projects
                </Link>
                .
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {myApplications.map((app) =>
                  app.post ? (
                    <li key={app.id}>
                      <Link
                        href={`/posts/${app.post.id}`}
                        className="card interactive flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="min-w-0 truncate">{app.post.title}</span>
                        <span
                          className={`chip shrink-0 capitalize ${
                            app.status === "accepted"
                              ? "badge-accepted"
                              : app.status === "pending"
                                ? "badge-pending"
                                : "badge-rejected"
                          }`}
                        >
                          {app.status}
                        </span>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  tone,
  label,
  value,
  sub,
  icon,
}: {
  tone: string;
  label: string;
  value: number;
  sub: string;
  icon: ReactNode;
}) {
  return (
    <div className={`stat-tile ${tone} flex flex-col`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-[var(--text-dim)] uppercase">
          {label}
        </span>
        <span className="stat-tile-icon">{icon}</span>
      </div>
      <p className="stat-tile-value mt-4">{value}</p>
      <p className="mt-auto pt-3 text-xs text-[var(--text-faint)]">{sub}</p>
    </div>
  );
}

function CompletenessRing({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0" aria-hidden>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--border)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fill="var(--text)"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-geist-mono)"
      >
        {value}%
      </text>
    </svg>
  );
}

function PostIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}
