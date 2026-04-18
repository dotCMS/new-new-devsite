// Navigation transform utilities shared between server and client

export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  target?: string;
  items?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface ApiNavItem {
  type: 'folder' | 'link' | 'page';
  title: string;
  href?: string;
  code?: string | null;
  folder?: string;
  order: number;
  target?: string;
  children: ApiNavItem[];
  /**
   * Menulinks may include `false` for off-menu rows; we hide those unless
   * `code` matches the active doc slug.
   */
  showOnMenu?: boolean;
}

/** Segment after `docs/` from a page URL, for matching `ApiNavItem.code` (e.g. `docs/a/b` → `a/b`). */
export function docsUrlToMenuSlug(url: string | undefined | null): string | undefined {
  if (url == null || typeof url !== 'string') return undefined;
  const trimmed = url.trim().replace(/^\/+/, '');
  if (!trimmed.startsWith('docs/')) return undefined;
  const rest = trimmed.slice('docs/'.length);
  return rest ? rest.toLowerCase() : undefined;
}

/**
 * Keeps link/page nodes with `showOnMenu !== false`, plus any `showOnMenu === false` node whose
 * `code` equals the active docs slug. Folders are kept only if they still have children after filtering.
 * With live API data (no `showOnMenu: false` in payload), this is a no-op aside from tree walks.
 */
/** Menulinks / JSON may send boolean or string; treat false-like as hidden for filter. */
function isExplicitlyOffMenu(showOnMenu: ApiNavItem['showOnMenu']): boolean {
  const v = showOnMenu as unknown;
  return v === false || v === 'false' || v === 0;
}

/** Aligns route / CMS urlTitle with menulinks `linkCode` / derived paths (optional `docs/` prefix, slashes). */
export function canonicalNavFilterKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/^docs\/+/i, "");
}

export function filterApiNavForMenuAndSlug(
  items: ApiNavItem[],
  currentSlug: string | undefined
): ApiNavItem[] {
  const pageKey = currentSlug ? canonicalNavFilterKey(currentSlug) : "";

  const leafVisible = (item: ApiNavItem): boolean => {
    if (item.type !== 'link' && item.type !== 'page') return false;
    if (!isExplicitlyOffMenu(item.showOnMenu)) return true;
    if (!pageKey) return false;
    const code = item.code != null ? String(item.code).trim() : "";
    if (!code) return false;
    return canonicalNavFilterKey(code) === pageKey;
  };

  const walk = (nodes: ApiNavItem[]): ApiNavItem[] => {
    const sorted = [...nodes].sort((a, b) => a.order - b.order);
    const out: ApiNavItem[] = [];
    for (const item of sorted) {
      if (item.type === 'folder') {
        const children = walk(item.children ?? []);
        if (children.length > 0) {
          out.push({ ...item, children });
        }
      } else if (item.type === 'link' || item.type === 'page') {
        if (leafVisible(item)) {
          out.push(item);
        }
      }
    }
    return out;
  };

  return walk(items);
}

/**
 * Same folder/link tree as {@link filterApiNavForMenuAndSlug} but keeps every `link` / `page`
 * regardless of `showOnMenu`. Use for breadcrumb / quick-search slug maps; left nav still uses
 * the filtered tree so `showOnMenu: false` stays hidden unless it’s the active doc.
 */
export function filterApiNavKeepAllLeaves(items: ApiNavItem[]): ApiNavItem[] {
  const walk = (nodes: ApiNavItem[]): ApiNavItem[] => {
    const sorted = [...nodes].sort((a, b) => a.order - b.order);
    const out: ApiNavItem[] = [];
    for (const item of sorted) {
      if (item.type === 'folder') {
        const children = walk(item.children ?? []);
        if (children.length > 0) {
          out.push({ ...item, children });
        }
      } else if (item.type === 'link' || item.type === 'page') {
        out.push(item);
      }
    }
    return out;
  };

  return walk(items);
}

export function processLinkHref(linkData: ApiNavItem): string {
  if (linkData.code && linkData.code.trim() !== '') {
    return `/docs/${linkData.code}`;
  }

  if (linkData.href) {
    if (linkData.href.startsWith('https://')) {
      return linkData.href;
    }

    try {
      const url = new URL(linkData.href);
      return url.pathname + url.search + url.hash;
    } catch (_e) {
      return linkData.href;
    }
  }

  return '#';
}

export function transformApiItemsToNavItems(items: ApiNavItem[]): NavItem[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      if (item.type === 'folder') {
        const navItem: NavItem = {
          title: item.title,
          href: '#',
        };

        if (item.children && item.children.length > 0) {
          navItem.items = transformApiItemsToNavItems(item.children);
        }
        return navItem;
      } else if (item.type === 'link' || item.type === 'page') {
        const navItem: NavItem = {
          title: item.title,
          href: processLinkHref(item),
        };
        if (item.target === '_blank') {
          navItem.target = '_blank';
        }
        return navItem;
      }

      return {
        title: item.title,
        href: '#',
      };
    })
    .filter(Boolean);
}

export function transformApiResponseToNavSections(apiData: ApiNavItem[]): NavSection[] {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  return apiData
    .filter((item) => item.type === 'folder')
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      title: section.title,
      items: transformApiItemsToNavItems(section.children || []),
    }));
}

/**
 * Small tree for breadcrumbs: section / folder / page labels from the same menulinks-derived
 * `NavSection[]` as the left nav (not CMS contentlet parent/child relations).
 */
export type NavMenulinksBreadcrumbNode = {
  title: string;
  urlTitle?: string;
  url?: string;
  children?: NavMenulinksBreadcrumbNode[];
};

function docsHrefToCanonicalSlug(href: string): string | undefined {
  if (!href || href === "#") return undefined;
  if (!href.startsWith("/docs/")) return undefined;
  const rest = href.slice("/docs/".length).replace(/\/+$/, "");
  return rest ? canonicalNavFilterKey(rest) : undefined;
}

function navItemsToBreadcrumbNodes(items: NavItem[]): NavMenulinksBreadcrumbNode[] {
  return items.map((item) => {
    const slug = docsHrefToCanonicalSlug(item.href);
    const node: NavMenulinksBreadcrumbNode = {
      title: item.title,
      url: item.href,
    };
    if (slug) node.urlTitle = slug;
    if (item.items?.length) {
      node.children = navItemsToBreadcrumbNodes(item.items);
    }
    return node;
  });
}

/** One synthetic root per top-level nav section so `findPath` can walk the menulinks hierarchy. */
export function navSectionsToBreadcrumbForest(sections: NavSection[]): NavMenulinksBreadcrumbNode[] {
  if (!sections?.length) return [];
  return sections.map((section) => ({
    title: section.title,
    url: "#",
    children: navItemsToBreadcrumbNodes(section.items ?? []),
  }));
}


