"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleBookmark(postId: string, isBookmarked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (isBookmarked) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/browse");
  revalidatePath("/me");
  revalidatePath(`/posts/${postId}`);
}
