"use client";
import { useState, useEffect } from 'react';
import { getDevResources } from '@/services/learning/getDevResources';

interface DevResourceData {
  devResources: any[];
  pagination: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}






export function useResources(limit: number = 50, page: number = 1, tagFilter: string, slug: string, type: string) {
  const [data, setData] = useState<DevResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentRelease() {
      try {
        setLoading(true);
        const result = await getDevResources(tagFilter, page, limit, type, slug);
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

    fetchCurrentRelease();
  }, [limit, page, tagFilter, slug, type]);

  return { data, loading, error };
} 