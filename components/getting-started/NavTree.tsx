"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import SubNavTree from "./SubNavTree";
import Link from "next/link";
const SCROLL_STORAGE_KEY = "docs-nav-scroll";
export const NAV_STORAGE_KEY = "subnav-open-sections";
type NavTreeProps = {
  nav: {
    children: Array<{
      children: any[];
      title: string;
      href: string;
      type: string;
    }>;
    title: string;
    href: string;
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
  ({ nav, currentPath = "", level = 0, isMobile = false, resetNav = false }: NavTreeProps) => {
    if(resetNav) {  
        window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify([]));
        window.localStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(0)); 
    }

    const [openSections, setOpenSections] = useStickyState([], NAV_STORAGE_KEY);
    const [savedScroll, setSavedScroll] = useStickyState(0, SCROLL_STORAGE_KEY);
    const navRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isMobile) return; // Don't manage scroll for mobile view

      const nav = navRef.current;
      if (!nav) return;

      // Restore scroll position on mount
      if (savedScroll) {
        nav.scrollTop = parseInt(savedScroll, 10);
      }

      // Save scroll position on scroll
      const handleScroll = () => {
        if (nav) {
          localStorage.setItem(
            SCROLL_STORAGE_KEY,
            Math.round(nav.scrollTop).toString()
          );
        }
      };

      nav.addEventListener("scroll", () => {
        setSavedScroll(Math.round(nav.scrollTop));
      });
      return () => nav.removeEventListener("scroll", handleScroll);
    }, [savedScroll, setSavedScroll, isMobile]);

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
            {nav?.children?.map((item) => (
              <div key={item.title} className="mb-5">
                <div className="py-1 px-2 font-semibold text-foreground">
                    <Link href={item.href} prefetch={false} className="flex items-center gap-2 hover:text-primary-purple">
                            {item.title}
                    </Link>
                </div>
                <SubNavTree
                  items={item.children}
                  currentPath={currentPath}
                  level={level + 1}
                  openSections={openSections}
                  setOpenSections={setOpenSections}
                />
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }
);

NavTree.displayName = "NavTree";

export default NavTree;
