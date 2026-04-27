export const PRIMARY_DOC_TABS = [
  "overview",
  "build",
  "content",
  "manage",
  "reference",
] as const;

export type PrimaryDocTabId = (typeof PRIMARY_DOC_TABS)[number];

export const PRIMARY_DOC_LABEL: Record<PrimaryDocTabId, string> = {
  overview: "Overview",
  build: "Build",
  content: "Content",
  manage: "Manage",
  reference: "Reference",
};

const PRIMARY_SET = new Set<string>(PRIMARY_DOC_TABS);

/** Default entry when opening docs from a non-doc page. */
export const DOCS_LANDING_PATH = "/docs/table-of-contents";

/**
 * `?primary=overview` (etc.) drives the header + left sidebar on docs.
 */
export function parsePrimaryFromSearchParam(
  v: string | null | undefined
): PrimaryDocTabId {
  if (v && PRIMARY_SET.has(v)) {
    return v as PrimaryDocTabId;
  }
  return "overview";
}

/**
 * Link target for a primary tab: keep current /docs/... path + `primary`, or land on docs home.
 */
export function hrefForPrimaryTab(
  pathname: string | null,
  id: PrimaryDocTabId
): string {
  const q = new URLSearchParams();
  q.set("primary", id);
  if (id === "build") {
    q.set("build", "headless");
  }
  if (id === "content") {
    q.set("content", "modeling");
  }
  if (id === "manage") {
    q.set("manage", "access");
  }
  if (pathname?.startsWith("/docs")) {
    const path = pathname.split("?")[0] || pathname;
    return `${path}?${q.toString()}`;
  }
  return `${DOCS_LANDING_PATH}?${q.toString()}`;
}
