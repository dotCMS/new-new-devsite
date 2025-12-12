import type { Metadata } from "next";

import Header from "@/components/header/header";
import Footer from "@/components/footer";
import DevResourceListing from "@/components/learning/devresource-listing";
import { getDevResources } from "@/services/learning/getDevResources";

export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description:
    "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
};

export default async function DevResourceListingPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const finalSearchParams = await searchParams;

  const type = (finalSearchParams?.type as string) || "all";
  const tagFilter = (finalSearchParams?.tagFilter as string) || "";
  const page = Number(finalSearchParams?.page) || 1;
  const limit = Number(finalSearchParams?.limit) || 6;

  const { devResources, pagination } = await getDevResources({
    tagFilter,
    page,
    limit,
    type,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container relative">
        <DevResourceListing
          devResources={devResources}
          pagination={pagination}
          tagFilter={tagFilter}
        />
      </div>
      <Footer />
    </div>
  );
}
