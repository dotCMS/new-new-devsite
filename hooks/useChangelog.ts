"use client";
import { useState, useEffect } from 'react';
import { getChangelog } from '@/services/docs/getChangelog/getChangelog';

interface ChangelogData {
  changelogs: any[];
  pagination: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  ltsMajors: any[];
}

export function useChangelog(currentPage: number = 1, vLts: string = "false", singleVersion: string = "") {
  const [data, setData] = useState<ChangelogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(currentPage);

  const handleNextPage = () => setPage(prev => prev + 1);
  const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));

  useEffect(() => {
    async function fetchChangelog() {
      try {
        setLoading(true);
        const result = await getChangelog({ page, vLts, singleVersion });
        if (result) {
          setData(result);
        } else {
          setError(new Error('Failed to fetch changelog data'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, [page, vLts]);

  return { 
    data, 
    loading, 
    error, 
    page,
    handleNextPage,
    handlePrevPage,
    hasNextPage: data?.pagination?.hasNextPage || false,
    hasPrevPage: data?.pagination?.hasPreviousPage || false
  };
} 