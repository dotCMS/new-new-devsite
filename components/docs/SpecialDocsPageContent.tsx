import ChangeLogList from "@/components/changelogs/ChangeLogList";
import CurrentReleases from "@/components/releases/CurrentReleases";
import AllReleases from "@/components/releases/AllReleases";
import AllSecurityIssues from "@/components/security-issues/AllSecurityIssues";
import Deprecations from "@/components/deprecations/Deprecations";
import SwaggerUIComponent from "@/components/playgrounds/SwaggerUIComponent/SwaggerUIComponent";
import { JavadocEmbeddedDocs } from "@/components/javadocs/JavadocEmbeddedDocs";
import type { SpecialDocsPageKey } from "@/config/special-doc-pages";

type SpecialDocsPageContentProps = {
  pageKey: SpecialDocsPageKey;
  slug: string;
  sideNav: unknown[];
  contentlet?: {
    navTitle?: string;
    title?: string;
    _map?: Record<string, unknown>;
  };
  searchParams?: Record<string, string | string[] | undefined>;
  allDeprecations?: unknown[];
};

/**
 * Shared renderer for docs pages that need custom React UIs.
 * Used by both `/docs/...` and `/testing-devresource/...`.
 */
export function SpecialDocsPageContent({
  pageKey,
  slug,
  sideNav,
  contentlet,
  searchParams,
  allDeprecations,
}: SpecialDocsPageContentProps) {
  const data = {
    contentlet,
    sideNav,
    currentPath: slug,
    searchParams,
    allDeprecations,
  };

  switch (pageKey) {
    case "changelogs":
      return <ChangeLogList {...data} slug={slug} />;
    case "current-releases":
      return <CurrentReleases {...data} slug={slug} />;
    case "all-releases":
    case "previous-releases":
      return <AllReleases {...data} slug={slug} />;
    case "known-security-issues":
      return <AllSecurityIssues {...data} slug={slug} />;
    case "deprecations":
      return (
        <Deprecations
          {...data}
          slug={slug}
          initialItems={(allDeprecations as never[]) || []}
        />
      );
    case "all-rest-apis":
      return <SwaggerUIComponent {...data} slug={slug} />;
    case "javadocs":
      return (
        <JavadocEmbeddedDocs
          contentlet={contentlet || {}}
          sideNav={sideNav as { dotcmsdocumentationchildren?: unknown[] }[]}
          slug={slug}
          searchParams={searchParams}
        />
      );
    default:
      return null;
  }
}
