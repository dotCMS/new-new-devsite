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
  /** Which chrome + body pipeline to use */
  shell: DocsShell;
  /** First path segment when under a configured docs root */
  pathRoot: DocsPathRoot | null;
  /** DotNavigation URI for the redesigned side nav */
  navUri: string;
  /** Custom React page key, if any */
  specialPageKey: SpecialDocsPageKey | null;
  /** Normalized route path (no leading slash) */
  routePath: string;
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

function hasLegacyUrlMappedContent(pageAsset: PageAssetLike | null | undefined): boolean {
  const inode =
    pageAsset?.urlContentMap?.inode || pageAsset?.page?.urlContentMap?.inode;
  return Boolean(inode);
}

function isBlockPage(pageAsset: PageAssetLike | null | undefined): boolean {
  return pageAsset?.page?.contentType === 'BlockPage';
}

/**
 * Decide how a docs (or shadow-docs) URL should be rendered.
 *
 * - `legacy`: flat `/docs/{slug}` URL-mapped DotcmsDocumentation pages
 *   (require urlContentMap.inode; DocsPageShell)
 * - `dynamic`: redesigned tree pages (BlockPage / missing inode) under any
 *   docs path root, including `/testing-devresource` and nested `/docs/...`
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

  const specialPageKey = resolveSpecialDocsPage(routePath);
  const navUri = getBuildNavUriForPath(routePath);
  const legacyContent = hasLegacyUrlMappedContent(pageAsset);
  const blockPage = isBlockPage(pageAsset);

  // Shadow root is always the redesigned experience.
  if (pathRoot === 'testing-devresource') {
    return {
      shell: 'dynamic',
      pathRoot,
      navUri,
      specialPageKey,
      routePath,
    };
  }

  // Nested / BlockPage / no URL-map inode → redesigned shell.
  // Flat URL-mapped docs (inode present, not BlockPage) → legacy shell.
  const shell: DocsShell =
    blockPage || !legacyContent ? 'dynamic' : 'legacy';

  return {
    shell,
    pathRoot,
    navUri,
    specialPageKey,
    routePath,
  };
}
