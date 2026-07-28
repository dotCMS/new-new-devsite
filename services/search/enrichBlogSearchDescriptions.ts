import { graphqlResults } from "@/services/gql";
import { logRequest } from "@/util/logRequest";
import type { TReference } from "@/services/search/getSiteSearch/types";
import { sanitizeSiteSearchDescription } from "@/services/search/mergeSiteSearchResults";

function blogSlugFromUri(uri: string): string | null {
  if (!uri.startsWith("/blog/")) return null;
  const slug = uri.slice("/blog/".length).split("/").filter(Boolean)[0];
  if (!slug) return null;
  // Frame shells — no Blog contentlet behind these.
  if (slug === "index" || slug === "blog-detail" || slug === "category") {
    return null;
  }
  return slug;
}

function escapeLuceneValue(value: string): string {
  // Do not escape hyphens — urlTitles use them heavily and _dotraw expects the
  // literal slug. Escape only Lucene operator/punctuation that would break parsing.
  return String(value).replace(/([+!(){}[\]^"~*?:\\/])/g, "\\$1");
}

/**
 * When Site Search stored an empty or legacy `$pDescription` meta string,
 * backfill blog hits from the Blog contentlet `teaser` field (what the Next
 * blog pages already use for metadata).
 */
export async function enrichBlogSearchDescriptions(
  refs: TReference[],
): Promise<TReference[]> {
  const needSlug = new Set<string>();
  for (const ref of refs) {
    const cleaned = sanitizeSiteSearchDescription(ref.description);
    if (cleaned) continue;
    const slug = blogSlugFromUri(ref.uri || "");
    if (slug) needSlug.add(slug);
  }

  if (needSlug.size === 0) return refs;

  const orClause = [...needSlug]
    .map((s) => `blog.urlTitle_dotraw:${escapeLuceneValue(s)}`)
    .join(" ");
  const query = `query BlogTeaserEnrichment {
  BlogCollection(
    query: "+contentType:Blog +live:true +( ${orClause} )"
    limit: ${Math.min(needSlug.size, 50)}
  ) {
    urlTitle
    teaser
  }
}`;

  try {
    const result = await logRequest(
      async () => graphqlResults(query),
      "enrichBlogSearchDescriptions",
    );
    if (result?.errors?.length) {
      console.error(
        "GraphQL errors in enrichBlogSearchDescriptions:",
        result.errors,
      );
      return refs.map((r) => ({
        ...r,
        description: sanitizeSiteSearchDescription(r.description),
      }));
    }

    const rows = Array.isArray(result?.data?.BlogCollection)
      ? result.data.BlogCollection
      : [];
    const teaserBySlug = new Map<string, string>();
    for (const row of rows) {
      const slug = (row?.urlTitle || "").trim();
      const teaser = (row?.teaser || "").trim();
      if (slug && teaser) teaserBySlug.set(slug, teaser);
    }

    return refs.map((ref) => {
      const cleaned = sanitizeSiteSearchDescription(ref.description);
      if (cleaned) return { ...ref, description: cleaned };
      const slug = blogSlugFromUri(ref.uri || "");
      if (!slug) return { ...ref, description: cleaned };
      const teaser = teaserBySlug.get(slug);
      return {
        ...ref,
        description: teaser || cleaned,
      };
    });
  } catch (err) {
    console.error("enrichBlogSearchDescriptions failed:", err);
    return refs.map((r) => ({
      ...r,
      description: sanitizeSiteSearchDescription(r.description),
    }));
  }
}
