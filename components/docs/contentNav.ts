import { DOCS_LANDING_PATH } from "./primaryNav";

export const CONTENT_SUB_TABS = [
  "modeling",
  "authoring",
  "experiences",
  "publishing",
] as const;

export type ContentSubTabId = (typeof CONTENT_SUB_TABS)[number];

export const CONTENT_SUB_LABEL: Record<ContentSubTabId, string> = {
  modeling: "Modeling",
  authoring: "Authoring",
  experiences: "Experiences",
  publishing: "Publishing",
};

const CONTENT_SET = new Set<string>(CONTENT_SUB_TABS);

export const DEFAULT_CONTENT_SUB: ContentSubTabId = "modeling";

/**
 * `?content=modeling|...` when `?primary=content`.
 */
export function parseContentSubFromSearchParam(
  v: string | null | undefined
): ContentSubTabId {
  if (v && CONTENT_SET.has(v)) {
    return v as ContentSubTabId;
  }
  return DEFAULT_CONTENT_SUB;
}

/**
 * Keep current /docs/... path and set `primary=content` + `content` sub tab.
 */
export function hrefForContentSubNav(
  pathname: string | null,
  contentSub: ContentSubTabId
): string {
  const path = pathname?.split("?")[0] || DOCS_LANDING_PATH;
  const q = new URLSearchParams();
  q.set("primary", "content");
  q.set("content", contentSub);
  return `${path}?${q.toString()}`;
}
