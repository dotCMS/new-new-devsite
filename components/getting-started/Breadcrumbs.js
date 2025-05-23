"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from "@/util/utils";

const Breadcrumbs = React.memo(({ items, slug, appendItems = [] }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const relevantPath = slug.replace(/^\/docs\/latest\//, '');
  //console.log("items----", items);
  useEffect(() => {
    const findPath = (items, target, slug = []) => {

      for (const item of items) {
        const newPath = [...slug, item];
        
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
    return (<></>)
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link 
        href="/docs/table-of-contents" 
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.urlTitle}>
          <ChevronRight className="h-4 w-4" />
          <Link
            prefetch={false}
            href={`/docs/${item.urlTitle}`}
            className={cn(
              "hover:text-foreground",
              index === breadcrumbs.length - 1 && appendItems.length == 0 ? "text-foreground font-medium" : ""
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}

      {appendItems.map((item, index) => (
        <React.Fragment key={item.title}>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{item.title}</span>
          
           
        </React.Fragment>
      ))}   
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs; 