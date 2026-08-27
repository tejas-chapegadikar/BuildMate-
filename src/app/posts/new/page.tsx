import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <div className="shell flex-1 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Post a project</h1>
      <p className="mt-1 mb-8 max-w-lg text-sm text-[var(--text-dim)]">
        Keep it short — just enough for the right person to recognize
        themselves.
      </p>
      <NewPostForm />
    </div>
  );
}
