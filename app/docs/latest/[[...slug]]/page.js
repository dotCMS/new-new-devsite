import { notFound } from "next/navigation";
import { headers } from 'next/headers';

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";

import { getGraphqlResults, getGraphQLPageQuery } from "@/lib/gql";
import { client } from "@/lib/dotcmsClient";
import { getSideNav } from "@/lib/getSideNav"
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import Documentation from "../../../../components/content-types/Documentation";
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
        getGraphqlResults(query),
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

    return { pageAsset, nav: nav.entity.children || [], sideNav, query, currentPath:finalPath };
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
    const { urlContentMap } = pageAsset || {};
    return (
        <div className="flex flex-col min-h-screen">
            {pageAsset.layout.header && (
                <Header />
            )}

            <div className="flex flex-1">
                <main className="flex-1">
                    <Documentation contentlet={urlContentMap._map} sideNav={sideNav} currentPath={params.slug} />
                </main>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>
    );

}