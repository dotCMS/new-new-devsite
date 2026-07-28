import {
  resolveDocsHref,
  type DocsSlugIndex,
} from "@/services/docs/resolveDocsHref";

/** Build site-relative doc URLs — mirrors SearchResult / docs routing. */
export function formatDocSourcePath(
  contentType: string = "",
  url: string = "",
  slugIndex?: DocsSlugIndex | null,
): string {
  let href: string;
  switch (contentType.toLowerCase()) {
    case "dotcmsdocumentation":
      href = url.startsWith("/docs/") ? url : `/docs/${url}`;
      return resolveDocsHref(href, slugIndex);
    case "devresource":
      return url.startsWith("/learning/") ? url : `/learning/${url}`;
    case "component":
      return url;
    case "blog":
      return url.startsWith("/blog/") ? url : `/blog/${url}`;
    default:
      if (url.startsWith("/docs/") || (!url.includes("/") && url)) {
        const docsHref = url.startsWith("/docs/") ? url : `/docs/${url}`;
        return resolveDocsHref(docsHref, slugIndex);
      }
      return url;
  }
}

export function sourceHrefToDisplay(href: string): string {
  if (href.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${href}`;
    }
    return href;
  }
  return href;
}
