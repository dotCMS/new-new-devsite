import { headers } from 'next/headers';
import { PageAsset } from "@/components/page-asset";
import { ErrorPage } from "@/components/error";

import { handleVanityUrlRedirect } from "@/util/vanityUrlHandler";
import { client } from "@/util/dotcmsClient";
import { getPageRequestParams } from "@dotcms/client";
import { fetchNavData, fetchPageData } from "@/util/page.utils";
import { BlockPageAsset } from "@/components/page-asset-with-content-block";
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
    const path = finalParams?.slug?.join("/") || "/";
    const pageRequestParams = getPageRequestParams({
        path,
        params: finalSearchParams,
    });

    try {

        const data = await client.page.get(pageRequestParams);
        const page = data.page;

        // NOTE: Vanity URL redirects are now handled by middleware
        // If we reach this point, it's not a vanity URL or the redirect already happened
        
        const title = page?.friendlyName || page?.title;

        const description = page?.description || page?.teaser || page?.seoDescription || "dotCMS Dev Site, Documentation and Resources. Learn how to build with dotCMS";
        const hostname = "https://dev.dotcms.com";  
        const keywords = page?.tags ? page?.tags.join(", ") : "dotcms, dotcms documentation, learn dotcms, dotcms api, dotcms dev, dotcms developer, dotcms developer documentation, dotcms developer api, dotcms developer documentation, dotcms developer api";
        
        return {
            title: title,
            "description": description,
            url: `${hostname}${path}`,
            siteName: 'dotCMS Docs',
            keywords: keywords,
            alternates: {
                canonical: `${hostname}${path}`,
            },
            metadataBase: new URL(hostname),
            images: [{
                url: `${hostname}/dA/4b13a794db115b14ce79d30850712188/1024maxw/80q/}`,
                width: 1200,
                height: 630,
                alt: description || title,
            }],
            locale: 'en_US',
            type: 'article',
        };
    } catch (e) {
        console.error('Error generating metadata:', e.message);
        return {
            title: "not found",
        };
    }
}

export default async function Page({ params, searchParams }) {
    const finalParams = await params;
    // We dont need send the mode on the params
    const { mode, ...finalSearchParams } = await searchParams;
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
            error: pageError ,
        };
    };
    const { pageAsset, error } = await getPageData();

    // Move this to MyPage
    if (error) {
        return <ErrorPage error={error} />;
    }
    if(!pageAsset) {
        return <ErrorPage error={{ message: "Page not found", status: 404 }} />;
    }

    // NOTE: Vanity URL redirects are now handled by middleware
    // If we reach this point, it's not a vanity URL or the redirect already happened
    
    const isBlockPage = pageAsset?.page?.contentType==="BlockPage"
    if(isBlockPage) {

        // Extract the correct folder path for navigation
        const pathParts = pageAsset?.page?.url.split("/").filter(part => part.length > 0);


        const folderNavPath = pathParts.length > 0 ? `/${pathParts[0]}` : "/"

        const { nav, error: navError } = await fetchNavData({languageId: 1, path: folderNavPath, depth: 4});



        return (
            <BlockPageAsset 
            pageAsset ={pageAsset} 
            nav={nav}
            currentPath={pageAsset?.page?.url}
            serverPath={pathname}
        />
        );
    }
    return (
        <PageAsset 
            pageAsset={pageAsset} 

            serverPath={pathname}
        />
    );
}
