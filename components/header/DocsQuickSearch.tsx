"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CornerDownLeft, Loader2, Search } from "lucide-react";
import { useContentAnalytics } from "@dotcms/analytics/react";
import { cn } from "@/util/utils";
import { AnalyticsConfig } from "@/util/config";
import { highlightMatch } from "@/util/docsSearch";
import { useDocsSlugIndex } from "@/components/docs/DocsSlugIndexContext";
import { resolveDocsHref } from "@/services/docs/resolveDocsHref";
import type { DocsSlugIndex } from "@/services/docs/resolveDocsHref";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const CONVERSION_EVENT = "search-bar-result-click";
const MIN_QUERY_LENGTH = 2;

type SiteSearchHit = {
  title: string;
  description?: string;
  uri: string;
  href: string;
  contentType?: string;
  score?: number;
};

type SearchStatus = "idle" | "loading" | "done" | "error";

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
 * (backed by /api/vtl/sitesearch). Runs only on submit, never while typing:
 * the merged page-index + Learn query is too costly for keystroke debouncing.
 */
export function DocsQuickSearch({ className }: DocsQuickSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [hits, setHits] = useState<SiteSearchHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
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

  // Reset on open rather than on close, so the empty state does not flash
  // behind the dialog's exit animation.
  const openSearch = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
    setHits([]);
    setStatus("idle");
    setOpen(true);
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
      openSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openSearch]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const runSearch = useCallback((raw: string) => {
    const q = raw.trim();
    if (q.length < MIN_QUERY_LENGTH) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setSubmittedQuery(q);

    fetch(`/api/site-search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { references?: unknown[] }) => {
        const refs = Array.isArray(data.references) ? data.references : [];
        const mapped = refs
          .map((entry) =>
            normalizeHit(
              entry as {
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
        setStatus("done");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setHits([]);
        setStatus("error");
      });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      runSearch(query);
    },
    [query, runSearch],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        openSearch();
        return;
      }
      abortRef.current?.abort();
      setOpen(false);
    },
    [openSearch],
  );

  const handleResultSelect = useCallback(() => {
    conversion(CONVERSION_EVENT);
    handleOpenChange(false);
  }, [conversion, handleOpenChange]);

  const trimmed = query.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH;
  const isStale =
    status !== "loading" && submittedQuery.length > 0 && trimmed !== submittedQuery;

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className={cn(
          "group flex h-9 min-w-0 flex-1 max-w-lg items-center gap-2 rounded-xl border border-border/70 bg-muted/45 px-3 text-sm",
          "text-muted-foreground transition-[box-shadow,border-color,background-color]",
          "hover:bg-muted/70 hover:text-foreground",
          "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">Search</span>
        <kbd className="hidden h-6 min-w-[1.5rem] select-none items-center justify-center rounded-md border border-border/80 bg-background px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm sm:inline-flex">
          /
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-xl"
        >
          <DialogTitle className="sr-only">Search dotCMS</DialogTitle>

          <form
            role="search"
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-b border-border/60 px-4 py-3 pr-12"
          >
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              autoComplete="off"
              placeholder="Search the docs, blog, and learning resources"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none",
                "placeholder:text-muted-foreground",
              )}
            />
            {status === "loading" ? (
              <Loader2
                className="h-4 w-4 shrink-0 animate-spin text-primary"
                aria-hidden
              />
            ) : (
              <kbd
                className={cn(
                  "hidden select-none items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[11px] font-medium shadow-sm sm:inline-flex",
                  trimmed.length >= MIN_QUERY_LENGTH
                    ? "border-primary/40 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <CornerDownLeft className="h-3 w-3" aria-hidden />
                Enter
              </kbd>
            )}
          </form>

          <div
            className="max-h-[min(28rem,60vh)] overflow-y-auto"
            aria-busy={status === "loading"}
          >
            {status === "loading" ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Searching for &quot;{submittedQuery}&quot;…
              </p>
            ) : status === "error" ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Something went wrong running that search. Press Enter to try
                again.
              </p>
            ) : status === "done" && hits.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No results for &quot;{submittedQuery}&quot;.
              </p>
            ) : status === "done" ? (
              <div className="py-2">
                <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-border/40 bg-popover/95 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                  <span className="truncate">
                    {hits.length} result{hits.length === 1 ? "" : "s"} for
                    &quot;{submittedQuery}&quot;
                  </span>
                  {isStale && (
                    <span className="shrink-0 text-primary">
                      Press Enter to update
                    </span>
                  )}
                </div>
                {hits.map((hit, index) => (
                  <Link
                    key={`${hit.href}-${index}`}
                    href={hit.href}
                    onClick={handleResultSelect}
                    className="block px-4 py-3 text-left transition-colors hover:bg-muted/80 focus:bg-muted/80 focus:outline-none"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                        {highlightMatch(hit.title, submittedQuery)}
                      </span>
                      {hit.contentType && hit.contentType !== "noShow" && (
                        <span className="shrink-0 rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {hit.contentType}
                        </span>
                      )}
                    </div>
                    {hit.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {highlightMatch(hit.description, submittedQuery)}
                      </div>
                    )}
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                      {hit.href}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                {tooShort
                  ? `Enter at least ${MIN_QUERY_LENGTH} characters, then press Enter.`
                  : "Type your search, then press Enter."}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
