"use client";

import { useActionState, useState } from "react";
import { createPost } from "@/app/actions/posts";

export function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, undefined);
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  const tags = lookingFor
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
      <form action={formAction} className="card max-w-lg space-y-5 p-4 sm:p-6">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            What are you building?
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. A habit tracker with a twist"
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pitch" className="text-sm font-medium">
            Short pitch
          </label>
          <textarea
            id="pitch"
            name="pitch"
            required
            rows={4}
            maxLength={400}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="One or two sentences on what it does and where it's at — no need for a full spec."
            className="field resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="looking_for" className="text-sm font-medium">
            Who are you looking for?
          </label>
          <input
            id="looking_for"
            name="looking_for"
            required
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g. Backend dev, Postgres, auth"
            className="field"
          />
          <p className="text-xs text-[var(--text-faint)]">
            Comma-separated skill/role tags, up to 5.
          </p>
        </div>

        {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Posting…" : "Post project"}
        </button>
      </form>

      <aside className="hidden lg:block">
        <p className="mb-3 text-xs font-medium tracking-wide text-[var(--text-faint)] uppercase">
          Preview
        </p>
        <div className="card sticky top-24 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate font-medium">
              {title || "Your project title"}
            </h2>
            <span className="shrink-0 text-xs text-[var(--text-faint)]">@you</span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-dim)]">
            {pitch || "Your pitch will show up here as you type."}
          </p>
          {tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
