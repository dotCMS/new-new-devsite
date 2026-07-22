import type { TDeprecation } from '@/services/docs/getDeprecations/types';
import { stripDocsPathRoot } from '@/config/docs-path-roots';

/**
 * Match a deprecation's docLinks to the current docs path.
 * Links store legacy flat `urlTitle` values (e.g. `velocity-mathtool`), so we
 * accept either the full path after the docs root or the final segment.
 */
export function findDeprecationForPath(
  deprecations: TDeprecation[] | null | undefined,
  routePath: string | string[] | undefined,
): TDeprecation | null {
  if (!Array.isArray(deprecations) || deprecations.length === 0) {
    return null;
  }

  const normalized = stripDocsPathRoot(routePath);
  if (!normalized) {
    return null;
  }

  const leaf = normalized.split('/').filter(Boolean).pop() || normalized;
  const candidates = new Set(
    [normalized, leaf, normalized.toLowerCase(), leaf.toLowerCase()].filter(
      Boolean,
    ),
  );

  return (
    deprecations.find(
      (dep) =>
        Array.isArray(dep.docLinks) &&
        dep.docLinks.some((link) => {
          const urlTitle = link?.urlTitle?.trim();
          if (!urlTitle) {
            return false;
          }
          return (
            candidates.has(urlTitle) || candidates.has(urlTitle.toLowerCase())
          );
        }),
    ) || null
  );
}
