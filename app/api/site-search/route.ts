import { NextResponse } from "next/server";
import { getSiteSearch } from "@/services/search/getSiteSearch/getSiteSearch";
import { getLearnSearchHits } from "@/services/search/getLearnSearchHits";
import { enrichBlogSearchDescriptions } from "@/services/search/enrichBlogSearchDescriptions";
import {
  mergeSiteAndLearnReferences,
  normalizeSiteSearchReferences,
  paginateReferences,
  SITE_POOL_PAGES,
} from "@/services/search/mergeSiteSearchResults";
import type { TReference } from "@/services/search/getSiteSearch/types";

/**
 * Site-wide keyword search: DotCMS `/api/vtl/sitesearch` (page index)
 * merged with Learn front-end content (CourseE2e + devresource).
 * Courses collapse to one `/learning/courses/{urlTitle}` hit with chapter boost.
 * Blog hits with empty/legacy `$pDescription` meta get `teaser` backfilled.
 */
const MAX_QUERY_LENGTH = 200;
const MAX_PAGE = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, MAX_QUERY_LENGTH);
  if (q.length < 2) {
    return NextResponse.json({ query: q, references: [], totalHits: 0, count: 0 });
  }

  const parsedPage = Number(searchParams.get("p") || "0") || 0;
  const safePage = Math.min(Math.max(0, parsedPage), MAX_PAGE);

  try {
    const sitePageIndexes = Array.from({ length: SITE_POOL_PAGES }, (_, i) => i);

    const [sitePages, learnRefs] = await Promise.all([
      Promise.all(
        sitePageIndexes.map((p) =>
          getSiteSearch({
            searchTerm: q,
            isAllSourcesSearch: false,
            currentPage: p,
          }),
        ),
      ),
      getLearnSearchHits(q),
    ]);

    const siteRefs: TReference[] = [];
    let siteTotalHits = 0;
    for (const data of sitePages) {
      if (!data) continue;
      const raw = data as Record<string, unknown>;
      if (typeof raw.count === "number") {
        siteTotalHits = Math.max(siteTotalHits, raw.count);
      } else if (typeof raw.totalHits === "number") {
        siteTotalHits = Math.max(siteTotalHits, raw.totalHits);
      }
      const refs = normalizeSiteSearchReferences(raw);
      if (!refs.length) break;
      siteRefs.push(...refs);
      if (refs.length < 10) break;
    }

    // If the CMS VTL already merged Learn, avoid doubling — detect Course type
    // or /learning/ URIs in the first page of site results.
    const siteAlreadyHasLearn = siteRefs.some(
      (r) =>
        r.contentType === "Course" ||
        (r.uri || "").startsWith("/learning/"),
    );
    const learnToMerge = siteAlreadyHasLearn ? [] : learnRefs;

    if (!siteRefs.length && !learnToMerge.length) {
      const allSiteNull = sitePages.every((d) => d == null);
      if (allSiteNull && learnRefs.length === 0) {
        return NextResponse.json(
          { query: q, references: [], totalHits: 0, count: 0 },
          { status: 502 },
        );
      }
    }

    const pooled = mergeSiteAndLearnReferences(siteRefs, learnToMerge);
    // Enrich before paginate so backfilled teasers are available on every page.
    const enriched = await enrichBlogSearchDescriptions(pooled);
    const references = paginateReferences(enriched, safePage);
    const totalHits = siteTotalHits + learnToMerge.length;

    return NextResponse.json({
      query: q,
      references,
      totalHits,
      count: totalHits,
    });
  } catch (error) {
    console.error("site-search failed:", error);
    return NextResponse.json(
      { query: q, references: [], totalHits: 0, count: 0 },
      { status: 500 },
    );
  }
}
