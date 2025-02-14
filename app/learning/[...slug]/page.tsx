import { Metadata } from "next";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import DevResourceDetailComponent from "@/components/learning/devresource-detail";
import { getDevResources } from "@/services/learning/getDevResources";
import { ErrorPage } from "@/components/error";
export const metadata: Metadata = {
  title: "dotCMS Learning Center",
  description:
    "Explore tutorials, guides, examples, videos and knowledge base articles to master dotCMS",
};

export default async function DevResourceDetailPage({
    params,
    searchParams,
  }: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }) {
  const finalParams = await params;
  const slug = (await params).slug

  const devResource = await getDevResources({ slug: slug, needBody: true });
  if (devResource.devResources.length === 0) {
    return <ErrorPage error={{ message: "Resource not found", status: 404 }} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container relative">
        <DevResourceDetailComponent devResource={devResource.devResources[0]} />
      </div>
      )
      <Footer />
    </div>
  );
}
