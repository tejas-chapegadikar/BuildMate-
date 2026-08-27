"use client";

import { useActionState } from "react";
import { updateContact } from "@/app/actions/profile";

export function ContactForm({ initialContact }: { initialContact: string | null }) {
  const [state, formAction, pending] = useActionState(updateContact, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        name="contact"
        defaultValue={initialContact ?? ""}
        placeholder="Email, Discord, or number to share once matched (optional)"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
      >
        {pending ? "Saving…" : state?.success ? "Saved" : "Save"}
      </button>
    </form>
  );
}
