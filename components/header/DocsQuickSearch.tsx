"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/util/utils";
import {
  flattenItems,
  performSearch,
  highlightMatch,
  type SearchResult,
} from "@/util/docsSearch";

type DocsQuickSearchProps = {
  /** When set and non-empty, used directly (no extra request). */
  items?: any[];
  className?: string;
};

export function DocsQuickSearch({ items: itemsProp, className }: DocsQuickSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [remoteItems, setRemoteItems] = useState<any[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasInlineTree = Array.isArray(itemsProp) && itemsProp.length > 0;

  useEffect(() => {
    if (hasInlineTree) return;
    let cancelled = false;
    fetch("/api/docs-search-tree")
      .then((r) => r.json())
      .then((data: { items?: any[] }) => {
        if (!cancelled) setRemoteItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setRemoteItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hasInlineTree]);

  const treeForSearch = useMemo(() => {
    if (hasInlineTree) return itemsProp as any[];
    return remoteItems ?? [];
  }, [hasInlineTree, itemsProp, remoteItems]);

  const searchableItems = useMemo(() => flattenItems(treeForSearch), [treeForSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const results = performSearch(searchableItems, searchQuery);
        setSearchResults(results);
        setPanelOpen(true);
      } else {
        setSearchResults([]);
        setPanelOpen(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchableItems]);

  const activeSearch = searchQuery.trim().length >= 2;

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setPanelOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setPanelOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSuggestionSelect = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setPanelOpen(false);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative min-w-0 flex-1 max-w-lg", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          inputMode="search"
          autoComplete="off"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => activeSearch && setPanelOpen(true)}
          className={cn(
            "h-9 w-full rounded-xl border border-border/70 bg-muted/45 py-2 pl-9 pr-[4.25rem] text-sm",
            "text-foreground placeholder:text-muted-foreground",
            "outline-none transition-[box-shadow,border-color,background-color]",
            "focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/15",
            activeSearch && "border-primary/35 bg-primary/[0.04] ring-2 ring-primary/10"
          )}
          aria-controls={panelOpen && activeSearch ? "docs-quick-search-results" : undefined}
          aria-autocomplete="list"
        />
        <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searchQuery ? (
            <button
              type="button"
              onClick={handleSearchClear}
              className="pointer-events-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-6 min-w-[1.5rem] select-none items-center justify-center rounded-md border border-border/80 bg-background px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
              /
            </kbd>
          )}
        </div>
      </div>

      {panelOpen && activeSearch && (
        <div
          id="docs-quick-search-results"
          role="region"
          aria-label="Documentation search results"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-[60] max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-border/60 bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          )}
        >
          {searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="py-2">
              <div className="sticky top-0 border-b border-border/40 bg-popover px-3 py-2 text-xs text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-popover/90">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
              </div>
              {searchResults.map((result, index) => (
                <div key={`${result.item.urlTitle}-${index}`}>
                  <Link
                    href={result.item.path}
                    onClick={handleSuggestionSelect}
                    className="block px-3 py-3 text-left transition-colors hover:bg-muted/80 focus:bg-muted/80 focus:outline-none"
                  >
                    <div className="font-medium text-sm text-foreground">
                      {highlightMatch(result.item.title, searchQuery)}
                    </div>
                    {result.item.parentPath && result.item.parentPath.length > 0 && (
                      <div className="mt-0.5 text-xs font-medium text-primary">
                        {result.item.parentPath.join(" › ")}
                      </div>
                    )}
                    {result.item.seoDescription && (
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {highlightMatch(result.item.seoDescription, searchQuery)}
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
