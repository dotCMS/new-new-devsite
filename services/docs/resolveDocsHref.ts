import {
  DOCS_PATH_ROOTS,
  PRIMARY_DOCS_PATH_ROOT,
} from '@/config/docs-path-roots';

/** leaf slug → canonical nested path (e.g. owasp-encoder-plugin → /docs/build/.../owasp-encoder-plugin) */
export type DocsSlugIndex = Record<string, string>;

const DOCS_ROOT_SET = new Set<string>(DOCS_PATH_ROOTS);

function pathLeaf(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1]! : null;
}

/**
 * Normalize an href to a pathname suitable for indexing (docs paths only).
 */
export function normalizeDocsPathname(href: string | null | undefined): string | null {
  if (!href) return null;
  let raw = href.trim();
  if (!raw || raw === '#') return null;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      raw = `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }

  const pathOnly = raw.split(/[?#]/, 1)[0] || '';
  if (!pathOnly.startsWith('/')) {
    return null;
  }

  const first = pathOnly.split('/').filter(Boolean)[0];
  if (!first || !DOCS_ROOT_SET.has(first as (typeof DOCS_PATH_ROOTS)[number])) {
    return null;
  }

  return pathOnly.replace(/\/+$/, '') || pathOnly;
}

/**
 * Prefer longer (more nested) paths when the same leaf appears twice.
 * Rewrites shadow-root paths to the primary `/docs` root for a single canonical.
 */
export function addHrefToSlugIndex(index: DocsSlugIndex, href: string): void {
  const pathname = normalizeDocsPathname(href);
  if (!pathname) return;

  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return;

  // Canonicalize to primary docs root
  const leaf = parts[parts.length - 1]!;
  const rest = parts.slice(1);
  const canonical = `/${PRIMARY_DOCS_PATH_ROOT}/${rest.join('/')}`;

  // Flat /docs/{slug} is not a useful canonical target
  if (rest.length < 2) return;

  const existing = index[leaf];
  if (!existing || canonical.length > existing.length) {
    index[leaf] = canonical;
  }
}

export function isShallowDocsPathname(pathname: string | null | undefined): boolean {
  const parts = (pathname || '').split('/').filter(Boolean);
  return (
    parts.length === 2 &&
    DOCS_ROOT_SET.has(parts[0] as (typeof DOCS_PATH_ROOTS)[number])
  );
}

/**
 * Resolve bare slugs and flat `/docs/{slug}` hrefs to nested canonical paths.
 * Leaves hashes, external URLs, nested docs paths, and unknown slugs unchanged.
 */
export function resolveDocsHref(
  href: string | null | undefined,
  index: DocsSlugIndex | null | undefined,
): string {
  if (href == null) return '';
  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Absolute non-docs URLs stay put; absolute docs URLs are re-resolved as paths.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const first = url.pathname.split('/').filter(Boolean)[0];
      if (
        first &&
        DOCS_ROOT_SET.has(first as (typeof DOCS_PATH_ROOTS)[number])
      ) {
        const resolvedPath = resolveDocsHref(
          `${url.pathname}${url.search}${url.hash}`,
          index,
        );
        return resolvedPath;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const hashIndex = trimmed.indexOf('#');
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  let pathPart = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  pathPart = pathPart.replace(/^\.\//, '');

  if (!pathPart) {
    return trimmed;
  }

  // Root-relative docs paths
  if (pathPart.startsWith('/')) {
    const parts = pathPart.split('/').filter(Boolean);
    const root = parts[0];
    if (
      root &&
      DOCS_ROOT_SET.has(root as (typeof DOCS_PATH_ROOTS)[number])
    ) {
      if (parts.length >= 3) {
        return trimmed; // already nested
      }
      if (parts.length === 2 && index) {
        const canonical = index[parts[1]!];
        if (canonical) {
          return `${canonical}${query}${hash}`;
        }
      }
    }
    return trimmed;
  }

  // Paths with slashes (../x, folder/page) — don't guess
  if (pathPart.includes('/')) {
    return trimmed;
  }

  // Bare slug
  if (index) {
    const canonical = index[pathPart] || index[pathPart.toLowerCase()];
    if (canonical) {
      return `${canonical}${query}${hash}`;
    }
  }

  return trimmed;
}

/**
 * Flat `/docs/{slug}` (or shadow-root equivalent) → nested canonical for redirect.
 */
export function lookupShallowDocsRedirect(
  pathname: string | null | undefined,
  index: DocsSlugIndex | null | undefined,
): string | null {
  if (!pathname || !index || !isShallowDocsPathname(pathname)) {
    return null;
  }

  const clean = pathname.replace(/\/+$/, '') || pathname;
  const leaf = pathLeaf(clean);
  if (!leaf) return null;

  const canonical = index[leaf] || index[leaf.toLowerCase()];
  if (!canonical || canonical === clean) {
    return null;
  }

  return canonical;
}

/**
 * When a docs URL 404s, redirect to the canonical path for its leaf if known.
 */
export function lookupDocsMissRedirect(
  pathname: string | null | undefined,
  index: DocsSlugIndex | null | undefined,
): string | null {
  if (!pathname || !index) return null;

  const clean = pathname.replace(/\/+$/, '') || pathname;
  const parts = clean.split('/').filter(Boolean);
  const root = parts[0];
  if (!root || !DOCS_ROOT_SET.has(root as (typeof DOCS_PATH_ROOTS)[number])) {
    return null;
  }

  const leaf = pathLeaf(clean);
  if (!leaf) return null;

  const canonical = index[leaf] || index[leaf.toLowerCase()];
  if (!canonical || canonical === clean) {
    return null;
  }

  return canonical;
}

