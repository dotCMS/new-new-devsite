import { Metadata } from "next";
import { DevResourceGrid } from "@/components/learning/devresource-grid";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getCountDevResources, getDevResources } from "@/services/learning/getDevResources";

import DevResourceListing from "@/components/learning/devresource-listing";

/**
 * ISR (Incremental Static Regeneration) Configuration
 * 
 * How ISR works with URL parameters:
 * 1. Each unique combination of URL parameters creates a separate cached page
 * 2. The first request for a parameter combination generates and caches the page
 * 3. Subsequent requests serve the cached version until revalidation
 * 4. After 60 seconds, the next request triggers background regeneration
 * 5. Users continue to see the cached version while regeneration happens
 * 6. Once regeneration completes, the new version is cached and served
 * 
 * Example cache entries:
 * - /learning (no params)
 * - /learning?type=tutorial
 * - /learning?type=guide&page=2
 * - /learning?type=video&tagFilter=api
 * 
 * Each of these is cached and revalidated independently
 */
export const revalidate = 60; // Revalidate every 60 seconds

// Configure runtime - Using Node.js runtime for better compatibility with ISR
export const runtime = 'nodejs';

// Optional: Pre-generate common parameter combinations at build time
// This helps with performance for frequently accessed pages
export async function generateStaticParams() {
  // Pre-render the most common types
  const commonTypes = ['all', 'tutorial', 'guide', 'video', 'blog'];
  const commonPages = [1, 2, 3]; // Pre-render first 3 pages
  
  const params = [];
  
  // Add the default page (no params)
  params.push({});
  
  // Add common type pages
  for (const type of commonTypes) {
    params.push({ searchParams: { type } });
    
    // Add first few pages for each type
    if (type !== 'all') {
      for (const page of commonPages) {
        params.push({ searchParams: { type, page: page.toString() } });
      }
    }
  }
  
  return params;
}



// Generate dynamic metadata based on URL parameters
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const finalSearchParams = await searchParams;
  const type = (finalSearchParams?.type as string) || "all";
  const tagFilter = (finalSearchParams?.tagFilter as string) || "";
  const page = Number(finalSearchParams?.page) || 1;
  
  // Create dynamic title based on filters
  let title = "dotCMS Learning Center";
  if (type !== "all") {
    title = `${type.charAt(0).toUpperCase() + type.slice(1)}s - dotCMS Learning Center`;
  }
  if (tagFilter) {
    title = `${tagFilter} - ${title}`;
  }
  if (page > 1) {
    title = `${title} - Page ${page}`;
  }
  
  // Create dynamic description
  let description = "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS";
  if (type !== "all") {
    description = `Browse ${type}s and resources to master dotCMS`;
  }
  if (tagFilter) {
    description = `${description} - Filtered by ${tagFilter}`;
  }
  
  return {
    title,
    description,
  };
}

export default async function DevResourceHomePage({
    params,
    searchParams,
  }: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }) {

  const finalSearchParams = await searchParams;
  const type = (finalSearchParams?.type as string) || "all";
  const tagFilter = (finalSearchParams?.tagFilter as string) || "";
  const slug = (await params).slug
  const page = Number(finalSearchParams?.page) || 1;
  const limit = Number(finalSearchParams?.limit) || 50;

  if (type === "all") {
    const count = await getCountDevResources();
    
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container relative">
          <DevResourceGrid count={count} />
        </div>
        )
        <Footer />
      </div>
    );
  }

  const { devResources, pagination } = await getDevResources({
    tagFilter,
    page,
    limit,
    type
  });


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container relative">
        <DevResourceListing devResources={devResources} pagination={pagination} type={type} tagFilter={tagFilter} />
      </div>
      )
      <Footer />
    </div>
  );
}
