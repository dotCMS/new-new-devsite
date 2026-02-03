import { notFound } from "next/navigation";
import { getDotCMSPage } from "@/util/getDotCMSPage";
import VideoListing from '@/components/videos/video-listing';
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getVideoListing } from "@/services/video/getVideos";

const getVideo = (params: any) => {
    const defaultPath = "index";
    const path = "/videos/" + (params?.slug?.join("/") || defaultPath);
    return path;
};

async function fetchPage(path: string) {
    const finalPath = await path;
    const pageData = await getDotCMSPage(finalPath);
    
    if (!pageData) {
        notFound();
    }
    
    // TypeScript: Access pageAsset from the pageData response
    const pageAsset = (pageData as any).pageAsset || pageData;
    
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
    const pageAsset = await fetchPage(path);

    if (!pageAsset?.urlContentMap?._map) {
        return {
            title: "Videos | dotCMS Documentation",
            description: "dotCMS Developer Videos",
            keywords: "dotcms developers Videos",
        };
    }

    const hostname = "https://dev.dotcms.com";
    const title = pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title || "Videos";
    const description = pageAsset.urlContentMap._map.seoDescription || "dotCMS Developer Videos";
    const keywords = pageAsset.urlContentMap._map.tag || "dotcms developers Videos";

    return {
        title: `${title} | dotCMS Documentation`,
        description: description,
        keywords: keywords,
        openGraph: {
            title: `${title} | dotCMS Documentation`,
            description: description,
            keywords: keywords,
            url: `${hostname}${path}`,
            siteName: 'dotCMS Docs',
        },
        alternates: {
            canonical: `${hostname}${path}`,
        },
        metadataBase: new URL(hostname),
    };
}






