"use client";

import { Code2, Menu, Search, X, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/util/utils";
import { useState, useEffect } from "react"
import DiscordLink from "./DiscordLink";
import GithubLink from "./GithubLink";
import Logo from "./Logo/Logo";
import { SearchModal } from "../chat/SearchModal";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import NavTree from "@/components/navigation/NavTree";

type HeaderProps = {
  sideNavItems?: any[];
  currentPath?: string;
}

export default function Header({ sideNavItems, currentPath }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showBackArrow, setShowBackArrow] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLogoMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowBackArrow(true);
  };

  const handleLogoMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowBackArrow(false);
    }, 2000);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command/Control + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // Prevent default browser behavior
        setIsSearchOpen((prev) => !prev);
      }
      // Close on escape
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add effect to handle body scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const NavItems = ({ isMobile }: { isMobile?: boolean }) => {
    if (isMobile) {
      return (
        <nav className="flex flex-col space-y-4">
          <div className="space-y-1">
            <Link 
              prefetch={false}
              href="/docs/table-of-contents?n=0" 
              className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
            >
              Docs
            </Link>
            <Link 
              prefetch={false}
              href="/blog" 
              className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
            >
              Blog
            </Link>
            <Link 
              prefetch={false}
              href="/learning" 
              className={cn(navigationMenuTriggerStyle(), "w-full justify-start h-9 px-4")}
            >
              Learning
            </Link>
          </div>
        </nav>
      );
    }

    return (
      <NavigationMenu>
        <NavigationMenuList className="flex items-center space-x-6">
          <NavigationMenuItem>
            <Link prefetch={false} href="/docs/table-of-contents?n=0" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Docs
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link prefetch={false} href="/blog" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Blog
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link prefetch={false} href="/learning" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Learning
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b bg-background">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <div 
            className="flex items-center relative group"
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
          >
            <div 
              className={`absolute right-full mr-2 transition-opacity duration-2000 z-[60] ${
                showBackArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <a 
                href="https://www.dotcms.com"
                className="hover:text-primary p-2 block"
                aria-label="Back to dotCMS.com"
                title="Back to dotCMS.com"
              >
                <ArrowLeft className="h-6 w-6" />
              </a>
            </div>
            <div className="max-w-[100px]">
              <Logo />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 ml-4">
            <NavigationMenu className="flex">
              <NavigationMenuList className="space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3">
                    Getting Started
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col  rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            
                            <div className="mb-2 mt-4 text-lg font-medium">
                              dotDev <Code2 className="h-6 w-6 inline-block" />
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Your one-stop site for learning dotCMS, including Docs, resources and tools.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/docs/table-of-contents" title="Introduction">
                        Learn about dotCMS&apos;s core concepts and architecture.
                      </ListItem>
                      <ListItem href="/docs/quick-start-guide" title="Headless Quick Start">
                        Get up and running in less than 5 minutes.
                      </ListItem>
                      <ListItem href="/docs/features" title="Features">
                        Explore our comprehensive feature set.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/docs/table-of-contents?n=0" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-3")}>
                      Docs
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/blog" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-3")}>
                      Blog
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/learning" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-3")}>
                    Learning
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/80"
            >
              <Search className="h-4 w-4" />
              <span>
                <span className="sm:hidden">Search...</span>
                <span className="hidden sm:inline">Search Docs...</span>
              </span>
              <kbd className="hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>
                <span className="text-xs">K</span>
              </kbd>
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              <GithubLink />
              <DiscordLink />
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container h-full mx-auto px-4 py-4 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Main Navigation Links */}
              <div className="py-4">
                <NavItems isMobile />
              </div>


              {/* Side Navigation Tree (if available) */}
              {sideNavItems && (
                <div className="flex-1 border-t pt-4 mt-4">
                    <div className="text-sm font-medium leading-none text-muted-foreground mb-4 px-2">Docs</div>
                  <NavTree
                    items={sideNavItems}
                    currentPath={currentPath}
                    isMobile={true}
                  />
                </div>
              )}

              
              {/* External Links and Theme Toggle */}
              <div className="border-t py-4 mt-4">
                
                <div className="flex items-center gap-2 px-2">
                  <GithubLink />
                  <DiscordLink />
                  <ThemeToggle />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
