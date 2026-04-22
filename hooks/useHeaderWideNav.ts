"use client";

import { useLayoutEffect, useState } from "react";

/** Align with Tailwind `xl:` — horizontal nav + icon cluster fit above this content width. */
const XL_CONTENT_MIN = 1280;
/** Assistant uses side panel at this viewport width and up (see AssistantProvider). */
const ASSISTANT_DESKTOP_MIN = 1024;

function getRootRemPx(): number {
  if (typeof document === "undefined") return 16;
  const n = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(n) && n > 0 ? n : 16;
}

/** Mirrors `min(26rem|42rem, 100vw)` padding reserved for the assistant rail. */
function assistantReservePx(
  assistantOpen: boolean,
  expanded: boolean,
  viewportWidth: number
): number {
  if (!assistantOpen || viewportWidth < ASSISTANT_DESKTOP_MIN) return 0;
  const rem = getRootRemPx();
  const raw = expanded ? 42 * rem : 26 * rem;
  return Math.min(raw, viewportWidth);
}

/**
 * True when the main column has enough width for the full desktop header (nav + utilities).
 * Uses available width = viewport − assistant panel reserve, not raw window width.
 */
export function useHeaderWideNav(
  assistantOpen: boolean,
  assistantExpanded: boolean
): boolean {
  const [wide, setWide] = useState(true);

  useLayoutEffect(() => {
    const run = () => {
      const vw = window.innerWidth;
      const reserve = assistantReservePx(assistantOpen, assistantExpanded, vw);
      const available = vw - reserve;
      setWide(available >= XL_CONTENT_MIN);
    };

    run();
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [assistantOpen, assistantExpanded]);

  return wide;
}

/** Same effective-width rule as the header — use for “On this page” / secondary columns. */
export { useHeaderWideNav as useContentColumnWideLayout };
