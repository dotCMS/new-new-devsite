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

const SubNavTree = React.memo(({ items, currentPath, level = 0 }) => {
    const relevantPath = currentPath.replace(/^\/docs\/latest\//, '');
    const [openSections, setOpenSections] = useState([]);

    // Move localStorage initialization to useEffect
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setOpenSections(JSON.parse(stored));
        }
    }, []);

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
        const paddingY = 'py-1.5';

        if (hasChildren) {
            return (
                <Collapsible
                    open={openSections.includes(item.urlTitle)}
                    onOpenChange={() => toggleSection(item.urlTitle)}
                >
                    <div className="flex flex-col">
                        <div 
                            className={cn(
                                `text-slate-400 flex px-2 w-full items-center justify-between rounded-lg ${paddingY} text-sm hover:bg-muted`,
                                isCurrentPage ? "bg-muted text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <div 
                                className={cn(
                                    "flex-grow text-left hover:text-foreground cursor-pointer",
                                    isCurrentPage ? "text-foreground" : "text-muted-foreground"
                                )}
                                onClick={() => {
                                    window.location.href = `/docs/latest/${item.urlTitle}`;
                                }}
                            >
                                {item.title}
                            </div>
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
                        `text-slate-400 block rounded-lg px-2 ${paddingY} text-sm hover:bg-muted hover:text-foreground`,
                        isCurrentPage ? "bg-muted text-foreground" : "text-muted-foreground"
                    )}
                >
                    {item.title}
                </Link>
            );
        }
    }, [relevantPath, openSections, toggleSection, currentPath, level]);

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