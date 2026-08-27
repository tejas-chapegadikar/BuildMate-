export function SetupNotice() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Supabase isn&apos;t configured yet</h1>
      <p className="text-sm text-[var(--text-dim)]">
        hackermatch needs a Supabase project to handle GitHub sign-in and
        storage. Copy{" "}
        <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
          .env.local.example
        </code>{" "}
        to{" "}
        <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
          .env.local
        </code>{" "}
        and fill in your project&apos;s URL and anon key, then restart{" "}
        <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
          npm run dev
        </code>
        .
      </p>
      <p className="text-sm text-[var(--text-dim)]">
        Full setup steps (Supabase project, GitHub OAuth App, DB schema) are
        in{" "}
        <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
          README.md
        </code>
        .
      </p>
    </div>
  );
}
