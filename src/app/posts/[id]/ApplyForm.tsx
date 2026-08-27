"use client";

import { useActionState } from "react";
import { applyToPost } from "@/app/actions/applications";

export function ApplyForm({ postId }: { postId: string }) {
  const applyToThisPost = applyToPost.bind(null, postId);
  const [state, formAction, pending] = useActionState(applyToThisPost, undefined);

  if (state?.success) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300">
        Application sent — you&apos;ll see their decision here.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="message" className="text-sm font-medium">
        Apply for this
      </label>
      <textarea
        id="message"
        name="message"
        rows={3}
        maxLength={500}
        placeholder="A line or two on why you're a fit (optional)"
        className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Apply"}
      </button>
    </form>
  );
}
