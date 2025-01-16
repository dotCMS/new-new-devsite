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
  const [openSections, setOpenSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');

  const toggleSection = useCallback((urlTitle) => {
    setOpenSections((prev) => {
      const newSections = prev.includes(urlTitle)
        ? prev.filter((t) => t !== urlTitle)
        : [...prev, urlTitle];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
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
    const paddingY = level === 0 ? 'py-3' : level === 1 ? 'py-2' : 'py-1';

    if (hasChildren) {
      return (
        <Collapsible
          open={openSections.includes(item.urlTitle)}
          onOpenChange={() => toggleSection(item.urlTitle)}
        >
          <div className="flex flex-col">
            <div className={cn(
                `flex w-full items-center justify-between rounded-lg px-4 ${paddingY} text-sm font-medium hover:bg-muted`,
                isCurrentPage ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
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
            <CollapsibleContent className="pl-4">
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
            `block rounded-lg px-4 ${paddingY} text-sm hover:bg-muted hover:text-foreground`,
            isCurrentPage ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      );
    }
  }, [relevantPath, openSections, toggleSection]);

  return (
    <div className="space-y-2 w-72">
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