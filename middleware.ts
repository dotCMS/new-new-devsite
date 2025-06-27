import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { vanityCache } from './util/cacheService';
import {  graphqlResults } from './services/gql';

interface VanityUrlEntry {
  forwardTo: string ;
  action: number;
  identifier: string;
}

const VanityUrl404:VanityUrlEntry ={forwardTo:"404",action:404,identifier:"404"};

const cacheTTL = 600;

const vanityUrlPrefix="dotVanity:";

// Escape pathname for GraphQL query to prevent injection issues
function escapeGraphQLString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function checkVanityUrl (pathname: string): Promise<VanityUrlEntry> {

    const pathKey = vanityUrlPrefix + pathname;


    // Check cache first (including negative cache)
    const cachedVanity:VanityUrlEntry = vanityCache.get(pathKey) as VanityUrlEntry;

    if(cachedVanity !=null){
        return cachedVanity;  
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
    
    const json = await graphqlResults(query); 
    const errors = json?.errors||[];
    console.debug("errors.length:", errors.length);
    console.debug("forwardTo:", json?.data?.page?.vanityUrl?.forwardTo);
    if(errors && errors.length>0 || ! json?.data?.page?.vanityUrl?.forwardTo){
        console.log("no vanity found for:", pathKey)
        vanityCache.set(pathKey,VanityUrl404)
        return VanityUrl404;
    }

    const foundVanityUrl = {forwardTo: json?.data?.page?.vanityUrl.forwardTo,action: json.data.page.vanityUrl.action,identifier: "vanityFound"};
    console.debug("foundVanity", foundVanityUrl);
    vanityCache.set(pathKey, foundVanityUrl, cacheTTL);

    return foundVanityUrl;

}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
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
  const vanityUrl:VanityUrlEntry = await checkVanityUrl(pathname);
  
  if (vanityUrl && vanityUrl.action!=404) {
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

  let response = NextResponse.next();

  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=15, stale-while-revalidate=300");
  response.headers.set("X-DOT-Cache-Control", "public, max-age=300, s-maxage=15, stale-while-revalidate=300");
  return response;
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$|\\.well-known).*)',
  ],
}
