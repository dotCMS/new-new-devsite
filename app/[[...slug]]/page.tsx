import { headers } from 'next/headers';
import { PageAsset as PageAssetComponent } from "@/components/page-asset";
import { ErrorPage } from "@/components/error";
import { Metadata } from 'next';

import { handleVanityUrlRedirect } from "@/util/vanityUrlHandler";
import { client } from "@/util/dotcmsClient";
import { getPageRequestParams } from "@dotcms/client";
import { fetchNavData, fetchPageData } from "@/util/page.utils";
import { BlockPageAsset } from "@/components/page-asset-with-content-block";

interface PageProps {
    params: Promise<{ slug?: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generate metadata
 */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const path = finalParams?.slug?.join("/") || "/";
    const pageRequestParams = getPageRequestParams({
        path,
        params: finalSearchParams,
    });

    try {
        const data = await client.page.get(pageRequestParams);
        const page = data.page;
        const title = page?.friendlyName || page?.title;

        const description = page?.description || page?.teaser || page?.seoDescription || "dotCMS Dev Site, Documentation and Resources. Learn how to build with dotCMS";
        const hostname = "https://dev.dotcms.com";  
        const keywords = page?.tags ? page?.tags.join(", ") : "dotcms, dotcms documentation, learn dotcms, dotcms api, dotcms dev, dotcms developer, dotcms developer documentation, dotcms developer api, dotcms developer documentation, dotcms developer api";
        
        return {
            title: title,
            description: description,
            keywords: keywords,
            alternates: {
                canonical: `${hostname}${path}`,
            },
            metadataBase: new URL(hostname),
            openGraph: {
                title: title,
                description: description,
                url: `${hostname}${path}`,
                siteName: 'dotCMS Docs',
                images: [{
                    url: `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/`,
                    width: 1200,
                    height: 630,
                    alt: description || title,
                }],
                locale: 'en_US',
                type: 'article',
            },
        };
    } catch (e) {
        console.error('Error generating metadata:', e.message);
        return {
            title: "Page Not Found",
            description: "The requested page could not be found.",
        };
    }
}

export default async function Page({ params, searchParams }: PageProps) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";

    const getPageData = async () => {
        const path = finalParams?.slug?.join("/") || "/";
        const pageParams = getPageRequestParams({
            path,
            params: finalSearchParams,
        });

        const { pageAsset, error: pageError } = await fetchPageData(pageParams);

        return {
            pageAsset,
            error: pageError,
        };
    };
    
    const { pageAsset, error } = await getPageData();

    if (error) {
        return <ErrorPage error={error} />;
    }
    
    if (!pageAsset) {
        return <ErrorPage error={{ message: "Page not found", status: 404 } as any} />;
    }

    // Type assertion to help TypeScript understand the structure
    const typedPageAsset = pageAsset as any;

    if (typedPageAsset?.vanityUrl) {
        handleVanityUrlRedirect(typedPageAsset?.vanityUrl);
    }
    const isBlockPage = typedPageAsset?.page?.contentType==="BlockPage"
    if(isBlockPage) {

        // Extract the correct folder path for navigation
        const pathParts = typedPageAsset.page?.url?.split("/").filter((part: string) => part.length > 0) || [];
        const folderNavPath = pathParts.length > 0 ? `/${pathParts[0]}` : "/";

        const { nav } = await fetchNavData({
            languageId: 1, 
            path: folderNavPath, 
            depth: 4
        });

        return (
            <BlockPageAsset 
                pageAsset={typedPageAsset} 
                nav={nav}
                serverPath={pathname}
            />
        );
    }
    
    return (
        <PageAssetComponent 
            pageAsset={typedPageAsset} 
            nav={null}
            serverPath={pathname}
        />
    );
}
