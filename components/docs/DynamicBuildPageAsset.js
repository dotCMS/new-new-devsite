"use client";

import { DotCMSLayoutBody, useEditableDotCMSPage } from "@dotcms/react";
import { pageComponents } from "@/components/content-types";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { BuildSubNav } from "./BuildSubNav";
import { BuildSectionNav } from "./BuildSectionNav";
import { DotBlockEditor } from "@/components/shared/dotBlockEditor";
import OnThisPage from "@/components/navigation/OnThisPage";
import { useAssistant } from "@/components/chat/AssistantProvider";
import { useContentColumnWideLayout } from "@/hooks/useHeaderWideNav";
import { cn, isJSON } from "@/util/utils";

const TOC_SELECTORS =
  "main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4";

export function DynamicBuildPageAsset({ pageContent, buildNavigation }) {
  const { pageAsset, content = {} } = useEditableDotCMSPage(pageContent);
  const navigation = content.navigation;
  const { open: assistantOpen, expanded: assistantExpanded } = useAssistant();
  const showWideColumn = useContentColumnWideLayout(
    assistantOpen,
    assistantExpanded
  );

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

  const showPageToc =
    !pageAsset?.page?.show ||
    pageAsset.page.show.indexOf("toc") !== -1;

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
        <div className="flex w-full min-w-0 flex-1 flex-col lg:min-h-[calc(100vh-4rem)] lg:flex-row">
          <div className="hidden min-h-0 w-72 shrink-0 self-stretch border-border/60 bg-[#F6F6F7] dark:bg-muted/25 lg:block lg:border-r">
            <BuildSectionNav buildNavigation={buildNavigation} />
          </div>

          {/* Content + TOC centered in the remaining space (Cursor-style) */}
          <div className="flex min-h-0 min-w-0 flex-1 justify-center">
            <div className="flex w-full max-w-[72rem] gap-10 px-4 py-8 sm:px-8 lg:gap-12 lg:px-12">
              <main className="min-w-0 flex-1 [&_.dot-row-container]:!px-0">
                <div className="w-full max-w-[52rem]">
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold">
                      {pageAsset.page.title}
                    </h1>
                  </div>
                  {hasBlockContent && (
                    <div className="prose dark:prose-invert mb-8 max-w-none">
                      <DotBlockEditor
                        blocks={
                          typeof pageAsset.page.content === "string" &&
                          isJSON(pageAsset.page.content)
                            ? JSON.parse(pageAsset.page.content)
                            : pageAsset.page.content?.json ||
                              pageAsset.page.content
                        }
                        customRenderers={{}}
                      />
                    </div>
                  )}
                  {!hasBlockContent && fallbackBody && (
                    <div className="prose dark:prose-invert mb-8 max-w-none">
                      {typeof fallbackBody === "string" ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: fallbackBody }}
                        />
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

              {showPageToc && (
                <div
                  id="right-toc"
                  className={cn(
                    "w-56 shrink-0 sticky top-32 self-start overflow-y-auto py-1",
                    "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full",
                    "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
                    "max-h-[calc(100vh-8rem)]",
                    showWideColumn ? "hidden xl:block" : "hidden"
                  )}
                >
                  <OnThisPage selectors={TOC_SELECTORS} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {pageAsset?.layout?.footer && <Footer {...content} />}
    </div>
  );
}
