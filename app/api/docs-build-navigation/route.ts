import { NextResponse } from "next/server";
import { getDotCMSBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";

/**
 * Experimental SDK-backed navigation for the full Build branch:
 * Build sub-tabs plus the side nav sections for each sub-tab.
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
