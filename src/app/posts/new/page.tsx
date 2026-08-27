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
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-1 text-lg font-semibold">Post a project</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Keep it short — just enough for the right person to recognize
        themselves.
      </p>
      <NewPostForm />
    </div>
  );
}
