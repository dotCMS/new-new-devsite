"use client";

import Header from "./header/header";
import Footer from "./footer";
import { useEditableDotCMSPage, DotCMSLayoutBody } from "@dotcms/react";
import NotFound from "@/app/not-found";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { DotBlockEditor } from "./shared/dotBlockEditor";
import { isJSON } from "@/util/utils";
import OnThisPage from "./navigation/OnThisPage";
import RedesignedNavTree from "./navigation/RedesignedNavTree";
import { pageComponents } from "@/components/content-types";
import NextBackButtons from "./navigation/NextBackButtons";


export function BlockPageAsset({ pageContent, nav, searchItems = [], navSections }) {

  const {pageAsset, content = {}} = useEditableDotCMSPage(pageContent);

  const navigation = content.navigation;

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
      {pageAsset?.layout?.header && <Header navSections={navSections} navItems={navigation?.children} />}
      
        <div id="main-content" className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] container mx-auto px-0 w-full">
          {/* Left Navigation - Hide on mobile */}
          {showLeftNav && (
            <div id="left-nav" className="hidden lg:block w-72 shrink-0">
                <RedesignedNavTree 
                  currentPath={pageAsset?.page?.url}
                  items={searchItems}
                  initialSections={navSections}
                />
            </div>
          )}

          {/* Main Content - Full width on mobile */}
          <main id="content-here" className="flex-1 min-w-0 py-8 lg:pb-12 px-0 sm:px-0 lg:px-8">
            <div className="px-8">
              <Breadcrumbs
                items={Array.isArray(nav) ? nav : []}
                slug={pageAsset.page.url}
                childrenKey="children"
                identifierKey="href"
                basePath="/"
              />
              <h1 className="text-4xl font-bold mb-6">{pageAsset.page.title}</h1>
            </div>

            {hasBlockContent && (
              <div className="prose dark:prose-invert mb-8">
                  <DotBlockEditor 
                    blocks={
                      typeof pageAsset.page.content === 'string' && isJSON(pageAsset.page.content)
                        ? JSON.parse(pageAsset.page.content)
                        : pageAsset.page.content?.json || pageAsset.page.content
                    } 
                    customRenderers={{}} 
                  />
              </div>
            )}

            <DotCMSLayoutBody
              page={pageAsset}
              components={pageComponents}
              mode={process.env.NEXT_PUBLIC_DOTCMS_MODE}
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
        {pageAsset?.layout?.footer && <Footer {...content} />}
    </div>
  );
}
