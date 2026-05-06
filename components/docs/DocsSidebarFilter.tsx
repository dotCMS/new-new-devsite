"use client";

import * as React from "react";
import { CornerDownLeft } from "lucide-react";
import { cn } from "@/util/utils";

type DocsSidebarFilterProps = {
  className?: string;
};

export function DocsSidebarFilter({ className }: DocsSidebarFilterProps) {
  return (
    <div
      className={cn(
        "border-b border-border/60 px-4 pb-3 pt-4 sm:px-5",
        className
      )}
    >
      <div className="relative">
        <input
          type="search"
          placeholder="Filter"
          aria-label="Filter navigation"
          className={cn(
            "h-9 w-full rounded-xl border border-border bg-background py-2 pl-3 pr-9 text-sm shadow-sm",
            "text-foreground placeholder:text-muted-foreground",
            "outline-none transition-[box-shadow,border-color,background-color]",
            "focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/15"
          )}
        />
        <CornerDownLeft
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  );
}
