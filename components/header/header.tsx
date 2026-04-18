"use client";

import { Code2, Menu, Search, X, ExternalLink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/util/utils";
import { useState, useEffect } from "react";
import ChatWithUsLink from "./ChatWithUsLink";
import DiscourseLink from "./DiscourseLink";
import GithubLink from "./GithubLink";
import { SearchModal } from "../chat/SearchModal";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import type { NavSection } from "@/util/navTransform";
import LogoWithArrow from "./Logo/LogoWithArrow";

type HeaderProps = {
  sideNavItems?: any[];
  currentPath?: string;
  /** Docs slug for menulinks nav filtering on client refetch; omit on persona / non-docs. */
  navMenuSlug?: string;
  navSections?: NavSection[];
  /** Full menulinks tree for quick-search breadcrumbs (includes `showOnMenu: false`). */
  navSectionsAllForPaths?: NavSection[];
};

const GETTING_STARTED_NAV_ITEM_VALUE = "getting-started-nav";
const ACTIVITY_FEEDS_NAV_ITEM_VALUE = "activity-feeds-nav";

type HeaderDesktopNavMenuProps = {
  currentOpenMenu: string | undefined;
  setCurrentOpenMenu: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/**
 * Radix NavigationMenu generates `useId`-based ids that can differ between SSR and the
 * client’s first paint (Next 15 + streaming). Render the real menu only after mount so
 * hydration compares a stable placeholder to itself, then swap in Radix.
 */
function DeferredHeaderDesktopNavMenu(props: HeaderDesktopNavMenuProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <nav
        className="flex h-10 min-h-10 min-w-[min(100%,36rem)] items-center gap-2"
        aria-label="Main menu"
        aria-busy="true"
      >
        <span className="inline-block h-9 w-28 rounded-md bg-muted/40" />
        <span className="inline-block h-9 w-14 rounded-md bg-muted/30" />
        <span className="inline-block h-9 w-36 rounded-md bg-muted/30" />
        <span className="inline-block h-9 w-24 rounded-md bg-muted/40" />
        <span className="inline-block h-9 w-24 rounded-md bg-muted/40" />
      </nav>
    );
  }
  return <HeaderDesktopNavMenu {...props} />;
}

/** Module-level component so Radix collection order stays stable (avoid defining inside Header). */
function HeaderDesktopNavMenu({ currentOpenMenu, setCurrentOpenMenu }: HeaderDesktopNavMenuProps) {
  return (
    <NavigationMenu
      value={currentOpenMenu}
      onValueChange={(newValue) => {
        if (
          newValue === GETTING_STARTED_NAV_ITEM_VALUE ||
          newValue === ACTIVITY_FEEDS_NAV_ITEM_VALUE
        ) {
          return;
        }
        setCurrentOpenMenu(newValue);
      }}
      delayDuration={300 * 1000}
    >
      <NavigationMenuList className="space-x-1">
        <NavigationMenuItem value={GETTING_STARTED_NAV_ITEM_VALUE} className="relative">
          <NavigationMenuTrigger
            className="px-3"
            onClick={(e) => {
              e.preventDefault();
              if (currentOpenMenu === GETTING_STARTED_NAV_ITEM_VALUE) {
                setCurrentOpenMenu(undefined);
              } else {
                setCurrentOpenMenu(GETTING_STARTED_NAV_ITEM_VALUE);
              }
            }}
          >
            Getting Started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col  rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/getting-started"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      dotDev <Code2 className="h-6 w-6 inline-block" />
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Your one-stop site for learning dotCMS, including Docs, resources and tools.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/getting-started" title="Introduction">
                Learn about dotCMS&apos;s core concepts and architecture.
              </ListItem>
              <ListItem href="/docs/quick-start-guide" title="Headless Quick Start">
                Get up and running in less than 5 minutes.
              </ListItem>
              <ListItem href="/docs/features" title="Features">
                Explore our comprehensive feature set.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/docs/table-of-contents?n=0">
              <span className={cn(navigationMenuTriggerStyle(), "px-3")}>Docs</span>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/learning">
              <span className={cn(navigationMenuTriggerStyle(), "px-3")}>Learning & Blogs</span>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value={ACTIVITY_FEEDS_NAV_ITEM_VALUE} className="relative">
          <NavigationMenuTrigger
            className="px-3"
            onClick={(e) => {
              e.preventDefault();
              if (currentOpenMenu === ACTIVITY_FEEDS_NAV_ITEM_VALUE) {
                setCurrentOpenMenu(undefined);
              } else {
                setCurrentOpenMenu(ACTIVITY_FEEDS_NAV_ITEM_VALUE);
              }
            }}
          >
            Activity Feeds
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[360px] gap-3 p-4 sm:w-[400px] md:w-[520px] md:grid-cols-2">
              <ListItem href="/docs/changelogs" title="Changelogs">
                Release notes and version history.
              </ListItem>
              <ListItem href="/docs/known-security-issues" title="Known security issues">
                Advisories and security-related updates.
              </ListItem>
              <ListItem href="/docs/upgrading-important-changes" title="Important / breaking changes">
                Must-read notes before you upgrade.
              </ListItem>
              <ListItem href="/docs/deprecations" title="Deprecations">
                Features, APIs, and other components slated for removal.
              </ListItem>
              <ListItem href="/docs/current-releases" title="Current Releases">
                Supported versions and what is shipping now.
              </ListItem>
              <ListItem href="/docs/all-releases" title="All Releases">
                Full list of dotCMS releases.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a
              href="https://community.dotcms.com/"
              target="dotCMSCommunity"
              className={navigationMenuTriggerStyle()}
            >
              Community <ExternalLink className="h-3 w-3 inline-block ml-1" />
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function HeaderMobileNavLinks() {
  return (
    <nav className="flex flex-col space-y-4">
      <div className="space-y-1">
        <Link
          prefetch={false}
          href="/getting-started"
          className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
        >
          Getting Started
        </Link>

        <Link
          prefetch={false}
          href="/docs/table-of-contents?n=0"
          className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
        >
          Docs
        </Link>

        <Link
          prefetch={false}
          href="/learning"
          className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
        >
          Learning & Blogs
        </Link>

        <div className="space-y-1 border-l-2 border-border pl-3 ml-1">
          <p className="px-4 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity Feeds</p>
          <Link
            prefetch={false}
            href="/docs/changelogs"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            Changelogs
          </Link>
          <Link
            prefetch={false}
            href="/docs/known-security-issues"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            Known security issues
          </Link>
          <Link
            prefetch={false}
            href="/docs/upgrading-important-changes"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            Important / breaking changes
          </Link>
          <Link
            prefetch={false}
            href="/docs/deprecations"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            Deprecations
          </Link>
          <Link
            prefetch={false}
            href="/docs/current-releases"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            Current Releases
          </Link>
          <Link
            prefetch={false}
            href="/docs/all-releases"
            className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
          >
            All Releases
          </Link>
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Header({ sideNavItems, currentPath, navSections, navSectionsAllForPaths, navMenuSlug }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showBackArrow, setShowBackArrow] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const [currentOpenMenu, setCurrentOpenMenu] = useState<string | undefined>(undefined);

  const handleLogoMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowBackArrow(true);
  };

  const handleLogoMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowBackArrow(false);
    }, 2000);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command/Control + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // Prevent default browser behavior
        setIsSearchOpen((prev) => !prev);
      }
      // Close on escape
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // useEffect for cleaning up the logo hover timeout
  useEffect(() => {
    const currentTimeout = hoverTimeout;
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [hoverTimeout]);

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

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b bg-background">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <LogoWithArrow />
          
          <div className="hidden lg:flex items-center space-x-2">
            <DeferredHeaderDesktopNavMenu
              currentOpenMenu={currentOpenMenu}
              setCurrentOpenMenu={setCurrentOpenMenu}
            />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/80"
            >
              <Search className="h-4 w-4" />
              <span>
                <span className="sm:hidden">AI Search...</span>
                <span className="hidden sm:inline">AI Search...</span>
              </span>
              <kbd className="hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>
                <span className="text-xs">K</span>
              </kbd>
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              <GithubLink />
              <DiscourseLink />
              <ThemeToggle />
              <ChatWithUsLink />
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
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
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container h-full mx-auto px-4 py-4 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Main Navigation Links */}
              <div className="py-4">
                <HeaderMobileNavLinks />
              </div>

              {/* Side Navigation Tree (if available) */}
              {sideNavItems && (
                <div className="flex-1 border-t pt-4 mt-4">
                  <div className="text-sm font-medium leading-none text-muted-foreground mb-4 px-2">
                    Docs
                  </div>
                  <RedesignedNavTree
                    currentPath={currentPath}
                    navMenuSlug={navMenuSlug}
                    items={sideNavItems}
                    isMobile={true}
                    initialSections={navSections}
                    initialSectionsAllForPaths={navSectionsAllForPaths}
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

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
