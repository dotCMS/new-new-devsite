import { client } from "@/util/dotcmsClient";
import { getCacheKey, navCache } from "@/util/cacheService";
import type { BuildNavLink, BuildNavSection } from "@/components/docs/buildNavData";

export type DynamicBuildSubTab = {
  id: string;
  label: string;
  href: string;
  activeHref: string;
};

export type DynamicBuildNavigation = {
  primaryTabs: DynamicBuildSubTab[];
  tabs: DynamicBuildSubTab[];
  navBySubTab: Record<string, BuildNavSection[]>;
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
const BUILD_SECTION_TITLE = "build";

const emptyBuildNavigation: DynamicBuildNavigation = {
  primaryTabs: [],
  tabs: [],
  navBySubTab: {},
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

function itemId(item: DotCMSNavigationItem, fallback = "build-item"): string {
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

function isBuildItem(item: DotCMSNavigationItem): boolean {
  const title = item.title?.trim().toLowerCase();
  const folder = item.folder?.trim().toLowerCase();

  return title === BUILD_SECTION_TITLE || folder?.endsWith("/build") === true;
}

function findBuildRoot(root: DotCMSNavigationItem): DotCMSNavigationItem | null {
  if (isBuildItem(root)) {
    return root;
  }

  const children = root.children ?? [];
  return children.find((item) => item.type === "folder" && isBuildItem(item)) ?? null;
}

function toBuildLink(item: DotCMSNavigationItem): BuildNavLink {
  const link: BuildNavLink = {
    id: itemId(item, "build-link"),
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
    id: itemId(item, "build-section"),
    title: itemLabel(item, "Build"),
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
      id: `${itemId(subTab, "build-subtab")}-pages`,
      title: itemLabel(subTab, "Build"),
      items: directLinks,
    },
    ...folderSections,
  ];
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

  const buildRoot = findBuildRoot(navigation);
  if (!buildRoot) {
    return {
      ...emptyBuildNavigation,
      primaryTabs,
    };
  }

  const subTabItems = sortByOrder(buildRoot.children ?? []).filter(
    (item) => item.type === "folder"
  );

  const tabs = subTabItems.map((item) => ({
    id: itemId(item, "build-subtab"),
    label: itemLabel(item, "Build"),
    href: firstNavigableHref(item),
    activeHref: itemHref(item),
  }));

  const navBySubTab = subTabItems.reduce<Record<string, BuildNavSection[]>>(
    (acc, item) => {
      const id = itemId(item, "build-subtab");
      acc[id] = sectionsFromSubTab(item);
      return acc;
    },
    {}
  );

  return { primaryTabs, tabs, navBySubTab };
}

export async function getDotCMSBuildNavigation(
  options: FetchBuildNavigationOptions = {}
): Promise<DynamicBuildNavigation> {
  const uri = options.uri ?? DEFAULT_BUILD_NAV_URI;
  const depth = options.depth ?? DEFAULT_BUILD_NAV_DEPTH;
  const ttlSeconds = options.ttlSeconds ?? 600;
  const cacheKey = getCacheKey(`dotcms-build-navigation|${uri}|${depth}|v1`);
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

  if (buildNavigation.tabs.length > 0) {
    navCache.set(cacheKey, buildNavigation, ttlSeconds);
  }

  return buildNavigation;
}
