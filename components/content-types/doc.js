"use client"

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils"
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MarkdownContent from '@/components/MarkdownContent';

const NavTree = React.memo(({ items, currentPath }) => {
  const [openSections, setOpenSections] = useState([])

  // Extract the relevant part of the path
  const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');

  const toggleSection = useCallback((title) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }, [])

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
          if (expandCurrentSection(item.dotcmsdocumentationchildren, [...path, item.title])) {
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
          open={openSections.includes(item.title)}
          onOpenChange={() => toggleSection(item.title)}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
            {item.title}
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                openSections.includes(item.title) && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4">
            <NavTree items={item.dotcmsdocumentationchildren} currentPath={currentPath} />
          </CollapsibleContent>
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



const TableOfContents= ({ items }) => {
  return (
    <div className="sticky top-8">
      <h3 className="mb-4 text-sm font-semibold">On This Page</h3>
      <nav className="text-sm">
        <ul className="space-y-2 text-muted-foreground">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`#${item.id}`} className="hover:text-foreground">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const Doc = ({ contentlet, tableOfContents }) => {
  const currentPath = usePathname();

  const tocItems = [
    { id: 'overview', title: 'Overview' },
    { id: 'features', title: 'Features' },
    // Add more items as needed
  ];

  if (!contentlet || !tableOfContents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto flex min-h-screen gap-8 py-8">
      {/* Left Navigation */}
      <div className="w-64 shrink-0 border-r">
        <nav className="sticky top-8 pr-4">
          <h2 className="mb-4 text-lg font-semibold">Documentation</h2>
          <NavTree 
            items={tableOfContents[0]?.dotcmsdocumentationchildren || []} 
            currentPath={currentPath}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <h1 className="text-4xl font-bold mb-6">{contentlet.title}</h1>
        <MarkdownContent content={contentlet.documentation} />
      </div>

      {/* Right Sidebar - Table of Contents */}
      <div className="w-48 shrink-0">
        <TableOfContents items={tocItems} />
      </div>
    </div>
  );
};

export default Doc;

