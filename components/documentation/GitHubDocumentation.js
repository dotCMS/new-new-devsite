"use client";

import React from "react";
import { ExternalLink, Github, Zap } from "lucide-react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import OnThisPage from "../navigation/OnThisPage";
import Warn from "../mdx/Warn";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GitHubDocumentation = ({ contentlet, sideNav, slug }) => {
  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  // githubConfig is stored in contentlet._map (since contentlet is urlContentMap)
  const githubConfig = contentlet._map?.githubConfig || contentlet.githubConfig;
  
  // Check if githubConfig exists and has required properties
  if (!githubConfig || !githubConfig.owner || !githubConfig.repo || !githubConfig.branch || !githubConfig.path) {
    return <div>Error: Missing GitHub configuration</div>;
  }

  const githubUrl = `https://github.com/${githubConfig.owner}/${githubConfig.repo}`;
  
  // Construct library URL properly - remove README.md only if it's at the end of the path
  const pathWithoutReadme = githubConfig.path.endsWith('/README.md')
    ? githubConfig.path.slice(0, -10) // Remove '/README.md'
    : githubConfig.path.endsWith('README.md') 
    ? githubConfig.path.slice(0, -9) // Remove 'README.md'
    : githubConfig.path;
  
  const githubLibraryUrl = `https://github.com/${githubConfig.owner}/${githubConfig.repo}/tree/${githubConfig.branch}/${pathWithoutReadme}`;
  // documentation is also in _map (since contentlet is urlContentMap)
  const documentation = contentlet._map?.documentation || contentlet.documentation;

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
                <AlertDescription>
                  <div className="flex items-start gap-2">
                    <Github className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">
                        This documentation is automatically synchronized from the{" "}
                        <strong>{githubConfig.repo}</strong> repository.
                      </span>
                      <a
                        href={githubLibraryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap ml-4"
                      >
                        View on GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  {githubConfig.starterGuide && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">
                            Get started quickly with detailed instructions and visual aids.
                          </span>
                          <a
                            href={githubConfig.starterGuide}
                            {...(() => {
                              try {
                                // Simple and consistent logic: if it starts with http/https, treat as external
                                // This works the same on server and client, preventing hydration mismatches
                                const isExternal = /^https?:\/\//.test(githubConfig.starterGuide);
                                return isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                              } catch {
                                // If anything fails, treat as internal link
                                return {};
                              }
                            })()}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap ml-4"
                          >
                            View Integration Guide
                            {(() => {
                              try {
                                const isExternal = /^https?:\/\//.test(githubConfig.starterGuide);
                                return isExternal ? <ExternalLink className="h-3 w-3" /> : null;
                              } catch {
                                return null;
                              }
                            })()}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl font-bold">{contentlet._map?.title || contentlet.title}</h1>
              {(contentlet._map?.tag || contentlet.tag)?.includes("beta") && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  Beta Feature
                </span>
              )}
            </div>
            
            {(contentlet._map?.tag || contentlet.tag) && (contentlet._map?.tag || contentlet.tag).includes("deprecated") && (
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