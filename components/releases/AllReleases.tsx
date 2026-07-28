"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { TableReleases } from "./TableReleases/TableReleases";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FilterReleases } from "@/services/docs/getReleases/types";
import { useAllReleasesFilter } from "@/hooks/useAllReleasesFilter";

type Props = {
  sideNav: any[];
  slug: string;
  initialItems?: any[];
};

function filterFromParam(value: string | null): FilterReleases {
  if (value === "1") return FilterReleases.CURRENT;
  if (value === "2") return FilterReleases.LTS;
  return FilterReleases.ALL;
}

export default function AllReleases({ sideNav, slug, initialItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipFilterPageReset = useRef(true);

  const allItems = useMemo(
    () => (Array.isArray(initialItems) ? initialItems.filter(Boolean) : []),
    [initialItems]
  );

  const [version, setVersion] = useState(searchParams.get("version") || "");
  const [filter, setFilter] = useState<FilterReleases>(
    filterFromParam(searchParams.get("filter"))
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const { paginatedItems, filteredItems, pagination } = useAllReleasesFilter({
    allItems,
    versionQuery: version,
    filter,
    currentPage,
    itemsPerPage: 40,
  });

  // Reset to page 1 when filters change (not on initial mount / shared URL)
  useEffect(() => {
    if (skipFilterPageReset.current) {
      skipFilterPageReset.current = false;
      return;
    }
    setCurrentPage(1);
  }, [version, filter]);

  // Keep URL shareable without driving the filter off navigation
  useEffect(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set("page", currentPage.toString());
    if (version) params.set("version", version);
    if (filter !== FilterReleases.ALL) params.set("filter", filter.toString());

    const queryString = params.toString();
    const targetUrl = queryString ? `?${queryString}` : window.location.pathname;
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== targetUrl) {
      router.replace(targetUrl, { scroll: false });
    }
  }, [currentPage, version, filter, router]);

  // Clamp page if filter shrinks the result set
  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  return (
    <div className="max-w-[1400px] mx-auto flex">
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
          childrenKey="dotcmsdocumentationchildren"
        />

        <div className="markdown-content">
          <h1 className="text-4xl font-bold mb-6">All Releases</h1>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter(FilterReleases.ALL)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === FilterReleases.ALL
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter(FilterReleases.CURRENT)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === FilterReleases.CURRENT
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setFilter(FilterReleases.LTS)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === FilterReleases.LTS
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                LTS
              </button>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search releases..."
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length === 0 ? 0 : (pagination.page - 1) * 40 + 1}
              –
              {Math.min(pagination.page * 40, filteredItems.length)} of{" "}
              {filteredItems.length} release{filteredItems.length !== 1 ? "s" : ""}
              {filteredItems.length !== allItems.length &&
                ` (filtered from ${allItems.length} total)`}
            </p>
          </div>

          <TableReleases
            showCurrent={false}
            version={version}
            filter={filter}
            limit={40}
            items={paginatedItems}
            allItems={allItems}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  );
}
