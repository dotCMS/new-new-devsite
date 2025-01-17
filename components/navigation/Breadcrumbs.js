"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from "@/lib/utils";

const Breadcrumbs = React.memo(({ items, currentPath }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');

  useEffect(() => {
    const findPath = (items, target, currentPath = []) => {
      for (const item of items) {
        const newPath = [...currentPath, item];
        
        if (item.urlTitle === target) {
          setBreadcrumbs(newPath);
          return true;
        }
        
        if (item.dotcmsdocumentationchildren?.length) {
          if (findPath(item.dotcmsdocumentationchildren, target, newPath)) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(items, relevantPath);
  }, [items, relevantPath]);

  if (breadcrumbs.length === 0) {
    return (<nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6 min-h-5">



        
    </nav>);
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link 
        href="/docs/latest/table-of-contents" 
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.urlTitle}>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/docs/latest/${item.urlTitle}`}
            className={cn(
              "hover:text-foreground",
              index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs; 