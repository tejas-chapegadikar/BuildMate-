"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GitHubSignInButton } from "./GitHubSignInButton";
import { REMEMBERED_ACCOUNTS_KEY, type RememberedAccount } from "./account-storage";

export function AccountChooser() {
  // null = "haven't checked localStorage yet" (matches server render, avoids
  // a hydration mismatch); becomes an array right after mount.
  const [accounts, setAccounts] = useState<RememberedAccount[] | null>(null);

  useEffect(() => {
    // One-time read of a browser-only API after mount — there's no way to
    // do this during render without either crashing SSR or mismatching
    // hydration, so this sync setState is intentional and safe here.
    try {
      const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccounts(raw ? JSON.parse(raw) : []);
    } catch {
      setAccounts([]);
    }
  }, []);

  function forget(username: string) {
    const next = (accounts ?? []).filter((a) => a.username !== username);
    setAccounts(next);
    try {
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  // Before we've checked localStorage (or if it's empty), render the plain
  // default button so there's no flash of a different layout once it loads.
  if (!accounts || accounts.length === 0) {
    return <GitHubSignInButton />;
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      {accounts.map((account) => (
        <div key={account.username} className="group relative">
          <GitHubSignInButton
            suggestedLogin={account.username}
            label={`Continue as @${account.username}`}
            hideIcon={!!account.avatarUrl}
            className={`btn-secondary w-full justify-start gap-3 pr-8 ${account.avatarUrl ? "pl-10" : "pl-3"}`}
          />
          {account.avatarUrl && (
            <Image
              src={account.avatarUrl}
              alt=""
              width={20}
              height={20}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 rounded-full"
            />
          )}
          <button
            type="button"
            onClick={() => forget(account.username)}
            aria-label={`Forget @${account.username}`}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[var(--text-faint)] opacity-0 transition-opacity hover:text-[var(--text)] group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
      <GitHubSignInButton
        forcePicker
        label="Use a different account"
        className="btn-ghost self-start"
      />
    </div>
  );
}
