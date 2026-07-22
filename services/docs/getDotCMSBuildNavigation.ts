import { client } from "@/util/dotcmsClient";
import { getCacheKey, navCache } from "@/util/cacheService";
import type { BuildNavLink, BuildNavSection } from "@/components/docs/buildNavData";

export type DynamicBuildSubTab = {
  id: string;
  label: string;
  href: string;
  activeHref: string;
};

export type DynamicPrimarySectionNav = {
  tabs: DynamicBuildSubTab[];
  navBySubTab: Record<string, BuildNavSection[]>;
};

export type DynamicBuildNavigation = {
  primaryTabs: DynamicBuildSubTab[];
  /** @deprecated Prefer resolving via `navByPrimaryTab` + pathname. Kept for callers that still read top-level tabs. */
  tabs: DynamicBuildSubTab[];
  /** @deprecated Prefer resolving via `navByPrimaryTab` + pathname. */
  navBySubTab: Record<string, BuildNavSection[]>;
  navByPrimaryTab: Record<string, DynamicPrimarySectionNav>;
};

type DotCMSNavigationItem = {
  code?: string | null;
  folder?: string | null;
  href?: string | null;
  order?: number | null;
  target?: string | null;
  title?: string | null;
  type?: "folder" | "link" | "page" | string | null;
  children?: DotCMSNavigationItem[] | null;
};

type BuildNavigationPageContent = {
  content?: {
    buildNavigation?: DotCMSNavigationItem;
  };
};

type FetchBuildNavigationOptions = {
  uri?: string;
  depth?: number;
  ttlSeconds?: number;
};

export const DEFAULT_BUILD_NAV_URI = "/testing-devresource";
export const DEFAULT_BUILD_NAV_DEPTH = 6;
/** Page used only as a GraphQL carrier when fetching nav outside a real page request. */
const PAGE_CONTEXT_PATH = "/docs/table-of-contents";

const emptyBuildNavigation: DynamicBuildNavigation = {
  primaryTabs: [],
  tabs: [],
  navBySubTab: {},
  navByPrimaryTab: {},
};

export const buildNavPropsFragment = `
fragment NavProps on DotNavigation {
  code
  folder
  hash
  host
  href
  languageId
  order
  target
  title
  type
}
`;

export function buildNavigationQuery(
  uri: string = DEFAULT_BUILD_NAV_URI,
  depth: number = DEFAULT_BUILD_NAV_DEPTH
): string {
  return `
DotNavigation(uri: ${JSON.stringify(uri)}, depth: ${depth}) {
  ...NavProps
  children {
    ...NavProps
    children {
      ...NavProps
      children {
        ...NavProps
        children {
          ...NavProps
          children {
            ...NavProps
            children {
              ...NavProps
            }
          }
        }
      }
    }
  }
}
`;
}

function sortByOrder(items: DotCMSNavigationItem[]): DotCMSNavigationItem[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pathSegment(path: string | null | undefined): string {
  return path?.split("/").filter(Boolean).at(-1) ?? "";
}

function itemId(item: DotCMSNavigationItem, fallback = "nav-item"): string {
  const title = item.title?.trim() || fallback;
  return item.code?.trim() || pathSegment(item.href) || slugify(title) || pathSegment(item.folder);
}

function itemLabel(item: DotCMSNavigationItem, fallback = "Untitled"): string {
  return item.title?.trim() || fallback;
}

function itemHref(item: DotCMSNavigationItem): string {
  const raw = item.href?.trim() || "#";
  if (raw === "#" || raw.startsWith("/")) {
    return raw;
  }

  // MenuLinks often store absolute CMS host URLs; keep same-site docs paths relative
  // so they work on localhost and production.
  try {
    const url = new URL(raw);
    if (
      url.pathname.startsWith("/docs") ||
      url.pathname.startsWith("/testing-devresource")
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Non-URL strings fall through unchanged.
  }

  return raw;
}

function firstNavigableHref(item: DotCMSNavigationItem): string {
  if (item.type !== "folder" && itemHref(item) !== "#") {
    return itemHref(item);
  }

  for (const child of sortByOrder(item.children ?? [])) {
    const href = firstNavigableHref(child);
    if (href !== "#") {
      return href;
    }
  }

  return itemHref(item);
}

function toBuildLink(item: DotCMSNavigationItem): BuildNavLink {
  const link: BuildNavLink = {
    id: itemId(item, "nav-link"),
    label: itemLabel(item),
    href: itemHref(item),
  };

  if (item.target === "_blank") {
    link.target = "_blank";
  }

  return link;
}

function flattenLinks(items: DotCMSNavigationItem[]): BuildNavLink[] {
  return sortByOrder(items).flatMap((item) => {
    if (item.type === "folder") {
      return flattenLinks(item.children ?? []);
    }

    return [toBuildLink(item)];
  });
}

function sectionFromFolder(item: DotCMSNavigationItem): BuildNavSection | null {
  const items = flattenLinks(item.children ?? []);

  if (items.length === 0) {
    return null;
  }

  return {
    id: itemId(item, "nav-section"),
    title: itemLabel(item, "Docs"),
    items,
  };
}

function sectionsFromSubTab(subTab: DotCMSNavigationItem): BuildNavSection[] {
  const children = sortByOrder(subTab.children ?? []);
  const folderSections = children
    .filter((item) => item.type === "folder")
    .map(sectionFromFolder)
    .filter((section): section is BuildNavSection => section !== null);

  const directLinks = children.filter((item) => item.type !== "folder").map(toBuildLink);

  if (directLinks.length === 0) {
    return folderSections;
  }

  return [
    {
      id: `${itemId(subTab, "nav-subtab")}-pages`,
      title: itemLabel(subTab, "Docs"),
      items: directLinks,
    },
    ...folderSections,
  ];
}

function subTabFromItem(item: DotCMSNavigationItem): DynamicBuildSubTab {
  return {
    id: itemId(item, "nav-subtab"),
    label: itemLabel(item, "Docs"),
    href: firstNavigableHref(item),
    activeHref: itemHref(item),
  };
}

function sectionNavFromPrimary(primary: DotCMSNavigationItem): DynamicPrimarySectionNav {
  const children = sortByOrder(primary.children ?? []);

  // Include folders and MenuLinks/pages so shortcuts under a primary (e.g.
  // Overview → Releases) appear in the sub-nav alongside folder sections.
  const tabs = children.map(subTabFromItem);

  const navBySubTab = children.reduce<Record<string, BuildNavSection[]>>(
    (acc, item) => {
      const id = itemId(item, "nav-subtab");
      acc[id] =
        item.type === "folder" ? sectionsFromSubTab(item) : [];
      return acc;
    },
    {}
  );

  return { tabs, navBySubTab };
}

/**
 * True for flat docs URLs like `/docs/{slug}` (or the shadow-root equivalent).
 * Nested redesign paths keep their real pathname for startsWith matching.
 */
export function isShallowDocsPath(
  pathname: string | null | undefined
): boolean {
  const parts = (pathname || "").split("/").filter(Boolean);
  return (
    parts.length === 2 &&
    (parts[0] === "docs" || parts[0] === "testing-devresource")
  );
}

function pathLeaf(pathname: string | null | undefined): string | null {
  const parts = (pathname || "").split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * Map a flat `/docs/{slug}` URL to its nested nav href when the leaf appears
 * in the build-nav tree. Lets outdated links highlight the correct primary /
 * sub / side-nav entries.
 */
export function resolveCanonicalDocsPathname(
  navigation: DynamicBuildNavigation | null | undefined,
  pathname: string | null | undefined
): string | null | undefined {
  if (!pathname || !navigation || !isShallowDocsPath(pathname)) {
    return pathname;
  }

  const leaf = pathLeaf(pathname);
  if (!leaf) {
    return pathname;
  }

  let best: string | null = null;
  for (const primary of navigation.primaryTabs ?? []) {
    const sectionNav = navigation.navByPrimaryTab?.[primary.id];
    if (!sectionNav) continue;

    for (const sections of Object.values(sectionNav.navBySubTab ?? {})) {
      for (const section of sections) {
        for (const item of section.items ?? []) {
          const href = item.href?.trim();
          if (!href || href === "#") continue;
          if (pathLeaf(href) !== leaf) continue;
          if (!best || href.length > best.length) {
            best = href;
          }
        }
      }
    }
  }

  return best ?? pathname;
}

export function isBuildNavHrefActive(
  pathname: string | null | undefined,
  href: string | null | undefined,
  navigation?: DynamicBuildNavigation | null
): boolean {
  if (!pathname || !href || href === "#") return false;
  if (pathname === href) return true;
  const canonical = resolveCanonicalDocsPathname(navigation, pathname);
  return Boolean(canonical && canonical === href);
}

export function resolveActivePrimaryNav(
  navigation: DynamicBuildNavigation | null | undefined,
  pathname: string | null | undefined
): {
  primaryTab: DynamicBuildSubTab | null;
  tabs: DynamicBuildSubTab[];
  navBySubTab: Record<string, BuildNavSection[]>;
} {
  const primaryTabs = navigation?.primaryTabs ?? [];
  const navByPrimaryTab = navigation?.navByPrimaryTab ?? {};
  const effectivePath =
    resolveCanonicalDocsPathname(navigation, pathname) ?? pathname;

  const activePrimary =
    primaryTabs
      .filter((tab) => effectivePath?.startsWith(tab.activeHref || tab.href))
      .sort(
        (a, b) =>
          (b.activeHref || b.href).length - (a.activeHref || a.href).length
      )[0] ?? primaryTabs[0] ?? null;

  if (!activePrimary) {
    return {
      primaryTab: null,
      tabs: navigation?.tabs ?? [],
      navBySubTab: navigation?.navBySubTab ?? {},
    };
  }

  const sectionNav = navByPrimaryTab[activePrimary.id];

  return {
    primaryTab: activePrimary,
    tabs: sectionNav?.tabs ?? navigation?.tabs ?? [],
    navBySubTab: sectionNav?.navBySubTab ?? navigation?.navBySubTab ?? {},
  };
}

export function transformDotCMSBuildNavigation(
  navigation: DotCMSNavigationItem | null | undefined
): DynamicBuildNavigation {
  if (!navigation) {
    return emptyBuildNavigation;
  }

  const primaryItems = sortByOrder(navigation.children ?? []).filter(
    (item) => item.type === "folder"
  );
  const primaryTabs = primaryItems.map((item) => ({
    id: itemId(item, "primary-tab"),
    label: itemLabel(item, "Docs"),
    href: firstNavigableHref(item),
    activeHref: itemHref(item),
  }));

  const navByPrimaryTab = primaryItems.reduce<
    Record<string, DynamicPrimarySectionNav>
  >((acc, item) => {
    const id = itemId(item, "primary-tab");
    acc[id] = sectionNavFromPrimary(item);
    return acc;
  }, {});

  // Keep top-level tabs/navBySubTab pointing at the first primary section for
  // older callers that don't resolve by pathname yet.
  const firstPrimaryId = primaryTabs[0]?.id;
  const firstSectionNav = firstPrimaryId
    ? navByPrimaryTab[firstPrimaryId]
    : undefined;

  return {
    primaryTabs,
    tabs: firstSectionNav?.tabs ?? [],
    navBySubTab: firstSectionNav?.navBySubTab ?? {},
    navByPrimaryTab,
  };
}

export async function getDotCMSBuildNavigation(
  options: FetchBuildNavigationOptions = {}
): Promise<DynamicBuildNavigation> {
  const uri = options.uri ?? DEFAULT_BUILD_NAV_URI;
  const depth = options.depth ?? DEFAULT_BUILD_NAV_DEPTH;
  const ttlSeconds = options.ttlSeconds ?? 600;
  const cacheKey = getCacheKey(`dotcms-build-navigation|${uri}|${depth}|v3`);
  const query = buildNavigationQuery(uri, depth);

  const cached = navCache.get<DynamicBuildNavigation>(cacheKey);
  if (cached) {
    return cached;
  }

  const pageContent = await client.page.get(PAGE_CONTEXT_PATH, {
    graphql: {
      content: {
        buildNavigation: query,
      },
      fragments: [buildNavPropsFragment],
    },
  });

  const navigation = (pageContent as BuildNavigationPageContent | null)?.content
    ?.buildNavigation;
  const buildNavigation = transformDotCMSBuildNavigation(navigation);

  if (
    buildNavigation.primaryTabs.length > 0 ||
    Object.keys(buildNavigation.navByPrimaryTab).length > 0
  ) {
    navCache.set(cacheKey, buildNavigation, ttlSeconds);
  }

  return buildNavigation;
}
