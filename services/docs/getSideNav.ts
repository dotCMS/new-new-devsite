import { navCache } from "@/util/cacheService";
import { graphqlResults } from "../gql";

/**
 * Cached flat list of all live DotcmsDocumentation for quick search, sitemap href extraction,
 * and legacy `sideNav[0].dotcmsdocumentationchildren` callers.
 *
 * Nav chrome uses menulinks (`getNavSections`); this query powers quick search + aux consumers.
 * Cache key bumps when query shape changes (`docsSearchFlatV1` used `limit: 0`, which returned
 * no rows; `V2` could cache empty GraphQL + menulinks-only merge.
 * `V3` briefly used invalid `sortBy: "DotcmsDocumentation.modDate desc"` (returns no rows) — use `V4`.
 */
const cacheKey = "docsSearchFlatV4";

/** Upper bound for all live documentation rows used by quick search / sitemap; keep in sync with dotCMS GraphQL limits. */
const DOCS_SEARCH_COLLECTION_LIMIT = 10_000;

/** Server `navCache` + GraphQL `graphCache` TTL for the flat docs list (quick search, sitemap, etc.). */
const DOCS_SIDE_NAV_CACHE_TTL_SECONDS = 900;

/** Synthetic root so existing `sideNav[0]?.dotcmsdocumentationchildren` usage stays valid. */
type SideNavPayload = Array<{
  dotcmsdocumentationchildren: Array<{
    title?: string | null;
    navTitle?: string | null;
    urlTitle?: string | null;
    modDate?: string | null;
    tag?: string[] | null;
    seoDescription?: string | null;
  }>;
}>;

export const getSideNav = async (): Promise<SideNavPayload> => {
  const cachedValue = navCache.get<SideNavPayload>(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  const query = `
    query AllDocumentationForSearch {
      DotcmsDocumentationCollection(
        query: "+contentType:DotcmsDocumentation +live:true"
        sortBy: "modDate desc"
        limit: ${DOCS_SEARCH_COLLECTION_LIMIT}
        offset: 0
      ) {
        title
        navTitle
        urlTitle
        modDate
        tag
        seoDescription
      }
    }
  `;

  const graphData = await graphqlResults(query, DOCS_SIDE_NAV_CACHE_TTL_SECONDS);

  if (graphData.errors && graphData.errors.length > 0) {
    throw new Error(graphData.errors[0].message);
  }

  const raw = graphData.data?.DotcmsDocumentationCollection;
  const rows = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  const payload: SideNavPayload = [{ dotcmsdocumentationchildren: rows }];

  navCache.set(cacheKey, payload, DOCS_SIDE_NAV_CACHE_TTL_SECONDS);
  return payload;
};
