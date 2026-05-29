"use client";

import * as React from "react";
import Header from "@/components/header/header";
import RedesignedNavTree from "@/components/navigation/RedesignedNavTree";
import type { NavSection } from "@/util/navTransform";

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
  return (
    <>
      <Header
        sideNavItems={sideNavItems}
        currentPath={currentPath}
        navSections={navSections}
      />
      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <div className="flex w-full min-w-0 flex-1 flex-col px-0 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:gap-6">
          <div className="hidden min-h-0 w-72 shrink-0 self-stretch border-border/60 bg-[#F6F6F7] dark:bg-muted/25 lg:block lg:border-r">
            <RedesignedNavTree
              currentPath={currentPath}
              initialSections={navSections}
            />
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
