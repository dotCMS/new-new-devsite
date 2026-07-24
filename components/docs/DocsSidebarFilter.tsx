"use client";

import * as React from "react";
import Link from "next/link";
import { CornerDownLeft, X } from "lucide-react";
import { cn } from "@/util/utils";
import {
  performSearch,
  highlightMatch,
  type SearchableItem,
  type SearchResult,
} from "@/util/docsSearch";

type DocsSidebarFilterProps = {
  className?: string;
  /** Hrefs (or leaves) belonging to the currently visible left-nav section. */
  inSectionHrefs?: Set<string>;
  /** When true, hide the nav tree below and show only filter results. */
  onActiveChange?: (active: boolean) => void;
};

function pathLeaf(path: string): string {
  return path.split("/").filter(Boolean).pop() || path;
}

function isInSection(item: SearchableItem, inSectionHrefs: Set<string>): boolean {
  if (inSectionHrefs.size === 0) return false;
  if (inSectionHrefs.has(item.path)) return true;
  if (inSectionHrefs.has(item.urlTitle)) return true;
  const leaf = pathLeaf(item.path);
  return inSectionHrefs.has(leaf);
}

export function DocsSidebarFilter({
  className,
  inSectionHrefs,
  onActiveChange,
}: DocsSidebarFilterProps) {
  const [query, setQuery] = React.useState("");
  const [corpus, setCorpus] = React.useState<SearchableItem[]>([]);
  const [inSectionResults, setInSectionResults] = React.useState<SearchResult[]>(
    [],
  );
  const [otherResults, setOtherResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const active = query.trim().length >= 2;

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/docs-quicksearch-corpus")
      .then((r) => r.json())
      .then((data: { items?: SearchableItem[] }) => {
        if (!cancelled) setCorpus(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setCorpus([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!active) {
        setInSectionResults([]);
        setOtherResults([]);
        return;
      }
      const all = performSearch(corpus, query);
      const sectionSet = inSectionHrefs ?? new Set<string>();
      const inSec: SearchResult[] = [];
      const other: SearchResult[] = [];
      for (const r of all) {
        if (isInSection(r.item, sectionSet)) inSec.push(r);
        else other.push(r);
      }
      setInSectionResults(inSec);
      setOtherResults(other);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, corpus, inSectionHrefs, active]);

  const clear = () => {
    setQuery("");
    setInSectionResults([]);
    setOtherResults([]);
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "border-b border-border/60 px-4 pb-3 pt-4 sm:px-5",
        className,
      )}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder="Filter"
          aria-label="Filter navigation"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "h-9 w-full rounded-xl border border-border bg-background py-2 pl-3 pr-9 text-sm shadow-sm",
            "text-foreground placeholder:text-muted-foreground",
            "outline-none transition-[box-shadow,border-color,background-color]",
            "focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/15",
            // Prefer our clear control over the native search cancel button.
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear filter"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <CornerDownLeft
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        )}
      </div>

      {active && (
        <div className="mt-3 max-h-[min(28rem,50vh)] space-y-4 overflow-y-auto">
          {inSectionResults.length === 0 && otherResults.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">
              No matches for &quot;{query.trim()}&quot;
            </p>
          ) : (
            <>
              {inSectionResults.length > 0 && (
                <ResultGroup
                  label="In this section"
                  results={inSectionResults}
                  query={query}
                  onSelect={clear}
                />
              )}
              {otherResults.length > 0 && (
                <ResultGroup
                  label="From Other Sections"
                  results={otherResults}
                  query={query}
                  onSelect={clear}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  results,
  query,
  onSelect,
}: {
  label: string;
  results: SearchResult[];
  query: string;
  onSelect: () => void;
}) {
  return (
    <div>
      <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">
        {results.map((r) => (
          <li key={r.item.urlTitle}>
            <Link
              href={r.item.path}
              onClick={onSelect}
              className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <span className="font-medium text-foreground">
                {highlightMatch(r.item.title, query)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
