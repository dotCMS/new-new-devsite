"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CourseSidebar({ course, courseSlug }) {
  const pathname = usePathname();

  const introActive = pathname === `/learn/${courseSlug}`;

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 p-6 overflow-y-auto">
      <p className="text-sm text-white/50 mb-4">{course.title}</p>
      <nav>
        <ol className="space-y-1">
          <li>
            <Link
              href={`/learn/${courseSlug}`}
              className={`flex w-full items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-white/5 ${introActive ? "bg-primary/20" : ""}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs transition-colors ${introActive ? "border-primary bg-primary text-white" : "border-white/20 text-white/50"}`}>
                0
              </span>
              <span className={`text-sm transition-colors ${introActive ? "text-white" : "text-white/60"}`}>
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
                  className={`flex w-full items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-white/5 ${isActive ? "bg-primary/20" : ""}`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs transition-colors ${isActive ? "border-primary bg-primary text-white" : "border-white/20 text-white/50"}`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm transition-colors ${isActive ? "text-white" : "text-white/60"}`}>
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
