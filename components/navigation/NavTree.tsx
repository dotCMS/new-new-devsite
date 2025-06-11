"use client";

import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import SubNavTree from "./SubNavTree";
import Link from "next/link";
const SCROLL_STORAGE_KEY = "docs-nav-scroll";
export const NAV_STORAGE_KEY = "subnav-open-sections";
type NavTreeProps = {
  items?: any[];
  nav?: {
    entity?: {
      children?: Array<{
        title: string;
        href: string;
        children?: any[];
      }>;
    };
  };
  currentPath?: string;
  level?: number;
  isMobile?: boolean;
  resetNav?: boolean;
};

function useStickyState(defaultValue: any, name: string) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultValue;
    }

    const persistedValue = window.localStorage.getItem(name);

    return persistedValue !== null ? JSON.parse(persistedValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(name, JSON.stringify(value));
  }, [name, value]);

  return [value, setValue];
}

const NavTree = React.memo(
  ({ items, nav, currentPath = "", level = 0, isMobile = false,resetNav = false }: NavTreeProps) => {
    // Debug the nav structure in detail

    if(resetNav) {  
        window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify([]));
        window.localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(0)); 
      }

    const [openSections, setOpenSections] = useStickyState([], NAV_STORAGE_KEY);
    const [savedScroll, setSavedScroll] = useStickyState(0, SCROLL_STORAGE_KEY);
    const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);
    const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current.clear();
      };
    }, []);

    // Restore saved scroll position on mount, then enable auto-centering
    useEffect(() => {
      if (isMobile) {
        setIsInitialSetupComplete(true);
        return;
      }
      
      const navElement = navRef.current;
      if (!navElement) {
        setIsInitialSetupComplete(true);
        return;
      }
      
      // Restore scroll position immediately
      navElement.scrollTop = savedScroll;
      setIsInitialSetupComplete(true);
    }, [savedScroll, isMobile]);

    // Helper function to find active link with flexible matching
    const findActiveLink = useCallback((navElement: HTMLElement) => {
      if (!currentPath) return null;
      
      // Try exact match first
      let activeLink = navElement.querySelector(`a[href="${currentPath}"]`) as HTMLElement;
      if (activeLink) return activeLink;
      
      // Try with leading slash
      activeLink = navElement.querySelector(`a[href="/${currentPath}"]`) as HTMLElement;
      if (activeLink) return activeLink;
      
      // Try ending with currentPath
      activeLink = navElement.querySelector(`a[href$="/${currentPath}"]`) as HTMLElement;
      if (activeLink) return activeLink;
      
      // Try containing currentPath
      const allLinks = navElement.querySelectorAll('a[href]');
      for (const link of allLinks) {
        const href = link.getAttribute('href');
        if (href && (href.includes(currentPath) || href.endsWith(`/${currentPath}`))) {
          return link as HTMLElement;
        }
      }
      
      return null;
    }, [currentPath]);

    // Helper function to add highlight with cleanup
    const addHighlightWithCleanup = useCallback((element: HTMLElement) => {
      element.classList.add('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
      
      const timeoutId = setTimeout(() => {
        // Check if element is still in DOM before modifying
        if (element.isConnected) {
          element.classList.remove('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
        }
        timeoutRefs.current.delete(timeoutId);
      }, 2000);
      
      timeoutRefs.current.add(timeoutId);
    }, []);

    // Helper function to scroll to active link
    const scrollToActiveLink = useCallback((navElement: HTMLElement, activeLink: HTMLElement) => {
      const navHeight = navElement.clientHeight;
      const linkTop = activeLink.offsetTop;
      const linkHeight = activeLink.offsetHeight;
      const scrollTop = linkTop - (navHeight / 2) + (linkHeight / 2);
      
      navElement.scrollTop = Math.max(0, scrollTop);
      addHighlightWithCleanup(activeLink);
      setSavedScroll(Math.max(0, scrollTop));
    }, [addHighlightWithCleanup, setSavedScroll]);

    // Auto-center current page after initial setup is complete
    useLayoutEffect(() => {
      if (isMobile || !currentPath || !isInitialSetupComplete) return;

      const navElement = navRef.current;
      if (!navElement) return;
      
      // Only proceed if navigation items are actually rendered
      const hasItems = (items && items.length > 0) || (nav && nav.entity?.children && nav.entity.children.length > 0);
      if (!hasItems) return;

      const activeLink = findActiveLink(navElement);
      if (activeLink) {
        scrollToActiveLink(navElement, activeLink);
      }
    }, [currentPath, items, nav, isMobile, isInitialSetupComplete, findActiveLink, scrollToActiveLink]);

    // Handle scroll position persistence (only after initial setup is complete)
    useEffect(() => {
      if (isMobile || !isInitialSetupComplete) return;
      
      const navElement = navRef.current;
      if (!navElement) return;

      const handleScroll = () => {
        if (navElement) {
          setSavedScroll(Math.round(navElement.scrollTop));
        }
      };

      navElement.addEventListener("scroll", handleScroll);
      return () => navElement.removeEventListener("scroll", handleScroll);
    }, [setSavedScroll, isMobile, isInitialSetupComplete]);

    const mobileStyles = isMobile
      ? "pt-4"
      : "h-[calc(100vh-4rem)] sticky top-16 pt-8";

    return (
      <nav
        ref={navRef}
        className={`
                overflow-y-auto p-4 px-2
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                ${mobileStyles}
            `}
      >
        <div className={isMobile ? "" : "h-dvh"}>
          <div className={`space-t-2 min-w-64 ${isMobile ? "pb-2" : "pb-12"}`}>
            {items ? items.map((item) => (
              <div key={item.title} className="mb-5">
                <div className="py-1 px-2 font-semibold text-foreground">
                    <Link href={item.urlTitle} prefetch={false} className="flex items-center gap-2 hover:text-primary-purple">
                            {item.title}
                    </Link>
                </div>
                <SubNavTree
                  items={item.dotcmsdocumentationchildren}
                  currentPath={currentPath}
                  level={level + 1}
                  openSections={openSections}
                  setOpenSections={setOpenSections}
                />
              </div>
            )) : (
              <div>
                {/* Debug info visible */}
                <div className="text-sm text-muted-foreground mb-4 p-2 bg-gray-100 rounded">
                  Navigation: {nav?.entity?.children?.length || 0} items
                </div>
                
                {nav?.entity?.children?.map((item: any) => (
                  <div key={item.title || Math.random()} className="mb-5">
                    <div className="py-2 px-3 font-semibold bg-gray-50 rounded-md text-foreground border border-gray-200">
                        <Link href={item.href || "#"} prefetch={false} className="flex items-center gap-2 hover:text-primary-purple">
                                {item.title || "Unnamed Link"}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          href: {item.href || "none"}
                        </div>
                    </div>
                    {item.children && item.children.length > 0 && (
                      <SubNavTree
                        items={item.children}
                        currentPath={currentPath}
                        level={level + 1}
                        openSections={openSections}
                        setOpenSections={setOpenSections}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }
);

NavTree.displayName = "NavTree";

export default NavTree;
