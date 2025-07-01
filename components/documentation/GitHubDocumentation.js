"use client";

import React from "react";
import { ExternalLink, Github } from "lucide-react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import OnThisPage from "../navigation/OnThisPage";
import Warn from "../mdx/Warn";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GitHubDocumentation = ({ contentlet, sideNav, slug }) => {
  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  const { githubConfig } = contentlet;
  const githubUrl = `https://github.com/${githubConfig.owner}/${githubConfig.repo}`;
  const githubLibraryUrl = `https://github.com/${githubConfig.owner}/${githubConfig.repo}/tree/${githubConfig.branch}/${githubConfig.path.replace('README.md', '')}`;
  const documentation = contentlet.documentation;

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
            {/* GitHub Source Alert */}
            <div className="not-markdown">
              <Alert className="mb-6">
                <Github className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    This documentation is automatically synchronized from the{" "}
                    <strong>{githubConfig.repo}</strong> repository.
                  </span>
                  <a
                    href={githubLibraryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View on GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </div>

            <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
            
            {contentlet.tag && contentlet.tag.includes("deprecated") && (
              <div className="mb-6">
                <Warn>
                  This function has been deprecated.
                </Warn>
              </div>
            )}
            
            <MarkdownContent content={documentation} />
          </div>

          {/* Additional GitHub Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span>
                  Source:{" "}
                  <a
                    href={`${githubLibraryUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {githubConfig.path}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Branch:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {githubConfig.branch}
                  </code>
                </span>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground">
              Found an issue with this documentation?{" "}
              <a
                href={`${githubUrl}/issues/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Report it on GitHub
              </a>
            </p>
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

export default GitHubDocumentation; 