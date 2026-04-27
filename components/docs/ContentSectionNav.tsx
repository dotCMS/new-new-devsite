"use client";

import * as React from "react";
import { cn } from "@/util/utils";
import type { ContentSubTabId } from "./contentNav";
import {
  contentNavBySubTab,
  firstContentActiveId,
  type ContentNavLink,
} from "./contentNavData";

const SIDEBAR_BG = "bg-[#F6F6F7] dark:bg-muted/25";

type NavRowProps = {
  item: ContentNavLink;
  isActive: boolean;
  onSelect: (id: string) => void;
};

function NavRow({ item, isActive, onSelect }: NavRowProps) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 text-left text-sm",
          "py-1.5 pl-2.5",
          "-mr-3 pr-3",
          "text-muted-foreground transition-colors",
          !isActive && "hover:bg-muted/80 hover:text-foreground",
          isActive && [
            "font-semibold text-foreground",
            "rounded-xl bg-background shadow-sm",
            "hover:bg-background",
          ],
        )}
      >
        <span
          className={cn(
            "h-4 w-1 shrink-0 rounded-full",
            isActive ? "bg-primary-purple" : "bg-transparent"
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">{item.label}</span>
      </button>
    </li>
  );
}

type ContentSectionNavProps = {
  contentSub: ContentSubTabId;
  className?: string;
  isMobile?: boolean;
};

export function ContentSectionNav({
  contentSub,
  className,
  isMobile = false,
}: ContentSectionNavProps) {
  const blocks = contentNavBySubTab[contentSub];
  const [activeId, setActiveId] = React.useState<string | null>(() =>
    firstContentActiveId(blocks) || null
  );

  React.useEffect(() => {
    const next = contentNavBySubTab[contentSub];
    setActiveId(firstContentActiveId(next) || null);
  }, [contentSub]);

  const paddingX = isMobile ? "pl-5 pr-3" : "pl-6 pr-3 sm:pl-7";
  const scrollClass = isMobile ? "max-h-[50vh] overflow-y-auto" : "";

  return (
    <div
      className={cn(
        SIDEBAR_BG,
        "border-border/60",
        isMobile
          ? "w-full border-t py-3"
          : "sticky top-16 z-10 h-[calc(100vh-4rem)] w-full min-h-0 overflow-y-auto",
        className
      )}
    >
      <div
        className={cn("min-h-0", isMobile && scrollClass, "pt-6 sm:pt-7")}
      >
        {blocks.map((block, blockIndex) => {
          if (block.kind === "section") {
            return (
              <div
                key={block.id}
                className={cn(
                  paddingX,
                  blockIndex > 0 && "mt-7 border-t border-border/50 pt-6"
                )}
              >
                <h2 className="pl-2.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-foreground/80">
                  {block.title}
                </h2>
                <ul className="mt-1.5 space-y-0 pb-0.5">
                  {block.items.map((item) => (
                    <NavRow
                      key={item.id}
                      item={item}
                      isActive={activeId === item.id}
                      onSelect={setActiveId}
                    />
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <div
              key={block.item.id}
              className={cn(paddingX, blockIndex > 0 && "mt-4")}
            >
              <ul className="space-y-0 pb-0.5">
                <NavRow
                  item={block.item}
                  isActive={activeId === block.item.id}
                  onSelect={setActiveId}
                />
              </ul>
            </div>
          );
        })}
        <div className={cn("h-4", paddingX)} aria-hidden />
      </div>
    </div>
  );
}
