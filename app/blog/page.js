import { notFound } from "next/navigation";
import { getDotCMSPage } from "@/util/getDotCMSPage";
import BlogListing from '@/components/blogs/blog-listing';
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getBlogListing } from "@/services/blog/getBlogListing";

const getPath = (params) => {
    const defaultPath = "index";
    const path = "/blog/" + (params?.slug?.join("/") || defaultPath);

    return path;
};

async function fetchPage(path) {
    const finalPath = await path;
    const { pageAsset } = await getDotCMSPage(finalPath);

    if (!pageAsset) {
        notFound();
    }

    return pageAsset;
}

/**
 * Generate metadata
 *
 * @export
 * @param {*} { params }
 * @return {*}
 */
export async function generateMetadata({ params }) {
    const finalParams = await params;
    const path = getPath(finalParams);
    const pageAsset = await fetchPage(path);

    if (!pageAsset?.urlContentMap?.inode) {
        return {
            title: "Blog | dotCMS Documentation",
            description: "dotCMS Developer Blog",
            keywords: "dotcms developers Blog",
        };
    }

    const hostname = "https://dev.dotcms.com";
    const title = pageAsset.urlContentMap._map.navTitle || pageAsset.urlContentMap._map.title || "Blog";
    const description = pageAsset.urlContentMap._map.seoDescription || "dotCMS Developer Blog";
    const keywords = pageAsset.urlContentMap._map.tag || "dotcms developers Blog";

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



export default async function BlogPage({ searchParams, params }) {
    const finalParams = await searchParams;

    const tagFilter = finalParams["tagFilter"];
    const page = parseInt(finalParams["page"]) || 1;

    const { blogs, pagination } = await getBlogListing({ tagFilter: tagFilter, page: page, pageSize: 9 });

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <BlogListing blogs={blogs} pagination={pagination} tagFilter={tagFilter} />
            </main>
            <Footer />
        </div>
    );
}




