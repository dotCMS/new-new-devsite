/**
 * External docs configuration.
 *
 * Docs pages listed here are sourced from the README shipped inside a published
 * npm package, resolved by dist-tag (e.g. `latest`, `beta`) instead of from
 * dotCMS. This lets us generate "beta" doc pages straight from a pre-release
 * published to npm.
 *
 * The legacy names (`GitHubConfig`, `isGitHubDoc`, `getGitHubConfig`) are kept
 * for backwards compatibility with existing imports.
 */

/**
 * npm-sourced doc: the README inside a published npm package, by dist-tag.
 */
export interface NpmDocConfig {
  source: 'npm';
  /** Full npm package name, e.g. "@dotcms/mcp-server" */
  pkg: string;
  /** npm dist-tag to resolve, e.g. "latest" or "beta" */
  tag: string;
  starterGuide?: string;
}

export type ExternalDocConfig = NpmDocConfig;

/**
 * Backwards-compatible alias for existing imports.
 */
export type GitHubConfig = ExternalDocConfig;

/**
 * Configuration mapping docs slugs to their npm source.
 * These docs are fetched from npm instead of dotCMS.
 *
 * The configured `tag` is the default dist-tag (usually `latest`). A page can
 * request a different published dist-tag at request time via the `?tag=` query
 * param (e.g. `/docs/mcp-server?tag=beta`) — see `withTag`.
 */
export const GITHUB_DOCS_MAP: Record<string, ExternalDocConfig> = {
  'sdk-react-library': {
    source: 'npm',
    pkg: '@dotcms/react',
    tag: 'latest',
  },
  'sdk-angular-library': {
    source: 'npm',
    pkg: '@dotcms/angular',
    tag: 'latest',
    starterGuide: '/getting-started/integrations/angular',
  },
  'sdk-client-library': {
    source: 'npm',
    pkg: '@dotcms/client',
    tag: 'latest',
  },
  'sdk-experiments-library': {
    source: 'npm',
    pkg: '@dotcms/experiments',
    tag: 'latest',
  },
  'sdk-analytics-library': {
    source: 'npm',
    pkg: '@dotcms/analytics',
    tag: 'latest',
  },
  'sdk-types-library': {
    source: 'npm',
    pkg: '@dotcms/types',
    tag: 'latest',
  },
  'sdk-uve-library': {
    source: 'npm',
    pkg: '@dotcms/uve',
    tag: 'latest',
  },
  'mcp-server': {
    source: 'npm',
    pkg: '@dotcms/mcp-server',
    tag: 'latest',
  },
};

/**
 * Allowed dist-tags a page may request via `?tag=`. Restricting this prevents
 * arbitrary/unpublished tag lookups against the registry.
 */
const ALLOWED_TAGS = ['latest', 'beta', 'next', 'alpha'] as const;

/**
 * Return a copy of an npm doc config with its dist-tag overridden, if the
 * requested tag is a recognized, allowed value. Unknown/empty tags are ignored
 * and the config's default tag is kept.
 * @param config - base external doc config
 * @param requestedTag - tag from the `?tag=` query param (may be undefined)
 * @returns config with the effective tag
 */
export function withTag(
  config: ExternalDocConfig,
  requestedTag?: string | null,
): ExternalDocConfig {
  if (!requestedTag) {
    return config;
  }

  const tag = requestedTag.toLowerCase();
  if (!ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])) {
    return config;
  }

  return { ...config, tag };
}

/**
 * Check if a docs slug should be fetched from an external (npm) source.
 * @param slug - The docs page slug
 * @returns boolean
 */
export function isGitHubDoc(slug: string): boolean {
  return slug in GITHUB_DOCS_MAP;
}

/**
 * Get the external source configuration for a docs slug.
 * @param slug - The docs page slug
 * @returns config or null if not found
 */
export function getGitHubConfig(slug: string): ExternalDocConfig | null {
  return GITHUB_DOCS_MAP[slug] || null;
}

/**
 * Build the npm registry metadata URL used to resolve a dist-tag to a version.
 * @param pkg - npm package name
 * @returns The registry URL returning package metadata (incl. dist-tags)
 */
export function buildNpmRegistryUrl(pkg: string): string {
  // encodeURIComponent turns the "/" in scoped names into %2f, which the
  // registry expects for scoped packages (e.g. @dotcms%2fmcp-server).
  return `https://registry.npmjs.org/${encodeURIComponent(pkg)}`;
}

/**
 * Build the jsdelivr URL for a file inside a published npm package version.
 * @param pkg - npm package name
 * @param version - concrete, resolved version (not a dist-tag)
 * @param file - path within the package (default README.md)
 * @returns The jsdelivr CDN URL
 */
export function buildNpmCdnUrl(
  pkg: string,
  version: string,
  file = 'README.md',
): string {
  return `https://cdn.jsdelivr.net/npm/${pkg}@${version}/${file}`;
}
