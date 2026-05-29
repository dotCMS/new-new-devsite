"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/util/utils";
import { DocsSidebarFilter } from "./DocsSidebarFilter";
import {
  type BuildNavLink,
  type BuildNavSection,
} from "./buildNavData";
import type {
  DynamicBuildNavigation,
  DynamicBuildSubTab,
} from "@/services/docs/getDotCMSBuildNavigation";

const SIDEBAR_BG = "bg-[#F6F6F7] dark:bg-muted/25";
const EMPTY_BUILD_TABS: DynamicBuildSubTab[] = [];
const EMPTY_BUILD_NAV_BY_SUB_TAB: Record<string, BuildNavSection[]> = {};

type NavRowProps = {
  item: BuildNavLink;
  isActive: boolean;
};

function NavRow({ item, isActive }: NavRowProps) {
  const rowClassName = cn(
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
  );

  const content = (
    <>
      <span
        className={cn(
          "h-4 w-1 shrink-0 rounded-full",
          isActive ? "bg-primary-purple" : "bg-transparent"
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">{item.label}</span>
    </>
  );

  return (
    <li className="list-none">
      {item.href ? (
        <Link href={item.href} target={item.target} className={rowClassName}>
          {content}
        </Link>
      ) : (
        <span className={rowClassName}>{content}</span>
      )}
    </li>
  );
}

type BuildSectionNavProps = {
  buildSub?: string;
  className?: string;
  isMobile?: boolean;
  buildNavigation?: DynamicBuildNavigation;
};

export function BuildSectionNav({
  buildSub,
  className,
  isMobile = false,
  buildNavigation,
}: BuildSectionNavProps) {
  const pathname = usePathname();
  const tabs = buildNavigation?.tabs ?? EMPTY_BUILD_TABS;
  const dynamicNavBySubTab =
    buildNavigation?.navBySubTab ?? EMPTY_BUILD_NAV_BY_SUB_TAB;
  const status = Object.keys(dynamicNavBySubTab).length > 0 ? "ready" : "empty";
  const activeTab = React.useMemo(
    () =>
      tabs
        .filter((tab) => pathname?.startsWith(tab.activeHref || tab.href))
        .sort(
          (a, b) =>
            (b.activeHref || b.href).length - (a.activeHref || a.href).length
        )[0],
    [pathname, tabs]
  );
  const activeSubTab = activeTab?.id ?? buildSub ?? "";
  const sections = dynamicNavBySubTab[activeSubTab] ?? [];

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
        className={cn("min-h-0", isMobile && scrollClass, "pt-0")}
      >
        <DocsSidebarFilter />
        <div className="pt-4">
          {status === "empty" && (
            <div className={cn(paddingX, "text-sm font-medium text-destructive")}>
              No Build navigation returned from dotCMS.
            </div>
          )}
          {status === "ready" && sections.length === 0 && (
            <div className={cn(paddingX, "text-sm font-medium text-destructive")}>
              No Build side nav found for <code>{activeSubTab || pathname}</code>.
            </div>
          )}
          {status === "ready" && sections.map((section, sectionIndex) => (
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
                      isActive={pathname === item.href}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={cn("h-4", paddingX)} aria-hidden />
      </div>
    </div>
  );
}
