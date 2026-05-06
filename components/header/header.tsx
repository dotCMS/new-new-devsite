"use client";

import { Menu, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import * as React from "react";
import { cn } from "@/util/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import ChatWithUsLink from "./ChatWithUsLink";
import DiscourseLink from "./DiscourseLink";
import GithubLink from "./GithubLink";
import { useAssistant } from "../chat/AssistantProvider";
import { useHeaderWideNav } from "@/hooks/useHeaderWideNav";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import type { NavSection } from "@/util/navTransform";
import LogoWithArrow from "./Logo/LogoWithArrow";
import { DocsQuickSearch } from "./DocsQuickSearch";
import {
  PRIMARY_DOC_TABS,
  PRIMARY_DOC_LABEL,
  type PrimaryDocTabId,
  hrefForPrimaryTab,
} from "@/components/docs/primaryNav";
import { OverviewSectionNav } from "@/components/docs/OverviewSectionNav";
import { BuildSubNav } from "@/components/docs/BuildSubNav";
import { BuildSectionNav } from "@/components/docs/BuildSectionNav";
import { ContentSubNav } from "@/components/docs/ContentSubNav";
import { ContentSectionNav } from "@/components/docs/ContentSectionNav";
import { ManageSubNav } from "@/components/docs/ManageSubNav";
import { ManageSectionNav } from "@/components/docs/ManageSectionNav";
import { ReferenceSectionNav } from "@/components/docs/ReferenceSectionNav";
import { parseBuildSubFromSearchParam } from "@/components/docs/buildNav";
import { parseContentSubFromSearchParam } from "@/components/docs/contentNav";
import { parseManageSubFromSearchParam } from "@/components/docs/manageNav";

type HeaderProps = {
  sideNavItems?: any[];
  currentPath?: string;
  navSections?: NavSection[];
  /**
   * Which primary tab is active (from `?primary=` on /docs/...). Only the docs
   * layout passes this; when omitted, no tab is highlighted.
   */
  docsPrimaryTab?: PrimaryDocTabId;
};

type HeaderPrimaryNavProps = {
  className?: string;
  /** Active tab when on `/docs/...` (from URL + shell). */
  activeTabOnDocs?: PrimaryDocTabId;
  pathname: string | null;
};

function HeaderPrimaryNav({
  className,
  activeTabOnDocs,
  pathname,
}: HeaderPrimaryNavProps) {
  return (
    <nav
      className={cn("flex min-w-0 items-center gap-0.5 sm:gap-1", className)}
      aria-label="Main"
    >
      {PRIMARY_DOC_TABS.map((id) => {
        const href = hrefForPrimaryTab(pathname, id);
        const isActive =
          pathname?.startsWith("/docs") && activeTabOnDocs != null
            ? activeTabOnDocs === id
            : false;
        return (
          <Link
            key={id}
            href={href}
            scroll={false}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium sm:px-3.5",
              "transition-[color,background-color,box-shadow] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "hover:bg-muted/70",
              isActive
                ? "bg-muted/70 font-semibold text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {PRIMARY_DOC_LABEL[id]}
          </Link>
        );
      })}
    </nav>
  );
}

type HeaderMobileNavLinksProps = {
  activeTabOnDocs?: PrimaryDocTabId;
  pathname: string | null;
  onAfterNavigate: () => void;
};

function HeaderMobileNavLinks({
  activeTabOnDocs,
  pathname,
  onAfterNavigate,
}: HeaderMobileNavLinksProps) {
  return (
    <nav className="flex flex-col" aria-label="Main">
      <div className="space-y-1">
        {PRIMARY_DOC_TABS.map((id) => {
          const href = hrefForPrimaryTab(pathname, id);
          const isActive =
            pathname?.startsWith("/docs") && activeTabOnDocs != null
              ? activeTabOnDocs === id
              : false;
          return (
            <Link
              key={id}
              href={href}
              scroll={false}
              onClick={() => onAfterNavigate()}
              className={cn(
                "flex h-9 w-full items-center justify-start rounded-md px-4 text-left text-sm font-medium transition-colors",
                "hover:bg-muted/70",
                isActive
                  ? "bg-muted/70 font-semibold text-foreground ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {PRIMARY_DOC_LABEL[id]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Header({
  sideNavItems,
  currentPath,
  navSections,
  docsPrimaryTab,
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const docsBuildSub = parseBuildSubFromSearchParam(searchParams.get("build"));
  const docsContentSub = parseContentSubFromSearchParam(
    searchParams.get("content")
  );
  const docsManageSub = parseManageSubFromSearchParam(
    searchParams.get("manage")
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open: isAssistantOpen, toggleOpen, expanded: assistantExpanded } =
    useAssistant();
  const showWideNav = useHeaderWideNav(isAssistantOpen, assistantExpanded);
  const isOnDocs = Boolean(pathname?.startsWith("/docs"));

  // Add effect to handle body scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (showWideNav) setIsMobileMenuOpen(false);
  }, [showWideNav]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full border-b bg-background">
        <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-[100vw] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left — logo and primary nav */}
          <div className="relative z-20 min-w-0 shrink-0">
            <LogoWithArrow />
          </div>

          {showWideNav && (
            <HeaderPrimaryNav
              className="ml-3 flex-1 justify-start overflow-x-auto sm:ml-5 lg:ml-8"
              activeTabOnDocs={docsPrimaryTab}
              pathname={pathname}
            />
          )}

          {/* Right — search, Ask AI, utilities */}
          <div className="relative z-20 flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
            <DocsQuickSearch
              items={sideNavItems && sideNavItems.length > 0 ? sideNavItems : undefined}
              className="max-w-lg"
            />
            <button
              type="button"
              onClick={toggleOpen}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm transition-colors",
                isAssistantOpen
                  ? "border-primary/35 bg-primary/10 text-foreground shadow-[0_0_0_1px_rgba(59,130,246,0.12)] ring-2 ring-primary/20"
                  : "border-border/70 bg-muted/45 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span>Ask AI</span>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            </button>

            <div
              className={cn(
                "flex items-center gap-0.5 sm:gap-1",
                showWideNav ? "flex" : "hidden"
              )}
            >
              <GithubLink />
              <DiscourseLink />
              <ThemeToggle />
              <ChatWithUsLink />
            </div>

            <button
              type="button"
              className={cn("p-2", showWideNav && "hidden")}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && !showWideNav && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="h-full w-full overflow-y-auto px-4 py-4 sm:px-6">
            <div className="flex flex-col h-full">
              {/* Main Navigation Links */}
              <div className="py-4">
                <HeaderMobileNavLinks
                  activeTabOnDocs={docsPrimaryTab}
                  pathname={pathname}
                  onAfterNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>

              {sideNavItems && isOnDocs && docsPrimaryTab != null && (
                <div className="mt-4 flex-1 border-t pt-4">
                  <div className="mb-2 px-2 text-sm font-medium leading-none text-muted-foreground">
                    {docsPrimaryTab === "overview"
                      ? "Overview"
                      : docsPrimaryTab === "build"
                        ? "Build"
                        : docsPrimaryTab === "content"
                          ? "Content"
                          : docsPrimaryTab === "manage"
                            ? "Manage"
                            : docsPrimaryTab === "reference"
                              ? "Reference"
                              : "Docs"}
                  </div>
                  {docsPrimaryTab === "build" && (
                    <div className="mb-4 w-full min-w-0 -mx-1 sm:-mx-2">
                      <BuildSubNav className="rounded-md border border-border/40" />
                    </div>
                  )}
                  {docsPrimaryTab === "content" && (
                    <div className="mb-4 w-full min-w-0 -mx-1 sm:-mx-2">
                      <ContentSubNav className="rounded-md border border-border/40" />
                    </div>
                  )}
                  {docsPrimaryTab === "manage" && (
                    <div className="mb-4 w-full min-w-0 -mx-1 sm:-mx-2">
                      <ManageSubNav className="rounded-md border border-border/40" />
                    </div>
                  )}
                  {docsPrimaryTab === "overview" ? (
                    <OverviewSectionNav isMobile />
                  ) : docsPrimaryTab === "build" ? (
                    <BuildSectionNav isMobile buildSub={docsBuildSub} />
                  ) : docsPrimaryTab === "content" ? (
                    <ContentSectionNav isMobile contentSub={docsContentSub} />
                  ) : docsPrimaryTab === "manage" ? (
                    <ManageSectionNav isMobile manageSub={docsManageSub} />
                  ) : docsPrimaryTab === "reference" ? (
                    <ReferenceSectionNav isMobile />
                  ) : (
                    <RedesignedNavTree
                      currentPath={currentPath}
                      isMobile={true}
                      initialSections={navSections}
                    />
                  )}
                </div>
              )}

              {sideNavItems && !isOnDocs && (
                <div className="mt-4 flex-1 border-t pt-4">
                  <div className="mb-4 px-2 text-sm font-medium leading-none text-muted-foreground">
                    Docs
                  </div>
                  <RedesignedNavTree
                    currentPath={currentPath}
                    isMobile={true}
                    initialSections={navSections}
                  />
                </div>
              )}

              {/* External Links and Theme Toggle */}
              <div className="border-t py-4 mt-4">
                <div className="flex items-center gap-2 px-2">
                  <GithubLink />
                  <DiscourseLink />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
