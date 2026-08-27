"use client";

import { useActionState } from "react";
import { applyToPost } from "@/app/actions/applications";

export function ApplyForm({ postId }: { postId: string }) {
  const applyToThisPost = applyToPost.bind(null, postId);
  const [state, formAction, pending] = useActionState(applyToThisPost, undefined);

  if (state?.success) {
    return (
      <p className="card border-[color-mix(in_oklab,var(--accent-via)_35%,var(--border))] p-5 text-sm text-[var(--text-dim)]">
        <span className="gradient-text font-medium">Application sent</span> — you&apos;ll
        see their decision here.
      </p>
    );
  }

  return (
    <form action={formAction} className="card space-y-3 p-5">
      <label htmlFor="message" className="text-sm font-medium">
        Apply for this
      </label>
      <textarea
        id="message"
        name="message"
        rows={3}
        maxLength={500}
        placeholder="A line or two on why you're a fit (optional)"
        className="field resize-none"
      />
      {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Sending…" : "Apply"}
      </button>
    </form>
  );
}
