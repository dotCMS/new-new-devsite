import { NextResponse } from "next/server";
import { getDotCMSBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";

/**
 * Experimental SDK-backed navigation for /testing-devresource:
 * primary sections (Build, Author, etc.), their sub-tabs, and side nav.
 */
export async function GET() {
  try {
    const buildNavigation = await getDotCMSBuildNavigation();
    return NextResponse.json(buildNavigation);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dotCMS Build navigation" },
      { status: 500 }
    );
  }
}
