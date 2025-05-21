"use client";

import Header from "./header/header";
import Footer from "./footer";
import { usePathname, useRouter } from "next/navigation";
import { DotcmsLayout } from "@dotcms/react";
import { usePageAsset } from "../hooks/usePageAsset";
import NotFound from "@/app/not-found";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { DotBlockEditor } from "./shared/dotBlockEditor";
import OnThisPage from "./navigation/OnThisPage";
import NavTree from "./getting-started/NavTree";
import { UVEComponentsMap } from "./common-component-map";
import NextBackButtons from "./navigation/NextBackButtons";
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
    <div className="">
      {pageAsset?.layout.header && <Header />}

      
        <div id="main-content" className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] container mx-auto px-0 w-full">
          {/* Left Navigation - Hide on mobile */}
          {showLeftNav && (
            <div id="left-nav" className="hidden lg:block w-72 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
                <NavTree nav={nav} currentPath={pageAsset?.page?.url}/>
            </div>
          )}

          {/* Main Content - Full width on mobile */}
          <main id="content-here" className="min-w-0 px-4 pt-8 lg:px-8 [&_.container]:!p-0  border-l-2 border-gray-200">
            <Breadcrumbs
              items={Array.isArray(nav) ? nav : []}
              slug={pageAsset.page.url}
              childrenKey="children"
              identifierKey="href"
              basePath="/"
            />
            <h1 className="text-4xl font-bold mb-6">{pageAsset.page.title}</h1>

            {hasBlockContent && (
              <div className="prose dark:prose-invert mb-8">
                  <DotBlockEditor blocks={pageAsset.page.content} customRenderers={{}} />
              </div>
            )}

            <DotcmsLayout
              pageContext={{
                pageAsset,
                components: UVEComponentsMap,
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

            <NextBackButtons navTree={nav} currentSlug={pageAsset?.page?.url} />
          </main>
        
        {showPageToc && (
            <div id="right-toc" className="w-64 hidden xl:block sticky top-16
                overflow-y-auto p-4
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                h-[calc(100vh-4rem)]">
            <OnThisPage selectors="main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4" />
          </div>
        )}
       
        </div>
        {pageAsset?.layout?.footer && <Footer />}
    </div>
  );
}
