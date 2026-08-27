import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";

export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/browse");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="chip">for builders, not resumes</span>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your <span className="gradient-text">co-builder</span>.
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--text-dim)] sm:text-base">
          Post what you&apos;re building and what you&apos;re missing.
          Sign in with GitHub — no fluffed-up bios, just real code to back
          up the skills.
        </p>
      </div>

      <GitHubSignInButton />

      <p className="text-xs text-[var(--text-faint)]">
        Your GitHub is the resume. That&apos;s the whole pitch.
      </p>
    </div>
  );
}
