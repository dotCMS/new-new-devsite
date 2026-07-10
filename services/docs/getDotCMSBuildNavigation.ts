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
  return item.href?.trim() || "#";
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

function sectionNavFromPrimary(primary: DotCMSNavigationItem): DynamicPrimarySectionNav {
  const subTabItems = sortByOrder(primary.children ?? []).filter(
    (item) => item.type === "folder"
  );

  const tabs = subTabItems.map((item) => ({
    id: itemId(item, "nav-subtab"),
    label: itemLabel(item, "Docs"),
    href: firstNavigableHref(item),
    activeHref: itemHref(item),
  }));

  const navBySubTab = subTabItems.reduce<Record<string, BuildNavSection[]>>(
    (acc, item) => {
      const id = itemId(item, "nav-subtab");
      acc[id] = sectionsFromSubTab(item);
      return acc;
    },
    {}
  );

  return { tabs, navBySubTab };
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

  const activePrimary =
    primaryTabs
      .filter((tab) => pathname?.startsWith(tab.activeHref || tab.href))
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
  const cacheKey = getCacheKey(`dotcms-build-navigation|${uri}|${depth}|v2`);
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
