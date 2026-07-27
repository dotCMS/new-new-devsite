"use client";

import { useMemo } from "react";
import { FilterReleases } from "@/services/docs/getReleases/types";

export type ReleaseRow = {
  minor?: string;
  lts?: string | number;
  eolDate?: string;
  releasedDate?: string;
  dockerImage?: string | null;
  starterEmpty?: string;
  starter?: string;
  [key: string]: unknown;
};

interface UseAllReleasesFilterOptions {
  allItems: ReleaseRow[];
  versionQuery: string;
  filter: FilterReleases;
  currentPage: number;
  itemsPerPage?: number;
}

function matchesFilter(item: ReleaseRow, filter: FilterReleases): boolean {
  const lts = String(item.lts ?? "");
  if (filter === FilterReleases.CURRENT) return lts === "3";
  if (filter === FilterReleases.LTS) return lts !== "3";
  return true;
}

function matchesVersion(item: ReleaseRow, versionQuery: string): boolean {
  const query = versionQuery.trim().toLowerCase();
  if (!query) return true;
  return String(item.minor ?? "").toLowerCase().includes(query);
}

export function useAllReleasesFilter({
  allItems,
  versionQuery,
  filter,
  currentPage,
  itemsPerPage = 40,
}: UseAllReleasesFilterOptions) {
  const filteredItems = useMemo(() => {
    return allItems.filter(
      (item) => matchesFilter(item, filter) && matchesVersion(item, versionQuery)
    );
  }, [allItems, filter, versionQuery]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const pagination = {
    totalPages,
    page: safePage,
    totalRecords: filteredItems.length,
    pageRecords: paginatedItems.length,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };

  return {
    paginatedItems,
    filteredItems,
    pagination,
  };
}
