import {
  buildNpmCdnUrl,
  buildNpmRegistryUrl,
  ExternalDocConfig,
  GitHubConfig,
  NpmDocConfig,
} from '@/config/github-docs';
import { logRequest } from '@/util/logRequest';

interface ContentResult {
  // 'github' is the legacy name for "loaded from an external source" (npm or
  // GitHub); page.js keys on it to swap in the external content. 'dotcms' means
  // the fallback dotCMS content was used.
  content: string;
  source: 'github' | 'dotcms';
  config: GitHubConfig | null;
}

// Cache entry with expiration timestamp
interface CacheEntry {
  promise: Promise<string | null>;
  expireAt: number;
}

// Simple request-level cache to prevent duplicate fetches within the same request
const requestCache = new Map<string, CacheEntry>();

// Cache TTL: 1 minute
const CACHE_TTL = 60000;

/**
 * Clean expired entries from cache
 */
function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now > entry.expireAt) {
      requestCache.delete(key);
    }
  }
}

/**
 * Get cached entry if valid, otherwise return null
 */
function getCachedEntry(url: string): Promise<string | null> | null {
  const entry = requestCache.get(url);
  if (!entry) {
    return null;
  }
  
  // Check if entry is expired
  if (Date.now() > entry.expireAt) {
    requestCache.delete(url);
    return null;
  }
  
  return entry.promise;
}

/**
 * Set cache entry with expiration
 */
function setCacheEntry(url: string, promise: Promise<string | null>): void {
  // Clean expired entries periodically (only when setting new entries)
  if (requestCache.size > 10) {
    cleanExpiredEntries();
  }
  
  requestCache.set(url, {
    promise,
    expireAt: Date.now() + CACHE_TTL
  });
}

/**
 * Fetch a raw text resource, returning its body or null on any failure.
 * @param url - URL to fetch
 * @param label - label for request logging
 * @returns The response body text or null
 */
async function fetchText(url: string, label: string): Promise<string | null> {
  const response = await logRequest(() =>
    fetch(url, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'dotCMS-docs-site'
      },
      // Cache for 5 minutes
      next: { revalidate: 300 }
    }),
    label
  );

  if (!response || !response.ok) {
    console.error(`Failed to fetch ${url}: ${response?.status} ${response?.statusText}`);
    return null;
  }

  return response.text();
}

/**
 * Fetch the dist-tags map for an npm package from the registry.
 * @param pkg - npm package name
 * @returns A record of tag -> version, or null on failure
 */
async function fetchNpmDistTags(pkg: string): Promise<Record<string, string> | null> {
  const url = buildNpmRegistryUrl(pkg);

  try {
    const response = await logRequest(() =>
      fetch(url, {
        headers: {
          'Accept': 'application/vnd.npm.install-v1+json',
          'User-Agent': 'dotCMS-docs-site'
        },
        // Cache tag->version resolution for 5 minutes
        next: { revalidate: 300 }
      }),
      'fetchNpmDistTags'
    );

    if (!response || !response.ok) {
      console.error(`Failed to resolve npm metadata for ${pkg}: ${response?.status} ${response?.statusText}`);
      return null;
    }

    const metadata = await response.json();
    return (metadata?.['dist-tags'] as Record<string, string>) ?? null;
  } catch (error) {
    console.error(`Error fetching npm dist-tags for ${pkg}:`, error);
    return null;
  }
}

/**
 * Resolve an npm dist-tag (e.g. "beta") to a concrete published version.
 * @param config - npm doc configuration
 * @returns The resolved version string, or null if the tag/package is missing
 */
async function resolveNpmVersion(config: NpmDocConfig): Promise<string | null> {
  const distTags = await fetchNpmDistTags(config.pkg);
  const version = distTags?.[config.tag];

  if (!version) {
    console.warn(`npm package ${config.pkg} has no "${config.tag}" dist-tag`);
    return null;
  }

  return version;
}

/**
 * Check whether a published npm package has a given dist-tag.
 * Used to decide whether to offer a "beta docs" switch on a page.
 * @param pkg - npm package name
 * @param tag - dist-tag to look for, e.g. "beta"
 * @returns true if the tag is published, false otherwise
 */
export async function npmTagExists(pkg: string, tag: string): Promise<boolean> {
  const distTags = await fetchNpmDistTags(pkg);
  return Boolean(distTags?.[tag]);
}

/**
 * Fetch and process README content for an npm-sourced doc. Resolves the
 * dist-tag to a concrete version, then fetches that version's README from the
 * jsdelivr CDN so the docs always match the exact published (incl. beta) code.
 * @param config - npm doc configuration
 * @returns The processed markdown content or null if failed/unavailable
 */
async function fetchNpmContent(config: NpmDocConfig): Promise<string | null> {
  const version = await resolveNpmVersion(config);
  if (!version) {
    return null;
  }

  const url = buildNpmCdnUrl(config.pkg, version, 'README.md');
  console.log(`[npm Fetch] ${config.pkg}@${config.tag} -> ${version}: ${url}`);

  const content = await fetchText(url, 'fetchNpmContent');
  if (content === null) {
    return null;
  }

  return processNpmMarkdown(content, config.pkg, version);
}

/**
 * Fetch README content for an external (npm) doc.
 * Results are request-cached by their resolved source key.
 * @param config - external doc configuration
 * @returns The processed markdown content or null if failed/unavailable
 */
export async function fetchGitHubContent(config: ExternalDocConfig): Promise<string | null> {
  // Cache key is stable per source target (package + tag).
  const cacheKey = `npm:${config.pkg}@${config.tag}`;

  const cachedPromise = getCachedEntry(cacheKey);
  if (cachedPromise) {
    console.log(`[External Doc Cache] Using cached request for: ${cacheKey}`);
    return cachedPromise;
  }

  const fetchPromise = (async (): Promise<string | null> => {
    try {
      return await fetchNpmContent(config);
    } catch (error) {
      console.error(`Error fetching external doc content (${cacheKey}):`, error);
      return null;
    }
  })();

  setCacheEntry(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Remove H1 title header from the beginning of markdown content
 * @param content - Raw markdown content
 * @returns Content with H1 title removed
 */
function removeTitle(content: string): string {
  const lines = content.split('\n');
  let h1Index = -1;
  
  // Find the first H1 heading (starts with single #)
  // Scan through all content without stopping early to handle
  // multi-line comments, YAML front-matter, and other content
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check if it's an H1 heading (starts with single # followed by space)
    if (/^#\s/.test(line)) {
      h1Index = i;
      break;
    }
  }
  
  // Remove the H1 line if found
  if (h1Index !== -1) {
    lines.splice(h1Index, 1);
  }
  
  return lines.join('\n');
}

/**
 * Remove table of contents section from markdown content
 * @param content - Raw markdown content
 * @returns Content with TOC section removed
 */
function removeTableOfContents(content: string): string {
  const lines = content.split('\n');
  let tocStartIndex = -1;
  let tocEndIndex = -1;
  
  // Find the heading containing "Table of Contents" (case-insensitive)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check if it's a heading (starts with #) and contains "table of contents"
    if (/^#+\s/.test(line) && /table\s+of\s+contents/i.test(line)) {
      tocStartIndex = i;
      break;
    }
  }
  
  // If we found a TOC heading, find the next heading to determine where TOC ends
  if (tocStartIndex !== -1) {
    for (let i = tocStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check if it's a heading (starts with #)
      if (/^#+\s/.test(line)) {
        tocEndIndex = i;
        break;
      }
    }
    
    // If no next heading found, remove everything from TOC start to end of content
    if (tocEndIndex === -1) {
      tocEndIndex = lines.length;
    }
    
    // Remove the TOC section
    lines.splice(tocStartIndex, tocEndIndex - tocStartIndex);
  }
  
  return lines.join('\n');
}

/**
 * Strip the parts of a README we don't want on the docs page: a table of
 * contents section and the leading H1 title (the page renders its own title).
 * @param content - Raw markdown content
 * @returns Cleaned markdown content
 */
function stripReadmeChrome(content: string): string {
  // First, remove table of contents if present (including its heading)
  let processedContent = removeTableOfContents(content);
  // Then, remove any remaining H1 title header
  processedContent = removeTitle(processedContent);
  return processedContent;
}

/**
 * Rewrite relative markdown links, markdown images, and HTML <img> sources to
 * absolute URLs using the provided bases. Absolute URLs, site-absolute paths,
 * anchors, and special schemes (data:/mailto:/tel:) are left untouched.
 * @param content - Markdown content
 * @param linkBase - Base URL applied to relative links
 * @param assetBase - Base URL applied to relative images / img src
 * @returns Content with relative references rewritten
 */
function rewriteRelativeReferences(
  content: string,
  linkBase: string,
  assetBase: string,
): string {
  return content
    // Relative markdown images: ![alt](path) -> ![alt](assetBase/path)
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)(?!\/)(?!#)(?!data:)(?!mailto:)(?!tel:)(?:\.\/)?([^)]+)\)/g,
      `![$1](${assetBase}/$2)`
    )
    // Relative markdown links: [text](path) -> [text](linkBase/path)
    .replace(
      /\[([^\]]+)\]\((?!https?:\/\/)(?!\/)(?!#)(?!data:)(?!mailto:)(?!tel:)(?:\.\/)?([^)]+)\)/g,
      `[$1](${linkBase}/$2)`
    )
    // Relative HTML img src: <img src="path"> -> <img src="assetBase/path">
    .replace(
      /<img([^>]*)\s+src=["'](?!https?:\/\/)(?!\/)(?!#)(?!data:)(?!mailto:)(?!tel:)(?:\.\/)?([^"']+)["']/g,
      `<img$1 src="${assetBase}/$2"`
    );
}

/**
 * Process npm-sourced markdown content for the dotCMS docs site. Relative
 * references resolve against the resolved package version on the jsdelivr CDN
 * so links/images always match the exact published (incl. beta) artifact.
 * @param content - Raw README content from the npm package
 * @param pkg - npm package name
 * @param version - resolved concrete version
 * @returns Processed markdown content
 */
function processNpmMarkdown(content: string, pkg: string, version: string): string {
  const base = `https://cdn.jsdelivr.net/npm/${pkg}@${version}`;
  // For a self-contained package, both links and assets resolve to the CDN tree.
  return rewriteRelativeReferences(stripReadmeChrome(content), base, base);
}

/**
 * Get docs content from GitHub with fallback to dotCMS
 * @param slug - The docs page slug
 * @param githubConfig - GitHub configuration
 * @param fallbackFn - Function to call for dotCMS content
 * @returns Content object with source indicator
 */
export async function getDocsContentWithGitHub(
  slug: string, 
  githubConfig: GitHubConfig, 
  fallbackFn: () => Promise<string> | string
): Promise<ContentResult> {
  try {
    const githubContent = await fetchGitHubContent(githubConfig);
    
    if (githubContent) {
      return {
        content: githubContent,
        source: 'github',
        config: githubConfig
      };
    }
  } catch (error) {
    console.warn(`GitHub content fetch failed for ${slug}, falling back to dotCMS:`, error);
  }

  // Fallback to dotCMS
  const fallbackContent = await fallbackFn();
  return {
    content: fallbackContent,
    source: 'dotcms',
    config: null
  };
} 