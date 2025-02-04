"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react';

import SubNavTree from '@/components/navigation/SubNavTree';
const SCROLL_STORAGE_KEY = 'docs-nav-scroll';
const NavTree = React.memo(({ items, currentPath, level = 0, isMobile = false }) => {
    const navRef = useRef(null);

    // Save scroll position before unload
    useEffect(() => {
        if (isMobile) return; // Don't manage scroll for mobile view
        
        const nav = navRef.current;
        if (!nav) return;

        // Restore scroll position on mount
        const savedScroll = localStorage.getItem(SCROLL_STORAGE_KEY);
        if (savedScroll) {
            nav.scrollTop = parseInt(savedScroll, 10);
        }

        // Save scroll position on scroll
        const handleScroll = () => {
            localStorage.setItem(SCROLL_STORAGE_KEY, Math.round(nav.scrollTop).toString());
        };

        nav.addEventListener('scroll', handleScroll);
        return () => nav.removeEventListener('scroll', handleScroll);
    }, [isMobile]);

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
                    {items.map((item) => (
                        <div key={item.title} className="mb-5">
                            <div className="py-1 px-2 font-semibold">{item.title}</div>
                            <SubNavTree 
                                items={item.dotcmsdocumentationchildren} 
                                currentPath={currentPath} 
                                level={level+1}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
});

NavTree.displayName = 'NavTree';

export default NavTree; 