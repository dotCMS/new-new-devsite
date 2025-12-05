"use client";
import { useMemo } from "react";
import type { TDeprecation } from "@/services/docs/getDeprecations/types";

export type StatusFilter = "all" | "deprecated" | "retired";

interface UseDeprecationsOptions {
  allItems: TDeprecation[];
  searchQuery: string;
  statusFilter: StatusFilter;
  currentPage: number;
  itemsPerPage?: number;
}

// Extract plain text from block editor JSON
function extractTextFromBlock(block: any): string {
  if (!block) return '';
  const json = block?.json || block;
  const content = json?.content;
  if (!Array.isArray(content)) return '';
  
  const texts: string[] = [];
  
  function walk(nodes: any[]) {
    nodes.forEach(node => {
      if (node.type === 'text' && node.text) {
        texts.push(node.text);
      }
      if (node.content && Array.isArray(node.content)) {
        walk(node.content);
      }
    });
  }
  
  walk(content);
  return texts.join(' ').toLowerCase();
}

export function useDeprecations({
  allItems,
  searchQuery,
  statusFilter,
  currentPage,
  itemsPerPage = 10,
}: UseDeprecationsOptions) {
  
  // Apply filters
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Search filter - searches title, versions, and docLinks
      const matchesSearch = !searchQuery.trim() || (() => {
        const query = searchQuery.toLowerCase();
        
        // Search in title and versions
        if (item.title?.toLowerCase().includes(query)) return true;
        if (item.versionDeprecated?.toLowerCase().includes(query)) return true;
        if (item.versionRetired?.toLowerCase().includes(query)) return true;
        
        // Search in docLinks (title and tag)
        if (item.docLinks && Array.isArray(item.docLinks)) {
          const hasMatchInLinks = item.docLinks.some(link => {
            if (link.title?.toLowerCase().includes(query)) return true;
            if (link.tag && typeof link.tag === 'string' && link.tag.toLowerCase().includes(query)) return true;
            return false;
          });
          if (hasMatchInLinks) return true;
        }
        
        // Search in recommendation text
        const recommendationText = extractTextFromBlock(item.recommendation);
        if (recommendationText && recommendationText.includes(query)) return true;
        
        return false;
      })();

      // Status filter
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "retired" && item.versionRetired) ||
        (statusFilter === "deprecated" && !item.versionRetired);

      return matchesSearch && matchesStatus;
    });
  }, [allItems, searchQuery, statusFilter]);

  // Paginate filtered results
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const pagination = {
    totalPages,
    page: currentPage,
    totalRecords: filteredItems.length,
    pageRecords: paginatedItems.length,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  return {
    paginatedItems,
    filteredItems,
    pagination,
  };
}

