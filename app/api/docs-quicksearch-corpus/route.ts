import { NextResponse } from "next/server";
import { getDocsQuickSearchCorpus } from "@/services/docs/getDocsQuickSearchCorpus";

/**
 * Flat DotcmsDocumentation corpus for docs-only client search (sidebar Filter;
 * interim header quicksearch until sitesearch).
 */
export async function GET() {
  try {
    const items = await getDocsQuickSearchCorpus();
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("docs-quicksearch-corpus failed:", error);
    return NextResponse.json({ items: [] as unknown[] });
  }
}
