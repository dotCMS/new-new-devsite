"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, BookOpen, HelpCircle, Search, X } from 'lucide-react';
import { cn } from '@/util/utils';
import { fetchNavData } from '@/util/page.utils';

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
  items?: any[]; // Rich old nav data for search
}

// Search-related interfaces
interface SearchableItem {
  title: string;
  navTitle?: string;
  urlTitle: string;
  tag?: string[];
  seoDescription?: string;
  path: string;
  parentPath?: string[];
}

interface SearchResult {
  item: SearchableItem;
  score: number;
  matchedFields: string[];
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

// No localStorage persistence - use simple auto-expand behavior

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

// Search functionality
const SEARCH_WEIGHTS = {
  title: 100,
  navTitle: 90,
  urlTitle: 60,
  tag: 50,
  seoDescription: 20
};

// Flatten nested items structure for search (handles both docs and nav API data)
function flattenItems(items: any[], parentPath: string[] = []): SearchableItem[] {
  const flattened: SearchableItem[] = [];
  
  if (!items || !Array.isArray(items)) return flattened;
  
  items.forEach(item => {
    // Handle documentation API structure (getSideNav data)
    if (item.urlTitle) {
      const searchableItem: SearchableItem = {
        title: item.title || item.navTitle || '',
        navTitle: item.navTitle,
        urlTitle: item.urlTitle,
        tag: item.tag,
        seoDescription: item.seoDescription,
        path: `/docs/${item.urlTitle}`,
        parentPath: [...parentPath]
      };
      
      flattened.push(searchableItem);
    }
    
    // Handle navigation API structure (fetchNavData data) - links and pages
    else if ((item.type === 'link' || item.type === 'page') && (item.code || item.href)) {
      const urlTitle = item.code || (item.href ? item.href.split('/').pop() : '');
      if (urlTitle) {
        const searchableItem: SearchableItem = {
          title: item.title || '',
          navTitle: item.title,
          urlTitle: urlTitle,
          tag: item.tag || [],
          seoDescription: item.seoDescription || '',
          path: item.code ? `/docs/${item.code}` : item.href || '#',
          parentPath: [...parentPath]
        };
        
        flattened.push(searchableItem);
      }
    }
    
    // Recursively process children (both API structures)
    const children = item.dotcmsdocumentationchildren || item.children;
    if (children && children.length > 0) {
      const childPath = item.title ? [...parentPath, item.title] : parentPath;
      flattened.push(...flattenItems(children, childPath));
    }
  });
  
  return flattened;
}

// Calculate search score for an item
function calculateScore(item: SearchableItem, query: string): { score: number; matchedFields: string[] } {
  const lowerQuery = query.toLowerCase();
  let totalScore = 0;
  const matchedFields: string[] = [];
  
  // Helper function to calculate field score
  const scoreField = (fieldValue: string | string[] | undefined, fieldName: string, weight: number) => {
    if (!fieldValue) return 0;
    
    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
    let fieldScore = 0;
    
    values.forEach(value => {
      const lowerValue = value.toLowerCase();
      
      // Exact match gets full weight
      if (lowerValue === lowerQuery) {
        fieldScore += weight;
        matchedFields.push(fieldName);
      }
      // Starts with query gets 80% weight
      else if (lowerValue.startsWith(lowerQuery)) {
        fieldScore += weight * 0.8;
        matchedFields.push(fieldName);
      }
      // Contains query gets 60% weight
      else if (lowerValue.includes(lowerQuery)) {
        fieldScore += weight * 0.6;
        matchedFields.push(fieldName);
      }
      // Fuzzy match gets 30% weight (simple word boundary check)
      else if (lowerValue.split(/\s+/).some(word => word.includes(lowerQuery))) {
        fieldScore += weight * 0.3;
        matchedFields.push(fieldName);
      }
    });
    
    return fieldScore;
  };
  
  // Score each field
  totalScore += scoreField(item.title, 'title', SEARCH_WEIGHTS.title);
  totalScore += scoreField(item.navTitle, 'navTitle', SEARCH_WEIGHTS.navTitle);
  totalScore += scoreField(item.urlTitle, 'urlTitle', SEARCH_WEIGHTS.urlTitle);
  totalScore += scoreField(item.tag, 'tag', SEARCH_WEIGHTS.tag);
  totalScore += scoreField(item.seoDescription, 'seoDescription', SEARCH_WEIGHTS.seoDescription);
  
  return { score: totalScore, matchedFields: Array.from(new Set(matchedFields)) };
}

// Perform search
function performSearch(items: SearchableItem[], query: string): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];
  
  const results: SearchResult[] = [];
  
  items.forEach(item => {
    const { score, matchedFields } = calculateScore(item, query);
    
    if (score > 0) {
      results.push({
        item,
        score,
        matchedFields
      });
    }
  });
  
  // Sort by score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 12); // Show top 12 results (more space in overlay mode)
}

// Highlight matching text in search results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (!lowerText.includes(lowerQuery)) return text;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Find all matches
  let index = lowerText.indexOf(lowerQuery, lastIndex);
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    
    // Add highlighted match
    parts.push(
      <mark 
        key={`match-${index}`} 
        className="bg-primary/20 text-primary font-medium rounded px-0.5"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return <>{parts}</>;
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
  items = []
}) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [tagline, setTagline] = useState("dot dot dot");
  const [navigationSections, setNavigationSections] = useState<NavSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Set random tagline on client-side to avoid hydration mismatch
  useEffect(() => {
    setTagline(getRandomTagline());
  }, []);

  // Flatten items for search (memoized for performance)
  const searchableItems = useMemo(() => {
    return flattenItems(items);
  }, [items]);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const results = performSearch(searchableItems, searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchableItems]);

  // Show overlay when user is actively searching (2+ characters)
  const shouldShowOverlay = searchQuery.trim().length >= 2;

  // Fetch navigation data from API
  useEffect(() => {
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
  }, []);

  // Auto-expand sections containing the current page
  useEffect(() => {
    if (navigationSections.length > 0 && currentPath) {
      const sectionsToExpand = getSectionsToExpand(navigationSections, currentPath);
      setOpenSections(sectionsToExpand);
    }
  }, [navigationSections, currentPath]);

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSuggestionSelect = useCallback((result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);
    // Navigation will be handled by Next.js Link component
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Don't auto-hide overlay on blur to allow scrolling through results
  }, []);

  const handleSearchFocus = useCallback(() => {
    // Focus handler - overlay shows automatically when there are results
  }, []);

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
    const paddingLeft = `${(level + 1) * 12}px`;

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
            <span className="flex items-center gap-2">
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
        {item.title}
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
            "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors",
            "bg-muted/20 hover:bg-muted/40",
            "border border-border/30 hover:border-border/50",
            "font-semibold text-sm",
            hasActiveChild ? "text-primary bg-primary/5 border-primary/20" : "text-foreground"
          )}
          onClick={handleToggle}
          type="button"
        >
          <span>{section.title}</span>
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

  // Render search results for overlay mode
  const renderSearchOverlay = useCallback(() => {
    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <div className="text-lg font-semibold text-foreground mb-2">
            No results found
          </div>
          <div className="text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Try different keywords or check spelling
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground px-3 py-2 sticky top-0 bg-background border-b border-border/50">
          Found {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for &quot;{searchQuery}&quot;
        </div>
        
        {searchResults.map((result, index) => (
          <Link
            key={`${result.item.urlTitle}-${index}`}
            href={result.item.path}
            onClick={() => handleSuggestionSelect(result)}
            className={cn(
              "block mx-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border/30 hover:border-border",
              "focus:outline-none focus:bg-muted focus:border-primary"
            )}
          >
            <div className="flex flex-col space-y-2">
              <div className="font-semibold text-sm text-foreground">
                {highlightMatch(result.item.title, searchQuery)}
              </div>
              
              {result.item.parentPath && result.item.parentPath.length > 0 && (
                <div className="text-xs text-primary font-medium">
                  {result.item.parentPath.join(' › ')}
                </div>
              )}
              
              {result.item.seoDescription && (
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {highlightMatch(result.item.seoDescription, searchQuery)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }, [searchResults, searchQuery, handleSuggestionSelect]);

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

        {/* Search Section */}
        {searchableItems.length > 0 && (
          <div className="mb-6 px-3 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onFocus={handleSearchFocus}
                className={cn(
                  "w-full pl-10 pr-10 py-2 text-sm rounded-lg border",
                  "bg-background border-border",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "placeholder:text-muted-foreground",
                  shouldShowOverlay && "ring-2 ring-primary/20 border-primary bg-primary/5"
                )}
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area: Either Search Results (Overlay Mode) or Navigation Sections */}
        <div>
          {shouldShowOverlay ? (
            // Search Overlay Mode - Replace entire navigation with search results
            renderSearchOverlay()
          ) : isLoading ? (
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