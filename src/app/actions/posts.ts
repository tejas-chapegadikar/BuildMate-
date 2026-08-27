"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreatePostState = { error?: string } | undefined;

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const title = String(formData.get("title") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const lookingForRaw = String(formData.get("looking_for") ?? "").trim();

  if (!title || !pitch || !lookingForRaw) {
    return { error: "Please fill in the project, pitch, and what you're looking for." };
  }

  const looking_for = lookingForRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, pitch, looking_for, author_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Couldn't create the post. Please try again." };
  }

  revalidatePath("/browse");
  redirect(`/posts/${data.id}`);
}

export async function closePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("posts")
    .update({ status: "closed" })
    .eq("id", postId)
    .eq("author_id", user.id);

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/browse");
}
