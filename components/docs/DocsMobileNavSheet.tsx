"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BuildSectionNav } from "./BuildSectionNav";
import type { DynamicBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";
import { cn } from "@/util/utils";

type DocsMobileNavSheetProps = {
  buildNavigation?: DynamicBuildNavigation;
  className?: string;
};

/** Left-rail section pages drawer for viewports below `lg`. */
export function DocsMobileNavSheet({
  buildNavigation,
  className,
}: DocsMobileNavSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-background px-2.5 text-xs font-medium text-muted-foreground",
          "hover:bg-muted/70 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          className,
        )}
      >
        <PanelLeft className="h-3.5 w-3.5" />
        Section pages
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(20rem,90vw)] p-0">
        <SheetHeader className="border-b border-border/60 px-4 py-3 text-left">
          <SheetTitle className="text-sm font-semibold">Section pages</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          <BuildSectionNav isMobile buildNavigation={buildNavigation} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
