"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/util/utils";
import {
  resolveActivePrimaryNav,
  resolveCanonicalDocsPathname,
  type DynamicBuildNavigation,
} from "@/services/docs/getDotCMSBuildNavigation";
import { ReorderMenuButton } from "@/components/editor/ReorderMenuButton";
import { docsSubNavStickyClass } from "./docsChrome";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BuildSubNavProps = {
  className?: string;
  buildNavigation?: DynamicBuildNavigation;
  /** Optional control rendered on the right (e.g. mobile pages sheet). */
  trailing?: ReactNode;
};

export function BuildSubNav({
  className,
  buildNavigation,
  trailing,
}: BuildSubNavProps) {
  const pathname = usePathname();
  const effectivePath =
    resolveCanonicalDocsPathname(buildNavigation, pathname) || pathname;
  const { primaryTab, tabs } = resolveActivePrimaryNav(buildNavigation, pathname);
  const sectionLabel = primaryTab?.label ?? "Docs";
  const status = tabs.length > 0 ? "ready" : "empty";
  const primaryTabs = buildNavigation?.primaryTabs ?? [];
  const activeSubTab = tabs
    .filter((tab) =>
      effectivePath?.startsWith(tab.activeHref || tab.href),
    )
    .sort(
      (a, b) =>
        (b.activeHref || b.href).length - (a.activeHref || a.href).length,
    )[0];
  const subSectionLabel = activeSubTab?.label ?? null;

  return (
    <div
      className={cn(
        docsSubNavStickyClass,
        "w-full border-b border-border/50 bg-[#fdfdfd] dark:bg-background",
        className,
      )}
    >
      <div className="mx-auto flex w-full min-w-0 items-stretch gap-0 px-4 sm:px-6 lg:px-8">
        {/* Narrow: primary dropdown + current subsection label + Pages */}
        <div className="flex min-w-0 flex-1 items-center gap-2 py-2 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex min-w-0 shrink items-center gap-1.5 rounded-md px-2 py-1.5 text-left",
                "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
                "outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary/20",
              )}
            >
              <span className="truncate">{sectionLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[14rem]">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide">
                Docs sections
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {primaryTabs.map((primary) => {
                const sectionNav = buildNavigation?.navByPrimaryTab?.[primary.id];
                const sectionTabs = sectionNav?.tabs ?? [];
                if (sectionTabs.length === 0) {
                  return (
                    <DropdownMenuItem key={primary.id} asChild>
                      <Link href={primary.href}>{primary.label}</Link>
                    </DropdownMenuItem>
                  );
                }
                return (
                  <DropdownMenuSub key={primary.id}>
                    <DropdownMenuSubTrigger>
                      {primary.label}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[12rem]">
                      {sectionTabs.map((tab) => (
                        <DropdownMenuItem key={tab.id} asChild>
                          <Link href={tab.href}>{tab.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <ReorderMenuButton
            startLevel={3}
            depth={1}
            label={`Reorder ${sectionLabel} sub-navigation`}
            className="scale-90"
          />
          {subSectionLabel ? (
            <span
              className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-foreground"
              aria-current="location"
            >
              {subSectionLabel}
            </span>
          ) : (
            <span className="min-w-0 flex-1" aria-hidden />
          )}
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>

        {/* Wide: static label + horizontal tabs (same lg breakpoint as header wide nav) */}
        <div className="hidden min-w-0 flex-1 items-stretch gap-0 lg:flex">
          <div className="flex shrink-0 items-center gap-2 py-2.5 pr-3 sm:pr-4">
            <span className="text-[11px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
              {sectionLabel}
            </span>
            <ReorderMenuButton
              startLevel={3}
              depth={1}
              label={`Reorder ${sectionLabel} sub-navigation`}
              className="scale-90"
            />
          </div>
          <div
            className="my-2.5 w-px shrink-0 self-stretch bg-border/60"
            aria-hidden
          />
          <nav
            className="flex min-w-0 flex-1 items-end gap-0 overflow-hidden"
            aria-label={`${sectionLabel} sections`}
          >
            {status === "empty" && (
              <span className="px-3 py-2.5 text-sm font-medium text-destructive">
                No {sectionLabel} navigation returned from dotCMS.
              </span>
            )}
            {status === "ready" &&
              tabs.map((tab) => {
                const isActive = Boolean(
                  effectivePath &&
                    effectivePath.startsWith(tab.activeHref || tab.href),
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
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>
    </div>
  );
}
