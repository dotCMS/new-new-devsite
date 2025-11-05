"use client";
import { useMemo, useState, useEffect } from "react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs.js";
import type { TDeprecation } from "@/services/docs/getDeprecations/types";
import OnThisPage from "../navigation/OnThisPage";
import { DeprecationCard } from "./DeprecationCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDeprecations, type StatusFilter } from "@/hooks/useDeprecations";
import { useSearchParams, useRouter } from "next/navigation";

type Props = {
  sideNav: any[];
  slug: string;
  initialItems?: TDeprecation[];
};

function hasBlockContent(block: any): boolean {
  if (!block) return false;
  if (typeof block === "string") return block.trim().length > 0;
  
  const json = block?.json || block;
  const content = json?.content;
  
  if (!Array.isArray(content) || content.length === 0) return false;
  
  // Check if any content node has actual text content
  return content.some((node: any) => {
    // If node has content array, check if any child has text
    if (node.content && Array.isArray(node.content)) {
      return node.content.some((child: any) => 
        child.type === 'text' && child.text && child.text.trim().length > 0
      );
    }
    // If node itself has text
    if (node.type === 'text' && node.text && node.text.trim().length > 0) {
      return true;
    }
    return false;
  });
}

function isValidDeprecation(item: TDeprecation): boolean {
  return Boolean(
    item?.title &&
      item?.dateDeprecated &&
      item?.versionDeprecated &&
      hasBlockContent(item?.recommendation)
  );
}

export default function Deprecations({ sideNav, slug, initialItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "all"
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Get all valid items
  const validItems = useMemo(() => {
    const list = Array.isArray(initialItems) ? initialItems : [];
    return list.filter(isValidDeprecation);
  }, [initialItems]);

  // Use hook for filtering and pagination
  const { paginatedItems, filteredItems, pagination } = useDeprecations({
    allItems: validItems,
    searchQuery,
    statusFilter,
    currentPage,
    itemsPerPage: 10,
  });

  const totalPages = pagination.totalPages;

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  // Sync all state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);
    
    const queryString = params.toString();
    const targetUrl = queryString ? `?${queryString}` : window.location.pathname;
    const currentUrl = window.location.pathname + window.location.search;
    
    // Only push if URL needs to change
    if (currentUrl !== targetUrl) {
      router.push(targetUrl, { scroll: false });
    }
  }, [currentPage, searchQuery, statusFilter, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-8">
      <main
        className="flex-1 min-w-0 pt-8 px-12
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
      >
        <Breadcrumbs
          items={sideNav[0]?.dotcmsdocumentationchildren || []}
          slug={slug}
        />

        <div className="markdown-content">
          <h1 className="text-4xl font-bold mb-2">Deprecations</h1>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            The following features are deprecated or retired. Review details and recommendations to plan migrations.
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search deprecations..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter("deprecated")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "deprecated"
                    ? "bg-amber-600 text-white dark:bg-amber-700"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Deprecated
              </button>
              <button
                onClick={() => handleStatusFilter("retired")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "retired"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Retired
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {(() => {
                const startIdx = (currentPage - 1) * 10 + 1;
                const endIdx = Math.min(currentPage * 10, filteredItems.length);
                return `Showing ${startIdx}-${endIdx} of ${filteredItems.length} deprecation${filteredItems.length !== 1 ? 's' : ''}`;
              })()}
              {filteredItems.length !== validItems.length && ` (filtered from ${validItems.length} total)`}
            </p>
            {totalPages > 1 && (
              <p className="text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {paginatedItems.map((dep, idx) => (
              <DeprecationCard key={dep.identifier || `dep-${idx}`} deprecation={dep} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    aria-disabled={!pagination.hasPreviousPage}
                    className={!pagination.hasPreviousPage ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    aria-disabled={!pagination.hasNextPage}
                    className={!pagination.hasNextPage ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
        </div>
      </main>
      <div id="right-toc" className="hidden lg:block w-[18rem] shrink-0 pr-6">
        <div className="sticky top-16 pl-8">
          <div className="text-muted-foreground
                overflow-y-auto p-4 px-2
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
                h-[calc(100vh-6rem)]">
            {pagination.hasPreviousPage && (
              <a
                onClick={() => handlePageChange(currentPage - 1)}
                className="block pl-3 pb-4 text-sm cursor-pointer hover:text-foreground"
              >
                <ChevronLeft className="inline h-4 w-4" /> Prev
              </a>
            )}

            <OnThisPage key={`${currentPage}-${statusFilter}-${searchQuery}`} showOnThisPage={false} />

            {pagination.hasNextPage && (
              <a
                onClick={() => handlePageChange(currentPage + 1)}
                className="block pl-3 pt-2 text-sm cursor-pointer hover:text-foreground"
              >
                Next <ChevronRight className="inline h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


