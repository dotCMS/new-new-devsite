"use client";

import { DotCMSLayoutBody, useEditableDotCMSPage } from "@dotcms/react";
import { pageComponents } from "@/components/content-types";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { BuildSubNav } from "./BuildSubNav";
import { BuildSectionNav } from "./BuildSectionNav";
import { DotBlockEditor } from "@/components/shared/dotBlockEditor";
import { isJSON } from "@/util/utils";

export function DynamicBuildPageAsset({ pageContent, buildNavigation }) {
  const { pageAsset, content = {} } = useEditableDotCMSPage(pageContent);
  const navigation = content.navigation;

  if (!pageAsset) {
    return null;
  }

  const hasBlockContent = pageAsset?.page?.content;
  const urlContentMap = pageAsset?.page?.urlContentMap || pageAsset?.urlContentMap;
  const pageMap = urlContentMap?._map || {};
  const fallbackBody =
    pageMap.body ||
    pageMap.content ||
    pageMap.documentation ||
    urlContentMap?.body ||
    urlContentMap?.content ||
    urlContentMap?.documentation;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {pageAsset?.layout?.header && (
        <Header
          navItems={navigation?.children}
          primaryNavItems={buildNavigation?.primaryTabs}
        />
      )}
      <BuildSubNav buildNavigation={buildNavigation} />
      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <div className="flex w-full min-w-0 flex-1 flex-col px-0 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:gap-6">
          <div className="hidden min-h-0 w-72 shrink-0 self-stretch border-border/60 bg-[#F6F6F7] dark:bg-muted/25 lg:block lg:border-r">
            <BuildSectionNav buildNavigation={buildNavigation} />
          </div>
          <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
            <div className="w-full min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
              <div className="mb-8">
                <h1 className="text-4xl font-bold">
                  {pageAsset.page.title}
                </h1>
              </div>
              {hasBlockContent && (
                <div className="prose dark:prose-invert mb-8">
                  <DotBlockEditor
                    blocks={
                      typeof pageAsset.page.content === "string" &&
                      isJSON(pageAsset.page.content)
                        ? JSON.parse(pageAsset.page.content)
                        : pageAsset.page.content?.json || pageAsset.page.content
                    }
                    customRenderers={{}}
                  />
                </div>
              )}
              {!hasBlockContent && fallbackBody && (
                <div className="prose dark:prose-invert mb-8">
                  {typeof fallbackBody === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: fallbackBody }} />
                  ) : (
                    <DotBlockEditor
                      blocks={fallbackBody?.json || fallbackBody}
                      customRenderers={{}}
                    />
                  )}
                </div>
              )}
              <DotCMSLayoutBody
                page={pageAsset}
                components={pageComponents}
                mode={process.env.NEXT_PUBLIC_DOTCMS_MODE}
              />
            </div>
          </main>
        </div>
      </div>
      {pageAsset?.layout?.footer && <Footer {...content} />}
    </div>
  );
}
