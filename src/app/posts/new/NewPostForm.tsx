"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions/posts";

export function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, undefined);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          What are you building?
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
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
  );
}
