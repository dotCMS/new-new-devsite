"use client";

import * as React from "react";
import { cn } from "@/util/utils";
import type { BuildSubTabId } from "./buildNav";
import {
  buildNavBySubTab,
  firstActiveId,
  type BuildNavLink,
} from "./buildNavData";

const SIDEBAR_BG = "bg-[#F6F6F7] dark:bg-muted/25";

type NavRowProps = {
  item: BuildNavLink;
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

type BuildSectionNavProps = {
  buildSub: BuildSubTabId;
  className?: string;
  isMobile?: boolean;
};

export function BuildSectionNav({
  buildSub,
  className,
  isMobile = false,
}: BuildSectionNavProps) {
  const sections = buildNavBySubTab[buildSub];
  const [activeId, setActiveId] = React.useState<string | null>(() =>
    firstActiveId(sections) || null
  );

  React.useEffect(() => {
    const next = buildNavBySubTab[buildSub];
    setActiveId(firstActiveId(next) || null);
  }, [buildSub]);

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
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={cn(
              paddingX,
              sectionIndex > 0 && "mt-7 border-t border-border/50 pt-6"
            )}
          >
            <h2 className="pl-2.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-foreground/80">
              {section.title}
            </h2>
            <ul className="mt-1.5 space-y-0 pb-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  onSelect={setActiveId}
                />
              ))}
            </ul>
          </div>
        ))}
        <div className={cn("h-4", paddingX)} aria-hidden />
      </div>
    </div>
  );
}
