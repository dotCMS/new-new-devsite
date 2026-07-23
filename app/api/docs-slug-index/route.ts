import { NextResponse } from "next/server";
import { getDocsSlugIndex } from "@/services/docs/getDocsSlugIndex";

/**
 * Public leaf → canonical nested path map for docs link resolution.
 */
export async function GET() {
  try {
    const index = await getDocsSlugIndex();
    return NextResponse.json(index, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("docs-slug-index failed:", error);
    return NextResponse.json(
      { error: "Failed to build docs slug index" },
      { status: 500 },
    );
  }
}
