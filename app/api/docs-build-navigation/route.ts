import { NextResponse } from "next/server";
import { getDotCMSBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";
import { getBuildNavUriForPath } from "@/config/docs-path-roots";

/**
 * SDK-backed navigation for the redesigned docs experience.
 * Optional `?path=` selects the build-nav URI (defaults to `/docs`).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || undefined;
    const uri = path ? getBuildNavUriForPath(path) : undefined;
    const buildNavigation = await getDotCMSBuildNavigation(
      uri ? { uri } : undefined
    );
    return NextResponse.json(buildNavigation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dotCMS Build navigation" },
      { status: 500 }
    );
  }
}
