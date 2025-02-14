import { headers } from 'next/headers';
import { PageAsset } from "@/components/page-asset";
import { ErrorPage } from "@/components/error";

import { handleVanityUrlRedirect } from "@/util/vanityUrlHandler";
import { client } from "@/util/dotcmsClient";
import { getPageRequestParams } from "@dotcms/client";
import { fetchNavData, fetchPageData } from "@/util/page.utils";

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
        const title = page?.friendlyName || page?.title;

        return {
            title,
        };
    } catch (e) {
        return {
            title: "not found",
        };
    }
}

export default async function Page({ params, searchParams }) {
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

    if (pageAsset?.vanityUrl) {
        handleVanityUrlRedirect(pageAsset?.vanityUrl);
    }

    return (
        <PageAsset 
            pageAsset={pageAsset} 

            serverPath={pathname}
        />
    );
}