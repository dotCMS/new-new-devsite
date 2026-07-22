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
import Script from "next/script";
import { getSecurityIssues } from "@/services/docs/getSecurityIssues/getSecurityIssues";

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
        return { pageAsset: null };
    }

    await applyExternalDocContent(slug, requestedTag, pageData.pageAsset);
    return pageData;
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
    if (experience?.shell === "dynamic" && !experience.hasUrlMappedContent) {
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
        } catch (e) {
            console.error("Error fetching security issue for metadata:", e);
        }
    }
    
    return {
        title: title,
        description: pageAsset.urlContentMap.seoDescription,
        keywords: pageAsset.urlContentMap.tag,
        alternates: {
            canonical: `${hostname}${path}`,
        },
        metadataBase: new URL(hostname),
        ...(shouldNoIndex && {
            robots: {
                index: false,
                follow: false,
            }
        })
    };
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
        "image": `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/}`,
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
    if (!experience) {
        notFound();
        return null;
    }

    const buildNavigation = transformDotCMSBuildNavigation(
        pageData?.content?.buildNavigation
    );

    const docsBody = await renderDynamicDocsExperience({
        experience,
        pageContent: pageData,
        buildNavigation,
        searchParams: finalSearchParams,
    });

    if (experience.hasUrlMappedContent && pageAsset.urlContentMap) {
        return (
            <>
                <JsonLd
                    pageData={{ contentlet: pageAsset.urlContentMap }}
                    path={path}
                    hostname={hostname}
                />
                {docsBody}
            </>
        );
    }

    return docsBody;
}
