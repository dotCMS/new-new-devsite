"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';
import { cn } from '@/util/utils';
import { fetchNavData } from '@/util/page.utils';
import { type NavSection as ServerNavSection } from '@/util/navTransform';

// Types
interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  target?: string;
  items?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface RedesignedNavTreeProps {
  currentPath?: string;
  isMobile?: boolean;
  className?: string;
  initialSections?: ServerNavSection[]; // Server-fetched, transformed nav sections
}

interface NavApiResponse {
  entity: NavEntity;
}

interface NavEntity {
  children: ApiNavItem[];
}

interface ApiNavItem {
  type: 'folder' | 'link';
  title: string;
  href?: string;
  code?: string | null;
  folder?: string;
  order: number;
  target?: string;
  children: ApiNavItem[];
}

// Quippy taglines for the navigation header
const NAVIGATION_TAGLINES = [
  "Connecting the dots",
  "dotCoMprehenSive", 
  "Context for content",
  "Dot your i's, cross your t's",
  "Until you're content!",
  "Call it 'docCMS'",
  "dot doc dot doc dot doc",
  "dotCMS under the microscope",
  "Organized chaos breeds wisdom",
  "Enter the dot-matrix",
  "We're dotty about content",
  "That upon which we dote",
  "Content management enlightenment",
  "Can't spell 'Eureka!' without a dot"
];

// Get a random tagline on each page load
function getRandomTagline(): string {
  const randomIndex = Math.floor(Math.random() * NAVIGATION_TAGLINES.length);
  return NAVIGATION_TAGLINES[randomIndex];
}

// Transform API response to navigation sections
function transformApiResponseToNavSections(apiData: ApiNavItem[]): NavSection[] {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  // Simple transformation without visual metadata
  return apiData
    .filter(item => item.type === 'folder')
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      title: section.title,
      items: transformApiItemsToNavItems(section.children || [])
    }));
}

// Helper function to process link data according to user's rules
function processLinkHref(linkData: ApiNavItem): string {
  // If code is non-null, use /docs/{code}
  if (linkData.code && linkData.code.trim() !== '') {
    return `/docs/${linkData.code}`;
  }
  
  // If code is null but href starts with https://, use that
  if (linkData.href) {
    if (linkData.href.startsWith('https://')) {
      return linkData.href;
    }
    
    // Otherwise, strip domain to make it relative
    try {
      const url = new URL(linkData.href);
      return url.pathname + url.search + url.hash;
    } catch (e) {
      // If it's not a valid URL, treat it as already relative
      return linkData.href;
    }
  }
  
  return '#'; // Fallback
}

// Transform API items (mixed folders and links) to navigation items
function transformApiItemsToNavItems(items: ApiNavItem[]): NavItem[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .sort((a, b) => a.order - b.order)
    .map(item => {
      if (item.type === 'folder') {
        // Handle folder items
        const navItem: NavItem = {
          title: item.title,
          href: '#'
        };

        // Recursively process children
        if (item.children && item.children.length > 0) {
          navItem.items = transformApiItemsToNavItems(item.children);
        }

        return navItem;
      } else if (item.type === 'link') {
        // Handle link items
        const navItem: NavItem = {
          title: item.title,
          href: processLinkHref(item)
        };

        // Add target="_blank" if specified in the API
        if (item.target === '_blank') {
          navItem.target = '_blank';
        }

        return navItem;
      }

      // Fallback for unknown types
      return {
        title: item.title,
        href: '#'
      };
    })
    .filter(Boolean); // Remove any undefined items
}

// Helper function to find sections that should be auto-expanded
function getSectionsToExpand(sections: NavSection[], currentPath: string): string[] {
  const sectionsToOpen: string[] = [];
  
  function checkSection(section: NavSection, sectionId: string): boolean {
    let shouldExpand = false;
    
    // Check if any item in this section matches current path or contains active children
    function checkItems(items: NavItem[]): boolean {
      return items.some(item => {
        // Check if this item is the current page
        if (isCurrentPageMatch(item.href, currentPath)) {
          return true;
        }
        
        // Check if this item has children that contain the current page
        if (item.items && item.items.length > 0) {
          if (checkItems(item.items)) {
            // If children contain current page, expand this level too
            sectionsToOpen.push(`${item.title}-0`); // Add subsection to expand
            return true;
          }
        }
        
        return false;
      });
    }
    
    if (checkItems(section.items)) {
      shouldExpand = true;
      sectionsToOpen.push(sectionId);
    }
    
    return shouldExpand;
  }
  
  // Check each section
  sections.forEach(section => {
    checkSection(section, section.title);
  });
  
  return sectionsToOpen;
}

// Helper function to check if href matches current path
function isCurrentPageMatch(href: string, currentPath: string): boolean {
  if (!href || href === '#') return false;
  
  // Normalize paths for comparison
  const cleanPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
  const cleanHref = href.replace('/docs/', '').replace(/^\//, '');
  
  // Exact match only - no substring matching to prevent multiple highlights
  return cleanPath === cleanHref;
}

const RedesignedNavTree: React.FC<RedesignedNavTreeProps> = ({ 
  currentPath = '', 
  isMobile = false,
  className = '',
  initialSections
}) => {
  // Indentation constants to align hierarchy consistently
  const TOP_LEVEL_LEFT_PADDING = 12; // px
  const NESTED_BASE_INDENT = 24; // px, ensures level 1 starts to the right of top-level
  const NESTED_INDENT_STEP = 12; // px per level
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [tagline, setTagline] = useState("dot dot dot");
  const [navigationSections, setNavigationSections] = useState<NavSection[]>(() => (initialSections as unknown as NavSection[]) || []);
  const [isLoading, setIsLoading] = useState(!initialSections);
  const [error, setError] = useState<string | null>(null);

  // Set random tagline on client-side to avoid hydration mismatch
  useEffect(() => {
    setTagline(getRandomTagline());
  }, []);

  // Fetch navigation data from API only if no server-provided sections were given
  useEffect(() => {
    if (initialSections && initialSections.length > 0) {
      return;
    }
    const fetchNavigationData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchNavData({
          path: '/docs/nav',
          depth: 4,
          languageId: 1
        });
        if (response.nav && response.nav.children) {
          const transformedSections = transformApiResponseToNavSections(response.nav.children);
          if (transformedSections.length > 0) {
            setNavigationSections(transformedSections);
          } else {
            console.warn('No sections after transformation');
            setError('Navigation data is empty');
          }
        } else {
          console.warn('No children in API response');
          setError('Invalid navigation structure');
        }
      } catch (err) {
        console.error('Error fetching navigation data:', err);
        setError('Failed to load navigation');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNavigationData();
  }, [initialSections]);

  // Auto-expand sections containing the current page
  useEffect(() => {
    if (navigationSections.length > 0 && currentPath) {
      const sectionsToExpand = getSectionsToExpand(navigationSections, currentPath);
      setOpenSections(sectionsToExpand);
    }
  }, [navigationSections, currentPath]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev: string[]) => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const isCurrentPage = useCallback((href: string) => {
    return isCurrentPageMatch(href, currentPath);
  }, [currentPath]);

  const isParentActive = useCallback((items: NavItem[]): boolean => {
    return items.some(item => {
      if (isCurrentPage(item.href)) return true;
      if (item.items) return isParentActive(item.items);
      return false;
    });
  }, [isCurrentPage]);

  const renderNavItem = useCallback((item: NavItem, level: number = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isActive = isCurrentPage(item.href);
    const childrenActive = hasChildren ? isParentActive(item.items!) : false;
    const paddingLeft = `${NESTED_BASE_INDENT + level * NESTED_INDENT_STEP}px`;

    if (hasChildren) {
      const sectionId = `${item.title}-${level}`;
      const isOpen = openSections.includes(sectionId);

      const handleToggleItem = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSection(sectionId);
      };

      return (
        <div key={sectionId}>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors",
              "hover:bg-muted hover:text-foreground",
              "font-semibold text-sm",
              childrenActive ? "text-primary" : "text-foreground/80",
            )}
            style={{ paddingLeft }}
            onClick={handleToggleItem}
            type="button"
          >
            <span className="flex-1 min-w-0 text-left whitespace-normal break-words leading-snug">
              {item.title}
            </span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isOpen && (
            <div className="space-y-1 transition-all duration-150 ease-in-out">
              {item.items!.map(subItem => renderNavItem(subItem, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href}
        target={item.target}
        className={cn(
          "block px-3 py-2 text-sm rounded-lg transition-colors",
          isActive 
            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        style={{ paddingLeft }}
      >
        <span className="block text-left whitespace-normal break-words leading-snug">{item.title}</span>
      </Link>
    );
  }, [openSections, toggleSection, isCurrentPage, isParentActive]);

  const renderSection = useCallback((section: NavSection) => {
    const sectionId = section.title;
    const isOpen = openSections.includes(sectionId);
    const hasActiveChild = isParentActive(section.items);

    const handleToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSection(sectionId);
    };

    return (
      <div key={section.title} className="mb-4">
        <button
          className={cn(
            "flex items-center justify-between w-full pr-4 py-3 rounded-lg transition-colors",
            "bg-muted/20 hover:bg-muted/40",
            "border border-border/30 hover:border-border/50",
            "font-semibold text-sm",
            hasActiveChild ? "text-primary" : "text-foreground"
          )}
          style={{ paddingLeft: `${TOP_LEVEL_LEFT_PADDING}px` }}
          onClick={handleToggle}
          type="button"
        >
          <span className="flex-1 min-w-0 text-left whitespace-normal break-words leading-snug">{section.title}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {isOpen && (
          <div className="mt-2 space-y-1 transition-all duration-200 ease-in-out">
            {section.items.map(item => renderNavItem(item, 0))}
          </div>
        )}
      </div>
    );
  }, [openSections, toggleSection, isParentActive, renderNavItem]);

  const mobileStyles = isMobile
    ? "pt-4"
    : "max-h-[calc(100vh-4rem)] sticky top-16 pt-8";

  return (
    <nav
      className={cn(
        "overflow-y-auto overflow-x-hidden p-4",
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-transparent", 
        "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
        mobileStyles,
        className
      )}
    >
      <div className={`min-w-64 ${isMobile ? "pb-2" : "pb-6"}`}>
        {/* Header */}
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">dotCMS Documentation</h2>
              <p className="text-xs text-muted-foreground">{tagline}</p>
            </div>
          </div>
        </div>

        {/* Navigation sections */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading navigation...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HelpCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">{error}</span>
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs text-primary hover:underline mt-1"
              >
                Retry
              </button>
            </div>
          ) : (
            // Normal Navigation Sections
            navigationSections.map(renderSection)
          )}
        </div>
      </div>
    </nav>
  );
};

export default RedesignedNavTree;