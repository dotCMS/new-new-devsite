import { DOCS_LANDING_PATH, type PrimaryDocTabId } from "./primaryNav";

export const BUILD_SUB_TABS = ["headless", "themes", "extend"] as const;

export type BuildSubTabId = (typeof BUILD_SUB_TABS)[number];

export const BUILD_SUB_LABEL: Record<BuildSubTabId, string> = {
  headless: "Headless",
  themes: "Themes (Traditional)",
  extend: "Extend",
};

const BUILD_SET = new Set<string>(BUILD_SUB_TABS);

export const DEFAULT_BUILD_SUB: BuildSubTabId = "headless";

/**
 * `?build=headless|themes|extend` when `?primary=build`.
 */
export function parseBuildSubFromSearchParam(
  v: string | null | undefined
): BuildSubTabId {
  if (v && BUILD_SET.has(v)) {
    return v as BuildSubTabId;
  }
  return DEFAULT_BUILD_SUB;
}

/**
 * Docs link preserving path and setting `primary` + optional `build` (for Build tab).
 */
export function hrefForDocsContext(
  pathname: string | null,
  primary: PrimaryDocTabId,
  buildSub?: BuildSubTabId
): string {
  const path = pathname?.split("?")[0] || DOCS_LANDING_PATH;
  const q = new URLSearchParams();
  q.set("primary", primary);
  if (primary === "build") {
    q.set("build", buildSub ?? DEFAULT_BUILD_SUB);
  }
  return `${path}?${q.toString()}`;
}
