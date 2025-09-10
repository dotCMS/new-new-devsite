import { Metadata } from "next";
import { DevResourceGrid } from "@/components/learning/devresource-grid";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getCountDevResources, getDevResources } from "@/services/learning/getDevResources";

import DevResourceListing from "@/components/learning/devresource-listing";
export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description:
    "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
};

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

  // Home page
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
