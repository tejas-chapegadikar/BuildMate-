"use client";

import { useActionState } from "react";
import { updateSkills } from "@/app/actions/profile";

export function SkillsForm({ initialSkills }: { initialSkills: string[] }) {
  const [state, formAction, pending] = useActionState(updateSkills, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        name="skills"
        defaultValue={initialSkills.join(", ")}
        placeholder="e.g. React, TypeScript, UI/UX"
        className="field"
      />
      <button type="submit" disabled={pending} className="btn-secondary shrink-0">
        {pending ? "Saving…" : state?.success ? "Saved" : "Save"}
      </button>
    </form>
  );
}
