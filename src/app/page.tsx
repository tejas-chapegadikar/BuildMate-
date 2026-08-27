import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/browse");
  }

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">hackermatch</h1>
        <p className="text-sm text-neutral-500">
          Find a partner for the project you&apos;re building. Post what
          you&apos;re working on and what skill you&apos;re missing —
          applicants sign in with GitHub, so their skills are real.
        </p>
      </div>
      <GitHubSignInButton />
    </div>
  );
}
