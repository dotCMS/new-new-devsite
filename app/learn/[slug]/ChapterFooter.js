import Link from "next/link";

export default function ChapterFooter({ courseSlug, currentIndex, chapters }) {
  const isLast = currentIndex === chapters.length - 1;

  const nextIndex = currentIndex + 1;
  const nextChapter = chapters[nextIndex];
  const nextHref = nextChapter ? `/learn/${courseSlug}/chapter-${nextIndex + 1}` : null;

  return (
    <div className="mt-16 space-y-4">
      {/* Next up */}
      {!isLast && nextChapter && (
        <div className="flex items-center justify-between rounded-lg border border-white/10 px-5 py-4">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Next up</p>
            <p className="text-sm font-medium text-white">Chapter {nextIndex + 1}: {nextChapter.title}</p>
          </div>
          <Link
            href={nextHref}
            className="ml-6 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue →
          </Link>
        </div>
      )}

      {isLast && (
        <div className="flex items-center justify-between rounded-lg border border-white/10 px-5 py-4">
          <p className="text-sm font-medium text-white">You&apos;ve completed the course!</p>
          <Link
            href={`/learn/${courseSlug}`}
            className="ml-6 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to Overview
          </Link>
        </div>
      )}
    </div>
  );
}
