import { notFound } from "next/navigation";
import { headers } from 'next/headers';

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";
import { PageGraphQL } from "@/components/page-graphql";
import { getGraphQLPageData, getGraphQLPageQuery } from "@/lib/gql";
import { client } from "@/lib/dotcmsClient";
import { getSideNav } from "@/lib/getSideNav"

const getPath = (params) => {

    const defaultPath = "getting-started";
    const path = "/docs/latest/" + (params?.slug?.join("/") || defaultPath);

    return path;
};

async function fetchPageData(path, searchParams) {
    const finalPath = await path;
    const finalSearchParams = await searchParams;
    const pageRequestParams = getPageRequestParams({ path: finalPath, params: finalSearchParams });
    const query = getGraphQLPageQuery(pageRequestParams);
    const [pageData, nav, sideNav] = await Promise.all([
        getGraphQLPageData(query),
        client.nav.get({
            path: "/",
            depth: 0,
            languageId: finalSearchParams.language_id,
        }),
        getSideNav()
    ]);

    const pageAsset = graphqlToPageEntity(pageData);

    if (!pageAsset) {
        notFound();
    }

    return { pageAsset, nav: nav.entity.children || [], sideNav, query };
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
    const path = getPath(finalParams);
    const { pageAsset } = await fetchPageData(path, searchParams);
    console.log(pageAsset.urlContentMap._map.title)
    return {
        title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
        description: pageAsset.urlContentMap._map.seoDescription,
        keywords: pageAsset.urlContentMap._map.tag,
        openGraph: {
            title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
            description: pageAsset.urlContentMap._map.seoDescription,
            keywords: pageAsset.urlContentMap._map.tag,
        }
    };
}

export default async function Home({ searchParams, params }) {
    const finalParams = await params;
    const finalSearchParams = await searchParams;
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";

    const path = getPath(finalParams);
    const { pageAsset, nav, sideNav, query } = await fetchPageData(path, finalSearchParams);

    return <PageGraphQL nav={nav} pageAsset={pageAsset} query={query} sideNav={sideNav} params={params} pathname={pathname} />;
}