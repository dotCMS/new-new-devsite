import { navCache } from '@/util/cacheService';
import { graphqlResults } from '@/services/gql';
import { getDocsSlugIndex } from '@/services/docs/getDocsSlugIndex';
import { resolveDocsHref } from '@/services/docs/resolveDocsHref';
import type { SearchableItem } from '@/util/docsSearch';

// String key (not hashed) — avoids collisions that can poison the corpus cache.
const CACHE_KEY = 'docs-quicksearch-corpus|v2';
const PAGE_SIZE = 500;
const TTL_SECONDS = 3600;

type RawDoc = {
  title?: string | null;
  navTitle?: string | null;
  urlTitle?: string | null;
  tag?: string[] | string | null;
  seoDescription?: string | null;
};

function normalizeTags(tag: RawDoc['tag']): string[] | undefined {
  if (!tag) return undefined;
  if (Array.isArray(tag)) return tag.filter(Boolean).map(String);
  if (typeof tag === 'string') {
    return tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return undefined;
}

function toSearchableItem(
  doc: RawDoc,
  slugIndex: Awaited<ReturnType<typeof getDocsSlugIndex>>,
): SearchableItem | null {
  const urlTitle = doc.urlTitle?.trim();
  if (!urlTitle || urlTitle === 'table-of-contents') return null;

  const flatPath = `/docs/${urlTitle}`;
  const path = resolveDocsHref(flatPath, slugIndex) || flatPath;

  return {
    title: doc.title || doc.navTitle || urlTitle,
    navTitle: doc.navTitle || undefined,
    urlTitle,
    tag: normalizeTags(doc.tag),
    seoDescription: doc.seoDescription || undefined,
    path,
  };
}

async function fetchPage(offset: number): Promise<RawDoc[]> {
  const query = `
    query DocsQuickSearchCorpus {
      DotcmsDocumentationCollection(
        query: "+contentType:DotcmsDocumentation +live:true"
        limit: ${PAGE_SIZE}
        offset: ${offset}
      ) {
        title
        navTitle
        urlTitle
        tag
        seoDescription
      }
    }
  `;

  const graphData = await graphqlResults(query);
  if (graphData.errors && graphData.errors.length > 0) {
    throw new Error(graphData.errors[0].message);
  }

  const rows = graphData?.data?.DotcmsDocumentationCollection;
  return Array.isArray(rows) ? rows : [];
}

/**
 * Flat DotcmsDocumentation list for client-side weighted search (sidebar Filter;
 * interim header until sitesearch). No TOC parent→child traversal.
 */
export async function getDocsQuickSearchCorpus(): Promise<SearchableItem[]> {
  const cached = navCache.get<SearchableItem[]>(CACHE_KEY);
  if (cached) return cached;

  const slugIndex = await getDocsSlugIndex();
  const all: SearchableItem[] = [];
  const seen = new Set<string>();
  let offset = 0;

  for (;;) {
    const page = await fetchPage(offset);
    if (page.length === 0) break;

    for (const doc of page) {
      const item = toSearchableItem(doc, slugIndex);
      if (!item || seen.has(item.urlTitle)) continue;
      seen.add(item.urlTitle);
      all.push(item);
    }

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  navCache.set(CACHE_KEY, all, TTL_SECONDS);
  return all;
}
