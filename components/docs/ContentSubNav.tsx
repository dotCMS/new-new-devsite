"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/util/utils";
import {
  CONTENT_SUB_TABS,
  CONTENT_SUB_LABEL,
  hrefForContentSubNav,
  parseContentSubFromSearchParam,
} from "./contentNav";

type ContentSubNavProps = {
  className?: string;
};

export function ContentSubNav({ className }: ContentSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contentSub = parseContentSubFromSearchParam(
    searchParams.get("content")
  );

  return (
    <div
      className={cn(
        "sticky top-16 z-40 w-full border-b border-border/50 bg-[#fdfdfd] dark:bg-muted/15",
        className
      )}
    >
      <div className="mx-auto flex w-full min-w-0 items-stretch gap-0 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center py-2.5 pr-3 sm:pr-4">
          <span className="text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
            Author
          </span>
        </div>
        <div
          className="my-2.5 w-px shrink-0 self-stretch bg-border/60"
          aria-hidden
        />
        <nav
          className="flex min-w-0 flex-1 items-end gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Author sections"
        >
          {CONTENT_SUB_TABS.map((id) => {
            const href = hrefForContentSubNav(pathname, id);
            const isActive = contentSub === id;
            return (
              <Link
                key={id}
                href={href}
                scroll={false}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors sm:px-3.5",
                  "hover:text-foreground",
                  isActive
                    ? "border-primary-purple font-semibold text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {CONTENT_SUB_LABEL[id]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
