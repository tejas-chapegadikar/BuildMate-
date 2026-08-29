import { toggleBookmark } from "@/app/actions/bookmarks";

export function BookmarkButton({
  postId,
  isBookmarked,
  className,
}: {
  postId: string;
  isBookmarked: boolean;
  className?: string;
}) {
  return (
    <form action={toggleBookmark.bind(null, postId, isBookmarked)} className={className}>
      <button
        type="submit"
        aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
        aria-pressed={isBookmarked}
        className="grid size-8 place-items-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      >
        <BookmarkIcon filled={isBookmarked} />
      </button>
    </form>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={filled ? "text-[var(--accent)]" : undefined}
    >
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
