
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import DevResourceDetailPageComponent from "@/components/learning/devresource-detail-page-component";
import { getDevResources } from "@/services/learning/getDevResources";
import { ErrorPage } from "@/components/error";
import { notFound } from "next/navigation";
import { extractAssetId } from "@/util/utils";
import { Config } from "@/util/config";
import Script from "next/script";

// Enable ISR with a revalidation time of 60 seconds
// This means the page will be regenerated at most once every 60 seconds
// when a request comes in after the revalidation period
export const revalidate = 60; // Revalidate every 60 seconds

// Optional: Control dynamic behavior
// 'force-static' ensures the page is statically generated at build time
// and uses ISR for updates
export const dynamic = 'force-static';

// Optional: Configure runtime
// Using Node.js runtime for better compatibility with ISR
export const runtime = 'nodejs';

export async function generateMetadata({ params , searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const finalParams = await params;
    const slug = finalParams.slug
    const finalSlug: string = Array.isArray(slug) ? slug[0] : slug;
    if(!slug) {
        return notFound();
    }
    const devResources = await getDevResources({
        slug: finalSlug,
        needBody: true,
      });
      
    if (!devResources || !devResources?.devResources || devResources?.devResources.length === 0) {
        return notFound();
    }

    const devResource = devResources.devResources[0];
    
    // Check if the resource's tags include 'dot:meta-no-index'
    const tags = devResource.tags || [];
    const shouldNoIndex = Array.isArray(tags) 
        ? tags.includes('dot:meta-no-index') 
        : typeof tags === 'string' && tags.includes('dot:meta-no-index');

    const hostname = Config.CDNHost;

    const imageUrl = devResource.image?.idPath  
        ? `${hostname}/dA/${extractAssetId(devResource.image.idPath)}/70q/1000maxw/${devResource.inode}/${devResource.image.title}`
        : `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`;

    const metadata = {
        alternates: {
            canonical: `${hostname}/learning/${devResource.slug}`,
        },
        title: devResource.title,
        description: devResource.teaser || `Read ${devResource.title} on dotCMS Developer Blog`,
        canonical: `${hostname}/learning/${devResource.slug}`,
        metadataBase: new URL(hostname),
        
        // OpenGraph
        openGraph: {
            title: devResource.title,
            description: devResource.teaser,
            url: `${hostname}/learning/${devResource.slug}`,
            siteName: 'dotCMS Dev Site',
            images: [{
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: devResource.image?.description || devResource.title,
            }],
            locale: 'en_US',
            type: 'article',
        },

        // Twitter
        twitter: {
            card: 'summary_large_image',
            title: devResource.title,
            description: devResource.teaser,
            images: [imageUrl],
            creator: '@dotcms',
            site: '@dotcms',
        },

        // Article specific
        article: {
            publishedTime: devResource.publishDate,
            modifiedTime: devResource.modDate,
            authors: devResource.author ? [`${devResource.author.firstName} ${devResource.author.lastName}`] : ['dotCMS Team'],
            tags: devResource.tags,
        },

        // Other meta tags
        keywords: devResource.tags?.join(', '),
        robots: shouldNoIndex 
            ? 'noindex, nofollow'
            : {
                index: true,
                follow: true,
              },
    };

    return metadata;
}

export default async function DevResourceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const slug = (await params).slug;
  const finalSlug: string = Array.isArray(slug) ? slug[0] : slug;
  const devResourceResult = await getDevResources({
    slug: finalSlug,
    needBody: true,
  });
  
  if (devResourceResult.devResources.length === 0) {
    return <ErrorPage error={{ message: "Resource not found", status: 404 }} />;
  }

  const devResource = devResourceResult.devResources[0];
  const hostname = Config.CDNHost;  
  
  const imageUrl = devResource.image?.idPath  
    ? `${hostname}/dA/${extractAssetId(devResource.image.idPath)}/70q/1000maxw/${devResource.inode}/${devResource.image.title}`
    : `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`;
  
  // Create JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": devResource.title,
    "description": devResource.teaser || `Read ${devResource.title} on dotCMS Developer Blog`,
    "image": imageUrl,
    "datePublished": devResource.publishDate,
    "dateModified": devResource.modDate,
    "author": devResource.author 
      ? {
          "@type": "Person",
          "name": `${devResource.author.firstName} ${devResource.author.lastName}`
        }
      : {
          "@type": "Organization",
          "name": "dotCMS Team"
        },
    "publisher": {
      "@type": "Organization",
      "name": "dotCMS",
      "logo": {
        "@type": "ImageObject",
        "url": `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${hostname}/learning/${devResource.slug}`
    },
    "keywords": devResource.tags?.join(', ') || "",
    "articleSection": devResource.type1 ? devResource.type1[0] : "Learning"
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="container relative">
        <DevResourceDetailPageComponent devResource={devResource} />
      </div>
      <Footer />
    </div>
  );
}
