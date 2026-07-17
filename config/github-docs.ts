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

/**
 * GitHub-sourced doc: a README fetched directly from a repository.
 */
export interface GitHubReadmeDocConfig {
  source: 'github';
  owner: string;
  repo: string;
  path: string;
  branch: string;
  starterGuide?: string;
}

export type ExternalDocConfig = NpmDocConfig | GitHubReadmeDocConfig;

/**
 * Backwards-compatible alias for existing imports.
 */
export type GitHubConfig = ExternalDocConfig;

/**
 * Configuration mapping docs leaf slugs (or full paths) to their external source.
 *
 * Lookup tries, in order:
 * 1. the full path after `/docs/` or `/testing-devresource/`
 * 2. the final path segment (so nested shadow URLs resolve to the same entry
 *    as today's flat `/docs/{slug}` pages)
 *
 * Prefer npm for published packages (exact version + beta switch). Prefer
 * GitHub for repos/examples that are not published to npm.
 *
 * Temporary band-aid until README content is synced into dotCMS via automation.
 *
 * The configured `tag` is the default dist-tag (usually `latest`). A page can
 * request a different published dist-tag at request time via the `?tag=` query
 * param (e.g. `/docs/mcp-server?tag=beta`) — see `withTag`.
 */
export const GITHUB_DOCS_MAP: Record<string, ExternalDocConfig> = {
  // Published SDK packages — README from the npm artifact
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

  // Example projects / non-npm READMEs — fetch from GitHub
  'sdk-dotnet-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'dotnet-starter-example',
    path: 'README.md',
    branch: 'main',
  },
  'sdk-nextjs-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/nextjs/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/nextjs',
  },
  'sdk-angular-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/angular/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/angular',
  },
  'sdk-astro-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/astro/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/astro',
  },
  'sdk-laravel-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'examples/dotcms-laravel/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/laravel',
  },
  'sdk-symfony-example': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'examples/dotcms-symfony/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/symfony',
  },
  'sdk-php-library': {
    source: 'github',
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'README.md',
    branch: 'main',
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
  if (config.source !== 'npm' || !requestedTag) {
    return config;
  }

  const tag = requestedTag.toLowerCase();
  if (!ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])) {
    return config;
  }

  return { ...config, tag };
}

/**
 * Normalize either public route family into a path key.
 * @param slug - route params or a path, with or without a leading slash
 * @returns normalized path after `/docs/` or `/testing-devresource/`
 */
export function normalizeDocPath(slug: string | string[] | undefined): string {
  const slugArray = Array.isArray(slug) ? slug : slug ? [slug] : [];
  const path = slugArray
    .filter(Boolean)
    .join('/')
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '');

  return path.replace(/^(?:docs|testing-devresource)\//, '');
}

/**
 * Resolve a route path to a GITHUB_DOCS_MAP key.
 * Tries the full normalized path, then the final segment.
 */
function resolveDocMapKey(docPath: string): string | null {
  const normalized = normalizeDocPath(docPath);
  if (!normalized) {
    return null;
  }

  if (normalized in GITHUB_DOCS_MAP) {
    return normalized;
  }

  const leaf = normalized.split('/').filter(Boolean).pop();
  if (leaf && leaf in GITHUB_DOCS_MAP) {
    return leaf;
  }

  return null;
}

/**
 * Check if a docs path should be fetched from an external source.
 * @param docPath - full path after `/docs/` or `/testing-devresource/`
 * @returns boolean
 */
export function isGitHubDoc(docPath: string): boolean {
  return resolveDocMapKey(docPath) !== null;
}

/**
 * Get the external source configuration for a docs path.
 * @param docPath - full path after `/docs/` or `/testing-devresource/`
 * @returns config or null if not found
 */
export function getGitHubConfig(docPath: string): ExternalDocConfig | null {
  const key = resolveDocMapKey(docPath);
  return key ? GITHUB_DOCS_MAP[key] : null;
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
 * Build the raw GitHub URL for a repository-backed README.
 */
export function buildGitHubRawUrl(config: GitHubReadmeDocConfig): string {
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}`;
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
