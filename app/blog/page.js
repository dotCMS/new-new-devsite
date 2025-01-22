
import { notFound } from "next/navigation";
import { headers } from 'next/headers';

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";
import { getGraphqlResults, getGraphQLPageQuery } from "@/util/gql";
import BlogListing from './blog-listing';
import Header from "@/components/header/header";
import Footer from "@/components/footer";

const getPath = (params) => {
    const defaultPath = "index";
    const path = "/blog/" + (params?.slug?.join("/") || defaultPath);

    return path;
};

async function fetchPage(path, searchParams) {
    const finalPath = await path;
    const finalSearchParams = await searchParams;
    const pageRequestParams = getPageRequestParams({ path: finalPath, params: finalSearchParams });
    const query = getGraphQLPageQuery(pageRequestParams);

    const pageData = await getGraphqlResults(query);
    const pageAsset = graphqlToPageEntity(pageData);

    const urlContentMap = pageAsset.urlContentMap && pageAsset.urlContentMap._map;

    return pageAsset;
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
    const pageAsset = await fetchPage(path, searchParams);
    const { urlContentMap } = pageAsset && pageAsset.urlContentMap ? pageAsset.urlContentMap : {};
    if (urlContentMap && urlContentMap._map) {

        return {
            title: (urlContentMap._map || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
            description: pageAsset.urlContentMap._map.seoDescription,
            keywords: pageAsset.urlContentMap._map.tag,
            openGraph: {
                title: (pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title) + " | dotCMS Documentation",
                description: pageAsset.urlContentMap._map.seoDescription,
                keywords: pageAsset.urlContentMap._map.tag,
            }
        }

    } else {
        return {
            title: pageAsset.title,
            description: pageAsset.seoDescription,
            keywords: "dotcms developers Blog",
            openGraph: {
                title: pageAsset.title,
                description: pageAsset.seoDescription,
                keywords: "dotcms developers Blog",
            }
        };
    }
}

export default async function BlogListingPage({ searchParams, params }) {

    const finalParams = await params;
    const finalSearchParams = await searchParams;


    const path = await getPath(finalParams);
    const pageAsset = await fetchPage(path, finalSearchParams);

    if (!pageAsset || !pageAsset.page) {
        return notFound();
    }
    const urlContentMap = pageAsset.urlContentMap && pageAsset.urlContentMap._map;


    return (
        <div className="flex flex-col min-h-screen">
            {pageAsset.layout.header && (
                <Header />
            )}

            <div className="flex flex-1">
                <main className="flex-1">
                    <BlogListing pageAsset={pageAsset} />
                </main>
            </div>

            {pageAsset.layout.footer && <Footer />}
        </div>


    )


}




