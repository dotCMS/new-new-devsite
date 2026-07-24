"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/util/utils";

const ACTIVITY_FEEDS_NAV_ITEM_VALUE = "activity-feeds-nav";

const ACTIVITY_FEED_LINKS = [
  {
    href: "/docs/changelogs",
    title: "Changelogs",
    description: "Release notes and version history.",
  },
  {
    href: "/docs/known-security-issues",
    title: "Known security issues",
    description: "Advisories and security-related updates.",
  },
  {
    href: "/docs/upgrading-important-changes",
    title: "Important / breaking changes",
    description: "Must-read notes before you upgrade.",
  },
  {
    href: "/docs/deprecations",
    title: "Deprecations",
    description: "Features, APIs, and other components slated for removal.",
  },
  {
    href: "/docs/current-releases",
    title: "Current Releases",
    description: "Supported versions and what is shipping now.",
  },
  {
    href: "/docs/all-releases",
    title: "All Releases",
    description: "Full list of dotCMS releases.",
  },
] as const;

const SITE_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/learning", label: "Learn" },
  { href: "/blog", label: "Blog" },
] as const;

function linkIsActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/docs") {
    return pathname === "/docs" || pathname.startsWith("/docs/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
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
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

type HeaderSiteDesktopNavProps = {
  className?: string;
  currentOpenMenu: string | undefined;
  setCurrentOpenMenu: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/** Module-level so Radix useId order matches between SSR and hydration. */
export function HeaderSiteDesktopNav({
  className,
  currentOpenMenu,
  setCurrentOpenMenu,
}: HeaderSiteDesktopNavProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu
      value={currentOpenMenu}
      onValueChange={(newValue) => {
        if (newValue === ACTIVITY_FEEDS_NAV_ITEM_VALUE) {
          return;
        }
        setCurrentOpenMenu(newValue);
      }}
      delayDuration={300 * 1000}
      className={cn("px-0", className)}
    >
      <NavigationMenuList className="space-x-1">
        {SITE_LINKS.map((item) => {
          const isActive = linkIsActive(pathname, item.href);
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link href={item.href} prefetch={false}>
                  <span
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "px-3",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}

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
              {ACTIVITY_FEED_LINKS.map((item) => (
                <ListItem key={item.href} href={item.href} title={item.title}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

type HeaderSiteMobileNavProps = {
  onAfterNavigate: () => void;
};

export function HeaderSiteMobileNav({ onAfterNavigate }: HeaderSiteMobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-4" aria-label="Main">
      <div className="space-y-1">
        {SITE_LINKS.map((item) => {
          const isActive = linkIsActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              onClick={onAfterNavigate}
              className={cn(
                navigationMenuTriggerStyle(),
                "h-9 w-full justify-start px-4",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="ml-1 space-y-1 border-l-2 border-border pl-3">
          <p className="px-4 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activity Feeds
          </p>
          {ACTIVITY_FEED_LINKS.map((item) => (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              onClick={onAfterNavigate}
              className={cn(
                navigationMenuTriggerStyle(),
                "h-9 w-full justify-start px-4"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
