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

const STORAGE_KEY = 'subnav-open-sections';

const SubNavTree = ({ items, currentPath, level = 0 }) => {
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');
  
  // Initialize state with both stored sections and current path sections
  const [openSections, setOpenSections] = useState(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedSections = stored ? JSON.parse(stored) : [];
      
      // Get all parent sections of the current path
      const currentPathSections = [];
      const findParentSections = (items, targetPath, parentPath = []) => {
        for (const item of items) {
          if (item.urlTitle === targetPath) {
            return [...parentPath];
          }
          if (item.dotcmsdocumentationchildren?.length) {
            const found = findParentSections(
              item.dotcmsdocumentationchildren,
              targetPath,
              [...parentPath, item.urlTitle]
            );
            if (found) return found;
          }
        }
        return null;
      };
      
      const parentSections = findParentSections(items, relevantPath) || [];
      
      // Combine stored and current path sections, removing duplicates
      return [...new Set([...storedSections, ...parentSections])];
    } catch (error) {
      console.error('Error loading navigation state:', error);
      return [];
    }
  });

  // Update localStorage whenever openSections changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (openSections.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  }, [openSections]);

  const toggleSection = useCallback((urlTitle) => {
    setOpenSections((prev) => {
      const newSections = prev.includes(urlTitle)
        ? prev.filter((t) => t !== urlTitle)
        : [...prev, urlTitle];
      return newSections;
    });
  }, []);

  const renderNavItem = useCallback((item) => {
    const isCurrentPage = item.urlTitle === relevantPath;
    const hasChildren = item.dotcmsdocumentationchildren && item.dotcmsdocumentationchildren.length > 0;
    const paddingY = 'py-1.5';

    if (hasChildren) {
      return (
        <Collapsible
          key={item.urlTitle}
          open={openSections.includes(item.urlTitle)}
          onOpenChange={() => toggleSection(item.urlTitle)}
        >
          <div className="flex flex-col">
            <div className={cn(
              `text-slate-400 flex px-2 w-full items-center justify-between rounded-lg ${paddingY} text-sm hover:bg-muted`,
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
            <CollapsibleContent className="pl-3 border-l border-muted ml-2">
              <SubNavTree 
                items={item.dotcmsdocumentationchildren} 
                currentPath={currentPath} 
                level={level + 1}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.urlTitle}
        href={`/docs/latest/${item.urlTitle}`}
        className={cn(
          `text-slate-400 block rounded-lg px-2 ${paddingY} text-sm hover:bg-muted hover:text-foreground`,
          isCurrentPage ? "bg-muted text-foreground" : "text-muted-foreground"
        )}
      >
        {item.title}
      </Link>
    );
  }, [relevantPath, openSections, toggleSection, level]);

  return (
    <div className="space-y-1 pt-1">
      {items.map((item) => (
        <div key={item.urlTitle}>
          {renderNavItem(item)}
        </div>
      ))}
    </div>
  );
};

SubNavTree.displayName = 'SubNavTree';

export default SubNavTree; 