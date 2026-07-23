import { getCacheKey, navCache } from '@/util/cacheService';
import {
  getDotCMSBuildNavigation,
  transformDotCMSBuildNavigation,
  type DynamicBuildNavigation,
  type DotCMSNavigationItem,
} from '@/services/docs/getDotCMSBuildNavigation';
import { PRIMARY_DOCS_PATH_ROOT } from '@/config/docs-path-roots';
import {
  addHrefToSlugIndex,
  type DocsSlugIndex,
} from '@/services/docs/resolveDocsHref';
import { graphqlResults } from '@/services/gql';

export type { DocsSlugIndex } from '@/services/docs/resolveDocsHref';
export {
  resolveDocsHref,
  lookupShallowDocsRedirect,
  lookupDocsMissRedirect,
  isShallowDocsPathname,
} from '@/services/docs/resolveDocsHref';

type GetDocsSlugIndexOptions = {
  /** DotNavigation URI — defaults to primary `/docs` tree */
  uri?: string;
  ttlSeconds?: number;
};

function collectHrefsFromBuildNavigation(
  navigation: DynamicBuildNavigation,
): string[] {
  const hrefs: string[] = [];

  for (const primary of navigation.primaryTabs ?? []) {
    if (primary.href) hrefs.push(primary.href);
    if (primary.activeHref) hrefs.push(primary.activeHref);

    const section = navigation.navByPrimaryTab?.[primary.id];
    if (!section) continue;

    for (const tab of section.tabs ?? []) {
      if (tab.href) hrefs.push(tab.href);
      if (tab.activeHref) hrefs.push(tab.activeHref);

      for (const group of section.navBySubTab?.[tab.id] ?? []) {
        for (const item of group.items ?? []) {
          if (item.href) hrefs.push(item.href);
        }
      }
    }
  }

  return hrefs;
}

export function buildSlugIndexFromBuildNavigation(
  navigation: DynamicBuildNavigation,
): DocsSlugIndex {
  const index: DocsSlugIndex = {};
  for (const href of collectHrefsFromBuildNavigation(navigation)) {
    addHrefToSlugIndex(index, href);
  }
  return index;
}

/** Nested DotNavigation selection without GraphQL fragments (middleware-safe). */
function buildInlineNavigationQuery(uri: string, depth = 6): string {
  const navFields = `
    code
    folder
    href
    order
    target
    title
    type
  `;

  let children = navFields;
  for (let i = 0; i < depth; i++) {
    children = `${navFields}
    children {
      ${children}
    }`;
  }

  return `{
    DotNavigation(uri: ${JSON.stringify(uri)}, depth: ${depth}) {
      ${children}
    }
  }`;
}

/**
 * Fetch + transform nav via graphqlResults (works in middleware; no SDK client).
 */
async function fetchBuildNavigationGraphql(
  uri: string,
): Promise<DynamicBuildNavigation> {
  const json = await graphqlResults(buildInlineNavigationQuery(uri), 600);
  const raw = json?.data?.DotNavigation as
    | DotCMSNavigationItem
    | null
    | undefined;
  return transformDotCMSBuildNavigation(raw ?? null);
}

/**
 * Cached leaf → nested `/docs/...` path map from DotNavigation.
 * Used for flat URL redirects and in-content bare-slug link resolution.
 */
export async function getDocsSlugIndex(
  options: GetDocsSlugIndexOptions = {},
): Promise<DocsSlugIndex> {
  const uri = options.uri ?? `/${PRIMARY_DOCS_PATH_ROOT}`;
  const ttlSeconds = options.ttlSeconds ?? 600;
  const cacheKey = getCacheKey(`docs-slug-index|${uri}|v1`);

  const cached = navCache.get<DocsSlugIndex>(cacheKey);
  if (cached) {
    return cached;
  }

  let navigation: DynamicBuildNavigation;
  try {
    navigation = await fetchBuildNavigationGraphql(uri);
  } catch (error) {
    console.error(
      'Slug index GraphQL fetch failed, falling back to page client:',
      error,
    );
    navigation = await getDotCMSBuildNavigation({
      uri,
      ttlSeconds,
    });
  }

  const index = buildSlugIndexFromBuildNavigation(navigation);

  if (Object.keys(index).length > 0) {
    navCache.set(cacheKey, index, ttlSeconds);
  }

  return index;
}
