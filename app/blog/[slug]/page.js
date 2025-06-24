import { getBlogDetailQuery } from "@/services/blog/getBlogDetail";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { notFound } from "next/navigation";
import BlogDetailComponent from "@/components/blogs/blog-detail";
import { ErrorPage } from "@/components/error";
import { extractAssetId } from "@/util/utils";
import Script from "next/script";
import { Config } from '@/util/config';


export const revalidate = Config.RevalidateCacheInSeconds; // seconds - matches s-maxage cache header

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

    // Check if the post's tags include 'dot:meta-no-index'
    const tags = post.tags || [];
    const shouldNoIndex = Array.isArray(tags) 
        ? tags.includes('dot:meta-no-index') 
        : typeof tags === 'string' && tags.includes('dot:meta-no-index');

    const blogHostName = post.host?.hostName || 'dev.dotcms.com';

    const hostname = (blogHostName === 'dotcms.com')
        ? 'https://www.dotcms.com' 
        : `https://dev.dotcms.com`


    const imageUrl = post.image?.fileAsset?.idPath  
        ? `${hostname}/dA/${extractAssetId(post.image.fileAsset.idPath)}/70q/1000maxw/${post.inode}`
        : `${hostname}/images/default-blog-image.jpg`;

    const metadata = {
        alternates: {
            canonical: `${hostname}/blog/${post.urlTitle}`,
        },
        title: post.title,
        description: post.teaser || `Read ${post.title} on dotCMS Developer Blog`,
        canonical: `${hostname}/blog/${post.urlTitle}`,
        metadataBase: new URL(hostname),
        
        // OpenGraph
        openGraph: {
            title: post.title,
            description: post.teaser,
            url: `${hostname}/blog/${post.urlTitle}`,
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
        robots: shouldNoIndex 
            ? 'noindex, nofollow'
            : {
                index: true,
                follow: true,
              },
    };

    return metadata;
}



// JSON-LD component for blog posts
function JsonLd({ post, hostname }) {
    const authorName = post.author 
        ? `${post.author.firstName} ${post.author.lastName}` 
        : 'dotCMS Team';
    
    const imageUrl = post.image?.fileAsset?.idPath  
        ? `${hostname}/dA/${extractAssetId(post.image.fileAsset.idPath)}/70q/1000maxw/${post.inode}`
        : `${hostname}/images/default-blog-image.jpg`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.teaser,
        "image": imageUrl,
        "datePublished": post.publishDate,
        "dateModified": post.modDate,
        "author": {
            "@type": "Person",
            "name": authorName
        },
        "publisher": {
            "@type": "Organization",
            "name": "dotCMS",
            "logo": {
                "@type": "ImageObject",
                "url": `${hostname}/images/dotcms-logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${hostname}/blog/${post.urlTitle}`
        },
        "keywords": post.tags?.join(', '),
        "articleBody": post.body
    };

    return (
        <Script 
            id="blog-jsonld" 
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
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

    const blogHostName = post.host?.hostName || 'dev.dotcms.com';
    const hostname = (blogHostName === 'dotcms.com')
        ? 'https://www.dotcms.com' 
        : 'https://dev.dotcms.com';

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <JsonLd post={post} hostname={hostname} />
            
            <div className="flex flex-1">
                <main className="flex-1">
                    <BlogDetailComponent post={post} />
                </main>
            </div>

            <Footer />
        </div>
    )
}
