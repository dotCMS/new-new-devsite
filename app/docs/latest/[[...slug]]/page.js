import { notFound } from "next/navigation";

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";
import { MyGraphQLPage } from "@/components/graphql-page";
import { getGraphQLPageData, getGraphQLPageQuery } from "@/lib/gql";
import { client } from "@/lib/dotcmsClient";
import { getSideNav } from "@/lib/getSideNav"

const getPath = (params) => {
    const defaultPath = "getting-started";
    const path = "/docs/latest/" + (params?.slug?.join("/") || defaultPath);

    return path;
};

async function fetchPageData(path, searchParams) {
    const pageRequestParams = getPageRequestParams({ path, params: searchParams });
    const query = getGraphQLPageQuery(pageRequestParams);
    const [pageData, nav, sideNav] = await Promise.all([
        getGraphQLPageData(query),
        client.nav.get({
            path: "/",
            depth: 0,
            languageId: searchParams.language_id,
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
    const path = getPath(params);
    const { pageAsset } = await fetchPageData(path, searchParams);

    return {
        title: pageAsset.friendlyName || pageAsset.title,
    };
}

export default async function Home({ searchParams, params }) {
    const path = getPath(params);
    const { pageAsset, nav, sideNav, query } = await fetchPageData(path, searchParams);

    return <MyGraphQLPage nav={nav} pageAsset={pageAsset} query={query} sideNav={sideNav} params={params} />;
}