"use client";

import { Menu, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import * as React from "react";
import { cn } from "@/util/utils";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChatWithUsLink from "./ChatWithUsLink";
import DiscourseLink from "./DiscourseLink";
import GithubLink from "./GithubLink";
import { useAssistant } from "../chat/AssistantProvider";
import { useHeaderWideNav } from "@/hooks/useHeaderWideNav";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import type { NavSection } from "@/util/navTransform";
import LogoWithArrow from "./Logo/LogoWithArrow";
import { DocsQuickSearch } from "./DocsQuickSearch";
import type {
  DynamicBuildSubTab,
  DynamicBuildNavigation,
} from "@/services/docs/getDotCMSBuildNavigation";
import { resolveCanonicalDocsPathname } from "@/services/docs/getDotCMSBuildNavigation";
import { isDocsExperiencePath } from "@/config/docs-path-roots";
import { ReorderMenuButton } from "@/components/editor/ReorderMenuButton";
import { useIsEditMode } from "@/hooks/useIsEditMode";
import {
  HeaderSiteDesktopNav,
  HeaderSiteMobileNav,
} from "./HeaderSiteNav";

type HeaderProps = {
  sideNavItems?: any[];
  currentPath?: string;
  navSections?: NavSection[];
  primaryNavItems?: DynamicBuildSubTab[];
  /** Full build-nav tree — used to map flat `/docs/{slug}` URLs to nested hrefs for active state. */
  buildNavigation?: DynamicBuildNavigation;
};

type HeaderPrimaryNavProps = {
  className?: string;
  pathname: string | null;
  primaryNavItems?: DynamicBuildSubTab[];
};

function HeaderPrimaryNav({
  className,
  pathname,
  primaryNavItems,
}: HeaderPrimaryNavProps) {
  if (primaryNavItems === undefined) {
    return null;
  }

  return (
    <nav
      className={cn("flex min-w-0 items-center gap-0.5 sm:gap-1", className)}
      aria-label="Main"
    >
      {primaryNavItems.length === 0 ? (
        <span className="px-3 py-1.5 text-sm font-medium text-destructive">
          No primary navigation returned from dotCMS.
        </span>
      ) : (
        primaryNavItems.map((item) => {
          const isActive = Boolean(
            pathname && pathname.startsWith(item.activeHref || item.href)
          );
          return (
            <Link
              key={item.id}
              href={item.href}
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
              {item.label}
            </Link>
          );
        })
      )}
    </nav>
  );
}

export default function Header({
  sideNavItems,
  currentPath,
  navSections,
  primaryNavItems,
  buildNavigation,
}: HeaderProps) {
  const pathname = usePathname();
  const activePathname =
    resolveCanonicalDocsPathname(buildNavigation, pathname) || pathname;
  const isEditMode = useIsEditMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentOpenMenu, setCurrentOpenMenu] = useState<string | undefined>(
    undefined
  );
  const [mobileMenuTop, setMobileMenuTop] = useState(64);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const { open: isAssistantOpen, toggleOpen, expanded: assistantExpanded } =
    useAssistant();
  const showWideNav = useHeaderWideNav(isAssistantOpen, assistantExpanded);
  const isOnDocs = Boolean(pathname?.startsWith("/docs"));
  const isDocsChrome = isDocsExperiencePath(pathname);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (showWideNav) setIsMobileMenuOpen(false);
  }, [showWideNav]);

  useEffect(() => {
    setCurrentOpenMenu(undefined);
  }, [pathname]);

  // Anchor the overlay below the sticky header bar (accounts for BSL banner
  // still in document flow when scrolled to top).
  useLayoutEffect(() => {
    if (!isMobileMenuOpen) return;

    const updateTop = () => {
      const el = headerBarRef.current;
      if (!el) return;
      setMobileMenuTop(el.getBoundingClientRect().bottom);
    };

    updateTop();
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, true);
    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop, true);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip">
      <div
        ref={headerBarRef}
        className="relative z-[60] w-full border-b bg-background"
      >
        <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-[100vw] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left — logo and primary nav */}
          <div className="relative z-20 flex min-w-0 shrink-0 items-center gap-2">
            <LogoWithArrow />
            {isEditMode && isDocsChrome && (
              <ReorderMenuButton
                startLevel={2}
                depth={1}
                label="Reorder primary navigation"
              />
            )}
          </div>

          {showWideNav &&
            (isDocsChrome ? (
              <HeaderPrimaryNav
                className="ml-3 min-w-0 flex-1 justify-start overflow-hidden sm:ml-5 lg:ml-8"
                pathname={activePathname}
                primaryNavItems={primaryNavItems}
              />
            ) : (
              <div className="ml-3 flex min-w-0 flex-1 justify-start overflow-hidden sm:ml-5 lg:ml-8">
                <HeaderSiteDesktopNav
                  currentOpenMenu={currentOpenMenu}
                  setCurrentOpenMenu={setCurrentOpenMenu}
                />
              </div>
            ))}

          {/* Right — search, Ask AI, utilities */}
          <div className="relative z-20 flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
            <DocsQuickSearch className="max-w-lg" />
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
              className={cn("relative z-[70] p-2", showWideNav && "hidden")}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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

      {/* Mobile menu: site chrome always (docs sections live in BuildSubNav). */}
      {isMobileMenuOpen && !showWideNav && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
          style={{ top: mobileMenuTop }}
        >
          <div className="h-full w-full overflow-y-auto px-4 py-4 sm:px-6">
            <div className="flex h-full flex-col">
              <div className="py-4">
                <HeaderSiteMobileNav
                  onAfterNavigate={() => setIsMobileMenuOpen(false)}
                />
              </div>

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

              <div className="mt-4 border-t py-4">
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
