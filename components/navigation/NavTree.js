
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const NavTree = React.memo(({ items, currentPath }) => {
  const [openSections, setOpenSections] = useState([]);
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');

  const toggleSection = useCallback((urlTitle) => {
    setOpenSections((prev) =>
      prev.includes(urlTitle)
        ? prev.filter((t) => t !== urlTitle)
        : [...prev, urlTitle]
    );
  }, []);

  useEffect(() => {
    const expandCurrentSection = (items, path) => {
      for (const item of items) {
        if (item.urlTitle === relevantPath) {
          path.forEach(section => {
            setOpenSections(prev => prev.includes(section) ? prev : [...prev, section]);
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

    if (hasChildren) {
      return (
        <Collapsible
          open={openSections.includes(item.urlTitle)}
          onOpenChange={() => toggleSection(item.urlTitle)}
        >
          <div className="flex flex-col">
            <div className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
              <Link
                href={`/docs/latest/${item.urlTitle}`}
                className={cn(
                  "flex-grow text-left hover:text-foreground",
                  isCurrentPage ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
              <CollapsibleTrigger className="p-1">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openSections.includes(item.urlTitle) && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pl-4">
              <NavTree items={item.dotcmsdocumentationchildren} currentPath={currentPath} />
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    } else {
      return (
        <Link
          href={`/docs/latest/${item.urlTitle}`}
          className={cn(
            "block rounded-lg px-4 py-2 text-sm hover:bg-muted hover:text-foreground",
            isCurrentPage ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      );
    }
  }, [relevantPath, openSections, toggleSection]);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.title}>
          {renderNavItem(item)}
        </div>
      ))}
    </div>
  );
});

NavTree.displayName = 'NavTree';

export default NavTree; 