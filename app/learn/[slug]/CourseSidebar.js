"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CourseSidebar({ course, courseSlug }) {
  const pathname = usePathname();

  const introActive = pathname === `/learn/${courseSlug}`;

  return (
    <aside className="w-72 shrink-0 border-r border-border p-6 overflow-y-auto">
      <p className="text-sm text-muted-foreground mb-4">{course.title}</p>
      <nav>
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
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
