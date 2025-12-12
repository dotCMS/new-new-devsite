import { notFound } from "next/navigation";

import { graphqlToPageEntity, getPageRequestParams } from "@dotcms/client";
import { graphqlResults, getGraphQLPageQuery } from "@/services/gql";
import VideoListing from '@/components/videos/video-listing';
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getVideoListing } from "@/services/video/getVideos";

const getVideo = (params: any) => {
    const defaultPath = "index";
    const path = "/videos/" + (params?.slug?.join("/") || defaultPath);
    return path;
};

async function fetchPage(path: string, searchParams: any) {
    const finalPath = await path;
    const finalSearchParams = await searchParams;

        console.log("video slug:", finalPath)
    const pageRequestParams = getPageRequestParams({ path: finalPath, params: finalSearchParams });
    const query = getGraphQLPageQuery(pageRequestParams);

    const result = await graphqlResults(query);
    
    if (result.errors && result.errors.length > 0) {
        console.error('GraphQL errors in videos page:', result.errors);
        throw new Error(result.errors[0].message);
    }
    
    const pageAsset = graphqlToPageEntity(result.data);

    return pageAsset;
}

export default async function VideoPage({ searchParams, params }: { searchParams: any, params: any }) {
    const finalParams = await searchParams;

    const tagFilter = finalParams["tagFilter"];
    const page = parseInt(finalParams["page"]) || 1;
    
    const {videos,pagination} = await getVideoListing({tagFilter: tagFilter, page: page, pageSize: 9,needBody:false,slug:""});

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <VideoListing videos={videos} pagination={pagination} tagFilter={tagFilter}/>
            </main>
            <Footer />
        </div>
    );
}

/**
 * Generate metadata
 *
 * @export
 * @param {*} { params, searchParams }
 * @return {*}
 */
export async function generateMetadata({ params, searchParams }: { params: any, searchParams: any }) {
    const finalParams = await params;
    const path = getVideo(finalParams);
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
            keywords: "dotcms developers Videos",
            openGraph: {
                title: pageAsset.title,
                description: pageAsset.seoDescription,
                keywords: "dotcms developers Videos",
            }
        };
    }
}






