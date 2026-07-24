"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useContentAnalytics } from "@dotcms/analytics/react";
import { cn } from "@/util/utils";
import { AnalyticsConfig } from "@/util/config";
import { highlightMatch } from "@/util/docsSearch";
import { useDocsSlugIndex } from "@/components/docs/DocsSlugIndexContext";
import { resolveDocsHref } from "@/services/docs/resolveDocsHref";
import type { DocsSlugIndex } from "@/services/docs/resolveDocsHref";

const CONVERSION_EVENT = "search-bar-result-click";

type SiteSearchHit = {
  title: string;
  description?: string;
  uri: string;
  href: string;
  contentType?: string;
  score?: number;
};

type DocsQuickSearchProps = {
  className?: string;
};

function toSiteRelativeUri(uri: string): string {
  const raw = (uri || "").trim();
  if (!raw) return "#";
  try {
    if (/^https?:\/\//i.test(raw)) {
      return new URL(raw).pathname || "/";
    }
  } catch {
    /* fall through */
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function normalizeHit(
  ref: {
    title?: string;
    description?: string;
    uri?: string;
    contentType?: string;
    score?: number;
  },
  slugIndex: DocsSlugIndex | null,
): SiteSearchHit | null {
  const uri = toSiteRelativeUri(ref.uri || "");
  if (!uri || uri === "#") return null;

  let href = uri;
  if (uri.startsWith("/docs/") || uri === "/docs") {
    href = resolveDocsHref(uri, slugIndex) || uri;
  }

  return {
    title: ref.title || uri,
    description: ref.description,
    uri,
    href,
    contentType: ref.contentType,
    score: ref.score,
  };
}

/**
 * Shared header search — site-wide keyword search via /api/site-search
 * (backed by /api/vtl/sitesearch). Not docs-exclusive.
 */
export function DocsQuickSearch({ className }: DocsQuickSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hits, setHits] = useState<SiteSearchHit[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { conversion } = useContentAnalytics(AnalyticsConfig);
  const contextSlugIndex = useDocsSlugIndex();
  const slugIndexRef = useRef<DocsSlugIndex | null>(contextSlugIndex);

  useEffect(() => {
    slugIndexRef.current = contextSlugIndex;
  }, [contextSlugIndex]);

  useEffect(() => {
    if (contextSlugIndex) return;
    let cancelled = false;
    fetch("/api/docs-slug-index")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object" && !("error" in data)) {
          slugIndexRef.current = data as DocsSlugIndex;
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contextSlugIndex]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setHits([]);
      setPanelOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const debounceTimer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/site-search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data: { references?: unknown[] }) => {
          const refs = Array.isArray(data.references) ? data.references : [];
          const mapped = refs
            .map((raw) =>
              normalizeHit(
                raw as {
                  title?: string;
                  description?: string;
                  uri?: string;
                  contentType?: string;
                  score?: number;
                },
                slugIndexRef.current,
              ),
            )
            .filter((h): h is SiteSearchHit => Boolean(h))
            .slice(0, 20);
          setHits(mapped);
          setPanelOpen(true);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setHits([]);
          setPanelOpen(true);
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery]);

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setHits([]);
    setPanelOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSuggestionSelect = useCallback(() => {
    conversion(CONVERSION_EVENT);
    setSearchQuery("");
    setHits([]);
    setPanelOpen(false);
  }, [conversion]);

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
            activeSearch && "border-primary/35 bg-primary/[0.04] ring-2 ring-primary/10",
          )}
          aria-controls={
            panelOpen && activeSearch ? "docs-quick-search-results" : undefined
          }
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
          aria-label="Search results"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-[60] max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-border/60 bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150",
          )}
        >
          {loading && hits.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          ) : hits.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="py-2">
              <div className="sticky top-0 border-b border-border/40 bg-popover px-3 py-2 text-xs text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-popover/90">
                {hits.length} result{hits.length === 1 ? "" : "s"}
              </div>
              {hits.map((hit, index) => (
                <div key={`${hit.href}-${index}`}>
                  <Link
                    href={hit.href}
                    onClick={handleSuggestionSelect}
                    className="block px-3 py-3 text-left transition-colors hover:bg-muted/80 focus:bg-muted/80 focus:outline-none"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {highlightMatch(hit.title, searchQuery)}
                    </div>
                    {hit.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {highlightMatch(hit.description, searchQuery)}
                      </div>
                    )}
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                      {hit.href}
                    </div>
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
