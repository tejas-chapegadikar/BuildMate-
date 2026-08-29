"use client";

import { useEffect } from "react";
import { REMEMBERED_ACCOUNTS_KEY, type RememberedAccount } from "./account-storage";

/**
 * Invisible — runs once per authenticated page load and appends the
 * current user to the browser's local "recently used accounts" list, so
 * the sign-in screen can offer a "Continue as @you" shortcut next time.
 * Nothing here ever touches a password or a session token — just the
 * username/avatar, and only in this browser's localStorage.
 */
export function RememberAccount({ username, avatarUrl }: RememberedAccount) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
      const list: RememberedAccount[] = raw ? JSON.parse(raw) : [];
      const next = [
        { username, avatarUrl },
        ...list.filter((a) => a.username !== username),
      ].slice(0, 4);
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private browsing, etc.) — fine to skip
    }
  }, [username, avatarUrl]);

  return null;
}
