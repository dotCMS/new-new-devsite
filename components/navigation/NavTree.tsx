"use client"

import React, { useRef, useEffect } from 'react';
import SubNavTree from './SubNavTree';

type NavTreeProps = {
  items: any[];
  currentPath?: string;
  level?: number;
  isMobile?: boolean;
}

const NavTree = React.memo(({ items, currentPath = "", level = 0, isMobile = false }: NavTreeProps) => {
    const navRef = useRef<HTMLElement | null>(null);
    const isFirstMount = useRef(true);

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        if (isFirstMount.current) {
            // On first mount, clear any saved position and scroll to active item
            sessionStorage.removeItem('nav-scroll');
            
            // Wait for SubNavTree to expand sections
            setTimeout(() => {
                const activeItem = nav.querySelector(`[href="/docs/latest/${currentPath}"]`);
                if (activeItem) {
                    // Calculate scroll position manually instead of using scrollIntoView
                    const itemRect = activeItem.getBoundingClientRect();
                    const navRect = nav.getBoundingClientRect();
                    const relativeTop = itemRect.top - navRect.top;
                    const centerOffset = (navRect.height - itemRect.height) / 2;
                    nav.scrollTop = nav.scrollTop + relativeTop - centerOffset;
                }
                isFirstMount.current = false;
            }, 100);
        } else {
            // For subsequent updates, use saved position
            const handleScroll = () => {
                sessionStorage.setItem('nav-scroll', nav.scrollTop.toString());
            };

            const savedPosition = sessionStorage.getItem('nav-scroll');
            if (savedPosition) {
                nav.scrollTop = parseInt(savedPosition, 10);
            }

            nav.addEventListener('scroll', handleScroll);
            return () => nav.removeEventListener('scroll', handleScroll);
        }
    }, [currentPath]);

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