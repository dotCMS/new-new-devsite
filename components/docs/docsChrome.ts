/**
 * Shared chrome offsets for the redesigned docs layout.
 * Header is h-16 (4rem). Sub-nav is ~2.75rem (py-2.5 + text + border).
 */
export const DOCS_HEADER_OFFSET = "4rem";
export const DOCS_SUBNAV_HEIGHT = "2.75rem";
export const DOCS_CHROME_OFFSET = "6.75rem"; // header + sub-nav
export const DOCS_SIDEBAR_WIDTH = "18rem"; // w-72

/** Tailwind class fragments */
export const docsSubNavStickyClass = "sticky top-16 z-40";
/** Fixed left rail — does not move with page scroll */
export const docsSidebarFixedClass =
  "fixed left-0 top-[6.75rem] z-10 h-[calc(100vh-6.75rem)] w-72";
