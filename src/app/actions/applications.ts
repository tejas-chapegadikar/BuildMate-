"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";

export type ApplyState = { error?: string; success?: boolean } | undefined;

export async function applyToPost(
  postId: string,
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const message = String(formData.get("message") ?? "").trim() || null;

  const { error } = await supabase
    .from("applications")
    .insert({ post_id: postId, applicant_id: user.id, message });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already applied to this project." };
    }
    return { error: "Couldn't submit your application. Please try again." };
  }

  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  postId: string,
  status: Extract<ApplicationStatus, "accepted" | "rejected">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me");
}

export async function withdrawApplication(applicationId: string, postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me");
}
