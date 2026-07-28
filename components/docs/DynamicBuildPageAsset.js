"use client";

import { DotCMSLayoutBody, useEditableDotCMSPage } from "@dotcms/react";
import { pageComponents } from "@/components/content-types";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import { BuildSubNav } from "./BuildSubNav";
import { BuildSectionNav } from "./BuildSectionNav";
import { DocsMobileNavSheet } from "./DocsMobileNavSheet";
import { DotBlockEditor } from "@/components/shared/dotBlockEditor";
import OnThisPage from "@/components/navigation/OnThisPage";
import { useAssistant } from "@/components/chat/AssistantProvider";
import { useContentColumnWideLayout } from "@/hooks/useHeaderWideNav";
import { cn, isJSON } from "@/util/utils";
import MarkdownContent from "@/components/MarkdownContent";
import { DeprecationCard } from "@/components/deprecations/DeprecationCard";
import Warn from "@/components/mdx/Warn";
import { DocsSlugIndexProvider } from "@/components/docs/DocsSlugIndexContext";
import { docsSidebarStickyClass } from "@/components/docs/docsChrome";

const TOC_SELECTORS =
  "main h2, main h3, main h4, .dot-block-editor h1, .dot-block-editor h2, .dot-block-editor h3, .dot-block-editor h4";

/**
 * Some BlockPages put a lone "Deprecated" paragraph in `page.content` as a
 * status note; the real article lives in the layout. When we already render
 * DeprecationCard, skip that duplicate label.
 * @param {unknown} blocks
 * @returns {boolean}
 */
function isDeprecationLabelOnly(blocks) {
  if (!blocks) return false;
  const root =
    typeof blocks === "string" && isJSON(blocks)
      ? JSON.parse(blocks)
      : blocks?.json || blocks;
  const nodes = Array.isArray(root?.content)
    ? root.content
    : Array.isArray(root)
      ? root
      : null;
  if (!nodes || nodes.length === 0) return false;

  const texts = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "text" && typeof node.text === "string") {
      const t = node.text.trim();
      if (t) texts.push(t);
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  nodes.forEach(walk);

  if (texts.length !== 1) return false;
  return /^(deprecated|retired)$/i.test(texts[0]);
}

/**
 * @param {{
 *   pageContent: unknown,
 *   buildNavigation?: unknown,
 *   specialContent?: import('react').ReactNode,
 *   deprecation?: import('@/services/docs/getDeprecations/types').TDeprecation | null,
 *   docsSlugIndex?: import('@/services/docs/resolveDocsHref').DocsSlugIndex | null,
 * }} props
 */
export function DynamicBuildPageAsset({
  pageContent,
  buildNavigation,
  specialContent = null,
  deprecation = null,
  docsSlugIndex = null,
}) {
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

  const rawBlockContent = pageAsset?.page?.content;
  const urlContentMap = pageAsset?.page?.urlContentMap || pageAsset?.urlContentMap;
  const pageMap = urlContentMap?._map || {};
  const externalDocumentation = pageMap.githubSource
    ? pageMap.documentation
    : null;
  const fallbackBody =
    pageMap.body ||
    pageMap.content ||
    pageMap.documentation ||
    urlContentMap?.body ||
    urlContentMap?.content ||
    urlContentMap?.documentation;

  const pageTags = pageAsset?.page?.tags || pageMap.tag || urlContentMap?.tag || [];
  const tagList = Array.isArray(pageTags)
    ? pageTags
    : typeof pageTags === "string"
      ? pageTags.split(",").map((t) => t.trim())
      : [];
  const showDeprecationBox =
    Boolean(deprecation) || tagList.includes("deprecated");

  // Skip CMS "Deprecated" label blocks when the inline card already covers it.
  const hasBlockContent =
    Boolean(rawBlockContent) &&
    !(showDeprecationBox && isDeprecationLabelOnly(rawBlockContent));

  const showPageToc =
    !specialContent &&
    (!pageAsset?.page?.show || pageAsset.page.show.indexOf("toc") !== -1);

  return (
    <DocsSlugIndexProvider index={docsSlugIndex}>
    <div className="flex min-h-screen flex-col bg-background">
      {pageAsset?.layout?.header && (
        <Header
          navItems={navigation?.children}
          primaryNavItems={buildNavigation?.primaryTabs}
          buildNavigation={buildNavigation}
        />
      )}
      <BuildSubNav
        buildNavigation={buildNavigation}
        trailing={
          <DocsMobileNavSheet buildNavigation={buildNavigation} />
        }
      />
      <div className="flex min-h-0 w-full min-w-0 flex-1">
        <div className="flex w-full min-w-0 flex-1 flex-col lg:flex-row">
          <aside className={docsSidebarStickyClass}>
            <BuildSectionNav buildNavigation={buildNavigation} />
          </aside>

          {/* Content + TOC centered in the remaining space (Cursor-style) */}
          <div className="flex min-h-0 min-w-0 flex-1 justify-center">
            <div
              className={cn(
                "flex w-full gap-10 px-4 py-8 sm:px-8 lg:gap-12 lg:px-12",
                specialContent ? "max-w-none" : "max-w-[72rem]"
              )}
            >
              <main className="min-w-0 flex-1 [&_.dot-row-container]:!px-0">
                {specialContent ? (
                  <div className="w-full min-w-0">{specialContent}</div>
                ) : (
                  <div className="w-full max-w-[52rem]">
                    <div className="mb-8">
                      <h1 className="text-4xl font-bold">
                        {pageAsset.page.title}
                      </h1>
                    </div>
                    {showDeprecationBox && (
                      <div className="mb-6">
                        {deprecation ? (
                          <DeprecationCard
                            deprecation={deprecation}
                            variant="inline"
                          />
                        ) : (
                          <Warn>This function has been deprecated.</Warn>
                        )}
                      </div>
                    )}
                    {externalDocumentation && (
                      <div className="prose dark:prose-invert mb-8 max-w-none">
                        <MarkdownContent content={externalDocumentation} />
                      </div>
                    )}
                    {!externalDocumentation && hasBlockContent && (
                      <div className="prose dark:prose-invert mb-8 max-w-none">
                        <DotBlockEditor
                          blocks={
                            typeof rawBlockContent === "string" &&
                            isJSON(rawBlockContent)
                              ? JSON.parse(rawBlockContent)
                              : rawBlockContent?.json || rawBlockContent
                          }
                          customRenderers={{}}
                        />
                      </div>
                    )}
                    {!externalDocumentation &&
                      !hasBlockContent &&
                      !isDeprecationLabelOnly(rawBlockContent) &&
                      fallbackBody && (
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
                    {!externalDocumentation && (
                      <DotCMSLayoutBody
                        page={pageAsset}
                        components={pageComponents}
                        mode={process.env.NEXT_PUBLIC_DOTCMS_MODE}
                      />
                    )}
                  </div>
                )}
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
    </DocsSlugIndexProvider>
  );
}
