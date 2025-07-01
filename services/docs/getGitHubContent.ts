import { buildGitHubRawUrl, GitHubConfig } from '@/config/github-docs';
import { logRequest } from '@/util/logRequest';

interface ContentResult {
  content: string;
  source: 'github' | 'dotcms';
  config: GitHubConfig | null;
}

// Simple request-level cache to prevent duplicate fetches within the same request
const requestCache = new Map<string, Promise<string | null>>();

// Clear cache periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    requestCache.clear();
  }, 60000); // Clear every minute
}

/**
 * Fetch README content from GitHub raw URL
 * @param config - GitHub configuration object
 * @returns The markdown content or null if failed
 */
export async function fetchGitHubContent(config: GitHubConfig): Promise<string | null> {
  const url = buildGitHubRawUrl(config);
  
  // Check if we already have a pending request for this URL
  if (requestCache.has(url)) {
    console.log(`[GitHub Cache] Using cached request for: ${url}`);
    return requestCache.get(url)!;
  }

  // Create and cache the promise
  const fetchPromise = (async (): Promise<string | null> => {
    try {
      console.log(`[GitHub Fetch] Fetching content from: ${url}`);
      
      const response = await logRequest(() =>
        fetch(url, {
          headers: {
            'Accept': 'text/plain',
            'User-Agent': 'dotCMS-docs-site'
          },
          // Cache for 5 minutes
          next: { revalidate: 300 }
        }),
        'fetchGitHubContent'
      );

      if (!response || !response.ok) {
        console.error(`Failed to fetch GitHub content: ${response?.status} ${response?.statusText}`);
        return null;
      }

      const content = await response.text();
      return processGitHubMarkdown(content, config);
    } catch (error) {
      console.error('Error fetching GitHub content:', error);
      return null;
    } finally {
      // Remove from cache after completion to allow fresh requests
      setTimeout(() => requestCache.delete(url), 1000);
    }
  })();

  requestCache.set(url, fetchPromise);
  return fetchPromise;
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
 * Process GitHub markdown content for dotCMS docs site
 * @param content - Raw markdown content from GitHub
 * @param config - GitHub configuration object
 * @returns Processed markdown content
 */
function processGitHubMarkdown(content: string, config: GitHubConfig): string {
  const { owner, repo, branch } = config;
  const baseUrl = `https://github.com/${owner}/${repo}`;
  const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  
  // First, remove table of contents if present
  let processedContent = removeTableOfContents(content);

  // Convert relative links to absolute GitHub URLs
  // Handle markdown links like [text](./path) or [text](path)
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\((?!https?:\/\/)(?:\.\/)?([^)]+)\)/g,
    `[$1](${baseUrl}/blob/${branch}/$2)`
  );

  // Convert relative image references to raw GitHub URLs
  // Handle images like ![alt](./path) or ![alt](path)
  processedContent = processedContent.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)(?:\.\/)?([^)]+)\)/g,
    `![$1](${rawBaseUrl}/$2)`
  );

  // Convert relative HTML img tags to raw GitHub URLs
  processedContent = processedContent.replace(
    /<img([^>]*)\s+src=["'](?!https?:\/\/)(?:\.\/)?([^"']+)["']/g,
    `<img$1 src="${rawBaseUrl}/$2"`
  );

  // Convert anchor links to the current page (keep them as-is for now)
  // These will work with the OnThisPage component

  // Add a header note indicating this is from GitHub
  const githubNote = `> **Note**: This documentation is automatically synchronized from the [${repo} repository](${baseUrl}).\n\n`;
  
  processedContent = githubNote + processedContent;

  return processedContent;
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