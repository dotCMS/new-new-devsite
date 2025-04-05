"use client";

import WebPageContent from "../content-types/webPageContent";
import Header from "../header/header";
import Footer from "../footer";
import Hero from "../content-types/hero";
import Heading from "../content-types/heading";
import LinkCards from "../content-types/link-cards";
import APIPlaygrounds from "../content-types/api-playgrounds";
import RelatedBlogs from "../content-types/related-blogs";
import { usePathname, useRouter } from "next/navigation";
import { DotcmsLayout } from "@dotcms/react";
import { usePageAsset } from "../../hooks/usePageAsset";
import NotFound from "@/app/not-found";
import { DotBlockEditor } from "../shared/dotBlockEditor";
import OnThisPage from "../navigation/OnThisPage";
import NavTree from "./NavTree";
import DevResourceDetailComponent from "../learning/devresource-detail";

const componentsMap = {
  webPageContent: WebPageContent,
  DocumentationHero: Hero,
  Heading: Heading,
  DocumentationLinks: LinkCards,
  DocumentationApiPlaygrounds: APIPlaygrounds,
  RelatedBlogs: RelatedBlogs,
  DevResource: DevResourceDetailComponent
};

export function BlockPageAsset({ pageAsset, nav, serverPath }) {
  const { replace } = useRouter();
  const clientPath = usePathname();

  // Use server path for initial render, client path for subsequent updates
  const pathname = serverPath || clientPath;

  pageAsset = usePageAsset(pageAsset);

  if (!pageAsset) {
    return <NotFound />;
  }
  const hasBlockContent = pageAsset?.page?.content;
  const showLeftNav = (
    pageAsset?.page?.show && pageAsset?.page?.show.indexOf("leftnav") !== -1
  );
  
  const showPageToc = (pageAsset?.page?.show && pageAsset?.page?.show.indexOf("toc") !== -1)
  return (
    <div className="flex flex-col min-h-screen">
      {pageAsset?.layout.header && <Header />}

      <div className="flex-1">
        <div className="flex flex-col lg:flex-row container mx-auto px-0">
          {/* Left Navigation - Hide on mobile */}
          {showLeftNav && (
            <div className="hidden lg:block w-72 shrink-0">

                <NavTree nav={nav} />
            </div>
          )}

          {/* Main Content - Full width on mobile */}
          <main className="flex-1 min-w-0 px-6 pt-8 sm:px-6 lg:px-8 [&_.container]:!p-0">
            <DotcmsLayout
              pageContext={{
                pageAsset,
                components: componentsMap,
              }}
              config={{
                pathname,
                editor: {
                  params: {
                    depth: 3,
                  },
                },
              }}
            />

            {hasBlockContent && (
              <div className="prose prose-lg mb-8">
                <article className="prose prose-lg mb-8">
                  <DotBlockEditor blocks={pageAsset.page.content} />
                </article>
              </div>
            )}
          </main>
        </div>
        {showPageToc && (
        <div className="w-64 shrink-0 hidden xl:block">
          <div
            className="sticky top-16 pt-8 pl-8
                overflow-y-auto p-4 px-2
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                h-[calc(100vh-4rem)]">
            <OnThisPage />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
