"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
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
  await notifyNewApplication(supabase, postId);
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

  const { data: application } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select("applicant_id")
    .single();

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me");

  if (status === "accepted" && application) {
    await notifyAccepted(supabase, postId, application.applicant_id);
  }
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

// --- notifications (best-effort, never block the mutation above) ---

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function notifyNewApplication(supabase: SupabaseClient, postId: string) {
  try {
    const { data: post } = await supabase
      .from("posts")
      .select("title, author_id")
      .eq("id", postId)
      .single();
    if (!post) return;

    const { data: email } = await supabase.rpc("get_counterpart_email", {
      post_id: postId,
      target_user_id: post.author_id,
    });

    await sendNotificationEmail({
      to: email,
      subject: `New applicant for "${post.title}"`,
      html: `<p>Someone applied to your project <strong>${escapeHtml(post.title)}</strong> on BuildMate.</p>
             <p><a href="${appUrl()}/posts/${postId}">Review the application</a></p>`,
    });
  } catch (error) {
    console.error("[notifyNewApplication] failed", error);
  }
}

async function notifyAccepted(supabase: SupabaseClient, postId: string, applicantId: string) {
  try {
    const { data: post } = await supabase
      .from("posts")
      .select("title")
      .eq("id", postId)
      .single();
    if (!post) return;

    const { data: email } = await supabase.rpc("get_counterpart_email", {
      post_id: postId,
      target_user_id: applicantId,
    });

    await sendNotificationEmail({
      to: email,
      subject: `You're in! "${post.title}" accepted your application`,
      html: `<p>Your application to <strong>${escapeHtml(post.title)}</strong> on BuildMate was accepted.</p>
             <p><a href="${appUrl()}/posts/${postId}">Reach out and take it from here</a></p>`,
    });
  } catch (error) {
    console.error("[notifyAccepted] failed", error);
  }
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
