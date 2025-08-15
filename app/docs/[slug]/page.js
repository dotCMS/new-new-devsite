import { notFound } from "next/navigation";

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";

import { graphqlResults , getGraphQLPageQuery} from "@/services/gql";

import { getSideNav } from "@/services/docs/getSideNav"
import { isGitHubDoc, getGitHubConfig } from "@/config/github-docs";
import { getDocsContentWithGitHub } from "@/services/docs/getGitHubContent";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import Documentation from "@/components/documentation/Documentation";
import GitHubDocumentation from "@/components/documentation/GitHubDocumentation";
import ChangeLogList from "@/components/changelogs/ChangeLogList";
import NavTree from "@/components/navigation/NavTree";
import CurrentReleases from "@/components/releases/CurrentReleases";
import AllReleases from "@/components/releases/AllReleases";
import AllSecurityIssues from "@/components/security-issues/AllSecurityIssues";
import RestApiPlayground from "@/components/playgrounds/RestApiPlayground/RestApiPlayground";
import SwaggerUIComponent from "@/components/playgrounds/SwaggerUIComponent/SwaggerUIComponent";
import Script from "next/script";

// Enable ISR with a revalidation time of 60 seconds
// This means the page will be regenerated at most once every 60 seconds
// when a request comes in after the revalidation period
export const revalidate = 60; // Revalidate every 60 seconds

// Optional: Control dynamic behavior
// 'force-static' ensures the page is statically generated at build time
// and uses ISR for updates
export const dynamic = 'force-static';

// Optional: Configure runtime
// Using Node.js runtime for better compatibility with ISR
export const runtime = 'nodejs';

/**
 * Process slug consistently across all functions
 * @param {string|string[]|undefined} slug - The slug from params
 * @returns {string} - The processed slug
 */
function processSlug(slug) {
    // Handle slug as array (for nested paths) or string, and ensure consistent processing
    const slugArray = Array.isArray(slug) ? slug : (slug ? [slug] : []);
    const processedSlug = slugArray.filter(Boolean).join('/').toLowerCase();
    // Convert 'table-of-contents' to empty string for consistency with GitHub docs check
    return processedSlug === 'table-of-contents' ? '' : processedSlug;
}

async function fetchPageData(path, searchParams, slug) {
    const finalPath = await path;
    const finalSearchParams = await searchParams;
    const pageRequestParams = getPageRequestParams({ path: finalPath, params: finalSearchParams });
    const query = getGraphQLPageQuery(pageRequestParams);
    
    const [result, sideNav] = await Promise.all([
        graphqlResults(query),
        getSideNav()
    ]);

    if (result?.errors && result.errors.length > 0) {
        console.error('GraphQL errors in docs page:', result.errors);
        notFound();
    }

    let pageAsset = graphqlToPageEntity(result.data);

    if (!pageAsset) {
        notFound();
    }

    // Check if this is a GitHub docs page
    if (isGitHubDoc(slug)) {
        const githubConfig = getGitHubConfig(slug);
        
        // Only proceed if githubConfig exists and pageAsset structure is valid
        if (githubConfig && pageAsset?.urlContentMap?._map) {
            // Fetch GitHub content with fallback to dotCMS
            const contentResult = await getDocsContentWithGitHub(
                slug,
                githubConfig,
                () => pageAsset?.urlContentMap?._map?.documentation || ''
            );

            // Replace the documentation content with GitHub content
            if (contentResult.source === 'github') {
                // Ensure urlContentMap and _map exist before mutation
                if (!pageAsset.urlContentMap) {
                    pageAsset.urlContentMap = {};
                }
                if (!pageAsset.urlContentMap._map) {
                    pageAsset.urlContentMap._map = {};
                }
                
                pageAsset.urlContentMap._map.documentation = contentResult.content;
                pageAsset.urlContentMap._map.githubSource = true;
                pageAsset.urlContentMap._map.githubConfig = contentResult.config;
            }
        }
    }

    return { pageAsset, sideNav, query, currentPath: finalPath };
}

/**
 * Generate metadata
 *
 * @export
 * @param {*} { params, searchParams }
 * @return {*}
 */
export async function generateMetadata({ params, searchParams }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    // Use consistent slug processing
    const slug = processSlug(finalParams.slug);
    const path = "/docs/" + (slug || "table-of-contents");
    const hostname = "https://dev.dotcms.com";
    const { pageAsset } = await fetchPageData(path, finalSearchParams, slug);
    
    // NOTE: Vanity URL redirects are now handled by middleware
    // If we reach this point, it's not a vanity URL or the redirect already happened
    
    // Check if urlContentMap exists before accessing _map
    if (!pageAsset?.urlContentMap?._map) {
        return {
            title: "Page Not Found",
            description: "The requested page could not be found"
        };
    }
    
    // Check if the page's tags include 'dot:meta-no-index'
    const tags = pageAsset.urlContentMap._map.tag || [];
    const shouldNoIndex = Array.isArray(tags) 
        ? tags.includes('dot:meta-no-index') 
        : typeof tags === 'string' && tags.includes('dot:meta-no-index');
    
    const metadata = {
        title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title),
        description: pageAsset.urlContentMap._map.seoDescription,
        keywords: pageAsset.urlContentMap._map.tag,
        openGraph: {
            title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title),
            description: pageAsset.urlContentMap._map.seoDescription,
            keywords: pageAsset.urlContentMap._map.tag,
            url: `${hostname}${path}`,
            siteName: 'dotCMS Docs',
            images: [{
                url: `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/}`,
                width: 1200,
                height: 630,
                alt: pageAsset.urlContentMap._map.seoDescription || pageAsset.urlContentMap._map.navTitle,
            }],
            locale: 'en_US',
            type: 'article',
        },
        alternates: {
            canonical: `${hostname}${path}`,
        },
        metadataBase: new URL(hostname),
    };
    
    // Add robots meta tag if 'dot:meta-no-index' is present
    if (shouldNoIndex) {
        metadata.robots = 'noindex, nofollow';
    }
    
    return metadata;
}


// JSON-LD component for documentation pages
function JsonLd({ pageData, path, hostname }) {
    // Add null checks for pageData and contentlet
    if (!pageData?.contentlet) {
        return null;
    }
    
    const title = pageData.contentlet.navTitle || pageData.contentlet.title || '';
    const description = pageData.contentlet.seoDescription || '';
    const datePublished = pageData.contentlet.publishDate || '';
    const dateModified = pageData.contentlet.modDate || '';
    const keywords = pageData.contentlet.tag || [];

    // Different schema types based on content
    let schemaType = "TechArticle"; // Default for documentation
    
    // Check for special content types and adjust schema
    if (path.includes("changelog") || path.includes("releases")) {
        schemaType = "SoftwareApplication";
    } else if (path.includes("api") || path.includes("rest-api")) {
        schemaType = "APIReference";
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "headline": title,
        "description": description,
        "datePublished": datePublished,
        "dateModified": dateModified,
        "image": `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/`,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${hostname}${path}`
        },
        "publisher": {
            "@type": "Organization",
            "name": "dotCMS",
            "logo": {
                "@type": "ImageObject",
                "url": `${hostname}/images/dotcms-logo.png`
            }
        }
    };

    // Add properties specific to certain schema types
    if (schemaType === "SoftwareApplication") {
        jsonLd.applicationCategory = "CMS";
        jsonLd.operatingSystem = "All";
    }

    // Add keywords if available
    if (keywords && keywords.length > 0) {
        jsonLd.keywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    }

    return (
        <Script 
            id="docs-jsonld" 
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default async function Home({ searchParams, params }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;

    const resetNav = finalSearchParams.n === "0";
    // Use consistent slug processing
    const slug = processSlug(finalParams.slug);
    const path = "/docs/" + (slug || "table-of-contents");
    const hostname = "https://dev.dotcms.com";
    const { pageAsset, sideNav } = await fetchPageData(path, finalSearchParams, slug);
    
    // NOTE: Vanity URL redirects are now handled by middleware
    // If we reach this point, it's not a vanity URL or the redirect already happened
    
    // Check if urlContentMap exists before accessing _map
    if (!pageAsset?.urlContentMap?._map) {
        notFound();
    }
    
    const data = {
        contentlet: pageAsset.urlContentMap._map,
        sideNav: sideNav,
        currentPath: slug,
        searchParams: finalSearchParams
    }
    
    // Add more path-component mappings here as needed:
    // "path-name": (contentlet) => <ComponentName contentlet={contentlet} />,
    const componentMap = {
        "changelogs": (data) => <ChangeLogList {...data} slug={slug} />,
        "current-releases": (data) => <CurrentReleases  {...data} slug={slug} />,
        "all-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "previous-releases": (data) => <AllReleases  {...data} slug={slug} />,
        "known-security-issues": (data) => <AllSecurityIssues  {...data} slug={slug} />,
        "rest-api-sampler": (data) => <RestApiPlayground {...data} slug={slug} />,
        "all-rest-apis": (data) => <SwaggerUIComponent {...data} slug={slug} />,
        default: (data) => {
            // Check if this is GitHub-sourced content
            if (data.contentlet.githubSource) {
                return <GitHubDocumentation {...data} slug={slug} />;
            }
            return <Documentation {...data} slug={slug} />;
        }
    };


    return (
        <div className="flex flex-col min-h-screen">
            <Header sideNavItems={sideNav[0]?.dotcmsdocumentationchildren || []} currentPath={slug} />
            <JsonLd pageData={data} path={path} hostname={hostname} />
            
            <div className="flex-1">
                <div className="flex flex-col lg:flex-row container mx-auto px-0">
                    {/* Left Navigation - Hide on mobile */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <NavTree
                            items={sideNav[0]?.dotcmsdocumentationchildren || []}
                            currentPath={slug}
                            resetNav={resetNav}
                        />
                    </div>

                    {/* Main Content - Full width on mobile */}
                    <main className="flex-1 min-w-0 px-6 sm:px-6 lg:px-8">
                        {(componentMap[slug] || componentMap.default)(data)}
                    </main>
                </div>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );

}
