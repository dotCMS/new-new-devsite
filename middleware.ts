import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory cache for vanity URL lookups
const vanityUrlCache = new Map<string, { forwardTo: string; action: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Maximum number of entries to prevent unbounded growth

// Clean up expired entries from cache
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of vanityUrlCache) {
    if (now - value.timestamp >= CACHE_TTL) {
      vanityUrlCache.delete(key);
    }
  }
}

// Clean up cache if it's getting too large
function cleanupCache() {
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

async function checkVanityUrl(pathname: string): Promise<{ forwardTo: string; action: number } | null> {
  // Check cache first
  const cached = vanityUrlCache.get(pathname);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { forwardTo: cached.forwardTo, action: cached.action };
  }

  try {
    const dotcmsHost = process.env.NEXT_PUBLIC_DOTCMS_HOST;
    const authToken = process.env.NEXT_PUBLIC_DOTCMS_AUTH_TOKEN; // Reverted - this was working before
    
    if (!dotcmsHost || !authToken) {
      console.warn('Missing DOTCMS_HOST or AUTH_TOKEN for vanity URL check');
      return null;
    }

    // Use the same GraphQL query that your app uses for consistency
    const query = `
      {
        page(url: "${pathname}", site:"173aff42881a55a562cec436180999cf") {
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
      
      if (vanityUrl?.forwardTo) {
        // Clean up cache before adding new entry
        cleanupCache();
        
        // Cache the result
        vanityUrlCache.set(pathname, {
          forwardTo: vanityUrl.forwardTo,
          action: vanityUrl.action || 302,
          timestamp: Date.now()
        });
        
        return { forwardTo: vanityUrl.forwardTo, action: vanityUrl.action || 302 };
      }
    }
  } catch (error) {
    console.error('Middleware: Error checking vanity URL:', error);
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