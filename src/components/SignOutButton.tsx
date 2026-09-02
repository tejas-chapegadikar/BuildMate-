"use client";

import { REMEMBERED_ACCOUNTS_KEY } from "./account-storage";

/**
 * Sign-out control. Before handing off to the server route, it wipes this
 * browser's remembered-accounts list, so the next person to sign in on
 * the same machine gets a clean "Continue with GitHub" button instead of
 * a stale "Continue as @previous-user" suggestion.
 */
export function SignOutButton() {
  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => {
        try {
          localStorage.removeItem(REMEMBERED_ACCOUNTS_KEY);
        } catch {
          // localStorage unavailable (private browsing, etc.) — nothing to clear
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full p-2 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
        aria-label="Sign out"
      >
        <SignOutIcon />
      </button>
    </form>
  );
}

function SignOutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
