"use client"

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from "@/util/utils";
import type { NavSection } from "@/util/navTransform";
import { canonicalNavFilterKey, navSectionsToBreadcrumbForest } from "@/util/navTransform";

export interface BreadcrumbItem {
  title: string;
  urlTitle?: string;
  url?: string;
  id?: string | number;
  [key: string]: any; // For additional properties
}

export interface BreadcrumbsProps {
  /**
   * The hierarchical items to build breadcrumbs from
   */
  items: BreadcrumbItem[];

  /**
   * The current path/slug to find in the items
   */
  slug: string;

  /**
   * Property name that contains children items (default: 'children')
   */
  childrenKey?: string;

  /**
   * Optional items to append at the end of breadcrumbs
   */
  appendItems?: BreadcrumbItem[];

  /**
   * Base URL path (default: '/docs/')
   */
  basePath?: string;

  /**
   * Property to use for item identification (default: 'urlTitle')
   */
  identifierKey?: string;

  /**
   * Function to generate URL for each breadcrumb item
   * @param item The breadcrumb item
   * @param basePath The base path
   * @param identifierKey The identifier key
   * @returns The URL for the breadcrumb item
   */
  urlGenerator?: (item: BreadcrumbItem, basePath: string, identifierKey: string) => string;

  /**
   * URL for the home icon (default: site homepage)
   */
  homeUrl?: string;

  /**
   * When set (same source as the left nav), breadcrumbs walk the menulinks folder/link tree
   * (`children` links only — not GraphQL contentlet nesting).
   */
  navSections?: NavSection[];
}

function computeTrail(
  itemsToSearch: BreadcrumbItem[] | null | undefined,
  relevantPath: string,
  identifierKey: string,
  childrenKey: string,
  useMenulinksTree: boolean
): BreadcrumbItem[] {
  const targetKey =
    useMenulinksTree && identifierKey === "urlTitle"
      ? canonicalNavFilterKey(relevantPath)
      : relevantPath;

  const itemMatchesTarget = (item: BreadcrumbItem): boolean => {
    const idVal = item[identifierKey];
    if (useMenulinksTree && identifierKey === "urlTitle") {
      return (
        idVal != null &&
        String(idVal).length > 0 &&
        canonicalNavFilterKey(String(idVal)) === targetKey
      );
    }
    return idVal === targetKey;
  };

  const findPath = (
    nodes: BreadcrumbItem[] | null | undefined,
    currentPath: BreadcrumbItem[] = []
  ): BreadcrumbItem[] | null => {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return null;
    }

    for (const item of nodes) {
      const newPath = [...currentPath, item];

      if (itemMatchesTarget(item)) {
        return newPath;
      }

      const children = item[childrenKey];
      if (children && Array.isArray(children) && children.length > 0) {
        const deeper = findPath(children, newPath);
        if (deeper) return deeper;
      }
    }
    return null;
  };

  return findPath(itemsToSearch, []) ?? [];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = React.memo(({
  items,
  slug,
  childrenKey = 'children',
  appendItems = [],
  identifierKey = 'urlTitle',
  homeUrl = '/',
  navSections,
}) => {
  const useMenulinksTree =
    Array.isArray(navSections) && navSections.length > 0;

  const treeItems = useMemo((): BreadcrumbItem[] => {
    if (useMenulinksTree) {
      return navSectionsToBreadcrumbForest(navSections!) as BreadcrumbItem[];
    }
    return items;
  }, [useMenulinksTree, navSections, items]);

  const effectiveChildrenKey = useMenulinksTree ? "children" : childrenKey;

  const relevantPath = slug.replace(/^\/docs\/latest\//, '');

  const breadcrumbs = useMemo(
    () =>
      computeTrail(
        treeItems,
        relevantPath,
        identifierKey,
        effectiveChildrenKey,
        useMenulinksTree
      ),
    [
      treeItems,
      relevantPath,
      identifierKey,
      effectiveChildrenKey,
      useMenulinksTree,
    ]
  );

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link
        href={homeUrl}
        className="flex items-center hover:text-foreground shrink-0"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <React.Fragment key={String(item[identifierKey] ?? item.title ?? index)}>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span
            className={cn(
              index === breadcrumbs.length - 1 && appendItems.length === 0
                ? "text-foreground font-medium"
                : ""
            )}
          >
            {item.title}
          </span>
        </React.Fragment>
      ))}

      {appendItems.map((item, index) => (
        <React.Fragment key={item.title || index}>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-foreground font-medium">{item.title}</span>
        </React.Fragment>
      ))}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
