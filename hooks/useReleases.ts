"use client";
import { useState, useEffect } from 'react';
import { getReleases } from '@/services/docs/getReleases/getReleases';
import { FilterReleases } from '@/services/docs/getReleases/types';

interface ReleaseData {
  releases: any[];
  pagination: {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const filterCurrentReleases = (releases: any[]) => {
    const latestCurrent = releases.filter((release) => release.lts === "3")[0];
    const latestLtses = releases.filter((release) => {
      const eolDate = release.parent?.eolDate || release.eolDate;
      return release.lts === "1" && new Date(eolDate) > new Date();
    });
    const versions: typeof latestLtses = [];

    const ltsesMap = new Map();
    for (let i = 0; i < latestLtses?.length; i++) {
      const version = latestLtses[i]?.minor.split("v")[0];
      const keyVersion = version.split(".")[0] + "." + version.split(".")[1];
      if (ltsesMap.has(keyVersion)) {
        continue;
      }
      latestLtses[i].keyVersion = keyVersion;
  
      ltsesMap.set(keyVersion, latestLtses[i]);
      versions.push(latestLtses[i]);
      versions.sort((a, b) => b.keyVersion.localeCompare(a.keyVersion));
    }
    versions.unshift(latestCurrent);
    return versions.filter(Boolean);
}   

export function useCurrentReleases(allItems?: any[]) {
    const { data } = useReleases(50, 1, FilterReleases.ALL, false, "", {
      enabled: !Array.isArray(allItems),
    });
    const releases = Array.isArray(allItems) ? allItems : data?.releases;
    if (!releases) {
        return [];
    }
    return filterCurrentReleases(releases);
}

export function useReleases(
  limit: number = 50,
  page: number = 1,
  filter: FilterReleases = FilterReleases.ALL,
  log: boolean = false,
  version: string = "",
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled !== false;
  const [data, setData] = useState<ReleaseData | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    async function fetchCurrentRelease() {
      try {
        setLoading(true);
        const result = await getReleases(limit, page, filter, false, version);
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
  }, [limit, page, filter, log, version, enabled]);

  return { data, loading, error };
}