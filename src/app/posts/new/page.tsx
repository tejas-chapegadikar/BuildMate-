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
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Post a project</h1>
      <p className="mt-1 mb-8 text-sm text-[var(--text-dim)]">
        Keep it short — just enough for the right person to recognize
        themselves.
      </p>
      <NewPostForm />
    </div>
  );
}
