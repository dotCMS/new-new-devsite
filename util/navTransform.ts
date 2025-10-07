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


