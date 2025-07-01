"use client"

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/util/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type SubNavTreeProps = {
  items: any[];
  currentPath: string;
  level?: number;
  openSections: string[];
  setOpenSections: (value: any) => void;
}

const SubNavTree = React.memo(({ items=[], currentPath, level = 0, openSections, setOpenSections }: SubNavTreeProps) => {
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');

  const toggleSection = useCallback((urlTitle: string) => {
    setOpenSections((prev: string[]) => {
      const newSections = prev.includes(urlTitle)
        ? prev.filter((t) => t !== urlTitle)
        : [...prev, urlTitle];
      return newSections;
    });
  }, [setOpenSections]);

  useEffect(() => {
    const expandCurrentSection = (items: any[], path: string[]) => {
      for (const item of items) {
        if (item.urlTitle === relevantPath) {
          path.forEach(section => {
            setOpenSections((prev: string[]) => {
              const newSections = prev.includes(section) ? prev : [...prev, section];
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
  }, [items, relevantPath, setOpenSections]);

  const renderNavItem = useCallback((item: { urlTitle: string; title: string; navTitle?: string; dotcmsdocumentationchildren?: any[] }) => {
    const isCurrentPage = item.urlTitle === relevantPath;
    const hasChildren = item.dotcmsdocumentationchildren && item.dotcmsdocumentationchildren.length > 0;
    const paddingY = 'py-1.5';
    const displayTitle = item.navTitle || item.title;

    if (hasChildren) {
      return (
        <Collapsible
          open={openSections.includes(item.urlTitle)}
          onOpenChange={() => toggleSection(item.urlTitle)}
        >
          <div className="flex flex-col">
            <div className={cn(
                `flex px-2 w-full items-center justify-between rounded-lg ${paddingY} text-sm`,
                isCurrentPage 
                  ? "bg-primary-purple/10 text-primary-purple font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
              <Link
                href={`${item.urlTitle}`}
                prefetch={false}
                className={cn(
                  "flex-grow text-left",
                  isCurrentPage 
                    ? "text-primary-purple font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onMouseDown={(e) => {
                  toggleSection(item.urlTitle);
                }}
              >
                {displayTitle}
              </Link>
              <CollapsibleTrigger className="p-0">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isCurrentPage 
                      ? "text-primary-purple"
                      : "text-muted-foreground",
                    openSections.includes(item.urlTitle) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pl-3 border-l border-border ml-2">
              <SubNavTree 
                items={item.dotcmsdocumentationchildren || []} 
                currentPath={currentPath} 
                level={level + 1}
                openSections={openSections}
                setOpenSections={setOpenSections}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      return (
        <Link
          href={`${item.urlTitle}`}
          prefetch={false}
          className={cn(
            `block rounded-lg px-2 ${paddingY} text-sm`,
            isCurrentPage 
              ? "bg-primary-purple/10 text-primary-purple font-semibold" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {displayTitle}
        </Link>
      );
    }
  }, [relevantPath, openSections, setOpenSections, toggleSection, currentPath, level]);

  return (
    <div className="space-y-1 pt-1">
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