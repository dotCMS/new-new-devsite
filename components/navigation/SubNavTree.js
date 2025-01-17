"use client"

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const STORAGE_KEY = 'subnav-open-sections';

const SubNavTree = React.memo(({ items, currentPath, level = 0 }) => {
    const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');
    if(relevantPath === 'table-of-contents' && localStorage) {
        localStorage.removeItem(STORAGE_KEY);
    }
  const [openSections, setOpenSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });


  const toggleSection = useCallback((urlTitle) => {
    setOpenSections((prev) => {
      const newSections = prev.includes(urlTitle)
        ? prev.filter((t) => t !== urlTitle)
        : [...prev, urlTitle];
      
      if (newSections.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      
      return newSections;
    });
  }, []);

  useEffect(() => {
    const expandCurrentSection = (items, path) => {
      for (const item of items) {
        if (item.urlTitle === relevantPath) {
          path.forEach(section => {
            setOpenSections(prev => {
              const newSections = prev.includes(section) ? prev : [...prev, section];
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
              return newSections;
            });
          });
          return true;
        }
        if (item.dotcmsdocumentationchildren) {
          if (expandCurrentSection(item.dotcmsdocumentationchildren, [...path, item.urlTitle])) {
            return true;
          }
        }
      }
      return false;
    };

    expandCurrentSection(items, []);
  }, [items, relevantPath]);

  const renderNavItem = useCallback((item) => {

    const isCurrentPage = item.urlTitle === relevantPath;
    const hasChildren = item.dotcmsdocumentationchildren && item.dotcmsdocumentationchildren.length > 0;
    const paddingY =  'py-2' ;

    if (hasChildren) {
      return (
        <Collapsible
          open={openSections.includes(item.urlTitle)}
          onOpenChange={() => toggleSection(item.urlTitle)}
        >
          <div className="flex flex-col">
            <div className={cn(
                ` text-slate-400 flex px-1 w-full items-center justify-between rounded-lg ${paddingY} text-sm hover:bg-muted`,
                isCurrentPage ? "bg-muted text-foreground" : "text-muted-foreground"
                )}>
              <Link
                href={`/docs/latest/${item.urlTitle}`}
                className={cn(
                  "flex-grow text-left hover:text-foreground",
                  isCurrentPage ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
              <CollapsibleTrigger className="p-0">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openSections.includes(item.urlTitle) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pl-3">
              <SubNavTree items={item.dotcmsdocumentationchildren} currentPath={currentPath} level={level + 1}/>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      return (
        <Link
          href={`/docs/latest/${item.urlTitle}`}
          className={cn(
            ` text-slate-400 block rounded-lg px-1 ${paddingY} text-sm hover:bg-muted hover:text-foreground`,
            isCurrentPage ? "bg-muted  text-foreground" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      );
    }
  }, [relevantPath, openSections, toggleSection]);

  return (
    <div>
      {items.map((item) => (
        <div key={item.title}>
          {renderNavItem(item)}
        </div>
      ))}
    </div>
  );
});

SubNavTree.displayName = 'SubNavTree';

export default SubNavTree; 