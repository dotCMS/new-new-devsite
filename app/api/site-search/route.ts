import { NextResponse } from "next/server";
import { getSiteSearch } from "@/services/search/getSiteSearch/getSiteSearch";

/**
 * Site-wide keyword search via /api/vtl/sitesearch (unscoped — not docs-only).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ query: q, references: [], totalHits: 0 });
  }

  const page = Number(searchParams.get("p") || "0") || 0;

  try {
    const data = await getSiteSearch({
      searchTerm: q,
      isAllSourcesSearch: false,
      currentPage: page,
    });

    if (!data) {
      return NextResponse.json(
        { query: q, references: [], totalHits: 0 },
        { status: 502 },
      );
    }

    // Normalize common CMS/VTL shapes to { references, totalHits, query }
    const raw = data as Record<string, unknown>;
    const references =
      (Array.isArray(raw.references) && raw.references) ||
      (Array.isArray((raw.entity as { references?: unknown })?.references) &&
        (raw.entity as { references: unknown[] }).references) ||
      (Array.isArray(raw.results) && raw.results) ||
      [];

    return NextResponse.json({
      query: (raw.query as string) || q,
      references,
      totalHits:
        typeof raw.totalHits === "number"
          ? raw.totalHits
          : Array.isArray(references)
            ? references.length
            : 0,
    });
  } catch (error) {
    console.error("site-search failed:", error);
    return NextResponse.json(
      { query: q, references: [], totalHits: 0 },
      { status: 500 },
    );
  }
}
