import type { TReference } from "@/services/search/getSiteSearch/types";

const SHOW = 10;
/** How many sitesearch pages (×10) to pull into the merge pool. */
const SITE_POOL_PAGES = 5;

export function normalizeSiteSearchReferences(
  data: Record<string, unknown> | null,
): TReference[] {
  if (!data) return [];
  const raw = data as Record<string, unknown>;
  const references =
    (Array.isArray(raw.references) && raw.references) ||
    (Array.isArray((raw.entity as { references?: unknown })?.references) &&
      (raw.entity as { references: unknown[] }).references) ||
    (Array.isArray(raw.results) && raw.results) ||
    [];

  return (references as TReference[])
    .filter((r) => r && typeof r === "object" && typeof r.uri === "string")
    .map((r) => ({
      title: r.title || r.uri,
      uri: r.uri,
      description: r.description || "",
      matches: typeof r.matches === "number" ? r.matches : 0,
      score: typeof r.score === "number" ? r.score : 0,
      contentType: r.contentType || "noShow",
    }));
}

function contentTypeForUri(uri: string, existing?: string): string {
  if (existing && existing !== "noShow") return existing;
  if (uri.includes("/learning/courses/")) return "Course";
  if (uri.includes("/learning/")) return "Guide";
  if (uri.includes("/blog/post/") || uri.includes("/blog/")) return "Blog";
  if (uri.includes("/case-studies/")) return "Case Study";
  if (uri.includes("/codeshare/")) return "Codeshare Article";
  if (uri.includes("/company/events/")) return "Event";
  if (uri.includes("/company/news/")) return "News";
  if (uri.includes("/courses/videos/")) return "Video";
  if (uri.includes("/docfiles/")) return "Documentation";
  if (uri.includes("/docs/")) return "Documentation";
  if (uri.includes("/documentation/")) return "Documentation";
  if (uri.includes("/videos/")) return "Video";
  if (uri.includes("/marketplace/")) return "Plugin";
  if (uri.includes("/reports/")) return "Report";
  if (uri.includes("/landing-pages/")) return "noShow";
  if (uri.includes("/careers/")) return "Job Posting";
  return existing || "noShow";
}

/**
 * Prefer Learn-projected course/guide hits over any future page-index
 * duplicates under `/learning/`.
 */
export function mergeSiteAndLearnReferences(
  siteRefs: TReference[],
  learnRefs: TReference[],
): TReference[] {
  const learnUris = new Set(learnRefs.map((r) => r.uri));
  const filteredSite = siteRefs
    .filter((r) => {
      const uri = r.uri || "";
      if (learnUris.has(uri)) return false;
      // Drop page-index learning URLs when we already project Learn from GraphQL
      if (uri.startsWith("/learning/")) return false;
      return true;
    })
    .map((r) => ({
      ...r,
      contentType: contentTypeForUri(r.uri, r.contentType),
    }));

  const learnNormalized = learnRefs.map((r) => ({
    ...r,
    contentType: contentTypeForUri(r.uri, r.contentType),
  }));

  const merged = [...filteredSite, ...learnNormalized].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );

  // Dedupe by URI (keep highest score first)
  const seen = new Set<string>();
  const deduped: TReference[] = [];
  for (const ref of merged) {
    const key = ref.uri || "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(ref);
  }
  return deduped;
}

export function paginateReferences(
  pooled: TReference[],
  page: number,
  show: number = SHOW,
): TReference[] {
  const safePage = page > 0 ? page : 0;
  const offset = safePage * show;
  return pooled.slice(offset, offset + show);
}

export { SHOW, SITE_POOL_PAGES };
