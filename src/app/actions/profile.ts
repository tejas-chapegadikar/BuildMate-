"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateContactState = { error?: string; success?: boolean } | undefined;

export async function updateContact(
  _prevState: UpdateContactState,
  formData: FormData
): Promise<UpdateContactState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const contact = String(formData.get("contact") ?? "").trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ contact })
    .eq("id", user.id);

  if (error) {
    return { error: "Couldn't save your contact info. Please try again." };
  }

  revalidatePath("/me");
  return { success: true };
}
