import { Config } from "@/util/config";
import { navCache, getCacheKey } from "@/util/cacheService";
import { transformApiResponseToNavSections, type ApiNavItem, type NavSection } from "@/util/navTransform";

type FetchOptions = {
  path?: string;
  depth?: number;
  languageId?: number;
  ttlSeconds?: number;
};

export async function getNavSections(options: FetchOptions = {}): Promise<NavSection[]> {
  const path = options.path ?? '/docs/nav';
  const depth = options.depth ?? 4;
  const languageId = options.languageId ?? 1;
  const ttlSeconds = options.ttlSeconds ?? 900;

  const cacheKey = getCacheKey(`${path}|${depth}|${languageId}|v2`);
  const cached = navCache.get<NavSection[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL(`/api/v1/nav${path}?depth=${depth}&languageId=${languageId}`, Config.DotCMSHost);

  const res = await fetch(url, {
    method: 'GET',
    headers: Config.Headers,
    // Ensure server-side request cache doesn't interfere; we manage our own cache
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.warn('Failed to fetch nav sections', res.status, res.statusText);
    return [];
  }

  const json = await res.json();
  const apiChildren: ApiNavItem[] = json?.entity?.children ?? [];
  const sections = transformApiResponseToNavSections(apiChildren);

  if (sections.length > 0) {
    navCache.set(cacheKey, sections, ttlSeconds);
  }

  return sections;
}


