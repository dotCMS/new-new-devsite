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

// Only treat known static asset extensions as files — not version-like slugs (e.g. block-editor-2.0)
const STATIC_FILE_EXTENSION =
  /\.(css|js|mjs|cjs|map|ico|png|jpe?g|svg|gif|webp|avif|woff2?|ttf|eot|pdf|zip|gz|txt|xml|json|webmanifest|mp4|webm|mp3|wav)(\?|$)/i;

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
    // Skip files with known static extensions (CSS, JS, images, maps, etc.)
    STATIC_FILE_EXTENSION.test(pathname) ||
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

  // Flat /docs/{slug} → nested canonical from build-nav slug index.
  // Use 302 while the nav redesign is in testing — 301s are sticky in browsers.
  // Switch DOCS_SLUG_REDIRECT_STATUS to 301 for production cutover.
  const DOCS_SLUG_REDIRECT_STATUS = 302;
  try {
    const {
      getDocsSlugIndex,
      lookupShallowDocsRedirect,
    } = await import('@/services/docs/getDocsSlugIndex');
    const index = await getDocsSlugIndex();
    const canonical = lookupShallowDocsRedirect(pathname, index);
    if (canonical) {
      const target = new URL(canonical, request.url);
      target.search = request.nextUrl.search;
      console.log(
        `Docs slug redirect: ${pathname} → ${canonical} (${DOCS_SLUG_REDIRECT_STATUS})`,
      );
      return NextResponse.redirect(target, DOCS_SLUG_REDIRECT_STATUS);
    }
  } catch (error) {
    console.error('Docs slug index redirect failed:', error);
  }

  let response = NextResponse.next();
  response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=120");
  response.headers.set("CDN-Cache-Control", "public, s-maxage=600, stale-while-revalidate=120");
  response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");  
  response.headers.set("X-dotcms", "oh yes!");
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|mjs|cjs|map|ico|png|jpe?g|svg|gif|webp|avif|woff2?|ttf|eot|pdf|zip|gz|txt|xml|json|webmanifest|mp4|webm|mp3|wav)$|\\.well-known).*)',
  ],
}
