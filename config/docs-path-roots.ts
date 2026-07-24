/**
 * Public path roots that host the docs experience.
 *
 * Nested docs live under `/docs`. The former shadow root
 * (`testing-devresource`) has been retired.
 */
export const DOCS_PATH_ROOTS = ['docs'] as const;

export type DocsPathRoot = (typeof DOCS_PATH_ROOTS)[number];

/** Canonical docs root for links and slug-index canonicalization. */
export const PRIMARY_DOCS_PATH_ROOT: DocsPathRoot = 'docs';

function normalizePathInput(
  path: string | string[] | undefined | null,
): string {
  if (Array.isArray(path)) {
    return path.filter(Boolean).join('/');
  }
  return (path || '').replace(/^\/+|\/+$/g, '');
}

/**
 * Return the docs path root for a route, or null if the path is outside
 * the configured docs roots.
 */
export function getDocsPathRoot(
  path: string | string[] | undefined | null,
): DocsPathRoot | null {
  const normalized = normalizePathInput(path).toLowerCase();
  const first = normalized.split('/').filter(Boolean)[0];
  if (!first) {
    return null;
  }

  return (DOCS_PATH_ROOTS as readonly string[]).includes(first)
    ? (first as DocsPathRoot)
    : null;
}

/**
 * True when the path is under any configured docs root.
 */
export function isDocsExperiencePath(
  path: string | string[] | undefined | null,
): boolean {
  return getDocsPathRoot(path) !== null;
}

/**
 * Build-nav GraphQL URI for a route (`/docs`).
 */
export function getBuildNavUriForPath(
  path: string | string[] | undefined | null,
): string {
  const root = getDocsPathRoot(path) ?? PRIMARY_DOCS_PATH_ROOT;
  return `/${root}`;
}

/**
 * Strip a known docs root prefix, leaving the path after `/docs/`.
 */
export function stripDocsPathRoot(
  path: string | string[] | undefined | null,
): string {
  const normalized = normalizePathInput(path).toLowerCase();
  const root = getDocsPathRoot(normalized);
  if (!root) {
    return normalized;
  }

  const prefix = `${root}/`;
  return normalized.startsWith(prefix)
    ? normalized.slice(prefix.length)
    : normalized === root
      ? ''
      : normalized;
}

/**
 * Regex alternation of docs roots for path rewriting helpers.
 */
export function docsPathRootsAlternation(): string {
  return DOCS_PATH_ROOTS.map((root) =>
    root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('|');
}
