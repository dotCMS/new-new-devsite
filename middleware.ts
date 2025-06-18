import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache for vanity URL lookups - includes negative caching
const vanityUrlCache = new Map<string, { 
  forwardTo: string | null; 
  action: number; 
  timestamp: number; 
  isVanityUrl: boolean 
}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Maximum number of entries to prevent unbounded growth

// Clean up expired entries from cache (less aggressive)
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of vanityUrlCache) {
    if (now - value.timestamp >= CACHE_TTL) {
      vanityUrlCache.delete(key);
    }
  }
}

// Clean up cache if it's getting too large (only when needed)
function cleanupCacheIfNeeded() {
  // Only cleanup if we're over the size limit
  if (vanityUrlCache.size <= MAX_CACHE_SIZE) {
    return;
  }
  
  // First, remove expired entries
  cleanupExpiredEntries();
  
  // If still too large, remove oldest entries
  if (vanityUrlCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(vanityUrlCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of entriesToRemove) {
      vanityUrlCache.delete(key);
    }
  }
}

// Escape pathname for GraphQL query to prevent injection issues
function escapeGraphQLString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function checkVanityUrl(pathname: string): Promise<{ forwardTo: string; action: number } | null> {
  // Check cache first (including negative cache)
  const cached = vanityUrlCache.get(pathname);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.isVanityUrl ? { forwardTo: cached.forwardTo!, action: cached.action } : null;
  }

  try {
    const dotcmsHost = process.env.NEXT_PUBLIC_DOTCMS_HOST;
    const authToken = process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN;
    
    if (!dotcmsHost || !authToken) {
      console.warn('Missing DOTCMS_HOST or AUTH_TOKEN for vanity URL check');
      return null;
    }

    // Escape pathname for GraphQL query
    const escapedPathname = escapeGraphQLString(pathname);

    // Use the same GraphQL query that your app uses for consistency
    const query = `
      {
        page(url: "${escapedPathname}", site:"173aff42881a55a562cec436180999cf") {
          vanityUrl {
            action
            forwardTo
            uri
          }
        }
      }
    `;

    const response = await fetch(`${dotcmsHost}/api/v1/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      // Short timeout to avoid blocking requests
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      const vanityUrl = data?.data?.page?.vanityUrl;
      
      // Clean up cache only when we're approaching the limit
      cleanupCacheIfNeeded();
      
      if (vanityUrl?.forwardTo) {
        // Cache positive result
        vanityUrlCache.set(pathname, {
          forwardTo: vanityUrl.forwardTo,
          action: vanityUrl.action || 302,
          timestamp: Date.now(),
          isVanityUrl: true
        });
        
        return { forwardTo: vanityUrl.forwardTo, action: vanityUrl.action || 302 };
      } else {
        // Cache negative result (this URL is NOT a vanity URL)
        vanityUrlCache.set(pathname, {
          forwardTo: null,
          action: 0,
          timestamp: Date.now(),
          isVanityUrl: false
        });
      }
    } else {
      console.warn(`Vanity URL API returned ${response.status} for ${pathname}`);
    }
  } catch (error) {
    console.error('Middleware: Error checking vanity URL:', error);
    // Don't cache errors - let them retry
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/.well-known/') ||
    // Skip files with extensions (CSS, JS, images, maps, etc.)
    /\.[a-zA-Z0-9]+(\?|$)/.test(pathname) ||
    // Skip common static file patterns
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.map') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // Check for vanity URL
  const vanityUrl = await checkVanityUrl(pathname);
  
  if (vanityUrl) {
    const { forwardTo, action } = vanityUrl;
    
    // Ensure the redirect URL is properly formatted
    let redirectUrl = forwardTo;
    if (!redirectUrl.startsWith('http') && !redirectUrl.startsWith('/')) {
      redirectUrl = '/' + redirectUrl;
    }
    
    // Use appropriate status code - handle all valid redirect codes
    const validRedirectCodes = [301, 302, 303, 307, 308];
    const statusCode = validRedirectCodes.includes(action) ? action : 302;
    
    console.log(`Vanity URL redirect: ${pathname} → ${redirectUrl} (${statusCode})`);
    
    return NextResponse.redirect(new URL(redirectUrl, request.url), statusCode);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (.css, .js, .png, etc.)
     * - Well-known paths (.well-known/)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$|\\.well-known).+)',
  ],
} 