import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Best-effort transactional email. Never throws — a failed or skipped
 * (no RESEND_API_KEY set) email should never break the mutation it's
 * attached to. Uses Resend's shared test sender so it works without a
 * verified domain; swap `from` once you've verified one.
 */
export async function sendNotificationEmail(opts: {
  to: string | null | undefined;
  subject: string;
  html: string;
}) {
  if (!opts.to) return;

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${opts.subject}" to ${opts.to}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "BuildMate <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (error) {
    console.error("[email] send failed", error);
  }
}
