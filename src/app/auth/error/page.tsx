import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold">Sign-in failed</h1>
      <p className="text-sm text-[var(--text-dim)]">
        Something went wrong while signing you in with GitHub. Please try again.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back home
      </Link>
    </div>
  );
}
