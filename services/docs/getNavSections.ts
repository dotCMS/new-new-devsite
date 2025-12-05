import { Config } from "@/util/config";
import { navCache, getCacheKey } from "@/util/cacheService";
import { transformApiResponseToNavSections, type ApiNavItem, type NavSection } from "@/util/navTransform";
import fallbackNavData from "@/components/navigation/fallback.json";

type FetchOptions = {
  path?: string;
  depth?: number;
  languageId?: number;
  ttlSeconds?: number;
};

// Helper function to load fallback navigation data
function loadFallbackNavSections(): NavSection[] {
  try {
    const apiChildren = (fallbackNavData?.entity?.children ?? []) as unknown as ApiNavItem[];
    const sections = transformApiResponseToNavSections(apiChildren);
    
    if (sections.length > 0) {
      console.warn('⚠️ Using fallback navigation data - API request failed');
      return sections;
    }
    
    console.error('Fallback navigation data is invalid or empty');
    return [];
  } catch (err) {
    console.error('Failed to load fallback navigation data:', err);
    return [];
  }
}

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

  try {
    const url = new URL(`/api/v1/nav${path}?depth=${depth}&languageId=${languageId}`, Config.DotCMSHost);

    const res = await fetch(url, {
      method: 'GET',
      headers: Config.Headers,
      // Ensure server-side request cache doesn't interfere; we manage our own cache
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`Nav API returned ${res.status} ${res.statusText} - falling back to static navigation`);
      return loadFallbackNavSections();
    }

    const json = await res.json();
    const apiChildren: ApiNavItem[] = json?.entity?.children ?? [];
    const sections = transformApiResponseToNavSections(apiChildren);

    if (sections.length > 0) {
      navCache.set(cacheKey, sections, ttlSeconds);
      return sections;
    }
    
    // If API returned empty data, use fallback
    console.warn('Nav API returned empty data - falling back to static navigation');
    return loadFallbackNavSections();
    
  } catch (err) {
    console.error('Nav API request failed:', err);
    return loadFallbackNavSections();
  }
}


