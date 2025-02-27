"use client";

import React, { useEffect, useRef } from "react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import OnThisPage from "../navigation/OnThisPage";
import Warn from "../mdx/Warn";

function cleanMarkdown(markdownString, identifierString) {
  return markdownString
    .replaceAll("${docImage}", "/dA/" + identifierString + "/diagram")
    .replaceAll(
      'src="/contentAsset',
      'src="https://www.dotcms.com/contentAsset'
    )
    .replaceAll("(/dA/", "(https://www.dotcms.com/dA/")
    .replaceAll("( /dA/", "(https://www.dotcms.com/dA/")
    .replaceAll('src="/dA/', 'src="https://www.dotcms.com/dA/')
    .replaceAll("(/contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll("( /contentAsset", "(https://www.dotcms.com/contentAsset")
    .replaceAll(/\{#[A-Za-z0-1]*\}/g, "")
    .replaceAll("<br>", "<br/>")
    .replaceAll("()", "")
    .replaceAll("</br>", "<br/>");
}

const Documentation = ({ contentlet, sideNav, slug }) => {
  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  const documentation = cleanMarkdown(
    contentlet.documentation,
    contentlet.identifier
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 py-8 lg:pb-12 px-0 sm:px-0 lg:px-8
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
        >
          <Breadcrumbs
            items={sideNav[0]?.dotcmsdocumentationchildren || []}
            slug={slug}
          />

          <div className="markdown-content">
            <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
            {contentlet.tag.includes("deprecated")  && (
              <div className="mb-6">
                <Warn>
                  This function has been deprecated.
                </Warn>
              </div>
            )}
            <MarkdownContent content={documentation} />
          </div>
        </main>

        {/* Right Sidebar - Hide on smaller screens */}
        <div className="w-64 shrink-0 hidden xl:block">
          <div className="sticky top-16 pt-8 pl-8
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
      </div>
    </>
  );
};

export default Documentation;
