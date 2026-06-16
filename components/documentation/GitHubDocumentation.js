"use client";

import React from "react";
import { ArrowRight, ExternalLink, FlaskConical, Package, Zap } from "lucide-react";

import { useAssistant } from "@/components/chat/AssistantProvider";
import { useContentColumnWideLayout } from "@/hooks/useHeaderWideNav";
import { cn } from "@/util/utils";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownContent from "@/components/MarkdownContent";
import OnThisPage from "../navigation/OnThisPage";
import Warn from "../mdx/Warn";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Normalize an npm source config into the shape the source panel renders.
 * Returns null if the config is missing/invalid.
 *
 * Shape:
 *   {
 *     pkg,           // npm package name, e.g. "@dotcms/client"
 *     tag,           // npm dist-tag, e.g. "latest" | "beta"
 *     packageUrl,    // npmjs.com package page
 *     starterGuide,  // optional integration guide link
 *   }
 */
function buildSourceMeta(config) {
  if (!config || !config.pkg) {
    return null;
  }

  return {
    pkg: config.pkg,
    tag: config.tag,
    packageUrl: `https://www.npmjs.com/package/${config.pkg}`,
    starterGuide: config.starterGuide,
  };
}

const GitHubDocumentation = ({ contentlet, sideNav, slug }) => {
  const { open: assistantOpen, expanded: assistantExpanded } = useAssistant();
  const showWideColumn = useContentColumnWideLayout(
    assistantOpen,
    assistantExpanded
  );

  if (!contentlet || !sideNav) {
    return <div>Loading...</div>;
  }

  // The npm source config is stored in contentlet._map (since contentlet is
  // urlContentMap): { source:'npm', pkg, tag, starterGuide? }.
  const sourceConfig = contentlet._map?.githubConfig || contentlet.githubConfig;

  // Normalize into a `meta` describing the source panel.
  const meta = buildSourceMeta(sourceConfig);
  if (!meta) {
    return <div>Error: Missing documentation source configuration</div>;
  }

  // documentation is also in _map (since contentlet is urlContentMap)
  const documentation = contentlet._map?.documentation || contentlet.documentation;

  // Beta switch state. `isBeta` (viewing the beta tag) is derived from the
  // effective tag; `betaAvailable` (the package publishes a beta tag) is
  // computed server-side from the npm registry.
  const isBeta = meta.tag === "beta";
  const tagInfo = contentlet._map?.tagInfo || contentlet.tagInfo || {};
  const betaAvailable = Boolean(tagInfo.betaAvailable);

  // Toggle targets. The slug is the canonical page; beta is opted into via
  // ?tag=beta and dropped to return to stable.
  const stableUrl = `/docs/${slug}`;
  const betaUrl = `/docs/${slug}?tag=beta`;

  // An http(s) starter guide opens in a new tab; an internal path navigates
  // in-app. Computed once so server and client agree (no hydration mismatch).
  const guideExternal = /^https?:\/\//.test(meta.starterGuide || "");

  return (
    <>
      <div className="flex flex-col lg:flex-row w-full min-w-0 max-w-[1400px] mx-auto">
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
            {/* Beta state: warning banner when viewing beta docs */}
            {isBeta && (
              <div className="not-markdown">
                <Alert className="mb-6 border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertDescription>
                    <div className="flex items-start gap-2">
                      <FlaskConical className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">
                          You&apos;re viewing <strong>pre-release (beta)</strong>{" "}
                          documentation. Features and APIs may change before the
                          stable release.
                        </span>
                        <a
                          href={stableUrl}
                          className="inline-flex items-center gap-1 text-sm font-medium hover:underline whitespace-nowrap ml-4"
                        >
                          View stable docs
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* npm source + integration guide links (compact) */}
            <div className="not-markdown mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={meta.packageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Package className="h-3.5 w-3.5" />
                {meta.pkg}
                <ExternalLink className="h-3 w-3" />
              </a>
              {meta.starterGuide && (
                <a
                  href={meta.starterGuide}
                  {...(guideExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Integration guide
                  {guideExternal && <ExternalLink className="h-3 w-3" />}
                </a>
              )}
              {/* Beta discovery link: same row, pushed to the far right */}
              {!isBeta && betaAvailable && (
                <a
                  href={betaUrl}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline ml-auto"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  View beta docs
                  <ArrowRight className="h-3 w-3" />
                </a>
              )}
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

          {/* Additional npm Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  Package:{" "}
                  <a
                    href={meta.packageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {meta.pkg}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Tag:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {meta.tag}
                  </code>
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Found an issue with this documentation?{" "}
              <a
                href={meta.packageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View the package on npm
              </a>
            </p>
          </div>
        </main>

        {/* Right Sidebar — effective width (viewport − assistant), not raw xl breakpoint */}
        <div
          className={cn(
            "w-64 shrink-0",
            showWideColumn ? "block" : "hidden"
          )}
        >
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