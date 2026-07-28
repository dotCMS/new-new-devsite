import {
  getBuildNavUriForPath,
  getDocsPathRoot,
  type DocsPathRoot,
} from '@/config/docs-path-roots';
import {
  resolveSpecialDocsPage,
  type SpecialDocsPageKey,
} from '@/config/special-doc-pages';

export type DocsShell = 'legacy' | 'dynamic';

export type DocsExperience = {
  /**
   * Chrome + nav pipeline. Always `dynamic` (BuildSubNav / BuildSectionNav)
   * so flat `/docs/{slug}` and nested paths share one redesigned nav.
   */
  shell: DocsShell;
  /** First path segment when under a configured docs root */
  pathRoot: DocsPathRoot | null;
  /** DotNavigation URI for the redesigned side nav */
  navUri: string;
  /** Custom React page key, if any */
  specialPageKey: SpecialDocsPageKey | null;
  /** Normalized route path (no leading slash) */
  routePath: string;
  /**
   * True when the page is a URL-mapped DotcmsDocumentation contentlet
   * (flat legacy bodies rendered via Documentation / GitHubDocumentation).
   */
  hasUrlMappedContent: boolean;
};

type PageAssetLike = {
  urlContentMap?: { inode?: string | null } | null;
  page?: {
    url?: string | null;
    contentType?: string | null;
    urlContentMap?: { inode?: string | null } | null;
  } | null;
};

function normalizeRoutePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '');
}

function hasLegacyUrlMappedContent(
  pageAsset: PageAssetLike | null | undefined,
): boolean {
  const inode =
    pageAsset?.urlContentMap?.inode || pageAsset?.page?.urlContentMap?.inode;
  return Boolean(inode);
}

/**
 * Decide how a docs (or shadow-docs) URL should be rendered.
 *
 * All configured docs roots use the redesigned nav chrome (`shell: 'dynamic'`).
 * URL-mapped contentlets still render via Documentation / GitHubDocumentation
 * as `specialContent` inside that chrome.
 */
export function resolveDocsExperience(
  path: string,
  pageAsset: PageAssetLike | null | undefined,
): DocsExperience | null {
  const routePath = normalizeRoutePath(path);
  const pathRoot = getDocsPathRoot(routePath);

  if (!pathRoot) {
    return null;
  }

  return {
    shell: 'dynamic',
    pathRoot,
    navUri: getBuildNavUriForPath(routePath),
    specialPageKey: resolveSpecialDocsPage(routePath),
    routePath,
    hasUrlMappedContent: hasLegacyUrlMappedContent(pageAsset),
  };
}
