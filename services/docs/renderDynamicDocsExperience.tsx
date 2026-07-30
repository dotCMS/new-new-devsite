import { Suspense, type ReactNode } from 'react';
import { DynamicBuildPageAsset } from '@/components/docs/DynamicBuildPageAsset';
import { SpecialDocsPageContent } from '@/components/docs/SpecialDocsPageContent';
import Documentation from '@/components/documentation/Documentation';
import GitHubDocumentation from '@/components/documentation/GitHubDocumentation';
import { getSideNav } from '@/services/docs/getSideNav';
import getDeprecations from '@/services/docs/getDeprecations/getDeprecations';
import { findDeprecationForPath } from '@/services/docs/findDeprecationForPath';
import { getAllReleases } from '@/services/docs/getReleases/getReleases';
import { getDocsSlugIndex } from '@/services/docs/getDocsSlugIndex';
import { stripDocsPathRoot } from '@/config/docs-path-roots';
import type { DocsExperience } from '@/services/docs/resolveDocsExperience';
import type { DynamicBuildNavigation } from '@/services/docs/getDotCMSBuildNavigation';
import type { TDeprecation } from '@/services/docs/getDeprecations/types';

type RenderDynamicDocsExperienceArgs = {
  experience: DocsExperience;
  pageContent: unknown;
  buildNavigation: DynamicBuildNavigation;
  searchParams?: Record<string, string | string[] | undefined>;
};

type UrlContentMapLike = Record<string, unknown> & {
  inode?: string | null;
  _map?: {
    githubSource?: unknown;
    documentation?: unknown;
  };
};

type PageAssetShape = {
  pageAsset?: {
    urlContentMap?: UrlContentMapLike;
    page?: {
      title?: string;
      friendlyName?: string;
      urlContentMap?: UrlContentMapLike;
    };
  };
};

/**
 * Shared renderer for the redesigned docs shell (special + standard + flat
 * URL-mapped bodies). Used by both `/docs/[...slug]` and `[[...slug]]`.
 */
export async function renderDynamicDocsExperience({
  experience,
  pageContent,
  buildNavigation,
  searchParams,
}: RenderDynamicDocsExperienceArgs) {
  const { specialPageKey, routePath, hasUrlMappedContent } = experience;
  let specialContent: ReactNode = null;
  let deprecation: TDeprecation | null = null;

  let allDeprecations: TDeprecation[] | undefined;
  try {
    allDeprecations = (await getDeprecations()) ?? [];
  } catch (e) {
    console.error('Error fetching deprecations:', e);
    allDeprecations = [];
  }

  let allReleases: unknown[] | undefined;
  if (
    specialPageKey === 'all-releases' ||
    specialPageKey === 'previous-releases'
  ) {
    try {
      allReleases = await getAllReleases();
    } catch (e) {
      console.error('Error fetching releases:', e);
      allReleases = [];
    }
  }

  if (!specialPageKey) {
    deprecation = findDeprecationForPath(allDeprecations, routePath);
  }

  const pageAsset = (pageContent as PageAssetShape)?.pageAsset;
  const urlContentMap =
    pageAsset?.urlContentMap || pageAsset?.page?.urlContentMap;
  const page = pageAsset?.page;
  const docsSlug = stripDocsPathRoot(routePath);

  const contentlet: UrlContentMapLike =
    urlContentMap ||
    {
      title: page?.title,
      navTitle: page?.friendlyName || page?.title,
    };
  const isExternalReadme = Boolean(contentlet?._map?.githubSource);

  // Special pages, flat URL-mapped docs, and external README mirrors share the
  // redesigned chrome via specialContent. Other BlockPages use the CMS body.
  if (specialPageKey || hasUrlMappedContent || isExternalReadme) {
    const sideNav = await getSideNav();

    if (specialPageKey) {
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
            allDeprecations={
              specialPageKey === 'deprecations' ? allDeprecations : undefined
            }
            allReleases={allReleases}
          />
        </Suspense>
      );
    } else if (contentlet?._map?.githubSource) {
      specialContent = (
        <Suspense
          fallback={
            <div className="min-h-[50vh] w-full animate-pulse bg-muted/15" />
          }
        >
          <GitHubDocumentation
            contentlet={contentlet}
            sideNav={sideNav}
            slug={docsSlug}
          />
        </Suspense>
      );
    } else {
      specialContent = (
        <Suspense
          fallback={
            <div className="min-h-[50vh] w-full animate-pulse bg-muted/15" />
          }
        >
          <Documentation
            contentlet={contentlet}
            sideNav={sideNav}
            slug={docsSlug}
            deprecation={deprecation}
          />
        </Suspense>
      );
    }

    // Body components render their own inline deprecation card.
    deprecation = null;
  }

  const docsSlugIndex = await getDocsSlugIndex();

  return (
    <DynamicBuildPageAsset
      pageContent={pageContent}
      buildNavigation={buildNavigation}
      specialContent={specialContent}
      deprecation={deprecation}
      docsSlugIndex={docsSlugIndex}
    />
  );
}
