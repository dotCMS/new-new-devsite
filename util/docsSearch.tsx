import React from "react";

export interface SearchableItem {
  title: string;
  navTitle?: string;
  urlTitle: string;
  tag?: string[];
  seoDescription?: string;
  path: string;
  parentPath?: string[];
}

export interface SearchResult {
  item: SearchableItem;
  score: number;
  matchedFields: string[];
}

export const MAX_QUICK_SEARCH_RESULTS = 20;

export const SEARCH_WEIGHTS = {
  title: 100,
  navTitle: 90,
  urlTitle: 60,
  tag: 50,
  seoDescription: 20,
};

export function flattenItems(items: any[], parentPath: string[] = []): SearchableItem[] {
  const flattened: SearchableItem[] = [];

  if (!items || !Array.isArray(items)) return flattened;

  items.forEach((item) => {
    if (item.urlTitle) {
      const searchableItem: SearchableItem = {
        title: item.title || item.navTitle || "",
        navTitle: item.navTitle,
        urlTitle: item.urlTitle,
        tag: item.tag,
        seoDescription: item.seoDescription,
        path: `/docs/${item.urlTitle}`,
        parentPath: [...parentPath],
      };

      flattened.push(searchableItem);
    } else if ((item.type === "link" || item.type === "page") && (item.code || item.href)) {
      const urlTitle = item.code || (item.href ? item.href.split("/").pop() : "");
      if (urlTitle) {
        const searchableItem: SearchableItem = {
          title: item.title || "",
          navTitle: item.title,
          urlTitle: urlTitle,
          tag: item.tag || [],
          seoDescription: item.seoDescription || "",
          path: item.code ? `/docs/${item.code}` : item.href || "#",
          parentPath: [...parentPath],
        };

        flattened.push(searchableItem);
      }
    }

    const children = item.dotcmsdocumentationchildren || item.children;
    if (children && children.length > 0) {
      const childPath = item.title ? [...parentPath, item.title] : parentPath;
      flattened.push(...flattenItems(children, childPath));
    }
  });

  return flattened;
}

function calculateScore(
  item: SearchableItem,
  query: string
): { score: number; matchedFields: string[] } {
  const lowerQuery = query.toLowerCase();
  let totalScore = 0;
  const matchedFields: string[] = [];

  const scoreField = (
    fieldValue: string | string[] | undefined,
    fieldName: string,
    weight: number
  ) => {
    if (!fieldValue) return 0;

    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
    let fieldScore = 0;

    values.forEach((value) => {
      const lowerValue = value.toLowerCase();

      if (lowerValue === lowerQuery) {
        fieldScore += weight;
        matchedFields.push(fieldName);
      } else if (lowerValue.startsWith(lowerQuery)) {
        fieldScore += weight * 0.8;
        matchedFields.push(fieldName);
      } else if (lowerValue.includes(lowerQuery)) {
        fieldScore += weight * 0.6;
        matchedFields.push(fieldName);
      } else if (lowerValue.split(/\s+/).some((word) => word.includes(lowerQuery))) {
        fieldScore += weight * 0.3;
        matchedFields.push(fieldName);
      }
    });

    return fieldScore;
  };

  totalScore += scoreField(item.title, "title", SEARCH_WEIGHTS.title);
  totalScore += scoreField(item.navTitle, "navTitle", SEARCH_WEIGHTS.navTitle);
  totalScore += scoreField(item.urlTitle, "urlTitle", SEARCH_WEIGHTS.urlTitle);
  totalScore += scoreField(item.tag, "tag", SEARCH_WEIGHTS.tag);
  totalScore += scoreField(item.seoDescription, "seoDescription", SEARCH_WEIGHTS.seoDescription);

  return { score: totalScore, matchedFields: Array.from(new Set(matchedFields)) };
}

export function performSearch(items: SearchableItem[], query: string): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];

  const results: SearchResult[] = [];

  items.forEach((item) => {
    const { score, matchedFields } = calculateScore(item, query);

    if (score > 0) {
      results.push({
        item,
        score,
        matchedFields,
      });
    }
  });

  const seen = new Set<string>();
  return results
    .sort((a, b) => b.score - a.score)
    .filter((r) => {
      const key = r.item.urlTitle;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_QUICK_SEARCH_RESULTS);
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (!lowerText.includes(lowerQuery)) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerQuery, lastIndex);
  while (index !== -1) {
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <mark
        key={`match-${index}`}
        className="bg-primary/20 text-primary font-medium rounded px-0.5"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
