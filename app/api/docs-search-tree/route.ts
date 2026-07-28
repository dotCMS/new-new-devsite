import { NextResponse } from "next/server";
import { getDocsQuickSearchCorpus } from "@/services/docs/getDocsQuickSearchCorpus";

/**
 * @deprecated Prefer `/api/docs-quicksearch-corpus`. Kept as a thin alias.
 */
export async function GET() {
  try {
    const items = await getDocsQuickSearchCorpus();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] as unknown[] });
  }
}
