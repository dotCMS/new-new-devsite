/**
 * Shared chrome offsets for the redesigned docs layout.
 * Header is h-16 (4rem). Sub-nav is ~2.75rem (py-2.5 + text + border).
 *
 * Keep header wide-nav and BuildSubNav compact mode on the same breakpoint
 * (`lg` / 1024) so we never show second-level full tabs without primary tabs.
 */
export const DOCS_HEADER_OFFSET = "4rem";
export const DOCS_SUBNAV_HEIGHT = "2.75rem";
export const DOCS_CHROME_OFFSET = "6.75rem"; // header + sub-nav
export const DOCS_SIDEBAR_WIDTH = "18rem"; // w-72

/** Matches Tailwind `lg` — shared collapse point for header primary + BuildSubNav. */
export const DOCS_NAV_WIDE_MIN_PX = 1024;

/** Tailwind class fragments */
export const docsSubNavStickyClass = "sticky top-16 z-40";

/**
 * In-flow sticky left rail — scrolls with its own overflow; stays below
 * sticky header + sub-nav. Prefer this over `fixed` so a top-of-page banner
 * (BSL) does not leave the rail mis-aligned to the chrome.
 */
export const docsSidebarStickyClass =
  "sticky top-[6.75rem] z-10 hidden h-[calc(100vh-6.75rem)] w-72 shrink-0 overflow-y-auto border-border/60 bg-[#F6F6F7] dark:bg-muted/25 lg:block lg:border-r";
