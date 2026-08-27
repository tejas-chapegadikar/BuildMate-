"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions/posts";

export function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPost, undefined);

  return (
    <form action={formAction} className="space-y-5">
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
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
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
          className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
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
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <p className="text-xs text-neutral-400">
          Comma-separated skill/role tags, up to 5.
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post project"}
      </button>
    </form>
  );
}
