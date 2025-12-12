import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { ErrorPage } from "@/components/error";
import { notFound } from "next/navigation";
import { extractAssetId } from "@/util/utils";
import { Config } from "@/util/config";
import Script from "next/script";
import { getVideoDetail } from "@/services/video/getVideos";
import VideoDetailComponent from "@/components/videos/video-detail";

export default async function VideoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const slug = (await params).slug;
  const finalSlug: string = Array.isArray(slug) ? slug[0] : slug;
  const videoResult = await getVideoDetail(finalSlug);
  
  if (!videoResult || videoResult.videos.length === 0) {
    return <ErrorPage error={{ message: "Video not found", status: 404 }} />;
  }

  const myVideo = videoResult.videos[0];
  const hostname = Config.CDNHost;  

  // Safely construct image URL - handle cases where image might not exist
  const imageUrl = myVideo.image?.idPath 
    ? `${hostname}/dA/${extractAssetId(myVideo.image.idPath)}/70q/1000maxw`
    : myVideo.thumbnail?.idPath
      ? `${hostname}/dA/${extractAssetId(myVideo.thumbnail.idPath)}/70q/1000maxw`
      : `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`;
  
  // Create JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": myVideo.title,
    "description": myVideo.teaser || `Watch ${myVideo.title} on dotCMS Developer Videos`,
    "thumbnailUrl": imageUrl,
    "uploadDate": myVideo.publishDate,
    "author": myVideo.author 
      ? {
          "@type": "Person",
          "name": `${myVideo.author.firstName} ${myVideo.author.lastName}`
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
      "@id": `${hostname}/videos/${myVideo.slug}`
    },
    "keywords": myVideo.tags?.join(', ') || "",
  };

  // Prepare the video data for the detail component
  // Handle both Video and DevResource content types
  const videoData = {
    ...myVideo,
    // For DevResource, the body is in description; for Video, it's in description.json
    body: myVideo.contentType === 'devresource' 
      ? myVideo.description 
      : myVideo.description,
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
        <VideoDetailComponent post={videoData} />
      </div>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const finalParams = await params;
  const slug = finalParams.slug;
  const finalSlug: string = Array.isArray(slug) ? slug[0] : slug;
  
  if (!slug) {
    return notFound();
  }
  
  const videoResult = await getVideoDetail(finalSlug);
      
  if (!videoResult || !videoResult?.videos || videoResult?.videos.length === 0) {
    return notFound();
  }

  const myVideo = videoResult.videos[0];
  
  // Check if the resource's tags include 'dot:meta-no-index'
  const tags = myVideo.tags || [];
  const shouldNoIndex = Array.isArray(tags) 
    ? tags.includes('dot:meta-no-index') 
    : typeof tags === 'string' && tags.includes('dot:meta-no-index');

  const hostname = Config.CDNHost;

  // Safely construct image URL - handle cases where image might not exist
  const imageUrl = myVideo.image?.idPath 
    ? `${hostname}/dA/${extractAssetId(myVideo.image.idPath)}/70q/1000maxw`
    : myVideo.thumbnail?.idPath
      ? `${hostname}/dA/${extractAssetId(myVideo.thumbnail.idPath)}/70q/1000maxw`
      : `${hostname}/dA/a6e0a89831/70q/1000maxw/dotcms-dev-site.webp`;
  
  const metadata = {
    alternates: {
      canonical: `${hostname}/videos/${myVideo.slug}`,
    },
    title: myVideo.title,
    description: myVideo.teaser || `Watch ${myVideo.title} on dotCMS Developer Videos`,
    canonical: `${hostname}/videos/${myVideo.slug}`,
    metadataBase: new URL(hostname),
    
    // OpenGraph
    openGraph: {
      title: myVideo.title,
      description: myVideo.teaser,
      url: `${hostname}/videos/${myVideo.slug}`,
      siteName: 'dotCMS Dev Site',
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: myVideo.altText || myVideo.title,
      }],
      locale: 'en_US',
      type: 'video.other',
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: myVideo.title,
      description: myVideo.teaser,
      images: [imageUrl],
      creator: '@dotcms',
      site: '@dotcms',
    },

    // Article specific
    article: {
      publishedTime: myVideo.publishDate,
      authors: myVideo.author ? [`${myVideo.author.firstName} ${myVideo.author.lastName}`] : ['dotCMS Team'],
      tags: myVideo.tags,
    },

    // Other meta tags
    keywords: myVideo.tags?.join(', '),
    robots: shouldNoIndex 
      ? 'noindex, nofollow'
      : {
          index: true,
          follow: true,
        },
  };

  return metadata;
}
