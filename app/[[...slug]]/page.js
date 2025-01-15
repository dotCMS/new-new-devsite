import { headers } from 'next/headers';
import { PageAsset } from "@/components/page-asset";
import { ErrorPage } from "@/components/error";

import { handleVanityUrlRedirect } from "@/lib/vanityUrlHandler";
import { client } from "@/lib/dotcmsClient";
import { getPageRequestParams } from "@dotcms/client";
import { fetchNavData, fetchPageData } from "@/lib/page.utils";

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
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";

    const getPageData = async () => {
        const path = params?.slug?.join("/") || "/";
        const pageParams = getPageRequestParams({
            path,
            params: searchParams,
        });

        const { pageAsset, error: pageError } = await fetchPageData(pageParams);
        const { nav, error: navError } = await fetchNavData(pageParams.language_id);

        return {
            nav,
            pageAsset,
            error: pageError || navError,
        };
    };
    const { pageAsset, nav, error } = await getPageData();

    // Move this to MyPage
    if (error) {
        return <ErrorPage error={error} />;
    }

    if (pageAsset?.vanityUrl) {
        handleVanityUrlRedirect(pageAsset?.vanityUrl);
    }

    return (
        <PageAsset 
            pageAsset={pageAsset} 
            nav={nav} 
            serverPath={pathname}
        />
    );
}