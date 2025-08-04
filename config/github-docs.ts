/**
 * GitHub repository configuration interface
 */
export interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  starterGuide?: string;
}

/**
 * Configuration mapping docs slugs to GitHub repositories
 * These docs will be fetched from GitHub instead of dotCMS
 */
export const GITHUB_DOCS_MAP: Record<string, GitHubConfig> = {
  // Example SDK mappings - update with actual repo information
  'sdk-react-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/react/README.md',
    branch: 'main',
  },
  'sdk-angular-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/angular/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/angular'
  },
  'sdk-client-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/client/README.md',
    branch: 'main'
  },
  'sdk-experiments-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/experiments/README.md',
    branch: 'main'
  },
  'sdk-analytics-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/analytics/README.md',
    branch: 'main'
  },
  'sdk-types-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/types/README.md',
    branch: 'main'
  },
  'sdk-uve-library': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/libs/sdk/uve/README.md',
    branch: 'main'
  },
  'sdk-php-library': {
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'README.md',
    branch: 'main'
  },
  'sdk-nextjs-example': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/nextjs/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/nextjs'
  },
  'sdk-angular-example': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/angular/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/angular'
  },
  'sdk-astro-example': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'examples/astro/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/astro'
  },
  'sdk-laravel-example': {
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'examples/dotcms-laravel/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/laravel'
  },
  'sdk-symfony-example': {
    owner: 'dotCMS',
    repo: 'dotcms-php-sdk',
    path: 'examples/dotcms-symfony/README.md',
    branch: 'main',
    starterGuide: '/getting-started/integrations/symfony'
  },
  'sdk-dotnet-example': {
    owner: 'dotCMS',
    repo: 'dotnet-starter-example',
    path: 'README.md',
    branch: 'main'
  },
  'mcp-server': {
    owner: 'dotCMS',
    repo: 'core',
    path: 'core-web/apps/mcp-server/README.md',
    branch: 'main'
  },
  // Add more SDK mappings as needed
};

/**
 * Check if a docs slug should be fetched from GitHub
 * @param slug - The docs page slug
 * @returns boolean
 */
export function isGitHubDoc(slug: string): boolean {
  return slug in GITHUB_DOCS_MAP;
}

/**
 * Get GitHub configuration for a docs slug
 * @param slug - The docs page slug
 * @returns GitHub config or null if not found
 */
export function getGitHubConfig(slug: string): GitHubConfig | null {
  return GITHUB_DOCS_MAP[slug] || null;
}

/**
 * Build the raw GitHub URL for fetching content
 * @param config - GitHub configuration object
 * @returns The raw GitHub URL
 */
export function buildGitHubRawUrl(config: GitHubConfig): string {
  const { owner, repo, branch, path } = config;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
} 