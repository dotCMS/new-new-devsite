import { NextResponse } from "next/server";
import { getSideNav } from "@/services/docs/getSideNav";

/**
 * Public tree for header docs quick search on pages that don't receive server-fetched `sideNavItems`.
 * Same shape as `sideNav[0]?.dotcmsdocumentationchildren` from `getSideNav()`.
 */
export async function GET() {
  try {
    const sideNav = await getSideNav();
    const items = Array.isArray(sideNav)
      ? sideNav[0]?.dotcmsdocumentationchildren ?? []
      : [];
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] as unknown[] });
  }
}
