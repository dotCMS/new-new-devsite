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
    const navRef = useRef<HTMLElement | null>(null);

    // Auto-center current page after DOM is rendered
    useLayoutEffect(() => {
      if (isMobile) return; // Don't manage scroll for mobile view

      const navElement = navRef.current;
      if (!navElement || !currentPath) return;
      
      // Only proceed if navigation items are actually rendered
      const hasItems = (items && items.length > 0) || (nav && nav.entity?.children && nav.entity.children.length > 0);
      
      if (!hasItems) return;

      // Try multiple href patterns to find the active link
      const findActiveLink = () => {
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
      };

      const activeLink = findActiveLink();
      
      if (activeLink) {
        // Calculate position to center the active link
        const navHeight = navElement.clientHeight;
        const linkTop = activeLink.offsetTop;
        const linkHeight = activeLink.offsetHeight;
        const scrollTop = linkTop - (navHeight / 2) + (linkHeight / 2);
        
        // Set scroll position immediately (no smooth scrolling)
        navElement.scrollTop = Math.max(0, scrollTop);
        
        // Brief highlight to make auto-scroll obvious
        activeLink.classList.add('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
        setTimeout(() => {
          activeLink.classList.remove('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
        }, 2000);
        
        // Update saved scroll to the new centered position
        setSavedScroll(Math.max(0, scrollTop));
      }
    }, [currentPath, items, nav, setSavedScroll, isMobile]);

    // Separate effect to retry auto-scroll when data loads
    useEffect(() => {
      if (isMobile) return;
      
      const navElement = navRef.current;
      if (!navElement || !currentPath) return;
      
      // If we have navigation data but no active link yet, retry after a short delay
      const hasItems = (items && items.length > 0) || (nav && nav.entity?.children && nav.entity.children.length > 0);
      if (hasItems) {
        // Use the same flexible matching logic
        const findActiveLink = () => {
          let activeLink = navElement.querySelector(`a[href="${currentPath}"]`) as HTMLElement;
          if (activeLink) return activeLink;
          
          activeLink = navElement.querySelector(`a[href="/${currentPath}"]`) as HTMLElement;
          if (activeLink) return activeLink;
          
          activeLink = navElement.querySelector(`a[href$="/${currentPath}"]`) as HTMLElement;
          if (activeLink) return activeLink;
          
          const allLinks = navElement.querySelectorAll('a[href]');
          for (const link of allLinks) {
            const href = link.getAttribute('href');
            if (href && (href.includes(currentPath) || href.endsWith(`/${currentPath}`))) {
              return link as HTMLElement;
            }
          }
          return null;
        };

        const activeLink = findActiveLink();
        if (!activeLink) {
          const timeoutId = setTimeout(() => {
            const retryLink = findActiveLink();
            if (retryLink) {
              const navHeight = navElement.clientHeight;
              const linkTop = retryLink.offsetTop;
              const linkHeight = retryLink.offsetHeight;
              const scrollTop = linkTop - (navHeight / 2) + (linkHeight / 2);
              
              navElement.scrollTop = Math.max(0, scrollTop);
              
              // Brief highlight for retry scroll too  
              retryLink.classList.add('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
              setTimeout(() => {
                retryLink.classList.remove('bg-blue-100', 'dark:bg-blue-900/30', 'ring-2', 'ring-blue-300', 'dark:ring-blue-700');
              }, 2000);
              
              setSavedScroll(Math.max(0, scrollTop));
            }
          }, 150);
          
          return () => clearTimeout(timeoutId);
        }
      }
    }, [currentPath, items, nav, setSavedScroll, isMobile]);

    // Handle scroll position persistence
    useEffect(() => {
      if (isMobile) return;
      
      const navElement = navRef.current;
      if (!navElement) return;

      const handleScroll = () => {
        if (navElement) {
          setSavedScroll(Math.round(navElement.scrollTop));
        }
      };

      navElement.addEventListener("scroll", handleScroll);
      return () => navElement.removeEventListener("scroll", handleScroll);
    }, [setSavedScroll, isMobile]);

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
