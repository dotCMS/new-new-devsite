import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDotCMSPage } from "@/util/getDotCMSPage";
import { normalizeDocPath } from "@/config/github-docs";
import { applyExternalDocContent } from "@/services/docs/applyExternalDocContent";
import { resolveDocsExperience } from "@/services/docs/resolveDocsExperience";
import { renderDynamicDocsExperience } from "@/services/docs/renderDynamicDocsExperience";
import { transformDotCMSBuildNavigation } from "@/services/docs/getDotCMSBuildNavigation";

// ISR: Revalidate pages every 60 seconds
export const revalidate = 60;
import { getSideNav } from "@/services/docs/getSideNav"
import Footer from "@/components/footer";
import { DocsPageShell } from "@/components/docs/DocsPageShell";
import Documentation from "@/components/documentation/Documentation";
import GitHubDocumentation from "@/components/documentation/GitHubDocumentation";
import { SpecialDocsPageContent } from "@/components/docs/SpecialDocsPageContent";
import { getNavSections } from "@/services/docs/getNavSections";
import Script from "next/script";
import { getSecurityIssues } from "@/services/docs/getSecurityIssues/getSecurityIssues";
import getDeprecations from "@/services/docs/getDeprecations/getDeprecations";

/**
 * Process slug consistently across all functions.
 * Returns the full path after `/docs/` (supports nested routes).
 * @param {string|string[]|undefined} slug - The slug from params
 * @returns {string} - The processed docs path
 */
function processSlug(slug) {
    const processedSlug = normalizeDocPath(slug);
    // Convert 'table-of-contents' to empty string for the TOC page
    return processedSlug === 'table-of-contents' ? '' : processedSlug;
}

/**
 * Check whether a docs path matches a known single-segment page key.
 * @param {string} slug - processed docs path
 * @param {string} pageKey - page identifier (e.g. `changelogs`)
 * @returns {boolean}
 */
function matchesPageSlug(slug, pageKey) {
    return slug === pageKey || slug.endsWith(`/${pageKey}`);
}

async function fetchPageData(path, slug, requestedTag) {
    const finalPath = await path;
    const pageData = await getDotCMSPage(finalPath);

    if (!pageData || !pageData.pageAsset) {
        notFound();
        return null; // Unreachable, but ensures code path terminates
    }

    const { pageAsset } = pageData;

    const sideNav = await getSideNav();

    await applyExternalDocContent(slug, requestedTag, pageAsset);

    return { pageAsset, sideNav, currentPath: finalPath, pageData };
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
    const slug = processSlug(finalParams.slug);
    const path = "/docs/" + (slug || "table-of-contents");
    const hostname = "https://dev.dotcms.com";
    const { pageAsset } = await fetchPageData(path, slug, finalSearchParams.tag);
    const experience = resolveDocsExperience(path, pageAsset);

    // Dynamic/reorg pages may lack urlContentMap.inode; use page fields instead.
    if (experience?.shell === "dynamic") {
        const page = pageAsset?.page;
        const title = page?.friendlyName || page?.title || "dotCMS Docs";
        const description =
            page?.description ||
            page?.teaser ||
            page?.seoDescription ||
            "dotCMS Dev Site, Documentation and Resources";

        return {
            title,
            description,
            alternates: { canonical: `${hostname}${path}` },
            metadataBase: new URL(hostname),
        };
    }

    if (!pageAsset?.urlContentMap?.inode) {
        return {
            title: "Page Not Found",
            description: "The requested page could not be found"
        };
    }
    
    // Check if the page's tags include 'dot:meta-no-index'
    const tags = pageAsset.urlContentMap?.tag ?? [];
    const shouldNoIndex = Array.isArray(tags)
        ? tags.includes('dot:meta-no-index')
        : typeof tags === 'string' && tags.includes('dot:meta-no-index');
    
    // Check if this is a security issue detail page
    let title = pageAsset.urlContentMap.navTitle || pageAsset.urlContentMap.title;
    
    if (matchesPageSlug(slug, 'known-security-issues') && finalSearchParams.issueNumber) {
        try {
            const { securityIssues } = await getSecurityIssues(1, 1, undefined, false, finalSearchParams.issueNumber);
            if (securityIssues && securityIssues.length > 0) {
                title = `${securityIssues[0].issueNumber} | Known Security Issues`;
            }
        } catch (error) {
            console.warn('Failed to fetch security issue for metadata:', error);
            // Fall back to default title
        }
    }
    
    const metadata = {
        title: title,
        description: pageAsset.urlContentMap.seoDescription,
        keywords: pageAsset.urlContentMap.tag,
        openGraph: {
            title: title,
            description: pageAsset.urlContentMap.seoDescription,
            keywords: pageAsset.urlContentMap.tag,
            url: `${hostname}${path}`,
            siteName: 'dotCMS Docs',
            images: [{
                url: `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/}`,
                width: 1200,
                height: 630,
                alt: pageAsset.urlContentMap.seoDescription || pageAsset.urlContentMap.navTitle,
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

    // Use consistent slug processing
    const slug = processSlug(finalParams.slug);
    const path = "/docs/" + (slug || "table-of-contents");
    const hostname = "https://dev.dotcms.com";
    const pageData = await getDotCMSPage(path);

    if (!pageData || !pageData.pageAsset) {
        notFound();
        return null;
    }

    const { pageAsset } = pageData;
    await applyExternalDocContent(slug, finalSearchParams.tag, pageAsset);

    const experience = resolveDocsExperience(path, pageAsset);
    const buildNavigation = transformDotCMSBuildNavigation(
        pageData?.content?.buildNavigation
    );

    // Redesigned nested /docs pages share the dynamic shell with testing-devresource.
    if (experience?.shell === "dynamic") {
        return renderDynamicDocsExperience({
            experience,
            pageContent: pageData,
            buildNavigation,
            searchParams: finalSearchParams,
        });
    }

    // Legacy flat /docs/{slug} URL-mapped documentation
    if (!pageAsset?.urlContentMap?.inode) {
        notFound();
    }

    const sideNav = await getSideNav();
    const navSections = await getNavSections({
        path: "/docs/nav",
        depth: 4,
        languageId: 1,
        ttlSeconds: 600,
    });

    const specialPageKey = experience?.specialPageKey ?? null;

    let allDeprecations = null;
    try {
        allDeprecations = await getDeprecations();
    } catch (e) {
        console.error("Error fetching deprecations:", e);
        allDeprecations = null;
    }

    const leafSlug = slug.split("/").filter(Boolean).pop() || slug;

    let deprecationForPage = null;
    if (allDeprecations && Array.isArray(allDeprecations)) {
        deprecationForPage =
            allDeprecations.find(
                (dep) =>
                    dep.docLinks &&
                    Array.isArray(dep.docLinks) &&
                    dep.docLinks.some(
                        (link) =>
                            link.urlTitle === slug || link.urlTitle === leafSlug
                    )
            ) || null;
    }

    const data = {
        contentlet: pageAsset.urlContentMap,
        sideNav,
        currentPath: slug,
        searchParams: finalSearchParams,
        deprecation: deprecationForPage,
        allDeprecations: specialPageKey === "deprecations" ? allDeprecations : undefined,
    };

    const pageBody = specialPageKey ? (
        <SpecialDocsPageContent
            pageKey={specialPageKey}
            slug={slug}
            sideNav={sideNav}
            contentlet={pageAsset.urlContentMap}
            searchParams={finalSearchParams}
            allDeprecations={data.allDeprecations}
        />
    ) : data.contentlet._map?.githubSource ? (
        <GitHubDocumentation {...data} slug={slug} />
    ) : (
        <Documentation {...data} slug={slug} />
    );


    return (
        <div className="flex flex-col min-h-screen">
            <JsonLd pageData={data} path={path} hostname={hostname} />
            <Suspense
                fallback={
                    <div className="min-h-[50vh] w-full animate-pulse bg-muted/15" />
                }
            >
                <DocsPageShell
                    sideNavItems={sideNav[0]?.dotcmsdocumentationchildren || []}
                    currentPath={slug}
                    navSections={navSections}
                    footer={
                        pageAsset.layout.footer ? <Footer variant="content" /> : null
                    }
                >
                    {pageBody}
                </DocsPageShell>
            </Suspense>
        </div>
    );

}
