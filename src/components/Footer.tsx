export function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="shell flex flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-10">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-md bg-[var(--accent)] text-[0.6rem] font-bold text-[var(--accent-ink)]">
            B
          </span>
          <span className="text-sm font-medium">BuildMate</span>
          <span className="text-xs text-[var(--text-faint)]">
            &middot; find your co-builder
          </span>
        </div>
        <p className="text-xs text-[var(--text-faint)]">
          &copy; {new Date().getFullYear()} BuildMate. Built for people
          shipping something, not job hunting.
        </p>
      </div>
    </footer>
  );
}
