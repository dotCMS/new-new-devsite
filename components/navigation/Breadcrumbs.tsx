"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from "@/util/utils";

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
   * URL for the home icon (default: '/docs/table-of-contents')
   */
  homeUrl?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = React.memo(({
  items,
  slug,
  childrenKey = 'children',
  appendItems = [],
  basePath = '/docs/',
  identifierKey = 'urlTitle',
  urlGenerator,
  homeUrl = '/docs/table-of-contents'
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Remove any prefix from the slug if needed
  const relevantPath = slug.replace(/^\/docs\/latest\//, '');

  // Default URL generator function
  const defaultUrlGenerator = (item: BreadcrumbItem, basePath: string, idKey: string): string => {
    return `${basePath}${item[idKey]}`;
  };

  // Use provided urlGenerator or default
  const generateUrl = urlGenerator || defaultUrlGenerator;

  useEffect(() => {
    const findPath = (
      itemsToSearch: BreadcrumbItem[] | null | undefined,
      target: string,
      currentPath: BreadcrumbItem[] = []
    ): boolean => {
      // If itemsToSearch is not an array or is empty, return false
      if (!Array.isArray(itemsToSearch) || itemsToSearch.length === 0) {
        return false;
      }
      
      for (const item of itemsToSearch) {
        const newPath = [...currentPath, item];
        
        // Check if this is the target item
        if (item[identifierKey] === target) {
          setBreadcrumbs(newPath);
          return true;
        }
        
        // Check children if they exist
        const children = item[childrenKey];
        if (children && Array.isArray(children) && children.length > 0) {
          if (findPath(children, target, newPath)) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(items, relevantPath);
  }, [items, relevantPath, childrenKey, identifierKey]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link 
        href={homeUrl} 
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item[identifierKey] || index}>
          <ChevronRight className="h-4 w-4" />
          <Link
            prefetch={false}
            href={item.url || generateUrl(item, basePath, identifierKey)}
            className={cn(
              "hover:text-foreground",
              index === breadcrumbs.length - 1 && appendItems.length === 0 
                ? "text-foreground font-medium" : ""
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}

      {appendItems.map((item, index) => (
        <React.Fragment key={item.title || index}>
          <ChevronRight className="h-4 w-4" />
          {item.url ? (
            <Link
              href={item.url}
              className="text-foreground font-medium"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.title}</span>
          )}
        </React.Fragment>
      ))}   
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
