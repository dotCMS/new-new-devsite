"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header/header";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import type { NavSection } from "@/util/navTransform";
import { parsePrimaryFromSearchParam, type PrimaryDocTabId } from "./primaryNav";
import { parseBuildSubFromSearchParam } from "./buildNav";
import { parseContentSubFromSearchParam } from "./contentNav";
import { parseManageSubFromSearchParam } from "./manageNav";
import { BuildSubNav } from "./BuildSubNav";
import { BuildSectionNav } from "./BuildSectionNav";
import { ContentSubNav } from "./ContentSubNav";
import { ContentSectionNav } from "./ContentSectionNav";
import { ManageSubNav } from "./ManageSubNav";
import { ManageSectionNav } from "./ManageSectionNav";
import { ReferenceSectionNav } from "./ReferenceSectionNav";
import { OverviewSectionNav } from "./OverviewSectionNav";

type DocsPageShellProps = {
  children: React.ReactNode;
  sideNavItems: any[];
  currentPath: string;
  navSections: NavSection[];
  /** Placed at the bottom of the main content column (not full-bleed under the side nav). */
  footer?: React.ReactNode;
};

export function DocsPageShell({
  children,
  sideNavItems,
  currentPath,
  navSections,
  footer,
}: DocsPageShellProps) {
  const searchParams = useSearchParams();
  const primaryTab: PrimaryDocTabId = parsePrimaryFromSearchParam(
    searchParams.get("primary")
  );
  const buildSub = parseBuildSubFromSearchParam(searchParams.get("build"));
  const contentSub = parseContentSubFromSearchParam(
    searchParams.get("content")
  );
  const manageSub = parseManageSubFromSearchParam(
    searchParams.get("manage")
  );

  return (
    <>
      <Header
        sideNavItems={sideNavItems}
        currentPath={currentPath}
        navSections={navSections}
        docsPrimaryTab={primaryTab}
      />
      {primaryTab === "build" && <BuildSubNav />}
      {primaryTab === "content" && <ContentSubNav />}
      {primaryTab === "manage" && <ManageSubNav />}
      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <div className="flex w-full min-w-0 flex-1 flex-col px-0 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:gap-6">
          <div className="hidden min-h-0 w-72 shrink-0 self-stretch border-border/60 bg-[#F6F6F7] dark:bg-muted/25 lg:block lg:border-r">
            {primaryTab === "overview" ? (
              <OverviewSectionNav />
            ) : primaryTab === "build" ? (
              <BuildSectionNav buildSub={buildSub} />
            ) : primaryTab === "content" ? (
              <ContentSectionNav contentSub={contentSub} />
            ) : primaryTab === "manage" ? (
              <ManageSectionNav manageSub={manageSub} />
            ) : primaryTab === "reference" ? (
              <ReferenceSectionNav />
            ) : (
              <RedesignedNavTree
                currentPath={currentPath}
                initialSections={navSections}
              />
            )}
          </div>
          <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
            <div className="w-full min-w-0 flex-1 px-4 sm:px-6 lg:px-10">
              {children}
            </div>
            {footer}
          </main>
        </div>
      </div>
    </>
  );
}
