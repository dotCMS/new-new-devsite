export type SpecialDocsPageKey =
  | 'changelogs'
  | 'current-releases'
  | 'all-releases'
  | 'previous-releases'
  | 'known-security-issues'
  | 'deprecations'
  | 'all-rest-apis'
  | 'javadocs';

/**
 * Leaf slugs that render a custom React page instead of plain documentation.
 *
 * `api-playground` is intentionally absent: it is a normal docs page that
 * describes the playground. The interactive OpenAPI UI lives on `all-rest-apis`.
 * `rest-api-sampler` is a retired route and must not be revived here.
 */
const SPECIAL_PAGE_KEYS = new Set<SpecialDocsPageKey>([
  'changelogs',
  'current-releases',
  'all-releases',
  'previous-releases',
  'known-security-issues',
  'deprecations',
  'all-rest-apis',
  'javadocs',
]);

/**
 * Resolve a special docs page from either its old flat URL or its new nested
 * URL. Both route trees keep the same leaf slug for these pages.
 */
export function resolveSpecialDocsPage(
  routePath: string | string[] | undefined,
): SpecialDocsPageKey | null {
  const path = Array.isArray(routePath)
    ? routePath.filter(Boolean).join('/')
    : routePath || '';
  const leaf = path
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .pop();

  if (!leaf || !SPECIAL_PAGE_KEYS.has(leaf as SpecialDocsPageKey)) {
    return null;
  }

  return leaf as SpecialDocsPageKey;
}
