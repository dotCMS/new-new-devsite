"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer, activeChapterIndex } from "./PlayerProvider";

/** Format seconds as M:SS or H:MM:SS. */
function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function CourseSidebar({ course, courseSlug }) {
  const pathname = usePathname();
  const { chapters, currentTime, seek } = usePlayer();

  const introActive = pathname === `/learn/${courseSlug}`;
  const activeChIndex = activeChapterIndex(chapters, currentTime);

  return (
    <aside className="w-80 shrink-0 border-r border-border p-6 overflow-y-auto">
      <nav aria-label={course.title ? `${course.title} chapters` : "Course chapters"}>
        <ol className="space-y-1">
          <li>
            <Link
              href={`/learn/${courseSlug}`}
              className={`flex w-full items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-accent ${introActive ? "bg-primary/20" : ""}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs transition-colors ${introActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                0
              </span>
              <span className={`text-sm transition-colors ${introActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Introduction
              </span>
            </Link>
          </li>
          {course.chapters.map((chapter, index) => {
            const chapterSlug = `chapter-${index + 1}`;
            const isActive = pathname === `/learn/${courseSlug}/${chapterSlug}`;
            // The active lesson shows its video chapters as an accordion body.
            const showChapters = isActive && chapters.length > 0;
            return (
              <li key={index}>
                <Link
                  href={`/learn/${courseSlug}/${chapterSlug}`}
                  className={`flex w-full items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-accent ${isActive ? "bg-primary/20" : ""}`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm transition-colors ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {chapter.title}
                  </span>
                </Link>

                {showChapters && (
                  <ol
                    aria-label={`${chapter.title} video chapters`}
                    className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3"
                  >
                    {chapters.map((ch, i) => {
                      const isCurrentCh = i === activeChIndex;
                      return (
                        <li key={`${ch.start}-${i}`}>
                          <button
                            type="button"
                            onClick={() => seek(ch.start)}
                            aria-current={isCurrentCh ? "true" : undefined}
                            className={`flex w-full items-baseline gap-2 rounded px-2 py-1 text-left text-xs transition-colors hover:bg-accent ${
                              isCurrentCh ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}
                          >
                            <span className="shrink-0 font-mono tabular-nums opacity-70">
                              {formatTime(ch.start)}
                            </span>
                            <span className="min-w-0 break-words">{ch.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
