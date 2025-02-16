import { getBlogDetailQuery } from "@/services/blog/getBlogDetail";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { notFound } from "next/navigation";
import BlogDetailComponent from "@/components/blogs/blog-detail";
import { ErrorPage } from "@/components/error";


export async function generateMetadata({ params, searchParams }) {
    const finalParams = await params;
    const slug = finalParams.slug

    if(!slug) {
        return notFound();
    }
    const post = await getBlogDetailQuery(slug);

    if (!post) {
        return {
            title: 'Blog Post Not Found',
        };
    }

    const imageUrl = post.image?.fileAsset?.idPath 
        ? `${post.host.hostname}/dA/${post.identifier}/70q/1000maxw/${post.inode}`
        : `${post.host.hostname}/images/default-blog-image.jpg`;

    return {
        title: post.title,
        description: post.teaser || `Read ${post.title} on dotCMS Developer Blog`,
        canonical: `${post.host.hostname}/blog/${post.urlTitle}`,
        
        // OpenGraph
        openGraph: {
            title: post.title,
            description: post.teaser,
            url: `${post.host.hostname}/blog/${post.urlTitle}`,
            siteName: 'dotCMS Developer Blog',
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: post.image?.description || post.title,
            }],
            locale: 'en_US',
            type: 'article',
        },

        // Twitter
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.teaser,
            images: [imageUrl],
            creator: '@dotcms',
            site: '@dotcms',
        },

        // Article specific
        article: {
            publishedTime: post.publishDate,
            modifiedTime: post.modDate,
            authors: post.author ? [`${post.author.firstName} ${post.author.lastName}`] : ['dotCMS Team'],
            tags: post.tags,
        },

        // Other meta tags
        keywords: post.tags?.join(', '),
        robots: {
            index: true,
            follow: true,
        },
    };
}



export default async function BlogPage({ searchParams, params }) {
    const finalParams = await params;
    const slug = finalParams.slug

    if(!slug) {
        return notFound();
    }
    const post = await getBlogDetailQuery(slug);

    if(!post || !post.identifier) {
        return <ErrorPage error={{ message: "Blog not found", status: 404 }} />;
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
                <main className="flex-1">
                    <BlogDetailComponent post={post} />
                </main>
            </div>

            <Footer />
        </div>
    )
}
