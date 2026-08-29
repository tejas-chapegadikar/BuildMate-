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
    <div className="shell flex-1 px-4 py-8 sm:px-6 sm:py-14 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Post a project</h1>
      <p className="mt-1.5 mb-8 max-w-lg text-sm text-[var(--text-dim)] sm:text-base">
        Keep it short — just enough for the right person to recognize
        themselves.
      </p>
      <NewPostForm />
    </div>
  );
}
