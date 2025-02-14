import { Metadata } from "next";
import { DevResourceGrid } from "@/components/learning/devresource-grid";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { getCountDevResources, getDevResources } from "@/services/learning/getDevResources";
import DevResourceDetailComponent from "@/components/learning/devresource-detail";
import DevResourceListing from "@/components/learning/devresource-listing";
export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description:
    "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
};

export default async function LearningCenterPage({
  params,
  searchParams,
}: {
  params: any[];
  searchParams: any;
}) {
  const finalParams = await params;
  const finalSearchParams = await searchParams;
  const type = finalSearchParams?.type || "all";
  const tagFilter = finalSearchParams?.tagFilter || "";
  const slug = finalSearchParams?.slug || "";
  const page = finalSearchParams?.page || 1;
  const limit = finalSearchParams?.limit || 50;

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

  const { devResources, pagination } = await getDevResources(
    tagFilter,
    page,
    limit,
    type,
    slug
  );


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
