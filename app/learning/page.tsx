import type { Metadata } from "next";

import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { DevResourceGrid } from "@/components/learning/devresource-grid";
import { getCountDevResources } from "@/services/learning/getDevResources";

export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description:
    "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
};

export default async function LearningHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // NOTE: keeping searchParams in the signature to preserve potential future filtering
  void (await searchParams);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container relative">
        <DevResourceGrid />
      </div>
      <Footer />
    </div>
  );
}
