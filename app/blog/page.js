import { notFound } from "next/navigation";

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";
import { getGraphqlResults, getGraphQLPageQuery } from "@/services/gql";
import BlogListing from '@/components/blogs/blog-listing';
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getBlogListing } from "@/services/blog/getBlogListing";

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



export default async function BlogPage({ searchParams, params }) {
    const finalParams = await searchParams;

    const tagFilter = finalParams["tagFilter"];
    const page = parseInt(finalParams["page"]) || 1;
    
    const {blogs,pagination} = await getBlogListing({tagFilter: tagFilter, page: page, pageSize: 9});

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <BlogListing blogs={blogs} pagination={pagination} tagFilter={tagFilter}/>
            </main>
            <Footer />
        </div>
    );
}




