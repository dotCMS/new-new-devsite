"use client";

import React, { useEffect, useRef, useState } from "react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import OnThisPage from "../navigation/OnThisPage";
import Warn from "../mdx/Warn";
import Info from "../mdx/Info";
import getDeprecations from "@/services/docs/getDeprecations/getDeprecations";
import { DeprecationCard } from "../deprecations/DeprecationCard";


function cleanMarkdown(markdownString, identifierString) {
  return markdownString
    .replaceAll("${docImage}", "/dA/" + identifierString + "/diagram")
    .replaceAll("</br>", "<br>");
}

const Documentation = ({ contentlet, sideNav, slug }) => {
  const [matchedDeprecation, setMatchedDeprecation] = useState(null);
  const [deprecationsLoaded, setDeprecationsLoaded] = useState(false);

  useEffect(() => {
    async function findMatchingDeprecation() {
      if (!contentlet?.tag?.includes("deprecated") || !contentlet?.urlTitle) {
        setDeprecationsLoaded(true);
        return;
      }

      try {
        const deprecations = await getDeprecations({ ttlSeconds: 60 });
        if (!deprecations || !Array.isArray(deprecations)) {
          setDeprecationsLoaded(true);
          return;
        }

        // Find deprecation where one of its docLinks has a matching urlTitle
        const match = deprecations.find(dep => 
          dep.docLinks && 
          Array.isArray(dep.docLinks) && 
          dep.docLinks.some(link => link.urlTitle === contentlet.urlTitle)
        );

        setMatchedDeprecation(match || null);
      } catch (error) {
        console.error("Error fetching deprecations:", error);
      } finally {
        setDeprecationsLoaded(true);
      }
    }

    findMatchingDeprecation();
  }, [contentlet?.urlTitle, contentlet?.tag]);

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
            childrenKey="dotcmsdocumentationchildren"
          />

          <div className="markdown-content">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl font-bold">{contentlet.title}</h1>
              {contentlet.tag.includes("beta") && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  Beta Feature
                </span>
              )}
            </div>
            {contentlet.tag.includes("deprecated") && deprecationsLoaded && (
              <div className="mb-6">
                {matchedDeprecation ? (
                  <DeprecationCard deprecation={matchedDeprecation} variant="inline" />
                ) : (
                  <Warn>
                    This function has been deprecated.
                  </Warn>
                )}
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
