/** Build site-relative doc URLs — mirrors SearchResult / docs routing. */
export function formatDocSourcePath(
  contentType: string = "",
  url: string = ""
): string {
  switch (contentType.toLowerCase()) {
    case "dotcmsdocumentation":
      return url.startsWith("/docs/") ? url : `/docs/${url}`;
    case "devresource":
      return url.startsWith("/learning/") ? url : `/learning/${url}`;
    case "component":
      return url;
    case "blog":
      return url.startsWith("/blog/") ? url : `/blog/${url}`;
    default:
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
