"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/util/utils";
import type { DynamicBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";

type BuildSubNavProps = {
  className?: string;
  buildNavigation?: DynamicBuildNavigation;
};

export function BuildSubNav({ className, buildNavigation }: BuildSubNavProps) {
  const pathname = usePathname();
  const tabs = buildNavigation?.tabs ?? [];
  const status = tabs.length > 0 ? "ready" : "empty";

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
            Build
          </span>
        </div>
        <div className="my-2.5 w-px shrink-0 self-stretch bg-border/60" aria-hidden />
        <nav
          className="flex min-w-0 flex-1 items-end gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Build sections"
        >
          {status === "empty" && (
            <span className="px-3 py-2.5 text-sm font-medium text-destructive">
              No Build navigation returned from dotCMS.
            </span>
          )}
          {status === "ready" && tabs.map((tab) => {
            const isActive = Boolean(
              pathname && pathname.startsWith(tab.activeHref || tab.href)
            );
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors sm:px-3.5",
                  "hover:text-foreground",
                  isActive
                    ? "border-primary-purple font-semibold text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
