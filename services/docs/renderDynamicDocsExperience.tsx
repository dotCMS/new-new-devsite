import { Suspense, type ReactNode } from 'react';
import { DynamicBuildPageAsset } from '@/components/docs/DynamicBuildPageAsset';
import { SpecialDocsPageContent } from '@/components/docs/SpecialDocsPageContent';
import { getSideNav } from '@/services/docs/getSideNav';
import getDeprecations from '@/services/docs/getDeprecations/getDeprecations';
import type { DocsExperience } from '@/services/docs/resolveDocsExperience';
import type { DynamicBuildNavigation } from '@/services/docs/getDotCMSBuildNavigation';

type RenderDynamicDocsExperienceArgs = {
  experience: DocsExperience;
  pageContent: unknown;
  buildNavigation: DynamicBuildNavigation;
  searchParams?: Record<string, string | string[] | undefined>;
};

/**
 * Shared renderer for the redesigned docs shell (special + standard pages).
 * Used by both `/docs/[...slug]` and `[[...slug]]` so retiring
 * `/testing-devresource` is a path-root config change, not a second pipeline.
 */
export async function renderDynamicDocsExperience({
  experience,
  pageContent,
  buildNavigation,
  searchParams,
}: RenderDynamicDocsExperienceArgs) {
  const { specialPageKey, routePath } = experience;
  let specialContent: ReactNode = null;

  if (specialPageKey) {
    const sideNav = await getSideNav();
    let allDeprecations: unknown[] | undefined;

    if (specialPageKey === 'deprecations') {
      try {
        allDeprecations = (await getDeprecations()) ?? [];
      } catch (e) {
        console.error('Error fetching deprecations:', e);
        allDeprecations = [];
      }
    }

    const pageAsset = (pageContent as { pageAsset?: Record<string, unknown> })
      ?.pageAsset;
    const page = pageAsset?.page as
      | {
          title?: string;
          friendlyName?: string;
          urlContentMap?: Record<string, unknown>;
        }
      | undefined;

    const contentlet =
      page?.urlContentMap ||
      (pageAsset?.urlContentMap as Record<string, unknown> | undefined) ||
      {
        title: page?.title,
        navTitle: page?.friendlyName || page?.title,
      };

    specialContent = (
      <Suspense
        fallback={
          <div className="min-h-[50vh] w-full animate-pulse bg-muted/15" />
        }
      >
        <SpecialDocsPageContent
          pageKey={specialPageKey}
          slug={routePath}
          sideNav={sideNav}
          contentlet={contentlet}
          searchParams={searchParams}
          allDeprecations={allDeprecations}
        />
      </Suspense>
    );
  }

  return (
    <DynamicBuildPageAsset
      pageContent={pageContent}
      buildNavigation={buildNavigation}
      specialContent={specialContent}
    />
  );
}
