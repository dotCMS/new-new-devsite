"use client";
import { useState, useEffect } from 'react';
import { getCurrentRelease } from '@/services/content/getCurrentRelease/getCurrentRelease';

interface CurrentReleaseData {
  releases: any[];
  pagination: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useCurrentRelease() {
  const [data, setData] = useState<CurrentReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentRelease() {
      try {
        setLoading(true);
        const result = await getCurrentRelease({page: 1});
        if (result) {
          const formattedResult: CurrentReleaseData = {
            releases: [result.currentRelease],
            pagination: {
              totalPages: result.pagination,
              hasNextPage: false,
              hasPreviousPage: false
            }
          };
          setData(formattedResult);
        } else {
          setError(new Error('Failed to fetch changelog data'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentRelease();
  }, []);

  return { data, loading, error };
} 