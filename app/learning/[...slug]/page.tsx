
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import DevResourceDetailComponent from "@/components/learning/devresource-detail";
import { getDevResources } from "@/services/learning/getDevResources";
import { ErrorPage } from "@/components/error";
import { notFound } from "next/navigation";
import { extractAssetId } from "@/util/utils";
import { Config } from "@/util/config";
import Script from "next/script";


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
    const hostname = Config.CDNHost;


    const imageUrl = devResource.image?.idPath  
        ? `${hostname}/dA/${extractAssetId(devResource.image.idPath)}/70q/1000maxw/${devResource.inode}/${devResource.image.title}`
        : `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`;


    return {

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
        robots: {
            index: true,
            follow: true,
        },
    };
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
          "name": `${devResource.author}`
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
        <DevResourceDetailComponent devResource={devResource} />
      </div>
      <Footer />
    </div>
  );
}
