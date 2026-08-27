"use client";

import { useActionState } from "react";
import { updateContact } from "@/app/actions/profile";

export function ContactForm({ initialContact }: { initialContact: string | null }) {
  const [state, formAction, pending] = useActionState(updateContact, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        name="contact"
        defaultValue={initialContact ?? ""}
        placeholder="Email, Discord, or number to share once matched (optional)"
        className="field"
      />
      <button type="submit" disabled={pending} className="btn-secondary shrink-0">
        {pending ? "Saving…" : state?.success ? "Saved" : "Save"}
      </button>
    </form>
  );
}
